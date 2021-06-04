// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { IPropertySet } from "../../Foundation/Collections/IPropertySet";
import { IAsyncAction } from "../../Foundation/IAsyncAction";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TimeSpan } from "../../Foundation/TimeSpan";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { CurrentTimeChangeRequestedEventArgs } from "./CurrentTimeChangeRequestedEventArgs";
import { MuteChangeRequestedEventArgs } from "./MuteChangeRequestedEventArgs";
import { PlaybackRateChangeRequestedEventArgs } from "./PlaybackRateChangeRequestedEventArgs";
import { SourceChangeRequestedEventArgs } from "./SourceChangeRequestedEventArgs";
import { VolumeChangeRequestedEventArgs } from "./VolumeChangeRequestedEventArgs";

@GenerateShim('Windows.Media.PlayTo.PlayToReceiver')
export class PlayToReceiver { 
    supportsVideo: boolean = null;
    supportsImage: boolean = null;
    supportsAudio: boolean = null;
    friendlyName: string = null;
    properties: IPropertySet = null;
    notifyVolumeChange(volume: number, mute: boolean): void {
        console.warn('PlayToReceiver#notifyVolumeChange not implemented')
    }
    notifyRateChange(rate: number): void {
        console.warn('PlayToReceiver#notifyRateChange not implemented')
    }
    notifyLoadedMetadata(): void {
        console.warn('PlayToReceiver#notifyLoadedMetadata not implemented')
    }
    notifyTimeUpdate(currentTime: number): void {
        console.warn('PlayToReceiver#notifyTimeUpdate not implemented')
    }
    notifyDurationChange(duration: number): void {
        console.warn('PlayToReceiver#notifyDurationChange not implemented')
    }
    notifySeeking(): void {
        console.warn('PlayToReceiver#notifySeeking not implemented')
    }
    notifySeeked(): void {
        console.warn('PlayToReceiver#notifySeeked not implemented')
    }
    notifyPaused(): void {
        console.warn('PlayToReceiver#notifyPaused not implemented')
    }
    notifyPlaying(): void {
        console.warn('PlayToReceiver#notifyPlaying not implemented')
    }
    notifyEnded(): void {
        console.warn('PlayToReceiver#notifyEnded not implemented')
    }
    notifyError(): void {
        console.warn('PlayToReceiver#notifyError not implemented')
    }
    notifyStopped(): void {
        console.warn('PlayToReceiver#notifyStopped not implemented')
    }
    startAsync(): IAsyncAction {
        throw new Error('PlayToReceiver#startAsync not implemented')
    }
    stopAsync(): IAsyncAction {
        throw new Error('PlayToReceiver#stopAsync not implemented')
    }

    #currentTimeChangeRequested: Set<TypedEventHandler<PlayToReceiver, CurrentTimeChangeRequestedEventArgs>> = new Set();
    @Enumerable(true)
    set oncurrenttimechangerequested(handler: TypedEventHandler<PlayToReceiver, CurrentTimeChangeRequestedEventArgs>) {
        this.#currentTimeChangeRequested.add(handler);
    }

    #muteChangeRequested: Set<TypedEventHandler<PlayToReceiver, MuteChangeRequestedEventArgs>> = new Set();
    @Enumerable(true)
    set onmutechangerequested(handler: TypedEventHandler<PlayToReceiver, MuteChangeRequestedEventArgs>) {
        this.#muteChangeRequested.add(handler);
    }

    #pauseRequested: Set<TypedEventHandler<PlayToReceiver, any>> = new Set();
    @Enumerable(true)
    set onpauserequested(handler: TypedEventHandler<PlayToReceiver, any>) {
        this.#pauseRequested.add(handler);
    }

    #playRequested: Set<TypedEventHandler<PlayToReceiver, any>> = new Set();
    @Enumerable(true)
    set onplayrequested(handler: TypedEventHandler<PlayToReceiver, any>) {
        this.#playRequested.add(handler);
    }

    #playbackRateChangeRequested: Set<TypedEventHandler<PlayToReceiver, PlaybackRateChangeRequestedEventArgs>> = new Set();
    @Enumerable(true)
    set onplaybackratechangerequested(handler: TypedEventHandler<PlayToReceiver, PlaybackRateChangeRequestedEventArgs>) {
        this.#playbackRateChangeRequested.add(handler);
    }

    #sourceChangeRequested: Set<TypedEventHandler<PlayToReceiver, SourceChangeRequestedEventArgs>> = new Set();
    @Enumerable(true)
    set onsourcechangerequested(handler: TypedEventHandler<PlayToReceiver, SourceChangeRequestedEventArgs>) {
        this.#sourceChangeRequested.add(handler);
    }

    #stopRequested: Set<TypedEventHandler<PlayToReceiver, any>> = new Set();
    @Enumerable(true)
    set onstoprequested(handler: TypedEventHandler<PlayToReceiver, any>) {
        this.#stopRequested.add(handler);
    }

    #timeUpdateRequested: Set<TypedEventHandler<PlayToReceiver, any>> = new Set();
    @Enumerable(true)
    set ontimeupdaterequested(handler: TypedEventHandler<PlayToReceiver, any>) {
        this.#timeUpdateRequested.add(handler);
    }

    #volumeChangeRequested: Set<TypedEventHandler<PlayToReceiver, VolumeChangeRequestedEventArgs>> = new Set();
    @Enumerable(true)
    set onvolumechangerequested(handler: TypedEventHandler<PlayToReceiver, VolumeChangeRequestedEventArgs>) {
        this.#volumeChangeRequested.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'currenttimechangerequested':
                this.#currentTimeChangeRequested.add(handler);
                break;
            case 'mutechangerequested':
                this.#muteChangeRequested.add(handler);
                break;
            case 'pauserequested':
                this.#pauseRequested.add(handler);
                break;
            case 'playrequested':
                this.#playRequested.add(handler);
                break;
            case 'playbackratechangerequested':
                this.#playbackRateChangeRequested.add(handler);
                break;
            case 'sourcechangerequested':
                this.#sourceChangeRequested.add(handler);
                break;
            case 'stoprequested':
                this.#stopRequested.add(handler);
                break;
            case 'timeupdaterequested':
                this.#timeUpdateRequested.add(handler);
                break;
            case 'volumechangerequested':
                this.#volumeChangeRequested.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'currenttimechangerequested':
                this.#currentTimeChangeRequested.delete(handler);
                break;
            case 'mutechangerequested':
                this.#muteChangeRequested.delete(handler);
                break;
            case 'pauserequested':
                this.#pauseRequested.delete(handler);
                break;
            case 'playrequested':
                this.#playRequested.delete(handler);
                break;
            case 'playbackratechangerequested':
                this.#playbackRateChangeRequested.delete(handler);
                break;
            case 'sourcechangerequested':
                this.#sourceChangeRequested.delete(handler);
                break;
            case 'stoprequested':
                this.#stopRequested.delete(handler);
                break;
            case 'timeupdaterequested':
                this.#timeUpdateRequested.delete(handler);
                break;
            case 'volumechangerequested':
                this.#volumeChangeRequested.delete(handler);
                break;
        }
    }
}