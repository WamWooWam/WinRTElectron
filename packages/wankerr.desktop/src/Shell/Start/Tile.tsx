import { Component } from "preact";
import { Package } from "../../Data/Package";
import { ApplicationDefaultTile, PackageApplication } from "../../Data/PackageApplication";
import { PackageRegistry } from "../../Data/PackageRegistry";
import { lightenDarkenColour } from "../Util";
import { TileSize } from "./TileSize";
import "./tile.css"
import { useContext } from "preact/hooks";
import { AppSettings } from "../../Shell";

export interface TileProps {
    packageName?: string;
    appId: string;
    size: TileSize;
    fence?: boolean;
    row?: number,
    column?: number;
}

interface TileState {
    pack: Package;
    app: PackageApplication;
    pressState?: "none" | "top" | "bottom" | "left" | "right" | "center";
}

export class Tile extends Component<TileProps, TileState> {

    constructor(props: TileProps) {
        super(props);
        
        let pack = PackageRegistry.getPackage(props.packageName);
        if (!pack)
            console.warn("Package " + props.packageName + " not found!");

        let app = pack?.applications.get(props.appId);
        if (!app)
            console.warn("App " + props.appId + " in package " + props.packageName + " not found!");

        this.state = { pack, app, pressState: "none" }
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
    }

    onPointerDown(e: PointerEvent) {
        const element = e.target as Element;
        const size = this.getTileSize(this.props.size);
        const offsetX = Math.max(0, Math.min(e.offsetX, size.width));
        const offsetY = Math.max(0, Math.min(e.offsetY, size.height));
        element.setPointerCapture(e.pointerId);

        if ((offsetX >= (size.width * 0.33) && offsetX <= (size.width * 0.66)) && (offsetY >= (size.height * 0.33) && offsetY <= (size.height * 0.66))) {
            this.setState({ pressState: "center" })
        }
        else {
            var distanceToPositive = { x: offsetX, y: offsetY }
            var distanceToNegative = { x: (size.width - offsetX), y: (size.height - offsetY) }

            let smallestX = Math.min(distanceToPositive.x, distanceToNegative.x);
            let smallestY = Math.min(distanceToPositive.y, distanceToNegative.y);
            let smallestDistance = Math.min(smallestX, smallestY);

            if (smallestDistance == distanceToPositive.x)
                this.setState({ pressState: "left" })
            else if (smallestDistance == distanceToNegative.x)
                this.setState({ pressState: "right" })
            else if (smallestDistance == distanceToNegative.y)
                this.setState({ pressState: "bottom" })
            else
                this.setState({ pressState: "top" })
        }
    }

    onPointerUp(e: PointerEvent) {
        let element = e.target as Element;
        element.releasePointerCapture(e.pointerId);

        this.setState({ pressState: "none" })
    }

    render(props: TileProps, state: TileState) {

        let settings = useContext(AppSettings);
        let containerStyle = "";
        if (props.column !== undefined && props.row !== undefined) {
            containerStyle = `grid-row-start: ${props.row + 1}; grid-column-start: ${props.column + 1}`;
        }

        let tileColour = state.app?.visualElements.backgroundColor ?? settings.accentColour;
        let frontStyle = {
            background: `linear-gradient(to top right, ${tileColour}, ${lightenDarkenColour(tileColour, 30)})`,
            border: `1px solid ${lightenDarkenColour(tileColour, 40)}`
        }

        let backStyle = { background: tileColour }

        if (!state.pack || !state.app) {
            return (
                <div class={"tile-container " + TileSize[props.size] + " " + state.pressState}
                    style={containerStyle}>
                    <div class="tile">
                        <div class="front" style={frontStyle}></div>
                        <div class="back" style={backStyle}></div>
                    </div>
                </div>
            );
        }

        let tileImageUrl = (this.getTileImageUrl(props.size, state.app) ?? state.app.visualElements.square150x150Logo) + "?scale=80"
        let showTextSizes = state.app.visualElements.defaultTile.showNameOnTiles.map(v => TileSize[v]);
        let tileVisualText = null;
        if (props.size != TileSize.square70x70 && showTextSizes.includes(props.size)) {
            tileVisualText = <p class={"tile-front-text" + (state.app.visualElements.foregroundText == "dark" ? " black" : "")}>{state.app.visualElements.displayName}</p>
        }

        return (
            <div class={"tile-container " + TileSize[props.size] + " " + state.pressState}
                style={containerStyle}
                onPointerDown={this.onPointerDown}
                onPointerUp={this.onPointerUp}>
                <div class="tile">
                    <div class="front" style={frontStyle}>
                        <div class="tile-visual tile-visual-visible">
                            <div className="tile-front-image-container">
                                <img draggable={false} src={tileImageUrl} className={"tile-front-image " + TileSize[props.size]} />
                            </div>
                            {tileVisualText}
                        </div>
                    </div>
                    <div class="back" style={backStyle}></div>
                </div>
            </div>
        )
    }

    private getTileSize(size: TileSize) {
        switch (size) {
            case TileSize.square70x70:
                return { width: 56, height: 56 };
            case TileSize.square150x150:
                return { width: 120, height: 120 };
            case TileSize.wide310x150:
                return { width: 248, height: 120 };
            case TileSize.square310x310:
                return { width: 248, height: 248 };
        }
    }

    private getTileImageUrl(size: TileSize, app: PackageApplication) {
        switch (size) {
            case TileSize.square70x70:
                return app.visualElements.defaultTile.square70x70Logo;
            case TileSize.square150x150:
                return app.visualElements.square150x150Logo;
            case TileSize.wide310x150:
                return app.visualElements.defaultTile.wide310x150Logo;
            case TileSize.square310x310:
                return app.visualElements.defaultTile.square310x310Logo;
        }
    }

}