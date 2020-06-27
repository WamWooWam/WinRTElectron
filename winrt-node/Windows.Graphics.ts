import { EventTarget } from "./Windows.Foundation";

export namespace Graphics {
    export namespace Imaging {
        export class BitmapEncoder {

        }
    }

    export namespace Printing {
        export class PrintManager extends EventTarget {
            private static instance: PrintManager;
            static getForCurrentView() {
                return PrintManager.instance ?? (PrintManager.instance = new PrintManager());
            }
        }
    }

    export namespace Display {
        export class DisplayProperties {
            static get resolutionScale() {
                return ResolutionScale.scale100Percent;
            }
        }

        export enum ResolutionScale {
            invalid = 0,
            scale100Percent = 100,
            scale120Percent = 120,
            scale125Percent = 125,
            scale140Percent = 140,
            scale150Percent = 150,
            scale160Percent = 160,
            scale175Percent = 175,
            scale180Percent = 180,
            scale200Percent = 200,
            scale225Percent = 225,
            scale250Percent = 250,
            scale300Percent = 300,
        }
    }
}