// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { Size } from "../../../Foundation/Size";
import { Color } from "../../Color";
import { PenTipShape } from "./PenTipShape";

@GenerateShim('Windows.UI.Input.Inking.InkDrawingAttributes')
export class InkDrawingAttributes { 
    size: Size = null;
    penTip: PenTipShape = null;
    ignorePressure: boolean = null;
    fitToCurve: boolean = null;
    color: Color = null;
}