
export namespace Photo {
    export namespace App {
        export namespace Import {
        }
    }
    export namespace Viewer {
        export namespace Commanding {
            export interface CommandBatchEventArgs {
                starting: Boolean;
            }
            export type CommandBatchEventHandler = (e: CommandBatchEventArgs) => void;
            export enum CommandEnableProperties {
                none,
                contentContainsAsset,
                contentContainsMultipleAssets,
                selectionExists = 4,
                activeItemExists = 8,
                activeItemIsVideo = 16,
                viewIs1Up = 32,
                viewIsOpenWith = 64,
                viewIsMultiUp = 128,
                viewIsPlayTo = 256,
                viewIsSlideshow = 512,
                viewIsImport = 1024,
                viewIsSearch = 2048,
                backStackExists = 4096,
                justBelowSourcesView = 8192,
                sourceAllowsPrinting = 16384,
                sourceAllowsViewOnSource = 32768,
                sourceAllowsDelete = 65536,
                sourceAllowsSetAsTile = 131072,
                sourceAllowsLockScreen = 262144,
                sourceAllowsDateToggle = 524288,
            }
            export type CommandHandler = (context: /* DataModel.IObjectCollection */ any, inputParam: any) => any;
            export interface CommandStateChangedEventArgs {
                commandName: string;
                commandStage: string;
                enabled: Boolean;
                stateChangeFlags: CommandStateChangeFlags;
            }
            export type CommandStateChangedEventHandler = (e: CommandStateChangedEventArgs) => void;
            export enum CommandStateChangeFlags {
                none,
                enableState,
                stage,
            }
            export enum CommandSurface {
                appBar,
                charmsBar,
                canvas,
                keyboardShortcut,
            }
            export enum CurrentView {
                none,
                oneUp,
                openWith,
                megaStrip,
                puzzleView,
                slideshow,
                playTo,
                search,
                importView,
                multiUpSlideshow,
            }
            export enum ExpectedActionableItems {
                none,
                selection,
                content,
                singleActiveItem,
                oneupElseSelection,
                playTo,
            }
        }
        export namespace DataModel {
            export enum BlobResultQuality {
                error,
                lowQualityNothingPending,
                lowQualityBetterPending,
                highQuality,
            }
            export enum ContainerShape {
                byAlbum,
                byDate,
            }
            export enum GetMediaAsyncFlags {
                none,
                transcodeToInboxCodec,
                oneUpSizeForRemotePhotos,
                streamForRemoteVideos = 4,
                largestAvailableLocally = 8,
            }
            export interface ObjectChangedEvent {
                type: ObjectChangedEventType;
                fields: ObjectChangedEventFields;
            }
            export enum ObjectChangedEventFields {
                none,
                other,
                selection,
                thumbnail = 4,
                thumbnailStatus = 8,
                dimensions = 16,
                media = 32,
                subAlbumCount = 64,
            }
            export enum ObjectChangedEventType {
                modified,
                removed,
            }
            export type ObjectChangedHandler = (event: ObjectChangedEvent) => void;
            export interface ObjectCollectionChangedEvent {
                type: ObjectCollectionChangedEventType;
                position: number;
                count: number;
                fields: ObjectChangedEventFields;
            }
            export enum ObjectCollectionChangedEventType {
                added,
                modified,
                removed,
                reset,
                populationComplete,
            }
            export type ObjectCollectionChangedHandler = (events: ObjectCollectionChangedEvent[]) => void;
            export type ObjectGetPropertiesHandler = (props: string[], final: Boolean) => void;
        }
        export namespace DataProvider {
            export enum ChangedFields {
                none,
                other,
                thumbnail,
                dimensions = 4,
                thumbnailStatus = 8,
                media = 16,
                assetsAll = 65535,
                subAlbumCount,
            }
            export enum ChangeType {
                added,
                removed,
            }
            export type CollectionChangedHandler = () => void;
            export interface CollectionItemChangedInfo {
                itemId: string;
                changeType: ChangeType;
                index: number;
            }
            export enum CollectionOrganization {
                none,
                album,
                monthAndYear,
            }
            export interface DataItemChangeInfo {
                itemId: string;
                changedFields: ChangedFields;
            }
            export enum DataItemPriority {
                canceled,
                lowest,
                low,
                normal,
                high,
                highest,
            }
            export enum GetMediaFlags {
                none,
                transcodeToInboxCodec,
                oneUpSizeForRemotePhotos,
                streamForRemoteVideos = 4,
                largestAvailableLocally = 8,
                maximumScreenResolution = 16,
            }
            export enum ItemType {
                none,
                photo,
                video,
                otherAsset = 4,
                album = 16,
                monthInYear = 32,
                source = 64,
                sourcesList = 128,
                multiUpAlbumsList = 256,
            }
            export enum PropertyQuality {
                error,
                slowRetrievalRequired,
                highQuality,
            }
            export type ProviderItemsChangedHandler = (changedItems: DataItemChangeInfo[]) => void;
            export enum RequestType {
                optional,
                inCacheOnly,
                slowRetrieval,
            }
            export enum ThumbnailQuality {
                error,
                lowQualityNothingPending,
                lowQualityBetterPending,
                highQuality,
            }
        }
    }
}
