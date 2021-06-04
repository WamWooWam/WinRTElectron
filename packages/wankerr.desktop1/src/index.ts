import "preact/debug";
import { Start } from "./Shell/Immersive/Start";
import { Shell } from "./Shell/Shell";
import { PackageReader } from "./Shell/Package"
import { PackageRegistry } from "./Shell/PackageRegistry";
import * as fs from "fs";
import * as path from "path"
import "./fonts.css"
import "./index.css"

const { remote } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    let packagesPath = path.join(remote.app.getAppPath(), "packages");
    let packages = fs.readdirSync(packagesPath);

    for (const packagePath of packages) {
        if (fs.existsSync(path.join(packagesPath, packagePath, "AppxManifest.xml"))) {
            let reader = new PackageReader(path.basename(packagePath))
            let pack = reader.readPackage();
            PackageRegistry.registerPackage(pack);
        }
    }

    let shell = Shell.getInstance();
    shell.render();
    
    // let desktop = Shell.getInstance();    
    // window.addEventListener("hashchange", (ev: HashChangeEvent) => {
    //     desktop.goToAppFromUrl();
    // })

    let args = require('electron').remote.process.argv;
    console.log(args);
    if (args.length == 3) {
        shell.goToAppFromUrl(args[2]);
    } else {
        shell.start.show();
    }
})
