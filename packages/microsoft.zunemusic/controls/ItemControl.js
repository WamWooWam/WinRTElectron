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
                var SelectionInformation = (function() {
                        function SelectionInformation(source, item) {
                            this.source = source;
                            this.item = item
                        }
                        return SelectionInformation
                    })();
                Controls.SelectionInformation = SelectionInformation;
                var SelectionAggregator = (function(_super) {
                        __extends(SelectionAggregator, _super);
                        function SelectionAggregator(domElement) {
                            _super.call(this);
                            this.domElement = domElement;
                            this._eventBindings = null;
                            this._selectedItem = null;
                            this._selectingItem = false;
                            this._eventBindings = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {
                                itemselected: this._handleItemSelection.bind(this), itemdeselected: this._handleItemDeselection.bind(this)
                            })
                        }
                        SelectionAggregator.prototype.unload = function() {
                            if (this._eventBindings)
                                this._eventBindings.cancel()
                        };
                        SelectionAggregator.prototype.clear = function() {
                            this._setSelectedItem(null)
                        };
                        Object.defineProperty(SelectionAggregator.prototype, "selectedItem", {
                            get: function() {
                                if (!this._selectedItem)
                                    return null;
                                return this._selectedItem.item
                            }, enumerable: true, configurable: true
                        });
                        SelectionAggregator.prototype._setSelectedItem = function(item) {
                            if (!this._selectingItem) {
                                this._selectingItem = true;
                                this._deselectCurrentItem();
                                this.updateAndNotify("selectedItem", item);
                                this._selectingItem = false
                            }
                        };
                        SelectionAggregator.prototype._handleItemSelection = function(e) {
                            if (!e.selectedItem)
                                return;
                            this._setSelectedItem(new SelectionInformation(e.srcElement, e.selectedItem))
                        };
                        SelectionAggregator.prototype._deselectCurrentItem = function() {
                            var oldSelection = this._selectedItem && this._selectedItem.source && this._selectedItem.source.winControl;
                            if (oldSelection && oldSelection.deselect)
                                oldSelection.deselect()
                        };
                        SelectionAggregator.prototype._handleItemDeselection = function(e) {
                            this._deselectCurrentItem();
                            this._setSelectedItem(null)
                        };
                        return SelectionAggregator
                    })(MS.Entertainment.UI.Framework.ObservableBase);
                Controls.SelectionAggregator = SelectionAggregator;
                var AppBarSelectionManager = (function() {
                        function AppBarSelectionManager(_domElement) {
                            this._domElement = _domElement;
                            this._selectionAggregator = null;
                            this._selectionAppBarActions = null;
                            this._selectionEventBindings = null;
                            this._selectionChangingEventBindings = null;
                            this._navigationBindings = null;
                            this._selectionAggregator = new SelectionAggregator(this._domElement);
                            this._ensureSelectionActionHostInitialized();
                            this._selectionEventBindings = MS.Entertainment.Utilities.addEventHandlers(this._selectionAggregator, {selectedItemChanged: function handleSelectedItemChanged(e) {
                                    if (e.detail && e.detail.newValue && e.detail.newValue.item) {
                                        if (this._clearGallerySelection)
                                            MS.Entertainment.UI.Controls.GalleryControl.searchAndApply(this._domElement, this._clearGallerySelection.bind(this));
                                        this._ensureSelectionActionHostInitialized();
                                        this._selectionAppBarActions.mediaItem = e.detail.newValue.item
                                    }
                                    else
                                        this.clearSelection()
                                }.bind(this)});
                            this._selectionChangingEventBindings = MS.Entertainment.Utilities.addEventHandlers(this._domElement, {selectionchanging: function handleGallerySelection(e) {
                                    if (e && e.detail && e.detail.newSelection && e.detail.newSelection.count())
                                        this.clearSelection()
                                }.bind(this)}, true);
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            this._navigationBindings = WinJS.Binding.bind(navigationService, {currentPage: this.clearSelection.bind(this)})
                        }
                        AppBarSelectionManager.prototype._clearGallerySelection = function(gallery) {
                            if (gallery) {
                                gallery.clearSelection();
                                gallery.clearInvocation()
                            }
                        };
                        AppBarSelectionManager.prototype._ensureSelectionActionHostInitialized = function() {
                            if (!this._selectionAppBarActions) {
                                this._selectionAppBarActions = new MS.Entertainment.ViewModels.SmartAppbarActionHost;
                                this._selectionAppBarActions.addSelectionHandlers(MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(this.clearSelection.bind(this)))
                            }
                        };
                        AppBarSelectionManager.prototype.clearSelection = function() {
                            if (this._selectionAggregator)
                                this._selectionAggregator.clear();
                            if (this._selectionAppBarActions) {
                                this._selectionAppBarActions.dispose();
                                this._selectionAppBarActions = null
                            }
                        };
                        AppBarSelectionManager.prototype.dispose = function() {
                            if (this._selectionAggregator) {
                                this._selectionAggregator.unload();
                                this._selectionAggregator = null
                            }
                            if (this._selectionEventBindings) {
                                this._selectionEventBindings.cancel();
                                this._selectionEventBindings = null
                            }
                            if (this._selectionChangingEventBindings) {
                                this._selectionChangingEventBindings.cancel();
                                this._selectionChangingEventBindings = null
                            }
                            if (this._navigationBindings) {
                                this._navigationBindings.cancel();
                                this._navigationBindings = null
                            }
                        };
                        return AppBarSelectionManager
                    })();
                Controls.AppBarSelectionManager = AppBarSelectionManager;
                var ItemControl = (function() {
                        function ItemControl(domElement, options) {
                            this.domElement = domElement;
                            this._startY = 0;
                            this._wasTouched = false;
                            this._shouldSelect = false;
                            this.selected = false;
                            this.disabled = false;
                            this.selectionTemplate = "/Controls/ItemControlSelection.html#itemControlSelection";
                            WinJS.UI.setOptions(this, options);
                            var handlePointerDown = this._handlePointerDown.bind(this);
                            this._eventBindings = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {
                                mouseup: this._handleMouseUp.bind(this), keydown: this._handleKeyDown.bind(this), MSPointerDown: handlePointerDown, pointerdown: handlePointerDown
                            });
                            this._handleClick = this._handleClick.bind(this);
                            this.domElement.addEventListener("click", this._handleClick, true)
                        }
                        Object.defineProperty(ItemControl.prototype, "recognizer", {
                            get: function() {
                                if (!this._recognizer) {
                                    this._recognizer = new Windows.UI.Input.GestureRecognizer;
                                    this._recognizer.showGestureFeedback = false;
                                    var thresholds = this._recognizer.crossSlideThresholds;
                                    thresholds.selectionStart = WinJS.UI._VERTICAL_SWIPE_SELECTION_THRESHOLD;
                                    thresholds.speedBumpStart = WinJS.UI._VERTICAL_SWIPE_SPEED_BUMP_START + thresholds.selectionStart;
                                    thresholds.speedBumpEnd = WinJS.UI._VERTICAL_SWIPE_SPEED_BUMP_END + thresholds.speedBumpStart;
                                    thresholds.rearrangeStart = null;
                                    this._recognizer.crossSlideThresholds = thresholds;
                                    this._recognizer.crossSlideHorizontally = false;
                                    this._recognizer.gestureSettings = Windows.UI.Input.GestureSettings.crossSlide | Windows.UI.Input.GestureSettings.manipulationTranslateY;
                                    this._recognizerEventBindings = MS.Entertainment.Utilities.addEventHandlers(this._recognizer, {crosssliding: this._handleCrossSliding.bind(this)})
                                }
                                return this._recognizer
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(ItemControl.prototype, "_selectionTemplate", {
                            get: function() {
                                if (!this.__selectionTemplate)
                                    this.__selectionTemplate = MS.Entertainment.UI.Framework.loadTemplate(this.selectionTemplate, null, true);
                                return this.__selectionTemplate
                            }, enumerable: true, configurable: true
                        });
                        ItemControl.prototype.unload = function() {
                            this.deselect();
                            if (this._eventBindings) {
                                this._eventBindings.cancel();
                                this._eventBindings = null
                            }
                            if (this._temporaryEventBindings) {
                                this._temporaryEventBindings.cancel();
                                this._temporaryEventBindings = null
                            }
                            if (this._recognizerEventBindings) {
                                this._recognizerEventBindings.cancel();
                                this._recognizerEventBindings = null
                            }
                            this.domElement.removeEventListener("click", this._handleClick, true);
                            this._unloadBaseCalled = true
                        };
                        ItemControl.prototype.select = function() {
                            if (this.selected || !this.domElement)
                                return;
                            this.selected = true;
                            WinJS.Utilities.addClass(this.domElement, "selected");
                            this._selectionTemplate.then(function(a) {
                                var container = MS.Entertainment.UI.Controls.ItemControl.getSelectionContainer();
                                this._selectionTree = container;
                                return a.render(null, container).then(function() {
                                        this.domElement.appendChild(container)
                                    }.bind(this))
                            }.bind(this));
                            var event = document.createEvent("Event");
                            event.initEvent("itemselected", true, true);
                            event.selectedItem = this.context;
                            this.domElement.dispatchEvent(event)
                        };
                        ItemControl.getSelectionContainer = function() {
                            var selectionContainer = document.createElement("div");
                            WinJS.Utilities.addClass(selectionContainer, "selectionContainer");
                            return selectionContainer
                        };
                        ItemControl.prototype.deselect = function() {
                            if (!this.selected)
                                return;
                            this.selected = false;
                            if (this._selectionTree && this._selectionTree.parentElement) {
                                this._selectionTree.parentElement.removeChild(this._selectionTree);
                                this._selectionTree = null
                            }
                            if (!this.domElement)
                                return;
                            WinJS.Utilities.removeClass(this.domElement, "selected");
                            var event = document.createEvent("Event");
                            event.initEvent("itemdeselected", true, true);
                            this.domElement.dispatchEvent(event)
                        };
                        ItemControl.prototype._toggleSelection = function() {
                            if (this.selected)
                                this.deselect();
                            else
                                this.select()
                        };
                        ItemControl.prototype._handleMouseUp = function(e) {
                            if (this.disabled)
                                return;
                            if (e.button !== MS.Entertainment.UI.Framework.RIGHT_MOUSEBUTTON)
                                return;
                            e.stopPropagation();
                            this._toggleSelection()
                        };
                        ItemControl.prototype._handleClick = function(e) {
                            if (this._wasTouched) {
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                                e.preventDefault()
                            }
                        };
                        ItemControl.prototype._handleKeyDown = function(e) {
                            if (this.disabled)
                                return;
                            if (e.keyCode !== WinJS.Utilities.Key.space)
                                return;
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            e.preventDefault();
                            this._toggleSelection()
                        };
                        ItemControl.prototype._attachTemporaryPointerEvents = function() {
                            if (this._temporaryEventBindings)
                                this._temporaryEventBindings.cancel();
                            var handlePointerMove = this._handlePointerMove.bind(this);
                            var handlePointerUp = this._handlePointerUp.bind(this);
                            var handlePointerCancel = this._handlePointerCancel.bind(this);
                            this._temporaryEventBindings = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {
                                MSPointerMove: handlePointerMove, pointermove: handlePointerMove, MSPointerUp: handlePointerUp, pointerup: handlePointerUp, MSPointerCancel: handlePointerCancel, pointercancel: handlePointerCancel
                            })
                        };
                        ItemControl.prototype._handlePointerDown = function(e) {
                            if (this.disabled)
                                return;
                            this._wasTouched = false;
                            var p = Windows.UI.Input.PointerPoint.getCurrentPoint(e.pointerId);
                            var touch = (p.pointerDevice.pointerDeviceType === Windows.Devices.Input.PointerDeviceType.touch);
                            if (!touch)
                                return;
                            this._attachTemporaryPointerEvents();
                            this._startY = p.position.y;
                            this.domElement.msSetPointerCapture(p.pointerId);
                            try {
                                this.recognizer.processDownEvent(p)
                            }
                            catch(e) {}
                        };
                        ItemControl.prototype._handlePointerMove = function(e) {
                            var ips = Windows.UI.Input.PointerPoint.getIntermediatePoints(e.pointerId);
                            try {
                                this.recognizer.processMoveEvents(ips)
                            }
                            catch(e) {}
                            {}
                        };
                        ItemControl.prototype._handlePointerUp = function(e) {
                            var p = Windows.UI.Input.PointerPoint.getCurrentPoint(e.pointerId);
                            try {
                                this.recognizer.processUpEvent(p)
                            }
                            catch(e) {}
                            if (this._temporaryEventBindings)
                                this._temporaryEventBindings.cancel()
                        };
                        ItemControl.prototype._handlePointerCancel = function(e) {
                            try {
                                this.recognizer.completeGesture()
                            }
                            catch(e) {}
                            {};
                            if (this._temporaryEventBindings)
                                this._temporaryEventBindings.cancel()
                        };
                        ItemControl.prototype._handleCrossSliding = function(e) {
                            this._wasTouched = true;
                            switch (e.crossSlidingState) {
                                case Windows.UI.Input.CrossSlidingState.completed:
                                    if (this._shouldSelect)
                                        this._toggleSelection();
                                    this.domElement.style.transform = String.empty;
                                    this.domElement.style.transitionProperty = "";
                                    this.domElement.offsetParent.style.zIndex = "";
                                    break;
                                default:
                                    this.domElement.offsetParent.style.zIndex = "10";
                                    this.domElement.style.transitionProperty = "fakeProperty";
                                    this.domElement.style.transform = "translateY(" + (e.position.y - this._startY) + "px)";
                                    break
                            }
                            if (e.crossSlidingState > Windows.UI.Input.CrossSlidingState.dragging)
                                this._shouldSelect = true;
                            else
                                this._shouldSelect = false
                        };
                        return ItemControl
                    })();
                Controls.ItemControl = ItemControl
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.ItemControl)
