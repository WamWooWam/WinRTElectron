// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { IBaseContact } from "./IBaseContact";
import { IObject } from "./IObject";
import { IPerson } from "./IPerson";

export interface ISearchPerson extends IObject, IBaseContact {
    savePermanently(pLinkTarget: IPerson): void;
}