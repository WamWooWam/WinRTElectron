import { Start } from "./Desktop/Start";
import { goToAppFromUrl } from "./Desktop/Util"
import { Desktop } from "./Desktop/Desktop";
import { PackageReader } from "./Desktop/Package"
import { PackageRegistry } from "./Desktop/PackageRegistry";

import "./fonts.css"
import "./index.css"

window.addEventListener("load", () => {
    let tilesElement = <HTMLElement>document.querySelector(".start-tiles");
    let tiles = tilesElement.querySelectorAll(".tile-container");
    let packages = new Set<string>();
    for (const element of tiles) {
        packages.add((<HTMLElement>element).dataset.packageName);
    }

    let promises = [];
    for (const packageName of packages) {
        promises.push(PackageReader.readPackage(packageName)
            .then(p => PackageRegistry.registerPackage(p)));
    }

    Promise.all(promises).then(() => {
        Desktop.init();
        window.addEventListener("hashchange", (ev: HashChangeEvent) => {
            goToAppFromUrl();
        })

        goToAppFromUrl();
    });
})