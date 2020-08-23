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
                var MSEUIControls = MS.Entertainment.UI.Controls;
                var ClosedCaptionPickerControlItem = (function(_super) {
                        __extends(ClosedCaptionPickerControlItem, _super);
                        function ClosedCaptionPickerControlItem(element, options) {
                            this.item = null;
                            this.templateStorage = "/Controls/Video_Win/ClosedCaptionPickerControl.html";
                            this.templateName = "templateid-closedCaptionPickerItem";
                            _super.call(this, element, options)
                        }
                        ClosedCaptionPickerControlItem.prototype.initialize = function() {
                            if (this.item && this.item.itemSelectedHandler && this.item.selected)
                                this.item.itemSelectedHandler(this)
                        };
                        ClosedCaptionPickerControlItem.prototype.onClick = function(e) {
                            if (this.item && this.item.itemSelectedHandler)
                                this.item.itemSelectedHandler(this)
                        };
                        ClosedCaptionPickerControlItem.prototype.updateSelectedState = function(selected) {
                            if (this.item)
                                this.item.selected = selected;
                            if (selected)
                                WinJS.Utilities.addClass(this._itemElement, "state_selected");
                            else
                                WinJS.Utilities.removeClass(this._itemElement, "state_selected")
                        };
                        return ClosedCaptionPickerControlItem
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.ClosedCaptionPickerControlItem = ClosedCaptionPickerControlItem;
                var ClosedCaptionPicker = (function(_super) {
                        __extends(ClosedCaptionPicker, _super);
                        function ClosedCaptionPicker(element, options) {
                            this.templateStorage = "/Controls/Video_Win/ClosedCaptionPickerControl.html";
                            this.templateName = "templateid-closedCaptionPicker";
                            _super.call(this, element, options)
                        }
                        ClosedCaptionPicker.prototype.initialize = function() {
                            if (!this._sessionManager)
                                this._sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            this._processCaptionLanguagesList()
                        };
                        Object.defineProperty(ClosedCaptionPicker.prototype, "_selectedClosedCaptionPickerControlItem", {
                            get: function() {
                                return this._selectedClosedCaptionPickerControlItemValue
                            }, set: function(value) {
                                    if (this._selectedClosedCaptionPickerControlItemValue)
                                        this._selectedClosedCaptionPickerControlItem.updateSelectedState(false);
                                    this._selectedClosedCaptionPickerControlItemValue = value;
                                    if (this._selectedClosedCaptionPickerControlItemValue)
                                        this._selectedClosedCaptionPickerControlItemValue.updateSelectedState(true)
                                }, enumerable: true, configurable: true
                        });
                        ClosedCaptionPicker.prototype._createClosedCaptionPickerItem = function(closedCaption) {
                            var selectedLcid = this._sessionManager.nowPlayingSession.ccLcid;
                            return WinJS.Binding.as({item: {
                                        lcid: closedCaption.lcid, label: closedCaption.name, selected: (selectedLcid === closedCaption.lcid), selectable: true, itemSelectedHandler: this._handleClosedCaptionItemSelected.bind(this)
                                    }})
                        };
                        ClosedCaptionPicker.prototype._handleClosedCaptionItemSelected = function(selectedClosedCaptionPickerControlItem) {
                            if (selectedClosedCaptionPickerControlItem && selectedClosedCaptionPickerControlItem.item) {
                                if (selectedClosedCaptionPickerControlItem.item.lcid && selectedClosedCaptionPickerControlItem.item.lcid !== MSEUIControls.ClosedCaptionPicker.closedCaptionOffLcid) {
                                    this._sessionManager.nowPlayingSession.closedCaptionsOn = true;
                                    this._sessionManager.nowPlayingSession.ccLcid = selectedClosedCaptionPickerControlItem.item.lcid
                                }
                                else {
                                    this._sessionManager.nowPlayingSession.closedCaptionsOn = false;
                                    this._sessionManager.nowPlayingSession.ccLcid = String.empty
                                }
                                this._selectedClosedCaptionPickerControlItem = selectedClosedCaptionPickerControlItem;
                                if (selectedClosedCaptionPickerControlItem.item.selectable)
                                    MSEUIControls.ClosedCaptionPicker._saveCaptionsLcidToSettings(selectedClosedCaptionPickerControlItem.item.lcid)
                            }
                        };
                        ClosedCaptionPicker.prototype._processCaptionLanguagesList = function() {
                            var _this = this;
                            var filteredClosedCaptions = MSEUIControls.ClosedCaptionPicker._getCaptionItems(this._sessionManager);
                            var closedCaptionItems = filteredClosedCaptions.map(function(closedCaption) {
                                    return _this._createClosedCaptionPickerItem(closedCaption)
                                });
                            closedCaptionItems.push(WinJS.Binding.as({item: {
                                    lcid: MSEUIControls.ClosedCaptionPicker.closedCaptionOffLcid, label: closedCaptionItems.length > 0 ? MSEUIControls.ClosedCaptionPicker.closedCaptionOffLcid : String.load(String.id.IDS_TRANSPORT_CONTROLS_CLOSED_CAPTION_NOT_AVAILABLE), selected: !this._sessionManager.nowPlayingSession.closedCaptionsOn, selectable: closedCaptionItems.length > 0 ? true : false, itemSelectedHandler: this._handleClosedCaptionItemSelected.bind(this)
                                }}));
                            this._closedCaptionLanguagesList.dataSource = new MS.Entertainment.ObservableArray(closedCaptionItems)
                        };
                        ClosedCaptionPicker._getCaptionItems = function(sessionManager) {
                            var filteredClosedCaptions;
                            if (sessionManager) {
                                var mediaItem = sessionManager.nowPlayingSession.currentMedia;
                                filteredClosedCaptions = sessionManager.nowPlayingSession.filterClosedCaptions(mediaItem)
                            }
                            return filteredClosedCaptions
                        };
                        ClosedCaptionPicker.loadCaptionsLcidFromSettings = function() {
                            var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                            if (settingsStorage.values["preferredCaptionLanguage"]) {
                                var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                                var filteredClosedCaptions = MSEUIControls.ClosedCaptionPicker._getCaptionItems(sessionManager);
                                var preferredLcid = String.empty;
                                var fallbackLcid = String.empty;
                                filteredClosedCaptions.forEach(function(value, index, array) {
                                    if (value.lcid === settingsStorage.values["preferredCaptionLanguage"])
                                        preferredLcid = value.lcid;
                                    if (value.lcid === "1033")
                                        fallbackLcid = value.lcid
                                });
                                if (preferredLcid !== String.empty)
                                    return preferredLcid;
                                if (fallbackLcid !== String.empty)
                                    return fallbackLcid
                            }
                            return String.empty
                        };
                        ClosedCaptionPicker._saveCaptionsLcidToSettings = function(ccLcid) {
                            var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                            if (ccLcid !== MSEUIControls.ClosedCaptionPicker.closedCaptionOffLcid)
                                settingsStorage.values["preferredCaptionLanguage"] = ccLcid;
                            else
                                settingsStorage.values.remove("preferredCaptionLanguage")
                        };
                        ClosedCaptionPicker.closedCaptionOffLcid = "Off";
                        return ClosedCaptionPicker
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.ClosedCaptionPicker = ClosedCaptionPicker
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.ClosedCaptionPicker)
