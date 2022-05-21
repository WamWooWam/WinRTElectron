import { Component, createRef, RefObject, RenderableProps } from "preact";
import { Tile, TileProps } from "./Tile";
import { TileSize } from "./TileSize";
import "./tile.css"
import { FenceTile } from "./FenceTile";

interface TileGroupProps {
    title: string;
    tiles: TileProps[];
}

interface TileGroupState {
    availableHeight?: number;
}

export class TileGroup extends Component<TileGroupProps, TileGroupState> {

    groupRef: RefObject<HTMLDivElement>
    headerRef: RefObject<HTMLDivElement>

    constructor(props: TileGroupProps) {
        super(props);

        this.groupRef = createRef();
        this.headerRef = createRef();
    }

    componentDidMount() {
        window.addEventListener("resize", this.onResize.bind(this))

        let startTilesElement = this.groupRef.current.parentElement;
        let headerText = this.headerRef.current;
        this.setState({ availableHeight: startTilesElement.offsetHeight - headerText.offsetHeight });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize.bind(this))
    }

    onResize() {
        let startTilesElement = this.groupRef.current.parentElement;
        let headerText = this.headerRef.current;
        this.setState({ availableHeight: startTilesElement.offsetHeight - headerText.offsetHeight });
    }

    tileSizeToWidth(size: TileSize): number {
        switch (size) {
            case TileSize.square150x150:
                return 1;
            case TileSize.wide310x150:
            case TileSize.square310x310:
                return 2;
            case TileSize.square70x70: // handled separately
            default:
                throw new Error("Invalid tile size!")
        }
    }

    tileSizeToHeight(size: TileSize): number {
        switch (size) {
            case TileSize.square150x150:
            case TileSize.wide310x150:
                return 1;
            case TileSize.square310x310:
                return 2;
            case TileSize.square70x70: // handled separately
            default:
                throw new Error("Invalid tile size!")
        }
    }

    collapseTiles(tiles: TileProps[]): Array<any> {
        let fullTiles = [];
        let currentFence: Array<any> = null;
        let resetFence = (val: [] = null) => {
            if (currentFence && currentFence.length)
                fullTiles.push({ size: TileSize.square150x150, apps: currentFence })
            currentFence = val;
        }

        for (const tile of tiles) {
            if (tile.fence && tile.size === TileSize.square70x70) {
                resetFence([]);
                currentFence.push(tile);
                continue;
            }

            if (currentFence) {
                if (tile.size !== TileSize.square70x70) {
                    resetFence();
                }
                else {
                    if (currentFence.length === 4) {
                        resetFence([]);
                    }

                    currentFence.push(tile);
                    continue;
                }
            }

            fullTiles.push(tile);
        }

        resetFence([]);
        console.log("collaped tiles");

        return fullTiles;
    }


    render(props: TileGroupProps, state: TileGroupState) {
        let tiles = [];
        let style: any = {};

        if (state.availableHeight !== undefined) {
            let availableHeight = state.availableHeight;
            let maxRows = Math.floor(availableHeight / 128);
            console.log(`available height: ${availableHeight}, maxRows: ${maxRows}`);

            let row = 0;
            let column = 0;
            let baseColumn = 0;
            style.gridTemplateRows = `repeat(${maxRows}, 120px)`

            let lastWidth = 0;
            let lastHeight = 0;

            let collapsedTiles = this.collapseTiles(props.tiles);
            for (const tile of collapsedTiles) {
                let tileWidth = this.tileSizeToWidth(tile.size);
                let tileHeight = this.tileSizeToHeight(tile.size);

                column += Math.max(lastWidth, tileWidth);

                if ((column - baseColumn) >= 2) {
                    if ((row + Math.max(lastHeight, tileHeight)) >= maxRows) {
                        row = 0;
                        baseColumn += 2;
                    }
                    else {
                        row += lastHeight;
                    }

                    column = baseColumn;
                }

                if (tile.apps) {
                    tiles.push(<FenceTile {...tile} row={row} column={column} />)
                }
                else {
                    tiles.push(<Tile {...tile} row={row} column={column} />)
                }

                lastWidth = tileWidth;
                lastHeight = tileHeight;
            }
        }

        return (
            <div class="start-tile-group" ref={this.groupRef}>
                <div class="tile-group-header" ref={this.headerRef}>
                    <div class="tile-group-header-text">
                        {/* a non breaking space is inserted here to ensure the layout remains the same */}
                        {props.title && props.title !== "" ? props.title : "\u00A0"}
                    </div>
                </div>

                <div class="tile-group-tiles" style={style}>{...tiles}</div>
            </div>
        )
    }
}