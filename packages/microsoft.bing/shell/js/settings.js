/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='eventrelay.js' />
/// <reference path='servicelocator.js' />
/// <reference path='../../common/js/errors.js' />
(function () {
    "use strict";

    var SAFE_SEARCH_DIV = "safeSearchSettingsDiv";
    var SAFE_SEARCH_PATH = "/shell/html/safesearch.html";
    var SAFE_SEARCH_EVENT = "showSafeSearchSettings";

    function init(app, eventRelay) {
        /// <summary>
        /// Initializes handling of settings UI.
        /// </summary>
        /// <param name="app">
        /// Application object.
        /// </param>
        /// <param name="eventRelay" type="BingApp.Classes.EventRelay">
        /// Event relay for handling events.
        /// </param>
        if (!app) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("app");
        }

        app.onsettings = onSettings;

        eventRelay = eventRelay || BingApp.locator.eventRelay;
        eventRelay.addEventListener(SAFE_SEARCH_EVENT, onShowSafeSearch);

        var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
        settingsPane.oncommandsrequested = onCommandsRequested;
    }

    function onSettings(e) {
        /// <summary>
        /// onSettings is invoked when the user clicks the settings charm.  It
        /// sets up the links on the settings UI that navigate to other pages,
        /// in contrast to onCommandsRequested which sets links that execute code.
        /// </summary>
        /// <param name="e" type="object">Event that must be passed to populateSettings</param>
        var env = BingApp.locator.env;
        var commands = {};

        commands[SAFE_SEARCH_DIV] = {
            title: WinJS.Resources.getString("settings_safesearch_title").value,
            href: SAFE_SEARCH_PATH
        };

        commands["searchHistorySettingsDiv"] = {
            title: WinJS.Resources.getString("settings_searchhistory_title").value,
            href: "/shell/html/searchhistory.html"
        }

        var showconfigUI = env.configuration["showconfigUI"];
        if (showconfigUI) {
            commands["configSettingsDiv"] = {
                title: WinJS.Resources.getString("settings_configuration_title").value,
                href: "/shell/html/configuration.html"
            }
        }

        e.detail.applicationcommands = commands;
        WinJS.UI.SettingsFlyout.populateSettings(e);
    }

    function onCommandsRequested(e) {
        /// <summary>
        /// Called after onSettings.  This function sets up commands which execute
        /// code rather than loading new UI like onSettings.
        /// </summary>
        /// <param name="e" type="object">Containst the list of existing commands setup by onSettings</param>
        var mktstrings = new Windows.ApplicationModel.Resources.ResourceLoader("market");
        var appSettings = Windows.UI.ApplicationSettings;
        var commands = e.request.applicationCommands;

        var privacy = new appSettings.SettingsCommand("privacy",
            WinJS.Resources.getString("settings_link_privacy").value,
            function () { openLink(mktstrings.getString("TOU_PRIVACY_STATEMENT_URL")); });
        commands.append(privacy);

        var terms = new appSettings.SettingsCommand("terms",
            WinJS.Resources.getString("settings_link_tou").value,
            function () { openLink(mktstrings.getString("TOU_SERVICE_AGREEMENT_URL")); });
        commands.append(terms);

        var feedback = new appSettings.SettingsCommand("feedback",
            WinJS.Resources.getString("Seetings_feedback").value,
            function () { openLink(mktstrings.getString("FEEDBACK_URL")); });
        commands.append(feedback);

        if (BingApp.Utilities.areEqualIgnoreCase(mktstrings.getString("IMPRESSUM_FLAG"),"on")) {
            var impressum = new appSettings.SettingsCommand("impressum",
                WinJS.Resources.getString("settings_link_impressum").value,
                function () { openLink(mktstrings.getString("IMPRESSUM_LINK")); });

            commands.append(impressum);
        }
        
        // icp is now based on location only. If the user is in China then we
        // display the text nomatter what the selected language.
        if (BingApp.locator.env.isICPEnabled()) {
            var icp = new appSettings.SettingsCommand("icp",
                WinJS.Resources.getString("internet_content_provider").value,
                function () {
                    // noimplementation 
                });

            commands.append(icp);
        }
    }

    function onShowSafeSearch() {
        /// <summary>
        /// Inovked through the relay by the web compartment to change safe
        /// search settings
        /// </summary>
        WinJS.UI.SettingsFlyout.showSettings(SAFE_SEARCH_DIV, SAFE_SEARCH_PATH);
    }

    function openLink(link) {
        var uri = new Windows.Foundation.Uri(link);
        Windows.System.Launcher.launchUriAsync(uri);
    }

    WinJS.Namespace.define("BingApp.Settings", {
        init: init
    });
})();