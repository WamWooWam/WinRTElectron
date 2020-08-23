/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Utilities.Settings", {
        onShow: function onShow(sender, id) {
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).disableTypeToSearch();
            var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
            switch (id) {
                case"SettingsAccount":
                    eventProvider.traceSettingsAccount_Launch(id);
                    break;
                case"SettingsAbout":
                    eventProvider.traceSettingsAbout_Launch(id);
                    break;
                case"SettingsPreferences":
                    eventProvider.traceSettingsPreferences_Launch(id);
                    break;
                case"SettingsFeedback":
                    eventProvider.traceSettingsFeedback_Launch(id);
                    break;
                case"SettingsCaptions":
                    eventProvider.traceSettingsCaptions_Launch(id);
                    break
            }
        }, onShowComplete: function onShowComplete(sender, id) {
                var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                uiState.isSettingsCharmVisible = true;
                var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                switch (sender.currentTarget.id) {
                    case"SettingsAccount":
                        eventProvider.traceSettingsAccount_LaunchComplete(sender.currentTarget.id);
                        break;
                    case"SettingsAbout":
                        eventProvider.traceSettingsAbout_LaunchComplete(sender.currentTarget.id);
                        break;
                    case"SettingsPreferences":
                        eventProvider.traceSettingsPreferences_LaunchComplete(sender.currentTarget.id);
                        break;
                    case"SettingsFeedback":
                        eventProvider.traceSettingsFeedback_LaunchComplete(sender.currentTarget.id);
                        break;
                    case"SettingsCaptions":
                        eventProvider.traceSettingsCaptions_LaunchComplete(sender.currentTarget.id);
                        break
                }
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Utilities", {SettingsWrapper: MS.Entertainment.UI.Framework.defineUserControl(null, function(element, options) {
            MS.Entertainment.Utilities.Settings.onShow(null, element.parentElement.id)
        }, {
            processChildren: true, deferInitialization: true, ignoreChildrenInitialization: true, controlName: "SettingsWrapper", initialize: function initialize() {
                    this.domElement.parentElement.addEventListener("aftershow", MS.Entertainment.Utilities.Settings.onShowComplete, false);
                    this.domElement.parentElement.addEventListener("afterhide", this.onHideComplete, false);
                    if (this._backButton)
                        this._backButton.setAttribute("aria-label", String.load(String.id.IDS_ACC_BACK_BUTTON))
                }, backToSettings: function backToSettings() {
                    try {
                        WinJS.UI.SettingsFlyout.show()
                    }
                    catch(ex) {
                        MS.Entertainment.Utilities.fail(false, "WinJS.UI.SettingsFlyout.show() fails: " + ex.toString())
                    }
                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceSettings_BackToHome("")
                }, onHideComplete: function onHideComplete(sender, id) {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).enableTypeToSearch();
                    var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    uiState.isSettingsCharmVisible = false
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Utilities", {PreferenceSettingsWrapper: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Utilities.SettingsWrapper", null, function(element, options){}, {
            _onIsGrovelingChangedHandler: null, _displayingCredUI: false, _signIn: null, _sessionMgr: null, _configManager: null, initialize: function initialize() {
                    MS.Entertainment.Utilities.SettingsWrapper.prototype.initialize.call(this);
                    this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this._configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    this._initializeSignedInSetting();
                    this._initializeMediaLibrarySetting();
                    this._initializeLaunchToCollectionSetting();
                    this._initializeGoOnlineForMetadataSetting();
                    this._initializeSaveMetadataEditSetting();
                    this._initializePromptOnPurchaseSetting();
                    this._initializeDownloadQualitySetting();
                    this._initializeStreamingQualitySetting();
                    this._initializeMusicPassDownloadEnabledSetting();
                    this._initializeCloudCollectionEnabledSetting();
                    this._initializeCloudMatchEnabledSetting();
                    this._initializeCloudCollectionOfflineSetting();
                    this._initializePurchasesSetting();
                    this._initializeFreePlayLimitsSetting()
                }, forgetMe: function forgetMe() {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    signIn.signOut();
                    this.backToSettings()
                }, restorePurchases: function restorePurchases() {
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    service.grovel(true, true)
                }, showLocalGrovelDialog: function showLocalGrovelDialog() {
                    if (WinJS.Utilities.getMember("Windows.Storage.StorageLibrary"))
                        MS.Entertainment.UI.Controls.ManageFoldersDialog.show();
                    else if (MS.Entertainment.Utilities.isMusicApp)
                        MS.Entertainment.Music.localGrovelInfoDialog.show()
                }, handleKeyDownForLocalGrovelDialog: function handleKeyDownForLocalGrovelDialog(e) {
                    if (e.keyCode !== WinJS.Utilities.Key.enter)
                        return;
                    this.showLocalGrovelDialog();
                    e.stopPropagation();
                    e.preventDefault()
                }, showCloudCollectionIconInfoDialog: function showCloudCollectionIconInfoDialog() {
                    if (MS.Entertainment.Utilities.isMusicApp)
                        MS.Entertainment.Music.cloudMatchIconDialog.show()
                }, handleKeyDownForCloudCollectionIconInfoDialog: function handleKeyDownForCloudCollectionIconInfoDialog(e) {
                    if (e.keyCode !== WinJS.Utilities.Key.enter)
                        return;
                    this.showCloudCollectionIconInfoDialog();
                    e.stopPropagation();
                    e.preventDefault()
                }, showCloudCollectionOptInDialog: function showCloudCollectionOptInDialog() {
                    if (MS.Entertainment.Utilities.isMusicApp)
                        MS.Entertainment.Music.cloudMatchOptInDialog.show()
                }, handleKeyDownForCloudCollectionOptInDialog: function handleKeyDownForCloudCollectionOptInDialog(e) {
                    if (e.keyCode !== WinJS.Utilities.Key.enter)
                        return;
                    this.showCloudCollectionOptInDialog();
                    e.stopPropagation();
                    e.preventDefault()
                }, promptToggleChange: function promptToggleChange(event) {
                    if (this.promptOnPurchase.checked)
                        (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase = this.promptOnPurchase.checked;
                    else if (this._displayingCredUI)
                        return;
                    else {
                        this._displayingCredUI = true;
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        signIn.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_PassportTicket), false, Microsoft.Entertainment.Util.SignInPromptType.retypeCredentials).then(function success(t) {
                            (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase = false;
                            WinJS.UI.SettingsFlyout.showSettings("SettingsPreferences", "/Components/Settings/SettingsPreferences.html")
                        }.bind(this), function getPassportTicketError(errTicket) {
                            MS.Entertainment.Utilities.assert(false, "Toggling prompt preferences fails with error code: " + errTicket.number)
                        })
                    }
                }, downloadQualityClicked: function downloadQualityClicked() {
                    if (this._downloadHD.checked)
                        MS.Entertainment.UI.Controls.ChooseDownloadQualityOverlay.storedDownloadPreference = MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.hd;
                    else if (this._downloadSD.checked)
                        MS.Entertainment.UI.Controls.ChooseDownloadQualityOverlay.storedDownloadPreference = MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.sd;
                    else
                        MS.Entertainment.UI.Controls.ChooseDownloadQualityOverlay.storedDownloadPreference = null
                }, streamingQualityOverlayToggleChange: function streamingQualityOverlayToggleChange(event) {
                    MS.Entertainment.UI.Controls.assert(this._sessionMgr.primarySession, "streamingQualityOverlayToggleChange called at unexpected time with no playbackSession");
                    if (this._sessionMgr.primarySession) {
                        this._sessionMgr.primarySession.enableVideoNetstats = !!this.streamingQualityOverlay.checked;
                        Windows.Storage.ApplicationData.current.roamingSettings.values["enableVideoNetstats"] = !!this.streamingQualityOverlay.checked
                    }
                }, musicPassDownloadEnabledToggleChange: function musicPassDownloadEnabledToggleChange() {
                    var checkSettingAllowedPromise = WinJS.Promise.wrap();
                    if (this.musicPassDownloadEnabled.checked)
                        checkSettingAllowedPromise = MS.Entertainment.UI.SubscriptionDownload.verifyMachineActivationIsNotAtLimit();
                    checkSettingAllowedPromise.then(function settingIsAllowed() {
                        (Microsoft.Entertainment.Configuration.ConfigurationManager()).music.musicPassDownloadEnabled = this.musicPassDownloadEnabled.checked;
                        this._initializeCloudCollectionOfflineSetting();
                        MS.Entertainment.Utilities.Telemetry.logTelemetryEvent(MS.Entertainment.Utilities.PreferenceSettingsWrapper.TelemetryEvents.MusicPassDownloadEnabledStateChanged, MS.Entertainment.Utilities.PreferenceSettingsWrapper.States.MusicPassDownloadEnabledState, this.musicPassDownloadEnabled.checked)
                    }.bind(this), function settingIsNotAllowed(errorCode) {
                        if (errorCode === MS.Entertainment.UI.SubscriptionDownload.deviceActivationLimitExceededErrorCode) {
                            MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_DOWNLOAD_ERROR_CAPTION), errorCode);
                            this.musicPassDownloadEnabled.checked = false
                        }
                    }.bind(this))
                }, cloudCollectionEnabledToggleChange: function cloudCollectionEnabledToggleChange(event) {
                    var cloudCollectionService = this._getCloudCollectionService();
                    if (cloudCollectionService) {
                        cloudCollectionService.isEnabled = this.cloudCollectionEnabled.checked;
                        this._updateCloudCollectionDescription(cloudCollectionService.isEnabled);
                        this._initializeCloudCollectionOfflineSetting();
                        this._initializeCloudMatchEnabledSetting();
                        MS.Entertainment.Utilities.Telemetry.logTelemetryEvent(MS.Entertainment.Utilities.PreferenceSettingsWrapper.TelemetryEvents.CloudCollectionEnabledStateChanged, MS.Entertainment.Utilities.PreferenceSettingsWrapper.States.CloudCollectionEnabledState, this.cloudCollectionEnabled.checked)
                    }
                }, cloudMatchEnabledToggleChange: function cloudMatchEnabledToggleChange(event) {
                    var cloudCollectionService = this._getCloudCollectionService();
                    if (cloudCollectionService) {
                        var optIn = this.cloudMatchEnabled.checked ? MS.Entertainment.CloudCollectionService.CloudMatchStatus.OptedIn : MS.Entertainment.CloudCollectionService.CloudMatchStatus.OptedOut;
                        cloudCollectionService.setCloudMatchOptIn(optIn);
                        MS.Entertainment.Utilities.Telemetry.logTelemetryEvent(MS.Entertainment.Utilities.PreferenceSettingsWrapper.TelemetryEvents.CloudMatchEnabledStateChanged, MS.Entertainment.Utilities.PreferenceSettingsWrapper.States.CloudMatchEnabledState, this.cloudMatchEnabled.checked, MS.Entertainment.Utilities.Telemetry.Events.CloudMatchStateChangeMethod, MS.Entertainment.Utilities.Telemetry.StateChangeMethodValues.toggle)
                    }
                }, cloudCollectionOfflineToggleChange: function cloudCollectionOfflineToggleChange(event) {
                    var checkSettingAllowedPromise = WinJS.Promise.wrap();
                    if (this.cloudCollectionOffline.checked)
                        checkSettingAllowedPromise = MS.Entertainment.UI.SubscriptionDownload.verifyMachineActivationIsNotAtLimit();
                    checkSettingAllowedPromise.then(function settingIsAllowed() {
                        var cloudCollectionService = this._getCloudCollectionService();
                        if (cloudCollectionService)
                            cloudCollectionService.autoDownloadEnabled = this.cloudCollectionOffline.checked;
                        MS.Entertainment.Utilities.Telemetry.logTelemetryEvent(MS.Entertainment.Utilities.PreferenceSettingsWrapper.TelemetryEvents.CloudCollectionAutoDownloadStateChanged, MS.Entertainment.Utilities.PreferenceSettingsWrapper.States.CloudCollectionAutoDownloadState, this.cloudCollectionOffline.checked)
                    }.bind(this), function settingIsNotAllowed(errorCode) {
                        if (errorCode === MS.Entertainment.UI.SubscriptionDownload.deviceActivationLimitExceededErrorCode) {
                            MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_DOWNLOAD_ERROR_CAPTION), errorCode);
                            this.cloudCollectionOffline.checked = false
                        }
                    }.bind(this))
                }, goOnlineForMetadataChange: function goOnlineForMetadataChange(event) {
                    (new Microsoft.Entertainment.Configuration.ConfigurationManager).mdlc.connectToInternetForAlbumMetadata = this.goOnlineForMetadata.checked
                }, saveMetadataEditChange: function saveMetadataEditChange(event) {
                    (new Microsoft.Entertainment.Configuration.ConfigurationManager).mediaStore.writeOutMetadata = this.saveMetadataEditToggleSwitch.checked
                }, launchToCollectionChange: function launchToCollectionChange(event) {
                    var launchLocation;
                    if (this.launchToCollection.checked)
                        if (MS.Entertainment.Utilities.isMusicApp)
                            launchLocation = MS.Entertainment.UI.Monikers.musicCollection;
                        else if (MS.Entertainment.Utilities.isVideoApp)
                            launchLocation = MS.Entertainment.UI.Monikers.videoCollection;
                    var settingsStorage = null;
                    if (MS.Entertainment.Utilities.isApp1)
                        settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                    else
                        settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                    if (launchLocation)
                        settingsStorage.values["launchLocation"] = launchLocation;
                    else
                        settingsStorage.values.remove("launchLocation")
                }, _getCloudCollectionService: function _getCloudCollectionService() {
                    if (MS.Entertainment.Utilities.isMusicApp && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.cloudCollection))
                        return MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.cloudCollection);
                    return null
                }, _initializeMediaLibrarySetting: function _initializeMediaLibrarySetting() {
                    if (MS.Entertainment.Utilities.isMusicApp) {
                        this.libraryPreferencesTitle.text = String.load(String.id.IDS_MY_MUSIC_LIBRARY_SETTINGS_TITLE);
                        if (WinJS.Utilities.getMember("Windows.Storage.StorageLibrary"))
                            this.libraryPreferencesWebLink.stringId = String.id.IDS_COLLECTION_MUSIC_MANAGE_FOLDERS_LINK;
                        else {
                            this.libraryPreferencesText.text = String.load(String.id.IDS_COLLECTION_MUSIC_LIBRARY_SETTINGS_TEXT);
                            this.libraryPreferencesWebLink.stringId = String.id.IDS_COLLECTION_MUSIC_MORE_LIBRARIES_LINK
                        }
                    }
                    else if (MS.Entertainment.Utilities.isVideoApp) {
                        this.libraryPreferencesTitle.text = String.load(String.id.IDS_COLLECTION_VIDEO_LIBRARY_SETTINGS_TITLE);
                        if (WinJS.Utilities.getMember("Windows.Storage.StorageLibrary"))
                            this.libraryPreferencesWebLink.stringId = String.id.IDS_COLLECTION_VIDEO_MANAGE_FOLDERS_LINK;
                        else {
                            this.libraryPreferencesText.text = String.load(String.id.IDS_COLLECTION_VIDEO_LIBRARY_SETTINGS_TEXT);
                            this.libraryPreferencesWebLink.stringId = String.id.IDS_COLLECTION_VIDEO_MORE_LIBRARIES_LINK;
                            this.libraryPreferencesWebLink.domElement.href = MS.Entertainment.UI.FWLink.videoLibraries
                        }
                    }
                    else
                        this._hideElement(this.libraryPreferences)
                }, _initializeSignedInSetting: function _initializeSignedInSetting() {
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (this._signIn.isSignedIn && config.shell.showRemoveInPreferences) {
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        this.currentUserId.text = String.load(String.id.IDS_SETTINGS_ACCOUNT_CURRENT_USER).format(signedInUser.signInName);
                        if (!signedInUser.canSignOut) {
                            this._hideElement(this.forgetMeButton);
                            this._hideElement(this.forgetMeDesc)
                        }
                    }
                    else
                        this._hideElement(this.switchUserContainer)
                }, _initializePromptOnPurchaseSetting: function _initializePromptOnPurchaseSetting() {
                    if (this._signIn.isSignedIn && (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.showPromptOnPurchaseSetting) {
                        this.promptOnPurchase.title = String.load(String.id.IDS_SETTINGS_PROMPT_TOGGLE_TITLE);
                        this.promptOnPurchase.checked = (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase
                    }
                    else
                        this._hideElement(this.promptOnPurchaseContainer)
                }, _initializeDownloadQualitySetting: function _initializeDownloadQualitySetting() {
                    if (!MS.Entertainment.Utilities.isVideoApp)
                        this._hideElement(this.downloadQualityContainer);
                    else {
                        this._downloadHD.checked = MS.Entertainment.UI.Controls.ChooseDownloadQualityOverlay.storedDownloadPreference === MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.hd;
                        this._downloadSD.checked = MS.Entertainment.UI.Controls.ChooseDownloadQualityOverlay.storedDownloadPreference === MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.sd;
                        this._downloadPrompt.checked = MS.Entertainment.UI.Controls.ChooseDownloadQualityOverlay.storedDownloadPreference !== MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.hd && MS.Entertainment.UI.Controls.ChooseDownloadQualityOverlay.storedDownloadPreference !== MS.Entertainment.Data.Augmenter.Marketplace.videoDefinition.sd
                    }
                }, _initializeStreamingQualitySetting: function _initializeStreamingQualitySetting() {
                    if (MS.Entertainment.Utilities.isVideoApp1 && this._configManager.playback.enableVideoQualitySelector) {
                        var playbackSession = this._sessionMgr.primarySession;
                        this._showElement(this.streamingQualityContainer);
                        this.streamingQualityOverlay.checked = !!(Windows.Storage.ApplicationData.current.roamingSettings.values["enableVideoNetstats"]);
                        if (WinJS.Utilities.getMember("currentMedia.availableVideoBitrates", playbackSession)) {
                            this._populateBitrateSelectionList(playbackSession.currentMedia.availableVideoBitrates, playbackSession.currentRequestedBitrate);
                            this._showElement(this.streamingQualityOptionsContainer)
                        }
                        else
                            this._hideElement(this.streamingQualityOptionsContainer)
                    }
                }, _populateBitrateSelectionList: function _populateBitrateSelectionList(availableVideoBitrates, requestedBitrate) {
                    var item = new MS.Entertainment.UI.Controls.VideoBitrateSelectorItem(document.createElement("div"), {
                            bitrate: null, checked: !requestedBitrate
                        });
                    this.streamingQualityOptionsContainer.appendChild(item.domElement);
                    availableVideoBitrates.map(function generateItem(bitrate) {
                        var item = new MS.Entertainment.UI.Controls.VideoBitrateSelectorItem(document.createElement("div"), {
                                bitrate: bitrate, checked: bitrate === requestedBitrate
                            });
                        this.streamingQualityOptionsContainer.appendChild(item.domElement)
                    }.bind(this))
                }, _updateMusicDownloadSettingsContainer: function _updateMusicDownloadSettingsContainer() {
                    if (this._isCloudCollectionOfflineAvailable() || this._isMusicPassDownloadAvailable())
                        this._showElement(this.downloadSettingsContainer);
                    else
                        this._hideElement(this.downloadSettingsContainer)
                }, _isMusicPassDownloadAvailable: function _isMusicPassDownloadAvailable() {
                    return MS.Entertainment.Utilities.isMusicApp && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).isSubscription
                }, _initializeMusicPassDownloadEnabledSetting: function _initializeMusicPassDownloadEnabledSetting() {
                    if (this._isMusicPassDownloadAvailable()) {
                        this.musicPassDownloadEnabled.title = String.load(String.id.IDS_MUSIC_SETTINGS_MUSIC_PASS_DOWNLOAD_DESCRIPTION);
                        this.musicPassDownloadEnabled.checked = (new Microsoft.Entertainment.Configuration.ConfigurationManager).music.musicPassDownloadEnabled
                    }
                    else
                        this._hideElement(this.musicPassDownloadEnabledSettingsContainer);
                    this._updateMusicDownloadSettingsContainer()
                }, _initializeCloudCollectionEnabledSetting: function _initializeCloudCollectionEnabledSetting() {
                    var cloudCollectionService = this._getCloudCollectionService();
                    if (MS.Entertainment.Utilities.isMusicApp && cloudCollectionService && cloudCollectionService.isAvailable && !cloudCollectionService.isV2Enabled && this._signIn.isSignedIn) {
                        var isCloudCollectionEnabled = cloudCollectionService.isEnabled;
                        this.cloudCollectionEnabled.checked = isCloudCollectionEnabled;
                        this._updateCloudCollectionDescription(isCloudCollectionEnabled)
                    }
                    else {
                        this._hideElement(this.cloudCollectionEnabledSettingsContainer);
                        this._hideElement(this.cloudCollectionOfflineSettingsContainer);
                        this._hideElement(this.cloudIconInfoWebLink)
                    }
                    this._updateMusicDownloadSettingsContainer()
                }, _updateCloudCollectionDescription: function _updateCloudCollectionDescription(isCloudCollectionEnabled) {
                    this.cloudCollectionEnabled.title = isCloudCollectionEnabled ? String.load(String.id.IDS_MUSIC_SETTINGS_CLOUD_COLLECTION_ON_DESCRIPTION) : String.load(String.id.IDS_MUSIC_SETTINGS_CLOUD_COLLECTION_OFF_DESCRIPTION)
                }, _initializeCloudMatchEnabledSetting: function _initializeCloudMatchEnabledSetting() {
                    var cloudCollectionService = this._getCloudCollectionService();
                    if (MS.Entertainment.Utilities.isMusicApp && cloudCollectionService && cloudCollectionService.isEnabled && !cloudCollectionService.isV2Enabled) {
                        this.cloudMatchEnabled.checked = cloudCollectionService.isCloudMatchOptedIn;
                        this.cloudMatchEnabled.title = String.load(String.id.IDS_MUSIC_CLOUD_SETTINGS_MATCH_TOGGLE_DESC);
                        this._showElement(this.cloudMatchSettingContainer)
                    }
                    else
                        this._hideElement(this.cloudMatchSettingContainer)
                }, _isCloudCollectionOfflineAvailable: function _isCloudCollectionOfflineAvailable() {
                    var cloudCollectionService = this._getCloudCollectionService();
                    return MS.Entertainment.Utilities.isMusicApp && cloudCollectionService && cloudCollectionService.isEnabled && (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn)).isSignedIn && (Microsoft.Entertainment.Configuration.ConfigurationManager()).music.musicPassDownloadEnabled
                }, _initializeCloudCollectionOfflineSetting: function _initializeCloudCollectionOfflineSetting() {
                    if (this._isCloudCollectionOfflineAvailable()) {
                        var isSubscriptionUser = (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser)).isSubscription;
                        this.cloudCollectionOffline.title = isSubscriptionUser ? String.load(String.id.IDS_SETTINGS_CLOUD_COLLECTION_OFFLINE_TOGGLE_TITLE) : String.load(String.id.IDS_SETTINGS_CLOUD_COLLECTION_OFFLINE_TOGGLE_TITLE_FREE);
                        this.cloudCollectionOffline.checked = this._getCloudCollectionService().autoDownloadEnabled;
                        this._showElement(this.cloudCollectionOfflineSettingsContainer)
                    }
                    else {
                        var cloudCollectionService = this._getCloudCollectionService();
                        if (cloudCollectionService)
                            cloudCollectionService.autoDownloadEnabled = false;
                        this._hideElement(this.cloudCollectionOfflineSettingsContainer)
                    }
                    this._updateMusicDownloadSettingsContainer()
                }, _initializeLaunchToCollectionSetting: function _initializeLaunchToCollectionSetting() {
                    var enableMusicSetting;
                    var enableVideoSetting;
                    var appMode = MS.Entertainment.appMode;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (MS.Entertainment.Utilities.isMusicApp) {
                        var musicMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        enableMusicSetting = musicMarketplaceEnabled && !window.onNewMusicPage
                    }
                    else if (MS.Entertainment.Utilities.isVideoApp) {
                        var moviesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                        var tvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                        enableVideoSetting = moviesMarketplaceEnabled || tvMarketplaceEnabled
                    }
                    var settingsStorage = null;
                    if (MS.Entertainment.Utilities.isApp1)
                        settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                    else
                        settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                    if (enableMusicSetting) {
                        this.launchToCollection.title = String.load(String.id.IDS_MUSIC_SETTINGS_STARTUP_VIEW_DESC);
                        this.launchToCollection.checked = !!(settingsStorage.values["launchLocation"])
                    }
                    else if (enableVideoSetting) {
                        this.launchToCollection.title = String.load(String.id.IDS_VIDEO_SETTINGS_STARTUP_VIEW_DESC);
                        this.launchToCollection.checked = !!(settingsStorage.values["launchLocation"])
                    }
                    else
                        this._hideElement(this.launchToCollectionContainer)
                }, _initializeGoOnlineForMetadataSetting: function _initializeGoOnlineForMetadataSetting() {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (MS.Entertainment.Utilities.isMusicApp) {
                        this.goOnlineForMetadata.title = String.load(String.id.IDS_MUSIC_SETTINGS_MEDIA_INFO_DESC);
                        this.goOnlineForMetadata.checked = (new Microsoft.Entertainment.Configuration.ConfigurationManager).mdlc.connectToInternetForAlbumMetadata
                    }
                    else
                        this._hideElement(this.goOnlineForMetadataContainer)
                }, _initializeSaveMetadataEditSetting: function _initializeSaveMetadataEditSetting() {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (MS.Entertainment.Utilities.isMusicApp && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metadataEdit)) {
                        this.saveMetadataEditToggleSwitch.title = String.load(String.id.IDS_MUSIC_SETTINGS_METADATA_SAVE_DESC);
                        this.saveMetadataEditToggleSwitch.checked = (new Microsoft.Entertainment.Configuration.ConfigurationManager).mediaStore.writeOutMetadata
                    }
                    else
                        this._hideElement(this.saveMetadataEditContainer)
                }, _onIsGrovelingChanged: function _onIsGrovelingChanged(isGroveling) {
                    if (isGroveling) {
                        this.restorePurchaseButtonLabel.stringId = String.id.IDS_VIDEO_SETTINGS_PURCHASES_RESTORING_BUTTON;
                        this.restorePurchaseButton.disabled = true
                    }
                    else {
                        this.restorePurchaseButtonLabel.stringId = String.id.IDS_VIDEO_SETTINGS_PURCHASES_RESTORE_BUTTON;
                        this.restorePurchaseButton.disabled = false
                    }
                }, _initializePurchasesSetting: function _initializePurchasesSetting() {
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    var hideSetting = true;
                    if (service && MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn && MS.Entertainment.Utilities.isVideoApp) {
                        var networkStatus = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus;
                        switch (networkStatus) {
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                                break;
                            default:
                                hideSetting = false;
                                this._onIsGrovelingChangedHandler = this._onIsGrovelingChanged.bind(this);
                                service.bind("isGroveling", this._onIsGrovelingChangedHandler);
                                break
                        }
                    }
                    if (hideSetting)
                        this._hideElement(this.purchasesContainer)
                }, _initializeFreePlayLimitsSetting: function _initializeFreePlayLimitsSetting() {
                    this._hideElement(this.freePlayLimitsContainer);
                    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.freePlayLimits))
                        return;
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    if (!signIn.isSignedIn || signedInUser.isSubscription)
                        return;
                    var freePlayLimits = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.freePlayLimits);
                    freePlayLimits.getLimits().done(function getLimitsComplete(limits) {
                        if (limits && limits.freeTrialCompleted) {
                            if (!limits.monthlyFreeLimitExceeded)
                                this._hideElement(this.freePlayLimitsMonthlyLimitExceeded);
                            this.preferenceFreePlayLimitMeter.max = limits.monthlyFreeMinutesAllowance;
                            this.preferenceFreePlayLimitMeter.value = limits.monthlyFreeMinutesUsed;
                            var percentageUsed = 0;
                            if (limits.monthlyFreeMinutesUsed >= limits.monthlyFreeMinutesAllowance)
                                percentageUsed = 100;
                            else if (limits.monthlyFreeMinutesAllowance > 0)
                                percentageUsed = (limits.monthlyFreeMinutesUsed / limits.monthlyFreeMinutesAllowance) * 100;
                            percentageUsed = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(Math.round(percentageUsed));
                            this.freePlayLimitsMeterPercentageLabel.textContent = String.load(String.id.IDS_SETTINGS_FREE_PLAY_LIMITS_METER_PERCENTAGE).format(percentageUsed);
                            var monthlyFreeHoursAllowance = Math.max(Math.floor(limits.monthlyFreeMinutesAllowance / 60), 0);
                            var dateFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).dayMonthYear;
                            var nextMonthlyFreeLimitResetDate = dateFormatter.format(limits.nextMonthlyFreeLimitResetDate);
                            var monthlyHoursPluralFormatString = MS.Entertainment.Utilities.Pluralization.getPluralizedString(String.id.IDS_MUSIC_SETTINGS_MONTHLY_LIMIT_DESC_PLURAL, monthlyFreeHoursAllowance);
                            this.freePlayLimitsMonthlyUsageLabel.text = monthlyHoursPluralFormatString.format(monthlyFreeHoursAllowance, nextMonthlyFreeLimitResetDate);
                            this._showElement(this.freePlayLimitsContainer)
                        }
                    }.bind(this), function getLimitsError(){})
                }, onSubscribe: function onSubscribe() {
                    MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.limitSettingsSubscribe);
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.subscriptionSignup);
                    action.automationId = MS.Entertainment.UI.AutomationIds.settingsSubscriptionSignup;
                    action.execute()
                }, handleOnSubscribeKeyDown: function handleOnSubscribeKeyDown(e) {
                    if (e.keyCode !== WinJS.Utilities.Key.enter)
                        return;
                    this.onSubscribe()
                }, unload: function unload() {
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    if (service && this._onIsGrovelingChangedHandler) {
                        service.unbind("isGroveling", this._onIsGrovelingChangedHandler);
                        this._onIsGrovelingChangedHandler = null
                    }
                    MS.Entertainment.Utilities.SettingsWrapper.prototype.unload.call(this)
                }, _showElement: function _showElement(element) {
                    if (element.domElement)
                        element = element.domElement;
                    WinJS.Utilities.removeClass(element, "removeFromDisplay")
                }, _hideElement: function _hideElement(element) {
                    if (element.domElement)
                        element = element.domElement;
                    WinJS.Utilities.addClass(element, "removeFromDisplay")
                }
        }, null, {
            TelemetryEvents: {
                MusicPassDownloadEnabledStateChanged: "MusicPassDownloadEnabledStateChanged", CloudCollectionEnabledStateChanged: "CloudCollectionEnabledStateChanged", CloudCollectionAutoDownloadStateChanged: "CloudCollectionAutoDownloadStateChanged", CloudMatchEnabledStateChanged: "CloudMatchEnabledStateChanged"
            }, States: {
                    MusicPassDownloadEnabledState: "MusicPassDownloadEnabledState", CloudCollectionEnabledState: "CloudCollectionEnabledState", CloudCollectionAutoDownloadState: "CloudCollectionAutoDownloadState", CloudMatchEnabledState: "CloudMatchEnabledState"
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VideoBitrateSelectorItem: MS.Entertainment.UI.Framework.defineUserControl("/Components/Settings/SettingsPreferences.html#videoBitrateSelectorItemTemplate", function videoBitrateSelectorItemConstructor(element, options){}, {
            initialize: function initialize() {
                this._label.displayText = (this.bitrate === null) ? String.load(String.id.IDS_VIDEO_STREAMING_QUALITY_SELECTOR_OPTION_AUTOMATIC) : (this.bitrate / 1000) + "kbps";
                this._input.checked = !!this.checked
            }, onBitrateSelectorItemClick: function onBitrateSelectorItemClick(event) {
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager)) {
                        var playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).primarySession;
                        MS.Entertainment.UI.Controls.assert(playbackSession, "Video bitrate is selected at unexpected time with no playback session");
                        if (playbackSession)
                            playbackSession.selectVideoBitrate(this.bitrate)
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Utilities", {CaptionSettingsWrapper: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Utilities.SettingsWrapper", null, function(element, options) {
            var optionElements = ["characterColors", "characterOpacity", "characterSizes", "characterFonts", "backgroundColors", "backgroundOpacity", "windowColors", "windowOpacity", "characterEdges"];
            var possibleColors = [{
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_DEFAULT), value: ""
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_COLOR_WHITE), value: "255,255,255"
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_COLOR_BLACK), value: "0,0,0"
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_COLOR_RED), value: "255,0,0"
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_COLOR_GREEN), value: "0,255,0"
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_COLOR_BLUE), value: "0,0,255"
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_COLOR_YELLOW), value: "255,255,0"
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_COLOR_MAGENTA), value: "255,0,255"
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_COLOR_CYAN), value: "0,255,255"
                    }];
            var opacityOptions = [{
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_DEFAULT), value: ""
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_OPACITY_OPAQUE), value: "1.0"
                    }, {
                        name: String.load(String.id.IDS_SETTINGS_CAPTIONS_OPACITY_SEMI_TRANSPARENT), value: "0.5"
                    }];
            var elementToSettingNameMap = {
                    backgroundColors: {textBackgroundColor: 0}, characterColors: {textColor: 0}, characterOpacity: {textOpacity: 0}, backgroundOpacity: {textBackgroundOpacity: 0}, characterFonts: {textFontFamily: 0}, characterSizes: {textFontSize: 1}, windowColors: {regionBackgroundColor: 0}, windowOpacity: {regionOpacity: 0}, characterEdges: {textEdgeAttributeEnum: 0}
                };
            var choices = {
                    characterColors: possibleColors, backgroundColors: possibleColors, windowColors: possibleColors, characterOpacity: [{
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_DEFAULT), value: ""
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_OPACITY_OPAQUE), value: "1.0"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_OPACITY_SEMI_TRANSPARENT), value: "0.5"
                            }], backgroundOpacity: opacityOptions, windowOpacity: opacityOptions, characterSizes: [{
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_SIZE_50), value: "50%"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_SIZE_100), value: "100%"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_SIZE_150), value: "150%"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_SIZE_200), value: "200%"
                            }], characterFonts: [{
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_DEFAULT), value: ""
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_FONT_MONOSPACED_SERIF), value: "courier"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_FONT_PROPORTIONAL_SERIF), value: "times roman"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_FONT_MONOSPACED_SANS), value: "consolas"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_FONT_PROPORTIONAL_SANS), value: "arial"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_FONT_CASUAL), value: "comic sans ms"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_FONT_CURSIVE), value: "segoe script"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_FONT_SMALL_CAPS), value: "trebuchet ms"
                            }], characterEdges: [{
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_DEFAULT), value: "0"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_EDGE_NONE), value: "1"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_EDGE_RAISED), value: "2"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_EDGE_DEPRESSED), value: "3"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_EDGE_UNIFORMED), value: "4"
                            }, {
                                name: String.load(String.id.IDS_SETTINGS_CAPTIONS_EDGE_DROP), value: "5"
                            }]
                };
            var ccSettings = MS.Entertainment.Platform.Playback.ClosedCaptions.Renderer.loadClosedCaptionStyleSettings();
            var wrapper = this;
            function dumpCurrentSettings() {
                var settings = {};
                optionElements.forEach(function storeSelection(name) {
                    var settingEntry = elementToSettingNameMap[name];
                    var settingName = Object.keys(settingEntry)[0];
                    settings[settingName] = wrapper[name].options[wrapper[name].options.selectedIndex].value
                });
                return settings
            }
            {};
            function updatePreviewWindow() {
                var settings = dumpCurrentSettings();
                updateSelectBox(wrapper.characterOpacity, settings.textColor !== String.empty);
                updateSelectBox(wrapper.backgroundOpacity, settings.textBackgroundColor !== String.empty);
                updateSelectBox(wrapper.windowOpacity, settings.regionBackgroundColor !== String.empty);
                MS.Entertainment.Platform.Playback.ClosedCaptions.Renderer.updateClosedCaptionStyleSettings(settings, true)
            }
            {};
            function initElements(elementNames) {
                elementNames.forEach(function initElement(name) {
                    initOptions(choices[name], wrapper[name], name)
                })
            }
            {};
            function initOptions(possibleOptions, element, name) {
                possibleOptions.forEach(function load(option) {
                    var opt = document.createElement("option");
                    element.options.add(opt);
                    opt.label = option.name;
                    opt.value = option.value
                });
                var settingEntry = elementToSettingNameMap[name];
                var settingName = Object.keys(settingEntry)[0];
                var settingIndex = settingEntry[settingName];
                var settingValue = ccSettings[settingName];
                if (settingValue !== undefined && settingValue !== null)
                    for (var index = 0; index < possibleOptions.length; index++)
                        if (possibleOptions[index].value === settingValue) {
                            settingIndex = index;
                            break
                        }
                element.options.selectedIndex = settingIndex
            }
            function updateSelectBox(selectBox, enable) {
                if (!selectBox)
                    return;
                if (!enable) {
                    selectBox.setAttribute("disabled", "disabled");
                    selectBox.selectedIndex = 0
                }
                else
                    selectBox.removeAttribute("disabled")
            }
            this.initialize = function CaptionSettingsWrapper_initialize() {
                MS.Entertainment.Utilities.SettingsWrapper.prototype.initialize.call(this);
                this.domElement.parentElement.addEventListener("beforehide", this.onSettingsDismiss.bind(this), false);
                this.previewText.innerText = String.load(String.id.IDS_SETTINGS_CAPTIONS_PREVIEW);
                initElements(optionElements);
                updatePreviewWindow()
            };
            this.onReset = function CaptionSettingsWrapper_onReset() {
                optionElements.forEach(function resetIndex(name) {
                    var settingEntry = elementToSettingNameMap[name];
                    var settingName = Object.keys(settingEntry)[0];
                    var settingDefaultIndex = settingEntry[settingName];
                    this[name].options.selectedIndex = settingDefaultIndex
                }, this);
                updatePreviewWindow()
            };
            this.onSettingsDismiss = function CaptionSettingsWrapper_onSettingsDismiss() {
                var settings = dumpCurrentSettings();
                MS.Entertainment.Platform.Playback.ClosedCaptions.Renderer.saveClosedCaptionStyleSettings(settings);
                MS.Entertainment.Platform.Playback.ClosedCaptions.Renderer.updateClosedCaptionStyleSettings(settings)
            };
            this.captionSettingsChange = function CaptionSettingsWrapper_captionSettingsChange() {
                updatePreviewWindow()
            }
        })});
    WinJS.Namespace.define("MS.Entertainment.Utilities", {AboutSettingsWrapper: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Utilities.SettingsWrapper", null, function aboutSettingsWrapperConstructor(element, options){}, {
            initialize: function initialize() {
                MS.Entertainment.Utilities.SettingsWrapper.prototype.initialize.call(this);
                var helpLink;
                if (MS.Entertainment.Utilities.isMusicApp)
                    helpLink = "http://go.microsoft.com/fwlink/p/?LinkId=255543";
                else if (MS.Entertainment.Utilities.isVideoApp)
                    helpLink = "http://go.microsoft.com/fwlink/p/?LinkId=255544";
                if (helpLink)
                    this.helpLink.domElement.setAttribute("href", helpLink);
                this._showOrHideCopyrights();
                if (this.settingsAboutEchonestImage && MS.Entertainment.Utilities.isMusicApp)
                    this.settingsAboutEchonestImage.setAttribute("aria-label", String.load(String.id.IDS_MUSIC_ECHONEST_ALT_TEXT));
                this._showOrHideEchonestRadio();
                var imprintLinkUrl = this._getImprintLink();
                if (imprintLinkUrl && WinJS.Utilities.getMember("imprintLink.domElement", this)) {
                    this.imprintLink.stringId = String.id.IDS_SETTINGS_IMPRINT_LEGAL_LINK_TITLE;
                    this.imprintLink.domElement.setAttribute("href", imprintLinkUrl);
                    WinJS.Utilities.removeClass(this.imprintLink.domElement, "removeFromDisplay")
                }
                var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (config.generalSettings.showPerfTrackLog) {
                    var perfTrackLog = "";
                    MS.Entertainment.Instrumentation.PerfTrack.triggerLog.forEach(function perfTrackLogEntry(logEntry) {
                        perfTrackLog += logEntry + "\n"
                    });
                    this.perfTrackLog.value = perfTrackLog;
                    WinJS.Utilities.removeClass(this.perfTrackLog, "removeFromDisplay")
                }
                else if (WinJS.Utilities.getMember("MS.Entertainment.UI.Application.Helpers.perfMessages.length") > 0) {
                    var perfTrackLog = "";
                    for (var i = -0; i < MS.Entertainment.UI.Application.Helpers.perfMessages.length; i++)
                        perfTrackLog += MS.Entertainment.UI.Application.Helpers.perfMessages[i] + "\n";
                    this.perfTrackLog.value = perfTrackLog;
                    WinJS.Utilities.removeClass(this.perfTrackLog, "removeFromDisplay")
                }
            }, _showOrHideCopyrights: function _showOrHideCopyrights() {
                    if (MS.Entertainment.Utilities.isMusicApp) {
                        WinJS.Utilities.removeClass(this.copyrights, "removeFromDisplay");
                        WinJS.Utilities.removeClass(this.gracenoteCopyright, "removeFromDisplay")
                    }
                    else
                        WinJS.Utilities.addClass(this.copyrights, "removeFromDisplay")
                }, _showOrHideEchonestRadio: function _showOrHideEchonestRadio() {
                    if (MS.Entertainment.Utilities.isMusicApp) {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var showEchonestRadio = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.smartDJMarketplace);
                        if (showEchonestRadio)
                            WinJS.Utilities.removeClass(this.settingsAboutEchonestRadioContainer, "removeFromDisplay");
                        else
                            WinJS.Utilities.addClass(this.settingsAboutEchonestRadioContainer, "removeFromDisplay")
                    }
                }, _getImprintLink: function _getImprintLink() {
                    var globalizationManager = new Microsoft.Entertainment.Util.GlobalizationManager;
                    var currentRegion = globalizationManager.getRegion().toLowerCase();
                    var link = String.empty;
                    switch (currentRegion) {
                        case"at":
                            link = "http://go.microsoft.com/fwlink/?LinkId=317759&clcid=0xc07";
                            break;
                        case"de":
                            link = "http://go.microsoft.com/fwlink/?LinkId=317760&clcid=0x407";
                            break;
                        case"ch":
                            link = "http://go.microsoft.com/fwlink/?LinkId=317761&clcid=0x807";
                            break
                    }
                    return link
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Utilities", {SettingsVersion: MS.Entertainment.UI.Framework.defineUserControl(null, function SettingsVersionConstructor(element) {
            this.versionPromise = MS.Entertainment.Utilities.getVersionString()
        }, {
            controlName: "SettingsVersion", versionPromise: null, initialize: function initialize() {
                    MS.Entertainment.Utilities.assert(this.versionPromise, "Promise to load the version string hasn't been set");
                    this.versionPromise.then(function(v) {
                        this.domElement.textContent = v
                    }.bind(this))
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Utilities", {
        AccountSettingsWrapper: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Utilities.SettingsWrapper", null, function AccountSettingsWrapper_constructor(){}, {
            _signInHandler: null, _signIn: null, _signedInUser: null, _actionService: null, initialize: function initialize() {
                    MS.Entertainment.Utilities.SettingsWrapper.prototype.initialize.call(this);
                    this.domElement.parentElement.addEventListener("aftershow", MS.Entertainment.Utilities.Settings.onShowComplete, false);
                    this.domElement.parentElement.addEventListener("beforehide", this.onAccountPanelHide, false);
                    this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this._signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    this._actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    this.onAccountShow();
                    if (this._backButton)
                        this._backButton.setAttribute("aria-label", String.load(String.id.IDS_ACC_BACK_BUTTON))
                }, unload: function unload() {
                    if (this._signInHandler)
                        this._signIn.unbind("isSignedIn", this._signInHandler);
                    MS.Entertainment.Utilities.SettingsWrapper.prototype.unload.call(this)
                }, onAccountShow: function onAccountShow() {
                    if (!this._signIn.isSignedIn) {
                        this._onlineAccountPanel.style.visibility = "collapse";
                        this._offlineAccountPanel.style.visibility = "visible";
                        this._signInHandler = this._onSignInChange.bind(this);
                        this._signIn.bind("isSignedIn", this._signInHandler)
                    }
                    else
                        this._loadXboxAccountSummaryPage()
                }, onAccountPanelHide: function onAccountPanelHide(sender, id) {
                    var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    uiState.isSettingsCharmVisible = false;
                    var accountPanel = sender.currentTarget;
                    if (accountPanel) {
                        MS.Entertainment.UI.assert(accountPanel.winControl._dismiss, "accountPanel.winControl._dismiss missing");
                        accountPanel.winControl._dismiss()
                    }
                    if (MS.Entertainment.Utilities.Settings._signInHandler) {
                        this._signIn.unbind("isSignedIn", this._signInHandler);
                        this._signInHandler = null
                    }
                }, _loadXboxAccountSummaryPage: function _loadXboxAccountSummaryPage() {
                    if (this._onlineAccountPanel && this._signIn.isSignedIn) {
                        this._offlineAccountPanel.style.visibility = "collapse";
                        if (MS.Entertainment.Utilities.isMusicApp) {
                            if ((new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement).isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription)) {
                                WinJS.Utilities.removeClass(this._musicPassButton, "removeFromDisplay");
                                this._musicPassLevel.stringId = this._getMusicPassInformationStringId()
                            }
                            if (this._signedInUser.isSubscription)
                                WinJS.Utilities.removeClass(this._musicDevicesButton, "removeFromDisplay")
                        }
                        this._accountEmail.text = this._signedInUser.signInName;
                        if (this._signedInUser.canSignOut)
                            this._accountHeader.stringId = String.id.IDS_SETTINGS_ACCOUNT_SIGN_OUT_TC;
                        else
                            this._accountHeader.stringId = String.id.IDS_SETTINGS_ACCOUNT_TITLE;
                        this._onlineAccountPanel.style.visibility = "visible";
                        this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.LoadXboxAccountSummaryPage)
                    }
                }, _getMusicPassInformationStringId: function _getMusicPassInformationStringId() {
                    if (!this._signedInUser.isSubscription)
                        return String.id.IDS_SETTINGS_ACCOUNT_MUSIC_PASS_DESC_NONE_TC;
                    var stringIdToReturn = MS.Entertainment.Utilities.AccountSettingsWrapper._musicPassSubscriptionStringMap[this._signedInUser.subscriptionOfferID];
                    if (!stringIdToReturn)
                        stringIdToReturn = String.id.IDS_SETTINGS_ACCOUNT_MUSIC_PASS_DESC_UKNOWN_TC;
                    return stringIdToReturn
                }, _redeemCodeClick: function _redeemCodeClick(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    var url = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_ModernPurchase) + "/redeem?client=x13";
                    this._openWebblendDialog(url);
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.RedeemCodeClick)
                }, _musicPassSubscribeClick: function _musicPassSubscribeClick(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.subscriptionSignup);
                    action.automationId = MS.Entertainment.UI.AutomationIds.settingsSubscriptionSignup;
                    action.execute();
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.MusicPassSubscribeClick)
                }, _manageMusicDevices: function _manageMusicDevices(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    MS.Entertainment.Utilities.navigateToUrl(MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/devices/manage", MS.Entertainment.UI.AutomationIds.settingsAccountManageDevices);
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.ManageMusicDevices)
                }, _managePaymentOptionsClick: function _managePaymentOptionsClick(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    MS.Entertainment.Utilities.navigateToUrl("http://go.microsoft.com/fwlink/?LinkId=506604", MS.Entertainment.UI.AutomationIds.settingsAccountManagePayment);
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.ManagePaymentOptionsClick)
                }, _billingContactInfoClick: function _billingContactInfoClick(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    MS.Entertainment.Utilities.navigateToUrl(MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/Account/BillingAccountInformation", MS.Entertainment.UI.AutomationIds.settingsAccountBillingContact);
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.BillingContactInfoClick)
                }, _billingHistoryClick: function _billingHistoryClick(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    MS.Entertainment.Utilities.navigateToUrl(MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_MicrosoftBilling), MS.Entertainment.UI.AutomationIds.settingsAccountBillingHistory);
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.BillingHistoryClick)
                }, _privacyClick: function _privacyClick(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    MS.Entertainment.Utilities.navigateToUrl(MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/Account/Settings", MS.Entertainment.UI.AutomationIds.settingsAccountPrivacy);
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.PrivacyClick)
                }, _contactPreferencesClick: function _contactPreferencesClick(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    MS.Entertainment.Utilities.navigateToUrl(MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/MyXbox/ContactPreferences", MS.Entertainment.UI.AutomationIds.settingsAccountContactPreferences);
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.ContactPreferencesClick)
                }, _userAccountLinkClicked: function _userAccountLinkClicked(e) {
                    if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                        return;
                    if (this._signedInUser.canSignOut) {
                        this._signIn.signOut();
                        try {
                            WinJS.UI.SettingsFlyout.show()
                        }
                        catch(ex) {
                            MS.Entertainment.Utilities.fail(false, "WinJS.UI.SettingsFlyout.show() fails: " + ex.toString())
                        }
                    }
                    else
                        window.open(MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBox) + "/Live/ChangeUser");
                    this._sendTelemetry(MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.UserAccountLinkClicked)
                }, _openWebblendDialog: function _openWebblendDialog(url) {
                    MS.Entertainment.UI.Shell.showWebHostDialog(null, {
                        desiredLeft: "0%", desiredTop: null, desiredHeight: (new Microsoft.Entertainment.Configuration.ConfigurationManager).service.modernWebBlendHeight, showBackButton: false, showCancelButton: false
                    }, {
                        sourceUrl: "", authenticatedSourceUrl: url, webHostExperienceFactory: MS.Entertainment.Utilities.SettingsExperience.factory, taskId: MS.Entertainment.UI.Controls.WebHost.TaskId.ACCOUNT, isDialog: true
                    })
                }, _onSignInChange: function _onSignInChange(isSignedIn) {
                    if (isSignedIn)
                        this._loadXboxAccountSummaryPage()
                }, _sendTelemetry: function _sendTelemetry(settingsAccountChoice) {
                    var telemetryParameterArray = [{
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.SettingsAccountUsage, parameterValue: settingsAccountChoice
                            }];
                    MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.Settings, telemetryParameterArray)
                }, _overlayOnLostFocus: function _overlayOnLostFocus(){}
        }, null, {_musicPassSubscriptionStringMap: MS.Entertainment.UI.Framework.lazyDefine(function() {
                return {"18446189333720334375": String.id.IDS_SETTINGS_ACCOUNT_MUSIC_PASS_FREE_TWELVE_MONTH}
            })}), SettingsExperience: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.WebHostExperience", function SettingsExperience_constructor() {
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this)
            }, {
                _onRedemptionSuccess: function _onRedemptionSuccess() {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    signIn.refreshSignInState().then(function refreshPurchaseHistory() {
                        var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                        if (signIn.isSignedIn)
                            purchaseHistoryService.grovel(false, false)
                    })
                }, messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                        var errorCode = String.empty;
                        if (!this.disposed)
                            switch (messageStruct.verb) {
                                case"CLOSE_DIALOG":
                                    if (messageStruct.reason === "SUCCESS")
                                        this.eventProvider.traceSettingsHome_Finish(messageStruct.taskId);
                                    else if (messageStruct.reason === "ERROR")
                                        this.eventProvider.traceSettingsAccount_Error(messageStruct.errorCode);
                                    else if (messageStruct.reason === "CANCEL") {
                                        try {
                                            WinJS.UI.SettingsFlyout.show()
                                        }
                                        catch(ex) {
                                            MS.Entertainment.Utilities.fail(false, "WinJS.UI.SettingsFlyout.show() fails: " + ex.toString())
                                        }
                                        this.eventProvider.traceSettings_BackToHome("")
                                    }
                                    break;
                                case"OPEN_DIALOG":
                                    switch (messageStruct.reason) {
                                        case"xblmembership":
                                        case"redeemcode":
                                        case"zunepass":
                                            MS.Entertainment.UI.Shell.showWebHostDialog(null, {
                                                desiredLeft: "0%", desiredTop: "10%", showBackButton: false, showCancelButton: false
                                            }, {
                                                sourceUrl: "", authenticatedSourceUrl: messageStruct.targetUrl, webHostExperienceFactory: MS.Entertainment.Utilities.SettingsExperience.factory, taskId: MS.Entertainment.UI.Controls.WebHost.TaskId.ACCOUNT, isDialog: true
                                            });
                                            break
                                    }
                                    break;
                                case"UPGRADE_MEMBERSHIP":
                                case"UPGRADE_MEMBERSHIP ":
                                    this.eventProvider.traceSubscriptionSignup_Start(String.empty);
                                    break;
                                case"MEMBERSHIP_UPGRADE_SUCESSFUL":
                                case"MEMBERSHIP_UPGRADE_SUCCESSFUL":
                                case"MEMBERSHIP_UPGRADE_SUCESSFUL ":
                                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                    signIn.refreshSignInState();
                                    this.eventProvider.traceSubscriptionSignup_Finish(String.empty);
                                    break;
                                case"TOKEN_REDEMPTION_SUCCESSFUL":
                                    this._onRedemptionSuccess();
                                    break;
                                case"SIGNOUT_CLICKED":
                                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                    signIn.signOut();
                                    try {
                                        WinJS.UI.SettingsFlyout.show()
                                    }
                                    catch(ex) {
                                        MS.Entertainment.Utilities.fail(false, "WinJS.UI.SettingsFlyout.show() fails: " + ex.toString())
                                    }
                                    break;
                                case"done":
                                    switch (messageStruct.status) {
                                        case"success":
                                            this._onRedemptionSuccess();
                                            break
                                    }
                                    break
                            }
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments)
                    }, errorReceived: function errorReceived(errorCode) {
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.errorReceived.apply(this, arguments)
                    }
            }, {factory: WinJS.Utilities.markSupportedForProcessing(function factory() {
                    return new MS.Entertainment.Utilities.SettingsExperience
                })})
    });
    (function() {
        WinJS.Application.onsettings = function onSettings(e) {
            var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
            eventProvider.traceSettingsPopulate_Start("");
            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
            if (!(new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience) {
                var hasCaptions = MS.Entertainment.Platform.PlaybackHelpers.isClosedCaptionFeatureEnabled();
                e.detail.applicationcommands = {};
                var settingsPage = {
                        about: "/Components/Settings/SettingsAbout.html", account: "/Components/Settings/SettingsAccount.html", preferences: "/Components/Settings/SettingsPreferences.html", captions: "/Components/Settings/SettingsCaptions.html", feedback: "/Components/Settings/SettingsFeedback.html"
                    };
                if (signIn.isSignInEnabled)
                    e.detail.applicationcommands.SettingsAccount = {
                        href: settingsPage.account, title: String.load(String.id.IDS_SETTINGS_ACCOUNT_TITLE_TC)
                    };
                e.detail.applicationcommands.SettingsPreferences = {
                    href: settingsPage.preferences, title: String.load(String.id.IDS_SETTINGS_PREFERENCE_TITLE)
                };
                if (hasCaptions)
                    e.detail.applicationcommands.SettingsCaptions = {
                        href: settingsPage.captions, title: String.load(String.id.IDS_SETTINGS_CAPTIONS_TITLE)
                    };
                e.detail.applicationcommands.SettingsAbout = {
                    href: settingsPage.about, title: String.load(String.id.IDS_SETTINGS_ABOUT_TITLE)
                };
                e.detail.applicationcommands.SettingsFeedback = {
                    href: settingsPage.feedback, title: String.load(String.id.IDS_SETTINGS_FEEDBACK_TITLE)
                }
            }
            var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
            if (appBar && appBar.hide)
                appBar.hide();
            var showDownloadDeviceSettingsCommand = new Windows.UI.ApplicationSettings.SettingsCommand("SettingsShowDownloadDevice", String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_REGISTEREDDEVICES_LINK), _seeDevicesSettingsCommandHandler);
            var removeDownloadDeviceSettingsCommand = new Windows.UI.ApplicationSettings.SettingsCommand("SettingsRemoveDownloadDevice", String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_UNREGISTERDEVICE_LINK), _removeDevicesSettingsCommandHandler);
            var helpSettingsCommand = new Windows.UI.ApplicationSettings.SettingsCommand("SettingsHelp", String.load(String.id.IDS_SETTINGS_HELP_TITLE), _helpSettingsCommandHandler);
            eventProvider.traceSettingsWinJSPopulate_Start("");
            WinJS.UI.SettingsFlyout.populateSettings(e);
            if (MS.Entertainment.Utilities.isVideoApp && signIn.isSignedIn && !(new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience) {
                e.detail.e.request.applicationCommands.append(showDownloadDeviceSettingsCommand);
                var deviceGroup = Microsoft.Entertainment.Service.Requests.DeviceGroup;
                if (deviceGroup.DeviceRegisterationStatus.registered === deviceGroup.DeviceGroupManagement.getDeviceRegisterationStatus())
                    e.detail.e.request.applicationCommands.append(removeDownloadDeviceSettingsCommand)
            }
            e.detail.e.request.applicationCommands.append(helpSettingsCommand);
            function _helpSettingsCommandHandler() {
                var helpLink;
                var helpApp = MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.UnknownHelpClicked;
                if (MS.Entertainment.Utilities.isMusicApp) {
                    helpLink = "http://go.microsoft.com/fwlink/?LinkId=299474";
                    helpApp = MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.MusicHelpClicked
                }
                else if (MS.Entertainment.Utilities.isVideoApp) {
                    helpLink = "http://go.microsoft.com/fwlink/?LinkId=299476";
                    helpApp = MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.VideoHelpClicked
                }
                MS.Entertainment.Utilities.navigateToUrl(helpLink, MS.Entertainment.UI.AutomationIds.settingsHelp);
                var telemetryParameterArray = [{
                            parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.SettingsHelpUsage, parameterValue: helpApp
                        }];
                MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.Settings, telemetryParameterArray)
            }
            {};
            function _seeDevicesSettingsCommandHandler() {
                MS.Entertainment.Utilities.navigateToUrl("http://go.microsoft.com/fwlink/?LinkId=614900&ref=videosetting", MS.Entertainment.UI.AutomationIds.settingsShowDevice)
            }
            {};
            function _removeDevicesSettingsCommandHandler() {
                var removeCancelDialogButtons = [{
                            title: String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_UNREGISTERDEVICE_CONFIRM_REMOVE), execute: function onRemove(overlay) {
                                    Microsoft.Entertainment.Service.Requests.DeviceGroup.DeviceGroupManagement.deregisterDeviceAsync().done(null, function(err){});
                                    overlay.hide()
                                }
                        }, {
                            title: String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_UNREGISTERDEVICE_CONFIRM_CANCEL), execute: function onCancel(overlay) {
                                    overlay.hide()
                                }
                        }];
                return MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_UNREGISTERDEVICE_CONFIRM_HEADER), String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_UNREGISTERDEVICE_CONFIRM_MESSAGE), {
                        buttons: removeCancelDialogButtons, defaultButtonIndex: 0, cancelButtonIndex: 1
                    })
            }
            {};
            eventProvider.traceSettingsPopulate_End("")
        }
    })()
})()
