// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { PrefetchError } from "./DataServices/PrefetchError";
import { PrefetchQueryServiceOptions } from "./DataServices/PrefetchQueryServiceOptions";
import { PrefetchSubgroupProgress } from "./DataServices/PrefetchSubgroupProgress";
import { QueryServiceOptions } from "./DataServices/QueryServiceOptions";
import { QueryServiceProgress } from "./DataServices/QueryServiceProgress";
import { IDataTransform } from "./IDataTransform";
import { QueryServiceFailureHandler } from "./QueryServiceFailureHandler";
import { QueryServiceSuccessHandler } from "./QueryServiceSuccessHandler";
import { ResponseData } from "./ResponseData";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncOperationWithProgress } from "winrt/Windows/Foundation/IAsyncOperationWithProgress`2";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { AsyncAction } from "winrt/Windows/Foundation/Interop/AsyncAction";
import { AsyncOperationWithProgress } from "winrt/Windows/Foundation/Interop/AsyncOperationWithProgress`2";
import { AsyncOperation } from "winrt/Windows/Foundation/Interop/AsyncOperation`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { ConfigurationManager } from "./Configuration/ConfigurationManager";
import { DataSource } from "./Configuration/Manifest/DataSource";

@GenerateShim('Platform.QueryService')
export class QueryService implements IStringable {
    __dataSource: DataSource;
    __dataServiceId: string;
    constructor(dataServiceId: string) {
        // console.warn('QueryService.ctor not implemented')
        this.__dataServiceId = dataServiceId;
        this.__dataSource = ConfigurationManager.manifest.dataSources.getArray().find(v => v.id == dataServiceId);

        console.log(this);
    }
    static cancelPrefetch1(): void {
        console.warn('QueryService#cancelPrefetch1 not implemented')
    }
    static cancelPrefetch2(token: string): void {
        console.warn('QueryService#cancelPrefetch2 not implemented')
    }
    static clearResponseQueue(): void {
        console.warn('QueryService#clearResponseQueue not implemented')
    }
    static commitResponsesToCache(fileNames: IVector<string>): IAsyncAction {
        return AsyncAction.from(async () => console.warn('QueryService#commitResponsesToCache not implemented'));
    }
    static getPrefetchErrors(token: string): IVector<PrefetchError> {
        throw new Error('QueryService#getPrefetchErrors not implemented')
    }
    static getPrefetchProgress(token: string): IVector<PrefetchSubgroupProgress> {
        throw new Error('QueryService#getPrefetchProgress not implemented')
    }
    static isPrefetchEnabled(): boolean {
        throw new Error('QueryService#isPrefetchEnabled not implemented')
    }
    static resetPrefetchProgressCount1(): void {
        console.warn('QueryService#resetPrefetchProgressCount1 not implemented')
    }
    static resetPrefetchProgressCount2(token: string): void {
        console.warn('QueryService#resetPrefetchProgressCount2 not implemented')
    }
    static togglePrefetch(enabled: boolean): void {
        console.warn('QueryService#togglePrefetch not implemented')
    }
    afterNavigate(): void {
        console.warn('QueryService#afterNavigate not implemented')
    }
    beforeNavigate(): void {
        console.warn('QueryService#beforeNavigate not implemented')
    }
    deleteCacheEntryAsync(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>): IAsyncAction {
        return AsyncAction.from(async () => console.warn('QueryService#deleteCacheEntryAsync not implemented'));
    }
    downloadDataAsync(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>, dataTransformer: IDataTransform, queryServiceOptions: QueryServiceOptions): IAsyncOperationWithProgress<ResponseData, QueryServiceProgress> {
        return AsyncOperationWithProgress.from((async () => {
            let url = this.__dataSource.urlTemplate;
            url = url.replace(/{(\w+)}/g, (m, s) => {
                s = s.toLowerCase();

                if (urlParameters.hasKey(s))
                    return urlParameters[s];
                return s;
            });

            console.log(url);
            let resp = await fetch(url);
            let responseData = new ResponseData();
            responseData.contentType = resp.headers.get("Content-Type");
            responseData.dataString = await resp.text();

            return responseData;
        }));
    }
    entryHash(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>): string {
        throw new Error('QueryService#entryHash not implemented')
    }
    fetchDataAsync1(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>): IAsyncOperationWithProgress<ResponseData, QueryServiceProgress> {
        return AsyncOperationWithProgress.from(async () => { throw new Error('QueryService#fetchDataAsync1 not implemented') });
    }
    fetchDataAsync2(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>, dataTransformer: IDataTransform): IAsyncOperationWithProgress<ResponseData, QueryServiceProgress> {
        return AsyncOperationWithProgress.from(async () => { throw new Error('QueryService#fetchDataAsync2 not implemented') });
    }
    fetchDataAsync3(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>, dataTransformer: IDataTransform, bypassCache: boolean): IAsyncOperationWithProgress<ResponseData, QueryServiceProgress> {
        return AsyncOperationWithProgress.from(async () => { throw new Error('QueryService#fetchDataAsync3 not implemented') });
    }
    fetchDataAsync4(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>, dataTransformer: IDataTransform, bypassCache: boolean, networkTimeout: number): IAsyncOperationWithProgress<ResponseData, QueryServiceProgress> {
        return AsyncOperationWithProgress.from(async () => { throw new Error('QueryService#fetchDataAsync4 not implemented') });
    }
    getAllQueryServiceLogs(): string {
        throw new Error('QueryService#getAllQueryServiceLogs not implemented')
    }
    getCacheID(): string {
        throw new Error('QueryService#getCacheID not implemented')
    }
    getDefaultExpiry(): number {
        throw new Error('QueryService#getDefaultExpiry not implemented')
    }
    getEnableFlag(): boolean {
        throw new Error('QueryService#getEnableFlag not implemented')
    }
    getID(): string {
        throw new Error('QueryService#getID not implemented')
    }
    getQueryServiceLogByName(token: string): string {
        throw new Error('QueryService#getQueryServiceLogByName not implemented')
    }
    getUrl(urlParameters: IMap<string, string>): string {
        throw new Error('QueryService#getUrl not implemented')
    }
    hasEntryAsync(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>): IAsyncOperation<boolean> {
        return AsyncOperation.from(async () => { throw new Error('QueryService#hasEntryAsync not implemented') });
    }
    isEntryExpiredAsync(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>): IAsyncOperation<boolean> {
        return AsyncOperation.from(async () => { throw new Error('QueryService#isEntryExpiredAsync not implemented') });
    }
    logProxyEntry(entry: IMap<string, string>): void {
        console.warn('QueryService#logProxyEntry not implemented')
    }
    prefetchData1(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>, prefetchQueryServiceOptions: PrefetchQueryServiceOptions): void {
        console.warn('QueryService#prefetchData1 not implemented')
    }
    prefetchData2(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>, dataTransformer: IDataTransform, prefetchQueryServiceOptions: PrefetchQueryServiceOptions, successCallback: QueryServiceSuccessHandler): void {
        console.warn('QueryService#prefetchData2 not implemented')
    }
    prefetchData3(urlParameters: IMap<string, string>, payloadParameters: IMap<string, string>, dataTransformer: IDataTransform, prefetchQueryServiceOptions: PrefetchQueryServiceOptions, successCallback: QueryServiceSuccessHandler, failureCallback: QueryServiceFailureHandler): void {
        console.warn('QueryService#prefetchData3 not implemented')
    }
    reinitalize(): void {
        console.warn('QueryService#reinitalize not implemented')
    }
    toString(): string {
        throw new Error('QueryService#toString not implemented')
    }
}
