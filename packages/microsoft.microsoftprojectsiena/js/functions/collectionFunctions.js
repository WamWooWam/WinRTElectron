//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        clear: function(collection) {
            if (collection === null || !(collection instanceof Array))
                return null;
            if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                return collection._meta.dataSourceProvider.clear(collection);
            AppMagic.Utility.releaseBlobs(collection);
            collection.length = 0;
            var dependency = AppMagic.AuthoringTool.Runtime.getCollectionName(collection);
            if (typeof dependency == "string" && dependency !== "")
                AppMagic.AuthoringTool.Runtime.onDataSourceChanged(dependency);
            return collection
        }, _removeItemsFromRuntimeCollection: function(collection, itemsToRemoveIndices) {
                if (itemsToRemoveIndices.length !== 0) {
                    for (var destIndex = 0, srcIndex = 0; srcIndex < collection.length; srcIndex++)
                        itemsToRemoveIndices[srcIndex] ? AppMagic.Utility.releaseBlobs(collection[srcIndex]) : collection[destIndex++] = collection[srcIndex];
                    collection.splice(destIndex, collection.length - destIndex);
                    var dependency = AppMagic.AuthoringTool.Runtime.getCollectionName(collection);
                    if (typeof dependency == "string" && dependency !== "")
                        AppMagic.AuthoringTool.Runtime.onDataSourceChanged(dependency)
                }
            }, _getRemoveIfArguments: function(args) {
                var collection = args[0];
                if (collection === null || !(collection instanceof Array))
                    return null;
                for (var predicates = [], i = 1, len = args.length; i < len; i++) {
                    if (args[i] === null)
                        return null;
                    predicates.push(args[i])
                }
                return {
                        collection: collection, predicates: predicates
                    }
            }, removeIf: function() {
                var removeIfArguments = AppMagic.Functions._getRemoveIfArguments(arguments);
                if (removeIfArguments === null)
                    return null;
                var collection = removeIfArguments.collection,
                    predicates = removeIfArguments.predicates;
                if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                    return collection._meta.dataSourceProvider.removeIf(predicates);
                for (var collectionLen = collection.length, row, itemsToRemoveIndices = [], rowIndex = collectionLen - 1; rowIndex >= 0; rowIndex--)
                    if (row = collection[rowIndex], typeof row == "object") {
                        for (var satisfiesAll = !0, i = 0, len = predicates.length; i < len; i++) {
                            var predicate = predicates[i];
                            if (predicate(row) !== !0) {
                                satisfiesAll = !1;
                                break
                            }
                        }
                        satisfiesAll && (itemsToRemoveIndices[rowIndex] = !0)
                    }
                return AppMagic.Functions._removeItemsFromRuntimeCollection(collection, itemsToRemoveIndices), collection
            }, removeIfAsync: function() {
                var removeIfArguments = AppMagic.Functions._getRemoveIfArguments(arguments);
                if (removeIfArguments === null)
                    return WinJS.Promise.as(null);
                var collection = removeIfArguments.collection,
                    predicates = removeIfArguments.predicates;
                if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                    return collection._meta.dataSourceProvider.removeIfAsync(predicates);
                for (var collectionLen = collection.length, tablePromises = [], itemsToRemoveIndices = [], rowIndex = collectionLen - 1; rowIndex >= 0; rowIndex--)
                    (function fnThatHandlesRow(index) {
                        var rowPromise = WinJS.Promise.wrap(),
                            row = collection[index];
                        if (typeof row == "object") {
                            for (var satisfiesAll = !0, predicateIndex = 0; predicateIndex < predicates.length; predicateIndex++) {
                                var fnThatHandlesPredicateFailure = function(error) {
                                        satisfiesAll = !1
                                    },
                                    fnThatHandlesPredicate = function(pred) {
                                        if (!satisfiesAll)
                                            return WinJS.Promise.as(null);
                                        var fnThatHandlesPredicateSuccess = function(predResult) {
                                                predResult !== !0 && (satisfiesAll = !1)
                                            };
                                        return WinJS.Promise.as(pred(row)).then(fnThatHandlesPredicateSuccess, fnThatHandlesPredicateFailure)
                                    }.bind(this, predicates[predicateIndex]);
                                rowPromise = rowPromise.then(fnThatHandlesPredicate, fnThatHandlesPredicateFailure)
                            }
                            var fnThatHandlesRemovalFailure = function(){},
                                fnThatHandlesRemoval = function() {
                                    satisfiesAll && (itemsToRemoveIndices[index] = !0)
                                };
                            tablePromises.push(rowPromise.then(fnThatHandlesRemoval, fnThatHandlesRemovalFailure))
                        }
                    })(rowIndex);
                var successFn = function() {
                        return AppMagic.Functions._removeItemsFromRuntimeCollection(collection, itemsToRemoveIndices), WinJS.Promise.as(collection)
                    },
                    errorFn = function() {
                        return WinJS.Promise.as(null)
                    };
                return WinJS.Promise.join(tablePromises).then(successFn, errorFn)
            }, remove: function(collection, item, all) {
                if (collection === null || !(collection instanceof Array))
                    return null;
                var argLen = arguments.length;
                all = arguments[argLen - 1];
                for (var source = [], i = 1; i < argLen - 1; i++)
                    source.push(arguments[i]);
                return AppMagic.Functions.removeAll(collection, source, all)
            }, removeAll: function(collection, source, all) {
                if (collection === null)
                    return null;
                if (source === null)
                    return collection;
                if (!(collection instanceof Array) || !(source instanceof Array))
                    return null;
                var sourceLen = source.length;
                if (sourceLen === 0)
                    return collection;
                var collectionLen = collection.length;
                if (collectionLen === 0)
                    return collection;
                var removeAllMatches = all.toLowerCase() === "all";
                if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                    return collection._meta.dataSourceProvider.removeAll(collection, source, removeAllMatches);
                var changed = !1,
                    i,
                    rowIndex,
                    row,
                    sourceRow;
                if (removeAllMatches) {
                    for (rowIndex = collectionLen - 1; rowIndex >= 0; rowIndex--)
                        if (row = collection[rowIndex], typeof row == "object")
                            for (i = 0; i < sourceLen; i++)
                                if (sourceRow = source[i], AppMagic.Utility.deepCompare(row, sourceRow)) {
                                    AppMagic.Utility.releaseBlobs(row);
                                    collection.splice(rowIndex, 1);
                                    changed = !0;
                                    break
                                }
                }
                else
                    for (i = 0; i < sourceLen; i++)
                        for (sourceRow = source[i], rowIndex = 0; rowIndex < collectionLen; rowIndex++)
                            if ((row = collection[rowIndex], typeof row == "object") && AppMagic.Utility.deepCompare(row, sourceRow)) {
                                AppMagic.Utility.releaseBlobs(row);
                                collection.splice(rowIndex, 1);
                                changed = !0;
                                break
                            }
                if (changed) {
                    var dependency = AppMagic.AuthoringTool.Runtime.getCollectionName(collection);
                    if (typeof dependency == "string" && dependency !== "")
                        AppMagic.AuthoringTool.Runtime.onDataSourceChanged(dependency)
                }
                return collection
            }, loadData: function(errorContext, target, filename) {
                if (target === null || filename === null || !(target instanceof Array))
                    return WinJS.Promise.as(null);
                var runtime = AppMagic.AuthoringTool.Runtime;
                if (typeof filename != "string" || !AppMagic.Utility.isValidFileName(filename))
                    return runtime.reportRuntimeError(errorContext, Core.Utility.formatString(AppMagic.Strings.InvalidLoadSaveDataFilenameErrorMsg, AppMagic.Utility.invalidFileNameChars)), WinJS.Promise.as(null);
                var id = runtime.getDocumentId();
                id !== "" && (filename = id + "." + filename);
                var store = WinJS.Application.local,
                    crypto = Windows.Security.Cryptography,
                    loadFile = function(exists) {
                        return exists ? store.readText(filename, "") : (runtime.reportRuntimeError(errorContext, AppMagic.Strings.NonExistentFileErrorMsg), WinJS.Promise.wrapError())
                    },
                    decryptData = function(encData) {
                        if (!encData)
                            return WinJS.Promise.wrapError();
                        var encBuffer = crypto.CryptographicBuffer.decodeFromBase64String(encData);
                        return crypto.DataProtection.DataProtectionProvider().unprotectAsync(encBuffer)
                    },
                    validateLoadResult = function(result) {
                        return result.error ? WinJS.Promise.wrapError() : result
                    },
                    loadZip = function(buffer) {
                        return runtime.loadZip(buffer, filename)
                    },
                    collect = function(result) {
                        if (result === null)
                            return null;
                        var dataToCollect;
                        if (result instanceof Array)
                            dataToCollect = result;
                        else {
                            if (result.data === null)
                                return null;
                            dataToCollect = result.data
                        }
                        return AppMagic.Functions.collect(target, dataToCollect)
                    },
                    errorFn = function() {
                        return null
                    };
                return store.exists(filename).then(loadFile).then(decryptData).then(loadZip).then(validateLoadResult).then(collect, errorFn)
            }, saveData: function(errorContext, source, filename) {
                if (source === null || filename === null || !(source instanceof Array))
                    return WinJS.Promise.as(null);
                var runtime = AppMagic.AuthoringTool.Runtime;
                if (typeof filename != "string" || !AppMagic.Utility.isValidFileName(filename))
                    return runtime.reportRuntimeError(errorContext, Core.Utility.formatString(AppMagic.Strings.InvalidLoadSaveDataFilenameErrorMsg, AppMagic.Utility.invalidFileNameChars)), WinJS.Promise.as(null);
                var id = runtime.getDocumentId();
                id !== "" && (filename = id + "." + filename);
                var store = WinJS.Application.local,
                    crypto = Windows.Security.Cryptography,
                    encryptData = function(base64String) {
                        var buffer = crypto.CryptographicBuffer.decodeFromBase64String(base64String);
                        return crypto.DataProtection.DataProtectionProvider("LOCAL=user").protectAsync(buffer)
                    },
                    saveFile = function(encBuffer) {
                        var encData = crypto.CryptographicBuffer.encodeToBase64String(encBuffer);
                        return store.writeText(filename, encData)
                    },
                    validateZipResult = function(result) {
                        return result.error ? WinJS.Promise.wrapError() : result.base64String
                    },
                    saveComplete = function() {
                        return source
                    },
                    saveError = function() {
                        return null
                    };
                return runtime.createZip(source, "").then(validateZipResult).then(encryptData).then(saveFile).then(saveComplete, saveError)
            }, _getUpdateIfArguments: function(args) {
                var collection = args[0];
                if (collection === null || !(collection instanceof Array))
                    return null;
                for (var predicateAndItemFunctions = [], i = 1, len = args.length; i < len; i += 2) {
                    if (args[i] === null || args[i + 1] === null)
                        return null;
                    predicateAndItemFunctions.push({
                        predicate: args[i], itemFunction: args[i + 1]
                    })
                }
                return {
                        predicateAndItemFunctions: predicateAndItemFunctions, collection: collection
                    }
            }, updateIf: function() {
                var updateIfArguments = AppMagic.Functions._getUpdateIfArguments(arguments);
                if (updateIfArguments === null)
                    return null;
                var collection = updateIfArguments.collection,
                    predicateAndItemFunctions = updateIfArguments.predicateAndItemFunctions;
                if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                    return collection._meta.dataSourceProvider.updateIf(predicateAndItemFunctions);
                for (var collectionLen = collection.length, changed = !1, row, rowIndex = 0; rowIndex < collectionLen; rowIndex++)
                    if (row = collection[rowIndex], typeof row == "object") {
                        for (var replacement = null, predicateIndex = 0; predicateIndex < predicateAndItemFunctions.length; predicateIndex++) {
                            var condFunc = predicateAndItemFunctions[predicateIndex].predicate;
                            if (condFunc(row) === !0) {
                                replacement = predicateAndItemFunctions[predicateIndex].itemFunction;
                                break
                            }
                        }
                        if (replacement !== null) {
                            var clonedOriginalRow = AppMagic.Utility.clone(row, !0),
                                newRow = replacement(clonedOriginalRow);
                            var mergedRow = AppMagic.Functions._mergeRecord(row, newRow);
                            AppMagic.Utility.addRefBlobs(mergedRow);
                            AppMagic.Utility.releaseBlobs(clonedOriginalRow);
                            changed = !0
                        }
                    }
                if (changed) {
                    var dependency = AppMagic.AuthoringTool.Runtime.getCollectionName(collection);
                    if (typeof dependency == "string" && dependency !== "")
                        AppMagic.AuthoringTool.Runtime.onDataSourceChanged(dependency)
                }
                return collection
            }, updateIfAsync: function() {
                var updateIfArguments = AppMagic.Functions._getUpdateIfArguments(arguments);
                if (updateIfArguments === null)
                    return WinJS.Promise.as(null);
                var collection = updateIfArguments.collection,
                    predicateAndItemFunctions = updateIfArguments.predicateAndItemFunctions;
                if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                    return collection._meta.dataSourceProvider.updateIfAsync(updateIfArguments.predicateAndItemFunctions);
                for (var tablePromises = [], collectionLen = collection.length, changed = !1, rowIndex = 0; rowIndex < collectionLen; rowIndex++)
                    var fnThatHandlesRow = function() {
                            var row = collection[rowIndex];
                            if (typeof row == "object") {
                                for (var rowPromise = WinJS.Promise.wrap(), replacement = null, predicateIndex = 0; predicateIndex < predicateAndItemFunctions.length; predicateIndex++) {
                                    var fnThatHandlesConditionFnFailure = function(error){},
                                        fnThatHandlesConditionFn = function(condFunc, replacementFunc) {
                                            if (replacement !== null)
                                                return WinJS.Promise.as(null);
                                            var fnThatHandlesConditionFnSuccess = function(result) {
                                                    result === !0 && (replacement = replacementFunc)
                                                };
                                            return WinJS.Promise.as(condFunc(row)).then(fnThatHandlesConditionFnSuccess, fnThatHandlesConditionFnFailure)
                                        }.bind(this, predicateAndItemFunctions[predicateIndex].predicate, predicateAndItemFunctions[predicateIndex].itemFunction);
                                    rowPromise = rowPromise.then(fnThatHandlesConditionFn, fnThatHandlesConditionFnFailure)
                                }
                                var fnThatHandlesReplacementSuccess = function(clonedOriginalRow, newRow) {
                                        if (typeof newRow == "object" && typeof clonedOriginalRow == "object") {
                                            var mergedRow = AppMagic.Functions._mergeRecord(row, newRow);
                                            AppMagic.Utility.addRefBlobs(mergedRow);
                                            AppMagic.Utility.releaseBlobs(clonedOriginalRow);
                                            changed = !0
                                        }
                                    },
                                    fnThatHandlesReplacementFailure = function(){},
                                    fnThatHandlesReplacement = function() {
                                        if (replacement !== null) {
                                            var cloned = AppMagic.Utility.clone(row, !0);
                                            return WinJS.Promise.as(replacement(cloned)).then(fnThatHandlesReplacementSuccess.bind(this, cloned), fnThatHandlesReplacementFailure)
                                        }
                                        else
                                            return WinJS.Promise.as(null)
                                    };
                                rowPromise = rowPromise.then(fnThatHandlesReplacement, fnThatHandlesReplacementFailure);
                                tablePromises.push(rowPromise)
                            }
                        }();
                var successFn = function() {
                        if (changed) {
                            var dependency = collection[AppMagic.AuthoringTool.Runtime.collectionNameProperty];
                            if (typeof dependency == "string" && dependency !== "")
                                AppMagic.AuthoringTool.Runtime.onDataSourceChanged(dependency)
                        }
                        return WinJS.Promise.as(collection)
                    },
                    errorFn = function() {
                        return WinJS.Promise.as(null)
                    };
                return WinJS.Promise.join(tablePromises).then(successFn, errorFn)
            }, _getCollectArguments: function(args, hasFieldNameArg) {
                var collection = args[0];
                if (collection === null || !(collection instanceof Array))
                    return null;
                for (var items = [], i = 1, len = args.length - 1; i < len; i++)
                    items.push(args[i]);
                var fieldName;
                hasFieldNameArg ? fieldName = args[args.length - 1] : items.push(args[args.length - 1]);
                var result = {
                        collection: collection, items: items
                    };
                return hasFieldNameArg && (result.fieldName = fieldName), result
            }, collect: function() {
                var collectArguments = AppMagic.Functions._getCollectArguments(arguments, !1);
                if (collectArguments === null)
                    return null;
                var collection = collectArguments.collection,
                    items = collectArguments.items;
                if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                    return collection._meta.dataSourceProvider.collect(collection, items);
                for (var row, changed = !1, i = 0, len = items.length; i < len; i++) {
                    var item = items[i];
                    if (item === null)
                        continue;
                    else if (item instanceof Array)
                        for (var j = 0, srclen = item.length; j < srclen; j++)
                            (row = item[j], row !== null && typeof row == "object") && (row = AppMagic.Utility.clone(row, !0), AppMagic.Utility.addRefBlobs(row), AppMagic.AuthoringTool.Runtime.assignRowID(row), collection.push(row));
                    else
                        typeof item == "object" && (row = AppMagic.Utility.clone(item, !0), AppMagic.Utility.addRefBlobs(row), AppMagic.AuthoringTool.Runtime.assignRowID(row), collection.push(row));
                    changed = !0
                }
                if (!changed)
                    return collection;
                var dependency = AppMagic.AuthoringTool.Runtime.getCollectionName(collection);
                if (typeof dependency == "string" && dependency !== "")
                    AppMagic.AuthoringTool.Runtime.onDataSourceChanged(dependency);
                return collection
            }, collect_S: function() {
                var collectArguments = AppMagic.Functions._getCollectArguments(arguments, !0);
                if (collectArguments === null)
                    return null;
                var collection = collectArguments.collection,
                    items = collectArguments.items,
                    fieldName = collectArguments.fieldName;
                if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                    return collection._meta.dataSourceProvider.collect_S(collection, items, fieldName);
                for (var changed = !1, i = 0, len = items.length; i < len; i++) {
                    var item = items[i],
                        row = {};
                    row[fieldName] = item;
                    AppMagic.Utility.addRefBlobs(row);
                    AppMagic.AuthoringTool.Runtime.assignRowID(row);
                    collection.push(row);
                    changed = !0
                }
                if (!changed)
                    return collection;
                var dependency = AppMagic.AuthoringTool.Runtime.getCollectionName(collection);
                if (typeof dependency == "string" && dependency !== "")
                    AppMagic.AuthoringTool.Runtime.onDataSourceChanged(dependency);
                return collection
            }, update: function(collection, oldItem, newItem, all) {
                if (collection === null || !(collection instanceof Array))
                    return null;
                var updateAll = (all || "").toLowerCase() === "all";
                if (AppMagic.AuthoringTool.Runtime.hasDataSourceProvider(collection))
                    return collection._meta.dataSourceProvider.update(oldItem, newItem, updateAll);
                for (var changed = !1, collectionLen = collection.length, i = 0; i < collectionLen; i++) {
                    var row = collection[i];
                    if (AppMagic.Utility.deepCompare(row, oldItem)) {
                        var newRow = AppMagic.Utility.clone(newItem, !0);
                        if (newRow !== null && (AppMagic.Utility.addRefBlobs(newRow), AppMagic.AuthoringTool.Runtime.assignRowID(newRow)), collection[i] = newRow, AppMagic.Utility.releaseBlobs(row), changed = !0, !updateAll)
                            break
                    }
                }
                if (changed) {
                    var dependency = AppMagic.AuthoringTool.Runtime.getCollectionName(collection);
                    if (typeof dependency == "string" && dependency !== "")
                        AppMagic.AuthoringTool.Runtime.onDataSourceChanged(dependency)
                }
                return collection
            }, refresh: function(source) {
                if (source === null || typeof source != "object")
                    return WinJS.Promise.as(null);
                var dsName = AppMagic.AuthoringTool.Runtime.getDataSourceName(source);
                return dsName !== null ? AppMagic.AuthoringTool.Runtime.refreshDataSource(dsName) : WinJS.Promise.as(null)
            }, table: function(row) {
                var result = [],
                    argLen = arguments.length;
                if (argLen === 0)
                    return result;
                for (var i = 0; i < argLen; i++) {
                    var newRow = arguments[i];
                    newRow !== null && (newRow = AppMagic.Utility.clone(newRow, !0));
                    result.push(newRow)
                }
                return result
            }
    })
})();