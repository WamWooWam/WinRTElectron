// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { PackageVersion } from "./PackageVersion";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { ProcessorArchitecture } from "../System/ProcessorArchitecture";

@GenerateShim('Windows.ApplicationModel.PackageId')
export class PackageId {
    architecture: ProcessorArchitecture = ProcessorArchitecture.x86;
    familyName: string = null;
    fullName: string = null;
    name: string = null;
    publisher: string = null;
    publisherId: string = null;
    resourceId: string = null;
    version: PackageVersion = { major: 1, minor: 0, build: 0, revision: 0 };
}