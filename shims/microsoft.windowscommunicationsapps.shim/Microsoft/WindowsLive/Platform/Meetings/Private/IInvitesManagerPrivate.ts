// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:39 2021
// </auto-generated>
// --------------------------------------------------

import { ICollection } from "../../ICollection";

export interface IInvitesManagerPrivate {
    getMeetingResponses(accountRowId: number): ICollection;
    updateMeetingResponses(accountId: string, oldCollectionId: string, oldRequestId: string, newCollectionId: string, newRequestId: string): void;
    hasMeetingResponses(accountId: string, collectionId: string, requestId: string): boolean;
}
