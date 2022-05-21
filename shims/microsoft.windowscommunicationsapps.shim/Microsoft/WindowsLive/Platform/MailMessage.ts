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
import { IMailMessage } from "./IMailMessage";
import { IMailView } from "./IMailView";
import { IObject } from "./IObject";
import { IRecipient } from "./IRecipient";
import { IRightsManagementLicense } from "./IRightsManagementLicense";
import { IRightsManagementTemplate } from "./IRightsManagementTemplate";
import { ITransientObjectHolder } from "./ITransientObjectHolder";
import { MailBodyType } from "./MailBodyType";
import { MailFolderType } from "./MailFolderType";
import { MailMessageImportance } from "./MailMessageImportance";
import { MailMessageLastVerb } from "./MailMessageLastVerb";
import { ObjectChangedHandler } from "./ObjectChangedHandler";
import { OutboxQueue } from "./OutboxQueue";
import { SanitizedVersion } from "./SanitizedVersion";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { IRandomAccessStream } from "winrt/Windows/Storage/Streams/IRandomAccessStream";
import { PlatformObject } from "./PlatformObject";
// import { DefaultAccount } from "./Account";
import { Vector } from "winrt/Windows/Foundation/Interop/Vector`1";
import { Collection } from "./Collection";
import { MailBody } from "./MailBody";

@GenerateShim('Microsoft.WindowsLive.Platform.MailMessage')
export class MailMessage extends PlatformObject implements IMailMessage, IRightsManagementLicense {

    private _body: IMailBody;

    constructor(accountId: string) {
        super("MailMessage", true, true);
        this.instanceNumber = 1;
        this.accountId = accountId;
        this.toRecipients = new Vector();
        this.ccRecipients = new Vector();
        this.bccRecipients = new Vector();
        this.replyToRecipients = new Vector();
        this.displayViewIdString = "balls";
    }

    to: string = "";
    cc: string = "";
    bcc: string = "";
    from: string = "";

    subject: string = "";

    read: boolean = false;
    flagged: boolean = false;
    importance: MailMessageImportance = MailMessageImportance.normal;
    accountId: string = "";

    photoMailStatus: number = null;
    hasNewsletterCategory: boolean = null;
    outboxQueue: OutboxQueue = null;
    photoMailFlags: number = null;
    photoMailAlbumName: string = null;
    sourceHasEmbeddedAttachments: boolean = null;
    hasSocialUpdateCategory: boolean = null;
    allowExternalImages: boolean = null;
    sourceVerb: MailMessageLastVerb = null;
    sourceReplaceMime: boolean = null;
    sourceItemServerId: string = null;
    sourceInstanceId: Date = null;
    sourceFolderServerId: string = null;
    sanitizedVersion: SanitizedVersion = null;

    readonly toRecipients: IVector<IRecipient> = null;
    readonly ccRecipients: IVector<IRecipient> = null;
    readonly bccRecipients: IVector<IRecipient> = null;
    readonly replyToRecipients: IVector<IRecipient> = null;

    readonly canMarkRead: boolean = null;
    readonly canMoveFromOutboxToDrafts: boolean = null;
    readonly displayViewIds: IVectorView<string> = null;
    readonly eventHandle: string = null;
    readonly eventUID: string = null;
    readonly canMove: boolean = false;
    readonly fromRecipient: IRecipient = null;
    readonly hasAttachments: boolean = null;
    readonly hasOrdinaryAttachments: boolean = null;
    readonly instanceNumber: number = null;
    readonly isFromPersonPinned: boolean = null;
    readonly isLocalMessage: boolean = null;
    readonly isPermanentSendFailure: boolean = null;
    readonly lastVerb: MailMessageLastVerb = null;
    readonly needBody: boolean = null;
    readonly normalizedSubject: string = null;
    readonly parentConversationId: string = null;
    readonly received: Date | null = null;
    readonly replyTo: string = null;
    readonly sender: string = null;
    readonly senderRecipient: IRecipient = null;
    readonly sent: Date | null = null;
    readonly displayViewIdString: string = "";
    readonly modified: Date | null = null;
    readonly bodyDownloadStatus: BodyDownloadStatus = null;
    readonly sourceLongId: string = null;
    readonly sourceMessageStoreId: string = null;
    readonly calendarEvent: any = null;
    readonly calendarMessageType: CalendarMessageType = null;
    readonly preview: string = null;
    readonly syncStatus: number = null;
    readonly canFlag: boolean = null;

    readonly irmAllowProgramaticAccess: boolean = null;
    readonly irmCanEdit: boolean = null;
    readonly irmCanExtractContent: boolean = null;
    readonly irmCanForward: boolean = null;
    readonly irmCanModifyRecipients: boolean = null;
    readonly irmCanPrint: boolean = null;
    readonly irmCanRemoveRightsManagement: boolean = null;
    readonly irmCanReply: boolean = null;
    readonly irmCanReplyAll: boolean = null;
    readonly irmExpiryDate: Date = null;
    readonly irmHasTemplate: boolean = null;
    readonly irmIsContentOwner: boolean = null;
    readonly irmTemplateDescription: string = null;
    readonly irmTemplateId: string = null;
    readonly irmTemplateName: string = null;

    bestDisplayViewId(hstrCurrentView: string): string {
        throw new Error('MailMessage#bestDisplayViewId not implemented')
    }
    isBodyTruncated(eType: MailBodyType): boolean {
        throw new Error('MailMessage#isBodyTruncated not implemented')
    }
    isBodyAutoGenerated(eType: MailBodyType): boolean {
        throw new Error('MailMessage#isBodyAutoGenerated not implemented')
    }
    downloadFullBody(): void {
        console.warn('MailMessage#downloadFullBody not implemented')
    }
    hasBody(eType: MailBodyType): boolean {
        // throw new Error('MailMessage#hasBody not implemented')
        return eType == MailBodyType.html;
    }
    getBody(): IMailBody {
        // throw new Error('MailMessage#getBody not implemented')
        return this._body;
    }
    getBody_ByType(eType: MailBodyType): IMailBody {
        throw new Error('MailMessage#getBody_ByType not implemented')
    }
    getJunkBody(): IMailBody {
        throw new Error('MailMessage#getJunkBody not implemented')
    }
    createBody(): IMailBody {
        // throw new Error('MailMessage#createBody not implemented')
        return this._body = new MailBody();
    }
    commitSanitizedBody(): void {
        console.warn('MailMessage#commitSanitizedBody not implemented')
    }
    cloneMessage(fIncludeAttachments: boolean, eLastVerb: MailMessageLastVerb, pSourceView: IMailView): IMailMessage {
        throw new Error('MailMessage#cloneMessage not implemented')
    }
    serializeAsMime(): IRandomAccessStream {
        throw new Error('MailMessage#serializeAsMime not implemented')
    }
    serializeAsMimeWithoutBcc(): IRandomAccessStream {
        throw new Error('MailMessage#serializeAsMimeWithoutBcc not implemented')
    }
    moveFromOutboxToDraftsAndCommit(): void {
        console.warn('MailMessage#moveFromOutboxToDraftsAndCommit not implemented')
    }
    moveToOutbox(): void {
        console.warn('MailMessage#moveToOutbox not implemented')
    }
    moveToSentItems(hstrFromAddress: string): void {
        console.warn('MailMessage#moveToSentItems not implemented')
    }
    isInSpecialFolderType(eType: MailFolderType): boolean {
        // throw new Error('MailMessage#isInSpecialFolderType not implemented')
        if (eType == MailFolderType.drafts)
            return true;
        return false;
    }
    getEmbeddedAttachmentCollection(): ICollection {
        // throw new Error('MailMessage#getEmbeddedAttachmentCollection not implemented')
        return new Collection();
    }
    getOrdinaryAttachmentCollection(): ICollection {
        // throw new Error('MailMessage#getOrdinaryAttachmentCollection not implemented')
        return new Collection();
    }
    getHiddenAttachmentCollection(): ICollection {
        // throw new Error('MailMessage#getHiddenAttachmentCollection not implemented')
        return new Collection();
    }
    createAttachment(): IMailAttachment {
        throw new Error('MailMessage#createAttachment not implemented')
    }
    loadAttachment(attachmentId: string): IMailAttachment {
        throw new Error('MailMessage#loadAttachment not implemented')
    }
    removeRightsManagementTemplate(): void {
        console.warn('MailMessage#removeRightsManagementTemplate not implemented')
    }
    setRightsManagementTemplate(pRightsManagementTemplate: IRightsManagementTemplate): void {
        console.warn('MailMessage#setRightsManagementTemplate not implemented')
    }
}
