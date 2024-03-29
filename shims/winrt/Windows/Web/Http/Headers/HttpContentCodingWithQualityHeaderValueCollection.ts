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
import { HttpContentCodingWithQualityHeaderValue } from "./HttpContentCodingWithQualityHeaderValue";

@GenerateShim('Windows.Web.Http.Headers.HttpContentCodingWithQualityHeaderValueCollection')
export class HttpContentCodingWithQualityHeaderValueCollection implements IVector<HttpContentCodingWithQualityHeaderValue>, IIterable<HttpContentCodingWithQualityHeaderValue>, IStringable { 
    size: number = null;
    [Symbol.iterator](): Iterator<HttpContentCodingWithQualityHeaderValue> {
        return null;
    }
    parseAdd(input: string): void {
        console.warn('HttpContentCodingWithQualityHeaderValueCollection#parseAdd not implemented')
    }
    tryParseAdd(input: string): boolean {
        throw new Error('HttpContentCodingWithQualityHeaderValueCollection#tryParseAdd not implemented')
    }
    getAt(index: number): HttpContentCodingWithQualityHeaderValue {
        throw new Error('HttpContentCodingWithQualityHeaderValueCollection#getAt not implemented')
    }
    getView(): IVectorView<HttpContentCodingWithQualityHeaderValue> {
        throw new Error('HttpContentCodingWithQualityHeaderValueCollection#getView not implemented')
    }
    setAt(index: number, value: HttpContentCodingWithQualityHeaderValue): void {
        console.warn('HttpContentCodingWithQualityHeaderValueCollection#setAt not implemented')
    }
    insertAt(index: number, value: HttpContentCodingWithQualityHeaderValue): void {
        console.warn('HttpContentCodingWithQualityHeaderValueCollection#insertAt not implemented')
    }
    removeAt(index: number): void {
        console.warn('HttpContentCodingWithQualityHeaderValueCollection#removeAt not implemented')
    }
    append(value: HttpContentCodingWithQualityHeaderValue): void {
        console.warn('HttpContentCodingWithQualityHeaderValueCollection#append not implemented')
    }
    removeAtEnd(): void {
        console.warn('HttpContentCodingWithQualityHeaderValueCollection#removeAtEnd not implemented')
    }
    clear(): void {
        console.warn('HttpContentCodingWithQualityHeaderValueCollection#clear not implemented')
    }
    getMany(startIndex: number): { returnValue: number, items: HttpContentCodingWithQualityHeaderValue[] } {
        throw new Error('HttpContentCodingWithQualityHeaderValueCollection#getMany not implemented')
    }
    replaceAll(items: HttpContentCodingWithQualityHeaderValue[]): void {
        console.warn('HttpContentCodingWithQualityHeaderValueCollection#replaceAll not implemented')
    }
    first(): IIterator<HttpContentCodingWithQualityHeaderValue> {
        throw new Error('HttpContentCodingWithQualityHeaderValueCollection#first not implemented')
    }
    toString(): string {
        throw new Error('HttpContentCodingWithQualityHeaderValueCollection#toString not implemented')
    }
}
