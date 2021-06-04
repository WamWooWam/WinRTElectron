import { Component } from "preact";
import { Package } from "../../Data/Package";
import { PackageApplication } from "../../Data/PackageApplication";
import { PackageRegistry } from "../../Data/PackageRegistry";
import { lightenDarkenColour } from "../Util";
import { TileSize } from "./TileSize";
import { Tile, TileProps } from "./Tile";
import "./tile.css"

export interface FenceTileProps {
    apps: TileProps[]
    row?: number,
    column?: number;
}

export class FenceTile extends Component<FenceTileProps> {

    constructor(props: FenceTileProps) {
        super(props);
    }

    render(props: FenceTileProps) {
        return (
            <div class="fence-tile-container square150x150" style={`grid-row-start: ${props.row + 1}; grid-column-start: ${props.column + 1}`}>
                {...props.apps.map(a => <Tile {...a}/>)}
            </div>
        )
    }
}