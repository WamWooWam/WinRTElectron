
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../Shared/JsUtil/namespace.js" />
/// <reference path="Nav.ref.js" />

Jx.delayDefine(People, "AppNav", function () {

    var P = window.People;
    var N = window.People.Nav;

    P.AppNav = /* @constructor*/function (defaultLocation, onBeforeNavigate, onNavigate, /*@dynamic*/context) {
        /// <summary>The AppNav object is the navigation object for People that handles navigation related events.
        /// - It wraps the Jx.Nav object and shields People.CpMain from knowing the implementation details of Jx.Nav.
        /// - It manipulates the location and back stack to meet People app's specific needs. 
        /// - It provides helper functions to process back stack data for hydration and resume.</summary>
        /// <param name="defaultLocation" type="NavLocation">default location of the App</param>
        /// <param name="onBeforeNavigate" type="Function">beforeNavigate event handler</param>
        /// <param name="onNavigate" type="Function">navigate event handler</param>
        /// <param name="context" optional="true">"this" object for event handler.</param>
        Jx.log.info("People.AppNav");
        Debug.assert(Jx.isObject(defaultLocation));
        Debug.assert(Jx.isNonEmptyString(defaultLocation.page));
        Debug.assert(Jx.isFunction(onBeforeNavigate));
        Debug.assert(Jx.isFunction(onNavigate));

        this._defaultLocation = defaultLocation;

        var nav = this._nav = new Jx.Nav();
        nav.addListener(nav.beforeNavigate, onBeforeNavigate, context);
        nav.addListener(nav.navigate, onNavigate, context);

        // The HTML link controls are still relying on hash change for navigation.
        this._urlHash = new Jx.UrlHash();
        this._hashToNav = new Jx.HashToNav(this._urlHash, nav);

        
        TestHook.setBackStackMaxSize = this.setBackStackMaxSize.bind(this);
        TestHook.pushUriToBackStack = this.pushUriToBackStack.bind(this);
        
    };

    P.AppNav.prototype.dispose = function () {
        Jx.log.info("People.AppNav.dispose");
        this._nav.dispose();
        this._hashToNav.dispose();
        this._urlHash.dispose();
    };

    P.AppNav._areSameLocations = function (loc1, loc2) {
        /// <summary>Compare two locations and check whether they refer to the same page</summary>
        /// <param name="loc1" type="NavLocation"/>
        /// <param name="loc2" type="NavLocation"/>
        /// <returns type="Boolean"/>
        
        Debug.assert(Jx.isObject(loc1));
        Debug.assert(Jx.isObject(loc2));
        
        function stringMatch(val1, val2) {
            return (!Jx.isNonEmptyString(val1) && !Jx.isNonEmptyString(val2)) || val1 === val2;
        }
        // These props are the string keys(unique identifiers) for the location.
        return ["page","id","query","data"].every(function (prop) {
            return stringMatch(loc1[prop], loc2[prop]);
        });
    };
    
    P.AppNav.markLocationAsDeepLinking = function (loc) {
        /// <summary>Mark the location as deep linking triggered</summary>
        /// <param name="loc" type="NavLocation"/>
        Debug.assert(Jx.isObject(loc));
        Debug.assert(Jx.isNonEmptyString(loc.page));
        loc.trigger = "deepLinking";
    };
    
    P.AppNav.isLocationDeepLinking = function (loc) {
        /// <summary>Is the location from deep linking?</summary>
        /// <param name="loc" type="NavLocation"/>
        /// <returns type="Boolean"/>
        Debug.assert(Jx.isObject(loc));     
        return (loc.trigger === "deepLinking");
    };
    
    P.AppNav.prototype.isLastLocationDeepLinking = function () {
        /// <summary>Is last location from deep linking?</summary>
        /// <returns type="Boolean"/>
        var backStack = this._nav.backStack;
        var len = backStack.length;
        return (len > 0 && P.AppNav.isLocationDeepLinking(backStack[len - 1]));
    };

    P.AppNav.prototype.isSameAsCurrentLocation = function (loc) {
        /// <summary>Is the location same as the current location?</summary>
        /// <param name="loc" type="NavLocation"/>
        /// <returns type="Boolean"/>
        Debug.assert(Jx.isObject(loc));
        Debug.assert(Jx.isNonEmptyString(loc.page));
        var currentLoc = /*@static_cast(NavLocation)*/this._nav.getLocation();
        return (Jx.isObject(currentLoc) && P.AppNav._areSameLocations(currentLoc, loc));
    };

    P.AppNav.prototype.isSameAsLastLocation = function (loc) {
        /// <summary>Is the location same as the last location from back stack?</summary>
        /// <param name="loc" type="NavLocation"/>
        /// <returns type="Boolean"/>
        Debug.assert(Jx.isObject(loc));
        Debug.assert(Jx.isNonEmptyString(loc.page));
        var backStack = this._nav.backStack;
        return (backStack.length > 0 && P.AppNav._areSameLocations(loc, backStack[backStack.length - 1]));
    };

    P.AppNav.prototype.removeLastLocation = function () {
        /// <summary>Remove the last item on back stack</summary>
        var nav = this._nav;
        var backStack = nav.backStack;
        if (backStack.length > 0) {
            backStack.pop();
            // It's possible that the last two locations are both default location (if the current location is
            // a result of fallback navigation for invalid uri). In that case, continue removing last location 
            // until the condition is no longer met. This is needed to handle the case where all the locations 
            // on backstack being default locations.
            var len = backStack.length;
            if (len > 0) {
                var navloc = /*@static_cast(NavLocation)*/nav.getLocation();
                var defaultPage = this._defaultLocation.page;
                if (navloc && (navloc.page === defaultPage) && (backStack[len - 1].page === defaultPage)) {
                    this.removeLastLocation();
                }
            }
        }
    };

    P.AppNav.prototype.go = function (loc) {
        /// <summary>Navigate to the specified location. Goes to default location if loc is null</summary>
        /// <param name="loc" type="NavLocation" optional="true">Destination location of the navigation</param>
        Jx.log.info("People.AppNav.go");
        this._nav.go(/*@static_cast(Object)*/(loc ? loc : this._defaultLocation));
    };

    P.AppNav.prototype.back = function () {
        /// <summary>Navigate back to previous location.</summary>
        Jx.log.info("People.AppNav.back");
        var nav = this._nav;
        if (!nav.canGoBack()) {
            // If the current location isn't default location, and the back stack is empty,
            // push the default location onto the stack so user can return to default location.
            // The current location shouldn't be the default location in valid user scenarios,
            // but it can happen in test scenarios where invalid URIs are pushed on to back stack.
            var navloc = /*@static_cast(NavLocation)*/nav.getLocation();
            if (navloc.page !== this._defaultLocation.page) {
                nav.backStack.push(this._defaultLocation);
                nav.forwardStack = [];
            } else {
                Debug.assert(false, "Make sure to test canGoBack() before you call back()!");
                Jx.log.error("People.AppNav.back: Trying to go back with an empty back stack when current page is not an edit page");
                return;
            }
        }
        // Mark the destination location with 'back triggered' property.
        // The back destination is the last item in the back stack array.
        Debug.assert(nav.backStack.length > 0);
        nav.backStack[nav.backStack.length - 1].trigger = "back";

        nav.back();
    };

    P.AppNav.prototype.canGoBack = function () {
        /// <summary>Is the back stack available?</summary>
        var nav = this._nav;
        var navloc = /*@static_cast(NavLocation)*/nav.getLocation();
        Debug.assert(navloc.page);
        return nav.canGoBack() || navloc.page !== this._defaultLocation.page;
    };

    P.AppNav.prototype.getLocation = function () {
        /// <summary>Return the current location</summary>
        /// <returns type="NavLocation" />
        return this._nav.getLocation();
    };

    P.AppNav.prototype.clearBackStack = function () {
        /// <summary>Test hook to clear navigation history</summary>
        Jx.log.info("People.AppNav.clearBackStack");
        this._nav.backStack = [];
    };

    
    P.AppNav.prototype.setBackStackMaxSize = function (maxSize) {
        /// <summary>Test hook to overwrite the default max size of the back stack</summary>
        /// <param name="maxSize" type="Number"/>
        Jx.log.info("People.AppNav.setBackStackSize: max size is now " + String(maxSize));
        this._nav.maxStack = maxSize;
        var nav = this._nav;
        var origBackStack = nav.backStack;
        var origLen = origBackStack.length;
        if (maxSize < origLen) {
            nav.backStack = origBackStack.slice(origLen - maxSize, origLen);
            nav.forwardStack = [];
        }
    };
    

    P.AppNav.prototype.pushUriToBackStack = function (uri) {
        /// <summary>Add Uri to navigation history. This gets added to the top of the back stack.</summary>
        /// <param name="uri" type="String"/>
        Jx.log.info("People.AppNav.pushUriToBackStack");
        Jx.log.pii("uri=" + uri);
        Debug.assert(Jx.isNonEmptyString(uri));
        Debug.assert(uri[0] === "#");
        if (Jx.isNonEmptyString(uri) && uri[0] === "#") {
            this.pushLocToBackStack(/*@static_cast(NavLocation)*/Jx.parseHash(uri.slice(1)));
        }
    };

    P.AppNav.prototype.pushLocToBackStack = function (loc) {
        /// <summary>Push Uri to the top of the back stack.</summary>
        /// <param name="loc" type="NavLocation"/>
        Jx.log.info("People.AppNav.pushLocToBackStack: loc = { page: " + loc.page + "; id: " + loc.id + " }");
        Debug.assert(Jx.isObject(loc));
        Debug.assert(Jx.isNonEmptyString(loc.page));
        var nav = this._nav;
        var backStack = nav.backStack;
        // Don't push duplicate location onto the back stack.
        if (!this.isSameAsCurrentLocation(loc) && !this.isSameAsLastLocation(loc)) {
            backStack.push(loc);
            nav.forwardStack = [];
        }

        // If the back stack is too big then remove the oldest entry
        if (backStack.length > nav.maxStack) {
            backStack.shift(); 
        }
    };

    P.AppNav.prototype.setBackStateOfTopItem = function (state) {
        /// <summary>Sets the back state on the top item.</summary>
        /// <param name="state" type="Object"/>
        var nav = this._nav;
        Debug.assert(nav.backStack.length > 0);
        nav.backStack[nav.backStack.length - 1].state = state;
    };

    P.AppNav.prototype.convertBackStackToObject = function () {
        /// <summary>Convert back stack to an object</summary>
        /// <returns type="Object">The object that contains the back stack data</returns>
        Jx.log.info("People.AppNav.convertBackStackToObject");
        return P.AppNav._convertBackStackToObject(this._nav.backStack);
    };

    P.AppNav._convertBackStackToObject = function (backStack) {
        /// <summary>Convert back stack array to an object</summary>
        /// <param name="backStack" type="Array">The back stack array</param>
        /// <returns type="Object">The object that contains the back stack data</returns>
        Debug.assert(Jx.isArray(backStack));
        var backObject = {};
        for (var i = 0; i < backStack.length; i++) {
            backObject[String(i)] = JSON.stringify(backStack[i]);
        }
        backObject.size = backStack.length;

        return backObject;
    };

    P.AppNav.prototype.rebuildBackStackFromObject = function (backObject) {
        /// <summary>Rebuild the back stack array from the object</summary>
        /// <param name="backStack" type="Object">The object that contains the back stack data</param>
        Jx.log.info("People.AppNav.rebuildBackStackFromObject");
        this._nav.backStack = P.AppNav._rebuildBackStackFromObject(backObject);
    };

    P.AppNav._rebuildBackStackFromObject = function (/*@dynamic*/backObject) {
        /// <summary>Rebuild the back stack array from the object</summary>
        /// <returns type="Array">The back stack array</returns>
        Debug.assert(Jx.isObject(backObject));
        var navBackStack = [];
        if (Jx.isObject(backObject)) {
            for (var i = 0; i < backObject.size; i++) {
                var data = backObject[String(i)];
                if (Jx.isNonEmptyString(data)) {
                    var item = null;
                    try {
                        item = JSON.parse(data);
                    } catch (err) {
                        Jx.log.exception("People.AppNav._rebuildBackStackFromObject: failed parsing back stack item.", err);
                        Jx.log.pii("Failed item: '" + data + "'.");
                    }
                    if (Jx.isObject(item)) {
                        navBackStack.push(item);
                    }
                }
            }
        } else {
            Jx.log.error("People.AppNav._rebuildBackStackFromObject: invalid object. Object=" + backObject);
        }
        return navBackStack;
    };

    P.AppNav.prototype.fallbackOnFail = function (loc) {
        /// <summary>Redirect to another page due to failure in navigation to current destination</summary>
        /// <param name="loc" type="NavLocation">The location object for the failed navigation</param>
        Jx.log.info("People.AppNav.fallbackOnFail: failed loc = { page: " + loc.page + "; id: " + loc.id + " }");
        Debug.assert(Jx.isObject(loc));
        Debug.assert(loc.page !== this._defaultLocation.page);
        // If the navigation was triggered by back button, go one more back step.
        // Otherwise redirect to default location.
        if (loc.trigger === "back" && this.canGoBack()) {
            this.back();
        } else {
            // The failed location will be placed on back stack. It's okay as when user navigates 'back',
            // it will be skipped if it fails again.
            this._nav.go(/*@static_cast(Object)*/this._defaultLocation);
        }
    };
});
