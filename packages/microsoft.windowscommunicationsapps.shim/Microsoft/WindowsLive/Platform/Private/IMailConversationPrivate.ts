// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:39 2021
// </auto-generated>
// --------------------------------------------------

import { ICollection } from "../ICollection";
import { MailMessageImportance } from "../MailMessageImportance";
import { MailMessageLastVerb } from "../MailMessageLastVerb";
import { IMailConversationAggregator } from "./IMailConversationAggregator";

export interface IMailConversationPrivate {
    flagged: boolean;
    hasCalendarInvite: boolean;
    hasCalendarRequest: boolean;
    hasOrdinaryAttachments: boolean;
    importance: MailMessageImportance;
    irmHasTemplate: boolean;
    keepInView: string;
    lastVerb: MailMessageLastVerb;
    latestMessageTimePrivate: Date;
    latestReceivedTimePrivate: Date;
    latestSender: string;
    latestSenderEmail: string;
    latestSenderName: string;
    latestSenderPersonStoreId: number;
    opaqueId: string;
    subject: string;
    totalCount: number;
    getChildMessages(): ICollection;
    putAggregator(pAggregator: IMailConversationAggregator): void;
}