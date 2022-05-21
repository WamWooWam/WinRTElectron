
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Tx,$*/
/*jshint browser:true,strict:true*/

(function () {
    "use strict";

    function setup() {
        // reset the internal data
        Jx.Dep._setLoaded({});
        Jx.Dep._setDepNames({});
    }

    Tx.test("Jx.Dep.collect/isLoaded", function (tc) {
        setup();

        var loaded = Jx.Dep._getLoaded();
        tc.areEqual(Object.keys(loaded).length, 0);
        tc.isFalse(Jx.Dep.isLoaded("/Tx/core/TxLoader.js"));

        // Add a CSS programatically
        var redCss = "/Jx/ut/red.css";
        tc.isFalse(Jx.Dep.isLoaded(redCss));
        Jx.loadCss(redCss);

        Jx.Dep.collect();
        
        tc.isTrue("/tx/core/txloader.js" in loaded); // <script>
        tc.isTrue("/tx/core/tx.js" in loaded); // dynamic
        tc.isTrue("/tx/ui/tx.css" in loaded);
        tc.isTrue(redCss.toLowerCase() in loaded);
        tc.isTrue(Jx.Dep.isLoaded("/Tx/core/TxLoader.js"));
        tc.isTrue(Jx.Dep.isLoaded("/TX/CORE/TX.JS")); // files are stored lowercase
        tc.isTrue(Jx.Dep.isLoaded("/Tx/ui/tx.css"));
        tc.isTrue(Jx.Dep.isLoaded(redCss));
    });

    Tx.test("Jx.Dep.name", function (tc) {
        setup();

        var depNames = Jx.Dep._getDepNames();
        tc.areEqual(Object.keys(depNames).length, 0);

        // name -> array
        Jx.Dep.name("a12", ["/A/1.js","/a/2.JS"]);
        tc.areEqual(depNames.a12.length, 2);
        tc.areEqual(depNames.a12[0], "/a/1.js");
        tc.areEqual(depNames.a12[1], "/a/2.js");
    });

    Tx.test("Jx.Dep.resolve", function (tc) {
        setup();

        var dep = Jx.Dep;
        var names;
        var deps;
        var files;

        // Expands names into corresponding file dependencies. 
        // If there is no dependency then the name is a file.

        names = [];
        deps = {};
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 0);

        names = ["a"];
        deps = {};
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 1);
        tc.areEqual(files[0], "a");

        names = ["a", "b"];
        deps = {};
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 2);
        tc.areEqual(files[0], "a");
        tc.areEqual(files[1], "b");

        names = [];
        deps = { x:1 };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 0);

        names = [];
        deps = { x:1, y:2 };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 0);

        names = ["a"];
        deps = { a:[] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 0);

        names = ["a"];
        deps = { a:["x"] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 1);
        tc.areEqual(files[0], "x");

        names = ["a"];
        deps = { a:["x", "y"] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 2);
        tc.areEqual(files[0], "x");
        tc.areEqual(files[1], "y");

        names = ["a", "b"];
        deps = { a:["x", "y"] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 3);
        tc.areEqual(files[0], "x");
        tc.areEqual(files[1], "y");
        tc.areEqual(files[2], "b");

        names = ["a", "b"];
        deps = { a:["x", "y"], b:[] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 2);
        tc.areEqual(files[0], "x");
        tc.areEqual(files[1], "y");

        names = ["a", "b"];
        deps = { a:["x", "y"], b:["y", "z"] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 4);
        tc.areEqual(files[0], "x");
        tc.areEqual(files[1], "y");
        tc.areEqual(files[2], "y");
        tc.areEqual(files[3], "z");

        names = ["A"];
        deps = { A:["B"], B:["x"] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 1);
        tc.areEqual(files[0], "x");

        names = ["A"];
        deps = { A:["B"], B:["C"], C:["x"] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 1);
        tc.areEqual(files[0], "x");

        names = ["A"];
        deps = { A:["B", "z"], B:["x", "y"] };
        files = [];
        dep._resolve(names, deps, files);
        tc.areEqual(files.length, 3);
        tc.areEqual(files[0], "x");
        tc.areEqual(files[1], "y");
        tc.areEqual(files[2], "z");
    });

    Tx.asyncTest("Jx.Dep.load", function (tc) {
        setup();

        tc.stop();
        
        // initial checks before the files are loaded
        tc.isFalse("n77" in window);
        tc.areNotEqual($.id("utYellow").style.color, "yellow");

        Jx.Dep.name("UT22", ["/Jx/ut/yellow.css", "/Jx/ut/window77.js"]);

        Jx.Dep.load("UT22", function () {

            // Formatting is computed later, check the class in the stylesheet
            // tc.areEqual($.id("utYellow").style.color, "yellow");
            var cssText = document.styleSheets[3].cssText;
            tc.isTrue(cssText.indexOf(".ut-dep-yellow") >= 0);

            tc.areEqual(window.n77, 77);
            
            tc.start();
        });
    });

    // asyncTest - currently Tx can't validate asserts in callbacks
    Tx.noop("Jx.Dep._loadFile load failure", function (tc) {
        setup();

        tc.stop(2);

        // validate how we detect invalid files
        
        // onerror fires on <script> for invalid js files
        Jx.Dep._loadFile("invalid file name.js", function (ev) {
            tc.areEqual(ev.type, "error");
            tc.start();
        });
        
        // onerror doesn't work for <link> with invalid href, we check for rules in stylesheet in onload
        Jx.Dep._loadFile("invalid file name.css", function (ev) {
            tc.areEqual(ev.type, "load");
            tc.areEqual(ev.target.sheet.cssRules.length, 0);
            tc.start();
        });
    });

    // asyncTest - currently Tx can't validate asserts in callbacks
    Tx.noop("Jx.Dep.load invalid css assert", function (tc) {
        setup();

        tc.stop();
        
        // TODO: invalid css files fire an assert but the assert is in a async callback and currently Tx can't catch it.
        Jx.Dep.load("invalid file name.css", function () {
            tc.start();
        });
    });

})();
