// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { UssdMessage } from "./UssdMessage";
import { UssdResultCode } from "./UssdResultCode";

@GenerateShim('Windows.Networking.NetworkOperators.UssdReply')
export class UssdReply { 
    message: UssdMessage = null;
    resultCode: UssdResultCode = null;
}
