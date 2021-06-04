// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Media.PlayReadyClient 255.255.255.255 at Wed Mar 31 18:10:04 2021
// </auto-generated>
// --------------------------------------------------

import { IPlayReadyDomain } from "./IPlayReadyDomain";
import { IIterator } from "winrt/Windows/Foundation/Collections/IIterator`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.PlayReadyClient.PlayReadyDomainIterator')
export class PlayReadyDomainIterator implements IIterator<IPlayReadyDomain> { 
    current: IPlayReadyDomain = null;
    hasCurrent: boolean = null;
    moveNext(): boolean {
        throw new Error('PlayReadyDomainIterator#moveNext not implemented')
    }
    getMany(): { returnValue: number, items: IPlayReadyDomain[] } {
        throw new Error('PlayReadyDomainIterator#getMany not implemented')
    }
}