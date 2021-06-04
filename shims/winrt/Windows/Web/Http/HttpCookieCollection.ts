// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:10 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IIterator } from "../../Foundation/Collections/IIterator`1";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { HttpCookie } from "./HttpCookie";

@GenerateShim('Windows.Web.Http.HttpCookieCollection')
export class HttpCookieCollection implements IVectorView<HttpCookie>, IIterable<HttpCookie> { 
    [Symbol.iterator](): Iterator<HttpCookie> {
        return null;
    }
    size: number = null;
    getAt(index: number): HttpCookie {
        throw new Error('HttpCookieCollection#getAt not implemented')
    }
    getMany(startIndex: number): { returnValue: number, items: HttpCookie[] } {
        throw new Error('HttpCookieCollection#getMany not implemented')
    }
    first(): IIterator<HttpCookie> {
        throw new Error('HttpCookieCollection#first not implemented')
    }
}