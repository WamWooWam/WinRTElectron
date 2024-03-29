// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { IPlaylistItemsQuery } from "./IPlaylistItemsQuery";
import { IPlaylistItemsQueryOperation } from "./IPlaylistItemsQueryOperation";
import { IQueryResult } from "./IQueryResult";
import { PlaylistContentDataset } from "./PlaylistContentDataset";
import { AsyncOperationProgressHandler } from "winrt/Windows/Foundation/AsyncOperationProgressHandler`2";
import { AsyncOperationWithProgressCompletedHandler } from "winrt/Windows/Foundation/AsyncOperationWithProgressCompletedHandler`2";
import { AsyncStatus } from "winrt/Windows/Foundation/AsyncStatus";
import { HResult } from "winrt/Windows/Foundation/HResult";
import { IAsyncInfo } from "winrt/Windows/Foundation/IAsyncInfo";
import { IAsyncOperationWithProgress } from "winrt/Windows/Foundation/IAsyncOperationWithProgress`2";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Queries.PlaylistItemsQueryGroupsOperation')
export class PlaylistItemsQueryGroupsOperation implements IPlaylistItemsQueryOperation, IAsyncOperationWithProgress<IQueryResult, number>, IAsyncInfo { 
    progress: AsyncOperationProgressHandler<IQueryResult, number> = null;
    completed: AsyncOperationWithProgressCompletedHandler<IQueryResult, number> = null;
    errorCode: number = null;
    id: number = null;
    status: AsyncStatus = null;
    query: IPlaylistItemsQuery = null;
    wait(): PlaylistContentDataset {
        throw new Error('PlaylistItemsQueryGroupsOperation#wait not implemented')
    }
    getResults(): IQueryResult {
        throw new Error('PlaylistItemsQueryGroupsOperation#getResults not implemented')
    }
    cancel(): void {
        console.warn('PlaylistItemsQueryGroupsOperation#cancel not implemented')
    }
    close(): void {
        console.warn('PlaylistItemsQueryGroupsOperation#close not implemented')
    }
}
