// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:39 2021
// </auto-generated>
// --------------------------------------------------

import { ICollection } from "../ICollection";
import { IFolder } from "../IFolder";
import { IObject } from "../IObject";
import { FolderPriority } from "./FolderPriority";

export interface IFolderPrivate extends IFolder, IObject {
    accountName: string;
    color: number;
    readonly folderPriority: FolderPriority;
    hasProcessedConversations: boolean;
    hasSynced: boolean;
    hidden: boolean;
    inferiorsDisabled: boolean;
    internalFolderType: string;
    readonly isLocalMailFolder: boolean;
    isPurgeNeeded: boolean;
    lastOptions: string;
    lastPassId: number;
    parentFolderId: number;
    readonly parentFolderPrivate: IFolderPrivate;
    permission: string;
    readonly pinned: boolean;
    purgeNow: boolean;
    selectionDisabled: boolean;
    serverFolderId: string;
    sourceId: string;
    readonly syncFolderContents: boolean;
    syncKey: string;
    syncStatus: number;
    uidValidity: number;
    underDeletedItems: boolean;
    viewed: boolean;
    getChildFolderCollection(fAllTypes: boolean): ICollection;
    setNewParentFolderPath(value: string): void;
    commitNoStash(): void;
    deleteObjectNoStash(): void;
    commitFromServer(): void;
    deleteObjectFromServer(): void;
    deleteAllDescendants(): void;
    deleteObjectFromPurge(): void;
}
