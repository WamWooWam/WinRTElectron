const { app, protocol, BrowserWindow } = require("electron")
const path = require("path");
const fs = require('fs')

protocol.registerSchemesAsPrivileged([{ scheme: 'ms-appx', privileges: { standard: true, secure: true } }])

app.whenReady().then(() => {
  protocol.registerFileProtocol("ms-appx", (request, callback) => {
    let url = new URL(request.url);
    let package = url.host;
    let pathName = url.pathname;
    let filePath = path.normalize(`${__dirname}/../packages/${package}/${pathName}`);

    if (fs.existsSync(filePath)) {
      callback({ path: filePath });
    }
    else {
      // so now we've gotta do some weird ass processing a bit like what the windows runtime does
      // for now we're only gonna handle `.scale-100`
      filePath = filePath.substr(0, filePath.lastIndexOf(".")) + ".scale-100" + path.extname(filePath);
      callback({ path: filePath });
    }
  });

  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: "ms-appx://microsoft.bingnews.shim/dist/shim.js"
    }
  });

  win.loadURL("ms-appx://microsoft.bingnews/default.html")

});