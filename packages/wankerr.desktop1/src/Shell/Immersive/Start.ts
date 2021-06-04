import { Tile } from "./Tiles/Tile";
import { TileGroup } from "./Tiles/TileGroup";
import { CoreWindow } from "./CoreWindow";
import { CharmsBar } from "./CharmsBar";
import { Package, PackageIdentity, PackageProperties } from "../Package";
import { PackageApplication, ApplicationVisualElements, ApplicationSplashScreen } from "../PackageApplication";
import { PackageRegistry } from "../PackageRegistry";
import { Shell } from "../Shell";
import { uuidv4 } from "winrt/Windows/Foundation/Interop/Utils"

import "./start.css"

export class Start {
    private startElement: HTMLElement;
    private allAppsElement: HTMLElement;
    private tilesElement: HTMLElement;
    private showAllElement: HTMLElement;
    private hideAllElement: HTMLElement;
    private scrollContainerElement: HTMLElement;
    private tileGroups: TileGroup[];
    private _testPackage: Package;
    private ready: boolean = false;
    private visible: boolean = true;
    private hideTimeout: number;

    constructor(desktop: Shell) {
        this.startElement = <HTMLElement>document.querySelector(".start");
        this.allAppsElement = <HTMLElement>document.querySelector(".all-apps");
        this.tilesElement = <HTMLElement>document.querySelector(".start-tiles");
        this.showAllElement = <HTMLElement>document.querySelector(".start-show-all-button");
        this.hideAllElement = <HTMLElement>document.querySelector(".start-hide-all-button");
        this.scrollContainerElement = <HTMLElement>document.querySelector(".start-tiles-scroll-container");
        this.tileGroups = [];

        // this.startElement.style.backgroundColor = "#180053";

        if (this.showAllElement && this.hideAllElement) {
            this.showAllElement.addEventListener("click", this.showAllApps.bind(this));
            this.hideAllElement.addEventListener("click", this.hideAllApps.bind(this));
        }

        this.scrollContainerElement.addEventListener("mousemove", this.onMouseMoved.bind(this));
        this.scrollContainerElement.addEventListener("wheel", this.onScroll.bind(this));
        this.onMouseMoved();
    }

    init() {
        let tileGroupElements = this.tilesElement.querySelectorAll(".start-tile-group");
        for (let i = 0; i < tileGroupElements.length; i++) {
            let tileGroupElement = <HTMLDivElement>tileGroupElements.item(i);
            let tileGroup = new TileGroup(tileGroupElement);
            this.tileGroups.push(tileGroup);
        }

        window.addEventListener("resize", this.layout.bind(this));
        this.layout();
        this.ready = true;
        this.visible = false;
    }

    showAllApps() {
        // this.startElement.style.transform = "translateY(-100vh)";
        // this.allAppsElement.style.transform = "translateY(-100vh)";
        // this.startElement.style.backgroundColor = "#F0F0F0"
        // this.startElement.style.color = "black";
    }

    hideAllApps() {
        // this.startElement.style.transform = "";
        // this.allAppsElement.style.transform = "";
        // this.startElement.style.backgroundColor = "#180053";
        // this.startElement.style.color = "white";
    }

    onMouseMoved() {
        // todo: hide all apps button too
        this.scrollContainerElement.classList.add("scroll-visible")
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }

        this.hideTimeout = <number><any>setTimeout(() => {
            this.scrollContainerElement.classList.remove("scroll-visible")
        }, 2000);
    }

    onScroll(ev: WheelEvent) {
        ev.preventDefault();
        this.scrollContainerElement.scrollLeft += ev.deltaY;
    }

    hide() {
        if (!this.visible)
            return;

        let onAnimationEnd = () => {
            this.startElement.removeEventListener("animationend", onAnimationEnd);
            this.startElement.classList.remove("hiding");
            this.startElement.classList.add("hidden");
            this.visible = false;
        }

        this.startElement.addEventListener("animationend", onAnimationEnd);
        this.startElement.classList.add("hiding");
    }

    show() {
        if (!this.ready)
            this.init();

        if (this.visible)
            return;

        for (const window of CoreWindow.windows) {
            window.hide();
        }

        let desktop = Shell.getInstance();
        desktop.hide();
        desktop.taskbar.hide();

        this.visible = true;
        this.startElement.classList.remove("hidden");
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

        let app = new PackageApplication();
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
        window.activate({});
    }

    removeTile(tile: Tile) {
        var tileContainer = tile.tileGroup != null ? tile.tileGroup.querySelector(".tile-group-tiles") : this.tilesElement;
        tileContainer.removeChild(tile.rootElement);
        // this.layout();
    }

    restoreTile(tile: Tile) {
        var tileContainer = tile.tileGroup != null ? tile.tileGroup.querySelector(".tile-group-tiles") : this.tilesElement;
        tileContainer.insertBefore(tile.rootElement, tile.postElement);
        this.layout();
    }

    layout() {
        for (let i = 0; i < this.tileGroups.length; i++) {
            const tileGroup = this.tileGroups[i];
            tileGroup.layout();
        }
    }
}

window["Start"] = Start;
