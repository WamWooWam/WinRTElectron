// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { PointerDevice } from "../../Devices/Input/PointerDevice";
import { IVector } from "../../Foundation/Collections/IVector`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Point } from "../../Foundation/Point";
import { IPointerPointTransform } from "./IPointerPointTransform";
import { PointerPointProperties } from "./PointerPointProperties";

// @GenerateShim('Windows.UI.Input.PointerPoint')
export class PointerPoint {
    frameId: number = null;
    isInContact: boolean = null;
    pointerDevice: PointerDevice = null;
    pointerId: number = null;
    position: Point = null;
    properties: PointerPointProperties = null;
    rawPosition: Point = null;
    timestamp: number = null;

    static x: number = 0;
    static y: number = 0;
    static isLeftDown: boolean = true;
    static isRightDown: boolean = true;

    static init() {
        document.addEventListener("mousemove", (e) => {
            if (!!!document.documentElement) return;

            PointerPoint.x = e.pageX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
            PointerPoint.y = e.pageY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        })

        document.addEventListener("mousedown", (e) => {
            this.isLeftDown = true;
        });

        document.addEventListener("mouseup", (e) => {
            this.isLeftDown = false;
        });
    }

    static getCurrentPoint(pointerId: number): PointerPoint {
        var pointerPoint = new PointerPoint();
        pointerPoint.pointerId = pointerId;
        pointerPoint.rawPosition = { x: PointerPoint.x, y: PointerPoint.y };
        pointerPoint.timestamp = Date.now();
        pointerPoint.properties = new PointerPointProperties()
        pointerPoint.properties.isLeftButtonPressed = PointerPoint.isLeftDown;
        pointerPoint.properties.isRightButtonPressed = PointerPoint.isRightDown;

        return pointerPoint;
    }

    static getIntermediatePoints(pointerId: number): IVector<PointerPoint> {
        throw new Error('PointerPoint#getIntermediatePoints not implemented')
    }
    static getCurrentPointTransformed(pointerId: number, transform: IPointerPointTransform): PointerPoint {
        throw new Error('PointerPoint#getCurrentPointTransformed not implemented')
    }
    static getIntermediatePointsTransformed(pointerId: number, transform: IPointerPointTransform): IVector<PointerPoint> {
        throw new Error('PointerPoint#getIntermediatePointsTransformed not implemented')
    }
}

PointerPoint.init();