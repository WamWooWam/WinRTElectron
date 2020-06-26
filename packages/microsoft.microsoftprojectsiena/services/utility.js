//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var processError = function(resp) {
            return resp.status === 0 && resp.readyState === resp.DONE ? AppMagic.Services.Results.createError(AppMagic.Strings.ServiceErrorCannotFindUrl) : resp.status === 403 && resp.readyState === resp.DONE ? AppMagic.Services.Results.createError(AppMagic.Strings.ServiceError403) : resp.status === 404 && resp.readyState === resp.DONE ? AppMagic.Services.Results.createError(AppMagic.Strings.ServiceError404) : AppMagic.Services.Results.createError()
        };
    function parseResponse(resp) {
        var contentType = (resp.getResponseHeader("content-type") || "").toLowerCase();
        return contentType.indexOf("application/json") !== -1 || contentType.indexOf("text/javascript") !== -1 ? JSON.parse(resp.responseText) : contentType.indexOf("text/plain") !== -1 ? resp.responseText : contentType.indexOf("/xml") !== -1 ? resp.responseXML || resp.responseText : resp.response
    }
    var ResponseTypeArrayBuffer = "arraybuffer",
        ResponseTypeText = "text",
        SupportedResponseTypes = [ResponseTypeArrayBuffer, ResponseTypeText],
        Channel = WinJS.Class.define(function Channel_ctor(baseUri) {
            this._uri = "";
            this._headers = {};
            this._params = {};
            this._method = "GET";
            this.path(baseUri)
        }, {
            _uri: null, _headers: null, _params: null, _responseType: null, _method: null, _data: null, _constructUri: function() {
                    for (var uri = this._uri, params = this._params, sep = "?", pkeys = Object.keys(params), i = 0, len = pkeys.length; i < len; i++) {
                        var key = pkeys[i];
                        uri += sep + key + "=" + encodeURIComponent(params[key]);
                        sep = "&"
                    }
                    return uri
                }, data: function(data) {
                    return this._data = data, this
                }, method: function(method) {
                    return this._method = method, this
                }, sendRequest: function() {
                    return this.send(this._method, this._data)
                }, header: function(key, value) {
                    return this._headers[key] = value.toString(), this
                }, param: function(key, value) {
                    return this._params[key] = value === null ? "null" : value.toString(), this
                }, path: function(part) {
                    var uri = this._uri;
                    return uri !== "" && uri.charAt(uri.length - 1) !== "/" && (uri += "/"), this._uri = uri + part.trim(), this
                }, responseType: function(type) {
                    this._responseType = type
                }, send: function(method, data) {
                    var opts = {
                            type: method, url: this._constructUri(), headers: this._headers
                        };
                    return this._responseType !== null && (opts.responseType = this._responseType), opts.data = data !== null ? data : "", AppMagic.Services.xhr(opts)
                }, get: function() {
                    return this.send(AppMagic.Services.Constants.HttpRequest.Methods.GET, null).then(parseResponse)
                }, post: function(data) {
                    return this.send(AppMagic.Services.Constants.HttpRequest.Methods.POST, data).then(parseResponse)
                }, put: function(data) {
                    return this.send(AppMagic.Services.Constants.HttpRequest.Methods.PUT, data).then(parseResponse)
                }, patch: function(data) {
                    return this.send(AppMagic.Services.Constants.HttpRequest.Methods.PATCH, data).then(parseResponse)
                }, "delete": function() {
                    return this.send(AppMagic.Services.Constants.HttpRequest.Methods.DELETE, null).then(parseResponse)
                }
        }, {
            ResponseTypeArrayBuffer: ResponseTypeArrayBuffer, ResponseTypeText: ResponseTypeText, SupportedResponseTypes: SupportedResponseTypes
        });
    function isImageUrl(url) {
        return /^https{0,1}:.*\.(gif|jpg|png|bmp|jpeg)$/i.test(url.trim())
    }
    function isUrl(url) {
        return /^https{0,1}:.*$/i.test(url.trim())
    }
    function isExpectedMediaType(expected, actual) {
        return expected.indexOf("/") > 0 ? expected.toLowerCase() === actual.toLowerCase() : /^\w+\/[\w-+]+$/i.test(actual) && actual.toLowerCase().indexOf((expected + "/").toLowerCase()) === 0
    }
    var stripExprs = [[/<br\s*\/?>/gi, "\n"], [/<p((\s+([\w]+:)?\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>(.*?)<\/p>/gi, "\n$5\n"], [/<div((\s+([\w]+:)?\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>(.*?)<\/div>/gi, "\n$5\n"], [/<a((\s+([\w]+:)?\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)(href\s*=\s*("(.*?)"|'(.*?)'))((\s+([\w]+:)?\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>(.*?)<\/a>/gi, " $13 ($7$8) "], [/<script((\s+([\w]+:)?\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>.*?<\/script>/gi, ""], [/<style((\s+([\w]+:)?\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>.*?<\/style>/gi, ""], [/<\/?([\w]+:)?\w+((\s+([\w]+:)?\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g, ""], [/ +( |$)/g, "$1"], [/\r/g, ""], [/( +\n)|(\n +)/g, "\n"], [/\n{3,}/g, "\n\n"], ];
    function stripHtml(str) {
        for (var res = str || "", i = 0, len = stripExprs.length; i < len; i++) {
            var expr = stripExprs[i];
            res = res.replace(expr[0], expr[1])
        }
        return res.trim()
    }
    function canonicalizeUrl(url) {
        return url.trim().replace(/\\/g, "/").replace(/\/*$/, "")
    }
    var generateArgMap = function(requiredParameters, optionalParameters, functionArguments) {
            for (var PrimitiveDArgument = AppMagic.Services.PrimitiveDArgument, parameter, val, parameterMap = {}, rcount = requiredParameters.length, i = 0; i < rcount; i++)
                parameter = requiredParameters[i],
                val = functionArguments[i],
                parameterMap[parameter.name] = PrimitiveDArgument.createFromValueAndDType(val, parameter.dtype);
            var ocount = optionalParameters.length;
            if (ocount > 0) {
                var opt = functionArguments[rcount] || Object.create(null);
                for (i = 0; i < ocount; i++)
                    parameter = optionalParameters[i],
                    val = opt[parameter.name],
                    typeof val != "undefined" && val !== null && (parameterMap[parameter.name] = PrimitiveDArgument.createFromValueAndDType(val, parameter.dtype))
            }
            return parameterMap
        };
    WinJS.Namespace.define("AppMagic.Services", {
        Channel: Channel, isExpectedMediaType: isExpectedMediaType, isImageUrl: isImageUrl, isUrl: isUrl, stripHtml: stripHtml, canonicalizeUrl: canonicalizeUrl, processError: processError, generateArgMap: generateArgMap
    })
})();