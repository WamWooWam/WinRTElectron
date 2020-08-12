

(function () {
    "use strict";

    var appBarHint = Skype.UI.Control.define(function (element, options) {
        this.element = element;
        this.init();
        Skype.UI.AppBarHint.instance = this;
    }, {
        init: function () {
            return WinJS.UI.Fragments.render("/controls/appBarHint.html", this.element).then(this.ready.bind(this));
        },
        ready: function () {
            this.regEventListener(this.element, "click", this.showAppBar.bind(this));
        },
        showAppBar: function () {
            Skype.UI.AppBar.instance && Skype.UI.AppBar.instance.show();
        }
    }, {
        instance: null,
        setHintInConversation: function (disable) {
            Skype.UI.Util.setClass(document.body, "appBarHintDisabled", disable);
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        AppBarHint: appBarHint
    });

})();