
//
// Because React is kinda difficult to work with for this stuff, creating a CoreWindow allocates
// a "handle" associated with the window state and <webview> element that can be used to render 
// that window anywhere in the DOM
//

import { newGuid } from "../Shell/Util";
import { WebViewManager } from "../Shell/WebViewManager";
import { CoreWindowInfo } from "./CoreWindowInfo";
import { Package } from "./Package";
import { PackageApplication } from "./PackageApplication";

export class CoreWindowManager {

    static coreWindowMap: Map<string, CoreWindowInfo> = new Map();

    static createCoreWindowForApp(pack: Package, app: PackageApplication): CoreWindowInfo {
        let id = `${pack.identity.packageFamilyName}#${app.id}_${newGuid()}`;
        let view = WebViewManager.getWebViewForId(id);
        let info: CoreWindowInfo = { id, pack, app, view };

        console.log(id);

        CoreWindowManager.coreWindowMap.set(id, info);

        return info;
    }

    static getWindowById(id: string): CoreWindowInfo {
        return CoreWindowManager.coreWindowMap.get(id);
    }
}