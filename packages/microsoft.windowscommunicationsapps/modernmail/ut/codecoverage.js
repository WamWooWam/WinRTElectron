
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Jx, Windows */
(function () {

    var CC = window.CodeCoverage = {};

    CC._allCodeCoveragePoints = {};
    CC._enabled = false;

    // function on window object so it can be called from instrumented code
    CC._logCodeCoveragePoint = function (index, key) {
        // eval code can persist between UT files, but if not profiled agian in
        // a later page, CC._allCodeCoveragePoints will be empty
        if (CC._allCodeCoveragePoints[key] && CC._allCodeCoveragePoints[key][index]) {
           CC._allCodeCoveragePoints[key][index].h = 1;
        } 
    };

    var replaceTextInFile = function (fileName, fileContents) {
        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(
            function (file) {
                Windows.Storage.FileIO.writeTextAsync(file, fileContents);
            }
        );
    };

    var readTextFromFile = function (fileName, callback) {
        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        localFolder.getFileAsync(fileName).then(
            function (file) {
                Windows.Storage.FileIO.readTextAsync(file).done(
                    function (text) {
                        callback(text);
                    },
                    function () {
                        callback();
                    }
                );
            },
            function () {
                callback();
            }
        );
    };

    CC.mergeWithPreviousResults = function(callback) {
        readTextFromFile("CC_Progress.json", function (text) {
            if (text) {
                var previousCodeCoveragePoints = JSON.parse(text),
                    timestampNow = Math.floor(Date.now() / 60000); // Minutes
                // if the file is more than 3 minutes old, assume it's from a previous run and ignore it.
                if (Jx.isObject(previousCodeCoveragePoints) && (timestampNow - previousCodeCoveragePoints.timestamp < 3)) {
                    for (var key in previousCodeCoveragePoints) {
                        for (var u = 0; u < previousCodeCoveragePoints[key].length; ++u) {
                            if (!CC._allCodeCoveragePoints[key]) {
                                CC._allCodeCoveragePoints[key] = previousCodeCoveragePoints[key];
                            } else if (!CC._allCodeCoveragePoints[key][u]) {
                                CC._allCodeCoveragePoints[key][u] = previousCodeCoveragePoints[key][u];
                            } else {
                                CC._allCodeCoveragePoints[key][u].h += previousCodeCoveragePoints[key][u].h;
                            }
                        }
                    }
                }
            }
            callback();
        });
    };

    // function on window object so it can be called from last testcase.
    CC.logCodeCoverageResult = function (tc) {
        if (!CC._enabled) {
            tc.log("Code coverage not enabled.  Build with UT_CODECOVERAGE=1.");
            return;
        }
        CC._allCodeCoveragePoints.timestamp = Math.floor(Date.now() / 60000); // Minutes
        var stringified = JSON.stringify(CC._allCodeCoveragePoints);
        replaceTextInFile("CC_Progress.json", stringified);

        var points = 0,
            covered = 0,
            totalPoints = 0,
            totalCovered = 0,
            lastKey = "",
            coverageReport = [];

        function logTc(key, covered, points) {
            coverageReport.push({ key: key, covered: covered, points: points });
        }

        for (var key in CC._allCodeCoveragePoints) {
            for (var u = 0; u < CC._allCodeCoveragePoints[key].length; ++u) {
                if (lastKey === "") {
                    lastKey = key;
                }
                if (key !== lastKey) {
                    logTc(lastKey, covered, points);
                    lastKey = key;
                    totalPoints += points;
                    totalCovered += covered;
                    covered = 0;
                    points = 0;
                }
                points++;
                if (CC._allCodeCoveragePoints[key][u].h > 0) {
                    covered++;
                }
            }
        }
        logTc(lastKey, covered, points);
        coverageReport.sort(function (a, b) {
            return (b.covered / b.points) - (a.covered / a.points);
        });
        logTc("Total", totalCovered, totalPoints);
        for (var l = 0; l < coverageReport.length; ++l) {
            var r = coverageReport[l];
            tc.log("Code Coverage: " + Math.floor((r.covered / r.points) * 100) + "% " + r.key + ":" + r.covered + "/" + r.points);
        }
    };

    // Jx.delayDefine will call itself if passed an array.  This prevents that recursion from double counting in code coverage
    var _codeCoverageNested = false;

    var normalDelayDefine = Jx.delayDefine;
    
    // Override delayDefine to stringify, then instrutment, then reparse function.
    var codeCoverageDelayDefine = function (originalDelayDefine, namespace, key, fn) {
        // function to insert code coverage callbacks
        function insertAtIndex(str, index, replacement) {
            return str.substr(0, index - 1) + replacement + str.substr(index - 1);
        }

        if (_codeCoverageNested) {
            // If nested, then fn is already instrumented
            originalDelayDefine(namespace, key, fn);
        } else {

            var functionAsString = "parsedFunction = " + fn,
                // Regular expression for key words, followed by a { before a newline.
                regex = [/ function ([^\r\n]*)[^\r\n]*\{/g, / if ([^\r\n]*)[^\r\n]*\{/g, / while ([^\r\n]*)[^\r\n]*\{/g, / for ([^\r\n]*)[^\r\n]*\{/g, / do \{/g, /\} else \{/g],
                indexes = [],
                result = null;
    
            // Find all insert points
            for (var j = 0; j < regex.length; ++j) {
                while ((result = regex[j].exec(functionAsString))) {
                    indexes.push(result.index + result[0].length);
                }
            }
            // Sort insert points so they can be inserted last to first without overlap.  This will
            // prevent the insert points from changing by text insertsion
            indexes.sort(function (a, b) {
                return a - b;
            });

            var lastParsedFunction = fn,
                insertAttempt = functionAsString,
                insertPoints = [],
                keyName = "";

            if (Jx.isArray(key)) {
                for (var k = 0; k < key.length; ++k) {
                    keyName += key[k] + ",";
                }
            } else {
                keyName = key;
            }

            // Insert code coverage callbacks with incrementing identifier
            for (var i = indexes.length - 1; i >= 0; --i) {
                var pointNumber = insertPoints.length;
                insertAttempt = insertAtIndex(insertAttempt, indexes[i] + 1, " CC._logCodeCoveragePoint(" + pointNumber + ",\"" + keyName + "\");");
                insertPoints.push({ key:keyName, p: pointNumber, h: 0 });
            }

            // If eval completes without syntax error, parsedFunction will be assigned the resulting function
            var parsedFunction = null,
                parseError = "";
            try {
                eval(insertAttempt);
            } catch (ex) {
                parseError = "Failed To instrutment:";
            }

            for (var l = 0; l < insertPoints.length; ++l) {
                if (!CC._allCodeCoveragePoints[parseError + insertPoints[l].key]) {
                    CC._allCodeCoveragePoints[parseError + insertPoints[l].key] = [];
                }
                var insertKey = parseError + insertPoints[l].key;
                delete insertPoints[l].key;
                CC._allCodeCoveragePoints[insertKey][insertPoints[l].p] = insertPoints[l];
            }
            if (parsedFunction) {
                lastParsedFunction = parsedFunction;
            }

            // Allow for Jx.delayDefine nesting
            if (Jx.isArray(key)) {
                _codeCoverageNested = true;
                originalDelayDefine(namespace, key, lastParsedFunction);
                _codeCoverageNested = false;
            } else {
                originalDelayDefine(namespace, key, lastParsedFunction);
            }
        }
            
    }.bind(null, Jx.delayDefine);

    // By default code coverage is not enabled.
    CC.start = Jx.fnEmpty;
    CC.stop = Jx.fnEmpty;

    // function on window object so it can be called inline from utMail.htm
    CC.enable = function() {
        CC._enabled = true;
        CC.start = function () {
            Jx.delayDefine = codeCoverageDelayDefine;
        };

        CC.stop = function () {
            Jx.delayDefine = normalDelayDefine;
        };
    };
})();