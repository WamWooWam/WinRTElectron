
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="./ContactEditControl.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/jx/core/jx.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>

/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Controls, "ContactAddControl", function () {

    var P = window.People;
    var C = P.Controls;
    var N = P.Nav;
    var L = P.Layout;
    var Plat = Microsoft.WindowsLive.Platform;

    // ================================================================================================
    // Perf Helper.
    //// <event value="2506" task="profileAddAction" opcode="win:Start" symbol="profileAddAction_start" template="profileActionTemplate" keywords="profile" level="win:Informational"/>
    //// <event value="2507" task="profileAddAction" opcode="win:Stop"  symbol="profileAddAction_end"   template="profileActionTemplate" keywords="profile" level="win:Informational"/>
    function perfContactAddAction(actionOp, actionFunc) {
        return function () {
            try {
                NoShip.People.etw("profileAddAction_start", { action: actionOp });

                return actionFunc.apply(this, arguments);
            } finally {
                NoShip.People.etw("profileAddAction_end", { action: actionOp });
            }
        };
    };

    var ContactAddControl = C.ContactAddControl = /*@constructor*/function constructor(host) {
        /// <summary>Creates the hosted control.</summary>
        /// <param name="host" type="P.CpMain"/>
        C.ContactEditControl.call(this, host);
    };

    Jx.inherit(ContactAddControl, C.ContactEditControl);

    ContactAddControl.prototype._loadContent = perfContactAddAction("loadContent", _loadContentAction);
    /*@bind(ContactAddControl)*/function _loadContentAction(div, hydrateContext) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="hydrateContext" type="Object">Optional hydration information to be used for displaying the page.</param>
        
        Debug.assert(Jx.isHTMLElement(this._hostDiv));
        this._hostDiv.setAttribute("aria-label", Jx.escapeHtml(Jx.res.getString("/strings/createContactHeader")));

        var platform = this._host.getPlatform();
        var accountManager = platform.accountManager;

        var accountId = accountManager.defaultAccount.objectId;
        var contact = this._contact = /*@static_cast(Plat.IContact)*/{ isAdd: true, account: accountId };

        var fieldList = Object.create(P.Contact.editFieldList);
        fieldList.account = { group: 'account', type: 'select', locId: "groupTitle_account" };

        var groupList = Object.create(P.Contact.getEditGroupList());
        groupList.account = { multiple: false, disallowFieldTypeChange: true, showFirstFieldOnGroupEmpty: false, fieldList: ['account'] };

        var uiform = this._uiform = new P.UiForm({
            fieldList: fieldList,
            groupList: groupList,
            loc: Jx.res,
            formValidator: P.Contact._formValidator,
            cssPrefix: "profileEdit-",
            residPrefix: "/strings/profile_",
            onFormChanged: this._resizeContent.bind(this)
        });
        uiform.fieldList['account'].options = _getEditableAccounts(accountManager);
        this._createEditForm(div, contact, hydrateContext);

        NoShip.People.etw("prfaTrackStartup_end");
    };

    var _getEditableAccounts = perfContactAddAction("getEditableAccounts", _getEditableAccountsAction);
    /*@bind(ContactAddControl)*/function _getEditableAccountsAction(accountManager) {
        /// <param name="accountManager" type="Plat.AccountManager"/>
        var connectedAccounts = accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.people, Plat.ConnectedFilter.normal, Plat.AccountSort.name);
        var editableAccounts = [];
        for (var i = 0, len = connectedAccounts.count; i < len; i++) {
            var connectedAccount = /*@static_cast(Plat.IAccount)*/connectedAccounts.item(i);
            if (P.CommitContact.canCreateContacts(connectedAccount)) {
                editableAccounts.push(new P.UiFormSelectInputControl.Option(connectedAccount.objectId, connectedAccount.displayName));
            }
        }
        return editableAccounts;
    };
});
