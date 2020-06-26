//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var MAX_NUM_REATTEMPTS = 1,
        SharePointUpdateSyncResolution = WinJS.Class.define(function SharePointUpdateSyncResolution_ctor() {
            this._isResolved = ko.observable(!1);
            this._isResolvedWithKeepLocal = ko.observable(!1)
        }, {
            _isResolved: null, _isResolvedWithKeepLocal: null, isResolved: {get: function() {
                        return this._isResolved()
                    }}, isResolvedWithKeepLocal: {get: function() {
                        return this._isResolvedWithKeepLocal()
                    }}, resolve: function(resolveWithKeepLocal) {
                    this._isResolved(!0);
                    this._isResolvedWithKeepLocal(resolveWithKeepLocal)
                }
        }, {}),
        SyncNotificationViewModel = WinJS.Class.define(function SyncNotificationViewModel_Ctor(dsName, onCancelProgressCallback, onApplyCallback, onCancelResolveCallback) {
            this._dataSourceName = dsName;
            this._onCancelProgressCallback = onCancelProgressCallback;
            this._onApplyCallback = onApplyCallback;
            this._onCancelResolveCallback = onCancelResolveCallback;
            this._isConflictsVisible = ko.observable(!1);
            this._isUpdateErrorVisible = ko.observable(!1);
            this._isNoDataErrorVisible = ko.observable(!1);
            this._conflicts = ko.observableArray();
            this._resolutions = ko.observableArray();
            var isAllResolvedComputed = ko.computed(function() {
                    for (var isAllResolved = !0, resolutions = this._resolutions(), i = 0, len = resolutions.length; i < len; i++)
                        if (isAllResolved = isAllResolved && resolutions[i].isResolved, !isAllResolved)
                            break;
                    return isAllResolved
                }, this);
            AppMagic.Utility.createPrivateImmutable(this, "isAllResolved", isAllResolvedComputed)
        }, {
            _dataSourceName: null, _conflicts: null, _isConflictsVisible: null, _isUpdateErrorVisible: null, _isNoDataErrorVisible: null, _onCancelProgressCallback: null, _onApplyCallback: null, _onCancelResolveCallback: null, _resolutions: null, serverSchema: null, dataSourceName: {get: function() {
                        return this._dataSourceName
                    }}, isConflictsVisible: {get: function() {
                        return this._isConflictsVisible()
                    }}, isNoDataErrorVisible: {
                    get: function() {
                        return this._isNoDataErrorVisible()
                    }, set: function(value) {
                            this._isNoDataErrorVisible(value)
                        }
                }, isUpdateErrorVisible: {
                    get: function() {
                        return this._isUpdateErrorVisible()
                    }, set: function(value) {
                            this._isUpdateErrorVisible(value)
                        }
                }, url: {get: function() {
                        return "/ctrllib/sharePointUpdate/syncNotification/syncNotification.html"
                    }}, conflicts: {get: function() {
                        return this._conflicts()
                    }}, resolutions: {get: function() {
                        return this._resolutions()
                    }}, setConflicts: function(conflicts) {
                    this._resolutions(conflicts.map(function() {
                        return new SharePointUpdateSyncResolution
                    }));
                    this._conflicts.push.apply(this._conflicts, conflicts)
                }, onClickReviewConflicts: function() {
                    this._isConflictsVisible(!0)
                }, onClickCancelProgress: function() {
                    this._onCancelProgressCallback && this._onCancelProgressCallback()
                }, onClickVersion: function(checkIndex, resolveWithKeepLocal) {
                    this._resolutions()[checkIndex].resolve(resolveWithKeepLocal)
                }, onClickCancelResolve: function() {
                    this._onCancelResolveCallback && this._onCancelResolveCallback()
                }, onClickResolveAll: function(resolveWithKeepAllLocal) {
                    this._resolutions().forEach(function(x) {
                        x.resolve(resolveWithKeepAllLocal)
                    });
                    this.onClickApply()
                }, onClickApply: function() {
                    this._onApplyCallback && this._onApplyCallback()
                }
        }, {}),
        SharePointUpdate = WinJS.Class.derive(AppMagic.Controls.Button, function SharePointUpdate_Ctor() {
            AppMagic.Controls.Button.call(this)
        }, {
            initControlContext: function(controlContext) {
                AppMagic.Utility.createOrSetPrivate(controlContext, "_promiseSync", null)
            }, _performSync: function(runtime, listUri, controlContext, dsName, retryIfFail) {
                    return runtime.syncDataSource(dsName).then(function(response) {
                            if (response.success)
                                controlContext.properties.IsError(!1);
                            else if (response.message === AppMagic.Strings.SharePointSyncError_UnableToReachServer && retryIfFail)
                                return AppMagic.RuntimeBase.ensureSharePointAuthentication(listUri).then(function() {
                                        return this._performSync(runtime, listUri, controlContext, dsName, !1)
                                    }.bind(this));
                            else
                                this._setError(controlContext, response.message, errorTitle)
                        }.bind(this))
                }, _handleClick: function(controlContext) {
                    var clickHandlerArguments = arguments,
                        promise = WinJS.Promise.wrap(),
                        data = controlContext.properties.DataSource();
                    if (controlContext._promiseSync === null && data) {
                        var rt = AppMagic.AuthoringTool.Runtime,
                            meta = data[rt.metaProperty];
                        if (meta) {
                            var dsName = meta.name,
                                errorTitle = AppMagic.Strings.SharePointSyncError_SharePointUpdateErrorTitle,
                                errorContent;
                            if (rt.hasError(dsName))
                                promise = promise.then(function() {
                                    this._setError(controlContext, meta[rt.errorProperty], errorTitle)
                                }.bind(this));
                            else {
                                var pluginType = meta.pluginType;
                                if (AppMagic.Constants.Services.SharePointServices.indexOf(pluginType) >= 0) {
                                    var dataSourceType = meta.dataSourceType,
                                        configuration = meta.configuration;
                                    dsName && dataSourceType && configuration && (controlContext._promiseSync = this._performSync(rt, data[AppMagic.AuthoringTool.Runtime.metaProperty].configuration.siteUri, controlContext, dsName, !0).then(null, function() {
                                        this._setError(controlContext, AppMagic.Strings.SharePointSyncError_SharePointUpdateErrorUnknownError, errorTitle)
                                    }.bind(this)).then(function() {
                                        controlContext._promiseSync = null
                                    }), promise = controlContext._promiseSync)
                                }
                            }
                        }
                    }
                    promise.then(function() {
                        AppMagic.Controls.Button.prototype._handleClick.apply(this, clickHandlerArguments)
                    }.bind(this))
                }, _setError: function(controlContext, errorMessage, errorTitle) {
                    controlContext.properties.IsError(!0);
                    var errorContent = Core.Utility.formatString(AppMagic.Strings.SharePointSyncError_SharePointUpdateErrorContentFormat, errorMessage);
                    AppMagic.AuthoringTool.PlatformHelpers.showNotification(errorTitle, errorContent)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {SharePointUpdate: SharePointUpdate})
})();