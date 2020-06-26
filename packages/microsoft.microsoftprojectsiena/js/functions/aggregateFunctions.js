//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        firstN: function(source, count) {
            if ((arguments.length < 2 && (count = 1), source === null || count === null) || !(source instanceof Array) || typeof count != "number" || !isFinite(count) || source.length === 0 && count > 0)
                return null;
            count = Math.min(Math.max(0, Math.floor(count)), source.length);
            for (var result = [], i = 0; i < count; i++)
                result.push(AppMagic.Utility.clone(source[i], !0));
            return AppMagic.Utility.copyId(source, result), result
        }, lastN: function(source, count) {
                if (arguments.length < 2 && (count = 1), source === null || count === null)
                    return null;
                var sourceLen;
                if (!(source instanceof Array) || typeof count != "number" || !isFinite(count) || (sourceLen = source.length) === 0 && count > 0)
                    return null;
                count = Math.min(Math.max(0, Math.floor(count)), sourceLen);
                for (var result = [], i = sourceLen - count; i < sourceLen; i++)
                    result.push(AppMagic.Utility.clone(source[i], !0));
                return AppMagic.Utility.copyId(source, result), result
            }, first: function(source) {
                return source === null ? null : !(source instanceof Array) || source.length === 0 ? null : source[0]
            }, last: function(source) {
                if (source === null)
                    return null;
                var sourceLen;
                return !(source instanceof Array) || (sourceLen = source.length) === 0 ? null : source[sourceLen - 1]
            }, _getComparator: function(comparatorId, ascending) {
                var boolComparator = function(a, b) {
                        return ascending ? a ? b ? 0 : 1 : b ? -1 : 0 : a ? b ? 0 : -1 : b ? 1 : 0
                    },
                    stringComparator = function(a, b) {
                        var comparisonResult = a.localeCompare(b, AppMagic.Globalization.currentLocaleName);
                        return ascending ? comparisonResult : comparisonResult === 0 ? 0 : -comparisonResult
                    },
                    numericComparator = function(a, b) {
                        return ascending ? a - b : b - a
                    },
                    comparators = [boolComparator, numericComparator, stringComparator];
                return comparators[comparatorId % 3]
            }, _sortOrderCreator: function(valueProducer, comparator) {
                return function(x, y) {
                        var a = valueProducer(x),
                            b = valueProducer(y);
                        if (a === null)
                            return b === null ? 0 : 1;
                        else if (b === null)
                            return -1;
                        return comparator(a, b)
                    }
            }, sort: function(source, valueFunc, comparatorId, order) {
                if (source === null || !(source instanceof Array) || typeof valueFunc != "function")
                    return null;
                var ascending = !0;
                typeof order == "string" && order.toLowerCase() === "descending" && (ascending = !1);
                var comparator = AppMagic.Functions._getComparator(comparatorId, ascending);
                var result = AppMagic.Utility.clone(source, !0),
                    valueProducer = function(x) {
                        return valueFunc(x)
                    },
                    sortFunction = AppMagic.Functions._sortOrderCreator(valueProducer, comparator);
                return result.sort(sortFunction), AppMagic.Utility.copyId(source, result), result
            }, sortAsync: function(source, valueFunc, comparatorId, order) {
                if (source === null || !(source instanceof Array) || typeof valueFunc != "function")
                    return WinJS.Promise.as(null);
                var ascending = !0;
                typeof order == "string" && order.toLowerCase() === "descending" && (ascending = !1);
                var comparator = AppMagic.Functions._getComparator(comparatorId, ascending);
                var result;
                if (source.length === 0)
                    return result = AppMagic.Utility.clone(source, !0), AppMagic.Utility.copyId(source, result), WinJS.Promise.as(result);
                for (var isError = !1, valueToProjectionMapping = {}, tablePromises = [], i = 0, sourceLen = source.length; i < sourceLen; i++) {
                    if (isError)
                        break;
                    (function fnThatHandlesRow() {
                        var row = source[i],
                            fnThatHandlesValueFuncFailure = function(error) {
                                isError = !0
                            },
                            fnThatHandlesValueFuncSuccess = function(valueFuncResult) {
                                valueToProjectionMapping[JSON.stringify(row)] = valueFuncResult
                            };
                        tablePromises.push(valueFunc(row).then(fnThatHandlesValueFuncSuccess, fnThatHandlesValueFuncFailure))
                    })()
                }
                var successFn = function() {
                        if (isError)
                            return WinJS.Promise.as(null);
                        result = AppMagic.Utility.clone(source, !0);
                        var valueProducer = function(x) {
                                return valueToProjectionMapping[JSON.stringify(x)]
                            },
                            sortFunction = AppMagic.Functions._sortOrderCreator(valueProducer, comparator);
                        return result.sort(sortFunction), AppMagic.Utility.copyId(source, result), WinJS.Promise.as(result)
                    },
                    errorFn = function() {
                        return WinJS.Promise.as(null)
                    };
                return WinJS.Promise.join(tablePromises).then(successFn, errorFn)
            }, shuffle: function(source) {
                if (source === null || !(source instanceof Array))
                    return null;
                for (var retval = AppMagic.Utility.clone(source, !0), i = 0, len = source.length; i < len; i++) {
                    var otherIndex = Math.floor(Math.random() * len),
                        temp = retval[i];
                    retval[i] = retval[otherIndex];
                    retval[otherIndex] = temp
                }
                return retval
            }, isEmpty: function(source) {
                return source !== null && source instanceof Array && source.length === 0
            }, lookUp: function(source, predFunc, projectionFunc) {
                if (source === null || !(source instanceof Array) || typeof predFunc != "function" || typeof projectionFunc != "function")
                    return null;
                for (var i = 0, len = source.length; i < len; i++) {
                    var row = source[i];
                    if (typeof row == "object" && predFunc(row) === !0)
                        return projectionFunc(row)
                }
                return null
            }, lookUpAsync: function(source, predFunc, projectionFunc) {
                if (source === null || !(source instanceof Array) || typeof predFunc != "function" || typeof projectionFunc != "function")
                    return WinJS.Promise.as(null);
                for (var matchFound = !1, returnValue = null, promiseQueue = new Core.Promise.PromiseQueue, promise = WinJS.Promise.wrap(), i = 0, len = source.length; i < len; i++)
                    (function() {
                        var row = source[i];
                        if (typeof row == "object") {
                            var fnThatHandlesProjFuncSuccess = function(retVal) {
                                    returnValue = retVal
                                },
                                fnThatHandlesProjFuncFailure = function(error){},
                                fnThatHandlesPredFuncSuccess = function(result) {
                                    return result === !0 ? (matchFound = !0, WinJS.Promise.as(projectionFunc(row)).then(fnThatHandlesProjFuncSuccess, fnThatHandlesProjFuncFailure)) : WinJS.Promise.as(null)
                                },
                                fnThatHandlesPredFuncFailure = function(error){},
                                fnThatHandlesPredFunc = function() {
                                    return matchFound ? (promiseQueue.cancelAll(), WinJS.Promise.as(null)) : WinJS.Promise.as(predFunc(row)).then(fnThatHandlesPredFuncSuccess, fnThatHandlesPredFuncFailure)
                                }.bind(this);
                            promise = promiseQueue.pushJob(function() {
                                return WinJS.Promise.wrap().then(fnThatHandlesPredFunc, fnThatHandlesPredFuncFailure)
                            }.bind(this))
                        }
                    })();
                var successFn = function() {
                        return WinJS.Promise.as(returnValue)
                    }.bind(this),
                    errorFn = function(error) {
                        return Core.Utility.isCanceledError(error) && promiseQueue.cancelAll(), WinJS.Promise.as(returnValue)
                    }.bind(this);
                return promise.then(successFn, errorFn)
            }, dropColumns: function(source, columnName) {
                if (source === null || !(source instanceof Array))
                    return null;
                for (var result = [], argLen = arguments.length, numEmpty = 0, i = 0, sourceLen = source.length; i < sourceLen; i++) {
                    var row = source[i];
                    if (typeof row == "object") {
                        var newRow = AppMagic.Utility.clone(row, !0);
                        if (newRow !== null)
                            for (var j = 1; j < argLen; j++) {
                                var colName = arguments[j];
                                typeof colName == "string" && delete newRow[colName]
                            }
                        (newRow === null || Object.keys(newRow).length === 0) && numEmpty++;
                        result.push(newRow)
                    }
                }
                return numEmpty === sourceLen ? [] : result
            }, showColumns: function(source, columnName) {
                if (source === null || !(source instanceof Array))
                    return null;
                for (var result = [], argLen = arguments.length, numEmpty = 0, i = 0, sourceLen = source.length; i < sourceLen; i++) {
                    var row = source[i];
                    if (row === null) {
                        result.push(null);
                        numEmpty++;
                        continue
                    }
                    if (typeof row == "object") {
                        for (var newRow = {}, j = 1; j < argLen; j++) {
                            var colName = arguments[j];
                            var fieldValue = row[colName];
                            typeof fieldValue != "undefined" && (newRow[colName] = fieldValue)
                        }
                        Object.keys(newRow).length === 0 && numEmpty++;
                        result.push(newRow)
                    }
                }
                return numEmpty === sourceLen ? [] : result
            }, renameColumns: function(source, oldColumnName, newColumnName) {
                if (source === null || !(source instanceof Array))
                    return null;
                if (oldColumnName === newColumnName)
                    return AppMagic.Utility.clone(source, !0);
                for (var result = [], sourceLen = source.length, i = 0; i < sourceLen; i++) {
                    var row = source[i];
                    if (row === null) {
                        result.push(null);
                        continue
                    }
                    if (typeof row == "object") {
                        var newRow = AppMagic.Utility.clone(row, !0),
                            fieldValue = newRow[oldColumnName];
                        typeof fieldValue != "undefined" && (newRow[newColumnName] = fieldValue, delete newRow[oldColumnName]);
                        result.push(newRow)
                    }
                }
                return result
            }, filter: function(source, predicate) {
                if (source === null || !(source instanceof Array) || typeof predicate != "function")
                    return null;
                var result = [],
                    sourceLen = source.length,
                    i,
                    j,
                    item;
                if (arguments.length === 2) {
                    for (i = 0; i < sourceLen; i++)
                        item = source[i],
                        predicate(item) === !0 && result.push(item);
                    return AppMagic.Utility.copyId(source, result), result
                }
                var argsLen = arguments.length;
                for (j = 1; j < argsLen; j++)
                    if (typeof arguments[j] != "function")
                        return null;
                for (j = 0; j < sourceLen; j++) {
                    item = source[j];
                    var take = !0;
                    for (i = 1; i < argsLen; i++) {
                        var pred = arguments[i];
                        if (pred(item) !== !0) {
                            take = !1;
                            break
                        }
                    }
                    take && result.push(item)
                }
                return AppMagic.Utility.copyId(source, result), result
            }, _filterCountIfAsyncCore: function(source, wantFilter, predicate) {
                if (source === null || !(source instanceof Array) || typeof predicate != "function")
                    return WinJS.Promise.as(null);
                for (var i, argsLen = arguments.length, sourceLen = source.length, j = 2; j < argsLen; j++)
                    if (typeof arguments[j] != "function")
                        return WinJS.Promise.as(null);
                var result = [],
                    count = 0,
                    args = arguments,
                    promiseQueue = new Core.Promise.PromiseQueue,
                    promise = WinJS.Promise.wrap();
                for (i = 0; i < sourceLen; i++)
                    (function() {
                        var item = source[i],
                            take = !0;
                        for (j = 2; j < argsLen; j++) {
                            var fnThatHandlesPredicateFailure = function(error) {
                                    take = !1
                                },
                                fnThatHandlesPredicate = function(pred) {
                                    if (!take)
                                        return WinJS.Promise.as(null);
                                    var fnThatHandlesPredicateSuccess = function(predResult) {
                                            predResult !== !0 && (take = !1)
                                        };
                                    return WinJS.Promise.as(pred(item)).then(fnThatHandlesPredicateSuccess, fnThatHandlesPredicateFailure)
                                };
                            promise = promiseQueue.pushJob(function(pred) {
                                return WinJS.Promise.wrap().then(fnThatHandlesPredicate.bind(this, pred), fnThatHandlesPredicateFailure.bind(this))
                            }.bind(this, args[j]))
                        }
                        var fnThatHandlesRowExecutionSuccess = function() {
                                take && (wantFilter ? result.push(item) : count++)
                            }.bind(this),
                            fnThatHandlesRowExecutionFailure = function(error){}.bind(this);
                        promise = promiseQueue.pushJob(function() {
                            return WinJS.Promise.wrap().then(fnThatHandlesRowExecutionSuccess, fnThatHandlesRowExecutionFailure)
                        }.bind(this))
                    })();
                var successFn = function() {
                        return wantFilter ? WinJS.Promise.as(result) : WinJS.Promise.as(count)
                    }.bind(this),
                    errorFn = function(error) {
                        return Core.Utility.isCanceledError(error) && promiseQueue.cancelAll(), WinJS.Promise.as(null)
                    };
                return promise.then(successFn, errorFn)
            }, filterAsync: function(source, predicate) {
                if (source === null)
                    return WinJS.Promise.as(null);
                for (var args = [], i = 0; i < arguments.length; i++)
                    args.push(arguments[i]);
                return args.splice(1, 0, !0), AppMagic.Functions._filterCountIfAsyncCore.apply(this, args)
            }, count: function(source) {
                if (source === null || !(source instanceof Array))
                    return null;
                for (var count = 0, sourceLen = source.length, i = 0; i < sourceLen; i++) {
                    var row = source[i];
                    if (row !== null) {
                        var colNames = Object.keys(row);
                        colNames.length === 1 && typeof row[colNames[0]] == "number" && count++
                    }
                }
                return count
            }, countA: function(source) {
                if (source === null || !(source instanceof Array))
                    return null;
                for (var count = 0, sourceLen = source.length, i = 0; i < sourceLen; i++) {
                    var row = source[i];
                    if (row !== null) {
                        var colNames = Object.keys(row);
                        if (colNames.length === 1) {
                            var value = row[colNames[0]];
                            typeof value != "undefined" && value !== null && count++
                        }
                    }
                }
                return count
            }, countRows: function(source) {
                return source === null ? null : (source instanceof Array) ? source.length : null
            }, countIf: function(source, predicate) {
                if (source === null || !(source instanceof Array) || typeof predicate != "function")
                    return null;
                var count = 0,
                    i,
                    j,
                    argsLen = arguments.length,
                    sourceLen = source.length;
                if (argsLen === 2) {
                    for (i = 0; i < sourceLen; i++)
                        predicate(source[i]) === !0 && count++;
                    return count
                }
                for (j = 1; j < argsLen; j++)
                    if (typeof arguments[j] != "function")
                        return null;
                for (i = 0; i < sourceLen; i++) {
                    var row = source[i],
                        take = !0;
                    for (j = 1; j < argsLen; j++)
                        if (predicate = arguments[j], predicate(row) !== !0) {
                            take = !1;
                            break
                        }
                    take && count++
                }
                return count
            }, countIfAsync: function(source, predicate) {
                if (source === null)
                    return WinJS.Promise.as(null);
                for (var args = [], i = 0; i < arguments.length; i++)
                    args.push(arguments[i]);
                return args.splice(1, 0, !1), AppMagic.Functions._filterCountIfAsyncCore.apply(this, args)
            }, addColumns: function(source, columnName, columnValueFunc) {
                if (source === null || !(source instanceof Array) || typeof columnName != "string" || typeof columnValueFunc != "function")
                    return null;
                for (var result = [], argLen = arguments.length, i = 0; i < source.length; i++) {
                    var row = source[i];
                    if (typeof row != "object")
                        return null;
                    var newRow = AppMagic.Utility.clone(row, !0);
                    if (AppMagic.Utility.addRefBlobs(newRow), newRow !== null)
                        for (var j = 1; j < argLen; j += 2) {
                            var colName = arguments[j];
                            if (typeof colName != "string")
                                return null;
                            var colFunc = arguments[j + 1];
                            if (typeof colFunc == "function")
                                newRow[colName] = colFunc(row);
                            else if (colFunc === null)
                                newRow[colName] = null;
                            else
                                return null
                        }
                    result.push(newRow)
                }
                return result
            }, addColumnsAsync: function(source, columnName, columnValueFunc) {
                if (source === null || !(source instanceof Array) || typeof columnName != "string" || typeof columnValueFunc != "function")
                    return WinJS.Promise.as(null);
                for (var argsLen = arguments.length, args = arguments, result = [], isError = !1, promiseQueue = new Core.Promise.PromiseQueue, promise = WinJS.Promise.wrap(), i = 0, sourceLen = source.length; i < sourceLen; i++)
                    (function() {
                        var row = source[i];
                        if (typeof row != "object") {
                            isError = !0;
                            return
                        }
                        var newRow = AppMagic.Utility.clone(row, !0);
                        AppMagic.Utility.addRefBlobs(newRow);
                        for (var j = 1; j < argsLen; j += 2) {
                            var fnThatHandlesPredicateFailure = function(error) {
                                    isError = !0
                                },
                                fnThatHandlesPredicate = function(colName, pred) {
                                    if (isError)
                                        return WinJS.Promise.as(null);
                                    if (typeof colName != "string" || typeof pred != "function" && pred !== null)
                                        return isError = !0, WinJS.Promise.as(null);
                                    var fnThatHandlesPredicateSuccess = function(predResult) {
                                            newRow !== null && (newRow[colName] = predResult)
                                        };
                                    return WinJS.Promise.as(typeof pred == "function" ? pred(row) : null).then(fnThatHandlesPredicateSuccess, fnThatHandlesPredicateFailure)
                                };
                            promise = promiseQueue.pushJob(function(colName, pred) {
                                return WinJS.Promise.wrap().then(fnThatHandlesPredicate.bind(this, colName, pred), fnThatHandlesPredicateFailure.bind(this))
                            }.bind(this, args[j], args[j + 1]))
                        }
                        var fnThatHandlesRowExecutionSuccess = function() {
                                isError || result.push(newRow)
                            },
                            fnThatHandlesRowExecutionFailure = function(error) {
                                isError = !0
                            }.bind(this);
                        promise = promiseQueue.pushJob(function() {
                            return WinJS.Promise.wrap().then(fnThatHandlesRowExecutionSuccess, fnThatHandlesRowExecutionFailure)
                        }.bind(this))
                    })();
                var successFn = function() {
                        return isError ? WinJS.Promise.as(null) : WinJS.Promise.as(result)
                    },
                    errorFn = function(error) {
                        return Core.Utility.isCanceledError(error) && promiseQueue.cancelAll(), WinJS.Promise.as(null)
                    };
                return promise.then(successFn.bind(this), errorFn.bind(this))
            }, isBlank: function(expression) {
                return expression === null || typeof expression == "undefined" || expression === ""
            }, distinct: function(source, valueFunc) {
                if (source === null || !(source instanceof Array) || typeof valueFunc != "function")
                    return null;
                if (source.length === 0)
                    return [];
                for (var result = [], hashSet = {}, sourceLen = source.length, item, i = 0; i < sourceLen; i++) {
                    var row = source[i];
                    if (typeof row == "object" && (item = valueFunc(row), !hashSet.hasOwnProperty(item))) {
                        hashSet[item] = !0;
                        var newRow = {};
                        newRow[AppMagic.Functions._resultColumnName] = item;
                        result.push(newRow)
                    }
                }
                return result.length === 0 ? null : result
            }, distinctAsync: function(source, valueFunc) {
                if (source === null || !(source instanceof Array) || typeof valueFunc != "function")
                    return WinJS.Promise.as(null);
                var sourceLen;
                if ((sourceLen = source.length) === 0)
                    return WinJS.Promise.as([]);
                for (var hashSet = {}, result = [], promiseQueue = new Core.Promise.PromiseQueue, promise = WinJS.Promise.wrap(), i = 0; i < sourceLen; i++)
                    (function fnThatHandlesRow() {
                        var row = source[i];
                        if (typeof row == "object") {
                            var functionThatHandlesValueFuncSuccess = function(item) {
                                    if (!hashSet.hasOwnProperty(item)) {
                                        hashSet[item] = !0;
                                        var newRow = {};
                                        newRow[AppMagic.Functions._resultColumnName] = item;
                                        result.push(newRow)
                                    }
                                },
                                functionThatHandlesValueFuncFailure = function(){},
                                functionThatHandlesValueFunc = function() {
                                    return valueFunc(row).then(functionThatHandlesValueFuncSuccess, functionThatHandlesValueFuncFailure)
                                };
                            promise = promiseQueue.pushJob(function() {
                                return WinJS.Promise.wrap().then(functionThatHandlesValueFunc, functionThatHandlesValueFuncFailure)
                            }.bind(this))
                        }
                    })();
                var successFn = function() {
                        return result.length === 0 ? WinJS.Promise.as(null) : WinJS.Promise.as(result)
                    },
                    errorFn = function(error) {
                        return Core.Utility.isCanceledError(error) && promiseQueue.cancelAll(), WinJS.Promise.as(null)
                    };
                return promise.then(successFn.bind(this), errorFn.bind(this))
            }, concat: function(source, valueFunc) {
                if (source === null || !(source instanceof Array) || typeof valueFunc != "function")
                    return null;
                for (var result = "", sourceLen = source.length, i = 0; i < sourceLen; i++) {
                    var value = valueFunc(source[i]);
                    if (value !== null) {
                        if (typeof value != "string")
                            return null;
                        result += value
                    }
                }
                return result
            }, concatAsync: function(source, valueFunc) {
                if (source === null || !(source instanceof Array) || typeof valueFunc != "function")
                    return WinJS.Promise.as(null);
                var sourceLen = source.length;
                if (sourceLen === 0)
                    return WinJS.Promise.as("");
                for (var tablePromises = [], tableResults = [], isError = !1, i = 0; i < sourceLen; i++) {
                    if (isError)
                        break;
                    var successHandler = function(index, value) {
                            value !== null && (typeof value == "string" ? tableResults[index] = value : isError = !0)
                        },
                        failureHandler = function(error) {
                            isError = !0
                        };
                    tablePromises.push(valueFunc(source[i]).then(successHandler.bind(this, i), failureHandler))
                }
                var successFn = function() {
                        return isError ? WinJS.Promise.as(null) : WinJS.Promise.as(tableResults.join(""))
                    },
                    errorFn = function() {
                        return WinJS.Promise.as(null)
                    };
                return WinJS.Promise.join(tablePromises).then(successFn, errorFn)
            }
    })
})();