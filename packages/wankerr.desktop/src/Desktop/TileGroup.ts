import { Tile, TileSize } from "./Tile";


export class TileGroup {

    private startTilesElement: HTMLDivElement;
    private rootElement: HTMLDivElement;
    private tilesElement: HTMLDivElement;
    private headerText: HTMLDivElement;
    private tiles: Tile[];

    get title(): string {
        return this.headerText.innerText;
    }

    set title(value: string) {
        this.headerText.innerText = value;
    }

    constructor(tileGroupElement: HTMLDivElement) {
        this.rootElement = tileGroupElement;
        this.startTilesElement = <HTMLDivElement>this.rootElement.parentElement;
        this.headerText = tileGroupElement.querySelector(".tile-group-header-text");
        this.tilesElement = tileGroupElement.querySelector(".tile-group-tiles");
        this.tiles = [];

        var tileElements = this.rootElement.querySelectorAll(".tile-container");
        for (let i = 0; i < tileElements.length; i++) {
            const tileElement = <HTMLDivElement>tileElements[i];
            this.tiles.push(new Tile(tileElement));
        }
    }

    tileSizeToWidth(size: TileSize): number {
        switch (size) {
            case TileSize.square70x70:
                return 1;
            case TileSize.square150x150:
                return 2;
            case TileSize.wide310x150:
            case TileSize.square310x310:
                return 4;
        }
    }

    tileSizeToHeight(size: TileSize): number {
        switch (size) {
            case TileSize.square70x70:
                return 1;
            case TileSize.square150x150:
            case TileSize.wide310x150:
                return 2;
            case TileSize.square310x310:
                return 4;
        }
    }

    layout() {
        let availableHeight = this.startTilesElement.offsetHeight - this.headerText.offsetHeight;
        let maxRows = Math.floor(availableHeight / 64) - 1;

        console.log(`available height: ${availableHeight}, maxRows: ${maxRows}`);

        let row = 0;
        let column = 0;
        let baseColumn = 0;
        this.tilesElement.style.gridTemplateRows = "60px ".repeat(maxRows);

        let lastWidth = 0;
        let lastHeight = 0;

        for (const tile of this.tiles) {
            if (tile.isFence && tile.tileSize == TileSize.square70x70) {

            }

            let tileWidth = this.tileSizeToWidth(tile.tileSize);
            let tileHeight = this.tileSizeToHeight(tile.tileSize);

            column += Math.max(lastWidth, tileWidth); // thanks sharpy <3

            if ((column - baseColumn) >= 4) {
                if ((row + Math.max(lastHeight, tileHeight) + 1) >= maxRows) {
                    row = 0;
                    baseColumn += 4;
                }
                else {
                    row += lastHeight;
                }

                column = baseColumn;
            }

            tile.rootElement.style.gridRowStart = (row + 1).toString();
            tile.rootElement.style.gridColumnStart = (column + 1).toString();

            lastWidth = tileWidth;
            lastHeight = tileHeight;
        }
    }
}