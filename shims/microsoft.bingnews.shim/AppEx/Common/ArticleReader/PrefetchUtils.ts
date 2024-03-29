// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { QueryServicePriority } from "../../../Platform/DataServices/QueryServicePriority";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.PrefetchUtils')
export class PrefetchUtils implements IStringable { 
    static prefetchArticle1(articleId: string, priority: QueryServicePriority, providerString: string, providerConfiguration: IMap<string, string>): void {
        console.warn('PrefetchUtils#prefetchArticle1 not implemented')
    }
    static prefetchArticle2(articleId: string, priority: QueryServicePriority, providerString: string, providerConfiguration: IMap<string, string>, token: string): void {
        console.warn('PrefetchUtils#prefetchArticle2 not implemented')
    }
    toString(): string {
        throw new Error('PrefetchUtils#toString not implemented')
    }
}
