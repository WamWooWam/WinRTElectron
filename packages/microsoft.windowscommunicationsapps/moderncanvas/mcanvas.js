
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(window, "ModernCanvas", function () {

$include("$(canvasRoot)/moderncanvas.css");

//
// Copyright (C) Microsoft. All rights reserved.
//
// Declares the ModernCanvas namespace, enumerations and utility functions.
//

/*jshint browser:true*/
/*global Range, unescape, ModernCanvas, WinJS, Windows, Jx, Debug*/

// TODO: use Jx.delayDefine

window.ModernCanvas = {};

ModernCanvas.DurableRange = /*@constructor*/function (range) {
    /// <summary>DurableRange is a container for a Range that can survive a transit from string to innerHTML</summary>
    /// <param name="range" type="Range">The range to initalize with</param>
    var timestamp = new Date().getTime();

    this._endId = "durablerange end" + timestamp;
    this._startId = "durablerange start" + timestamp;
    this._doc = range.commonAncestorContainer.ownerDocument;
    this._root = range.commonAncestorContainer;
    while (this._root.parentNode !== null) {
        this._root = this._root.parentNode;
    }
    this._endNode = this._doc.createComment(this._endId);
    this._startNode = this._doc.createComment(this._startId);
    this._workingRange = range.cloneRange();
    var clone2 = range.cloneRange();
    this._workingRange.collapse(false);
    this._workingRange.insertNode(/*@static_cast(Node)*/this._endNode);
    clone2.insertNode(/*@static_cast(Node)*/this._startNode);

    // Then make sure the selection stays inside the nodes
    this._update();
};

ModernCanvas.DurableRange.prototype._update = function () {
    /// <summary>Refresh the working range after any document modification</summary>
    var nodes = this._findNodes();

    this._workingRange.setStartAfter(nodes[0]);
    this._workingRange.setEndBefore(nodes[1]);
};

ModernCanvas.DurableRange.prototype._findNodes = function () {
    /// <summary>Find the start and end nodes and return them as an array</summary>

    // this node reference has been removed from the document tree so clear out our reference and search the dom for it
    if (!ModernCanvas.Component.prototype.isDescendantOf(/*@static_cast(Node)*/this._startNode, /*@static_cast(Node)*/this._root)) {
        this._startNode = null;
    }
    if (!ModernCanvas.Component.prototype.isDescendantOf(/*@static_cast(Node)*/this._endNode, /*@static_cast(Node)*/this._root)) {
        this._endNode = null;
    }

    if (!this._startNode || !this._endNode) {
        var iterator = this._doc.createNodeIterator(/*@static_cast(Node)*/this._doc, NodeFilter.SHOW_COMMENT, null, false),
        currentNode = /*@static_cast(Comment)*/iterator.nextNode();
        while (currentNode) {
            if (currentNode.data === this._endId) {
                this._endNode = currentNode;
            }
            if (currentNode.data === this._startId) {
                this._startNode = currentNode;
            }
            if (this._startNode && this._endNode) {
                break;
            }
            currentNode = /*@static_cast(Comment)*/iterator.nextNode();
        }
    }
    return [this._startNode, this._endNode];
};

ModernCanvas.DurableRange.prototype.dispose = function () {
    var nodes = this._findNodes();

    if (nodes[0] && nodes[0].parentNode) {
        nodes[0].parentNode.removeChild(/*@static_cast(Node)*/nodes[0]);
    }
    if (nodes[1] && nodes[1].parentNode) {
        nodes[1].parentNode.removeChild(/*@static_cast(Node)*/nodes[1]);
    }
};

Object.defineProperty(ModernCanvas.DurableRange.prototype, "range", {
    enumerable: true,
    get: function () {
        this._update();
        return this._workingRange;
    }
});

ModernCanvas._regexFileProtocol = /^file:\/\//i;
ModernCanvas.isFileProtocol = function (url) {
    /// <summary>Tests if the given URL starts with the file: protocol.</summary>
    /// <param name="url" type="String" />
    return ModernCanvas._regexFileProtocol.test(url);
};

ModernCanvas.runWorkersSynchronously = function (workers) {
    /// <param name="workers" type="Array">An array of workers to run.</param>
    for (var i = 0, len = workers.length; i < len; i++) {
        var worker = /*@static_cast(ModernCanvas.HtmlWorker)*/workers[i];
        worker.run(/*finishRemaining:*/true);
        Jx.dispose(worker);
        workers[i] = null;
    }
};

ModernCanvas.HtmlWorker = /*@constructor*/function (element, nodeList, callback) {
    /// <param name="element" type="HTMLElement">The root element to work on.</param>
    /// <param name="nodeList" type="NodeList" optional="true">A list of all the nodes to work on.</param>
    /// <param name="callback" type="Function" optional="true">A callback function to do work on a single HTMLElement.</param>
    Debug.assert(Jx.isHTMLElement(element) ||
        element.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
        element.nodeType === Node.DOCUMENT_NODE
    );
    this._element = element;

    this._defaultNumIterations = 10;

    if (Jx.isObject(nodeList)) {
        this._nodeList = nodeList;
        this._currentIndex = nodeList.length - 1;

        Debug.assert(Jx.isFunction(callback), "Expected callback to be specified if nodeList was specified");
        this._callback = callback;
    }
};

ModernCanvas.HtmlWorker.prototype.run = function (finishRemaining) {
    /// <summary>Runs a default number of iterations of work.</summary>
    /// <param name="finishRemaining" type="Boolean" optional="true">true to synchronously run all of the remaining work.</param>
    ModernCanvas.mark("ModernCanvas.HtmlWorker.run", ModernCanvas.LogEvent.start);
    Debug.assert(Jx.isObject(this._nodeList), "Expected run to be overridden if nodeList was not specified");
    var nodeList = this._nodeList,
        currentIndex = this._currentIndex,
        endIndex = finishRemaining ? 0 : Math.max(currentIndex - this._defaultNumIterations, 0),
        callback = this._callback;

    // Run the loop backwards to be robust against nodes being removed from the nodeList.
    for (var i = currentIndex; i >= endIndex; i--) {
        callback.call(this, /*@static_cast(HTMLElement)*/nodeList[i]);
    }

    this._currentIndex = endIndex - 1;
    var hasMoreWork = endIndex > 0;
    if (!hasMoreWork) {
        Jx.dispose(this);
    }

    ModernCanvas.mark("ModernCanvas.HtmlWorker.run", ModernCanvas.LogEvent.stop);
    return Jx.Scheduler.repeat(hasMoreWork);
};



ModernCanvas.HrefHtmlWorker = /*@constructor*/function (element) {
    /// <param name="element" type="HTMLElement" />
    ModernCanvas.HtmlWorker.call(this, element, element.querySelectorAll("a, area"), this.cleanHref);

    var loc = window.location;
    this._baseURL = loc.href + "#";
    this._baseProtocol = loc.protocol;

    this._onClick = this._onClick.bind(this);
    element.addEventListener("click", this._onClick, false);
};

Jx.inherit(ModernCanvas.HrefHtmlWorker, ModernCanvas.HtmlWorker);

ModernCanvas.HrefHtmlWorker.prototype._onClick = function (e) {
    /// <param name="e" type="Event" />
    var target = e.target,
        root = this._element,
        usemap = target.getAttribute("usemap");

    if (Jx.isNonEmptyString(usemap)) {
        // The user clicked on an <img> element that uses an image map but the <map> element can be located anywhere in
        // the DOM, and this case is rare, so for simplicity we force all fixups to finish synchronously.
        this.run(true /*finishRemaining*/);
        return;
    }

    while (Boolean(target) && target !== root) {
        // Walk up the parent chain to make sure that all of the elements being clicked on are clean.
        if (target.nodeName === "A" || target.nodeName === "AREA") {
            this.cleanHref(target);
        }
        target = target.parentNode;
    }
};

ModernCanvas.HrefHtmlWorker.prototype.dispose = function () {
    this._element.removeEventListener("click", this._onClick, false);
};

ModernCanvas.HrefHtmlWorker.prototype.cleanHref = function (element) {
    /// <param name="element" type="HTMLElement">The element to fixup</param>
    Debug.assert(Jx.isHTMLElement(element));
    // Setting to "_parent" causes the links to navigate outside of the IFrame
    // In WWAs that means launching MoBro (new, modern IE).
    // However, we don't want to do this for within-page anchor links (that start with "#").
    var href;
    try {
        href = element.href;
    } catch (ex) {
        Jx.log.exception("Failed to retrieve href", ex);
        element.removeNode(false);
        return;
    }
    if (Jx.isNonEmptyString(href)) {
        if (href.indexOf(this._baseProtocol) === 0) {
            Jx.log.warning("unsafe href detected: " + href);
            element.removeNode(false);
        } else if (href.indexOf(this._baseURL) === 0) {
            element.target = "_self";
        } else {
            element.target = "_parent";
        }

        // When we retrieved the href via the href property, IE will have re-written it into the proper, normalized form 
        // (e.g. \\server\path --> file://server/path). We want to make sure that if the normalized form starts with the
        // file:// protocol, that the href attribute does too (e.g. \\server\path --> file://\\server\path) so that it is
        // not stripped by toStaticHTML. We don't just set it to the href property because the auto-hyperlinking functionality 
        // that IE provides when typing in contenteditable doesn't work well with it (it re-writes the innerText to start with 
        // file://).
        if (ModernCanvas.isFileProtocol(href)) {
            var hrefAttribute = element.getAttribute("href");
            if (!ModernCanvas.isFileProtocol(hrefAttribute)) {
                element.setAttribute("href", "file://" + hrefAttribute);
            }
        }
    }
};



ModernCanvas.TabIndexHtmlWorker = /*@constructor*/function (element) {
    /// <param name="element" type="HTMLElement" />
    ModernCanvas.HtmlWorker.call(this, element, element.querySelectorAll("[tabindex], a, area, button, img, input, object, select, table, textarea"), this.cleanTabIndex);

    this._onBeforeActivate = this._onBeforeActivate.bind(this);
    element.addEventListener("beforeactivate", this._onBeforeActivate, false);
};

Jx.inherit(ModernCanvas.TabIndexHtmlWorker, ModernCanvas.HtmlWorker);

ModernCanvas.TabIndexHtmlWorker.prototype._onBeforeActivate = function () {
    this.run(/*finishRemaining:*/true);
};

ModernCanvas.TabIndexHtmlWorker.prototype.dispose = function () {
    this._element.removeEventListener("beforeactivate", this._onBeforeActivate, false);
};

ModernCanvas.TabIndexHtmlWorker.prototype.cleanTabIndex = function (element) {
    /// <param name="element" type="HTMLElement">The tab-able element to fixup.</param>
    Debug.assert(Jx.isHTMLElement(element));
    element.tabIndex = -1;
};



ModernCanvas.ContentEditableTabIndexHtmlWorker = /*@constructor*/function (element) {
    /// <param name="element" type="HTMLElement" />
    ModernCanvas.TabIndexHtmlWorker.call(this, element);
};

Jx.inherit(ModernCanvas.ContentEditableTabIndexHtmlWorker, ModernCanvas.TabIndexHtmlWorker);

// Only elements that can be resized in a content editable element are tabbable.
ModernCanvas.ContentEditableTabIndexHtmlWorker.prototype._isContentEditableResizable = {
    button: true,
    img: true,
    input: true,
    object: true,
    select: true,
    table: true,
    textarea: true
};

ModernCanvas.ContentEditableTabIndexHtmlWorker.prototype.cleanTabIndex = function (element) {
    /// <param name="element" type="HTMLElement">The tab-able element to fixup.</param>
    Debug.assert(Jx.isHTMLElement(element));
    if (!this._isContentEditableResizable[element.nodeName.toLowerCase()]) {
        // Setting tabIndex = -1 on <a> tags in an editable area causes selection issues, so in general we don't want to set
        // tabIndex = -1 unless the element is actually tabbable.
        element.removeAttribute("tabindex");
    } else {
        element.tabIndex = -1;
    }
};



ModernCanvas.TitleAttributeHtmlWorker = /*@constructor*/function (element) {
    /// <param name="element" type="HTMLElement" />
    ModernCanvas.HtmlWorker.call(this, element, element.querySelectorAll("[title]"), this.cleanTitleAttribute);

    this._onMouseOver = this._onMouseOver.bind(this);
    element.addEventListener("mouseover", this._onMouseOver, false);
};

Jx.inherit(ModernCanvas.TitleAttributeHtmlWorker, ModernCanvas.HtmlWorker);

ModernCanvas.TitleAttributeHtmlWorker.prototype._onMouseOver = function (e) {
    /// <param name="e" type="Event" />
    var target = e.target,
        root = this._element;
    while (Boolean(target) && target !== root) {
        // Walk up the parent chain to make sure that all of the elements under the mouse are clean.
        this.cleanTitleAttribute(target);
        target = target.parentNode;
    }
};

ModernCanvas.TitleAttributeHtmlWorker.prototype.dispose = function () {
    this._element.removeEventListener("mouseover", this._onMouseOver, false);
};

ModernCanvas.TitleAttributeHtmlWorker.prototype.cleanTitleAttribute = function (element) {
    /// <param name="element" type="HTMLElement">The element with a title attribute to fixup.</param>
    Debug.assert(Jx.isHTMLElement(element));
    element.removeAttribute("title");
};



ModernCanvas.BadElementHtmlWorker = /*@constructor*/function (element) {
    /// <param name="element" type="HTMLElement" />
    ModernCanvas.HtmlWorker.call(this, element,
        element.querySelectorAll("applet, audio, bgsound, datalist, embed, form, frame, frameset, iframe, input, listing, noembed, noframes, noscript, object, plaintext, progress, select, svg, textarea, video, xmp"),
        this.removeBadElement);
};

Jx.inherit(ModernCanvas.BadElementHtmlWorker, ModernCanvas.HtmlWorker);

ModernCanvas.BadElementHtmlWorker.prototype.removeBadElement = function (element) {
    /// <param name="element" type="HTMLElement">The bad element to remove.</param>
    Debug.assert(Jx.isHTMLElement(element));
    // After removing the node from the DOM, we'll still have a reference to it (e.g. via the NodeList returned by
    // querySelectorAll), so we need to make sure it does not continue loading. These attributes must be removed *before*
    // removing the node from the DOM, otherwise it has no effect and the node will continue to load.
    // iframe, audio, bgsound, video, object, embed and frame all use the src attribute.
    element.removeAttribute("src");
    // object uses the data attribute.
    element.removeAttribute("data");
    // applet uses the code and object attributes.
    element.removeAttribute("code");
    element.removeAttribute("object");

    // Leave the children of <form> elements in the DOM.
    var nodeName = element.nodeName,
        deep = (nodeName !== "FORM") && (nodeName !== "PROGRESS");
    element.removeNode(deep);
};

/// <disable>JS2024.DoNotQuoteObjectLiteralPropertyNames</disable>
ModernCanvas._iframeSrcMap = {
    calendar: "/ModernCanvas/ModernCanvasCalendarFrame.html",
    chat: "/ModernCanvas/ModernCanvasChatFrame.html",
    "default": "/ModernCanvas/ModernCanvasFrame.html",
    mail: "/ModernCanvas/ModernCanvasMailFrame.html",
    stm: "/ModernCanvas/ModernCanvasShareToMailFrame.html"
};
/// <enable>JS2024.DoNotQuoteObjectLiteralPropertyNames</enable>

ModernCanvas.createCanvasAsync = function (hostElement, options) {
    /// <summary>Constructs a new Modern Canvas control.</summary>
    /// <param name="hostElement" type="HTMLElement">The element to transform into a Modern Canvas control.</param>
    /// <param name="options" type="__ModernCanvas.ModernCanvas.Options" optional="true">A property bag of any valid options.</param>
    /// <returns type="WinJS.Promise">A promise that completes with an instance of Modern Canvas control.</returns>

    Debug.assert(Jx.isHTMLElement(hostElement), "Expected hostElement to be a valid element");
    hostElement.innerHTML = "";

    return new WinJS.Promise(
        function (complete, error) {
            var iframeElement = hostElement.ownerDocument.createElement("iframe");
            iframeElement.addEventListener("load", function onLoad() {
                try {
                    iframeElement.removeEventListener("load", onLoad, false);
                    complete(new ModernCanvas.ModernCanvas(iframeElement, options));
                } catch (ex) {
                    error(ex);
                }
            }, false);
            iframeElement.src = ModernCanvas._iframeSrcMap[options.className] || ModernCanvas._iframeSrcMap["default"];
            hostElement.appendChild(iframeElement);
        }
    );
};

ModernCanvas.createUrlToStreamMapAsync = function (dataPackage) {
    /// <summary>Creates a map from each image/resource URL in the HTML of the given DataPackage to its associated RandomAccessStream.</summary>
    /// <param name="dataPackage" type="Windows.ApplicationModel.DataTransfer.DataPackageView" />
    /// <returns>A Promise that completes with a map from URL to RandomAccessStream.</returns>
    Debug.assert(Jx.isObject(dataPackage), "Expected valid dataPackage");

    return new WinJS.Promise(
        function (complete, error) {
            dataPackage.getResourceMapAsync()
                .then(function (resourceMap) {
                    /// <param name="resourceMap" type="Windows.ApplicationModel.DataTransfer.DataPackageResourceMap">
                    /// A map from URL to RandomAccessStreamReference for each image/resource in the DataPackage.
                    /// </param>

                    var urlStreamPromises = Object.keys(resourceMap)
                        .map(function (url) {
                            // Start retrieving a stream for each URL in the ResourceMap.
                            return ModernCanvas._getStreamForUrlAsync(url, resourceMap[url]);
                        });

                    return WinJS.Promise.join(urlStreamPromises);
                })
                .then(function (urlStreams) {
                    /// <param name="urlStreams" type="Array">
                    /// An array of objects, each containing a URL and its associated RandomAccessStream.
                    /// </param>

                    return urlStreams.reduce(function (map, urlStream) {
                        // Reduce the array to a single object - a map from URL to RandomAccessStream.
                        var url = urlStream.url,
                            stream = urlStream.stream;

                        map[url] = stream;

                        if (ModernCanvas.isFileProtocol(url)) {
                            // WinBlue:496541 - toStaticHTML strips "file:" URLs, so the clipboard re-writes the HTML to 
                            // switch any "file:" URLs to use "ms-clipboard-file:" URLs instead. If you index into the 
                            // resource map with the "ms-clipboard-file:" URL, it silently works but "ms-clipboard-file:" keys 
                            // are not exposed via Object.keys(resourceMap). Since we make a copy of the resource map, we need 
                            // to add a special case here.
                            map["ms-clipboard-" + url] = stream;
                        }

                        return map;
                    }, {});
                })
                .done(complete, error);
        }
    );
};

ModernCanvas._getStreamForUrlAsync = function (url, randomAccessStreamReference) {
    /// <summary>Gets the stream from the RandomAccessStreamReference and returns an object that associates it with the given URL.</summary>
    /// <param name="url" type="String">A URL that represents an image/resource.</param>
    /// <param name="randomAccessStreamReference" type="Windows.Storage.Streams.RandomAccessStreamReference">A reference to the backing stream for the URL.</param>
    /// <returns>A Promise that completes with an object containing the given URL and its associated RandomAccessStream.</returns>

    return new WinJS.Promise(
        function (complete, error) {
            randomAccessStreamReference.openReadAsync()
                .done(function (stream) {
                    /// <param name="stream" type="RandomAccessStreamWithContentType" />
                    complete({
                        url: url,
                        stream: stream
                    });
                }, error);
        }
    );
};

ModernCanvas.TextRangeIterator = /*@constructor*/function () { };
ModernCanvas.TextRangeIterator.prototype = {
    // Functions
    nextRange: function () {
        /// <returns type="Range"></returns>
    }
};

ModernCanvas.Component = /*@constructor*/function () {
    this.initComponent();
    this.on = this.detach = this.fire = this.fireDirect = null;
};

Jx.augment(ModernCanvas.Component, Jx.Component);

ModernCanvas.Component.prototype._usageData = {};

ModernCanvas.Component.prototype._normalizeRange = function (range) {
    /// <summary>This function attempts to normalize the contents of a range. In a normalized subtree, no text nodes
    /// in the subtree are empty and there are no adjacent text nodes. The subtree that is modified is the Range's 
    /// commonAncestorContainer</summary>

    var startNode = this.getElementFromNode(range.commonAncestorContainer),
        normalize = function (node) {
            var sibling = node.firstChild;
            while (sibling) {
                if (sibling.nodeType === Node.TEXT_NODE) {
                    var newNode = sibling,
                        newText = sibling.nodeValue;
                    sibling = sibling.nextSibling;
                    while (sibling && sibling.nodeType === Node.TEXT_NODE) {
                        var toRemove = sibling;
                        newText += sibling.nodeValue;
                        sibling = sibling.nextSibling;
                        toRemove.removeNode(true);
                    }
                    if (newText.length > 0) {
                        newNode.nodeValue = newText;
                    } else {
                        newNode.removeNode(true);
                    }
                } else {
                    if (sibling.nodeType === Node.ELEMENT_NODE) {
                        normalize(sibling);
                    }
                    sibling = sibling.nextSibling;
                }
            }
        },
        bookmarkRange = new ModernCanvas.RangeBookmark(range, startNode);
    normalize(startNode);
    var newRange = bookmarkRange.getBookmarkedRange(startNode);
    Debug.assert(newRange, "Normalize RangeBookmark restore failed.");
    return newRange;
};

// Note: This API was designed for internal use in the ModernCanvas. There are some 'gotcha's here if you are not careful:
//      1. Don't save off the range that is returned via nextRange() because we re-use it internally on the next call to nextRange().
//      2. Be careful when modifying the DOM between calls to nextRange(). The only DOM manipulation that is safe to make between
//         calls to nextRange() is wrapping each text range in a new element (e.g. a <font> tag).
//      3. This method may create text nodes in empty areas where they don't already exist.
ModernCanvas.Component.prototype._createTextRangeIterator = function (range) {
    /// <summary>Creates an iterator that returns each text range in the given range.</summary>
    /// <param name="range" type="Range">The range to iterate.</param>
    /// <returns type="ModernCanvas.TextRangeIterator">An iterator that returns each text range in the given range.</returns>
    var startContainer = range.startContainer,
        endContainer = range.endContainer,
        startOffset = range.startOffset,
        endOffset = range.endOffset,
        ownerDocument = range.commonAncestorContainer.ownerDocument,
        textRange = ownerDocument.createRange(),
        textNode,
        that = this;
    if (range.collapsed) {
        // Because the range is already collapsed, we target this as a special case since we know that we will only
        // be returning one range. (Also, IE's NodeIterator doesn't return the results we'd like for collapsed cases).
        if (startContainer.nodeType === Node.TEXT_NODE && this.elementCanContainPhrasingContent(that.getElementFromNode(startContainer))) {
            if (startContainer.nodeValue.length === 0 && startContainer.parentNode.childNodes.length === 1) {
                // We are inside of an empty text node that is the only child of its parent, so we return it.
                textRange.selectNodeContents(startContainer);
            } else {
                // We are in some text node, so just return the same collapsed range we were handed.
                textRange.setStart(startContainer, startOffset);
                textRange.setEnd(endContainer, endOffset);
            }
        } else if (this.elementCanContainPhrasingContent(startContainer)) {
            Debug.assert(startContainer.nodeType === Node.ELEMENT_NODE);
            if (startContainer.childNodes.length === 0) {
                // We are in an empty element that could contain text, so create a text node and return it.
                textNode = ownerDocument.createTextNode("");
                startContainer.appendChild(textNode);
                textRange.selectNodeContents(textNode);
            } else {
                var childNode = startContainer.childNodes.item(0);
                if (startContainer.childNodes.length === 1 &&
                    childNode.nodeType === Node.TEXT_NODE &&
                    childNode.length === 0) {
                    // We are right next to an empty text node, so just move there and return it.
                    textRange.selectNodeContents(childNode);
                } else {
                    // We are in an empty space between elements that could contain text, so create a text node and return it.
                    textNode = ownerDocument.createTextNode("");
                    textRange = range.cloneRange();
                    textRange.insertNode(textNode);
                }
            }
        } else {
            textRange = null;
        }

        return {
            nextRange: function () {
                var tempRange = textRange;
                // Because the original range is collapsed, we will always return just one text range. Therefore, we clear
                // out the textRange variable before returning it the first time so that it is null on every call thereafter.
                textRange = null;
                return tempRange;
            }
        };
    } else {
        range = this.trimRange(this._normalizeRange(range));
        startContainer = range.startContainer;
        endContainer = range.endContainer;
        startOffset = range.startOffset;
        endOffset = range.endOffset;
        var iterator = ownerDocument.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (node) {
                /// <summary>Chooses which nodes to expose via the iterator.</summary>
                /// <param name="node" type="Node">The given node, which we can choose to accept or skip.</param>
                if (that.intersectsNode(range, node)) {
                    if (node.nodeType === Node.TEXT_NODE && that.elementCanContainPhrasingContent(that.getElementFromNode(node))) {
                        return NodeFilter.FILTER_ACCEPT;
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute("data-applyformatting") !== "false") {
                        if (that.isNodeName(node, "IMG") || node.getAttribute("data-applyformatting") === "true") {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    }
                }
                return NodeFilter.FILTER_SKIP;
            }, false),
            lastElement;

        return {
            nextRange: function () {
                var nextNode = iterator.nextNode();
                if (Boolean(nextNode) && nextNode === lastElement) {
                    // Because the client of this API is probably wrapping each element in a new tag, the NodeIterator API can
                    // get confused and return the same element over and over again. However, in the interest of avoiding an
                    // infinite loop, we make sure not to return the same element twice from our API.
                    nextNode = iterator.nextNode();
                    Debug.assert(nextNode !== lastElement, "Expected nextNode to return a different element than last time!");
                }
                if (nextNode) {
                    if (nextNode.nodeType === Node.TEXT_NODE) {
                        // The common case is that we will return the entire text node.
                        textRange.selectNodeContents(nextNode);

                        // Cover the edge cases where the start or end of the original range doesn't span an entire text node.
                        if (nextNode === startContainer && nextNode === endContainer) {
                            // The entire range is confined to one text node.
                            textRange.setStart(startContainer, startOffset);
                            textRange.setEnd(endContainer, endOffset);
                        } else if (nextNode === startContainer) {
                            textRange.setStart(startContainer, startOffset);
                        } else if (nextNode === endContainer) {
                            textRange.setEnd(endContainer, endOffset);
                        }
                    } else {
                        // We are returning a style level element.
                        lastElement = nextNode;
                        textRange.selectNode(nextNode);
                    }

                    return textRange;
                }

                return null;
            }
        };
    }
};

ModernCanvas.Component.prototype.rangeContainsNonEditableContent = function (range) {
    /// <summary>Checks to see if a range contains any content that is not editable</summary>
    /// <param name="range" type="Range">The range to check for non-editable content</param>
    /// <returns type="Boolean">Returns true if any of the content within a range is marked as contentEditable = false</returns>

    // Determine if all sub nodes are editable elements
    var commonNode = this.getElementFromNode(range.commonAncestorContainer),
        doc = range.startContainer.ownerDocument,
        that = this,
        iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_ELEMENT, function (node) {
            return that.intersectsNode(range, node, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }, false),
        currentNode = iterator.nextNode();
    Debug.assert(this.getDocument() === doc);
    while (currentNode) {
        if (!currentNode.isContentEditable) {
            // We found a non-editable region. No need to keep searching
            return true;
        }

        currentNode = iterator.nextNode();
    }

    return !commonNode.isContentEditable;
};

ModernCanvas.Component.prototype.clearUsageData = function () {
    /// <summary>Clears all information in the current data set, resetting the session.</summary>
    Debug.assert(typeof this._usageData === "object");
    this._usageData = {};
};

ModernCanvas.Component.prototype.getUsageData = function () {
    /// <summary>Retrieves the data set for the current session of this component.</summary>
    /// <returns type="Object">Key/Value pair of the usage data of this component.</returns>
    Debug.assert(typeof this._usageData === "object");
    return this._usageData;
};

ModernCanvas.Component.prototype.initComponent = function () {
    /// <summary>Initializes the component. Should be called in the component constructor.</summary>
    this._usageData = {};
    Jx.Component.initComponent.call(this);
};

ModernCanvas.Component.prototype.discardableClone = function (node, deep) {
    /// <summary>Get a clone of the given node that can be discarded. This function should be used over the whole content and allows additional modifications by subclasses.</summary>
    /// <param name="node" type="Node">node to clone</param>
    /// <param name="deep" type="Boolean">if the children of the node should be copied</param>
    /// <returns type="Node">cloned node</returns>

    var parentComponent = /*@static_cast(ModernCanvas.Component)*/this.getParent();
    // parentComponent maybe null because the ReadingPane uses AutoReplaceManagers before they are added as components of the canvas
    if (parentComponent) {
        return parentComponent.discardableClone(node, deep);
    } else {
        return node.cloneNode(deep);
    }
};

ModernCanvas.Component.prototype.getDocument = function () {
    /// <summary>Gets the editable element's owner document.</summary>
    /// <returns type="Document">The Document object for the editable element.</returns>

    var parentComponent = /*@static_cast(ModernCanvas.Component)*/this.getParent();
    return parentComponent.getDocument();
};

ModernCanvas.Component.prototype.getWindow = function () {
    /// <summary>Gets the editable element's owner window.</summary>
    /// <returns type="Window">The Window object for the editable element.</returns>

    var parentComponent = /*@static_cast(ModernCanvas.Component)*/this.getParent();
    return parentComponent.getWindow();
};

ModernCanvas.Component.prototype.getIframeSelection = function () {
    /// <summary>Gets the Selection object representing the current selection in the iframe.</summary>
    /// <returns type="Selection">The Selection or null if the selection is not available.</returns>

    return this.getDocumentSelection(this.getDocument());
};

ModernCanvas.Component.prototype.getDocumentSelection = function (doc) {
    /// <summary>Gets the Selection object representing the current selection in the given document.</summary>
    /// <param name="doc" type="Document">The document from which to retrieve the selection.</param>
    /// <returns type="Selection">The Selection or null if the selection is not available.</returns>

    try {
        var selection = doc.getSelection();

        // Accessing the rangeCount can throw in some cases (see WinBlue 125106) so we check to make sure its valid before
        // returning the selection object.
        if (selection.rangeCount >= 0) {
            Debug.assert(selection.rangeCount <= 1, "Expected MultipleSelection to be turned off");
            return selection;
        }
    } catch (err) {
        // TODO: Remove when WinBlue 65193 is fixed.
        Jx.log.exception("Failure during getDocumentSelection", err);
        Debug.assert(false, "Failure during getDocumentSelection; if this matches WINBLUE:125106 (e.g. your selection is in a table) please ignore, otherwise please open a new bug." + err);
    }

    return null;
};

ModernCanvas.Component.prototype.getIframeSelectionRange = function () {
    /// <summary>Gets a Range object representing the currently selected range regardless of its position in the iframe.</summary>
    /// <returns type="Range">The selected Range or null if the selection is not in the editable element.</returns>
    return this.getDocumentSelectionRange(this.getDocument());
};

ModernCanvas.Component.prototype.getDocumentSelectionRange = function (doc) {
    /// <summary>Gets a Range object from a selection object.</summary>
    /// <param name="doc" type="Document">The document from which to retrieve the selection.</param>
    /// <returns type="Range">The selected Range or null if the selection does not contain any ranges.</returns>

    try {
        var selection = this.getDocumentSelection(doc);
        if (Boolean(selection) && selection.rangeCount > 0) {
            return selection.getRangeAt(0);
        }
    } catch (err) {
        // TODO: Remove when WinBlue 65193 is fixed.
        Jx.log.exception("Failure during getDocumentSelectionRange", err);
        Debug.assert(false, "Failure during getDocumentSelectionRange; if this matches WINBLUE:125106 (e.g. your selection is in a table) please ignore, otherwise please open a new bug." + err);
    }

    return null;
};

ModernCanvas.Component.prototype.replaceIframeSelectionRange = function (newRange) {
    /// <summary>Removes the current selection and replaces it with the given range, if one is provided.</summary>
    /// <param name="newRange" type="Range" optional="true">The range to select, or null to remove all ranges.</param>

    try {
        var selection = this.getIframeSelection();
        if (selection) {
            selection.removeAllRanges();
            if (newRange) {
                selection.addRange(newRange);
            }
        }
    } catch (err) {
        // TODO: Remove when WinBlue 65193 is fixed.
        Jx.log.exception("Failure during replaceIframeSelectionRange", err);
        Debug.assert(false, "Failure during replaceIframeSelectionRange; if this matches WINBLUE:125106 (e.g. your selection is in a table) or WINBLUE:125993 please ignore, otherwise please open a new bug." + err);
    }
};

ModernCanvas.Component.prototype.getSelectionRange = function () {
    /// <summary>Gets a Range object representing the currently selected range in the editable element.</summary>
    /// <returns type="Range">The selected Range or null if the selection is not in the editable element.</returns>

    var parentComponent = /*@static_cast(ModernCanvas.Component)*/this.getParent();
    return parentComponent.getSelectionRange();
};

ModernCanvas.Component.prototype.getAnchorElement = function (selectionRange) {
    /// <summary>Gets an html element that is positioned over the given selection.</summary>
    /// <param name="selectionRange" type="Range">The range to get an anchor element for.</param>
    /// <returns type="HTMLElement">An element positioned over the given selection.</returns>

    var parentComponent = /*@static_cast(ModernCanvas.Component)*/this.getParent();
    return parentComponent.getAnchorElement(selectionRange);
};

ModernCanvas.Component.prototype.getElementFromNode = function (node) {
    /// <summary>Gets the nearest element to the given node.</summary>
    /// <param name="node" type="Node">The node to search from.</param>
    /// <returns type="HTMLElement">The element nearest to the given node.</returns>

    Debug.assert(Jx.isObject(node), "Expected node to be a valid Node");
    Debug.assert(node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.ELEMENT_NODE, "Unexpected node type");

    // Correct the common ancestor container to be a full blown element if it is only a text node
    if (node.nodeType !== Node.ELEMENT_NODE) {
        Debug.assert(Boolean(node.parentNode) && node.parentNode.nodeType === Node.ELEMENT_NODE, "Expected parent node to be an element");

        return /*@static_cast(HTMLElement)*/node.parentNode;
    }

    return /*@static_cast(HTMLElement)*/node;
};

ModernCanvas.Component.prototype.replaceSelection = function (newRange) {
    /// <summary>Replaces the current selection range with the given range.</summary>
    /// <param name="newRange" type="Range">The range to select.</param>

    Debug.assert(Jx.isObject(newRange), "Expected newRange to be a valid Range or TextRange");

    var textRange = /*@static_cast(TextRange)*/newRange;
    if (textRange.select) {
        Debug.assert(this.getDocument() === textRange.parentElement().ownerDocument, "Expected textRange to be inside the editable element.");

        textRange.select();
    } else {
        Debug.assert(this.getDocument() === newRange.commonAncestorContainer.ownerDocument, "Expected newRange to be inside the editable element.");

        this.replaceIframeSelectionRange(newRange);
    }

};

ModernCanvas.Component.prototype.scrollSelectionIntoView = function () {
    /// <summary>Ensures the current selection range is visible by scrolling to it if necessary.</summary>

    var parentComponent = /*@static_cast(ModernCanvas.Component)*/this.getParent();
    parentComponent.scrollSelectionIntoView();
};

ModernCanvas.Component.prototype.getSelectionRangeBoundingRect = function () {
    /// <summary>Returns the bounding rectangle for the selection range, working around Windows Blue Bugs 70221. Callers must dispose the returned ClientRect.</summary>
    /// <returns type="ClientRect">The bounding rectangle for the current selection range. This object must be disposed by the caller.</returns>

    var selectionRange = this.getSelectionRange();
    if (Jx.isNullOrUndefined(selectionRange)) {
        return null;
    }

    var boundingRect = selectionRange.getBoundingClientRect();
    if (boundingRect.height === 0 && boundingRect.top === 0 && boundingRect.left === 0) {
        // Check if just an image is selected and use it's bounding rect
        // BLUE:467815 - workaround
        var img = this.getSelectedImage(selectionRange);
        if (img) {
            boundingRect = img.getBoundingClientRect();
        }
        if (boundingRect.height === 0 && boundingRect.top === 0 && boundingRect.left === 0) {
            // Insert a zero-width space just after the selection to work around Windows Blue Bugs 70221 - TextRange and Range
            // return incorrect bounding rectangle for empty selection at the end of a line.
            var textNode = this.getDocument().createTextNode("\u200B");
            selectionRange.insertNode(textNode);
            boundingRect = selectionRange.getBoundingClientRect();
            Debug.assert(boundingRect.height !== 0 || (boundingRect.top !== 0 && boundingRect.left !== 0), "Expected selection bounding rect to be valid");

            // The caller of this function will need to dispose the returned ClientRect.
            boundingRect.dispose = function () {
                // Remove the zero-width space.
                var parentNode = textNode.parentNode;
                if (parentNode) {
                    parentNode.removeChild(textNode);
                }
            };
        }
    }

    return boundingRect;
};

ModernCanvas.Component.prototype.getSelectedImage = function (range) {
    /// <summary>Returns an image selected by the range.</summary>
    /// <param name="range" type="Range">The range to inspect.</param>
    /// <returns type="HTMLElement">If the range contains an img element and only an image element return it.</returns>


    range = this.trimRange(range);
    var that = this,
        commonNode = range.commonAncestorContainer,
        doc = commonNode.ownerDocument,
        iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_ELEMENT, function (node) {
            return commonNode !== node && that.intersectsNode(range, node, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }, false),
        currentNode = iterator.nextNode();

    if (this.isNodeName(currentNode, "IMG") && !iterator.nextNode()) {
        return currentNode;
    }

    return null;
};

ModernCanvas.Component.prototype.selectNodeContents = function (node) {
    /// <summary>Changes the current selection range to start before the given node's first child and end after the given node's last child.</summary>
    /// <param name="node" type="Node">The node to select.</param>

    Debug.assert(Jx.isObject(node), "Expected node to be a valid Node");
    Debug.assert(this.getDocument() === node.ownerDocument, "Expected node to be inside the editable element.");

    var newSelection = this.getDocument().createRange();
    newSelection.selectNodeContents(node);
    this.replaceSelection(newSelection);
};

ModernCanvas.Component.prototype.intersectsNode = function (range, node, nonInclusive) {
    /// <summary>Determines if the given node is partially or completely within the range.</summary>
    /// <param name="range" type="Range">The range to check.</param>
    /// <param name="node" type="Node">The node to check.</param>
    /// <param name="nonInclusive" type="Boolean" optional="true">true if the range check is non-inclusive.</param>
    /// <returns type="Boolean">true if the node is partially or completely within the range, and false otherwise.</returns>

    Debug.assert(this.getDocument() === range.commonAncestorContainer.ownerDocument, "Expected range to be inside the editable element.");
    Debug.assert(this.getDocument() === node.ownerDocument, "Expected node to be inside the editable element.");

    return Jx.intersectsNode(range, node, nonInclusive);
};

ModernCanvas.Component.prototype.isDescendantOf = function (possibleDescendant, possibleAncestor) {
    /// <summary>Checks if the first node is a descendant of the second node.</summary>
    /// <param name="possibleDescendant" type="Node">The node that may be a descendant.</param>
    /// <param name="possibleAncestor" type="Node">The node that may be an ancestor.</param>
    /// <returns type="Boolean">true if the first node is a descendant of the second node and false otherwise.</returns>

    Debug.assert(Jx.isObject(possibleDescendant), "Expected possibleDescendant to be a valid Node");
    Debug.assert(Jx.isObject(possibleAncestor), "Expected possibleAncestor to be a valid Node");

    while (Boolean(possibleDescendant) && possibleDescendant !== possibleAncestor) {
        possibleDescendant = possibleDescendant.parentNode;
    }

    return possibleDescendant === possibleAncestor;
};

ModernCanvas.Component.prototype.isNodeName = function (node, names) {
    /// <summary>determines if the given element's node name is among the current list.</summary>
    /// <param name="node" type="Node">the node to check</param>
    /// <param name="names" type="String" parameterArray="true">the names to check</param>
    /// <returns type="Boolean">true if the node is named any of the values in names, false otherwise</returns>
    if (node) {
        var nodeName = node.nodeName.toUpperCase();
        for (var i = 1; i < arguments.length; i++) {
            if (nodeName === arguments[i].toUpperCase()) {
                return true;
            }
        }
    }
    return false;
};

ModernCanvas.Component.prototype.getPreviousNode = function () {
    /// <summary>From the current selection return a node that is just before the selection.</summary>
    /// <returns type="Node">Return a node that is just before the selection.</returns>

    var range = this.getSelectionRange();
    if (!range) {
        return null;
    }
    if (range.startOffset > 0) {
        // somewhere in the middle of a node
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
            // but for text nodes this is the same node
            return range.startContainer;
        } else if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
            // elements this is the previous childNode to our offset
            return range.startContainer.childNodes[range.startOffset - 1];
        }
    } else {
        var sibling = range.startContainer.previousSibling;
        if (sibling) {
            // we have a sibling thats previous to us
            return sibling;
        } else {
            // this is the first child of our parent so before us is our parent
            return range.startContainer.parentNode;
        }
    }

    return null;
};



ModernCanvas.Component.prototype.trimRange = function (range) {
    /// <summary>Condenses a range into the smallest well-formed state that still contains the same text markup.</summary>
    /// <param name="range" type="Range">The range to trim</param>
    /// <returns type="Range">The new range.</returns>

    if (!range || range.collapsed) {
        return range;
    }
    var doc = range.startContainer.ownerDocument,
        that = this,
        newRange = range.cloneRange();

    var firstNode = range.startContainer,
        lastNode = range.endContainer,
        currentNode = null,
        startOffset = range.startOffset;

    // determine the first node of the range
    if (firstNode.nodeType !== Node.TEXT_NODE && firstNode.childNodes.length > startOffset) {
        firstNode = firstNode.childNodes[startOffset];
        startOffset = 0;
    }

    if (firstNode.nodeType === Node.TEXT_NODE && firstNode.nodeValue.length === startOffset) {
        // Look for a nextSibling that is visibly highlighted
        currentNode = firstNode;
        while (!Boolean(currentNode.nextSibling)) {
            if (this.isBlockElement(currentNode.parentNode)) {
                break;
            }
            currentNode = currentNode.parentNode;
        }

        if (currentNode.nextSibling) {
            firstNode = currentNode.nextSibling;

            // Walk down to the lowest node possible
            while (firstNode.firstChild) {
                firstNode = firstNode.firstChild;
            }

            newRange.setStartBefore(firstNode);
            startOffset = 0;
        }
    }

    // determine the last node of the range
    var endOffset = range.endOffset;
    if (lastNode.nodeType !== Node.TEXT_NODE && lastNode.childNodes.length > endOffset) {
        lastNode = range.endContainer.childNodes[endOffset];
        endOffset = 0;
    } else if (endOffset !== 0 && lastNode.childNodes.length === endOffset) { // This also excludes TEXT_NODE
        if (lastNode.nextSibling) {
            // We will move to nextSibling so that in the next if block we'll move back using previousSibling and then walk down to the lastChild
            lastNode = lastNode.nextSibling;
            endOffset = 0;
        } else if (lastNode.lastChild && lastNode.lastChild.nodeType === Node.TEXT_NODE) {
            lastNode = lastNode.lastChild;
            endOffset = lastNode.nodeValue.length;
        }
    }

    if (endOffset === 0) {
        currentNode = lastNode;
        while (!Boolean(currentNode.previousSibling)) {
            if (this.isBlockElement(currentNode.parentNode)) {
                break;
            }
            currentNode = currentNode.parentNode;
        }

        if (currentNode.previousSibling) {
            lastNode = currentNode.previousSibling;

            // Walk down to the lowest node possible
            while (lastNode.lastChild) {
                lastNode = lastNode.lastChild;
            }
            newRange.setEndAfter(lastNode);
        }
    }

    var doneMoving = firstNode.nodeType === Node.TEXT_NODE && startOffset < firstNode.length,
        firstSeen = false,
        commonNode = newRange.commonAncestorContainer,
        iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (node) {
            return commonNode !== node && that.intersectsNode(range, node, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }, false);

    // If we started with doneMoving move the start point
    if (doneMoving) {
        newRange.setStart(firstNode, startOffset);
    }
    // Move the newRange's start position to the first visible node
    currentNode = iterator.nextNode();
    while (currentNode) {
        firstSeen = firstSeen || firstNode === currentNode;
        if (!doneMoving && this.isVisibleNode(currentNode)) {

            // If the original start container === currentNode, then use the original startOffset
            if (range.startContainer === currentNode) {
                newRange.setStart(currentNode, startOffset);
            } else {
                newRange.setStartBefore(currentNode);
            }

            doneMoving = firstSeen;
        }
        currentNode = iterator.nextNode();
    }

    // move the newRange's end position the last visible node
    var lastSeen = false;
    currentNode = iterator.previousNode();
    while (currentNode) {
        lastSeen = lastSeen || currentNode === lastNode;
        if (lastSeen && this.isVisibleNode(currentNode)) {
            // If the original end node === currentNode, use the original endOffset
            if (range.endContainer === currentNode) {
                newRange.setEnd(currentNode, range.endOffset);
            } else {
                newRange.setEndAfter(currentNode);
            }

            break;
        }
        currentNode = iterator.previousNode();
    }

    // final fixup move to text ranges
    if (newRange.startOffset === 0 &&
        newRange.startContainer.nodeType !== Node.TEXT_NODE) {

        firstNode = newRange.startContainer;
        while (firstNode.nodeType !== Node.TEXT_NODE && firstNode.firstChild) {
            firstNode = firstNode.firstChild;
        }

        if (firstNode.nodeType === Node.TEXT_NODE) {
            newRange.setStart(firstNode, 0);
        }
    }
    if (newRange.endContainer.nodeType !== Node.TEXT_NODE &&
        newRange.endOffset === newRange.endContainer.childNodes.length) {

        lastNode = newRange.endContainer;
        while (lastNode.nodeType !== Node.TEXT_NODE && lastNode.lastChild) {
            lastNode = lastNode.lastChild;
        }

        if (lastNode.nodeType === Node.TEXT_NODE) {
            newRange.setEnd(lastNode, lastNode.length);
        }
    }

    return newRange;
};

ModernCanvas.Component.prototype.isVisibleNode = function (node) {
    /// <summary>Consults a list of nodes that are visible.</summary>
    /// <param name="node" type="TextNode">The node to test</param>
    /// <returns type="Boolean">true if visible</returns>

    return (node.nodeType === Node.TEXT_NODE && node.length > 0) || ModernCanvas.Component.prototype.isBlockElement(/*@static_cast(Node)*/node);
};

ModernCanvas.Component.prototype.isBlockElement = function (node) {
    /// <summary>Consults a list of nodes that are block elements.</summary>
    /// <param name="node" type="Node">The node to test</param>
    /// <returns type="Boolean">true if a block element</returns>

    return ModernCanvas.Component.prototype.isNodeName(node, "DIV", "P", "BR", "BLOCKQUOTE", "LI", "H1", "H2", "H3", "H4", "H5", "H6",
            "TABLE", "TR", "TD", "TH", "CAPTION", "COL", "COLGROUP", "THEAD", "TBODY", "TFOOT",
            "HR", "IMG", "EMBED", "OBJECT", "BODY", "PRE");
};

ModernCanvas.Component.prototype.isVoidElement = function (node) {
    /// <summary> 
    /// Void elements can't have any contents (since there's no end tag, no content can be put between the start tag and the end tag).
    /// This list was retrieved from http://www.w3.org/TR/html5/syntax.html#void-elements on Nov 9, 2011.
    /// </summary>
    /// <param name="node" optional="false">The node to check</param>
    /// <returns> True if node is a void element, false otherwise </returns>
    return ModernCanvas.Component.prototype.isNodeName(node, "AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN",
            "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR");
};

ModernCanvas.Component.prototype.cloneContentsWithParents = function (range) {
    /// <summary>From a range that is to be copied add parent elements that are required.</summary>
    /// <param name="range" type="Range">selected Range</param>
    /// <returns type="HTMLElement">doc fragment container</returns>

    // This function prepares a new node for use in the copy function. It's possible to copy nodes
    // without their required parents (LI needs an UL or a TD needs a TR) when inserting a node without
    // required parent into some other document the HTML will be invalidated and bad mojo results.
    // We need to create a copy buffer that includes those parent elements.  We start with a simple
    // call to range.cloneContents; from inetcore/mshtml/src/site/text/splice.cxx

    // CMarkup::SpliceTree implementation:

    //  Copy:   All the text in the specified range, as well as elements that
    //          fall completely in the range, are copied.
    //
    //          Elements that overlap the range on the left are copied; begin
    //          edges are implied at the very beginning of the range, in the
    //          same order in which the begin edges appear in the source.
    //
    //          Elements that overlap the range on the right are copied; end
    //          edges are implied at the very end of the range, in the same
    //          order in which they appear in the source.

    // Next we need to find the last parent element that wasn't in the cloned range. To do this we
    // find the first element of the selection; if startContainer is text just use its parent,
    // else either use the offset element in startContainer or startContainer.  Now we need to determine
    // if this element would have been included in the cloneContents result.  To do this we compare end
    // edge of nodes with the range to see if the end over laps. Example:

    // HTML <table id="three"><tr id="two"><td id="one">o^ne</td></tr></tr><td>t^wo</td></tr></table>
    // ^ shows the start and end positions of the user selection
    // clonedContent looks like: <tr><td id="one">ne</td></tr></tr><td id="two"> wo</td>
    // lets find the missing table element
    // firstElement will be id="one"
    // we select this and compare its end to the user selection end
    // its less than the end point (one's closing </td> is before the end ^
    // next we select its parent first element will be id="two"
    // we select this and compare its end to the user selection end
    // its less than the end point (two's closing </tr> is before the end ^
    // next we select its parent first element will be id="three"
    // we select this and compare its end to the user selection end
    // its greater than the end point (threes closing </table> is after the end ^
    // we stop and this would be our first inserted parent

    // We mark the original selection with HTML comments: <!--StartFragment --> and <!--EndFragment -->
    // which are part of the CF_HTML http://msdn.microsoft.com/en-us/library/aa767917(VS.85).aspx data format.
    // Then we repeatedly apply parent nodes to the fragment until the last element doesn't require a parent.

    var doc = range.startContainer.ownerDocument,
        root = doc.createElement("div"),
        docFrag = range.cloneContents(),
        firstElement,
        startFragment = doc.createComment("StartFragment "),
        endFragment = doc.createComment("EndFragment ");

    // Do a quick check to see if any work needs doing
    var neededParent = false,
        hasFormatting = false;
    for (var i = 0; i < docFrag.childNodes.length; i++) {
        neededParent = ModernCanvas.Component.prototype.needsParent(docFrag.childNodes[i]);
        if (neededParent) {
            break;
        }
    }
    var current = range.startContainer;
    while (current) {
        hasFormatting = ModernCanvas.Component.prototype.isFormattedNode(/*@static_cast(HTMLElement)*/current);
        if (hasFormatting) {
            break;
        }
        current = current.parentNode;
    }
    if (!neededParent && !hasFormatting) {
        root.appendChild(docFrag);
        return root;
    }

    // Find the node that would have been used as the first node in the selection
    if (range.startContainer.nodeType !== Node.ELEMENT_NODE) {
        firstElement = range.startContainer.parentNode;
    } else if (range.startOffset < range.startContainer.childNodes.length) {
        firstElement = range.startContainer.childNodes[range.startOffset];
    } else {
        firstElement = range.startContainer;
    }
    var testRange = doc.createRange();
    testRange.selectNodeContents(firstElement);
    // elements that overlap on the right are copied, so some other parent isn't in the selection
    while (testRange.compareBoundaryPoints(Range.END_TO_END, range) < 0) {
        firstElement = firstElement.parentNode;
        testRange.selectNodeContents(firstElement);
    }

    // put in the selection pointers
    docFrag.insertBefore(/*@static_cast(Node)*/startFragment, docFrag.firstChild);
    docFrag.appendChild(/*@static_cast(Node)*/endFragment);

    hasFormatting = ModernCanvas.Component.prototype.isFormattedNode(/*@static_cast(HTMLElement)*/firstElement);
    // Go up the tree cloning the parent into the docFrag until everything is cool
    while (neededParent || hasFormatting) {
        var parentNode = firstElement.cloneNode(false);
        parentNode.appendChild(/*@static_cast(Node)*/docFrag);
        docFrag = /*@static_cast(DocumentFragment)*/parentNode;
        neededParent = ModernCanvas.Component.prototype.needsParent(firstElement);
        firstElement = firstElement.parentNode;
        hasFormatting = ModernCanvas.Component.prototype.isFormattedNode(/*@static_cast(HTMLElement)*/firstElement);
    }

    root.appendChild(docFrag);
    return root;
};

ModernCanvas.Component.prototype.isFormattedNode = function (element) {
    /// <summary>Check if the given element is a formatting element.</summary>
    /// <param name="element" type="HTMLElement">node to check</param>
    /// <returns type="Boolean">true if it is a formatting element</returns>

    return ModernCanvas.Component.prototype.isNodeName(/*@static_cast(Node)*/element, "FONT", "EM", "U", "STRONG", "B", "BDI", "BDO", "I", "MARK", "PRE", "SMALL", "BIG", "SUB", "SUP", "S", "STRIKE") ||
        (ModernCanvas.Component.prototype.isNodeName(/*@static_cast(Node)*/element, "SPAN") && element.style.length > 0);
};

ModernCanvas.Component.prototype.needsParent = function (node) {
    /// <summary>Check if this node won't insert into an HTML body without its parent.</summary>
    /// <param name="node" type="Node">node to check</param>
    /// <returns type="Boolean">true if a parent node is required</returns>

    return ModernCanvas.Component.prototype.isNodeName(node, "LI", "TR", "TD", "TH", "COL", "COLGROUP", "THEAD", "TBODY", "TFOOT");
};

// Phrasing content is the text of the document, as well as elements that mark up that text at the intra-paragraph level.
// See http://www.w3.org/TR/html5.
var cannotContainPhrasingContent = {
    // HTML5
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
    // HTML 4.01
    basefont: true,
    frame: true,
    frameset: true,
    noframes: true,
    isindex: true,
    // HTML 3.2
    listing: true,
    plaintext: true,
    xmp: true
};

ModernCanvas.Component.prototype.elementCanContainPhrasingContent = function (element) {
    /// <summary>Check if this element can contain phrasing content.</summary>
    /// <param name="element" type="HTMLElement">Element to check.</param>
    /// <returns type="Boolean">true if the node can contain phrasing content.</returns>
    return Boolean(element) && Jx.isHTMLElement(element) && !cannotContainPhrasingContent[element.nodeName.toLowerCase()];
};

ModernCanvas.Component.prototype.getStyleSheetsFromDocument = function (doc) {
    /// <summary>This function queries the given document for all the style sheets and produces a string that can be inserted in another html string.
    /// This function is used in the copy to clipboard code.</summary>
    /// <param name="doc" type="Doucment">The html document to extract from</param>
    /// <returns type="String">A string of all stylesheets</returns>

    ModernCanvas.mark("ModernCanvas.getStyleSheetsFromDocument", ModernCanvas.LogEvent.start);
    var elements = doc.documentElement.querySelectorAll("style, link"),
        output = "";

    for (var i = 0, len = elements.length; i < len; i++) {
        var element = elements[i],
            href = element.href;
        if (href && (href.indexOf("/") === 0 || href.indexOf("ms-appx:") === 0)) {
            continue;
        }

        output += element.outerHTML;
    }
    ModernCanvas.mark("ModernCanvas.getStyleSheetsFromDocument", ModernCanvas.LogEvent.stop);
    return output;
};

ModernCanvas.Component.prototype.createHtmlFormat = function (htmlContent, styles) {
    /// <summary>Rewrite of Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat that use StartFragment and EndFragment comments.</summary>
    /// <param name="htmlContent" type="String">The html content to convert to CF_HTML</param>
    /// <param name="styles" type="String">Html string of style and link elements that apply to the content</param>
    /// <returns type="String">CF_HTML formated html</returns>

    var cHeader = "Version:1.0\r\nStartHTML:%08a\r\nEndHTML:%08b\r\nStartFragment:%08c\r\nEndFragment:%08d\r\n",
        cReplacements = 4,
        cReplacementLength = 8,
        cReplacementStr = "%08x",
        cHeaderLength = cHeader.length + 16, // 16 = (cReplacementLength - cReplacementStr.length) * cReplacements
        cBodyStart = "<!DOCTYPE><HTML><HEAD>" + styles + "</HEAD><BODY>",
        cBodyEnd = "</BODY></HTML>",
        cStartFragmentHTML = "<!--StartFragment -->",
        cEndFragmentHTML = "<!--EndFragment -->",
        padZeros = ModernCanvas.Component.prototype._padZeros;

    if (htmlContent.indexOf(cStartFragmentHTML) === -1) {
        if (styles.length === 0) {
            return Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlContent);
        } 

        htmlContent = cStartFragmentHTML + htmlContent + cEndFragmentHTML;
    }

    Debug.assert(((cReplacementLength - cReplacementStr.length) * cReplacements) === 16, "Header length not as expected.");
    Debug.assert(htmlContent.indexOf(cEndFragmentHTML) !== -1, "End fragment not found.");

    // Transform the string from unicode data to utf-8 data
    var utf8Content = unescape(encodeURIComponent(cBodyStart + htmlContent + cBodyEnd));

    var result = cHeader.replace("%08a", padZeros(cHeaderLength));
    result = result.replace("%08b", padZeros(cHeaderLength + utf8Content.length));
    result = result.replace("%08c", padZeros(cHeaderLength + utf8Content.indexOf(cStartFragmentHTML) + cStartFragmentHTML.length));
    result = result.replace("%08d", padZeros(cHeaderLength + utf8Content.indexOf(cEndFragmentHTML)));

    // WINBLUE: 87895 - DataPackage.setHtmlFormat doesn't want utf-8 data it wants unicode data with utf-8 positions
    return result + cBodyStart + htmlContent + cBodyEnd;
};

ModernCanvas.Component.prototype._padZeros = function (number) {
    /// <summary>Returns a zero number padded up to 8 digits</summary>
    /// <param name="number" type="Number">number to pad</param>
    /// <returns type="String">zero padded number</returns>

    return ("0000000" + String(number)).slice(-8);
};

ModernCanvas.Component.prototype.getParentElementForSelection = function (targetTagName, selectionRange) {
    /// <summary>Retrieves the first parent of specified tagName that holds the entire selection.</summary>
    /// <param name="targetTagName" type="String">The tag name for the kind of parent element to find.</param>
    /// <param name="selectionRange" type="Range" optional="true">Use this range instead of the selection range</param>
    /// <returns type="HTMLElement">Returns the requested parent element if found, null if not.</returns>

    Debug.assert(Jx.isNonEmptyString(targetTagName), "Expected valid targetTagName");

    if (!selectionRange) {
        selectionRange = this.trimRange(this.getSelectionRange());
        if (!selectionRange) {
            return null;
        }
    }

    targetTagName = targetTagName.toLowerCase();

    var startNode = /*@static_cast(HTMLElement)*/selectionRange.startContainer,
        endNode = /*@static_cast(HTMLElement)*/selectionRange.endContainer,
        selectedNode;
    // If we have a single selection simply start with it
    if (startNode === endNode && (startNode.childNodes.length === 0 || selectionRange.startOffset === selectionRange.endOffset)) {
        selectedNode = startNode;
    } else {
        // If not then we may have a complex case that we want to handle well.  Given the html:
        // <div>text1<span>text2</span>text3</div>
        // It is possible our selection falls at the bars: text1|<span>text2</span>|text3
        // In this case the commonAncestorContainer will show as the <div>, though from a UI perspective the only thing
        // highlighted is the span.  In order to allow this call to notice that the span might be the appropriate element
        // to return we need to check range overlaps of the contents of the children of the commonAncestorContainer.
        var children = selectionRange.commonAncestorContainer.childNodes;
        for (var n = children.length; n--;) {
            if (this.intersectsNode(selectionRange, children[n])) {
                // If we already found another child we care about, we need the parent
                if (selectedNode) {
                    selectedNode = /*@static_cast(HTMLElement)*/selectionRange.commonAncestorContainer;
                    break;
                } else {
                    selectedNode = children[n];
                }
            }
        }
    }

    if (Boolean(selectedNode)) {
        // Now check if the current selection is part of the requested element type
        while (Boolean(selectedNode.parentNode) && (!selectedNode.tagName || selectedNode.tagName.toLowerCase() !== targetTagName)) {
            selectedNode = selectedNode.parentNode;
        }
        if (Boolean(selectedNode.tagName) && selectedNode.tagName.toLowerCase() === targetTagName) {
            return selectedNode;
        }
    }

    return null;
};

ModernCanvas.Component.prototype.getAncestor = function (element, predicate) {
    /// <summary>Finds the first HTMLElement ancestor that meets the criteria of the predicate.</summary>
    /// <param name="predicate" type="Function">A function that takes an element and returns true or false.</param>
    /// <returns type="HTMLElement">The first ancestor that meets the criteria of the prediate.</returns>

    Debug.assert(Jx.isHTMLElement(element), "Expected element to be a valid HTMLElement");
    Debug.assert(Jx.isFunction(predicate), "Expected predicate to be a valid function");

    while (Jx.isHTMLElement(element) && !predicate(element)) {
        element = element.parentNode;
    }

    return Jx.isHTMLElement(element) ? element : null;
};

ModernCanvas.Component.prototype.getTextSearchInfo = function (includeAfter) {
    /// <summary>Creates a TextSearchInfo object that gets all text from text nodes adjacent to the cursor.</summary>
    /// <param name="includeAfter" type="Boolean">Text range to search should include the node before and after the cursor.
    /// If false only text nodes previous to the cursor are returned</param>
    /// <returns type="__ModernCanvas.ModernCanvas.TextSearchInfo">the previous selection in selection,
    /// the found text selected in searchRange, preString text before the cursor, post string text after the cursour (if requested),
    /// previousSibling is the left most sibling of the selected text.</returns>

    var selectionRange = this.getSelectionRange();
    // The range right after typing a character should be collapsed,
    // if it is not this was not from typing a character (e.g. a shortcut was being used)

    if (!selectionRange || !selectionRange.collapsed) {
        return null;
    }
    var result = {
        selection: selectionRange,
        searchRange: selectionRange.cloneRange(),
        preString: null,
        postString: null,
        previousSibling: null
    };

    // Find the node we are starting in
    var startNode = /*@static_cast(TextNode)*/result.searchRange.startContainer,
        endNode = /*@static_cast(TextNode)*/result.searchRange.endContainer,
        startOffset = result.searchRange.startOffset;

    // If the current start container is not a text node it probably contains the text node and we are sitting just beside it
    if (startNode.nodeType !== startNode.TEXT_NODE) {
        // IE bug: offset is sometimes larger than it should be!  Make sure it's small enough
        startOffset = Math.min(startOffset, startNode.childNodes.length);
        if ((startOffset > 0) && (startNode.childNodes[startOffset - 1].nodeType === startNode.TEXT_NODE)) {
            startNode = startNode.childNodes[startOffset - 1];
            endNode = startNode;
            startOffset = startNode.data.length;
        } else {
            // We were unable to find the relevant text node, so we should gracefully back out
            return null;
        }
    }

    // Remember this position for later as the node where the last character was inserted
    var insertNode = /*@static_cast(TextNode)*/startNode,
        insertOffset = startOffset;
    Debug.assert(insertNode.nodeType === insertNode.TEXT_NODE);
    // Find the range that is comprised of all contiguous text nodes starting at the beginning for the current selection and moving left
    var nextNode = /*@static_cast(TextNode)*/insertNode.previousSibling;
    result.preString = insertNode.data.substring(0, insertOffset);
    while (Boolean(nextNode) && nextNode.nodeType === nextNode.TEXT_NODE) {
        // We manually build up the search string because range.toString() and range.cloneContents() are buggy.
        result.preString = nextNode.data + result.preString;
        startNode = nextNode;
        nextNode = /*@static_cast(TextNode)*/nextNode.previousSibling;
    }
    result.previousSibling = nextNode;
    result.searchRange.setStart(/*@static_cast(Node)*/startNode, 0);

    if (includeAfter) {
        nextNode = /*@static_cast(TextNode)*/insertNode.nextSibling;
        result.postString = insertNode.data.substring(insertOffset, insertNode.data.length);
        while (Boolean(nextNode) && nextNode.nodeType === nextNode.TEXT_NODE) {
            result.postString = result.postString + nextNode.data;
            endNode = nextNode;
            nextNode = /*@static_cast(TextNode)*/nextNode.nextSibling;
        }
        result.searchRange.setEnd(/*@static_cast(Node)*/endNode, endNode.length);
    }
    return result;
};

ModernCanvas.Component.prototype.isEmpty = function (node) {
    /// <summary>Returns true if this node has no children or only contains empty text nodes.</summary>
    /// <param name="node" type="Node">node to inspect</param>
    /// <returns type="Boolean">true if the node is empty</returns>
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.length !== 0) {
        return false;
    }
    for (var i = node.childNodes.length; i--;) {
        if (node.childNodes[i].nodeType !== Node.TEXT_NODE || node.childNodes[i].length !== 0) {
            return false;
        }
    }
    return true;
};

ModernCanvas.Component.prototype.visibleContent = function (node, whiteSpaceVisible) {
    /// <summary>Returns true if this node has visible content.</summary>
    /// <param name="node" type="Node">node to inspect</param>
    /// <param name="whiteSpaceVisible" type="Boolean" optional="true">true if whitespace is visible</param>
    /// <returns type="Boolean">true if the node is not empty</returns>

    var doc = node.ownerDocument,
        iterator = doc.createNodeIterator(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, true),
        currentNode = iterator.nextNode();

    while (currentNode) {
        if (this.isNodeName(currentNode, "LI", "TD", "HR", "IMG", "INPUT", "SELECT", "EMBED", "OBJECT")) {
            return true;
        } else if (currentNode.nodeType === Node.TEXT_NODE &&
            (whiteSpaceVisible || !ModernCanvas.ModernCanvasBase.prototype._regexWhitespace.test(currentNode.nodeValue)) &&
            currentNode.nodeValue.length > 0) {
            return true;
        }
        currentNode = iterator.nextNode();
    }

    return false;
};

ModernCanvas.Component.prototype.suspendEvents = function () {
    /// <summary>Suspends event listeners to avoid unnecessary event handling.</summary>
    this.forEachChild(function (child) {
        /// <param name="child" type="ModernCanvas.Component" />
        child.suspendEvents();
    });
};

ModernCanvas.Component.prototype.resumeEvents = function () {
    /// <summary>Resumes any suspended event listeners.</summary>
    this.forEachChild(function (child) {
        /// <param name="child" type="ModernCanvas.Component" />
        child.resumeEvents();
    });
};

ModernCanvas.Component.prototype.createDataPackageFromSelection = function (doc) {
    /// <summary>Creates a DataPackage object from the currently-selected range in the given document.</summary>
    /// <param name="doc" type="Document">The document from which the selection should be retrieved</param>
    /// <returns name="Windows.ApplicationModel.DataTransfer.DataPackage">The prepared DataPackage object, or null if the selection was empty.</returns>
    ModernCanvas.mark("createDataPackageFromSelection", ModernCanvas.LogEvent.start);

    Debug.assert(Jx.isObject(doc));

    // If there is no selection there's nothing more we can do
    var range = this.getDocumentSelectionRange(doc);
    if (!range || range.collapsed) {
        ModernCanvas.mark("createDataPackageFromSelection", ModernCanvas.LogEvent.stop);
        return null;
    }

    var clipboardContent = new Windows.ApplicationModel.DataTransfer.DataPackage(),

        // Strip it down to just the actual fragment and fixup any missing parents
        node = ModernCanvas.Component.prototype.cloneContentsWithParents(range),

        // Get the content for bulk conversion
        htmlContent = node.innerHTML,
        styles = ModernCanvas.Component.prototype.getStyleSheetsFromDocument(doc);

    clipboardContent.properties.applicationName = window.location.href;
    var constructedContent = document.createElement("div");
    constructedContent.innerHTML = window.toStaticHTML(htmlContent);

    var RandomAccessStreamReference = Windows.Storage.Streams.RandomAccessStreamReference,
        Uri = Windows.Foundation.Uri,
        resMap = clipboardContent.resourceMap,
        images = constructedContent.querySelectorAll("img");
    for (var n = images.length; n--;) {
        var src = images[n].src;
        if (Jx.isNonEmptyString(src)) {
            var uri = new Uri(src);
            if (uri.schemeName === "ms-appdata") {
                resMap[src] = RandomAccessStreamReference.createFromUri(uri);
            }
        }
    }

    clipboardContent.setHtmlFormat(ModernCanvas.Component.prototype.createHtmlFormat(htmlContent, styles));

    // Even after clearing the style element text, IE will still claim there is a *double* carriage return
    // in between every block element.  To correct this we cut them down to single carriage returns.
    if (Jx.isNonEmptyString(constructedContent.innerText)) {
        // Style elements can apear at in the selected content if the user used Ctrl-A to select all
        // These elements are incorrectly turning into text.  This is a work around to remove them.
        // The risk here is style elements may get removed and cause text to be reordered or to appear/disappear
        // because of the change in CSS rules.  But not clearing out the style elements leaves what the user
        // would consider garbage at the top of their clipboard
        var styleElements = constructedContent.querySelectorAll("style");
        for (var styleIndex = 0, maxStyleIndex = styleElements.length; styleIndex < maxStyleIndex; ++styleIndex) {
            styleElements[styleIndex].innerText = "";
        }
        clipboardContent.setText(constructedContent.innerText.replace(/\r\n\r\n/g, "\r\n"));
    }

    ModernCanvas.mark("createDataPackageFromSelection", ModernCanvas.LogEvent.stop);

    return clipboardContent;
};

ModernCanvas.Component.prototype._pxToPtRatio = 1 / 0.75;

var regexFakeFontNames = /["']Color Emoji["'],?/g;
ModernCanvas.removeFakeFontNames = function (string) {
    /// <summary>Removes any fake font names from a comma-delimited list of fonts</summary>
    /// <param name="string" type="String">The string from which to remove fake font names</param>
    /// <returns type="String">The provided string with any fake font names removed</returns>
    Debug.assert(Jx.isString(string));
    return string.replace(regexFakeFontNames, "");
};

ModernCanvas.ContentDestination = {
    internal: "internal",   // The content of the canvas will be stored internally in the current application (i.e. a draft).
    external: "external",   // The content of the canvas will be sent directly to an external application.
    clipboard: "clipboard", // The content of the canvas will be put on the clipboard.
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
        "_begin": ",StartTA,ModernCanvas",
        "_end": ",StopTA,ModernCanvas"
    }
};

ModernCanvas.mark = function (eventName, eventType) {
    /// <summary>Log function for the Modern Canvas profiler marks.</summary>
    /// <param name="eventName" type="String">ETW event name</param>
    /// <param name="eventType" type="ModernCanvas.LogEvent" optional="true">enum for start/stop/info/etc.</param>
    Jx.mark("ModernCanvas." + eventName + (ModernCanvas.LogEvent.toProfilerMarkString[eventType] || ""));
};

//
// Copyright (C) Microsoft. All rights reserved.
//

// TODO: use Jx.delayDefine

/*global ModernCanvas,Debug,Jx,MSApp,WinJS,Windows,URL */
/*jshint browser:true*/
(function () {

    ModernCanvas.ModernCanvasBase = /*@constructor*/function (iframeElement, options) {
        /// <summary>Constructs a new Modern Canvas control.</summary>
        /// <param name="iframeElement" type="HTMLElement">The iframe element that will host the Modern Canvas control.</param>
        /// <param name="options" type="__ModernCanvas.ModernCanvas.Options" optional="true">A property bag of any valid options.</param>
        ModernCanvas.mark("ctor", ModernCanvas.LogEvent.start);

        // The iframeElement will be transformed to look something like this:
        // <iframe - iframeElement>
        //     <body>
        //         <div - body (actual content)>
        //         <div - spacer (assists spell-checking)>
        //     </body>
        // </iframe>
        // <div - cueText>
        Debug.assert(Jx.isInstanceOf(iframeElement, HTMLIFrameElement), "Expected iframeElement to be an iframe element");
        
        Debug.Events.define(this, "beforeundoablechange", "undoablechange", "charactercountchanged", "pasteimage", "beforecommand", "command", "aftercommand", "afteractivate");
        
        var reservedPluginNames = ["autoReplaceManager", "autoResize", "commandManager", "contextMenuManager", "hyperlinkManager", "shortcutManager"];
        
        ModernCanvas.Component.call(this);

        // Initialize all parameters
        this._iframeElement = iframeElement;
        this._iframeDocument = iframeElement.contentDocument;

        var className = "default",
            _components = {};
        if (options) {
            var keys = Object.keys(options);
            for (var m = keys.length; m--;) {
                var /*@dynamic*/value = options[keys[m]];
                switch (keys[m]) {

                    case "className":
                        Debug.assert(Jx.isString(value));
                        className = value.toLowerCase();
                        break;

                    case "autoReplaceManager":
                        Debug.assert(Jx.isObject(value));
                        _components.autoReplaceManager = value;
                        break;

                    case "autoResize":
                        Debug.assert(Jx.isObject(value));
                        _components.autoResize = value;
                        break;

                    case "commandManager":
                        Debug.assert(Jx.isObject(value));
                        _components.commandManager = value;
                        break;

                    case "contextMenuManager":
                        Debug.assert(Jx.isObject(value));
                        _components.contextMenuManager = value;
                        break;

                    case "hyperlinkManager":
                        Debug.assert(Jx.isObject(value));
                        _components.hyperlinkManager = value;
                        break;

                    case "logFunction":
                        Debug.assert(Jx.isFunction(value));
                        this._logFunction = value;
                        break;

                    case "pasteMaxImageSize":
                        Debug.assert(Jx.isValidNumber(value));
                        this._maxImageSize = value;
                        // If the new max value is non-zero
                        if (value) {
                            this._maxImageSizeString = String(value) + "px";
                        } else {
                            this._maxImageSizeString = "";
                        }                        
                        break;

                    case "shortcutManager":
                        Debug.assert(Jx.isObject(value));
                        _components.shortcutManager = value;
                        break;

                    case "delayActivation":
                        this._delayActivation = value;
                        break;

                    case "plugins":
                        Debug.assert(Jx.isObject(value));
                        var pluginNames = Object.keys(value);
                        for (var i = pluginNames.length; i--;) {
                            Debug.assert(reservedPluginNames.indexOf(pluginNames[i]) === -1);
                            Debug.assert(Jx.isObject(value[pluginNames[i]]));
                            _components[pluginNames[i]] = value[pluginNames[i]];
                        }
                        break;
                }
            }
        }

        // Get/Set the ID
        if (!iframeElement.id) {
            iframeElement.id = "modernCanvas" + Jx.uid().toString();
        }
        this._id = iframeElement.id;

        var hostDocument = iframeElement.ownerDocument,
            iframeDocument = this._iframeDocument,
            iframeBodyElement = iframeDocument.body,
            iframeParentElement = iframeElement.parentNode;

        // Format the main Canvas Element
        iframeParentElement.classList.add("modernCanvas-container");
        iframeElement.classList.add("modernCanvas-frame");
        iframeBodyElement.classList.add("modernCanvas");
        
        // add default authoring fonts
        Jx.DynamicFont.insertAuthoringFontFamilyRule("html, body.modernCanvas", iframeDocument);

        // Make sure that Shift+Tab jumps past the <body> of the iframe.
        iframeBodyElement.tabIndex = -1;

        // Format the Cue Text element
        var cueElement = hostDocument.createElement("div");
        cueElement.classList.add("modernCanvas-cueText");
        cueElement.classList.add("authoringFontFamilyClass");

        // This gets past Blue: 221272, where narrator would say
        // the cue text is uneditable, and never fire a focus event
        cueElement.setAttribute("contentEditable", "true");

        this._cueElement = cueElement;
        iframeElement.parentNode.appendChild(cueElement);

        // Format the anchor element
        var anchorElement = hostDocument.createElement("div");
        anchorElement.classList.add("modernCanvas-anchor");
        this._anchorElement = anchorElement;
        iframeElement.parentNode.appendChild(anchorElement);

        // Create HTML loading/unloading spaces
        this._bufferArea = iframeDocument.createElement("div");
        this._loadedBufferArea = iframeDocument.createElement("div");
        this._loadedBufferArea.style.display = "none";
        iframeBodyElement.appendChild(this._loadedBufferArea);

        // Format the content/body element
        var body = iframeDocument.createElement("div");
        body.classList.add("modernCanvas-content");
        body.classList.add("modernCanvas-visible");
        body.contentEditable = "true";
        // Add automation ID for test purposes
        body.id = "modernCanvasContent";
        body.setAttribute("role", "textbox");
        body.setAttribute("spellcheck", "true");
        var minHeight = iframeParentElement.currentStyle.minHeight;
        if (minHeight !== "none" && minHeight !== "auto") {
            iframeElement.style.minHeight = minHeight;
        }
        // Move any properties down needed to maintain proper accessibility
        var propertiesToMove = ["aria-describedby", "aria-label", "aria-labelledby", "aria-required"],
            propertyName,
            propertyValue;
        for (var n = propertiesToMove.length; n--;) {
            propertyName = propertiesToMove[n];
            propertyValue = iframeParentElement.getAttribute(propertyName);
            if (propertyValue) {
                iframeParentElement.removeAttribute(propertyName);
                body.setAttribute(propertyName, propertyValue);
            }
        }
        this._body = body;
        iframeBodyElement.appendChild(body);

        // Initialize Components
        if (!_components.autoReplaceManager) {
            _components.autoReplaceManager = new ModernCanvas.AutoReplaceManager();
        }
        if (!_components.commandManager) {
            _components.commandManager = new ModernCanvas.CommandManager(className, this);
        }
        if (!_components.contextMenuManager) {
            _components.contextMenuManager = new ModernCanvas.ContextMenuManager(className);
        }
        if (!_components.hyperlinkManager) {
            _components.hyperlinkManager = new ModernCanvas.HyperlinkManager(className);
        }
        if (!_components.shortcutManager) {
            _components.shortcutManager = new ModernCanvas.ShortcutManager(className);
        }
        // TODO: Get rid of circular dependency
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        if (!_components.autoResize) {
            _components.autoResize = new ModernCanvas.Plugins.AutoResize();
        }
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        this.components = _components;

        for (var componentName in this.components) {
            var component = /*@static_cast(Jx.TreeNode)*/this.components[componentName];
            if (component.getParent) {
                this.appendChild(component);
            }
        }

        // Bind prototype functions
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

        // Replace commands in commandManager
        var commandManager = _components.commandManager;
        // Because paste is async, we need to handle undo ourselves, so we set undoable: false.
        commandManager.setCommand(new ModernCanvas.Command("paste", this._paste, { undoable: false }));
        var copyCommand = commandManager.getCommand("copy");
        if (copyCommand) {
            this._copy = this._copy.bind(this);
            copyCommand.run = this._copy;
        }
        var cutCommand = commandManager.getCommand("cut");
        if (cutCommand) {
            this._cut = this._cut.bind(this);
            cutCommand.run = this._cut;
        }

        this._queuedInsertions = [];
        this._srcToBlobUrlTable = {};
        this._srcToStreamTable = {};

        // As of IE 10, the focus events coming from a mouse focus or keyboard focus look the same.  We therefore
        // listen for keydown/up events to mark if selection should be used.
        hostDocument.addEventListener("keydown", this._markSavedSelectionValid, false);
        hostDocument.addEventListener("keyup", this._markSavedSelectionInvalid, false);
        this.addEventListener("beforedeactivate", this._saveSelection, false);
        this.addEventListener("focus", this._onFocus, false);
        iframeElement.addEventListener("focus", this._onIframeFocus, false);
        window.addEventListener("resize", this._onWindowResize, false);

        // Attach listeners for the cue element
        cueElement.addEventListener("dragover", this._cueElementDragOver, false);
        cueElement.addEventListener("drop", this._cueElementDrop, false);
        cueElement.addEventListener("focus", this._cueElementFocus, false);

        // Attach Components
        iframeDocument.addEventListener("mscontrolselect", _components.hyperlinkManager.onClick, false);
        iframeDocument.addEventListener("click", _components.hyperlinkManager.onClick, false);
        Jx.addListener(this, "command", _components.commandManager.onCommand, _components.commandManager);
        iframeDocument.addEventListener("contextmenu", _components.contextMenuManager.onContextMenu, false);
        iframeDocument.addEventListener("keydown", this._onKeyDown, false);
        iframeDocument.addEventListener("keydown", this._recordKey, true);
        iframeDocument.addEventListener("keyup", _components.autoReplaceManager.onKeyUp, false);
        iframeDocument.addEventListener("keypress", this._preventInvalidKeystroke, true);

        // If not instructed to wait, attach remaining events that could get fired by programatic insertions
        if (!this._delayActivation) {
            this.activate();
        }
        ModernCanvas.mark("ctor", ModernCanvas.LogEvent.stop);
    };

    Jx.inherit(ModernCanvas.ModernCanvasBase, ModernCanvas.Component);

    var proto = ModernCanvas.ModernCanvasBase.prototype;

    proto._activated = false;

    proto._addEmptyLinesForTables = function () {
        /// <summary>Adds an empty line above or below a table so the cursor can be placed more easily.</summary>
        var firstChild = this._body.firstChild;
        // Skip past any text nodes or inline elements.
        while (firstChild && !this.isBlockElement(firstChild)) {
            firstChild = firstChild.nextSibling;
        }
        // Find the inner-most <div> or <p>, which corresponds to the first line. 
        while (this.isNodeName(firstChild, "DIV", "P") && this.isNodeName(firstChild.firstChild, "DIV", "P")) {
            firstChild = firstChild.firstChild;
        }
        if (Jx.isHTMLElement(firstChild) && (this.isNodeName(firstChild, "TABLE") || firstChild.querySelector("TABLE"))) {
            // There is a table on the first line. Add an empty line above the table.
            this._body.insertBefore(this._createEmptyLine(), this._body.firstChild);
        }

        var lastChild = this._body.lastChild;
        // Skip past any text nodes or inline elements.
        while (lastChild && !this.isBlockElement(lastChild)) {
            lastChild = lastChild.previousSibling;
        }
        // Find the inner-most <div> or <p>, which corresponds to the last line. 
        while (this.isNodeName(lastChild, "DIV", "P") && this.isNodeName(lastChild.lastChild, "DIV", "P")) {
            lastChild = lastChild.lastChild;
        }
        if (Jx.isHTMLElement(lastChild) && (this.isNodeName(lastChild, "TABLE") || lastChild.querySelector("TABLE"))) {
            // There is a table on the last line. Add an empty line below the table.
            this._body.appendChild(this._createEmptyLine());
        }
    };

    proto._attachBackspaceUndoListener = function () {
        this.addEventListener("selectionchange", this._backspaceUndoListener, false);
        this.addEventListener("keydown", this._backspaceUndoListener, false);
    };

    proto._backspaceUndoListener = function (e) {
        /// <summary>Handles firing the undo command when backspace is pressed immedietly after an auto replacement.</summary>
        /// <param name="e" type="Event">The selectionChange or keyDown event that occurred after the auto replacement.</param>
        ModernCanvas.mark("backspaceUndoListener", ModernCanvas.LogEvent.start);
        this.removeEventListener("selectionchange", this._backspaceUndoListener, false);
        this.removeEventListener("keydown", this._backspaceUndoListener, false);
        // If the key pressed was backspace
        if (e.keyCode === Jx.KeyCode.backspace) {
            e.preventDefault();
            Jx.raiseEvent(this, "command", { command: "undo" });
        }
        ModernCanvas.mark("backspaceUndoListener", ModernCanvas.LogEvent.stop);
    };

    proto._bufferArea = /*@static_cast(HTMLElement)*/null;

    proto._body = /*@static_cast(HTMLElement)*/null;

    proto._characterCount = /*@static_cast(Number)*/null;

    proto._completeClipboardOperation = function () {
        /// <summary>Completes actions that should be performed at the end of clipboard operations.</summary>
        ModernCanvas.mark("completeClipboardOperation", ModernCanvas.LogEvent.start);

        // Fire the aftercommand event
        this.components.commandManager.fireAfterCommand();

        // Notify that content is ready
        this._fireContentReadyIfReady();

        ModernCanvas.mark("completeClipboardOperation", ModernCanvas.LogEvent.stop);
    };

    proto._contentReadyCallback = /*@static_cast(Function)*/null;

    proto._copy = function (e) {
        /// <summary>Adds the current selection to the clipboard.</summary>
        /// <param name="e" type="Event">The event fired by another component when a command should be executed.</param>
        ModernCanvas.mark("copy", ModernCanvas.LogEvent.start);

        Debug.assert(e);
        this._copyCore();

        ModernCanvas.mark("copy", ModernCanvas.LogEvent.stop);
    };

    proto._copyCore = function () {
        /// <summary>Performs the basic operations to follow up a copy or cut.</summary>
        ModernCanvas.mark("copyCore", ModernCanvas.LogEvent.start);

        // Attempt to reformat the clipboard content
        // There are several situation where the clipboard APIs may fail.  To get the best results we will try to
        // format content and put it on the clipboard.
        try {
            // Get the clipboard
            var clipboard = Windows.ApplicationModel.DataTransfer.Clipboard,
                newContent,
                // We use the iframe selection range, because we want copy to work in the IRM quoted body too.
                range = this.getIframeSelectionRange();

            Debug.assert(!range.collapsed, "Can't copy a collapsed Range.");

            // Need to inline the styles because we're about to clone everything outside the document.
            this._inlineStyles(this.getElementFromNode(range.commonAncestorContainer).parentNode);
            // fixup any missing parents
            var node = this.cloneContentsWithParents(range),
                delocalizedElement = this._delocalizeHTML(node, ModernCanvas.ContentDestination.clipboard);
            // Create a new package
            newContent = new Windows.ApplicationModel.DataTransfer.DataPackage();
            // Record the package this came from
            newContent.properties.applicationName = window.location.href;
            // Set the html
            var styles = this.getStyleSheetsFromDocument(range.commonAncestorContainer.ownerDocument);
            newContent.setHtmlFormat(this.createHtmlFormat(delocalizedElement.innerHTML, styles));
            // Generate the just text version
            var styleElements = delocalizedElement.querySelectorAll("style");
            for (var m = styleElements.length; m--;) {
                styleElements[m].innerText = "";
            }
            // Even after clearing the style element text, IE will still claim there is a *double* carriage return
            // in between every block element.  To correct this we cut them down to single carriage returns.
            var textContent = delocalizedElement.innerText.replace(this._regexDoubleCarriageReturn, "\r\n");
            if (textContent) {
                newContent.setText(textContent);
            }
            // Tack on any image references that may be needed
            var RandomAccessStreamReference = Windows.Storage.Streams.RandomAccessStreamReference,
                Uri = Windows.Foundation.Uri,
                resMap = newContent.resourceMap,
                images = delocalizedElement.querySelectorAll("img"),
                src,
                stream,
                streamRef;
            for (var n = images.length; n--;) {
                src = images[n].src;
                // Pasted images are stored in our srcToStreamTable, so check if we already have a stream for this image.
                stream = this._srcToStreamTable[src];
                if (stream) {
                    Debug.assert(new Uri(src).schemeName === "blob", "Expected any image in the _srcToStreamTable to have a blob: URL.");
                    streamRef = RandomAccessStreamReference.createFromStream(stream);
                    resMap[src] = streamRef;
                } else if (Jx.isNonEmptyString(src)) {
                    // If the image was already present in the original HTML from the host app (e.g. an email reply body) then the image src will be an ms-appdata:// URL.
                    var uri = new Uri(src);
                    if (uri.schemeName === "ms-appdata") {
                        resMap[src] = RandomAccessStreamReference.createFromUri(uri);
                    }
                }
            }

            // Set the new clipboard content
            clipboard.setContent(newContent);
        } catch (ex) {
            this._logFunction(ex);
        }
        ModernCanvas.mark("copyCore", ModernCanvas.LogEvent.stop);
    };

    proto._createEmptyLine = function () {
        /// <summary>Creates an HTMLElement representing an empty line.</summary>
        var div = this.getDocument().createElement("div");
        div.innerHTML = "<br>";
        return div;
    };

    proto._cueElement = /*@static_cast(HTMLElement)*/null;

    proto._cueElementDragOver = function (e) {
        /// <summary>Handles behavior for dragging over the cue text.</summary>
        /// <param name="e" type="Event">The dragover event.</param>
        // Used to enable drag drop
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = "move";
        return false;
    };

    proto._cueElementDrop = function (e) {
        /// <summary>Handles behavior for dropping on the cue text.</summary>
        /// <param name="e" type="Event">The dragover event.</param>
        // Drop the text to the beginning of the canvas.  Right now we only attempt to move text as IE does not support html.
        this.addContent(e.dataTransfer.getData("text"), ModernCanvas.ContentFormat.text, ModernCanvas.ContentLocation.start, true);
        return false;
    };

    proto._cueElementFocus = function (e) {
        /// <summary>Handles behavior for sending focus to the cue text.</summary>
        /// <param name="e" type="Event">The focus event.</param>
        e.preventDefault();
        this.focus();
    };

    proto._cueText = "";

    proto._cut = function (e) {
        /// <summary>Adds the current selection to the clipboard.</summary>
        /// <param name="e" type="Event">The event fired by another component when a command should be executed.</param>
        ModernCanvas.mark("cut", ModernCanvas.LogEvent.start);
        Debug.assert(e);

        // Run our core copy functionality
        this._copyCore();

        // Then remove contents
        this._iframeDocument.execCommand("delete");

        ModernCanvas.mark("cut", ModernCanvas.LogEvent.stop);
    };

    proto._delayActivation = false;

    proto._commentOutStyles = function (inputElement) {
        /// <summary>Comments out the text contents of all style elements to hide them from older browsers.</summary>
        /// <param name="inputElement" type="HTMLElement">The element that contains style elements</param>
        var styleElements = inputElement.querySelectorAll("style");
        for (var m = styleElements.length; m--;) {
            var styleElement = /*@static_cast(HTMLElement)*/styleElements[m],
                innerHTML = styleElement.innerHTML;
            styleElement.innerHTML = "";
            styleElement.appendChild(this._iframeDocument.createComment(innerHTML.replace(this._regexCommentTags, "")));
        }
    };

    proto._delocalizeHTML = function (inputElement) {
        /// <summary>Reverses the effects of the _localizeHTML function.</summary>
        /// <param name="inputElement" type="HTMLElement">The element to localize.</param>
        /// <returns type="HTMLElement">A cloned HTML element that contains the delocalized HTML.</returns>
        ModernCanvas.mark("delocalizeHTML", ModernCanvas.LogEvent.start);

        // Inline the styles before cloning so they inherit any CSS styles from their parent document.
        this._inlineStyles(inputElement);

        inputElement = /*@static_cast(HTMLElement)*/this.discardableClone(/*@static_cast(Node)*/inputElement, true);

        Debug.assert(inputElement.querySelectorAll("style").length === 0, "Expected all <style> elements to be in the <head>");

        ModernCanvas.mark("delocalizeHTML", ModernCanvas.LogEvent.stop);
        return inputElement;
    };

    proto._inlineStyles = function (element) {
        /// <summary>Applies the current styles as style attributes to select elements</summary>
        /// <param name="element" type="HTMLElement">element will be used as the root to style</param>
        ModernCanvas.mark("inlineStyles", ModernCanvas.LogEvent.start);

        var inlineStyles = {
            blockquote: ["marginBottom", "marginTop"],
            ol: ["marginBottom", "marginTop", "listStyleType", "paddingBottom", "paddingTop"],
            ul: ["marginBottom", "marginTop", "listStyleType", "paddingBottom", "paddingTop"]
        };

        // Iterate over all elements, push their styles inline.
        var elementNames = Object.keys(inlineStyles),
            m;
        ModernCanvas.mark("inlineStyles.inlineStyles", ModernCanvas.LogEvent.start);
        for (m = elementNames.length; m--;) {

            var styles = /*@static_cast(Array)*/inlineStyles[elementNames[m]],
                elements = element.getElementsByTagName(elementNames[m]);

            for (var i = elements.length; i--;) {
                for (var j = styles.length; j--;) {
                    elements[i].style[styles[j]] = elements[i].currentStyle[styles[j]];
                }
            }
        }
        ModernCanvas.mark("inlineStyles.inlineStyles", ModernCanvas.LogEvent.stop);
        // Iterate over all inline styled elements, making sure to clear currentColor (which most external clients will not support)
        ModernCanvas.mark("inlineStyles.currentColor", ModernCanvas.LogEvent.start);
        var styledElements = element.querySelectorAll("[style*='currentColor']"),
            elementStyle;
        for (m = styledElements.length; m--;) {
            elementStyle = /*@static_cast(Style)*/styledElements[m].style;
            for (var n = elementStyle.length; n--;) {
                if (styledElements[m].style[elementStyle[n]] === "currentColor") {
                    styledElements[m].style[elementStyle[n]] = "Black";
                }
            }
        }
        ModernCanvas.mark("inlineStyles.currentColor", ModernCanvas.LogEvent.stop);
        ModernCanvas.mark("inlineStyles", ModernCanvas.LogEvent.stop);
    };

    proto._fireContentReadyIfReady = function () {
        /// <summary>Checks if the content is ready to fetch/modify and if so fires the content ready callback (if defined).</summary>
        if (this.isContentReady() && Boolean(this._contentReadyCallback)) {
            this._contentReadyCallback();
            this._contentReadyCallback = null;
        }
    };

    proto._focus = function () {
        /// <summary>Sends focus to the editable region of the Modern Canvas.</summary>
        ModernCanvas.mark("focus", ModernCanvas.LogEvent.start);
        // Before moving focus, record the current scroll position of the parent scrolling element
        ModernCanvas.mark("focus.saveInformation", ModernCanvas.LogEvent.start);
        var scrollableElement = this.getScrollableElement(),
            currentScrollPositionTop = scrollableElement.scrollTop,
            currentScrollPositionLeft = scrollableElement.scrollLeft;
        this._markSavedSelectionValid();
        ModernCanvas.mark("focus.saveInformation", ModernCanvas.LogEvent.stop);
        ModernCanvas.mark("focus.DOMFocus", ModernCanvas.LogEvent.start);
        // Don't use this._body.focus() because it causes IE to scroll our app. Restoring the selection has the side-effect of 
        // setting focus to this._body without any major scrolling issues.
        this._restoreSelection();
        ModernCanvas.mark("focus.DOMFocus", ModernCanvas.LogEvent.stop);
        // Finally, restore the original scroll position to the parent scrolling element, so that
        // the Canvas will not have been scrolled more into view than needed.
        ModernCanvas.mark("focus.restoreScrollPosition", ModernCanvas.LogEvent.start);
        scrollableElement.scrollTop = currentScrollPositionTop;
        scrollableElement.scrollLeft = currentScrollPositionLeft;
        ModernCanvas.mark("focus.restoreScrollPosition", ModernCanvas.LogEvent.stop);
        ModernCanvas.mark("focus", ModernCanvas.LogEvent.stop);
    };

    proto.getScrollableElement = function () {
        /// <summary>Finds and returns the first ancestor of the Modern Canvas that scrolls.</summary>
        if (Jx.isNullOrUndefined(this._scrollableElement)) {
            this._scrollableElement = this.getAncestor(this._iframeElement, function (element) {
                var overflowY = element.currentStyle.overflowY;
                return overflowY === "scroll" || overflowY === "auto";
            });

            Debug.assert(this._scrollableElement, "Expected to find ancestor of Modern Canvas iframe with overflow scroll or auto");
        }

        return this._scrollableElement;
    };

    proto._hideCueText = function () {
        /// <summary>Hides the cue text from view.</summary>
        ModernCanvas.mark("hideCueText", ModernCanvas.LogEvent.start);
        // Handle blurring the cue text
        Debug.assert(this._cueElement);
        this._cueElement.setAttribute("aria-hidden", "true");
        ModernCanvas.mark("hideCueText", ModernCanvas.LogEvent.stop);
    };

    proto._iframeDocument = /*@static_cast(Document)*/null;

    proto._iframeElement = /*@static_cast(HTMLElement)*/null;

    proto._imgReference = /*@static_cast(HTMLElement)*/null;

    proto._internalActivate = function () {
        /// <summary>Completes the internal portion of the ModernCanvas activation.</summary>
        ModernCanvas.mark("internalActivate", ModernCanvas.LogEvent.start);

        if (!this._internalActivated) {
            // Attach listeners that could be triggered by programatic insertions
            this.clearUndoRedo();

            Jx.addListener(this, "beforeundoablechange", this._onBeforeUndoableChange, this);
            Jx.addListener(this, "undoablechange", this._onUndoableChange, this);
            this.addEventListener("mscontrolresizestart", this._releaseImageRestriction, false);

            this.forEachChild(function (child) {
                /// <param name="child" type="Jx.Component" />
                child.activateUI();
            });

            // Actually set the cue text
            this.setCueText(this._queuedCueText);

            this._internalActivated = true;
        }

        ModernCanvas.mark("internalActivate", ModernCanvas.LogEvent.stop);
    };

    proto._internalActivated = false;

    proto._internalDeactivate = function () {
        /// <summary>Completes the internal portion of the ModernCanvas activation.</summary>
        ModernCanvas.mark("internalDeactivate", ModernCanvas.LogEvent.start);

        if (this._internalActivated) {
            // Keep cue text, but turn it off for now so we can fully deactivate
            this._queuedCueText = this._cueText;
            this.setCueText("");

            this.forEachChild(function (child) {
                /// <param name="child" type="Jx.Component" />
                child.deactivateUI();
            });

            // Remove listeners that will be added in activation
            this.removeEventListener("mscontrolresizestart", this._releaseImageRestriction, false);
            Jx.removeListener(this, "beforeundoablechange", this._onBeforeUndoableChange, this);
            Jx.removeListener(this, "undoablechange", this._onUndoableChange, this);
            this._scrollableElement = null;

            this._internalActivated = false;
        }

        ModernCanvas.mark("internalDeactivate", ModernCanvas.LogEvent.stop);
    };

    proto._keepSelection = false;

    proto._lastKeyDown = /*@static_cast(String)*/null;

    proto._loadedBufferArea = /*@static_cast(HTMLElement)*/null;

    proto._localizeFromDataPackage = function (range, baseUri, urlToStreamMap) {
        /// <summary>Modifies incoming HTML from a DataPackage to properly render in the Modern Canvas.</summary>
        /// <param name="range" type="Range">The Range object covering the area to process.</param>
        /// <param name="baseUri" type="Windows.Foundation.Uri">The base URI to apply to relative references.</param>
        /// <param name="urlToStreamMap" type="Object">The map to use to retrieve streams for image references.</param>
        ModernCanvas.mark("localizeFromDataPackage", ModernCanvas.LogEvent.start);

        // Get and iterate through all elements we may care about
        var commonAncestor = this.getElementFromNode(range.commonAncestorContainer),
            imgElements = commonAncestor.querySelectorAll("img"),
            img,
            regexAbsoluteUrl = this._regexAbsoluteUrl,
            stream;
        for (var i = 0, len = imgElements.length; i < len; i++) {
            img = /*@static_cast(HTMLElement)*/imgElements[i];
            if (!this.intersectsNode(range, /*@static_cast(Node)*/img)) {
                continue;
            }

            var imageSrc = img.getAttribute("src");
            // If the source is in the dataMap
            stream = urlToStreamMap[imageSrc];
            if (stream && stream.size > 0) {
                // If we've already seen this img before, we can just reuse the blob URL
                var blobUrl = this._srcToBlobUrlTable[imageSrc];
                if (blobUrl) {
                    img.src = blobUrl;
                } else {
                    // Create a blob for the image
                    var streamContentType = this._getContentTypeFromFileName(imageSrc);
                    var blob = MSApp.createBlobFromRandomAccessStream(streamContentType, stream);
                    blobUrl = URL.createObjectURL(stream, { oneTimeOnly: false });
                    img.src = blobUrl;

                    // Now, regardless of previous state, save off the new url for future loaded images
                    this._srcToBlobUrlTable[imageSrc] = blobUrl;

                    // Save Object url for cleanup later
                    this._objectUrls.push(blobUrl);

                    // Fire _onPasteImage with the new blob
                    this._onPasteImage(blob, blobUrl, stream);
                }
            } else if (Boolean(baseUri) && !regexAbsoluteUrl.test(img.src)) {
                // Else if the image is a relative URL, augment with the base URL
                img.src = baseUri.combineUri(img.src).absoluteUri;
            }
            
            this._constrainMaxImageSize(img);
            img.tabIndex = -1;
        }

        ModernCanvas.mark("localizeFromDataPackage", ModernCanvas.LogEvent.stop);
    };

    proto._fileExtensionToContentTypeMap = {
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

    proto._getContentTypeFromFileName = function (fileName) {
        /// <summary> 
        /// Returns the content type of a file based on the extension. Will return "undefined" if the
        /// extension is unknown
        /// </summary>
        /// <param name="fileName" type="String"> Filename with extension </param>
        Debug.assert(Jx.isNonEmptyString(fileName));
        var index = fileName.lastIndexOf(".");
        if (index >= 0) {
            var extension = fileName.substring(index, fileName.length);
            return this._fileExtensionToContentTypeMap[extension.toLowerCase()];
        } else {
            return "undefined";
        }
    };

    proto._constrainMaxImageSize = function (img) {
        /// <summary>Constrains images to a certain maxHeight/maxWidth to avoid them becoming so large they require scrolling.</summary>

        // We use the CSS rules max-height and max-width to constrain image sizes, but the max for each dimension is applied 
        // individually without regard for the aspect ratio. This means that if one dimension is smaller than the max 
        // (e.g. 256px) and one dimension is larger than the max (e.g. 1024px), only the larger dimension will be scaled down. 
        // This causes the image to look squished. To avoid changing the aspect ratio, if we know that both dimensions are not
        // constrained to our maximum we apply the max-height and max-width styles and remove any height and width styles.

        var computedStyle = getComputedStyle(img),
            computedMaxHeight = computedStyle.maxHeight,
            computedMaxWidth = computedStyle.maxWidth,
            computedHeight = computedStyle.height,
            computedWidth = computedStyle.width,
            currentStyle = img.currentStyle,
            px = "px",
            maxImageSize = this._maxImageSize,
            imageConstrainedDim = { height: false, width: false },
            checkIfAlreadyConstrained = function (sizeProperty, dimension) {
                /// <summary>Sets imageConstrainedDim[dimension] to true if the given sizeProperty is smaller than the max image size.</summary>
                /// <param name="sizeProperty" type="String">A string representing an image size in pixels.</param>
                /// <param name="dimension" type="String">The dimension we're testing.</param>
                Debug.assert(Jx.isNonEmptyString(sizeProperty));
                Debug.assert(imageConstrainedDim.hasOwnProperty(dimension));
                var size = Number(sizeProperty.replace(px, ""));
                if (Jx.isValidNumber(size) && size < maxImageSize) {
                    imageConstrainedDim[dimension] = true;
                }
            };

        Debug.assert(computedMaxHeight === "none" || (computedMaxHeight.length > px.length && computedMaxHeight.lastIndexOf(px) === computedMaxHeight.length - px.length), "Expected getComputedStyle to return px height");
        Debug.assert(computedMaxWidth === "none" || (computedMaxWidth.length > px.length && computedMaxWidth.lastIndexOf(px) === computedMaxWidth.length - px.length), "Expected getComputedStyle to return px width");
        Debug.assert(computedHeight === "auto" || (computedHeight.length > px.length && computedHeight.lastIndexOf(px) === computedHeight.length - px.length), "Expected getComputedStyle to return px height");
        Debug.assert(computedWidth === "auto" || (computedWidth.length > px.length && computedWidth.lastIndexOf(px) === computedWidth.length - px.length), "Expected getComputedStyle to return px width");

        if (computedMaxHeight !== "none") {
            // There is an explicit max-height specified, like <img style="max-height:256px">
            checkIfAlreadyConstrained(computedMaxHeight, 'height');
        }
        if (computedMaxWidth !== "none") {
            // There is an explicit max-width specified, like <img style="max-width:256px">
            checkIfAlreadyConstrained(computedMaxWidth, 'width');
        }

        // For checking height and width we use the currentStyle because the computedStyle doesn't tell us if the height 
        // and/or width are set to "auto".
        if (currentStyle.height !== "auto") {
            // There is an explicit height specified, like <img height="256"> or <img style="height:256px">
            checkIfAlreadyConstrained(computedHeight, 'height');
        }
        if (currentStyle.width !== "auto") {
            // There is an explicit width specified, like <img width="256"> or <img style="width:256px">
            checkIfAlreadyConstrained(computedWidth, 'width');
        }

        if (!imageConstrainedDim.width && !imageConstrainedDim.height) {
            img.style.maxWidth = this._maxImageSizeString;
            img.style.maxHeight = this._maxImageSizeString;
            img.style.removeAttribute("width");
            img.removeAttribute("width");
            img.style.removeAttribute("height");
            img.removeAttribute("height");
        }
    };

    proto._localizeHTML = function (bufferArea) {
        /// <summary>Modifies HTML in the element to properly display inside this Modern Canvas.</summary>
        /// <param name="bufferArea" type="HTMLElement">The HTML element containing the style elements to localize.</param>
        ModernCanvas.mark("localizeHTML", ModernCanvas.LogEvent.start);

        // Remove bad elements, rewrite hrefs to navigate in the iframe correctly, set tabIndex = -1 as appropriate, and 
        // rewrite/remove title attributes.
        ModernCanvas.runWorkersSynchronously([
            new ModernCanvas.BadElementHtmlWorker(bufferArea),
            new ModernCanvas.HrefHtmlWorker(bufferArea),
            new ModernCanvas.ContentEditableTabIndexHtmlWorker(bufferArea),
            new ModernCanvas.TitleAttributeHtmlWorker(bufferArea)
        ]);

        // Strip out any styled elements that have been marked as styles only needed externally
        ModernCanvas.mark("localizeHTML.externalStyles", ModernCanvas.LogEvent.start);
        var externalStyleElements = bufferArea.querySelectorAll("[data-externalstyle]"),
            i;
        for (i = externalStyleElements.length; i--;) {
            var externalStyleElement = /*@static_cast(HTMLElement)*/externalStyleElements[i];
            // Because the dir can change dynamically, we want to make sure the dir attribute of this 
            // external style element still applies even after we remove the element itself. Right 
            // now, the dir attribute is only applied on the font wrapper element.
            var externalStyleDir = externalStyleElement.getAttribute("dir");
            if (externalStyleDir === "rtl" || externalStyleDir === "ltr") {
                this._iframeDocument.body.setAttribute("dir", externalStyleDir);
            }
            externalStyleElement.removeNode(externalStyleElement.getAttribute("data-externalstyle") === "true");
        }
        ModernCanvas.mark("localizeHTML.externalStyles", ModernCanvas.LogEvent.stop);

        // Move all the <style> elements to the <head>
        ModernCanvas.mark("localizeHTML.moveStyles", ModernCanvas.LogEvent.start);
        var styleElements = bufferArea.querySelectorAll("style"),
            head = this.getDocument().querySelector("head");
        for (i = styleElements.length; i--;) {
            var styleElement = styleElements[i];
            styleElement.classList.add("modernCanvas-contentStyle");
            // Iterate backwards to keep the <style>s in the same order and insert them at the top so any Modern Canvas styles 
            // are specified afterwards and therefore have higher precedence.
            head.insertBefore(styleElement, head.firstChild);
        }
        ModernCanvas.mark("localizeHTML.moveStyles", ModernCanvas.LogEvent.stop);

        ModernCanvas.mark("localizeHTML", ModernCanvas.LogEvent.stop);
    };

    proto._logFunction = function (/* message */) {
        /// <summary>Placeholder function to be used when ignorable errors are hit.  Can be set as a parameter at constuction time.</summary>
        /// <param name="message" type="String">The error message to report.</param>
    };

    proto._logFunctionAndReleaseClipboard = function (message) {
        /// <summary>Calls the logFunction and releases the clipboard</summary>
        /// <param name="message" type="String">The error message to report.</param>
        this._logFunction(message);
        // Complete the clipboard operation
        this._completeClipboardOperation();
    };

    proto._markSavedSelectionInvalid = function () {
        /// <summary>Marks the current saved selection as invalid.</summary>
        this._keepSelection = false;
    };

    proto._markSavedSelectionValid = function (e) {
        /// <summary>Marks the current saved selection as valid if appropriate.</summary>
        /// <param name="e" type="Event" optional="true">The keydown event prompting the selection to be marked valid.</param>
        if (!Boolean(e) || e.keyCode === Jx.KeyCode.tab) {
            this._keepSelection = true;
        }
    };

    proto._maxImageSize = 640;

    proto._maxImageSizeString = "640px";

    proto._objectUrls = [];

    proto._onIframeFocus = function () {
        /// <summary>Handles the focus event.</summary>

        var selectionRange = this.getSelectionRange();
        if (!selectionRange || this._keepSelection) {
            // If the user tabs to the iframe element from the host document or the iframe is focused programmatically (e.g. by WinJS 
            // after a flyout is closed), we want to push focus into the editable area so the user can start typing.
            this.focus();
        } else {
            // Clicking into the editable area when the iframe is not the active element doesn't activate selection correctly, so 
            // we have to re-select it.
            this.replaceSelection(selectionRange);
        }
    };

    proto._onBeforeUndoableChange = function () {
        /// <summary>Handles the beforeundoablechange event.</summary>
        ModernCanvas.mark("beforeUndoableChange", ModernCanvas.LogEvent.start);
        this._iframeDocument.execCommand("ms-beginUndoUnit");
        ModernCanvas.mark("beforeUndoableChange", ModernCanvas.LogEvent.stop);
    };

    proto._countingChars = false;

    proto._onCharacterCountChanged = function () {
        /// <summary>Fires a charactercountchanged event.</summary>
        ModernCanvas.mark("onCharacterCountChanged", ModernCanvas.LogEvent.start);
        if (this._countingChars) {
            var characterCount = this.getCharacterCount();
            if (this._characterCount !== characterCount) {
                this._characterCount = characterCount;
                Jx.raiseEvent(this, "charactercountchanged", { characterCount: characterCount });
            }
        }
        ModernCanvas.mark("onCharacterCountChanged", ModernCanvas.LogEvent.stop);
    };

    proto._onFocus = function () {
        /// <summary>Handles the focus event.</summary>
        this._restoreSelection();
    };

    proto._onKeyDown = function (e) {
        /// <summary>Delegates the keydown event to components that need it.</summary>
        /// <param name="e" type="TextEvent">An event representing that a key has been pressed down.</param>
        ModernCanvas.mark("onKeyDown", ModernCanvas.LogEvent.start);
        this.components.shortcutManager.onKeyDown(e);
        if (!e.defaultPrevented) {
            // Only let the autoreplace manager handle the keydown event if the shortcut manager did not handle it.
            this.components.autoReplaceManager.onKeyDown(e);
        }
        ModernCanvas.mark("onKeyDown", ModernCanvas.LogEvent.stop);
    };

    proto._onPasteImage = function (imageBlob, imageBlobUrl, imageBlobStream) {
        /// <summary>Fires all onPasteImage listeners.</summary>
        /// <param name="imageBlob" type="Blob">The blob for the pasted image.</param>
        /// <param name="imageBlobUrl" type="String">The url used in the pasted image to point to the blob.</param>
        /// <param name="imageBlobStream" type="Windows.Storage.Streams.IRandomAccessStream">The random access stream used to power the blob.</param>
        ModernCanvas.mark("onPasteImage", ModernCanvas.LogEvent.start);
        var newEvent = {
            blob: imageBlob,
            blobUrl: imageBlobUrl,
            blobStream: imageBlobStream
        };
        Jx.raiseEvent(this, "pasteimage", newEvent);
        ModernCanvas.mark("onPasteImage", ModernCanvas.LogEvent.stop);
    };

    proto._onUndoableChange = function (e) {
        /// <summary>Handles the undoablechange event.</summary>
        /// <param name="e" type="Object">The event object associated with the undoablechange.</param>
        ModernCanvas.mark("onUndoableChange", ModernCanvas.LogEvent.start);
        this._iframeDocument.execCommand("ms-endUndoUnit");
        if (e && e.backspaceUndoable) {
            this._attachBackspaceUndoListener();
        }
        ModernCanvas.mark("onUndoableChange", ModernCanvas.LogEvent.stop);
    };

    proto._onWindowResize = function () {
        /// <summary>Handles the resize event for the window.</summary>
        // The scrollable element can change when the window resizes.
        this._scrollableElement = null;
    };

    proto._paste = function (e) {
        /// <summary>Replaces the current selection with the content from the clipboard.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        ModernCanvas.mark("paste", ModernCanvas.LogEvent.start);

        try {
            var commandManager = this.components.commandManager,
                // Determine fallback level
                pasteCommand = commandManager.getCommand("pasteFull"),
                pasteSingleImage = true;
            if (!pasteCommand) {
                pasteCommand = commandManager.getCommand("pasteContentOnly");
                if (!pasteCommand) {
                    pasteCommand = commandManager.getCommand("pasteTextOrSingleImage");
                    if (!pasteCommand) {
                        pasteCommand = commandManager.getCommand("pasteTextOnly");
                        pasteSingleImage = false;
                    }
                }
            }
            if (pasteCommand) {
                this._internalPaste(e, pasteSingleImage, pasteCommand);
            }
        } catch (error) {
            // Complete the clipboard operation
            this._logFunctionAndReleaseClipboard(error);
        }
        ModernCanvas.mark("paste", ModernCanvas.LogEvent.stop);
        return true;
    };

    proto._internalPaste = function (e, pasteSingleImage, pasteCommand) {
        var clipboard = Windows.ApplicationModel.DataTransfer.Clipboard,
            dataFormats = Windows.ApplicationModel.DataTransfer.StandardDataFormats,
            content = clipboard.getContent(),
            // If the clipboard contains an image stream for us to paste, default to assuming we will paste just the image.
            pasteStraightImage = pasteSingleImage && content.contains("EnhancedMetafile") && !content.contains(dataFormats.bitmap),
            that = this;

        (function decidePasteImageOrContent() {
            // If the clipboard also contains html
            if (pasteStraightImage && content.contains(dataFormats.html)) {
                // Fetch the html content to help make our decision
                return content.getHtmlFormatAsync();
            }
            // If we did not fetch html content, return an empty promise to continue the chain
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            return WinJS.Promise.as();
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        })().then(function decidePasteImageOrContentFromContent(htmlContent) {
            // If we fetched html content
            if (htmlContent) {
                // Strip it down to just the actual fragment
                htmlContent = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.getStaticFragment(htmlContent);
                // If the fragment is not just a single image
                that._bufferArea.innerHTML = htmlContent;
                if (that._bufferArea.children.length !== 1 || that._bufferArea.children[0].tagName !== "IMG") {
                    // Mark to not paste just the image, but the content instead
                    pasteStraightImage = false;
                }
            }

            if (pasteStraightImage) {
                // If we are pasting just a straight image
                Debug.assert(content.contains("EnhancedMetafile"));
                var dataPromise = /*@static_cast(WinJS.Promise)*/content.getDataAsync("EnhancedMetafile"),
                    contentType = "image/x-emf";
                return new WinJS.Promise(that._getPasteImageFunction(content, dataPromise, contentType));

            } else if (content.contains(dataFormats.text) && !content.contains(dataFormats.html)) {
                // Need to decide if we are handling a special text link
                return content.getTextAsync().then(function decidePasteTextLinkOrContent(textContent) {
                    if (that._isLinkText(textContent)) {
                        // It is do the paste;
                        that._pasteTextLink(textContent);
                        return WinJS.Promise.as();
                    } else {
                        return new WinJS.Promise(that._getPasteContentFunction(e, content, pasteCommand));
                    }
                });
            } else {
                // Otherwise if we are pasting full content
                return new WinJS.Promise(that._getPasteContentFunction(e, content, pasteCommand));
            }
        }).done(this._completeClipboardOperation, this._logFunctionAndReleaseClipboard);
    };

    proto._isLinkText = function (text) {
        /// <param name="text" type="String">text to match as a link</param>
        if (text.charAt(0) === "\"" && text.charAt(text.length - 1) === "\"" && !ModernCanvas.ModernCanvasBase.prototype._regexCarriageReturn.test(text)) {
            text = text.substr(1, text.length - 2);
            return ModernCanvas.ModernCanvasBase.prototype._regexAbsoluteUrl.test(text);
        }
        return false;
    };

    proto._pasteTextLink = function (text) {
        /// <param name="text" type="String">Link matching string</param>
        var range = this.getSelectionRange();
        if (!range) {
            return;
        }

        // Start undo unit. Because paste is async, it needs to handle undo manually.
        this._onBeforeUndoableChange();

        // remove the surrounding quotes
        text = text.substr(1, text.length - 2);

        range.deleteContents();
        var doc = this.getDocument(),
            anchor = doc.createElement("a");

        anchor.href = text;
        anchor.innerText = text;
        range.insertNode(/*@static_cast(Node)*/anchor);

        // Make sure the URL is safe and correct.
        ModernCanvas.runWorkersSynchronously([
            new ModernCanvas.HrefHtmlWorker(anchor.parentNode)
        ]);

        range.collapse(false);
        this.replaceSelection(range);

        // End undo unit
        this._onUndoableChange();
    };

    proto._getPasteImageFunction = function (content, dataPromise, contentType) {
        /// <param name="content" type="Windows.ApplicationModel.DataTransfer.DataPackageView">The clipboard content.</param>
        /// <param name="dataPromise" type="WinJS.Promise">A promise that will return image data.</param>
        /// <param name="contentType" type="String">The content type of the image data.</param>

        var iframeDocument = this._iframeDocument,
            that = this;

        return function (complete, error) {
            dataPromise
                .then(function (stream) {
                    /// <param name="stream" type="Windows.Storage.Streams.IRandomAccessStream">A readable stream of image data.</param>

                    // Start undo unit. Because paste is async, it needs to handle undo manually.
                    that._onBeforeUndoableChange();

                    // Create a blob for the image
                    var blob = MSApp.createBlobFromRandomAccessStream(contentType, stream);
                    var newImage = iframeDocument.createElement("img");
                    var blobUrl = window.URL.createObjectURL(blob, { oneTimeOnly: false });
                    newImage.src = blobUrl;

                    // Save Object url for cleanup later
                    that._objectUrls.push(blobUrl);

                    // Inline max width/height/tabIndex properties
                    newImage.style.maxHeight = that._maxImageSizeString;
                    newImage.style.maxWidth = that._maxImageSizeString;
                    newImage.tabIndex = -1;

                    // Insert the image into the document
                    var selectionRange = that.getSelectionRange();
                    if (selectionRange) {
                        selectionRange.deleteContents();
                        selectionRange.insertNode(/*@static_cast(Node)*/newImage);
                    }

                    // Fire _onPasteImage with the new blob
                    that._onPasteImage(blob, blobUrl, stream);

                    // End undo unit
                    that._onUndoableChange();
                })
                .done(complete, error);
        };
    };

    proto._getPasteContentFunction = function (e, content, pasteCommand) {
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">Executing command event.</param>
        /// <param name="content" type="Windows.ApplicationModel.DataTransfer.DataPackageView">Clipboard content</param>
        /// <param name="pasteCommand" type="C.Command">Editing command to execute to paste</param>

        var that = this,
            eventsSuspended = false,
            selectionRange = this.getSelectionRange().cloneRange(),
            afterPaste = function (err) {
                if (eventsSuspended) {
                    that.resumeEvents();
                }

                if (err) {
                    return WinJS.Promise.wrapError(err);
                }
                return;
            };

        return function (complete, error) {
            // Get resource map for datapackage localization
            ModernCanvas.createUrlToStreamMapAsync(content)
                .then(function (urlToStreamMap) {
                    /// <param name="urlToStreamMap" type="Object">A map from URL to RandomAccessStream.</param>
                    Debug.assert(!Jx.isNullOrUndefined(urlToStreamMap), "Expected urlToStreamMap to be non-null -- pasted images are not being processed correctly!");

                    // Start undo unit. Because paste is async, it needs to handle undo manually.
                    that._onBeforeUndoableChange();

                    var durableRange = new ModernCanvas.DurableRange(selectionRange),
                        workingRange = durableRange.range;
                    // Paste can cause a large number of DOM modification events, so we suspend all events and then resume them after paste.
                    that.suspendEvents();
                    eventsSuspended = true;

                    // Execute the paste command
                    that.replaceSelection(workingRange);
                    pasteCommand.run(e);

                    // Then make sure the selection is updated
                    workingRange = durableRange.range;
                    var commonAncestor = that.getElementFromNode(workingRange.commonAncestorContainer);

                    // Apply style localization
                    that._localizeHTML(commonAncestor);

                    // Peform list fixups
                    that._listFixUp(commonAncestor);

                    // Lists can get pasted and we want to restyle them
                    that.components.commandManager._clearListStyleType(workingRange);

                    // Illegal HTML can get pasted and we want to remove it
                    that.components.commandManager._removeIllegalPhrasingContent(workingRange);

                    // Selection can move the selection to an invalid place which will (much) later get fixed up by IE and cause side effects.
                    // By trimming the range before we collapse it we know we're in a valid location.
                    var selectRange = that.trimRange(workingRange);
                    selectRange.collapse(false);
                    that.replaceSelection(selectRange);

                    // Cleanup comments
                    durableRange.dispose();

                    // Update images with streams from the resource map.
                    if (urlToStreamMap) {
                        that._localizeFromDataPackage(workingRange, content.properties.applicationListingUri, urlToStreamMap);
                    }

                    // Make sure there is either an empty line above or below any pasted tables, as necessary.
                    that._addEmptyLinesForTables();

                    // End undo unit
                    that._onUndoableChange();
                })
                .then(afterPaste, afterPaste)
                .done(complete, error);
        };
    };

    proto._listFixUp = function (root) {
        /// <summary>Add UL to any parentless LI elements and remove illegal divs that are children of lists.</summary>
        /// <param name="root" type="HTMLElement">the node to start the fixup at</param>

        var doc = root.ownerDocument,
            listItems = root.getElementsByTagName("LI"),
            parentless = [],
            i;

        for (i = listItems.length; i--;) {
            if (!this._hasAncestor(listItems[i], "OL", "UL")) {
                parentless.push(listItems[i]);
            }
        }

        for (i = parentless.length; i--;) {
            var node = parentless[i],
                range = doc.createRange();

            range.selectNode(node);
            node = node.nextSibling;
            while (node) {
                if (this.isNodeName(node, "LI")) {
                    i--;
                    range.setEndAfter(node);
                }
                node = node.nextSibling;
            }
            range.surroundContents(/*@static_cast(Node)*/doc.createElement("UL"));
        }

        // Workaround for WinBlue:472355. IE will sometimes botch pasting an <ol>, resulting in invalid HTML and leaving behind 
        // up to four extra <li>s:
        //   <ol>
        //     <li></li>    <!-- Extra: Mistakenly added by IE -->
        //     <div>        <!-- Illegal: <ol> must contain only <li>s -->
        //       <li></li>  <!-- Extra: Mistakenly added by IE -->
        //       <li><div>Actual pasted content...</div></li>
        //       <li><div>Actual pasted content...</div></li>
        //       <li></li>  <!-- Extra: Mistakenly added by IE -->
        //     </div>
        //     <li></li>    <!-- Extra: Mistakenly added by IE -->
        //   </ol>
        var illegalDivIterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT, function (node) {
                /// <param name="node" type="Node">The given node, which we can choose to accept or skip.</param>
                return this.isNodeName(node, "DIV") && this.isNodeName(node.parentNode, "OL") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }.bind(this), true),
            illegalDiv = illegalDivIterator.nextNode();

        while (illegalDiv) {
            // Remove the extra <li>s that IE inserted, but only if they are empty.
            var extraListItems = [
                illegalDiv.previousSibling,
                illegalDiv.nextSibling,
                illegalDiv.firstChild,
                illegalDiv.lastChild
            ];
            extraListItems
                .filter(function (el) {
                    // The DurableRange used during paste inserts comments, so ignore them when calculating emptiness.
                    return this.isNodeName(el, "LI") &&
                        (el.childNodes.length === 0 || (el.childNodes.length === 1 && el.firstChild.nodeType === Node.COMMENT_NODE));
                }.bind(this))
                .forEach(function (el) {
                    el.removeNode(false);
                });

            illegalDiv.removeNode(false);
            illegalDiv = illegalDivIterator.nextNode();
        }
    };

    proto._hasAncestor = function (node, names) {
        /// <summary>determines if the given element has a parent named from the names list.</summary>
        /// <param name="node" type="Node">the node to check</param>
        /// <param name="names" type="String" parameterArray="true">the names to check</param> 
        /// <returns type="Boolean">true if the node has a parent named any of the values in names, false otherwise</returns>
        
        var args = arguments;
        while (node) {
            args[0] = node;
            if (this.isNodeName.apply(this, args)) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };

    proto._preventInvalidKeystroke = function (e) {
        /// <summary>Listener that stops keystrokes that don't match the last recorded keystroke.</summary>
        /// <param name="e" type="Event">The key event.</param>
        ModernCanvas.mark("preventInvalidKeystroke", ModernCanvas.LogEvent.start);
        // Right now we only care about blocking invalid Enter keys, though this may be loosened if we find other invalid cases.
        if (this._lastKeyDown !== e.key && e.key === "Enter") {
            e.preventDefault();
        }
        ModernCanvas.mark("preventInvalidKeystroke", ModernCanvas.LogEvent.stop);
    };

    proto._queuedCueText = /*@static_cast(String)*/null;

    proto._queuedInsertionSpellchecking = /*@static_cast(Boolean)*/null;

    proto._recordKey = function (e) {
        /// <summary>Records the key for future action.</summary>
        /// <param name="e" type="Event">The key event.</param>
        ModernCanvas.mark("recordKey", ModernCanvas.LogEvent.start);
        this._lastKeyDown = e.key;
        ModernCanvas.mark("recordKey", ModernCanvas.LogEvent.stop);
    };

    proto._regexAbsoluteUrl = /^(((?:https?|file|ftp|gopher|telnet|mailto|news|ms-appx|ms-appdata|blob|onenote):)|\\\\)/i;

    proto._regexCommentTags = /(<!--)|(-->)/g;

    proto._regexCurrentColor = /currentColor/g;

    proto._regexDeflated = /(<((?:div)|(?:p))[^<]*?>)[\r\n]*(<\/\2>)/gi;

    proto._regexDoubleCarriageReturn = /\r\n\r\n/g;

    proto._regexCarriageReturn = /[\r\n]/g;

    proto._regexDoubleQuote = /"/g;

    proto._regexQuoted = /^"([^"]*)"$/;

    proto._regexWhitespace = /^\s+$/;

    proto._releaseImageRestriction = function (e) {
        /// <summary>Releases any inlined maxHeight/Width restrictions on an image.</summary>
        /// <param name="e" type="Event">The onResizeStart event called on an html element that might be an image.</param>
        var target = e.target;
        if (target.nodeName === "IMG") {
            var computedStyle = getComputedStyle(target),
                h = computedStyle.height,
                w = computedStyle.width;
            target.removeAttribute("height");
            target.removeAttribute("width");
            target.style.removeAttribute("max-height");
            target.style.removeAttribute("max-width");
            target.style.height = h;
            target.style.width = w;
        }
    };

    proto._restoreSelection = function () {
        /// <summary>Restores the saved selection if appropriate.</summary>
        // If there is no selection that means we are coming in to the app from an outside window and
        // should use the last selection we managed to grab.
        ModernCanvas.mark("restoreSelection", ModernCanvas.LogEvent.start);

        // If the saved selection should be used
        if (this._keepSelection) {
            // If there is a saved bookmark, build our selection from that
            if (this._selectionBookmark) {
                this._selection = this._selectionBookmark.getBookmarkedRange(this._body) || this._selection;
            }
            // If there is no saved selection, create one at the beginning of the body
            if (!this._selection || this.rangeContainsNonEditableContent(this._selection)) {
                this._selection = this._iframeDocument.createRange();
                // If the first element is a div, put selection inside it instead of before it
                // NOTE: This could be expanded to work for other elements, but to be on the safe side we are
                // only doing it for the expected case of a div.
                var elementToSelect = /*@static_cast(HTMLElement)*/this._body.children[0];
                if (!Boolean(elementToSelect) || elementToSelect.nodeName.toLowerCase() !== "div") {
                    elementToSelect = this._body;
                }
                this._selection.selectNodeContents(/*@static_cast(Node)*/elementToSelect);
                this._selection.collapse(true);
            }
            // Unfortunately it may still be possible for the selection range we have saved to be an invalid selection range,
            // which will cause adding it the the document selection to through an error.  We have no consistent repro for this,
            // but have reports where this appears to have happened.  WinLive 595112.
            try {
                this.replaceSelection(this._selection);
            } catch (e) {
                // This does mean that our selection is invalid though, so we should throw it away
                this._selection = null;
                this._selectionBookmark = null;
                this._logFunction("Ignorable error while trying to restore the saved selection: " + e);
            }
            this._markSavedSelectionInvalid();
        }
        ModernCanvas.mark("restoreSelection", ModernCanvas.LogEvent.stop);
    };

    proto._saveSelection = function () {
        /// <summary>Saves the current selection if it is valid.</summary>
        ModernCanvas.mark("saveSelection", ModernCanvas.LogEvent.start);
        // Determine what the parent element should be
        var selectionRange = this.getSelectionRange();
        if (selectionRange) {
            this._selection = selectionRange;
            this._selectionBookmark = new ModernCanvas.RangeBookmark(selectionRange, this._body);
        }
        ModernCanvas.mark("saveSelection", ModernCanvas.LogEvent.stop);
    };

    proto._scrollableElement = /*@static_cast(HTMLElement)*/null;

    proto._selection = /*@static_cast(Range)*/null;

    proto._selectionBookmark = /*@static_cast(ModernCanvas.RangeBookmark)*/null;

    proto._showCueText = function () {
        /// <summary>Shows the cue text.</summary>
        ModernCanvas.mark("showCueText", ModernCanvas.LogEvent.start);
        Debug.assert(this._cueElement);
        this._cueElement.setAttribute("aria-hidden", "false");
        ModernCanvas.mark("showCueText", ModernCanvas.LogEvent.stop);
    };

    proto._showHideCueText = function () {
        /// <summary>Shows/Hides the cue text as appropriate.</summary>
        ModernCanvas.mark("showHideCueText", ModernCanvas.LogEvent.start);
        Debug.assert(this._cueElement);
        // Only start checking if we have been activated
        if (this._activated) {
            // Check the Modern Canvas has lost focus, then check it has no visible content
            if (this._iframeDocument.activeElement !== this._body && !this.visibleContent(/*@static_cast(Node)*/this._body)) {
                this._showCueText();
            } else {
                this._hideCueText();
            }
        }
        ModernCanvas.mark("showHideCueText", ModernCanvas.LogEvent.stop);
    };

    proto._srcToBlobUrlTable = {};

    proto._srcToStreamTable = {};

    proto.activate = function () {
        /// <summary>Completes activation of the Modern Canvas.  Only needed if the delayActivation option was used at construction time.</summary>
        ModernCanvas.mark("activate", ModernCanvas.LogEvent.start);
        if (!this._activated) {
            // Mark as activated
            this._activated = true;

            // Reset the body.
            this._body.innerHTML = "";

            // Reset the direction of the body.
            var dir = Jx.isRtl() ? "rtl" : "ltr";
            this._iframeDocument.body.setAttribute("dir", dir);

            // Execute any stalled insertion event
            var that = this;
            this._queuedInsertions.forEach(function (insertionInfo) {
                /// <param name="insertionInfo" type="__ModernCanvas.InsertionInfo" />
                that.addContent(insertionInfo.content, insertionInfo.format, ModernCanvas.ContentLocation.end, that._queuedInsertionSpellchecking);
            });

            // Complete activation
            this._internalActivate();
            Jx.raiseEvent(this, "afteractivate");
        }
        ModernCanvas.mark("activate", ModernCanvas.LogEvent.stop);
    };

    proto.addContent = function (content, format, contentLocation, spellChecking, urlToStreamMap, applicationListingUri) {
        /// <summary>Adds the given content to the Modern Canvas.</summary>
        /// <param name="content" type="String|HTMLElement">The content to add to the Modern Canvas.</param>
        /// <param name="format" type="ModernCanvas.ContentFormat">The kind of content being added.</param>
        /// <param name="contentLocation" type="ModernCanvas.ContentLocation">The relative location of where to add the content.</param>
        /// <param name="spellChecking" type="Boolean" optional="true">True if spell checking should be on for content insertion.  Defaults to False.</param>
        /// <param name="urlToStreamMap" type="Object" optional="true">The result of calling ModernCanvas.createUrlToStreamMapAsync</param>
        /// <param name="applicationListingUri" type="Windows.Foundation.Uri" optional="true">The applicationListingUri property from the data package being added</param>
        ModernCanvas.mark("addContent", ModernCanvas.LogEvent.start);
        Debug.assert(ModernCanvas.ContentFormat[format]);
        Debug.assert(ModernCanvas.ContentLocation[contentLocation]);
        Debug.assert(Jx.isNullOrUndefined(spellChecking) || typeof spellChecking === "boolean");
        // Apply defaults
        spellChecking = Boolean(spellChecking);
        if (this._activated) {
            // Start by deactivating internally to ensure adding this content does not fire unneeded listeners
            this._internalDeactivate();
            this._onBeforeUndoableChange();
            var previousSpellchecking = this._body.spellcheck;
            this._body.spellcheck = spellChecking;
            // If adding a data package, pull out the html content
            if (format === ModernCanvas.ContentFormat.text) {
                // Translate text into html
                var translationDiv = this._iframeDocument.createElement("div");
                translationDiv.innerText = content;
                content = translationDiv.innerHTML;
                // Replace all the new lines with <br>s
                content = content.replace(/\r(\n)?/g, "<br>");
                content = this.wrapTextContent(content);
            }

            var range = this.getDocument().createRange();
            range.selectNodeContents(/*@static_cast(Node)*/this._body);

            if (contentLocation === ModernCanvas.ContentLocation.start) {
                range.collapse(/*toStart:*/true);
            } else if (contentLocation === ModernCanvas.ContentLocation.end) {
                range.collapse(/*toStart:*/false);
            } else if (contentLocation === ModernCanvas.ContentLocation.selection) {
                range = this.getSelectionRange();
            }

            var documentFragment;
            if (format !== ModernCanvas.ContentFormat.documentFragment) {
                // Only call toStaticHTML if there is content defined, if not toStaticHTML may fail
                if (content) {
                    ModernCanvas.mark("addContent.toStaticHTML", ModernCanvas.LogEvent.start);
                    content = window.toStaticHTML(content);
                    ModernCanvas.mark("addContent.toStaticHTML", ModernCanvas.LogEvent.stop);
                }

                ModernCanvas.mark("addContent.createContextualFragment", ModernCanvas.LogEvent.start);
                documentFragment = /*@static_cast(DocumentFragment)*/range.createContextualFragment(content);
                ModernCanvas.mark("addContent.createContextualFragment", ModernCanvas.LogEvent.stop);
            } else {
                documentFragment = /*@static_cast(DocumentFragment)*/this.getDocument().adoptNode(/*@static_cast(Node)*/content);
                Debug.assert(Jx.isObject(documentFragment), "Failed to adopt DocumentFragment");
            }

            Debug.assert(Jx.isObject(range), "Expected range to be a valid Range");
            if (Boolean(range) && Boolean(documentFragment)) {
                ModernCanvas.mark("addContent.insertDocumentFragment", ModernCanvas.LogEvent.stop);
                this._localizeHTML(/*@static_cast(HTMLElement)*/documentFragment);
                range.deleteContents();
                range.insertNode(/*@static_cast(Node)*/documentFragment);
                ModernCanvas.mark("addContent.insertDocumentFragment", ModernCanvas.LogEvent.stop);
            }

            // Finish additional localization for the data package case
            if (urlToStreamMap) {
                var workingRange = this._iframeDocument.createRange();
                workingRange.selectNodeContents(this._body);
                this._localizeFromDataPackage(workingRange, applicationListingUri, urlToStreamMap);
            }

            // If a table was added, make sure there is an empty line above it and/or below it, as necessary.
            this._addEmptyLinesForTables();

            this._onCharacterCountChanged(/*@static_cast(Event)*/{});
            this._showHideCueText();
            this._internalActivate();
            this._body.spellcheck = previousSpellchecking;
            this._previousSpellChecking = null;
            Jx.raiseEvent(this, "afteractivate");
        } else {
            Debug.assert(!urlToStreamMap, "urlToStreamMap cannot be used in a non-activated canvas");
            Debug.assert(this._queuedInsertionSpellchecking === spellChecking || this._queuedInsertionSpellchecking === null, "addContent may only be called multiple times on an un-activated ModernCanvas if the spellChecking option is kept the same for each call");

            // Set the flags to reflect this request
            this._queuedInsertionSpellchecking = spellChecking;
            // If the content is text, translate into html
            if (format === ModernCanvas.ContentFormat.text) {
                this._bufferArea.innerText = content;
                content = this.wrapTextContent(this._bufferArea.innerHTML);
                format = ModernCanvas.ContentFormat.htmlString;
            }

            var insertionInfo = /*@static_cast(__ModernCanvas.InsertionInfo)*/{
                content: content,
                format: format
            };
            if (contentLocation === ModernCanvas.ContentLocation.end) {
                this._queuedInsertions.push(insertionInfo);
            } else if (contentLocation === ModernCanvas.ContentLocation.all) {
                this._queuedInsertions = [insertionInfo];
            } else {
                Debug.assert(contentLocation === ModernCanvas.ContentLocation.start);
                this._queuedInsertions.unshift(insertionInfo);
            }
        }
        ModernCanvas.mark("addContent", ModernCanvas.LogEvent.stop);
    };

    proto.wrapTextContent = function (content) {
        /// <summary>Overrideable function to wrap the incoming text content</summary>
        return content;
    };

    proto.addEventListener = function (type, listener, useCapture) {
        /// <summary>Adds an event listener to the Modern Canvas.</summary>
        /// <param name="type" type="String">The type of event to listen for.</param>
        /// <param name="listener" type="Function">The function to execute when the event is fired.</param>
        /// <param name="useCapture" type="Boolean">True if the event should be captured, false if it should be bubbled.</param>
        Debug.assert(typeof type === "string");
        Debug.assert(typeof listener === "function");
        Debug.assert(typeof useCapture === "boolean");
        Debug.assert(this._body);
        if (type === "selectionchange") {
            // selectionchange does not bubble through the DOM, it fires directly on the document object.
            this._iframeDocument.addEventListener(type, listener, useCapture);
        } else {
            this._body.addEventListener(type, listener, useCapture);
        }
    };

    proto.addListener = function (type, fn, /*@dynamic*/obj) {
        /// <summary>Add an event listener to the Modern Canvas.</summary>
        /// <param name="type" type="String">The event identifier.</param>
        /// <param name="fn" type="Function">The function callback.</param>
        /// <param name="obj" optional="true">The context in which to call the callback function.</param>
        /// <returns type="Object">Returns the target object.</returns>
        Debug.assert(this._body);
        if (type === "charactercountchanged") { //TODO this is not the best way to active this... move to plug in model
            // DOMSubtreeModified is not called when the direct textNode child of the _body is modified.
            // If the code changes to remove the ability to edit the textNode directly, the DOMCharacterDataModified
            // listener should be removed from here
            this._countingChars = true;
            this.addEventListener("DOMCharacterDataModified", this._onCharacterCountChanged, false);
            this.addEventListener("DOMSubtreeModified", this._onCharacterCountChanged, false);
        }
        Jx.addListener(this, type, fn, obj);
    };

    proto.callWhenContentReady = function (callback) {
        /// <summary>
        /// Sets the callback to execute when content is ready to be fetched/modified.
        /// This callback will be called one time only, the first time the content is ready to be fetched/modified.
        /// </summary>
        this._contentReadyCallback = callback;
        this._fireContentReadyIfReady();
    };

    proto.clearContent = function () {
        /// <summary>Clears all the content from the Modern Canvas.</summary>
        ModernCanvas.mark("clearContent", ModernCanvas.LogEvent.start);
        this._onBeforeUndoableChange();
        this._body.innerHTML = "";
        this._onUndoableChange();
        this._onCharacterCountChanged(/*@static_cast(Event)*/{});
        this._showHideCueText();
        ModernCanvas.mark("clearContent", ModernCanvas.LogEvent.stop);
    };

    proto.clearUndoRedo = function () {
        /// <summary>Clears the undo/redo stack.</summary>
        ModernCanvas.mark("clearUndoRedo", ModernCanvas.LogEvent.start);
        this._iframeDocument.execCommand("ms-clearUndoStack");
        ModernCanvas.mark("clearUndoRedo", ModernCanvas.LogEvent.stop);
    };

    proto.clearUsageData = function () {
        /// <summary>Clears all information in the current data set, resetting the session.</summary>
        ModernCanvas.mark("clearUsageData", ModernCanvas.LogEvent.start);
        var _components = this.components,
            keys = Object.keys(_components),
            component;
        for (var m = keys.length; m--;) {
            component = /*@static_cast(ModernCanvas.Component)*/_components[keys[m]];
            if (typeof component.clearUsageData === "function") {
                component.clearUsageData();
            }
        }
        ModernCanvas.mark("clearUsageData", ModernCanvas.LogEvent.stop);
    };

    proto.components = {
        autoReplaceManager: /*@static_cast(ModernCanvas.AutoReplaceManager)*/null,
        autoResize: /*@static_cast(ModernCanvas.Plugins.AutoResize)*/null,
        commandManager: /*@static_cast(ModernCanvas.CommandManager)*/null,
        contextMenuManager: /*@static_cast(ModernCanvas.ContextMenuManager)*/null,
        hyperlinkManager: /*@static_cast(ModernCanvas.HyperlinkManager)*/null,
        shortcutManager: /*@static_cast(ModernCanvas.ShortcutManager)*/null
    };

    proto.deactivate = function () {
        /// <summary>Deactivates the Modern Canvas.  Only necessary if the Modern Canvas became active.</summary>
        ModernCanvas.mark("deactivate", ModernCanvas.LogEvent.start);
        if (this._activated) {
            // Start internal deactivation
            this._internalDeactivate();

            // Reset variables
            this._activated = false;
            this._queuedInsertionSpellchecking = /*@static_cast(Boolean)*/null;
            this._queuedInsertions = [];
            this._srcToBlobUrlTable = {};
            this._srcToStreamTable = {};
            if (this._springLoader.bookmark) {
                this._springLoader = {};
                this.removeEventListener("selectionchange", this._clearSpringLoader, false);
            }

            // Remove non-default <style>s from <head>
            var contentStyles = this.getDocument().querySelectorAll("head > style.modernCanvas-contentStyle:not(.modernCanvas-defaultStyle)");
            for (var i = 0, len = contentStyles.length; i < len; i++) {
                var contentStyle = contentStyles[i];
                contentStyle.parentNode.removeChild(contentStyle);
            }

            // WINBLUE:120653 for some reason control ranges cause some element events not to fire
            // Replace it with nothing to remove it.
            this.replaceIframeSelectionRange();
        }
        ModernCanvas.mark("deactivate", ModernCanvas.LogEvent.stop);
    };

    proto.dispose = function () {
        ModernCanvas.mark("dispose", ModernCanvas.LogEvent.start);
        // Cleanup the object URLs
        var objectUrls = this._objectUrls;
        for (var m = objectUrls.length; m--;) {
            URL.revokeObjectURL(objectUrls[m]);
        }

        this.deactivate();

        var iframeElement = this._iframeElement,
            iframeDocument = this._iframeDocument,
            hostDocument = iframeElement.ownerDocument,
            cueElement = this._cueElement;

        iframeDocument.removeEventListener("mscontrolselect", this.components.hyperlinkManager.onClick, false);
        iframeDocument.removeEventListener("click", this.components.hyperlinkManager.onClick, false);
        Jx.removeListener(this, "command", this.components.commandManager.onCommand, this.components.commandManager);
        iframeDocument.removeEventListener("contextmenu", this.components.contextMenuManager.onContextMenu, false);
        iframeDocument.removeEventListener("keydown", this._onKeyDown, false);
        iframeDocument.removeEventListener("keydown", this._recordKey, true);
        iframeDocument.removeEventListener("keyup", this.components.autoReplaceManager.onKeyUp, false);
        iframeDocument.removeEventListener("keypress", this._preventInvalidKeystroke, true);

        cueElement.removeEventListener("dragover", this._cueElementDragOver, false);
        cueElement.removeEventListener("drop", this._cueElementDrop, false);
        cueElement.removeEventListener("focus", this._cueElementFocus, false);

        window.removeEventListener("resize", this._onWindowResize, false);
        this.removeEventListener("beforedeactivate", this._saveSelection, false);
        this.removeEventListener("focus", this._onFocus, false);
        iframeElement.removeEventListener("focus", this._onIframeFocus, false);
        hostDocument.removeEventListener("keydown", this._markSavedSelectionValid, false);
        hostDocument.removeEventListener("keyup", this._markSavedSelectionInvalid, false);

        ModernCanvas.mark("dispose", ModernCanvas.LogEvent.stop);
    };

    proto.focus = function () {
        /// <summary>Sets focus into the Modern Canvas element.</summary>
        this._focus();
    };

    proto.getCanvasElement = function () {
        /// <summary>Returns the HTMLElement that is the root of the editable area.  Callers can use this node to listen for DOM events.</summary>
        /// <returns type="HTMLEvent">root canvas element</returns>
        return this._body;
    };

    proto.getCharacterCount = function () {
        /// <summary>Calculates the current character count in the Modern Canvas.</summary>
        /// <returns type="Number">The number of characters.</returns>
        var text = ModernCanvas.ContentFormat.text,
            content = this.getContent([text]);
        return content[text].length;
    };

    proto.getContent = function (formats, contentDestination) {
        /// <summary>Retrieves the content from the Modern Canvas.</summary>
        /// <param name="formats" type="Array">An array of ModernCanvas.ContentFormat, determining the kind of content being retrieved.</param>
        /// <param name="contentDestination" type="ModernCanvas.ContentDestination" optional="true">The intended destination of the content.</param>
        /// <returns type="Object">An object with keys The content of the Modern Canvas in the specified format.  Returns an empty object if the content can not be retrieved.</returns>
        ModernCanvas.mark("getContent", ModernCanvas.LogEvent.start);
        Debug.assert(formats.length > 0, "Expected at least one format to be specified");
        Debug.assert(formats.every(function (format) { return Jx.isNonEmptyString(ModernCanvas.ContentFormat[format]); }), "Expected all formats to be valid ModernCanvas.ContentFormats");
        Debug.assert(formats.every(function (format) { return format !== ModernCanvas.ContentFormat.documentFragment; }), "Get content does not support format ModernCanvas.ContentFormat.documentFragment");
        Debug.assert(Jx.isNullOrUndefined(contentDestination) || ModernCanvas.ContentDestination[contentDestination], "Expected contentDestination to be a valid ModernCanvas.ContentDestination");
        contentDestination = contentDestination || ModernCanvas.ContentDestination.external;

        var result = {};

        // If we have been activated, fetch the content
        Debug.assert(this._activated, "Can't get content from deactivated canvas");
        if (this._activated) {
            var shouldGetHtml = formats.some(function (format) { return format === ModernCanvas.ContentFormat.htmlString; }),
                shouldGetText = formats.some(function (format) { return format === ModernCanvas.ContentFormat.text; });

            ModernCanvas.mark("getContent.bodyClone", ModernCanvas.LogEvent.start);
            this.suspendEvents();
            var bodyClone = this._delocalizeHTML(this._body, contentDestination);
            this.resumeEvents();
            ModernCanvas.mark("getContent.bodyClone", ModernCanvas.LogEvent.stop);

            if (shouldGetHtml) {
                ModernCanvas.mark("getContent.htmlString", ModernCanvas.LogEvent.start);
                var headClone = this._getHeadContent(),
                    currentStyle = this._body.currentStyle,
                    fontSizeInPts = Number(currentStyle.fontSize.replace("px", "")) / this._pxToPtRatio;
                Debug.assert(currentStyle.fontSize.indexOf("px") > 0, "Expected font size to be in px");
                result[ModernCanvas.ContentFormat.htmlString] =
                    '<!DOCTYPE html>\n' +
                    '<html>\n' +
                        '<head>\n' +
                            '<meta name="generator" content="Windows Mail ' + this._getVersion() + '">\n' +
                            headClone.innerHTML +
                        '</head>\n' +
                        '<body dir="' + currentStyle.direction + '">\n' +
                            '<div data-externalstyle="false" dir="' + currentStyle.direction + '" style="' +
                                'font-family:' + ModernCanvas.removeFakeFontNames(currentStyle.fontFamily).replace(this._regexDoubleQuote, "'") + ';' +
                                'font-size:' + fontSizeInPts.toString() + 'pt;' +
                                '">' +
                                bodyClone.innerHTML +
                            '</div>\n' +
                        '</body>\n' +
                    '</html>\n';
                ModernCanvas.mark("getContent.htmlString", ModernCanvas.LogEvent.stop);
            }
            if (shouldGetText) {
                ModernCanvas.mark("getContent.text", ModernCanvas.LogEvent.start);

                // Replace all images with appropriate text
                var images = bodyClone.querySelectorAll("img");
                for (var i = images.length; i--;) {
                    // Add whitespace to the alt text to make sure that it doesn't run together with another word or image nearby.
                    images[i].replaceNode(this._iframeDocument.createTextNode(" "  + images[i].alt + " "));
                }

                // Return the text with any trailing spaces/carriage returns removed
                result[ModernCanvas.ContentFormat.text] = bodyClone.innerText.replace(/\s+$/, "");
                ModernCanvas.mark("getContent.text", ModernCanvas.LogEvent.stop);
            }
        }

        ModernCanvas.mark("getContent", ModernCanvas.LogEvent.stop);
        return result;
    };

    proto._getHeadContent = function () {
        /// <summary>Gets the content in the head element.</summary>
        /// <returns type="Node">A cloned head element with any Modern Canvas-only styles removed.</returns>
        ModernCanvas.mark("getHeadContent", ModernCanvas.LogEvent.start);

        var headClone = document.createElement("head"),
            contentStyles = this.getDocument().querySelectorAll("head > style.modernCanvas-contentStyle");
        for (var i = 0, len = contentStyles.length; i < len; i++) {
            var contentStyle = contentStyles[i].cloneNode(true/*deep*/);
            contentStyle.classList.remove("modernCanvas-contentStyle");
            contentStyle.classList.remove("modernCanvas-defaultStyle");
            headClone.appendChild(contentStyle);
        }

        // We comment out styles on cloned nodes, because if we do it inline the styles stop working in our app. However, the 
        // styles round-trip just fine because if we load this content again, toStaticHTML strips the comment but leaves
        // the CSS.
        this._commentOutStyles(headClone);

        ModernCanvas.mark("getHeadContent", ModernCanvas.LogEvent.stop);
        return headClone;
    };

    proto._getVersion = function () {
        /// <returns type="String">The current version of the app.</returns>
        if (!this._version) {
            var version = Windows.ApplicationModel.Package.current.id.version;
            this._version = version.major + "." + version.minor + "." + version.build + "." + version.revision;
        }

        return this._version;
    };

    proto.discardableClone = function (node, deep) {
        /// <summary>Get a clone of the given node that can be discarded. This function should be used over the whole content and allows additional modifications by subclasses.</summary>
        /// <param name="node" type="Node">node to clone</param>
        /// <param name="deep" type="Boolean">if the children of the node should be copied</param>
        /// <returns type="Node">cloned node</returns>

        return node.cloneNode(deep);
    };

    proto.getDocument = function () {
        /// <summary>Gets the editable element's owner document.</summary>
        /// <returns type="Document">The Document object for the editable element.</returns>

        return this._iframeDocument;
    };

    proto.getIframeElement = function () {
        /// <summary>Gets the document's iframe element</summary>
        /// <returns type="HTMLElement">the iframe element.</returns>

        return this._iframeElement;
    };

    proto.getSelection = function () {
        /// <summary>Sets the selection position within the Canvas.</summary>
        /// <returns type="ModernCanvas.RangeBookmark">A RangeBookmark for the selection point.</returns>
        // Update the saved selection
        this._saveSelection();

        // Return a range bookmark for the saved selection
        return this._selectionBookmark;
    };

    proto.getSelectionRange = function () {
        /// <summary>Gets a Range object representing the currently selected range in the editable element.</summary>
        /// <returns type="Range">The selected range or null if the selection is not in the editable element.</returns>

        var range = this.getIframeSelectionRange();
        if (Boolean(range) && this.isDescendantOf(range.commonAncestorContainer, /*@static_cast(Node)*/this._body)) {
            return range;
        }

        return null;
    };

    proto.scrollSelectionIntoView = function (viewportRect) {
        /// <summary>Ensures the current selection range is visible by scrolling to it if necessary.</summary>
        /// <param name="viewportRect" type="ClientRect" optional="true">The rectangle that defines the visible viewport. The entire rectangle should fit within the scrollable element.</param>

        var selectionRange = this.getSelectionRange(),
            selectionBoundingRect = this.getSelectionRangeBoundingRect();
        if (selectionRange && selectionBoundingRect) {
            // The selection bounding rectangle is calculated with respect to the top-left corner of the iframe. But when we 
            // scroll it into view we need the origin to be the top-left corner of the scrollable element (which contains the 
            // iframe) so we need to translate the selection bounding rectangle appropriately. 
            var iframeBoundingRect = this._iframeElement.getBoundingClientRect(),
                offsetTop = iframeBoundingRect.top,
                offsetLeft = iframeBoundingRect.left,
                // Vertical padding is added above and below the selection to account for UI around the selection such as the touch gripper.
                verticalPadding = 20,
                translatedSelectionBoundingRect = {
                    top: (selectionBoundingRect.top - verticalPadding) + offsetTop,
                    right: selectionBoundingRect.right + offsetLeft,
                    bottom: (selectionBoundingRect.bottom + verticalPadding) + offsetTop,
                    left: selectionBoundingRect.left + offsetLeft,
                    width: selectionBoundingRect.width,
                    height: selectionBoundingRect.height + (verticalPadding * 2)
                };

            this.scrollRectIntoView(translatedSelectionBoundingRect, viewportRect || this.getScrollableElement().getBoundingClientRect());
        }
    };

    proto.scrollRectIntoView = function (rect, viewportRect) {
        /// <summary>Scrolls the given rectangle into the bounds of the viewport rectangle.</summary>
        /// <param name="rect" type="ClientRect">The rectangle to scroll into view. The rectangle's origin should be the top-left corner of the scrollable element.</param>
        /// <param name="viewportRect" type="ClientRect">The rectangle that defines the visible viewport. The entire rectangle should fit within the scrollable element.</param>

        var scrollableElement = this.getScrollableElement();

        Debug.assert(viewportRect.top >= scrollableElement.getBoundingClientRect().top &&
            viewportRect.right <= scrollableElement.getBoundingClientRect().right &&
            viewportRect.bottom <= scrollableElement.getBoundingClientRect().bottom &&
            viewportRect.left >= scrollableElement.getBoundingClientRect().left,
            "Expected viewportRect to be within the scrollable element");

        // Scroll vertically, but only if we can scroll the entire selection height into view.
        if (rect.height <= viewportRect.height) {
            if (rect.top < viewportRect.top) {
                scrollableElement.scrollTop -= viewportRect.top - rect.top;
            } else if (rect.bottom > viewportRect.bottom) {
                scrollableElement.scrollTop += rect.bottom - viewportRect.bottom;
            }
        }

        // Scroll horizontally, but only if we can scroll the entire selection width into view.
        if (rect.width <= viewportRect.width) {
            if (rect.left < viewportRect.left) {
                scrollableElement.scrollLeft -= viewportRect.left - rect.left;
            } else if (rect.left > viewportRect.right) {
                scrollableElement.scrollLeft += rect.right - viewportRect.right;
            }
        }
    };

    proto._anchorElement = /*@static_cast(HTMLElement)*/null;

    proto.getAnchorElement = function (selectionRange) {
        /// <summary>Gets an html element that is positioned over the given selection.</summary>
        /// <param name="selectionRange" type="Range">The range to get an anchor element for.</param>
        /// <returns type="HTMLElement">An element positioned over the given selection.</returns>

        Debug.assert(Jx.isObject(selectionRange), "Expected selectionRange to be a valid Range");

        var anchorElement = this._anchorElement,
            boundingClientRect = selectionRange.getBoundingClientRect();
        if (boundingClientRect.top === 0 &&
            boundingClientRect.left === 0 &&
            boundingClientRect.right === 0 &&
            boundingClientRect.bottom === 0) {
            var commonAncestor = this.getElementFromNode(selectionRange.commonAncestorContainer);
            anchorElement.style.width = commonAncestor.offsetWidth.toString() + "px";
            anchorElement.style.height = commonAncestor.offsetHeight.toString() + "px";
            anchorElement.style.top = commonAncestor.offsetTop.toString() + "px";
            anchorElement.style.left = commonAncestor.offsetLeft.toString() + "px";
        } else {
            anchorElement.style.width = boundingClientRect.width.toString() + "px";
            anchorElement.style.height = boundingClientRect.height.toString() + "px";
            anchorElement.style.top = boundingClientRect.top.toString() + "px";
            anchorElement.style.left = boundingClientRect.left.toString() + "px";
        }

        return anchorElement;
    };

    proto._springLoader = {};

    proto.addSpringLoader = function (style, state) {
        /// <summary>Records a RangeBookmark at a place where IE's SpringLoader has been set.</summary>

        var range = this.getSelectionRange();
        if (range) {
            this._springLoader.bookmark = new ModernCanvas.RangeBookmark(range, this._body);
            this._springLoader[style] = state;

            this.addEventListener("selectionchange", this._clearSpringLoader, false);
        }
    };

    proto._clearSpringLoader = function () {
        var range = this.getSelectionRange(),
            bookmark = null;
        if (range) {
            bookmark = new ModernCanvas.RangeBookmark(range, this._body);
        }
        if (!bookmark || !bookmark.equals(this._springLoader.bookmark)) {
            this._springLoader = {};
            this.removeEventListener("selectionchange", this._clearSpringLoader, false);
        }
    };

    proto.getBasicSelectionStyles = function () {
        /// <summary>determines the current selection's start node styles</summary>
        /// <returns type="Object"></returns>

        var range = this.getSelectionRange(),
            defaultReturn = { bold: false, underline: false, italic: false };
        if (!range) {
            return defaultReturn;
        }

        range = this.trimRange(range);
        var node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE && node.childNodes.length > range.startOffset) {
            node = node.childNodes[range.startOffset];
        } else if (node.nodeType === Node.TEXT_NODE && node.length === range.startOffset && Boolean(node.nextSibling)) {
            node = node.nextSibling;
        }
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }
        if (node === null || !node.currentStyle) {
            // BLUE:258727 - the range.startContainer.firstChild.parentNode is null in this case?!
            // BLUE:239243 - MathML elements do not have style or currentStyle properties.
            return defaultReturn;
        }

        Debug.assert(node.nodeType === Node.ELEMENT_NODE, "node not an element as expected");

        var currentStyle = this.getWindow().getComputedStyle(node),
            decoration = currentStyle.textDecoration,
            fontStyle = currentStyle.fontStyle,
            weight = currentStyle.fontWeight,
            number = parseInt(weight, 10);
        var result = {
            bold: Jx.isBoolean(this._springLoader.bold) ? this._springLoader.bold : (number !== Number.NaN ? number > 500 : (weight === "bold" || weight === "bolder")),
            underline: Jx.isBoolean(this._springLoader.underline) ? this._springLoader.underline : decoration.indexOf("underline") !== -1,
            italic: Jx.isBoolean(this._springLoader.italic) ? this._springLoader.italic : fontStyle === "italic"
        };

        return result;
    };

    proto.getSelectionStyles = function () {
        var doc = this.getDocument(),
            color = this._getSelectionStyle("color"),
            basicSelectionStyles = this.getBasicSelectionStyles(),
            foreColor;

        // If the springloader is cocked then the correct color will come from queryCommandValue
        // queryCommandValue will throw if there is no selection
        try {
            foreColor = doc.queryCommandValue("forecolor");
        } catch (ex) { }

        return {
            fontSize: this._getSelectionStyle("fontSize"),
            fontFamily: this._getSelectionStyle("fontFamily"),
            // foreColor is only valid when springloader is cocked in those cases it will return a string like #ffffff instead of a number
            fontColor: Jx.isNonEmptyString(foreColor) ? foreColor : color,
            highlightColor: this._getSelectionStyle("backgroundColor"),
            bold: basicSelectionStyles.bold,
            italic: basicSelectionStyles.italic,
            underline: basicSelectionStyles.underline
        };
    };

    proto._getSelectionStyle = function (styleAttribute) {
        /// <summary>Calculates the current style attribute of the selection.</summary>
        /// <param name="styleAttribute" type="String" optional="false">The javascript name version of the style attribute to inspect.</param>
        /// <returns type="String">The value of the style attribute.  Null if unknown.</returns>

        var selectionRange = this.getSelectionRange(),
            that = this,
            getStyleValue = function (node) {
                /// <summary>Gets the style value of the given node.</summary>
                /// <param name="node" type="HTMLElement"></param>
                /// <returns type="String">The value of the style attribute.</returns>
                var nodeToCheck = node,
                    value;
                if (!Boolean(nodeToCheck.style)) {
                    nodeToCheck = nodeToCheck.parentNode;
                }
                do {
                    value = that.getWindow().getComputedStyle(nodeToCheck)[styleAttribute];
                    nodeToCheck = nodeToCheck.parentNode;
                } while (value === "transparent" && Boolean(nodeToCheck.parentNode));
                // If no value could be found, assign the default value of white
                if (value === "transparent") {
                    value = "#ffffff";
                }
                return value;
            };

        if (!Boolean(selectionRange)) {
            // getSelectionStyle was called when there was no selection
            Jx.log.warning("Expected a selection inside getSelectionStyle.");
            return null;
        }

        var startNode = /*@static_cast(HTMLElement)*/selectionRange.startContainer,
            endNode = /*@static_cast(HTMLElement)*/selectionRange.endContainer;

        // If we have an single selection simply return the style for it
        if (startNode === endNode && (startNode.childNodes.length === 0 || selectionRange.startOffset === selectionRange.endOffset)) {
            return getStyleValue(startNode);
        }
        // If the selection spans multiple nodes
        // Get an iterator for all text nodes in the range
        var commonAncestor = selectionRange.commonAncestorContainer,
            iterator = commonAncestor.ownerDocument.createNodeIterator(commonAncestor, NodeFilter.SHOW_TEXT, function (node) {
                var testRange = selectionRange.cloneRange();
                testRange.selectNodeContents(node);
                // If either end overlaps AND it's a non-empty node, we care about the range
                // Note: We don't have to worry about the selection in a single empty node case because that is covered above                    
                if (Jx.intersectsNode(selectionRange, node, true) && Boolean(node.data)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }, false);

        // Iterate through all the nodes
        var workingNode = iterator.nextNode(),
            styleValue;
        while (workingNode) {
            // If the style has not been defined yet, just assign it
            if (!Boolean(styleValue)) {
                styleValue = getStyleValue(/*@static_cast(HTMLElement)*/workingNode);
            } else if (styleValue !== getStyleValue(/*@static_cast(HTMLElement)*/workingNode)) {
                // Else if the style does not match the existing one, just return null
                return null;
            }
            // Iterate to the next node
            workingNode = iterator.nextNode();
        }
        return styleValue;
    };

    proto.getUsageData = function () {
        /// <summary>Retrieves the data set for the current session of all the components.</summary>
        /// <returns type="__ModernCanvas.UsageData">Object with a property for each component, pointing to its usage data set.</returns>
        ModernCanvas.mark("getUsageData", ModernCanvas.LogEvent.start);
        var dataObject = {},
            _components = this.components;
        Debug.assert(_components);
        Debug.assert(_components.commandManager);
        Debug.assert(typeof _components.commandManager.getUsageData === "function");
        Debug.assert(_components.shortcutManager);
        Debug.assert(typeof _components.shortcutManager.getUsageData === "function");
        Debug.assert(_components.contextMenuManager);
        Debug.assert(typeof _components.contextMenuManager.getUsageData === "function");

        dataObject.commandManager = _components.commandManager.getUsageData();
        dataObject.shortcutManager = _components.shortcutManager.getUsageData();
        dataObject.contextMenuManager = _components.contextMenuManager.getUsageData();
        ModernCanvas.mark("getUsageData", ModernCanvas.LogEvent.stop);
        return dataObject;
    };

    proto.getWindow = function () {
        /// <summary>Gets the editable element's owner window.</summary>
        /// <returns type="Window">The Window object for the editable element.</returns>

        return this._iframeElement.contentWindow;
    };

    proto.insertElement = function (uniqueId) {
        /// <summary>Asks the autoReplaceManager to insert the requested element into the current saved selection in the Canvas.</summary>
        /// <param name="uniqueId" type="String">The unique identifier for the element to insert.</param>
        ModernCanvas.mark("insertElement", ModernCanvas.LogEvent.start);
        var selectionRange = this.getSelectionRange();
        if (!selectionRange) {
            this._keepSelection = true;
            this._restoreSelection();
            selectionRange = this.getSelectionRange();
        }
        if (selectionRange) {
            this._onBeforeUndoableChange();
            var holder = this._iframeDocument.createElement("div");
            selectionRange.deleteContents();
            holder.innerHTML = this.components.autoReplaceManager.getElementHTML(uniqueId, "inbound");
            Debug.assert(holder.childNodes.length === 1);
            try {
                selectionRange.insertNode(holder.childNodes[0]);
            } catch (ex) {
                // In this case we may have tried to insert an image to an invalid selection.
                Debug.assert(false, "Exception while trying to insert an element: " + ex);
            }
            selectionRange.collapse(false);
            this._onUndoableChange();
        }
        this._saveSelection();
        ModernCanvas.mark("insertElement", ModernCanvas.LogEvent.stop);
    };

    proto.isContentReady = function () {
        /// <summary>Determines if the content is ready to be fetched/added to (i.e. is not in the middle of being modified programatically.
        /// If the content is fetched/added to when this value is false the results may not be as intended.</summary>
        /// <returns type="Boolean">True if the content is not being modified, false if it is being modified.</returns>
        return !this.components.commandManager.executingCommand();
    };

    proto.isRTL = function () {
        /// <summary>Determines if the current text direction in the Modern Canvas is right-to-left.</summary>
        /// <returns type="Boolean">True if the text direction is right-to-left.  False otherwise.</returns>
        return (this._body.currentStyle.direction === "rtl");
    };

    proto.onResize = function () {
        /// <summary>Should be called if the ModernCanvas is resized by the application and may need to scroll the selection into view.</summary>
        ModernCanvas.mark("onResize", ModernCanvas.LogEvent.start);
        this.scrollSelectionIntoView();
        ModernCanvas.mark("onResize", ModernCanvas.LogEvent.stop);
    };

    proto.refreshHeight = function () {
        /// <summary>Updates the internal height values used by the ModernCanvas based on any changes made to the original element.  This only needs to be
        /// called if the height properties of the original element are being programtically changed after the ModernCanvas has been instantiated.</summary>
        ModernCanvas.mark("refreshHeight", ModernCanvas.LogEvent.start);
        var mainStyle = this._iframeElement.parentNode.currentStyle;
        this._iframeElement.style.minHeight = mainStyle.minHeight;
        this._iframeElement.style.height = mainStyle.height;
        ModernCanvas.mark("refreshHeight", ModernCanvas.LogEvent.stop);
    };


    proto.removeEventListener = function (type, listener, useCapture) {
        /// <summary>Removes an event listener from the Modern Canvas.</summary>
        /// <param name="type" type="String">The type of event to remove the listener from.</param>
        /// <param name="listener" type="Function">The function to remove from the execution list.</param>
        /// <param name="useCapture" type="Boolean">True if the listener was set to capture the event, false if it was set to bubble it.</param>
        Debug.assert(typeof type === "string");
        Debug.assert(listener);
        Debug.assert(typeof useCapture === "boolean");
        if (type === "selectionchange") {
            this._iframeDocument.removeEventListener(type, listener, useCapture);
        } else {
            this._body.removeEventListener(type, listener, useCapture);
        }

    };

    proto.removeListener = function (type, fn, /*@dynamic*/context) {
        /// <summary>Remove an event listener from the Modern Canvas.</summary>
        /// <param name="type" type="String">The event identifier.</param>
        /// <param name="fn" type="Function">The function callback.</param>
        /// <param name="obj" optional="true">The context in which to call the callback function.</param>
        /// <returns type="Object">Returns the target object.</returns>
        Debug.assert(typeof type === "string");
        if (type === "charactercountchanged") { //TOODO plugin model
            // DOMSubtreeModified is not called when the direct textNode child of the _body is modified.
            // If the code changes to remove the ability to edit the textNode directly, the DOMCharacterDataModified
            // listener should be removed from here
            this.removeEventListener("DOMCharacterDataModified", this._onCharacterCountChanged, false);
            this.removeEventListener("DOMSubtreeModified", this._onCharacterCountChanged, false);
            this._countingChars = false;
        }
        Jx.removeListener(this, type, fn, context);
    };

    proto.reset = function (skipClearingContent, skipClearingUndo) {
        /// <summary>Resets the Canvas to the post constructor state.  This does not change properties set using their own functions (e.g. cue text).</summary>
        /// <param name="skipClearingContent" type="Boolean">Flag to indicate that content does not need to be cleared because it will be overridden before activating.</param>
        /// <param name="skipClearingUndo" type="Boolean">Flag to indicate that undo information doesn't have to be cleared, since this is done in another place.</param>
        ModernCanvas.mark("reset", ModernCanvas.LogEvent.start);
        // Clear content/use related data
        if (!skipClearingContent) {
            this.clearContent();
        }
        if (!skipClearingUndo) {
            this.clearUndoRedo();
        }
        this.clearUsageData();

        // Reset variables
        this._characterCount = null;
        this._selection = null;
        this._selectionBookmark = null;

        // Return to the deactivated state.
        this.deactivate();
        ModernCanvas.mark("reset", ModernCanvas.LogEvent.stop);
    };

    proto.setCueText = function (text) {
        /// <summary>Defines the cue text for the Modern Canvas.</summary>
        /// <param name="text" type="String" optional="true">The cue text to display.  If undefined, null, or empty, cue text is removed.</param>
        ModernCanvas.mark("setCueText", ModernCanvas.LogEvent.start);
        Debug.assert(!text || typeof text === "string", "Expected text to either be null, undefined, or a string");
        Debug.assert(typeof this._cueText === "string");
        if (this._activated) {
            if (this._cueText !== text) {
                if (this._cueText) {
                    if (text) {
                        this._cueText = text;
                    } else {
                        this._cueText = "";
                        // For the focus case we know we will always want to hide the cue text
                        this.removeEventListener("focus", this._hideCueText, false);
                        // For the blur and DOMNodeInserted cases, we may or may not want to, so we need to update the cue text's visibility appropriately
                        this.removeEventListener("DOMNodeInserted", this._showHideCueText, false);
                        this.removeEventListener("blur", this._showHideCueText, false);
                    }
                } else {
                    if (text) {
                        this._cueText = text;
                        this.addEventListener("focus", this._hideCueText, false);
                        this.addEventListener("DOMNodeInserted", this._showHideCueText, false);
                        this.addEventListener("blur", this._showHideCueText, false);
                    }
                }
                this._cueElement.innerText = this._cueText;
            }
        } else {
            this._queuedCueText = text;
        }
        ModernCanvas.mark("setCueText", ModernCanvas.LogEvent.stop);
    };

    proto.setSelection = function (bookmarkedSelection) {
        /// <summary>Sets the selection position within the Canvas.</summary>
        /// <param name="bookmarkedSelection" type="ModernCanvas.RangeBookmark" optional="true">A RangeBookmark for the selection point to restore.</param>
        Debug.assert(!bookmarkedSelection || bookmarkedSelection instanceof ModernCanvas.RangeBookmark);

        // Update our selection bookmark using the new one provided
        this._selectionBookmark = bookmarkedSelection || this._selectionBookmark;

        // Mark our saved selection (bookmark) as valid and restore the selection
        this._keepSelection = true;
        this._restoreSelection();
    };

    proto.showCueText = function () {
        /// <summary>Sets the cue text to showing if focus is not in the Canvas.</summary>
        ModernCanvas.mark("showCueText", ModernCanvas.LogEvent.start);
        Debug.assert(this._cueElement);
        if (this._iframeDocument.activeElement !== this._body) {
            this._showCueText();
        }
        ModernCanvas.mark("showCueText", ModernCanvas.LogEvent.stop);
    };

    proto.suspendEvents = function () {
        /// <summary>Suspends event listeners to avoid unnecessary event handling.</summary>
        if (this._cueText) {
            this.removeEventListener("DOMNodeInserted", this._showHideCueText, false);
        }

        ModernCanvas.Component.prototype.suspendEvents.call(this);
    };

    proto.resumeEvents = function () {
        /// <summary>Resumes any suspended event listeners.</summary>
        if (this._cueText) {
            this.addEventListener("DOMNodeInserted", this._showHideCueText, false);
            this._showHideCueText();
        }

        ModernCanvas.Component.prototype.resumeEvents.call(this);
    };

})();

ModernCanvas.ModernCanvas = ModernCanvas.ModernCanvasBase;

//
// Copyright (C) Microsoft. All rights reserved.
//
// Represents a bookmark that can be used to find a range at a later time, even if the DOM has become de-normalized.
//

/*global ModernCanvas,Jx,Debug,Node*/

Jx.delayDefine(ModernCanvas, ["RangeBookmark", "DeserializedRangeBookmark"], function () {

    ModernCanvas.RangeBookmark = /*@constructor*/function (range, boundaryElement) {
        /// <summary>Represents a bookmark that can be used to find a range at a later time, even if the DOM has become de-normalized.</summary>
        /// <param name="range" type="Range" optional="false">The range to bookmark.</param>
        /// <param name="boundaryElement" type="HTMLElement" optional="false">A common ancestor of the given range. Used as a reference point.</param>
        /// <returns type="ModernCanvas.RangeBookmark">An object that represents a bookmark that can be used to find a range at a later time, even if the DOM has become de-normalized.</returns>
        
        var boundaryNode = /*@static_cast(Node)*/boundaryElement;
        Debug.assert(boundaryNode.nodeType === Node.ELEMENT_NODE, "Expected boundary element to be an element node");
        var node = range.commonAncestorContainer;
        while (Boolean(node) && node !== boundaryNode) {
            node = node.parentNode;
        }
        Debug.assert(node === boundaryNode, "Expected range to be enclosed by boundary element");
        

        var startContainer = range.startContainer,
            startOffset = this._getCorrectedOffset(startContainer, range.startOffset);
        this._startDirections = this._getDirections(startContainer, startOffset, boundaryElement);

        if (!range.collapsed) {
            var endContainer = range.endContainer,
                endOffset = this._getCorrectedOffset(endContainer, range.endOffset);
            this._endDirections = this._getDirections(endContainer, endOffset, boundaryElement);
        }
    };

    ModernCanvas.RangeBookmark.fromStorage = function (obj) {
        /// <summary>Creates an instance of a RangeBookmark from a JSON object that was retrieved from application data storage.</summary>
        /// <param name="obj" type="Object">The JSON object that was de-serialized from application data storage.</param>
        return new ModernCanvas.DeserializedRangeBookmark(obj);
    };

    ModernCanvas.DeserializedRangeBookmark = /*@constructor*/function (obj) {
        /// <summary>A RangeBookmark that is derived from a JSON object that was retrieved from application data storage.</summary>
        /// <param name="obj" type="Object">The JSON object that was de-serialized from application data storage.</param>
        var rangeBookmarkObject = /*@static_cast(ModernCanvas.RangeBookmark)*/obj;
        Debug.assert(rangeBookmarkObject, "Expected rangeBookmarkObject to be a JSON object");
        Debug.assert(rangeBookmarkObject._startDirections instanceof Array, "Expected _startDirections to be an array");
        Debug.assert(!rangeBookmarkObject._endDirections || rangeBookmarkObject._endDirections instanceof Array, "Expected _endDirections to be null or an array");

        this._startDirections = rangeBookmarkObject._startDirections;
        this._endDirections = rangeBookmarkObject._endDirections;
    };

    Jx.inherit(ModernCanvas.DeserializedRangeBookmark, ModernCanvas.RangeBookmark);

    var proto = ModernCanvas.RangeBookmark.prototype;

    proto._getCorrectedOffset = function (node, offset) {
        /// <summary>Corrects the offset based on the given node and offset.</summary>
        /// <param name="node" type="Node" optional="false">The node that contains the offset.</param>
        /// <param name="offset" type="Number" optional="false">An offset into the node.</param>
        /// <returns type="Number">The corrected offset.</returns>
        // IE bug: offset is sometimes larger than it should be! Constrain offset to the range [0, node.length]
        /// <disable>DeclarePropertiesBeforeUse</disable>
        if (typeof node.length === "number") {
            /// <enable>DeclarePropertiesBeforeUse</enable>
            offset = Math.min(offset, node.length);
        } else {
            offset = Math.min(offset, node.childNodes.length);
        }

        return offset;
    };

    proto._getDirections = function (node, offset, boundaryElement) {
        /// <summary>Computes directions to the given node using the boundaryElement as a reference point.</summary>
        /// <param name="node" type="Node" optional="false">The node that contains the offset.</param>
        /// <param name="offset" type="Number" optional="false">An offset into the node.</param>
        /// <param name="boundaryElement" type="HTMLElement" optional="false">An ancestor of the given node. Used as a reference point.</param>
        /// <returns type="Array">The directions to the given node.</returns>
        var element = this._getNearestElement(node),
            directions = [];

        // Windows 8 Bugs #350733 - normalize() causes selection to move. We can't call normalize, so we must assume text nodes 
        // can become fragmented. Therefore, we can only remember if the offset is either between two element nodes or at a 
        // specific point within text. Here is an visual example, with valid offsets ranging between 0x0 and 0xf inclusive:
        //
        // <div> H i <span>...</span> <br> <span>...</span> t h e r e <img> </div>
        //      0 1 2                3    4                5 6 7 8 9 a     b
        // 
        // The Range object actually provides slightly more fine-grained positioning by differentiating between being
        // just before a text node and at the first position inside that text node:
        // <div> [ H i ] <span>...</span> <br> <span>...</span> [ t h e r e ] <img> </div>
        //      0[0 1 2]1                2    3                4[0 1 2 3 4 5]5     6
        //
        // However, if any of those text nodes becomes fragmented it creates 2 new positions and our bookmark wouldn't know
        // which to choose, so we can't support the fine-grained positioning:
        // <div> [ H i ] <span>...</span> <br> <span>...</span> [ t h e ] [ r e ] <img> </div>
        //      0[0 1 2]1                2    3                4[0 1 2 3]5[0 1 2]6     7
        var currentNode, horizontalDistance;
        if (/*@static_cast(Node)*/element === node) {
            // The node is an element and the offset is therefore a position between child elements. Start from the offset and work backwards.
            horizontalDistance = 0;
            currentNode = (offset > 0 ? node.childNodes.item(offset - 1) : null);
        } else {
            // The node is a text node and the offset is therefore a position within the text. Remember the offset and work backwards from the previous node.
            horizontalDistance = offset;
            currentNode = node.previousSibling;
        }

        var parentNode = /*@static_cast(Node)*/element,
            nodeName = node.nodeName;
        while (currentNode !== /*@static_cast(Node)*/boundaryElement) {
            while (/*@static_cast(Boolean)*/currentNode) {
                /// <disable>DeclarePropertiesBeforeUse</disable>
                if (typeof currentNode.length === "number") {
                    /// <enable>DeclarePropertiesBeforeUse</enable>
                    // Because text nodes can become fragmented, (e.g. "hello world" might become "hello " and "world") we use the length of text nodes as part of the directions.
                    horizontalDistance += currentNode.length;
                } else {
                    // Each element node counts as 1.
                    horizontalDistance++;
                }

                // This will hit null eventually.
                currentNode = currentNode.previousSibling;
            }

            // Each direction contains a number representing how far into this horizontal DOM "layer" we will need to walk before dropping down into a child node. We also store
            // the node name of each node where we drop down to a child node to help ensure correctness when re-tracing our steps.
            directions.push({
                horizontalDistance: horizontalDistance,
                nodeName: nodeName
            });
            horizontalDistance = 0;

            currentNode = parentNode;
            parentNode = currentNode.parentNode;
            nodeName = currentNode.nodeName;
        }

        return directions;
    };

    proto._getNearestElement = function (node) {
        /// <summary>Gets the nearest element based on the given node.</summary>
        /// <param name="node" type="Node" optional="false">The node to get an element for.</param>
        /// <returns type="HTMLElement">The given node, if it is an element. Otherwise, the node's parent element.</returns>
        /// <disable>DeclarePropertiesBeforeUse</disable>
        node = (typeof node.length === "number" ? node.parentNode : node);
        /// <enable>DeclarePropertiesBeforeUse</enable>

        Debug.assert(node.nodeType === Node.ELEMENT_NODE);
        return /*@static_cast(HTMLElement)*/node;
    };

    proto.getBookmarkedRange = function (boundaryElement) {
        /// <summary>Returns the bookmarked range.</summary>
        /// <param name="boundaryElement" type="HTMLElement" optional="false">An ancestor of the bookmarked range. Used as a reference point.</param>
        /// <returns type="Range">The bookmarked range.</returns>
        var range = boundaryElement.ownerDocument.createRange(),
            startPosition = this._followDirections(boundaryElement, this._startDirections);
        if (!startPosition) {
            return null;
        }

        range.setStart(startPosition.node, startPosition.offset);

        // The range could have been collapsed, in which case we did not bother getting directions for the end position.
        if (this._endDirections) {
            var endPosition = this._followDirections(boundaryElement, this._endDirections);
            if (!endPosition) {
                return null;
            }

            range.setEnd(endPosition.node, endPosition.offset);
        }

        return range;
    };

    proto._followDirections = function (startElement, directions) {
        /// <summary>Follows the given directions and returns the position they lead to.</summary>
        /// <param name="startElement" type="HTMLElement" optional="false">The starting point for the directions.</param>
        /// <param name="directions" type="Array" optional="false">The directions that lead to the bookmarked position.</param>
        /// <returns type="__ModernCanvas.Position">The bookmarked position.</returns>
        Debug.assert(directions.length > 0, "Expected non-empty directions");

        var parentNode = /*@static_cast(Node)*/null,
            currentNode = /*@static_cast(Node)*/startElement,
            nextSibling = /*@static_cast(Node)*/null,
            childNodeIndex = 0,
            currentDirection,
            horizontalDistance;
        /// <disable>AvoidImplicitTypeCoercion</disable>
        for (var i = directions.length; i--; ) {
            /// <enable>AvoidImplicitTypeCoercion</enable>
            // Each direction operates on a horizontal "layer" of the DOM (e.g. sibling nodes), so we drop down to the first child at the beginning of each direction.
            parentNode = currentNode;
            nextSibling = currentNode.firstChild,
            currentNode = null;
            childNodeIndex = 0;

            // Each direction contains a number representing how far into the DOM sibling chain we should walk.
            currentDirection = /*@static_cast(__ModernCanvas.Direction)*/directions[i];

            horizontalDistance = currentDirection.horizontalDistance;
            while (horizontalDistance > 0) {
                currentNode = nextSibling;
                if (!currentNode) {
                    // We still have horizontal distance to travel, but there is no next sibling so we can't proceed.
                    return null;
                }
                nextSibling = currentNode.nextSibling;
                childNodeIndex++;

                /// <disable>DeclarePropertiesBeforeUse</disable>
                if (typeof currentNode.length === "number") {
                    /// <enable>DeclarePropertiesBeforeUse</enable>
                    // Because text nodes can become fragmented, (e.g. "hello world" might become "hello " and "world") we use the length of text nodes as part of the directions.
                    horizontalDistance -= currentNode.length;
                } else {
                    // Each element node counts as 1.
                    horizontalDistance--;
                }
            }

            // Make sure the name of the node that we landed on matches the name of the node that the directions were computed for. We don't verify here on the last direction  
            // because the final node can vary slightly (e.g. it might point to either just before a text node or to the very first position inside the text node).
            if (i > 0 && currentNode.nodeName !== currentDirection.nodeName) {
                return null;
            }
        }

        // Where did we end up after following the directions?
        if (!currentNode) {
            Debug.assert(horizontalDistance === 0, "Expected last direction's horizontal distance to be 0 because currentNode === null");
            /// <disable>DeclarePropertiesBeforeUse</disable>
            if (Boolean(nextSibling) && typeof nextSibling.length === "number") {
                /// <enable>DeclarePropertiesBeforeUse</enable>
                // If the first child is a text node, then return that.
                currentNode = nextSibling;
            } else {
                // Otherwise, the currentDirection is directly before the first element, so we express that as an offset into positions between child elements.
                currentNode = parentNode;
            }
            /// <disable>DeclarePropertiesBeforeUse</disable>
        } else if (typeof currentNode.length === "number") {
            /// <enable>DeclarePropertiesBeforeUse</enable>
            // We just subtracted this, so rewind by adding it back in.
            horizontalDistance += currentNode.length;
        } else {
            // The currentDirection is directly after this element's end tag, so we express that as an offset into positions between child elements.
            currentNode = parentNode;
            horizontalDistance = childNodeIndex;
        }

        return {
            node: currentNode,
            offset: horizontalDistance
        };
    };

    proto.equals = function (bookmark) {
        /// <summary>Returns true if this bookmark is the same as the passed in bookmark.</summary>
        /// <param name="bookmark" type="RangeBookmark">The bookmark to compare.</param>
        /// <returns type="Boolean">True if equal</returns>

        if (!bookmark) {
            return false;
        }
        Debug.assert(Jx.isObject(bookmark));

        return this._compareDirections(this._startDirections, bookmark._startDirections) &&
            this._compareDirections(this._endDirections, bookmark._endDirections);
    };

    proto._compareDirections = function (first, second) {
        /// <summary>Returns true if the two bookmark directions are the same.</summary>
        /// <param name="first" type="Array" optional="true">The first list to compare.</param>
        /// <param name="second" type="Array" optional="true">The second list to compare.</param>
        /// <returns type="Boolean">True if equal</returns>

        if (!first && !second) {
            // They are both null, so they are equal.
            return true;
        } else if (!first || !second) {
            // At least one must be non-null, so if either are null they are not equal.
            return false;
        }

        Debug.assert(Jx.isArray(first) && Jx.isArray(second));

        if (first.length !== second.length) {
            return false;
        }

        for (var i = first.length; i--;) {
            if (!this._compareDirection(first[i], second[i])) {
                return false;
            }
        }
        return true;
    };

    proto._compareDirection = function (first, second) {
        /// <summary>Returns true if the two bookmark directions are the same.</summary>
        /// <param name="first" type="Object">The first direction to compare.</param>
        /// <param name="second" type="Object">The second direction to compare.</param>
        /// <returns type="Boolean">True if equal</returns>

        return first.horizontalDistance === second.horizontalDistance &&
            first.nodeName === second.nodeName;
    };

    proto._startDirections = /*@static_cast(Array)*/null;
    proto._endDirections = /*@static_cast(Array)*/null;

});

//
// Copyright (C) Microsoft. All rights reserved.
//

/*globals Jx, ModernCanvas, Debug, Range, toStaticHTML */
/*jshint browser:true*/
Jx.delayDefine(ModernCanvas, "AutoReplaceManager", function () {

    ModernCanvas.AutoReplaceManager = function (className, autoReplaceTables) {
        /// <summary>An auto-replace control.</summary>
        /// <param name="className" type="String" optional="true">The class of AutoReplaceManager to instance.  If not defined the default will be used.</param>
        /// <param name="autoReplaceTables" type="ModernCanvas.AutoReplaceManagerTables" optional="true"></param>

        // REGEX styled rules:
        //    ">foo> bar" means a pointer whose key is of type foo, pointing to an element of type bar
        //    ">'foo'> bar" means a pointer whose key is the literal value 'foo', pointing to an element of type bar
        //    ">index> bar" means a pointer whose key is an incremented integer, pointing to an element of type bar
        //
        // Data structures being maintained:
        // _realTimeTree - used for all conversions that happen while typing
        //     REGEX styled rules of the structure:
        //         _realTimeTree [>char> charNode]*
        //         charNode [[>char> charNode]+ | [>char> endNode]]
        //         endNode [>'type'> ModernCanvas.NodeType] & [>'value'> replacementValue]
        //
        //         NOTE: These rules do not cover the concept of "flagged" rules, where the 'type' and 'value' literal
        //             strings are appended with the corresponding ModernCanvas.FlagType string.
        //     EXAMPLE:
        //         _realTimeTree = {
        //           "A": {
        //               "type": "ignore",
        //               "value": "",
        //               "typeacute": "string",
        //               "valueacute": "&Aacute;"
        //           },
        //           ")": {
        //             ":": {
        //               "type": "element",
        //               "value": "smiley"
        //             },
        //             "c": {
        //               "(": {
        //                 "type": "string",
        //                 "value": "©"
        //               }
        //             }
        //           }
        //         }
        // _bulkTables - used for all conversions that apply to an entire existing string
        //     element - used to convert from element tags in the bulk string
        //         REGEX styled rules of the structure:
        //             element [>elementName> elementNode]*
        //             elementNode [>className> endNode]+
        //             endNode [>'type'> ModernCanvas.NodeType] & [>'value'> replacementValue]
        //         EXAMPLE:
        //             element = {
        //               "smiley": {
        //                 "translateForFacebook": {
        //                   "type": "element",
        //                   "value": "facebookSmiley"
        //                 }
        //                 "downConvert": {
        //                   "type": "string",
        //                   "value": ":)"
        //                 }
        //               }
        //               "facebookSmiley": {
        //                 "downConvert": {
        //                   "type": "string",
        //                   "value": ":)"
        //                 }
        //               }
        //             }
        //     string - used to convert from strings in the bulk string
        //         REGEX styled rules of the structure:
        //             string [>char> charNode]*
        //             charNode [[>char> charNode]+ | [>char> endNode]]
        //             endNode [>'type'> ModernCanvas.NodeType] & [>'value'> replacementValue]
        //         EXAMPLE:
        //             string = {
        //               "" : {
        //                 ")": {
        //                   ":": {
        //                     "type": "element",
        //                     "value": "smiley"
        //                   },
        //                   "c": {
        //                     "(": {
        //                       "type": "string",
        //                       "value": "©"
        //                     }
        //                   }
        //                 },
        //               },
        //               "downConvert": {
        //                 "©": {
        //                   "type": "string",
        //                   "value": "(c)"
        //                 }
        //               }
        //               "facebook": {
        //                 ")": {
        //                   ":": {
        //                     "type": "element",
        //                     "value": "facebookSmiley"
        //                   }
        //                 }
        //               }
        //             }
        // _elements = hash table of element names pointing to element html
        //     EXAMPLE:
        //         elements = {
        //             "smiley": "<img src='img/smiley.png' />",
        //             "facebookSmiley": "<img src='img/smiley2.png' />"
        //         }
        ModernCanvas.Component.call(this);

        // Initialize all parameters
        this._autoReplaceTables = autoReplaceTables || ModernCanvas.AutoReplaceManagerTables.instance();
        this._className = className || "default";
        Debug.assert(Boolean(ModernCanvas.AutoReplaceManager.Classes[this._className]), "className must be a defined class");
        this._currentFlag = "";

        // Try to build the workspace element, but if we are on a web-worker it might fail
        try {
            this._workspace = document.createElement("div");
        } catch (ex) { }

        this._assumeFinishingKeyStroke = this._assumeFinishingKeyStroke.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    };
    Jx.inherit(ModernCanvas.AutoReplaceManager, ModernCanvas.Component);

    var replacementCharacter = ModernCanvas.AutoReplaceManager.replacementCharacter = "\uEFFF";

    var managerProto = ModernCanvas.AutoReplaceManager.prototype;
    managerProto._assumeFinishingKeyStroke = function (e) {
        /// <summary>Reacts assuming that the final keystroke of a replacement may have just been executed.</summary>
        /// <param name="e" type="Event"></param>
        ModernCanvas.mark("AutoReplaceManager.assumeFinishingKeyStroke", ModernCanvas.LogEvent.start);
        var node = this._autoReplaceTables.getRealTimeTree(),
            ownerDocument = this.getDocument(),
            searchInfo = this.getTextSearchInfo(false);

        if (searchInfo) {
            var m = searchInfo.preString.length,
                searchString = searchInfo.preString,
                selectionRange = searchInfo.selection,
                searchRange = searchInfo.searchRange,
                tempNode = node;
            // Looping backwards through the text range
            while (Boolean(tempNode) && Boolean(m--)) {
                // Attempt to find the character in the replacement tree
                node = tempNode;
                tempNode = node[searchString.charAt(m)];
            }
            if (tempNode) {
                node = tempNode;
                // If there was no previous sibling, check if there is a special case for this being at the beginning of a line. The
                // private Unicode code point of \ue000 is used in the auto replace definitions to represent the beginning of a line.
                // Note: this does not guarantee the beginning of the line, but gives a close guess without noticeably hurting perf
                if (!searchInfo.previousSibling) {
                    node = node["\ue000"] || node[""] || node;
                }
            }

            // Update if flags are defined
            var type = this._currentType,
                value = this._currentValue;
            // If the character marks a completed string we should act upon
            var nodeTypes = ModernCanvas.NodeType;
            if (Boolean(node) && Boolean(node[type]) && node[type] !== nodeTypes.ignore) {
                // Now that we are starting the undoable change (the auto-replacement) notify any listeners than an undoable change
                // is about to take place (selection is still at end of range where it should be)
                Jx.raiseEvent(this.getParent(), "beforeundoablechange");
                // Overwrite the auto-replaced content
                searchRange.deleteContents();
                // Add the replacement appropriately
                Debug.assert(nodeTypes[node[type]]);
                var holder;
                if (node[type] === nodeTypes.string) {
                    holder = ownerDocument.createElement("div");
                    holder.innerHTML = node[value];
                    Debug.assert(holder.childNodes.length === 1);
                    selectionRange.insertNode(holder.childNodes[0]);
                } else if (node[type] === nodeTypes.element) {
                    holder = ownerDocument.createElement("div");
                    holder.innerHTML = this.getElementHTML.call(this, node[value], "inbound");
                    Debug.assert(holder.childNodes.length === 1);
                    selectionRange.insertNode(holder.childNodes[0]);
                } else {
                    Debug.assert(node[type] === nodeTypes.command);
                    Jx.raiseEvent(this.getParent(), "command", { command: node[value], undoable: false, target: e.target });
                }
                // Put back the remainder of the removed text if any
                var remainder = searchString.substring(0, ++m);
                if (remainder.length > 0) {
                    selectionRange.insertNode(ownerDocument.createTextNode(remainder));
                }
                // Force the selection where it belongs
                // Depending on the starting state of the DOM and how some of the execCommands execute,
                // the original range and current selection range may not match up.  We want the one
                // furthest in to the document.  WinLive 404165.
                selectionRange.collapse(false);
                var currentSelectionRange = this.getSelectionRange();
                if (currentSelectionRange) {
                    currentSelectionRange.collapse(false);
                    if (selectionRange.compareBoundaryPoints(Range.START_TO_START, currentSelectionRange) > 0) {
                        this.replaceSelection(selectionRange);
                    } else {
                        this.replaceSelection(currentSelectionRange);
                    }
                } else {
                    this.replaceSelection(selectionRange);
                }
                // Clear the flags
                this.setFlag();
                // Notify any listeners than an undoable change has occurred.
                Jx.raiseEvent(this.getParent(), "undoablechange", { backspaceUndoable: node.backspaceUndoable });
            }
        }
        ModernCanvas.mark("AutoReplaceManager.assumeFinishingKeyStroke", ModernCanvas.LogEvent.stop);
    };
    managerProto._clearFlagOnNextKeyUp = false;
    managerProto._currentFlag = "";
    managerProto._currentType = "type";
    managerProto._currentValue = "value";
    managerProto._ensureBulkDefinitions = function (bulkClassNames) {
        /// <summary>Function to ensure that bulk definitions for the requested class have been loaded.</summary>
        /// <param name="bulkClassNames" type="Array">An array of classes for which to load the bulk definitions.</param>
        var className,
            loadedBulkClasses = this._autoReplaceTables.getLoadedBulkClasses();
        for (var m = bulkClassNames.length; m--;) {
            className = bulkClassNames[m];
            if (!loadedBulkClasses[className]) {
                this.addBulkTable(ModernCanvas.AutoReplaceManager.Classes[this._className].bulk[className], className);
                loadedBulkClasses[className] = true;
            }
        }
    };
    managerProto._ensureElementDefinitions = function () {
        /// <summary>Function to ensure that element definitions for the requested class have been loaded.</summary>
        this._ensureElementDefinitions = function () { };

        this.addElementTable(ModernCanvas.AutoReplaceManager.Classes[this._className].element);
    };
    managerProto._ensureRealTimeDefinitions = function () {
        /// <summary>Function to ensure that real time definitions for the requested class have been loaded.</summary>
        this._ensureRealTimeDefinitions = function () { };

        this.addRealTimeTable(ModernCanvas.AutoReplaceManager.Classes[this._className].realTime);
    };

    managerProto._regexElement = /(<style[^<]+<\/style>)|(<[^>]+>)/g;
    managerProto._regexElementDataName = /<[^>]*?data-name/i;
    managerProto._regexUnwrappedEntities = /&[^"'&<>; ]*;/gi;
    managerProto._regexWrappedEntities = /_(&[^"'&<>; ]*;)_/gi;
    managerProto._workspace = null;
    managerProto.addBulkTable = function (table, className) {
        this._autoReplaceTables.addBulkTable(table, className);
    };
    managerProto.addElementTable = function (table) {
        /// <summary>Adds a set of elements for use in any conversions.</summary>
        /// <param name="table" type="Object" optional="true">A hash table of format elementName -> HTML for element</param>
        this._autoReplaceTables.addElementTable(table);
    };
    managerProto.addRealTimeTable = function (table) {
        /// <summary>Adds a set of rules for real-time conversions.</summary>
        /// <param name="table" type="Array">An array of auto-replace arrays.  The inner arrays should be of the format: String FromValue,
        ///     ModernCanvas.NodeType ToType, String ToValue, (Optional) ModernCanvas.FlagType Flag. (FromType of String is assumed.  FromValue may either
        ///     be a String or Array of Strings)</param>
        this._autoReplaceTables.addRealTimeTable(table);
    };
    managerProto.bulkConvertRangeText = function (range, classNames) {
        /// <summary>Walk through all the text nodes in a Range and process them.</summary>
        /// <param name="range" type="Range">The Range to convert.</param>
        /// <param name="classNames" type="Array" optional="true">An array of class names to use, in order of preference.  If not specified the default will be used.</param>
        ModernCanvas.mark("AutoReplaceManager.bulkConvertRangeText", ModernCanvas.LogEvent.start);
        var that = this,
            common = range.commonAncestorContainer,
            iterator = common.ownerDocument.createNodeIterator(common, NodeFilter.SHOW_TEXT, function (node) {
                if (that.intersectsNode(range, node)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }, false),
            currentTextNode = iterator.nextNode();
        while (currentTextNode) {
            // Split the text node if the selection is within a text range.
            if (currentTextNode === range.endContainer && currentTextNode === range.startContainer) {
                if (range.startOffset > 0 || range.endOffset < currentTextNode.length) {
                    currentTextNode = currentTextNode.splitText(range.endOffset).previousSibling.splitText(range.startOffset);
                }
            } else if (currentTextNode === range.endContainer) {
                if (range.endOffset < currentTextNode.length) {
                    currentTextNode = currentTextNode.splitText(range.endOffset).previousSibling;
                }
            } else if (currentTextNode === range.startContainer) {
                if (range.startOffset > 0) {
                    currentTextNode = currentTextNode.splitText(range.startOffset);
                }
            }
            var nextNode =  iterator.nextNode();
            this.bulkConvertTextNode(currentTextNode, classNames);
            currentTextNode = nextNode;
        }
        ModernCanvas.mark("AutoReplaceManager.bulkConvertRangeText", ModernCanvas.LogEvent.stop);
    };
    managerProto.bulkConvertTextNode = function (textNode, classNames) {
        /// <summary>Converts a text node's content based on AutoReplace rules.</summary>
        /// <param name="textNode" type="TextNode">The text node to convert.</param>
        /// <param name="classNames" type="Array" optional="true">An array of class names to use, in order of preference.  If not specified the default will be used.</param>
        ModernCanvas.mark("AutoReplaceManager.bulkConvertTextNode", ModernCanvas.LogEvent.start);
        Debug.assert(textNode.nodeType === Node.TEXT_NODE, "Invalid text node to convert");       
        var node;
        this._workspace.innerText = "";
        this._workspace.appendChild(textNode.cloneNode(true));
        var html = this.bulkConvert(null, this._workspace, classNames);
        if (html !== this._workspace.innerHTML) {
            // We use a range to replace the text node because:
            // (1) we can't set HTML into textNode.data, it will get escaped and show as text instead
            // (2) we don't want to replace the parentNode's entire innerHTML because it likely contains more than just this text node
            var range = textNode.ownerDocument.createRange();
            range.selectNode(textNode);

            var fragment = range.createContextualFragment(html);
            range.deleteContents();
            range.insertNode(fragment);
        }
        ModernCanvas.mark("AutoReplaceManager.bulkConvertTextNode", ModernCanvas.LogEvent.stop);
    };
    managerProto.bulkConvertElement = function (htmlElement, classNames) {
        /// <summary>Converts an HTML element's content based on AutoReplace rules.</summary>
        /// <param name="htmlElement" type="HTMLElement">The HTML element to convert.</param>
        /// <param name="classNames" type="Array" optional="true">An array of class names to use, in order of preference.  If not specified the default will be used.</param>
        ModernCanvas.mark("AutoReplaceManager.bulkConvertElement", ModernCanvas.LogEvent.start);
        Debug.assert(htmlElement.nodeType === Node.ELEMENT_NODE, "Invalid htmlElement to convert");
        htmlElement.innerHTML = this.bulkConvert(null, htmlElement, classNames);
        ModernCanvas.mark("AutoReplaceManager.bulkConvertElement", ModernCanvas.LogEvent.stop);
    };
    managerProto.bulkConvertString = function (htmlString, classNames) {
        /// <summary>Converts a rich HTML string based on AutoReplace rules.</summary>
        /// <param name="htmlString" type="String">The HTML string to convert.</param>
        /// <param name="classNames" type="Array" optional="true">An array of class names to use, in order of preference.  If not specified the default will be used.</param>
        /// <returns type="String">An HTML string with the conversions.</returns>
        ModernCanvas.mark("AutoReplaceManager.bulkConvertString", ModernCanvas.LogEvent.start);
        Debug.assert(typeof htmlString === "string", "Invalid htmlString object");
        var result = this.bulkConvert(htmlString, null, classNames);
        ModernCanvas.mark("AutoReplaceManager.bulkConvertString", ModernCanvas.LogEvent.stop);
        return result;
    };
    managerProto.bulkConvert = function (htmlString, htmlElement, classNames) {
        /// <summary>Converts an HTML element or rich HTML string based on AutoReplace rules.</summary>
        /// <param name="htmlString" type="String">The HTML string to convert.</param>
        /// <param name="htmlElement" type="HTMLElement">The htmlElement to convert</param>
        /// <param name="classNames" type="Array" optional="true">An array of class names to use, in order of preference.  If not specified the default will be used.</param>        
        /// <returns type="String">An HTML string with the conversions.</returns>
        ModernCanvas.mark("AutoReplaceManager.bulkConvert", ModernCanvas.LogEvent.start);
        Debug.assert(htmlString === null || typeof htmlString === "string", "Invalid htmlString object");
        Debug.assert(htmlElement === null || htmlElement.nodeType === Node.ELEMENT_NODE, "Invalid htmlElement to convert");
        classNames = classNames || this._autoReplaceTables.getCurrentBulkClasses();
        Debug.assert(classNames instanceof Array);
        this._ensureBulkDefinitions(classNames);

        // First check if we have an element to work in, if not we are probably on a web worker                
        if (this._workspace) {
            if (Boolean(htmlElement) || this._regexElementDataName.test(htmlString)) {
                // Get an element to work in       
                var workspace = this._workspace;
                if (htmlElement) {
                    workspace = this.discardableClone(htmlElement, true);
                } else if (htmlString) {
                    // Drop the html string into the element
                    workspace.innerHTML = toStaticHTML(htmlString);
                } else {
                    Debug.assert(false, "Invalid input");
                }
                this.bulkElementConversion(workspace, classNames);
                htmlString = workspace.innerHTML;
            }
        }

        if (!htmlString && Boolean(htmlElement)) {
            htmlString = htmlElement.innerHTML;
        }

        htmlString = this.bulkStringConversion(htmlString, classNames);

        ModernCanvas.mark("AutoReplaceManager.bulkConvert", ModernCanvas.LogEvent.stop);
        return htmlString;
    };

    managerProto.bulkElementConversion = function (workspace, classNames, range) {
        /// <summary>Applies only element based AutoReplace rules.</summary>
        /// <param name="workspace" type="HTMLElement">The htmlElement to convert</param>
        /// <param name="classNames" type="Array" optional="true">An array of class names to use, in order of preference.  If not specified the default will be used.</param>        
        /// <param name="range" type="Range" optional="true">If a range is provided only elements that interect the range will be processed</param>
        ModernCanvas.mark("AutoReplaceManager.bulkConvertString.elementConversion", ModernCanvas.LogEvent.start);

        classNames = classNames || this._autoReplaceTables.getCurrentBulkClasses();
        Debug.assert(classNames instanceof Array);
        this._ensureBulkDefinitions(classNames);

        var numClasses = classNames.length,
            nodeTypes = ModernCanvas.NodeType;

        // If we have an element that should be auto-converted
        // NOTE: Element parsing is very complex, so we need to drop this in an element to sort through it

        // Load/declare variables
        var tree = this._autoReplaceTables.getBulkTables().element,
            element,
            node,
            n,
            className,
            textStyle,
            replacementString,
            styledElement,
            fontElement;
        // Get all the elements that may need converting
        var elements = workspace.querySelectorAll("[data-name]");
        // Loop through all the elements
        for (var m = elements.length; m--;) {
            // Fetch the element and it's unique ID
            element = elements[m];
            if (Boolean(range) && !this.intersectsNode(range, element)) {
                continue;
            }
            node = tree[element.getAttribute("data-name")];
            // If we have a record in the tree for that ID
            if (node) {
                // Loop through all the classes
                for (n = 0; n < numClasses; n++) {
                    // If a current class has a special case for this node
                    className = classNames[n];
                    if (node[className]) {
                        // Switch the node to the class and stop searching
                        node = node[className];
                        break;
                    }
                }
            }
            // If an end node was found
            if (Boolean(node) && Boolean(node.type)) {
                // Create the element replacement
                if (node.type === nodeTypes.string) {
                    // If we are replacing with a string, check to see if there is a text style we should be applying
                    textStyle = element.getAttribute("data-textstyle");
                    if (textStyle) {
                        replacementString = '<span data-externalstyle="false" style="' + textStyle + '">' + node.value + '</span>';
                    } else {
                        replacementString = node.value;
                    }
                } else {
                    Debug.assert(node.type === nodeTypes.element, "Unrecognized node type");
                    replacementString = this.getElementHTML(node.value, className);
                }
                // Replace the element
                element.insertAdjacentHTML("beforebegin", replacementString);

                // Move any internal comments to the end of the replacement
                var iterator = element.ownerDocument.createNodeIterator(element, NodeFilter.SHOW_COMMENT, null, false),
                    commentNode = iterator.nextNode();
                while (commentNode) {
                    element.parentNode.insertBefore(commentNode, element);
                    commentNode = iterator.nextNode();
                }
                element.parentNode.removeChild(element);
            }
        }
        ModernCanvas.mark("AutoReplaceManager.bulkConvertString.elementConversion", ModernCanvas.LogEvent.stop);
        return elements.length > 0;
    };

    managerProto.bulkStringConversion = function (htmlString, classNames) {
        /// <summary>Converts only string based AutoReplace rules.</summary>
        /// <param name="htmlString" type="String">The HTML string to convert.</param>
        /// <param name="classNames" type="Array" optional="true">An array of class names to use, in order of preference.  If not specified the default will be used.</param>        
        ModernCanvas.mark("AutoReplaceManager.bulkConvertString.stringConversion", ModernCanvas.LogEvent.start);

        classNames = classNames || this._autoReplaceTables.getCurrentBulkClasses();
        Debug.assert(classNames instanceof Array);
        this._ensureBulkDefinitions(classNames);

        var numClasses = classNames.length,
            nodeTypes = ModernCanvas.NodeType;

        // Wrap all html entities
        htmlString = htmlString.replace(this._regexUnwrappedEntities, "_$0_");

        // Replace all strings
        // Cycle through all the classes
        var i,
            j,
            matchLength,
            newHtmlString = "",
            closingTagIndex,
            openingTagIndex;
        for (var n = 0; n < numClasses; n++) {
            var className = classNames[n],
                tree = this._autoReplaceTables.getBulkTables().string[className];
            // If this class is defined
            if (Boolean(tree) && Boolean(tree.hasContent)) {
                // Get all HTML elements
                // NOTE: This is not perfect, but the possible missed cases are so small and pose no security vulnerability
                // that they are worthwhile for the perf improvements this provides.
                var replacementBuffer = htmlString.match(this._regexElement) || [];
                this._autoReplaceTables.setReplacementBuffer(replacementBuffer);

                // If we found any HTML elements, replace them all with placeholder characters so that we don't take the time to parse them
                if (Boolean(replacementBuffer) && replacementBuffer.length > 0) {
                    htmlString = htmlString.replace(this._regexElement, replacementCharacter);
                }

                // Loop through all the letters
                i = htmlString.length;
                while (i > 0) {
                    // Search for a match starting from this index
                    var node = tree;
                    for (j = i; j--;) {
                        node = node[htmlString[j]];
                        if (!node) {
                            break;
                        }
                        if (node.type) {
                            // REPLACEMENT is now the node
                            // LENGTH of match is now (i - j)
                            matchLength = i - j;
                            break;
                        }
                    }
                    // If a replacement was found add it in to the string
                    if (Boolean(node) && Boolean(node.type)) {
                        if (node.type === nodeTypes.string) {
                            // If replacing a string with a string
                            newHtmlString = node.value + newHtmlString;
                        } else {
                            // Else if replacing a string with an image
                            Debug.assert(node.type === nodeTypes.element, "Unrecognized node type");
                            newHtmlString = this.getElementHTML(node.value, className) + newHtmlString;
                        }
                        // Finally, update the index location based on if a replacement was found
                        i -= matchLength;
                    } else {
                        // Else just tack on the letter and continue on
                        newHtmlString = htmlString[--i] + newHtmlString;
                    }
                }
                // Apply the changes and reset the new string
                htmlString = newHtmlString;
                newHtmlString = "";
            }
        }

        // Unwrap all html entities
        htmlString = htmlString.replace(this._regexWrappedEntities, "$1");

        ModernCanvas.mark("AutoReplaceManager.bulkConvertString.stringConversion", ModernCanvas.LogEvent.stop);

        // Return the now processed html string
        return htmlString;
    };
    managerProto.getElementHTML = function (uniqueId, autoReplaceClassName) {
        /// <summary>Generates the HTML string for a given element.</summary>
        /// <param name="uniqueId" type="String">The unique ID for the element to generate the HTML.</param>
        /// <param name="autoReplaceClassName" type="String">The name of the class for which to generate the HTML.</param>
        /// <returns type="String">An HTML string with the newly formed element tag.</returns>
        this._ensureElementDefinitions();
        var elements = this._autoReplaceTables.getElements();
        Debug.assert(typeof elements[uniqueId] === "string", "Unexpected element entry type: " + (typeof elements[uniqueId]));
        return elements[uniqueId];
    };
    managerProto.onKeyDown = function (e) {
        /// <summary>Listener that converts typed content in an editable region.</summary>
        /// <param name="e" type="Event">A keystroke that may have triggered an auto-replacement.</param>
        ModernCanvas.mark("AutoReplaceManager.onKeyDown", ModernCanvas.LogEvent.start);
        // If this keystroke did not come from an IME
        if (e.keyCode !== 229) {
            var key = e.key;
            // If the key is a shift or control key
            if (key === "Shift" || key === "Control") {
                // Mark that this key should not clear the flags when processed
                this._clearFlagOnNextKeyUp = false;
            } else {
                // Use e.char because it represents what will be inserted into the DOM and keys like Backspace, Delete, Up, 
                // Down, Left, Right, etc, don't actually insert characters.
                var char = e.char || "";

                // Otherwise mark that this should clear the flags when processed
                this._clearFlagOnNextKeyUp = true;

                // Make sure we have definitions loaded
                this._ensureRealTimeDefinitions();

                // If the key completes a sequence
                // NOTE: We have to pull the last character of the char because it may actually be multiple characters (e.g. Emoji from soft keyboard)
                if (this._autoReplaceTables.getRealTimeTree()[char.substr(char.length - 1)]) {
                    // We use setImmediate to allow checking for an auto-replacement as early as possible without having to take over initial character insertion logic
                    // The progress of events goes roughly:
                    // keyDown - let's us know that the character may be inserted
                    // keyPress - let's us know that the character is going to be inserted
                    // DOMCharacterDataModified - has the HTML modified for the keystroke, but without an updated selection point
                    // #Point at which the setImmediate will get to run# - Selection has been updated as well
                    // keyUp - let's us know that the key has been released.  Unfortunately it's possible for another key to be pressed before we get to this point,
                    // which means that we no longer know what the last keystroke was.

                    this.getWindow().setImmediate(this._assumeFinishingKeyStroke, e);
                }
            }
        }
        ModernCanvas.mark("AutoReplaceManager.onKeyDown", ModernCanvas.LogEvent.stop);
    };
    managerProto.onKeyUp = function (e) {
        /// <summary>Listener that converts typed content in an editable region.</summary>
        /// <param name="e" type="Event">A keystroke that may have triggered an auto-replacement.</param>
        ModernCanvas.mark("AutoReplaceManager.onKeyUp", ModernCanvas.LogEvent.start);
        // If this keystroke did not come from an IME and marked to clear the current flag
        if (e.keyCode !== 229 && this._clearFlagOnNextKeyUp) {
            // Clear the flag
            this.setFlag();
            // Clear the flag saying that we should clear on keystrokes to gaurd against keyup events
            // without corresponding keydown events
            this._clearFlagOnNextKeyUp = false;
        }
        ModernCanvas.mark("AutoReplaceManager.onKeyUp", ModernCanvas.LogEvent.stop);
        return true;
    };
    managerProto.setDefaultClasses = function (classNames) {
        /// <summary>Sets the default classes for all future auto-replacements.</summary>
        /// <param name="classNames" type="Array">An array of class names to use for all replacements, in order of preferance.</param>
        Debug.assert(classNames instanceof Array);
        this._autoReplaceTables.setDefaultClasses(classNames);
    };
    managerProto.setFlag = function (newFlag) {
        /// <summary>Sets the current modifier flag.</summary>
        /// <param name="newFlag" type="ModernCanvas.FlagType" optional="true">The flag to set as the current modifier flag.  If undefined the flag will be cleared.</param>
        Debug.assert(!newFlag || ModernCanvas.FlagType[newFlag]);
        newFlag = newFlag || "";
        this._currentFlag = newFlag;
        this._currentType = "type" + newFlag;
        this._currentValue = "value" + newFlag;
    };

    ModernCanvas.AutoReplaceManager.Classes = {
        "default": {
            "element": {},
            "realTime": [
                // Assorted Symbols
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
                // Smart quotes
                ["\ue000\"", "string", "&ldquo;"],
                ["(\"", "string", "(&ldquo;"],
                ["[\"", "string", "[&ldquo;"],
                ["{\"", "string", "{&ldquo;"],
                ["<\"", "string", "<&ldquo;"],
                [" \"", "string", "&nbsp;&ldquo;"],
                ["\"", "string", "&rdquo;"],
                ["\ue000'", "string", "&lsquo;"],
                [" '", "string", "&nbsp;&lsquo;"],
                ["('", "string", "(&lsquo;"],
                ["['", "string", "[&lsquo;"],
                ["{'", "string", "{&lsquo;"],
                ["<'", "string", "<&lsquo;"],
                ["'", "string", "&rsquo;"],
                // Multi-stroke Symbols
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
                // Commands
                ["\ue000* ", "command", "bullets"],
                ["\ue000- ", "command", "bullets"],
                ["\ue0001. ", "command", "numbers"],
                ["\ue0001) ", "command", "numbers"]
            ],
            "bulk": {
                "outbound": [
                    ["string", "\u00A9", "string", "(c)"]
                ]
            }
        },
        empty: {
            "element": {},
            "realTime": [],
            "bulk": {}
        }
    };
});

//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="ModernCanvas.ref.js"/>

Jx.delayDefine(ModernCanvas, "AutoReplaceManagerTables", function () {

    ModernCanvas.AutoReplaceManagerTables = /*@constructor*/function () {
        /// <summary>
        /// Instance of AutoReplaceManager realtime and bulk convert tables. These are expensive to create, so reuse if at all possible.
        /// </summary>
        /// <remarks>
        /// This class is very tightly coupled wiht ModernCanvas.AutoReplaceManager, but serves the purpose of saving perf for multiple instances
        /// of auto replace managers.
        /// </remarks>
        this._realTimeTree = {};
        this._bulkTables = /*@static_cast(__ModernCanvas.BulkTables)*/{ element: {}, string: {}, stringIndex: {} };
        this._currentBulkClasses = [""];
        this._loadedBulkClasses = {};
        this._elements = {};
        this._replacementBuffer = /*@static_cast(Array)*/null;

        var replacementCharacter = ModernCanvas.AutoReplaceManager.replacementCharacter;
        Object.defineProperty(this._elements, replacementCharacter, {
            enumerable: false,
            configurable: true,
            get: function () {
                if (this._replacementBuffer) {
                    return this._replacementBuffer.pop();
                }
                Debug.assert(false, "Code tried to fetch the replacement value for the placeholder character (" + replacementCharacter + ") more times than anticipated.");
                return "";
            }.bind(this),
            set: function () {
                Debug.assert(false, "Shouldn't be trying to set this value");
            }
        });
    };

    ModernCanvas.AutoReplaceManagerTables.instance = function () {
        return new ModernCanvas.AutoReplaceManagerTables();
    };

    ModernCanvas.AutoReplaceManagerTables.prototype = {
        getRealTimeTree: function () {
            return this._realTimeTree;
        },

        getBulkTables: function () {
            return this._bulkTables;
        },

        getCurrentBulkClasses: function () {
            return this._currentBulkClasses;
        },

        getLoadedBulkClasses: function () {
            return this._loadedBulkClasses;
        },

        getElements: function () {
            return this._elements;
        },

        setReplacementBuffer: function (buffer) {
            ///<param name="buffer" type="Array"></param>
            Debug.assert(Jx.isArray(buffer));
            this._replacementBuffer = buffer;
        },

        setDefaultClasses: function (classNames) {
            /// <summary>Sets the default classes for all future auto-replacements.</summary>
            /// <param name="classNames" type="Array">An array of class names to use for all replacements, in order of preferance.</param>
            Debug.assert(Jx.isArray(classNames));
            this._currentBulkClasses = classNames;
        },

        addElementTable: function (table) {
            /// <summary>Adds a set of elements for use in any conversions.</summary>
            /// <param name="table" type="Object" optional="true">A hash table of format elementName -> HTML for element</param>
            ModernCanvas.mark("AutoReplaceManager.addElementTable", ModernCanvas.LogEvent.start);
            if (table) {
                var keys = Object.keys(table);
                for (var m = keys.length; m--; ) {
                    this._elements[keys[m]] = table[keys[m]];
                }
            }
            ModernCanvas.mark("AutoReplaceManager.addElementTable", ModernCanvas.LogEvent.stop);
        },

        addRealTimeTable: function (table) {
            /// <summary>Adds a set of rules for real-time conversions.</summary>
            /// <param name="table" type="Array">An array of auto-replace arrays.  The inner arrays should be of the format: String FromValue,
            ///     ModernCanvas.NodeType ToType, String ToValue, (Optional) ModernCanvas.FlagType Flag. (FromType of String is assumed.  FromValue may either
            ///     be a String or Array of Strings)</param>
            ModernCanvas.mark("AutoReplaceManager.addRealTimeTable", ModernCanvas.LogEvent.start);
            Debug.assert(Jx.isArray(table));
            var m,
                n,
                len,
                i,
                row,
                stringsTyped,
                stringTyped,
                character,
                currentNode,
                type,
                value;
            var tree = this._realTimeTree;
            // Go through each row in the table
            for (m = table.length; m--;) {
                row = table[m];
                // If the source string item is not an array of strings, wrap it in an array
                stringsTyped = /*@static_cast(Array)*/row[0];
                if (typeof stringsTyped === "string") {
                    stringsTyped = [stringsTyped];
                }
                Debug.assert(Jx.isArray(stringsTyped), "Failed to ensure stringsTyped is an array.");
                // Go through each of the input strings
                for (i = stringsTyped.length; i--;) {
                    currentNode = tree;
                    stringTyped = /*@static_cast(String)*/stringsTyped[i];
                    n = stringTyped.length;
                    len = n - 1;
                    for (; n--;) {
                        character = stringTyped.charAt(n);
                        if (!currentNode[character]) {
                            currentNode[character] = {};
                        }
                        currentNode = currentNode[character];
                    }

                    // Adjust based on flags
                    type = "type";
                    value = "value";
                    // The third column of each row is optional. It can either specify a boolean that overrides the
                    // backspaceUndoable property or a ModernCanvas.FlagType.
                    var option = row[3];
                    if (!Jx.isNullOrUndefined(option)) {
                        if (Jx.isBoolean(option)) {
                            currentNode.backspaceUndoable = option;
                        } else {
                            Debug.assert(ModernCanvas.FlagType[row[3]]);
                            type += row[3];
                            value += row[3];
                        }
                    } else {
                        // Default to true, since there was no third column specified
                        currentNode.backspaceUndoable = true;
                    }

                    currentNode[type] = row[1];
                    currentNode[value] = row[2];
                }
            }
            ModernCanvas.mark("AutoReplaceManager.addRealTimeTable", ModernCanvas.LogEvent.stop);
        },

        addBulkTable: function (table, className) {
            /// <summary>Adds a set of rules for either of the bulk conversions.</summary>
            /// <param name="table" type="Array">An array of auto-replace arrays.  The inner arrays should be of the format: FromType, FromValue,
            ///     ToType, ToValue. (FromValue may either be a String or Array of Strings)</param>
            /// <param name="className" type="String" optional="true">The class to file these rules under.  If not specified the default will be used.</param>

            // Check to see if there is any data to add.
            if (!Boolean(table)) {
                return;
            }

            ModernCanvas.mark("AutoReplaceManager.addBulkTable", ModernCanvas.LogEvent.start);

            // Add a reference to the needed placeholder character
            var replacementCharacter = ModernCanvas.AutoReplaceManager.replacementCharacter;
            table.push(["string", replacementCharacter, "element", replacementCharacter]);

            className = className || this._currentBulkClasses[0];
            Debug.assert(typeof className === "string");
            var elementTable = this._bulkTables.element;

            var temp = this._bulkTables.string;
            temp[className] = temp[className] || {};
            var stringTable = temp[className];

            var m,
                n,
                p,
                row,
                singleString,
                node,
                inputOptions,
                nodeTypes = ModernCanvas.NodeType;
            // Iterate through all the rows of the input table
            for (m = table.length; m--;) {
                row = table[m];
                inputOptions = row[1];
                if (typeof inputOptions === "string") {
                    inputOptions = [inputOptions];
                }
                // If the source is of type string
                if (row[0] === nodeTypes.string) {
                    stringTable.hasContent = true;
                    // Iterate through all the FROM strings
                    for (n = inputOptions.length; n--;) {
                        singleString = /*@static_cast(String)*/inputOptions[n];
                        node = /*@static_cast(__ModernCanvas.AutoReplaceManager.AutoReplaceTreeNode)*/stringTable;
                        // Iterate through all the letters in this FROM string
                        for (p = singleString.length; p--;) {
                            if (Boolean(node[singleString[p]])) {
                                node = node[singleString[p]];
                            } else {
                                node = node[singleString[p]] = /*@static_cast(__ModernCanvas.AutoReplaceManager.AutoReplaceTreeNode)*/{};
                            }
                        }
                        // Place the final values
                        node.type = row[2];
                        node.value = row[3];
                    }
                } else {
                    Debug.assert(row[0] === nodeTypes.element);
                    for (n = inputOptions.length; n--;) {
                        node = elementTable[inputOptions[n]] || /*@static_cast(__ModernCanvas.AutoReplaceManager.AutoReplaceTreeNode)*/{};
                        node[className] = { type: row[2], value: row[3] };
                        elementTable[inputOptions[n]] = node;
                    }
                }
            }
            ModernCanvas.mark("AutoReplaceManager.addBulkTable", ModernCanvas.LogEvent.stop);
        }
    };

});

//
// Copyright (C) Microsoft. All rights reserved.
//

/*jshint browser:true*/
/*global ModernCanvas, Jx, Debug, Windows*/

Jx.delayDefine(ModernCanvas, ["Command", "CommandManager"], function () {

    var C = window.ModernCanvas;

    C.Command = /*@constructor*/function (id, run, options) {
        /// <summary>An object representing a command.</summary>
        /// <param name="id" type="String">The name of the command.</param>
        /// <param name="run" type="Function">The function to execute when the command is fired.</param>
        /// <param name="options" type="__ModernCanvas.Command.Options" optional="true">A property bag containing options. Valid options are "undoable", "enabledOn", and "fireAfterCommand".</param>
        Debug.assert(typeof id === "string");
        Debug.assert(run);
        C.Component.call(this);
        this.id = id;
        this.run = run;

        if (options) {
            if (Jx.isNumber(options.enabledOn)) {
                this.enabledOn = options.enabledOn;
            }
            if (Jx.isBoolean(options.undoable)) {
                this.undoable = options.undoable;
            }
        }
        Debug.Events.define(this, "enabledchanged");
    };
    Jx.inherit(C.Command, C.Component);

    C.Command.EnableStates = {
        always: 0,
        hasSelection: 1,
        hasEditableSelection: 2,
        hasNonEmptySelection: 4,
        inLink: 8,
        notInLink: 16
    };

    var commandProto = C.Command.prototype;
    commandProto.enabled = true;
    commandProto.enabledOn = C.Command.EnableStates.hasSelection;
    commandProto.id = "commandId";
    commandProto.isEnabled = function (enabledInformation) {
        /// <summary>Defines if this command should be enabled.</summary>
        /// <param name="enabledInformation" type="Number">Bitwise combined EnableStates used to determine if the command should be enabled.</param>
        /// <returns type="Boolean">True if the command should be enabled, false otherwise.</returns>
        Debug.assert(Jx.isNumber(this.enabledOn));
        Debug.assert(Jx.isNumber(enabledInformation));
        return (this.enabledOn & enabledInformation) === this.enabledOn;
    };
    commandProto.run = function () {
        /// <summary>Executes the operations of the command.</summary>
        /// <param name="e" type="Event">The event that caused the command's execution.</param>
        /// <returns type="Boolean">True if this is an async function that will handle its own post-command event.  False (or nothing) otherwise.</returns>
        Debug.assert(false, "run should be defined in the instance.");
    };
    commandProto.undoable = true;

    C.CommandManager = /*@constructor*/function (className, modernCanvas) {
        /// <summary>A command routing manager.</summary>
        /// <param name="className" type="String" optional="true">The class of CommandManager to instance.  If not defined the default will be used.</param>
        /// <param name="modernCanvas" type="C.ModernCanvasBase" optional="true">A reference to the modern canvas object that will be managing this component.</param>
        C.Component.call(this);

        // Initialize variables
        this._className = className || "default";
        Debug.assert(Boolean(C.CommandManager.Classes[this._className]), "className must be a defined class");
        this._commands = {};
        this._queue = [];
        this.setModernCanvas(modernCanvas);

        // Bind functions
        this._processQueue = this._processQueue.bind(this);
        this.fireAfterCommand = this.fireAfterCommand.bind(this);
        this.updateEnabledStates = this.updateEnabledStates.bind(this);
    };
    Jx.inherit(C.CommandManager, C.Component);

    var managerProto = C.CommandManager.prototype;

    var classes = C.CommandManager.Classes = { empty: [] };
    classes.basic = [
            "accentAcute",
            "accentCedilla",
            "accentCircumflex",
            "accentDiaeresis",
            "accentGrave",
            "accentLigature",
            "accentRing",
            "accentSlash",
            "accentTilde",
            "copy",
            "cut",
            "pasteTextOnly",
            "quotedLink",
            "redo",
            "selectAll",
            "undo"
    ];
    classes.default =
        classes.basic.concat([
            "alignCenter",
            "alignLeft",
            "alignRight",
            "bold",
            "bullets",
            "clearFormatting",
            "directionLtr",
            "directionRtl",
            "growFont",
            "growFontOnePoint",
            "indent",
            "insertHyperlink",
            "italic",
            "numbers",
            "openLink",
            "outdent",
            "removeHyperlink",
            "setFontColor",
            "setFontFamily",
            "setFontHighlightColor",
            "setFontSize",
            "showHyperlinkControl",
            "shrinkFont",
            "shrinkFontOnePoint",
            "underline"
        ]);
    classes.full = classes.default.concat(["pasteFull"]);

    classes.calendar = classes.default;
    classes.chat = classes.basic;
    classes.mail = classes.full;
    classes.people = classes.basic;
    classes.stm = classes.full;

    var States = C.Command.EnableStates;
    C.CommandManager.CommandDefinitions = {};
    Object.defineProperties(C.CommandManager.CommandDefinitions, {
        accentAcute: {
            get: function () { return new C.Command("accentAcute", managerProto._accentAcute); }, enumerable: true
        },
        accentCedilla: {
            get: function () { return new C.Command("accentCedilla", managerProto._accentCedilla); }, enumerable: true
        },
        accentCircumflex: {
            get: function () { return new C.Command("accentCircumflex", managerProto._accentCircumflex); }, enumerable: true
        },
        accentDiaeresis: {
            get: function () { return new C.Command("accentDiaeresis", managerProto._accentDiaeresis); }, enumerable: true
        },
        accentGrave: {
            get: function () { return new C.Command("accentGrave", managerProto._accentGrave); }, enumerable: true
        },
        accentLigature: {
            get: function () { return new C.Command("accentLigature", managerProto._accentLigature); }, enumerable: true
        },
        accentRing: {
            get: function () { return new C.Command("accentRing", managerProto._accentRing); }, enumerable: true
        },
        accentSlash: {
            get: function () { return new C.Command("accentSlash", managerProto._accentSlash); }, enumerable: true
        },
        accentTilde: {
            get: function () { return new C.Command("accentTilde", managerProto._accentTilde); }, enumerable: true
        },
        alignCenter: {
            get: function () { return new C.Command("alignCenter", managerProto._alignCenter); }, enumerable: true
        },
        alignLeft: {
            get: function () { return new C.Command("alignLeft", managerProto._alignLeft); }, enumerable: true
        },
        alignRight: {
            get: function () { return new C.Command("alignRight", managerProto._alignRight); }, enumerable: true
        },
        bold: {
            get: function () { return new C.Command("bold", managerProto._bold); }, enumerable: true
        },
        bullets: {
            get: function () { return new C.Command("bullets", managerProto._bullets); }, enumerable: true
        },
        clearFormatting: {
            get: function () { return new C.Command("clearFormatting", managerProto._clearFormatting); }, enumerable: true
        },
        copy: {
            get: function () {
                return new C.Command("copy", managerProto._copy,
                    {
                        enabledOn: States.hasNonEmptySelection,
                        undoable: false
                    });
            }, enumerable: true
        },
        cut: {
            get: function () {
                return new C.Command("cut", managerProto._cut,
                    {
                        enabledOn: States.hasNonEmptySelection | States.hasEditableSelection
                    });
            }, enumerable: true
        },
        directionLtr: {
            get: function () { return new C.Command("directionLtr", managerProto._directionLtr); }, enumerable: true
        },
        directionRtl: {
            get: function () { return new C.Command("directionRtl", managerProto._directionRtl); }, enumerable: true
        },
        growFont: {
            get: function () { return new C.Command("growFont", managerProto._growFont); }, enumerable: true
        },
        growFontOnePoint: {
            get: function () { return new C.Command("growFontOnePoint", managerProto._growFontOnePoint); }, enumerable: true
        },
        indent: {
            get: function () { return new C.Command("indent", managerProto._indent); }, enumerable: true
        },
        insertHyperlink: {
            get: function () {
                return new C.Command("insertHyperlink", managerProto._insertHyperlink,
                    {
                        enabledOn: States.always
                    });
            }, enumerable: true
        },
        showHyperlinkControl: {
            get: function () {
                return new C.Command("showHyperlinkControl", managerProto._showHyperlinkControl,
                    {
                        undoable: false
                    });
            }, enumerable: true
        },
        italic: {
            get: function () { return new C.Command("italic", managerProto._italic); }, enumerable: true
        },
        numbers: {
            get: function () { return new C.Command("numbers", managerProto._numbers); }, enumerable: true
        },
        openLink: {
            get: function () {
                return new C.Command("openLink", managerProto._openLink,
                    {
                        enabledOn: States.inLink,
                        undoable: false
                    });
            }, enumerable: true
        },
        outdent: {
            get: function () { return new C.Command("outdent", managerProto._outdent); }, enumerable: true
        },
        paste: {
            get: function () {
                return new C.Command("paste", managerProto._paste,
                    {
                        enabledOn: States.hasEditableSelection
                    });
            }, enumerable: true
        },
        pasteContentOnly: {
            get: function () { return new C.Command("pasteContentOnly", managerProto._pasteContentOnly); }, enumerable: true
        },
        pasteFull: {
            get: function () { return new C.Command("pasteFull", managerProto._paste); }, enumerable: true
        },
        pasteTextOnly: {
            get: function () { return new C.Command("pasteTextOnly", managerProto._pasteTextOnly); }, enumerable: true
        },
        pasteTextOrSingleImage: {
            get: function () { return new C.Command("pasteTextOrSingleImage", managerProto._pasteTextOnly); }, enumerable: true
        },
        quotedLink: {
            get: function () {
                return new C.Command("quotedLink", managerProto._quotedLink,
                    {
                        undoable: false
                    });
            }, enumerable: true
        },
        redo: {
            get: function () {
                return new C.Command("redo", managerProto._redo,
                    {
                        undoable: false
                    });
            }, enumerable: true
        },
        removeHyperlink: {
            get: function () {
                return new C.Command("removeHyperlink", managerProto._removeHyperlink,
                    {
                        enabledOn: States.inLink | States.hasEditableSelection
                    });
            }, enumerable: true
        },
        selectAll: {
            get: function () {
                return new C.Command("selectAll", managerProto._selectAll,
                    {
                        enabledOn: States.hasEditableSelection,
                        undoable: false
                    });
            }, enumerable: true
        },
        setFontColor: {
            get: function () { return new C.Command("setFontColor", managerProto._setFontColor); }, enumerable: true
        },
        setFontFamily: {
            get: function () { return new C.Command("setFontFamily", managerProto._setFontFamily); }, enumerable: true
        },
        setFontHighlightColor: {
            get: function () { return new C.Command("setFontHighlightColor", managerProto._setFontHighlightColor); }, enumerable: true
        },
        setFontSize: {
            get: function () { return new C.Command("setFontSize", managerProto._setFontSize); }, enumerable: true
        },
        shrinkFont: {
            get: function () { return new C.Command("shrinkFont", managerProto._shrinkFont); }, enumerable: true
        },
        shrinkFontOnePoint: {
            get: function () { return new C.Command("shrinkFontOnePoint", managerProto._shrinkFontOnePoint); }, enumerable: true
        },
        underline: {
            get: function () { return new C.Command("underline", managerProto._underline); }, enumerable: true
        },
        undo: {
            get: function () {
                return new C.Command("undo", managerProto._undo,
                    {
                        undoable: false
                    });
            }, enumerable: true
        }
    });

    managerProto._commands = {};
    managerProto._ensureCommands = function () {
        /// <summary>Function to ensure that commands for the requested class have been loaded.</summary>
        this._ensureCommands = function () { };

        var commandDefinitions = C.CommandManager.CommandDefinitions,
            commands = /*@static_cast(Array)*/C.CommandManager.Classes[this._className];
        for (var m = commands.length; m--;) {
            var command = /*@static_cast(ModernCanvas.Command)*/commandDefinitions[commands[m]];
            command.run = command.run.bind(this);
            this.setCommand(command);
        }
    };
    managerProto._execute = function (e, command, showUserInterface, value) {
        /// <summary>Executes a pre-existing IE command.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        /// <param name="command" type="String">The name of the command to execute.</param>
        /// <param name="showUserInterface" type="Boolean" optional="true">Flag indicating that the user interface assossiated with the command should be shown.</param>
        /// <param name="value" type="Object" optional="true">The value that should be given to the command.  Usually a string.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isNonEmptyString(command), "Expected command to be a valid string");
        Debug.assert(Jx.isNullOrUndefined(showUserInterface) || Jx.isBoolean(showUserInterface), "Expected showUserInterface to be a boolean");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        // call the actual command
        ModernCanvas.mark("execCommand." + command, ModernCanvas.LogEvent.start);
        this.getDocument().execCommand(command, showUserInterface, value);
        ModernCanvas.mark("execCommand." + command, ModernCanvas.LogEvent.stop);
    };
    managerProto._executingCommandEvent = null;
    managerProto._modernCanvas = /*@static_cast(C.ModernCanvas)*/null;
    managerProto._isUndoable = function (e) {
        /// <summary>Returns true if the command event is undoable and false otherwise.</summary>

        // The event is allowed to override the undoability of the command.
        return Jx.isBoolean(e.undoable) ? e.undoable : this._commands[e.command].undoable;
    };
    managerProto._processQueue = function () {
        if (!this._executingCommandEvent && this._queue.length > 0) {
            // Fetch the next command event to respond to
            var e = /*@static_cast(__ModernCanvas.CommandManager.CommandEvent)*/this._queue.shift(),
                command = /*@static_cast(C.Command)*/this._commands[e.command];
            Debug.assert(Jx.isObject(command) && Jx.isFunction(command.run), "Expected valid command");
            // If the command doesn't exist or is disabled, ignore it.
            if (Boolean(command) && Boolean(command.run)) {
                this.updateEnabledStates([command], e);
                if (command.enabled) {
                    this._executingCommandEvent = e;
                    Jx.raiseEvent(this.getParent(), "beforecommand", e);
                    if (this._isUndoable(e)) {
                        Jx.raiseEvent(this.getParent(), "beforeundoablechange");
                    }
                    // Update usage data
                    var requestsFired = this._usageData[command.id] || 0;
                    this._usageData[command.id] = requestsFired + 1;
                    // Run the actual command.  If the command returns true that indicates that it is Async, so
                    // we should not fire the post commmand
                    if (!command.run(/*@static_cast(Event)*/e)) {
                        this.fireAfterCommand();
                    }
                }
            }
        }
    };
    managerProto._queue = [];
    managerProto._setFontStyle = function (styleAttribute, styleValue) {
        /// <summary>Sets the font style of the current selection.</summary>
        /// <param name="styleAttribute" type="String">The style object attribute name to set.</param>
        /// <param name="styleValue" type="String">The CSS value for the style attribute.</param>
        // The background-color property is not inherited, instead always defaulting to 'transparent'
        // Because of this if you change the size inside a region with a background color, the new size
        // does not effect the region the background color is applied.  To fix this we calculate what
        // the inherited background color would be and inline it.
        Debug.assert(Jx.isNonEmptyString(styleAttribute), "Expected styleAttribute to be a valid string");
        Debug.assert(Jx.isNonEmptyString(styleValue), "Expected styleValue to be a valid string");

        var applyStyling = function (wrapperElement) {
            /// <param name="wrapperElement" type="HTMLElement" />
            // If we need to force background inline
            if (styleAttribute !== "background-color") {
                // First see if we can find a background color to apply
                var backgroundElement = wrapperElement,
                    backgroundElementStyle = backgroundElement.style;
                // Walk up until we hit our first block element (or first that defines the background color)
                while (Boolean(backgroundElementStyle) &&
                    (backgroundElementStyle.backgroundColor === "" || backgroundElementStyle.backgroundColor === "transparent") &&
                    backgroundElementStyle.display !== "block") {
                    backgroundElement = backgroundElement.parentNode;
                    backgroundElementStyle = backgroundElement.style;
                }
                // Then if we found one, apply it
                if (Boolean(backgroundElement.style) && backgroundElement.style.backgroundColor !== "transparent") {
                    wrapperElement.style.backgroundColor = backgroundElement.style.backgroundColor;
                }
            }
            if (styleAttribute !== "font-family") {
                // Then apply the current styleValue, if it doesn't match
                if (wrapperElement.currentStyle[styleAttribute] !== styleValue) {
                    wrapperElement.style[styleAttribute] = styleValue;
                }
            } else {
                if (wrapperElement.getAttribute("face") !== styleValue) {
                    wrapperElement.setAttribute("face", styleValue);
                }
            }
        };

        var range = this.trimRange(this.getSelectionRange());
        if (!range) {
            return;
        }

        var iterator = this._createTextRangeIterator(range),
            currentRange = iterator.nextRange(),
            ownerDocument = this.getDocument(),
            startContainer,
            endContainer,
            firstWrapperNode,
            wrapperNode;
        /// <disable>JS3092.DeclarePropertiesBeforeUse,JS3057.AvoidImplicitTypeCoercion</disable>
        Debug.assert(currentRange, "Expected text range iterator to return at least one text range.  Range info { collapsed: " + range.collapsed +
            ", startOffset: " + range.startOffset + ", endOffset: " + range.endOffset + ", startContainerOuterHTML: " +
            (range.startContainer.outerHTML || range.startContainer.data) + ", endContainerOuterHTML: " + (range.endContainer.outerHTML || range.endContainer.data) + " }");
        /// <enable>JS3092.DeclarePropertiesBeforeUse,JS3057.AvoidImplicitTypeCoercion</enable>
        while (currentRange) {
            startContainer = /*@static_cast(TextNode)*/currentRange.startContainer;
            endContainer = /*@static_cast(TextNode)*/currentRange.endContainer;
            if (currentRange.startOffset === 0 &&
                currentRange.endOffset === endContainer.length &&
                !startContainer.previousSibling &&
                !endContainer.nextSibling &&
                this.isNodeName(/*@static_cast(Node)*/startContainer.parentNode, "FONT")) {
                // The text range is directly in a <font> tag and spans all the children of the <font> tag, 
                // so we can safely reuse the <font> tag.
                wrapperNode = /*@static_cast(HTMLElement)*/startContainer.parentNode;
            } else if (currentRange.startOffset === 0 &&
                currentRange.endOffset === endContainer.childNodes.length &&
                startContainer === endContainer &&
                this.isNodeName(/*@static_cast(Node)*/startContainer, "FONT")) {
                // The range *is* a <font> tag and spans all the children of the <font> tag,
                // so we can safely reuse the <font> tag.
                wrapperNode = /*@static_cast(HTMLElement)*/startContainer;
            } else {
                wrapperNode = ownerDocument.createElement("FONT");
                currentRange.surroundContents(/*@static_cast(Node)*/wrapperNode);
            }

            applyStyling(wrapperNode);
            if (!firstWrapperNode) {
                firstWrapperNode = wrapperNode;
            }
            currentRange = iterator.nextRange();
        }

        // Though incredibly hard to repro, we have hit edge cases where there were no valid ranges, even though
        // there was a selection range.  Therefore we have to first check that we used a wrapper node somewhere
        // before updating the range.
        Debug.assert(wrapperNode, "Expected text range iterator to return at least one text range.  Please file a bug *with repro steps* so that this case may be fixed.");
        if (firstWrapperNode && wrapperNode) {
            if (range.collapsed) {
                // If the range is now collapsed then both the start and end must have been in the same text node, 
                // so force the selection into the <font> tag that surrounds where that range was.
                range.selectNodeContents(/*@static_cast(Node)*/wrapperNode);
            } else {
                // The selection range has left gravity, so if it was in the middle of a text node and we wrap 
                // that text node in a <font> tag, then it moves:
                //      <p>Hel[lo</p></p>Wor]ld</p> ==> <p>[Hel<font>lo</font></p><p>]<font>Wor</font>ld</p>
                // We reset it here to make sure that the selection remains (to the user) the same.
                //      <p>[Hel<font>lo</font></p><p>]<font>Wor</font>ld</p> ==> <p>Hel<font>[lo</font></p><p><font>Wor]</font>ld</p>
                range.setStart(firstWrapperNode, 0);
                if (wrapperNode.lastChild) {
                    range.setEndAfter(wrapperNode.lastChild);
                } else {
                    range.setEndAfter(wrapperNode);
                }
            }

            this.replaceSelection(range);
        }
    };
    managerProto._accentAcute = function (e) {
        /// <summary>Marks the acute flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentAcute can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.acute);
    };
    managerProto._accentCedilla = function (e) {
        /// <summary>Marks the cedilla flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentCedilla can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.cedilla);
    };
    managerProto._accentCircumflex = function (e) {
        /// <summary>Marks the circumflex flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentCircumflex can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.circumflex);
    };
    managerProto._accentDiaeresis = function (e) {
        /// <summary>Marks the diaeresis flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentDiaeresis can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.diaeresis);
    };
    managerProto._accentGrave = function (e) {
        /// <summary>Marks the grave flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentGrave can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.grave);
    };
    managerProto._accentLigature = function (e) {
        /// <summary>Marks the ligature flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentLigature can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.ligature);
    };
    managerProto._accentRing = function (e) {
        /// <summary>Marks the ring flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentRing can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.ring);
    };
    managerProto._accentSlash = function (e) {
        /// <summary>Marks the slash flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentSlash can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.slash);
    };
    managerProto._accentTilde = function (e) {
        /// <summary>Marks the tilde flag for future keystrokes.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(this._modernCanvas, "accentTilde can only be used if there is a defined Modern Canvas");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._modernCanvas.components.autoReplaceManager.setFlag(C.FlagType.tilde);
    };
    managerProto._alignCenter = function (e) {
        /// <summary>Center aligns the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "JustifyCenter");
    };
    managerProto._alignLeft = function (e) {
        /// <summary>Left aligns the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "JustifyLeft");
    };
    managerProto._alignRight = function (e) {
        /// <summary>Right aligns the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "JustifyRight");
    };
    managerProto._bold = function (e) {
        /// <summary>Toggles bold on the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        var range = this.getSelectionRange(),
            oldStyles = {};
        if (range.collapsed) {
            oldStyles = this.getParent().getBasicSelectionStyles();
        }
        this._execute(e, "Bold");
        range = this.getSelectionRange();
        if (range.collapsed) {
            var newStyles = this.getParent().getBasicSelectionStyles();
            if (oldStyles.bold === newStyles.bold) {
                this.getParent().addSpringLoader("bold", !newStyles.bold);
            }
        }
        this._removeIllegalPhrasingContent();
    };
    managerProto._bullets = function (e) {
        /// <summary>Toggles bullets on the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        var foundLi = this._findParentLi();
        if (!foundLi) {
            // We did not find an <li>, so a new list will be inserted and therefore we need to workaround WinBlue:462808.
            this._removeTrailingBr();
        }
        this._execute(e, "InsertUnorderedList");
        this._clearListStyleType();
        this._styleNewListElements(foundLi);
    };
    managerProto._removeTrailingBr = function () {
        /// <summary>Removes a BR that occurs just before the end tag of the current block element. This may collapse the line to 0px tall.</summary>
        var range = this.getSelectionRange();
        if (!range.collapsed) {
            return;
        }

        var parentElement = this.getElementFromNode(range.commonAncestorContainer),
            parentBlock = this.getAncestor(parentElement, this.isBlockElement),
            lastChild = parentBlock.lastChild;
        if (this.isNodeName(lastChild, "BR")) {
            // A <br> that is immediately before the end tag of a block element is not rendered, but it does force the current
            // line to be inflated. Removing this <br> could potentially collapse the line to 0px tall if there is no other
            // content on the line.
            parentBlock.removeChild(lastChild);
        }
    };
    managerProto._clearListStyleType = function (range) {
        /// <summary>Clears the list-style-type inlining from UL and OL elements within the selection and any ancestor.</summary>
        /// <param name="range" type="Range" optional="true">The range to search through.</param>
        range = range || this.getSelectionRange();
        if (range) {
            var commonNode = range.commonAncestorContainer,
                doc = commonNode.ownerDocument,
                currentNode,
                that = this,
                iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_ELEMENT, function (node) {
                    /// <param name="node" type="Node">The node in question.</param>
                    return that.isNodeName(node, "UL", "OL") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                }, false);

            currentNode = /*@static_cast(HTMLElement)*/iterator.nextNode();
            while (currentNode) {
                currentNode.style.listStyleType = "";
                currentNode = /*@static_cast(HTMLElement)*/iterator.nextNode();
            }

            currentNode = /*@static_cast(HTMLElement)*/commonNode;
            do {
                if (this.isNodeName(/*@static_cast(Node)*/currentNode, "UL", "OL")) {
                    currentNode.style.listStyleType = "";
                }
                currentNode = /*@static_cast(HTMLElement)*/currentNode.parentNode;
            } while (currentNode);
        }
    };
    managerProto._clearFormatting = function (e, shouldRemoveStyle) {
        /// <summary>Clears formatting on the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        /// <param name="shouldRemoveStyle" type="Function" optional="true">Function that will take a node as an argument and return true if it should be stripped of style. This is used in the node iterator for cleanup after the IE RemoveFormat command</param>
        // The shouldRemoveStyle had to be added as a workaround to Blue: 339455. That is that if the style attribute is removed and added back in the same undo unit, 
        // the undo call behaves incorrectly. To avoid this, preprocessing on the defaultFont divs is done. That means the cleanup work we do should ignore those
        // elements. A shouldRemoveStyle allows us to safely ignore them without putting that restraint on every instance of canvas. 

        var range = this.getSelectionRange(),
            origRange = null;
        if (!Boolean(range) || range.collapsed) {
            origRange = range;
            range = this.getSelectionRange();
        }

        if (range.collapsed) {
            return;
        }

        this._execute(e, "RemoveFormat");
        // normalize alignment
        var commonNode = this.getElementFromNode(range.commonAncestorContainer);
        range = this.trimRange(range);
        commonNode = this.getElementFromNode(range.commonAncestorContainer);

        // Default the filter function to always return true.
        shouldRemoveStyle = Jx.isFunction(shouldRemoveStyle) ? shouldRemoveStyle : function () { return true; };

        var that = this,
            doc = commonNode.ownerDocument,
            iterator = doc.createNodeIterator(/*@static_cast(Node)*/commonNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, function (node) {
                /// <param name="node" type="Node">The node in question.</param>
                return that.intersectsNode(range, node, true) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }, false);

        var currentNode = /*@static_cast(HTMLElement)*/iterator.nextNode(),
            count = 0,
            nodesToRemove = [];
        while (currentNode) {
            count = Math.max(count, this._countLists(/*@static_cast(Node)*/currentNode));
            if (this.isNodeName(/*@static_cast(Node)*/currentNode, "H1", "H2", "H3", "H4", "H5", "H6", "DEL", "MARK")) {
                nodesToRemove.push(currentNode);
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                if (shouldRemoveStyle(currentNode)) {
                    currentNode.removeAttribute("style");
                }
                currentNode.removeAttribute("bgcolor");
                currentNode.removeAttribute("align");
                // BLUE:239243 - MathML elements do not have style or currentStyle properties.
                if (currentNode.style && currentNode.currentStyle) {
                    var weight = currentNode.currentStyle.fontWeight;
                    if (Boolean(weight) && weight !== "" && weight !== "normal" && weight !== "400") {
                        currentNode.style.fontWeight = "normal";
                    }
                }
            }
            currentNode = /*@static_cast(HTMLElement)*/iterator.nextNode();
        }
        // Remove any lists
        for (; count; count--) {
            this._execute(e, "Outdent");
        }
        // Remove any headers
        while (nodesToRemove.length) {
            var headerNode = /*@static_cast(HTMLElement)*/nodesToRemove.pop();
            headerNode.removeNode(false);
        }

        if (origRange) {
            this.replaceSelection(origRange);
        }
    };
    managerProto._countLists = function (node) {
        /// <summary>Counts the number of parent list elements this node is contained in</summary>
        /// <param name="node" type="Node">node to count</param>
        /// <returns type="Number">count of UL or OL parents</returns>
        var count = 0;
        while (node) {
            if (this.isNodeName(node, "OL", "UL")) {
                count++;
            }
            node = node.parentNode;
        }
        return count;
    };
    managerProto._copy = function (e) {
        /// <summary>Adds the current selection to the clipboard.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "Copy");
    };
    managerProto._cut = function (e) {
        /// <summary>Adds the current selection to the clipboard and removes it from the document.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "Cut");
    };
    managerProto._directionLtr = function (e) {
        /// <summary>Changes the current block to LTR typing direction</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "BlockDirLTR");
    };
    managerProto._directionRtl = function (e) {
        /// <summary>Changes the current block to RTL typing direction</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "BlockDirRTL");
    };
    managerProto._getFontSizeFromSelection = function () {
        /// <summary>Gets the font size from the the current selection.</summary>
        /// <returns type="Number">The size of the font in pts.</returns>
        var selectionRange = this.getSelectionRange(),
            currentNode = selectionRange.startContainer;
        if (!selectionRange.collapsed) {
            // Find the first non-empty text node
            var iterator = this.getDocument().createNodeIterator(selectionRange.commonAncestorContainer, NodeFilter.SHOW_TEXT, /*@bind(C.CommandManager)*/function (node) {
                /// <param name="node" type="TextNode">The text node in question.</param>
                // If either end overlaps and the node is non-empty we care about the range
                if (Boolean(node.data) && this.intersectsNode(selectionRange, /*@static_cast(Node)*/node)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }.bind(this), false);

            currentNode = /*@static_cast(Node)*/iterator.nextNode() || currentNode;
        }

        currentNode = /*@static_cast(Node)*/this.getElementFromNode(currentNode);

        var computedFontSize = this.getWindow().getComputedStyle(currentNode).fontSize;
        Debug.assert(computedFontSize.indexOf("px") > 0, "Expected computed font size to be in px");

        if (computedFontSize) {
            // getComputedStyle always normalizes the font-size to pixels, but we want points.
            return Math.round(Number(computedFontSize.replace("px", "")) / this._pxToPtRatio);
        }

        return Number(computedFontSize);
    };
    managerProto._growFont = function (e) {
        /// <summary>Increases the current selection's font size by one standard size.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");
        // Get the font size at the beginning of the selection. This way if the selection contains multiple font sizes, 
        // we will overwite the entire selection's font size based on the first font size we found in the selection.
        var fontSize = this._getFontSizeFromSelection();
        if (!fontSize) {
            Debug.assert(false, "Unable to retrieve font size");
            return;
        }

        // Find the next font size we should grow to.
        var newFontSize = fontSize,
            fontSizeTable = this._growShrinkFontSizeTable,
            tableLength = fontSizeTable.length;
        if (fontSize < fontSizeTable[0]) {
            // The font size is smaller than the smallest number in the table, so increase to the next integer.
            newFontSize = fontSize + 1;
        } else if (fontSize >= fontSizeTable[tableLength - 1]) {
            // The font size is larger than (or equal to) the largest number in the table, so increase to the next multiple of 10.
            newFontSize = fontSize + (10 - (fontSize % 10));
        } else {
            // The number must lie somewhere within the bounds of the table, so find the next largest number in the table.
            var currentTableItem,
                nextTableItem;
            for (var i = 0; i < tableLength - 1; i++) {
                currentTableItem = fontSizeTable[i];
                nextTableItem = fontSizeTable[i + 1];
                if (fontSize >= currentTableItem && fontSize < nextTableItem) {
                    newFontSize = nextTableItem;
                    break;
                }
            }
        }

        // Set the new font size
        Debug.assert(newFontSize > 0, "Expected font size to be greater than zero");
        this._setFontStyle("font-size", String(newFontSize) + "pt");
    };
    managerProto._growFontOnePoint = function (e) {
        /// <summary>Increases the current selection's font size by one pt.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");
        // Get the font size at the beginning of the selection. This way if the selection contains multiple font sizes, 
        // we will overwite the entire selection's font size based on the first font size we found in the selection.
        var fontSize = this._getFontSizeFromSelection();
        if (!fontSize) {
            Debug.assert(false, "Unable to retrieve font size");
            return;
        }

        // Find the next font size we should grow to.
        var newFontSize = fontSize + 1;

        // Set the new font size
        Debug.assert(newFontSize > 0, "Expected font size to be greater than zero");
        this._setFontStyle("font-size", String(newFontSize) + "pt");
    };
    managerProto._growShrinkFontSizeTable = [
        8,
        10,
        11,
        12,
        13,
        14,
        18,
        24,
        36,
        48,
        72,
        80
    ];
    managerProto._indent = function (e) {
        /// <summary>Indents the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "Indent");
        this._clearListStyleType();
    };
    managerProto._insertHyperlink = function (e) {
        /// <summary>Inserts a hyperlink from the event data.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        /// <summary>Updates the selection based on the content of the control.</summary>
        // Reselect the original area
        var selectionRange = /*@static_cast(Range)*/e.value.selectionRange,
            selectedNode = /*@static_cast(HTMLElement)*/e.value.selectedNode,
            webAddress = /*@static_cast(String)*/e.value.webAddress,
            textValue = /*@static_cast(String)*/e.value.textValue,
            editable = /*@static_cast(Boolean)*/e.value.editable;
        Debug.assert(selectionRange);
        this.replaceSelection(selectionRange);

        webAddress = webAddress.replace(C.ModernCanvasBase.prototype._regexQuoted, "$1");

        // If the text field is empty or whitespace and the selection contains some text or nothing at all, populate it with the address field
        if ((!Jx.isNonEmptyString(textValue) || C.ModernCanvasBase.prototype._regexWhitespace.test(textValue)) && editable) {
            textValue = webAddress;
        }
        // If the web address needs minor correction, apply it
        if (webAddress.length > 0 && !C.ModernCanvasBase.prototype._regexAbsoluteUrl.test(webAddress)) {
            webAddress = "http://" + webAddress;
        }

        // If the web address field is empty
        if (!Jx.isNonEmptyString(webAddress)) {
            // If we have an existing link to remove, do so
            this._removeHyperlink(e);
            selectedNode = null;
        } else {
            // If we have an existing link, update it
            if (selectedNode) {
                Debug.assert(selectedNode.nodeName.toLowerCase() === "a");
                selectedNode.setAttribute("href", webAddress);
            } else {
                var commonAncestor = this.getElementFromNode(selectionRange.commonAncestorContainer);

                // Clear out any pre-existing anchor tags
                var anchors = commonAncestor.querySelectorAll("a");
                for (var m = anchors.length; m--;) {
                    var a = /*@static_cast(HTMLElement)*/anchors[m];
                    // If this anchor is within our range
                    if (this.intersectsNode(selectionRange, /*@static_cast(Node)*/a)) {
                        // Remove the anchor tag
                        var docFrag = /*@static_cast(DocumentFragment)*/a;
                        docFrag.removeNode(false);
                    }
                }
                if (!editable) {
                    this.getDocument().execCommand("CreateLink", false, /*@static_cast(Object)*/webAddress);
                } else {
                    // Create the new anchor tag
                    var anchor = this.getDocument().createElement("a");
                    anchor.setAttribute("href", webAddress);
                    // And wrap it around the selection
                    try {
                        // First try to use surroundContents, as it will work best if there is a balanced selection
                        selectionRange.surroundContents(/*@static_cast(Node)*/anchor);
                    } catch (err) {
                        // If surroundContents fails we can fall back to extracting the fragment and inserting it ourselves
                        var content = selectionRange.extractContents();
                        selectionRange.insertNode(/*@static_cast(Node)*/anchor);
                        anchor.appendChild(content);
                    }
                    selectedNode = anchor;
                }

                // Make sure the URL is safe and correct.
                ModernCanvas.runWorkersSynchronously([
                    new ModernCanvas.HrefHtmlWorker(commonAncestor)
                ]);
            }
        }
        // IE's execCommand can move the selection to an invalid place which it will (much) later fix and cause side effects.
        // By trimming the range before we collapse it we know we're in a valid location.
        if (!editable) {
            selectionRange = this.trimRange(selectionRange);
        }
        selectionRange.collapse(false);
        this.replaceSelection(selectionRange);

        // If the text content has changed, update that
        // NOTE: Use the selected node if possible, as this will hold better than the text range
        if (e.value.originalTextValue !== textValue && editable) {
            if (selectedNode) {
                selectedNode.innerText = textValue;
            }
        }
    };

    managerProto._hyperlinkControl = /*@static_cast(C.HyperlinkControl)*/null;
    managerProto._showHyperlinkControl = function (e) {
        /// <summary>Launches a UI to insert or edit a new hyperlink.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        // First check if the control has been created, if not, do so
        if (!this._hyperlinkControl) {
            this._hyperlinkControl = new C.HyperlinkControl();
            this.getParent().appendChild(this._hyperlinkControl);
        }

        // Now launch the control
        var hostElement = this.getAnchorElement(this.getSelectionRange());
        this._hyperlinkControl.show(hostElement);
    };
    managerProto._italic = function (e) {
        /// <summary>Toggles italic on the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        var range = this.getSelectionRange(),
            oldStyles = {};
        if (range.collapsed) {
            oldStyles = this.getParent().getBasicSelectionStyles();
        }
        this._execute(e, "Italic");
        range = this.getSelectionRange();
        if (range.collapsed) {
            var newStyles = this.getParent().getBasicSelectionStyles();
            if (oldStyles.italic === newStyles.italic) {
                this.getParent().addSpringLoader("italic", !newStyles.italic);
            }
        }
        this._removeIllegalPhrasingContent();
    };
    managerProto._numbers = function (e) {
        /// <summary>Toggles numbered list on the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        var foundLi = this._findParentLi();
        if (!foundLi) {
            // We did not find an <li>, so a new list will be inserted and therefore we need to workaround WinBlue:462808.
            this._removeTrailingBr();
        }
        this._execute(e, "InsertOrderedList");
        this._clearListStyleType();
        this._styleNewListElements(foundLi);
    };
    managerProto._openLink = function (e) {
        /// <summary>Launches the current selected link.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");

        var /*@type(HTMLElement)*/linkElement = Boolean(e.target) && this.isNodeName(/*@static_cast(Node)*/e.target, "A") ? e.target : this.getParentElementForSelection("a");
        if (Boolean(linkElement) && Jx.isNonEmptyString(linkElement.getAttribute("href"))) {
            // Even though we know we have a link, it's possible it may not turn into a URI well and attempting to launch it will through an error.
            // In this case we will fail gracefully by doing nothing.
            try {
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(linkElement.getAttribute("href"))).then();
            } catch (er) { }
        }
    };
    managerProto._outdent = function (e) {
        /// <summary>Outdents the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "Outdent");
        this._clearListStyleType();
    };
    managerProto._paste = function (e) {
        /// <summary>Replaces the current selection with the content from the clipboard.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "Paste");
    };
    managerProto._pasteContentOnly = function (e) {
        /// <summary>Replaces the current selection with the unformatted content from the clipboard.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "ms-pasteContentOnly");
    };
    managerProto._pasteTextOnly = function (e) {
        /// <summary>Replaces the current selection with the text content from the clipboard.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "ms-pasteTextOnly");
    };
    managerProto._quotedLink = function (e) {
        /// <summary>Searches the previous and next text at the cursor and replace quoted links (i.e. "http://msn.com) with an anchor tag.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        var searchInfo = this.getTextSearchInfo(true),
            found = false;
        if (searchInfo) {
            var m = searchInfo.preString.length,
                searchString = searchInfo.preString,
                charCode = 0;

            // Looping backwards through the text range
            while (!found && Boolean(m--)) {
                // Attempt to find the character in the before string
                charCode = searchString.charCodeAt(m);
                // 34 = " 8220 = &ldquo; 8221 = &rdquo;
                found = charCode === 34 || charCode === 8220 || charCode === 8221;
            }
            if (found) {
                // found something like: text "linktext^ where ^ is the cursor, see if linktext is a url
                searchInfo.preString = searchString.substr(0, m);
                searchString = searchString.substr(m + 1, searchString.length - m);
                found = ModernCanvas.ModernCanvasBase.prototype._regexAbsoluteUrl.test(searchString);
            }

            if (!found) {
                // looping forwards through the text range
                searchString = searchInfo.postString;
                for (m = 0; m < searchString.length && !found; m++) {
                    // Attempt to find the character in the after string
                    charCode = searchString.charCodeAt(m);
                    // 34 = " 8220 = &ldquo; 8221 = &rdquo;
                    found = charCode === 34 || charCode === 8220 || charCode === 8221;
                }
                if (found) {
                    // found something like: text ^linktext" where ^ is the cursor, see if linktext is a url
                    searchInfo.postString = searchString.substr(m, searchString.length);
                    searchString = searchString.substr(0, m - 1);
                    found = ModernCanvas.ModernCanvasBase.prototype._regexAbsoluteUrl.test(searchString);
                }
            }

            if (found) {
                this._doQuotedLink(searchInfo, searchString);
            }
        }
        if (!found) {
            e.defaultPrevented = false;
        }
    };

    managerProto._doQuotedLink = function (searchInfo, searchString) {
        /// <param name="searchInfo" type="__ModernCanvas.ModernCanvas.TextSearchInfo">Search info for the link</param>
        /// <param name="searchString" type="String">The link text</param>

        var doc = this.getDocument(),
            anchor = doc.createElement("a"),
            tempParent = doc.createElement("div"),
            canvas = this.getParent();

        // First undo unit adds the " that the user just typed.
        Jx.raiseEvent(canvas, "beforeundoablechange");
        searchInfo.searchRange.deleteContents();

        searchInfo.searchRange.insertNode(doc.createTextNode(searchInfo.postString));
        var typeQuote = doc.createTextNode("\"");
        searchInfo.searchRange.insertNode(typeQuote);
        searchInfo.searchRange.insertNode(doc.createTextNode(searchString));
        searchInfo.searchRange.insertNode(doc.createTextNode("\""));
        searchInfo.searchRange.insertNode(doc.createTextNode(searchInfo.preString));

        // Selection will return to the " char.
        Jx.raiseEvent(canvas, "undoablechange");

        // Second undo unit adds the smart quote conversion.
        Jx.raiseEvent(canvas, "beforeundoablechange");
        searchInfo.searchRange.deleteContents();

        searchInfo.searchRange.insertNode(doc.createTextNode(searchInfo.postString));
        typeQuote = doc.createTextNode("\u201D");
        searchInfo.searchRange.insertNode(typeQuote);
        searchInfo.searchRange.insertNode(doc.createTextNode(searchString));
        searchInfo.searchRange.insertNode(doc.createTextNode("\u201C"));
        searchInfo.searchRange.insertNode(doc.createTextNode(searchInfo.preString));

        // Selection will return to the closing smart quote char.
        Jx.raiseEvent(canvas, "undoablechange");

        // Make sure the URL is safe and correct.
        tempParent.appendChild(anchor);
        anchor.href = searchString;
        anchor.innerText = searchString;
        ModernCanvas.runWorkersSynchronously([
            new ModernCanvas.HrefHtmlWorker(tempParent)
        ]);

        // Finally add the change to make a link of the quoted text.
        if (anchor.parentNode) {
            Jx.raiseEvent(canvas, "beforeundoablechange");
            searchInfo.searchRange.deleteContents();

            searchInfo.selection.insertNode(doc.createTextNode(searchInfo.postString));
            searchInfo.selection.insertNode(anchor);
            searchInfo.selection.insertNode(doc.createTextNode(searchInfo.preString));

            var selectedRange = doc.createRange();
            selectedRange.selectNode(anchor);
            selectedRange.collapse(false);
            this.replaceSelection(selectedRange); // selection will return to the end of the anchor tag

            // Notify any listeners than an undoable change has occurred.
            Jx.raiseEvent(canvas, "undoablechange", { backspaceUndoable: true });
        }
    };

    managerProto._redo = function (e) {
        /// <summary>Reverses the last Undo action.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        this._execute(e, "redo");
    };
    managerProto._removeHyperlink = function (e) {
        /// <summary>Removes the hyperlink from the current selection.</summary>
        this._execute(e, "Unlink");
    };
    managerProto._removeIllegalPhrasingContent = function (range) {
        /// <summary>Removes illegal elements that were inserted by IE within the selection.</summary>
        /// <param name="range" type="Range" optional="true">The range to search through.</param>
        range = range || this.getSelectionRange();
        if (range) {
            var commonNode = range.commonAncestorContainer,
                doc = commonNode.ownerDocument,
                currentNode,
                that = this,
                iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_ELEMENT, function (node) {
                    /// <param name="node" type="Node">The node in question.</param>
                    return that.isNodeName(node, "strong", "em", "u", "font") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                }, false);

            currentNode = /*@static_cast(HTMLElement)*/iterator.nextNode();
            while (currentNode) {
                var parentNode = currentNode.parentNode;
                // Even if the HTML is illegal, if it contains text or other user content, we don't want to remove it.
                if (!this.elementCanContainPhrasingContent(parentNode) && !this.visibleContent(currentNode)) {
                    parentNode.removeChild(currentNode);
                }
                currentNode = /*@static_cast(HTMLElement)*/iterator.nextNode();
            }
        }
    };
    managerProto._findParentLi = function () {
        /// <summary>Finds the first parent LI element of the current selection</summary>
        var range = this.getSelectionRange();
        if (!range) {
            return null;
        }

        var firstNode = range.startContainer;
        if (firstNode.nodeType === Node.ELEMENT_NODE && range.startOffset < firstNode.childNodes.length) {
            firstNode = firstNode.childNodes[range.startOffset];
        }

        while (firstNode && !this.isNodeName(firstNode, "LI")) {
            firstNode = firstNode.parentNode;
        }

        return firstNode;
    };
    managerProto._styleNewListElements = function (foundLi) {
        /// <summary>Apply styles to LI elements that have just been created.</summary>
        /// <param name="foundLi" type="HTMLElement">a parent LI element found before the command executed</param>

        // If the LI we found before the command was executed doesn't have a parent we know this was an operation
        // to remove the list from the selection so no additional work needs doing.
        if (foundLi && !Jx.isObject(foundLi.parentNode)) {
            return;
        }

        var range = this.getSelectionRange();
        if (!range) {
            return;
        }

        var currentStyles = this.getParent().getSelectionStyles(),
            styles = {};

        if (currentStyles.fontSize) {
            styles["font-size"] = currentStyles.fontSize;
        }
        if (currentStyles.fontColor) {
            styles.color = currentStyles.fontColor;
        }        
        if (currentStyles.fontFamily) {
            styles["font-family"] = currentStyles.fontFamily;
        }
        // if the styles were all empty we don't need to do additional work
        if (Object.keys(styles).length === 0) {
            return;
        }
        if (range.collapsed) {            
            var currentLi = this._findParentLi();
            if (currentLi) {
                range = this.getDocument().createRange();
                range.selectNode(currentLi);
            }
        }
        this._styleListElements(styles, range);
    };
    managerProto._styleListElements = function (styles, range) {
        /// <summary>Apply styles to LI element that are within the scope of modifications by the current range</summary>
        /// <param name="styles" type="Object">css styles to apply to the LI nodes</param>
        /// <param name="range" type="Range" optional="true">range to operate on instead of the current selection</param>

        Debug.assert(Jx.isObject(styles), "styles must be an object");

        range = range || this.getSelectionRange();
        if (!range) {
            return;
        }
        
        var that = this,
            commonNode = range.commonAncestorContainer,
            doc = commonNode.ownerDocument,
            iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_ELEMENT, function (node) {
                return commonNode !== node && that.intersectsNode(range, node, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }, false),
            // determine the first node of the range
            firstNode = iterator.nextNode(),
            lastNode = firstNode,

            visibleContent = function (testRange, boundaryNode, boundaryOffset) {
                /// <summary>Returns true if this range has visible content except for an LI and has special handling for a boundary try text node.</summary>
                var testCommon = testRange.commonAncestorContainer,
                    testIterator = doc.createNodeIterator(testCommon, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (node) {
                        return testCommon !== node && that.intersectsNode(testRange, node, true) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                    }, false),
                    testNode = testIterator.nextNode();

                while (testNode) {
                    if (that.isNodeName(testNode, "TD", "HR", "IMG", "INPUT", "SELECT", "EMBED", "OBJECT")) {
                        return true;
                    } else if (testNode.nodeType === Node.TEXT_NODE) {
                        var value = testNode.nodeValue;
                        if (testNode === boundaryNode) {
                            if (boundaryOffset >= 0) {
                                value = value.substring(0, boundaryOffset);
                            } else {
                                value = value.substring(-boundaryOffset);
                            }
                        }
                        if (!ModernCanvas.ModernCanvasBase.prototype._regexWhitespace.test(value) && value.length > 0) {
                            return true;
                        }
                    }
                    testNode = testIterator.nextNode();
                }
                return false;
            };

        // when the firstNode is the commonNode the iterator doesn't return anything
        if (!firstNode) {
            firstNode = lastNode = commonNode;
        }

        // find an LI that we're in from the first node
        while (firstNode && !this.isNodeName(firstNode, "LI", "UL", "OL")) {
            if (firstNode.previousSibling) {
                firstNode = firstNode.previousSibling;
            } else {
                firstNode = firstNode.parentNode;
            }
        }

        var nextNode = firstNode;
        // If our firstNode is a UL or OL we need to find the first LI in the selection
        if (this.isNodeName(nextNode, "UL", "OL")) {
            while (nextNode && !this.isNodeName(nextNode, "LI")) {
                nextNode = iterator.nextNode();
            }
            if (nextNode) {
                firstNode = nextNode;
            }
        }

        // Not in an list
        var testRange = doc.createRange();
        if (firstNode) {
            // Look at the content between the start of the first LI seen and the original range start pointer
            testRange.setStartBefore(firstNode);
            testRange.setEnd(range.startContainer, range.startOffset);

            // Return if there is content between the LI and the start of the selection
            if (visibleContent(testRange, range.startContainer, range.startOffset)) {
                return;
            }
        }

        // find the last node of the range
        var anyListItems = false;
        nextNode = lastNode;
        while (nextNode) {
            lastNode = nextNode;
            anyListItems |= this.isNodeName(lastNode, "LI");
            nextNode = iterator.nextNode();
        }

        // find an LI that we're in from the last node
        nextNode = lastNode;
        while (nextNode && !this.isNodeName(nextNode, "LI", "UL", "OL")) {
            if (nextNode.nextSibling) {
                nextNode = nextNode.nextSibling;
            } else {
                nextNode = nextNode.parentNode;
            }
        }

        // if nothing was found that just means we hit the end of the doc so the end should be the actual node we started in
        if (!nextNode) {
            nextNode = lastNode;
        }
        if (nextNode) {
            testRange.setStart(range.endContainer, range.endOffset);
            // if the next node is a parent of the last node we set the end just after next node otherwise we set it before.
            if (this.isDescendantOf(lastNode, nextNode)) {
                testRange.setEndAfter(nextNode);
            } else {
                testRange.setEndBefore(nextNode);
            }
            // Return if there is content between the LI and the end of the selection
            if (visibleContent(testRange, range.endContainer, -range.endOffset)) {
                return;
            }
        }

        var applyStyles = function (node) {
            Object.keys(styles).forEach(function (key) {
                var value = styles[key];
                if (value) {
                    node.style[key] = value;
                }
            });
        };

        // OK we know we're good so start applying styles
        if (this.isNodeName(firstNode, "LI")) {
            applyStyles(firstNode);
        }

        if (anyListItems) {
            iterator = doc.createNodeIterator(commonNode, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (node) {
                return commonNode !== node && that.intersectsNode(range, node, false) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }, false);

            nextNode = iterator.nextNode();
            while (nextNode) {
                if (this.isNodeName(nextNode, "LI")) {
                    applyStyles(nextNode);
                }
                nextNode = iterator.nextNode();
            }
        }
    };
    managerProto._selectAll = function (e) {
        /// <summary>Increases the current selection to incase all parents until the first non-selectable object.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "SelectAll");
    };
    managerProto._setFontColor = function (e) {
        /// <summary>Sets the font color attribute of the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._execute(e, "ForeColor", false, e.value);
        this._styleListElements({ color: e.value });
        this._removeIllegalPhrasingContent();
    };
    managerProto._setFontFamily = function (e) {
        /// <summary>Sets the font family attribute of the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        this._setFontStyle("font-family", e.value);
        this._styleListElements({ "font-family": e.value });
    };
    managerProto._setFontHighlightColor = function (e) {
        /// <summary>Sets the font background color of the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");     

        this._setFontStyle("background-color", /*@static_cast(String)*/e.value);

        // Collapse the range to the end after changing the highlight color
        var range = this.getSelectionRange();
        range.collapse(false /*toStart*/);
    };
    managerProto._setFontSize = function (e) {
        /// <summary>Sets the font size attribute of the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        var value = /*@static_cast(String)*/e.value;
        // If the value can be translated to a number, assume pt was the unit of measure
        if (Number(value) >= 0) {
            value += "pt";
        }
        this._setFontStyle("font-size", value);
        this._styleListElements({ "font-size": e.value });
    };
    managerProto._shrinkFont = function (e) {
        /// <summary>Descrease the current selection's font size by one standard size.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");
        // Get the font size at the beginning of the selection. This way if the selection contains multiple font sizes, 
        // we will overwite the entire selection's font size based on the first font size we found in the selection.
        var fontSize = this._getFontSizeFromSelection();
        if (!fontSize) {
            Debug.assert(false, "Unable to retrieve font size");
            return;
        }

        // Find the next font size we should shrink to.
        var newFontSize = fontSize,
            fontSizeTable = this._growShrinkFontSizeTable,
            tableLength = fontSizeTable.length;
        if (fontSize <= fontSizeTable[0]) {
            // The font size is smaller than (or equal to) the smallest number in the table, so decrease to the next integer.
            newFontSize = Math.ceil(fontSize) - 1;
            // Ensure the font doesn't go below 1pt.
            newFontSize = (newFontSize > 0) ? newFontSize : 1;
        } else if (fontSize > fontSizeTable[tableLength - 1]) {
            // The font size is larger than the largest number in the table, so decrease to the next multiple of 10.
            var remainder = fontSize % 10;
            if (remainder === 0) {
                newFontSize = fontSize - 10;
            } else {
                newFontSize = fontSize - remainder;
            }
        } else {
            // The number must lie somewhere within the bounds of the table, so find the next smallest number in the table.
            var currentTableItem,
                nextTableItem;
            for (var i = tableLength - 1; i > 0; i--) {
                currentTableItem = fontSizeTable[i];
                nextTableItem = fontSizeTable[i - 1];
                if (fontSize <= currentTableItem && fontSize > nextTableItem) {
                    newFontSize = nextTableItem;
                    break;
                }
            }
        }

        // Set the new font size
        Debug.assert(newFontSize > 0, "Expected font size to be greater than zero");
        this._setFontStyle("font-size", String(newFontSize) + "pt");
    };
    managerProto._shrinkFontOnePoint = function (e) {
        /// <summary>Descrease the current selection's font size by one pt.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");
        // Get the font size at the beginning of the selection. This way if the selection contains multiple font sizes, 
        // we will overwite the entire selection's font size based on the first font size we found in the selection.
        var fontSize = this._getFontSizeFromSelection();
        if (!fontSize) {
            Debug.assert(false, "Unable to retrieve font size");
            return;
        }

        // Find the next font size we should shrink to.
        var newFontSize = Math.ceil(fontSize) - 1;

        // Ensure the font doesn't go below 1pt.
        newFontSize = (newFontSize > 0) ? newFontSize : 1;

        // Set the new font size
        Debug.assert(newFontSize > 0, "Expected font size to be greater than zero");
        this._setFontStyle("font-size", String(newFontSize) + "pt");
    };
    managerProto._underline = function (e) {
        /// <summary>Toggles underline on the current selection.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        var range = this.getSelectionRange(),
            oldStyles = {};
        if (range.collapsed) {
            oldStyles = this.getParent().getBasicSelectionStyles();
        }
        this._execute(e, "Underline");
        range = this.getSelectionRange();
        if (range.collapsed) {
            var newStyles = this.getParent().getBasicSelectionStyles();
            if (oldStyles.underline === newStyles.underline) {
                this.getParent().addSpringLoader("underline", !newStyles.underline);
            }
        }
        this._removeIllegalPhrasingContent();
    };
    managerProto._undo = function (e) {
        /// <summary>Reverses the last action/undo unit.</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(Jx.isObject(e), "Expected e to be a valid event");
        Debug.assert(Jx.isObject(this.getSelectionRange()), "Expected valid selection range");

        var keyDownEvent = e.keyDownEvent;
        if (keyDownEvent && keyDownEvent.altKey && keyDownEvent.keyCode === Jx.KeyCode.backspace) {
            // Workaround WinBlue:163329 - IE ignores e.preventDefault() for the ALT+BACKSPACE keyboard shortcut, so to avoid 
            // executing undo twice we just no-op.
            return;
        }

        this._execute(e, "undo");
    };
    managerProto.executingCommand = function () {
        /// <summary>Determines what command is currently being executed.</summary>
        /// <returns type="String">The ID of the command being executed if a command is being executed.</returns>
        return this._executingCommandEvent ? this._executingCommandEvent.command : null;
    };
    managerProto.fireAfterCommand = function () {
        /// <summary>Fires a aftercommand event for the current command.</summary>
        Debug.assert(this._executingCommandEvent, "No command is currently being executed");

        if (this._isUndoable(this._executingCommandEvent)) {
            Jx.raiseEvent(this.getParent(), "undoablechange");
        }
        Jx.raiseEvent(this.getParent(), "aftercommand", this._executingCommandEvent);

        this._executingCommandEvent = null;
        this.getWindow().setImmediate(this._processQueue);
    };
    managerProto.getCommand = function (id) {
        /// <summary>Gets a command object from this instance.</summary>
        /// <param name="id" type="String">The id of the command object to fetch.</param>
        /// <returns type="C.Command">The command matching the given id.</returns>
        Debug.assert(Jx.isString(id));
        Debug.assert(this._commands);
        this._ensureCommands();
        return this._commands[id] || null;
    };
    managerProto.removeCommand = function (id) {
        /// <summary>Removes a command from this instance.</summary>
        /// <param name="id" type="String" optional="true">The command to remove.  If not defined removes all commands.</param>
        Debug.assert(Jx.isString(id));
        Debug.assert(this._commands);
        this._ensureCommands();
        if (id) {
            delete this._commands[id];
        } else {
            this._commands = {};
        }
    };
    managerProto.setCommand = function (newCommand) {
        /// <summary>Adds or modifies a command in this instance.</summary>
        /// <param name="newCommand" type="C.Command">The command to define.</param>
        Debug.assert(Jx.isString(newCommand.id));
        if (newCommand.id) {
            this._commands[newCommand.id] = newCommand;
        }
    };
    managerProto.setModernCanvas = function (modernCanvas) {
        /// <summary>Defined the instance of the modern canvas that is managing this component, allowing better integration between components.</summary>
        /// <param name="modernCanvas" type="C.ModernCanvasBase" optional="true">A reference to the modern canvas object that will be managing this component.</param>
        this._modernCanvas = modernCanvas;
    };
    managerProto.onCommand = function (e) {
        /// <summary>Command listener that executes functions upon request (if enabled).</summary>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">The event fired by another component when a command should be executed.</param>
        Debug.assert(e.command);
        var canvas = /*@static_cast(C.ModernCanvasBase)*/this.getParent();
        e.target = e.target || canvas.getCanvasElement();
        this._ensureCommands();
        this._queue.push(e);
        this._processQueue();
    };
    managerProto.updateEnabledStates = function (commands, e) {
        /// <summary>Updates the enabled states of the given commands.</summary>
        /// <param name="commands" type="Array">A list of ModernCanvas.Commands to update.</param>
        /// <param name="e" type="__ModernCanvas.CommandManager.CommandEvent">Command event</param>
        var newState,
            command,
            selectionRange = this.getSelectionRange(),
            hasSelection = Boolean(selectionRange),
            enabledInformation = 0;

        // Build the enabledInformation bit mask
        if (hasSelection) {
            enabledInformation |= States.hasSelection;
        }
        if (hasSelection && !this.rangeContainsNonEditableContent(selectionRange)) {
            enabledInformation |= States.hasEditableSelection;
        }
        if (hasSelection && !selectionRange.collapsed) {
            enabledInformation |= States.hasNonEmptySelection;
        }
        if((e && e.target && this.isNodeName(e.target, "A")) || this.getParentElementForSelection("a")) {
            enabledInformation |= States.inLink;
        } else {
            enabledInformation |= States.notInLink;
        }

        // Set the enable states of the commands
        for (var n = commands.length; n--;) {
            command = commands[n];
            newState = command.isEnabled(enabledInformation);
            if (command.enabled !== newState) {
                command.enabled = newState;
                Jx.raiseEvent(command, "enabledchanged", newState);
            }
        }
    };
});

//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Jx,ModernCanvas,Debug,Windows*/
/*jshint browser:true*/
Jx.delayDefine(ModernCanvas, ["ContextMenuItem", "ContextMenuManager"], function () {

    ModernCanvas.ContextMenuItem = /*@constructor*/function (displayName, commandId, enabledOn) {
        /// <summary>An object representing a Context Menu entry.</summary>
        /// <param name="displayName" type="String">The string to display in the context menu.</param>
        /// <param name="commandId" type="String">The command ID to trigger an event for when the menu item is selected.</param>
        /// <param name="enabledOn" type="Number" optional="true">The enabledOn bitmask to set, if one should be set.</param>
        Debug.assert(typeof displayName === "string");
        Debug.assert(typeof commandId === "string");
        this.displayName = displayName;
        this.commandId = commandId;
        if (Jx.isNumber(enabledOn)) {
            this.enabledOn = enabledOn;
        }
    };
    ModernCanvas.ContextMenuItem.prototype = {
        commandId: "",
        displayName: "",
        enabledOn: ModernCanvas.Command.EnableStates.always,
        isEnabled: function (enabledInformation) {
            /// <summary>Defines if this menu item should be enabled.</summary>
            /// <param name="enabledInformation" type="Number">Bitwise combined EnableStates used to determine if the command should be enabled.</param>
            /// <returns type="Boolean">True if the item should be enabled, false otherwise.</returns>
            Debug.assert(Jx.isNumber(this.enabledOn));
            Debug.assert(Jx.isNumber(enabledInformation));
            return (this.enabledOn & enabledInformation) === this.enabledOn;
        }
    };

    ModernCanvas.ContextMenuManager = /*@constructor*/function (className) {
        /// <summary>A context menu manager.</summary>
        /// <param name="className" type="String" optional="true">The class of ContextMenuManager to instance.  If not defined the default will be used.</param>
        ModernCanvas.Component.call(this);

        // Initialize variables
        this._className = className || "default";
        Debug.assert(Boolean(ModernCanvas.ContextMenuManager.Classes[this._className]), "className must be a defined class");
        this._menuItems = [];

        // Bind functions
        this.onContextMenu = this.onContextMenu.bind(this);
    };

    Jx.inherit(ModernCanvas.ContextMenuManager, ModernCanvas.Component);

    var classes = ModernCanvas.ContextMenuManager.Classes = { empty: [] };
    classes.basic = ["copy", "paste", "selectAll"];
    classes.full = classes.basic.concat(["editLink", "openLink", "addLink", "removeLink", "clearFormatting"]);
    classes.default = classes.full;

    classes.calendar = classes.full;
    classes.chat = classes.basic;
    classes.mail = classes.empty;
    classes.people = classes.basic;
    classes.stm = classes.basic.concat(["editLink", "addLink", "removeLink", "clearFormatting"]);

    ModernCanvas.ContextMenuManager.MenuItemOrder = ["copy", "paste", "addLink", "editLink", "openLink", "removeLink", "selectAll", "clearFormatting"];

    var States = ModernCanvas.Command.EnableStates;
    ModernCanvas.ContextMenuManager.MenuItemDefinitions = {};
    Object.defineProperties(ModernCanvas.ContextMenuManager.MenuItemDefinitions, {
        addLink: {
            get: function () { return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/hyperlinkControl_completionButton"), "showHyperlinkControl", States.notInLink | States.hasEditableSelection); }
        },
        clearFormatting: {
            get: function () { return new ModernCanvas.ContextMenuItem(Jx.res.getString("composeAppBarClearFormattingButton"), "clearFormatting", States.hasNonEmptySelection | States.hasEditableSelection); }
        },
        copy: {
            get: function () { return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_copy"), "copy", States.hasNonEmptySelection); }
        },
        editLink: {
            get: function () { return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_editLink"), "showHyperlinkControl", States.inLink | States.hasEditableSelection); }
        },
        openLink: {
            get: function () { return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_openLink"), "openLink", States.inLink); }
        },
        paste: {
            get: function () { return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_paste"), "paste", States.hasEditableSelection); }
        },
        removeLink: {
            get: function () { return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_removeLink"), "removeHyperlink", States.inLink | States.hasEditableSelection); }
        },
        selectAll: {
            get: function () { return new ModernCanvas.ContextMenuItem(Jx.res.getString("/modernCanvas/canvasCommand_selectAll"), "selectAll", States.hasEditableSelection); }
        },
    });

    var proto = ModernCanvas.ContextMenuManager.prototype;
    proto._ensureMenuItems = function () {
        /// <summary>Function to ensure that menu items for the requested class have been loaded.</summary>
        this._ensureMenuItems = function () { };

        var menuItemDefinitions = ModernCanvas.ContextMenuManager.MenuItemDefinitions,
            menuOrder = ModernCanvas.ContextMenuManager.MenuItemOrder,
            menuItems = /*@static_cast(Array)*/ModernCanvas.ContextMenuManager.Classes[this._className];
        for (var m = 0; m < menuOrder.length; m++) {
            if (menuItems.indexOf(menuOrder[m]) !== -1) {
                var menuItem = /*@static_cast(ModernCanvas.ContextMenuItem)*/menuItemDefinitions[menuOrder[m]];
                Debug.assert(Jx.isObject(menuItem));
                Debug.assert(Boolean(menuItem) && Boolean(menuItem.displayName));
                this._menuItems.push(menuItem);
            }
        }
    };
    proto._fireCommandEvent = function (srcElement, commandId) {
        /// <summary>Fires a DOM command event.</summary>
        /// <param name="srcElement" type="HTMLElement">The DOM element to fire the event from.</param>
        /// <param name="commandId" type="String">The ID of the command for which to fire an event.</param>
        Debug.assert(Jx.isNonEmptyString(commandId));
        Jx.raiseEvent(this.getParent(), "command", { command: commandId, target: srcElement });
    };
    proto._getContextMenuHandler = function (target, commandId) {
        /// <summary>Creates an event handler to be executed when a context menu item is invoked.</summary>
        /// <param name="target" type="HTMLElement">The DOM element to fire the command event from.</param>
        /// <param name="commandId" type="String">The ID of the command that was invoked.</param>
        /// <returns type="Function">An event handler to be executed when a context menu item is invoked.</returns>

        Debug.assert(Jx.isNonEmptyString(commandId));

        var that = this;
        return function () {
            var requestsFired = that._usageData[commandId] || 0;
            that._usageData[commandId] = requestsFired + 1;
            that._fireCommandEvent(target, commandId);
        };
    };
    proto._MaxItems = 5;
    proto._menuItems = [];
    proto._Padding = 10;

    proto.onContextMenu = function (e) {
        /// <summary>contextMenu listener that creates a context menu upon request.</summary>
        /// <param name="e" type="Event">The event fired when a context menu is requested.</param>
        e.preventDefault();
        this._ensureMenuItems();

        // Calculate information that may be used to determine if a menu item is enabled
        var range = this.getSelectionRange(),
            hasSelection = Boolean(range),
            enabledInformation = 0;
        if (hasSelection) {
            enabledInformation |= States.hasSelection;
        }
        if (hasSelection && !this.rangeContainsNonEditableContent(range)) {
            enabledInformation |= States.hasEditableSelection;
        }
        if (hasSelection && !range.collapsed) {
            enabledInformation |= States.hasNonEmptySelection;
        }
        if (this.getParentElementForSelection("a")) {
            enabledInformation |= States.inLink;
        } else {
            enabledInformation |= States.notInLink;
        }

        // Now build the actual menu
        var menu = new Windows.UI.Popups.PopupMenu(),
            counter = 0,
            menuItems = this._menuItems,
            target = e.target;
        for (var m = 0; m < menuItems.length && counter < this._MaxItems; m++) {
            var menuItem = /*@static_cast(ModernCanvas.ContextMenuItem)*/menuItems[m];
            if (menuItem.isEnabled(enabledInformation)) {
                menu.commands.append(new Windows.UI.Popups.UICommand(menuItem.displayName, this._getContextMenuHandler(target, menuItem.commandId)));
                counter++;
            }
        }

        if (counter > 0) {
            var x, y, w, h,
                padding = this._Padding,
                iframeElement =  /*@static_cast(HTMLElement)*/this.getWindow().frameElement,
                iframeBoundingRect = iframeElement.getBoundingClientRect();

            // If a pointer was used for this contextmenu and it has positions use those
            if (e.pointerType !== "" && e.screenX !== window.screenX && e.screenY !== window.screenY) {
                // BLUE:375432 - the event object screenX value isn't scaled by DPI but the window object's values are.
                x = (e.screenX / window.devicePixelRatio) - window.screenX;
                y = (e.screenY / window.devicePixelRatio) - window.screenY;
                // If there are real mouse coordinates, target around them with default padding
                w = padding;
                h = w;
            } else {
                // Else the menu button was used, work off the selection
                var selectionBoundingRect = this.getSelectionRangeBoundingRect() || /*@static_cast(ClientRect)*/{ left: 0, top: 0, width: padding, height: padding };
                // Now target around the selection / cursor
                x = selectionBoundingRect.left + iframeBoundingRect.left;
                y = selectionBoundingRect.top + iframeBoundingRect.top;
                w = selectionBoundingRect.width || padding;
                h = selectionBoundingRect.height || padding;
                Jx.dispose(selectionBoundingRect);
            }
            // If the context menu is invoked a 2nd time via the keyboard (without dismissing the original), an unexpected error occurs when calling this.
            // We can ignore this error because the context menu we present will be the same as the first.
            try {
                menu.showForSelectionAsync({
                    x: x,
                    y: y,
                    width: w,
                    height: h
                }).then();
            } catch (err) { }
        }
    };

});

//
// Copyright (C) Microsoft. All rights reserved.
//

/*jshint browser:true*/
/*global Jx, ModernCanvas, Debug,WinJS*/

Jx.delayDefine(ModernCanvas, ["HyperlinkManager", "HyperlinkTooltip"], function () {

    ModernCanvas.HyperlinkManager = function (className) {
        /// <summary>A hyperlink manager.</summary>
        /// <param name="className" type="String" optional="true">The class of HyperlinkManager to instance.  If not defined the default will be used.</param>
        ModernCanvas.Component.call(this);

        // Initialize variables
        this._className = className || "default";
        Debug.assert(Boolean(ModernCanvas.HyperlinkManager.Classes[this._className]), "className must be a defined class");
        this._openLinkOption = ModernCanvas.HyperlinkManager.Classes[this._className];
        this._hyperlinkTooltip = new ModernCanvas.HyperlinkTooltip(this._openLinkOption);
        this.appendChild(this._hyperlinkTooltip);

        // Bind functions
        this.onClick = this.onClick.bind(this);
    };
    Jx.inherit(ModernCanvas.HyperlinkManager, ModernCanvas.Component);

    ModernCanvas.HyperlinkManager.Classes = {
        calendar: ModernCanvas.OpenLinkOptions.click,
        "default": ModernCanvas.OpenLinkOptions.ctrlClick,
        mail: ModernCanvas.OpenLinkOptions.ctrlClick,
        people: ModernCanvas.OpenLinkOptions.dontOpen,
        stm: ModernCanvas.OpenLinkOptions.dontOpen
    };

    var hyperlinkManagerProto = ModernCanvas.HyperlinkManager.prototype;

    hyperlinkManagerProto.activateUI = function () {
        // Override Jx, to make sure activateUI() is called.
        this._hyperlinkTooltip.iframeElement = this.getParent().getIframeElement();
        this._hyperlinkTooltip.activateUI();
    };

    hyperlinkManagerProto.deactivateUI = function () {
        // Override Jx, to make sure deactivateUI() is called.
        this._hyperlinkTooltip.deactivateUI();
    };

    hyperlinkManagerProto.onClick = function (e) {
        /// <summary>Handles the onclick event inside the Modern Canvas, launching a hyperlink if appropriate.</summary>
        /// <param name="e" type="Event">The click event inside the Modern Canvas.</param>
        // First check if just the ctrl key was pressed down. We already know this was a click, not a context menu
        var range = this.getSelectionRange();
        if (this._openLinkOption !== ModernCanvas.OpenLinkOptions.dontOpen &&
            ((e.ctrlKey && !e.shiftKey && !e.altKey) || 
             (this._openLinkOption === ModernCanvas.OpenLinkOptions.click &&
              (Jx.isNullOrUndefined(range) || range.collapsed)))) {
            // If so, check if we are pointed at a hyperlink.
            var hyperlink = this._hyperlinkTooltip.getHyperlinkForElement(e.target);
            if (hyperlink) {
                // If so, fire the open link command off
                Jx.raiseEvent(this.getParent(), "command", { command: "openLink", target: hyperlink });
            }
        }
    };

    ModernCanvas.HyperlinkTooltip = function (openLinkOption) {
        /// <summary>A tooltip that is shown above a hyperlink on mouseover. Assumes the hyperlink is inside an iframe, but the UI is shown outside the iframe.</summary>
        /// <param name="openLinkOption" type="ModernCanvas.OpenLinkOptions">An enum value that specifies how hyperlinks are opened.</param>

        Debug.assert(Jx.isNonEmptyString(ModernCanvas.OpenLinkOptions[openLinkOption]), "Expected openLinkOption to be a valid option");

        Jx.Component.call(this);

        // Initialize variables
        this._active = false;
        this._eventsHooked = false;
        this._iframeElement = null;
        this._iframeDocument = null;
        this._openLinkOption = openLinkOption;
        this._opened = false;
        this._tooltip = null;
        this._tooltipAnchorElement = null;
        this._tooltipContainerElement = null;

        // Bind functions
        this._onPointerOver = this._onPointerOver.bind(this);
        this._onBeforeOpen = this._onBeforeOpen.bind(this);
        this._onClosed = this._onClosed.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this.close = this.close.bind(this);
    };

    Jx.inherit(ModernCanvas.HyperlinkTooltip, ModernCanvas.Component);

    var hyperlinkTooltipProto = ModernCanvas.HyperlinkTooltip.prototype;

    hyperlinkTooltipProto.activateUI = function () {
        /// <summary>Used to interact with the DOM after it was built.</summary>

        Debug.assert(Jx.isHTMLElement(this._iframeElement) && this.isNodeName(this._iframeElement, "IFRAME"), "Expected iframeElement to be an iframe element");
        Debug.assert(this._iframeElement.parentNode.currentStyle.position !== "static", "Expected iframe to have a direct parent that is positioned, so the tooltip can be absolutely positioned");
        
        // Make sure we're deactivated first.
        this.deactivateUI();

        this._createTooltip();

        Debug.assert(this.isNodeName(this._iframeDocument, "#DOCUMENT"), "Expected iframeDocument to be a Document node");
        this._iframeDocument.addEventListener("MSPointerOver", this._onPointerOver);

        Debug.assert(!this._active);
        this._active = true;
    };

    hyperlinkTooltipProto._createTooltip = function () {
        /// <summary>Creates a WinJS tooltip and adds it to the DOM.</summary>

        if (!this._tooltip) {
            var iframe = this._iframeElement;

            // Create tooltipAnchor to anchor the WinJS.Tooltip to the correct location.
            var tooltipAnchor = this._tooltipAnchorElement = iframe.ownerDocument.createElement("div");
            tooltipAnchor.classList.add("modernCanvas-hyperlinkTooltip-anchor");
            iframe.parentNode.appendChild(tooltipAnchor);

            // Create tooltipContainer to contain the content to be shown in the tooltip.
            var tooltipContainer = this._tooltipContainerElement = iframe.ownerDocument.createElement("div");
            tooltipContainer.classList.add("modernCanvas-hyperlinkTooltip-container");
            iframe.parentNode.appendChild(tooltipContainer);

            var isActionAllowed = this._openLinkOption !== ModernCanvas.OpenLinkOptions.dontOpen,
                actionHtml = "";
            if (isActionAllowed) {
                Debug.assert(this._openLinkOption === ModernCanvas.OpenLinkOptions.click || this._openLinkOption === ModernCanvas.OpenLinkOptions.ctrlClick);
                actionHtml = Jx.escapeHtml(Jx.res.getString(this._openLinkOption === ModernCanvas.OpenLinkOptions.click ? "/modernCanvas/canvasClickToOpen" : "/modernCanvas/canvasCtrlClickToOpen"));
            }
            tooltipContainer.innerHTML =
                "<div class='modernCanvas-hyperlinkTooltip-content'>" +
                    "<div class='modernCanvas-hyperlinkTooltip-url'></div>" +
                    "<div class='modernCanvas-hyperlinkTooltip-action'>" + actionHtml + "</div>" +
                "</div>";

            // Create the WinJS tooltip.
            this._tooltip = new WinJS.UI.Tooltip(tooltipAnchor, {
                contentElement: tooltipContainer.querySelector(".modernCanvas-hyperlinkTooltip-content")
            });

            this._tooltip.addEventListener("beforeopen", this._onBeforeOpen);
            this._tooltip.addEventListener("closed", this._onClosed);
        }
    };

    hyperlinkTooltipProto.deactivateUI = function () {
        /// <summary>Used to interact with the DOM before shutdown.</summary>

        if (!this._active) {
            // Nothing to do.
            return;
        }

        this.close();
        this._iframeDocument.removeEventListener("MSPointerOver", this._onPointerOver);

        Debug.assert(this._active);
        this._active = false;
    };

    hyperlinkTooltipProto.dispose = function () {
        /// <summary>Used to interact with the DOM before shutdown.</summary>
        if (this._tooltipContainerElement && this._tooltipContainerElement.parentNode) {
            this._tooltipContainerElement.parentNode.removeChild(this._tooltipContainerElement);
        }

        if (this._tooltipAnchorElement && this._tooltipAnchorElement.parentNode) {
            this._tooltipAnchorElement.parentNode.removeChild(this._tooltipAnchorElement);
        }

        if (this._tooltip) {
            this.deactivateUI();
            this._tooltip.removeEventListener("beforeopen", this._onBeforeOpen);
            this._tooltip.removeEventListener("closed", this._onClosed);
        }
    };

    Object.defineProperty(hyperlinkTooltipProto, "iframeElement", {
        enumerable: true,
        get: function () {
            return this._iframeElement;
        },
        set: function (value) {
            if (this._iframeElement !== value) {
                this.deactivateUI();
                this._iframeElement = value;
                this._iframeDocument = value.contentDocument;

                if (this._tooltipAnchorElement) {
                    // Reparent the anchor element so that it can be absolutely positioned above the iframe.
                    this._iframeElement.parentNode.appendChild(this._tooltipAnchorElement);
                }
            }
        }
    });

    hyperlinkTooltipProto.getHyperlinkForElement = function (element) {
        /// <summary>Finds the hyperlink that wraps this element.</summary>
        /// <param name="element" type="Element">The element to find the hyperlink for.</param>
        /// <returns type="HTMLElement>A hyperlink element.</returns>
        Debug.assert(Jx.isHTMLElement(element), "Expected element to be an HTMLElement");

        element = this.getAncestor(element, function (ancestor) {
            return this.isNodeName(ancestor, "A", "AREA", "BODY");
        }.bind(this));

        if (this.isNodeName(element, "A", "AREA")) {
            return element;
        }
        return null;
    };

    hyperlinkTooltipProto._hookEvents = function () {
        /// <summary>Attaches to a variety of events.</summary>

        if (!this._eventsHooked) {
            document.addEventListener("scroll", this.close, true);
            document.addEventListener("msvisibilitychange", this.close);
            document.addEventListener("focus", this.close, true);
            window.addEventListener("resize", this.close);
            this._iframeDocument.addEventListener("MSPointerMove", this._onPointerMove);

            this._eventsHooked = true;
        }
    };

    hyperlinkTooltipProto._unhookEvents = function () {
        /// <summary>Detaches from a variety of events.</summary>

        if (this._eventsHooked) {
            document.removeEventListener("scroll", this.close, true);
            document.removeEventListener("msvisibilitychange", this.close);
            document.removeEventListener("focus", this.close, true);
            window.removeEventListener("resize", this.close);
            this._iframeDocument.removeEventListener("MSPointerMove", this._onPointerMove);

            this._eventsHooked = false;
        }
    };

    hyperlinkTooltipProto._onPointerOver = function (e) {
        /// <summary>Handles the MSPointerOver event, showing or hiding a hyperlink tooltip as appropriate.</summary>
        /// <param name="e" type="MSPointerEvent" />

        var hyperlink = this.getHyperlinkForElement(e.target);
        if (hyperlink && hyperlink.getAttribute("href")) {
            this.open(hyperlink, e.clientX, e.clientY);
        } else {
            this.close();
        }
    };

    hyperlinkTooltipProto._onPointerMove = function (e) {
        /// <summary>Handles the MSPointerMove event, moving the position of a hyperlink tooltip if appropriate.</summary>
        /// <param name="e" type="MSPointerEvent" />

        // If the mouse/pointer keeps moving before the tooltip has actually shown up, update the anchor position.
        if (!this._opened) {
            this._positionAnchorElement(e.clientX, e.clientY);
        }
    };

    hyperlinkTooltipProto._onBeforeOpen = function () {
        /// <summary>Runs setup code right before the tooltip shows up.</summary>

        // We need the anchor element, so unhide it.
        this._tooltipAnchorElement.classList.remove("hidden");

        this._opened = true;
    };

    hyperlinkTooltipProto._onClosed = function () {
        /// <summary>Runs shutdown code right after the tooltip is closed.</summary>

        this._opened = false;

        // We don't need the anchor element, so hide it.
        this._tooltipAnchorElement.classList.add("hidden");

        this._unhookEvents();
    };

    hyperlinkTooltipProto.open = function (element, x, y) {
        /// <summary>Opens the tooltip over the given <a> or <area> element.</summary>
        /// <param name="element" type="HTMLElement">The <a> or <area> element to show a tooltip for.</param>
        /// <param name="x" type="Number">The x coordinate at which to show the tooltip.</param>
        /// <param name="y" type="Number">The y coordinate at which to show the tooltip.</param>
        Debug.assert(this.isNodeName(element, "A", "AREA"), "Expected element to be an <a> or <area> element");
        Debug.assert(Jx.isValidNumber(x), "Expected x to be a valid number");
        Debug.assert(Jx.isValidNumber(y), "Expected y to be a valid number");

        var tooltipElement = this._tooltip.contentElement,
            href = "";
        try {
            // Accessing the href property can throw an exception on malformed URLs.
            href = element.href;
        } catch (ex) {
            Jx.log.exception("Failed to retrieve href", ex);
        }

        // Update the URL to be shown in the tooltip.
        tooltipElement.querySelector(".modernCanvas-hyperlinkTooltip-url").innerText = href;

        // Position the anchor at the given (x, y) for now, but there is a delay before the tooltip actually shows up so if 
        // the mouse/pointer keeps moving then move the anchor element along with it.
        this._positionAnchorElement(x, y);
        
        // There is a delay between calling _tooltip.open() and when the tooltip is actually shown.
        this._tooltip.open("mouseover");

        // Listen for events that should close the tooltip. If these happen before the tooltip is actually shown, we  
        // want to call this.close() to make sure it doesn't open at all.
        this._hookEvents();
    };

    hyperlinkTooltipProto.close = function () {
        /// <summary>Closes the tooltip.</summary>
        this._unhookEvents();
        this._tooltip.close();
    };

    hyperlinkTooltipProto._positionAnchorElement = function (x, y) {
        /// <summary>Positions an html element over the given element.</summary>
        /// <param name="x" type="Number">The x coordinate at which to position the anchor element.</param>
        /// <param name="y" type="Number">The y coordinate at which to position the anchor element.</param>
        Debug.assert(Jx.isValidNumber(x), "Expected x to be a valid number");
        Debug.assert(Jx.isValidNumber(y), "Expected y to be a valid number");
         
        var anchorElement = this._tooltipAnchorElement;
        anchorElement.style.left = x.toString() + "px";
        anchorElement.style.top = y.toString() + "px";
    };
});

//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="ModernCanvasNamespace.js"/>

/// <reference path="Windows.Foundation.js" />

Jx.delayDefine(ModernCanvas, "HyperlinkControl", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var C = window.ModernCanvas;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    function tmpl (data) {
        return '' + 
            '<label id="' + data.idWebAddressDescription + '" aria-hidden="true">' + data.webAddressDescription + '</label>' +
            '<label id="' + data.idWebAddressLabel + '">' + data.labelWebAddress + '</label>' +
            '<input id="' + data.idWebAddress + '" type="url" aria-describedby="' + data.idWebAddressDescription + '" aria-labelledby="' + data.idWebAddressLabel + '"/>' +
            '<label id="' + data.idTextDescription + '" aria-hidden="true">' + data.textDescription + '</label>' + 
            '<label id="' + data.idTextLabel + '">' + data.labelTextToBeDisplayed + '</label>' +
            '<input id="' + data.idText + '" type="text" aria-describedby="' + data.idTextDescription + '" aria-labelledby="' + data.idTextLabel + '"/>' +
            '<label id="' + data.idCompletionButtonDescription + '" aria-hidden="true">' + data.completionButtonDescription + '</label>' +
            '<button id="' + data.idCompletionButton + '" type="button" aria-describedby="' + data.idCompletionButtonDescription + '">' + data.labelCompletionButton + '</button>';
    }

    C.HyperlinkControl = /*@constructor*/function () {
        /// <summary>Creates a new hyperlink control.</summary>
        ModernCanvas.Component.call(this);

        // Build the element
        var div = document.createElement("div");
        div.className = "modernCanvas-flyout hyperlinkControl";
        // Attempt to get a unique enough ID that you could make more than one of this control
        var baseId = "hyperlinkControl" + this._id;
        div.id = baseId;
        /// <disable>JS3092</disable>
        // JSCop doesn't recognize Jx Templates
        div.innerHTML = tmpl({
            completionButtonDescription: Jx.res.getString("/modernCanvas/hyperlinkControl_completionButton"),
            idCompletionButton: baseId + "CompletionButton",
            idCompletionButtonDescription: baseId + "CompletionButtonDescription",
            idText: baseId + "Text",
            idTextDescription: baseId + "TextDescription",
            idTextLabel: baseId + "TextLabel",
            idWebAddress: baseId + "WebAddress",
            idWebAddressDescription: baseId + "WebAddressDescription",
            idWebAddressLabel: baseId + "WebAddressLabel",
            labelCompletionButton: Jx.res.getString("/modernCanvas/hyperlinkControl_completionButton"),
            labelTextToBeDisplayed: Jx.res.getString("/modernCanvas/hyperlinkControl_textToBeDisplayed"),
            labelWebAddress: Jx.res.getString("/modernCanvas/hyperlinkControl_webAddress"),
            textDescription: Jx.res.getString("/modernCanvas/hyperlinkControl_textToBeDisplayed"),
            webAddressDescription: Jx.res.getString("/modernCanvas/hyperlinkControl_webAddressDescription")
        });
        /// <enable>JS3092</enable>
        document.body.appendChild(div);
        this._element = div;
        this._listeners = {};

        // Pull handles to the elements
        this._completionButton = div.querySelector("#" + baseId + "CompletionButton");
        this._webAddressElement = div.querySelector("#" + baseId + "WebAddress");
        this._textElement = div.querySelector("#" + baseId + "Text");

        // Bind functions
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onDismiss = this._onDismiss.bind(this);
        this._setFocus = this._setFocus.bind(this);
        this._fireCommand = this._fireCommand.bind(this);

        // Hook up behaviors
        div.addEventListener("keydown", this._onKeyDown, false);
        this._completionButton.addEventListener("click", this._fireCommand, false);

        // Turn in to flyout
        this._flyout = new WinJS.UI.Flyout(div);
        this._flyout.addEventListener("afterhide", this._onDismiss, false);
        this._flyout.addEventListener("aftershow", this._setFocus, false);
        this._flyout.addEventListener("focus", this._setFocus, false);
    };

    Jx.inherit(C.HyperlinkControl, C.Component);

    var proto = C.HyperlinkControl.prototype;

    proto.dispose = function () {
        /// <summary>Cleans up the control.</summary>

        document.body.removeChild(this._element);
        this._completionButton.removeEventListener("click", this._fireCommand, false);
        this._completionButton = null;
        this._element.removeEventListener("keydown", this._onKeyDown, false);
        this._flyout.removeEventListener("afterhide", this._onDismiss, false);
        this._flyout.removeEventListener("aftershow", this._setFocus, false);
        this._flyout.removeEventListener("focus", this._setFocus, false);
        this._flyout = null;
        this._textElement = null;
        this._webAddressElement = null;
    };

    proto.hide = function () {
        /// <summary>Hides the control.</summary>

        this._flyout.hide();
    };

    proto.show = function (referenceElement) {
        /// <summary>Displays the control with updated content.</summary>
        /// <param name="referenceElement" type="HTMLElement">The element to base the positiong of the flyout from.</param>

        this._webAddressElement.value = "";
        // If there is a hyperlink on the clipboard, try to put that in the web address field            
        // If it causes an error, continue on
        var clipPromise = WinJS.Promise.wrap(null),
            that = this;
        try {
            var clipboard = Windows.ApplicationModel.DataTransfer.Clipboard,
                contents = clipboard.getContent();
            if (contents.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri)) {
                clipPromise = contents.getUriAsync().then(function (uri) {
                    /// <summary>Inserts the URI from the clipboard into the text field.</summary>
                    /// <param name="uri" type="Windows.Foundation.Uri">The URI from the clipboard to insert.</param>
                    that._webAddressElement.value = uri.absoluteUri;
                });
            } else if (contents.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
                clipPromise = contents.getTextAsync().then(function (text) {
                    /// <summary>Inserts the URI from the clipboard into the text field.</summary>
                    /// <param name="text" type="String">The URI from the clipboard to insert.</param>
                    if (C.ModernCanvasBase.prototype._regexAbsoluteUrl.test(text)) {
                        that._webAddressElement.value = text;
                    }
                });
            }
        } catch (e) { }

        clipPromise.done(function () {
            // Save the selection data
            that._selectedNode = that._expandSelection();
            // Place the current text in the text section
            that._setSelectionText();
            // Save the starting value for comparison at save time
            that._originalTextValue = that._textElement.value;
            // Show the flyout
            that._flyout.show(referenceElement);
        });
    };

    proto._setSelectionText = function () {
        if (!this._selectionRange) {
            this._textElement.value = "";
            this._textElement.disabled = false;
            return;
        }

        var root = this.getElementFromNode(this._selectionRange.commonAncestorContainer),
            bookmark = new ModernCanvas.RangeBookmark(this._selectionRange, root);
        root = root.cloneNode(true);
        var range = bookmark.getBookmarkedRange(root);
        if (!range) {
            range = this._selectionRange;
        } else {
            var durableRange = new ModernCanvas.DurableRange(range),
                canvas = /*@static_cast(C.ModernCanvasBase)*/this.getParent();
            canvas.components.autoReplaceManager.bulkElementConversion(root, ["outbound"]);
            range = durableRange.range;
        }

        if (this._isSelectionEditable(range)) {
            this._textElement.value = range.toString();
            this._textElement.disabled = false;
        } else {
            // formatted selection
            this._textElement.value = Jx.res.getString("/modernCanvas/hyperlinkControl_textElementDisabled");
            this._textElement.disabled = true;
        }
    };

    proto._isSelectionEditable = function (range) {
        /// <summary>Determine if the range given should be editable in the dialog.</summary>
        /// <param name="range" type="Range">The range to inspect.</param>
        /// <returns type="Boolean">Returns true if the given range should be editable in the dialog.</returns>

        var root = range.commonAncestorContainer,
            that = this;
        if (range.collapsed || root.nodeType === Node.TEXT_NODE) {
            return true;
        }

        var iterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, function (node) {
            /// <summary>Chooses which nodes to expose via the iterator.</summary>
            /// <param name="node" type="Node">The given node, which we can choose to accept or skip.</param>
            if (root === node) {
                return NodeFilter.FILTER_SKIP;
            }
            if (that.intersectsNode(range, node)) {
                return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
        }, false);

        var currentNode = iterator.nextNode();
        while (currentNode) {
            if (this.isBlockElement(currentNode)) {
                return false;
            }

            currentNode = iterator.nextNode();
        }

        return true;
    };

    proto._expandSelection = function () {
        /// <summary>Expand the selection to include any anchors in the selection</summary>
        /// <returns type="HTMLElement">Returns a selected a element if found, null if not</returns>

        var range = this.getSelectionRange();
        if (!range) {
            return null;
        }
        range = range.cloneRange();

        // If we are sitting inside a hyperlink already
        var selectedNode = this.getParentElementForSelection("a");
        if (selectedNode) {
            // Expand the selection to the hyperlink contents
            range.selectNodeContents(/*@static_cast(Node)*/selectedNode);

            // Prepopulate the web address field
            this._webAddressElement.value = selectedNode.getAttribute("href");
            this._selectionRange = range;

            return selectedNode;
        }

        // otherwise if there is part of a hyperlink in the selection, expand it to include the entire hyperlink

        if (range.collapsed) {
            // TODO: WinBlue:211577 - How to expand to the nearest word?
            // var textRange = this.getSelectionTextRange();
            // if (Boolean(textRange) && this._inWord(range)) {
            //     textRange.expand("word");
            //     // Transform the textRange into a normal Range
            //     // by making it the active selection; saving and then reverting to the previous saved Range
            //     textRange.select();
            //     var newRange = this.getSelectionRange();
            //     this.replaceSelection(range);
            //     range = newRange;
            // }
        }

        var anchors = this.getElementFromNode(range.commonAncestorContainer).querySelectorAll("a"),
            testRange = this.getDocument().createRange(),
            modified = false;
        for (var m = anchors.length; m--;) {
            var anchor = /*@static_cast(HTMLElement)*/anchors[m];
            testRange.selectNodeContents(/*@static_cast(Node)*/anchor);
            // If the anchor overlaps at the start of our range
            if ((testRange.compareBoundaryPoints(Range.START_TO_START, range) < 0) &&
                (testRange.compareBoundaryPoints(Range.START_TO_END, range) > 0)) {
                // Pull the range start back to the beginning of the anchor
                range.setStartBefore(/*@static_cast(Node)*/anchor);
                modified = true;
            } else if ((testRange.compareBoundaryPoints(Range.END_TO_END, range) > 0) &&
                (testRange.compareBoundaryPoints(Range.END_TO_START, range) < 0)) {
                // Else if the anchor overlaps at the end of our range
                // Extend the range end to the end of the anchor
                range.setEndAfter(/*@static_cast(Node)*/anchor);
                modified = true;
            }
            if (modified || (testRange.compareBoundaryPoints(Range.START_TO_START, range) >= 0 && testRange.compareBoundaryPoints(Range.END_TO_END, range) <= 0)) {
                // And save the web address as this is probably what the user wants
                this._webAddressElement.value = anchor.getAttribute("href");
            }
        }

        this._selectionRange = range;

        return null;
    };

    proto._inWord = function (range) {
        /// <summary>Checks if the current range is in the middle of a word.</summary>
        /// <param name="range" type="Range">The range to determine.</param>
        /// <returns type="Boolean">true if the range is within a word.</returns>

        Debug.assert(range);
        Debug.assert(range.collapsed);

        var container = range.startContainer;

        if (container.nodeType !== Node.TEXT_NODE) {
            return false;
        }
        var text = container.nodeValue,
            offset = range.startOffset;

        // handle the cases where text can become fragmented/denormalized into multiple text nodes
        if (offset === 0) {
            while (offset === 0 && Boolean(container.previousSibling) && container.previousSibling.nodeType === Node.TEXT_NODE) {
                container = container.previousSibling;
                text = container.nodeValue + text;
                offset += container.nodeValue.length;
            }
        } else if (offset === text.length) {
            while (offset === text.length && Boolean(container.nextSibling) && container.nextSibling.nodeType === Node.TEXT_NODE) {
                container = container.nextSibling;
                text = text + container.nodeValue;
            }
        }

        if (offset === 0 || offset === text.length) {
            return false;
        }

        var regexWhitespace = C.ModernCanvasBase.prototype._regexWhitespace;
        return !regexWhitespace.test(text.charAt(offset)) &&
            !regexWhitespace.test(text.charAt(offset - 1));
    };

    proto._onDismiss = function () {
        /// <summary>Cleans up DOM handles on dismiss of the flyout.</summary>

        if (!this._firedCommand) {
            // The insertHyperlink command sets the selection back into the canvas, so only do this if the user explicitly cancels.
            var canvas = /*@static_cast(C.ModernCanvasBase)*/this.getParent();
            canvas.focus();
        }

        // Then clear handles
        this._selectedNode = null;
        this._selectionRange = null;
        this._firedCommand = false;
    };

    proto._onKeyDown = function (e) {
        /// <summary>Handles key down events in the flyout.</summary>
        /// <param name="e" type="Event">The keydown event being fired.</param>

        // keyCode 229 is present when event comes from the IME
        if (e.keyCode !== 229 && e.key === "Enter") {
            e.preventDefault();
            this._fireCommand();
        }
    };

    proto._setFocus = function () {
        /// <summary>Sets focus to the appropriate field inside the control.</summary>
        // If the first has something but the second field is empty
        if (this._webAddressElement.value !== "" && this._textElement.value === "") {
            // Go to the second field
            this._textElement.focus();
        } else {
            // In all other cases, go to the first field
            this._webAddressElement.focus();
        }
    };

    proto._fireCommand = function () {
        /// <summary>Takes the control data and passes it to the command to execute</summary>

        // NOTE: We need to make a local copy of the selection range first, as the 'this'
        // reference may get cleaned up by the onDismiss event firing mid execution do to
        // selection/focus changes
        var commandEvent = {
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
        Jx.raiseEvent(this.getParent(), "command", commandEvent);
        this._firedCommand = true;
        this.hide();
    };

    proto._firedCommand = false;
    proto._originalTextValue = /*@static_cast(String)*/null;
    proto._selectedNode = /*@static_cast(HTMLElement)*/null;
    proto._selectionRange = /*@static_cast(Range)*/null;
    proto._textElement = /*@static_cast(HTMLElement)*/null;
    proto._webAddressElement = /*@static_cast(HTMLElement)*/null;
    proto._completionButton = /*@static_cast(HTMLElement)*/null;
    proto._element = /*@static_cast(HTMLElement)*/null;
    proto._flyout = /*@static_cast(WinJS.UI.Flyout)*/null;

});

//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="ModernCanvasNamespace.js"/>

Jx.delayDefine(ModernCanvas, "ShortcutManager", function () {

    ModernCanvas.ShortcutManager = /*@constructor*/function (className) {
        /// <summary>A ShortcutManager class.</summary>
        /// <param name="className" type="String" optional="true">The class of ShortcutManager to instance.  If not defined the default will be used.</param>
        // Make this a component
        ModernCanvas.Component.call(this);

        // Initialize variables
        this._className = className || "default";
        Debug.assert(Boolean(ModernCanvas.ShortcutManager.Classes[this._className]), "className must be a defined class");
        this._shortcuts = {};

        // Bind prototype functions
        this.onKeyDown = this.onKeyDown.bind(this);
    };
    Jx.inherit(ModernCanvas.ShortcutManager, ModernCanvas.Component);

    var classes = ModernCanvas.ShortcutManager.Classes = { empty: [] };
    classes["basic"] = [
        // NOTE: The following shortcuts are included in "basic" simply to block IE defaults from executing: 
        //     "bold", "copy", "cut", "italic", "paste", "redo", "selectAll", "underline", "undo"
        "accentAcute",
        "accentCedilla",
        "accentCircumflex",
        "accentDiaeresis",
        "accentGrave",
        "accentLigature",
        "accentRing",
        "accentSlash",
        "accentTilde",
        "bold",
        "copy",
        "cut",
        "italic",
        "paste",
        "quotedLink",
        "redo",
        "selectAll",
        "underline",
        "undo"
    ];
    classes["default"] =
        classes["basic"].concat([
            "alignCenter",
            "alignLeft",
            "alignRight",
            "bullets",
            "clearFormatting",
            "growFont",
            "growFontOnePoint",
            "indent",
            "numbers",
            "#conditional:list#outdent",
            "#conditional:emptyList#outdent",
            "outdent",
            "showHyperlinkControl",
            "shrinkFont",
            "shrinkFontOnePoint"
        ]);

    classes["calendar"] = classes["default"];
    classes["chat"]     = classes["basic"];
    classes["mail"]     = classes["default"].concat(["font"]);
    classes["people"]   = classes["basic"];
    classes["stm"]      = classes["default"];

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

    var managerProto = ModernCanvas.ShortcutManager.prototype;
    managerProto._conditionalFunctions = {
        list: /*@bind(ModernCanvas.ShortcutManager)*/function (requireEmpty) {
            /// <summary>Determines if the selection is at the beginning of a list item.</summary>
            /// <param name="requireEmpty" type="Boolean" optional="true">true if the item must be empty</param>
            /// <returns type="Boolean">true if selection is at the beginning of a list item, and false otherwise.</returns>

            // Get the current selection range
            var selectionRange = this.getSelectionRange();
            if (selectionRange) {

                // If we are not at the beginning of just one element, we cannot be at the beginning of a list element
                if (selectionRange.startOffset !== 0 || selectionRange.endOffset !== 0 || selectionRange.startContainer !== selectionRange.endContainer) {
                    return false;
                }
                var containerElement = selectionRange.startContainer,
                    isEmpty = this.isEmpty(containerElement);
                // Try searching until we find the list item we are at the beginning of
                while (!this.isNodeName(containerElement, "LI", "BLOCKQUOTE")) {
                    // Check if we are the left most child of our parent, if so continue up, if not return false
                    if (containerElement.parentNode.childNodes[0] === containerElement) {
                        containerElement = containerElement.parentNode;
                    } else {
                        return false;
                    }
                }
                // We have gotten up to a list element, staying at the beginning
                return !requireEmpty || isEmpty;
            }
            // We have no selection, so we are not at the beginning of a list item
            return false;
        },
        emptyList: /*@bind(ModernCanvas.ShortcutManager)*/function () {
            /// <summary>Determines if the selection is at the beginning of a list item that is empty.</summary>
            /// <returns type="Boolean">true if selection is at the beginning of a list item which is empty, and false otherwise.</returns>
            return managerProto._conditionalFunctions.list.call(this, /*requireEmpty*/ true);
        },
        selection: /*@bind(ModernCanvas.ShortcutManager)*/function () {
            /// <summary>Determines if there is currently a selection.</summary>
            /// <returns type="Boolean">true if there is a selection, and false otherwise.</returns>
            var selectionRange = this.getSelectionRange();
            return Boolean(selectionRange) && !selectionRange.collapsed;
        }
    };
    managerProto._ensureShortcuts = function () {
        /// <summary>Function to ensure that shortcuts for the requested class have been loaded.</summary>
        this._ensureShortcuts = function () { };

        var shortcutStrings = ModernCanvas.ShortcutManager.ShortcutStrings,
            commands = /*@static_cast(Array)*/ModernCanvas.ShortcutManager.Classes[this._className],
            shortcuts,
            n;
        for (var m = commands.length; m--;) {
            shortcuts = /*@static_cast(Array)*/shortcutStrings[commands[m]].split(";");
            for (n = shortcuts.length; n--;) {
                this.setShortcut(shortcuts[n], commands[m]);
            }
        }
    };
    managerProto._shortcuts = {};
    managerProto._splitKeys = function (keys) {
        /// <summary>Splits a string describing a shortcut sequence into a primary and modifier value.</summary>
        /// <param name="keys" type="String">The keys comprising the shortcut.</param>
        /// <returns type="__ModernCanvas.ShortcutManager.KeyObject">An object with a 'primary' and 'modifier' attribute, describing the key sequence.</returns>
        Debug.assert(typeof keys === "string");
        var keyArray = keys.toLowerCase().split("+");
        var flags = 0,
            key,
            keyElement;
        for (var m = keyArray.length; m--;) {
            keyElement = keyArray[m];
            if (keyElement === "alt") {
                flags |= 0x1;
            } else if (keyElement === "ctrl") {
                flags |= 0x2;
            } else if (keyElement === "shift") {
                flags |= 0x4;
            } else {
                key = keyElement;
            }
        }
        var newKey = Jx.KeyCode[key];
        if (newKey) {
            key = "#|" + newKey;
        }

        var result = {};
        result.primary = key || "";
        result.modifier = flags;
        Debug.assert(flags < 8);
        Debug.assert(Boolean(key) || Boolean(flags));
        return result;
    };
    managerProto.getShortcut = function (keys) {
        /// <summary>Gets the command ID for a given shortcut string.</summary>
        /// <param name="keys" type="String">The keys comprising the shortcut defined.</param>
        Debug.assert(typeof keys === "string");
        Debug.assert(this._splitKeys);
        this._ensureShortcuts();
        var splitKeys = this._splitKeys(keys);
        if (!this._shortcuts[splitKeys.primary]) {
            return null;
        } else {
            return this._shortcuts[splitKeys.primary][splitKeys.modifier] || null;
        }
    };
    managerProto.onKeyDown = function (e) {
        /// <summary>keyDown listener that fires command events based on defined shortcuts and caught key events.</summary>
        /// <param name="e" type="Event">The event fired on each key press.</param>
        /// <returns type="Boolean">True to say default action is permitted.  False if the caller should prevent the default action.</returns>
        ModernCanvas.mark("ShortcutManager.onKeyDown", ModernCanvas.LogEvent.start);
        Debug.assert(e.key);
        Debug.assert(e.keyCode);
        this._ensureShortcuts();

        var possibleCommands = this._getPossibleCommands(e),
            defaultPrevented = false;

        if (!possibleCommands) {
            ModernCanvas.mark("ShortcutManager.onKeyDown", ModernCanvas.LogEvent.stop);
            return true;
        }

        var commandId = this._findCommand(possibleCommands);
        if (!commandId) {
            ModernCanvas.mark("ShortcutManager.onKeyDown", ModernCanvas.LogEvent.stop);
            return true;
        }

        // Check if this shortcut should block the keystroke, or allow it to continue
        if (commandId.substr(0, 13) === "#nonblocking#") {
            commandId = commandId.substr(13);
        } else {
            defaultPrevented = true;
        }
        // Update usage data
        var requestsFired = this._usageData[commandId] || 0;
        this._usageData[commandId] = requestsFired + 1;
        // Create and fire command event
        var cmdEvent = { command: commandId, target: e.target, keyDownEvent: e };
        Jx.raiseEvent(this.getParent(), "command", cmdEvent);

        // see if the event has been canceled; this only works for non-async commands
        if (cmdEvent.hasOwnProperty("defaultPrevented")) {
            defaultPrevented = cmdEvent["defaultPrevented"];
        }

        if (defaultPrevented) {
            e.preventDefault();
        }

        ModernCanvas.mark("ShortcutManager.onKeyDown", ModernCanvas.LogEvent.stop);
        return !defaultPrevented;
    };

    managerProto._getPossibleCommands = function (e) {
        /// <summary>Gets the list of possible commands from the keydown event.</summary>
        /// <param name="e" type="Event">The event fired on each key press.</param>
        /// <returns type="Array">The array of possible commands.</returns>

        var flagNode = this._shortcuts["#|" + String(e.keyCode)] || this._shortcuts[e.key];
        if (!flagNode) {
            return null;
        }

        var flags = 0;
        if (e.altKey) {
            flags |= 0x1;
        }
        if (e.ctrlKey) {
            flags |= 0x2;
        }
        if (e.shiftKey) {
            flags |= 0x4;
        }

        var flagsString = flags.toString(),
            shortcutFlags = Object.keys(flagNode);
        for (var m = shortcutFlags.length; m--;) {
            var possibleFlag = shortcutFlags[m];
            if (possibleFlag === flagsString) {
                var shortcutCommand = flagNode[possibleFlag];
                Debug.assert(Jx.isArray(shortcutCommand));
                return shortcutCommand;
            }
        }
        return null;
    };

    managerProto._findCommand = function (possibleCommands) {
        /// <summary>Find the applying command from the list of possible commands.</summary>
        /// <param name="possibleCommands" type="Array">the list of possible commands</param>
        /// <returns type="String">The found commandId or null if none applies.</returns>

        for (var m = possibleCommands.length; m--;) {
            var commandId = /*@static_cast(String)*/possibleCommands[m];

            if (commandId.substr(0, 13) === "#conditional:") {
                commandId = commandId.substr(13);

                var index = commandId.indexOf("#"),
                    conditions = commandId.substr(0, index).split(",");

                // Check through all the conditions to see if we match one
                for (var n = conditions.length; n--;) {
                    if (this._conditionalFunctions[conditions[n]].call(this)) {
                        return commandId.substr(index + 1);
                    }
                }
            } else {
                return commandId;
            }
        }
        return null;
    };

    managerProto.removeShortcut = function (keys) {
        /// <summary>Removes a shortcut from this instance.</summary>
        /// <param name="keys" type="String" optional="true">The keys comprising the shortcut to remove.  If not defined removes all shortcuts.</param>
        Debug.assert(this._shortcuts);
        this._ensureShortcuts();
        if (keys) {
            Debug.assert(typeof keys === "string");
            var splitKeys = this._splitKeys(keys);
            var flagNode = this._shortcuts[splitKeys.primary];
            if (flagNode) {
                if (flagNode[splitKeys.modifier]) {
                    delete this._shortcuts[splitKeys.primary][splitKeys.modifier];
                }
            }
        } else {
            this._shortcuts = {};
        }
    };
    managerProto.setShortcut = function (keys, commandId) {
        /// <summary>Adds or modifies a shorcut in this instance.</summary>
        /// <param name="keys" type="String">The keys comprising the shortcut to define.</param>
        /// <param name="commandId" type="String">The command ID to trigger an event for when the shortcut is pressed.</param>
        Debug.assert(typeof commandId === "string");
        Debug.assert(typeof keys === "string");
        Debug.assert(this._splitKeys);
        var splitKeys = this._splitKeys(keys);
        if (!this._shortcuts[splitKeys.primary]) {
            this._shortcuts[splitKeys.primary] = {};
        }
        var existing = this._shortcuts[splitKeys.primary][splitKeys.modifier];
        Debug.assert(!existing || (Jx.isArray(existing) && commandId.substr(0, 13) === "#conditional:"));
        if (!existing) {
            existing = [];
        }
        this._shortcuts[splitKeys.primary][splitKeys.modifier] = existing.concat([commandId]);
    };
});

//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="ModernCanvasNamespace.js"/>
/// <reference path="ModernCanvas.js"/>
/// <reference path="HyperlinkControl.js"/>

/// <reference path="Windows.Foundation.js" />

// TODO: use Jx.delayDefine


if (!Jx.isWWA) {
    window.MSApp = window.MSApp || {};
    /*@override*/MSApp.execUnsafeLocalFunction = function (toExecute) {
        toExecute();
    };
}


ModernCanvas.WindowsLive = {};

ModernCanvas.AutoReplaceManager.prototype.getElementHTML = function (uniqueId, autoReplaceClassName) {
    /// <summary>Generates the HTML string for a given element.</summary>
    /// <param name="uniqueId" type="String">The unique ID for the element to generate the HTML.</param>
    /// <param name="autoReplaceClassName" type="String">The name of the class for which to generate the HTML.</param>
    /// <returns type="String">An HTML string with the newly formed element tag.</returns>
    this._ensureElementDefinitions();
    var elementHTML = this._autoReplaceTables.getElements()[uniqueId];
    if (!elementHTML) {
        if (autoReplaceClassName === "inbound") {
            elementHTML = '&#x' + uniqueId + ';';
        } else {
            Debug.assert(autoReplaceClassName === "outbound");
            elementHTML = '<span data-externalstyle="false" style="font-family:\'Segoe UI Emoji\',\'Segoe UI Symbol\',\'Apple Color Emoji\';">&#x' + uniqueId + ';</span>'
        }
    }
    return elementHTML;
};

ModernCanvas.WindowsLive.ModernCanvas = /*@constructor*/function (iframeElement, options) {
    /// <summary>Constructs a new Modern Canvas control with Windows Live arguments.</summary>
    /// <param name="iframeElement" type="HTMLElement">The iframe element that will host the Modern Canvas control.</param>
    /// <param name="options" type="__ModernCanvas.ModernCanvas.Options" optional="true">A property bag of any valid options.</param>
    ModernCanvas.mark("WindowsLiveModernCanvas.ctor", ModernCanvas.LogEvent.start);
    
    // Provide a handle for quickly debugging through the Jx console
    window.debugModernCanvas = this;
    
    options = options || {};
    if (!options.className) {
        options.className = "default";
    } else {
        options.className = options.className.toLowerCase();
    }
    
    if (!options.logFunction) {
        options.logFunction = function (message) {
            Jx.log.error("ModernCanvas Error: " + message);
        };
    }
    

    var live = ModernCanvas.WindowsLive;

    
    // If this is a WWA
    if (Jx.isWWA) {
        
        var iframeDocument = iframeElement.contentDocument;
        iframeDocument.addEventListener("keydown", ModernCanvas.WindowsLive.onKeyDown, false);
        iframeDocument.addEventListener("keyup", ModernCanvas.WindowsLive.onKeyUp, false);
        iframeDocument.addEventListener("contextmenu", ModernCanvas.WindowsLive.onContextMenu, false);
        
    }
    

    // Make sure the proper AutoReplaceManager will get used
    // TODO: WinLive 428689: In M4 this should key off a setting instead of a hard-coded list of apps. (This will come as part of the mail settings work)
    if (!options.autoReplaceManager) {
        if (options.className === "mail" || options.className === "stm") {
            options.autoReplaceManager = new ModernCanvas.AutoReplaceManager("mail");
        } else if (options.className === "people") {
            options.autoReplaceManager = new ModernCanvas.AutoReplaceManager("basic");
        }
    }

    // Complete main initialization
    ModernCanvas.ModernCanvasBase.apply(this, arguments);

    ModernCanvas.mark("WindowsLiveModernCanvas.ctor", ModernCanvas.LogEvent.stop);
};

// Inherit from the original ModernCanvas.ModernCanvas
Jx.inherit(ModernCanvas.WindowsLive.ModernCanvas, ModernCanvas.ModernCanvasBase);

ModernCanvas.WindowsLive.ModernCanvas.prototype.dispose = function () {
    /// <summary>Cleans up all resources of the Modern Canvas.</summary>
    
    this._iframeDocument.removeEventListener("keydown", ModernCanvas.WindowsLive.onKeyDown, false);
    this._iframeDocument.removeEventListener("keyup", ModernCanvas.WindowsLive.onKeyUp, false);
    this._iframeDocument.removeEventListener("contextmenu", ModernCanvas.WindowsLive.onContextMenu, false);
    ModernCanvas.ModernCanvasBase.prototype.dispose.apply(this, arguments);
};


ModernCanvas.WindowsLive.onContextMenu = function (e) {
    /// <summary>Fires an ETW event for context menu.</summary>
    /// <param name="e" type="Event">The context menu event.</param>
    ModernCanvas.log("ContextMenu");
};

ModernCanvas.WindowsLive.onKeyDown = function (e) {
    /// <summary>Fires an ETW event for key down and delete.</summary>
    /// <param name="e" type="Event">The key down event.</param>
    var keyCodes = Jx.KeyCode,
        _keyCode = e.keyCode;
    if (_keyCode === keyCodes.backspace || _keyCode === keyCodes["delete"]) {
        ModernCanvas.log("DeleteKey", ModernCanvas.LogEvent.start);
    } else if (_keyCode === keyCodes.numlock) {
        ModernCanvas.log("NumLockKey", ModernCanvas.LogEvent.start);
    } else {
        ModernCanvas.log("KeyPress", ModernCanvas.LogEvent.start);
    }
};

ModernCanvas.WindowsLive.onKeyUp = function (e) {
    /// <summary>Fires an ETW event for key up.</summary>
    /// <param name="e" type="Event">The key up event.</param>
    var keyCodes = Jx.KeyCode,
        _keyCode = e.keyCode;
    if (_keyCode === keyCodes.backspace || _keyCode === keyCodes["delete"]) {
        ModernCanvas.log("DeleteKey", ModernCanvas.LogEvent.stop);
    } else if (_keyCode === keyCodes.numlock) {
        ModernCanvas.log("NumLockKey", ModernCanvas.LogEvent.stop);
    } else {
        ModernCanvas.log("KeyPress", ModernCanvas.LogEvent.stop);
    }
};

ModernCanvas.ModernCanvas = ModernCanvas.WindowsLive.ModernCanvas;


ModernCanvas.log = function (eventName, eventType) {
    ModernCanvas.mark("WindowsLiveModernCanvas." + eventName, eventType);
};

//
// Copyright (C) Microsoft. All rights reserved.
//

// TODO: use Jx.delayDefine

/*jshint browser:true */
/*global ModernCanvas,Debug,Jx,Microsoft,Windows,Mail,URL,WinJS,setImmediate*/
("Mail" in window || (("Share" in window) && ("MailData" in window.Share))) && (function () {

// This code should run in the Mail app only

// This ModernCanvas wrapper serves to manage between the ModernCanvas blob image handling and a mailMessage embedded attachments.
ModernCanvas.Mail = {};

ModernCanvas.Mail.createAttachmentAsync = function (mailMessage, attachmentUIType, stream, contentType, fileName) {
    /// <summary>Asynchronously creates an embedded or ordinary attachment.</summary>
    /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.MailMessage" />
    /// <param name="attachmentUIType" type="Microsoft.WindowsLive.Platform.AttachmentUIType" />
    /// <param name="stream" type="Windows.Storage.Streams.IRandomAccessStream" />
    /// <param name="contentType" type="String" />
    /// <param name="fileName" type="String" />
    Debug.assert(!Jx.isNullOrUndefined(mailMessage));
    Debug.assert(attachmentUIType === Microsoft.WindowsLive.Platform.AttachmentUIType.embedded || attachmentUIType === Microsoft.WindowsLive.Platform.AttachmentUIType.ordinary);
    Debug.assert(!Jx.isNullOrUndefined(stream));
    Debug.assert(Jx.isNonEmptyString(contentType));
    Debug.assert(Jx.isNonEmptyString(fileName));

    // Save to a file and then use that to create the body
    var fileStream = null,
        filePath = null;
    return Windows.Storage.ApplicationData.current.temporaryFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.generateUniqueName).
        then(function (tempFile) {
            filePath = tempFile.path;
            fileName = tempFile.name;

            return tempFile.openAsync(Windows.Storage.FileAccessMode.readWrite);
        }).then(function (openedStream) {
            fileStream = openedStream;
            fileStream.seek(0);

            return Windows.Storage.Streams.RandomAccessStream.copyAsync(stream, fileStream);
        }).then(function () {
            return fileStream.flushAsync();
        }).then(function () {
            var fileSize = fileStream.size;
            Jx.dispose(fileStream);

            var newAttachment = mailMessage.createAttachment();
            newAttachment.uiType = attachmentUIType;
            newAttachment.contentType = contentType;
            newAttachment.composeStatus = Microsoft.WindowsLive.Platform.AttachmentComposeStatus.done;

            // Generate contentId using a combination of the current time concatenated with a unique number.
            var now = new Date();
            newAttachment.contentId = fileName + "@" + now.getTime().toString(16) + Jx.uid().toString(16);
            newAttachment.fileName = fileName;
            newAttachment.createBodyFromFile(filePath, fileSize);

            mailMessage.commit();

            return newAttachment;
        });
};

ModernCanvas.Mail.convertDocumentToDocumentFragment = function (documentNode, attributesToCopy) {
    /// <summary>Converts a Document node to a DocumentFragment by stealing only the children of the body element and any style elements.</summary>
    /// <param name="documentNode" type="Document" />
    /// <param name="attributesToCopy" type="Array">List of attribute names to take from the document body and put in a surrounding div of the content</param>
    /// <returns type="DocumentFragment" />
    ModernCanvas.mark("MailModernCanvas.convertDocumentToDocumentFragment", ModernCanvas.LogEvent.start);
    Debug.assert(documentNode.nodeType === Node.DOCUMENT_NODE, "Expected documentNode to be a document node");
    Debug.assert(Jx.isNullOrUndefined(attributesToCopy) || Jx.isArray(attributesToCopy) && attributesToCopy.length > 0);

    // The Modern Canvas editable region is hosted in a <div> and therefore only supports children under the <body> element.
    var range = documentNode.createRange(),
        body = documentNode.body;
    range.selectNodeContents(body);
    
    if (attributesToCopy) {
        var div = documentNode.createElement("div");
        attributesToCopy.forEach(function (attr) {
            div.setAttribute(attr, body.getAttribute(attr));
        });
        range.surroundContents(div);
    }
        
    var documentFragment = range.extractContents();

    // Modern Canvas has special handling for <style> elements, so we need to preserve those too.
    var styleElements = documentNode.querySelectorAll("style");
    for (var i = 0, len = styleElements.length; i < len; i++) {
        documentFragment.appendChild(styleElements[i]);
    }

    ModernCanvas.mark("MailModernCanvas.convertDocumentToDocumentFragment", ModernCanvas.LogEvent.stop);
    return documentFragment;
};

ModernCanvas.Mail._getCidUrl = function (attachment) {
    /// <summary>Gets the cid: URL for the attachment.</summary>
    /// <param name="attachment" type="Microsoft.WindowsLive.Platform.MailAttachment">The attachment for which to get the cid: URL.</param>
    /// <returns type="String">The cid: URL for the attachment.</returns>
    return "cid:" + attachment.contentId.trim().replace(/(^<)|(>$)/g, "");
};

ModernCanvas.Mail.ModernCanvas = /*@constructor*/function (iframeElement, options) {
    /// <summary>Constructs a new Modern Canvas control. with Mail arguments.</summary>
    /// <param name="iframeElement" type="HTMLElement">The iframe element that will host the Modern Canvas control.</param>
    /// <param name="options" type="__ModernCanvas.ModernCanvas.Options" optional="true">A property bag of any valid options.</param>
    ModernCanvas.mark("MailModernCanvas.ctor", ModernCanvas.LogEvent.start);
    // Load parameters
    this._attachmentsBeingAdded = 0;
    this._pastedFiles = [];
    this._mailMessage = options.mailMessage || null;
    this._mailAccount = options.mailAccount || null;
    this._signatureLocation = null;
    this._urlToCidUrl = {};
    this._fontStyle = '';

    // Bind functions
    /// <disable>JS3092</disable>
    this._onPaste = this._onPaste.bind(this);
    this._onPasteImage = this._onPasteImage.bind(this);
    this.setMailAccount = this.setMailAccount.bind(this);
    this.setMailMessage = this.setMailMessage.bind(this);
    /// <enable>JS3092</enable>

    // Complete main initialization
    ModernCanvas.WindowsLive.ModernCanvas.apply(this, arguments);

    // element used to mask the content editable area
    var maskElement = document.createElement("div");
    maskElement.classList.add("modernCanvas-mask");
    maskElement.style.display = "none";
    this._maskElement = maskElement;
    iframeElement.parentNode.appendChild(maskElement);

    this._onMailItemDragStart = this._onMailItemDragStart.bind(this);
    this._onMailItemDragEnd = this._onMailItemDragEnd.bind(this);

    document.addEventListener("mailitemdragstart", this._onMailItemDragStart, false);
    document.addEventListener("mailitemdragend", this._onMailItemDragEnd, false);

    // Pre-populate the <head> with Outlook styles that may be stripped
    // NOTE: We don't need to localize these styles because they all have class restrictions
    // that we won't be using in our apps.  Also, although the RTL orientation may change during the App lifetime,
    // the incoming email would have stayed the same, so we are really just taking a best guess anyways.
    var rtl = Jx.isRtl(),
        right,
        left;
    if (rtl) {
        right = "left";
        left = "right";
    } else {
        right = "right";
        left = "left";
    }
    var outlookStyles = document.createElement("style");
    outlookStyles.setAttribute("data-externalstyle", "true");
    outlookStyles.classList.add("modernCanvas-contentStyle");
    outlookStyles.classList.add("modernCanvas-defaultStyle");
    outlookStyles.innerHTML =
        '\n' +
        'p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {\n' +
            'margin-top:0in;\n' +
            'margin-' + right + ':0in;\n' +
            'margin-bottom:0in;\n' +
            'margin-' + left + ':.5in;\n' +
            'margin-bottom:.0001pt;\n' +
        '}\n' +
        'p.MsoNormal, li.MsoNormal, div.MsoNormal {\n' +
            'margin:0in;\n' +
            'margin-bottom:.0001pt;\n' +
        '}\n' +
        'p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst, \n' +
        'p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle, \n' +
        'p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {\n' +
            'margin-top:0in;\n' +
            'margin-' + right + ':0in;\n' +
            'margin-bottom:0in;\n' +
            'margin-' + left + ':.5in;\n' +
            'margin-bottom:.0001pt;\n' +
            'line-height:115%;\n' +
        '}\n';

    this._iframeDocument.querySelector("head").appendChild(outlookStyles);
    
    if(window.Mail && !window.Share){
        // Mail is the only one that needs to be updated when the control changes. It's impossible to update the control while
        // share is open
        Mail.Globals.appSettings.addListener(Mail.AppSettings.Events.fontSettingChanged, this._setFontStyle, this);
    }
    ModernCanvas.mark("MailModernCanvas.ctor", ModernCanvas.LogEvent.stop);
};

// Inherit from the original ModernCanvas.ModernCanvas
Jx.inherit(ModernCanvas.Mail.ModernCanvas, ModernCanvas.WindowsLive.ModernCanvas);
var mailCanvasProto = ModernCanvas.Mail.ModernCanvas.prototype;

mailCanvasProto.dispose = function () {
    document.removeEventListener("mailitemdragstart", this._onMailItemDragStart, false);
    document.removeEventListener("mailitemdragend", this._onMailItemDragEnd, false);
    if (window.Mail && !window.Share) {
        Mail.Globals.appSettings.removeListener(Mail.AppSettings.Events.fontSettingChanged, this._setFontStyle, this);
    }
    ModernCanvas.WindowsLive.ModernCanvas.prototype.dispose.apply(this);
};


mailCanvasProto._onMailItemDragStart = function () {
    // <summary>cover the canvas with an uneditable div while a mail message is dragging</summary>
    this._maskElement.style.height = this._iframeElement.offsetHeight + "px";
    this._maskElement.style.width = this._iframeElement.offsetWidth + "px";
    this._maskElement.style.display = "";
};

mailCanvasProto._onMailItemDragEnd = function () {
    // <summary>clear the canvas of the uneditable div when a mail message dragging finishes</summary>
    this._maskElement.style.display = "none";
};

mailCanvasProto._createEmptyLine = function () {
    /// <summary>Creates an HTMLElement representing an empty line.</summary>
    var div = this.getDocument().createElement("div");
    div.classList.add("defaultFont");
    div.setAttribute("style", this._fontStyle);
    div.innerHTML = "<br>";
    return div;
};

mailCanvasProto._getSignatureHtml = function () {
    /// <summary>Returns signature html using the current account.</summary>
    /// <returns type="String">Signature html.</returns>
    ModernCanvas.mark("MailModernCanvas.getSignatureHtml", ModernCanvas.LogEvent.start);
    var signatureHtml = "<br>";
    if (this._mailAccount) {
        // Fetch the signature for the current mail account.
        var accountMailResource = /*@static_cast(Microsoft.WindowsLive.Platform.IAccountMailResource)*/this._mailAccount.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.mail);
        if (accountMailResource.signatureType === Microsoft.WindowsLive.Platform.SignatureType.enabled) {
            signatureHtml = accountMailResource.signatureText || "";
            // If there is a signature
            if (signatureHtml) {
                // Convert the text signature to its HTML equivalent
                this._bufferArea.innerText = signatureHtml;
                signatureHtml = this._bufferArea.innerHTML;
                // Add new lines before and after the signature
                signatureHtml = '<div class="defaultFont" style="' + this._fontStyle + '"><br></div><div class="defaultFont" style="' + this._fontStyle + '">' + signatureHtml + '</div><div class="defaultFont" style="' + this._fontStyle + '"><br></div>';
            }
        }
    }
    ModernCanvas.mark("MailModernCanvas.getSignatureHtml", ModernCanvas.LogEvent.stop);
    return signatureHtml;
};

mailCanvasProto._localizeHTML = function (bufferArea) {
    /// <summary>Modifies HTML in the element to properly display inside this Modern Canvas.</summary>
    /// <param name="bufferArea" type="HTMLElement">The HTML element containing the style elements to localize.</param>
    ModernCanvas.mark("MailModernCanvas.localizeHTML", ModernCanvas.LogEvent.start);

    // Call the base version of this function
    ModernCanvas.ModernCanvasBase.prototype._localizeHTML.call(this, bufferArea);

    // Strip all but the top-most signature marker
    var oldSignatureElements = bufferArea.querySelectorAll("[data-signatureblock]"),
        m,
        len;
    for (m = 1, len = oldSignatureElements.length; m < len; m++) {
        oldSignatureElements[m].removeAttribute("data-signatureblock");
    }

    ModernCanvas.mark("MailModernCanvas.localizeHTML", ModernCanvas.LogEvent.stop);
};

mailCanvasProto._commandToInstrumentationPoint = {
    bold: 1,
    italic: 2,
    underline: 3,
    // Value for 4 is Font Size/Style
    setFontFamily: 4,
    setFontSize: 4,
    setFontColor: 5,
    setFontHighlightColor: 6,
    // Value for 7 is Align
    alignLeft: 7,
    alignCenter: 7,
    alignRight: 7,
    // Value for 8 (Emoticon) is in mail\util\Instrumentation.js
    bullets: 9,
    numbers: 10,
    showHyperlinkControl: 11,
    redo: 12,
    undo: 13,
    clearFormatting: 14,
    copy: 15,
    // Value for 16 is Paste
    paste: 16,
    pasteContentOnly: 16,
    pasteFull: 16,
    pasteTextOnly: 16,
    pasteTextOrSingleImage: 16
    // Value for 17 (Save Draft) is in mail\util\Instrumentation.js
};

mailCanvasProto._onAfterCommand = function (e) {
    /// <summary>Handles the aftercommand event.</summary>
    Debug.assert(Jx.isNonEmptyString(e.command));

    var command = this._commandToInstrumentationPoint[e.command];
    if (command) {
        // To avoid having the ShortcutManager take a dependency on Mail, it sets the e.keyDownEvent property on keyboard shortcuts.
        var uiEntryPoint = e.keyDownEvent ? Mail.Instrumentation.UIEntryPoint.keyboardShortcut : Mail.Instrumentation.UIEntryPoint.appBar;
        Mail.Instrumentation.instrumentFormattingCommand(command, uiEntryPoint);
    }
};

mailCanvasProto._onPaste = function (e) {
    /// <summary>Handles the paste event.</summary>

    var files = window.clipboardData.files;
    for (var i = 0, len = files.length; i < len; i++) {
        var file = files[i],
            // We need to detach the IRandomAccessStream from the file, but that has the side-effect of closing the file. So, 
            // we make a shallow copy of the file just for this purpose.
            copy = file.slice(),
            url = URL.createObjectURL(file, { oneTimeOnly: false });

        // Save the url to the list of known objects to get cleaned up on dispose
        this._objectUrls.push(url);

        // TODO: Remove this workaround when WinBlue:231742 is fixed. For now, we need to keep a strong reference to each file 
        // or else the image stream gets closed prematurely.
        this._pastedFiles.push(file);
        this._pastedFiles.push(copy);

        // No HTML has been pasted at this point. So tell IE that when it pastes the HTML from the clipboard, it should 
        // convert any reference to this file to point to the URL we created instead. That way we have a stable and 
        // valid URL for the image without needing to go back and change it later after paste.
        e.msConvertURL(file, "specified", url);

        // Start saving the file stream as an embedded attachment.
        this._onPasteImage(file, url, copy.msDetachStream());
    }
};

mailCanvasProto._onPasteImage = function (imageBlob, imageBlobUrl, imageBlobStream) {
    /// <summary>Fires all onPasteImage listeners.</summary>
    /// <param name="imageBlob" type="Blob">The blob for the pasted image.</param>
    /// <param name="imageBlobUrl" type="String">The url used in the pasted image to point to the blob.</param>
    /// <param name="imageBlobStream" type="Windows.Storage.Streams.IRandomAccessStream">The random access stream used to power the blob.</param>
    var that = this,
        myArguments = arguments;
    this._attachmentsBeingAdded++;

    // Save a copy of the stream so its available if the user copies the image from the canvas later.
    this._srcToStreamTable[imageBlobUrl] = imageBlobStream;

    this._convertToEncodedStreamAsync(imageBlob, imageBlobUrl, imageBlobStream)
        .then(function (encodedStream) {
            /// <param name="encodedStream" type="Object">An object containing a random access stream of encoded image data and its content type.</param>
            return that._createEmbeddedAttachmentAsync(encodedStream.stream, encodedStream.contentType);
        })
        .then(function (attachment) {
            // Allow onPasteImage to continue
            that._urlToCidUrl[imageBlobUrl] = "cid:" + attachment.contentId;
            ModernCanvas.ModernCanvasBase.prototype._onPasteImage.apply(that, myArguments);
            that._attachmentsBeingAdded--;
            that._fireContentReadyIfReady();
        })
        .done(null, function (error) {
            that._attachmentsBeingAdded--;
            that._fireContentReadyIfReady();
            Debug.assert(false, "Error while creating image attachment: " + error);
            that._logFunction("Error while creating image attachment: " + error);
        });
};

mailCanvasProto._convertToEncodedStreamAsync = function (imageBlob, imageBlobUrl, imageBlobStream) {
    /// <summary>Converts the given image blob to an encoded stream if necessary.</summary>
    /// <param name="imageBlob" type="Blob">The blob for the image.</param>
    /// <param name="imageBlobUrl" type="String">The image url that points to the blob.</param>
    /// <param name="imageBlobStream" type="Windows.Storage.Streams.IRandomAccessStream">The random access stream used to power the blob.</param>
    if (imageBlob.type === "image/gif" || imageBlob.type === "image/jpeg" || imageBlob.type === "image/pjpeg" ||
        imageBlob.type === "image/png" || imageBlob.type === "image/x-png") {
        // Stream is already encoded in a widely-available format.
        return WinJS.Promise.as({
            contentType: imageBlob.type,
            stream: imageBlobStream
        });
    } else {
        return this._convertToPngStreamAsync(imageBlob, imageBlobUrl, imageBlobStream);
    }
};

mailCanvasProto._convertToPngStreamAsync = function (imageBlob, imageBlobUrl, imageBlobStream) {
    /// <summary>Converts the given image blob to a PNG stream.</summary>
    /// <param name="imageBlob" type="Blob">The blob for the image.</param>
    /// <param name="imageBlobUrl" type="String">The image url that points to the blob.</param>
    /// <param name="imageBlobStream" type="Windows.Storage.Streams.IRandomAccessStream">The random access stream used to power the blob.</param>
    if (imageBlob.type === "image/bmp" || imageBlob.type === "image/tiff") {
        var outputStream = new Windows.Storage.Streams.InMemoryRandomAccessStream(),
            decoder,
            encoder;
        return Windows.Graphics.Imaging.BitmapDecoder.createAsync(imageBlobStream)
            .then(function (myDecoder) {
                /// <param name="myDecoder" type="Windows.Graphics.Imaging.BitmapDecoder">The bitmap decoder to read the original stream.</param>
                decoder = myDecoder;
                return Windows.Graphics.Imaging.BitmapEncoder.createAsync(Windows.Graphics.Imaging.BitmapEncoder.pngEncoderId, outputStream);
            })
            .then(function (myEncoder) {
                /// <param name="myEncoder" type="Windows.Graphics.Imaging.BitmapEncoder">The bitmap encoder to write out the new png stream.</param>
                encoder = myEncoder;
                return decoder.getPixelDataAsync();
            })
            .then(function (pixelDataProvider) {
                /// <param name="pixelDataProvider" type="Windows.Graphics.Imaging.PixelDataProvider">The data provider holding the pixel array for the incoming stream from the decoder.</param>
                encoder.setPixelData(decoder.bitmapPixelFormat, decoder.bitmapAlphaMode, decoder.pixelWidth, decoder.pixelHeight, decoder.dpiX, decoder.dpiY, pixelDataProvider.detachPixelData());
                return encoder.flushAsync();
            })
            .then(function () {
                return {
                    contentType: "image/png",
                    stream: outputStream
                };
            });
    } else {
        // We don't have a decoder available, so we fall back a method involving the use of <canvas>, which should work for any 
        // image type IE can render. The list of known IE mime types is available at 
        // http://msdn.microsoft.com/en-us/library/ms775147%28v=vs.85%29.aspx
        Debug.assert(imageBlob.type === "image/x-emf" || imageBlob.type === "image/x-wmf" || imageBlob.type === "image/x-jg" || imageBlob.type === "undefined");
        return this._waitForImageLoadAsync(imageBlobUrl)
            .then(function (imgElement) {
                /// <param name="imgElement" type="HTMLElement">The image element that is rendering the imageBlob.</param>
                var canvas = /*@static_cast(HTMLCanvasElement)*/document.createElement("canvas"),
                    width = canvas.width = imgElement.offsetWidth,
                    height = canvas.height = imgElement.offsetHeight;
                // Draw the image to a canvas element in order to get a PNG stream, because there is no EMF decoder available.
                var context = canvas.getContext("2d");
                context.drawImage(imgElement, 0, 0, width, height);
                var pngBlob = canvas.msToBlob();
                Debug.assert(pngBlob.type === "image/png");
                return {
                    contentType: "image/png",
                    stream: pngBlob.msDetachStream()
                };
            });
    }
};

mailCanvasProto._waitForImageLoadAsync = function (imageUrl) {
    /// <summary>Returns a Promise that completes when the specified image is finished loading.</summary>
    Debug.assert(Jx.isNonEmptyString(imageUrl), "Expected valid image url");

    var doc = this.getDocument();
    return new WinJS.Promise(function (complete, error) {
        var imgSelector = "img[src='" + imageUrl + "']",
            imgElement = doc.querySelector(imgSelector),
            onImageLoad = function (e) {
                imgElement.removeEventListener("load", onImageLoad, false);
                imgElement.removeEventListener("error", onImageLoad, false);
                if (e.type === "error") {
                    error(new Error("Image load failed"));
                } else {
                    complete(imgElement);
                }
            },
            onImageFound = function () {
                if (imgElement.complete) {
                    complete(imgElement);
                } else {
                    imgElement.addEventListener("load", onImageLoad, false);
                    imgElement.addEventListener("error", onImageLoad, false);
                }
            };

        if (!imgElement) {
            // The image might not have been created in the DOM yet, so try again soon.
            setImmediate(function () {
                imgElement = doc.querySelector(imgSelector);
                if (!imgElement) {
                    error(new Error("Couldn't find image with src " + imageUrl));
                } else {
                    onImageFound();
                }
            });
        } else {
            onImageFound();
        }
    });
};

mailCanvasProto._createEmbeddedAttachmentAsync = function (stream, contentType) {
    /// <summary>Creates and returns an embedded attachment.</summary>
    /// <param name="stream" type="Windows.Storage.Streams.IRandomAccessStream">The backing stream for the embedded attachment.</param>
    /// <param name="contentType" type="String">The type of the stream.</param>
    Debug.assert(!Jx.isNullOrUndefined(stream), "Expected valid stream");
    Debug.assert(Jx.isNonEmptyString(contentType) && contentType.indexOf("image/") === 0, "Unexpected content type. Expected image.");

    // Use a unique number to avoid naming collisions.
    var uniqueString = Jx.uid().toString(10),
        fileName = "Image" + uniqueString + this._getFileExtensionForImageContentType(contentType);
    return ModernCanvas.Mail.createAttachmentAsync(this._mailMessage, Microsoft.WindowsLive.Platform.AttachmentUIType.embedded, stream, contentType, fileName);
};

mailCanvasProto._getFileExtensionForImageContentType = function (contentType) {
    /// <summary>Returns a normalized file extension for the given GIF, JPG or PNG content type.</summary>
    /// <param name="contentType" type="String">A GIF, JPG or PNG content type.</param>
    Debug.assert(Jx.isNonEmptyString(contentType) && contentType.indexOf("image/") === 0, "Expected image content type");
    Debug.assert(Jx.isNonEmptyString(this._contentTypeToFileExtensionMap[contentType]), "Unknown content type: " + contentType);

    // We transcode all unknown image types to PNG, so if we can't find a file extension for the given content type, just use .png.
    return this._contentTypeToFileExtensionMap[contentType] || ".png";
};

mailCanvasProto._contentTypeToFileExtensionMap = {
    "image/gif":   ".gif",
    "image/jpeg":  ".jpg",
    "image/pjpeg": ".jpg",
    "image/png":   ".png",
    "image/x-png": ".png",
};

mailCanvasProto._updateSignature = function () {
    /// <summary>Updates signature using the current account.</summary>
    var signatureElement = this._body.querySelector("[data-signatureblock]");
    // If user deleted the signature block, then we won't find it
    if (Boolean(signatureElement)) {
        // Changing the DOM would make the cue text disappear, so disable the listener
        if (this._cueText) {
            this.removeEventListener("DOMNodeInserted", this._showHideCueText, false);
        }

        // Set the signature text
        signatureElement.innerHTML = this._getSignatureHtml();

        // Re-enable the listener
        if (this._cueText) {
            this.addEventListener("DOMNodeInserted", this._showHideCueText, false);
        }
    }
};

mailCanvasProto._setFontStyle = function() {
    // Prepare the font tag for default font. Use /"/g to replace all " with ' to keep from escaping the attributes unintentionally
    var appSettings = Mail.Globals.appSettings,
        style = '';
        
    style += (Boolean(appSettings.composeFontSize)) ? 'font-size: ' + appSettings.composeFontSize.replace(/"/g,"'") + ';' : "";
    style += (Boolean(appSettings.composeFontColor)) ? 'color: ' + appSettings.composeFontColor.replace(/"/g,"'") + ';' : "";
    style += (Boolean(appSettings.composeFontFamily)) ? 'font-family: ' + appSettings.composeFontFamily.replace(/"/g,"'") + ';' : "";
 
    this._fontStyle = style;
};

mailCanvasProto.activate = function (signatureLocation) {
    /// <summary>Completes activation of the Modern Canvas.  Only needed if the delayActivation option was used at construction time.</summary>
    /// <param name="signatureLocation" type="ModernCanvas.SignatureLocation" optional="true">The relative location of where to add the signature. If not provided, signature is not inserted.</param>
    ModernCanvas.mark("MailModernCanvas.activate", ModernCanvas.LogEvent.start);
    Debug.assert(Boolean(this._mailMessage), "Mail Modern Canvas requires a mailMessage object to be set before activating.");

    if (!this._activated) {
        // Update the font tag
        this._setFontStyle();

        // Check if we need to insert a signature and insert it if necessary
        this.insertSignatureIfNecessary(signatureLocation || ModernCanvas.SignatureLocation.end);

        // First let the actual activate happen
        ModernCanvas.ModernCanvasBase.prototype.activate.apply(this, arguments);

        this.addEventListener("paste", this._onPaste, false);
        if (window.Mail && !window.Share) {
            // We don't want this behavior in Share To Mail
            this.addListener("aftercommand", this._onAfterCommand, this);
        }
    }
    ModernCanvas.mark("MailModernCanvas.activate", ModernCanvas.LogEvent.stop);
};

mailCanvasProto.deactivate = function () {
    /// <summary>Deactivates the Modern Canvas.  Only necessary if the Modern Canvas became active.</summary>
    ModernCanvas.mark("MailModernCanvas.deactivate", ModernCanvas.LogEvent.start);

    if (this._activated) {
        // First let the actual deactivate happen
        ModernCanvas.ModernCanvasBase.prototype.deactivate.apply(this, arguments);

        // Remove event listeners
        this.removeEventListener("paste", this._onPaste, false);
        if (window.Mail && !window.Share) {
            // We don't want this behavior in Share To Mail
            this.removeListener("aftercommand", this._onAfterCommand, this);
        }

        // Reset member variables
        this._attachmentsBeingAdded = 0;
        this._pastedFiles = [];
        this._signatureLocation = null;
        this._urlToCidUrl = {};
    }
    
    ModernCanvas.mark("MailModernCanvas.deactivate", ModernCanvas.LogEvent.stop);
};

mailCanvasProto._delocalizeHTML = function (inputElement, contentDestination) {
    /// <summary>Reverses the effects of the _localizeHTML function.</summary>
    /// <param name="inputElement" type="HTMLElement">Element to localize.</param>
    /// <param name="contentDestination" type="ModernCanvas.ContentDestination">The destination of the content.</param>
    /// <returns type="HTMLElement">The delocalized HTML fragment.</returns>
    ModernCanvas.mark("MailModernCanvas.delocalizeHTML", ModernCanvas.LogEvent.start);

    inputElement = ModernCanvas.WindowsLive.ModernCanvas.prototype._delocalizeHTML.apply(this, arguments);

    if (contentDestination !== ModernCanvas.ContentDestination.clipboard) {
        // Convert each <img> src attribute to its appropriate cid: URL.
        var attachments = this._mailMessage.getEmbeddedAttachmentCollection();
        attachments.lock();

        // When Mail does a reply/forward scenario or edit draft, it pre-processes all of the <img> src attributes to point to 
        // the attachments' bodyUri, so we need to reverse this and put them back as cid: URLs.
        for (var i = attachments.count; i--;) {
            var attachment = attachments.item(i),
                bodyUriSelector = "img[src='" + attachment.bodyUri + "']",
                bodyUriImgs = inputElement.querySelectorAll(bodyUriSelector);
            for (var j = bodyUriImgs.length; j--;) {
                bodyUriImgs[j].src = ModernCanvas.Mail._getCidUrl(attachment);
            }
        }

        // Any pasted images will be stored in our _urlToCidUrl map.
        var urlToCid = this._urlToCidUrl;
        Object.keys(urlToCid).forEach(function (url) {
            var pastedImgSelector = "img[src='" + url + "']",
                pastedImgs = inputElement.querySelectorAll(pastedImgSelector);
            for (var m = pastedImgs.length; m--;) {
                pastedImgs[m].src = urlToCid[url];
            }
        });
    }
    
    if (contentDestination === ModernCanvas.ContentDestination.external) {
        // Remove the defaultFont class from font tags before we send a message
        var defaultFontTags = inputElement.querySelectorAll(".defaultFont"),
            tempTag;
        for(var d = defaultFontTags.length; d--;) {
            tempTag = defaultFontTags[d];
            if(this.isNodeName(tempTag, "DIV")) {
                tempTag.classList.remove("defaultFont");
            }
        }
    }

    ModernCanvas.mark("MailModernCanvas.delocalizeHTML", ModernCanvas.LogEvent.stop);
    return inputElement;
};

mailCanvasProto.finalizeMailMessage = function () {
    /// <summary>Performs any final operations on the mail message.</summary>
    if (this._deleteUnusedEmbeddedAttachments()) {
        this._mailMessage.commit();
    }
};

mailCanvasProto._deleteUnusedEmbeddedAttachments = function () {
    /// <summary>Checks each embedded attachment to see if there is a reference to it in the Modern Canvas and deletes it if there are no references.</summary>
    /// <returns>true if one or more unused embedded attachments were deleted and false otherwise.</returns>
    var imgs = this._body.querySelectorAll("img"),
        contentIdInUse = {};
    for (var i = 0; i < imgs.length; i++) {
        // Any pasted images will be stored in our _urlToCidUrl map.
        var cid = this._urlToCidUrl[imgs[i].src];
        if (cid) {
            contentIdInUse[cid] = true;
        }
    }

    var attachments = this._mailMessage.getEmbeddedAttachmentCollection(),
        attachmentDeleted = false;
    attachments.lock();
    for (i = attachments.count; i--;) {
        var attachment = attachments.item(i),
            // When Mail does a reply/forward scenario or edit draft, it pre-processes all of the <img> src attributes to point to 
            // the attachments' bodyUri, so check if the attachment is referenced by a bodyUri too.
            bodyUriSelector = "img[src='" + attachment.bodyUri + "']",
            bodyUriInUse = Boolean(this._body.querySelector(bodyUriSelector));

        if (!bodyUriInUse && !contentIdInUse[ModernCanvas.Mail._getCidUrl(attachment)]) {
            attachment.deleteObject();
            attachmentDeleted = true;
        }
    }

    return attachmentDeleted;
};

mailCanvasProto.insertSignatureIfNecessary = function (signatureLocation) {
    /// <summary>Inserts signature using the current account.</summary>
    /// <param name="signatureLocation" type="ModernCanvas.SignatureLocation" mayBeNull="true">The relative location of where to add the signature. If not provided, signature is not inserted.</param>
    ModernCanvas.mark("MailModernCanvas.insertSignatureIfNecessary", ModernCanvas.LogEvent.start);
    this._signatureLocation = signatureLocation;
    if (Boolean(signatureLocation) && signatureLocation !== ModernCanvas.SignatureLocation.none && !Jx.isNullOrUndefined(this._mailAccount)) {
        var signatureHtml = this._getSignatureHtml(),
            insertLocation;

        // Wrap the insertion in a div so we can know where it should go
        signatureHtml = '<div data-signatureblock="true" class="defaultFont" style="' + this._fontStyle + '">' + signatureHtml + '</div>';

        // If inserting at the start
        if (signatureLocation === ModernCanvas.SignatureLocation.start) {
            // Mark the insertion location
            insertLocation = ModernCanvas.ContentLocation.start;

            // Add an extra new line at the beginning
            signatureHtml = '<div class="defaultFont" style="' + this._fontStyle + '"><br></div>' + signatureHtml;
        } else {
            // If inserting at the end, mark the insertion location
            insertLocation = ModernCanvas.ContentLocation.end;
        }

        // Insert the signature
        Debug.assert(signatureHtml);
        Debug.assert(signatureHtml.length > 0);
        ModernCanvas.WindowsLive.ModernCanvas.prototype.addContent.call(this, signatureHtml, ModernCanvas.ContentFormat.htmlString, insertLocation);
    }
    ModernCanvas.mark("MailModernCanvas.insertSignatureIfNecessary", ModernCanvas.LogEvent.stop);
};

mailCanvasProto.wrapTextContent = function (content) {
    /// <summary>Overrideable function to wrap the incoming text content</summary>
    Debug.assert(Jx.isString(content));

    if (content.length > 0) {
        return '<div class="defaultFont" style="' + this._fontStyle + '">' + content + '<br></div>';
    } else {
        return content;
    }
};

mailCanvasProto.isContentReady = function () {
    /// <summary>Determines if the content is ready to be fetched/added to (i.e. is not in the middle of being modified programatically.
    /// If the content is fetched/added to when this value is false the results may not be as intended.</summary>
    /// <returns type="Boolean">True if the content is not being modified, false if it is being modified.</returns>
    return this._attachmentsBeingAdded === 0 && ModernCanvas.ModernCanvasBase.prototype.isContentReady.call(this);
};

mailCanvasProto.setMailAccount = function (mailAccount) {
    /// <summary>Sets the MailAccount object that the Mail Modern Canvas assossiates with the signature.</summary>
    /// <param name="mailAccount" type="Microsoft.WindowsLive.Platform.IAccount">The Account object to use.</param>
    this._mailAccount = mailAccount;
    this._updateSignature();
};

mailCanvasProto.setMailMessage = function (mailMessage) {
    /// <summary>Sets the MailMessage object that the Mail Modern Canvas assossiates with embedded attachments.</summary>
    /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The MailMessage object.</param>
    this._mailMessage = mailMessage;
};

ModernCanvas.ModernCanvas = ModernCanvas.Mail.ModernCanvas;

})();

//
// Copyright (C) Microsoft. All rights reserved.
//

    Jx.delayGroupExec("CanvasPlugins");
    Jx.delayGroupExec("CanvasAutoReplaceDef");
});
