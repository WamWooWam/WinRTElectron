// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { Condition } from "./Condition";
import { Source } from "./Source";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.Trigger')
export class Trigger implements IStringable { 
    readonly startConditions: IVector<Condition> = null;
    readonly endConditions: IVector<Condition> = null;
    readonly sources: IVector<Source> = null;
    id: string = null;
    description: string = null;
    toString(): string {
        throw new Error('Trigger#toString not implemented')
    }
}
