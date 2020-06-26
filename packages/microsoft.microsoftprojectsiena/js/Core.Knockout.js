//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Knockout;
    (function(Knockout) {
        var BindingHandlers;
        (function(BindingHandlers) {
            var Shortcut = function() {
                    function Shortcut(){}
                    return Shortcut.init = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                            var shortcutsToHandle = valueAccessor().provider || {},
                                useCapture = valueAccessor().capture || !1,
                                shortcutHandler = new Core.Knockout.BindingHandlers.ShortcutHandler(element, useCapture),
                                enabledCheck = valueAccessor().enabled;
                            enabledCheck = enabledCheck ? enabledCheck.bind(bindingContext.$data) : function() {
                                return !0
                            };
                            shortcutsToHandle.shortcutKeys.forEach(function(shortcutKey) {
                                shortcutHandler.registerShortcut(shortcutKey.shortcut, shortcutKey.callbackFunction.bind(bindingContext.$data), enabledCheck)
                            });
                            var shortcutDescendant = typeof valueAccessor().descendants == "undefined" ? !0 : valueAccessor().descendants;
                            return {controlsDescendantBindings: !shortcutDescendant}
                        }, Shortcut
                }();
            BindingHandlers.Shortcut = Shortcut;
            ko.bindingHandlers.shortcut = Core.Knockout.BindingHandlers.Shortcut
        })(BindingHandlers = Knockout.BindingHandlers || (Knockout.BindingHandlers = {}))
    })(Knockout = Core.Knockout || (Core.Knockout = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            b.hasOwnProperty(p) && (d[p] = b[p]);
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    },
    Core;
(function(Core) {
    var Knockout;
    (function(Knockout) {
        var KnockoutDisposable = function(_super) {
                __extends(KnockoutDisposable, _super);
                function KnockoutDisposable() {
                    _super.apply(this, arguments);
                    this._trackedObservableSubscriptions = []
                }
                return KnockoutDisposable.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._disposeObservableSubscriptions()
                    }, KnockoutDisposable.prototype._disposeObservableSubscriptions = function() {
                        for (var i = 0, len = this._trackedObservableSubscriptions.length; i < len; i++) {
                            var subscription = this._trackedObservableSubscriptions[i];
                            subscription.dispose()
                        }
                        this._trackedObservableSubscriptions = []
                    }, KnockoutDisposable.prototype.trackObservable = function(key, obj) {
                            this.track(key, obj);
                            var originalValue = obj();
                            Core.Utility.isNullOrUndefined(originalValue) || this._trackedAnonymousObjects.indexOf(originalValue) !== -1 || this._trackedAnonymousObjects.push(originalValue);
                            var subscription = obj.subscribe(function(newValue) {
                                    var idx = this._trackedAnonymousObjects.indexOf(newValue);
                                    idx === -1 && this._trackedAnonymousObjects.push(newValue)
                                }.bind(this));
                            this._trackedObservableSubscriptions.push(subscription)
                        }, KnockoutDisposable
            }(Core.Disposable);
        Knockout.KnockoutDisposable = KnockoutDisposable
    })(Knockout = Core.Knockout || (Core.Knockout = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Knockout;
    (function(Knockout) {
        var BindingHandlers;
        (function(BindingHandlers) {
            var ModifierFlags;
            (function(ModifierFlags) {
                ModifierFlags[ModifierFlags.none = 0] = "none";
                ModifierFlags[ModifierFlags.ctrl = 1] = "ctrl";
                ModifierFlags[ModifierFlags.alt = 2] = "alt";
                ModifierFlags[ModifierFlags.shift = 4] = "shift"
            })(ModifierFlags || (ModifierFlags = {}));
            var ShortcutHandler = function(_super) {
                    __extends(ShortcutHandler, _super);
                    function ShortcutHandler(element, useCapture) {
                        _super.call(this);
                        this._downHandlers = {};
                        this._upHandlers = {};
                        Contracts.checkNonNull(element);
                        Contracts.checkBoolean(useCapture);
                        this._element = element;
                        this._useCapture = useCapture;
                        this._registerElementHandler()
                    }
                    return ShortcutHandler.prototype.handleKeyDown = function(evt) {
                            this._handleKey(evt, this._downHandlers);
                            evt.altKey && evt.key !== "Alt" && this._handleKey({key: "Alt"}, this._upHandlers)
                        }, ShortcutHandler.prototype.handleKeyUp = function(evt) {
                            this._handleKey(evt, this._upHandlers);
                            evt.ctrlKey && evt.key !== "Control" && this._handleKey({key: "Control"}, this._upHandlers);
                            evt.altKey && evt.key !== "Alt" && this._handleKey({key: "Alt"}, this._upHandlers);
                            evt.shiftKey && evt.key !== "Shift" && this._handleKey({key: "Shift"}, this._upHandlers)
                        }, ShortcutHandler.prototype.registerShortcut = function(shortcut, callback, enabledCheck) {
                                Contracts.checkNonEmpty(shortcut);
                                Contracts.checkFunction(callback);
                                Contracts.checkFunctionOrUndefined(enabledCheck);
                                var parsedShortcut = this._parseShortcut(shortcut),
                                    handlers = this._getModeHandlers(parsedShortcut.isDown),
                                    modifierHandlers = handlers[parsedShortcut.modifiers];
                                typeof modifierHandlers == "undefined" && (modifierHandlers = {}, handlers[parsedShortcut.modifiers] = modifierHandlers);
                                Contracts.checkUndefined(modifierHandlers[parsedShortcut.key], "Shortcut already defined: " + shortcut);
                                modifierHandlers[parsedShortcut.key] = {
                                    callback: callback, enabled: enabledCheck
                                }
                            }, ShortcutHandler.prototype._registerElementHandler = function() {
                                this._element.addEventListener("keydown", this.handleKeyDown.bind(this), this._useCapture);
                                this._element.addEventListener("keyup", this.handleKeyUp.bind(this), this._useCapture)
                            }, ShortcutHandler.prototype._handleKey = function(evt, handlers) {
                                if (Contracts.checkValue(evt), Contracts.checkNonEmpty(evt.key), Contracts.checkValue(handlers), this._shortcutsEnabled()) {
                                    var modifiers = this._getEventModifierFlags(evt),
                                        modifierHandlers = handlers[modifiers];
                                    if (modifierHandlers) {
                                        var key = evt.key;
                                        evt.keyCode && this._checkKeyCode(evt.keyCode) !== "Unidentified" && (key = this._checkKeyCode(evt.keyCode));
                                        key.length === 1 && (key = key.toLowerCase());
                                        var handler = modifierHandlers[key];
                                        if (handler && handler.enabled(key)) {
                                            var result = handler.callback();
                                            Contracts.checkBoolean(result, "Shortcut handlers must return true or false.");
                                            result && typeof evt.stopPropagation != "undefined" && (evt.stopPropagation(), evt.preventDefault())
                                        }
                                    }
                                }
                            }, ShortcutHandler.prototype._checkKeyCode = function(keyCode) {
                                Contracts.checkNumber(keyCode);
                                var value = "Unidentified";
                                switch (keyCode) {
                                    case 187:
                                    case 107:
                                        value = "=";
                                        break;
                                    case 189:
                                    case 109:
                                        value = "-";
                                        break
                                }
                                return value
                            }, ShortcutHandler.prototype._parseShortcut = function(shortcut) {
                                Contracts.checkString(shortcut);
                                var isDown = !0,
                                    index = shortcut.indexOf(":");
                                if (index >= 0) {
                                    var mode = shortcut.substring(0, index).trim();
                                    shortcut = shortcut.substring(index + 1).trim();
                                    switch (mode) {
                                        case"down":
                                            isDown = !0;
                                            break;
                                        case"up":
                                            isDown = !1;
                                            break;
                                        default:
                                            Contracts.check(!1, "Invalid mode value.");
                                            break
                                    }
                                }
                                var result = null;
                                switch (shortcut) {
                                    case"Ctrl":
                                        result = {
                                            key: "Control", modifiers: isDown ? 1 : 0
                                        };
                                        break;
                                    case"Alt":
                                        result = {
                                            key: "Alt", modifiers: isDown ? 2 : 0
                                        };
                                        break;
                                    case"Shift":
                                        result = {
                                            key: "Shift", modifiers: isDown ? 4 : 0
                                        };
                                        break;
                                    default:
                                        result = {
                                            key: null, modifiers: 0
                                        };
                                        for (var parts = shortcut.split("+"), i = 0, len = parts.length; i < len; i++)
                                            switch (parts[i]) {
                                                case"Ctrl":
                                                    result.modifiers |= 1;
                                                    break;
                                                case"Alt":
                                                    result.modifiers |= 2;
                                                    break;
                                                case"Shift":
                                                    result.modifiers |= 4;
                                                    break;
                                                default:
                                                    Contracts.checkNull(result.key);
                                                    result.key = parts[i];
                                                    break
                                            }
                                        isDown && result.key === null && (result.modifiers === (1 | 2) && (result.key = "Ctrl"), result.modifiers === (4 | 2) && (result.key = "Shift"));
                                        Contracts.checkValue(result.key);
                                        break
                                }
                                return result.isDown = isDown, result
                            }, ShortcutHandler.prototype._getEventModifierFlags = function(evt) {
                                Contracts.checkValue(evt);
                                var modifiers = 0;
                                return evt.ctrlKey && (modifiers |= 1), evt.altKey && (modifiers |= 2), evt.shiftKey && (modifiers |= 4), modifiers
                            }, ShortcutHandler.prototype._getModeHandlers = function(isDown) {
                                return Contracts.checkBoolean(isDown), isDown ? this._downHandlers : this._upHandlers
                            }, ShortcutHandler.prototype._shortcutsEnabled = function() {
                                return !0
                            }, ShortcutHandler
                }(Knockout.KnockoutDisposable);
            BindingHandlers.ShortcutHandler = ShortcutHandler
        })(BindingHandlers = Knockout.BindingHandlers || (Knockout.BindingHandlers = {}))
    })(Knockout = Core.Knockout || (Core.Knockout = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Knockout;
    (function(Knockout) {
        var FileComponentLoader = function() {
                function FileComponentLoader(){}
                return FileComponentLoader.prototype.loadComponent = function(name, componentConfig, callback) {
                        var _this = this;
                        if (this._canComponentBeHandledByThisLoader(componentConfig)) {
                            var renderHost = document.createElement("div");
                            WinJS.UI.Pages.render(componentConfig.markupFilePath, renderHost).done(function() {
                                callback({
                                    template: renderHost.children, createViewModel: function(params, componentInfo) {
                                            return _this._createViewModel(componentConfig, params, componentInfo)
                                        }
                                })
                            })
                        }
                        else
                            callback(null)
                    }, FileComponentLoader.prototype._createViewModel = function(componentConfig, params, componentInfo) {
                        var viewModel = null,
                            view = null,
                            element = componentInfo.element;
                        return typeof componentConfig.viewModelConstructorFunction == "function" && (viewModel = new componentConfig.viewModelConstructorFunction(params)), typeof componentConfig.viewConstructorFunction == "function" && (view = new componentConfig.viewConstructorFunction(element, viewModel)), ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                                    view && typeof view.dispose == "function" && view.dispose()
                                }), viewModel
                    }, FileComponentLoader.prototype._canComponentBeHandledByThisLoader = function(config) {
                            return config && config.markupFilePath ? !0 : !1
                        }, FileComponentLoader
            }();
        Knockout.FileComponentLoader = FileComponentLoader
    })(Knockout = Core.Knockout || (Core.Knockout = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var UI;
    (function(UI) {
        var Components;
        (function(Components) {
            var _registeredComponents = [];
            (function initializeCustomComponentLoaders() {
                ko.components.loaders.unshift(new Core.Knockout.FileComponentLoader)
            })();
            function register(name, markupFilePath) {
                _register(name, markupFilePath)
            }
            Components.register = register;
            function registerWithView(name, markupFilePath, viewConstructorFunction) {
                _register(name, markupFilePath, null, viewConstructorFunction)
            }
            Components.registerWithView = registerWithView;
            function registerWithViewModel(name, markupFilePath, viewModelConstructorFunction) {
                _register(name, markupFilePath, viewModelConstructorFunction)
            }
            Components.registerWithViewModel = registerWithViewModel;
            function registerWithViewModelAndView(name, markupFilePath, viewModelConstructorFunction, viewConstructorFunction) {
                _register(name, markupFilePath, viewModelConstructorFunction, viewConstructorFunction)
            }
            Components.registerWithViewModelAndView = registerWithViewModelAndView;
            function isRegistered(name) {
                return ko.components.isRegistered(name)
            }
            Components.isRegistered = isRegistered;
            function unregister(name) {
                ko.components.unregister(name)
            }
            Components.unregister = unregister;
            function unregisterAll() {
                _registeredComponents.forEach(function(val) {
                    return unregister(val)
                });
                _registeredComponents = []
            }
            Components.unregisterAll = unregisterAll;
            function _register(name, markupFilePath, viewModelConstructorFunction, viewConstructorFunction) {
                _registeredComponents.push(name);
                ko.components.register(name, {
                    markupFilePath: markupFilePath, viewModelConstructorFunction: viewModelConstructorFunction, viewConstructorFunction: viewConstructorFunction
                })
            }
        })(Components = UI.Components || (UI.Components = {}))
    })(UI = Core.UI || (Core.UI = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Contracts;
(function(Contracts) {
    function checkObservable(value, msg) {
        ko.isObservable(value) || Contracts._except(msg)
    }
    Contracts.checkObservable = checkObservable;
    function checkObservableBoolean(value, msg) {
        ko.isObservable(value) && typeof value.peek() == "boolean" || Contracts._except(msg)
    }
    Contracts.checkObservableBoolean = checkObservableBoolean;
    function checkObservableOrUndefined(value, msg) {
        ko.isObservable(value) || typeof value == "undefined" || Contracts._except(msg)
    }
    Contracts.checkObservableOrUndefined = checkObservableOrUndefined;
    function checkObservableNumber(value, msg) {
        ko.isObservable(value) && typeof value.peek() == "number" || Contracts._except(msg)
    }
    Contracts.checkObservableNumber = checkObservableNumber
})(Contracts || (Contracts = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Knockout;
    (function(Knockout) {
        var Extenders;
        (function(Extenders) {
            function Numeric(target, rangeFunction) {
                var result = ko.computed({
                        read: target, write: function(newValue) {
                                var current = target();
                                if (isNaN(newValue) || typeof newValue == "boolean")
                                    target.notifySubscribers(current);
                                else {
                                    var newValueAsNum = parseInt(newValue),
                                        valueToWrite = newValueAsNum;
                                    rangeFunction && (valueToWrite = rangeFunction(newValueAsNum));
                                    valueToWrite !== current ? target(valueToWrite) : newValueAsNum !== current && target.notifySubscribers(current)
                                }
                            }
                    }).extend({notify: "always"});
                return result(target()), result
            }
            Extenders.Numeric = Numeric;
            ko.extenders.numeric = Core.Knockout.Extenders.Numeric
        })(Extenders = Knockout.Extenders || (Knockout.Extenders = {}))
    })(Knockout = Core.Knockout || (Core.Knockout = {}))
})(Core || (Core = {}));