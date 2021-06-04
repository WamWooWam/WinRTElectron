// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IFUEConfiguration } from "./IFUEConfiguration";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Configuration.FUEConfiguration')
export class FUEConfiguration implements IFUEConfiguration { 
    showLXFUE: boolean = true;
    showFirstLaunchVideo: boolean = true;
    showFUE: boolean = true;
    settingsVersion: number = null;
    musicCloudContentV2FlyoutFilterShown: boolean = null;
    musicCloudContentV1CleanupDialogDismissed: boolean = null;
    musicAvailableOfflineFlyoutFilterShown: boolean = null;
    minVideoAppSupportedVersion: string = "1.0.0.0";
    minVersionBlockAllAppUse: string = "0.0.0.0";
    minMusicAppSupportedVersion: string = "1.0.0.0";
    freeStreamingIsGoneAnnouncementDismissed: boolean = false;
    acceptedPrivacyStatement: boolean = true;
    acceptedEula: boolean = true;
}