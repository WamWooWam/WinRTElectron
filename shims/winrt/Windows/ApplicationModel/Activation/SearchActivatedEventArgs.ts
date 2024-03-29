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
import { ISearchActivatedEventArgs } from "./ISearchActivatedEventArgs";
import { ISearchActivatedEventArgsWithLinguisticDetails } from "./ISearchActivatedEventArgsWithLinguisticDetails";
import { SplashScreen } from "./SplashScreen";
import { SearchPaneQueryLinguisticDetails } from "../Search/SearchPaneQueryLinguisticDetails";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Activation.SearchActivatedEventArgs')
export class SearchActivatedEventArgs implements ISearchActivatedEventArgs, IActivatedEventArgs, IApplicationViewActivatedEventArgs, ISearchActivatedEventArgsWithLinguisticDetails { 
    language: string = null;
    queryText: string = null;
    linguisticDetails: SearchPaneQueryLinguisticDetails = null;
    currentlyShownApplicationViewId: number = null;
    kind: ActivationKind = null;
    previousExecutionState: ApplicationExecutionState = null;
    splashScreen: SplashScreen = null;
}
