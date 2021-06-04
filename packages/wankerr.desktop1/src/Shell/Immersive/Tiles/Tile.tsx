import { lightenDarkenColour } from "../../Util"
import { ForegroundText } from "../../PackageApplication";
import { TileSize } from "./TileSize";

import jsx from "jsx-no-react";

import "./tile.css"
import "../splash-screen.css"

export abstract class Tile {
    protected tileContainerElement: HTMLDivElement;
    protected tileContainerPostElement: HTMLDivElement;
    protected tileElement: HTMLDivElement;
    protected tileVisuals: Array<HTMLElement>
    protected showTextSizes: Array<TileSize>
    protected wasClicked: boolean;

    // A fence tile is a tile that appears at the start of a 4x4 block of smaller tiles.
    isFence: boolean;
    tileSize: TileSize;
    tileGroup: HTMLElement;
    tileBack: HTMLDivElement;
    tileFront: HTMLDivElement;

    public get rootElement(): HTMLElement {
        return this.tileContainerElement;
    }

    public get postElement(): HTMLElement {
        return this.tileContainerPostElement;
    }

    constructor(tileContainerElement: HTMLDivElement, tileGroup: HTMLElement) {
        this.tileGroup = tileGroup;
        this.tileContainerElement = tileContainerElement;
        this.tileContainerPostElement = tileContainerElement.nextElementSibling as HTMLDivElement;
        this.tileSize = TileSize[tileContainerElement.dataset.tileSize ?? "square150x150"];
        this.tileVisuals = []
    }

    abstract constructTile();

    onClicked() {
        if (this.wasClicked)
            return;

        this.onClickedCore();
    }

    reset() {
        this.wasClicked = false;
    }

    protected abstract onClickedCore();

    protected constructTileCore(tileColour: string) {
        this.tileContainerElement.classList.add(TileSize[this.tileSize])
        this.tileContainerElement.addEventListener("click", this.onClicked.bind(this));

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
    }

    protected createTileVisual(): HTMLElement {
        return <div className="tile-visual tile-visual-visible" />;
    }

    protected createTileVisualImage(srcUrl: string): HTMLElement {
        let className = "tile-front-image " + TileSize[this.tileSize];

        return (
            <div className="tile-front-image-container">
                <img src={srcUrl} className={className} />
            </div>);
    }

    protected createTileVisualText(text: string, style: ForegroundText): HTMLElement {
        let element = <p className="tile-front-text">{text}</p>

        if (style == "dark") {
            element.style.color = "black";
        }

        return element;
    }
}


