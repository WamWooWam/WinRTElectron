export namespace WindowsLive { 
    export namespace Photo { 
        export namespace App { 
            export class AssetDataItem implements Viewer.DataProvider.IAssetDataItem, Viewer.DataProvider.IDataItem, IDeletable {
                public itemId: string;
                public itemType: Viewer.DataProvider.ItemType;

                public getMedia(flags: Viewer.DataProvider.GetMediaFlags, checkCanceled: Viewer.DataProvider.ICheckCanceled): { actualWidth: number, actualHeight: number, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string } {
                    throw new Error('shimmed function AssetDataItem.getMedia');
                }

                public getThumbnail(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean, checkCanceled: Viewer.DataProvider.ICheckCanceled): { actualWidth: number, actualHeight: number, actualQuality: Viewer.DataProvider.ThumbnailQuality, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string, ThumbnailId: string } {
                    throw new Error('shimmed function AssetDataItem.getThumbnail');
                }

                public getProperty(requestType: Viewer.DataProvider.RequestType, property: string, checkCanceled: Viewer.DataProvider.ICheckCanceled): { returnValue: any, quality: Viewer.DataProvider.PropertyQuality } {
                    throw new Error('shimmed function AssetDataItem.getProperty');
                }

                public markDeleted(): void {
                    console.warn('shimmed function AssetDataItem.markDeleted');
                }

            }
            export class DataCollection implements Viewer.DataProvider.IDataCollection, Windows.Foundation.Collections.IIterable<Viewer.DataProvider.IDataItem>, Viewer.DataProvider.IDataItem {
                public searchQuery: string;
                public itemId: string;
                public itemType: Viewer.DataProvider.ItemType;

                public getThumbnail(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean, checkCanceled: Viewer.DataProvider.ICheckCanceled): { actualWidth: number, actualHeight: number, actualQuality: Viewer.DataProvider.ThumbnailQuality, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string, ThumbnailId: string } {
                    throw new Error('shimmed function DataCollection.getThumbnail');
                }

                public getProperty(requestType: Viewer.DataProvider.RequestType, property: string, checkCanceled: Viewer.DataProvider.ICheckCanceled): { returnValue: any, quality: Viewer.DataProvider.PropertyQuality } {
                    throw new Error('shimmed function DataCollection.getProperty');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`DataCollection::addEventListener: ${name}`);
                    switch (name) {
                        case "itemschanged": // Viewer.DataProvider.CollectionChangedHandler
                            break;
                    }

                }
            }
            export class DataProvider implements IPhotosDataProvider, Viewer.DataProvider.IDataProvider {
                public canApplyTextSearch: Boolean;

                public getContainerIdForPath(path: string): string {
                    throw new Error('shimmed function DataProvider.getContainerIdForPath');
                }

                public getCollectionFromId(containerItemId: string, organization: Viewer.DataProvider.CollectionOrganization, search: string): Viewer.DataProvider.IDataCollection {
                    throw new Error('shimmed function DataProvider.getCollectionFromId');
                }

                public getIdFromUri(uri: string, localItem: Boolean): string {
                    throw new Error('shimmed function DataProvider.getIdFromUri');
                }

                public getItemFromId(itemId: string): Viewer.DataProvider.IDataItem {
                    throw new Error('shimmed function DataProvider.getItemFromId');
                }

                public execute(verb: string, ids: Windows.Foundation.Collections.IIterable<string>, __arguments: any, checkCanceled: Viewer.DataProvider.ICheckCanceled): any {
                    throw new Error('shimmed function DataProvider.execute');
                }

                public canSourceSupport(sourceType: string, capability: string): Boolean {
                    throw new Error('shimmed function DataProvider.canSourceSupport');
                }

                public updateDataItemPriority(itemId: string, priority: Viewer.DataProvider.DataItemPriority): void {
                    console.warn('shimmed function DataProvider.updateDataItemPriority');
                }

                public applicationSuspend(): void {
                    console.warn('shimmed function DataProvider.applicationSuspend');
                }

                public applicationResume(): void {
                    console.warn('shimmed function DataProvider.applicationResume');
                }

                public onApplicationLaunched(isResume: Boolean): void {
                    console.warn('shimmed function DataProvider.onApplicationLaunched');
                }

                public setScreenProperties(screenWidth: number, screenHeight: number, puzzleScaleFactor: number, megastripScaleFactor: number): void {
                    console.warn('shimmed function DataProvider.setScreenProperties');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`DataProvider::addEventListener: ${name}`);
                    switch (name) {
                        case "itemschanged": // Viewer.DataProvider.ProviderItemsChangedHandler
                            break;
                    }

                }
            }
            export interface IDeletable extends Viewer.DataProvider.IDataItem {
                markDeleted(): void;
            }
            export namespace Import { 
                export interface IImportDataProviderFactory {
                    createImportDataProviderInstance(pDeviceRoot: Windows.Storage.IStorageFolder): ImportDataProvider;
                }
                export class ImportAssetDataItem implements Viewer.DataProvider.IAssetDataItem, Viewer.DataProvider.IDataItem {
                    public itemId: string;
                    public itemType: Viewer.DataProvider.ItemType;

                    public getMedia(flags: Viewer.DataProvider.GetMediaFlags, checkCanceled: Viewer.DataProvider.ICheckCanceled): { actualWidth: number, actualHeight: number, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string } {
                        throw new Error('shimmed function ImportAssetDataItem.getMedia');
                    }

                    public getThumbnail(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean, checkCanceled: Viewer.DataProvider.ICheckCanceled): { actualWidth: number, actualHeight: number, actualQuality: Viewer.DataProvider.ThumbnailQuality, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string, ThumbnailId: string } {
                        throw new Error('shimmed function ImportAssetDataItem.getThumbnail');
                    }

                    public getProperty(requestType: Viewer.DataProvider.RequestType, property: string, checkCanceled: Viewer.DataProvider.ICheckCanceled): { returnValue: any, quality: Viewer.DataProvider.PropertyQuality } {
                        throw new Error('shimmed function ImportAssetDataItem.getProperty');
                    }

                }
                export class ImportDataProvider implements Viewer.DataProvider.IDataProvider {
                    constructor(pDeviceRoot: Windows.Storage.IStorageFolder) {}

                    public canApplyTextSearch: Boolean;

                    public getCollectionFromId(containerItemId: string, organization: Viewer.DataProvider.CollectionOrganization, search: string): Viewer.DataProvider.IDataCollection {
                        throw new Error('shimmed function ImportDataProvider.getCollectionFromId');
                    }

                    public getIdFromUri(uri: string, localItem: Boolean): string {
                        throw new Error('shimmed function ImportDataProvider.getIdFromUri');
                    }

                    public getItemFromId(itemId: string): Viewer.DataProvider.IDataItem {
                        throw new Error('shimmed function ImportDataProvider.getItemFromId');
                    }

                    public execute(verb: string, ids: Windows.Foundation.Collections.IIterable<string>, __arguments: any, checkCanceled: Viewer.DataProvider.ICheckCanceled): any {
                        throw new Error('shimmed function ImportDataProvider.execute');
                    }

                    public canSourceSupport(sourceType: string, capability: string): Boolean {
                        throw new Error('shimmed function ImportDataProvider.canSourceSupport');
                    }

                    public updateDataItemPriority(itemId: string, priority: Viewer.DataProvider.DataItemPriority): void {
                        console.warn('shimmed function ImportDataProvider.updateDataItemPriority');
                    }

                    public applicationSuspend(): void {
                        console.warn('shimmed function ImportDataProvider.applicationSuspend');
                    }

                    public applicationResume(): void {
                        console.warn('shimmed function ImportDataProvider.applicationResume');
                    }

                    public onApplicationLaunched(isResume: Boolean): void {
                        console.warn('shimmed function ImportDataProvider.onApplicationLaunched');
                    }

                    public setScreenProperties(screenWidth: number, screenHeight: number, puzzleScaleFactor: number, megastripScaleFactor: number): void {
                        console.warn('shimmed function ImportDataProvider.setScreenProperties');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`ImportDataProvider::addEventListener: ${name}`);
                        switch (name) {
                            case "itemschanged": // Viewer.DataProvider.ProviderItemsChangedHandler
                                break;
                        }

                    }
                }
                export class ImportDataProviderFactory implements IImportDataProviderFactory {
                    public createImportDataProviderInstance(pDeviceRoot: Windows.Storage.IStorageFolder): ImportDataProvider {
                        throw new Error('shimmed function ImportDataProviderFactory.createImportDataProviderInstance');
                    }

                }
                export class ImportDeviceDataCollection implements Viewer.DataProvider.IDataCollection, Windows.Foundation.Collections.IIterable<Viewer.DataProvider.IDataItem>, Viewer.DataProvider.IDataItem {
                    public searchQuery: string;
                    public itemId: string;
                    public itemType: Viewer.DataProvider.ItemType;

                    public getThumbnail(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean, checkCanceled: Viewer.DataProvider.ICheckCanceled): { actualWidth: number, actualHeight: number, actualQuality: Viewer.DataProvider.ThumbnailQuality, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string, ThumbnailId: string } {
                        throw new Error('shimmed function ImportDeviceDataCollection.getThumbnail');
                    }

                    public getProperty(requestType: Viewer.DataProvider.RequestType, property: string, checkCanceled: Viewer.DataProvider.ICheckCanceled): { returnValue: any, quality: Viewer.DataProvider.PropertyQuality } {
                        throw new Error('shimmed function ImportDeviceDataCollection.getProperty');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`ImportDeviceDataCollection::addEventListener: ${name}`);
                        switch (name) {
                            case "itemschanged": // Viewer.DataProvider.CollectionChangedHandler
                                break;
                        }

                    }
                }
                export class ImportObjectsIterator implements Windows.Foundation.Collections.IIterator<Viewer.DataProvider.IDataItem> {
                    public current: Viewer.DataProvider.IDataItem;
                    public hasCurrent: Boolean;

                    public moveNext(): Boolean {
                        throw new Error('shimmed function ImportObjectsIterator.moveNext');
                    }

                    public getMany(): { returnValue: number, items: Viewer.DataProvider.IDataItem } {
                        throw new Error('shimmed function ImportObjectsIterator.getMany');
                    }

                }
            }
            export interface IPhotosDataProvider extends Viewer.DataProvider.IDataProvider {
                getContainerIdForPath(path: string): string;
            }
            export class SourceIterator implements Windows.Foundation.Collections.IIterator<Viewer.DataProvider.IDataItem> {
                public current: Viewer.DataProvider.IDataItem;
                public hasCurrent: Boolean;

                public moveNext(): Boolean {
                    throw new Error('shimmed function SourceIterator.moveNext');
                }

                public getMany(): { returnValue: number, items: Viewer.DataProvider.IDataItem } {
                    throw new Error('shimmed function SourceIterator.getMany');
                }

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
                export type CommandHandler = (context: DataModel.IObjectCollection, inputParam: any) => any;
                export class CommandManager implements ICommandManager {
                    public getCommandStateRegistrar(commandName: string): ICommandStateRegistrar {
                        throw new Error('shimmed function CommandManager.getCommandStateRegistrar');
                    }

                    public isCommandEnabled(commandName: string): Boolean {
                        throw new Error('shimmed function CommandManager.isCommandEnabled');
                    }

                    public isCommandAtStage(commandName: string, stage: string): Boolean {
                        throw new Error('shimmed function CommandManager.isCommandAtStage');
                    }

                    public addCommand(commandName: string, allRequiredProperties: CommandEnableProperties, anyRequiredProperties: CommandEnableProperties, forbiddenProperties: CommandEnableProperties, actionableItems: ExpectedActionableItems, instrumentCommand: Boolean, handler: CommandHandler): void {
                        console.warn('shimmed function CommandManager.addCommand');
                    }

                    public setCommandStage(commandName: string, newCommandStage: string): void {
                        console.warn('shimmed function CommandManager.setCommandStage');
                    }

                    public getCommandStage(commandName: string): string {
                        throw new Error('shimmed function CommandManager.getCommandStage');
                    }

                    public doCommand(commandName: string, surface: CommandSurface, context: DataModel.IObjectCollection, inputParam: any): any {
                        throw new Error('shimmed function CommandManager.doCommand');
                    }

                    public removeCommand(commandName: string): void {
                        console.warn('shimmed function CommandManager.removeCommand');
                    }

                    public disableCommandForViewerRun(commandName: string): void {
                        console.warn('shimmed function CommandManager.disableCommandForViewerRun');
                    }

                    public enableCommandForViewerRun(commandName: string): void {
                        console.warn('shimmed function CommandManager.enableCommandForViewerRun');
                    }

                    public initialize(hub: DataModel.IHub, logWLI: Boolean): void {
                        console.warn('shimmed function CommandManager.initialize');
                    }

                    public setCurrentView(view: CurrentView): void {
                        console.warn('shimmed function CommandManager.setCurrentView');
                    }

                    public setCommandPropertyState(property: CommandEnableProperties, enabled: Boolean): void {
                        console.warn('shimmed function CommandManager.setCommandPropertyState');
                    }

                    public beginBatchUpdatingOfCommandState(): void {
                        console.warn('shimmed function CommandManager.beginBatchUpdatingOfCommandState');
                    }

                    public endBatchUpdatingOfCommandState(): void {
                        console.warn('shimmed function CommandManager.endBatchUpdatingOfCommandState');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`CommandManager::addEventListener: ${name}`);
                        switch (name) {
                            case "commandbatch": // CommandBatchEventHandler
                                break;
                        }

                    }
                }
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
                export class CommandStateRegistrar implements ICommandStateRegistrar {
                    addEventListener(name: string, handler: Function) {
                        console.warn(`CommandStateRegistrar::addEventListener: ${name}`);
                        switch (name) {
                            case "statechanged": // CommandStateChangedEventHandler
                                break;
                        }

                    }
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
                export interface ICommandManager {
                    getCommandStateRegistrar(commandName: string): ICommandStateRegistrar;
                    isCommandEnabled(commandName: string): Boolean;
                    isCommandAtStage(commandName: string, stage: string): Boolean;
                    addCommand(commandName: string, allRequiredProperties: CommandEnableProperties, anyRequiredProperties: CommandEnableProperties, forbiddenProperties: CommandEnableProperties, actionableItems: ExpectedActionableItems, instrumentCommand: Boolean, handler: CommandHandler): void;
                    setCommandStage(commandName: string, newCommandStage: string): void;
                    getCommandStage(commandName: string): string;
                    doCommand(commandName: string, surface: CommandSurface, context: DataModel.IObjectCollection, inputParam: any): any;
                    removeCommand(commandName: string): void;
                    disableCommandForViewerRun(commandName: string): void;
                    enableCommandForViewerRun(commandName: string): void;
                    initialize(hub: DataModel.IHub, logWLI: Boolean): void;
                    setCurrentView(view: CurrentView): void;
                    setCommandPropertyState(property: CommandEnableProperties, enabled: Boolean): void;
                    beginBatchUpdatingOfCommandState(): void;
                    endBatchUpdatingOfCommandState(): void;
                }
                export interface ICommandStateRegistrar {
                }
            }
            export namespace DataModel { 
                export class ActionOperation implements Windows.Foundation.IAsyncAction, Windows.Foundation.IAsyncInfo {
                    public completed: Windows.Foundation.AsyncActionCompletedHandler;
                    public errorCode: number;
                    public id: number;
                    public status: Windows.Foundation.AsyncStatus;

                    public getResults(): void {
                        console.warn('shimmed function ActionOperation.getResults');
                    }

                    public cancel(): void {
                        console.warn('shimmed function ActionOperation.cancel');
                    }

                    public close(): void {
                        console.warn('shimmed function ActionOperation.close');
                    }

                }
                export class Asset implements IAsset, IObject {
                    public dimensions: Windows.Foundation.Size | null;
                    public id: string;
                    public source: Container;
                    public sourceId: string;
                    public sourceType: string;
                    public type: string;

                    public getMediaAsync(flags: GetMediaAsyncFlags): ObjectGetBlobOperation {
                        throw new Error('shimmed function Asset.getMediaAsync');
                    }

                    public getProperties(propertyNames: string[], callback: ObjectGetPropertiesHandler): void {
                        console.warn('shimmed function Asset.getProperties');
                    }

                    public getThumbnailAsync(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean): ObjectGetBlobOperation {
                        throw new Error('shimmed function Asset.getThumbnailAsync');
                    }

                    public writeTo(propertySet: string[]): void {
                        console.warn('shimmed function Asset.writeTo');
                    }

                    public executeAsync(verb: string, args: any): ExecuteOperation {
                        throw new Error('shimmed function Asset.executeAsync');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`Asset::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export enum BlobResultQuality {
                    error,
                    lowQualityNothingPending,
                    lowQualityBetterPending,
                    highQuality,
                }
                export class Container implements IContainer, IObject {
                    public searchQuery: string;
                    public shape: ContainerShape;
                    public dimensions: Windows.Foundation.Size | null;
                    public id: string;
                    public source: Container;
                    public sourceId: string;
                    public sourceType: string;
                    public type: string;

                    public getProperties(propertyNames: string[], callback: ObjectGetPropertiesHandler): void {
                        console.warn('shimmed function Container.getProperties');
                    }

                    public getThumbnailAsync(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean): ObjectGetBlobOperation {
                        throw new Error('shimmed function Container.getThumbnailAsync');
                    }

                    public writeTo(propertySet: string[]): void {
                        console.warn('shimmed function Container.writeTo');
                    }

                    public executeAsync(verb: string, args: any): ExecuteOperation {
                        throw new Error('shimmed function Container.executeAsync');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`Container::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export enum ContainerShape {
                    byAlbum,
                    byDate,
                }
                export class ExecuteOperation implements Windows.Foundation.IAsyncOperation<any>, Windows.Foundation.IAsyncInfo {
                    public completed: Windows.Foundation.AsyncOperationCompletedHandler<any>;
                    public errorCode: number;
                    public id: number;
                    public status: Windows.Foundation.AsyncStatus;

                    public getResults(): any {
                        throw new Error('shimmed function ExecuteOperation.getResults');
                    }

                    public cancel(): void {
                        console.warn('shimmed function ExecuteOperation.cancel');
                    }

                    public close(): void {
                        console.warn('shimmed function ExecuteOperation.close');
                    }

                }
                export class Formatting {
                    public static formatDuration(seconds: number): string {
                        throw new Error('shimmed function Formatting.formatDuration');
                    }

                }
                export enum GetMediaAsyncFlags {
                    none,
                    transcodeToInboxCodec,
                    oneUpSizeForRemotePhotos,
                    streamForRemoteVideos = 4,
                    largestAvailableLocally = 8,
                }
                export class Hub implements IHub {
                    constructor(provider: DataProvider.IDataProvider) {}

                    public activeItem: ObjectCollection;
                    public content: ObjectCollection;
                    public contentContainer: Container;
                    public selection: ObjectCollection;

                    public updateActiveItem(id: string): void {
                        console.warn('shimmed function Hub.updateActiveItem');
                    }

                    public getObject(id: string): IObject {
                        throw new Error('shimmed function Hub.getObject');
                    }

                    public createRootContainer(): Container {
                        throw new Error('shimmed function Hub.createRootContainer');
                    }

                    public createMultiUpAlbumRootContainer(): IterableContainer {
                        throw new Error('shimmed function Hub.createMultiUpAlbumRootContainer');
                    }

                    public getPicturesLibraryContainer(): Container {
                        throw new Error('shimmed function Hub.getPicturesLibraryContainer');
                    }

                    public readObject(propertySet: string[]): IObject {
                        throw new Error('shimmed function Hub.readObject');
                    }

                    public readFrom(appDataContainer: Windows.Storage.ApplicationDataContainer): void {
                        console.warn('shimmed function Hub.readFrom');
                    }

                    public writeTo(appDataContainer: Windows.Storage.ApplicationDataContainer): void {
                        console.warn('shimmed function Hub.writeTo');
                    }

                    public executeAsync(verb: string, args: any): ExecuteOperation {
                        throw new Error('shimmed function Hub.executeAsync');
                    }

                    public canSourceSupport(sourceType: string, capability: string): Boolean {
                        throw new Error('shimmed function Hub.canSourceSupport');
                    }

                    public getIdFromUri(uri: string, localItem: Boolean): string {
                        throw new Error('shimmed function Hub.getIdFromUri');
                    }

                    public applicationSuspend(): void {
                        console.warn('shimmed function Hub.applicationSuspend');
                    }

                    public applicationResume(): void {
                        console.warn('shimmed function Hub.applicationResume');
                    }

                    public onApplicationLaunched(isResume: Boolean): void {
                        console.warn('shimmed function Hub.onApplicationLaunched');
                    }

                    public setScreenProperties(screenWidth: number, screenHeight: number, puzzleScaleFactor: number, megastripScaleFactor: number): void {
                        console.warn('shimmed function Hub.setScreenProperties');
                    }

                    public dump(verbosity: number): string {
                        throw new Error('shimmed function Hub.dump');
                    }

                }
                export class HubFactory implements IHubFactory {
                    public createInstance(provider: DataProvider.IDataProvider): Hub {
                        throw new Error('shimmed function HubFactory.createInstance');
                    }

                }
                export interface IAsset extends IObject {
                    getMediaAsync(flags: GetMediaAsyncFlags): ObjectGetBlobOperation;
                }
                export interface IContainer extends IObject {
                    searchQuery: string;
                    shape: ContainerShape;
                }
                export interface IFormattingStatics {
                    formatDuration(seconds: number): string;
                }
                export interface IHub {
                    activeItem: ObjectCollection;
                    content: ObjectCollection;
                    contentContainer: Container;
                    selection: ObjectCollection;
                    updateActiveItem(id: string): void;
                    getObject(id: string): IObject;
                    createRootContainer(): Container;
                    createMultiUpAlbumRootContainer(): IterableContainer;
                    getPicturesLibraryContainer(): Container;
                    readObject(propertySet: string[]): IObject;
                    readFrom(appDataContainer: Windows.Storage.ApplicationDataContainer): void;
                    writeTo(appDataContainer: Windows.Storage.ApplicationDataContainer): void;
                    executeAsync(verb: string, args: any): ExecuteOperation;
                    canSourceSupport(sourceType: string, capability: string): Boolean;
                    getIdFromUri(uri: string, localItem: Boolean): string;
                    applicationSuspend(): void;
                    applicationResume(): void;
                    onApplicationLaunched(isResume: Boolean): void;
                    setScreenProperties(screenWidth: number, screenHeight: number, puzzleScaleFactor: number, megastripScaleFactor: number): void;
                    dump(verbosity: number): string;
                }
                export interface IHubFactory {
                    createInstance(provider: DataProvider.IDataProvider): Hub;
                }
                export interface IIterableContainer extends IContainer, IObject {
                    nextActiveItem: Container;
                }
                export interface IObject {
                    dimensions: Windows.Foundation.Size | null;
                    id: string;
                    source: Container;
                    sourceId: string;
                    sourceType: string;
                    type: string;
                    getProperties(propertyNames: string[], callback: ObjectGetPropertiesHandler): void;
                    getThumbnailAsync(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean): ObjectGetBlobOperation;
                    writeTo(propertySet: string[]): void;
                    executeAsync(verb: string, args: any): ExecuteOperation;
                }
                export interface IObjectCollection {
                    firstAssetPosition: number | null;
                    isPopulationComplete: Boolean;
                    size: number;
                    sourceType: string;
                    getView(): string[];
                    idAt(position: number): string;
                    objectAt(position: number): IObject;
                    lookup(id: string): number | null;
                    insertAt(position: number, id: string): number | null;
                    insertRangeAt(position: number, ids: string[]): number;
                    append(id: string): number | null;
                    appendRange(ids: string[]): number;
                    removeSet(ids: string[]): void;
                    removeRangeAt(position: number, count: number): void;
                    clear(): void;
                    setPriorityRange(position: number, count: number): void;
                    createDataPackage(): Windows.ApplicationModel.DataTransfer.DataPackage;
                    readFrom(propertySet: string[]): void;
                    writeTo(propertySet: string[]): void;
                    executeAsync(verb: string, args: any): ExecuteOperation;
                }
                export interface IObjectGetBlobOperationResult {
                    data: Windows.Storage.Streams.IRandomAccessStream;
                    dimensions: Windows.Foundation.Size;
                    file: Windows.Storage.IStorageFile;
                    mimeType: string;
                    quality: BlobResultQuality;
                    thumbnailId: string;
                    uri: string;
                }
                export class IterableContainer implements IIterableContainer, IContainer, IObject {
                    public nextActiveItem: Container;
                    public searchQuery: string;
                    public shape: ContainerShape;
                    public dimensions: Windows.Foundation.Size | null;
                    public id: string;
                    public source: Container;
                    public sourceId: string;
                    public sourceType: string;
                    public type: string;

                    public getProperties(propertyNames: string[], callback: ObjectGetPropertiesHandler): void {
                        console.warn('shimmed function IterableContainer.getProperties');
                    }

                    public getThumbnailAsync(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean): ObjectGetBlobOperation {
                        throw new Error('shimmed function IterableContainer.getThumbnailAsync');
                    }

                    public writeTo(propertySet: string[]): void {
                        console.warn('shimmed function IterableContainer.writeTo');
                    }

                    public executeAsync(verb: string, args: any): ExecuteOperation {
                        throw new Error('shimmed function IterableContainer.executeAsync');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`IterableContainer::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                                break;
                        }

                    }
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
                export class ObjectCollection implements IObjectCollection {
                    public firstAssetPosition: number | null;
                    public isPopulationComplete: Boolean;
                    public size: number;
                    public sourceType: string;

                    public getView(): string[] {
                        throw new Error('shimmed function ObjectCollection.getView');
                    }

                    public idAt(position: number): string {
                        throw new Error('shimmed function ObjectCollection.idAt');
                    }

                    public objectAt(position: number): IObject {
                        throw new Error('shimmed function ObjectCollection.objectAt');
                    }

                    public lookup(id: string): number | null {
                        throw new Error('shimmed function ObjectCollection.lookup');
                    }

                    public insertAt(position: number, id: string): number | null {
                        throw new Error('shimmed function ObjectCollection.insertAt');
                    }

                    public insertRangeAt(position: number, ids: string[]): number {
                        throw new Error('shimmed function ObjectCollection.insertRangeAt');
                    }

                    public append(id: string): number | null {
                        throw new Error('shimmed function ObjectCollection.append');
                    }

                    public appendRange(ids: string[]): number {
                        throw new Error('shimmed function ObjectCollection.appendRange');
                    }

                    public removeSet(ids: string[]): void {
                        console.warn('shimmed function ObjectCollection.removeSet');
                    }

                    public removeRangeAt(position: number, count: number): void {
                        console.warn('shimmed function ObjectCollection.removeRangeAt');
                    }

                    public clear(): void {
                        console.warn('shimmed function ObjectCollection.clear');
                    }

                    public setPriorityRange(position: number, count: number): void {
                        console.warn('shimmed function ObjectCollection.setPriorityRange');
                    }

                    public createDataPackage(): Windows.ApplicationModel.DataTransfer.DataPackage {
                        throw new Error('shimmed function ObjectCollection.createDataPackage');
                    }

                    public readFrom(propertySet: string[]): void {
                        console.warn('shimmed function ObjectCollection.readFrom');
                    }

                    public writeTo(propertySet: string[]): void {
                        console.warn('shimmed function ObjectCollection.writeTo');
                    }

                    public executeAsync(verb: string, args: any): ExecuteOperation {
                        throw new Error('shimmed function ObjectCollection.executeAsync');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`ObjectCollection::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectCollectionChangedHandler
                                break;
                        }

                    }
                }
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
                export class ObjectGetBlobOperation implements Windows.Foundation.IAsyncOperation<IObjectGetBlobOperationResult>, Windows.Foundation.IAsyncInfo {
                    public completed: Windows.Foundation.AsyncOperationCompletedHandler<IObjectGetBlobOperationResult>;
                    public errorCode: number;
                    public id: number;
                    public status: Windows.Foundation.AsyncStatus;

                    public getResults(): IObjectGetBlobOperationResult {
                        throw new Error('shimmed function ObjectGetBlobOperation.getResults');
                    }

                    public cancel(): void {
                        console.warn('shimmed function ObjectGetBlobOperation.cancel');
                    }

                    public close(): void {
                        console.warn('shimmed function ObjectGetBlobOperation.close');
                    }

                }
                export class ObjectGetBlobOperationResult implements IObjectGetBlobOperationResult {
                    public data: Windows.Storage.Streams.IRandomAccessStream;
                    public dimensions: Windows.Foundation.Size;
                    public file: Windows.Storage.IStorageFile;
                    public mimeType: string;
                    public quality: BlobResultQuality;
                    public thumbnailId: string;
                    public uri: string;

                }
                export type ObjectGetPropertiesHandler = (props: string[], final: Boolean) => void;
            }
            export namespace DataProvider { 
                export class AssetDataItem implements IAssetDataItem, IDataItem {
                    public itemId: string;
                    public itemType: ItemType;

                    public getMedia(flags: GetMediaFlags, checkCanceled: ICheckCanceled): { actualWidth: number, actualHeight: number, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string } {
                        throw new Error('shimmed function AssetDataItem.getMedia');
                    }

                    public getThumbnail(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean, checkCanceled: ICheckCanceled): { actualWidth: number, actualHeight: number, actualQuality: ThumbnailQuality, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string, ThumbnailId: string } {
                        throw new Error('shimmed function AssetDataItem.getThumbnail');
                    }

                    public getProperty(requestType: RequestType, property: string, checkCanceled: ICheckCanceled): { returnValue: any, quality: PropertyQuality } {
                        throw new Error('shimmed function AssetDataItem.getProperty');
                    }

                }
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
                export class DataCollection implements IDataCollection, Windows.Foundation.Collections.IIterable<IDataItem>, IDataItem {
                    public searchQuery: string;
                    public itemId: string;
                    public itemType: ItemType;

                    public getThumbnail(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean, checkCanceled: ICheckCanceled): { actualWidth: number, actualHeight: number, actualQuality: ThumbnailQuality, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string, ThumbnailId: string } {
                        throw new Error('shimmed function DataCollection.getThumbnail');
                    }

                    public getProperty(requestType: RequestType, property: string, checkCanceled: ICheckCanceled): { returnValue: any, quality: PropertyQuality } {
                        throw new Error('shimmed function DataCollection.getProperty');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`DataCollection::addEventListener: ${name}`);
                        switch (name) {
                            case "itemschanged": // CollectionChangedHandler
                                break;
                        }

                    }
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
                export interface IAssetDataItem extends IDataItem {
                    getMedia(flags: GetMediaFlags, checkCanceled: ICheckCanceled): { actualWidth: number, actualHeight: number, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string };
                }
                export interface ICheckCanceled {
                    cancelEvent: number;
                    canceled: Boolean;
                }
                export interface IDataCollection extends Windows.Foundation.Collections.IIterable<IDataItem>, IDataItem {
                    searchQuery: string;
                }
                export interface IDataItem {
                    itemId: string;
                    itemType: ItemType;
                    getThumbnail(requestedWidth: number, requestedHeight: number, currentThumbnailId: string, wantFreshThumb: Boolean, checkCanceled: ICheckCanceled): { actualWidth: number, actualHeight: number, actualQuality: ThumbnailQuality, file: Windows.Storage.IStorageFile, mimeType: string, stream: Windows.Storage.Streams.IRandomAccessStream, uri: string, ThumbnailId: string };
                    getProperty(requestType: RequestType, property: string, checkCanceled: ICheckCanceled): { returnValue: any, quality: PropertyQuality };
                }
                export interface IDataProvider {
                    canApplyTextSearch: Boolean;
                    getCollectionFromId(containerItemId: string, organization: CollectionOrganization, search: string): IDataCollection;
                    getIdFromUri(uri: string, localItem: Boolean): string;
                    getItemFromId(itemId: string): IDataItem;
                    execute(verb: string, ids: Windows.Foundation.Collections.IIterable<string>, __arguments: any, checkCanceled: ICheckCanceled): any;
                    canSourceSupport(sourceType: string, capability: string): Boolean;
                    updateDataItemPriority(itemId: string, priority: DataItemPriority): void;
                    applicationSuspend(): void;
                    applicationResume(): void;
                    onApplicationLaunched(isResume: Boolean): void;
                    setScreenProperties(screenWidth: number, screenHeight: number, puzzleScaleFactor: number, megastripScaleFactor: number): void;
                }
                export interface IPhotoViewerDataProvider extends IDataProvider {
                    getPicturesLibraryId(): string;
                    getMultiUpAlbumsRootId(): string;
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
}
