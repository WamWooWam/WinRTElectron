// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IShipAssertProvider } from "./IShipAssertProvider";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Infrastructure.ShipAssertProvider')
export class ShipAssertProvider implements IShipAssertProvider { 
    shipAssert(area: string, __function: string, callStack: string, message: string, parameter: number): void {
        console.error(`[${area}]::${__function}: ${message} \n ${callStack}`, parameter)
    }
}