// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:08 2021
// </auto-generated>
// --------------------------------------------------

import { ContentClear } from "./ContentClear";
type ContentItem = any
import { ContentSource } from "./ContentSource";
import { IFlightEvent } from "./IFlightEvent";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";

export interface IContentFlightEvent extends IFlightEvent {
    contentClear: ContentClear;
    contentSources: IVector<ContentSource>;
    contentItems: IVector<ContentItem>;
}
