//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
        PropertyHelperUI = Microsoft.AppMagic.Authoring.PropertyHelperUI;
    function hideClickEatingFlyoutDiv() {
        setImmediate(function() {
            WinJS.UI._Overlay._createClickEatingDivFlyout();
            var clickEatingFlyoutDiv = WinJS.UI._Overlay._clickEatingFlyoutDiv;
            clickEatingFlyoutDiv.style.width = "0%";
            clickEatingFlyoutDiv.style.height = "0%"
        })
    }
    function applyFlyoutWholePixelPositioning() {
        var originalGetTopLeft = WinJS.UI.Flyout.prototype._getTopLeft;
        WinJS.UI.Flyout.prototype._getTopLeft = function() {
            originalGetTopLeft.call(this);
            this._nextLeft = Math.round(this._nextLeft);
            this._nextTop = Math.round(this._nextTop)
        }
    }
    function applyInteractiveLightDismiss() {
        hideClickEatingFlyoutDiv();
        var visibleFlyouts = 0,
            originalConstructor = WinJS.UI._Overlay.prototype._baseOverlayConstructor;
        WinJS.UI._Overlay.prototype._baseOverlayConstructor = function(element, options) {
            originalConstructor.call(this, element, options);
            this.addEventListener("beforeshow", function() {
                visibleFlyouts++
            });
            this.addEventListener("afterhide", function() {
                visibleFlyouts--
            })
        };
        document.addEventListener("mousedown", function(evt) {
            if (visibleFlyouts > 0) {
                for (var ancestor = evt.target; ancestor; ancestor = ancestor.parentNode)
                    if (WinJS.Utilities.hasClass(ancestor, "win-flyout"))
                        return;
                var originalTrySetActiveFunction = WinJS.UI._Overlay._trySetActive;
                try {
                    WinJS.UI._Overlay._trySetActive = function(element) {
                        return !1
                    };
                    WinJS.UI._Overlay._hideAllFlyouts()
                }
                finally {
                    WinJS.UI._Overlay._trySetActive = originalTrySetActiveFunction
                }
            }
        }, !0)
    }
    function compareNumbersAscending(a, b) {
        return a - b
    }
    function compareScreenIndex(a, b) {
        return compareNumbersAscending(a.index, b.index)
    }
    function compareVisualZIndex(a, b) {
        return compareNumbersAscending(a.zindex, b.zindex)
    }
    ko.bindingHandlers.element = {init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();
            ko.isObservable(value) && value(element)
        }};
    ko.bindingHandlers.clickOrEnter = {init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var onClick = function(clickEvent) {
                    valueAccessor().call(bindingContext.$data, bindingContext.$data, clickEvent)
                },
                onKeydown = function(keyEvent) {
                    (keyEvent.key === AppMagic.Constants.Keys.enter || keyEvent.key === AppMagic.Constants.Keys.space) && valueAccessor().call(bindingContext.$data, bindingContext.$data, keyEvent)
                };
            element.addEventListener("click", onClick);
            element.addEventListener("keydown", onKeydown);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                element.removeEventListener("click", onClick);
                element.removeEventListener("keydown", onKeydown)
            })
        }};
    ko.bindingHandlers.onEnterKeyPressed = {init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var onKeydown = function(keyEvent) {
                    keyEvent.key === AppMagic.Constants.Keys.enter && valueAccessor().call(bindingContext.$data, bindingContext.$data, keyEvent)
                };
            element.addEventListener("keydown", onKeydown);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                element.removeEventListener("keydown", onKeydown)
            })
        }};
    ko.bindingHandlers.hover = {init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor();
            var onMouseOver = function(evt) {
                    element.style.backgroundColor = value.enter || ""
                },
                onMouseOut = function(evt) {
                    element.style.backgroundColor = value.exit || ""
                };
            element.addEventListener("mouseover", onMouseOver);
            element.addEventListener("mouseout", onMouseOut);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                element.removeEventListener("mouseover", onMouseOver);
                element.removeEventListener("mouseout", onMouseOut)
            })
        }};
    ko.bindingHandlers.dom = {
        init: function(element, valueAccessor) {
            return {controlsDescendantBindings: !0}
        }, update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var childElement = ko.utils.unwrapObservable(valueAccessor());
                ko.virtualElements.firstChild(element) !== childElement && (ko.virtualElements.emptyNode(element), childElement && ko.virtualElements.prepend(element, childElement))
            }
    };
    ko.virtualElements.allowedBindings.dom = !0;
    ko.bindingHandlers.videosrc = {update: function(element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            try {
                element.src = value;
                element.load()
            }
            catch(err) {}
        }};
    var E_UNEXPECTED = -2147418113,
        E_NOTIMPL = -2147467263;
    ko.bindingHandlers.mediaattr = {update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var attrMap = ko.utils.unwrapObservable(valueAccessor());
            for (var attrName in attrMap)
                if (attrMap.hasOwnProperty(attrName)) {
                    var attrValue = ko.utils.unwrapObservable(attrMap[attrName]);
                    try {
                        element[attrName] = attrValue
                    }
                    catch(err) {
                        if (!(err instanceof Error && (err.number === E_UNEXPECTED || err.number === E_NOTIMPL)))
                            throw err;
                    }
                }
        }};
    ko.bindingHandlers.winjsattr = {update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var attrMap = ko.utils.unwrapObservable(valueAccessor());
            for (var attrName in attrMap)
                if (attrMap.hasOwnProperty(attrName)) {
                    var attrValue = ko.utils.unwrapObservable(attrMap[attrName]);
                    element.winControl[attrName] = attrValue
                }
        }};
    var StartupWinjsControlProgress = WinJS.Namespace.define("AppMagic.AuthoringTool.Utility.StartupWinjsControlProgress", {
            _complete: null, _inProgress: 0, beginLoad: function(pageUri) {
                    this._inProgress++
                }, endLoad: function(pageUri) {
                    this._inProgress--;
                    this._inProgress === 0 && this._complete()
                }, ready: null
        });
    StartupWinjsControlProgress.ready = new WinJS.Promise(function(complete, error) {
        StartupWinjsControlProgress._complete = complete
    });
    function addReadyCompletePromise(page) {
        var prototype = Object.getPrototypeOf(page);
        typeof prototype._innerReady == "undefined" && (prototype._innerReady = prototype.ready, prototype.ready = function(element, options) {
            this._innerReady(element, options);
            this._readyComplete()
        });
        page.readyComplete = new WinJS.Promise(function(complete, error) {
            page._readyComplete = complete
        })
    }
    ko.bindingHandlers.winjsControl = {
        init: function(element) {
            return element.renderedHtmlControlUri ? {} : {controlsDescendantBindings: !0}
        }, update: function(element, valueAccessor) {
                var uri = ko.utils.unwrapObservable(valueAccessor());
                uri !== element.renderedHtmlControlUri && (element.renderedHtmlControlUri && (ko.virtualElements.emptyNode(element), element.renderedHtmlControlUri = null), uri.length > 0 && (StartupWinjsControlProgress.beginLoad(uri), AppMagic.UI.Utility.createControlAsync(element, uri).then(function() {
                    StartupWinjsControlProgress.endLoad(uri)
                })))
            }
    };
    ko.bindingHandlers.winjsControlClass = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            if (typeof element.winControl == "undefined") {
                var Ctor = valueAccessor();
                new Ctor(element)
            }
        }};
    ko.bindingHandlers.focusRoot = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            for (var value = valueAccessor(), focusElements = element.getElementsByClassName("focusElement"), i = 0, len = focusElements.length; i < len; i++) {
                var focusElement = focusElements[i],
                    focusKey = focusElement.focusKey;
                if (focusKey === value) {
                    focusElement.focus();
                    break
                }
            }
        }};
    ko.bindingHandlers.focusElement = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            WinJS.Utilities.addClass(element, "focusElement");
            element.focusKey = valueAccessor()
        }};
    ko.bindingHandlers.property = {update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var propertyMap = ko.utils.unwrapObservable(valueAccessor());
            for (var propertyName in propertyMap)
                if (propertyMap.hasOwnProperty(propertyName)) {
                    var propertyValue = ko.utils.unwrapObservable(propertyMap[propertyName]);
                    element[propertyName] = propertyValue
                }
        }};
    ko.bindingHandlers.viewModelProperty = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var propertyMap = ko.utils.unwrapObservable(valueAccessor());
            for (var propertyName in propertyMap)
                if (propertyMap.hasOwnProperty(propertyName)) {
                    var propertyValue = ko.utils.unwrapObservable(propertyMap[propertyName]);
                    viewModel[propertyName] = propertyValue
                }
        }};
    ko.bindingHandlers.observableProperty = {update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var propertyMap = ko.utils.unwrapObservable(valueAccessor());
            for (var propertyName in propertyMap)
                if (propertyMap.hasOwnProperty(propertyName)) {
                    var wrapped = propertyMap[propertyName],
                        propertyValue = ko.utils.unwrapObservable(wrapped),
                        propertyTarget = element[propertyName];
                    propertyTarget ? propertyTarget(propertyValue) : (element[propertyName] = ko.observable(propertyValue), ko.isObservable(wrapped) && element[propertyName].subscribe(function(newValue) {
                        this(newValue)
                    }, wrapped))
                }
        }};
    ko.bindingHandlers.observableFlyoutVisible = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();
            var handlers = element.winControl._observableFlyoutVisibleHandlers;
            handlers && (element.winControl.removeEventListener(handlers.beforeShow), element.winControl.removeEventListener(handlers.afterHide));
            element.winControl._observableFlyoutVisibleHandlers = handlers = {
                beforeShow: function() {
                    value(!0)
                }, afterHide: function() {
                        value(!1)
                    }
            };
            element.winControl.addEventListener("beforeshow", handlers.beforeShow);
            element.winControl.addEventListener("afterhide", handlers.afterHide)
        }};
    var ViewTrigger = WinJS.Class.define(function ViewTrigger_ctor(properties) {
            this._properties = properties;
            this._pendingData = ko.observable(null)
        }, {
            _properties: null, _pendingData: null, tryInvoke: function(data) {
                    return typeof this._properties.invokeHandler != "undefined" && this._properties.invokeHandler(data), this._pendingData(data), this._pendingData() === null ? !0 : (this._pendingData(null), !1)
                }, tryHandle: function(data, element, viewModel) {
                    data !== null && this._pendingData() === data && (this._pendingData(null), this._properties.elementHandler(viewModel, element))
                }
        }, {});
    ko.bindingHandlers.viewTrigger = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var values = ko.utils.unwrapObservable(valueAccessor());
            values.forEach(function(value) {
                value.trigger.tryHandle(value.data, element, viewModel)
            })
        }};
    var originalRender = ko.nativeTemplateEngine.prototype.renderTemplateSource;
    ko.nativeTemplateEngine.prototype.renderTemplateSource = function(templateSource, bindingContext, options) {
        return AppMagic.Utility.execUnsafeLocalFunction(function() {
                return originalRender(templateSource, bindingContext, options)
            })
    };
    function canShowPicker() {
        return Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.snapped && !Windows.UI.ViewManagement.ApplicationView.tryUnsnap() ? !1 : !0
    }
    function setInitialScreenRules(screenViewModel) {
        var screenDefaultFill = AppMagic.AuthoringTool.Constants.ScreenDefaultFill();
        screenViewModel.setRuleInvariant(AppMagic.AuthoringTool.Constants.ScreenFillPropertyName, screenDefaultFill.toRuleValue());
        screenViewModel.setRuleInvariant(AppMagic.AuthoringTool.Constants.ScreenStretchPropertyName, AppMagic.AuthoringTool.Constants.ScreenDefaultStretch)
    }
    function tryParseDottedExpression(expression) {
        if (/^[^!]+?(![^!]+)*$/i.test(expression)) {
            for (var parts = expression.split("!"), complete = [], quoted = [], unquoted = [], ancestors = "", i = 0, len = parts.length; i < len; i++) {
                var part = parts[i];
                i === 0 ? complete.push(part) : complete.push(complete[i - 1] + "!" + part);
                part[0] !== "'" && part[part.length - 1] !== "'" ? quoted.push("'" + part + "'") : quoted.push(part);
                part[0] === "'" && part[part.length - 1] === "'" ? unquoted.push(part.substr(1, part.length - 2)) : unquoted.push(part)
            }
            return {
                    complete: complete, length: parts.length, quoted: quoted, parts: parts, unquoted: unquoted
                }
        }
        else
            return null
    }
    function changingComputed(fn, target) {
        var computed = ko.computed(fn, target),
            observable = ko.observable(computed()),
            subscription = computed.subscribe(function(value) {
                observable(value)
            });
        return observable.dispose = function() {
                subscription.dispose();
                computed.dispose()
            }, observable
    }
    function focusOnMouseDown(evt) {
        return evt.target.focus(), !0
    }
    function scrollElementToTop(containerElement, parentClassName, text) {
        for (var parentElement = AppMagic.Utility.getFirstDescendantByClass(parentClassName, containerElement), children = parentElement.children, i = 0, len = children.length; i < len; i++) {
            var child = children[i];
            if (child.innerText === text) {
                parentElement.scrollTop = child.offsetTop;
                child.focus();
                break
            }
        }
    }
    function tryGetTextOnSelectKeyUpDown(parentElement, index, maxSize, evtKey) {
        if (evtKey === AppMagic.Constants.Keys.down || evtKey === AppMagic.Constants.Keys.up || evtKey === AppMagic.Constants.Keys.pageDown || evtKey === AppMagic.Constants.Keys.pageUp || evtKey === AppMagic.Constants.Keys.home || evtKey === AppMagic.Constants.Keys.end) {
            var children = parentElement.children,
                childrenLen = children.length;
            switch (evtKey) {
                case AppMagic.Constants.Keys.down:
                    index < childrenLen - 1 && index++;
                    break;
                case AppMagic.Constants.Keys.up:
                    index > 0 && index--;
                    break;
                case AppMagic.Constants.Keys.pageDown:
                    index < childrenLen - maxSize ? index += maxSize : index = childrenLen - 1;
                    break;
                case AppMagic.Constants.Keys.pageUp:
                    index > maxSize ? index -= maxSize : index = 0;
                    break;
                case AppMagic.Constants.Keys.home:
                    index = 0;
                    break;
                case AppMagic.Constants.Keys.end:
                    index = childrenLen - 1;
                    break;
                default:
                    break
            }
            var selectedChild = children[index];
            return selectedChild.focus(), selectedChild.innerText
        }
        return null
    }
    function addLinkButtonToSettingsPane(e, className, title, uri) {
        var command = new Platform.UI.ApplicationSettings.SettingsCommand(className, title, function() {
                AppMagic.AuthoringTool.Utility.openLinkInBrowser(uri)
            });
        e.detail.e.request.applicationCommands.append(command)
    }
    function openLinkInBrowser(uri) {
        var url = new Platform.Foundation.Uri(uri);
        Platform.System.Launcher.launchUriAsync(url)
    }
    var TextRangeClientRectsFixer = WinJS.Class.define(function TextRangeClientRectsFixer_ctor() {
            Platform.Graphics.Display.DisplayProperties.addEventListener("logicaldpichanged", function() {
                this._multiplier = null
            }.bind(this))
        }, {
            _multiplier: null, getTextRangeClientRects: function(textRange) {
                    for (var rects = textRange.getClientRects(), fixedRects = [], multiplier = this._getMultiplier(), i = 0, len = rects.length; i < len; i++) {
                        var rect = rects[i];
                        fixedRects.push({
                            left: rect.left * multiplier, top: rect.top * multiplier, right: rect.right * multiplier, bottom: rect.bottom * multiplier, width: rect.width * multiplier, height: rect.height * multiplier
                        })
                    }
                    return fixedRects
                }, _getMultiplier: function() {
                    if (this._multiplier === null) {
                        var correctWidth = null,
                            possiblyBadWidth = null;
                        try {
                            correctWidth = textRangeClientRectsFixerElement.getBoundingClientRect().width;
                            correctWidth <= 0 && (correctWidth = null);
                            var range = document.body.createTextRange();
                            range.moveToElementText(textRangeClientRectsFixerElement);
                            var possiblyBadRects = range.getClientRects();
                            possiblyBadRects.length === 1 && (possiblyBadWidth = possiblyBadRects[0].width, possiblyBadWidth <= 0 && (possiblyBadWidth = null))
                        }
                        catch(e) {}
                        this._multiplier = correctWidth !== null && possiblyBadWidth !== null ? correctWidth / possiblyBadWidth : 1
                    }
                    return this._multiplier
                }
        }),
        textRangeClientRectsFixer = new TextRangeClientRectsFixer;
    WinJS.Namespace.define("AppMagic.AuthoringTool.Utility", {
        addLinkButtonToSettingsPane: addLinkButtonToSettingsPane, openLinkInBrowser: openLinkInBrowser, applyFlyoutWholePixelPositioning: applyFlyoutWholePixelPositioning, applyInteractiveLightDismiss: applyInteractiveLightDismiss, compareNumbersAscending: compareNumbersAscending, compareScreenIndex: compareScreenIndex, compareVisualZIndex: compareVisualZIndex, canShowPicker: canShowPicker, changingComputed: changingComputed, focusOnMouseDown: focusOnMouseDown, getTextRangeClientRectsWithScaling: textRangeClientRectsFixer.getTextRangeClientRects.bind(textRangeClientRectsFixer), scrollElementToTop: scrollElementToTop, setInitialScreenRules: setInitialScreenRules, tryGetTextOnSelectKeyUpDown: tryGetTextOnSelectKeyUpDown, tryParseDottedExpression: tryParseDottedExpression, ViewTrigger: ViewTrigger
    })
})(Windows);