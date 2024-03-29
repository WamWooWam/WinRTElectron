// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:39 2021
// </auto-generated>
// --------------------------------------------------

import { IAccountServerConnectionSettings } from "./IAccountServerConnectionSettings";
import { IObject } from "./IObject";
import { ISmtpAccountSettings } from "./ISmtpAccountSettings";
import { ITransientObjectHolder } from "./ITransientObjectHolder";
import { ObjectChangedHandler } from "./ObjectChangedHandler";
import { ServerType } from "./ServerType";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { PlatformObject } from "./PlatformObject";
import { uuidv4 } from "winrt/Windows/Foundation/Interop/Utils";

@GenerateShim('Microsoft.WindowsLive.Platform.SmtpAccountSettings')
export class SmtpAccountSettings extends PlatformObject implements IAccountServerConnectionSettings, ISmtpAccountSettings { 
    constructor() {
        super("AccountSettings");
        this.serverType = ServerType.smtp;            
        this.server = "smtp.gmail.com";
        this.port = 465;
        this.userId = uuidv4();
        this.domain = "smtp.gmail.com";  
    }

    userId: string = null;
    useSsl: boolean = null;
    supportsOAuth: boolean = null;
    server: string = null;
    port: number = null;
    ignoreServerCertificateUnknownCA: boolean = null;
    ignoreServerCertificateMismatchedDomain: boolean = null;
    ignoreServerCertificateExpired: boolean = null;
    domain: string = null;
    readonly hasPasswordCookie: boolean = null;
    readonly serverType: ServerType = null;
    readonly supportsAdvancedProperties: boolean = null;
    usesMailCredentials: boolean = null;
    serverRequiresLogin: boolean = null;
    addSentItemsToSentFolder: boolean = null;
    setPasswordCookie(cookie: string): void {
        console.warn('SmtpAccountSettings#setPasswordCookie not implemented')
    }   
}
