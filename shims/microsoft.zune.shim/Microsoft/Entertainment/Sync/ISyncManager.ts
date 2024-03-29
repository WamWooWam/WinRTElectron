// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { IBlockSyncOperation } from "./IBlockSyncOperation";
import { RequestSyncOption } from "./RequestSyncOption";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";

export interface ISyncManager {
    requestSync(requestSyncOption: RequestSyncOption): void;
    syncAsync(requestSyncOption: RequestSyncOption): IAsyncAction;
    blockSyncAsync(): IAsyncOperation<IBlockSyncOperation>;
    requestOfflineStoreUpdate(): void;
    oncollectionsyncend: EventHandler<IVectorView<number>>;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}
