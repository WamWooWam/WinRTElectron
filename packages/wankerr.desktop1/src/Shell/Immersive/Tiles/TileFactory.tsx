import { AppTile } from "./AppTile";
import { DesktopTile } from "./DesktopTile";
import { Tile } from "./Tile";

export class TileFactory {
    static createTile(tileContainerElement: HTMLDivElement, tileGroup: HTMLElement): Tile {
        let tile: Tile = null;
        let packName = tileContainerElement.dataset.packageName;
        let appName = tileContainerElement.dataset.id;

        if (appName.startsWith("Microsoft.Windows")) {
            switch (appName.substr(18)) {
                case "Desktop":
                    tile = new DesktopTile(tileContainerElement, tileGroup);
                    tile.constructTile();
                    return tile;
            }
        }
        
        tile = new AppTile(tileContainerElement, tileGroup, packName, appName);
        tile.constructTile();
        return tile;
    }
}
