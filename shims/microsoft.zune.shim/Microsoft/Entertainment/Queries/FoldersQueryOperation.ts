// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { FolderDataset } from "./FolderDataset";
import { IFoldersQuery } from "./IFoldersQuery";
import { IFoldersQueryOperation } from "./IFoldersQueryOperation";
import { IQueryResult } from "./IQueryResult";
import { AsyncOperationProgressHandler } from "winrt/Windows/Foundation/AsyncOperationProgressHandler`2";
import { AsyncOperationWithProgressCompletedHandler } from "winrt/Windows/Foundation/AsyncOperationWithProgressCompletedHandler`2";
import { AsyncStatus } from "winrt/Windows/Foundation/AsyncStatus";
import { HResult } from "winrt/Windows/Foundation/HResult";
import { IAsyncInfo } from "winrt/Windows/Foundation/IAsyncInfo";
import { IAsyncOperationWithProgress } from "winrt/Windows/Foundation/IAsyncOperationWithProgress`2";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Queries.FoldersQueryOperation')
export class FoldersQueryOperation implements IFoldersQueryOperation, IAsyncOperationWithProgress<IQueryResult, number>, IAsyncInfo { 
    progress: AsyncOperationProgressHandler<IQueryResult, number> = null;
    completed: AsyncOperationWithProgressCompletedHandler<IQueryResult, number> = null;
    errorCode: number = null;
    id: number = null;
    status: AsyncStatus = null;
    query: IFoldersQuery = null;
    wait(): FolderDataset {
        throw new Error('FoldersQueryOperation#wait not implemented')
    }
    getResults(): IQueryResult {
        throw new Error('FoldersQueryOperation#getResults not implemented')
    }
    cancel(): void {
        console.warn('FoldersQueryOperation#cancel not implemented')
    }
    close(): void {
        console.warn('FoldersQueryOperation#close not implemented')
    }
}
