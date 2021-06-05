// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:08 2021
// </auto-generated>
// --------------------------------------------------

type ContentItem = any
import { ContentSource } from "./ContentSource";
import { IFlightEvent } from "./IFlightEvent";

export interface IContentErrorFlightEvent extends IFlightEvent {
    contentErrorItem: ContentItem;
    contentErrorSource: ContentSource;
    contentErrorUri: string;
    contentErrorMessage: string;
    contentErrorHttpCode: number;
    contentErrorException: string;
    contentErrorLatency: number;
}