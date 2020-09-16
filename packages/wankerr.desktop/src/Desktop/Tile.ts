
import { circularEase, cubicEase, lightenDarkenColour, createSplashElement } from "./Util"
import { Start } from "./Start";
import { Application } from "./Application";
import { CoreWindow } from "./CoreWindow";
import { Package } from "./Package";

import "./tile.css"
import "./splash-screen.css"
import { PackageRegistry } from "./PackageRegistry";

export enum TileSize {
    square70x70,
    square150x150,
    wide310x150,
    square310x310
}

export class Tile {

    private app: Application;
    private pack: Package;

    private animationState: any;
    private animationComplete: boolean;
    private wasClicked: boolean;

    private tileStyle: string;
    private tileSizeString: string;
    private tileContainerElement: HTMLDivElement;
    private tileContainerPostElement: HTMLDivElement;
    private tileElement: HTMLDivElement;
    private tileVisuals: Array<HTMLElement>
    private showTextSizes: Array<TileSize>

    tileGroup: HTMLElement;
    tileSize: TileSize;
    tileBack: HTMLDivElement;
    tileFront: HTMLDivElement;
    splash: HTMLDivElement;
    
    // A fence tile is a tile that appears at the start of a 4x4 block of smaller tiles.
    isFence: boolean;

    constructor(tileContainerElement: HTMLDivElement) {
        this.tileGroup = tileContainerElement.closest(".start-tile-group");
        this.tileContainerElement = tileContainerElement;
        this.tileStyle = tileContainerElement.style.cssText;
        this.tileContainerPostElement = <HTMLDivElement>tileContainerElement.nextElementSibling;
        this.tileSizeString = tileContainerElement.dataset.tileSize ?? "square150x150";
        this.tileSize = TileSize[this.tileSizeString];
        this.tileVisuals = []

        let packName = tileContainerElement.dataset.packageName;
        let appName = tileContainerElement.dataset.id;

        this.pack = PackageRegistry.getPackage(packName);
        this.app = this.pack.applications.get(appName);

        this.showTextSizes = this.app.visualElements.defaultTile.showNameOnTiles.map(v => TileSize[v]);
        this.constructTile();
        this.animationState = {};
    }

    public get rootElement(): HTMLElement {
        return this.tileContainerElement;
    }

    public get postElement(): HTMLElement {
        return this.tileContainerPostElement;
    }

    private constructTile() {
        this.tileContainerElement.classList.add(this.tileSizeString)

        let tileColour = this.app.visualElements.backgroundColor;
        let tileTopColour = lightenDarkenColour(tileColour, 30);
        let borderColour = lightenDarkenColour(tileColour, 40);

        this.tileElement = document.createElement("div");
        this.tileElement.classList.add("tile");
        this.tileContainerElement.appendChild(this.tileElement);

        this.tileBack = document.createElement("div");
        this.tileBack.classList.add("back");
        this.tileElement.appendChild(this.tileBack);

        this.tileFront = document.createElement("div");
        this.tileFront.classList.add("front");
        this.tileElement.appendChild(this.tileFront);

        this.tileFront.style.cssText = `background: linear-gradient(to top right, ${tileColour}, ${tileTopColour}); border: 1px solid ${borderColour};`;
        this.tileBack.style.cssText = `background: ${tileColour};`

        this.constructFront();
        this.updateLiveTile();

        this.tileContainerElement.addEventListener("click", this.onTileClicked.bind(this));
    }

    private constructFront() {
        let tileDefaultVisual = document.createElement("div");
        tileDefaultVisual.classList.add("tile-visual", "tile-visual-visible");

        let tileVisualImageContainer = document.createElement("div");
        tileVisualImageContainer.classList.add("tile-front-image-container");

        let tileImageUrl = this.app.visualElements.square150x150Logo;

        if (this.tileSize === TileSize.wide310x150 && this.app.visualElements.defaultTile.wide310x150Logo) {
            tileImageUrl = this.app.visualElements.defaultTile.wide310x150Logo;
        }

        if (this.tileSize === TileSize.square70x70 && this.app.visualElements.defaultTile.square70x70Logo) {
            tileImageUrl = this.app.visualElements.defaultTile.square70x70Logo;
        }

        if (this.tileSize === TileSize.square310x310 && this.app.visualElements.defaultTile.square310x310Logo) {
            tileImageUrl = this.app.visualElements.defaultTile.square310x310Logo;
        }

        let tileVisualImage = document.createElement("img");
        tileVisualImage.src = tileImageUrl;
        tileVisualImage.classList.add("tile-front-image");
        tileVisualImage.classList.add(this.tileSizeString);
        tileVisualImageContainer.appendChild(tileVisualImage);
        tileDefaultVisual.appendChild(tileVisualImageContainer);

        if (this.tileSize != TileSize.square70x70 && this.showTextSizes.includes(this.tileSize)) {
            let tileVisualText = document.createElement("p");
            tileVisualText.innerText = this.app.visualElements.displayName;
            tileVisualText.classList.add("tile-front-text");

            if (this.app.visualElements.foregroundText == "dark") {
                tileVisualText.style.color = "black";
            }

            tileDefaultVisual.appendChild(tileVisualText);
        }

        this.tileFront.appendChild(tileDefaultVisual);
        this.tileVisuals.push(tileDefaultVisual);
    }

    private constructBack() {
        this.splash = createSplashElement(this.app);
        this.tileBack.appendChild(this.splash);
    }

    private constructCoreWindow() {
        window.location.hash = this.pack.identity.name + "/" + this.app.id;
    }

    private updateLiveTile() {
        let url = this.app.visualElements.defaultTile.tileUpdateUrl;
        if (url) {
            url = url.replace(/{(\w+)}/g, (m, s) => {
                s = s.toLowerCase();
                switch (s) {
                    case "language":
                        return "en-gb";
                }

                return s;
            })

            fetch(url)
                .then((resp) => resp.text())
                .then((text) => console.log(text));
        }
    }

    reset() {
        this.animationState = {};
        this.animationComplete = false;
        this.wasClicked = false;
        this.tileContainerElement.style.cssText = this.tileStyle;
        this.tileContainerElement.classList.remove("moving");
        this.tileContainerElement.classList.remove("flipped");
    }

    private onFlipComplete() {
        this.constructCoreWindow();
        this.reset();

        let start = Start.getInstance();
        start.restoreTile(this);
    }

    private onTileClicked() {
        if (this.wasClicked)
            return;

        var start = Start.getInstance();
        this.wasClicked = true;
        this.constructBack();

        var bodyRect = document.body.getBoundingClientRect();
        var elemRect = this.tileContainerElement.getBoundingClientRect();

        this.animationState.initialX = elemRect.left - bodyRect.left;
        this.animationState.initialY = elemRect.top - bodyRect.top;
        this.animationState.initialWidth = elemRect.width;
        this.animationState.initialHeight = elemRect.height;

        this.tileContainerElement.classList.add("moving");
        this.tileContainerElement.style.cssText = `position: absolute; top: ${this.animationState.y}px; left: ${this.animationState.x}px;`

        start.hide();
        start.removeTile(this);

        document.body.appendChild(this.tileContainerElement);

        requestAnimationFrame(this.flip.bind(this));
    }

    private flip(time: number) {
        if (this.animationState.start == null) {
            this.animationState.start = time;
            requestAnimationFrame(this.flip.bind(this));
            return;
        }

        var bodyRect = document.body.getBoundingClientRect();

        let bounds = this.tileContainerElement.getBoundingClientRect();
        let progress = (time - this.animationState.start) / 1000.0;
        let angle = circularEase(progress, 0, 180, 1);
        let width = cubicEase(progress, this.animationState.initialWidth, bodyRect.width - this.animationState.initialWidth, 1);
        let height = cubicEase(progress, this.animationState.initialHeight, bodyRect.height - this.animationState.initialHeight, 1);

        let targetX = ((bodyRect.width - width) / 2) - this.animationState.initialX;
        let targetY = ((bodyRect.height - height) / 2) - this.animationState.initialY;

        let x = cubicEase(progress, this.animationState.initialX, targetX, 1);
        let y = cubicEase(progress, this.animationState.initialY, targetY, 1);

        this.tileContainerElement.style.cssText = `position: absolute; top: ${y}px; left: ${x}px; width: ${width}px; height: ${height}px; transform: rotate3D(0,1,0,${angle}deg);`

        if (angle >= 90 && !this.animationState.flipped) {
            this.animationState.flipped = true;
            this.tileContainerElement.classList.add("flipped");
        }

        if (progress < 1) {
            this.animationState.previousProgress = progress;
            requestAnimationFrame(this.flip.bind(this));
        } else {
            this.animationState = {}
            this.animationComplete = true;
            setTimeout(this.onFlipComplete.bind(this), 500);
        }
    }
}