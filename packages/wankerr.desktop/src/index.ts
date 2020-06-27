import { Start } from "./Desktop/Start";
import { goToAppFromUrl } from "./Desktop/Util"
import { Desktop } from "./Desktop/Desktop";
import { PackageReader } from "./Desktop/Package"
import { PackageRegistry } from "./Desktop/PackageRegistry";
import * as fs from "fs";
import * as path from "path"
import "./fonts.css"
import "./index.css"

const { remote } = require("electron");

window.addEventListener("load", async () => {    
    let promises = [];
    let packagesPath = path.join(remote.app.getAppPath(), "packages");
    let packages = fs.readdirSync(packagesPath);

    for (const packagePath of packages) {
        if(fs.existsSync(path.join(packagesPath, packagePath, "AppxManifest.xml"))){
            let pack = await PackageReader.readPackage(path.basename(packagePath));
            PackageRegistry.registerPackage(pack)
        }
    }

    Desktop.init();
    window.addEventListener("hashchange", (ev: HashChangeEvent) => {
        goToAppFromUrl();
    })

    goToAppFromUrl();
})