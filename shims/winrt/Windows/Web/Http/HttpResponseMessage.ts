// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { IClosable } from "../../Foundation/IClosable";
import { IStringable } from "../../Foundation/IStringable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { HttpResponseHeaderCollection } from "./Headers/HttpResponseHeaderCollection";
import { HttpRequestMessage } from "./HttpRequestMessage";
import { HttpResponseMessageSource } from "./HttpResponseMessageSource";
import { HttpStatusCode } from "./HttpStatusCode";
import { HttpVersion } from "./HttpVersion";
import { IHttpContent } from "./IHttpContent";

@GenerateShim('Windows.Web.Http.HttpResponseMessage')
export class HttpResponseMessage implements IClosable, IStringable { 
    version: HttpVersion = null;
    statusCode: HttpStatusCode = null;
    source: HttpResponseMessageSource = null;
    requestMessage: HttpRequestMessage = null;
    reasonPhrase: string = null;
    content: IHttpContent = null;
    headers: HttpResponseHeaderCollection = null;
    isSuccessStatusCode: boolean = null;
    // constructor();
    // constructor(statusCode: HttpStatusCode);
    constructor(...args) { }
    ensureSuccessStatusCode(): HttpResponseMessage {
        throw new Error('HttpResponseMessage#ensureSuccessStatusCode not implemented')
    }
    close(): void {
        console.warn('HttpResponseMessage#close not implemented')
    }
    toString(): string {
        throw new Error('HttpResponseMessage#toString not implemented')
    }
}
