// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { BackgroundTransferBehavior } from "./BackgroundTransferBehavior";

@GenerateShim('Windows.Networking.BackgroundTransfer.BackgroundTransferGroup')
export class BackgroundTransferGroup { 
    transferBehavior: BackgroundTransferBehavior = null;
    name: string = null;
    static createGroup(name: string): BackgroundTransferGroup {
        throw new Error('BackgroundTransferGroup#createGroup not implemented')
    }
}
