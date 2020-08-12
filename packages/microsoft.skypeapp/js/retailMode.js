

(function () {
    "use strict";

    var runningInRetailMode = false;
    var localSettingKeyName = "retailMode";
    var retailModeLaunchArg = "RetailExperience";

    var _retailVideoTag;

    function init() {
        runningInRetailMode = Windows.Storage.ApplicationData.current.localSettings.values[localSettingKeyName];
        
    }

    function onCanPlay() {
        window.msWriteProfilerMark("Offline content loaded");
    }

    function onError(e) {
        window.msWriteProfilerMark("Offline content caused error: " + e.target.error.code);
    }

    function updateLanguage() {
        var body = document.body;
        WinJS.Resources.processAll(body);
        Skype.Application.state.uiLanguage = Skype.Globalization.getCurrentLanguage();
        Skype.Application.state.isRTL ? WinJS.Utilities.addClass(body, 'RTL') : WinJS.Utilities.removeClass(body, 'RTL');
    }

    function loadedHandler(e) {
        log("RetailMode: loadedHandler");
        var container = document.querySelector("section.navigationContainer");
        WinJS.UI.Pages.render("/pages/retailMode.html", container).then(function () {
            _retailVideoTag = document.getElementById("retailMovie");
            _retailVideoTag.addEventListener("canplay", onCanPlay, false);
            _retailVideoTag.addEventListener("error", onError, false);
            WinJS.Resources.addEventListener("contextchanged", updateLanguage);
            updateLanguage();
        });
        Skype.SettingsManager.instance.init();
    }

    function resumingHandler(e) {
        log('RetailMode: resuming app');
        if (_retailVideoTag) {
            _retailVideoTag.currentTime = 0;
            _retailVideoTag.play();
        }
    }

    function bootstrap() {
        window.msWriteProfilerMark("Running in Retail Experience Mode");
        window.addEventListener("load", loadedHandler, false);
        Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", resumingHandler, false);
        WinJS.Application.start();
    }

    function enabled() {
        return runningInRetailMode;
    }

    function saveRetailModeFlag() {
        Windows.Storage.ApplicationData.current.localSettings.values[localSettingKeyName] = true;
    }

    WinJS.Namespace.define("Skype.RetailMode", {
        init: init,
        enabled: enabled,
        bootstrap: bootstrap,
        retailModeLaunchArg: retailModeLaunchArg,
        saveRetailModeFlag: saveRetailModeFlag
    });
})();