// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { ScreenState } from "./ScreenState";

export interface IPageViewEvent {
    setUri(value: string): IPageViewEvent;
    setReferrerUri(value: string): IPageViewEvent;
    setPageType(value: string): IPageViewEvent;
    setPageTags(value: string): IPageViewEvent;
    setProduct(value: string): IPageViewEvent;
    setScreenState(value: ScreenState): IPageViewEvent;
    setCustomSessionGuid(value: string): IPageViewEvent;
    setImpressionGuid(value: string): IPageViewEvent;
    setContentJsonVer(value: number): IPageViewEvent;
    setExtraContent(value: string): IPageViewEvent;
    send(): void;
}