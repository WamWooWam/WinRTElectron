// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../../Foundation/Collections/IIterable`1";
import { IIterator } from "../../../Foundation/Collections/IIterator`1";
import { IVectorView } from "../../../Foundation/Collections/IVectorView`1";
import { IVector } from "../../../Foundation/Collections/IVector`1";
import { IStringable } from "../../../Foundation/IStringable";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { HttpChallengeHeaderValue } from "./HttpChallengeHeaderValue";

@GenerateShim('Windows.Web.Http.Headers.HttpChallengeHeaderValueCollection')
export class HttpChallengeHeaderValueCollection implements IVector<HttpChallengeHeaderValue>, IIterable<HttpChallengeHeaderValue>, IStringable { 
    size: number = null;
    [Symbol.iterator](): Iterator<HttpChallengeHeaderValue> {
        return null;
    }
    parseAdd(input: string): void {
        console.warn('HttpChallengeHeaderValueCollection#parseAdd not implemented')
    }
    tryParseAdd(input: string): boolean {
        throw new Error('HttpChallengeHeaderValueCollection#tryParseAdd not implemented')
    }
    getAt(index: number): HttpChallengeHeaderValue {
        throw new Error('HttpChallengeHeaderValueCollection#getAt not implemented')
    }
    getView(): IVectorView<HttpChallengeHeaderValue> {
        throw new Error('HttpChallengeHeaderValueCollection#getView not implemented')
    }
    setAt(index: number, value: HttpChallengeHeaderValue): void {
        console.warn('HttpChallengeHeaderValueCollection#setAt not implemented')
    }
    insertAt(index: number, value: HttpChallengeHeaderValue): void {
        console.warn('HttpChallengeHeaderValueCollection#insertAt not implemented')
    }
    removeAt(index: number): void {
        console.warn('HttpChallengeHeaderValueCollection#removeAt not implemented')
    }
    append(value: HttpChallengeHeaderValue): void {
        console.warn('HttpChallengeHeaderValueCollection#append not implemented')
    }
    removeAtEnd(): void {
        console.warn('HttpChallengeHeaderValueCollection#removeAtEnd not implemented')
    }
    clear(): void {
        console.warn('HttpChallengeHeaderValueCollection#clear not implemented')
    }
    getMany(startIndex: number): { returnValue: number, items: HttpChallengeHeaderValue[] } {
        throw new Error('HttpChallengeHeaderValueCollection#getMany not implemented')
    }
    replaceAll(items: HttpChallengeHeaderValue[]): void {
        console.warn('HttpChallengeHeaderValueCollection#replaceAll not implemented')
    }
    first(): IIterator<HttpChallengeHeaderValue> {
        throw new Error('HttpChallengeHeaderValueCollection#first not implemented')
    }
    toString(): string {
        throw new Error('HttpChallengeHeaderValueCollection#toString not implemented')
    }
}