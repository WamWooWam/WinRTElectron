


(function () {
    "use strict";

    var dialogs = Skype.UI.Control.define(function () {

    }, {
        _createEventsProvider: function () {
            return {
                onBeforeShow: function () {
                },
                onAfterShow: function () {
                },
                onAfterHide: function () {
                }
            };
        },

        _showDialog: function () {
            var dialogPromise,
                eventsProvider,
                dialogType = arguments[0],
                newArgs = Array.prototype.splice.call(arguments, 1);

            if (!this[dialogType] ) {
                eventsProvider = this._createEventsProvider();
                var dialogWrapper = document.createElement("div");
                this.element.appendChild(dialogWrapper);

                
                dialogPromise = WinJS.UI.Fragments.renderCopy("/controls/dialogs/{0}.html".format(dialogType), dialogWrapper)
                    .then(function (elm) {
                        this[dialogType] = new Skype.UI.Dialogs[dialogType](elm);
                        return this[dialogType].init(eventsProvider);
                    }.bind(this));
            } else {
                dialogPromise = WinJS.Promise.as();                
                eventsProvider = this[dialogType].outerEventsHandler;
            }
            var showPromise = dialogPromise.then(function () {
                return this[dialogType].show.apply(this[dialogType], newArgs);
            }.bind(this));

            showPromise.eventsProvider = eventsProvider;
            return showPromise;
        }
    }, {
        dialogTypes: {
            
            InputDialog: "InputDialog",
            
            ConfirmDialog: "ConfirmDialog",
            
            TwoButtonDialog: "TwoButtonDialog",
            AuthRequestDialog: "AuthRequestDialog",
            BlockContactDialog: "BlockContactDialog",
            NameWithNumberDialog: "NameWithNumberDialog",
            
            TextareaDialog: "TextareaDialog",
            
            DialpadDialog: "DialpadDialog",
            ChatNotificationsDialog: "ChatNotificationsDialog"
        },

        showDialog: function () {
            var panel = document.querySelector("#skypeDialogs");
            if (panel.winControl) {
                return panel.winControl._showDialog.apply(panel.winControl, arguments);
            }
            log("Dialogs: ERROR - dialog not shown");
            return WinJS.Promise.as();
        },

        showDeclineContactDialog: function (anchorElement) {
            return dialogs.showDialog(  dialogs.dialogTypes.BlockContactDialog,
                                        anchorElement,
                                        "top",
                                        "authrequest_declinedlg_title".translate(),
                                        "authrequest_declinedlg_decline_button".translate(),
                                        "authrequest_declinedlg_block".translate(),
                                        "authrequest_declinedlg_spam".translate(),
                                        "aria_authrequest_declinedlg_title".translate(),
                                        "aria_authrequest_declinedlg_decline_button".translate(),
                                        "aria_authrequest_declinedlg_block".translate(),
                                        "aria_authrequest_declinedlg_spam".translate(),
                                        "DECLINE");
        },

        showBlockContactDialog: function (anchorElement) {
            return dialogs.showDialog(  dialogs.dialogTypes.BlockContactDialog,
                                        anchorElement,
                                        "top",
                                        "appbar_confirm_block_contact".translate(),
                                        "appbar_confirm_block".translate(),
                                        "blockdlg_remove".translate(),
                                        "blockdlg_spam".translate(),
                                        "aria_appbar_confirm_block_contact".translate(),
                                        "aria_appbar_confirm_block".translate(),
                                        "aria_blockdlg_remove".translate(),
                                        "aria_blockdlg_spam".translate(),
                                        "BLOCK");
        },
        
        showChatNotificationsDialog: function (anchorElement, conversation) {
            return dialogs.showDialog(dialogs.dialogTypes.ChatNotificationsDialog,
                                        anchorElement,
                                        "top",
                                        "appbar_notifications_dialog_title".translate(),
                                        "aria_appbar_notifications_dialog_title".translate(),
                                        conversation);
        },

        showSendAuthRequestDialog: function (contactName, avatarUri, maxLength) {
            return dialogs.showDialog(dialogs.dialogTypes.AuthRequestDialog, document.body, "top", contactName, avatarUri, maxLength);
        },

        showAddNumberToContactDialog: function (anchorElement) {
            return dialogs.showDialog(dialogs.dialogTypes.NameWithNumberDialog, anchorElement, "top", "addnumber_title".translate(), "", true, "", false, true);
        },

        showSavePstnContactDialog: function (anchorElement, name) {
            return dialogs.showDialog(dialogs.dialogTypes.NameWithNumberDialog, anchorElement, "top", "savenumber_panel_title".translate(), "", false, name, true, true);
        },

        showAddPstnContactDialog: function (anchorElement) {
            return dialogs.showDialog(dialogs.dialogTypes.NameWithNumberDialog, anchorElement, "top", "savenumber_panel_title".translate(), "", true, "", true, false);
        },

        showTextInputDialogAsync: function (anchorElement, title, okTitle, ariaInputLabel, inputText, maxLength, preventEmpty) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

            return dialogs.showDialog(dialogs.dialogTypes.InputDialog, anchorElement, "top", title, okTitle, ariaInputLabel, inputText, maxLength, preventEmpty);
        },

        showTextareaInputDialogAsync: function (anchorElement, title, okTitle, ariaInputLabel, inputText, maxLength) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

            return dialogs.showDialog(dialogs.dialogTypes.InputDialog, anchorElement, "top", title, okTitle, ariaInputLabel, inputText, maxLength);
        },

        showConfirmDialogAsync: function (anchorElement, question, okTitle) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

            return dialogs.showDialog(dialogs.dialogTypes.ConfirmDialog, anchorElement, "top", question, okTitle);
        },

        showTwoButtonDialogAsync: function (anchorElement, title, question, option1, option2) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

            return dialogs.showDialog(dialogs.dialogTypes.TwoButtonDialog, anchorElement, "top", title, question, option1, option2);
        },

        showDialpadDialog: function (anchorElement, conversation, dialpadVM, placement) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

            return dialogs.showDialog(dialogs.dialogTypes.DialpadDialog, anchorElement, placement, conversation, dialpadVM);
        },
    });

    WinJS.Namespace.define("Skype.UI", {
        Dialogs: dialogs
    });
})();