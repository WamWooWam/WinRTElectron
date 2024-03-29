// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { WebAccountProvider } from "./WebAccountProvider";
import { WebAccountState } from "./WebAccountState";

@GenerateShim('Windows.Security.Credentials.WebAccount')
export class WebAccount { 
    state: WebAccountState = null;
    userName: string = null;
    webAccountProvider: WebAccountProvider = null;
    constructor(webAccountProvider: WebAccountProvider, userName: string, state: WebAccountState) {
        console.warn('WebAccount.ctor not implemented')
    }
}
