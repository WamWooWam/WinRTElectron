// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { IVector } from "./IVector`1";
import { VectorChangedEventHandler } from "./VectorChangedEventHandler`1";

export interface IObservableVector<T> extends IVector<T> {
    onvectorchanged: VectorChangedEventHandler<T>;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}
