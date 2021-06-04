// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { BackgroundTransferCostPolicy } from "./BackgroundTransferCostPolicy";
import { PasswordCredential } from "../../Security/Credentials/PasswordCredential";

export interface IBackgroundTransferBase {
    costPolicy: BackgroundTransferCostPolicy;
    group: string;
    method: string;
    proxyCredential: PasswordCredential;
    serverCredential: PasswordCredential;
    setRequestHeader(headerName: string, headerValue: string): void;
}