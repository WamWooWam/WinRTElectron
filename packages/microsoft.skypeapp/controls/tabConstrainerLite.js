



(function () {
    "use strict";

    var tabConstrainerLite = Skype.UI.Control.define(function (element, options) {
        this.init();
    }, {
        _page: null,
        _startElement: null,
        init: function () {
            this._page = document.querySelector("div.page");
            if (this.options.startElementQuery) {
                this._startElement = this.element.querySelector(this.options.startElementQuery);
            };
        },
        enable: function () {
            WinJS.Utilities.addClass(document.body, "SUPPRESSPAGENAVIGATION");
            this._page.style.visibility = "hidden";
            this.element.style.visibility = "visible";
            this._startElement && this._startElement.focus();
        },
        disable: function () {
            WinJS.Utilities.removeClass(document.body, "SUPPRESSPAGENAVIGATION");
            this._page.style.visibility = "visible";
            this.element.style.visibility = "hidden";
        }
    });

    tabConstrainerLite.isDeclarativeControlContainer = false;

    WinJS.Namespace.define("Skype.UI", {
        TabConstrainerLite: tabConstrainerLite
    });

})();