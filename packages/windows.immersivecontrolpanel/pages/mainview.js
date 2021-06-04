(function () {
    var PageConstructor = WinJS.UI.Pages.define("/pages/mainview.html", {
        // This function is called after the page control contents
        // have been loaded, controls have been activated, and
        // the resulting elements have been parented to the DOM.
        ready: function (element, options) {
        },
    });
    
    WinJS.Namespace.define("ImmersiveControlPanel.Pages", {
        MainView: PageConstructor
    });
})();