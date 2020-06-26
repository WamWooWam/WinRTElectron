//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var ServiceConfig = AppMagic.Constants.Services.Config,
        ConfigViews = {
            connection: "connection", "import": "import"
        },
        NoUnicodeCharacterMappingError = {
            message: "No mapping for the Unicode character exists in the target multi-byte code page.\r\n\r\nNo mapping for the Unicode character exists in the target multi-byte code page.\r\n", description: "No mapping for the Unicode character exists in the target multi-byte code page.\r\n\r\nNo mapping for the Unicode character exists in the target multi-byte code page.\r\n", number: -2147023783
        },
        RestConfigViewModel = WinJS.Class.define(function RestConfigViewModel_ctor(runtime, dataSourceOriginalNameStore, importFn) {
            this._runtime = runtime;
            this._importFn = importFn;
            this._dataSourceOriginalNameStore = dataSourceOriginalNameStore;
            this._authTypes = ko.observableArray([{
                    id: "none", name: AppMagic.AuthoringStrings.BackStageRestAuthTypeNone
                }, ]);
            this._endpointUrl = ko.observable("");
            this._authType = ko.observable(this.authTypes[0]);
            this._inputHasFocus = ko.observable(!1);
            this._oauthUrl = ko.observable("");
            this._oauthCallback = ko.observable("");
            this._oauthClient = ko.observable("");
            this._oauthScope = ko.observable("");
            this._isHeadersEnabled = ko.observable(!1);
            this._headerKeyValuePairs = ko.observableArray();
            this._errorMessages = ko.observableArray([]);
            this._currentView = ko.observable(ConfigViews.import);
            this._restConfigFilePath = ko.observable("");
            this._showKeyConfig = ko.observable(!1);
            this._serviceVM = ko.observable(null)
        }, {
            _runtime: null, _importFn: null, _dataSourceOriginalNameStore: null, _authTypes: null, _endpointUrl: null, _authType: null, _oauthUrl: null, _oauthCallback: null, _oauthClient: null, _oauthScope: null, _inputHasFocus: null, _headerKeyValuePairs: null, _isHeadersEnabled: null, _errorMessages: null, _currentView: null, _restConfigFilePath: null, _showKeyConfig: null, _serviceVM: null, onload: function() {
                    this._loadState()
                }, reset: function() {
                    this._restConfigFilePath("");
                    this._serviceVM(null);
                    this._showKeyConfig(!1);
                    var headerKeyValuePairs = this._headerKeyValuePairs(),
                        emptyPairsRemoved = headerKeyValuePairs.filter(function(x) {
                            return x.headerKey || x.headerValue
                        });
                    this._headerKeyValuePairs(emptyPairsRemoved);
                    emptyPairsRemoved.length === 0 && this.onClickAddHeader();
                    this._errorMessages.removeAll()
                }, serviceKeyConfigViewModel: {get: function() {
                        return this._serviceVM()
                    }}, showKeyConfig: {get: function() {
                        return this._showKeyConfig()
                    }}, serviceNamespace: {get: function() {
                        return this.serviceKeyConfigViewModel.serviceId
                    }}, authTypes: {get: function() {
                        return this._authTypes()
                    }}, endpointUrl: {
                    get: function() {
                        return this._endpointUrl()
                    }, set: function(value) {
                            this._endpointUrl(value)
                        }
                }, authType: {
                    get: function() {
                        return this._authType()
                    }, set: function(value) {
                            this._authType(value)
                        }
                }, oauthUrl: {
                    get: function() {
                        return this._oauthUrl()
                    }, set: function(value) {
                            this._oauthUrl(value)
                        }
                }, oauthCallback: {
                    get: function() {
                        return this._oauthCallback()
                    }, set: function(value) {
                            this._oauthCallback(value)
                        }
                }, oauthClient: {
                    get: function() {
                        return this._oauthClient()
                    }, set: function(value) {
                            this._oauthClient(value)
                        }
                }, oauthScope: {
                    get: function() {
                        return this._oauthScope()
                    }, set: function(value) {
                            this._oauthScope(value)
                        }
                }, inputHasFocus: {
                    get: function() {
                        return this._inputHasFocus()
                    }, set: function(value) {
                            this._inputHasFocus(value)
                        }
                }, restConfigFilePath: {get: function() {
                        return this._restConfigFilePath()
                    }}, isImportConfigFileViewVisible: {get: function() {
                        return this._currentView() === ConfigViews.import
                    }}, isConfigConnectionViewVisible: {get: function() {
                        return this._currentView() === ConfigViews.connection
                    }}, showImportConfigFileView: function() {
                    this._currentView(ConfigViews.import)
                }, showConfigConnectionView: function() {
                    this._currentView(ConfigViews.connection)
                }, onClickImportConfigFile: function() {
                    if (this.dispatchEvent(ServiceConfig.events.hideadd), AppMagic.AuthoringTool.Utility.canShowPicker()) {
                        var picker = new Platform.Storage.Pickers.FileOpenPicker;
                        picker.fileTypeFilter.append(AppMagic.AuthoringTool.Constants.DocumentFileFormatServiceConfiguration);
                        picker.pickSingleFileAsync().then(function(file) {
                            return file ? this._afterPickedFile(file) : WinJS.Promise.as(null)
                        }.bind(this))
                    }
                }, _afterPickedFile: function(storageFile) {
                    return this._showKeyConfig(!1), this._serviceVM(null), this._restConfigFilePath(storageFile.path), Platform.Storage.FileIO.readTextAsync(storageFile).then(function(fileContents) {
                                var DCs = AppMagic.Constants.DataConnections,
                                    dcv = AppMagic.context.documentViewModel.backStage.dataConnectionsViewModel;
                                var restConfigImportHandler = new AppMagic.Services.Meta.RestConfigImportHandler(null, null, fileContents, DCs.Icons[DCs.Types.REST], storageFile, null, AppMagic.context.document, AppMagic.Settings.instance, dcv),
                                    success = restConfigImportHandler.initializeTemplateDefinitionAndDetectErrors();
                                if (success) {
                                    var keyConfigVm = restConfigImportHandler.restServiceKeyConfigVm;
                                    if (this._serviceVM(keyConfigVm), restConfigImportHandler.hasConfigurableTemplateVariables) {
                                        this._showKeyConfig(!0);
                                        return
                                    }
                                    else
                                        return this._showKeyConfig(!1), restConfigImportHandler.importConfigUsingUserTemplateValuesAsync(null, !0)
                                }
                            }.bind(this), function(error) {
                                AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.Strings.RestConfigFileParseError, AppMagic.AuthoringStrings.RestConfigFileErrorDetailInvalidCharForFileEncoding)
                            })
                }, notifyBeforeSelectAsync: function() {
                    return this._inputHasFocus(!0), WinJS.Promise.wrap(!0)
                }, headerKeyValuePairs: {get: function() {
                        return this._headerKeyValuePairs()
                    }}, errorMessages: {get: function() {
                        return this._errorMessages()
                    }}, isErrorVisible: {get: function() {
                        return this.errorMessages.length !== 0
                    }}, handleKeypress: function(vm, ev) {
                    return ev.key === AppMagic.Constants.Keys.enter ? (this.addDataSource(), !1) : !0
                }, isOAuth2: {get: function() {
                        return this.authType.id === "oauth2"
                    }}, isHeadersEnabled: {
                    get: function() {
                        return this._isHeadersEnabled()
                    }, set: function(value) {
                            value && this._headerKeyValuePairs().length === 0 && this.onClickAddHeader();
                            this._isHeadersEnabled(value)
                        }
                }, getAuthTypeName: function(item) {
                    return item.name
                }, _validateOAuthProperties: function() {
                    this.oauthUrl.length === 0 ? this._errorMessages.push(AppMagic.AuthoringStrings.RestErrorOAuthUrlEmpty) : AppMagic.Utility.isHttpsUrl(this._oauthUrl()) || this._errorMessages.push(AppMagic.AuthoringStrings.RestErrorOAuthUrlNotHttps);
                    this.oauthCallback.length === 0 ? this._errorMessages.push(AppMagic.AuthoringStrings.RestErrorOAuthCallbackEmpty) : AppMagic.Utility.isUrl(this._oauthCallback()) || this._errorMessages.push(AppMagic.AuthoringStrings.RestErrorOAuthCallbackNotUrl);
                    this.oauthClient.length === 0 && this._errorMessages.push(AppMagic.AuthoringStrings.RestErrorOAuthClientEmpty)
                }, _validateHKeyProperties: function() {
                    var someHeadersAreInvalid = this._headerKeyValuePairs().some(function(x) {
                            return x.headerKey.length === 0 || x.headerValue.length === 0
                        });
                    someHeadersAreInvalid && this._errorMessages.push("Some headers are missing a key and/or a value.")
                }, _validateProperties: function() {
                    this._errorMessages.removeAll();
                    this.endpointUrl.length === 0 ? this._errorMessages.push(AppMagic.AuthoringStrings.RestErrorEndpointEmpty) : AppMagic.Utility.isUrl(this._endpointUrl()) || this._errorMessages.push(AppMagic.AuthoringStrings.RestErrorEndpointNotHttp);
                    switch (this.authType.id) {
                        case"none":
                            break;
                        case"oauth2":
                            this._validateOAuthProperties();
                            break;
                        default:
                            this._errorMessages.push(AppMagic.AuthoringStrings.RestErrorUnknownAuthType);
                            break
                    }
                    return this._isHeadersEnabled() && this._validateHKeyProperties(), this._errorMessages().length === 0
                }, addDataSource: function() {
                    if (this._validateProperties()) {
                        this._saveState();
                        var endpoint = AppMagic.Services.canonicalizeUrl(this.endpointUrl),
                            urlParts = endpoint.split("/"),
                            suggestedName = urlParts.pop();
                        !suggestedName && urlParts.length > 0 && (suggestedName = urlParts.pop());
                        suggestedName && (suggestedName = Core.Utility.replaceAllButAlphanumericsOrUnderscores(suggestedName, "_"), Core.Utility.startsWithNumber(suggestedName) && (suggestedName = "_" + suggestedName));
                        this._importFn({
                            type: "restDataSource", list: [{
                                        suggestedName: suggestedName, configuration: {
                                                endpoint: endpoint, auth: this._constructAuthObject()
                                            }
                                    }]
                        })
                    }
                }, _loadState: function() {
                    var settings = AppMagic.Settings.instance.getValue(AppMagic.Constants.SettingsKey.REST) || {},
                        endpoint = settings.uri || "",
                        authTypeId = settings.authType || "none",
                        oauthUrl = settings.oauthUrl || "",
                        oauthCallback = settings.oauthCallback || "",
                        oauthClient = settings.oauthClient || "",
                        oauthScope = settings.oauthScope || "",
                        headerKeyValuePairs = settings.headerKeyValuePairs || [],
                        isHeadersEnabled = settings.isHeadersEnabled || !1,
                        authType = this.authTypes.filter(function(x) {
                            return x.id === authTypeId
                        })[0] || this.authTypes[0];
                    this._endpointUrl(endpoint);
                    this._authType(authType);
                    this._oauthUrl(oauthUrl);
                    this._oauthCallback(oauthCallback);
                    this._oauthClient(oauthClient);
                    this._oauthScope(oauthScope);
                    this._isHeadersEnabled(isHeadersEnabled);
                    this._headerKeyValuePairs(headerKeyValuePairs)
                }, _saveState: function() {
                    var emptyPairsRemoved = [];
                    if (this._isHeadersEnabled()) {
                        var headerKeyValuePairs = this._headerKeyValuePairs();
                        headerKeyValuePairs.forEach(function(x) {
                            (x.headerKey || x.headerValue) && emptyPairsRemoved.push({
                                headerKey: x.headerKey, headerValue: x.headerValue
                            })
                        })
                    }
                    var settings = {
                            uri: this.endpointUrl, authType: this.authType.id, oauthUrl: this.oauthUrl, oauthCallback: this.oauthCallback, oauthClient: this.oauthClient, oauthScope: this.oauthScope, headerKeyValuePairs: emptyPairsRemoved, isHeadersEnabled: this._isHeadersEnabled()
                        };
                    AppMagic.Settings.instance.setValue(AppMagic.Constants.SettingsKey.REST, settings)
                }, _constructAuthObject: function() {
                    var scheme = this.authType.id,
                        auth;
                    switch (scheme) {
                        case"none":
                            auth = {scheme: "none"};
                            break;
                        case"oauth2":
                            auth = {
                                scheme: "oauth", authUri: this._oauthUrl().trim(), callbackUri: this._oauthCallback().trim(), clientId: this.oauthClient, scope: this.oauthScope.split(";")
                            };
                            break;
                        default:
                            break
                    }
                    return this._isHeadersEnabled() && (auth.headerKeyValuePairs = this._headerKeyValuePairs()), auth
                }, onClickAddHeader: function() {
                    this._headerKeyValuePairs.push({
                        headerKey: "", headerValue: ""
                    })
                }, onClickDeleteHeader: function(headerIndex) {
                    this._headerKeyValuePairs.splice(headerIndex, 1);
                    this._headerKeyValuePairs().length === 0 && this._isHeadersEnabled(!1)
                }
        }, {});
    WinJS.Class.mix(RestConfigViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {RestConfigViewModel: RestConfigViewModel})
})(Windows);