// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { ISmsBinaryMessage } from "./ISmsBinaryMessage";
import { ISmsMessage } from "./ISmsMessage";
import { SmsDataFormat } from "./SmsDataFormat";
import { SmsEncoding } from "./SmsEncoding";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { DateTime } from "../../Foundation/DateTime";

export interface ISmsTextMessage extends ISmsMessage {
    body: string;
    encoding: SmsEncoding;
    from: string;
    partCount: number;
    partNumber: number;
    partReferenceId: number;
    timestamp: Date;
    to: string;
    toBinaryMessages(format: SmsDataFormat): IVectorView<ISmsBinaryMessage>;
}
