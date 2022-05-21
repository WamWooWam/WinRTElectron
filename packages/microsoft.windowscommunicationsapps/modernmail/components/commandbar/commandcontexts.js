
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Microsoft, Debug, Windows*/
/*jshint browser:true*/
Jx.delayDefine(Mail.Commands, "Contexts", function () {

    var Plat = Microsoft.WindowsLive.Platform,
        MailViewType = Plat.MailViewType;

    var Contexts = Mail.Commands.Contexts = {
            doesAccountSupportMail : function (selection) {
                return selection.account && selection.account.isMailEnabled();
            },

            allowFolderOperations : function () {
                // We want certain folder related commands to be available in most situations, but not all.
                // If we aren't in Snap, these commands should be available. In Snap, these commands should
                // only be available if we are looking at the nav pane.
                var guiState = /*@static_cast(Mail.GUIState)*/Mail.guiState;
                return !(guiState.isOnePane && guiState.isReadingPaneActive);
            },

            supportMultiSelect : function () {
                return !Mail.SearchHandler.isSearching || Mail.SearchHandler.searchResultsEditable;
            },

            allowFilterSwitch : function () {
                var guiState = /*@static_cast(Mail.GUIState)*/Mail.guiState;
                return !Contexts.composeInFocus() && !Mail.SearchHandler.isSearching && (guiState.isMessageListVisible);
            },

            isMessageListActive : function () {
                var guiState = /*@static_cast(Mail.GUIState)*/Mail.guiState;
                return guiState.isMessageListVisible;
            },

            isReadingPaneActive: function () {
                var guiState = Mail.guiState;
                return guiState.isReadingPaneVisible;
            },

            singleSelection : function () {
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                var selectedMessages = /*@static_cast(Array)*/Mail.Globals.appState.selectedMessages;
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                return Jx.isArray(selectedMessages) && selectedMessages.length === 1;
            },

            nonEmptySelection : function () {
                var selectedMessages = /*@static_cast(Array)*/Mail.Globals.appState.selectedMessages;
                return Jx.isArray(selectedMessages) && selectedMessages.length > 0;
            },

            canChangeReadState : function (selection) {
                return  Contexts.nonEmptySelection() &&
                        selection.view.type !== MailViewType.outbox &&
                        // In Search, it is possible to have a non-empty selection that contains messages that cannot be marked as read
                        (Contexts.hasReadMessages() || Contexts.hasUnreadMessages());
            },

            _containsItemsWithReadState : function (read) {
                /// <param name="read" type="Boolean" />
                var selectedMessages = /*@static_cast(Array)*/Mail.Globals.appState.selectedMessages;
                Debug.assert(Jx.isArray(selectedMessages));
                return selectedMessages.some(function (item) {
                    /// <param name="item" type="Mail.UIDataModel.MailItem"/>
                    return item.canMarkRead && item.read === read;
                });
            },

            hasReadMessages : function () {
                return Contexts._containsItemsWithReadState(true);
            },

            hasUnreadMessages : function () {
                return Contexts._containsItemsWithReadState(false);
            },

            _containsItemsWithFlagState : function (flagged) {
                /// <param name="read" type="Boolean" />
                Debug.assert(Jx.isBoolean(flagged));
                var selectedMessages = /*@static_cast(Array)*/Mail.Globals.appState.selectedMessages;
                Debug.assert(Jx.isArray(selectedMessages));
                return selectedMessages.some(function (item) {
                    /// <param name="item" type="Mail.UIDataModel.MailItem"/>
                    return item.canFlag && item.flagged === flagged;
                });
            },

            hasFlaggedMessages : function () {
                return Contexts._containsItemsWithFlagState(true);
            },

            hasUnflaggedMessages : function () {
                return Contexts._containsItemsWithFlagState(false);
            },

            selectionSupportMoving : function () {
                var selectedMessages = /*@static_cast(Array)*/Mail.Globals.appState.selectedMessages;
                Debug.assert(Jx.isArray(selectedMessages));
                return selectedMessages.some(function (message) {
                    /// <param name="message" type="Mail.UIDataModel.MailMessage"/>
                    return message.canMove;
                });
            },

            selectedMessagesSupportSweep : function (selection) {
                // Sweep is supported if at least one message or conversation in the
                // selection has a sender and is not a draft.

                var itemSupportsSweep = function (mailItem) {
                        // If the mailItem has a non-null from property. The IRecipient should
                        // have a non empty string for its emailAddress
                        Debug.assert(!mailItem.from || Jx.isNonEmptyString(mailItem.from.emailAddress));

                        return !mailItem.isDraft && mailItem.from;
                    };

                return selection.messages.some(itemSupportsSweep);
            },

            allExceptDraftsAndOutbox: function (selection) {
                var message = selection.message;
                return !message.isInOutbox && !message.isDraft;
            },

            draftsAreSelected: function (selection) {
                return selection.messages.some(function (msg) { return msg.isDraft; });
            },

            selectionSupportsEditCommand : function () {
                var selectedMessage = /*@static_cast(Mail.UIDataModel.MailMessage)*/ Mail.Globals.appState.lastSelectedMessage;


                if (!selectedMessage) {
                    return false;
                }

                var messageOpenInChildWindow = Mail.GlomManager.messageOpenInAnotherWindow(selectedMessage);

                return (messageOpenInChildWindow && selectedMessage.isDraft) ||
                    selectedMessage.isInOutbox;
            },

            folderSupportsJunkCommand : function (selection) {
                var type = selection.view.type;
                return type !== MailViewType.draft && type !== MailViewType.junkMail && type !== MailViewType.outbox;
            },


            _doesTileExist : function (selection) {
                Mail.writeProfilerMark("Commands.Contexts._doesTileExist", Mail.LogEvent.start);
                var view = selection.view,
                    tileExist = view && Jx.isNonEmptyString(view.startScreenTileId) && Windows.UI.StartScreen.SecondaryTile.exists(view.startScreenTileId);
                Mail.writeProfilerMark("Commands.Contexts._doesTileExist", Mail.LogEvent.stop);
                return tileExist;
            },

            showPin : function (selection) {
                var result = false,
                    view = selection.view;
                try {
                    result = view && Mail.ViewCapabilities.canPinToStart(view) && !Contexts._doesTileExist(selection);
                } catch (e) {
                    Jx.log.exception("CommandContexts.showPin - _doesTileExist fails with ", e);
                }
                return result;
            },

            showUnpin : function (selection) {
                var result = false,
                    view = selection.view;
                try {
                    result = view && Mail.ViewCapabilities.canPinToStart(view) && Contexts._doesTileExist(selection);
                } catch (e) {
                    Jx.log.exception("CommandContexts.showUnpin - _doesTileExist fails with ", e);
                }
                return result;
            },

            isPrintingEnabled : function () {
                var printHandler = new Mail.PrintHandler();
                return printHandler.printEnabled && Contexts.singleSelection();
            },

            allowResponse: function (selection) {
                var type = selection.view.type;
                return type !== MailViewType.outbox && type !== MailViewType.junkMail;
            },

            irmAllows: function (property) {
                var selectedMessage = /*@static_cast(Mail.UIDataModel.MailMessage)*/ Mail.Globals.appState.lastSelectedMessage;
                Debug.assert(Jx.isBoolean(selectedMessage[property]));
                return selectedMessage[property];
            },

            irmCanRespond : function () {
                return Contexts.irmAllows("irmCanForward") ||
                       Contexts.irmAllows("irmCanReply") ||
                       Contexts.irmAllows("irmCanReplyAll");
            },

            composeInFocus: function () {
                // Only use this function as an enable context for shortcuts; 
                // there is no enableContext type that will update commands that use this function
                var selection = Mail.Globals.commandManager.getContext("composeSelection");
                return selection && selection.composeInFocus;
            },

            copyEnabled: function () {
                var selection = Mail.Globals.commandManager.getContext("composeSelection");
                if (selection) {
                    var state = selection.getSelectionState();
                    // TODO check if copy cmd is enabled
                    return state.hasNonEmptySelection;
                }
                return false;
            },

            composeInLink: function () {
                var selection = Mail.Globals.commandManager.getContext("composeSelection");
                if (selection) {
                    var state = selection.getSelectionState();
                    return state.isLink;
                }
                return false;
            },

            composeFormatToggle: function (format) {
                var selection = Mail.Globals.commandManager.getContext("composeSelection");
                if (selection) {
                    var styles = selection.getSelectionStyles();
                    Debug.assert(styles.hasOwnProperty(format), "Unknown format toggle " + format);
                    return styles[format];
                } else {
                    return false;
                }
            }

        };
});
