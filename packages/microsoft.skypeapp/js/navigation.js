

﻿(function () {
    "use strict";

    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.UI.Navigation"),
        cache = {
            _pages: []
        }, 
        CACHE_LIMIT = 1,
        cacheLimitOverflowCheckTimer = null,
        history = [], 
        historyLimit = 20,
        historyForbiddenPages = ["login", "logout", "linkOrCreateAccount", "upgrade", "policyWarning"],
        historyForbiddenOptions = ["isNavigatingBack", "goDirectlyToLive", "addContacts"],
        focusExclusions = ["linkOrCreateAccount", "search"],
        pageEl,
        navigationContainer,
        activeFragment,
        NAVIGATION_FALLBACK_TIMEOUT = 5e3, 
        PAGE_DISPOSE_TIMEOUT = 20e3, 
        homePageName = "hub",
        homePageFragmentContainer = null, 
        pagesOrFragmentsWithUnreadButton = ['dialer', 'conversation', 'contacts', 'liveConversation', 'participantList'], 
        _finalizeSwitchJob;

    var historyGetSet = {
        get: function () {
            return history;
        },
        set: function (value) {
            history = value;
        }
    };

    var navigation = {
        
        
        
        
        currentNavigation: (function() { var s = new WinJS._Signal(); s.complete(); return s; }()),

        navigating: false,

        next: {
            
            
            renderComplete: null,
            data: {
                name: null,    
                options: null,
            }
        },

        start: function () {
            this.currentNavigation = new WinJS._Signal();

            this.currentNavigation.promise.then(this.onNavigationEnd.bind(this), this.onNavigationEnd.bind(this));

            this.navigating = true;
        },

        schedule: function (name, options) {
            this.clearNext(true);  
            this.next.data.name = name;
            this.next.data.options = options;
            this.next.renderComplete = new WinJS._Signal();

            return this.next.renderComplete.promise;
        },

        clearNext: function (cancel) {
            if (cancel && this.next.renderComplete) {
                log("Navigation to '" + this.next.data.name + "', " + JSON.stringify(this.next.data.options) + " cancelled");
                this.next.renderComplete.promise.cancel();
            }
            this.next.data.name = null;
            this.next.data.options = null;
            this.next.renderComplete = null;
        },

        onNavigationEnd: function () {
            
            this.navigating = false;
            if (this.next.renderComplete) {
                var nextComplete = this.next.renderComplete.complete.bind(this.next.renderComplete);
                var nextError = this.next.renderComplete.error.bind(this.next.renderComplete);
                this.next.renderComplete = null;
                Skype.UI.navigate(this.next.data.name, this.next.data.options).then(nextComplete, nextError);
                this.clearNext();
            }
        },
    };

    function navigate(name, options) {
        var etwSession = etw.startSession("navigate," + name, 0);
        log("Navigation navigate('" + name + "', " + JSON.stringify(options) + ") called");

        if (!Skype.Application.state.policy.application.enabled && name !== "policyWarning") {
            log("Navigation to '" + name + "' rejected");
            return WinJS.Promise.as();
        }

        if (navigation.navigating) {
            log("Navigation to " + name + " scheduled");
            return navigation.schedule(name, options);
        }

        pageEl = pageEl || document.querySelector("div.page");
        name = name || homePageName;
        options = options || {};

        var nextFragmentId = toFragmentId(name, options),
            isOnSamePage = activeFragment && activeFragment._id === nextFragmentId,
            loadingPromise,
            optionsForcesUseOneInstance = !!(options.useOneInstance),
            cachedFragmentForcesUseOneInstance = !!(cache[nextFragmentId] && cache[nextFragmentId].winControl && cache[nextFragmentId].winControl.useOneInstance),
            historyItem = {},
            historyItemJSON = '',
            historyIndexOfItem = -1;

        if (name == "resumelastpage") {
            return resumeFromHistory(); 
        }

        
        historyItem.name = name;
        
        
        
        if (!optionsForcesUseOneInstance && !cachedFragmentForcesUseOneInstance) {
            historyItem.options = JSON.parse(JSON.stringify(options));
            ///<disable>JS2078</disable>
            historyForbiddenOptions.forEach(function (historyForbiddenOption) {
                if (historyForbiddenOption in historyItem.options) {
                    delete historyItem.options[historyForbiddenOption]; 
                }
            });
            if (JSON.stringify(historyItem.options) === "{}") {
                delete historyItem.options; 
            }
            ///<enable>JS2078</enable>
        }
        
        historyItemJSON = JSON.stringify(historyItem);
        historyIndexOfItem = history.indexOf(historyItemJSON);

        
        if (history.length >= 2 && history[history.length - 2] === historyItemJSON && name != "allHistory") {
            return navigateBack(options); 
        }

        if (isOnSamePage) {
            
            if (activeFragment.winControl && activeFragment.winControl.show) {
                activeFragment.winControl.show(activeFragment, options);
            }
            etwSession.stop();
            roboSky.write("Application,navigatedTo," + name);
            return WinJS.Promise.as();
        }

        
        if (!historyForbiddenPages.contains(name)) { 
            if (name === homePageName) {
                history = []; 
            } else {
                
                if (historyIndexOfItem > -1) {
                    history.splice(historyIndexOfItem, 1);
                }
            }

            history.push(historyItemJSON);

            if (history.length > historyLimit) {
                history.shift();
            }
        }

        Skype.Application.state.page = historyItem; 

        navigation.start();

        loadingPromise = loadFragment(name, options, etwSession); 
        
        return loadingPromise;
    }

    function navigateBack(options) {
        if (options && options.stopPropagation) { 
            return resumeFromHistory(true);
        } else {
            return resumeFromHistory(true, options); 
        }
    }

    function resumeFromHistory(stepBack, options) {
        var prev;

        if (history.length > 1) {
            if (stepBack) {
                history.pop(); 
            }

            prev = JSON.parse(history.pop()); 
            options = options || prev.options || {}; 
            options.isNavigatingBack = true;
            return navigate(prev.name, options);
        } else {
            return navigate(homePageName);
        }
    }

    function toFragmentId(name, options) {
        
        if (options && options.id && name !== homePageName) {
            
            
            return name + '_' + options.id;
        }
        return name;
    }

    function getFragmentFromCache(name, id) {
        if (name === homePageName) {
            return homePageFragmentContainer;
        }

        if (cache[name] && cache[name].winControl && cache[name].winControl.useOneInstance) {
            return cache[name];
        }
        return cache[id];
    }

    function loadFragment(name, options, etwSession) {
        
        options = options ? JSON.parse(JSON.stringify(options)) : {};
        if (!navigationContainer) { throw new Error("NavigationContainer not set in HTML"); }

        var id = toFragmentId(name, options),
            fragmentContainer = getFragmentFromCache(name, id);

        
        var renderingPromise = WinJS.Promise.as();
        if (!fragmentContainer) {
            
            fragmentContainer = document.createElement("div");
            fragmentContainer._id = id;
            fragmentContainer._name = name;

            WinJS.Utilities.addClass(fragmentContainer, "HIDDEN");
            fragmentContainer.setAttribute("aria-hidden", "true");
            
            WinJS.Utilities.addClass(fragmentContainer, name + "Container");
            navigationContainer.appendChild(fragmentContainer);
            renderingPromise = WinJS.UI.Pages.render("/pages/" + name + ".html", fragmentContainer, options)
                .then(onFragmentRendered)
                .then(_setupFragmentSwitch, _onRenderError);
        } else {
            
            var cacheIndex = cache._pages.indexOf(fragmentContainer._id);
            if (cacheIndex > -1 && cacheIndex < cache._pages.length - 1) {
                cache._pages.push(cache._pages.splice(cacheIndex, 1)[0]);
            }
            resetCacheLimitOverflowCheckTimer(); 
            _setupCachedFragmentSwitch();
        }

        function _onRenderError(err) {
            var msg = "unknown error";
            if (err) {
                if (typeof err === "string") {
                    msg = err;
                } else if (err.toString && (typeof (err) !== "object" || err.toString().substr(0, 7) != "[object")) {
                    msg = err.toString();
                } else {
                    var p = null;
                    for (p in err) {
                        if (typeof err[p] === "string") {
                            msg = err[p];
                            break;
                        }
                    }
                }
            }
            navigation.currentNavigation.error(err);
            log("navigation to " + name + " failed (" + msg + ")");
            return WinJS.Promise.wrapError(err);
        }

        function _setupFragmentSwitch(control) {
            var finalizePromise = new WinJS.Promise(function () { });
            _finalizeSwitchJob = WinJS.Utilities.Scheduler.schedule(function () {
                _finalizeFragmentSwitch(fragmentContainer, options, etwSession); 
                finalizePromise.complete();
            });

            WinJS.Promise.join([control.renderFinishedPromise, finalizePromise]).then(navigation.currentNavigation.complete.bind(navigation.currentNavigation),
                navigation.currentNavigation.error.bind(navigation.currentNavigation));

            WinJS.Promise.timeout(NAVIGATION_FALLBACK_TIMEOUT, navigation.currentNavigation.promise);

            return control;
        }

        function _setupCachedFragmentSwitch() {
            _finalizeFragmentSwitch(fragmentContainer, options, etwSession);
            navigation.currentNavigation.complete();
        }

        return renderingPromise;
    }

    function onFragmentRendered(control) {
        fixFragmentHistoryEntry(control);
        putFragmentToCache(control);
        return control;
    }

    function fixFragmentHistoryEntry(control) {
        var fragmentContainer = control.element.parentNode;

        
        if (fragmentContainer.winControl.useOneInstance && historyForbiddenPages.indexOf(fragmentContainer._name) === -1) {
            history[history.length - 1] = JSON.stringify({ name: fragmentContainer._name });
        }
    }

    function putFragmentToCache(control) {
        var fragmentContainer = control.element.parentNode;
        log('Navigation putFragmentToCache() (' + fragmentContainer._name + ') prev cache: ' + JSON.stringify(cache._pages));
        
        if (fragmentContainer._name === homePageName) {
            homePageFragmentContainer = fragmentContainer;
            return;
        }

        
        if (fragmentContainer.winControl.disposeOnHide) {
            return;
        }

        
        if (fragmentContainer.winControl.useOneInstance) {
            fragmentContainer._id = fragmentContainer._name;
        }
        cache[fragmentContainer._id] = fragmentContainer;

        cache._pages.push(fragmentContainer._id);

        
        resetCacheLimitOverflowCheckTimer();
    }

    function checkCacheLimitOverflow() {
        log('Navigation checkCacheLimitOverflow()');
        
        if (cache._pages.length <= CACHE_LIMIT) {
            return;
        }

        if (cache[cache._pages[0]] === activeFragment) {
            resetCacheLimitOverflowCheckTimer();
            return;
        }

        var fid = cache._pages[0];
        log('Navigation checkCacheLimitOverflow() overflow true, clearing oldest fragment from cache and disposing: ' + fid);
        disposeFragment(fid);
        resetCacheLimitOverflowCheckTimer(); 
    }

    function resetCacheLimitOverflowCheckTimer() {
        log('Navigation resetCacheLimitOverflowCheckTimer()');
        clearTimeout(cacheLimitOverflowCheckTimer);
        cacheLimitOverflowCheckTimer = setTimeout(checkCacheLimitOverflow, PAGE_DISPOSE_TIMEOUT);
    }

    function clearCacheLimitOverflowCheckTimer() {
        log('Navigation clearCacheLimitOverflowCheckTimer()');
        clearTimeout(cacheLimitOverflowCheckTimer);
        cacheLimitOverflowCheckTimer = null;
    }

    function disposeAll() {
        _disposeAllPages();
        _disposeAllComponents();
    }

    function _disposeAllPages() {
        log("_disposeAllPages()");
        
        if (activeFragment && activeFragment._name != "login" && activeFragment._name != "policyWarning") {
            WinJS.Utilities.removeClass(pageEl, activeFragment._name);
            activeFragment = null;
        }

        
        clearCacheLimitOverflowCheckTimer();
        _finalizeSwitchJob && _finalizeSwitchJob.cancel();

        while (cache._pages.length > 0) {
            var fid = cache._pages.shift();
            disposeFragment(fid);
        }

        
        if (homePageFragmentContainer) {
            Skype.UI.Util.removeFromDOM(homePageFragmentContainer);
            homePageFragmentContainer = null;
        }
    }

    function _disposeAllComponents() {
        log("_disposeAllComponents()");

        Skype.UI.MePanel.dispose();
        Skype.UI.ConversationSwitcher.dispose();
        Skype.UI.CallNotifications.dispose();
        Skype.Model.ConversationsRepository.dispose();
        Skype.Model.FavoriteConversationsRepository.dispose();
        Skype.Model.RecentConversationsRepository.dispose();
        Skype.Model.ContactsRepository.dispose();

        
        history = [];

        
        WinJS.Application.sessionState = { foo: "bar" };
        WinJS.Application.skypeWriteStateAsync();

        
        Skype.UI.AppBar.instance.handleSoftDispose();

        Skype.Model.AvatarUpdater.dispose();
    }

    function disposePage(name, options) {
        var id = toFragmentId(name, options);
        disposeFragment(id);
    }

    function disposeFragment(id) {
        log('Navigation disposeFragment(): ' + id);
        var fragmentContainer = cache[id];
        if (fragmentContainer) {
            var isInArray = cache._pages.indexOf(id);
            if (isInArray > -1) {
                cache._pages.splice(isInArray, 1);
            }

            clearTimeout(fragmentContainer._finalizeTimer);
            fragmentContainer._finalizeTimer = null;

            cache[id] = null;
            Skype.UI.Util.removeFromDOM(fragmentContainer);
        }
    }

    function _finalizeFragmentSwitch(next, options, etwSession) {
        log("Navigation _finalizeFragmentSwitch for '" + next._name);

        
        if (activeFragment && activeFragment !== next) {
            WinJS.Utilities.addClass(activeFragment, "HIDDEN");
            activeFragment.setAttribute("aria-hidden", "true");

            
            if (activeFragment.winControl) {
                if (activeFragment.winControl.disposeOnHide) {
                    activeFragment.parentNode.removeChild(activeFragment); 
                    Skype.UI.Framework.disposeSubTree(activeFragment);
                } else {
                    if (!activeFragment.winControl.isDisposed) {
                        activeFragment.winControl.hide && activeFragment.winControl.hide();
                    }
                }
            }

            WinJS.Utilities.removeClass(pageEl, navigate._previousFragName); 
        }

        if (pagesOrFragmentsWithUnreadButton.contains(next._name)) {
            
            Skype.UI.ConversationSwitcher.init();
        }

        
        
        
        WinJS.Utilities.addClass(pageEl, next._name); 
        navigate._previousFragName = next._name; 

        
        

        if (activeFragment !== next) {
            Skype.UI.animatePrepareStep(activeFragment, next);
        }

        WinJS.Utilities.removeClass(next, "HIDDEN");
        next.removeAttribute("aria-hidden");

        Skype.Application.state.navigated.dispatch(); 

        
        if (next.winControl && next.winControl.show) {
            next.winControl.show(next, options);
        }

        if (activeFragment !== next && next._name !== "login") { 
            Skype.UI.animate(next, true);
        }

        activeFragment = next;

        if (Skype.UI.AppBar && Skype.UI.AppBar.instance) {
            Skype.UI.AppBar.instance.updateFocusedView(Skype.Application.state.page);
        }

        
        if (focusExclusions.indexOf(next._name) == -1) {            
            var focusElement = (activeFragment && activeFragment.firstElementChild) ? activeFragment.firstElementChild : activeFragment;
            Skype.Application.state.page.defaultFocusElement = focusElement;
            focusElement.focus();
        }
        
        if (!etwSession) {
            etwSession = etw.createSession("navigate," + next._name, 0);
        }
        etwSession.stop();
        roboSky.write("Application,navigatedTo," + next._name);
        Skype.UI.ConversationSwitcher.mutateSwitcherIndex();
    }

    var navigationContainerControl = WinJS.Class.define(function (element) {
        navigationContainer = element;
    });

    WinJS.Namespace.define("Skype.UI", {
        navigate: navigate,
        navigateBack: navigateBack,
        navigationHistory: historyGetSet,
        softSessionState: {},
        disposeAll: disposeAll,
        disposePage: disposePage,
        NavigationContainer: navigationContainerControl
    });
})();