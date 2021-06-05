// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { AdaptiveSourceClosedEventHandler } from "./AdaptiveSourceClosedEventHandler";
import { AdaptiveSourceFailedEventHandler } from "./AdaptiveSourceFailedEventHandler";
import { AdaptiveSourceManagerFailedEventHandler } from "./AdaptiveSourceManagerFailedEventHandler";
import { AdaptiveSourceOpenedEventHandler } from "./AdaptiveSourceOpenedEventHandler";
import { AdaptiveSourceStatusUpdatedEventHandler } from "./AdaptiveSourceStatusUpdatedEventHandler";
import { IAdaptiveSource } from "./IAdaptiveSource";
import { IDownloaderPlugin } from "./IDownloaderPlugin";
import { ManifestReadyEventHandler } from "./ManifestReadyEventHandler";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";

export interface IAdaptiveSourceManager {
    readonly adaptiveSources: IVectorView<IAdaptiveSource>;
    setDownloaderPlugin(pPlugin: IDownloaderPlugin): void;
    setDownloadBufferSec(bufferSec: number): void;
    setBufferDelaySec(bufferDelaySec: number): void;
    setLiveBackoffSec(liveBackOffSec: number): void;
    setPlaybackOffsetSec(playbackOffsetSec: number): void;
    setLiveBeginOffsetSec(liveBeginOffsetSec: number): void;
    sendExtendedCommand(cmd: string, parameter: string): void;
    onadaptivesourceclosedevent: AdaptiveSourceClosedEventHandler;
    onadaptivesourcefailedevent: AdaptiveSourceFailedEventHandler;
    onadaptivesourcemanagerfailedevent: AdaptiveSourceManagerFailedEventHandler;
    onadaptivesourceopenedevent: AdaptiveSourceOpenedEventHandler;
    onadaptivesourcestatusupdatedevent: AdaptiveSourceStatusUpdatedEventHandler;
    onmanifestreadyevent: ManifestReadyEventHandler;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}