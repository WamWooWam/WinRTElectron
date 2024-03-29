// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { MediaAvailability } from "../Platform/MediaAvailability";
import { IQuery } from "./IQuery";
import { IQueryChangedEventArgs } from "./IQueryChangedEventArgs";
import { IQueryPage } from "./IQueryPage";
import { IQueryResult } from "./IQueryResult";
import { ITVSeasonsQuery } from "./ITVSeasonsQuery";
import { TVSeasonsQueryCountOperation } from "./TVSeasonsQueryCountOperation";
import { TVSeasonsSortBy } from "./TVSeasonsSortBy";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncOperationWithProgress } from "winrt/Windows/Foundation/IAsyncOperationWithProgress`2";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IClosable } from "winrt/Windows/Foundation/IClosable";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Queries.TVSeasonsQuery')
export class TVSeasonsQuery implements ITVSeasonsQuery, IQuery, IClosable { 
    watchAll: number = null;
    tvseriesId: number = null;
    tvseasonId: number = null;
    primarySortBy: TVSeasonsSortBy = null;
    pageSize: number = null;
    mediaAvailability: MediaAvailability = null;
    groupsEnabled: number = null;
    currentPage: IQueryPage = null;
    nextPage: IQueryPage = null;
    previousPage: IQueryPage = null;
    executeAsync(): IAsyncOperationWithProgress<IQueryResult, number> {
        throw new Error('TVSeasonsQuery#executeAsync not implemented')
    }
    getCountAsync(): TVSeasonsQueryCountOperation {
        throw new Error('TVSeasonsQuery#getCountAsync not implemented')
    }
    setCursorPosition(index: number): void {
        console.warn('TVSeasonsQuery#setCursorPosition not implemented')
    }
    getGroupsAsync(): IAsyncOperationWithProgress<IQueryResult, number> {
        throw new Error('TVSeasonsQuery#getGroupsAsync not implemented')
    }
    refreshAsync(): IAsyncAction {
        throw new Error('TVSeasonsQuery#refreshAsync not implemented')
    }
    getItemIndexAsync(objectId: number): IAsyncOperation<number> {
        throw new Error('TVSeasonsQuery#getItemIndexAsync not implemented')
    }
    execute(): IAsyncOperationWithProgress<IQueryResult, number> {
        throw new Error('TVSeasonsQuery#execute not implemented')
    }
    pauseAsync(): IAsyncAction {
        throw new Error('TVSeasonsQuery#pauseAsync not implemented')
    }
    resumeAsync(): IAsyncAction {
        throw new Error('TVSeasonsQuery#resumeAsync not implemented')
    }
    close(): void {
        console.warn('TVSeasonsQuery#close not implemented')
    }

    private __queryChanged: Set<EventHandler<IQueryChangedEventArgs>> = new Set();
    @Enumerable(true)
    set onquerychanged(handler: EventHandler<IQueryChangedEventArgs>) {
        this.__queryChanged.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'querychanged':
                this.__queryChanged.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'querychanged':
                this.__queryChanged.delete(handler);
                break;
        }
    }
}
