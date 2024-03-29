// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { AsyncOperation, IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { PushNotificationChannel } from "./PushNotificationChannel";

@GenerateShim('Windows.Networking.PushNotifications.PushNotificationChannelManager')
export class PushNotificationChannelManager { 
    static createPushNotificationChannelForApplicationAsync(): IAsyncOperation<PushNotificationChannel> {
        // throw new Error('PushNotificationChannelManager#createPushNotificationChannelForApplicationAsync not implemented')
        return AsyncOperation.from(async () => {
            return new PushNotificationChannel();
        });
    }
    static createPushNotificationChannelForApplicationAsyncWithId(applicationId: string): IAsyncOperation<PushNotificationChannel> {
        throw new Error('PushNotificationChannelManager#createPushNotificationChannelForApplicationAsyncWithId not implemented')
    }
    static createPushNotificationChannelForSecondaryTileAsync(tileId: string): IAsyncOperation<PushNotificationChannel> {
        throw new Error('PushNotificationChannelManager#createPushNotificationChannelForSecondaryTileAsync not implemented')
    }
}
