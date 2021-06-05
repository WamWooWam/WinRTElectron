// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Platform.Utilities.EndOfLifeManager')
export class EndOfLifeManager implements IStringable { 
    static readonly instance: EndOfLifeManager = null;
    readonly endOfLifeStartDate: Date = null;
    readonly endOfLifeAdvanceNoticeStartDate: Date = null;
    isEndOfLife(): boolean {
        throw new Error('EndOfLifeManager#isEndOfLife not implemented')
    }
    runEndOfLifeAdvanceNoticeCheck(): void {
        console.warn('EndOfLifeManager#runEndOfLifeAdvanceNoticeCheck not implemented')
    }
    toString(): string {
        throw new Error('EndOfLifeManager#toString not implemented')
    }
}
