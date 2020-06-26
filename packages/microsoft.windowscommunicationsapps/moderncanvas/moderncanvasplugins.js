Jx.delayGroup("CanvasPlugins", function() {
    ModernCanvas.Plugins = {};
    Jx.delayDefine(ModernCanvas.Plugins, "AutoResize", function() {
        ModernCanvas.Plugins.AutoResize = function() {
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
            this._resetCalledWhileSuspended = false
        }
        ;
        Jx.inherit(ModernCanvas.Plugins.AutoResize, ModernCanvas.Component);
        var n = ModernCanvas.Plugins.AutoResize.prototype;
        n.activateUI = function() {
            if (ModernCanvas.mark("AutoResize.activateUI", ModernCanvas.LogEvent.start),
            !this._active && !Jx.isNullOrUndefined(this.getWindow())) {
                var t = this._modernCanvas = this.getParent()
                  , n = this._canvasElement = t.getCanvasElement();
                this._scrollableElement = t.getScrollableElement();
                this._iframeElement = this.getWindow().frameElement;
                this._iframeBodyElement = this.getDocument().body;
                this._createIframeStyleElementIfNeeded();
                this._startResetTimer(0);
                this._ignoreNextCanvasResizeEvent();
                this._iframeBodyElement.addEventListener("mselementresize", this._onCanvasResize, false);
                n.addEventListener("mselementresize", this._onCanvasResize, false);
                n.addEventListener("mscontrolresizestart", this._onResizeStart, false);
                n.addEventListener("mscontrolresizeend", this._onResizeEnd, false);
                n.addEventListener("dragend", this._onCanvasResize, false);
                n.addEventListener("drop", this._onCanvasResize, false);
                n.addEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false);
                this._scrollableElement.addEventListener("mselementresize", this._onScrollableElementResize, false);
                this._scrollableElement.addEventListener("scroll", this._onScroll, false);
                window.addEventListener("resize", this._onWindowResize, false);
                this._iframeBodyElement.style.overflow = "visible";
                Jx.Component.activateUI.call(this);
                this._active = true;
                this._isSuspended = false;
                this._resetCalledWhileSuspended = false;
                this._shouldScrollSelectionIntoView = true;
                ModernCanvas.mark("AutoResize.activateUI", ModernCanvas.LogEvent.stop)
            }
        }
        ;
        n._createIframeStyleElementIfNeeded = function() {
            if (!this._iframeStyleElement) {
                var n = this.getDocument();
                this._iframeStyleElement = n.createElement("style");
                n.querySelector("head").appendChild(this._iframeStyleElement)
                
                this._iframeStyleElement.sheet.insertRule("body.modernCanvas > .modernCanvas-visible {}", 0);
                this._iframeStyleElement.sheet.insertRule("body.modernCanvas > .modernCanvas-content {}", 1);
            }
        }
        ;
        n.deactivateUI = function() {
            if (ModernCanvas.mark("AutoResize.deactivateUI", ModernCanvas.LogEvent.start),
            this._active) {
                Jx.Component.deactivateUI.call(this);
                var n = this._canvasElement;
                this._iframeBodyElement.removeEventListener("mselementresize", this._onCanvasResize, false);
                n.removeEventListener("mselementresize", this._onCanvasResize, false);
                n.removeEventListener("mscontrolresizestart", this._onResizeStart, false);
                n.removeEventListener("mscontrolresizeend", this._onResizeEnd, false);
                n.removeEventListener("dragend", this._onCanvasResize, false);
                n.removeEventListener("drop", this._onCanvasResize, false);
                n.removeEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false);
                this._scrollableElement.removeEventListener("mselementresize", this._onScrollableElementResize, false);
                this._scrollableElement.removeEventListener("scroll", this._onScroll, false);
                window.removeEventListener("resize", this._onWindowResize, false);
                this._clearResetTimer();
                this._active = false;
                ModernCanvas.mark("AutoResize.deactivateUI", ModernCanvas.LogEvent.stop)
            }
        }
        ;
        n.suspendEvents = function() {
            this._canvasElement.removeEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false);
            this._isSuspended = true;
            ModernCanvas.Component.prototype.suspendEvents.call(this)
        }
        ;
        n.resumeEvents = function() {
            this._isDirty = true;
            this._isSuspended = false;
            var n = this;
            this.getWindow().setImmediate(function() {
                n._canvasElement && n._canvasElement.addEventListener("DOMSubtreeModified", n._onDOMSubtreeModified, false)
            });
            this._resetCalledWhileSuspended && (this._resetCalledWhileSuspended = false,
            this._startResetTimer(0));
            ModernCanvas.Component.prototype.resumeEvents.call(this)
        }
        ;
        n._onDOMSubtreeModified = function() {
            ModernCanvas.mark("AutoResize._onDOMSubtreeModified", ModernCanvas.LogEvent.start);
            this._isDirty = true;
            ModernCanvas.mark("AutoResize._onDOMSubtreeModified", ModernCanvas.LogEvent.stop)
        }
        ;
        n._reset = function() {
            var n, t, i;
            if (ModernCanvas.mark("AutoResize._reset", ModernCanvas.LogEvent.start),
            n = this._scrollableElement,
            !this._active || this._isSuspended || n.offsetWidth === 0) {
                this._isSuspended && (this._resetCalledWhileSuspended = true);
                ModernCanvas.mark("AutoResize._reset", ModernCanvas.LogEvent.stop);
                return
            }
            t = n.scrollTop;
            i = n.scrollLeft;
            this._setIframeWidthStyles();
            this._setIframeHeightStyles(null);
            this._setIframeSize(null, null);
            this._defaultWidth = this._iframeElement.offsetWidth;
            this._defaultHeight = this._iframeElement.offsetHeight;
            this._resize();
            this._setIframeHeightStyles(this._defaultHeight - this._topPadding);
            n.scrollTop = t;
            n.scrollLeft = i;
            this._shouldScrollSelectionIntoView && (this.scrollSelectionIntoView(),
            this._shouldScrollSelectionIntoView = false);
            this._clearResetTimer();
            this._isDirty = false;
            ModernCanvas.mark("AutoResize._reset", ModernCanvas.LogEvent.stop)
        }
        ;
        n._startResetTimer = function(n) {
            this._clearResetTimer();
            n = Jx.isNumber(n) ? n : this._defaultTimeoutReset;
            n <= 10 ? this._resetImmediateHandle = this.getWindow().setImmediate(this._reset) : this._resetTimeoutHandle = this.getWindow().setTimeout(this._reset, n)
        }
        ;
        n._clearResetTimer = function() {
            var n = this.getWindow();
            Jx.isNullOrUndefined(n) || (Jx.isNumber(this._resetTimeoutHandle) && (this.getWindow().clearTimeout(this._resetTimeoutHandle),
            this._resetTimeoutHandle = null),
            Jx.isNumber(this._resetImmediateHandle) && (this.getWindow().clearImmediate(this._resetImmediateHandle),
            this._resetImmediateHandle = null))
        }
        ;
        n._onWindowResize = function() {
            ModernCanvas.mark("AutoResize._onWindowResize", ModernCanvas.LogEvent.start);
            this.deactivateUI();
            this.getWindow().setImmediate(this.activateUI);
            ModernCanvas.mark("AutoResize._onWindowResize", ModernCanvas.LogEvent.stop)
        }
        ;
        n._onScrollableElementResize = function() {
            ModernCanvas.mark("AutoResize._onScrollableElementResize", ModernCanvas.LogEvent.start);
            this._ignoreCanvasResizeEvent || (this._startResetTimer(),
            this._shouldScrollSelectionIntoView = document.activeElement === this._iframeElement);
            ModernCanvas.mark("AutoResize._onScrollableElementResize", ModernCanvas.LogEvent.stop)
        }
        ;
        n._onScroll = function() {
            ModernCanvas.mark("AutoResize._onScroll", ModernCanvas.LogEvent.start);
            this._isDirty && this._reset();
            ModernCanvas.mark("AutoResize._onScroll", ModernCanvas.LogEvent.stop)
        }
        ;
        n._onCanvasResize = function() {
            ModernCanvas.mark("AutoResize._onCanvasResize", ModernCanvas.LogEvent.start);
            this._ignoreCanvasResizeEvent || this._resize();
            ModernCanvas.mark("AutoResize._onCanvasResize", ModernCanvas.LogEvent.stop)
        }
        ;
        n._onResizeStart = function(n) {
            ModernCanvas.mark("AutoResize._onResizeStart", ModernCanvas.LogEvent.start);
            var t = n.srcElement;
            t && t.addEventListener("mselementresize", this._onCanvasResize, false);
            ModernCanvas.mark("AutoResize._onResizeStart", ModernCanvas.LogEvent.stop)
        }
        ;
        n._onResizeEnd = function(n) {
            ModernCanvas.mark("AutoResize._onResizeEnd", ModernCanvas.LogEvent.start);
            var t = n.srcElement;
            t && t.removeEventListener("mselementresize", this._onCanvasResize, false);
            this._startResetTimer(0);
            ModernCanvas.mark("AutoResize._onResizeEnd", ModernCanvas.LogEvent.stop)
        }
        ;
        n._resize = function() {
            var u, f;
            ModernCanvas.mark("AutoResize._resize", ModernCanvas.LogEvent.start);
            var i = this._getContentWidth()
              , e = this._wasWiderThanDefaultWidth
              , n = i > this._defaultWidth
              , r = this._getContentHeight()
              , o = this._wasTallerThanDefaultHeight
              , t = r > this._defaultHeight
              , s = Number(t) ^ Number(o) | Number(n) ^ Number(e);
            (Boolean(s) || n || t) && (u = n ? i : null,
            f = t ? r : null,
            this._setIframeSize(u, f));
            this._wasWiderThanDefaultWidth = n;
            this._wasTallerThanDefaultHeight = t;
            ModernCanvas.mark("AutoResize._resize", ModernCanvas.LogEvent.stop)
        }
        ;
        n._getContentHeight = function() {
            ModernCanvas.mark("AutoResize._getContentHeight", ModernCanvas.LogEvent.start);
            var n = this._iframeBodyElement.scrollHeight - this._extraHeightAdded;
            return ModernCanvas.mark("AutoResize._getContentHeight", ModernCanvas.LogEvent.stop),
            n
        }
        ;
        n._getContentWidth = function() {
            var i, n, t, r;
            for (ModernCanvas.mark("AutoResize._getContentWidth", ModernCanvas.LogEvent.start),
            i = this._iframeBodyElement.children,
            n = 0,
            t = 0,
            r = i.length; t < r; t++)
                n = Math.max(n, i[t].scrollWidth);
            return ModernCanvas.mark("AutoResize._getContentWidth", ModernCanvas.LogEvent.stop),
            n
        }
        ;
        n._setIframeSize = function(n, t) {
            ModernCanvas.mark("AutoResize._setIframeSize", ModernCanvas.LogEvent.start);
            Jx.isNullOrUndefined(n) ? Jx.isNonEmptyString(this._iframeElement.style.width) && (this._iframeElement.style.width = "") : (Jx.isNumber(t) && (n += this._scrollBarThickness),
            this._iframeElement.style.width = n.toString() + "px");
            this._extraHeightAdded = 0;
            Jx.isNullOrUndefined(t) ? (Jx.isNonEmptyString(this._iframeElement.style.height) && (this._iframeElement.style.height = ""),
            this._iframeBodyElement.classList.remove("modernCanvas-exceededDefaultHeight")) : (Jx.isNumber(n) && (t += this._scrollBarThickness,
            this._extraHeightAdded = this._scrollBarThickness),
            this._iframeElement.style.height = t.toString() + "px",
            this._iframeBodyElement.classList.add("modernCanvas-exceededDefaultHeight"));
            this._ignoreNextCanvasResizeEvent();
            ModernCanvas.mark("AutoResize._setIframeSize", ModernCanvas.LogEvent.stop)
        }
        ;
        n._ignoreNextCanvasResizeEvent = function() {
            this._ignoreCanvasResizeEvent = true;
            Jx.isNumber(this._setImmediateHandle) || (this._setImmediateHandle = this.getWindow().setImmediate(this._stopIgnoringCanvasResizeEvent))
        }
        ;
        n._stopIgnoringCanvasResizeEvent = function() {
            this._ignoreCanvasResizeEvent = false;
            this._setImmediateHandle = null
        }
        ;
        n._setIframeWidthStyles = function() {
            var r;
            ModernCanvas.mark("AutoResize._setIframeWidthStyles", ModernCanvas.LogEvent.start);
            var u = this._iframeElement.parentNode.offsetWidth
              , t = Jx.isRtl() ? "paddingRight" : "paddingLeft"
              , f = Jx.isRtl() ? "paddingLeft" : "paddingRight"
              , e = this.getWindow().getComputedStyle(this._canvasElement);
            this._topPadding = parseInt(e.paddingTop.replace("px", ""), 10);
            var o = parseInt(e[t].replace("px", ""), 10)
              , i = u - o * 2
              , n = this._iframeStyleElement.sheet.cssRules[0].style;
            n.maxWidth !== i + "px" && (n.maxWidth = i + "px");
            Jx.isNonEmptyString(n[t]) && (n[t] = "");
            r = u - (o + i);
            n[f] !== r + "px" && (n[f] = r + "px");
            ModernCanvas.mark("AutoResize._setIframeWidthStyles", ModernCanvas.LogEvent.stop)
        }
        ;
        n._setIframeHeightStyles = function(n) {
            ModernCanvas.mark("AutoResize._setIframeHeightStyles", ModernCanvas.LogEvent.start);
            n = n || 0;
            var t = this._iframeStyleElement.sheet.cssRules[1].style;
            t.minHeight !== n + "px" && (t.minHeight = n + "px");
            ModernCanvas.mark("AutoResize._setIframeHeightStyles", ModernCanvas.LogEvent.stop)
        }
        ;
        n._active = false;
        n._canvasElement = null;
        n._defaultHeight = 0;
        n._defaultWidth = 0;
        n._defaultTimeoutReset = 350;
        n._extraHeightAdded = 0;
        n._iframeElement = null;
        n._iframeBodyElement = null;
        n._iframeStyleElement = null;
        n._ignoreCanvasResizeEvent = false;
        n._modernCanvas = null;
        n._resetImmediateHandle = null;
        n._resetTimeoutHandle = null;
        n._scrollableElement = null;
        n._scrollBarThickness = 20;
        n._shouldScrollSelectionIntoView = false;
        n._setImmediateHandle = null;
        n._wasTallerThanDefaultHeight = false;
        n._wasWiderThanDefaultWidth = false
    });
    Jx.delayDefine(ModernCanvas.Plugins, "DefaultFont", function() {
        "use strict";
        ModernCanvas.Plugins.DefaultFont = function() {
            this._isMail = window.Mail && !window.Share;
            this._commandsLoaded = false;
            this._clearFormattingCommand = null;
            this._canvas = null
        }
        ;
        Jx.inherit(ModernCanvas.Plugins.DefaultFont, ModernCanvas.Component);
        var n = ModernCanvas.Plugins.DefaultFont.prototype;
        n.activateUI = function() {
            this._canvas || (this._canvas = this.getParent());
            this._isMail && Mail.Globals.appSettings.addListener(Mail.AppSettings.Events.fontSettingChanged, this._changeFont, this);
            this._setupCommands()
        }
        ;
        n.deactivateUI = function() {
            this._isMail && Mail.Globals.appSettings.removeListener(Mail.AppSettings.Events.fontSettingChanged, this._changeFont, this)
        }
        ;
        n._setupCommands = function() {
            if (!this._commandsLoaded) {
                var t = this._canvas
                  , n = t.components.commandManager;
                this._clearFormattingCommand = n.getCommand("clearFormatting");
                n.setCommand(new ModernCanvas.Command("clearFormatting",this._clearFormatting.bind(this)));
                n.setCommand(new ModernCanvas.Command("selectAll",this._selectAll.bind(this),{
                    undoable: false
                }));
                this._commandsLoaded = true
            }
        }
        ;
        n._selectAll = function() {
            var t = this.getSelectionRange().cloneRange(), i = this._canvas.getCanvasElement(), n;
            i.firstChild && (t.setStart(i.firstChild, 0),
            n = i.lastChild,
            Jx.isValidNumber(n.length) ? t.setEnd(n, n.length) : this.isVoidElement(n) ? t.setEndAfter(n) : t.setEnd(n, n.childNodes.length),
            this.replaceSelection(t))
        }
        ;
        n._styleDiv = function(n, t, i, r, u) {
            if (t)
                for (var f = n.style.length; f--; )
                    n.style[n.style[f]] = "";
            r && (n.style.fontSize = r);
            u && (n.style.color = u);
            i && (n.style.fontFamily = i);
            n.classList.add("defaultFont")
        }
        ;
        n._changeFont = function() {
            var t;
            var u = this._canvas, i, n = Mail.Globals.appSettings, f = n.composeFontFamily, e = n.composeFontSize, o = n.composeFontColor, r = u.getDocument().querySelectorAll(".defaultFont") || [];
            for (t = r.length; t--; )
                i = r[t],
                this._styleDiv(i, false, f, e, o)
        }
        ;
        n._clearFormatting = function(n) {
            var t = this.getSelectionRange(), o;
            if (!t.collapsed) {
                for (var u = this, f = this.getElementFromNode(t.commonAncestorContainer), s = t.startContainer.ownerDocument, e = s.createNodeIterator(f, NodeFilter.SHOW_ELEMENT, function(n) {
                    return n !== f && u.intersectsNode(t, n) && u.isNodeName(n, "DIV") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                }, false), i = e.nextNode(), r = Mail.Globals.appSettings, h = r.composeFontFamily, c = r.composeFontSize, l = r.composeFontColor; i; )
                    this._styleDiv(i, true, h, c, l),
                    i = e.nextNode();
                o = function(n) {
                    return !(this.isNodeName(n, "DIV") && n.classList.contains("defaultFont"))
                }
                .bind(this);
                this._clearFormattingCommand.run(n, o)
            }
        }
    });
    Jx.delayDefine(ModernCanvas.Plugins, "DirtyTracker", function() {
        ModernCanvas.Plugins.DirtyTracker = function() {
            ModernCanvas.Component.call(this);
            this._isDirty = false;
            this._paused = false;
            this._modernCanvas = null;
            this._onDOMSubtreeModified = this._onDOMSubtreeModified.bind(this)
        }
        ;
        Jx.inherit(ModernCanvas.Plugins.DirtyTracker, ModernCanvas.Component);
        var n = ModernCanvas.Plugins.DirtyTracker.prototype;
        n.activateUI = function() {
            var n = this._modernCanvas = this._modernCanvas || this.getParent();
            n.addListener("afteractivate", this._postActivate, this);
            Jx.Component.activateUI.call(this)
        }
        ;
        n._postActivate = function() {
            var n = this;
            this.getWindow().setImmediate(function() {
                n._modernCanvas.addEventListener("DOMSubtreeModified", n._onDOMSubtreeModified, false)
            })
        }
        ;
        n.deactivateUI = function() {
            Jx.Component.deactivateUI.call(this);
            this._modernCanvas.removeListener("afteractivate", this._postActivate, this);
            this._paused || (this._isDirty = false);
            this._modernCanvas.removeEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false)
        }
        ;
        n.pause = function() {
            this._paused = true
        }
        ;
        n.resume = function() {
            this._paused = false
        }
        ;
        n._onDOMSubtreeModified = function() {
            this._paused || (this._isDirty = true,
            this._modernCanvas.removeEventListener("DOMSubtreeModified", this._onDOMSubtreeModified, false),
            Jx.log.info("DirtyTracker: is dirty"))
        }
        ;
        Object.defineProperty(n, "isDirty", {
            enumerable: true,
            get: function() {
                return this._isDirty
            }
        })
    });
    Jx.delayDefine(ModernCanvas.Plugins, "ImageResize", function() {
        ModernCanvas.Plugins.ImageResize = function() {
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
            this._height = 0
        }
        ;
        Jx.inherit(ModernCanvas.Plugins.ImageResize, ModernCanvas.Component);
        var n = ModernCanvas.Plugins.ImageResize.prototype;
        n.activateUI = function() {
            this._canvasElement || (this._canvasElement = this.getParent().getCanvasElement());
            this._canvasElement.addEventListener("mscontrolresizestart", this._onResize, false);
            this._canvasElement.addEventListener("MSPointerDown", this._onPointerDown, false)
        }
        ;
        n.deactivateUI = function() {
            this._canvasElement.removeEventListener("mscontrolresizestart", this._onResize, false);
            this._canvasElement.removeEventListener("MSPointerDown", this._onPointerDown, false)
        }
        ;
        n._onResize = function(n) {
            if (n && this.isNodeName(n.target, "IMG")) {
                var t = this._image = n.target;
                n.preventDefault();
                this._xModifier = this._lastX < this._image.offsetLeft + .25 * t.offsetWidth ? -1 : this._lastX > this._image.offsetLeft + .75 * t.offsetWidth ? 1 : 0;
                this._yModifier = this._lastY < this._image.offsetTop + .25 * t.offsetHeight ? -1 : this._lastY > this._image.offsetTop + .75 * t.offsetHeight ? 1 : 0;
                this._lastX = null;
                this._lastY = null;
                this._aspectRatioValid = false;
                this._canvasElement.addEventListener("MSPointerMove", this._onPointerMove, false);
                this._canvasElement.addEventListener("MSPointerUp", this._onPointerReleased, false);
                this._width = t.width;
                this._height = t.height
            }
        }
        ;
        n._onPointerDown = function(n) {
            this._lastX = n.x;
            this._lastY = n.y
        }
        ;
        n._onPointerMove = function(n) {
            var t, i, e;
            if (this._pointerId === null && (this._pointerId = n.pointerId,
            this._canvasElement.msSetPointerCapture(this._pointerId)),
            this._lastX !== null && this._lastY !== null) {
                var r = this._image
                  , u = (n.screenX - this._lastX) * this._xModifier
                  , f = (n.screenY - this._lastY) * this._yModifier;
                t = r.width;
                i = r.height;
                n.shiftKey ? (this._aspectRatioValid = false,
                r.removeAttribute("data-ratio"),
                t = t + u >= 1 ? Math.round(t + u) : 1,
                i = i + f >= 1 ? Math.round(i + f) : 1) : (this._aspectRatioValid || (e = parseFloat(r.getAttribute("data-ratio")),
                isNaN(e) ? (this._aspectRatio = t / i,
                r.setAttribute("data-ratio", this._aspectRatio)) : this._aspectRatio = e,
                this._aspectRatioValid = true),
                Math.abs(u) > Math.abs(f) ? (t = t + u >= 1 ? Math.round(t + u) : 1,
                i = Math.round(t / this._aspectRatio) || 1) : (i = i + f >= 1 ? Math.round(i + f) : 1,
                t = Math.round(i * this._aspectRatio) || 1));
                r.style.width = t + "px";
                r.style.height = i + "px"
            }
            this._lastX = n.screenX;
            this._lastY = n.screenY
        }
        ;
        n._onPointerReleased = function() {
            var r = this._image.style.width, u = this._image.style.height, i = this.getParent(), n = this._image, t;
            n.style.width = this._width + "px";
            n.style.height = this._height + "px";
            Jx.raiseEvent(i, "beforeundoablechange");
            n.style.width = r;
            n.style.height = u;
            Jx.raiseEvent(i, "undoablechange");
            this._image = null;
            this._lastX = null;
            this._lastY = null;
            this._pointerId !== null && (this._canvasElement.msReleasePointerCapture(this._pointerId),
            this._pointerId = null);
            this._canvasElement.removeEventListener("MSPointerMove", this._onPointerMove, false);
            this._canvasElement.removeEventListener("MSPointerUp", this._onPointerReleased, false);
            t = document.createEvent("Event");
            t.initEvent("mscontrolresizeend", true, true);
            this._canvasElement.dispatchEvent(t)
        }
    });
    Jx.delayDefine(ModernCanvas.Plugins, "Indent", function() {
        var n = window.ModernCanvas, t;
        n.Plugins.Indent = function() {
            this._commandManager = null;
            n.Component.call(this)
        }
        ;
        Jx.inherit(n.Plugins.Indent, n.Component);
        t = n.Plugins.Indent.prototype;
        t.activateUI = function() {
            for (var r = this.getParent(), t = r.components.shortcutManager, u = ["tab", "shift+tab", "f6", "shift+f6"], i = u.length; i--; )
                t.removeShortcut(u[i]);
            t.setShortcut("tab", "indentTab");
            t.setShortcut("shift+tab", "outdentTab");
            t.setShortcut("f6", "focusNext");
            t.setShortcut("shift+f6", "focusPrevious");
            this._commandManager = r.components.commandManager;
            this._commandManager.setCommand(new n.Command("indentTab",this._commandManager._indent.bind(this._commandManager)));
            this._commandManager.setCommand(new n.Command("outdentTab",this._outdent.bind(this)))
        }
        ;
        t._outdent = function(n) {
            var u = this.getParent(), r = this.getSelectionRange(), i = false, t, f;
            if (r) {
                for (t = r.commonAncestorContainer,
                f = u.getCanvasElement(); t !== f; ) {
                    if (this.isNodeName(t, "LI", "BLOCKQUOTE")) {
                        i = true;
                        break
                    }
                    t = t.parentNode
                }
                i = i || this._containsListOrIndent(r)
            }
            i ? this._commandManager._outdent(n) : Jx.raiseEvent(u, "command", {
                command: "focusPrevious"
            })
        }
        ;
        t._containsListOrIndent = function(n) {
            var t = n.commonAncestorContainer
              , r = t.ownerDocument
              , i = this
              , u = r.createNodeIterator(t, NodeFilter.SHOW_ELEMENT, function(t) {
                return i.intersectsNode(n, t) && i.isNodeName(t, "LI", "BLOCKQUOTE") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }, false);
            return Boolean(u.nextNode())
        }
    });
    Jx.delayDefine(ModernCanvas.Plugins, "IrmQuotedBody", function() {
        ModernCanvas.Plugins.IrmQuotedBody = function() {
            ModernCanvas.Component.call(this);
            this._disableCopy = false;
            this._element = null;
            this._modernCanvas = null;
            this._preventCopy = this._preventCopy.bind(this)
        }
        ;
        Jx.inherit(ModernCanvas.Plugins.IrmQuotedBody, ModernCanvas.Component);
        var n = ModernCanvas.Plugins.IrmQuotedBody.prototype;
        n.activateUI = function() {
            var n = this.getElement();
            n.addEventListener("contextmenu", this._preventCopy, false);
            n.addEventListener("MSHoldVisual", this._preventCopy, false);
            Jx.Component.activateUI.call(this)
        }
        ;
        n.deactivateUI = function() {
            Jx.Component.deactivateUI.call(this);
            var n = this.getElement();
            n.removeEventListener("contextmenu", this._preventCopy, false);
            n.removeEventListener("MSHoldVisual", this._preventCopy, false)
        }
        ;
        n._getModernCanvas = function() {
            var n = this._modernCanvas, t, i;
            return Jx.isNullOrUndefined(n) && (n = this._modernCanvas = this.getParent(),
            t = n.components.commandManager,
            i = t.getCommand("copy"),
            t.setCommand(new ModernCanvas.Plugins.IrmQuotedBodyCopyCommand(this,i))),
            n
        }
        ;
        n.getElement = function() {
            var n = this._element, t;
            return Jx.isNullOrUndefined(n) && (t = this.getDocument(),
            n = this._element = t.createElement("div"),
            n.classList.add("modernCanvas-irmQuotedBody"),
            n.classList.add("modernCanvas-visible"),
            n.id = "modernCanvasIrmQuotedBody",
            t.body.appendChild(n)),
            n
        }
        ;
        n._preventCopy = function(n) {
            this._disableCopy && n.preventDefault()
        }
        ;
        n.setContent = function(n) {
            var i;
            var r = this._getModernCanvas()
              , u = this.getElement()
              , t = this.getDocument().createRange();
            t.selectNodeContents(u);
            t.deleteContents();
            i = !Jx.isNullOrUndefined(n);
            i && (n = this.getDocument().adoptNode(n),
            n && t.insertNode(n));
            Jx.setClass(r.getCanvasElement(), "modernCanvas-hasIrmQuotedBody", i)
        }
        ;
        Object.defineProperty(n, "disableCopy", {
            enumerable: true,
            get: function() {
                return this._disableCopy
            },
            set: function(n) {
                this._disableCopy = n;
                Jx.setClass(this.getElement(), "disableCopy", n)
            }
        });
        ModernCanvas.Plugins.IrmQuotedBodyCopyCommand = function(n, t) {
            ModernCanvas.Command.call(this, t.id, t.run, {
                enabledOn: t.enabledOn,
                undoable: t.undoable
            });
            this._irmQuotedBody = n;
            this._copyCommand = t
        }
        ;
        Jx.inherit(ModernCanvas.Plugins.IrmQuotedBodyCopyCommand, ModernCanvas.Command);
        ModernCanvas.Plugins.IrmQuotedBodyCopyCommand.prototype.isEnabled = function(n) {
            var t = this._irmQuotedBody
              , i = t.getIframeSelectionRange();
            return i && this.isDescendantOf(i.commonAncestorContainer, t.getElement()) ? !i.collapsed && !t.disableCopy : this._copyCommand.isEnabled(n)
        }
    })
})
