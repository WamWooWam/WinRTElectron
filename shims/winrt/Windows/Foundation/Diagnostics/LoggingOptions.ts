// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Wed Sep 15 17:20:14 2021
// </auto-generated>
// --------------------------------------------------

import { LoggingOpcode } from "./LoggingOpcode";
import { GenerateShim } from "../Interop/GenerateShim";

@GenerateShim('Windows.Foundation.Diagnostics.LoggingOptions')
export class LoggingOptions { 
    task: number = null;
    tags: number = null;
    relatedActivityId: string = null;
    opcode: LoggingOpcode = null;
    keywords: number = null;
    activityId: string = null;
    // constructor();
    // constructor(keywords: number);
    constructor(...args) { }
}
