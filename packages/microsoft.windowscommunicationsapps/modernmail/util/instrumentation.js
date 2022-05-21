
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft,Windows*/

Jx.delayDefine(Mail, "Instrumentation", function () {
    "use strict";

    var Ids = Microsoft.WindowsLive.Instrumentation.Ids.Mail,
        Platform = Microsoft.WindowsLive.Platform,
        ViewType = Platform.MailViewType,

        ItemSelection = { // BICI values for Triage command's item selection attribute
            none: 1,
            single: 2,
            multiple: 3
        },

        TriageUIEntryPoint = { // BICI values for Triage command's UI entry point attribute
            keyboardShortcut: 1,
            onMessage: 2,
            appBar: 3,
            other: 4,
            onCanvas: 5,
            automatic: 6
        },

        UserLoginType = { // BICI values for modernUserLogin and connectedMailAccountsOnMailVisible's ModernLoginType attribute
            microsoft: 1,
            enterprise: 2,
            microsoftWithEnterprise: 3
        },

        FormattingUIEntryPoint = { // BICI values for Formatting command's UI entry point attribute
            keyboardShortcut: 1,
            appBar: 2,
            other: 3
        };

    var MI = Mail.Instrumentation = {
        _touchPresent: null,
        _isTouchPresent: function () {
            var value = MI._touchPresent;
            if (!Jx.isValidNumber(value)) {
                Mail.log("Mail.Instrumentation._touchPresent", Mail.LogEvent.start);
                var touchCapabilities = new Windows.Devices.Input.TouchCapabilities();
                MI._touchPresent = value = touchCapabilities.touchPresent ? 1 : 0;
                Mail.log("Mail.Instrumentation._touchPresent", Mail.LogEvent.stop);
            }
            return value;
        },

        _getUserLoginType: function () {
            // if lastAuthResult is defaultAccountDoesNotExist, we are in enterprise mode
            if (Microsoft.WindowsLive.Platform.Result.defaultAccountDoesNotExist === Mail.Globals.platform.accountManager.defaultAccount.lastAuthResult) {
                return UserLoginType.enterprise;
            }

            // if isMicrosoftAccountOptional is set, we are using a Microsoft account in enterprise mode
            var msaOptional = false;

            try {
                msaOptional = Windows.Management.Workplace.WorkplaceSettings.isMicrosoftAccountOptional;
            }
            catch(ex) {
                // The call above might fail on server/datacenter SKUs; consequently, we presume regular mode upon failure
                Jx.log.exception("Windows.Management.Workplace.WorkplaceSettings.isMicrosoftAccountOptional lookup failed", ex);
            }

            // Either we are using a Microsoft account normally or in enterprise mode
            return msaOptional ? UserLoginType.microsoftWithEnterprise : UserLoginType.microsoft;
        },

        instrumentAppBarInvoke: function (type) {
            Debug.assert(Jx.isValidNumber(type));
            Mail.log("Mail.Instrumentation.instrumentAppBarInvoke", Mail.LogEvent.start);

            var MIABIT = MI.AppBarInvokeType;
            if (type === MIABIT.peekBarTouch || type === MIABIT.edgyTouch) {
                MI._touchPresent = true; // We know for sure the user is touch-capable
            }

            Jx.bici.addToStream(Ids.mailAppBarInvoke, MI._isTouchPresent(), type);

            Mail.log("Mail.Instrumentation.instrumentAppBarInvoke", Mail.LogEvent.stop);
        },

        instrumentTriageCommand: function (command, entryPoint, selection) {
            Debug.assert(Jx.isValidNumber(command));
            Debug.assert(Jx.isValidNumber(entryPoint));
            Debug.assert(Jx.isObject(selection));

            Mail.log("Mail.Instrumentation.instrumentTriageCommand", Mail.LogEvent.start);

            var selectedMessagesCount = selection.messages.length,
                itemSelection = ItemSelection.none,
                entryPointValue = null;

            if (selectedMessagesCount === 1) {
                itemSelection = ItemSelection.single;
            } else if (selectedMessagesCount > 1) {
                itemSelection = ItemSelection.multiple;
            }

            if (entryPoint === UIEP.keyboardShortcut) {
                entryPointValue = TriageUIEntryPoint.keyboardShortcut;
            } else if (entryPoint === UIEP.onMessage) {
                entryPointValue = TriageUIEntryPoint.onMessage;
            } else if (entryPoint === UIEP.appBar) {
                entryPointValue = TriageUIEntryPoint.appBar;
            } else if (entryPoint === UIEP.onCanvas) {
                entryPointValue = TriageUIEntryPoint.onCanvas;
            } else if (entryPoint === UIEP.automatic) {
                entryPointValue = TriageUIEntryPoint.automatic;
            } else if (entryPoint === UIEP.dragAndDrop) {
                entryPointValue = TriageUIEntryPoint.other;
            }
            Debug.assert(Jx.isValidNumber(entryPointValue));

            Jx.bici.addToStream(
                Ids.mailTriageCommand,
                command,
                entryPointValue,
                itemSelection,
                MI._isTouchPresent(),
                MI.getServerDomain(selection.account.platformObject),
                MI._getFolderViewValue(selection.view)
            );

            Mail.log("Mail.Instrumentation.instrumentTriageCommand", Mail.LogEvent.stop);
        },

        instrumentMailCommand: function (command) {
            Debug.assert(Jx.isValidNumber(command));
            Mail.log("Mail.Instrumentation.instrumentMailCommand", Mail.LogEvent.start);
            Jx.bici.addToStream(Ids.modernMailCommand, command, MI._isTouchPresent());
            Mail.log("Mail.Instrumentation.instrumentMailCommand", Mail.LogEvent.stop);
        },

        instrumentFormattingCommand: function (command, entryPoint) {
            Debug.assert(Jx.isValidNumber(command));
            Debug.assert(Jx.isValidNumber(entryPoint));
            Mail.log("Mail.Instrumentation.instrumentFormattingCommand", Mail.LogEvent.start);

            var entryPointValue = FormattingUIEntryPoint.other;
            if (entryPoint === UIEP.keyboardShortcut) {
                entryPointValue = FormattingUIEntryPoint.keyboardShortcut;
            } else if (entryPoint === UIEP.appBar) {
                entryPointValue = FormattingUIEntryPoint.appBar;
            }

            Jx.bici.addToStream(Ids.mailFormatCommand, entryPointValue, command, MI._isTouchPresent());
            Mail.log("Mail.Instrumentation.instrumentFormattingCommand", Mail.LogEvent.stop);
        },

        getServerDomain: function (account) {
            var serverType = Platform.ServerType.eas;
            if (account.accountType === Platform.AccountType.imap) {
                serverType = Platform.ServerType.imap;
            }
            var serverDomain = null,
                serverAddress = account.getServerByType(serverType).server;
            try {
                serverDomain = new Windows.Foundation.Uri("foo://" + serverAddress).domain;
            } catch (e) {
                // The server address is user-provided and can be mal-formed, causing the WinRT API to throw an exception.
                serverDomain = "windows-mail-telemetry-account-no-domain";
            }
            return serverDomain;
        },

        instrumentEmailProviders: function () {
            Mail.log("Mail.Instrumentation.instrumentEmailProviders", Mail.LogEvent.start);
            var accounts = Mail.Globals.platform.accountManager.getConnectedAccountsByScenario(
                    Platform.ApplicationScenario.mail, Platform.ConnectedFilter.normal, Platform.AccountSort.name
                ),
                touchCapable = MI._isTouchPresent(),
                userLoginType = MI._getUserLoginType();

            for (var i = 0, accountCount = accounts.count; i < accountCount; i++) {
                var account = accounts.item(i);
                var serverDomain = MI.getServerDomain(account);

                Jx.bici.addToStream(Ids.connectedMailAccountsOnMailVisible, serverDomain, accountCount, touchCapable, userLoginType);
            }

            Jx.bici.addToStream(Ids.connectedMailAccountsOnMailVisible, "windows-mail-telemetry", accountCount, touchCapable, userLoginType);
            Jx.bici.addToStream(Ids.modernUserLogin, userLoginType);
            Mail.log("Mail.Instrumentation.instrumentEmailProviders", Mail.LogEvent.stop);
        },

        instrumentConversationThreading: function () {
            Mail.log("Mail.Instrumentation.instrumentConversationThreading", Mail.LogEvent.start);
            // Convert bool setting to int for BICI
            // Because BICI filters out 0's, and the chart's goal is to compare threaded enabled users to non threaded enabled users,
            // a 1 = disabled, and a 2 = enabled.
            Jx.bici.set(Ids.modernMailConversationThreadingEnabled, (Mail.Globals.appSettings.isThreadingEnabled ? 2 : 1));
            Mail.log("Mail.Instrumentation.instrumentConversationThreading", Mail.LogEvent.stop);
        },

        _getViewDisabledValue: function (view) {
            var ViewDisabled = MI.ViewDisabled;
            var value = ViewDisabled.disabled;

            if (view.isEnabled) {
                if (view.isPinnedToNavPane) {
                    value = ViewDisabled.enabledAndPinned;
                } else {
                    value = ViewDisabled.enabledAndUnpinned;
                }
            }
            return value;
        },

        _getFolderViewValue: function (view) {
            var FolderView = MI.FolderView;
            var value = FolderView.others;
            switch (view.type) {
                case ViewType.inbox: value = FolderView.inbox; break;
                case ViewType.flagged: value = FolderView.flagged; break;
                case ViewType.deletedItems: value = FolderView.deletedItems; break;
                case ViewType.sentItems: value = FolderView.sentItems; break;
                case ViewType.outbox: value = FolderView.outbox; break;
                case ViewType.draft: value = FolderView.draft; break;
                case ViewType.junkMail: value = FolderView.junkMail; break;
                case ViewType.social: value = FolderView.social; break;
                case ViewType.newsletter: value = FolderView.newsletter; break;
                case ViewType.allPinnedPeople: value = FolderView.allPinnedPeople; break;
                case ViewType.person: value = view.isPinnedToNavPane ? FolderView.pinnedPerson : FolderView.suggestedPerson; break;
                case ViewType.userGeneratedFolder: value = view.isPinnedToNavPane ? FolderView.pinnedUserGeneratedFolder : FolderView.other; break;
                default: value = FolderView.other; break;
            }
            return value;
        },

        instrumentNavigation: function (view) {
            Mail.log("Mail.Instrumentation.instrumentNavigation", Mail.LogEvent.start);
            Debug.assert(view);

            var account = view.account;
            var platformAccount = account.platformObject;
            // The account could have been deleted by the time it's instrumented. Only proceed if it's still valid.
            if (platformAccount && platformAccount.isObjectValid) {

                var navPaneViews = account.queryViews(Platform.MailViewScenario.navPane);
                var Filters = Mail.ViewFilters;
                var pinnedPeople = Filters.filterByType(navPaneViews, [ViewType.person], []);
                var navPaneFolders = Filters.filterByType(navPaneViews, Filters.folders, []);
                // navPaneFolders should at least have inbox folder
                Debug.assert(navPaneFolders.count >= 1);

                var ViewDisabled = MI.ViewDisabled;
                var newslettersDisabled = ViewDisabled.NA;
                var socialUpdateDisabled = ViewDisabled.NA;
                var easSettings = platformAccount.getServerByType(Platform.ServerType.eas);
                // Only hotmail supportssystemCategories view. Short-circuit non-hotmail account to avoid the query.
                if (easSettings && easSettings.isWlasSupported) {
                    var systemCategories = account.queryViews(Platform.MailViewScenario.systemCategories);
                    // systemCategories include social view and newsletter view
                    if (systemCategories) {
                        systemCategories.forEach (function (view) {
                            if (view.type === ViewType.social) {
                                socialUpdateDisabled = MI._getViewDisabledValue(view);
                            } else if (view.type === ViewType.newsletter) {
                                newslettersDisabled = MI._getViewDisabledValue(view);
                            }
                        });
                    }
                    Jx.dispose(systemCategories);
                }

                Jx.bici.addToStream(Ids.modernMailNavigate,
                    MI._getFolderViewValue(view), // folder view type
                    MI.getServerDomain(account.platformObject), // email domain name
                    pinnedPeople.count,       // numPinnedPeople
                    navPaneFolders.count - 1, // numPinnedFolders = numNavPaneFolders - 1 (exclude inbox folder)
                    newslettersDisabled,
                    socialUpdateDisabled);

                Jx.dispose(pinnedPeople);
                Jx.dispose(navPaneFolders);
                Jx.dispose(navPaneViews);
            }
            Mail.log("Mail.Instrumentation.instrumentNavigation", Mail.LogEvent.stop);
        },

        FolderView: { // Map from view type to their BICI values
            inbox: 1,
            flagged: 2,
            deletedItems: 3,
            sentItems: 4,
            outbox: 5,
            draft: 6,
            junkMail: 7,
            social: 8,
            newsletter: 9,
            allPinnedPeople: 10,
            pinnedPerson: 11,
            suggestedPerson: 12,
            pinnedUserGeneratedFolder: 13,
            //attachment: 14, // reserved for attachment view
            other: 15
        },

        ViewDisabled: { // BICI values for whether a view is disabled or unpinned
            enabledAndPinned: 0,
            enabledAndUnpinned: 1,
            disabled: 2,
            NA: 3
        },

        Commands: { // Map from commands to their BICI values
            // Triage commands
            delete: 1,
            new: 2,
            reply: 3,
            replyAll: 4,
            forward: 5,
            flag: 6,
            unflag: 7,
            move: 8,
            markAsRead: 9,
            markAsUnread: 10,

            // Mail commands
            enterSelectionMode: 1,
            newComposeWindow: 2,
            newReadingPaneWindow: 3,

            // Formatting commands
            // Values 1 - 7 and 9 - 16 are ModernCanvas\MailModernCanvas.js
            emoticon: 8,
            saveDraft: 17
        },

        UIEntryPoint: { // These are only for users of Mail.Instrumentation - they don't correspond to actual BICI values.
            keyboardShortcut: 0,
            onMessage: 1,
            appBar: 2,
            onCanvas: 3,
            dragAndDrop: 4,
            automatic: 5
        },

        AppBarInvokeType: { // BICI values for invoking the appbar method
            peekBarTouch: 1,
            peekBarMouse: 2,
            rightClick: 3,
            composeSelection: 4,
            consumeSelection: 5,
            edgyTouch: 6,
            edgyKeyboard: 7
        }
    };

    var UIEP = MI.UIEntryPoint;
});