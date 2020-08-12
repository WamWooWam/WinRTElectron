

(function (Skype) {
    "use strict";
    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.UI.Conversation.TypingIndicator");

    var typingIndicator = Skype.UI.Control.define(function (element, options) {
        this._element = element;
    }, {
        _element: null,
        _container: null,

        
        isVisible: false,

        _onReady: function () {
            this._container = this._element.firstElementChild;
            this.elmWriters = this._container.querySelector("span.text");
        },

        render: function () {
            assert(!this._initPromise, "You tried to render typing indicator multiple times !");

            this._initPromise = WinJS.UI.Fragments.renderCopy("/controls/conversation/typingIndicator.html", this._element)
                .then(this._onReady.bind(this));

            return this._initPromise;
        },

        
        update: function (writers) {
            if (!this._container) {
                this._initPromise.then(this.update.bind(this, writers));
                return;
            }

            var hasWriters = writers.length > 0;
            
            if (hasWriters) {
                WinJS.Utilities.setInnerHTML(this.elmWriters, writers.join(", ") + "&hellip;");
            }
            Skype.UI.Util.setClass(this._container, "POPULATED", hasWriters);
        },

        show: function () {
            this.isVisible = true;
            if (this._container) {
                WinJS.Utilities.addClass(this._container, "VISIBLE");
            }
        },

        hide: function () {
            this.isVisible = false;
            if (this._container) {
                WinJS.Utilities.removeClass(this._container, "VISIBLE");
            }
        },

    });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        TypingIndicator: typingIndicator
    });

})(Skype);