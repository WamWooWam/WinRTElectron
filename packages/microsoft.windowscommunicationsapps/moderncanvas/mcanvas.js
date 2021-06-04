function rgb2hex(rgb) {
    if (rgb) {
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
    }
    return rgb;
}



Jx.delayDefine(window, "ModernCanvas", function () {
    var n, t;
    $include("$(canvasRoot)/moderncanvas.css");
    window.ModernCanvas = {};
    ModernCanvas.DurableRange = function (n) {
        var t = (new Date).getTime(),
            i;
        for (this._endId = "durablerange end" + t,
            this._startId = "durablerange start" + t,
            this._doc = n.commonAncestorContainer.ownerDocument,
            this._root = n.commonAncestorContainer; this._root.parentNode !== null;)
            this._root = this._root.parentNode;
        this._endNode = this._doc.createComment(this._endId);
        this._startNode = this._doc.createComment(this._startId);
        this._workingRange = n.cloneRange();
        i = n.cloneRange();
        this._workingRange.collapse(false);
        this._workingRange.insertNode(this._endNode);
        i.insertNode(this._startNode);
        this._update()
    };
    ModernCanvas.DurableRange.prototype._update = function () {
        var n = this._findNodes();
        this._workingRange.setStartAfter(n[0]);
        this._workingRange.setEndBefore(n[1])
    };
    ModernCanvas.DurableRange.prototype._findNodes = function () {
        if (ModernCanvas.Component.prototype.isDescendantOf(this._startNode, this._root) || (this._startNode = null),
            ModernCanvas.Component.prototype.isDescendantOf(this._endNode, this._root) || (this._endNode = null),
            !this._startNode || !this._endNode)
            for (var t = this._doc.createNodeIterator(this._doc, NodeFilter.SHOW_COMMENT, null, false), n = t.nextNode(); n;) {
                if (n.data === this._endId && (this._endNode = n),
                    n.data === this._startId && (this._startNode = n),
                    this._startNode && this._endNode)
                    break;
                n = t.nextNode()
            }
        return [this._startNode, this._endNode]
    };
    ModernCanvas.DurableRange.prototype.dispose = function () {
        var n = this._findNodes();
        n[0] && n[0].parentNode && n[0].parentNode.removeChild(n[0]);
        n[1] && n[1].parentNode && n[1].parentNode.removeChild(n[1])
    };
    Object.defineProperty(ModernCanvas.DurableRange.prototype, "range", {
        enumerable: true,
        get: function () {
            return this._update(),
                this._workingRange
        }
    });
    ModernCanvas._regexFileProtocol = /^file:\/\//i;
    ModernCanvas.isFileProtocol = function (n) {
        return ModernCanvas._regexFileProtocol.test(n)
    };
    ModernCanvas.runWorkersSynchronously = function (n) {
        for (var i, t = 0, r = n.length; t < r; t++)
            i = n[t],
            i.run(true),
            Jx.dispose(i),
            n[t] = null
    };
    ModernCanvas.HtmlWorker = function (n, t, i) {
        this._element = n;
        this._defaultNumIterations = 10;
        Jx.isObject(t) && (this._nodeList = t,
            this._currentIndex = t.length - 1,
            this._callback = i)
    };
    ModernCanvas.HtmlWorker.prototype.run = function (n) {
        var t, r;
        ModernCanvas.mark("ModernCanvas.HtmlWorker.run", ModernCanvas.LogEvent.start);
        var f = this._nodeList,
            u = this._currentIndex,
            i = n ? 0 : Math.max(u - this._defaultNumIterations, 0),
            e = this._callback;
        for (t = u; t >= i; t--)
            e.call(this, f[t]);
        return this._currentIndex = i - 1,
            r = i > 0,
            r || Jx.dispose(this),
            ModernCanvas.mark("ModernCanvas.HtmlWorker.run", ModernCanvas.LogEvent.stop),
            Jx.Scheduler.repeat(r)
    };
    ModernCanvas.HrefHtmlWorker = function (n) {
        ModernCanvas.HtmlWorker.call(this, n, n.querySelectorAll("a, area"), this.cleanHref);
        var t = window.location;
        this._baseURL = t.href + "#";
        this._baseProtocol = t.protocol;
        this._onClick = this._onClick.bind(this);
        n.addEventListener("click", this._onClick, false)
    };
    Jx.inherit(ModernCanvas.HrefHtmlWorker, ModernCanvas.HtmlWorker);
    ModernCanvas.HrefHtmlWorker.prototype._onClick = function (n) {
        var t = n.target,
            i = this._element,
            r = t.getAttribute("usemap");
        if (Jx.isNonEmptyString(r)) {
            this.run(true);
            return
        }
        while (Boolean(t) && t !== i)
            (t.nodeName === "A" || t.nodeName === "AREA") && this.cleanHref(t),
            t = t.parentNode
    };
    ModernCanvas.HrefHtmlWorker.prototype.dispose = function () {
        this._element.removeEventListener("click", this._onClick, false)
    };
    ModernCanvas.HrefHtmlWorker.prototype.cleanHref = function (n) {
        var t, i;
        try {
            t = n.href
        } catch (r) {
            Jx.log.exception("Failed to retrieve href", r);
            n.removeNode(false);
            return
        }
        Jx.isNonEmptyString(t) && (t.indexOf(this._baseProtocol) === 0 ? (Jx.log.warning("unsafe href detected: " + t),
                n.removeNode(false)) : n.target = t.indexOf(this._baseURL) === 0 ? "_self" : "_parent",
            ModernCanvas.isFileProtocol(t) && (i = n.getAttribute("href"),
                ModernCanvas.isFileProtocol(i) || n.setAttribute("href", "file://" + i)))
    };
    ModernCanvas.TabIndexHtmlWorker = function (n) {
        ModernCanvas.HtmlWorker.call(this, n, n.querySelectorAll("[tabindex], a, area, button, img, input, object, select, table, textarea"), this.cleanTabIndex);
        this._onBeforeActivate = this._onBeforeActivate.bind(this);
        n.addEventListener("beforeactivate", this._onBeforeActivate, false)
    };
    Jx.inherit(ModernCanvas.TabIndexHtmlWorker, ModernCanvas.HtmlWorker);
    ModernCanvas.TabIndexHtmlWorker.prototype._onBeforeActivate = function () {
        this.run(true)
    };
    ModernCanvas.TabIndexHtmlWorker.prototype.dispose = function () {
        this._element.removeEventListener("beforeactivate", this._onBeforeActivate, false)
    };
    ModernCanvas.TabIndexHtmlWorker.prototype.cleanTabIndex = function (n) {
        n.tabIndex = -1
    };
    ModernCanvas.ContentEditableTabIndexHtmlWorker = function (n) {
        ModernCanvas.TabIndexHtmlWorker.call(this, n)
    };
    Jx.inherit(ModernCanvas.ContentEditableTabIndexHtmlWorker, ModernCanvas.TabIndexHtmlWorker);
    ModernCanvas.ContentEditableTabIndexHtmlWorker.prototype._isContentEditableResizable = {
        button: true,
        img: true,
        input: true,
        object: true,
        select: true,
        table: true,
        textarea: true
    };
    ModernCanvas.ContentEditableTabIndexHtmlWorker.prototype.cleanTabIndex = function (n) {
        this._isContentEditableResizable[n.nodeName.toLowerCase()] ? n.tabIndex = -1 : n.removeAttribute("tabindex")
    };
    ModernCanvas.TitleAttributeHtmlWorker = function (n) {
        ModernCanvas.HtmlWorker.call(this, n, n.querySelectorAll("[title]"), this.cleanTitleAttribute);
        this._onMouseOver = this._onMouseOver.bind(this);
        n.addEventListener("mouseover", this._onMouseOver, false)
    };
    Jx.inherit(ModernCanvas.TitleAttributeHtmlWorker, ModernCanvas.HtmlWorker);
    ModernCanvas.TitleAttributeHtmlWorker.prototype._onMouseOver = function (n) {
        for (var t = n.target, i = this._element; Boolean(t) && t !== i;)
            this.cleanTitleAttribute(t),
            t = t.parentNode
    };
    ModernCanvas.TitleAttributeHtmlWorker.prototype.dispose = function () {
        this._element.removeEventListener("mouseover", this._onMouseOver, false)
    };
    ModernCanvas.TitleAttributeHtmlWorker.prototype.cleanTitleAttribute = function (n) {
        n.removeAttribute("title")
    };
    ModernCanvas.BadElementHtmlWorker = function (n) {
        ModernCanvas.HtmlWorker.call(this, n, n.querySelectorAll("applet, audio, bgsound, datalist, embed, form, frame, frameset, iframe, input, listing, noembed, noframes, noscript, object, plaintext, progress, select, svg, textarea, video, xmp"), this.removeBadElement)
    };
    Jx.inherit(ModernCanvas.BadElementHtmlWorker, ModernCanvas.HtmlWorker);
    ModernCanvas.BadElementHtmlWorker.prototype.removeBadElement = function (n) {
        n.removeAttribute("src");
        n.removeAttribute("data");
        n.removeAttribute("code");
        n.removeAttribute("object");
        var t = n.nodeName,
            i = t !== "FORM" && t !== "PROGRESS";
        n.removeNode(i)
    };
    ModernCanvas._iframeSrcMap = {
        calendar: "/ModernCanvas/ModernCanvasCalendarFrame.html",
        chat: "/ModernCanvas/ModernCanvasChatFrame.html",
        "default": "/ModernCanvas/ModernCanvasFrame.html",
        mail: "/ModernCanvas/ModernCanvasMailFrame.html",
        stm: "/ModernCanvas/ModernCanvasShareToMailFrame.html"
    };
    ModernCanvas.createCanvasAsync = function (n, t) {
        return n.innerHTML = "",
            new WinJS.Promise(function (i, r) {
                var u = n.ownerDocument.createElement("iframe");
                u.addEventListener("load", function f() {
                    try {
                        u.removeEventListener("load", f, false);
                        i(new ModernCanvas.ModernCanvas(u, t))
                    } catch (n) {
                        r(n)
                    }
                }, false);
                u.src = ModernCanvas._iframeSrcMap[t.className] || ModernCanvas._iframeSrcMap["default"];
                n.appendChild(u)
            })
    };
    ModernCanvas.createUrlToStreamMapAsync = function (n) {
        return new WinJS.Promise(function (t, i) {
            n.getResourceMapAsync().then(function (n) {
                var t = Object.keys(n).map(function (t) {
                    return ModernCanvas._getStreamForUrlAsync(t, n[t])
                });
                return WinJS.Promise.join(t)
            }).then(function (n) {
                return n.reduce(function (n, t) {
                    var i = t.url,
                        r = t.stream;
                    return n[i] = r,
                        ModernCanvas.isFileProtocol(i) && (n["ms-clipboard-" + i] = r),
                        n
                }, {})
            }).done(t, i)
        })
    };
    ModernCanvas._getStreamForUrlAsync = function (n, t) {
        return new WinJS.Promise(function (i, r) {
            t.openReadAsync().done(function (t) {
                i({
                    url: n,
                    stream: t
                })
            }, r)
        })
    };
    ModernCanvas.TextRangeIterator = function () {};
    ModernCanvas.TextRangeIterator.prototype = {
        nextRange: function () {}
    };
    ModernCanvas.Component = function () {
        this.initComponent();
        this.on = this.detach = this.fire = this.fireDirect = null
    };
    Jx.augment(ModernCanvas.Component, Jx.Component);
    ModernCanvas.Component.prototype._usageData = {};
    ModernCanvas.Component.prototype._normalizeRange = function (n) {
        var t = this.getElementFromNode(n.commonAncestorContainer),
            i = function (n) {
                for (var t = n.firstChild, u, r, f; t;)
                    if (t.nodeType === Node.TEXT_NODE) {
                        for (u = t,
                            r = t.nodeValue,
                            t = t.nextSibling; t && t.nodeType === Node.TEXT_NODE;)
                            f = t,
                            r += t.nodeValue,
                            t = t.nextSibling,
                            f.removeNode(true);
                        r.length > 0 ? u.nodeValue = r : u.removeNode(true)
                    } else
                        t.nodeType === Node.ELEMENT_NODE && i(t),
                        t = t.nextSibling
            },
            r = new ModernCanvas.RangeBookmark(n, t);
        return i(t),
            r.getBookmarkedRange(t)
    };
    ModernCanvas.Component.prototype._createTextRangeIterator = function (n) {
        var i = n.startContainer,
            r = n.endContainer,
            e = n.startOffset,
            o = n.endOffset,
            s = n.commonAncestorContainer.ownerDocument,
            t = s.createRange(),
            u, f = this,
            h, c, l;
        return n.collapsed ? (i.nodeType === Node.TEXT_NODE && this.elementCanContainPhrasingContent(f.getElementFromNode(i)) ? i.nodeValue.length === 0 && i.parentNode.childNodes.length === 1 ? t.selectNodeContents(i) : (t.setStart(i, e),
            t.setEnd(r, o)) : this.elementCanContainPhrasingContent(i) ? i.childNodes.length === 0 ? (u = s.createTextNode(""),
            i.appendChild(u),
            t.selectNodeContents(u)) : (h = i.childNodes.item(0),
            i.childNodes.length === 1 && h.nodeType === Node.TEXT_NODE && h.length === 0 ? t.selectNodeContents(h) : (u = s.createTextNode(""),
                t = n.cloneRange(),
                t.insertNode(u))) : t = null, {
            nextRange: function () {
                var n = t;
                return t = null,
                    n
            }
        }) : (n = this.trimRange(this._normalizeRange(n)),
            i = n.startContainer,
            r = n.endContainer,
            e = n.startOffset,
            o = n.endOffset,
            c = s.createNodeIterator(n.commonAncestorContainer, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (t) {
                return f.intersectsNode(n, t) && (t.nodeType === Node.TEXT_NODE && f.elementCanContainPhrasingContent(f.getElementFromNode(t)) || t.nodeType === Node.ELEMENT_NODE && t.getAttribute("data-applyformatting") !== "false" && (f.isNodeName(t, "IMG") || t.getAttribute("data-applyformatting") === "true")) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }, false), {
                nextRange: function () {
                    var n = c.nextNode();
                    return (Boolean(n) && n === l && (n = c.nextNode()),
                        n) ? (n.nodeType === Node.TEXT_NODE ? (t.selectNodeContents(n),
                            n === i && n === r ? (t.setStart(i, e),
                                t.setEnd(r, o)) : n === i ? t.setStart(i, e) : n === r && t.setEnd(r, o)) : (l = n,
                            t.selectNode(n)),
                        t) : null
                }
            })
    };
    ModernCanvas.Component.prototype.rangeContainsNonEditableContent = function (n) {
        for (var i = this.getElementFromNode(n.commonAncestorContainer), u = n.startContainer.ownerDocument, f = this, r = u.createNodeIterator(i, NodeFilter.SHOW_ELEMENT, function (t) {
                return f.intersectsNode(n, t, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }, false), t = r.nextNode(); t;) {
            if (!t.isContentEditable)
                return true;
            t = r.nextNode()
        }
        return !i.isContentEditable
    };
    ModernCanvas.Component.prototype.clearUsageData = function () {
        this._usageData = {}
    };
    ModernCanvas.Component.prototype.getUsageData = function () {
        return this._usageData
    };
    ModernCanvas.Component.prototype.initComponent = function () {
        this._usageData = {};
        Jx.Component.initComponent.call(this)
    };
    ModernCanvas.Component.prototype.discardableClone = function (n, t) {
        var i = this.getParent();
        return i ? i.discardableClone(n, t) : n.cloneNode(t)
    };
    ModernCanvas.Component.prototype.getDocument = function () {
        var n = this.getParent();
        return n.getDocument()
    };
    ModernCanvas.Component.prototype.getWindow = function () {
        var n = this.getParent();
        return n.getWindow()
    };
    ModernCanvas.Component.prototype.getIframeSelection = function () {
        return this.getDocumentSelection(this.getDocument())
    };
    ModernCanvas.Component.prototype.getDocumentSelection = function (n) {
        try {
            var t = n.getSelection();
            if (t.rangeCount >= 0)
                return t
        } catch (i) {
            Jx.log.exception("Failure during getDocumentSelection", i)
        }
        return null
    };
    ModernCanvas.Component.prototype.getIframeSelectionRange = function () {
        return this.getDocumentSelectionRange(this.getDocument())
    };
    ModernCanvas.Component.prototype.getDocumentSelectionRange = function (n) {
        try {
            var t = this.getDocumentSelection(n);
            if (Boolean(t) && t.rangeCount > 0)
                return t.getRangeAt(0)
        } catch (i) {
            Jx.log.exception("Failure during getDocumentSelectionRange", i)
        }
        return null
    };
    ModernCanvas.Component.prototype.replaceIframeSelectionRange = function (n) {
        try {
            var t = this.getIframeSelection();
            t && (t.removeAllRanges(),
                n && t.addRange(n))
        } catch (i) {
            Jx.log.exception("Failure during replaceIframeSelectionRange", i)
        }
    };
    ModernCanvas.Component.prototype.getSelectionRange = function () {
        var n = this.getParent();
        return n.getSelectionRange()
    };
    ModernCanvas.Component.prototype.getAnchorElement = function (n) {
        var t = this.getParent();
        return t.getAnchorElement(n)
    };
    ModernCanvas.Component.prototype.getElementFromNode = function (n) {
        return n.nodeType !== Node.ELEMENT_NODE ? n.parentNode : n
    };
    ModernCanvas.Component.prototype.replaceSelection = function (n) {
        var t = n;
        t.select ? t.select() : this.replaceIframeSelectionRange(n)
    };
    ModernCanvas.Component.prototype.scrollSelectionIntoView = function () {
        var n = this.getParent();
        n.scrollSelectionIntoView()
    };
    ModernCanvas.Component.prototype.getSelectionRangeBoundingRect = function () {
        var t = this.getSelectionRange(),
            n, r, i;
        return Jx.isNullOrUndefined(t) ? null : (n = t.getBoundingClientRect(),
            n.height === 0 && n.top === 0 && n.left === 0 && (r = this.getSelectedImage(t),
                r && (n = r.getBoundingClientRect()),
                n.height === 0 && n.top === 0 && n.left === 0 && (i = this.getDocument().createTextNode("​"),
                    t.insertNode(i),
                    n = t.getBoundingClientRect(),
                    n.dispose = function () {
                        var n = i.parentNode;
                        n && n.removeChild(i)
                    }
                )),
            n)
    };
    ModernCanvas.Component.prototype.getSelectedImage = function (n) {
        n = this.trimRange(n);
        var u = this,
            t = n.commonAncestorContainer,
            f = t.ownerDocument,
            i = f.createNodeIterator(t, NodeFilter.SHOW_ELEMENT, function (i) {
                return t !== i && u.intersectsNode(n, i, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }, false),
            r = i.nextNode();
        return this.isNodeName(r, "IMG") && !i.nextNode() ? r : null
    };
    ModernCanvas.Component.prototype.selectNodeContents = function (n) {
        var t = this.getDocument().createRange();
        t.selectNodeContents(n);
        this.replaceSelection(t)
    };
    ModernCanvas.Component.prototype.intersectsNode = function (n, t, i) {
        return Jx.intersectsNode(n, t, i)
    };
    ModernCanvas.Component.prototype.isDescendantOf = function (n, t) {
        while (Boolean(n) && n !== t)
            n = n.parentNode;
        return n === t
    };
    ModernCanvas.Component.prototype.isNodeName = function (n) {
        var i, t;
        if (n)
            for (i = n.nodeName.toUpperCase(),
                t = 1; t < arguments.length; t++)
                if (i === arguments[t].toUpperCase())
                    return true;
        return false
    };
    ModernCanvas.Component.prototype.getPreviousNode = function () {
        var n = this.getSelectionRange(),
            t;
        if (!n)
            return null;
        if (n.startOffset > 0) {
            if (n.startContainer.nodeType === Node.TEXT_NODE)
                return n.startContainer;
            if (n.startContainer.nodeType === Node.ELEMENT_NODE)
                return n.startContainer.childNodes[n.startOffset - 1]
        } else
            return t = n.startContainer.previousSibling,
                t ? t : n.startContainer.parentNode;
        return null
    };
    ModernCanvas.Component.prototype.trimRange = function (n) {
        var f, s;
        if (!n || n.collapsed)
            return n;
        var a = n.startContainer.ownerDocument,
            v = this,
            u = n.cloneRange(),
            r = n.startContainer,
            i = n.endContainer,
            t = null,
            e = n.startOffset;
        if (r.nodeType !== Node.TEXT_NODE && r.childNodes.length > e && (r = r.childNodes[e],
                e = 0),
            r.nodeType === Node.TEXT_NODE && r.nodeValue.length === e) {
            for (t = r; !Boolean(t.nextSibling);) {
                if (this.isBlockElement(t.parentNode))
                    break;
                t = t.parentNode
            }
            if (t.nextSibling) {
                for (r = t.nextSibling; r.firstChild;)
                    r = r.firstChild;
                u.setStartBefore(r);
                e = 0
            }
        }
        if (f = n.endOffset,
            i.nodeType !== Node.TEXT_NODE && i.childNodes.length > f ? (i = n.endContainer.childNodes[f],
                f = 0) : f !== 0 && i.childNodes.length === f && (i.nextSibling ? (i = i.nextSibling,
                f = 0) : i.lastChild && i.lastChild.nodeType === Node.TEXT_NODE && (i = i.lastChild,
                f = i.nodeValue.length)),
            f === 0) {
            for (t = i; !Boolean(t.previousSibling);) {
                if (this.isBlockElement(t.parentNode))
                    break;
                t = t.parentNode
            }
            if (t.previousSibling) {
                for (i = t.previousSibling; i.lastChild;)
                    i = i.lastChild;
                u.setEndAfter(i)
            }
        }
        var h = r.nodeType === Node.TEXT_NODE && e < r.length,
            c = false,
            l = u.commonAncestorContainer,
            o = a.createNodeIterator(l, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (t) {
                return l !== t && v.intersectsNode(n, t, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }, false);
        for (h && u.setStart(r, e),
            t = o.nextNode(); t;)
            c = c || r === t,
            !h && this.isVisibleNode(t) && (n.startContainer === t ? u.setStart(t, e) : u.setStartBefore(t),
                h = c),
            t = o.nextNode();
        for (s = false,
            t = o.previousNode(); t;) {
            if (s = s || t === i,
                s && this.isVisibleNode(t)) {
                n.endContainer === t ? u.setEnd(t, n.endOffset) : u.setEndAfter(t);
                break
            }
            t = o.previousNode()
        }
        if (u.startOffset === 0 && u.startContainer.nodeType !== Node.TEXT_NODE) {
            for (r = u.startContainer; r.nodeType !== Node.TEXT_NODE && r.firstChild;)
                r = r.firstChild;
            r.nodeType === Node.TEXT_NODE && u.setStart(r, 0)
        }
        if (u.endContainer.nodeType !== Node.TEXT_NODE && u.endOffset === u.endContainer.childNodes.length) {
            for (i = u.endContainer; i.nodeType !== Node.TEXT_NODE && i.lastChild;)
                i = i.lastChild;
            i.nodeType === Node.TEXT_NODE && u.setEnd(i, i.length)
        }
        return u
    };
    ModernCanvas.Component.prototype.isVisibleNode = function (n) {
        return n.nodeType === Node.TEXT_NODE && n.length > 0 || ModernCanvas.Component.prototype.isBlockElement(n)
    };
    ModernCanvas.Component.prototype.isBlockElement = function (n) {
        return ModernCanvas.Component.prototype.isNodeName(n, "DIV", "P", "BR", "BLOCKQUOTE", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "TR", "TD", "TH", "CAPTION", "COL", "COLGROUP", "THEAD", "TBODY", "TFOOT", "HR", "IMG", "EMBED", "OBJECT", "BODY", "PRE")
    };
    ModernCanvas.Component.prototype.isVoidElement = function (n) {
        return ModernCanvas.Component.prototype.isNodeName(n, "AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR")
    };
    ModernCanvas.Component.prototype.cloneContentsWithParents = function (n) {
        for (var e = n.startContainer.ownerDocument, o = e.createElement("div"), i = n.cloneContents(), t, l = e.createComment("StartFragment "), a = e.createComment("EndFragment "), u = false, r = false, f, h, c, s = 0; s < i.childNodes.length; s++)
            if (u = ModernCanvas.Component.prototype.needsParent(i.childNodes[s]),
                u)
                break;
        for (f = n.startContainer; f;) {
            if (r = ModernCanvas.Component.prototype.isFormattedNode(f),
                r)
                break;
            f = f.parentNode
        }
        if (!u && !r)
            return o.appendChild(i),
                o;
        for (t = n.startContainer.nodeType !== Node.ELEMENT_NODE ? n.startContainer.parentNode : n.startOffset < n.startContainer.childNodes.length ? n.startContainer.childNodes[n.startOffset] : n.startContainer,
            h = e.createRange(),
            h.selectNodeContents(t); h.compareBoundaryPoints(Range.END_TO_END, n) < 0;)
            t = t.parentNode,
            h.selectNodeContents(t);
        for (i.insertBefore(l, i.firstChild),
            i.appendChild(a),
            r = ModernCanvas.Component.prototype.isFormattedNode(t); u || r;)
            c = t.cloneNode(false),
            c.appendChild(i),
            i = c,
            u = ModernCanvas.Component.prototype.needsParent(t),
            t = t.parentNode,
            r = ModernCanvas.Component.prototype.isFormattedNode(t);
        return o.appendChild(i),
            o
    };
    ModernCanvas.Component.prototype.isFormattedNode = function (n) {
        return ModernCanvas.Component.prototype.isNodeName(n, "FONT", "EM", "U", "STRONG", "B", "BDI", "BDO", "I", "MARK", "PRE", "SMALL", "BIG", "SUB", "SUP", "S", "STRIKE") || ModernCanvas.Component.prototype.isNodeName(n, "SPAN") && n.style.length > 0
    };
    ModernCanvas.Component.prototype.needsParent = function (n) {
        return ModernCanvas.Component.prototype.isNodeName(n, "LI", "TR", "TD", "TH", "COL", "COLGROUP", "THEAD", "TBODY", "TFOOT")
    };
    n = {
        html: true,
        head: true,
        title: true,
        base: true,
        link: true,
        meta: true,
        style: true,
        script: true,
        noscript: true,
        hr: true,
        ol: true,
        ul: true,
        dl: true,
        br: true,
        wbr: true,
        img: true,
        iframe: true,
        embed: true,
        param: true,
        video: true,
        audio: true,
        source: true,
        track: true,
        canvas: true,
        map: true,
        area: true,
        table: true,
        colgroup: true,
        col: true,
        tbody: true,
        thead: true,
        tfoot: true,
        tr: true,
        input: true,
        select: true,
        datalist: true,
        optgroup: true,
        option: true,
        textarea: true,
        keygen: true,
        command: true,
        menu: true,
        basefont: true,
        frame: true,
        frameset: true,
        noframes: true,
        isindex: true,
        listing: true,
        plaintext: true,
        xmp: true
    };
    ModernCanvas.Component.prototype.elementCanContainPhrasingContent = function (t) {
        return Boolean(t) && Jx.isHTMLElement(t) && !n[t.nodeName.toLowerCase()]
    };
    ModernCanvas.Component.prototype.getStyleSheetsFromDocument = function (n) {
        var r, u, t, e, f, i;
        for (ModernCanvas.mark("ModernCanvas.getStyleSheetsFromDocument", ModernCanvas.LogEvent.start),
            r = n.documentElement.querySelectorAll("style, link"),
            u = "",
            t = 0,
            e = r.length; t < e; t++)
            (f = r[t],
                i = f.href,
                i && (i.indexOf("/") === 0 || i.indexOf("ms-appx:") === 0)) || (u += f.outerHTML);
        return ModernCanvas.mark("ModernCanvas.getStyleSheetsFromDocument", ModernCanvas.LogEvent.stop),
            u
    };
    ModernCanvas.Component.prototype.createHtmlFormat = function (n, t) {
        var o = "Version:1.0\r\nStartHTML:%08a\r\nEndHTML:%08b\r\nStartFragment:%08c\r\nEndFragment:%08d\r\n",
            r = o.length + 16,
            s = "<!DOCTYPE><HTML><HEAD>" + t + "<\/HEAD><BODY>",
            h = "<\/BODY><\/HTML>",
            u = "<!--StartFragment -->",
            c = "<!--EndFragment -->",
            f = ModernCanvas.Component.prototype._padZeros,
            e, i;
        if (n.indexOf(u) === -1) {
            if (t.length === 0)
                return Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(n);
            n = u + n + c
        }
        return e = unescape(encodeURIComponent(s + n + h)),
            i = o.replace("%08a", f(r)),
            i = i.replace("%08b", f(r + e.length)),
            i = i.replace("%08c", f(r + e.indexOf(u) + u.length)),
            i = i.replace("%08d", f(r + e.indexOf(c))),
            i + s + n + h
    };
    ModernCanvas.Component.prototype._padZeros = function (n) {
        return ("0000000" + String(n)).slice(-8)
    };
    ModernCanvas.Component.prototype.getParentElementForSelection = function (n, t) {
        var r, e, i, u, f;
        if (!t && (t = this.trimRange(this.getSelectionRange()),
                !t))
            return null;
        if (n = n.toLowerCase(),
            r = t.startContainer,
            e = t.endContainer,
            r === e && (r.childNodes.length === 0 || t.startOffset === t.endOffset))
            i = r;
        else
            for (u = t.commonAncestorContainer.childNodes,
                f = u.length; f--;)
                if (this.intersectsNode(t, u[f]))
                    if (i) {
                        i = t.commonAncestorContainer;
                        break
                    } else
                        i = u[f];
        if (Boolean(i)) {
            while (Boolean(i.parentNode) && (!i.tagName || i.tagName.toLowerCase() !== n))
                i = i.parentNode;
            if (Boolean(i.tagName) && i.tagName.toLowerCase() === n)
                return i
        }
        return null
    };
    ModernCanvas.Component.prototype.getAncestor = function (n, t) {
        while (Jx.isHTMLElement(n) && !t(n))
            n = n.parentNode;
        return Jx.isHTMLElement(n) ? n : null
    };
    ModernCanvas.Component.prototype.getTextSearchInfo = function (n) {
        var e = this.getSelectionRange(),
            f, s, t;
        if (!e || !e.collapsed)
            return null;
        var i = {
                selection: e,
                searchRange: e.cloneRange(),
                preString: null,
                postString: null,
                previousSibling: null
            },
            r = i.searchRange.startContainer,
            o = i.searchRange.endContainer,
            u = i.searchRange.startOffset;
        if (r.nodeType !== r.TEXT_NODE)
            if (u = Math.min(u, r.childNodes.length),
                u > 0 && r.childNodes[u - 1].nodeType === r.TEXT_NODE)
                r = r.childNodes[u - 1],
                o = r,
                u = r.data.length;
            else
                return null;
        for (f = r,
            s = u,
            t = f.previousSibling,
            i.preString = f.data.substring(0, s); Boolean(t) && t.nodeType === t.TEXT_NODE;)
            i.preString = t.data + i.preString,
            r = t,
            t = t.previousSibling;
        if (i.previousSibling = t,
            i.searchRange.setStart(r, 0),
            n) {
            for (t = f.nextSibling,
                i.postString = f.data.substring(s, f.data.length); Boolean(t) && t.nodeType === t.TEXT_NODE;)
                i.postString = i.postString + t.data,
                o = t,
                t = t.nextSibling;
            i.searchRange.setEnd(o, o.length)
        }
        return i
    };
    ModernCanvas.Component.prototype.isEmpty = function (n) {
        if (n.nodeType === Node.TEXT_NODE && n.nodeValue.length !== 0)
            return false;
        for (var t = n.childNodes.length; t--;)
            if (n.childNodes[t].nodeType !== Node.TEXT_NODE || n.childNodes[t].length !== 0)
                return false;
        return true
    };
    ModernCanvas.Component.prototype.visibleContent = function (n, t) {
        for (var u = n.ownerDocument, r = u.createNodeIterator(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, true), i = r.nextNode(); i;) {
            if (this.isNodeName(i, "LI", "TD", "HR", "IMG", "INPUT", "SELECT", "EMBED", "OBJECT") || i.nodeType === Node.TEXT_NODE && (t || !ModernCanvas.ModernCanvasBase.prototype._regexWhitespace.test(i.nodeValue)) && i.nodeValue.length > 0)
                return true;
            i = r.nextNode()
        }
        return false
    };
    ModernCanvas.Component.prototype.suspendEvents = function () {
        this.forEachChild(function (n) {
            n.suspendEvents()
        })
    };
    ModernCanvas.Component.prototype.resumeEvents = function () {
        this.forEachChild(function (n) {
            n.resumeEvents()
        })
    };
    ModernCanvas.Component.prototype.createDataPackageFromSelection = function (n) {
        var r, t, e, u, o, s, f, l;
        if (ModernCanvas.mark("createDataPackageFromSelection", ModernCanvas.LogEvent.start),
            r = this.getDocumentSelectionRange(n),
            !r || r.collapsed)
            return ModernCanvas.mark("createDataPackageFromSelection", ModernCanvas.LogEvent.stop),
                null;
        var i = new Windows.ApplicationModel.DataTransfer.DataPackage,
            a = ModernCanvas.Component.prototype.cloneContentsWithParents(r),
            h = a.innerHTML,
            v = ModernCanvas.Component.prototype.getStyleSheetsFromDocument(n);
        i.properties.applicationName = window.location.href;
        t = document.createElement("div");
        t.innerHTML = window.toStaticHTML(h);
        var y = Windows.Storage.Streams.RandomAccessStreamReference,
            p = Windows.Foundation.Uri,
            w = i.resourceMap,
            c = t.querySelectorAll("img");
        for (e = c.length; e--;)
            u = c[e].src,
            Jx.isNonEmptyString(u) && (o = new p(u),
                o.schemeName === "ms-appdata" && (w[u] = y.createFromUri(o)));
        if (i.setHtmlFormat(ModernCanvas.Component.prototype.createHtmlFormat(h, v)),
            Jx.isNonEmptyString(t.innerText)) {
            for (s = t.querySelectorAll("style"),
                f = 0,
                l = s.length; f < l; ++f)
                s[f].innerText = "";
            i.setText(t.innerText.replace(/\r\n\r\n/g, "\r\n"))
        }
        return ModernCanvas.mark("createDataPackageFromSelection", ModernCanvas.LogEvent.stop),
            i
    };
    ModernCanvas.Component.prototype._pxToPtRatio = 1 / .75;
    t = /["']Color Emoji["'],?/g;
    ModernCanvas.removeFakeFontNames = function (n) {
        return n.replace(t, "")
    };
    ModernCanvas.ContentDestination = {
        internal: "internal",
        external: "external",
        clipboard: "clipboard"
    };
    ModernCanvas.ContentFormat = {
        htmlString: "htmlString",
        text: "text",
        documentFragment: "documentFragment"
    };
    ModernCanvas.ContentLocation = {
        all: "all",
        end: "end",
        selection: "selection",
        start: "start"
    };
    ModernCanvas.OpenLinkOptions = {
        click: "click",
        ctrlClick: "ctrlClick",
        dontOpen: "dontOpen"
    };
    ModernCanvas.SignatureLocation = {
        end: "end",
        none: "none",
        start: "start"
    };
    ModernCanvas.FlagType = {
        acute: "acute",
        cedilla: "cedilla",
        circumflex: "circumflex",
        diaeresis: "diaeresis",
        grave: "grave",
        ligature: "ligature",
        ring: "ring",
        slash: "slash",
        tilde: "tilde"
    };
    ModernCanvas.NodeType = {
        command: "command",
        element: "element",
        ignore: "ignore",
        string: "string"
    };
    ModernCanvas.LogEvent = {
        start: "_begin",
        stop: "_end",
        toProfilerMarkString: {
            _begin: ",StartTA,ModernCanvas",
            _end: ",StopTA,ModernCanvas"
        }
    };
    ModernCanvas.mark = function (n, t) {
            Jx.mark("ModernCanvas." + n + (ModernCanvas.LogEvent.toProfilerMarkString[t] || ""))
        },
        function () {
            ModernCanvas.ModernCanvasBase = function (n, t) {
                var o, i, s, h, r, c, l, e, p, f, w, d, b, g, nt, ut, tt, k, it, rt;
                if (ModernCanvas.mark("ctor", ModernCanvas.LogEvent.start),
                    ModernCanvas.Component.call(this),
                    this._iframeElement = n,
                    this._iframeDocument = n.contentDocument,
                    o = "default",
                    i = {},
                    t)
                    for (s = Object.keys(t),
                        h = s.length; h--;) {
                        r = t[s[h]];
                        switch (s[h]) {
                            case "className":
                                o = r.toLowerCase();
                                break;
                            case "autoReplaceManager":
                                i.autoReplaceManager = r;
                                break;
                            case "autoResize":
                                i.autoResize = r;
                                break;
                            case "commandManager":
                                i.commandManager = r;
                                break;
                            case "contextMenuManager":
                                i.contextMenuManager = r;
                                break;
                            case "hyperlinkManager":
                                i.hyperlinkManager = r;
                                break;
                            case "logFunction":
                                this._logFunction = r;
                                break;
                            case "pasteMaxImageSize":
                                this._maxImageSize = r;
                                this._maxImageSizeString = r ? String(r) + "px" : "";
                                break;
                            case "shortcutManager":
                                i.shortcutManager = r;
                                break;
                            case "delayActivation":
                                this._delayActivation = r;
                                break;
                            case "plugins":
                                for (c = Object.keys(r),
                                    l = c.length; l--;)
                                    i[c[l]] = r[c[l]]
                        }
                    }
                n.id || (n.id = "modernCanvas" + Jx.uid().toString());
                this._id = n.id;
                var a = n.ownerDocument,
                    u = this._iframeDocument,
                    v = u.body,
                    y = n.parentNode;
                for (y.classList.add("modernCanvas-container"),
                    n.classList.add("modernCanvas-frame"),
                    v.classList.add("modernCanvas"),
                    Jx.DynamicFont.insertAuthoringFontFamilyRule("html, body.modernCanvas", u),
                    v.tabIndex = -1,
                    e = a.createElement("div"),
                    e.classList.add("modernCanvas-cueText"),
                    e.classList.add("authoringFontFamilyClass"),
                    e.setAttribute("contentEditable", "true"),
                    this._cueElement = e,
                    n.parentNode.appendChild(e),
                    p = a.createElement("div"),
                    p.classList.add("modernCanvas-anchor"),
                    this._anchorElement = p,
                    n.parentNode.appendChild(p),
                    this._bufferArea = u.createElement("div"),
                    this._loadedBufferArea = u.createElement("div"),
                    this._loadedBufferArea.style.display = "none",
                    v.appendChild(this._loadedBufferArea),
                    f = u.createElement("div"),
                    f.classList.add("modernCanvas-content"),
                    f.classList.add("modernCanvas-visible"),
                    f.contentEditable = "true",
                    f.id = "modernCanvasContent",
                    f.setAttribute("role", "textbox"),
                    f.setAttribute("spellcheck", "true"),
                    w = window.getComputedStyle(y, null).minHeight,
                    w !== "none" && w !== "auto" && (n.style.minHeight = w),
                    d = ["aria-describedby", "aria-label", "aria-labelledby", "aria-required"],
                    nt = d.length; nt--;)
                    b = d[nt],
                    g = y.getAttribute(b),
                    g && (y.removeAttribute(b),
                        f.setAttribute(b, g));
                this._body = f;
                v.appendChild(f);
                i.autoReplaceManager || (i.autoReplaceManager = new ModernCanvas.AutoReplaceManager);
                i.commandManager || (i.commandManager = new ModernCanvas.CommandManager(o, this));
                i.contextMenuManager || (i.contextMenuManager = new ModernCanvas.ContextMenuManager(o));
                i.hyperlinkManager || (i.hyperlinkManager = new ModernCanvas.HyperlinkManager(o));
                i.shortcutManager || (i.shortcutManager = new ModernCanvas.ShortcutManager(o));
                i.autoResize || (i.autoResize = new ModernCanvas.Plugins.AutoResize);
                this.components = i;
                for (ut in this.components)
                    tt = this.components[ut],
                    tt.getParent && this.appendChild(tt);
                this._backspaceUndoListener = this._backspaceUndoListener.bind(this);
                this._completeClipboardOperation = this._completeClipboardOperation.bind(this);
                this._cueElementDragOver = this._cueElementDragOver.bind(this);
                this._cueElementDrop = this._cueElementDrop.bind(this);
                this._cueElementFocus = this._cueElementFocus.bind(this);
                this._hideCueText = this._hideCueText.bind(this);
                this._logFunctionAndReleaseClipboard = this._logFunctionAndReleaseClipboard.bind(this);
                this._markSavedSelectionInvalid = this._markSavedSelectionInvalid.bind(this);
                this._markSavedSelectionValid = this._markSavedSelectionValid.bind(this);
                this._onCharacterCountChanged = this._onCharacterCountChanged.bind(this);
                this._onFocus = this._onFocus.bind(this);
                this._onIframeFocus = this._onIframeFocus.bind(this);
                this._onKeyDown = this._onKeyDown.bind(this);
                this._onWindowResize = this._onWindowResize.bind(this);
                this._paste = this._paste.bind(this);
                this._preventInvalidKeystroke = this._preventInvalidKeystroke.bind(this);
                this._releaseImageRestriction = this._releaseImageRestriction.bind(this);
                this._recordKey = this._recordKey.bind(this);
                this._restoreSelection = this._restoreSelection.bind(this);
                this._saveSelection = this._saveSelection.bind(this);
                this._showCueText = this._showCueText.bind(this);
                this._showHideCueText = this._showHideCueText.bind(this);
                this.getCharacterCount = this.getCharacterCount.bind(this);
                this.getContent = this.getContent.bind(this);
                this.insertElement = this.insertElement.bind(this);
                this._clearSpringLoader = this._clearSpringLoader.bind(this);
                k = i.commandManager;
                k.setCommand(new ModernCanvas.Command("paste", this._paste, {
                    undoable: false
                }));
                it = k.getCommand("copy");
                it && (this._copy = this._copy.bind(this),
                    it.run = this._copy);
                rt = k.getCommand("cut");
                rt && (this._cut = this._cut.bind(this),
                    rt.run = this._cut);
                this._queuedInsertions = [];
                this._srcToBlobUrlTable = {};
                this._srcToStreamTable = {};
                a.addEventListener("keydown", this._markSavedSelectionValid, false);
                a.addEventListener("keyup", this._markSavedSelectionInvalid, false);
                this.addEventListener("beforedeactivate", this._saveSelection, false);
                this.addEventListener("focus", this._onFocus, false);
                n.addEventListener("focus", this._onIframeFocus, false);
                window.addEventListener("resize", this._onWindowResize, false);
                e.addEventListener("dragover", this._cueElementDragOver, false);
                e.addEventListener("drop", this._cueElementDrop, false);
                e.addEventListener("focus", this._cueElementFocus, false);
                u.addEventListener("mscontrolselect", i.hyperlinkManager.onClick, false); // todo: unknown event
                u.addEventListener("click", i.hyperlinkManager.onClick, false);
                Jx.addListener(this, "command", i.commandManager.onCommand, i.commandManager);
                u.addEventListener("contextmenu", i.contextMenuManager.onContextMenu, false);
                u.addEventListener("keydown", this._onKeyDown, false);
                u.addEventListener("keydown", this._recordKey, true);
                u.addEventListener("keyup", i.autoReplaceManager.onKeyUp, false);
                u.addEventListener("keypress", this._preventInvalidKeystroke, true);
                this._delayActivation || this.activate();
                ModernCanvas.mark("ctor", ModernCanvas.LogEvent.stop)
            };
            Jx.inherit(ModernCanvas.ModernCanvasBase, ModernCanvas.Component);
            var n = ModernCanvas.ModernCanvasBase.prototype;
            n._activated = false;
            n._addEmptyLinesForTables = function () {
                for (var t = this._body.firstChild, n; t && !this.isBlockElement(t);)
                    t = t.nextSibling;
                while (this.isNodeName(t, "DIV", "P") && this.isNodeName(t.firstChild, "DIV", "P"))
                    t = t.firstChild;
                for (Jx.isHTMLElement(t) && (this.isNodeName(t, "TABLE") || t.querySelector("TABLE")) && this._body.insertBefore(this._createEmptyLine(), this._body.firstChild),
                    n = this._body.lastChild; n && !this.isBlockElement(n);)
                    n = n.previousSibling;
                while (this.isNodeName(n, "DIV", "P") && this.isNodeName(n.lastChild, "DIV", "P"))
                    n = n.lastChild;
                Jx.isHTMLElement(n) && (this.isNodeName(n, "TABLE") || n.querySelector("TABLE")) && this._body.appendChild(this._createEmptyLine())
            };
            n._attachBackspaceUndoListener = function () {
                this.addEventListener("selectionchange", this._backspaceUndoListener, false);
                this.addEventListener("keydown", this._backspaceUndoListener, false)
            };
            n._backspaceUndoListener = function (n) {
                ModernCanvas.mark("backspaceUndoListener", ModernCanvas.LogEvent.start);
                this.removeEventListener("selectionchange", this._backspaceUndoListener, false);
                this.removeEventListener("keydown", this._backspaceUndoListener, false);
                n.keyCode === Jx.KeyCode.backspace && (n.preventDefault(),
                    Jx.raiseEvent(this, "command", {
                        command: "undo"
                    }));
                ModernCanvas.mark("backspaceUndoListener", ModernCanvas.LogEvent.stop)
            };
            n._bufferArea = null;
            n._body = null;
            n._characterCount = null;
            n._completeClipboardOperation = function () {
                ModernCanvas.mark("completeClipboardOperation", ModernCanvas.LogEvent.start);
                this.components.commandManager.fireAfterCommand();
                this._fireContentReadyIfReady();
                ModernCanvas.mark("completeClipboardOperation", ModernCanvas.LogEvent.stop)
            };
            n._contentReadyCallback = null;
            n._copy = function () {
                ModernCanvas.mark("copy", ModernCanvas.LogEvent.start);
                this._copyCore();
                ModernCanvas.mark("copy", ModernCanvas.LogEvent.stop)
            };
            n._copyCore = function () {
                var c, n, r, l, i, a, u, f, e, s, h;
                ModernCanvas.mark("copyCore", ModernCanvas.LogEvent.start);
                try {
                    for (c = Windows.ApplicationModel.DataTransfer.Clipboard,
                        r = this.getIframeSelectionRange(),
                        this._inlineStyles(this.getElementFromNode(r.commonAncestorContainer).parentNode),
                        l = this.cloneContentsWithParents(r),
                        i = this._delocalizeHTML(l, ModernCanvas.ContentDestination.clipboard),
                        n = new Windows.ApplicationModel.DataTransfer.DataPackage,
                        n.properties.applicationName = window.location.href,
                        a = this.getStyleSheetsFromDocument(r.commonAncestorContainer.ownerDocument),
                        n.setHtmlFormat(this.createHtmlFormat(i.innerHTML, a)),
                        u = i.querySelectorAll("style"),
                        f = u.length; f--;)
                        u[f].innerText = "";
                    e = i.innerText.replace(this._regexDoubleCarriageReturn, "\r\n");
                    e && n.setText(e);
                    var v = Windows.Storage.Streams.RandomAccessStreamReference,
                        b = Windows.Foundation.Uri,
                        y = n.resourceMap,
                        p = i.querySelectorAll("img"),
                        t, o, w;
                    for (s = p.length; s--;)
                        t = p[s].src,
                        o = this._srcToStreamTable[t],
                        o ? (w = v.createFromStream(o),
                            y[t] = w) : Jx.isNonEmptyString(t) && (h = new b(t),
                            h.schemeName === "ms-appdata" && (y[t] = v.createFromUri(h)));
                    c.setContent(n)
                } catch (k) {
                    this._logFunction(k)
                }
                ModernCanvas.mark("copyCore", ModernCanvas.LogEvent.stop)
            };
            n._createEmptyLine = function () {
                var n = this.getDocument().createElement("div");
                return n.innerHTML = "<br>",
                    n
            };
            n._cueElement = null;
            n._cueElementDragOver = function (n) {
                return n.preventDefault && n.preventDefault(),
                    n.dataTransfer.dropEffect = "move",
                    false
            };
            n._cueElementDrop = function (n) {
                return this.addContent(n.dataTransfer.getData("text"), ModernCanvas.ContentFormat.text, ModernCanvas.ContentLocation.start, true),
                    false
            };
            n._cueElementFocus = function (n) {
                n.preventDefault();
                this.focus()
            };
            n._cueText = "";
            n._cut = function () {
                ModernCanvas.mark("cut", ModernCanvas.LogEvent.start);
                this._copyCore();
                this._iframeDocument.execCommand("delete");
                ModernCanvas.mark("cut", ModernCanvas.LogEvent.stop)
            };
            n._delayActivation = false;
            n._commentOutStyles = function (n) {
                for (var r = n.querySelectorAll("style"), t, u, i = r.length; i--;)
                    t = r[i],
                    u = t.innerHTML,
                    t.innerHTML = "",
                    t.appendChild(this._iframeDocument.createComment(u.replace(this._regexCommentTags, "")))
            };
            n._delocalizeHTML = function (n) {
                return ModernCanvas.mark("delocalizeHTML", ModernCanvas.LogEvent.start),
                    this._inlineStyles(n),
                    n = this.discardableClone(n, true),
                    ModernCanvas.mark("delocalizeHTML", ModernCanvas.LogEvent.stop),
                    n
            };
            n._inlineStyles = function (n) {
                var c, r, t, u, f, e, o, i, s, h;
                for (ModernCanvas.mark("inlineStyles", ModernCanvas.LogEvent.start),
                    c = {
                        blockquote: ["marginBottom", "marginTop"],
                        ol: ["marginBottom", "marginTop", "listStyleType", "paddingBottom", "paddingTop"],
                        ul: ["marginBottom", "marginTop", "listStyleType", "paddingBottom", "paddingTop"]
                    },
                    r = Object.keys(c),
                    ModernCanvas.mark("inlineStyles.inlineStyles", ModernCanvas.LogEvent.start),
                    t = r.length; t--;)
                    for (u = c[r[t]],
                        f = n.getElementsByTagName(r[t]),
                        e = f.length; e--;)
                        for (o = u.length; o--;)
                            f[e].style[u[o]] = f[e].getComputedStyle()[u[o]];
                for (ModernCanvas.mark("inlineStyles.inlineStyles", ModernCanvas.LogEvent.stop),
                    ModernCanvas.mark("inlineStyles.currentColor", ModernCanvas.LogEvent.start),
                    i = n.querySelectorAll("[style*='currentColor']"),
                    t = i.length; t--;)
                    for (s = i[t].style,
                        h = s.length; h--;)
                        i[t].style[s[h]] === "currentColor" && (i[t].style[s[h]] = "Black");
                ModernCanvas.mark("inlineStyles.currentColor", ModernCanvas.LogEvent.stop);
                ModernCanvas.mark("inlineStyles", ModernCanvas.LogEvent.stop)
            };
            n._fireContentReadyIfReady = function () {
                this.isContentReady() && Boolean(this._contentReadyCallback) && (this._contentReadyCallback(),
                    this._contentReadyCallback = null)
            };
            n._focus = function () {
                ModernCanvas.mark("focus", ModernCanvas.LogEvent.start);
                ModernCanvas.mark("focus.saveInformation", ModernCanvas.LogEvent.start);
                var n = this.getScrollableElement(),
                    t = n.scrollTop,
                    i = n.scrollLeft;
                this._markSavedSelectionValid();
                ModernCanvas.mark("focus.saveInformation", ModernCanvas.LogEvent.stop);
                ModernCanvas.mark("focus.DOMFocus", ModernCanvas.LogEvent.start);
                this._restoreSelection();
                ModernCanvas.mark("focus.DOMFocus", ModernCanvas.LogEvent.stop);
                ModernCanvas.mark("focus.restoreScrollPosition", ModernCanvas.LogEvent.start);
                n.scrollTop = t;
                n.scrollLeft = i;
                ModernCanvas.mark("focus.restoreScrollPosition", ModernCanvas.LogEvent.stop);
                ModernCanvas.mark("focus", ModernCanvas.LogEvent.stop)
            };
            n.getScrollableElement = function () {
                return Jx.isNullOrUndefined(this._scrollableElement) && (this._scrollableElement = this.getAncestor(this._iframeElement, function (n) {
                        var t = window.getComputedStyle(n, null).overflowY;
                        return t === "scroll" || t === "auto"
                    })),
                    this._scrollableElement
            };
            n._hideCueText = function () {
                ModernCanvas.mark("hideCueText", ModernCanvas.LogEvent.start);
                this._cueElement.setAttribute("aria-hidden", "true");
                ModernCanvas.mark("hideCueText", ModernCanvas.LogEvent.stop)
            };
            n._iframeDocument = null;
            n._iframeElement = null;
            n._imgReference = null;
            n._internalActivate = function () {
                ModernCanvas.mark("internalActivate", ModernCanvas.LogEvent.start);
                this._internalActivated || (this.clearUndoRedo(),
                    Jx.addListener(this, "beforeundoablechange", this._onBeforeUndoableChange, this),
                    Jx.addListener(this, "undoablechange", this._onUndoableChange, this),
                    this.addEventListener("mscontrolresizestart", this._releaseImageRestriction, false), // todo: unknown event
                    this.forEachChild(function (n) {
                        n.activateUI()
                    }),
                    this.setCueText(this._queuedCueText),
                    this._internalActivated = true);
                ModernCanvas.mark("internalActivate", ModernCanvas.LogEvent.stop)
            };
            n._internalActivated = false;
            n._internalDeactivate = function () {
                ModernCanvas.mark("internalDeactivate", ModernCanvas.LogEvent.start);
                this._internalActivated && (this._queuedCueText = this._cueText,
                    this.setCueText(""),
                    this.forEachChild(function (n) {
                        n.deactivateUI()
                    }),
                    this.removeEventListener("mscontrolresizestart", this._releaseImageRestriction, false), // todo: unknown event
                    Jx.removeListener(this, "beforeundoablechange", this._onBeforeUndoableChange, this),
                    Jx.removeListener(this, "undoablechange", this._onUndoableChange, this),
                    this._scrollableElement = null,
                    this._internalActivated = false);
                ModernCanvas.mark("internalDeactivate", ModernCanvas.LogEvent.stop)
            };
            n._keepSelection = false;
            n._lastKeyDown = null;
            n._loadedBufferArea = null;
            n._localizeFromDataPackage = function (n, t, i) {
                var e, c, o, u, l, a;
                ModernCanvas.mark("localizeFromDataPackage", ModernCanvas.LogEvent.start);
                var v = this.getElementFromNode(n.commonAncestorContainer),
                    h = v.querySelectorAll("img"),
                    r, y = this._regexAbsoluteUrl,
                    f, s = 1;
                for (e = 0,
                    c = h.length; e < c; e++)
                    (r = h[e],
                        this.intersectsNode(n, r)) && (o = r.getAttribute("src"),
                        f = i[o],
                        f && f.size > 0 ? (u = this._srcToBlobUrlTable[o],
                            u ? r.src = u : (l = this._getContentTypeFromFileName(o),
                                a = MSApp.createBlobFromRandomAccessStream(l, f),
                                u = URL.createObjectURL(f, {
                                    oneTimeOnly: false
                                }),
                                r.src = u,
                                this._srcToBlobUrlTable[o] = u,
                                this._objectUrls.push(u),
                                this._onPasteImage(a, u, f))) : Boolean(t) && !y.test(r.src) && (r.src = t.combineUri(r.src).absoluteUri),
                        e === 0 ? s = this._constrainMaxImageSize(r) : s !== 1 && this._constrainMaxImageSizeWithScaleRatio(r, s),
                        r.tabIndex = -1);
                ModernCanvas.mark("localizeFromDataPackage", ModernCanvas.LogEvent.stop)
            };
            n._fileExtensionToContentTypeMap = {
                ".gif": "image/gif",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".jpe": "image/jpeg",
                ".jif": "image/jpeg",
                ".jfif": "image/jpeg",
                ".jfi": "image/jpeg",
                ".png": "image/png",
                ".tiff": "image/tiff",
                ".tif": "image/tiff",
                ".bmp": "image/bmp",
                ".dib": "image/bmp",
                ".wmf": "image/x-wmf",
                ".wmz": "image/x-wmf",
                ".emf": "image/x-emf",
                ".emz": "image/x-emf"
            };
            n._getContentTypeFromFileName = function (n) {
                var t, i;
                return t = n.lastIndexOf("."),
                    t >= 0 ? (i = n.substring(t, n.length),
                        this._fileExtensionToContentTypeMap[i.toLowerCase()]) : "undefined"
            };
            n._mulWithPXUnit = function (n, t) {
                var i = Number(n.replace("px", ""));
                return i = i * t,
                    i.toString() + "px"
            };
            n._constrainMaxImageSizeWithScaleRatio = function (n, t) {
                var i = getComputedStyle(n),
                    r = i.height,
                    u = i.width;
                n.style.maxWidth = this._maxImageSizeString;
                n.style.maxHeight = this._maxImageSizeString;
                n.style.height = this._mulWithPXUnit(r, t);
                n.style.width = this._mulWithPXUnit(u, t);
                n.removeAttribute("width");
                n.removeAttribute("height")
            };
            n._constrainMaxImageSize = function (n) {
                var u = getComputedStyle(n),
                    h = u.maxHeight,
                    c = u.maxWidth,
                    f = u.height,
                    o = u.width,
                    l = n.getComputedStyle(),
                    r = "px",
                    p = this._maxImageSize,
                    t = {
                        height: false,
                        width: false
                    },
                    i = 1,
                    s = 1,
                    e = function (n, i) {
                        var u = Number(n.replace(r, ""));
                        Jx.isValidNumber(u) && u < p && (t[i] = true)
                    },
                    a = function (n, t) {
                        var u = Number(n.replace(r, "")),
                            f = Number(t.replace(r, "")),
                            i;
                        return Jx.isValidNumber(u) && Jx.isValidNumber(f) ? (i = u / f,
                            isFinite(i) ? i : NaN) : NaN
                    },
                    w = function (n, t) {
                        var i = Number(n.replace(r, "")),
                            u = Number(t.replace(r, ""));
                        return i > u
                    },
                    b = function (n, t) {
                        return a(n, t)
                    },
                    v, y;
                return h !== "none" && (e(h, "height"),
                        t.height || (n.style.maxHeight = this._maxImageSizeString,
                            t.height = true)),
                    c !== "none" && (e(c, "width"),
                        t.width || (n.style.maxWidth = this._maxImageSizeString,
                            t.width = true)),
                    l.height !== "auto" && e(f, "height"),
                    l.width !== "auto" && e(o, "width"),
                    i = a(f, o),
                    v = f,
                    t.width || t.height ? t.width ? t.height || (n.style.height = this._maxImageSizeString,
                        n.removeAttribute("height"),
                        n.style.maxWidth = this._maxImageSizeString,
                        Jx.isValidNumber(1 / i) ? n.style.width = this._mulWithPXUnit(this._maxImageSizeString, 1 / i) : n.style.removeAttribute("width"),
                        n.removeAttribute("width")) : (n.style.width = this._maxImageSizeString,
                        n.removeAttribute("width"),
                        n.style.maxHeight = this._maxImageSizeString,
                        Jx.isValidNumber(i) ? n.style.height = this._mulWithPXUnit(this._maxImageSizeString, i) : n.style.removeAttribute("height"),
                        n.removeAttribute("height")) : w(f, o) ? (n.style.height = this._maxImageSizeString,
                        n.removeAttribute("height"),
                        n.style.maxWidth = this._maxImageSizeString,
                        Jx.isValidNumber(1 / i) ? n.style.width = this._mulWithPXUnit(this._maxImageSizeString, 1 / i) : n.style.removeAttribute("width"),
                        n.removeAttribute("width")) : (n.style.width = this._maxImageSizeString,
                        n.removeAttribute("width"),
                        n.style.maxHeight = this._maxImageSizeString,
                        Jx.isValidNumber(i) ? n.style.height = this._mulWithPXUnit(this._maxImageSizeString, i) : n.style.removeAttribute("height"),
                        n.removeAttribute("height")),
                    y = getComputedStyle(n).height,
                    s = b(y, v),
                    Jx.isValidNumber(s) ? s : 1
            };
            n._localizeHTML = function (n) {
                var u, t, i, r, f, e, o;
                for (ModernCanvas.mark("localizeHTML", ModernCanvas.LogEvent.start),
                    ModernCanvas.runWorkersSynchronously([new ModernCanvas.BadElementHtmlWorker(n), new ModernCanvas.HrefHtmlWorker(n), new ModernCanvas.ContentEditableTabIndexHtmlWorker(n), new ModernCanvas.TitleAttributeHtmlWorker(n)]),
                    ModernCanvas.mark("localizeHTML.externalStyles", ModernCanvas.LogEvent.start),
                    u = n.querySelectorAll("[data-externalstyle]"),
                    t = u.length; t--;)
                    i = u[t],
                    r = i.getAttribute("dir"),
                    (r === "rtl" || r === "ltr") && this._iframeDocument.body.setAttribute("dir", r),
                    i.removeNode(i.getAttribute("data-externalstyle") === "true");
                for (ModernCanvas.mark("localizeHTML.externalStyles", ModernCanvas.LogEvent.stop),
                    ModernCanvas.mark("localizeHTML.moveStyles", ModernCanvas.LogEvent.start),
                    f = n.querySelectorAll("style"),
                    e = this.getDocument().querySelector("head"),
                    t = f.length; t--;)
                    o = f[t],
                    o.classList.add("modernCanvas-contentStyle"),
                    e.insertBefore(o, e.firstChild);
                ModernCanvas.mark("localizeHTML.moveStyles", ModernCanvas.LogEvent.stop);
                ModernCanvas.mark("localizeHTML", ModernCanvas.LogEvent.stop)
            };
            n._logFunction = function () {};
            n._logFunctionAndReleaseClipboard = function (n) {
                this._logFunction(n);
                this._completeClipboardOperation()
            };
            n._markSavedSelectionInvalid = function () {
                this._keepSelection = false
            };
            n._markSavedSelectionValid = function (n) {
                Boolean(n) && n.keyCode !== Jx.KeyCode.tab || (this._keepSelection = true)
            };
            n._maxImageSize = 640;
            n._maxImageSizeString = "640px";
            n._objectUrls = [];
            n._onIframeFocus = function () {
                var n = this.getSelectionRange();
                !n || this._keepSelection ? this.focus() : this.replaceSelection(n)
            };
            n._onBeforeUndoableChange = function () {
                ModernCanvas.mark("beforeUndoableChange", ModernCanvas.LogEvent.start);
                this._iframeDocument.execCommand("ms-beginUndoUnit");
                ModernCanvas.mark("beforeUndoableChange", ModernCanvas.LogEvent.stop)
            };
            n._countingChars = false;
            n._onCharacterCountChanged = function () {
                if (ModernCanvas.mark("onCharacterCountChanged", ModernCanvas.LogEvent.start),
                    this._countingChars) {
                    var n = this.getCharacterCount();
                    this._characterCount !== n && (this._characterCount = n,
                        Jx.raiseEvent(this, "charactercountchanged", {
                            characterCount: n
                        }))
                }
                ModernCanvas.mark("onCharacterCountChanged", ModernCanvas.LogEvent.stop)
            };
            n._onFocus = function () {
                this._restoreSelection()
            };
            n._onKeyDown = function (n) {
                ModernCanvas.mark("onKeyDown", ModernCanvas.LogEvent.start);
                this.components.shortcutManager.onKeyDown(n);
                if (!n.defaultPrevented)
                    this.components.autoReplaceManager.onKeyDown(n);
                ModernCanvas.mark("onKeyDown", ModernCanvas.LogEvent.stop)
            };
            n._onPasteImage = function (n, t, i) {
                ModernCanvas.mark("onPasteImage", ModernCanvas.LogEvent.start);
                var r = {
                    blob: n,
                    blobUrl: t,
                    blobStream: i
                };
                Jx.raiseEvent(this, "pasteimage", r);
                ModernCanvas.mark("onPasteImage", ModernCanvas.LogEvent.stop)
            };
            n._onUndoableChange = function (n) {
                ModernCanvas.mark("onUndoableChange", ModernCanvas.LogEvent.start);
                this._iframeDocument.execCommand("ms-endUndoUnit");
                n && n.backspaceUndoable && this._attachBackspaceUndoListener();
                ModernCanvas.mark("onUndoableChange", ModernCanvas.LogEvent.stop)
            };
            n._onWindowResize = function () {
                this._scrollableElement = null
            };
            n._paste = function (n) {
                ModernCanvas.mark("paste", ModernCanvas.LogEvent.start);
                try {
                    var i = this.components.commandManager,
                        t = i.getCommand("pasteFull"),
                        r = true;
                    t || (t = i.getCommand("pasteContentOnly"),
                        t || (t = i.getCommand("pasteTextOrSingleImage"),
                            t || (t = i.getCommand("pasteTextOnly"),
                                r = false)));
                    t && this._internalPaste(n, r, t)
                } catch (u) {
                    this._logFunctionAndReleaseClipboard(u)
                }
                return ModernCanvas.mark("paste", ModernCanvas.LogEvent.stop),
                    true
            };
            n._internalPaste = function (n, t, i) {
                var o = Windows.ApplicationModel.DataTransfer.Clipboard,
                    f = Windows.ApplicationModel.DataTransfer.StandardDataFormats,
                    r = o.getContent(),
                    e = t && r.contains("EnhancedMetafile") && !r.contains(f.bitmap),
                    u = this;
                (function () {
                    return e && r.contains(f.html) ? r.getHtmlFormatAsync() : WinJS.Promise.as()
                })().then(function (t) {
                    if (t && (t = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.getStaticFragment(t),
                            u._bufferArea.innerHTML = t,
                            (u._bufferArea.children.length !== 1 || u._bufferArea.children[0].tagName !== "IMG") && (e = false)),
                        e) {
                        var o = r.getDataAsync("EnhancedMetafile");
                        return new WinJS.Promise(u._getPasteImageFunction(r, o, "image/x-emf"))
                    }
                    return r.contains(f.text) && !r.contains(f.html) ? r.getTextAsync().then(function (t) {
                        return u._isLinkText(t) ? (u._pasteTextLink(t),
                            WinJS.Promise.as()) : new WinJS.Promise(u._getPasteContentFunction(n, r, i))
                    }) : new WinJS.Promise(u._getPasteContentFunction(n, r, i))
                }).done(this._completeClipboardOperation, this._logFunctionAndReleaseClipboard)
            };
            n._isLinkText = function (n) {
                return n.charAt(0) === '"' && n.charAt(n.length - 1) === '"' && !ModernCanvas.ModernCanvasBase.prototype._regexCarriageReturn.test(n) ? (n = n.substr(1, n.length - 2),
                    ModernCanvas.ModernCanvasBase.prototype._regexAbsoluteUrl.test(n)) : false
            };
            n._pasteTextLink = function (n) {
                var t = this.getSelectionRange(),
                    r, i;
                t && (this._onBeforeUndoableChange(),
                    n = n.substr(1, n.length - 2),
                    t.deleteContents(),
                    r = this.getDocument(),
                    i = r.createElement("a"),
                    i.href = n,
                    i.innerText = n,
                    t.insertNode(i),
                    ModernCanvas.runWorkersSynchronously([new ModernCanvas.HrefHtmlWorker(i.parentNode)]),
                    t.collapse(false),
                    this.replaceSelection(t),
                    this._onUndoableChange())
            };
            n._getPasteImageFunction = function (n, t, i) {
                var u = this._iframeDocument,
                    r = this;
                return function (n, f) {
                    t.then(function (n) {
                        var f;
                        r._onBeforeUndoableChange();
                        var o = MSApp.createBlobFromRandomAccessStream(i, n),
                            t = u.createElement("img"),
                            e = window.URL.createObjectURL(o, {
                                oneTimeOnly: false
                            });
                        t.src = e;
                        r._objectUrls.push(e);
                        t.style.maxHeight = r._maxImageSizeString;
                        t.style.maxWidth = r._maxImageSizeString;
                        t.tabIndex = -1;
                        f = r.getSelectionRange();
                        f && (f.deleteContents(),
                            f.insertNode(t));
                        r._onPasteImage(o, e, n);
                        r._onUndoableChange()
                    }).done(n, f)
                }
            };
            n._getPasteContentFunction = function (n, t, i) {
                var r = this,
                    u = false,
                    e = this.getSelectionRange().cloneRange(),
                    f = function (n) {
                        if (u && r.resumeEvents(),
                            n)
                            return WinJS.Promise.wrapError(n)
                    };
                return function (o, s) {
                    ModernCanvas.createUrlToStreamMapAsync(t).then(function (f) {
                        var s, o, h, c;
                        r._onBeforeUndoableChange();
                        s = new ModernCanvas.DurableRange(e);
                        o = s.range;
                        r.suspendEvents();
                        u = true;
                        r.replaceSelection(o);
                        i.run(n);
                        o = s.range;
                        h = r.getElementFromNode(o.commonAncestorContainer);
                        r._localizeHTML(h);
                        r._listFixUp(h);
                        r.components.commandManager._clearListStyleType(o);
                        r.components.commandManager._removeIllegalPhrasingContent(o);
                        c = r.trimRange(o);
                        c.collapse(false);
                        r.replaceSelection(c);
                        s.dispose();
                        f && r._localizeFromDataPackage(o, t.properties.applicationListingUri, f);
                        r._addEmptyLinesForTables();
                        r._onUndoableChange()
                    }).then(f, f).done(o, s)
                }
            };
            n._listFixUp = function (n) {
                for (var s = n.ownerDocument, f = n.getElementsByTagName("LI"), e = [], t, u, o, r, h, i = f.length; i--;)
                    this._hasAncestor(f[i], "OL", "UL") || e.push(f[i]);
                for (i = e.length; i--;) {
                    for (t = e[i],
                        u = s.createRange(),
                        u.selectNode(t),
                        t = t.nextSibling; t;)
                        this.isNodeName(t, "LI") && (i--,
                            u.setEndAfter(t)),
                        t = t.nextSibling;
                    u.surroundContents(s.createElement("UL"))
                }
                for (o = document.createNodeIterator(n, NodeFilter.SHOW_ELEMENT, function (n) {
                            return this.isNodeName(n, "DIV") && this.isNodeName(n.parentNode, "OL") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                        }
                        .bind(this), true),
                    r = o.nextNode(); r;)
                    h = [r.previousSibling, r.nextSibling, r.firstChild, r.lastChild],
                    h.filter(function (n) {
                            return this.isNodeName(n, "LI") && (n.childNodes.length === 0 || n.childNodes.length === 1 && n.firstChild.nodeType === Node.COMMENT_NODE)
                        }
                        .bind(this)).forEach(function (n) {
                        n.removeNode(false)
                    }),
                    r.removeNode(false),
                    r = o.nextNode()
            };
            n._hasAncestor = function (n) {
                for (var t = arguments; n;) {
                    if (t[0] = n,
                        this.isNodeName.apply(this, t))
                        return true;
                    n = n.parentNode
                }
                return false
            };
            n._preventInvalidKeystroke = function (n) {
                ModernCanvas.mark("preventInvalidKeystroke", ModernCanvas.LogEvent.start);
                this._lastKeyDown !== n.key && n.key === "Enter" && n.preventDefault();
                ModernCanvas.mark("preventInvalidKeystroke", ModernCanvas.LogEvent.stop)
            };
            n._queuedCueText = null;
            n._queuedInsertionSpellchecking = null;
            n._recordKey = function (n) {
                ModernCanvas.mark("recordKey", ModernCanvas.LogEvent.start);
                this._lastKeyDown = n.key;
                ModernCanvas.mark("recordKey", ModernCanvas.LogEvent.stop)
            };
            n._regexAbsoluteUrl = /^(((?:https?|file|ftp|gopher|telnet|mailto|news|ms-appx|ms-appdata|blob|onenote):)|\\\\)/i;
            n._regexCommentTags = /(<!--)|(-->)/g;
            n._regexCurrentColor = /currentColor/g;
            n._regexDeflated = /(<((?:div)|(?:p))[^<]*?>)[\r\n]*(<\/\2>)/gi;
            n._regexDoubleCarriageReturn = /\r\n\r\n/g;
            n._regexCarriageReturn = /[\r\n]/g;
            n._regexDoubleQuote = /"/g;
            n._regexQuoted = /^"([^"]*)"$/;
            n._regexWhitespace = /^\s+$/;
            n._releaseImageRestriction = function (n) {
                var t = n.target;
                if (t.nodeName === "IMG") {
                    var i = getComputedStyle(t),
                        r = i.height,
                        u = i.width;
                    t.removeAttribute("height");
                    t.removeAttribute("width");
                    t.style.removeAttribute("max-height");
                    t.style.removeAttribute("max-width");
                    t.style.height = r;
                    t.style.width = u
                }
            };
            n._restoreSelection = function () {
                if (ModernCanvas.mark("restoreSelection", ModernCanvas.LogEvent.start),
                    this._keepSelection) {
                    if (this._selectionBookmark && (this._selection = this._selectionBookmark.getBookmarkedRange(this._body) || this._selection),
                        !this._selection || this.rangeContainsNonEditableContent(this._selection)) {
                        this._selection = this._iframeDocument.createRange();
                        var n = this._body.children[0];
                        Boolean(n) && n.nodeName.toLowerCase() === "div" || (n = this._body);
                        this._selection.selectNodeContents(n);
                        this._selection.collapse(true)
                    }
                    try {
                        this.replaceSelection(this._selection)
                    } catch (t) {
                        this._selection = null;
                        this._selectionBookmark = null;
                        this._logFunction("Ignorable error while trying to restore the saved selection: " + t)
                    }
                    this._markSavedSelectionInvalid()
                }
                ModernCanvas.mark("restoreSelection", ModernCanvas.LogEvent.stop)
            };
            n._saveSelection = function () {
                ModernCanvas.mark("saveSelection", ModernCanvas.LogEvent.start);
                var n = this.getSelectionRange();
                n && (this._selection = n,
                    this._selectionBookmark = new ModernCanvas.RangeBookmark(n, this._body));
                ModernCanvas.mark("saveSelection", ModernCanvas.LogEvent.stop)
            };
            n._scrollableElement = null;
            n._selection = null;
            n._selectionBookmark = null;
            n._showCueText = function () {
                ModernCanvas.mark("showCueText", ModernCanvas.LogEvent.start);
                this._cueElement.setAttribute("aria-hidden", "false");
                ModernCanvas.mark("showCueText", ModernCanvas.LogEvent.stop)
            };
            n._showHideCueText = function () {
                ModernCanvas.mark("showHideCueText", ModernCanvas.LogEvent.start);
                this._activated && (this._iframeDocument.activeElement === this._body || this.visibleContent(this._body) ? this._hideCueText() : this._showCueText());
                ModernCanvas.mark("showHideCueText", ModernCanvas.LogEvent.stop)
            };
            n._srcToBlobUrlTable = {};
            n._srcToStreamTable = {};
            n.activate = function () {
                var t, n;
                ModernCanvas.mark("activate", ModernCanvas.LogEvent.start);
                this._activated || (this._activated = true,
                    this._body.innerHTML = "",
                    t = Jx.isRtl() ? "rtl" : "ltr",
                    this._iframeDocument.body.setAttribute("dir", t),
                    n = this,
                    this._queuedInsertions.forEach(function (t) {
                        n.addContent(t.content, t.format, ModernCanvas.ContentLocation.end, n._queuedInsertionSpellchecking)
                    }),
                    this._internalActivate(),
                    Jx.raiseEvent(this, "afteractivate"));
                ModernCanvas.mark("activate", ModernCanvas.LogEvent.stop)
            };
            n.addContent = function (n, t, i, r, u, f) {
                var l, h, e, o, c, s;
                ModernCanvas.mark("addContent", ModernCanvas.LogEvent.start);
                r = Boolean(r);
                this._activated ? (this._internalDeactivate(),
                    this._onBeforeUndoableChange(),
                    l = this._body.spellcheck,
                    this._body.spellcheck = r,
                    t === ModernCanvas.ContentFormat.text && (h = this._iframeDocument.createElement("div"),
                        h.innerText = n,
                        n = h.innerHTML,
                        n = n.replace(/\r(\n)?/g, "<br>"),
                        n = this.wrapTextContent(n)),
                    e = this.getDocument().createRange(),
                    e.selectNodeContents(this._body),
                    i === ModernCanvas.ContentLocation.start ? e.collapse(true) : i === ModernCanvas.ContentLocation.end ? e.collapse(false) : i === ModernCanvas.ContentLocation.selection && (e = this.getSelectionRange()),
                    t !== ModernCanvas.ContentFormat.documentFragment ? (n && (ModernCanvas.mark("addContent.toStaticHTML", ModernCanvas.LogEvent.start),
                            n = window.toStaticHTML(n),
                            ModernCanvas.mark("addContent.toStaticHTML", ModernCanvas.LogEvent.stop)),
                        ModernCanvas.mark("addContent.createContextualFragment", ModernCanvas.LogEvent.start),
                        o = e.createContextualFragment(n),
                        ModernCanvas.mark("addContent.createContextualFragment", ModernCanvas.LogEvent.stop)) : o = this.getDocument().adoptNode(n),
                    Boolean(e) && Boolean(o) && (ModernCanvas.mark("addContent.insertDocumentFragment", ModernCanvas.LogEvent.stop),
                        this._localizeHTML(o),
                        e.deleteContents(),
                        e.insertNode(o),
                        ModernCanvas.mark("addContent.insertDocumentFragment", ModernCanvas.LogEvent.stop)),
                    u && (c = this._iframeDocument.createRange(),
                        c.selectNodeContents(this._body),
                        this._localizeFromDataPackage(c, f, u)),
                    this._addEmptyLinesForTables(),
                    this._onCharacterCountChanged({}),
                    this._showHideCueText(),
                    this._internalActivate(),
                    this._body.spellcheck = l,
                    this._previousSpellChecking = null,
                    Jx.raiseEvent(this, "afteractivate")) : (this._queuedInsertionSpellchecking = r,
                    t === ModernCanvas.ContentFormat.text && (this._bufferArea.innerText = n,
                        n = this.wrapTextContent(this._bufferArea.innerHTML),
                        t = ModernCanvas.ContentFormat.htmlString),
                    s = {
                        content: n,
                        format: t
                    },
                    i === ModernCanvas.ContentLocation.end ? this._queuedInsertions.push(s) : i === ModernCanvas.ContentLocation.all ? this._queuedInsertions = [s] : this._queuedInsertions.unshift(s));
                ModernCanvas.mark("addContent", ModernCanvas.LogEvent.stop)
            };
            n.wrapTextContent = function (n) {
                return n
            };
            n.addEventListener = function (n, t, i) {
                n === "selectionchange" ? this._iframeDocument.addEventListener(n, t, i) : this._body.addEventListener(n, t, i)
            };
            n.addListener = function (n, t, i) {
                n === "charactercountchanged" && (this._countingChars = true,
                    this.addEventListener("DOMCharacterDataModified", this._onCharacterCountChanged, false),
                    this.addEventListener("DOMSubtreeModified", this._onCharacterCountChanged, false));
                Jx.addListener(this, n, t, i)
            };
            n.callWhenContentReady = function (n) {
                this._contentReadyCallback = n;
                this._fireContentReadyIfReady()
            };
            n.clearContent = function () {
                ModernCanvas.mark("clearContent", ModernCanvas.LogEvent.start);
                this._onBeforeUndoableChange();
                this._body.innerHTML = "";
                this._onUndoableChange();
                this._onCharacterCountChanged({});
                this._showHideCueText();
                ModernCanvas.mark("clearContent", ModernCanvas.LogEvent.stop)
            };
            n.clearUndoRedo = function () {
                ModernCanvas.mark("clearUndoRedo", ModernCanvas.LogEvent.start);
                this._iframeDocument.execCommand("ms-clearUndoStack");
                ModernCanvas.mark("clearUndoRedo", ModernCanvas.LogEvent.stop)
            };
            n.clearUsageData = function () {
                var n, t, i, r;
                for (ModernCanvas.mark("clearUsageData", ModernCanvas.LogEvent.start),
                    n = this.components,
                    t = Object.keys(n),
                    r = t.length; r--;)
                    i = n[t[r]],
                    typeof i.clearUsageData == "function" && i.clearUsageData();
                ModernCanvas.mark("clearUsageData", ModernCanvas.LogEvent.stop)
            };
            n.components = {
                autoReplaceManager: null,
                autoResize: null,
                commandManager: null,
                contextMenuManager: null,
                hyperlinkManager: null,
                shortcutManager: null
            };
            n.deactivate = function () {
                var t, n, r, i;
                if (ModernCanvas.mark("deactivate", ModernCanvas.LogEvent.start),
                    this._activated) {
                    for (this._internalDeactivate(),
                        this._activated = false,
                        this._queuedInsertionSpellchecking = null,
                        this._queuedInsertions = [],
                        this._srcToBlobUrlTable = {},
                        this._srcToStreamTable = {},
                        this._springLoader.bookmark && (this._springLoader = {},
                            this.removeEventListener("selectionchange", this._clearSpringLoader, false)),
                        t = this.getDocument().querySelectorAll("head > style.modernCanvas-contentStyle:not(.modernCanvas-defaultStyle)"),
                        n = 0,
                        r = t.length; n < r; n++)
                        i = t[n],
                        i.parentNode.removeChild(i);
                    this.replaceIframeSelectionRange()
                }
                ModernCanvas.mark("deactivate", ModernCanvas.LogEvent.stop)
            };
            n.dispose = function () {
                var t, i;
                for (ModernCanvas.mark("dispose", ModernCanvas.LogEvent.start),
                    t = this._objectUrls,
                    i = t.length; i--;)
                    URL.revokeObjectURL(t[i]);
                this.deactivate();
                var u = this._iframeElement,
                    n = this._iframeDocument,
                    f = u.ownerDocument,
                    r = this._cueElement;
                n.removeEventListener("mscontrolselect", this.components.hyperlinkManager.onClick, false);
                n.removeEventListener("click", this.components.hyperlinkManager.onClick, false);
                Jx.removeListener(this, "command", this.components.commandManager.onCommand, this.components.commandManager);
                n.removeEventListener("contextmenu", this.components.contextMenuManager.onContextMenu, false);
                n.removeEventListener("keydown", this._onKeyDown, false);
                n.removeEventListener("keydown", this._recordKey, true);
                n.removeEventListener("keyup", this.components.autoReplaceManager.onKeyUp, false);
                n.removeEventListener("keypress", this._preventInvalidKeystroke, true);
                r.removeEventListener("dragover", this._cueElementDragOver, false);
                r.removeEventListener("drop", this._cueElementDrop, false);
                r.removeEventListener("focus", this._cueElementFocus, false);
                window.removeEventListener("resize", this._onWindowResize, false);
                this.removeEventListener("beforedeactivate", this._saveSelection, false);
                this.removeEventListener("focus", this._onFocus, false);
                u.removeEventListener("focus", this._onIframeFocus, false);
                f.removeEventListener("keydown", this._markSavedSelectionValid, false);
                f.removeEventListener("keyup", this._markSavedSelectionInvalid, false);
                ModernCanvas.mark("dispose", ModernCanvas.LogEvent.stop)
            };
            n.focus = function () {
                this._focus()
            };
            n.getCanvasElement = function () {
                return this._body
            };
            n.getCharacterCount = function () {
                var n = ModernCanvas.ContentFormat.text,
                    t = this.getContent([n]);
                return t[n].length
            };
            n.getContent = function (n, t) {
                var i, o, s, r, f, e;
                if (ModernCanvas.mark("getContent", ModernCanvas.LogEvent.start),
                    t = t || ModernCanvas.ContentDestination.external,
                    i = {},
                    this._activated) {
                    if (o = n.some(function (n) {
                            return n === ModernCanvas.ContentFormat.htmlString
                        }),
                        s = n.some(function (n) {
                            return n === ModernCanvas.ContentFormat.text
                        }),
                        ModernCanvas.mark("getContent.bodyClone", ModernCanvas.LogEvent.start),
                        this.suspendEvents(),
                        r = this._delocalizeHTML(this._body, t),
                        this.resumeEvents(),
                        ModernCanvas.mark("getContent.bodyClone", ModernCanvas.LogEvent.stop),
                        o) {
                        ModernCanvas.mark("getContent.htmlString", ModernCanvas.LogEvent.start);
                        var h = this._getHeadContent(),
                            u = this._body.style,
                            c = Number(u.fontSize.replace("px", "")) / this._pxToPtRatio;
                        i[ModernCanvas.ContentFormat.htmlString] = '<!DOCTYPE html>\n<html>\n<head>\n<meta name="generator" content="Windows Mail ' + this._getVersion() + '">\n' + h.innerHTML + '<\/head>\n<body dir="' + u.direction + '">\n<div data-externalstyle="false" dir="' + u.direction + '" style="font-family:' + ModernCanvas.removeFakeFontNames(u.fontFamily).replace(this._regexDoubleQuote, "'") + ";font-size:" + c.toString() + 'pt;">' + r.innerHTML + "<\/div>\n<\/body>\n<\/html>\n";
                        ModernCanvas.mark("getContent.htmlString", ModernCanvas.LogEvent.stop)
                    }
                    if (s) {
                        for (ModernCanvas.mark("getContent.text", ModernCanvas.LogEvent.start),
                            f = r.querySelectorAll("img"),
                            e = f.length; e--;)
                            f[e].replaceNode(this._iframeDocument.createTextNode(" " + f[e].alt + " "));
                        i[ModernCanvas.ContentFormat.text] = r.innerText.replace(/\s+$/, "");
                        ModernCanvas.mark("getContent.text", ModernCanvas.LogEvent.stop)
                    }
                }
                return ModernCanvas.mark("getContent", ModernCanvas.LogEvent.stop),
                    i
            };
            n._getHeadContent = function () {
                var n, r, t, u, i;
                for (ModernCanvas.mark("getHeadContent", ModernCanvas.LogEvent.start),
                    n = document.createElement("head"),
                    r = this.getDocument().querySelectorAll("head > style.modernCanvas-contentStyle"),
                    t = 0,
                    u = r.length; t < u; t++)
                    i = r[t].cloneNode(true),
                    i.classList.remove("modernCanvas-contentStyle"),
                    i.classList.remove("modernCanvas-defaultStyle"),
                    n.appendChild(i);
                return this._commentOutStyles(n),
                    ModernCanvas.mark("getHeadContent", ModernCanvas.LogEvent.stop),
                    n
            };
            n._getVersion = function () {
                if (!this._version) {
                    var n = Windows.ApplicationModel.Package.current.id.version;
                    this._version = n.major + "." + n.minor + "." + n.build + "." + n.revision
                }
                return this._version
            };
            n.discardableClone = function (n, t) {
                return n.cloneNode(t)
            };
            n.getDocument = function () {
                return this._iframeDocument
            };
            n.getIframeElement = function () {
                return this._iframeElement
            };
            n.getSelection = function () {
                return this._saveSelection(),
                    this._selectionBookmark
            };
            n.getSelectionRange = function () {
                var n = this.getIframeSelectionRange();
                return Boolean(n) && this.isDescendantOf(n.commonAncestorContainer, this._body) ? n : null
            };
            n.scrollSelectionIntoView = function (n) {
                var e = this.getSelectionRange(),
                    t = this.getSelectionRangeBoundingRect();
                if (e && t) {
                    var r = this._iframeElement.getBoundingClientRect(),
                        u = r.top,
                        f = r.left,
                        i = 20,
                        o = {
                            top: t.top - i + u,
                            right: t.right + f,
                            bottom: t.bottom + i + u,
                            left: t.left + f,
                            width: t.width,
                            height: t.height + i * 2
                        };
                    this.scrollRectIntoView(o, n || this.getScrollableElement().getBoundingClientRect())
                }
            };
            n.scrollRectIntoView = function (n, t) {
                var i = this.getScrollableElement();
                n.height <= t.height && (n.top < t.top ? i.scrollTop -= t.top - n.top : n.bottom > t.bottom && (i.scrollTop += n.bottom - t.bottom));
                n.width <= t.width && (n.left < t.left ? i.scrollLeft -= t.left - n.left : n.left > t.right && (i.scrollLeft += n.right - t.right))
            };
            n._anchorElement = null;
            n.getAnchorElement = function (n) {
                var t, i, r;
                return t = this._anchorElement,
                    i = n.getBoundingClientRect(),
                    i.top === 0 && i.left === 0 && i.right === 0 && i.bottom === 0 ? (r = this.getElementFromNode(n.commonAncestorContainer),
                        t.style.width = r.offsetWidth.toString() + "px",
                        t.style.height = r.offsetHeight.toString() + "px",
                        t.style.top = r.offsetTop.toString() + "px",
                        t.style.left = r.offsetLeft.toString() + "px") : (t.style.width = i.width.toString() + "px",
                        t.style.height = i.height.toString() + "px",
                        t.style.top = i.top.toString() + "px",
                        t.style.left = i.left.toString() + "px"),
                    t
            };
            n._springLoader = {};
            n.addSpringLoader = function (n, t) {
                var i = this.getSelectionRange();
                i && (this._springLoader.bookmark = new ModernCanvas.RangeBookmark(i, this._body),
                    this._springLoader[n] = t,
                    this.addEventListener("selectionchange", this._clearSpringLoader, false))
            };
            n._clearSpringLoader = function () {
                var t = this.getSelectionRange(),
                    n = null;
                t && (n = new ModernCanvas.RangeBookmark(t, this._body));
                n && n.equals(this._springLoader.bookmark) || (this._springLoader = {},
                    this.removeEventListener("selectionchange", this._clearSpringLoader, false))
            };
            n.getBasicSelectionStyles = function () {
                var t = this.getSelectionRange(),
                    n;
                if (!t || (t = this.trimRange(t),
                        n = t.startContainer,
                        n.nodeType !== Node.TEXT_NODE && n.childNodes.length > t.startOffset ? n = n.childNodes[t.startOffset] : n.nodeType === Node.TEXT_NODE && n.length === t.startOffset && Boolean(n.nextSibling) && (n = n.nextSibling),
                        n.nodeType === Node.TEXT_NODE && (n = n.parentNode),
                        n === null || !(n.style)))
                    return {
                        bold: false,
                        underline: false,
                        italic: false
                    };
                var i = this.getWindow().getComputedStyle(n),
                    f = i.textDecoration,
                    e = i.fontStyle,
                    r = i.fontWeight,
                    u = parseInt(r, 10);
                return {
                    bold: Jx.isBoolean(this._springLoader.bold) ? this._springLoader.bold : u !== Number.NaN ? u > 500 : r === "bold" || r === "bolder",
                    underline: Jx.isBoolean(this._springLoader.underline) ? this._springLoader.underline : f.indexOf("underline") !== -1,
                    italic: Jx.isBoolean(this._springLoader.italic) ? this._springLoader.italic : e === "italic"
                }
            };
            n.getSelectionStyles = function () {
                var i = this.getDocument(),
                    r = this._getSelectionStyle("color"),
                    n = this.getBasicSelectionStyles(),
                    t;
                try {
                    t = rgb2hex(i.queryCommandValue("forecolor"))
                } catch (u) {}
                return {
                    fontSize: this._getSelectionStyle("fontSize"),
                    fontFamily: this._getSelectionStyle("fontFamily"),
                    fontColor: Jx.isNonEmptyString(t) ? t : r,
                    highlightColor: this._getSelectionStyle("backgroundColor"),
                    bold: n.bold,
                    italic: n.italic,
                    underline: n.underline
                }
            };
            n._getSelectionStyle = function (n) {
                function original(name) {
                    var selection = this.getSelectionRange(),
                        self = this,
                        f = function (t) {
                            var i = t,
                                r;
                            Boolean(i.style) || (i = i.parentNode);
                            do
                                r = self.getWindow().getComputedStyle(i)[name],
                                i = i.parentNode;
                            while (r === "transparent" && Boolean(i.parentNode));
                            return r === "transparent" && (r = "#ffffff"),
                                r
                        },
                        i, e;
                    if (!Boolean(selection))
                        return Jx.log.warning("Expected a selection inside getSelectionStyle."),
                            null;
                    if (i = selection.startContainer,
                        e = selection.endContainer,
                        i === e && (i.childNodes.length === 0 || selection.startOffset === selection.endOffset))
                        return f(i);
                    for (var o = selection.commonAncestorContainer, s = o.ownerDocument.createNodeIterator(o, NodeFilter.SHOW_TEXT, function (n) {
                            var i = selection.cloneRange();
                            return (i.selectNodeContents(n),
                                Jx.intersectsNode(selection, n, true) && Boolean(n.data)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                        }, false), r = s.nextNode(), u; r;) {
                        if (Boolean(u)) {
                            if (u !== f(r))
                                return null
                        } else
                            u = f(r);
                        r = s.nextNode()
                    }
                    return u
                }

                let retVal = original.bind(this)(n);
                return rgb2hex(retVal);
            };
            n.getUsageData = function () {
                ModernCanvas.mark("getUsageData", ModernCanvas.LogEvent.start);
                var n = {},
                    t = this.components;
                return n.commandManager = t.commandManager.getUsageData(),
                    n.shortcutManager = t.shortcutManager.getUsageData(),
                    n.contextMenuManager = t.contextMenuManager.getUsageData(),
                    ModernCanvas.mark("getUsageData", ModernCanvas.LogEvent.stop),
                    n
            };
            n.getWindow = function () {
                return this._iframeElement.contentWindow
            };
            n.insertElement = function (n) {
                var t, i;
                if (ModernCanvas.mark("insertElement", ModernCanvas.LogEvent.start),
                    t = this.getSelectionRange(),
                    t || (this._keepSelection = true,
                        this._restoreSelection(),
                        t = this.getSelectionRange()),
                    t) {
                    this._onBeforeUndoableChange();
                    i = this._iframeDocument.createElement("div");
                    t.deleteContents();
                    i.innerHTML = this.components.autoReplaceManager.getElementHTML(n, "inbound");
                    try {
                        t.insertNode(i.childNodes[0])
                    } catch (r) {}
                    t.collapse(false);
                    this._onUndoableChange()
                }
                this._saveSelection();
                ModernCanvas.mark("insertElement", ModernCanvas.LogEvent.stop)
            };
            n.isContentReady = function () {
                return !this.components.commandManager.executingCommand()
            };
            n.isRTL = function () {
                return this._body.getComputedStyle().direction === "rtl"
            };
            n.onResize = function () {
                ModernCanvas.mark("onResize", ModernCanvas.LogEvent.start);
                this.scrollSelectionIntoView();
                ModernCanvas.mark("onResize", ModernCanvas.LogEvent.stop)
            };
            n.refreshHeight = function () {
                ModernCanvas.mark("refreshHeight", ModernCanvas.LogEvent.start);
                var n = this._iframeElement.parentNode.getComputedStyle();
                this._iframeElement.style.minHeight = n.minHeight;
                this._iframeElement.style.height = n.height;
                ModernCanvas.mark("refreshHeight", ModernCanvas.LogEvent.stop)
            };
            n.removeEventListener = function (n, t, i) {
                n === "selectionchange" ? this._iframeDocument.removeEventListener(n, t, i) : this._body.removeEventListener(n, t, i)
            };
            n.removeListener = function (n, t, i) {
                n === "charactercountchanged" && (this.removeEventListener("DOMCharacterDataModified", this._onCharacterCountChanged, false),
                    this.removeEventListener("DOMSubtreeModified", this._onCharacterCountChanged, false),
                    this._countingChars = false);
                Jx.removeListener(this, n, t, i)
            };
            n.reset = function (n, t) {
                ModernCanvas.mark("reset", ModernCanvas.LogEvent.start);
                n || this.clearContent();
                t || this.clearUndoRedo();
                this.clearUsageData();
                this._characterCount = null;
                this._selection = null;
                this._selectionBookmark = null;
                this.deactivate();
                ModernCanvas.mark("reset", ModernCanvas.LogEvent.stop)
            };
            n.setCueText = function (n) {
                ModernCanvas.mark("setCueText", ModernCanvas.LogEvent.start);
                this._activated ? this._cueText !== n && (this._cueText ? n ? this._cueText = n : (this._cueText = "",
                        this.removeEventListener("focus", this._hideCueText, false),
                        this.removeEventListener("DOMNodeInserted", this._showHideCueText, false),
                        this.removeEventListener("blur", this._showHideCueText, false)) : n && (this._cueText = n,
                        this.addEventListener("focus", this._hideCueText, false),
                        this.addEventListener("DOMNodeInserted", this._showHideCueText, false),
                        this.addEventListener("blur", this._showHideCueText, false)),
                    this._cueElement.innerText = this._cueText) : this._queuedCueText = n;
                ModernCanvas.mark("setCueText", ModernCanvas.LogEvent.stop)
            };
            n.setSelection = function (n) {
                this._selectionBookmark = n || this._selectionBookmark;
                this._keepSelection = true;
                this._restoreSelection()
            };
            n.showCueText = function () {
                ModernCanvas.mark("showCueText", ModernCanvas.LogEvent.start);
                this._iframeDocument.activeElement !== this._body && this._showCueText();
                ModernCanvas.mark("showCueText", ModernCanvas.LogEvent.stop)
            };
            n.suspendEvents = function () {
                this._cueText && this.removeEventListener("DOMNodeInserted", this._showHideCueText, false);
                ModernCanvas.Component.prototype.suspendEvents.call(this)
            };
            n.resumeEvents = function () {
                this._cueText && (this.addEventListener("DOMNodeInserted", this._showHideCueText, false),
                    this._showHideCueText());
                ModernCanvas.Component.prototype.resumeEvents.call(this)
            }
        }();
    ModernCanvas.ModernCanvas = ModernCanvas.ModernCanvasBase;
    Jx.delayDefine(ModernCanvas, ["RangeBookmark", "DeserializedRangeBookmark"], function () {
        ModernCanvas.RangeBookmark = function (n, t) {
            var r = n.startContainer,
                f = this._getCorrectedOffset(r, n.startOffset),
                i, u;
            this._startDirections = this._getDirections(r, f, t);
            n.collapsed || (i = n.endContainer,
                u = this._getCorrectedOffset(i, n.endOffset),
                this._endDirections = this._getDirections(i, u, t))
        };
        ModernCanvas.RangeBookmark.fromStorage = function (n) {
            return new ModernCanvas.DeserializedRangeBookmark(n)
        };
        ModernCanvas.DeserializedRangeBookmark = function (n) {
            var t = n;
            this._startDirections = t._startDirections;
            this._endDirections = t._endDirections
        };
        Jx.inherit(ModernCanvas.DeserializedRangeBookmark, ModernCanvas.RangeBookmark);
        var n = ModernCanvas.RangeBookmark.prototype;
        n._getCorrectedOffset = function (n, t) {
            return typeof n.length == "number" ? Math.min(t, n.length) : Math.min(t, n.childNodes.length)
        };
        n._getDirections = function (n, t, i) {
            var o = this._getNearestElement(n),
                s = [],
                r, u, f, e;
            for (o === n ? (u = 0,
                    r = t > 0 ? n.childNodes.item(t - 1) : null) : (u = t,
                    r = n.previousSibling),
                f = o,
                e = n.nodeName; r !== i;) {
                while (r)
                    typeof r.length == "number" ? u += r.length : u++,
                    r = r.previousSibling;
                s.push({
                    horizontalDistance: u,
                    nodeName: e
                });
                u = 0;
                r = f;
                f = r.parentNode;
                e = r.nodeName
            }
            return s
        };
        n._getNearestElement = function (n) {
            return typeof n.length == "number" ? n.parentNode : n
        };
        n.getBookmarkedRange = function (n) {
            var i = n.ownerDocument.createRange(),
                r = this._followDirections(n, this._startDirections),
                t;
            if (!r)
                return null;
            if (i.setStart(r.node, r.offset),
                this._endDirections) {
                if (t = this._followDirections(n, this._endDirections),
                    !t)
                    return null;
                i.setEnd(t.node, t.offset)
            }
            return i
        };
        n._followDirections = function (n, t) {
            var f;
            var e = null,
                i = n,
                u = null,
                o = 0,
                s, r;
            for (f = t.length; f--;) {
                for (e = i,
                    u = i.firstChild,
                    i = null,
                    o = 0,
                    s = t[f],
                    r = s.horizontalDistance; r > 0;) {
                    if (i = u,
                        !i)
                        return null;
                    u = i.nextSibling;
                    o++;
                    typeof i.length == "number" ? r -= i.length : r--
                }
                if (f > 0 && i.nodeName !== s.nodeName)
                    return null
            }
            return i ? typeof i.length == "number" ? r += i.length : (i = e,
                r = o) : i = Boolean(u) && typeof u.length == "number" ? u : e, {
                node: i,
                offset: r
            }
        };
        n.equals = function (n) {
            return n ? this._compareDirections(this._startDirections, n._startDirections) && this._compareDirections(this._endDirections, n._endDirections) : false
        };
        n._compareDirections = function (n, t) {
            if (n || t) {
                if (!n || !t)
                    return false
            } else
                return true;
            if (n.length !== t.length)
                return false;
            for (var i = n.length; i--;)
                if (!this._compareDirection(n[i], t[i]))
                    return false;
            return true
        };
        n._compareDirection = function (n, t) {
            return n.horizontalDistance === t.horizontalDistance && n.nodeName === t.nodeName
        };
        n._startDirections = null;
        n._endDirections = null
    });
    Jx.delayDefine(ModernCanvas, "AutoReplaceManager", function () {
        ModernCanvas.AutoReplaceManager = function (n, t) {
            ModernCanvas.Component.call(this);
            this._autoReplaceTables = t || ModernCanvas.AutoReplaceManagerTables.instance();
            this._className = n || "default";
            this._currentFlag = "";
            try {
                this._workspace = document.createElement("div")
            } catch (i) {}
            this._assumeFinishingKeyStroke = this._assumeFinishingKeyStroke.bind(this);
            this.onKeyDown = this.onKeyDown.bind(this);
            this.onKeyUp = this.onKeyUp.bind(this)
        };
        Jx.inherit(ModernCanvas.AutoReplaceManager, ModernCanvas.Component);
        var t = ModernCanvas.AutoReplaceManager.replacementCharacter = "",
            n = ModernCanvas.AutoReplaceManager.prototype;
        n._assumeFinishingKeyStroke = function (n) {
            var u, a, e;
            ModernCanvas.mark("AutoReplaceManager.assumeFinishingKeyStroke", ModernCanvas.LogEvent.start);
            var t = this._autoReplaceTables.getRealTimeTree(),
                s = this.getDocument(),
                r = this.getTextSearchInfo(false);
            if (r) {
                for (var h = r.preString.length, v = r.preString, i = r.selection, y = r.searchRange, f = t; Boolean(f) && Boolean(h--);)
                    t = f,
                    f = t[v.charAt(h)];
                f && (t = f,
                    r.previousSibling || (t = t[""] || t[""] || t));
                var o = this._currentType,
                    c = this._currentValue,
                    l = ModernCanvas.NodeType;
                Boolean(t) && Boolean(t[o]) && t[o] !== l.ignore && (Jx.raiseEvent(this.getParent(), "beforeundoablechange"),
                    y.deleteContents(),
                    t[o] === l.string ? (u = s.createElement("div"),
                        u.innerHTML = t[c],
                        i.insertNode(u.childNodes[0])) : t[o] === l.element ? (u = s.createElement("div"),
                        u.innerHTML = this.getElementHTML.call(this, t[c], "inbound"),
                        i.insertNode(u.childNodes[0])) : Jx.raiseEvent(this.getParent(), "command", {
                        command: t[c],
                        undoable: false,
                        target: n.target
                    }),
                    a = v.substring(0, ++h),
                    a.length > 0 && i.insertNode(s.createTextNode(a)),
                    i.collapse(false),
                    e = this.getSelectionRange(),
                    e ? (e.collapse(false),
                        i.compareBoundaryPoints(Range.START_TO_START, e) > 0 ? this.replaceSelection(i) : this.replaceSelection(e)) : this.replaceSelection(i),
                    this.setFlag(),
                    Jx.raiseEvent(this.getParent(), "undoablechange", {
                        backspaceUndoable: t.backspaceUndoable
                    }))
            }
            ModernCanvas.mark("AutoReplaceManager.assumeFinishingKeyStroke", ModernCanvas.LogEvent.stop)
        };
        n._clearFlagOnNextKeyUp = false;
        n._currentFlag = "";
        n._currentType = "type";
        n._currentValue = "value";
        n._ensureBulkDefinitions = function (n) {
            for (var t, r = this._autoReplaceTables.getLoadedBulkClasses(), i = n.length; i--;)
                t = n[i],
                r[t] || (this.addBulkTable(ModernCanvas.AutoReplaceManager.Classes[this._className].bulk[t], t),
                    r[t] = true)
        };
        n._ensureElementDefinitions = function () {
            this._ensureElementDefinitions = function () {};
            this.addElementTable(ModernCanvas.AutoReplaceManager.Classes[this._className].element)
        };
        n._ensureRealTimeDefinitions = function () {
            this._ensureRealTimeDefinitions = function () {};
            this.addRealTimeTable(ModernCanvas.AutoReplaceManager.Classes[this._className].realTime)
        };
        n._regexElement = /(<style[^<]+<\/style>)|(<[^>]+>)/g;
        n._regexElementDataName = /<[^>]*?data-name/i;
        n._regexUnwrappedEntities = /&[^"'&<>; ]*;/gi;
        n._regexWrappedEntities = /_(&[^"'&<>; ]*;)_/gi;
        n._workspace = null;
        n.addBulkTable = function (n, t) {
            this._autoReplaceTables.addBulkTable(n, t)
        };
        n.addElementTable = function (n) {
            this._autoReplaceTables.addElementTable(n)
        };
        n.addRealTimeTable = function (n) {
            this._autoReplaceTables.addRealTimeTable(n)
        };
        n.bulkConvertRangeText = function (n, t) {
            var f;
            ModernCanvas.mark("AutoReplaceManager.bulkConvertRangeText", ModernCanvas.LogEvent.start);
            for (var e = this, r = n.commonAncestorContainer, u = r.ownerDocument.createNodeIterator(r, NodeFilter.SHOW_TEXT, function (t) {
                    return e.intersectsNode(n, t) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                }, false), i = u.nextNode(); i;)
                i === n.endContainer && i === n.startContainer ? (n.startOffset > 0 || n.endOffset < i.length) && (i = i.splitText(n.endOffset).previousSibling.splitText(n.startOffset)) : i === n.endContainer ? n.endOffset < i.length && (i = i.splitText(n.endOffset).previousSibling) : i === n.startContainer && n.startOffset > 0 && (i = i.splitText(n.startOffset)),
                f = u.nextNode(),
                this.bulkConvertTextNode(i, t),
                i = f;
            ModernCanvas.mark("AutoReplaceManager.bulkConvertRangeText", ModernCanvas.LogEvent.stop)
        };
        n.bulkConvertTextNode = function (n, t) {
            var r, i, u;
            ModernCanvas.mark("AutoReplaceManager.bulkConvertTextNode", ModernCanvas.LogEvent.start);
            this._workspace.innerText = "";
            this._workspace.appendChild(n.cloneNode(true));
            r = this.bulkConvert(null, this._workspace, t);
            r !== this._workspace.innerHTML && (i = n.ownerDocument.createRange(),
                i.selectNode(n),
                u = i.createContextualFragment(r),
                i.deleteContents(),
                i.insertNode(u));
            ModernCanvas.mark("AutoReplaceManager.bulkConvertTextNode", ModernCanvas.LogEvent.stop)
        };
        n.bulkConvertElement = function (n, t) {
            ModernCanvas.mark("AutoReplaceManager.bulkConvertElement", ModernCanvas.LogEvent.start);
            n.innerHTML = this.bulkConvert(null, n, t);
            ModernCanvas.mark("AutoReplaceManager.bulkConvertElement", ModernCanvas.LogEvent.stop)
        };
        n.bulkConvertString = function (n, t) {
            ModernCanvas.mark("AutoReplaceManager.bulkConvertString", ModernCanvas.LogEvent.start);
            var i = this.bulkConvert(n, null, t);
            return ModernCanvas.mark("AutoReplaceManager.bulkConvertString", ModernCanvas.LogEvent.stop),
                i
        };
        n.bulkConvert = function (n, t, i) {
            if (ModernCanvas.mark("AutoReplaceManager.bulkConvert", ModernCanvas.LogEvent.start),
                i = i || this._autoReplaceTables.getCurrentBulkClasses(),
                this._ensureBulkDefinitions(i),
                this._workspace && (Boolean(t) || this._regexElementDataName.test(n))) {
                var r = this._workspace;
                t ? r = this.discardableClone(t, true) : n && (r.innerHTML = toStaticHTML(n));
                this.bulkElementConversion(r, i);
                n = r.innerHTML
            }
            return !n && Boolean(t) && (n = t.innerHTML),
                n = this.bulkStringConversion(n, i),
                ModernCanvas.mark("AutoReplaceManager.bulkConvert", ModernCanvas.LogEvent.stop),
                n
        };
        n.bulkElementConversion = function (n, t, i) {
            var l, a, o;
            ModernCanvas.mark("AutoReplaceManager.bulkConvertString.elementConversion", ModernCanvas.LogEvent.start);
            t = t || this._autoReplaceTables.getCurrentBulkClasses();
            this._ensureBulkDefinitions(t);
            var v = t.length,
                y = ModernCanvas.NodeType,
                p = this._autoReplaceTables.getBulkTables().element,
                r, u, f, e, s, h, c = n.querySelectorAll("[data-name]");
            for (l = c.length; l--;)
                if (r = c[l],
                    !Boolean(i) || this.intersectsNode(i, r)) {
                    if (u = p[r.getAttribute("data-name")],
                        u)
                        for (f = 0; f < v; f++)
                            if (e = t[f],
                                u[e]) {
                                u = u[e];
                                break
                            }
                    if (Boolean(u) && Boolean(u.type)) {
                        for (u.type === y.string ? (s = r.getAttribute("data-textstyle"),
                                h = s ? '<span data-externalstyle="false" style="' + s + '">' + u.value + "<\/span>" : u.value) : h = this.getElementHTML(u.value, e),
                            r.insertAdjacentHTML("beforebegin", h),
                            a = r.ownerDocument.createNodeIterator(r, NodeFilter.SHOW_COMMENT, null, false),
                            o = a.nextNode(); o;)
                            r.parentNode.insertBefore(o, r),
                            o = a.nextNode();
                        r.parentNode.removeChild(r)
                    }
                }
            return ModernCanvas.mark("AutoReplaceManager.bulkConvertString.elementConversion", ModernCanvas.LogEvent.stop),
                c.length > 0
        };
        n.bulkStringConversion = function (n, i) {
            var l, a, f, e, v, u, o, c, s, h, r;
            for (ModernCanvas.mark("AutoReplaceManager.bulkConvertString.stringConversion", ModernCanvas.LogEvent.start),
                i = i || this._autoReplaceTables.getCurrentBulkClasses(),
                this._ensureBulkDefinitions(i),
                l = i.length,
                a = ModernCanvas.NodeType,
                n = n.replace(this._regexUnwrappedEntities, "_$0_"),
                u = "",
                o = 0; o < l; o++)
                if (c = i[o],
                    s = this._autoReplaceTables.getBulkTables().string[c],
                    Boolean(s) && Boolean(s.hasContent)) {
                    for (h = n.match(this._regexElement) || [],
                        this._autoReplaceTables.setReplacementBuffer(h),
                        Boolean(h) && h.length > 0 && (n = n.replace(this._regexElement, t)),
                        f = n.length; f > 0;) {
                        for (r = s,
                            e = f; e--;) {
                            if (r = r[n[e]],
                                !r)
                                break;
                            if (r.type) {
                                v = f - e;
                                break
                            }
                        }
                        Boolean(r) && Boolean(r.type) ? (u = r.type === a.string ? r.value + u : this.getElementHTML(r.value, c) + u,
                            f -= v) : u = n[--f] + u
                    }
                    n = u;
                    u = ""
                }
            return n = n.replace(this._regexWrappedEntities, "$1"),
                ModernCanvas.mark("AutoReplaceManager.bulkConvertString.stringConversion", ModernCanvas.LogEvent.stop),
                n
        };
        n.getElementHTML = function (n) {
            this._ensureElementDefinitions();
            var t = this._autoReplaceTables.getElements();
            return t[n]
        };
        n.onKeyDown = function (n) {
            var t, i;
            ModernCanvas.mark("AutoReplaceManager.onKeyDown", ModernCanvas.LogEvent.start);
            n.keyCode !== 229 && (t = n.key,
                t === "Shift" || t === "Control" ? this._clearFlagOnNextKeyUp = false : (i = n.char || "",
                    this._clearFlagOnNextKeyUp = true,
                    this._ensureRealTimeDefinitions(),
                    this._autoReplaceTables.getRealTimeTree()[i.substr(i.length - 1)] && this.getWindow().setImmediate(this._assumeFinishingKeyStroke, n)));
            ModernCanvas.mark("AutoReplaceManager.onKeyDown", ModernCanvas.LogEvent.stop)
        };
        n.onKeyUp = function (n) {
            return ModernCanvas.mark("AutoReplaceManager.onKeyUp", ModernCanvas.LogEvent.start),
                n.keyCode !== 229 && this._clearFlagOnNextKeyUp && (this.setFlag(),
                    this._clearFlagOnNextKeyUp = false),
                ModernCanvas.mark("AutoReplaceManager.onKeyUp", ModernCanvas.LogEvent.stop),
                true
        };
        n.setDefaultClasses = function (n) {
            this._autoReplaceTables.setDefaultClasses(n)
        };
        n.setFlag = function (n) {
            n = n || "";
            this._currentFlag = n;
            this._currentType = "type" + n;
            this._currentValue = "value" + n
        };
        ModernCanvas.AutoReplaceManager.Classes = {
            "default": {
                element: {},
                realTime: [
                    ["(c)", "string", "&copy;"],
                    ["(e)", "string", "&euro;"],
                    ["(r)", "string", "&reg;"],
                    ["(tm)", "string", "&trade;"],
                    ["<--", "string", "&larr;"],
                    ["-->", "string", "&rarr;"],
                    ["<->", "string", "&harr;"],
                    ["<==", "string", "&lArr;"],
                    ["==>", "string", "&rArr;"],
                    ["<=>", "string", "&hArr;"],
                    ['"', "string", "&ldquo;"],
                    ['("', "string", "(&ldquo;"],
                    ['["', "string", "[&ldquo;"],
                    ['{"', "string", "{&ldquo;"],
                    ['<"', "string", "<&ldquo;"],
                    [' "', "string", "&nbsp;&ldquo;"],
                    ['"', "string", "&rdquo;"],
                    ["'", "string", "&lsquo;"],
                    [" '", "string", "&nbsp;&lsquo;"],
                    ["('", "string", "(&lsquo;"],
                    ["['", "string", "[&lsquo;"],
                    ["{'", "string", "{&lsquo;"],
                    ["<'", "string", "<&lsquo;"],
                    ["'", "string", "&rsquo;"],
                    ["A", "string", "&Agrave;", "grave"],
                    ["A", "string", "&Aacute;", "acute"],
                    ["A", "string", "&Acirc;", "circumflex"],
                    ["A", "string", "&Atilde;", "tilde"],
                    ["A", "string", "&Auml;", "diaeresis"],
                    ["A", "string", "&Aring;", "ring"],
                    ["A", "string", "&AElig;", "ligature"],
                    ["C", "string", "&Ccedil;", "cedilla"],
                    ["D", "string", "&ETH;", "acute"],
                    ["E", "string", "&Egrave;", "grave"],
                    ["E", "string", "&Eacute;", "acute"],
                    ["E", "string", "&Ecirc;", "circumflex"],
                    ["E", "string", "&Euml;", "diaeresis"],
                    ["I", "string", "&Igrave;", "grave"],
                    ["I", "string", "&Iacute;", "acute"],
                    ["I", "string", "&Icirc;", "circumflex"],
                    ["I", "string", "&Iuml;", "diaeresis"],
                    ["N", "string", "&Ntilde;", "tilde"],
                    ["O", "string", "&Ograve;", "grave"],
                    ["O", "string", "&Oacute;", "acute"],
                    ["O", "string", "&Ocirc;", "circumflex"],
                    ["O", "string", "&Ouml;", "diaeresis"],
                    ["O", "string", "&OElig;", "ligature"],
                    ["O", "string", "&Otilde;", "tilde"],
                    ["O", "string", "&Oslash;", "slash"],
                    ["U", "string", "&Ugrave;", "grave"],
                    ["U", "string", "&Uacute;", "acute"],
                    ["U", "string", "&Ucirc;", "circumflex"],
                    ["U", "string", "&Uuml;", "diaeresis"],
                    ["Y", "string", "&Yacute;", "acute"],
                    ["Y", "string", "&Yuml;", "diaeresis"],
                    ["a", "string", "&agrave;", "grave"],
                    ["a", "string", "&aacute;", "acute"],
                    ["a", "string", "&acirc;", "circumflex"],
                    ["a", "string", "&atilde;", "tilde"],
                    ["a", "string", "&auml;", "diaeresis"],
                    ["a", "string", "&aring;", "ring"],
                    ["a", "string", "&aelig;", "ligature"],
                    ["c", "string", "&ccedil;", "cedilla"],
                    ["d", "string", "&eth;", "acute"],
                    ["e", "string", "&egrave;", "grave"],
                    ["e", "string", "&eacute;", "acute"],
                    ["e", "string", "&ecirc;", "circumflex"],
                    ["e", "string", "&euml;", "diaeresis"],
                    ["i", "string", "&igrave;", "grave"],
                    ["i", "string", "&iacute;", "acute"],
                    ["i", "string", "&icirc;", "circumflex"],
                    ["i", "string", "&iuml;", "diaeresis"],
                    ["n", "string", "&ntilde;", "tilde"],
                    ["o", "string", "&ograve;", "grave"],
                    ["o", "string", "&oacute;", "acute"],
                    ["o", "string", "&ocirc;", "circumflex"],
                    ["o", "string", "&ouml;", "diaeresis"],
                    ["o", "string", "&oelig;", "ligature"],
                    ["o", "string", "&otilde;", "tilde"],
                    ["o", "string", "&oslash;", "slash"],
                    ["s", "string", "&szlig;", "ligature"],
                    ["u", "string", "&ugrave;", "grave"],
                    ["u", "string", "&uacute;", "acute"],
                    ["u", "string", "&ucirc;", "circumflex"],
                    ["u", "string", "&uuml;", "diaeresis"],
                    ["y", "string", "&yacute;", "acute"],
                    ["y", "string", "&yuml;", "diaeresis"],
                    ["* ", "command", "bullets"],
                    ["- ", "command", "bullets"],
                    ["1. ", "command", "numbers"],
                    ["1) ", "command", "numbers"]
                ],
                bulk: {
                    outbound: [
                        ["string", "©", "string", "(c)"]
                    ]
                }
            },
            empty: {
                element: {},
                realTime: [],
                bulk: {}
            }
        }
    });
    Jx.delayDefine(ModernCanvas, "AutoReplaceManagerTables", function () {
        ModernCanvas.AutoReplaceManagerTables = function () {
            this._realTimeTree = {};
            this._bulkTables = {
                element: {},
                string: {},
                stringIndex: {}
            };
            this._currentBulkClasses = [""];
            this._loadedBulkClasses = {};
            this._elements = {};
            this._replacementBuffer = null;
            var n = ModernCanvas.AutoReplaceManager.replacementCharacter;
            Object.defineProperty(this._elements, n, {
                enumerable: false,
                configurable: true,
                get: function () {
                        return this._replacementBuffer ? this._replacementBuffer.pop() : ""
                    }
                    .bind(this),
                set: function () {}
            })
        };
        ModernCanvas.AutoReplaceManagerTables.instance = function () {
            return new ModernCanvas.AutoReplaceManagerTables
        };
        ModernCanvas.AutoReplaceManagerTables.prototype = {
            getRealTimeTree: function () {
                return this._realTimeTree
            },
            getBulkTables: function () {
                return this._bulkTables
            },
            getCurrentBulkClasses: function () {
                return this._currentBulkClasses
            },
            getLoadedBulkClasses: function () {
                return this._loadedBulkClasses
            },
            getElements: function () {
                return this._elements
            },
            setReplacementBuffer: function (n) {
                this._replacementBuffer = n
            },
            setDefaultClasses: function (n) {
                this._currentBulkClasses = n
            },
            addElementTable: function (n) {
                var t, i;
                if (ModernCanvas.mark("AutoReplaceManager.addElementTable", ModernCanvas.LogEvent.start),
                    n)
                    for (t = Object.keys(n),
                        i = t.length; i--;)
                        this._elements[t[i]] = n[t[i]];
                ModernCanvas.mark("AutoReplaceManager.addElementTable", ModernCanvas.LogEvent.stop)
            },
            addRealTimeTable: function (n) {
                var o, u, v, s, i, r, h, f, t, c, l, a, e;
                for (ModernCanvas.mark("AutoReplaceManager.addRealTimeTable", ModernCanvas.LogEvent.start),
                    a = this._realTimeTree,
                    o = n.length; o--;)
                    for (i = n[o],
                        r = i[0],
                        typeof r == "string" && (r = [r]),
                        s = r.length; s--;) {
                        for (t = a,
                            h = r[s],
                            u = h.length,
                            v = u - 1; u--;)
                            f = h.charAt(u),
                            t[f] || (t[f] = {}),
                            t = t[f];
                        c = "type";
                        l = "value";
                        e = i[3];
                        Jx.isNullOrUndefined(e) ? t.backspaceUndoable = true : Jx.isBoolean(e) ? t.backspaceUndoable = e : (c += i[3],
                            l += i[3]);
                        t[c] = i[1];
                        t[l] = i[2]
                    }
                ModernCanvas.mark("AutoReplaceManager.addRealTimeTable", ModernCanvas.LogEvent.stop)
            },
            addBulkTable: function (n, t) {
                var h, c, s, l, a, u, e, f, o, i, r, v;
                if (Boolean(n)) {
                    for (ModernCanvas.mark("AutoReplaceManager.addBulkTable", ModernCanvas.LogEvent.start),
                        h = ModernCanvas.AutoReplaceManager.replacementCharacter,
                        n.push(["string", h, "element", h]),
                        t = t || this._currentBulkClasses[0],
                        c = this._bulkTables.element,
                        s = this._bulkTables.string,
                        s[t] = s[t] || {},
                        l = s[t],
                        v = ModernCanvas.NodeType,
                        a = n.length; a--;)
                        if (f = n[a],
                            r = f[1],
                            typeof r == "string" && (r = [r]),
                            f[0] === v.string)
                            for (l.hasContent = true,
                                u = r.length; u--;) {
                                for (o = r[u],
                                    i = l,
                                    e = o.length; e--;)
                                    i = Boolean(i[o[e]]) ? i[o[e]] : i[o[e]] = {};
                                i.type = f[2];
                                i.value = f[3]
                            }
                    else
                        for (u = r.length; u--;)
                            i = c[r[u]] || {},
                            i[t] = {
                                type: f[2],
                                value: f[3]
                            },
                            c[r[u]] = i;
                    ModernCanvas.mark("AutoReplaceManager.addBulkTable", ModernCanvas.LogEvent.stop)
                }
            }
        }
    });
    Jx.delayDefine(ModernCanvas, ["Command", "CommandManager"], function () {
        var t = window.ModernCanvas,
            u, n, i, r;
        t.Command = function (n, i, r) {
            t.Component.call(this);
            this.id = n;
            this.run = i;
            r && (Jx.isNumber(r.enabledOn) && (this.enabledOn = r.enabledOn),
                Jx.isBoolean(r.undoable) && (this.undoable = r.undoable))
        };
        Jx.inherit(t.Command, t.Component);
        t.Command.EnableStates = {
            always: 0,
            hasSelection: 1,
            hasEditableSelection: 2,
            hasNonEmptySelection: 4,
            inLink: 8,
            notInLink: 16
        };
        u = t.Command.prototype;
        u.enabled = true;
        u.enabledOn = t.Command.EnableStates.hasSelection;
        u.id = "commandId";
        u.isEnabled = function (n) {
            return (this.enabledOn & n) === this.enabledOn
        };
        u.run = function () {};
        u.undoable = true;
        t.CommandManager = function (n, i) {
            t.Component.call(this);
            this._className = n || "default";
            this._commands = {};
            this._queue = [];
            this.setModernCanvas(i);
            this._processQueue = this._processQueue.bind(this);
            this.fireAfterCommand = this.fireAfterCommand.bind(this);
            this.updateEnabledStates = this.updateEnabledStates.bind(this)
        };
        Jx.inherit(t.CommandManager, t.Component);
        n = t.CommandManager.prototype;
        i = t.CommandManager.Classes = {
            empty: []
        };
        i.basic = ["accentAcute", "accentCedilla", "accentCircumflex", "accentDiaeresis", "accentGrave", "accentLigature", "accentRing", "accentSlash", "accentTilde", "copy", "cut", "pasteTextOnly", "quotedLink", "redo", "selectAll", "undo"];
        i.default = i.basic.concat(["alignCenter", "alignLeft", "alignRight", "bold", "bullets", "clearFormatting", "directionLtr", "directionRtl", "growFont", "growFontOnePoint", "indent", "insertHyperlink", "italic", "numbers", "openLink", "outdent", "removeHyperlink", "setFontColor", "setFontFamily", "setFontHighlightColor", "setFontSize", "showHyperlinkControl", "shrinkFont", "shrinkFontOnePoint", "underline"]);
        i.full = i.default.concat(["pasteFull"]);
        i.calendar = i.default;
        i.chat = i.basic;
        i.mail = i.full;
        i.people = i.basic;
        i.stm = i.full;
        r = t.Command.EnableStates;
        t.CommandManager.CommandDefinitions = {};
        Object.defineProperties(t.CommandManager.CommandDefinitions, {
            accentAcute: {
                get: function () {
                    return new t.Command("accentAcute", n._accentAcute)
                },
                enumerable: true
            },
            accentCedilla: {
                get: function () {
                    return new t.Command("accentCedilla", n._accentCedilla)
                },
                enumerable: true
            },
            accentCircumflex: {
                get: function () {
                    return new t.Command("accentCircumflex", n._accentCircumflex)
                },
                enumerable: true
            },
            accentDiaeresis: {
                get: function () {
                    return new t.Command("accentDiaeresis", n._accentDiaeresis)
                },
                enumerable: true
            },
            accentGrave: {
                get: function () {
                    return new t.Command("accentGrave", n._accentGrave)
                },
                enumerable: true
            },
            accentLigature: {
                get: function () {
                    return new t.Command("accentLigature", n._accentLigature)
                },
                enumerable: true
            },
            accentRing: {
                get: function () {
                    return new t.Command("accentRing", n._accentRing)
                },
                enumerable: true
            },
            accentSlash: {
                get: function () {
                    return new t.Command("accentSlash", n._accentSlash)
                },
                enumerable: true
            },
            accentTilde: {
                get: function () {
                    return new t.Command("accentTilde", n._accentTilde)
                },
                enumerable: true
            },
            alignCenter: {
                get: function () {
                    return new t.Command("alignCenter", n._alignCenter)
                },
                enumerable: true
            },
            alignLeft: {
                get: function () {
                    return new t.Command("alignLeft", n._alignLeft)
                },
                enumerable: true
            },
            alignRight: {
                get: function () {
                    return new t.Command("alignRight", n._alignRight)
                },
                enumerable: true
            },
            bold: {
                get: function () {
                    return new t.Command("bold", n._bold)
                },
                enumerable: true
            },
            bullets: {
                get: function () {
                    return new t.Command("bullets", n._bullets)
                },
                enumerable: true
            },
            clearFormatting: {
                get: function () {
                    return new t.Command("clearFormatting", n._clearFormatting)
                },
                enumerable: true
            },
            copy: {
                get: function () {
                    return new t.Command("copy", n._copy, {
                        enabledOn: r.hasNonEmptySelection,
                        undoable: false
                    })
                },
                enumerable: true
            },
            cut: {
                get: function () {
                    return new t.Command("cut", n._cut, {
                        enabledOn: r.hasNonEmptySelection | r.hasEditableSelection
                    })
                },
                enumerable: true
            },
            directionLtr: {
                get: function () {
                    return new t.Command("directionLtr", n._directionLtr)
                },
                enumerable: true
            },
            directionRtl: {
                get: function () {
                    return new t.Command("directionRtl", n._directionRtl)
                },
                enumerable: true
            },
            growFont: {
                get: function () {
                    return new t.Command("growFont", n._growFont)
                },
                enumerable: true
            },
            growFontOnePoint: {
                get: function () {
                    return new t.Command("growFontOnePoint", n._growFontOnePoint)
                },
                enumerable: true
            },
            indent: {
                get: function () {
                    return new t.Command("indent", n._indent)
                },
                enumerable: true
            },
            insertHyperlink: {
                get: function () {
                    return new t.Command("insertHyperlink", n._insertHyperlink, {
                        enabledOn: r.always
                    })
                },
                enumerable: true
            },
            showHyperlinkControl: {
                get: function () {
                    return new t.Command("showHyperlinkControl", n._showHyperlinkControl, {
                        undoable: false
                    })
                },
                enumerable: true
            },
            italic: {
                get: function () {
                    return new t.Command("italic", n._italic)
                },
                enumerable: true
            },
            numbers: {
                get: function () {
                    return new t.Command("numbers", n._numbers)
                },
                enumerable: true
            },
            openLink: {
                get: function () {
                    return new t.Command("openLink", n._openLink, {
                        enabledOn: r.inLink,
                        undoable: false
                    })
                },
                enumerable: true
            },
            outdent: {
                get: function () {
                    return new t.Command("outdent", n._outdent)
                },
                enumerable: true
            },
            paste: {
                get: function () {
                    return new t.Command("paste", n._paste, {
                        enabledOn: r.hasEditableSelection
                    })
                },
                enumerable: true
            },
            pasteContentOnly: {
                get: function () {
                    return new t.Command("pasteContentOnly", n._pasteContentOnly)
                },
                enumerable: true
            },
            pasteFull: {
                get: function () {
                    return new t.Command("pasteFull", n._paste)
                },
                enumerable: true
            },
            pasteTextOnly: {
                get: function () {
                    return new t.Command("pasteTextOnly", n._pasteTextOnly)
                },
                enumerable: true
            },
            pasteTextOrSingleImage: {
                get: function () {
                    return new t.Command("pasteTextOrSingleImage", n._pasteTextOnly)
                },
                enumerable: true
            },
            quotedLink: {
                get: function () {
                    return new t.Command("quotedLink", n._quotedLink, {
                        undoable: false
                    })
                },
                enumerable: true
            },
            redo: {
                get: function () {
                    return new t.Command("redo", n._redo, {
                        undoable: false
                    })
                },
                enumerable: true
            },
            removeHyperlink: {
                get: function () {
                    return new t.Command("removeHyperlink", n._removeHyperlink, {
                        enabledOn: r.inLink | r.hasEditableSelection
                    })
                },
                enumerable: true
            },
            selectAll: {
                get: function () {
                    return new t.Command("selectAll", n._selectAll, {
                        enabledOn: r.hasEditableSelection,
                        undoable: false
                    })
                },
                enumerable: true
            },
            setFontColor: {
                get: function () {
                    return new t.Command("setFontColor", n._setFontColor)
                },
                enumerable: true
            },
            setFontFamily: {
                get: function () {
                    return new t.Command("setFontFamily", n._setFontFamily)
                },
                enumerable: true
            },
            setFontHighlightColor: {
                get: function () {
                    return new t.Command("setFontHighlightColor", n._setFontHighlightColor)
                },
                enumerable: true
            },
            setFontSize: {
                get: function () {
                    return new t.Command("setFontSize", n._setFontSize)
                },
                enumerable: true
            },
            shrinkFont: {
                get: function () {
                    return new t.Command("shrinkFont", n._shrinkFont)
                },
                enumerable: true
            },
            shrinkFontOnePoint: {
                get: function () {
                    return new t.Command("shrinkFontOnePoint", n._shrinkFontOnePoint)
                },
                enumerable: true
            },
            underline: {
                get: function () {
                    return new t.Command("underline", n._underline)
                },
                enumerable: true
            },
            undo: {
                get: function () {
                    return new t.Command("undo", n._undo, {
                        undoable: false
                    })
                },
                enumerable: true
            }
        });
        n._commands = {};
        n._ensureCommands = function () {
            var u, i, r, n;
            for (this._ensureCommands = function () {},
                u = t.CommandManager.CommandDefinitions,
                i = t.CommandManager.Classes[this._className],
                r = i.length; r--;)
                n = u[i[r]],
                n.run = n.run.bind(this),
                this.setCommand(n)
        };
        n._execute = function (n, t, i, r) {
            ModernCanvas.mark("execCommand." + t, ModernCanvas.LogEvent.start);
            this.getDocument().execCommand(t, i, r);
            ModernCanvas.mark("execCommand." + t, ModernCanvas.LogEvent.stop)
        };
        n._executingCommandEvent = null;
        n._modernCanvas = null;
        n._isUndoable = function (n) {
            return Jx.isBoolean(n.undoable) ? n.undoable : this._commands[n.command].undoable
        };
        n._processQueue = function () {
            var t, n, i;
            !this._executingCommandEvent && this._queue.length > 0 && (t = this._queue.shift(),
                n = this._commands[t.command],
                Boolean(n) && Boolean(n.run) && (this.updateEnabledStates([n], t),
                    n.enabled && (this._executingCommandEvent = t,
                        Jx.raiseEvent(this.getParent(), "beforecommand", t),
                        this._isUndoable(t) && Jx.raiseEvent(this.getParent(), "beforeundoablechange"),
                        i = this._usageData[n.id] || 0,
                        this._usageData[n.id] = i + 1,
                        n.run(t) || this.fireAfterCommand())))
        };
        n._queue = [];
        n._setFontStyle = function (n, t) {
            var s, r;
            if (s = function (i) {
                    if (n !== "background-color") {
                        for (var r = i, u = r.style; Boolean(u) && (u.backgroundColor === "" || u.backgroundColor === "transparent") && u.display !== "block";)
                            r = r.parentNode,
                            u = r.style;
                        Boolean(r.style) && r.style.backgroundColor !== "transparent" && (i.style.backgroundColor = r.style.backgroundColor)
                    }
                    n !== "font-family" ? window.getComputedStyle(i)[n] !== t && (i.style[n] = t) : i.getAttribute("face") !== t && i.setAttribute("face", t)
                },
                r = this.trimRange(this.getSelectionRange()),
                r) {
                for (var h = this._createTextRangeIterator(r), u = h.nextRange(), c = this.getDocument(), f, e, o, i; u;)
                    f = u.startContainer,
                    e = u.endContainer,
                    u.startOffset !== 0 || u.endOffset !== e.length || f.previousSibling || e.nextSibling || !this.isNodeName(f.parentNode, "FONT") ? u.startOffset === 0 && u.endOffset === e.childNodes.length && f === e && this.isNodeName(f, "FONT") ? i = f : (i = c.createElement("FONT"),
                        u.surroundContents(i)) : i = f.parentNode,
                    s(i),
                    o || (o = i),
                    u = h.nextRange();
                o && i && (r.collapsed ? r.selectNodeContents(i) : (r.setStart(o, 0),
                        i.lastChild ? r.setEndAfter(i.lastChild) : r.setEndAfter(i)),
                    this.replaceSelection(r))
            }
        };
        n._accentAcute = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.acute)
        };
        n._accentCedilla = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.cedilla)
        };
        n._accentCircumflex = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.circumflex)
        };
        n._accentDiaeresis = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.diaeresis)
        };
        n._accentGrave = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.grave)
        };
        n._accentLigature = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.ligature)
        };
        n._accentRing = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.ring)
        };
        n._accentSlash = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.slash)
        };
        n._accentTilde = function () {
            this._modernCanvas.components.autoReplaceManager.setFlag(t.FlagType.tilde)
        };
        n._alignCenter = function (n) {
            this._execute(n, "JustifyCenter")
        };
        n._alignLeft = function (n) {
            this._execute(n, "JustifyLeft")
        };
        n._alignRight = function (n) {
            this._execute(n, "JustifyRight")
        };
        n._bold = function (n) {
            var t = this.getSelectionRange(),
                r = {},
                i;
            t.collapsed && (r = this.getParent().getBasicSelectionStyles());
            this._execute(n, "Bold");
            t = this.getSelectionRange();
            t.collapsed && (i = this.getParent().getBasicSelectionStyles(),
                r.bold === i.bold && this.getParent().addSpringLoader("bold", !i.bold));
            this._removeIllegalPhrasingContent()
        };
        n._bullets = function (n) {
            var t = this._findParentLi();
            t || this._removeTrailingBr();
            this._execute(n, "InsertUnorderedList");
            this._clearListStyleType();
            this._styleNewListElements(t)
        };
        n._removeTrailingBr = function () {
            var n = this.getSelectionRange();
            if (n.collapsed) {
                var r = this.getElementFromNode(n.commonAncestorContainer),
                    t = this.getAncestor(r, this.isBlockElement),
                    i = t.lastChild;
                this.isNodeName(i, "BR") && t.removeChild(i)
            }
        };
        n._clearListStyleType = function (n) {
            if (n = n || this.getSelectionRange(),
                n) {
                for (var i = n.commonAncestorContainer, u = i.ownerDocument, f = this, r = u.createNodeIterator(i, NodeFilter.SHOW_ELEMENT, function (n) {
                        return f.isNodeName(n, "UL", "OL") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                    }, false), t = r.nextNode(); t;)
                    t.style.listStyleType = "",
                    t = r.nextNode();
                t = i;
                do
                    this.isNodeName(t, "UL", "OL") && (t.style.listStyleType = ""),
                    t = t.parentNode;
                while (t)
            }
        };
        n._clearFormatting = function (n, t) {
            var r = this.getSelectionRange(),
                o = null,
                f, u, c;
            if ((!Boolean(r) || r.collapsed) && (o = r,
                    r = this.getSelectionRange()),
                !r.collapsed) {
                this._execute(n, "RemoveFormat");
                f = this.getElementFromNode(r.commonAncestorContainer);
                r = this.trimRange(r);
                f = this.getElementFromNode(r.commonAncestorContainer);
                t = Jx.isFunction(t) ? t : function () {
                    return true
                };
                for (var l = this, a = f.ownerDocument, h = a.createNodeIterator(f, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, function (n) {
                        return l.intersectsNode(r, n, true) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                    }, false), i = h.nextNode(), e = 0, s = []; i;)
                    e = Math.max(e, this._countLists(i)),
                    this.isNodeName(i, "H1", "H2", "H3", "H4", "H5", "H6", "DEL", "MARK") ? s.push(i) : i.nodeType === Node.ELEMENT_NODE && (t(i) && i.removeAttribute("style"),
                        i.removeAttribute("bgcolor"),
                        i.removeAttribute("align"),
                        i.style && i.getComputedStyle() && (u = i.getComputedStyle().fontWeight,
                            Boolean(u) && u !== "" && u !== "normal" && u !== "400" && (i.style.fontWeight = "normal"))),
                    i = h.nextNode();
                for (; e; e--)
                    this._execute(n, "Outdent");
                while (s.length)
                    c = s.pop(),
                    c.removeNode(false);
                o && this.replaceSelection(o)
            }
        };
        n._countLists = function (n) {
            for (var t = 0; n;)
                this.isNodeName(n, "OL", "UL") && t++,
                n = n.parentNode;
            return t
        };
        n._copy = function (n) {
            this._execute(n, "Copy")
        };
        n._cut = function (n) {
            this._execute(n, "Cut")
        };
        n._directionLtr = function (n) {
            this._execute(n, "BlockDirLTR")
        };
        n._directionRtl = function (n) {
            this._execute(n, "BlockDirRTL")
        };
        n._getFontSizeFromSelection = function () {
            var t = this.getSelectionRange(),
                n = t.startContainer,
                r, i;
            return (t.collapsed || (r = this.getDocument().createNodeIterator(t.commonAncestorContainer, NodeFilter.SHOW_TEXT, function (n) {
                            return Boolean(n.data) && this.intersectsNode(t, n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                        }
                        .bind(this), false),
                    n = r.nextNode() || n),
                n = this.getElementFromNode(n),
                i = this.getWindow().getComputedStyle(n).fontSize,
                i) ? Math.round(Number(i.replace("px", "")) / this._pxToPtRatio) : Number(i)
        };
        n._growFont = function () {
            var n, e, u, i;
            if (n = this._getFontSizeFromSelection(),
                n) {
                var r = n,
                    t = this._growShrinkFontSizeTable,
                    f = t.length;
                if (n < t[0])
                    r = n + 1;
                else if (n >= t[f - 1])
                    r = n + (10 - n % 10);
                else
                    for (i = 0; i < f - 1; i++)
                        if (e = t[i],
                            u = t[i + 1],
                            n >= e && n < u) {
                            r = u;
                            break
                        }
                this._setFontStyle("font-size", String(r) + "pt")
            }
        };
        n._growFontOnePoint = function () {
            var n, t;
            (n = this._getFontSizeFromSelection(),
                n) && (t = n + 1,
                this._setFontStyle("font-size", String(t) + "pt"))
        };
        n._growShrinkFontSizeTable = [8, 10, 11, 12, 13, 14, 18, 24, 36, 48, 72, 80];
        n._indent = function (n) {
            this._execute(n, "Indent");
            this._clearListStyleType()
        };
        n._insertHyperlink = function (n) {
            var s, h, c, l, a, f, v;
            var r = n.value.selectionRange,
                u = n.value.selectedNode,
                i = n.value.webAddress,
                e = n.value.textValue,
                o = n.value.editable;
            if (this.replaceSelection(r),
                i = i.replace(t.ModernCanvasBase.prototype._regexQuoted, "$1"),
                (!Jx.isNonEmptyString(e) || t.ModernCanvasBase.prototype._regexWhitespace.test(e)) && o && (e = i),
                i.length > 0 && !t.ModernCanvasBase.prototype._regexAbsoluteUrl.test(i) && (i = "http://" + i),
                Jx.isNonEmptyString(i))
                if (u)
                    u.setAttribute("href", i);
                else {
                    for (s = this.getElementFromNode(r.commonAncestorContainer),
                        h = s.querySelectorAll("a"),
                        c = h.length; c--;)
                        l = h[c],
                        this.intersectsNode(r, l) && (a = l,
                            a.removeNode(false));
                    if (o) {
                        f = this.getDocument().createElement("a");
                        f.setAttribute("href", i);
                        try {
                            r.surroundContents(f)
                        } catch (y) {
                            v = r.extractContents();
                            r.insertNode(f);
                            f.appendChild(v)
                        }
                        u = f
                    } else
                        this.getDocument().execCommand("CreateLink", false, i);
                    ModernCanvas.runWorkersSynchronously([new ModernCanvas.HrefHtmlWorker(s)])
                }
            else
                this._removeHyperlink(n),
                u = null;
            o || (r = this.trimRange(r));
            r.collapse(false);
            this.replaceSelection(r);
            n.value.originalTextValue !== e && o && u && (u.innerText = e)
        };
        n._hyperlinkControl = null;
        n._showHyperlinkControl = function () {
            this._hyperlinkControl || (this._hyperlinkControl = new t.HyperlinkControl,
                this.getParent().appendChild(this._hyperlinkControl));
            var n = this.getAnchorElement(this.getSelectionRange());
            this._hyperlinkControl.show(n)
        };
        n._italic = function (n) {
            var t = this.getSelectionRange(),
                r = {},
                i;
            t.collapsed && (r = this.getParent().getBasicSelectionStyles());
            this._execute(n, "Italic");
            t = this.getSelectionRange();
            t.collapsed && (i = this.getParent().getBasicSelectionStyles(),
                r.italic === i.italic && this.getParent().addSpringLoader("italic", !i.italic));
            this._removeIllegalPhrasingContent()
        };
        n._numbers = function (n) {
            var t = this._findParentLi();
            t || this._removeTrailingBr();
            this._execute(n, "InsertOrderedList");
            this._clearListStyleType();
            this._styleNewListElements(t)
        };
        n._openLink = function (n) {
            var t = Boolean(n.target) && this.isNodeName(n.target, "A") ? n.target : this.getParentElementForSelection("a");
            if (Boolean(t) && Jx.isNonEmptyString(t.getAttribute("href")))
                try {
                    Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(t.getAttribute("href"))).then()
                } catch (i) {}
        };
        n._outdent = function (n) {
            this._execute(n, "Outdent");
            this._clearListStyleType()
        };
        n._paste = function (n) {
            this._execute(n, "Paste")
        };
        n._pasteContentOnly = function (n) {
            this._execute(n, "ms-pasteContentOnly")
        };
        n._pasteTextOnly = function (n) {
            this._execute(n, "ms-pasteTextOnly")
        };
        n._quotedLink = function (n) {
            var f = this.getTextSearchInfo(true),
                i = false;
            if (f) {
                for (var r = f.preString.length, t = f.preString, u = 0; !i && Boolean(r--);)
                    u = t.charCodeAt(r),
                    i = u === 34 || u === 8220 || u === 8221;
                if (i && (f.preString = t.substr(0, r),
                        t = t.substr(r + 1, t.length - r),
                        i = ModernCanvas.ModernCanvasBase.prototype._regexAbsoluteUrl.test(t)),
                    !i) {
                    for (t = f.postString,
                        r = 0; r < t.length && !i; r++)
                        u = t.charCodeAt(r),
                        i = u === 34 || u === 8220 || u === 8221;
                    i && (f.postString = t.substr(r, t.length),
                        t = t.substr(0, r - 1),
                        i = ModernCanvas.ModernCanvasBase.prototype._regexAbsoluteUrl.test(t))
                }
                i && this._doQuotedLink(f, t)
            }
            i || (n.defaultPrevented = false)
        };
        n._doQuotedLink = function (n, t) {
            var i = this.getDocument(),
                r = i.createElement("a"),
                o = i.createElement("div"),
                u = this.getParent(),
                f, e;
            Jx.raiseEvent(u, "beforeundoablechange");
            n.searchRange.deleteContents();
            n.searchRange.insertNode(i.createTextNode(n.postString));
            f = i.createTextNode('"');
            n.searchRange.insertNode(f);
            n.searchRange.insertNode(i.createTextNode(t));
            n.searchRange.insertNode(i.createTextNode('"'));
            n.searchRange.insertNode(i.createTextNode(n.preString));
            Jx.raiseEvent(u, "undoablechange");
            Jx.raiseEvent(u, "beforeundoablechange");
            n.searchRange.deleteContents();
            n.searchRange.insertNode(i.createTextNode(n.postString));
            f = i.createTextNode("”");
            n.searchRange.insertNode(f);
            n.searchRange.insertNode(i.createTextNode(t));
            n.searchRange.insertNode(i.createTextNode("“"));
            n.searchRange.insertNode(i.createTextNode(n.preString));
            Jx.raiseEvent(u, "undoablechange");
            o.appendChild(r);
            r.href = t;
            r.innerText = t;
            ModernCanvas.runWorkersSynchronously([new ModernCanvas.HrefHtmlWorker(o)]);
            r.parentNode && (Jx.raiseEvent(u, "beforeundoablechange"),
                n.searchRange.deleteContents(),
                n.selection.insertNode(i.createTextNode(n.postString)),
                n.selection.insertNode(r),
                n.selection.insertNode(i.createTextNode(n.preString)),
                e = i.createRange(),
                e.selectNode(r),
                e.collapse(false),
                this.replaceSelection(e),
                Jx.raiseEvent(u, "undoablechange", {
                    backspaceUndoable: true
                }))
        };
        n._redo = function (n) {
            this._execute(n, "redo")
        };
        n._removeHyperlink = function (n) {
            this._execute(n, "Unlink")
        };
        n._removeIllegalPhrasingContent = function (n) {
            var i;
            if (n = n || this.getSelectionRange(),
                n)
                for (var r = n.commonAncestorContainer, f = r.ownerDocument, e = this, u = f.createNodeIterator(r, NodeFilter.SHOW_ELEMENT, function (n) {
                        return e.isNodeName(n, "strong", "em", "u", "font") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                    }, false), t = u.nextNode(); t;)
                    i = t.parentNode,
                    this.elementCanContainPhrasingContent(i) || this.visibleContent(t) || i.removeChild(t),
                    t = u.nextNode()
        };
        n._findParentLi = function () {
            var t = this.getSelectionRange(),
                n;
            if (!t)
                return null;
            for (n = t.startContainer,
                n.nodeType === Node.ELEMENT_NODE && t.startOffset < n.childNodes.length && (n = n.childNodes[t.startOffset]); n && !this.isNodeName(n, "LI");)
                n = n.parentNode;
            return n
        };
        n._styleNewListElements = function (n) {
            var i, t, r, u;
            (!n || Jx.isObject(n.parentNode)) && (i = this.getSelectionRange(),
                i) && (t = this.getParent().getSelectionStyles(),
                r = {},
                t.fontSize && (r["font-size"] = t.fontSize),
                t.fontColor && (r.color = t.fontColor),
                t.fontFamily && (r["font-family"] = t.fontFamily),
                Object.keys(r).length !== 0) && (i.collapsed && (u = this._findParentLi(),
                    u && (i = this.getDocument().createRange(),
                        i.selectNode(u))),
                this._styleListElements(r, i))
        };
        n._styleListElements = function (n, t) {
            var i, u, c, l;
            if (t = t || this.getSelectionRange(),
                t) {
                var s = this,
                    e = t.commonAncestorContainer,
                    h = e.ownerDocument,
                    o = h.createNodeIterator(e, NodeFilter.SHOW_ELEMENT, function (n) {
                        return e !== n && s.intersectsNode(t, n, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                    }, false),
                    r = o.nextNode(),
                    f = r,
                    a = function (n, t, i) {
                        for (var f = n.commonAncestorContainer, e = h.createNodeIterator(f, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (t) {
                                return f !== t && s.intersectsNode(n, t, true) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                            }, false), r = e.nextNode(), u; r;) {
                            if (s.isNodeName(r, "TD", "HR", "IMG", "INPUT", "SELECT", "EMBED", "OBJECT") || r.nodeType === Node.TEXT_NODE && (u = r.nodeValue,
                                    r === t && (u = i >= 0 ? u.substring(0, i) : u.substring(-i)),
                                    !ModernCanvas.ModernCanvasBase.prototype._regexWhitespace.test(u) && u.length > 0))
                                return true;
                            r = e.nextNode()
                        }
                        return false
                    };
                for (r || (r = f = e); r && !this.isNodeName(r, "LI", "UL", "OL");)
                    r = r.previousSibling ? r.previousSibling : r.parentNode;
                if (i = r,
                    this.isNodeName(i, "UL", "OL")) {
                    while (i && !this.isNodeName(i, "LI"))
                        i = o.nextNode();
                    i && (r = i)
                }
                if (u = h.createRange(),
                    !r || (u.setStartBefore(r),
                        u.setEnd(t.startContainer, t.startOffset),
                        !a(u, t.startContainer, t.startOffset))) {
                    for (c = false,
                        i = f; i;)
                        f = i,
                        c |= this.isNodeName(f, "LI"),
                        i = o.nextNode();
                    for (i = f; i && !this.isNodeName(i, "LI", "UL", "OL");)
                        i = i.nextSibling ? i.nextSibling : i.parentNode;
                    if ((i || (i = f),
                            !i || (u.setStart(t.endContainer, t.endOffset),
                                this.isDescendantOf(f, i) ? u.setEndAfter(i) : u.setEndBefore(i),
                                !a(u, t.endContainer, -t.endOffset))) && (l = function (t) {
                                Object.keys(n).forEach(function (i) {
                                    var r = n[i];
                                    r && (t.style[i] = r)
                                })
                            },
                            this.isNodeName(r, "LI") && l(r),
                            c))
                        for (o = h.createNodeIterator(e, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (n) {
                                return e !== n && s.intersectsNode(t, n, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                            }, false),
                            i = o.nextNode(); i;)
                            this.isNodeName(i, "LI") && l(i),
                            i = o.nextNode()
                }
            }
        };
        n._selectAll = function (n) {
            this._execute(n, "SelectAll")
        };
        n._setFontColor = function (n) {
            this._execute(n, "ForeColor", false, n.value);
            this._styleListElements({
                color: n.value
            });
            this._removeIllegalPhrasingContent()
        };
        n._setFontFamily = function (n) {
            this._setFontStyle("font-family", n.value);
            this._styleListElements({
                "font-family": n.value
            })
        };
        n._setFontHighlightColor = function (n) {
            this._setFontStyle("background-color", n.value);
            var t = this.getSelectionRange();
            t.collapse(false)
        };
        n._setFontSize = function (n) {
            var t = n.value;
            Number(t) >= 0 && (t += "pt");
            this._setFontStyle("font-size", t);
            this._styleListElements({
                "font-size": n.value
            })
        };
        n._shrinkFont = function () {
            var n, u, o, f, r;
            if (n = this._getFontSizeFromSelection(),
                n) {
                var t = n,
                    i = this._growShrinkFontSizeTable,
                    e = i.length;
                if (n <= i[0])
                    t = Math.ceil(n) - 1,
                    t = t > 0 ? t : 1;
                else if (n > i[e - 1])
                    u = n % 10,
                    t = u === 0 ? n - 10 : n - u;
                else
                    for (r = e - 1; r > 0; r--)
                        if (o = i[r],
                            f = i[r - 1],
                            n <= o && n > f) {
                            t = f;
                            break
                        }
                this._setFontStyle("font-size", String(t) + "pt")
            }
        };
        n._shrinkFontOnePoint = function () {
            var t, n;
            (t = this._getFontSizeFromSelection(),
                t) && (n = Math.ceil(t) - 1,
                n = n > 0 ? n : 1,
                this._setFontStyle("font-size", String(n) + "pt"))
        };
        n._underline = function (n) {
            var t = this.getSelectionRange(),
                r = {},
                i;
            t.collapsed && (r = this.getParent().getBasicSelectionStyles());
            this._execute(n, "Underline");
            t = this.getSelectionRange();
            t.collapsed && (i = this.getParent().getBasicSelectionStyles(),
                r.underline === i.underline && this.getParent().addSpringLoader("underline", !i.underline));
            this._removeIllegalPhrasingContent()
        };
        n._undo = function (n) {
            var t = n.keyDownEvent;
            t && t.altKey && t.keyCode === Jx.KeyCode.backspace || this._execute(n, "undo")
        };
        n.executingCommand = function () {
            return this._executingCommandEvent ? this._executingCommandEvent.command : null
        };
        n.fireAfterCommand = function () {
            this._isUndoable(this._executingCommandEvent) && Jx.raiseEvent(this.getParent(), "undoablechange");
            Jx.raiseEvent(this.getParent(), "aftercommand", this._executingCommandEvent);
            this._executingCommandEvent = null;
            this.getWindow().setImmediate(this._processQueue)
        };
        n.getCommand = function (n) {
            return this._ensureCommands(),
                this._commands[n] || null
        };
        n.removeCommand = function (n) {
            this._ensureCommands();
            n ? delete this._commands[n] : this._commands = {}
        };
        n.setCommand = function (n) {
            n.id && (this._commands[n.id] = n)
        };
        n.setModernCanvas = function (n) {
            this._modernCanvas = n
        };
        n.onCommand = function (n) {
            var t = this.getParent();
            n.target = n.target || t.getCanvasElement();
            this._ensureCommands();
            this._queue.push(n);
            this._processQueue()
        };
        n.updateEnabledStates = function (n, t) {
            var f, i, e = this.getSelectionRange(),
                o = Boolean(e),
                u = 0,
                s;
            for (o && (u |= r.hasSelection),
                o && !this.rangeContainsNonEditableContent(e) && (u |= r.hasEditableSelection),
                o && !e.collapsed && (u |= r.hasNonEmptySelection),
                u |= t && t.target && this.isNodeName(t.target, "A") || this.getParentElementForSelection("a") ? r.inLink : r.notInLink,
                s = n.length; s--;)
                i = n[s],
                f = i.isEnabled(u),
                i.enabled !== f && (i.enabled = f,
                    Jx.raiseEvent(i, "enabledchanged", f))
        }
    });
    Jx.delayDefine(ModernCanvas, ["ContextMenuItem", "ContextMenuManager"], function () {
        var t, n, i;
        ModernCanvas.ContextMenuItem = function (n, t, i) {
            this.displayName = n;
            this.commandId = t;
            Jx.isNumber(i) && (this.enabledOn = i)
        };
        ModernCanvas.ContextMenuItem.prototype = {
            commandId: "",
            displayName: "",
            enabledOn: ModernCanvas.Command.EnableStates.always,
            isEnabled: function (n) {
                return (this.enabledOn & n) === this.enabledOn
            }
        };
        ModernCanvas.ContextMenuManager = function (n) {
            ModernCanvas.Component.call(this);
            this._className = n || "default";
            this._menuItems = [];
            this.onContextMenu = this.onContextMenu.bind(this)
        };
        Jx.inherit(ModernCanvas.ContextMenuManager, ModernCanvas.Component);
        t = ModernCanvas.ContextMenuManager.Classes = {
            empty: []
        };
        t.basic = ["copy", "paste", "selectAll"];
        t.full = t.basic.concat(["editLink", "openLink", "addLink", "removeLink", "clearFormatting"]);
        t.default = t.full;
        t.calendar = t.full;
        t.chat = t.basic;
        t.mail = t.empty;
        t.people = t.basic;
        t.stm = t.basic.concat(["editLink", "addLink", "removeLink", "clearFormatting"]);
        ModernCanvas.ContextMenuManager.MenuItemOrder = ["copy", "paste", "addLink", "editLink", "openLink", "removeLink", "selectAll", "clearFormatting"];
        n = ModernCanvas.Command.EnableStates;
        ModernCanvas.ContextMenuManager.MenuItemDefinitions = {};
        Object.defineProperties(ModernCanvas.ContextMenuManager.MenuItemDefinitions, {
            addLink: {
                get: function () {
                    return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/hyperlinkControl_completionButton"), "showHyperlinkControl", n.notInLink | n.hasEditableSelection)
                }
            },
            clearFormatting: {
                get: function () {
                    return new ModernCanvas.ContextMenuItem(Jx.res.getString("composeAppBarClearFormattingButton"), "clearFormatting", n.hasNonEmptySelection | n.hasEditableSelection)
                }
            },
            copy: {
                get: function () {
                    return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_copy"), "copy", n.hasNonEmptySelection)
                }
            },
            editLink: {
                get: function () {
                    return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_editLink"), "showHyperlinkControl", n.inLink | n.hasEditableSelection)
                }
            },
            openLink: {
                get: function () {
                    return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_openLink"), "openLink", n.inLink)
                }
            },
            paste: {
                get: function () {
                    return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_paste"), "paste", n.hasEditableSelection)
                }
            },
            removeLink: {
                get: function () {
                    return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_removeLink"), "removeHyperlink", n.inLink | n.hasEditableSelection)
                }
            },
            selectAll: {
                get: function () {
                    return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_selectAll"), "selectAll", n.hasEditableSelection)
                }
            }
        });
        i = ModernCanvas.ContextMenuManager.prototype;
        i._ensureMenuItems = function () {
            var n, i;
            this._ensureMenuItems = function () {};
            var r = ModernCanvas.ContextMenuManager.MenuItemDefinitions,
                t = ModernCanvas.ContextMenuManager.MenuItemOrder,
                u = ModernCanvas.ContextMenuManager.Classes[this._className];
            for (n = 0; n < t.length; n++)
                u.indexOf(t[n]) !== -1 && (i = r[t[n]],
                    this._menuItems.push(i))
        };
        i._fireCommandEvent = function (n, t) {
            Jx.raiseEvent(this.getParent(), "command", {
                command: t,
                target: n
            })
        };
        i._getContextMenuHandler = function (n, t) {
            var i = this;
            return function () {
                var r = i._usageData[t] || 0;
                i._usageData[t] = r + 1;
                i._fireCommandEvent(n, t)
            }
        };
        i._MaxItems = 5;
        i._menuItems = [];
        i._Padding = 10;
        i.onContextMenu = function (t) {
            var f, e, i;
            t.preventDefault();
            this._ensureMenuItems();
            var s = this.getSelectionRange(),
                h = Boolean(s),
                r = 0;
            h && (r |= n.hasSelection);
            h && !this.rangeContainsNonEditableContent(s) && (r |= n.hasEditableSelection);
            h && !s.collapsed && (r |= n.hasNonEmptySelection);
            r |= this.getParentElementForSelection("a") ? n.inLink : n.notInLink;
            var y = new Windows.UI.Popups.PopupMenu,
                c = 0,
                p = this._menuItems,
                b = t.target;
            for (f = 0; f < p.length && c < this._MaxItems; f++)
                e = p[f],
                e.isEnabled(r) && (y.commands.append(new Windows.UI.Popups.UICommand(e.displayName, this._getContextMenuHandler(b, e.commandId))),
                    c++);
            if (c > 0) {
                var l, a, o, v, u = this._Padding,
                    k = this.getWindow().frameElement,
                    w = k.getBoundingClientRect();
                t.pointerType !== "" && t.screenX !== window.screenX && t.screenY !== window.screenY ? (l = t.screenX / window.devicePixelRatio - window.screenX,
                    a = t.screenY / window.devicePixelRatio - window.screenY,
                    o = u,
                    v = o) : (i = this.getSelectionRangeBoundingRect() || {
                        left: 0,
                        top: 0,
                        width: u,
                        height: u
                    },
                    l = i.left + w.left,
                    a = i.top + w.top,
                    o = i.width || u,
                    v = i.height || u,
                    Jx.dispose(i));
                try {
                    y.showForSelectionAsync({
                        x: l,
                        y: a,
                        width: o,
                        height: v
                    }).then()
                } catch (d) {}
            }
        }
    });
    Jx.delayDefine(ModernCanvas, ["HyperlinkManager", "HyperlinkTooltip"], function () {
        var t, n;
        ModernCanvas.HyperlinkManager = function (n) {
            ModernCanvas.Component.call(this);
            this._className = n || "default";
            this._openLinkOption = ModernCanvas.HyperlinkManager.Classes[this._className];
            this._hyperlinkTooltip = new ModernCanvas.HyperlinkTooltip(this._openLinkOption);
            this.appendChild(this._hyperlinkTooltip);
            this.onClick = this.onClick.bind(this)
        };
        Jx.inherit(ModernCanvas.HyperlinkManager, ModernCanvas.Component);
        ModernCanvas.HyperlinkManager.Classes = {
            calendar: ModernCanvas.OpenLinkOptions.click,
            "default": ModernCanvas.OpenLinkOptions.ctrlClick,
            mail: ModernCanvas.OpenLinkOptions.ctrlClick,
            people: ModernCanvas.OpenLinkOptions.dontOpen,
            stm: ModernCanvas.OpenLinkOptions.dontOpen
        };
        t = ModernCanvas.HyperlinkManager.prototype;
        t.activateUI = function () {
            this._hyperlinkTooltip.iframeElement = this.getParent().getIframeElement();
            this._hyperlinkTooltip.activateUI()
        };
        t.deactivateUI = function () {
            this._hyperlinkTooltip.deactivateUI()
        };
        t.onClick = function (n) {
            var i = this.getSelectionRange(),
                t;
            this._openLinkOption !== ModernCanvas.OpenLinkOptions.dontOpen && (n.ctrlKey && !n.shiftKey && !n.altKey || this._openLinkOption === ModernCanvas.OpenLinkOptions.click && (Jx.isNullOrUndefined(i) || i.collapsed)) && (t = this._hyperlinkTooltip.getHyperlinkForElement(n.target),
                t && Jx.raiseEvent(this.getParent(), "command", {
                    command: "openLink",
                    target: t
                }))
        };
        ModernCanvas.HyperlinkTooltip = function (n) {
            Jx.Component.call(this);
            this._active = false;
            this._eventsHooked = false;
            this._iframeElement = null;
            this._iframeDocument = null;
            this._openLinkOption = n;
            this._opened = false;
            this._tooltip = null;
            this._tooltipAnchorElement = null;
            this._tooltipContainerElement = null;
            this._onPointerOver = this._onPointerOver.bind(this);
            this._onBeforeOpen = this._onBeforeOpen.bind(this);
            this._onClosed = this._onClosed.bind(this);
            this._onPointerMove = this._onPointerMove.bind(this);
            this.close = this.close.bind(this)
        };
        Jx.inherit(ModernCanvas.HyperlinkTooltip, ModernCanvas.Component);
        n = ModernCanvas.HyperlinkTooltip.prototype;
        n.activateUI = function () {
            this.deactivateUI();
            this._createTooltip();
            this._iframeDocument.addEventListener("pointerover", this._onPointerOver);
            this._iframeDocument.addEventListener("MSPointerOver", this._onPointerOver);
            this._active = true
        };
        n._createTooltip = function () {
            var n, i, t, u, r;
            this._tooltip || (n = this._iframeElement,
                i = this._tooltipAnchorElement = n.ownerDocument.createElement("div"),
                i.classList.add("modernCanvas-hyperlinkTooltip-anchor"),
                n.parentNode.appendChild(i),
                t = this._tooltipContainerElement = n.ownerDocument.createElement("div"),
                t.classList.add("modernCanvas-hyperlinkTooltip-container"),
                n.parentNode.appendChild(t),
                u = this._openLinkOption !== ModernCanvas.OpenLinkOptions.dontOpen,
                r = "",
                u && (r = Jx.escapeHtml(Jx.res.getString(this._openLinkOption === ModernCanvas.OpenLinkOptions.click ? "/modernCanvas/canvasClickToOpen" : "/modernCanvas/canvasCtrlClickToOpen"))),
                t.innerHTML = "<div class='modernCanvas-hyperlinkTooltip-content'><div class='modernCanvas-hyperlinkTooltip-url'><\/div><div class='modernCanvas-hyperlinkTooltip-action'>" + r + "<\/div><\/div>",
                this._tooltip = new WinJS.UI.Tooltip(i, {
                    contentElement: t.querySelector(".modernCanvas-hyperlinkTooltip-content")
                }),
                this._tooltip.addEventListener("beforeopen", this._onBeforeOpen),
                this._tooltip.addEventListener("closed", this._onClosed))
        };
        n.deactivateUI = function () {
            this._active && (this.close(),
                this._iframeDocument.removeEventListener("pointerover", this._onPointerOver),
                this._iframeDocument.removeEventListener("MSPointerOver", this._onPointerOver),
                this._active = false)
        };
        n.dispose = function () {
            this._tooltipContainerElement && this._tooltipContainerElement.parentNode && this._tooltipContainerElement.parentNode.removeChild(this._tooltipContainerElement);
            this._tooltipAnchorElement && this._tooltipAnchorElement.parentNode && this._tooltipAnchorElement.parentNode.removeChild(this._tooltipAnchorElement);
            this._tooltip && (this.deactivateUI(),
                this._tooltip.removeEventListener("beforeopen", this._onBeforeOpen),
                this._tooltip.removeEventListener("closed", this._onClosed))
        };
        Object.defineProperty(n, "iframeElement", {
            enumerable: true,
            get: function () {
                return this._iframeElement
            },
            set: function (n) {
                this._iframeElement !== n && (this.deactivateUI(),
                    this._iframeElement = n,
                    this._iframeDocument = n.contentDocument,
                    this._tooltipAnchorElement && this._iframeElement.parentNode.appendChild(this._tooltipAnchorElement))
            }
        });
        n.getHyperlinkForElement = function (n) {
            return (n = this.getAncestor(n, function (n) {
                        return this.isNodeName(n, "A", "AREA", "BODY")
                    }
                    .bind(this)),
                this.isNodeName(n, "A", "AREA")) ? n : null
        };
        n._hookEvents = function () {
            this._eventsHooked || (document.addEventListener("scroll", this.close, true),
                document.addEventListener("visibilitychange", this.close),
                document.addEventListener("msvisibilitychange", this.close),
                document.addEventListener("focus", this.close, true),
                window.addEventListener("resize", this.close),
                this._iframeDocument.addEventListener("pontermove", this._onPointerMove),
                this._iframeDocument.addEventListener("MSPointerMove", this._onPointerMove),
                this._eventsHooked = true)
        };
        n._unhookEvents = function () {
            this._eventsHooked && (document.removeEventListener("scroll", this.close, true),
                document.removeEventListener("visibilitychange", this.close),
                document.removeEventListener("msvisibilitychange", this.close),
                document.removeEventListener("focus", this.close, true),
                window.removeEventListener("resize", this.close),
                this._iframeDocument.removeEventListener("pontermove", this._onPointerMove),
                this._iframeDocument.removeEventListener("MSPointerMove", this._onPointerMove),
                this._eventsHooked = false)
        };
        n._onPointerOver = function (n) {
            var t = this.getHyperlinkForElement(n.target);
            t && t.getAttribute("href") ? this.open(t, n.clientX, n.clientY) : this.close()
        };
        n._onPointerMove = function (n) {
            this._opened || this._positionAnchorElement(n.clientX, n.clientY)
        };
        n._onBeforeOpen = function () {
            this._tooltipAnchorElement.classList.remove("hidden");
            this._opened = true
        };
        n._onClosed = function () {
            this._opened = false;
            this._tooltipAnchorElement.classList.add("hidden");
            this._unhookEvents()
        };
        n.open = function (n, t, i) {
            var u = this._tooltip.contentElement,
                r = "";
            try {
                r = n.href
            } catch (f) {
                Jx.log.exception("Failed to retrieve href", f)
            }
            u.querySelector(".modernCanvas-hyperlinkTooltip-url").innerText = r;
            this._positionAnchorElement(t, i);
            this._tooltip.open("mouseover");
            this._hookEvents()
        };
        n.close = function () {
            this._unhookEvents();
            this._tooltip.close()
        };
        n._positionAnchorElement = function (n, t) {
            var i = this._tooltipAnchorElement;
            i.style.left = n.toString() + "px";
            i.style.top = t.toString() + "px"
        }
    });
    Jx.delayDefine(ModernCanvas, "HyperlinkControl", function () {
        function i(n) {
            return '<label id="' + n.idWebAddressDescription + '" aria-hidden="true">' + n.webAddressDescription + '<\/label><label id="' + n.idWebAddressLabel + '">' + n.labelWebAddress + '<\/label><input id="' + n.idWebAddress + '" type="url" aria-describedby="' + n.idWebAddressDescription + '" aria-labelledby="' + n.idWebAddressLabel + '"/><label id="' + n.idTextDescription + '" aria-hidden="true">' + n.textDescription + '<\/label><label id="' + n.idTextLabel + '">' + n.labelTextToBeDisplayed + '<\/label><input id="' + n.idText + '" type="text" aria-describedby="' + n.idTextDescription + '" aria-labelledby="' + n.idTextLabel + '"/><label id="' + n.idCompletionButtonDescription + '" aria-hidden="true">' + n.completionButtonDescription + '<\/label><button id="' + n.idCompletionButton + '" type="button" aria-describedby="' + n.idCompletionButtonDescription + '">' + n.labelCompletionButton + "<\/button>"
        }
        var t = window.ModernCanvas,
            n;
        t.HyperlinkControl = function () {
            var t, n;
            ModernCanvas.Component.call(this);
            t = document.createElement("div");
            t.className = "modernCanvas-flyout hyperlinkControl";
            n = "hyperlinkControl" + this._id;
            t.id = n;
            t.innerHTML = i({
                completionButtonDescription: Jx.res.getString("/modernCanvas/hyperlinkControl_completionButton"),
                idCompletionButton: n + "CompletionButton",
                idCompletionButtonDescription: n + "CompletionButtonDescription",
                idText: n + "Text",
                idTextDescription: n + "TextDescription",
                idTextLabel: n + "TextLabel",
                idWebAddress: n + "WebAddress",
                idWebAddressDescription: n + "WebAddressDescription",
                idWebAddressLabel: n + "WebAddressLabel",
                labelCompletionButton: Jx.res.getString("/modernCanvas/hyperlinkControl_completionButton"),
                labelTextToBeDisplayed: Jx.res.getString("/modernCanvas/hyperlinkControl_textToBeDisplayed"),
                labelWebAddress: Jx.res.getString("/modernCanvas/hyperlinkControl_webAddress"),
                textDescription: Jx.res.getString("/modernCanvas/hyperlinkControl_textToBeDisplayed"),
                webAddressDescription: Jx.res.getString("/modernCanvas/hyperlinkControl_webAddressDescription")
            });
            document.body.appendChild(t);
            this._element = t;
            this._listeners = {};
            this._completionButton = t.querySelector("#" + n + "CompletionButton");
            this._webAddressElement = t.querySelector("#" + n + "WebAddress");
            this._textElement = t.querySelector("#" + n + "Text");
            this._onKeyDown = this._onKeyDown.bind(this);
            this._onDismiss = this._onDismiss.bind(this);
            this._setFocus = this._setFocus.bind(this);
            this._fireCommand = this._fireCommand.bind(this);
            t.addEventListener("keydown", this._onKeyDown, false);
            this._completionButton.addEventListener("click", this._fireCommand, false);
            this._flyout = new WinJS.UI.Flyout(t);
            this._flyout.addEventListener("afterhide", this._onDismiss, false);
            this._flyout.addEventListener("aftershow", this._setFocus, false);
            this._flyout.addEventListener("focus", this._setFocus, false)
        };
        Jx.inherit(t.HyperlinkControl, t.Component);
        n = t.HyperlinkControl.prototype;
        n.dispose = function () {
            document.body.removeChild(this._element);
            this._completionButton.removeEventListener("click", this._fireCommand, false);
            this._completionButton = null;
            this._element.removeEventListener("keydown", this._onKeyDown, false);
            this._flyout.removeEventListener("afterhide", this._onDismiss, false);
            this._flyout.removeEventListener("aftershow", this._setFocus, false);
            this._flyout.removeEventListener("focus", this._setFocus, false);
            this._flyout = null;
            this._textElement = null;
            this._webAddressElement = null
        };
        n.hide = function () {
            this._flyout.hide()
        };
        n.show = function (n) {
            var u, i, f, r;
            this._webAddressElement.value = "";
            u = WinJS.Promise.wrap(null);
            i = this;
            try {
                f = Windows.ApplicationModel.DataTransfer.Clipboard;
                r = f.getContent();
                r.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri) ? u = r.getUriAsync().then(function (n) {
                    i._webAddressElement.value = n.absoluteUri
                }) : r.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text) && (u = r.getTextAsync().then(function (n) {
                    t.ModernCanvasBase.prototype._regexAbsoluteUrl.test(n) && (i._webAddressElement.value = n)
                }))
            } catch (e) {}
            u.done(function () {
                i._selectedNode = i._expandSelection();
                i._setSelectionText();
                i._originalTextValue = i._textElement.value;
                i._flyout.show(n)
            })
        };
        n._setSelectionText = function () {
            var t, i, n, r, u;
            if (!this._selectionRange) {
                this._textElement.value = "";
                this._textElement.disabled = false;
                return
            }
            t = this.getElementFromNode(this._selectionRange.commonAncestorContainer);
            i = new ModernCanvas.RangeBookmark(this._selectionRange, t);
            t = t.cloneNode(true);
            n = i.getBookmarkedRange(t);
            n ? (r = new ModernCanvas.DurableRange(n),
                u = this.getParent(),
                u.components.autoReplaceManager.bulkElementConversion(t, ["outbound"]),
                n = r.range) : n = this._selectionRange;
            this._isSelectionEditable(n) ? (this._textElement.value = n.toString(),
                this._textElement.disabled = false) : (this._textElement.value = Jx.res.getString("/modernCanvas/hyperlinkControl_textElementDisabled"),
                this._textElement.disabled = true)
        };
        n._isSelectionEditable = function (n) {
            var i = n.commonAncestorContainer,
                u = this,
                r, t;
            if (n.collapsed || i.nodeType === Node.TEXT_NODE)
                return true;
            for (r = document.createNodeIterator(i, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (t) {
                    return i === t ? NodeFilter.FILTER_SKIP : u.intersectsNode(n, t) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                }, false),
                t = r.nextNode(); t;) {
                if (this.isBlockElement(t))
                    return false;
                t = r.nextNode()
            }
            return true
        };
        n._expandSelection = function () {
            var n = this.getSelectionRange(),
                i, f, r;
            if (!n)
                return null;
            if (n = n.cloneRange(),
                i = this.getParentElementForSelection("a"),
                i)
                return n.selectNodeContents(i),
                    this._webAddressElement.value = i.getAttribute("href"),
                    this._selectionRange = n,
                    i;
            n.collapsed;
            var e = this.getElementFromNode(n.commonAncestorContainer).querySelectorAll("a"),
                t = this.getDocument().createRange(),
                u = false;
            for (f = e.length; f--;)
                r = e[f],
                t.selectNodeContents(r),
                t.compareBoundaryPoints(Range.START_TO_START, n) < 0 && t.compareBoundaryPoints(Range.START_TO_END, n) > 0 ? (n.setStartBefore(r),
                    u = true) : t.compareBoundaryPoints(Range.END_TO_END, n) > 0 && t.compareBoundaryPoints(Range.END_TO_START, n) < 0 && (n.setEndAfter(r),
                    u = true),
                (u || t.compareBoundaryPoints(Range.START_TO_START, n) >= 0 && t.compareBoundaryPoints(Range.END_TO_END, n) <= 0) && (this._webAddressElement.value = r.getAttribute("href"));
            return this._selectionRange = n,
                null
        };
        n._inWord = function (n) {
            var i, r, u, f;
            if (i = n.startContainer,
                i.nodeType !== Node.TEXT_NODE)
                return false;
            if (r = i.nodeValue,
                u = n.startOffset,
                u === 0)
                while (u === 0 && Boolean(i.previousSibling) && i.previousSibling.nodeType === Node.TEXT_NODE)
                    i = i.previousSibling,
                    r = i.nodeValue + r,
                    u += i.nodeValue.length;
            else if (u === r.length)
                while (u === r.length && Boolean(i.nextSibling) && i.nextSibling.nodeType === Node.TEXT_NODE)
                    i = i.nextSibling,
                    r = r + i.nodeValue;
            return u === 0 || u === r.length ? false : (f = t.ModernCanvasBase.prototype._regexWhitespace,
                !f.test(r.charAt(u)) && !f.test(r.charAt(u - 1)))
        };
        n._onDismiss = function () {
            if (!this._firedCommand) {
                var n = this.getParent();
                n.focus()
            }
            this._selectedNode = null;
            this._selectionRange = null;
            this._firedCommand = false
        };
        n._onKeyDown = function (n) {
            n.keyCode !== 229 && n.key === "Enter" && (n.preventDefault(),
                this._fireCommand())
        };
        n._setFocus = function () {
            this._webAddressElement.value !== "" && this._textElement.value === "" ? this._textElement.focus() : this._webAddressElement.focus()
        };
        n._fireCommand = function () {
            var n = {
                command: "insertHyperlink",
                value: {
                    webAddress: this._webAddressElement.value.trim(),
                    textValue: this._textElement.value,
                    selectionRange: this._selectionRange,
                    selectedNode: this._selectedNode,
                    originalTextValue: this._originalTextValue,
                    editable: !this._textElement.disabled
                }
            };
            Jx.raiseEvent(this.getParent(), "command", n);
            this._firedCommand = true;
            this.hide()
        };
        n._firedCommand = false;
        n._originalTextValue = null;
        n._selectedNode = null;
        n._selectionRange = null;
        n._textElement = null;
        n._webAddressElement = null;
        n._completionButton = null;
        n._element = null;
        n._flyout = null
    });
    Jx.delayDefine(ModernCanvas, "ShortcutManager", function () {
        var n, t;
        ModernCanvas.ShortcutManager = function (n) {
            ModernCanvas.Component.call(this);
            this._className = n || "default";
            this._shortcuts = {};
            this.onKeyDown = this.onKeyDown.bind(this)
        };
        Jx.inherit(ModernCanvas.ShortcutManager, ModernCanvas.Component);
        n = ModernCanvas.ShortcutManager.Classes = {
            empty: []
        };
        n.basic = ["accentAcute", "accentCedilla", "accentCircumflex", "accentDiaeresis", "accentGrave", "accentLigature", "accentRing", "accentSlash", "accentTilde", "bold", "copy", "cut", "italic", "paste", "quotedLink", "redo", "selectAll", "underline", "undo"];
        n["default"] = n.basic.concat(["alignCenter", "alignLeft", "alignRight", "bullets", "clearFormatting", "growFont", "growFontOnePoint", "indent", "numbers", "#conditional:list#outdent", "#conditional:emptyList#outdent", "outdent", "showHyperlinkControl", "shrinkFont", "shrinkFontOnePoint"]);
        n.calendar = n["default"];
        n.chat = n.basic;
        n.mail = n["default"].concat(["font"]);
        n.people = n.basic;
        n.stm = n["default"];
        ModernCanvas.ShortcutManager.ShortcutStrings = {
            accentAcute: "ctrl+'",
            accentCedilla: "ctrl+,",
            accentCircumflex: "ctrl+shift+6",
            accentDiaeresis: "ctrl+shift+semicolon",
            accentGrave: "ctrl+`",
            accentLigature: "ctrl+shift+7",
            accentRing: "ctrl+shift+2",
            accentSlash: "ctrl+forwardslash",
            accentTilde: "ctrl+shift+`",
            alignCenter: "ctrl+e",
            alignLeft: "ctrl+l",
            alignRight: "ctrl+r",
            bold: "ctrl+b",
            bullets: "ctrl+shift+l",
            clearFormatting: "ctrl+space",
            copy: "ctrl+c",
            cut: "ctrl+x",
            "#conditional:list#outdent": "backspace",
            font: "ctrl+shift+f",
            growFont: "ctrl+shift+period",
            growFontOnePoint: "ctrl+]",
            indent: "ctrl+m",
            "#conditional:list,selection#indent": "tab",
            showHyperlinkControl: "ctrl+k",
            italic: "ctrl+i",
            numbers: "ctrl+shift+e",
            outdent: "ctrl+shift+m",
            "#conditional:list,selection#outdent": "shift+tab",
            paste: "ctrl+v;shift+insert",
            quotedLink: "shift+';'",
            redo: "ctrl+y;f4",
            selectAll: "ctrl+a",
            "#conditional:emptyList#outdent": "enter",
            shrinkFont: "ctrl+shift+,",
            shrinkFontOnePoint: "ctrl+[",
            underline: "ctrl+u",
            undo: "ctrl+z;alt+backspace"
        };
        t = ModernCanvas.ShortcutManager.prototype;
        t._conditionalFunctions = {
            list: function (n) {
                var i = this.getSelectionRange(),
                    t, r;
                if (i) {
                    if (i.startOffset !== 0 || i.endOffset !== 0 || i.startContainer !== i.endContainer)
                        return false;
                    for (t = i.startContainer,
                        r = this.isEmpty(t); !this.isNodeName(t, "LI", "BLOCKQUOTE");)
                        if (t.parentNode.childNodes[0] === t)
                            t = t.parentNode;
                        else
                            return false;
                    return !n || r
                }
                return false
            },
            emptyList: function () {
                return t._conditionalFunctions.list.call(this, true)
            },
            selection: function () {
                var n = this.getSelectionRange();
                return Boolean(n) && !n.collapsed
            }
        };
        t._ensureShortcuts = function () {
            var u, n, i, r, t;
            for (this._ensureShortcuts = function () {},
                u = ModernCanvas.ShortcutManager.ShortcutStrings,
                n = ModernCanvas.ShortcutManager.Classes[this._className],
                t = n.length; t--;)
                for (i = u[n[t]].split(";"),
                    r = i.length; r--;)
                    this.setShortcut(i[r], n[t])
        };
        t._shortcuts = {};
        t._splitKeys = function (n) {
            var f, t, r, i, e, o, u;
            for (f = n.toLowerCase().split("+"),
                t = 0,
                e = f.length; e--;)
                i = f[e],
                i === "alt" ? t |= 1 : i === "ctrl" ? t |= 2 : i === "shift" ? t |= 4 : r = i;
            return o = Jx.KeyCode[r],
                o && (r = "#|" + o),
                u = {},
                u.primary = r || "",
                u.modifier = t,
                u
        };
        t.getShortcut = function (n) {
            this._ensureShortcuts();
            var t = this._splitKeys(n);
            return this._shortcuts[t.primary] ? this._shortcuts[t.primary][t.modifier] || null : null
        };
        t.onKeyDown = function (n) {
            var u, i, t, f, r;
            return (ModernCanvas.mark("ShortcutManager.onKeyDown", ModernCanvas.LogEvent.start),
                this._ensureShortcuts(),
                u = this._getPossibleCommands(n),
                i = false,
                !u) ? (ModernCanvas.mark("ShortcutManager.onKeyDown", ModernCanvas.LogEvent.stop),
                true) : (t = this._findCommand(u),
                !t) ? (ModernCanvas.mark("ShortcutManager.onKeyDown", ModernCanvas.LogEvent.stop),
                true) : (t.substr(0, 13) === "#nonblocking#" ? t = t.substr(13) : i = true,
                f = this._usageData[t] || 0,
                this._usageData[t] = f + 1,
                r = {
                    command: t,
                    target: n.target,
                    keyDownEvent: n
                },
                Jx.raiseEvent(this.getParent(), "command", r),
                r.hasOwnProperty("defaultPrevented") && (i = r.defaultPrevented),
                i && n.preventDefault(),
                ModernCanvas.mark("ShortcutManager.onKeyDown", ModernCanvas.LogEvent.stop),
                !i)
        };
        t._getPossibleCommands = function (n) {
            var i = this._shortcuts["#|" + String(n.keyCode)] || this._shortcuts[n.key],
                t, e, r, u, f;
            if (!i)
                return null;
            for (t = 0,
                n.altKey && (t |= 1),
                n.ctrlKey && (t |= 2),
                n.shiftKey && (t |= 4),
                e = t.toString(),
                r = Object.keys(i),
                u = r.length; u--;)
                if (f = r[u],
                    f === e)
                    return i[f];
            return null
        };
        t._findCommand = function (n) {
            for (var t, r, u, f, i = n.length; i--;)
                if (t = n[i],
                    t.substr(0, 13) === "#conditional:") {
                    for (t = t.substr(13),
                        r = t.indexOf("#"),
                        u = t.substr(0, r).split(","),
                        f = u.length; f--;)
                        if (this._conditionalFunctions[u[f]].call(this))
                            return t.substr(r + 1)
                } else
                    return t;
            return null
        };
        t.removeShortcut = function (n) {
            if (this._ensureShortcuts(),
                n) {
                var t = this._splitKeys(n),
                    i = this._shortcuts[t.primary];
                i && i[t.modifier] && delete this._shortcuts[t.primary][t.modifier]
            } else
                this._shortcuts = {}
        };
        t.setShortcut = function (n, t) {
            var i, r;
            i = this._splitKeys(n);
            this._shortcuts[i.primary] || (this._shortcuts[i.primary] = {});
            r = this._shortcuts[i.primary][i.modifier];
            r || (r = []);
            this._shortcuts[i.primary][i.modifier] = r.concat([t])
        }
    });
    ModernCanvas.WindowsLive = {};
    ModernCanvas.AutoReplaceManager.prototype.getElementHTML = function (n, t) {
        this._ensureElementDefinitions();
        var i = this._autoReplaceTables.getElements()[n];
        return i || (i = t === "inbound" ? "&#x" + n + ";" : "<span data-externalstyle=\"false\" style=\"font-family:'Segoe UI Emoji','Segoe UI Symbol','Apple Color Emoji';\">&#x" + n + ";<\/span>"),
            i
    };
    ModernCanvas.WindowsLive.ModernCanvas = function (n, t) {
        ModernCanvas.mark("WindowsLiveModernCanvas.ctor", ModernCanvas.LogEvent.start);
        t = t || {};
        t.className = t.className ? t.className.toLowerCase() : "default";
        var r = ModernCanvas.WindowsLive,
            i = n.contentDocument;
        i.addEventListener("keydown", ModernCanvas.WindowsLive.onKeyDown, false);
        i.addEventListener("keyup", ModernCanvas.WindowsLive.onKeyUp, false);
        i.addEventListener("contextmenu", ModernCanvas.WindowsLive.onContextMenu, false);
        t.autoReplaceManager || (t.className === "mail" || t.className === "stm" ? t.autoReplaceManager = new ModernCanvas.AutoReplaceManager("mail") : t.className === "people" && (t.autoReplaceManager = new ModernCanvas.AutoReplaceManager("basic")));
        ModernCanvas.ModernCanvasBase.apply(this, arguments);
        ModernCanvas.mark("WindowsLiveModernCanvas.ctor", ModernCanvas.LogEvent.stop)
    };
    Jx.inherit(ModernCanvas.WindowsLive.ModernCanvas, ModernCanvas.ModernCanvasBase);
    ModernCanvas.WindowsLive.ModernCanvas.prototype.dispose = function () {
        this._iframeDocument.removeEventListener("keydown", ModernCanvas.WindowsLive.onKeyDown, false);
        this._iframeDocument.removeEventListener("keyup", ModernCanvas.WindowsLive.onKeyUp, false);
        this._iframeDocument.removeEventListener("contextmenu", ModernCanvas.WindowsLive.onContextMenu, false);
        ModernCanvas.ModernCanvasBase.prototype.dispose.apply(this, arguments)
    };
    ModernCanvas.WindowsLive.onContextMenu = function () {
        ModernCanvas.log("ContextMenu")
    };
    ModernCanvas.WindowsLive.onKeyDown = function (n) {
        var t = Jx.KeyCode,
            i = n.keyCode;
        i === t.backspace || i === t["delete"] ? ModernCanvas.log("DeleteKey", ModernCanvas.LogEvent.start) : i === t.numlock ? ModernCanvas.log("NumLockKey", ModernCanvas.LogEvent.start) : ModernCanvas.log("KeyPress", ModernCanvas.LogEvent.start)
    };
    ModernCanvas.WindowsLive.onKeyUp = function (n) {
        var t = Jx.KeyCode,
            i = n.keyCode;
        i === t.backspace || i === t["delete"] ? ModernCanvas.log("DeleteKey", ModernCanvas.LogEvent.stop) : i === t.numlock ? ModernCanvas.log("NumLockKey", ModernCanvas.LogEvent.stop) : ModernCanvas.log("KeyPress", ModernCanvas.LogEvent.stop)
    };
    ModernCanvas.ModernCanvas = ModernCanvas.WindowsLive.ModernCanvas;
    ModernCanvas.log = function (n, t) {
        ModernCanvas.mark("WindowsLiveModernCanvas." + n, t)
    };
    ("Mail" in window || "Share" in window && "MailData" in window.Share) && function () {
        ModernCanvas.Mail = {};
        ModernCanvas.Mail.createAttachmentAsync = function (n, t, i, r, u) {
            var f = null,
                e = null;
            return Windows.Storage.ApplicationData.current.temporaryFolder.createFileAsync(u, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (n) {
                return e = n.path,
                    u = n.name,
                    n.openAsync(Windows.Storage.FileAccessMode.readWrite)
            }).then(function (n) {
                return f = n,
                    f.seek(0),
                    Windows.Storage.Streams.RandomAccessStream.copyAsync(i, f)
            }).then(function () {
                return f.flushAsync()
            }).then(function () {
                var s = f.size,
                    i, o;
                return Jx.dispose(f),
                    i = n.createAttachment(),
                    i.uiType = t,
                    i.contentType = r,
                    i.composeStatus = Microsoft.WindowsLive.Platform.AttachmentComposeStatus.done,
                    o = new Date,
                    i.contentId = u + "@" + o.getTime().toString(16) + Jx.uid().toString(16),
                    i.fileName = u,
                    i.createBodyFromFile(e, s),
                    n.commit(),
                    i
            })
        };
        ModernCanvas.Mail.convertDocumentToDocumentFragment = function (n, t) {
            var i, u, f, e, o, r, s;
            for (ModernCanvas.mark("MailModernCanvas.convertDocumentToDocumentFragment", ModernCanvas.LogEvent.start),
                i = n.createRange(),
                u = n.body,
                i.selectNodeContents(u),
                t && (f = n.createElement("div"),
                    t.forEach(function (n) {
                        f.setAttribute(n, u.getAttribute(n))
                    }),
                    i.surroundContents(f)),
                e = i.extractContents(),
                o = n.querySelectorAll("style"),
                r = 0,
                s = o.length; r < s; r++)
                e.appendChild(o[r]);
            return ModernCanvas.mark("MailModernCanvas.convertDocumentToDocumentFragment", ModernCanvas.LogEvent.stop),
                e
        };
        ModernCanvas.Mail._getCidUrl = function (n) {
            return "cid:" + n.contentId.trim().replace(/(^<)|(>$)/g, "")
        };
        ModernCanvas.Mail.ModernCanvas = function (n, t) {
            var r, e, u, f, i;
            ModernCanvas.mark("MailModernCanvas.ctor", ModernCanvas.LogEvent.start);
            this._attachmentsBeingAdded = 0;
            this._pastedFiles = [];
            this._mailMessage = t.mailMessage || null;
            this._mailAccount = t.mailAccount || null;
            this._signatureLocation = null;
            this._urlToCidUrl = {};
            this._fontStyle = "";
            this._onPaste = this._onPaste.bind(this);
            this._onPasteImage = this._onPasteImage.bind(this);
            this.setMailAccount = this.setMailAccount.bind(this);
            this.setMailMessage = this.setMailMessage.bind(this);
            ModernCanvas.WindowsLive.ModernCanvas.apply(this, arguments);
            r = document.createElement("div");
            r.classList.add("modernCanvas-mask");
            r.style.display = "none";
            this._maskElement = r;
            n.parentNode.appendChild(r);
            this._onMailItemDragStart = this._onMailItemDragStart.bind(this);
            this._onMailItemDragEnd = this._onMailItemDragEnd.bind(this);
            document.addEventListener("mailitemdragstart", this._onMailItemDragStart, false);
            document.addEventListener("mailitemdragend", this._onMailItemDragEnd, false);
            e = Jx.isRtl();
            e ? (u = "left",
                f = "right") : (u = "right",
                f = "left");
            i = document.createElement("style");
            i.setAttribute("data-externalstyle", "true");
            i.classList.add("modernCanvas-contentStyle");
            i.classList.add("modernCanvas-defaultStyle");
            i.innerHTML = "\np.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {\nmargin-top:0in;\nmargin-" + u + ":0in;\nmargin-bottom:0in;\nmargin-" + f + ":.5in;\nmargin-bottom:.0001pt;\n}\np.MsoNormal, li.MsoNormal, div.MsoNormal {\nmargin:0in;\nmargin-bottom:.0001pt;\n}\np.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst, \np.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle, \np.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {\nmargin-top:0in;\nmargin-" + u + ":0in;\nmargin-bottom:0in;\nmargin-" + f + ":.5in;\nmargin-bottom:.0001pt;\nline-height:115%;\n}\n";
            this._iframeDocument.querySelector("head").appendChild(i);
            window.Mail && !window.Share && Mail.Globals.appSettings.addListener(Mail.AppSettings.Events.fontSettingChanged, this._setFontStyle, this);
            ModernCanvas.mark("MailModernCanvas.ctor", ModernCanvas.LogEvent.stop)
        };
        Jx.inherit(ModernCanvas.Mail.ModernCanvas, ModernCanvas.WindowsLive.ModernCanvas);
        var n = ModernCanvas.Mail.ModernCanvas.prototype;
        n.dispose = function () {
            document.removeEventListener("mailitemdragstart", this._onMailItemDragStart, false);
            document.removeEventListener("mailitemdragend", this._onMailItemDragEnd, false);
            window.Mail && !window.Share && Mail.Globals.appSettings.removeListener(Mail.AppSettings.Events.fontSettingChanged, this._setFontStyle, this);
            ModernCanvas.WindowsLive.ModernCanvas.prototype.dispose.apply(this)
        };
        n._onMailItemDragStart = function () {
            this._maskElement.style.height = this._iframeElement.offsetHeight + "px";
            this._maskElement.style.width = this._iframeElement.offsetWidth + "px";
            this._maskElement.style.display = ""
        };
        n._onMailItemDragEnd = function () {
            this._maskElement.style.display = "none"
        };
        n._createEmptyLine = function () {
            var n = this.getDocument().createElement("div");
            return n.classList.add("defaultFont"),
                n.setAttribute("style", this._fontStyle),
                n.innerHTML = "<br>",
                n
        };
        n._getSignatureHtml = function () {
            var n, t;
            return ModernCanvas.mark("MailModernCanvas.getSignatureHtml", ModernCanvas.LogEvent.start),
                n = "<br>",
                this._mailAccount && (t = this._mailAccount.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.mail),
                    t.signatureType === Microsoft.WindowsLive.Platform.SignatureType.enabled && (n = t.signatureText || "",
                        n && (this._bufferArea.innerText = n,
                            n = this._bufferArea.innerHTML,
                            n = '<div class="defaultFont" style="' + this._fontStyle + '"><br><\/div><div class="defaultFont" style="' + this._fontStyle + '">' + n + '<\/div><div class="defaultFont" style="' + this._fontStyle + '"><br><\/div>'))),
                ModernCanvas.mark("MailModernCanvas.getSignatureHtml", ModernCanvas.LogEvent.stop),
                n
        };
        n._localizeHTML = function (n) {
            ModernCanvas.mark("MailModernCanvas.localizeHTML", ModernCanvas.LogEvent.start);
            ModernCanvas.ModernCanvasBase.prototype._localizeHTML.call(this, n);
            for (var i = n.querySelectorAll("[data-signatureblock]"), t = 1, r = i.length; t < r; t++)
                i[t].removeAttribute("data-signatureblock");
            ModernCanvas.mark("MailModernCanvas.localizeHTML", ModernCanvas.LogEvent.stop)
        };
        n._commandToInstrumentationPoint = {
            bold: 1,
            italic: 2,
            underline: 3,
            setFontFamily: 4,
            setFontSize: 4,
            setFontColor: 5,
            setFontHighlightColor: 6,
            alignLeft: 7,
            alignCenter: 7,
            alignRight: 7,
            bullets: 9,
            numbers: 10,
            showHyperlinkControl: 11,
            redo: 12,
            undo: 13,
            clearFormatting: 14,
            copy: 15,
            paste: 16,
            pasteContentOnly: 16,
            pasteFull: 16,
            pasteTextOnly: 16,
            pasteTextOrSingleImage: 16
        };
        n._onAfterCommand = function (n) {
            var t, i;
            t = this._commandToInstrumentationPoint[n.command];
            t && (i = n.keyDownEvent ? Mail.Instrumentation.UIEntryPoint.keyboardShortcut : Mail.Instrumentation.UIEntryPoint.appBar,
                Mail.Instrumentation.instrumentFormattingCommand(t, i))
        };
        n._onPaste = function (n) {
            for (var u = n.clipboardData.files, i = 0, f = u.length; i < f; i++) {
                var t = u[i],
                    e = t.slice(),
                    r = URL.createObjectURL(t, {
                        oneTimeOnly: false
                    });
                this._objectUrls.push(r);
                this._pastedFiles.push(t);
                this._pastedFiles.push(e);
                n.msConvertURL(t, "specified", r);
                this._onPasteImage(t, r, e.msDetachStream())
            }
        };
        n._onPasteImage = function (n, t, i) {
            var r = this,
                u = arguments;
            this._attachmentsBeingAdded++;
            this._srcToStreamTable[t] = i;
            this._convertToEncodedStreamAsync(n, t, i).then(function (n) {
                return r._createEmbeddedAttachmentAsync(n.stream, n.contentType)
            }).then(function (n) {
                r._urlToCidUrl[t] = "cid:" + n.contentId;
                ModernCanvas.ModernCanvasBase.prototype._onPasteImage.apply(r, u);
                r._attachmentsBeingAdded--;
                r._fireContentReadyIfReady()
            }).done(null, function (n) {
                r._attachmentsBeingAdded--;
                r._fireContentReadyIfReady();
                r._logFunction("Error while creating image attachment: " + n)
            })
        };
        n._convertToEncodedStreamAsync = function (n, t, i) {
            return n.type === "image/gif" || n.type === "image/jpeg" || n.type === "image/pjpeg" || n.type === "image/png" || n.type === "image/x-png" ? WinJS.Promise.as({
                contentType: n.type,
                stream: i
            }) : this._convertToPngStreamAsync(n, t, i)
        };
        n._convertToPngStreamAsync = function (n, t, i) {
            if (n.type === "image/bmp" || n.type === "image/tiff") {
                var f = new Windows.Storage.Streams.InMemoryRandomAccessStream,
                    r, u;
                return Windows.Graphics.Imaging.BitmapDecoder.createAsync(i).then(function (n) {
                    return r = n,
                        Windows.Graphics.Imaging.BitmapEncoder.createAsync(Windows.Graphics.Imaging.BitmapEncoder.pngEncoderId, f)
                }).then(function (n) {
                    return u = n,
                        r.getPixelDataAsync()
                }).then(function (n) {
                    return u.setPixelData(r.bitmapPixelFormat, r.bitmapAlphaMode, r.pixelWidth, r.pixelHeight, r.dpiX, r.dpiY, n.detachPixelData()),
                        u.flushAsync()
                }).then(function () {
                    return {
                        contentType: "image/png",
                        stream: f
                    }
                })
            }
            return this._waitForImageLoadAsync(t).then(function (n) {
                var t = document.createElement("canvas"),
                    r = t.width = n.offsetWidth,
                    u = t.height = n.offsetHeight,
                    f = t.getContext("2d"),
                    i;
                return f.drawImage(n, 0, 0, r, u),
                    i = t.msToBlob(), {
                        contentType: "image/png",
                        stream: i.msDetachStream()
                    }
            })
        };
        n._waitForImageLoadAsync = function (n) {
            var t = this.getDocument();
            return new WinJS.Promise(function (i, r) {
                var e = "img[src='" + n + "']",
                    u = t.querySelector(e),
                    f = function (n) {
                        u.removeEventListener("load", f, false);
                        u.removeEventListener("error", f, false);
                        n.type === "error" ? r(new Error("Image load failed")) : i(u)
                    },
                    o = function () {
                        u.complete ? i(u) : (u.addEventListener("load", f, false),
                            u.addEventListener("error", f, false))
                    };
                u ? o() : setImmediate(function () {
                    u = t.querySelector(e);
                    u ? o() : r(new Error("Couldn't find image with src " + n))
                })
            })
        };
        n._createEmbeddedAttachmentAsync = function (n, t) {
            var i = Jx.uid().toString(10),
                r = "Image" + i + this._getFileExtensionForImageContentType(t);
            return ModernCanvas.Mail.createAttachmentAsync(this._mailMessage, Microsoft.WindowsLive.Platform.AttachmentUIType.embedded, n, t, r)
        };
        n._getFileExtensionForImageContentType = function (n) {
            return this._contentTypeToFileExtensionMap[n] || ".png"
        };
        n._contentTypeToFileExtensionMap = {
            "image/gif": ".gif",
            "image/jpeg": ".jpg",
            "image/pjpeg": ".jpg",
            "image/png": ".png",
            "image/x-png": ".png"
        };
        n._updateSignature = function () {
            var n = this._body.querySelector("[data-signatureblock]");
            Boolean(n) && (this._cueText && this.removeEventListener("DOMNodeInserted", this._showHideCueText, false),
                n.innerHTML = this._getSignatureHtml(),
                this._cueText && this.addEventListener("DOMNodeInserted", this._showHideCueText, false))
        };
        n._setFontStyle = function () {
            var n = Mail.Globals.appSettings,
                t = "";
            t += Boolean(n.composeFontSize) ? "font-size: " + n.composeFontSize.replace(/"/g, "'") + ";" : "";
            t += Boolean(n.composeFontColor) ? "color: " + n.composeFontColor.replace(/"/g, "'") + ";" : "";
            t += Boolean(n.composeFontFamily) ? "font-family: " + n.composeFontFamily.replace(/"/g, "'") + ";" : "";
            this._fontStyle = t
        };
        n.activate = function (n) {
            ModernCanvas.mark("MailModernCanvas.activate", ModernCanvas.LogEvent.start);
            this._activated || (this._setFontStyle(),
                this.insertSignatureIfNecessary(n || ModernCanvas.SignatureLocation.end),
                ModernCanvas.ModernCanvasBase.prototype.activate.apply(this, arguments),
                this.addEventListener("paste", this._onPaste, false),
                window.Mail && !window.Share && this.addListener("aftercommand", this._onAfterCommand, this));
            ModernCanvas.mark("MailModernCanvas.activate", ModernCanvas.LogEvent.stop)
        };
        n.deactivate = function () {
            ModernCanvas.mark("MailModernCanvas.deactivate", ModernCanvas.LogEvent.start);
            this._activated && (ModernCanvas.ModernCanvasBase.prototype.deactivate.apply(this, arguments),
                this.removeEventListener("paste", this._onPaste, false),
                window.Mail && !window.Share && this.removeListener("aftercommand", this._onAfterCommand, this),
                this._attachmentsBeingAdded = 0,
                this._pastedFiles = [],
                this._signatureLocation = null,
                this._urlToCidUrl = {});
            ModernCanvas.mark("MailModernCanvas.deactivate", ModernCanvas.LogEvent.stop)
        };
        n._delocalizeHTML = function (n, t) {
            var i, r, u, f, e, o, s;
            if (ModernCanvas.mark("MailModernCanvas.delocalizeHTML", ModernCanvas.LogEvent.start),
                n = ModernCanvas.WindowsLive.ModernCanvas.prototype._delocalizeHTML.apply(this, arguments),
                t !== ModernCanvas.ContentDestination.clipboard) {
                for (i = this._mailMessage.getEmbeddedAttachmentCollection(),
                    i.lock(),
                    r = i.count; r--;) {
                    var h = i.item(r),
                        l = "img[src='" + h.bodyUri + "']",
                        c = n.querySelectorAll(l);
                    for (u = c.length; u--;)
                        c[u].src = ModernCanvas.Mail._getCidUrl(h)
                }
                f = this._urlToCidUrl;
                Object.keys(f).forEach(function (t) {
                    for (var u = "img[src='" + t + "']", r = n.querySelectorAll(u), i = r.length; i--;)
                        r[i].src = f[t]
                })
            }
            if (t === ModernCanvas.ContentDestination.external)
                for (e = n.querySelectorAll(".defaultFont"),
                    s = e.length; s--;)
                    o = e[s],
                    this.isNodeName(o, "DIV") && o.classList.remove("defaultFont");
            return ModernCanvas.mark("MailModernCanvas.delocalizeHTML", ModernCanvas.LogEvent.stop),
                n
        };
        n.finalizeMailMessage = function () {
            this._deleteUnusedEmbeddedAttachments() && this._mailMessage.commit()
        };
        n._deleteUnusedEmbeddedAttachments = function () {
            for (var f = this._body.querySelectorAll("img"), e = {}, i, t, r, n = 0; n < f.length; n++)
                i = this._urlToCidUrl[f[n].src],
                i && (e[i] = true);
            for (t = this._mailMessage.getEmbeddedAttachmentCollection(),
                r = false,
                t.lock(),
                n = t.count; n--;) {
                var u = t.item(n),
                    o = "img[src='" + u.bodyUri + "']",
                    s = Boolean(this._body.querySelector(o));
                s || e[ModernCanvas.Mail._getCidUrl(u)] || (u.deleteObject(),
                    r = true)
            }
            return r
        };
        n.insertSignatureIfNecessary = function (n) {
            if (ModernCanvas.mark("MailModernCanvas.insertSignatureIfNecessary", ModernCanvas.LogEvent.start),
                this._signatureLocation = n,
                Boolean(n) && n !== ModernCanvas.SignatureLocation.none && !Jx.isNullOrUndefined(this._mailAccount)) {
                var t = this._getSignatureHtml(),
                    i;
                t = '<div data-signatureblock="true" class="defaultFont" style="' + this._fontStyle + '">' + t + "<\/div>";
                n === ModernCanvas.SignatureLocation.start ? (i = ModernCanvas.ContentLocation.start,
                    t = '<div class="defaultFont" style="' + this._fontStyle + '"><br><\/div>' + t) : i = ModernCanvas.ContentLocation.end;
                ModernCanvas.WindowsLive.ModernCanvas.prototype.addContent.call(this, t, ModernCanvas.ContentFormat.htmlString, i)
            }
            ModernCanvas.mark("MailModernCanvas.insertSignatureIfNecessary", ModernCanvas.LogEvent.stop)
        };
        n.wrapTextContent = function (n) {
            return n.length > 0 ? '<div class="defaultFont" style="' + this._fontStyle + '">' + n + "<br><\/div>" : n
        };
        n.isContentReady = function () {
            return this._attachmentsBeingAdded === 0 && ModernCanvas.ModernCanvasBase.prototype.isContentReady.call(this)
        };
        n.setMailAccount = function (n) {
            this._mailAccount = n;
            this._updateSignature()
        };
        n.setMailMessage = function (n) {
            this._mailMessage = n
        };
        ModernCanvas.ModernCanvas = ModernCanvas.Mail.ModernCanvas
    }();
    Jx.delayGroupExec("CanvasPlugins");
    Jx.delayGroupExec("CanvasAutoReplaceDef")
})