//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var MAX_ITEMS = 500,
        util = AppMagic.Utility,
        DropDownListViewModel = WinJS.Class.derive(util.Disposable, function DropDownListViewModel_ctor(controlContext) {
            util.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._id = controlContext.id;
            this._properties = controlContext.properties;
            this._behaviors = controlContext.behaviors;
            this._element = controlContext.element;
            this._openState = controlContext.openState;
            this._visible = ko.observable(!1);
            this._top = ko.observable("0px");
            this._left = ko.observable("0px");
            this._width = ko.observable("0px");
            this._borderThickness = controlContext.modelProperties.BorderThickness;
            this._selectedIndexOnFlyoutOpen = null;
            this.track("_selectedValue", ko.computed(function() {
                return this._properties.Selected() ? this._properties.Selected().Value : ""
            }, this));
            this.track("_isDisabled", ko.computed(function() {
                return this._properties.Disabled() || controlContext.controlWidget.isParentDisabled(controlContext)
            }, this));
            this.track("_currentItems", ko.computed(this._computeItemsArray.bind(this, controlContext)))
        }, {
            _id: null, _currentItems: null, _selectedIndexOnFlyoutOpen: null, _properties: null, _behaviors: null, _openState: null, _visible: null, _top: null, _left: null, _width: null, _element: null, _isDisabled: null, _selectedValue: null, _mouseDownCallback: null, _mouseWheelCallbackNode: null, properties: {get: function() {
                        return this._properties
                    }}, top: {
                    get: function() {
                        return this._top
                    }, set: function(value) {
                            this._top = value
                        }
                }, left: {
                    get: function() {
                        return this._left
                    }, set: function(value) {
                            this._left = value
                        }
                }, width: {
                    get: function() {
                        return this._width
                    }, set: function(value) {
                            this._width = value
                        }
                }, visible: {
                    get: function() {
                        return this._visible()
                    }, set: function(value) {
                            this._visible(value)
                        }
                }, selectedValue: {get: function() {
                        return this._selectedValue()
                    }}, currentItems: {get: function() {
                        return this._currentItems()
                    }}, isDisabled: {get: function() {
                        return this._isDisabled()
                    }}, _computeItemsArray: function(controlContext) {
                    if (this._currentItems)
                        for (var j = 0, currentItemsLength = this._currentItems().length; j < currentItemsLength; j++)
                            this._currentItems()[j].dispose();
                    var defaultItemsArray = controlContext.properties.Items(),
                        itemsArray = [];
                    if (!defaultItemsArray)
                        return itemsArray;
                    for (var i = 0, defaultItemsLength = defaultItemsArray.length; i < defaultItemsLength; i++) {
                        var item = defaultItemsArray[i],
                            currentItem;
                        currentItem = item === null ? {
                            Value: null, index: i, _src: null
                        } : {
                            Value: item.Value, index: i, _src: item._src
                        };
                        currentItem.Value || (currentItem.Value = null);
                        currentItem.index === MAX_ITEMS && (currentItem.Value = AppMagic.Strings.ControlMaxItemLimitReached);
                        var currentItemViewModel = new AppMagic.Controls.DropDownListItemViewModel(currentItem, !1, controlContext);
                        if (itemsArray.push(currentItemViewModel), currentItem.index === MAX_ITEMS)
                            break
                    }
                    return itemsArray
                }, onClickLabel: function() {
                    this.isDisabled || (this._openState === AppMagic.Constants.DialogState.closed ? this.openFlyout() : this.closeFlyout(), this._behaviors.OnSelect())
                }, onKeyDownItem: function(dropDownListViewModel, keyEvent) {
                    if (keyEvent.key === AppMagic.Constants.Keys.enter) {
                        this.closeFlyout();
                        return
                    }
                    var lastSelectedItem = this.properties.Selected(),
                        skipCount = null;
                    if (lastSelectedItem) {
                        switch (keyEvent.key) {
                            case AppMagic.Constants.Keys.down:
                                skipCount = 1;
                                keyEvent.stopPropagation();
                                break;
                            case AppMagic.Constants.Keys.up:
                                skipCount = -1;
                                keyEvent.stopPropagation();
                                break;
                            case AppMagic.Constants.Keys.pageDown:
                                skipCount = this._getSkipCount();
                                break;
                            case AppMagic.Constants.Keys.pageUp:
                                skipCount = -this._getSkipCount();
                                break;
                            case AppMagic.Constants.Keys.right:
                            case AppMagic.Constants.Keys.left:
                                keyEvent.stopPropagation();
                                break
                        }
                        skipCount && this._updateSelectionsOnKeydown(lastSelectedItem.index + skipCount)
                    }
                }, onClickItem: function(dropDownListItemViewModel) {
                    var clonedItem = this._cloneItem(dropDownListItemViewModel);
                    this.properties.Selected(clonedItem);
                    this.closeFlyout()
                }, _cloneItem: function(item) {
                    return {
                            Value: item.value, index: item.index, _src: item._src
                        }
                }, _getSkipCount: function() {
                    var dropDownListElement = this._element.firstElementChild;
                    var listOffsetHeight = dropDownListElement.offsetHeight,
                        dropDownListItemElement = dropDownListElement.firstElementChild;
                    var listItemOffsetHeight = dropDownListItemElement.offsetHeight,
                        skipCount = listOffsetHeight / listItemOffsetHeight - 1;
                    return Math.floor(skipCount)
                }, _updateSelectionsOnKeydown: function(newIndex) {
                    newIndex = Core.Utility.clamp(newIndex, 0, this.currentItems.length - 1);
                    var lastSelectedItem = this.properties.Selected();
                    if (lastSelectedItem.index !== newIndex) {
                        var itemToSelect = this.currentItems[newIndex],
                            clonedItem = this._cloneItem(itemToSelect);
                        this.currentItems.forEach(function(entry) {
                            entry.hasFocus = entry.index === itemToSelect.index ? !0 : !1
                        });
                        this.properties.Selected(clonedItem)
                    }
                }, onChangeSelectedItem: function(controlContext) {
                    var items = this.currentItems,
                        selectedItem = controlContext.properties.Selected();
                    if (selectedItem)
                        for (var i = 0, itemsLength = items.length; i < itemsLength; i++) {
                            var item = items[i];
                            item.selected = item.index === selectedItem.index ? !0 : !1
                        }
                }, openFlyout: function() {
                    if (this._openState !== AppMagic.Constants.DialogState.opened) {
                        var selected = this.properties.Selected();
                        this._selectedIndexOnFlyoutOpen = selected ? selected.index : null;
                        this._openState = AppMagic.Constants.DialogState.opened;
                        this._visible(!0);
                        var dropdownControlElement = document.getElementById(this._id.toString());
                        this._positionNode(dropdownControlElement);
                        this._addMouseDownHandler();
                        this._addMouseWheelHandler();
                        this.currentItems.forEach(function(entry) {
                            this.properties.Selected() && entry.index === this.properties.Selected().index && (entry.hasFocus = !0)
                        }.bind(this))
                    }
                }, _positionNode: function(dropdownControlElement) {
                    for (var referenceNode = dropdownControlElement, offsetTop = this._borderThickness.getValue() / 2, offsetLeft = this._borderThickness.getValue() / 2; referenceNode !== null && !referenceNode.classList.contains("canvasContainer") && referenceNode.id !== "publishedCanvas"; )
                        offsetTop += referenceNode.offsetTop,
                        offsetLeft += referenceNode.offsetLeft,
                        offsetTop -= referenceNode.scrollTop,
                        offsetLeft -= referenceNode.scrollLeft,
                        referenceNode = referenceNode.parentNode;
                    var height = referenceNode.offsetHeight;
                    this._element.offsetHeight + offsetTop > height && (offsetTop = height - this._element.offsetHeight);
                    this.top(offsetTop.toString() + "px");
                    this.left(offsetLeft.toString() + "px");
                    var flyoutWidth = dropdownControlElement.offsetWidth + this._borderThickness.getValue();
                    this.width(flyoutWidth.toString() + "px")
                }, closeFlyout: function() {
                    if (this._openState !== AppMagic.Constants.DialogState.closed) {
                        var selected = this.properties.Selected();
                        selected && selected.index !== this._selectedIndexOnFlyoutOpen && this._behaviors.OnChange();
                        this._visible(!1);
                        this._openState = AppMagic.Constants.DialogState.closed;
                        this._removeMouseDownHandler();
                        this._removeMouseWheelHandler();
                        this.currentItems.forEach(function(entry) {
                            entry.hasFocus = !1
                        })
                    }
                }, _onMouseDown: function(evt) {
                    Core.Utility.isDefined(evt.target.classList) && (evt.target.classList.contains("appmagic-dropdownListItem") || evt.target.classList.contains("appmagic-dropdownList")) || this.closeFlyout()
                }, _onMouseWheel: function() {
                    this.closeFlyout()
                }, _addMouseDownHandler: function() {
                    this._eventTracker.addCapture(document.body, "mousedown", this._onMouseDown, this)
                }, _removeMouseDownHandler: function() {
                    this._mouseDownCallback && this._eventTracker.remove(document.body, "mousedown");
                    this._mouseDownCallback = null
                }, _addMouseWheelHandler: function() {
                    this._mouseWheelCallbackNode = [];
                    for (var ref = document.getElementById(this._id.toString()); ref !== null && !this.isDisposed; )
                        (ref.scrollWidth > ref.clientWidth || ref.scrollHeight > ref.clientHeight) && (this._eventTracker.addCapture(ref, "mousewheel", this._onMouseWheel, this), this._mouseWheelCallbackNode.push(ref)),
                        ref = ref.parentElement
                }, _removeMouseWheelHandler: function() {
                    if (this._mouseWheelCallbackNode !== null && !this.isDisposed) {
                        for (var i = 0, callbackLength = this._mouseWheelCallbackNode.length; i < callbackLength; i++)
                            this._eventTracker.remove(this._mouseWheelCallbackNode[i], "mousewheel");
                        this._mouseWheelCallbackNode = []
                    }
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {DropDownListViewModel: DropDownListViewModel})
})();