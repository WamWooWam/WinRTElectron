// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { HidCollection } from "./HidCollection";
import { HidReportType } from "./HidReportType";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Devices.HumanInterfaceDevice.HidNumericControlDescription')
export class HidNumericControlDescription { 
    hasNull: boolean = null;
    id: number = null;
    isAbsolute: boolean = null;
    logicalMaximum: number = null;
    logicalMinimum: number = null;
    parentCollections: IVectorView<HidCollection> = null;
    physicalMaximum: number = null;
    physicalMinimum: number = null;
    reportCount: number = null;
    reportId: number = null;
    reportSize: number = null;
    reportType: HidReportType = null;
    unit: number = null;
    unitExponent: number = null;
    usageId: number = null;
    usagePage: number = null;
}
