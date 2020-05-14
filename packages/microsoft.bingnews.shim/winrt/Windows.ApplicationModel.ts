// <ref src="Windows.Foundation.ts"/>

import { EventTarget } from "./Windows.Foundation";
import { isInWWA } from "./util";

export namespace ApplicationModel {
    export namespace Resources {
        export class ResourceLoader {
            private static loader: ResourceLoader;
            private static languages: Map<string, any>;
            private count: number;

            constructor() {
                this.count = 0;
            }

            get languageMap(): Map<string, any> {
                return ResourceLoader.languages ?? (ResourceLoader.languages = new Map());
            }

            static getForCurrentView() {
                if (ResourceLoader.loader === undefined) {
                    ResourceLoader.loader = new ResourceLoader();
                }

                return ResourceLoader.loader;
            }

            static getForViewIndependentUse() {
                if (ResourceLoader.loader === undefined) {
                    ResourceLoader.loader = new ResourceLoader();
                }

                return ResourceLoader.loader;
            }

            getString(resource: string): string {
                var splits = resource.split("/");
                var name = splits[splits.length - 1];
                var subsplits = splits.slice(0, splits.length - 1);
                if (subsplits.length == 0) {
                    subsplits = ["resources"];
                }

                let string = null;

                for (const language of ResourceLoader.languages) {
                    if (string != null)
                        break;

                    let json = language[1];
                    for (const split of subsplits) {
                        if (json === undefined || split == null || split == "")
                            continue;

                        json = json[split];
                    }

                    if (json === undefined)
                        continue;

                    string = json[name];
                }

                console.log(`resources:got string ${string} for ${resource}`);
                return string;
            }
        }
    }
    export namespace Activation {
        export enum ActivationKind {
            launch,
            search,
            shareTarget,
            file,
            protocol,
            fileOpenPicker,
            fileSavePicker,
            cachedFileUpdater,
            contactPicker,
            device,
            printTaskSettings,
            cameraSettings,
            restrictedLaunch,
            appointmentsProvider,
            contact,
            lockScreenCall,
            voiceCommand,
            lockScreen,
            pickerReturned = 1000,
            walletAction,
            pickFileContinuation,
            pickSaveFileContinuation,
            pickFolderContinuation,
            webAuthenticationBrokerContinuation,
            webAccountProvider,
            componentUI,
            protocolForResults = 1009,
            toastNotification,
            print3DWorkflow,
            dialReceiver,
            devicePairing,
            userDataAccountsProvider,
            filePickerExperience,
            lockScreenComponent,
            contactPanel,
            printWorkflowForegroundTask,
            gameUIProvider,
            startupTask,
            commandLineLaunch,
            barcodeScannerProvider,
        }
        export enum ApplicationExecutionState {
            notRunning,
            running,
            suspended,
            terminated,
            closedByUser,
        }

        // export class SplashScreen {

        // }
    }

    export namespace Background {
        export enum BackgroundAccessStatus {
            unspecified,
            allowedWithAlwaysOnRealTimeConnectivity,
            allowedMayUseActiveRealTimeConnectivity,
            denied,
            alwaysAllowed,
            allowedSubjectToSystemPolicy,
            deniedBySystemPolicy,
            deniedByUser,
        }

        export class TimeTrigger { }
        export class SystemTrigger { }
        export class MaintenanceTrigger { }
        export class PushNotificationTrigger { }

        export class SystemCondition { }

        export class BackgroundTaskBuilder { }
        export class BackgroundTaskRegistration { }

        export enum SystemConditionType {
            internetAvailable
        }

        export enum SystemTriggerType {
            onlineIdConnectedStateChange
        }

        export class BackgroundExecutionManager {
            static getAccessStatus(): BackgroundAccessStatus {
                return BackgroundAccessStatus.deniedBySystemPolicy;
            }
        }
    }

    export namespace DataTransfer {
        export class DataTransferManager extends EventTarget {
            public static getForCurrentView() {
                return new DataTransferManager();
            }
        }

        export enum StandardDataFormats {
            text,
            uri,
            webLink
        }
    }

    export type PackageVersion = {
        build: number,
        major: number,
        minor: number,
        revision: number,
    }

    export class PackageId {
        constructor(version: PackageVersion) {
            this.version = version;
            var getUrl = isInWWA() ? location.pathname.split("/")[1] : location.hostname;
            console.log(getUrl);        
            this.name = getUrl;
        }

        public readonly version: PackageVersion;
        public readonly name: string;
    }

    export class Package {
        public static get current(): Package {
            return new Package(new PackageId({ major: 17, minor: 5, build: 9600, revision: 22013 }))
        }

        constructor(id: PackageId) {
            this.id = id;
        }

        public readonly id: PackageId;
    }
}