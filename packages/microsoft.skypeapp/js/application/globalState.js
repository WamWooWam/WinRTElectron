

(function () {
    "use strict";


    var globalState = MvvmJS.Class.define(function(providers) {
        this._providers = providers;
        this.page = {};
    }, {
        _uiLanguage: "en-US",
        _isRTL: false,
        _keyboardOccludedRectangle: null,
        _isAlive: false,
        _forcedOffline: null,
        startedResumedTimestamp: null,

        alive: function() {
            if (this._isAlive) {
                return;
            }

            for (var i = 0; i < this._providers.length; i++) {
                this._providers[i].alive();
            }

            this._isAlive = true;
        },
        
        

        
        
        
        
        navigated: {
            get: function() {
                var that = this;
                return this._navigated || (this._navigated = {
                    dispatch: function(args) {
                        that.regImmediate(function() {
                            that.dispatchEvent("navigated", args);
                        });
                    }
                });
            }
        },

        deviceListChanged: {
            get: function() {
                var that = this;
                return this._deviceListChanged || (this._deviceListChanged = {
                    dispatch: function(args) {
                        that.regImmediate(function() {
                            that.dispatchEvent("deviceListChanged", args);
                        });
                    }
                });
            }
        },
        
        historyCleared: {
            get: function() {
                var that = this;
                return this._historyCleared || (this._historyCleared = {
                    dispatch: function(args) {
                        that.regImmediate(function() {
                            that.dispatchEvent("historyCleared", args);
                        });
                    }
                });
            }
        },
    }, {

        isApplicationActive: null,


        
        isPeoplePickerOpened: false,
        
        isAppBarOpened: false,

        
        isMePanelOpened: false,

        
        
        
        
        
        page: null,
        
        
        uiLanguage: {
            get: function() {
                return this._uiLanguage;
            },

            set: function(value) {
                if (value !== this._uiLanguage) {
                    this._uiLanguage = value;
                    this._isRTL = Skype.Globalization.isRightToLeft(value);
                    this.notify("uiLanguage");
                    this.notify("isRTL");
                }
            }
        },

        forcedOffline: {
            get: function () {
                if (this._forcedOffline === null) {
                    
                    this._forcedOffline = !!Windows.Storage.ApplicationData.current.localSettings.values["offline"];
                }

                return this._forcedOffline;
            },
            set: function (value) {
                this._forcedOffline = value;
                 
                
                if (value) {
                    Windows.Storage.ApplicationData.current.localSettings.values["offline"] = true;
                } else {
                    Windows.Storage.ApplicationData.current.localSettings.values.remove("offline");
                }
            }
        },

        
        isRTL: {
            get: function() {
                return this._isRTL;
            },
        },

        
        isShowingKeyboard: {
            get: function() {
                return this._isShowingKeyboard;
            },

            set: function(value) {
                var shown = value.shown;
                if (shown !== this._isShowingKeyboard) {
                    this._isShowingKeyboard = shown;
                    this._keyboardOccludedRectangle = value.occludedRect;
                    this.notify("isShowingKeyboard");
                }
            }
        },

        
        keyboardOccludedRectangle: {
            get: function() {
                return this._keyboardOccludedRectangle;
            },
        },
        policy: Skype.Application.Policy.create(),
        view: new Skype.Application.ViewState(),
        focusedConversation: new Skype.Application.ConversationState(),
        
        
        
        search: Object.defineProperties(WinJS.Binding.as({
            
            directorySearchOnly: false,
            
            typeToSearchEnabled: false
        }), {
            
            queryText: {
                get: function () {
                    return WinJS.Application.sessionState.searchText;
                },
                set: function (value) {
                    var oldValue = WinJS.Application.sessionState.searchText;
                    WinJS.Application.sessionState.searchText = value;
                    this.notify("queryText", value, oldValue);
                }
            }
        }),

    }, {
        
    });


    WinJS.Namespace.define("Skype.Application", {
        GlobalState: WinJS.Class.mix(globalState, Skype.Class.disposableMixin),
    });

    window.traceClassMethods && window.traceClassMethods(globalState, "GlobalState", ["alive"]);

}());