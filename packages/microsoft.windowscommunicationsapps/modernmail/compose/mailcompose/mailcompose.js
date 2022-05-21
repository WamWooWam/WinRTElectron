
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Compose*/

Jx.delayGroup("MailCompose", function () {

    Mail.FullscreenComposeUI = /*@constructor*/function () {
        /// <summary>Handles UI layout for Mail compose</summary>
        /// <remarks>
        /// It would be ideal if we could handle the UI by just calling getUI on all the components and laying them out in the desired hierarchy.
        /// This has not been done, however, due to time constraints. This is a shortcut that allows us to migrate the old style compose html hierarchy
        /// directly over to the new component structure.
        /// </remarks>
        Compose.Component.call(this);
    };
    Jx.augment(Mail.FullscreenComposeUI, Compose.Component);

    Compose.util.defineClassName(Mail.FullscreenComposeUI, "Mail.FullscreenComposeUI");

    var proto = Mail.FullscreenComposeUI.prototype;

    Mail.FullscreenComposeUI.template = function (attachmentWell, backButton, sendButton, attachButton, deleteButton, newButton, componentCache) {
        return "" +
        '<div class="composeWindow">' +
            '<div class="before-compose-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
            '<div class="composeMainFrame">' +
                '<div class="composeEmojiAnchor"></div>' +
                '<div class="composeButtonArea">' +
                    '<div class="compose-before-back-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                    backButton.getFullHTML() +
                    '<div class="compose-after-back-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                    '<div class="composeFromArea">' +
                        '<div class="compose-before-from-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        Jx.getUI(componentCache.getComponent("Compose.From")).html +
                        '<div class="compose-after-from-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                    '</div>' +
                    '<div class="compose-before-new-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                    sendButton.getFullHTML() +
                    attachButton.getFullHTML() +
                    newButton.getFullHTML() +
                    deleteButton.getFullHTML() +
                    '<div class="compose-after-delete-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                    '<div class="composeSnapButtons">' +
                        '<div class="compose-before-backSnap-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        backButton.getSnapHTML() +
                        '<div class="compose-after-backSnap-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        '<div class="compose-before-newSnap-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        sendButton.getSnapHTML() +
                        attachButton.getSnapHTML() +
                        newButton.getSnapHTML() +
                        deleteButton.getSnapHTML() +
                        '<div class="compose-after-deleteSnap-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="composeContentScrollArea" aria-hidden="false">' +
                    '<div class="compose-before-readOnlyHeader-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                    Jx.getUI(componentCache.getComponent("Compose.ReadOnlyHeader")).html +
                    '<div class="composeAddressFieldArea">' +
                        '<div class="compose-before-to-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        '<div class="compose-after-toccbcc-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="5"></div>' +
                        Jx.getUI(componentCache.getComponent("Compose.ToCcBcc")).html +
                        '<div class="compose-before-toccbcc-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="1"></div>' +
                        '<div class="compose-after-bcc-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        '<div class="composeExtraFieldArea">' +
                            '<div class="compose-before-priority-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                            Jx.getUI(componentCache.getComponent("Compose.Priority")).html +
                            '<div class="compose-after-priority-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                            '<div class="compose-before-irm-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                            Jx.getUI(componentCache.getComponent("Compose.IrmChooser")).html +
                            '<div class="compose-after-irm-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        '</div>' +
                        '<div class="compose-before-expand-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        Jx.getUI(componentCache.getComponent("Mail.ExpandButton")).html +
                    '</div>' +
                    '<div class="composeContentArea">' +
                        '<div class="compose-to-subject-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        '<div class="compose-before-subject-tab-anchor compose-tab-anchor" aria-hidden="true" tabIndex="0"></div>' +
                        Jx.getUI(componentCache.getComponent("Compose.Subject")).html +
                        '<div class="composeLineDividerParent">' +
                            '<div class="composeLineDivider"></div>' +
                        '</div>' +
                        Jx.getUI(componentCache.getComponent("Compose.WarningMessage")).html +
                        attachmentWell.getAttachmentAreaHTML() +
                        Jx.getUI(componentCache.getComponent("Compose.BodyComponent")).html +
                    '</div>' +
                '</div>' +
            '</div>' +
            attachmentWell.getProgressBarHTML() +
        '</div>';
    };

    proto.composeGetUI = function (ui) {
        Compose.log("getUI", Compose.LogEvent.start);

        var componentCache = this.getComponentCache(),
            attachmentWell = /*@static_cast(Compose.AttachmentWell)*/componentCache.getComponent("Compose.AttachmentWell"),
            backButton = /*@static_cast(Compose.BackButton)*/componentCache.getComponent("Compose.BackButton"),
            sendButton = /*@static_cast(Compose.SendButton)*/componentCache.getComponent("Compose.SendButton"),
            attachButton = /*@static_cast(Compose.AttachButton)*/componentCache.getComponent("Compose.AttachButton"),
            deleteButton = /*@static_cast(Compose.DeleteButton)*/componentCache.getComponent("Compose.DeleteButton"),
            newButton = /*@static_cast(Compose.DeleteButton)*/componentCache.getComponent("Compose.NewButton");

        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        ui.html = Mail.FullscreenComposeUI.template(attachmentWell, backButton, sendButton, attachButton,
            deleteButton, newButton, componentCache);

        Compose.log("getUI", Compose.LogEvent.stop);
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="mailcompose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Mail.ValidationViewController = /*@constructor*/function () {
        /// <summary>
        /// Default validation view controller. Just fires a displayvalidstate event when we want the UI to display is validity state.
        /// </summary>
    };
    Jx.inherit(Mail.ValidationViewController, Jx.Events);

    var proto = Mail.ValidationViewController.prototype;

    Debug.Events.define(proto, "displayvalidstate");

    proto.display = function (invalidControls) {
        /// <param name="invalidControls" type="Array">Array of class names for invalid controls</param>
        Debug.assert(Jx.isArray(invalidControls));
        Debug.assert(invalidControls.length === 0 ||
            ["Compose.ToCcBcc", "Compose.BodyComponent", "Compose.AttachmentWell"].some(function (controlClassName) {
                return invalidControls.indexOf(controlClassName);
            }));

        var invalidControlsToUse = null;

        // In Mail, we only show one invalid state at a time.
        // Let's filter out all other invalid controls using the following hierarchy.
        if (invalidControls.length > 1) {
            var expectedInvalidControls = ["Compose.ToCcBcc", "Compose.BodyComponent", "Compose.AttachmentWell"];
            for (var i = 0; i < expectedInvalidControls.length; i++) {
                if (invalidControls.indexOf(expectedInvalidControls[i]) !== -1) {
                    invalidControlsToUse = [expectedInvalidControls[i]];
                    break;
                }
            }
            Debug.assert(Jx.isArray(invalidControlsToUse) && invalidControlsToUse.length > 0);
        } else {
            invalidControlsToUse = invalidControls;
        }

        this.raiseEvent("displayvalidstate", { invalidControls: invalidControlsToUse });
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Compose,WinJS*/

Jx.delayGroup("MailCompose", function () {

    Mail.ComposeActionHandler = /*@constructor*/function (animator) {
        /// <param name="animator" type="Object" optional="true">{ animateOut:function(componentCache) }</param>
        this._animator = animator;
    };

    Mail.ComposeActionHandler.instance = function (animator) {
        /// <param name="animator" type="Object" optional="true">{ animateOut:function(componentCache) }</param>
        return new Mail.ComposeActionHandler(animator);
    };

    var proto = Mail.ComposeActionHandler.prototype;

    proto.runAnimation = function (componentCache) {
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        var promise = WinJS.Promise.as(null);

        // clear the focus so we don't see the cursor during animation
        var activeElement = document.activeElement;
        if (activeElement) {
            activeElement.blur();
        }

        if (Jx.isObject(this._animator)) {
            Debug.assert(Jx.isFunction(this._animator.animateOut));
            promise = this._animator.animateOut(componentCache);
        }

        return promise;
    };

    proto.beforeAction = function (messageModel, componentCache) {
        /// <param name="messageModel" type="Compose.MailMessageModel"></param>
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        Debug.assert(Jx.isObject(messageModel));
        Debug.assert(Jx.isObject(componentCache));

        Compose.markAsync("closeCompose", Compose.LogEvent.start);

        var autoSaver = componentCache.getComponent("Compose.AutoSaver");
        if (autoSaver) {
            autoSaver.clear();
        }
    };

    proto.afterAction = function () {
        var composeBuilder = /*@static_cast(Mail.ComposeBuilder)*/Mail.composeBuilder,
            fullScreenComposeBuilder = composeBuilder.getFullscreenComposeBuilder();
        Debug.assert(fullScreenComposeBuilder);

        // In some cases, the mail message might have been committed even though it wasn't changed; delete it here
        var compose = fullScreenComposeBuilder.getCurrent();
        Debug.assert(Jx.isObject(compose));
        var model = /*@static_cast(Compose.MailMessageModel)*/compose.getMailMessageModel();
        if (model.isNew() && model.isCommitted() && !model.isSent() && !compose.isDirty() &&
            Jx.glomManager.getIsParent() && !Jx.glomManager.isGlomOpen(model.get("objectId"))) {
            model.deletePlatformMessage();
        }

        // Close compose
        fullScreenComposeBuilder.closeCurrent();

        Compose.markAsync("closeCompose", Compose.LogEvent.stop);
    };

    // Save
    Mail.ComposeSaveActionHandler = {
        instance: function () {
            return Mail.ComposeActionHandler.instance();
        }
    };

    // Send
    Mail.ComposeSendActionHandler = {
        instance: function (animator) {
            /// <param name="animator" type="Object" optional="true">{ animateOut:function(componentCache) }</param>
            return Mail.ComposeActionHandler.instance(animator);
        }
    };

    // Discard
    Mail.ComposeDiscardActionHandler = {
        instance: function (animator) {
            /// <param name="animator" type="Object" optional="true">{ animateOut:function(componentCache) }</param>
            return Mail.ComposeActionHandlerAggregator.instance([
                {
                    beforeAction: function (messageModel, componentCache) {
                        /// <param name="messageModel" type="Compose.MailMessageModel"></param>
                        /// <param name="componentCache" type="Compose.ComponentCache"></param>
                        Debug.assert(Jx.isObject(messageModel));
                        Debug.assert(Jx.isObject(componentCache));

                        var attachmentWell = /*@static_cast(Compose.AttachmentWell)*/componentCache.getComponent("Compose.AttachmentWell");
                        if (Jx.isObject(attachmentWell)) {
                            attachmentWell.discard();
                        }
                    }
                },
                Mail.ComposeActionHandler.instance(animator)
            ]);
        }
    };
    
});

Jx.delayGroup("MailCompose", function () {

    Mail.ComposeActionHandlerAggregator = /*@constructor*/function (actionHandlers) {
        /// <param name="actionHandlers" type="Array"></param>
        Debug.assert(Jx.isArray(actionHandlers));
        this._actionHandlers = actionHandlers;
    };

    Mail.ComposeActionHandlerAggregator.instance = function (actionHandlers) {
        /// <param name="actionHandlers" type="Array"></param>
        Debug.assert(Jx.isArray(actionHandlers));
        return new Mail.ComposeActionHandlerAggregator(actionHandlers);
    };

    Mail.ComposeActionHandlerAggregator.prototype = {
        beforeAction: function (messageModel, componentCache) {
            /// <param name="messageModel" type="Compose.MailMessageModel"></param>
            /// <param name="componentCache" type="Compose.ComponentCache"></param>
            return this._callHandlers("beforeAction", messageModel, componentCache);
        },

        afterAction: function (messageModel, componentCache) {
            /// <param name="messageModel" type="Compose.MailMessageModel"></param>
            /// <param name="componentCache" type="Compose.ComponentCache"></param>
            return this._callHandlers("afterAction", messageModel, componentCache);
        },

        runAnimation: function (componentCache) {
            /// <param name="componentCache" type="Compose.ComponentCache"></param>
            var promises = [];
            this._actionHandlers.filter(function (actionHandler) {
                /// <param name="actionHandler" type="Compose.ActionHandler"></param>
                return Jx.isFunction(actionHandler.runAnimation);
            }).forEach(function (actionHandler) {
                /// <param name="actionHandler" type="Compose.ActionHandler"></param>
                promises.push(actionHandler.runAnimation(componentCache));
            });

            return WinJS.Promise.join(promises);
        },
        
        _callHandlers: function (fnName, messageModel, componentCache) {
            /// <param name="fnName" type="String"></param>
            /// <param name="messageModel" type="Compose.MailMessageModel"></param>
            /// <param name="componentCache" type="Compose.ComponentCache"></param>
            Debug.assert(["beforeAction", "afterAction"].indexOf(fnName) !== -1);
            Debug.assert(Jx.isObject(messageModel));
            Debug.assert(Jx.isObject(componentCache));

            this._actionHandlers.filter(function (actionHandler) {
                /// <param name="actionHandler" type="Compose.ActionHandler"></param>
                return Jx.isFunction(actionHandler[fnName]);
            }).forEach(function (actionHandler) {
                /// <param name="actionHandler" type="Compose.ActionHandler"></param>
                actionHandler[fnName](messageModel, componentCache);
            });
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Mail, Compose, Debug, WinJS, Microsoft*/

Jx.delayGroup("MailCompose", function () {

    Mail.ComposeAnimators = /*@constructor*/function (rootElement, closeCommand) {
        /// <param name="rootElement" type="HTMLElement"></param>
        /// <param name="closeCommand" type="Microsoft.WindowsLive.Instrumentation.Ids.Mail">The kind of way in which compose is being closed.</param>
        Debug.assert(Jx.isObject(rootElement));
        Debug.assert(Jx.isNumber(closeCommand));

        this._rootElement = rootElement;
        this._closeCommand = closeCommand;
    };

    var proto = Mail.ComposeAnimators.prototype;

    proto.animateOut = function (componentCache) {
        /// <summary>Animates the closing of the compose window.</summary>
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        Debug.assert(Jx.isObject(componentCache));

        Compose.log("animateOut", Compose.LogEvent.start);
        var closeCommand = this._closeCommand;

        // Note: _animateOut knows a lot about internals of the MailCompose implementation
        // This isn't ideal, but given that it's very specific to the given mail compose impl, not a huge deal.
        var mainFrame = document.getElementById("idCompCompose"),
            emojiAnchor = document.querySelector(".composeEmojiAnchor");

        // Prep the DOM to ensure animations execute independently
        Mail.composeUtil.prepareForAnimation(componentCache, mainFrame, emojiAnchor);

        
        // If this is not WWA, then don't bother since we don't have access to bici
        if (Jx.isWWA) {
            
            Jx.bici.increment(closeCommand, 1);
            
        }
        

        // Save a reference to the composeImpl right now because it may not be ava
        var composeImpl = /*@static_cast(Compose.ComposeImpl)*/componentCache.getComponent("Compose.ComposeImpl");
        Debug.assert(composeImpl);

        return new WinJS.Promise(function (onComplete) {
            // Define completion handlers
            var onSuccess = function () {
                // Fire close event to let Mail Consume start animating in.
                // Mail listens on the compose itself, so fire it off of that object.
                Compose.mark("animateOut_done", Compose.LogEvent.start);
                onComplete();
                Compose.mark("animateOut_done", Compose.LogEvent.stop);
            },
            onError = function (e) {
                /// <summary>Handles an error during the transition out animation by logging the error but continuing on with the completion code.</summary>
                Jx.log.error("Animation out failed during execution with error: " + e);
                Debug.assert(false, "Animation out failed during execution with error: " + e);
                onSuccess();
            };

            try {
                var animationPromise;

                // Perform calculations needed for the slide animation
                // NOTE: Although we would normally use the -ms-transform property here to move the element, we can not because
                // we are already transitioning this attribute in the scaling section of animation
                var exitFrame,
                    finalTransformValue;
                if (closeCommand === Microsoft.WindowsLive.Instrumentation.Ids.Mail.composeCommandSend) {
                    exitFrame = "composeExitUp";
                    finalTransformValue = "matrix(0.75, 0.0, 0.0, 0.75, 0, -500)";
                } else {
                    exitFrame = "composeExitDown";
                    finalTransformValue = "matrix(0.75, 0.0, 0.0, 0.75, 0, 500)";
                }

                // Apply the value that should be maintained after this animation is finished
                mainFrame.style.msTransform = finalTransformValue;
                mainFrame.style.opacity = "0";

                // Build the complete animation promise
                animationPromise = Compose.WinJsUI.executeAnimation(mainFrame, {
                    property: "transform",
                    delay: 0,
                    duration: 532,
                    timing: "linear",
                    keyframe: exitFrame
                });
                animationPromise.done(onSuccess, onError);
            } catch (err) {
                // If we failed to execute the animation, still go ahead and continue on.
                Jx.log.error("Animation out failed with error: " + err);
                Debug.assert(false, "Animation out failed with error: " + err);
                onSuccess();
            }

            Compose.log("animateOut", Compose.LogEvent.stop);
        });
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="mailcompose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Mail.BodyError = /*@constructor*/function () {
        /// <summary>Handles showing body/canvas errors for the mail app</summary>
        Compose.Component.call(this);

        this._bindings = null;
        this._sendButton = /*@static_cast(HTMLElement)*/null;
        this._canvasErrorFlyout = /*@static_cast(WinJS.UI.Flyout)*/null;
    };
    Jx.augment(Mail.BodyError, Compose.Component);

    Compose.util.defineClassName(Mail.BodyError, "Mail.BodyError");

    var proto = Mail.BodyError.prototype;

    proto.composeActivateUI = function () {
        var rootElement = this.getComposeRootElement();
        Debug.assert(Jx.isObject(rootElement));

        this._sendButton = rootElement.querySelector(".cmdSend");
        this._sendButtonSnap = rootElement.querySelector(".cmdSendSnap");

        this._bindings = this.getComponentBinder().attach(this, [
            { on: "displayvalidstate", fromComponent: Compose.ComponentBinder.validationViewControllerClassName, then: this._displayValidState }
        ]);
    };

    proto.composeDeactivateUI = function () {
        this.getComponentBinder().detach(this._bindings);
    };

    // Private

    proto._displayValidState = function (/*@dynamic*/ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(Jx.isArray(ev.invalidControls));
        if (ev.invalidControls.indexOf("Compose.BodyComponent") !== -1) {

            // First determine which send button is visible
            var anchor = this._sendButton;
            if (anchor.currentStyle.display === "none") {
                anchor = this._sendButtonSnap;
            }

            // Create the error flyout if it doesn't yet exist
            if (Jx.isNullOrUndefined(this._canvasErrorFlyout)) {
                // Create the main flyout element
                var canvasErrorFlyoutElement = Compose.doc.createElement("div");
                canvasErrorFlyoutElement.id = "canvasErrorFlyout";
                canvasErrorFlyoutElement.className = "compose-flyout";
                canvasErrorFlyoutElement.innerText = Jx.res.getString("composeCanvasError");

                // Add the element to the DOM
                var composeWindow = Compose.ComposeImpl.getComposeWindow(this.getComponentCache());
                Debug.assert(Jx.isObject(composeWindow));
                composeWindow.appendChild(canvasErrorFlyoutElement);

                // Turn the element into a full flyout
                this._canvasErrorFlyout = new Compose.WinJsUI.Flyout(canvasErrorFlyoutElement);
            }

            // Launch the flyout
            this._canvasErrorFlyout.show(anchor, "bottom", "center");
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Compose,Jx,Debug,Microsoft,WinJS*/

Jx.delayGroup("MailCompose", function () {

    Mail.ComposeBuilder = /*@constructor*/function () {
        this._fullscreenComposeBuilder = /*@static_cast(Compose.ComposeBuilder)*/null;
        this._currentComposeBuilder = /*@static_cast(Compose.ComposeBuilder)*/null;

        this._validationViewController = /*@static_cast(Compose.ValidationViewController)*/null;
    };

    Mail.ComposeBuilder.instance = function () {
        return new Mail.ComposeBuilder();
    };

    var proto = Mail.ComposeBuilder.prototype;

    proto.getCurrent = function () {
        /// <summary>Returns the current composeimpl if there is one</summary>
        var currentCompose = null;

        var currentComposeBuilder = this._currentComposeBuilder;
        if (Boolean(currentComposeBuilder)) {
            currentCompose = this._currentComposeBuilder.getCurrent();
        }

        return currentCompose;
    };

    proto.getFullscreenComposeBuilder = function () {
        return this._getFullscreenComposeBuilder();
    };

    proto.hideFullscreenCompose = function () {
        this._getFullscreenRoot().classList.add("hidden");
    };

    proto.unhideFullscreenCompose = function () {
        this._getFullscreenRoot().classList.remove("hidden");
    };

    proto.createBackgroundCompose = function () {
        /// <summary>
        /// Creates a compose instance hidden from view.
        /// Used to precache all of our html and js components so we will open quickly on first run.
        /// </summary>

        return this._buildFullscreen(/*@static_cast(Compose.ComposeBuilderSpec)*/{
            components: this._getFullScreenComponents(),
            validationViewController: this._getValidationViewController(),
            mailMessageModel: Compose.MailMessageModel.stubInstance()
        });
    };

    function _createMessageModel(/*@dynamic*/spec) {
        /// <param name="spec" type="Object"></param>

        var messageModel = spec.messageModel;
        if (!messageModel) {
            messageModel = Mail.getComposeMessageModelFactory().build(spec.factorySpec);
        }
        Debug.assert(Boolean(messageModel));

        return messageModel;
    }

    proto.createFullScreenCompose = function (/*@dynamic*/spec) {
        /// <summary>Creates a fullscreen compose experience</summary>
        /// <param name="spec" type="Object" optional="true"></param>
        /// <returns type="Compose.ComposeImpl"></returns>
        spec = spec || {};

        this.unhideFullscreenCompose();

        var messageModel = spec.messageModel || _createMessageModel(spec),
            compose = this._buildFullscreen(this._augmentFullScreenSpec(
                /*@static_cast(Compose.ComposeBuilderSpec)*/{
                    mailMessageModel: messageModel
                })
            );

        this._currentComposeBuilder = this._fullscreenComposeBuilder;
        return compose;
    };

    proto.showCompose = function (spec, suppressPerfTrack) {
        var compose = this._currentComposeBuilder.getCurrent();

        // Now run the enter animation
        this.unhideFullscreenCompose();
        Mail.Utilities.ComposeHelper.setComposeShowing(true);
        return this._runFullScreenEnterAnimation(compose.getComponentCache(), spec.factorySpec.initAction, spec.factorySpec.moveFocus, suppressPerfTrack);
    };

    proto.ensureFullscreenInDOM = function (compose) {
        /// <param name="compose" type="Compose.ComposeImpl"></param>
        Debug.assert(Jx.isObject(compose));

        this.ensureFullscreenInDOM = Jx.fnEmpty;

        var uiComponent = /*@static_cast(Jx.Component)*/compose.getComponentCache().getComponent("Mail.FullscreenComposeUI");
        this._getFullscreenRoot().innerHTML = Jx.getUI(uiComponent).html;
    };

    proto.getFullscreenRoot = function () {
        return this._getFullscreenRoot();
    };

    // Private

    proto._buildFullscreen = function (buildSpec) {
        /// <param name="buildSpec" type="Compose.ComposeBuilderSpec"></param>
        Debug.assert(Jx.isObject(buildSpec));

        var builder = this._getFullscreenComposeBuilder(),
            compose = builder.build(buildSpec);
        this.ensureFullscreenInDOM(compose);

        builder.activateCurrent();

        return compose;
    };

    proto._augmentFullScreenSpec = function (spec) {
        /// <param name="spec" type="Compose.ComposeBuilderSpec"></param>
        Debug.assert(Jx.isObject(spec));

        spec.components = this._getFullScreenComponents();
        spec.validationViewController = this._getValidationViewController();
        spec.actionHandlers = this._getFullScreenActionHandlers(Mail.getComposeActionHandlerFactory().build(spec.mailMessageModel));

        return spec;
    };

    proto._getBaseFullScreenActionHandlers = function () {
        /// <returns type="Compose.ActionHandlersSpec"></returns>
        var instrumentationIds = Microsoft.WindowsLive.Instrumentation.Ids.Mail,
            root = this._getFullscreenRoot(),
            actionHandlers = {
                save: Mail.ComposeSaveActionHandler.instance(),
                hideCurrent: Mail.ComposeSaveActionHandler.instance(), // hideCurrent uses the save action handler
                send: Mail.ComposeSendActionHandler.instance(/*@static_cast(Object)*/new Mail.ComposeAnimators(root, instrumentationIds.composeCommandSend)),
                discard: Mail.ComposeDiscardActionHandler.instance(/*@static_cast(Object)*/new Mail.ComposeAnimators(root, instrumentationIds.composeCommandDiscard))
            };

        this._getBaseFullScreenActionHandlers = function () {
            return /*@static_cast(Compose.ActionHandlersSpec)*/actionHandlers;
        };
        return this._getBaseFullScreenActionHandlers();
    };

    var _aggregateActionHandlers = function (actionHandler1, actionHandler2) {
        /// <param name="actionHandler1" type="Compose.ActionHandler"></param>
        /// <param name="actionHandler2" type="Compose.ActionHandler">Can be null</param>
        Debug.assert(Jx.isObject(actionHandler1));
        return !Boolean(actionHandler2) ? actionHandler1 : Mail.ComposeActionHandlerAggregator.instance([actionHandler1, actionHandler2]);
    };

    var _aggregateActionHandlerSpecs = function (baseActionHandlers, customActionHandlers) {
        /// <param name="baseActionHandlers" type="Compose.ActionHandlerSpec"></param>
        /// <param name="customActionHandlers" type="Compose.ActionHandlerSpec"></param>
        /// <returns type="Compose.ActionHandlersSpec"></returns>
        Debug.assert(Jx.isObject(baseActionHandlers));
        Debug.assert(Jx.isObject(customActionHandlers));

        return /*@static_cast(Compose.ActionHandlersSpec)*/{
            save: _aggregateActionHandlers(baseActionHandlers.save, customActionHandlers.save),
            send: _aggregateActionHandlers(baseActionHandlers.send, customActionHandlers.send),
            discard: _aggregateActionHandlers(baseActionHandlers.discard, customActionHandlers.discard)
        };
    };

    proto._getFullScreenActionHandlers = function (actionHandlersSpec) {
        /// <param name="actionHandlersSpec" type="Compose.ActionHandlersSpec"></param>
        /// <returns type="Compose.ActionHandlersSpec"></returns>
        return _aggregateActionHandlerSpecs(this._getBaseFullScreenActionHandlers(), actionHandlersSpec || /*@static_cast(Compose.ActionHandlersSpec)*/{});
    };

    proto._getFullScreenComponents = function () {
        var components = [
            Mail.FullscreenComposeUI, Compose.Subject, Compose.IrmChooser, // IrmChooser needs to be included before From and BodyComponent so that account changes between drafts don't affect the IrmChooser
            Compose.HeaderController, Compose.ReadOnlyHeader, Compose.ToCcBcc, Compose.From, Compose.AttachmentWell, Compose.Priority, Compose.BodyComponent,
            Mail.ExpandButton, Compose.KeyboardResizer, Mail.KeyboardShortcutHandler, Compose.BackButton, Compose.DeleteButton, Compose.AttachButton, Compose.SendButton, Compose.NewButton,
            Compose.AutoSaver, Mail.BodyError, Compose.DOMFocus, Mail.ComposeSizeUpdater, Mail.IrmManager, Compose.WarningMessage,
            Compose.Selection,

            // Ensure this component is last so is can do all of its instrumentation reporting after all other components are
            // done with their save operations.
            Mail.ComposeInstrumentation
        ];
        this._getFullScreenComponents = function () { return components; };
        return this._getFullScreenComponents();
    };

    proto._getFullscreenRoot = function () {
        var root = Compose.doc.getElementById("idCompCompose");
        this._getFullscreenRoot = function () { return root; };

        return this._getFullscreenRoot();
    };

    proto._getFullscreenComposeBuilder = function () {
        /// <returns type="Compose.ComposeBuilder"></returns>
        var builder = this._fullscreenComposeBuilder = Compose.ComposeBuilder.instance();
        builder.setRootElement(this._getFullscreenRoot());

        this._getFullscreenComposeBuilder = function () { return this._fullscreenComposeBuilder; };
        return this._getFullscreenComposeBuilder();
    };

    proto._getValidationViewController = function () {
        this._validationViewController = /*@static_cast(Compose.ValidationViewController)*/new Mail.ValidationViewController();

        this._getValidationViewController = function () { return this._validationViewController; };
        return this._getValidationViewController();
    };

    proto._runFullScreenEnterAnimation = function (componentCache, initAction, moveFocus, suppressPerfTrack) {
        /// <param name="componentCache" type="Compose.ComponentCache"></param>
        /// <param name="isNewDraft" type="Boolean" optional="true"></param>
        Debug.assert(componentCache);

        Compose.log("fullScreenAnimation", Compose.LogEvent.start);

        var mainFrame = document.getElementById("idCompCompose"),
            emojiAnchor = document.querySelector(".composeEmojiAnchor"),
            isNewDraft = initAction !== Compose.ComposeAction.openDraft,
            promise = null;

        Mail.composeUtil.prepareForAnimation(componentCache, mainFrame, emojiAnchor);

        mainFrame.style.msTransform = "";
        mainFrame.style.opacity = "";

        var that = this,
            onAnimationComplete = function () {
            // It is possible to close compose before the animation completes, so make sure it's still open before we proceed
            if (Jx.isObject(Compose.ComposeImpl.getComposeImpl(componentCache))) {
                if (isNewDraft || moveFocus || Jx.glomManager.getIsChild()) {
                    if (Jx.glomManager.getIsChild()) {
                        // Focus in child windows needs to happen after the window creation sets focus.
                        Jx.scheduler.addJob(null, Mail.Priority.focusCompose, "initial focus of compose", Mail.composeUtil.setInitialFocus, null, [componentCache, isNewDraft ? initAction : null, suppressPerfTrack]);
                    } else {
                        Mail.composeUtil.setInitialFocus(componentCache, isNewDraft ? initAction : null, suppressPerfTrack);
                    }
                }

                if (isNewDraft) {

                    var compose = that._currentComposeBuilder.getCurrent(),
                        messageModel = compose.getMailMessageModel(),
                        objectId = messageModel.get("objectId"),
                        selection = Mail.Utilities.ComposeHelper._selection;

                    // If the thread is currently collapsed then the MessageList won't have changed selection so we need to
                    if (!Jx.isNullOrUndefined(selection.message) && (selection.message.objectId !== objectId)) {
                        var platformMessage = messageModel.getPlatformMessage(),
                            account = Mail.Account.load(platformMessage.accountId, Compose.platform),
                            uiMailMessage = new Mail.UIDataModel.MailMessage(platformMessage, account);
                        selection.updateMessages(uiMailMessage, -1, [uiMailMessage]);
                    }
                }

                var toCcBcc = componentCache.getComponent("Compose.ToCcBcc");
                Debug.assert(!Jx.isNullOrUndefined(toCcBcc));
                toCcBcc.onEntranceComplete();

                Mail.composeUtil.restoreFromAnimation(componentCache, mainFrame, emojiAnchor);
            }
            Compose.log("fullScreenAnimation", Compose.LogEvent.stop);
        };

        if (isNewDraft) {
            promise = WinJS.UI.Animation.enterContent(mainFrame).then(onAnimationComplete);
        } else {
            // For existing drafts run completion logic without the animation
            promise = WinJS.Promise.as(onAnimationComplete());
        }

        return promise;
    };

    Mail.composeBuilder = Mail.ComposeBuilder.instance();

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Compose, Debug*/

Jx.delayGroup("MailCompose", function () {

    Mail.ComposeUtil = function () {
    };

    Mail.ComposeUtil.ptScenarioToString = {};
    Mail.ComposeUtil.ptScenarioToString[Compose.ComposeAction.createNew] = "Compose-NewMail";
    Mail.ComposeUtil.ptScenarioToString[Compose.ComposeAction.reply] = "Compose-Reply";
    Mail.ComposeUtil.ptScenarioToString[Compose.ComposeAction.replyAll] = "Compose-ReplyAll";
    Mail.ComposeUtil.ptScenarioToString[Compose.ComposeAction.forward] = "Compose-Forward";

    Mail.ComposeUtil.prototype = {

        prepareForAnimation: function (componentCache, mainFrame, emojiAnchor) {
            /// <summary>Makes any temporary changes needed for animations such as ensuring that animation can execute independently.</summary>
            /// <param name="componentCache" type="Compose.ComponentCache"></param>
            /// <param name="mainFrame" type="HTMLElement"></param>
            /// <param name="emojiAnchor" type="HTMLElement"></param>
            Compose.mark("prepareForAnimation", Compose.LogEvent.start);

            Debug.assert(mainFrame.style.position === "" || mainFrame.style.position === "absolute", "Expected MainFrame inlined style to be blank or already set to 'absolute'.");

            mainFrame.style.position = "absolute";
            emojiAnchor.style.position = "";

            var body = componentCache.getComponent("Compose.BodyComponent"),
                subject = componentCache.getComponent("Compose.Subject");
            Debug.assert(Jx.isObject(body));
            Debug.assert(Jx.isObject(subject));
            body.prepareForAnimation();
            subject.pauseScrollingIntoView();

            Compose.mark("prepareForAnimation", Compose.LogEvent.stop);
        },

        restoreFromAnimation: function (componentCache, mainFrame, emojiAnchor) {
            /// <summary>Reverts any temporary changes that were made</summary>
            /// <param name="mainFrame" type="HTMLElement"></param>
            /// <param name="emojiAnchor" type="HTMLElement"></param>
            Debug.assert(Jx.isObject(mainFrame));

            Compose.mark("restoreFromAnimation", Compose.LogEvent.start);

            mainFrame.style.position = "";
            emojiAnchor.style.position = "-ms-device-fixed";

            var body = componentCache.getComponent("Compose.BodyComponent"),
                subject = componentCache.getComponent("Compose.Subject");
            Debug.assert(Jx.isObject(body));
            Debug.assert(Jx.isObject(subject));
            body.restoreFromAnimation();
            subject.resumeScrollingIntoView();

            Compose.mark("restoreFromAnimation", Compose.LogEvent.stop);
        },

        setInitialFocus: function (componentCache, initAction, suppressPerfTrack) {
            /// <summary>Sets initial focus for mail compose</summary>
            /// <param name="componentCache" type="Compose.ComponentCache"></param>
            /// <summary>
            /// Sets focus to the right field based on following rules, in order.
            /// 1. If focus has already been placed by the user, leave it alone
            /// 2. If To is empty, focus is set to To box.
            /// 3. If Subject is empty, focus is set to subject
            /// 4. Focus set to mail canvas
            /// </summary>
            Mail.writeProfilerMark("ComposeUtil.setInitialFocus", Mail.LogEvent.start);

            // It is possible to close compose before we can focus, so make sure it's still open before we proceed
            if (!Jx.isObject(Compose.ComposeImpl.getComposeImpl(componentCache))) {
                return;
            }

            var composeWindow = Compose.ComposeImpl.getComposeWindow(componentCache);
            Debug.assert(Jx.isObject(composeWindow));

            // Determine current active element
            var activeElement = Compose.doc.activeElement;
            while (Boolean(activeElement) && Boolean(activeElement.parentNode) && activeElement !== composeWindow) {
                activeElement = activeElement.parentNode;
            }
            // If focus is not already somewhere in compose
            if (activeElement !== composeWindow) {
                var toCcBcc = componentCache.getComponent("Compose.ToCcBcc");
                Debug.assert(Jx.isObject(toCcBcc));

                if (toCcBcc.isToEmpty()) {
                    toCcBcc.focus("to");
                } else {
                    var subject = componentCache.getComponent("Compose.Subject");
                    Debug.assert(Jx.isObject(subject));

                    if (subject.getSubject().length === 0) {
                        subject.focus();
                    } else {
                        var body = componentCache.getComponent("Compose.BodyComponent");
                        Debug.assert(Jx.isObject(body));

                        body.focus();
                    }
                }

                // Finally scroll the content page all the way to the top/left
                var contentScrollArea = composeWindow.querySelector(".composeContentScrollArea");
                contentScrollArea.scrollTop = 0;
                contentScrollArea.scrollLeft = 0;
            }

            if (initAction && !suppressPerfTrack) {
                Jx.ptStop(Mail.ComposeUtil.ptScenarioToString[initAction]);
            }

            Mail.writeProfilerMark("ComposeUtil.setInitialFocus", Mail.LogEvent.stop);
        },

        isValidAction: function (action) {
            return (["send", "save", "hideCurrent"].indexOf(action) !== -1);
        }
    };

    Mail.composeUtil = new Mail.ComposeUtil();

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Compose,EmojiPicker,Jx,Debug*/

Jx.delayGroup("MailCompose", function () {

    Mail.EmojiPicker = /*@constructor*/function () {
        Compose.Component.call(this);

        this._emojiPicker = null;
        this._peekBarHeight = Jx.PeekBar.height;

        // We'll assert that the canvascontrol never changes because we don't expect it to in mail.
        Debug.only(this._canvasControl = /*@static_cast(ModernCanvas.ModernCanvas)*/null);
        Debug.Events.define(this, "aftershow");
    };
    Jx.augment(Mail.EmojiPicker, Jx.Events);
    Jx.augment(Mail.EmojiPicker, Compose.Component);

    Compose.util.defineClassName(Mail.EmojiPicker, "Mail.EmojiPicker");

    var proto = Mail.EmojiPicker.prototype;

    proto.show = function () {
        this.getComponentCache().getComponent("Compose.KeyboardResizer").pause();
        this._ensureEmojiPicker();
        this._emojiPicker.show();
    };

    // Private
    
    proto._ensureEmojiPicker = function () {
        if (!Boolean(this._emojiPicker)) {
            var canvasControl = this._getCanvasControl();
            Debug.assert(Jx.isObject(canvasControl));
            Debug.only(this._canvasControl = canvasControl);

            var insertElement = canvasControl.insertElement;
            Debug.assert(Jx.isFunction(insertElement));

            // Create the new picker
            this._emojiPicker = new EmojiPicker.EmojiPicker(insertElement,
                /*@static_cast(HTMLElement)*/canvasControl, this.getComposeRootElement().querySelector(".composeEmojiAnchor"));
            this._emojiPicker.addEventListener("afterhide", function () { this._updatePadding(true); }.bind(this), false);
            this._emojiPicker.addEventListener("aftershow", function () {
                this.getComponentCache().getComponent("Compose.KeyboardResizer").resume();
                this._updatePadding(false);
                this.raiseEvent("aftershow");
            }.bind(this), false);
        }

        // If either of these asserts fire, we need to add functionality update the emojipicker with the new
        // canvas/canvas insertelement each time it changes.
        Debug.assert(this._canvasControl === this._getCanvasControl(),
            "Expected to always use the same canvas control.");
        Debug.assert(this._canvasControl.insertElement === this._getCanvasControl().insertElement,
            "Expected to always use the same canvas control insert element.");
    };

    proto._getCanvasControl = function () {
        var body = /*@static_cast(Compose.BodyComponent)*/this.getComponentCache().getComponent("Compose.BodyComponent");
        Debug.assert(Jx.isObject(body));
        return body.getCanvasControl();
    };

    proto._updatePadding = function (hidden) {
        /// <summary>Updates the padding being applied to account for the picker space.</summary>
        var rootElement = this.getComposeRootElement(),
            mainFrame = rootElement.querySelector(".composeContentScrollArea");
        // If the appbar is showing
        if (!hidden) {

            var adjustingForKeyboard = this.getComponentCache().getComponent("Compose.KeyboardResizer").isAdjustingForKeyboard(),
                peekBarAdjustment = adjustingForKeyboard ? 0 : this._peekBarHeight,
                height = String(this._emojiPicker.offsetHeight - peekBarAdjustment) + "px";
            mainFrame.style.setProperty("margin-bottom", height);
            this._getCanvasControl().scrollSelectionIntoView();
        } else {
            mainFrame.style.removeProperty("margin-bottom");
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail,Compose,Debug*/

Jx.delayGroup("MailCompose", function () {

    Mail.ExpandButton = function () {
        Compose.Component.call(this);
    };
    Jx.inherit(Mail.ExpandButton, Jx.Events);
    Jx.augment(Mail.ExpandButton, Compose.Component);

    Compose.util.defineClassName(Mail.ExpandButton, "Mail.ExpandButton");

    var proto = Mail.ExpandButton.prototype;

    Debug.Events.define(proto, "expand");

    proto.composeGetUI = function (ui) {
        ui.html = "<button id='composeExpandBtn' class='cmdExpand typeSizeNormal composeLinkButton' type='button'><span data-win-res='innerText:composeExpandLabel'>WMoreL</span></button>";
    };

    proto.composeActivateUI = function () {
        this._expandButton = this.getComposeRootElement().querySelector(".cmdExpand");

        this._bindings = Compose.binder.attach(this, [
            { on: "click", from: this._expandButton, then: this._expandHeader }
        ]);
    };

    proto.composeDeactivateUI = function () {
        Compose.binder.detach(this._bindings);
        this._bindings = null;
    };

    proto.isVisible = function () {
        // Visible only in condensed edit mode
        var headerController = Compose.util.getHeaderController(this.getComponentCache());
        return headerController.getCurrentState() === Compose.HeaderController.State.editCondensed;
    };

    proto.focus = function () {
        Debug.assert(Jx.isHTMLElement(this._expandButton));
        this._expandButton.focus();
    };

    proto.focusableElementId = function () {
        Debug.assert(Jx.isHTMLElement(this._expandButton));
        return this._expandButton.id;
    };
    
    // Private

    proto._expandHeader = function () {
        // Get the header object and expand it to full edit mode
        var headerController = Compose.util.getHeaderController(this.getComponentCache());
        headerController.changeState(Compose.HeaderController.State.editFull);

        // Set focus on the priority field
        var priority = this.getComponentCache().getComponent("Compose.Priority");
        Debug.assert(Jx.isObject(priority) && priority.isActivated());
        priority.focus();

        this.raiseEvent("expand");
    };

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft,Compose*/

Jx.delayGroup("MailCompose", function () {

    Mail.ComposeInstrumentation = /*@constructor*/function () {
        /// <summary>Handles compose instrumentation for mail</summary>
        Compose.Component.call(this);

        this._bindings = null;
        this._composeCommandsUsed = { };
    };
    Jx.augment(Mail.ComposeInstrumentation, Compose.Component);

    Compose.util.defineClassName(Mail.ComposeInstrumentation, "Mail.ComposeInstrumentation");

    var proto = Mail.ComposeInstrumentation.prototype;

    proto.composeActivateUI = function () {
        this._bindings = this.getComponentBinder().attach(this, [
            { on: "changed", fromComponent: Compose.ComponentBinder.messageModelClassName, then: this._onModelChanged },
            {
                on: "expand", fromComponent: "Mail.ExpandButton", then: function () {
                    this._composeCommandsUsed.showDetails = true;
                }
            }
        ]);
    };

    proto.composeDeactivateUI = function () {
        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
    };

    proto.composeUpdateUI = function () {
        this._resetComposeCommands();
    };

    proto.updateModel = function (action) {
        /// <param name="action" type="String">send|save</param>
        Debug.assert(Mail.composeUtil.isValidAction(action));

        // Ensure we are the last component to get the updateModel() call.
        // We need this to be the case in order to have accurate reporting data.
        Debug.only(this.getComponentCache().forEachComponent(function (component) {
            /// <param name="component" type="Compose.Component"></param>

            // Note: We know the emoji picker can be added after this,
            // but we don't care since it doesn't actually provide us any information.
            // If we start adding more components lazily that we do need info from,
            // let's move the reportComposeInstrumentation to be called by the "aftersend" action
            // instead of updateModel().
            if (component !== this && component.getClassName() !== "Mail.EmojiPicker") {
                Debug.assert(component.getIsMessageModelUpdated(),
                    "Mail.ComposeInstrumentation needs to be the last component to get the updateModel() call. " +
                    "Component has not yet been called:" + component.getClassName());
            }
        }.bind(this)));

        if (action === "send") {
            this._reportComposeInstrumentation();
        }

        return Compose.Component.prototype.updateModel.call(this, action);
    };

    // Private

    proto._onModelChanged = function () {
        this._updatePriority();
    };

    proto._updatePriority = function () {
        var mailMessageImportance = Microsoft.WindowsLive.Platform.MailMessageImportance,
            importance = /*@static_cast(Number)*/this.getMailMessageModel().get("importance");

        // Update the instrumentation
        if (importance === mailMessageImportance.high) {
            this._composeCommandsUsed.highPriority = true;
        } else if (importance === mailMessageImportance.low) {
            this._composeCommandsUsed.lowPriority = true;
        } else {
            Debug.assert(importance === mailMessageImportance.normal, "Unrecognized importance");
            this._composeCommandsUsed.normalPriority = true;
        }
    };

    proto._resetComposeCommands = function () {
        this._composeCommandsUsed = {
            highPriority: false,
            lowPriority: false,
            normalPriority: false,
            showDetails: false
        };
    };

    proto._reportComposeInstrumentation = function () {
        /// <summary>
        /// Reports all relevant instrumentation data
        /// </summary>
        Compose.log("reportInstrumentation", Compose.LogEvent.start);

        var messageModel = this.getMailMessageModel(),
            componentCache = this.getComponentCache();

        
        if (!Jx.isWWA) {
            // If this is not WWA, then don't bother since we don't have access to bici
            return;
        }
        

        var composeAction = messageModel.getInitAction();
        Debug.assert(composeAction !== undefined);

        // For now set it to all. TODO WinBlue:450543, determine whether SWKeyboard/HWKeyboard/Mouse/Touch etc use and set accordingly
        var composeMethod = 15;

        var isEmptySubject = (messageModel.get("subject").length === 0 ? 1 : 0);
        // TODO WinBlue:450543, fix this once canvas can tell us if the quoted body is modified
        var modifiedReply = 0;

        var subjectControl = componentCache.getComponent("Compose.Subject");
        Debug.assert(Jx.isObject(subjectControl));

        var toCcBcc = componentCache.getComponent("Compose.ToCcBcc");
        Debug.assert(Jx.isObject(toCcBcc));

        var newMailLength = this.getMailMessageModel().get("htmlBody").length,
            composeSubjectLength = subjectControl.getSubject().length,
            composeNumberTo = toCcBcc.getRecipients("to").length,
            composeNumberCc = toCcBcc.getRecipients("cc").length,
            composeNumberBcc = toCcBcc.getRecipients("bcc").length,
            hasAttachments = componentCache.getComponent("Compose.AttachmentWell").getCount() > 0,
            fromAccount = componentCache.getComponent("Compose.From").getAccount();

        // Note: The order has to match the order specified in %inetroot%\modern\shared\bici\config\BiciConfig.xml
        var pointNames = Microsoft.WindowsLive.Instrumentation.Ids.Mail;
        Jx.bici.addToStream(
            pointNames.composeMailSent,
            composeAction,
            composeMethod,
            isEmptySubject,
            modifiedReply,
            newMailLength,
            composeSubjectLength,
            composeNumberTo,
            composeNumberCc,
            composeNumberBcc,
            hasAttachments ? 1 : 0,
            Mail.Instrumentation.getServerDomain(fromAccount)
        );

        var body = componentCache.getComponent("Compose.BodyComponent");
        Debug.assert(Jx.isObject(body));
        var commands = body.getUsageData().commandManager;

        // Report the usage count for commands.
        // Only report if the value is non-zero.
        if (Boolean(commands["bold"])) {
            Jx.bici.increment(pointNames.composeBoldUseCount, 1);
        }
        if (Boolean(commands["italic"])) {
            Jx.bici.increment(pointNames.composeItalicsUseCount, 1);
        }
        if (Boolean(commands["underline"])) {
            Jx.bici.increment(pointNames.composeUnderlineUseCount, 1);
        }
        if (Boolean(commands["setFontFamily"])) {
            Jx.bici.increment(pointNames.composeFontFamilyUseCount, 1);
        }
        if (Boolean(commands["setFontSize"])) {
            Jx.bici.increment(pointNames.composeFontSizeUseCount, 1);
        }
        if (Boolean(commands["setFontColor"])) {
            Jx.bici.increment(pointNames.composeFontColorUseCount, 1);
        }
        if (Boolean(commands["alignLeft"])) {
            Jx.bici.increment(pointNames.composeLeftAlignUseCount, 1);
        }
        if (Boolean(commands["alignCenter"])) {
            Jx.bici.increment(pointNames.composeCenterUseCount, 1);
        }
        if (Boolean(commands["alignRight"])) {
            Jx.bici.increment(pointNames.composeRightAlignUseCount, 1);
        }
        if (Boolean(commands["numbers"])) {
            Jx.bici.increment(pointNames.composeNumberedListUseCount, 1);
        }
        if (Boolean(commands["bullets"])) {
            Jx.bici.increment(pointNames.composeBulletedListUseCount, 1);
        }
        if (Boolean(commands["setFontHighlightColor"])) {
            Jx.bici.increment(pointNames.composeHighlightUseCount, 1);
        }
        if (Boolean(commands["redo"])) {
            Jx.bici.increment(pointNames.composeRedoUseCount, 1);
        }
        if (Boolean(commands["undo"])) {
            Jx.bici.increment(pointNames.composeUndoUseCount, 1);
        }
        if (Boolean(commands["indent"])) {
            Jx.bici.increment(pointNames.composeIndentUseCount, 1);
        }
        if (Boolean(commands["outdent"])) {
            Jx.bici.increment(pointNames.composeOutdentUseCount, 1);
        }
        if (Boolean(commands["clearFormatting"])) {
            Jx.bici.increment(pointNames.composeClearFormattingUseCount, 1);
        }
        if (Boolean(commands["selectAll"])) {
            Jx.bici.increment(pointNames.composeSelectAllUseCount, 1);
        }
        if (Boolean(commands["insertHyperlink"])) {
            Jx.bici.increment(pointNames.composeInsertLinkUseCount, 1);
        }
        // Report the usage count for compose commands
        var composeCommands = this._composeCommandsUsed;
        if (composeCommands["showDetails"]) {
            Jx.bici.increment(pointNames.composeToggleBccUseCount, 1);
        }
        if (composeCommands["lowPriority"]) {
            Jx.bici.increment(pointNames.composePriorityLowUseCount, 1);
        }
        if (composeCommands["normalPriority"]) {
            Jx.bici.increment(pointNames.composePriorityNormalUseCount, 1);
        }
        if (composeCommands["highPriority"]) {
            Jx.bici.increment(pointNames.composePriorityHighUseCount, 1);
        }

        Compose.log("reportInstrumentation", Compose.LogEvent.stop);
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Mail, Compose, Debug*/

Jx.delayGroup("MailCompose", function () {
    "use strict";
    Mail.ComposeSizeUpdater = function () {
        /// <summary>Handles detail field visibility for mail fullscreen compose</summary>
        Compose.Component.call(this);

        this._bindings = null;
        this._job = null;
        this._updatePromise = null;
    };
    Jx.augment(Mail.ComposeSizeUpdater, Compose.Component);

    Compose.util.defineClassName(Mail.ComposeSizeUpdater, "Mail.ComposeSizeUpdater");

    var proto = Mail.ComposeSizeUpdater.prototype;

    proto.composeActivateUI = function () {
        this._bindings = Compose.binder.attach(this, [
            { on: "viewStateChanged", from: Mail.guiState, then: this._onResize }
        ]);
    };

    proto.composeDeactivateUI = function () {
        Compose.binder.detach(this._bindings);
        this._bindings = null;
        Jx.dispose(this._job);
        if (this._updatePromise) {
            this._updatePromise.cancel();
            this._updatePromise = null;
        }
    };

    proto.composeUpdateUI = function () {
        this._updateComposeWidth();
    };

    // Private

    proto._onResize = function () {
        /// <summary>Updates any aspects of the compose window that may need to change on a resize.</summary>
        Compose.mark("SizeUpdater._onResize", Compose.LogEvent.start);
        
        if (Mail.Utilities.ComposeHelper.isComposeShowing) {
            this._updateComposeWidth();
        } else {
            this._job = Jx.scheduler.addJob(null, Mail.Priority.updateComposeWidth, "update compose width",
                this._updateComposeWidth, this);
        }

        Compose.mark("SizeUpdater._onResize", Compose.LogEvent.stop);
    };

    proto._updateComposeWidth = function () {
        Compose.mark("SizeUpdater._updateComposeWidth", Compose.LogEvent.start);
        Jx.dispose(this._job);

        // Inform canvas of new width
        var bodyComponent = this.getComponentCache().getComponent("Compose.BodyComponent");
        Debug.assert(!Jx.isNullOrUndefined(bodyComponent));
        Debug.assert(bodyComponent.isActivated());
        if (this._updatePromise) {
            // We may need to cancel the old promise if it's still running
            this._updatePromise.cancel();
        }
        this._updatePromise = bodyComponent.updateCanvasStylesAsync(Mail.guiState.width);
        this._updatePromise.done(function () {
            this._updatePromise = null;
        }.bind(this));
        Compose.mark("SizeUpdater._updateComposeWidth", Compose.LogEvent.stop);
    };

});


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Compose,Jx,Debug*/

Jx.delayGroup("MailCompose", function () {

    Mail.KeyboardShortcutHandler = function () {
        /// <summary>Listens for keydowns on the root compose element and carries out the appropriate actions</summary>
        Compose.Component.call(this);

        this._bindings = null;
        this._contentScrollArea = null;
        this._commandManager = Mail.Globals.commandManager;
    };
    Jx.augment(Mail.KeyboardShortcutHandler, Compose.Component);

    Compose.util.defineClassName(Mail.KeyboardShortcutHandler, "Mail.KeyboardShortcutHandler");

    var proto = Mail.KeyboardShortcutHandler.prototype;

    proto.composeActivateUI = function () {
        this._contentScrollArea = this.getComposeRootElement().querySelector(".composeContentScrollArea");

        var composeWindow = Compose.ComposeImpl.getComposeWindow(this.getComponentCache());
        Debug.assert(Jx.isObject(composeWindow));
        this._bindings = this.getComponentBinder().attach(this, [
            { on: "keydown", from: composeWindow, then: this._onKeyDown },
            { on: "keydown", fromComponent: "Compose.BodyComponent", then: this._onKeyDownNoFocus },
            { on: "MSPointerDown", from: composeWindow, then: this._onMSPointerDown }
        ]);
    };

    proto.composeDeactivateUI = function () {
        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
    };

    // Private

    proto._tryDismiss = function () {
        /// <returns type="Boolean">Whether we closed Compose</returns>

        // Search through all the flyouts and determine if any of them are visible,
        // if so - do nothing.  If not, save and close.
        var shouldClose = Array.prototype.every.call(
            Compose.doc.querySelectorAll(".win-flyout"),
            function (element) {
                /// <param name="element" type="HTMLElement" />
                return element.currentStyle.visibility === "hidden";
            });

        if (Jx.glomManager.getIsParent()) {
            // In the parent window, animate back
            Debug.assert(Jx.isObject(Mail.Globals.animator));
            Mail.Globals.animator.animateNavigateBack();
        } else {
            // In a child window, save and close
            var helper = Mail.Utilities.ComposeHelper;
            helper.handleHomeButton();
        }
        return shouldClose;
    };

    proto._onMSPointerDown = function (pointerEvent) {
        /// <param name="pointerEvent" type="Event" />
        if (pointerEvent.button === 3 /* The mouse back button*/) {
            pointerEvent.preventDefault();
            pointerEvent.stopPropagation();
            pointerEvent.stopImmediatePropagation();
            this._tryDismiss();
        }
    };

    proto._onKeyDownNoFocus = function (keyEvent) {
        /// <summary>This event listener traps the F6 keydown from the canvas so that it may move focus out.
        /// Without this the compose F6 handling would put focus right back in the canvas</summary>
        /// <param name="keyEvent" type="Event">Keydown event</param>
        if (keyEvent.keyCode !== 117) {
            // F6
            this._onKeyDown(keyEvent);
        }
    };

    proto._onKeyDown = function (keyEvent) {
        /// <param name="keyEvent" type="Event">Keydown event</param>

        var modifier = 0;
        if (keyEvent.altKey) {
            modifier |= 0x1;
        }
        if (keyEvent.ctrlKey) {
            modifier |= 0x2;
        }
        if (keyEvent.shiftKey) {
            modifier |= 0x4;
        }

        var handled = true,
            code = Jx.key.mapKeyCode(keyEvent.keyCode),
            keyCode = Jx.KeyCode;

        if (modifier === 0x1) {
            // Alt + T
            if (code === keyCode.t) {
                // Focus to 'To' field
                handled = this._callWithComponentIfExists("Compose.ToCcBcc", function (toCcBcc) {
                    /// <param name="toCcBcc" type="Compose.ToCcBcc"></param>
                    if (toCcBcc.isVisible("to")) {
                        toCcBcc.focus("to");
                    }
                });
            } else if (code === keyCode.c) {  // Alt + C
                // Launch the people picker for the cc field
                handled = this._callWithComponentIfExists("Compose.ToCcBcc", function (toCcBcc) {
                    /// <param name="toCcBcc" type="Compose.ToCcBcc"></param>
                    if (toCcBcc.isVisible("cc")) {
                        toCcBcc.launchPeoplePicker("cc");
                    }
                });
            } else if (code === keyCode.b) { // Alt + B
                // Launch the people picker for the bcc field
                handled = this._callWithComponentIfExists("Compose.ToCcBcc", function (toCcBcc) {
                    /// <param name="toCcBcc" type="Compose.ToCcBcc"></param>
                    if (toCcBcc.isVisible("bcc")) {
                        toCcBcc.launchPeoplePicker("bcc");
                    }
                });
            } else if (code === keyCode.s) {  // Alt + S
                // Send mail
                handled = this._callWithComponentIfExists("Compose.SendButton", function (send) {
                    /// <param name="send" type="Compose.SendButton"></param>
                    send.performClick();
                });
            } else if (code === keyCode.i) { // Alt + I
                // Attach
                handled = this._callWithComponentIfExists("Compose.AttachButton", function (attach) {
                    /// <param name="attach" type="Compose.AttachButton"></param>
                    attach.performClick();
                });
            } else if (code === keyCode.period) { // Alt + .
                // Open the people picker for the 'To' field
                handled = this._callWithComponentIfExists("Compose.ToCcBcc", function (toCcBcc) {
                    /// <param name="toCcBcc" type="Compose.ToCcBcc"></param>
                    if (toCcBcc.isVisible("to")) {
                        toCcBcc.launchPeoplePicker("to");
                    }
                });
            } else if (code === keyCode.m) { // Alt + m
                // Click on the From control
                this._callWithComponentIfExists("Compose.From", function (from) {
                    /// <param name="from" type="Compose.From"></param>
                    from.performClick();
                });
            } else {
                handled = false;
            }
        } else if (code === keyCode.enter) {
            var subject = this.getComponentCache().getComponent("Compose.Subject");
            if (Jx.isObject(subject) && subject.isActivated() && subject.isActiveElement() ) {
                // Bump focus to the next control
                handled = this._callWithComponentIfExists("Compose.BodyComponent", function (body) {
                    /// <param name="body" type="Compose.BodyComponent"></param>
                    body.focus();
                });
            } else {
                handled = false;
            }
        } else if (code === keyCode.pageup || code === keyCode.pagedown) { // Page Up or Page Down
            var scrollableRegion = this._contentScrollArea;
            if (modifier === 0x2) { // Ctrl + Page Up or Ctrl + Page Down
                scrollableRegion.scrollTop = (code === keyCode.pageup) ? 0 : scrollableRegion.scrollHeight;
            } else {
                var clientHeight = scrollableRegion.clientHeight;
                if (code === keyCode.pageup) {
                    scrollableRegion.scrollTop -= clientHeight;
                } else {
                    scrollableRegion.scrollTop += clientHeight;
                }
            }
        } else if (code === keyCode.f6) {
            // F6
            handled = this._callWithComponentIfExists("Compose.BodyComponent", function (body) {
                /// <param name="body" type="Compose.BodyComponent"></param>
                body.focus();
            });
        } else if (modifier === 0x2) {
            if (code === keyCode.n && Jx.glomManager.getIsParent()) {  // ctrl+n
                Mail.Utilities.ComposeHelper.onNewButton(Mail.Instrumentation.UIEntryPoint.keyboardShortcut);
            } else if (code === keyCode.d) { // ctrl+d
                // Delete the message
                handled = this._callWithComponentIfExists("Compose.DeleteButton", function (deleteButton) {
                    deleteButton.performClick();
                });
            } else {
                handled = false;
            }
        } else {
            handled = false;
        }

        // If we handled the key, then don't do anything more
        if (handled || keyEvent.defaultPrevented) {
            keyEvent.preventDefault();
            keyEvent.stopPropagation();
            keyEvent.stopImmediatePropagation();
        } else if (code !== keyCode.delete && code !== keyCode.insert && code !== keyCode.backspace) { // don't pass up del, insert, or backspace keypresses
            // call command manager onkeydown to see if any compose shortcuts need executing
            this._commandManager.onKeyDown(keyEvent);
        }
    };


    proto._callWithComponentIfExists = function (componentClassName, fn) {
        /// <param name="componentClassName" type="String">the class name of the component to retrieve</param>
        /// <param name="fn" type="function">a function to call; the component will be passed as an argument to this function</param>
        /// <return type="Boolean">true when the component existed, false when it didn't</return>
        var component = this.getComponentCache().getComponent(componentClassName);
        if (Jx.isObject(component) && component.isActivated()) {
            fn(component);
            return true;
        }
        return false;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="mailcompose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Mail.IrmManager = /*@constructor*/function () {
        /// <summary>Handles behavior changes for various components based on message state</summary>

        Compose.Component.call(this);

        this._bindings = null;
        this._isCalendarCancel = false;
        this._isCalendarMessage = false;
    };
    Jx.augment(Mail.IrmManager, Jx.Events);
    Jx.augment(Mail.IrmManager, Compose.Component);

    Compose.util.defineClassName(Mail.IrmManager, "Mail.IrmManager");

    var proto = Mail.IrmManager.prototype;

    proto.composeActivateUI = function () {
        this._bindings = this.getComponentBinder().attach(this, [
            { on: "changed", fromComponent: Compose.ComponentBinder.messageModelClassName, then: this._onMessageModelChange }
        ]);
    };

    proto.composeDeactivateUI = function () {
        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
    };

    proto.updateUI = function () {
        // Using updateUI rather than composeUpdateUI since composeUpdateUI is not called on inline->full switch, and we need to modify any new components

        // The calendar message type will only change between messages, so we can check it here once.
        var calendarMessageType = this.getMailMessageModel().getPlatformMessage().calendarMessageType;
        this._isCalendarMessage = calendarMessageType !== Microsoft.WindowsLive.Platform.CalendarMessageType.none;
        this._isCalendarCancel = calendarMessageType === Microsoft.WindowsLive.Platform.CalendarMessageType.cancelled; 
        
        this._onMessageModelChange();
    };

    // Private
    proto._onMessageModelChange = function () {
        this._updateFrom();
        this._updateToCcBcc();
        this._updateIrm();
    };

    proto._updateFrom = function () {
        var fromComponent = /*@static_cast(Compose.From)*/this.getComponentCache().getComponent("Compose.From");
        if (!Jx.isNullOrUndefined(fromComponent)) {
            var hasIrmTemplate = /*@static_cast(Boolean)*/this.getMailMessageModel().get("irmHasTemplate"),
                isOwner = /*@static_cast(Boolean)*/this.getMailMessageModel().get("irmIsContentOwner");
            fromComponent.setDisabled((hasIrmTemplate && !isOwner) || this._isCalendarMessage);
        }
    };

    proto._updateToCcBcc = function () {
        var toCcBcc = /*@static_cast(Compose.ToCcBcc)*/this.getComponentCache().getComponent("Compose.ToCcBcc");
        if (!Jx.isNullOrUndefined(toCcBcc)) {
            var irmCannotModifyRecipients = /*@static_cast(Boolean)*/!this.getMailMessageModel().get("irmCanModifyRecipients");
            toCcBcc.setDisabled(irmCannotModifyRecipients || this._isCalendarCancel);
        }
    };

    proto._updateIrm = function () {
        var irmComponent = /*@static_cast(Compose.IrmChooser)*/this.getComponentCache().getComponent("Compose.IrmChooser");

        if (!Jx.isNullOrUndefined(irmComponent)) {
            irmComponent.setDisabled(this._isCalendarMessage);
        }
    };

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="mailcompose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Mail.ChainOfResponsibility = /*@constructor*/function (handlers) {
        /// <summary>
        /// Generic implementation of chain of responsibility design pattern
        /// </summary>
        /// <param name="handlers" type="Array"></param>
        Debug.assert(Jx.isArray(handlers));
        this._handlers = handlers;
    };

    Mail.ChainOfResponsibility.prototype = {
        handle: function (/*@dynamic*/context) {
            /// <param name="context" optional="true"></param>
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = /*@static_cast(Mail.ChainOfResponsibilityHandler)*/this._handlers[i],
                    result = handler.handle(context);
                if (!Jx.isNullOrUndefined(result)) {
                    return result;
                }
            }
            return null;
        }
    };

    Mail.ChainOfResponsibilityUtil = {
        factoryize: function (chainOfResponsibility) {
            /// <summary>Takes the given chain of responsibility object and gives it the name "build" instead of "handle"</summary>
            return {
                // Give it a nice name
                build: chainOfResponsibility.handle.bind(chainOfResponsibility)
            };
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Compose,ModernCanvas,Debug,Jx,Microsoft */

Jx.delayGroup("MailCompose", function () {

    Mail.MessageModelFactory = /*@constructor*/function () {
        /// <summary>
        /// Implements Mail.ChainOfResponsibilityHandler and returns basic message models for mail.
        /// Calendar should be ahead of this in the pecking order.
        /// </summary>
    };

    Mail.MessageModelFactory.prototype = {
        handle: function (spec) {
            /// <param name="spec" type="Mail.MessageModelFactoryFactorySpec"></param>
            Debug.assert(Jx.isObject(spec));

            var validatedSpec = this._validateSpec(spec);

            var initAction = validatedSpec.initAction;
            switch (initAction) {
                case Compose.ComposeAction.createNew:
                    return Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                        initAction: Compose.ComposeAction.createNew,
                        signatureLocation: ModernCanvas.SignatureLocation.start
                    },
                    {
                        accountId: validatedSpec.accountId,
                        fromEmail: this._getPreferredSendAsAddress(validatedSpec.accountId)
                    });
                
                case Compose.ComposeAction.openDraft:
                    return Compose.MailMessageModel.instance(/*@static_cast(Compose.MessageModelSpec)*/{
                        messageCreator: validatedSpec.messageCreator,
                        initAction: Compose.ComposeAction.openDraft
                    });

                case Compose.ComposeAction.forward:
                    return Compose.mailMessageModelForwardFactory.instance(validatedSpec.messageCreator);

                case Compose.ComposeAction.reply:
                    return Compose.mailMessageModelReplyFactory.instance(validatedSpec.messageCreator);

                case Compose.ComposeAction.replyAll:
                    return Compose.mailMessageModelReplyAllFactory.instance(validatedSpec.messageCreator);

                default:
                    Debug.assert(false, "Unsupported action");
                    break;
            }

            return null;
        },
        _validateSpec: function (spec) {
            /// <param name="spec" type="Mail.MessageModelFactoryFactorySpec"></param>
            /// <returns type="Mail.MessageModelFactoryFactorySpec"></returns>

            // Handle defaults and fallbacks here

            var action = spec.initAction;
            Debug.assert(Debug.Compose.util.isValidAction(action));

            var messageCreator = spec.messageCreator;
            if (!Boolean(messageCreator) && action !== Compose.ComposeAction.createNew) {
                // The only time we allow the caller to not pass a message creator for mail messages, is if they passed in the message itself
                var originalMessage = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/spec.originalMessage;
                Debug.assert(Jx.isObject(originalMessage));

                // Special case -
                // We cannot edit a draft that is not in the drafts folder.
                // In this case, have our mail message creator return a null message, which will tell the
                // compose experience to fallback to a "create new" message scenario.
                if (action === Compose.ComposeAction.openDraft &&
                        originalMessage.isInSpecialFolderType(Microsoft.WindowsLive.Platform.MailFolderType.drafts)) {
                    originalMessage = null;
                }
                spec.messageCreator = Compose.MessageReturner.instance(originalMessage);
            }
            return spec;
        },
        _getPreferredSendAsAddress: function (accountId) {
            /// <param name="accountId" type="String" />
            Debug.assert(Jx.isNonEmptyString(accountId));
            var platform = Compose.platform,
                account = platform.accountManager.loadAccount(accountId);
            Debug.assert(account);
            return account.preferredSendAsAddress;
        }
    };
});


(function () {

    Mail.getComposeMessageModelFactory = function () {
        /// <returns type="Mail.MessageModelFactoryFactory"></returns>

        var factory = /*@static_cast(Mail.MessageModelFactoryFactory)*/Mail.ChainOfResponsibilityUtil.factoryize(new Mail.ChainOfResponsibility([
            // Order is important here as calendar should take preference
            new Mail.CalendarMessageModelFactory(),
            new Mail.MessageModelFactory()
        ]));
        Mail.getComposeMessageModelFactory = function () { return factory; };
        return Mail.getComposeMessageModelFactory();
    };

})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="mailcompose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Mail.CalendarMessageModelFactory = /*@constructor*/function () {
        /// <summary>
        /// Implements Mail.ChainOfResponsibilityHandler and returns message models for calendar.
        /// </summary>
    };

    Mail.CalendarMessageModelFactory.prototype = {
        handle: function (spec) {
            /// <param name="spec" type="Mail.MessageModelFactoryFactorySpec"></param>
            Debug.assert(Jx.isObject(spec));

            // The calendar message model factory only handles creating new messages from calendar events
            // If it's some other kind of action, the MailMessageModelFactory will handle it.
            var messageModel = null;

            // See if the caller has passed in an original event and calendar action to perform on the event
            var calendarAction = spec.calendarAction;
            if ((Boolean(spec.originalEvent) || Boolean(spec.originalMessage)) && Jx.isNonEmptyString(calendarAction)) {

                switch (calendarAction) {
                    case Compose.CalendarActionType.reply:
                    case Compose.CalendarActionType.replyAll:
                        Debug.assert(spec.originalEvent, "Event missing for reply/replyAll action");
                        messageModel = Compose.calendarReplyMessageModelFactory.instance(spec.originalEvent, calendarAction);
                        break;
                    case Compose.CalendarActionType.forward:
                        Debug.assert(spec.originalEvent, "Event missing for forward action");
                        messageModel = Compose.calendarForwardMessageModelFactory.instance(spec.originalEvent);
                        break;
                    case Compose.CalendarActionType.cancel:
                        Debug.assert(spec.originalEvent, "Event missing for cancel action");
                        messageModel = Compose.calendarCancelMessageModelFactory.instance(spec.originalEvent);
                        break;
                    case Compose.CalendarActionType.accept:
                    case Compose.CalendarActionType.tentative:
                    case Compose.CalendarActionType.decline:
                        // Perform the pre edit response actions if the message is not provided, which means the action comes from Calendar app.
                        if (!Jx.isObject(spec.originalMessage)) {
                            Compose.CalendarUtil.PreEditResponseActionsforCalendar(spec.originalEvent, calendarAction);
                        }
                        messageModel = Compose.calendarEditResponseMessageModelFactory.instance(spec.originalMessage, spec.originalEvent, calendarAction);
                        break;
                    default:
                        Debug.assert(false, "Unexpected calendarAction: " + calendarAction);
                        break;
                }

                // Check to make sure that we got a messageModel.  In some cases (cancel), there may be events for which we decline to generate a mail.
                // If we didn't get a messageModel, we'll need to switch the spec to request a new draft.
                if (!messageModel) {
                    Jx.log.info("Mail.CalendarMessageModelFactory failed to handle calendar message as requested - switching to createNew");
                    spec.originalEvent = null;
                    spec.calendarAction = null;
                    spec.initAction = Compose.ComposeAction.createNew;
                    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                    spec.accountId = Mail.Globals.appState.selectedAccount.objectId;
                    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                }
            }

            return messageModel;
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="mailcompose.ref.js" />

Jx.delayGroup("MailCompose", function () {

    Mail.CalendarActionHandlerFactory = /*@constructor*/function () {
        /// <summary>
        /// Implements Mail.ChainOfResponsibilityHandler and returns action handlers for calendar messages.
        /// </summary>
    };

    Mail.CalendarActionHandlerFactory.prototype = {
        handle: function (messageModel) {
            /// <param name="messageModel" type="Compose.MailMessageModel"></param>
            Debug.assert(Jx.isObject(messageModel));

            var calendarMessageType = messageModel.getPlatformMessage().calendarMessageType;
            var messageType = Microsoft.WindowsLive.Platform.CalendarMessageType;
            switch (calendarMessageType) {
                case messageType.cancelled:
                    return {
                        send: {
                            afterAction: cancelSendHandler
                        }
                    };
                case messageType.responseDeclined:
                    return {
                        send: {
                            afterAction: declineSendHandler
                        }
                    };
                default:
                    // There are a few calendar types that don't have action handlers - none, other, request
                    break;
            }

            return null;
        }
    };

    function deleteOriginalEvent (platformMessage) {
        /// <param name="platformMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
        var originalEvent = loadEvent(platformMessage);
        deleteEvent(originalEvent);
    }

    function deleteEvent (event) {
        if (/*@static_cast(Boolean)*/event && event.canDelete) {
            event.deleteObject();
        }
    }

    function declineSendHandler (messageModel) {
        /// <param name="messageModel" type="Compose.MailMessageModel"></param>
        var platformMessage = messageModel.getPlatformMessage(),
            originalEvent = loadEvent(platformMessage),
            platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform,
            account = platform.accountManager.loadAccount(platformMessage.accountId);

        var originalInviteMessage = Compose.mailMessageFactoryUtil.getSourceMessage(messageModel.getPlatformMessage());

        // Send meeting response. If the originalEvent isn't there, we should get it from the original invite message.
        var event = originalEvent || (originalInviteMessage && originalInviteMessage.calendarEvent);
        if (event) {
            platform.invitesManager.sendMeetingResponse(event, originalInviteMessage, Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined, account);
        }

        // Delete original event
        deleteEvent(originalEvent);

        // Move original invitation mail message to Deleted view
        if (originalInviteMessage) {
            // Move message to deleted
            account = Mail.Account.load(originalInviteMessage.accountId, Compose.platform);
            Compose.CalendarUtil.MoveMessageToDeleted(new Mail.UIDataModel.MailMessage(originalInviteMessage, account));
        }
    }

    function cancelSendHandler(messageModel) {
        /// <param name="messageModel" type="Compose.MailMessageModel"></param>
        var platformMessage = messageModel.getPlatformMessage();
        Debug.assert(Jx.isNonEmptyString(platformMessage.eventHandle), "Unexpected lack of event handle when canceling event");
        deleteOriginalEvent(platformMessage);
    }

    function loadEvent(platformMessage) {
        /// <summary>Loads the original event from the mail message</summary>
        /// <param name="platformMessage" type="Microsoft.WindowsLive.Platform.IMailMessage"></param>
        /// <returns type="Microsoft.WindowsLive.Platform.Calendar.Event">Event on which the mail was based</returns>

        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Compose.platform,
            originalEvent = null,
            eventHandle = platformMessage.eventHandle;

        if (eventHandle) {
            try {
                // try get the real event
                originalEvent = platform.calendarManager.getEventFromHandle(platformMessage.eventHandle);
            } catch (ex) {
                // This is expected if the event no longer exists
                Jx.log.exception("Unable to load event in order to delete it after sending mail", ex);
            }
        }

        return originalEvent;
    }

    Mail.getComposeActionHandlerFactory = function () {
        /// <returns type="Mail.ComposeActionHandlerFactory"></returns>

        // Don't bother wrapping in a ChainOfResponsibility object since there is only one of these.
        // If we add more types in the future, we can switch to use the ChainOfResponsibility to wrap them.
        var factory = /*@static_cast(Mail.ComposeActionHandlerFactory)*/Mail.ChainOfResponsibilityUtil.factoryize(new Mail.CalendarActionHandlerFactory());
        Mail.getComposeActionHandlerFactory = function () { return factory; };
        return Mail.getComposeActionHandlerFactory();
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Compose,Jx,Debug*/

Jx.delayGroup("MailCompose", function () {

    Compose.Selection = /*@constructor*/function () {
        Compose.Component.call(this);

        this._focusJob = null;
        this._selectionChangeJob = null;
        this._composeInFocus = false;
        this._canvasInFocus = false;
        this._frameInFocus = false;
        this._lastFocus = null;
        this._lastFocusFired = "notfired";
        this._bindings = null;
        this._body = null;
        this._canvas = null;
        this._composeWindow = null;
        this._frameElement = null;
        this._pauseAppBarPadding = false;
        this._peekBarHeight = Jx.PeekBar.height;
        this._selectionStateCache = null;
        this._selectionStyleCache = null;
    };
    Jx.augment(Compose.Selection, Jx.Events);
    Jx.augment(Compose.Selection, Compose.Component);

    Compose.util.defineClassName(Compose.Selection, "Compose.Selection");

    var proto = Compose.Selection.prototype;

    Debug.Events.define(proto, "focuschange", "selectionchange", "aftercommand", "contextmenu", "mspointerdown");

    proto.composeGetUI = function () {
    };

    proto.composeActivateUI = function () {
        this._selectionStateCache = null;
        this._selectionStyleCache = null;
        this._body = this.getComponentCache().getComponent("Compose.BodyComponent");
        this._composeWindow = Compose.ComposeImpl.getComposeWindow(this.getComponentCache());
        this._frameElement = document.getElementById(Mail.CompFrame.frameElementId);
        Debug.assert(Jx.isObject(Mail.Globals.commandManager), "Mail CommandManager doesn't exist");
        Debug.assert(Jx.isObject(this._composeWindow), "Compose element not found");
        Debug.assert(Jx.isObject(this._frameElement), "Mail frame element not fount");
        Debug.assert(Jx.isNullOrUndefined(this._bindings));
        var commandMgr = Mail.Globals.commandManager,
            bindingDefs = [
            { on: "focusin", from: this._frameElement, then: this._focusIn },
            { on: "focusout", from: this._frameElement, then: this._focusOut },
            { on: "contextmenu", fromComponent: "Compose.BodyComponent", then: this._onContextMenu },
            { on: "aftercommand", fromComponent: "Compose.BodyComponent", then: this._afterCommand },
            { on: "selectionchange", fromComponent: "Compose.BodyComponent", then: this._selectionChange },
            { on: "font", fromComponent: "Compose.BodyComponent", then: this._showFontFlyout },
            { on: "mspointerdown", fromComponent: "Compose.BodyComponent", then: this._canvasClick },
            { on: "layoutChanged", from: Mail.guiState, then: this._updateFocus }
        ];
        if (commandMgr.appBar) {
            bindingDefs.push({ on: "afterhide", from: this._getAppBar(), then: this._updatePaddingFromAppBar });
            bindingDefs.push({ on: "aftershow", from: this._getAppBar(), then: this._updatePaddingFromAppBar });
            bindingDefs.push({ on: "beforeshow", from: this._getAppBar(), then: this._updatePaddingFromAppBar });
            bindingDefs.push({ on: "resize", from: window, then: this._updatePaddingFromAppBar });
            this._updatePaddingFromAppBar();
        } else {
            bindingDefs.push({ on: "appBarSubscription", from: commandMgr, then: this._addAppBarBindings });
        }

        this._isActivated = true;
        this._body.getCanvasAsync().done(function (canvas) {
            this._canvas = canvas;
            this._bindings = this.getComponentBinder().attach(this, bindingDefs);
            commandMgr.addContext("composeSelection", this);
            this._focusIn({ target: document.activeElement });
        }.bind(this));
    };

    proto.composeDeactivateUI = function () {
        Jx.dispose(this._focusJob);
        Jx.dispose(this._selectionChangeJob);
        this.getComponentBinder().detach(this._bindings);
        this._bindings = null;
        this._body = null;
        this._canvas = null;
        this._composeWindow = null;
        this._frameElement = null;
        this._composeInFocus = false;
        this._canvasInFocus = false;
        this._lastFocus = null;
        this._isActivated = false;
        this.raiseEvent("focuschange");

        Debug.assert(Jx.isObject(Mail.Globals.commandManager), "Mail CommandManager doesn't exist");
        Mail.Globals.commandManager.removeContext("composeSelection");
    };

    proto.composeUpdateUI = function () {
        if (Mail.Globals.commandManager.appBar) {
            this._updatePaddingFromAppBar();
        }
    };

    proto._addAppBarBindings = function () {
        this.getComponentBinder().addAttach(this._bindings, this, [
            { on: "afterhide", from: this._getAppBar(), then: this._updatePaddingFromAppBar },
            { on: "aftershow", from: this._getAppBar(), then: this._updatePaddingFromAppBar },
            { on: "beforeshow", from: this._getAppBar(), then: this._updatePaddingFromAppBar },
            { on: "resize", from: window, then: this._updatePaddingFromAppBar }
        ]);
        this._updatePaddingFromAppBar();
    };

    proto._onContextMenu = function (ev) {
        if (!this._isActivated) { return; }
        this.raiseEvent("contextmenu", ev);
    };

    proto._updateFocus = function () {
        if (!this._isActivated) { return; }
        var guiState = Mail.guiState;
        if (guiState.isReadingPaneVisible && Mail.Utilities.ComposeHelper.isComposeShowing) {
            Mail.composeUtil.setInitialFocus(this.getComponentCache());
        }
    };

    proto._focusIn = function (ev) {
        if (!this._isActivated) { return; }
        Compose.mark("Selection._focusIn", Compose.LogEvent.start);
        if (this._canvas.getIframeElement() === ev.target) {
            this._composeInFocus = true;
            this._canvasInFocus = true;
            this._lastFocus = "canvas";
        } else if (this._isChildElement(this._composeWindow, ev.target)) {
            this._composeInFocus = true;
            this._lastFocus = "compose";
        } else if (this._isChildElement(this._frameElement, ev.target)) {
            this._frameInFocus = true;
            this._lastFocus = "frame";
        }
        Jx.dispose(this._focusJob);
        this._focusJob = Jx.scheduler.addJob(null, Mail.Priority.focusCompose, "focus in for compose", function () {
            if (this._focusHasChanged()) {
                this.raiseEvent("focuschange", ev);
            }
        }, this);
        Compose.mark("Selection._focusIn", Compose.LogEvent.stop);
    };

    proto._focusOut = function (ev) {
        if (!this._isActivated) { return; }
        Compose.mark("Selection._focusOut", Compose.LogEvent.start);
        if (this._isChildElement(this._composeWindow, ev.target)) {
            this._composeInFocus = false;
            this._canvasInFocus = false;
        } else if (this._isChildElement(this._frameElement, ev.target)) {
            this._frameInFocus = false;
        }
        Jx.dispose(this._focusJob);
        this._focusJob = Jx.scheduler.addJob(null, Mail.Priority.focusCompose, "focus out for compose", function () {
            if (this._focusHasChanged()) {
                this.raiseEvent("focuschange", ev);
            }
        }, this);
        Compose.mark("Selection._focusOut", Compose.LogEvent.stop);
    };

    proto._focusHasChanged = function () {
        var result = this._lastFocus !== this._lastFocusFired;
        this._lastFocusFired = this._lastFocus;
        return result;
    };

    proto._canvasClick = function (ev) {
        if (!this._isActivated) { return; }
        this.raiseEvent("mspointerdown", ev);
    };

    proto._afterCommand = function (ev) {
        if (!this._isActivated) { return; }
        this._selectionStateCache = null;
        this._selectionStyleCache = null;
        this.raiseEvent("aftercommand", ev);
    };

    proto._selectionChange = function (ev) {
        if (!this._isActivated) { return; }
        this._selectionStateCache = null;
        this._selectionStyleCache = null;
        Jx.dispose(this._selectionChangeJob);
        this._selectionChangeJob = Jx.scheduler.addTimerJob(null, Mail.Priority.composeSelection, "selection change for compose", 200, this.raiseEvent, this, ["selectionchange", ev]);
    };

    proto._updatePaddingFromAppBar = function () {
        /// <summary>Updates the padding being applied to account for the appbar space.</summary>
        if (!this._isActivated) { return; }
        if (this._pauseAppBarPadding) {
            this._pauseAppBarPadding = false;
            return;
        }
        Compose.mark("Selection.updatePaddingFromAppBar", Compose.LogEvent.start);
        var rootElement = this.getComposeRootElement(),
            mainFrame = rootElement.querySelector(".composeContentScrollArea"),
            appBar = this._getAppBar();
        // If the appbar is showing
        if (!appBar.hidden || appBar.winAnimating === "showing") {
            var adjustingForKeyboard = this.getComponentCache().getComponent("Compose.KeyboardResizer").isAdjustingForKeyboard(),
                peekBarAdjustment = adjustingForKeyboard ? 0 : this._peekBarHeight,
                height = String(appBar.offsetHeight - peekBarAdjustment) + "px";
            mainFrame.style.setProperty("margin-bottom", height);
            // canvas can be null at startup; we're called at every activation including startup
            if (this._canvas) {
                this._canvas.scrollSelectionIntoView();
            }
        } else {
            mainFrame.style.removeProperty("margin-bottom");
        }
        Compose.mark("Selection.updatePaddingFromAppBar", Compose.LogEvent.stop);
    };

    proto.getSelectionState = function () {
        if (!this._selectionStateCache) {
            var range = this._canvas.getSelectionRange(),
                hasSelection = Boolean(range);
            this._selectionStateCache = {
                hasSelection: hasSelection,
                hasNonEmptySelection: hasSelection && !range.collapsed,
                isLink: Boolean(this._canvas.getParentElementForSelection("a")),
            };
        }
        return this._selectionStateCache;
    };

    proto.getSelectionStyles = function () {
        if (!this._selectionStyleCache) {
            this._selectionStyleCache = this._canvas.getSelectionStyles();
        }
        return this._selectionStyleCache;
    };

    proto._isChildElement = function (parent, child) {
        while (child) {
            if (child === parent) {
                return true;
            }
            child = child.parentNode;
        }
        return false;
    };

    proto._getAppBar = function () {
        Debug.assert(Jx.isObject(Mail.Globals.commandManager), "Mail CommandManager doesn't exist");
        Debug.assert(Jx.isObject(Mail.Globals.commandManager.appBar), "AppBar isn't set in CommandManager yet");
        return Mail.Globals.commandManager.appBar;
    };

    proto.getCanvasDocument = function () {
        // <summary>Returns the canvas document</summary>
        return this._canvas.getDocument();
    };

    proto._showFontFlyout = function () {
        /// <summary>Shows the font flyout.</summary>
        // If the AppBar is hidden
        if (!this._isActivated) { return; }
        var shown = false;
        if (this._getAppBar().hidden) {
            // Show the flyout relative to the current selection
            var body = /*@static_cast(Compose.BodyComponent)*/this.getComponentCache().getComponent("Compose.BodyComponent"),
                element = body.getSelectionAnchorElement();
            if (element) {
                Mail.Commands.FlyoutHandler.onHostButton("fontFlyout", element, true);
                shown = true;
            }
        }
        if (!shown) {
            Mail.Commands.FlyoutHandler.onHostButton("fontFlyout", "font");
        }
    };

    Object.defineProperty(proto, "composeInFocus", {
        enumerable: true,
        get: function () {
            /// <summary>Return true if the a compose element is currently in focus or last element focused was a compose element.
            /// The latter point is useful when the focus moves to the appbar or flyouts.</summary>
            return this._lastFocus === "compose" || this._lastFocus === "canvas" || this._composeInFocus;
        }
    });

    Object.defineProperty(proto, "canvasInFocus", {
        enumerable: true,
        get: function () {
            /// <summary>Return true if the canvas element is currently in focus or last element focused was the canvas element.
            /// The latter point is useful when the focus moves to the appbar or flyouts.</summary>
            return this._lastFocus === "canvas" || this._canvasInFocus;
        }
    });

    Object.defineProperty(proto, "appBarHidden", {
        enumerable: true,
        get: function () {
            return this._getAppBar().hidden;
        }
    });

    proto.focusAppBar = function () {
        /// <summary>Sets focus on the first command in the app bar.</summary>
        this._getAppBar().focus();
    };

    proto.focusBody = function () {
        /// <summary>Sets focus on the canvas.</summary>
        this._body.focus();
    };

    proto.fireCommandEvent = function (commandName, value) {
        /// <summary>Fires a command event at the canvas element.</summary>
        /// <param name="commandName" type="String">The name of the command to fire.</param>
        /// <param name="value" type="String" optional="true">The value to send with the command.</param>
        Debug.assert(Jx.isNonEmptyString(commandName));
        Debug.assert(Jx.isObject(this._body));

        this._body.dispatchEvent(commandName, value);
    };

    proto.saveCommand = function () {
        Compose.ComposeImpl.quietSave(this.getComponentCache());
    };

    proto.pauseAppBarPadding = function () {
        Debug.assert(!this._pauseAppBarPadding, "Already paused");
        this._pauseAppBarPadding = true;
    };

    proto.showEmojiPicker = function () {
        var componentCache = this.getComponentCache(),
            emojiPicker = componentCache.getComponent("Mail.EmojiPicker");

        if (!Boolean(emojiPicker)) {
            // Emoji picker is not yet in this compose. Let's add it.
            emojiPicker = this.getComponentCreator().getInstance(Mail.EmojiPicker);
            Debug.assert(Jx.isObject(emojiPicker));

            Compose.ComposeImpl.getComposeImpl(componentCache).addComponent(emojiPicker);
            emojiPicker.activateUI();
        }
        emojiPicker.show();
    };

});
