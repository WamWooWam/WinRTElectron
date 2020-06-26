import * as CaptureImpl from "./Windows.Media.Capture"

export namespace Media {
    export const Capture = CaptureImpl;

    export namespace PlayTo { 
        export enum PlayToConnectionError {
            none,
            deviceNotResponding,
            deviceError,
            deviceLocked,
            protectedPlaybackFailed,
        }
        export enum PlayToConnectionState {
            disconnected,
            connected,
            rendering,
        }
    }
}