/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Framework");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {
        UserEngagementService: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Framework.ObservableBase", function UserEngagementService() {
            this._signInHandler = this._signInHandler.bind(this)
        }, {
            _serviceEndpointFrame: null, _signInEventHandlers: null, _signInService: null, _configManager: null, _anid: null, userEngagementMessageContent: null, _receiveMessage: null, initialize: function initialize() {
                    this._signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this._configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    this._signInService.bind("isSignedIn", this._signInHandler);
                    this._receiveMessage = function receiveMessage(event) {
                        if (event.origin !== MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_UserEngagementService))
                            return;
                        else if (event.data)
                            try {
                                var serviceResponse = JSON.parse(event.data);
                                this._validateAndDisplayEngagementMessage(serviceResponse)
                            }
                            catch(error) {
                                MS.Entertainment.UI.Framework.fail("Unable to JSON.parse result message from user engagement service.")
                            }
                    }.bind(this);
                    window.addEventListener("message", this._receiveMessage, false)
                }, dispose: function dispose() {
                    this._signInService.unbind("isSignedIn", this._signInHandler);
                    window.removeEventListener("message", this._receiveMessage, false)
                }, _signInHandler: function _signInHandler() {
                    if (this._signInService.isSignedIn)
                        this._signInComplete();
                    else
                        this._signOutComplete()
                }, _signInComplete: function _signInComplete() {
                    if (!this._serviceEndpointFrame) {
                        this._serviceEndpointFrame = document.createElement("iframe");
                        WinJS.Utilities.addClass(this._serviceEndpointFrame, "removeFromDisplay");
                        document.body.appendChild(this._serviceEndpointFrame)
                    }
                    var userAnid = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).getUserAnid();
                    if (userAnid) {
                        this.userEngagementMessageContent = null;
                        this._setupEndpointFrame(userAnid)
                    }
                }, _signOutComplete: function _signOutComplete() {
                    if (this._serviceEndpointFrame) {
                        this._serviceEndpointFrame.src = String.empty;
                        this._serviceEndpointFrame = null;
                        this.dispatchEvent("hideUserEngagementServiceVisuals")
                    }
                    this.userEngagementMessageContent = null;
                    this._anid = null
                }, _setupEndpointFrame: function _setupEndpointFrame(userAnid) {
                    if (!this._serviceEndpointFrame)
                        return;
                    this._serviceEndpointFrame.src = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_UserEngagementService) + this._configManager.service.userEngagementUrlEnd + "?ANID=" + userAnid + "&MARKET=" + MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).locale
                }, postToServiceFrameMessageClicked: function postToServiceFrameMessageClicked() {
                    if (this._serviceEndpointFrame)
                        this._serviceEndpointFrame.contentWindow.postMessage("click", MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_UserEngagementService))
                }, _validateAndDisplayEngagementMessage: function _validateAndDisplayEngagementMessage(serviceResponse) {
                    if (!(serviceResponse && serviceResponse.dashboardTitle && serviceResponse.collectionViewMessage))
                        return;
                    var parsedDeepLinkUri = null;
                    var parsedExternalLinkUri = null;
                    if (serviceResponse.deepLinkLocation) {
                        try {
                            parsedDeepLinkUri = Windows.Foundation.Uri(serviceResponse.deepLinkLocation)
                        }
                        catch(e) {
                            MS.Entertainment.UI.Framework.fail("Failed to turn deep link location into uri " + serviceResponse.deepLinkLocation);
                            return
                        }
                        var validDeepLinkPrefix = false;
                        if (MS.Entertainment.UI.UserEngagementService.validDeeplinkLocations.indexOf(parsedDeepLinkUri.schemeName) >= 0)
                            validDeepLinkPrefix = true;
                        if (!validDeepLinkPrefix) {
                            MS.Entertainment.UI.Framework.fail("Invalid DeepLink location prefix in user engagement service: " + serviceResponse.deepLinkLocation);
                            return
                        }
                    }
                    if (serviceResponse.infoExternalLink) {
                        try {
                            parsedExternalLinkUri = Windows.Foundation.Uri(serviceResponse.infoExternalLink)
                        }
                        catch(e) {
                            MS.Entertainment.UI.Framework.fail("Failed to turn info external link into uri " + serviceResponse.infoExternalLink);
                            return
                        }
                        var validExternalLinkPrefix = false;
                        if (MS.Entertainment.UI.UserEngagementService.validExternalLinkLocations.indexOf(parsedExternalLinkUri.schemeName) >= 0)
                            validExternalLinkPrefix = true;
                        if (!validExternalLinkPrefix) {
                            MS.Entertainment.UI.Framework.fail("Invalid external location prefix in user engagement service: " + serviceResponse.infoExternalLink);
                            return
                        }
                    }
                    var telemetryParameterArray = [{
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.MessageText, parameterValue: serviceResponse.dashboardTitle
                            }, {
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.Location, parameterValue: serviceResponse.deepLinkLocation
                            }];
                    MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.UserEngagementMessageDisplayed, telemetryParameterArray);
                    this.userEngagementMessageContent = serviceResponse;
                    this._dispatchMessageDisplayEvent()
                }, _dispatchMessageDisplayEvent: function _dispatchMessageDisplayEvent() {
                    this.dispatchEvent("displayUserEngagementServiceVisuals");
                    if (!this._listNotificationService)
                        this._listNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.listNotification);
                    var notification = new MS.Entertainment.UI.Notification;
                    var category = MS.Entertainment.UI.NotificationCategoryEnum.userEngagementContent;
                    notification.category = category;
                    notification.icon = category.icon;
                    notification.title = this.userEngagementMessageContent.collectionViewMessage;
                    notification.action = MS.Entertainment.UI.Actions.ActionIdentifiers.userEngagementCollectionMessage;
                    notification.actionParams = {serviceMessage: this.userEngagementMessageContent};
                    notification.dismissAction = MS.Entertainment.UI.Actions.ActionIdentifiers.notificationClear;
                    this._listNotificationService.send(notification)
                }
        }, {
            validDeeplinkLocations: ["microsoftmusic", "ms-windows-store", "http", "https"], validExternalLinkLocations: ["http", "https"]
        }), collectionMessageNavigate: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function collectionMessageNavigateConstructor() {
                this.base()
            }, {
                automationId: MS.Entertainment.UI.AutomationIds.navigate, serviceMessage: null, _userEngagementService: null, executed: function executed(params) {
                        if (this.serviceMessage && this.serviceMessage.deepLinkLocation)
                            Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(this.serviceMessage.deepLinkLocation)).done(function sendClickData() {
                                if (!this._userEngagementService)
                                    this._userEngagementService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userEngagementService);
                                this._userEngagementService.postToServiceFrameMessageClicked();
                                var telemetryParameterArray = [{
                                            parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.MessageText, parameterValue: this.serviceMessage.collectionViewMessage
                                        }, {
                                            parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.Location, parameterValue: this.serviceMessage.deepLinkLocation
                                        }];
                                MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.UserEngagementCollectionMessageClicked, telemetryParameterArray)
                            }.bind(this), function launchUriFailed() {
                                MS.Entertainment.UI.Framework.fail("Failed to launch uri: " + this.serviceMessage.deepLinkLocation)
                            }.bind(this))
                    }, canExecute: function canExecute() {
                        return (this.serviceMessage && this.serviceMessage.deepLinkLocation)
                    }
            })
    });
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.userEngagementCollectionMessage, function() {
        return new MS.Entertainment.UI.collectionMessageNavigate
    });
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.userEngagementService, function createUserEngagementService() {
        return new MS.Entertainment.UI.UserEngagementService
    })
})()
