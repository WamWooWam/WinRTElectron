import { app, protocol, BrowserWindow, shell, ipcMain } from "electron"
const path = require("path")
const fs = require('fs')
const rename = require('deep-rename-keys')

const E_NOTFOUND = -6;
const supportedLanguages = ["generic", "en", "en-gb", "en-us"]; // slightly different to speed up accessing generic resources
const packageResourcesMap: Map<string, Map<string, any>> = new Map();

protocol.registerSchemesAsPrivileged([{ scheme: 'ms-appx', privileges: { standard: true, secure: true, bypassCSP: true } }])

function loadResourcesForPackage(resourcesPath: any, packageName: string) {
  if (packageResourcesMap.has(packageName)) {
    // cache to avoid reading stupid amounts of JSON files for every request
    return packageResourcesMap.get(packageName);
  }

  let languages = new Map();
  for (const language of supportedLanguages) {
    try {
      let filePath = path.join(resourcesPath, language + ".json");
      if (!fs.existsSync(filePath))
        continue;

      const resourcesJson = fs.readFileSync(filePath, "utf-8");
      // rename keys to lowercase, as resources lookup is always lower case
      const parsedResource = rename(JSON.parse(resourcesJson), (k: string) => k.toLowerCase());
      languages.set(language, parsedResource);
    }
    catch (error) {
      console.warn(`ms-appx: error while reading ${language} for ${packageName}. ${error}`);
    }
  }

  packageResourcesMap.set(packageName, languages);
  return languages;
}

function lookupResource(pathName: string, resourceMap: Map<string, any>): string {
  let resource = null;
  let splits = pathName.toLowerCase().split("/");
  let subsplits = ["files", ...splits.slice(0, splits.length - 1)];
  let name = splits[splits.length - 1];

  for (const language of resourceMap) {
    let json = language[1];
    for (const split of subsplits) {
      if (json === undefined || split == null || split == "")
        continue;

      json = json[split];
    }

    if (json === undefined)
      continue;

    resource = json[name];
    break;
  }

  return resource;
}

function appxUriHandler(request: any, callback: any) {
  let url = new URL(request.url);
  let packageName = url.host;
  let pathName = url.pathname;

  // find the root of the package
  let dirName = path.join(__dirname, "..");
  let packagePath = path.join(dirName, "packages", packageName);

  // ensure the package actually exists
  if (!fs.existsSync(packagePath)) {
    console.warn(`notfound ms-appx://${packageName} -> package doesn't exist`)
    return callback({ error: E_NOTFOUND });
  }

  let filePath = path.normalize(path.join(packagePath, pathName));
  if (fs.existsSync(filePath)) {
    // if the file just exists, return that and skip the lookup process for the sake of speed (fastpath)
    // 97% of the time this is what happens
    console.debug(`fastpath ms-appx://${packageName}${pathName} -> .${filePath.substr(dirName.length)}`)
    return callback({ path: filePath });
  }

  // if not, lookup the resources for the package in question
  // check the resources path actually exists
  let resourcesPath = path.join(packagePath, "resources");
  if (!fs.existsSync(resourcesPath)) {
    // if not, fail fast
    console.warn(`notfound ms-appx://${packageName}${pathName} -> resources unavailable`)
    return callback({ error: E_NOTFOUND });
  }

  // load the resource map, and lookup the resource (case insensitive)
  let resourceMap = loadResourcesForPackage(resourcesPath, packageName);
  let resource = lookupResource(pathName, resourceMap);

  if (resource) { // if we find it, return it 
    filePath = path.join(packagePath, resource.replace(/\\/g, "/"));
    if (!fs.existsSync(filePath)) {
      console.warn(`notfound ms-appx://${packageName}${pathName} -> resource file not found`)
    }
    else {
      console.debug(`resource ms-appx://${packageName}${pathName} -> .${filePath.substr(dirName.length)}`)
      return callback({ path: filePath });
    }
  }

  // otherwise fail
  console.warn(`notfound ms-appx://${packageName}${pathName} -> resource not found`)
  return callback({ error: E_NOTFOUND });
}

app.allowRendererProcessReuse = true;
app.whenReady().then(() => {
  protocol.registerFileProtocol("ms-appx", appxUriHandler);
  protocol.registerFileProtocol("ms-appx-web", appxUriHandler);

  let win = new BrowserWindow({
    width: 1366,
    height: 788,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      webSecurity: false, // fuck you.
      enableRemoteModule: true,
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
