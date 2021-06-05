// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { ApplyUpdate } from "./ApplyUpdate";
import { IPersonalizedData } from "./IPersonalizedData";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncOperationWithProgress } from "winrt/Windows/Foundation/IAsyncOperationWithProgress`2";

export interface IPersonalDataService {
    readAsync2(bypassCache: boolean): IAsyncOperationWithProgress<IPersonalizedData, IPersonalizedData>;
    readAsync1(): IAsyncOperationWithProgress<IPersonalizedData, IPersonalizedData>;
    scheduleUpdate(updateDelegate: ApplyUpdate, customParams: any[]): void;
    updateAsync(updateDelegate: ApplyUpdate, customParams: any[]): IAsyncAction;
}
