// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { IVector } from "../../Foundation/Collections/IVector`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Vector } from "../../Foundation/Interop/Vector`1";
import { SettingsCommand } from "./SettingsCommand";

@GenerateShim('Windows.UI.ApplicationSettings.SettingsPaneCommandsRequest')
export class SettingsPaneCommandsRequest { 
    applicationCommands: IVector<SettingsCommand> = new Vector<SettingsCommand>();
}