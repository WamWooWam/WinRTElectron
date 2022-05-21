
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(People, "ContactPanel", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        Plat = Microsoft.WindowsLive.Platform;
        InstruIds = Microsoft.WindowsLive.Instrumentation.Ids;

    var ContactPanel = P.ContactPanel = /*@constructor*/function (host, /*@dynamic*/person, fields) {
        ///<summary>The Contact panel contains an IC and a series of commands</summary>
        ///<param name="host" type="P.PanelView"/>
        ///<param name="person">Person, TemporaryPerson or MeContact</param>
        ///<param name="fields">Additional context data</param>
        this._host = host;
        this._jobSet = host.getJobSet().createChild();
        this._objectType = person.objectType;
        this._fields = fields;
        this._isUpdateQueued = false;
        this._isReady = false;

        var identityControlOptions = { interactive: false };
        if ((this._objectType === "MeContact") || person.isInAddressBook) {
            identityControlOptions = {
                interactive: true,
                onClick: this._onIdentityControlClick.bind(this)
            }
        }
        this._identityControl = new P.IdentityControl(person, this._jobSet, identityControlOptions);

        if ((this._objectType === "Person") || (this._objectType === "SearchPerson")) {
            this._buttons = [{
                id: "emailCommand",
                title: Jx.res.getString("/landingPage/email"),
                icon: "\uE135",  // Envelope
                update: updateEmailButton,
                key: "email"
            }, {
                id: "callCommand",
                title: "", // Title is provided by individual values, customized as 'Call mobile','Call home'
                icon: "\uE13A", // Telephone
                update: updateCallButton,
                key: "call"
            }, {
                id: "chatCommand",
                title: Jx.res.getString("/landingPage/chat"),
                icon: "\uE15F",  // Smiley-face speech balloon
                update: updateChatButton,
                key: "chat"
            }, {
                id: "videoCallCommand",
                title: Jx.res.getString("/landingPage/videoCall"),
                icon: "\uE13B",  // Camera speech balloon
                update: updateVideoCallButton,
                key: "videoCall"
            }, {
                id: "mapCommand",
                title: Jx.res.getString("/landingPage/map"),
                icon: "\uE139",  // Map pin
                update: updateMapButton,
                key: "location"
            }, {
                id: "allInfoCommand",
                title: Jx.res.getString("/landingPage/profile"),
                icon: "\uE136",  // Silhouette next to horizontal lines
                update: updateAllInfoButton,
                key: null
            }];

            this._binder = new P.PlatformObjectBinder(person);
            this._person = /*@static_cast(P.PersonAccessor)*/this._binder.createAccessor(this._queueUpdate.bind(this));
        } else if (this._objectType === "MeContact") {
            this._buttons = [{
                id: "allInfoCommand",
                title: Jx.res.getString("/landingPage/profile"),
                icon: "\uE136",  // Silhouette next to horizontal lines
                update: this._updateMeInfoButton.bind(this),
                key: null
            }];
            this._binder = new P.PlatformObjectBinder(person);
            this._person = /*@static_cast(P.PersonAccessor)*/this._binder.createAccessor(this._queueUpdate.bind(this));
            this._accountCollection = /*@static_cast(Plat.Collection)*/null;
            this._collectionChangeListener = this._accountCollectionChanged.bind(this);
        } else if (this._objectType === "SearchPerson") {
            this._binder = new P.PlatformObjectBinder(person);
            this._person = /*@static_cast(P.PersonAccessor)*/this._binder.createAccessor(this._queueUpdate.bind(this));
        }

        if (this._buttons) {
            this._settingsContainer = person.objectId ? Jx.appData.localSettings().container("People").container("LandingPageMRU").container(person.objectId) : null;
            this._buttons.forEach(/*@bind(ContactPanel)*/function (/*@type(ContactPanelButtonDefinition)*/buttonDefinition) {
                buttonDefinition.button = new P.DisambiguatedCommandButton(
                    buttonDefinition.id,
                    buttonDefinition.title,
                    buttonDefinition.icon,
                    this._settingsContainer,
                    buttonDefinition.key,
                    this._jobSet
                );
            }, this);

            this._update();
        }

        this._augmentPerson();

        this._commitContact = /*static_cast(P.CommitContact)*/null;
    };
    ///<enable>JS2076.IdentifierIsMiscased</enable>

    ContactPanel.prototype.className = "panelView-inactivePanel profileLanding-contactPanel"; // No hover effect
    ContactPanel.prototype.position = P.PanelView.PanelPosition.contactPanel;
    ContactPanel.prototype._keyboardNavigation = null;
    ContactPanel.prototype._augmentAction = null;

    ContactPanel.prototype.getUI = function () {
        ///<summary>Returns HTML for this panel</summary>

        this._substituteImage = null;
        if (this._fields && this._fields.extendedData && this._fields.extendedData.url) {
            this._substituteImage = this._fields.extendedData.url;
        }

        var secondaryContent = null;
        if (this._objectType !== "MeContact") {
            secondaryContent = {
                element: People.IdentityElements.Networks,
                className: "profileLanding-networks",
                priority: P.Priority.synchronous
            }
        }

        var ic = this._identityControl.getUI(People.IdentityElements.TileLayout, {
            className: "contactPanel-ic",
            primaryContent: null,
            secondaryContent: secondaryContent,
            defaultImage: this._substituteImage,
            useInnerHighlight: true,
            snap: true,
            portrait: true
        });

        var contactActions = "";
        if (this._objectType !== "MeContact" && this._person.isInAddressBook) {
            var numberOfLinkedContacts = this._person.linkedContacts.filter(function (/*@type(P.ContactAccessor)*/contact) { return !contact.isGal; }).length;

            var linkCommandImageHtml = "&#xE167;";
            var linkCommandButtonClass = "contactActions-button";
            if (numberOfLinkedContacts >= 2) {
                text = numberOfLinkedContacts > 99 ? Jx.escapeHtml(Jx.res.getString("/landingPage/linkButtonCount-99plus")) : Jx.escapeHtml(String(numberOfLinkedContacts));
                linkCommandImageHtml = "<div class='commandimage-uppernumber'>" + text + "</div><div class='commandimage-lower'>&#xE167;</div>";
                linkCommandButtonClass += " show-number-on-commandimage";
            }

            var favoriteContent = Jx.escapeHtml(Jx.res.getString("/landingPage/profileCanvasButtonFavorite"));
            var linkContent = Jx.escapeHtml(Jx.res.getString("/landingPage/profileCanvasButtonLink"));
            contactActions = "<div class='profileLanding-contactActions'>" +
                                 "<div class='profileLanding-contactActionContainer'>" +
                                     "<div id='favoriteButton' tabindex='0' class='contactActions-button' role='button' aria-label='" + favoriteContent + "'>" +
                                         "<span class='win-commandicon win-commandring'>" +
                                             "<span class='win-commandimage'>&#xE113;</span>" +
                                         "</span>" +
                                         "<span class='contactActions-text'>" + favoriteContent + "</span>" +
                                         "<div class='contactActions-tooltip' title='" + favoriteContent + "'></div>" +
                                     "</div>" +
                                     "<div id='linkContactsButton' tabindex='0' class='" + linkCommandButtonClass + "' role='button' aria-label='" + linkContent + "'>" +
                                         "<span class='win-commandicon win-commandring'>" +
                                             "<span class='win-commandimage'>" + linkCommandImageHtml + "</span>" +
                                         "</span>" +
                                         "<span class='contactActions-text'>" + linkContent + "</span>" +
                                         "<div class='contactActions-tooltip' title='" + linkContent + "'></div>" +
                                     "</div>" +
                                 "</div>" +
                             "</div>";
        }

        var html = "<div class='profileLanding-panelContent'>" +
                       "<div class='profileLanding-panelContent-left'>" +
                           "<div class='profileLanding-panelContent-left-background'></div>" +
                           "<div class='profileLanding-identityControl'>" + ic + "</div>" +
                           "<div class='profileLanding-GAL'></div>" +
                           contactActions +
                       "</div>";

        if (this._buttons) {
            var moreInfoLink = "";
            if ((this._objectType === "MeContact") || this._person.isInAddressBook) {
                var chevron = Jx.isRtl() ? "\uE096" : "\uE097";
                var moreInfoContent = Jx.escapeHtml(Jx.res.getString("/landingPage/contactSectionMoreInfoLink"));
                moreInfoLink = "<div id='moreInfoButton' class='moreInfo-link' tabindex='0' role='button' aria-label='" + moreInfoContent + "'>" +
                                   "<a class='moreInfo-link-text'>" + moreInfoContent + "</a>" +
                                   "<a class='moreInfo-link-chevron'>" + chevron + "</a>" +
                               "</div>";
            }
            html += "<div class='profileLanding-panelContent-right'>" +
                        "<div class='profileLanding-panelContent-right-background'></div>" +
                        "<div class='profileLanding-contact' role='group' aria-label='" + Jx.escapeHtml(Jx.res.loadCompoundString("/landingPage/communicationVerbs", this._person.calculatedUIName)) + "'>" +
                            this._buttons.map(function (/*@type(ContactPanelButtonDefinition)*/buttonDefinition) {
                                var button = /*@static_cast(P.DisambiguatedCommandButton)*/buttonDefinition.button;
                                return button.getUI();
                            }).join("") +
                        "</div>" +
                        moreInfoLink +
                    "</div>";
        }
        html += "</div>";

        return html;
    };

    ContactPanel.prototype.activateUI = function (element) {
        ///<summary>Hooks events, fills in dynamic content for this panel</summary>
        ///<param name="element" type="HTMLElement"/>
        this._identityControl.activateUI(element);

        if (this._buttons) {
            this._buttons.forEach(function (/*@type(ContactPanelButtonDefinition)*/buttonDefinition) {
                var button = /*@static_cast(P.DisambiguatedCommandButton)*/buttonDefinition.button;
                button.activateUI(element);
            });

            // Setup Up & Down keyboard navigation for buttons
            var buttonsContainer = element.querySelector(".profileLanding-contact");
            Debug.assert(buttonsContainer);
            this._keyboardNavigation = new Jx.KeyboardNavigation(buttonsContainer, "vertical");
        }

        // If the header is actionable, attach event listeners.
        var moreInfoLink = element.querySelector(".moreInfo-link");
        if (moreInfoLink) {
            this._moreInfoClicker = new Jx.Clicker(moreInfoLink, this._onMoreInfoClick, this);
            P.Animation.addPressStyling(moreInfoLink);
        }

        // Add click handlers for on-canvas contact action buttons
        var favoriteButton = element.querySelector("#favoriteButton");
        if (favoriteButton) {
            this._favoriteButton = favoriteButton;
            this._favoriteButton.addEventListener("click", this._onFavoriteClick = this._onFavoriteCommand.bind(this), false);
            this._favoriteButton.addEventListener("keypress", this._onFavoriteKeypress = this._onFavoriteCommand.bind(this), false);
            if (this._person.isFavorite) {
                WinJS.Utilities.addClass(this._favoriteButton, "contactActions-checkedButton");
            }
        }
        var linkContactsButton = element.querySelector('#linkContactsButton');
        if (linkContactsButton) {
            this._linkContactsButton = linkContactsButton;
            this._linkContactsButton.addEventListener("click", this._onLinkClick = this._onLinkCommand.bind(this), false);
            this._linkContactsButton.addEventListener("keypress", this._onLinkKeypress = this._onLinkCommand.bind(this), false);
        }
        
        this._galContainer = element.querySelector(".profileLanding-GAL");
        this._galContainer.style.display = "none"; // default state is hidden
        this._showGALInfo();

        this._addFrameCommands();
    };

    ContactPanel.prototype._onMoreInfoClick = function () {
        P.Nav.navigate(P.Nav.getProfileDetailUri(this._person.objectId));
    };

    ContactPanel.prototype.ready = function () {
        ///<summary>Performs any heavy post-startup work for the panel</summary>

        this._isReady = true;
        this._applyQueuedUpdates(); // Updates are deferred if they arrive before ready.

        if (this._objectType === "Person") {
            if (this._person.isInAddressBook) {
                P.ContactCommands.addCommands(this._host, this._binder);
            }
        } else if (this._objectType === "MeContact") {
            P.MeCommands.addCommands(this._host);
        }

        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        if (this._objectType === "MeContact") {
            Jx.bici.addToStream(InstruIds.People.socialPageViewed, "", P.Bici.mePage);
        } else if (this._objectType === "Person") {
            Jx.bici.addToStream(InstruIds.People.socialPageViewed, "", P.Bici.landingPage);
        }
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

        if (this._objectType === "Person" && this._person.isInAddressBook) {
            this._jobSet.addUIJob(this, /*@bind(ContactPanel)*/function () {
                P.ContactLinkingControl.prepareSuggestions(this._person.getPlatformObject());
            }, null, P.Priority.suggestions);
        }
    };

    ContactPanel.prototype._addFrameCommands = function () {
        if (!this._person.isInAddressBook) {
            var contact = /*@static_cast(P.ContactAccessor)*/this._person.linkedContacts[0];
            if (/*@static_cast(Boolean)*/contact && !contact.thirdPartyObjectId) { // Can't save 3rd party contacts
                this._host.getFrameCommands().addCommand(new P.Command("cmdid_landingPage_save", null, "/landingPage/saveButtonTitle", "\uE105", true, true, this, this._showSaveFlyout));
            }
        }
    };

    ContactPanel.prototype._onIdentityControlClick = function (person, element, ev) {
        if (this._objectType === "MeContact") {
            P.Nav.navigate(P.Nav.getEditMePictureUri());
        } else {
            var commands = [];
            if (person.canClearPersonTile) {
                commands.push(new WinJS.UI.MenuCommand(null, {
                    label: Jx.res.getString("/landingPage/changeTileMenuOption"),
                    onclick: this._onChangeTile.bind(this)
                }));
                commands.push(new WinJS.UI.MenuCommand(null, {
                    label: Jx.res.getString("/landingPage/removeTileMenuOption"),
                    onclick: this._onClearTile.bind(this)
                }));
            } else {
                var tileUri = person.getUserTile(Microsoft.WindowsLive.Platform.UserTileSize.original, true).appdataURI;
                var label = tileUri ? Jx.res.getString("/landingPage/changeTileMenuOption") : Jx.res.getString("/landingPage/setTileMenuOption");
                commands.push(new WinJS.UI.MenuCommand(null, {
                    label: label,
                    onclick: this._onChangeTile.bind(this)
                }));
            }

            var flyout = new WinJS.UI.Menu(null, { commands: commands });
            Jx.addClass(flyout.element, "profileLanding-identityControl-flyout");
            document.body.appendChild(flyout.element);
            flyout.addEventListener("afterhide", function () {
                document.body.removeChild(flyout.element);
            }, false);
            var anchor = element.querySelector(".ic-tileContainer")
            flyout.show(anchor, "bottom", Jx.isRtl ? "left" : "right");
        }
    }

    ContactPanel.prototype._onClearTile = function () {
        if (this._person.canClearPersonTile) {
            this._person.clearPersonTile();
        }
    }

    var ENCODER_IDS = { };
    ENCODER_IDS[Windows.Graphics.Imaging.BitmapDecoder.gifDecoderId] = Windows.Graphics.Imaging.BitmapEncoder.gifEncoderId;
    ENCODER_IDS[Windows.Graphics.Imaging.BitmapDecoder.pngDecoderId] = Windows.Graphics.Imaging.BitmapEncoder.pngEncoderId;
    ENCODER_IDS[Windows.Graphics.Imaging.BitmapDecoder.jpegDecoderId] = Windows.Graphics.Imaging.BitmapEncoder.jpegEncoderId;
    var DEFAULT_ENCODER_ID = Windows.Graphics.Imaging.BitmapEncoder.jpegEncoderId;

    ContactPanel.prototype._onChangeTile = function () {
        var picker = new Windows.Storage.Pickers.FileOpenPicker();
        picker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        picker.fileTypeFilter.replaceAll([".jpg", ".bmp", ".gif", ".png", ".jpeg"]);
        var that = this;
        var webReady = new Windows.Storage.Streams.InMemoryRandomAccessStream();
        picker.pickSingleFileAsync().then(function (file) {
            if (file) {
                file.openReadAsync().then(function (stream) {
                    Windows.Graphics.Imaging.BitmapDecoder.createAsync(stream).then(function (bitmapDecoder) {
                        return bitmapDecoder.getPixelDataAsync(
                            bitmapDecoder.bitmapPixelFormat,
                            bitmapDecoder.bitmapAlphaMode,
                            new Windows.Graphics.Imaging.BitmapTransform(),
                            Windows.Graphics.Imaging.ExifOrientationMode.respectExifOrientation,
                            Windows.Graphics.Imaging.ColorManagementMode.colorManageToSRgb
                        ).then(function (pixelDataProvider) {
                            var encoderId = ENCODER_IDS[bitmapDecoder.decoderInformation.codecId];
                            if (!encoderId) {
                                encoderId = DEFAULT_ENCODER_ID;
                            }

                            return Windows.Graphics.Imaging.BitmapEncoder.createAsync(encoderId, webReady).then(function (encoder) {
                                encoder.setPixelData(
                                    bitmapDecoder.bitmapPixelFormat,
                                    bitmapDecoder.bitmapAlphaMode,
                                    bitmapDecoder.orientedPixelWidth,
                                    bitmapDecoder.orientedPixelHeight,
                                    bitmapDecoder.dpiX,
                                    bitmapDecoder.dpiY,
                                    pixelDataProvider.detachPixelData());
                                encoder.flushAsync().then(function() {
                                    if (that._person.canClearPersonTile) {
                                        that._person.clearPersonTile();
                                    }
                                    that._person.setPersonTile(webReady);
                                });
                            });
                        });
                    });
                });
            }
        });
    }

    ContactPanel.prototype._showSaveFlyout = function (commandId, button) {
        if (this._commitContact) {
            Jx.log.error("Commit already in progress");
            return;
        }

        var flyout = new WinJS.UI.Menu(null, {
            commands: [
                new WinJS.UI.MenuCommand(null, {
                    label: Jx.res.getString("/landingPage/saveMenuOption"),
                    onclick: this._onSave.bind(this)
                }),
                new WinJS.UI.MenuCommand(null, {
                    label: Jx.res.getString("/landingPage/linkMenuOption"),
                    onclick: this._onLink.bind(this)
                })
            ]
        });
        document.body.appendChild(flyout.element);
        flyout.addEventListener("afterhide", function () { 
            document.body.removeChild(flyout.element);
        }, false);
        flyout.show(button, "bottom", Jx.isRtl ? "left" : "right");
        return flyout;
    };

    ContactPanel.prototype._onSave = function () {
        this._saveContact(null);
    };

    ContactPanel.prototype._onFavoriteCommand = function (ev) {
        if ((ev.type === "click") || ((ev.type === "keypress") && ((ev.keyCode === WinJS.Utilities.Key.enter) || (ev.keyCode === WinJS.Utilities.Key.space)))) {
            if (this._person.isFavorite) {
                this._person.removeFavorite();
            } else {
                this._person.insertFavorite(Microsoft.WindowsLive.Platform.FavoriteInsertPosition.insertLast, null);
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                Jx.bici.addToStream(InstruIds.People.socialReactionUpdated, "", P.Bici.landingPage, 0, P.Bici.ReactionType.favorite);
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            }
            WinJS.Utilities.toggleClass(this._favoriteButton, "contactActions-checkedButton");
            P.AppTile.pushTiles(this._host.getPlatform());
        }
    }

    ContactPanel.prototype._onLinkCommand = function (ev) {
        if ((ev.type === "click") || ((ev.type === "keypress") && ((ev.keyCode === WinJS.Utilities.Key.enter) || (ev.keyCode === WinJS.Utilities.Key.space)))) {
            P.Nav.navigate(P.Nav.getLinkPersonUri(this._person.objectId));
        }
    }

    ContactPanel.prototype._onLink = function () {
        this._host.getLayout().unsnap(/*@bind(ContactPanel)*/function () {
            var picker = new Windows.ApplicationModel.Contacts.ContactPicker();
            picker.commitButtonText = Jx.res.getString("/landingPage/linkButtonTitle");
            picker.selectionMode = Windows.ApplicationModel.Contacts.ContactSelectionMode.fields;
            picker.desiredFieldsWithContactFieldType.append(Windows.ApplicationModel.Contacts.ContactFieldType.custom);
            picker.pickContactAsync().done(this._onPeoplePickerComplete.bind(this), Jx.fnEmpty);
        }, this);
    };

    ContactPanel.prototype._onPeoplePickerComplete = function (pickerContact) {
        /// <param name="pickerContact" type="Windows.ApplicationModel.Contacts.ContactInformation" />
        if (pickerContact) {
            var person = this._host.getPlatform().peopleManager.loadPerson(pickerContact.id);
            if (person) {
                this._saveContact(person);
            }
        }
    };

    ContactPanel.prototype._saveContact = function (linkToPerson) {
        /// <param name="linkToPerson" type="Microsoft.WindowsLive.Platform.IPerson" optional="true"/>
        var platform = this._host.getPlatform();

        var isAugmented = this._fields.extendedData && !Jx.isNullOrUndefined(this._fields.extendedData.accountId);

        var account = null;
        var accountId = isAugmented ? this._fields.extendedData.accountId : this._fields["accountId"];
        if (Jx.isNonEmptyString(accountId)) {
            try {
                account = platform.accountManager.loadAccount(accountId);
            } catch (ex) {
                Jx.log.exception("Error loading account: " + accountId, ex);
            }

            if (/*@static_cast(Boolean)*/account && !P.CommitContact.canCreateContacts(account)) {
                Jx.log.warning("Specified account " + accountId + " does not support adding contacts, falling back to the default");
                account = null;
            }
        }

        var newContact = this._host.getPlatform().peopleManager.createContact(account);

        if (this._fields.extendedData) {
            // Get the first linked contact from the temporary person that was created when we got here through the Contact Card
            // We know we came from the Contact Card because that's the only way the extendedData can get populated
            var tempContact = this._person.linkedContacts[0];

            // If this is an augmented contact, that is, the contact came from Mail/Calendar (via the Add Contact Action),
            // then we only save the contact's name and email address. This is because such contacts only fall in one of
            // two buckets:
            // 1. The contact is a GAL contact, in which case saving any additional information will result in stale data
            //    since the platform automatically retrieves GAL data
            // 2. The contact doesn't have any other data anyway (based on how Mail/Calendar populate the contact object)
            newContact.firstName = tempContact.firstName;

            if (isAugmented) {
                // In the GAL scenario from Mail/Calendar, either businessEmailAddress OR otherEmailAddress will have the 
                // email address that we need to save. So, we check for both of them here and save whichever one we find
                Debug.assert(Jx.isNonEmptyString(tempContact.businessEmailAddress) || Jx.isNonEmptyString(tempContact.otherEmailAddress))

                if (tempContact.businessEmailAddress) {
                    newContact.businessEmailAddress = tempContact.businessEmailAddress;
                } else if (tempContact.otherEmailAddress) {
                    newContact.otherEmailAddress = tempContact.otherEmailAddress;
                }
            } else {
                newContact.lastName = tempContact.lastName;
                newContact.middleName = tempContact.middleName;
                newContact.title = tempContact.title;
                newContact.suffix = tempContact.suffix;
                newContact.yomiFirstName = tempContact.yomiFirstName;
                newContact.yomiLastName = tempContact.yomiLastName;
                newContact.notes = tempContact.notes;
                newContact.webSite = tempContact.webSite;
                newContact.significantOther = tempContact.significantOther;
                newContact.homePhoneNumber = tempContact.homePhoneNumber;
                newContact.home2PhoneNumber = tempContact.home2PhoneNumber;
                newContact.mobilePhoneNumber = tempContact.mobilePhoneNumber;
                newContact.mobile2PhoneNumber = tempContact.mobile2PhoneNumber;
                newContact.businessPhoneNumber = tempContact.businessPhoneNumber;
                newContact.business2PhoneNumber = tempContact.business2PhoneNumber;
                newContact.personalEmailAddress = tempContact.personalEmailAddress;
                newContact.businessEmailAddress = tempContact.businessEmailAddress;
                newContact.otherEmailAddress = tempContact.otherEmailAddress;
                newContact.companyName = tempContact.companyName;
                newContact.yomiCompanyName = tempContact.yomiCompanyName;
                newContact.officeLocation = tempContact.officeLocation;
                newContact.jobTitle = tempContact.jobTitle;
                newContact.homeLocation = tempContact.homeLocation;
                newContact.businessLocation = tempContact.businessLocation;
                newContact.otherLocation = tempContact.otherLocation;
            }
        } else {
            // Save the name.
            newContact.firstName = this._person.firstName;
            newContact.lastName = this._person.lastName;

            // Save the email address.  If there's a GAL contact, switch the type from home to work.
            var galContact = /*@static_cast(P.ContactAccessor)*/this._person.linkedContacts[1];
            if (galContact) {
                newContact.businessEmailAddress = this._person.mostRelevantEmail;
                newContact.businessPhoneNumber = galContact.businessPhoneNumber;
                newContact.mobilePhoneNumber = galContact.mobilePhoneNumber;
            } else {
                newContact.personalEmailAddress = this._person.mostRelevantEmail;
            }
        }

        this._commitContact = new P.CommitContact(newContact, linkToPerson, /*@bind(ContactPanel)*/function (/*@type(Microsoft.WindowsLive.Platform.IPerson)*/person) {
            if (/*@static_cast(Boolean)*/person && /*@static_cast(Boolean)*/galContact) {
                var searchPerson = /*@static_cast(Microsoft.WindowsLive.Platform.SearchPerson)*/galContact.getPlatformObject();
                searchPerson.savePermanently(person);
            }

            if (this._substituteImage && person && (!isAugmented || Jx.isNullOrUndefined(this._fields.extendedData))) {
                var that = this;
                WinJS.xhr({ url: this._substituteImage, responseType: "blob" }).then(function (request) {
                    var blob = request.response;
                    person.setPersonTile(blob.msDetachStream());
                    that._host.back(P.Nav.getViewPersonUri(person.objectId))
                }, function () {
                    that._host.back(P.Nav.getViewPersonUri(person.objectId))
                })
            } else {
                this._host.back(person ? P.Nav.getViewPersonUri(person.objectId) : null);
            }
        }, this);
    };

    ContactPanel.prototype.suspend = function (hydrationData) { };

    ContactPanel.prototype.deactivateUI = function () {
        ///<summary>Called when the panel is being removed from the document</summary>
        this._disposeAccountCollection();
        this._disposeAugmentAction();

        if (this._identityControl) {
            this._identityControl.shutdownUI();
            this._identityControl = null;
        }

        if (this._favoriteButton) {
            if (this._onFavoriteClick) {
                this._favoriteButton.removeEventListener("click", this._onFavoriteClick, false);
                this._favoriteButton.removeEventListener("keypress", this._onFavoriteKeypress, false);
                this._onFavoriteClick = null;
            }
            this._favoriteButton = null;
        }

        if (this._linkContactsButton) {
            if (this._onLinkClick) {
                this._linkContactsButton.removeEventListener("click", this._onLinkClick, false);
                this._linkContactsButton.removeEventListener("keypress", this._onLinkKeypress, false);
                this._onLinkClick = null;
            }
            this._linkContactsButton = null;
        }

        Jx.dispose(this._binder);
        Jx.dispose(this._jobSet);
        Jx.dispose(this._keyboardNavigation);
        Jx.dispose(this._moreInfoClicker);
        Jx.dispose(this._commitContact);

        this._binder = null;
        this._jobSet = null;
        this._keyboardNavigation = null;
        this._moreInfoClicker = null;
        this._commitContact = null;
    };

    ContactPanel.prototype._queueUpdate = function () {
        if (!this._isUpdateQueued) {
            this._isUpdateQueued = true;
            this._jobSet.addUIJob(this, this._applyQueuedUpdates, null, P.Priority.propertyUpdate);
        }
    };
    
    ContactPanel.prototype._applyQueuedUpdates = function () {
        if (this._isUpdateQueued && this._isReady) {
            this._isUpdateQueued = false;

            this._update();
            this._updateGALInfoAnimated();

            // Augment person again in case a property(email address or linked contact) that affects the GAL retrieval is updated
            this._augmentPerson();
        }
    };

    ContactPanel.prototype._update = function () {
        this._buttons.forEach(/*@bind(ContactPanel)*/function (/*@type(ContactPanelButtonDefinition)*/buttonDefinition) {
            buttonDefinition.update(buttonDefinition.button, this._person);
        }, this);

        if (this._keyboardNavigation) {
            this._keyboardNavigation.update();
        } 
    };
    
    ContactPanel.prototype._isGALEnabled = function () {
        ///<summary>Returns whether GAL is enabled</summary>
        ///<returns type="Boolean"/>
        // Platform doesn't suppport GAL for Me contact. This is by design.
        return (this._objectType !== "MeContact");
    };

    ContactPanel.prototype._augmentPerson = function () {
        ///<summary>Call platform API to augment person with GAL contact</summary>
        this._disposeAugmentAction();
 
        if (this._isGALEnabled()) {
            try {
                Jx.log.info("Calling augmentViaServerAsync on person: " + this._person.objectId);
                Jx.mark("People.ContactPanel._augmentPerson,StartTM,People,ContactPanel");
                this._augmentAction = this._person.augmentViaServerAsync(false).done(function () {
                    Jx.mark("People.ContactPanel._augmentPerson,StopTM,People,ContactPanel");
                }, Jx.fnEmpty);
            } catch (err) {
                Jx.log.exception("Error calling augmentViaServerAsync on person: " + this._person.objectId, err);
            }
        }
    };

    ContactPanel.prototype._disposeAugmentAction = function () {
        var augmentAction = this._augmentAction;
        if (augmentAction) {
            augmentAction.cancel();
            this._augmentAction = null;
        }
    };

    ContactPanel.prototype._showGALInfo = function () {
        ///<summary>Show GAL section without animation. This is for initial rendering if GAL data is available upfront.</summary>
        this._updateGALInfo(false);
    };
    
    ContactPanel.prototype._updateGALInfoAnimated = function () {
        ///<summary>Update GAL section with animation. This is for inserting/deleting the GAL data after page is rendered.</summary>
        this._updateGALInfo(true);
    };

    ContactPanel.prototype._updateGALInfo = function (needAnimation) {
        ///<summary>Update GAL section using the job info in the linked contacts. The linked contacts are already in priority order</summary>
        ///<param name="needAnimation" type="Boolean"/>
        if (this._isGALEnabled()) {
            if (this._person.linkedContacts) {
                var galContainer = this._galContainer;
                var galContact = this._person.linkedContacts.filter(function (/*@type(P.ContactAccessor)*/contact) {
                    return Jx.isNonEmptyString(contact.jobTitle) || Jx.isNonEmptyString(contact.companyName) || Jx.isNonEmptyString(contact.officeLocation);
                })[0];
                var html = "";
                // Update GAL section.
                if (galContact) {
                    // Show GAL section
                    var primaryFieldUsed = false;

                    var createGalField = function (key) {
                        if (Jx.isNonEmptyString(galContact[key])) {
                            var fieldClass = "gal-secondaryField";
                            if (!primaryFieldUsed) {
                                primaryFieldUsed = true;
                                fieldClass = "gal-primaryField";
                            }
                            var text = Jx.escapeHtml(galContact[key]);
                            return "<div class='" + fieldClass + "' title='" + text + "'>" + text + "</div>";
                        }
                        return "";
                    }
                    
                    html += createGalField("jobTitle");
                    html += createGalField("companyName");
                    html += createGalField("officeLocation");
                }
                
                var affectedNodes = [];
                if (needAnimation && this._host.getLayout().getLayoutState() === P.Layout.layoutState.snapped) {
                    // In snap, animations to the GAL data will move other panels.
                    affectedNodes = this._host.getPanelElements();
                }

                if (Jx.isNonEmptyString(html)) {                    
                    // Run add to list animation if the section is previously hidden
                    if (galContainer.style.display === "none" && needAnimation) {
                        var addToListAnimation = WinJS.UI.Animation.createAddToListAnimation(galContainer, affectedNodes);
                        galContainer.innerHTML = html;
                        galContainer.style.display = "";
                        addToListAnimation.execute();
                    } else {
                        galContainer.innerHTML = html;
                        galContainer.style.display = "";
                    }
                } else {
                    // Hide GAL section
                    // Run delete from list animation if the section was previously showing. If the section wasn't previously showing, nothing needs to be done.
                    if (galContainer.style.display !== "none" && needAnimation) {
                        var delteFromListAnimation = WinJS.UI.Animation.createDeleteFromListAnimation(galContainer, affectedNodes);
                        galContainer.style.display = "none";
                        galContainer.innerHTML = "";
                        delteFromListAnimation.execute();                  
                    } 
                }
            }
        }
    };

    ContactPanel.prototype._disposeAccountCollection = function () {
        ///<summary>Dispose the account collection for Me profile button</summary>
        if (this._accountCollection) {
            this._accountCollection.removeEventListener("collectionchanged", this._collectionChangeListener);
            this._accountCollection.dispose();
            this._accountCollection = null;
        }
    };
    
    ContactPanel.prototype._updateMeInfoButton = function (control) {
        ///<summary>Updates the view profile button for Me</summary>
        ///<param name="control" type="P.DisambiguatedCommandButton"/>
        if (!this._accountCollection) {
            ///<disable>JS3057.AvoidImplicitTypeCoercion</disable>
            this._accountCollection = /*static_cast(Plat.Collection)*/
                this._host.getPlatform().accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.people, Plat.ConnectedFilter.normal, Plat.AccountSort.rank);
            ///<enable>JS3057.AvoidImplicitTypeCoercion</enable>
            Debug.assert(this._accountCollection);
            this._accountCollection.addEventListener("collectionchanged", this._collectionChangeListener);
        } else {
            this._accountCollection.lock();
        }

        // This is really this._buttons[0].button.
        this._meInfoButton = control;
        updateMeInfoButton(control, this._accountCollection);
        this._accountCollection.unlock();
    };

    ContactPanel.prototype._accountCollectionChanged = function () {
        ///<summary>Account colletion event handler</summary>
        Debug.assert(this._accountCollection);
        Debug.assert(this._meInfoButton);
        this._accountCollection.lock();
        updateMeInfoButton(this._meInfoButton, this._accountCollection);
        this._accountCollection.unlock();
    };

    function updateMeInfoButton(control, accounts) {
        ///<summary>Updates the view profile button for Me</summary>
        ///<param name="control" type="P.DisambiguatedCommandButton"/>
        ///<param name="accounts" type="Plat.Collection"/>
        Debug.assert(accounts);
        var values = [];
        var count = accounts.count;
        for (var i = 0; i < count; i++) {
            var item = /*@static_cast(Plat.Account)*/accounts.item(i);
            if (!item.isDefault) {

                // Attempt to get the profileVerb Url from the account's MeContact
                var profileUrl = "";
                var meContact = item.meContact;

                if (Jx.isObject(meContact)) {
                    if (item.sourceId === "FB") {
                        values.push({
                            display: item.displayName,
                            data: People.Protocol.createFromContact("profile", /*@static_cast(Plat.Contact)*/meContact).toUrl(),
                            bici: P.Bici.ReactionType.profile
                        });
                    } else {
                        profileUrl = getProfileVerb(meContact);

                        if (Jx.isNonEmptyString(profileUrl)) {
                            values.push({
                                display: item.displayName,
                                data: profileUrl,
                                bici: P.Bici.ReactionType.webProfile
                            });
                        }
                    }
                }
            }
        }

        control.updateValues(null, values);
    };

    function updateEmailButton(control, person) {
        ///<summary>Updates the possible values for the email button</summary>
        ///<param name="control" type="P.DisambiguatedCommandButton"/>
        ///<param name="person" type="P.PersonAccessor"/>
        var fields = P.Contact.createUniqueFields(person.linkedContacts, "email");
        control.updateValues(
            makeEmailValue(person.mostRelevantEmail),
            fields.map(function (/*@type(_ContactUniqueField)*/field) { return makeEmailValue(field.fieldValue); })
        );
    }
    function makeEmailValue(email) {
        ///<param name="email" type="String"/>
        ///<returns type="DisambiguatedCommandValue"/>
        var value = null;
        if (Jx.isNonEmptyString(email)) {
            value = {
                display: email,
                data: People.Protocol.create("mailto", { email: email }).toUrl(),
                bici: P.Bici.ReactionType.mail
            };
        }
        return value;
    }

    var imTypeRanks = [ 
        Plat.ContactIMType.skype,
        Plat.ContactIMType.windowsLive,
        Plat.ContactIMType.office,
        Plat.ContactIMType.yahoo,
        Plat.ContactIMType.foreignNetwork
    ];
    function updateChatButton(control, person) {
        ///<summary>Updates the possible values for the chat button</summary>
        ///<param name="control" type="P.DisambiguatedCommandButton"/>
        ///<param name="person" type="P.PersonAccessor"/>
        var chatValues = person.linkedContacts.sort(function (/*@type(P.ContactAccessor)*/contactA, /*@type(P.ContactAccessor)*/contactB) {
            return imTypeRanks.indexOf(contactA.imType) - imTypeRanks.indexOf(contactB.imType);
        }).map(function (/*@type(P.ContactAccessor)*/contact) {
            ///<returns type="DisambiguatedCommandValue"/>
            var imType = contact.imType;
            if (imType === Plat.ContactIMType.skype || imType === Plat.ContactIMType.windowsLive || imType === Plat.ContactIMType.foreignNetwork) {
                var account = /*@static_cast(Plat.Account)*/contact.account;
                if (account) {
                    var display = account.displayName;

                    if (Jx.isNonEmptyString(display)) {
                        // If the imType is foreignNetwork and the source is not Facebook skip the following because we do not support
                        // foreign networks other than Facebook for the message action. We will process everything else.
                        if (((imType === Plat.ContactIMType.foreignNetwork) && (account.sourceId !== "FB")) ? false : true) {                            
                            return {
                                display: display,
                                data: People.Protocol.createFromContact("message", /*@static_cast(Plat.Contact)*/contact).toUrl(),
                                bici: P.Bici.ReactionType.message
                            };
                        }
                    }
                }
            }
            return null;
        });

        var smsValues = P.Contact.createUniqueFields(person.linkedContacts, "mobiletel").map(function (/*@type(_ContactUniqueField)*/field) {
            return {
                // Wrap mobile phone number with Unicode character for Left to Right layout so it doesn't get displayed RTL 
                // in RTL build when the number contains spaces, brackets, etc..
                display: Jx.res.loadCompoundString("/landingPage/sms", "\u202a" + field.fieldValue + "\u202c"),
                data: People.Protocol.create("sms", { phoneNumber: field.fieldValue }).toUrl(),
                bici: P.Bici.ReactionType.sms
            };
        });

        control.updateValues(null, chatValues.concat(smsValues));
    }
    function updateVideoCallButton(control, person) {
        ///<summary>Updates the possible values for the skype call button</summary>
        ///<param name="control" type="P.DisambiguatedCommandButton"/>
        ///<param name="person" type="P.PersonAccessor"/>
        var values = [];
        person.linkedContacts.forEach(function (/*@type(P.ContactAccessor)*/contact) {
            if (contact.imType === Plat.ContactIMType.skype) {
                var account = contact.account;
                if (account) {
                    var accountName = account.displayName;
                    if (Jx.isNonEmptyString(accountName)) {
                        values.push({
                            display: accountName,
                            data: People.Protocol.createFromContact("videocall", /*@static_cast(Plat.Contact)*/contact).toUrl(),
                            bici: P.Bici.ReactionType.videoCall
                        });
                    }
                }
            }
        });
        control.updateValues(null, values);
    }
    function updateCallButton(control, person) {
        ///<summary>Updates the possible values for the call button</summary>
        ///<param name="control" type="P.DisambiguatedCommandButton"/>
        ///<param name="person" type="P.PersonAccessor"/>
        var skypeCommands = [];
        person.linkedContacts.forEach(function (/*@type(P.ContactAccessor)*/contact) {
            if (contact.imType === Plat.ContactIMType.skype) {
                var account = contact.account;
                if (account) {
                    var accountName = account.displayName;
                    if (Jx.isNonEmptyString(accountName)) {
                        skypeCommands.push({
                            display: accountName,
                            data: People.Protocol.createFromContact("audiocall", /*@static_cast(Plat.Contact)*/contact).toUrl(),
                            bici: P.Bici.ReactionType.audioCall,
                            title: Jx.res.getString("/landingPage/call")
                        });
                    }
                }
            }
        });

        var fields = P.Contact.createUniqueFields(person.linkedContacts, "tel");
        var telCommands = fields.map(function (/*@type(_ContactUniqueField)*/field) { return makeCallValue(field.fieldValue, field.fieldName); });

        control.updateValues(
            skypeCommands[0] || makeCallValue(person.mostRelevantPhone),
            skypeCommands.concat(telCommands)
        );
    }

    function makeCallValue(phone, fieldName) {
        ///<param name="phone" type="String"/>
        ///<param name="fieldName" type="String" optional="true"/>
        ///<returns type="DisambiguatedCommandValue"/>
        var value = null;
        if (Jx.isNonEmptyString(phone)) {
            var titleResources = {
                mobilePhoneNumber: "profile_fieldTitle_callMobile",
                mobile2PhoneNumber: "profile_fieldTitle_callMobile",
                homePhoneNumber: "profile_fieldTitle_callHome",
                home2PhoneNumber: "profile_fieldTitle_callHome",
                businessPhoneNumber: "profile_fieldTitle_callWork",
                business2PhoneNumber: "profile_fieldTitle_callWork"
            };
            Debug.assert(!fieldName || titleResources[fieldName]);
            // Wrap phone number with Unicode character for Left to Right layout so it doesn't get displayed RTL 
            // in RTL build when the number contains spaces, brackets, etc..
            var phoneLTR = "\u202a" + phone + "\u202c";
            value = {
                display: fieldName ? phoneLTR + " (" + Jx.res.getString("/strings/profile_fieldTitle_" + fieldName) + ")" : phoneLTR,
                shortDisplay: phoneLTR,
                data: People.Protocol.create("tel", { phoneNumber: phone }).toUrl(),
                title: fieldName ? Jx.res.getString("/strings/" + titleResources[fieldName]) : null,
                bici: P.Bici.ReactionType.call
            };
        }
        return value;
    }

    function updateMapButton(control, person) {
        ///<summary>Updates the possible values for the map button</summary>
        ///<param name="control" type="P.DisambiguatedCommandButton"/>
        ///<param name="person" type="P.PersonAccessor"/>

        var fields = P.Contact.createUniqueFields(person.linkedContacts, "mapLocation");
        var locations = fields.map(function (/*@type(_ContactUniqueField)*/field) {
            return {
                value: field.fieldValue,
                metadata: {
                    type: field.fieldName,
                    contactName: person.calculatedUIName
                }
            };
        });
        var bestLocation = P.Location.getBestLocation(locations);
        control.updateValues(
            bestLocation ? makeMapValue(bestLocation) : null,
            locations.map(function (location) { return makeMapValue(location); })
        );
    }

    function makeMapValue(location) {
        ///<param name="locationValue" type="Plat.Location"/>
        ///<returns type="DisambiguatedCommandValue"/>
        return {
            display: P.Location.chooseBestDisplayField(location.value),
            data: JSON.stringify(location),
            getUrl: function (data) {
                return P.UiFormMapHelper.getMapUrl(JSON.parse(data));
            },
            bici: P.Bici.ReactionType.address
        };
    }

    function updateAllInfoButton(control, person) {
        ///<summary>Updates the view profile button</summary>
        ///<param name="control" type="P.DisambiguatedCommandButton"/>
        ///<param name="person" type="P.PersonAccessor"/>
        
        var values = person.linkedContacts.filter(
                function (/*@type(P.ContactAccessor)*/contact) {
                    // Filter out the default accounts and GAL contact
                    var ret = false;
                    if (!contact.isGal) {
                        var account = contact.account;
                        ret = Jx.isObject(account) && !account.isDefault;
                    }
                    return ret;
                }
            ).map(
                function (/*@type(P.ContactAccessor)*/contact) { return makeProfileValue(contact); }
            ).filter(
                // Filter out account that doesn't have profile url.
                function (/*@type(DisambiguatedCommandValue)*/value) { return Jx.isNonEmptyString(value.data); }
            );

        control.updateValues(null, values);
    }
    function makeProfileValue(contact) {
        ///<summary>Returns the command value for the profile details button</summary>
        ///<param name="contact" type="P.ContactAccessor"/>
        ///<returns type="DisambiguatedCommandValue"/>
        var account = contact.account;
        Debug.assert(Jx.isObject(account));
        if (account) {
            if (account.sourceId === "FB") {
                return {
                    display: account.displayName,
                    data: People.Protocol.createFromContact("profile", /*@static_cast(Plat.Contact)*/contact).toUrl(),
                    bici: P.Bici.ReactionType.profile
                };
            } else {
                return {
                    display: getNetworkDisplayName(account.displayName, account.sourceId, contact.nickname),
                    data: getProfileVerb(contact),
                    bici: P.Bici.ReactionType.webProfile
                };
            }
        }
    }
    function getProfileVerb(/*@dynamic*/contact) {
        ///<summary>Returns the URL for the network profile page</summary>
        ///<param name="contact">Can be a P.ContactAccessor or Plat.MeContact</param>
        ///<returns type="String"/>
        var verbs = /*@static_cast(Microsoft.WindowsLive.Platform.Collection)*/contact.verbs;
        // Exchange contact doesn't have verbs. Platform returns null in that case.
        if (verbs) {
            var count = verbs.count;
            for (var i = 0; i < count; i++) {
                var item = /*@static_cast(Microsoft.WindowsLive.Platform.Verb)*/verbs.item(i);
                if (Number(item.verbType) === Plat.VerbType.profile) {
                    return item.url;
                }
            }
        }
        return "";
    }

    function getNetworkDisplayName(displayName, sourceId, nickname) {
        ///<summary>Returns the text for the network on the profile button. Append Twitter nickname for Twitter.</summary>
        ///<param name="displayName" type="String"/>
        ///<param name="sourceId" type="String"/>
        ///<param name="nickname" type="String"/>
        ///<returns type="String"/>
        if (sourceId === "TWITR" && Jx.isNonEmptyString(nickname)) {
            return displayName + " @" + nickname;
        }
        return displayName;
    }
});
