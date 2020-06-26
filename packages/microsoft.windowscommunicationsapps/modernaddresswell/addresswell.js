Jx.delayDefine(window, "AddressWell", function() {
    function u(n) {
        return n === AddressWell.DropDownView.peopleSearchList || n === AddressWell.DropDownView.connectedAccountList || n === AddressWell.DropDownView.suggestionsList
    }
    function s() {}
    function r(n) {
        return Jx.isNonEmptyString(n.calculatedUIName) ? n.calculatedUIName : n.emailAddress
    }
    function o() {}
    var t, n;
    window.AddressWell = {
        badDomains: ";home.com;attbi.com;example.com;hotmail.co;yaho.com;hotmai.com;yahoo.co;yahoomail.com;direcway.com;homail.com;ims-ms-daemon;local.transport;ethome.net.tw;ethome.net.tw;hotmil.com;hotmial.com;yhoo.com;collegeclub.com;sbcglobal.com;hotamil.com;yaoo.com;yahoo.net;yhaoo.com;mail.hotmail.com;passport.com;kimo.com.tw;yahooo.com;yahho.com;ol.com;gateway.net;hotmail.com.mx;otmail.com;htomail.com;aol.co;altavista.com;hotmaill.com;taiwan.com;hotmail.con;ahoo.com;hotmail.om;hotmail.net;hormail.com;hotail.com;hotamail.com;yahoo.om;homtail.com;msn.net;sprint.ca;angelfire.com;cm1.ethome.net.tw;yohoo.com;a0l.com;alo.com;msn.de;gmail.co;",
        dropDownSearchLinkPrefix: "sl",
        dropDownVisibleAttr: "dropDownVisible",
        firstDropDownItemId: "firstDropDownItemId",
        emailPattern: /[a-z0-9!#$%&'*+/=?^_`"{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`"{|}~-]+)*@((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[.+\])/i,
        highlightAreaAttr: "highlightArea",
        highlightIdAttr: "highlightId",
        imeInUseKeyCode: 229,
        maxSearchCounter: 1e3,
        maxSearchDuration: 6e4,
        maxChildrenLayer: 6,
        maxConnectedAccountSearchResults: 100,
        maxInputLength: 512,
        maxInputPaneShowing: 800,
        maxStringLength: 32768,
        maxWordWheelContacts: 10,
        maxSuggestions: 5,
        minProgressDuration: 500,
        pagingHeightForRecipients: 160,
        stringsPrefix: "/AddressWellStrings/",
        separatorRegExp: /[;,\n\r\u061b]+/,
        delimiterRegExp: /["<>;,\n\r\u061b]+/,
        colorCssId: "awColorCss",
        dropDownBorderWidthOffset: -2,
        dropdownToContainerWidthPercentage: .85
    };
    Object.defineProperties(AddressWell, {
        selectionBiciId: {
            get: function() {
                var n = Microsoft.WindowsLive.Instrumentation.Ids.Mail.addressWellSelectionMade;
                return Object.defineProperty(AddressWell, "selectionBiciId", {
                    get: function() {
                        return n
                    }
                }),
                n
            },
            enumerable: true,
            configurable: true
        }
    });
    Object.defineProperties(AddressWell, {
        addressWellSuggestionRank: {
            get: function() {
                var n = Microsoft.WindowsLive.Instrumentation.Ids.Mail.addressWellSuggestionRank;
                return Object.defineProperty(AddressWell, "addressWellSuggestionRank", {
                    get: function() {
                        return n
                    }
                }),
                n
            },
            enumerable: true,
            configurable: true
        }
    });
    AddressWell.Events = {
        blur: "blur",
        compositionstart: "compositionstart",
        compositionend: "compositionend",
        contextmenu: "contextmenu",
        focus: "focus",
        input: "input",
        keydown: "keydown",
        keyup: "keyup",
        msGestureTap: "click",
        msPointerDown: "MSPointerDown",
        msPointerUp: "MSPointerUp",
        msPointerOut: "MSPointerOut",
        msPointerCancel: "MSPointerCancel",
        paste: "paste",
        resize: "resize",
        addPeopleFromPicker: "addPeopleFromPicker",
        addressWellBlur: "addressWellBlur",
        addressWellCompleteKey: "addressWellCompleteKey",
        addressWellEscapeKey: "addressWellEscapeKey",
        addressWellInitialize: "addressWellInitialize",
        addressWellTabKey: "addressWellTabKey",
        addPerson: "addPerson",
        arrowKey: "arrowKey",
        recipientsSelected: "recipientsSelected",
        dropDownKeyDown: "dropDownKeyDown",
        hasRecipientsChanged: "hasRecipientsChanged",
        pageKey: "pageKey",
        removePerson: "removePerson",
        scrollIntoView: "scrollIntoView",
        searchFirstConnectedAccount: "searchFirstConnectedAccount",
        searchLinkSelected: "searchLinkSelected",
        userInputChanged: "userInputChanged",
        beforeRecipientsAdded: "beforeRecipientsAdded",
        recipientsAdded: "recipientsAdded",
        recipientRemoved: "recipientRemoved",
        viewProfile: "viewProfile",
        autoResolve: "autoResolve",
        autoResolveSuccessful: "autoResolveSuccessful",
        showingContextMenu: "showingContextMenu",
        dropDownButtonClick: "dropDownButtonClick",
        selectAllItems: "selectAllItems",
        dropDownReady: "dropDownReady",
        inputOffsetAdjusted: "inputOffsetAdjusted",
        imeWindowHeightUpdated: "imeWindowHeightUpdated"
    };
    AddressWell.RecipientEvents = {
        deleted: "deleted",
        stateChanged: "stateChanged"
    };
    AddressWell.Key = {
        arrowLeft: "Left",
        arrowRight: "Right",
        arrowUp: "Up",
        arrowDown: "Down",
        backspace: "Backspace",
        deleteKey: "Del",
        end: "End",
        enter: "Enter",
        escape: "Esc",
        f10: "F10",
        home: "Home",
        pageUp: "PageUp",
        pageDown: "PageDown",
        selection: "Apps",
        tab: "Tab",
        control: "Control",
        spacebar: "Spacebar",
        x: "x",
        c: "c",
        k: "k",
        y: "y",
        z: "z"
    };
    AddressWell.HighlightArea = {
        input: "input",
        dropDown: "dropDown"
    };
    AddressWell.DropDownView = {
        none: 0,
        peopleSearchList: 1,
        connectedAccountList: 2,
        suggestionsList: 3,
        text: 4,
        progress: 5
    };
    AddressWell.RecipientAddMethod = {
        tilesView: 0,
        wordWheel: 1,
        typing: 2,
        paste: 3,
        contextMenu: 4,
        preFilled: 5,
        peoplePicker: 6,
        galSearch: 7,
        suggestions: 8
    };
    AddressWell.ListViewSearchType = {
        people: 0,
        connectedAccount: 1
    };
    AddressWell.SearchErrorType = {
        none: 0,
        noResults: 1,
        connectionError: 2,
        serverError: 3,
        cancelled: 4
    };
    AddressWell.ContactSelectionMode = {
        emailContacts: "emailContacts",
        chatContacts: "chatContacts",
        roomContacts: "roomContacts"
    };
    AddressWell.RecipientState = {
        unresolved: 0,
        pendingResolution: 1,
        unresolvable: 2,
        invalid: 3,
        resolved: 4,
        deleted: 5
    };
    AddressWell.DropDownButtonType = {
        none: 0,
        roomsSelector: 2
    };
    AddressWell.SuggestionInvocationType = {
        implicit: 0,
        explicit: 1
    };
    AddressWell.InputMethod = {
        unknown: 0,
        keyboard: 1,
        mouseOrTouch: 2
    };
    AddressWell.getUserTile = function(n, t) {
        if (Jx.isNullOrUndefined(n))
            return null;
        try {
            return n.getUserTile(t, false)
        } catch (i) {
            return Jx.fault("AddressWell.AddressWellUtilities.js", "getUserTile", i),
            null
        }
    }
    ;
    AddressWell.getUserTileStream = function(n, t) {
        var i = AddressWell.getUserTile(n, t);
        if (!Jx.isNullOrUndefined(i))
            try {
                return i.stream
            } catch (r) {
                Jx.log.exception("Failed to execute 'userTile.stream'", r)
            }
        return null
    }
    ;
    AddressWell.scrollIntoContainer = function(n, t) {
        var i = n.scrollTop
          , u = n.offsetHeight
          , r = t.offsetTop
          , f = r + t.offsetHeight
          , e = r >= i && r <= i + u && f >= i && f <= i + u;
        e || (n.scrollTop = t.offsetTop)
    }
    ;
    AddressWell.performPointerAnimation = function(n) {
        Jx.isNullOrUndefined(n) || (WinJS.UI.Animation.pointerDown(n),
        AddressWell.currentPointerDownElement = n,
        n.addEventListener(AddressWell.Events.msPointerUp, AddressWell.resetPointerElement, false),
        n.addEventListener(AddressWell.Events.msPointerOut, AddressWell.resetPointerElement, false))
    }
    ;
    AddressWell.resetPointerElement = function() {
        Jx.isNullOrUndefined(AddressWell.currentPointerDownElement) || (WinJS.UI.Animation.pointerUp(AddressWell.currentPointerDownElement),
        AddressWell.currentPointerDownElement.removeEventListener(AddressWell.Events.msPointerUp, AddressWell.resetPointerElement, false),
        AddressWell.currentPointerDownElement.removeEventListener(AddressWell.Events.msPointerOut, AddressWell.resetPointerElement, false),
        AddressWell.currentPointerDownElement = null)
    }
    ;
    AddressWell.convertSearchErrorToString = function(n, t) {
        return n === AddressWell.SearchErrorType.noResults ? Jx.res.getString(AddressWell.stringsPrefix + "awSearchNoResults") : n === AddressWell.SearchErrorType.connectionError ? Jx.res.loadCompoundString(AddressWell.stringsPrefix + "awSearchConnectionError", t) : n === AddressWell.SearchErrorType.serverError ? Jx.res.loadCompoundString(AddressWell.stringsPrefix + "awSearchServerError", t) : ""
    }
    ;
    AddressWell.getUserTileUrl = function(n, t) {
        var r = ""
          , i = AddressWell.getUserTile(n, t);
        try {
            Jx.isNullOrUndefined(i) || Jx.isNullOrUndefined(i.appdataURI) || (r = i.appdataURI)
        } catch (u) {
            Jx.fault("AddressWell.AddressWellUtilities.js", "getUserTileUrlFromCache", u)
        }
        return r
    }
    ;
    AddressWell.currentPointerDownElement = null;
    AddressWell.Color = function(n, t, i) {
        var r;
        Jx.isNumber(t) && Jx.isNumber(i) ? (this._r = n,
        this._g = t,
        this._b = i) : (r = n,
        this._r = (r >> 16) % 256,
        this._g = (r >> 8) % 256,
        this._b = r % 256);
        var u = ("0" + this._r.toString(16)).substr(-2)
          , f = ("0" + this._g.toString(16)).substr(-2)
          , e = ("0" + this._b.toString(16)).substr(-2);
        this.stringValue = "#" + u + f + e
    }
    ;
    AddressWell.Color.prototype._r = 0;
    AddressWell.Color.prototype._g = 0;
    AddressWell.Color.prototype._b = 0;
    AddressWell.Color.prototype.stringValue = null;
    AddressWell.Color.combine = function(n, t, i, r) {
        var u = n._r * t
          , f = n._g * t
          , e = n._b * t;
        return Boolean(i) && Boolean(r) && (u += i._r * r,
        f += i._g * r,
        e += i._b * r),
        new AddressWell.Color(Math.floor(u),Math.floor(f),Math.floor(e))
    }
    ;
    AddressWell.updateColor = function(n) {
        var e = Jx.isRtl() ? "left" : "right"
          , f = new AddressWell.Color(n)
          , o = AddressWell.Color.combine(f, .2, new AddressWell.Color(255,255,255), .8)
          , s = AddressWell.Color.combine(o, .87)
          , h = AddressWell.Color.combine(f, .87)
          , t = f.stringValue
          , c = o.stringValue
          , u = s.stringValue
          , i = h.stringValue
          , l = "@media screen and (-ms-high-contrast: none) {.aw-inputOuterContainer.aw-focus { border: 2px solid " + t + '; }.aw-inputContainer .aw-recipientInner, .aw-root[aria-disabled="true"] .aw-inputContainer .aw-recipientInner:hover {background-color: ' + c + ";}.aw-inputContainer .aw-recipientInner:hover {background-color: " + u + ";}.aw-inputContainer .aw-resolved.aw-inputHL .aw-recipientInner {background-color: " + t + ";}.aw-inputContainer .aw-resolved.aw-inputHL .aw-recipientInner:hover {background-color: " + i + ";}.aw-inputContainer .aw-unresolved.aw-inputHL .aw-recipientInner:hover {background-color: " + i + ";border: 1px solid " + i + ";}.aw-inputContainer .aw-unresolved.aw-inputHL .aw-recipientInner {background-color: " + t + ";border: 1px solid " + t + ";}ul.aw-ddl li:hover {background-color: " + u + ';}ul.aw-ddl li[aria-selected="true"] {background-color: ' + t + ";}ul.aw-ddp progress {color: " + t + ';}.aw-ddTileItem[aria-checked="true"] .aw-tileBorder {border-color:' + t + ';}.aw-ddTileItem[aria-checked="true"]:hover .aw-tileBorder,.aw-ddTileItem[aria-checked="true"][aria-selected="true"] .aw-tileBorder {border-color: ' + i + ';}.aw-ddTileItem[aria-checked="false"]:hover .aw-tileBorder,.aw-ddTileItem[aria-checked="false"][aria-selected="true"] .aw-tileBorder {border-color: ' + u + ";}.aw-checkedBackground {border-top-color: " + t + ";border-" + e + "-color: " + t + ';}.aw-ddTileItem:hover .aw-checkedBackground,.aw-ddTileItem[aria-selected="true"] .aw-checkedBackground {border-top-color: ' + i + ";border-" + e + "-color: " + i + ";}.aw-inputOuterContainer.aw-focus + .aw-ddContainer .aw-ddbutton:hover {background-color: " + u + ";}.aw-inputOuterContainer.aw-focus + .aw-ddContainer .aw-ddbutton:active {background-color: " + i + ";}}"
          , r = document.getElementById(AddressWell.colorCssId);
        r || (r = document.createElement("style"),
        r.type = "text/css",
        r.id = AddressWell.colorCssId,
        document.head.appendChild(r));
        r.innerHTML = "";
        r.appendChild(document.createTextNode(l))
    }
    ;
    AddressWell.markStart = function(n) {
        Jx.mark("AddressWell." + n + ",StartTA,AddressWell")
    }
    ;
    AddressWell.markStop = function(n) {
        Jx.mark("AddressWell." + n + ",StopTA,AddressWell")
    }
    ;
    AddressWell.scrollIntoViewIfNotInView = function(n, t, i) {
        var u, f, r, e;
        AddressWell.markStart("scrollIntoViewIfNotInView");
        u = Math.min(window.innerHeight, i.offsetHeight);
        f = t ? 0 : n.offsetHeight;
        try {
            r = n.getBoundingClientRect().top + document.documentElement.scrollTop - window.pageYOffset + f;
            e = r >= 0 && r <= u;
            e || n.scrollIntoView(t)
        } catch (o) {
            Jx.log.exception("Error in AddressWell.Controller._scrollIntoViewIfNotInView", o)
        }
        AddressWell.markStop("scrollIntoViewIfNotInView")
    }
    ;
    AddressWell.isEmailValid = function(n) {
        return AddressWell.emailPattern.test(n) && n.indexOf("@") === n.lastIndexOf("@")
    }
    ;
    AddressWell.isEmailDomainValid = function(n) {
        var t = true
          , i = n.indexOf("@")
          , r = "";
        return i > -1 && (r = n.substring(i + 1),
        t = AddressWell.badDomains.indexOf(";" + r.toLowerCase() + ";") === -1),
        t
    }
    ;
    AddressWell.isEmailAndDomainValid = function(n) {
        return AddressWell.isEmailValid(n) && AddressWell.isEmailDomainValid(n)
    }
    ;
    AddressWell.isPossibleAlias = function(n) {
        return /^[^@\s()]+$/i.test(n)
    }
    ;
    AddressWell.Contact = function(n, t, i) {
        this.person = n;
        this.recipients = t;
        this.tile = i
    }
    ;
    AddressWell.Contact.prototype.person = null;
    AddressWell.Contact.prototype.recipients = null;
    AddressWell.Contact.prototype.tile = "";
    AddressWell.Input = function(n, t, i, r, u, f) {
        if (!Jx.isNonEmptyString(n))
            throw new Error("idPrefix parameter must be not null and non empty");
        this._containerId = n + "C";
        this._inputFieldId = n + "IF";
        this._listId = n + "L";
        this._scrollToId = n + "IScroll";
        this._recipients = t || [];
        this._log = r;
        this._recipientTemplate = null;
        this._platform = i;
        this._parser = new AddressWell.RecipientParser(i,r);
        this._hintText = u;
        this._allowViewProfile = f;
        this.initComponent();
        this._id = n + "OC";
        this._itemIdBase = n + "R";
        this.attr(AddressWell.highlightAreaAttr, {
            changed: this._highlightAreaChanged
        });
        this.attr(AddressWell.highlightIdAttr, {
            changed: this._highlightIdChanged
        });
        this.attr(AddressWell.dropDownVisibleAttr, {
            changed: this._dropDownVisibilityChanged
        });
        this.attr(AddressWell.firstDropDownItemId)
    }
    ;
    Jx.augment(AddressWell.Input, Jx.Component);
    Jx.augment(AddressWell.Input, Jx.Events);
    AddressWell.Input.prototype._containerId = "";
    AddressWell.Input.prototype._inputFieldId = "";
    AddressWell.Input.prototype._listId = "";
    AddressWell.Input.prototype._rootElement = null;
    AddressWell.Input.prototype._containerElement = null;
    AddressWell.Input.prototype._inputElement = null;
    AddressWell.Input.prototype._recipients = null;
    AddressWell.Input.prototype._numPrefilled = 0;
    AddressWell.Input.prototype._highlightIndex = -1;
    AddressWell.Input.prototype._highlightClass = "aw-inputHL";
    AddressWell.Input.prototype._focusClass = "aw-focus";
    AddressWell.Input.prototype._uiInitialized = false;
    AddressWell.Input.prototype._itemIdBase = "";
    AddressWell.Input.prototype._log = null;
    AddressWell.Input.prototype._previousInputValue = "";
    AddressWell.Input.prototype._hintText = "";
    AddressWell.Input.prototype._allowViewProfile = false;
    AddressWell.Input.prototype._cachedContainerWidth = 0;
    AddressWell.Input.prototype._imeActive = false;
    AddressWell.Input.prototype._isDisabled = false;
    AddressWell.Input.prototype._parser = null;
    AddressWell.Input.prototype._platform = null;
    AddressWell.Input.prototype._biciRecipientAddMethod = -1;
    AddressWell.Input.prototype._searchOnEnter = false;
    AddressWell.Input.prototype._cachedInputOffsetLeft = 0;
    AddressWell.Input.prototype._isAnimating = false;
    AddressWell.Input.prototype._containerClick = null;
    AddressWell.Input.prototype._inputContextMenu = null;
    AddressWell.Input.prototype._containerContextMenu = null;
    AddressWell.Input.prototype._containerPointerDown = null;
    AddressWell.Input.prototype._containerKeyDown = null;
    AddressWell.Input.prototype._inputKeyDown = null;
    AddressWell.Input.prototype._inputPaste = null;
    AddressWell.Input.prototype._inputFocus = null;
    AddressWell.Input.prototype._inputChange = null;
    AddressWell.Input.prototype._imeStart = null;
    AddressWell.Input.prototype._imeEnd = null;
    AddressWell.Input.prototype._msCandidateWindowShow = null;
    AddressWell.Input.prototype._msCandidateWindowHide = null;
    AddressWell.Input.prototype.isDirty = false;
    AddressWell.Input.prototype.getUI = function(n) {
        var i = "", t, r;
        Jx.isNonEmptyString(this._hintText) && !this._isDisabled && (i = ' placeholder="' + Jx.escapeHtmlToSingleLine(this._hintText) + '" ');
        t = "";
        r = "";
        this._isDisabled && (t = ' disabled="disabled"',
        r = ' aria-disabled="true"');
        n.html = '<div class="aw-inputOuterContainer" id="' + this._id + '" tabindex="-1"><div id="' + this._containerId + '" class="aw-inputContainer" role="listbox" aria-controls="' + this._inputFieldId + '"><input id="' + this._inputFieldId + '" size="1" type="email" maxlength = "' + AddressWell.maxInputLength.toString() + '" role="textbox" aria-autocomplete="list" aria-controls="' + this._listId + '" aria-required="true"' + i + t + '/><\/div><div class="aw-inputScrollTo" id="' + this._scrollToId + '"><\/div><\/div>'
    }
    ;
    AddressWell.Input.prototype.activateUI = function() {
        var n = this, t;
        Jx.Component.prototype.activateUI.call(n);
        this._uiInitialized || (n._rootElement = document.getElementById(n._id),
        n._containerElement = document.getElementById(n._containerId),
        n._inputElement = document.getElementById(n._inputFieldId),
        this.focus = AddressWell.Input.prototype.focus.bind(this),
        n._containerClick = n._containerClickHandler.bind(n),
        n._rootElement.addEventListener(AddressWell.Events.msGestureTap, n._containerClick, false),
        n._containerContextMenu = n._containerContextMenuHandler.bind(n),
        n._rootElement.addEventListener(AddressWell.Events.contextmenu, n._containerContextMenu, true),
        n._containerPointerDown = n._containerPointerDownHandler.bind(n),
        n._rootElement.addEventListener(AddressWell.Events.msPointerDown, n._containerPointerDown, false),
        n._containerKeyDown = n.containerKeyDownHandler.bind(n),
        n._rootElement.addEventListener(AddressWell.Events.keydown, n._containerKeyDown, false),
        n._inputKeyDown = n._inputKeyDownHandler.bind(n),
        n._inputElement.addEventListener(AddressWell.Events.keydown, n._inputKeyDown, false),
        n._inputChange = n._inputChangeHandler.bind(n),
        n._inputElement.addEventListener(AddressWell.Events.input, n._inputChange, false),
        n._inputPaste = n._inputPasteHandler.bind(n),
        n._inputElement.addEventListener(AddressWell.Events.paste, n._inputPaste, false),
        n._inputFocus = n._inputFocusHandler.bind(n),
        n._inputElement.addEventListener(AddressWell.Events.focus, n._inputFocus, false),
        n._imeStart = n._imeStartHandler.bind(n),
        n._imeEnd = n._imeEndHandler.bind(n),
        n._inputElement.addEventListener(AddressWell.Events.compositionstart, n._imeStart, false),
        n._inputElement.addEventListener(AddressWell.Events.compositionend, n._imeEnd, false),
        n._inputElement.msGetInputContext && n._inputElement.msGetInputContext() && (t = n._inputElement.msGetInputContext(),
        n._msCandidateWindowShow = n._msCandidateWindowShowHandler.bind(n),
        n._msCandidateWindowHide = n._msCandidateWindowHideHandler.bind(n),
        t.addEventListener("MSCandidateWindowShow", n._msCandidateWindowShow),
        t.addEventListener("MSCandidateWindowHide", n._msCandidateWindowHide)),
        n._inputContextMenu = n._inputContextMenuHandler.bind(n),
        n._inputElement.addEventListener(AddressWell.Events.contextmenu, n._inputContextMenu, false),
        n.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input),
        this._recipients.length > 0 && n._addRecipientsHtml(this._recipients),
        this._uiInitialized = true)
    }
    ;
    AddressWell.Input.prototype.deactivateUI = function() {
        if (Jx.Component.prototype.deactivateUI.call(this),
        this._uiInitialized) {
            if (this._rootElement.removeEventListener(AddressWell.Events.msGestureTap, this._containerClick, false),
            this._rootElement.removeEventListener(AddressWell.Events.contextmenu, this._containerContextMenu, false),
            this._rootElement.removeEventListener(AddressWell.Events.msPointerDown, this._containerPointerDown, false),
            this._rootElement.removeEventListener(AddressWell.Events.keydown, this._containerKeyDown, false),
            this._inputElement.removeEventListener(AddressWell.Events.keydown, this._inputKeyDown, false),
            this._inputElement.removeEventListener(AddressWell.Events.input, this._inputChange, false),
            this._inputElement.removeEventListener(AddressWell.Events.paste, this._inputPaste, false),
            this._inputElement.removeEventListener(AddressWell.Events.focus, this._inputFocus, false),
            this._inputElement.removeEventListener(AddressWell.Events.compositionstart, this._imeStart, false),
            this._inputElement.removeEventListener(AddressWell.Events.compositionend, this._imeEnd, false),
            Jx.isFunction(this._msCandidateWindowShow) && this._inputElement.msGetInputContext) {
                var n = this._inputElement.msGetInputContext();
                n && (n.removeEventListener("MSCandidateWindowShow", this._msCandidateWindowShow),
                n.removeEventListener("MSCandidateWindowHide", this._msCandidateWindowHide))
            }
            this._inputElement.removeEventListener(AddressWell.Events.contextmenu, this._inputContextMenu, false);
            this.focus = null;
            this._containerClick = null;
            this._inputContextMenu = null;
            this._containerContextMenu = null;
            this._containerPointerDown = null;
            this._containerKeyDown = null;
            this._inputKeyDown = null;
            this._inputPaste = null;
            this._inputFocus = null;
            this._inputChange = null;
            this._imeStart = null;
            this._imeEnd = null;
            this._msCandidateWindowShow = null;
            this._msCandidateWindowHide = null;
            this._uiInitialized = false
        }
    }
    ;
    AddressWell.Input.prototype.isImeActive = function() {
        return this._imeActive
    }
    ;
    AddressWell.Input.prototype.getUserInput = function() {
        return this._inputElement.value
    }
    ;
    AddressWell.Input.prototype.finalizeInput = function() {
        this._inputElement.value = this._inputElement.value
    }
    ;
    AddressWell.Input.prototype.getAriaControlledId = function() {
        return this._inputFieldId
    }
    ;
    AddressWell.Input.prototype.setAriaControls = function(n) {
        this._inputElement.setAttribute("aria-controls", n)
    }
    ;
    AddressWell.Input.prototype.setAriaFlow = function(n, t) {
        this._ariaFlowFrom_external = n;
        this._ariaFlowTo_external = t
    }
    ;
    AddressWell.Input.prototype.getRootElement = function() {
        return this._rootElement
    }
    ;
    AddressWell.Input.prototype.hasFocus = function() {
        return !Jx.isNullOrUndefined(document.activeElement) && document.activeElement.id === this._inputFieldId
    }
    ;
    AddressWell.Input.prototype.setDisabled = function(n) {
        if (this.hasUI()) {
            var t = this._inputElement;
            n ? (t.setAttribute("disabled", "disabled"),
            t.placeholder = "") : (t.removeAttribute("disabled"),
            !this.isDirty && Jx.isNonEmptyString(this._hintText) && (t.placeholder = this._hintText));
            this._containerElement.setAttribute("aria-disabled", String(n))
        }
        this._isDisabled = n
    }
    ;
    AddressWell.Input.prototype.setSearchOnEnter = function(n) {
        this._searchOnEnter = n
    }
    ;
    AddressWell.Input.prototype.getInputElementId = function() {
        return this._inputFieldId
    }
    ;
    AddressWell.Input.prototype.getRecipients = function(n) {
        for (var r = [], i, t = 0; t < this._recipients.length; t++)
            i = this._recipients[t],
            Jx.isNullOrUndefined(i) || n && i.isJsRecipient || r.push(i.internalRecipient);
        return r
    }
    ;
    AddressWell.Input.prototype.getRecipientsStringInNameEmailPairs = function() {
        for (var i = "", t = null, r = this._recipients, n = 0, u = r.length; n < u; n++)
            t = r[n],
            t && (i += t.toString());
        return i
    }
    ;
    AddressWell.Input.prototype.getError = function() {
        var t, i, n;
        if (this.completeUserInput(false),
        t = this._recipients.filter(function(n) {
            return n !== null
        }),
        t.length === 0)
            return Jx.res.getString(AddressWell.stringsPrefix + "awErrorEmpty");
        if (this.getRecipientsStringInNameEmailPairs().length >= AddressWell.maxStringLength)
            return Jx.res.getString(AddressWell.stringsPrefix + "awErrorMaximum");
        for (i = 0; i < t.length; i++) {
            if (n = t[i],
            n.state === AddressWell.RecipientState.invalid)
                return Jx.res.getString(AddressWell.stringsPrefix + "awErrorInvalid");
            if (n.state === AddressWell.RecipientState.pendingResolution)
                return Jx.res.getString(AddressWell.stringsPrefix + "awErrorResolutionsPending");
            if (n.state === AddressWell.RecipientState.unresolvable || n.state === AddressWell.RecipientState.unresolved)
                return Jx.res.getString(AddressWell.stringsPrefix + "awErrorUnresolvableRecipients")
        }
        return null
    }
    ;
    AddressWell.Input.prototype.clear = function() {
        var n, i, t;
        for (this.clearHighlight(),
        n = 0,
        i = this._recipients.length; n < i; n++)
            t = this._recipients[n],
            t && (t.item.removeNode(true),
            t.setDeleted());
        this._recipients = [];
        this._numPrefilled = 0;
        this._biciRecipientAddMethod = -1;
        this._lightClearInputField(false);
        Jx.isNonEmptyString(this._hintText) && (this._inputElement.placeholder = this._hintText)
    }
    ;
    AddressWell.Input.prototype.clearHighlight = function() {
        if (this._highlightIndex !== -1) {
            var n = document.getElementById(this._mapRecipientIndexToElementId(this._highlightIndex));
            Jx.isNullOrUndefined(n) || Jx.removeClass(n, this._highlightClass);
            this._highlightIndex = -1
        }
    }
    ;
    AddressWell.Input.prototype.removeFocusFromContainer = function() {
        Jx.removeClass(this._rootElement, this._focusClass)
    }
    ;
    AddressWell.Input.prototype.addFocusToContainer = function() {
        Jx.addClass(this._rootElement, this._focusClass)
    }
    ;
    AddressWell.Input.prototype.completeUserInput = function(n) {
        var t = this._inputElement.value.trim();
        Jx.isNonEmptyString(t) && (t += ";",
        this.addRecipientsByString(t, AddressWell.RecipientAddMethod.typing),
        this.clearInputField(n))
    }
    ;
    AddressWell.Input.prototype.clearInputField = function(n) {
        this._inputElement.value = "";
        this._previousInputValue = this._inputElement.value;
        this.adjustInputFieldLength(true);
        n && this.raiseEvent(AddressWell.Events.userInputChanged)
    }
    ;
    AddressWell.Input.prototype._lightClearInputField = function(n) {
        this._inputElement.value = "";
        this._previousInputValue = this._inputElement.value;
        n && this.raiseEvent(AddressWell.Events.userInputChanged)
    }
    ;
    AddressWell.Input.prototype.addRecipient = function(n) {
        this.addRecipients([n])
    }
    ;
    AddressWell.Input.prototype.addRecipients = function(n, t) {
        AddressWell.markStart("Input.addRecipients");
        n.length > 0 && (Jx.isNumber(t) && (this._biciRecipientAddMethod = t,
        Jx.bici.addToStream(AddressWell.selectionBiciId, t, n.length),
        t === AddressWell.RecipientAddMethod.preFilled && (this._numPrefilled += n.length)),
        this._addRecipientsHtml(n),
        this._addRecipientsToCollection(n),
        this._inputElement && this._lightClearInputField(true),
        this._updateAriaFlowAttributes(n[0].item, true),
        this.isDirty = true);
        AddressWell.markStop("Input.addRecipients")
    }
    ;
    AddressWell.Input.prototype.addRecipientsByString = function(n, t) {
        return AddressWell.markStart("Input.addRecipientsByString"),
        this.addRecipients(this._parser.parse(n), t),
        AddressWell.markStop("Input.addRecipientsByString"),
        this._parser.unparsedText
    }
    ;
    AddressWell.Input.prototype.focus = function(n) {
        (n || document.activeElement !== this._inputElement) && (n && this._inputElement.blur(),
        this._inputElement.focus())
    }
    ;
    AddressWell.Input.prototype.adjustInputFieldLength = function(n) {
        if (!this.isShutdown()) {
            if (AddressWell.markStart("Input.adjustInputFieldLength"),
            this._uiInitialized && this._recipients.length > 0) {
                var t = this._inputElement;
                t.size = t.value.length + 1;
                this._updateInputFieldOffset(n)
            }
            AddressWell.markStop("Input.adjustInputFieldLength")
        }
    }
    ;
    AddressWell.Input.prototype._updateInputFieldOffset = function(n) {
        if (!this._isAnimating) {
            var t = this._inputElement
              , i = Jx.isRtl() ? t.offsetLeft + t.offsetWidth : t.offsetLeft;
            n && this._cachedInputOffsetLeft === i || (this.raiseEvent(AddressWell.Events.inputOffsetAdjusted, i),
            this._cachedInputOffsetLeft = i)
        }
    }
    ;
    AddressWell.Input.prototype.deleteRecipientByIndex = function(n, t, i) {
        var e = this._recipients.length, u, r, f;
        n > -1 && n < e && (u = document.getElementById(this._mapRecipientIndexToElementId(n)),
        r = null,
        this.clearHighlight(),
        i && (f = this._getNextRecipient(n) || this._getPreviousRecipient(n),
        f && (r = f.item)),
        this._recipients[n].setDeleted(),
        this._recipients[n] = null,
        t ? this._deleteRecipientAnimation(u) : this._deleteRecipientAnimationCallback(u),
        r && this._highlight(r, true),
        this.raiseEvent(AddressWell.Events.recipientRemoved, null))
    }
    ;
    AddressWell.Input.prototype.deleteRecipientByEmail = function(n) {
        var t, i;
        for (n = n.toLowerCase(),
        t = this._recipients.length; t--; )
            i = this._recipients[t],
            Boolean(i) && i.emailAddress.toLowerCase() === n && this.deleteRecipientByIndex(t, false, true)
    }
    ;
    AddressWell.Input.prototype._getNextRecipient = function(n) {
        var i, t, r;
        for (i = this._recipients,
        t = n + 1,
        r = i.length; t < r; t++)
            if (i[t])
                return i[t];
        return null
    }
    ;
    AddressWell.Input.prototype._getPreviousRecipient = function(n) {
        for (var i = this._recipients, t = n - 1; t >= 0; t--)
            if (i[t])
                return i[t];
        return null
    }
    ;
    AddressWell.Input.prototype._deleteRecipientAnimation = function(n) {
        var i;
        if (!Jx.isNullOrUndefined(n)) {
            var t = this
              , r = this._containerElement.querySelectorAll("div.aw-inputContainer li")
              , u = WinJS.UI.Animation.createDeleteFromListAnimation(n, r);
            n.style.visibility = "hidden";
            n.style.position = "fixed";
            i = function() {
                t._inputElement.blur();
                t.focus()
            }
            ;
            i();
            u.execute().then(function() {
                t.hasFocus() && i();
                t._deleteRecipientAnimationCallback(n)
            }, function(r) {
                t.hasFocus() && i();
                t._deleteRecipientAnimationCallback(n);
                Jx.log.exception("AddressWell.Input.deleteRecipientByIndex has encountered an error during animation promise pattern", r)
            })
        }
    }
    ;
    AddressWell.Input.prototype._deleteRecipientAnimationCallback = function(n) {
        var t = n.nextSibling || n.previousSibling;
        this._containerElement.removeChild(n);
        this._recipients.length > 0 && this._updateAriaFlowAttributes(t, false);
        this.adjustInputFieldLength(true);
        this.isDirty = true;
        this._containerElement.children.length === 1 && this.raiseEvent(AddressWell.Events.hasRecipientsChanged, false)
    }
    ;
    AddressWell.Input.prototype.containerKeyDownHandler = function(n) {
        if (this._highlightIndex > -1) {
            var t = document.getElementById(this._mapRecipientIndexToElementId(this._highlightIndex));
            Jx.isNullOrUndefined(t) || this._recipientKeyDownHandler(n)
        }
    }
    ;
    AddressWell.Input.prototype._getSourceRecipientElement = function(n) {
        for (var t = n.target, r = false, i = 0; i < 3; i++) {
            if (Jx.isNonEmptyString(t.getAttribute("data-awIndex"))) {
                r = true;
                break
            }
            t = t.parentNode
        }
        return r ? t : null
    }
    ;
    AddressWell.Input.prototype._inputContextMenuHandler = function(n) {
        n.stopPropagation();
        this._isDisabled && n.preventDefault()
    }
    ;
    AddressWell.Input.prototype._containerClickHandler = function(n) {
        var t = this._getSourceRecipientElement(n), i, r;
        this._isDisabled ? t && this._allowViewProfile && (i = this._getRecipientIndex(t),
        r = this._recipients[i],
        this._viewProfileHandler(r)) : (this.addFocusToContainer(),
        Jx.isNullOrUndefined(t) ? (this.raiseEvent(AddressWell.Events.msGestureTap),
        this.clearHighlight()) : this._recipientClickHandler(t),
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input));
        n.preventDefault()
    }
    ;
    AddressWell.Input.prototype._containerPointerDownHandler = function(n) {
        if (!this._isDisabled) {
            var t = this._getSourceRecipientElement(n);
            Jx.isNullOrUndefined(t) || (AddressWell.performPointerAnimation(t),
            this._inputElement === document.activeElement && n.preventDefault())
        }
    }
    ;
    AddressWell.Input.prototype._containerContextMenuHandler = function(n) {
        var t, i, r;
        this._isDisabled ? this._containerClickHandler(n) : (this._highlightIndex < 0 ? this._containerClickHandler(n) : (t = this._getSourceRecipientElement(n),
        i = -1,
        Jx.isNullOrUndefined(t) || (i = this._getRecipientIndex(t)),
        i === -1 ? this.clearHighlight() : this._highlightIndex !== i && this._highlight(t, false)),
        this._highlightIndex > -1 ? this._displayContextMenuForRecipient(this._highlightIndex) : (r = window.clipboardData.getData("Text"),
        Jx.isNullOrUndefined(r) || this._displayContextMenuForContainer(n, r)));
        n.stopPropagation();
        n.preventDefault()
    }
    ;
    AddressWell.Input.prototype._displayContextMenuForContainer = function(n, t) {
        var i = null, r = this, u;
        return Jx.isWWA && (i = new Windows.UI.Popups.PopupMenu,
        u = new Windows.UI.Popups.UICommand(Jx.res.getString(AddressWell.stringsPrefix + "awPaste"),r._containerPasteHandler.bind(r, t),"paste"),
        i.commands.append(u),
        this._showContextMenuForContainer(i, n)),
        i
    }
    ;
    AddressWell.Input.prototype._showContextMenuForContainer = function(n, t) {
        var i, r, u;
        try {
            i = t.pageX - window.pageXOffset;
            r = t.pageY - window.pageYOffset;
            t.button === 0 && (u = this._inputElement.getBoundingClientRect(),
            i = u.left,
            r = u.top);
            n.showAsync({
                x: i,
                y: r
            });
            this.raiseEvent(AddressWell.Events.showingContextMenu)
        } catch (f) {
            Jx.log.exception("AddressWell.Input._showContextMenuForContainer has encountered an error", f)
        }
    }
    ;
    AddressWell.Input.prototype._displayContextMenuForRecipient = function(n) {
        var i, t, r;
        if (i = null,
        t = this,
        Jx.isWWA) {
            i = new Windows.UI.Popups.PopupMenu;
            r = this._recipients[n];
            var u = new Windows.UI.Popups.UICommand(Jx.res.getString(AddressWell.stringsPrefix + "awViewProfile"),t._viewProfileHandler.bind(t, r),"launchProfile")
              , f = new Windows.UI.Popups.UICommand(Jx.res.getString(AddressWell.stringsPrefix + "awCut"),t._inputCutHandler.bind(t),"cut")
              , e = new Windows.UI.Popups.UICommand(Jx.res.getString(AddressWell.stringsPrefix + "awCopy"),t._inputCopyHandler.bind(t),"copy")
              , o = new Windows.UI.Popups.UICommand(Jx.res.getString(AddressWell.stringsPrefix + "awEdit"),function() {
                t._inputEditHandler(true)
            }
            ,"edit")
              , s = new Windows.UI.Popups.UICommand(Jx.res.getString(AddressWell.stringsPrefix + "awRemoveRecipient"),t._inputRemoveHandler.bind(t),"removeRecipient");
            r.state === AddressWell.RecipientState.resolved && (this._allowViewProfile && i.commands.append(u),
            i.commands.append(f),
            i.commands.append(e));
            i.commands.append(o);
            i.commands.append(s);
            this._showContextMenuForRecipient(i, n)
        }
        return i
    }
    ;
    AddressWell.Input.prototype._showContextMenuForRecipient = function(n, t) {
        var i = document.body.parentNode.msContentZoomFactor
          , r = document.getElementById(this._mapRecipientIndexToElementId(t));
        try {
            n.showForSelectionAsync({
                x: r.getBoundingClientRect().left * i,
                y: r.getBoundingClientRect().top * i,
                width: r.clientWidth * i,
                height: r.clientHeight * i
            }).done(function() {
                if (this._highlightIndex !== -1) {
                    var n = this._recipients[this._highlightIndex];
                    Jx.isObject(n) && Jx.isHTMLElement(n.item) && msSetImmediate(function() {
                        n.item.tabIndex = -1;
                        n.item.focus();
                        n.item.removeAttribute("tabIndex")
                    })
                }
            }
            .bind(this));
            this.raiseEvent(AddressWell.Events.showingContextMenu)
        } catch (u) {
            Jx.log.exception("AddressWell.Input._showContextMenuForRecipient has encountered an error", u)
        }
    }
    ;
    AddressWell.Input.prototype._recipientClickHandler = function(n) {
        var t = this._getRecipientIndex(n);
        this._highlightIndex !== t && this._highlight(n, false);
        this._displayContextMenuForRecipient(t)
    }
    ;
    AddressWell.Input.prototype._recipientKeyDownHandler = function(n) {
        if (n.ctrlKey)
            switch (n.key) {
            case AddressWell.Key.c:
                this._inputCopyHandler();
                break;
            case AddressWell.Key.x:
                this._inputCutHandler();
                break;
            default:
                n.key === AddressWell.Key.enter && (this.focus(),
                this._inputKeyDownHandler(n))
            }
        else
            switch (n.key) {
            case AddressWell.Key.tab:
                this.clearHighlight();
                break;
            case AddressWell.Key.arrowLeft:
            case AddressWell.Key.arrowRight:
                this._arrowKeyHandler(n);
                break;
            case AddressWell.Key.pageUp:
                this._rootElement.scrollTop = Math.max(0, this._rootElement.scrollTop - AddressWell.pagingHeightForRecipients);
                break;
            case AddressWell.Key.pageDown:
                this._rootElement.scrollTop = Math.min(this._rootElement.scrollHeight, this._rootElement.scrollTop + AddressWell.pagingHeightForRecipients);
                break;
            case AddressWell.Key.enter:
            case AddressWell.Key.spacebar:
                this._displayContextMenuForRecipient(this._highlightIndex);
                n.preventDefault();
                break;
            case AddressWell.Key.selection:
                this._inputKeyDownHandler(n);
                break;
            default:
                this.focus();
                this._inputKeyDownHandler(n)
            }
    }
    ;
    AddressWell.Input.prototype._inputFocusHandler = function() {
        this.addFocusToContainer();
        this.raiseEvent(AddressWell.Events.focus);
        this._updateInputFieldOffset(true)
    }
    ;
    AddressWell.Input.prototype._imeStartHandler = function() {
        this._imeActive = true
    }
    ;
    AddressWell.Input.prototype._imeEndHandler = function() {
        this._imeActive = false
    }
    ;
    AddressWell.Input.prototype._msCandidateWindowShowHandler = function() {
        var t = this._inputElement.msGetInputContext()
          , n = t.getCandidateWindowClientRect()
          , i = n.bottom - n.top;
        this.raiseEvent(AddressWell.Events.imeWindowHeightUpdated, i)
    }
    ;
    AddressWell.Input.prototype._msCandidateWindowHideHandler = function() {
        this.raiseEvent(AddressWell.Events.imeWindowHeightUpdated, 0)
    }
    ;
    AddressWell.Input.prototype._inputKeyDownHandler = function(n) {
        if (n.keyCode !== AddressWell.imeInUseKeyCode)
            switch (n.key) {
            case AddressWell.Key.enter:
                n.ctrlKey && this.getAttr(AddressWell.dropDownVisibleAttr) && this.getAttr(AddressWell.highlightAreaAttr) === AddressWell.HighlightArea.dropDown && n.stopPropagation();
                this.getAttr(AddressWell.highlightAreaAttr) !== AddressWell.HighlightArea.input ? this.raiseEvent(AddressWell.Events.addressWellCompleteKey) : this._searchOnEnter ? this.raiseEvent(AddressWell.Events.searchFirstConnectedAccount) : this.completeUserInput(true);
                n.preventDefault();
                break;
            case AddressWell.Key.tab:
                this.raiseEvent(AddressWell.Events.addressWellTabKey, n);
                break;
            case AddressWell.Key.deleteKey:
            case AddressWell.Key.backspace:
                this._deleteHandler(n);
                n.stopPropagation();
                break;
            case AddressWell.Key.escape:
                this.getAttr(AddressWell.dropDownVisibleAttr) ? (n.preventDefault(),
                n.stopPropagation()) : this._inputElement.blur();
                this.raiseEvent(AddressWell.Events.addressWellEscapeKey);
                break;
            case AddressWell.Key.f10:
                if (n.altKey || !n.shiftKey)
                    break;
            case AddressWell.Key.selection:
                this.getAttr(AddressWell.highlightAreaAttr) === AddressWell.HighlightArea.input && this._highlightIndex > -1 && (this._displayContextMenuForRecipient(this._highlightIndex),
                n.preventDefault());
                n.stopPropagation();
                break;
            case AddressWell.Key.arrowLeft:
            case AddressWell.Key.arrowRight:
            case AddressWell.Key.arrowUp:
            case AddressWell.Key.arrowDown:
                this._arrowKeyHandler(n);
                n.stopPropagation();
                break;
            case AddressWell.Key.pageUp:
            case AddressWell.Key.pageDown:
                this.getAttr(AddressWell.highlightAreaAttr) === AddressWell.HighlightArea.dropDown && this.raiseEvent(AddressWell.Events.pageKey, n.key);
                break;
            case AddressWell.Key.home:
                !Jx.isNonEmptyString(this._inputElement.value) && this._containerElement.children.length > 1 && (this._highlight(this._containerElement.children[0], true),
                n.preventDefault());
                break;
            case AddressWell.Key.end:
                var t = this._containerElement.children.length;
                !Jx.isNonEmptyString(this._inputElement.value) && t > 1 && (this._highlight(this._containerElement.children[t - 2], true),
                n.preventDefault());
                break;
            case AddressWell.Key.k:
                (n.ctrlKey || n.altKey) && (this.raiseEvent(AddressWell.Events.searchFirstConnectedAccount),
                n.preventDefault());
                break;
            case AddressWell.Key.z:
            case AddressWell.Key.y:
                n.ctrlKey && n.preventDefault()
            }
    }
    ;
    AddressWell.Input.prototype._handleInputUpdate = function() {
        Jx.log.verbose("AddressWell.Input.handleInputUpdate");
        this.clearHighlight();
        this.adjustInputFieldLength(true);
        this._notifyInputChange()
    }
    ;
    AddressWell.Input.prototype._notifyInputChange = function() {
        this._previousInputValue !== this._inputElement.value && (this._previousInputValue = this._inputElement.value,
        this.raiseEvent(AddressWell.Events.userInputChanged),
        this.isDirty = true)
    }
    ;
    AddressWell.Input.prototype._containerPasteHandler = function(n) {
        this.focus();
        this._inputElement.value = this.addRecipientsByString(n, AddressWell.RecipientAddMethod.paste);
        this._handleInputUpdate()
    }
    ;
    AddressWell.Input.prototype._inputPasteHandler = function(n) {
        try {
            var t = Windows.ApplicationModel.DataTransfer.Clipboard.getContent();
            t.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text) && t.getTextAsync().done(function(n) {
                this._inputElement.value = this.addRecipientsByString(n, AddressWell.RecipientAddMethod.paste);
                this._handleInputUpdate()
            }
            .bind(this));
            n.preventDefault()
        } catch (i) {
            Jx.log.exception("AddressWell.Input._inputPasteHandler has encountered an error", i)
        }
    }
    ;
    AddressWell.Input.prototype._inputChangeHandler = function() {
        var n, t;
        this._imeActive || (n = this._biciRecipientAddMethod,
        this._biciRecipientAddMethod !== AddressWell.RecipientAddMethod.paste && (n = AddressWell.RecipientAddMethod.typing),
        t = this.addRecipientsByString(this._inputElement.value, n),
        this._inputElement.value !== t && (this._inputElement.value = t));
        this._handleInputUpdate()
    }
    ;
    AddressWell.Input.prototype._copyText = function(n) {
        try {
            var t = new Windows.ApplicationModel.DataTransfer.DataPackage;
            t.setText(n);
            Windows.ApplicationModel.DataTransfer.Clipboard.setContent(t)
        } catch (i) {
            Jx.log.exception("AddressWell.Input._copyText has encountered an error", i)
        }
    }
    ;
    AddressWell.Input.prototype._inputCopyHandler = function() {
        var t = this._recipients[this._highlightIndex], n;
        t && (n = t.toString(),
        Jx.isNonEmptyString(n) && this._copyText(n))
    }
    ;
    AddressWell.Input.prototype._inputCutHandler = function() {
        this._inputCopyHandler();
        this._inputRemoveHandler()
    }
    ;
    AddressWell.Input.prototype._inputEditHandler = function(n) {
        var i = this._recipients[this._highlightIndex], t;
        i && (t = this._recipients[this._highlightIndex].emailAddress,
        this._deleteHighlight(n),
        this._containerPasteHandler(t))
    }
    ;
    AddressWell.Input.prototype._inputRemoveHandler = function() {
        this._deleteHighlight(true)
    }
    ;
    AddressWell.Input.prototype._deleteHandler = function(n) {
        var i, t, r;
        Jx.isNonEmptyString(this._inputElement.value) ? this.adjustInputFieldLength(true) : (i = n.key === AddressWell.Key.backspace,
        t = this._getIndexToLastRecipient(),
        i && this._highlightIndex === -1 ? t >= 0 && this._highlight(this._recipients[t].item, true) : this._highlightIndex !== -1 && (r = this._highlightIndex !== t && t !== 0,
        this._deleteHighlight(r)))
    }
    ;
    AddressWell.Input.prototype._arrowKeyHandler = function(n) {
        var t = n.key, f = this.getAttr(AddressWell.highlightAreaAttr), i, r, u;
        if (Jx.isNonEmptyString(this._inputElement.value) || f !== AddressWell.HighlightArea.input || t !== AddressWell.Key.arrowLeft && t !== AddressWell.Key.arrowRight)
            (t === AddressWell.Key.arrowUp || t === AddressWell.Key.arrowDown || f !== AddressWell.HighlightArea.input) && this.raiseEvent(AddressWell.Events.arrowKey, t);
        else {
            if (i = -1,
            this._highlightIndex > -1) {
                if (t === AddressWell.Key.arrowLeft) {
                    for (r = this._highlightIndex - 1; r >= 0; r--)
                        if (!Jx.isNullOrUndefined(this._recipients[r])) {
                            i = r;
                            break
                        }
                } else if (this._highlightIndex === this._getIndexToLastRecipient())
                    this.clearHighlight(),
                    this.focus();
                else
                    for (u = this._highlightIndex + 1; u < this._recipients.length; u++)
                        if (!Jx.isNullOrUndefined(this._recipients[u])) {
                            i = u;
                            break
                        }
            } else
                t === AddressWell.Key.arrowLeft && (i = this._getIndexToLastRecipient());
            i > -1 && i < this._recipients.length && this._highlight(document.getElementById(this._mapRecipientIndexToElementId(i)), true)
        }
    }
    ;
    AddressWell.Input.prototype._viewProfileHandler = function(n) {
        this.raiseEvent(AddressWell.Events.viewProfile, n)
    }
    ;
    AddressWell.Input.prototype._getIndexToLastRecipient = function() {
        for (var t = this._recipients, n = t.length - 1; n >= 0; n--)
            if (t[n] !== null)
                return n;
        return -1
    }
    ;
    AddressWell.Input.prototype._getRecipientIndex = function(n) {
        var t = n.id.replace(this._itemIdBase, "");
        return parseInt(t, 10)
    }
    ;
    AddressWell.Input.prototype._mapRecipientIndexToElementId = function(n) {
        return this._itemIdBase + n.toString()
    }
    ;
    AddressWell.Input.prototype._deleteHighlight = function(n) {
        if (this._highlightIndex > -1) {
            var t = this._highlightIndex;
            this.deleteRecipientByIndex(t, n, true)
        }
    }
    ;
    AddressWell.Input.prototype._highlight = function(n, t) {
        this.completeUserInput(true);
        this.clearHighlight();
        this._highlightIndex = this._getRecipientIndex(n);
        Jx.addClass(n, this._highlightClass);
        n.tabIndex = -1;
        t && n.focus();
        n.removeAttribute("tabIndex");
        AddressWell.scrollIntoContainer(this._rootElement, n);
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input)
    }
    ;
    AddressWell.Input.prototype._addRecipientsHtml = function(n) {
        var u = [], f = this._recipients.length, t, i, r;
        for (this._inputElement.hasAttribute("placeholder") && this._inputElement.removeAttribute("placeholder"),
        t = 0; t < n.length; t++)
            i = n[t],
            r = f + t,
            i.setId(this._mapRecipientIndexToElementId(r)),
            u.push(i.generateHTMLElement(r, this._isDisabled));
        this._addRecipientsAnimation(u)
    }
    ;
    AddressWell.Input.prototype._addRecipientsAnimation = function(n) {
        var t = this, i, r, u;
        t._containerElement.children.length === 2 && t.raiseEvent(AddressWell.Events.hasRecipientsChanged, true);
        i = t._addRecipientsAnimationCompleted.bind(t);
        t._biciRecipientAddMethod === AddressWell.RecipientAddMethod.typing ? (n.forEach(function(n) {
            n.style.opacity = "0";
            t._containerElement.insertBefore(n, t._inputElement)
        }),
        this._isAnimating = true,
        WinJS.UI.Animation.fadeIn(n).then(i, function(n) {
            Jx.log.exception("AddressWell.Input._addRecipientHtml has encountered an error during fade in animation", n);
            i()
        })) : t._biciRecipientAddMethod === AddressWell.RecipientAddMethod.preFilled ? (n.forEach(function(n) {
            t._containerElement.insertBefore(n, t._inputElement)
        }),
        i(),
        Jx.log.verbose("AddressWell.Input.addRecipientAnimation on page load - skipping animation.")) : (r = this._containerElement.querySelectorAll("div.aw-inputContainer li"),
        u = WinJS.UI.Animation.createAddToSearchListAnimation(n, r),
        n.forEach(function(n) {
            t._containerElement.insertBefore(n, t._inputElement)
        }),
        this._isAnimating = true,
        u.execute().then(i, function(n) {
            Jx.log.exception("AddressWell.Input._addRecipientHtml has encountered an error during add to list animation", n);
            i()
        }))
    }
    ;
    AddressWell.Input.prototype._addRecipientsAnimationCompleted = function() {
        Jx.log.verbose("AddressWell.Input.addRecipientAnimationCompleted");
        this._isAnimating = false;
        this.adjustInputFieldLength(true);
        this._rootElement.scrollTop = this._rootElement.scrollHeight
    }
    ;
    AddressWell.Input.prototype._addRecipientsToCollection = function(n) {
        this._recipients = this._recipients.concat(n);
        this.raiseEvent(AddressWell.Events.recipientsAdded, null);
        msSetImmediate(function() {
            n.forEach(function(n, t) {
                n !== null && n.state === AddressWell.RecipientState.unresolved && this.raiseEvent(AddressWell.Events.autoResolve, {
                    recipient: n,
                    index: t
                })
            }
            .bind(this))
        }
        .bind(this))
    }
    ;
    AddressWell.Input.prototype._highlightAreaChanged = function(n, t) {
        Jx.log.verbose("AddressWell.Input._highlightAreaChanged: " + t);
        this._uiInitialized && t !== AddressWell.HighlightArea.input && this.clearHighlight()
    }
    ;
    AddressWell.Input.prototype._highlightIdChanged = function(n, t) {
        this._inputElement && this._inputElement.setAttribute("aria-activedescendant", t)
    }
    ;
    AddressWell.Input.prototype._dropDownVisibilityChanged = function(n, t) {
        this._inputElement && (t ? this._inputElement.setAttribute("aria-flowto", this.getAttr(AddressWell.firstDropDownItemId)) : this._inputElement.setAttribute("aria-flowto", this._ariaFlowTo_external))
    }
    ;
    AddressWell.Input.prototype._updateAriaFlowAttributes = function(n, t) {
        var i, r, u;
        i = n;
        do
            r = i.previousSibling,
            u = i.nextSibling,
            u ? i.setAttribute("aria-flowto", u.id) : i.setAttribute("aria-flowto", this._ariaFlowTo_external),
            r ? (i.setAttribute("x-ms-aria-flowfrom", r.id),
            r.setAttribute("aria-flowto", i.id)) : i.setAttribute("x-ms-aria-flowfrom", this._ariaFlowFrom_external),
            i = u;
        while (i && t)
    }
    ;
    var i = 10
      , f = 212
      , e = 155;
    AddressWell.DropDown = function(n, t, i) {
        if (!Jx.isNonEmptyString(n))
            throw new Error("idPrefix parameter must be a non-empty string");
        if (this._log = t,
        this.initComponent(),
        this.attr(AddressWell.highlightAreaAttr, {
            changed: this._highlightAreaChanged
        }),
        this.attr(AddressWell.highlightIdAttr),
        this.attr(AddressWell.dropDownVisibleAttr),
        this.attr(AddressWell.firstDropDownItemId),
        this._id = n + "DD",
        this._itemIdBase = n + "DDList",
        this._contacts = [],
        Jx.isNumber(i))
            switch (i) {
            case AddressWell.DropDownButtonType.roomsSelector:
                this._bottomButton = new AddressWell.RoomsSelector(n);
                this.append(this._bottomButton);
                this._bottomButtonType = i
            }
    }
    ;
    Jx.augment(AddressWell.DropDown, Jx.Component);
    Jx.augment(AddressWell.DropDown, Jx.Events);
    AddressWell.DropDown.prototype._itemIdBase = "";
    AddressWell.DropDown.prototype._rootElement = null;
    AddressWell.DropDown.prototype._containerElement = null;
    AddressWell.DropDown.prototype._listElement = null;
    AddressWell.DropDown.prototype._bottomElement = null;
    AddressWell.DropDown.prototype._uiInitialized = false;
    AddressWell.DropDown.prototype._unbindListeners = null;
    AddressWell.DropDown.prototype._contacts = null;
    AddressWell.DropDown.prototype._currentView = AddressWell.DropDownView.none;
    AddressWell.DropDown.prototype._highlightIndex = -1;
    AddressWell.DropDown.prototype._log = null;
    AddressWell.DropDown.prototype._bottomButton = null;
    AddressWell.DropDown.prototype._bottomButtonType = AddressWell.DropDownButtonType.none;
    AddressWell.DropDown.prototype._inputPaneTop = 0;
    AddressWell.DropDown.prototype._inputPaneShowing = false;
    AddressWell.DropDown.prototype._disabled = false;
    AddressWell.DropDown.prototype._offsetLeft = 0;
    AddressWell.DropDown.prototype._offsetTop = AddressWell.DropDown.borderWidthOffset;
    AddressWell.DropDown.prototype._isDropDownPointerDown = false;
    Object.defineProperty(AddressWell.DropDown.prototype, "bottomButtonEnabled", {
        get: function() {
            return this._bottomButton !== null
        }
    });
    Object.defineProperty(AddressWell.DropDown.prototype, "bottomButtonId", {
        get: function() {
            return this._bottomButton.id
        }
    });
    Object.defineProperty(AddressWell.DropDown.prototype, "currentView", {
        get: function() {
            return this._currentView
        }
    });
    t = {};
    t[AddressWell.DropDownView.peopleSearchList] = AddressWell.RecipientAddMethod.wordWheel;
    t[AddressWell.DropDownView.connectedAccountList] = AddressWell.RecipientAddMethod.galSearch;
    t[AddressWell.DropDownView.suggestionsList] = AddressWell.RecipientAddMethod.suggestions;
    AddressWell.DropDown.prototype.activateUI = function() {
        var t, i;
        if (Jx.Component.prototype.activateUI.call(this),
        !this._uiInitialized) {
            this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
            this._highlightIndex = -1;
            this._rootElement = document.getElementById(this._id);
            this._containerElement = document.getElementById(this._id + "DDArea");
            this._bottomElement = document.getElementById(this._id + "DDBottom");
            this._listElement = document.getElementById(this._id + "DDList");
            var r = this._itemClick.bind(this)
              , u = this._itemPointerDown.bind(this)
              , n = this._itemPointerReleased.bind(this)
              , f = this._containerKeyDown.bind(this);
            this._containerElement.addEventListener(AddressWell.Events.msGestureTap, r, false);
            this._containerElement.addEventListener(AddressWell.Events.msPointerDown, u, false);
            this._containerElement.addEventListener(AddressWell.Events.msPointerUp, n, false);
            this._containerElement.addEventListener(AddressWell.Events.msPointerCancel, n, false);
            this._containerElement.addEventListener(AddressWell.Events.msPointerOut, n, false);
            this._containerElement.addEventListener(AddressWell.Events.keydown, f, false);
            t = function() {
                this.raiseEvent(AddressWell.Events.addressWellEscapeKey)
            }
            .bind(this);
            i = this._selectAllItems.bind(this);
            this._bottomButton && (this._bottomButton.addListener(AddressWell.Events.addressWellEscapeKey, t, this),
            this._bottomButton.addListener(AddressWell.Events.selectAllItems, i, this));
            this._unbindListeners = function() {
                this._containerElement.removeEventListener(AddressWell.Events.msGestureTap, r, false);
                this._containerElement.removeEventListener(AddressWell.Events.msPointerDown, u, false);
                this._containerElement.removeEventListener(AddressWell.Events.msPointerUp, n, false);
                this._containerElement.removeEventListener(AddressWell.Events.msPointerCancel, n, false);
                this._containerElement.removeEventListener(AddressWell.Events.msPointerOut, n, false);
                this._containerElement.removeEventListener(AddressWell.Events.keydown, f, false);
                this._bottomButton && (this._bottomButton.removeListener(AddressWell.Events.addressWellEscapeKey, t, this),
                this._bottomButton.removeListener(AddressWell.Events.selectAllItems, i, this))
            }
            ;
            this._uiInitialized = true
        }
    }
    ;
    AddressWell.DropDown.prototype.deactivateUI = function() {
        Jx.Component.prototype.deactivateUI.call(this);
        this._uiInitialized && (this._cancelShowAnimation(),
        this._cancelHideAnimation(),
        this._reset(),
        this._unbindListeners(),
        this._unbindListeners = null,
        this._containerElement = null,
        this._rootElement = null,
        this._uiInitialized = false)
    }
    ;
    AddressWell.DropDown.prototype.getAriaControlledId = function() {
        return this._containerElement.id
    }
    ;
    AddressWell.DropDown.prototype.getRootElement = function() {
        return this._rootElement
    }
    ;
    AddressWell.DropDown.prototype.getUI = function(n) {
        var t = 'aria-label="' + Jx.escapeHtmlToSingleLine(Jx.res.getString(AddressWell.stringsPrefix + "awDropDownLabel")) + '"'
          , i = ""
          , r = ""
          , u = this._bottomButton;
        u && (i = Jx.getUI(u).html,
        r = "aw-ddWithBottomButton");
        n.html = '<div id="' + this._id + '" class="aw-ddContainer ' + r + '"><div id="' + this._id + 'DDArea" class="aw-ddArea" tabindex="-1" role="group" ' + t + '><ul role="listbox" id="' + this._id + 'DDList" ' + t + "><\/ul><\/div>" + i + '<div id="' + this._id + 'DDBottom" class="aw-ddBottom"><\/div><\/div>'
    }
    ;
    AddressWell.DropDown.prototype.setInputPaneTop = function(n) {
        this._inputPaneTop = n;
        this._inputPaneShowing = true;
        this.isVisible() && this._adjustHeightForInputPane()
    }
    ;
    AddressWell.DropDown.prototype.clearInputPaneTop = function() {
        this._containerElement.style.maxHeight = "";
        this._inputPaneTop = null;
        this._inputPaneShowing = false
    }
    ;
    AddressWell.DropDown.prototype._adjustHeightForInputPane = function() {
        var u;
        if (this._inputPaneShowing) {
            var t = this._containerElement.getBoundingClientRect()
              , n = t.bottom
              , r = f;
            this._bottomButton && (n = document.getElementById(this._bottomButton.id).getBoundingClientRect().bottom,
            r = e);
            n + i > this._inputPaneTop && (u = t.height - (n + i - this._inputPaneTop),
            this._containerElement.style.maxHeight = String(Math.max(u, r)) + "px")
        }
    }
    ;
    AddressWell.DropDown.prototype.handleCompleteKey = function() {
        this._uiInitialized && this._highlightIndex > -1 && this._itemClickOnElement(this._getDropDownElementByNodePosition(this._highlightIndex), AddressWell.InputMethod.keyboard)
    }
    ;
    AddressWell.DropDown.prototype.handleArrowKey = function(n) {
        if (this.constructor !== AddressWell.DropDown)
            throw new Error("Internal AddressWell error: 'this' is incorrect in handleArrowKey: " + this);
        if (this._currentView !== AddressWell.DropDownView.text && this._currentView !== AddressWell.DropDownView.progress) {
            var t = this.getAttr(AddressWell.highlightAreaAttr);
            t === AddressWell.HighlightArea.input ? n === AddressWell.Key.arrowDown && this.isVisible() && (this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown),
            this._changeHighlight(0)) : t === AddressWell.HighlightArea.dropDown && this._arrowKeyList(n)
        }
    }
    ;
    AddressWell.DropDown.prototype.handlePageUpDownKey = function(n) {
        if (this.getAttr(AddressWell.highlightAreaAttr) === AddressWell.HighlightArea.dropDown && this._highlightIndex > -1 && u(this._currentView)) {
            var t = -1
              , i = 5;
            n === AddressWell.Key.pageDown ? t = Math.min(this._listElement.children.length - 1, this._highlightIndex + i) : n === AddressWell.Key.pageUp && (t = Math.max(0, this._highlightIndex - i));
            t > -1 && this._changeHighlight(t)
        }
    }
    ;
    AddressWell.DropDown.prototype.hide = function() {
        this.isShowing() && this._setVisibility(false, true, function() {
            this._reset()
        }
        .bind(this))
    }
    ;
    AddressWell.DropDown.prototype.isVisible = function() {
        return this._uiInitialized && Jx.hasClass(this._rootElement, "aw-ddVisible") && this._rootElement.getComputedStyle().opacity === "1"
    }
    ;
    AddressWell.DropDown.prototype.isShowing = function() {
        return this.isVisible() || Jx.isObject(this._showAnimation)
    }
    ;
    AddressWell.DropDown.prototype.render = function(n, t, i, r) {
        this._uiInitialized && (u(n) && this._renderList(n, t, i, r),
        this._currentView = n)
    }
    ;
    AddressWell.DropDown.prototype.renderProgress = function() {
        this._reset();
        this._listElement.className = "aw-ddp";
        var n = Jx.escapeHtml(Jx.res.getString(AddressWell.stringsPrefix + "awSearching"));
        this._listElement.innerHTML = '<li aria-label="' + n + '"><div aria-hidden="true"><progress class="win-ring"><\/progress><span>' + n + "<\/span><\/div><\/li>";
        this._currentView = AddressWell.DropDownView.progress;
        this._setVisibility(true)
    }
    ;
    AddressWell.DropDown.prototype.renderText = function(n) {
        this._reset();
        this._listElement.className = "aw-ddt";
        var t = Jx.escapeHtml(n);
        this._listElement.innerHTML = '<li aria-label="' + t + '"><div aria-hidden="true">' + t + "<\/div><\/li>";
        this._currentView = AddressWell.DropDownView.text;
        this._setVisibility(true)
    }
    ;
    AddressWell.DropDown.prototype.addAriaLive = function() {
        this._listElement.hasAttribute("aria-live") || this._listElement.setAttribute("aria-live", "polite")
    }
    ;
    AddressWell.DropDown.prototype.removeAriaLive = function() {
        this._listElement.hasAttribute("aria-live") && this._listElement.removeAttribute("aria-live")
    }
    ;
    AddressWell.DropDown.prototype.setAriaControls = function(n) {
        this._listElement.setAttribute("aria-controls", n);
        this._bottomButton && this._bottomButton.setAriaControls(n)
    }
    ;
    AddressWell.DropDown.prototype._getDropDownElementById = function(n) {
        return document.getElementById(this._itemIdBase + String(n))
    }
    ;
    AddressWell.DropDown.prototype._getDropDownElementByNodePosition = function(n) {
        return n >= 0 && n < this._listElement.children.length ? this._listElement.children[n] : null
    }
    ;
    AddressWell.DropDown.prototype._arrowKeyList = function(n) {
        if (n !== AddressWell.Key.arrowLeft && n !== AddressWell.Key.arrowRight) {
            var i = this._highlightIndex
              , t = 0
              , r = this._listElement.children.length - 1;
            t = n === AddressWell.Key.arrowUp ? i - 1 : i + 1;
            t = Math.min(t, r);
            t < 0 ? this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input) : this._changeHighlight(t)
        }
    }
    ;
    AddressWell.DropDown.prototype._changeHighlight = function(n) {
        if (n !== this._highlightIndex) {
            var t = n < 0 ? null : this._getDropDownElementByNodePosition(n)
              , i = this._highlightIndex < 0 ? null : this._getDropDownElementByNodePosition(this._highlightIndex);
            this._updateHighlightUI(i, t);
            this._highlightIndex = n
        }
    }
    ;
    AddressWell.DropDown.prototype._updateHighlightUI = function(n, t) {
        n && n.setAttribute("aria-selected", "false");
        t ? (t.setAttribute("aria-selected", "true"),
        AddressWell.scrollIntoContainer(this._containerElement, t),
        this.setAttr(AddressWell.highlightIdAttr, t.id)) : this.setAttr(AddressWell.highlightIdAttr, null)
    }
    ;
    AddressWell.DropDown.prototype._highlightAreaChanged = function(n, t) {
        Jx.log.verbose("AddressWell.DropDown._highlightAreaChanged: " + t);
        this._uiInitialized && t !== AddressWell.HighlightArea.dropDown && this._changeHighlight(-1)
    }
    ;
    AddressWell.DropDown.prototype._itemClick = function(n) {
        if (!this._disabled) {
            var t = this._getSourceElement(n);
            this._itemClickOnElement(t, AddressWell.InputMethod.mouseOrTouch);
            this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown)
        }
    }
    ;
    AddressWell.DropDown.prototype._itemClickOnElement = function(n, t) {
        var i, r;
        this._disabled || Jx.isNullOrUndefined(n) || (i = n.getAttribute("data-awIndex"),
        i.indexOf(AddressWell.dropDownSearchLinkPrefix) === 0 ? this._selectSearchLink(n) : (r = parseInt(i, 10),
        r !== NaN && this._selectItem(r, t)))
    }
    ;
    AddressWell.DropDown.prototype._itemPointerDown = function(n) {
        this._isDropDownPointerDown = true;
        var t = this._getSourceElement(n);
        Jx.isNullOrUndefined(t) || (AddressWell.performPointerAnimation(t),
        n.preventDefault())
    }
    ;
    AddressWell.DropDown.prototype._itemPointerReleased = function() {
        this._isDropDownPointerDown = false;
        this._reflowImeOnPointerRelease && (this._reflowImeOnPointerRelease = false,
        this.adjustImeOffset(0))
    }
    ;
    AddressWell.DropDown.prototype._getSourceElement = function(n) {
        for (var t = n.target, r = false, i = 0; i < 3; i++) {
            if (Jx.isNonEmptyString(t.getAttribute("data-awIndex"))) {
                r = true;
                break
            }
            t = t.parentNode
        }
        return r ? t : null
    }
    ;
    AddressWell.DropDown.prototype._containerKeyDown = function(n) {
        this.raiseEvent(AddressWell.Events.dropDownKeyDown, n)
    }
    ;
    AddressWell.DropDown.prototype._renderList = function(n, t, i, r) {
        var a = this._currentView === AddressWell.DropDownView.none && !r, u, c, l, s;
        this._reset();
        this._listElement.className = "aw-ddl";
        u = [];
        i && u.push(i);
        var f = this
          , e = this._getListOfContactsHtml(t)
          , h = this._getSearchLinksHtml(u)
          , o = "";
        Jx.isNonEmptyString(e) && (o += e);
        Jx.isNonEmptyString(h) && (o += h);
        f._listElement.innerHTML = o;
        c = r && Windows.Globalization.Language.currentInputMethodLanguageTag !== "ko";
        !c && Jx.isNonEmptyString(e) && n !== AddressWell.DropDownView.suggestionsList && (this._changeHighlight(0),
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown));
        Jx.setClass(this._containerElement, "empty", !Jx.isNonEmptyString(f._listElement.innerHTML));
        this._bottomButtonType === AddressWell.DropDownButtonType.roomsSelector && (l = this._bottomButton,
        l.setItemCount(t.length));
        (Jx.isNonEmptyString(f._listElement.innerHTML) || !Jx.isNullOrUndefined(this._bottomButton)) && (this._setVisibility(true, a),
        this._currentView = n);
        s = this._getDropDownElementByNodePosition(0);
        s && this.setAttr(AddressWell.firstDropDownItemId, s.id)
    }
    ;
    AddressWell.DropDown.prototype._getListOfContactsHtml = function(n) {
        var s = "", i, o, c, l;
        if (n.length > 0)
            for (i = 0; i < n.length; i++) {
                var t = n[i], h = t.recipients[0], f, e, u = Jx.isNonEmptyString(h.emailAddress), r = u ? Jx.escapeHtmlToSingleLine(h.emailAddress) : "";
                Jx.isNonEmptyString(t.person.calculatedUIName) ? (f = t.person.calculatedUIName,
                e = u ? Jx.res.loadCompoundString(AddressWell.stringsPrefix + "awDropDownEntryLabel", Jx.escapeHtmlToSingleLine(t.person.calculatedUIName), r) : Jx.escapeHtmlToSingleLine(t.person.calculatedUIName)) : (f = r,
                e = r,
                u || Jx.log.error("Error in AddressWell.DropDown._getListOfContactsHtml - First email and calculatedUIName is empty"));
                o = '<div aria-hidden="true" class="aw-ddlEmail">' + r + "<\/div>";
                Jx.isRtl() && (o = '<div aria-hidden="true" class="aw-ddlEmail singleLineText" dir="ltr">' + r + "<\/div>");
                c = Jx.isNonEmptyString(t.tile) ? t.tile : "/modernaddresswell/UserPawn.png";
                l = u ? '" title="' + r : "";
                s += '<li role="option" data-awIndex="' + i.toString() + '" id="' + this._itemIdBase + i.toString() + l + '" aria-label="' + e + '"><img aria-hidden="true" src="' + c + '" /><div aria-hidden="true" class="aw-ddlName">' + Jx.escapeHtmlToSingleLine(f) + "<\/div>" + o + "<\/li>";
                this._contacts.push(t)
            }
        return s
    }
    ;
    AddressWell.DropDown.prototype._getSearchLinksHtml = function(n) {
        var u = "", t;
        if (!Jx.isNullOrUndefined(n))
            try {
                var f = n.length
                  , i = null
                  , r = "";
                for (t = 0; t < f; t++)
                    i = n[t],
                    r = Jx.escapeHtml(Jx.res.loadCompoundString(AddressWell.stringsPrefix + "awSearchEntryPoint", i.displayName)),
                    u += '<li id="' + this._itemIdBase + AddressWell.dropDownSearchLinkPrefix + t.toString() + '" data-awIndex="' + AddressWell.dropDownSearchLinkPrefix + i.objectId + '" role="option" aria-label="' + r + '" class="aw-sl"><div aria-hidden="true">' + r + "<\/div><\/li>"
            } catch (e) {
                Jx.log.exception("An error has occurred in AddressWell.DropDown._getSearchLinksHtml", e)
            }
        return u
    }
    ;
    AddressWell.DropDown.prototype._reset = function() {
        this._disabled = false;
        this._contacts = [];
        this._listElement.innerHTML = "";
        this._currentView = AddressWell.DropDownView.none;
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input)
    }
    ;
    AddressWell.DropDown.prototype._selectItem = function(n, i) {
        var f = t[this._currentView], r, u;
        Jx.bici.addToStream(AddressWell.selectionBiciId, f, 1);
        this._currentView === AddressWell.DropDownView.suggestionsList && Jx.bici.addToStream(AddressWell.addressWellSuggestionRank, n, this._contacts.length);
        r = this._contacts[n];
        u = r.recipients[0];
        this.raiseEvent(AddressWell.Events.recipientsSelected, {
            recipients: [u],
            inputMethod: i || AddressWell.InputMethod.unknown
        })
    }
    ;
    AddressWell.DropDown.prototype._selectAllItems = function() {
        var n = this._contacts.map(function(n) {
            return n.recipients[0]
        });
        this.raiseEvent(AddressWell.Events.recipientsSelected, {
            recipients: [recipient]
        })
    }
    ;
    AddressWell.DropDown.prototype._selectSearchLink = function(n) {
        var t = n.getAttribute("data-awIndex"), i;
        Jx.isNonEmptyString(t) && t.indexOf(AddressWell.dropDownSearchLinkPrefix) === 0 && (i = t.substr(AddressWell.dropDownSearchLinkPrefix.length),
        this.raiseEvent(AddressWell.Events.searchLinkSelected, i))
    }
    ;
    AddressWell.DropDown.prototype._reserveHeight = function() {
        this._rootElement.style.opacity = "0";
        this._rootElement.ariaHidden = false;
        Jx.addClass(this._rootElement, "aw-ddVisible");
        this._adjustHeightForInputPane()
    }
    ;
    AddressWell.DropDown.prototype._onShowComplete = function(n, t) {
        Jx.log.info("DropDown._onShowComplete");
        this._disabled = false;
        this.setAttr(AddressWell.dropDownVisibleAttr, true);
        this._showAnimation = null;
        t && this.raiseEvent(AddressWell.Events.dropDownReady);
        n && n.call()
    }
    ;
    AddressWell.DropDown.prototype._onHideComplete = function(n) {
        Jx.log.info("DropDown._onHideComplete");
        this._disabled = false;
        this._hideAnimation = null;
        Jx.removeClass(this._rootElement, "aw-ddVisible");
        this._rootElement.ariaHidden = true;
        this.setAttr(AddressWell.dropDownVisibleAttr, false);
        n && n.call()
    }
    ;
    AddressWell.DropDown.prototype._cancelShowAnimation = function() {
        return this._showAnimation ? (this._disabled = false,
        this._showCompleteHandler = Jx.fnEmpty,
        this._showAnimation.cancel(),
        this._showAnimation = null,
        Jx.log.info("DropDown, Cancelling show animation"),
        true) : false
    }
    ;
    AddressWell.DropDown.prototype._cancelHideAnimation = function() {
        return this._hideAnimation ? (this._disabled = false,
        this._hideCompleteHandler = Jx.fnEmpty,
        this._hideAnimation.cancel(),
        this._hideAnimation = null,
        Jx.log.info("DropDown, Cancelling hide animation"),
        true) : false
    }
    ;
    AddressWell.DropDown.prototype._setVisibility = function(n, t, i) {
        n ? (this._disabled = true,
        this._cancelHideAnimation(),
        this._reserveHeight(),
        this._rootElement.style.opacity = "1",
        this._rootElement.style.left = this._offsetLeft + "px",
        this._rootElement.style.marginTop = this._offsetTop + "px",
        t ? (this._showCompleteHandler = this._onShowComplete.bind(this, i, true),
        this._showAnimation = WinJS.UI.Animation.showPopup(this._rootElement, {
            top: "-30px",
            left: "0px"
        }),
        this._showAnimation.done(function() {
            this._showCompleteHandler.call()
        }
        .bind(this))) : this._onShowComplete(i, false)) : this._cancelShowAnimation() ? this._onHideComplete(i) : t ? (this._disabled = true,
        this._rootElement.style.opacity = "0",
        this._hideCompleteHandler = this._onHideComplete.bind(this, i),
        this._hideAnimation = WinJS.UI.Animation.hidePopup(this._rootElement),
        this._hideAnimation.done(function() {
            this._hideCompleteHandler.call()
        }
        .bind(this))) : this._onHideComplete(i)
    }
    ;
    AddressWell.DropDown.prototype.setDropdownLeftOffset = function(n) {
        this._offsetLeft = n + AddressWell.dropDownBorderWidthOffset;
        this._rootElement.style.left = this._offsetLeft + "px"
    }
    ;
    AddressWell.DropDown.prototype.adjustImeOffset = function(n) {
        this._isDropDownPointerDown ? this._reflowImeOnPointerRelease = true : (this._offsetTop = n > 0 ? n + 2 * AddressWell.dropDownBorderWidthOffset + 4 : AddressWell.dropDownBorderWidthOffset,
        this._rootElement.style.marginTop = this._offsetTop + "px")
    }
    ;
    AddressWell.PeoplePicker = function() {}
    ;
    Jx.augment(AddressWell.PeoplePicker, Jx.Events);
    AddressWell.PeoplePicker.prototype.launchPeoplePicker = function() {
        var t = Windows.ApplicationModel.Contacts
          , n = new t.ContactPicker;
        n.selectionMode = t.ContactSelectionMode.fields;
        n.desiredFieldsWithContactFieldType.append(t.ContactFieldType.email);
        n.commitButtonText = Jx.res.getString(AddressWell.stringsPrefix + "awPeoplePickerAdd");
        try {
            n.pickContactsAsync().done(this._pickerResults.bind(this), function(n) {
                Jx.fault("AddressWell.AddressWellPeoplePicker.js", "launchPeoplePickerCallback", n)
            })
        } catch (i) {
            Jx.fault("AddressWell.AddressWellPeoplePicker.js", "launchPeoplePicker", i)
        }
    }
    ;
    AddressWell.PeoplePicker.prototype._pickerResults = function(n) {
        !Jx.isNullOrUndefined(n) && n.length > 0 && this.raiseEvent(AddressWell.Events.addPeopleFromPicker, n)
    }
    ;
    AddressWell.Recipient = function(n, t) {
        this._recipient = n;
        this._state = t || AddressWell.RecipientState.unresolved;
        Jx.isNullOrUndefined(t) && (Jx.isNullOrUndefined(n.person) || (this._state = AddressWell.RecipientState.resolved))
    }
    ;
    Jx.augment(AddressWell.Recipient, Jx.Events);
    AddressWell.Recipient.prototype._recipient = null;
    AddressWell.Recipient.prototype._recipientTemplate = null;
    AddressWell.Recipient.prototype._state = AddressWell.RecipientState.unresolved;
    AddressWell.Recipient.prototype._recipientItem = null;
    AddressWell.Recipient.prototype._id = null;
    Object.defineProperty(AddressWell.Recipient.prototype, "id", {
        get: function() {
            return this._id
        }
    });
    Object.defineProperty(AddressWell.Recipient.prototype, "calculatedUIName", {
        get: function() {
            return this._recipient.calculatedUIName
        }
    });
    Object.defineProperty(AddressWell.Recipient.prototype, "emailAddress", {
        get: function() {
            return this._recipient.emailAddress
        }
    });
    Object.defineProperty(AddressWell.Recipient.prototype, "person", {
        get: function() {
            return this._recipient.person
        }
    });
    Object.defineProperty(AddressWell.Recipient.prototype, "isJsRecipient", {
        get: function() {
            var n = this._recipient;
            return n.isJsRecipient
        }
    });
    Object.defineProperty(AddressWell.Recipient.prototype, "deleteOnBackspace", {
        get: function() {
            return !Jx.isNullOrUndefined(this._recipient.person) && Jx.isNonEmptyString(this._recipient.person.objectId)
        }
    });
    Object.defineProperty(AddressWell.Recipient.prototype, "state", {
        get: function() {
            return this._state
        }
    });
    Object.defineProperty(AddressWell.Recipient.prototype, "item", {
        get: function() {
            return this._recipientItem
        }
    });
    Object.defineProperty(AddressWell.Recipient.prototype, "internalRecipient", {
        get: function() {
            return this._recipient
        }
    });
    s.prototype = {
        styleClass: null,
        ariaLabelId: null
    };
    n = [];
    n[AddressWell.RecipientState.resolved] = {
        styleClass: "aw-resolved",
        ariaLabelId: "awDropDownEntryLabel"
    };
    n[AddressWell.RecipientState.unresolved] = {
        styleClass: "aw-unresolved",
        ariaLabelId: "awUnresolvedLabel"
    };
    n[AddressWell.RecipientState.unresolvable] = {
        styleClass: "aw-unresolved",
        ariaLabelId: "awUnresolvedLabel"
    };
    n[AddressWell.RecipientState.pendingResolution] = {
        styleClass: "aw-unresolved",
        ariaLabelId: "awPendingLabel"
    };
    n[AddressWell.RecipientState.invalid] = {
        styleClass: "aw-invalid",
        ariaLabelId: "awInvalidLabel"
    };
    AddressWell.Recipient.fromEmail = function(n, t, i) {
        var r = null, f = AddressWell.isEmailValid(n), u;
        try {
            Jx.isWWA && i.peopleManager !== null && f && (r = i.peopleManager.loadRecipientByEmail(n, t))
        } catch (e) {
            Jx.fault("AddressWell.AddressWellRecipient.js", "fromEmail", e)
        }
        return Jx.isNullOrUndefined(r) && (r = {
            calculatedUIName: t,
            emailAddress: n,
            person: null,
            isJsRecipient: true
        }),
        u = AddressWell.RecipientState.resolved,
        f ? AddressWell.isEmailDomainValid(n) || (u = AddressWell.RecipientState.invalid) : u = AddressWell.isPossibleAlias(n) ? AddressWell.RecipientState.unresolved : AddressWell.RecipientState.invalid,
        new AddressWell.Recipient(r,u)
    }
    ;
    AddressWell.Recipient.fromPickerContact = function() {}
    ;
    AddressWell.Recipient.prototype.setDeleted = function() {
        this._state = AddressWell.RecipientState.deleted;
        this._recipientItem = null;
        this.raiseEvent(AddressWell.RecipientEvents.deleted, {
            sender: this
        })
    }
    ;
    AddressWell.Recipient.prototype.updateState = function(n, t) {
        if (this._state !== n) {
            var i = this._state;
            this._state = n;
            Jx.isNullOrUndefined(t) || (this._recipient = t,
            AddressWell.Recipient._applyRecipient(this._recipientItem, this));
            AddressWell.Recipient._applyState(this._recipientItem, this, i);
            this.raiseEvent(AddressWell.RecipientEvents.stateChanged, {
                sender: this
            })
        }
    }
    ;
    AddressWell.Recipient.prototype.toString = function() {
        var n = "", t;
        return Jx.isNonEmptyString(this.calculatedUIName) && (t = this.calculatedUIName,
        n += '"' + t.replace('"', '"') + '" '),
        Jx.isNonEmptyString(this.emailAddress) && (n += "<" + this.emailAddress + ">"),
        Jx.isNonEmptyString(n) && (n += ";"),
        n
    }
    ;
    AddressWell.Recipient.prototype.setId = function(n) {
        this._id = n
    }
    ;
    AddressWell.Recipient.prototype.generateHTMLElement = function(n) {
        var i = this._recipientTemplate, t;
        return Jx.isHTMLElement(i) || (i = this._recipientTemplate = document.createElement("li"),
        i.setAttribute("role", "option"),
        i.innerHTML = "<div class='aw-recipientInner' aria-hidden='true'><span id='awRecipientName' class='aw-recipientName'><\/span><\/div>"),
        t = this._recipientItem = i.cloneNode(true),
        t.id = this._id,
        t.setAttribute("data-awIndex", n.toString()),
        AddressWell.Recipient._applyRecipient(t, this),
        AddressWell.Recipient._applyState(t, this),
        t
    }
    ;
    AddressWell.Recipient._applyRecipient = function(n, t) {
        n.title = t.emailAddress;
        var i = n.querySelector(".aw-recipientName");
        i.innerText = r(t)
    }
    ;
    AddressWell.Recipient._applyState = function(t, i, u) {
        var s = i.emailAddress, h = r(i), e, f, o;
        Jx.isNumber(u) && (e = n[u],
        Jx.removeClass(t, e.styleClass));
        f = n[i.state];
        Jx.addClass(t, f.styleClass);
        o = Jx.res.loadCompoundString(AddressWell.stringsPrefix + f.ariaLabelId, h, s);
        t.setAttribute("aria-label", o)
    }
    ;
    AddressWell.RecipientParser = function(n, t) {
        this._log = t;
        this._platform = n
    }
    ;
    AddressWell.RecipientParser.prototype._log = null;
    AddressWell.RecipientParser.prototype._platform = null;
    AddressWell.RecipientParser.prototype._emailFromParser = "";
    AddressWell.RecipientParser.prototype._personNameFromParser = "";
    AddressWell.RecipientParser.prototype._parsingName = false;
    AddressWell.RecipientParser.prototype._parsingEmail = false;
    AddressWell.RecipientParser.prototype._stringBeforeSeparator = "";
    AddressWell.RecipientParser.prototype._recipients = [];
    AddressWell.RecipientParser.prototype._unparsedText = "";
    Object.defineProperty(AddressWell.RecipientParser.prototype, "unparsedText", {
        get: function() {
            return this._unparsedText
        }
    });
    AddressWell.RecipientParser.prototype.parse = function(n) {
        var t, i, u, r;
        for (this._resetAddRecipientsByStringProperties(),
        t = n,
        i = t.search(AddressWell.delimiterRegExp); i > -1; )
            if (u = t.substring(0, i),
            r = t.charAt(i),
            this._stringBeforeSeparator += u,
            r.search(AddressWell.separatorRegExp) > -1 ? this._loadRecipientsByStringSeparatorFound(u, r) : r === '"' ? this._loadRecipientsByStringQuotationFound(t, i) : r === "<" ? this._loadRecipientsByStringLeftAngleBracketFound(u) : r === ">" && this._loadRecipientsByStringRightAngleBracketFound(u),
            t.length < i + 1)
                break;
            else
                t = t.slice(i + 1),
                i = t.search(AddressWell.delimiterRegExp);
        return Jx.isNonEmptyString(this._stringBeforeSeparator) && (t = this._stringBeforeSeparator + t),
        this._unparsedText = t,
        this._recipients
    }
    ;
    AddressWell.RecipientParser.prototype._loadRecipientsByStringSeparatorFound = function(n, t) {
        var i = n.trim();
        this._parsingName || this._parsingEmail ? this._parsingName ? this._personNameFromParser += n + t : this._parsingEmail && (this._emailFromParser += i,
        Jx.isNonEmptyString(this._personNameFromParser) || (this._personNameFromParser = this._emailFromParser),
        Jx.isNonEmptyString(this._emailFromParser) && Jx.isNonEmptyString(this._personNameFromParser) && (this._recipients.push(AddressWell.Recipient.fromEmail(this._emailFromParser, this._personNameFromParser, this._platform)),
        this._emailFromParser = this._personNameFromParser = this._stringBeforeSeparator = ""),
        this._parsingEmail = false) : (this._personNameFromParser = this._personNameFromParser.trim(),
        this._emailFromParser = this._emailFromParser.trim(),
        Jx.isNonEmptyString(this._emailFromParser) || Jx.isNonEmptyString(this._personNameFromParser) ? Jx.isNonEmptyString(this._emailFromParser) && !Jx.isNonEmptyString(this._personNameFromParser) ? this._personNameFromParser = Jx.isNonEmptyString(i) ? i : this._emailFromParser : Jx.isNonEmptyString(this._personNameFromParser) && !Jx.isNonEmptyString(this._emailFromParser) && (this._emailFromParser = Jx.isNonEmptyString(i) ? i : this._personNameFromParser) : i.length > 0 && (this._personNameFromParser = this._emailFromParser = i),
        Jx.isNonEmptyString(this._emailFromParser) && Jx.isNonEmptyString(this._personNameFromParser) && (this._recipients.push(AddressWell.Recipient.fromEmail(this._emailFromParser, this._personNameFromParser, this._platform)),
        this._emailFromParser = this._personNameFromParser = this._stringBeforeSeparator = ""))
    }
    ;
    AddressWell.RecipientParser.prototype._loadRecipientsByStringQuotationFound = function(n, t) {
        var r = n.substring(0, t)
          , u = r.trim()
          , i = n.charAt(t);
        this._stringBeforeSeparator += i;
        this._parsingName ? n.charAt(t - 1) === "\\" ? this._personNameFromParser += n.substring(0, t - 1) + i : (this._personNameFromParser += r,
        this._parsingName = false) : this._parsingEmail ? this._emailFromParser += u + i : this._personNameFromParser.length === 0 && (this._parsingName = true)
    }
    ;
    AddressWell.RecipientParser.prototype._loadRecipientsByStringLeftAngleBracketFound = function(n) {
        var t = "<"
          , i = n.trim();
        this._stringBeforeSeparator += t;
        this._parsingEmail && this._emailFromParser.length > 0 ? this._emailFromParser = "" : this._parsingName ? this._personNameFromParser += n + t : this._emailFromParser.length === 0 && (i.length > 0 && this._personNameFromParser.length === 0 && (this._personNameFromParser = i),
        this._parsingEmail = true)
    }
    ;
    AddressWell.RecipientParser.prototype._loadRecipientsByStringRightAngleBracketFound = function(n) {
        var t = ">";
        this._stringBeforeSeparator += t;
        this._parsingEmail ? (this._emailFromParser += n,
        this._parsingEmail = false) : this._parsingName ? this._personNameFromParser += n + t : this._personNameFromParser.length === 0 && (this._personNameFromParser = n + t,
        this._parsingName = true)
    }
    ;
    AddressWell.RecipientParser.prototype._resetAddRecipientsByStringProperties = function() {
        this._emailFromParser = "";
        this._personNameFromParser = "";
        this._parsingName = false;
        this._parsingEmail = false;
        this._stringBeforeSeparator = "";
        this._recipients = [];
        this._unparsedText = ""
    }
    ;
    AddressWell.ServerSearch = function(n, t) {
        this._platform = n;
        this._log = t
    }
    ;
    AddressWell.ServerSearch.prototype._platform = null;
    AddressWell.ServerSearch.prototype._peopleManager = null;
    AddressWell.ServerSearch.prototype._accountManager = null;
    AddressWell.ServerSearch.prototype._log = null;
    AddressWell.ServerSearch.prototype._onComplete = null;
    AddressWell.ServerSearch.prototype._onError = null;
    AddressWell.ServerSearch.prototype._searchPending = false;
    AddressWell.ServerSearch.prototype._lvCollection = null;
    AddressWell.ServerSearch.prototype._lvCollectionChangedHandler = null;
    AddressWell.ServerSearch.prototype._lvInput = "";
    AddressWell.ServerSearch.prototype._lvResults = [];
    AddressWell.ServerSearch.prototype._lvCompleteCallback = null;
    AddressWell.ServerSearch.prototype._lvSearchId = 0;
    AddressWell.ServerSearch.prototype._lvSearchErrorType = AddressWell.SearchErrorType.none;
    AddressWell.ServerSearch.prototype._lvConnectedAccount = null;
    AddressWell.ServerSearch.prototype._lvMinProgressTimeout = null;
    AddressWell.ServerSearch.prototype._lvMinProgressTimeoutCallback = null;
    AddressWell.ServerSearch.prototype._lvSearchPromise = null;
    Object.defineProperty(AddressWell.ServerSearch.prototype, "searchPending", {
        get: function() {
            return this._searchPending
        }
    });
    AddressWell.ServerSearch.prototype.queryAsync = function(n, t, i, r) {
        this._lvInput = n;
        this._lvConnectedAccount = t;
        this._onComplete = i;
        this._onError = r;
        this._searchPending = true;
        var u = this._queryContactsByInputInit.bind(this)
          , f = this._queryContactsByInputCancel.bind(this);
        this._lvSearchPromise = new WinJS.Promise(u,f);
        WinJS.Promise.timeout(AddressWell.maxSearchDuration, this._lvSearchPromise).done(function(n) {
            msSetImmediate(this._queryContactsByInputOnComplete.bind(this), n)
        }
        .bind(this), function(n) {
            msSetImmediate(this._queryContactsByInputOnError.bind(this), n)
        }
        .bind(this))
    }
    ;
    AddressWell.ServerSearch.prototype.cancel = function() {
        this._lvSearchPromise !== null && (this._lvSearchPromise.cancel(),
        this._lvSearchPromise = null)
    }
    ;
    AddressWell.ServerSearch.prototype._queryContactsByInputInit = function(n) {
        this._lvCompleteCallback = n;
        this._lvResults = [];
        this._lvSearchErrorType = AddressWell.SearchErrorType.none;
        this._lvSearchId > AddressWell.maxSearchCounter ? this._lvSearchId = 0 : this._lvSearchId++;
        Jx.isWWA && this._platform !== null ? (this._peopleManager === null && (Jx.log.verbose("AddressWell.ServerSearch - setting peopleManager"),
        this._peopleManager = this._platform.peopleManager),
        this._peopleManager !== null ? (this._lvCollectionDispose(),
        this._connectedAccountSearch()) : (Jx.log.error("Error in AddressWell.ServerSearch._queryContactsByInputInit - null peopleManager"),
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults,
        this._queryContactsByInputEnd())) : (Jx.log.error("Error in AddressWell.ServerSearch._queryContactsByInputInit - null contacts platform"),
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults,
        this._queryContactsByInputEnd())
    }
    ;
    AddressWell.ServerSearch.prototype._queryContactsByInputEnd = function() {
        Jx.isFunction(this._lvCompleteCallback) && (Jx.log.verbose("AddressWell.ServerSearch._queryContactsByInputEnd is calling completeCallback function"),
        this._lvCompleteCallback(this._lvSearchId))
    }
    ;
    AddressWell.ServerSearch.prototype._queryContactsByInputCancel = function() {
        Jx.log.verbose("AddressWell.ServerSearch._queryContactsByInputCancel");
        this._lvSearchErrorType = AddressWell.SearchErrorType.cancelled;
        this._queryContactsByInputEnd()
    }
    ;
    AddressWell.ServerSearch.prototype._connectedAccountSearch = function() {
        if (Jx.log.verbose("AddressWell.ServerSearch._connectedAccountSearch"),
        this._lvConnectedAccount === null)
            Jx.log.error("Null account detected in AddressWell.ServerSearch._connectedAccountSearch"),
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults,
            this._queryContactsByInputEnd();
        else
            try {
                this._lvCollection = this._peopleManager.searchServer(this._lvInput, AddressWell.maxConnectedAccountSearchResults, this._lvConnectedAccount, 0);
                this._lvCollectionChangedHandler = this._lvCollectionChanged.bind(this);
                this._lvCollection.addEventListener("collectionchanged", this._lvCollectionChangedHandler);
                this._lvCollection.unlock()
            } catch (n) {
                Jx.fault("AddressWell.AddressWellController.js", "_connectedAccountSearch", n);
                this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
                this._queryContactsByInputEnd()
            }
    }
    ;
    AddressWell.ServerSearch.prototype._lvCollectionDispose = function() {
        if (this._lvCollection !== null) {
            Jx.log.verbose("AddressWell.ServerSearch._lvCollectionDispose resetting collection object and its collectionChanged handler");
            try {
                this._lvCollection.removeEventListener("collectionchanged", this._lvCollectionChangedHandler);
                this._lvCollection.dispose()
            } catch (n) {
                Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionDispose", n)
            } finally {
                this._lvCollection = null;
                this._lvCollectionChangedHandler = null
            }
        }
        this._lvSearchPromise !== null && (Jx.log.verbose("AddressWell.ServerSearch._lvCollectionDispose cancelling current _lvSearchPromise"),
        this._lvSearchPromise.cancel(),
        this._lvSearchPromise = null)
    }
    ;
    AddressWell.ServerSearch.prototype._lvCollectionChanged = function(n) {
        var t = n.eType;
        Jx.log.verbose("AddressWell.ServerSearch._lvCollectionChanged invoked with eventArgs.eType: " + t.toString());
        t === Microsoft.WindowsLive.Platform.CollectionChangeType.serverSearchComplete && (Jx.log.verbose("AddressWell.ServerSearch._lvCollectionChanged invoked with searchComplete"),
        this._lvCollectionChangedSearchComplete(n))
    }
    ;
    AddressWell.ServerSearch.prototype._lvCollectionChangedSearchComplete = function(n) {
        try {
            Jx.log.verbose("AddressWell.ServerSearch._lvCollectionChangedSearchComplete searching connected account with eventArgs.index: " + n.index.toString());
            n.index === 1 && this._lvCollection.count > 0 ? this._loopThroughCollection() : (n.index === 3 ? this._lvSearchErrorType = AddressWell.SearchErrorType.serverError : n.index === 7 ? this._lvSearchErrorType = AddressWell.SearchErrorType.connectionError : (Jx.log.error("AddressWell.ServerSearch._lvCollectionChangedSearchComplete searching connected account with eventArgs.index: " + n.index + " and _lvCollection.count: " + this._lvCollection.count),
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults),
            this._queryContactsByInputEnd())
        } catch (t) {
            Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionChangedSearchComplete", t);
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
            this._queryContactsByInputEnd()
        }
    }
    ;
    AddressWell.ServerSearch.prototype._loopThroughCollection = function() {
        var r = AddressWell.maxConnectedAccountSearchResults, t, i, n;
        try {
            if (t = this._lvCollection.count,
            t > 0)
                for (i = null,
                n = 0; n < t; n++)
                    if (i = this._lvCollection.item(n),
                    this._addPersonToSearchResults(this._lvResults, i) >= r)
                        break
        } catch (u) {
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
            Jx.fault("AddressWell.AddressWellController.js", "_loopThroughCollection", u)
        } finally {
            this._queryContactsByInputEnd()
        }
    }
    ;
    AddressWell.ServerSearch.prototype._addPersonToSearchResults = function(n, t) {
        var i = t.mostRelevantEmail, r;
        return n.length < AddressWell.maxConnectedAccountSearchResults && Jx.isNonEmptyString(i) && (r = AddressWell.getUserTileUrl(t, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall),
        n.push(new AddressWell.Contact(t,[t.createRecipient(i)],r))),
        n.length
    }
    ;
    AddressWell.ServerSearch.prototype._queryContactsByInputOnComplete = function(n) {
        this._searchPending = false;
        Jx.log.verbose("AddressWell.ServerSearch._queryContactsByInputOnComplete with searchId: " + n.toString() + " and this._lvSearchId: " + this._lvSearchId.toString());
        n === this._lvSearchId && (this._lvSearchErrorType !== AddressWell.SearchErrorType.none ? this._onError.call(null, this._lvSearchErrorType) : this._lvCollection !== null && this._onComplete(this._lvResults),
        this._lvCollectionDispose())
    }
    ;
    AddressWell.ServerSearch.prototype._queryContactsByInputOnError = function(n) {
        Jx.log.exception("AddressWell.ServerSearch._queryContactsByInputOnError is invoked with exception.", n);
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        this._queryContactsByInputOnComplete(this._lvSearchId)
    }
    ;
    AddressWell.AutoResolver = function(n, t) {
        this._platform = n;
        this._log = t
    }
    ;
    AddressWell.AutoResolver.prototype._platform = null;
    AddressWell.AutoResolver.prototype._searchAgent = null;
    AddressWell.AutoResolver.prototype._activeQuery = null;
    AddressWell.AutoResolver.prototype._queue = [];
    AddressWell.AutoResolver.prototype._processingQueue = false;
    AddressWell.AutoResolver.prototype._queueTimerId = null;
    Object.defineProperty(AddressWell.AutoResolver.prototype, "workPending", {
        get: function() {
            return this._queue.length > 0
        }
    });
    o.prototype = {
        recipient: null,
        account: null
    };
    AddressWell.AutoResolver.prototype.resolveAgainstCurrentResults = function(n, t) {
        this._resolveAgainstResultSet(n, t)
    }
    ;
    AddressWell.AutoResolver.prototype.resolveAgainstServerAsync = function(n, t) {
        var i = t;
        this._queue.push({
            recipient: n,
            account: t
        });
        this._processingQueue || this._processQueue()
    }
    ;
    AddressWell.AutoResolver.prototype.cancel = function() {
        this._queue.length = 0;
        this._searchAgent !== null && this._searchAgent.cancel();
        Jx.isNumber(this._queueTimerId) && (clearTimeout(this._queueTimerId),
        this._queueTimerId = null)
    }
    ;
    AddressWell.AutoResolver.prototype._processQueue = function() {
        var n, t;
        if (this._queue.length > 0) {
            this._processingQueue = true;
            do
                n = this._queue.shift();
            while (Jx.isObject(n) && n.recipient.state === AddressWell.RecipientState.deleted);Jx.isObject(n) ? (this._activeQuery = n,
            t = this._searchAgent,
            t || (t = this._searchAgent = new AddressWell.ServerSearch(this._platform,this._log)),
            n.recipient.updateState(AddressWell.RecipientState.pendingResolution),
            n.recipient.addListener(AddressWell.RecipientEvents.deleted, this._recipientDeletedHandler, this),
            t.queryAsync(n.recipient.emailAddress, n.account, function(t) {
                n.recipient.state !== AddressWell.RecipientState.deleted && (this._resolveAgainstResultSet(n.recipient, t),
                n.recipient.state === AddressWell.RecipientState.pendingResolution && n.recipient.updateState(AddressWell.RecipientState.unresolvable));
                this._postProcessQueue()
            }
            .bind(this), function(t) {
                n.recipient.state !== AddressWell.RecipientState.deleted && n.recipient.updateState(AddressWell.RecipientState.unresolvable);
                this._postProcessQueue();
                Jx.log.error("AddressWell.AutoResolver._processQueue failed at queryAsync() with errorCode = " + t)
            }
            .bind(this))) : this._processingQueue = false
        }
    }
    ;
    AddressWell.AutoResolver.prototype._postProcessQueue = function() {
        if (this._activeQuery && this._activeQuery.recipient.removeListener(AddressWell.RecipientEvents.deleted, this._recipientDeletedHandler, this),
        this._processingQueue = false,
        this._activeQuery = null,
        this._queue.length > 0) {
            var n = this._processQueue.bind(this);
            this._queueTimerId = setTimeout(n, 50)
        }
    }
    ;
    AddressWell.AutoResolver.prototype._recipientDeletedHandler = function() {
        this._searchAgent.cancel()
    }
    ;
    AddressWell.AutoResolver.prototype._resolveAgainstResultSet = function(n, t) {
        var r = n.emailAddress.toLowerCase(), i, u;
        i = [];
        t.forEach(function(n) {
            var t = n.person;
            t.objectType === "SearchPerson" ? r === t.alias.toLowerCase() && i.push(n.recipients[0]) : n.recipients.forEach(function(n) {
                var t = n.emailAddress.substring(0, n.emailAddress.indexOf("@")).toLowerCase();
                r === t && i.push(n)
            }, this)
        }, this);
        i.length >= 1 && (u = i[0].emailAddress.toLowerCase(),
        i.every(function(n) {
            return n.emailAddress.toLowerCase() === u
        }) ? n.updateState(AddressWell.RecipientState.resolved, i[0]) : n.updateState(AddressWell.RecipientState.unresolvable))
    }
    ;
    AddressWell.Controller = function(n, t, i, r, u, f, e) {
        if (!Jx.isNonEmptyString(n))
            throw new Error("idPrefix parameter must be not null and non empty");
        Jx.isArray(t) || (t = []);
        this._contactSelectionMode = Jx.isNonEmptyString(f) ? f : AddressWell.ContactSelectionMode.emailContacts;
        this._animationMetrics = Windows.UI.Core.AnimationMetrics;
        this._showSuggestions = !!r;
        Jx.isBoolean(e) || (e = true);
        this._log = new Jx.Log;
        this._log.enabled = true;
        this._log.level = Jx.LOG_VERBOSE;
        t = t.filter(function(n) {
            return !Jx.isNullOrUndefined(n)
        }).map(function(n) {
            return new AddressWell.Recipient(n)
        });
        var o = AddressWell.DropDownButtonType.none;
        this._contactSelectionMode === AddressWell.ContactSelectionMode.roomContacts && (o = AddressWell.DropDownButtonType.roomsSelector);
        this._input = new AddressWell.Input(n,t,i,this._log,u,e);
        this._dropDown = new AddressWell.DropDown(n,this._log,o);
        this._input.setSearchOnEnter(this._contactSelectionMode === AddressWell.ContactSelectionMode.roomContacts);
        this._peoplePicker = new AddressWell.PeoplePicker;
        this.initComponent();
        this.append(this._input, this._dropDown);
        this._id = n + "AWT";
        this._containerId = n + "AWC";
        this._platform = i;
        t.length !== 0 && Jx.bici.addToStream(AddressWell.selectionBiciId, AddressWell.RecipientAddMethod.preFilled, t.length)
    }
    ;
    Jx.augment(AddressWell.Controller, Jx.Component);
    Jx.augment(AddressWell.Controller, Jx.Events);
    AddressWell.Controller.prototype._input = null;
    AddressWell.Controller.prototype._dropDown = null;
    AddressWell.Controller.prototype._peoplePicker = null;
    AddressWell.Controller.prototype._containerElement = null;
    AddressWell.Controller.prototype._containerFocus = null;
    AddressWell.Controller.prototype._containerBlur = null;
    AddressWell.Controller.prototype._containerId = "";
    AddressWell.Controller.prototype._uiInitialized = false;
    AddressWell.Controller.prototype._platform = null;
    AddressWell.Controller.prototype._peopleManager = null;
    AddressWell.Controller.prototype._accountManager = null;
    AddressWell.Controller.prototype._showSuggestions = false;
    AddressWell.Controller.prototype._log = null;
    AddressWell.Controller.prototype._inputPane = null;
    AddressWell.Controller.prototype._inputPaneShowingHandler = null;
    AddressWell.Controller.prototype._inputPaneHidingHandler = null;
    AddressWell.Controller.prototype._scrollableElement = null;
    AddressWell.Controller.prototype._inputPaneShowingTimeout = null;
    AddressWell.Controller.prototype._animationMetrics = Windows.UI.Core.AnimationMetrics;
    AddressWell.Controller.prototype._contactSelectionMode = "";
    AddressWell.Controller.prototype._isDisabled = false;
    AddressWell.Controller.prototype._contextualAccount = null;
    AddressWell.Controller.prototype._wordWheelSearchOp = null;
    AddressWell.Controller.prototype._autoSuggestOnFocus = true;
    AddressWell.Controller.prototype._firstRecipientAdded = false;
    AddressWell.Controller.prototype._scrollsIntoView = true;
    AddressWell.Controller.prototype._lvCollection = null;
    AddressWell.Controller.prototype._lvCollectionChangedHandler = null;
    AddressWell.Controller.prototype._lvInput = "";
    AddressWell.Controller.prototype._lvResults = [];
    AddressWell.Controller.prototype._lvCompleteCallback = null;
    AddressWell.Controller.prototype._lvSearchId = 0;
    AddressWell.Controller.prototype._lvSearchType = 0;
    AddressWell.Controller.prototype._lvSearchErrorType = AddressWell.SearchErrorType.none;
    AddressWell.Controller.prototype._lvConnectedAccount = null;
    AddressWell.Controller.prototype._lvSearchPromise = null;
    AddressWell.Controller.prototype._serverSearchAgent = null;
    AddressWell.Controller.prototype._autoResolver = null;
    AddressWell.Controller.prototype.getUI = function(n) {
        var i = Jx.getUI(this._input)
          , r = Jx.getUI(this._dropDown)
          , t = "";
        this._isDisabled && (t = ' aria-disabled="true"');
        n.html = '<div id="' + this._id + '" class="aw-root"' + t + '><div id="' + this._containerId + '" class="aw-iddContainer">' + i.html + r.html + "<\/div><\/div>"
    }
    ;
    AddressWell.Controller.prototype.activateUI = function() {
        if (Jx.Component.prototype.activateUI.call(this),
        !this._uiInitialized) {
            var n = AddressWell.Controller.prototype;
            this._resizeHelper = n._resizeHelper.bind(this);
            this.resize = n.resize.bind(this);
            this._containerElement = document.getElementById(this._containerId);
            this._input.bindAttr2Way(AddressWell.highlightAreaAttr, this._dropDown, AddressWell.highlightAreaAttr);
            this._dropDown.bindAttr(AddressWell.highlightIdAttr, this._input, AddressWell.highlightIdAttr);
            this._dropDown.bindAttr(AddressWell.dropDownVisibleAttr, this._input, AddressWell.dropDownVisibleAttr);
            this._dropDown.bindAttr(AddressWell.firstDropDownItemId, this._input, AddressWell.firstDropDownItemId);
            this._input.addListener(AddressWell.Events.userInputChanged, this._userInputChanged, this);
            this._input.addListener(AddressWell.Events.focus, this._onInputFocus, this);
            this._input.addListener(AddressWell.Events.msGestureTap, this._onInputClick, this);
            this._input.addListener(AddressWell.Events.addressWellEscapeKey, this._inputEscapeKeyHandler, this);
            this._input.addListener(AddressWell.Events.arrowKey, this._onArrowKey, this);
            this._input.addListener(AddressWell.Events.pageKey, this._dropDown.handlePageUpDownKey, this._dropDown);
            this._input.addListener(AddressWell.Events.addressWellCompleteKey, this._dropDown.handleCompleteKey, this._dropDown);
            this._input.addListener(AddressWell.Events.addressWellTabKey, this._handleTab, this);
            this._input.addListener(AddressWell.Events.scrollIntoView, this._scrollIntoView, this);
            this._input.addListener(AddressWell.Events.recipientsAdded, this._onRecipientsAdded, this);
            this._input.addListener(AddressWell.Events.recipientRemoved, function() {
                this.raiseEvent(AddressWell.Events.recipientRemoved)
            }, this);
            this._input.addListener(AddressWell.Events.showingContextMenu, this._onContextMenu, this);
            this._input.addListener(AddressWell.Events.viewProfile, this._viewProfileHandler, this);
            this._input.addListener(AddressWell.Events.inputOffsetAdjusted, this._inputOffsetAdjusted, this);
            this._input.addListener(AddressWell.Events.imeWindowHeightUpdated, this._inputImeWindowHeightUpdated, this);
            this._dropDown.addListener(AddressWell.Events.recipientsSelected, this._addDropDownRecipients, this);
            this._dropDown.addListener(AddressWell.Events.dropDownKeyDown, this._input.containerKeyDownHandler, this._input);
            this._dropDown.addListener(AddressWell.Events.addressWellEscapeKey, this._inputEscapeKeyHandler, this);
            this._dropDown.addListener(AddressWell.Events.dropDownReady, this._dropDownReadyHandler, this);
            (this._contactSelectionMode === AddressWell.ContactSelectionMode.emailContacts || this._contactSelectionMode === AddressWell.ContactSelectionMode.roomContacts) && (this._input.addListener(AddressWell.Events.searchFirstConnectedAccount, this._searchFirstConnectedAccount, this),
            this._input.addListener(AddressWell.Events.autoResolve, this._autoResolveRecipient, this),
            this._dropDown.addListener(AddressWell.Events.searchLinkSelected, this._searchConnectedAccountId, this));
            this._peoplePicker.addListener(AddressWell.Events.addPeopleFromPicker, this._addRecipientsByPeoplePickerResults, this);
            this._input.setAriaControls(this._dropDown.getAriaControlledId());
            this._dropDown.setAriaControls(this._input.getAriaControlledId());
            this._containerFocus = this._containerFocusHandler.bind(this);
            this._containerElement.addEventListener(AddressWell.Events.focus, this._containerFocus, true);
            this._inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            this._inputPaneShowingHandler = this._inputPaneShowing.bind(this);
            this._inputPaneHidingHandler = this._inputPaneHiding.bind(this);
            this._inputPane.addEventListener("showing", this._inputPaneShowingHandler);
            this._inputPane.addEventListener("hiding", this._inputPaneHidingHandler);
            window.addEventListener(AddressWell.Events.resize, this.resize, false);
            this._uiInitialized = true
        }
    }
    ;
    AddressWell.Controller.prototype.deactivateUI = function() {
        Jx.Component.prototype.deactivateUI.call(this);
        this._uiInitialized && (this._input.removeListener(AddressWell.Events.userInputChanged, this._userInputChanged, this),
        this._input.removeListener(AddressWell.Events.addressWellEscapeKey, this._inputEscapeKeyHandler, this),
        this._input.removeListener(AddressWell.Events.arrowKey, this._onArrowKey, this),
        this._input.removeListener(AddressWell.Events.addressWellCompleteKey, this._dropDown.handleCompleteKey, this._dropDown),
        this._input.removeListener(AddressWell.Events.pageKey, this._dropDown.handlePageUpDownKey, this._dropDown),
        this._input.removeListener(AddressWell.Events.addressWellTabKey, this._handleTab, this),
        this._input.removeListener(AddressWell.Events.scrollIntoView, this._scrollIntoView, this),
        this._input.removeListener(AddressWell.Events.viewProfile, this._viewProfileHandler, this),
        this._input.removeListener(AddressWell.Events.recipientsAdded, this._onRecipientsAdded, this),
        this._input.removeListener(AddressWell.Events.showingContextMenu, this._onContextMenu, this),
        this._input.removeListener(AddressWell.Events.focus, this._onInputFocus, this),
        this._input.removeListener(AddressWell.Events.msGestureTap, this._onInputClick, this),
        this._input.removeListener(AddressWell.Events.inputOffsetAdjusted, this._inputOffsetAdjusted, this),
        this._input.removeListener(AddressWell.Events.imeWindowHeightUpdated, this._inputImeWindowHeightUpdated, this),
        this._dropDown.removeListener(AddressWell.Events.recipientsSelected, this._addDropDownRecipients, this),
        this._dropDown.removeListener(AddressWell.Events.dropDownKeyDown, this._input.containerKeyDownHandler, this._input),
        this._dropDown.removeListener(AddressWell.Events.addressWellEscapeKey, this._inputEscapeKeyHandler, this),
        this._dropDown.removeListener(AddressWell.Events.dropDownReady, this._dropDownReadyHandler, this),
        (this._contactSelectionMode === AddressWell.ContactSelectionMode.emailContacts || this._contactSelectionMode === AddressWell.ContactSelectionMode.roomContacts) && (this._input.removeListener(AddressWell.Events.searchFirstConnectedAccount, this._searchFirstConnectedAccount, this),
        this._input.removeListener(AddressWell.Events.autoResolve, this._autoResolveRecipient, this),
        this._dropDown.removeListener(AddressWell.Events.searchLinkSelected, this._searchConnectedAccountId, this)),
        this._peoplePicker.removeListener(AddressWell.Events.addPeopleFromPicker, this._addRecipientsByPeoplePickerResults, this),
        this._containerElement.removeEventListener(AddressWell.Events.focus, this._containerFocus, true),
        this._inputPane.removeEventListener("showing", this._inputPaneShowingHandler),
        this._inputPane.removeEventListener("hiding", this._inputPaneHidingHandler),
        this._inputPane = null,
        window.removeEventListener(AddressWell.Events.resize, this.resize, false),
        this._removeContainerListener(),
        this.resize = null,
        this._resizeHelper = null,
        this._clearInputPaneShowingTimeout(),
        this._clearProcessInputTimeout(),
        this._lvCollectionDispose(),
        this.cancelPendingSearches(),
        this._uiInitialized = false)
    }
    ;
    AddressWell.Controller.prototype.addRecipientsByString = function(n) {
        this._input.addRecipientsByString(n + ";", AddressWell.RecipientAddMethod.preFilled)
    }
    ;
    AddressWell.Controller.prototype.addRecipients = function(n, t) {
        t ? this._input.addRecipients(n, AddressWell.RecipientAddMethod.preFilled) : this._input.addRecipients(n)
    }
    ;
    AddressWell.Controller.prototype.getRecipients = function() {
        return this._input.getRecipients(false)
    }
    ;
    AddressWell.Controller.prototype.getRecipientsStringInNameEmailPairs = function() {
        return this._input.getRecipientsStringInNameEmailPairs()
    }
    ;
    AddressWell.Controller.prototype.deleteRecipientByEmail = function(n) {
        this._input.deleteRecipientByEmail(n)
    }
    ;
    AddressWell.Controller.prototype.getError = function() {
        return this._input.getError()
    }
    ;
    AddressWell.Controller.prototype.focusInput = function(n) {
        this._input.focus(n)
    }
    ;
    AddressWell.Controller.prototype.getIsDirty = function() {
        return this._input.isDirty
    }
    ;
    AddressWell.Controller.prototype.resetIsDirty = function() {
        this._input.isDirty = false
    }
    ;
    AddressWell.Controller.prototype.getInputElementId = function() {
        return this._input.getInputElementId()
    }
    ;
    AddressWell.Controller.prototype.resize = function() {
        Jx.log.verbose("AddressWell.Controller.resize has occurred");
        requestAnimationFrame(this._resizeHelper)
    }
    ;
    AddressWell.Controller.prototype._resizeHelper = function() {
        this._input.adjustInputFieldLength(false)
    }
    ;
    AddressWell.Controller.prototype.clearInput = function() {
        this._input.clear();
        this.resetIsDirty();
        this.cancelPendingSearches()
    }
    ;
    AddressWell.Controller.prototype.clear = function() {
        this.clearInput();
        this._navigateAway();
        this._firstRecipientAdded = false
    }
    ;
    AddressWell.Controller.prototype.cancelPendingSearches = function() {
        var n = this._autoResolver;
        Jx.isNullOrUndefined(n) || n.cancel();
        this._cancelExplicitServerSearch();
        this._cancelWordWheelSearch()
    }
    ;
    AddressWell.Controller.prototype.launchPeoplePicker = function() {
        this._peoplePicker.launchPeoplePicker()
    }
    ;
    AddressWell.Controller.prototype.setLabelledBy = function(n) {
        Jx.isHTMLElement(this._input._inputElement) && this._input._inputElement.setAttribute("aria-labelledby", n)
    }
    ;
    AddressWell.Controller.prototype.setAriaLabel = function(n) {
        Jx.isHTMLElement(this._input._inputElement) && this._input._inputElement.setAttribute("aria-label", n)
    }
    ;
    AddressWell.Controller.prototype.setAriaFlow = function(n, t) {
        this._input.setAriaFlow(n, t)
    }
    ;
    AddressWell.Controller.prototype.hasFocus = function() {
        return this._input.hasFocus()
    }
    ;
    AddressWell.Controller.prototype.setDisabled = function(n) {
        if (this.hasUI()) {
            var t = document.getElementById(this._id);
            t.setAttribute("aria-disabled", String(n))
        }
        this._input && this._input.setDisabled(n);
        this._isDisabled = n
    }
    ;
    AddressWell.Controller.prototype.setContextualAccount = function(n) {
        this._contextualAccount = n
    }
    ;
    AddressWell.Controller.prototype.setAutoSuggestOnFocus = function(n) {
        this._autoSuggestOnFocus = n
    }
    ;
    AddressWell.Controller.prototype.setScrollsIntoView = function(n) {
        this._scrollsIntoView = n
    }
    ;
    AddressWell.Controller.prototype._addRecipientsByPeoplePickerResults = function(n) {
        var r, i, t, u;
        if (AddressWell.markStart("Controller.addRecipientsByPickerResults"),
        n) {
            for (r = [],
            i = null,
            t = 0,
            u = n.length; t < u; t++)
                i = n[t].emails[0],
                !Jx.isNullOrUndefined(i) && Jx.isNonEmptyString(i.address) && Jx.isNonEmptyString(n[t].displayName) ? r.push(AddressWell.Recipient.fromEmail(i.address, n[t].displayName, this._platform)) : Jx.log.error("Error in AddressWell.PeoplePicker._pickerResults: Contact selected from the People Picker that did not have a name and email address.  This does not break any code, but does mean the contact provider did not respect the requested fields.");
            this._input.addRecipients(r, AddressWell.RecipientAddMethod.peoplePicker)
        }
        AddressWell.markStop("Controller.addRecipientsByPickerResult")
    }
    ;
    AddressWell.Controller.prototype._getScrollableElement = function() {
        if (!Jx.isHTMLElement(this._scrollableElement)) {
            this._scrollableElement = this._containerElement;
            var t, n;
            do
                if (this._scrollableElement = this._scrollableElement.parentNode,
                Jx.isNullOrUndefined(this._scrollableElement))
                    break;
                else if (t = this._scrollableElement.getComputedStyle(),
                Jx.isNullOrUndefined(t))
                    break;
                else
                    n = this._scrollableElement.getComputedStyle().overflowY;
            while (n !== "scroll" && n !== "auto")
        }
        return Jx.isHTMLElement(this._scrollableElement) || (Jx.log.info("AddressWell.Controller._getScrollableElement: Unable to find scrollable element, defaulting to body tag"),
        this._scrollableElement = document.body),
        this._scrollableElement
    }
    ;
    AddressWell.Controller.prototype._navigateAway = function() {
        Jx.log.verbose("AddressWell.Controller._navigateAway " + this._id);
        this._input.completeUserInput(false);
        this._clearProcessInputTimeout();
        this._dropDown.removeAriaLive();
        this._dropDown.hide();
        this._lvCollectionDispose();
        this._cancelExplicitServerSearch();
        this._cancelWordWheelSearch();
        this._input.clearHighlight();
        this._removeContainerListener();
        this._input.removeFocusFromContainer();
        this.raiseEvent(AddressWell.Events.addressWellBlur);
        this._autoSuggestOnFocus = true
    }
    ;
    AddressWell.Controller.prototype._cancelExplicitServerSearch = function() {
        var n = this._serverSearchAgent;
        !Jx.isNullOrUndefined(n) && n.searchPending && (n.cancel(),
        this._dropDown.hide())
    }
    ;
    AddressWell.Controller.prototype._cancelWordWheelSearch = function() {
        Jx.log.verbose("AddressWell.Controller._cancelWordWheelSearch");
        this._wordWheelSearchOp && (this._wordWheelSearchOp.cancel(),
        this._wordWheelSearchOp = null,
        AddressWell.markStop("_wordWheelSearch"))
    }
    ;
    AddressWell.Controller.prototype._handleTab = function(n) {
        var t = this._dropDown.isVisible();
        !t || Jx.isNullOrUndefined(this._dropDown.getAttr(AddressWell.highlightIdAttr)) || this._dropDown.bottomButtonEnabled ? this._input.isImeActive() && t ? n.preventDefault() : this._dropDown.bottomButtonEnabled && this._dropDown.setAttr(AddressWell.highlightAreaAttr, null) : (this._dropDown.handleCompleteKey(),
        this.focusInput(),
        n.preventDefault())
    }
    ;
    AddressWell.Controller.prototype._containerFocusHandler = function() {
        this._attachContainerListener()
    }
    ;
    AddressWell.Controller.prototype._containerBlurHandler = function(n) {
        this._isFocusInControl() ? Jx.isNullOrUndefined(n) || Jx.isNullOrUndefined(n.target) || n.target.id !== this._input._inputFieldId || this._dropDown.currentView !== AddressWell.DropDownView.peopleSearchList && this._dropDown.currentView !== AddressWell.DropDownView.connectedAccountList && this._dropDown.currentView !== AddressWell.DropDownView.suggestionsList || this._dropDown.bottomButtonEnabled && document.activeElement.id === this._dropDown.bottomButtonId || this.focusInput() : this._navigateAway()
    }
    ;
    AddressWell.Controller.prototype._isFocusInControl = function() {
        for (var n = document.activeElement, i = false, t = 0; t < AddressWell.maxChildrenLayer; t++)
            if (!Jx.isNullOrUndefined(n))
                if (n.id === this._input._id || n.id === this._dropDown._id) {
                    i = true;
                    break
                } else
                    n = n.parentNode;
        return i
    }
    ;
    AddressWell.Controller.prototype._viewProfileHandler = function(n) {
        People.ContactCard.show(n.person, n.item, this._contextualAccount)
    }
    ;
    AddressWell.Controller.prototype._onContextMenu = function() {
        this._dropDown.hide()
    }
    ;
    AddressWell.Controller.prototype._onRecipientsAdded = function() {
        this._firstRecipientAdded = true;
        this.raiseEvent(AddressWell.Events.recipientsAdded)
    }
    ;
    AddressWell.Controller.prototype._addDropDownRecipients = function(n) {
        var t = n.recipients
          , i = {
            recipients: t,
            cancelled: false
        };
        this.raiseEvent(AddressWell.Events.beforeRecipientsAdded, i);
        i.cancelled || (t = t.map(function(n) {
            return new AddressWell.Recipient(n)
        }),
        this._input.addRecipients(t, AddressWell.RecipientAddMethod.wordWheel))
    }
    ;
    AddressWell.Controller.prototype._autoResolveRecipient = function(n) {
        var t = n.recipient, r = this._lvResults || [], i;
        this._autoResolver || (this._autoResolver = new AddressWell.AutoResolver(this._platform,this._log));
        this._autoResolver.resolveAgainstCurrentResults(t, r);
        t.state === AddressWell.RecipientState.unresolved && (i = this._getConnectedAccount(),
        i ? (t.addListener(AddressWell.RecipientEvents.stateChanged, this._onRecipientStateChanged, this),
        this._autoResolver.resolveAgainstServerAsync(t, i)) : t.updateState(AddressWell.RecipientState.unresolvable))
    }
    ;
    AddressWell.Controller.prototype._inputEscapeKeyHandler = function() {
        this._lvCollectionDispose();
        this._cancelExplicitServerSearch();
        this._cancelWordWheelSearch();
        this._input.clearHighlight();
        this._dropDown.hide()
    }
    ;
    AddressWell.Controller.prototype._queryRelevantContacts = function(n, t) {
        var r, u, i, o, f, e;
        for (this._peopleManager || (this._peopleManager = this._platform.peopleManager),
        r = this._peopleManager.getSuggestions(t, Microsoft.WindowsLive.Platform.RelevanceScenario.toLine, this._contextualAccount, n),
        u = [],
        i = 0,
        o = r.length; i < o; i++)
            f = r[i],
            e = f.person,
            u.push(new AddressWell.Contact(e,[f],AddressWell.getUserTileUrl(e, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall)));
        return u
    }
    ;
    AddressWell.Controller.prototype._queryContactsByInputAsync = function(n, t, i) {
        this._lvInput = n;
        this._lvSearchType = t;
        this._lvConnectedAccount = i;
        var r = this._queryContactsByInputInit.bind(this)
          , u = this._queryContactsByInputCancel.bind(this);
        return new WinJS.Promise(r,u)
    }
    ;
    AddressWell.Controller.prototype._queryContactsByInputInit = function(n) {
        if (this._lvCompleteCallback = n,
        this._lvResults = [],
        this._lvSearchErrorType = AddressWell.SearchErrorType.none,
        this._lvSearchId > AddressWell.maxSearchCounter ? this._lvSearchId = 0 : this._lvSearchId++,
        this._lvSearchType === AddressWell.ListViewSearchType.people,
        Jx.isWWA && this._platform !== null)
            if (this._peopleManager === null && (Jx.log.verbose("AddressWell.Controller - setting peopleManager"),
            this._peopleManager = this._platform.peopleManager),
            this._peopleManager !== null) {
                this._lvCollectionDispose();
                var t = this._serverSearchAgent;
                t && t.cancel();
                this._chatSearch()
            } else
                Jx.log.error("Error in AddressWell.Controller._queryContactsByInputInit - null peopleManager"),
                this._lvSearchErrorType = AddressWell.SearchErrorType.noResults,
                this._queryContactsByInputEnd();
        else
            Jx.log.error("Error in AddressWell.Controller._queryContactsByInputInit - null contacts platform"),
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults,
            this._queryContactsByInputEnd()
    }
    ;
    AddressWell.Controller.prototype._queryContactsByInputEnd = function() {
        Jx.isFunction(this._lvCompleteCallback) && (Jx.log.verbose("AddressWell.Controller._queryContactsByInputEnd is calling completeCallback function"),
        this._lvCompleteCallback(this._lvSearchId))
    }
    ;
    AddressWell.Controller.prototype._queryContactsByInputCancel = function() {
        Jx.log.verbose("AddressWell.Controller._queryContactsByInputCancel");
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        this._queryContactsByInputEnd()
    }
    ;
    AddressWell.Controller.prototype._wordWheelSearch = function(n) {
        AddressWell.markStart("_wordWheelSearch");
        this._peopleManager || (this._peopleManager = this._platform.peopleManager);
        var t = this._input.getRecipients(true);
        this._wordWheelSearchOp = this._peopleManager.addressWellSearchAsync(n, Windows.Globalization.Language.currentInputMethodLanguageTag.toString(), Microsoft.WindowsLive.Platform.RelevanceScenario.toLine, this._contextualAccount, AddressWell.maxWordWheelContacts, t).then(this._onWordWheelSearchComplete.bind(this), this._onWordWheelSearchError.bind(this))
    }
    ;
    AddressWell.Controller.prototype._onWordWheelSearchComplete = function(n) {
        var t, i, f, r, u;
        for (this._wordWheelSearchOp = null,
        t = [],
        i = 0,
        f = n.length; i < f; i++)
            r = n[i],
            u = r.person,
            t.push(new AddressWell.Contact(u,[r],AddressWell.getUserTileUrl(u, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall)));
        this._dropDown.render(AddressWell.DropDownView.peopleSearchList, t, this._getConnectedAccount(), this._input.isImeActive());
        this._lvResults = t;
        AddressWell.markStop("_wordWheelSearch")
    }
    ;
    AddressWell.Controller.prototype._onWordWheelSearchError = function(n) {
        this._wordWheelSearchOp = null;
        this._dropDown.hide();
        Jx.log.exception("addressWellSearchAsync returned an error", n);
        AddressWell.markStop("_wordWheelSearch")
    }
    ;
    AddressWell.Controller.prototype._chatSearch = function() {
        Jx.log.verbose("AddressWell.Controller._chatSearch");
        try {
            this._lvCollection = this._peopleManager.search(Microsoft.WindowsLive.Platform.PeopleSearchType.chatAddressWell, this._lvInput, Windows.Globalization.Language.currentInputMethodLanguageTag.toString(), AddressWell.maxWordWheelContacts);
            this._lvCollectionChangedHandler = this._lvCollectionChanged.bind(this);
            this._lvCollection.addEventListener("collectionchanged", this._lvCollectionChangedHandler);
            this._lvCollection.unlock()
        } catch (n) {
            Jx.fault("AddressWell.AddressWellController.js", "_chatSearch", n);
            this._queryContactsByInputEnd()
        }
    }
    ;
    AddressWell.Controller.prototype._lvCollectionDispose = function() {
        if (this._lvCollection !== null) {
            Jx.log.verbose("AddressWell.Controller._lvCollectionDispose resetting collection object and its collectionChanged handler");
            try {
                this._lvCollection.removeEventListener("collectionchanged", this._lvCollectionChangedHandler);
                this._lvCollection.dispose()
            } catch (n) {
                Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionDispose", n)
            } finally {
                this._lvCollection = null;
                this._lvCollectionChangedHandler = null
            }
        }
        this._lvSearchPromise !== null && (Jx.log.verbose("AddressWell.Controller._lvCollectionDispose cancelling current _lvSearchPromise"),
        this._lvSearchPromise.cancel(),
        this._lvSearchPromise = null)
    }
    ;
    AddressWell.Controller.prototype._lvCollectionChanged = function(n) {
        var t = n.eType;
        Jx.log.verbose("AddressWell.Controller._lvCollectionChanged invoked with eventArgs.eType: " + t.toString());
        t === Microsoft.WindowsLive.Platform.CollectionChangeType.localSearchComplete ? (Jx.log.verbose("AddressWell.Controller._lvCollectionChanged invoked with localSearchComplete"),
        this._lvCollectionChangedSearchComplete(n)) : t === Microsoft.WindowsLive.Platform.CollectionChangeType.batchEnd && (Jx.log.verbose("AddressWell.Controller._lvCollectionChanged invoked with batchEnd"),
        this._lvCollectionChangedBatchEnd())
    }
    ;
    AddressWell.Controller.prototype._lvCollectionChangedSearchComplete = function() {
        try {
            this._lvCollection.totalCount > 0 ? this._lvCollection.fetchMoreItems(AddressWell.maxWordWheelContacts) : this._queryContactsByInputEnd()
        } catch (n) {
            Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionChangedSearchComplete", n);
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
            this._queryContactsByInputEnd()
        }
    }
    ;
    AddressWell.Controller.prototype._lvCollectionChangedBatchEnd = function() {
        try {} catch (n) {
            Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionChangedBatchEnd", n)
        } finally {
            this._loopThroughCollection()
        }
    }
    ;
    AddressWell.Controller.prototype._loopThroughCollection = function() {
        var r, t, i, n;
        r = AddressWell.maxWordWheelContacts;
        try {
            if (t = this._lvCollection.count,
            t > 0)
                for (i = null,
                n = 0; n < t; n++)
                    if (i = this._lvCollection.item(n),
                    this._processChatPerson(this._lvResults, i) >= r)
                        break
        } catch (u) {
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
            Jx.fault("AddressWell.AddressWellController.js", "_loopThroughCollection", u)
        } finally {
            this._queryContactsByInputEnd()
        }
    }
    ;
    AddressWell.Controller.prototype._processChatPerson = function(n, t) {
        if (t.objectType !== "MeContact") {
            var i = AddressWell.getUserTileUrl(t, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall)
              , r = {
                calculatedUIName: t.calculatedUIName,
                emailAddress: "",
                person: t,
                isJsRecipient: true
            };
            n.push(new AddressWell.Contact(t,[r],i))
        }
        return n.length
    }
    ;
    AddressWell.Controller.prototype._onRecipientStateChanged = function(n) {
        var t = n.sender;
        t.state === AddressWell.RecipientState.resolved && this.raiseEvent(AddressWell.Events.autoResolveSuccessful, {
            recipient: t
        });
        t.state !== AddressWell.RecipientState.pendingResolution && t.removeListener(AddressWell.RecipientEvents.stateChanged, this._onRecipientStateChanged, this)
    }
    ;
    AddressWell.Controller.prototype._onInputFocus = function() {
        this._dropDown.addAriaLive();
        this._autoSuggestOnFocus && !this._dropDown.isShowing() && (this._displaySuggestionsView(AddressWell.SuggestionInvocationType.explicit),
        this._autoSuggestOnFocus = false)
    }
    ;
    AddressWell.Controller.prototype._onInputClick = function() {
        this._input.getUserInput().length !== 0 || this._dropDown.isShowing() || this._displaySuggestionsView(AddressWell.SuggestionInvocationType.explicit)
    }
    ;
    AddressWell.Controller.prototype._onArrowKey = function(n) {
        this._dropDown.isVisible() ? n === AddressWell.Key.arrowUp && this._dropDown.currentView === AddressWell.DropDownView.suggestionsList && this._dropDown.getAttr(AddressWell.highlightAreaAttr) !== AddressWell.HighlightArea.dropDown ? this._dropDown.hide() : (this._input.isImeActive() && this._input.finalizeInput(),
        this._dropDown.handleArrowKey(n)) : n === AddressWell.Key.arrowDown && this._input.getUserInput().length === 0 && this._displaySuggestionsView(AddressWell.SuggestionInvocationType.explicit)
    }
    ;
    AddressWell.Controller.prototype._clearProcessInputTimeout = function() {
        Jx.log.verbose("AddressWell.Controller._clearProcessInputTimeout");
        this._queueProcessTimeout && (clearTimeout(this._queueProcessTimeout),
        this._queueProcessTimeout = null)
    }
    ;
    AddressWell.Controller.prototype._userInputChanged = function() {
        Jx.log.verbose("AddressWell.Controller._userInputChanged");
        this._clearProcessInputTimeout();
        this._lvCollectionDispose();
        this._cancelWordWheelSearch();
        this._cancelExplicitServerSearch();
        var n = this._input.getUserInput().trim();
        Jx.isNonEmptyString(n) ? this._queueProcessTimeout = setTimeout(this._processInputChanges.bind(this, n), 150) : this._processInputChanges(n)
    }
    ;
    AddressWell.Controller.prototype._processInputChanges = function(n) {
        Jx.log.verbose("AddressWell.Controller._processInputChanges");
        Jx.isNonEmptyString(n) ? this._displayListView(n) : this._displaySuggestionsView(AddressWell.SuggestionInvocationType.implicit)
    }
    ;
    AddressWell.Controller.prototype._displaySuggestionsView = function(n) {
        if (this._showSuggestions)
            if ((n !== AddressWell.SuggestionInvocationType.implicit || this._firstRecipientAdded) && n !== AddressWell.SuggestionInvocationType.explicit)
                this._dropDown.hide();
            else {
                var t = this._input.getRecipients(true)
                  , i = this._queryRelevantContacts(AddressWell.maxSuggestions, t);
                this._dropDown.render(AddressWell.DropDownView.suggestionsList, i, null)
            }
        else
            this._dropDown.isVisible() && this._dropDown.hide()
    }
    ;
    AddressWell.Controller.prototype._displayListView = function(n) {
        switch (this._contactSelectionMode) {
        case AddressWell.ContactSelectionMode.emailContacts:
            this._wordWheelSearch(n);
            break;
        case AddressWell.ContactSelectionMode.chatContacts:
            var t = this;
            this._queryContactsByInputAsync(n, AddressWell.ListViewSearchType.people, null).done(function(n) {
                msSetImmediate(t._queryContactsByInputOnComplete.bind(t), n)
            }, function(n) {
                msSetImmediate(t._queryContactsByInputOnError.bind(t), n)
            })
        }
    }
    ;
    AddressWell.Controller.prototype._displayListViewForConnectedAccount = function(n) {
        var t = this._input.getUserInput();
        n !== null && Jx.isNonEmptyString(t.trim()) && (this._serverSearchAgent ? this._serverSearchAgent.cancel() : this._serverSearchAgent = new AddressWell.ServerSearch(this._platform,this._log),
        this._dropDown.renderProgress(),
        this._serverSearchAgent.queryAsync(t, n, function(n) {
            if (n !== null && n.length === 1) {
                var t = n[0];
                this._addDropDownRecipients({
                    recipients: [t.recipients[0]],
                    inputMethod: AddressWell.InputMethod.unknown
                })
            } else
                n !== null && this._dropDown.isVisible() && this._isFocusInControl() && this._dropDown.render(AddressWell.DropDownView.connectedAccountList, n, null)
        }
        .bind(this), function(t) {
            if (this._dropDown.isVisible() && AddressWell.SearchErrorType.cancelled !== t) {
                var i = AddressWell.convertSearchErrorToString(t, n.displayName);
                this._dropDown.renderText(i)
            }
        }
        .bind(this)))
    }
    ;
    AddressWell.Controller.prototype._queryContactsByInputOnComplete = function(n) {
        Jx.log.verbose("AddressWell.Controller._queryContactsByInputOnComplete with searchId: " + n.toString() + " and this._lvSearchId: " + this._lvSearchId.toString());
        n === this._lvSearchId && (this._lvCollection !== null && (this._lvResults.length === 0 ? this._dropDown.renderText(Jx.res.getString(AddressWell.stringsPrefix + "awSearchNoResults")) : this._dropDown.render(AddressWell.DropDownView.peopleSearchList, this._lvResults, null)),
        this._lvCollectionDispose())
    }
    ;
    AddressWell.Controller.prototype._queryContactsByInputOnError = function(n) {
        Jx.log.exception("AddressWell.Controller._queryContactsByInputOnError is invoked with exception.", n);
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        this._queryContactsByInputOnComplete(this._lvSearchId)
    }
    ;
    AddressWell.Controller.prototype._searchFirstConnectedAccount = function() {
        this._displayListViewForConnectedAccount(this._getConnectedAccount())
    }
    ;
    AddressWell.Controller.prototype._searchConnectedAccountId = function() {
        this._displayListViewForConnectedAccount(this._contextualAccount)
    }
    ;
    AddressWell.Controller.prototype._getConnectedAccount = function() {
        if (this._contextualAccount) {
            var n = this._contextualAccount;
            if (n.peopleSearchScenarioState === Microsoft.WindowsLive.Platform.ScenarioState.connected)
                return this._contextualAccount
        }
        return null
    }
    ;
    AddressWell.Controller.prototype._attachContainerListener = function() {
        this._containerBlur === null && (this._containerBlur = this._containerBlurHandler.bind(this),
        this._containerElement.addEventListener(AddressWell.Events.blur, this._containerBlur, true))
    }
    ;
    AddressWell.Controller.prototype._removeContainerListener = function() {
        this._containerBlur !== null && (this._containerElement.removeEventListener(AddressWell.Events.blur, this._containerBlur, true),
        this._containerBlur = null)
    }
    ;
    AddressWell.Controller.prototype._inputPaneShowing = function(n) {
        if (this._dropDown.setInputPaneTop(n.occludedRect.y),
        Jx.isHTMLElement(this._getScrollableElement()) && this._inputPaneShowingTimeout === null) {
            var i = this._animationMetrics.AnimationDescription(this._animationMetrics.AnimationEffect.showPanel, this._animationMetrics.AnimationEffectTarget.primary).animations[0]
              , t = i.duration;
            t <= 10 && (t = AddressWell.maxInputPaneShowing);
            this._inputPaneShowingTimeout = window.setTimeout(this._inputPaneFullyShown.bind(this), t + 50)
        }
    }
    ;
    AddressWell.Controller.prototype._inputPaneHiding = function() {
        this._dropDown.clearInputPaneTop()
    }
    ;
    AddressWell.Controller.prototype._inputPaneFullyShown = function() {
        this._clearInputPaneShowingTimeout();
        this.hasFocus() && this._scrollIntoView()
    }
    ;
    AddressWell.Controller.prototype._clearInputPaneShowingTimeout = function() {
        Jx.isNumber(this._inputPaneShowingTimeout) && (window.clearTimeout(this._inputPaneShowingTimeout),
        this._inputPaneShowingTimeout = null)
    }
    ;
    AddressWell.Controller.prototype._scrollIntoView = function() {
        var n, t;
        if (this._scrollsIntoView && this._inputPaneShowingTimeout === null && this.hasFocus()) {
            if (AddressWell.markStart("Input.scrollIntoView"),
            n = this._getScrollableElement(),
            Jx.isHTMLElement(n)) {
                var i = this._input.getRootElement()
                  , r = i.offsetHeight
                  , u = this._dropDown.getRootElement().offsetHeight
                  , f = Math.min(window.innerHeight, n.offsetHeight);
                r + u > f ? (Jx.log.verbose("AddressWell.scrollIntoView: entire control will not fit in viewport, scrolling the top of the input element"),
                t = document.getElementById(this._input._scrollToId),
                r < t.offsetHeight && (t = i),
                t.scrollIntoView(true)) : u > 0 ? (Jx.log.verbose("AddressWell.scrollIntoView: Everything fits - making sure bottom of the dropdown is in view."),
                AddressWell.scrollIntoViewIfNotInView(this._dropDown._bottomElement, false, n)) : (Jx.log.verbose("AddressWell.scrollIntoView: Everything fits - making sure input element is in view (no dropdown)."),
                AddressWell.scrollIntoViewIfNotInView(i, false, n))
            }
            AddressWell.markStop("Input.scrollIntoView")
        }
    }
    ;
    AddressWell.Controller.prototype._dropDownReadyHandler = function() {
        this._input._inputElement.blur();
        this.focusInput();
        this._scrollIntoView()
    }
    ;
    AddressWell.Controller.prototype._inputOffsetAdjusted = function(n) {
        var t = this._input.getRootElement().offsetWidth
          , i = Math.max(240, Math.min(340, t * AddressWell.dropdownToContainerWidthPercentage))
          , r = Jx.isRtl() ? Math.max(n - i - 2 * AddressWell.dropDownBorderWidthOffset, -AddressWell.dropDownBorderWidthOffset) : Math.min(n, t - i - AddressWell.dropDownBorderWidthOffset);
        this._dropDown.setDropdownLeftOffset(r)
    }
    ;
    AddressWell.Controller.prototype._inputImeWindowHeightUpdated = function(n) {
        this._dropDown.adjustImeOffset(n)
    }
})
