//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        _sumCalculator: function(count, sum) {
            return count === 0 ? 0 : sum
        }, _averageCalculator: function(count, sum) {
                return count === 0 ? null : sum / count
            }, _sumAverageCore: function(source, calculatorFunc, valueFunc) {
                var count = 0,
                    sum = 0,
                    sourceLen = source.length;
                if (valueFunc !== null && typeof valueFunc != "function")
                    return null;
                for (var i = 0; i < sourceLen; i++) {
                    var value = valueFunc === null ? source[i] : valueFunc(source[i]);
                    if (value !== null) {
                        if (typeof value != "number" || !isFinite(value))
                            return null;
                        sum += value;
                        count++
                    }
                }
                return calculatorFunc(count, sum)
            }, _sumAverage_TCoreAsync: function(source, calculatorFunc, valueFunc) {
                var count = 0,
                    sum = 0,
                    sourceLen = source.length;
                if (typeof valueFunc != "function")
                    return WinJS.Promise.as(null);
                for (var tablePromises = [], isError = !1, i = 0; i < sourceLen; i++) {
                    if (isError)
                        break;
                    var functionThatHandlesValueFuncSuccess = function(value) {
                            value !== null && (typeof value == "number" && isFinite(value) ? (sum += value, count++) : isError = !0)
                        },
                        functionThatHandlesValueFuncFailure = function(error) {
                            isError = !0
                        };
                    tablePromises.push(valueFunc(source[i]).then(functionThatHandlesValueFuncSuccess, functionThatHandlesValueFuncFailure))
                }
                var successFn = function() {
                        return isError ? WinJS.Promise.as(null) : WinJS.Promise.as(calculatorFunc(count, sum))
                    },
                    errorFn = function() {
                        return WinJS.Promise.as(null)
                    };
                return WinJS.Promise.join(tablePromises).then(successFn, errorFn)
            }, sqrt: function(arg) {
                return arg === null ? 0 : typeof arg != "number" || !isFinite(arg) ? null : Math.sqrt(arg)
            }, sqrt_T: function(source) {
                return source === null ? null : AppMagic.Functions._mapColumn(source, "number", null, AppMagic.Functions.sqrt)
            }, abs: function(arg) {
                return arg === null ? 0 : typeof arg != "number" || !isFinite(arg) ? null : Math.abs(arg)
            }, abs_T: function(source) {
                return source === null ? null : AppMagic.Functions._mapColumn(source, "number", null, AppMagic.Functions.abs)
            }, rand: function() {
                return Math.random()
            }, average: function(arg) {
                return AppMagic.Functions._sumAverageCore(arguments, AppMagic.Functions._averageCalculator, null)
            }, average_T: function(source, valueFunc) {
                return source === null ? null : !(source instanceof Array) || source.length === 0 || typeof valueFunc != "function" ? null : AppMagic.Functions._sumAverageCore(source, AppMagic.Functions._averageCalculator, valueFunc)
            }, average_TAsync: function(source, valueFunc) {
                return source === null ? WinJS.Promise.as(null) : !(source instanceof Array) || source.length === 0 || typeof valueFunc != "function" ? WinJS.Promise.as(null) : AppMagic.Functions._sumAverage_TCoreAsync(source, AppMagic.Functions._averageCalculator, valueFunc)
            }, sum: function(arg) {
                return AppMagic.Functions._sumAverageCore(arguments, AppMagic.Functions._sumCalculator, null)
            }, sum_T: function(source, valueFunc) {
                return source === null ? null : !(source instanceof Array) || typeof valueFunc != "function" ? null : AppMagic.Functions._sumAverageCore(source, AppMagic.Functions._sumCalculator, valueFunc)
            }, sum_TAsync: function(source, valueFunc) {
                return source === null ? WinJS.Promise.as(null) : !(source instanceof Array) || typeof valueFunc != "function" ? WinJS.Promise.as(null) : AppMagic.Functions._sumAverage_TCoreAsync(source, AppMagic.Functions._sumCalculator, valueFunc)
            }, _stdevCore: function(source, valueFunc) {
                var variance = AppMagic.Functions._varianceCore(source, valueFunc);
                return variance !== null && isFinite(variance) ? Math.sqrt(variance) : variance
            }, stdevP: function(arg) {
                return AppMagic.Functions._stdevCore(arguments, null)
            }, stdevP_T: function(source, valueFunc) {
                return source === null ? null : !(source instanceof Array) || typeof valueFunc != "function" ? null : AppMagic.Functions._stdevCore(source, valueFunc)
            }, stdevP_TAsync: function(source, valueFunc) {
                if (source === null || !(source instanceof Array) || source.length === 0 || typeof valueFunc != "function")
                    return WinJS.Promise.as(null);
                var successFn = function(variance) {
                        return variance === null || typeof variance != "number" || !isFinite(variance) ? WinJS.Promise.as(null) : WinJS.Promise.as(Math.sqrt(variance))
                    },
                    failureFn = function(error) {
                        return WinJS.Promise.as(null)
                    };
                return AppMagic.Functions._varianceCore_TAsync(source, valueFunc).then(successFn, failureFn)
            }, _varianceCalculator: function(count, sum, sumOfSquares) {
                if (count === 0)
                    return null;
                if (count > 1) {
                    var avg = sum / count;
                    return sumOfSquares / count - avg * avg
                }
                return 0
            }, _varianceCore: function(source, valueFunc) {
                for (var count = 0, sum = 0, sumOfSquares = 0, sourceLen = source.length, i = 0; i < sourceLen; i++) {
                    var value = valueFunc === null ? source[i] : valueFunc(source[i]);
                    if (value !== null)
                        if (typeof value == "number" && isFinite(value))
                            sum += value,
                            sumOfSquares += value * value,
                            count++;
                        else
                            return null
                }
                var variance = AppMagic.Functions._varianceCalculator(count, sum, sumOfSquares);
                return variance
            }, _varianceCore_TAsync: function(source, valueFunc) {
                if (!(source instanceof Array) || source.length === 0)
                    return WinJS.Promise.as(null);
                for (var count = 0, sum = 0, sumOfSquares = 0, sourceLen = source.length, tablePromises = [], isError = !1, i = 0; i < sourceLen; i++) {
                    if (isError)
                        break;
                    var functionThatHandlesValueFuncSuccess = function(value) {
                            value !== null && (typeof value == "number" && isFinite(value) ? (sum += value, sumOfSquares += value * value, count++) : isError = !0)
                        },
                        functionThatHandlesValueFuncFailure = function(error) {
                            isError = !0
                        };
                    tablePromises.push(valueFunc(source[i]).then(functionThatHandlesValueFuncSuccess, functionThatHandlesValueFuncFailure))
                }
                var successFn = function() {
                        if (isError)
                            return WinJS.Promise.as(null);
                        var variance = AppMagic.Functions._varianceCalculator(count, sum, sumOfSquares);
                        return WinJS.Promise.as(variance)
                    },
                    errorFn = function() {
                        return WinJS.Promise.as(null)
                    };
                return WinJS.Promise.join(tablePromises).then(successFn, errorFn)
            }, varP: function(arg) {
                return AppMagic.Functions._varianceCore(arguments, null)
            }, varP_T: function(source, valueFunc) {
                return source === null ? null : !(source instanceof Array) || typeof valueFunc != "function" ? null : AppMagic.Functions._varianceCore(source, valueFunc)
            }, varP_TAsync: function(source, valueFunc) {
                return source === null ? WinJS.Promise.as(null) : !(source instanceof Array) || source.length === 0 || typeof valueFunc != "function" ? WinJS.Promise.as(null) : AppMagic.Functions._varianceCore_TAsync(source, valueFunc)
            }, _minMaxCore: function(source, wantMin, valueFunc) {
                if (source === null || source.length === 0)
                    return null;
                for (var sourceLen = source.length, curValue, isError = !1, i = 0; i < sourceLen; i++)
                    if (curValue = valueFunc === null ? source[i] : valueFunc(source[i]), curValue !== null) {
                        if (typeof curValue == "number")
                            break;
                        isError = !0
                    }
                if (isError)
                    return null;
                if (i >= sourceLen)
                    return 0;
                var extremeValue = curValue;
                for (i++; i < sourceLen; i++) {
                    var value = valueFunc === null ? source[i] : valueFunc(source[i]);
                    value !== null && typeof value == "number" && (wantMin ? value < extremeValue : value > extremeValue) && (extremeValue = value)
                }
                return extremeValue
            }, _minMax_TCoreAsync: function(source, wantMin, valueFunc) {
                if (!(source instanceof Array) || source.length === 0)
                    return WinJS.Promise.as(null);
                for (var sourceLen = source.length, extremeValue, tablePromises = [], isError = !1, i = 0; i < sourceLen; i++) {
                    var functionThatHandlesValueFuncSuccess = function(value) {
                            typeof value == "number" ? typeof extremeValue != "undefined" ? (wantMin && value < extremeValue || !wantMin && value > extremeValue) && (extremeValue = value) : extremeValue = value : value !== null && (isError = !0)
                        },
                        functionThatHandlesValueFuncFailure = function() {
                            isError = !0
                        };
                    tablePromises.push(valueFunc(source[i]).then(functionThatHandlesValueFuncSuccess, functionThatHandlesValueFuncFailure))
                }
                var successFn = function() {
                        return isError ? WinJS.Promise.as(null) : typeof extremeValue == "undefined" ? WinJS.Promise.as(0) : WinJS.Promise.as(extremeValue)
                    },
                    errorFn = function() {
                        return WinJS.Promise.as(null)
                    };
                return WinJS.Promise.join(tablePromises).then(successFn, errorFn)
            }, max: function(arg) {
                return AppMagic.Functions._minMaxCore(arguments, !1, null)
            }, max_T: function(source, valueFunc) {
                return source === null ? null : !(source instanceof Array) || source.length === 0 || typeof valueFunc != "function" ? null : AppMagic.Functions._minMaxCore(source, !1, valueFunc)
            }, max_TAsync: function(source, valueFunc) {
                return source === null ? WinJS.Promise.as(null) : !(source instanceof Array) || source.length === 0 || typeof valueFunc != "function" ? WinJS.Promise.as(null) : AppMagic.Functions._minMax_TCoreAsync(source, !1, valueFunc)
            }, min: function(arg) {
                return AppMagic.Functions._minMaxCore(arguments, !0, null)
            }, min_T: function(source, valueFunc) {
                return source === null ? null : !(source instanceof Array) || source.length === 0 || typeof valueFunc != "function" ? null : AppMagic.Functions._minMaxCore(source, !0, valueFunc)
            }, min_TAsync: function(source, valueFunc) {
                return source === null ? WinJS.Promise.as(null) : !(source instanceof Array) || source.length === 0 || typeof valueFunc != "function" ? WinJS.Promise.as(null) : AppMagic.Functions._minMax_TCoreAsync(source, !0, valueFunc)
            }, round: function(number, digits) {
                if (number === null)
                    return 0;
                if (typeof number != "number" || !isFinite(number))
                    return null;
                if (digits === 0 || digits === null)
                    return AppMagic.Functions._mathRound(number);
                if (typeof digits != "number" || !isFinite(digits))
                    return null;
                var multiplier = Math.pow(10, digits < 0 ? Math.ceil(digits) : Math.floor(digits));
                return isFinite(multiplier) ? Math.round(number * multiplier) / multiplier : AppMagic.Functions._mathRound(number)
            }, roundUp: function(number, digits) {
                if (number === null)
                    return 0;
                if (typeof number != "number" || !isFinite(number))
                    return null;
                if (digits === 0 || digits === null)
                    return number < 0 ? Math.floor(number) : Math.ceil(number);
                if (typeof digits != "number" || !isFinite(digits))
                    return null;
                var multiplier = Math.pow(10, digits < 0 ? Math.ceil(digits) : Math.floor(digits));
                return isFinite(multiplier) ? number < 0 ? Math.floor(number * multiplier) / multiplier : Math.ceil(number * multiplier) / multiplier : number < 0 ? Math.floor(number) : Math.ceil(number)
            }, roundDown: function(number, digits) {
                if (number === null)
                    return 0;
                if (typeof number != "number" || !isFinite(number))
                    return null;
                if (digits === 0 || digits === null)
                    return number < 0 ? Math.ceil(number) : Math.floor(number);
                if (typeof digits != "number" || !isFinite(digits))
                    return null;
                var multiplier = Math.pow(10, digits < 0 ? Math.ceil(digits) : Math.floor(digits));
                return isFinite(multiplier) ? number < 0 ? Math.ceil(number * multiplier) / multiplier : Math.floor(number * multiplier) / multiplier : number < 0 ? Math.ceil(number) : Math.floor(number)
            }, round_T: function(input, digitInput) {
                return AppMagic.Functions._roundXCore_T(input, digitInput, AppMagic.Functions.round)
            }, roundUp_T: function(input, digitInput) {
                return AppMagic.Functions._roundXCore_T(input, digitInput, AppMagic.Functions.roundUp)
            }, roundDown_T: function(input, digitInput) {
                return AppMagic.Functions._roundXCore_T(input, digitInput, AppMagic.Functions.roundDown)
            }, _roundXCore_T: function(input, digits, roundFunc) {
                var source = input,
                    digitSource = digits;
                if (input !== null && !(input instanceof Array) && (typeof input != "number" || !isFinite(input)) || digits !== null && !(digits instanceof Array) && (typeof digits != "number" || !isFinite(digits)))
                    return null;
                input !== null && input instanceof Array || (source = function() {
                    var row = {};
                    return row[AppMagic.Functions._resultColumnName] = input, row
                });
                digits !== null && digits instanceof Array || (digitSource = function() {
                    return {N: digits}
                });
                var operator = function(left, right) {
                        var leftKeys = Object.keys(left);
                        var rightKeys = Object.keys(right);
                        var row = {},
                            leftKey = leftKeys[0];
                        return row[leftKey] = roundFunc(left[leftKey], right[rightKeys[0]]), row
                    };
                return AppMagic.Functions._zip(operator, source, digitSource)
            }
    })
})();