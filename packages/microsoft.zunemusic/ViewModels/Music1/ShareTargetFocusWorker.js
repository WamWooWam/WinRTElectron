/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Share;
            (function(Share) {
                var HTMLFocusWorker = (function() {
                        function HTMLFocusWorker() {
                            this._focusRank = 0;
                            this._defaultpatternDistanceForgiveness = 10;
                            this._defaultPatternThreshold = 5;
                            this._patternDistanceForgiveness = this._defaultpatternDistanceForgiveness;
                            this._patternThreshold = this._defaultPatternThreshold;
                            addEventListener("message", this._onMessage.bind(this))
                        }
                        HTMLFocusWorker.prototype._onMessage = function(args) {
                            var inputString = (args && args.data);
                            var input = null;
                            try {
                                input = JSON.parse(inputString)
                            }
                            catch(error) {
                                input = null
                            }
                            if (input && input.data && input.type === "input") {
                                if (input.data.htmlData) {
                                    this._data = input.data.htmlData;
                                    this._tagWeights = null
                                }
                                if (typeof input.data.focusRank === "number" && !isNaN(input.data.focusRank))
                                    this._focusRank = input.data.focusRank;
                                if (typeof input.data.patternDistanceForgiveness === "number" && !isNaN(input.data.patternDistanceForgiveness))
                                    this._patternDistanceForgiveness = input.data.patternDistanceForgiveness;
                                if (typeof input.data.patternThreshold === "number" && !isNaN(input.data.patternThreshold))
                                    this._patternThreshold = input.data.patternThreshold;
                                this._postMessage(this._focus(this._focusRank))
                            }
                        };
                        HTMLFocusWorker.prototype._postMessage = function(result) {
                            postMessage(JSON.stringify({
                                type: "result", data: result
                            }), null)
                        };
                        HTMLFocusWorker.prototype._focus = function(ranking) {
                            var _this = this;
                            if (!this._data || !this._data.tagMap || !this._data.stringOffsets || !this._data.strings || ranking < 0)
                                return {
                                        strings: this._data && this._data.strings, stringOffsets: this._data && this._data.stringOffsets, stringMap: this._data && this._data.stringMap, focusOffset: 0
                                    };
                            var strings = this._data.strings;
                            var stringOffsets = this._data.stringOffsets;
                            var stringMap = this._data.stringMap;
                            var tagMap = this._data.tagMap;
                            var foundPatternLength = 0;
                            var foundPattern = false;
                            var tagDistances;
                            var consecutiveTags;
                            var currentRanking;
                            var currentDistanceBuckets;
                            var positions;
                            var focusableTagEntries;
                            var bestDistance;
                            var currentTagWeight;
                            var result = {
                                    strings: [], stringOffsets: [], stringMap: {}, focusOffset: 0
                                };
                            var tagWeights = this._gatherWeights();
                            ranking = Math.max(0, Math.min(ranking, tagWeights.length - 1));
                            currentRanking = -1;
                            for (var i = 0; i < tagWeights.length; i++) {
                                currentTagWeight = tagWeights[i];
                                if (foundPattern && currentTagWeight.weight !== tagWeights[i - 1].weight)
                                    break;
                                tagDistances = [];
                                positions = tagMap[currentTagWeight.tag] || [];
                                consecutiveTags = null;
                                bestDistance = -1;
                                positions.forEach(function(tagPosition, index, source) {
                                    var forwardDistance = 0;
                                    var backwardDistance = 0;
                                    if (index + 1 >= source.length)
                                        forwardDistance = strings.length - tagPosition.stringsIndex;
                                    else
                                        forwardDistance = source[index + 1].stringsIndex - tagPosition.stringsIndex;
                                    if (index - 1 < 0)
                                        backwardDistance = tagPosition.stringsIndex;
                                    else
                                        backwardDistance = tagPosition.stringsIndex - source[index - 1].stringsIndex;
                                    var distanceDifferentThanLast = backwardDistance !== forwardDistance && bestDistance > 0 && Math.abs(bestDistance - forwardDistance) > _this._patternDistanceForgiveness;
                                    if (!consecutiveTags) {
                                        consecutiveTags = [];
                                        currentRanking++;
                                        bestDistance = forwardDistance;
                                        var storeDistance = tagDistances[forwardDistance];
                                        if (!storeDistance)
                                            storeDistance = tagDistances[forwardDistance] = [];
                                        if (storeDistance.length && storeDistance[storeDistance.length - 1].length === 0)
                                            consecutiveTags = storeDistance[storeDistance.length - 1];
                                        else
                                            storeDistance.push(consecutiveTags)
                                    }
                                    if (forwardDistance > 0 && currentRanking >= ranking)
                                        consecutiveTags.push(tagPosition);
                                    if (distanceDifferentThanLast) {
                                        consecutiveTags = null;
                                        bestDistance = -1
                                    }
                                });
                                for (var distance in tagDistances) {
                                    currentDistanceBuckets = tagDistances[distance] || [];
                                    currentDistanceBuckets.forEach(function(entry, index, source) {
                                        if ((!foundPattern) && (foundPatternLength <= 0 || foundPatternLength < entry.length) && (entry.length >= _this._patternThreshold)) {
                                            focusableTagEntries = [entry];
                                            foundPatternLength = entry.length
                                        }
                                        else if (focusableTagEntries && foundPatternLength === entry.length)
                                            focusableTagEntries.push(entry)
                                    })
                                }
                                foundPattern = !!focusableTagEntries
                            }
                            var startClip = -1;
                            var endClip = -1;
                            var focusedStrings = null;
                            if (focusableTagEntries) {
                                startClip = strings.length;
                                endClip = 0;
                                focusableTagEntries.forEach(function(entry, index, source) {
                                    var newStartClip = entry[0].stringsIndex;
                                    var newEndClip = entry[entry.length - 1].stringsIndex + 1;
                                    if (newStartClip < startClip)
                                        startClip = newStartClip;
                                    if (newEndClip > endClip)
                                        endClip = newEndClip
                                })
                            }
                            if (startClip >= 0 && endClip > startClip && endClip <= strings.length) {
                                result.strings = strings.slice(startClip, endClip);
                                result.focusOffset = startClip;
                                for (var stringKey in stringMap) {
                                    var oldStringEntry = stringMap[stringKey] || [];
                                    var newStringEntry = [];
                                    oldStringEntry.forEach(function(stringsIndex, index, source) {
                                        stringsIndex -= startClip;
                                        if (stringsIndex >= 0)
                                            newStringEntry.push(stringsIndex)
                                    });
                                    if (newStringEntry.length)
                                        result.stringMap[stringKey] = newStringEntry
                                }
                                var clipOffset = stringOffsets[startClip - 1] || 0;
                                if (clipOffset)
                                    for (var i = startClip; i < endClip; i++)
                                        result.stringOffsets.push(stringOffsets[i] - clipOffset);
                                else
                                    result.stringOffsets = stringOffsets
                            }
                            else {
                                result.strings = strings;
                                result.stringMap = stringMap;
                                result.stringOffsets = stringOffsets
                            }
                            return result
                        };
                        HTMLFocusWorker.prototype._gatherWeights = function() {
                            if (!this._data || !this._data.tagMap || this._tagWeights)
                                return this._tagWeights || [];
                            var tagMap = this._data.tagMap;
                            var tagWeights = [];
                            for (var key in tagMap)
                                tagWeights.push({
                                    tag: key, weight: tagMap[key].length
                                });
                            tagWeights = tagWeights.sort(function(weight1, weight2) {
                                var compareResult = 0;
                                if (weight1.weight > weight2.weight)
                                    compareResult = -1;
                                else if (weight1.weight < weight2.weight)
                                    compareResult = 1;
                                return compareResult
                            });
                            this._tagWeights = tagWeights;
                            return this._tagWeights
                        };
                        return HTMLFocusWorker
                    })();
                Share.HTMLFocusWorker = HTMLFocusWorker;
                var focuser = new MS.Entertainment.ViewModels.Share.HTMLFocusWorker
            })(Share = ViewModels.Share || (ViewModels.Share = {}))
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
