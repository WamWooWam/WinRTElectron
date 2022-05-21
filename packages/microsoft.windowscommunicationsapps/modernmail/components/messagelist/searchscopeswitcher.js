
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft*/
Jx.delayDefine(Mail, "SearchScopeSwitcher", function () {
    "use strict";

    var MailViewType = Microsoft.WindowsLive.Platform.MailViewType;

    Mail.SearchScopeSwitcher = function (selection, host) {
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isHTMLElement(host));

        var account = selection.account, view = selection.view,
            defaultScope = new SearchScope("mailDefaultSearchScope", view),
            upsellScope = null, scopes = [defaultScope];

        // Figure out if we have an upsell scope
        if (account.mailResource.canServerSearchAllFolders) {
            upsellScope = new AllViewsSearchScope(account, view);
        } else if (view.type !== MailViewType.inbox) {
            // if we are not in the inbox, and we don't support all folder search, add the inbox to it
            upsellScope = new SearchScope("mailUpsellSearchScope", account.inboxView);
        }
        if (upsellScope) {
            scopes.push(upsellScope);
        }

        this._defaultScope = this._currentScope = defaultScope;
        this._upsellScope = upsellScope;
        this._scopes = scopes;

        this._comboBox = new Mail.ComboBox(host,
            scopes.map(function (scope, index) { return scope.toMenuItem(index); }),
            0 /*initialValue*/,
            {
                getDropdownAriaLabel: getDropdownAriaLabel
            },
            "mailMessageListSearchComboText" /*textFormat*/);

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(view, "changed", this._onViewChanged, this),
            this._comboBox,
            new Mail.EventHook(this._comboBox, "changed", this._onScopeChanged, this));
    };

    Jx.augment(Mail.SearchScopeSwitcher, Jx.Events);
    var proto = Mail.SearchScopeSwitcher.prototype;

    Debug.Events.define(proto, "changed");

    var dropDownAriaLabel = null;
    function getDropdownAriaLabel() {
        if (!dropDownAriaLabel) {
            dropDownAriaLabel = Jx.escapeHtml(Jx.res.getString("mailMessageListSearchComboDropdownAriaLabel"));
        }
        return dropDownAriaLabel;
    }

    proto._onViewChanged = function (event) {
        if (Mail.Validators.hasPropertyChanged(event, "name")) {
            var scope = this._defaultScope;
            this._comboBox.updateItem(0, scope.toMenuItem(0));
        }
    };

    proto._onScopeChanged = function () {
        var newScope = this._scopes[this._comboBox.value];
        this._currentScope = newScope;
        this.raiseEvent("changed", newScope);
    };

    proto.dispose = function () {
        Jx.dispose(this._disposer);
    };

    proto.canUpsell = function () {
        return this._upsellScope && (this._upsellScope !== this._currentScope);
    };

    proto.rescopeToUpsell = function () {
        if (this.canUpsell()) {
            Debug.assert(this._scopes.indexOf(this._upsellScope) === 1);
            this._comboBox.updateNewValue(1, true /*fireEvent*/);
        }
    };

    proto.rescopeToCurrentView = function () {
        if (this._currentScope !== this._defaultScope) {
            Debug.assert(this._scopes.indexOf(this._defaultScope) === 0);
            this._comboBox.updateNewValue(0, true /*fireEvent*/);
        }
    };

    proto.hasFocus = function () {
        return this._comboBox.hasFocus();
    };

    Object.defineProperty(proto, "current", {
        get : function () {
            return this._currentScope;
        },
        enumerable : true
    });

    Object.defineProperty(proto, "upsell", {
        get : function () {
            return this._upsellScope;
        },
        enumerable : true
    });

    Object.defineProperty(proto, "canServerSearch", {
        get : function () {
            return this._currentScope.canServerSearch;
        },
        enumerable : true
    });

    function SearchScope(id, view) {
        Debug.assert(Jx.isNonEmptyString(id));
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        this._view = view;
        this._id = id;
        this._description = Jx.res.loadCompoundString("mailMessageListSearchComboText", this.name);
        Debug.assert(Jx.isNonEmptyString(this._description));
    }

    SearchScope.prototype.search = function (query, locale, pageSize) {
        return this._view.search(query, locale, pageSize);
    };

    SearchScope.prototype.toMenuItem = function (index) {
        return {
            value: index,
            text: this.name,
            label: this.label,
            id: this._id
        };
    };

    Object.defineProperty(SearchScope.prototype, "name", {
        get : function () {
            return this._view.name || "";
        },
        enumerable: true
    });

    Object.defineProperty(SearchScope.prototype, "label", {
        get : function () {
            return this.name;
        },
        enumerable: true
    });

    Object.defineProperty(SearchScope.prototype, "canServerSearch", {
        get : function () {
            return this._view.canServerSearch;
        },
        enumerable: true
    });

    Object.defineProperty(SearchScope.prototype, "description", {
        get : function () {
            return this._description;
        },
        enumerable: true
    });

    Object.defineProperty(SearchScope.prototype, "isSearchingAllViews", {
        get: function () {
            return false;
        },
        enumerable: true
    });

    function AllViewsSearchScope(account, view) {
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));

        this._account = account;
        this._id = "mailUpsellSearchScope";
        this._label = getResString("mailMessageListSearchComboLabelAllFolders");
        this._name = getResString("mailMessageListSearchComboDropdownAllFolders");

        if (MailViewType.allPinnedPeople === view.type || MailViewType.person === view.type) {
            this._description = Jx.res.loadCompoundString("mailMessageListSearchAllAccount", this._account.name);
        } else {
            this._description = Jx.res.loadCompoundString("mailMessageListSearchComboText", this._label);
        }
    }
    Jx.inherit(AllViewsSearchScope, SearchScope);

    AllViewsSearchScope.prototype.search = function (query, locale, pageSize) {
        return this._account.search(query, locale, pageSize);
    };

    Object.defineProperty(AllViewsSearchScope.prototype, "name", {
        get : function () {
            return this._name;
        },
        enumerable: true
    });

    Object.defineProperty(AllViewsSearchScope.prototype, "label", {
        get : function () {
            return this._label;
        },
        enumerable: true
    });

    Object.defineProperty(AllViewsSearchScope.prototype, "description", {
        get : function () {
            return this._description;
        },
        enumerable: true
    });

    Object.defineProperty(AllViewsSearchScope.prototype, "canServerSearch", {
        get : function () {
            return true;
        },
        enumerable: true
    });

    Object.defineProperty(AllViewsSearchScope.prototype, "isSearchingAllViews", {
        get: function () {
            return true;
        },
        enumerable: true
    });

    function getResString(resId) {
        return Jx.escapeHtml(Jx.res.getString(resId));
    }
});
