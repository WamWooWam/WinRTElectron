// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { ITelemetryConfiguration } from "./ITelemetryConfiguration";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Configuration.TelemetryConfiguration')
export class TelemetryConfiguration implements ITelemetryConfiguration { 
    musicPlaybackUnsnapped: number = null;
    musicPlaybackSnapped: number = null;
    musicPlaybackBackground: number = null;
    maxTelemetryEventGeneration: number = null;
    keystoneSendInterval: number = null;
    sendAllEventsImmediately: boolean = null;
    keystoneProvisioningServer: string = null;
    keystoneMaxBatchSizeInChars: number = null;
    keystoneMaxBackOffMs: number = null;
    keystoneHeartbeatInterval: number = null;
    keystoneEnabled: boolean = null;
    appStateHeartbeatInterval: number = null;
    keystoneDropHTTPContentTypes: string = null;
    keystoneDropEvents: string = null;
    immediateEventIds: string = null;
    flightNumber: number = 0;
    flightId: string = null;
    umsenabled: boolean = null;
    enabled: boolean = null;
    cosmosSendInterval: number = null;
    cosmosOfflineCacheSize: number = null;
    cosmosMaxBatchSizeInChars: number = null;
    cosmosBackOffTimeMs: number = null;
    keystoneDropHTTPHostNames: string = null;
    notSnapped: number = null;
    submitIdSignedIn: string = null;
    videoPlaybackUnsnapped: number = null;
    videoPlaybackSnapped: number = null;
    videoPlaybackBackground: number = null;
    userTimeEventTimeout: number = -1;
    umsisTestScenario: boolean = null;
    eventIdsToDrop: string = null;
    umsbatchSize: number = null;
    timeSpent: number = 0;
    submitTelemetryEventFailed: boolean = null;
    submitSequenceNumberSignedIn: number = null;
    submitSequenceNumberAnonymous: number = null;
    visitorId: string = null;
    submitIdAnonymous: string = null;
    snappedMode: number = null;
    shipAssertParamIdsToDrop: string = null;
    sessionGuid: string = null;
    keystoneSamplingPercentage: number = null;
    selectivelyEnabledComponents: string = null;
    purchaseHistoryItemProcessTotalCount: number = null;
    purchaseHistoryItemProcessErrorCount: number = null;
    previousSessionGuid: string = null;
    persistTelemetryEventFailed: boolean = null;
}
