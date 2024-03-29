// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------


export interface ISyncEventProvider {
    isCloudSync_CloudProvider_ApplyBatch_StartEnabled: boolean;
    isCloudSync_CloudProvider_ApplyBatch_StopEnabled: boolean;
    isCloudSync_CloudProvider_ApplyItem_ErrorEnabled: boolean;
    isCloudSync_CloudProvider_ApplyItem_SkippedEnabled: boolean;
    isCloudSync_CloudProvider_ContentChangedEnabled: boolean;
    isCloudSync_CloudProvider_FindChangesEnabled: boolean;
    isCloudSync_CloudProvider_FoundChangeEnabled: boolean;
    isCloudSync_CloudProvider_IsAvailableEnabled: boolean;
    isCloudSync_CloudProvider_IsDirtyEnabled: boolean;
    isCloudSync_CloudProvider_LoadItem_ErrorEnabled: boolean;
    isCloudSync_CloudProvider_TakeDownEnabled: boolean;
    isCloudSync_CloudProvider_UpdateMetadata_StartEnabled: boolean;
    isCloudSync_CloudProvider_UpdateMetadata_StopEnabled: boolean;
    isCloudSync_Engine_BlockSync_StartEnabled: boolean;
    isCloudSync_Engine_BlockSync_StopEnabled: boolean;
    isCloudSync_Engine_CancelSyncEnabled: boolean;
    isCloudSync_Engine_NotificationEnabled: boolean;
    isCloudSync_Engine_RequestSyncEnabled: boolean;
    isCloudSync_Engine_ScheduleSyncEnabled: boolean;
    isCloudSync_Engine_SyncEndEnabled: boolean;
    isCloudSync_Engine_SyncErrorEnabled: boolean;
    isCloudSync_Engine_Sync_StartEnabled: boolean;
    isCloudSync_Engine_Sync_StopEnabled: boolean;
    isCloudSync_LibraryProvider_AddItemEnabled: boolean;
    isCloudSync_LibraryProvider_ContentChangedEnabled: boolean;
    isCloudSync_LibraryProvider_DeleteItemEnabled: boolean;
    isCloudSync_LibraryProvider_DeletedItemsEnabled: boolean;
    isCloudSync_LibraryProvider_DirtyItemsEnabled: boolean;
    isCloudSync_LibraryProvider_InvalidItemsEnabled: boolean;
    isCloudSync_LibraryProvider_IsAvailableEnabled: boolean;
    isCloudSync_LibraryProvider_IsDirtyEnabled: boolean;
    isCloudSync_LibraryProvider_LoadItemEnabled: boolean;
    isCloudSync_LibraryProvider_UpdateItemEnabled: boolean;
    isCloudSync_LibraryProvider_UpdateMetadata_StartEnabled: boolean;
    isCloudSync_LibraryProvider_UpdateMetadata_StopEnabled: boolean;
    traceCloudSync_Engine_Sync_Start(requestSyncOption: number): void;
    traceCloudSync_Engine_Sync_Stop(hresult: number): void;
    traceCloudSync_Engine_BlockSync_Start(): void;
    traceCloudSync_Engine_BlockSync_Stop(): void;
    traceCloudSync_Engine_RequestSync(requestSyncOption: number, cookieNextCompleteSync: number): void;
    traceCloudSync_Engine_SyncError(hresult: number): void;
    traceCloudSync_Engine_SyncEnd(hresult: number, changes: boolean, cookieCompleteSync: number): void;
    traceCloudSync_Engine_ScheduleSync(delayTimeMS: number): void;
    traceCloudSync_Engine_CancelSync(hresult: number): void;
    traceCloudSync_Engine_Notification(syncPointId: string): void;
    traceCloudSync_LibraryProvider_LoadItem(syncType: number, mediaId: number): void;
    traceCloudSync_LibraryProvider_AddItem(syncType: number, mediaId: number): void;
    traceCloudSync_LibraryProvider_UpdateItem(syncType: number, mediaIdIn: number, mediaIdOut: number): void;
    traceCloudSync_LibraryProvider_DeleteItem(syncType: number, mediaId: number): void;
    traceCloudSync_LibraryProvider_DirtyItems(syncType: number, dirtyItems: string): void;
    traceCloudSync_LibraryProvider_DeletedItems(syncType: number, deletedItems: string): void;
    traceCloudSync_LibraryProvider_InvalidItems(syncType: number, invalidItems: string): void;
    traceCloudSync_LibraryProvider_IsDirty(isDirty: boolean): void;
    traceCloudSync_LibraryProvider_IsAvailable(isAvailable: boolean): void;
    traceCloudSync_LibraryProvider_ContentChanged(notifyDelayMS: number): void;
    traceCloudSync_LibraryProvider_UpdateMetadata_Start(): void;
    traceCloudSync_LibraryProvider_UpdateMetadata_Stop(): void;
    traceCloudSync_CloudProvider_ApplyItem_Error(syncType: number, cloudId: string, hresult: number): void;
    traceCloudSync_CloudProvider_ApplyItem_Skipped(syncType: number, cloudId: string): void;
    traceCloudSync_CloudProvider_LoadItem_Error(syncType: number, cloudId: string, hresult: number): void;
    traceCloudSync_CloudProvider_IsDirty(isDirty: boolean, dirtyReason: number): void;
    traceCloudSync_CloudProvider_IsAvailable(availability: number): void;
    traceCloudSync_CloudProvider_ContentChanged(): void;
    traceCloudSync_CloudProvider_FindChanges(anchor: string, requestedBatchSize: number, hasMoreData: boolean): void;
    traceCloudSync_CloudProvider_FoundChange(syncType: number, cloudId: string, changeType: number): void;
    traceCloudSync_CloudProvider_TakeDown(cloudId: string): void;
    traceCloudSync_CloudProvider_UpdateMetadata_Start(): void;
    traceCloudSync_CloudProvider_UpdateMetadata_Stop(): void;
    traceCloudSync_CloudProvider_ApplyBatch_Start(): void;
    traceCloudSync_CloudProvider_ApplyBatch_Stop(): void;
}
