
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Chat,Microsoft,Windows,Jx,Debug*/

Jx.delayDefine(Mail, "RulesMessageBarPresenter", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        ruleRunningStatusId = "ruleRunning",
        ruleErrorMessagePrefix = "errorRule-",
        MessageBarPriority = Chat.MessageBar.Priority;

    var RuleAccountListener = function (messageBarPresenter, platform, account) {
        Debug.assert(Jx.isInstanceOf(messageBarPresenter, Mail.RulesMessageBarPresenter));
        Debug.assert(Jx.isObject(platform));
        Debug.assert(Jx.isInstanceOf(account, Plat.IAccount));
        var AccountType = Plat.AccountType,
            type = account.accountType;

        this._presenter = messageBarPresenter;
        this._account = account;
        this._ruleResource = null;
        this._disposer = null;

        // We only need to listen to Outlook.com accounts since they are the only ones that we support
        // rules on. However, when an account is added we might not know it's an Outlook.com account until after
        // we've had the first sync. Instead, we should listen to all EAS and Live accounts to make sure we catch
        // all the events we are interested in.
        if (type === AccountType.liveId || type === AccountType.eas) {
            this._ruleResource = account.getResourceByType(Plat.ResourceType.mailRule);
            this._disposer = new Mail.Disposer(
                new Mail.EventHook(this._ruleResource, "changed", this._ruleResourceChanged, this)
            );

        }

        Debug.only(Object.seal(this));
    };

    RuleAccountListener.prototype.dispose = function () {
        if (this._ruleResource) {
            this._presenter.onRemoveAccount(this._account, this._ruleResource);
        }
        Jx.dispose(this._disposer);
    };

    RuleAccountListener.prototype._ruleResourceChanged = function () {
        this._presenter.onRuleResourceChanged(this._account, this._ruleResource);
    };

    var RulesMessageBarPresenter = Mail.RulesMessageBarPresenter = function () {
        this._messageBar = null;
        this._platform = null;
        this._className = null;
        this._accounts = null;
        this._runningCount = 0;
        this._runningStatusShownTime = 0;
        this._runningRules = {};
        this._clearRunningTimerId = null;

        // Get the ease of access notification time value
        // Also convert to milliseconds and cut in half since our strings are pretty small.
        this._messageDuration = new Windows.UI.ViewManagement.UISettings().messageDuration * 1000 / 2;

        Debug.only(Object.seal(this));
    };

    var prototype = RulesMessageBarPresenter.prototype;

    prototype.init = function (messageBar, platform, className) {
        Debug.assert(Jx.isInstanceOf(messageBar, Chat.MessageBar));
        Debug.assert(Jx.isObject(platform));
        Debug.assert(Jx.isNonEmptyString(className));

        this._messageBar = messageBar;
        this._platform = platform;
        this._className = className;

        // Get the list of accounts and add listeners to accounts that support rules
        var queryCollection = new Mail.QueryCollection(platform.accountManager.getConnectedAccountsByScenario, platform.accountManager,
            [ Plat.ApplicationScenario.mail, Plat.ConnectedFilter.normal, Plat.AccountSort.name ] );
        this._accounts = new Mail.MappedCollection(queryCollection, function (account) {
            return new RuleAccountListener(this, platform, account);
        }, this);
        // Iterate over the mapped collection to force it to instantiate our listeners
        this._accounts.forEach(Jx.fnEmpty);
        this._accounts.unlock();
    };

    prototype.dispose = function () {
        if (this._accounts) {
            this._accounts.dispose();
        }

        if (Jx.isNumber(this._clearRunningTimerId)) {
            clearTimeout(this._clearRunningTimerId);
            this._clearRunningTimerId = null;
        }
    };

    prototype.onRuleResourceChanged = function (account, ruleResource) {
        Debug.assert(Jx.isInstanceOf(account, Plat.IAccount));
        Debug.assert(Jx.isInstanceOf(ruleResource, Plat.IMailRuleAccountResource));
        this._updateRunningRules(account, ruleResource, false);
    };

    prototype._updateRunningRules = function (account, ruleResource, removeAccount) {
        Debug.assert(Jx.isInstanceOf(account, Plat.IAccount));
        Debug.assert(Jx.isInstanceOf(ruleResource, Plat.IMailRuleAccountResource));
        var previousCount = this._runningCount,
            hasNoInternetConnection = Mail.Utilities.ConnectivityMonitor.hasNoInternetConnection();

        if (ruleResource.running && !removeAccount) {
            if (!this._runningRules[ruleResource.objectId]) {
                // If this account wasn't running rules last time we checked, remember that it is
                // and increment our count.
                this._runningRules[ruleResource.objectId] = true;
                this._runningCount++;
            }
        } else if (this._runningRules[ruleResource.objectId]) {
            // If this rule was running the last time we check and it no longer is
            // (or we are about to remove this account), decrement our running count
            this._runningRules[ruleResource.objectId] = false;
            this._runningCount--;
        }

        Debug.assert(this._runningCount >= 0);
        if ((this._runningCount > 0) && (previousCount === 0) && !hasNoInternetConnection) {
            // If we just started running a rule, show a status message if we are connected to the internet
            var resourceString = Jx.res.getString("mailRuleRunningStatusMessage"),
                options = {
                    messageText: resourceString,
                    button2: {
                        text: Jx.res.getString("/messagebar/messageBarCloseText"),
                        tooltip: Jx.res.getString("/messagebar/messageBarCloseTooltip"),
                        callback: this._closeClicked.bind(this)
                    },
                    tooltip: resourceString,
                    cssClass: this._className
            };

            this._messageBar.addErrorMessage(ruleRunningStatusId, MessageBarPriority.low, options);
            this._runningStatusShownTime = Date.now();
        } else if ((this._runningCount === 0) && (previousCount > 0)) {
            // If we just finished running our last rule, hide the status message
            // However, the status message should be shown for at least _messageDuration
            // to give people enough time to read it.
            var removeStatus = function () {
                if (this._runningCount === 0) {
                    this._messageBar.removeMessage(ruleRunningStatusId);
                    this._runningStatusShownTime = 0;
                    this._clearRunningTimerId = null;
                }
            }.bind(this);
            var timeDelta = Date.now() - this._runningStatusShownTime;

            // If timeDelta is between 0 and _messageDuration, wait
            // until the message has been shown _messageDuration then remove it
            // otherwise remove it now
            if ((timeDelta > 0) && (timeDelta <= this._messageDuration)) {
                this._clearRunningTimerId = setTimeout(removeStatus, this._messageDuration - timeDelta);
            } else {
                removeStatus();
            }

            if (!removeAccount) {
                this._checkResult(account, ruleResource);
            }
        }

        if (removeAccount) {
            delete this._runningRules[ruleResource.objectId];
        }
    };

    function getErrorMessageId(ruleResource) {
        return ruleErrorMessagePrefix + ruleResource.objectId;
    }

    prototype._checkResult = function (account, ruleResource) {
        Debug.assert(Jx.isInstanceOf(account, Plat.IAccount));
        Debug.assert(Jx.isInstanceOf(ruleResource, Plat.IMailRuleAccountResource));

        var result = ruleResource.ruleRunResult,
            messageId = getErrorMessageId(ruleResource);

        // Remove any existing error message. We will create a new one if result is a failure.
        this._messageBar.removeMessage(messageId);

        if (result !== Plat.Result.success) {
            var messageText = Jx.res.loadCompoundString("mailRuleRunningErrorMessage", account.emailAddress),
                options = {
                messageText: messageText,
                button2: {
                    text: Jx.res.getString("/messagebar/messageBarCloseText"),
                    tooltip: Jx.res.getString("/messagebar/messageBarCloseTooltip"),
                    callback: this._closeClicked.bind(this)
                },
                cssClass: this._className
            };
            this._messageBar.addErrorMessage(messageId, 2, options);
        }
    };

    prototype._closeClicked = function (target, id) {
        this._messageBar.removeMessage(id);
    };

    prototype.onRemoveAccount = function (account, ruleResource) {
        Debug.assert(Jx.isInstanceOf(account, Plat.IAccount));
        Debug.assert(Jx.isInstanceOf(ruleResource, Plat.IMailRuleAccountResource));
        this._updateRunningRules(account, ruleResource, true);
    };
});
