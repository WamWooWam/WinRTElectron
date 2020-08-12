

(function (global) {
    "use strict";

    var HOW_TO_LINK = "http://go.microsoft.com/fwlink/p/?LinkId=393516",
        OFFLINE_NAME_KEY = "offline.name",
        OFFLINE_AVATAR_URI_KEY = "offline.avatarUri",
        OFFLINE_EMAIL_KEY = "offline.email";

    var logoutPageVM = MvvmJS.Class.define(function (startLogout, dependencies) {
        updateDependencies(dependencies || {});
        this._init(startLogout);
    }, {
        _init: function (startLogout) {
            if (startLogout) {
                this._saveData();
                Skype.LoginManager.startForcedOffline();
                this.infoPanelTitle = "logout_title_signedout".translate();
            } else {
                this._loadData();
                this.infoPanelTitle = "logout_title_welcomeback".translate(this.name);
            }

            this.footNoteBody = "logout_footnote_body".translate(HOW_TO_LINK);
        },

        login: function () {
            this._clearData();
            Skype.LoginManager.endForcedOffline();
        },

        _getLocalSettingsValue: function () {
            return Windows.Storage.ApplicationData.current.localSettings.values;
        },

        _getEmailAsync: function () {
            return new WinJS.Promise(function (c) {
                Skype.LoginManager.userEmail().done(function (email) {
                    c(email);
                }, function (e) {
                    log("logoutPageVM: unable to get user email (error = {0})".format(e));
                    c("");
                });
            });
        },

        _saveData: function () {
            var values = this._getLocalSettingsValue();

            if (lib && lib.myself) {
                this.avatar = Skype.Model.AvatarUpdater.instance.getAvatarURI(lib.myIdentity);
                this.name = lib.myself.getDisplayNameHtml();
                values[OFFLINE_NAME_KEY] = this.name;
                values[OFFLINE_AVATAR_URI_KEY] = this.avatar;
            } else {
                warn("logoutPageVM: lib null or not logged in");
            }

            var that = this;
            this._getEmailAsync().done(function (email) {
                that.email = email;
                values[OFFLINE_EMAIL_KEY] = that.email;
            });
        },

        _loadData: function () {
            var values = this._getLocalSettingsValue();
            this.name = values[OFFLINE_NAME_KEY];
            this.avatar = values[OFFLINE_AVATAR_URI_KEY];
            this.email = values[OFFLINE_EMAIL_KEY];
        },

        _clearData: function() {
            var values = this._getLocalSettingsValue();
            values.remove(OFFLINE_NAME_KEY);
            values.remove(OFFLINE_AVATAR_URI_KEY);
            values.remove(OFFLINE_EMAIL_KEY);
        },
    }, {
        name: "",
        email: "",
        avatar: "",
        footNoteBody: "",
        infoPanelTitle: "",
    });

    
    var lib, Windows, LibWrap, Skype = global.Skype;

    function updateDependencies(dependencies) {
        lib = dependencies.lib || global.lib;
        Windows = dependencies.Windows || global.Windows;
        LibWrap = dependencies.LibWrap || global.LibWrap;
        Skype = dependencies.Skype || global.Skype;
    }

    WinJS.Namespace.define("Skype.ViewModel", {
        LogoutPageVM: WinJS.Class.mix(logoutPageVM, Skype.Class.disposableMixin)
    });
}(this));