import { WebviewTag } from "electron";
import { Package } from "./Package";
import { PackageApplication } from "./PackageApplication";

export interface CoreWindowInfo {
    id: string
    pack: Package
    app: PackageApplication
    view: WebviewTag

    title?: string;
    splashScreenVisible?: boolean;
    titlebarVisible?: boolean;
    activatedDeferralId?: string;
    loaded?: boolean;
}