// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { BodyDownloadStatus } from "./BodyDownloadStatus";
import { CalendarMessageType } from "./CalendarMessageType";
import { ICollection } from "./ICollection";
import { IMailAttachment } from "./IMailAttachment";
import { IMailBody } from "./IMailBody";
import { IMailView } from "./IMailView";
import { IObject } from "./IObject";
import { IRecipient } from "./IRecipient";
import { MailBodyType } from "./MailBodyType";
import { MailFolderType } from "./MailFolderType";
import { MailMessageImportance } from "./MailMessageImportance";
import { MailMessageLastVerb } from "./MailMessageLastVerb";
import { OutboxQueue } from "./OutboxQueue";
import { SanitizedVersion } from "./SanitizedVersion";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IRandomAccessStream } from "winrt/Windows/Storage/Streams/IRandomAccessStream";

export interface IMailMessage extends IObject {
    accountId: string;
    allowExternalImages: boolean;
    bcc: string;
    readonly bccRecipients: IVector<IRecipient>;
    bodyDownloadStatus: BodyDownloadStatus;
    readonly calendarEvent: any;
    calendarMessageType: CalendarMessageType;
    readonly canFlag: boolean;
    readonly canMarkRead: boolean;
    readonly canMove: boolean;
    readonly canMoveFromOutboxToDrafts: boolean;
    cc: string;
    readonly ccRecipients: IVector<IRecipient>;
    readonly displayViewIdString: string;
    readonly displayViewIds: IVectorView<string>;
    eventHandle: string;
    eventUID: string;
    flagged: boolean;
    from: string;
    readonly fromRecipient: IRecipient;
    readonly hasAttachments: boolean;
    hasNewsletterCategory: boolean;
    hasOrdinaryAttachments: boolean;
    hasSocialUpdateCategory: boolean;
    importance: MailMessageImportance;
    readonly instanceNumber: number;
    isFromPersonPinned: boolean;
    readonly isLocalMessage: boolean;
    readonly isPermanentSendFailure: boolean;
    lastVerb: MailMessageLastVerb;
    readonly modified: Date | null;
    needBody: boolean;
    readonly normalizedSubject: string;
    outboxQueue: OutboxQueue;
    readonly parentConversationId: string;
    photoMailAlbumName: string;
    photoMailFlags: number;
    photoMailStatus: number;
    preview: string;
    read: boolean;
    received: Date | null;
    replyTo: string;
    readonly replyToRecipients: IVector<IRecipient>;
    sanitizedVersion: SanitizedVersion;
    sender: string;
    readonly senderRecipient: IRecipient;
    sent: Date | null;
    sourceFolderServerId: string;
    sourceHasEmbeddedAttachments: boolean;
    sourceInstanceId: Date;
    sourceItemServerId: string;
    sourceLongId: string;
    sourceMessageStoreId: string;
    sourceReplaceMime: boolean;
    sourceVerb: MailMessageLastVerb;
    subject: string;
    syncStatus: number;
    to: string;
    readonly toRecipients: IVector<IRecipient>;
    bestDisplayViewId(hstrCurrentView: string): string;
    isBodyTruncated(eType: MailBodyType): boolean;
    isBodyAutoGenerated(eType: MailBodyType): boolean;
    downloadFullBody(): void;
    hasBody(eType: MailBodyType): boolean;
    getBody(): IMailBody;
    getBody_ByType(eType: MailBodyType): IMailBody;
    getJunkBody(): IMailBody;
    createBody(): IMailBody;
    commitSanitizedBody(): void;
    cloneMessage(fIncludeAttachments: boolean, eLastVerb: MailMessageLastVerb, pSourceView: IMailView): IMailMessage;
    serializeAsMime(): IRandomAccessStream;
    serializeAsMimeWithoutBcc(): IRandomAccessStream;
    moveFromOutboxToDraftsAndCommit(): void;
    moveToOutbox(): void;
    moveToSentItems(hstrFromAddress: string): void;
    isInSpecialFolderType(eType: MailFolderType): boolean;
    getEmbeddedAttachmentCollection(): ICollection;
    getOrdinaryAttachmentCollection(): ICollection;
    getHiddenAttachmentCollection(): ICollection;
    createAttachment(): IMailAttachment;
    loadAttachment(attachmentId: string): IMailAttachment;
}