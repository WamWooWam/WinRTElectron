
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//
/*global Mail, Jx, Microsoft, Jm, Tx */
(function () {

    var P = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    Mail.CompApp = Mail.CompApp || {};
    Mail.CompApp.rootElementId = Mail.CompApp.rootElementId || "idCompApp";

    var MockCommandHost = function (tc, id, commandIds) {
        this.tc = tc;
        this.id = id;
        this.registeredCommandIds = commandIds;
    };

    MockCommandHost.prototype = {
        mock$commandToVisibilityBinding: {},
        mock$commandToToggleStateBinding: {},
        activateCommands : function () {
            // No-op
        },
        updateEnabledLists: function (showingList, hiddenList) {
            this.tc.isTrue(Jx.isArray(showingList));
            this.tc.isTrue(Jx.isArray(hiddenList));
            showingList.forEach(function (commandId) {
                this.mock$commandToVisibilityBinding[commandId] = true;
            }, this);
            hiddenList.forEach(function (commandId) {
                this.mock$commandToVisibilityBinding[commandId] = false;
            }, this);
        },
        showCommands : function () {
        },
        toggleCommand: function (commandId, isSelected) {
            this.mock$commandToToggleStateBinding[commandId] = isSelected;
        }
    };

    var json = {
        Account: {
            all: [
                {
                    objectId: "account",
                    mailScenarioState: P.ScenarioState.connected,
                }
            ]
        },
        Folder: {
            all: [
                {
                    accountId: "account",
                    objectId: "inboxFolder",
                    folderName: "Inbox",
                    folderType: P.FolderType.mail,
                    specialMailFolderType: P.MailFolderType.inbox
                }, {
                    accountId: "account",
                    objectId: "deletedFolder",
                    folderName: "Deleted",
                    folderType: P.FolderType.mail,
                    specialMailFolderType: P.MailFolderType.deletedItems
                }, {
                    accountId: "account",
                    objectId: "draftFolder",
                    folderName: "Drafts",
                    folderType: P.FolderType.mail,
                    specialMailFolderType: P.MailFolderType.drafts
                }, {
                    accountId: "account",
                    objectId: "sentFolder",
                    folderName: "Sent",
                    folderType: P.FolderType.mail,
                    specialMailFolderType: P.MailFolderType.sentItems
                }, {
                    accountId: "account",
                    objectId: "outboxFolder",
                    folderName: "Outbox",
                    folderType: P.FolderType.mail,
                    specialMailFolderType: P.MailFolderType.outbox
                }, {
                    accountId: "account",
                    objectId: "junkFolder",
                    folderName: "Junk",
                    folderType: P.FolderType.mail,
                    specialMailFolderType: P.MailFolderType.junkMail
                }
            ]
        },
        MailView: {
            all: [
                {
                    accountId: "account",
                    objectId: "inboxView",
                    mock$sourceObjectId: "inboxFolder",
                    type: P.MailViewType.inbox
                }, {
                    accountId: "account",
                    objectId: "deletedView",
                    mock$sourceObjectId: "deletedFolder",
                    type: P.MailViewType.deletedItems
                }, {
                    accountId: "account",
                    objectId: "draftView",
                    mock$sourceObjectId: "draftFolder",
                    type: P.MailViewType.draft
                }, {
                    accountId: "account",
                    objectId: "sentView",
                    mock$sourceObjectId: "sentFolder",
                    type: P.MailViewType.sentItems
                }, {
                    accountId: "account",
                    objectId: "outboxView",
                    mock$sourceObjectId: "outboxFolder",
                    type: P.MailViewType.outbox
                }, {
                    accountId: "account",
                    objectId: "junkView",
                    mock$sourceObjectId: "junkFolder",
                    type: P.MailViewType.junkMail
                }
            ]
        },
        MailMessage: {
            all: [
                {
                    objectId: "message1",
                    displayViewIds: ["inboxView"],
                    from: "foo@example.com",
                    subject: "Stuff",
                    to: "bar@example.com",
                    read: false
                }, {
                    objectId: "message2",
                    displayViewIds: ["inboxView"],
                    from: "asdf@example.com",
                    subject: "Moar",
                    to: "qwer@example.com",
                    read: false
                }, {
                    objectId: "draft1",
                    displayViewIds: ["draftView"],
                    read: true
                }, {
                    objectId: "draft2",
                    displayViewIds: ["draftView"],
                    read: true
                }, {
                    objectId: "outboxMsg",
                    displayViewIds: ["outboxView"],
                    read: true
                }, {
                    objectId: "junkMsg",
                    displayViewIds: ["junkView"],
                    read: true
                }, {
                    objectId: "deletedMsg",
                    displayViewIds: ["deletedView"],
                    read: true
                }, {
                    objectId: "irmMsg",
                    displayViewIds: ["inboxView"],
                    read: false,
                    irmCanForward: false,
                    irmCanReply: true,
                    irmCanReplyAll: true
                }, {
                    objectId: "searchMsg",
                    displayViewIds: ["inboxView"],
                    read: false,
                    canMarkRead: false,
                    canMove: false,
                    canFlag: false
                }
            ]
        }
    };

    var platform, provider, selection, account;

    function setup(tc) {
        var preserve = new Jm.Preserve(),
            controls = ["idCompApp"];
        tc.cleanup = function () {
            preserve.restore();
            Mail.UnitTest.restoreJx();
            Mail.UnitTest.removeElements(controls);
        };

        Mail.UnitTest.addElements(tc, controls);
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");

        preserve.preserve(Mail.Globals, "platform");
        provider = new D.JsonProvider(json, D.MethodHandlers);
        Mail.Globals.platform = platform = provider.getClient();

        preserve.preserve(Mail.Globals, "appState");
        var container = Jx.appData.localSettings().container("MailUT");
        Mail.Globals.appState = new Mail.AppState(platform, {}, new Mail.Account(provider.getObjectById("account"), platform), container);

        preserve.preserve(Mail.Globals, "splashScreen");
        Mail.Globals.splashScreen = { addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        preserve.preserve(Mail.Globals, "animator");
        Mail.Globals.animator = { animateNavigateBack: Jx.fnEmpty };

        selection = new Mail.Selection(Mail.Globals.platform, Mail.Globals.appState);
        account = selection.account;
        selection.updateNav(account, account.inboxView);

        preserve.preserve(Mail.Utilities.ConnectivityMonitor, "hasNoInternetConnection");
        Mail.Utilities.ConnectivityMonitor.hasNoInternetConnection = function () { return false; };

        preserve.preserve(Mail, "guiState");
        Mail.guiState = {
            addListener : function () {},
            removeListener : function () {},
            navigateBackward: function () {},
            navigateForward: function () {},
        };
        Object.defineProperty(Mail.guiState, "isNavPaneVisible", { get: function () { return this.isThreePane || this.isNavPaneActive; }, enumerable: true });
        Object.defineProperty(Mail.guiState, "isMessageListVisible", { get: function () { return this.isThreePane || this.isMessageListActive; }, enumerable: true });
        Object.defineProperty(Mail.guiState, "isReadingPaneVisible", { get: function () { return this.isThreePane || this.isReadingPaneActive; }, enumerable: true });

        preserve.preserve(Mail.Globals, "commandManager");
        Mail.UnitTest.ensureSynchronous(function () {
            Mail.Globals.commandManager = new Mail.Commands.Manager(new Mail.MockGlomManager(), selection);
        });

        preserve.preserve(Jx, "glomManager");
        Jx.glomManager = {
            getIsParent: function () { return true; },
            isGlomOpen: function () { return true; }
        };
    }

    function runEnableTestCase(tc, comment, commandHost, isOnePane, expectedVisibility) {
        Mail.UnitTest.ensureSynchronous(function () {
            Mail.guiState.isOnePane = isOnePane;
            Mail.guiState.isThreePane = !isOnePane;
            Mail.Globals.commandManager._onLayoutChanged();
        });

        for (var commandId in expectedVisibility) {
            tc.areEqual(commandHost.mock$commandToVisibilityBinding[commandId], expectedVisibility[commandId], "The expected visibility of command [" + commandId + "] is wrong");
        }
    }

    Tx.test("CommandManager.CommandsEnabling", { owner: "jamima" }, function (tc) {
        setup(tc);

        // Create the command Host
        var mockCommandHost = new MockCommandHost(tc, "mockCommandHost",
            ["compose", "move", "toggleUnread", "markUnread", "markRead", "edit", "deleteMessage", "respond", "forward", "reply", "replyAll", "toggleFlag"]);

        var account = new Mail.Account(provider.getObjectById("account"), provider.getClient()),
            message1 = new Mail.UIDataModel.MailMessage(provider.getObjectById("message1"), account),
            message2 = new Mail.UIDataModel.MailMessage(provider.getObjectById("message2"), account),
            draft1 = new Mail.UIDataModel.MailMessage(provider.getObjectById("draft1"), account);

        // Register the command Host
        Mail.Globals.commandManager.registerCommandHost(mockCommandHost);

        //  Test case : Empty Inbox
        runEnableTestCase(tc, "Test inbox with empty selection", mockCommandHost, false,
            {"compose" : true, "move" : false, "toggleUnread" : false, "markUnread" : false, "markRead" : false, "edit" : false, "deleteMessage" : false, "respond" : false});

        // Test case : Inbox with unread message
        selection.updateMessages(message1, -1, [message1]);
        runEnableTestCase(tc, "Inbox with unread message", mockCommandHost, false,
            {"compose" : true, "move" : true, "toggleUnread" : true, "markUnread" : false, "markRead" : true, "edit" : false, "deleteMessage" : true, "respond" : true});

        // Test case : Inbox with unread message (multiSelect)
        selection.updateMessages(message1, -1, [message1, message2]);
        runEnableTestCase(tc, " Inbox with unread message (multiSelect)", mockCommandHost, false,
            {"compose" : true, "move" : true, "toggleUnread" : true, "markUnread" : false, "markRead" : true, "edit" : false, "deleteMessage" : true, "respond" : false});

        // Test case : Inbox with read message
        message1.platformMailMessage.mock$setProperty("read", true);
        selection.updateMessages(message1, -1, [message1]);
        runEnableTestCase(tc, "Inbox with read message", mockCommandHost, false,
            {"compose" : true, "move" : true, "toggleUnread" : true, "markUnread" : true, "markRead" : false, "edit" : false, "deleteMessage" : true, "respond" : true});

        // Test case : Inbox with read message (multi-select)
        message2.platformMailMessage.mock$setProperty("read", true);
        selection.updateMessages(message1, -1, [message1, message2]);
        runEnableTestCase(tc, " Inbox with unread message (multiSelect)", mockCommandHost, false,
            {"compose" : true, "move" : true, "toggleUnread" : true, "markUnread" : true, "markRead" : false, "edit" : false, "deleteMessage" : true, "respond" : false});

        message2.platformMailMessage.mock$setProperty("read", false);
        runEnableTestCase(tc, "Inbox with both read and unread message (multi-select)", mockCommandHost, false,
            {"compose" : true, "move" : true, "toggleUnread" : true, "markUnread" : false, "markRead" : true, "edit" : false, "deleteMessage" : true, "respond" : false});

        // Test Case : Drafts (single Select)
        selection.updateNav(account, account.draftsView);
        selection.updateMessages(draft1, -1, [draft1]);
        runEnableTestCase(tc, "Drafts (single Select)", mockCommandHost, false,
            {"compose" : true, "move" : false, "toggleUnread" : true, "markUnread" : true, "markRead" : false, "edit" : true, "deleteMessage" : true, "respond" : false});

        // Test Case : Inbox Drafts (single Select)
        selection.updateNav(account, account.inboxView);
        selection.updateMessages(draft1, -1, [draft1]);
        runEnableTestCase(tc, "Drafts (single Select)", mockCommandHost, false,
            { "compose": true, "move": true, "toggleUnread": true, "markUnread": true, "markRead" : false, "edit": true, "deleteMessage": true, "respond": false });

        // Test Case : Inbox Drafts Multi-select
        selection.updateMessages(draft1, -1, [draft1, message1]);
        runEnableTestCase(tc, "Drafts (Multi Select)", mockCommandHost, false,
            {"compose" : true, "move" : true, "toggleUnread" : true, "markUnread" : true, "markRead" : false, "edit" : false, "deleteMessage" : true, "respond" : false});

        // Test Case : Outbox (single select)
        var outboxMsg = new Mail.UIDataModel.MailMessage(provider.getObjectById("outboxMsg"), account);
        selection.updateNav(account, account.outboxView);
        selection.updateMessages(outboxMsg, -1, [outboxMsg]);
        runEnableTestCase(tc, "Outbox (single Select)", mockCommandHost, false,
            { "compose": true, "move": false, "toggleUnread": false, "markUnread": false, "markRead" : false, "edit": true, "deleteMessage": true, "respond": false});

        // Test Case : Deleted Items (single select)
        var deletedMsg = new Mail.UIDataModel.MailMessage(provider.getObjectById("deletedMsg"), account);
        selection.updateNav(account, account.deletedView);
        selection.updateMessages(deletedMsg, -1, [deletedMsg]);
        runEnableTestCase(tc, "Deleted Items (single Select)", mockCommandHost, false,
            { "compose": true, "move": true, "toggleUnread": true, "markUnread": true, "markRead" : false, "edit": false, "deleteMessage": true, "respond": true});

        // Test Case : Junk (single select)
        var junkMsg = new Mail.UIDataModel.MailMessage(provider.getObjectById("junkMsg"), account);
        selection.updateNav(account, account.junkView);
        selection.updateMessages(junkMsg, -1, [junkMsg]);
        runEnableTestCase(tc, "Junk (single Select)", mockCommandHost, false,
            { "compose": true, "move": true, "toggleUnread": true, "markUnread": true, "markRead" : false, "edit": false, "deleteMessage": true, "respond": false });

        //  Test case : irmCanForward is false
        var irmMsg = new Mail.UIDataModel.MailMessage(provider.getObjectById("irmMsg"), account);
        selection.updateNav(account, account.inboxView);
        selection.updateMessages(irmMsg, -1, [irmMsg]);
        runEnableTestCase(tc, "Test message with forward disabled by irm", mockCommandHost, false,
            { "respond": true, "forward": false, "reply": true, "replyAll": true });

        //  Test case : irmCanReply is false
        irmMsg.platformMailMessage.mock$setProperty("irmCanForward", true);
        irmMsg.platformMailMessage.mock$setProperty("irmCanReply", false);
        runEnableTestCase(tc, "Test message with reply disabled by irm", mockCommandHost, false,
            { "respond": true, "forward": true, "reply": false, "replyAll": true });

        //  Test case : irmCanReplyAll is false
        irmMsg.platformMailMessage.mock$setProperty("irmCanReply", true);
        irmMsg.platformMailMessage.mock$setProperty("irmCanReplyAll", false);
        runEnableTestCase(tc, "Test message with replyAll disabled by irm", mockCommandHost, false,
            { "respond": true, "forward": true, "reply": true, "replyAll": false });

        //  Test case : irm forward, reply, and replyAll are false
        irmMsg.platformMailMessage.mock$setProperty("irmCanForward", false);
        irmMsg.platformMailMessage.mock$setProperty("irmCanReply", false);
        runEnableTestCase(tc, "Test message with respond disabled by irm", mockCommandHost, false,
            { "respond": false, "forward": false, "reply": false, "replyAll": false });

        //  Test case : Message from server-side search that does not support delete/markRead and flag
        var searchMsg = new Mail.UIDataModel.MailMessage(provider.getObjectById("searchMsg"), account);
        selection.updateMessages(searchMsg, -1, [searchMsg]);
        runEnableTestCase(tc, "Test message from server-side search that does not support read/flag/move", mockCommandHost, false,
            {"move" : false, "toggleUnread" : false, "markUnread" : false, "deleteMessage" : false, "respond" : true, "toggleFlag" : false});
    });

    Tx.test("CommandManager.ContextBasedNotifications_readStatus", { owner: "jamima" }, function (tc) {
        setup(tc);
        /// Create the command Host
        var commands = Mail.Globals.commandManager._getFactory().commands,
            isEnabledFn = function (selection) {
                this.mock$numEnabledCalled++;
                this.isEnabledOrig(selection);
            };
        for (var commandId in commands) {
            var command = commands[commandId];
            command.mock$numEnabledCalled = 0;
            command.isEnabledOrig = command.isEnabled;
            command.isEnabled = isEnabledFn;
        }
        var mockCommandHost = new MockCommandHost(tc, "mockCommandHost", ["compose", "move", "toggleUnread", "markUnread", "markUnread", "edit", "deleteMessage", "respond", "toggleFlag"]);

        /// Register the command Host
        Mail.Globals.commandManager.registerCommandHost(mockCommandHost);

        var countBefore = {};
        var countAfter  = {};

        /// Take a snapshot of the count now
        commands = Mail.Globals.commandManager._getFactory().commands;
        for (commandId in commands) {
            countBefore[commandId] = commands[commandId].mock$numEnabledCalled;
        }

        /// Update the readStatus context, verify only the commands that cares about read status are notified
        Mail.UnitTest.ensureSynchronous(function () {
            Mail.Globals.commandManager._onMessageChanged(["read"]);
        });

        for (commandId in commands) {
            countAfter[commandId] = commands[commandId].mock$numEnabledCalled;
        }

        var commandsUnchanged = ["compose", "move", "edit", "deleteMessage", "respond", "toggleFlag", "markRead"];
        var commandsChanged = ["toggleUnread", "markUnread"];

        commandsUnchanged.forEach(function(contextId) {
            tc.isTrue(countAfter[contextId] === countBefore[contextId], "Is enabled should not be called for the command " + contextId);
        });

        commandsChanged.forEach(function(contextId) {
            tc.isTrue(countAfter[contextId] > countBefore[contextId], "Is enabled should be called for the command " + contextId);
        });
    });

    Tx.test("CommandManager.ContextBasedNotifications_flagStatus", { owner: "jamima" }, function (tc) {
        setup(tc);
        /// Create the command Host
        var commands = Mail.Globals.commandManager._getFactory().commands,
            isEnabledFn = function (selection) {
                this.mock$numEnabledCalled++;
                this.isEnabledOrig(selection);
            };
        for (var commandId in commands) {
            var command = commands[commandId];
            command.mock$numEnabledCalled = 0;
            command.isEnabledOrig = command.isEnabled;
            command.isEnabled = isEnabledFn;
        }
        var mockCommandHost = new MockCommandHost(tc, "mockCommandHost", ["compose", "move", "toggleUnread", "markUnread", "markRead", "edit", "deleteMessage", "respond", "toggleFlag"]);

        /// Register the command Host
        Mail.UnitTest.ensureSynchronous(function () {
            Mail.Globals.commandManager.registerCommandHost(mockCommandHost);
        });

        var countBefore = {};
        var countAfter  = {};

        /// Take a snapshot of the count now
        commands = Mail.Globals.commandManager._getFactory().commands;
        for (commandId in commands) {
            countBefore[commandId] = commands[commandId].mock$numEnabledCalled;
        }

        /// Update the readStatus  context, verify only the commands that cares about read status are notified
        Mail.UnitTest.ensureSynchronous(function () {
            Mail.Globals.commandManager._onMessageChanged(["flagged"]);
        });

        for (commandId in commands) {
            countAfter[commandId] = commands[commandId].mock$numEnabledCalled;
        }

        var commandsUnchanged = ["compose", "move", "edit", "deleteMessage", "respond", "toggleUnread", "markUnread", "markRead"];
        var commandsChanged = ["toggleFlag"];

        commandsUnchanged.forEach(function(contextId) {
            tc.isTrue(countAfter[contextId] === countBefore[contextId], "Is enabled should not be called for the command " + contextId);
        });

        commandsChanged.forEach(function(contextId) {
            tc.isTrue(countAfter[contextId] > countBefore[contextId], "Is enabled should be called for the command " + contextId);
        });
    });

    Tx.test("CommandManager.AddContext_events", { owner: "jamima" }, function (tc) {
        setup(tc);
        var callbackCalls = 0,
            callback = function () {
                callbackCalls++;
            };
        Mail.Globals.commandManager.addListener(Mail.Commands.Events.onAddContext, callback);
        Mail.Globals.commandManager.addListener(Mail.Commands.Events.onRemoveContext, callback);
        Mail.Globals.commandManager.addContext("testContext", Jx.fnEmpty);
        Mail.Globals.commandManager.removeContext("testContext");
        tc.areEqual(2, callbackCalls, "Incorrect number of events on context");
    });


})();
