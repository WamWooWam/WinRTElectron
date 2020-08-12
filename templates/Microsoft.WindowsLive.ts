import { IAsyncAction } from "winrt-node/Windows.Foundation";

export namespace Microsoft { 
    export namespace LiveComm { 
        export class FirstRun {
            run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                console.warn('shimmed function FirstRun.run');
            }

        }
    }
    export namespace PerfTrack { 
        export interface IPerfTrackFactory {
            makeLogger(dataUploadEnabled: Boolean): PerfTrackLogger;
        }
        export interface IPerfTrackLogger {
            dataUploadEnabled: Boolean;
            writeStartEvent(scenarioId: number, scenarioName: string, matchKey: string): void;
            writeStopEvent(scenarioId: number, scenarioName: string, matchKey: string): void;
            writeStopEventWithMetadata(scenarioId: number, scenarioName: string, matchKey: string, dword1: number, dword2: number, dword3: number, dword4: number, dword5: number, string1: string, string2: string): void;
            writeTriggerEvent(scenarioId: number, scenarioName: string, duration: number): void;
            writeLaunchStopEvent(timePoint: PerfTrackTimePoint, activationKind: number): void;
            writeResumeStopEvent(timePoint: PerfTrackTimePoint): void;
            writeResizeStopEvent(timePoint: PerfTrackTimePoint, isMajorChange: Boolean, isRotate: Boolean, logicalWidth: number, logicalHeight: number): void;
            writeTriggerEventWithMetadata(scenarioId: number, scenarioName: string, duration: number, dword1: number, dword2: number, dword3: number, dword4: number, dword5: number, string1: string, string2: string): void;
            enableDataUpload(): void;
            disableDataUpload(): void;
        }
        export interface IPerfTrackStaticMethods {
            windowsDataUploadEnabled: Boolean;
        }
        export class PerfTrackLogger implements IPerfTrackLogger {
            constructor(dataUploadEnabled: Boolean) {}

            dataUploadEnabled: Boolean;
            static windowsDataUploadEnabled: Boolean;

            writeStartEvent(scenarioId: number, scenarioName: string, matchKey: string): void {
                console.warn('shimmed function PerfTrackLogger.writeStartEvent');
            }

            writeStopEvent(scenarioId: number, scenarioName: string, matchKey: string): void {
                console.warn('shimmed function PerfTrackLogger.writeStopEvent');
            }

            writeStopEventWithMetadata(scenarioId: number, scenarioName: string, matchKey: string, dword1: number, dword2: number, dword3: number, dword4: number, dword5: number, string1: string, string2: string): void {
                console.warn('shimmed function PerfTrackLogger.writeStopEventWithMetadata');
            }

            writeTriggerEvent(scenarioId: number, scenarioName: string, duration: number): void {
                console.warn('shimmed function PerfTrackLogger.writeTriggerEvent');
            }

            writeLaunchStopEvent(timePoint: PerfTrackTimePoint, activationKind: number): void {
                console.warn('shimmed function PerfTrackLogger.writeLaunchStopEvent');
            }

            writeResumeStopEvent(timePoint: PerfTrackTimePoint): void {
                console.warn('shimmed function PerfTrackLogger.writeResumeStopEvent');
            }

            writeResizeStopEvent(timePoint: PerfTrackTimePoint, isMajorChange: Boolean, isRotate: Boolean, logicalWidth: number, logicalHeight: number): void {
                console.warn('shimmed function PerfTrackLogger.writeResizeStopEvent');
            }

            writeTriggerEventWithMetadata(scenarioId: number, scenarioName: string, duration: number, dword1: number, dword2: number, dword3: number, dword4: number, dword5: number, string1: string, string2: string): void {
                console.warn('shimmed function PerfTrackLogger.writeTriggerEventWithMetadata');
            }

            enableDataUpload(): void {
                console.warn('shimmed function PerfTrackLogger.enableDataUpload');
            }

            disableDataUpload(): void {
                console.warn('shimmed function PerfTrackLogger.disableDataUpload');
            }

        }
        export enum PerfTrackTimePoint {
            visibleComplete,
            responsive,
        }
    }
    export namespace WindowsLive { 
        export namespace Cid { 
            export enum CidFormat {
                hexidecimal,
                decimal,
                guid,
            }
            export class CidFormatter implements IEmpty {
            }
            export interface ICidFormatter {
            }
            export interface IEmpty {
            }
        }
        export namespace Config { 
            export namespace Shared { 
                export class App implements IApp {
                    currentVersion: string;
                    id: ApplicationId;
                    message: string;
                    minVersion: string;
                    moreInfoUrl: string;

                }
                export enum AppId {
                    chat,
                    call,
                    mail,
                    calendar,
                    people,
                    photo,
                    skydrive,
                    testapp1,
                    testapp2,
                    testapp3,
                    max,
                }
                export class Application implements IApplication {
                    addAppBarButton: Boolean;
                    addSettingsLink: Boolean;
                    enableLogCollection: Boolean;
                    helpFlyoutUrl: string;
                    id: AppId;
                    surveyId: number;

                }
                export enum ApplicationId {
                    chat,
                    call,
                    mail,
                    calendar,
                    people,
                    photo,
                    skydrive,
                    testapp1,
                    testapp2,
                    testapp3,
                    livecomm,
                    max,
                }
                export class Feedback implements IFeedback {
                    application: AppId[];
                    enableFeedback: Boolean;
                    fmsdomain: string;
                    privacyUrl: string;
                    supportedMarkets: ISupportedMarkets;

                    close(): void {
                        console.warn('shimmed function Feedback.close');
                    }

                    static loadAsync(obj: any): IAsyncOperation<IFeedback> {
                        throw new Error('shimmed function Feedback.loadAsync');
                    }

                    static loadAsync_1(client: IClient): IAsyncOperation<IFeedback> {
                        throw new Error('shimmed function Feedback.loadAsync_1');
                    }

                    static loadAsync_2(manager: IConfigManager): IAsyncOperation<IFeedback> {
                        throw new Error('shimmed function Feedback.loadAsync_2');
                    }

                    static loadAsync_3(uri: /* System.Uri */ any): IAsyncOperation<IFeedback> {
                        throw new Error('shimmed function Feedback.loadAsync_3');
                    }

                    static loadAsync_4(pFile: /* Windows.Storage.IStorageFile */ any): IAsyncOperation<IFeedback> {
                        throw new Error('shimmed function Feedback.loadAsync_4');
                    }

                    static loadAsync_5(xml: string): IAsyncOperation<IFeedback> {
                        throw new Error('shimmed function Feedback.loadAsync_5');
                    }

                    static loadPlatform(pClient: IClient): IFeedback {
                        throw new Error('shimmed function Feedback.loadPlatform');
                    }

                    static loadManager(pManager: IConfigManager): IFeedback {
                        throw new Error('shimmed function Feedback.loadManager');
                    }

                    static loadUri(pUri: /* System.Uri */ any): IFeedback {
                        throw new Error('shimmed function Feedback.loadUri');
                    }

                    static loadStorageFile(pFile: /* Windows.Storage.IStorageFile */ any): IFeedback {
                        throw new Error('shimmed function Feedback.loadStorageFile');
                    }

                    static loadXml(strXml: string): IFeedback {
                        throw new Error('shimmed function Feedback.loadXml');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`Feedback::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // /* Windows.Foundation.TypedEventHandler`2[[Microsoft.WindowsLive.Config.Shared.IFeedback, Microsoft, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime],[System.Object, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any
                                break;
                        }

                    }
                }
                export interface IApp {
                    currentVersion: string;
                    id: ApplicationId;
                    message: string;
                    minVersion: string;
                    moreInfoUrl: string;
                }
                export interface IApplication {
                    addAppBarButton: Boolean;
                    addSettingsLink: Boolean;
                    enableLogCollection: Boolean;
                    helpFlyoutUrl: string;
                    id: AppId;
                    surveyId: number;
                }
                export interface IFeedback {
                    application: AppId[];
                    enableFeedback: Boolean;
                    fmsdomain: string;
                    privacyUrl: string;
                    supportedMarkets: ISupportedMarkets;
                }
                export interface IFeedbackStatics {
                    loadAsync(obj: any): IAsyncOperation<IFeedback>;
                    loadAsync_1(client: IClient): IAsyncOperation<IFeedback>;
                    loadAsync_2(manager: IConfigManager): IAsyncOperation<IFeedback>;
                    loadAsync_3(uri: /* System.Uri */ any): IAsyncOperation<IFeedback>;
                    loadAsync_4(pFile: /* Windows.Storage.IStorageFile */ any): IAsyncOperation<IFeedback>;
                    loadAsync_5(xml: string): IAsyncOperation<IFeedback>;
                    loadPlatform(pClient: IClient): IFeedback;
                    loadManager(pManager: IConfigManager): IFeedback;
                    loadUri(pUri: /* System.Uri */ any): IFeedback;
                    loadStorageFile(pFile: /* Windows.Storage.IStorageFile */ any): IFeedback;
                    loadXml(strXml: string): IFeedback;
                }
                export interface IMarket {
                    id: string;
                    isEnabled: Boolean;
                    language: string;
                }
                export interface ISuiteUpdate {
                    app: ApplicationId[];
                }
                export interface ISuiteUpdateStatics {
                    loadAsync(obj: any): IAsyncOperation<ISuiteUpdate>;
                    loadAsync_1(client: IClient): IAsyncOperation<ISuiteUpdate>;
                    loadAsync_2(manager: IConfigManager): IAsyncOperation<ISuiteUpdate>;
                    loadAsync_3(uri: /* System.Uri */ any): IAsyncOperation<ISuiteUpdate>;
                    loadAsync_4(pFile: /* Windows.Storage.IStorageFile */ any): IAsyncOperation<ISuiteUpdate>;
                    loadAsync_5(xml: string): IAsyncOperation<ISuiteUpdate>;
                    loadPlatform(pClient: IClient): ISuiteUpdate;
                    loadManager(pManager: IConfigManager): ISuiteUpdate;
                    loadUri(pUri: /* System.Uri */ any): ISuiteUpdate;
                    loadStorageFile(pFile: /* Windows.Storage.IStorageFile */ any): ISuiteUpdate;
                    loadXml(strXml: string): ISuiteUpdate;
                }
                export interface ISupportedMarkets {
                    market: string[];
                }
                export class Market implements IMarket {
                    id: string;
                    isEnabled: Boolean;
                    language: string;

                }
                export class SuiteUpdate implements ISuiteUpdate {
                    app: ApplicationId[];

                    close(): void {
                        console.warn('shimmed function SuiteUpdate.close');
                    }

                    static loadAsync(obj: any): IAsyncOperation<ISuiteUpdate> {
                        throw new Error('shimmed function SuiteUpdate.loadAsync');
                    }

                    static loadAsync_1(client: IClient): IAsyncOperation<ISuiteUpdate> {
                        throw new Error('shimmed function SuiteUpdate.loadAsync_1');
                    }

                    static loadAsync_2(manager: IConfigManager): IAsyncOperation<ISuiteUpdate> {
                        throw new Error('shimmed function SuiteUpdate.loadAsync_2');
                    }

                    static loadAsync_3(uri: /* System.Uri */ any): IAsyncOperation<ISuiteUpdate> {
                        throw new Error('shimmed function SuiteUpdate.loadAsync_3');
                    }

                    static loadAsync_4(pFile: /* Windows.Storage.IStorageFile */ any): IAsyncOperation<ISuiteUpdate> {
                        throw new Error('shimmed function SuiteUpdate.loadAsync_4');
                    }

                    static loadAsync_5(xml: string): IAsyncOperation<ISuiteUpdate> {
                        throw new Error('shimmed function SuiteUpdate.loadAsync_5');
                    }

                    static loadPlatform(pClient: IClient): ISuiteUpdate {
                        throw new Error('shimmed function SuiteUpdate.loadPlatform');
                    }

                    static loadManager(pManager: IConfigManager): ISuiteUpdate {
                        throw new Error('shimmed function SuiteUpdate.loadManager');
                    }

                    static loadUri(pUri: /* System.Uri */ any): ISuiteUpdate {
                        throw new Error('shimmed function SuiteUpdate.loadUri');
                    }

                    static loadStorageFile(pFile: /* Windows.Storage.IStorageFile */ any): ISuiteUpdate {
                        throw new Error('shimmed function SuiteUpdate.loadStorageFile');
                    }

                    static loadXml(strXml: string): ISuiteUpdate {
                        throw new Error('shimmed function SuiteUpdate.loadXml');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`SuiteUpdate::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // /* Windows.Foundation.TypedEventHandler`2[[Microsoft.WindowsLive.Config.Shared.ISuiteUpdate, Microsoft, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime],[System.Object, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any
                                break;
                        }

                    }
                }
                export class SupportedMarkets implements ISupportedMarkets {
                    market: string[];

                }
            }
        }
        export enum FallbackLogic {
            countryRegion,
            language,
        }
        export interface IJx {
            etw(hstrEventName: string): void;
            ptStart(hstrName: string, hstrKey: string): void;
            ptStop(hstrName: string, hstrKey: string): void;
            ptStopData(hstrName: string, hstrKey: string, dw1: number, dw2: number, dw3: number, dw4: number, dw5: number, hstrData1: string, hstrData2: string): void;
            ptStopLaunch(timePoint: number, kind: number): void;
            ptStopResume(timePoint: number): void;
            ptStopResize(timePoint: number, isMajorChange: Boolean, isRotate: Boolean, logicalWidth: number, logicalHeight: number): void;
            erRegisterFile(hstrFilePath: string): void;
            fault(hstrScenarioName: string, hstrErrorLocationId: string, hrFaultCode: number): void;
            startSession(): void;
            flushSession(): void;
        }
        export interface IMarketStatics {
            get(fallback: FallbackLogic): string;
            getLCID(fallback: FallbackLogic): number;
        }
        export namespace Instrumentation { 
            export enum ApiId {
                unknown,
                unitTest,
                skyDrive_Json_GetItems = 2501013,
                skyDrive_Json_DeleteItems = 2501025,
                si_ScenarioQos = 3701400,
                storage_Dav_Get = 4202000,
                storage_Dav_Put,
                shareAnything_Status = 9800000,
                facebook_Graph_PostComment = 11500005,
                facebook_Fql_Multiquery_GetComments = 11500007,
                facebook_Fql_MultiQuery_GetLikes = 11500026,
                facebook_Graph_PostLike,
                facebook_Graph_DeleteLike,
                facebook_Fql_Multiquery_GetContactsActivities = 11500035,
                facebook_Fql_Multiquery_GetActivities,
                facebook_Fql_Multiquery_GetSocialNotifications,
                facebook_Fql_Multiquery_GetPhotos = 11500043,
                facebook_Fql_Multiquery_GetAlbums,
                facebook_Fql_Multiquery_GetPhotosAlbumsVideos = 11500046,
                facebook_Fql_Multiquery_GetActivity = 11500048,
                facebook_Fql_Multiquery_GetPhoto,
                facebook_Fql_Multiquery_GetAlbum,
                facebook_Fql_Query_GetUnreadNotificationCount,
                facebook_LegacyRest_MarkNotificationsRead,
                facebook_Graph_PostFeed,
                psa_SN_ReactionsAPI_Retweets_Get = 29300009,
                psa_SN_ReactionsAPI_Retweets_Post,
                psa_SN_ReactionsAPI_Replies_Get,
                psa_SN_ReactionsAPI_Replies_Post,
                psa_SN_ActivityStreamAPI_RecentActivity,
                psa_SN_ActivityStreamAPI_WhatsNew,
                psa_SN_ActivityStreamAPI_Notifications = 29300016,
                psa_SN_ReactionsAPI_Favorites_Get,
                psa_SN_ReactionsAPI_Favorites_Post,
                psa_SN_ReactionsAPI_Favorites_Delete,
                psa_SN_ReactionsAPI_Comments_Get,
                psa_SN_ReactionsAPI_Comments_Post,
                psa_SN_ReactionsAPI_Forwards_Get,
                psa_SN_ReactionsAPI_Forwards_Post,
                fms_LoadSurvey = 29700000,
            }
            export class Bici implements IBici {
                errorsFound: Boolean;
                applicationId: number;

                startExperience(): void {
                    console.warn('shimmed function Bici.startExperience');
                }

                endExperience(): void {
                    console.warn('shimmed function Bici.endExperience');
                }

                pauseExperience(): void {
                    console.warn('shimmed function Bici.pauseExperience');
                }

                continueExperience(): void {
                    console.warn('shimmed function Bici.continueExperience');
                }

                transferExperienceToWeb(inputUrl: string): string {
                    throw new Error('shimmed function Bici.transferExperienceToWeb');
                }

                set(datapointId: number, datapointValue: number): void {
                    console.warn('shimmed function Bici.set');
                }

                setString(datapointId: number, datapointValue: string): void {
                    console.warn('shimmed function Bici.setString');
                }

                increment(datapointId: number, increment: number): void {
                    console.warn('shimmed function Bici.increment');
                }

                addToStream(datapointId: number, datapointValueList: IDatapointValueList): void {
                    console.warn('shimmed function Bici.addToStream');
                }

                getExperienceId(): string {
                    throw new Error('shimmed function Bici.getExperienceId');
                }

                setPrimaryIdentity(identity: /* Windows.Security.Authentication.OnlineId.UserIdentity */ any): void {
                    console.warn('shimmed function Bici.setPrimaryIdentity');
                }

                convertPuidToAnid(puid: string): string {
                    throw new Error('shimmed function Bici.convertPuidToAnid');
                }

                recordQosStream(scenarioId: ScenarioId, action: ApiId, target: PropertyId, durationInMillisecond: number, errorCode: number, errorType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void {
                    console.warn('shimmed function Bici.recordQosStream');
                }

                recordDependentApiQos(scenario: ScenarioId, api: ApiId, target: PropertyId, durationInMillisecond: number, requestSizeInBytes: number, returnCode: number, returnType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void {
                    console.warn('shimmed function Bici.recordDependentApiQos');
                }

                recordIncomingApiQos(datapointId: ScenarioId, action: ApiId, callerProperty: PropertyId, durationInMillisecond: number, requestSizeInBytes: number, returnCode: number, returnType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void {
                    console.warn('shimmed function Bici.recordIncomingApiQos');
                }

                recordInternalApiQos(datapointId: ScenarioId, action: ApiId, durationInMillisecond: number, requestSizeInBytes: number, returnCode: number, returnType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void {
                    console.warn('shimmed function Bici.recordInternalApiQos');
                }

                recordScenarioQos(datapointId: ScenarioId, durationInMillisecond: number, requestSizeInBytes: number, returnCode: number, returnType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void {
                    console.warn('shimmed function Bici.recordScenarioQos');
                }

                reloadConfig(): void {
                    console.warn('shimmed function Bici.reloadConfig');
                }

                testLoading(): string {
                    throw new Error('shimmed function Bici.testLoading');
                }

                compactNColsToOneStringCol(pBytes: /* System.Byte[] */ any): string {
                    throw new Error('shimmed function Bici.compactNColsToOneStringCol');
                }

                uncompactOneStringColToNCols(header: string): /* System.Byte[] */ any {
                    throw new Error('shimmed function Bici.uncompactOneStringColToNCols');
                }

            }
            export class DatapointValueList implements IDatapointValueList {
                valid: Boolean;

                add(datapointValue: number): void {
                    console.warn('shimmed function DatapointValueList.add');
                }

                addString(datapointValue: string): void {
                    console.warn('shimmed function DatapointValueList.addString');
                }

                addValueList(datapointValueList: DatapointValueList): void {
                    console.warn('shimmed function DatapointValueList.addValueList');
                }

            }
            export enum ErrorType {
                success,
                client,
                server,
                network,
                fault,
            }
            export interface IBici {
                applicationId: number;
                errorsFound: Boolean;
                startExperience(): void;
                endExperience(): void;
                pauseExperience(): void;
                continueExperience(): void;
                transferExperienceToWeb(inputUrl: string): string;
                set(datapointId: number, datapointValue: number): void;
                setString(datapointId: number, datapointValue: string): void;
                increment(datapointId: number, increment: number): void;
                addToStream(datapointId: number, datapointValueList: IDatapointValueList): void;
                getExperienceId(): string;
                setPrimaryIdentity(identity: /* Windows.Security.Authentication.OnlineId.UserIdentity */ any): void;
                convertPuidToAnid(puid: string): string;
                recordQosStream(scenarioId: ScenarioId, action: ApiId, target: PropertyId, durationInMillisecond: number, errorCode: number, errorType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void;
                recordDependentApiQos(scenario: ScenarioId, api: ApiId, target: PropertyId, durationInMillisecond: number, requestSizeInBytes: number, returnCode: number, returnType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void;
                recordIncomingApiQos(datapointId: ScenarioId, action: ApiId, callerProperty: PropertyId, durationInMillisecond: number, requestSizeInBytes: number, returnCode: number, returnType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void;
                recordInternalApiQos(datapointId: ScenarioId, action: ApiId, durationInMillisecond: number, requestSizeInBytes: number, returnCode: number, returnType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void;
                recordScenarioQos(datapointId: ScenarioId, durationInMillisecond: number, requestSizeInBytes: number, returnCode: number, returnType: ErrorType, pTransactionID: ITransactionId, datapointValueList: IDatapointValueList): void;
                reloadConfig(): void;
                testLoading(): string;
                compactNColsToOneStringCol(pBytes: /* System.Byte[] */ any): string;
                uncompactOneStringColToNCols(header: string): /* System.Byte[] */ any;
            }
            export interface IDatapointValueList {
                valid: Boolean;
                add(datapointValue: number): void;
                addString(datapointValue: string): void;
                addValueList(datapointValueList: DatapointValueList): void;
            }
            export namespace Ids { 
                export enum Calendar {
                    calendarSnapshotNumEvents = 200132,
                    calendarSnapshotEventDuration,
                    calendarSnapshotEventService,
                    calendarEventExit = 200147,
                    calendarViewClick = 200145,
                    calendarViewLaunch = 200144,
                    calendarCreateEvent = 200146,
                    calendarFreeBusyAPICall = 200154,
                    calendarPlatformErrors = 200238,
                    calendarDatePickerClosed = 200258,
                    calendarDatePickerLaunch,
                    calendarBackgroundFlyout,
                    calendarAgendaShowMore,
                    calendarNavAndAppBarInvoke = 200283,
                    inviteResponse = 200333,
                    showCalendar,
                    calendarProviderCreateEvent = 200329,
                    calendarProviderCreateEventUpdate,
                }
                export enum Common {
                    experienceId = 1,
                    referringAppId,
                    osVersion,
                    osProductType,
                    osBuildNumber,
                    osServicePack,
                    osSku,
                    wloemId,
                    appVersion,
                    windowsOemId,
                    pcModel,
                    osLanguage,
                    wloemDealId,
                    winOobeDate,
                    wlsuiteLang,
                    osInfo,
                    optInStatus,
                    wloobeDate,
                    brandId,
                    msftInternal,
                    mcam,
                    uploadId,
                    buildVersion,
                    buildArchitecture,
                    buildType,
                    buildBranch,
                    buildComputerName,
                    buildUserName,
                    buildWin8Branch,
                    buildWin8Build,
                    buildLocalTimeStamp,
                    appIdString,
                    environment,
                    localUserId,
                    roamingUserId,
                }
                export enum Contact {
                    instanceCount = 6001,
                    serverExperienceId,
                }
                export enum General {
                    productMinutes = 1000,
                    cid,
                    anid,
                    muid,
                    shipAssert,
                    appStart,
                    shipAssertOverall,
                    httpCallComplete,
                    sendSmile = 1010,
                    sendSmileErrorCount,
                    thirdPartyAPICall = 1015,
                    thirdPartyAPICall2,
                    thirdPartyAPICall3 = 200130,
                    visibleMinutes = 1017,
                    resumeCount,
                    modernPackage,
                }
                export enum Mail {
                    syncComplete = 200228,
                    modernMailEmailOperations = 200087,
                    modernMailNavigate = 200335,
                    initSyncComplete = 8002,
                    sendButtonActive,
                    fileSent = 8005,
                    addressWellSelectionMade = 8008,
                    sendMailModern,
                    sendMailWithAttachment,
                    skyDriveMailLeaveOutbox,
                    addressWellSuggestionRank = 200159,
                    modernMailActiveAccounts = 200104,
                    modernMailConversationThreadingEnabled = 200121,
                    mailTriageCommand = 200311,
                    modernMailCommand = 200292,
                    mailFormatCommand = 200291,
                    shareToMailOnSend = 200229,
                    modernUserLogin = 200297,
                    connectedMailAccountsOnMailVisible = 200299,
                    composeMailSent = 200331,
                    composeCommandSend = 8503,
                    composeCommandDiscard,
                    composeCommandCloseSave,
                    composeBoldUseCount = 8510,
                    composeItalicsUseCount,
                    composeUnderlineUseCount,
                    composeFontFamilyUseCount,
                    composeFontSizeUseCount,
                    composeFontColorUseCount,
                    composeAddFilesUseCount,
                    composeAddPhotosAndVideosUseCount,
                    composeLeftAlignUseCount,
                    composeCenterUseCount,
                    composeRightAlignUseCount,
                    composeNumberedListUseCount,
                    composeBulletedListUseCount,
                    composeHighlightUseCount,
                    composeInsertLinkUseCount,
                    composePriorityHighUseCount,
                    composePriorityLowUseCount,
                    composePriorityNormalUseCount,
                    composeRedoUseCount,
                    composePeoplePickerUseCount,
                    composeEmojiUseCount,
                    composeUndoUseCount,
                    composeIndentUseCount,
                    composeOutdentUseCount,
                    composeClearFormattingUseCount,
                    composeSelectAllUseCount,
                    composeToggleBccUseCount,
                    easConnectionDead = 8540,
                    pushConnection = 200052,
                    wnsGetchannel = 200056,
                    triggerManualBackgroundTask = 200080,
                    backgroundSyncRecoveryDetails = 200091,
                    communicationsFolder = 200235,
                    mailAppBarInvoke = 200280,
                }
                export enum ModernPhotoDevices {
                    modernPhotosNumberOfDevices = 200029,
                    dmxconsumerConsumercallhresult = 200033,
                }
                export enum ModernPhotoImport {
                    photosImportSessionData = 200057,
                    photosImportFileExtensions = 200062,
                    photosImportErrors,
                }
                export enum Package {
                    dynamicConfigMetaData = 200041,
                    mandatoryUpdateShownCount = 3001,
                    launchstatuschange = 200040,
                }
                export enum People {
                    identityControlActivate = 9000,
                    contactAddSave = 9100,
                    profileDetailsView,
                    profileDetailsViewFavorite,
                    profileDetailsViewNonFavorite,
                    profileDetailsDeleteContact,
                    profileDetailsActions,
                    profileEditSave,
                    profileEditCancel,
                    socialPageViewed = 9500,
                    socialReactionUpdated,
                    socialShare = 200105,
                    peopleClickthrough = 200082,
                }
                export enum Photo {
                    rehydrationCount = 10001,
                    failedRehydrationCount,
                    playToSessionInteraction,
                    searchZeroResults,
                    searchSomeResults,
                    commandClicked,
                    playToItemFailure,
                    folderDepth,
                    openWithInsideLibraryCount = 10015,
                    openWithOutsideLibraryCount,
                    photosDatabaseSize = 10018,
                    grovelFailure = 10020,
                    dataRetrieval,
                    platformP2PTelemetry = 200046,
                    photosDataSystemGrovel = 200067,
                    photosSourcesLaunch = 200114,
                }
                export enum Pimt {
                    modernMSNPConnectToServer = 11000,
                    messagingplatformBackgroundexecution = 200026,
                }
                export enum Platform {
                    backgroundTask = 12000,
                    lockScreen,
                    cancelBackgroundTask = 200081,
                    accountDialogStep = 200100,
                    accountDialogOverall,
                    wldcdbmigrationHresult,
                    wldctableMigrationErrors,
                }
                export enum Self {
                    configHash = 2000,
                    numberOfThrottledQosCalls,
                    biciErrorCount,
                    lastBiciErrorCode,
                    deletedLogCount,
                    lastBiciErrorLocation,
                }
                export enum SkyDrive {
                    callbackError = 13000,
                    moskyCommandusage = 200110,
                    moSkySearchAction = 200109,
                    fileExtensionUsed = 13003,
                    moskyAuthentication = 200049,
                    moskyFilemanagementmovedelete = 200048,
                    moSkyFREVideoPercentage = 200116,
                }
                export enum Video {
                    photosVideoPlayback = 200123,
                }
            }
            export interface ITransactionContext {
                experienceId: string;
                market: number;
                scenarioId: ScenarioId;
                transactionId: ITransactionId;
                toBase64String(): string;
                getNextTransactionContext(targetId: PropertyId): ITransactionContext;
                isEqual(pTransactionContext: ITransactionContext): number;
            }
            export interface ITransactionContextFactory {
                createTransactionContext(scenarioId: ScenarioId, market: number): TransactionContext;
                createTransactionContext_1(scenarioId: ScenarioId, market: number, experienceId: string, requestId: string): TransactionContext;
                createTransactionContext_2(scenarioId: ScenarioId, market: number, experienceId: string, requestId: string, transactionId: TransactionId): TransactionContext;
                createTransactionContext_3(hstrBase64EncodedTxContext: string): TransactionContext;
            }
            export interface ITransactionId {
                toBytesGetRequiredLength(): number;
                toBytes(pTransactionIdBytes: /* System.Byte[] */ any): void;
                isEqual(pTransactionId: ITransactionId): number;
                getNextTransactionId(propertyName: PropertyId, callingOrder: number): ITransactionId;
            }
            export interface ITransactionIdFactory {
                createTransactionId(pTransactionIdBytes: /* System.Byte[] */ any): TransactionId;
            }
            export enum PropertyId {
                unknown,
                skyDrive = 25,
                storage = 42,
                modernSkydrive = 55,
                modernPeople = 57,
                shareAnything = 98,
                facebook = 115,
                psa = 294,
                fms = 298,
            }
            export enum QosHeaderType {
                dependentApi = 1,
                internalApi,
                incomingApi,
                scenario,
            }
            export enum ScenarioId {
                unknown,
                si_UnitTest = 50200,
                si_Unknown,
                modernSkyDrive_Viewing_GetItems = 50500,
                modernSkyDrive_DownloadFile,
                modernSkyDrive_UploadFile,
                modernSkyDrive_FileManagement_Move = 50510,
                modernSkyDrive_FileManagement_Copy,
                modernSkyDrive_FileManagement_Rename,
                modernSkyDrive_FileManagement_Delete,
                modernSkyDrive_FileManagement_CreateNewFolder,
                modernSendaSmile_ShowSurvey = 50600,
                modernPeople_GetWhatsNewActivities = 50700,
                modernPeople_GetRecentActivities,
                modernPeople_GetComments,
                modernPeople_GetReactions,
                modernPeople_PostComment,
                modernPeople_PostReaction,
                modernPeople_DeleteReaction,
                modernPeople_GetAlbums,
                modernPeople_GetPhotos,
                modernPeople_GetActivity,
                modernPeople_GetAlbum,
                modernPeople_GetPhoto,
                modernPeople_GetUnreadNotificationsCount,
                modernPeople_GetNotifications,
                modernPeople_MarkNotificationsRead,
                modernPeople_PostShare,
                modernPeople_GetMoreWhatsNewActivities,
                modernPeople_GetMoreRecentActivities,
            }
            export class TransactionContext implements ITransactionContext {
                constructor(scenarioId: ScenarioId, market: number, scenarioId: ScenarioId, market: number, experienceId: string, requestId: string, scenarioId: ScenarioId, market: number, experienceId: string, requestId: string, transactionId: TransactionId, hstrBase64EncodedTxContext: string) {}

                experienceId: string;
                market: number;
                scenarioId: ScenarioId;
                transactionId: ITransactionId;

                toBase64String(): string {
                    throw new Error('shimmed function TransactionContext.toBase64String');
                }

                getNextTransactionContext(targetId: PropertyId): ITransactionContext {
                    throw new Error('shimmed function TransactionContext.getNextTransactionContext');
                }

                isEqual(pTransactionContext: ITransactionContext): number {
                    throw new Error('shimmed function TransactionContext.isEqual');
                }

            }
            export class TransactionId implements ITransactionId {
                constructor(pTransactionIdBytes: /* System.Byte[] */ any) {}

                toBytesGetRequiredLength(): number {
                    throw new Error('shimmed function TransactionId.toBytesGetRequiredLength');
                }

                toBytes(pTransactionIdBytes: /* System.Byte[] */ any): void {
                    console.warn('shimmed function TransactionId.toBytes');
                }

                isEqual(pTransactionId: ITransactionId): number {
                    throw new Error('shimmed function TransactionId.isEqual');
                }

                getNextTransactionId(propertyName: PropertyId, callingOrder: number): ITransactionId {
                    throw new Error('shimmed function TransactionId.getNextTransactionId');
                }

            }
        }
        export class Jx implements IJx {
            etw(hstrEventName: string): void {
                console.warn('shimmed function Jx.etw');
            }

            ptStart(hstrName: string, hstrKey: string): void {
                console.warn('shimmed function Jx.ptStart');
            }

            ptStop(hstrName: string, hstrKey: string): void {
                console.warn('shimmed function Jx.ptStop');
            }

            ptStopData(hstrName: string, hstrKey: string, dw1: number, dw2: number, dw3: number, dw4: number, dw5: number, hstrData1: string, hstrData2: string): void {
                console.warn('shimmed function Jx.ptStopData');
            }

            ptStopLaunch(timePoint: number, kind: number): void {
                console.warn('shimmed function Jx.ptStopLaunch');
            }

            ptStopResume(timePoint: number): void {
                console.warn('shimmed function Jx.ptStopResume');
            }

            ptStopResize(timePoint: number, isMajorChange: Boolean, isRotate: Boolean, logicalWidth: number, logicalHeight: number): void {
                console.warn('shimmed function Jx.ptStopResize');
            }

            erRegisterFile(hstrFilePath: string): void {
                console.warn('shimmed function Jx.erRegisterFile');
            }

            fault(hstrScenarioName: string, hstrErrorLocationId: string, hrFaultCode: number): void {
                console.warn('shimmed function Jx.fault');
            }

            startSession(): void {
                console.warn('shimmed function Jx.startSession');
            }

            flushSession(): void {
                console.warn('shimmed function Jx.flushSession');
            }

        }
        export class Market {
            static get(fallback: FallbackLogic): string {
                throw new Error('shimmed function Market.get');
            }

            static getLCID(fallback: FallbackLogic): number {
                throw new Error('shimmed function Market.getLCID');
            }

        }
        export namespace Photomail { 
            export class ApplyExifRotationOperation implements IAsyncOperation<Boolean> {
                completed: /* Windows.Foundation.AsyncOperationCompletedHandler`1[[System.Boolean, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any;
                errorCode: number;
                id: number;
                status: AsyncStatus;

                getResults(): Boolean {
                    throw new Error('shimmed function ApplyExifRotationOperation.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function ApplyExifRotationOperation.cancel');
                }

                close(): void {
                    console.warn('shimmed function ApplyExifRotationOperation.close');
                }

            }
            export class AttachmentManager implements IAttachmentManager {
                stripImageMetadata: Boolean;
                imageSize: ImageResizeOption;
                enableTranscode: Boolean;

                addFiles(fileItems: /* Windows.Storage.StorageFile */ any[]): void {
                    console.warn('shimmed function AttachmentManager.addFiles');
                }

                removeFile(attachmentId: string): void {
                    console.warn('shimmed function AttachmentManager.removeFile');
                }

                isAttaching(attachmentId: string): Boolean {
                    throw new Error('shimmed function AttachmentManager.isAttaching');
                }

                isTranscoding(attachmentId: string): Boolean {
                    throw new Error('shimmed function AttachmentManager.isTranscoding');
                }

                discard(): void {
                    console.warn('shimmed function AttachmentManager.discard');
                }

                stopAll(): void {
                    console.warn('shimmed function AttachmentManager.stopAll');
                }

                finalizeForSend(): void {
                    console.warn('shimmed function AttachmentManager.finalizeForSend');
                }

                close(): void {
                    console.warn('shimmed function AttachmentManager.close');
                }

                static getManager(messageId: string): IAttachmentManager {
                    throw new Error('shimmed function AttachmentManager.getManager');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`AttachmentManager::addEventListener: ${name}`);
                    switch (name) {
                        case "attachqueueempty": // QueueEmptyHandler
                            break;
                    }

                }
            }
            export enum ExifOrientation {
                none,
                clockwise90Degrees,
                clockwise180Degrees,
                clockwise270Degrees,
            }
            export class GetExifRotationOperation implements IAsyncOperation<ExifOrientation> {
                errorCode: number;
                id: number;
                status: AsyncStatus;
                completed: /* Windows.Foundation.AsyncOperationCompletedHandler`1[[Microsoft.WindowsLive.Photomail.ExifOrientation, Microsoft, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;

                getResults(): ExifOrientation {
                    throw new Error('shimmed function GetExifRotationOperation.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function GetExifRotationOperation.cancel');
                }

                close(): void {
                    console.warn('shimmed function GetExifRotationOperation.close');
                }

            }
            export interface IAttachmentManager {
                enableTranscode: Boolean;
                imageSize: ImageResizeOption;
                stripImageMetadata: Boolean;
                addFiles(fileItems: /* Windows.Storage.StorageFile */ any[]): void;
                removeFile(attachmentId: string): void;
                isAttaching(attachmentId: string): Boolean;
                isTranscoding(attachmentId: string): Boolean;
                discard(): void;
                stopAll(): void;
                finalizeForSend(): void;
                close(): void;
            }
            export interface IAttachmentManagerStatics {
                getManager(messageId: string): IAttachmentManager;
            }
            export enum ImageResizeOption {
                small,
                large,
                original,
                custom,
            }
            export interface IPhotomailTranscoderStatics {
                transcodeFileAsync(options: TranscodeOptions, inputFile: /* Windows.Storage.StorageFile */ any, outputFolder: /* Windows.Storage.StorageFolder */ any): PhotomailTranscodeOperation;
                getExifRotationAsync(inputStream: /* Windows.Storage.Streams.IRandomAccessStream */ any): GetExifRotationOperation;
                applyExifRotationAsync(inputStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, outputStream: /* Windows.Storage.Streams.IRandomAccessStream */ any): ApplyExifRotationOperation;
            }
            export class PhotomailTranscodeOperation implements IAsyncOperation</* Windows.Storage.StorageFile */ any> {
                errorCode: number;
                id: number;
                status: AsyncStatus;
                completed: /* Windows.Foundation.AsyncOperationCompletedHandler`1[[Windows.Storage.StorageFile, Windows, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;

                getResults(): /* Windows.Storage.StorageFile */ any {
                    throw new Error('shimmed function PhotomailTranscodeOperation.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function PhotomailTranscodeOperation.cancel');
                }

                close(): void {
                    console.warn('shimmed function PhotomailTranscodeOperation.close');
                }

            }
            export class PhotomailTranscoder {
                static transcodeFileAsync(options: TranscodeOptions, inputFile: /* Windows.Storage.StorageFile */ any, outputFolder: /* Windows.Storage.StorageFolder */ any): PhotomailTranscodeOperation {
                    throw new Error('shimmed function PhotomailTranscoder.transcodeFileAsync');
                }

                static getExifRotationAsync(inputStream: /* Windows.Storage.Streams.IRandomAccessStream */ any): GetExifRotationOperation {
                    throw new Error('shimmed function PhotomailTranscoder.getExifRotationAsync');
                }

                static applyExifRotationAsync(inputStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, outputStream: /* Windows.Storage.Streams.IRandomAccessStream */ any): ApplyExifRotationOperation {
                    throw new Error('shimmed function PhotomailTranscoder.applyExifRotationAsync');
                }

            }
            export type QueueEmptyHandler = () => void;
            export interface TranscodeOptions {
                resizeOption: ImageResizeOption;
                targetSize: number;
                stripMetadata: Boolean;
                copyOnFail: Boolean;
            }
        }
        export namespace Platform { 
            export enum AbchContactType {
                unknown,
                regular,
                me,
                circle,
                connection,
                implicit,
            }
            export enum AbchShellContactType {
                none,
                fan,
                pstn,
                buddyProfile,
                unknown,
            }
            export class Account implements IAccount, IObject, IAccountScenarios {
                objectType: string;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                userDisplayName: string;
                syncType: SyncType;
                settingsSyncTime: Date;
                settingsResult: number;
                settingsChangedTime: Date;
                preferredSendAsAddress: string;
                lastAuthResult: number;
                pollInterval: number;
                protectionEnterpriseId: string;
                folderStateResult: number;
                filterContactsFromView: Boolean;
                includeSentItemsInConversationCache: IncludeSentItemsInConversationCache;
                displayName: string;
                iconSmallUrl: string;
                iconType: AccountIconType;
                isDefault: Boolean;
                isEasi: Boolean;
                meContact: IContact;
                peopleViewComplete: Boolean;
                resources: ICollection;
                sendAsAddresses: string[];
                servers: ICollection;
                serviceContactsName: string;
                serviceName: string;
                allEmailAddresses: string[];
                authType: AccountAuthType;
                color: number;
                shortLinkLimit: number;
                siteUrl: string;
                sourceId: string;
                statusLimit: number;
                summary: string;
                supportsOAuth: Boolean;
                controlChannelId: string;
                thirdPartyUserId: string;
                createDate: Date;
                accountType: AccountType;
                editableResources: ICollection;
                emailAddress: string;
                hintState: HintState;
                iconMediumUrl: string;
                tokens: ICollection;
                calendarScenarioState: ScenarioState;
                mailScenarioState: ScenarioState;
                peopleScenarioState: ScenarioState;
                peopleSearchScenarioState: ScenarioState;
                publishScenarioState: ScenarioState;
                socialScenarioState: ScenarioState;

                getConfigureType(scenario: ApplicationScenario): ConfigureType {
                    throw new Error('shimmed function Account.getConfigureType');
                }

                getOtherConnectableAccounts(scenario: ApplicationScenario): ICollection {
                    throw new Error('shimmed function Account.getOtherConnectableAccounts');
                }

                getServerScenarios(scenario: ApplicationScenario, reconnect: Boolean): string {
                    throw new Error('shimmed function Account.getServerScenarios');
                }

                getResourceByType(type: ResourceType): IAccountResource {
                    throw new Error('shimmed function Account.getResourceByType');
                }

                getServerByType(type: ServerType): IAccountServerConnectionSettings {
                    throw new Error('shimmed function Account.getServerByType');
                }

                getTokenByScheme(scheme: string): IAccountToken {
                    throw new Error('shimmed function Account.getTokenByScheme');
                }

                createConnectedAccount(email: string): IAccount {
                    throw new Error('shimmed function Account.createConnectedAccount');
                }

                deleteFromLocalDevice(): void {
                    console.warn('shimmed function Account.deleteFromLocalDevice');
                }

                setAuthTokens(encryptedRefreshToken: string, encryptedAccessToken: string, accessTokenExpiryTime: Date): void {
                    console.warn('shimmed function Account.setAuthTokens');
                }

                getAccessTokenAsync(): IAsyncOperation<string> {
                    throw new Error('shimmed function Account.getAccessTokenAsync');
                }

                commit(): void {
                    console.warn('shimmed function Account.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function Account.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function Account.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Account::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum AccountAuthType {
                none,
                liveId,
                oAuth,
                password,
            }
            export class AccountCalendarResource implements IAccountResource, IObject, IAccountCalendarResource {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                isSyncNeeded: Boolean;
                isEnabled: Boolean;
                hasEverSynchronized: Boolean;
                isInitialSyncFinished: Boolean;
                isSynchronizing: Boolean;
                lastPushResult: number;
                lastSyncResult: number;
                lastSyncTime: Date;
                resourceState: ResourceState;
                resourceType: ResourceType;
                signatureType: SignatureType;

                commit(): void {
                    console.warn('shimmed function AccountCalendarResource.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function AccountCalendarResource.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function AccountCalendarResource.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`AccountCalendarResource::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export interface AccountEventArgs {
                objectId: string;
            }
            export type AccountEventHandler = (e: AccountEventArgs) => void;
            export enum AccountIconType {
                exchange,
                outlook,
                other,
            }
            export class AccountMailResource implements IAccountResource, IObject, IAccountMailResource {
                isSyncNeeded: Boolean;
                isEnabled: Boolean;
                hasEverSynchronized: Boolean;
                isInitialSyncFinished: Boolean;
                isSynchronizing: Boolean;
                lastPushResult: number;
                lastSyncResult: number;
                lastSyncTime: Date;
                resourceState: ResourceState;
                resourceType: ResourceType;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                allowExternalImages: Boolean;
                toastState: ToastState;
                syncWindowSize: SyncWindowSize;
                syncAllFolders: Boolean;
                signatureType: SignatureType;
                signatureText: string;
                serverCertificateUnknownCA: Boolean;
                serverCertificateMismatchedDomain: Boolean;
                serverCertificateExpired: Boolean;
                oofLastStateChangedTime: Date;
                lastSendMailResult: number;
                isSendingMail: Boolean;
                cancelSendMail: Boolean;
                canCreateFolders: Boolean;
                canServerSearchAllFolders: Boolean;
                canUpdateFolders: Boolean;
                isSyncingAllMail: Boolean;
                oofLastSyncResult: number;
                canDeleteFolders: Boolean;

                commit(): void {
                    console.warn('shimmed function AccountMailResource.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function AccountMailResource.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function AccountMailResource.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`AccountMailResource::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class AccountManager implements IAccountManager {
                defaultAccount: IAccount;

                canSetSyncTypePush(): Boolean {
                    throw new Error('shimmed function AccountManager.canSetSyncTypePush');
                }

                getAccountByControlChannelId(controlChannelId: string): IAccount {
                    throw new Error('shimmed function AccountManager.getAccountByControlChannelId');
                }

                getAccountBySourceId(sourceId: string, emailAddress: string): IAccount {
                    throw new Error('shimmed function AccountManager.getAccountBySourceId');
                }

                getConnectableAccountByEmailDomain(sourceId: string, emailAddress: string): IAccount {
                    throw new Error('shimmed function AccountManager.getConnectableAccountByEmailDomain');
                }

                getConnectableAccountsByScenario(scenario: ApplicationScenario, filter: ConnectableFilter): ICollection {
                    throw new Error('shimmed function AccountManager.getConnectableAccountsByScenario');
                }

                getConnectedAccountsByScenario(scenario: ApplicationScenario, filter: ConnectedFilter, sort: AccountSort): ICollection {
                    throw new Error('shimmed function AccountManager.getConnectedAccountsByScenario');
                }

                loadAccount(objectId: string): IAccount {
                    throw new Error('shimmed function AccountManager.loadAccount');
                }

                queryForCertificateCollection(pAccount: IAccount): ICertificateCollection {
                    throw new Error('shimmed function AccountManager.queryForCertificateCollection');
                }

                queryForCertificate(pbThumbPrint: /* System.Byte[] */ any): ICertificateObject {
                    throw new Error('shimmed function AccountManager.queryForCertificate');
                }

            }
            export class AccountResource implements IAccountResource, IObject {
                isSyncNeeded: Boolean;
                isEnabled: Boolean;
                hasEverSynchronized: Boolean;
                isInitialSyncFinished: Boolean;
                isSynchronizing: Boolean;
                lastPushResult: number;
                lastSyncResult: number;
                lastSyncTime: Date;
                resourceState: ResourceState;
                resourceType: ResourceType;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                commit(): void {
                    console.warn('shimmed function AccountResource.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function AccountResource.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function AccountResource.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`AccountResource::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class AccountServerConnectionSettings implements IAccountServerConnectionSettings, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                userId: string;
                useSsl: Boolean;
                supportsOAuth: Boolean;
                server: string;
                port: number;
                ignoreServerCertificateUnknownCA: Boolean;
                ignoreServerCertificateMismatchedDomain: Boolean;
                ignoreServerCertificateExpired: Boolean;
                domain: string;
                hasPasswordCookie: Boolean;
                serverType: ServerType;
                supportsAdvancedProperties: Boolean;

                setPasswordCookie(cookie: string): void {
                    console.warn('shimmed function AccountServerConnectionSettings.setPasswordCookie');
                }

                commit(): void {
                    console.warn('shimmed function AccountServerConnectionSettings.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function AccountServerConnectionSettings.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function AccountServerConnectionSettings.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`AccountServerConnectionSettings::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum AccountSort {
                name,
                rank,
            }
            export class AccountToken implements IAccountToken, IObject {
                publishSecret: string;
                scheme: string;
                token: string;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                commit(): void {
                    console.warn('shimmed function AccountToken.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function AccountToken.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function AccountToken.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`AccountToken::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum AccountType {
                liveId,
                eas,
                pop,
                imap,
                withoutPlugins,
                easAccountFactory,
                imapAccountFactory,
                popAccountFactory,
            }
            export class AddressWellSearchOperation implements IAsyncOperation<IRecipient[]> {
                completed: /* Windows.Foundation.AsyncOperationCompletedHandler`1[[System.Collections.Generic.IReadOnlyList`1[[Microsoft.WindowsLive.Platform.IRecipient, Microsoft, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]], System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any;
                errorCode: number;
                id: number;
                status: AsyncStatus;

                getResults(): IRecipient[] {
                    throw new Error('shimmed function AddressWellSearchOperation.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function AddressWellSearchOperation.cancel');
                }

                close(): void {
                    console.warn('shimmed function AddressWellSearchOperation.close');
                }

            }
            export enum ApplicationScenario {
                calendar,
                mail,
                people,
                peopleSearch,
                publish,
                social,
            }
            export enum AttachmentComposeStatus {
                notStarted,
                failed,
                inProgress,
                done,
            }
            export enum AttachmentSyncStatus {
                notStarted = 1,
                failed,
                inProgress,
                done,
            }
            export enum AttachmentUIType {
                ordinary = 1,
                embedded,
                hidden,
            }
            export class AugmentViaServerAction implements IAsyncAction {
                completed: /* Windows.Foundation.AsyncActionCompletedHandler */ any;
                errorCode: number;
                id: number;
                status: AsyncStatus;

                getResults(): void {
                    console.warn('shimmed function AugmentViaServerAction.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function AugmentViaServerAction.cancel');
                }

                close(): void {
                    console.warn('shimmed function AugmentViaServerAction.close');
                }

            }
            export enum BodyDownloadStatus {
                upToDate,
                failed,
                inProgress,
            }
            export type BodyHandler = () => void;
            export namespace Calendar { 
                export class Attendee implements IObject, IDisposable, IAttendee {
                    responseType: ResponseType;
                    name: string;
                    attendeeType: AttendeeType;
                    email: string;
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;

                    commit(): void {
                        console.warn('shimmed function Attendee.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function Attendee.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function Attendee.getKeepAlive');
                    }

                    dispose(): void {
                        console.warn('shimmed function Attendee.dispose');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`Attendee::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export enum AttendeeType {
                    required = 1,
                    optional,
                    resource,
                }
                export enum BusyStatus {
                    free,
                    tentative,
                    busy,
                    outOfOffice,
                    workingElsewhere,
                }
                export class Calendar implements IObject, IDisposable, ICalendar {
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;
                    hidden: Boolean;
                    color: number;
                    account: IAccount;
                    capabilities: ServerCapability;
                    id: number;
                    isDefault: Boolean;
                    name: string;
                    readOnly: Boolean;

                    commit(): void {
                        console.warn('shimmed function Calendar.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function Calendar.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function Calendar.getKeepAlive');
                    }

                    dispose(): void {
                        console.warn('shimmed function Calendar.dispose');
                    }

                    createEvent(): IEvent {
                        throw new Error('shimmed function Calendar.createEvent');
                    }

                    createEventFromiCalendar(pText: string): IEvent {
                        throw new Error('shimmed function Calendar.createEventFromiCalendar');
                    }

                    purge(): void {
                        console.warn('shimmed function Calendar.purge');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`Calendar::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export class CalendarManager implements ICalendarManager {
                    cacheRanges: ICollection;
                    colorTable: IColorTable;
                    defaultCalendar: ICalendar;
                    locale: string;
                    timeZoneId: string;

                    getCalendarIfExists(calendarId: number): ICalendar {
                        throw new Error('shimmed function CalendarManager.getCalendarIfExists');
                    }

                    getAllCalendars(): ICollection {
                        throw new Error('shimmed function CalendarManager.getAllCalendars');
                    }

                    getAllCalendars_1(includeDeleted: Boolean): ICollection {
                        throw new Error('shimmed function CalendarManager.getAllCalendars_1');
                    }

                    getAllCalendarsForAccount(pAccount: IAccount): ICollection {
                        throw new Error('shimmed function CalendarManager.getAllCalendarsForAccount');
                    }

                    getAllCalendarsForAccount_1(pAccount: IAccount, includeDeleted: Boolean): ICollection {
                        throw new Error('shimmed function CalendarManager.getAllCalendarsForAccount_1');
                    }

                    getDefaultCalendarForAccount(pAccount: IAccount): ICalendar {
                        throw new Error('shimmed function CalendarManager.getDefaultCalendarForAccount');
                    }

                    getEventFromUID(pAccount: IAccount, uid: string): IEvent {
                        throw new Error('shimmed function CalendarManager.getEventFromUID');
                    }

                    getEventsFromUID(uid: string): ICollection {
                        throw new Error('shimmed function CalendarManager.getEventsFromUID');
                    }

                    getEventFromID(eventId: number): IEvent {
                        throw new Error('shimmed function CalendarManager.getEventFromID');
                    }

                    getEventFromHandle(handle: string): IEvent {
                        throw new Error('shimmed function CalendarManager.getEventFromHandle');
                    }

                    getReminders(dtStart: Date, dtEnd: Date): ICollection {
                        throw new Error('shimmed function CalendarManager.getReminders');
                    }

                    getEvents(dtStart: Date, dtEnd: Date): ICollection {
                        throw new Error('shimmed function CalendarManager.getEvents');
                    }

                    getEvents_1(dtStart: Date, dtEnd: Date, sortOrder: EventSortOrder): ICollection {
                        throw new Error('shimmed function CalendarManager.getEvents_1');
                    }

                    getEvents_2(dtStart: Date, dtEnd: Date, sortOrder: EventSortOrder, options: GetEventsOptions): ICollection {
                        throw new Error('shimmed function CalendarManager.getEvents_2');
                    }

                    getNextEvent(eventId: number): IEvent {
                        throw new Error('shimmed function CalendarManager.getNextEvent');
                    }

                    getNextEvent_1(eventId: number, dtStart: Date): IEvent {
                        throw new Error('shimmed function CalendarManager.getNextEvent_1');
                    }

                    requestFreeBusyData(pAccount: IAccount, dtStart: Date, dtEnd: Date, attendees: string[]): IFreeBusyRequest {
                        throw new Error('shimmed function CalendarManager.requestFreeBusyData');
                    }

                    getCalendarErrors(): ICollection {
                        throw new Error('shimmed function CalendarManager.getCalendarErrors');
                    }

                    getCalendarError(objectId: string): IErrorMessage {
                        throw new Error('shimmed function CalendarManager.getCalendarError');
                    }

                    addCalendarError(message: string, priority: ErrorPriority): void {
                        console.warn('shimmed function CalendarManager.addCalendarError');
                    }

                    addCalendarError_1(message: string, priority: ErrorPriority, eventHandle: string): void {
                        console.warn('shimmed function CalendarManager.addCalendarError_1');
                    }

                    addCalendarError_2(message: string, priority: ErrorPriority, type: ErrorType, eventHandle: string): void {
                        console.warn('shimmed function CalendarManager.addCalendarError_2');
                    }

                    purgeAllCalendars(): void {
                        console.warn('shimmed function CalendarManager.purgeAllCalendars');
                    }

                }
                export class CalendarParser implements ICalendarParser {
                }
                export class CalendarService implements ICalendarService {
                }
                export class ColorTable implements IColorTable {
                    count: number;

                    name(index: number): string {
                        throw new Error('shimmed function ColorTable.name');
                    }

                    value(index: number): number {
                        throw new Error('shimmed function ColorTable.value');
                    }

                    linkValue(index: number): number {
                        throw new Error('shimmed function ColorTable.linkValue');
                    }

                    computeLinkValue(value: number): number {
                        throw new Error('shimmed function ColorTable.computeLinkValue');
                    }

                }
                export enum DataType {
                    plainText = 1,
                    html,
                    rtf,
                    mime,
                }
                export class DateCollection implements IDateCollection {
                    count: number;

                    item(index: number): Date {
                        throw new Error('shimmed function DateCollection.item');
                    }

                }
                export enum DayOfWeek {
                    sunday = 1,
                    monday,
                    tuesday = 4,
                    wednesday = 8,
                    thursday = 16,
                    friday = 32,
                    saturday = 64,
                    weekDays = 62,
                    weekendDays = 65,
                    all = 127,
                }
                export class ErrorMessage implements IObject, IDisposable, IErrorMessage {
                    eventHandle: string;
                    message: string;
                    priority: ErrorPriority;
                    type: ErrorType;
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;

                    commit(): void {
                        console.warn('shimmed function ErrorMessage.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function ErrorMessage.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function ErrorMessage.getKeepAlive');
                    }

                    dispose(): void {
                        console.warn('shimmed function ErrorMessage.dispose');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`ErrorMessage::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export enum ErrorPriority {
                    lowest = 1,
                    low = 3,
                    medium = 10,
                    high = 100,
                }
                export enum ErrorType {
                    unknown,
                    easParse,
                    easApplyToStore,
                    easUpload,
                    easDelete,
                    easConflictResolutionAborted,
                    easMeetingResponseRejected,
                    unknownHighest,
                }
                export class Event implements IObject, IDisposable, IEvent {
                    timeZoneId: string;
                    subject: string;
                    startDate: Date;
                    sensitivity: Sensitivity;
                    responseType: ResponseType;
                    responseRequested: Boolean;
                    reminder: number;
                    recurring: Boolean;
                    endDate: Date;
                    disallowNewTime: Boolean;
                    dataType: DataType;
                    busyStatus: BusyStatus;
                    allDayEvent: Boolean;
                    location: string;
                    meetingStatus: MeetingStatus;
                    organizerEmail: string;
                    organizerName: string;
                    data: string;
                    isEventTypeValid: Boolean;
                    uid: string;
                    meetingMessageType: MeetingMessageType;
                    modified: Date;
                    occurrenceDeleted: Boolean;
                    recurrence: IRecurrence;
                    isOrganizer: Boolean;
                    calendar: ICalendar;
                    reminderTime: Date;
                    replyTime: Date;
                    capabilities: ServerCapability;
                    color: number;
                    eventType: EventType;
                    exceptions: Boolean;
                    handle: string;
                    id: number;
                    canEdit: Boolean;
                    objectType: string;
                    objectId: string;
                    isObjectValid: Boolean;
                    canDelete: Boolean;

                    commit(): void {
                        console.warn('shimmed function Event.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function Event.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function Event.getKeepAlive');
                    }

                    dispose(): void {
                        console.warn('shimmed function Event.dispose');
                    }

                    getSeries(): IEvent {
                        throw new Error('shimmed function Event.getSeries');
                    }

                    deleteExceptions(): void {
                        console.warn('shimmed function Event.deleteExceptions');
                    }

                    getOccurrence(start: Date): IEvent {
                        throw new Error('shimmed function Event.getOccurrence');
                    }

                    getOccurrenceByExceptionStart(dtExceptionStart: Date): IEvent {
                        throw new Error('shimmed function Event.getOccurrenceByExceptionStart');
                    }

                    getiCalendar(): string {
                        throw new Error('shimmed function Event.getiCalendar');
                    }

                    getiCalendar_1(pAttendees: IAttendee[]): string {
                        throw new Error('shimmed function Event.getiCalendar_1');
                    }

                    getAttendees(): ICollection {
                        throw new Error('shimmed function Event.getAttendees');
                    }

                    addAttendee(name: string, email: string): IAttendee {
                        throw new Error('shimmed function Event.addAttendee');
                    }

                    validate(): Status {
                        throw new Error('shimmed function Event.validate');
                    }

                    markDirty(): void {
                        console.warn('shimmed function Event.markDirty');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`Event::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export class EventCacheRange implements IObject, IDisposable, IEventCacheRange {
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;
                    end: Date;
                    rangeState: RangeState;
                    rangeType: RangeType;
                    start: Date;

                    commit(): void {
                        console.warn('shimmed function EventCacheRange.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function EventCacheRange.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function EventCacheRange.getKeepAlive');
                    }

                    dispose(): void {
                        console.warn('shimmed function EventCacheRange.dispose');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`EventCacheRange::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export enum EventSortOrder {
                    defaultSort,
                    snapSort,
                    notificationsSort,
                    noSortAll,
                }
                export enum EventType {
                    single,
                    series,
                    instanceOfSeries,
                    exceptionToSeries,
                }
                export enum FirstDayOfWeek {
                    sunday,
                    monday,
                    tuesday,
                    wednesday,
                    thursday,
                    friday,
                    saturday,
                }
                export class FreeBusyRequest implements IObject, IDisposable, IFreeBusyRequest {
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;
                    count: number;
                    results: ICollection;
                    status: SearchStatusCode;

                    commit(): void {
                        console.warn('shimmed function FreeBusyRequest.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function FreeBusyRequest.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function FreeBusyRequest.getKeepAlive');
                    }

                    dispose(): void {
                        console.warn('shimmed function FreeBusyRequest.dispose');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`FreeBusyRequest::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export class FreeBusyResult implements IObject, IDisposable, IFreeBusyResult {
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;
                    attendee: string;
                    email: string;
                    freebusy: string;
                    name: string;
                    status: FreeBusyStatus;

                    commit(): void {
                        console.warn('shimmed function FreeBusyResult.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function FreeBusyResult.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function FreeBusyResult.getKeepAlive');
                    }

                    dispose(): void {
                        console.warn('shimmed function FreeBusyResult.dispose');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`FreeBusyResult::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export enum FreeBusyStatus {
                    error,
                    success,
                    ambiguous,
                    unknown,
                    dlerror,
                    tooManyRecipients,
                    tooManyMembers,
                }
                export enum GetEventsOptions {
                    none,
                    noCreateRange,
                }
                export interface IAttendee extends IObject {
                    attendeeType: AttendeeType;
                    email: string;
                    name: string;
                    responseType: ResponseType;
                }
                export interface ICalendar {
                    account: IAccount;
                    capabilities: ServerCapability;
                    color: number;
                    hidden: Boolean;
                    id: number;
                    isDefault: Boolean;
                    name: string;
                    readOnly: Boolean;
                    createEvent(): IEvent;
                    createEventFromiCalendar(pText: string): IEvent;
                    purge(): void;
                }
                export interface ICalendarManager {
                    cacheRanges: ICollection;
                    colorTable: IColorTable;
                    defaultCalendar: ICalendar;
                    locale: string;
                    timeZoneId: string;
                    getCalendarIfExists(calendarId: number): ICalendar;
                    getAllCalendars(): ICollection;
                    getAllCalendars_1(includeDeleted: Boolean): ICollection;
                    getAllCalendarsForAccount(pAccount: IAccount): ICollection;
                    getAllCalendarsForAccount_1(pAccount: IAccount, includeDeleted: Boolean): ICollection;
                    getDefaultCalendarForAccount(pAccount: IAccount): ICalendar;
                    getEventFromUID(pAccount: IAccount, uid: string): IEvent;
                    getEventsFromUID(uid: string): ICollection;
                    getEventFromID(eventId: number): IEvent;
                    getEventFromHandle(handle: string): IEvent;
                    getReminders(dtStart: Date, dtEnd: Date): ICollection;
                    getEvents(dtStart: Date, dtEnd: Date): ICollection;
                    getEvents_1(dtStart: Date, dtEnd: Date, sortOrder: EventSortOrder): ICollection;
                    getEvents_2(dtStart: Date, dtEnd: Date, sortOrder: EventSortOrder, options: GetEventsOptions): ICollection;
                    getNextEvent(eventId: number): IEvent;
                    getNextEvent_1(eventId: number, dtStart: Date): IEvent;
                    requestFreeBusyData(pAccount: IAccount, dtStart: Date, dtEnd: Date, attendees: string[]): IFreeBusyRequest;
                    getCalendarErrors(): ICollection;
                    getCalendarError(objectId: string): IErrorMessage;
                    addCalendarError(message: string, priority: ErrorPriority): void;
                    addCalendarError_1(message: string, priority: ErrorPriority, eventHandle: string): void;
                    addCalendarError_2(message: string, priority: ErrorPriority, type: ErrorType, eventHandle: string): void;
                    purgeAllCalendars(): void;
                }
                export interface ICalendarParser {
                }
                export interface ICalendarService {
                }
                export interface IColorTable {
                    count: number;
                    name(index: number): string;
                    value(index: number): number;
                    linkValue(index: number): number;
                    computeLinkValue(value: number): number;
                }
                export interface IDateCollection {
                    count: number;
                    item(index: number): Date;
                }
                export interface IErrorMessage extends IObject {
                    eventHandle: string;
                    message: string;
                    priority: ErrorPriority;
                    type: ErrorType;
                }
                export interface IEvent extends IObject {
                    allDayEvent: Boolean;
                    busyStatus: BusyStatus;
                    calendar: ICalendar;
                    capabilities: ServerCapability;
                    color: number;
                    data: string;
                    dataType: DataType;
                    disallowNewTime: Boolean;
                    endDate: Date;
                    eventType: EventType;
                    exceptions: Boolean;
                    handle: string;
                    id: number;
                    isEventTypeValid: Boolean;
                    isOrganizer: Boolean;
                    location: string;
                    meetingMessageType: MeetingMessageType;
                    meetingStatus: MeetingStatus;
                    modified: Date;
                    occurrenceDeleted: Boolean;
                    organizerEmail: string;
                    organizerName: string;
                    recurrence: IRecurrence;
                    recurring: Boolean;
                    reminder: number;
                    reminderTime: Date;
                    replyTime: Date;
                    responseRequested: Boolean;
                    responseType: ResponseType;
                    sensitivity: Sensitivity;
                    startDate: Date;
                    subject: string;
                    timeZoneId: string;
                    uid: string;
                    getSeries(): IEvent;
                    deleteExceptions(): void;
                    getOccurrence(start: Date): IEvent;
                    getOccurrenceByExceptionStart(dtExceptionStart: Date): IEvent;
                    getiCalendar(): string;
                    getiCalendar_1(pAttendees: IAttendee[]): string;
                    getAttendees(): ICollection;
                    addAttendee(name: string, email: string): IAttendee;
                    validate(): Status;
                    markDirty(): void;
                }
                export interface IEventCacheRange {
                    end: Date;
                    rangeState: RangeState;
                    rangeType: RangeType;
                    start: Date;
                }
                export interface IFreeBusyRequest {
                    count: number;
                    results: ICollection;
                    status: SearchStatusCode;
                }
                export interface IFreeBusyResult {
                    attendee: string;
                    email: string;
                    freebusy: string;
                    name: string;
                    status: FreeBusyStatus;
                }
                export interface IRecurrence {
                    dayOfMonth: number;
                    dayOfWeek: DayOfWeek;
                    firstDayOfWeek: FirstDayOfWeek;
                    interval: number;
                    monthOfYear: number;
                    occurrences: number;
                    recurrenceType: RecurrenceType;
                    until: Date;
                    weekOfMonth: WeekOfMonth;
                    getOccurrences(dtStart: Date, dtEnd: Date): IDateCollection;
                    getOccurrences_1(dtStart: Date, dtEnd: Date, uMaxOccurrences: number): IDateCollection;
                }
                export enum MeetingMessageType {
                    none,
                    initialRequest,
                    fullUpdate,
                    informationalUpdate,
                    outdated,
                    delegatorCopy,
                    delegateCopy,
                }
                export enum MeetingStatus {
                    notAMeeting,
                    isAMeeting,
                    isReceived,
                    isCanceled = 4,
                    isForwarded = 8,
                    meetingReceived = 3,
                    meetingCanceled = 5,
                    meetingCanceledAndReceived = 7,
                    meetingForwarded = 9,
                    meetingReceivedAndForwarded = 11,
                    meetingCanceledAndForwarded = 13,
                    meetingCanceledReceivedAndForwarded = 15,
                    all = 15,
                }
                export enum RangeState {
                    created,
                    building,
                    built,
                }
                export enum RangeType {
                    invalid,
                    primary,
                    extension,
                    secondary,
                }
                export class Recurrence implements IRecurrence {
                    weekOfMonth: WeekOfMonth;
                    until: Date;
                    recurrenceType: RecurrenceType;
                    occurrences: number;
                    monthOfYear: number;
                    interval: number;
                    firstDayOfWeek: FirstDayOfWeek;
                    dayOfWeek: DayOfWeek;
                    dayOfMonth: number;

                    getOccurrences(dtStart: Date, dtEnd: Date): IDateCollection {
                        throw new Error('shimmed function Recurrence.getOccurrences');
                    }

                    getOccurrences_1(dtStart: Date, dtEnd: Date, uMaxOccurrences: number): IDateCollection {
                        throw new Error('shimmed function Recurrence.getOccurrences_1');
                    }

                }
                export enum RecurrenceType {
                    daily,
                    weekly,
                    monthly,
                    monthlyOnDay,
                    yearly = 5,
                    yearlyOnDay,
                }
                export enum ResponseType {
                    none,
                    organizer,
                    tentative,
                    accepted,
                    declined,
                    notResponded,
                }
                export enum Sensitivity {
                    normal,
                    personal,
                    private,
                    confidential,
                }
                export enum ServerCapability {
                    none,
                    htmlBody,
                    statusWorkingElsewhere,
                    attendeeType = 4,
                    attendeeStatus = 8,
                    calendarType = 16,
                    leapMonth = 32,
                    firstDayOfWeek = 64,
                    responseRequested = 128,
                    disallowNewTimeProposal = 256,
                    appointmentReplyTime = 512,
                    responseType = 1024,
                    attendeesInExceptions = 2048,
                    canRespond = 4096,
                    canCancel = 8192,
                    meetingResponseCommandOnEvent = 16384,
                    requestFreeBusy = 32768,
                    canForward = 65536,
                    canReplaceMime = 131072,
                }
                export enum Status {
                    success,
                    errorAccountRequired = -2058027008,
                    errorAccountInvalid,
                    errorCalendarRequired = -2058026992,
                    errorCalendarInvalid,
                    errorCalendarNameInvalid,
                    errorCalendarReadOnly,
                    errorUIDGeneration = -2058026976,
                    errorUIDConversionToString,
                    errorAttendeeInvalidResponseType = -2058026960,
                    errorAttendeeOrganizerNotAllowed,
                    errorAttendeeInvalidAttendeeType,
                    errorAttendeeCommitEventInstead,
                    errorRangeStartMustBeLessThanEnd = -2058026944,
                    errorTooManyEvents,
                    errorIndexBeyondEnd,
                    errorInvalidSort,
                    errorRangeAlreadyRegistered,
                    errorDetailsInvalidDataType = -2058026928,
                    errorDetailsInvalidResponseType,
                    errorEventRequired = -2058026752,
                    errorEventInvalid,
                    errorEventEndLessThanStart,
                    errorEventDateTooSmall,
                    errorEventDateTooLarge,
                    errorEventInvalidBusyStatus,
                    errorEventInvalidSensitivity,
                    errorEventInvalidMeetingStatus,
                    errorEventInvalidBeforeCommit,
                    errorEventOccurenceFieldReadOnly,
                    errorEventExceptionDeleteRequired = -2058026736,
                    errorEventInvalidOccurrenceTime,
                    errorEventNoException,
                    errorEventNoReminder,
                    errorNotRecurring = -2058026496,
                    errorNotSeries,
                    errorTZNameInvalid,
                    errorRangeStartLessThanZero,
                    errorRangeEndLessThanStart,
                    errorInvalidRecurrenceType,
                    errorOccurrencesTooSmall,
                    errorOccurrencesTooLarge,
                    errorIntervalTooSmall,
                    errorIntervalTooLarge,
                    errorInvalidWeekOfMonth = -2058026480,
                    errorInvalidDayOfWeek,
                    errorInvalidMonthOfYear,
                    errorInvalidDayOfMonth,
                    errorInvalidFirstDayOfWeek,
                    errorRecurrenceInvalid,
                    errorExceptionsOverlap,
                    errorExceptionsStartOnSameDay,
                    errorReminderForDifferentOccurrence,
                    errorUntilLessThanStart,
                }
                export enum WeekOfMonth {
                    first = 1,
                    second,
                    third,
                    fourth,
                    last,
                }
            }
            export enum CalendarFolderType {
                defaultFolder = 1,
            }
            export enum CalendarMessageType {
                none,
                request,
                responseAccepted,
                responseDeclined,
                responseTentative,
                cancelled,
                other,
            }
            export class CertificateCollection implements ICertificateCollection, ICollection, IDisposable {
                count: number;
                totalCount: number;
                hasMultipleSubjects: Boolean;

                item(index: number): IObject {
                    throw new Error('shimmed function CertificateCollection.item');
                }

                fetchMoreItems(dwFetchSize: number): void {
                    console.warn('shimmed function CertificateCollection.fetchMoreItems');
                }

                lock(): void {
                    console.warn('shimmed function CertificateCollection.lock');
                }

                unlock(): void {
                    console.warn('shimmed function CertificateCollection.unlock');
                }

                dispose(): void {
                    console.warn('shimmed function CertificateCollection.dispose');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`CertificateCollection::addEventListener: ${name}`);
                    switch (name) {
                        case "collectionchanged": // CollectionChangedHandler
                            break;
                    }

                }
            }
            export class CertificateObject implements ICertificateObject, IObject {
                certificate: /* Windows.Security.Cryptography.Certificates.Certificate */ any;
                issuer: string;
                subject: string;
                thumbPrint: /* System.Byte[] */ any;
                validFrom: Date;
                validTo: Date;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                commit(): void {
                    console.warn('shimmed function CertificateObject.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function CertificateObject.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function CertificateObject.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`CertificateObject::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export interface CID {
                value: number;
            }
            export class Client implements IClient, IDisposable, IClientServices, IPluginVerbManager {
                constructor(applicationId: string, options: ClientCreateOptions) {}

                accountManager: IAccountManager;
                calendarManager: any;
                configManager: IConfigManager;
                folderManager: IFolderManager;
                invitesManager: any;
                mailManager: IMailManager;
                peopleManager: IPeopleManager;
                pluginVerbManager: IPluginVerbManager;

                dispose(): void {
                    console.warn('shimmed function Client.dispose');
                }

                flushLogfile(): string {
                    throw new Error('shimmed function Client.flushLogfile');
                }

                requestDelayedResources(): void {
                    console.warn('shimmed function Client.requestDelayedResources');
                }

                suspend(): void {
                    console.warn('shimmed function Client.suspend');
                }

                resume(): void {
                    console.warn('shimmed function Client.resume');
                }

                registerForDispose(pDisposable: IDisposable): void {
                    console.warn('shimmed function Client.registerForDispose');
                }

                unregisterForDispose(pDisposable: IDisposable): void {
                    console.warn('shimmed function Client.unregisterForDispose');
                }

                createVerb(hstrVerbName: string, hstrVerbParams: string): IPluginVerb {
                    throw new Error('shimmed function Client.createVerb');
                }

                createVerbFromTask(hstrVerbName: string, hstrVerbParams: string, pTaskInstance: any): IPluginVerb {
                    throw new Error('shimmed function Client.createVerbFromTask');
                }

                createVerbFromTaskWithContext(hstrVerbName: string, hstrVerbParams: string, pContext: any, pTaskInstance: any): IPluginVerb {
                    throw new Error('shimmed function Client.createVerbFromTaskWithContext');
                }

                runResourceVerb(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): void {
                    console.warn('shimmed function Client.runResourceVerb');
                }

                runResourceVerbAsync(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): IAsyncAction {
                    throw new Error('shimmed function Client.runResourceVerbAsync');
                }

                cancelResourceVerb(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): void {
                    console.warn('shimmed function Client.cancelResourceVerb');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Client::addEventListener: ${name}`);
                    switch (name) {
                        case "restartneeded": // RestartNeededHandler
                            break;
                    }

                }
            }
            export enum ClientCreateOptions {
                normal,
                delayResources,
                failIfNoUser,
                cacheAuthInTest = 4,
                failIfUnverified = 8,
                createRetailExperienceUser = 16,
                createPrimaryAccountUser = 32,
                getPendingPrimaryAccountUser = 64,
            }
            export class Collection implements ICollection, IDisposable, INotificationCollection {
                count: number;
                totalCount: number;

                item(index: number): IObject {
                    throw new Error('shimmed function Collection.item');
                }

                fetchMoreItems(dwFetchSize: number): void {
                    console.warn('shimmed function Collection.fetchMoreItems');
                }

                lock(): void {
                    console.warn('shimmed function Collection.lock');
                }

                unlock(): void {
                    console.warn('shimmed function Collection.unlock');
                }

                dispose(): void {
                    console.warn('shimmed function Collection.dispose');
                }

                dispatchEvents(): void {
                    console.warn('shimmed function Collection.dispatchEvents');
                }

                cancelSynchronousDispatch(): void {
                    console.warn('shimmed function Collection.cancelSynchronousDispatch');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Collection::addEventListener: ${name}`);
                    switch (name) {
                        case "collectionchanged": // CollectionChangedHandler
                        case "notificationreceived": // CollectionNotificationHandler
                            break;
                    }

                }
            }
            export interface CollectionChangedEventArgs {
                eType: CollectionChangeType;
                index: number;
                previousIndex: number;
                objectId: string;
            }
            export type CollectionChangedHandler = (e: CollectionChangedEventArgs) => void;
            export enum CollectionChangeType {
                itemAdded,
                itemChanged,
                itemRemoved,
                batchBegin,
                batchEnd,
                reset,
                localSearchComplete,
                serverSearchComplete,
            }
            export interface CollectionNotificationEventArgs {
                cookie: number;
            }
            export type CollectionNotificationHandler = (e: CollectionNotificationEventArgs) => void;
            export enum ConfigArea {
                calendar,
                chat,
                mail,
                people,
                photos,
                platform,
                shared,
                sharing,
                test,
                skyDrive,
                max,
            }
            export enum ConfigCloud {
                prod,
                int,
                dogfood,
                max,
            }
            export class ConfigInstance implements IConfigInstance, IConfigObject, IObject {
                uri: string;
                area_String: string;
                buffer: /* Windows.Storage.Streams.IBuffer */ any;
                cloud_String: string;
                file: /* Windows.Storage.IStorageFile */ any;
                market_String: string;
                area: ConfigArea;
                beginDate: Date;
                cloud: ConfigCloud;
                endDate: Date;
                feature: string;
                hash: string;
                market: number;
                xmlData: string;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                updateXmlDataWithHash(xmlData: string, hash: string): void {
                    console.warn('shimmed function ConfigInstance.updateXmlDataWithHash');
                }

                commit(): void {
                    console.warn('shimmed function ConfigInstance.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function ConfigInstance.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function ConfigInstance.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`ConfigInstance::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class ConfigManager implements IConfigManager, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                metadataObject: IConfigMetadataObject;

                getCurrentConfigCollection(area: ConfigArea, feature: string): ICollection {
                    throw new Error('shimmed function ConfigManager.getCurrentConfigCollection');
                }

                getConfigCollection(area: ConfigArea, feature: string, marketId: number, cloud: ConfigCloud): ICollection {
                    throw new Error('shimmed function ConfigManager.getConfigCollection');
                }

                createNewFeature(area: ConfigArea, feature: string, cloud: ConfigCloud, market: number, begin: Date, end: Date, hash: string, xmlData: string): void {
                    console.warn('shimmed function ConfigManager.createNewFeature');
                }

                createNewFeature_1(instance: IConfigInstance): void {
                    console.warn('shimmed function ConfigManager.createNewFeature_1');
                }

                deleteComplement(prgKeep: IConfigObject[]): void {
                    console.warn('shimmed function ConfigManager.deleteComplement');
                }

                resetDatabase(): void {
                    console.warn('shimmed function ConfigManager.resetDatabase');
                }

                insertMetadataRow(version: string): void {
                    console.warn('shimmed function ConfigManager.insertMetadataRow');
                }

                modifyConfig(area: ConfigArea, feature: string, xpath: string, newValue: string): void {
                    console.warn('shimmed function ConfigManager.modifyConfig');
                }

                commit(): void {
                    console.warn('shimmed function ConfigManager.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function ConfigManager.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function ConfigManager.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`ConfigManager::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class ConfigMetadataObject implements IConfigMetadataObject, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                lastUpdate: Date;
                currentVersion: string;

                commit(): void {
                    console.warn('shimmed function ConfigMetadataObject.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function ConfigMetadataObject.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function ConfigMetadataObject.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`ConfigMetadataObject::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class ConfigObject implements IConfigObject, IObject {
                area: ConfigArea;
                beginDate: Date;
                cloud: ConfigCloud;
                endDate: Date;
                feature: string;
                hash: string;
                market: number;
                xmlData: string;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                updateXmlDataWithHash(xmlData: string, hash: string): void {
                    console.warn('shimmed function ConfigObject.updateXmlDataWithHash');
                }

                commit(): void {
                    console.warn('shimmed function ConfigObject.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function ConfigObject.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function ConfigObject.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`ConfigObject::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class ConfigObjectVector implements IList<IConfigObject>, ICollection<IConfigObject>, IEnumerable<IConfigObject> {
                size: number;

            }
            export enum ConfigureType {
                notSupported,
                createConnectedAccount,
                editOnClient,
                editOnWeb,
            }
            export enum ConnectableFilter {
                normal,
                excludeIfAnyAccountIsConnected,
                includeConnectedAccounts,
            }
            export enum ConnectedFilter {
                normal,
                includeDisabledAccounts,
            }
            export class Contact implements IContact, IObject, IBaseContact {
                yomiLastName: string;
                yomiFirstName: string;
                yomiCompanyName: string;
                webSite: string;
                trustLevel: ContactTrustLevel;
                title: string;
                suffix: string;
                significantOther: string;
                personalEmailAddress: string;
                pagerNumber: string;
                notes: string;
                homePhoneNumber: string;
                homeLocation: Location;
                homeFaxNumber: string;
                home2PhoneNumber: string;
                mobilePhoneNumber: string;
                companyName: string;
                mobile2PhoneNumber: string;
                otherEmailAddress: string;
                businessPhoneNumber: string;
                businessLocation: Location;
                businessFaxNumber: string;
                otherLocation: Location;
                business2PhoneNumber: string;
                birthdate: Date;
                anniversary: Date;
                alias: string;
                jobTitle: string;
                officeLocation: string;
                businessEmailAddress: string;
                imtype: ContactIMType;
                person: IPerson;
                account: IAccount;
                cid: CID;
                canIMNow: Boolean;
                supportsMobileIM: Boolean;
                thirdPartyObjectId: string;
                canOIM: Boolean;
                federatedEmailAddress: string;
                verbs: ICollection;
                isBuddy: Boolean;
                windowsLiveEmailAddress: string;
                yahooEmailAddress: string;
                isPublicEntity: Boolean;
                mainMri: string;
                linkType: ContactLinkingType;
                nickname: string;
                middleName: string;
                lastName: string;
                firstName: string;
                onlineStatus: ContactStatus;
                calculatedUIName: string;
                isGal: Boolean;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                unlink(): void {
                    console.warn('shimmed function Contact.unlink');
                }

                commit(): void {
                    console.warn('shimmed function Contact.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function Contact.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function Contact.getKeepAlive');
                }

                getUserTile(size: UserTileSize, cachedOnly: Boolean): IUserTile {
                    throw new Error('shimmed function Contact.getUserTile');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Contact::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum ContactFolderType {
                foreignNetwork,
                defaultFolder,
                meContact,
                people,
            }
            export enum ContactIMType {
                windowsLive,
                yahoo,
                office,
                none,
                foreignNetwork,
                skype,
            }
            export enum ContactLinkingType {
                windowsLive,
                none,
            }
            export enum ContactNameType {
                firstAndLast,
            }
            export enum ContactStatus {
                offline,
                away,
                online,
                busy,
                appearOffline,
                maxCount,
            }
            export enum ContactTrustLevel {
                close = 1,
                normal,
                farLevel,
                none,
            }
            export class DirectPushKeepAliveTask {
                run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                    console.warn('shimmed function DirectPushKeepAliveTask.run');
                }

            }
            export class DirectPushNotificationTask {
                run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                    console.warn('shimmed function DirectPushNotificationTask.run');
                }

            }
            export class EasAccountSettings implements IAccountServerConnectionSettings, IEasAccountSettings, IObject {
                objectType: string;
                canDelete: Boolean;
                objectId: string;
                isObjectValid: Boolean;
                canEdit: Boolean;
                issuerList: string;
                certificateThumbPrint: /* System.Byte[] */ any;
                oofBodyForInternal: string;
                policyComplianceResults: PolicyComplianceResults;
                policyApplyAttempted: Boolean;
                oofState: Boolean;
                oofStartTime: Date | null;
                oofLastIgnoredTime: Date | null;
                oofEndTime: Date | null;
                oofEnabledForUnknownExternal: Boolean;
                oofEnabledForKnownExternal: Boolean;
                oofEnabledForInternal: Boolean;
                oofBodyForUnknownExternal: string;
                oofBodyForKnownExternal: string;
                rightsManagementTemplates: ICollection;
                isWlasSupported: Boolean;
                domain: string;
                useSsl: Boolean;
                userId: string;
                supportsOAuth: Boolean;
                server: string;
                port: number;
                ignoreServerCertificateUnknownCA: Boolean;
                ignoreServerCertificateMismatchedDomain: Boolean;
                ignoreServerCertificateExpired: Boolean;
                hasPasswordCookie: Boolean;
                serverType: ServerType;
                supportsAdvancedProperties: Boolean;

                setPasswordCookie(cookie: string): void {
                    console.warn('shimmed function EasAccountSettings.setPasswordCookie');
                }

                isOofSupported(): Boolean {
                    throw new Error('shimmed function EasAccountSettings.isOofSupported');
                }

                getClientSecurityPolicy(): /* Windows.Security.ExchangeActiveSyncProvisioning.EasClientSecurityPolicy */ any {
                    throw new Error('shimmed function EasAccountSettings.getClientSecurityPolicy');
                }

                commit(): void {
                    console.warn('shimmed function EasAccountSettings.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function EasAccountSettings.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function EasAccountSettings.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`EasAccountSettings::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum FavoriteInsertPosition {
                insertFirst,
                insertLast,
                insertBefore,
                insertAfter,
            }
            export enum FavoritesFilter {
                all,
                favorites,
                nonFavorites,
            }
            export enum FilterCriteria {
                all,
                unread,
                flagged,
                unseen,
            }
            export class Folder implements IFolder, IObject {
                syncStatus: number;
                specialCalendarFolderType: CalendarFolderType;
                parentFolder: IFolder;
                folderType: FolderType;
                folderName: string;
                accountId: string;
                canHaveChildren: Boolean;
                canMove: Boolean;
                canRename: Boolean;
                hasProcessedConversations: Boolean;
                hasSynced: Boolean;
                isFolderThreadingCapable: Boolean;
                isLocalMailFolder: Boolean;
                isPinnedToNavPane: Boolean;
                selectionDisabled: Boolean;
                specialContactFolderType: ContactFolderType;
                specialMailFolderType: MailFolderType;
                syncFolderContents: Boolean;
                underDeletedItems: Boolean;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                markViewed(): void {
                    console.warn('shimmed function Folder.markViewed');
                }

                getChildFolderCollection(fAllTypes: Boolean): ICollection {
                    throw new Error('shimmed function Folder.getChildFolderCollection');
                }

                startSyncFolderContents(fForceSynchronization: Boolean): void {
                    console.warn('shimmed function Folder.startSyncFolderContents');
                }

                recordAction(value: FolderAction): void {
                    console.warn('shimmed function Folder.recordAction');
                }

                ensureNameUnique(): void {
                    console.warn('shimmed function Folder.ensureNameUnique');
                }

                commit(): void {
                    console.warn('shimmed function Folder.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function Folder.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function Folder.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Folder::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum FolderAction {
                messageViewed = 2000,
                messageAction = 2000,
            }
            export class FolderManager implements IFolderManager {
                getRootFolderCollection(pAccount: IAccount): ICollection {
                    throw new Error('shimmed function FolderManager.getRootFolderCollection');
                }

                getRootFolderCollection_1(pAccount: IAccount, eType: FolderType): ICollection {
                    throw new Error('shimmed function FolderManager.getRootFolderCollection_1');
                }

                getRootUserMailFolderCollection(pAccount: IAccount): ICollection {
                    throw new Error('shimmed function FolderManager.getRootUserMailFolderCollection');
                }

                getAllFoldersCollection(eType: FolderType): ICollection {
                    throw new Error('shimmed function FolderManager.getAllFoldersCollection');
                }

                getAllFoldersCollection_1(eType: FolderType, pAccount: IAccount): ICollection {
                    throw new Error('shimmed function FolderManager.getAllFoldersCollection_1');
                }

                getSpecialMailFolder(pAccount: IAccount, eType: MailFolderType): IFolder {
                    throw new Error('shimmed function FolderManager.getSpecialMailFolder');
                }

                getSpecialContactFolder(pAccount: IAccount, eType: ContactFolderType): IFolder {
                    throw new Error('shimmed function FolderManager.getSpecialContactFolder');
                }

                getSpecialCalendarFolder(pAccount: IAccount, eType: CalendarFolderType): IFolder {
                    throw new Error('shimmed function FolderManager.getSpecialCalendarFolder');
                }

                createFolder(pAccount: IAccount): IFolder {
                    throw new Error('shimmed function FolderManager.createFolder');
                }

                loadFolder(hstrId: string): IFolder {
                    throw new Error('shimmed function FolderManager.loadFolder');
                }

                getAllFoldersNotUnderDeletedItemsCollection(eType: FolderType): ICollection {
                    throw new Error('shimmed function FolderManager.getAllFoldersNotUnderDeletedItemsCollection');
                }

                getAllFoldersNotUnderDeletedItemsCollection_1(eType: FolderType, pAccount: IAccount): ICollection {
                    throw new Error('shimmed function FolderManager.getAllFoldersNotUnderDeletedItemsCollection_1');
                }

                getImapSpecialFolderId(pAccount: IAccount, eType: MailFolderType): string {
                    throw new Error('shimmed function FolderManager.getImapSpecialFolderId');
                }

                setImapSpecialFolderPath(pAccount: IAccount, eType: MailFolderType, hstrFolderId: string): void {
                    console.warn('shimmed function FolderManager.setImapSpecialFolderPath');
                }

            }
            export enum FolderType {
                mail = 1,
                calendar,
                contacts,
            }
            export enum HintState {
                defaultAccount,
                primaryAccount,
                firstParty,
                superHint,
                hint,
                none,
            }
            export interface IAccount extends IObject {
                accountType: AccountType;
                allEmailAddresses: string[];
                authType: AccountAuthType;
                color: number;
                controlChannelId: string;
                createDate: Date;
                displayName: string;
                editableResources: ICollection;
                emailAddress: string;
                filterContactsFromView: Boolean;
                folderStateResult: number;
                hintState: HintState;
                iconMediumUrl: string;
                iconSmallUrl: string;
                iconType: AccountIconType;
                includeSentItemsInConversationCache: IncludeSentItemsInConversationCache;
                isDefault: Boolean;
                isEasi: Boolean;
                lastAuthResult: number;
                meContact: IContact;
                peopleViewComplete: Boolean;
                pollInterval: number;
                preferredSendAsAddress: string;
                protectionEnterpriseId: string;
                resources: ICollection;
                sendAsAddresses: string[];
                servers: ICollection;
                serviceContactsName: string;
                serviceName: string;
                settingsChangedTime: Date;
                settingsResult: number;
                settingsSyncTime: Date;
                shortLinkLimit: number;
                siteUrl: string;
                sourceId: string;
                statusLimit: number;
                summary: string;
                supportsOAuth: Boolean;
                syncType: SyncType;
                thirdPartyUserId: string;
                tokens: ICollection;
                userDisplayName: string;
                getConfigureType(scenario: ApplicationScenario): ConfigureType;
                getOtherConnectableAccounts(scenario: ApplicationScenario): ICollection;
                getServerScenarios(scenario: ApplicationScenario, reconnect: Boolean): string;
                getResourceByType(type: ResourceType): IAccountResource;
                getServerByType(type: ServerType): IAccountServerConnectionSettings;
                getTokenByScheme(scheme: string): IAccountToken;
                createConnectedAccount(email: string): IAccount;
                deleteFromLocalDevice(): void;
                setAuthTokens(encryptedRefreshToken: string, encryptedAccessToken: string, accessTokenExpiryTime: Date): void;
                getAccessTokenAsync(): IAsyncOperation<string>;
            }
            export interface IAccountCalendarResource {
                signatureType: SignatureType;
            }
            export interface IAccountMailResource {
                allowExternalImages: Boolean;
                canCreateFolders: Boolean;
                canDeleteFolders: Boolean;
                canServerSearchAllFolders: Boolean;
                canUpdateFolders: Boolean;
                cancelSendMail: Boolean;
                isSendingMail: Boolean;
                isSyncingAllMail: Boolean;
                lastSendMailResult: number;
                oofLastStateChangedTime: Date;
                oofLastSyncResult: number;
                serverCertificateExpired: Boolean;
                serverCertificateMismatchedDomain: Boolean;
                serverCertificateUnknownCA: Boolean;
                signatureText: string;
                signatureType: SignatureType;
                syncAllFolders: Boolean;
                syncWindowSize: SyncWindowSize;
                toastState: ToastState;
            }
            export interface IAccountManager {
                defaultAccount: IAccount;
                canSetSyncTypePush(): Boolean;
                getAccountByControlChannelId(controlChannelId: string): IAccount;
                getAccountBySourceId(sourceId: string, emailAddress: string): IAccount;
                getConnectableAccountByEmailDomain(sourceId: string, emailAddress: string): IAccount;
                getConnectableAccountsByScenario(scenario: ApplicationScenario, filter: ConnectableFilter): ICollection;
                getConnectedAccountsByScenario(scenario: ApplicationScenario, filter: ConnectedFilter, sort: AccountSort): ICollection;
                loadAccount(objectId: string): IAccount;
                queryForCertificateCollection(pAccount: IAccount): ICertificateCollection;
                queryForCertificate(pbThumbPrint: /* System.Byte[] */ any): ICertificateObject;
            }
            export interface IAccountResource extends IObject {
                hasEverSynchronized: Boolean;
                isEnabled: Boolean;
                isInitialSyncFinished: Boolean;
                isSyncNeeded: Boolean;
                isSynchronizing: Boolean;
                lastPushResult: number;
                lastSyncResult: number;
                lastSyncTime: Date;
                resourceState: ResourceState;
                resourceType: ResourceType;
            }
            export interface IAccountScenarios {
                calendarScenarioState: ScenarioState;
                mailScenarioState: ScenarioState;
                peopleScenarioState: ScenarioState;
                peopleSearchScenarioState: ScenarioState;
                publishScenarioState: ScenarioState;
                socialScenarioState: ScenarioState;
            }
            export interface IAccountServerConnectionSettings {
                domain: string;
                hasPasswordCookie: Boolean;
                ignoreServerCertificateExpired: Boolean;
                ignoreServerCertificateMismatchedDomain: Boolean;
                ignoreServerCertificateUnknownCA: Boolean;
                port: number;
                server: string;
                serverType: ServerType;
                supportsAdvancedProperties: Boolean;
                supportsOAuth: Boolean;
                useSsl: Boolean;
                userId: string;
                setPasswordCookie(cookie: string): void;
            }
            export interface IAccountToken {
                publishSecret: string;
                scheme: string;
                token: string;
            }
            export interface IBaseContact extends IObject {
                calculatedUIName: string;
                firstName: string;
                isGal: Boolean;
                lastName: string;
                middleName: string;
                nickname: string;
                onlineStatus: ContactStatus;
                getUserTile(size: UserTileSize, cachedOnly: Boolean): IUserTile;
            }
            export interface ICertificateCollection extends ICollection, IDisposable {
                hasMultipleSubjects: Boolean;
            }
            export interface ICertificateObject extends IObject {
                certificate: /* Windows.Security.Cryptography.Certificates.Certificate */ any;
                issuer: string;
                subject: string;
                thumbPrint: /* System.Byte[] */ any;
                validFrom: Date;
                validTo: Date;
            }
            export interface IClient extends IDisposable {
                accountManager: IAccountManager;
                calendarManager: any;
                configManager: IConfigManager;
                folderManager: IFolderManager;
                invitesManager: any;
                mailManager: IMailManager;
                peopleManager: IPeopleManager;
                pluginVerbManager: IPluginVerbManager;
            }
            export interface IClientFactory {
                createClient(applicationId: string): Client;
                createClientWithOptions(applicationId: string, options: ClientCreateOptions): Client;
            }
            export interface IClientServices {
                flushLogfile(): string;
                requestDelayedResources(): void;
                suspend(): void;
                resume(): void;
                registerForDispose(pDisposable: IDisposable): void;
                unregisterForDispose(pDisposable: IDisposable): void;
            }
            export interface ICollection extends IDisposable {
                count: number;
                totalCount: number;
                item(index: number): IObject;
                fetchMoreItems(dwFetchSize: number): void;
                lock(): void;
                unlock(): void;
            }
            export interface IConfigInstance extends IConfigObject, IObject {
                area_String: string;
                buffer: /* Windows.Storage.Streams.IBuffer */ any;
                cloud_String: string;
                file: /* Windows.Storage.IStorageFile */ any;
                market_String: string;
                uri: string;
            }
            export interface IConfigManager {
                metadataObject: IConfigMetadataObject;
                getCurrentConfigCollection(area: ConfigArea, feature: string): ICollection;
                getConfigCollection(area: ConfigArea, feature: string, marketId: number, cloud: ConfigCloud): ICollection;
                createNewFeature(area: ConfigArea, feature: string, cloud: ConfigCloud, market: number, begin: Date, end: Date, hash: string, xmlData: string): void;
                createNewFeature_1(instance: IConfigInstance): void;
                deleteComplement(prgKeep: IConfigObject[]): void;
                resetDatabase(): void;
                insertMetadataRow(version: string): void;
                modifyConfig(area: ConfigArea, feature: string, xpath: string, newValue: string): void;
            }
            export interface IConfigMetadataObject extends IObject {
                currentVersion: string;
                lastUpdate: Date;
            }
            export interface IConfigObject extends IObject {
                area: ConfigArea;
                beginDate: Date;
                cloud: ConfigCloud;
                endDate: Date;
                feature: string;
                hash: string;
                market: number;
                xmlData: string;
                updateXmlDataWithHash(xmlData: string, hash: string): void;
            }
            export interface IContact extends IObject, IBaseContact {
                cid: CID;
                imtype: ContactIMType;
                account: IAccount;
                alias: string;
                anniversary: Date;
                birthdate: Date;
                business2PhoneNumber: string;
                businessEmailAddress: string;
                businessFaxNumber: string;
                businessLocation: Location;
                businessPhoneNumber: string;
                canIMNow: Boolean;
                canOIM: Boolean;
                companyName: string;
                federatedEmailAddress: string;
                home2PhoneNumber: string;
                homeFaxNumber: string;
                homeLocation: Location;
                homePhoneNumber: string;
                isBuddy: Boolean;
                isPublicEntity: Boolean;
                jobTitle: string;
                linkType: ContactLinkingType;
                mainMri: string;
                mobile2PhoneNumber: string;
                mobilePhoneNumber: string;
                notes: string;
                officeLocation: string;
                otherEmailAddress: string;
                otherLocation: Location;
                pagerNumber: string;
                person: IPerson;
                personalEmailAddress: string;
                significantOther: string;
                suffix: string;
                supportsMobileIM: Boolean;
                thirdPartyObjectId: string;
                title: string;
                trustLevel: ContactTrustLevel;
                verbs: ICollection;
                webSite: string;
                windowsLiveEmailAddress: string;
                yahooEmailAddress: string;
                yomiCompanyName: string;
                yomiFirstName: string;
                yomiLastName: string;
                unlink(): void;
            }
            export interface IDisposable {
                dispose(): void;
            }
            export interface IEasAccountSettings extends IAccountServerConnectionSettings {
                isWlasSupported: Boolean;
                rightsManagementTemplates: ICollection;
                certificateThumbPrint: /* System.Byte[] */ any;
                issuerList: string;
                oofBodyForInternal: string;
                oofBodyForKnownExternal: string;
                oofBodyForUnknownExternal: string;
                oofEnabledForInternal: Boolean;
                oofEnabledForKnownExternal: Boolean;
                oofEnabledForUnknownExternal: Boolean;
                oofEndTime: Date | null;
                oofLastIgnoredTime: Date | null;
                oofStartTime: Date | null;
                oofState: Boolean;
                policyApplyAttempted: Boolean;
                policyComplianceResults: PolicyComplianceResults;
                isOofSupported(): Boolean;
                getClientSecurityPolicy(): /* Windows.Security.ExchangeActiveSyncProvisioning.EasClientSecurityPolicy */ any;
            }
            export interface IFolder extends IObject {
                accountId: string;
                canHaveChildren: Boolean;
                canMove: Boolean;
                canRename: Boolean;
                folderName: string;
                folderType: FolderType;
                hasProcessedConversations: Boolean;
                hasSynced: Boolean;
                isFolderThreadingCapable: Boolean;
                isLocalMailFolder: Boolean;
                isPinnedToNavPane: Boolean;
                parentFolder: IFolder;
                selectionDisabled: Boolean;
                specialCalendarFolderType: CalendarFolderType;
                specialContactFolderType: ContactFolderType;
                specialMailFolderType: MailFolderType;
                syncFolderContents: Boolean;
                syncStatus: number;
                underDeletedItems: Boolean;
                markViewed(): void;
                getChildFolderCollection(fAllTypes: Boolean): ICollection;
                startSyncFolderContents(fForceSynchronization: Boolean): void;
                recordAction(value: FolderAction): void;
                ensureNameUnique(): void;
            }
            export interface IFolderManager {
                getRootFolderCollection(pAccount: IAccount): ICollection;
                getRootFolderCollection_1(pAccount: IAccount, eType: FolderType): ICollection;
                getRootUserMailFolderCollection(pAccount: IAccount): ICollection;
                getAllFoldersCollection(eType: FolderType): ICollection;
                getAllFoldersCollection_1(eType: FolderType, pAccount: IAccount): ICollection;
                getSpecialMailFolder(pAccount: IAccount, eType: MailFolderType): IFolder;
                getSpecialContactFolder(pAccount: IAccount, eType: ContactFolderType): IFolder;
                getSpecialCalendarFolder(pAccount: IAccount, eType: CalendarFolderType): IFolder;
                createFolder(pAccount: IAccount): IFolder;
                loadFolder(hstrId: string): IFolder;
                getAllFoldersNotUnderDeletedItemsCollection(eType: FolderType): ICollection;
                getAllFoldersNotUnderDeletedItemsCollection_1(eType: FolderType, pAccount: IAccount): ICollection;
                getImapSpecialFolderId(pAccount: IAccount, eType: MailFolderType): string;
                setImapSpecialFolderPath(pAccount: IAccount, eType: MailFolderType, hstrFolderId: string): void;
            }
            export interface IIdentifierCollection extends ICollection, IDisposable {
                identifier: string;
            }
            export interface IImapAccountSettings {
                deletedItemsFolderPath: string;
                deletedItemsFolderXlist: Boolean;
                draftsFolderPath: string;
                draftsFolderXlist: Boolean;
                junkFolderPath: string;
                junkFolderXlist: Boolean;
                pushSupported: Boolean;
                sentItemsFolderPath: string;
                sentItemsFolderXlist: Boolean;
            }
            export interface IMailAttachment extends IObject {
                bodyFile: string;
                bodyUri: string;
                composeStatus: AttachmentComposeStatus;
                contentId: string;
                contentLocation: string;
                contentType: string;
                fileAccessToken: string;
                fileName: string;
                photoMailFileType: PMFileType;
                size: number;
                syncStatus: AttachmentSyncStatus;
                transcodedFilename: string;
                transcodedSize: number;
                uiType: AttachmentUIType;
                getBody(): /* Windows.Storage.Streams.IRandomAccessStream */ any;
                createBody(pBody: /* Windows.Storage.Streams.IRandomAccessStream */ any): void;
                createBodyFromFile(fileName: string, fileSize: number): void;
                downloadBody(): void;
                cancelDownload(): void;
                clone(pNewParent: IMailMessage): IMailAttachment;
            }
            export interface IMailBody extends IObject {
                body: string;
                metadata: string;
                method: string;
                truncated: Boolean;
                type: MailBodyType;
            }
            export interface IMailConversation extends IObject {
                flagged: Boolean;
                fromRecipient: IRecipient;
                hasCalendarInvite: Boolean;
                hasCalendarRequest: Boolean;
                hasDraft: Boolean;
                hasOnlyDraftOrSent: Boolean;
                hasOrdinaryAttachments: Boolean;
                importance: MailMessageImportance;
                instanceNumber: number;
                irmHasTemplate: Boolean;
                lastVerb: MailMessageLastVerb;
                latestReceivedTime: Date | null;
                read: Boolean;
                subject: string;
                toRecipients: IRecipient[];
                totalCount: number;
                getChildMessages(): ICollection;
            }
            export interface IMailManager {
                getPermanentlyFailedMessageCollection(hstrAccountId: string): ICollection;
                createMessage(pAccount: IAccount): IMailMessage;
                createMessageInFolder(pFolder: IFolder): IMailMessage;
                createDraftMessage(pSourceView: IMailView): IMailMessage;
                createMessageFromMime(pFolder: IFolder, pStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, fAllowCommit: Boolean): IMailMessage;
                createMessageFromMimeAsync(pFolder: IFolder, pStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, fAllowCommit: Boolean): IAsyncOperation<IMailMessage>;
                loadMessage(hstrMessageId: string): IMailMessage;
                waitForInstanceNumberOnMessage(hstrMessageId: string, uInstanceNumber: number): IAsyncAction;
                batchChange(pCollectionToKeepInView: ICollection, hstrSourceViewId: string, changeType: MailMessageChangeOperation, objectIds: string[]): void;
                batchMove(hstrSourceViewId: string, hstrDestViewId: string, objectIds: string[]): void;
                batchDelete(objectIds: string[]): void;
                search(pScope: IObject, hstrSearchFilter: string, hstrSearchLocale: string, uiPageSize: number): ICollection;
                setMailVisible(fVisible: Boolean): void;
                getMailView(type: MailViewType, pAccount: IAccount): IMailView;
                getMailViews(scenario: MailViewScenario, accountId: string): ICollection;
                ensureMailView(type: MailViewType, accountId: string, objectId: string): IMailView;
                keepObjectInView(pFilteredCollection: ICollection, objectIds: string[]): void;
                getMessageCollectionBySanitizedVersion(eVersion: SanitizedVersion): ICollection;
                parseLaunchArguments(launchArguments: string): MailLaunchArguments;
                tryLoadMailView(viewObjectId: string): IMailView;
                getIncludeSentItemsInConversation(): Boolean;
                setIncludeSentItemsInConversation(fIncludeSentItemsInConversation: Boolean): void;
                checkIncludeSentItemsInConversationForChange(): void;
            }
            export interface IMailMessage extends IObject {
                accountId: string;
                allowExternalImages: Boolean;
                bcc: string;
                bccRecipients: IRecipient[];
                bodyDownloadStatus: BodyDownloadStatus;
                calendarEvent: any;
                calendarMessageType: CalendarMessageType;
                canFlag: Boolean;
                canMarkRead: Boolean;
                canMove: Boolean;
                canMoveFromOutboxToDrafts: Boolean;
                cc: string;
                ccRecipients: IRecipient[];
                displayViewIdString: string;
                displayViewIds: string[];
                eventHandle: string;
                eventUID: string;
                flagged: Boolean;
                from: string;
                fromRecipient: IRecipient;
                hasAttachments: Boolean;
                hasNewsletterCategory: Boolean;
                hasOrdinaryAttachments: Boolean;
                hasSocialUpdateCategory: Boolean;
                importance: MailMessageImportance;
                instanceNumber: number;
                isFromPersonPinned: Boolean;
                isLocalMessage: Boolean;
                isPermanentSendFailure: Boolean;
                lastVerb: MailMessageLastVerb;
                modified: Date | null;
                needBody: Boolean;
                normalizedSubject: string;
                outboxQueue: OutboxQueue;
                parentConversationId: string;
                photoMailAlbumName: string;
                photoMailFlags: number;
                photoMailStatus: number;
                preview: string;
                read: Boolean;
                received: Date | null;
                replyTo: string;
                replyToRecipients: IRecipient[];
                sanitizedVersion: SanitizedVersion;
                sender: string;
                senderRecipient: IRecipient;
                sent: Date | null;
                sourceFolderServerId: string;
                sourceHasEmbeddedAttachments: Boolean;
                sourceInstanceId: Date;
                sourceItemServerId: string;
                sourceLongId: string;
                sourceMessageStoreId: string;
                sourceReplaceMime: Boolean;
                sourceVerb: MailMessageLastVerb;
                subject: string;
                syncStatus: number;
                to: string;
                toRecipients: IRecipient[];
                bestDisplayViewId(hstrCurrentView: string): string;
                isBodyTruncated(eType: MailBodyType): Boolean;
                isBodyAutoGenerated(eType: MailBodyType): Boolean;
                downloadFullBody(): void;
                hasBody(eType: MailBodyType): Boolean;
                getBody(): IMailBody;
                getBody_1(eType: MailBodyType): IMailBody;
                getJunkBody(): IMailBody;
                createBody(): IMailBody;
                commitSanitizedBody(): void;
                cloneMessage(fIncludeAttachments: Boolean, eLastVerb: MailMessageLastVerb, pSourceView: IMailView): IMailMessage;
                serializeAsMime(): /* Windows.Storage.Streams.IRandomAccessStream */ any;
                serializeAsMimeWithoutBcc(): /* Windows.Storage.Streams.IRandomAccessStream */ any;
                moveFromOutboxToDraftsAndCommit(): void;
                moveToOutbox(): void;
                moveToSentItems(hstrFromAddress: string): void;
                isInSpecialFolderType(eType: MailFolderType): Boolean;
                getEmbeddedAttachmentCollection(): ICollection;
                getOrdinaryAttachmentCollection(): ICollection;
                getHiddenAttachmentCollection(): ICollection;
                createAttachment(): IMailAttachment;
                loadAttachment(attachmentId: string): IMailAttachment;
            }
            export interface IMailPreviewGenerator {
                generatePreview(pMessage: IMailMessage): string;
                generatePlainTextBody(pMessage: IMailMessage): { returnValue: Boolean, phstrPlainText: string };
            }
            export interface IMailRule extends IObject {
                actionType: MailRuleActionType;
                deferredActionAge: number;
                deferredActionType: MailRuleDeferredActionType;
                senderEmailAddress: string;
                targetCategoryId: MailRuleCategoryId;
                targetFolderId: string;
                runMailRule(strScopeFolderId: string): void;
            }
            export interface IMailRuleAccountResource {
                queuedRules: ICollection;
                ruleRunResult: number;
                ruleSyncResult: number;
                rules: ICollection;
                running: Boolean;
                createRule(): IMailRule;
            }
            export interface IMailRuleQueued extends IMailRule, IObject {
                scopeFolderId: string;
            }
            export interface IMailView extends IObject {
                accountId: string;
                canChangePinState: Boolean;
                canServerSearch: Boolean;
                isEnabled: Boolean;
                isPinnedToNavPane: Boolean;
                lastActiveTimeStamp: Date;
                notificationCount: number;
                sourceObject: IObject;
                startScreenTileId: string;
                type: MailViewType;
                getMessages(filter: FilterCriteria): ICollection;
                getConversations(filter: FilterCriteria): ICollection;
                getLaunchArguments(messageObjectId: string): string;
                clearUnseenMessages(): void;
                pinToNavPane(fPin: Boolean): void;
                setEnabled(fEnabled: Boolean): void;
                setStartScreenTileId(hstrTileId: string, hstrLaunchArguments: string, fUpdateVersion: Boolean): void;
            }
            export class ImapAccountSettings implements IAccountServerConnectionSettings, IImapAccountSettings, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                userId: string;
                useSsl: Boolean;
                supportsOAuth: Boolean;
                server: string;
                port: number;
                ignoreServerCertificateUnknownCA: Boolean;
                ignoreServerCertificateMismatchedDomain: Boolean;
                ignoreServerCertificateExpired: Boolean;
                domain: string;
                hasPasswordCookie: Boolean;
                serverType: ServerType;
                supportsAdvancedProperties: Boolean;
                sentItemsFolderPath: string;
                junkFolderPath: string;
                draftsFolderPath: string;
                deletedItemsFolderPath: string;
                deletedItemsFolderXlist: Boolean;
                draftsFolderXlist: Boolean;
                junkFolderXlist: Boolean;
                pushSupported: Boolean;
                sentItemsFolderXlist: Boolean;

                setPasswordCookie(cookie: string): void {
                    console.warn('shimmed function ImapAccountSettings.setPasswordCookie');
                }

                commit(): void {
                    console.warn('shimmed function ImapAccountSettings.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function ImapAccountSettings.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function ImapAccountSettings.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`ImapAccountSettings::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export interface IMe extends IObject, IContact, IBaseContact, IPerson {
                userTileCrop: UserTileCrop;
                setOnlineStatus(csStatus: ContactStatus): void;
                setUserTile(pWebReadyTile: /* Windows.Storage.Streams.IRandomAccessStream */ any, pExtraLargeTile: /* Windows.Storage.Streams.IRandomAccessStream */ any, crop: UserTileCrop): void;
                clearUserTile(): void;
            }
            export class ImplicitPerson implements IPerson, IObject, IBaseContact, ISearchPerson, IContact {
                calculatedYomiDisplayName: string;
                canClearPersonTile: Boolean;
                canEmail: Boolean;
                isFavorite: Boolean;
                isInAddressBook: Boolean;
                linkedContacts: ICollection;
                mostRelevantEmail: string;
                mostRelevantPhone: string;
                sortNameLastFirst: string;
                suggestedPeople: ICollection;
                tileId: string;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                nickname: string;
                middleName: string;
                lastName: string;
                firstName: string;
                calculatedUIName: string;
                isGal: Boolean;
                onlineStatus: ContactStatus;
                businessEmailAddress: string;
                business2PhoneNumber: string;
                birthdate: Date;
                anniversary: Date;
                alias: string;
                businessPhoneNumber: string;
                businessLocation: Location;
                businessFaxNumber: string;
                title: string;
                homePhoneNumber: string;
                homeLocation: Location;
                homeFaxNumber: string;
                home2PhoneNumber: string;
                mobilePhoneNumber: string;
                companyName: string;
                jobTitle: string;
                mobile2PhoneNumber: string;
                notes: string;
                otherLocation: Location;
                officeLocation: string;
                yomiFirstName: string;
                yomiCompanyName: string;
                webSite: string;
                trustLevel: ContactTrustLevel;
                suffix: string;
                significantOther: string;
                personalEmailAddress: string;
                pagerNumber: string;
                yomiLastName: string;
                otherEmailAddress: string;
                imtype: ContactIMType;
                account: IAccount;
                canOIM: Boolean;
                federatedEmailAddress: string;
                isBuddy: Boolean;
                isPublicEntity: Boolean;
                linkType: ContactLinkingType;
                mainMri: string;
                person: IPerson;
                supportsMobileIM: Boolean;
                thirdPartyObjectId: string;
                canIMNow: Boolean;
                verbs: ICollection;
                windowsLiveEmailAddress: string;
                yahooEmailAddress: string;
                cid: CID;

                createLink(pPerson: IPerson): void {
                    console.warn('shimmed function ImplicitPerson.createLink');
                }

                manageLinks(personObjectIdsToLink: string[], contactObjectIdsToUnlink: string[]): void {
                    console.warn('shimmed function ImplicitPerson.manageLinks');
                }

                commitAndLink(pUncommittedContact: IContact): void {
                    console.warn('shimmed function ImplicitPerson.commitAndLink');
                }

                insertFavorite(position: FavoriteInsertPosition, pFavoriteMember: IPerson): void {
                    console.warn('shimmed function ImplicitPerson.insertFavorite');
                }

                removeFavorite(): void {
                    console.warn('shimmed function ImplicitPerson.removeFavorite');
                }

                createRecipient(email: string): IRecipient {
                    throw new Error('shimmed function ImplicitPerson.createRecipient');
                }

                augmentViaServerAsync(fBackground: Boolean): IAsyncAction {
                    throw new Error('shimmed function ImplicitPerson.augmentViaServerAsync');
                }

                getWindowsContact(): /* Windows.ApplicationModel.Contacts.Contact */ any {
                    throw new Error('shimmed function ImplicitPerson.getWindowsContact');
                }

                setPersonTile(pExtraLargeTile: /* Windows.Storage.Streams.IRandomAccessStream */ any): void {
                    console.warn('shimmed function ImplicitPerson.setPersonTile');
                }

                clearPersonTile(): void {
                    console.warn('shimmed function ImplicitPerson.clearPersonTile');
                }

                setStartScreenTileId(hstrTileId: string, hstrLaunchArguments: string): void {
                    console.warn('shimmed function ImplicitPerson.setStartScreenTileId');
                }

                commit(): void {
                    console.warn('shimmed function ImplicitPerson.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function ImplicitPerson.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function ImplicitPerson.getKeepAlive');
                }

                getUserTile(size: UserTileSize, cachedOnly: Boolean): IUserTile {
                    throw new Error('shimmed function ImplicitPerson.getUserTile');
                }

                savePermanently(pLinkTarget: IPerson): void {
                    console.warn('shimmed function ImplicitPerson.savePermanently');
                }

                unlink(): void {
                    console.warn('shimmed function ImplicitPerson.unlink');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`ImplicitPerson::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum IncludeSentItemsInConversationCache {
                min,
                enabled = 0,
                disabled,
                rebuildingEnabled,
                rebuildingDisabled,
                max = 3,
            }
            export interface INotificationCollection extends IDisposable {
                dispatchEvents(): void;
                cancelSynchronousDispatch(): void;
            }
            export interface IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                commit(): void;
                deleteObject(): void;
                getKeepAlive(): ITransientObjectHolder;
            }
            export interface IPeopleManager {
                nameSortOrder: Boolean;
                createContact(): IContact;
                createContact_1(pAccount: IAccount): IContact;
                loadContact(objectId: string): IContact;
                tryLoadContact(objectId: string): IContact;
                tryLoadContactByLaunchArguments(hstrLaunchArguments: string): IContact;
                createTemporaryPerson(pAccount: IAccount, data: TemporaryContactData): IPerson;
                loadPerson(objectId: string): IPerson;
                tryLoadPerson(objectId: string): IPerson;
                tryLoadPersonByCID(cid: number): IPerson;
                tryLoadPersonBySourceIDAndObjectID(sourceId: string, sourceObjectId: string): IPerson;
                tryLoadPersonByMri(mri: string): IPerson;
                tryLoadPersonByTileId(hstrTileId: string): IPerson;
                loadRecipientByEmail(email: string, name: string): IRecipient;
                promoteImplicitContact(pAccount: IAccount, implicitContactObjectId: string): void;
                getFavoritePeople(): ICollection;
                getFavoritePeopleByCustomOrder(): ICollection;
                getRelevantPeople(): ICollection;
                getPeopleNameBetween(onlineFilter: OnlineStatusFilter, hstrLowerBound: string, isLowerBoundInclusive: Boolean, hstrUpperBound: string, isUpperBoundInclusive: Boolean): ICollection;
                getPeopleNameOrEmailStartWith(hstrSearch: string): ICollection;
                getPeopleByPickerQuery(filter: PeoplePickerFilter, favoritesFilter: FavoritesFilter, onlineFilter: OnlineStatusFilter, hstrLowerBound: string, isLowerBoundInclusive: Boolean, hstrUpperBound: string, isUpperBoundInclusive: Boolean): ICollection;
                getPeopleNameOrEmailStartWithEx(hstrSearch: string): ICollection;
                getPeopleByHasLocalUserTile(fHasLocalUserTile: Boolean, fOnlyFavorites: Boolean): ICollection;
                search(searchType: PeopleSearchType, hstrSearchFilter: string, hstrSearchLocale: string, uiPageSize: number): ICollection;
                searchServer(hstrSearch: string, cInitialResultCount: number, pAccount: IAccount, uCachePeriod: number): ICollection;
                searchServerBackground(hstrSearch: string, cInitialResultCount: number, pAccount: IAccount, uCachePeriod: number): ICollection;
                recordRelevanceAction(pAssociatedEntities: IRelevanceEntity[], action: RelevanceAction, pContextualAccount: IAccount, timestamp: Date): void;
                getSuggestions(pAssociatedEntities: IRelevanceEntity[], scenario: RelevanceScenario, pContextualAccount: IAccount, count: number): IRelevanceEntity[];
                addressWellSearchAsync(hstrSearchFilter: string, hstrSearchLocale: string, scenario: RelevanceScenario, pContextualAccount: IAccount, count: number, pExcludeRecipients: IRecipient[]): IAsyncOperation<IRecipient[]>;
            }
            export interface IPerson extends IObject, IBaseContact {
                calculatedYomiDisplayName: string;
                canClearPersonTile: Boolean;
                canEmail: Boolean;
                isFavorite: Boolean;
                isInAddressBook: Boolean;
                linkedContacts: ICollection;
                mostRelevantEmail: string;
                mostRelevantPhone: string;
                sortNameLastFirst: string;
                suggestedPeople: ICollection;
                tileId: string;
                createLink(pPerson: IPerson): void;
                manageLinks(personObjectIdsToLink: string[], contactObjectIdsToUnlink: string[]): void;
                commitAndLink(pUncommittedContact: IContact): void;
                insertFavorite(position: FavoriteInsertPosition, pFavoriteMember: IPerson): void;
                removeFavorite(): void;
                createRecipient(email: string): IRecipient;
                augmentViaServerAsync(fBackground: Boolean): IAsyncAction;
                getWindowsContact(): /* Windows.ApplicationModel.Contacts.Contact */ any;
                setPersonTile(pExtraLargeTile: /* Windows.Storage.Streams.IRandomAccessStream */ any): void;
                clearPersonTile(): void;
                setStartScreenTileId(hstrTileId: string, hstrLaunchArguments: string): void;
            }
            export interface IPluginVerb {
                context: any;
                id: string;
                name: string;
                parameters: string;
                task: any;
            }
            export interface IPluginVerbManager {
                createVerb(hstrVerbName: string, hstrVerbParams: string): IPluginVerb;
                createVerbFromTask(hstrVerbName: string, hstrVerbParams: string, pTaskInstance: any): IPluginVerb;
                createVerbFromTaskWithContext(hstrVerbName: string, hstrVerbParams: string, pContext: any, pTaskInstance: any): IPluginVerb;
                runResourceVerb(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): void;
                runResourceVerbAsync(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): IAsyncAction;
                cancelResourceVerb(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): void;
            }
            export interface IRecipient extends IDisposable {
                calculatedUIName: string;
                emailAddress: string;
                fastName: string;
                objectType: string;
                person: IPerson;
            }
            export interface IRelevanceEntity extends IDisposable {
                relevanceEntityId: string;
                relevanceEntityType: RelevanceEntityType;
            }
            export interface IRightsManagementLicense extends IObject {
                irmAllowProgramaticAccess: Boolean;
                irmCanEdit: Boolean;
                irmCanExtractContent: Boolean;
                irmCanForward: Boolean;
                irmCanModifyRecipients: Boolean;
                irmCanPrint: Boolean;
                irmCanRemoveRightsManagement: Boolean;
                irmCanReply: Boolean;
                irmCanReplyAll: Boolean;
                irmExpiryDate: Date;
                irmHasTemplate: Boolean;
                irmIsContentOwner: Boolean;
                irmTemplateDescription: string;
                irmTemplateId: string;
                irmTemplateName: string;
                removeRightsManagementTemplate(): void;
                setRightsManagementTemplate(pRightsManagementTemplate: IRightsManagementTemplate): void;
            }
            export interface IRightsManagementTemplate extends IObject {
                description: string;
                id: string;
                name: string;
            }
            export interface ISearchCollection extends ICollection, IDisposable {
                beginServerSearch(): void;
            }
            export interface ISearchPerson extends IObject, IBaseContact {
                savePermanently(pLinkTarget: IPerson): void;
            }
            export interface ISmtpAccountSettings {
                addSentItemsToSentFolder: Boolean;
                serverRequiresLogin: Boolean;
                usesMailCredentials: Boolean;
            }
            export interface ITransientObjectHolder extends IDisposable {
                objectId: string;
            }
            export interface IUserTile extends IObject {
                appdataURI: string;
                stream: /* Windows.Storage.Streams.IRandomAccessStream */ any;
            }
            export interface IVerb extends IObject {
                url: string;
                verbType: VerbType;
            }
            export interface Location {
                street: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
            }
            export class LockscreenStateChangeTask {
                run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                    console.warn('shimmed function LockscreenStateChangeTask.run');
                }

            }
            export class MailAttachment implements IMailAttachment, IObject {
                uiType: AttachmentUIType;
                transcodedSize: number;
                transcodedFilename: string;
                photoMailFileType: PMFileType;
                fileName: string;
                fileAccessToken: string;
                contentType: string;
                contentLocation: string;
                contentId: string;
                composeStatus: AttachmentComposeStatus;
                bodyFile: string;
                bodyUri: string;
                size: number;
                syncStatus: AttachmentSyncStatus;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                getBody(): /* Windows.Storage.Streams.IRandomAccessStream */ any {
                    throw new Error('shimmed function MailAttachment.getBody');
                }

                createBody(pBody: /* Windows.Storage.Streams.IRandomAccessStream */ any): void {
                    console.warn('shimmed function MailAttachment.createBody');
                }

                createBodyFromFile(fileName: string, fileSize: number): void {
                    console.warn('shimmed function MailAttachment.createBodyFromFile');
                }

                downloadBody(): void {
                    console.warn('shimmed function MailAttachment.downloadBody');
                }

                cancelDownload(): void {
                    console.warn('shimmed function MailAttachment.cancelDownload');
                }

                clone(pNewParent: IMailMessage): IMailAttachment {
                    throw new Error('shimmed function MailAttachment.clone');
                }

                commit(): void {
                    console.warn('shimmed function MailAttachment.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function MailAttachment.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function MailAttachment.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`MailAttachment::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class MailBody implements IMailBody, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                type: MailBodyType;
                truncated: Boolean;
                method: string;
                metadata: string;
                body: string;

                commit(): void {
                    console.warn('shimmed function MailBody.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function MailBody.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function MailBody.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`MailBody::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum MailBodyType {
                html = 1,
                plainText,
                calendar,
                sanitized,
                max,
            }
            export class MailConversation implements IMailConversation, IObject {
                flagged: Boolean;
                fromRecipient: IRecipient;
                hasCalendarInvite: Boolean;
                hasCalendarRequest: Boolean;
                hasDraft: Boolean;
                hasOnlyDraftOrSent: Boolean;
                hasOrdinaryAttachments: Boolean;
                importance: MailMessageImportance;
                instanceNumber: number;
                irmHasTemplate: Boolean;
                lastVerb: MailMessageLastVerb;
                latestReceivedTime: Date | null;
                read: Boolean;
                subject: string;
                toRecipients: IRecipient[];
                totalCount: number;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                getChildMessages(): ICollection {
                    throw new Error('shimmed function MailConversation.getChildMessages');
                }

                commit(): void {
                    console.warn('shimmed function MailConversation.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function MailConversation.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function MailConversation.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`MailConversation::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum MailFolderType {
                min,
                userGenerated = 0,
                inbox,
                drafts,
                deletedItems,
                sentItems,
                junkMail,
                outbox,
                allMail,
                starred,
                important,
                junkMailAutoCreate,
                max = 10,
            }
            export interface MailLaunchArguments {
                accountId: string;
                messageId: string;
                viewId: string;
            }
            export class MailManager implements IMailManager {
                getPermanentlyFailedMessageCollection(hstrAccountId: string): ICollection {
                    throw new Error('shimmed function MailManager.getPermanentlyFailedMessageCollection');
                }

                createMessage(pAccount: IAccount): IMailMessage {
                    throw new Error('shimmed function MailManager.createMessage');
                }

                createMessageInFolder(pFolder: IFolder): IMailMessage {
                    throw new Error('shimmed function MailManager.createMessageInFolder');
                }

                createDraftMessage(pSourceView: IMailView): IMailMessage {
                    throw new Error('shimmed function MailManager.createDraftMessage');
                }

                createMessageFromMime(pFolder: IFolder, pStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, fAllowCommit: Boolean): IMailMessage {
                    throw new Error('shimmed function MailManager.createMessageFromMime');
                }

                createMessageFromMimeAsync(pFolder: IFolder, pStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, fAllowCommit: Boolean): IAsyncOperation<IMailMessage> {
                    throw new Error('shimmed function MailManager.createMessageFromMimeAsync');
                }

                loadMessage(hstrMessageId: string): IMailMessage {
                    throw new Error('shimmed function MailManager.loadMessage');
                }

                waitForInstanceNumberOnMessage(hstrMessageId: string, uInstanceNumber: number): IAsyncAction {
                    throw new Error('shimmed function MailManager.waitForInstanceNumberOnMessage');
                }

                batchChange(pCollectionToKeepInView: ICollection, hstrSourceViewId: string, changeType: MailMessageChangeOperation, objectIds: string[]): void {
                    console.warn('shimmed function MailManager.batchChange');
                }

                batchMove(hstrSourceViewId: string, hstrDestViewId: string, objectIds: string[]): void {
                    console.warn('shimmed function MailManager.batchMove');
                }

                batchDelete(objectIds: string[]): void {
                    console.warn('shimmed function MailManager.batchDelete');
                }

                search(pScope: IObject, hstrSearchFilter: string, hstrSearchLocale: string, uiPageSize: number): ICollection {
                    throw new Error('shimmed function MailManager.search');
                }

                setMailVisible(fVisible: Boolean): void {
                    console.warn('shimmed function MailManager.setMailVisible');
                }

                getMailView(type: MailViewType, pAccount: IAccount): IMailView {
                    throw new Error('shimmed function MailManager.getMailView');
                }

                getMailViews(scenario: MailViewScenario, accountId: string): ICollection {
                    throw new Error('shimmed function MailManager.getMailViews');
                }

                ensureMailView(type: MailViewType, accountId: string, objectId: string): IMailView {
                    throw new Error('shimmed function MailManager.ensureMailView');
                }

                keepObjectInView(pFilteredCollection: ICollection, objectIds: string[]): void {
                    console.warn('shimmed function MailManager.keepObjectInView');
                }

                getMessageCollectionBySanitizedVersion(eVersion: SanitizedVersion): ICollection {
                    throw new Error('shimmed function MailManager.getMessageCollectionBySanitizedVersion');
                }

                parseLaunchArguments(launchArguments: string): MailLaunchArguments {
                    throw new Error('shimmed function MailManager.parseLaunchArguments');
                }

                tryLoadMailView(viewObjectId: string): IMailView {
                    throw new Error('shimmed function MailManager.tryLoadMailView');
                }

                getIncludeSentItemsInConversation(): Boolean {
                    throw new Error('shimmed function MailManager.getIncludeSentItemsInConversation');
                }

                setIncludeSentItemsInConversation(fIncludeSentItemsInConversation: Boolean): void {
                    console.warn('shimmed function MailManager.setIncludeSentItemsInConversation');
                }

                checkIncludeSentItemsInConversationForChange(): void {
                    console.warn('shimmed function MailManager.checkIncludeSentItemsInConversationForChange');
                }

            }
            export class MailMessage implements IMailMessage, IObject, IRightsManagementLicense {
                photoMailStatus: number;
                hasNewsletterCategory: Boolean;
                cc: string;
                outboxQueue: OutboxQueue;
                accountId: string;
                photoMailFlags: number;
                photoMailAlbumName: string;
                flagged: Boolean;
                sourceHasEmbeddedAttachments: Boolean;
                importance: MailMessageImportance;
                hasSocialUpdateCategory: Boolean;
                bcc: string;
                allowExternalImages: Boolean;
                from: string;
                read: Boolean;
                to: string;
                sourceVerb: MailMessageLastVerb;
                sourceReplaceMime: Boolean;
                sourceItemServerId: string;
                sourceInstanceId: Date;
                sourceFolderServerId: string;
                subject: string;
                sanitizedVersion: SanitizedVersion;
                canMarkRead: Boolean;
                canMoveFromOutboxToDrafts: Boolean;
                ccRecipients: IRecipient[];
                displayViewIds: string[];
                eventHandle: string;
                eventUID: string;
                canMove: Boolean;
                fromRecipient: IRecipient;
                hasAttachments: Boolean;
                hasOrdinaryAttachments: Boolean;
                instanceNumber: number;
                isFromPersonPinned: Boolean;
                isLocalMessage: Boolean;
                isPermanentSendFailure: Boolean;
                lastVerb: MailMessageLastVerb;
                needBody: Boolean;
                normalizedSubject: string;
                parentConversationId: string;
                received: Date | null;
                replyTo: string;
                replyToRecipients: IRecipient[];
                sender: string;
                senderRecipient: IRecipient;
                sent: Date | null;
                displayViewIdString: string;
                modified: Date | null;
                bccRecipients: IRecipient[];
                bodyDownloadStatus: BodyDownloadStatus;
                sourceLongId: string;
                sourceMessageStoreId: string;
                calendarEvent: any;
                calendarMessageType: CalendarMessageType;
                preview: string;
                syncStatus: number;
                canFlag: Boolean;
                toRecipients: IRecipient[];
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                irmAllowProgramaticAccess: Boolean;
                irmCanEdit: Boolean;
                irmCanExtractContent: Boolean;
                irmCanForward: Boolean;
                irmCanModifyRecipients: Boolean;
                irmCanPrint: Boolean;
                irmCanRemoveRightsManagement: Boolean;
                irmCanReply: Boolean;
                irmCanReplyAll: Boolean;
                irmExpiryDate: Date;
                irmHasTemplate: Boolean;
                irmIsContentOwner: Boolean;
                irmTemplateDescription: string;
                irmTemplateId: string;
                irmTemplateName: string;

                bestDisplayViewId(hstrCurrentView: string): string {
                    throw new Error('shimmed function MailMessage.bestDisplayViewId');
                }

                isBodyTruncated(eType: MailBodyType): Boolean {
                    throw new Error('shimmed function MailMessage.isBodyTruncated');
                }

                isBodyAutoGenerated(eType: MailBodyType): Boolean {
                    throw new Error('shimmed function MailMessage.isBodyAutoGenerated');
                }

                downloadFullBody(): void {
                    console.warn('shimmed function MailMessage.downloadFullBody');
                }

                hasBody(eType: MailBodyType): Boolean {
                    throw new Error('shimmed function MailMessage.hasBody');
                }

                getBody(): IMailBody {
                    throw new Error('shimmed function MailMessage.getBody');
                }

                getBody_1(eType: MailBodyType): IMailBody {
                    throw new Error('shimmed function MailMessage.getBody_1');
                }

                getJunkBody(): IMailBody {
                    throw new Error('shimmed function MailMessage.getJunkBody');
                }

                createBody(): IMailBody {
                    throw new Error('shimmed function MailMessage.createBody');
                }

                commitSanitizedBody(): void {
                    console.warn('shimmed function MailMessage.commitSanitizedBody');
                }

                cloneMessage(fIncludeAttachments: Boolean, eLastVerb: MailMessageLastVerb, pSourceView: IMailView): IMailMessage {
                    throw new Error('shimmed function MailMessage.cloneMessage');
                }

                serializeAsMime(): /* Windows.Storage.Streams.IRandomAccessStream */ any {
                    throw new Error('shimmed function MailMessage.serializeAsMime');
                }

                serializeAsMimeWithoutBcc(): /* Windows.Storage.Streams.IRandomAccessStream */ any {
                    throw new Error('shimmed function MailMessage.serializeAsMimeWithoutBcc');
                }

                moveFromOutboxToDraftsAndCommit(): void {
                    console.warn('shimmed function MailMessage.moveFromOutboxToDraftsAndCommit');
                }

                moveToOutbox(): void {
                    console.warn('shimmed function MailMessage.moveToOutbox');
                }

                moveToSentItems(hstrFromAddress: string): void {
                    console.warn('shimmed function MailMessage.moveToSentItems');
                }

                isInSpecialFolderType(eType: MailFolderType): Boolean {
                    throw new Error('shimmed function MailMessage.isInSpecialFolderType');
                }

                getEmbeddedAttachmentCollection(): ICollection {
                    throw new Error('shimmed function MailMessage.getEmbeddedAttachmentCollection');
                }

                getOrdinaryAttachmentCollection(): ICollection {
                    throw new Error('shimmed function MailMessage.getOrdinaryAttachmentCollection');
                }

                getHiddenAttachmentCollection(): ICollection {
                    throw new Error('shimmed function MailMessage.getHiddenAttachmentCollection');
                }

                createAttachment(): IMailAttachment {
                    throw new Error('shimmed function MailMessage.createAttachment');
                }

                loadAttachment(attachmentId: string): IMailAttachment {
                    throw new Error('shimmed function MailMessage.loadAttachment');
                }

                commit(): void {
                    console.warn('shimmed function MailMessage.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function MailMessage.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function MailMessage.getKeepAlive');
                }

                removeRightsManagementTemplate(): void {
                    console.warn('shimmed function MailMessage.removeRightsManagementTemplate');
                }

                setRightsManagementTemplate(pRightsManagementTemplate: IRightsManagementTemplate): void {
                    console.warn('shimmed function MailMessage.setRightsManagementTemplate');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`MailMessage::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class MailMessageAsyncCreateOperation implements IAsyncOperation<IMailMessage> {
                errorCode: number;
                id: number;
                status: AsyncStatus;
                completed: /* Windows.Foundation.AsyncOperationCompletedHandler`1[[Microsoft.WindowsLive.Platform.IMailMessage, Microsoft, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;

                getResults(): IMailMessage {
                    throw new Error('shimmed function MailMessageAsyncCreateOperation.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function MailMessageAsyncCreateOperation.cancel');
                }

                close(): void {
                    console.warn('shimmed function MailMessageAsyncCreateOperation.close');
                }

            }
            export enum MailMessageChangeOperation {
                markAsRead,
                markAsUnread,
                flag,
                unflag,
                permanentDelete,
            }
            export enum MailMessageImportance {
                normal = 1,
                low,
                high,
            }
            export enum MailMessageLastVerb {
                unknown,
                forward,
                replyToSender,
                replyToAll,
            }
            export class MailPreviewGenerator implements IMailPreviewGenerator {
                generatePreview(pMessage: IMailMessage): string {
                    throw new Error('shimmed function MailPreviewGenerator.generatePreview');
                }

                generatePlainTextBody(pMessage: IMailMessage): { returnValue: Boolean, phstrPlainText: string } {
                    throw new Error('shimmed function MailPreviewGenerator.generatePlainTextBody');
                }

            }
            export class MailRule implements IMailRule, IObject {
                targetFolderId: string;
                targetCategoryId: MailRuleCategoryId;
                senderEmailAddress: string;
                deferredActionType: MailRuleDeferredActionType;
                deferredActionAge: number;
                actionType: MailRuleActionType;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                runMailRule(strScopeFolderId: string): void {
                    console.warn('shimmed function MailRule.runMailRule');
                }

                commit(): void {
                    console.warn('shimmed function MailRule.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function MailRule.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function MailRule.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`MailRule::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class MailRuleAccountResource implements IMailRuleAccountResource, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                running: Boolean;
                ruleSyncResult: number;
                ruleRunResult: number;
                queuedRules: ICollection;
                rules: ICollection;

                createRule(): IMailRule {
                    throw new Error('shimmed function MailRuleAccountResource.createRule');
                }

                commit(): void {
                    console.warn('shimmed function MailRuleAccountResource.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function MailRuleAccountResource.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function MailRuleAccountResource.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`MailRuleAccountResource::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum MailRuleActionType {
                min,
                move = 0,
                addCategory,
                removeCategory,
                max = 2,
            }
            export enum MailRuleCategoryId {
                min,
                none = 0,
                newsletter,
                social,
                max = 2,
            }
            export enum MailRuleDeferredActionType {
                min,
                none = 0,
                days,
                count,
                max = 2,
            }
            export class MailRuleQueued implements IMailRuleQueued, IMailRule, IObject {
                targetFolderId: string;
                targetCategoryId: MailRuleCategoryId;
                senderEmailAddress: string;
                deferredActionType: MailRuleDeferredActionType;
                deferredActionAge: number;
                actionType: MailRuleActionType;
                scopeFolderId: string;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                runMailRule(strScopeFolderId: string): void {
                    console.warn('shimmed function MailRuleQueued.runMailRule');
                }

                commit(): void {
                    console.warn('shimmed function MailRuleQueued.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function MailRuleQueued.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function MailRuleQueued.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`MailRuleQueued::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class MailView implements IMailView, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                lastActiveTimeStamp: Date;
                accountId: string;
                canChangePinState: Boolean;
                canServerSearch: Boolean;
                isEnabled: Boolean;
                isPinnedToNavPane: Boolean;
                notificationCount: number;
                sourceObject: IObject;
                startScreenTileId: string;
                type: MailViewType;

                getMessages(filter: FilterCriteria): ICollection {
                    throw new Error('shimmed function MailView.getMessages');
                }

                getConversations(filter: FilterCriteria): ICollection {
                    throw new Error('shimmed function MailView.getConversations');
                }

                getLaunchArguments(messageObjectId: string): string {
                    throw new Error('shimmed function MailView.getLaunchArguments');
                }

                clearUnseenMessages(): void {
                    console.warn('shimmed function MailView.clearUnseenMessages');
                }

                pinToNavPane(fPin: Boolean): void {
                    console.warn('shimmed function MailView.pinToNavPane');
                }

                setEnabled(fEnabled: Boolean): void {
                    console.warn('shimmed function MailView.setEnabled');
                }

                setStartScreenTileId(hstrTileId: string, hstrLaunchArguments: string, fUpdateVersion: Boolean): void {
                    console.warn('shimmed function MailView.setStartScreenTileId');
                }

                commit(): void {
                    console.warn('shimmed function MailView.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function MailView.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function MailView.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`MailView::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum MailViewScenario {
                navPane,
                allPeople,
                allFolders,
                move,
                systemCategories,
            }
            export enum MailViewType {
                none,
                flagged,
                allPinnedPeople = 1000,
                person = 1100,
                draft = 2000,
                outbox = 2100,
                deletedItems = 2200,
                sentItems = 2300,
                junkMail = 2400,
                inbox = 2500,
                userGeneratedFolder = 2600,
                newsletter = 3000,
                social = 3100,
            }
            export class ManualPushKeepAliveTask {
                run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                    console.warn('shimmed function ManualPushKeepAliveTask.run');
                }

            }
            export class ManualPushNotificationTask {
                run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                    console.warn('shimmed function ManualPushNotificationTask.run');
                }

            }
            export class Me implements IContact, IObject, IBaseContact, IPerson, IMe {
                userTileCrop: UserTileCrop;
                firstName: string;
                lastName: string;
                middleName: string;
                nickname: string;
                onlineStatus: ContactStatus;
                isGal: Boolean;
                calculatedUIName: string;
                objectType: string;
                objectId: string;
                isObjectValid: Boolean;
                canEdit: Boolean;
                canDelete: Boolean;
                homeLocation: Location;
                home2PhoneNumber: string;
                companyName: string;
                businessPhoneNumber: string;
                businessLocation: Location;
                businessEmailAddress: string;
                business2PhoneNumber: string;
                birthdate: Date;
                anniversary: Date;
                alias: string;
                homePhoneNumber: string;
                homeFaxNumber: string;
                suffix: string;
                significantOther: string;
                personalEmailAddress: string;
                jobTitle: string;
                pagerNumber: string;
                otherLocation: Location;
                otherEmailAddress: string;
                yomiCompanyName: string;
                notes: string;
                mobilePhoneNumber: string;
                mobile2PhoneNumber: string;
                officeLocation: string;
                businessFaxNumber: string;
                yomiLastName: string;
                webSite: string;
                yomiFirstName: string;
                trustLevel: ContactTrustLevel;
                title: string;
                windowsLiveEmailAddress: string;
                yahooEmailAddress: string;
                supportsMobileIM: Boolean;
                person: IPerson;
                mainMri: string;
                linkType: ContactLinkingType;
                isPublicEntity: Boolean;
                isBuddy: Boolean;
                cid: CID;
                federatedEmailAddress: string;
                canOIM: Boolean;
                canIMNow: Boolean;
                account: IAccount;
                imtype: ContactIMType;
                thirdPartyObjectId: string;
                verbs: ICollection;
                canClearPersonTile: Boolean;
                canEmail: Boolean;
                calculatedYomiDisplayName: string;
                isInAddressBook: Boolean;
                linkedContacts: ICollection;
                mostRelevantEmail: string;
                mostRelevantPhone: string;
                sortNameLastFirst: string;
                suggestedPeople: ICollection;
                tileId: string;
                isFavorite: Boolean;

                unlink(): void {
                    console.warn('shimmed function Me.unlink');
                }

                commit(): void {
                    console.warn('shimmed function Me.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function Me.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function Me.getKeepAlive');
                }

                getUserTile(size: UserTileSize, cachedOnly: Boolean): IUserTile {
                    throw new Error('shimmed function Me.getUserTile');
                }

                createLink(pPerson: IPerson): void {
                    console.warn('shimmed function Me.createLink');
                }

                manageLinks(personObjectIdsToLink: string[], contactObjectIdsToUnlink: string[]): void {
                    console.warn('shimmed function Me.manageLinks');
                }

                commitAndLink(pUncommittedContact: IContact): void {
                    console.warn('shimmed function Me.commitAndLink');
                }

                insertFavorite(position: FavoriteInsertPosition, pFavoriteMember: IPerson): void {
                    console.warn('shimmed function Me.insertFavorite');
                }

                removeFavorite(): void {
                    console.warn('shimmed function Me.removeFavorite');
                }

                createRecipient(email: string): IRecipient {
                    throw new Error('shimmed function Me.createRecipient');
                }

                augmentViaServerAsync(fBackground: Boolean): IAsyncAction {
                    throw new Error('shimmed function Me.augmentViaServerAsync');
                }

                getWindowsContact(): /* Windows.ApplicationModel.Contacts.Contact */ any {
                    throw new Error('shimmed function Me.getWindowsContact');
                }

                setPersonTile(pExtraLargeTile: /* Windows.Storage.Streams.IRandomAccessStream */ any): void {
                    console.warn('shimmed function Me.setPersonTile');
                }

                clearPersonTile(): void {
                    console.warn('shimmed function Me.clearPersonTile');
                }

                setStartScreenTileId(hstrTileId: string, hstrLaunchArguments: string): void {
                    console.warn('shimmed function Me.setStartScreenTileId');
                }

                setOnlineStatus(csStatus: ContactStatus): void {
                    console.warn('shimmed function Me.setOnlineStatus');
                }

                setUserTile(pWebReadyTile: /* Windows.Storage.Streams.IRandomAccessStream */ any, pExtraLargeTile: /* Windows.Storage.Streams.IRandomAccessStream */ any, crop: UserTileCrop): void {
                    console.warn('shimmed function Me.setUserTile');
                }

                clearUserTile(): void {
                    console.warn('shimmed function Me.clearUserTile');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Me::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export namespace Meetings { 
                export interface IInvitesManager {
                    createResponseMail(pEvent: IEvent, pRequest: IMailMessage, response: ResponseType, pAccount: IAccount): IMailMessage;
                    sendMeetingResponse(pEvent: IEvent, pRequest: IMailMessage, response: ResponseType, pAccount: IAccount): void;
                    createSmartForwardMail(pEvent: IEvent, pAccount: IAccount): IMailMessage;
                    mailFromEvent(pEvent: IEvent, pAccount: IAccount): IMailMessage;
                    mailFromEvent_1(pEvent: IEvent, pAccount: IAccount, pAttendees: IAttendee[]): IMailMessage;
                    applyICS(pMessage: IMailMessage): Boolean;
                }
                export class InvitesManager implements IInvitesManager {
                    createResponseMail(pEvent: IEvent, pRequest: IMailMessage, response: ResponseType, pAccount: IAccount): IMailMessage {
                        throw new Error('shimmed function InvitesManager.createResponseMail');
                    }

                    sendMeetingResponse(pEvent: IEvent, pRequest: IMailMessage, response: ResponseType, pAccount: IAccount): void {
                        console.warn('shimmed function InvitesManager.sendMeetingResponse');
                    }

                    createSmartForwardMail(pEvent: IEvent, pAccount: IAccount): IMailMessage {
                        throw new Error('shimmed function InvitesManager.createSmartForwardMail');
                    }

                    mailFromEvent(pEvent: IEvent, pAccount: IAccount): IMailMessage {
                        throw new Error('shimmed function InvitesManager.mailFromEvent');
                    }

                    mailFromEvent_1(pEvent: IEvent, pAccount: IAccount, pAttendees: IAttendee[]): IMailMessage {
                        throw new Error('shimmed function InvitesManager.mailFromEvent_1');
                    }

                    applyICS(pMessage: IMailMessage): Boolean {
                        throw new Error('shimmed function InvitesManager.applyICS');
                    }

                }
                export namespace Private { 
                    export interface IInvitesManagerPrivate {
                        getMeetingResponses(accountRowId: number): ICollection;
                        updateMeetingResponses(accountId: string, oldCollectionId: string, oldRequestId: string, newCollectionId: string, newRequestId: string): void;
                        hasMeetingResponses(accountId: string, collectionId: string, requestId: string): Boolean;
                    }
                    export interface IMeetingResponse {
                        accountRowId: number;
                        collectionId: string;
                        errors: number;
                        instanceId: Date;
                        longId: string;
                        requestId: string;
                        response: Response;
                    }
                    export class MeetingResponse implements IMeetingResponse, IObject {
                        response: Response;
                        requestId: string;
                        longId: string;
                        instanceId: Date;
                        errors: number;
                        collectionId: string;
                        accountRowId: number;
                        canDelete: Boolean;
                        canEdit: Boolean;
                        isObjectValid: Boolean;
                        objectId: string;
                        objectType: string;

                        commit(): void {
                            console.warn('shimmed function MeetingResponse.commit');
                        }

                        deleteObject(): void {
                            console.warn('shimmed function MeetingResponse.deleteObject');
                        }

                        getKeepAlive(): ITransientObjectHolder {
                            throw new Error('shimmed function MeetingResponse.getKeepAlive');
                        }

                        addEventListener(name: string, handler: Function) {
                            console.warn(`MeetingResponse::addEventListener: ${name}`);
                            switch (name) {
                                case "changed": // ObjectChangedHandler
                                case "deleted": // ObjectChangedHandler
                                    break;
                            }

                        }
                    }
                    export enum Response {
                        accepted = 1,
                        tentative,
                        declined,
                    }
                }
            }
            export enum MriType {
                invalid,
                passport,
                federated,
                telephone = 4,
                skype = 8,
                circle,
                tempGroup,
                networkMember = 13,
                network,
                jaguire = 16,
                yahoo = 32,
            }
            export enum NetworkConnectionStatus {
                disconnected,
                connecting,
                connected,
            }
            export enum NetworkInfoPSAState {
                notSet,
                accept,
                reject,
                maybe,
                error,
            }
            export enum NetworkOffers {
                none,
                contactAgg,
                contactImport,
                contactInvite = 4,
                recentActivityPublish = 8,
                dashboardAgg = 16,
                activityPublish = 32,
                statusPublish = 64,
                clientPublish = 128,
                statusIngestion = 256,
                extensibleEmail = 512,
                clientSubscribe = 1024,
                commentPublish = 2048,
                supportIM = 4096,
                clientMail = 8192,
                clientCalendar = 16384,
                clientContactSync = 32768,
                mediaAgg = 65536,
                socialNotifications = 131072,
                offlineIM = 262144,
                clientMailImap = 8388608,
                allKnown = 262143,
                defaultAccountOffers = 61440,
            }
            export class OAuthGetAccessTokenOperation implements IAsyncOperation<string> {
                completed: /* Windows.Foundation.AsyncOperationCompletedHandler`1[[System.String, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any;
                errorCode: number;
                id: number;
                status: AsyncStatus;

                getResults(): string {
                    throw new Error('shimmed function OAuthGetAccessTokenOperation.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function OAuthGetAccessTokenOperation.cancel');
                }

                close(): void {
                    console.warn('shimmed function OAuthGetAccessTokenOperation.close');
                }

            }
            export type ObjectChangedHandler = (values: /* System.String[] */ any) => void;
            export class OnlineIdConnectedStateChangeTask {
                run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                    console.warn('shimmed function OnlineIdConnectedStateChangeTask.run');
                }

            }
            export enum OnlineStatusFilter {
                all,
                notOffline,
            }
            export enum OutboxQueue {
                sendMail = 1,
                photoMailSkyDrive,
            }
            export class PeopleManager implements IPeopleManager {
                nameSortOrder: Boolean;

                createContact(): IContact {
                    throw new Error('shimmed function PeopleManager.createContact');
                }

                createContact_1(pAccount: IAccount): IContact {
                    throw new Error('shimmed function PeopleManager.createContact_1');
                }

                loadContact(objectId: string): IContact {
                    throw new Error('shimmed function PeopleManager.loadContact');
                }

                tryLoadContact(objectId: string): IContact {
                    throw new Error('shimmed function PeopleManager.tryLoadContact');
                }

                tryLoadContactByLaunchArguments(hstrLaunchArguments: string): IContact {
                    throw new Error('shimmed function PeopleManager.tryLoadContactByLaunchArguments');
                }

                createTemporaryPerson(pAccount: IAccount, data: TemporaryContactData): IPerson {
                    throw new Error('shimmed function PeopleManager.createTemporaryPerson');
                }

                loadPerson(objectId: string): IPerson {
                    throw new Error('shimmed function PeopleManager.loadPerson');
                }

                tryLoadPerson(objectId: string): IPerson {
                    throw new Error('shimmed function PeopleManager.tryLoadPerson');
                }

                tryLoadPersonByCID(cid: number): IPerson {
                    throw new Error('shimmed function PeopleManager.tryLoadPersonByCID');
                }

                tryLoadPersonBySourceIDAndObjectID(sourceId: string, sourceObjectId: string): IPerson {
                    throw new Error('shimmed function PeopleManager.tryLoadPersonBySourceIDAndObjectID');
                }

                tryLoadPersonByMri(mri: string): IPerson {
                    throw new Error('shimmed function PeopleManager.tryLoadPersonByMri');
                }

                tryLoadPersonByTileId(hstrTileId: string): IPerson {
                    throw new Error('shimmed function PeopleManager.tryLoadPersonByTileId');
                }

                loadRecipientByEmail(email: string, name: string): IRecipient {
                    throw new Error('shimmed function PeopleManager.loadRecipientByEmail');
                }

                promoteImplicitContact(pAccount: IAccount, implicitContactObjectId: string): void {
                    console.warn('shimmed function PeopleManager.promoteImplicitContact');
                }

                getFavoritePeople(): ICollection {
                    throw new Error('shimmed function PeopleManager.getFavoritePeople');
                }

                getFavoritePeopleByCustomOrder(): ICollection {
                    throw new Error('shimmed function PeopleManager.getFavoritePeopleByCustomOrder');
                }

                getRelevantPeople(): ICollection {
                    throw new Error('shimmed function PeopleManager.getRelevantPeople');
                }

                getPeopleNameBetween(onlineFilter: OnlineStatusFilter, hstrLowerBound: string, isLowerBoundInclusive: Boolean, hstrUpperBound: string, isUpperBoundInclusive: Boolean): ICollection {
                    throw new Error('shimmed function PeopleManager.getPeopleNameBetween');
                }

                getPeopleNameOrEmailStartWith(hstrSearch: string): ICollection {
                    throw new Error('shimmed function PeopleManager.getPeopleNameOrEmailStartWith');
                }

                getPeopleByPickerQuery(filter: PeoplePickerFilter, favoritesFilter: FavoritesFilter, onlineFilter: OnlineStatusFilter, hstrLowerBound: string, isLowerBoundInclusive: Boolean, hstrUpperBound: string, isUpperBoundInclusive: Boolean): ICollection {
                    throw new Error('shimmed function PeopleManager.getPeopleByPickerQuery');
                }

                getPeopleNameOrEmailStartWithEx(hstrSearch: string): ICollection {
                    throw new Error('shimmed function PeopleManager.getPeopleNameOrEmailStartWithEx');
                }

                getPeopleByHasLocalUserTile(fHasLocalUserTile: Boolean, fOnlyFavorites: Boolean): ICollection {
                    throw new Error('shimmed function PeopleManager.getPeopleByHasLocalUserTile');
                }

                search(searchType: PeopleSearchType, hstrSearchFilter: string, hstrSearchLocale: string, uiPageSize: number): ICollection {
                    throw new Error('shimmed function PeopleManager.search');
                }

                searchServer(hstrSearch: string, cInitialResultCount: number, pAccount: IAccount, uCachePeriod: number): ICollection {
                    throw new Error('shimmed function PeopleManager.searchServer');
                }

                searchServerBackground(hstrSearch: string, cInitialResultCount: number, pAccount: IAccount, uCachePeriod: number): ICollection {
                    throw new Error('shimmed function PeopleManager.searchServerBackground');
                }

                recordRelevanceAction(pAssociatedEntities: IRelevanceEntity[], action: RelevanceAction, pContextualAccount: IAccount, timestamp: Date): void {
                    console.warn('shimmed function PeopleManager.recordRelevanceAction');
                }

                getSuggestions(pAssociatedEntities: IRelevanceEntity[], scenario: RelevanceScenario, pContextualAccount: IAccount, count: number): IRelevanceEntity[] {
                    throw new Error('shimmed function PeopleManager.getSuggestions');
                }

                addressWellSearchAsync(hstrSearchFilter: string, hstrSearchLocale: string, scenario: RelevanceScenario, pContextualAccount: IAccount, count: number, pExcludeRecipients: IRecipient[]): IAsyncOperation<IRecipient[]> {
                    throw new Error('shimmed function PeopleManager.addressWellSearchAsync');
                }

            }
            export enum PeoplePickerFilter {
                none,
                hasPhone,
                hasEmail,
                hasLocation = 4,
                canChat = 8,
            }
            export enum PeopleSearchType {
                invalid,
                addressWell,
                chatAddressWell,
                searchCharm,
                peoplePicker,
            }
            export class Person implements IPerson, IObject, IBaseContact {
                calculatedYomiDisplayName: string;
                canClearPersonTile: Boolean;
                canEmail: Boolean;
                isFavorite: Boolean;
                isInAddressBook: Boolean;
                linkedContacts: ICollection;
                mostRelevantEmail: string;
                mostRelevantPhone: string;
                sortNameLastFirst: string;
                suggestedPeople: ICollection;
                tileId: string;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                nickname: string;
                middleName: string;
                lastName: string;
                firstName: string;
                calculatedUIName: string;
                isGal: Boolean;
                onlineStatus: ContactStatus;

                createLink(pPerson: IPerson): void {
                    console.warn('shimmed function Person.createLink');
                }

                manageLinks(personObjectIdsToLink: string[], contactObjectIdsToUnlink: string[]): void {
                    console.warn('shimmed function Person.manageLinks');
                }

                commitAndLink(pUncommittedContact: IContact): void {
                    console.warn('shimmed function Person.commitAndLink');
                }

                insertFavorite(position: FavoriteInsertPosition, pFavoriteMember: IPerson): void {
                    console.warn('shimmed function Person.insertFavorite');
                }

                removeFavorite(): void {
                    console.warn('shimmed function Person.removeFavorite');
                }

                createRecipient(email: string): IRecipient {
                    throw new Error('shimmed function Person.createRecipient');
                }

                augmentViaServerAsync(fBackground: Boolean): IAsyncAction {
                    throw new Error('shimmed function Person.augmentViaServerAsync');
                }

                getWindowsContact(): /* Windows.ApplicationModel.Contacts.Contact */ any {
                    throw new Error('shimmed function Person.getWindowsContact');
                }

                setPersonTile(pExtraLargeTile: /* Windows.Storage.Streams.IRandomAccessStream */ any): void {
                    console.warn('shimmed function Person.setPersonTile');
                }

                clearPersonTile(): void {
                    console.warn('shimmed function Person.clearPersonTile');
                }

                setStartScreenTileId(hstrTileId: string, hstrLaunchArguments: string): void {
                    console.warn('shimmed function Person.setStartScreenTileId');
                }

                commit(): void {
                    console.warn('shimmed function Person.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function Person.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function Person.getKeepAlive');
                }

                getUserTile(size: UserTileSize, cachedOnly: Boolean): IUserTile {
                    throw new Error('shimmed function Person.getUserTile');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Person::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum PhotoMailFlags {
                isSkyDriveAttachments = 1,
                allowRecipientsToEdit,
                imageResizeOption = 12,
                hasDocument = 16,
                hasPhoto = 32,
                hasVideo = 64,
            }
            export class PluginVerb implements IPluginVerb {
                context: any;
                id: string;
                name: string;
                parameters: string;
                task: any;

            }
            export enum PMFileType {
                unknown = 1,
                photo,
                video,
                other,
                url,
            }
            export enum PolicyComplianceResults {
                compliant,
                userNotAnAdmin,
                userCanceledPolicyDialog,
                userHasBlankPassword = 4,
                adminsHaveBlankPasswords = 8,
                usersCannotChangePassword = 16,
                connectedAdminProviderIsWeak = 32,
                connectedUserProviderIsWeak = 64,
                connectedAdminPasswordIsWeak = 128,
                connectedUserPasswordIsWeak = 256,
                notProtectedBitLocker = 512,
                notProtected3rdParty = 1024,
                protectionSuspendedBitLocker = 2048,
                protectionSuspended3rdParty = 4096,
                lockNotConfiguredBitLocker = 8192,
                lockNotConfigured3rdParty = 16384,
                osVolumeNotProtectedBitLocker = 32768,
                osVolumeNotProtected3rdParty = 65536,
                protectionNotYetEnabledBitLocker = 131072,
                protectionNotYetEnabled3rdParty = 262144,
                noFeatureLicenseBitLocker = 524288,
                noFeatureLicense3rdParty = 1048576,
                unExpectedFailure = 2097152,
                otherNotSupported = 4194304,
            }
            export namespace Private { 
                export enum AccountConstants {
                    maximumConcurrentPushConnections = 4,
                }
                export enum AccountState {
                    adding,
                    deletingLocal,
                    deleting,
                    normal,
                }
                export enum AutoPinState {
                    unknown,
                    needed,
                    pinned,
                }
                export class ClientManagerProvider implements IClientManagerProvider {
                }
                export enum DeprecatedSignatureType {
                    defaultLocalized,
                    userDefined,
                }
                export enum DownloadWorkItemAction {
                    enqueue = 1,
                    cancel,
                }
                export enum EasiState {
                    unknown,
                    easi,
                    mailSupported,
                }
                export class FolderChange implements IFolderChange {
                    accountStoreId: number;
                    folderChangeType: FolderChangeType;
                    folderName: string;
                    oldFolderName: string;
                    oldParentStoreId: number;
                    parentServerId: string;
                    parentStoreId: number;
                    realStoreId: number;
                    serverId: string;
                    stashStoreId: number;

                    completeSuccessfulChange(hstrNewServerId: string, hstrNewSyncKey: string): void {
                        console.warn('shimmed function FolderChange.completeSuccessfulChange');
                    }

                    rollbackChange(fEnforceFolderListConstraints: Boolean): void {
                        console.warn('shimmed function FolderChange.rollbackChange');
                    }

                }
                export enum FolderChangeType {
                    invalid,
                    insert,
                    delete,
                    move = 4,
                    rename = 8,
                    moveAndRename = 12,
                }
                export enum FolderDeleteState {
                    notDeleted,
                    deletedLocally,
                    ancestorDeletedLocally,
                }
                export enum FolderPriority {
                    critical,
                    important,
                    other,
                }
                export interface IClientManagerProvider {
                }
                export interface IEasAccountSettingsPrivate extends IAccountServerConnectionSettings {
                    allEmailAddresses: string;
                    allowSimpleDevicePassword: Boolean;
                    alphaNumericDevicePasswordRequired: Boolean;
                    backoffCount: number;
                    backoffTime: Date;
                    baseServerAddress: string;
                    cachedDeviceInfo: string;
                    commandsSupported: string;
                    deviceId: string;
                    devicePasswordEnabled: Boolean;
                    devicePasswordExpiration: number;
                    devicePasswordHistory: number;
                    emailAddress: string;
                    enableCompactURI: Boolean;
                    folderResetNeeded: Boolean;
                    folderSyncKey: string;
                    hydraServer: string;
                    isClientProvisioned: Boolean;
                    isWlasSupported: Boolean;
                    lastHydraRegistrationTimeStamp: Date;
                    lastServerSuccess: string;
                    lastSyncResult: number;
                    lastSyncSuccessTime: Date;
                    maxDevicePasswordFailedAttempts: number;
                    maxInactivityTimeDeviceLock: number;
                    minDevicePasswordComplexCharacters: number;
                    minDevicePasswordLength: number;
                    passwordCookie: string;
                    policyKey: string;
                    policyState: number;
                    requireDeviceEncryption: Boolean;
                    resetReason: number;
                    resourcesSynchronized: number;
                    rightsManagementTemplates: ICollection;
                    rightsManagementTemplatesSortedById: ICollection;
                    version: string;
                    oofBodyForInternalPrivate: string;
                    oofBodyForKnownExternalPrivate: string;
                    oofBodyForUnknownExternalPrivate: string;
                    oofEnabledForInternalPrivate: Boolean;
                    oofEnabledForKnownExternalPrivate: Boolean;
                    oofEnabledForUnknownExternalPrivate: Boolean;
                    oofEndTimePrivate: Date;
                    oofLastModifiedTime: Date;
                    oofLastSyncResult: number;
                    oofLastSyncTime: Date;
                    oofStartTimePrivate: Date;
                    oofStatePrivate: Boolean;
                    policyApplyAttempted: Boolean;
                    policyComplianceResults: PolicyComplianceResults;
                    createNewRightsManagementTemplate(): IRightsManagementTemplate;
                    setIsMailSupported(value: Boolean): void;
                    setIsWlasSupported(value: Boolean): void;
                    getClientSecurityPolicy(): /* Windows.Security.ExchangeActiveSyncProvisioning.EasClientSecurityPolicy */ any;
                }
                export interface IFolderChange {
                    accountStoreId: number;
                    folderChangeType: FolderChangeType;
                    folderName: string;
                    oldFolderName: string;
                    oldParentStoreId: number;
                    parentServerId: string;
                    parentStoreId: number;
                    realStoreId: number;
                    serverId: string;
                    stashStoreId: number;
                    completeSuccessfulChange(hstrNewServerId: string, hstrNewSyncKey: string): void;
                    rollbackChange(fEnforceFolderListConstraints: Boolean): void;
                }
                export interface IFolderManagerPrivate extends IFolderManager {
                    getFolder(hstrAccountId: string, hstrServerFolderId: string): IFolderPrivate;
                    getRootFolderCollection(hstrAccountId: string): ICollection;
                    getRootFolderCollection_1(hstrAccountId: string, eType: FolderType): ICollection;
                    getAllFoldersCollection_ByAccount(hstrAccountId: string, eType: FolderType): ICollection;
                    getAllFoldersCollection_ByAccount_IncludingPendingDeletes(hstrAccountId: string, eType: FolderType): ICollection;
                    getSpecialMailFolder(hstrAccountId: string, eType: MailFolderType): string;
                    getSpecialContactFolder(hstrAccountId: string, eType: ContactFolderType): string;
                    getSpecialCalendarFolder(hstrAccountId: string, eType: CalendarFolderType): string;
                    getAllSpecialMailFolders(eType: MailFolderType): ICollection;
                    getFolderCollectionByPriority(pAccount: IAccount, toPriority: FolderPriority): ICollection;
                    getFolderCollectionForIsSyncNeeded(pAccount: IAccount): ICollection;
                    createFolder(hstrAccountId: string): IFolderPrivate;
                    loadFolder(hstrId: string): IFolderPrivate;
                    deleteAllSyncingFolders(hstrAccountId: string): void;
                    swapDefaultCalendarFolder(hstrAccountId: string, hstrNewDefaultCalendarId: string): void;
                    swapMailSpecialFolder(hstrAccountId: string, eType: MailFolderType, hstrNewSpecialFolderId: string): Boolean;
                    getViewTypeForFolderType(eFolderType: MailFolderType): MailViewType;
                    enforceFolderListConstraints(hstrAccountId: string): void;
                    getNextFolderChange(hstrAccountId: string): IFolderChange;
                    hasPendingFolderChanges(hstrAccountId: string): Boolean;
                    updateFolderServerIdPaths(hstrAccountId: string, hstrOldFolderPath: string, hstrNewFolderPath: string): void;
                    getDescendantFoldersCollection(hstrAccountId: string, hstrFolderPath: string): ICollection;
                }
                export interface IFolderPrivate extends IFolder, IObject {
                    accountName: string;
                    color: number;
                    folderPriority: FolderPriority;
                    hasProcessedConversations: Boolean;
                    hasSynced: Boolean;
                    hidden: Boolean;
                    inferiorsDisabled: Boolean;
                    internalFolderType: string;
                    isLocalMailFolder: Boolean;
                    isPurgeNeeded: Boolean;
                    lastOptions: string;
                    lastPassId: number;
                    parentFolderId: number;
                    parentFolderPrivate: IFolderPrivate;
                    permission: string;
                    pinned: Boolean;
                    purgeNow: Boolean;
                    selectionDisabled: Boolean;
                    serverFolderId: string;
                    sourceId: string;
                    syncFolderContents: Boolean;
                    syncKey: string;
                    syncStatus: number;
                    uidValidity: number;
                    underDeletedItems: Boolean;
                    viewed: Boolean;
                    getChildFolderCollection(fAllTypes: Boolean): ICollection;
                    setNewParentFolderPath(value: string): void;
                    commitNoStash(): void;
                    deleteObjectNoStash(): void;
                    commitFromServer(): void;
                    deleteObjectFromServer(): void;
                    deleteAllDescendants(): void;
                    deleteObjectFromPurge(): void;
                }
                export interface IImapAccountSettingsPrivate {
                    deletedItemsFolderXlist: Boolean;
                    draftsFolderXlist: Boolean;
                    hierarchyCharacter: string;
                    junkFolderXlist: Boolean;
                    lastSyncSuccessTime: Date;
                    passwordCookie: string;
                    resourcesSynchronized: number;
                    sentItemsFolderXlist: Boolean;
                    serverCapabilities: number;
                }
                export interface IMailAttachmentPrivate extends IMailAttachment, IObject {
                    fileReference: string;
                    size: number;
                    syncStatus: AttachmentSyncStatus;
                    uploadWorkerId: string;
                    updateBody(pBodyStream: /* Windows.Storage.Streams.IRandomAccessStream */ any): void;
                    updateBodyFromMime(pBodyStream: /* Windows.Storage.Streams.IRandomAccessStream */ any): void;
                    setFileNameFrom2047Header(hstr2047EncodedFileName: string): void;
                }
                export interface IMailChangeItem extends IObject {
                    command: MailChangeCommand;
                    targetObjectId: string;
                    targetStoreId: number;
                }
                export interface IMailChangeManagerPrivate extends IMailManager {
                    getAllMailChangeItems(): ICollection;
                }
                export interface IMailConversationAggregator {
                    aggregateReadState(pConversation: IMailConversationPrivate): Boolean;
                    aggregateDisplayTime(pConversation: IMailConversationPrivate): Date;
                    aggregateFromRecipient(pConversation: IMailConversationPrivate): IRecipient;
                    aggregateAll(pConversation: IMailConversationPrivate): { pRead: Boolean, pDate: Date, pFromRecipient: IRecipient };
                    shouldForwardFlattenedSenderNotifications(): Boolean;
                    hasFromRecipientChanged(pCurrentRecipient: IRecipient, pCachedRecipient: IRecipient): Boolean;
                }
                export interface IMailConversationManagerPrivate {
                    getConversationIdForNewMessage(pMessagePriv: IMailMessagePrivate, dtMigration: Date): string;
                    getAllConversationInAccount(hstrAccountId: string): ICollection;
                    getAllConversations(): ICollection;
                    loadConversation(hstrObjectId: string): IMailConversationPrivate;
                }
                export interface IMailConversationPrivate {
                    flagged: Boolean;
                    hasCalendarInvite: Boolean;
                    hasCalendarRequest: Boolean;
                    hasOrdinaryAttachments: Boolean;
                    importance: MailMessageImportance;
                    irmHasTemplate: Boolean;
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
                export interface IMailDownloadWorkItem extends IObject {
                    accountRowId: number;
                    action: DownloadWorkItemAction;
                    objectStoreId: number;
                }
                export interface IMailManagerPrivate extends IMailManager {
                    getAllMessages(): ICollection;
                    getConversationManager(): IMailConversationManagerPrivate;
                    getMessageCollection(hstrAccountId: string, hstrFolderId: string): ICollection;
                    loadViewByObjectId(hstrViewId: string): IMailView;
                    loadMessageByServerId(hstrFolderId: string, hstrServerMessageId: string): IMailMessagePrivate;
                    loadMessage(hstrMessageId: string): IMailMessagePrivate;
                    loadMessageByServerUid(hstrFolderId: string, serverUid: number): IMailMessagePrivate;
                    loadMessageByUniqueId(hstrUniqueId: string): IMailMessagePrivate;
                    createMessage(hstrAccountId: string): IMailMessagePrivate;
                    createServerSearchResult(uiSearchId: number, uiLocalMessageId: number, serverType: SearchMailServerType, hstrAccountId: string, hstrFolderId: string): IMailMessagePrivate;
                    updateMessageFromMime(ppMessage: IMailMessagePrivate, pStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, fTruncated: Boolean): void;
                    createMessageFromMime(pFolder: IFolderPrivate, pStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, fTruncated: Boolean, fAllowCommit: Boolean): IMailMessagePrivate;
                    getOutboxCollection(hstrAccountId: string, eQueue: OutboxQueue): ICollection;
                    deleteAllMessages(hstrAccountId: string, hstrFolderId: string): void;
                    getNeedBackfillMessages(sidAccount: number, fInboxOnly: Boolean): ICollection;
                    getAllInboxMessages(fUnseenOnly: Boolean): ICollection;
                    getAllPinnedPersonMessages(fUnseenOnly: Boolean): ICollection;
                    getPinnedPersonMessagesForAccount(fUnseenOnly: Boolean, hstrAccountId: string): ICollection;
                    markAllUnseenInboxMessagesAsToasted(): void;
                    markCollectionAsToasted(pCollection: ICollection): void;
                    getMailVisibilityObject(): IMailVisibility;
                    getUntoastedInboxMessagesForAccount(hstrAccountId: string): ICollection;
                    getUntoastedFavoriteMessagesForAccount(hstrAccountId: string): ICollection;
                    getPinnedViews(): ICollection;
                    getChangedMessagesByAccount(hstrAccountId: string): ICollection;
                    getChangedMessagesByFolder(hstrFolderId: string): ICollection;
                    loadStashMessage(pMessage: IObject): IMailMessagePrivateStash;
                    loadStashMessageByObjectId(hstrMessageId: string): IMailMessagePrivateStash;
                    revertStashChanges(hstrMessageId: string): void;
                    applyAllStashChanges(hstrMessageId: string): void;
                    applySomeStashChanges(hstrMessageId: string, fFlagged: Boolean, fRead: Boolean, fHasNewsletterCategory: Boolean, fHasSocialUpdateCategory: Boolean, verb: MailMessageLastVerb): void;
                    undoStashCopy(hstrMessageId: string): void;
                    hasPendingChangesFromSourceFolder(hstrFolderId: string): Boolean;
                    rollbackPendingMovesToDestinationFolder(hstrAccountId: string, hstrFolderId: string): void;
                    getMailWorkItemsCollection(uAccountRowId: number): ICollection;
                    getObjectFromStoreId(uStoreId: number): IObject;
                    getWorkItemFromRowId(uDownloadWorkItemRowId: number): IMailDownloadWorkItem;
                    cleanupWorkItems(uAccountRowId: number): void;
                    failInProgressBodyDownloads(uAccountRowId: number): void;
                    getInProgressBodyDownloadsForFolder(hstrFolderId: string): ICollection;
                    getFullBodyDownloadsNeededForFolder(uAccountRowId: number, pFolder: IFolder): ICollection;
                    getAttachmentDownloadsNeededforFolder(uAccountRowId: number, pFolder: IFolder, fEmbeddedAttachments: Boolean, fOrdinaryAttachments: Boolean): ICollection;
                    findMeetingRequests(hstrEventUID: string, hstrAccountId: string): ICollection;
                    parseEmailString(hstrRFC2822EmailString: string): { name: string, email: string };
                    pauseMailNotifications(): void;
                    resumeMailNotifications(): void;
                }
                export interface IMailMessagePrivate extends IMailMessage, IObject {
                    accountId: string;
                    allViewIds: string[];
                    bodyDownloadStatus: BodyDownloadStatus;
                    calendarMessageType: CalendarMessageType;
                    conversationOpaqueId: string;
                    conversationRowId: number;
                    displayed: Date;
                    draftOriginalFolderId: string;
                    eventHandle: string;
                    eventUID: string;
                    flattenedImapUids: string;
                    flattenedSyncFolderIds: string;
                    from: string;
                    fromEmail: string;
                    fromName: string;
                    fromPersonStoreId: number;
                    gmailImapUniqueMessageId: string;
                    hasNewsletterCategory: Boolean;
                    hasOrdinaryAttachments: Boolean;
                    hasSocialUpdateCategory: Boolean;
                    hasToasted: Boolean;
                    htmlMimeSection: string;
                    isDeleted: Boolean;
                    isFromPersonPinned: Boolean;
                    isHiddenFromConversation: Boolean;
                    isLocalMessage: Boolean;
                    keepInView: string;
                    lastVerb: MailMessageLastVerb;
                    mimeMessageId: string;
                    mimeReferences: string;
                    mimeSourceMessageId: string;
                    needBody: Boolean;
                    normalizedSubjectHash: string;
                    notFoundCount: number;
                    numSendRetries: number;
                    originalFolder: IFolderPrivate;
                    originalFolderId: string;
                    photoMailAlbumId: string;
                    photoMailAlbumUrl: string;
                    photoMailAlbumWorkerId: string;
                    plainTextMimeSection: string;
                    preview: string;
                    propertiesVersion: number;
                    received: Date;
                    replyTo: string;
                    searchRequestId: number;
                    searchSessionId: number;
                    searchViewId: number;
                    sender: string;
                    sent: Date;
                    serverConversationId: string;
                    serverConversationIndex: string;
                    serverLongId: string;
                    serverMessageId: string;
                    serverUID: number;
                    sourceFolderServerId: string;
                    sourceHasEmbeddedAttachments: Boolean;
                    sourceInstanceId: Date;
                    sourceItemServerId: string;
                    sourceLongId: string;
                    sourceMessageStoreId: string;
                    sourceReplaceMime: Boolean;
                    sourceVerb: MailMessageLastVerb;
                    syncFolderIds: string[];
                    syncStatus: number;
                    systemCategories: string;
                    insertSyncFolderId(value: string): void;
                    removeSyncFolderId(value: string): void;
                    setSyncFolderAndUid(hstrFolderId: string, uiUid: number): void;
                    ensureSyncFolderValidity(): void;
                    getUidInFolder(hstrFolderId: string): number;
                    recordRelevanceAction(): void;
                    determineIfFolderInView(): Boolean;
                    determineIfHiddenFromConversation(): Boolean;
                    removeAllTruncatableBodies(): void;
                    createBody(): IMailBody;
                    createMessageBodiesFromMime(hstrMime: string, fTruncated: Boolean): void;
                    createMessageBodyFromMime(eBodyType: MailBodyType, pStream: /* Windows.Storage.Streams.IRandomAccessStream */ any, fTruncated: Boolean): void;
                    commitMessageNoStash(): void;
                    deleteMessageNoStash(): void;
                    hasAttachment(hstrFileReference: string): Boolean;
                    markAsPermanentSendFailure(value: number): void;
                    ensureFolderUid(strFolderId: string, dwUid: number, fAddFolder: Boolean): Boolean;
                }
                export interface IMailMessagePrivateStash extends IMailMessagePrivate, IMailMessage, IObject {
                    changeType: StashChangeType;
                    realObjectId: string;
                    stashCopy: IMailMessagePrivateStash;
                }
                export interface IMailVisibility extends IObject {
                    mailVisible: Boolean;
                }
                export interface IPluginStateReporter extends IAccountResource, IObject {
                    setErrorState(errorResult: number): void;
                    setResourceState(newState: ResourceState): void;
                    onSyncStarted(): void;
                    onSyncCompleted(syncResult: number): void;
                }
                export interface IRightsManagementLicensePrivate extends IRightsManagementLicense, IObject {
                    irmAllowProgramaticAccess: Boolean;
                    irmCanEdit: Boolean;
                    irmCanExtractContent: Boolean;
                    irmCanForward: Boolean;
                    irmCanModifyRecipients: Boolean;
                    irmCanPrint: Boolean;
                    irmCanRemoveRightsManagement: Boolean;
                    irmCanReply: Boolean;
                    irmCanReplyAll: Boolean;
                    irmExpiryDate: Date;
                    irmHasTemplate: Boolean;
                    irmIsContentOwner: Boolean;
                    irmTemplateDescription: string;
                    irmTemplateId: string;
                    irmTemplateName: string;
                    removeRightsManagementTemplate(): void;
                    setRightsManagementTemplate(pRightsManagementTemplate: IRightsManagementTemplate): void;
                }
                export interface ISmtpAccountSettingsPrivate {
                    passwordCookie: string;
                }
                export enum MailChangeCommand {
                    invalid,
                    processMailMigration,
                    updateConversation,
                    updateAllConversations,
                    updateAllConversationsOnly,
                    updateOnMessageAdd,
                    updateOnMessageMove,
                    updateOnMessageChange,
                    markFolderConversationsAsProcessed,
                    moveConversation,
                    markConversationFlagged,
                    markConversationUnflagged,
                    markConversationRead,
                    markConversationUnread,
                    changeViewPinnedStatus,
                    clearUnseenMessages,
                    updateIncludeSentItemsInThread,
                    updateLinkTable,
                    updateLinkTableForSystemCategory,
                    updateFolderSpecialType,
                    updateSearchMail,
                    max = 20,
                }
                export enum MailChangeCommandPriority {
                    priorityHigh,
                    priorityNormal = 100,
                    priorityLow = 200,
                }
                export class MailChangeItem implements IObject {
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;

                    commit(): void {
                        console.warn('shimmed function MailChangeItem.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function MailChangeItem.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function MailChangeItem.getKeepAlive');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`MailChangeItem::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export class MailConversationAllPinnedPeopleAggregator implements IMailConversationAggregator {
                    aggregateReadState(pConversation: IMailConversationPrivate): Boolean {
                        throw new Error('shimmed function MailConversationAllPinnedPeopleAggregator.aggregateReadState');
                    }

                    aggregateDisplayTime(pConversation: IMailConversationPrivate): Date {
                        throw new Error('shimmed function MailConversationAllPinnedPeopleAggregator.aggregateDisplayTime');
                    }

                    aggregateFromRecipient(pConversation: IMailConversationPrivate): IRecipient {
                        throw new Error('shimmed function MailConversationAllPinnedPeopleAggregator.aggregateFromRecipient');
                    }

                    aggregateAll(pConversation: IMailConversationPrivate): { pRead: Boolean, pDate: Date, pFromRecipient: IRecipient } {
                        throw new Error('shimmed function MailConversationAllPinnedPeopleAggregator.aggregateAll');
                    }

                    shouldForwardFlattenedSenderNotifications(): Boolean {
                        throw new Error('shimmed function MailConversationAllPinnedPeopleAggregator.shouldForwardFlattenedSenderNotifications');
                    }

                    hasFromRecipientChanged(pCurrentRecipient: IRecipient, pCachedRecipient: IRecipient): Boolean {
                        throw new Error('shimmed function MailConversationAllPinnedPeopleAggregator.hasFromRecipientChanged');
                    }

                }
                export class MailConversationAllVisibleAggregator implements IMailConversationAggregator {
                    aggregateReadState(pConversation: IMailConversationPrivate): Boolean {
                        throw new Error('shimmed function MailConversationAllVisibleAggregator.aggregateReadState');
                    }

                    aggregateDisplayTime(pConversation: IMailConversationPrivate): Date {
                        throw new Error('shimmed function MailConversationAllVisibleAggregator.aggregateDisplayTime');
                    }

                    aggregateFromRecipient(pConversation: IMailConversationPrivate): IRecipient {
                        throw new Error('shimmed function MailConversationAllVisibleAggregator.aggregateFromRecipient');
                    }

                    aggregateAll(pConversation: IMailConversationPrivate): { pRead: Boolean, pDate: Date, pFromRecipient: IRecipient } {
                        throw new Error('shimmed function MailConversationAllVisibleAggregator.aggregateAll');
                    }

                    shouldForwardFlattenedSenderNotifications(): Boolean {
                        throw new Error('shimmed function MailConversationAllVisibleAggregator.shouldForwardFlattenedSenderNotifications');
                    }

                    hasFromRecipientChanged(pCurrentRecipient: IRecipient, pCachedRecipient: IRecipient): Boolean {
                        throw new Error('shimmed function MailConversationAllVisibleAggregator.hasFromRecipientChanged');
                    }

                }
                export class MailConversationManagerPrivate implements IMailConversationManagerPrivate {
                    getConversationIdForNewMessage(pMessagePriv: IMailMessagePrivate, dtMigration: Date): string {
                        throw new Error('shimmed function MailConversationManagerPrivate.getConversationIdForNewMessage');
                    }

                    getAllConversationInAccount(hstrAccountId: string): ICollection {
                        throw new Error('shimmed function MailConversationManagerPrivate.getAllConversationInAccount');
                    }

                    getAllConversations(): ICollection {
                        throw new Error('shimmed function MailConversationManagerPrivate.getAllConversations');
                    }

                    loadConversation(hstrObjectId: string): IMailConversationPrivate {
                        throw new Error('shimmed function MailConversationManagerPrivate.loadConversation');
                    }

                }
                export class MailConversationPersonAggregator implements IMailConversationAggregator {
                    aggregateReadState(pConversation: IMailConversationPrivate): Boolean {
                        throw new Error('shimmed function MailConversationPersonAggregator.aggregateReadState');
                    }

                    aggregateDisplayTime(pConversation: IMailConversationPrivate): Date {
                        throw new Error('shimmed function MailConversationPersonAggregator.aggregateDisplayTime');
                    }

                    aggregateFromRecipient(pConversation: IMailConversationPrivate): IRecipient {
                        throw new Error('shimmed function MailConversationPersonAggregator.aggregateFromRecipient');
                    }

                    aggregateAll(pConversation: IMailConversationPrivate): { pRead: Boolean, pDate: Date, pFromRecipient: IRecipient } {
                        throw new Error('shimmed function MailConversationPersonAggregator.aggregateAll');
                    }

                    shouldForwardFlattenedSenderNotifications(): Boolean {
                        throw new Error('shimmed function MailConversationPersonAggregator.shouldForwardFlattenedSenderNotifications');
                    }

                    hasFromRecipientChanged(pCurrentRecipient: IRecipient, pCachedRecipient: IRecipient): Boolean {
                        throw new Error('shimmed function MailConversationPersonAggregator.hasFromRecipientChanged');
                    }

                }
                export class MailMessagePrivateStash implements IObject {
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;

                    commit(): void {
                        console.warn('shimmed function MailMessagePrivateStash.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function MailMessagePrivateStash.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function MailMessagePrivateStash.getKeepAlive');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`MailMessagePrivateStash::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export class MailVisibility implements IObject {
                    canDelete: Boolean;
                    canEdit: Boolean;
                    isObjectValid: Boolean;
                    objectId: string;
                    objectType: string;

                    commit(): void {
                        console.warn('shimmed function MailVisibility.commit');
                    }

                    deleteObject(): void {
                        console.warn('shimmed function MailVisibility.deleteObject');
                    }

                    getKeepAlive(): ITransientObjectHolder {
                        throw new Error('shimmed function MailVisibility.getKeepAlive');
                    }

                    addEventListener(name: string, handler: Function) {
                        console.warn(`MailVisibility::addEventListener: ${name}`);
                        switch (name) {
                            case "changed": // ObjectChangedHandler
                            case "deleted": // ObjectChangedHandler
                                break;
                        }

                    }
                }
                export enum SearchMailServerType {
                    none,
                    eas,
                    imap,
                }
                export enum ServerSearchType {
                    invalid,
                    people,
                    mail,
                    recipient,
                    localMail,
                    peopleBackground,
                }
                export enum StashChangeType {
                    invalid,
                    insert,
                    update,
                    delete,
                    copy,
                }
            }
            export class Recipient implements IRecipient, IDisposable, IRelevanceEntity {
                relevanceEntityId: string;
                relevanceEntityType: RelevanceEntityType;
                calculatedUIName: string;
                emailAddress: string;
                fastName: string;
                objectType: string;
                person: IPerson;

                dispose(): void {
                    console.warn('shimmed function Recipient.dispose');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Recipient::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // RecipientChangeHandler
                            break;
                    }

                }
            }
            export type RecipientChangeHandler = (values: /* System.String[] */ any) => void;
            export class RecipientVector implements IList<IRecipient>, ICollection<IRecipient>, IEnumerable<IRecipient> {
                size: number;

            }
            export enum RelevanceAction {
                invalid,
                sendMail,
                receiveMail,
            }
            export enum RelevanceEntityType {
                invalid,
                recipient,
            }
            export class RelevanceEntityVectorClass implements IList<IRelevanceEntity>, ICollection<IRelevanceEntity>, IEnumerable<IRelevanceEntity> {
                size: number;

            }
            export enum RelevanceScenario {
                invalid,
                toLine,
                peopleView,
            }
            export enum ResourceState {
                none,
                connecting,
                connected,
                disconnecting,
                error,
            }
            export enum ResourceType {
                calendar,
                contacts,
                mail,
                storage,
                accounts,
                catalogScenarioDocument,
                catalogServicesDocument,
                meContactFolder,
                roamingSettings,
                mailRule,
                clientPublish,
                clientSubscribe,
                contactAgg,
                dashboardAgg,
                socialNotifications,
                statusPublish,
            }
            export interface RestartNeededEventArgs {
                reason: RestartNeededReason;
                result: number;
            }
            export type RestartNeededHandler = (e: RestartNeededEventArgs) => void;
            export enum RestartNeededReason {
                accountDisconnected,
                accountSwitched,
                unrecoverableCrash,
            }
            export enum Result {
                success,
                authNotAttempted = -2066743295,
                serverNotAttempted,
                credentialMissing,
                cannotCreatePopAccounts,
                primaryAccountSwitched,
                userCanceled,
                platformSuspended,
                objectNotCommitted,
                cannotMakeMicrosoftAccountAsPrimaryAccount,
                primaryAccountAlreadyConnected,
                primaryAccountNotPending,
                cannotAddAliasOfMicrosoftAccount,
                invalidAuthenticationTarget = -2138701823,
                accountUpdateRequired = -2138701819,
                accountLocked = -2138701817,
                passwordUpdateRequired = -2138701820,
                forceSignIn = -2138701818,
                parentalConsentRequired = -2138701816,
                emailVerificationRequired,
                actionRequired = -2138701812,
                accountSuspendedCompromise = -2138701814,
                accountSuspendedAbuse,
                authRequestThrottled = -2138701808,
                defaultAccountDoesNotExist = -2147023579,
                passwordDoesNotExist = -2146893042,
                passwordLogonFailure = -2147023570,
                nteDecryptionFailure = -2146893780,
                invalidServerCertificate = -2146697191,
                certExpired = -2146762495,
                certChainValidityBadNesting,
                certBadRole,
                certLengthConstraintViolated,
                certWithUnknowExtMarkedCritical,
                certBadPurpose,
                certNotIssuedByParent,
                certMissingImportantField,
                certBadChain = -2146762486,
                certRevoked = -2146762484,
                certUntrustedTestRoot,
                certUntrustedRoot = -2146762487,
                certRevocationCheckFailed = -2146762482,
                certCNNoMatch,
                certWrongUsage,
                certInvalidPolicy = -2146762477,
                certInvalidName,
                certSelectionNeeded = -2066743040,
                autoDiscoveryNotAttempted,
                autoDiscoveryFailed,
                autoDiscoveryNoChange,
                localFolderChangesLost = -2066742781,
                s_FAIL_CONVERSION_DEVICE = 1,
                e_FAIL_SERVER = -2063589369,
                e_INVALID_XMLRESPONSE = -2063589359,
                e_AIRSYNCLAYER_INVALID_OBJECT,
                e_UNEXPECTED_PROTOCOL_VERSION = -2063589353,
                e_XMLPARSE_WRONG_NODE_TYPE = -2063589351,
                e_XMLPARSE_TAG_UNKNOWN,
                e_XMLPARSE_UNEXPECTED_TAG,
                e_XMLPARSE_BAD_ELEMENT,
                e_AIRSYNC_BAD_FORMAT,
                e_AIRSYNC_BAD_VERSION,
                e_WBXML_NOT_SUPPORTED,
                e_WBXML_BAD_FORMAT,
                e_WBXML_BAD_VERSION,
                e_WBXML_TOO_COMPLEX,
                e_WBXML_BAD_CHARSET,
                e_WBXML_BAD_DOCID,
                e_WBXML_UNKNOWN_TOKEN,
                e_FAIL_BAD_REQUEST_NOSSL = -2063589337,
                e_AIRSYNC_UNSUPPORTED_VERSION,
                e_HTTP_UNKNOWN = -2063532032,
                e_HTTP_BAD_REQUEST,
                e_HTTP_DENIED,
                e_HTTP_PAYMENT_REQ,
                e_HTTP_FORBIDDEN,
                e_HTTP_NOT_FOUND,
                e_HTTP_BAD_METHOD,
                e_HTTP_NONE_ACCEPTABLE,
                e_HTTP_PROXY_AUTH_REQ,
                e_HTTP_REQUEST_TIMEOUT,
                e_HTTP_CONFLICT,
                e_HTTP_GONE,
                e_HTTP_LENGTH_REQUIRED,
                e_HTTP_PRECOND_FAILED,
                e_HTTP_REQUEST_TOO_LARGE,
                e_HTTP_URI_TOO_LONG,
                e_HTTP_UNSUPPORTED_MEDIA,
                e_HTTP_REQ_RANGE_NOT_SAT,
                e_HTTP_EXPECTATION_FAILED,
                e_HTTP_RETRY_WITH,
                e_HTTP_SERVER_ERROR,
                e_HTTP_NOT_SUPPORTED,
                e_HTTP_BAD_GATEWAY,
                e_HTTP_SERVICE_UNAVAIL,
                e_HTTP_GATEWAY_TIMEOUT,
                e_HTTP_VERSION_NOT_SUP,
                e_HTTP_DISK_SPACE,
                e_HTTP_INVALID_PROFILE,
                e_HTTP_EXCHANGE_PERMANENTREDIRECT,
                e_HTTP_UNEXPECTED_CONTENT,
                e_GOOGLE_APPS = -2063532000,
                sync_S_MUSTRESYNC = 263168,
                sync_S_MUSTRESYNCFOLDERS,
                e_NON_MSAS = -2063400926,
                e_SECUREID_NOTSUPPORTED = -2063400923,
                e_SYNC_PUSH_WAITFORPUSHENABLED_TIMEOUT = -2063400848,
                e_SYNC_PUSH_FAILED,
                e_SYNC_PUSH_NEEDS_RESTART,
                e_SYNC_CBA_FAILED,
                e_SYNC_IGNORABLE_SERVER_CERT_FAILURE,
                e_CREDENTIALS_UNAVAILABLE = -2063269886,
                e_AIRSYNC_RESET_RETRY = -2063269875,
                e_AIRSYNC_EMPTY_EMAIL,
                e_AIRSYNC_NO_SERVERID,
                e_NEXUS_SYNC_INVALID = -2046820093,
                s_NEXUS_SYNC_SUCCESS = 100663556,
                e_NEXUS_SYNC_PROTOCOL_VER = -2046820091,
                e_NEXUS_SYNC_SYNCKEY,
                e_NEXUS_SYNC_PROTOCOL,
                e_NEXUS_SYNC_SERVER,
                e_NEXUS_SYNC_CONVERSION,
                e_NEXUS_SYNC_CONFLICT,
                e_NEXUS_SYNC_OBJ_NOT_FOUND,
                e_NEXUS_SYNC_DISK_SPACE,
                e_NEXUS_SYNC_NOTIFY_GUID,
                e_NEXUS_SYNC_NOT_PROVISIONED,
                e_NEXUS_SYNC_FOLDERSYNC,
                e_NEXUS_SYNC_EMPTY_SYNC,
                e_NEXUS_SYNC_WAIT_OUT_OF_BOUNDS,
                e_NEXUS_SYNC_TOO_MANY_FOLDERS,
                e_NEXUS_SYNC_RETRY,
                e_NEXUS_SYNC_MAX,
                e_NEXUS_FOLDER_INVALID = -2046819840,
                s_NEXUS_FOLDER_SUCCESS = 100663809,
                e_NEXUS_FOLDER_ALREADY_EXISTS = -2046819838,
                e_NEXUS_FOLDER_SPECIAL_FOLDER,
                e_NEXUS_FOLDER_NOT_FOUND,
                e_NEXUS_FOLDER_PARENT_NOT_FOUND,
                e_NEXUS_FOLDER_DATA_SERVER,
                e_NEXUS_FOLDER_ACCESS_DENIED,
                e_NEXUS_FOLDER_TIME_OUT,
                e_NEXUS_FOLDER_SYNC_KEY,
                e_NEXUS_FOLDER_PROTOCOL,
                e_NEXUS_FOLDER_SYNC_SERVER,
                e_NEXUS_FOLDER_UNKNOWN,
                e_NEXUS_FOLDER_MAX,
                e_NEXUS_NOTIFY_INVALID = -2046819584,
                s_NEXUS_NOTIFY_SUCCESS = 100664065,
                e_NEXUS_NOTIFY_PROTOCOL = -2046819582,
                e_NEXUS_NOTIFY_FOLDER_BINDINGS,
                e_NEXUS_NOTIFY_DEVICE_FILE_ERROR,
                e_NEXUS_NOTIFY_BAD_PROFILE,
                e_NEXUS_NOTIFY_BINDING,
                e_NEXUS_NOTIFY_NOT_SUPPORTED,
                e_NEXUS_NOTIFY_SERVER,
                e_NEXUS_NOTIFY_DEVICE_FILE_LOCKED,
                e_NEXUS_NOTIFY_NOT_PROVISIONED,
                e_NEXUS_NOTIFY_MAX,
                e_NEXUS_MOVE_INVALID = -2046819328,
                e_NEXUS_MOVE_INVALID_SRC,
                e_NEXUS_MOVE_INVALID_DST,
                s_NEXUS_MOVE_SUCCESS = 100664323,
                e_NEXUS_MOVE_SAME_OBJECT = -2046819324,
                e_NEXUS_MOVE_MOVE_FAILURE,
                e_NEXUS_MOVE_COLLISION,
                e_NEXUS_MOVE_LOCKED,
                e_NEXUS_MOVE_MAX,
                e_NEXUS_ITEMESTIMATE_INVALID = -2046819072,
                s_NEXUS_ITEMESTIMATE_SUCCESS = 100664577,
                e_NEXUS_ITEMESTIMATE_PROTOCOL = -2046819070,
                e_NEXUS_ITEMESTIMATE_FOLDER_BINDINGS,
                e_NEXUS_ITEMESTIMATE_DEVICE_FILE_ERROR,
                e_NEXUS_ITEMESTIMATE_BAD_PROFILE,
                e_NEXUS_ITEMESTIMATE_BINDING,
                e_NEXUS_ITEMESTIMATE_NOT_SUPPORTED,
                e_NEXUS_ITEMESTIMATE_SERVER,
                e_NEXUS_ITEMESTIMATE_DEVICE_FILE_LOCKED,
                e_NEXUS_ITEMESTIMATE_NOT_PROVISIONED,
                e_NEXUS_ITEMESTIMATE_INVALID_COLLECTIONID,
                e_NEXUS_ITEMESTIMATE_INVALID_STATE,
                e_NEXUS_ITEMESTIMATE_INVALID_SYNCKEY,
                e_NEXUS_ITEMESTIMATE_MAX,
                e_NEXUS_MEETINGRESPONSE_INVALID = -2046818816,
                s_NEXUS_MEETINGRESPONSE_SUCCESS = 100664833,
                e_NEXUS_MEETINGRESPONSE_INVALID_MREQ = -2046818814,
                e_NEXUS_MEETINGRESPONSE_DATA_SERVER,
                e_NEXUS_MEETINGRESPONSE_SERVER,
                e_NEXUS_MEETINGRESPONSE_MAX,
                e_NEXUS_PING_INVALID = -2046818560,
                s_NEXUS_PING_NOCHANGES = 100665089,
                s_NEXUS_PING_CHANGES,
                e_NEXUS_PING_SENDPARAMS = -2046818557,
                e_NEXUS_PING_PROTOCOL,
                e_NEXUS_PING_HBI_OUT_OF_RANGE,
                e_NEXUS_PING_FOLDERS_OUT_OF_RANGE,
                e_NEXUS_PING_FOLDER_SYNC_REQUIRED,
                e_NEXUS_PING_SERVER,
                e_NEXUS_PING_MAX,
                e_NEXUS_PROVISION_INVALID = -2046818304,
                s_NEXUS_PROVISION_SUCCESS = 100665345,
                e_NEXUS_PROVISION_PROTOCOL = -2046818302,
                e_NEXUS_PROVISION_REMOTEWIPE_FAILED,
                e_NEXUS_PROVISION_SERVER,
                e_NEXUS_PROVISION_DATA_IGNORED,
                s_NEXUS_PROVISION_NO_POLICY = 100665350,
                e_NEXUS_PROVISION_UNKNOWN_TYPE = -2046818297,
                e_NEXUS_PROVISION_CORRUPTION,
                e_NEXUS_PROVISION_WRONG_KEY,
                e_NEXUS_PROVISION_MAX,
                e_NEXUS_SETTINGS_INVALID = -2046818045,
                s_NEXUS_SETTINGS_SUCCESS = 100665604,
                e_NEXUS_SETTINGS_PROTOCOL_ERROR = -2046818043,
                e_NEXUS_SETTINGS_ACCESS_DENIED,
                e_NEXUS_SETTINGS_SERVICE_UNAVAILABLE,
                e_NEXUS_SETTINGS_INVALID_ARG,
                e_NEXUS_SETTINGS_CONFLICTING_ARG,
                e_NEXUS_SETTINGS_DENIED_BY_POLICY,
                e_NEXUS_SETTINGS_MAX,
                e_NEXUS_ITEMOPERATIONS_INVALID = -2046817789,
                s_NEXUS_ITEMOPERATIONS_SUCCESS = 100665860,
                e_NEXUS_ITEMOPERATIONS_PROTOCOL = -2046817787,
                e_NEXUS_ITEMOPERATIONS_SERVER,
                e_NEXUS_ITEMOPERATIONS_BADLINK,
                e_NEXUS_ITEMOPERATIONS_ACCESSDENIED,
                e_NEXUS_ITEMOPERATIONS_NOTFOUND,
                e_NEXUS_ITEMOPERATIONS_CONNECTIONFAILED,
                e_NEXUS_ITEMOPERATIONS_OUTOFRANGE,
                e_NEXUS_ITEMOPERATIONS_UNKNOWNSTORE,
                e_NEXUS_ITEMOPERATIONS_FILEISEMPTY,
                e_NEXUS_ITEMOPERATIONS_DATATOOLARGE,
                e_NEXUS_ITEMOPERATIONS_IOFAILURE,
                e_NEXUS_ITEMOPERATIONS_INVALIDBODYPREFERENCE,
                e_NEXUS_ITEMOPERATIONS_CONVERSIONFAILURE,
                e_NEXUS_ITEMOPERATIONS_INVALIDATTACHMENTID,
                e_NEXUS_ITEMOPERATIONS_ACCESSBLOCKED,
                e_NEXUS_ITEMOPERATIONS_PARTIALSUCCESS,
                e_NEXUS_ITEMOPERATIONS_CREDENTIALSNEEDED,
                e_NEXUS_ITEMOPERATIONS_MAX,
                e_NEXUS_SEARCH_INVALID = -2046817533,
                s_NEXUS_SEARCH_SUCCESS = 100666116,
                e_NEXUS_SEARCH_PROTOCOL = -2046817531,
                e_NEXUS_SEARCH_SERVER,
                e_NEXUS_SEARCH_BADLINK,
                e_NEXUS_SEARCH_ACCESSDENIED,
                e_NEXUS_SEARCH_NOTFOUND,
                e_NEXUS_SEARCH_CONNECTIONFAILED,
                e_NEXUS_SEARCH_TOO_COMPLEX,
                e_NEXUS_SEARCH_INDEX_NOT_LOADED,
                e_NEXUS_SEARCH_TIMEOUT,
                e_NEXUS_SEARCH_NEED_TO_FOLDER_SYNC,
                s_NEXUS_SEARCH_ENDRETRIEVABLERANGE = 100666127,
                e_NEXUS_SEARCH_ACCESSBLOCKED = -2046817520,
                e_NEXUS_SEARCH_CREDENTIALSNEEDED,
                e_NEXUS_SEARCH_MAX,
                e_NEXUS_STATUS_INVALID_CONTENT = -2046817280,
                e_NEXUS_STATUS_INVALID_WBXML,
                e_NEXUS_STATUS_INVALID_XML,
                e_NEXUS_STATUS_INVALID_DATETIME,
                e_NEXUS_STATUS_INVALID_COMBINATIONOFIDS,
                e_NEXUS_STATUS_INVALID_IDS,
                e_NEXUS_STATUS_INVALID_MIME,
                e_NEXUS_STATUS_DEVICEID_MISSINGORINVALID,
                e_NEXUS_STATUS_DEVICETYPE_MISSINGORINVALID,
                e_NEXUS_STATUS_SERVERERROR,
                e_NEXUS_STATUS_SERVERERROR_RETRYLATER,
                e_NEXUS_STATUS_ACTIVEDIRECTORY_ACCESSDENIED,
                e_NEXUS_STATUS_MAILBOX_QUOTAEXCEEDED,
                e_NEXUS_STATUS_MAILBOX_SERVEROFFLINE,
                e_NEXUS_STATUS_MAILBOX_SENDQUOTAEXCEEDED,
                e_NEXUS_STATUS_MESSAGE_RECEIPIENTUNRESOLVED,
                e_NEXUS_STATUS_MESSAGE_REPLYNOTALLOWED,
                e_NEXUS_STATUS_MESSAGE_PREVIOUSLYSENT,
                e_NEXUS_STATUS_MESSAGE_HASNORECIPIENT,
                e_NEXUS_STATUS_MESSAGE_SUBMISSIONFAILED,
                e_NEXUS_STATUS_MESSAGE_REPLYFAILED,
                e_NEXUS_STATUS_MESSAGE_ATTACHMENTSTOOLARGE,
                e_NEXUS_STATUS_USER_HASNOMAILBOX,
                e_NEXUS_STATUS_USER_CANNOTBEANONYMOUS,
                e_NEXUS_STATUS_USER_PRINCIPALNOTFOUND,
                e_NEXUS_STATUS_USER_DISABLEDFORSYNC,
                e_NEXUS_STATUS_USER_ONNEW_MAILBOXCANNOTSYNC,
                e_NEXUS_STATUS_USER_ONLEGACY_MAILBOXCANNOTSYNC,
                e_NEXUS_STATUS_USER_DEVICEISBLOCKED,
                e_NEXUS_STATUS_ACCESSDENIED,
                e_NEXUS_STATUS_ACCOUNTDISABLED,
                e_NEXUS_STATUS_SYNCSTATE_NOTFOUND,
                e_NEXUS_STATUS_SYNCSTATE_LOCKED,
                e_NEXUS_STATUS_SYNCSTATE_CORRUPT,
                e_NEXUS_STATUS_SYNCSTATE_ALREADYEXISTS,
                e_NEXUS_STATUS_SYNCSTATE_VERSIONINVALID,
                e_NEXUS_STATUS_COMMAND_NOTSUPPORTED,
                e_NEXUS_STATUS_VERSION_NOTSUPPORTED,
                e_NEXUS_STATUS_DEVICE_NOTFULLYPROVISIONABLE,
                e_NEXUS_STATUS_DEVICE_REMOTEWIPEREQUESTED,
                e_NEXUS_STATUS_DEVICE_NOTPROVISIONABLE,
                e_NEXUS_STATUS_DEVICE_NOTPROVISIONED,
                e_NEXUS_STATUS_DEVICE_POLICYREFRESH,
                e_NEXUS_STATUS_INVALID_POLICYKEY,
                e_NEXUS_STATUS_EXTERNALLYMANAGED_DEVICESNOTALLOWED,
                e_NEXUS_STATUS_NORECURRENCE_INCALENDAR,
                e_NEXUS_STATUS_UNEXPECTED_ITEMCLASS,
                e_NEXUS_STATUS_REMOTESERVER_HASNOSSL,
                e_NEXUS_STATUS_INVALID_STOREREQUEST,
                e_NEXUS_STATUS_ITEM_NOTFOUND,
                e_NEXUS_STATUS_TOO_MANY_FOLDERS,
                e_NEXUS_STATUS_NO_FOLDERS_FOUND,
                e_NEXUS_STATUS_ITEMS_LOST_AFTER_MOVE,
                e_NEXUS_STATUS_FAILURE_IN_MOVEOPERATION,
                e_NEXUS_STATUS_UNSUPPORTED_CONVERSATION_ACTION,
                e_NEXUS_STATUS_UNSUPPORTED_CONVERSATION_ACTION_FOR_DESTINATION,
                e_NEXUS_STATUS_UM_FEATURE_DISABLED,
                e_NEXUS_STATUS_PHONE_NUMBER_REGISTRATION_FAILURE,
                e_NEXUS_STATUS_INVALID_MAILBOX_ID,
                e_NEXUS_STATUS_AVAILABILITY_REQUEST_TOO_MANY_RECIPIENTS,
                e_NEXUS_STATUS_AVAILABILITY_REQUEST_DL_TO_MANY_MEMBERS,
                e_NEXUS_STATUS_AVAILABILITY_TRANSIENT_FAILURE,
                e_NEXUS_STATUS_AVAILABILITY_FAILURE,
                e_NEXUS_STATUS_BODY_PART_PREFERENCE_TYPE_NOT_SUPPORTED,
                e_NEXUS_STATUS_DEVICE_INFORMATION_REQUIRED,
                e_NEXUS_STATUS_INVALID_ACCOUNT_ID,
                e_NEXUS_STATUS_ACCOUNT_SEND_DISABLED,
                e_NEXUS_STATUS_IRM_FEATURE_DISABLED,
                e_NEXUS_STATUS_IRM_TRANSIENT_ERROR,
                e_NEXUS_STATUS_IRM_PERMANENT_ERROR,
                e_NEXUS_STATUS_IRM_INVALID_TEMPLATE_ID,
                e_NEXUS_STATUS_IRM_OPERATION_NOT_PERMITTED,
                e_NEXUS_STATUS_NO_PICTURE,
                e_NEXUS_STATUS_PICTURE_TOO_LARGE,
                e_NEXUS_STATUS_PICTURE_LIMIT_REACHED,
                e_NEXUS_STATUS_BODY_PART_CONVERSATION_TOO_LARGE,
                e_NEXUS_STATUS_MAXIMUM_DEVICES_REACHED,
                e_NEXUS_APPLY_POLICY_NEEDED,
                e_NEXUS_UNABLE_TO_COMPLY_WITH_POLICY,
                e_NEXUS_BACK_OFF,
                e_SYNC_WINDOW_CHANGE_ABORT,
                e_NEXUS_STATUS_NO_UNSUBSCRIBE_INFORMATION,
                e_NEXUS_STATUS_MESSAGE_IS_INFECTED,
                e_NEXUS_STATUS_RULE_ALREADY_EXISTS,
                e_NEXUS_STATUS_RULE_CANNOT_BE_RUN,
                e_NEXUS_STATUS_INVALID_CATEGORY,
                e_NEXUS_RESOLVERECIPIENTS_INVALID = -2046817023,
                s_NEXUS_RESOLVERECIPIENTS_SUCCESS = 100666626,
                e_NEXUS_RESOLVERECIPIENTS_AMBIGUOUS = -2046817021,
                e_NEXUS_RESOLVERECIPIENTS_AMBIGUOUS_PARTIAL,
                e_NEXUS_RESOLVERECIPIENTS_NOMATCH,
                e_NEXUS_RESOLVERECIPIENTS_PROTOCOL,
                e_NEXUS_RESOLVERECIPIENTS_SERVER,
                e_NEXUS_RESOLVERECIPIENTS_NO_CERT,
                e_NEXUS_RESOLVERECIPIENTS_CERT_MAXED,
                e_NEXUS_RESOLVERECIPIENTS_DL_ERROR,
                e_NEXUS_RESOLVERECIPIENTS_MAX,
                e_NEXUS_USER_CANCELLED_POLICY = -2147023673,
                ixp_E_ALREADY_CONNECTED = -2030042879,
                ixp_E_INCOMPLETE = -2030042877,
                ixp_E_IMAP_CONNECTION_REFUSED = -2030042871,
                ixp_E_IMAP_TAGGED_NO_RESPONSE = -2030042864,
                ixp_E_IMAP_BAD_RESPONSE,
                ixp_E_IMAP_LOGINFAILURE,
                ixp_E_IMAP_UNSOLICITED_BYE,
                ixp_E_IMAP_RECVR_ERROR,
                ixp_E_IMAP_UNRECOGNIZED_RESP,
                ixp_E_IMAP_SVR_SYNTAXERR,
                ixp_E_IMAP_BUFFER_OVERFLOW = -2030042856,
                ixp_E_IMAP_IMPROPER_SVRSTATE,
                ixp_E_IMAP_CHANGEDUID = -2030042848,
                ixp_E_IMAP_UIDORDER,
                mime_E_INVALID_INET_DATE = -2030042845,
                ixp_E_SMTP_RESPONSE_ERROR = -2030042795,
                ixp_E_SMTP_UNKNOWN_RESPONSE_CODE,
                ixp_E_SMTP_REJECTED_RECIPIENTS,
                ixp_E_SMTP_NO_SENDER,
                ixp_E_SMTP_NO_RECIPIENTS,
                ixp_E_SMTP_REJECTED_SENDER = -2030042784,
                ixp_E_SMTP_500_SYNTAX_ERROR,
                ixp_E_SMTP_501_PARAM_SYNTAX,
                ixp_E_SMTP_502_COMMAND_NOTIMPL,
                ixp_E_SMTP_503_COMMAND_SEQ,
                ixp_E_SMTP_504_COMMAND_PARAM_NOTIMPL,
                ixp_E_SMTP_421_NOT_AVAILABLE,
                ixp_E_SMTP_450_MAILBOX_BUSY,
                ixp_E_SMTP_550_MAILBOX_NOT_FOUND,
                ixp_E_SMTP_451_ERROR_PROCESSING,
                ixp_E_SMTP_551_USER_NOT_LOCAL = -2030042768,
                ixp_E_SMTP_452_NO_SYSTEM_STORAGE,
                ixp_E_SMTP_552_STORAGE_OVERFLOW,
                ixp_E_SMTP_553_MAILBOX_NAME_SYNTAX,
                ixp_E_SMTP_554_TRANSACT_FAILED,
                ixp_E_SMTP_530_STARTTLS_REQUIRED,
                ixp_E_SMTP_NO_STARTTLS_SUPPORT,
                ixp_S_SMTP_NO_DSN_SUPPORT,
                ixp_E_SMTP_535_AUTH_FAILED,
                ixp_E_SMTP_454_STARTTLS_FAILED,
                ixp_E_IMAP_BODY_TOO_DEEP = -2030042752,
            }
            export class RightsManagementTemplate implements IRightsManagementTemplate, IObject {
                name: string;
                id: string;
                description: string;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                commit(): void {
                    console.warn('shimmed function RightsManagementTemplate.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function RightsManagementTemplate.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function RightsManagementTemplate.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`RightsManagementTemplate::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export enum SanitizedVersion {
                notSanitized,
                w6RTM,
                current = 1,
                noHtmlBody = 100,
                locallyCreatedMessage,
            }
            export enum ScenarioState {
                none,
                unknown,
                connected,
                upgradeRequired,
                error,
                connectedButDisabled,
                connectable,
                dismissed,
                connectableButOverridden,
                terminated,
            }
            export class SearchCollection implements ICollection, IDisposable, ISearchCollection, INotificationCollection {
                count: number;
                totalCount: number;

                item(index: number): IObject {
                    throw new Error('shimmed function SearchCollection.item');
                }

                fetchMoreItems(dwFetchSize: number): void {
                    console.warn('shimmed function SearchCollection.fetchMoreItems');
                }

                lock(): void {
                    console.warn('shimmed function SearchCollection.lock');
                }

                unlock(): void {
                    console.warn('shimmed function SearchCollection.unlock');
                }

                dispose(): void {
                    console.warn('shimmed function SearchCollection.dispose');
                }

                beginServerSearch(): void {
                    console.warn('shimmed function SearchCollection.beginServerSearch');
                }

                dispatchEvents(): void {
                    console.warn('shimmed function SearchCollection.dispatchEvents');
                }

                cancelSynchronousDispatch(): void {
                    console.warn('shimmed function SearchCollection.cancelSynchronousDispatch');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`SearchCollection::addEventListener: ${name}`);
                    switch (name) {
                        case "collectionchanged": // CollectionChangedHandler
                        case "notificationreceived": // CollectionNotificationHandler
                            break;
                    }

                }
            }
            export class SearchPerson implements ISearchPerson, IObject, IBaseContact, IPerson, IContact {
                nickname: string;
                middleName: string;
                firstName: string;
                lastName: string;
                calculatedUIName: string;
                isGal: Boolean;
                onlineStatus: ContactStatus;
                isInAddressBook: Boolean;
                calculatedYomiDisplayName: string;
                canClearPersonTile: Boolean;
                canEmail: Boolean;
                isFavorite: Boolean;
                linkedContacts: ICollection;
                mostRelevantEmail: string;
                mostRelevantPhone: string;
                sortNameLastFirst: string;
                suggestedPeople: ICollection;
                tileId: string;
                businessPhoneNumber: string;
                businessLocation: Location;
                businessFaxNumber: string;
                businessEmailAddress: string;
                business2PhoneNumber: string;
                birthdate: Date;
                anniversary: Date;
                alias: string;
                title: string;
                pagerNumber: string;
                mobile2PhoneNumber: string;
                homePhoneNumber: string;
                webSite: string;
                homeLocation: Location;
                homeFaxNumber: string;
                home2PhoneNumber: string;
                jobTitle: string;
                companyName: string;
                mobilePhoneNumber: string;
                yomiFirstName: string;
                yomiCompanyName: string;
                trustLevel: ContactTrustLevel;
                otherLocation: Location;
                suffix: string;
                significantOther: string;
                personalEmailAddress: string;
                yomiLastName: string;
                otherEmailAddress: string;
                officeLocation: string;
                notes: string;
                cid: CID;
                imtype: ContactIMType;
                account: IAccount;
                canOIM: Boolean;
                isBuddy: Boolean;
                linkType: ContactLinkingType;
                mainMri: string;
                isPublicEntity: Boolean;
                person: IPerson;
                thirdPartyObjectId: string;
                canIMNow: Boolean;
                verbs: ICollection;
                federatedEmailAddress: string;
                windowsLiveEmailAddress: string;
                yahooEmailAddress: string;
                supportsMobileIM: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                canDelete: Boolean;
                canEdit: Boolean;

                savePermanently(pLinkTarget: IPerson): void {
                    console.warn('shimmed function SearchPerson.savePermanently');
                }

                commit(): void {
                    console.warn('shimmed function SearchPerson.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function SearchPerson.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function SearchPerson.getKeepAlive');
                }

                getUserTile(size: UserTileSize, cachedOnly: Boolean): IUserTile {
                    throw new Error('shimmed function SearchPerson.getUserTile');
                }

                createLink(pPerson: IPerson): void {
                    console.warn('shimmed function SearchPerson.createLink');
                }

                manageLinks(personObjectIdsToLink: string[], contactObjectIdsToUnlink: string[]): void {
                    console.warn('shimmed function SearchPerson.manageLinks');
                }

                commitAndLink(pUncommittedContact: IContact): void {
                    console.warn('shimmed function SearchPerson.commitAndLink');
                }

                insertFavorite(position: FavoriteInsertPosition, pFavoriteMember: IPerson): void {
                    console.warn('shimmed function SearchPerson.insertFavorite');
                }

                removeFavorite(): void {
                    console.warn('shimmed function SearchPerson.removeFavorite');
                }

                createRecipient(email: string): IRecipient {
                    throw new Error('shimmed function SearchPerson.createRecipient');
                }

                augmentViaServerAsync(fBackground: Boolean): IAsyncAction {
                    throw new Error('shimmed function SearchPerson.augmentViaServerAsync');
                }

                getWindowsContact(): /* Windows.ApplicationModel.Contacts.Contact */ any {
                    throw new Error('shimmed function SearchPerson.getWindowsContact');
                }

                setPersonTile(pExtraLargeTile: /* Windows.Storage.Streams.IRandomAccessStream */ any): void {
                    console.warn('shimmed function SearchPerson.setPersonTile');
                }

                clearPersonTile(): void {
                    console.warn('shimmed function SearchPerson.clearPersonTile');
                }

                setStartScreenTileId(hstrTileId: string, hstrLaunchArguments: string): void {
                    console.warn('shimmed function SearchPerson.setStartScreenTileId');
                }

                unlink(): void {
                    console.warn('shimmed function SearchPerson.unlink');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`SearchPerson::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class SearchResultsMonitor implements IAsyncAction {
                completed: /* Windows.Foundation.AsyncActionCompletedHandler */ any;
                errorCode: number;
                id: number;
                status: AsyncStatus;

                getResults(): void {
                    console.warn('shimmed function SearchResultsMonitor.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function SearchResultsMonitor.cancel');
                }

                close(): void {
                    console.warn('shimmed function SearchResultsMonitor.close');
                }

            }
            export enum SearchStatusCode {
                invalid,
                success,
                timeOut,
                serverError,
                folderSyncRequired,
                endOfRetrievableRange,
            }
            export enum ServerScenario {
                none,
                chat,
                client_calendar,
                client_contacts,
                client_mail,
                client_mail_imap,
                contacts,
                dashboard_agg,
                media_agg,
                status_publish,
            }
            export enum ServerType {
                eas,
                imap,
                pop,
                smtp,
            }
            export namespace Service { 
                export interface IRemoteProcess {
                }
                export class RemoteProcess implements IRemoteProcess {
                }
            }
            export enum ServicePartnerApplicationState {
                notSupported,
                active,
                terminated,
                expiring,
                updated,
            }
            export class ServicingCompleteTask {
                run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                    console.warn('shimmed function ServicingCompleteTask.run');
                }

            }
            export enum SignatureType {
                enabled = 2,
                disabled,
            }
            export class SmtpAccountSettings implements IAccountServerConnectionSettings, ISmtpAccountSettings, IObject {
                userId: string;
                useSsl: Boolean;
                supportsOAuth: Boolean;
                server: string;
                port: number;
                ignoreServerCertificateUnknownCA: Boolean;
                ignoreServerCertificateMismatchedDomain: Boolean;
                ignoreServerCertificateExpired: Boolean;
                domain: string;
                hasPasswordCookie: Boolean;
                serverType: ServerType;
                supportsAdvancedProperties: Boolean;
                usesMailCredentials: Boolean;
                serverRequiresLogin: Boolean;
                addSentItemsToSentFolder: Boolean;
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;

                setPasswordCookie(cookie: string): void {
                    console.warn('shimmed function SmtpAccountSettings.setPasswordCookie');
                }

                commit(): void {
                    console.warn('shimmed function SmtpAccountSettings.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function SmtpAccountSettings.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function SmtpAccountSettings.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`SmtpAccountSettings::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class StoreObjectChangedAsync implements IAsyncAction {
                errorCode: number;
                id: number;
                status: AsyncStatus;
                completed: /* Windows.Foundation.AsyncActionCompletedHandler */ any;

                getResults(): void {
                    console.warn('shimmed function StoreObjectChangedAsync.getResults');
                }

                cancel(): void {
                    console.warn('shimmed function StoreObjectChangedAsync.cancel');
                }

                close(): void {
                    console.warn('shimmed function StoreObjectChangedAsync.close');
                }

            }
            export class StringVector implements IList<string>, ICollection<string>, IEnumerable<string> {
                size: number;

            }
            export enum SyncType {
                manual,
                poll,
                push,
            }
            export enum SyncWindowSize {
                all,
                oneDay,
                threeDays,
                oneWeek,
                twoWeeks,
                oneMonth,
                threeMonths,
                sixMonths,
            }
            export interface TemporaryContactData {
                firstName: string;
                yomiFirstName: string;
                emailAddress: string;
                thirdPartyObjectId: string;
                userTileUri: string;
            }
            export enum TileIdType {
                sourceObjectId,
                easTileId,
                me,
                roamingEasTileId,
                roamingMailViewId,
                localMailViewId,
                localContactId,
            }
            export enum ToastState {
                favoritesOnly,
                all,
                none,
            }
            export class TransientObjectHolder implements ITransientObjectHolder, IDisposable {
                objectId: string;

                dispose(): void {
                    console.warn('shimmed function TransientObjectHolder.dispose');
                }

            }
            export class UserTile implements IUserTile, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                appdataURI: string;
                stream: /* Windows.Storage.Streams.IRandomAccessStream */ any;

                commit(): void {
                    console.warn('shimmed function UserTile.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function UserTile.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function UserTile.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`UserTile::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export interface UserTileCrop {
                x: number;
                y: number;
                width: number;
                height: number;
            }
            export enum UserTileSize {
                invalid = -1,
                tiny,
                extraSmall,
                small,
                medium,
                large,
                extraLarge,
                original,
            }
            export class Verb implements IVerb, IObject {
                canDelete: Boolean;
                canEdit: Boolean;
                isObjectValid: Boolean;
                objectId: string;
                objectType: string;
                url: string;
                verbType: VerbType;

                commit(): void {
                    console.warn('shimmed function Verb.commit');
                }

                deleteObject(): void {
                    console.warn('shimmed function Verb.deleteObject');
                }

                getKeepAlive(): ITransientObjectHolder {
                    throw new Error('shimmed function Verb.getKeepAlive');
                }

                addEventListener(name: string, handler: Function) {
                    console.warn(`Verb::addEventListener: ${name}`);
                    switch (name) {
                        case "changed": // ObjectChangedHandler
                        case "deleted": // ObjectChangedHandler
                            break;
                    }

                }
            }
            export class VerbBackgroundTask {
                run(taskInstance: /* Windows.ApplicationModel.Background.IBackgroundTaskInstance */ any): void {
                    console.warn('shimmed function VerbBackgroundTask.run');
                }

            }
            export class VerbManager implements IPluginVerbManager {
                createVerb(hstrVerbName: string, hstrVerbParams: string): IPluginVerb {
                    throw new Error('shimmed function VerbManager.createVerb');
                }

                createVerbFromTask(hstrVerbName: string, hstrVerbParams: string, pTaskInstance: any): IPluginVerb {
                    throw new Error('shimmed function VerbManager.createVerbFromTask');
                }

                createVerbFromTaskWithContext(hstrVerbName: string, hstrVerbParams: string, pContext: any, pTaskInstance: any): IPluginVerb {
                    throw new Error('shimmed function VerbManager.createVerbFromTaskWithContext');
                }

                runResourceVerb(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): void {
                    console.warn('shimmed function VerbManager.runResourceVerb');
                }

                runResourceVerbAsync(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): IAsyncAction {
                    throw new Error('shimmed function VerbManager.runResourceVerbAsync');
                }

                cancelResourceVerb(pAccount: IAccount, hstrResName: string, pVerb: IPluginVerb): void {
                    console.warn('shimmed function VerbManager.cancelResourceVerb');
                }

            }
            export enum VerbType {
                photo,
                privateMessage,
                profile,
                reportAbuse,
            }
        }
        export namespace Shared { 
            export namespace Telemetry { 
                export class ErrorReporting implements IErrorReporting {
                    enableErrorReporting(strAppIdentifier: string): void {
                        console.warn('shimmed function ErrorReporting.enableErrorReporting');
                    }

                    disableErrorReporting(): void {
                        console.warn('shimmed function ErrorReporting.disableErrorReporting');
                    }

                    registerLogFile(strFilePath: string): void {
                        console.warn('shimmed function ErrorReporting.registerLogFile');
                    }

                    reportFault(strFileAndLine: string, strModuleName: string, hr: number): void {
                        console.warn('shimmed function ErrorReporting.reportFault');
                    }

                }
                export interface IErrorReporting {
                    enableErrorReporting(strAppIdentifier: string): void;
                    disableErrorReporting(): void;
                    registerLogFile(strFilePath: string): void;
                    reportFault(strFileAndLine: string, strModuleName: string, hr: number): void;
                }
                export class WliReportingTask {
                    errorCode: number;
                    id: number;
                    status: AsyncStatus;
                    progress: /* Windows.Foundation.AsyncActionProgressHandler`1[[System.Int32, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any;
                    completed: /* Windows.Foundation.AsyncActionWithProgressCompletedHandler`1[[System.Int32, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any;

                    getResults(): void {
                        console.warn('shimmed function WliReportingTask.getResults');
                    }

                    cancel(): void {
                        console.warn('shimmed function WliReportingTask.cancel');
                    }

                    close(): void {
                        console.warn('shimmed function WliReportingTask.close');
                    }

                }
            }
        }
    }
}
