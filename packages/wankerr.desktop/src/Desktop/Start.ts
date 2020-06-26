import { Tile } from "./Tile";
import { CoreWindow } from "./CoreWindow";
import { CharmsBar } from "./CharmsBar";

import "./start.css"

export class Start {
    private static _start: Start;

    private startElement: HTMLElement;
    private allAppsElement: HTMLElement;

    private tilesElement: HTMLElement;

    private showAllElement: HTMLElement;
    private hideAllElement: HTMLElement;

    private tiles: Array<Tile>;

    constructor() {
        document.body.style.backgroundColor = "#180053";

        this.startElement = <HTMLElement>document.querySelector(".start");
        this.allAppsElement = <HTMLElement>document.querySelector(".all-apps");
        this.tilesElement = <HTMLElement>document.querySelector(".start-tiles");
        this.showAllElement = <HTMLElement>document.querySelector(".start-show-all-button");
        this.hideAllElement = <HTMLElement>document.querySelector(".start-hide-all-button");
        this.tiles = [];

        if (this.showAllElement && this.hideAllElement) {
            this.showAllElement.addEventListener("click", this.showAllApps.bind(this));
            this.hideAllElement.addEventListener("click", this.hideAllApps.bind(this));
        }

        let tileElements = this.tilesElement.querySelectorAll(".tile-container");
        for (let i = 0; i < tileElements.length; i++) {
            let tile = <HTMLDivElement>tileElements.item(i);
            this.tiles.push(new Tile(tile));
        }

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
                
    }

    removeTile(tile: Tile) {
        var tileContainer = tile.tileGroup != null ? tile.tileGroup.querySelector(".tile-group-tiles") : this.tilesElement;
        tileContainer.removeChild(tile.rootElement);
    }

    restoreTile(tile: Tile) {
        var tileContainer = tile.tileGroup != null ? tile.tileGroup.querySelector(".tile-group-tiles") : this.tilesElement;
        tileContainer.insertBefore(tile.rootElement, tile.postElement);
    }

    hide() {
        this.startElement.classList.add("invisible");
    }
}

window["Start"] = Start;