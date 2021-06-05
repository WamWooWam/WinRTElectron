// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { ActivateAdUnitEventArgs } from "./ActivateAdUnitEventArgs";
import { AdFailureEventArgs } from "./AdFailureEventArgs";
import { AdState } from "./AdState";
import { AdStatus } from "./AdStatus";
import { AdTrackingEventEventArgs } from "./AdTrackingEventEventArgs";
import { DeactivateAdUnitEventArgs } from "./DeactivateAdUnitEventArgs";
import { IAdPayloadHandler } from "./IAdPayloadHandler";
import { IAdSource } from "./IAdSource";
import { IPlayer } from "./IPlayer";
import { IVpaid } from "./IVpaid";
import { LoadPlayerEventArgs } from "./LoadPlayerEventArgs";
import { NavigationRequestEventArgs } from "./NavigationRequestEventArgs";
import { UnloadPlayerEventArgs } from "./UnloadPlayerEventArgs";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncActionWithProgress } from "winrt/Windows/Foundation/IAsyncActionWithProgress`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { AsyncAction } from "winrt/Windows/Foundation/Interop/AsyncAction";
import { AsyncActionWithProgress } from "winrt/Windows/Foundation/Interop/AsyncActionWithProgress`1";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.AdHandlerController')
export class AdHandlerController implements IStringable { 
    readonly adPayloadHandlers: IVector<IAdPayloadHandler> = null;
    startTimeout: number | null = null;
    readonly activeHandler: IAdPayloadHandler = null;
    player: IPlayer = null;
    readonly isAdvertising: boolean = null;
    readonly activeAdPlayer: IVpaid = null;
    readonly adState: AdState = null;
    cancelActiveAds(): IAsyncAction {
        return AsyncAction.from(async () => console.warn('AdHandlerController#cancelActiveAds not implemented'));
    }
    playAdAsync(adSource: IAdSource): IAsyncActionWithProgress<AdStatus> {
        return AsyncActionWithProgress.from(async () => console.warn('AdHandlerController#playAdAsync not implemented'));
    }
    preloadAdAsync(adSource: IAdSource): IAsyncAction {
        return AsyncAction.from(async () => console.warn('AdHandlerController#preloadAdAsync not implemented'));
    }
    toString(): string {
        throw new Error('AdHandlerController#toString not implemented')
    }

    private __adStateChanged: Set<EventHandler<any>> = new Set();
    @Enumerable(true)
    set onadstatechanged(handler: EventHandler<any>) {
        this.__adStateChanged.add(handler);
    }

    private __activeAdPlayerChanged: Set<EventHandler<any>> = new Set();
    @Enumerable(true)
    set onactiveadplayerchanged(handler: EventHandler<any>) {
        this.__activeAdPlayerChanged.add(handler);
    }

    private __navigationRequest: Set<EventHandler<NavigationRequestEventArgs>> = new Set();
    @Enumerable(true)
    set onnavigationrequest(handler: EventHandler<NavigationRequestEventArgs>) {
        this.__navigationRequest.add(handler);
    }

    private __loadPlayer: Set<EventHandler<LoadPlayerEventArgs>> = new Set();
    @Enumerable(true)
    set onloadplayer(handler: EventHandler<LoadPlayerEventArgs>) {
        this.__loadPlayer.add(handler);
    }

    private __unloadPlayer: Set<EventHandler<UnloadPlayerEventArgs>> = new Set();
    @Enumerable(true)
    set onunloadplayer(handler: EventHandler<UnloadPlayerEventArgs>) {
        this.__unloadPlayer.add(handler);
    }

    private __activateAdUnit: Set<EventHandler<ActivateAdUnitEventArgs>> = new Set();
    @Enumerable(true)
    set onactivateadunit(handler: EventHandler<ActivateAdUnitEventArgs>) {
        this.__activateAdUnit.add(handler);
    }

    private __deactivateAdUnit: Set<EventHandler<DeactivateAdUnitEventArgs>> = new Set();
    @Enumerable(true)
    set ondeactivateadunit(handler: EventHandler<DeactivateAdUnitEventArgs>) {
        this.__deactivateAdUnit.add(handler);
    }

    private __adFailure: Set<EventHandler<AdFailureEventArgs>> = new Set();
    @Enumerable(true)
    set onadfailure(handler: EventHandler<AdFailureEventArgs>) {
        this.__adFailure.add(handler);
    }

    private __adTrackingEventOccurred: Set<EventHandler<AdTrackingEventEventArgs>> = new Set();
    @Enumerable(true)
    set onadtrackingeventoccurred(handler: EventHandler<AdTrackingEventEventArgs>) {
        this.__adTrackingEventOccurred.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'adstatechanged':
                this.__adStateChanged.add(handler);
                break;
            case 'activeadplayerchanged':
                this.__activeAdPlayerChanged.add(handler);
                break;
            case 'navigationrequest':
                this.__navigationRequest.add(handler);
                break;
            case 'loadplayer':
                this.__loadPlayer.add(handler);
                break;
            case 'unloadplayer':
                this.__unloadPlayer.add(handler);
                break;
            case 'activateadunit':
                this.__activateAdUnit.add(handler);
                break;
            case 'deactivateadunit':
                this.__deactivateAdUnit.add(handler);
                break;
            case 'adfailure':
                this.__adFailure.add(handler);
                break;
            case 'adtrackingeventoccurred':
                this.__adTrackingEventOccurred.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'adstatechanged':
                this.__adStateChanged.delete(handler);
                break;
            case 'activeadplayerchanged':
                this.__activeAdPlayerChanged.delete(handler);
                break;
            case 'navigationrequest':
                this.__navigationRequest.delete(handler);
                break;
            case 'loadplayer':
                this.__loadPlayer.delete(handler);
                break;
            case 'unloadplayer':
                this.__unloadPlayer.delete(handler);
                break;
            case 'activateadunit':
                this.__activateAdUnit.delete(handler);
                break;
            case 'deactivateadunit':
                this.__deactivateAdUnit.delete(handler);
                break;
            case 'adfailure':
                this.__adFailure.delete(handler);
                break;
            case 'adtrackingeventoccurred':
                this.__adTrackingEventOccurred.delete(handler);
                break;
        }
    }
}