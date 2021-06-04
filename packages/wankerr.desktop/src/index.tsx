import "preact/debug"
import { render } from "preact"
import { Shell } from "./Shell"
import { PackageReader } from "./Data/Package";
import { PackageRegistry } from "./Data/PackageRegistry";
import "./index.css"
import * as fs from "fs";
import * as path from "path"
import { remote } from "electron";

document.addEventListener("DOMContentLoaded", () => {
    let packagesPath = path.join(remote.app.getAppPath(), "packages");
    let packages = fs.readdirSync(packagesPath);

    for (const packagePath of packages) {
        if (fs.existsSync(path.join(packagesPath, packagePath, "AppxManifest.xml"))) {
            let reader = new PackageReader(path.basename(packagePath))
            let pack = reader.readPackage();
            PackageRegistry.registerPackage(pack);
        }
    }

    render(<Shell />, document.body);
})