

(function () {
    "use strict";

    var SearchBoxPanel = Skype.UI.Control.define(function () {
        
        this.init();
    }, {
        
        _initPromise: null,
        _searchObserver: null,

        init: function () {
            this._initPromise = WinJS.UI.Fragments.render("/controls/searchBoxPanel.html", this.element)
                .then(WinJS.UI.processAll.bind(null, this.element))
                .then(WinJS.Resources.processAll.bind(null, this.element))
                .then(WinJS.Binding.processAll.bind(null, this.element, Skype.Application.state.search))
                .then(this._onReadyAsync.bind(this));
        },

        _onReadyAsync: function () {
            this._searchBox = this.element.querySelector(".searchBox").winControl;
            this._searchBox.placeholderText = "";
            this._searchBoxInput = this._searchBox.element.querySelector(".win-searchbox-input");
            this._searchBoxInput.maxLength = 100;

            this.regEventListener(Skype.Application.state, "navigated", this._onNavigated.bind(this));
            this._onNavigated();
            
            this.regEventListener(this.element.querySelector("button.backbutton"), "click", this._backLinkClick.bind(this));

            this.regEventListener(this._searchBox, "querysubmitted", this._handleQuerySubmitted.bind(this));
            this.regEventListener(this._searchBox, "receivingfocusonkeyboardinput", this._handleReceivingFocusonKeyboardInput.bind(this));
        },


        _onNavigated: function () {
            var cameToSearchScreen = Skype.Application.state.page.name === "search";
            if (cameToSearchScreen) {
                this._show();
            } else {
                this._hide();
            }
        },

        _handleQuerySubmitted: function (args) {
            this.regImmediate(function () {
                this._searchObserver && this._searchObserver.search(args.detail.queryText.trim());
                this._searchBoxInput.focus();
            }.bind(this));
        },

        _handleReceivingFocusonKeyboardInput: function (args) {
            
            

            this._show();

            if (Skype.Application.state.page.name !== "search") {
                Skype.UI.navigate("search", { reset: true, typeToSearch: true });
            }
        },

        _backLinkClick: function (e) {
            Skype.UI.navigateBack();
        },
        
        _hide: function () {
            WinJS.Utilities.removeClass(this.element, 'VISIBLE');
            this.setQueryText("");
        },

        _show: function () {
            if (!WinJS.Utilities.hasClass(this.element, "VISIBLE")) {
                WinJS.Utilities.addClass(this.element, 'VISIBLE');
                this._searchBoxInput.focus();
            }
        },

        setQueryText: function(text) {
            this._searchBox.queryText = text;
        },
        
        setPlaceholder: function (text) {
            if (this._searchBox) {
                this._searchBox.placeholderText = text.translate();
            } 
        },
        
        subscribe: function (searchObserver) {
            
            
            
            
            
            
            this._searchObserver = searchObserver;
        },
        
        unsubscribe: function() {
            this._searchObserver = null;
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        SearchBoxPanel: SearchBoxPanel
    });
})();
