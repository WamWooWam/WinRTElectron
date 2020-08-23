/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        BaseHeroViewModel: MS.Entertainment.deferredDerive(MS.Entertainment.Utilities.EventInvoker, function baseHeroViewModel(mediaItem) {
            this.base();
            this.mediaItem = mediaItem
        }, {
            mediaItem: null, buttons: null, actionDescription: null, sessionId: null, heroImageMediaItem: null, _addButtons: function _addButtons(buttons) {
                    var buttonKey;
                    if (!this.buttons)
                        this.buttons = new MS.Entertainment.ObservableArray([]);
                    if (buttons)
                        for (buttonKey in buttons)
                            if (buttons.hasOwnProperty(buttonKey) && buttons[buttonKey])
                                this.buttons.push(buttons[buttonKey])
                }
        }), BaseImmersiveListViewModel: MS.Entertainment.defineObservable(function baseImmersiveListViewModelConstructor(){}, {
                items: null, heroItem: null, heroActionItem: null, selectedTemplate: null, columnSpan: 2, maxItems: 8, _heroAugmentation: null, _setItems: function _setItems(data) {
                        if (Array.isArray(data) && data.length)
                            if (this.columnSpan > 1) {
                                this.items = data.length > 1 ? data.slice(1, this.maxItems) : [];
                                this.heroItem = data[0] ? this._createHeroItem(data[0]) : null;
                                this.heroActionItem = data[0]
                            }
                            else
                                this.items = data.slice(0, this.maxItems)
                    }, _createHeroItem: function _createHeroItem(item) {
                        if (this._heroAugmentation)
                            return MS.Entertainment.Data.augment(item || {}, this._heroAugmentation);
                        else
                            return item
                    }
            })
    })
})()
