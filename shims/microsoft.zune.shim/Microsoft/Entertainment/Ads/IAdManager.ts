// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { AdType } from "./AdType";

export interface IAdManager {
    getEmptyRoomTimeout(): number;
    setAdPlayed(adType: AdType): void;
    setStreamingTrackPlayed(): void;
    setStreamingTrackInvoked(): void;
    isAdRequired(adType: AdType, currentMediaIsFreeStreaming: boolean): boolean;
}
