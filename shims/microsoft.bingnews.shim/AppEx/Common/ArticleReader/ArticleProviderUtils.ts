import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.ArticleProviderUtils')
export class ArticleProviderUtils implements IStringable { 
    toString(): string {
        throw new Error('ArticleProviderUtils#toString not implemented')
    }
}
