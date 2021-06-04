import { Shell } from "../../Shell";
import { Start } from "../Start";
import { Tile } from "./Tile";


export class DesktopTile extends Tile {
    constructor(tileContainerElement: HTMLDivElement, tileGroup: HTMLElement) {
        super(tileContainerElement, tileGroup);
    }

    constructTile() {
        super.constructTileCore(Shell.getInstance().settings.personalisation.accentColour);

        let visual = this.createTileVisual();
        visual.appendChild(this.createTileVisualImage(""))
        visual.appendChild(this.createTileVisualText("", "light"));
        
        this.tileFront.appendChild(visual)
        this.tileVisuals.push(visual);
    }

    onClickedCore() {
        let desktop = Shell.getInstance();
        desktop.start.hide();
        desktop.taskbar.show();
        desktop.show();
    }

    reset() {
        super.reset();
    }
}
