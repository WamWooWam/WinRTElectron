// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:09 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncAction } from "../../Foundation/IAsyncAction";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { ApplicationViewSwitchingOptions } from "./ApplicationViewSwitchingOptions";
import { ViewSizePreference } from "./ViewSizePreference";

@GenerateShim('Windows.UI.ViewManagement.ApplicationViewSwitcher')
export class ApplicationViewSwitcher { 
    static disableShowingMainViewOnActivation(): void {
        console.warn('ApplicationViewSwitcher#disableShowingMainViewOnActivation not implemented')
    }
    static tryShowAsStandaloneAsync(viewId: number): IAsyncOperation<boolean> {
        throw new Error('ApplicationViewSwitcher#tryShowAsStandaloneAsync not implemented')
    }
    static tryShowAsStandaloneWithSizePreferenceAsync(viewId: number, sizePreference: ViewSizePreference): IAsyncOperation<boolean> {
        throw new Error('ApplicationViewSwitcher#tryShowAsStandaloneWithSizePreferenceAsync not implemented')
    }
    static tryShowAsStandaloneWithAnchorViewAndSizePreferenceAsync(viewId: number, sizePreference: ViewSizePreference, anchorViewId: number, anchorSizePreference: ViewSizePreference): IAsyncOperation<boolean> {
        throw new Error('ApplicationViewSwitcher#tryShowAsStandaloneWithAnchorViewAndSizePreferenceAsync not implemented')
    }
    static switchAsync(viewId: number): IAsyncAction {
        throw new Error('ApplicationViewSwitcher#switchAsync not implemented')
    }
    static switchFromViewAsync(toViewId: number, fromViewId: number): IAsyncAction {
        throw new Error('ApplicationViewSwitcher#switchFromViewAsync not implemented')
    }
    static switchFromViewWithOptionsAsync(toViewId: number, fromViewId: number, options: ApplicationViewSwitchingOptions): IAsyncAction {
        throw new Error('ApplicationViewSwitcher#switchFromViewWithOptionsAsync not implemented')
    }
    static prepareForCustomAnimatedSwitchAsync(toViewId: number, fromViewId: number, options: ApplicationViewSwitchingOptions): IAsyncOperation<boolean> {
        throw new Error('ApplicationViewSwitcher#prepareForCustomAnimatedSwitchAsync not implemented')
    }
}