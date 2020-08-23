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
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var Music2NowPlayingVisualization = (function(_super) {
                        __extends(Music2NowPlayingVisualization, _super);
                        function Music2NowPlayingVisualization(element, options) {
                            this.templateStorage = "/Controls/Music2/NowPlayingVisualization.html";
                            this.templateName = "NowPlayingVisualization";
                            _super.call(this, element, options);
                            this._bindingsAndEventHandlers = []
                        }
                        Music2NowPlayingVisualization.prototype.initialize = function() {
                            _super.prototype.initialize.call(this);
                            this.animationOffsets = ["25% 25%", "50% 25%", "75% 25%", "25% 50%", "50% 50%", "75% 50%"];
                            this.animationClass = "imageCollageLargeArt";
                            if (this.dataContext)
                                this._nowPlayingMetadataVisibleChanged({detail: {newValue: this.dataContext.nowPlayingMetadataVisible}})
                        };
                        Music2NowPlayingVisualization.prototype.unload = function() {
                            this._detachBindingsAndEventHandlers();
                            _super.prototype.unload.call(this)
                        };
                        Music2NowPlayingVisualization.prototype._detachBindingsAndEventHandlers = function() {
                            if (this._bindingsAndEventHandlers) {
                                this._bindingsAndEventHandlers.forEach(function(cancelable) {
                                    cancelable.cancel()
                                });
                                this._bindingsAndEventHandlers = []
                            }
                        };
                        Music2NowPlayingVisualization.prototype._showRelatedItemAnimation = function() {
                            var _this = this;
                            return WinJS.Promise.timeout().then(function() {
                                    return _super.prototype._showRelatedItemAnimation.call(_this)
                                })
                        };
                        Music2NowPlayingVisualization.prototype._setDataContext = function(value) {
                            _super.prototype._setDataContext.call(this, value);
                            this._detachBindingsAndEventHandlers();
                            this._bindingsAndEventHandlers.push(MS.Entertainment.Utilities.addEventHandlers(this.dataContext, {nowPlayingMetadataVisibleChanged: this._nowPlayingMetadataVisibleChanged.bind(this)}));
                            this._nowPlayingMetadataVisibleChanged({detail: {newValue: this.dataContext.nowPlayingMetadataVisible}})
                        };
                        Music2NowPlayingVisualization.prototype._nowPlayingMetadataVisibleChanged = function(evt) {
                            var showNowPlayingMetadata = evt.detail.newValue;
                            if (this._nowPlayingMetadata)
                                if (showNowPlayingMetadata)
                                    MS.Entertainment.Utilities.showElement(this._nowPlayingMetadata);
                                else
                                    MS.Entertainment.Utilities.hideElement(this._nowPlayingMetadata)
                        };
                        return Music2NowPlayingVisualization
                    })(MS.Entertainment.UI.Controls.BaseNowPlayingVisualization);
                Controls.Music2NowPlayingVisualization = Music2NowPlayingVisualization
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.Music2NowPlayingVisualization)
