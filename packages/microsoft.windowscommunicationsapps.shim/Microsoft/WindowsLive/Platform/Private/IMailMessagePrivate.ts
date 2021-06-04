// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:39 2021
// </auto-generated>
// --------------------------------------------------

import { BodyDownloadStatus } from "../BodyDownloadStatus";
import { CalendarMessageType } from "../CalendarMessageType";
import { IMailBody } from "../IMailBody";
import { IMailMessage } from "../IMailMessage";
import { IObject } from "../IObject";
import { MailBodyType } from "../MailBodyType";
import { MailMessageLastVerb } from "../MailMessageLastVerb";
import { IFolderPrivate } from "./IFolderPrivate";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { IRandomAccessStream } from "winrt/Windows/Storage/Streams/IRandomAccessStream";

export interface IMailMessagePrivate extends IMailMessage, IObject {
    accountId: string;
    readonly allViewIds: IVectorView<string>;
    bodyDownloadStatus: BodyDownloadStatus;
    calendarMessageType: CalendarMessageType;
    readonly conversationOpaqueId: string;
    conversationRowId: number;
    readonly displayed: Date;
    readonly draftOriginalFolderId: string;
    eventHandle: string;
    eventUID: string;
    flattenedImapUids: string;
    flattenedSyncFolderIds: string;
    from: string;
    fromEmail: string;
    fromName: string;
    fromPersonStoreId: number;
    gmailImapUniqueMessageId: string;
    hasNewsletterCategory: boolean;
    hasOrdinaryAttachments: boolean;
    hasSocialUpdateCategory: boolean;
    hasToasted: boolean;
    htmlMimeSection: string;
    readonly isDeleted: boolean;
    isFromPersonPinned: boolean;
    readonly isHiddenFromConversation: boolean;
    readonly isLocalMessage: boolean;
    keepInView: string;
    lastVerb: MailMessageLastVerb;
    mimeMessageId: string;
    mimeReferences: string;
    mimeSourceMessageId: string;
    needBody: boolean;
    readonly normalizedSubjectHash: string;
    notFoundCount: number;
    numSendRetries: number;
    readonly originalFolder: IFolderPrivate;
    readonly originalFolderId: string;
    photoMailAlbumId: string;
    photoMailAlbumUrl: string;
    photoMailAlbumWorkerId: string;
    plainTextMimeSection: string;
    preview: string;
    propertiesVersion: number;
    received: Date;
    replyTo: string;
    searchRequestId: number;
    searchSessionId: number;
    searchViewId: number;
    sender: string;
    sent: Date;
    serverConversationId: string;
    serverConversationIndex: string;
    serverLongId: string;
    serverMessageId: string;
    readonly serverUID: number;
    sourceFolderServerId: string;
    sourceHasEmbeddedAttachments: boolean;
    sourceInstanceId: Date;
    sourceItemServerId: string;
    sourceLongId: string;
    sourceMessageStoreId: string;
    sourceReplaceMime: boolean;
    sourceVerb: MailMessageLastVerb;
    readonly syncFolderIds: IVectorView<string>;
    syncStatus: number;
    systemCategories: string;
    insertSyncFolderId(value: string): void;
    removeSyncFolderId(value: string): void;
    setSyncFolderAndUid(hstrFolderId: string, uiUid: number): void;
    ensureSyncFolderValidity(): void;
    getUidInFolder(hstrFolderId: string): number;
    recordRelevanceAction(): void;
    determineIfFolderInView(): boolean;
    determineIfHiddenFromConversation(): boolean;
    removeAllTruncatableBodies(): void;
    createBody(): IMailBody;
    createMessageBodiesFromMime(hstrMime: string, fTruncated: boolean): void;
    createMessageBodyFromMime(eBodyType: MailBodyType, pStream: IRandomAccessStream, fTruncated: boolean): void;
    commitMessageNoStash(): void;
    deleteMessageNoStash(): void;
    hasAttachment(hstrFileReference: string): boolean;
    markAsPermanentSendFailure(value: number): void;
    ensureFolderUid(strFolderId: string, dwUid: number, fAddFolder: boolean): boolean;
}