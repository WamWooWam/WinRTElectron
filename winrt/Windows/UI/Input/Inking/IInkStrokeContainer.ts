// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../../Foundation/Collections/IIterable`1";
import { IVectorView } from "../../../Foundation/Collections/IVectorView`1";
import { IAsyncActionWithProgress } from "../../../Foundation/IAsyncActionWithProgress`1";
import { IAsyncOperationWithProgress } from "../../../Foundation/IAsyncOperationWithProgress`2";
import { Point } from "../../../Foundation/Point";
import { Rect } from "../../../Foundation/Rect";
import { IInputStream } from "../../../Storage/Streams/IInputStream";
import { IOutputStream } from "../../../Storage/Streams/IOutputStream";
import { InkRecognitionResult } from "./InkRecognitionResult";
import { InkStroke } from "./InkStroke";

export interface IInkStrokeContainer {
    boundingRect: Rect;
    addStroke(stroke: InkStroke): void;
    deleteSelected(): Rect;
    moveSelected(translation: Point): Rect;
    selectWithPolyLine(polyline: IIterable<Point>): Rect;
    selectWithLine(from: Point, to: Point): Rect;
    copySelectedToClipboard(): void;
    pasteFromClipboard(position: Point): Rect;
    canPasteFromClipboard(): boolean;
    loadAsync(inputStream: IInputStream): IAsyncActionWithProgress<number>;
    saveAsync(outputStream: IOutputStream): IAsyncOperationWithProgress<number, number>;
    updateRecognitionResults(recognitionResults: IVectorView<InkRecognitionResult>): void;
    getStrokes(): IVectorView<InkStroke>;
    getRecognitionResults(): IVectorView<InkRecognitionResult>;
}