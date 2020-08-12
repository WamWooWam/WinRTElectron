

(function (undefined) {
    "use strict";

    var requireSupportedForProcessing = WinJS.Utilities.requireSupportedForProcessing;
    var strings = {
        attributeBindingSingleProperty: { get: function() { return WinJS.Resources._getWinJSString("base/attributeBindingSingleProperty").value; } },
        cannotBindToThis: { get: function() { return WinJS.Resources._getWinJSString("base/cannotBindToThis").value; }},
        creatingNewProperty: { get: function() { return WinJS.Resources._getWinJSString("base/creatingNewProperty").value; }},
        duplicateBindingDetected: { get: function() { return WinJS.Resources._getWinJSString("base/duplicateBindingDetected").value; }},
        elementNotFound: { get: function() { return WinJS.Resources._getWinJSString("base/elementNotFound").value; }},
        errorInitializingBindings: { get: function() { return WinJS.Resources._getWinJSString("base/errorInitializingBindings").value; }},
        propertyDoesNotExist: { get: function() { return WinJS.Resources._getWinJSString("base/propertyDoesNotExist").value; }},
        idBindingNotSupported: { get: function() { return WinJS.Resources._getWinJSString("base/idBindingNotSupported").value; }},
        nestedDOMElementBindingNotSupported: { get: function () { return WinJS.Resources._getWinJSString("base/nestedDOMElementBindingNotSupported").value; } }
    };

    function getMember(root, props) {
        
        
        
        
        
        
        
        
        
        
        
        
        root = root || window;
        if (!props) {
            return null;
        }

        return props.reduce(function (currentNamespace, name) {
            if (currentNamespace) {
                return currentNamespace[name];
            }
            return null;
        }, root);
    }

    function noop() { }

    var bindingElementTargetWeakRefTable;
    function getBindingTargetWeakRefTable() {
        if (!bindingElementTargetWeakRefTable) {
            bindingElementTargetWeakRefTable = new MvvmJS.WeakRefTable("about://bindingElementTarget");
        }
        return bindingElementTargetWeakRefTable;
    }

    
    function attributeSet(dest, destProperties, v) {
        propertiesChainSet(dest, destProperties, v, doAttributeSet);
    }
    function nestedSet(dest, destProperties, v) {
        propertiesChainSet(dest, destProperties, v, doPropertySet);
    }
    
    function doPropertySet(dest, prop, v) {
        if (dest[prop] !== v) {
            dest[prop] = v;
        }
    }
    function doAttributeSet(dest, prop, v) {
        dest.setAttribute(prop, v);
    }

    function checkChainSupportedForProcessing(dest, destProperties) {
        dest = requireSupportedForProcessing(dest);
        for (var i = 0, len = (destProperties.length - 1); i < len; i++) {
            dest = requireSupportedForProcessing(dest[destProperties[i]]);
            if (!dest) {
                return null;
            } else if (dest instanceof Node) {
                return null;
            }
        }
        return dest;
    }

    function propertiesChainSet(dest, destProperties, v, func) {
        requireSupportedForProcessing(v);
        dest = checkChainSupportedForProcessing(dest, destProperties);
        
        if (destProperties.length === 0) {
            WinJS.log && WinJS.log(strings.cannotBindToThis.get(), "winjs binding", "error");
            return;
        }
        var prop = destProperties[destProperties.length - 1];
        if (WinJS.log) {
            if (dest[prop] === undefined) {
                WinJS.log(WinJS.Resources._formatString(strings.creatingNewProperty.get(), prop, destProperties.join(".")), "winjs binding", "warn");
            }
        }
        func(dest, prop, v);
    }

    function bindWorker(bindable, sourceProperties, func) {
        if (sourceProperties.length > 1) {
            var root = {};
            var current = root;
            for (var i = 0, l = sourceProperties.length - 1; i < l; i++) {
                current = current[sourceProperties[i]] = {};
            }
            current[sourceProperties[sourceProperties.length - 1]] = func;

            return WinJS.Binding.bind(bindable, root, true);
        } else if (sourceProperties.length === 1) {
            bindable.bind(sourceProperties[0], func, true);
            return {
                cancel: function () {
                    bindable.unbind(sourceProperties[0], func);
                    this.cancel = noop;
                }
            };
        } else {
            func(bindable);
        }
        return null;
    }

    function weakElementBindingInitializer(handler) {
        var wrappedBindingHandler = wrapBindingHandler.bind(window, handler);
        return WinJS.Utilities.markSupportedForProcessing(wrappedBindingHandler);
    }

    function wrapBindingHandler(handler, source, sourceProperties, destElement, destProperties) {
        var weakRefTable = getBindingTargetWeakRefTable();

        var id = weakRefTable.putItem(destElement);

        var propertyPath = destProperties.concat([]);
        var bindResult;
        var options = {
            id: id,
            handler: handler,
            source: source,
            sourceProperties: sourceProperties,
            bindResult: null,
            propertyPath: propertyPath
        };

        var bindingHandler = executeBindingHandler.bind(window, options);
        if (source.isDisposed) {
            return null;
        }
        bindResult = bindWorker(WinJS.Binding.as(source), sourceProperties, bindingHandler);
        return bindResult;
    }

    function executeBindingHandler(options, value) {
        var initialBind = true;
        var targetElement = getBindingTargetWeakRefTable().getItem(options.id);
        if (targetElement) {
            var oldValue = options.source[options.sourceProperties];
            if (initialBind || oldValue != value) { 
                options.handler(options.source, options.sourceProperties, targetElement, options.propertyPath, value);
                initialBind = false;
            }
        } else if (options.bindResult) {
            options.bindResult.cancel();
        }
    };

    var bindings = {
        localize: function (source, sourceProperty, dest, destProperties, value) {
            var innerBindingContext;
            if (value && value.length > 0) {
                innerBindingContext = sourceProperty.length === 1 ? source : getMember(source, sourceProperty.slice(0, sourceProperty.length - 1));
                attributeSet(dest, ["data-win-res"], "{" + destProperties + ":'" + value + "'}");
            } else {
                dest.removeAttribute("data-win-res");
                nestedSet(dest, destProperties, value);
            }
            WinJS.Resources.processAll(dest).then(function () {
                if (innerBindingContext) {
                    return WinJS.Binding.processAll(dest, innerBindingContext, true);
                }
                return null;
            });
        },
        toggleTabIndex: function (source, sourceProperty, dest, destProperties, value) {
            if (value) {
                var index = destProperties[0].replace('TABINDEX', '');
                nestedSet(dest, ["tabIndex"], index);
            }
        },

        suppressTabIndex: function (source, sourceProperty, dest, destProperties, value) {
            checkChainSupportedForProcessing(dest, destProperties);

            var originalIndex = dest.getAttribute("originalIndex");
            if (!value) {
                dest.setAttribute("originalIndex", dest.tabIndex);
                dest.tabIndex = "-1";
            } else if (originalIndex) {
                dest.tabIndex = originalIndex;
                dest.removeAttribute("originalIndex");
            }
        },

        toogleHeaderButtonRole: function (source, sourceProperty, dest, destProperties, value) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            dest.setAttribute(destProperties[0], value ? "link" : "heading");
        },
        
        toggleAriaHidden: function (source, sourceProperty, dest, destProperties, value) {
            dest.setAttribute("aria-hidden", !!value);
        },

        toggleAriaHiddenNegative: function (source, sourceProperty, dest, destProperties, value) {
            dest.setAttribute("aria-hidden", !value);
        },

        toggleClass: function (source, sourceProperty, dest, destProperties, value) {
            propertiesChainSet(dest, destProperties, value, Skype.UI.Util.setClass);
        },
        toggleClassNegative: function (source, sourceProperty, dest, destProperties, value) {
            bindings.toggleClass(source, sourceProperty, dest, destProperties, !value);
        },

        toggleTemporaryClass: function (source, sourceProperty, dest, destProperties, value) {
            if (value) {
                propertiesChainSet(dest, destProperties, value, function(destElm, property, val) {
                    var removeAfterMillis = destElm.getAttribute("data-tmp-class-timeout");
                    Skype.UI.Util.setTemporaryClass(destElm, property, parseInt(removeAfterMillis));
                });
            }
        },

        
        bindConversationStateClass: function (source, sourceProperty, dest, destProperties, value) {
            value = Skype.UI.Conversation.translateStateToClassName(value);
            bindings.bindClass(source, sourceProperty, dest, destProperties, value);
        },

        bindClass: function (source, sourceProperty, dest, destProperties, value) {
            checkChainSupportedForProcessing(dest, destProperties);

            var oldValuePropertyName = sourceProperty.join(".");
            if (dest[oldValuePropertyName]) {
                WinJS.Utilities.removeClass(dest, dest[oldValuePropertyName]);
            }
            if (value) {
                WinJS.Utilities.addClass(dest, value);
                dest[oldValuePropertyName] = value;
            }
        },
        
        bindClassUppercased: function (source, sourceProperty, dest, destProperties, value) {
            if (value) {
                value = value.toUpperCase();
            }
            bindings.bindClass(source, sourceProperty, dest, destProperties, value);
        },

        style: function (source, sourceProperty, dest, destProperties, value) {
            checkChainSupportedForProcessing(dest, destProperties);

            if (Array.isArray(destProperties)) {
                destProperties = destProperties[0];
            }
            dest.style[destProperties] = value;
        },
        
        urlStyle: function (source, sourceProperty, dest, destProperties, value) {
            checkChainSupportedForProcessing(dest, destProperties);

            if (Array.isArray(destProperties)) {
                destProperties = destProperties[0];
            }
            dest.style[destProperties] = "url('{0}')".format(value);
        },

        wbind: function (source, sourceProperty, dest, destProperties, value) {
            if (sourceProperty[0] === "self") {
                value = source;
            }

            nestedSet(dest, destProperties, value);
        },

        setAttribute: function (source, sourceProperty, dest, destProperties, value) {
            attributeSet(dest, destProperties, value);
        },

        unsafeHTML: function (source, sourceProperty, dest, destProperties, value) {
            nestedSet(dest, destProperties, window.toStaticHTML(value));
        },

        unsafeHTMLdeactivateAnchorFocus: function (source, sourceProperty, dest, destProperties, value) {
            value = Skype.UI.Util.deactivateAnchorFocus(value);
            nestedSet(dest, destProperties, window.toStaticHTML(value));
        },
        
        event: function (source, sourceProperty, dest, destProperties) {
            checkChainSupportedForProcessing(dest, destProperties);

            var observable = source._getObservable && source._getObservable();
            var that = observable || source;
            var fn = source[sourceProperty];
            if (!fn) {
                return;
            }

            var handler = fn.bind(that);
            handler = window.safe ? window.safe(handler) : handler;

            if (dest.winControl) {
                dest = dest.winControl;
            }

            dest.addEventListener(destProperties[0], handler);
        },

        keyup: function (source, sourceProperty, dest, destProperties) {
            checkChainSupportedForProcessing(dest, destProperties);

            var observable = source._getObservable && source._getObservable();
            var that = observable || source;
            var fn = source[sourceProperty];
            if (!fn) {
                return;
            }

            var handler = fn.bind(that);
            handler = window.safe ? window.safe(handler) : handler;

            var keyCode = WinJS.Utilities.Key[destProperties[0]];
            if (!keyCode) {
                return;
            }

            
            dest.addEventListener("keyup", function (event) {
                if (event.keyCode === keyCode) {
                    handler();
                }
            });
        },

        out: function (source, sourceProperties, dest, destProperties) {
            checkChainSupportedForProcessing(dest, destProperties);
            checkChainSupportedForProcessing(source, sourceProperties);

            for (var i = 0; i < destProperties.length; i++) {
                dest = dest[destProperties[i]];
            }
            if (source && dest) {
                source[sourceProperties] = dest;
            }
        },
        twoway: function (source, sourceProperties, dest, destProperties, value) {
            checkChainSupportedForProcessing(dest, destProperties);
            checkChainSupportedForProcessing(source, sourceProperties);

            for (var i = 0; i < sourceProperties.length - 1; i++) {
                source = source[sourceProperties[i]];
            }
            var finalProperty = sourceProperties[sourceProperties.length - 1];

            var backBindFn = function () {
                var input = dest[destProperties[0]];
                if (source[finalProperty] !== input) {
                    source[finalProperty] = input;
                }
            };

            var hookupAction = twowayBindingConvetions[dest.tagName];
            if (typeof hookupAction !== "function") {
                var type = dest.type;
                hookupAction = hookupAction[type];
            }
            hookupAction && hookupAction(dest, backBindFn);
            nestedSet(dest, destProperties, value);
        },
        listBind: function (source, sourceProperty, dest, destProperty, value) {
            dest = requireSupportedForProcessing(dest);
            source = requireSupportedForProcessing(source);

            var isListView = dest.winControl && dest.winControl instanceof WinJS.UI.ListView;
            if (!isListView) {
                return;
            }

            for (var i = 0; i < sourceProperty.length - 1; i++) {
                source = source[sourceProperty[i]];
            }

            if (!source) {
                return;
            }

            var selection = dest.winControl.selection;
            twowayBindingConvetions["LIST"](dest, function (e) {
                if (!!dest.updating) {
                    return;
                }

                dest.updating = true;

                
                selection.getItems().done(function (items) {
                    source.clearSelection();
                    source.selectItems(items);
                });

                WinJS.Promise.timeout().then(function () {
                    dest.updating = false;
                });
            });

            source.bind("selection", function (items) {
                if (!!dest.updating) {
                    return;
                }

                dest.updating = true;
                
                WinJS.Promise.timeout().then(function () {
                    if (dest.winControl._isZombie()) {
                        return;
                    }
                    selection.clear().then(function () {
                        return selection.set(items);
                    }).then(function () {
                        dest.updating = false;
                    });
                });
            });

            nestedSet(dest, destProperty, value);
        }
    };


    WinJS.Namespace.define("MvvmJS.Binding", {});    
    
    Object.getOwnPropertyNames(bindings).forEach(function (x, ix) {
        var fx = bindings[x];
        MvvmJS.Binding[x] = weakElementBindingInitializer(fx);

        var bindingInitializer = weakElementBindingInitializer(fx);
        bindingInitializer.delayable = true; 
        MvvmJS.Binding[x + "Delayed"] = bindingInitializer;
    });

    MvvmJS.Binding.not = WinJS.Binding.converter(function not(v) { return !v; });

    

    var twowayBindingConvetions = {
        INPUT: {
            text: function (destination, bindingAction) {
                destination.addEventListener("input", bindingAction);
            },
            number: function (destination, bindingAction) {
                destination.addEventListener("input", bindingAction);
            },
            checkbox: function (destination, bindingAction) {
                destination.addEventListener("change", bindingAction);
            }
        },
        TEXTAREA: function (destination, bindingAction) {
            destination.addEventListener("input", bindingAction);
        },
        SELECT: function (destination, bindingAction) {
            destination.addEventListener("change", bindingAction);
        },
        LIST: function (destination, bindingAction) {
            destination.addEventListener("selectionchanged", bindingAction);
        },
    };

}());