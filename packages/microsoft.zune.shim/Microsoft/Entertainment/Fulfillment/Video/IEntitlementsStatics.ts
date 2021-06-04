// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IBlockRefresh } from "./IBlockRefresh";
import { IRefreshEntitlementsResult } from "./IRefreshEntitlementsResult";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";

export interface IEntitlementsStatics {
    isBlockRefreshPending: boolean;
    blockRefreshAsync(): IAsyncOperation<IBlockRefresh>;
    checkServiceAvailabilityAsync(productGroups: IVectorView<IVectorView<string>>): IAsyncOperation<boolean>;
    purchaseOfferAsync(signedOffer: string): IAsyncAction;
    queryForOfferInstanceIdsAsync(productIds: IVectorView<string>): IAsyncOperation<IVector<string>>;
    refreshAsync(refreshOnlyProductIds: IVectorView<string>, fResetFilteredProductIds: boolean, fDontShortCircuitAndForceUpdateAllRights: boolean, fRestoreDeletedPurchasesToCollection: boolean, fMarkRentalExpirationsAsTrusted: boolean): IAsyncOperation<IRefreshEntitlementsResult>;
}