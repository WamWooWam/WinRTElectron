// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IShellTemplate } from "./IShellTemplate";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Instrumentation.Providers.ShellTemplate')
export class ShellTemplate implements IShellTemplate { 
    eventEnabled(eventIndex: number): number {
        throw new Error('ShellTemplate#eventEnabled not implemented')
    }
    traceTemplate_z(_MCGEN_EventIndex: number, moniker: string): void {
        console.warn('ShellTemplate#traceTemplate_z not implemented')
    }
    traceTemplateEventDescriptor(_MCGEN_EventIndex: number): void {
        console.warn('ShellTemplate#traceTemplateEventDescriptor not implemented')
    }
    traceTemplate_zzz(_MCGEN_EventIndex: number, pageMoniker: string, hubMoniker: string, panelMoniker: string): void {
        console.warn('ShellTemplate#traceTemplate_zzz not implemented')
    }
    traceTemplate_tz(_MCGEN_EventIndex: number, result: boolean, message: string): void {
        console.warn('ShellTemplate#traceTemplate_tz not implemented')
    }
    traceTemplate_dz(_MCGEN_EventIndex: number, id: number, message: string): void {
        console.warn('ShellTemplate#traceTemplate_dz not implemented')
    }
    traceTemplate_zz(_MCGEN_EventIndex: number, value: string, source: string): void {
        console.warn('ShellTemplate#traceTemplate_zz not implemented')
    }
    traceTemplate_q(_MCGEN_EventIndex: number, durationMsec: number): void {
        console.warn('ShellTemplate#traceTemplate_q not implemented')
    }
    traceTemplate_zq(_MCGEN_EventIndex: number, name: string, durationMsec: number): void {
        console.warn('ShellTemplate#traceTemplate_zq not implemented')
    }
}