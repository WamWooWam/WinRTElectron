
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Windows,Microsoft,WinJS,Jx,Debug*/

Jx.delayDefine(Mail.Commands, "Handlers", function () {

    var Instr = Mail.Instrumentation;

    Mail.Commands.Handlers = {};

    Mail.Commands.Handlers.onMarkAsRead = function (selection, uiEntryPoint) {
        Mail.writeProfilerMark("CommandBar_onMarkAsRead", Mail.LogEvent.start);
        selection.setReadState(true);
        Instr.instrumentTriageCommand(Instr.Commands.markAsRead, uiEntryPoint, selection);
        Mail.writeProfilerMark("CommandBar_onMarkAsRead", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.onMarkAsUnread = function (selection, uiEntryPoint) {
        Mail.writeProfilerMark("CommandBar_onMarkAsUnread", Mail.LogEvent.start);
        selection.setReadState(false);
        Instr.instrumentTriageCommand(Instr.Commands.markAsUnread, uiEntryPoint, selection);
        Mail.writeProfilerMark("CommandBar_onMarkAsUnread", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.applyFlag = function (selection, uiEntryPoint) {
        Mail.writeProfilerMark("CommandBar_applyFlag", Mail.LogEvent.start);
        selection.setFlagState(true);
        Instr.instrumentTriageCommand(Instr.Commands.flag, uiEntryPoint, selection);
        Mail.writeProfilerMark("CommandBar_applyFlag", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.removeFlag = function (selection, uiEntryPoint) {
        Mail.writeProfilerMark("CommandBar_removeFlag", Mail.LogEvent.start);
        selection.setFlagState(false);
        Instr.instrumentTriageCommand(Instr.Commands.unflag, uiEntryPoint, selection);
        Mail.writeProfilerMark("CommandBar_removeFlag", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.deleteMessages = function (draftCount, deleteFunction, uiEntryPoint, selection) {
        Debug.assert(Jx.isValidNumber(draftCount) && draftCount >= 0, "draftCount is not valid");
        Debug.assert(Jx.isFunction(deleteFunction), "deleteFunction isn't a function");
        Debug.assert(Jx.isObject(selection));

        Mail.writeProfilerMark("CommandBar_deleteMessages", Mail.LogEvent.start);

        var deleteFunctionWrapper = function () {
            deleteFunction();
            Mail.guiState.ensureNavMessageList();
            Instr.instrumentTriageCommand(Instr.Commands.delete, uiEntryPoint, selection);
            Jx.EventManager.fireDirect(null, "exitSelectionMode");
        };

        if (draftCount === 0) {
            deleteFunctionWrapper();
        } else {
            var Popups = Windows.UI.Popups,
                isSingularDelete = (draftCount === 1),
                bodyText = Jx.res.getString(isSingularDelete ? "mailDeleteDraftBodyText" : "mailDeleteMultipleDraftsBodyText"),
                title = Jx.res.getString(isSingularDelete ? "mailDeleteDraftTitle" : "mailDeleteMultipleDraftsTitle");
            var messageDialog = new Popups.MessageDialog(bodyText, title);
            messageDialog.commands.append(new Popups.UICommand(Jx.res.getString("mailDeleteDraftConfirm"), deleteFunctionWrapper));
            messageDialog.commands.append(new Popups.UICommand(Jx.res.getString("mailDeleteDraftCancel"), Jx.fnEmpty));
            messageDialog.defaultCommandIndex = messageDialog.cancelCommandIndex = 1;
            Mail.showPopupAsync(messageDialog);
        }

        Mail.writeProfilerMark("CommandBar_deleteMessages", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.onDeleteButton = function (selection, uiEntryPoint) {
        Mail.log("CommandBar_onDeleteButton", Mail.LogEvent.start);
        var messages = selection.messages,
            drafts = messages.filter(function (msg) { return msg.hasDraft; });
        Mail.Commands.Handlers.deleteMessages(drafts.length, function () {
            selection.deleteItems(messages);
        }, uiEntryPoint, selection);
        Mail.log("CommandBar_onDeleteButton", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.onJunkButton = function (selection) {
        Mail.writeProfilerMark("CommandBar_onJunkButton", Mail.LogEvent.start);
        selection.junkItems();
        Mail.writeProfilerMark("CommandBar_onJunkButton", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.onUnjunkButton = function (selection) {
        Mail.writeProfilerMark("CommandBar_onUnjunkButton", Mail.LogEvent.start);
        selection.moveItemsTo(selection.account.inboxView);
        Mail.writeProfilerMark("CommandBar_onUnjunkButton", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.onSyncButton = function () {
        Mail.writeProfilerMark("CommandBar_onSyncButton", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(Mail.Globals.platform));

        // Notify that the sync button was pushed. There is special
        // message bar handling for this scenario.
        Jx.EventManager.fireDirect(null, Mail.Commands.Events.showNextSyncStatus);

        Jx.forceSync(Mail.Globals.platform, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);
        Mail.writeProfilerMark("CommandBar_onSyncButton", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.onMoveButton = function (selection, uiEntryPoint, anchorId) {
        Mail.writeProfilerMark("CommandBar_onMoveButton", Mail.LogEvent.start);

        var frame = document.getElementById("idCompApp");

        Mail.Globals.commandManager.showAppBar().then(function () {
            Mail.MoveFlyout.showMoveFlyout(frame, selection, anchorId);
            Instr.instrumentTriageCommand(Instr.Commands.move, uiEntryPoint, selection);
            Mail.writeProfilerMark("CommandBar_onMoveButton", Mail.LogEvent.stop);
        });
    };

    Mail.Commands.Handlers.onToggleSelectionMode = function () {
        Mail.SelectionHandler.toggleSelectionMode();
    };

    Mail.Commands.Handlers._getDefaultPinnedTileName = function (account, view) {
        /// <summary>Retrieves the default string for the pinned tile</summary>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount"></param>
        /// <param name="view" type="Mail.UIDataModel.MailView"></param>
        return Jx.res.loadCompoundString("mailCommandPinAccountAndFolderName", account.displayName, view.name);
    };

    Mail.Commands.Handlers._getSecondaryTileLogos = function (account) {
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount"></param>
        var logos = {};
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        var accountIconType = account.iconType;
        var iconType = Microsoft.WindowsLive.Platform.AccountIconType;

        // specific image assets for Outlook and Exchange
        if (accountIconType === iconType.exchange) {
            logos.wide310x150 = "ms-appx:///ModernMail/Resources/Images/ExchangeWideLogo.png";
            logos.square30x30 = "ms-appx:///ModernMail/Resources/Images/ExchangeSmallLogo.png";
            logos.square70x70 = "ms-appx:///ModernMail/Resources/Images/ExchangeTinyLogo.png";
            logos.square150x150 = "ms-appx:///ModernMail/Resources/Images/ExchangeLogo.png";
            logos.square310x310 = "ms-appx:///ModernMail/Resources/Images/ExchangeLargeLogo.png";
            logos.lockScreen = "ms-appx:///ModernMail/Resources/Images/ExchangeBadge.png";
        } else if (accountIconType === iconType.outlook) {
            logos.wide310x150 = "ms-appx:///ModernMail/Resources/Images/HotmailWideLogo.png";
            logos.square30x30 = "ms-appx:///ModernMail/Resources/Images/HotmailSmallLogo.png";
            logos.square70x70 = "ms-appx:///ModernMail/Resources/Images/HotmailTinyLogo.png";
            logos.square150x150 = "ms-appx:///ModernMail/Resources/Images/HotmailLogo.png";
            logos.square310x310 = "ms-appx:///ModernMail/Resources/Images/HotmailLargeLogo.png";
            logos.lockScreen = "ms-appx:///ModernMail/Resources/Images/HotmailBadge.png";
        } else {
            logos.wide310x150 = "ms-appx:///ModernMail/Res/MailWideLogo.png";
            logos.square30x30 = "ms-appx:///ModernMail/Res/MailSmallLogo.png";
            logos.square70x70 = "ms-appx:///ModernMail/Res/MailTinyLogo.png";
            logos.square150x150 = "ms-appx:///ModernMail/Res/MailLogo.png";
            logos.square310x310 = "ms-appx:///ModernMail/Res/MailLargeLogo.png";
            logos.lockScreen = "ms-appx:///ModernMail/Res/MailBadge.png";
        }
        return logos;
    };

    Mail.Commands.Handlers._getTileInfoForView = function (activationArguments) {
        var jsonArguments = JSON.parse(activationArguments),
            tileId = "",
            wl = Microsoft.WindowsLive.Platform,
            shouldRoam = jsonArguments.type !== wl.TileIdType.localMailViewId; // Certain views cannot be roamed due to their state

        // The TileId has to be a unique id.  We'll first attempt to encode the arguments, if possible.
        if ((jsonArguments.type === wl.TileIdType.roamingMailViewId) && (jsonArguments.viewType !== wl.MailViewType.userGeneratedFolder) && (jsonArguments.viewType !== wl.MailViewType.person)) {
            // Turn candidate into a decent filepath if the view has a constant RoamingSourceObjectId property.
            // (i.e. its type is not userGeneratedFolder or person).

            // NOTE: We only really need to escape the commas and colons, but this will be resilient in case opaque string IDs from
            // the platform have any strange characters.
            var formatValue = function (key) {
                var val = this[key];
                if (Jx.isObject(val)) {
                    return formatValueString(val);
                }

                return val;
            };
            var formatValueString = function (jsonObject) {
                return Object.keys(jsonObject).map(formatValue, jsonObject).join("_").replace(/[\n\t\";,:!<>\/\\\*\? ]/g, "");
            };
            tileId = formatValueString(jsonArguments);
        }

        // If we haven't determined a tileId, or if it is too long, we'll generate one.
        if (!Jx.isNonEmptyString(tileId) || (tileId.length > 64)) {
            // We will use device id combined with local time since it is unlikely to incorrectly conflict.
            // NOTE: we format the device id and the time in a way to help ensure that the end result is
            // <= 64 characters
            var deviceId = new Windows.Security.ExchangeActiveSyncProvisioning.EasClientDeviceInformation().id;
            tileId = "Mail_" + deviceId.replace(/-/g, "") + "_" + Date.now().toString(16);
        }

        return { tileId: tileId, shouldRoam: shouldRoam };
    };

    Mail.Commands.Handlers.onPinFolder = function (selection, anchor) {
        Mail.log("CommandBar_pinOperation", Mail.LogEvent.start);
        Mail.writeProfilerMark("CommandBar_onPinButton", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isNonEmptyString(anchor), "Expecting anchor element id");

        var StartScreen = Windows.UI.StartScreen;
        var Foundation = Windows.Foundation;

        var selectedView = selection.view,
            selectedAccount = selection.account.platformObject;

        var commandManager = Mail.Globals.commandManager;
        commandManager.showAppBar().then(function () {
            var activationArguments = Mail.Activation.stringifyArguments(selectedView);
            Debug.assert(Jx.isNonEmptyString(activationArguments));
            if (!Jx.isNonEmptyString(activationArguments)) {
                return WinJS.Promise.wrapError(new Error("Could not create arguments"));
            }

            var tileInfo = Mail.Commands.Handlers._getTileInfoForView(activationArguments);
            Debug.assert(!StartScreen.SecondaryTile.exists(tileInfo.tileId));
            if (StartScreen.SecondaryTile.exists(tileInfo.tileId)) {
                return;
            }

            var tileName = Mail.Commands.Handlers._getDefaultPinnedTileName(selectedAccount, selectedView),
                logos = Mail.Commands.Handlers._getSecondaryTileLogos(selectedAccount),
                uriWide310x150Logo = new Foundation.Uri(logos.wide310x150),
                uriSquare30x30Logo = new Foundation.Uri(logos.square30x30),
                uriSquare70x70Logo = new Foundation.Uri(logos.square70x70),
                uriSquare150x150Logo = new Foundation.Uri(logos.square150x150),
                uriSquare310x310Logo = new Foundation.Uri(logos.square310x310),
                uriBadgeLogo = new Foundation.Uri(logos.lockScreen),
                tile = new StartScreen.SecondaryTile(tileInfo.tileId);

            tile.displayName = tileName;
            tile.shortName = tileName;
            tile.arguments = activationArguments;
            tile.roamingEnabled = tileInfo.shouldRoam;
            tile.foregroundText = StartScreen.ForegroundText.light;
            tile.lockScreenBadgeLogo = uriBadgeLogo;

            tile.visualElements.showNameOnSquare150x150Logo = true;
            tile.visualElements.showNameOnWide310x150Logo = true;
            tile.visualElements.showNameOnSquare310x310Logo = true;
            tile.visualElements.wide310x150Logo = uriWide310x150Logo;
            tile.visualElements.square30x30Logo = uriSquare30x30Logo;
            tile.visualElements.square70x70Logo = uriSquare70x70Logo;
            tile.visualElements.square150x150Logo = uriSquare150x150Logo;
            tile.visualElements.square310x310Logo = uriSquare310x310Logo;

            var anchorElement = document.getElementById(anchor),
                rect = anchorElement.getBoundingClientRect(),
                requestComplete = function (created) {
                    commandManager.hideAppBar();
                    if (created) {
                        commandManager.pinnedFolderChange();
                        selectedView.setStartScreenTileId(tileInfo.tileId, activationArguments);
                    }
                    Mail.log("CommandBar_pinOperation", Mail.LogEvent.stop);
                };

            try {
                // center the flyout over the button, and provide a 5px buffer between the appbar and the flyout
                tile.requestCreateAsync({ x : rect.left + rect.width / 2, y : rect.top - 5 }).done(requestComplete);
            } catch (ex) {
                // requestCreateAsync() can fail if there is another system popup on the screen. In this case, the failure
                // is expected and the exception should have an HRESULT of E_ACCESSDENIED (-2147024891). If the exception
                // is anything other than E_ACCESSDENIED, this is a new issue that should be investigated.
                Debug.assert(ex.number === -2147024891 /*E_ACCESSDENIED*/);
                Mail.writeProfilerMark("StartScreen.SecondaryTile.requestCreateAsync threw exception " + ex.number, Mail.LogEvent.stop);
                Mail.log("CommandBar_pinOperation", Mail.LogEvent.stop);
            }

            Mail.writeProfilerMark("CommandBar_onPinButton", Mail.LogEvent.stop);
        }.bind(this));
    };

    Mail.Commands.Handlers.onUnpinFolder = function (selection, anchor) {
        Mail.log("CommandBar_unpinOperation", Mail.LogEvent.start);
        Mail.writeProfilerMark("CommandBar_onUnpinButton", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(selection.view, Mail.UIDataModel.MailView));

        Mail.Commands.Handlers.unpinFolder(selection.view.startScreenTileId, anchor);
        Mail.writeProfilerMark("CommandBar_onUnpinButton", Mail.LogEvent.stop);
    };

    Mail.Commands.Handlers.unpinFolder = function (tileId, anchor) {
        var StartScreen = Windows.UI.StartScreen;
        Debug.assert(Jx.isNonEmptyString(anchor), "Expecting anchor element id");
        if (StartScreen.SecondaryTile.exists(tileId)) {
            var tile = new StartScreen.SecondaryTile(tileId),
                anchorElement = document.getElementById(anchor || "folderOperations"),
                rect = anchorElement.getBoundingClientRect();

            tile.requestDeleteAsync({ x : rect.left, y : rect.top }).done(function (deleted) {
                var commandManager = Mail.Globals.commandManager;
                commandManager.hideAppBar();
                if (deleted) {
                    commandManager.pinnedFolderChange();
                }
                Mail.log("CommandBar_unpinOperation", Mail.LogEvent.stop);
            });
        }
    };

    Mail.Commands.Handlers.showPreviousMessage = function () {
        Jx.EventManager.fireDirect(null, Mail.Commands.Events.showPreviousMessage);
    };

    Mail.Commands.Handlers.showNextMessage = function () {
        Jx.EventManager.fireDirect(null, Mail.Commands.Events.showNextMessage);
    };

    Mail.Commands.Handlers.applyAllFilter = function () {
        Jx.EventManager.fireDirect(null, Mail.Commands.Events.allFilterApplied);
    };

    Mail.Commands.Handlers.applyUnreadFilter = function () {
        Jx.EventManager.fireDirect(null, Mail.Commands.Events.unreadFilterApplied);
    };

    Mail.Commands.Handlers.reapplyFilter = function () {
        Jx.EventManager.fireDirect(null, Mail.Commands.Events.reapplyFilter);
    };

    Mail.Commands.Handlers.print = function () {
        var printHandler = new Mail.PrintHandler();
        printHandler.showPrintUI();
    };

    Mail.Commands.Handlers.dismissAppBar = function () {
        var commandManager = /*@static_cast(Mail.Commands.Manager)*/Mail.Globals.commandManager;
        commandManager.hideAppBar();
    };

    Mail.Commands.Handlers.composeCommand = function (command, value) {
        var commandManager = /*@static_cast(Mail.Commands.Manager)*/Mail.Globals.commandManager,
            selection = commandManager.getContext("composeSelection");

        if (Boolean(selection)) {
            selection.fireCommandEvent(command, value);
        }
    };

    Mail.Commands.Handlers.composeSaveCommand = function (selection, uiEntryPoint) {
        var commandManager = /*@static_cast(Mail.Commands.Manager)*/Mail.Globals.commandManager,
            composeSelection = commandManager.getContext("composeSelection");

        if (Boolean(composeSelection)) {
            composeSelection.saveCommand();
            Instr.instrumentFormattingCommand(Instr.Commands.saveDraft, uiEntryPoint);
        }
    };

    Mail.Commands.Handlers.composeEmojiPicker = function (selection, uiEntryPoint) {
        var commandManager = /*@static_cast(Mail.Commands.Manager)*/Mail.Globals.commandManager,
            composeSelection = commandManager.getContext("composeSelection");

        if (Boolean(composeSelection)) {
            composeSelection.pauseAppBarPadding();
            WinJS.UI.AppBar._ElementWithFocusPreviousToAppBar = null;
            commandManager.hideAppBar();
            composeSelection.showEmojiPicker();
            Instr.instrumentFormattingCommand(Instr.Commands.emoticon, uiEntryPoint);
        }
    };

    Mail.Commands.Handlers.edit = function (selection, glomManager) {
        var message = selection.message;
        if (!message.isDraft && message.canMoveFromOutboxToDrafts) {
            try {
                message.moveFromOutboxToDraftsAndCommit();
                selection.updateNav(selection.account, selection.account.draftsView, message);
                Mail.Utilities.ComposeHelper.onEdit(message, true /*moveFocus*/);
            } catch (ex) {
                // Moving the message to the drafts folder can fail if it is the process of being sent. In this case,
                // the platform might delete the message or do something else to block the move. In that case, we
                // have nothing to do.
            }
        } else {
            glomManager.handleCommandBarNewChild();
        }
    };

    Mail.Commands.Handlers.newChildWindow = function (selection, handler) {
        var helper = Mail.Utilities.ComposeHelper;
        if (selection.message.isDraft && helper.isComposeShowing) {
            helper.setDirty();
            helper.hideCurrent();
        }
        handler();
    };

    
    Mail.Commands.Handlers.printDebug = function () {
        var printHandler = new Mail.PrintHandler();
        printHandler.showPrintUI(true);
    };
    
});
