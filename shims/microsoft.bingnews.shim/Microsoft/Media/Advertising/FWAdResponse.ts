// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { FWAd } from "./FWAd";
import { FWError } from "./FWError";
import { FWEventCallback } from "./FWEventCallback";
import { FWParameter } from "./FWParameter";
import { FWSiteSection } from "./FWSiteSection";
import { FWVisitor } from "./FWVisitor";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.FWAdResponse')
export class FWAdResponse implements IStringable { 
    version: string = null;
    customId: string = null;
    networkId: number | null = null;
    diagnostic: string = null;
    customState: string = null;
    readonly parameters: IVector<FWParameter> = null;
    readonly errors: IVector<FWError> = null;
    visitor: FWVisitor = null;
    readonly ads: IVector<FWAd> = null;
    readonly eventCallbacks: IVector<FWEventCallback> = null;
    siteSection: FWSiteSection = null;
    rendererManifest: string = null;
    rendererManifestVersion: string = null;
    toString(): string {
        throw new Error('FWAdResponse#toString not implemented')
    }
}
