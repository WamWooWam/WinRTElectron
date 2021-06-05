// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { ChunkInfo } from "./ChunkInfo";
import { IChunkIter } from "./IChunkIter";
import { IManifestTrack } from "./IManifestTrack";
import { MediaStreamType } from "./MediaStreamType";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IBuffer } from "winrt/Windows/Storage/Streams/IBuffer";

export interface IManifestStream {
    readonly availableTracks: IVectorView<IManifestTrack>;
    readonly childStreams: IVectorView<IManifestStream>;
    readonly displayHeight: number;
    readonly displayWidth: number;
    readonly firstInCurrentChunkList: IChunkIter;
    readonly language: string;
    readonly lastInCurrentChunkList: IChunkIter;
    readonly maxHeight: number;
    readonly maxWidth: number;
    readonly name: string;
    readonly parentStream: IManifestStream;
    readonly selectedTracks: IVectorView<IManifestTrack>;
    readonly subType: string;
    readonly timeScale: number;
    readonly type: MediaStreamType;
    readonly url: string;
    getAttribute(name: string): string;
    restrictTracks(pTracks: IVectorView<IManifestTrack>): void;
    selectTracks(pTracks: IVectorView<IManifestTrack>): void;
    getIterator(minTime: number, time: number): IChunkIter;
    getChunkInfoAsync(pChunkIter: IChunkIter): IAsyncOperation<ChunkInfo>;
    getChunkDataAsync(pChunkIter: IChunkIter, pTrack: IManifestTrack): IAsyncOperation<IBuffer>;
}