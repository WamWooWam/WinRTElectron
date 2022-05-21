
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Compose, Debug, Mail, Microsoft, ModernCanvas, Windows, WinJS, setImmediate*/

Jx.delayGroup("MailCompose", function () {

    function _getAccount(accountId) {
        /// <param name="accountId" type="String"></param>
        var accountManager = Compose.platform.accountManager;
        return accountManager.loadAccount(accountId);
    }

    Compose.BodyComponent = /*@constructor*/function () {
        Compose.Component.call(this);

        this._bindings = null;
        this._canvas = /*@static_cast(HTMLElement)*/null;
        this._canvasControl = /*@static_cast(ModernCanvas.ModernCanvas)*/null;
        this._createCanvasPromise = /*@static_cast(WinJS.Promise)*/null;
        this._irmQuotedBody = /*@static_cast(ModernCanvas.Plugins.IrmQuotedBody)*/null;
        this._dirtyTracker =  /*@static_cast(ModernCanvas.Plugins.DirtyTracker)*/null;

        this._lastAccountId = /*@static_cast(String)*/null;
    };
    Jx.augment(Compose.BodyComponent, Jx.Events);
    Jx.augment(Compose.BodyComponent, Compose.Component);

    Compose.util.defineClassName(Compose.BodyComponent, "Compose.BodyComponent");

    var proto = Compose.BodyComponent.prototype;

    Debug.Events.define(proto, "font", "contextmenu", "beforecommand", "aftercommand", "selectionchange", "blur", "focus", "keydown", "mspointerdown");

    proto.composeGetUI = function (ui) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        ui.html = Compose.Templates.body();
    };

    proto.composeActivateUI = function () {
        var that = this;
        this.getCanvasAsync()
            .done(/*@bind(ModernCompose.ComposeWindow)*/function (canvasControl) {
                /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />
                Debug.assert(Jx.isObject(canvasControl));
                that._bindings = that.getComponentBinder().attach(that, [
                    { on: "changed", fromComponent: Compose.ComponentBinder.messageModelClassName, then: that._onMessageModelChange },
                    { on: "beforecommand", from: canvasControl, then: /*@bind(Compose.BodyComponent)*/function (ev) { that.raiseEvent("beforecommand", ev); } },
                    { on: "aftercommand", from: canvasControl, then: /*@bind(Compose.BodyComponent)*/function (ev) { that.raiseEvent("aftercommand", ev); } },
                    { on: "selectionchange", from: canvasControl.getDocument(), then: /*@bind(Compose.BodyComponent)*/function (ev) { that.raiseEvent("selectionchange", ev); } },
                    { on: "blur", from: canvasControl.getIframeElement(), then: /*@bind(Compose.BodyComponent)*/function (ev) { that.raiseEvent("blur", ev); } },
                    { on: "focus", from: canvasControl.getIframeElement(), then: /*@bind(Compose.BodyComponent)*/function (ev) { that.raiseEvent("focus", ev); } },
                    { on: "keydown", from: canvasControl.getDocument(), then: /*@bind(Compose.BodyComponent)*/function (ev) { that.raiseEvent("keydown", ev); } },
                    { on: "MSPointerDown", from: canvasControl.getDocument(), then: /*@bind(Compose.BodyComponent)*/function (ev) { that.raiseEvent("mspointerdown", ev); } }
                ]);
            });
    };

    proto.composeDeactivateUI = function () {
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");

        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;

        this._canvasControl.deactivate();
    };

    proto.composeUpdateUI = function () {
        Debug.assert(Jx.isObject(this._createCanvasPromise), "Expected canvas control to be activating");
        var that = this,
            messageModel = this.getMailMessageModel();

        this.getCanvasAsync()
            .done(/*@bind(ModernCompose.ComposeWindow)*/function (canvasControl) {
                /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />
                canvasControl.reset(true, true);

                canvasControl.setMailMessage(messageModel.getPlatformMessage());
                that._setMailAccount(messageModel.get("accountId"));

                // Add contents to canvas
                var bodyContents = messageModel.getBodyContents(),
                    bodyIsEmpty = true,
                    signatureLocation = /*@static_cast(ModernCanvas.SignatureLocation)*/null;
                bodyContents.forEach(function (content) {
                    /// <param name="content" type="Compose.BodyContent"></param>
                    if (!Jx.isNullOrUndefined(content.content)) {
                        canvasControl.addContent(content.content, content.format, content.location);

                        // Check for the empty body we manually set for a new message
                        if (content.format !== ModernCanvas.ContentFormat.text || content.content !== "") {
                            bodyIsEmpty = false;
                        }
                    } else {
                        // Signature can be added via the signature property on the mailMessageModel,
                        // or in certain cases must be added through the body. This handles the latter.
                        Debug.assert(Jx.isNonEmptyString(content.signatureLocation));
                        Debug.assert(signatureLocation === null, "Signature location was set twice.");
                        signatureLocation = content.signatureLocation;
                    }
                });

                Debug.assert(!Jx.isNullOrUndefined(that._irmQuotedBody));
                that._irmQuotedBody.setContent(null);
                var canEdit = messageModel.get("irmCanEdit"),
                    canExtractContent = messageModel.get("irmCanExtractContent");

                if (!canEdit || !canExtractContent) {
                    var quotedMessage = Compose.mailMessageFactoryUtil.getSourceMessage(messageModel.getPlatformMessage());
                    if (Boolean(quotedMessage)) {
                        var account = Mail.Account.load(quotedMessage.accountId, Compose.platform),
                            irmDocument = Mail.getScrubbedDocument(Compose.platform, new Mail.UIDataModel.MailMessage(quotedMessage, account)),
                            documentFragment = ModernCanvas.Mail.convertDocumentToDocumentFragment(irmDocument);

                        // The reply header goes in the IRM quoted body.
                        var header = Compose.mailMessageFactoryUtil.prepareReplyInfoFromOriginalMessage(quotedMessage),
                            headerElement = document.createElement("div");

                        try {
                            headerElement.innerHTML = window.toStaticHTML(header);
                            documentFragment.insertBefore(headerElement, documentFragment.firstChild);
                        } catch (ex) {
                            Jx.log.exception("toStaticHTML threw", ex);
                        }

                        that._irmQuotedBody.setContent(documentFragment);
                    }
                }

                that._irmQuotedBody.disableCopy = !canExtractContent;

                if (Jx.isNullOrUndefined(signatureLocation)) {
                    signatureLocation = messageModel.getSignatureLocation();
                }
                Compose.log("activateCanvas", Compose.LogEvent.start);
                canvasControl.activate(signatureLocation);
                Compose.log("activateCanvas", Compose.LogEvent.stop);

                // Only set the cue text on the canvas control when we are not going to set focus on it
                var action = messageModel.getInitAction();
                if ((action === Compose.ComposeAction.forward) ||
                    (action === Compose.ComposeAction.createNew && bodyIsEmpty)) {
                    // If we put a signature in the body, it will asynchronously remove the cue text; put it back when it's done
                    setImmediate(canvasControl.showCueText.bind(canvasControl));
                } else if (action === Compose.ComposeAction.openDraft && Mail.guiState.isOnePane &&
                          document.activeElement === canvasControl.getIframeElement()) {
                    // If we are in one pane mode and opening a draft, it's possible that the
                    // selection is not correct in canvas. This happens because sometimes the
                    // addContent happens after the focus event for canvas, causing the cursor
                    // to appeaer in the previous selection range regardless of if it makes sense
                    canvasControl.setSelection(/*selectionRange*/null);
                }
            });
    };

    proto.prepareForAnimation = function () {
        /// <summary>Suspend canvas events during an animation.</summary>
        Debug.assert(Jx.isObject(this._createCanvasPromise), "Expected canvas control to be activating");
        Compose.log("body.prepareForAnimation", Compose.LogEvent.start);
        this.getCanvasAsync()
            .done(function (canvasControl) {
                /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />
                var autoResize = canvasControl.components.autoResize;
                Debug.assert(autoResize);
                autoResize.suspendEvents();
                Compose.log("body.prepareForAnimation", Compose.LogEvent.stop);
            });
    };

    proto.restoreFromAnimation = function () {
        /// <summary>Resume canvas events after an animation.</summary>
        Debug.assert(Jx.isObject(this._createCanvasPromise), "Expected canvas control to be activating");
        Compose.log("body.restoreFromAnimation", Compose.LogEvent.start);
        this.getCanvasAsync()
            .done(function (canvasControl) {
                /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />
                var autoResize = canvasControl.components.autoResize;
                Debug.assert(autoResize);
                autoResize.resumeEvents();
                Compose.log("body.restoreFromAnimation", Compose.LogEvent.stop);
            });
    };



    proto.clear = function () {
        if (this._canvasControl) {
            this._canvasControl.getDocument().getSelection().removeAllRanges();
            this._canvasControl.clearContent();
        }
    };

    proto.setIsAddedToDOM = function (isAddedToDOM) {
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        Compose.Component.prototype.setIsAddedToDOM.call(this, isAddedToDOM);

        if (!isAddedToDOM) {
            // Tell the canvas to shut down
            this._canvasControl.dispose();
            this._canvasControl = null;
            this._createCanvasPromise = null;
        }
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");

        var canvasControl = this._canvasControl,
            messageModel = this.getMailMessageModel();
        Debug.assert(Jx.isObject(messageModel));

        if (action === "send" && !messageModel.get("irmCanExtractContent") && Boolean(messageModel.get("irmCanEdit"))) {
            // For messages with copy disabled, the reply header is placed in the uneditable region,
            //  but we need to place it into the body of the message before we send
            var quotedMessage = Compose.mailMessageFactoryUtil.getSourceMessage(messageModel.getPlatformMessage());
            if (Boolean(quotedMessage)) {
                var content = Compose.mailMessageFactoryUtil.prepareReplyInfoFromOriginalMessage(quotedMessage);
                messageModel.prependBodyContents([{
                    content: content,
                    format: ModernCanvas.ContentFormat.htmlString,
                    location: ModernCanvas.ContentLocation.end
                }]);

                // We need to pause the dirty tracker so that it won't reset when we add content
                this._dirtyTracker.pause();
                canvasControl.addContent(content, ModernCanvas.ContentFormat.htmlString, ModernCanvas.ContentLocation.end);
                this._dirtyTracker.resume();
            }
        }

        if (action !== "save") {
            // Save can happen any time during compose, so we don't want to finalize the message during a save.
            canvasControl.finalizeMailMessage();
        }

        var ContentFormat = ModernCanvas.ContentFormat,
            contentDestination = (action === "send") ? ModernCanvas.ContentDestination.external : ModernCanvas.ContentDestination.internal,
            canvasContent = canvasControl.getContent([ContentFormat.htmlString, ContentFormat.text], contentDestination);
        messageModel.set({
            htmlBody: canvasContent[ContentFormat.htmlString],
            textBody: canvasContent[ContentFormat.text],
            sanitizedVersion: Microsoft.WindowsLive.Platform.SanitizedVersion.locallyCreatedMessage
        });

        return Compose.Component.prototype.updateModel.call(this, action);
    };

    proto.composeValidate = function () {
        // Always validates, even for save
        return Jx.isObject(this._canvasControl) && this._canvasControl.isContentReady();
    };

    proto.dispatchEvent = function (commandName, value) {
        /// <summary>Fires a command event at the canvas element.</summary>
        /// <param name="commandName" type="String">The name of the command to fire.</param>
        /// <param name="value" type="String" optional="true">The value to send with the command.</param>
        // If executing a command when the appbar is light-dismiss
        Debug.assert(Jx.isNonEmptyString(commandName));
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");

        // First safely normalize the selection and focus together. This allows the commands to execute perfectly.
        var range = this.getSelectionRange();
        if (range) {
            this._canvasControl.replaceSelection(range);
        }
        Jx.raiseEvent(this._canvasControl, "command", { command: commandName, value: value });
    };

    proto.getCanvasControl = function () {
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        return this._canvasControl;
    };

    proto.getCanvasDiv = function () {
        this._canvas = this._canvas || this.getComposeRootElement().querySelector(".composeCanvas");
        return this._canvas;
    };

    proto.getSelectionRange = function () {
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        return this._canvasControl.getSelectionRange();
    };

    proto.getSelectionAnchorElement = function () {
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        var selectionRange = this._canvasControl.getSelectionRange();
        if (selectionRange) {
            return this._canvasControl.getAnchorElement(selectionRange);
        }
        return null;
    };

    proto.getUsageData = function () {
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        return this._canvasControl.getUsageData();
    };

    proto.focus = function () {
        Debug.assert(Jx.isObject(this._createCanvasPromise), "Expected canvas control to be activating");
        this.getCanvasAsync()
            .done(/*@bind(ModernCompose.ComposeWindow)*/function (canvasControl) {
                /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />
                canvasControl.focus();
            });
    };

    proto.getSelectedLink = function () {
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        return this._canvasControl.getParentElementForSelection("a");
    };

    proto.updateEnabledStates = function (commands) {
        /// <summary>Updates the enabled states of the given commands.</summary>
        /// <param name="commands" type="Array">A list of commands to update.</param>
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        this._canvasControl.components.commandManager.updateEnabledStates(commands);
    };

    proto.getCommand = function (commandId) {
        /// <summary>Retrieves the command object that corresponds to the given commandId.</summary>
        /// <param name="commandId" type="String">The commandId of the command to get.</param>
        /// <returns type="ModernCanvas.Command">The command object that corresponds to the given commandId.</returns>
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        return this._canvasControl.components.commandManager.getCommand(commandId);
    };

    proto.isDirty = function () {
        return this._dirtyTracker.isDirty;
    };

    // Private

    proto._onMessageModelChange = function () {
        this._setMailAccount(this.getMailMessageModel().get("accountId"));
    };

    proto._setMailAccount = function (accountId) {
        /// <summary>Update the account on this body control</summary>
        /// <param name="accountId" type="String"></param>
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        if (Jx.isNonEmptyString(accountId)) {
            if (accountId !== this._lastAccountId) {
                // Set the new account in canvas control
                var account = _getAccount(accountId);
                if (Boolean(account)) {
                    this._lastAccountId = accountId;
                    this._canvasControl.setMailAccount(account);
                } else {
                    this._lastAccountId = null;
                }
            }
        } else {
            this._lastAccountId = null;
        }
    };

    proto.getCanvasAsync = function () {
        var that = this;
        if (Jx.isNullOrUndefined(this._createCanvasPromise)) {
            this._irmQuotedBody = new ModernCanvas.Plugins.IrmQuotedBody();
            this._dirtyTracker = new ModernCanvas.Plugins.DirtyTracker();
            this._createCanvasPromise = ModernCanvas.createCanvasAsync(this.getCanvasDiv(), {
                className: "mail",
                delayActivation: true,
                autoReplaceManager: Mail.Utilities.ComposeHelper.createAutoReplaceManager(),
                plugins: {
                    indent: new ModernCanvas.Plugins.Indent(),
                    irmQuotedBody: this._irmQuotedBody,
                    dirtyTracker: this._dirtyTracker,
                    defaultFont: new ModernCanvas.Plugins.DefaultFont(),
                    imageResize: new ModernCanvas.Plugins.ImageResize()
                },
                contextMenuManager: {
                    getUsageData: function () { return {}; },
                    onContextMenu: this.raiseEvent.bind(this, "contextmenu")
                }
            })
                .then(/*@bind(ModernCompose.ComposeWindow)*/function (canvasControl) {
                    /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />
                    that._canvasControl = canvasControl;
                    canvasControl.setCueText(Jx.res.getString("composeCanvasCueText"));

                var commandManager = that._canvasControl.components.commandManager;
                commandManager.setCommand(new ModernCanvas.Command("focusNext", that._focusNext.bind(that), /*@static_cast(__ModernCanvas.Command.Options)*/{ undoable: false }));
                commandManager.setCommand(new ModernCanvas.Command("focusPrevious", that._focusPrevious.bind(that), /*@static_cast(__ModernCanvas.Command.Options)*/{ undoable: false }));
                commandManager.setCommand(new ModernCanvas.Command("font", function (ev) { that.raiseEvent("font", ev); }, /*@static_cast(__ModernCanvas.Command.Options)*/{ undoable: false }));
                commandManager.setCommand(new ModernCanvas.Command("openLink", that._openLink.bind(that),  /*@static_cast(__ModernCanvas.Command.Options)*/{ undoable: false }));

                return canvasControl;
            });
        }
        return this._createCanvasPromise;
    };

    proto.updateCanvasStylesAsync = function (width) {
        /// <summary>Updates canvas styles based on the size of the window.</summary>
        /// <param name="width" type="number">App width</param>
        /// <returns>Promise that completes when the Canvas has been updated for the new width</returns>

        // We don't actually want the getCanvasAsync() promise to be cancelled, so we wrap it in another promise and handle
        // canceling manually
        var canceled = false;
        return new WinJS.Promise(function (complete) {
            Jx.log.info("Compose.BodyComponent.updateCanvasStylesAsync: about to set Canvas styles for width " + width);
            this.getCanvasAsync().done(function (canvasControl) {
                Debug.assert(Jx.isObject(canvasControl), "Expected canvas control to be finished activating");
                if (canceled) {
                    return;
                }

                Jx.log.info("Compose.BodyComponent.updateCanvasStylesAsync: setting Canvas styles for width " + width);
                var iframeBodyElement = canvasControl.getDocument().body,
                    ApplicationView = Jx.ApplicationView,
                    ViewState = ApplicationView.State,
                    state = ApplicationView.getStateFromWidth(width);
                // The canvas is inside an iframe and therefore any media queries within it relate to the size of the iframe 
                // viewport, not the size of the app's viewport. This means that the iframe doesn't have enough information to 
                // determine what padding it should have, so we set classes that it can use in CSS selectors.
                if (Jx.glomManager.getIsChild()) {
                    Jx.setClass(iframeBodyElement, "composeLarge", state === ViewState.large || state === ViewState.full || state === ViewState.wide);
                    Jx.setClass(iframeBodyElement, "composeMedium", state === ViewState.more);
                    Jx.setClass(iframeBodyElement, "composeSmall", state === ViewState.snap || state === ViewState.minimum);
                } else {
                    Jx.setClass(iframeBodyElement, "composeLarge", state === ViewState.wide);
                    Jx.setClass(iframeBodyElement, "composeMedium", state === ViewState.full);
                    Jx.setClass(iframeBodyElement, "composeSmall", state === ViewState.snap || state === ViewState.minimum || state === ViewState.more);
                }

                complete();
            });
        }.bind(this), function () {
            Jx.log.info("Compose.BodyComponent.updateCanvasStylesAsync: Canvas style update canceled for width " + width);
            canceled = true;
        });
    };

    proto._focusNext = function () {
        /// <summary>Moves focus to the next element outside of the body</summary>

        var selection = this.getComponentCache().getComponent("Compose.Selection");
        if (selection && selection.isActivated() && !selection.appBarHidden) {
            selection.focusAppBar();
        } else {
            var sendButton = this.getComponentCache().getComponent("Compose.SendButton");
            sendButton.focus();
        }
    };

    proto._focusPrevious = function () {
        /// <summary>Moves focus to the previous element outside of the body</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent" optional="false">The event fired by another component when a command should be executed.</param>

        var attachmentWell = /*@static_cast(Compose.AttachmentWell)*/this.getComponentCache().getComponent("Compose.AttachmentWell");
        if (Boolean(attachmentWell) && attachmentWell.isActivated() && !attachmentWell.isHidden()) {
            attachmentWell.focus();
        } else {
            var subject = /*@static_cast(Compose.Subject)*/this.getComponentCache().getComponent("Compose.Subject");
            subject.focus();
        }        
    };

    proto._openLink = function (e) {
        /// <summary>Launches the current selected link</summary>
        /// <param name="e" type="Event" optional="false">The event fired by another component when a command should be executed.</param>
        Debug.assert(e);
        Debug.assert(Jx.isObject(this._canvasControl), "Expected canvas control to be finished activating");
        ///<disable>JS3092</disable>
        var linkElement = this.getSelectedLink() || e.target;
        ///<enable>JS3092</enable>
        if (Boolean(linkElement)) {
            var hrefValue = linkElement.getAttribute("href");
            if (Boolean(hrefValue)) {
                try {
                    Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(hrefValue)).done();
                } catch (er) { }
            }
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Compose, FromControl, Debug, Mail*/

Jx.delayGroup("MailCompose", function () {

    Compose.From = function () {
        Compose.Component.call(this);

        this._fromControl = new FromControl.FromControl(Compose.platform.accountManager, Compose.platform.peopleManager);
        this._fromArea = null;
        this._fromControlActivated = false;
        this._initialValue = null;

        this._updateModelHelper = this._updateModelHelper.bind(this);
    };
    Jx.augment(Compose.From, Compose.Component);

    Compose.util.defineClassName(Compose.From, "Compose.From");

    var proto = Compose.From.prototype;

    proto.composeGetUI = function (ui) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        ui.html = Compose.Templates.from({
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            from: Jx.getUI(this._fromControl).html
        });
    };

    proto.composeActivateUI = function () {
        this._fromArea = this.getComposeRootElement().querySelector(".addressbarFromField");
        if (!this._fromControlActivated) {
            this._fromControlActivated = true;
            this._fromControl.activateUI();
            this._fromControl.onAccountChanged = this._updateModelHelper;
        }
    };

    proto.composeDeactivateUI = function () {
        this._fromArea = null;
        this._fromControl.onAccountChanged = null;
    };

    proto.composeUpdateUI = function () {
        // Rebuild the From control if needed (may have changed from our last initialization)
        // Avoid re-entrancy by temporarily ignoring account changes
        this._fromControl.onAccountChanged = null;

        if (this._fromControl.refresh()) {
            this._fromControl.initUI(this._fromArea);
            Jx.res.processAll(this._fromArea);
        }

        var messageModel = this.getMailMessageModel();
        this._initialValue = messageModel.get("fromEmail");
        this._fromControl.select(messageModel.get("accountId"), this._initialValue);

        this._fromControl.onAccountChanged = this._updateModelHelper;

        // If the selected account changed, make sure we sync to it.
        this._updateModelHelper();
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));

        this._updateModelHelper();

        return Compose.Component.prototype.updateModel.call(this, action);
    };

    proto.setDisabled = function (disabled) {
        /// <param name="disabled" type="boolean" />
        if (this._fromControl.disabled !== disabled) {
            this._fromControl.disabled = disabled;
            this.composeUpdateUI();
        }
    };

    proto.isDirty = function () {
        Debug.assert(Jx.isString(this._initialValue));
        return this._fromControl.selectedEmailAddress !== this._initialValue;
    };

    proto.isVisible = function () {
        var headerController = Compose.util.getHeaderController(this.getComponentCache());

        // Only visible in full edit mode
        return headerController.getCurrentState() === Compose.HeaderController.State.editFull;
    };

    // Private

    proto._updateModelHelper = function (account) {
        /// <summary>
        /// Set the associated account
        /// For currently unknown reasons there is sometimes a WinRT error when trying to do this.  To minimize data loss
        /// we catch the error and still save the message off.  Typically the account will not have changed, making this
        /// assignment unneeded.
        /// </summary>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" optional="true"></param>
        try {
            account = account || this._fromControl.selectedAccount;
            Debug.assert(account === this._fromControl.selectedAccount);

            this.getMailMessageModel().set({ accountId: account.objectId,
                                             fromEmail: this._fromControl.selectedEmailAddress});
        } catch (er) {
            Jx.fault("from.js", "_updateMessage", er);
            Debug.assert(false, "Error when trying to update account for message: " + er);
        }
    };

    proto.performClick = function () {
        this._fromControl.click();
    };

    proto.getAccount = function () {
        return this._fromControl.selectedAccount;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Compose, Microsoft, Debug, Mail*/

Jx.delayGroup("MailCompose", function () {

    Compose.Priority = /*@constructor*/function () {
        Compose.Component.call(this);

        this._priorityField = /*@static_cast(HTMLElement)*/null;
        this._priorityArea = null;
        this._currentPriority = /*@static_cast(Number)*/null;
        this._initialValue = /*@static_cast(Number)*/null;
        this._bindings = null;
    };
    Jx.augment(Compose.Priority, Compose.Component);

    Compose.util.defineClassName(Compose.Priority, "Compose.Priority");

    var proto = Compose.Priority.prototype;

    proto.composeGetUI = function (ui) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        ui.html = Compose.Templates.priority();
    };

    proto.composeActivateUI = function () {
        this._priorityField = this.getComposeRootElement().querySelector(".composePriorityField");
        this._bindings = this.getComponentBinder().attach(this, [
            { on: "change", from: this._priorityField, then: this._priorityValueChanged },
            { on: "changed", fromComponent: "Compose.HeaderController", then: this._onHeaderStateChange }
        ]);
    };

    proto.composeDeactivateUI = function () {
        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
    };

    proto.composeUpdateUI = function () {
        var priorities = Microsoft.WindowsLive.Platform.MailMessageImportance,
            messageModel = this.getMailMessageModel(),
            priority = /*@static_cast(Number)*/messageModel.get("importance");

        Debug.assert((priority === /*@static_cast(Number)*/priorities.high) ||
            (priority === /*@static_cast(Number)*/priorities.low) ||
            (priority === /*@static_cast(Number)*/priorities.normal),
            "Unrecognized priority setting");
        this._priorityField.value = this._currentPriority = this._initialValue = priority;

        // Reset the field visibility
        var headerController = Compose.util.getHeaderController(this.getComponentCache());
        this._updateFieldVisibility(headerController.getCurrentState());
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));

        this._updateModelHelper();

        return Compose.Component.prototype.updateModel.call(this, action);
    };

    proto.isDirty = function () {
        return this._initialValue !== this._currentPriority;
    };

    proto.isVisible = function () {
        // Visible when not in read only mode and not explicitly hidden
        var headerController = Compose.util.getHeaderController(this.getComponentCache());
        return headerController.getCurrentState() !== Compose.HeaderController.State.readOnly && !this._getPriorityArea().classList.contains("hidden");
    };

    proto.focus = function () {
        Debug.assert(Jx.isHTMLElement(this._priorityField));
        this._priorityField.focus();
    };

    proto.focusableElementId = function () {
        Debug.assert(Jx.isHTMLElement(this._priorityField));
        return this._priorityField.id;
    };

    // Private

    proto._updateModelHelper = function () {
        var messageModel = this.getMailMessageModel();

        // Set the importance level
        Debug.assert(this._currentPriority === this._getPriorityFieldValue(), "Cached priority flag does not match actual priority value.");
        Debug.assert((this._currentPriority === Microsoft.WindowsLive.Platform.MailMessageImportance.high) ||
            (this._currentPriority === Microsoft.WindowsLive.Platform.MailMessageImportance.low) ||
            (this._currentPriority === Microsoft.WindowsLive.Platform.MailMessageImportance.normal),
            "Priority is set to an invalid value.");

        messageModel.set({ importance: this._currentPriority });
    };

    proto._priorityValueChanged = function () {
        /// <summary>Listener to record when a priority value has changed.</summary>
        this._currentPriority = this._getPriorityFieldValue();
        this._updateModelHelper();
    };

    proto._getPriorityFieldValue = function () {
        return parseInt(this._priorityField.value, 10);
    };

    proto._onHeaderStateChange = function (event) {
        this._updateFieldVisibility(event.newState);
    };

    proto._updateFieldVisibility = function (headerState) {
        // Get the entire priority element
        var priorityElements = Compose.doc.querySelectorAll(".priorityElement");

        // We may need to hide the priority field in the condensed edit header, if it has no value
        var shouldHide = headerState === Compose.HeaderController.State.editCondensed && this.getMailMessageModel().get("importance") === 1;
        Array.prototype.forEach.call(priorityElements, function (priorityElement) {
            if (shouldHide) {
                priorityElement.classList.add("hidden");
            } else {
                priorityElement.classList.remove("hidden");
            }
        });
    };

    proto._getPriorityArea = function () {
        if (!this._priorityArea) {
            this._priorityArea = this.getComposeRootElement().querySelector(".composePriority");
        }
        Debug.assert(Jx.isObject(this._priorityArea));
        return this._priorityArea;
    };
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Compose, Debug, Mail, Microsoft*/

Jx.delayGroup("MailCompose", function () {

    Compose.IrmChooser = /*@constructor*/function () {
        Compose.Component.call(this);

        this._accountId = null;
        this._irmTemplateField = /*@static_cast(HTMLSelectElement)*/null;
        this._templates = null;
        this._currentTemplate = /*@static_cast(Microsoft.WindowsLive.Platform.IRightsManagementTemplate)*/null;
        this._isDirty = false;
        this._bindings = null;
        this._isDisabled = true;

        this._chooserElement = null;
        this._descriptionElement = null;
    };
    Jx.augment(Compose.IrmChooser, Compose.Component);

    Compose.util.defineClassName(Compose.IrmChooser, "Compose.IrmChooser");

    var proto = Compose.IrmChooser.prototype;

    proto.composeGetUI = function (ui) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        ui.html = Compose.Templates.irmChooser();
    };

    proto.composeActivateUI = function () {
        this._irmTemplateField = /*@static_cast(HTMLSelectElement)*/Compose.doc.querySelector(".composeIrmField");
        this._bindings = this.getComponentBinder().attach(this, [
            { on: "change", from: this._irmTemplateField, then: this._irmValueChanged },
            { on: "changed", fromComponent: Compose.ComponentBinder.messageModelClassName, then: this._onMessageModelChange },
            { on: "changed", fromComponent: "Compose.HeaderController", then: this._setElementVisibility }
        ]);
    };

    proto.composeDeactivateUI = function () {
        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
    };

    proto.composeUpdateUI = function () {
        // Store the accountId
        var model = this.getMailMessageModel();
        this._accountId = model.get("accountId");

        // Clear the template, description, and the dirty flag
        this._isDirty = false;
        this._currentTemplate = null;
        var el = this._getDescriptionElement();
        el.innerText = "";

        // Get the templates
        this._templates = this._getTemplates();
        var templateId = model.get("irmTemplateId");
        if ((Jx.isNullOrUndefined(this._templates) || this._templates.count === 0) && !Jx.isNonEmptyString(templateId)) {
            // Current template stays null so irmHasTemplate should be false
            model.set({ irmHasTemplate: false });
        } else {
            // Clear the options
            this._irmTemplateField.innerHTML = "";

            // Add the "No restrictions" Option
            var noRestriction = /*@static_cast(HTMLOptionElement)*/document.createElement("option");
            noRestriction.innerText = Jx.res.getString("composeIrmNoRestrictions");
            noRestriction.value = this._noRestrictionValue;
            noRestriction.classList.add("composeFieldOption");
            this._irmTemplateField.add(noRestriction);

            // Add the other templates associated with this account
            for (var i = 0; i < this._templates.count; i++) {
                var template = /*@static_cast(Microsoft.WindowsLive.Platform.RightsManagementTemplate)*/this._templates.item(i);
                var option = /*@static_cast(HTMLOptionElement)*/document.createElement("option");
                option.innerText = template.name;
                option.value = template.id;
                option.classList.add("composeFieldOption");
                this._irmTemplateField.add(option);
            }

            // Select the appropriate option
            var hasTemplate = /*@static_cast(Boolean)*/model.get("irmHasTemplate");
            if (hasTemplate) {
                // Find the matching template
                this._selectTemplate(templateId);
            }

            this._updateIrmTemplateField();
        }

        // Update which elements are visible
        this._setElementVisibility();
    };

    proto._updateIrmTemplateField = function () {
        /// <summary>Updates the disabled state of the _irmTemplateField based on current component state</summary>

        var model = this.getMailMessageModel();

        // Disable the control if we don't have rights to change the irm,
        // or if another control has requested that it be disabled.
        if (this._isDisabled || (/*@static_cast(Boolean)*/model.get("irmHasTemplate") && !model.get("irmIsContentOwner") && !model.get("irmCanRemoveRightsManagement"))) {
            this._irmTemplateField.disabled = true;
        } else {
            this._irmTemplateField.disabled = false;
        }
    };

    proto.setDisabled = function (isDisabled) {
        /// <summary>Allows other components to disable the control</summary>
        /// <param name="isDisabled" type="Boolean"></param>

        if (isDisabled !== this._isDisabled) {

            this._isDisabled = isDisabled;

            this._updateIrmTemplateField();
        }
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));

        this._updateModel();
        return Compose.Component.prototype.updateModel.call(this, action);
    };

    proto.isDirty = function () {
        return this._isDirty;
    };

    proto.isVisible = function () {
        return !this._getChooserElement().classList.contains("hidden");
    };

    proto.focus = function () {
        Debug.assert(Jx.isHTMLElement(this._irmTemplateField));
        this._irmTemplateField.focus();
    };

    proto.focusableElementId = function () {
        Debug.assert(Jx.isHTMLElement(this._irmTemplateField));
        return this._irmTemplateField.id;
    };

    // Private
    proto._updateModel = function () {
        // Remove the template if necessary
        var model = this.getMailMessageModel();
        var templateId = model.get("irmTemplateId");
        if ((this._currentTemplate === null && Jx.isNonEmptyString(templateId)) || (this._currentTemplate !== null && (templateId !== this._currentTemplate.id))) {
            var platformMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IRightsManagementLicense)*/model.getPlatformMessage();
            if (!model.get("irmIsContentOwner")) {
                Debug.assert(model.get("irmCanRemoveRightsManagement"));
                platformMessage.removeRightsManagementTemplate();
            }

            // Set the template
            platformMessage.setRightsManagementTemplate(this._currentTemplate);
            this._isDirty = true;
        }
    };

    proto._onMessageModelChange = function () {
        var model = this.getMailMessageModel();
        var accountId = model.get("accountId");
        if (this._accountId !== accountId) {
            this._currentTemplate = null;
            var platformMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IRightsManagementLicense)*/model.getPlatformMessage();
            platformMessage.setRightsManagementTemplate(null);
            model.set({ irmHasTemplate: model.get("irmHasTemplate"), irmTemplateId: "" });
            this.composeUpdateUI();
        }
    };

    proto._getChooserElement = function () {
        if (!this._chooserElement) {
            this._chooserElement = Compose.doc.querySelector(".composeIrmChooser");
        }
        Debug.assert(Jx.isObject(this._chooserElement));
        return this._chooserElement;
    };

    proto._getDescriptionElement = function () {
        if (!this._descriptionElement) {
            this._descriptionElement = Compose.doc.querySelector(".composeIrmDescription");
        }
        Debug.assert(Jx.isObject(this._descriptionElement));
        return this._descriptionElement;
    };

    proto._getTemplates = function () {
        /// <summary>Return the collection of templates</summary>
        var templates = null,
            accountManager = Compose.platform.accountManager,
            account = accountManager.loadAccount(this._accountId),
            server = null;
        if (account) {
            server = account.getServerByType(Microsoft.WindowsLive.Platform.ServerType.eas);
        }
        if (server) {
            templates = server.rightsManagementTemplates;
        }
        return templates;
    };

    proto._findTemplate = function (id) {
        for (var i = 0; i < this._templates.count; i++) {
            var template = /*@static_cast(Microsoft.WindowsLive.Platform.IRightsManagementTemplate)*/this._templates.item(i);
            if (template.id === id) {
                return template;
            }
        }
        return null;
    };

    proto._irmValueChanged = function () {
        this._updateIrm();
    };

    proto._updateIrm = function (template) {
        /// <param name="template" type="Microsoft.WindowsLive.Platform.IRightsManagementTemplate" optional="true" />
        var id = this._irmTemplateField.value;

        if (id === this._noRestrictionValue) {
            this._currentTemplate = null;
        } else if (!Jx.isNullOrUndefined(template)) {
            this._currentTemplate = template;
        } else {
            // Find the template with an id that matches the selected option's value property
            template = this._findTemplate(id);
            Debug.assert(!Jx.isNullOrUndefined(template));
            this._currentTemplate = template;
        }

        // Update the model to set the new template
        this._updateModel();

        // Set the description text
        var el = this._getDescriptionElement();
        el.innerText = this._currentTemplate ? this._currentTemplate.description : "";
        if (Jx.isNonEmptyString(el.innerText)) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    };

    proto._selectTemplate = function (templateId) {
        /// <summary> Select the option whose value matches the template id </summary>
        /// <param name="templateId" type="String" />
        Debug.assert(!Jx.isNullOrUndefined(templateId));
        var found = false,
            index = 0,
            template = null;
        for (var i = 0; i < this._irmTemplateField.options.length; i++) {
            if (this._irmTemplateField.options[i].value === templateId) {
                index = i;
                found = true;
                break;
            }
        }
        if (!found) {
            // Add un-found template to drop down
            var model = this.getMailMessageModel();
            var option = /*@static_cast(HTMLOptionElement)*/document.createElement("option");
            option.innerText = model.get("irmTemplateName");
            option.value = model.get("irmTemplateId");
            this._irmTemplateField.add(option);

            template = /*@static_cast(Microsoft.WindowsLive.Platform.IRightsManagementTemplate)*/{
                id: model.get("irmTemplateId"),
                name: model.get("irmTemplateName"),
                description: model.get("irmTemplateDescription")
            };
            index = this._irmTemplateField.options.length - 1;
        }

        this._irmTemplateField.selectedIndex = index;
        this._updateIrm(template);
    };

    proto._setElementVisibility = function () {
        // Sets the HTML elements as visible or invisible based on the current state
        var model = this.getMailMessageModel(),
            headerController = this.getComponentCache().getComponent("Compose.HeaderController");
        Debug.assert(Jx.isObject(headerController));

        // Check which elements we should be hiding
        var noSelectedTemplate = model.get("irmTemplateId") === "",
            noTemplatesExist = (Jx.isNullOrUndefined(this._templates) || this._templates.count === 0),
            condensedEditMode = headerController.getCurrentState() === Compose.HeaderController.State.editCondensed,
            shouldHideChooser = (noTemplatesExist || condensedEditMode) && noSelectedTemplate,
            shouldHideDescription = shouldHideChooser || noSelectedTemplate;

        // Set the chooser element as visible or invisible
        var irmElements = Compose.doc.querySelectorAll(".irmElement");
        Array.prototype.forEach.call(irmElements, function (irmElement) {
            if (shouldHideChooser) {
                irmElement.classList.add("hidden");
            } else {
                irmElement.classList.remove("hidden");
            }
        });

        // Set the description element as visible or invisible
        var description = this._getDescriptionElement();
        if (shouldHideDescription) {
            description.classList.add("hidden");
        } else {
            description.classList.remove("hidden");
        }
    };

    proto._noRestrictionValue = "-1";

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="components.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.Subject = /*@constructor*/function () {
        Compose.Component.call(this);

        this._subjectLine = null;
        this._initialValue = null;
        this._bindings = null;
        this._scrollingIntoViewPaused = false;
    };
    Jx.augment(Compose.Subject, Compose.Component);

    Compose.util.defineClassName(Compose.Subject, "Compose.Subject");

    var proto = Compose.Subject.prototype;

    proto.composeGetUI = function (ui) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        ui.html = Compose.Templates.subject();
    };

    proto.composeActivateUI = function () {
        var subjectLine = this._subjectLine = /*@static_cast(HTMLElement)*/this.getComposeRootElement().querySelector(".composeSubjectLine"),
            subjectParent = this.getComposeRootElement().querySelector(".composeSubjectParent");

        this._bindings = Compose.binder.attach(this, [

            { on: "click", from: subjectParent, then: function () {
                // Won't bring up the touch keyboard if we don't wrap this in a setImmediate
                setImmediate(function () {
                    subjectLine.focus();
                });
            }},

            // Hook up a listener to scroll the Subject line to the beginning on blur if the subject is not scrolled offscreen
            { on: "blur", from: subjectLine, then: function onBlur() {
                var range = subjectLine.createTextRange();
                if (range.offsetTop >= 0 && !this._scrollingIntoViewPaused) {
                    Compose.mark("Subject.scrollIntoView", Compose.LogEvent.start);
                    range.scrollIntoView();
                    Compose.mark("Subject.scrollIntoView", Compose.LogEvent.stop);
                }
            }},

            // Hook up a listener to broadcast subject changed events
            { on: "change", from: subjectLine, then: /*@bind(Compose.Subject)*/function onSubjectChanged() {
                Jx.EventManager.fire(null, "subjectChanged", { subject: this.getSubject() });
            }}
        ]);
    };

    proto.composeDeactivateUI = function () {
        Compose.binder.detach(this._bindings);
        this._bindings = null;
    };

    proto.composeUpdateUI = function () {
        var messageModel = this.getMailMessageModel();

        Compose.mark("setSubject", Compose.LogEvent.start);
        this._subjectLine.value = this._initialValue = messageModel.get("subject");
        Compose.mark("setSubject", Compose.LogEvent.stop);
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));

        this.getMailMessageModel().set({
            subject: this.getSubject().replace(/^\s+|\s+$/g, '') // trim whitepsace
        });

        return Compose.Component.prototype.updateModel.call(this, action);
    };

    proto.getSubject = function () {
        return this._subjectLine.value;
    };

    proto.focus = function () {
        this._subjectLine.focus();
    };

    proto.isActiveElement = function () {
        return Compose.doc.activeElement === this._subjectLine;
    };

    proto.isDirty = function () {
        Debug.assert(Jx.isString(this._initialValue));
        return this.getSubject() !== this._initialValue;
    };

    proto.pauseScrollingIntoView = function () {
        this._scrollingIntoViewPaused = true;
    };

    proto.resumeScrollingIntoView = function () {
        this._scrollingIntoViewPaused = false;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Compose, AddressWell, Debug, Mail*/

Jx.delayGroup("MailCompose", function () {

    Compose.ToCcBcc = function () {
        Compose.Component.call(this);

        var platform = Compose.platform;
        this._controls = {
            to: new AddressWell.Controller("to", null, platform, true /*showSuggestions*/),
            cc: new AddressWell.Controller("cc", null, platform, true /*showSuggestions*/),
            bcc: new AddressWell.Controller("bcc", null, platform, true /*showSuggestions*/)
        };

        this._errorElement = null;
        this._bccElement = null;

        this._labelElements = {
            to: null,
            cc: null,
            bcc: null
        };
        this._errorAriaElements = {
            to: null,
            cc: null,
            bcc: null
        };
        this._lastAccountId = null;
        this._bindings = null;

        this._controlsActivated = false;
    };
    Jx.inherit(Compose.ToCcBcc, Jx.Events);
    Jx.augment(Compose.ToCcBcc, Compose.Component);

    Compose.util.defineClassName(Compose.ToCcBcc, "Compose.ToCcBcc");

    var proto = Compose.ToCcBcc.prototype;

    Debug.Events.define(proto, "autoresolvecompleted");

    proto.composeGetUI = function (ui) {
        var controls = this._controls;
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        ui.html = Compose.Templates.toCcBcc({
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            to: Jx.getUI(controls.to).html,
            cc: Jx.getUI(controls.cc).html,
            bcc: Jx.getUI(controls.bcc).html
        });
    };

    proto.composeActivateUI = function () {
        var that = this;
        if (!this._controlsActivated) {
            var doc = Compose.doc,
                rootElement = this.getComposeRootElement();

            this._controlsActivated = true;

            var errorElement = this._errorElement = rootElement.querySelector(".addressWellError");

            var awPickerLink = Jx.res.getString("/addresswellstrings/awPickerLink"),
                composeTo = Jx.res.getString("composeTo"),
                composeCc = Jx.res.getString("composeCc"),
                composeBcc = Jx.res.getString("composeBcc");

            this._labelElements.to = doc.getElementById("addressbarToFieldLabel");
            this._labelElements.to.setAttribute("aria-label", Jx.res.loadCompoundString("composePickerLabel", composeTo, awPickerLink));
            this._labelElements.cc = doc.getElementById("addressbarCcFieldLabel");
            this._labelElements.cc.setAttribute("aria-label", Jx.res.loadCompoundString("composePickerLabel", composeCc, awPickerLink));
            this._labelElements.bcc = doc.getElementById("addressbarBccFieldLabel");
            this._labelElements.bcc.setAttribute("aria-label", Jx.res.loadCompoundString("composePickerLabel", composeBcc, awPickerLink));

            var controls = this._controls;
            Object.keys(controls).forEach(function (type) {
                var control = controls[type];
                control.activateUI();

                // We want to keep the message up-to-date because several other controls need the change notifications
                control.addListener(AddressWell.Events.addressWellBlur, function () {
                    // Only update the message model if there has been a change
                    if (control.getIsDirty()) {
                        // Get the message model object
                        var messageModel = that.getMailMessageModel();
                        
                        // messageModel may be null if we recieve a blur event while switching between drafts
                        if (messageModel) {
                            // Set the appropriate value in the message model
                            var valueMap = {};
                            valueMap[type] = control.getRecipientsStringInNameEmailPairs();
                            messageModel.set(valueMap);

                            // Also check if we have an error
                            if (control.getError()) {
                                that._errorAriaElements[type].innerText = Jx.res.getString("composeToErrorDescription");
                            } else {
                                that._errorAriaElements[type].innerText = "";

                                // This text is set elsewhere, but when the user corrects any error we'll clear it here
                                errorElement.innerText = "";
                            }
                        }
                    }
                });

                // We also want to notify listeners when an auto resolve completes
                control.addListener(AddressWell.Events.autoResolveSuccessful, function () {
                    // Pass on auto resolve completes
                    that.raiseEvent("autoresolvecompleted", { type: type });
                });
            });

            // Attach labels to the address well elements
            this._errorAriaElements.to = doc.getElementById("addressbarToErrorDescription");
            this._errorAriaElements.cc = doc.getElementById("addressbarCcErrorDescription");
            this._errorAriaElements.bcc = doc.getElementById("addressbarBccErrorDescription");
            doc.getElementById("addressbarToDescription").innerText = Jx.res.loadCompoundString("composeToDescription", composeTo);
            doc.getElementById("addressbarCcDescription").innerText = Jx.res.loadCompoundString("composeToDescription", composeCc);
            doc.getElementById("addressbarBccDescription").innerText = Jx.res.loadCompoundString("composeToDescription", composeBcc);
            this._controls.to.setLabelledBy("addressbarToDescription addressbarToErrorDescription");
            this._controls.cc.setLabelledBy("addressbarCcDescription addressbarCcErrorDescription");
            this._controls.bcc.setLabelledBy("addressbarBccDescription addressbarBccErrorDescription");

            this._controls.to.setAriaFlow(this._labelElements.to.id /*flowFrom*/, this._labelElements.cc.id /*flowTo*/);
        }

        this._bindings = this.getComponentBinder().attach(this, [
            { on: "displayvalidstate", fromComponent: Compose.ComponentBinder.validationViewControllerClassName, then: this._displayValidState },
            { on: "changed", fromComponent: Compose.ComponentBinder.messageModelClassName, then: this._onMessageModelChange },
            { on: "changed", fromComponent: "Compose.HeaderController", then: this._onHeaderStateChange},
            { on: "click", from: this._labelElements.to, then: function () { that.launchPeoplePicker("to"); } },
            { on: "click", from: this._labelElements.cc, then: function () { that.launchPeoplePicker("cc"); } },
            { on: "click", from: this._labelElements.bcc, then: function () { that.launchPeoplePicker("bcc"); } }
        ]);
    };

    proto.composeDeactivateUI = function () {
        var controls = this._controls;
        Object.keys(controls).forEach(function (type) {
            controls[type].cancelPendingSearches();
        });

        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
    };

    proto.composeUpdateUI = function () {
        this.clear();
        this._onMessageModelChange();
        this._updateCcAndBccAriaFlow();
    };

    proto.clear = function () {
        // Clear the address wells
        var controls = this._controls,
            errorAriaElements = this._errorAriaElements;
        Object.keys(controls).forEach(function (type) {
            controls[type].clear();
            errorAriaElements[type].innerText = "";
        });
        this._errorElement.innerText = "";
    };

    proto.onEntranceComplete = function () {
        // Populate recipients
        Compose.log("addRecipients", Compose.LogEvent.start);
        var controls = this._controls,
            errorAriaElements = this._errorAriaElements,
            messageModel = this.getMailMessageModel();
        Object.keys(controls).forEach(function (type) {
            var recipients = messageModel.get(type);
            if (Jx.isNonEmptyString(recipients)) {
                controls[type].addRecipientsByString(recipients);

                // Check if we're starting with an error that needs to be clarified via an ARIA label
                if (controls[type].getError()) {
                    errorAriaElements[type].innerText = Jx.res.getString("composeToErrorDescription");
                }
            }
            controls[type].resetIsDirty();
        });
        Compose.log("addRecipients", Compose.LogEvent.stop);

        // We may need to reset the header state now that we've initialized the address wells
        var headerController = Compose.util.getHeaderController(this.getComponentCache());
        headerController.setDefaultState();
    };

    proto.ensureUpdateModel = function () {
        var messageModel = this.getMailMessageModel();
        Debug.assert(messageModel, "messageModel should not be null");

        messageModel.set({
            to: this.getRecipientsStringInNameEmailPairs("to"),
            cc: this.getRecipientsStringInNameEmailPairs("cc"),
            bcc: this.getRecipientsStringInNameEmailPairs("bcc")
        });
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));
        this.ensureUpdateModel();
        return Compose.Component.prototype.updateModel.call(this, action);
    };

    proto.composeValidate = function (type) {
        /// <param name="type" type="String">save|send</param>
        Debug.assert(["save", "send"].indexOf(type) !== -1);

        if (type === "save") {
            // No need to validate addresswells for a save action
            return true;
        }

        return this._validateRecipients();
    };

    proto.isToEmpty = function () {
        var toString = this.getMailMessageModel().get("to");
        return !Jx.isNonEmptyString(toString);
    };

    proto.getRecipients = function (type) {
        /// <summary>Returns recipients for given control type</summary>
        /// <param name="type" type="String">to|cc|bcc</param>
        Debug.ToCcBcc.assertIsValidControlType(type);
        return this._controls[type].getRecipients();
    };

    proto.getRecipientsStringInNameEmailPairs = function (type) {
        /// <summary>Returns recipients for given control type</summary>
        /// <param name="type" type="String">to|cc|bcc</param>
        Debug.ToCcBcc.assertIsValidControlType(type);
        return this._controls[type].getRecipientsStringInNameEmailPairs();
    };

    proto.focus = function (type, suppressAutoSuggest) {
        /// <param name="type" type="String">to|cc|bcc</param>
        /// <param name="suppressAutoSuggest" type="Boolean" optional="true" />

        Debug.ToCcBcc.assertIsValidControlType(type);
        if (suppressAutoSuggest) {
            this._controls[type].setAutoSuggestOnFocus(false);
        }
        this._controls[type].focusInput();
    };

    proto.launchPeoplePicker = function (type) {
        /// <param name="field" type="string">to|cc|bcc</param>
        Debug.ToCcBcc.assertIsValidControlType(type);
        this._controls[type].launchPeoplePicker();
    };

    proto.setDisabled = function (disabled) {
        /// <param name="disabled" type="boolean" />
        Debug.assert(Jx.isBoolean(disabled));
        var controls = this._controls;
        Object.keys(controls).forEach(function (type) {
            controls[type].setDisabled(disabled);
        });
        var labels = this._labelElements;
        Object.keys(labels).forEach(function (type) {
            labels[type].disabled = disabled;
        });
    };

    proto.isDirty = function () {
        // Dirty when any one of our address wells is dirty
        var controls = this._controls;
        return Object.keys(controls).reduce(function (dirty, type) {
            return dirty || controls[type].getIsDirty();
        }, false);
    };

    proto.isVisible = function (type) {
        /// <param name="type" type="String">to|cc|bcc</param>
        Debug.ToCcBcc.assertIsValidControlType(type);

        // Which fields are hidden is determined by the current header state
        var headerController = Compose.util.getHeaderController(this.getComponentCache()),
            headerState = headerController.getCurrentState();

        // The bcc field is shown in full edit mode, or sometimes in edit mode
        if (type === "bcc") {
            return (headerState === Compose.HeaderController.State.editFull) ||
                   (headerState === Compose.HeaderController.State.editCondensed && !this._getBccElement().classList.contains("hidden"));
        }

        // The to and cc fields are shown in all but the read only mode
        return headerState !== Compose.HeaderController.State.readOnly;
    };

    proto.hasError = function (type) {
        /// <summary>Returns true when the given address well has an error in it</summary>
        /// <param name="type" type="String">to|cc|bcc</param>
        /// <returns type="Boolean"></returns>

        return this._controls[type].getRecipients().length > 0 && this._controls[type].getError();
    };

    // Private

    proto._onMessageModelChange = function () {
        this._setMailAccount(this.getMailMessageModel().get("accountId"));
    };

    proto._onHeaderStateChange = function (event) {
        // Get the bcc elements
        var bccElements = this.getComposeRootElement().querySelectorAll(".bccElement");

        // When we switch to condensed edit mode, we may want to hide the bcc fields
        var shouldHide = event.newState === Compose.HeaderController.State.editCondensed && !Boolean(this.getMailMessageModel().get("bcc"));
        Array.prototype.forEach.call(bccElements, function (bccElement) {
            if (shouldHide) {
                // No bcc data, safe to hide the bcc field
                bccElement.classList.add("hidden");
            } else {
                bccElement.classList.remove("hidden");
            }
        });

        // The flow-to element for the CC and BCC fields can vary, based on various factors. Which element we flow
        // to will be determined based on the final results of the processing for this event--by all listeners.
        // We therefore have to wait until the event has been completely processed before setting the flow-to property.
        setImmediate(function () {
            this._updateCcAndBccAriaFlow();
        }.bind(this));
    };

    proto._updateCcAndBccAriaFlow = function () {
        var domFocus = this.getComponentCache().getComponent("Compose.DOMFocus");
        Debug.assert(Jx.isObject(domFocus));
        if (Jx.isObject(domFocus)) {
            var component = domFocus.getAfterBccFocusComponent();

            if (Jx.isObject(component)) {
                if (this._labelElements.bcc.classList.contains("hidden")) {
                    this._controls.cc.setAriaFlow(this._labelElements.cc.id /*flowFrom*/, component.focusableElementId()/*flowTo*/);
                } else {
                    this._controls.cc.setAriaFlow(this._labelElements.cc.id /*flowFrom*/, this._labelElements.bcc.id /*flowTo*/);
                    this._controls.bcc.setAriaFlow(this._labelElements.bcc.id /*flowFrom*/, component.focusableElementId()/*flowTo*/);
                }
            }
        }
    };

    proto._getBccElement = function () {
        if (!this._bccElement) {
            this._bccElement = Compose.doc.getElementById("addressbarBccField");
        }
        Debug.assert(Jx.isObject(this._bccElement));
        return this._bccElement;
    };

    function _getAccount(accountId) {
        /// <param name="accountId" type="String"></param>
        var accountManager = Compose.platform.accountManager;
        return accountManager.loadAccount(accountId);
    }

    proto._setMailAccount = function (accountId) {
        /// <summary>Update the account on the address wells</summary>
        /// <param name="accountId" type="String"></param>
        if (Jx.isNonEmptyString(accountId)) {
            if (accountId !== this._lastAccountId) {
                // Set the new account in canvas control
                var account = _getAccount(accountId);
                if (Boolean(account)) {
                    this._lastAccountId = accountId;

                    var controls = this._controls;
                    Object.keys(controls).forEach(function (type) {
                        controls[type].setContextualAccount(account);
                    });
                } else {
                    this._lastAccountId = null;
                }
            }
        } else {
            this._lastAccountId = null;
        }
    };

    proto._displayValidState = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(Jx.isArray(ev.invalidControls));
        if (ev.invalidControls.indexOf(this.getClassName()) !== -1) {
            var errors = this._getControlErrors(),
                errorElement = this._errorElement;

            // Switch to the full edit mode so the user can see their mistake
            var headerController = Compose.util.getHeaderController(this.getComponentCache());
            headerController.changeState(Compose.HeaderController.State.editFull);

            // Hook up events to remove any error descriptions when user inputs new text in the address wells
            var didSetFocus = false,
                that = this;
            Object.keys(errors).filter(function (type) {
                return !Jx.isNullOrUndefined(errors[type]);
            }).forEach(function (type) {               
                // Set focus on the first address well with an error
                if (!didSetFocus) {
                    that.focus(type, true/*suppressAutoSuggest*/);
                    didSetFocus = true;
                }
            });

            // Now display the errors
            errorElement.innerText = "";
            Object.keys(errors).forEach(function (type) {
                if (errorElement.innerText === "") {
                    errorElement.innerText = errors[type] || "";
                }
            });
        }
    };

    proto._validateRecipients = function () {
        /// <summary>Returns true if all controls are valid. Else, returns false.</summary>
        var errors = this._getControlErrors();
        var isValid = Object.keys(errors).every(function (type) {
            return !Jx.isNonEmptyString(errors[type]);
        });
        if (isValid) {
            this._errorElement.innerText = "";
        }
        return isValid;
    };

    proto._getControlErrors = function () {
        /// <summary>Validates the recipient boxes for valid email.</summary>
        /// <returns>{ to: errorStr, cc: errorStr, bcc: erroStr }</returns>
        var controls = this._controls;

        // Get the content of each control
        var recipients = { to: null, cc: null, bcc: null };
        Object.keys(controls).forEach(function (type) {
            recipients[type] = this.getRecipientsStringInNameEmailPairs(type);
        } .bind(this));

        // Update error messages for each field
        var errors = { to: null, cc: null, bcc: null };

        // Only try to get an error if the field has content
        if (recipients.cc) {
            errors.cc = controls.cc.getError();
        }
        if (recipients.bcc) {
            errors.bcc = controls.bcc.getError();
        }
        // Also get an error for the to field if none of the other fields have content, that way we catch the
        // no recipients error
        if (Boolean(recipients.to) || !(recipients.cc || recipients.bcc)) {
            errors.to = controls.to.getError();
        }

        return errors;
    };

    Debug.ToCcBcc = {
        isValidControlType: function (type) {
            /// <param name="type" type="String"></param>
            return ["to", "cc", "bcc"].indexOf(type) !== -1;
        },

        assertIsValidControlType: function (type) {
            Debug.assert(Debug.ToCcBcc.isValidControlType(type), "Invalid control type:" + type);
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="components.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.AttachmentWell = /*@constructor*/function () {
        Compose.Component.call(this);

        this._filePickerShowing = false;
        this._attachmentWellModule = null;
        this._attachmentArea = /*@static_cast(HTMLElement)*/null;
    };
    Jx.augment(Compose.AttachmentWell, Compose.Component);

    Compose.util.defineClassName(Compose.AttachmentWell, "Compose.AttachmentWell");

    var proto = Compose.AttachmentWell.prototype;

    // We don't implement the normal getUI or composeGetUI because we need to place UI in two different places.
    // Mail implements a component that brings all this html together itself.
    proto.getProgressBarHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.attachmentWellProgressBar();
    };

    proto.getAttachmentAreaHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.attachmentWellArea();
    };

    proto.composeActivateUI = function () {
        var rootElement = this.getComposeRootElement();
        Debug.assert(Jx.isObject(rootElement));

        var elements = this.getComponentCache();
        this._attachButton = elements.getComponent("Compose.AttachButton");
        this._neighborElement = elements.getComponent("Compose.BodyComponent").getCanvasDiv();
        this._attachmentArea = rootElement.querySelector(".composeAttachmentArea");
        this._contentScrollArea = rootElement.querySelector(".composeContentScrollArea");
        this._statusProgressBar = rootElement.querySelector(".compose-progress-bar");
        Debug.assert(Jx.isObject(this._statusProgressBar));

        // Note: Cannot use Compose.binder here because Jx.EventManager.addListener is
        // not the traditional addListener API.
        Jx.EventManager.addListener(null, "attachcomplete", this._onAttachComplete, this);
        Jx.EventManager.addListener(null, "attachstarted", this._onAttachStarted, this);
        Jx.EventManager.addListener(null, "hide", this._onHide, this);
    };

    proto.deactivateUI = function () {
        Jx.EventManager.removeListener(null, "attachcomplete", this._onAttachComplete, this);
        Jx.EventManager.removeListener(null, "attachstarted", this._onAttachStarted, this);
        Jx.EventManager.removeListener(null, "hide", this._onHide, this);

        this._hideProgressBar();
        this._shutdownAttachmentWellFrame();

        Compose.Component.prototype.deactivateUI.call(this);
    };

    proto.composeUpdateUI = function () {
        // Shutdown and remove the attachment well.
        // Attachmentwell requires that we always do this before showing new UI.
        this._shutdownAttachmentWellFrame();

        if (this.getMailMessageModel().get("hasOrdinaryAttachments")) {
            // We will need to immediately show these ordinary attachements in the attachment well.
            this._ensureAttachmentWellFrame();
        }
    };

    proto.attachAnyFiles = function () {
        /// <summary>Launches file picker to select all type of files and adds it to attachment collection</summary>
        this._attachFiles(["*"]);
    };

    proto.discard = function () {
        /// <summary>Discards the underlying attachment well</summary>
        this._hideProgressBar();
        if (this._attachmentWellModule) {
            this._attachmentWellModule.discard();
        }
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));

        // Default to basic attachments if the Attachment Well Compose Frame has not been created yet.
        var messageModel = this.getMailMessageModel();

        if (action === "send") {
            // We are sending the message, ask attachment well to finalize the message
            if (this._attachmentWellModule) {
                this._attachmentWellModule.finalizeForSend();
            }
        } else {
            // Remove the OneDrive mail mark, so we know that any attachments are basic attachments the next time we open this draft.
            messageModel.set({ photoMailFlags: (/*@static_cast(Number)*/messageModel.get("photoMailFlags")) & ~0x1 });
        }

        return Compose.Component.prototype.updateModel.call(this, action);
    };

    proto.composeValidate = function (type) {
        /// <param name="type" type="String">save|send</param>
        Debug.assert(["save", "send"].indexOf(type) !== -1);

        if (type === "save") {
            // No need to validate addresswells for a save action
            return true;
        }

        return !Jx.isObject(this._attachmentWellModule) || this._attachmentWellModule.validate();
    };

    proto.isDirty = function () {
        /// <summary> Returns true if the attachment well has been modified since isDirty was last set to false</summary>
        if (this._attachmentWellModule) {
            return this._attachmentWellModule.isDirty;
        }

        return false;
    };

    proto.isHidden = function () {
        /// <summary>Returns true if the view is not visible.</summary>
        return !Jx.isObject(this._attachmentWellModule) || this._attachmentWellModule.isHidden();
    };

    proto.focus = function () {
        /// <summary>Sets the focus on the first attachement if there is one.</summary>
        if (Jx.isObject(this._attachmentWellModule)) {
            this._attachmentWellModule.focus();
        }
    };

    // Private

    proto.getCount = function () {
        var module = this._attachmentWellModule;
        return module ? module.getMetrics().count : 0;
    };

    proto._onHide = function () {
        /// <summay>Sets focus on the attach button when the last attachment is removed.</summary>
        this._attachButton.focus();
    };

    proto._onAttachStarted = function () {
        /// <summary>Hides the progress message bar.</summary>
        Jx.mark("Mail.Compose.AttachmentWell._onAttachStarted,Info,Compose.AttachmentWell");
        this._contentScrollArea.scrollTop = 0;
        this._showProgressBar();
    };

    proto._onAttachComplete = function () {
        /// <summary>Hides the progress message bar.</summary>
        Jx.mark("Mail.Compose.AttachmentWell._onAttachComplete,Info,Compose.AttachmentWell");
        this._hideProgressBar();
    };

    proto._showProgressBar = function () {
        /// <summary>Shows the progress message bar.</summary>
        if (this._statusProgressBar) {
            this._statusProgressBar.setAttribute("aria-hidden", "false");
        }
    };

    proto._hideProgressBar = function () {
        /// <summary>Hides the progress message bar.</summary>
        if (this._statusProgressBar) {
            this._statusProgressBar.setAttribute("aria-hidden", "true");
        }
    };

    proto._attachFiles = function (filter) {
        /// <summary>Launches file picker to select files and adds it to attachment collection</summary>
        Debug.assert(filter);

        if (this._filePickerShowing) {
            // WinLive 547876 - Touch events can trigger this method to be called again while the picker is already up.
            return;
        }

        this._filePickerShowing = true;

        // Invoke picker only if we are running in WWA
        
        if (Jx.isWWA) {
            

            // Before we attach any files, we configure the Attachment Well.
            this._ensureAttachmentWellFrame();

            // Ensure attachment well has current subject
            var subject = /*@static_cast(Compose.Subject)*/this.getComponentCache().getComponent("Compose.Subject");
            Debug.assert(Jx.isObject(subject));
            Jx.EventManager.fire(null, "subjectChanged", { subject: subject.getSubject() });

            // Launch picker and let user pick files to attach
            var pickers = Windows.Storage.Pickers,
                filePicker = new pickers.FileOpenPicker();

            // Allow the user to select any file type
            /// <disable>JS3092</disable>
            // def file doesn't include .replaceAll definition
            filePicker.fileTypeFilter.replaceAll(filter);
            /// <enable>JS3092</enable>

            // Using the settings identifier allows us to persist the state of the picker.
            filePicker.settingsIdentifier = "ModernCompose.ComposeWindow";
            filePicker.suggestedStartLocation = pickers.PickerLocationId.picturesLibrary;
            filePicker.viewMode = pickers.PickerViewMode.list;
            filePicker.commitButtonText = Jx.res.getString("attachCommand");

            filePicker.pickMultipleFilesAsync()
                .then(/*@bind(Compose.AttachmentWell)*/function onFilePicked(pickedFiles) {
                    /// <param name="pickedFiles" type="Windows.Foundation.Collections.IVectorView"></param>
                    if (!Jx.isObject(this._attachmentWellModule) || pickedFiles.size === 0) {
                        // Attachment Well has been disposed or the user hit cancel instead of picking files.
                        return;
                    }

                    // Add files to attachment well
                    this._attachmentWellModule.add(/*@static_cast(Array)*/pickedFiles);
                }.bind(this))
                .done(/*@bind(Compose.AttachmentWell)*/function () {
                    this._filePickerShowing = false;
                }.bind(this), /*@bind(Compose.AttachmentWell)*/function (err) {
                    Debug.assert(false, err);
                    this._filePickerShowing = false;
                }.bind(this));
            
        }
        
    };

    proto._shutdownAttachmentWellFrame = function () {
        /// <summary>Shuts down and removes the attachment well.</summary>
        if (Jx.isObject(this._attachmentWellModule)) {
            this._attachmentWellModule.shutdownUI();
            this._attachmentWellModule = null;
        }
    };

    proto._ensureAttachmentWellFrame = function () {
        Compose.log("ensureAttachmentWellFrame", Compose.LogEvent.start);
        if (!Jx.isObject(this._attachmentWellModule)) {

            // Attachments aren't reflected in the message until we commit them.
            var messageModel = this.getMailMessageModel();
            if (!messageModel.isCommitted()) {
                messageModel.commit();
            }

            // Initialize the attachment well.
            var mailMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/messageModel.getPlatformMessage();
            this._attachmentWellModule = new AttachmentWell.Compose.Module(Compose.platform.mailManager, mailMessage, this._neighborElement);
            this._attachmentWellModule.initUI(this._attachmentArea);

            Jx.res.processAll(this._attachmentArea);

            // BLUE:394028 Without animation, sometimes body text overlaps with attachment well
            // upon first initialization especially when the attachment area takes up the whole screen.
            // Using animation forces a repaint and hides this bug.
            WinJS.UI.Animation.createExpandAnimation(this._attachmentArea).execute();
        }
        Compose.log("ensureAttachmentWellFrame", Compose.LogEvent.stop);
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Compose,Debug,Mail*/

Jx.delayGroup("MailCompose", function () {

    Compose.AutoSaver = function () {
        Compose.Component.call(this);

        this._autoSaveTimerId = null;
        this._lastSaveTime = null;
        this._autoSaveJob = null;
        this._bindings = null;
        this._suspended = false;
    };
    Jx.augment(Compose.AutoSaver, Compose.Component);

    Compose.util.defineClassName(Compose.AutoSaver, "Compose.AutoSaver");

    Compose.AutoSaver.Delay = 3 * 60 * 1000; // 3 minutes in milli-seconds

    var proto = Compose.AutoSaver.prototype;

    proto.composeActivateUI = function () {
        this._bindings = this.getComponentBinder().attach(this, [
            { on: "msvisibilitychange", from: Compose.doc, then: this._visibilityChanged },
            { on: "aftercommit", fromComponent: Compose.ComponentBinder.messageModelClassName, then: this._updateLastSaveTime },
            { on: "suspending", from: Jx.activation, then: this._onSuspending },
            { on: "resuming", from: Jx.activation, then: this._onResuming }
        ]);
    };

    proto.composeDeactivateUI = function () {
        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
    };

    proto.composeUpdateUI = function () {
        // Set current time as the last save time and start timer for 3 minutes
        this._updateLastSaveTime();
        this._onAutoSaveTimer();
    };

    proto.clear = function () {
        // Cancel scheduled save
        Jx.dispose(this._autoSaveJob);
        this._autoSaveJob = null;

        // Cancel the auto save timer if there is one
        if (this._autoSaveTimerId) {
            window.clearTimeout(this._autoSaveTimerId);
            this._autoSaveTimerId = null;
        }
    };

    // Private

    proto._updateLastSaveTime = function () {
        this._lastSaveTime = Date.now();
    };

    proto._onAutoSaveTimer = function () {
        /// <summary>Handles auto save timer trigger.</summary>
        Debug.assert(Jx.isInstanceOf(this, Compose.AutoSaver));

        // Make sure there isn't a timer still hanging around
        this.clear();

        // First check if we are still active and not hidden.
        if (!Compose.doc.msHidden) {
            var delay = Compose.AutoSaver.Delay,
                delta = (Date.now() - this._lastSaveTime);
            if (delta >= delay) {
                if (Mail.Utilities.ComposeHelper.isComposeShowing) {
                    // Save message
                    this._autoSaveJob = Jx.scheduler.addJob(null, Mail.Priority.composeAutoSave,
                        "Compose.AutoSaver - run auto save", this._save, this);
                }

                // Restart timer for full 3 min
                this._autoSaveTimerId = window.setTimeout(this._onAutoSaveTimer.bind(this), delay);
            } else {
                // Restart timer for the remaining time
                this._autoSaveTimerId = window.setTimeout(this._onAutoSaveTimer.bind(this), (delay - delta));
            }
        }
    };

    proto._onSuspending = function () {
        /// <summary>Reacts to a suspending event for the application by canceling any outstanding autosaves.</summary>
        this.clear();

        Debug.assert(!this._suspended);
        this._suspended = true;
    };

    proto._onResuming = function () {
        /// <summary>Reacts to a resuming event for the application by restarting the auto save timer.</summary>
        Debug.assert(this._suspended);
        this._suspended = false;

        this._onAutoSaveTimer();
    };

    proto._visibilityChanged = function () {
        /// <summary>Reacts to a visibility changed event for the application - performing an autosave when needed.</summary>

        if (this._suspended) {
            // The suspending event can fire before the msvisibilitychanged event in some cases.
            return;
        }

        // If we just switched to a hidden state
        if (Compose.doc.msHidden) {
            var helper = Mail.Utilities.ComposeHelper;
            if (helper.isComposeShowing) {
                // Save the message
                helper.setDirty();
                this._save();
            }
        } else {
            // We are now visible, so store this as the last save time because we saved when we were hidden.
            this._updateLastSaveTime();
            // Restart timer if it is not running
            if (!Boolean(this._autoSaveTimerId)) {
                this._onAutoSaveTimer();
            }
        }
    };

    proto._save = function () {
        Debug.assert(!this._suspended);
        Compose.ComposeImpl.quietSave(this.getComponentCache());
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Debug, Jx, Compose, Mail*/

Jx.delayGroup("MailCompose", function () {

    Compose.DOMFocus = function () {
        /// <summary>Handles data-focusfrompointer property for the main compose window</summary>
        Compose.Component.call(this);

        this._bindings = null;
    };
    Jx.augment(Compose.DOMFocus, Compose.Component);

    Compose.util.defineClassName(Compose.DOMFocus, "Compose.DOMFocus");

    var proto = Compose.DOMFocus.prototype;

    proto.composeActivateUI = function () {
        var composeWindow = Compose.ComposeImpl.getComposeWindow(this.getComponentCache());
        Debug.assert(Jx.isObject(composeWindow));

        // Can't use the binder for these because we need to capture the events, rather than wait for them to bubble
        composeWindow.addEventListener("MSPointerDown", this._onMSPointerDown, true);
        composeWindow.addEventListener("focus", this._onFocus, true);
        composeWindow.addEventListener("beforedeactivate", this._onBeforeDeactivate, true);

        var selectorsAndFunctions = [
            { selector: ".compose-after-delete-tab-anchor", fn: this._onAfterDeleteAnchorFocus },
            { selector: ".compose-before-readOnlyHeader-tab-anchor", fn: this._onBeforeReadOnlyHeaderFocus },
            { selector: ".compose-before-to-tab-anchor", fn: this._onBeforeToFocus },
            { selector: ".compose-before-toccbcc-tab-anchor", fn: this._deleteButtonFocus },
            { selector: ".compose-after-toccbcc-tab-anchor", fn: this._onAfterToCcBccFocus },
            { selector: ".compose-after-bcc-tab-anchor", fn: this._onAfterBccFocus },
            { selector: ".compose-before-expand-tab-anchor", fn: this._onBeforeExpandButtonFocus },
            { selector: ".compose-to-subject-tab-anchor", fn: this._subjectFocus },
            { selector: ".compose-before-priority-tab-anchor", fn: this._onBeforePriorityFocus },
            { selector: ".compose-after-priority-tab-anchor", fn: this._onAfterPriorityFocus },
            { selector: ".compose-before-irm-tab-anchor", fn: this._onBeforeIrmFocus },
            { selector: ".compose-after-irm-tab-anchor", fn: this._onAfterIrmFocus },
            { selector: ".compose-before-subject-tab-anchor", fn: this._onBeforeSubjectFocus },
            { selector: ".compose-before-back-tab-anchor", fn: this._onBeforeBackButtonFocus },
            { selector: ".compose-after-back-tab-anchor", fn: this._onAfterBackButtonFocus },
            { selector: ".compose-before-newSnap-tab-anchor", fn: this._onBeforeButtonAreaFocus },
            { selector: ".compose-before-from-tab-anchor", fn: this._onBeforeFromFocus },
            { selector: ".compose-after-from-tab-anchor", fn: this._toAWFocus },
            { selector: ".compose-after-backSnap-tab-anchor", fn: this._onAfterBackButtonFocus },
            { selector: ".compose-before-backSnap-tab-anchor", fn: this._onBeforeBackButtonFocus },
            { selector: ".compose-after-deleteSnap-tab-anchor", fn: this._onAfterDeleteAnchorFocus },
            { selector: ".compose-before-new-tab-anchor", fn: this._onBeforeButtonAreaFocus },
            { selector: ".before-compose-tab-anchor", fn: this._bodyFocus }
        ];

        this._bindings = [];
        selectorsAndFunctions.forEach(function (obj) {
            var element = Compose.doc.querySelector(obj.selector);
            this._bindings.push(Compose.binder.attach(this, [{ on: "focus", from: element, then: obj.fn }])[0]);
        }.bind(this));
    };

    proto.composeDeactivateUI = function () {
        var composeWindow = Compose.ComposeImpl.getComposeWindow(this.getComponentCache());
        Debug.assert(Jx.isObject(composeWindow));

        composeWindow.removeEventListener("MSPointerDown", this._onMSPointerDown, true);
        composeWindow.removeEventListener("focus", this._onFocus, true);
        composeWindow.removeEventListener("beforedeactivate", this._onBeforeDeactivate, true);

        Compose.binder.detach(this._bindings);
        this._bindings = null;
    };

    // Private

    proto._onMSPointerDown = function (e) {
        /// <summary>Handles touch or mouse clicks inside Compose.</summary>
        /// <param name="e" type="Event">The MSPointerDown event.</param>
        // Mark the button as having been invoked via touch/mouse.
        e.target.setAttribute("data-focusfrompointer", "true");
    };

    proto._onFocus = function (e) {
        /// <summary>Handles focus events inside Compose.</summary>
        /// <param name="e" type="Event">The focus event.</param>
        // Focus sometimes jumps to the parent of the element that was actually clicked, so we 
        // move around the attribute as necessary.
        var clickedElement = e.target.querySelector("[data-focusfrompointer='true']");
        if (clickedElement) {
            clickedElement.removeAttribute("data-focusfrompointer");
            e.target.setAttribute("data-focusfrompointer", "true");
        }
    };

    proto._onBeforeDeactivate = function (e) {
        /// <summary>Handles before deactivate events inside Compose.</summary>
        /// <param name="e" type="Event">The before deactivate event.</param>
        // Remove the mark of having been invoked via touch/mouse, if it exists.
        e.target.removeAttribute("data-focusfrompointer");
    };

    proto._isSmallerView = function () {
        var width = Mail.guiState.width,
            ApplicationView = Jx.ApplicationView,
            ViewState = ApplicationView.State,
            state = ApplicationView.getStateFromWidth(width);
        
        return state === ViewState.snap || state === ViewState.minimum || state === ViewState.less || state === ViewState.more || state === ViewState.large;
    };

    proto._focusOnElementWithSelector = function (selector) {
        /// <param name="selector" type="String">The selector of an element on which to set focus</param>
        var element = Compose.doc.querySelector(selector);
        if (element) {
            element.focus();
        }
    };

    proto._onAfterDeleteAnchorFocus = function () {
        // Set focus on the last visible to/cc/bcc field
        var toCcBcc = this.getComponentCache().getComponent("Compose.ToCcBcc");
        Debug.assert(Jx.isObject(toCcBcc) && toCcBcc.isActivated());

        if (toCcBcc.isVisible("bcc")) {
            // Set focus on the bcc button
            this._focusOnElementWithSelector("#addressbarBccFieldLabel");
        } else if (toCcBcc.isVisible("cc")) {
            // Set focus on the cc button
            this._focusOnElementWithSelector("#addressbarCcFieldLabel");
        } else if (toCcBcc.isVisible("to")) {
            // Set focus on the to button
            this._focusOnElementWithSelector("#addressbarToFieldLabel");
        } else if(!this._focusOnComponentIfVisible("Compose.BackButton")) {
            // Set focus on the read-only header
            var readOnlyHeader = this.getComponentCache().getComponent("Compose.ReadOnlyHeader");
            Debug.assert(Jx.isObject(readOnlyHeader) && readOnlyHeader.isActivated() && readOnlyHeader.isVisible());
            readOnlyHeader.focus();
        }
    };

    proto._onBeforeToFocus = function () {
        // If the from control is visible, focus goes there
        var from = this.getComponentCache().getComponent("Compose.From");
        Debug.assert(Jx.isObject(from) && from.isActivated());
        if (from.isVisible()) {
            this._fromControlFocus();
        } else {
            // Next up would be the back button if it's visible
            if (!this._focusOnComponentIfVisible("Compose.BackButton")) {
                // Finally, set focus on the To people picker button
                this._toPickerFocus();
            }
        }
    };

    proto._onAfterBackButtonFocus = function () {
        // If the readonly header is visible, focus goes there
        if (!this._focusOnComponentIfVisible("Compose.ReadOnlyHeader")) {
            // Next is the from control
            var from = this.getComponentCache().getComponent("Compose.From");
            Debug.assert(Jx.isObject(from) && from.isActivated());
            if (from.isVisible()) {
                this._fromControlFocus();
            } else {
                // Set focus on the to line
                this._toAWFocus();
            }
        }
    };

    proto._fromControlFocus = function () {
        // Set focus on the from control
        Debug.assert(this.getComponentCache().getComponent("Compose.From").isVisible());
        this._focusOnElementWithSelector(".fromControl-wrapper");
    };

    proto._onBeforeReadOnlyHeaderFocus = function () {
        // Set focus on the back button if it exists
        if (!this._focusOnComponentIfVisible("Compose.BackButton")) {
            // Otherwise focus goes to the delete button
            this._deleteButtonFocus();
        }
    };

    proto._deleteButtonFocus = function () {
        var focusWasSet = this._focusOnComponentIfVisible("Compose.DeleteButton");
        Debug.assert(focusWasSet, "Delete button should always be visible in Compose.");
    };

    proto._onAfterToCcBccFocus = function () {
        // Set focus on the back button if it exists
        if (!this._focusOnComponentIfVisible("Compose.BackButton")) {
            // Set focus on from control if back button is currently hidden
            var from = this.getComponentCache().getComponent("Compose.From");
            Debug.assert(Jx.isObject(from) && from.isActivated());
            if (from.isVisible()) {
                this._fromControlFocus();
            } else {
                // Set focus on the to line if none of those are available
                this._toAWFocus();
            }
        }
    };

    proto._onBeforeBackButtonFocus = function () {
        var toCcBcc = this.getComponentCache().getComponent("Compose.ToCcBcc");
        Debug.assert(Jx.isObject(toCcBcc) && toCcBcc.isActivated());
        if (toCcBcc.isVisible("to")) {
            this._toPickerFocus();
        } else {
            this._deleteButtonFocus();
        }
    };

    proto._toPickerFocus = function () {
        // Set focus on the to button
        Debug.assert(this.getComponentCache().getComponent("Compose.ToCcBcc").isVisible("to"));
        this._focusOnElementWithSelector("#addressbarToFieldLabel");
    };

    proto._awFocus = function (type) {
        // Focus on the chosen address well
        var toCcBcc = this.getComponentCache().getComponent("Compose.ToCcBcc");
        Debug.assert(Jx.isObject(toCcBcc) && toCcBcc.isActivated() && toCcBcc.isVisible(type));
        toCcBcc.focus(type);
    };

    proto._toAWFocus = function () {
        this._awFocus("to");
    };

    proto._subjectFocus = function () {
        this._focusOnElementWithSelector(".composeSubjectLine");
    };

    proto._focusOnComponentIfVisible = function (componentName) {
        /// <summary>Sets focus on a given compose component if it is currently visible.</summary>
        /// <param name="componentName" type="String">The class name of the component to retrieve</param>
        /// <returns type="Boolean">True when focus was set on the component</returns>

        var component = this.getComponentCache().getComponent(componentName);
        Debug.assert(Jx.isObject(component) && component.isActivated());
        Debug.assert(Jx.isFunction(component.isVisible));
        Debug.assert(Jx.isFunction(component.focus));
        if (component.isVisible()) {
            component.focus();
            return true;
        }

        return false;
    };

    proto._onAfterBccFocus = function () {
        var component = this.getAfterBccFocusComponent();
        Debug.assert(Jx.isObject(component) && component.isActivated());
        Debug.assert(Jx.isFunction(component.focus));
        component.focus();
    };

    proto._getFirstVisibleComponent = function (componentNames) {
        Debug.assert(Jx.isArray(componentNames));

        var firstVisible = null;
        var componentCache = this.getComponentCache();

        componentNames.some(function (name) {
            var component = componentCache.getComponent(name);
            Debug.assert(Jx.isObject(component) && component.isActivated());
            Debug.assert(Jx.isFunction(component.isVisible));
            if (component.isVisible()) {
                firstVisible = component;
                return true;
            }
            return false;
        });
        return firstVisible;
    };

    proto.getAfterBccFocusComponent = function () {
        // Priority and permission switch places at a certain size
        if (!this._isSmallerView()) {
            // Permission goes first, then priority, then the "More" button.
            return this._getFirstVisibleComponent(["Compose.IrmChooser", "Compose.Priority", "Mail.ExpandButton"]);
        } else {
            // Priority goes first, then permission, then the "More" button
            return this._getFirstVisibleComponent(["Compose.Priority", "Compose.IrmChooser", "Mail.ExpandButton"]);
        }
    };

    proto._focusOnLowestAddressWell = function () {
        var toCcBcc = this.getComponentCache().getComponent("Compose.ToCcBcc");
        Debug.assert(Jx.isObject(toCcBcc) && toCcBcc.isActivated());
        if (toCcBcc.isVisible("bcc")) {
            toCcBcc.focus("bcc");
        } else {
            Debug.assert(toCcBcc.isVisible("cc"));
            toCcBcc.focus("cc");
        }
    };

    proto._onBeforePriorityFocus = function () {
        // Priority and permission switch places at a certain size
        if (!this._isSmallerView()) {
            // Permission goes first
            if (!this._focusOnComponentIfVisible("Compose.IrmChooser")) {
                // Permission is hidden, focus on lowest address well
                this._focusOnLowestAddressWell();
            }
        } else {
            // Priority goes first, so the bcc field is before it
            this._focusOnLowestAddressWell();
        }
    };

    proto._onAfterPriorityFocus = function () {
        // Priority and permission switch places at a certain size
        if (!this._isSmallerView()) {
            // Permission goes first, check for more link
            if (!this._focusOnComponentIfVisible("Mail.ExpandButton")) {
                // More link was hidden, jump to subject
                this._subjectFocus();
            }
        } else {
            // Priority goes first, irm field is next
            if (!this._focusOnComponentIfVisible("Compose.IrmChooser")) {
                // Permission is hidden, focus on more link
                if (!this._focusOnComponentIfVisible("Mail.ExpandButton")) {
                    // No more link, jump straight to subject
                    this._subjectFocus();
                }
            }
        }
    };

    proto._onBeforeIrmFocus = function () {
        // Priority and permission switch places at a certain size
        if (!this._isSmallerView() || !this._focusOnComponentIfVisible("Compose.Priority")) {
            // Permission goes first, focus on the lowest address well
            this._focusOnLowestAddressWell();
        }
    };

    proto._onAfterIrmFocus = function () {
        // Priority and permission switch places at a certain size
        if (!this._isSmallerView()) {
            // Permission goes first, so priority field is next
            if (!this._focusOnComponentIfVisible("Compose.Priority")) {
                // Priority was hidden, that means More link is next
                var focusWasSet = this._focusOnComponentIfVisible("Mail.ExpandButton");
                Debug.assert(focusWasSet, "Expected the More button to be visible if Priority is not");
            }
        } else {
            // Priority goes first, check for more link
            if (!this._focusOnComponentIfVisible("Mail.ExpandButton")) {
                // More link was hidden, jump to subject
                this._subjectFocus();
            }
        }
    };

    proto._onBeforeExpandButtonFocus = function () {
        // Priority and permission switch places at a certain size
        if (!this._isSmallerView()) {
            // Permission goes first, so priority is last
            if (!this._focusOnComponentIfVisible("Compose.Priority")) {
                // Priority is hidden, so try permission
                if (!this._focusOnComponentIfVisible("Compose.IrmChooser")) {
                    // No permission, so select the last address well
                    this._focusOnLowestAddressWell();
                }
            }
        } else {
            // Priority goes first, so permission is last
            if (!this._focusOnComponentIfVisible("Compose.IrmChooser")) {
                // Permission is hidden, so try priority
                if (!this._focusOnComponentIfVisible("Compose.Priority")) {
                    // No priority, so select the last address well
                    this._focusOnLowestAddressWell();
                }
            }
        }
    };

    proto._onBeforeSubjectFocus = function () {
        // If the read only header is visible, select the change link
        var focusWasSet,
            readOnlyHeader = this.getComponentCache().getComponent("Compose.ReadOnlyHeader");
        Debug.assert(Jx.isObject(readOnlyHeader) && readOnlyHeader.isActivated());
        if (readOnlyHeader.isVisible()) {
            this._focusOnElementWithSelector(".cmdEditHeader");
        } else {
            // If the more link is visible, select it
            if (!this._focusOnComponentIfVisible("Mail.ExpandButton")) {
                // Priority and permission switch places at a certain size
                if (!this._isSmallerView()) {
                    // Permission goes first, so priority is last
                    focusWasSet = this._focusOnComponentIfVisible("Compose.Priority");
                    Debug.assert(focusWasSet, "If read-only header and More button are hidden, priority should be visible.");
                } else {
                    // Priority goes first, permission is last
                    if (!this._focusOnComponentIfVisible("Compose.IrmChooser")) {
                        // Permission is hidden, focus on priority anyway
                        focusWasSet = this._focusOnComponentIfVisible("Compose.Priority");
                        Debug.assert(focusWasSet, "If read-only header and More button are hidden, priority should be visible.");
                    }
                }
            }
        }
    };

    proto._bodyFocus = function () {
        // Set focus on the body
        var body = this.getComponentCache().getComponent("Compose.BodyComponent");
        Debug.assert(Jx.isObject(body));
        body.focus();
    };
    
    proto._onBeforeFromFocus = function () {
        // Focus goes to the back button if it's visible
        if (!this._focusOnComponentIfVisible("Compose.BackButton")) {
            this._toPickerFocus();
        }
    };

    proto._onBeforeButtonAreaFocus = function () {
        if (Mail.guiState.isOnePane) {
            // In one pane mode, we want to wrap back around to the body
            this._bodyFocus();
        } else {
            // In two pane mode, we go back to the message list
            var messageListElement = document.getElementById("mailMessageListCollection");
            Debug.assert(!Jx.isNullOrUndefined(messageListElement));
            messageListElement.focus();
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Compose,Jx,Debug*/
/*jshint browser:true*/

Jx.delayGroup("MailCompose", function () {

    Compose.KeyboardResizer = /*@constructor*/function () {
        Compose.Component.call(this);

        this._inputPaneHandle = null;
        this._peekBarHeight = Jx.PeekBar.height;
        this._keyboardAdjusted = false;
        this._mainFrame = null;

        this._bindings = null;
        this._paused = false;
    };
    Jx.augment(Compose.KeyboardResizer, Compose.Component);

    Compose.util.defineClassName(Compose.KeyboardResizer, "Compose.KeyboardResizer");

    var proto = Compose.KeyboardResizer.prototype;

    proto.composeActivateUI = function () {
        var rootElement = this.getComposeRootElement();
        Debug.assert(Jx.isHTMLElement(rootElement));

        this._mainFrame = rootElement.querySelector(".composeContentScrollArea");
        Debug.assert(Jx.isHTMLElement(this._mainFrame));

        var inputPaneHandle = this._inputPaneHandle = Compose.InputPane.getForCurrentView();
        Debug.assert(Jx.isObject(inputPaneHandle));

        var currentKeyboardHeight = inputPaneHandle.occludedRect.height;
        if (currentKeyboardHeight > 0) {
            currentKeyboardHeight -= this._peekBarHeight;
            this._keyboardAdjusted = true;
        } else {
            this._keyboardAdjusted = false;
        }
        this._mainFrame.style.bottom = currentKeyboardHeight + "px";

        // Hook up listeners for the IHM
        this._bindings = Compose.binder.attach(this, [
            { on: "showing", from: inputPaneHandle, then: this._keyboardUp },
            { on: "hiding", from: inputPaneHandle, then: this._keyboardDown }
        ]);
    };

    proto.composeDeactivateUI = function () {
        Compose.binder.detach(this._bindings);
    };

    proto.pause = function () {
        Debug.assert(!this._paused, "Already paused");
        this._paused = true;
    };

    proto.resume = function () {
        Debug.assert(this._paused, "Not paused");
        this._paused = false;
        // Set the position we expected at the end of the animation
        var currentKeyboardHeight = this._inputPaneHandle.occludedRect.height;
        if (currentKeyboardHeight > 0) {
            currentKeyboardHeight -= this._peekBarHeight;
            this._keyboardAdjusted = true;
        } else {
            this._keyboardAdjusted = false;
        }
        this._mainFrame.style.bottom = currentKeyboardHeight + "px";
    };

    proto.isAdjustingForKeyboard = function () {
        return this._keyboardAdjusted;
    };

    // Private

    proto._keyboardUp = function (e) {
        /// <summary>Reacts to the IHM coming up by resizing the window appropriately. </summary>
        /// <param name="e" type="__InputPaneViewEvent" optional="false">The showing event from the IHM.</param>
        // Tell the IHM that we are taking care of ensuring the correct elements are in view        
        if (Mail.isElementOrDescendant(document.activeElement, document.getElementById(Mail.CompApp.rootElementId))) {
            e.ensuredFocusedElementInView = true;
        }

        if (this._paused) {
            return;
        }

        // Calculate new position
        var newPosition = (e.occludedRect.height - this._peekBarHeight) + "px";

        // Set the position we expect at the end of the animation
        this._mainFrame.style.bottom = newPosition;
        this._keyboardAdjusted = true;

        // Animate in time with the keyboad, and when finished
        // scroll the selection into view
        Compose.WinJsUI.executeAnimation(this._mainFrame, {
            property: "bottom",
            delay: 0,
            duration: 367,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            from: "0px",
            to: newPosition
        }).done(null, function (ex) {
            Debug.assert(false, "_keyboardUp animation failed: " + ex);
        });
    };

    proto._keyboardDown = function () {
        /// <summary>Reacts to the IHM going down by resizing the window appropriately. </summary>
        // Save start position
        if (this._paused) {
            return;
        }

        var startPosition = this._mainFrame.style.bottom;

        // Set the position we expect at the end of the animation
        this._mainFrame.style.bottom = "0px";
        this._keyboardAdjusted = false;

        // Animate in time with the keyboad
        Compose.WinJsUI.executeAnimation(this._mainFrame, {
            property: "bottom",
            delay: 0,
            duration: 367,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            from: startPosition,
            to: "0px"
        }).done(null, function (ex) {
            Debug.assert(false, "_keyboardDown animation failed: " + ex);
        });
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Compose,Debug,Mail*/

Jx.delayGroup("MailCompose", function () {

    Compose.HeaderController = function () {
        /// <summary>Manages the header state by manipulating CSS classes on the root element</summary>
        Compose.Component.call(this);

        this._currentState = null;
    };
    Jx.inherit(Compose.HeaderController, Jx.Events);
    Jx.augment(Compose.HeaderController, Compose.Component);

    Compose.util.defineClassName(Compose.HeaderController, "Compose.HeaderController");

    Compose.HeaderController.State = {
        readOnly: "header-readonly",
        editCondensed: "header-edit-condensed",
        editFull: "header-edit-full"
    };

    var proto = Compose.HeaderController.prototype;

    Debug.Events.define(proto, "changed");

    proto.composeUpdateUI = function () {
        var state = this.getDefaultState();
        this.changeState(state);
    };

    proto.changeState = function (newState) {
        /// <summary>Change to a new header state</summary>
        /// <param name="newState" type="String">Compose.HeaderController.State</param>
        if (this._currentState !== newState) {
            Compose.mark("HeaderController.changeState", Compose.LogEvent.start);

            // Store an object for the event we will be firing
            var event = {
                oldState: this._currentState,
                newState: newState
            };

            // Change the class name on the root element
            var composeWindow = Compose.ComposeImpl.getComposeWindow(this.getComponentCache());
            if (!Jx.isNullOrUndefined(this._currentState)) {
                composeWindow.classList.remove(this._currentState);
            }
            if (!Jx.isNullOrUndefined(newState)) {
                composeWindow.classList.add(newState);
            }
            this._currentState = newState;

            // Fire the changed event
            this.raiseEvent("changed", event);

            Compose.mark("HeaderController.changeState", Compose.LogEvent.stop);
        }
    };

    proto.getCurrentState = function () {
        return this._currentState;
    };

    proto.getDefaultState = function () {
        /// <summary>Returns the default state of the header given the values in the address wells</summary>
        var messageModel = this.getMailMessageModel(),
            to = messageModel.get("to"),
            cc = messageModel.get("cc"),
            bcc = messageModel.get("bcc"),
            toCcBccComponent = this.getComponentCache().getComponent("Compose.ToCcBcc"),
            allWellsEmpty = to.length === 0 && cc.length === 0 && bcc.length === 0;

        Debug.assert(Jx.isObject(toCcBccComponent));

        var headerState = Compose.HeaderController.State,
            state = null;
        if (toCcBccComponent.hasError("bcc")) {
            // When the bcc field has an error, go to full edit mode
            state = headerState.editFull;
        } else if (allWellsEmpty || toCcBccComponent.hasError("to") || toCcBccComponent.hasError("cc")) {
            // When all three address wells are empty or there is an error in the to or cc fields, go to condensed edit
            state = headerState.editCondensed;
        } else {
            // Otherwise go to read mode
            state = headerState.readOnly;
        }

        return state;
    };

    proto.setDefaultState = function () {
        /// <summary>Sets the default state of the header</summary>
        var headerState = Compose.HeaderController.State,
            state = this.getDefaultState();

        if (state !== this.getCurrentState()) {
            var changeStateFunction = function () {
                this.changeState(state);
            }.bind(this);

            if (state === headerState.readOnly) {
                // Save so that the readOnly header has updated info
                Compose.ComposeImpl.quietSave(this.getComponentCache()).done(changeStateFunction);
            } else {
                changeStateFunction();
            }
        }
    };

    // Private

    
    // Debug hook so tests can get the current header state
    Debug.HeaderController = {
        getHeaderState: function () {
            var compose = Mail.composeBuilder.getCurrent();
            if (compose) {
                var headerController = compose.getComponentCache().getComponent("Compose.HeaderController");
                if (headerController) {
                    return headerController.getCurrentState();
                }
            }

            return null;
        }
    };
    

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Compose,Mail,Debug*/

Jx.delayGroup("MailCompose", function () {

    Compose.ReadOnlyHeader = function () {
        Compose.Component.call(this);

        this._bindings = null;
        this._editButton = null;
        this._header = new Mail.HeaderControl(Mail.Utilities.ComposeHelper._selection);
        this._headerRootDiv = null;
        this._initializedHeader = false;
        this._headerControllerComponent = null;
        this._autoCollapsesHeader = false;
    };
    Jx.augment(Compose.ReadOnlyHeader, Compose.Component);

    Compose.util.defineClassName(Compose.ReadOnlyHeader, "Compose.ReadOnlyHeader");

    var proto = Compose.ReadOnlyHeader.prototype;

    proto.composeGetUI = function (ui) {
        ui.html = "<div class='composeReadOnlyHeader'></div>";
    };

    proto.composeActivateUI = function () {
        this._headerRootDiv = this.getComposeRootElement().querySelector(".composeReadOnlyHeader");
        Debug.assert(Jx.isHTMLElement(this._headerRootDiv));

        // We only need to initialize the header on the first activation
        if (!this._initializedHeader) {
            this._header.initialize(this._headerRootDiv);

            // Add the edit button to the header details div
            var detailsDiv = this._headerRootDiv.querySelector(".mailReadingPaneHeaderDetails");
            this._createEditButton(detailsDiv);

            this._initializedHeader = true;
        }

        this._bindings = this.getComponentBinder().attach(this, [
            { on: "aftercommit", fromComponent: Compose.ComponentBinder.messageModelClassName, then: this._onPlatformMessageChange },
            { on: "autoresolvecompleted", fromComponent: "Compose.ToCcBcc", then: this._onRecipientResolution },
            { on: "click", from: this._editButton, then: this._editHeader }
        ]);
    };

    proto.composeDeactivateUI = function () {
        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
    };

    proto.composeUpdateUI = function () {
        Debug.assert(Jx.isObject(this._headerRootDiv), "Expected header root div to be set.");

        // Hide all "hide on reload" elements
        var controls = this._headerRootDiv.querySelectorAll(".hideOnReload");
        for (var i = 0, max = controls.length; i < max; i++) {
            controls[i].classList.add("hidden");
        }

        var messageModel = this.getMailMessageModel();
        this._autoCollapsesHeader = true;
        if (messageModel.isCommitted()) {
            this._onPlatformMessageChange();
        }
        this._autoCollapsesHeader = false;

    };

    proto.isVisible = function () {
        // Only visible in the read-only state
        return this._getHeaderControllerComponent().getCurrentState() === Compose.HeaderController.State.readOnly;
    };

    proto.focus = function () {
        // Sets focus on the from recipient
        this._headerRootDiv.querySelector(".mailReadingPaneHeaderIC").focus();
    };

    // Private

    proto._createEditButton = function (div) {
        var editDiv = Compose.doc.createElement("div");
        Debug.assert(Jx.isHTMLElement(editDiv), "Unable to create edit div");
        editDiv.className = "editHeaderButtonParent";

        this._editButton = Compose.doc.createElement("button");
        Debug.assert(Jx.isHTMLElement(this._editButton), "Unable to create edit button");

        this._editButton.setAttribute("type", "button");
        this._editButton.className = "cmdEditHeader typeSizeNormal composeLinkButton";
        this._editButton.innerHTML = "<span data-win-res='innerText:composeEditLabel'>WChangeL</span>";

        editDiv.appendChild(this._editButton);
        div.appendChild(editDiv);
    };

    proto._onPlatformMessageChange = function () {
        // Re-display the data in the mail message
        var messageModel = this.getMailMessageModel(),
            fromRecipient = messageModel.get("fromRecipient"),
            fromArray = Jx.isNullOrUndefined(fromRecipient) ? [] : [fromRecipient],
            to = Mail.UIDataModel.MailItem.convertVectorToArray(messageModel.get("toRecipients")),
            cc = Mail.UIDataModel.MailItem.convertVectorToArray(messageModel.get("ccRecipients")),
            bcc = Mail.UIDataModel.MailItem.convertVectorToArray(messageModel.get("bccRecipients")),
            autoExpand = this._autoCollapsesHeader ? false : this._header.isExpanded();

        this._header.updateIrmInfo(messageModel.get("irmHasTemplate"), messageModel.get("irmTemplateName"), messageModel.get("irmTemplateDescription"));
        this._header.updateHeader(to, cc, bcc, fromArray, Jx.res.getString("mailUIMailMessageNoSender"), autoExpand, false /*preventCollapse*/, false /*isSent*/, null /*sender*/);
    };

    proto._getHeaderControllerComponent = function () {
        var headerController = this._headerControllerComponent;
        if (Jx.isNullOrUndefined(headerController)) {
            headerController = this._headerControllerComponent = this.getComponentCache().getComponent("Compose.HeaderController");
        }
        Debug.assert(Jx.isObject(headerController) && headerController.isActivated());
        
        return headerController;
    };

    proto._onRecipientResolution = function () {
        // When the header state is read only mode, we want to save so we can display new data
        var headerState = this._getHeaderControllerComponent().getCurrentState();

        if (headerState === Compose.HeaderController.State.readOnly) {
            Compose.ComposeImpl.quietSave(this.getComponentCache());
        }
    };

    proto._editHeader = function () {
        // Get the header object and change to edit mode
        this._getHeaderControllerComponent().changeState(Compose.HeaderController.State.editCondensed);

        // Set focus on the to line
        var toCcBcc = this.getComponentCache().getComponent("Compose.ToCcBcc");
        Debug.assert(Jx.isObject(toCcBcc) && toCcBcc.isActivated());
        toCcBcc.focus("to", true/*suppressAutoSuggest*/);
    };

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Compose, Debug*/

Jx.delayGroup("MailCompose", function () {

    Compose.Button = /*@constructor*/function () {
        Compose.Component.call(this);

        this._normalButton = /*@static_cast(HTMLElement)*/null;
        this._snapButton = /*@static_cast(HTMLElement)*/null;
    };
    Jx.augment(Compose.Button, Compose.Component);

    var proto = Compose.Button.prototype;

    // We don't implement the normal getUI or compseGetUI because we need to place UI in two different places.
    // Mail implements a component that brings all this html together itself.
    proto.getFullHTML = function () {
        /// <returns type="String">The HTML for the normal button</returns>
        Debug.assert(false, "NOT IMPL");
        return "";
    };
    proto.getSnapHTML = function () {
        /// <returns type="String">The HTML for the snap button</returns>
        Debug.assert(false, "NOT IMPL");
        return "";
    };

    // Subclasses should override the following two getters to return the IDs of their normal and snap buttons
    proto.getQuerySelector = function () {
        /// <returns type="String">The query selector of the normal button HTML element</returns>
        Debug.assert(false, "NOT IMPL");
        return "";
    };
    proto.getSnapQuerySelector = function () {
        /// <returns type="String">The query selector of the snap button HTML element</returns>
        Debug.assert(false, "NOT IMPL");
        return "";
    };

    // Subclasses should override this function to return the on-click handler for the button
    proto.getClickHandler = function () {
        /// <returns type="Function">The function to call when the button is clicked</returns>
        Debug.assert(false, "NOT IMPL");
        return function () { };
    };

    proto.composeActivateUI = function () {
        var rootElement = this.getComposeRootElement();
        Debug.assert(Jx.isObject(rootElement));

        this._normalButton = rootElement.querySelector(this.getQuerySelector());
        this._snapButton = rootElement.querySelector(this.getSnapQuerySelector());
        Debug.assert(Jx.isObject(this._normalButton));
        Debug.assert(Jx.isObject(this._snapButton));

        this._bindings = Compose.binder.attach(this, [
            { on: "click", from: this._normalButton, then: this.getClickHandler() },
            { on: "click", from: this._snapButton, then: this.getClickHandler() }
        ]);

        this.buttonActivateUI();
    };

    // This function will be called after the button is done hooking up its listeners
    // It can optionally be overridden by subclasses to do additional activation
    proto.buttonActivateUI = function () {
        
    };

    // This function will be called after the button is done tearing down its listeners
    // It can optionally be overridden by subclasses to do additional activation
    proto.buttonDeactivateUI = function () {

    };

    proto.composeDeactivateUI = function () {
        Compose.binder.detach(this._bindings);
        this._bindings = null;

        this.buttonDeactivateUI();
    };

    // Buttons are assumed to be always visible. Subclasses can override this when not true
    proto.isVisible = function () {
        return true;
    };

    proto.focus = function () {
        if (this.isActivated()) {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var button = this._normalButton;
            if (button.currentStyle.display === "none") {
                button = this._snapButton;
            }
            button.focus();
        }
    };

    proto.performClick = function () {
        this.getClickHandler().call(this);
    };

    // Private

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Compose, Mail, Debug*/

Jx.delayGroup("MailCompose", function () {

    Compose.BackButton = /*@constructor*/function () {
        Compose.Button.call(this);

        // We need to bind to some events in addition to the normal button ones
        this._extraBindings = null;
        this._hideKeyboardDisposer = null;
    };
    Jx.augment(Compose.BackButton, Compose.Button);

    Compose.util.defineClassName(Compose.BackButton, "Compose.BackButton");

    var proto = Compose.BackButton.prototype;

    // We don't implement the normal getUI or composeGetUI because we need to place UI in two different places.
    // Mail implements a component that brings all this html together itself.
    proto.getFullHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.backButton();
    };
    proto.getSnapHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.backButtonSnap();
    };

    proto.getQuerySelector = function () {
        return ".cmdBack";
    };

    proto.getSnapQuerySelector = function () {
        return ".cmdBackSnap";
    };

    proto.getClickHandler = function () {
        /// <returns type="Function">The function to call when the button is clicked</returns>
        return this._handleBack;
    };

    proto.buttonActivateUI = function () {
        this._extraBindings = Compose.binder.attach(this, [
            { on: "resize", from: window, then: this._updateVisibility }
        ]);
        this._hideKeyboardDisposer = new Mail.Disposer(
            new Mail.KeyboardDismisser(Compose.doc.querySelector(this.getQuerySelector())),
            new Mail.KeyboardDismisser(Compose.doc.querySelector(this.getSnapQuerySelector()))
        );
    };

    proto.buttonDeactivateUI = function () {
        Compose.binder.detach(this._extraBindings);
        this._extraBindings = null;
        Jx.dispose(this._hideKeyboardDisposer);
        this._hideKeyboardDisposer = null;
    };

    proto.show = function (visible) {
        /// <param name="visible" type="Boolean">show for true, hide for false</param>
        Jx.setClass(Compose.doc.querySelector(this.getQuerySelector()), "hidden", !visible);
        Jx.setClass(Compose.doc.querySelector(this.getSnapQuerySelector()), "hidden", !visible);
    };

    proto.isVisible = function () {
        return ((!Compose.doc.querySelector(this.getQuerySelector()).classList.contains("hidden") ||
            !Compose.doc.querySelector(this.getSnapQuerySelector()).classList.contains("hidden")) &&
            !Compose.doc.querySelector("#mailFrameReadingPaneSection").classList.contains("parentVisible"));
    };

    proto.composeUpdateUI = function () {
        this._updateVisibility();
    };

    // Private

    proto._handleBack = function () {
        if (Jx.glomManager.getIsParent()) {
            // In the parent window, animate back
            Debug.assert(Jx.isObject(Mail.Globals.animator));
            Mail.Globals.animator.animateNavigateBack();
        } else {
            // In a child window, save and close
            var helper = Mail.Utilities.ComposeHelper;
            helper.handleHomeButton();
        }
    };

    proto._updateVisibility = function () {
        // Only show the back button when mail is in one pane mode
        this.show(Mail.guiState.isOnePane);
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="components.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.AttachButton = /*@constructor*/function () {
        Compose.Button.call(this);
    };
    Jx.augment(Compose.AttachButton, Compose.Button);

    Compose.util.defineClassName(Compose.AttachButton, "Compose.AttachButton");

    var proto = Compose.AttachButton.prototype;

    // We don't implement the normal getUI or compseGetUI because we need to place UI in two different places.
    // Mail implements a component that brings all this html together itself.
    proto.getFullHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.attachButton();
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    };
    proto.getSnapHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.attachButtonSnap();
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    };

    proto.getQuerySelector = function () {
        return ".cmdAttach";
    };

    proto.getSnapQuerySelector = function () {
        return ".cmdAttachSnap";
    };

    proto.getClickHandler = function () {
        /// <returns type="Function">The function to call when the button is clicked</returns>
        return this._attachAnyFiles;
    };

    // Private

    proto._attachAnyFiles = function () {
        var attachmentWell = /*@static_cast(Compose.AttachmentWell)*/this.getComponentCache().getComponent("Compose.AttachmentWell");
        Debug.assert(Jx.isObject(attachmentWell));
        attachmentWell.attachAnyFiles();
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Compose,Jx,Debug*/

Jx.delayGroup("MailCompose", function () {

    Compose.DeleteButton = /*@constructor*/function () {
        Compose.Button.call(this);

        // We need to bind to some events in addition to the normal button ones
        this._extraBindings = null;
    };
    Jx.augment(Compose.DeleteButton, Compose.Button);

    Compose.util.defineClassName(Compose.DeleteButton, "Compose.DeleteButton");

    var proto = Compose.DeleteButton.prototype,
        Instr = Mail.Instrumentation;

    // We don't implement the normal getUI or composeGetUI because we need to place UI in two different places.
    // Mail implements a component that brings all this html together itself.
    proto.getFullHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.deleteButton();
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    };
    proto.getSnapHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.deleteButtonSnap();
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    };

    proto.getQuerySelector = function () {
        return ".cmdDelete";
    };

    proto.getSnapQuerySelector = function () {
        return ".cmdDeleteSnap";
    };

    proto.getClickHandler = function () {
        /// <returns type="Function">The function to call when the button is clicked</returns>
        return this._deleteAndExit;
    };

    proto.buttonActivateUI = function () {
        this._extraBindings = Compose.binder.attach(this, [
            { on: "messagesChanged", from: Mail.Utilities.ComposeHelper._selection, then: this._show }
        ]);
        this._show();
    };

    proto.composeUpdateUI = function () {
        this._show();
    };

    proto.buttonDeactivateUI = function () {
        Compose.binder.detach(this._extraBindings);
        this._extraBindings = null;
    };

    // Private

    proto._deleteAndExit = function () {
        var composeImpl = Compose.ComposeImpl.getComposeImpl(this.getComponentCache()),
            discard = function () {
                composeImpl.discard();
            };
        var selection = Mail.Utilities.ComposeHelper._selection,
            messages = selection.messages,
            drafts = messages.filter(function (msg) { return msg.hasDraft; }),
            draftCount = drafts.length,
            messageModel = this.getMailMessageModel();

        Debug.assert(messages.some(function (msg) { return msg.objectId === messageModel.get("objectId") || msg.objectId === messageModel.get("parentConversationId"); }));

        if (messages.length === 1) {
            // We don't need to show the prompt if there is only one draft and it is not dirty
            draftCount = composeImpl.isDirty() ? 1 : 0;
        }
        Mail.Commands.Handlers.deleteMessages(draftCount, discard, Instr.UIEntryPoint.onCanvas, selection);
    };

    proto._show = function () {
        var messageModel = this.getMailMessageModel(),
            objectId = messageModel.get("objectId"),
            message = Mail.Utilities.ComposeHelper._selection.message,
            enabled = objectId !== "0" && message && message.objectId === objectId;

        Compose.doc.querySelector(this.getQuerySelector()).disabled = !enabled;
        Compose.doc.querySelector(this.getSnapQuerySelector()).disabled = !enabled;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Compose, Mail, Debug*/

Jx.delayGroup("MailCompose", function () {

    Compose.SendButton = function () {
        Compose.Button.call(this);
    };
    Jx.augment(Compose.SendButton, Compose.Button);

    Compose.util.defineClassName(Compose.SendButton, "Compose.SendButton");

    var proto = Compose.SendButton.prototype;

    // We don't implement the normal getUI or composeGetUI because we need to place UI in two different places.
    // Mail implements a component that brings all this html together itself.
    proto.getFullHTML = function () {
        return Compose.Templates.sendButton();
    };

    proto.getSnapHTML = function () {
        return Compose.Templates.sendButtonSnap();
    };

    proto.getQuerySelector = function () {
        return ".cmdSend";
    };

    proto.getSnapQuerySelector = function () {
        return ".cmdSendSnap";
    };

    proto.getClickHandler = function () {
        /// <returns type="Function">The function to call when the button is clicked</returns>
        return this._sendMail;
    };

    // Private

    proto._sendMail = function () {
        Mail.writeProfilerMark("Compose.SendButton._sendMail", Mail.LogEvent.start);
        Compose.ComposeImpl.getComposeImpl(this.getComponentCache()).send().done(function (result) {
            Debug.assert(!Jx.isNullOrUndefined(result));
            if (result.success) {
                Mail.guiState.ensureNavMessageList();
            }
            Mail.writeProfilerMark("Compose.SendButton._sendMail", Mail.LogEvent.stop);
        });
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="components.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.NewButton = /*@constructor*/function () {
        Compose.Button.call(this);
    };
    Jx.augment(Compose.NewButton, Compose.Button);

    Compose.util.defineClassName(Compose.NewButton, "Compose.NewButton");

    var proto = Compose.NewButton.prototype;

    // We don't implement the normal getUI or composeGetUI because we need to place UI in two different places.
    // Mail implements a component that brings all this html together itself.
    proto.getFullHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.newButton();
    };
    proto.getSnapHTML = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return Compose.Templates.newButtonSnap();
    };

    proto.getQuerySelector = function () {
        return ".cmdNew";
    };

    proto.getSnapQuerySelector = function () {
        return ".cmdNewSnap";
    };

    proto.getClickHandler = function () {
        /// <returns type="Function">The function to call when the button is clicked</returns>
        return this._newClicked;
    };

    proto.composeUpdateUI = function () {
        var visible = Jx.glomManager.getIsParent();
        Jx.setClass(Compose.doc.querySelector(this.getQuerySelector()), "hidden", !visible);
        Jx.setClass(Compose.doc.querySelector(this.getSnapQuerySelector()), "hidden", !visible);
    };

    // Private

    proto._newClicked = function () {
        Mail.Utilities.ComposeHelper.onNewButton(Mail.Instrumentation.UIEntryPoint.onCanvas);
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="components.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Compose.WarningMessage = /*@constructor*/function () {
        Compose.Component.call(this);
    };
    Jx.augment(Compose.WarningMessage, Compose.Component);

    Compose.util.defineClassName(Compose.WarningMessage, "Compose.WarningMessage");

    var proto = Compose.WarningMessage.prototype;

    proto.composeGetUI = function (ui) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        ui.html = Compose.Templates.warningMessage();
    };

    proto.composeUpdateUI = function () {
        var messageDiv = Compose.doc.querySelector(".warningMessage"),
            messageModel = this.getMailMessageModel(),
            canEdit = messageModel.get("irmCanEdit"),
            canCopy = messageModel.get("irmCanExtractContent"),
            showAttachmentWarning = false;

        if (!canEdit || !canCopy) {
            var quotedMessage = Compose.mailMessageFactoryUtil.getSourceMessage(messageModel.getPlatformMessage());
            if (Boolean(quotedMessage) && quotedMessage.hasOrdinaryAttachments &&
                /*@static_cast(Number)*/messageModel.get("sourceVerb") === Microsoft.WindowsLive.Platform.MailMessageLastVerb.forward) {
                // We are forwarding a mail with attachments but they won't show up in the compose pane
                showAttachmentWarning = true;
            }
        }

        if (showAttachmentWarning) {
            messageDiv.innerText = Jx.res.getString("composeIrmAttachmentWarning");
        } else {
            messageDiv.innerText = "";
        }
        Jx.setClass(messageDiv, "hidden", !showAttachmentWarning);
    };

});
