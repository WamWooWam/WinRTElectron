
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Microsoft, Mocks, Tx, Windows */
/*jshint browser:true*/

(function () {
    /// Set this value to a very high number to effectivly disable async timeout for debugging.
    var asyncDebugOverride = 0,
        appHTMLContent = "",
        childHTMLContent = "",
        appFile = null,
        childFile = null,
        OKMissingFiles = [
            "/MessageBar/messagebar/src/accountmbpresenter.js",
            "/MessageBar/messagebar/src/authmbpresenter.js",
            "/MessageBar/messagebar/src/ensurelockscreen.js",
            "/MessageBar/messagebar/src/messagebar.js",
            "/MessageBar/messagebar/src/messagebar.tmpl.js",
            "/MessageBar/messagebar/src/ProxyAuthenticator.js",
            "/MessageBar/messagebar/src/syncmbflyout.js",
            "/MessageBar/messagebar/src/syncmbpresenter.js",
            "/ModernMail/App/App.js",
            "/ModernMail/App/AppState.js",
            "/ModernMail/App/RestartCheck.js",
            "/ModernMail/App/RetailExperience.js",
            "/ModernMail/App/SplashScreen.js",
            "/ModernMail/App/StartupHelper.js",
            "/ModernMail/App/MailWorker.js",
            "/ModernMail/components/AccountList/AccountList.js",
            "/ModernMail/components/AccountList/AccountListItem.js",
            "/ModernMail/components/AccountList/AccountNameHeader.js",
            "/ModernMail/components/AccountList/AccountSettings.js",
            "/ModernMail/components/AccountList/AccountSwitcherAggregator.js",
            "/ModernMail/components/AccountList/AccountSwitcherFlyout.js",
            "/ModernMail/components/AccountList/OofIndicatorSwitcher.js",
            "/ModernMail/components/AccountList/SelectedAccountOofPresenter.js",
            "/ModernMail/components/AccountUpsell/MailPhase1Upsell.js",
            "/ModernMail/components/AccountUpsell/UpsellFrame.js",
            "/ModernMail/components/CommandBar/CommandFactory.js",
            "/ModernMail/components/CommandBar/FolderOperations.js",
            "/ModernMail/components/CommandBar/MoveAllDialog.js",
            "/ModernMail/components/CommandBar/MoveConfirmDialog.js",
            "/ModernMail/components/FolderList/FolderListDataSource.js",
            "/ModernMail/components/FolderList/TreeFlattener.js",
            "/ModernMail/components/Frame/AccountSyncStatus.js",
            "/ModernMail/components/Frame/GUIState.js",
            "/ModernMail/components/Frame/ResizePerfReport.js",
            "/ModernMail/components/Frame/Animations.js",
            "/ModernMail/components/Frame/DragDrop.js",
            "/ModernMail/components/Frame/Frame.js",
            "/ModernMail/components/Frame/GenericQueueHandler.js",
            "/ModernMail/components/Frame/OutboxMonitor.js",
            "/ModernMail/components/Frame/OutboxQueueHandlerBase.js",
            "/ModernMail/components/Frame/RulesMessageBarPresenter.js",
            "/ModernMail/components/Frame/SuspendResumeHelper.js",
            "/ModernMail/components/Frame/SyncMessageBarHelper.js",
            "/ModernMail/components/Frame/WelcomeMessage.js",
            "/ModernMail/components/GlomManager/ParentMailGlomManager.js",
            "/ModernMail/components/MessageList/AccessibilityHelper.js",
            "/ModernMail/components/MessageList/CollectionHelper.js",
            "/ModernMail/components/MessageList/ConversationNode.js",
            "/ModernMail/components/MessageList/ConversationSelection.js",
            "/ModernMail/components/MessageList/DisplayedItem.js",
            "/ModernMail/components/MessageList/DisplayedItemManager.js",
            "/ModernMail/components/MessageList/DisplayedItemRetriever.js",
            "/ModernMail/components/MessageList/EndOfListItem.js",
            "/ModernMail/components/MessageList/FilteredSelection.js",
            "/ModernMail/components/MessageList/FolderNameHeader.js",
            "/ModernMail/components/MessageList/ListViewVDSMonitor.js",
            "/ModernMail/components/MessageList/MailHeaderRenderer.js",
            "/ModernMail/components/MessageList/MessageList.js",
            "/ModernMail/components/MessageList/MessageListCollection.js",
            "/ModernMail/components/MessageList/MessageListDataProvider.js",
            "/ModernMail/components/MessageList/MessageListDataSource.js",
            "/ModernMail/components/MessageList/MessageListEmptyTextControl.js",
            "/ModernMail/components/MessageList/MessageListFilter.js",
            "/ModernMail/components/MessageList/MessageListItem.js",
            "/ModernMail/components/MessageList/MessageListItemAria.js",
            "/ModernMail/components/MessageList/MessageListItemFactory.js",
            "/ModernMail/components/MessageList/MessageListNotificationHandler.js",
            "/ModernMail/components/MessageList/MessageListProgressRing.js",
            "/ModernMail/components/MessageList/MessageListTreeNode.js",
            "/ModernMail/components/MessageList/OnItemCommandControl.js",
            "/ModernMail/components/MessageList/SearchAccessibility.js",
            "/ModernMail/components/MessageList/SearchCollection.js",
            "/ModernMail/components/MessageList/SearchEndOfListItem.js",
            "/ModernMail/components/MessageList/SearchHandler.js",
            "/ModernMail/components/MessageList/SearchHeader.js",
            "/ModernMail/components/MessageList/SearchResultsFetcher.js",
            "/ModernMail/components/MessageList/SearchScopeSwitcher.js",
            "/ModernMail/components/MessageList/SelectAllCheckbox.js",
            "/ModernMail/components/MessageList/SelectionAggregator.js",
            "/ModernMail/components/MessageList/SelectionController.js",
            "/ModernMail/components/MessageList/SelectionHandler.js",
            "/ModernMail/components/MessageList/SelectionHelper.js",
            "/ModernMail/components/MessageList/SelectionModel.js",
            "/ModernMail/components/MessageList/ThreadedListCollection.js",
            "/ModernMail/components/MessageList/TrailingItemCollection.js",
            "/ModernMail/components/MessageList/TypeToSearch.js",
            "/ModernMail/components/MessageList/UnseenMonitor.js",
            "/ModernMail/components/MessageList/ViewCustomizations.js",
            "/ModernMail/components/MessageList/ViewIntro.js",
            "/ModernMail/components/NavPane/NavPane.js",
            "/ModernMail/components/NavPane/NavPaneFlyout.js",
            "/ModernMail/components/ViewSwitcher/AccountViews.js",
            "/ModernMail/components/ViewSwitcher/BoundElements.js",
            "/ModernMail/components/ViewSwitcher/FolderFlyout.js",
            "/ModernMail/components/ViewSwitcher/PeopleFlyout.js",
            "/ModernMail/components/ViewSwitcher/ViewFilters.js",
            "/ModernMail/components/ViewSwitcher/ViewFlyout.js",
            "/ModernMail/components/ViewSwitcher/ViewItems.js",
            "/ModernMail/components/ViewSwitcher/ViewSwitcher.js",
            "/ModernMail/UIDataModel/AllPinnedViewSyncMonitor.js",
            "/ModernMail/UIDataModel/FolderViewSyncMonitor.js",
            "/ModernMail/UIDataModel/ViewSyncMonitor.js",
            "/ModernMail/util/AriaFlows.js",
            "/ModernMail/util/Flyout.js",
            "/ModernMail/util/ConnectivityHelper.js",
            "/ModernMail/util/ListViewHelper.js",
            "/ModernMail/Worker/WorkerOwner.js",
            "/ModernPeople/AddressBook/Controls/Collections/CappedPlatformCollection.js",
            "/ModernPeople/shared/Accounts/Phase1Upsell.js",
            "/ModernPeople/shared/Accounts/UpsellSettings.js",
            "/ModernPeople/Shared/Navigation/Protocols.js",
            "/ModernPeople/Social/Social.Utilities.js",
            "/ModernPeople/Social/Social.Imports.js",
            "/ModernPeople/Social/Social.Core.js",
            "/ModernPeople/Social/Social.Platform.js",
            "/ModernPeople/Social/Social.Providers.js",
            "/ModernMail/components/CommandBar/SweepFlyout.js",
            "/ModernMail/components/CommandBar/SweepRules.js",
            "/ModernMail/App/Activation.js",
            "/ModernMail/components/CommandBar/MoveFlyout.js"
        ];

    var oldInitMethod = null,
        oldAppState = null,
        provider = null;
    function setup(tc) {
        oldInitMethod = Jx.initGlomManager;
        Jx.initGlomManager = Jx.fnEmpty;
        Jx.glomManager = new Mail.MockJxGlomManager();
        oldAppState = Mail.Globals.appstate;
        Mail.Globals.appState = { addRestartCheck: Jx.fnEmpty };
        provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});

        tc.cleanup = function () {
            Jx.initGlomManager = oldInitMethod;
            Jx.glomManager = null;
            Mail.Globals.appState = oldAppState;
            oldAppState = null;
            provider = null;
        };
    }

    Tx.asyncTest("MultiWindow_UnitTest.ChildHTMLCheck", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 500), owner: "joshuala", priority: 0 }, function (tc) {
        tc.stop();
        setup(tc);
        var OKMissingFilesDup = OKMissingFiles.slice(0);

        var pkgRoot = Windows.ApplicationModel.Package.current.installedLocation;
        pkgRoot.createFileAsync("ModernMail\\App\\App.html", Windows.Storage.CreationCollisionOption.openIfExists).then(function (file) {
            appFile = file;
            return pkgRoot.createFileAsync("ModernMail\\ChildApp\\ChildApp.html", Windows.Storage.CreationCollisionOption.openIfExists);
        }).then(function (file) {
            childFile = file;
            return Windows.Storage.FileIO.readTextAsync(appFile);
        }).then(function (fileContent) {
            appHTMLContent = fileContent;
            return Windows.Storage.FileIO.readTextAsync(childFile);
        }).done(function (fileContent) {
            childHTMLContent = fileContent;
            // This reg expression is intending to match a
            // [Quote] followed by a single [forward slash] followed by a [letter] followed by any number of ([forward Slash] or [letter] or [number] or [period]) ending in [.js]
            // This is to partly avoid external file references which start with two forward slashs
            var fileNameExp = new RegExp(/\"\/[a-z][\/a-z0-9\.]*\.js/ig);
            var foundString = null;
            var foundOne = false; // Verify RegExp works
            var asyncFunc = function (fileName, error) {
                tc.isTrue(false, (error ? error : "") + " File " + fileName + " in app.html but is missing from package");
            };
            do {
                foundString = fileNameExp.exec(appHTMLContent);
                if (foundString) {
                    foundOne = true;
                    foundString = foundString[0].substr(1);
                    var openFileString = foundString.substr(1).replace(/\//g, "\\");
                    pkgRoot.getFileAsync(openFileString).done(
                         /*Promise Complete*/Jx.fnEmpty,
                         /*Promise Error*/asyncFunc.bind(null, openFileString + "") // Bind to a copy of the foundString.
                    );
                    if (childHTMLContent.indexOf(foundString) < 0) {
                        var missingIndex = OKMissingFilesDup.indexOf(foundString);
                        if (missingIndex >= 0) {
                            OKMissingFilesDup.splice(missingIndex, 1);
                        }
                        tc.isTrue(missingIndex >= 0, "childApp.html missing " + foundString);
                    }
                    appHTMLContent = appHTMLContent.substr(foundString + 1);
                }
            } while (foundString);
            for (var i = 0; i < OKMissingFilesDup.length; ++i) {
                tc.isTrue(false, "File OK to be missing, but wasn't missing : " + OKMissingFilesDup[i]);
            }
            tc.isTrue(foundOne);
            tc.start();
        },
        function (error) {
            tc.isTrue(false, "Error reading from App.html" + error);
        });
    });

    Mail.MockJxGlomManager = function (isParent) {
        this._isParent = isParent;
    };
    Mail.MockJxGlomManager.prototype = {
        dispose: Jx.fnEmpty,
        getGlomId: Jx.fnEmpty,
        isGlomOpen: function () {},
        messageOpenInAnotherWindow: function () { return true; },
        enableGlomCache: function () {},
        createGlom: function () {},
        showGlom: function () {},
        createOrShowGlom: function () {},
        getIsChild: function () { return !this._isParent; },
        getIsParent: function () { return this._isParent; },
        connectToGlom: Jx.fnEmpty,
        addListener: Jx.fnEmpty,
        removeListener: Jx.fnEmpty,
        mockedType: Jx.ParentGlomManager,
        getParentGlom: function () {
            return {
                addEventListener: Jx.fnEmpty,
                removeEventListener: Jx.fnEmpty
            };
        }
    };

    Tx.test("MultiWindow_UnitTest.ParentMailGlomManager", { owner: "joshuala", priority: 0 }, function (tc) {
        setup(tc);
        var parentGlomManager = new Mail.GlomManager({mockedType: Mail.Selection}, {mockedType: Mail.GUIState});
        var now = Date.now();
        tc.isTrue(Mail.youngestWindow([{openTime:now - Mail.Utilities.msInOneDay/2}, {openTime:now - Mail.Utilities.msInOneDay * 1.5}, {openTime:now - Mail.Utilities.msInOneDay*3}]) < 1, "Mail.YoungestWindow T1");
        tc.isTrue(Mail.youngestWindow([{openTime:now - Mail.Utilities.msInOneDay*1.1}, {openTime:now - Mail.Utilities.msInOneDay * 1.5}, {openTime:now - Mail.Utilities.msInOneDay*3}]) > 1, "Mail.YoungestWindow T2");
        tc.isTrue(parentGlomManager._canRestart(), "_canRestart no Gloms");
        var glomEvent = {
            glom: {
                getGlomId: function () { return "123"; },
                mockedType: Jx.Glom,
                addListener: Jx.fnEmpty,
                removeListener: Jx.fnEmpty,
                postMessage: Jx.fnEmpty
            }
        };
        parentGlomManager._handleNewChild(glomEvent);
        tc.isFalse(parentGlomManager._canRestart(), "_canRestart new Glom");
        parentGlomManager._handleChildClosed(glomEvent);
        tc.isTrue(parentGlomManager._canRestart(), "_canRestart closed Glom");

        var oldGuiState = parentGlomManager._guiState,
            ensureCalled = false,
            handleVisCalled = false;

        parentGlomManager._guiState = {
            ensureNavMessageList: function () { ensureCalled = true;},
            handleGlomVisible: function () { handleVisCalled = true;},
        };

        parentGlomManager._handleShowMessageList();
        tc.isTrue(ensureCalled);
        parentGlomManager._handleChildGlomVisible();
        tc.isTrue(handleVisCalled);

        var oldSelection = parentGlomManager._selection,
            oldInst = Mail.Instrumentation.instrumentMailCommand,
            oldOpen = parentGlomManager._glomUtil.openChildMailWindow,
            instrumented = false,
            openedChild = false;

        Mail.Instrumentation.instrumentMailCommand = function () { instrumented = true;};
        parentGlomManager._glomUtil.openChildMailWindow = function () { openedChild = true;};

        parentGlomManager._selection = {message:{isDraft:true}};
        parentGlomManager.handleCommandBarNewChild();
        tc.isTrue(instrumented);
        tc.isTrue(openedChild);

        parentGlomManager._selection = oldSelection;
        Mail.Instrumentation.instrumentMailCommand = oldInst;
        parentGlomManager._glomUtil.openChildMailWindow = oldOpen;
        parentGlomManager._guiState = oldGuiState;

        tc.isTrue(Jx.isNullOrUndefined(parentGlomManager._openGloms["123"]));
        parentGlomManager.addKeepAlive({ objectId: "123" });
        tc.isFalse(Jx.isNullOrUndefined(parentGlomManager._openGloms["123"]));
        delete parentGlomManager._openGloms["123"];

        tc.isFalse(Mail.GlomManager.isChild());
        tc.isTrue(Mail.GlomManager.isParent());

        parentGlomManager.dispose();
    });

    Tx.test("MultiWindow_UnitTest.ChildMailGlomManager_updateTitle", { owner: "joshuala", priority: 0 }, function (tc) {
        setup(tc);

        Jx.glomManager.mockedType = Jx.ChildGlomManager;
        var childGlomManager = new Mail.ChildMailGlomManager(
            {
                mockedType: Mail.Selection,
                addEventListener: Jx.fnEmpty,
                removeEventListener: Jx.fnEmpty
            },
            null,
            provider.getClient()
        );

        Mail.GlomManager = Mail.ParentGlomManager;
        tc.isTrue(Jx.isObject(Mail.Utilities.ComposeHelper._glomManager));
        var called = false;
        Jx.glomManager.changeGlomTitle = function (title) {
            tc.areEqual(title, "[Draft] Subject");
            called = true;
        };
        childGlomManager.updateWindowTitleWithMessage({ isDraft: true, subject: "Subject", mockedType: Mail.UIDataModel.MailMessage });
        tc.isTrue(called);

        called = false;
        Jx.glomManager.changeGlomTitle = function (title) {
            tc.areEqual(title, "[Draft] No subject");
            called = true;
        };
        childGlomManager.updateWindowTitleWithMessage({ isDraft: true, subject: "", mockedType: Mail.UIDataModel.MailMessage });
        tc.isTrue(called);

        called = false;
        Jx.glomManager.changeGlomTitle = function (title) {
            tc.areEqual(title, "Subject");
            called = true;
        };
        childGlomManager.updateWindowTitleWithMessage({ isDraft: false, subject: "Subject", mockedType: Mail.UIDataModel.MailMessage });
        tc.isTrue(called);

        called = false;
        Jx.glomManager.changeGlomTitle = function (title) {
            tc.areEqual(title, "No subject");
            called = true;
        };
        childGlomManager.updateWindowTitleWithMessage({ isDraft: false, subject: "", mockedType: Mail.UIDataModel.MailMessage });
        tc.isTrue(called);

        childGlomManager.dispose();
    });

    Tx.test("MultiWindow_UnitTest.ChildMailGlomManager_cleanlyClosing", { owner: "joshuala", priority: 0 }, function (tc) {
        setup(tc);

        Jx.glomManager.mockedType = Jx.ChildGlomManager;
        var childGlomManager = new Mail.ChildMailGlomManager(
            {
                mockedType: Mail.Selection,
                addEventListener: Jx.fnEmpty,
                removeEventListener: Jx.fnEmpty
            },
            null,
            provider.getClient()
        );

        Mail.GlomManager = Mail.ParentGlomManager;
        tc.isTrue(Jx.isObject(Mail.Utilities.ComposeHelper._glomManager));

        // All of the following methods should cleanly close the window
        var oldCleanClose = childGlomManager._cleanlyCloseWindow,
            cleanlyClosed = false,
            oldMessage = childGlomManager._message;
        childGlomManager._message = { isDraft:false };
        childGlomManager._cleanlyCloseWindow = function () {cleanlyClosed = true;};
        childGlomManager._debugInitialized = true;

        cleanlyClosed = false;
        childGlomManager.handleHomeButton();
        tc.isTrue(cleanlyClosed);

        cleanlyClosed = false;
        childGlomManager.handleComposeComplete();
        tc.isTrue(cleanlyClosed);

        cleanlyClosed = false;
        childGlomManager._handleMessageDeleted();
        tc.isTrue(cleanlyClosed);

        cleanlyClosed = false;
        childGlomManager._currentDisplayIds = ["123"];
        childGlomManager._currentDisplayIds.getAt = function () { 
            return "123";
        };
        var changeEvent = ["displayViewIds"];
        changeEvent.target = {
            displayViewIds: {
                indexOf: function () { return { returnValue: false }; }
            }
        };
        childGlomManager._handleMessageChanged(changeEvent);
        tc.isTrue(cleanlyClosed);
        cleanlyClosed = false;
        
        // if the folderID didn't change, then it shouldn't close
        childGlomManager._handleMessageChanged([]);
        tc.isFalse(cleanlyClosed);

        cleanlyClosed = false;
        var fakePromise = {
            then:function(fn) { fn(); return this; },
            done:function(fn) { fn(); return this; }
            },
            oldPlatform = Mail.Globals.platform,
            oldManagerPlatform = childGlomManager._platform;

        childGlomManager._message = null;
        childGlomManager._updateParentVisible = Jx.fnEmpty;
        childGlomManager._platform = Mail.Globals.platform = {
            mailManager: {
                waitForInstanceNumberOnMessage: function () {
                    return fakePromise;
                },
                loadMessage: function () {
                    return null;
                }
            }
        };

        childGlomManager._handleStartingContext({message:{messageId:"abc", instanceNumber:0}});
        tc.isTrue(cleanlyClosed);

        Mail.Globals.platform = oldPlatform;
        childGlomManager._cleanlyCloseWindow = oldCleanClose;
        childGlomManager._message = oldMessage;
        childGlomManager._platform = oldManagerPlatform;
        childGlomManager.dispose();
    });

    Tx.test("MultiWindow_UnitTest.ChildMailGlomManager_messageSelection", { owner: "joshuala", priority: 0 }, function (tc) {
        setup(tc);

        Jx.glomManager.mockedType = Jx.ChildGlomManager;
        var childGlomManager = new Mail.ChildMailGlomManager(
            {
                mockedType: Mail.Selection,
                addEventListener: Jx.fnEmpty,
                removeEventListener: Jx.fnEmpty
            },
            null,
            provider.getClient()
        );

        Mail.GlomManager = Mail.ParentGlomManager;
        tc.isTrue(Mail.ChildMailGlomManager.isChild());
        tc.isFalse(Mail.ChildMailGlomManager.isParent());
        tc.isFalse(Mail.ChildMailGlomManager.messageOpenInAnotherWindow());

        var oldSelection = childGlomManager._selection,
            clearCalled = false;

        childGlomManager._selection = {clearMessageSelection: function () {clearCalled = true;}};
        childGlomManager._handleReset();
        tc.isTrue(clearCalled);

        var oldMessage = childGlomManager._message,
            removedCount = 0,
            addedCount = 0,
            oldUpdateTitle = childGlomManager._updateGlomTitle,
            titleUpdated = false;

        childGlomManager._updateGlomTitle = function () { titleUpdated = true; };
        childGlomManager._message = { objectId:"123",
            removeListener:function() { removedCount++; }
        };
        childGlomManager._selection = {
            message: {
                objectId:"456",
                addListener:function() { addedCount++; }
            }
        };

        childGlomManager._handleMessageSelected({messageChanged:true});
        tc.areEqual(2, removedCount);
        tc.areEqual(2, addedCount);
        tc.isTrue(titleUpdated);
        tc.areEqual("456", childGlomManager._message.objectId);

        childGlomManager._message = oldMessage;
        childGlomManager._selection = oldSelection;
        childGlomManager._updateGlomTitle = oldUpdateTitle;

        childGlomManager.dispose();
    });

    Tx.test("MultiWindow_UnitTest.GlomManagerUtil", {owner: "joshuala", priority: 0 }, function (tc) {

        var glomManager = {
                getParentVisible :function() { return false; }
            },
            selection = {
                mockedType:Mail.Selection,
                account:{ platformObject:{} }
            },
            glomManagerUtil = new Mail.GlomManagerUtil( glomManager, selection),
            keepAliveCalled = false,
            message = {
                mockedType : Microsoft.WindowsLive.Platform.IMailMessage,
                getKeepAlive: function () {
                    keepAliveCalled = true;
                    return { objectId:"123", dispose:function () {} };
                },
                instanceNumber:1
            },
            oldPlatform = Mail.Globals.platform,
            oldAccountLoad = Mail.Account.load,
            oldScrub = Mail.synchronousScrub,
            oldMailMessage = Mail.UIDataModel.MailMessage,
            oldJxGlomManager = Jx.glomManager,
            oldGetFolder = Mail.UIDataModel.FolderCache.getPlatformFolder,
            loadMessageCalled = false,
            loadAccountCalled = false,
            scrubMessageCalled = false,
            createCalled = false;

        Mail.UIDataModel.FolderCache.getPlatformFolder = function () { return 1; };
        Mail.Account.load = function () {
            loadAccountCalled = true;
            return null;
        };
        Mail.Globals.platform = {
            mailManager: {
                loadMessage:function () {
                    loadMessageCalled = true;
                    return {};
                },
                createMessageFromMimeAsync: function () {
                    return {
                        done: function (fn) {
                            fn(message);
                        }
                    };
                }
            }
        };
        Mail.synchronousScrub = function () {
            scrubMessageCalled = true;
        };
        Mail.UIDataModel.MailMessage = function () {};
        Jx.glomManager = {
            createOrShowGlom: function() {
                createCalled = true;
            }
        };

        glomManagerUtil._onOpenEml( { data:["data"] });

        tc.isTrue(loadMessageCalled);
        tc.isTrue(loadAccountCalled);
        tc.isTrue(scrubMessageCalled);
        tc.isTrue(keepAliveCalled);
        tc.isTrue(createCalled);

        Mail.Globals.platform = oldPlatform;
        Mail.Account.load = oldAccountLoad;
        Mail.synchronousScrub = oldScrub;
        Mail.UIDataModel.MailMessage = oldMailMessage;
        Mail.UIDataModel.FolderCache.getPlatformFolder = oldGetFolder;
        Jx.glomManager = oldJxGlomManager;

        glomManagerUtil.dispose();
    });

    Tx.test("MultiWindow_UnitTest.ChildCommandFactory", { owner: "joshuala", priority: 0 }, function (tc) {
        setup(tc);
        var oldAnim = Mail.Globals.animator;
        Mail.Globals.animator = { animateNavigateBack: Jx.fnEmpty };
        var childCommandFactory = new Mail.Commands.ChildFactory({ handleHomeButton: Jx.fnEmpty, mockedType: Mail.GlomManager });
        Mail.Commands.Factory = Mail.Commands.ParentFactory;
        var childCommands = Object.keys(childCommandFactory.commands),
            baseFactory = new Mail.Commands.BaseFactory(),
            baseCommands = Object.keys(baseFactory.commands),
            parentCommandFactory = new Mail.Commands.Factory({ handleCommandBarNewChild: Jx.fnEmpty, mockedType: Mail.GlomManager }),
            parentCommands = Object.keys(parentCommandFactory.commands);
        // Child factory and parent factory should be super-sets of base factory
        // Child factory should be subset of parent factory
        tc.isTrue(childCommands.length > baseCommands.length);
        tc.isTrue(parentCommands.length > baseCommands.length);
        tc.isTrue(parentCommands.length > childCommands.length);
        Mail.Globals.animator = oldAnim;
    });

})();
