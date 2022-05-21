
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../PeopleShared.ref.js" />

(function () {
    window.Include = {
        /* @type(HTMLElement)*/_elHead: null
    };

    // Replacements are replaceable strings in paths.  They appear in the string inside $().
    // In this list they are undecorated.  Replacements may contain other replacements, in which case in the string they should appear inside $().
    // In WWAHost, files are loaded using absolute path using the the installation path for the packages as root.
    Include._replacements = {
        modernRoot: "",
        modernShared: "$(modernRoot)/shared",
        winJS: "//Microsoft.WinJS.2.0",
        platformTest: "$(modernRoot)",
        peopleRoot: "$(modernRoot)/ModernPeople",
        peopleShared: "$(peopleRoot)/shared",
        socialRoot: "$(peopleRoot)/Social",
        peopleResources: "$(modernRoot)",
        stringResources: "$(peopleResources)/ModernPeople",
        stringExtension: "resw",
        imageResources: "$(peopleResources)/ModernPeople/images",
        cssResources: "$(peopleResources)/ModernPeople/resources/css",
        sharedResources: "$(peopleResources)/Resources/ModernShared",
        localizedSharedResources: "$(peopleResources)/ModernShared/resources",
        jxCore: "$(modernRoot)/Jx",
        sasRoot: "$(modernRoot)",
        messageBarRoot: "$(modernRoot)/MessageBar",
        messageBarResources: "$(modernRoot)/Resources/MessageBar",
        canvasRoot: "$(modernRoot)/ModernCanvas",
        shareAnythingRoot: "$(modernRoot)/ModernShareAnything",
        shareAnythingResources: "$(modernRoot)/Resources/ModernShareAnything"
    };

    // Fix the path for IE or other browsers so it uses relative path.
    // Should be called before using $include.
    Include._init = function () {
        
        // Static loading protection and tag fixup are disabled in other apps until they can be tested in UXPlatform.
        var enableStaticLoading = document.location.toString().match(/\/(people|picker).htm$/i);

        
        Debug.includeMonitoring.add(function (url) {
            ///<summary>Add debug-console logging of any included files.</summary>
            ///<param name="url" type="String"/>
            if (window.Jx && Jx.log) {
                Jx.log.warning("Including " + url);
            }
        });

        if (enableStaticLoading && !document.body) {
            var preventDynamicLoadingAtStartup = function (url) {
                Debug.assert(false, "Dynamic loading detected at startup: " + url);
            };
            Debug.includeMonitoring.add(preventDynamicLoadingAtStartup);
            window.addEventListener("DOMContentLoaded", function () {
                Debug.includeMonitoring.remove(preventDynamicLoadingAtStartup);
            }, true);
        }
        

        if (!window.hasOwnProperty("Windows")) {
            // In WWAHost, window.hasOwnProperty("Windows") is true but in IE, this is undefined.
            // In WWAHost, files are loaded using absolute path using the the installation path for the packages as root.
            // In IE, files are loaded using relative path. So replace the root directories for IE here.
            var originalReplacements = Include._replacements;
            Include._replacements = Object.create(originalReplacements);

            Include._replacements.stringResources = "$(peopleResources)/en-us/ModernPeople";
            Include._replacements.platformTest = "$(pubModernRoot)/ModernContactPlatform/bin/$(flavor)/$(arch)/modern/platform_test";
            Include._replacements.sasRoot = "$(pubModernRoot)/SendASmile/bin/$(flavor)/$(arch)/modern/SendASmile";
            Include._replacements.messageBarRoot = "$(pubModernRoot)/MessageBar/bin/$(flavor)/$(arch)/modern/MessageBar/MessageBar";
            Include._replacements.cssResources = "$(peopleResources)/ModernPeople/resources/css";
            Include._replacements.localizedSharedResources = "$(peopleResources)/en-us/ModernShared/resources";
            Include._replacements.canvasStrings = "$(pubModernRoot)/ModernCanvas";
            Include._replacements.mailStrings = "$(pubModernRoot)/ModernMail";

            // listen for new style nodes to fix-up the background image paths
            document.addEventListener("DOMNodeInserted", function (ev) {
                var el = ev.target;

                if (el.sheet) {
                    Array.prototype.forEach.call(el.sheet.rules, function (rule) {
                        var background = rule.style.background;
                        if (background) {
                            var match = background.match(/\/modernpeople\/images\//i);
                            if (match) {
                                rule.style.background = this.replacePaths(background.replace(match[0], "$(imageResources)/"));
                            }
                        }
                    }, Include);

                    Array.prototype.forEach.call(el.sheet.cssRules, function (rule) {
                        if (rule instanceof CSSMediaRule) { // found a media query
                            var media = rule.media;
                            if (media && media.length === 1 && media.item(0) === "not all") { // it excludes everything
                                // this is probably a snap media query that failed to parse in IE, update it
                                media.appendMedium("screen and (max-width: 340px)"); // snap is 320, but scrollbars take up space in IE, so we'll let snap be a bit wider
                            }
                        }
                    });
                }
            }, false);

            // Are we running from source location, drop location, or WWA-install-path location?
            var currentPath = this._getCurrentPath();
            var ancestor = null;
            if ((ancestor = this._checkForAncestor(currentPath, "drop/([^/]+)/([^/]+)/modern")) !== null) {
                // We are running from drop location.
                Include._replacements.flavor = ancestor.match[1];
                Include._replacements.arch = ancestor.match[2];
                Include._replacements.modernRoot = ancestor.path;
                Include._replacements.pubModernRoot = "$(modernRoot)/../../../published";
                Include._replacements.peopleRoot = "$(modernRoot)/ModernPeople/ModernPeople";
                Include._replacements.jxCore = "$(modernRoot)/jx/jx";
                Include._replacements.modernShared = "$(modernRoot)/shared/shared";
                Include._replacements.winJS = "$(modernRoot)/WinJSDebug";
                Include._replacements.peopleResources = "$(modernRoot)/../../../../target/$(flavor)/$(arch)/ModernPackage/Communications";
                Include._replacements.stringExtension = "lang-en-us.resw";
                Include._replacements.messageBarResources = "$(pubModernRoot)/MessageBar/bin/$(flavor)/$(arch)/modern/MessageBar/Resources/MessageBar";
                Include._replacements.canvasRoot = "$(pubModernRoot)/ModernCanvas/bin/$(flavor)/$(arch)/modern/ModernCanvas/ModernCanvas";
                Include._replacements.shareAnythingResources = "$(pubModernRoot)/ModernShareAnything/bin/$(flavor)/$(arch)/modern/ModernShareAnything/resources/ModernShareAnything";
            } else if ((ancestor = this._checkForAncestor(currentPath, "published/ModernPeople/bin/([^/]+)/([^/]+)")) !== null) {
                // We are running from published location.
                Include._replacements.flavor = ancestor.match[1];
                Include._replacements.arch = ancestor.match[2];
                Include._replacements.pubModernRoot = ancestor.path + "/../../../..";
                Include._replacements.modernRoot = "$(pubModernRoot)/../$(flavor)/$(arch)/modern";
                Include._replacements.peopleRoot = "$(pubModernRoot)/ModernPeople/bin/$(flavor)/$(arch)/modern/ModernPeople/ModernPeople";
                Include._replacements.jxCore = "$(modernRoot)/jx/jx";
                Include._replacements.modernShared = "$(modernRoot)/shared/shared";
                Include._replacements.winJS = "$(modernRoot)/WinJSDebug";
                Include._replacements.peopleResources = "$(pubModernRoot)/ModernPeople/bin/$(flavor)/$(arch)/modern/ModernPeople";
                Include._replacements.stringResources = "$(pubModernRoot)/ModernPeople/strings";
                Include._replacements.sharedResources = "$(modernRoot)/ModernShared/Resources/ModernShared";
                Include._replacements.localizedSharedResources = "$(modernRoot)/ModernShared/en-us/ModernShared/Resources";
                Include._replacements.messageBarResources = "$(pubModernRoot)/MessageBar/bin/$(flavor)/$(arch)/modern/MessageBar/Resources/MessageBar";
                Include._replacements.canvasRoot = "$(pubModernRoot)/ModernCanvas/bin/$(flavor)/$(arch)/modern/ModernCanvas/ModernCanvas";
                Include._replacements.shareAnythingResources = "$(pubModernRoot)/ModernShareAnything/bin/$(flavor)/$(arch)/modern/ModernShareAnything/resources/ModernShareAnything";
            } else if ((ancestor = this._checkForAncestor(currentPath, "modern/people")) !== null) {
                // We are running from the source location.
                Include._replacements.flavor = "debug";
                Include._replacements.arch = "i386";
                Include._replacements.peopleRoot = ancestor.path;
                Include._replacements.modernRoot = "$(peopleRoot)/..";
                Include._replacements.dropModernRoot = "$(peopleRoot)/../../drop/$(flavor)/$(arch)/modern";
                Include._replacements.pubModernRoot = "$(dropModernRoot)/../../../published";
                Include._replacements.winJS = "$(dropModernRoot)/WinJSDebug";
                Include._replacements.jxCore = "$(dropModernRoot)/jx/jx";
                Include._replacements.socialRoot = "$(dropModernRoot)/ModernPeople/ModernPeople/Social";
                Include._replacements.peopleResources = "$(peopleRoot)/Resources";
                Include._replacements.stringResources = "$(peopleResources)/strings";
                Include._replacements.imageResources = "$(peopleResources)/img";
                Include._replacements.cssResources = "$(peopleRoot)/resources/css";
                Include._replacements.sharedResources = "$(modernShared)/resources";
                Include._replacements.localizedSharedResources = "$(sharedResources)";
                Include._replacements.messageBarResources = "$(pubModernRoot)/MessageBar/bin/$(flavor)/$(arch)/modern/MessageBar/Resources/MessageBar";
                Include._replacements.canvasRoot = "$(pubModernRoot)/ModernCanvas/bin/$(flavor)/$(arch)/modern/ModernCanvas/ModernCanvas";
                Include._replacements.shareAnythingResources = "$(pubModernRoot)/ModernShareAnything/bin/$(flavor)/$(arch)/modern/ModernShareAnything/resources/ModernShareAnything";
                // list of files we don't want to process
                var ignoreFiles = ["shared", "ui-light", "uicollections"];

                // override the default behavior to use LESS
                Include._createStyleSheet = function (href) {
                    if (href.match("/(" + ignoreFiles.join("|") + ").css$")) {
                        document.createStyleSheet(href);
                    } else {
                        var el = document.createElement("link");

                        el.rel = "stylesheet/less";
                        el.href = href;

                        document.head.appendChild(el);
                    }
                };

                // when running from source, include the shared vars file and LESS
                NoShip.$include("$(sharedResources)/css/shared_vars.css");
                NoShip.$include("$(modernRoot)/../public/ext/less/less.js");
            } else {
                // We are running from some other location.  Perhaps the package or target, they should be identical.
                Include._replacements.modernRoot = currentPath + "/../../..";
                Include._replacements.stringExtension = "lang-en-us.resw";
                Include._replacements.platformTest = "$(modernRoot)";
                Include._replacements.winJS = "$(modernRoot)/WinJS"; // Note: this will require a manual copy of WinJS to run from package/target in IE
                Include._replacements.sasRoot = "$(modernRoot)/SendASmile";
                Include._replacements.messageBarRoot = "$(modernRoot)/MessageBar";
                Include._replacements.canvasStrings = "$(modernRoot)/ModernCanvas";
                Include._replacements.mailStrings = "$(modernRoot)/ModernMail";
            }

            Include.fixTags = function () {
                ///<summary>Finds scripts and CSS that failed to load and corrects their paths</summary>
                Array.prototype.slice.call(document.head.children).forEach(function (element) {
                    var src;
                    if (element.tagName === "LINK") {
                        src = element.href;
                    } else if (element.tagName === "SCRIPT") {
                        src = element.src;
                    }
                    if (src) {
                        // The hint will tell us where the file normally lives in the AppX package
                        var hint = element.getAttribute("hint") || "$(peopleRoot)";
                        var originalHintValue = Include.absolutePath(Include.replacePaths(hint + "/", originalReplacements));

                        // Check if the file was included from that hint path
                        if (src.toLowerCase().substr(0, originalHintValue.length) === originalHintValue.toLowerCase()) {
                            // Strip that hint path off, and replace it with the hint.  $include will fix it up to the
                            // correct path.
                            src = hint + "/" + src.substr(originalHintValue.length);

                            // Remove the broken tag
                            document.head.removeChild(element);

                            // Include the corrected path.  Prevent dynamic includes during startup to avoid issues
                            // where the app works in IE but not in WWAHost.
                            Include.includeOneFile(src, "Dynamic include attempted at startup.\nAll files loaded at startup must be listed in the HTML.");
                        } else {
                            Debug.assert(!element.getAttribute("hint"), "Invalid hint specified on tag: " + element.outerHTML);
                        }
                    }
                });
            };
            if (enableStaticLoading) {
                // If include is dynamically added after DOMContentLoaded, consumers will need to call Include.fixTags
                // directly.
                window.addEventListener("DOMContentLoaded", function () {
                    Include.fixTags();
                }, true);
            }
        }
        
    };

    Include._createStyleSheet = function (href) {
        ///<summary>Creates a new stylesheet in the document</summary>
        ///<param name="href" type="String">The path of the sheet to load</param>
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    };

    
    Include._getCurrentPath = function () {
        ///<summary>Locates the path to the include.js.  This file must be loading at the time this function is called</summary>
        ///<returns type="String">An absolute path to the directory containing include.js</returns>
        var scripts = this._elScripts;
        for (var i = 0, len = scripts.length; i < len; i++) {
            var script = scripts[i];
            if (script.readyState === "interactive") {
                var result = /^(.*)\/include\.js$/i.exec(script.src);
                if (result) { return result[1]; }
            }
        }
    };

    Include._checkForAncestor = function (absolutePath, ancestorPattern) {
        ///<param name="absolutePath" type="String">The path we are starting from</param>
        ///<param name="ancestorPattern" type="String">A pattern matching an ancestor directory.  Should not have leading or trailing slashes.</param>
        ///<returns type="CheckForAncestorValue">An object containing two members:  path is the absolute path to this ancestor and match is the result of the regex.
        ///Returns null if the pattern is not matched.</returns>
        if (!absolutePath) {
            return null;
        }
        var /* @dynamic*/match = absolutePath.match(RegExp("/" + ancestorPattern + "/", "i")); // Turn the pattern into a case-insensitive regular expression that won't match partial directory names
        if (match === null) {
            return null;
        }

        var pathToAncestor = absolutePath.substring(0, match.index + match[0].length - 1); // Drop everything after the ancestor, and drop the trailing slash
        return { path: pathToAncestor, match: match };
    };
    

    Include._replacementsRegex = /\$\([^\)]*\)/g;

    Include.replacePaths = function (/* @type(String)*/include, /*@type(Object),@optional*/replacements) {
        replacements = replacements || this._replacements;
        var matches;
        while ((matches = include.match(this._replacementsRegex)) !== null) {
            for (var iMatch = 0, lenMatches = matches.length; iMatch < lenMatches; iMatch++) {
                include = include.replace(matches[iMatch], replacements[matches[iMatch].substring(2, matches[iMatch].length - 1)]);
            }
        }

        return include;
    };

    Include._isCssFileName = function (include) {
        /// <summary>Decides whether the passed-in path describes a CSS file or not.</summary>
        /// <param name="include" type="String">path/filename to test.</param>

        return include.substring(include.length - 4).toLowerCase() === ".css";
    };

    // We can ensure we have an absolute path and not a relative one using an <A HREF="...">
    Include._elLink = document.createElement("a");
    Include.absolutePath = function (include) {
        this._elLink.href = include;
        return this._elLink.href;
    };

    Include._addingScriptTag = false;
    Include._fileScopeInitializer = /* @type(Function) */null;
    Include.initializeFileScope = function (initializer) {
        /// <summary>Calls the file scope initializer, either right away, or after the script has been included.</summary>
        /// <param name="initializer" type="Function">Initializer function to call.</param>
        if (this._addingScriptTag) {
            this._fileScopeInitializer = initializer;
        } else {
            initializer();
            if (Debug.leaks) {
                Debug.leaks.scanForTypesToTrack();
            }
        }
    };

    function getSources(list, propertyName) {
        return Array.prototype.map.call(list, function lowerCaseSrc(element) {
            var src = element.$includeSrc;
            if (src === undefined) {
                element.$includeSrc = src = (element[propertyName] || "").toLowerCase();
            }
            return src;
        });
    }

    // Include implements $include by dynamically adding <script src=".."> tags to the head of the document
    // If the filename ends with ".css" then it adds a stylesheet link instead.
    Include._elHead = document.getElementsByTagName("head")[0];
    Include._elScripts = document.scripts;
    Include.$include = /* @varargs*/function () {
        _markStart("$include");
        var /* @type(Array)*/includes = arguments;
        var scriptSources, cssSources;

        // Create and load the script tags we need
        for (var i = 0, len = includes.length; i < len; i++) {
            var include = this.absolutePath(this.replacePaths(includes[i])).toLowerCase();
            var filename = include.substr(include.lastIndexOf("/") + 1);

            if (this._isCssFileName(include)) {
                cssSources = cssSources || getSources(document.getElementsByTagName("link"), "href");
                if (cssSources.indexOf(include) === -1) {
                    Debug.includeMonitoring.report(includes[i]);
                    _markStart("$include:addStyleSheet=" + filename);
                    this._createStyleSheet(include);
                    _markStop("$include:addStyleSheet=" + filename);
                }
            } else {
                scriptSources = scriptSources || getSources(this._elScripts, "src");
                if (scriptSources.indexOf(include) === -1) {
                    Debug.includeMonitoring.report(includes[i]);

                    _markStart("$include:addScriptTag=" + filename);
                    var elScript = document.createElement("script");
                    elScript.type = "text/javascript";
                    elScript.src = include;
                    this._addingScriptTag = true;
                    this._elHead.appendChild(elScript);
                    this._addingScriptTag = false;
                    scriptSources.push(include);
                    _markStop("$include:addScriptTag=" + filename);

                    // Initialize this file if needed
                    var fileScopeInitializer = this._fileScopeInitializer;
                    if (fileScopeInitializer !== null) {
                        this._fileScopeInitializer = null;
                        _markStart("$include:runScript=" + filename);
                        fileScopeInitializer();
                        _markStop("$include:runScript=" + filename);
                        if (Debug.leaks) {
                            Debug.leaks.scanForTypesToTrack();
                        }
                    }
                }
            }
        }
        _markStop("$include");
    };

    
    window.Debug = window.Debug || {};
    Debug.includeMonitoring = {
        add: function (monitor) {
            ///<summary>Adds a function that will be called whenever a file is included</summary>
            ///<param name="monitor" type="Function"/>
            this._monitors.push(monitor);
        },
        remove: function (monitor) {
            ///<param name="monitor" type="Function"/>
            var index = this._monitors.indexOf(monitor);
            if (index !== -1) {
                this._monitors.splice(index, 1);
            }
        },
        disable: function () {
            ///<summary>Prevents any of the monitors from seeing include activity.</summary>
            this._disableCount++;
        },
        enable: function () {
            ///<summary>Restores monitor functionality after a call to disable.</summary>
            this._disableCount--;
        },
        report: function (url) {
            ///<summary>Called by include to notify the monitors about a file</summary>
            ///<param name="url" type="String"/>
            if (this._disableCount === 0) {
                this._monitors.forEach(function (monitor) {
                    monitor(url);
                });
            }
        },
        _monitors: [],
        _disableCount: 0
    };

    Debug.assert = Debug.assert || function (condition, message) {
        ///<summary>This function stands in for assert until Jx is loaded and replaces it</summary>
        if (!condition) {
            window.setTimeout(function () { Debug.assert(false, message); }, 100);
        }
    };
    

    Include.includeOneFile = function (
        url
    
        , errorText
    
    ) {
        ///<summary>This function tries to include exactly one file, and complains if that file attempts
        ///to include anything else.</summary>
        ///<param name="url" type="String">The file to load</param>
        ///<param name="errorText" type="String"/>

        
        function preventDependencies(includedUrl) {
            Debug.assert(url === includedUrl, errorText + "\n" + url + " included " + includedUrl);
        }
        

        Debug.includeMonitoring.add(preventDependencies);
        try {
            Include.$include(url);
        } finally {
            Debug.includeMonitoring.remove(preventDependencies);
        }
    };

    
    window.NoShip = window.NoShip || {};
    NoShip.$include = /*@varargs*/function () {
        ///<summary>The noship version of include overrides dependency and dynamic loading checks.</summary>
        Debug.includeMonitoring.disable();
        try {
            Include.$include.apply(Include, arguments);
        } finally {
            Debug.includeMonitoring.enable();
        }
    };
    

    function _markStart(s) { msWriteProfilerMark("Include." + s + ",StartTA,People,Include"); }
    function _markStop(s) { msWriteProfilerMark("Include." + s + ",StopTA,People,Include"); }

    Include._init();
})();

// Coffeemaker 137 This fails because Social.Utilities.js, which uses $include is evaluated first as reference files are currently
// always evaluated before compiled files. The cross-dependency between this project and the one containing Social.Utilities.js makes
// eliminating this error impossible until Coffeemaker is fixed to allow single-pass analysis of compiled and reference
// files.
/// <disable>JS3085.VariableDeclaredMultipleTimes</disable>
var $include = /* @varargs*/function () { return Include.$include.apply(Include, arguments); };
/// <enable>JS3085.VariableDeclaredMultipleTimes</enable>
