import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { DisplayOrientations } from "./DisplayOrientations";
import { DisplayPropertiesEventHandler } from "./DisplayPropertiesEventHandler";
import { ResolutionScale } from "./ResolutionScale";
import { IRandomAccessStream } from "../../Storage/Streams/IRandomAccessStream";

@GenerateShim('Windows.Graphics.Display.DisplayProperties')
export class DisplayProperties { 
    static autoRotationPreferences: DisplayOrientations = null;
    static currentOrientation: DisplayOrientations = null;
    static logicalDpi: number = null;
    static nativeOrientation: DisplayOrientations = null;
    static resolutionScale: ResolutionScale = ResolutionScale.scale100Percent;
    static stereoEnabled: boolean = null;

    static getColorProfileAsync(): IAsyncOperation<IRandomAccessStream> {
        throw new Error('DisplayProperties#getColorProfileAsync not implemented')
    }

    static __colorProfileChanged: Set<DisplayPropertiesEventHandler> = new Set();
    @Enumerable(true)
    static set oncolorprofilechanged(handler: DisplayPropertiesEventHandler) {
        DisplayProperties.__colorProfileChanged.add(handler);
    }

    static __displayContentsInvalidated: Set<DisplayPropertiesEventHandler> = new Set();
    @Enumerable(true)
    static set ondisplaycontentsinvalidated(handler: DisplayPropertiesEventHandler) {
        DisplayProperties.__displayContentsInvalidated.add(handler);
    }

    static __logicalDpiChanged: Set<DisplayPropertiesEventHandler> = new Set();
    @Enumerable(true)
    static set onlogicaldpichanged(handler: DisplayPropertiesEventHandler) {
        DisplayProperties.__logicalDpiChanged.add(handler);
    }

    static __orientationChanged: Set<DisplayPropertiesEventHandler> = new Set();
    @Enumerable(true)
    static set onorientationchanged(handler: DisplayPropertiesEventHandler) {
        DisplayProperties.__orientationChanged.add(handler);
    }

    static __stereoEnabledChanged: Set<DisplayPropertiesEventHandler> = new Set();
    @Enumerable(true)
    static set onstereoenabledchanged(handler: DisplayPropertiesEventHandler) {
        DisplayProperties.__stereoEnabledChanged.add(handler);
    }

    static addEventListener(name: string, handler: any) {
        switch (name) {
            case 'colorprofilechanged':
                DisplayProperties.__colorProfileChanged.add(handler);
                break;
            case 'displaycontentsinvalidated':
                DisplayProperties.__displayContentsInvalidated.add(handler);
                break;
            case 'logicaldpichanged':
                DisplayProperties.__logicalDpiChanged.add(handler);
                break;
            case 'orientationchanged':
                DisplayProperties.__orientationChanged.add(handler);
                break;
            case 'stereoenabledchanged':
                DisplayProperties.__stereoEnabledChanged.add(handler);
                break;
        }
    }

    static removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'colorprofilechanged':
                DisplayProperties.__colorProfileChanged.delete(handler);
                break;
            case 'displaycontentsinvalidated':
                DisplayProperties.__displayContentsInvalidated.delete(handler);
                break;
            case 'logicaldpichanged':
                DisplayProperties.__logicalDpiChanged.delete(handler);
                break;
            case 'orientationchanged':
                DisplayProperties.__orientationChanged.delete(handler);
                break;
            case 'stereoenabledchanged':
                DisplayProperties.__stereoEnabledChanged.delete(handler);
                break;
        }
    }
}
