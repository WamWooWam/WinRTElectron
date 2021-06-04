// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------


export interface IFulfillmentConfiguration {
    enableRentalFilteringHack: boolean;
    forceVideoIngestionRefreshSyncToken: string;
    lastHandledIngestionRefreshSyncToken: string;
    logSuccessTelemetryDuringVideoIngestion: boolean;
    maxInputVideoItemsInEdsDetailsRequest: number;
    preferH264Content: boolean;
    purchasedCacheProductSkus: string;
    purchasedServiceProductSkus: string;
    videoLicensingClientTypeOverride: string;
    videoOnlyFiltersRentalsWithDeviceName: boolean;
    videoProductFilterTimeSpanForDownloadOnlyInMinutes: number;
    videoProductFilterTimeSpanForEdsOmittedItemInMinutes: number;
    videoProductFilterTimeSpanForEdsRequestFailedInMinutes: number;
    videoProductFilterTimeSpanForProductNotAvailableToDeviceInMinutes: number;
}