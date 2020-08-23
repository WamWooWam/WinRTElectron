/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Purchase");
    WinJS.Namespace.define("MS.Entertainment.Purchase", {
        VideoPurchaseFlowProvider: MS.Entertainment.UI.Framework.define(null, {getPurchaseFlow: function getPurchaseFlow(mediaItem, serviceId, target, purchaseType, offerId, returnUri, gamerTag) {
                if (mediaItem.mediaType !== Microsoft.Entertainment.Queries.ObjectType.video && mediaItem.mediaType !== Microsoft.Entertainment.Queries.ObjectType.tvSeason) {
                    MS.Entertainment.Purchase.fail("Expected movie, episode or season media for Video purchase flow.");
                    return null
                }
                var purchaseExp = null;
                var purchaseUrl = String.empty;
                var taskId = String.empty;
                if (MS.Entertainment.Utilities.isDrmIndividualized) {
                    var type = String.empty;
                    var extraParam = String.empty;
                    if (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason) {
                        serviceId = (mediaItem.seriesZuneId && mediaItem.seriesZuneId !== MS.Entertainment.Utilities.EMPTY_GUID) ? mediaItem.seriesZuneId : mediaItem.seriesId;
                        extraParam = "&seasonNumber=" + mediaItem.seasonNumber;
                        type = MS.Entertainment.Platform.PurchaseHelpers.TV_SEASON_TYPE
                    }
                    else if (mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.tvEpisode)
                        type = MS.Entertainment.Platform.PurchaseHelpers.TV_EPISODE_TYPE;
                    else if (mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.movie)
                        type = MS.Entertainment.Platform.PurchaseHelpers.MOVIE_TYPE;
                    else {
                        MS.Entertainment.Purchase.fail("Unsupported video type.");
                        return null
                    }
                    purchaseUrl = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_ModernPurchase) + "/Purchase?client=x13";
                    if (purchaseType)
                        purchaseUrl = purchaseUrl + "&purchaseAction=" + purchaseType;
                    purchaseExp = new MS.Entertainment.Purchase.PurchaseVideo;
                    taskId = MS.Entertainment.UI.Controls.WebHost.TaskId.VIDEO
                }
                else
                    MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_PURCHASE_ERROR_CAPTION), 0x8004b822);
                return {
                        purchaseExp: purchaseExp, purchaseUrl: purchaseUrl, taskId: taskId
                    }
            }}, {factory: function factory() {
                return new MS.Entertainment.Purchase.VideoPurchaseFlowProvider
            }}), PurchaseVideo: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.WebHostExperience", function PurchaseVideo_constructor() {
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this);
                this.addMedia = MS.Entertainment.Platform.PurchaseHelpers.addMedia;
                this.downloadMedia = MS.Entertainment.Platform.PurchaseHelpers.downloadMedia
            }, {
                mediaItem: null, offerIds: null, addMedia: null, downloadMedia: null, dbItems: null, downloadWhenAdded: false, startListener: function startListener() {
                        var trace = String.empty;
                        if (!this.disposed)
                            this.eventProvider.tracePurchaseFlowVideo_Start(trace);
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.startListener.apply(this, arguments)
                    }, _onPurchaseSuccess: function _onPurchaseSuccess(messageStruct) {
                        MS.Entertainment.UI.assert(messageStruct.receipt, "Success message doesn't contain a valid receipt");
                        var offerIds = this.offerIds;
                        var offerId = String.empty;
                        var errorCode = String.empty;
                        if (messageStruct.offerIds)
                            offerIds = messageStruct.offerIds;
                        if (offerIds && offerIds.length > 0)
                            offerId = offerIds[0];
                        this.eventProvider.tracePurchaseFlowVideo_Finish(offerId);
                        var that = this;
                        MS.Entertainment.UI.assert(this.mediaItem, "Purchase Flow got a null mediaItem");
                        if (this.mediaItem) {
                            MS.Entertainment.Platform.PurchaseHelpers.downloadClosedCaptionFiles(this.mediaItem);
                            this.addMedia(this.mediaItem, offerIds, true).then(function addComplete(dbItems) {
                                that.dbItems = dbItems;
                                that.mediaItem.rights.forEach(function(right) {
                                    if (right.offerId === offerId)
                                        if (right.licenseRight === MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.rent && right.deliveryFormat === MS.Entertainment.Data.Augmenter.Marketplace.edsDeliveryFormat.download)
                                            that.downloadWhenAdded = true
                                });
                                if (that.downloadWhenAdded)
                                    that.downloadMedia(that.mediaItem, dbItems.dbMediaIds, dbItems.dbMediaTypes, false, true)
                            })
                        }
                    }, _onDialogDone: function _onDialogDone(messageStruct) {
                        var offerIds = this.offerIds;
                        var offerId = null;
                        if (messageStruct.offerIds)
                            offerIds = messageStruct.offerIds;
                        if (offerIds && offerIds.length > 0)
                            offerId = offerIds[0];
                        if (offerId)
                            this.eventProvider.tracePurchaseFlowVideo_Done(String.empty, offerId)
                    }, messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                        if (!this.disposed)
                            switch (messageStruct.verb) {
                                case"CLOSE_DIALOG":
                                    switch (messageStruct.reason) {
                                        case"CANCEL":
                                            this.eventProvider.tracePurchaseFlowVideo_Cancel(String.empty);
                                            break;
                                        case"ERROR":
                                            this.eventProvider.tracePurchaseFlowVideo_Error(String.empty, messageStruct.errorCode);
                                            break;
                                        case"REJECTION":
                                            this.eventProvider.tracePurchaseFlowVideo_Rejection(String.empty, messageStruct.errorCode);
                                            break;
                                        case"SUCCESS":
                                            this._onDialogDone(messageStruct);
                                            break
                                    }
                                    break;
                                case"error":
                                    this.eventProvider.tracePurchaseFlowVideo_Error(String.empty, messageStruct.description);
                                    break;
                                case"done":
                                    if (messageStruct.status === "cancel")
                                        this.eventProvider.tracePurchaseFlowVideo_Cancel(String.empty);
                                    else if (messageStruct.status === "success" && messageStruct.receipt) {
                                        this._onPurchaseSuccess(messageStruct);
                                        this._onDialogDone(messageStruct)
                                    }
                                    break;
                                case"CONTENT_ADDED":
                                    this._onPurchaseSuccess(messageStruct);
                                    break;
                                case"BANDWIDTH_CHECK":
                                    this.eventProvider.tracePurchaseFlowVideo_Start_Bandwidth_Test(String.empty);
                                    this.startBandwidthTest(this.mediaItem, sendMessageFunc);
                                    break
                            }
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments)
                    }, startBandwidthTest: function startBandwidthTest(mediaItem, sendMessageFunc) {
                        var videoFileUrl = String.empty;
                        if (mediaItem.rights)
                            for (var i = 0; i < mediaItem.rights.length; i++) {
                                var licenseRight = mediaItem.rights[i].licenseRight;
                                if (licenseRight === "PurchaseStream" || licenseRight === "RentStream") {
                                    videoFileUrl = mediaItem.rights[i].videoFileUrl;
                                    if (videoFileUrl && videoFileUrl !== String.empty)
                                        break
                                }
                            }
                        if (videoFileUrl && videoFileUrl !== String.empty) {
                            var bandwidthTest = new Microsoft.Entertainment.Platform.Playback.MBRBandwidthTest;
                            bandwidthTest.start(videoFileUrl).then(function testFinished(rate) {
                                sendMessageFunc("BANDWIDTH_TEST_FINISH " + rate)
                            }, function testError(error) {
                                sendMessageFunc("BANDWIDTH_TEST_ERROR " + " 1")
                            }, function testProgress(progress) {
                                sendMessageFunc("BANDWIDTH_TEST_PROGRESS " + (progress * 100))
                            })
                        }
                        else
                            sendMessageFunc("BANDWIDTH_TEST_FINISH 1000")
                    }
            }, {factory: function factory() {
                    return new MS.Entertainment.Purchase.PurchaseVideo
                }})
    })
})()
