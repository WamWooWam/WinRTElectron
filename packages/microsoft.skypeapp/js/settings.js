

(function () {
    'use strict';

    var aboutItem, optionsItem, helpItem, profileItem, feedbackItem;

    var settingsManager = WinJS.Class.define(function () {
    }, {
        _onCommandsRequested: function (event) {
            if (Skype.Application.state.page.defaultFocusElement) { 
                Skype.Application.state.page.defaultFocusElement.focus();
            }

            var items;
            if (Skype.RetailMode.enabled()) {
                items = [aboutItem];
            } else if (lib && lib.myself) {
                items = [profileItem, optionsItem, helpItem, aboutItem];
            } else {
                items = [helpItem, aboutItem];
            }

            if (Skype && Skype.Debug && !Skype.RetailMode.enabled()) {
                items.push(feedbackItem);
            }

            items.forEach(function (item) {
                var caption = item.caption ? item.caption : item.key.translate();
                var command = new Windows.UI.ApplicationSettings.SettingsCommand(item.id, caption, item.handler);
                event.request.applicationCommands.append(command);
            });

            Skype.UI.Util.sendEvent('settingsOpened', document);  
        },

        _onAbout: function (event) {
            Skype.UI.About.run();
        },

        _onOptions: function (event) {
            WinJS.UI.SettingsFlyout.showSettings("options", "/pages/options.html");
        },

        _onHelp: function (event) {
            Skype.UI.Help.run();
        },

        _onProfile: function (event) {
            if (WinJS.Utilities.hasClass(document.body, "PICKERACTIVE")) {
                document.querySelector("div.peoplePicker").winControl.hide();
            }
            Skype.UI.MePanel.show(true);
        },

        _onFeedback: function (event) {
            Skype.Feedback.launch();
        },

        init: function () {
            Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView().addEventListener("commandsrequested", this._onCommandsRequested);

            aboutItem = { id: "about", key: "settings_about", handler: this._onAbout };
            optionsItem = { id: "options", key: "options", handler: this._onOptions };
            helpItem = { id: "help", key: "settings_help", handler: this._onHelp };
            profileItem = { id: "profile", key: "settings_profile", handler: this._onProfile };
            feedbackItem = { id: "feedback", key: "", caption: "Give Feedback", handler: this._onFeedback };
        }
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.SettingsManager();
                }
                return instance;
            }
        },
    });

    var instance;

    WinJS.Namespace.define("Skype", {
        SettingsManager: settingsManager
    });
})();