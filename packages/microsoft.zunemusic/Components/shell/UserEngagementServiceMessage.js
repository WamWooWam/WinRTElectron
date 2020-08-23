/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Framework");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {UserEngagementServiceMessage: MS.Entertainment.UI.Framework.defineUserControl("/Components/Shell/UserEngagementServiceMessage.html#userEngagementServiceMessage", function(element, options) {
            if (this.userMessageResponse) {
                this.titleText = this.userMessageResponse.dashboardTitle;
                this.subText = this.userMessageResponse.dashboardSubtitle;
                this.imageUrl = this.userMessageResponse.image;
                if (this.userMessageResponse.infoExternalLink && this.userMessageResponse.infoExternalLinkLabel) {
                    this.externalLinkUrl = this.userMessageResponse.infoExternalLink;
                    this.externalLinkLabel = this.userMessageResponse.infoExternalLinkLabel
                }
                this.deepLinkLocation = options.userMessageResponse.deepLinkLocation
            }
        }, {
            _userEngagementService: null, initialize: function initialize(){}, messageClicked: function messageClicked(e) {
                    if (this.deepLinkLocation)
                        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(this.deepLinkLocation)).then(function sendClickData() {
                            if (!this._userEngagementService)
                                this._userEngagementService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userEngagementService);
                            this._userEngagementService.postToServiceFrameMessageClicked();
                            var telemetryParameterArray = [{
                                        parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.MessageText, parameterValue: this.titleText
                                    }, {
                                        parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.Location, parameterValue: this.deepLinkLocation
                                    }];
                            MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.UserEngagementMessageClick, telemetryParameterArray)
                        }.bind(this), function launchUriFailed() {
                            MS.Entertainment.UI.Framework.fail("Failed to launch uri: " + this.deepLinkLocation)
                        }.bind(this))
                }, linkClicked: function linkClicked(e) {
                    if (this.externalLinkUrl) {
                        var telemetryParameterArray = [{
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.MessageText, parameterValue: this.titleText
                                }];
                        MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.UserEngagementExternalLinkClicked, telemetryParameterArray);
                        window.open(this.externalLinkUrl, "_blank");
                        e.stopPropagation()
                    }
                }
        }, {
            userMessageResponse: null, titleText: String.empty, subText: String.empty, imageUrl: null, externalLinkUrl: null, externalLinkLabel: String.empty, deepLinkLocation: null
        })})
})()
