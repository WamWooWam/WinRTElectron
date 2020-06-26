import { PlatformObject } from "./PlatformObject";
import { Foundation } from "winrt-node/Windows";
import { MailBody } from "./MailBody";
import { WindowsLive } from "../Enums";
import { Shim, ShimProxyHandler, Enumerable } from "winrt-node/Windows.Foundation";
import { uuidv4 } from "winrt-node/util";
import { Microsoft } from "../../../../../microsoft.xbox/Microsoft.Xbox";

export class MailMessage extends PlatformObject {
    constructor() {
        super("MailMessage");
        this.objectId = uuidv4();
        this.displayViewIdString = this.objectId;
        return new Proxy(this, new ShimProxyHandler)
    }

    private _body: MailBody;

    accountId: string;
    allowExternalImages: boolean = true;

    from: string = "";
    to: string = "";
    cc: string = "";
    bcc: string = "";

    subject: string = "";
    sender: string = "";

    canFlag: boolean = true;
    canMarkRead: boolean = true;

    irmAllowProgramaticAccess: boolean = true;
    irmCanEdit: boolean = true;
    irmCanForward: boolean = true;
    irmCanReply: boolean = true;
    irmCanReplyAll: boolean = true;
    irmCanExtractContent: boolean = true;
    irmCanModifyRecipients: boolean = true;
    irmHasTemplate: boolean = false;
    irmIsContentOwner: boolean = true;
    irmTemplateDescription: string = "";
    irmTemplateId: string = "";
    irmTemplateName: string = "";

    isLocalMessage: boolean = true;

    hasOrdinaryAttachments: boolean = false;
    bodyDownloadStatus = WindowsLive.Platform.BodyDownloadStatus.upToDate;

    sanitizedVersion = WindowsLive.Platform.SanitizedVersion.current;
    sourceMessageStoreId: string;
    displayViewIdString: string;
    displayViewIds: [] = [];

    syncStatus: number = 0;

    @Enumerable(true)
    public get toRecipients() {
        return [];
    }

    @Enumerable(true)
    public get ccRecipients() {
        return [];
    }

    @Enumerable(true)
    public get bccRecipients() {
        return [];
    }

    @Enumerable(true)
    public get fromRecipient() {
        return null;
    }

    @Enumerable(true)
    public get canMove() {
        return true;
    }

    @Enumerable(true)
    public get needBody() {
        return false;
    }

    isInSpecialFolderType() {
        return false;
    }

    commitSanitizedBody() {

    }

    getBody() {
        return this._body ?? (this._body = new MailBody(WindowsLive.Platform.MailBodyType.html));
    }

    getJunkBody() {
        return this._body ?? (this._body = new MailBody(WindowsLive.Platform.MailBodyType.html));
    }

    createBody() {
        return this._body ?? (this._body = new MailBody(WindowsLive.Platform.MailBodyType.html));
    }

    isBodyTruncated(eType: WindowsLive.Platform.MailBodyType) {
        return false;
    }

    setRightsManagementTemplate() {

    }
}