//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        _digitGroupingSymRegex: null, _validNumFormatRegex: null, _dateTimeFmtSpecReplacements: null, _negativeNumFormatRegex: null, _digitGroupingSymbolRegex: {get: function() {
                    if (this._digitGroupingSymRegex === null) {
                        var digitGroupingSymbol = AppMagic.Globalization.digitGroupingSymbol;
                        this._digitGroupingSymRegex = new RegExp(AppMagic.Utility.escapeRegExpString(digitGroupingSymbol, "[{0}]"), "g")
                    }
                    return this._digitGroupingSymRegex
                }}, _negativeNumberFormatRegex: {get: function() {
                    return this._negativeNumFormatRegex === null && (this._negativeNumFormatRegex = new RegExp(Core.Utility.formatString("(^(\\s)*(%|{0})?(\\s)*[\\(](\\s)*([0-9]*)({3})?([0-9]*)(\\s)*[\\)](\\s)*$)|" + "(^(\\s)*[\\(](\\s)*(%|{0})?(\\s)*([0-9]*)({3})?([0-9]*)(\\s)*[\\)](\\s)*$)|" + "(^(\\s)*[\\(](\\s)*([0-9]*)({3})?([0-9]*)(\\s)*(%)?(\\s)*[\\)](\\s)*$)|" + "(^(\\s)*[\\(](\\s)*([0-9]*)({3})?([0-9]*)(\\s)*[\\)](\\s)*(%)?(\\s)*$)|" + "(^(\\s)*(%|{0})?(\\s)*[\\(](\\s)*([0-9]+)e({1}|{2})?([0-9]+)(\\s)*[\\)](\\s)*$)|" + "(^(\\s)*[\\(](\\s)*(%|{0})?(\\s)*([0-9]+)e({1}|{2})?([0-9]+)(\\s)*[\\)](\\s)*$)|" + "(^(\\s)*[\\(](\\s)*([0-9]+)e({1}|{2})?([0-9]+)(\\s)*(%)?(\\s)*[\\)](\\s)*$)|" + "(^(\\s)*[\\(](\\s)*([0-9]+)e({1}|{2})?([0-9]+)(\\s)*[\\)](\\s)*(%)?(\\s)*$)", AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.currencySymbol, "[{0}]"), AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.positiveSymbol, "[{0}]"), AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.negativeSymbol, "[{0}]"), AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.decimalSymbol, "[{0}]")))), this._negativeNumFormatRegex
                }}, _validNumericFormatRegex: {get: function() {
                    return this._validNumFormatRegex === null && (this._validNumFormatRegex = new RegExp(Core.Utility.formatString("(^(\\s)*(%|{0})?(\\s)*({1}|{2})?(\\s)*([0-9]*)({3})?([0-9]*)(\\s)*$)|" + "(^(\\s)*({1}|{2})?(\\s)*(%|{0})?(\\s)*([0-9]*)({3})?([0-9]*)(\\s)*$)|" + "(^(\\s)*({1}|{2})?(\\s)*([0-9]*)({3})?([0-9]*)(\\s)*%?(\\s)*$)|" + "(^(\\s)*(%|{0})?(\\s)*({1}|{2})?(\\s)*([0-9]+)e({1}|{2})?([0-9]+)(\\s)*$)|" + "(^(\\s)*({1}|{2})?(\\s)*(%|{0})?(\\s)*([0-9]+)e({1}|{2})?([0-9]+)(\\s)*$)|" + "(^(\\s)*({1}|{2})?(\\s)*([0-9]+)e({1}|{2})?([0-9]+)(\\s)*%?(\\s)*$)", AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.currencySymbol, "[{0}]"), AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.positiveSymbol, "[{0}]"), AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.negativeSymbol, "[{0}]"), AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.decimalSymbol, "[{0}]")))), this._validNumFormatRegex
                }}, _dateTimeFormatSpecifiersReplacements: {get: function() {
                    return this._dateTimeFmtSpecReplacements === null && (this._dateTimeFmtSpecReplacements = {}, this._dateTimeFmtSpecReplacements["'shortdate'"] = AppMagic.Globalization.shortDate, this._dateTimeFmtSpecReplacements["'longdate'"] = AppMagic.Globalization.longDate, this._dateTimeFmtSpecReplacements["'shorttime'"] = AppMagic.Globalization.shortTime.replace(" tt", " AM/PM"), this._dateTimeFmtSpecReplacements["'longtime'"] = AppMagic.Globalization.longTime.replace(" tt", " AM/PM"), this._dateTimeFmtSpecReplacements["'shorttime24'"] = AppMagic.Globalization.shortTime.replace(" tt", ""), this._dateTimeFmtSpecReplacements["'longtime24'"] = AppMagic.Globalization.longTime.replace(" tt", ""), this._dateTimeFmtSpecReplacements["'shortdatetime'"] = this._dateTimeFmtSpecReplacements["'shortdate'"] + " " + this._dateTimeFmtSpecReplacements["'shorttime'"], this._dateTimeFmtSpecReplacements["'longdatetime'"] = this._dateTimeFmtSpecReplacements["'longdate'"] + " " + this._dateTimeFmtSpecReplacements["'longtime'"], this._dateTimeFmtSpecReplacements["'shortdatetime24'"] = this._dateTimeFmtSpecReplacements["'shortdate'"] + " " + this._dateTimeFmtSpecReplacements["'shorttime24'"], this._dateTimeFmtSpecReplacements["'longdatetime24'"] = this._dateTimeFmtSpecReplacements["'longdate'"] + " " + this._dateTimeFmtSpecReplacements["'longtime24'"]), this._dateTimeFmtSpecReplacements
                }}, trim: function(source) {
                return source === null ? "" : typeof source != "string" ? null : source.trim().replace(/\s+/g, " ")
            }, trim_T: function(source) {
                return AppMagic.Functions._mapColumn(source, "string", null, AppMagic.Functions.trim)
            }, mid: function(source, start, count) {
                if (typeof start != "number" || !isFinite(start) || start <= 0)
                    return null;
                if (count === null)
                    count = 0;
                else if (typeof count != "number" || !isFinite(count) || count < 0)
                    return null;
                if (source === null)
                    return "";
                else if (typeof source != "string")
                    return null;
                return source.substr(start - 1, count)
            }, mid_T: function(source, start, count) {
                if (source instanceof Array && source.length === 0 || start instanceof Array && start.length === 0 || count instanceof Array && count.length === 0)
                    return [];
                var zipArg0 = source,
                    zipArg1 = start,
                    zipArg2 = count;
                if (source === null || typeof source == "string")
                    zipArg0 = function() {
                        var row = {};
                        return row[AppMagic.Functions._resultColumnName] = source, row
                    };
                else if (!(source instanceof Array))
                    return null;
                if (start === null)
                    zipArg1 = function() {
                        return {idx: start}
                    };
                else if (!(start instanceof Array))
                    if (typeof start == "number" && isFinite(start))
                        zipArg1 = function() {
                            return {idx: start}
                        };
                    else
                        return null;
                if (count === null)
                    zipArg2 = function() {
                        return {cnt: count}
                    };
                else if (!(count instanceof Array))
                    if (typeof count == "number" && isFinite(count))
                        zipArg2 = function() {
                            return {cnt: count}
                        };
                    else
                        return null;
                if (source instanceof Array && source.length === 0 || start instanceof Array && start.length === 0 || count instanceof Array && count.length === 0)
                    return [];
                var operator = function(arg0, arg1, arg2) {
                        var keys0 = Object.keys(arg0);
                        var keys1 = Object.keys(arg1);
                        var keys2 = Object.keys(arg2);
                        var row = {},
                            key = keys0[0];
                        return row[key] = AppMagic.Functions.mid(arg0[key], arg1[keys1[0]], arg2[keys2[0]]), row
                    };
                return AppMagic.Functions._zip(operator, zipArg0, zipArg1, zipArg2)
            }, proper: function(source) {
                return source === null ? "" : typeof source != "string" ? null : source.toLowerCase().replace(/[^a-z][a-z]|^[a-z]/g, function($1) {
                        return $1.toUpperCase()
                    })
            }, proper_T: function(source) {
                return AppMagic.Functions._mapColumn(source, "string", null, AppMagic.Functions.proper)
            }, lower: function(source) {
                return source === null ? "" : typeof source != "string" ? null : source.toLowerCase()
            }, lower_T: function(source) {
                return AppMagic.Functions._mapColumn(source, "string", null, AppMagic.Functions.lower)
            }, upper: function(source) {
                return source === null ? "" : typeof source != "string" ? null : source.toUpperCase()
            }, upper_T: function(source) {
                return AppMagic.Functions._mapColumn(source, "string", null, AppMagic.Functions.upper)
            }, encodeUrl: function(source) {
                return source === null ? "" : typeof source != "string" ? null : encodeURIComponent(source).replace(/[\*\(\)\'\!]/g, function(x) {
                        return "%" + x.charCodeAt(0).toString(16).toUpperCase()
                    })
            }, len: function(source) {
                return source === null ? 0 : typeof source != "string" ? null : source.length
            }, len_T: function(source) {
                return AppMagic.Functions._mapColumn(source, "string", AppMagic.Functions._resultColumnName, AppMagic.Functions.len)
            }, _expandDateTimeFormatSpecifiers: function(format) {
                return Object.keys(AppMagic.Functions._dateTimeFormatSpecifiersReplacements).forEach(function(dateTimeFormat) {
                        var expandedDateTimeFormat = AppMagic.Functions._dateTimeFormatSpecifiersReplacements[dateTimeFormat];
                        format = format.replace(dateTimeFormat, expandedDateTimeFormat)
                    }), format
            }, text: function(number, format) {
                if (number === null)
                    return "";
                if (typeof number == "string")
                    return number;
                if (typeof number != "number" || !isFinite(number))
                    return null;
                if (format === null)
                    return "";
                else if (typeof format == "undefined")
                    format = "0",
                    number !== Math.floor(number) && (format += AppMagic.Globalization.decimalSymbol + "########");
                else if (typeof format != "string")
                    return null;
                format = AppMagic.Functions._expandDateTimeFormatSpecifiers(format);
                var hasDateTimeFmt = format.search(/[dmyhHsfaApP]/) >= 0 || format.search(/utc/i) >= 0,
                    hasNumericFmt = format.search(/[#0]/) >= 0;
                return hasDateTimeFmt ? hasNumericFmt ? null : AppMagic.Functions._dateTimeFormat(number, format) : AppMagic.Functions._numberFormat(number, format)
            }, replace: function(source, start, count, replacement) {
                if (source === null)
                    source = "";
                else if (typeof source != "string")
                    return null;
                if (start === null || typeof start != "number" || !isFinite(start) || start <= 0)
                    return null;
                if (count === null)
                    count = 0;
                else if (typeof count != "number" || !isFinite(count) || count < 0)
                    return null;
                if (replacement === null)
                    replacement = "";
                else if (typeof replacement != "string")
                    return null;
                var startMinusOne = start - 1;
                return source.substr(0, startMinusOne) + replacement + source.substr(startMinusOne + count)
            }, replace_T: function(source, start, count, replacement) {
                if (source instanceof Array && source.length === 0 || start instanceof Array && start.length === 0 || count instanceof Array && count.length === 0 || replacement instanceof Array && replacement.length === 0)
                    return [];
                var zipArg0 = source,
                    zipArg1 = start,
                    zipArg2 = count,
                    zipArg3 = replacement;
                if (source === null)
                    zipArg0 = function() {
                        var row = {};
                        return row[AppMagic.Functions._resultColumnName] = source, row
                    };
                else if (!(source instanceof Array))
                    if (typeof source != "string")
                        return null;
                    else
                        zipArg0 = function() {
                            var row = {};
                            return row[AppMagic.Functions._resultColumnName] = source, row
                        };
                if (start === null)
                    zipArg1 = function() {
                        return {idx: start}
                    };
                else if (!(start instanceof Array))
                    if (typeof start == "number" && isFinite(start))
                        zipArg1 = function() {
                            return {idx: start}
                        };
                    else
                        return null;
                if (count === null)
                    zipArg2 = function() {
                        return {cnt: count}
                    };
                else if (!(count instanceof Array))
                    if (typeof count == "number" && isFinite(count))
                        zipArg2 = function() {
                            return {cnt: count}
                        };
                    else
                        return null;
                if (replacement === null)
                    zipArg3 = function() {
                        return {rep: replacement}
                    };
                else if (!(replacement instanceof Array))
                    if (typeof replacement != "string")
                        return null;
                    else
                        zipArg3 = function() {
                            return {rep: replacement}
                        };
                if (source instanceof Array && source.length === 0 || start instanceof Array && start.length === 0 || count instanceof Array && count.length === 0 || replacement instanceof Array && replacement.length === 0)
                    return [];
                var operator = function(arg0, arg1, arg2, arg3) {
                        var keys0 = Object.keys(arg0);
                        var keys1 = Object.keys(arg1);
                        var keys2 = Object.keys(arg2);
                        var keys3 = Object.keys(arg3);
                        var row = {},
                            key = keys0[0];
                        return row[key] = AppMagic.Functions.replace(arg0[key], arg1[keys1[0]], arg2[keys2[0]], arg3[keys3[0]]), row
                    };
                return AppMagic.Functions._zip(operator, zipArg0, zipArg1, zipArg2, zipArg3)
            }, substitute: function(source, match, replacement, instanceNum) {
                if (source === null)
                    source = "";
                else if (typeof source != "string")
                    return null;
                if (typeof instanceNum == "undefined")
                    instanceNum = -1;
                else if (instanceNum === null || typeof instanceNum != "number" || !isFinite(instanceNum) || instanceNum <= 0)
                    return null;
                if (match === null || match === "")
                    return source;
                else if (typeof match != "string")
                    return null;
                if (replacement === null)
                    replacement = "";
                else if (typeof replacement != "string")
                    return null;
                var idx,
                    idx2,
                    temp;
                if (instanceNum < 0) {
                    for (idx = source.indexOf(match); idx >= 0; )
                        temp = source.substr(0, idx) + replacement,
                        source = source.substr(idx + match.length),
                        idx2 = source.indexOf(match),
                        idx = idx2 < 0 ? idx2 : temp.length + idx2,
                        source = temp + source;
                    return source
                }
                var num = 0;
                for (idx = source.indexOf(match); idx >= 0 && ++num < instanceNum; )
                    idx2 = source.substr(idx + match.length).indexOf(match),
                    idx2 < 0 ? idx = idx2 : idx += match.length + idx2;
                return idx >= 0 && num === instanceNum && (source = source.substr(0, idx) + replacement + source.substr(idx + match.length)), source
            }, hashTags: function(input_text) {
                if (input_text === null || typeof input_text != "string")
                    return null;
                var excludeSpecialCharactersPattern = "[^\\s!-\\/:-@\\[\\]\\^`{-~\\u2018-\\u2026\\u20A0-\\u20BD\\u00A2-\\u00A5\\u060B\\u09F2\\u09F3\\u0AF1\\u0BF9\\u0E3F\\u17DB\\u2133]+",
                    excludeSpecialCharactersExceptHashPattern = '[^\\s!"$-\\/:-@\\[\\]\\^`{-~\\u2018-\\u2026\\u20A0-\\u20BD\\u00A2-\\u00A5\\u060B\\u09F2\\u09F3\\u0AF1\\u0BF9\\u0E3F\\u17DB\\u2133]*',
                    replaceRegEx = new RegExp("#*" + excludeSpecialCharactersPattern + "#+" + excludeSpecialCharactersExceptHashPattern, "g"),
                    matchHashTagRegEx = new RegExp("#" + excludeSpecialCharactersPattern, "g"),
                    text = input_text.replace(replaceRegEx, ""),
                    hashTags = text.match(matchHashTagRegEx);
                return hashTags === null ? [] : AppMagic.AuthoringTool.Runtime.makeColumn(hashTags, AppMagic.AuthoringTool.Runtime.generateId(), AppMagic.Functions._resultColumnName)
            }, _removeTagAndContents: function(text, tag) {
                var replaceOpenTagRegEx = new RegExp("(<\\s*" + tag + "\\s+[\\s\\S]*?>)", "ig"),
                    replaceCloseTagRegEx = new RegExp("(<\\s*\\/\\s*" + tag + "\\s+>)", "ig"),
                    removeTagRegEx = new RegExp("<" + tag + ">[\\s\\S]*<\\/" + tag + ">", "ig");
                return text.replace(replaceOpenTagRegEx, "<" + tag + ">").replace(replaceCloseTagRegEx, "<\/" + tag + ">").replace(removeTagRegEx, "")
            }, _replaceOpenTag: function(text, tag, replaceText) {
                var replaceTagRegEx = new RegExp("(<\\s*" + tag + "\\s+[\\s\\S]*?>)", "ig");
                return text.replace(replaceTagRegEx, replaceText)
            }, plainText: function(input_text) {
                if (input_text === null || typeof input_text != "string")
                    return null;
                var text = input_text.trim();
                if (text.match(/^<\s*xml/i) !== null)
                    return text = text.replace(/<[^>]+>/g, ""), text.trim();
                text = text.replace(/>/g, " >");
                text = AppMagic.Functions._removeTagAndContents(text, "header");
                text = AppMagic.Functions._removeTagAndContents(text, "script");
                text = AppMagic.Functions._removeTagAndContents(text, "style");
                text = text.replace(/<!--[\s\S]*?--\s>/g, "");
                var carriageReturn = "\r",
                    newFeed = "\n",
                    lineBreak = carriageReturn + newFeed,
                    doubleLineBreaks = lineBreak + lineBreak;
                return text = AppMagic.Functions._replaceOpenTag(text, "td", ""), text = AppMagic.Functions._replaceOpenTag(text, "br", lineBreak), text = AppMagic.Functions._replaceOpenTag(text, "li", lineBreak), text = AppMagic.Functions._replaceOpenTag(text, "div", doubleLineBreaks), text = AppMagic.Functions._replaceOpenTag(text, "p", doubleLineBreaks), text = AppMagic.Functions._replaceOpenTag(text, "tr", doubleLineBreaks), text = text.replace(/<[^>]*>/g, ""), text = text.replace(/&bull;|&#8226;|&#x2022;/g, "*").replace(/&lsaquo;|&#8249;|&#x2039;/g, "‹").replace(/&rsaquo;|&#8250;|&#x203A;/g, "›").replace(/&trade;|&#8482;|&#x2122;/g, "™").replace(/&frasl;|&#8260;|&#x2044;/g, "⁄").replace(/&lt;|&#60;|&#x3c;/g, "<").replace(/&gt;|&#62;|&#x3e;/g, ">").replace(/&copy;|&#169;|&#xa9;/g, "©").replace(/&reg;|&#174;|&#xae;/g, "®").replace(/&quot;|&#34;|&#x22;/g, '"').replace(/&ldquo;|&#8220;|&#x201c;/g, "“").replace(/&rdquo;|&#8221;|&#x201d;/g, "”").replace(/&lsquo;|&#8216;|&#x2018;/g, "‘").replace(/&rsquo;|&#8217;|&#x2019;/g, "’").replace(/&amp;|&#38;|&#x26;/g, "&").replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&#160;|&nbsp;|&#xa0;/g, " ").replace(/&cent;|&#162;|&#xa2;/g, "¢").replace(/&pound;|&#163;|&#xa3;/g, "£").replace(/&yen;|&#165;|&#xa5;/g, "¥").replace(/&euro;|&#8364;|&#x20ac;/g, "€"), text = text.replace(/&(.{2,6});/g, ""), text.trim()
            }, substitute_T: function(source, match, replacement, instanceNum) {
                if (source instanceof Array && source.length === 0 || match instanceof Array && match.length === 0 || replacement instanceof Array && replacement.length === 0)
                    return [];
                var zipArg0 = source,
                    zipArg1 = match,
                    zipArg2 = replacement,
                    zipArg3 = instanceNum;
                if (source === null)
                    zipArg0 = function() {
                        var row = {};
                        return row[AppMagic.Functions._resultColumnName] = source, row
                    };
                else if (!(source instanceof Array))
                    if (typeof source != "string")
                        return null;
                    else
                        zipArg0 = function() {
                            var row = {};
                            return row[AppMagic.Functions._resultColumnName] = source, row
                        };
                if (match === null)
                    zipArg1 = function() {
                        return {mat: match}
                    };
                else if (!(match instanceof Array))
                    if (typeof match != "string")
                        return null;
                    else
                        zipArg1 = function() {
                            return {mat: match}
                        };
                if (replacement === null)
                    zipArg2 = function() {
                        return {rep: replacement}
                    };
                else if (!(replacement instanceof Array))
                    if (typeof replacement != "string")
                        return null;
                    else
                        zipArg2 = function() {
                            return {rep: replacement}
                        };
                if (instanceNum === null || typeof instanceNum == "undefined")
                    zipArg3 = function() {
                        return {cnt: instanceNum}
                    };
                else if (!(instanceNum instanceof Array))
                    if (typeof instanceNum == "number" && isFinite(instanceNum))
                        zipArg3 = function() {
                            return {cnt: instanceNum}
                        };
                    else
                        return null;
                if (source instanceof Array && source.length === 0 || match instanceof Array && match.length === 0 || replacement instanceof Array && replacement.length === 0)
                    return [];
                var operator = function(arg0, arg1, arg2, arg3) {
                        var keys0 = Object.keys(arg0);
                        var keys1 = Object.keys(arg1);
                        var keys2 = Object.keys(arg2);
                        var row = {},
                            key = keys0[0];
                        if (typeof arg3 != "undefined") {
                            var keys3 = Object.keys(arg3);
                            row[key] = AppMagic.Functions.substitute(arg0[key], arg1[keys1[0]], arg2[keys2[0]], arg3[keys3[0]])
                        }
                        else
                            row[key] = AppMagic.Functions.substitute(arg0[key], arg1[keys1[0]], arg2[keys2[0]]);
                        return row
                    };
                return typeof instanceNum != "undefined" ? AppMagic.Functions._zip(operator, zipArg0, zipArg1, zipArg2, zipArg3) : AppMagic.Functions._zip(operator, zipArg0, zipArg1, zipArg2)
            }, _numberFormat: function(number, format) {
                if (typeof number != "number" || !isFinite(number) || typeof format != "string")
                    return null;
                var decPointIndex = format.indexOf(AppMagic.Globalization.decimalSymbol),
                    intFormat = decPointIndex < 0 ? format : format.substring(0, decPointIndex),
                    decFormat = decPointIndex < 0 ? "" : format.substring(decPointIndex + 1),
                    isNegative = number < 0,
                    intPart = decPointIndex >= 0 ? isNegative ? Math.ceil(number) : Math.floor(number) : AppMagic.Functions._mathRound(number),
                    decPart = AppMagic.Functions._getDecimalPart(number, intPart);
                decPart >= 1 ? (intPart++, decPart = 0) : decPart <= -1 && (intPart--, decPart = 0);
                var buf = "";
                if (decPointIndex >= 0) {
                    var formattedDecPart = AppMagic.Functions._decPartFormat(Math.abs(decPart), decFormat);
                    intPart += isNegative ? -formattedDecPart.carryover : formattedDecPart.carryover;
                    buf = AppMagic.Globalization.decimalSymbol + formattedDecPart.decPart
                }
                return buf = AppMagic.Functions._intPartFormat(Math.abs(intPart), intFormat) + buf, isNegative && (buf = AppMagic.Globalization.negativeSymbol + buf), buf
            }, _getNextNumberGroup: function(numberGroupSizes, currentNumberGroupIndex, maxGroupSize) {
                var nextGroupIndex = currentNumberGroupIndex + 1,
                    nextGroupSize;
                return nextGroupSize = nextGroupIndex < numberGroupSizes.length ? numberGroupSizes[nextGroupIndex] : numberGroupSizes[numberGroupSizes.length - 1], nextGroupSize === 0 && (nextGroupSize = maxGroupSize), {
                            groupSize: nextGroupSize, groupIndex: nextGroupIndex
                        }
            }, _intPartFormat: function(number, format) {
                if (typeof number != "number" || !isFinite(number) || typeof format != "string")
                    return null;
                (format === "" || format.indexOf("#") < 0 && format.indexOf("0") < 0) && (format += "#");
                format = format.replace(AppMagic.Functions._digitGroupingSymbolRegex, "\x0f");
                format = format.replace(/[\u000F]+/g, "\x0f");
                var hasDigitGroupingSymbol = format.search(/[#0][\u000F][#0]/) >= 0,
                    numberGroupSizes = AppMagic.Globalization.currentLocaleNumberGroupSizes;
                var result = "",
                    len = format.length,
                    temp = number,
                    offs = 0,
                    power = 0,
                    hasDigitFmt = !1,
                    numberGroupIndex = 0,
                    numberGroupSize = numberGroupSizes[numberGroupIndex],
                    numberLen = number.toString().length,
                    maxGroupSize = len > numberLen ? len : numberLen;
                numberGroupSize === 0 && (numberGroupSize = maxGroupSize);
                for (var nextNumberGroup, i = len - 1; i >= 0; i--) {
                    var ch = format[i];
                    switch (ch) {
                        case"#":
                        case"0":
                            hasDigitFmt = !0;
                            (temp > 0 || ch === "0") && (hasDigitGroupingSymbol && power > 0 && power % numberGroupSize == 0 && (result = "\x0f" + result, nextNumberGroup = this._getNextNumberGroup(numberGroupSizes, numberGroupIndex, maxGroupSize), numberGroupIndex = nextNumberGroup.groupIndex, numberGroupSize = nextNumberGroup.groupSize, power = 0), power++, result = (temp % 10).toString() + result, temp = Math.floor(temp / 10), offs = result.length);
                            break;
                        case"\x0f":
                            hasDigitGroupingSymbol || (result = ch + result);
                            break;
                        default:
                            result = ch + result;
                            break
                    }
                }
                if (temp <= 0 || !hasDigitFmt)
                    result = result.replace(/[\u000F]/g, AppMagic.Globalization.digitGroupingSymbol);
                else {
                    var tempPos = result.length - offs,
                        remainingDigits = "";
                    if (hasDigitGroupingSymbol)
                        while (temp > 0)
                            power > 0 && power % numberGroupSize == 0 && (remainingDigits = "\x0f" + remainingDigits, nextNumberGroup = this._getNextNumberGroup(numberGroupSizes, numberGroupIndex, maxGroupSize), numberGroupIndex = nextNumberGroup.groupIndex, numberGroupSize = nextNumberGroup.groupSize, power = 0),
                            power++,
                            remainingDigits = (temp % 10).toString() + remainingDigits,
                            temp = Math.floor(temp / 10);
                    else
                        remainingDigits = temp.toString();
                    result = (result.substring(0, tempPos) + remainingDigits + result.substring(tempPos)).replace(/[\u000F]/g, AppMagic.Globalization.digitGroupingSymbol)
                }
                return result
            }, _decPartFormat: function(number, format) {
                if (typeof number != "number" || !isFinite(number) || typeof format != "string")
                    return null;
                for (var result = {
                        carryover: 0, decPart: ""
                    }, len = format.length, multiplier = 1, moreDigits = !0, epsilon = 1e-7, countDigitFmt = 0, j = 0; j < len; j++)
                    (format[j] === "#" || format[j] === "0") && countDigitFmt++;
                for (var i = 0; i < len; i++)
                    switch (format[i]) {
                        case"#":
                        case"0":
                            if (countDigitFmt--, multiplier = Math.floor(multiplier * 10), moreDigits || format[i] === "0") {
                                var temp = number * multiplier,
                                    intPart = Math.floor(temp);
                                if (countDigitFmt <= 0) {
                                    var roundedIntegerPart = Math.round(temp);
                                    intPart === roundedIntegerPart ? result.decPart += (roundedIntegerPart % 10).toString() : result = AppMagic.Functions._decPartFormatForCarryOver(roundedIntegerPart / multiplier, format[i], i + 1)
                                }
                                else
                                    result.decPart += (intPart % 10).toString();
                                moreDigits = AppMagic.Functions._getDecimalPart(temp) > epsilon;
                                moreDigits || (number = 0)
                            }
                            break;
                        default:
                            result.decPart += format[i];
                            break
                    }
                return result
            }, _decPartFormatForCarryOver: function(number, formattingChar, expectedNumberOfDecimalSpaces) {
                var result = {};
                result.carryover = Math.floor(number);
                var decPointIndex = number.toString().indexOf(".");
                return result.decPart = decPointIndex >= 0 ? number.toString().substring(decPointIndex + 1) : formattingChar === "0" ? "0" : "", formattingChar === "0" && result.decPart.length < expectedNumberOfDecimalSpaces && (result.decPart += "0"), result
            }, _concatenateStrings: function(a, b) {
                return typeof a != "string" || typeof b != "string" ? null : a + b
            }, _concatenateTableAndTable: function(a, b) {
                if (!(a instanceof Array) || !(b instanceof Array))
                    return null;
                for (var tableTableResult = [], alen = a.length, blen = b.length, count = Math.min(alen, blen), l = 0; l < count; l++) {
                    var arow = a[l],
                        brow = b[l];
                    if (typeof arow == "object" && typeof brow == "object") {
                        var aColNames = Object.keys(arow),
                            bColNames = Object.keys(brow);
                        var aColValue = arow[aColNames[0]],
                            bColValue = brow[bColNames[0]];
                        aColValue === null && bColValue === null ? tableTableResult.push({Result: null}) : aColValue === null ? tableTableResult.push({Result: bColValue}) : bColValue === null ? tableTableResult.push({Result: aColValue}) : tableTableResult.push({Result: aColValue + bColValue})
                    }
                }
                if (alen > count)
                    for (var m = count; m < alen; m++)
                        (arow = a[m], typeof arow == "object") && (aColNames = Object.keys(arow), aColValue = arow[aColNames[0]], aColValue === null ? tableTableResult.push({Result: null}) : tableTableResult.push({Result: aColValue}));
                else
                    for (var n = count; n < blen; n++)
                        (brow = b[n], typeof brow == "object") && (bColNames = Object.keys(brow), bColValue = brow[bColNames[0]], bColValue === null ? tableTableResult.push({Result: null}) : tableTableResult.push({Result: bColValue}));
                return tableTableResult
            }, _concatenateStringAndTable: function(a, b) {
                if (typeof a != "string" || !(b instanceof Array))
                    return null;
                for (var stringTableResult = [], l = 0; l < b.length; l++) {
                    var row = b[l];
                    if (typeof row == "object") {
                        var colNames = Object.keys(row);
                        var colValue = row[colNames[0]];
                        colValue === null ? stringTableResult.push({Result: null}) : stringTableResult.push({Result: a + colValue})
                    }
                }
                return stringTableResult
            }, _concatenateTableAndString: function(a, b) {
                if (!(a instanceof Array) || typeof b != "string")
                    return null;
                for (var stringTableResult = [], l = 0; l < a.length; l++) {
                    var row = a[l];
                    if (typeof row == "object") {
                        var colNames = Object.keys(row);
                        var colValue = row[colNames[0]];
                        colValue === null ? stringTableResult.push({Result: null}) : stringTableResult.push({Result: colValue + b})
                    }
                }
                return stringTableResult
            }, concatenate: function(source1, source2) {
                var argLen = arguments.length;
                var result = source1;
                result === null && (result = "");
                for (var num = 1; num < argLen; num++) {
                    var arg = arguments[num];
                    if (typeof result == "string")
                        if (typeof arg == "string")
                            result = AppMagic.Functions._concatenateStrings(result, arg);
                        else if (arg instanceof Array)
                            result = AppMagic.Functions._concatenateStringAndTable(result, arg);
                        else if (arg === null)
                            continue;
                        else
                            return null;
                    else if (result instanceof Array)
                        if (typeof arg == "string")
                            result = AppMagic.Functions._concatenateTableAndString(result, arg);
                        else if (arg instanceof Array)
                            result = AppMagic.Functions._concatenateTableAndTable(result, arg);
                        else if (arg === null)
                            continue;
                        else
                            return null
                }
                return result
            }, left: function(source, count) {
                return source === null || count === null ? "" : typeof source != "string" || typeof count != "number" || !isFinite(count) ? null : source.substring(0, count)
            }, right: function(source, count) {
                if (source === null || count === null)
                    return "";
                if (typeof source != "string" || typeof count != "number" || !isFinite(count))
                    return null;
                var sourceLen = source.length;
                return source.substring(sourceLen - count, sourceLen)
            }, _leftRightCore_TS: function(source, count, opFunc) {
                if (source === null)
                    return [];
                if (!(source instanceof Array) || count !== null && (typeof count != "number" || !isFinite(count)))
                    return null;
                for (var sourceLen = source.length, result = [], i = 0; i < sourceLen; i++) {
                    var newRow = {},
                        row = source[i];
                    if (typeof row != "object")
                        return null;
                    var colNames = Object.keys(row);
                    if (colNames.length !== 1)
                        return null;
                    var colName = colNames[0],
                        value = row[colName];
                    if (value === null)
                        newRow[colName] = null;
                    else if (typeof value != "string")
                        return null;
                    else
                        newRow[colName] = count === null ? "" : opFunc(value);
                    result.push(newRow)
                }
                return result
            }, _leftRightCore_TT: function(source, countTable, opFunc) {
                if (source === null || countTable === null)
                    return [];
                if (!(source instanceof Array) || !(countTable instanceof Array))
                    return null;
                for (var sourceLen = source.length, countTableLen = countTable.length, len = Math.min(sourceLen, countTableLen), result = [], i = 0; i < len; i++) {
                    var newRow = {},
                        row = source[i],
                        countRow = countTable[i];
                    if (typeof row != "object" || typeof countRow != "object")
                        return null;
                    var colNames = Object.keys(countRow);
                    var count = colNames.length !== 1 ? 0 : countRow[colNames[0]];
                    if (colNames = Object.keys(row), colNames.length !== 1)
                        return null;
                    var colName = colNames[0],
                        value = row[colName];
                    if (value === null)
                        newRow[colName] = null;
                    else if (typeof value != "string")
                        return null;
                    else if (count === null)
                        newRow[colName] = "";
                    else if (typeof count == "number" && isFinite(count))
                        newRow[colName] = opFunc(value, count);
                    else
                        return null;
                    result.push(newRow)
                }
                return result
            }, _leftRightCore_ST: function(source, countTable, opFunc) {
                if (source === null || countTable === null)
                    return [];
                if (typeof source != "string" || !(countTable instanceof Array))
                    return null;
                for (var len = countTable.length, result = [], newColName = AppMagic.Functions._resultColumnName, i = 0; i < len; i++) {
                    var row = {};
                    row[newColName] = "";
                    var countRow = countTable[i];
                    if (typeof countRow != "object")
                        return null;
                    var colNames = Object.keys(countRow);
                    var count = colNames.length !== 1 ? 0 : countRow[colNames[0]];
                    if (count === null)
                        row[newColName] = "";
                    else if (typeof count == "number" && isFinite(count))
                        row[newColName] = opFunc(source, count);
                    else
                        return null;
                    result.push(row)
                }
                return result
            }, left_TS: function(source, count) {
                return count === null && (count = 0), AppMagic.Functions._leftRightCore_TS(source, count, function(value) {
                        return value.substring(0, count)
                    })
            }, right_TS: function(source, count) {
                return count === null && (count = 0), AppMagic.Functions._leftRightCore_TS(source, count, function(value) {
                        return value.substring(value.length - count, value.length)
                    })
            }, left_TT: function(source, countTable) {
                return AppMagic.Functions._leftRightCore_TT(source, countTable, function(value, count) {
                        return value.substring(0, count)
                    })
            }, right_TT: function(source, countTable) {
                return AppMagic.Functions._leftRightCore_TT(source, countTable, function(value, count) {
                        return value.substring(value.length - count, value.length)
                    })
            }, left_ST: function(source, countTable) {
                return AppMagic.Functions._leftRightCore_ST(source, countTable, function(value, count) {
                        return value.substring(0, count)
                    })
            }, right_ST: function(source, countTable) {
                return AppMagic.Functions._leftRightCore_ST(source, countTable, function(value, count) {
                        return value.substring(value.length - count, value.length)
                    })
            }, value: function(source) {
                if (source === null)
                    return 0;
                if (typeof source == "number")
                    return source;
                if (typeof source != "string" || source === "")
                    return null;
                var value = AppMagic.Functions._valueRaw(source);
                return isFinite(value) ? value : null
            }, _valueRaw: function(str) {
                if (str === null)
                    return 0;
                if (typeof str != "string")
                    return null;
                str = str.replace(AppMagic.Functions._digitGroupingSymbolRegex, "");
                var isNegative = !1;
                if (!(this._validNumericFormatRegex.test(str) || (isNegative = this._negativeNumberFormatRegex.test(str))))
                    return null;
                var calculatePercentage = str.indexOf("%") >= 0,
                    charsToRemoveRegex = new RegExp(Core.Utility.formatString("({0}|%|\\(|\\)|\\s)", AppMagic.Utility.escapeRegExpString(AppMagic.Globalization.currencySymbol, "[{0}]")), "g");
                str = str.replace(charsToRemoveRegex, "");
                str = str.replace(AppMagic.Globalization.decimalSymbol, ".");
                var value = parseFloat(str);
                return isFinite(value) ? (isNegative && (value = -value), calculatePercentage ? value / 100 : value) : value
            }, find: function(find_text, within_text, start_index) {
                if (typeof start_index == "undefined" && (start_index = 1), start_index === null || typeof start_index != "number" || !isFinite(start_index) || start_index <= 0)
                    return null;
                if (find_text === null)
                    find_text = "";
                else if (typeof find_text != "string")
                    return null;
                if (within_text === null)
                    within_text = "";
                else if (typeof within_text != "string")
                    return null;
                var startMinusOne = start_index - 1;
                if (startMinusOne > within_text.length)
                    return null;
                var index = within_text.indexOf(find_text, startMinusOne);
                return index === -1 ? null : index + 1
            }, find_T: function(find_text, within_text, start_index) {
                var zipArg0 = find_text,
                    zipArg1 = within_text,
                    zipArg2 = start_index;
                if (find_text === null)
                    zipArg0 = function() {
                        return {findText: find_text}
                    };
                else if (!(find_text instanceof Array))
                    if (typeof find_text != "string")
                        return null;
                    else
                        zipArg0 = function() {
                            return {findText: find_text}
                        };
                if (within_text === null)
                    zipArg1 = function() {
                        return {withinText: within_text}
                    };
                else if (!(within_text instanceof Array))
                    if (typeof within_text != "string")
                        return null;
                    else
                        zipArg1 = function() {
                            return {withinText: within_text}
                        };
                if (start_index === null || typeof start_index == "undefined")
                    zipArg2 = function() {
                        return {startindex: start_index}
                    };
                else if (!(start_index instanceof Array))
                    if (typeof start_index == "number" && isFinite(start_index))
                        zipArg2 = function() {
                            return {startindex: start_index}
                        };
                    else
                        return null;
                if (find_text instanceof Array && find_text.length === 0 || within_text instanceof Array && within_text.length === 0 || start_index instanceof Array && start_index.length === 0)
                    return [];
                var operator = function(arg0, arg1, arg2) {
                        var row = {},
                            keys0 = Object.keys(arg0);
                        var keys1 = Object.keys(arg1);
                        var keys2 = Object.keys(arg2);
                        var result = AppMagic.Functions.find(arg0[keys0[0]], arg1[keys1[0]], arg2[keys2[0]]);
                        return row[AppMagic.Functions._resultColumnName] = result, row
                    };
                return AppMagic.Functions._zip(operator, zipArg0, zipArg1, zipArg2)
            }, char: function(number) {
                return number === null || typeof number != "number" || !isFinite(number) || number < 1 || number >= 256 ? null : String.fromCharCode(Math.floor(number))
            }, char_T: function(source) {
                return AppMagic.Functions._mapColumn(source, "number", AppMagic.Functions._resultColumnName, AppMagic.Functions.char)
            }
    })
})();