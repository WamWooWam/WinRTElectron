// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { MediaAvailability } from "../Platform/MediaAvailability";
import { IQueryResult } from "./IQueryResult";
import { TVSeasonsQueryCountOperation } from "./TVSeasonsQueryCountOperation";
import { TVSeasonsSortBy } from "./TVSeasonsSortBy";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncOperationWithProgress } from "winrt/Windows/Foundation/IAsyncOperationWithProgress`2";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";

export interface ITVSeasonsQuery {
    groupsEnabled: number;
    mediaAvailability: MediaAvailability;
    pageSize: number;
    primarySortBy: TVSeasonsSortBy;
    tvseasonId: number;
    tvseriesId: number;
    watchAll: number;
    executeAsync(): IAsyncOperationWithProgress<IQueryResult, number>;
    getCountAsync(): TVSeasonsQueryCountOperation;
    setCursorPosition(index: number): void;
    getGroupsAsync(): IAsyncOperationWithProgress<IQueryResult, number>;
    refreshAsync(): IAsyncAction;
    getItemIndexAsync(objectId: number): IAsyncOperation<number>;
}