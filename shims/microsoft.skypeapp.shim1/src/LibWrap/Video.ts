export class Video {
    static orientation_TRANSPOSE_MASK: number = 4;
    static orientation_FLIP_V_MASK: number = 2;
    static orientation_FLIP_H_MASK: number = 1;
    static orientation_TRANSPOSE_FLIP_H_V: number = 7;
    static orientation_TRANSPOSE_FLIP_V: number = 6;
    static orientation_TRANSPOSE_FLIP_H: number = 5;
    static orientation_TRANSPOSE: number = 4;
    static orientation_FLIP_H_V: number = 3;
    static orientation_FLIP_V: number = 2;
    static orientation_FLIP_H: number = 1;
    static orientation_NONE: number = 0;
    static video_DEVICE_CAPABILITY_VIDEOCAP_USB_HIGHSPEED: number = 3;
    static video_DEVICE_CAPABILITY_VIDEOCAP_REQ_DRIVERUPDATE: number = 2;
    static video_DEVICE_CAPABILITY_VIDEOCAP_HQ_CERTIFIED: number = 1;
    static video_DEVICE_CAPABILITY_VIDEOCAP_HQ_CAPABLE: number = 0;
    static mediatype_MEDIA_VIDEO: number = 0;
    static mediatype_MEDIA_SCREENSHARING: number = 1;
    static status_UNATTACHED: number = 13;
    static status_SWITCHING_DEVICE: number = 12;
    static status_CHECKING_SUBSCRIPTION: number = 11;
    static status_UNKNOWN: number = 9;
    static status_HINT_IS_VIDEOCALL_RECEIVED: number = 8;
    static status_NOT_STARTED: number = 7;
    static status_PAUSED: number = 6;
    static status_STOPPING: number = 5;
    static status_RUNNING: number = 4;
    static status_REJECTED: number = 3;
    static status_STARTING: number = 2;
    static status_AVAILABLE: number = 1;
    static status_NOT_AVAILABLE: number = 0;
    static setupkey_VIDEO_ADVERTPOLICY: string = 'Lib/Video/AdvertPolicy';
    static setupkey_VIDEO_RECVPOLICY: string = 'Lib/Video/RecvPolicy';
    static setupkey_VIDEO_DISABLE: string = '*Lib/Video/Disable';
    static setupkey_VIDEO_AUTOSEND: string = 'Lib/Video/AutoSend';
    static setupkey_VIDEO_DEVICE_PATH: string = 'Lib/Video/DevicePath';
    static setupkey_VIDEO_DEVICE: string = 'Lib/Video/Device';

    getObjectID(): number {
        throw new Error('shimmed function Video.getObjectID');
    }

    getDbID(): number {
        throw new Error('shimmed function Video.getDbID');
    }

    getStrProperty(propKey: number): string {
        throw new Error('shimmed function Video.getStrProperty');
    }

    getStrPropertyWithXmlStripped(propKey: number): string {
        throw new Error('shimmed function Video.getStrPropertyWithXmlStripped');
    }

    getIntProperty(propKey: number): number {
        throw new Error('shimmed function Video.getIntProperty');
    }

    setExtendedStrProperty(propKey: number, value: string): void {
        console.warn('shimmed function Video.setExtendedStrProperty');
    }

    setExtendedIntProperty(propKey: number, value: number): void {
        console.warn('shimmed function Video.setExtendedIntProperty');
    }

    start(): void {
        console.warn('shimmed function Video.start');
    }

    stop(): void {
        console.warn('shimmed function Video.stop');
    }

    setIncomingTransmissionsDesired(desire: Boolean): void {
        console.warn('shimmed function Video.setIncomingTransmissionsDesired');
    }

    setScreenCaptureRectangle(x0: number, y0: number, width: number, height: number, monitorNumber: number, windowHandle: number): void {
        console.warn('shimmed function Video.setScreenCaptureRectangle');
    }

    setRemoteRendererId(id: number): void {
        console.warn('shimmed function Video.setRemoteRendererId');
    }

    setVideoConsumptionProperties(renderedWidth: number, renderedHeight: number): void {
        console.warn('shimmed function Video.setVideoConsumptionProperties');
    }

    getCurrentVideoDevice(): VideoGetCurrentVideoDeviceResult {
        throw new Error('shimmed function Video.getCurrentVideoDevice');
    }

    discard(): void {
        console.warn('shimmed function Video.discard');
    }

    getVideoSrc(): string {
        throw new Error('shimmed function Video.getVideoSrc');
    }

    getVideoDeviceHandle(): string {
        throw new Error('shimmed function Video.getVideoDeviceHandle');
    }

    getAspectRatio(): number {
        throw new Error('shimmed function Video.getAspectRatio');
    }

    getOrientation(): number {
        throw new Error('shimmed function Video.getOrientation');
    }

    getWidth(): number {
        throw new Error('shimmed function Video.getWidth');
    }

    getHeight(): number {
        throw new Error('shimmed function Video.getHeight');
    }

    setVisible(visible: Boolean): Boolean {
        throw new Error('shimmed function Video.setVisible');
    }

    close(): void {
        console.warn('shimmed function Video.close');
    }

    static statustoString(val: number): string {
        throw new Error('shimmed function Video.statustoString');
    }

    static mediatypetoString(val: number): string {
        throw new Error('shimmed function Video.mediatypetoString');
    }

    static video_DEVICE_CAPABILITYToString(val: number): string {
        throw new Error('shimmed function Video.video_DEVICE_CAPABILITYToString');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`Video::addEventListener: ${name}`);
        switch (name) {
            case "propertychange": // OnPropertyChangeType
            case "lastframecapture": // OnLastFrameCaptureType
            case "capturerequestcompleted": // OnCaptureRequestCompletedType
                break;
        }

    }
}

export class VideoGetCurrentVideoDeviceResult {
    devicePath: string;
    deviceName: string;
    mediatype: number;
}