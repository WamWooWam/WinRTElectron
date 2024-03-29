// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:39 2021
// </auto-generated>
// --------------------------------------------------

import { IAccountServerConnectionSettings } from "../IAccountServerConnectionSettings";
import { ICollection } from "../ICollection";
import { IRightsManagementTemplate } from "../IRightsManagementTemplate";
import { PolicyComplianceResults } from "../PolicyComplianceResults";
import { EasClientSecurityPolicy } from "winrt/Windows/Security/ExchangeActiveSyncProvisioning/EasClientSecurityPolicy";

export interface IEasAccountSettingsPrivate extends IAccountServerConnectionSettings {
    allEmailAddresses: string;
    allowSimpleDevicePassword: boolean;
    alphaNumericDevicePasswordRequired: boolean;
    backoffCount: number;
    backoffTime: Date;
    baseServerAddress: string;
    cachedDeviceInfo: string;
    commandsSupported: string;
    deviceId: string;
    devicePasswordEnabled: boolean;
    devicePasswordExpiration: number;
    devicePasswordHistory: number;
    emailAddress: string;
    enableCompactURI: boolean;
    folderResetNeeded: boolean;
    folderSyncKey: string;
    hydraServer: string;
    isClientProvisioned: boolean;
    readonly isWlasSupported: boolean;
    lastHydraRegistrationTimeStamp: Date;
    lastServerSuccess: string;
    lastSyncResult: number;
    lastSyncSuccessTime: Date;
    maxDevicePasswordFailedAttempts: number;
    maxInactivityTimeDeviceLock: number;
    minDevicePasswordComplexCharacters: number;
    minDevicePasswordLength: number;
    readonly passwordCookie: string;
    policyKey: string;
    policyState: number;
    requireDeviceEncryption: boolean;
    resetReason: number;
    resourcesSynchronized: number;
    readonly rightsManagementTemplates: ICollection;
    readonly rightsManagementTemplatesSortedById: ICollection;
    version: string;
    oofBodyForInternalPrivate: string;
    oofBodyForKnownExternalPrivate: string;
    oofBodyForUnknownExternalPrivate: string;
    oofEnabledForInternalPrivate: boolean;
    oofEnabledForKnownExternalPrivate: boolean;
    oofEnabledForUnknownExternalPrivate: boolean;
    oofEndTimePrivate: Date;
    oofLastModifiedTime: Date;
    oofLastSyncResult: number;
    oofLastSyncTime: Date;
    oofStartTimePrivate: Date;
    oofStatePrivate: boolean;
    policyApplyAttempted: boolean;
    policyComplianceResults: PolicyComplianceResults;
    createNewRightsManagementTemplate(): IRightsManagementTemplate;
    setIsMailSupported(value: boolean): void;
    setIsWlasSupported(value: boolean): void;
    getClientSecurityPolicy(): EasClientSecurityPolicy;
}
