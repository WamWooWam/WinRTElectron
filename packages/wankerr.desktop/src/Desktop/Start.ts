import { Tile } from "./Tile";
import { CoreWindow } from "./CoreWindow";
import { CharmsBar } from "./CharmsBar";

import "./start.css"
import { Package, PackageIdentity, PackageProperties } from "./Package";
import { Application, ApplicationVisualElements, ApplicationSplashScreen } from "./Application";
import { uuidv4 } from "winrt-node/util";
import { PackageRegistry } from "./PackageRegistry";
import { TileGroup } from "./TileGroup";

export class Start {
    private static _start: Start;

    private startElement: HTMLElement;
    private allAppsElement: HTMLElement;

    private tilesElement: HTMLElement;

    private showAllElement: HTMLElement;
    private hideAllElement: HTMLElement;

    private tileGroups: TileGroup[];
    private _testPackage: Package;

    constructor() {
        document.body.style.backgroundColor = "#180053";

        this.startElement = <HTMLElement>document.querySelector(".start");
        this.allAppsElement = <HTMLElement>document.querySelector(".all-apps");
        this.tilesElement = <HTMLElement>document.querySelector(".start-tiles");
        this.showAllElement = <HTMLElement>document.querySelector(".start-show-all-button");
        this.hideAllElement = <HTMLElement>document.querySelector(".start-hide-all-button");
        this.tileGroups = [];

        if (this.showAllElement && this.hideAllElement) {
            this.showAllElement.addEventListener("click", this.showAllApps.bind(this));
            this.hideAllElement.addEventListener("click", this.hideAllApps.bind(this));
        }

        let tileGroupElements = this.tilesElement.querySelectorAll(".start-tile-group");
        for (let i = 0; i < tileGroupElements.length; i++) {
            let tileGroupElement = <HTMLDivElement>tileGroupElements.item(i);
            let tileGroup = new TileGroup(tileGroupElement);
            this.tileGroups.push(tileGroup);
        }

        window.addEventListener("resize", this.layout.bind(this));
        this.layout();

        let charms = CharmsBar.getInstance();
    }

    static getInstance(): Start {
        return Start._start ?? (Start._start = new Start());
    }

    showAllApps() {
        this.startElement.style.transform = "translateY(-100vh)";
        this.allAppsElement.style.transform = "translateY(-100vh)";
        document.body.style.backgroundColor = "#F0F0F0"
        document.body.style.color = "black";
    }

    hideAllApps() {
        this.startElement.style.transform = "";
        this.allAppsElement.style.transform = "";
        document.body.style.backgroundColor = "#180053";
        document.body.style.color = "white";
    }

    show() {
        for (const window of CoreWindow.windows) {
            window.hide();
        }

        this.startElement.classList.remove("invisible");
    }

    launchAppFromUri(url: string) {
        if (!this._testPackage) {
            let pack = new Package(null);
            pack.identity = new PackageIdentity();
            pack.properties = new PackageProperties();

            pack.identity.name = "TestPackage";
            pack.identity.publisher = "Test Publisher";
            pack.identity.version = "1.0.0.0";

            pack.properties.displayName = "Test Package";
            pack.properties.publisherDisplayName = "Test Publisher";
            pack.properties.logo = "/static/app/storelogo.png"
            pack.path = null;

            PackageRegistry.registerPackage(pack);

            this._testPackage = pack;
        }

        let app = new Application();
        app.id = "TestAppID-" + uuidv4();
        app.startPage = url;
        app.visualElements = new ApplicationVisualElements();
        app.visualElements.displayName = "TestApp";
        app.visualElements.description = "This is an app";
        app.visualElements.foregroundText = "light";
        app.visualElements.backgroundColor = "#464646";
        app.visualElements.square150x150Logo = "/static/app/logo.png";
        app.visualElements.square30x30Logo = "/static/app/smalllogo.png";

        app.visualElements.splashScreen = new ApplicationSplashScreen();
        app.visualElements.splashScreen.image = "/static/app/splashscreen.png";

        this._testPackage.applications.set(app.id, app);

        let window = CoreWindow.createMainWindow(this._testPackage, app);
        window.activate();
    }

    removeTile(tile: Tile) {
        var tileContainer = tile.tileGroup != null ? tile.tileGroup.querySelector(".tile-group-tiles") : this.tilesElement;
        tileContainer.removeChild(tile.rootElement);
    }

    restoreTile(tile: Tile) {
        var tileContainer = tile.tileGroup != null ? tile.tileGroup.querySelector(".tile-group-tiles") : this.tilesElement;
        tileContainer.insertBefore(tile.rootElement, tile.postElement);
    }

    layout() {
        for (let i = 0; i < this.tileGroups.length; i++) {
            const tileGroup = this.tileGroups[i];
            tileGroup.layout();
        }
    }

    hide() {
        this.startElement.classList.add("invisible");
    }
}

window["Start"] = Start;