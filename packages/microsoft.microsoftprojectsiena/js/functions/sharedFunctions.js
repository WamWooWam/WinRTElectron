//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        _resultColumnName: "Result", _nameColumnName: "Name", _addressColumnName: "Address", _defaultComboIterationLimit: 500, _millisecondsPerDay: 864e5, _millisecondsPerMinute: 6e4, _colorTable: {
                aliceblue: 4293982463, antiquewhite: 4294634455, aqua: 4278255615, aquamarine: 4286578644, azure: 4293984255, beige: 4294309340, bisque: 4294960324, black: 4278190080, blanchedalmond: 4294962125, blue: 4278190335, blueviolet: 4287245282, brown: 4289014314, burlywood: 4292786311, cadetblue: 4284456608, chartreuse: 4286578432, chocolate: 4291979550, coral: 4294934352, cornflowerblue: 4284782061, cornsilk: 4294965468, crimson: 4292613180, cyan: 4278255615, darkblue: 4278190219, darkcyan: 4278225803, darkgoldenrod: 4290283019, darkgray: 4289309097, darkgreen: 4278215680, darkkhaki: 4290623339, darkmagenta: 4287299723, darkolivegreen: 4283788079, darkorange: 4294937600, darkorchid: 4288230092, darkred: 4287299584, darksalmon: 4293498490, darkseagreen: 4287609999, darkslateblue: 4282924427, darkslategray: 4281290575, darkturquoise: 4278243025, darkviolet: 4287889619, deeppink: 4294907027, deepskyblue: 4278239231, dimgray: 4285098345, dimgrey: 4285098345, dodgerblue: 4280193279, firebrick: 4289864226, floralwhite: 4294966e3, forestgreen: 4280453922, fuchsia: 4294902015, gainsboro: 4292664540, ghostwhite: 4294506751, gold: 4294956800, goldenrod: 4292519200, gray: 4286611584, green: 4278222848, greenyellow: 4289593135, honeydew: 4293984240, hotpink: 4294928820, indianred: 4291648604, indigo: 4283105410, ivory: 4294967280, khaki: 4293977740, lavender: 4293322490, lavenderblush: 4294963445, lawngreen: 4286381056, lemonchiffon: 4294965965, lightblue: 4289583334, lightcoral: 4293951616, lightcyan: 4292935679, lightgoldenrodyellow: 4294638290, lightgray: 4292072403, lightgreen: 4287688336, lightpink: 4294948545, lightsalmon: 4294942842, lightseagreen: 4280332970, lightskyblue: 4287090426, lightslategray: 4286023833, lightsteelblue: 4289774814, lightyellow: 4294967264, lime: 4278255360, limegreen: 4281519410, linen: 4294635750, magenta: 4294902015, maroon: 4286578688, mediumaquamarine: 4284927402, mediumblue: 4278190285, mediumorchid: 4290401747, mediumpurple: 4287852763, mediumseagreen: 4282168177, mediumslateblue: 4286277870, mediumspringgreen: 4278254234, mediumturquoise: 4282962380, mediumvioletred: 4291237253, midnightblue: 4279834992, mintcream: 4294311930, mistyrose: 4294960353, moccasin: 4294960309, navajowhite: 4294958765, navy: 4278190208, oldlace: 4294833638, olive: 4286611456, olivedrab: 4285238819, orange: 4294944e3, orangered: 4294919424, orchid: 4292505814, palegoldenrod: 4293847210, palegreen: 4288215960, paleturquoise: 4289720046, palevioletred: 4292571283, papayawhip: 4294963157, peachpuff: 4294957753, peru: 4291659071, pink: 4294951115, plum: 4292714717, powderblue: 4289781990, purple: 4286578816, red: 4294901760, rosybrown: 4290547599, royalblue: 4282477025, saddlebrown: 4287317267, salmon: 4294606962, sandybrown: 4294222944, seagreen: 4281240407, seashell: 4294964718, sienna: 4288696877, silver: 4290822336, skyblue: 4287090411, slateblue: 4285160141, slategray: 4285563024, snow: 4294966010, springgreen: 4278255487, steelblue: 4282811060, tan: 4291998860, teal: 4278222976, thistle: 4292394968, tomato: 4294927175, turquoise: 4282441936, violet: 4293821166, wheat: 4294303411, white: 4294967295, whitesmoke: 4294309365, yellow: 4294967040, yellowgreen: 4288335154
            }, _mapColumn: function(source, type, column, valueFunc) {
                if (source === null)
                    return [];
                if (!(source instanceof Array))
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
                    if (value !== null && typeof value !== type)
                        return null;
                    column === null && (column = colName);
                    var rowResult = valueFunc(value);
                    newRow[column] = rowResult;
                    result.push(newRow)
                }
                return result
            }, _zip: function(operator) {
                for (var j, k, info = [], argLen = arguments.length, allGen = !1, len = -1, i = 1; i < argLen; i++) {
                    var arg = arguments[i];
                    var isFunc = typeof arg == "function";
                    var theLen = isFunc ? -1 : arg.length;
                    len = Math.max(len, theLen);
                    info.push({
                        input: arg, isGen: isFunc, len: theLen, emptyRow: null
                    })
                }
                var infoLen = info.length;
                for (i = 0; i < infoLen; i++)
                    info[i].len === -1 && (info[i].len = len);
                var result = [];
                for (i = 0; i < len; i++) {
                    var items = [];
                    for (j = 0; j < infoLen; j++) {
                        var curInfo = info[j];
                        if (i >= curInfo.len)
                            curInfo.emptyRow === null && (curInfo.emptyRow = {}),
                            items.push(curInfo.emptyRow);
                        else {
                            var part = curInfo.isGen ? curInfo.input() : curInfo.input[i];
                            if (items.push(part), curInfo.emptyRow === null) {
                                curInfo.emptyRow = {};
                                var keys = Object.keys(part);
                                for (k = 0; k < keys.length; k++)
                                    curInfo.emptyRow[keys[k]] = null
                            }
                        }
                    }
                    result.push(operator.apply(this, items))
                }
                return result
            }, _roundAndBound: function(num, min, max, round) {
                if (typeof num != "number" || !isFinite(num) || typeof min != "number" || !isFinite(min) || typeof max != "number" || !isFinite(max) || typeof round != "boolean")
                    return null;
                var r = round ? Math.round(num) : num;
                return r < min ? min : r > max ? max : r
            }, colorFade: function(color, fadeDelta) {
                if (color === null || color < -4294967296 || color > 4294967295 || !isFinite(color) || !isFinite(fadeDelta) || fadeDelta === null)
                    return null;
                color = color >>> 0;
                var alpha = color & 4278190080,
                    red = (color & 16711680) >> 16,
                    green = (color & 65280) >> 8,
                    blue = color & 255,
                    interpolator = Math.abs(Core.Utility.clamp(fadeDelta, -1, 1)),
                    inverseInterpolator = 1 - interpolator,
                    targetComponent = (fadeDelta < 0 ? 0 : 255) * interpolator;
                var fadedRed = Math.floor(red * inverseInterpolator + targetComponent),
                    fadedGreen = Math.floor(green * inverseInterpolator + targetComponent),
                    fadedBlue = Math.floor(blue * inverseInterpolator + targetComponent);
                return alpha + (fadedRed << 16) + (fadedGreen << 8) + fadedBlue >>> 0
            }, colorFade_T: function(color, fadeDelta) {
                var zipArg0 = color,
                    zipArg1 = fadeDelta;
                if (color === null || typeof color == "number")
                    zipArg0 = function() {
                        return {color: color}
                    };
                else if (!(color instanceof Array))
                    return null;
                if (fadeDelta === null || typeof fadeDelta == "number")
                    zipArg1 = function() {
                        return {fadeDelta: fadeDelta}
                    };
                else if (!(fadeDelta instanceof Array))
                    return null;
                if (color instanceof Array && color.length === 0 && fadeDelta instanceof Array && fadeDelta.length === 0)
                    return [];
                var operator = function(colorValue, fadeDeltaValue) {
                        var row = {},
                            keys0 = Object.keys(colorValue);
                        var keys1 = Object.keys(fadeDeltaValue);
                        var colorArg = keys0.length === 0 ? null : colorValue[keys0[0]],
                            fadeDeltaArg = keys1.length === 0 ? null : fadeDeltaValue[keys1[0]],
                            result = AppMagic.Functions.colorFade(colorArg, fadeDeltaArg);
                        return row[AppMagic.Functions._resultColumnName] = result, row
                    };
                return AppMagic.Functions._zip(operator, zipArg0, zipArg1)
            }, rGBA: function(red, green, blue, alpha) {
                return typeof red != "number" || !isFinite(red) || typeof green != "number" || !isFinite(green) || typeof blue != "number" || !isFinite(blue) || typeof alpha != "number" || !isFinite(alpha) ? null : (alpha = (AppMagic.Functions._roundAndBound(alpha, 0, 1, !1) * 255 & 255) << 24 >>> 0, !isFinite(alpha)) ? null : (red = AppMagic.Functions._roundAndBound(red, 0, 255, !0) << 16, !isFinite(red)) ? null : (green = AppMagic.Functions._roundAndBound(green, 0, 255, !0) << 8, !isFinite(green)) ? null : (blue = AppMagic.Functions._roundAndBound(blue, 0, 255, !0), !isFinite(blue)) ? null : alpha + red + green + blue
            }, colorValue: function(colorString) {
                if (colorString === null || typeof colorString != "string" || (colorString = colorString.trim().toLowerCase(), colorString === ""))
                    return null;
                var color = AppMagic.Functions._colorTable[colorString];
                return typeof color == "undefined" ? null : color
            }, _getDecimalPart: function(number, intPart) {
                return typeof number != "number" || !isFinite(number) ? null : (typeof intPart == "undefined" && (intPart = number < 0 ? Math.ceil(number) : Math.floor(number)), parseFloat((number - intPart).toFixed(10)))
            }, _mathRound: function(value) {
                if (value === null)
                    return 0;
                if (typeof value != "number" || !isFinite(value))
                    return null;
                var decPart = AppMagic.Functions._getDecimalPart(value);
                return typeof decPart != "number" || !isFinite(decPart) ? null : Math.abs(decPart) === .5 ? value < 0 ? Math.floor(value) : Math.ceil(value) : Math.round(value)
            }, _mergeRecord: function(dest, src) {
                for (var srcKeys = Object.keys(src), srcKeyLen = srcKeys.length, i = 0; i < srcKeyLen; i++) {
                    var key = srcKeys[i];
                    dest[key] = src[key]
                }
                return AppMagic.AuthoringTool.Runtime.assignRowID(dest), dest
            }, getOneColumnTable: function(table, colName) {
                if (table === null || !(table instanceof Array))
                    return null;
                for (var result = [], len = table.length, i = 0; i < len; i++) {
                    var row,
                        item = table[i];
                    if (item === null)
                        row = null;
                    else {
                        row = {};
                        var value = table[i][colName];
                        typeof value == "undefined" && (value = null);
                        row[colName] = value
                    }
                    result.push(row)
                }
                return result
            }, getSafeHTML: function(htmlString, allowLinks) {
                return allowLinks ? html_sanitize(htmlString, function(url) {
                        return url
                    }) : html_sanitize(htmlString)
            }
    })
})();