// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { IAccountManager } from "./IAccountManager";
import { IConfigManager } from "./IConfigManager";
import { IDisposable } from "./IDisposable";
import { IFolderManager } from "./IFolderManager";
import { IMailManager } from "./IMailManager";
import { IPeopleManager } from "./IPeopleManager";
import { IPluginVerbManager } from "./IPluginVerbManager";

export interface IClient extends IDisposable {
    readonly accountManager: IAccountManager;
    readonly calendarManager: any;
    readonly configManager: IConfigManager;
    readonly folderManager: IFolderManager;
    readonly invitesManager: any;
    readonly mailManager: IMailManager;
    readonly peopleManager: IPeopleManager;
    readonly pluginVerbManager: IPluginVerbManager;
}