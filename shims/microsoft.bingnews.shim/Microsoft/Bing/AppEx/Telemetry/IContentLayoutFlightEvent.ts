// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:08 2021
// </auto-generated>
// --------------------------------------------------

type ContentLayoutRegion = any
import { IFlightEvent } from "./IFlightEvent";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";

export interface IContentLayoutFlightEvent extends IFlightEvent {
    contentLayoutRegions: IVector<ContentLayoutRegion>;
}
