// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { IObject } from "./IObject";
import { MailBodyType } from "./MailBodyType";

export interface IMailBody extends IObject {
    body: string;
    metadata: string;
    method: string;
    truncated: boolean;
    type: MailBodyType;
}