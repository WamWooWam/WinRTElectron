

(function () {
    "use strict";

    var currentPage;
    var supportedPages = {
        "hub": true,
        "allHistory": true,
        "contacts": true,
        "search": true
    };

    var searchProvider = MvvmJS.Class.define(function () {
    }, {
        
        alive: function () {
            this.regEventListener(document, "activate", this._handleActiveElementChanged.bind(this));
            this.regBind(Skype.Application.state, "isApplicationActive", this._handleAppFocused.bind(this));
            this.regBind(Skype.Application.state, "page", this._handleCurrentPageChanged.bind(this));
        },

        _canActivateByCurrentPage: function canActivateByCurrentPage() {
            return currentPage && supportedPages[currentPage];
        },
        _canActivateByCurrentElement: function canActivateByCurrentElement() {
            var actElement = document.activeElement;
            var tag = actElement && actElement.tagName;
            if (tag === 'INPUT' || tag === "TEXTAREA" || tag === "SELECT") {
                return false;
            } else {
                return true;
            }
        },
        _handleActiveElementChanged: function handleActiveElementChanged() {
            this._evaluate();
        },
        _handleAppFocused: function handleAppFocused() {
            this._evaluate();
        },
        _handleCurrentPageChanged: function handleCurrentPageChanged(page) {
            currentPage = page.name;
            this._evaluate();
        },

        _evaluate: function evaluate() {
            var enableSearch = this._canActivateByCurrentElement() && this._canActivateByCurrentPage() && !Skype.Application.state.isPeoplePickerOpened && !Skype.Application.state.isMePanelOpened;
            Skype.Application.state.search.typeToSearchEnabled = !!enableSearch;
        }

    }, {
        

    });



    WinJS.Namespace.define("Skype.Application", {
        SearchProvider: searchProvider


    });
})();
