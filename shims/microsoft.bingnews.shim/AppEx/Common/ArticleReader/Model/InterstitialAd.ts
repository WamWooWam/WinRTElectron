// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { IArticle } from "./IArticle";
import { IArticleInfo } from "./IArticleInfo";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.Model.InterstitialAd')
export class InterstitialAd implements IArticle, IStringable { 
    nextArticle: IArticleInfo = null;
    previousArticle: IArticleInfo = null;
    metadata: IArticleInfo = null;
    toString(): string {
        throw new Error('InterstitialAd#toString not implemented')
    }
}
