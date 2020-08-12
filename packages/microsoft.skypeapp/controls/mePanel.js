

(function () {
    "use strict";
    

    var panelAnimOffset = {
            top: "0px",
            left: "322px",
            rtlflip: true
        };

    var mePanel = WinJS.Class.derive(Skype.UI.LazyInitializedControl, function (element, options) {
        this.element = element;
        this.element.winControl = this;
    }, {
        element: null,
        smileElement: null,
        _moodInput: null,
        _moodSlectionEnd: null,
        _oldMoodMessage: null,
        myselfWrapper: null,
        nameElement: null,
        emailElement: null,
        clickEater: null,
        signOutPanel: null,
        backIsSettings: false,
        keyboardHeight: 0,
        MAX_INPUT_HEIGHT: 105,
        MIN_INPUT_HEIGHT: 40,

        lazyInitAsync: function () {
            log('MePanel control init()');

            this.hide = this.hide.bind(this);
            
            return WinJS.UI.Fragments.render("/controls/mePanel.html", this.element).then(this.onReady.bind(this));
        },

        onReady: function() {

            WinJS.UI.processAll(this.element);
            WinJS.Resources.processAll(this.element);

            
            WinJS.Utilities.query("ul.statusContainer li", this.element).listen("click", this.onPresenceClick.bind(this));

            this.accountBtn = this.element.querySelector("li.account");
            this.regEventListener(this.accountBtn, "click", this.onAccountClick.bind(this));
            this.regEventListener(this.accountBtn, "keyup", this.onAccountClick.bind(this));


            this.signOutBtn = this.element.querySelector("li.signOut");
            this.regEventListener(this.signOutBtn, "click", this.onSignOutClick.bind(this));
            this.regEventListener(this.signOutBtn, "keyup", this.onSignOutClick.bind(this));


            
            this._moodInput = this.element.querySelector("textarea.mood");
            this.regEventListener(this._moodInput, "blur", this.onMoodBlur.bind(this));
            this.regEventListener(this._moodInput, "focus", this.onMoodFocus.bind(this));
            this.regEventListener(this._moodInput, "keydown", this.onMoodKeyDown.bind(this));
            this.regEventListener(this._moodInput, "input", this.onMoodInput.bind(this));
            this.moodOuterContainer = this.element.querySelector(".moodOuterContainer");

            
            this.smileyElement = this.element.querySelector("input.emoticonPicker");
            this.regEventListener(this.smileyElement, "click", function (e) {
                Skype.UI.EmoticonPicker.show(this._addEmoticon.bind(this));
            }.bind(this));

            this.avatar = null;

            
            this.regEventListener(this.element, "click", function (e) {
                e.stopPropagation();
            });

            this.initTouchKeyboard();

            
            this._clickEater = document.createElement("div");
            this._clickEater.className = "clickEater mePanel";
            document.body.appendChild(this._clickEater);
            this.regEventListener(this._clickEater, "click", this.hide);

            this.regEventListener(this.element.querySelector(".close"), "click", this.hideOnBackClicked.bind(this));

            var closeOnEsc = function (e) {
                if (e.keyCode === WinJS.Utilities.Key.escape) {
                    var signOutPanelVisible = !WinJS.Utilities.hasClass(this.signOutPanel, "hidden");
                    if (signOutPanelVisible) {
                        this.hideSignOutPanel();
                    } else {
                        this.hide();
                    }
                }
            };
            this.regEventListener(window, "keypress", closeOnEsc.bind(this)); 

            Skype.UI.Util.addMouseDownCss("li", this.element);

            this.regEventListener(document, 'mePanelShow', this.updateAvatar.bind(this)); 
            this.regEventListener(Skype.Application.state, "navigated", this.hide);
            this.hide();

            this.myselfWrapper = new Skype.Model.Contact(lib.getContactByIdentity(lib.myIdentity));
            this.myselfWrapper.alive();
            this.regEventListener(lib.myself, "propertychange", this._handleLibPropChange.bind(this));
            this.regEventListener(this.myselfWrapper, "propertychanged", this._handleWrapperPropChange.bind(this));
            
            this.updateMood();
            this.updateInputStyle();
            this.updatePresence();

            this.nameElement = this.element.querySelector("span.name");
            this.emailElement = this.element.querySelector("span.email");

            
            Skype.LoginManager.userEmail().done(function (email) {
                if (this.emailElement) {
                    this.emailElement.textContent = email;
                }
            }.bind(this), function onError() {});

            
            this.regBind(this.myselfWrapper, "name", function (name) {
                if (this.nameElement) {
                    this.nameElement.innerHTML = name;
                }
            }.bind(this));

            this.signOutPanel = this.element.querySelector(".signOutPanel");
            var signOutBackBtn = this.element.querySelector(".closeSignOutPanel");
            this.regEventListener(signOutBackBtn, "click", function (e) {
                this.hideSignOutPanel();
            }.bind(this));
        },
        
        _onLazyDispose: function () {
            WinJS.Utilities.removeClass(this.element, 'VISIBLE');
            this._clickEater && document.body.removeChild(this._clickEater);
        },

        hideOnBackClicked: function() {
            this.hide();

            if (this.backIsSettings) {
                WinJS.UI.SettingsFlyout.show();
            }
        },

        hide: function () {
            Skype.Application.state.isMePanelOpened = false;
            this.element.querySelector(".mePanel-accessWrap").winControl.disable();

            if (this._hiding || !WinJS.Utilities.hasClass(this.element, 'VISIBLE')) {
                return;
            }
            this._hiding = true;

            
            document.activeElement.blur();
            this._clickEater.style.display = "none";

            var animDoneCallback = (function (event) {
                if (!this.isDisposed) {
                    Skype.UI.Util.sendEvent('mePanelHide');
                    this.element.style.opacity = '0'; 
                    WinJS.Utilities.removeClass(this.element, 'VISIBLE');
                    WinJS.Utilities.addClass(this.signOutPanel, "hidden");
                    this.unregEventListener(this.element, "animationend", animDoneCallback);

                    this._hiding = false;
                }
            }).bind(this);

            
            this.regEventListener(this.element, "animationend", animDoneCallback);

            WinJS.UI.Animation.hideEdgeUI(this.element, panelAnimOffset)
                .then(
                    animDoneCallback.bind(this),
                    animDoneCallback.bind(this)
                ).done(function() {
                    roboSky.write("mePanel,hide");
                });
        },

        _handleWrapperPropChange: function (e){
            var propertyName = e.detail;

            if (propertyName === "isAvailable") {
                this.updatePresence();
            }

            if (propertyName === "avatarUri") {
                this.updateAvatar();
            }
        },

        _handleLibPropChange: function (e) {
            var propKey = e.detail[0];

            if (propKey == LibWrap.PROPKEY.contact_RICH_MOOD_TEXT || propKey == LibWrap.PROPKEY.contact_MOOD_TEXT) {
                this.updateMood();
            }
        },

        
        _addEmoticon: function (emoticon) {
            if (emoticon) { 
                var text = emoticon ? " " + emoticon + " " : "";

                this._moodInput.focus();

                var currentText = this._moodInput.value;
                var endIndex = this._moodSlectionEnd;
                this._moodInput.value = currentText.slice(0, endIndex) + text + currentText.slice(endIndex);
            } else {
                this._moodInput.focus();
            }
        },

        initTouchKeyboard: function () {
            var inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            this.regEventListener(inputPane, "hiding", onHiding.bind(this));
            this.regEventListener(inputPane, "showing", onShowing.bind(this));

            function onShowing(ev) {
                ev.ensuredFocusedElementInView = true; 
                var currentBottom = this.element.offsetHeight - this.moodOuterContainer.offsetTop - this.moodOuterContainer.offsetHeight;
                this.keyboardHeight = ev.occludedRect.height;
                if (currentBottom < this.keyboardHeight) {
                    WinJS.Utilities.addClass(this.element, 'KEYBOARDUP');
                    this.moodOuterContainer.style.bottom = this.keyboardHeight + "px";
                }
            }

            function onHiding(ev) {
                WinJS.Utilities.removeClass(this.element, 'KEYBOARDUP');
                this.moodOuterContainer.style.bottom = "";
                this.keyboardHeight = 0;
            }
        },

        onPresenceClick: function (e) {
            var status = e.currentTarget.getAttribute("data-presence");

            var statusId = LibWrap.Contact.availability_ONLINE;
            if (status == "invisible") {
                statusId = LibWrap.Contact.availability_INVISIBLE;
            }

            log("mePanel: set presence to: " + status);

            lib.account.setAvailability(statusId);
            
            this._updateSelection(status);
            
            Skype.Statistics.sendStats(Skype.Statistics.event.mePanel_presenceChange, status);
        },

        _updateSelection: function (status) {
            WinJS.Utilities.query("li[data-presence='" + status + "']", this.element).addClass("selected");
            this._updateAriaLabelsOnSelection(status);
        },
        
        _updateAriaLabelsOnSelection: function (status) {
            var onlineButton = WinJS.Utilities.query("li[data-presence='online'] button", this.element);
            var invisibleButton = WinJS.Utilities.query("li[data-presence='invisible'] button", this.element);
            if (status == "invisible") {
                onlineButton.setAttribute("aria-label", WinJS.Resources.getString("aria_me_available_unselected").value);
                invisibleButton.setAttribute("aria-label", WinJS.Resources.getString("aria_me_invisible_selected").value);
            } else if (status == "online") {
                onlineButton.setAttribute("aria-label", WinJS.Resources.getString("aria_me_available_selected").value);
                invisibleButton.setAttribute("aria-label", WinJS.Resources.getString("aria_me_invisible_unselected").value);
            }
        },
        
        _parseKeyUpEvents: function (e) {
            
            return e.type === "keyup" && e.keyCode !== WinJS.Utilities.Key.space && e.keyCode !== WinJS.Utilities.Key.enter;
        },

        onAccountClick: function (e) {
            if (WinJS.Utilities.hasClass(this.accountBtn, "disabled") || this._parseKeyUpEvents(e)) {
                return;
            }
            
            WinJS.Utilities.addClass(this.accountBtn, "disabled");
                
            this.regPromise(Skype.SSOTokenRequestManager.instance.requestTokenAsync())
                .then(function success(token) {
                    WinJS.Utilities.removeClass(this.accountBtn, "disabled");

                    var url = Skype.SSOTokenRequestManager.getSSOUrlWithGoLink(token, "myaccount") + "&" + Skype.UI.Util.getTrackingParam("go-my-account");
                    Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri(url));
                }.bind(this),
                function error() {
                    WinJS.Utilities.removeClass(this.accountBtn, "disabled");
                    Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri("https://www.skype.com/go/myaccount"));
                }.bind(this));
    },

        onSignOutClick: function (e) {
            if (this._parseKeyUpEvents(e) || !WinJS.Utilities.hasClass(this.signOutPanel, "hidden")) {
                return;
            }
            
            this.hide(); 
            document.body.focus();

            if (Skype.LoginManager.canSignOutLiveIdUser()) {
                Skype.UI.navigate("login", { state: "force logout" });

                Skype.Statistics.sendStats(Skype.Statistics.event.signout, "local");
            } else {
                Skype.UI.navigate("logout", { state: "start logout" });

                Skype.Statistics.sendStats(Skype.Statistics.event.signout, "Windows MSA");
            }
        },

        showSignOutPanel: function() {
            
            var myAccountData = {
                avatarUrl: Skype.Model.AvatarUpdater.instance.getAvatarURI(this.avatar.identity),
                name: this.nameElement.innerHTML,
                username: this.emailElement.textContent,
            };

            var template = document.querySelector("#accountContactTemplate");
            var templateResult = template.renderItem(WinJS.Promise.wrap({ data: myAccountData }));

            var contactHolder = this.signOutPanel.querySelector(".accountContact");
            contactHolder.innerHTML = "";
            contactHolder.appendChild(templateResult.element._value);

            
            WinJS.Utilities.removeClass(this.signOutPanel, "hidden");
            WinJS.UI.Animation.showEdgeUI(this.signOutPanel, panelAnimOffset, { mechanism: "transition" })
                .then(function () { roboSky.write("mePanel,signOutPanel,show"); });
            
            this.regEventListener(this.signOutPanel, "keydown", this._handleKeyDownOnSignOutPage.bind(this));
        },
        
        _handleKeyDownOnSignOutPage: function(e) {
            if (e.keyCode === WinJS.Utilities.Key.tab) {
                e.stopPropagation();
                e.preventDefault();
            }
        },

        hideSignOutPanel: function () {
            var animDoneCallback = (function (event) {
                if (!this.isDisposed) {
                    WinJS.Utilities.addClass(this.signOutPanel, "hidden");
                    this.unregEventListener(this.signOutPanel, "animationend", animDoneCallback);
                } else {
                    roboSky.write("mePanel,signOutPanel,hide");
                }
                document.activeElement.blur();
                this.element.querySelector("li.signOut").focus();

            }).bind(this);

            this.regEventListener(this.signOutPanel, "animationend", animDoneCallback);

            
            WinJS.UI.Animation.hideEdgeUI(this.signOutPanel, panelAnimOffset).then(animDoneCallback, animDoneCallback);
        },

        updateAvatar: function () {
            var contactId = lib.myself.getStrProperty(LibWrap.PROPKEY.contact_SKYPENAME);
            var avatarEl = this.element.querySelector("div.avatar");
            this.avatar = this.avatar || new Skype.UI.Avatar(avatarEl, { identity: contactId });
            this.avatar.updateAvatar();
        },

        updatePresence: function () {
            WinJS.Utilities.query("li", this.element).removeClass("selected");

            var status = this.myselfWrapper.isAvailable ? "online" : "invisible";

            log("update presence from lib to: " + status);
            this._updateSelection(status);
        },

        updateMood: function () {

            var mood = lib.myself.getStrProperty(LibWrap.PROPKEY.contact_MOOD_TEXT);

            log("update mood from lib to:" + mood);

            this._moodInput.value = mood.trim();
        },

        updateInputStyle: function () {
            
            var textHeight = this._moodInput.scrollHeight,
                hasMaxHeight = WinJS.Utilities.hasClass(this._moodInput, 'MAXHEIGHT');

            var inputPos = WinJS.Utilities.getPosition(this._moodInput);
            var maxOccludedHeight = document.documentElement.offsetHeight - this.keyboardHeight - inputPos.top - 5 ;
            var maxHeight = Math.min(this.MAX_INPUT_HEIGHT, Math.max(this.MIN_INPUT_HEIGHT, maxOccludedHeight));

            if (textHeight > maxHeight) {
                if (!hasMaxHeight) {
                    this._moodInput.style.height = maxHeight + 'px';
                    WinJS.Utilities.addClass(this._moodInput, 'MAXHEIGHT');
                }
            } else {
                if (hasMaxHeight) {
                    WinJS.Utilities.removeClass(this._moodInput, 'MAXHEIGHT');
                }
                this._moodInput.style.height = textHeight + 'px';
            }
        },

        onMoodFocus: function (e) {
            this._oldMoodMessage = e.target.value;
            e.target.setSelectionRange(0, 999);
            this.updateInputStyle();
        },

        onMoodKeyDown: function (e) {
            
            if (e.keyCode == 27) {
                e.preventDefault();
                e.target.value = this._oldMoodMessage;
                this.element.focus();
            }

            
            if (e.keyCode == 13) {
                if (!e.shiftKey) {
                    e.preventDefault();
                    e.target.blur();
                }
            }

        },

        onMoodInput: function (e) {
            this.updateInputStyle();
        },

        onMoodBlur: function (e) {
            if (document.activeElement && document.activeElement.className.search("emoticonPicker") != -1) {
                this._moodSlectionEnd = e.target.selectionEnd;
            } else {
                this._moodSlectionEnd = e.target.value.length;
            }
            this.updateInputStyle();
            var mood = e.target.value;
            log("set mood to: " + mood);

            var encoded = LibWrap.WrSkyLib.contentEncode(mood, false);
            lib.account.setStrProperty(LibWrap.PROPKEY.contact_RICH_MOOD_TEXT, encoded);
        },

        _onShow: function () {
            Skype.Application.state.isMePanelOpened = true;
            WinJS.Utilities.addClass(this.element, 'VISIBLE');
            this._clickEater.style.display = "block";
            this.element.style.opacity = '1'; 
            WinJS.UI.Animation.showEdgeUI(this.element, panelAnimOffset, { mechanism: "transition" }).then(function () { roboSky.write("mePanel,show"); });
            Skype.UI.EmoticonPicker.hide();
            Skype.UI.Util.sendEvent('mePanelShow');
            this.updateInputStyle();
            this.element.querySelector(".mePanel-accessWrap").winControl.enable();
        }
    },
    {
        show: function (backIsSettings) {
            Skype.UI.LazyInitializedControl.initAsync(document.querySelector("#mePanel"));

            document.querySelector("#mePanel").winControl.backIsSettings = backIsSettings;
        },
        dispose: function () {
            var control = document.querySelector("#mePanel").winControl;
            control && control.dispose();
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        MePanel: mePanel
    });
})();
