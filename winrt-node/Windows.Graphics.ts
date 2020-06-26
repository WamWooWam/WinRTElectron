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
}