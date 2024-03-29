// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { Uri } from "../Foundation/Uri";
import { LauncherUIOptions } from "./LauncherUIOptions";
import { ViewSizePreference } from "../UI/ViewManagement/ViewSizePreference";

@GenerateShim('Windows.System.LauncherOptions')
export class LauncherOptions { 
    treatAsUntrusted: boolean = null;
    preferredApplicationPackageFamilyName: string = null;
    preferredApplicationDisplayName: string = null;
    fallbackUri: Uri = null;
    displayApplicationPicker: boolean = null;
    contentType: string = null;
    ui: LauncherUIOptions = null;
    desiredRemainingView: ViewSizePreference = null;
}
