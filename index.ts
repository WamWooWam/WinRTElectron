const { app, protocol, BrowserWindow, shell, ipcMain } = require("electron")
const path = require("path");
const fs = require('fs')
const E_NOTFOUND = -6;

protocol.registerSchemesAsPrivileged([{ scheme: 'ms-appx', privileges: { standard: true, secure: true, bypassCSP: true } }])

function appxUriHandler(request: any, callback: any) {
  let url = new URL(request.url);
  let packageName = url.host;
  let pathName = url.pathname;
  let filePath = path.normalize(`${__dirname}/../packages/${packageName}/${pathName}`);
  console.log(filePath);

  if (fs.existsSync(filePath)) {
    return callback({ path: filePath, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // so now we've gotta do some weird ass processing a bit like what the windows runtime does
  // for now we're only gonna handle `.scale-100` and `/en`
  let newfilePath = filePath.substr(0, filePath.lastIndexOf(".")) + ".scale-100" + path.extname(filePath);
  if (fs.existsSync(newfilePath)) {
    return callback({ path: newfilePath });
  }

  newfilePath = path.dirname(filePath) + "/en/" + path.basename(filePath);
  if (fs.existsSync(newfilePath)) {
    return callback({ path: newfilePath });
  }

  // if the file doesnt exist, at least return or it'll get very sad.
  return callback({ error: E_NOTFOUND });
}

app.whenReady().then(() => {
  protocol.registerFileProtocol("ms-appx", appxUriHandler);
  protocol.registerFileProtocol("ms-appx-web", appxUriHandler);

  ipcMain.on("path-requested", (event: Electron.IpcMainEvent, packageName: string) => {    
    let callback = (data: any) => {
      event.reply("path-responce", data.path);
    }

    appxUriHandler({ url: "ms-appx://" + packageName + "/" }, callback);
  });

  let win = new BrowserWindow({
    width: 1366,
    height: 788,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    },
    autoHideMenuBar: true,
  });

  win.webContents.on("will-navigate", (event: Electron.Event, url: string) => {
    var uri = new URL(url);
    if (uri.protocol !== "ms-appx") {
      event.preventDefault();
      shell.openExternal(uri.toString())
    }
  });

  win.loadURL("ms-appx://wankerr.desktop/index.html")
});
