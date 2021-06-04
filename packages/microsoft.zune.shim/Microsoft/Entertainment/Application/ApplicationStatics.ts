// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { AppMode } from "./AppMode";
import { IApplicationStatics } from "./IApplicationStatics";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Package } from "winrt/Windows/ApplicationModel/Package";

@GenerateShim('Microsoft.Entertainment.Application.ApplicationStatics')
export class ApplicationStatics implements IApplicationStatics {
    get appMode(): AppMode {
        var pack = Package.current;
        if (pack.id.name.includes("Music"))
            return AppMode.music
        if (pack.id.name.includes("Video"))
            return AppMode.video

        return AppMode.test;
    }
}