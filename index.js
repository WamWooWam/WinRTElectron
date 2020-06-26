var _a = require("electron"), app = _a.app, protocol = _a.protocol, BrowserWindow = _a.BrowserWindow, shell = _a.shell, ipcMain = _a.ipcMain;
var path = require("path");
var fs = require('fs');
var E_NOTFOUND = -6;
protocol.registerSchemesAsPrivileged([{ scheme: 'ms-appx', privileges: { standard: true, secure: true, bypassCSP: true } }]);
function appxUriHandler(request, callback) {
    var url = new URL(request.url);
    var packageName = url.host;
    var pathName = url.pathname;
    var filePath = path.normalize(__dirname + "/../packages/" + packageName + "/" + pathName);
    console.log(filePath);
    if (fs.existsSync(filePath)) {
        return callback({ path: filePath, headers: { "Access-Control-Allow-Origin": "*" } });
    }
    // so now we've gotta do some weird ass processing a bit like what the windows runtime does
    // for now we're only gonna handle `.scale-100` and `/en`
    var newfilePath = filePath.substr(0, filePath.lastIndexOf(".")) + ".scale-100" + path.extname(filePath);
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
app.whenReady().then(function () {
    protocol.registerFileProtocol("ms-appx", appxUriHandler);
    protocol.registerFileProtocol("ms-appx-web", appxUriHandler);
    ipcMain.on("path-requested", function (event, packageName) {
        var callback = function (data) {
            ipcMain.emit("package-name", data.path);
        };
        appxUriHandler({ url: "ms-appx://" + packageName + "/" }, callback);
    });
    var win = new BrowserWindow({
        width: 1366,
        height: 788,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        },
        autoHideMenuBar: true
    });
    win.webContents.on("will-navigate", function (event, url) {
        var uri = new URL(url);
        if (uri.protocol !== "ms-appx") {
            event.preventDefault();
            shell.openExternal(uri.toString());
        }
    });
    win.loadURL("ms-appx://wankerr.desktop/index.html");
});
