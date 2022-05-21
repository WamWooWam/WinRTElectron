import { Component } from "preact";
import { useContext } from "preact/hooks";
import { Package } from "../../Data/Package";
import { PackageApplication } from "../../Data/PackageApplication";
import { PackageRegistry } from "../../Data/PackageRegistry";
import { TileSize } from "./TileSize";
import { AppSettings, CoreWindows } from "../../Shell";
import { CoreWindow } from "../Immersive/CoreWindow";
import { circularEase, cubicEase, lightenDarkenColour, easeInCubic } from "../Util";
import "./tile.css"
import { CoreWindowManager } from "../../Data/CoreWindowManager";
import { CoreWindowInfo } from "../../Data/CoreWindowInfo";
import { EventManager } from "../EventManager";

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
    launching: boolean;
    pressState?: "none" | "top" | "bottom" | "left" | "right" | "center";

    window?: CoreWindowInfo;

    start?: number;
    flipped?: boolean;
    initialX?: number;
    initialY?: number;
    initialWidth?: number;
    initialHeight?: number;
    flipStyle?: string;
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

        this.state = { pack, app, pressState: "none", launching: false }
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

        let window = CoreWindowManager.createCoreWindowForApp(this.state.pack, this.state.app);
        let bodyRect = document.body.getBoundingClientRect();
        let elemRect = (this.base as Element).getBoundingClientRect();

        this.setState({
            window,
            pressState: "none",
            initialX: elemRect.left - bodyRect.left,
            initialY: elemRect.top - bodyRect.top,
            initialWidth: elemRect.width,
            initialHeight: elemRect.height
        })

        requestAnimationFrame(this.flip.bind(this));
    }

    onFlipComplete() {

        let window = this.state.window;
        let element = this.base as HTMLElement;
        element.style.cssText = "";

        this.setState({ flipped: false, start: null, window: null })

        // let context = useContext(CoreWindows);
        // context.push(this.state.window);

        let eventManager = EventManager.getInstance();
        eventManager.dispatchEvent(new CustomEvent("move-window", { detail: window }));
    }

    render(props: TileProps, state: TileState) {
        let settings = useContext(AppSettings);
        let containerStyle = state.flipStyle;
        if (!containerStyle && props.column !== undefined && props.row !== undefined) {
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

        let backContent = null;
        if (state.flipped) {
            backContent = <CoreWindow windowId={state.window.id} isInTile={true}/>;
        }

        let size = this.getTileSize(props.size)
        let frontViewBox = `0 0 ${size.width} ${size.height}`

        // todo: this depends on the target size of the corewindow
        let backViewBox = `0 0 ${window.innerWidth} ${window.innerHeight}`

        return (
            <div class={"tile-container " + TileSize[props.size] + " " + state.pressState + (state.flipped ? " flipped" : "")}
                style={containerStyle}
                onPointerDown={this.onPointerDown}
                onPointerUp={this.onPointerUp}>
                <div class="tile">
                    <div class="front" style={frontStyle}>
                        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox={frontViewBox}>
                            <foreignObject width={size.width} height={size.height}>
                                <div class="tile-visual tile-visual-visible">
                                    <div className="tile-front-image-container">
                                        <img draggable={false} src={tileImageUrl} className={"tile-front-image " + TileSize[props.size]} />
                                    </div>
                                    {tileVisualText}
                                </div>
                            </foreignObject>
                        </svg>
                    </div>
                    <div class="back" style={backStyle}>
                        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox={backViewBox} style="width: 100%; height:100%;">
                            <foreignObject width="100vw" height="100vh">{backContent}</foreignObject>
                        </svg>
                    </div>
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

    private flip(time: number) {
        if (this.state.start == null) {
            this.setState({ start: time });
            requestAnimationFrame(this.flip.bind(this));
            return;
        }

        // todo: this needs to be the corewindow target
        let bodyRect = document.body.getBoundingClientRect();

        let progress = (time - this.state.start) / 1000;
        let angle = circularEase(progress, 0, 180, 1);
        let width = cubicEase(progress, this.state.initialWidth, bodyRect.width - this.state.initialWidth, 1);
        let height = cubicEase(progress, this.state.initialHeight, bodyRect.height - this.state.initialHeight, 1);

        let targetX = ((bodyRect.width - width) / 2) - (this.state.initialX);
        let targetY = ((bodyRect.height - height) / 2) - (this.state.initialY);

        let x = cubicEase(Math.min(1, progress * 1.1), this.state.initialX, targetX, 1) - this.state.initialX;
        let y = cubicEase(Math.min(1, progress * 1.1), this.state.initialY, targetY, 1) - this.state.initialY;
        let z = -125 + 125 * easeInCubic(Math.min(1, progress * 1.1));

        let element = this.base as HTMLElement;
        let flipStyle = `
            position: absolute; 
            top:${this.state.initialY}px;
            left:${this.state.initialX}px;
            width: ${width}px;
            height: ${height}px; 
            transform: translate3d(${x}px, ${y}px, ${z}px) rotate3D(0,1,0,${angle}deg); 
            transform-style: preserve-3d; 
            z-index: 100;`;

        let flipped = this.state.flipped;
        if (angle >= 90 && !this.state.flipped) {
            flipped = true;
            this.setState({ flipped: true })
        }

        if (progress < 1) {
            element.style.cssText = flipStyle;
            requestAnimationFrame(this.flip.bind(this));
        } else {
            setTimeout(this.onFlipComplete.bind(this), 500);
        }
    }

}