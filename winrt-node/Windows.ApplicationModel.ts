// <ref src="Windows.Foundation.ts"/>

import { EventTarget, IAsyncOperation } from "./Windows.Foundation";
import { isInWWA, getCurrentPackageName } from "./util";
import * as fs from "fs"
import * as path from "path"
import * as _ from 'lodash'
import { ipcRenderer } from "electron";
import * as ContactsImpl from "./Windows.ApplicationModel.Contacts"

const { remote } = require("electron");
const supportedLanguages = ["en-gb", "en-us", "en", "generic"]; // this should be detected from the system. KEEP IN SYNC WITH index.ts!!

export class ResourceLoader {
    private static loader: ResourceLoader;
    private languages: Map<string, any>;

    constructor(packageName: string = null) {
        try {
            this.languages = new Map();
            let basePath = path.join(remote.app.getAppPath(), "packages", packageName ?? ApplicationModel.Package.current.id.name, "resources");

            for (const language of supportedLanguages) {
                let filePath = path.join(basePath, language + ".json");
                if (fs.existsSync(filePath)) {
                    let parsedLanguage = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                    this.languages.set(language, parsedLanguage);
                }
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    get languageMap(): Map<string, any> {
        return this.languages ?? (this.languages = new Map());
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

        for (const language of this.languages) {
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

        console.debug(`resources:got string ${string} for ${resource}`);
        return string;
    }
}

const Loader = ResourceLoader;

export namespace ApplicationModel {

    export const Contacts = ContactsImpl;

    export namespace Resources {
        export const ResourceLoader = Loader;

        export namespace Core {
            export class ResourceMap {
                private __baseObject: any;

                constructor(baseObject?: any) {
                    if (!baseObject) {
                        baseObject = {};

                        let basePath = path.join(remote.app.getAppPath(), "packages", ApplicationModel.Package.current.id.name, "resources");
                        for (const language of supportedLanguages) {
                            let filePath = path.join(basePath, language + ".json");
                            if (fs.existsSync(filePath)) {
                                let parsedLanguage = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                                _.merge(baseObject, parsedLanguage);
                            }
                        }
                    }

                    this.__baseObject = baseObject;

                    return Object.assign(this, this.__baseObject);
                }

                getSubtree(tree: string) {
                    return new ResourceMap(this[tree]);
                }

                getValue(key: string) {
                    var splits = key.split("/");
                    var name = splits[splits.length - 1];
                    var subsplits = splits.slice(0, splits.length - 1);
                    if (subsplits.length == 0) {
                        subsplits = ["resources"];
                    }

                    let string = null;
                    let json = this.__baseObject;
                    for (const split of subsplits) {
                        if (json === undefined || split == null || split == "")
                            continue;

                        json = json[split];
                    }

                    string = json[name];
                    console.log(`resources:got string ${string} for ${key}`);
                    return string;
                }

                first() {
                    return { hasCurrent: false };
                }
            }

            export class ResourceManager {
                private static _current: ResourceManager;

                static get current(): ResourceManager {
                    return ResourceManager._current ?? (ResourceManager._current = new ResourceManager());
                }

                mainResourceMap: ResourceMap;
                appResourceMaps: Map<string, ResourceMap>;

                constructor() {
                    this.mainResourceMap = new ResourceMap();
                }
            }

            export class ResourceContext {
                static getForCurrentView() {
                    return new ResourceContext();
                }

                qualifierValues: any = {};
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

        export class SplashScreen extends EventTarget {
            constructor() {
                super();

                ipcRenderer.once("splash-screen-dismissed", () => {
                    this.dispatchEvent(new CustomEvent("dismissed"));
                });
            }
        }
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

    export namespace Search {
        export class LocalContentSuggestionSettings {
            enabled: Boolean;
            aqsFilter: string;
            locations: any[];
            propertiesToMatch: string[];
        }

        export class SearchPane {
            showOnKeyboardInput: Boolean;
            searchHistoryEnabled: Boolean;
            searchHistoryContext: string;
            placeholderText: string;
            language: string;
            queryText: string;
            visible: Boolean;

            setLocalContentSuggestionSettings(settings: LocalContentSuggestionSettings): void {
                console.warn('shimmed function SearchPane.setLocalContentSuggestionSettings');
            }

            show(): void {
                console.warn('shimmed function SearchPane.show');
            }

            showWithQuery(query: string): void {
                console.warn('shimmed function SearchPane.show_1');
            }

            trySetQueryText(query: string): Boolean {
                throw new Error('shimmed function SearchPane.trySetQueryText');
            }

            static hideThisApplication(): void {
                console.warn('shimmed function SearchPane.hideThisApplication');
            }

            static getForCurrentView(): SearchPane {
                return new SearchPane();
            }

            addEventListener(name: string, handler: Function) {
                console.warn(`SearchPane::addEventListener: ${name}`);
                switch (name) {
                    case "querychanged": // Foundation.TypedEventHandler<SearchPane,SearchPaneQueryChangedEventArgs>
                    case "querysubmitted": // Foundation.TypedEventHandler<SearchPane,SearchPaneQuerySubmittedEventArgs>
                    case "resultsuggestionchosen": // Foundation.TypedEventHandler<SearchPane,SearchPaneResultSuggestionChosenEventArgs>
                    case "suggestionsrequested": // Foundation.TypedEventHandler<SearchPane,SearchPaneSuggestionsRequestedEventArgs>
                    case "visibilitychanged": // Foundation.TypedEventHandler<SearchPane,SearchPaneVisibilityChangedEventArgs>
                        break;
                }

            }
        }
    }

    export namespace Store {

        export class LicenseInformation extends EventTarget {
            get isTrial(): boolean {
                return false;
            }

            get isActive(): boolean {
                return true;
            }
        }

        export class CurrentApp {
            static getAppReceiptAsync(): IAsyncOperation<string> {
                return new IAsyncOperation((resolve, reject) => resolve("fuck"));
            }

            static get licenseInformation() {
                return new LicenseInformation();
            }

            static addEventListener(event: string, handler: any) {
                console.warn("CurrentApp::addEventListener " + event)
            }
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
            this.name = getCurrentPackageName();
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