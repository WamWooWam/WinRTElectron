import { IAsyncAction } from "./Windows.Foundation";

export enum CameraCaptureUIMaxPhotoResolution {
    highestAvailable,
    verySmallQvga,
    smallVga,
    mediumXga,
    large3M,
    veryLarge5M,
}
export enum CameraCaptureUIMaxVideoResolution {
    highestAvailable,
    lowDefinition,
    standardDefinition,
    highDefinition,
}
export enum CameraCaptureUIMode {
    photoOrVideo,
    photo,
    video,
}
export enum CameraCaptureUIPhotoFormat {
    jpeg,
    png,
    jpegXR,
}
export enum CameraCaptureUIVideoFormat {
    mp4,
    wmv,
}
export enum ForegroundActivationArgument {
    signInRequired,
    moreSettings,
}
export enum KnownVideoProfile {
    videoRecording,
    highQualityPhoto,
    balancedVideoAndPhoto,
    videoConferencing,
    photoSequence,
    highFrameRate,
    variablePhotoSequence,
    hdrWithWcgVideo,
    hdrWithWcgPhoto,
    videoHdr8,
    compressedCamera,
}
export enum MediaCaptureDeviceExclusiveControlStatus {
    exclusiveControlAvailable,
    sharedReadOnlyAvailable,
}
export enum MediaCaptureMemoryPreference {
    auto,
    cpu,
}
export enum MediaCaptureSharingMode {
    exclusiveControl,
    sharedReadOnly,
}
export enum MediaCaptureThermalStatus {
    normal,
    overheated,
}
export enum MediaCategory {
    other,
    communications,
    media,
    gameChat,
    speech,
}
export enum MediaStreamType {
    videoPreview,
    videoRecord,
    audio,
    photo,
}
export enum PhotoCaptureSource {
    auto,
    videoPreview,
    photo,
}
export enum PowerlineFrequency {
    disabled,
    fiftyHertz,
    sixtyHertz,
    auto,
}
export enum StreamingCaptureMode {
    audioAndVideo,
    audio,
    video,
}
export enum VideoDeviceCharacteristic {
    allStreamsIndependent,
    previewRecordStreamsIdentical,
    previewPhotoStreamsIdentical,
    recordPhotoStreamsIdentical,
    allStreamsIdentical,
}
export enum VideoRotation {
    none,
    clockwise90Degrees,
    clockwise180Degrees,
    clockwise270Degrees,
}

export class MediaCapture {
    initializeAsync(): IAsyncAction {
        return new IAsyncAction((res, rej) => res());
    }
}

export class MediaCaptureInitializationSettings {
    audioDeviceId: string;
    videoDeviceId: string;

    streamingCaptureMode: StreamingCaptureMode;
    photoCaptureSource: PhotoCaptureSource;
}