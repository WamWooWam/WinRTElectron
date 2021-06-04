Jx.delayDefine(People, "ContactPanel", function() {
    function e(t, i) {
        var u, s, f, r, e, o;
        for (u = [],
        s = i.count,
        f = 0; f < s; f++)
            r = i.item(f),
            r.isDefault || (e = "",
            o = r.meContact,
            Jx.isObject(o) && (r.sourceId === "FB" ? u.push({
                display: r.displayName,
                data: People.Protocol.createFromContact("profile", o).toUrl(),
                bici: People.Bici.ReactionType.profile
            }) : (e = c(o),
            Jx.isNonEmptyString(e) && u.push({
                display: r.displayName,
                data: e,
                bici: People.Bici.ReactionType.webProfile
            }))));
        t.updateValues(null, u)
    }
    function l(t, i) {
        var r = People.Contact.createUniqueFields(i.linkedContacts, "email");
        t.updateValues(o(i.mostRelevantEmail), r.map(function(n) {
            return o(n.fieldValue)
        }))
    }
    function o(t) {
        var i = null;
        return Jx.isNonEmptyString(t) && (i = {
            display: t,
            data: People.Protocol.create("mailto", {
                email: t
            }).toUrl(),
            bici: People.Bici.ReactionType.mail
        }),
        i
    }
    function a(t, r) {
        var f = r.linkedContacts.sort(function(n, t) {
            return u.indexOf(n.imType) - u.indexOf(t.imType)
        }).map(function(t) {
            var r = t.imType, u, f;
            return (r === Platform.ContactIMType.skype || r === Platform.ContactIMType.windowsLive || r === Platform.ContactIMType.foreignNetwork) && (u = t.account,
            u && (f = u.displayName,
            Jx.isNonEmptyString(f) && (r === Platform.ContactIMType.foreignNetwork && u.sourceId !== "FB" ? false : true))) ? {
                display: f,
                data: People.Protocol.createFromContact("message", t).toUrl(),
                bici: People.Bici.ReactionType.message
            } : null
        })
          , e = People.Contact.createUniqueFields(r.linkedContacts, "mobiletel").map(function(t) {
            return {
                display: Jx.res.loadCompoundString("/landingPage/sms", "‪" + t.fieldValue + "‬"),
                data: People.Protocol.create("sms", {
                    phoneNumber: t.fieldValue
                }).toUrl(),
                bici: People.Bici.ReactionType.sms
            }
        });
        t.updateValues(null, f.concat(e))
    }
    function v(t, r) {
        var u = [];
        r.linkedContacts.forEach(function(t) {
            var r, f;
            t.imType === Platform.ContactIMType.skype && (r = t.account,
            r && (f = r.displayName,
            Jx.isNonEmptyString(f) && u.push({
                display: f,
                data: People.Protocol.createFromContact("videocall", t).toUrl(),
                bici: People.Bici.ReactionType.videoCall
            })))
        });
        t.updateValues(null, u)
    }
    function y(t, r) {
        var u = [], f, e;
        r.linkedContacts.forEach(function(t) {
            var r, f;
            t.imType === Platform.ContactIMType.skype && (r = t.account,
            r && (f = r.displayName,
            Jx.isNonEmptyString(f) && u.push({
                display: f,
                data: People.Protocol.createFromContact("audiocall", t).toUrl(),
                bici: People.Bici.ReactionType.audioCall,
                title: Jx.res.getString("/landingPage/call")
            })))
        });
        f = People.Contact.createUniqueFields(r.linkedContacts, "tel");
        e = f.map(function(n) {
            return s(n.fieldValue, n.fieldName)
        });
        t.updateValues(u[0] || s(r.mostRelevantPhone), u.concat(e))
    }
    function s(t, i) {
        var u = null, f, r;
        return Jx.isNonEmptyString(t) && (f = {
            mobilePhoneNumber: "profile_fieldTitle_callMobile",
            mobile2PhoneNumber: "profile_fieldTitle_callMobile",
            homePhoneNumber: "profile_fieldTitle_callHome",
            home2PhoneNumber: "profile_fieldTitle_callHome",
            businessPhoneNumber: "profile_fieldTitle_callWork",
            business2PhoneNumber: "profile_fieldTitle_callWork"
        },
        r = "‪" + t + "‬",
        u = {
            display: i ? r + " (" + Jx.res.getString("/strings/profile_fieldTitle_" + i) + ")" : r,
            shortDisplay: r,
            data: People.Protocol.create("tel", {
                phoneNumber: t
            }).toUrl(),
            title: i ? Jx.res.getString("/strings/" + f[i]) : null,
            bici: People.Bici.ReactionType.call
        }),
        u
    }
    function p(t, i) {
        var f = People.Contact.createUniqueFields(i.linkedContacts, "mapLocation")
          , r = f.map(function(n) {
            return {
                value: n.fieldValue,
                metadata: {
                    type: n.fieldName,
                    contactName: i.calculatedUIName
                }
            }
        })
          , u = People.Location.getBestLocation(r);
        t.updateValues(u ? h(u) : null, r.map(function(n) {
            return h(n)
        }))
    }
    function h(t) {
        return {
            display: People.Location.chooseBestDisplayField(t.value),
            data: JSON.stringify(t),
            getUrl: function(t) {
                return People.UiFormMapHelper.getMapUrl(JSON.parse(t))
            },
            bici: People.Bici.ReactionType.address
        }
    }
    function w(n, t) {
        var i = t.linkedContacts.filter(function(n) {
            var i = false, t;
            return n.isGal || (t = n.account,
            i = Jx.isObject(t) && !t.isDefault),
            i
        }).map(function(n) {
            return b(n)
        }).filter(function(n) {
            return Jx.isNonEmptyString(n.data)
        });
        n.updateValues(null, i)
    }
    function b(t) {
        var i = t.account;
        if (i)
            return i.sourceId === "FB" ? {
                display: i.displayName,
                data: People.Protocol.createFromContact("profile", t).toUrl(),
                bici: People.Bici.ReactionType.profile
            } : {
                display: k(i.displayName, i.sourceId, t.nickname),
                data: c(t),
                bici: People.Bici.ReactionType.webProfile
            }
    }
    function c(n) {
        var r = n.verbs, f, t, u;
        if (r)
            for (f = r.count,
            t = 0; t < f; t++)
                if (u = r.item(t),
                Number(u.verbType) === Platform.VerbType.profile)
                    return u.url;
        return ""
    }
    function k(n, t, i) {
        return t === "TWITR" && Jx.isNonEmptyString(i) ? n + " @" + i : n
    }
    var People = window.People, Platform = Microsoft.WindowsLive.Platform, ContactPanel, r, f, u;
    InstruIds = Microsoft.WindowsLive.Instrumentation.Ids;
    ContactPanel = People.ContactPanel = function(t, i, r) {
        this._host = t;
        this._jobSet = t.getJobSet().createChild();
        this._objectType = i.objectType;
        this._fields = r;
        this._isUpdateQueued = false;
        this._isReady = false;
        var u = {
            interactive: false
        };
        (this._objectType === "MeContact" || i.isInAddressBook) && (u = {
            interactive: true,
            onClick: this._onIdentityControlClick.bind(this)
        });
        this._identityControl = new People.IdentityControl(i,this._jobSet,u);
        this._objectType === "Person" || this._objectType === "SearchPerson" ? (this._buttons = [{
            id: "emailCommand",
            title: Jx.res.getString("/landingPage/email"),
            icon: "",
            update: l,
            key: "email"
        }, {
            id: "callCommand",
            title: "",
            icon: "",
            update: y,
            key: "call"
        }, {
            id: "chatCommand",
            title: Jx.res.getString("/landingPage/chat"),
            icon: "",
            update: a,
            key: "chat"
        }, {
            id: "videoCallCommand",
            title: Jx.res.getString("/landingPage/videoCall"),
            icon: "",
            update: v,
            key: "videoCall"
        }, {
            id: "mapCommand",
            title: Jx.res.getString("/landingPage/map"),
            icon: "",
            update: p,
            key: "location"
        }, {
            id: "allInfoCommand",
            title: Jx.res.getString("/landingPage/profile"),
            icon: "",
            update: w,
            key: null
        }],
        this._binder = new People.PlatformObjectBinder(i),
        this._person = this._binder.createAccessor(this._queueUpdate.bind(this))) : this._objectType === "MeContact" ? (this._buttons = [{
            id: "allInfoCommand",
            title: Jx.res.getString("/landingPage/profile"),
            icon: "",
            update: this._updateMeInfoButton.bind(this),
            key: null
        }],
        this._binder = new People.PlatformObjectBinder(i),
        this._person = this._binder.createAccessor(this._queueUpdate.bind(this)),
        this._accountCollection = null,
        this._collectionChangeListener = this._accountCollectionChanged.bind(this)) : this._objectType === "SearchPerson" && (this._binder = new People.PlatformObjectBinder(i),
        this._person = this._binder.createAccessor(this._queueUpdate.bind(this)));
        this._buttons && (this._settingsContainer = i.objectId ? Jx.appData.localSettings().container("People").container("LandingPageMRU").container(i.objectId) : null,
        this._buttons.forEach(function(t) {
            t.button = new People.DisambiguatedCommandButton(t.id,t.title,t.icon,this._settingsContainer,t.key,this._jobSet)
        }, this),
        this._update());
        this._augmentPerson();
        this._commitContact = null
    }
    ;
    ContactPanel.prototype.className = "panelView-inactivePanel profileLanding-contactPanel";
    ContactPanel.prototype.position = People.PanelView.PanelPosition.contactPanel;
    ContactPanel.prototype._keyboardNavigation = null;
    ContactPanel.prototype._augmentAction = null;
    ContactPanel.prototype.getUI = function() {
        var r, h, u, t, i, e, o, a, s;
        if (this._substituteImage = null,
        this._fields && this._fields.extendedData && this._fields.extendedData.url && (this._substituteImage = this._fields.extendedData.url),
        r = null,
        this._objectType !== "MeContact" && (r = {
            element: People.IdentityElements.Networks,
            className: "profileLanding-networks",
            priority: People.Priority.synchronous
        }),
        h = this._identityControl.getUI(People.IdentityElements.TileLayout, {
            className: "contactPanel-ic",
            primaryContent: null,
            secondaryContent: r,
            defaultImage: this._substituteImage,
            useInnerHighlight: true,
            snap: true,
            portrait: true
        }),
        u = "",
        this._objectType !== "MeContact" && this._person.isInAddressBook) {
            var f = this._person.linkedContacts.filter(function(n) {
                return !n.isGal
            }).length
              , c = "&#xE167;"
              , l = "contactActions-button";
            f >= 2 && (text = f > 99 ? Jx.escapeHtml(Jx.res.getString("/landingPage/linkButtonCount-99plus")) : Jx.escapeHtml(String(f)),
            c = "<div class='commandimage-uppernumber'>" + text + "<\/div><div class='commandimage-lower'>&#xE167;<\/div>",
            l += " show-number-on-commandimage");
            t = Jx.escapeHtml(Jx.res.getString("/landingPage/profileCanvasButtonFavorite"));
            i = Jx.escapeHtml(Jx.res.getString("/landingPage/profileCanvasButtonLink"));
            u = "<div class='profileLanding-contactActions'><div class='profileLanding-contactActionContainer'><div id='favoriteButton' tabindex='0' class='contactActions-button' role='button' aria-label='" + t + "'><span class='win-commandicon win-commandring'><span class='win-commandimage'>&#xE113;<\/span><\/span><span class='contactActions-text'>" + t + "<\/span><div class='contactActions-tooltip' title='" + t + "'><\/div><\/div><div id='linkContactsButton' tabindex='0' class='" + l + "' role='button' aria-label='" + i + "'><span class='win-commandicon win-commandring'><span class='win-commandimage'>" + c + "<\/span><\/span><span class='contactActions-text'>" + i + "<\/span><div class='contactActions-tooltip' title='" + i + "'><\/div><\/div><\/div><\/div>"
        }
        return e = "<div class='profileLanding-panelContent'><div class='profileLanding-panelContent-left'><div class='profileLanding-panelContent-left-background'><\/div><div class='profileLanding-identityControl'>" + h + "<\/div><div class='profileLanding-GAL'><\/div>" + u + "<\/div>",
        this._buttons && (o = "",
        (this._objectType === "MeContact" || this._person.isInAddressBook) && (a = Jx.isRtl() ? "" : "",
        s = Jx.escapeHtml(Jx.res.getString("/landingPage/contactSectionMoreInfoLink")),
        o = "<div id='moreInfoButton' class='moreInfo-link' tabindex='0' role='button' aria-label='" + s + "'><a class='moreInfo-link-text'>" + s + "<\/a><a class='moreInfo-link-chevron'>" + a + "<\/a><\/div>"),
        e += "<div class='profileLanding-panelContent-right'><div class='profileLanding-panelContent-right-background'><\/div><div class='profileLanding-contact' role='group' aria-label='" + Jx.escapeHtml(Jx.res.loadCompoundString("/landingPage/communicationVerbs", this._person.calculatedUIName)) + "'>" + this._buttons.map(function(n) {
            var t = n.button;
            return t.getUI()
        }).join("") + "<\/div>" + o + "<\/div>"),
        e + "<\/div>"
    }
    ;
    ContactPanel.prototype.activateUI = function(t) {
        var f, i, r, u;
        this._identityControl.activateUI(t);
        this._buttons && (this._buttons.forEach(function(n) {
            var i = n.button;
            i.activateUI(t)
        }),
        f = t.querySelector(".profileLanding-contact"),
        this._keyboardNavigation = new Jx.KeyboardNavigation(f,"vertical"));
        i = t.querySelector(".moreInfo-link");
        i && (this._moreInfoClicker = new Jx.Clicker(i,this._onMoreInfoClick,this),
        People.Animation.addPressStyling(i));
        r = t.querySelector("#favoriteButton");
        r && (this._favoriteButton = r,
        this._favoriteButton.addEventListener("click", this._onFavoriteClick = this._onFavoriteCommand.bind(this), false),
        this._favoriteButton.addEventListener("keypress", this._onFavoriteKeypress = this._onFavoriteCommand.bind(this), false),
        this._person.isFavorite && WinJS.Utilities.addClass(this._favoriteButton, "contactActions-checkedButton"));
        u = t.querySelector("#linkContactsButton");
        u && (this._linkContactsButton = u,
        this._linkContactsButton.addEventListener("click", this._onLinkClick = this._onLinkCommand.bind(this), false),
        this._linkContactsButton.addEventListener("keypress", this._onLinkKeypress = this._onLinkCommand.bind(this), false));
        this._galContainer = t.querySelector(".profileLanding-GAL");
        this._galContainer.style.display = "none";
        this._showGALInfo();
        this._addFrameCommands()
    }
    ;
    ContactPanel.prototype._onMoreInfoClick = function() {
        People.Nav.navigate(People.Nav.getProfileDetailUri(this._person.objectId))
    }
    ;
    ContactPanel.prototype.ready = function() {
        this._isReady = true;
        this._applyQueuedUpdates();
        this._objectType === "Person" ? this._person.isInAddressBook && People.ContactCommands.addCommands(this._host, this._binder) : this._objectType === "MeContact" && People.MeCommands.addCommands(this._host);
        this._objectType === "MeContact" ? Jx.bici.addToStream(InstruIds.People.socialPageViewed, "", People.Bici.mePage) : this._objectType === "Person" && Jx.bici.addToStream(InstruIds.People.socialPageViewed, "", People.Bici.landingPage);
        this._objectType === "Person" && this._person.isInAddressBook && this._jobSet.addUIJob(this, function() {
            People.ContactLinkingControl.prepareSuggestions(this._person.getPlatformObject())
        }, null, People.Priority.suggestions)
    }
    ;
    ContactPanel.prototype._addFrameCommands = function() {
        if (!this._person.isInAddressBook) {
            var t = this._person.linkedContacts[0];
            t && !t.thirdPartyObjectId && this._host.getFrameCommands().addCommand(new People.Command("cmdid_landingPage_save",null,"/landingPage/saveButtonTitle","",true,true,this,this._showSaveFlyout))
        }
    }
    ;
    ContactPanel.prototype._onIdentityControlClick = function(t, i) {
        var u, f, e, r, o;
        this._objectType === "MeContact" ? People.Nav.navigate(People.Nav.getEditMePictureUri()) : (u = [],
        t.canClearPersonTile ? (u.push(new WinJS.UI.MenuCommand(null,{
            label: Jx.res.getString("/landingPage/changeTileMenuOption"),
            onclick: this._onChangeTile.bind(this)
        })),
        u.push(new WinJS.UI.MenuCommand(null,{
            label: Jx.res.getString("/landingPage/removeTileMenuOption"),
            onclick: this._onClearTile.bind(this)
        }))) : (f = t.getUserTile(Microsoft.WindowsLive.Platform.UserTileSize.original, true).appdataURI,
        e = f ? Jx.res.getString("/landingPage/changeTileMenuOption") : Jx.res.getString("/landingPage/setTileMenuOption"),
        u.push(new WinJS.UI.MenuCommand(null,{
            label: e,
            onclick: this._onChangeTile.bind(this)
        }))),
        r = new WinJS.UI.Menu(null,{
            commands: u
        }),
        Jx.addClass(r.element, "profileLanding-identityControl-flyout"),
        document.body.appendChild(r.element),
        r.addEventListener("afterhide", function() {
            document.body.removeChild(r.element)
        }, false),
        o = i.querySelector(".ic-tileContainer"),
        r.show(o, "bottom", Jx.isRtl ? "left" : "right"))
    }
    ;
    ContactPanel.prototype._onClearTile = function() {
        this._person.canClearPersonTile && this._person.clearPersonTile()
    }
    ;
    r = {};
    r[Windows.Graphics.Imaging.BitmapDecoder.gifDecoderId] = Windows.Graphics.Imaging.BitmapEncoder.gifEncoderId;
    r[Windows.Graphics.Imaging.BitmapDecoder.pngDecoderId] = Windows.Graphics.Imaging.BitmapEncoder.pngEncoderId;
    r[Windows.Graphics.Imaging.BitmapDecoder.jpegDecoderId] = Windows.Graphics.Imaging.BitmapEncoder.jpegEncoderId;
    f = Windows.Graphics.Imaging.BitmapEncoder.jpegEncoderId;
    ContactPanel.prototype._onChangeTile = function() {
        var t = new Windows.Storage.Pickers.FileOpenPicker, n, i;
        t.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        t.fileTypeFilter.replaceAll([".jpg", ".bmp", ".gif", ".png", ".jpeg"]);
        n = this;
        i = new Windows.Storage.Streams.InMemoryRandomAccessStream;
        t.pickSingleFileAsync().then(function(t) {
            t && t.openReadAsync().then(function(t) {
                Windows.Graphics.Imaging.BitmapDecoder.createAsync(t).then(function(t) {
                    return t.getPixelDataAsync(t.bitmapPixelFormat, t.bitmapAlphaMode, new Windows.Graphics.Imaging.BitmapTransform, Windows.Graphics.Imaging.ExifOrientationMode.respectExifOrientation, Windows.Graphics.Imaging.ColorManagementMode.colorManageToSRgb).then(function(u) {
                        var e = r[t.decoderInformation.codecId];
                        return e || (e = f),
                        Windows.Graphics.Imaging.BitmapEncoder.createAsync(e, i).then(function(r) {
                            r.setPixelData(t.bitmapPixelFormat, t.bitmapAlphaMode, t.orientedPixelWidth, t.orientedPixelHeight, t.dpiX, t.dpiY, u.detachPixelData());
                            r.flushAsync().then(function() {
                                n._person.canClearPersonTile && n._person.clearPersonTile();
                                n._person.setPersonTile(i)
                            })
                        })
                    })
                })
            })
        })
    }
    ;
    ContactPanel.prototype._showSaveFlyout = function(n, t) {
        if (this._commitContact) {
            Jx.log.error("Commit already in progress");
            return
        }
        var i = new WinJS.UI.Menu(null,{
            commands: [new WinJS.UI.MenuCommand(null,{
                label: Jx.res.getString("/landingPage/saveMenuOption"),
                onclick: this._onSave.bind(this)
            }), new WinJS.UI.MenuCommand(null,{
                label: Jx.res.getString("/landingPage/linkMenuOption"),
                onclick: this._onLink.bind(this)
            })]
        });
        return document.body.appendChild(i.element),
        i.addEventListener("afterhide", function() {
            document.body.removeChild(i.element)
        }, false),
        i.show(t, "bottom", Jx.isRtl ? "left" : "right"),
        i
    }
    ;
    ContactPanel.prototype._onSave = function() {
        this._saveContact(null)
    }
    ;
    ContactPanel.prototype._onFavoriteCommand = function(t) {
        (t.type === "click" || t.type === "keypress" && (t.keyCode === WinJS.Utilities.Key.enter || t.keyCode === WinJS.Utilities.Key.space)) && (this._person.isFavorite ? this._person.removeFavorite() : (this._person.insertFavorite(Microsoft.WindowsLive.Platform.FavoriteInsertPosition.insertLast, null),
        Jx.bici.addToStream(InstruIds.People.socialReactionUpdated, "", People.Bici.landingPage, 0, People.Bici.ReactionType.favorite)),
        WinJS.Utilities.toggleClass(this._favoriteButton, "contactActions-checkedButton"),
        People.AppTile.pushTiles(this._host.getPlatform()))
    }
    ;
    ContactPanel.prototype._onLinkCommand = function(t) {
        (t.type === "click" || t.type === "keypress" && (t.keyCode === WinJS.Utilities.Key.enter || t.keyCode === WinJS.Utilities.Key.space)) && People.Nav.navigate(People.Nav.getLinkPersonUri(this._person.objectId))
    }
    ;
    ContactPanel.prototype._onLink = function() {
        this._host.getLayout().unsnap(function() {
            var n = new Windows.ApplicationModel.Contacts.ContactPicker;
            n.commitButtonText = Jx.res.getString("/landingPage/linkButtonTitle");
            n.selectionMode = Windows.ApplicationModel.Contacts.ContactSelectionMode.fields;
            n.desiredFieldsWithContactFieldType.append(Windows.ApplicationModel.Contacts.ContactFieldType.custom);
            n.pickContactAsync().done(this._onPeoplePickerComplete.bind(this), Jx.fnEmpty)
        }, this)
    }
    ;
    ContactPanel.prototype._onPeoplePickerComplete = function(n) {
        if (n) {
            var t = this._host.getPlatform().peopleManager.loadPerson(n.id);
            t && this._saveContact(t)
        }
    }
    ;
    ContactPanel.prototype._saveContact = function(t) {
        var s = this._host.getPlatform(), o = this._fields.extendedData && !Jx.isNullOrUndefined(this._fields.extendedData.accountId), f = null, e = o ? this._fields.extendedData.accountId : this._fields.accountId, contact, source, u;
        if (Jx.isNonEmptyString(e)) {
            try {
                f = s.accountManager.loadAccount(e)
            } catch (h) {
                Jx.log.exception("Error loading account: " + e, h)
            }
            f && !People.CommitContact.canCreateContacts(f) && (Jx.log.warning("Specified account " + e + " does not support adding contacts, falling back to the default"),
            f = null)
        }
        contact = this._host.getPlatform().peopleManager.createContact(f);
        this._fields.extendedData ? (source = this._person.linkedContacts[0],
        contact.firstName = source.firstName,
        o ? source.businessEmailAddress ? contact.businessEmailAddress = source.businessEmailAddress : source.otherEmailAddress && (contact.otherEmailAddress = source.otherEmailAddress) : (contact.lastName = source.lastName,
        contact.middleName = source.middleName,
        contact.title = source.title,
        contact.suffix = source.suffix,
        contact.yomiFirstName = source.yomiFirstName,
        contact.yomiLastName = source.yomiLastName,
        contact.notes = source.notes,
        contact.webSite = source.webSite,
        contact.significantOther = source.significantOther,
        contact.homePhoneNumber = source.homePhoneNumber,
        contact.home2PhoneNumber = source.home2PhoneNumber,
        contact.mobilePhoneNumber = source.mobilePhoneNumber,
        contact.mobile2PhoneNumber = source.mobile2PhoneNumber,
        contact.businessPhoneNumber = source.businessPhoneNumber,
        contact.business2PhoneNumber = source.business2PhoneNumber,
        contact.personalEmailAddress = source.personalEmailAddress,
        contact.businessEmailAddress = source.businessEmailAddress,
        contact.otherEmailAddress = source.otherEmailAddress,
        contact.companyName = source.companyName,
        contact.yomiCompanyName = source.yomiCompanyName,
        contact.officeLocation = source.officeLocation,
        contact.jobTitle = source.jobTitle,
        contact.homeLocation = source.homeLocation,
        contact.businessLocation = source.businessLocation,
        contact.otherLocation = source.otherLocation)) : (contact.firstName = this._person.firstName,
        contact.lastName = this._person.lastName,
        u = this._person.linkedContacts[1],
        u ? (contact.businessEmailAddress = this._person.mostRelevantEmail,
        contact.businessPhoneNumber = u.businessPhoneNumber,
        contact.mobilePhoneNumber = u.mobilePhoneNumber) : contact.personalEmailAddress = this._person.mostRelevantEmail);
        this._commitContact = new People.CommitContact(contact,t,function(t) {
            var r, i;
            t && u && (r = u.getPlatformObject(),
            r.savePermanently(t));
            this._substituteImage && t && (!o || Jx.isNullOrUndefined(this._fields.extendedData)) ? (i = this,
            WinJS.xhr({
                url: this._substituteImage,
                responseType: "blob"
            }).then(function(r) {
                var u = r.response;
                t.setPersonTile(u.msDetachStream());
                i._host.back(People.Nav.getViewPersonUri(t.objectId))
            }, function() {
                i._host.back(People.Nav.getViewPersonUri(t.objectId))
            })) : this._host.back(t ? People.Nav.getViewPersonUri(t.objectId) : null)
        }
        ,this)
    }
    ;
    ContactPanel.prototype.suspend = function() {}
    ;
    ContactPanel.prototype.deactivateUI = function() {
        this._disposeAccountCollection();
        this._disposeAugmentAction();
        this._identityControl && (this._identityControl.shutdownUI(),
        this._identityControl = null);
        this._favoriteButton && (this._onFavoriteClick && (this._favoriteButton.removeEventListener("click", this._onFavoriteClick, false),
        this._favoriteButton.removeEventListener("keypress", this._onFavoriteKeypress, false),
        this._onFavoriteClick = null),
        this._favoriteButton = null);
        this._linkContactsButton && (this._onLinkClick && (this._linkContactsButton.removeEventListener("click", this._onLinkClick, false),
        this._linkContactsButton.removeEventListener("keypress", this._onLinkKeypress, false),
        this._onLinkClick = null),
        this._linkContactsButton = null);
        Jx.dispose(this._binder);
        Jx.dispose(this._jobSet);
        Jx.dispose(this._keyboardNavigation);
        Jx.dispose(this._moreInfoClicker);
        Jx.dispose(this._commitContact);
        this._binder = null;
        this._jobSet = null;
        this._keyboardNavigation = null;
        this._moreInfoClicker = null;
        this._commitContact = null
    }
    ;
    ContactPanel.prototype._queueUpdate = function() {
        this._isUpdateQueued || (this._isUpdateQueued = true,
        this._jobSet.addUIJob(this, this._applyQueuedUpdates, null, People.Priority.propertyUpdate))
    }
    ;
    ContactPanel.prototype._applyQueuedUpdates = function() {
        this._isUpdateQueued && this._isReady && (this._isUpdateQueued = false,
        this._update(),
        this._updateGALInfoAnimated(),
        this._augmentPerson())
    }
    ;
    ContactPanel.prototype._update = function() {
        this._buttons.forEach(function(n) {
            n.update(n.button, this._person)
        }, this);
        this._keyboardNavigation && this._keyboardNavigation.update()
    }
    ;
    ContactPanel.prototype._isGALEnabled = function() {
        return this._objectType !== "MeContact"
    }
    ;
    ContactPanel.prototype._augmentPerson = function() {
        if (this._disposeAugmentAction(),
        this._isGALEnabled())
            try {
                Jx.log.info("Calling augmentViaServerAsync on person: " + this._person.objectId);
                Jx.mark("People.ContactPanel._augmentPerson,StartTM,People,ContactPanel");
                this._augmentAction = this._person.augmentViaServerAsync(false).done(function() {
                    Jx.mark("People.ContactPanel._augmentPerson,StopTM,People,ContactPanel")
                }, Jx.fnEmpty)
            } catch (n) {
                Jx.log.exception("Error calling augmentViaServerAsync on person: " + this._person.objectId, n)
            }
    }
    ;
    ContactPanel.prototype._disposeAugmentAction = function() {
        var n = this._augmentAction;
        n && (n.cancel(),
        this._augmentAction = null)
    }
    ;
    ContactPanel.prototype._showGALInfo = function() {
        this._updateGALInfo(false)
    }
    ;
    ContactPanel.prototype._updateGALInfoAnimated = function() {
        this._updateGALInfo(true)
    }
    ;
    ContactPanel.prototype._updateGALInfo = function(t) {
        var o, u, f, s, h;
        if (this._isGALEnabled() && this._person.linkedContacts) {
            var i = this._galContainer
              , e = this._person.linkedContacts.filter(function(n) {
                return Jx.isNonEmptyString(n.jobTitle) || Jx.isNonEmptyString(n.companyName) || Jx.isNonEmptyString(n.officeLocation)
            })[0]
              , r = "";
            e && (o = false,
            u = function(n) {
                var t, i;
                return Jx.isNonEmptyString(e[n]) ? (t = "gal-secondaryField",
                o || (o = true,
                t = "gal-primaryField"),
                i = Jx.escapeHtml(e[n]),
                "<div class='" + t + "' title='" + i + "'>" + i + "<\/div>") : ""
            }
            ,
            r += u("jobTitle"),
            r += u("companyName"),
            r += u("officeLocation"));
            f = [];
            t && this._host.getLayout().getLayoutState() === People.Layout.layoutState.snapped && (f = this._host.getPanelElements());
            Jx.isNonEmptyString(r) ? i.style.display === "none" && t ? (s = WinJS.UI.Animation.createAddToListAnimation(i, f),
            i.innerHTML = r,
            i.style.display = "",
            s.execute()) : (i.innerHTML = r,
            i.style.display = "") : i.style.display !== "none" && t && (h = WinJS.UI.Animation.createDeleteFromListAnimation(i, f),
            i.style.display = "none",
            i.innerHTML = "",
            h.execute())
        }
    }
    ;
    ContactPanel.prototype._disposeAccountCollection = function() {
        this._accountCollection && (this._accountCollection.removeEventListener("collectionchanged", this._collectionChangeListener),
        this._accountCollection.dispose(),
        this._accountCollection = null)
    }
    ;
    ContactPanel.prototype._updateMeInfoButton = function(n) {
        this._accountCollection ? this._accountCollection.lock() : (this._accountCollection = this._host.getPlatform().accountManager.getConnectedAccountsByScenario(Platform.ApplicationScenario.people, Platform.ConnectedFilter.normal, Platform.AccountSort.rank),
        this._accountCollection.addEventListener("collectionchanged", this._collectionChangeListener));
        this._meInfoButton = n;
        e(n, this._accountCollection);
        this._accountCollection.unlock()
    }
    ;
    ContactPanel.prototype._accountCollectionChanged = function() {
        this._accountCollection.lock();
        e(this._meInfoButton, this._accountCollection);
        this._accountCollection.unlock()
    }
    ;
    u = [Platform.ContactIMType.skype, Platform.ContactIMType.windowsLive, Platform.ContactIMType.office, Platform.ContactIMType.yahoo, Platform.ContactIMType.foreignNetwork]
})
