
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail, "SelectedAccountOofPresenter", function () {

    "use strict";
    var Plat = Microsoft.WindowsLive.Platform;

    Mail.SelectedAccountOofPresenter = function () {
        this._mb = null;
        this._selection = null;
        this._className = "";
        this._oofIndicatorSwitcher = null;
        this._account = null;
        this._disposer = null;

        Debug.only(Object.seal(this));
    };

    var proto = Mail.SelectedAccountOofPresenter.prototype;

    var oofIndicatorMessageId = "oofIndicator";
    
    proto.init = function (messageBar, selection, className) {
        /// <param name="messageBar" type="Chat.MessageBar">MessageBar where this presenter will add/remove messages</param>
        /// <param name="className" type="string">Css class name to be passed to the messagebar</param>
        Debug.assert(messageBar);

        this._mb = messageBar;
        this._selection = selection;
        this._className = className;

        this._oofIndicatorSwitcher = new Mail.OofIndicatorSwitcher(this._showOofPresenter.bind(this), this._hideOofPresenter.bind(this), true /* respectIgnoredTime */);
        this._disposer = new Mail.Disposer(this._oofIndicatorSwitcher,
            new Mail.EventHook(selection, "navChanged", this._onNavigation, this));

        this._setAccount(selection.account.platformObject);
    };

    proto.dispose = function () {
        Jx.dispose(this._disposer);
    };

    proto._showOofPresenter = function () {
        /// <summary>Callback for showing OOF presenter</summary>
        // Show message in message bar with lowest priority.
        this._mb.addErrorMessage(oofIndicatorMessageId, 0, {
            messageText: Jx.res.getString("mailOofPresenterMessage"),
            button1: {text: Jx.res.getString("mailOofPresenterTurnOffBtn"), tooltip: Jx.res.getString("mailOofPresenterTurnOffBtn"), callback: this._turnOffOof.bind(this)},
            button2: { text: Jx.res.getString("mailOofPresenterIgnoreBtn"), tooltip: Jx.res.getString("mailOofPresenterIgnoreBtn"), callback: this._ignoreOof.bind(this)},
            cssClass: this._className
        } );
    };

    proto._hideOofPresenter = function () {
        /// <summary>Callback for hiding OOF presenter</summary>
        this._mb.removeMessage(oofIndicatorMessageId);
    };

    proto._turnOffOof = function () {
        /// <summary>Handler for turn off OOF button on message bar</summary>
        Debug.assert(this._account);
        var account = this._account,
            mailResource = account.getResourceByType(Plat.ResourceType.mail),
            easSettings = account.getServerByType(Plat.ServerType.eas);

        Debug.assert(mailResource);
        Debug.assert(easSettings);
        easSettings.oofState = false;

        // Mark the account as needing a sync.
        mailResource.isSyncNeeded = true;
        try {
            account.commit();
        } catch (err) {
            Jx.log.exception("Mail.SelectedAccountOofPresenter._turnOffOof failed on commit.", err);
        }

        // Hide oof message bar immediately instead of waiting for change event that happens after sync is completed. 
        // If there's an error turning off OOF, there will be an error message bar to inform user. 
        this._hideOofPresenter();
    };

    proto._ignoreOof = function () {
        /// <summary>Handler for ignore OOF button on message bar</summary>
        Debug.assert(this._account);
        var account = this._account,
            easSettings = account.getServerByType(Plat.ServerType.eas);
        Debug.assert(easSettings);
        easSettings.oofLastIgnoredTime = new Date();
        try {
            account.commit();
        } catch (err) {
            Jx.log.exception("Mail.SelectedAccountOofPresenter._ignoreOof failed on commit.", err);
        }

        this._hideOofPresenter();
    };

    proto._setAccount = function (account) {
        /// <param name="account" type="Plat.Account"/>
        Debug.assert(account);
        this._account = account;
        Debug.assert(this._oofIndicatorSwitcher);
        this._oofIndicatorSwitcher.setAccount(account);
    };

    proto._onNavigation = function (ev) {
        /// <summary>Selected account change handler</summary>
        if (ev.accountChanged) {
            this._setAccount(ev.target.account.platformObject);
        }
    };

});
