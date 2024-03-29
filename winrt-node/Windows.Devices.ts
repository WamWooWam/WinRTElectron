import { EventTarget, IAsyncOperation } from "./Windows.Foundation";

export namespace Devices {
    export namespace Input {
        export class TouchCapabilities {
            static touchPresent: boolean = false;
        }
    }

    export namespace Enumeration {
        export enum DeviceAccessStatus {
            unspecified,
            allowed,
            deniedByUser,
            deniedBySystem,
        }
        export enum DeviceClass {
            all,
            audioCapture,
            audioRender,
            portableStorageDevice,
            videoCapture,
            imageScanner,
            location,
        }
        export enum DeviceInformationKind {
            unknown,
            deviceInterface,
            deviceContainer,
            device,
            deviceInterfaceClass,
            associationEndpoint,
            associationEndpointContainer,
            associationEndpointService,
            devicePanel,
        }
        export enum DevicePairingKinds {
            none,
            confirmOnly,
            displayPin,
            providePin = 4,
            confirmPinMatch = 8,
            providePasswordCredential = 16,
        }
        export enum DevicePairingProtectionLevel {
            default,
            none,
            encryption,
            encryptionAndAuthentication,
        }
        export enum DevicePairingResultStatus {
            paired,
            notReadyToPair,
            notPaired,
            alreadyPaired,
            connectionRejected,
            tooManyConnections,
            hardwareFailure,
            authenticationTimeout,
            authenticationNotAllowed,
            authenticationFailure,
            noSupportedProfiles,
            protectionLevelCouldNotBeMet,
            accessDenied,
            invalidCeremonyData,
            pairingCanceled,
            operationAlreadyInProgress,
            requiredHandlerNotRegistered,
            rejectedByHandler,
            remoteDeviceHasAssociation,
            failed,
        }
        export enum DevicePickerDisplayStatusOptions {
            none,
            showProgress,
            showDisconnectButton,
            showRetryButton = 4,
        }
        export enum DeviceUnpairingResultStatus {
            unpaired,
            alreadyUnpaired,
            operationAlreadyInProgress,
            accessDenied,
            failed,
        }
        export enum DeviceWatcherEventKind {
            add,
            update,
            remove,
        }
        export enum DeviceWatcherStatus {
            created,
            started,
            enumerationCompleted,
            stopping,
            stopped,
            aborted,
        }
        export enum Panel {
            unknown,
            front,
            back,
            top,
            bottom,
            left,
            right,
        }

        export class DeviceWatcher extends EventTarget {
            class: DeviceClass;

            constructor(type: DeviceClass) {
                super();
                this.class = type;
            }

            start() {
                
            }
        }

        export class DeviceInformation {
            static async findAllAsync(type: DeviceClass) {
                return [];
            }

            static createWatcher(type: DeviceClass) {
                return new DeviceWatcher(type);
            }
        }
    }

    export namespace Geolocation {
        export interface Geoposition {

        }

        export interface PositionAccuracy {

        }

        export interface BasicGeoposition {

        }

        export interface PositionStatus {
            
        }
        
        export enum GeolocationAccessStatus {
            unspecified,
            allowed,
            denied,
        }
        export class Geolocator {
            reportInterval: number;
            movementThreshold: number;
            desiredAccuracy: PositionAccuracy;
            locationStatus: PositionStatus;
            desiredAccuracyInMeters: number | null;
            static defaultGeoposition: BasicGeoposition | null;
            static isDefaultGeopositionRecommended: Boolean;

            getGeopositionAsync(): IAsyncOperation<Geoposition> {
                throw new Error('shimmed function Geolocator.getGeopositionAsync');
            }

            getGeopositionAsync_1(maximumAge: number, timeout: number): IAsyncOperation<Geoposition> {
                throw new Error('shimmed function Geolocator.getGeopositionAsync_1');
            }

            allowFallbackToConsentlessPositions(): void {
                console.warn('shimmed function Geolocator.allowFallbackToConsentlessPositions');
            }

            static requestAccessAsync(): IAsyncOperation<GeolocationAccessStatus> {
                throw new Error('shimmed function Geolocator.requestAccessAsync');
            }

            static getGeopositionHistoryAsync(startTime: Date): IAsyncOperation<Geoposition[]> {
                throw new Error('shimmed function Geolocator.getGeopositionHistoryAsync');
            }

            static getGeopositionHistoryAsync_1(startTime: Date, duration: number): IAsyncOperation<Geoposition[]> {
                throw new Error('shimmed function Geolocator.getGeopositionHistoryAsync_1');
            }

            addEventListener(name: string, handler: Function) {
                console.warn(`Geolocator::addEventListener: ${name}`);
                switch (name) {
                    case "positionchanged": // Foundation.TypedEventHandler<Geolocator,PositionChangedEventArgs>
                    case "statuschanged": // Foundation.TypedEventHandler<Geolocator,StatusChangedEventArgs>
                        break;
                }

            }
        }
    }
}
