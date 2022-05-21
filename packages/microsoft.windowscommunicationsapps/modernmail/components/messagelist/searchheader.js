
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,WinJS,Jx,Debug*/

Jx.delayDefine(Mail, "SearchHeader", function () {
    "use strict";

    Mail.SearchHeader = function (selection, animator) {
        _markStart("Ctor");
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));

        this._selection = selection;
        this._animator = animator;

        // UI elements
        this._searchHeader = document.getElementById("mailMessageListSearchHeader");
        this._messageListElement = document.getElementById("messageList");
        this._filterHeader = document.getElementById("mailMessageListFilterHeader");

        // Start/dismiss buttons
        var startSearchButton = this._startSearchButton = document.getElementById("mailMessageListStartSearch");
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(this._searchHeader,  "focusout",     this._onFocusOut,             this, false /*capture*/),
            new Mail.EventHook(startSearchButton,   "click",        this._onStartSearchInvoked,   this, false /*capture*/),
            // We care about the current View since the first item in the Search Scope dropdown displays the current View's name
            new Mail.EventHook(selection,           "navChanged",   this._onViewChanged,          this)
        );

        this._enterSearchAnimation = null;
        this._exitSearchAnimation = null;

        this._scopeSwitcher = null; // The scope combo box
        this._box = null; // WinJS Search control
        this._inputElement = null; // The <input> element of the WinJS Search control
        this._createSearchBox();
        this._updateScopeSwitcher();

        this._isVisible = false;
        this._hasIssuedQuery = false;

        this._scopeChangedEventHook = null;
        _markStop("Ctor");
    };

    Jx.augment(Mail.SearchHeader, Jx.Events);

    var MSProto = Mail.SearchHeader.prototype;
    Debug.Events.define(MSProto, "startSearchInvoked", "dismissSearchInvoked", "querySubmitted", "scopeChanged");

    MSProto.dispose = function () {
        _markStart("dispose");
        this._cancelAnimations();

        this._hasIssuedQuery = false;
        Jx.dispose(this._scopeChangedEventHook);

        this._disposer.dispose();
        _markStop("dispose");
    };

    // Public methods

    MSProto.show = function (animate) {
        if (this._isVisible) {
            return;
        }
        _markStart("show");

        this._hasIssuedQuery = false;
        this._isVisible = true;

        // adjust the search history to scope to the current account
        this._box.searchHistoryContext = this._selection.account.objectId;
        this._scopeSwitcher.rescopeToCurrentView();

        this._cancelAnimations();
        this._showHeader(animate);
        _markStop("show");
    };

    MSProto._showHeader = function (animate) {
        // We may have explicitly hidden the <input> as the workaround for WinBlue 369747 (to hide the caret) - undo it.
        this._inputElement.style.display = "inherit";

        if (animate) {
            this._enterSearchAnimation = this._animator.shortFadeOut(this._filterHeader).then(function () {
                this._messageListElement.classList.add("searchMode");
                Mail.setActiveHTMLElement(this._inputElement);
                return this._animator.shortFadeIn(this._searchHeader);
            }.bind(this)).then(function () {
                this._filterHeader.style.removeAttribute("opacity");
                this._enterSearchAnimation = null;
            }.bind(this));
        } else {
            this._searchHeader.style.removeAttribute("opacity");
            this._messageListElement.classList.add("searchMode");
        }
    };

    MSProto.hide = function () {
        if (!this._isVisible) {
            return;
        }
        _markStart("hide");
        this._isVisible = false;
        if (!this._hasIssuedQuery) {
            this._exitSearchWithAnimation();
        } else {
            // if we have already issued the query, exiting search would imply refreshing the message list
            // there is no need to animate
            this._exitSearchWithoutAnimation();
        }
        _markStop("hide");
    };

    Object.defineProperty(MSProto, "scope", {
        get: function () {
            return this._scopeSwitcher.current;
        },
        enumerable: true
    });

    Object.defineProperty(MSProto, "scopeSwitcher", {
        get: function () {
            return this._scopeSwitcher;
        },
        enumerable: true
    });

    // Private methods

    MSProto._addTooltips = function (startSearchButton, dismissSearchButton) {
        var commandManager = Mail.Globals.commandManager,
            startSearchCommand = commandManager.getCommand("enterSearch"),
            dismissSearchCommand = commandManager.getCommand("dismissSearch");
        startSearchButton.setAttribute("title", startSearchCommand.tooltip);
        dismissSearchButton.setAttribute("title", dismissSearchCommand.tooltip);
    };

    MSProto._cancelAnimations = function () {
        if (this._enterSearchAnimation) {
            this._enterSearchAnimation.cancel();
            this._enterSearchAnimation = null;
        }

        if (this._exitSearchAnimation) {
            this._exitSearchAnimation.cancel();
            this._exitSearchAnimation = null;
        }
    };

    MSProto._resetElements = function () {
        this._messageListElement.classList.remove("searchMode");
        this._box.queryText = ""; // Clear out the query text

        // The <input> is hidden because its parent is hidden by the removal of the "searchMode" class.
        // However IE still renders the caret if we don't explicitly hide the <input> as well. See WinBlue:369747.
        this._inputElement.style.display = "none";
    };

    MSProto._exitSearchWithoutAnimation = function () {
        _markStart("_exitSearchWithoutAnimation");

        this._cancelAnimations();
        this._resetElements();

        _markStop("_exitSearchWithoutAnimation");
    };

    MSProto._exitSearchWithAnimation = function () {
        _markStart("_exitSearchWithAnimation");

        this._cancelAnimations();

        this._exitSearchAnimation = this._animator.shortFadeOut(this._searchHeader).then(function () {
            this._resetElements();
            return this._animator.shortFadeIn(this._filterHeader);
        }.bind(this)).then(function () {
            this._searchHeader.style.removeAttribute("opacity");
            this._exitSearchAnimation = null;
        }.bind(this)).then(function () {
            Mail.setActiveHTMLElement(this._startSearchButton);
            _markStop("_exitSearchWithAnimation");
        }.bind(this));
    };

    MSProto._updateScopeSwitcher = function () {
        _markStart("_updateScopeSwitcher");

        var host = document.getElementById("mailMessageListSearchScope");
        this._scopeSwitcher = this._disposer.replace(this._scopeSwitcher, new Mail.SearchScopeSwitcher(this._selection, host));
        Jx.dispose(this._scopeChangedEventHook);
        this._scopeChangedEventHook = new Mail.EventHook(this._scopeSwitcher, "changed", this._onScopeChanged, this);

        _markStop("_updateScopeSwitcher");
    };

    MSProto._createSearchBox = function () {
        _markStart("_createSearchBox");

        var searchBoxElement = document.getElementById("mailMessageListSearchBox");
        this._box = new WinJS.UI.SearchBox(
            searchBoxElement,
            {
                searchHistoryDisabled: false,
                chooseSuggestionOnEnterDisabled: false,
                // Separate the search history per account
                searchHistoryContext: this._selection.account.objectId
            }
        );

        // Grab the <input> tag so we can set focus on it when needed. We also need to capture the Escape keypress
        // when the focus is in the <input> tag since it is not captured by our Commanding system.
        this._inputElement = searchBoxElement.querySelector("input");
        this._typeToSearch = this._disposer.add(new Mail.TypeToSearch(this._box, document.getElementById("idCompApp")));
        var dismissSearchButton = document.getElementById("mailMessageListDismissSearch");

        // Hook events
        this._disposer.addMany(
            new Mail.EventHook(this._inputElement, "keypress", this._onTextBoxKeyPress, this),
            new Mail.EventHook(this._box, "querysubmitted", this._onQuerySubmitted, this),
            new Mail.EventHook(this._typeToSearch, "typetosearch", this._onTypeToSearch, this),
            new Mail.EventHook(dismissSearchButton, "click", this._onDismissSearchInvoked, this),
            Jx.scheduler.addJob(
                null, Mail.Priority.addSearchTooltips, "Add tooltips for search buttons",
                this._addTooltips, this, [this._startSearchButton, dismissSearchButton]
            )
        );

        _markStop("_createSearchBox");
    };

    MSProto._onFocusOut = function (ev) {
        var isSearchBoxEmpty = !this._hasIssuedQuery && !this._box.queryText,
            // When entering search via the keyboard shortcut, Trident sometimes fire an focus out event even when the focus is on the search box
            hasFocus = ev.relatedTarget && Mail.isElementOrDescendant(ev.relatedTarget, this._searchHeader);
        if (isSearchBoxEmpty && !hasFocus && !this._scopeSwitcher.hasFocus()) {
            this._onDismissSearchInvoked();
        }
    };

    MSProto._onStartSearchInvoked = function () {
        this.raiseEvent("startSearchInvoked", { invokeType : "startSearchButton" });
    };

    MSProto._onDismissSearchInvoked = function () {
        this.raiseEvent("dismissSearchInvoked");
    };

    MSProto._onQuerySubmitted = function (event) {
        _markStart("_onQuerySubmitted");
        var detail = event.detail,
            queryText = detail.queryText.trim();
        if (Jx.isNonEmptyString(queryText)) {
            this._hasIssuedQuery = true;
            this.raiseEvent("querySubmitted", { queryText: queryText, language: detail.language });
        }
        _markStop("_onQuerySubmitted");
    };

    MSProto._onTypeToSearch = function () {
        if (!this._isVisible) {
            this.raiseEvent("startSearchInvoked", { invokeType: "typeToSearch" });
        }
    };

    MSProto._onScopeChanged = function (evt) {
        this.raiseEvent("scopeChanged", evt);
    };

    MSProto._onTextBoxKeyPress = function (event) {
        if ((event.keyCode === Jx.KeyCode.escape) && !event.ctrlKey && !event.altKey && !event.shiftKey) {
            this._onDismissSearchInvoked();
        } else if (event.keyCode === Jx.KeyCode.enter) {
            // Prevent enter key from triggering other elements
            event.stopPropagation();
            event.preventDefault();
        }
    };

    MSProto._onViewChanged = function (event) {
        if (event.viewChanged) {
            var view = event.target.view;
            if (view) {
                this._updateScopeSwitcher();
            }
        }
    };

    // function _mark(s) { Jx.mark("SearchHeader:" + s); }
    function _markStart(s) { Jx.mark("SearchHeader." + s + ",StartTA,SearchHeader"); }
    function _markStop(s) { Jx.mark("SearchHeader." + s + ",StopTA,SearchHeader"); }
});
