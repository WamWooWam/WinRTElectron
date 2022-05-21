
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Microsoft,Compose,WinJS,Jx,Debug,ModernCanvas*/

Jx.delayDefine(Mail.Utilities, "ComposeHelper", function () {
    "use strict";

    // Disable the DeclarePropertiesBeforeUse warning for the whole file
    // Virtually every function in this file would need this warning otherwise.

    var Utilities = Mail.Utilities,
        Instr = Mail.Instrumentation,
        AttachmentSyncStatus = Microsoft.WindowsLive.Platform.AttachmentSyncStatus;

    Utilities.ComposeHelper = {};
    Utilities.ComposeHelper._builder = null;
    Utilities.ComposeHelper._compose = null;
    Utilities.ComposeHelper.currentSelectedFilter = null;
    Utilities.ComposeHelper._selection = null;

    Utilities.ComposeHelper.ensureComposeFiles = function () {
        Utilities.ComposeHelper.ensureComposeFiles = Jx.fnEmpty;

        Jx.delayGroupExec("MailCompose");
        Compose.platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/ Mail.Globals.platform;
    };

    Utilities.ComposeHelper.ensureComposeObject = function () {
        // Only attempt to make the Compose object if the platform says we have a mail account to work with.
        // We ignore the EASI ID test override because the compose window depends on components (e.g. the FromControl) that only work with real accounts.

        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/ Mail.Globals.platform,
            wl = Microsoft.WindowsLive.Platform,
            accounts = platform.accountManager.getConnectedAccountsByScenario(wl.ApplicationScenario.mail, wl.ConnectedFilter.normal, wl.AccountSort.rank),
            success = false;
        if (accounts.count > 0) {
            Utilities.ComposeHelper._builder = /*@static_cast(Mail.ComposeBuilder)*/Mail.composeBuilder;

            Debug.assert(Jx.isObject(Utilities.ComposeHelper._builder));
            var compose = Utilities.ComposeHelper._buildEmpty();
            Utilities.ComposeHelper._compose = compose;
            Utilities.ComposeHelper.ensureComposeObject = function () { return true; };
            success = true;
        }
        return success;
    };

    Utilities.ComposeHelper.ensureComposeHTML = function (throwOnFailure) {
        /// <param name="throwOnFailure" type="Boolean" optional="true">Flag to indicate that failure should throw an error because this is needed to continue.</param>
        if (Utilities.ComposeHelper._compose) {
            Utilities.ComposeHelper.ensureComposeHTML = Jx.fnEmpty;

            Utilities.ComposeHelper._builder.ensureFullscreenInDOM(Utilities.ComposeHelper._compose);
            Utilities.ComposeHelper._compose = null;

        } else {
            Jx.log.warning("Skipping ensureComposeHTML because there is no compose object.");
            if (throwOnFailure) {
                throw new Error("Utilities.ComposeHelper.ensureComposeHTML failed because there was no Compose object to use.");
            }
        }
    };

    function createMailToMessageModel(selectedAccount, queryParameters, to) {
        /// <param name="selectedAccount" type="Microsoft.WindowsLive.Platform.IAccount"></param>
        /// <param name="queryParameters" type="Object"></param>
        /// <param name="to" type="String" optional="true"></param>
        Debug.assert(Jx.isInstanceOf(selectedAccount, Microsoft.WindowsLive.Platform.Account));
        Debug.assert(Jx.isString(to) || Jx.isNullOrUndefined(to));
        Debug.assert(Jx.isObject(queryParameters));

        var platform = Mail.Globals.platform,
            platformView = platform.mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.inbox, selectedAccount.objectId, ""),
            messageCreator = Compose.MessageReturner.instance(platform.mailManager.createDraftMessage(platformView)),
            messageModel = Compose.MailMessageModel.instance({
                initAction: Compose.ComposeAction.createNew,
                messageCreator: messageCreator
            });

        // Set basic properties
        var modelParameters = {};
        ["to", "cc", "bcc", "subject"].filter(function (prop) {
            return Jx.isNonEmptyString(queryParameters[prop]);
        }).forEach(function (prop) {
            modelParameters[prop] = queryParameters[prop];
        });

        // Set the "to" property
        if (Jx.isNonEmptyString(to)) {
            if (Boolean(modelParameters.to)) {
                modelParameters.to = to + "," + modelParameters.to;
            } else {
                modelParameters.to = to;
            }
        }

        messageModel.set(modelParameters);

        // Set body
        if (Jx.isNonEmptyString(queryParameters.body)) {
            messageModel.setBodyContents([{
                content: queryParameters.body,
                format: ModernCanvas.ContentFormat.text,
                location: ModernCanvas.ContentLocation.end
            }]);
        } else {
            messageModel.setBodyContents([{
                signatureLocation: ModernCanvas.SignatureLocation.start
            }]);
        }

        return messageModel;
    }

    Utilities.ComposeHelper._parseQueryParams = function (uri) {
        /// <param name="uri" type="Windows.Foundation.Uri"></param>
        Debug.assert(Jx.isObject(uri));

        var queryString = uri.query;

        // Parse the query string
        var queryParameters = {};
        if (queryString.length > 0) {
            // Drop the starting question mark from the query
            Debug.assert(queryString[0] === "?", "Unexpected query format - did not start with a question mark.");
            queryString = queryString.substr(1);
            // Split the query into arguments
            var queryArguments = queryString.split("&"),
                queryArgument,
                offsetIndex;
            for (var m = queryArguments.length; m--;) {
                queryArgument = /*@static_cast(String)*/queryArguments[m];
                offsetIndex = queryArgument.indexOf("=");
                if (offsetIndex > -1) {
                    queryParameters[queryArgument.substr(0, offsetIndex).toLowerCase()] = Utilities.ComposeHelper.decodeURIComponent(queryArgument.substr(offsetIndex + 1));
                } else {
                    queryParameters[queryArgument.toLowerCase()] = true;
                }
            }
        }
        return queryParameters;
    };

    Utilities.ComposeHelper.decodeURIComponent = function (str) {
        /// <summary>
        /// No throw decodeURIComponent
        /// </summary>
        /// <param name="str" type="String" />

        try {
            return decodeURIComponent(str);
        } catch (e) {
            Jx.log.exception("decodeURIComponent failed", e);
            return null;
        }
    };

    Utilities.ComposeHelper.onProtocol = function (evt) {
        /// <summary>
        /// Handles all protocol activations
        /// </summary>
        /// <param name="evt" type="Windows.ApplicationModel.Activation.IProtocolActivatedEventArgs" />

        // This protocol handler handles all protocol activations (mailto/ms-mail).
        Mail.log("Mail_MailTo_Command", Mail.LogEvent.start);

        // Perform some logic common to both protocol handlers, then invoke the appropriate handler.
        var selectedAccount = Utilities.ComposeHelper._selection.account.platformObject,
            parameters = Utilities.ComposeHelper._parseQueryParams(evt.uri);
        // Figure out which protocol handler to invoke
        if (evt.uri.schemeName === "mailto") {
            Utilities.ComposeHelper._mailToHandler(evt.uri, parameters, selectedAccount);
        } else if (parameters.action === "calendar") {
            Utilities.ComposeHelper._calendarProtocolHandler(parameters);
        }

        Mail.log("Mail_MailTo_Command", Mail.LogEvent.stop);
    };

    Utilities.ComposeHelper._mailToHandler = function (uri, queryParameters, selectedAccount) {
        /// <summary>
        /// Handles mailto protocol activation
        /// </summary>
        /// <param name="uri" type="Windows.Foundation.Uri">URI used to launch app</param>
        /// <param name="queryParameters" type="Object">Parsed query params (dictionary)</param>
        /// <param name="selectedAccount" type="Microsoft.WindowsLive.Platform.IAccount">Current mail account</param>

        Utilities.ComposeHelper.ensureComposeFiles();

        Utilities.ComposeHelper.launchCompose(Compose.ComposeAction.createNew, _augmentActionParameters(/*@static_cast(Compose.ActionParameters)*/{
            messageModel: createMailToMessageModel(
                    selectedAccount,
                    queryParameters,
                    Jx.isNullOrUndefined(uri.path) ? null : Utilities.ComposeHelper.decodeURIComponent(uri.path)
                    )
        }), { startDirty: true, moveToInbox: true, suppressPerfTrack: true });

    };

    Utilities.ComposeHelper._calendarProtocolHandler = function (parameters) {
        /// <summary>
        /// Protocol handler for calendar integration
        /// </summary>
        /// <param name="parameters" type="Object">Parsed query params (dictionary)</param>

        Mail.writeProfilerMark("ComposeHelper.calendarProtocolHandler", Mail.LogEvent.start);

        var eventHandle = parameters.eventhandle;
        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Mail.Globals.platform;

        // Load the calendar event.
        var sourceEvent;

        try {
            sourceEvent = platform.calendarManager.getEventFromHandle(eventHandle);
        } catch (e) {
            // This error can occur if the event handle itself is malformed.  If
            // it is formatted correctly but the event simply doesn't exist, we'll
            // get null.

            Jx.log.exception("Unable to load event", e);
            sourceEvent = null;
        }

        if (sourceEvent) {
            Utilities.ComposeHelper.ensureComposeFiles();

            var calendarAction = parameters.calendaraction;

            if (Compose.util.isValidCalendarAction(calendarAction)) {
                var composeAction = Compose.util.convertToComposeAction(calendarAction);
                var args = /*@static_cast(Compose.ActionParameters)*/{
                    factorySpec: {
                        originalEvent: sourceEvent,
                        calendarAction: calendarAction
                    }
                };
                Utilities.ComposeHelper.launchCompose(composeAction, args, { startDirty: true, moveToDrafts: true, suppressPerfTrack: true });
            } else {
                Jx.log.info("Invalid calendar action, not proceeding with compose launch");
            }
        }

        Mail.writeProfilerMark("ComposeHelper.calendarProtocolHandler", Mail.LogEvent.stop);
    };

    Utilities.ComposeHelper.registerSelection = function (selection) {
        Utilities.ComposeHelper._selection = selection;
    };

    var _isComposeShowingCount = 0,
        _isComposeLaunching = false,
        _isComposeShowing = function () { return _isComposeShowingCount > 0; };
    Object.defineProperty(Utilities.ComposeHelper, "isComposeShowing", {
        get: function () {
            return _isComposeShowing();
        }
    });

    Object.defineProperty(Utilities.ComposeHelper, "isComposeLaunching", {
        get: function () {
            return _isComposeLaunching;
        },
        set: function (launching) {
            _isComposeLaunching = launching;
        }
    });

    Utilities.ComposeHelper.setComposeShowing = function (showing) {
        /// <summary>Updates compose showing refcount</summary>
        /// <param name="showing" type="Boolean" />
        Debug.assert(Jx.isBoolean(showing));

        var newCount = _isComposeShowingCount + (showing ? 1 : -1),
            newIsShowing = newCount > 0,
            changed = _isComposeShowing() !== newIsShowing;
        Debug.assert(newCount >= 0, "Invalid 'compose showing refcount'. count=" + String(newCount));

        _isComposeShowingCount = newCount;

        // If the view state is changing (it is possible Compose may be getting launched even though it is already in view via mailto)
        if (changed) {
            Jx.EventManager.fire(null, "composeVisibilityChanged");
        }
    };

    Utilities.ComposeHelper._buildEmpty = function () {
        /// <summary>Builds an empty fullscreen compose so we can pre-load the compose experience in the background</summary>
        if (!Utilities.ComposeHelper._emptyCompose) {
            Utilities.ComposeHelper._emptyCompose = Utilities.ComposeHelper._builder.createBackgroundCompose();
        }
        return Utilities.ComposeHelper._emptyCompose;
    };

    Utilities.ComposeHelper.addRestartCheck = function () {
        Mail.Globals.appState.addRestartCheck("Compose is showing", function () { return !Utilities.ComposeHelper.isComposeShowing; });
        Utilities.ComposeHelper.addRestartCheck = Jx.fnEmpty;
    };

    Utilities.ComposeHelper.launchCompose = function (action, args, options) {
        /// <param name="action" type="Number">The Compose.ComposeAction to launch.</param>
        /// <param name="args" type="Compose.ActionParameters" optional="true">The collection of parameters to pass to Compose.</param>
        /// <param name="options" type="Object" optional="true">
        ///    An object that has the following fields:
        ///        startDirty: If true, marks Compose as dirty upon launch, which means it will always save
        ///        moveToDrafts: If true, sets destination folder to drafts
        ///        suppressPerfTrack: If true, will not fire perftrack stop events
        /// <param>
        Mail.writeProfilerMark("ComposeHelper.launchCompose", Mail.LogEvent.start);
        var launchFn = function () {
            args = args || {};
            args.factorySpec = args.factorySpec || {};
            args.factorySpec.initAction = action;

            options = options || {};

            var helper = Utilities.ComposeHelper;
            helper.isComposeLaunching = true;
            helper.ensureComposeFiles();
            helper.addRestartCheck();
            if (helper.ensureComposeObject()) {
                helper.ensureComposeHTML(true);
                document.getElementById("idCompCompose").classList.remove("invisible");
                var isNewDraft = (action !== Compose.ComposeAction.openDraft),
                    compose = this._builder.createFullScreenCompose(args),
                    animationPromise = this._builder.showCompose(args, options.suppressPerfTrack);

                animationPromise.done(function () {
                    helper.isComposeLaunching = false;
                    compose.setDirtyState(Boolean(options.startDirty));

                    if (isNewDraft) {
                        // Commit the message so that it will be added to the MessageList
                        var mailMessage = compose.getMailMessageModel();
                        mailMessage.commit();

                        var messageId = mailMessage.get("objectId");

                        Jx.scheduler.addJob(null,
                            Mail.Priority.composeSelectionUpdateNav,
                            "ComposeHelper - update selected item in message list to newly created draft",
                            function () {
                                // message model may have changed, no need to select the MessageList item
                                if (mailMessage === compose.getMailMessageModel()) {
                                    var selection = Utilities.ComposeHelper._selection,
                                        view = selection.view;

                                    if (!Mail.ViewCapabilities.canHaveDrafts(view)) {
                                        // We don't allow drafts in certain folders
                                        options.moveToDrafts = true;
                                    }

                                    var account = selection.account,
                                        accountId = mailMessage.get("accountId");
                                    if (accountId !== account.objectId) {
                                        account = Mail.Account.load(accountId, account.platform);
                                    }

                                    if (account) {
                                        var viewChanging = false;
                                        if (options.moveToDrafts && view !== account.draftsView) {
                                            view = account.draftsView;
                                            viewChanging = true;
                                        } else if (options.moveToInbox && view !== account.inboxView) {
                                            view = account.inboxView;
                                            viewChanging = true;
                                        }

                                        var platformMessage = mailMessage.getPlatformMessage(),
                                            uiMailMessage = new Mail.UIDataModel.MailMessage(platformMessage, account),
                                            updateSelection = function () {
                                                selection.updateNav(account, view, uiMailMessage);
                                                selection.updateMessages(uiMailMessage, -1, [uiMailMessage]);
                                            },
                                            isSearching = Mail.SearchHandler && Mail.SearchHandler.isSearching;

                                        if ((viewChanging || isSearching) && (platformMessage.displayViewIdString === "" || platformMessage.parentConversationId === "")) {
                                            Mail.Promises.waitForEvent(platformMessage, "changed", function () {
                                                return platformMessage.displayViewIdString !== "" && platformMessage.parentConversationId !== "";
                                            }).done(updateSelection);
                                        } else {
                                            updateSelection();
                                        }

                                        if (Mail.Globals.animator) {
                                            // Animate forward if we are in one pane view
                                            Mail.Globals.animator.animateNavigateForward(Jx.fnEmpty, true /* isSameSelection */);
                                        }

                                        if (Jx.glomManager.getIsChild()) {
                                            // If in a child window, we need to update the glomId
                                            Jx.glomManager.changeGlomId(messageId);
                                        }
                                    }
                                }
                            }
                        );
                    }
                }.bind(this));

                Mail.writeProfilerMark("ComposeHelper.launchCompose", Mail.LogEvent.stop);
            }
        }.bind(this);

        if (Utilities.ComposeHelper.isComposeShowing) {
            Utilities.ComposeHelper.hideCurrent();
        }
        launchFn();
    };

    Utilities.ComposeHelper.save = function (suppressClose, hideCurrent) {
        /// <summary>
        /// Saves the current compose experience (if there is one) and performs the default save before/after actions.
        /// In the case of fullscreen compose, this will automatically close the compose experience after save by default.
        /// In inline compose, this will just save. If nothing is being composed this function will do nothing, but it is
        /// safe to call.
        /// </summary>
        /// <param name="suppressClose" type="Boolean" optional="true">Pass true to prevent the compose window from closing after saving</param>
        /// <param name="hideCurrent" type="Boolean" optional="true">True when the save is a result of a switch in the selected message</param>

        if (Jx.isNullOrUndefined(suppressClose)) {
            suppressClose = false;
        }

        var helper = Utilities.ComposeHelper;

        // This can be the first function call that requires _builder since launching the app. Ensure it exists.
        if (helper.ensureComposeObject()) {
            var compose = helper._builder.getCurrent();
            if (Boolean(compose)) {
                compose.save(suppressClose, hideCurrent);
            }
        }
    };

    Utilities.ComposeHelper.hideCurrent = function () {
        /// <summary>
        /// Informs compose that the currently open message will be hidden, some save actions are only taken during this hide, not save
        /// </summary>
        return Utilities.ComposeHelper.save(false /*suppressClose*/, true /*hideCurrent*/);
    };

    var _augmentActionParameters = function (actionParameters) {
        /// <param name="actionParameters" type="Compose.ActionParameters"></param>
        Debug.assert(Jx.isObject(actionParameters));

        actionParameters.factorySpec = actionParameters.factorySpec || /*@static_cast(Mail.MessageModelFactoryFactorySpec)*/{};
        Debug.assert(Jx.isNullOrUndefined(actionParameters.factorySpec.accountId));

        var selectedAccount = /*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/Mail.Globals.appState.selectedAccount;
        Debug.assert(Jx.isInstanceOf(Mail.Globals.appState.selectedAccount, Microsoft.WindowsLive.Platform.Account), "No selected Account set");
        Debug.assert(Jx.isNonEmptyString(selectedAccount.objectId), "Selected account does not have an account ID");

        actionParameters.factorySpec.accountId = selectedAccount.objectId;

        return actionParameters;
    };

    Utilities.ComposeHelper.onEdit = function (message, moveFocus) {
        Mail.log("CommandBar_onEdit", Mail.LogEvent.start);
        Debug.assert(Jx.isBoolean(moveFocus) || Jx.isUndefined(moveFocus), "invalid moveFocus parameter");
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage), "message param is empty");
        Utilities.ComposeHelper.ensureComposeFiles();

        // If this message is already open, make this a noop
        var composeBuilder = Mail.composeBuilder,
            currentCompose = composeBuilder.getCurrent(),
            platformMessage = null;
        if (currentCompose) {
            platformMessage = currentCompose.getMailMessageModel().getPlatformMessage();
        }
        if (!Boolean(currentCompose) || (Boolean(currentCompose.getMailMessageModel()) &&
            !Mail.Validators.areEqual(message, platformMessage)) ||
            message.instanceNumber !== platformMessage.instanceNumber) {
            // We can only edit the message if it is in the drafts folder or we successfully moved the message to the drafts folder first
            if (message.isDraft) {
                // If necessary, mark the Draft as read
                if (Mail.Globals.appSettings.autoMarkAsRead && message.canMarkRead && !message.read && !document.msHidden) {
                    Utilities.ComposeHelper._selection.setReadState(true, [message]);
                }

                // Launch Compose
                Utilities.ComposeHelper.launchCompose(Compose.ComposeAction.openDraft, _augmentActionParameters({
                    factorySpec: {
                        messageCreator: Compose.MessageLoader.instance(message.objectId),
                        moveFocus: !!moveFocus
                    }
                }), { startDirty: true });
            }
        } else {
            document.getElementById("idCompCompose").classList.remove("invisible");
            if (!Mail.Utilities.ComposeHelper.isComposeShowing) {
                var selection = currentCompose.getComponentCache().getComponent("Compose.Selection");
                if (!selection.isActivated()) {
                    selection.composeActivateUI();
                }
                Mail.Utilities.ComposeHelper.setComposeShowing(true);
            }
        }

        Mail.log("CommandBar_onEdit", Mail.LogEvent.stop);
    };

    Utilities.ComposeHelper.onNewButton = function (uiEntryPoint) {
        Mail.log("CommandBar_onNewButton", Mail.LogEvent.start);
        Jx.ptStart("Compose-NewMail");

        Utilities.ComposeHelper.ensureComposeFiles();
        var builder = Mail.Utilities.ComposeHelper._builder,
            compose = null;
        if (builder) {
            compose = builder.getCurrent();
        }
        Debug.assert(!Utilities.ComposeHelper.isComposeShowing || compose);
        // Don't create a new message if we are currently in compose and the message is new or not dirty
        var composeOpenAndDirty = false;
        if (Utilities.ComposeHelper.isComposeShowing && (!compose.getMailMessageModel().isNew() || compose.isDirty())) {
            composeOpenAndDirty = true;
        }

        // Don't create a new message if we are currently in compose and the message is new or not dirty
        var verb = Microsoft.WindowsLive.Platform.MailMessageLastVerb;
        if (!Utilities.ComposeHelper.isComposeShowing ||
            (Utilities.ComposeHelper.isComposeShowing && compose.getMailMessageModel().get("sourceVerb") !== verb.unknown) || // Launch compose if the current draft is a reply/forward
            composeOpenAndDirty) {
            Utilities.ComposeHelper.launchCompose(Compose.ComposeAction.createNew, _augmentActionParameters({}));
            Instr.instrumentTriageCommand(Instr.Commands.new, uiEntryPoint, Utilities.ComposeHelper._selection);
        } else if (!composeOpenAndDirty) {
            if (Mail.Globals.animator) {
                // Animate forward if we are in one pane view
                Mail.Globals.animator.animateNavigateForward(Jx.fnEmpty, true /* isSameSelection */);
            }
        }

        Mail.log("CommandBar_onNewButton", Mail.LogEvent.stop);
    };

    Utilities.ComposeHelper.onReplyButton = function (selection, uiEntryPoint) {
        Mail.log("CommandBar_onReplyButton", Mail.LogEvent.start);
        Jx.ptStart("Compose-Reply");
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isValidNumber(uiEntryPoint));
        var message = selection.message;
        Utilities.ComposeHelper.launchReplyAsync(function () {
            message.recordAction(Microsoft.WindowsLive.Platform.FolderAction.messageAction);
            Utilities.ComposeHelper.ensureComposeFiles();
            Utilities.ComposeHelper.launchCompose(Compose.ComposeAction.reply, _augmentActionParameters(/*@static_cast(Compose.ActionParameters)*/{
                factorySpec: {
                    messageCreator: Compose.MessageReturner.instance(message.platformMailMessage)
                }
            }));
            Instr.instrumentTriageCommand(Instr.Commands.reply, uiEntryPoint, Utilities.ComposeHelper._selection);
        }, message);
        Mail.log("CommandBar_onReplyButton", Mail.LogEvent.stop);
    };

    Utilities.ComposeHelper.onReplyAllButton = function (selection, uiEntryPoint) {
        Mail.log("CommandBar_onReplyAllButton", Mail.LogEvent.start);
        Jx.ptStart("Compose-ReplyAll");
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isValidNumber(uiEntryPoint));
        var message = selection.message;
        Utilities.ComposeHelper.launchReplyAsync(function () {
            message.recordAction(Microsoft.WindowsLive.Platform.FolderAction.messageAction);
            Utilities.ComposeHelper.ensureComposeFiles();
            Utilities.ComposeHelper.launchCompose(Compose.ComposeAction.replyAll, _augmentActionParameters(/*@static_cast(Compose.ActionParameters)*/{
                factorySpec: {
                    messageCreator: Compose.MessageReturner.instance(message.platformMailMessage)
                }
            }));
            Instr.instrumentTriageCommand(Instr.Commands.replyAll, uiEntryPoint, Utilities.ComposeHelper._selection);
        }, message);
        Mail.log("CommandBar_onReplyAllButton", Mail.LogEvent.stop);
    };

    Utilities.ComposeHelper.launchReplyAsync = function (launchReply, message) {
        /// <summary>If the mail message is not downloaded yet, prompts the user to see if we should continue to the reply/reply all.</summary>
        /// <param name="launchReply" type="Function">A function that launches compose to reply to a message.</param>
        /// <param name="message" type="Mail.UIDataModel.MailMessage">The message to check.</param>
        if (message.isComposeBodyTruncated || message.hasAttachments) {
            // Ordinary attachments are dropped upon reply, so we only need to check the embedded attachments.
            var embeddedAttachments = message.getEmbeddedAttachmentCollection();
            Utilities.ComposeHelper.launchAsync(launchReply, message, embeddedAttachments);
        } else {
            // The message is ready to reply, so launch it synchronously.
            launchReply();
        }
    };

    Utilities.ComposeHelper.onForwardButton = function (selection, uiEntryPoint) {
        Mail.log("CommandBar_onForwardButton", Mail.LogEvent.start);
        Jx.ptStart("Compose-Forward");
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isValidNumber(uiEntryPoint));
        var message = selection.message;
        Utilities.ComposeHelper.launchForwardAsync(function () {
            message.recordAction(Microsoft.WindowsLive.Platform.FolderAction.messageAction);
            Utilities.ComposeHelper.ensureComposeFiles();
            Utilities.ComposeHelper.launchCompose(Compose.ComposeAction.forward, _augmentActionParameters(/*@static_cast(Compose.ActionParameters)*/{
                factorySpec: {
                    messageCreator: Compose.MessageReturner.instance(message.platformMailMessage)
                }
            }));
            Instr.instrumentTriageCommand(Instr.Commands.forward, uiEntryPoint, Utilities.ComposeHelper._selection);
        }, message);
        Mail.log("CommandBar_onForwardButton", Mail.LogEvent.stop);
    };

    Utilities.ComposeHelper.launchForwardAsync = function (launchForward, message) {
        /// <summary>If the mail message or its attachments are not downloaded yet, prompts the user to see if we should continue to the forward.</summary>
        /// <param name="launchForward" type="Function">A function that launches compose to forward a message.</param>
        /// <param name="message" type="Mail.UIDataModel.MailMessage">The message to check.</param>
        if (message.isComposeBodyTruncated || message.hasAttachments) {
            var embeddedAttachments = message.getEmbeddedAttachmentCollection(),
                ordinaryAttachments = message.getOrdinaryAttachmentCollection();
            Utilities.ComposeHelper.launchAsync(launchForward, message, embeddedAttachments, ordinaryAttachments);
        } else {
            // The message is ready to forward, so launch it synchronously.
            launchForward();
        }
    };

    Utilities.ComposeHelper.launchAsync = function (launch, message, embeddedAttachments, ordinaryAttachments) {
        /// <summary>If the mail message or its attachments are not downloaded yet, prompts the user to see if we should continue.</summary>
        /// <param name="launch" type="Function">A function that launches compose.</param>
        /// <param name="message" type="Mail.UIDataModel.MailMessage">The message to check.</param>
        /// <param name="embeddedAttachments" type="Microsoft.WindowsLive.Platform.ICollection">The collection of embeddedAttachments.</param>
        /// <param name="ordinaryAttachments" type="Microsoft.WindowsLive.Platform.ICollection" optional="true">The optional collection of ordinaryAttachments.</param>
        var containsNotDownloadedAttachments = Utilities.ComposeHelper.containsNotDownloadedAttachments;
        if (!message.isJunk && (message.isComposeBodyTruncated || containsNotDownloadedAttachments(embeddedAttachments) || containsNotDownloadedAttachments(ordinaryAttachments))) {
            // Some of the attachments are not downloaded, so the user may want to wait and download them. If the user chooses not to wait,
            // the attachments will not be included in the forwarded message.
            var flyoutElement = document.querySelector(".mailReadingPaneFinishDownloadingFlyout");
            if (!flyoutElement) {
                // Create the flyout's html
                var appRoot = document.getElementById(Mail.CompApp.rootElementId);
                flyoutElement = document.createElement("div");
                flyoutElement.className = "mailReadingPaneFinishDownloadingFlyout";
                flyoutElement.innerHTML = "<div>" +
                                              "<div class='mailReadingPaneFinishDownloadingPrompt typeSizeNormal' data-win-res='innerText:mailReadingPaneFinishDownloadingPrompt'></div>" +
                                              "<div class='mailReadingPaneFinishDownloadingFlyoutButtons'>" +
                                                  "<button class='mailReadingPaneFlyoutDefaultFocusButton mailReadingPaneContinueWithoutDownloadingButton' data-win-res='innerText:mailReadingPaneContinueWithoutDownloading' role='button' tabindex='0' type='button'></button>" +
                                                  "<button class='mailReadingPaneFinishDownloadingButton' data-win-res='innerText:mailReadingPaneFinishDownloading' role='button' tabindex='0' type='button'></button>" +
                                              "</div>" +
                                          "</div>";
                Jx.res.processAll(flyoutElement);
                appRoot.appendChild(flyoutElement);

                // Create the flyout
                var respondButton = document.querySelector(".mailReadingPaneRespondButton");
                new WinJS.UI.Flyout(flyoutElement, { anchor: respondButton });
            }

            Debug.assert(document.querySelectorAll(".mailReadingPaneFinishDownloadingFlyout").length === 1);
            var continueWithoutDownloadingButton = flyoutElement.querySelector(".mailReadingPaneContinueWithoutDownloadingButton"),
                finishDownloadingButton = flyoutElement.querySelector(".mailReadingPaneFinishDownloadingButton"),
                flyout = /*@static_cast(WinJS.UI.Flyout)*/flyoutElement.winControl;

            var continueWithoutDownloading = function () {
                cleanUp();
                flyout.hide();
                launch();
            },
                finishDownloading = function () {
                    flyout.hide();
                    Utilities.ComposeHelper.finishDownloading(message, embeddedAttachments, ordinaryAttachments);
                },
                onKeyDown = function (evt) {
                    /// <param name="evt" type="Event">The keypress event.</param>
                    var activeElement = document.activeElement;
                    if (evt.key === "Enter" && activeElement !== continueWithoutDownloadingButton && activeElement !== finishDownloadingButton) {
                        evt.preventDefault();
                        flyoutElement.querySelector(".mailReadingPaneFlyoutDefaultFocusButton").click();
                    }
                },
                cleanUp = function () {
                    continueWithoutDownloadingButton.removeEventListener("click", continueWithoutDownloading, false);
                    finishDownloadingButton.removeEventListener("click", finishDownloading, false);
                    flyoutElement.removeEventListener("keydown", onKeyDown, false);
                    flyout.removeEventListener("afterhide", cleanUp, false);
                };

            // The flyout doesn't return a value, we need to set up our eventing manually.
            continueWithoutDownloadingButton.addEventListener("click", continueWithoutDownloading, false);
            finishDownloadingButton.addEventListener("click", finishDownloading, false);
            flyoutElement.addEventListener("keydown", onKeyDown, false);
            flyout.addEventListener("afterhide", cleanUp, false);
            flyout.show();
        } else {
            // The message is ready to forward, so launch it synchronously.
            launch();
        }
    };

    Utilities.ComposeHelper.containsNotDownloadedAttachments = function (attachmentCollection) {
        /// <summary>Returns true if there is an attachment that is not downloaded yet and false otherwise.</summary>
        /// <param name="attachmentCollection" type="Microsoft.WindowsLive.Platform.ICollection" optional="true">The attachment collection to check.</param>
        if (attachmentCollection) {
            for (var i = 0, len = attachmentCollection.count; i < len; i++) {
                var attachment = /*@static_cast(Microsoft.WindowsLive.Platform.MailAttachment)*/attachmentCollection.item(i);
                if (attachment.syncStatus !== /*@static_cast(Microsoft.WindowsLive.Platform.AttachmentComposeStatus)*/AttachmentSyncStatus.done) {
                    return true;
                }
            }
        }

        return false;
    };

    Utilities.ComposeHelper.finishDownloading = function (message, embeddedAttachments, ordinaryAttachments) {
        /// <summary>Starts downloading the rest of the message and any attachments.</summary>
        /// <param name="message" type="Mail.UIDataModel.MailMessage">The message to start downloading.</param>
        /// <param name="embeddedAttachments" type="Microsoft.WindowsLive.Platform.ICollection">The collection of embeddedAttachments to start downloading.</param>
        /// <param name="ordinaryAttachments" type="Microsoft.WindowsLive.Platform.ICollection" optional="true">The optional collection of ordinaryAttachments to start downloading.</param>
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage), "Expected a valid message");
        Debug.assert(Jx.isInstanceOf(embeddedAttachments, Microsoft.WindowsLive.Platform.Collection), "Expected a valid embedded attachments collection");
        Debug.assert(Jx.isNullOrUndefined(ordinaryAttachments) || Jx.isInstanceOf(ordinaryAttachments, Microsoft.WindowsLive.Platform.Collection), "Expected a valid ordinary attachments collection");
        if (message.isComposeBodyTruncated) {
            message.downloadFullBody();
        }

        var startAttachmentDownloads = Utilities.ComposeHelper.startAttachmentDownloads;
        startAttachmentDownloads(embeddedAttachments);
        startAttachmentDownloads(ordinaryAttachments);
    };

    Utilities.ComposeHelper.startAttachmentDownloads = function (attachmentCollection) {
        /// <summary>Starts downloading any attachments that are not already in progress or downloaded.</summary>
        /// <param name="attachmentCollection" type="Microsoft.WindowsLive.Platform.ICollection">The attachment collection to download.</param>
        Debug.assert(Jx.isNullOrUndefined(attachmentCollection) || Jx.isInstanceOf(attachmentCollection, Microsoft.WindowsLive.Platform.Collection), "Expected a valid attachments collection");
        if (attachmentCollection) {
            for (var i = 0, len = attachmentCollection.count; i < len; i++) {
                var attachment = /*@static_cast(Microsoft.WindowsLive.Platform.MailAttachment)*/attachmentCollection.item(i);
                if (attachment.syncStatus === /*@static_cast(Microsoft.WindowsLive.Platform.AttachmentComposeStatus)*/AttachmentSyncStatus.notStarted ||
                    attachment.syncStatus === /*@static_cast(Microsoft.WindowsLive.Platform.AttachmentComposeStatus)*/AttachmentSyncStatus.failed) {
                    attachment.downloadBody();
                }
            }
        }
    };

    Utilities.ComposeHelper.createAutoReplaceManager = function () {
        this._ensureAutoReplaceManagerTables();
        return new ModernCanvas.AutoReplaceManager("mail", Utilities.ComposeHelper._autoReplaceManagerTables);
    };

    Utilities.ComposeHelper._autoReplaceManagerTables = /*@static_cast(ModernCanvas.AutoReplaceManager)*/null;
    Utilities.ComposeHelper._ensureAutoReplaceManagerTables = function () {
        Debug.assert(Jx.isNullOrUndefined(Utilities.ComposeHelper._autoReplaceManagerTables));

        Utilities.ComposeHelper._autoReplaceManagerTables = ModernCanvas.AutoReplaceManagerTables.instance();
        Debug.assert(Jx.isObject(Utilities.ComposeHelper._autoReplaceManagerTables));

        Utilities.ComposeHelper._ensureAutoReplaceManagerTables = Jx.fnEmpty;
    };

    Utilities.ComposeHelper.setDirty = function () {
        var compose = this._builder.getCurrent();
        if (compose) {
            compose.setDirtyState(true);
        }
    };

    Utilities.ComposeHelper.handleHomeButton = function () {
        var ComposeHelper = Utilities.ComposeHelper;
        ComposeHelper.setDirty();
        ComposeHelper.save();
        ComposeHelper.composeComplete();
    };

    Utilities.ComposeHelper.setGlomManager = function (glomManager) {
        Debug.assert((glomManager === null) || Jx.isObject(glomManager));
        Debug.assert((glomManager === null) || Jx.isFunction(glomManager.composeComplete));
        Debug.assert((glomManager === null) || Jx.isFunction(glomManager.updateWindowTitleWithMessage));
        Utilities.ComposeHelper._glomManager = glomManager;
    };

    Utilities.ComposeHelper.composeComplete = function () {
        var glomManager = Utilities.ComposeHelper._glomManager;
        if (glomManager) {
            glomManager.composeComplete();
        } else {
            Debug.assert(Mail.GlomManager.isParent(), "Method called in child window before MailGlomManager init complete");
        }
    };

    Utilities.ComposeHelper.updateWindowTitleWithMessage = function (message) {
        var glomManager = Utilities.ComposeHelper._glomManager;
        if (glomManager) {
            var account = Mail.Account.load(message.accountId, Compose.platform);
            glomManager.updateWindowTitleWithMessage(new Mail.UIDataModel.MailMessage(message, account));
        } else {
            Debug.assert(Mail.GlomManager.isParent(), "Method called in child window before MailGlomManager init complete");
        }
    };

});
