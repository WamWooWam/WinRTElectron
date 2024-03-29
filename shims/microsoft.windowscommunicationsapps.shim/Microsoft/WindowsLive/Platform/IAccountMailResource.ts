// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { SignatureType } from "./SignatureType";
import { SyncWindowSize } from "./SyncWindowSize";
import { ToastState } from "./ToastState";

export interface IAccountMailResource {
    allowExternalImages: boolean;
    readonly canCreateFolders: boolean;
    readonly canDeleteFolders: boolean;
    readonly canServerSearchAllFolders: boolean;
    readonly canUpdateFolders: boolean;
    cancelSendMail: boolean;
    isSendingMail: boolean;
    readonly isSyncingAllMail: boolean;
    lastSendMailResult: number;
    oofLastStateChangedTime: Date;
    readonly oofLastSyncResult: number;
    serverCertificateExpired: boolean;
    serverCertificateMismatchedDomain: boolean;
    serverCertificateUnknownCA: boolean;
    signatureText: string;
    signatureType: SignatureType;
    syncAllFolders: boolean;
    syncWindowSize: SyncWindowSize;
    toastState: ToastState;
}
