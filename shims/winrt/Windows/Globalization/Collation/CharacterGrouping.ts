// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

// @GenerateShim('Windows.Globalization.Collation.CharacterGrouping')
export class CharacterGrouping { 
    constructor(char: string) {
        this.first = char;
        this.label = char.toUpperCase();
    }

    first: string = null;
    label: string = null;
}
