/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TimelineEvent: MS.Entertainment.UI.Framework.defineUserControl("/Controls/TransportControls/TimelineEvent.html#template", function(element, options){}, {
            initialize: function initialize() {
                this.bind("event", this._updateValues.bind(this))
            }, _updateValues: function _updateValues() {
                    if (this.event) {
                        this.eventText = this.event.text;
                        this.eventTitle = this.event.title;
                        this.imageThumbnail = this.event.imageThumbnail !== String.empty ? this.event.imageThumbnail : null;
                        this.eventPositionText = MS.Entertainment.Utilities.millisecondsToTimeCode(MS.Entertainment.UI.Controls.TimelineEvent.parseEventTime(this.event.startTime))
                    }
                }, parseEventTime: function parseEventTime(strVal) {
                    var parts = strVal.split(":");
                    if (parts.length === 3) {
                        var ms = parseInt(parts[0]) * (60 * 60 * 1000);
                        ms += parseInt(parts[1]) * (60 * 1000);
                        ms += parseInt(parts[2]) * (1000);
                        return ms
                    }
                    else
                        return 0
                }, eventClicked: function eventClicked() {
                    if (this.onInvoked)
                        this.onInvoked(this.event)
                }
        }, {
            event: null, eventTitle: "", eventText: "", imageThumbnail: null, eventPositionText: "", onInvoked: null
        })})
})()
