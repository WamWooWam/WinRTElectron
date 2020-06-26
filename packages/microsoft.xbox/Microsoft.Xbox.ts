import { IAsyncAction, IAsyncOperation } from "../../winrt-node/Windows.Foundation";

export namespace Microsoft {
    export namespace Xbox {
        export class Achievement {
            description: string;
            flags: number;
            gamerscore: number;
            id: number;
            imageId: number;
            isEarned: Boolean;
            isSecret: Boolean;
            lockedDescription: string;
            name: string;
            pictureUrl: string;
            platform: PlatformType;
            sequence: number;
            timeUnlocked: Date;
            titleId: number;
            type: number;
            unlockedOnline: Boolean;
        }
        export class AchievementCollection {
            items: Achievement[];
            totalRecords: number;
        }
        export class AvatarManifest {
            manifest: string;
        }
        export enum CacheGroup {
            none,
            profile,
            friendProfiles,
            achievements,
            leaderboards,
            friends,
            userStatus,
            userMessages,
            avatarManifest,
            matchmakingRequestStatus,
            multiplayerSessionSummaries,
            multiplayerSessionInfo,
            multiplayerSessionGameMessages,
            getReceipts,
            getAssets,
            gamerContext,
        }
        export enum FileType {
            globalTitleData,
            titleData,
        }
        export namespace Foundation {
            export class PushNotificationChannel {
                uri: string;
                close(): void {
                    console.warn('shimmed function PushNotificationChannel.close');
                }

                addEventListener(name: string, handler: Function) {
                    switch (name) {
                        case "pushnotificationreceived":
                        case "urichanged":
                            break;
                    }

                }
            }
            export class PushNotificationChannelUriChangedEventArgs {
                uri: string;
            }
            export class PushNotificationManager {
                static applicationChannel: /* Microsoft.Xbox.Foundation.PushNotificationChannel */ any;
            }
            export class PushNotificationReceivedEventArgs {
                args: /* Windows.Networking.PushNotifications.PushNotificationReceivedEventArgs */ any;
            }
            export class ServiceClient {
                signedInUserIdentity: /* Microsoft.Xbox.Foundation.UserIdentity */ any;
                titleId: number;
                token: string;
                signInAsync(): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function ServiceClient.signInAsync');
                }

                signOutAsync(): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function ServiceClient.signOutAsync');
                }

                addEventListener(name: string, handler: Function) {
                    switch (name) {
                        case "signedout":
                            break;
                    }

                }
            }
            export class SignedOutEventArgs {
                errorCode: /* System.Exception */ any;
            }
            export class UserIdentity {
                gamertag: string;
                xuid: number;
            }
            export enum WindowsLiveDialogOption {
                showIfNeeded,
                alwaysShow,
                neverShow,
            }
        }
        export enum FriendType {
            isFriend,
            pending,
            requesting,
            notAFriend,
        }
        export namespace Interop {
            export class CallbackInvoker {
                invoke(context: number): void {
                    console.warn('shimmed function CallbackInvoker.invoke');
                }

            }
        }
        export enum LaunchAction {
            showHome,
            showGameDetails,
            showSigninFlow,
        }
        export namespace Leaderboards {
            export class Leaderboard {
                metadata: /* Microsoft.Xbox.Leaderboards.LeaderboardMetadata */ any;
                totalRecords: number;
                userList: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Leaderboards.LeaderboardRow, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
                userRow: /* Microsoft.Xbox.Leaderboards.LeaderboardRow */ any;
            }
            export enum LeaderboardAggregation {
                add,
                replace,
                min,
                max,
            }
            export class LeaderboardAttribute {
                attributeId: number = 0;
                type: LeaderboardValueType = LeaderboardValueType.int64;
                value: string = '';
                verb: LeaderboardAggregation = LeaderboardAggregation.replace;
            }
            export class LeaderboardMetadata {
                leaderboardId: number;
                leaderboardName: string;
                ratingColumnName: string;
            }
            export class LeaderboardMetadataCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Leaderboards.LeaderboardMetadata, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export class LeaderboardRow {
                attributes: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Leaderboards.LeaderboardAttribute, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
                gamertag: string;
                rank: number;
                rating: string;
                xuid: number;
            }
            export class LeaderboardRowCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Leaderboards.LeaderboardRow, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export class LeaderboardService {
                getLeaderboardsAsync(): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Leaderboards.LeaderboardMetadataCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    return new IAsyncOperation((resolve, reject) => {reject()});
                }

                getLeaderboardAsync(skipItems: number, maxItems: number, leaderboardId: number, titleView: Boolean, attributes: /* System.Collections.Generic.IReadOnlyList`1[[System.UInt32, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any, previousPage: /* Microsoft.Xbox.Leaderboards.Leaderboard */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Leaderboards.Leaderboard, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function LeaderboardService.getLeaderboardAsync');
                }

                getSystemLeaderboardAsync(skipItems: number, maxItems: number, leaderboardName: string, previousPage: /* Microsoft.Xbox.Leaderboards.Leaderboard */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Leaderboards.Leaderboard, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function LeaderboardService.getSystemLeaderboardAsync');
                }

                postResultAsync(leaderboardId: number, verb: LeaderboardAggregation, scoreValue: number): /* Windows.Foundation.IAsyncAction */ any {
                    return new IAsyncOperation((resolve, reject) => {reject()});
                }

                postResultsAsync(leaderboardId: number, attributes: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Leaderboards.LeaderboardAttribute, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function LeaderboardService.postResultsAsync');
                }

            }
            export enum LeaderboardValueType {
                unknown,
                int32,
                int64,
                float,
            }
        }
        export namespace Marketplace {
            export class AssetBalance {
                id: number = 0;
                json: string = '';
                quantity: number = 0;
                timestamp: Date;
                titleId: number = 0;
                xuid: number = 0;
            }
            export class AssetBalanceCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Marketplace.AssetBalance, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export enum ItemType {
                metroGame = 1,
                metroGameContent,
                metroGameConsumable = 4,
                avatarItems = 8,
                mobileGame = 16,
                xboxMobilePDLC = 32,
                xboxMobileConsumable = 64,
            }
            export class MarketplaceService {
                static retypeCredentialsAtPurchase: Boolean = true;
                static enumerateOffersByOfferIdsAsync(offerIds: /* System.Collections.Generic.IReadOnlyList`1[[System.String, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Marketplace.OfferCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MarketplaceService.enumerateOffersByOfferIdsAsync');
                }

                static enumerateOffersAsync(titleId: number, skipItems: number, maxItems: number, desiredItemTypes: ItemType, publisherCategoryMask: number, order: OrderingOption, orderAscending: Boolean): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Marketplace.OfferCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MarketplaceService.enumerateOffersAsync');
                }

                static showPurchaseAsync(offerId: string): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function MarketplaceService.showPurchaseAsync');
                }

                static getReceiptsAsync(titleId: number, skipItems: number, maxItems: number, previousPage: /* Microsoft.Xbox.Marketplace.ReceiptCollection */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Marketplace.ReceiptCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MarketplaceService.getReceiptsAsync');
                }

                static getReceiptsWithDateFilterAsync(titleId: number, skipItems: number, maxItems: number, utcStartDateFilter: Date, previousPage: /* Microsoft.Xbox.Marketplace.ReceiptCollection */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Marketplace.ReceiptCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MarketplaceService.getReceiptsWithDateFilterAsync');
                }

                static getReceiptAsync(titleId: number, offerId: string): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Marketplace.Receipt, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MarketplaceService.getReceiptAsync');
                }

                static getAssetsAsync(titleId: number, skipItems: number, maxItems: number, previousPage: /* Microsoft.Xbox.Marketplace.AssetBalanceCollection */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Marketplace.AssetBalanceCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MarketplaceService.getAssetsAsync');
                }

                static consumeAssetsAsync(titleId: number, assets: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Marketplace.AssetBalance, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function MarketplaceService.consumeAssetsAsync');
                }

                static setRetypeCredentialsAtPurchaseAsync(value: Boolean): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function MarketplaceService.setRetypeCredentialsAtPurchaseAsync');
                }

            }
            export class Offer {
                averageUserRating: number;
                contentCategory: number;
                displayPrice: string;
                downloadSizeInBytes: number;
                offerId: string;
                offerImages: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Marketplace.OfferImage, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
                offerName: string;
                offerType: ItemType;
                releaseDate: Date;
                sellText: string;
                titleId: number;
                titleName: string;
                userRatingCount: number;
            }
            export class OfferCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Marketplace.Offer, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export class OfferImage {
                fileUrl: string;
                height: number;
                purpose: string;
                width: number;
            }
            export enum OrderingOption {
                userRatings,
                freeAndPaidCountDaily,
                paidCountAllTime,
                paidCountDaily,
                digitalReleaseDate,
                releaseDate,
            }
            export class Receipt {
                json: string;
                mediaInstanceUrls: /* System.Collections.Generic.IReadOnlyList`1[[System.String, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any;
                offerId: string;
                purchaseDate: Date;
                purchasingPartnerId: number;
                status: string;
                title: string;
                titleId: number;
                transactionId: string;
                xuid: number;
            }
            export class ReceiptCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Marketplace.Receipt, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
        }
        export enum MembershipType {
            none,
            silver = 3,
            gold = 6,
            familyGold = 9,
        }
        export namespace Multiplayer {
            export class GameMessage {
                messageData: /* Windows.Storage.Streams.IRandomAccessStream */ any;
                messageDataBuffer: /* Windows.Storage.Streams.IBuffer */ any;
                queueIndex: number;
                senderXuid: number;
                sequenceId: number;
                timestamp: Date;
            }
            export class GameMessageCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Multiplayer.GameMessage, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export class MatchCriteria {
                customMatchType: string = '';
                equal: /* System.Collections.Generic.IList`1[[Microsoft.Xbox.Multiplayer.MatchProperty, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any = null;
                greaterThan: /* System.Collections.Generic.IList`1[[Microsoft.Xbox.Multiplayer.MatchProperty, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any = null;
                lessThan: /* System.Collections.Generic.IList`1[[Microsoft.Xbox.Multiplayer.MatchProperty, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any = null;
                notEqual: /* System.Collections.Generic.IList`1[[Microsoft.Xbox.Multiplayer.MatchProperty, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any = null;
                properties: /* System.Collections.Generic.IList`1[[Microsoft.Xbox.Multiplayer.MatchProperty, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any = null;
                restriction: MatchRestriction = MatchRestriction.matchAny;
            }
            export class MatchmakingService {
                postRequestAsync(request: /* Microsoft.Xbox.Multiplayer.MatchRequest */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.MatchRequestResult, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MatchmakingService.postRequestAsync');
                }

                getRequestStatusAsync(requestId: string): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.MatchRequestStatus, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MatchmakingService.getRequestStatusAsync');
                }

                deleteRequestAsync(requestId: string): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function MatchmakingService.deleteRequestAsync');
                }

            }
            export class MatchProperty {
                id: string = '';
                type: MatchType = MatchType.integer;
                value: string = '';
            }
            export class MatchRequest {
                matchCriteria: /* Microsoft.Xbox.Multiplayer.MatchCriteria */ any = null;
                maxSeats: number = 2;
                minSeats: number = 2;
                postbackUrl: string = '';
                seatsOccupied: number = 0;
                sessionId: string = '';
                timeoutSeconds: number = 0;
                titleGroupId: string = '00000000-0000-0000-0000-000000000000';
                titleId: number = 0;
            }
            export class MatchRequestResult {
                requestId: string;
            }
            export class MatchRequestStatus {
                sessionId: string;
                status: MatchStatus;
                users: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Multiplayer.MatchUser, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export enum MatchRestriction {
                preserveSession,
                newSessionOnly,
                matchAny,
            }
            export enum MatchStatus {
                matchFound,
                searching,
                matchNotFound,
                cancelled,
            }
            export enum MatchType {
                integer,
                string,
            }
            export class MatchUser {
                gamertag: string;
                titleId: number;
            }
            export class MatchUserCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Multiplayer.MatchUser, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export class MultiplayerSession {
                sessionId: string;
                getInfoAsync(): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.MultiplayerSessionInfo, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MultiplayerSession.getInfoAsync');
                }

                updateInfoAsync(settings: /* Microsoft.Xbox.Multiplayer.MultiplayerSessionSettings */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.MultiplayerSessionInfo, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MultiplayerSession.updateInfoAsync');
                }

                removePlayerAsync(playerXuid: number): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function MultiplayerSession.removePlayerAsync');
                }

                postGameMessageAsync(queueIndex: number, replaceAll: Boolean, mustFollowSequenceNum: number, messageData: /* Windows.Storage.Streams.IRandomAccessStream */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.GameMessage, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MultiplayerSession.postGameMessageAsync');
                }

                postGameMessageWithBufferAsync(queueIndex: number, replaceAll: Boolean, mustFollowSequenceNum: number, messageData: /* Windows.Storage.Streams.IBuffer */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.GameMessage, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MultiplayerSession.postGameMessageWithBufferAsync');
                }

                getGameMessagesAsync(queueIndex: number, startAtSequenceNum: number, maxCount: number, timeoutSeconds: number): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.GameMessageCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MultiplayerSession.getGameMessagesAsync');
                }

                deleteGameMessagesAsync(queueIndex: number, throughSequenceNum: number): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function MultiplayerSession.deleteGameMessagesAsync');
                }

                updatePlayerAsync(playerCustomData: /* Windows.Storage.Streams.IRandomAccessStream */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.Player, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MultiplayerSession.updatePlayerAsync');
                }

                updatePlayerWithBufferAsync(playerCustomData: /* Windows.Storage.Streams.IBuffer */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.Player, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function MultiplayerSession.updatePlayerWithBufferAsync');
                }

            }
            export class MultiplayerSessionInfo {
                creationTime: Date;
                customData: /* Windows.Storage.Streams.IRandomAccessStream */ any;
                customDataBuffer: /* Windows.Storage.Streams.IBuffer */ any;
                displayName: string;
                hasEnded: Boolean;
                id: string;
                isClosed: Boolean;
                maxPlayers: number;
                mode: number;
                playersCanBeRemovedBy: PlayerAcl;
                roster: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Multiplayer.Player, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
                seatsAvailable: number;
                titleId: number;
                visibility: VisibilityLevel;
            }
            export class MultiplayerSessionSettings {
                customData: /* Windows.Storage.Streams.IRandomAccessStream */ any = null;
                customDataBuffer: /* Windows.Storage.Streams.IBuffer */ any = null;
                displayName: string = '';
                hasEnded: Boolean = false;
                isClosed: Boolean = false;
                maxPlayers: number = 2;
                mode: number = 0;
                titleGroupId: string = '00000000-0000-0000-0000-000000000000';
                visibility: VisibilityLevel = VisibilityLevel.playersCurrentlyInSession;
            }
            export class MultiplayerSessionSummary {
                displayName: string;
                hasEnded: Boolean;
                id: string;
                lastMessages: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Multiplayer.GameMessage, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
                mode: number;
                titleId: number;
            }
            export class MultiplayerSessionSummaryCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Multiplayer.MultiplayerSessionSummary, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export class Player {
                customData: /* Windows.Storage.Streams.IRandomAccessStream */ any;
                customDataBuffer: /* Windows.Storage.Streams.IBuffer */ any;
                gamertag: string;
                isCurrentlyInSession: Boolean;
                seatIndex: number;
                xuid: number;
            }
            export enum PlayerAcl {
                all = 1,
                self,
                none,
            }
            export class PlayerCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Multiplayer.Player, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export enum VisibilityLevel {
                everyone = 1,
                playersEverInSession,
                playersCurrentlyInSession,
            }
        }
        export class MultiplayerMessageData {
            customData: /* Windows.Storage.Streams.IRandomAccessStream */ any;
            customDataBuffer: /* Windows.Storage.Streams.IBuffer */ any;
            sessionId: string;
            type: MultiplayerMessageType;
        }
        export enum MultiplayerMessageQueue {
            queueNone,
            queue0,
            queue1,
            queue2 = 4,
            queue3 = 8,
            queueAll = 65535,
        }
        export enum MultiplayerMessageType {
            unknown,
            invitation,
            yourTurn,
            nudge,
            gameOver,
            youWin,
            youLose,
            gameTie,
        }
        export enum MultiplayerSessionState {
            ended,
            notEnded,
            any,
        }
        export enum PlatformType {
            xbox360 = 1,
            windowsPC,
            mobile = 15,
            webGames,
            xboxLIVEOnWindows,
            invalid = 255,
        }
        export class Recipient {
            id: string;
            idType: RecipientIdType;
        }
        export class RecipientCollection {
            items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Recipient, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
        }
        export enum RecipientIdType {
            xuid,
            gamertag,
        }
        export class ResourceLoader {
            static getStringById(eStringId: StringId): string {
                throw new Error('shimmed function ResourceLoader.getStringById');
            }

        }
        export enum StringId {
            errorAccountCreationFailed,
            errorAccountNeedsManagement,
            errorProofOfPurchase,
            errorRegionNotSupported,
            errorServiceVersionOld,
            errorSignInFailed,
            errorTermsOfServiceUpdate,
            errorSignInOrConsentNotGranted,
            errorAgeVerificationRequired,
            errorBlockedByAge,
            errorUnknown,
        }
        export namespace TitleStorage {
            export class TitleStorageFile {
                clientFileTime: Date;
                displayName: string;
                etag: string;
                filename: string;
                size: number;
                smartBlobType: string;
                titleGroupId: string;
                xuid: number;
                static getUserFileFromPath(xuid: number, titleGroupId: string, path: string): /* Microsoft.Xbox.TitleStorage.TitleStorageFile */ any {
                    throw new Error('shimmed function TitleStorageFile.getUserFileFromPath');
                }

                static getGlobalFileFromPath(titleGroupId: string, path: string): /* Microsoft.Xbox.TitleStorage.TitleStorageFile */ any {
                    throw new Error('shimmed function TitleStorageFile.getGlobalFileFromPath');
                }

            }
            export class TitleStorageFileCollection {
                items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.TitleStorage.TitleStorageFile, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            }
            export enum TitleStorageMatchCondition {
                notUsed,
                ifMatch,
                ifNotMatch,
            }
            export class TitleStorageService {
                static getUserQuotaAsync(xuid: number, titleGroupId: string): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.TitleStorage.UserTitleStorageQuota, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function TitleStorageService.getUserQuotaAsync');
                }

                static getUserFilesAsync(skipItems: number, maxItems: number, xuid: number, titleGroupId: string, path: string, previousPage: /* Microsoft.Xbox.TitleStorage.TitleStorageFileCollection */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.TitleStorage.TitleStorageFileCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function TitleStorageService.getUserFilesAsync');
                }

                static getGlobalFilesAsync(skipItems: number, maxItems: number, titleGroupId: string, path: string, previousPage: /* Microsoft.Xbox.TitleStorage.TitleStorageFileCollection */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.TitleStorage.TitleStorageFileCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function TitleStorageService.getGlobalFilesAsync');
                }

                static readToStreamAsync(storageFile: /* Microsoft.Xbox.TitleStorage.TitleStorageFile */ any, matchCondition: TitleStorageMatchCondition, select: string): /* Windows.Foundation.IAsyncOperation`1[[Windows.Storage.Streams.IRandomAccessStream, Windows, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function TitleStorageService.readToStreamAsync');
                }

                static writeFromStreamAsync(storageFile: /* Microsoft.Xbox.TitleStorage.TitleStorageFile */ any, data: /* Windows.Storage.Streams.IRandomAccessStream */ any, matchCondition: TitleStorageMatchCondition, preferredBlockSize: number): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function TitleStorageService.writeFromStreamAsync');
                }

                static readToBufferAsync(storageFile: /* Microsoft.Xbox.TitleStorage.TitleStorageFile */ any, matchCondition: TitleStorageMatchCondition, select: string): /* Windows.Foundation.IAsyncOperation`1[[Windows.Storage.Streams.IBuffer, Windows, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                    throw new Error('shimmed function TitleStorageService.readToBufferAsync');
                }

                static writeFromBufferAsync(storageFile: /* Microsoft.Xbox.TitleStorage.TitleStorageFile */ any, data: /* Windows.Storage.Streams.IBuffer */ any, matchCondition: TitleStorageMatchCondition, preferredBlockSize: number): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function TitleStorageService.writeFromBufferAsync');
                }

                static deleteAsync(storageFile: /* Microsoft.Xbox.TitleStorage.TitleStorageFile */ any, matchCondition: TitleStorageMatchCondition): /* Windows.Foundation.IAsyncAction */ any {
                    throw new Error('shimmed function TitleStorageService.deleteAsync');
                }

            }
            export class UserTitleStorageQuota {
                quotaBytesForUnverifiedStorage: number;
                quotaBytesForVerifiedStorage: number;
                usedBytesInUnverifiedStorage: number;
                usedBytesInVerifiedStorage: number;
            }
        }
        export enum TitleType {
            system,
            standard,
            demo,
            arcade,
            application = 5,
        }
        export class User {
            identity: /* Microsoft.Xbox.Foundation.UserIdentity */ any;
            status: /* Microsoft.Xbox.UserStatus */ any;
            getProfileAsync(): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.UserProfile, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.getProfileAsync');
            }

            getFriendsAsync(): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.UserCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.getFriendsAsync');
            }

            getAchievementsAsync(skipItems: number, maxItems: number, unlockedOnly: Boolean, previousPage: /* Microsoft.Xbox.AchievementCollection */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.AchievementCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.getAchievementsAsync');
            }

            unlockAchievementAsync(achievementId: number): /* Windows.Foundation.IAsyncAction */ any {
                throw new Error('shimmed function User.unlockAchievementAsync');
            }

            getAvatarManifestAsync(): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.AvatarManifest, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.getAvatarManifestAsync');
            }

            postUserMessageAsync(message: /* Microsoft.Xbox.UserMessage */ any): /* Windows.Foundation.IAsyncAction */ any {
                throw new Error('shimmed function User.postUserMessageAsync');
            }

            getUserMessagesAsync(skipItems: number, maxItems: number, previousPage: /* Microsoft.Xbox.UserMessageCollection */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.UserMessageCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.getUserMessagesAsync');
            }

            getUserMessagesForTitleAsync(titleId: number, skipItems: number, maxItems: number, previousPage: /* Microsoft.Xbox.UserMessageCollection */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.UserMessageCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.getUserMessagesForTitleAsync');
            }

            deleteUserMessageAsync(messageId: string): /* Windows.Foundation.IAsyncAction */ any {
                throw new Error('shimmed function User.deleteUserMessageAsync');
            }

            createMultiplayerSessionAsync(settings: /* Microsoft.Xbox.Multiplayer.MultiplayerSessionSettings */ any, playersCanBeRemovedBy: Microsoft.Xbox.Multiplayer.PlayerAcl): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.MultiplayerSession, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.createMultiplayerSessionAsync');
            }

            joinMultiplayerSessionAsync(sessionId: string, seatIndex: number, customUserData: /* Windows.Storage.Streams.IRandomAccessStream */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.MultiplayerSession, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.joinMultiplayerSessionAsync');
            }

            joinMultiplayerSessionWithBufferAsync(sessionId: string, seatIndex: number, customUserData: /* Windows.Storage.Streams.IBuffer */ any): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.MultiplayerSession, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.joinMultiplayerSessionWithBufferAsync');
            }

            getMultiplayerSessionSummariesAsync(titleId: number, titleGroupId: string, mode: number, includeSessions: MultiplayerSessionState, includeLastMsgInQueue: MultiplayerMessageQueue): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Multiplayer.MultiplayerSessionSummaryCollection, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                throw new Error('shimmed function User.getMultiplayerSessionSummariesAsync');
            }

            canPerformActionAsync(action: string, targetXuid: number): /* Windows.Foundation.IAsyncOperation`1[[System.Int32, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]] */ any {
                throw new Error('shimmed function User.canPerformActionAsync');
            }

        }
        export enum UserAction {
            blocked,
            allowed,
        }
        export class UserCollection {
            items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.User, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
        }
        export class UserMessage {
            expiration: Date;
            id: string;
            recipients: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.Recipient, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
            senderGamertag: string;
            sent: Date;
            titleId: number;
            getMultiplayerMessageData(): /* Microsoft.Xbox.MultiplayerMessageData */ any {
                throw new Error('shimmed function UserMessage.getMultiplayerMessageData');
            }

        }
        export class UserMessageCollection {
            items: /* System.Collections.Generic.IReadOnlyList`1[[Microsoft.Xbox.UserMessage, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any;
        }
        export class UserProfile {
            avatarImageUrl: string;
            bio: string;
            gamerPictureUrl: string;
            gamerscore: number;
            gamertag: string;
            hasAvatar: Boolean;
            location: string;
            membershipLevel: MembershipType;
            motto: string;
            name: string;
            reputation: number;
            smallGamerPictureUrl: string;
        }
        export enum UserRelation {
            none,
            anyFriend,
            mutualFriend,
            friendRequester,
            friendRequestee,
        }
        export class UserStatus {
            deviceType: string;
            isOnline: Boolean;
            lastActivity: Date;
            relation: UserRelation;
            richPresence: string;
            titleId: number;
        }
        export class XboxLIVEService {
            static serviceClient: Microsoft.Xbox.Foundation.ServiceClient = new Microsoft.Xbox.Foundation.ServiceClient();
            static signedInUserIdentity: /* Microsoft.Xbox.Foundation.UserIdentity */ any;
            static signInAsync(): /* Windows.Foundation.IAsyncOperation`1[[Microsoft.Xbox.Foundation.UserIdentity, Microsoft.Xbox, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime]] */ any {
                return new IAsyncOperation((resolve, reject) => {
                    reject();
                })
            }

            static signOutAsync(): /* Windows.Foundation.IAsyncAction */ any {
                throw new Error('shimmed function XboxLIVEService.signOutAsync');
            }

            static invalidateCacheGroup(eGroup: CacheGroup): void {
                console.warn('shimmed function XboxLIVEService.invalidateCacheGroup');
            }

            static showGamesApplicationAsync(eAction: LaunchAction): /* Windows.Foundation.IAsyncAction */ any {
                throw new Error('shimmed function XboxLIVEService.showGamesApplicationAsync');
            }

            static addEventListener(name: string, handler: Function) {
                switch (name) {
                    case "signedout":
                        break;
                }

            }
        }
    }
}
