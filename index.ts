import { app, protocol, BrowserWindow, shell, ipcMain, session, dialog } from "electron"
const path = require("path")
const fs = require('fs')
const rename = require('deep-rename-keys')

const E_NOTFOUND = -6;
const supportedLanguages = ["generic", "scale-100", "scale-80", "en", "en-gb", "en-us"]; // slightly different to speed up accessing generic resources
const packageResourcesMap: Map<string, Map<string, any>> = new Map();

protocol.registerSchemesAsPrivileged([{
  scheme: 'ms-appx', privileges: {
    standard: true,
    secure: true,
    bypassCSP: true,
    allowServiceWorkers: true,
    supportFetchAPI: true
  }
}])

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

function lookupInJson(json: any, subsplits: string[], name: string) {
  for (const split of subsplits) {
    if (json === undefined || split == null || split == "")
      continue;

    json = json[split];
  }

  if (json === undefined)
    return null;

  return json[name];
}

function lookupResource(pathName: string, resourceMap: Map<string, any>, properties: URLSearchParams): string {
  let resource = null;
  let splits = pathName.toLowerCase().split("/");
  let subsplits = ["files", ...splits.slice(0, splits.length - 1)];
  let name = splits[splits.length - 1];

  if (properties.has("scale")) {
    let key = "scale-" + properties.get("scale");
    console.log(key);

    if (resourceMap.has(key)) {
      var data = resourceMap.get(key);

      if ((resource = lookupInJson(data, subsplits, name)))
        return resource;
    }
  }

  for (const language of resourceMap) {
    let json = language[1];

    if ((resource = lookupInJson(json, subsplits, name)))
      return resource;
  }
}

function appxUriHandler(request: any, callback: any) {
  let url = new URL(request.url);
  let packageName = url.host;
  let pathName = decodeURI(url.pathname);
  let query = url.searchParams;

  // find the root of the package
  let dirName = path.join(__dirname, "..");
  let packagePath = path.join(dirName, "packages", packageName);

  // ensure the package actually exists
  if (!fs.existsSync(packagePath)) {
    packagePath = path.join(dirName, "shims", packageName);
    if (!fs.existsSync(packagePath)) {
      console.warn(`notfound ms-appx://${packageName} -> package doesn't exist`)
      return callback({ error: E_NOTFOUND });
    }
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
  let resource = lookupResource(pathName, resourceMap, query);

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
app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendSwitch('enable-experimental-web-platform-features')

const filePath = path.join(app.getPath('appData'), "app-launch-flags.txt")
if (fs.existsSync(filePath)) {
  let args = fs.readFileSync(filePath, "utf-8");
  for (const arg of args.split(',')) {
    app.commandLine.appendSwitch(arg);
  }
}

app.whenReady().then(() => {
  protocol.registerFileProtocol("ms-appx", appxUriHandler);
  protocol.registerFileProtocol("ms-appx-web", appxUriHandler);
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURIComponent(request.url.replace('file:///', ''));
    callback(pathname);
  });

  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.discord.com/*", "*://*.discord.gg/*", "*://discord.com/*"] }, (details, callback) => {
    details.requestHeaders['User-Agent'] = 'DiscordBot (https://github.com/WamWooWam/WinRTElectron, 1.0.0)';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  app.on('session-created', (session) => {
    console.log(session)

    session.protocol.registerFileProtocol("ms-appx", appxUriHandler);
    session.protocol.registerFileProtocol("ms-appx-web", appxUriHandler);
    session.protocol.registerFileProtocol('file', (request, callback) => {
      const pathname = decodeURIComponent(request.url.replace('file:///', ''));
      callback(pathname);
    });
    session.webRequest.onBeforeSendHeaders({ urls: ["*://*.discord.com/*", "*://*.discord.gg/*", "*://discord.com/*"] }, (details, callback) => {
      details.requestHeaders['User-Agent'] = 'DiscordBot (https://github.com/WamWooWam/WinRTElectron, 1.0.0)';
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
  })


  let win = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      webviewTag: true,
      webSecurity: false, // fuck you.
      contextIsolation: false,
      enableRemoteModule: true,
    },
    autoHideMenuBar: true,
  });

  ipcMain.on("windows.storage.pickers.fileopenpicker", async (e, arg) => {
    let properties = ["dontAddToRecent"];
    if (arg.data.mode != 'single-file')
      properties.push("multiSelections");

    let filters: Electron.FileFilter[] = [{
      name: 'Selected Files',
      extensions: [...(<string[]>arg.data.fileTypeFilter).map(x => x.length > 1 ? x.substr(1) : x)]
    }];

    let result = await dialog.showOpenDialog(win, {
      buttonLabel: arg.data.commitButtonText,
      properties: <any>properties,
      filters: filters
    })

    e.reply(arg.responseChannel, result.filePaths);
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
