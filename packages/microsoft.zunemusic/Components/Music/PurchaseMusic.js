/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Purchase");
    WinJS.Namespace.define("MS.Entertainment.Purchase", {
        MusicPurchaseFlowProvider: MS.Entertainment.UI.Framework.define(null, {getPurchaseFlow: function getPurchaseFlow(mediaItem, serviceId, target, purchaseType, offerId, returnUri, gamerTag) {
                var purchaseUrl = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_ModernPurchase) + "/Purchase?client=x13";
                var taskId = MS.Entertainment.UI.Controls.WebHost.TaskId.MUSIC;
                var purchaseExp;
                if (mediaItem.mediaType === MS.Entertainment.Data.Query.edsMediaType.subscription)
                    purchaseExp = new MS.Entertainment.Purchase.PurchaseSubscription;
                else
                    purchaseExp = new MS.Entertainment.Purchase.PurchaseMusic;
                return {
                        purchaseExp: purchaseExp, purchaseUrl: purchaseUrl, taskId: taskId
                    }
            }}, {factory: function factory() {
                return new MS.Entertainment.Purchase.MusicPurchaseFlowProvider
            }}), PurchaseMusic: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.WebHostExperience", function PurchaseMusic_constructor() {
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this);
                this.addMedia = MS.Entertainment.Platform.PurchaseHelpers.addMedia;
                this.downloadMedia = MS.Entertainment.Platform.PurchaseHelpers.downloadMedia
            }, {
                mediaItem: null, offerIds: null, addMedia: null, downloadMedia: null, startListener: function startListener() {
                        var trace = String.empty;
                        if (!this.disposed)
                            this.eventProvider.tracePurchaseFlowMusic_Start(trace);
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.startListener.apply(this, arguments)
                    }, _onPurchaseSuccess: function _onPurchaseSuccess(messageStruct) {
                        MS.Entertainment.UI.assert(messageStruct.receipt, "Success message doesn't contain a valid receipt");
                        var offerIds = this.offerIds;
                        if (messageStruct.offerIds && messageStruct.offerIds.length > 0)
                            offerIds = messageStruct.offerIds;
                        var mediaAddedEventHandler = this.onMediaAddedEvent;
                        MS.Entertainment.UI.assert(this.mediaItem, "Purchase Flow got a null mediaItem");
                        if (this.mediaItem) {
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            if (actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.showPurchaseConfirmationFlyout)) {
                                var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showPurchaseConfirmationFlyout);
                                action.execute()
                            }
                            var serviceId = this.mediaItem.serviceId;
                            this.eventProvider.tracePurchaseFlowMusic_Finish(serviceId);
                            var that = this;
                            this.addMedia(that.mediaItem, offerIds, true).then(function addComplete(dbItems) {
                                if (dbItems) {
                                    if (mediaAddedEventHandler)
                                        mediaAddedEventHandler();
                                    var containsMusicTracks = false;
                                    var containsMusicVideos = false;
                                    for (var i = 0; i < dbItems.dbMediaTypes.length; i++)
                                        if (dbItems.dbMediaTypes[i] === Microsoft.Entertainment.Queries.ObjectType.video)
                                            containsMusicVideos = true;
                                        else if (dbItems.dbMediaTypes[i] === Microsoft.Entertainment.Queries.ObjectType.track)
                                            containsMusicTracks = true;
                                    var isBundleAlbum = containsMusicTracks && containsMusicVideos;
                                    that.downloadMedia(that.mediaItem, dbItems.dbMediaIds, dbItems.dbMediaTypes, isBundleAlbum, true)
                                }
                            })
                        }
                    }, messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                        var offerId = String.empty;
                        var errorCode = String.empty;
                        if (!this.disposed)
                            switch (messageStruct.verb) {
                                case"CLOSE_DIALOG":
                                    switch (messageStruct.reason) {
                                        case"CANCEL":
                                            this.eventProvider.tracePurchaseFlowMusic_Cancel(String.empty);
                                            break;
                                        case"ERROR":
                                            this.eventProvider.tracePurchaseFlowMusic_Error(String.empty, messageStruct.errorCode);
                                            break;
                                        case"REJECTION":
                                            this.eventProvider.tracePurchaseFlowMusic_Rejection(String.empty, messageStruct.errorCode);
                                            break
                                    }
                                    break;
                                case"done":
                                    switch (messageStruct.status) {
                                        case"cancel":
                                            this.eventProvider.tracePurchaseFlowMusic_Cancel(String.empty);
                                            break;
                                        case"success":
                                            if (messageStruct.receipt)
                                                this._onPurchaseSuccess(messageStruct);
                                            break
                                    }
                                    break;
                                case"CONTENT_ADDED":
                                    this._onPurchaseSuccess(messageStruct);
                                    break
                            }
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments)
                    }
            }, {factory: function factory() {
                    return new MS.Entertainment.Purchase.PurchaseMusic
                }}), PurchaseSubscription: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.WebHostExperience", function PurchaseSubscription_constructor() {
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this)
            }, {
                mediaItem: null, startListener: function startListener() {
                        if (!this.disposed)
                            this.eventProvider.traceSubscriptionSignup_Start(String.empty);
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.startListener.apply(this, arguments)
                    }, messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                        if (!this.disposed)
                            switch (messageStruct.verb) {
                                case"done":
                                    switch (messageStruct.status) {
                                        case"cancel":
                                            this.eventProvider.traceSubscriptionSignup_Cancel(String.empty);
                                            break;
                                        case"success":
                                            this.eventProvider.traceSubscriptionSignup_Finish(String.empty);
                                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                            signIn.refreshSignInState();
                                            MS.Entertainment.Utilities.Telemetry.logSubscriptionSignupPurchaseMade(this.mediaItem);
                                            break;
                                        default:
                                            break
                                    }
                                    break;
                                default:
                                    break
                            }
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments)
                    }
            })
    })
})()
