//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var util = AppMagic.Utility,
        PropertyHelperUI = Microsoft.AppMagic.Authoring.PropertyHelperUI,
        DefaultImageWidth = null,
        DefaultImageHeight = null,
        ImageDimensions = WinJS.Class.define(function ImageDimensions_ctor(imageHeight, imageWidth, scaleHeight, scaleWidth, offsetXSquare, offsetYSquare, offsetXWide, offsetYWide, splashHeight, splashWidth, splashOffsetX, splashOffsetY) {
            Contracts.checkNumber(imageHeight);
            Contracts.checkNumber(imageWidth);
            Contracts.checkNumber(scaleHeight);
            Contracts.checkNumber(scaleWidth);
            Contracts.checkNumber(offsetXSquare);
            Contracts.checkNumber(offsetYSquare);
            Contracts.checkNumber(offsetXWide);
            Contracts.checkNumber(offsetYWide);
            Contracts.checkNumber(splashHeight);
            Contracts.checkNumber(splashWidth);
            Contracts.checkNumber(splashOffsetX);
            Contracts.checkNumber(splashOffsetY);
            this.imageHeight = imageHeight;
            this.imageWidth = imageWidth;
            this.scaleHeight = scaleHeight;
            this.scaleWidth = scaleWidth;
            this.offsetXSquare = offsetXSquare;
            this.offsetYSquare = offsetYSquare;
            this.offsetXWide = offsetXWide;
            this.offsetYWide = offsetYWide;
            this.splashHeight = splashHeight;
            this.splashWidth = splashWidth;
            this.splashOffsetX = splashOffsetX;
            this.splashOffsetY = splashOffsetY
        }, {
            imageHeight: null, imageWidth: null, scaleHeight: null, scaleWidth: null, offsetXSquare: null, offsetYSquare: null, offsetXWide: null, offsetYWide: null, splashHeight: null, splashWidth: null, splashOffsetX: null, splashOffsetY: null
        }, {}),
        ColorPickerViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function ColorPickerViewModel_ctor(backgroundColor, ruleValueFactory) {
            Contracts.checkObservable(backgroundColor);
            Contracts.checkValue(ruleValueFactory);
            AppMagic.Utility.Disposable.call(this);
            this.track("_presentationValue", ruleValueFactory.create(PropertyHelperUI.color, backgroundColor))
        }, {
            _presentationValue: null, getPresentationValueForTemplate: function(template) {
                    return this._presentationValue.template === template ? this._presentationValue : null
                }
        }, {}),
        PublishViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function PublishViewModel_ctor(doc, ruleValueFactory, checkAndDownloadInstaller, documentLayoutManager, getDefaultLogo) {
            Contracts.checkValue(doc);
            Contracts.checkValue(doc.publishInfo);
            Contracts.checkValue(ruleValueFactory);
            Contracts.checkValue(documentLayoutManager);
            AppMagic.Utility.Disposable.call(this);
            this._publishInfo = doc.publishInfo;
            this._isPublishInProgress = !1;
            this._publishFactory = new Microsoft.AppMagic.Authoring.Publish.PublishFactory;
            this._documentLayoutManager = documentLayoutManager;
            typeof checkAndDownloadInstaller == "undefined" ? this._checkAndDownloadInstaller = function(isPublishClicked) {
                return AppMagic.context.checkAndDownloadInstaller(isPublishClicked)
            } : (Contracts.checkFunction(checkAndDownloadInstaller), this._checkAndDownloadInstaller = checkAndDownloadInstaller);
            typeof getDefaultLogo == "undefined" ? this._getDefaultLogo = function() {
                if (this._publishInfo.logoFile !== null)
                    return WinJS.Promise.wrap(this._publishInfo.logoFile);
                else {
                    var app = Windows.ApplicationModel.Package.current.installedLocation;
                    return app.getFileAsync(AppMagic.AuthoringTool.Constants.PublishDefaultImageFile)
                }
            } : (Contracts.checkFunction(getDefaultLogo), this._getDefaultLogo = getDefaultLogo);
            this._document = doc;
            this._applicationName = this._publishInfo.applicationName !== null && this._publishInfo.applicationName !== "" ? ko.observable(this._publishInfo.applicationName) : ko.observable(this._getDocumentName());
            this._logoImageUrl = ko.observable("");
            this._logoImageFileName = ko.observable("");
            this._presentationValue = ko.observable(null);
            this._showColorPicker = ko.observable(!1);
            this._imageDimensions = ko.observable(this._createImageDimensions(0, 0));
            this._currentPage = ko.observable("servicekeys");
            var completablePromise = Core.Promise.createCompletablePromise();
            this._defaultLogoFileUrlSetPromise = completablePromise.promise;
            this._setDefaultLogo(completablePromise.complete);
            this._services = ko.observableArray([]);
            this._backgroundColor = ko.observable(this._publishInfo.backgroundColorString);
            this._selectedPublishTarget = ko.observable(this._publishInfo.publishTarget);
            this.track("_colorPickerViewModel", new ColorPickerViewModel(this._backgroundColor, ruleValueFactory));
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._eventTracker.add(AppMagic.context, "documentNameChanged", this._updateApplicationNameOnDocumentNameChange.bind(this));
            this.trackAnonymous(this._backgroundColor.subscribe(function() {
                this._updatePublishInfo()
            }, this));
            this._isPublishLocally = ko.observable(this._publishInfo.publishResourcesLocally);
            this._getDefaultImageSize()
        }, {
            _document: null, _documentLayoutManager: null, _applicationName: null, _logoImageUrl: null, _logoImageFileName: null, _logoImageFile: null, _publishFactory: null, _presentationValue: null, _backgroundColor: null, _showColorPicker: null, _imageHeight: null, _imageWidth: null, _currentPage: null, _colorPickerViewModel: null, _imageDimensions: null, _getDefaultLogo: null, _isPublishLocally: null, _checkAndDownloadInstaller: null, _services: null, _currentService: null, _publishInfo: null, _defaultLogoFileUrlSetPromise: null, _isPublishInProgress: null, _eventTracker: null, splashScreenWidth: 620, splashScreenHeight: 300, scaleMultipierFrontPageToMaxSize: 115 / 300, scaleMultipierSplashScreenToMaxSize: 1, scaleMultipierFullSizeTileToMaxSize: 1 / 2, scaleMultipierStoreTileToMaxSize: 1 / 6, scaleMultipierSmallTileToMaxSize: 1 / 10, scaleMultipierNotificationTileToMaxSize: .08, services: {get: function() {
                        return this._services()
                    }}, isPublishLocally: {get: function() {
                        return this._isPublishLocally()
                    }}, publishLocallyClickEnterEvent: function(data, evt) {
                    this._isPublishLocally() ? this._isPublishLocally(!1) : this._isPublishLocally(!0);
                    this._updatePublishInfo();
                    evt.stopPropagation()
                }, toggleSelection: function(selectedService) {
                    Contracts.checkValue(selectedService);
                    this._currentService && this._currentService.selected(!1);
                    selectedService === this._currentService ? this._currentService = null : (this._currentService = selectedService, selectedService.selected(!0))
                }, getBackgroundImageSizeForSplash: function() {
                    return this._imageDimensions().splashWidth.toString() + "px " + this._imageDimensions().splashHeight.toString() + "px"
                }, getBackgroundImageLocationForSpash: function() {
                    return this._imageDimensions().splashOffsetX.toString() + "px " + this._imageDimensions().splashOffsetY.toString() + "px"
                }, getBackgroundImageSizeForSample: function(scaleMultipier) {
                    var height = this._imageDimensions().scaleHeight * scaleMultipier,
                        width = this._imageDimensions().scaleWidth * scaleMultipier;
                    return width.toString() + "px " + height.toString() + "px"
                }, getBackgroundImageLocationForSquareSample: function(scaleMultipier) {
                    var offsetX = this._imageDimensions().offsetXSquare * scaleMultipier,
                        offsetY = this._imageDimensions().offsetYSquare * scaleMultipier;
                    return offsetX.toString() + "px " + offsetY.toString() + "px"
                }, getImageDimensionsForDisplay: function() {
                    return this._imageDimensions().imageWidth.toString() + " x " + this._imageDimensions().imageHeight.toString() + "px"
                }, showLogosPage: {get: function() {
                        return this._currentPage() === "logos"
                    }}, switchToLogosPage: function() {
                    this._currentPage("logos")
                }, showServiceKeysPage: {get: function() {
                        return this._currentPage() === "servicekeys"
                    }}, switchToServiceKeysPage: function() {
                    this._currentPage("servicekeys")
                }, backgroundColor: {
                    get: function() {
                        return this._backgroundColor()
                    }, set: function(value) {
                            Contracts.checkStringOrNull(value);
                            this._backgroundColor(value)
                        }
                }, backgroundColorAsCss: {get: function() {
                        return this._getBackgroundColor().toCss()
                    }}, tileAppNameColor: {get: function() {
                        return this._backgroundColor() === "RGBA(0, 0, 0, 0)" || this._backgroundColor() === "RGBA(255, 255, 255, 1)" || this._backgroundColor() === "RGBA(255, 242, 0, 1)" ? "RGBA(0, 0, 0, 1)" : null
                    }}, _getDefaultImageSize: function() {
                    if (DefaultImageWidth !== null && DefaultImageHeight !== null)
                        this._imageDimensions(this._createImageDimensions(DefaultImageWidth, DefaultImageHeight));
                    else {
                        var img = new Image;
                        img.onload = function() {
                            DefaultImageWidth = img.width;
                            DefaultImageHeight = img.height;
                            this._imageDimensions(this._createImageDimensions(DefaultImageWidth, DefaultImageHeight))
                        }.bind(this);
                        this._defaultLogoFileUrlSetPromise.done(function() {
                            img.src = this.logoImageUrl
                        }.bind(this))
                    }
                }, _getForegroundColor: function() {
                    var brightness = this._getBackgroundColor().w3cBrightness;
                    return brightness > 128 ? Microsoft.AppMagic.Authoring.PublishForegroundColor.dark : Microsoft.AppMagic.Authoring.PublishForegroundColor.light
                }, _getBackgroundColor: function() {
                    var color = AppMagic.Utility.Color.parseRuleValue(this._backgroundColor());
                    return color === null ? new AppMagic.Utility.Color(0, 0, 0, 1) : color.clampRgba()
                }, showColorPicker: {
                    get: function() {
                        return this._showColorPicker
                    }, set: function(value) {
                            Contracts.checkBoolean(value);
                            this._showColorPicker(value)
                        }
                }, showOrHideColorPicker: function(data, evt) {
                    Contracts.checkValue(data);
                    Contracts.checkValue(evt);
                    var anchor = colorPickerPopupAnchor;
                    if (evt.currentTarget) {
                        var editColorButton = evt.currentTarget;
                        WinJS.Utilities.addClass(editColorButton, "active");
                        colorPickerPopup.winControl.onafterhide = function() {
                            WinJS.Utilities.removeClass(editColorButton, "active")
                        }
                    }
                    colorPickerPopup.winControl.show(anchor, "bottom", "left")
                }, colorPickerViewModel: {get: function() {
                        return this._colorPickerViewModel
                    }}, applicationName: {
                    get: function() {
                        return this._applicationName()
                    }, set: function(value) {
                            Contracts.checkString(value);
                            this._applicationName(value);
                            this._updatePublishInfo()
                        }
                }, logoImageUrl: {
                    get: function() {
                        return this._logoImageUrl()
                    }, set: function(value) {
                            Contracts.checkValue(value);
                            this._logoImageUrl(value)
                        }
                }, logoImageFileName: {
                    get: function() {
                        return this._logoImageFileName()
                    }, set: function(value) {
                            Contracts.checkString(value);
                            this._logoImageFileName(value)
                        }
                }, logoImageFile: {
                    get: function() {
                        return this._logoImageFile
                    }, set: function(value) {
                            Contracts.checkValue(value);
                            this._logoImageFile = value;
                            this._publishInfo.updateLogoFile(this.logoImageFile)
                        }
                }, publishTargets: {get: function() {
                        return this._publishFactory.publishTargets
                    }}, selectedPublishTarget: {
                    get: function() {
                        return this._selectedPublishTarget()
                    }, set: function(value) {
                            Contracts.checkValue(value);
                            this._selectedPublishTarget(value);
                            this._updatePublishInfo()
                        }
                }, getPublishTargetText: function(item) {
                    return Contracts.checkObject(item), item.displayName
                }, handlePublishClicked: function() {
                    var inProgress = this._isPublishInProgress;
                    return (this._isPublishInProgress = !0, inProgress) ? WinJS.Promise.wrap() : this._checkAndDownloadInstaller(!0).then(function(canContinuePublish) {
                            if (Contracts.checkBoolean(canContinuePublish), !canContinuePublish || !AppMagic.AuthoringTool.Utility.canShowPicker())
                                return WinJS.Promise.wrap();
                            Contracts.checkString(this.applicationName);
                            var appName = this.applicationName.trim();
                            if (!this.isValidAppName(appName))
                                return AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.Publish, AppMagic.AuthoringStrings.PublishPageAppNameError), WinJS.Promise.wrap();
                            var folderPicker = new Platform.Storage.Pickers.FolderPicker;
                            return folderPicker.suggestedStartLocation = Platform.Storage.Pickers.PickerLocationId.documentsLibrary, folderPicker.fileTypeFilter.replaceAll(["*"]), folderPicker.pickSingleFolderAsync().then(function(folder) {
                                        if (folder) {
                                            Platform.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.addOrReplace("PickedFolderToken", folder);
                                            var publishLocalResources = this._isPublishLocally(),
                                                localFiles = null;
                                            publishLocalResources && (localFiles = AppMagic.Utility.getLocalFilesReferenced());
                                            Contracts.check(this._imageDimensions().imageWidth > 0);
                                            Contracts.check(this._imageDimensions().imageHeight > 0);
                                            var context = new Microsoft.AppMagic.Authoring.PublishContext(appName, !1, folder, this.logoImageFile, this._getForegroundColor(), this._getBackgroundColor().toRuleValue(), this._imageDimensions().offsetXSquare, this._imageDimensions().offsetYSquare, this._imageDimensions().offsetXWide, this._imageDimensions().offsetYWide, AppMagic.AuthoringTool.Constants.PublishImageMaxSize, !1, publishLocalResources, this.selectedPublishTarget, localFiles, this._documentLayoutManager.orientation === "portrait" ? !0 : !1, this._documentLayoutManager.orientation === "landscape" ? !0 : !1),
                                                result = !0;
                                            publishLocalResources && (result = AppMagic.AuthoringTool.Runtime.createLocalCopyOfDataSources());
                                            result ? (AppMagic.context.publish(context), AppMagic.context.documentViewModel.backStage.handleBackButtonClick()) : AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.PublishError, AppMagic.AuthoringStrings.ErrorPublishingLocalDataSource)
                                        }
                                    }.bind(this))
                        }.bind(this)).then(function() {
                            this._isPublishInProgress = !1
                        }.bind(this), function(error) {
                            this._isPublishInProgress = !1;
                            throw error;
                        }.bind(this))
                }, isValidAppName: function(appName) {
                    return (Contracts.checkString(appName), Contracts.check(appName === appName.trim()), appName.replace(/\s/gm, "").length <= 2) ? !1 : isNaN(appName.substring(0, 1)) ? AppMagic.Utility.isValidFileName(appName) ? !0 : !1 : !1
                }, handleLogoButtonClicked: function() {
                    if (AppMagic.AuthoringTool.Utility.canShowPicker()) {
                        var picker = new Platform.Storage.Pickers.FileOpenPicker;
                        picker.suggestedStartLocation = Platform.Storage.Pickers.PickerLocationId.picturesLibrary;
                        picker.fileTypeFilter.replaceAll([".png", ".jpg"]);
                        picker.pickSingleFileAsync().then(function(file) {
                            if (file) {
                                Contracts.checkValue(file);
                                var sizeInBytes;
                                file.getBasicPropertiesAsync().then(function(basicProperties) {
                                    return sizeInBytes = basicProperties.size, file.properties.getImagePropertiesAsync()
                                }).then(function(imageProperties) {
                                    Contracts.checkValue(imageProperties);
                                    this.logoImageFile = file;
                                    this.logoImageFileName = file.name;
                                    this._imageDimensions(this._createImageDimensions(imageProperties.width, imageProperties.height));
                                    this._setlogoImageBlobUrlFromLogoFile(file)
                                }.bind(this))
                            }
                        }.bind(this))
                    }
                }, _createImageDimensions: function(imageWidth, imageHeight) {
                    Contracts.checkNumber(imageHeight);
                    Contracts.checkNumber(imageWidth);
                    var maxDim = Math.max(imageHeight, imageWidth),
                        multiplier = AppMagic.AuthoringTool.Constants.PublishImageMaxSize / maxDim,
                        scaleHeight = imageHeight * multiplier,
                        scaleWidth = imageWidth * multiplier,
                        offsetXSquare = 150 - scaleWidth / 2,
                        offsetYSquare = 150 - scaleHeight / 2,
                        offsetXWide = 310 - scaleWidth / 2,
                        offsetYWide = 150 - scaleHeight / 2,
                        splashScaler = .25,
                        splashMultiplier = 1;
                    (imageWidth > this.splashScreenWidth || imageHeight > this.splashScreenHeight) && (splashMultiplier = Math.min(this.splashScreenWidth / imageWidth, this.splashScreenHeight / imageHeight));
                    var splashWidth = imageWidth * splashMultiplier * splashScaler,
                        splashHeight = imageHeight * splashMultiplier * splashScaler,
                        splashOffsetX = this.splashScreenWidth / 2 - splashWidth / 2,
                        splashOffsetY = this.splashScreenHeight / 2 - splashHeight / 2;
                    return new ImageDimensions(imageHeight, imageWidth, scaleHeight, scaleWidth, offsetXSquare, offsetYSquare, offsetXWide, offsetYWide, splashHeight, splashWidth, splashOffsetX, splashOffsetY)
                }, _setDefaultLogo: function(completeFn) {
                    this._getDefaultLogo().done(function(logoFile) {
                        Contracts.checkValue(logoFile);
                        Contracts.checkFunction(completeFn);
                        this.logoImageFile = logoFile;
                        this.logoImageFileName = logoFile.name;
                        this._setlogoImageBlobUrlFromLogoFile(logoFile).then(completeFn, function(){})
                    }.bind(this))
                }, _setlogoImageBlobUrlFromLogoFile: function(file) {
                    return Contracts.checkValue(file), this._logoImageUrl() !== "" && AppMagic.Utility.blobManager.release(this._logoImageUrl()), file.openReadAsync().then(function(stream) {
                                Contracts.checkValue(stream);
                                var url = AppMagic.Utility.blobManager.create(file.contentType, stream);
                                url && AppMagic.Utility.blobManager.addRef(url);
                                this.logoImageUrl = url
                            }.bind(this))
                }, reload: function() {
                    this._checkAndDownloadInstaller(!1);
                    this._populateUnconfiguredServices()
                }, notifyClickBack: function() {
                    return this.showLogosPage && this._services().length > 0 ? (this.switchToServiceKeysPage(), !1) : !0
                }, _populateUnconfiguredServices: function() {
                    var servicesWithDefaultConfig = AppMagic.context.document.getServicesWithDefaultConfig();
                    this._services([]);
                    var createConnectCallback = function(itemName) {
                            return function() {
                                    this._markServiceConfigured(itemName)
                                }
                        },
                        dcv = AppMagic.context.documentViewModel.backStage.dataConnectionsViewModel;
                    dcv.reload();
                    dcv.notifyClickBack();
                    for (var it = servicesWithDefaultConfig.first(); it.hasCurrent; it.moveNext()) {
                        var serviceName = it.current.serviceNamespace,
                            connection = dcv.getRestConnectionByName(serviceName),
                            isServiceInUse = it.current.isInUse;
                        Contracts.checkBoolean(isServiceInUse);
                        var runtime = AppMagic.AuthoringTool.Runtime,
                            connectorDef = runtime.getConnectorDefinitionForService(serviceName);
                        if (runtime.isAzureService(connectorDef) && runtime.hasSharePointOnlineDataSource() && (isServiceInUse = !0), connection !== null && isServiceInUse) {
                            var serviceKeyConfigViewModel = connection.restConfigImportHandler.restServiceKeyConfigVm;
                            serviceKeyConfigViewModel.reset();
                            serviceKeyConfigViewModel.setAfterConnectCallback(createConnectCallback(serviceName).bind(this));
                            this._services.push({
                                connectorId: connection.connectorId, serviceName: serviceName, serviceIcon: connection.icon, serviceKeyConfigVm: serviceKeyConfigViewModel, selected: ko.observable(!1)
                            })
                        }
                    }
                    this._services().length > 0 ? this.switchToServiceKeysPage() : this.switchToLogosPage()
                }, _markServiceConfigured: function(serviceName) {
                    Contracts.checkNonEmpty(serviceName);
                    this._services.remove(function(item) {
                        return item.serviceName === serviceName
                    })
                }, _updatePublishInfo: function() {
                    this._publishInfo.update(this.applicationName, this._getBackgroundColor().toRuleValue(), this.selectedPublishTarget, this.isPublishLocally)
                }, _updateApplicationNameOnDocumentNameChange: function() {
                    this._publishInfo.applicationName === "" && this._applicationName(this._getDocumentName())
                }, _getDocumentName: function() {
                    var documentName = this._document.properties.name;
                    return (documentName = documentName.substr(0, documentName.lastIndexOf(".")), !this.isValidAppName(documentName)) ? AppMagic.AuthoringStrings.PublishPageInitialDefaultAppName : documentName
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        PublishViewModel: PublishViewModel, ColorPickerViewModel: ColorPickerViewModel, ImageDimensions: ImageDimensions
    })
})(Windows);