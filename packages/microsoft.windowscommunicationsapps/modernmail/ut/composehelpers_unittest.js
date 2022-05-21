
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Windows,Compose,Jm,FromControl,Debug,Microsoft,ModernCanvas,WinJS*/

(function () {

    var Uri = Windows.Foundation.Uri,
        _preserver,
        _originalAnimator,
        _originalGUIState;

    function setUp(tc) {

        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "bici");
        Mail.UnitTest.initGlobals(tc);
        Mail.UnitTest.setupModernCanvasStubs();

        // Replace Jx.activation with Mock
        var expectedActivationTypes = {
            protocol: true,
            suspending: true,
            resuming: true
        };
        Jx.activation.addListener = function (type) {
            tc.isTrue(expectedActivationTypes[type]);
        };

        var composeBuilder = new Compose.ComposeBuilder();
        _preserver = Jm.preserve(Compose.ComposeBuilder, "instance");
        Compose.ComposeBuilder.instance = function () { return composeBuilder; };

        // Don't actually run "animate in" animation
        _preserver.preserve(Mail.composeBuilder, "_runFullScreenEnterAnimation");
        Mail.composeBuilder._runFullScreenEnterAnimation = function () { return WinJS.Promise.as(); };
        ModernCanvas.Mail = { convertDocumentToDocumentFragment: function () { return ""; } };

        // Some of the components require extra setup that is done for these tests, and have their own tests since they are controls.
        // So mocking out their activateUI and updateUI allows for them to be used without worrying about the logic associated with them

        _preserver.preserve(Compose.BodyComponent.prototype, "composeActivateUI");
        _preserver.preserve(Compose.BodyComponent.prototype, "composeUpdateUI");
        _preserver.preserve(Compose.BodyComponent.prototype, "updateCanvasStylesAsync");
        _preserver.preserve(Compose.From.prototype, "composeActivateUI");
        _preserver.preserve(Compose.From.prototype, "composeUpdateUI");
        _preserver.preserve(Compose.ComposeImpl.prototype, "isDirty");
        _preserver.preserve(Compose.ToCcBcc.prototype, "_updateCcAndBccAriaFlow");

        Compose.BodyComponent.prototype.composeActivateUI = function () { };
        Compose.BodyComponent.prototype.composeUpdateUI = function () { };
        Compose.BodyComponent.prototype.updateCanvasStylesAsync = function () { return WinJS.Promise.as(); };

        Compose.From.prototype.composeActivateUI = function () { };
        Compose.From.prototype.composeUpdateUI = function () { };
        Compose.ComposeImpl.prototype.isDirty = function () { return true; };
        Compose.ToCcBcc.prototype._updateCcAndBccAriaFlow = function () { };

        // Mock out etw log
        _preserver.preserve(Compose, "log");
        Compose.log = Jm.mockFn();

        // Mock out Utilities.ComposeHelper.ensureComposeFiles
        _preserver.preserve(Mail.Utilities.ComposeHelper, "ensureComposeFiles");
        Mail.Utilities.ComposeHelper.ensureComposeFiles = Jm.mockFn();

        // Make sure Compose.platform is defined
        _preserver.preserve(Compose, "platform");
        Compose.platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/ Mail.Globals.platform;

        _preserver.preserve(Mail.Globals, "commandManager");
        Mail.Globals.commandManager = {
            addContext: Jm.mockFn(),
            addListener: Jm.mockFn(),
            removeListener: Jm.mockFn()
        };

        _preserver.preserve(Jx, "glomManager");
        Jx.glomManager = {
            getIsChild: function () { return false; },
            getIsParent: function () { return true; }
        };

        _originalAnimator = Mail.Globals.animator;
        _originalGUIState = Mail.guiState;

        var platform = Mail.Globals.platform,
            account = new Mail.Account(platform.accountManager.defaultAccount, platform);
        Mail.Utilities.ComposeHelper.registerSelection({
            account: account,
            view: account.inboxView,
            updateNav: function () { },
            updateMessages: function () { },
            messages: [],
            addListener: function () { },
            removeListener: function () { }
        });

        Mail.guiState = { isOnePane: false, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        FromControl.buildFromString = function () { };

        // Make sure asserts throw exceptions and fail tests
        _preserver.preserve(Debug, "throwOnAssert");
        Debug.throwOnAssert = true;
    }

    function tearDown() {
        Mail.UnitTest.disposeGlobals();
        // Restore mocked functionality
        Mail.UnitTest.restoreJx();
        _preserver.restore();
        Mail.Globals.animator = _originalAnimator;
        Mail.guiState = _originalGUIState;

        var elements = ["idCompCompose", "mailFrameReadingPaneSection"];
        Mail.UnitTest.removeElements(elements);
    }

    Tx.test("ComposeHelpers.test_launchCompose", { owner: "mholden", priority: 0 }, function (tc) {
        // TODO: This test will sometimes pass even if an exception is thrown inside a promise.
        // The exception will be presented after all the tests have run, but this will still be marked
        // as passing. There is a bug to help propogate promise exceptions in compose, which might
        // be strongly related to this (WinBlue 56317)
        tc.cleanup = tearDown;
        setUp(tc);

        try {
            var elements = ["idCompCompose", "mailFrameReadingPaneSection"];
            Mail.UnitTest.addElements(tc, elements);

            var appShowing = true;
            Mail.Globals.animator = {
                animateExitPage: function () {
                    appShowing = false;
                    return {
                        then: function () { }
                    };
                },
                animateEnterPage: function () {
                    appShowing = true;
                },
                animateNavigateForward: Jx.fnEmpty
            };

            _preserver.preserve(Compose.AutoSaver.prototype, "_onAutoSaveTimer");
            Compose.AutoSaver.prototype._onAutoSaveTimer = function () { };

            var composeImpl = Jm.mock(Compose.Component.prototype);

            var html = "<div>ComposeHelpersTestHTML</div>",
                componentCache = Jm.mock(Compose.ComponentCache.prototype);
            Jm.when(composeImpl).getComponentCache().thenReturn(componentCache);
            Jm.when(componentCache).getComponent("Mail.FullscreenComposeUI").thenReturn({
                getUI: function (ui) {
                    ui.html = html;
                }
            });

            Mail.Utilities.ComposeHelper.ensureComposeFiles = function () { };
            _preserver.preserve(Jx, "root");
            var account = Mail.Globals.platform.accountManager.defaultAccount,
                mailAccount = new Mail.Account(account, Mail.Globals.platform),
                message = new Mail.UIDataModel.MailMessage(Mail.Globals.platform.mailManager.loadMessage("ComposeHelpers.test_launchCompose"), mailAccount),
                selection = { message: message };

            Mail.Globals.appState.setSelectedMessages(message, -1, []);
            Mail.Globals.appState.setSelectedView(new Mail.Account(account, Mail.Globals.platform).inboxView);

            // Verify our initial state
            tc.isTrue(appShowing);
            tc.isFalse(Mail.Utilities.ComposeHelper.isComposeShowing);

            // open compose
            Mail.UnitTest.ensureSynchronous(Mail.Utilities.ComposeHelper.onReplyButton, null, [selection, Mail.Instrumentation.UIEntryPoint.appBar]);

            // Verify compose element was properly set
            var composeRootElement = document.getElementById("idCompCompose");
            tc.isTrue(Jx.isHTMLElement(composeRootElement));

            // Since compose was loaded, it should have added to the root element so the html should no longer be equal
            tc.areNotEqual(html, composeRootElement.innerHTML);

            // TODO: verify the correctness of the html

            // verify compose is open
            tc.isTrue(Mail.Utilities.ComposeHelper.isComposeShowing);
            tc.isFalse(composeRootElement.classList.contains("hidden"));
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    function testAction(tc, expectedAction, expectedArgs) {
        var calls = new Mail.UnitTest.CallVerifier(tc);
        calls.expectOnce(Mail.Utilities.ComposeHelper, "launchCompose", [expectedAction, expectedArgs]);

        return calls;
    }

    function getComposeActionMessage() {
        var messageId = "3";
        var message = {
            objectId: messageId,
            mockedType: Mail.UIDataModel.MailMessage,
            platformMailMessage: {
                mockedType: Microsoft.WindowsLive.Platform.MailMessage,
                calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.none,
                objectId: messageId
            },
            recordAction: Jx.fnEmpty
        };
        Mail.Globals.appState.setSelectedMessages(message, -1, []);

        return message;
    }

    function getComposeActionMessageWithAttachment(tc) {
        var message = getComposeActionMessage(tc);

        message.hasAttachments = true;
        message.isJunk = false;
        message.isComposeBodyTruncated = false;
        var embeddedAttachmentCollection = {
            count: 1,
            item: function (index) {
                tc.areEqual(index, 0);
                return {
                    mockedType: Microsoft.WindowsLive.Platform.MailAttachment,
                    syncStatus: Microsoft.WindowsLive.Platform.AttachmentSyncStatus.done
                };
            }
        };
        message.getEmbeddedAttachmentCollection = function () { return embeddedAttachmentCollection; };
        message.getOrdinaryAttachmentCollection = function () { return { count: 0 }; };

        return message;
    }

    // TODO: The expected args for the composeActions tests are incorrect and need to be fixed
    Tx.test("ComposeHelpers.test_composeActions_new", { owner: "andarsov", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp(tc);
        try {
            var calls = testAction(tc, Compose.ComposeAction.createNew, { factorySpec: { accountId: Mail.Globals.appState.selectedAccount.objectId } });
            Mail.Utilities.ComposeHelper.onNewButton(Mail.Instrumentation.UIEntryPoint.appBar);
            calls.verify();
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    Tx.test("ComposeHelpers.test_composeActions_newInvalid", { owner: "mholden", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp(tc);
        try {
            // Setup so that we expect only one call to launchCompose
            var calls = testAction(tc, Compose.ComposeAction.createNew, { factorySpec: { accountId: Mail.Globals.appState.selectedAccount.objectId } }),
                messageModel = Mail.Utilities.ComposeHelper._builder.getCurrent().getMailMessageModel();
            messageModel._cachedValues.sourceVerb = Microsoft.WindowsLive.Platform.MailMessageLastVerb.unknown;

            // Set message to dirty - call to onNewButton should not launchCompose
            Compose.ComposeImpl.prototype.isDirty = function () { return false; };
            Mail.Utilities.ComposeHelper.onNewButton(Mail.Instrumentation.UIEntryPoint.appBar);

            // Set message _isNew property to true - call to onNewButton should not launchCompose
            messageModel._isNew = true;
            Mail.Utilities.ComposeHelper.onNewButton(Mail.Instrumentation.UIEntryPoint.appBar);

            // We expect one call to launchCompose
            // Set message _isNew property to false - call to onNewButton should launchCompose even when message is not dirty
            messageModel._isNew = false;
            Mail.Utilities.ComposeHelper.onNewButton(Mail.Instrumentation.UIEntryPoint.appBar);

            calls.verify();
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    Tx.test("ComposeHelpers.test_composeActions_reply", { owner: "andarsov", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp(tc);
        try {
            var message = getComposeActionMessage(tc),
                selection = { message: message };

            var calls = testAction(tc, Compose.ComposeAction.reply, { originalMessage: undefined });
            Mail.Utilities.ComposeHelper.onReplyButton(selection, Mail.Instrumentation.UIEntryPoint.appBar);
            calls.verify();
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    Tx.test("ComposeHelpers.test_composeActions_reply_withAttachment", { owner: "andarsov", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp(tc);

        try {
            var message = getComposeActionMessageWithAttachment(tc),
                selection = { message: message };

            var calls = testAction(tc, Compose.ComposeAction.reply, { originalMessage: undefined });
            Mail.Utilities.ComposeHelper.onReplyButton(selection, Mail.Instrumentation.UIEntryPoint.appBar);
            calls.verify();
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    Tx.test("ComposeHelpers.test_composeActions_replyall", { owner: "andarsov", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp(tc);
        try {
            var message = getComposeActionMessage(tc),
                selection = { message: message };

            var calls = testAction(tc, Compose.ComposeAction.replyAll, { originalMessage: undefined });
            Mail.Utilities.ComposeHelper.onReplyAllButton(selection, Mail.Instrumentation.UIEntryPoint.appBar);
            calls.verify();
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    Tx.test("ComposeHelpers.test_composeActions_replyall_withAttachment", { owner: "andarsov", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp(tc);
        try {
            var message = getComposeActionMessageWithAttachment(tc),
                selection = { message: message };

            var calls = testAction(tc, Compose.ComposeAction.reply, { originalMessage: undefined });
            Mail.Utilities.ComposeHelper.onReplyButton(selection, Mail.Instrumentation.UIEntryPoint.appBar);
            calls.verify();
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    Tx.test("ComposeHelpers.test_composeActions_forward", { owner: "andarsov", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp(tc);
        try {
            var message = getComposeActionMessage(tc),
                selection = { message: message };

            var calls = testAction(tc, Compose.ComposeAction.forward, { originalMessage: undefined });
            Mail.Utilities.ComposeHelper.onForwardButton(selection, Mail.Instrumentation.UIEntryPoint.appBar);
            calls.verify();
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    Tx.test("ComposeHelpers.test_composeActions_forward_withAttachment", { owner: "andarsov", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp(tc);
        try {
            var message = getComposeActionMessageWithAttachment(tc),
                selection = { message: message };

            var calls = testAction(tc, Compose.ComposeAction.forward, { originalMessage: undefined });
            Mail.Utilities.ComposeHelper.onForwardButton(selection, Mail.Instrumentation.UIEntryPoint.appBar);
            calls.verify();
        } catch (ex) {
            tc.error(ex.toString());
        }
    });

    Tx.test("ComposeHelpers.test_MailToProtocol", { owner: "nthorn", priority: 0 }, function (tc) {
        /// <summary>
        /// Verifies various mailto scenarios
        /// </summary>

        tc.cleanup = tearDown;
        setUp(tc);

        // We'll be recreating this function in this test
        _preserver.preserve(Mail.Utilities.ComposeHelper, "launchCompose");

        var testMailToEvent = function (recipient, to, cc, bcc, subject, body, withGarbage) {

            // Build the event
            var uriPath = Jx.isNullOrUndefined(recipient) ? "" : recipient,
                uriParams = "";
            if (withGarbage) {
                uriParams += "&garbagehere";
            }
            if (to) {
                uriParams += "&to=" + to;
            }
            if (cc) {
                uriParams += "&cc=" + cc;
            }
            if (bcc) {
                uriParams += "&bcc=" + bcc;
            }
            if (withGarbage) {
                uriParams += "&====";
            }
            if (subject) {
                uriParams += "&subject=" + subject;
            }
            if (withGarbage) {
                uriParams += "&&&&&";
            }
            if (body) {
                uriParams += "&body=" + body;
            }
            if (uriParams.length > 0) {
                uriParams = "?" + uriParams.substr(1);
            }

            var event = {
                uri: new Uri("mailto:" + uriPath + uriParams)
            };

            var launchComposeCallCount = 0;
            // Build the listener to make sure the proper arguments are called
            Mail.Utilities.ComposeHelper.launchCompose = function (action, args) {
                tc.areEqual(Compose.ComposeAction.createNew, action);

                var messageModel = args.messageModel,
                    expectedParams = {};
                tc.isTrue(Boolean(messageModel));
                if (Boolean(recipient) && !Boolean(to)) {
                    expectedParams.to = recipient;
                } else if (!Boolean(recipient) && Boolean(to)) {
                    expectedParams.to = to;
                } else if (Boolean(recipient) && Boolean(to)) {
                    expectedParams.to = recipient + "," + to;
                }
                if (Boolean(cc)) {
                    expectedParams.cc = cc;
                }
                if (Boolean(bcc)) {
                    expectedParams.bcc = bcc;
                }
                if (Boolean(subject)) {
                    expectedParams.subject = subject;
                }
                tc.areEqual(messageModel._cachedValues.to, expectedParams.to);
                tc.areEqual(messageModel._cachedValues.cc, expectedParams.cc);
                tc.areEqual(messageModel._cachedValues.bcc, expectedParams.bcc);
                tc.areEqual(messageModel._cachedValues.subject, expectedParams.subject);

                if (Boolean(body)) {
                    var bodyContents = messageModel._bodyContents.pop(),
                        content = bodyContents.content,
                        format = bodyContents.format,
                        location = bodyContents.location;

                    tc.areEqual(content, body);
                    tc.areEqual(format, ModernCanvas.ContentFormat.text);
                    tc.areEqual(location, ModernCanvas.ContentLocation.end);
                } else {
                    var bodyContents2 = messageModel._bodyContents.pop(),
                        signatureLocation = bodyContents2.signatureLocation;

                    tc.areEqual(signatureLocation, ModernCanvas.SignatureLocation.start);
                }

                launchComposeCallCount++;
            };
            // Fire the event handler
            Mail.Utilities.ComposeHelper.onProtocol(event);
            tc.areEqual(launchComposeCallCount, 1);
        };

        // Test the parsing for various scenarios
        testMailToEvent("val0", undefined, "val2", "val3", "val4", "val5", false);
        testMailToEvent("val0", "val1", "val2", "val3", "val4", "val5", false);
        testMailToEvent(undefined, "val1", "val2", "val3", "val4", "val5", false);
        testMailToEvent(undefined, undefined, "val2", "val3", "val4", "val5", false);
        testMailToEvent("val0", "val1", "val2", "val3", "val4", "val5", true);
        testMailToEvent("val0", undefined, undefined, undefined, undefined, undefined, false);
        testMailToEvent("val0", undefined, undefined, undefined, undefined, undefined, true);
        testMailToEvent(undefined, undefined, undefined, undefined, "val4", undefined, false);
        testMailToEvent(undefined, undefined, undefined, undefined, "val4", undefined, true);
    });

    function verifyParsedQueryParams(tc, uri, expectedResults) {
        /// <summary>Helper function verifies that the parsed query params match the expected results</summary>
        /// <param name="uri" type="Windows.Foundation.Uri">Test URI</param>
        /// <param name="expectedResults" type="Object">Associative array of expected results</param>

        var numExpectedParams = Object.keys(expectedResults).length;
        var numActualParams = 0;


        var actualResult = Mail.Utilities.ComposeHelper._parseQueryParams(uri);

        for (var actualParam in actualResult) {
            tc.areEqual(expectedResults[actualParam], actualResult[actualParam], "Param value did not match for " + actualParam);
            numActualParams++;
        }

        tc.areEqual(numExpectedParams, numActualParams, "Not all params were present in results");
    }

    Tx.test("ComposeHelpers.test_parseQueryParams", { owner: "nthorn", priority: 0 }, function (tc) {

        tc.cleanup = tearDown;
        setUp(tc);

        var testUri;
        var expectedResults;

        tc.log("Case-insensitivity test");
        testUri = new Uri("mailto:test@email.com?CC=TEST2@email.com");
        expectedResults = {
            cc: "TEST2@email.com"
        };
        verifyParsedQueryParams(tc, testUri, expectedResults);

        tc.log("Param with no value test");
        testUri = new Uri("mailto:test@email.com?param1&param2=test");
        expectedResults = {
            param1: true,
            param2: "test"
        };
        verifyParsedQueryParams(tc, testUri, expectedResults);

        tc.log("Test with encoded values");
        testUri = new Uri("mailto:test@email.com?subject=This%20is%20a%20Test%20With%20Symbols%25%26%23&cc=foo");
        expectedResults = {
            subject: "This is a Test With Symbols%&#",
            cc: "foo"
        };
        verifyParsedQueryParams(tc, testUri, expectedResults);

        tc.log("Test with encoded DBCS characters");
        testUri = new Uri("mailto:test@email.com?subject=%E8%B3%87%E6%96%99&test");
        expectedResults = {
            subject: "\u8cc7\u6599",
            test: true
        };
        verifyParsedQueryParams(tc, testUri, expectedResults);

        tc.log("Test with unencoded DBCS characters");
        testUri = new Uri("mailto:\u8cc7\u6599@email.com?subject=\u8cc7\u6599&cc=foo");
        expectedResults = {
            subject: "\u8cc7\u6599",
            cc: "foo"
        };
        verifyParsedQueryParams(tc, testUri, expectedResults);
    });

    Tx.test("ComposeHelpers.test_otherProtocol", { owner: "eihash", priority: 0 }, function (tc) {
        /// <summary>
        /// Verifies the case where the protocol action was not recognized (neither mailto nor calendar code should run)
        /// </summary>

        tc.cleanup = tearDown;
        setUp(tc);

        _preserver.preserve(Mail.Utilities.ComposeHelper, "_mailToHandler");
        _preserver.preserve(Mail.Utilities.ComposeHelper, "_calendarProtocolHandler");

        var uri = new Uri("ms-mail:?action=foo");

        // Build the event
        var activationEvent = {
            uri: uri
        };

        Mail.Utilities.ComposeHelper._mailToHandler = function () {
            tc.error("Unexpected call to mailto handler");
        };
        Mail.Utilities.ComposeHelper._calendarProtocolHandler = function () {
            tc.error("Unexpected call to calendar protocol handler");
        };

        // Test is that this does not hit either of the two asserts, above.
        Mail.Utilities.ComposeHelper.onProtocol(activationEvent);
    });

    Tx.test("ComposeHelpers.test_CalendarProtocol_EventNotFound", { owner: "eihash", priority: 0 }, function (tc) {
        /// <summary>
        /// Tests the case where the event isn't found
        /// </summary>

        tc.cleanup = tearDown;
        setUp(tc);

        var triedLoadingEvent = false;

        Mail.Globals.platform = {
            calendarManager: {
                getEventFromHandle: function () {
                    triedLoadingEvent = true;
                    throw new Error("Unit test mock error loading event");
                }
            }
        };

        var activationEvent = {
            uri: new Uri("ms-mail:?eventhandle=6748&action=calendar")
        };

        // Currently, mostly verifying that this doesn't throw
        Mail.Utilities.ComposeHelper.onProtocol(activationEvent);

        tc.isTrue(triedLoadingEvent, "Invalid test setup: getEventFromHandle was not called");
    });

})();
