// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { ChunkInfo } from "./ChunkInfo";
import { IChunkIter } from "./IChunkIter";
import { IManifestStream } from "./IManifestStream";
import { IManifestTrack } from "./IManifestTrack";
import { MediaStreamType } from "./MediaStreamType";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { AsyncOperation } from "winrt/Windows/Foundation/Interop/AsyncOperation`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { IBuffer } from "winrt/Windows/Storage/Streams/IBuffer";

@GenerateShim('Microsoft.Media.AdaptiveStreaming.ManifestStream')
export class ManifestStream implements IManifestStream { 
    readonly availableTracks: IVectorView<IManifestTrack> = null;
    readonly childStreams: IVectorView<IManifestStream> = null;
    readonly displayHeight: number = null;
    readonly displayWidth: number = null;
    readonly firstInCurrentChunkList: IChunkIter = null;
    readonly language: string = null;
    readonly lastInCurrentChunkList: IChunkIter = null;
    readonly maxHeight: number = null;
    readonly maxWidth: number = null;
    readonly name: string = null;
    readonly parentStream: IManifestStream = null;
    readonly selectedTracks: IVectorView<IManifestTrack> = null;
    readonly subType: string = null;
    readonly timeScale: number = null;
    readonly type: MediaStreamType = null;
    readonly url: string = null;
    getAttribute(name: string): string {
        throw new Error('ManifestStream#getAttribute not implemented')
    }
    restrictTracks(pTracks: IVectorView<IManifestTrack>): void {
        console.warn('ManifestStream#restrictTracks not implemented')
    }
    selectTracks(pTracks: IVectorView<IManifestTrack>): void {
        console.warn('ManifestStream#selectTracks not implemented')
    }
    getIterator(minTime: number, time: number): IChunkIter {
        throw new Error('ManifestStream#getIterator not implemented')
    }
    getChunkInfoAsync(pChunkIter: IChunkIter): IAsyncOperation<ChunkInfo> {
        return AsyncOperation.from(async () => { throw new Error('ManifestStream#getChunkInfoAsync not implemented') });
    }
    getChunkDataAsync(pChunkIter: IChunkIter, pTrack: IManifestTrack): IAsyncOperation<IBuffer> {
        return AsyncOperation.from(async () => { throw new Error('ManifestStream#getChunkDataAsync not implemented') });
    }
}
