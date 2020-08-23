/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Controls) {
                var EpisodeDetails = (function(_super) {
                        __extends(EpisodeDetails, _super);
                        function EpisodeDetails(element, options) {
                            _super.call(this, element, options);
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this)
                        }
                        EpisodeDetails.prototype.onFooterLinkClicked = function(event) {
                            var foundElement = this.domElement.querySelector(".videoDetails-footer");
                            if (foundElement && MS.Entertainment.Utilities.isInvocationEvent(event))
                                foundElement.scrollIntoView()
                        };
                        EpisodeDetails.isDeclarativeControlContainer = true;
                        return EpisodeDetails
                    })(Controls.PageViewBase);
                Controls.EpisodeDetails = EpisodeDetails
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.EpisodeDetails)
