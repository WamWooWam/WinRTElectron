//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(global) {"use strict";
    var util = AppMagic.Utility,
        HtmlViewer = WinJS.Class.define(function HtmlViewer_ctor(){}, {
            initView: function(container, controlContext) {
                var htmlViewerElement = container.children[0];
                var id = util.generateRandomId("htmlViewerElement");
                util.createOrSetPrivate(controlContext, "_id", id);
                controlContext.htmlViewerElement = htmlViewerElement;
                var iframeElements = htmlViewerElement.getElementsByClassName("appmagic-htmlviewer-iframe");
                var iframeElement = iframeElements[0];
                controlContext.iframeElement = iframeElement;
                controlContext.clickOnBodyHandler = null;
                controlContext.onLoadHandler = this._onLoad.bind(this, controlContext);
                controlContext.iframeElement.addEventListener("load", controlContext.onLoadHandler);
                util.createOrSetPrivate(controlContext, "Fill", ko.computed(function() {
                    return controlContext.viewState.disabled() ? controlContext.properties.DisabledFill() : controlContext.properties.Fill()
                }, this));
                ko.applyBindings(controlContext, container)
            }, _onLoad: function(controlContext) {
                    this._renderText(controlContext.properties.HtmlText(), controlContext)
                }, _onClick: function(evt) {
                    this.behaviors.OnSelect();
                    var bubbleUpEvent = document.createEvent("HTMLEvents");
                    bubbleUpEvent.initEvent("click", !0, !0);
                    this.htmlViewerElement.dispatchEvent(bubbleUpEvent)
                }, _onMouseDown: function(evt) {
                    var bubbleUpEvent = document.createEvent("HTMLEvents");
                    bubbleUpEvent.initEvent("mousedown", !0, !0);
                    this.htmlViewerElement.dispatchEvent(bubbleUpEvent)
                }, _onMouseUp: function(evt) {
                    var bubbleUpEvent = document.createEvent("HTMLEvents");
                    bubbleUpEvent.initEvent("mouseup", !0, !0);
                    bubbleUpEvent.button = evt.button;
                    this.htmlViewerElement.dispatchEvent(bubbleUpEvent)
                }, _onKeyDown: function(evt) {
                    var bubbleUpEvent = document.createEvent("HTMLEvents");
                    bubbleUpEvent.initEvent("keydown", !0, !0);
                    bubbleUpEvent.key = evt.key;
                    this.htmlViewerElement.dispatchEvent(bubbleUpEvent)
                }, disposeView: function(container, controlContext) {
                    if (controlContext.iframeElement.removeEventListener("load", controlContext.onLoadHandler), controlContext.iframeElement.contentWindow) {
                        var iframeBody = controlContext.iframeElement.contentWindow.document.body,
                            allLinkTags = iframeBody.querySelectorAll("a");
                        this._removeEventListenersFromLinks(allLinkTags);
                        this._removeEventListenersFromBody(iframeBody, controlContext)
                    }
                    controlContext.Fill.dispose();
                    controlContext.htmlViewerElement = null;
                    controlContext.iframeElement = null
                }, onChangeHtmlText: function(evt, controlContext) {
                    evt.newValue !== evt.oldValue && this._renderText(evt.newValue, controlContext)
                }, onChangeColor: function(evt, controlContext) {
                    this._renderOnPropertyUpdate(evt, controlContext)
                }, onChangeSize: function(evt, controlContext) {
                    this._renderOnPropertyUpdate(evt, controlContext)
                }, onChangeFont: function(evt, controlContext) {
                    this._renderOnPropertyUpdate(evt, controlContext)
                }, onChangeTooltip: function(evt, controlContext) {
                    this._renderOnPropertyUpdate(evt, controlContext)
                }, _renderOnPropertyUpdate: function(evt, controlContext) {
                    controlContext.realized && evt.newValue !== evt.oldValue && this._renderText(controlContext.properties.HtmlText(), controlContext)
                }, _renderText: function(input, controlContext) {
                    if (controlContext.realized) {
                        input === null && (input = "");
                        var htmlViewerElement = controlContext.htmlViewerElement,
                            iframeElement = controlContext.iframeElement;
                        var allLinkTags = iframeElement.contentWindow.document.body.querySelectorAll("a"),
                            iframeBody = iframeElement.contentWindow.document.body;
                        this._removeEventListenersFromLinks(allLinkTags);
                        this._removeEventListenersFromBody(iframeElement.contentWindow, controlContext);
                        var inputElement = document.createElement("div"),
                            tags = "iframe",
                            safeHTML = AppMagic.Functions.getSafeHTML(input, !0);
                        inputElement.innerHTML = this._removeTags(safeHTML, tags);
                        inputElement.style.fontSize = AppMagic.Services.stripHtml(controlContext.properties.Size());
                        inputElement.style.fontFamily = AppMagic.Services.stripHtml(controlContext.properties.Font());
                        inputElement.style.color = AppMagic.Services.stripHtml(controlContext.properties.Color());
                        inputElement.title = AppMagic.Services.stripHtml(controlContext.properties.Tooltip());
                        try {
                            WinJS.Utilities.setInnerHTMLUnsafe(iframeBody, inputElement.outerHTML)
                        }
                        catch(ex) {}
                        allLinkTags = iframeBody.querySelectorAll("a");
                        this._addEventListenerToBody(iframeElement.contentWindow, controlContext);
                        this._addEventListenerToLinks(allLinkTags)
                    }
                }, _removeTags: function(inputElement, tags) {
                    var safeDiv = document.createElement("div");
                    safeDiv.innerHTML = inputElement;
                    for (var elements = safeDiv.querySelectorAll(tags), i = 0; i < elements.length; i++)
                        elements[i].parentNode.removeChild(elements[i]);
                    return safeDiv.innerHTML
                }, _addEventListenerToBody: function(iframeBody, controlContext) {
                    controlContext.clickOnBodyHandler = this._onClick.bind(controlContext);
                    controlContext.mouseDownBodyHandler = this._onMouseDown.bind(controlContext);
                    controlContext.mouseUpBodyHandler = this._onMouseUp.bind(controlContext);
                    controlContext.keydownOnBodyHandler = this._onKeyDown.bind(controlContext);
                    iframeBody && (iframeBody.addEventListener("click", controlContext.clickOnBodyHandler), iframeBody.addEventListener("mousedown", controlContext.mouseDownBodyHandler), iframeBody.addEventListener("mouseup", controlContext.mouseUpBodyHandler), iframeBody.addEventListener("keydown", controlContext.keydownOnBodyHandler))
                }, _removeEventListenersFromBody: function(iframeBody, controlContext) {
                    iframeBody && controlContext.clickOnBodyHandler && controlContext.mouseDownBodyHandler && controlContext.keydownOnBodyHandler && (iframeBody.removeEventListener("click", controlContext.clickOnBodyHandler), iframeBody.removeEventListener("mousedown", controlContext.mouseDownBodyHandler), iframeBody.removeEventListener("mouseup", controlContext.mouseUpBodyHandler), iframeBody.removeEventListener("keydown", controlContext.keydownOnBodyHandler))
                }, _addEventListenerToLinks: function(allLinkTags) {
                    for (var i = 0; i < allLinkTags.length; i++)
                        allLinkTags[i].href.substring(0, "ms-appx".length) !== "ms-appx" ? allLinkTags[i].addEventListener("click", this._launchLink) : allLinkTags[i].removeAttribute("href")
                }, _removeEventListenersFromLinks: function(allLinkTags) {
                    for (var i = 0; i < allLinkTags.length; i++)
                        allLinkTags[i].href.substring(0, "ms-appx".length) !== "ms-appx" && allLinkTags[i].removeEventListener("click", this._launchLink)
                }, _launchLink: function(evt) {
                    if (evt && evt.target) {
                        for (var baseNode = evt.target; baseNode.nodeName !== "A"; )
                            baseNode = baseNode.parentNode;
                        baseNode.href && AppMagic.Functions.launch(baseNode.href);
                        evt.stopPropagation()
                    }
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {HtmlViewer: HtmlViewer})
})(this);