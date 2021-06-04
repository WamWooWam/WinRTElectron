// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:04 2021
// </auto-generated>
// --------------------------------------------------

import { PrintBinding } from "./PrintBinding";
import { PrintCollation } from "./PrintCollation";
import { PrintColorMode } from "./PrintColorMode";
import { PrintDuplex } from "./PrintDuplex";
import { PrintHolePunch } from "./PrintHolePunch";
import { PrintMediaSize } from "./PrintMediaSize";
import { PrintMediaType } from "./PrintMediaType";
import { PrintOrientation } from "./PrintOrientation";
import { PrintQuality } from "./PrintQuality";
import { PrintStaple } from "./PrintStaple";

export interface IPrintTaskOptionsCoreProperties {
    binding: PrintBinding;
    collation: PrintCollation;
    colorMode: PrintColorMode;
    duplex: PrintDuplex;
    holePunch: PrintHolePunch;
    maxCopies: number;
    mediaSize: PrintMediaSize;
    mediaType: PrintMediaType;
    minCopies: number;
    numberOfCopies: number;
    orientation: PrintOrientation;
    printQuality: PrintQuality;
    staple: PrintStaple;
}