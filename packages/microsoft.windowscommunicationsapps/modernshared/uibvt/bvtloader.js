
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var BVT = self.BVT = {};

    // Set of tests to run that was loaded from config. Used as the default in BVT.run
    // if no set of tests was specified
    BVT.tests = [];

    // A filter for removing tests from the run.
    BVT.testFilter;

    // Track which scripts we've already loaded so they aren't added multiple times
    var loaded = [];
    function loadScripts(scripts) {
        scripts = scripts.filter(function (script) { return loaded.indexOf(script) === -1; });
        loaded.push.apply(loaded, scripts);
        return Jx.loadScripts(scripts);
    }
    
    // Returns a WTT Task Guid to make sure Tx logging reports the correct pass/fail counts.
    BVT.getWttGuid = function () {
        var xhr = new XMLHttpRequest();
        var url = "ms-appdata:///local/txWttTaskGuid.txt";
        xhr.open("GET", url, false); // sync
        try {
            xhr.send();
        } catch (e) {
            return null;
        }

        // Parse the JS files that need to be loaded from the config
        return xhr.responseText;
    };

    // Ensures that Tx is loaded and loads the set of test cases and dependant libs from
    // a JSON config file.
    BVT.load = function (url, filter) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false); // sync
        try {
            xhr.send();
        } catch (e) {
            return WinJS.Promise.wrapError(e.number);
        }        
        
        // Parse the JS files that need to be loaded from the config
        var config = JSON.parse(xhr.responseText);
        BVT.tests = config.tests;
        if (filter) {
            // There is a filter specified by the user at run time (debug console)
            // so we will use it to match against the test description.
            BVT.testFilter = BVT.testFilter || { "name": filter };
        }

        return loadScripts(["/Tx/core/TxLoader.js"]).then(function () {
            return loadScripts(config.files);
        });
    };

    // Can run (or re-run) a set of cases after Tx and the tests are loaded
    BVT.run = function () {        
        Tx.runner.testList(BVT.tests);

        // Only filter tests if the BVT.testFilter object has been set.
        // Otherwise, we use any run-time filtering supplied.
        if (!Tx.isUndefined(BVT.testFilter)) {
            Tx.runner.testList([]);
            // At this point, Tx already has loaded all bvt files and all BVTs.
            // We want to remove any tests that don't match the filter. This way
            // we only load the tests that should run.
            var testList = Tx.runner._testStore._tests;

            for (var i = 0, len = testList.length; i < len; i++) {
                // Check for options to help us filter.
                var options = testList[i].options;
                if (options) {
                    // Iterate over options and then do a regex match on each
                    // test if it has an option with the same name. Filter
                    // out anything that doesn't have the option or doesn't match the value.
                    for (prop in BVT.testFilter) {
                        if (!testList[i].options.hasOwnProperty(prop)) {
                            testList[i] = null;
                            break;
                        } else {
                            var reg = new RegExp(BVT.testFilter[prop], "i");
                            if (!reg.test(testList[i].options[prop])) {
                                testList[i] = null;
                                break;
                            }
                        }
                    }
                }
            }
            // Filter out any tests that are set to null (these don't match our filters)
            testList = testList.filter(function (el) { return null !== el; });

            // Filter out any tests that aren't explicity in the json file's tests array. This allows
            // us to have non working tests specified in a separate array inside the json file.
            testList = testList.filter(function (el) {
                var testFound = false;
                BVT.tests.forEach(function(val) {
                    if (val === el.options.name) {
                        testFound = true;
                    }
                });
                return testFound;
            });
            
            Tx.runner._testStore._tests = testList;
        }
        
        Tx.config.isBvt = true;
        Tx.runner.onSuiteStart();        
        Tx.run();
    };

    // Called shortly after app startup to support automatically running in lab scenarios. The
    // file path will normally be dropped somewhere under app-data/local.
    BVT.lab = function (filter) {
        return BVT.load("ms-appdata:///local/bvts.json").then(function () {
            Tx.config.wttTaskGuid = BVT.getWttGuid();
            // For lab-runs, we want to close the application after each block of tests.
            Tx.config.autoRun = true;
            Tx.config.autoClose = true;
            if (filter) {
                BVT.testFilter = filter;
            }
            BVT.run();
        });
    };

    // Support for running BVTs locally in an iterative/development manner. Call this method
    // from the debug console with the JSON config file for the desired tests set. Normally
    // this will be a file that is already in the package so you'll use an ms-appx path, e.g.
    // BVT.local("ms-appx://ModernMail/uibvt/mailBvts.json"). This sets up an F11 keyboard
    // shortcut that you can then use to run the tests after exiting the console. If you want
    // to later change the set of tests that are run you can update the BVT.tests array from
    // the console with the desired tests names.
    var listener = null;
    BVT.local = function (url, testName) {
        return BVT.load(url, testName).then(function () {
            if (!listener) {
                listener = function (ev) {
                    if (ev.key === "F11" && !ev.shiftKey) {
                        BVT.run();
                    }
                };
                window.addEventListener("keydown", listener);
            }
        });
    };

    // Shorthand for loading calendar, compose and mail BVTs for local development
    BVT.calendar = BVT.local.bind(null, "ms-appx:///ModernCalendar/uibvt/calendarBvts.json");
    BVT.compose = BVT.local.bind(null, "ms-appx:///ModernMail/compose/uibvt/composeTests.json");
    BVT.mail = BVT.local.bind(null, "ms-appx:///ModernMail/uibvt/mailBvts.json");
    BVT.platform = BVT.local.bind(null, "ms-appx:///Platform/uibvt/platformBvts.json");
    BVT.viewsMail = BVT.local.bind(null, "ms-appx:///ModernMail/uibvt/ViewsBVTs.json");
    BVT.viewsCalendar = BVT.local.bind(null, "ms-appx:///ModernCalendar/uibvt/viewsBVTs.json");

})();