

(function () {
    "use strict";

    var cleanupProperty =  function cleanupProperty (owner, property) {
        var skipDisposingProperty = owner.__skipDispose && owner.__skipDispose[property] !== undefined;
        if (skipDisposingProperty) {
            return;
        }

        var obj = owner[property];
        if (!obj) { return; }

        
        obj.dispose && obj.dispose();

        
        obj.forEach && obj.forEach(function (i) {
            
            if (i) {
                i.dispose && i.dispose();
            }
        });

        
        if (property !== "winControl" && obj.winControl && obj.winControl !== owner) {
            cleanupProperty(obj, "winControl");
        }

        if (WinJS.Binding.observableMixin[property] === undefined) {
            
            owner[property] = null;
        }
    },
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    disposable = WinJS.Class.define(function () { }, {
        isDisposed: false,
        _eventListeners: null,
        _binds: null,
        _timeouts: null,
        _intervals: null,
        _immediates: null,
        _promises: null,

        dispose: function () {
            if (this.isDisposed) {
                
                return;
            }

            this.isDisposed = true;
            log("Disposing " + this.__className);

            this.cleanupEventListeners();

            this._onDispose && this._onDispose();

            this.cleanupMembers();
        },

        cleanupMembers: function () {
            Object.getOwnPropertyNames(this).forEach(function (prop) {
                if (prop == "fatData" || prop === "isDisposed") { return; }
                cleanupProperty(this, prop);
            }.bind(this));

        },

        cleanupEventListeners: function () {
            

            
            var id;
            while (this._timeouts && this._timeouts.length > 0) {
                id = this._timeouts.shift();
                this.unregTimeout(id);
            }
            while (this._intervals && this._intervals.length > 0) {
                id = this._intervals.shift();
                this.unregInterval(id);
            }
            while (this._immediates && this._immediates.length > 0) {
                id = this._immediates.shift();
                this.unregImmediate(id);
            }


            
            while (this._eventListeners && this._eventListeners.length > 0) {
                try {
                    var eventHandlerDef = this._eventListeners.shift();
                    this.unregEventListener(eventHandlerDef[0], eventHandlerDef[1], eventHandlerDef[2], eventHandlerDef[3]);
                } catch (ex) {
                    log("exception during enregistering the event listener", ex.message);
                }
            }

            
            var i = this._binds ? this._binds.length : 0,
                bindDef;
            while (this._binds && i--) {
                bindDef = this._binds[i];
                this.unregBind(bindDef[0], bindDef[1], bindDef[2]);
            }

            
            while (this._promises && this._promises.length > 0) {
                var promise = this._promises.shift();
                this.unregPromise(promise);
            }
        },

        throttle: function (timeout, method, args) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            if (!method) {
                return;
            }

            function executeFunc() {
                if (method) {
                    this.unregTimeout(method._throttleTimer); 
                    method._lastCalled = +new Date();
                    method.apply(this, args);
                }
            }

            var now = +new Date();
            var execute = executeFunc.bind(this);

            
            if (method._lastCalled === undefined) {
                execute();
                
            } else if (method._lastCalled + timeout <= now) {
                
                execute();
                
            } else if (method._lastCalled + timeout > now) {
                this.unregTimeout(method._throttleTimer); 
                method._throttleTimer = this.regTimeout(execute, timeout);
            }
        },

        forwardEvent: function (object, event, handler) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            assert(this.dispatchEvent, "You need to add event mixing to use this function !");
            this.regEventListener(object, event, function (evt) {
                if (handler) {
                    handler(evt);
                }
                this.dispatchEvent(event, evt.detail);
            }.bind(this));
        },

        regEventListener: function (object, event, handler, useCapture) {
            assert(event && typeof event != "function" && typeof event != "object", "invalid event identifier");
            object.addEventListener(event, handler, useCapture);

            if (!this._eventListeners) {
                this._eventListeners = [];
            }

            
            this._eventListeners.push([object, event, handler, useCapture]);
        },
        unregEventListener: function (object, event, handler, useCapture) {
            
            object.removeEventListener(event, handler, useCapture);
            if (this._eventListeners) {
                for (var i = 0; i < this._eventListeners.length; i++) {
                    var listenerDef = this._eventListeners[i];
                    if (listenerDef[0] === object && listenerDef[1] === event && listenerDef[2] === handler && listenerDef[3] === useCapture) {
                        this._eventListeners.removeAt(i);
                        break;
                    }
                }
            }
        },
        unregObjectEventListeners: function (object) {
            if (this._eventListeners) {
                for (var i = this._eventListeners.length - 1; i >= 0 ; i--) {
                    var listenerDef = this._eventListeners[i];
                    if (listenerDef[0] === object) {
                        object.removeEventListener(listenerDef[1], listenerDef[2], listenerDef[3]);
                        this._eventListeners.removeAt(i);
                    }
                }
            }
        },

        regBind: function (object, property, handler) {
            var wrappedHandler = function (newValue, oldValue) {
                if (this.isDisposed) {
                    return;
                }
                handler(newValue, oldValue);
            }.bind(this);

            object && object.bind && object.bind(property, wrappedHandler);

            if (!this._binds) {
                this._binds = [];
            }

            
            this._binds.push([object, property, handler, wrappedHandler]);

            return {
                cancel: function () {
                    object && object.unbind && object.unbind(property, wrappedHandler);
                }
            };
        },
        unregBind: function (object, property, handler) {
            
            if (this._binds) {
                for (var i = 0; i < this._binds.length; i++) {
                    var bindDef = this._binds[i];
                    if (bindDef[0] === object && bindDef[1] === property && bindDef[2] === handler) {
                        this._binds.splice(i, 1);
                        object && object.unbind && object.unbind(property, bindDef[3]);
                        break;
                    }
                }
            }
        },
        unregObjectBinds: function (object) {
            var unbind = false;
            if (this._binds) {
                for (var i = this._binds.length - 1; i >= 0 ; i--) {
                    var bindDef = this._binds[i];
                    if (bindDef[0] === object) {
                        object.unbind && object.unbind(bindDef[1], bindDef[3]);
                        this._binds.removeAt(i);
                        unbind = true;
                    }
                }
                if (!unbind) {
                    log("WARNING - You are trying to unbind objects which do not exist");
                }
            }
        },

        regTimeout: function (fn, timeout) {
            
            
            
            
            
            
            
            
            
            var id;
            var wrapperFn = function regTimeoutImplWrapperFn() {
                this.unregTimeout(id);

                if (this.isDisposed) {
                    return;
                }

                fn();
            }.bind(this);

            id = setTimeout(wrapperFn, timeout);

            
            if (!this._timeouts) {
                this._timeouts = [];
            }
            this._timeouts.push(id);
            return id;
        },
        unregTimeout: function (id) {
            
            clearTimeout(id);
            if (this._timeouts) {
                for (var i = 0; i < this._timeouts.length; i++) {
                    if (this._timeouts[i] === id) {
                        this._timeouts.splice(i, 1);
                        break;
                    }
                }
            }
        },

        regPromise: function (promise) {
            if (!this._promises) {
                this._promises = [];
            }

            
            this._promises.push(promise);
            return promise;
        },
        unregPromise: function (promise) {
            

            
            
            _removeListeners(promise);

            function _removeListeners(promise) {
                
                if (promise && promise._creator && promise._creator != promise) {
                    _removeListeners(promise._creator);
                }

                promise._listeners = null;

                
                
                
                
                
                
                
                
                
                
                
            }

            promise.cancel();

            if (this._promises) {
                for (var i = 0; i < this._promises.length; i++) {
                    if (this._promises[i] === promise) {
                        this._promises.splice(i, 1);
                        break;
                    }
                }
            }
        },


        regInterval: function (fn, interval) {
            var id = setInterval(fn, interval);
            
            if (!this._intervals) {
                this._intervals = [];
            }
            this._intervals.push(id);
            return id;
        },
        unregInterval: function (id) {
            
            clearInterval(id);
            if (this._intervals) {
                for (var i = 0; i < this._intervals.length; i++) {
                    if (this._intervals[i] === id) {
                        this._intervals.splice(i, 1);
                        break;
                    }
                }
            }
        },

        regImmediate: function (fn, a, r, g, s) {            
            var id;
            var wrapperFn = function regImmediateWrapper() {
                this.unregImmediate(id);
                if (this.isDisposed) {
                    return;
                }

                fn.apply(this,arguments);
            }.bind(this);
            
            id = setImmediate(wrapperFn, a, r, g, s);
            
            if (!this._immediates) {
                this._immediates = [];
            }
            this._immediates.push(id);
            return id;
        },
        unregImmediate: function (id) {
            
            clearImmediate(id);
            if (this._immediates) {
                for (var i = 0; i < this._immediates.length; i++) {
                    if (this._immediates[i] === id) {
                        this._immediates.splice(i, 1);
                        break;
                    }
                }
            }
        },
    });

    WinJS.Namespace.define("Skype.Class", {
        Disposable: disposable,
        disposableMixin: disposable.prototype
    });
}());

(function () {
    "use strict";

    WinJS.Namespace.define("Skype.UI.Framework", {

        disposeInnerHTML: function (element) {
            WinJS.Utilities.disposeSubTree(element);
            element.innerHTML = "";
        },

        disposeSubTree: function (element) {
            

            var control = element && element.winControl;
            var disposableElement = control && control.dispose;
            if (disposableElement) {
                control.dispose();
            }

            WinJS.Utilities.disposeSubTree(element);
        }
    });
}());