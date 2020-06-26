//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        combo: function(source) {
            for (var args = [source, AppMagic.Functions._defaultComboIterationLimit], i = 1, argLen = arguments.length; i < argLen; i++)
                args.push(arguments[i]);
            return AppMagic.Functions.comboN.apply(this, args)
        }, comboN: function(source, maxCount) {
                for (var arg, argLen = arguments.length, constraints = [], i = 2; i < argLen; i++)
                    arg = arguments[i],
                    constraints.push(arg);
                return constraints.sort(function(c1, c2) {
                        var size1 = Object.keys(c1.set).length,
                            size2 = Object.keys(c2.set).length;
                        return size1 < size2 ? -1 : size2 < size1 ? 1 : 0
                    }), new WinJS.Promise(function(onComplete, onError, onProgress) {
                        if (source === null || maxCount === null || maxCount <= 0) {
                            onComplete([]);
                            return
                        }
                        var inputKeys = Object.keys(source),
                            keyLen = inputKeys.length;
                        if (keyLen < 1) {
                            onComplete([]);
                            return
                        }
                        var orderedInputKeys = [],
                            orderedInputHash = {},
                            pushKeysFrom = function(keys) {
                                for (var w = 0; w < keys.length; w++) {
                                    var akey = keys[w];
                                    orderedInputHash[akey] || (orderedInputHash[akey] = !0, orderedInputKeys.push(akey))
                                }
                            },
                            constraintLen = constraints.length;
                        for (i = 0; i < constraintLen; i++)
                            pushKeysFrom(Object.keys(constraints[i].set));
                        pushKeysFrom(inputKeys);
                        var isNonEmptyDiff = function(left, right) {
                                var keysLeft = Object.keys(left),
                                    keysRight = Object.keys(right);
                                if (keysLeft.length > keysRight.length)
                                    return !0;
                                for (var y = 0; y < keysLeft.length; y++)
                                    if (!right.hasOwnProperty(keysLeft[y]))
                                        return !0;
                                return !1
                            },
                            enumConstraintsOn = function(mustKey, keys) {
                                for (var fns = [], z = 0; z < constraintLen; z++) {
                                    var constraint = constraints[z].fn,
                                        useSet = constraints[z].set;
                                    useSet.hasOwnProperty(mustKey) && !isNonEmptyDiff(useSet, keys) && fns.push(constraint)
                                }
                                return fns
                            },
                            iterators = [];
                        for (orderedInputHash = {}, i = 0; i < keyLen; i++) {
                            var key = orderedInputKeys[i];
                            orderedInputHash[key] = !0;
                            iterators.push({
                                name: key, input: source[key], inputLen: source[key].length, pos: -1, fns: enumConstraintsOn(key, orderedInputHash)
                            })
                        }
                        var result = [],
                            row = {},
                            count = 0;
                        AppMagic.AuthoringTool.Runtime.assignTableID(result);
                        i = 0;
                        var comprehensionCore = function() {
                                while (i < keyLen) {
                                    if (++count > maxCount) {
                                        onComplete(result);
                                        return
                                    }
                                    var it = iterators[i];
                                    if (++it.pos > it.inputLen) {
                                        if (it.pos = -1, row[it.name] = null, i === 0)
                                            break;
                                        i--;
                                        continue
                                    }
                                    row[it.name] = it.pos < it.inputLen ? it.input[it.pos] : null;
                                    for (var good = !0, x = 0; x < it.fns.length; x++)
                                        if (it.fns[x](row) !== !0) {
                                            good = !1;
                                            break
                                        }
                                    good && i++
                                }
                                if (i < keyLen) {
                                    onComplete(result);
                                    return
                                }
                                result.push(AppMagic.Utility.clone(row, !0));
                                i--;
                                setTimeout(comprehensionCore, 0)
                            };
                        comprehensionCore()
                    })
            }
    })
})();