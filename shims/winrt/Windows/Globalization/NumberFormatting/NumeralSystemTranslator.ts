// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Globalization.NumberFormatting.NumeralSystemTranslator')
export class NumeralSystemTranslator { 
    numeralSystem: string = null;
    languages: IVectorView<string> = null;
    resolvedLanguage: string = null;
    // constructor();
    // constructor(languages: IIterable<string>);
    constructor(...args) { }
    translateNumerals(value: string): string {
        throw new Error('NumeralSystemTranslator#translateNumerals not implemented')
    }
}
