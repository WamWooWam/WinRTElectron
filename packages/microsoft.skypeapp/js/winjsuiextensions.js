

(function () {
    "use strict";

    var etw = new Skype.Diagnostics.ETW.Tracer("SkypeExt.WinJS.UI.ListView");

    function getProfilerMarkName(element) {
        var profileMarkName = element.profileMarkName;
        if (!profileMarkName) {
            var indexOfDelimiter = element.className.indexOf(" ");
            if (indexOfDelimiter !== -1) {
                profileMarkName = element.profileMarkName = element.className.substr(0, indexOfDelimiter);
            } else {
                profileMarkName = element.profileMarkName = element.className;
            }
        }
        return profileMarkName;
    }

    
    

    var WinJS_Binding_processAll = WinJS.Binding.processAll;
    WinJS.Binding.processAll = function (rootElement, dataContext, skipRoot, bindingCache, defaultInitializer) {
        assert(!!rootElement, "ERROR -- binding to null element is forbidden !");
        return WinJS_Binding_processAll.call(this, rootElement, dataContext, skipRoot, bindingCache, defaultInitializer);
    };

    var WinJS_UI_processAll = WinJS.UI.processAll;
    WinJS.UI.processAll = function (rootElement, skipRoot) {
        assert(!!rootElement, "ERROR -- processing null element !");
        return WinJS_UI_processAll.call(this, rootElement, skipRoot);
    };

    var WinJS_Resources_processAll = WinJS.Resources.processAll;
    WinJS.Resources.processAll = function (rootElement) {
        assert(!!rootElement, "ERROR -- processing null element !");
        return WinJS_Resources_processAll.call(this, rootElement);
    };

    
    

    var ListView_setViewState = WinJS.UI.ListView.prototype._setViewState;
    WinJS.UI.ListView.prototype._setViewState = function (state, detail) {

        var preState = this._loadingState;
        ListView_setViewState.call(this, state, detail);
        Skype.UI.Util.setClass(this._element, "LISTLOADING", this._loadingState === "itemsLoading");

        var postState = this._loadingState;
        if (preState !== postState) {
            var profileMarkName = getProfilerMarkName(this._element);
            etw.write(profileMarkName + ",loadingStateChanged:" + postState);
            if (postState == "complete") {
                roboSky.write(profileMarkName + ",loadingStateChanged:" + postState); 
            }
        }
    };
    
    
    var Rating_closeTooltip = WinJS.UI.Rating.prototype._closeTooltip;
    WinJS.UI.Rating.prototype._closeTooltip = function (tooltipType) {
        var tControl = this._clearElement && this._clearElement.winControl;
        Rating_closeTooltip.call(this, tooltipType);
        if (tControl && !this._clearElement) {
            tControl.dispose();
        }
    };

    
    var ListView_fireAnimationEvent = WinJS.UI.ListView.prototype._fireAnimationEvent;
    WinJS.UI.ListView.prototype._fireAnimationEvent = function (type) {
        var result = ListView_fireAnimationEvent.call(this, type);

        var profileMarkName = getProfilerMarkName(this._element);
        etw.write(profileMarkName + ",contentanimating:" + type);
        log(profileMarkName + ",contentanimating:" + type);

        return result;
    };


    var ListView_onFocus = WinJS.UI.ListView.prototype._onFocus;
    WinJS.UI.ListView.prototype._onFocus = function (evt) {
        ///<disable>JS2045.ReviewEmptyBlocks</disable>
        if (event.srcElement === this._keyboardEventsHelper) {
        } else if (event.srcElement === this._element) {
        } else {
            var items = this._view.items,
                itemRootElement = items.wrapperFrom && items.wrapperFrom(event.srcElement);

            if (itemRootElement && this._tabManager.childFocus !== itemRootElement) {
                var index = items.index(itemRootElement);

                if (index === WinJS.UI._INVALID_INDEX) {
                    return;
                }
            }
        }
        ///<enable>JS2045.ReviewEmptyBlocks</enable>

        ListView_onFocus.call(this, evt);
    };



    var ListView_clearFocusRectangle = WinJS.UI.ListView.prototype._clearFocusRectangle;
    WinJS.UI.ListView.prototype._clearFocusRectangle = function (item) {
        if (!item || this._isZombie()) {
            return;
        }
        var wrapper = WinJS.Utilities.hasClass(item, WinJS.UI._wrapperClass) ? item : item.parentNode;
        if (wrapper) {
            ListView_clearFocusRectangle.call(this, item);
        } else {
            log("ListView: possible exception was cought for " + (this.element && this.element.className));
        }
    };




    var LayoutCommon_setupAnimations = WinJS.UI._LayoutCommon.prototype.setupAnimations;
    
    WinJS.UI._LayoutCommon.prototype.setupAnimations = function () {
        if (this._site.tree) {
            LayoutCommon_setupAnimations.call(this);
        }
    };


    WinJS.Application.skypeLoadStateAsync = function (e) {
        return new WinJS.Promise(function (completeCallback) {
            var app = WinJS.Application;
            var localFolder = Windows.Storage.ApplicationData.current.localFolder;

            try {
                localFolder.getFileAsync("_sessionState.json")
                .then(Windows.Storage.FileIO.readTextAsync)
                .done(function (str) {
                    var sessionState = {};

                    try {
                        sessionState = JSON.parse(str); 
                    } catch(ex) {
                        log("Error while parsing session data '" + str + "'");
                    }

                    if (sessionState && Object.keys(sessionState).length > 0) {
                        app._sessionStateLoaded = true;
                    }
                    if ((!app.sessionState.timestamp) || (sessionState.timestamp && sessionState.timestamp > app.sessionState.timestamp)) {
                        app.sessionState = sessionState;
                    }
                    completeCallback();
                },
                function onError(error) {
                    
                    log("Error in reading _sessionState.json'" + error + "'");

                    completeCallback();
                });

            } catch (ex) {
                completeCallback();
            }
        });
    };

    WinJS.Application.skypeWriteStateAsync = function (e) {
        return new WinJS.Promise(function (completeCallback) {
            var app = WinJS.Application;
            var sessionState = app.sessionState;

            var needsToSave = (sessionState && Object.keys(sessionState).length > 0) || app._sessionStateLoaded;
            if (needsToSave) {
                
                try {
                    var localFolder = Windows.Storage.ApplicationData.current.localFolder;
                    localFolder.createFileAsync("_sessionState.json", Windows.Storage.CreationCollisionOption.replaceExisting)
                    .then(function (file) {
                        
                        return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(sessionState));
                    })
                    .done(completeCallback, function (error) {
                        log("[Stats] Error {0} accessing _sessionState.json ({1})".format(error.number, error.message));

                        
                        completeCallback();
                    });
                } catch (ex) {
                    completeCallback();
                }
            } else {
                
                completeCallback();
            }
        });
    };


}());