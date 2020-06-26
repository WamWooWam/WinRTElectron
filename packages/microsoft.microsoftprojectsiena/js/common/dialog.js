//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Dialog = AppMagic.Popups.Dialog,
        CachedAuthDialogViewModel = WinJS.Class.define(function CachedAuthDialogViewModel_ctor(title, description, services) {
            this._title = ko.observable(title);
            this._description = ko.observable(description);
            this._services = ko.observable(services);
            this._buttons = [];
            this._url = ko.observable("/controls/common/dialog/cachedAuthDialog.html");
            this._cachedAuthDialogResult = ko.observable()
        }, {
            _buttons: null, _url: null, _title: null, _description: null, _services: null, _getServiceImageOrDefault: function(serviceName) {
                    var serviceImage = AppMagic.Constants.DataConnections.Icons_monochrome[serviceName];
                    return typeof serviceImage == "undefined" && (serviceImage = AppMagic.Constants.DataConnections.Icons_monochrome.rest), serviceImage
                }, buttons: {get: function() {
                        return this._buttons
                    }}, url: {get: function() {
                        return this._url()
                    }}, title: {get: function() {
                        return this._title()
                    }}, description: {get: function() {
                        return this._description()
                    }}, cachedAuthDialogResult: {get: function() {
                        return this._cachedAuthDialogResult()
                    }}, services: {get: function() {
                        return this._services().map(function(serviceName) {
                                return {
                                        name: serviceName, image: this._getServiceImageOrDefault(serviceName)
                                    }
                            }, this)
                    }}, onClickYes: function() {
                    this._cachedAuthDialogResult(CachedAuthDialog.UseCachedAuth);
                    Microsoft.AppMagic.Common.TelemetrySession.telemetry.logCachedAuthDialog("Yes")
                }, onClickNo: function() {
                    this._cachedAuthDialogResult(CachedAuthDialog.DisposeCachedAuth);
                    Microsoft.AppMagic.Common.TelemetrySession.telemetry.logCachedAuthDialog("No")
                }
        }),
        CachedAuthDialog = WinJS.Class.derive(Dialog, function CachedAuthDialog_ctor(description, title, serviceNames) {
            this._cachedAuthDialogViewModel = new CachedAuthDialogViewModel(description, title, serviceNames);
            this._cachedAuthDialogResult = ko.computed(function() {
                return this._cachedAuthDialogViewModel.cachedAuthDialogResult
            }, this);
            this._cachedAuthDialogResultSubscription = this._cachedAuthDialogResult.subscribe(function(result) {
                result === CachedAuthDialog.DisposeCachedAuth && (AppMagic.AuthoringTool.Runtime.disposeSessionAuthData(), this._ensureAzureLogout(serviceNames));
                this.close()
            }, this);
            this._cancelCommandIndex = 1;
            Dialog.call(this, this._cachedAuthDialogViewModel)
        }, {
            _cachedAuthDialogViewModel: null, _cachedAuthDialogResult: null, _cachedAuthDialogResultSubscription: null, _cancelCommandIndex: null, dispose: function() {
                    this._cachedAuthDialogResult.dispose();
                    this._cachedAuthDialogResultSubscription.dispose();
                    Dialog.prototype.dispose.call(this)
                }, _ensureAzureLogout: function(serviceNames) {
                    var isAzureConnected = serviceNames.some(function(serviceName) {
                            return CachedAuthDialog.AzureServiceRegex.test(serviceName)
                        });
                    AppMagic.AuthoringTool.Runtime.isConnectedToCorpNet() && isAzureConnected && AppMagic.AuthoringTool.Runtime.sendAzureLogoutRequest()
                }
        }, {
            DisposeCachedAuth: "dispose-cached-auth", UseCachedAuth: "use-cached-auth", AzureServiceRegex: new RegExp("^" + AppMagic.Services.AzureConstants.ServiceKeys.office365 + "(_d+)?$")
        }),
        MessageDialogViewModel = WinJS.Class.define(function MessageDialogViewModel_ctor(description, title, showWarningIcon) {
            this._title = ko.observable(title);
            this._description = ko.observable(description);
            this._showWarningIcon = ko.observable(showWarningIcon);
            this._buttons = ko.observableArray();
            this._url = ko.observable("/controls/common/dialog/messageDialogBody.html")
        }, {
            _buttons: null, _url: null, _title: null, _description: null, _showWarningIcon: null, buttons: {get: function() {
                        return this._buttons()
                    }}, url: {get: function() {
                        return this._url()
                    }}, title: {get: function() {
                        return this._title()
                    }}, description: {get: function() {
                        return this._description()
                    }}, showWarningIcon: {get: function() {
                        return this._showWarningIcon()
                    }}
        }),
        MessageDialog = WinJS.Class.derive(Dialog, function MessageDialog_ctor(description, title, showWarningIcon) {
            this._messageDialogViewModel = new MessageDialogViewModel(description, title, showWarningIcon);
            this._messageDialogViewModel.buttons.push(new AppMagic.Popups.DialogButtonViewModel(AppMagic.Strings.Close, function() {
                this.close()
            }.bind(this)));
            Dialog.call(this, this._messageDialogViewModel)
        }, {
            _messageDialogViewModel: null, _buttonsOverridden: !1, addButton: function(title, clickFunction, shortcutLetter) {
                    this._buttonsOverridden || (this._messageDialogViewModel._buttons.removeAll(), this._shortcutsProvider.reset(), this._buttonsOverridden = !0);
                    var buttonViewModel = new AppMagic.Popups.DialogButtonViewModel(title, function() {
                            Core.Utility.isNullOrUndefined(clickFunction) || clickFunction();
                            this.close(title)
                        }.bind(this), shortcutLetter);
                    this._messageDialogViewModel.buttons.push(buttonViewModel);
                    this._shortcutsProvider.addButtonShortcut(buttonViewModel)
                }
        }),
        RestDialogViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function RestDialogViewModel_ctor(icon, serviceId, templateVariableDefs, settings, connectFn, cancelFn, docDictionary, preferredLang) {
            AppMagic.Utility.Disposable.call(this);
            var constants = AppMagic.Constants.Services.Rest;
            this._icon = icon;
            this._serviceId = serviceId;
            this._settings = settings;
            this._connectFn = connectFn;
            var savedUserFormInput = this._getSettingsDataOrDefault();
            var userVariableNameValueMap = AppMagic.Utility.mapDefinitionsHashTableWithSort(templateVariableDefs, constants.JsonObjectPropertyKey_DisplayIdx, function(variableName, templateVariableDef) {
                    var varTitle = AppMagic.Services.Meta.RESTWorkerController.getDocTitleOrDefault(templateVariableDef, variableName, docDictionary, preferredLang);
                    var initialValue = savedUserFormInput[variableName] || "";
                    return {
                            name: variableName, def: templateVariableDef, title: varTitle, value: ko.observable(initialValue)
                        }
                });
            this._userVariables = ko.observableArray(userVariableNameValueMap);
            this._buttons = ko.observableArray();
            this._url = ko.observable("/controls/common/dialog/restDialogBody.html");
            this.track("_isConnectEnabled", ko.computed(function() {
                return this._userVariables().every(function(userVariable) {
                        return userVariable.value().length > 0
                    })
            }.bind(this)));
            this.buttons.push(new AppMagic.Popups.DialogButtonViewModel(AppMagic.Strings.Connect, this._onClickConnect.bind(this), null, this._isConnectEnabled));
            this.buttons.push(new AppMagic.Popups.DialogButtonViewModel(AppMagic.Strings.Cancel, cancelFn))
        }, {
            _buttons: null, _url: null, _serviceId: null, _userVariables: null, _icon: null, _isConnectEnabled: null, _connectFn: null, _settings: null, buttons: {get: function() {
                        return this._buttons()
                    }}, url: {get: function() {
                        return this._url()
                    }}, icon: {get: function() {
                        return this._icon
                    }}, title: {get: function() {
                        return this._serviceId
                    }}, userVariables: {get: function() {
                        return this._userVariables()
                    }}, onHelpLinkClick: function() {
                    AppMagic.AuthoringTool.Utility.openLinkInBrowser(AppMagic.Strings.RestDialogHelpUrl)
                }, onClickForgetInfo: function() {
                    for (var userVariables = this._userVariables(), i = 0, len = userVariables.length; i < len; i++)
                        userVariables[i].value("");
                    this._clearSettingsData()
                }, _onClickConnect: function() {
                    var newInitialValues = this.getUserVariableValuesByName();
                    this._setSettingsData({templateVariableInitialValues: newInitialValues});
                    this._connectFn()
                }, _setSettingsData: function(settingsData) {
                    var settingsMarker = RestDialogViewModel.SettingsMarkerImportedRestServicePackage,
                        importedRestServicesData = this._settings.getValue(settingsMarker);
                    importedRestServicesData = typeof importedRestServicesData == "undefined" ? {} : importedRestServicesData;
                    importedRestServicesData[this._serviceId] = settingsData;
                    this._settings.setValue(settingsMarker, importedRestServicesData)
                }, _getSettingsDataOrDefault: function() {
                    var importedRestServicesData = this._settings.getValue(RestDialogViewModel.SettingsMarkerImportedRestServicePackage);
                    return typeof importedRestServicesData == "undefined" || typeof importedRestServicesData[this._serviceId] == "undefined" ? {} : importedRestServicesData[this._serviceId].templateVariableInitialValues
                }, _clearSettingsData: function() {
                    var settingsMarker = RestDialogViewModel.SettingsMarkerImportedRestServicePackage,
                        importedRestServicesData = this._settings.getValue(settingsMarker);
                    importedRestServicesData && (delete importedRestServicesData[this._serviceId], this._settings.setValue(settingsMarker, importedRestServicesData))
                }, getUserVariableValuesByName: function() {
                    var valuesByName = {},
                        userVariables = this._userVariables();
                    return userVariables.forEach(function(userVar) {
                            valuesByName[userVar.name] = userVar.value()
                        }), valuesByName
                }
        }, {SettingsMarkerImportedRestServicePackage: "IMPORTED_SERVICE_SAVED_TEMPLATE_VALUES"}),
        RestDialog = WinJS.Class.derive(Dialog, function RestDialog_ctor(icon, serviceId, templateVariableDefs, settings, onConnectFunction, onCancelFunction, docDictionary, preferredLang) {
            var connectFn = function() {
                    var valuesByName = this._restDialogViewModel.getUserVariableValuesByName();
                    onConnectFunction(valuesByName);
                    this.close()
                }.bind(this),
                cancelFn = function() {
                    var valuesByName = this._restDialogViewModel.getUserVariableValuesByName();
                    onCancelFunction(valuesByName);
                    this.close()
                }.bind(this);
            this._restDialogViewModel = new RestDialogViewModel(icon, serviceId, templateVariableDefs, settings, connectFn, cancelFn, docDictionary, preferredLang);
            Dialog.call(this, this._restDialogViewModel)
        }, {_restDialogViewModel: null}),
        WaitDialogViewModel = WinJS.Class.define(function WaitDialogViewModel(text) {
            this._text = ko.observable(text);
            this._buttons = [];
            this._url = ko.observable("/controls/common/dialog/waitDialogBody.html")
        }, {
            _buttons: null, _text: null, _url: null, buttons: {get: function() {
                        return this._buttons
                    }}, text: {get: function() {
                        return this._text()
                    }}, url: {get: function() {
                        return this._url()
                    }}
        }),
        WaitDialog = WinJS.Class.derive(Dialog, function WaitDialog_ctor(text) {
            this._waitDialogViewModel = new WaitDialogViewModel(text);
            Dialog.call(this, this._waitDialogViewModel)
        }, {_waitDialogViewModel: null}),
        AuthenticationDialogViewModel = WinJS.Class.define(function AuthenticationDialogViewModel_ctor(requestUri, callbackUri) {
            this._requestUri = requestUri;
            this._callbackUri = callbackUri;
            this._buttons = [];
            this._url = ko.observable("/controls/common/dialog/authDialogBody.html");
            this._navigatedUris = [];
            this._authenticationResult = ko.observable();
            this._isCompleted = !1;
            this._hasLoaded = ko.observable(!1)
        }, {
            _requestUri: null, _callbackUri: null, _buttons: null, _authenticationResult: null, _navigatedUris: null, _hasLoaded: null, hasLoaded: {
                    get: function() {
                        return this._hasLoaded()
                    }, set: function(val) {
                            this._hasLoaded(val)
                        }
                }, requestUri: {get: function() {
                        return this._requestUri
                    }}, callbackUri: {get: function() {
                        return this._callbackUri
                    }}, navigatedUris: {get: function() {
                        return this._navigatedUris
                    }}, authenticationResult: {get: function() {
                        return this._authenticationResult()
                    }}, buttons: {get: function() {
                        return this._buttons
                    }}, fullScreen: {get: function() {
                        return !0
                    }}, url: {get: function() {
                        return this._url()
                    }}, notifyAuthenticationComplete: function(result) {
                    this._isCompleted || (result.authenticationStatus !== AppMagic.Services.AuthenticationStatus.inProgress && (this._isCompleted = !0), result.navigatedUris = this.navigatedUris, this._authenticationResult(result))
                }, onClickCancel: function() {
                    this.notifyAuthenticationComplete({
                        responseData: AppMagic.Strings.AuthenticationBrokerManagerErrorUserCanceled, authenticationStatus: AppMagic.Services.AuthenticationStatus.cancel
                    })
                }
        }),
        AuthenticationDialog = WinJS.Class.derive(Dialog, function AuthenticationDialog_ctor(requestUri, callbackUri) {
            this._authenticationDialogViewModel = new AuthenticationDialogViewModel(requestUri, callbackUri);
            this._authenticationResult = ko.computed(function() {
                return this._authenticationDialogViewModel.authenticationResult
            }.bind(this));
            this._authenticationResultSubscription = this._authenticationResult.subscribe(function(newVal) {
                newVal.authenticationStatus !== AppMagic.Services.AuthenticationStatus.inProgress && this.close()
            }.bind(this));
            Dialog.call(this, this._authenticationDialogViewModel)
        }, {
            _authenticationDialogViewModel: null, _authenticationResult: null, _authenticationResultSubscription: null, _responseData: null, authenticationResult: {get: function() {
                        return this._authenticationResult()
                    }}, dispose: function() {
                    this._authenticationResult.dispose();
                    this._authenticationResultSubscription.dispose();
                    Dialog.prototype.dispose.call(this)
                }
        });
    WinJS.Namespace.define("AppMagic.Popups", {
        CachedAuthDialog: CachedAuthDialog, MessageDialog: MessageDialog, WaitDialog: WaitDialog, RestDialog: RestDialog, RestDialogViewModel: RestDialogViewModel, AuthenticationDialog: AuthenticationDialog
    })
})();