import { uuidv4 } from "winrt/Windows/Foundation/Interop/Utils";
import { Window } from "./Desktop/Window";
import { CoreWindow } from "./Immersive/CoreWindow";
import { Package } from "./Package";
import { PackageApplication } from "./PackageApplication";

export class Application {
    constructor() {
        this.id = uuidv4();
        this.windows = [];
        this.coreWindows = [];
    }

    static createForImmersiveApp(pack: Package, packApp: PackageApplication){
        let app = new Application();
        app.name = packApp.visualElements.displayName;
        app.icon = packApp.visualElements.square30x30Logo;
        app.package = pack;
        app.packageApplication = packApp;

        return app;
    }

    id: string;
    name: string;
    icon: string;
    package: Package;
    packageApplication: PackageApplication;
    coreWindows: CoreWindow[];
    windows: Window[];
}