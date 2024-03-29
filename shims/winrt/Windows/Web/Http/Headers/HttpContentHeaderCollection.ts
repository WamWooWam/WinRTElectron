// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../../Foundation/Collections/IIterable`1";
import { IIterator } from "../../../Foundation/Collections/IIterator`1";
import { IKeyValuePair } from "../../../Foundation/Collections/IKeyValuePair`2";
import { IMapView } from "../../../Foundation/Collections/IMapView`2";
import { IMap } from "../../../Foundation/Collections/IMap`2";
import { DateTime } from "../../../Foundation/DateTime";
import { IStringable } from "../../../Foundation/IStringable";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { Uri } from "../../../Foundation/Uri";
import { IBuffer } from "../../../Storage/Streams/IBuffer";
import { HttpContentCodingHeaderValueCollection } from "./HttpContentCodingHeaderValueCollection";
import { HttpContentDispositionHeaderValue } from "./HttpContentDispositionHeaderValue";
import { HttpContentRangeHeaderValue } from "./HttpContentRangeHeaderValue";
import { HttpLanguageHeaderValueCollection } from "./HttpLanguageHeaderValueCollection";
import { HttpMediaTypeHeaderValue } from "./HttpMediaTypeHeaderValue";

@GenerateShim('Windows.Web.Http.Headers.HttpContentHeaderCollection')
export class HttpContentHeaderCollection implements IMap<string, string>, IIterable<IKeyValuePair<string, string>>, IStringable { 
    [Symbol.iterator]() {
        return null;
    }

    size: number = null;
    lastModified: Date | null = null;
    expires: Date | null = null;
    contentType: HttpMediaTypeHeaderValue = null;
    contentRange: HttpContentRangeHeaderValue = null;
    contentMD5: IBuffer = null;
    contentLocation: Uri = null;
    contentLength: number | null = null;
    contentDisposition: HttpContentDispositionHeaderValue = null;
    contentEncoding: HttpContentCodingHeaderValueCollection = null;
    contentLanguage: HttpLanguageHeaderValueCollection = null;
    append(name: string, value: string): void {
        console.warn('HttpContentHeaderCollection#append not implemented')
    }
    tryAppendWithoutValidation(name: string, value: string): boolean {
        throw new Error('HttpContentHeaderCollection#tryAppendWithoutValidation not implemented')
    }
    lookup(key: string): string {
        throw new Error('HttpContentHeaderCollection#lookup not implemented')
    }
    hasKey(key: string): boolean {
        throw new Error('HttpContentHeaderCollection#hasKey not implemented')
    }
    getView(): IMapView<string, string> {
        throw new Error('HttpContentHeaderCollection#getView not implemented')
    }
    insert(key: string, value: string): boolean {
        throw new Error('HttpContentHeaderCollection#insert not implemented')
    }
    remove(key: string): void {
        console.warn('HttpContentHeaderCollection#remove not implemented')
    }
    clear(): void {
        console.warn('HttpContentHeaderCollection#clear not implemented')
    }
    first(): IIterator<IKeyValuePair<string, string>> {
        throw new Error('HttpContentHeaderCollection#first not implemented')
    }
    toString(): string {
        throw new Error('HttpContentHeaderCollection#toString not implemented')
    }
}
