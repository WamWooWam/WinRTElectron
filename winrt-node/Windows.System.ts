/// <ref src="Windows.Globalisation.ts"/>
import { Globalization } from "./Windows.Globalization"
import { Foundation } from "./Windows";
import { IAsyncOperation, Uri } from "./Windows.Foundation";
import { StorageFile } from "./Windows.Storage.FileSystem";
import { UI } from "./Windows.UI";
import { shell } from "electron";
const os = require ("os");

export namespace System {
    export namespace UserProfile {
        export class GlobalizationPreferences {
            static weekStartsOn = Globalization.DayOfWeek.monday;
            static homeGeographicRegion = "en";

            static get languages() {
                return new Foundation.Collections.Vector(["en-GB"])
            }
        }

        export class UserInformation {
            static getDisplayNameAsync(): IAsyncOperation<string> {
                return new IAsyncOperation((resolve, reject) => resolve(os.userInfo().username));
            }
        }
    }

    export namespace Profile {

        export class HardwareToken {

            constructor() {
                let encoder = new TextEncoder();
                this.id = encoder.encode(navigator.userAgent);
            }

            id: Uint8Array;
        }

        export class HardwareIdentification {
            static getPackageSpecificToken(buff) {
                return new HardwareToken();
            }
        }
    }

    export class LauncherOptions {
        contentType: string;
        desiredRemainingView: UI.ViewManagement.ViewSizePreference;
        displayApplicationPicker: boolean;
        fallbackUri: Uri;
        preferredApplicationDisplayName: string;
        preferredApplicationPackageFamilyName: string;
        treatAsUntrusted: boolean;
        ui: LauncherUIOptions = new LauncherUIOptions();
    }

    export class LauncherUIOptions {

    }

    export class Launcher {
        static launchFileAsync(file: StorageFile): IAsyncOperation<boolean> {
            return Launcher.launchFileWithOptionsAsync(file, null);
        }

        static launchFileWithOptionsAsync(file: StorageFile, options: LauncherOptions): IAsyncOperation<boolean> {
            console.log(`request to launch ${file.path}...`);

            return new IAsyncOperation((resolve, reject) => {
                resolve(true);
            })
        }

        static launchUriAsync(uri: Uri): IAsyncOperation<boolean> {
            return Launcher.launchUriWithOptionsAsync(uri, null);
        }

        static launchUriWithOptionsAsync(uri: Uri, options: LauncherOptions): IAsyncOperation<boolean> {
            console.log(`launching ${uri}...`);

            return new IAsyncOperation((resolve, reject) => {
                shell.openExternal(uri.toString()).then(() => resolve(true));
            })
        }

    }

    export enum ProcessorArchitecture {
        x86,
        arm = 5,
        x64 = 9,
        neutral = 11,
        unknown = 65535
    }
}