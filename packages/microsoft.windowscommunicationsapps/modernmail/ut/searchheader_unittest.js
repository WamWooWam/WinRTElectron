
/*global Mail,Tx,Jx,Debug,WinJS,Microsoft,Jm,Mocks*/
/*jshint browser:true*/

(function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    function createProvider() {
        return new D.JsonProvider({
            Account: {
                all: [{ objectId: "account" }]
            },
            Folder: {
                all: [{
                    objectId: "inbox",
                    specialMailFolderType: Plat.MailFolderType.inbox
                }]
            },           
            MailView: {
                all: [{
                    accountId: "account",
                    objectId: "inboxView",
                    type: Plat.MailViewType.inbox,
                    mock$sourceObjectId: "inbox"
                }]
            }
        }, D.MethodHandlers);
    }

    function MockSelection(account, view) {
        this.mockedType = Mail.Selection;
        this.account = account;
        this.view = view;
    }

    MockSelection.prototype = {
        addListener: Jx.fnEmpty,
        removeListener: Jx.fnEmpty
    };

    function MockScopeSwitcher(canServerSearch) {
        this._upsell = {
            description: "foo"
        };
        this._canServerSearch = canServerSearch;
    }

    MockScopeSwitcher.prototype = {
        get canServerSearch() {
            return this._canServerSearch;
        },
        get upsell() {
            return this._upsell;
        },
        canUpsell: function () {
            return Jx.isObject(this._upsell);
        },
        dispose: Jx.fnEmpty,
        rescopeToUpsell: Jx.fnEmpty,
        rescopeToCurrentView: Jx.fnEmpty,
        addListener: Jx.fnEmpty,
        removeListener: Jx.fnEmpty,
        mockedType: Mail.SearchScopeSwitcher
    };

    function MockTypeToSearch() {}
    Jx.inherit(MockTypeToSearch, Jx.Events);
    MockTypeToSearch.prototype.dispose = Jx.fnEmpty;
    Debug.Events.define(MockTypeToSearch.prototype, "typetosearch");

    function Listener(target) {
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(target, "startSearchInvoked", this._onStartSearchInvoked, this),
            new Mail.EventHook(target, "dismissSearchInvoked", this._onDismissSearchInvoked, this),
            new Mail.EventHook(target, "querySubmitted", this._onQuerySubmitted, this));
        this.searchDismissed = false;
        this.evStartSearch = null;
        this.evQuerySubmitted = null;
    }

    Listener.prototype = {
        _onStartSearchInvoked: function (ev) {
            this.evStartSearch = ev;
        },
        _onDismissSearchInvoked: function () {
            this.searchDismissed = true;
        },
        _onQuerySubmitted: function (ev) {
            this.evQuerySubmitted = ev;
        },
        dispose: function () {
            this._disposer.dispose();
        }
    };

    function createSandBox(ids) {
        var sandBox = document.createElement("div");
        sandBox.innerHTML = ids.map(function (id) {
            return "<div id='" + id + "'></div>";
        }).join("");
        return sandBox;
    }

    function setup(tc) {
        tc.provider = createProvider();
        tc.sandbox = createSandBox([
            "mailMessageListSearchHeader", 
            "messageList",
            "mailMessageListSearchBox",
            "mailMessageListFilterHeader", 
            "mailMessageListStartSearch",
            "mailMessageListDismissSearch"
        ]);
        document.body.appendChild(tc.sandbox);

        tc.preserver = Jm.preserve(Mail.Globals, "commandManager");
        tc.preserver.preserve(Mail, "TypeToSearch");
        tc.preserver.preserve(Mail, "SearchScopeSwitcher");

        Mail.Globals.commandManager = {
            getCommand: function (commandId) {
                return {
                    tooltip: commandId
                };
            }
        };

        Mail.TypeToSearch = MockTypeToSearch;
        Mail.SearchScopeSwitcher = MockScopeSwitcher;

        Mail.UnitTest.ensureSynchronous(function () {
            var selection = new MockSelection(
                    tc.provider.getObjectById("account"), 
                    tc.provider.getObjectById("inboxView")
                ),
                animator = {
                    shortFadeIn: function () {
                        return WinJS.Promise.wrap();
                    },
                    shortFadeOut: function () {
                        return WinJS.Promise.wrap();
                    }
                };
            tc.target = new Mail.SearchHeader(selection, animator);
        });

        tc.listener = new Listener(tc.target); 
        tc.addCleanup(function () {
            tc.target.dispose();
            tc.target = null;
            tc.listener.dispose();
            tc.listener = null;
            tc.provider = null;
            tc.sandbox.removeNode(true);
            tc.sandbox = null;
            tc.preserver.restore();
            tc.preserver = null;
        });
    }

    function verifySearchMode (tc, isSearchMode) {
        var messageListElement = document.getElementById("messageList");
        tc.areEqual(messageListElement.classList.contains("searchMode"), isSearchMode);
    }

    Tx.test("SearchEndOfListItem.test_showHideHeader", { owner: "kepoon" }, function (tc) {
        setup(tc);

        tc.target.show();
        verifySearchMode(tc, true);
        tc.target.show();
        verifySearchMode(tc, true);

        tc.target.hide();
        verifySearchMode(tc, false);
        tc.target.hide();
        verifySearchMode(tc, false);

        tc.target.show(true /*animate*/);
        verifySearchMode(tc, true);
        tc.target.hide();
        verifySearchMode(tc, false);
    });

    Tx.test("SearchEndOfListItem.test_startSearchButton", { owner: "kepoon" }, function (tc) {
        setup(tc);
        document.getElementById("mailMessageListStartSearch").click();
        tc.areEqual(tc.listener.evStartSearch.invokeType, "startSearchButton");
    });

    Tx.test("SearchEndOfListItem.test_typeToSearch", { owner: "kepoon" }, function (tc) {
        setup(tc);
        tc.target._typeToSearch.raiseEvent("typetosearch");
        tc.areEqual(tc.listener.evStartSearch.invokeType, "typeToSearch");
    });

    Tx.test("SearchEndOfListItem.test_lightDismiss", { owner: "kepoon" }, function (tc) {
        setup(tc);

        verifySearchMode(tc, false);
        // show the search header
        tc.target.show();
        verifySearchMode(tc, true);


        // Clicking away when the query text is not empty should not dismiss the header
        tc.target._box.queryText = "hello world";
        tc.target._onFocusOut({
            relatedTarget: document.body
        });
        tc.isFalse(tc.listener.searchDismissed);

        // Clicking away while the scope switcher has focus should not dismiss the header
        tc.target._box.queryText = "";
        tc.target._scopeSwitcher.hasFocus = function () { return true; };
        tc.target._onFocusOut({
            relatedTarget: document.body
        });
        tc.isFalse(tc.listener.searchDismissed);

        // Clicking away while the query text is empty and the scope switcher doesn't have focus 
        // should dismiss the header
        tc.target._scopeSwitcher.hasFocus = function () { return false; };
        tc.target._onFocusOut({
            relatedTarget: document.body
        });
        tc.isTrue(tc.listener.searchDismissed);
    });

    Tx.test("SearchEndOfListItem.test_escapeKey", { owner: "kepoon" }, function (tc) {
        setup(tc);

        verifySearchMode(tc, false);
        // show the search header
        tc.target.show();
        verifySearchMode(tc, true);

        var keyEvent = {
            keyCode: Jx.KeyCode.escape,
            ctrlKey: false,
            altKey: false,
            shiftKey: false
        };
        tc.target._onTextBoxKeyPress(keyEvent);
        tc.isTrue(tc.listener.searchDismissed);
    });

    Tx.test("SearchEndOfListItem.test_submitQuery", { owner: "kepoon" }, function (tc) {
        setup(tc);

        verifySearchMode(tc, false);
        // show the search header
        tc.target.show();
        verifySearchMode(tc, true);

        tc.target._onQuerySubmitted({
            detail: {
                queryText: "Hello World",
                language: "en-US"
            }
        });

        tc.areEqual(tc.listener.evQuerySubmitted.queryText, "Hello World");
        tc.areEqual(tc.listener.evQuerySubmitted.language, "en-US");
    });
})();
