// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { DataPointType } from "./DataPointType";
import { IDataPoint } from "./IDataPoint";
type IBindableIterable = any

export interface IDictionaryDataPoint extends IDataPoint, IBindableIterable {
    readonly count: number;
    readonly itemType: DataPointType;
    hasKey(key: string): boolean;
}