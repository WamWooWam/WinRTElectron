// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { IArticleProvider } from "./IArticleProvider";
import { IArticle } from "./Model/IArticle";
import { QueryServicePriority } from "../../../Platform/DataServices/QueryServicePriority";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IAsyncOperationWithProgress } from "winrt/Windows/Foundation/IAsyncOperationWithProgress`2";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { AsyncOperationWithProgress } from "winrt/Windows/Foundation/Interop/AsyncOperationWithProgress`2";
import { AsyncOperation } from "winrt/Windows/Foundation/Interop/AsyncOperation`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.AzureArticleProvider')
export class AzureArticleProvider implements IArticleProvider, IStringable { 
    initializeAsync(configuration: IMap<string, string>): IAsyncOperationWithProgress<boolean, any> {
        return AsyncOperationWithProgress.from(async () => { throw new Error('AzureArticleProvider#initializeAsync not implemented') });
    }
    getArticleAsync(articleId: string): IAsyncOperationWithProgress<IArticle, any> {
        return AsyncOperationWithProgress.from(async () => { throw new Error('AzureArticleProvider#getArticleAsync not implemented') });
    }
    getCacheId(): string {
        throw new Error('AzureArticleProvider#getCacheId not implemented')
    }
    prefetchArticle1(articleId: string, priority: QueryServicePriority): IAsyncOperation<boolean> {
        return AsyncOperation.from(async () => { throw new Error('AzureArticleProvider#prefetchArticle1 not implemented') });
    }
    prefetchArticle2(articleId: string, priority: QueryServicePriority, token: string): IAsyncOperation<boolean> {
        return AsyncOperation.from(async () => { throw new Error('AzureArticleProvider#prefetchArticle2 not implemented') });
    }
    getServerArticleId(articleId: string): string {
        throw new Error('AzureArticleProvider#getServerArticleId not implemented')
    }
    toString(): string {
        throw new Error('AzureArticleProvider#toString not implemented')
    }
}
