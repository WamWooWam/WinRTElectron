export * from "./Windows.ApplicationModel"
export * as Foundation from "./Windows.Foundation"
export * from "./Windows.Globalization"
import * as CryptographyTemp from "./Windows.Security.Cryptography"
import * as OnlineIdTemp from "./Windows.Security.Authentication.OnlineId"
export * from "./Windows.System"
export * as Storage from "./Windows.Storage"
export * from "./Windows.Devices"
export * from "./Windows.Networking"
export * from "./Windows.Graphics"
export * from "./Windows.Media"
export * from "./Windows.Data"
import * as UITemp from "./Windows.UI"
import * as WebUITemp from "./Windows.UI.WebUI"


export namespace UI {
    export const WebUI = WebUITemp.UI.WebUI;
    export const ApplicationSettings = UITemp.UI.ApplicationSettings;
    export const ViewManagement = UITemp.UI.ViewManagement;
    export const Core = UITemp.UI.Core;
    export const Input = UITemp.UI.Input;
    export const Notifications = UITemp.UI.Notifications;
    export const Popups = UITemp.UI.Popups;
}

export namespace Security{
    export namespace Authentication {
        export const OnlineId = OnlineIdTemp.Security.Authentication.OnlineId;
    }

    export namespace ExchangeActiveSyncProvisioning {
        export class EasClientDeviceInformation {

        }
    }

    export const Cryptography = CryptographyTemp.Security.Cryptography;
}
