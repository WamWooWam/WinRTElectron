// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { IAccount } from "./IAccount";
import { IPluginVerb } from "./IPluginVerb";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";

export interface IPluginVerbManager {
    createVerb(hstrVerbName: string, hstrVerbParams: string): IPluginVerb;
    createVerbFromTask(hstrVerbName: string, hstrVerbParams: string, pTaskInstance: any): IPluginVerb;
    createVerbFromTaskWithContext(hstrVerbName: string, hstrVerbParams: string, pContext: any, pTaskInstance: any): IPluginVerb;
    runResourceVerb(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): void;
    runResourceVerbAsync(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): IAsyncAction;
    cancelResourceVerb(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): void;
}