import { circularEase, cubicEase, createSplashElement } from "../../Util";
import { Start } from "../Start";
import { PackageApplication, ApplicationDefaultTile } from "../../PackageApplication";
import { Package } from "../../Package";
import { PackageRegistry } from "../../PackageRegistry";
import { Tile } from "./Tile";
import { TileSize } from "./TileSize";
import { Shell } from "../../Shell";
import jsx from "jsx-no-react";
import { TileTemplateBindings } from "./TileTemplateBindings";

export class AppTile extends Tile {
    private app: PackageApplication;
    private pack: Package;

    private animationState: any;
    private tileStyle: string;
    private files: string[];

    splash: HTMLDivElement;

    constructor(tileContainerElement: HTMLDivElement, tileGroup: HTMLElement, packName: string, appName: string) {
        super(tileContainerElement, tileGroup);

        this.pack = PackageRegistry.getPackage(packName);
        this.app = this.pack.applications.get(appName);
        this.tileStyle = tileContainerElement.style.cssText;
        this.showTextSizes = this.app.visualElements.defaultTile.showNameOnTiles.map(v => TileSize[v]);
        this.tileContainerElement.addEventListener("dragenter", this.onDragOver.bind(this), false);
        this.tileContainerElement.addEventListener("dragover", this.onDragOver.bind(this), false);
        this.tileContainerElement.addEventListener("drop", this.onDrop.bind(this), false);
        this.animationState = {};
        this.files = [];
    }

    constructTile() {
        super.constructTileCore(this.app.visualElements.backgroundColor);
        this.constructFront();
        this.updateLiveTile();
    }

    onClickedCore() {
        var start = Shell.getInstance().start

        this.wasClicked = true;
        this.constructBack();

        var bodyRect = document.body.getBoundingClientRect();
        var elemRect = this.tileContainerElement.getBoundingClientRect();

        this.animationState.initialX = elemRect.left - bodyRect.left;
        this.animationState.initialY = elemRect.top - bodyRect.top;
        this.animationState.initialWidth = elemRect.width;
        this.animationState.initialHeight = elemRect.height;

        this.tileContainerElement.classList.add("moving");
        this.tileContainerElement.style.cssText = `position: absolute; top: ${this.animationState.y}px; left: ${this.animationState.x}px;`;

        start.hide();
        start.removeTile(this);

        document.body.appendChild(this.tileContainerElement);
        requestAnimationFrame(this.flip.bind(this));
    }

    reset() {
        super.reset();

        this.files = [];
        this.animationState = {};
        this.tileContainerElement.style.cssText = this.tileStyle;
        this.tileContainerElement.classList.remove("moving");
        this.tileContainerElement.classList.remove("flipped");
    }

    private onDragOver(e: DragEvent){
        e.preventDefault();
        e.dataTransfer.dropEffect = 'link';
    }

    private onDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();

        let data = e.dataTransfer;
        if (data.files && data.files.length) {
            for (const file of data.files) {
                this.files.push(file.path);
            }

            this.onClicked();
        }
    }

    private constructFront() {
        let tileImageUrl = this.getTileImageUrl(this.app.visualElements.defaultTile) + "?scale=80"
        let tileDefaultVisual = this.createTileVisual();
        let tileVisualImageContainer = this.createTileVisualImage(tileImageUrl);
        tileDefaultVisual.appendChild(tileVisualImageContainer);

        if (this.tileSize != TileSize.square70x70 && this.showTextSizes.includes(this.tileSize)) {
            let tileVisualText = this.createTileVisualText(this.app.visualElements.displayName, this.app.visualElements.foregroundText);
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
        // window.location.hash = this.pack.identity.name + "/" + this.app.id;

        Shell.getInstance().launchImmersiveApp(this.pack, this.app, { files: this.files });
    }

    private getTileImageUrl(tile: ApplicationDefaultTile) {
        switch (this.tileSize) {
            case TileSize.square70x70:
                return tile.square70x70Logo;
            case TileSize.square150x150:
                return this.app.visualElements.square150x150Logo;
            case TileSize.wide310x150:
                return tile.wide310x150Logo;
            case TileSize.square310x310:
                return tile.square310x310Logo;
        }
    }

    private updateLiveTileFromXml(xml: string) {
        let style = ("Tile" + TileSize[this.tileSize]).toLowerCase();
        let manifestDocument = new DOMParser().parseFromString(xml, 'application/xml');
        let visual = manifestDocument.querySelector("visual");
        if (visual == null)
            return;

        let bindings = visual.querySelectorAll("binding");
        for (const binding of bindings) {
            if (binding.getAttribute("template").toLowerCase().startsWith(style)) {
                let elements = TileTemplateBindings.getTemplateElements(binding);
                for (const element of elements) {
                    this.tileFront.appendChild(element);
                    this.tileVisuals.push(element);
                }
            }
        }
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
            });

            console.log("fetching tile update from " + url);

            fetch(url)
                .then((resp) => resp.text())
                .then((text) => {
                    this.updateLiveTileFromXml(text);
                });
        }
    }

    private onFlipComplete() {
        this.constructCoreWindow();
        this.reset();

        let start = Shell.getInstance().start;
        start.restoreTile(this);
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

        let x = cubicEase(Math.min(1, progress * 1.1), this.animationState.initialX, targetX, 1);
        let y = cubicEase(Math.min(1, progress * 1.1), this.animationState.initialY, targetY, 1);

        this.tileContainerElement.style.cssText = `position: absolute; top: ${y}px; left: ${x}px; width: ${width}px; height: ${height}px; transform: rotate3D(0,1,0,${angle}deg); transform-style: preserve-3d;`;

        if (angle >= 90 && !this.animationState.flipped) {
            this.animationState.flipped = true;
            this.tileContainerElement.classList.add("flipped");
        }

        if (progress < 1) {
            this.animationState.previousProgress = progress;
            requestAnimationFrame(this.flip.bind(this));
        } else {
            this.animationState = {};
            setTimeout(this.onFlipComplete.bind(this), 500);
        }
    }
}
