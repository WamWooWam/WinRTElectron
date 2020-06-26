//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(global, Platform) {"use strict";
    function disableAutoUrlDetect() {
        var autoUrlDetectDisabled = document.execCommand("AutoUrlDetect", !1, !1);
        // we're not always in IE
        // Contracts.check(autoUrlDetectDisabled) 
    }
    var _operations = null;
    function _processOperations() {
        for (Contracts.checkArray(_operations); _operations; ) {
            for (var i = 0, len = _operations.length; i < len; i++) {
                var ops = _operations[i];
                if (ops) {
                    delete _operations[i];
                    for (var id in ops) {
                        var context = ops[id];
                        for (Contracts.checkValue(context), Contracts.checkFunction(context.fn), Contracts.checkFunctionOrUndefined(context.validFn), Contracts.checkArray(context.compArray), (!context.validFn || context.validFn()) && context.fn(); context.compArray.length > 0; ) {
                            var comp = context.compArray.pop();
                            Contracts.checkFunction(comp);
                            comp(context.compArray.length === 0)
                        }
                    }
                    break
                }
            }
            i >= len && (_operations = null)
        }
    }
    function executeOnceAsync(fn, id, priority, validConditionFn) {
        Contracts.checkFunction(fn);
        Contracts.checkString(id);
        Contracts.checkNumberOrUndefined(priority);
        Contracts.checkFunctionOrUndefined(validConditionFn);
        priority = priority || 0;
        priority < 0 && Contracts.check(!1, "priority must be a positive value");
        _operations || (_operations = [], executeImmediatelyAsync(_processOperations));
        _operations[priority] || (_operations[priority] = {});
        var context = _operations[priority][id];
        context ? context.fn = fn : context = _operations[priority][id] = {
            fn: fn, compArray: [], id: id, priority: priority, validFn: validConditionFn
        };
        var promise = new WinJS.Promise(function(comp) {
                context.compArray.push(comp)
            });
        return promise.thenOnce = function(onceFn) {
                Contracts.checkFunction(onceFn);
                promise.then(function(isLast) {
                    isLast && onceFn()
                })
            }, promise
    }
    function executeImmediatelyAsync(fn) {
        Contracts.checkFunction(fn);
        typeof setImmediate == "function" ? setImmediate(fn) : setTimeout(fn, 0)
    }
    function secondsToHHMMSS(seconds) {
        Contracts.checkNumber(seconds);
        Contracts.check(seconds >= 0);
        var secs = seconds % 60,
            minutes = (seconds - secs) / 60,
            mins = minutes % 60,
            hours = (minutes - mins) / 60;
        secs < 10 && (secs = "0" + secs.toString());
        mins < 10 && (mins = "0" + mins.toString());
        hours < 10 && (hours = "0" + hours.toString());
        return formatString("{0}:{1}:{2}", hours, mins, secs)
    }
    function secondsToMMSS(seconds) {
        Contracts.checkNumber(seconds);
        Contracts.check(seconds >= 0);
        var secs = seconds % 60,
            mins = (seconds - secs) / 60;
        secs < 10 && (secs = "0" + secs.toString());
        mins < 10 && (mins = "0" + mins.toString());
        return formatString("{0}:{1}", mins, secs)
    }
    function clone(src, deep) {
        if (src === null)
            return null;
        if (typeof src != "object" || typeof src == "function")
            return src;
        if (src instanceof Date)
            return new Date(src.getTime());
        if (src instanceof RegExp)
            return new RegExp(src);
        if (isOpenAjaxControl(src))
            return src;
        var target,
            i,
            keys,
            len;
        if (src instanceof Array) {
            if (target = src.slice(0), len = target.length, deep)
                for (i = 0; i < len; i++)
                    target[i] = clone(target[i], !0)
        }
        else {
            for (target = typeof src.constructor == "function" ? Object.create(src.constructor.prototype) : {}, keys = Object.keys(src), len = keys.length, i = 0; i < len; i++) {
                var key = keys[i];
                target[key] = deep ? clone(src[key], !0) : src[key]
            }
            copyId(src, target)
        }
        return target
    }
    function isOpenAjaxControl(obj) {
        return obj !== null && typeof obj != "undefined" && typeof obj.OpenAjax != "undefined"
    }
    function copyId(source, target) {
        var srcId = source[AppMagic.Constants.Runtime.idProperty];
        Core.Utility.isDefined(srcId) && AppMagic.Utility.createOrSetPrivate(target, AppMagic.Constants.Runtime.idProperty, srcId);
        var srcOldId = source[AppMagic.Constants.Runtime.oldIdProperty];
        Core.Utility.isDefined(srcOldId) && AppMagic.Utility.createOrSetPrivate(target, AppMagic.Constants.Runtime.oldIdProperty, srcOldId)
    }
    function createPrivateImmutable(obj, propertyName, value) {
        Contracts.checkValue(obj);
        Contracts.checkNonEmpty(propertyName);
        Object.defineProperty(obj, propertyName, {
            configurable: !1, enumerable: !1, value: value, writable: !1
        })
    }
    function createPrivate(obj, propertyName, value) {
        Contracts.checkValue(obj);
        Contracts.checkNonEmpty(propertyName);
        Object.defineProperty(obj, propertyName, {
            configurable: !0, enumerable: !1, value: value, writable: !0
        })
    }
    function createOrSetPrivate(obj, propertyName, value) {
        Contracts.checkValue(obj);
        Contracts.checkNonEmpty(propertyName);
        typeof obj[propertyName] == "undefined" ? Object.defineProperty(obj, propertyName, {
            configurable: !0, enumerable: !1, value: value, writable: !0
        }) : obj[propertyName] = value
    }
    function enumerableToArray(enumerable) {
        Contracts.checkValue(enumerable);
        for (var arr = [], iterator = enumerable.first(); iterator.hasCurrent; iterator.moveNext())
            arr.push(iterator.current);
        return arr
    }
    function formatString(format) {
        var args = arguments;
        return format.replace(/{(\d+)}/g, function(x, i) {
                var val = args[parseInt(i, 10) + 1];
                return typeof val == "undefined" ? x : val
            })
    }
    function formatFileSize(size) {
        Contracts.checkNumber(size);
        var kb = 1024,
            mb = 1024 * kb,
            gb = 1024 * mb,
            newsize = 0;
        return size < 1024 ? formatString(AppMagic.Strings.BytesFileSizeFormat, size.toString()) : size < .9 * mb ? (newsize = size / kb, formatString(AppMagic.Strings.KBFileSizeFormat, newsize.toPrecision(3))) : size < .9 * gb ? (newsize = size / mb, formatString(AppMagic.Strings.MBFileSizeFormat, newsize.toPrecision(3))) : (newsize = size / gb, formatString(AppMagic.Strings.GBFileSizeFormat, newsize.toPrecision(3)))
    }
    function getFirstDescendantByClass(className, ancestor) {
        Contracts.checkNonEmpty(className);
        Contracts.checkValue(ancestor);
        var elements = WinJS.Utilities.query("." + className, ancestor);
        return Contracts.check(elements.length > 0), elements[0]
    }
    function deepCompare(x, y, skipKeys) {
        if (Contracts.checkObjectOrUndefined(skipKeys), x === y)
            return !0;
        if (x === null || y === null || typeof x != "object" || typeof y != "object" || isOpenAjaxControl(x) || isOpenAjaxControl(y) || x.constructor.prototype !== y.constructor.prototype)
            return !1;
        var xkeys = Object.keys(x),
            ykeys = Object.keys(y),
            xlen = xkeys.length,
            ylen = ykeys.length,
            i,
            prop;
        if (typeof skipKeys == "object" && (xkeys = xkeys.filter(function(arg) {
            return !skipKeys[arg]
        }), xlen = xkeys.length, ykeys = ykeys.filter(function(arg) {
                return !skipKeys[arg]
            }), ylen = ykeys.length), xlen !== ylen)
            return !1;
        for (i = 0; i < xlen; i++)
            if (prop = xkeys[i], !deepCompare(x[prop], y[prop], skipKeys))
                return !1;
        for (i = 0; i < ylen; i++)
            if (prop = ykeys[i], typeof x[prop] != typeof y[prop])
                return !1;
        return !0
    }
    function execUnsafeLocalFunction(functionToExecute) {
        return Contracts.checkFunction(functionToExecute), window.MSApp ? MSApp.execUnsafeLocalFunction(functionToExecute) : functionToExecute()
    }
    function addDataBindingToWinJSElements(control, dataBindingMap) {
        Contracts.checkValue(control);
        Contracts.checkValue(dataBindingMap);
        for (var i = 0; i < control.childNodes.length; i++) {
            var child = control.childNodes[i],
                bindingstring = dataBindingMap[child.className];
            if (bindingstring) {
                var bindingAttr = document.createAttribute("data-bind");
                bindingAttr.value = bindingstring;
                child.attributes.setNamedItem(bindingAttr)
            }
            addDataBindingToWinJSElements(child, dataBindingMap)
        }
    }
    function leftTrim(text) {
        return Contracts.checkString(text), text.replace(/^\s\s*/, "")
    }
    var hash32 = function(str) {
            for (var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", hashValues = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"], jLoops = 0, kLoops = 0, j = 0, k = 0; !0; ) {
                if (j >= 32 && (jLoops++, j = 0), k >= str.length && (kLoops++, k = 0), jLoops >= 2 && kLoops >= 1)
                    break;
                hashValues[j] = chars[(hashValues[j].charCodeAt(0) + str.charCodeAt(k)) % chars.length];
                j++;
                k++
            }
            return hashValues.join("")
        };
    function ignoreExceptions(callback, thisObject) {
        Contracts.checkFunction(callback);
        try {
            callback.call(thisObject)
        }
        catch(e) {}
    }
    function getDeterministicObjectId(obj) {
        Contracts.checkValue(obj);
        var propNames = [];
        for (var propName in obj)
            propNames.push(propName);
        propNames.sort();
        for (var idParts = [], i = 0, len = propNames.length; i < len; i++) {
            var propValue = obj[propNames[i]];
            propValue = propValue === null || typeof propValue == "undefined" ? "" : propValue.toString();
            idParts.push(propNames[i]);
            idParts.push(propValue)
        }
        return hash32(idParts.join(""))
    }
    function getIfExists(globalName) {
        Contracts.checkNonEmpty(globalName);
        var parts = globalName.split(".");
        Contracts.check(parts.length >= 1);
        for (var value = global, i = 0, len = parts.length; i < len && typeof value != "undefined"; i++)
            value = value[parts[i]];
        return value
    }
    function enumerateDeviceIds(deviceClass, platform) {
        var collectDevices = function(devices) {
                return Contracts.checkArray(devices), devices.map(function(x) {
                        return x.id
                    })
            };
        return platform.Devices.Enumeration.DeviceInformation.findAllAsync(deviceClass).then(collectDevices)
    }
    var Color = WinJS.Class.define(function Color_ctor(r, g, b, a) {
            typeof a == "undefined" ? (Contracts.checkUndefined(r), Contracts.checkUndefined(g), Contracts.checkUndefined(b)) : (Contracts.checkNumber(r), Contracts.checkNumber(g), Contracts.checkNumber(b), Contracts.checkNumber(a), this.r = r, this.g = g, this.b = b, this.a = a)
        }, {
            r: 0, g: 0, b: 0, a: 0, w3cBrightness: {get: function() {
                        return (this.r * 299 + this.g * 587 + this.b * 114) / 1e3
                    }}, clone: function() {
                    return new Color(this.r, this.g, this.b, this.a)
                }, equals: function(other) {
                    return (Contracts.checkDefined(other), other === null) ? !1 : (Contracts.checkNumber(other.r), Contracts.checkNumber(other.g), Contracts.checkNumber(other.b), Contracts.checkNumber(other.a), this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a)
                }, toCss: function() {
                    return "rgba(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ", " + this.a.toString() + ")"
                }, toRuleValue: function() {
                    return Core.Utility.formatString("{0}({1}{2} {3}{4} {5}{6} {7})", Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleRGBAName, AppMagic.Functions.text(this.r), Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleListSeparator, AppMagic.Functions.text(this.g), Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleListSeparator, AppMagic.Functions.text(this.b), Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleListSeparator, AppMagic.Functions.text(this.a))
                }, toNumber: function() {
                    return AppMagic.Functions.rGBA(this.r, this.g, this.b, this.a)
                }, clampRgba: function() {
                    var a = Core.Utility.clamp(this.a, 0, 1),
                        r = Core.Utility.clamp(this.r, 0, 255),
                        g = Core.Utility.clamp(this.g, 0, 255),
                        b = Core.Utility.clamp(this.b, 0, 255);
                    return new Color(r, g, b, a)
                }
        }, {
            parseRuleValue: function(text) {
                Contracts.checkString(text);
                var regex = new RegExp(Core.Utility.formatString("^\\s*{0}\\s*\\(\\s*([-\\d\\{1}]+)\\s*[{2}]\\s*([-\\d\\{3}]+)\\s*[{4}]\\s*([-\\d\\{5}]+)\\s*[{6}]\\s*([-\\d\\{7}]+)\\s*\\)\\s*$", Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleRGBAName, Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator, Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleListSeparator, Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator, Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleListSeparator, Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator, Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleListSeparator, Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator)),
                    results = regex.exec(text);
                if (results) {
                    for (var color = [], i = 1; i < 5; i++)
                        if (color[i] = AppMagic.Functions.value(results[i]), color[i] === null)
                            return null;
                    return new Color(color[1], color[2], color[3], color[4])
                }
                else if (isLocalizationHelperAvailable()) {
                    regex = new RegExp(Core.Utility.formatString("^{0}!([']?[\\w\\s]+[']?)$", Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleColorEnum));
                    results = regex.exec(text);
                    results && (text = results[1]);
                    var hexColor = Microsoft.AppMagic.Authoring.ColorTable.nameToHexMap[text];
                    if (hexColor)
                        return Color.create(hexColor)
                }
                return null
            }, create: function(argb) {
                    if (Contracts.checkNumberOrNull(argb), argb === null)
                        return new Color(0, 0, 0, 1);
                    var b = argb & 255,
                        g = argb >> 8 & 255,
                        r = argb >> 16 & 255,
                        a = (argb >> 24 & 255) / 255;
                    return new Color(r, g, b, a)
                }
        });
    function isLocalizationHelperAvailable() {
        return typeof Microsoft != "undefined" && typeof Microsoft.AppMagic != "undefined" && typeof Microsoft.AppMagic.Common != "undefined" && typeof Microsoft.AppMagic.Common.LocalizationHelper != "undefined" && typeof Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific != "undefined"
    }
    function isScalarType(value) {
        return typeof value == "string" || typeof value == "number" || typeof value == "boolean"
    }
    function tryUnquote(value) {
        return Contracts.checkString(value), value.length > 1 && value[0] === '"' && value[value.length - 1] === '"' ? value.substr(1, value.length - 2) : null
    }
    function isAlphanumeric(text) {
        return Contracts.checkString(text), /^[\w$]+$/.test(text)
    }
    function replaceAtFront(source, pattern, replacement) {
        Contracts.checkString(source);
        Contracts.checkString(pattern);
        Contracts.checkString(replacement);
        var regex = new RegExp("^" + pattern);
        return source.replace(regex, replacement)
    }
    function replaceAllDoubleQuotes(source, replacement) {
        return Contracts.checkString(source), Contracts.checkString(replacement), source.replace(/[\"]/g, replacement)
    }
    function replaceAllSingleQuotes(source, replacement) {
        return Contracts.checkString(source), Contracts.checkString(replacement), source.replace(/[\']/g, replacement)
    }
    function replaceAllSingleOrDoubleQuotes(source, replacement) {
        return Contracts.checkString(source), Contracts.checkString(replacement), source.replace(/[\'\"]/g, replacement)
    }
    function replaceAllWhitespace(source, replacement) {
        return Contracts.checkString(source), Contracts.checkString(replacement), source.replace(/\s+/g, replacement)
    }
    function replaceAllNonAlphanumerics(source, replacement, groupAdjacentMatches) {
        return (Contracts.checkString(source), Contracts.checkString(replacement), groupAdjacentMatches) ? source.replace(/[^a-zA-Z0-9]+/g, replacement) : source.replace(/[^a-zA-Z0-9]/g, replacement)
    }
    function isScreen(templateClassName) {
        return Contracts.checkString(templateClassName), templateClassName === AppMagic.Constants.ScreenClass
    }
    function getSplitText(text, findText) {
        Contracts.checkString(text);
        Contracts.checkString(findText);
        var textLower = text.toLowerCase(),
            findTextLower = findText.toLowerCase(),
            startIndex = textLower.indexOf(findTextLower),
            textLength = textLower.length,
            endIndex;
        return findTextLower.length === 0 || startIndex === -1 ? {
                start: text, middle: "", end: ""
            } : (endIndex = startIndex + findText.length, Contracts.checkRange(startIndex, 0, textLength), Contracts.checkRange(endIndex, startIndex, textLength), {
                    start: text.substring(0, startIndex), middle: text.substring(startIndex, endIndex), end: text.substring(endIndex)
                })
    }
    var BlobEntry = WinJS.Class.define(function BlobEntry_ctor(args) {
            if (Contracts.checkObject(args), args.contentType && args.stream) {
                Contracts.checkString(args.contentType);
                Contracts.checkObject(args.stream);
                try {
                    this._blob = MSApp.createBlobFromRandomAccessStream(args.contentType, args.stream);
                    this._count = 0
                }
                catch(ex) {
                    this._blob = null
                }
            }
            else
                args.blob ? (Contracts.checkObject(args.blob), Contracts.check(args.blob instanceof Blob), this._blob = args.blob, this._count = 0) : this._blob = null
        }, {
            _blob: null, _count: 0, _streamPromise: null, _stream: null, _url: null, ___isValidBlobEntry___: {get: function() {
                        return this._blob !== null
                    }}, url: {get: function() {
                        return this._url || (Contracts.checkObject(this._blob), this._url = URL.createObjectURL(this._blob)), this._url
                    }}, openStreamAsync: function() {
                    var wrappedStream = null;
                    return this._stream ? (wrappedStream = Platform.Storage.Streams.RandomAccessStreamReference.createFromStream(this._stream), wrappedStream.openReadAsync()) : (this._streamPromise || (Contracts.check(this._url), this._streamPromise = streamFromBlobUriAsync(this._url).then(function(stream) {
                            return this._stream = stream, this._streamPromise = null, wrappedStream = Platform.Storage.Streams.RandomAccessStreamReference.createFromStream(stream), wrappedStream.openReadAsync()
                        }.bind(this))), this._streamPromise)
                }, addRef: function() {
                    return Contracts.check(this._count >= 0), ++this._count
                }, getContentType: function() {
                    return this._blob.type
                }, release: function() {
                    return Contracts.check(this._count >= 0), --this._count <= 0 && this.dispose(), this._count
                }, dispose: function() {
                    this._blob && this._blob.msClose();
                    this._stream && this._stream.close();
                    this._url && URL.revokeObjectURL(this._url);
                    this._blob = null;
                    this._stream = null;
                    this._count = 0;
                    this._url = null
                }
        }),
        BlobManager = WinJS.Class.define(function BlobManager_ctor() {
            this._blobs = {}
        }, {
            _blobs: {}, count: {get: function() {
                        return Object.keys(this._blobs).length
                    }}, create: function(contentType, stream) {
                    Contracts.checkNonEmpty(contentType);
                    Contracts.checkObject(stream);
                    var entry = new BlobEntry({
                            contentType: contentType, stream: stream
                        });
                    return this._validateAndReturnUrl(entry)
                }, addBlob: function(blob) {
                    Contracts.checkObject(blob);
                    Contracts.check(blob instanceof Blob);
                    var entry = new BlobEntry({blob: blob});
                    return this._validateAndReturnUrl(entry)
                }, openStreamAsync: function(url) {
                    Contracts.checkNonEmpty(url);
                    var entry = this._getBlobEntry(url);
                    return entry ? entry.openStreamAsync() : WinJS.Promise.wrap()
                }, getStreamAsBase64EncodedStringAsync: function(url) {
                    return Contracts.checkNonEmpty(url), this.openStreamAsync(url).then(function(sourceStream) {
                            if (sourceStream === null || typeof sourceStream == "undefined")
                                return WinJS.Promise.wrapError(null);
                            Contracts.checkObject(sourceStream);
                            var iBuffer = new Platform.Storage.Streams.Buffer(sourceStream.size);
                            return sourceStream.readAsync(iBuffer, sourceStream.size, Platform.Storage.Streams.InputStreamOptions.none)
                        }).then(function(buffer) {
                            return Contracts.checkValue(buffer), Platform.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer)
                        }, function() {
                            return null
                        })
                }, addRef: function(url) {
                    Contracts.checkString(url);
                    var entry = this._getBlobEntry(url);
                    entry && entry.addRef()
                }, getContentType: function(url) {
                    Contracts.checkString(url);
                    var entry = this._getBlobEntry(url);
                    return entry ? entry.getContentType() : ""
                }, release: function(url) {
                    Contracts.checkString(url);
                    var entry = this._getBlobEntry(url),
                        released = !1;
                    return entry && entry.release() <= 0 && (delete this._blobs[url], released = !0), released
                }, releaseAll: function() {
                    for (var blobs = this._blobs, urls = Object.keys(blobs), len = urls.length, i = 0; i < len; i++) {
                        var entry = this._getBlobEntry(urls[i]);
                        entry && entry.dispose()
                    }
                    this._blobs = {}
                }, _getBlobEntry: function(url) {
                    Contracts.checkString(url);
                    var entry = this._blobs[url];
                    return entry && entry.___isValidBlobEntry___ ? entry : null
                }, _validateAndReturnUrl: function(entry) {
                    return (Contracts.checkObject(entry), !entry.___isValidBlobEntry___) ? null : (this._blobs[entry.url] = entry, entry.url)
                }
        }),
        defaultBlobManager = new BlobManager;
    function addRefBlobs(item) {
        var i,
            len,
            keys;
        if (typeof item == "string")
            defaultBlobManager.addRef(item);
        else if (item instanceof Array)
            for (i = 0, len = item.length; i < len; i++)
                addRefBlobs(item[i]);
        else if (item !== null && typeof item == "object" && !isOpenAjaxControl(item))
            for (keys = Object.keys(item), i = 0, len = keys.length; i < len; i++)
                addRefBlobs(item[keys[i]])
    }
    function releaseBlobs(item) {
        var i,
            len,
            keys;
        if (typeof item == "string")
            defaultBlobManager.release(item) || removeUriFromLocalFileCache(item);
        else if (item instanceof Array)
            for (i = 0, len = item.length; i < len; i++)
                releaseBlobs(item[i]);
        else if (item !== null && typeof item == "object" && !isOpenAjaxControl(item))
            for (keys = Object.keys(item), i = 0, len = keys.length; i < len; i++)
                releaseBlobs(item[keys[i]])
    }
    function getBlobsInCollection(collection) {
        Contracts.checkArray(collection);
        var blobs = {},
            promises = [],
            getBlobs = function(item) {
                var i,
                    len,
                    keys;
                if (typeof item == "string" && item.length > 0) {
                    var promise = defaultBlobManager.getStreamAsBase64EncodedStringAsync(item).then(function(blobUrl, base64String) {
                            if (Contracts.checkNonEmpty(blobUrl), base64String !== null && typeof base64String != "undefined") {
                                var contentType = defaultBlobManager.getContentType(blobUrl);
                                blobs[blobUrl] = {
                                    base64String: base64String, contentType: contentType
                                }
                            }
                        }.bind(null, item));
                    promises.push(promise)
                }
                else if (item instanceof Array)
                    for (i = 0, len = item.length; i < len; i++)
                        getBlobs(item[i]);
                else if (item !== null && typeof item == "object" && !isOpenAjaxControl(item))
                    for (keys = Object.keys(item), i = 0, len = keys.length; i < len; i++)
                        getBlobs(item[keys[i]])
            };
        return getBlobs(collection), WinJS.Promise.join(promises).then(function() {
                return blobs
            })
    }
    function streamFromBlobUriAsync(url) {
        return Contracts.checkNonEmpty(url), WinJS.xhr({
                url: url, responseType: "blob"
            }).then(function(req) {
                return Contracts.checkValue(req), Contracts.checkValue(req.response), req.response.msDetachStream()
            })
    }
    function streamFromUriAsync(url) {
        if (Contracts.checkNonEmpty(url), /^blob:.*$/.test(url))
            return defaultBlobManager.openStreamAsync(url).then(function(blobStream) {
                    return blobStream ? blobStream : streamFromBlobUriAsync(url)
                });
        else {
            var uri = new Platform.Foundation.Uri(url),
                stream = Platform.Storage.Streams.RandomAccessStreamReference.createFromUri(uri);
            return stream.openReadAsync()
        }
    }
    function _randomMax8HexChars() {
        return ((1 + Math.random()) * 4294967296 | 0).toString(16).substring(1)
    }
    function generateRandomId(decoration) {
        return decoration + "_sienna_" + _randomMax8HexChars() + _randomMax8HexChars()
    }
    function createInferredSchemaFromObject(obj) {
        Contracts.check(typeof obj == "object");
        for (var keys = Object.keys(obj), schema = Object.create(null), i = 0, len = keys.length; i < len; i++) {
            var key = keys[i],
                schemaItem = {name: key},
                val = obj[key];
            if (schema[key] = schemaItem, val === null || typeof val == "undefined") {
                schemaItem.type = "?";
                continue
            }
            switch (typeof val) {
                case"string":
                    schemaItem.type = isImageUrl(val) ? "i" : isUrl(val) ? "h" : "s";
                    break;
                case"number":
                    schemaItem.type = "n";
                    break;
                case"boolean":
                    schemaItem.type = "b";
                    break;
                case"object":
                    val instanceof Array ? (schemaItem.type = "array", schemaItem.ptr = createInferredSchemaFromArray(val)) : (schemaItem.type = "object", schemaItem.ptr = createInferredSchemaFromObject(val));
                    break;
                default:
                    schemaItem.type = "?";
                    break
            }
        }
        return schema
    }
    function isImageUrl(url) {
        return Contracts.checkString(url), /^https{0,1}:.*\.(gif|jpg|png|bmp|jpeg)$/i.test(url.trim())
    }
    function isUndefinedOrNullOrEmptyString(str) {
        return typeof str == "undefined" || str === null || str === ""
    }
    function isUrl(url) {
        return /^https{0,1}:\/\/.+$/i.test(url.trim())
    }
    function isHttpsUrl(url) {
        return /^https:\/\/.+$/i.test(url.trim())
    }
    function getAzureTableServiceUrlParts(url) {
        Contracts.checkString(url);
        var matches = /^(https{0,1}:\/\/.*?\/)(tables\/)(.+?)\/?$/i.exec(url);
        return matches ? {
                isValidUrl: !0, baseUrl: matches[1], tableName: matches[3]
            } : {isValidUrl: !1}
    }
    function decodeImageUrl(url) {
        return Contracts.checkString(url), url.replace(/([\r\n]|%$|%(?![0-9A-Fa-f][0-9A-F-a-f]))/g, "").trim()
    }
    function isValidAzureMobileServiceUrl(url) {
        return Contracts.checkString(url), /https:\/\/\w[\w\d-]{2,62}\.azure-mobile\.net\/{0,1}.*/i.test(url)
    }
    function isValidSharePointSiteUrl(url) {
        return Contracts.checkString(url), /https{0,1}:\/\/.*/i.test(url)
    }
    function isSignInCancelError(error) {
        return Contracts.checkObject(error), error.message === AppMagic.Strings.AuthenticationBrokerManagerErrorUserCanceled
    }
    function createInferredSchemaFromArray(arr) {
        Contracts.checkArray(arr);
        for (var schema = Object.create(null), i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            if (item !== null && typeof item != "undefined") {
                (typeof item != "object" || item instanceof Array) && (item = {Value: item});
                var ts = createInferredSchemaFromObject(item);
                mergeSchemas(schema, ts)
            }
        }
        return schema
    }
    function mergeSchemas(schema1, schema2) {
        for (var keys = Object.keys(schema1), key, s1item, s2item, i = 0, len = keys.length; i < len; i++)
            if (key = keys[i], s1item = schema1[key], s2item = schema2[key], typeof s2item != "undefined" && s2item !== null) {
                if (typeof s1item == "undefined" || s1item === null || s1item.type === "?") {
                    schema1[key] = s2item;
                    delete schema2[key];
                    continue
                }
                if (s2item.type !== "?") {
                    var setSchema1ToString = function(s1, k) {
                            s1[k] = {
                                type: "s", name: k
                            }
                        };
                    s1item.type === s2item.type ? (s1item.type === "object" || s1item.type === "array") && mergeSchemas(s1item.ptr, s2item.ptr) : (s1item.type === "object" ? s2item.type === "array" ? (mergeSchemas(s1item.ptr, s2item.ptr), schema1[key] = {
                        name: key, type: "array", ptr: s1item.ptr
                    }) : setSchema1ToString(schema1, key) : s1item.type === "array" ? s2item.type === "object" ? mergeSchemas(s1item.ptr, s2item.ptr) : setSchema1ToString(schema1, key) : setSchema1ToString(schema1, key), delete schema2[key])
                }
            }
        for (keys = Object.keys(schema2), i = 0, len = keys.length; i < len; i++)
            key = keys[i],
            typeof schema1[key] == "undefined" && (schema1[key] = schema2[key])
    }
    function flattenSchema(schema) {
        Contracts.checkPureObject(schema);
        for (var keys = Object.keys(schema), schemaArray = [], i = 0, len = keys.length; i < len; i++) {
            var item = schema[keys[i]],
                newItem = {name: item.name};
            item.type === "object" || item.type === "array" ? newItem.ptr = flattenSchema(item.ptr) : typeof item.ptr != "undefined" && (newItem.ptr = item.ptr);
            newItem.type = item.type === "?" ? "s" : item.type;
            schemaArray.push(newItem)
        }
        return schemaArray
    }
    function stringizeSchema(schemaArray, isTable) {
        Contracts.checkArray(schemaArray);
        for (var schemaStr = "", sep = "", token = isTable ? "*" : "!", i = 0, len = schemaArray.length; i < len; i++) {
            var c = schemaArray[i],
                columnName = c.name;
            if (/[^a-zA-Z0-9_]/.test(columnName) || /^[0-9]/.test(columnName)) {
                var escaped = columnName.replace(/'/g, "''");
                columnName = "'" + escaped + "'"
            }
            schemaStr += sep + columnName + ":";
            Contracts.checkNonEmpty(c.type, "Schema item needs to have a dtype.");
            c.type === "array" ? (Contracts.checkArray(c.ptr), schemaStr += stringizeSchema(c.ptr, !0)) : c.type === "object" ? (Contracts.checkArray(c.ptr), schemaStr += stringizeSchema(c.ptr, !1)) : schemaStr += c.type;
            sep = ","
        }
        return token + "[" + schemaStr + "]"
    }
    function getSchemaArrayFromType(columnsAndTypes) {
        Contracts.checkObject(columnsAndTypes);
        for (var iter = columnsAndTypes.first(), schema = []; iter.hasCurrent; iter.moveNext()) {
            var columnName = iter.current.name,
                columnInvariantName = iter.current.invariantName,
                type = iter.current.dataType,
                schemaItem = {
                    name: columnName, invariantName: columnInvariantName
                };
            type.isAggregate || type.isControl ? (Contracts.check(type.toString().length > 0), schemaItem.type = type.toString().charAt(0) === "!" ? "object" : type.toString().charAt(0) === "*" ? "array" : type.toString(), schemaItem.ptr = getSchemaArrayFromType(type.getColumnsAndTypes())) : type.kind === "Enum" ? (Contracts.check(type.toString().length > 1), Contracts.check(type.toString().charAt(0) === "%"), schemaItem.type = type.toString().charAt(1) + "") : (Contracts.check(type.toString().length > 0), schemaItem.type = type.toString());
            schema.push(schemaItem)
        }
        return schema
    }
    var fileToBlobMap = Object.create(null);
    function clearKnownFilesList() {
        for (var file in fileToBlobMap)
            removeUriFromLocalFileCache(file);
        fileToBlobMap = Object.create(null)
    }
    function removeUriFromLocalFileCache(uri) {
        Contracts.checkString(uri);
        try {
            var candidateUri = decodeURI(uri).toLowerCase().trim();
            if (candidateUri) {
                var blobUri = fileToBlobMap[candidateUri];
                blobUri && AppMagic.Utility.blobManager.release(blobUri) && delete fileToBlobMap[candidateUri]
            }
        }
        catch(e) {}
    }
    function getLocalFilesReferenced() {
        var result = [];
        for (var key in fileToBlobMap)
            result.push(key);
        return result
    }
    function mediaUrlHelper(oldUri, newUri, useUrlFunction) {
        if (Contracts.checkDefined(oldUri), Contracts.checkStringOrNull(newUri), newUri === null)
            return WinJS.Promise.wrap(useUrlFunction ? 'url("")' : "");
        var candidateUri = newUri.trim();
        if (AppMagic.AuthoringTool.Runtime.isSharePointOnlineMedia(candidateUri))
            return _sharePointOnlineMediaHelper(candidateUri, useUrlFunction);
        if (/^(blob:)|(http:)|(https:)|(ms-appdata:)|(ms-appx:)/i.test(candidateUri) || !/^(\\{2}|([a-zA-Z]{1}:\\)).*/i.test(candidateUri))
            return candidateUri = /^$|^[/]?ctrllib\//i.test(newUri) ? encodeURI(candidateUri) : encodeUrlWithQueryString(candidateUri), WinJS.Promise.wrap(useUrlFunction ? 'url("' + candidateUri + '")' : candidateUri);
        Contracts.checkValue(candidateUri);
        candidateUri = candidateUri.toLowerCase();
        var cachedUri;
        return (typeof lookupKnownResource != "undefined" && (cachedUri = lookupKnownResource(candidateUri)), cachedUri || (cachedUri = fileToBlobMap[candidateUri]), cachedUri) ? WinJS.Promise.wrap(useUrlFunction ? 'url("' + cachedUri + '")' : cachedUri) : WinJS.Promise.wrap().then(Platform.Storage.StorageFile.getFileFromPathAsync.bind(this, candidateUri)).then(function(file) {
                return file.openReadAsync()
            }).then(function(stream) {
                var blobUri;
                return fileToBlobMap[candidateUri] ? blobUri = fileToBlobMap[candidateUri] : (blobUri = defaultBlobManager.create(stream.contentType || "resource", stream), blobUri && defaultBlobManager.addRef(blobUri), fileToBlobMap[candidateUri] = blobUri), useUrlFunction ? 'url("' + blobUri + '")' : blobUri
            }, function() {
                return useUrlFunction ? 'url("")' : ""
            })
    }
    function encodeUrlWithQueryString(urlToEncode) {
        if (Contracts.checkValue(urlToEncode), !hasValidUrlHost(urlToEncode))
            return urlToEncode;
        var newUrl = urlToEncode;
        try {
            var anchorTag = document.createElement("A");
            if (anchorTag.href = newUrl, anchorTag.search.length > 1) {
                var queryString = anchorTag.search.substring(1),
                    queryItems = queryItems = queryString.split("&");
                newUrl = urlToEncode.indexOf(anchorTag.protocol + "//" + anchorTag.host) === 0 ? encodeURI(decodeURIComponent(anchorTag.protocol + "//" + anchorTag.host + "/" + anchorTag.pathname + "?")) : encodeURI(decodeURIComponent(anchorTag.protocol + "//" + anchorTag.hostname + "/" + anchorTag.pathname + "?"));
                for (var i = 0; i < queryItems.length; i++) {
                    var queryItemComponent = queryItems[i].split("=");
                    try {
                        newUrl = newUrl + queryItemComponent[0] + "=" + encodeURIComponent(decodeURIComponent(queryItemComponent[1].replace(/\+/g, " ")))
                    }
                    catch(e) {
                        newUrl = newUrl + encodeURI(queryItems[i])
                    }
                    i !== queryItems.length - 1 && (newUrl += "&")
                }
                anchorTag.hash.length !== 0 && (newUrl = newUrl + encodeURI(decodeURIComponent(anchorTag.hash)))
            }
            else
                newUrl = encodeURI(decodeURIComponent(newUrl))
        }
        catch(e) {
            newUrl = encodeURI(urlToEncode)
        }
        return newUrl
    }
    function hasValidUrlHost(url) {
        Contracts.checkValue(url);
        var anchor = document.createElement("A");
        return (anchor.href = encodeURI(url), anchor.hostname.length === 0) ? !1 : !0
    }
    var RectUtil = {isZero: function(rect) {
                return Contracts.checkObject(rect), rect.x === 0 && rect.y === 0 && rect.height === 0 && rect.width === 0
            }},
        escapeRegExpString = function(string, replacementFormat) {
            return Contracts.checkString(string), Contracts.checkStringOrUndefined(replacementFormat), Core.Utility.isDefined(replacementFormat) || (replacementFormat = "{0}"), string.replace(/([.*+?^${}()|\[\]\/\\])/g, Core.Utility.formatString(replacementFormat, "\\$1"))
        },
        invalidFileNameChars = '*"?:\\<>|/',
        invalidFileNameRegEx;
    function getInvalidFileNameRegEx() {
        return invalidFileNameRegEx || (invalidFileNameRegEx = new RegExp(Core.Utility.formatString("[{0}]", AppMagic.Utility.escapeRegExpString(invalidFileNameChars)))), invalidFileNameRegEx
    }
    var isValidFileName = function(fileName) {
            return (Contracts.checkStringOrNull(fileName), fileName === null) ? !1 : !getInvalidFileNameRegEx().test(fileName)
        };
    function getInitialFocusElement(parentElement) {
        Contracts.checkValue(parentElement);
        var initialFocusElems = parentElement.querySelectorAll("[data-appmagic-initialFocus]");
        return initialFocusElems.length > 0 ? initialFocusElems[0] : null
    }
    function getLastFocusElement(parentElement) {
        Contracts.checkValue(parentElement);
        var lastFocusElems = parentElement.querySelectorAll("[data-appmagic-lastfocus]");
        return lastFocusElems.length > 0 ? lastFocusElems[0] : null
    }
    function validateUri(uri) {
        if (Contracts.checkString(uri), !Platform || !Platform.Foundation || !Platform.Foundation.Uri)
            return !0;
        var validUri = !1;
        try {
            new Platform.Foundation.Uri(uri);
            validUri = !0
        }
        catch(e) {}
        return validUri
    }
    function mapDefinitionsHashTableWithSort(dict, orderByPropertyName, callback) {
        Contracts.checkObject(dict);
        Contracts.checkHashTableOfObjects(dict, "mapDefinitionsHashTableWithSort expects each value in the dictionary to be a definition object.");
        Contracts.checkNonEmpty(orderByPropertyName);
        Contracts.checkFunction(callback);
        var orderedKeyNames = Object.keys(dict).sort(function(lhsKeyName, rhsKeyName) {
                Contracts.checkObject(dict[lhsKeyName]);
                Contracts.checkObject(dict[rhsKeyName]);
                var lhs = dict[lhsKeyName][orderByPropertyName],
                    rhs = dict[rhsKeyName][orderByPropertyName];
                return Contracts.checkNumber(lhs), Contracts.checkNumber(rhs), lhs - rhs
            }),
            resultArray = [];
        return orderedKeyNames.forEach(function(keyName) {
                var value = dict[keyName],
                    mapValue = callback(keyName, value);
                resultArray.push(mapValue)
            }), resultArray
    }
    var MultipartFormDataHelper = WinJS.Class.define(function MultipartFormDataHelper_ctr(){}, {
            getFileName: function() {
                var ConstantMultiPartFileName = "file";
                return formatString("{0}_{1}", ConstantMultiPartFileName, this.generateUID().replace(/-/g, ""))
            }, generateUID: function() {
                    var rand4 = function() {
                            return Math.floor(Math.random() * 65536).toString(16)
                        };
                    return rand4() + rand4() + "-" + rand4() + "-" + rand4() + "-" + rand4() + "-" + rand4() + rand4() + rand4()
                }
        }, {}),
        FocusKeeperManager = WinJS.Class.define(function FocusKeeperManager_ctr(){}, {}, {
            _focusContainers: [], _activeFocusContainer: null, _updateActiveFocusContainer: function(element) {
                    if (Contracts.check(FocusKeeperManager._activeFocusContainer !== element), FocusKeeperManager._activeFocusContainer = element, element) {
                        var initialFocusElement = getInitialFocusElement(element);
                        Contracts.checkValue(initialFocusElement);
                        initialFocusElement.focus()
                    }
                }, activeFocusContainer: {get: function() {
                        return FocusKeeperManager._activeFocusContainer
                    }}, addFocusContainer: function(element) {
                    Contracts.checkValue(element);
                    Contracts.check(FocusKeeperManager._focusContainers.indexOf(element) === -1);
                    Contracts.checkValue(getInitialFocusElement(element), "The element must have an element with data-appmagic-initialFocus attribute set");
                    FocusKeeperManager._focusContainers.unshift(element);
                    FocusKeeperManager._updateActiveFocusContainer(element)
                }, removeFocusContainer: function(element) {
                    Contracts.checkValue(element);
                    var index = FocusKeeperManager._focusContainers.indexOf(element);
                    if (index >= 0 && FocusKeeperManager._focusContainers.splice(index, 1), FocusKeeperManager._activeFocusContainer === element) {
                        Contracts.check(index === 0);
                        var activeFocusContainer = FocusKeeperManager._focusContainers.length > 0 ? FocusKeeperManager._focusContainers[0] : null;
                        FocusKeeperManager._updateActiveFocusContainer(activeFocusContainer)
                    }
                }
        }),
        FocusKeeper = WinJS.Class.define(function FocusKeeper_ctor(element) {
            Contracts.checkObject(element);
            this._element = element
        }, {
            _element: null, _initialFocusElement: null, _lastFocusElement: null, _handleFocusOut: function() {
                    var activeElem = document.activeElement;
                    return this._lastFocusElement === null && (this._lastFocusElement = getLastFocusElement(this._element)), FocusKeeperManager.activeFocusContainer === this._element && activeElem && !this._element.contains(activeElem) && window.setImmediate(function() {
                            if (this._element.compareDocumentPosition(activeElem) === Node.DOCUMENT_POSITION_PRECEDING && this._lastFocusElement) {
                                this._lastFocusElement.focus();
                                return
                            }
                            this._initialFocusElement && this._initialFocusElement.focus()
                        }.bind(this)), !0
                }, addFocusOutHandler: function() {
                    this._initialFocusElement = getInitialFocusElement(this._element);
                    this._lastFocusElement = getLastFocusElement(this._element);
                    this._initialFocusElement || (this._initialFocusElement = this._createHiddenFocusCatcher());
                    FocusKeeperManager.addFocusContainer(this._element);
                    this._element.addEventListener("focusout", this._handleFocusOut.bind(this), !1)
                }, removeFocusOutHandler: function() {
                    this._element.removeEventListener("focusout", this._handleFocusOut.bind(this), !1);
                    FocusKeeperManager.removeFocusContainer(this._element);
                    this._initialFocusElement = null;
                    this._lastFocusElement = null;
                    this._tryRemoveHiddenFocusCatcher()
                }, _createHiddenFocusCatcher: function() {
                    var focusCatcher = document.createElement("DIV");
                    return WinJS.Utilities.addClass(focusCatcher, "hiddenFocusCatcher"), focusCatcher.setAttribute("tabindex", "0"), focusCatcher.setAttribute("aria-hidden", "true"), focusCatcher.setAttribute("data-appmagic-initialFocus", "true"), this._element.insertBefore(focusCatcher, this._element.firstChild), focusCatcher
                }, _tryRemoveHiddenFocusCatcher: function() {
                    for (var focusCatcher = null, children = this._element.childNodes, i = 0, len = children.length; i < len; i++) {
                        var child = children[i];
                        if (child.className === "hiddenFocusCatcher") {
                            focusCatcher = child;
                            break
                        }
                    }
                    for (i++; i < len; i++)
                        Contracts.check(children[i].className !== "hiddenFocusCatcher");
                    focusCatcher && this._element.removeChild(focusCatcher)
                }
        }, {});
    function propertyGroupComparator(a, b) {
        Contracts.checkValue(a);
        Contracts.checkValue(b);
        var idxA = a.position,
            idxB = b.position;
        return Contracts.checkNumber(idxA), Contracts.checkNumber(idxB), Contracts.check(idxA >= 0 && idxB >= 0), idxA - idxB
    }
    function getPropertyGroupInfo(group) {
        Contracts.checkNumber(group);
        var propertyGroup = Microsoft.AppMagic.Authoring.PropertyGroup;
        switch (group) {
            case propertyGroup.border:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupBorder, imgUrl: _getGroupImageUrl("border"), position: 5
                    };
            case propertyGroup.chart:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupChart, imgUrl: _getGroupImageUrl("chart"), position: 3
                    };
            case propertyGroup.barChart:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupChart, imgUrl: _getGroupImageUrl("barchart"), position: 3
                    };
            case propertyGroup.lineChart:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupChart, imgUrl: _getGroupImageUrl("linechart"), position: 3
                    };
            case propertyGroup.color:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupColor, imgUrl: _getGroupImageUrl("text"), position: 1, appearance: "color", primaryProperty: "Color"
                    };
            case propertyGroup.pen:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupPen, imgUrl: _getGroupImageUrl("pen"), position: 1
                    };
            case propertyGroup.imagePosition:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupImagePosition, imgUrl: _getGroupImageUrl("imageposition"), position: 6
                    };
            case propertyGroup.none:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupNone, imgUrl: "", position: 100
                    };
            case propertyGroup.options:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupOptions, imgUrl: _getGroupImageUrl("options"), position: 9
                    };
            case propertyGroup.padding:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupPadding, imgUrl: _getGroupImageUrl("padding"), position: 10
                    };
            case propertyGroup.paragraph:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupParagraph, imgUrl: _getGroupImageUrl("paragraph"), position: 2
                    };
            case propertyGroup.sizePosition:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupSizePosition, imgUrl: _getGroupImageUrl("sizeposition"), position: 11
                    };
            case propertyGroup.fill:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupFill, imgUrl: _getGroupImageUrl("fill"), position: 4
                    };
            case propertyGroup.template:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupTemplate, imgUrl: _getGroupImageUrl("template"), position: 7
                    };
            case propertyGroup.text:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupText, imgUrl: _getGroupImageUrl("text"), position: 0
                    };
            case propertyGroup.transparency:
                return {
                        displayName: AppMagic.AuthoringStrings.CommandBarGroupTransparency, imgUrl: _getGroupImageUrl("transparency"), position: 8
                    };
            default:
                return null
        }
    }
    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1
    }
    function _getGroupImageUrl(groupName) {
        return Contracts.checkNonEmpty(groupName), "/images/designrule_group_" + groupName + "icon.svg"
    }
    function _sharePointOnlineMediaHelper(url, useUrlFunction) {
        var sharePoint = AppMagic.AuthoringTool.Runtime.sharePointOnlineBroker;
        return sharePoint.getSharePointMedia(url).then(function(stream) {
                return (stream instanceof Blob) ? _handleMediaBlob(stream, url, useUrlFunction) : WinJS.Promise.wrap(useUrlFunction ? 'url("")' : "")
            }, function() {
                return WinJS.Promise.wrap(useUrlFunction ? 'url("")' : "")
            })
    }
    function _handleMediaBlob(stream, candidateUri, useUrlFunction) {
        var blobUri;
        return fileToBlobMap[candidateUri] ? blobUri = fileToBlobMap[candidateUri] : (blobUri = defaultBlobManager.addBlob(stream), blobUri && defaultBlobManager.addRef(blobUri), fileToBlobMap[candidateUri] = blobUri), useUrlFunction ? 'url("' + blobUri + '")' : blobUri
    }
    WinJS.Namespace.define("AppMagic.Utility", {
        addDataBindingToWinJSElements: addDataBindingToWinJSElements, addRefBlobs: addRefBlobs, blobManager: defaultBlobManager, clearKnownFilesList: clearKnownFilesList, clone: clone, copyId: copyId, Color: Color, createOrSetPrivate: createOrSetPrivate, createPrivate: createPrivate, createPrivateImmutable: createPrivateImmutable, createInferredSchemaFromArray: createInferredSchemaFromArray, createInferredSchemaFromObject: createInferredSchemaFromObject, deepCompare: deepCompare, disableAutoUrlDetect: disableAutoUrlDetect, endsWith: endsWith, enumerableToArray: enumerableToArray, enumerateDeviceIds: enumerateDeviceIds, execUnsafeLocalFunction: execUnsafeLocalFunction, executeImmediatelyAsync: executeImmediatelyAsync, executeOnceAsync: executeOnceAsync, flattenSchema: flattenSchema, FocusKeeper: FocusKeeper, FocusKeeperManager: FocusKeeperManager, formatFileSize: formatFileSize, generateRandomId: generateRandomId, getBlobsInCollection: getBlobsInCollection, getDeterministicObjectId: getDeterministicObjectId, getFirstDescendantByClass: getFirstDescendantByClass, getPropertyGroupInfo: getPropertyGroupInfo, getIfExists: getIfExists, getInitialFocusElement: getInitialFocusElement, getLocalFilesReferenced: getLocalFilesReferenced, getSchemaArrayFromType: getSchemaArrayFromType, getSplitText: getSplitText, hash32: hash32, ignoreExceptions: ignoreExceptions, isSignInCancelError: isSignInCancelError, isHttpsUrl: isHttpsUrl, isImageUrl: isImageUrl, isOpenAjaxControl: isOpenAjaxControl, isScalarType: isScalarType, isScreen: isScreen, isUndefinedOrNullOrEmptyString: isUndefinedOrNullOrEmptyString, isUrl: isUrl, getAzureTableServiceUrlParts: getAzureTableServiceUrlParts, isValidAzureMobileServiceUrl: isValidAzureMobileServiceUrl, isValidSharePointSiteUrl: isValidSharePointSiteUrl, decodeImageUrl: decodeImageUrl, leftTrim: leftTrim, mapDefinitionsHashTableWithSort: mapDefinitionsHashTableWithSort, mediaUrlHelper: mediaUrlHelper, encodeUrlWithQueryString: encodeUrlWithQueryString, MultipartFormDataHelper: MultipartFormDataHelper, propertyGroupComparator: propertyGroupComparator, RectUtil: RectUtil, releaseBlobs: releaseBlobs, removeUriFromLocalFileCache: removeUriFromLocalFileCache, secondsToHHMMSS: secondsToHHMMSS, secondsToMMSS: secondsToMMSS, streamFromUriAsync: streamFromUriAsync, stringizeSchema: stringizeSchema, tryUnquote: tryUnquote, isAlphanumeric: isAlphanumeric, replaceAtFront: replaceAtFront, replaceAllSingleQuotes: replaceAllSingleQuotes, replaceAllDoubleQuotes: replaceAllDoubleQuotes, replaceAllSingleOrDoubleQuotes: replaceAllSingleOrDoubleQuotes, replaceAllWhitespace: replaceAllWhitespace, replaceAllNonAlphanumerics: replaceAllNonAlphanumerics, isValidFileName: isValidFileName, invalidFileNameChars: invalidFileNameChars, validateUri: validateUri, escapeRegExpString: escapeRegExpString
    });
    function stopPropagationOfCursorNavigation(evt) {
        Contracts.checkDefined(evt);
        (evt.key === AppMagic.Constants.Keys.home || evt.key === AppMagic.Constants.Keys.end) && evt.stopPropagation()
    }
    function isEnterOrSpacePressed(evt) {
        return Contracts.checkDefined(evt), evt.key === AppMagic.Constants.Keys.enter || evt.key === AppMagic.Constants.Keys.space
    }
    WinJS.Namespace.define("AppMagic.KeyboardHandlers", {
        stopPropagationOfCursorNavigation: stopPropagationOfCursorNavigation, isEnterOrSpacePressed: isEnterOrSpacePressed
    })
})(this, Windows);