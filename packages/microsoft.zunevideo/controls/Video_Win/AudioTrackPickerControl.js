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
                var AudioTrackPickerControlItem = (function(_super) {
                        __extends(AudioTrackPickerControlItem, _super);
                        function AudioTrackPickerControlItem(element, options) {
                            this.item = null;
                            this.templateStorage = "/Controls/Video_Win/AudioTrackPickerControl.html";
                            this.templateName = "templateid-audioTrackPickerItem";
                            _super.call(this, element, options)
                        }
                        AudioTrackPickerControlItem.prototype.initialize = function() {
                            if (this.item && this.item.itemSelectedHandler && this.item.selected)
                                this.item.itemSelectedHandler(this)
                        };
                        AudioTrackPickerControlItem.prototype.onClick = function(e) {
                            if (this.item && this.item.itemSelectedHandler)
                                this.item.itemSelectedHandler(this)
                        };
                        AudioTrackPickerControlItem.prototype.updateSelectedState = function(selected) {
                            if (this.item)
                                this.item.selected = selected;
                            if (selected)
                                WinJS.Utilities.addClass(this._itemElement, "state_selected");
                            else
                                WinJS.Utilities.removeClass(this._itemElement, "state_selected")
                        };
                        return AudioTrackPickerControlItem
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.AudioTrackPickerControlItem = AudioTrackPickerControlItem;
                var AudioTrackPicker = (function(_super) {
                        __extends(AudioTrackPicker, _super);
                        function AudioTrackPicker(element, options) {
                            this.templateStorage = "/Controls/Video_Win/AudioTrackPickerControl.html";
                            this.templateName = "templateid-audioTrackPicker";
                            _super.call(this, element, options)
                        }
                        Object.defineProperty(AudioTrackPicker.prototype, "audioTracks", {
                            get: function() {
                                return this._audioTracks
                            }, set: function(value) {
                                    this.updateAndNotify("audioTracks", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(AudioTrackPicker.prototype, "_selectedAudioTrackPickerControlItem", {
                            get: function() {
                                return this._selectedAudioTrackPickerControlItemValue
                            }, set: function(value) {
                                    if (this._selectedAudioTrackPickerControlItemValue)
                                        this._selectedAudioTrackPickerControlItem.updateSelectedState(false);
                                    this._selectedAudioTrackPickerControlItemValue = value;
                                    if (this._selectedAudioTrackPickerControlItemValue)
                                        this._selectedAudioTrackPickerControlItemValue.updateSelectedState(true);
                                    this._sessionManager.nowPlayingSession.selectAudioTrack(value.item.index)
                                }, enumerable: true, configurable: true
                        });
                        AudioTrackPicker.prototype.initialize = function() {
                            this._uiStateEventHandlers = null;
                            if (!this._sessionManager)
                                this._sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            this._updateAudioTracks();
                            this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._uiStateService, {
                                windowresize: this._onUiStateChange.bind(this), isSnappedChanged: this._onUiStateChange.bind(this)
                            });
                            _super.prototype.initialize.call(this)
                        };
                        AudioTrackPicker.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            if (this._uiStateEventHandlers) {
                                this._uiStateEventHandlers.cancel();
                                this._uiStateEventHandlers = null
                            }
                        };
                        AudioTrackPicker.prototype._updateAudioTracks = function() {
                            if (!this.audioTracks) {
                                var rawAudioTracks = this._sessionManager.nowPlayingSession.getAudioTracks();
                                var audioTrackItems = [];
                                if (rawAudioTracks)
                                    for (var i = 0; i < rawAudioTracks.length; i++) {
                                        var rawAudioTrack = rawAudioTracks.item(i);
                                        audioTrackItems.push(this._createAudioTrackItem(rawAudioTrack, i))
                                    }
                                this.audioTracks = new Entertainment.ObservableArray(audioTrackItems);
                                this._audioTracksList.dataSource = this.audioTracks
                            }
                        };
                        AudioTrackPicker.prototype._createAudioTrackItem = function(rawAudioTrack, trackIndex) {
                            var ordinalPosition = trackIndex + 1;
                            var trackInfo = rawAudioTrack.label || this._getDisplayLanguage(rawAudioTrack) || String.empty;
                            var audioTrackTitle;
                            if (trackInfo)
                                audioTrackTitle = String.load(String.id.IDS_VIDEO_NOW_PLAYING_AUDIO_TRACK_LABEL_EXTENDED).format(ordinalPosition, trackInfo);
                            else
                                audioTrackTitle = String.load(String.id.IDS_VIDEO_NOW_PLAYING_AUDIO_TRACK_LABEL).format(ordinalPosition);
                            var selectedAudioTrack = this._sessionManager.nowPlayingSession.getSelectedAudioTrack();
                            return WinJS.Binding.as({item: {
                                        index: trackIndex, label: audioTrackTitle, selected: (selectedAudioTrack === trackIndex), selectable: true, itemSelectedHandler: this._handleAudioTrackItemSelected.bind(this)
                                    }})
                        };
                        AudioTrackPicker.prototype._getDisplayLanguage = function(rawAudioTrack) {
                            var originalLanguage = rawAudioTrack.language;
                            var twoLetterLanguageCode = MS.Entertainment.Utilities.Iso639ThreeLetterToTwoLetterLanguageMap[originalLanguage];
                            var displayLanguage = Entertainment.Utilities.getDisplayLanguageFromLanguageCode(originalLanguage) || Entertainment.Utilities.getDisplayLanguageFromLanguageCode(twoLetterLanguageCode) || originalLanguage;
                            return (displayLanguage !== "und") ? displayLanguage : String.empty
                        };
                        AudioTrackPicker.prototype._handleAudioTrackItemSelected = function(selectedAudioTrackPickerControlItem) {
                            if (selectedAudioTrackPickerControlItem && selectedAudioTrackPickerControlItem.item)
                                this._selectedAudioTrackPickerControlItem = selectedAudioTrackPickerControlItem
                        };
                        AudioTrackPicker.prototype._onUiStateChange = function() {
                            var domEvent = document.createEvent("Event");
                            domEvent.initEvent("dismissoverlay", true, true);
                            this.domElement.dispatchEvent(domEvent)
                        };
                        return AudioTrackPicker
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.AudioTrackPicker = AudioTrackPicker
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.AudioTrackPicker)
