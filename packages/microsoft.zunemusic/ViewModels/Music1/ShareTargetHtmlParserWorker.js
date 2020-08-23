/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Share;
            (function(Share) {
                var HTMLParserWorker = (function() {
                        function HTMLParserWorker() {
                            addEventListener("message", this._onMessage.bind(this))
                        }
                        Object.defineProperty(HTMLParserWorker.prototype, "currentFrame", {
                            get: function() {
                                return this._tagTree && this._tagTree.length && this._tagTree[this._tagTree.length - 1]
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(HTMLParserWorker.prototype, "currentTag", {
                            get: function() {
                                var frame = this.currentFrame;
                                return frame && frame.length && frame[frame.length - 1]
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(HTMLParserWorker.prototype, "currentPath", {
                            get: function() {
                                var frame = this.currentFrame || [""];
                                return frame.join("/")
                            }, enumerable: true, configurable: true
                        });
                        HTMLParserWorker.prototype._onMessage = function(args) {
                            var detail = (args && args.data);
                            var parsedDetail = null;
                            try {
                                parsedDetail = JSON.parse(detail)
                            }
                            catch(error) {
                                parsedDetail = null
                            }
                            if (parsedDetail && parsedDetail.type === "html")
                                this._postMessage(this._parse(parsedDetail.data))
                        };
                        HTMLParserWorker.prototype._postMessage = function(result) {
                            postMessage(JSON.stringify({
                                type: "result", data: result
                            }), null)
                        };
                        HTMLParserWorker.prototype._parse = function(html) {
                            var char = null;
                            var charNext = null;
                            var htmlLength = html.length;
                            var i = 0;
                            this._outputText = [];
                            this._stringOffsets = [];
                            this._tagTree = [];
                            this._position = 0;
                            this._html = html;
                            this._stringMap = {};
                            this._htmlLowerCase = html && html.toLowerCase();
                            this._tagMap = {};
                            try {
                                while (this._position < htmlLength)
                                    if (this._atToken("<"))
                                        if (this._atToken("/", 1))
                                            this._handleCloseTag();
                                        else if (this._atToken("!", 1))
                                            if (this._atToken("--", 2))
                                                this._handleComment();
                                            else if (this._atToken("[cdata[", 2))
                                                this._handleCData();
                                            else if (this._atToken("doctype", 2))
                                                this._handleDocType();
                                            else if (this._atToken("[if", 2))
                                                this._handleConditional();
                                            else
                                                this._handleOpenTag();
                                        else
                                            this._handleOpenTag();
                                    else
                                        this._handleInnerText()
                            }
                            catch(e) {
                                this._outputText = []
                            }
                            return {
                                    strings: this._outputText, stringOffsets: this._stringOffsets, stringMap: this._stringMap, tagMap: this._tagMap
                                }
                        };
                        HTMLParserWorker.prototype._atToken = function(token, skipCount) {
                            var html = this._htmlLowerCase;
                            var atToken = true;
                            skipCount = skipCount || 0;
                            for (var i = this._position + skipCount, j = 0; j < token.length; i++, j++)
                                if (html[i] !== token[j]) {
                                    atToken = false;
                                    break
                                }
                            return atToken
                        };
                        HTMLParserWorker.prototype._handleOpenTag = function() {
                            var start = this._position;
                            var end = this._htmlLowerCase.indexOf(">", start);
                            var checkStart = this._htmlLowerCase.lastIndexOf("<", end);
                            if (checkStart >= 0 && checkStart !== start)
                                end = checkStart - 1;
                            if (end < start)
                                end = this._htmlLowerCase.length;
                            var tag = null;
                            var tagStart = start + 1;
                            var tagEnd = end - 1;
                            var tagSelfClosed = false;
                            var currentFrame;
                            if (this._htmlLowerCase[tagEnd] === "/") {
                                tagSelfClosed = true;
                                tagEnd--
                            }
                            if (tagEnd >= tagStart) {
                                tag = this._htmlLowerCase.substring(tagStart, tagEnd + 1);
                                tag = tag.split(/\s/, 1)[0]
                            }
                            tag = tag || "";
                            if (this._tagTree.length === 0 || this._isDocumentTag(tag))
                                this._tagTree.push([tag]);
                            else if (!tagSelfClosed && this._ignoreTagContent(tag)) {
                                var closeTag = "</" + tag + ">";
                                var openTag = tag ? ("<" + tag) : ("<>");
                                var ignoreEnd = this._htmlLowerCase.indexOf(closeTag, end);
                                var checkStartTag = -1;
                                do
                                    checkStartTag = this._htmlLowerCase.lastIndexOf(openTag, ignoreEnd);
                                while (checkStartTag > start && !this._isPositionWhiteSpaceOrTagClose(checkStartTag + openTag.length));
                                if (ignoreEnd > end && checkStartTag === start)
                                    end = ignoreEnd + (closeTag.length - 1)
                            }
                            else if (this._tagTree.length) {
                                currentFrame = this.currentFrame;
                                currentFrame.push(tag);
                                if (this._isSingleTag(tag)) {
                                    this._logOpenTag();
                                    currentFrame.pop()
                                }
                                else if (tagSelfClosed)
                                    currentFrame.pop()
                            }
                            this._position += (end - start) + 1
                        };
                        HTMLParserWorker.prototype._handleCloseTag = function() {
                            var start = this._position;
                            var end = this._htmlLowerCase.indexOf(">", start);
                            var checkStart = this._htmlLowerCase.lastIndexOf("<", end);
                            if (checkStart >= 0 && checkStart !== start)
                                end = checkStart - 1;
                            if (end < start)
                                end = this._htmlLowerCase.length;
                            var currentFrame = this.currentFrame;
                            if (currentFrame) {
                                if (currentFrame.length)
                                    currentFrame.pop();
                                if (currentFrame.length === 0)
                                    this._tagTree.pop()
                            }
                            this._position += (end - start) + 1
                        };
                        HTMLParserWorker.prototype._handleInnerText = function() {
                            var _this = this;
                            var start = this._position;
                            var end = this._htmlLowerCase.indexOf("<", start) - 1;
                            var htmlContent = "";
                            var contents = null;
                            var lowerCaseContent = null;
                            var contentPositions = null;
                            var currentFrame = this.currentFrame;
                            if (end < start)
                                end = this._htmlLowerCase.length;
                            if (currentFrame && currentFrame.length > 1)
                                htmlContent = this._html.substring(start, end + 1);
                            if (htmlContent)
                                htmlContent = htmlContent.replace(/(\s+|&amp;)/ig, function(substring) {
                                    switch (substring) {
                                        case"&amp;":
                                            return "&";
                                        default:
                                            return " "
                                    }
                                });
                            if (htmlContent)
                                htmlContent = htmlContent.trim();
                            if (htmlContent)
                                contents = htmlContent.split(/ &quot;|&quot; |:: |: |; |- | -|\u2013 | \u2013|~ | ~|\| | \|/g);
                            if (contents)
                                contents.forEach(function(content, index, source) {
                                    if (content)
                                        content = content.trim();
                                    if (content && content.length > 1) {
                                        _this._logOpenTag();
                                        _this._outputText.push(content);
                                        _this._stringOffsets.push((_this._stringOffsets.length ? _this._stringOffsets[_this._stringOffsets.length - 1] : 0) + content.length);
                                        lowerCaseContent = content.toLowerCase();
                                        contentPositions = _this._stringMap[lowerCaseContent];
                                        if (!contentPositions)
                                            contentPositions = _this._stringMap[lowerCaseContent] = [];
                                        contentPositions.push(_this._outputText.length - 1)
                                    }
                                });
                            this._position += (end - start) + 1
                        };
                        HTMLParserWorker.prototype._handleCData = function() {
                            var start = this._position;
                            var end = this._htmlLowerCase.indexOf("]]>", start);
                            if (end < start)
                                end = this._htmlLowerCase.length;
                            else
                                end += 2;
                            this._position += (end - start) + 1
                        };
                        HTMLParserWorker.prototype._handleConditional = function() {
                            var start = this._position;
                            var end = this._htmlLowerCase.indexOf("<![endif]>", start);
                            if (end < start)
                                end = this._htmlLowerCase.length;
                            else
                                end += 2;
                            this._position += (end - start) + 1
                        };
                        HTMLParserWorker.prototype._handleComment = function() {
                            var start = this._position;
                            var end = this._htmlLowerCase.indexOf("-->", start);
                            var checkStart = this._htmlLowerCase.lastIndexOf("<!--", end);
                            if (checkStart >= 0 && checkStart !== start)
                                end = checkStart - 1;
                            else
                                end += 2;
                            if (end < start)
                                end = this._htmlLowerCase.length;
                            this._position += (end - start) + 1
                        };
                        HTMLParserWorker.prototype._handleDocType = function() {
                            var start = this._position;
                            var end = this._htmlLowerCase.indexOf(">", start);
                            if (end < start)
                                end = this._htmlLowerCase.length;
                            this._position += (end - start) + 1
                        };
                        HTMLParserWorker.prototype._isDocumentTag = function(tagName) {
                            var index = HTMLParserWorker._documentTags.indexOf(tagName);
                            return index >= 0
                        };
                        HTMLParserWorker.prototype._ignoreTagContent = function(tagName) {
                            var index = HTMLParserWorker._ignoreTags.indexOf(tagName);
                            return index >= 0
                        };
                        HTMLParserWorker.prototype._isSingleTag = function(tagName) {
                            var index = HTMLParserWorker._singleTags.indexOf(tagName);
                            return index >= 0
                        };
                        HTMLParserWorker.prototype._logOpenTag = function() {
                            var currentPath = this.currentPath;
                            var entry = this._tagMap[currentPath];
                            if (!entry)
                                entry = this._tagMap[currentPath] = [];
                            entry.push({
                                htmlIndex: this._position, stringsIndex: this._outputText.length
                            })
                        };
                        HTMLParserWorker.prototype._isPositionWhiteSpaceOrTagClose = function(position) {
                            var whiteSpace = false;
                            if (this._htmlLowerCase && position >= 0 && position < this._htmlLowerCase.length)
                                whiteSpace = !!this._htmlLowerCase[position].match(/\s|>/);
                            return whiteSpace
                        };
                        HTMLParserWorker._documentTags = ["iframe"];
                        HTMLParserWorker._singleTags = ["br"];
                        HTMLParserWorker._ignoreTags = ["", "abbr", "address", "area", "aside", "audio", "base", "button", "canvas", "caption", "cite", "code", "command", "data", "datagrid", "datalist", "del", "details", "embed", "fieldset", "figcaption", "figure", "footer", "form", "head", "header", "hr", "img", "input", "legend", "map", "menu", "meta", "meter", "nav", "noscript", "object", "optgroup", "option", "output", "param", "progress", "s", "samp", "script", "select", "source", "style", "time", "title", "track", "var", "video"];
                        return HTMLParserWorker
                    })();
                Share.HTMLParserWorker = HTMLParserWorker;
                var parser = new MS.Entertainment.ViewModels.Share.HTMLParserWorker
            })(Share = ViewModels.Share || (ViewModels.Share = {}))
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
