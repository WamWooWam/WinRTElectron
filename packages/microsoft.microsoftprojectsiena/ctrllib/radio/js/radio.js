//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        MAX_LEN = 50;
    function setColorEventHandlers(childNode, viewModel) {
        var setColor = function(elem, themeColorValue) {
                if (viewModel.viewState.disabled() || themeColorValue === null)
                    return !0;
                var color = AppMagic.Utility.Color.create(themeColorValue);
                var label = elem.querySelector("div.appmagic-radio-label");
                return label.style.color = color.toCss(), !0
            },
            addEvent = function(eventName, handler) {
                var bindedHandler = handler.bind(viewModel, childNode);
                childNode.addEventListener(eventName, bindedHandler, !1);
                ko.utils.domNodeDisposal.addDisposeCallback(childNode, function() {
                    document.removeEventListener(eventName, bindedHandler, !0)
                }.bind(viewModel))
            },
            mouseOverHandler = function(elem) {
                return setColor(elem, viewModel.modelProperties.HoverColor.getValue())
            },
            mouseoutHandler = function(elem) {
                return setColor(elem, viewModel.modelProperties.Color.getValue())
            },
            mouseDownHandler = function(elem) {
                return setColor(elem, viewModel.modelProperties.PressedColor.getValue())
            };
        addEvent("mouseover", mouseOverHandler);
        addEvent("mouseout", mouseoutHandler);
        addEvent("mousedown", mouseDownHandler);
        addEvent("mouseup", mouseOverHandler)
    }
    ko.bindingHandlers.items = {
        init: function() {
            return {controlsDescendantBindings: !0}
        }, update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                AppMagic.AuthoringTool.DomUtil.empty(element);
                var values = ko.utils.unwrapObservable(valueAccessor());
                if (values !== null) {
                    var len = values.length;
                    if (!(len > 0) || !values[0] || typeof values[0].Value != "undefined") {
                        var tooManyItems = len > MAX_LEN;
                        tooManyItems && (len = MAX_LEN);
                        for (var tempElement = document.createElement("div"), i = 0; i < len; i++)
                            if (values[i])
                                for (var childBindingContext = bindingContext.createChildContext(values[i]), template = ko.renderTemplate("appmagic-radio-template", childBindingContext, {name: "appmagic-radio-template"}, tempElement); tempElement.firstElementChild; ) {
                                    var childNode = tempElement.firstElementChild;
                                    setColorEventHandlers(childNode, viewModel);
                                    tempElement.removeChild(childNode);
                                    element.appendChild(childNode)
                                }
                        if (tooManyItems) {
                            var maxLimitMessage = document.createElement("div"),
                                errorEntry = AppMagic.Utility.clone(values[MAX_LEN], !0);
                            errorEntry.Value = AppMagic.Strings.ControlMaxItemLimitReached;
                            var errorChildBindingContext = bindingContext.createChildContext(errorEntry),
                                errorTemplate = ko.renderTemplate("appmagic-radio-template", errorChildBindingContext, {name: "appmagic-radio-template"}, maxLimitMessage);
                            maxLimitMessage.children[0].style.paddingTop = "10px";
                            maxLimitMessage.children[0].children[0].removeChild(maxLimitMessage.children[0].children[0].children[0]);
                            element.appendChild(maxLimitMessage.firstElementChild)
                        }
                    }
                }
            }
    };
    var Radio = WinJS.Class.define(function Radio_ctor(){}, {
            initControlContext: function(controlContext) {
                util.createOrSetPrivate(controlContext, "_setSelectedItemByString", this._setSelectedItemByString);
                util.createOrSetPrivate(controlContext, "_currentSelected", null);
                util.createOrSetPrivate(controlContext, "currentSelectedRowItem", {});
                util.createOrSetPrivate(controlContext, "handleClick", this.handleClick.bind(this, controlContext));
                util.createOrSetPrivate(controlContext, "_valueChanged", !1);
                util.createOrSetPrivate(controlContext, "checkedValue", ko.observable(""));
                util.createOrSetPrivate(controlContext, "_id", util.generateRandomId("radio"))
            }, initView: function(container, controlContext) {
                    controlContext._valueChanged ? controlContext.checkedValue(controlContext._currentSelected.Value) : controlContext.checkedValue(controlContext.modelProperties.Default.getValue());
                    ko.applyBindings(controlContext, container);
                    container.children[0].id = controlContext._id;
                    controlContext._currentSelected === null && controlContext._setSelectedItemByString(controlContext, controlContext.modelProperties.Items.getValue(), controlContext.modelProperties.Default.getValue())
                }, disposeView: function(container, controlContext){}, handleClick: function(controlContext, item) {
                    var selected = {
                            Value: item.Value, _src: item._src
                        };
                    return controlContext.modelProperties.Selected.setValue(selected), controlContext._currentSelected = selected, controlContext._valueChanged = !0, controlContext.behaviors.OnSelect(), controlContext.currentSelectedRowItem !== item && (controlContext.currentSelectedRowItem = item, controlContext.behaviors.OnChange()), !0
                }, onChangeSelected: function(evt, controlContext) {
                    if (controlContext.realized) {
                        var items = controlContext.modelProperties.Items.getValue(),
                            i,
                            len,
                            wasFound = !1,
                            searchString = "";
                        if (evt.newValue !== null && (searchString = evt.newValue.Value), searchString !== null && items !== null)
                            for (i = 0, len = items.length; i < len; i++) {
                                var row = items[i];
                                row && row.Value === searchString && (controlContext.checkedValue(searchString), wasFound = !0)
                            }
                        if (!wasFound) {
                            controlContext.checkedValue("");
                            var radioElements = controlContext.container.getElementsByClassName("appmagic-radio click");
                            for (i = 0, len = radioElements.length; i < len; i++)
                                radioElements[i].checked = !1;
                            return
                        }
                    }
                }, onChangeItems: function(evt, controlContext) {
                    var items = controlContext.modelProperties.Items.getValue();
                    if (items === null) {
                        controlContext.modelProperties.Selected.setValue({
                            Value: "", _src: {}
                        });
                        return
                    }
                    var searchString = "",
                        selected = controlContext.modelProperties.Selected.getValue(),
                        defaultVal = controlContext.modelProperties.Default.getValue();
                    selected === null || !selected.Value ? defaultVal && (searchString = defaultVal) : searchString = selected.Value;
                    controlContext._setSelectedItemByString(controlContext, items, searchString)
                }, onChangeDefault: function(evt, controlContext) {
                    evt.newValue !== null && (controlContext._valueChanged = !1, controlContext.checkedValue(controlContext.modelProperties.Default.getValue()), controlContext._setSelectedItemByString(controlContext, controlContext.modelProperties.Items.getValue(), evt.newValue))
                }, _setSelectedItemByString: function(controlContext, items, searchString) {
                    var i,
                        len,
                        wasFound = !1;
                    if (searchString !== null && searchString !== "" && items !== null)
                        for (i = 0, len = items.length; i < len; i++) {
                            var row = items[i];
                            if (row && row.Value === searchString) {
                                var selected = {
                                        Value: row.Value, _src: row
                                    };
                                controlContext.modelProperties.Selected.setValue(selected);
                                controlContext._currentSelected = selected;
                                controlContext.currentSelectedRowItem = row;
                                wasFound = !0;
                                break
                            }
                        }
                    wasFound || controlContext.modelProperties.Selected.setValue({
                        Value: "", _src: {}
                    })
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Radio: Radio})
})();