// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { CreativeSourceType } from "./CreativeSourceType";
import { FlexibleOffset } from "./FlexibleOffset";
import { Icon } from "./Icon";
import { MediaSourceEnum } from "./MediaSourceEnum";
import { TrackingEvent } from "./TrackingEvent";
import { IIterable } from "winrt/Windows/Foundation/Collections/IIterable`1";
import { Size } from "winrt/Windows/Foundation/Size";
import { Uri } from "winrt/Windows/Foundation/Uri";

export interface ICreativeSource {
    readonly icons: IIterable<Icon>;
    readonly mimeType: string;
    readonly codec: string;
    readonly mediaSource: string;
    readonly extraInfo: string;
    readonly clickUrl: Uri;
    readonly clickTracking: IIterable<string>;
    readonly trackingEvents: IIterable<TrackingEvent>;
    readonly duration: number | null;
    readonly mediaSourceType: MediaSourceEnum;
    readonly isStreaming: boolean;
    readonly expandedDimensions: Size;
    readonly dimensions: Size;
    readonly isScalable: boolean;
    readonly maintainAspectRatio: boolean;
    readonly type: CreativeSourceType;
    readonly id: string;
    readonly skippableOffset: FlexibleOffset;
    readonly apiFramework: string;
}