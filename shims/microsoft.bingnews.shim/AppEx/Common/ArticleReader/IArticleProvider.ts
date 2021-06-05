// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { IArticle } from "./Model/IArticle";
import { QueryServicePriority } from "../../../Platform/DataServices/QueryServicePriority";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IAsyncOperationWithProgress } from "winrt/Windows/Foundation/IAsyncOperationWithProgress`2";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";

export interface IArticleProvider {
    initializeAsync(configuration: IMap<string, string>): IAsyncOperationWithProgress<boolean, any>;
    getArticleAsync(articleId: string): IAsyncOperationWithProgress<IArticle, any>;
    getCacheId(): string;
    prefetchArticle1(articleId: string, priority: QueryServicePriority): IAsyncOperation<boolean>;
    prefetchArticle2(articleId: string, priority: QueryServicePriority, token: string): IAsyncOperation<boolean>;
}