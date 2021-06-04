/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='appconfig.js' />
(function () {
    "use strict";

    // private static members
    var COMMAND_HREF = "/shell/html/configuration.html";
    var CONFIG_DIV = "configSettingsDiv";
    var CONFIG_DIV_SELECTOR = "#" + CONFIG_DIV;
    var ENV_BUTTON_SELECTOR = CONFIG_DIV_SELECTOR + " .env button";
    var QUERY_STRING_BUTTON_SELECTOR = CONFIG_DIV_SELECTOR + " .querystring button";
    var OPTIONS_BUTTON_SELECTOR = CONFIG_DIV_SELECTOR + " .options button";
    var ENV_IN_USE_SELECTOR = "#envInUse";
    var PARAMS_IN_USE_SELECTOR = "#paramsInUse";
    var localSettings = Windows.Storage.ApplicationData.current.localSettings;

    function configSettingsHandler(event) {
        /// <summary>
        /// Initializes the elements of the configuration page before it shows.
        /// </summary>
        /// <param name="event">
        /// The beforeshow event.
        /// </param>
        var i;
        var length;
        var envButtons = document.querySelectorAll(ENV_BUTTON_SELECTOR);
        length = envButtons.length;
        for (i = 0; i < length; i++) {
            envButtons[i].addEventListener("MSPointerDown", envButtonHandler, false);
        }

        var querystringButtons = document.querySelectorAll(QUERY_STRING_BUTTON_SELECTOR);
        length = querystringButtons.length;
        for (i = 0; i < length; i++) {
            querystringButtons[i].addEventListener("MSPointerDown", querystringButtonHandler, false);
        }

        var optionsButtons = document.querySelectorAll(OPTIONS_BUTTON_SELECTOR);
        length = optionsButtons.length;
        for (i = 0; i < length; i++) {
            optionsButtons[i].addEventListener("MSPointerDown", optionsButtonHandler, false);
        }

        showEnv();
        showRequestParameters();
    }

    function showEnv() {
        /// <summary>
        /// Displays the current environment in the configuration page.
        /// </summary>
        var envLabel = document.querySelector(ENV_IN_USE_SELECTOR);
        if (envLabel) {
            envLabel.innerText = BingApp.locator.env.host;
        }
    }

    function showRequestParameters() {
        /// <summary>
        /// Displays the current query string parameters in the configuration page.
        /// </summary>
        var queryParamsLabel = document.querySelector(PARAMS_IN_USE_SELECTOR);
        if (queryParamsLabel) {
            var queryParamsAsText;
            try {
                queryParamsAsText = JSON.stringify(BingApp.locator.env.requestParameters);
            } catch (e) {
                BingApp.traceError("ConfigurationSettings.showRequestParameters: failed to convert request parameters to string for visualization purposes: '{0}'.", e.message);
                queryParamsAsText = "Failed to stringify"; // It is okay that it is not localized; this is used in test builds only
            }
            queryParamsLabel.innerText = queryParamsAsText;
        }
    }

    function refreshView() {
        /// <summary>
        /// Refreshes the current application UI.
        /// </summary>
        BingApp.locator.navigationManager.refresh();
        var mainView = BingApp.locator.viewManager.findLoadedView("mainview");
        if (mainView) {
            mainView.getController().getSearchBar().refresh();
        }
    }

    function envButtonHandler(event) {
        /// <summary>
        /// Handles environment buttons when clicked on.
        /// </summary>
        /// <param name="event">
        /// The event.
        /// </param>
        var envButton = event.target;
        var env = envButton.getAttribute("data-env");
        var envref = envButton.getAttribute("data-envref");

        if (envref) {
            env = document.querySelector(envref);
            env = env && env.value;
        }

        if (env && env.indexOf("http://") !== 0) {
            env = "http://" + env;
        }
        // override the config settings automatically to disable application of server driven configuration
        // Since configuration pane is itself a test hook, this overrides the config for any changes made from this pane
        localSettings.values[BingApp.Classes.AppConfiguration.APPLY_CONFIG_FLAG] = false;
        BingApp.locator.env.setHost(env);
        showEnv();
        refreshView();
    }

    function querystringButtonHandler(event) {
        /// <summary>
        /// Handles query string parameter buttons when clicked on.
        /// </summary>
        /// <param name="event">
        /// The event.
        /// </param>
        var paramButton = event.target;
        var paramName = paramButton.getAttribute("data-paramname");
        var paramValue = paramButton.getAttribute("data-paramvalue");
        var paramNameRef = paramButton.getAttribute("data-paramnameref");
        var paramValueRef = paramButton.getAttribute("data-paramvalueref");

        if (paramNameRef) {
            paramName = document.querySelector(paramNameRef);
            paramName = paramName && paramName.value;
        }
        if (paramValueRef) {
            paramValue = document.querySelector(paramValueRef);
            paramValue = paramValue && paramValue.value;
        }
        BingApp.locator.env.setRequestParameter(paramName, paramValue);
        showRequestParameters();
        refreshView();
    }

    function optionsButtonHandler(event) {
        /// <summary>
        /// Handles options parameter buttons when clicked on.
        /// </summary>
        /// <param name="event">
        /// The event.
        /// </param>
        var paramButton = event.target;
        var paramName = paramButton.getAttribute("data-paramname");
        var paramValue = paramButton.getAttribute("data-paramvalue");

        switch (paramName) {
            case "perf":
                BingApp.locator.env.setRequestParameter(paramName, paramValue);
                break;
            case "uncrunched":
                BingApp.locator.env.setRequestParameter(paramName, paramValue);
                break;
            case "reset":
                BingApp.locator.env.reset();
                break;
        }
        showEnv();
        showRequestParameters();
        refreshView();
    }

    WinJS.UI.Pages.define(COMMAND_HREF, {
        ready: configSettingsHandler
    });
})();