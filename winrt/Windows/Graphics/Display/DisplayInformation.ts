import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { DisplayOrientations } from "./DisplayOrientations";
import { ResolutionScale } from "./ResolutionScale";
import { IRandomAccessStream } from "../../Storage/Streams/IRandomAccessStream";

@GenerateShim('Windows.Graphics.Display.DisplayInformation')
export class DisplayInformation {
    private static _instance: DisplayInformation;

    currentOrientation: DisplayOrientations = DisplayOrientations.landscape;
    logicalDpi: number = null;
    nativeOrientation: DisplayOrientations = null;
    rawDpiX: number = null;
    rawDpiY: number = null;
    resolutionScale: ResolutionScale = ResolutionScale.scale100Percent;
    stereoEnabled: boolean = null;
    static autoRotationPreferences: DisplayOrientations = null;

    getColorProfileAsync(): IAsyncOperation<IRandomAccessStream> {
        throw new Error('DisplayInformation#getColorProfileAsync not implemented')
    }

    static getForCurrentView(): DisplayInformation {
        return DisplayInformation._instance ?? (DisplayInformation._instance = new DisplayInformation());
    }

    #colorProfileChanged: Set<TypedEventHandler<DisplayInformation, any>> = new Set();
    @Enumerable(true)
    set oncolorprofilechanged(handler: TypedEventHandler<DisplayInformation, any>) {
        this.#colorProfileChanged.add(handler);
    }

    #dpiChanged: Set<TypedEventHandler<DisplayInformation, any>> = new Set();
    @Enumerable(true)
    set ondpichanged(handler: TypedEventHandler<DisplayInformation, any>) {
        this.#dpiChanged.add(handler);
    }

    #orientationChanged: Set<TypedEventHandler<DisplayInformation, any>> = new Set();
    @Enumerable(true)
    set onorientationchanged(handler: TypedEventHandler<DisplayInformation, any>) {
        this.#orientationChanged.add(handler);
    }

    #stereoEnabledChanged: Set<TypedEventHandler<DisplayInformation, any>> = new Set();
    @Enumerable(true)
    set onstereoenabledchanged(handler: TypedEventHandler<DisplayInformation, any>) {
        this.#stereoEnabledChanged.add(handler);
    }

    static __displayContentsInvalidated: Set<TypedEventHandler<DisplayInformation, any>> = new Set();
    @Enumerable(true)
    static set ondisplaycontentsinvalidated(handler: TypedEventHandler<DisplayInformation, any>) {
        DisplayInformation.__displayContentsInvalidated.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'colorprofilechanged':
                this.#colorProfileChanged.add(handler);
                break;
            case 'dpichanged':
                this.#dpiChanged.add(handler);
                break;
            case 'orientationchanged':
                this.#orientationChanged.add(handler);
                break;
            case 'stereoenabledchanged':
                this.#stereoEnabledChanged.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'colorprofilechanged':
                this.#colorProfileChanged.delete(handler);
                break;
            case 'dpichanged':
                this.#dpiChanged.delete(handler);
                break;
            case 'orientationchanged':
                this.#orientationChanged.delete(handler);
                break;
            case 'stereoenabledchanged':
                this.#stereoEnabledChanged.delete(handler);
                break;
        }
    }
    static addEventListener(name: string, handler: any) {
        switch (name) {
            case 'displaycontentsinvalidated':
                DisplayInformation.__displayContentsInvalidated.add(handler);
                break;
        }
    }

    static removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'displaycontentsinvalidated':
                DisplayInformation.__displayContentsInvalidated.delete(handler);
                break;
        }
    }
}
