
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="MessageBar.dep.js" />
/// <reference path="MessageBar.ref.js" />

/*global window,Chat,Jx,Debug,toStaticHTML,WinJS,document*/

window.Chat = window.Chat || {};
Chat.Shared = Chat.Shared || {};

Jx.delayDefine(Chat, "MessageBar", function () {

    function _mark(s) { Jx.mark("MessageBar." + s); }
    function _markStart(s) { Jx.mark("MessageBar." + s + ",StartTA,Shared"); }
    function _markStop(s) { Jx.mark("MessageBar." + s + ",StopTA,Shared"); }

    var MessageBar = Chat.MessageBar = /*@constructor*/function (zOrder, parentElement) {
        /// <summary>
        /// MesssageBar constructor
        /// </summary>
        /// <param name="zOrder" type="Number" optional="true">
        /// Expected zOrder of the message bar
        /// </param>
        /// <param name="parentElement" type="HTMLElement" optional="true">
        /// Expected parent element of the message bar
        /// </param>
        _markStart("constructor");

        if (!Jx.isNullOrUndefined(zOrder)) {
            Debug.assert(Jx.isNumber(zOrder));
            Debug.assert(zOrder >= 2);
            this._zOrder = zOrder;
        } else {
            this._zOrder = 2;
        }

        if (!Jx.isNullOrUndefined(parentElement)) {
            this._parentElement = parentElement;
        }

        _markStop("constructor");
    };

    MessageBar.Priority = {
        superLow: 0,
        low: 1,
        medium: 2,
        high: 3
    };

    var proto = MessageBar.prototype;

    proto._zOrder = 0;
    proto._queue = [];
    proto._disabledIds = {};
    proto._currentMessage = /*@static_cast(MBMessage)*/null;
    proto._inDOM = false;
    proto._isHiddenGlobally = false;
    proto._parentElement = null;
    proto._isAnimating = false;

    proto.addErrorMessage = function (id, priority, options) {
        /// <summary>
        /// Add a message into the queue of error messages to be displayed
        /// </summary>
        /// <param name="id" type="String">
        /// Unique id for the error to be displayed
        /// </param>
        /// <param name="priority" type="Number">
        /// Priority of the error to be displayed, where 0 is low priority
        /// </param>
        /// <param name="options" type="Object">
        /// options: {
        ///     messageText: null, // Text of the message to be displayed, required if messageHTML omitted
        ///     messageHTML: null, // Rich Text of the message to be displayed
        ///     textButton: {
        ///         text, tooltip, callback
        ///     }, // optional 'text' button (all fields required if used)
        ///     button1: {
        ///         text, tooltip, callback
        ///     }, // optional 'action' button (all fields required if used)
        ///     button2: {
        ///         text, tooltip, callback
        ///     }, // required 'action' button (all fields required)
        ///     cssClass: {  // optional
        ///         // provided css class can override one or more of the following
        ///         // default properties
        ///         // see messagebar.css for example class "SomeAppErrorMessage"
        ///         .className {background-color: white}
        ///         .className .mb-message {color: black}
        ///         .className .mb-textButton {color: 0x25A0DA // Light Blue}
        ///         .className .mb-button1 {background-color: Blue-ish; color: White}
        ///         .className .mb-button2 {background-color: Gray-ish; color: Black}
        ///     }
        /// }
        /// </param>
        _markStart("addErrorMessage");
        _mark("Adding error message id: " + id + " priority: " + priority);

        var item = {
            id: id, priority: priority, options: options, isError: true, canDuplicate: false,
            showFunc: this._showCurrentErrorMessage.bind(this),
            hideFunc: this._hideCurrentErrorMessage.bind(this)
        };
        this._addItem(item);

        _markStop("addErrorMessage");
    };

    proto.addStatusMessage = function (id, priority, options) {
        /// <summary>
        /// Add a message into the queue of status messages to be displayed
        /// </summary>
        /// <param name="id" type="String">
        /// Unique id for the error to be displayed
        /// </param>
        /// <param name="priority" type="Number">
        /// Priority of the error to be displayed, where 0 is low priority
        /// </param>
        /// <param name="options" type="Object">
        /// options: {
        ///     messageText: "", // Text of the message to be displayed, required
        ///     tooltip: "", // Tooltip on the message to be displayed, required
        ///     callback: func // Callback function to handle onclick, optional
        ///     showIndeterminateBar: false, // Show animating progress dots, default - false
        ///     cssClass: {  // optional
        ///         // provided css class can override one or more of the following
        ///         // default properties
        ///         // see messagebar.css for example class "SomeAppStatusMessage"
        ///         .className {color: black}
        ///     }
        /// }
        /// </param>
        _markStart("addStatusMessage");
        _mark("Adding status message id: " + id + " priority: " + priority);

        var item = {
            id: id, priority: priority, options: options, isError: false, canDuplicate: true,
            showFunc: this._showCurrentStatusMessage.bind(this),
            hideFunc: this._hideCurrentStatusMessage.bind(this)
        };
        this._addItem(item);

        _markStop("addStatusMessage");
    };

    proto._hideCurrentMessageIfRemoved = function (skipAnimation) {
        /// <param name="skipAnimation" type="Boolean" />
        Debug.assert(Jx.isBoolean(skipAnimation));

        if (Boolean(this._currentMessage) && (this._currentMessage !== this._getMessageToShow())) {
            this._hideCurrentMessage(skipAnimation);
        }
    };

    proto.removeMessage = function (id) {
        /// <summary>
        /// Remove a message from the queue
        /// </summary>
        /// <param name="id" type="String">
        /// Unique id of the message to be removed
        /// </param>

        Debug.assert(Jx.isNonEmptyString(id));

        _markStart("removeMessage");
        _mark("Removing message id: " + id);

        this._removeItem(id);
        this._hideCurrentMessageIfRemoved(false /* skipAnimation */);

        _markStop("removeMessage");
    };

    proto.removeMessages = function (ids, skipAnimation) {
        /// <summary>
        /// Remove a message from the queue
        /// </summary>
        /// <param name="ids" type="Array">
        /// The array of unique ids of the messages to be removed
        /// </param>
        /// <param name="skipAnimation" type="Boolean">
        /// Whether to skip the animation when dismissing the currently-display message if it is among the messages to be removed - defaults to False
        /// </param>

        Debug.assert(Jx.isArray(ids));
        Debug.assert(Jx.isBoolean(skipAnimation));

        ids.forEach(/* @bind(Chat.MessageBar) */ function (messageId) {
            /// <param name="messageId" type="String" />
            Debug.assert(Jx.isNonEmptyString(messageId));
            this._removeItem(messageId);
        }, this);

        this._hideCurrentMessageIfRemoved(skipAnimation);
    };

    proto.disableMessage = function (id) {
        /// <summary>Disable a message</summary>
        /// <param name="id" type="String">
        /// Unique id of the message to be disabled
        /// </param>
        this._disabledIds[id] = true;
        for (var i = 0; i < this._queue.length; i++) {
            if (this._queue[i].id === id) {
                this._queue[i].isDisabled = true;
            }
        }

        if (Boolean(this._currentMessage) && this._currentMessage.id === id) {
            this._hideCurrentMessage();
        }
    };

    proto.unDisableMessage = function (id) {
        /// <summary>Un-disable a message</summary>
        /// <param name="id" type="String">
        /// Unique id of the message to be enabled.
        /// </param>
        var beforeMessage = this._getMessageToShow();
        this._disabledIds[id] = false;
        for (var i = 0; i < this._queue.length; i++) {
            if (this._queue[i].id === id) {
                this._queue[i].isDisabled = false;
            }
        }
        var afterMessage = this._getMessageToShow();

        if (!beforeMessage) {
            // in case we enabled the only Message in the MessageBar
            this._showCurrentMessage(true /*animateIn*/);
        } else if (Boolean(beforeMessage) && Boolean(afterMessage) && (beforeMessage.id !== afterMessage.id)) {
            // we just enabled the top pri message so hide what is currently showing
            this._hideCurrentMessage();
        }
    };

    proto._getMessageToShow = function () {
        /// <returns type="MBMessage">
        /// Return the highest priority message that is not disabled
        /// </returns>
        var i;
        var message = null;
        for (i = 0; i < this._queue.length; i++) {
            if (!this._queue[i].isDisabled) {
                message = this._queue[i];
                break;
            }
        }

        return message;
    };

    proto.clearAllMessages = function () {
        _markStart("clearAllMessages");

        this._queue = [];
        this._hideCurrentMessage();

        _markStop("clearAllMessages");
    };

    proto.hide = function () {
        /// <summary>
        /// Hide the MessageBar until unhide() is called
        /// </summary>
        _markStart("hide");

        if (!this._isHiddenGlobally) {
            this._isHiddenGlobally = true;
            this._hideCurrentMessage();
        }

        _markStop("hide");
    };

    proto.unhide = function () {
        /// <summary>
        /// Unhide the MessageBar after it was hidden by a call to hide
        /// </summary>
        _markStart("unhide");

        if (this._isHiddenGlobally) {
            this._isHiddenGlobally = false;
            this._showCurrentMessage(true /*animateIn*/);
        }

        _markStop("unhide");
    };

    proto.getTextButton = function () {
        /// <summary>
        /// Returns the DOM Element for the Text Button
        /// </summary>
        return this._elError.querySelector(".mb-textButton");
    };

    proto.getButton1 = function () {
        /// <summary>
        /// Returns the DOM Element for Button 1
        /// </summary>
        return this._elError.querySelector(".mb-button1");
    };

    proto.getButton2 = function () {
        /// <summary>
        /// Returns the DOM Element for Button 2
        /// </summary>
        return this._elError.querySelector(".mb-button2");
    };

    proto._addItem = function (item) {
        if (this._disabledIds[item.id]) {
            item.isDisabled = true;
        }

        var duplicate = false;
        var i = 0;
        for (; i < this._queue.length; i++) {
            if (this._queue[i].id === item.id) {
                duplicate = true;
                break;
            }
        }

        // Add the html to the DOM if necessary
        if (!this._inDOM) {
            this._addToDOM();
        }

        if (item.canDuplicate || (!item.canDuplicate && !duplicate)) {
            if (duplicate) {
                // Just replace the item if we have a duplicate id
                this._queue[i] = item;
            } else {
                this._queue.push(item);
            }
            this._queue.sort(this._sortMessages);

            if (!this._currentMessage) {
                // animate in
                this._showCurrentMessage(true /*animateIn*/);
            } else {
                var messageToShow = this._getMessageToShow();
                if (Boolean(this._currentMessage) && Boolean(messageToShow) && (this._currentMessage.id !== messageToShow.id)) {
                    // animate out
                    this._hideCurrentMessage();
                } else if (Boolean(messageToShow) && messageToShow.canDuplicate) {
                    // change value, without animating
                    this._showCurrentMessage(false /*animateIn*/);
                }
            }
        }

        if (this._queue.length > 15) {
            Jx.log.warning("MessageBar performance may be impacted negatively for large sets of messages");
        }
    };

    proto._removeItem = function (id) {
        /// <param name="id" type="String" />
        Debug.assert(Jx.isNonEmptyString(id));

        var i = 0,
            found = false;
        for (var max = this._queue.length; i < max; i++) {
            if (this._queue[i].id === id) {
                found = true;
                break;
            }
        }

        if (found) { // Ignore invalid Ids
            this._queue.splice(i, 1);
        }
    };

    proto._showCurrentMessage = function (animateIn) {
        var messageToShow = this._getMessageToShow();
        if (Boolean(messageToShow) && !this._isAnimating) {
            messageToShow.showFunc(animateIn);
        }
    };

    proto._hideCurrentMessage = function (skipAnimation) {
        /// <param name="skipAnimation" type="Boolean" optional="True" />
        Debug.assert(Jx.isNullOrUndefined(skipAnimation) || Jx.isBoolean(skipAnimation));

        if (Boolean(this._currentMessage) && !this._isAnimating) {
            this._currentMessage.hideFunc(Boolean(skipAnimation));
        }
    };

    proto._sortMessages = function (a, b) {
        /// <param name="a" type="MBMessage" />
        /// <param name="b" type="MBMessage" />

        // Sort so that error is always higher priority than status
        var retVal = 0;
        if (b.isError && !a.isError) {
            retVal = 1;
        } else if (!b.isError && a.isError) {
            retVal = -1;
        } else {
            retVal = b.priority - a.priority;
        }

        return retVal;
    };

    proto._showCurrentErrorMessage = function () {
        var messageToShow = this._getMessageToShow();
        if (Boolean(messageToShow) && !this._isHiddenGlobally) {
            this._currentMessage = messageToShow;
            Jx.removeClass(this._elError, "mbhidden");

            // Set the message text
            var message = this._elError.querySelector(".mb-message");
            if (this._currentMessage.options.messageHTML) {
                message.innerHTML = toStaticHTML(this._currentMessage.options.messageHTML);

                if (this._currentMessage.options.messageText) {
                    message.title = this._currentMessage.options.messageText;                
                } else {
                    message.title = message.innerText;
                }
            } else {
                Debug.assert(this._currentMessage.options.messageText);
                message.innerText = this._currentMessage.options.messageText;
                message.title = this._currentMessage.options.messageText;
            }

            // Set the text button's text, tooltip, and callback
            var textButton = this.getTextButton(); 
            var tbOptions = this._currentMessage.options.textButton;
            this._setButtonValues(textButton, tbOptions, true/*showTooltip*/);
            if (Jx.isNullOrUndefined(tbOptions)) {
                // Give the message more space if there's no link
                Jx.addClass(this._elError, "messagebar-errorExtended");
            } else {
                Jx.removeClass(this._elError, "messagebar-errorExtended");
            }

            // Set the first button's text, tooltip, and callback
            var button1 = this.getButton1();
            this._setButtonValues(button1, this._currentMessage.options.button1, false/*showTooltip*/);

            // Button2 is required
            Debug.assert(this._currentMessage.options.button2);
            // Set the second button's text, tooltip, and callback
            var button2 = this.getButton2();
            this._setButtonValues(button2, this._currentMessage.options.button2, false/*showTooltip*/);

            // Add the css class if provided
            if (this._currentMessage.options.cssClass) {
                Jx.addClass(this._elError, this._currentMessage.options.cssClass);
            }

            // Start the messagebar error animation
            this._slideInErrorMessage();
        }
    };

    proto._setButtonValues = function (el, options, showTooltip) {
        /// <param name="options" type="MBMessageButton" />

        if (options) {
            Debug.assert(options.text && options.callback);
            Debug.assert(!showTooltip || options.tooltip);

            Jx.removeClass(el, "mbhidden");
            el.innerText = options.text;
            if (showTooltip) {
                el.title = options.tooltip;
            }
            el.onclick = this._onButtonClick.bind(this);
            el.onkeydown = this._onKeyDown.bind(this);
        } else {
            Jx.addClass(el, "mbhidden");
        }
    };

    proto._slideInErrorMessage = function () {
        var height = this._elError.offsetHeight;
        this._isAnimating = true;
        WinJS.UI.Animation.showEdgeUI(this._elError, {
            top: "-" + height.toString() + "0px",
            left: "0px"
        }).done(
            this._onShowAnimationComplete.bind(this)
        );
    };

    proto._slideOutErrorMessage = function (skipAnimation) {
        /// <param name="skipAnimation" type="Boolean" />
        Debug.assert(Jx.isBoolean(skipAnimation));

        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._isAnimating = true;
        var hideElement = function () {
            Jx.addClass(this._elError, "mbhidden");

            if (this._currentMessage && this._currentMessage.options.cssClass) {
                Jx.removeClass(this._elError, this._currentMessage.options.cssClass);
            }

            this._isAnimating = false;
            this._currentMessage = null;
            this._showCurrentMessage(true /*animateIn*/);
        }.bind(this);

        if (skipAnimation) {
            hideElement();
        } else {
            var height = this._elError.offsetHeight;
            WinJS.UI.Animation.hideEdgeUI(this._elError, {
                top: "-" + height.toString() + "px",
                left: "0px"
            }).done(hideElement);
        }
    };

    proto._onShowAnimationComplete = function () {
        this._isAnimating = false;
        var messageToShow = this._getMessageToShow();

        if (!Boolean(messageToShow) ||
            (this._currentMessage.id !== messageToShow.id)) {
            // animate out
            this._hideCurrentMessage();
        }

        _mark("animation complete");
    };

    proto._hideCurrentErrorMessage = function (skipAnimation) {
        /// <param name="skipAnimation" type="Boolean" />
        Debug.assert(Jx.isBoolean(skipAnimation));

        if (this._currentMessage) {
            this._slideOutErrorMessage(skipAnimation);
        }
    };

    proto._showCurrentStatusMessage = function (animateIn) {
        var messageToShow = this._getMessageToShow();
        if (Boolean(messageToShow) && !this._isHiddenGlobally) {
            this._currentMessage = messageToShow;
            Jx.removeClass(this._elStatus, "mbhidden");

            // Set the message text and tooltip
            Debug.assert(this._currentMessage.options.messageText);
            this._elStatusText.innerText = this._currentMessage.options.messageText;
            if (this._currentMessage.options.tooltip) {
                this._elStatusText.title = this._currentMessage.options.tooltip;
            } else {
                this._elStatusText.title = "";
            }

            // Show the animating dots progress element if specified
            if (this._currentMessage.options.showIndeterminateBar) {
                // Remove the "value" attribute to start the animation
                this._elProgress.removeAttribute("value");
                this._elProgress.style.visibility = "visible";
            } else {
                this._elProgress.style.visibility = "hidden";
                // Assign an arbitrary value here to halt the animation
                this._elProgress.value = 1;
            }

            // Set the onclick callback if specified
            // and change the css to show element is clickable
            if (this._currentMessage.options.callback) {
                this._elStatus.onclick = this._onButtonClick.bind(this);
                Jx.addClass(this._elStatus, "mb-link");
            } else {
                this._elStatus.onclick = null;
                Jx.removeClass(this._elStatus, "mb-link");
            }

            // Apply css class if specified
            if (this._currentMessage.options.cssClass) {
                this._el.className = this._currentMessage.options.cssClass;
            }

            // Start the animation
            if (animateIn) {
                this._animateStatusMessage(true /*show*/);
            }
        }
    };

    proto._animateStatusMessage = function (show) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._isAnimating = true;
        if (show) {
            WinJS.UI.Animation.fadeIn(this._elStatus).then(this._onShowAnimationComplete.bind(this));
        } else { // Hide
            WinJS.UI.Animation.fadeOut(this._elStatus).then(
            function () {
                Jx.addClass(this._elStatus, "mbhidden");
                this._elProgress.style.visibility = "hidden";
                // Assign an arbitrary value here to halt the animation
                this._elProgress.value = 1;
                if (this._currentMessage && this._currentMessage.options.cssClass) {
                    Jx.removeClass(this._el, this._currentMessage.options.cssClass);
                }

                this._isAnimating = false;
                this._currentMessage = null;
                this._showCurrentMessage(true /*animateIn*/);
            }.bind(this)
            );
        }
    };

    proto._hideCurrentStatusMessage = function () {
        if (this._currentMessage) {
            this._animateStatusMessage(false /*hide*/);
        }
    };

    proto._onButtonClick = function (ev) {
        /// <param name="ev" type="Event" />
        if (this._currentMessage) {
            if (Jx.hasClass(ev.target, "mb-textButton")) {
                Debug.assert(this._currentMessage.options.textButton.callback);
                this._currentMessage.options.textButton.callback(ev.target, this._currentMessage.id);
                // Stop the hyperlink from trying to navigate away
                ev.preventDefault();
            } else if (Jx.hasClass(ev.target, "mb-button1")) {
                Debug.assert(this._currentMessage.options.button1.callback);
                this._currentMessage.options.button1.callback(ev.target, this._currentMessage.id);
            } else if (Jx.hasClass(ev.target, "mb-button2")) {
                Debug.assert(this._currentMessage.options.button2.callback);
                this._currentMessage.options.button2.callback(ev.target, this._currentMessage.id);
            } else if (Jx.hasClass(ev.target, "messagebar-status")) {
                Debug.assert(this._currentMessage.options.callback);
                this._currentMessage.options.callback(ev.target, this._currentMessage.id);
            }
        }
    };

    proto._onKeyDown = function (ev) {
        /// <param name="ev" type="Event" />
        if (ev.keyCode === Jx.KeyCode.space && Jx.hasClass(ev.target, "mb-textButton")) {
            this._onButtonClick(ev);
        }
    };

    proto._addToDOM = function () {
        var el = document.createElement("div"),
            zOrder = this._zOrder.toString();
        el.innerHTML = Jx.Templates.MessageBar.messageBar();

        this._elError = el.querySelector(".messagebar-error");
        this._elError.style.zIndex = zOrder;
        Jx.addClass(this._elError, "mbhidden");

        this._elStatus = el.querySelector(".messagebar-status");
        this._elStatus.style.zIndex = zOrder;
        Jx.addClass(this._elStatus, "mbhidden");
        this._elStatusText = this._elStatus.querySelector(".messagebar-status-text");
        Debug.assert(!Jx.isNullOrUndefined(this._elStatusText));

        this._elProgress = el.querySelector(".mb-progress");

        var parentEl = Jx.isNullOrUndefined(this._parentElement) ? document.body : this._parentElement;
        parentEl.appendChild(el);

        this._el = el;
        this._inDOM = true;
    };

});
