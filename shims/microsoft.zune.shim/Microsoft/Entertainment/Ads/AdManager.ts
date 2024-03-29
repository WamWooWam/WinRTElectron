// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { AdType } from "./AdType";
import { IAdManager } from "./IAdManager";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Ads.AdManager')
export class AdManager implements IAdManager { 
    getEmptyRoomTimeout(): number {
        return -1;
    }
    setAdPlayed(adType: AdType): void {
        console.warn('AdManager#setAdPlayed not implemented')
    }
    setStreamingTrackPlayed(): void {
        console.warn('AdManager#setStreamingTrackPlayed not implemented')
    }
    setStreamingTrackInvoked(): void {
        console.warn('AdManager#setStreamingTrackInvoked not implemented')
    }
    isAdRequired(adType: AdType, currentMediaIsFreeStreaming: boolean): boolean {
        return false;
    }
}
