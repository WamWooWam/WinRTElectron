
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayGroup("CanvasPlugins", function () {

    ModernCanvas.Plugins = {};

//
// Copyright (C) Microsoft. All rights reserved.
//
// Modern Canvas plugin to automatically resize to the width and height of the content.
//

/*jshint browser:true*/
/*global Jx,Debug,ModernCanvas*/

Jx.delayDefine(ModernCanvas.Plugins, "AutoResize", function () {

    ModernCanvas.Plugins.AutoResize = function () {
        /// <summary>Automatically resizes the Modern Canvas to the width and height of the content.</summary>
        ModernCanvas.Component.call(this);

        this.activateUI = this.activateUI.bind(this);
        this._onCanvasResize = this._onCanvasResize.bind(this);
        this._onScrollableElementResize = this._onScrollableElementResize.bind(this);
        this._onWindowResize = this._onWindowResize.bind(this);
        this._onResizeStart = this._onResizeStart.bind(this);
        this._onResizeEnd = this._onResizeEnd.bind(this);
        this._resize = this._resize.bind(this);
        this._reset = this._reset.bind(this);
        this._stopIgnoringCanvasResizeEvent = this._stopIgnoringCanvasResizeEvent.bind(this);
        this._startResetTimer = this._startResetTimer.bind(this);
        this._onScroll = this._onScroll.bind(this);
        this._onDOMSubtreeModified = this._onDOMSubtreeModified.bind(this);

        this._isSuspended = false;
        this._resetCalledWhileSuspended = false;

        
        // Make sure onresizestart and onresizeend always match up.
        this._elementResizeStarted = false;
        
    };

    Jx.inherit(ModernCanvas.Plugins.AutoResize, ModernCanvas.Component);

    var proto = ModernCanvas.Plugins.AutoResize.prototype;

    proto.activateUI = function () {
        /// <summary>Used to interact with the DOM after it was built.</summary>
        ModernCanvas.mark("AutoResize.activateUI", ModernCanvas.LogEvent.start);

        if (this._active || Jx.isNullOrUndefined(this.getWindow())) {
            // We activateUI after a window resize, so its possible to get a second activateUI call if the canvas gets
            // activated. It's also possible that the canvas was disposed.
            return;
        }

        var modernCanvas = this._modernCanvas = this.getParent(),
            canvasElement = this._canvasElement = modernCanvas.getCanvasElement();

        this._scrollableElement = modernCanvas.getScrollableElement();
        this._iframeElement = this.getWindow().frameElement;
        this._iframeBodyElement = this.getDocument().body;
        this._createIframeStyleElementIfNeeded();

        // Kick start the resizing logic as soon as possible.
        this._startResetTimer(0);

        // We are going to do a full reset, so ignore any canvas events that occur in the meantime.
        this._ignoreNextCanvasResizeEvent();

        // Attach event listeners.
        this._iframeBodyElement.addEventListener("mselementresize", this._onCanvasResize, false);
        canvasElement.addEventListener("mselementresize", this._onCanvasResize, false);
        canvasElement.addEventListener("mscontrolresizestart", this._onResizeStart, false);
        canvasElement.addEventListener("mscontrolresizeend", this._onResizeEnd, false);
        canvasElement.addEventListener("dragend", this._onCanvasResize, false);
        canvasElement.addEventListener("drop", this._onCanvasResize, false);
        // TODO: Move away from DOMSubtreeModified to MutationObserver when WinBlue:280895 is fixed.
        canvasElement.addEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false);
        this._scrollableElement.addEventListener("mselementresize", this._onScrollableElementResize, false);
        this._scrollableElement.addEventListener("scroll", this._onScroll, false);
        window.addEventListener("resize", this._onWindowResize, false);

        // Make sure the inside of the iframe will never show a vertical or horizontal scroll bar.
        this._iframeBodyElement.style.overflow = "visible";

        Jx.Component.activateUI.call(this);

        this._active = true;
        this._isSuspended = false;
        this._resetCalledWhileSuspended = false;

        // Now that we are active, make sure the selection is in view.
        this._shouldScrollSelectionIntoView = true;

        ModernCanvas.mark("AutoResize.activateUI", ModernCanvas.LogEvent.stop);
    };

    proto._createIframeStyleElementIfNeeded = function () {
        /// <summary>Creates the style element used for resizing the Modern Canvas if it hasn't been created already.</summary>
        if (!this._iframeStyleElement) {
            var doc = this.getDocument();

            // PATCH: HTMLStyleElement#sheet returns null before being in the document in chrome
            this._iframeStyleElement = doc.createElement("style");            
            doc.querySelector("head").appendChild(this._iframeStyleElement);

            // First CSS rule is for width-related rules.
            this._iframeStyleElement.sheet.insertRule("body.modernCanvas > .modernCanvas-visible {}", 0);
            // Second CSS rule is for height-related rules. Only apply the height rules to the ModernCanvas editable div to
            // avoid inflating the height of all .modernCanvas-visible divs.
            this._iframeStyleElement.sheet.insertRule("body.modernCanvas > .modernCanvas-content {}", 1);
        }
    };

    proto.deactivateUI = function () {
        /// <summary>Used to interact with the DOM just before it is destroyed.</summary>
        ModernCanvas.mark("AutoResize.deactivateUI", ModernCanvas.LogEvent.start);

        if (!this._active) {
            // We deactivateUI during a window resize, so its possible to get a second deactivateUI call if the canvas gets
            // disposed.
            return;
        }

        Jx.Component.deactivateUI.call(this);

        // Detach event listeners.
        var canvasElement = this._canvasElement;
        this._iframeBodyElement.removeEventListener("mselementresize", this._onCanvasResize, false);
        canvasElement.removeEventListener("mselementresize", this._onCanvasResize, false);
        canvasElement.removeEventListener("mscontrolresizestart", this._onResizeStart, false);
        canvasElement.removeEventListener("mscontrolresizeend", this._onResizeEnd, false);
        canvasElement.removeEventListener("dragend", this._onCanvasResize, false);
        canvasElement.removeEventListener("drop", this._onCanvasResize, false);
        canvasElement.removeEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false);
        this._scrollableElement.removeEventListener("mselementresize", this._onScrollableElementResize, false);
        this._scrollableElement.removeEventListener("scroll", this._onScroll, false);
        window.removeEventListener("resize", this._onWindowResize, false);

        this._clearResetTimer();

        this._active = false;

        ModernCanvas.mark("AutoResize.deactivateUI", ModernCanvas.LogEvent.stop);
    };

    proto.suspendEvents = function () {
        /// <summary>Suspends event listeners to avoid unnecessary event handling.</summary>
        this._canvasElement.removeEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false);
        this._isSuspended = true;

        ModernCanvas.Component.prototype.suspendEvents.call(this);
    };

    proto.resumeEvents = function () {
        /// <summary>Resumes any suspended event listeners.</summary>
        this._isDirty = true;
        this._isSuspended = false;

        var that = this;
        this.getWindow().setImmediate(function () {
            // Check to see if we've been disposed
            if (that._canvasElement) {
                // DOMSubtreeModified is fired when we return control of the UI thread to IE by returning from JavaScript, and we want to skip those events too.
                that._canvasElement.addEventListener("DOMSubtreeModified", that._onDOMSubtreeModified, false);
            }
        });

        if (this._resetCalledWhileSuspended) {
            this._resetCalledWhileSuspended = false;
            this._startResetTimer(0);
        }

        ModernCanvas.Component.prototype.resumeEvents.call(this);
    };

    proto._onDOMSubtreeModified = function () {
        /// <summary>Handles a DOMSubtreeModified callback.</summary>
        ModernCanvas.mark("AutoResize._onDOMSubtreeModified", ModernCanvas.LogEvent.start);

        this._isDirty = true;

        ModernCanvas.mark("AutoResize._onDOMSubtreeModified", ModernCanvas.LogEvent.stop);
    };

    proto._reset = function () {
        /// <summary>Does a complete reset of the width and height of the Modern Canvas iframe.</summary>
        ModernCanvas.mark("AutoResize._reset", ModernCanvas.LogEvent.start);

        var scrollableElement = this._scrollableElement;
        if (!this._active || this._isSuspended || scrollableElement.offsetWidth === 0) {
            if (this._isSuspended) {
                this._resetCalledWhileSuspended = true;
            }
            // If width is 0 we are hidden so don't react to the event.
            ModernCanvas.mark("AutoResize._reset", ModernCanvas.LogEvent.stop);
            return;
        }

        // Remember the current scroll position, because when we null out the iframe size, the iframe will sometimes resize
        // and scroll back to the top.
        var currentScrollPositionTop = scrollableElement.scrollTop,
            currentScrollPositionLeft = scrollableElement.scrollLeft;

        // First we update CSS rules that affect the max-width and padding of the iframe. This is important because the
        // max-width will cause the calculated height of the content to change (e.g. it determines when text wraps to the next
        // line).
        this._setIframeWidthStyles();

        // Next we remove our custom min-height styles and inline styles on the iframe so that it collapses back to the height
        // and width as inherited by the host app CSS. We call this the "default" height and width.
        this._setIframeHeightStyles(null);
        this._setIframeSize(null, null);

        // We most likely just changed inline CSS styles, so reading the following measurements will cause a layout pass.
        this._defaultWidth = this._iframeElement.offsetWidth;
        this._defaultHeight = this._iframeElement.offsetHeight;

        // Now we can resize the iframe by measuring the contents and then set an inline height and width to reflect the
        // actual width and height of the iframe content.
        this._resize();

        // And now that we are done measuring the iframe content, we can update CSS rules that affect the min-height of the
        // iframe content. The measurements needed to update these styles have already been cached, otherwise reading the
        // measurements now would likely cost us another layout pass.
        this._setIframeHeightStyles(this._defaultHeight - this._topPadding);

        // Go back to the original scroll position and _then_ scroll the selection into view. This order is important to
        // avoid jumpiness.
        scrollableElement.scrollTop = currentScrollPositionTop;
        scrollableElement.scrollLeft = currentScrollPositionLeft;

        if (this._shouldScrollSelectionIntoView) {
            // This will no-op if the selection is already in view.
            this.scrollSelectionIntoView();
            this._shouldScrollSelectionIntoView = false;
        }

        // We just did a reset, so we don't need any pending resets.
        this._clearResetTimer();
        this._isDirty = false;

        ModernCanvas.mark("AutoResize._reset", ModernCanvas.LogEvent.stop);
    };

    proto._startResetTimer = function (timeout) {
        /// <summary>Calls setTimeout/setImmediate to schedule a call to _reset(). Any pending setTimeout/setImmediate calls to _reset() are cancelled.</summary>
        /// <param name="timeout" type="Number" optional="true"></param>
        this._clearResetTimer();

        timeout = Jx.isNumber(timeout) ? timeout : this._defaultTimeoutReset;
        Debug.assert(Jx.isNumber(timeout) && timeout >= 0, "Expected timeout to be a valid number >= 0.");

        var win = this.getWindow();
        if (timeout <= 10) {
            // When a timer is set with timeout value <= 10ms, IE will switch to use high frequency timer, and loads
            // additional 2 dlls into the process (winmm.dll and winmmbase.dll). There should not be a need for timer with
            // timeout value <= 10ms. Most likely the code should try to use msSetImmediate instead.
            this._resetImmediateHandle = win.setImmediate(this._reset);
        } else {
            this._resetTimeoutHandle = win.setTimeout(this._reset, timeout);
        }
    };

    proto._clearResetTimer = function () {
        /// <summary>Any pending setTimeout/setImmediate calls to _reset() are cancelled.</summary>
        var win = this.getWindow();
        if (!Jx.isNullOrUndefined(win)) {
            if (Jx.isNumber(this._resetTimeoutHandle)) {
                this.getWindow().clearTimeout(this._resetTimeoutHandle);
                this._resetTimeoutHandle = null;
            }
            if (Jx.isNumber(this._resetImmediateHandle)) {
                this.getWindow().clearImmediate(this._resetImmediateHandle);
                this._resetImmediateHandle = null;
            }
        }
    };

    proto._onWindowResize = function () {
        /// <summary>Resets the size of the canvas after the window changes size.</summary>
        ModernCanvas.mark("AutoResize._onWindowResize", ModernCanvas.LogEvent.start);

        // This means we are transitioning from one view to another (e.g. landscape to portrait or snap) which can cause major
        // changes, so we should throw out any cached data.
        this.deactivateUI();

        // We re-activate in a setImmediate because IE will return incorrect canvas widths/heights otherwise.
        this.getWindow().setImmediate(this.activateUI);

        ModernCanvas.mark("AutoResize._onWindowResize", ModernCanvas.LogEvent.stop);
    };

    proto._onScrollableElementResize = function () {
        /// <summary>Resets the size of the canvas after the scrollable parent element changes size.</summary>
        ModernCanvas.mark("AutoResize._onScrollableElementResize", ModernCanvas.LogEvent.start);

        // It's possible we just caused the resize, so its unnecessary to react to it again.
        if (!this._ignoreCanvasResizeEvent) {
            // The scrollable parent element resized, so our default height may be incorrect and we need to do a reset. Don't
            // do the reset immediately, as it is likely that an animation is running and the scrollable element will continue
            // to resize.
            this._startResetTimer();

            // If the scrollable element got smaller, the selection might not be in view anymore (e.g. if the appbar comes up).
            // We should scroll it into view if the user is focused inside the Modern Canvas.
            this._shouldScrollSelectionIntoView = (document.activeElement === this._iframeElement);
        }

        ModernCanvas.mark("AutoResize._onScrollableElementResize", ModernCanvas.LogEvent.stop);
    };

    proto._onScroll = function () {
        ModernCanvas.mark("AutoResize._onScroll", ModernCanvas.LogEvent.start);

        if (this._isDirty) {
            // Do a reset immediately, so that the scroll bar is updated as soon as possible.
            this._reset();
        }

        ModernCanvas.mark("AutoResize._onScroll", ModernCanvas.LogEvent.stop);
    };

    proto._onCanvasResize = function () {
        /// <summary>Handles the onresize event for the canvas element.</summary>
        ModernCanvas.mark("AutoResize._onCanvasResize", ModernCanvas.LogEvent.start);

        if (!this._ignoreCanvasResizeEvent) {
            // There are two reasons we might ignore an onresize event:
            // (1) We just caused the resize, so its unnecessary to react to it again.
            // (2) We just removed all styles we had set, and IE will return incorrect canvas widths/heights for a short period
            //     of time.
            this._resize();
        }

        ModernCanvas.mark("AutoResize._onCanvasResize", ModernCanvas.LogEvent.stop);
    };

    proto._onResizeStart = function (e) {
        /// <summary>Handles the onresizestart event for the canvas element.</summary>
        /// <param name="e" type="Event">The onresizestart event args.</param>
        ModernCanvas.mark("AutoResize._onResizeStart", ModernCanvas.LogEvent.start);

        var srcElement = e.srcElement;
        if (srcElement) {
            srcElement.addEventListener("mselementresize", this._onCanvasResize, false);
            
            // Make sure onresizestart and onresizeend always match up.
            Debug.assert(!this._elementResizeStarted);
            this._elementResizeStarted = true;
            
        }

        ModernCanvas.mark("AutoResize._onResizeStart", ModernCanvas.LogEvent.stop);
    };

    proto._onResizeEnd = function (e) {
        /// <summary>Handles the onresizeend event for the canvas element.</summary>
        /// <param name="e" type="Event">The onresizeend event args.</param>
        ModernCanvas.mark("AutoResize._onResizeEnd", ModernCanvas.LogEvent.start);

        var srcElement = e.srcElement;
        if (srcElement) {
            srcElement.removeEventListener("mselementresize", this._onCanvasResize, false);
            
            // Make sure onresizestart and onresizeend always match up.
            Debug.assert(this._elementResizeStarted);
            this._elementResizeStarted = false;
            
        }

        // The resize could have likely changed the height, so do a reset now.
        this._startResetTimer(0);

        ModernCanvas.mark("AutoResize._onResizeEnd", ModernCanvas.LogEvent.stop);
    };

    proto._resize = function () {
        /// <summary>Forces the iframe to resize to the height of the canvas.</summary>
        ModernCanvas.mark("AutoResize._resize", ModernCanvas.LogEvent.start);

        var contentWidth = this._getContentWidth(),
            wasWiderThanDefaultWidth = this._wasWiderThanDefaultWidth,
            isWiderThanDefaultWidth = contentWidth > this._defaultWidth,
            contentHeight = this._getContentHeight(),
            wasTallerThanDefaultHeight = this._wasTallerThanDefaultHeight,
            isTallerThanDefaultHeight = contentHeight > this._defaultHeight,
            // We do an XOR (^), which is true if and only if one of the values is true and one of the values is false, to
            // figure out if we are transitiong from taller than the default height to shorter than the default height or vice
            // versa, or a wider than default width to a thinner than default width or vice versa.
            isTransitioning = (Number(isTallerThanDefaultHeight) ^ Number(wasTallerThanDefaultHeight)) |
                                (Number(isWiderThanDefaultWidth) ^ Number(wasWiderThanDefaultWidth));

        if (Boolean(isTransitioning) || isWiderThanDefaultWidth || isTallerThanDefaultHeight) {
            // The only case that will not hit this block is if both width/height were smaller than the default and still are
            // smaller than the default. In that case, we don't need to do anything.
            var newWidth = isWiderThanDefaultWidth ? contentWidth : null,
                newHeight = isTallerThanDefaultHeight ? contentHeight : null;
            this._setIframeSize(newWidth, newHeight);
        }

        this._wasWiderThanDefaultWidth = isWiderThanDefaultWidth;
        this._wasTallerThanDefaultHeight = isTallerThanDefaultHeight;

        ModernCanvas.mark("AutoResize._resize", ModernCanvas.LogEvent.stop);
    };

    proto._getContentHeight = function () {
        /// <summary>Calculates the height of the content inside of the iframe.</summary>
        ModernCanvas.mark("AutoResize._getContentHeight", ModernCanvas.LogEvent.start);

        // Make sure to subtract any height that we added ourselves, as it will be added again later if necessary.
        var scrollHeight = this._iframeBodyElement.scrollHeight - this._extraHeightAdded;

        ModernCanvas.mark("AutoResize._getContentHeight", ModernCanvas.LogEvent.stop);
        return scrollHeight;
    };

    proto._getContentWidth = function () {
        /// <summary>Calculates the width of the content inside of the iframe.</summary>
        ModernCanvas.mark("AutoResize._getContentWidth", ModernCanvas.LogEvent.start);

        var children = this._iframeBodyElement.children,
            scrollWidth = 0;
        for (var i = 0, len = children.length; i < len; i++) {
            scrollWidth = Math.max(scrollWidth, children[i].scrollWidth);
        }

        ModernCanvas.mark("AutoResize._getContentWidth", ModernCanvas.LogEvent.stop);
        return scrollWidth;
    };

    proto._setIframeSize = function (width, height) {
        /// <summary>Sets the width and height of the iframe.</summary>
        /// <param name="width" type="Number">The width to set in pixels or null to clear the width.</param>
        /// <param name="height" type="Number">The height to set in pixels or null to clear the height.</param>
        ModernCanvas.mark("AutoResize._setIframeSize", ModernCanvas.LogEvent.start);

        if (Jx.isNullOrUndefined(width)) {
            // Only empty it if its not already empty.
            if (Jx.isNonEmptyString(this._iframeElement.style.width)) {
                this._iframeElement.style.width = "";
            }
        } else {
            if (Jx.isNumber(height)) {
                // The height is tall enough to cause a vertical scroll bar. The vertical scroll bar appears on the side of
                // the canvas and might overlap the content, so add extra room in the width to account for it.
                width += this._scrollBarThickness;
            }
            this._iframeElement.style.width = width.toString() + "px";
        }

        this._extraHeightAdded = 0;
        if (Jx.isNullOrUndefined(height)) {
            // Only empty it if its not already empty.
            if (Jx.isNonEmptyString(this._iframeElement.style.height)) {
                this._iframeElement.style.height = "";
            }

            this._iframeBodyElement.classList.remove("modernCanvas-exceededDefaultHeight");
        } else {
            if (Jx.isNumber(width)) {
                // The width is wide enough to cause a horizontal scroll bar. The horizontal scroll bar appears at the bottom
                // of the canvas and might overlap the the content, so add extra room in the height to account for it.
                height += this._scrollBarThickness;
                this._extraHeightAdded = this._scrollBarThickness;
            }
            this._iframeElement.style.height = height.toString() + "px";

            // We don't want to touch the canvas element directly, as it will cause a DOMSubtreeModified event, so we add a
            // class to the body element instead.
            this._iframeBodyElement.classList.add("modernCanvas-exceededDefaultHeight");
        }

        this._ignoreNextCanvasResizeEvent();

        ModernCanvas.mark("AutoResize._setIframeSize", ModernCanvas.LogEvent.stop);
    };

    proto._ignoreNextCanvasResizeEvent = function () {
        /// <summary>Sets the state to ignore the next canvas resize event.</summary>
        this._ignoreCanvasResizeEvent = true;
        if (!Jx.isNumber(this._setImmediateHandle)) {
            this._setImmediateHandle = this.getWindow().setImmediate(this._stopIgnoringCanvasResizeEvent);
        }
    };

    proto._stopIgnoringCanvasResizeEvent = function () {
        /// <summary>Stops ignoring resize events. Used to avoid creating extra function objects at runtime.</summary>
        this._ignoreCanvasResizeEvent = false;
        this._setImmediateHandle = null;
    };

    proto._setIframeWidthStyles = function () {
        /// <summary>Sets the max-width style and padding-right of the iframe.</summary>
        ModernCanvas.mark("AutoResize._setIframeWidthStyles", ModernCanvas.LogEvent.start);

        // The parent of the iframe (.modernCanvas-container) should be styled by the host app so that it takes up all the
        // width available for the Modern Canvas. We base the max-width of the canvas content off of this available width.
        var width = this._iframeElement.parentNode.offsetWidth,
            paddingLeft = Jx.isRtl() ? "paddingRight" : "paddingLeft",
            paddingRight = Jx.isRtl() ? "paddingLeft" : "paddingRight",
            computedStyle = this.getWindow().getComputedStyle(this._canvasElement);

        // Save the top padding for later so we don't read from a dirty DOM. Reading from a dirty DOM will cause a layout pass.
        Debug.assert(computedStyle.paddingTop.indexOf("px") > 0, "Expected padding to be computed in px");
        this._topPadding = parseInt(computedStyle.paddingTop.replace("px", ""), 10);

        Debug.assert(this._iframeStyleElement.sheet.cssRules.length === 2, "Expected exactly 2 CSS styles");
        Debug.assert(computedStyle[paddingLeft].indexOf("px") > 0, "Expected padding to be computed in px");
        var leftPadding = parseInt(computedStyle[paddingLeft].replace("px", ""), 10),
            maxWidth = width - leftPadding * 2,
            // First CSS rule is for width-related rules.
            style = this._iframeStyleElement.sheet.cssRules[0].style;

        // Set the width-related rules, but only if they've changed.
        if (style.maxWidth !== maxWidth + "px") {
            style.maxWidth = maxWidth + "px";
        }
        if (Jx.isNonEmptyString(style[paddingLeft])) {
            // In the rare case that the app flipped to/from RTL, clear out a possible stale rule.
            style[paddingLeft] = "";
        }
        // Take up the remaining width with padding-right to provide a good hit-target.
        var rightPadding = width - (leftPadding + maxWidth);
        if (style[paddingRight] !== rightPadding + "px") {
            style[paddingRight] = rightPadding + "px";
        }

        ModernCanvas.mark("AutoResize._setIframeWidthStyles", ModernCanvas.LogEvent.stop);
    };

    proto._setIframeHeightStyles = function (minHeight) {
        /// <summary>Sets the min-height style of the iframe.</summary>
        /// <param name="minHeight" type="Number">The min-height of the iframe in pixels or null to clear the min-height.</summary>
        ModernCanvas.mark("AutoResize._setIframeHeightStyles", ModernCanvas.LogEvent.start);

        Debug.assert(Jx.isNullOrUndefined(minHeight) || Jx.isValidNumber(minHeight), "Expected minHeight to be null or a valid number");
        Debug.assert(this._iframeStyleElement.sheet.cssRules.length === 2, "Expected exactly 2 CSS styles");

        // Setting a min-height of 0 effectively clears the min-height rule.
        minHeight = minHeight || 0;

        // Second CSS rule is for height-related rules.
        var style = this._iframeStyleElement.sheet.cssRules[1].style;

        // Set the height-related rule, but only if its changed.
        if (style.minHeight !== minHeight + "px") {
            style.minHeight = minHeight + "px";
        }

        ModernCanvas.mark("AutoResize._setIframeHeightStyles", ModernCanvas.LogEvent.stop);
    };

    proto._active = false;
    proto._canvasElement = null;
    proto._defaultHeight = 0;
    proto._defaultWidth = 0;
    proto._defaultTimeoutReset = 350;
    proto._extraHeightAdded = 0;
    proto._iframeElement = null;
    proto._iframeBodyElement = null;
    proto._iframeStyleElement = null;
    proto._ignoreCanvasResizeEvent = false;
    proto._modernCanvas = null;
    proto._resetImmediateHandle = null;
    proto._resetTimeoutHandle = null;
    proto._scrollableElement = null;
    proto._scrollBarThickness = 20;
    proto._shouldScrollSelectionIntoView = false;
    proto._setImmediateHandle = null;
    proto._wasTallerThanDefaultHeight = false;
    proto._wasWiderThanDefaultWidth = false;

});

//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Mail,ModernCanvas,Jx,Debug,window,NodeFilter*/
/*jshint browser:true*/
Jx.delayDefine(ModernCanvas.Plugins, "DefaultFont", function () {
    "use strict";
    
    ModernCanvas.Plugins.DefaultFont = /*@constructor*/function () {
        /// <summary> 
        /// Plugin that provides fixups for the default font.
        /// This includes overriding select all to mantain the default font,
        /// as well as applying the default font on clearformatting
        /// </summary>
        this._isMail = window.Mail && !window.Share;

        this._commandsLoaded = false;
        this._clearFormattingCommand = null;
        this._canvas = null;
    };

    Jx.inherit(ModernCanvas.Plugins.DefaultFont, ModernCanvas.Component);

    var proto = ModernCanvas.Plugins.DefaultFont.prototype;

    proto.activateUI = function () {

        if (!this._canvas) {
            this._canvas = this.getParent();
        }

        if (this._isMail) {
            Debug.assert(Jx.isObject(Mail.Globals.appSettings));
            Mail.Globals.appSettings.addListener(Mail.AppSettings.Events.fontSettingChanged, this._changeFont, this);
        }
        
        this._setupCommands();
    };

    proto.deactivateUI = function () {        
        if (this._isMail) {
            Mail.Globals.appSettings.removeListener(Mail.AppSettings.Events.fontSettingChanged, this._changeFont, this);
        }
    };
    
    proto._setupCommands = function () {
        if (!this._commandsLoaded) {
            var canvas = this._canvas,
                commandManager = canvas.components.commandManager;

            this._clearFormattingCommand = commandManager.getCommand("clearFormatting");

            Debug.assert(this._clearFormattingCommand, "ClearFormatting command does not exist");

            // Replace the commands
            commandManager.setCommand(new ModernCanvas.Command("clearFormatting", this._clearFormatting.bind(this)));
            commandManager.setCommand(new ModernCanvas.Command("selectAll", this._selectAll.bind(this), { undoable: false }));

            this._commandsLoaded = true;
        }
    };

    proto._selectAll = function () {
        var range = this.getSelectionRange().cloneRange(),
            element = this._canvas.getCanvasElement();
        
        // BLUE:487186 - removing a list can remove the defaultFont div leaving nothing to select
        if (!element.firstChild) {
            return;
        }

        Debug.assert(!this.isVoidElement(element.firstChild));
        range.setStart(element.firstChild, 0);

        var lastChild = element.lastChild;

        if (Jx.isValidNumber(lastChild.length)) {
            range.setEnd(lastChild, lastChild.length);
        } else if (this.isVoidElement(lastChild)) {
            range.setEndAfter(lastChild);
        } else {
            range.setEnd(lastChild, lastChild.childNodes.length);
        }

        this.replaceSelection(range);
    };

    proto._styleDiv = function (div, override, fontFamily, fontSize, fontColor) {
        Debug.assert(this.isNodeName(div, "DIV"));

        // Remove any previous styling on the div
        if (override) {            
            // This is a very inneficient way to clear the style, but is required by Blue: 339455.
            // If the style attribute is removed, or even cleared with setAttribute("style",""), it will
            // cause the undo stack to ignore these properties. 
            for (var i = div.style.length; i--;) {
                div.style[div.style[i]] = "";
            }
        }
        
        if (fontSize) {
            div.style.fontSize = fontSize;
        }

        if (fontColor) {
            div.style.color = fontColor;
        }

        if (fontFamily) {
            div.style.fontFamily = fontFamily;
        }
        
        div.classList.add("defaultFont");
    };

    proto._changeFont = function () {
        /// <summary> Updates the default font tags in canvas to reflect changes in the settings flyout </summary>
        Debug.assert(this._isMail);
        var canvas = this._canvas,
            tag,
            appSettings = Mail.Globals.appSettings,
            fontFamily = appSettings.composeFontFamily,
            fontSize = appSettings.composeFontSize,
            fontColor = appSettings.composeFontColor;

        var tags = canvas.getDocument().querySelectorAll(".defaultFont") || [];
        for (var i = tags.length; i--;) {
            tag = tags[i];
            this._styleDiv(tag, false /*override */, fontFamily, fontSize, fontColor);
        }
    };
    
    proto._clearFormatting = function (e) {
        // Get the font settings
        var range = this.getSelectionRange();


        if (range.collapsed) {
            // do nothing on a collapsed range. This still intercepts the call and prevents the 
            // shortcut from calling anything else as well (such as the IE clear format)
            return;
        }

        // Style divs. This must be done before the original clearFormatting is called
        // because of Blue: 339455. The undo stack will not function correctly if the style 
        // is added after being removed in the same undo unit. To avoid this, we modify the styling here.
        // Then a filter function is added to ignore all defaultFont divs. 
        var that = this,
            commonNode = this.getElementFromNode(range.commonAncestorContainer),
            doc = range.startContainer.ownerDocument,
            iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_ELEMENT, function (node) {
                /// <param name="node" type="Node">The node in question.</param>
                return node !== commonNode && that.intersectsNode(range, node) && that.isNodeName(node, "DIV") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }, false),
            currentNode = iterator.nextNode(),
            appSettings = Mail.Globals.appSettings,
            fontFamily = appSettings.composeFontFamily,
            fontSize = appSettings.composeFontSize,
            fontColor = appSettings.composeFontColor;

        while (currentNode) {
            this._styleDiv(currentNode, true /*override */, fontFamily, fontSize, fontColor);
            currentNode = iterator.nextNode();
        }

        // Filter to say that defaultFont divs should not be processed and have their attributes
        // adjusted
        var shouldRemoveStyle = function (node) {
            return !(this.isNodeName(node, "DIV") && node.classList.contains("defaultFont"));
        }.bind(this);
        
        this._clearFormattingCommand.run(e, shouldRemoveStyle);  
    };
});
//
// Copyright (C) Microsoft. All rights reserved.
//
// Modern Canvas plugin to track if at least one edit has been made to the Modern Canvas.
//

/// <reference path="Plugins.ref.js"/>

Jx.delayDefine(ModernCanvas.Plugins, "DirtyTracker", function () {

    ModernCanvas.Plugins.DirtyTracker = /*@constructor*/function () {
        /// <summary>Displays non-editable HTML below the canvas.</summary>
        ModernCanvas.Component.call(this);

        this._isDirty = false;
        this._paused = false;
        this._modernCanvas = /*@static_cast(ModernCanvas.ModernCanvas)*/null;

        this._onDOMSubtreeModified = this._onDOMSubtreeModified.bind(this);
    };

    Jx.inherit(ModernCanvas.Plugins.DirtyTracker, ModernCanvas.Component);

    var proto = ModernCanvas.Plugins.DirtyTracker.prototype;

    proto.activateUI = function () {
        /// <summary>Used to interact with the DOM after it was built.</summary>
        var modernCanvas = this._modernCanvas = this._modernCanvas || /*@static_cast(ModernCanvas.ModernCanvas)*/this.getParent();
        modernCanvas.addListener("afteractivate", this._postActivate, this);
        Jx.Component.activateUI.call(this);
    };

    proto._postActivate = function () {
        var that = this;
        this.getWindow().setImmediate(function () {
            that._modernCanvas.addEventListener("DOMSubtreeModified", that._onDOMSubtreeModified, false);
        });
    };

    proto.deactivateUI = function () {
        /// <summary>Used to interact with the DOM just before it is destroyed.</summary>
        Jx.Component.deactivateUI.call(this);

        this._modernCanvas.removeListener("afteractivate", this._postActivate, this);
        if (!this._paused) {
            this._isDirty = false;
        }
        this._modernCanvas.removeEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false);
    };

    proto.pause = function () {
        /// <summary>Use to pause the tracking while editing.</summary>
        this._paused = true;
    };

    proto.resume = function () {
        this._paused = false;
    };

    proto._onDOMSubtreeModified = function (e) {
        /// <summary>Sets the isDirty flag.</summary>
        /// <param name="e" type="Event">The DOMSubtreeModified event.</param>

        if (!this._paused) {
            this._isDirty = true;
            this._modernCanvas.removeEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false);

            Jx.log.info("DirtyTracker: is dirty");
        }
    };

    Object.defineProperty(proto, "isDirty", {
        enumerable: true,
        get: function () {
            return this._isDirty;
        }
    });

});

//
// Copyright (C) Microsoft. All rights reserved.
//
//

/*global Jx, ModernCanvas, Debug*/
/*jshint browser:true*/
Jx.delayDefine(ModernCanvas.Plugins, "ImageResize", function () {
    ModernCanvas.Plugins.ImageResize = function () {
        /// <summary>
        /// Replaces the default logic for resizing images
        /// such that the aspect ratio is mantained. 
        /// </summary>
        this._onResize = this._onResize.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerReleased = this._onPointerReleased.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._canvasElement = null;
        this._lastX = null;
        this._lastY = null;
        this._image = null;
        this._pointerId = null;
        this._aspectRatio = 0;
        this._aspectRatioValid = false;
        this._xModifier = 1;
        this._yModifier = 1;
        this._width = 0;
        this._height = 0;
    };

    Jx.inherit(ModernCanvas.Plugins.ImageResize, ModernCanvas.Component);

    var proto = ModernCanvas.Plugins.ImageResize.prototype;

    proto.activateUI = function () {
        if (!this._canvasElement) {
            this._canvasElement = this.getParent().getCanvasElement();
        }

        Debug.assert(Jx.isObject(this._canvasElement), "Failed to retrieve the canvas element on activateUI");

        this._canvasElement.addEventListener("mscontrolresizestart", this._onResize, false);
        this._canvasElement.addEventListener("MSPointerDown", this._onPointerDown, false);
    };

    proto.deactivateUI = function () {
        Debug.assert(Jx.isObject(this._canvasElement), "Failed to retrieve the canvas element on deactivateUI");

        this._canvasElement.removeEventListener("mscontrolresizestart", this._onResize, false);
        this._canvasElement.removeEventListener("MSPointerDown", this._onPointerDown, false);
    };

    proto._onResize = function (evt) {
        /// <summary>
        /// When a resize event starts, calculate
        /// where on the image was clicked. The image is sectioned
        /// off by quarter pieces to signify certain areas
        /// where the movement of the cursor should positively,
        /// negatively, or not affect the image size. This keeps
        /// resizing consistent with the normal thought of clicking 
        /// the top left corner and moving towards the center of the
        /// image should decrease the image size.
        ///
        /// The image below represents the key zones, with x,y pairings
        /// representing the x and y modifiers. It sections off in 
        /// relation to the 8 grippers available for resizing. 
        /// For example. the top left has -1,-1. Meaning
        /// xModifier and yModifer are both -1. When an increase in x or y
        /// (dragging right or down) occurs, the image will shrink.
        ///
        /// Remember for a screen:
        /// X increase to the right
        /// Y increases going down
        ///
        /// ________________________________
        /// |-1,-1 |    0,-1         | 1,-1 |
        /// |_____ |_________________|_____ |
        /// |      |                 |      |
        /// | -1,0 |                 | 1,0  |
        /// |_____ |________________ |_____ |
        /// | -1,1 |    0,1          | 1,1  |
        /// ---------------------------------
        /// </summary>

        // Make sure we are dealing with an image
        if (!(evt && this.isNodeName(evt.target, "IMG"))) {
            return;
        }

        var img = this._image = evt.target;

        evt.preventDefault();

        Debug.assert(this._lastX !== null && this._lastY !== null, "Coordinates were not recorded from pointerdown");

        // Calculate where on the x plane was clicked, and how to adjust the x values
        if (this._lastX < (this._image.offsetLeft + (0.25 * img.offsetWidth))) {
            this._xModifier = -1;
        } else if (this._lastX > (this._image.offsetLeft + (0.75 * img.offsetWidth))) {
            this._xModifier = 1;
        } else {
            this._xModifier = 0;
        }

        // Calculate where on the y plane was clicked, and how to adjust the y values
        if (this._lastY < (this._image.offsetTop + (0.25 * img.offsetHeight))) {
            this._yModifier = -1;
        } else if (this._lastY > (this._image.offsetTop + (0.75 * img.offsetHeight))) {
            this._yModifier = 1;
        } else {
            this._yModifier = 0;
        }

        // Reset the lastX and lastY to be null for the onPointerMove event
        this._lastX = null;
        this._lastY = null;
        this._aspectRatioValid = false;

        this._canvasElement.addEventListener("MSPointerMove", this._onPointerMove, false);
        this._canvasElement.addEventListener("MSPointerUp", this._onPointerReleased, false);

        this._width = img.width;
        this._height = img.height;
    };

    proto._onPointerDown = function (evt) {
        /// <summary>
        /// The MSPointerDown event fires before the mscontrolresize event,
        /// allowing us to determine where has been clicked. Track the pointer
        /// down location so that when a resize starts, the x and y modifiers
        /// can be calculated
        /// </summary>
        this._lastX = evt.x;
        this._lastY = evt.y;
    };

    proto._onPointerMove = function (evt) {
        /// <summary>
        /// On pointer move, if the shift key is held 
        /// we just move with the x and y values by the change
        /// in pointer position. However, if the 
        /// shift key is not held then we have to keep the aspect
        /// ratio. Since the aspect ratio shouldn't change 
        /// while shift is not pressed, we store the calculated value
        /// and invalidate it if shift is ever used. 
        /// </summary>

        if (this._pointerId === null) {
            // Ensure that the canvasElement continues to receive
            // pointer events even after the pointer leaves
            // canvas
            this._pointerId = evt.pointerId;
            this._canvasElement.msSetPointerCapture(this._pointerId);
        }

        if (this._lastX !== null && this._lastY !== null) {
            var img = this._image,
                newX = (evt.screenX - this._lastX) * this._xModifier,
                newY = (evt.screenY - this._lastY) * this._yModifier;

            Debug.assert(img, "Image is null");

            var w = img.width;
            var h = img.height;

            if (!evt.shiftKey) {

                // Calculate the aspect ratio and 
                // if it has not been validated
                if (!this._aspectRatioValid) {
                    var ratioAttr = parseFloat(img.getAttribute("data-ratio"));
                    if (isNaN(ratioAttr)) {
                        Debug.assert(w !== 0, "Image width cannot be 0");
                        Debug.assert(h !== 0, "Image height cannot be 0");
                        this._aspectRatio = w / h;
                        img.setAttribute("data-ratio", this._aspectRatio);
                    } else {
                        this._aspectRatio = ratioAttr;
                    }
                    this._aspectRatioValid = true;
                }

                // If shift is not pressed,
                // use the greatest abs value and then multiply
                // or divide by the aspect ratio.
                if (Math.abs(newX) > Math.abs(newY)) {
                    w = (w + newX >= 1) ? Math.round(w + newX) : 1;
                    h = Math.round(w / this._aspectRatio) || 1;
                } else {
                    h = (h + newY >= 1) ? Math.round(h + newY) : 1;
                    w = Math.round(h * this._aspectRatio) || 1;
                }
            } else {
                this._aspectRatioValid = false;
                img.removeAttribute("data-ratio");

                // Don't allow for a 0 width or height img
                w = (w + newX >= 1) ? Math.round(w + newX) : 1;
                h = (h + newY >= 1) ? Math.round(h + newY) : 1;
            }

            img.style.width = w + "px";
            img.style.height = h + "px";
        }
        this._lastX = evt.screenX;
        this._lastY = evt.screenY;
    };

    proto._onPointerReleased = function () {
        /// <summary>
        /// When the pointer is released, stop resizing.
        /// Let go of the listeners, close the undo unit,
        /// and finally dispatch that the resizing has ended.
        /// </summary>

        // Workaround for BLUE: 296597. To workaround this issue, we have to
        // 1. Store the original image size
        // 2. Store the new image size
        // 3. return the image to its original size
        // 4. open an undo unit
        // 5. change the size of the image to the desired final size
        // 6. close the undo unit
        var newWidth = this._image.style.width,
            newHeight = this._image.style.height,
            canvas = this.getParent(),
            img = this._image;

        img.style.width = this._width + "px";
        img.style.height = this._height + "px";

        Jx.raiseEvent(canvas, "beforeundoablechange");

        img.style.width = newWidth;
        img.style.height = newHeight;

        // Close the undo unit
        Jx.raiseEvent(canvas, "undoablechange");

        // Reset the variables
        this._image = null;
        this._lastX = null;
        this._lastY = null;

        if (this._pointerId !== null) {
            this._canvasElement.msReleasePointerCapture(this._pointerId);
            this._pointerId = null;
        }

        this._canvasElement.removeEventListener("MSPointerMove", this._onPointerMove, false);
        this._canvasElement.removeEventListener("MSPointerUp", this._onPointerReleased, false);

        // Make sure to notify that the control resize has ended.
        // Canvas checks to make sure that resize start/end always match in 
        // the autoresize plugin
        var evt = document.createEvent("Event");
        evt.initEvent("mscontrolresizeend", /*canBubble*/true, /*cancelable*/ true);

        this._canvasElement.dispatchEvent(evt);
    };
});

//
// Copyright (C) Microsoft. All rights reserved.
//
// Modern Canvas plugin to handle [Shift+]TAB and [Shift+]F6 for more natural editor indenting
//

/// <reference path="Plugins.ref.js"/>

Jx.delayDefine(ModernCanvas.Plugins, "Indent", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var C = window.ModernCanvas;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    C.Plugins.Indent = /*@constructor*/function () {
        /// <summary>Modern Canvas plugin to handle [Shift+]TAB and [Shift+]F6 for more natural editor indenting.</summary>
        this._commandManager = /*@static_cast(C.CommandManager)*/null;

        C.Component.call(this);
    };

    Jx.inherit(C.Plugins.Indent, C.Component);

    var proto = C.Plugins.Indent.prototype;

    proto.activateUI = function () {
        /// <summary>Used to interact with the DOM after it was built.</summary>

        var canvas = /*@static_cast(C.ModernCanvas)*/this.getParent(),
            shortcutManager = canvas.components.shortcutManager,
            shortcutRemoveList = ["tab", "shift+tab", "f6", "shift+f6"];

        // remove any existing tab shortcuts
        for (var m = shortcutRemoveList.length; m--;) {
            shortcutManager.removeShortcut(shortcutRemoveList[m]);
        }
        shortcutManager.setShortcut("tab", "indentTab");
        shortcutManager.setShortcut("shift+tab", "outdentTab");
        shortcutManager.setShortcut("f6", "focusNext");
        shortcutManager.setShortcut("shift+f6", "focusPrevious");

        this._commandManager = canvas.components.commandManager,
        this._commandManager.setCommand(new C.Command("indentTab", this._commandManager._indent.bind(this._commandManager)));
        this._commandManager.setCommand(new C.Command("outdentTab", this._outdent.bind(this)));
    };

    proto._outdent = function (e) {
        /// <summary>Calls the outdent command unless the selection is inside a list or indent, or contains a list or indent.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>

        var canvas = /*@static_cast(ModernCanvas.ModernCanvas)*/this.getParent(),
            range = this.getSelectionRange(),
            listOrIndent = false;

        if (range) {
            var containerElement = range.commonAncestorContainer,
                canvasElement = canvas.getCanvasElement();
            while (containerElement !== canvasElement) {
                // Check if we are inside a list or indent (<blockquote>)
                if (this.isNodeName(containerElement, "LI", "BLOCKQUOTE")) {
                    listOrIndent = true;
                    break;
                }

                containerElement = containerElement.parentNode;
            }

            // If we don't know if we're in a list or indent yet, then check if the range contains a list or indent.
            listOrIndent = listOrIndent || this._containsListOrIndent(range);
        }

        if (listOrIndent) {
            this._commandManager._outdent(e);
        } else {
            Jx.raiseEvent(canvas, "command", { command: "focusPrevious" });
        }
    };

    proto._containsListOrIndent = function (range) {
        /// <summary>Checks if the given range contains a list or indent.</summary>
        /// <param name="range" type="Range">The range to check.</param>
        /// <returns type="Boolean">true if the given range contains a list or ident, and false otherwise.</param>
        var commonNode = range.commonAncestorContainer,
            doc = commonNode.ownerDocument,
            that = this,
            iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_ELEMENT, function (node) {
                /// <param name="node" type="Node">The node to filter.</param>
                return that.intersectsNode(range, node) && that.isNodeName(node, "LI", "BLOCKQUOTE") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }, false);

        // If there is even one <li> or <blockquote> element, we return true.
        return Boolean(iterator.nextNode());
    };

});
//
// Copyright (C) Microsoft. All rights reserved.
//
// Modern Canvas plugin to display non-editable HTML below the canvas.
//

/// <reference path="Plugins.ref.js"/>

Jx.delayDefine(ModernCanvas.Plugins, "IrmQuotedBody", function () {

    ModernCanvas.Plugins.IrmQuotedBody = /*@constructor*/function () {
        /// <summary>Displays non-editable HTML below the canvas.</summary>
        ModernCanvas.Component.call(this);

        this._disableCopy = false;
        this._element = /*@static_cast(HTMLElement)*/null;
        this._modernCanvas = /*@static_cast(ModernCanvas.ModernCanvas)*/null;

        this._preventCopy = this._preventCopy.bind(this);
    };

    Jx.inherit(ModernCanvas.Plugins.IrmQuotedBody, ModernCanvas.Component);

    var proto = ModernCanvas.Plugins.IrmQuotedBody.prototype;

    proto.activateUI = function () {
        /// <summary>Used to interact with the DOM after it was built.</summary>

        // Prevent context menus and the visual indication of a context menu if disableCopy is true.
        var element = this.getElement();
        element.addEventListener("contextmenu", this._preventCopy, false);
        element.addEventListener("MSHoldVisual", this._preventCopy, false);

        Jx.Component.activateUI.call(this);
    };

    proto.deactivateUI = function () {
        /// <summary>Used to interact with the DOM just before it is destroyed.</summary>
        Jx.Component.deactivateUI.call(this);

        var element = this.getElement();
        element.removeEventListener("contextmenu", this._preventCopy, false);
        element.removeEventListener("MSHoldVisual", this._preventCopy, false);
    };

    proto._getModernCanvas = function () {
        var modernCanvas = this._modernCanvas;
        if (Jx.isNullOrUndefined(modernCanvas)) {
            modernCanvas = this._modernCanvas = /*@static_cast(ModernCanvas.ModernCanvas)*/this.getParent();
            // Override the copy command to work in the IRM quoted body.
            var commandManager = modernCanvas.components.commandManager,
                copyCommand = commandManager.getCommand("copy");
            commandManager.setCommand(new ModernCanvas.Plugins.IrmQuotedBodyCopyCommand(this, copyCommand));
        }

        return modernCanvas;
    };

    proto.getElement = function () {
        /// <summary>Gets or creates the element to host the content for the IRM quoted body.</summary>
        var element = this._element;
        if (Jx.isNullOrUndefined(element)) {
            var ownerDocument = this.getDocument();
            element = this._element = ownerDocument.createElement("div");
            element.classList.add("modernCanvas-irmQuotedBody");
            element.classList.add("modernCanvas-visible");
            element.id = "modernCanvasIrmQuotedBody";
            ownerDocument.body.appendChild(element);
        }

        return element;
    };

    proto._preventCopy = function (e) {
        /// <summary>Disallows context menus if disableCopy is true.</summary>
        /// <param name="e" type="Event">The oncontextmenu event.</param>
        if (this._disableCopy) {
            e.preventDefault();
        }
    };

    proto.setContent = function (documentFragment) {
        /// <summary>Puts the given document fragment into the Modern Canvas, clearing out any previous contents.</summary>
        /// <param name="documentFragment" type="Node" optional="true">The document fragment to be displayed or null to display nothing.</param>
        Debug.assert(Jx.isNullOrUndefined(documentFragment) || Jx.isHTMLElement(documentFragment) || documentFragment.nodeType === Node.DOCUMENT_FRAGMENT_NODE, "Expected a defined documentFragment to be an HTMLElement or DocumentFragment");

        var modernCanvas = this._getModernCanvas(),
            element = this.getElement(),
            range = this.getDocument().createRange();
        range.selectNodeContents(/*@static_cast(Node)*/element);
        range.deleteContents();
        
        var hasIrmQuotedBody = !Jx.isNullOrUndefined(documentFragment);
        if (hasIrmQuotedBody) {
            documentFragment = this.getDocument().adoptNode(documentFragment);
            if (documentFragment) {
                range.insertNode(documentFragment);
            }
        }
        Jx.setClass(modernCanvas.getCanvasElement(), "modernCanvas-hasIrmQuotedBody", hasIrmQuotedBody);
    };

    Object.defineProperty(proto, "disableCopy", {
        enumerable: true,
        get: function () {
            return this._disableCopy;
        },
        set: function (value) {
            Debug.assert(Jx.isBoolean(value), "Expected disableCopy to be a boolean");
            this._disableCopy = value;
            Jx.setClass(this.getElement(), "disableCopy", value);
        }
    });

    ModernCanvas.Plugins.IrmQuotedBodyCopyCommand = /*@constructor*/function (irmQuotedBody, copyCommand) {
        /// <summary>Provides a copy command that works in both the IRM quoted body and the Modern Canvas.</summary>
        /// <param name="irmQuotedBody" type="ModernCanvas.Plugins.IrmQuotedBody">The IRM quoted body plugin.</param>
        /// <param name="copyCommand" type="ModernCanvas.Command">The original copy command for the Modern Canvas.</param>
        Debug.assert(Jx.isObject(irmQuotedBody), "Expected irmQuotedBody to be a valid IRM quoted body");
        Debug.assert(Jx.isObject(copyCommand), "Expected copyCommand to be a valid command");

        ModernCanvas.Command.call(this, copyCommand.id, copyCommand.run, { enabledOn: copyCommand.enabledOn, undoable: copyCommand.undoable });

        this._irmQuotedBody = irmQuotedBody;
        this._copyCommand = copyCommand;
    };

    Jx.inherit(ModernCanvas.Plugins.IrmQuotedBodyCopyCommand, ModernCanvas.Command);

    ModernCanvas.Plugins.IrmQuotedBodyCopyCommand.prototype.isEnabled = function (enabledInformation) {
        /// <summary>Defines if this command should be enabled.</summary>
        /// <param name="enabledInformation" type="__ModernCanvas.EnabledInformation">The information to use to determine if the command should be enabled.</param>
        /// <returns type="Boolean">True if the command should be enabled, false otherwise.</returns>
        var irmQuotedBody = this._irmQuotedBody,
            range = irmQuotedBody.getIframeSelectionRange();
        if (range) {
            if (this.isDescendantOf(range.commonAncestorContainer, /*@static_cast(Node)*/irmQuotedBody.getElement())) {
                // If there is a non-empty range in the IRM quoted body and copy is not disabled, we can allow the copy.
                return !range.collapsed && !irmQuotedBody.disableCopy;
            }
        }

        // Delegate to the default command if selection is not in the IRM quoted body element.
        return this._copyCommand.isEnabled(enabledInformation);
    };

});

//
// Copyright (C) Microsoft. All rights reserved.
//

});
