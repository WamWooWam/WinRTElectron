// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../../Foundation/Collections/IIterable`1";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { Point } from "../../../Foundation/Point";
import { InkDrawingAttributes } from "./InkDrawingAttributes";
import { InkStroke } from "./InkStroke";
import { PointerPoint } from "../PointerPoint";

@GenerateShim('Windows.UI.Input.Inking.InkStrokeBuilder')
export class InkStrokeBuilder { 
    beginStroke(pointerPoint: PointerPoint): void {
        console.warn('InkStrokeBuilder#beginStroke not implemented')
    }
    appendToStroke(pointerPoint: PointerPoint): PointerPoint {
        throw new Error('InkStrokeBuilder#appendToStroke not implemented')
    }
    endStroke(pointerPoint: PointerPoint): InkStroke {
        throw new Error('InkStrokeBuilder#endStroke not implemented')
    }
    createStroke(points: IIterable<Point>): InkStroke {
        throw new Error('InkStrokeBuilder#createStroke not implemented')
    }
    setDefaultDrawingAttributes(drawingAttributes: InkDrawingAttributes): void {
        console.warn('InkStrokeBuilder#setDefaultDrawingAttributes not implemented')
    }
}