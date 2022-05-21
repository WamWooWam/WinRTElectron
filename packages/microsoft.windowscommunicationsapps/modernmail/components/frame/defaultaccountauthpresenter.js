
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="..\..\..\Shared\Jx\Core\Jx.dep.js" />
/// <reference path="..\..\Util\Platform.js" />


Jx.delayDefine(Mail, "DefaultAccountAuthPresenter", function () {
    "use strict";

    Mail.DefaultAccountAuthPresenter = /*@constructor*/function () {
        this._account = /* @static_cast(Microsoft.WindowsLive.Platform.IAccount) */null;
    };

    var proto = Mail.DefaultAccountAuthPresenter.prototype;

    proto._messageBar = null;
    proto._platform = null;
    proto._className = null;

    proto._EMAIL_VERIFY_MESSAGE_ID = "emailVerifyID";

    proto.init = function (messageBar, platform, className) {
        /// <param name="messageBar" type="Chat.MessageBar" />
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client" />
        /// <param name="className" type="String" />

        Debug.assert(Jx.isInstanceOf(messageBar, Chat.MessageBar));
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(Jx.isNonEmptyString(className));

        this._messageBar = messageBar;
        this._platform = platform;
        this._className = className;

        this._accountChanged = this._accountChanged.bind(this);
        Jx.scheduler.addJob(null, Mail.Priority.registerAuthPresenter, "register default auth presenter", this._register, this);
    };

    proto._register = function () {
        try {
            this._account = /*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/this._platform.accountManager.defaultAccount;
            this._account.addEventListener("changed", this._accountChanged);
            this._checkErrorState(this._account.lastAuthResult);
        }
        catch (ex) {
            Jx.log.error("DefaultAccountAuthPresenter: Error registering change handler on default account");
            Jx.promoteOriginalStack(ex);
            throw ex;
        }
    };

    proto._accountChanged = function (ev) {
        ///<param name="ev" type="Event" />
        var account = /*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/ev.target;
        this._checkErrorState(account.lastAuthResult);
    };

    proto.dispose = function () {
        if (this._account) {
            this._account.removeEventListener("changed", this._accountChanged);
        }
    };

    proto._checkErrorState = function (accountStatus) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        var emailVRequired = Microsoft.WindowsLive.Platform.Result.emailVerificationRequired;
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        if (accountStatus === emailVRequired) {
            var options = {
                messageText: Jx.res.loadCompoundString("/messagebar/messageBarIDCRLUnverifiedEasi", this._account.emailAddress),
                button2: {
                    text: Jx.res.getString("/messagebar/messageBarCloseText"),
                    tooltip: Jx.res.getString("/messagebar/messageBarCloseText"),
                    callback: this._closeClicked.bind(this)
                },
                cssClass: this._className
            };
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            this._messageBar.addErrorMessage(this._EMAIL_VERIFY_MESSAGE_ID, 1, options);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        } else {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            this._messageBar.removeMessage(this._EMAIL_VERIFY_MESSAGE_ID);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        }

    };

    proto._closeClicked = function (target, id) {
        this._messageBar.removeMessage(id);
    };

});
