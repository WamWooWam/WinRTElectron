// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { DownloaderRequest } from "./DownloaderRequest";
import { DownloaderResponse } from "./DownloaderResponse";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";

export interface IDownloaderPlugin {
    requestAsync(pDownloaderRequest: DownloaderRequest): IAsyncOperation<DownloaderResponse>;
    responseData(pDownloaderRequest: DownloaderRequest, pDownloaderResponse: DownloaderResponse): void;
}
