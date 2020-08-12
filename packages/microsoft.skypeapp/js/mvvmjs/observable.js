

(function () {
    "use strict";

    function makeObservableProperties(members, properties) {
        var keys = Object.keys(members);
        properties = properties || {};
        var i, len;
        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            if (properties[key]) {
                continue;
            }

            var enumerable = key.charCodeAt(0) !== 95;
            var member = members[key];
            if (member && typeof member === 'object') {
                if (typeof member.get === 'function' || typeof member.set === 'function') {
                    if (member.enumerable === undefined) {
                        member.enumerable = enumerable;
                    }

                    (function (k, m) {
                        properties[k] = {
                            get: m.get,
                            set: function (value) {
                                this.setProperty(k, value, m.set);
                            }
                        };
                    }(key, member));
                    continue;
                }
            }
            (function (k, defaultValue) {
                var wrk = "__wr" + k;
                properties[wrk] = {
                    value: defaultValue && defaultValue.value !== undefined ? defaultValue.value : defaultValue,
                    writable: true
                };

                properties[k] = {
                    get: function () {
                        return this.getProperty(wrk, this[wrk]);
                    },
                    set: function (value) {
                        this.setProperty(k, value, function (v) { this[wrk] = v; });
                    }
                };

            }(key, members[key]));
            continue;
        }
        return properties;
    }
    function unwrap(data) {
        
        
        
        
        
        
        
        
        
        if (data && data.backingData) {
            return data.backingData;
        } else {
            return data;
        }
    }

    var customObservableMix = {
        notify: function (name, newValue, oldValue) {
            if (newValue === undefined && oldValue === undefined) {
                if (this._listeners && this._listeners[name]) {
                    newValue = this[name];
                    WinJS.Binding.dynamicObservableMixin.notify.call(this, name, newValue);
                }
            } else {
                WinJS.Binding.dynamicObservableMixin.notify.call(this, name, newValue, oldValue);
            }
            this.dispatchEvent("propertychanged", name);
        },
        getProperty: function (name, defaultValue) {
            
            
            
            
            
            
            
            
            
            var data = this._backingData ? this._backingData[name] : undefined;
            if (data === undefined) {
                data = defaultValue;
            }

            if (WinJS.log && data === undefined) {
                WinJS.log(WinJS.Resources._formatString(WinJS.Resources._getWinJSString("base/propertyIsUndefined").value, name), "winjs binding", "warn");
            }
            if (name.charAt(0) === '_') {
                return data;
            }
            return WinJS.Binding.as(data);
        },
        updateProperty: function (name, value, setter) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

            var oldValue = this._backingData ? this._backingData[name] : undefined;
            var newValue = unwrap(value);
            if (oldValue !== newValue) {
                if (setter) {
                    setter.call(this, newValue);
                } else {
                    this._backingData[name] = newValue;
                }

                
                
                
                
                
                
                return this.notify(name, newValue, oldValue);
            }
            return WinJS.Promise.as();
        },
        setProperty: function (name, value, setter) {
            
            
            
            
            
            
            
            
            
            
            
            

            this.updateProperty(name, value, setter);
            return this;
        }
    };

    WinJS.Namespace.define("MvvmJS", {
        Class: {
            define: function (ctor, instanceMembers, observableMembers, staticMembers) {
                var newCtor = function () {
                    if (observableMembers) {
                        if (!this._backingData) {
                            this._initObservable(this);
                        }
                    }
                    ctor.apply(this, arguments);
                };

                var classDef = WinJS.Class.define(newCtor, instanceMembers, staticMembers);
                if (observableMembers) {
                    classDef = WinJS.Class.mix(classDef, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, customObservableMix, makeObservableProperties(observableMembers), Skype.Class.disposableMixin);
                }

                expandSkipDispose(classDef, instanceMembers, observableMembers);

                return classDef;
            },
            derive: function (baseClass, ctor, instanceMembers, observableMembers, staticMembers) {

                instanceMembers = instanceMembers || {};

                var baseConstructors = [function () {
                    baseClass.prototype.constructor.apply(this, arguments);
                }];

                if (baseClass.prototype._baseConstructors) {
                    baseConstructors = baseClass.prototype._baseConstructors.concat(baseConstructors);
                }

                instanceMembers._baseConstructors = baseConstructors;
                instanceMembers.base = function () {
                    var isConcreteClass = this._baseConstructors === baseConstructors;
                    if (isConcreteClass) {
                        this._baseConstructors = this._baseConstructors.concat();
                    }

                    var baseConstructor = this._baseConstructors.pop();
                    if (baseConstructor) {
                        baseConstructor.apply(this, arguments);
                    }

                    if (isConcreteClass) {
                        this._baseConstructors = baseConstructors;
                    }
                };

                var classDef = WinJS.Class.derive(baseClass, function () {
                    if (observableMembers) {
                        if (!this._backingData) {
                            this._initObservable(this);
                        }
                    }
                    ctor.apply(this, arguments);
                }, instanceMembers, staticMembers);


                if (observableMembers) {
                    classDef = WinJS.Class.mix(classDef, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, customObservableMix, makeObservableProperties(observableMembers), Skype.Class.disposableMixin);
                }
                classDef.base = baseClass.prototype;

                expandSkipDispose(classDef, instanceMembers, observableMembers, baseClass);

                return classDef;

            }
        }
    });
    
    function expandSkipDispose(classDef, instanceMembers, observableMembers, baseClass) {
        var skipDispose = {};
        Object.defineProperty(classDef.prototype, "__skipDispose", { value: skipDispose });
        var baseSkipDispose = baseClass && baseClass.prototype.__skipDispose;
        for (var basePropName in baseSkipDispose) {
            skipDispose[basePropName] = baseSkipDispose[basePropName];
        }

        for (var member in instanceMembers) {
            if (instanceMembers[member] instanceof Object) {
                if (instanceMembers[member].skipDispose) {
                    skipDispose[member] = true;
                }
            }
        }

        for (member in observableMembers) {
            if (observableMembers[member] instanceof Object) {
                if (observableMembers[member].skipDispose) {
                    skipDispose["__wr" + member] = true;
                }
            }
        }
    }

    var expandProperties = WinJS.Binding.expandProperties = function (shape, owner) {
        
        
        
        
        
        
        
        
        
        
        
        var props = {};
        owner = owner || shape;
        while (shape && shape !== Object.prototype) {
            
            Object.getOwnPropertyNames(shape).forEach(function (k) {
                if (props[k]) {
                    return;
                }

                var descr = Object.getOwnPropertyDescriptor(shape, k);
                if (typeof descr.value === "function") {
                    props[k] = {
                        value: shape[k].bind(owner),
                        enumerable: true,
                        writable: false
                    };
                } else {
                    var enumerable = k.charCodeAt(0) !== 95;

                    props[k] = {
                        get: function () { return this.getProperty(k); },
                        set: function (value) { this.setProperty(k, value); },
                        enumerable: enumerable,
                        configurable: true 
                    };
                }
            });
            shape = Object.getPrototypeOf(shape);
        }
        return props;
    };
    var ObservableProxy = WinJS.Class.mix(function (data) {
        this._initObservable(data);
        
        Object.defineProperties(this, expandProperties(data, this));
    }, WinJS.Binding.dynamicObservableMixin, customObservableMix, WinJS.Utilities.eventMixin);

    WinJS.Binding.as = function (data) {
        
        
        
        
        
        
        
        
        
        

        if (!data) {
            return data;
        }

        var type = typeof data;
        if (type === "object" && !(data instanceof Date) && !(data instanceof Array) && Object.isExtensible(data)) {
            if (data._getObservable) {
                return data._getObservable();
            }

            var observable = new ObservableProxy(data);
            observable.backingData = data;
            Object.defineProperty(
                data,
                "_getObservable",
                {
                    value: function () { return observable; },
                    enumerable: false,
                    writable: false
                }
            );
            return observable;
        } else {
            return data;
        }
    };
}());