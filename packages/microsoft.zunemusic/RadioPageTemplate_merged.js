/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/music/selectartistflyout.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        SelectArtistTopArtistsControlInvocationHelper: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryControlInvocationHelper", function SelectArtistTopArtistsControlInvocationHelper(invokeDataAction) {
            this.invokeDataAction = invokeDataAction;
            MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.prototype.constructor.apply(this)
        }, {
            invokeDataAction: null, invokeItem: function invokeItem(invocationEvent, eventData) {
                    var getDataPromise;
                    var invokedItem = {
                            srcElement: invocationEvent.srcElement, itemIndex: invocationEvent.detail.itemIndex
                        };
                    if (eventData)
                        getDataPromise = WinJS.Promise.wrap(eventData);
                    else if (invocationEvent.detail.itemPromise)
                        getDataPromise = invocationEvent.detail.itemPromise;
                    else
                        getDataPromise = this._galleryControl.getItemAtIndex(invocationEvent.detail.itemIndex);
                    MS.Entertainment.UI.Controls.assert(getDataPromise, "cannot obtain invoked object");
                    getDataPromise.done(function getItemData(data) {
                        var key = data.key;
                        data = data.data || data;
                        if (invokedItem.srcElement === invocationEvent.srcElement)
                            if (this.invokeDataAction)
                                this.invokeDataAction(data)
                    }.bind(this), function getItemDataFailed() {
                        MS.Entertainment.UI.Controls.assert(getDataPromise, "cannot find invoked data")
                    })
                }
        }), SelectArtistEditBox: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.EditBox", null, null, {
                valueChanged: null, _keyEvents: null, initialize: function initialize() {
                        MS.Entertainment.UI.Controls.EditBox.prototype.initialize.call(this);
                        this._keyEvents = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {keydown: this.onKeyDown.bind(this)})
                    }, unload: function unload() {
                        if (this._keyEvents) {
                            this._keyEvents.cancel();
                            this._keyEvents = null
                        }
                        MS.Entertainment.UI.Controls.EditBox.prototype.unload.call(this)
                    }, validateText: function validateText(value) {
                        if (this.valueChanged)
                            this.valueChanged(value)
                    }, onKeyDown: function onKeyDown(e) {
                        if (!this.valueChanged)
                            return;
                        var value = this.getValue();
                        if ((e.keyCode === WinJS.Utilities.Key.backspace) && (!value || value.length === 1))
                            this.valueChanged(String.empty);
                        else if (e.keyCode !== WinJS.Utilities.Key.tab && !value && e.char)
                            this.valueChanged(e.char)
                    }, input: function input(e) {
                        var value = this.getValue();
                        this.valueChanged(value)
                    }
            }), SelectArtistFeaturedGrouper: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryGrouper", function selectArtistGrouperConstructor(){}, {createKey: function createKey(item) {
                    return String.load(String.id.IDS_SMARTDJ_POPULAR_ARTISTS_DIALOG_TITLE)
                }}), SelectArtistSuggestedSmartDJGrouper: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryGrouper", function selectArtistGrouperConstructor(){}, {createKey: function createKey(item) {
                    if (item.data && item.data.isSmartDJ)
                        return String.load(String.id.IDS_SMARTDJ_ARTIST_RESULTS);
                    else
                        return String.load(String.id.IDS_SMARTDJ_NONSMARTDJ_ARTIST_RESULTS)
                }}), SelectArtistFlyout: MS.Entertainment.UI.Framework.defineUserControl("Controls/Music/SelectArtistFlyout.html#selectArtistFlyoutTemplate", function selectArtistFlyout(){}, {
                _autoComplete: String.empty, _suggestQueryPromise: null, _featuredArtists: null, _eventHandlers: null, topArtists: null, topArtistsFailed: false, isSmartDJ: false, inputValue: String.empty, overrideSmartDJ: false, autoSuggest: false, valueMatches: false, failedModel: null, initialize: function initialize() {
                        this.autoComplete = String.load(String.id.IDS_SMARTDJ_POPULAR_ARTISTS_ENTRY_TEXT);
                        var networkStatus = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus;
                        if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace)) {
                            this._handleInitError();
                            return
                        }
                        var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        if (sessionManager.primarySession && sessionManager.primarySession.isRemoteSession && sessionManager.primarySession.isRemoteSession() && !MS.Entertainment.Utilities.isWindowsBlue) {
                            this._handleRemote();
                            return
                        }
                        var events = {};
                        if (MS.Entertainment.Utilities.isApp2)
                            events.keyup = this._handleKeyEvent.bind(this);
                        else
                            events.keydown = this._handleKeyEvent.bind(this);
                        this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.domElement, events);
                        this._appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        this._appBarEventHandlers = WinJS.Binding.bind(this._appBar, {visible: function dismissOnAppBar(newValue, oldValue) {
                                if (oldValue !== undefined && newValue)
                                    this._dialog.hide()
                            }.bind(this)});
                        var query = new MS.Entertainment.Data.Query.Music.TopArtists;
                        if (this.isSmartDJ)
                            query.hasMediaGuide = true;
                        query.chunkSize = 25;
                        query.aggregateChunks = false;
                        if (this.isSmartDJ)
                            query.hasSmartDJ = true;
                        this._featuredGallery.invocationHelper = new MS.Entertainment.UI.Controls.SelectArtistTopArtistsControlInvocationHelper(this.invokePlayAction.bind(this));
                        this._featuredGallery.grouperType = MS.Entertainment.UI.Controls.SelectArtistFeaturedGrouper;
                        this._suggestedGallery.invocationHelper = new MS.Entertainment.UI.Controls.SelectArtistTopArtistsControlInvocationHelper(this.invokeQuery.bind(this));
                        this._suggestedGallery.grouperType = this.isSmartDJ ? MS.Entertainment.UI.Controls.SelectArtistSuggestedSmartDJGrouper : null;
                        this._suggestedGallery.visibility = false;
                        query.execute().done(function success(artists) {
                            if (!this._unloaded)
                                if (artists && artists.result.items) {
                                    this._featuredArtists = artists.result.items;
                                    if (this._suggestedGallery && !this._suggestedGallery.visibility && this._featuredGallery)
                                        this._featuredGallery.dataSource = this._featuredArtists
                                }
                                else
                                    this._showFailedFeaturedArtistError()
                        }.bind(this), function fail() {
                            if (!this._unloaded)
                                this._showFailedFeaturedArtistError()
                        }.bind(this));
                        this.autoSuggest = new MS.Entertainment.Data.Query.Music.AutoSuggest;
                        this.autoSuggestSmartDJ = new MS.Entertainment.Data.Query.Music.AutoSuggest;
                        this._editBox.validateText();
                        this._editBox.valueChanged = this.valueChanged.bind(this);
                        this._editBox.setFocus(true);
                        this._setButtonState(this.isSmartDJ, false);
                        this._playButton.doClick = this.onClick.bind(this)
                    }, _handleKeyEvent: function _handleKeyEvent(e) {
                        switch (e.keyCode) {
                            case WinJS.Utilities.Key.enter:
                            case WinJS.Utilities.Key.invokeButton:
                                this.onClick();
                                e.stopPropagation();
                                e.preventDefault();
                                break;
                            case WinJS.Utilities.Key.escape:
                                this._dialog.hide();
                                break;
                            case WinJS.Utilities.Key.dismissButton:
                                e.stopPropagation();
                                this._dialog.hide();
                                break
                        }
                    }, autoComplete: {
                        get: function() {
                            return this._autoComplete
                        }, set: function(value) {
                                if (value !== this._autoComplete) {
                                    var oldValue = this._autoComplete;
                                    this._autoComplete = value;
                                    if (this._initialized && !this._unloaded)
                                        this._editBox.autoCompleteLabel.value = value;
                                    this.notify("autoComplete", value, oldValue)
                                }
                            }
                    }, _handleRemote: function _handleRemote() {
                        this.failedModel = {primaryStringId: String.id.IDS_MUSIC_PLAY_TO_DISABLED_TEXT};
                        this._handleInitError()
                    }, _handleInitError: function _handleInitError() {
                        this._editBox.visibility = false;
                        MS.Entertainment.Utilities.hideElement(this._playButton.domElement);
                        MS.Entertainment.Utilities.showElement(this.failedControl);
                        var newControl = document.createElement("div");
                        newControl.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.FailedPanel");
                        this.failedControl.appendChild(newControl);
                        WinJS.UI.process(newControl).done(function setModel() {
                            if (this.failedModel)
                                newControl.winControl.model = this.failedModel
                        }.bind(this))
                    }, _setButtonState: function _setButtonState(isSmartDJ, enabled) {
                        if (this._playButton) {
                            this._playButton.isDisabled = !enabled;
                            if (isSmartDJ) {
                                this._playButton.icon = MS.Entertainment.UI.Icon.smartDj;
                                this._playButton.hideDefaultRing = true;
                                this._playButton.accessibilityStringId = String.id.IDS_SMARTDJ_PLAY_FROM_MEDIA_ACTION;
                                if (enabled)
                                    this._playButton.iconPressed = MS.Entertainment.UI.Icon.smartDjPressed;
                                else
                                    this._playButton.iconPressed = null
                            }
                            else {
                                this._playButton.icon = MS.Entertainment.UI.Icon.play;
                                this._playButton.hideDefaultRing = false;
                                this._playButton.accessibilityStringId = String.id.IDS_MUSIC_PLAY_TOP_SONGS_BUTTON
                            }
                        }
                    }, unload: function unload() {
                        if (this._eventHandlers) {
                            this._eventHandlers.cancel();
                            this._eventHandlers = null
                        }
                        if (this._appBarEventHandlers) {
                            this._appBarEventHandlers.cancel();
                            this._appBarEventHandlers = null
                        }
                        this._cancelSuggestionQueries();
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, invokePlayAction: function invokePlayAction(data) {
                        this.autoComplete = String.empty;
                        var playSmartDJ = this.isSmartDJ && !this.overrideSmartDJ;
                        if (playSmartDJ) {
                            this._editBox.cancelValidationTimeoutPromise();
                            var inputControl = WinJS.Utilities.getMember("_editBox.inputControl", this);
                            if (inputControl) {
                                inputControl.value = data.name;
                                this._showErrorPanel(String.load(String.id.IDS_SMARTDJ_LOADING_TEXT).format(data.name))
                            }
                            this._setButtonState(true, false)
                        }
                        var _actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var action = _actionService.getAction(playSmartDJ ? MS.Entertainment.UI.Actions.ActionIdentifiers.playSmartDJ : MS.Entertainment.UI.Actions.ActionIdentifiers.playArtist);
                        action.automationId = playSmartDJ ? MS.Entertainment.UI.AutomationIds.flyoutPlaySmartDJ : MS.Entertainment.UI.AutomationIds.flyoutPlayArtist;
                        action.parameter = {
                            mediaItem: data, showAppBar: true
                        };
                        var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        var networkStatus = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus;
                        var online = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var freeStreamEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
                        var anonymousFreePlayEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlayAnonymous);
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var anonymousFreePlayLimitReached = configurationManager.music.anonymousLimitReached;
                        var actionRequiresSignin = !freeStreamEnabled || !anonymousFreePlayEnabled || anonymousFreePlayLimitReached;
                        if (online && !signInService.isSignedIn && !signInService.isSigningIn && actionRequiresSignin) {
                            var signInResult = function SignInResult(result) {
                                    if (result === MS.Entertainment.Utilities.SignIn.SignInResult.success)
                                        action.execute().done(function playbackSuccess() {
                                            if (this.successCallback)
                                                this.successCallback()
                                        }.bind(this));
                                    else {
                                        MS.Entertainment.Utilities.hideElement(this._errorText);
                                        if (this._suggestedGallery)
                                            this._suggestedGallery.visibility = true;
                                        var inputControl = WinJS.Utilities.getMember("_editBox.inputControl", this);
                                        if (inputControl)
                                            inputControl.value = data.name;
                                        if (this._editBox)
                                            this._editBox.setFocus();
                                        this.valueChanged(data.name)
                                    }
                                }.bind(this);
                            if (freeStreamEnabled)
                                if (anonymousFreePlayEnabled && anonymousFreePlayLimitReached) {
                                    MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.unauthenticatedTrackLimitExceeded);
                                    MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_KEEP_PLAYING_NEW_USER_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.signUp, MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel], signInResult)
                                }
                                else
                                    MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.signUp, MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel], signInResult);
                            else {
                                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                signIn.signIn().done(signInResult, signInResult)
                            }
                        }
                        else {
                            if (!playSmartDJ) {
                                this._cleanUpDialogBeforeHiding();
                                this._dialog.hide()
                            }
                            action.execute().done(function playbackSuccess() {
                                if (playSmartDJ) {
                                    var hideDialog = function hideDialog() {
                                            this._cleanUpDialogBeforeHiding();
                                            this._dialog.hide()
                                        }.bind(this);
                                    MS.Entertainment.Platform.PlaybackHelpers.waitForTransportState(MS.Entertainment.Platform.Playback.TransportState.playing).done(hideDialog, hideDialog)
                                }
                                if (this.successCallback)
                                    this.successCallback()
                            }.bind(this))
                        }
                    }, _cleanUpDialogBeforeHiding: function _cleanUpDialogBeforeHiding() {
                        if (this._featuredGallery)
                            this._featuredGallery.dataSource = null;
                        if (this._suggestedGallery)
                            this._suggestedGallery.dataSource = null;
                        if (this.OSKHideHelper)
                            this.OSKHideHelper.focus()
                    }, invokeQuery: function invokeQuery(data) {
                        var artistQuery = new MS.Entertainment.Data.Query.Music.ArtistSearch;
                        artistQuery.search = data.keyword || data;
                        artistQuery.autoSuggestSeed = true;
                        this._editBox.cancelValidationTimeoutPromise();
                        var inputControl = WinJS.Utilities.getMember("_editBox.inputControl", this);
                        if (inputControl)
                            inputControl.value = artistQuery.search;
                        this.autoComplete = String.empty;
                        if (!this.isSmartDJ || data.isSmartDJ || this.overrideSmartDJ) {
                            if (this.isSmartDJ && !this.overrideSmartDJ) {
                                this._showErrorPanel(String.load(String.id.IDS_SMARTDJ_LOADING_TEXT).format(WinJS.Utilities.getMember("_editBox.inputControl.value", this)));
                                this._setButtonState(true, false)
                            }
                            artistQuery.execute().then(function foundArtist(artists) {
                                if (artists.result.items) {
                                    var playSmartDJ = this.isSmartDJ && !this.overrideSmartDJ;
                                    var searchArtistName = MS.Entertainment.Utilities.sanitizeString(artistQuery.search);
                                    var searchArtistLenientRegex = new RegExp(searchArtistName.replace(/ /g, " ?").replace(/and/g, "(and)?"));
                                    var inexactMatch = false;
                                    var artist;
                                    artists.result.items.forEach(function findArtist(args) {
                                        var currentArtist = args.item.data || {};
                                        if (!playSmartDJ || (currentArtist && currentArtist.hasSmartDJ)) {
                                            var artistName = MS.Entertainment.Utilities.sanitizeString(currentArtist.name && currentArtist.name.toLowerCase());
                                            var artistSortName = MS.Entertainment.Utilities.sanitizeString(currentArtist.sortName && currentArtist.sortName.toLowerCase());
                                            var artistNames = [artistName];
                                            if (artistName !== artistSortName) {
                                                artistNames.push(artistSortName);
                                                var commaIndex = currentArtist.sortName ? currentArtist.sortName.indexOf(",") : -1;
                                                if (commaIndex > 0 && commaIndex < artistSortName.length - 1) {
                                                    var firstName = currentArtist.sortName.substring(commaIndex + 1);
                                                    var lastName = currentArtist.sortName.substring(0, commaIndex);
                                                    artistNames.push(MS.Entertainment.Utilities.sanitizeString((firstName + lastName).toLowerCase()))
                                                }
                                            }
                                            for (var i = 0; i < artistNames.length; i++) {
                                                var checkArtistName = artistNames[i];
                                                if (checkArtistName === searchArtistName) {
                                                    args.stop = true;
                                                    artist = currentArtist
                                                }
                                                else if (!inexactMatch && checkArtistName.search(searchArtistLenientRegex) !== -1) {
                                                    artist = currentArtist;
                                                    inexactMatch = true
                                                }
                                            }
                                        }
                                    }.bind(this)).then(function tryPlayArtist() {
                                        var smartDjAble = !playSmartDJ || (artist && artist.hasSmartDJ);
                                        if (artist && smartDjAble)
                                            this.invokePlayAction(artist);
                                        else if (artist && !smartDjAble)
                                            this._showNotSmartDjAble();
                                        else
                                            this._showFailedSuggestedArtistError()
                                    }.bind(this))
                                }
                                else
                                    this._showFailedSuggestedArtistError()
                            }.bind(this), function findArtistFailed() {
                                this._showFailedSuggestedArtistError()
                            }.bind(this))
                        }
                        else
                            this._showNotSmartDjAble()
                    }, onClick: function onClick(event) {
                        if (this.autoComplete)
                            this.invokeQuery({
                                keyword: this.autoComplete, isSmartDJ: this.isSmartDJ
                            });
                        else if (this.valueMatches)
                            this.invokeQuery({
                                keyword: this.inputValue, isSmartDJ: this.isSmartDJ
                            })
                    }, valueChanged: function valueChanged(value) {
                        var suggestQueryPromise;
                        if (this.inputValue !== value) {
                            this._cancelSuggestionQueries();
                            if (!value) {
                                if (this.topArtistsFailed)
                                    this._showFailedFeaturedArtistError();
                                else {
                                    this._featuredGallery.dataSource = this._featuredArtists;
                                    MS.Entertainment.Utilities.hideElement(this._errorText)
                                }
                                this.autoComplete = String.load(String.id.IDS_SMARTDJ_POPULAR_ARTISTS_ENTRY_TEXT);
                                this._setButtonState(this.isSmartDJ, false);
                                this._suggestedGallery.visibility = false;
                                this._clearDataSource()
                            }
                            else if (value[value.length - 1] === "\n")
                                value = value.substring(0, value.length - 1);
                            else {
                                if (!this.inputValue || !this._startsWith(this.autoComplete, value) || this.autoComplete.length >= MS.Entertainment.UI.Controls.SelectArtistFlyout.MAX_AUTOSUGGEST_LENGTH || this.overrideSmartDJ) {
                                    this.autoComplete = String.empty;
                                    this.overrideSmartDJ = false;
                                    this._setButtonState(this.isSmartDJ, false)
                                }
                                this._clearDataSource();
                                this.popularArtistsVisible = false;
                                this._featuredGallery.dataSource = null;
                                this._suggestedGallery.visibility = true;
                                this.autoSuggest.keyword = value;
                                this.autoSuggest.mediaType = MS.Entertainment.Data.Query.bbxMediaType.artist;
                                if (this.isSmartDJ) {
                                    this.autoSuggestSmartDJ.keyword = value;
                                    this.autoSuggestSmartDJ.mediaType = MS.Entertainment.Data.Query.bbxMediaType.artistSmartDj;
                                    var promises = [this._executeSuggestionQuery(this.autoSuggestSmartDJ), this._executeSuggestionQuery(this.autoSuggest)];
                                    suggestQueryPromise = WinJS.Promise.join(promises);
                                    this._suggestQueryPromise = suggestQueryPromise;
                                    suggestQueryPromise.done(function mergeSuggestionData(results) {
                                        if (suggestQueryPromise === this._suggestQueryPromise) {
                                            this._mergeSuggestionData(results[0], results[1]);
                                            this._suggestQueryPromise = null
                                        }
                                    }.bind(this), function mergeSuggestionDataFailed(results) {
                                        if (suggestQueryPromise === this._suggestQueryPromise) {
                                            this._showFailedSuggestedArtistError();
                                            this._suggestQueryPromise = null
                                        }
                                    }.bind(this))
                                }
                                else {
                                    suggestQueryPromise = this.autoSuggest.execute();
                                    this._suggestQueryPromise = suggestQueryPromise;
                                    suggestQueryPromise.done(function addSuggestions(suggestions) {
                                        if (suggestQueryPromise === this._suggestQueryPromise) {
                                            this._parseSuggestionData(suggestions.result.itemsArray || []);
                                            this._suggestQueryPromise = null
                                        }
                                    }.bind(this), function suggestionsFailed(e) {
                                        if (suggestQueryPromise === this._suggestQueryPromise) {
                                            this._showFailedSuggestedArtistError();
                                            this._suggestQueryPromise = null
                                        }
                                    }.bind(this))
                                }
                            }
                            this.inputValue = value
                        }
                    }, _setDataSource: function _setDataSource(array) {
                        if (this.inputValue && this._suggestedGallery)
                            this._suggestedGallery.dataSource = new MS.Entertainment.Data.VirtualList(null, array)
                    }, _clearDataSource: function _clearDataSource() {
                        if (this._suggestedGallery)
                            this._suggestedGallery.dataSource = null
                    }, _showFailedFeaturedArtistError: function _showFailedFeaturedArtistError() {
                        this.topArtistsFailed = true;
                        this._showErrorPanel(String.load(String.id.IDS_FAILED_PANEL_HEADER))
                    }, _showFailedSuggestedArtistError: function _showFailedFeaturedArtistError() {
                        this._setButtonState(this.isSmartDJ, false);
                        this._showErrorPanel(String.load(this.isSmartDJ ? String.id.IDS_SMARTDJ_ARTIST_NOT_FOUND : String.id.IDS_SEARCH_NORESULT_TITLE).format(WinJS.Utilities.getMember("_editBox.inputControl.value", this)))
                    }, _showNotSmartDjAble: function _showNotSmartDjAble() {
                        this._setButtonState(false, true);
                        this.overrideSmartDJ = true;
                        this._errorText.textContent = String.load(String.id.IDS_SMARTDJ_NONSMARTDJ_ARTIST).format(WinJS.Utilities.getMember("_editBox.inputControl.value", this), String.empty);
                        this._suggestedGallery.visibility = false;
                        MS.Entertainment.Utilities.showElement(this._errorText);
                        this.inputValue = WinJS.Utilities.getMember("_editBox.inputControl.value", this);
                        this.valueMatches = true
                    }, _showErrorPanel: function _showErrorPanel(text) {
                        this._errorText.textContent = text;
                        this._featuredGallery.dataSource = null;
                        this._suggestedGallery.visibility = false;
                        MS.Entertainment.Utilities.showElement(this._errorText)
                    }, _executeSuggestionQuery: function _executeSuggestionQuery(query, onComplete, type) {
                        return query.execute().then(function getSuggestions(suggestions) {
                                return (suggestions.result.itemsArray || [])
                            }, function suggestionsError(error) {
                                return (error.message === "Canceled") ? null : []
                            })
                    }, _cancelSuggestionQueries: function _cancelSuggestionQueries() {
                        if (this._suggestQueryPromise) {
                            this._suggestQueryPromise.cancel();
                            this._suggestQueryPromise = null
                        }
                    }, _mergeSuggestionData: function _mergeSuggestionData(smartDJSuggestions, otherSuggestions) {
                        if (!this.inputValue || !smartDJSuggestions || !otherSuggestions)
                            return;
                        var mergedSuggestions = [];
                        for (var i = 0; i < smartDJSuggestions.length; i++) {
                            smartDJSuggestions[i].isSmartDJ = true;
                            mergedSuggestions.push(smartDJSuggestions[i])
                        }
                        var j = 0;
                        for (var i = 0; i < otherSuggestions.length; i++)
                            if (smartDJSuggestions.length !== j && otherSuggestions[i].name === smartDJSuggestions[j].name)
                                j++;
                            else
                                mergedSuggestions.push(otherSuggestions[i]);
                        this._parseSuggestionData(mergedSuggestions)
                    }, _parseSuggestionData: function _parseSuggestionData(suggestions) {
                        if (!this.inputValue)
                            return;
                        if (suggestions && suggestions.length) {
                            suggestions[0].name = suggestions[0].name.trim();
                            var value = this.inputValue;
                            var rtl = MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft;
                            var stringDirection;
                            if (rtl)
                                stringDirection = this._hardCheckStringDirection(value);
                            if (suggestions[0].name === value.toLowerCase() && (!this.isSmartDJ || suggestions[0].isSmartDJ)) {
                                this.valueMatches = true;
                                this._setButtonState(this.isSmartDJ, true);
                                this.autoComplete = String.empty
                            }
                            else if (!rtl && !(MS.Entertainment.Utilities.needsNormalizedBaseline(value) && !MS.Entertainment.Utilities.needsNormalizedBaseline(suggestions[0].name)) && value.length <= MS.Entertainment.UI.Controls.SelectArtistFlyout.MAX_AUTOSUGGEST_LENGTH && this._startsWith(suggestions[0].name, value) && (!this.isSmartDJ || suggestions[0].isSmartDJ)) {
                                this.autoComplete = value + suggestions[0].name.substr(value.length);
                                this._setButtonState(this.isSmartDJ, true)
                            }
                            else {
                                this.autoComplete = String.empty;
                                this.valueMatches = false;
                                this._setButtonState(this.isSmartDJ, false)
                            }
                            var suggestedList = [];
                            for (var i = 0; i < suggestions.length; i++) {
                                suggestions[i].name = suggestions[i].name.trim();
                                var prefix = String.empty;
                                var suffix = String.empty;
                                var rtlPrefix = String.empty;
                                if (this._startsWith(suggestions[i].name, value) && (!rtl || stringDirection))
                                    if (rtl)
                                        if (stringDirection === MS.Entertainment.Utilities.TextDirections.RightToLeft) {
                                            prefix = this._addNonBreakingSpaces(value);
                                            suffix = this._addNonBreakingSpaces(suggestions[i].name.substr(value.length))
                                        }
                                        else {
                                            rtlPrefix = this._addNonBreakingSpaces(value);
                                            suffix = this._addNonBreakingSpaces(suggestions[i].name.substr(value.length))
                                        }
                                    else {
                                        prefix = this._addNonBreakingSpaces(value);
                                        suffix = this._addNonBreakingSpaces(suggestions[i].name.substr(value.length))
                                    }
                                else
                                    suffix = suggestions[i].name;
                                if (MS.Entertainment.Utilities.needsNormalizedBaseline(prefix))
                                    prefix = String.ltrm + prefix;
                                if (MS.Entertainment.Utilities.needsNormalizedBaseline(suffix))
                                    suffix = String.ltrm + suffix;
                                suggestedList.push({
                                    keyword: suggestions[i].name, prefix: prefix, suffix: suffix, rtlPrefix: rtlPrefix, isSmartDJ: suggestions[i].isSmartDJ
                                })
                            }
                            MS.Entertainment.Utilities.hideElement(this._errorText);
                            this._setDataSource(suggestedList)
                        }
                        else {
                            this.valueMatches = false;
                            this.autoComplete = String.empty;
                            this._showFailedSuggestedArtistError()
                        }
                    }, setOverlay: function setOverlay(dialog) {
                        this._dialog = dialog;
                        dialog.setAccessibilityTitle(String.load(this.isSmartDJ ? String.id.IDS_SMARTDJ_CREATE_ACTION : String.id.IDS_MUSIC_ENGAGE_PLAY_ARTIST_ACTION));
                        WinJS.Utilities.addClass(dialog.domElement, "selectArtistOverlayAnchor")
                    }, _startsWith: function _startsWith(checkString, prefix) {
                        return checkString.substr(0, prefix.length) === prefix.toLowerCase()
                    }, _hardCheckStringDirection: function _hardCheckStringDirection(checkString) {
                        var char;
                        var characterDirection;
                        var length = checkString.length;
                        for (var i = 0; i < length; i++) {
                            char = checkString.charCodeAt(i);
                            var newCharacterDirection = MS.Entertainment.Utilities.detectCharacterDirection(char);
                            if (newCharacterDirection)
                                if (characterDirection) {
                                    if (characterDirection !== newCharacterDirection)
                                        return null
                                }
                                else
                                    characterDirection = newCharacterDirection
                        }
                        return characterDirection
                    }, _addNonBreakingSpaces: function _addNonBreakingSpaces(value) {
                        return value.replace(/^ | $/g, String.nbsp)
                    }
            }, {}, {MAX_AUTOSUGGEST_LENGTH: 16})
    })
})()
})();
/* >>>>>>/controls/music1/radiopageview.js:559 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var RadioPageView = (function(_super) {
                        __extends(RadioPageView, _super);
                        function RadioPageView(element, options) {
                            _super.call(this, element, options);
                            UI.Framework.processDeclarativeControlContainer(this)
                        }
                        RadioPageView.prototype.onTryForFreeClick = function() {
                            var signupAction = Entertainment.ServiceLocator.getService(Entertainment.Services.actions).getAction(UI.Actions.ActionIdentifiers.subscriptionWithSignIn);
                            signupAction.automationId = UI.AutomationIds.showSubscriptionSignUpFromRadioPage;
                            signupAction.execute()
                        };
                        return RadioPageView
                    })(Controls.PageViewBase);
                Controls.RadioPageView = RadioPageView
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.RadioPageView)
})();
