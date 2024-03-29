// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { ActivateAdUnitEventArgs } from "./ActivateAdUnitEventArgs";
import { AdFailureEventArgs } from "./AdFailureEventArgs";
import { AdStatus } from "./AdStatus";
import { AdTrackingEventEventArgs } from "./AdTrackingEventEventArgs";
import { DeactivateAdUnitEventArgs } from "./DeactivateAdUnitEventArgs";
import { IAdSource } from "./IAdSource";
import { IPlayer } from "./IPlayer";
import { LoadPlayerEventArgs } from "./LoadPlayerEventArgs";
import { UnloadPlayerEventArgs } from "./UnloadPlayerEventArgs";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncActionWithProgress } from "winrt/Windows/Foundation/IAsyncActionWithProgress`1";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";

export interface IAdPayloadHandler {
    player: IPlayer;
    readonly supportedTypes: string[];
    preloadAdAsync(adSource: IAdSource): IAsyncAction;
    playAdAsync(adSource: IAdSource, startTimeout: number | null): IAsyncActionWithProgress<AdStatus>;
    cancelAd(force: boolean): IAsyncOperation<boolean>;
    onloadplayer: EventHandler<LoadPlayerEventArgs>;
    onunloadplayer: EventHandler<UnloadPlayerEventArgs>;
    onactivateadunit: EventHandler<ActivateAdUnitEventArgs>;
    ondeactivateadunit: EventHandler<DeactivateAdUnitEventArgs>;
    onadfailure: EventHandler<AdFailureEventArgs>;
    onadtrackingeventoccurred: EventHandler<AdTrackingEventEventArgs>;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}
