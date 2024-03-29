// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { ActivationKind } from "./ActivationKind";
import { ApplicationExecutionState } from "./ApplicationExecutionState";
import { IActivatedEventArgs } from "./IActivatedEventArgs";
import { IApplicationViewActivatedEventArgs } from "./IApplicationViewActivatedEventArgs";
import { IFileActivatedEventArgs } from "./IFileActivatedEventArgs";
import { IFileActivatedEventArgsWithNeighboringFiles } from "./IFileActivatedEventArgsWithNeighboringFiles";
import { SplashScreen } from "./SplashScreen";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IStorageItem } from "../../Storage/IStorageItem";
import { StorageFileQueryResult } from "../../Storage/Search/StorageFileQueryResult";

@GenerateShim('Windows.ApplicationModel.Activation.FileActivatedEventArgs')
export class FileActivatedEventArgs implements IFileActivatedEventArgs, IActivatedEventArgs, IFileActivatedEventArgsWithNeighboringFiles, IApplicationViewActivatedEventArgs { 
    kind: ActivationKind = null;
    previousExecutionState: ApplicationExecutionState = null;
    splashScreen: SplashScreen = null;
    currentlyShownApplicationViewId: number = null;
    files: IVectorView<IStorageItem> = null;
    verb: string = null;
    neighboringFilesQuery: StorageFileQueryResult = null;
}
