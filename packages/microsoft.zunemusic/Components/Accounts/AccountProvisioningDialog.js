/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var Accounts;
        (function(Accounts) {
            var AccountProvisioningDialog = (function(_super) {
                    __extends(AccountProvisioningDialog, _super);
                    function AccountProvisioningDialog(element, options) {
                        this.templateStorage = "/Components/Accounts/AccountProvisioningDialog.html";
                        this.templateName = "accountProvisioningDialog";
                        this._actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        _super.call(this, element, options)
                    }
                    AccountProvisioningDialog.prototype.initialize = function() {
                        var _this = this;
                        this._emailAccountContainer.textContent = String.load(String.id.IDS_PROVISIONING_USER_EMAIL).format(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).getToBeProvisionedUserName());
                        WinJS.Promise.timeout(100).done(function() {
                            MS.Entertainment.UI.Framework.focusElement(_this._alreadyHaveAccountButton)
                        })
                    };
                    AccountProvisioningDialog.prototype.setOverlay = function(dialog) {
                        this._hostDialog = dialog
                    };
                    AccountProvisioningDialog.prototype.alreadyHaveAccountClicked = function(e) {
                        if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                            return;
                        this._xboxAccountExplanation.textContent = String.load(String.id.IDS_PROVISIONING_ALREADY_HAVE_DESC);
                        WinJS.Utilities.removeClass(this._xboxAccountExplanation, "removeFromDisplay")
                    };
                    AccountProvisioningDialog.prototype.termsOfServiceLinkClicked = function(e) {
                        if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                            return;
                        var externalNavigationAction = this._actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.externalNavigate);
                        externalNavigationAction.parameter = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBox) + "/legal/LiveTOU";
                        externalNavigationAction.automationId = MS.Entertainment.UI.AutomationIds.accountProvisioningTOS;
                        externalNavigationAction.execute()
                    };
                    AccountProvisioningDialog.prototype.privacyStatementClicked = function(e) {
                        if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                            return;
                        var externalNavigationAction = this._actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.externalNavigate);
                        externalNavigationAction.parameter = "http://go.microsoft.com/fwlink/?LinkID=259655";
                        externalNavigationAction.automationId = MS.Entertainment.UI.AutomationIds.accountProvisioningPrivacy;
                        externalNavigationAction.execute()
                    };
                    AccountProvisioningDialog.prototype.acceptClicked = function() {
                        if (this._hostDialog && this._hostDialog.buttons && this._hostDialog.buttons.length === 2) {
                            this._hostDialog.buttons[0].isEnabled = false;
                            this._hostDialog.buttons[1].isEnabled = false;
                            this._hostDialog.buttons[0].isDisabled = true;
                            this._hostDialog.buttons[1].isDisabled = true
                        }
                        if (this.progressSpinner)
                            WinJS.Utilities.removeClass(this.progressSpinner, "removeFromDisplay")
                    };
                    AccountProvisioningDialog.showAccountProvisioningDialog = function() {
                        var completionSignal = new MS.Entertainment.UI.Framework.Signal;
                        var controlOptions = {
                                defaultButtonIndex: -1, cancelButtonIndex: 1, persistOnNavigate: true, buttons: [WinJS.Binding.as({
                                            title: String.load(String.id.IDS_PROVISIONING_ACCEPT_BUTTON), execute: function(d) {
                                                    if (d && d.overlayContent && d.overlayContent.winControl) {
                                                        if (d.overlayContent.winControl._dismissPromiseCompleting)
                                                            return;
                                                        d.overlayContent.winControl.acceptClicked();
                                                        d.overlayContent.winControl._dismissPromiseCompleting = true
                                                    }
                                                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).provisionUserAccount().done(function() {
                                                        AccountProvisioningDialog.sendTelemetry("SUCCESS");
                                                        d.hide();
                                                        completionSignal.complete()
                                                    }, function(error) {
                                                        AccountProvisioningDialog.sendTelemetry("ERROR", error);
                                                        d.hide();
                                                        completionSignal.error(error)
                                                    })
                                                }
                                        }), WinJS.Binding.as({
                                            title: String.load(String.id.IDS_PROVISIONING_CANCEL_BUTTON), execute: function(d) {
                                                    AccountProvisioningDialog.sendTelemetry("CANCEL");
                                                    if (d && d.overlayContent && d.overlayContent.winControl) {
                                                        if (d.overlayContent.winControl._dismissPromiseCompleting)
                                                            return;
                                                        d.overlayContent.winControl._dismissPromiseCompleting = true
                                                    }
                                                    d.hide();
                                                    completionSignal.complete()
                                                }
                                        })]
                            };
                        MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_PROVISIONING_TITLE), "MS.Entertainment.Accounts.AccountProvisioningDialog", controlOptions).done(null, function(error) {
                            MS.Entertainment.fail("Error showing Account Provisioning Dialog: " + (error && error.message));
                            completionSignal.complete()
                        });
                        return completionSignal.promise
                    };
                    AccountProvisioningDialog.sendTelemetry = function(result, error) {
                        var telemetryParameterArray = [{
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.Result, parameterValue: result
                                }];
                        if (error && error.number)
                            telemetryParameterArray.push({
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.ErrorCode, parameterValue: error.number
                            });
                        MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.AccountCreation, telemetryParameterArray)
                    };
                    return AccountProvisioningDialog
                })(MS.Entertainment.UI.Framework.UserControl);
            Accounts.AccountProvisioningDialog = AccountProvisioningDialog;
            var ChildAccountProvisioningDialog = (function(_super) {
                    __extends(ChildAccountProvisioningDialog, _super);
                    function ChildAccountProvisioningDialog(element, options) {
                        this.templateStorage = "/Components/Accounts/AccountProvisioningDialog.html";
                        this.templateName = "childAccountProvisioningDialog";
                        this._actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        _super.call(this, element, options)
                    }
                    ChildAccountProvisioningDialog.prototype.initialize = function() {
                        var _this = this;
                        var decimalFormatter = new Windows.Globalization.NumberFormatting.DecimalFormatter;
                        decimalFormatter.fractionDigits = 0;
                        var numberOne = decimalFormatter.format(1);
                        var numberTwo = decimalFormatter.format(2);
                        var numberThree = decimalFormatter.format(3);
                        this._xboxSiteLink.textContent = String.load(String.id.IDS_PROVISIONING_CHILD_LIST_XBOX_LINK).format(numberOne);
                        this._comeBackText.textContent = String.load(String.id.IDS_PROVISIONING_CHILD_LIST_COMEBACK).format(numberTwo);
                        this._signInLink.textContent = String.load(String.id.IDS_PROVISIONING_CHILD_LIST_SIGNIN).format(numberThree);
                        WinJS.Promise.timeout(100).done(function() {
                            MS.Entertainment.UI.Framework.focusElement(_this._xboxSiteLink)
                        })
                    };
                    ChildAccountProvisioningDialog.prototype.setOverlay = function(dialog) {
                        this._hostDialog = dialog
                    };
                    ChildAccountProvisioningDialog.prototype.xboxSiteLinkClicked = function(e) {
                        if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                            return;
                        var webLink = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/Flows/BeginFlow.ashx?workflow=AccountCreation";
                        var externalNavigationAction = this._actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.externalNavigate);
                        externalNavigationAction.parameter = webLink;
                        externalNavigationAction.automationId = MS.Entertainment.UI.AutomationIds.accountProvisioningChildWebLink;
                        externalNavigationAction.execute();
                        MS.Entertainment.Utilities.Telemetry.logPageAction({domElement: this._xboxSiteLink}, {
                            uri: "childAccountProvisioningInfoDialog", pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.Popup
                        }, {
                            uri: webLink, pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.WebPage
                        })
                    };
                    ChildAccountProvisioningDialog.prototype.signInClicked = function(e) {
                        if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                            return;
                        MS.Entertainment.Utilities.Telemetry.logPageAction({domElement: this._signInLink}, {
                            uri: "childAccountProvisioningInfoDialog", pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.Popup
                        });
                        this._hostDialog.hide()
                    };
                    ChildAccountProvisioningDialog.showChildAccountProvisioningDialog = function() {
                        var completionSignal = new MS.Entertainment.UI.Framework.Signal;
                        var controlOptions = {
                                defaultButtonIndex: -1, cancelButtonIndex: 0, persistOnNavigate: true, buttons: [WinJS.Binding.as({
                                            title: String.load(String.id.IDS_PROVISIONING_CANCEL_BUTTON), execute: function(d) {
                                                    d.hide()
                                                }
                                        })]
                            };
                        MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_PROVISIONING_CHILD_TITLE), "MS.Entertainment.Accounts.ChildAccountProvisioningDialog", controlOptions).done(function() {
                            completionSignal.complete()
                        }, function(error) {
                            MS.Entertainment.fail("Error showing Account Provisioning Dialog: " + (error && error.message));
                            completionSignal.complete()
                        });
                        return completionSignal.promise
                    };
                    return ChildAccountProvisioningDialog
                })(MS.Entertainment.UI.Framework.UserControl);
            Accounts.ChildAccountProvisioningDialog = ChildAccountProvisioningDialog;
            WinJS.Utilities.markSupportedForProcessing(ChildAccountProvisioningDialog);
            WinJS.Utilities.markSupportedForProcessing(AccountProvisioningDialog)
        })(Accounts = Entertainment.Accounts || (Entertainment.Accounts = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
