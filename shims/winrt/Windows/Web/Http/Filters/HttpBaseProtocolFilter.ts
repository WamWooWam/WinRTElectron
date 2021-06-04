// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { IVector } from "../../../Foundation/Collections/IVector`1";
import { IAsyncOperationWithProgress } from "../../../Foundation/IAsyncOperationWithProgress`2";
import { IClosable } from "../../../Foundation/IClosable";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { PasswordCredential } from "../../../Security/Credentials/PasswordCredential";
import { Certificate } from "../../../Security/Cryptography/Certificates/Certificate";
import { ChainValidationResult } from "../../../Security/Cryptography/Certificates/ChainValidationResult";
import { HttpCacheControl } from "./HttpCacheControl";
import { IHttpFilter } from "./IHttpFilter";
import { HttpCookieManager } from "../HttpCookieManager";
import { HttpProgress } from "../HttpProgress";
import { HttpRequestMessage } from "../HttpRequestMessage";
import { HttpResponseMessage } from "../HttpResponseMessage";

@GenerateShim('Windows.Web.Http.Filters.HttpBaseProtocolFilter')
export class HttpBaseProtocolFilter implements IHttpFilter, IClosable { 
    useProxy: boolean = null;
    serverCredential: PasswordCredential = null;
    proxyCredential: PasswordCredential = null;
    maxConnectionsPerServer: number = null;
    clientCertificate: Certificate = null;
    automaticDecompression: boolean = null;
    allowUI: boolean = null;
    allowAutoRedirect: boolean = null;
    cacheControl: HttpCacheControl = null;
    cookieManager: HttpCookieManager = null;
    ignorableServerCertificateErrors: IVector<ChainValidationResult> = null;
    sendRequestAsync(request: HttpRequestMessage): IAsyncOperationWithProgress<HttpResponseMessage, HttpProgress> {
        throw new Error('HttpBaseProtocolFilter#sendRequestAsync not implemented')
    }
    close(): void {
        console.warn('HttpBaseProtocolFilter#close not implemented')
    }
}