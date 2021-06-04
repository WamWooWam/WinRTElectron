// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { FilterCriteria } from "./FilterCriteria";
import { ICollection } from "./ICollection";
import { IMailView } from "./IMailView";
import { IObject } from "./IObject";
import { ITransientObjectHolder } from "./ITransientObjectHolder";
import { MailViewType } from "./MailViewType";
import { ObjectChangedHandler } from "./ObjectChangedHandler";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { PlatformObject } from "./PlatformObject";
import { Folder } from "./Folder";
import { Collection } from "./Collection";
import { DefaultAccount } from "./Account";
import { FolderType } from "./FolderType";

@GenerateShim('Microsoft.WindowsLive.Platform.MailView')
export class MailView extends PlatformObject implements IMailView {

    constructor(id: string, type: MailViewType) {
        super("MailView", true, false);
        this.objectId = id;
        this.type = type;
        this.isPinnedToNavPane = true;
        this.notificationCount = 0;
        this.canChangePinState = true;
        this.sourceObject = new Folder(this);
    }

    objectId: string;
    lastActiveTimeStamp: Date = null;
    readonly accountId: string = null;
    readonly canChangePinState: boolean = null;
    readonly canServerSearch: boolean = null;
    readonly isEnabled: boolean = null;
    readonly isPinnedToNavPane: boolean = null;
    readonly notificationCount: number = null;
    readonly sourceObject: IObject = null;
    readonly startScreenTileId: string = null;
    readonly type: MailViewType = null;
    getMessages(filter: FilterCriteria): ICollection {
        // throw new Error('MailView#getMessages not implemented')
        return new Collection();
    }
    getConversations(filter: FilterCriteria): ICollection {
        // throw new Error('MailView#getConversations not implemented')
        return new Collection();
    }
    getLaunchArguments(messageObjectId: string): string {
        // throw new Error('MailView#getLaunchArguments not implemented')
        return "";
    }
    clearUnseenMessages(): void {
        console.warn('MailView#clearUnseenMessages not implemented')
    }
    pinToNavPane(fPin: boolean): void {
        console.warn('MailView#pinToNavPane not implemented')
    }
    setEnabled(fEnabled: boolean): void {
        console.warn('MailView#setEnabled not implemented')
    }
    setStartScreenTileId(hstrTileId: string, hstrLaunchArguments: string, fUpdateVersion: boolean): void {
        console.warn('MailView#setStartScreenTileId not implemented')
    }
}