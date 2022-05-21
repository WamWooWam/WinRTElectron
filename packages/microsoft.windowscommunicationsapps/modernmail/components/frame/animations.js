
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,WinJS,Jx,Debug*/

Jx.delayDefine(Mail, "Animator", function () {
    "use strict";

    Mail.Animator = function (guiState) {
        Debug.assert(Jx.isInstanceOf(guiState, Mail.GUIState));
        this.initEvents();

        this._guiState = guiState;
        this._isAnimating = false;
        this._navPaneBackground = this._navPane = this._navPaneHeader = this._viewSwitcher = null;
        this._messageListBackground = this._messageList = this._messageListListView = null;
        this._readingPane = null;
        this._welcomeMessage = null;
        this._listView = null;
        this._isMessageListAnimating = false;
        this._readingPaneHeaderPromise = null;

        this.animateEnterPage = function () {
            Mail.writeProfilerMark("Animator_animateEnterPage", Mail.LogEvent.start);

            var completionFunction = function () {
                    this._isAnimating = false;
                    Mail.writeProfilerMark("Animator_animateEnterPage", Mail.LogEvent.stop);
                } .bind(this),
                errorFunction = function (e) {
                    Jx.log.exception("animateEnterPage failed during execution with error: ", e);
                    Debug.assert(false, "animateEnterPage failed during execution with error: " + e);
                    completionFunction();
                };

            return this._animateEnterPage().then(completionFunction, errorFunction);
        }.bind(this);

        this.animateExitPage = this._animateExitPage.bind(this);
        this.animateSwitchAccount = this._animateSwitchAccount.bind(this);
        this.animateSwitchView = this._animateSwitchView.bind(this);
        this.animateNavigateBack = this._animateNavigateBack.bind(this);
        this.animateNavigateForward = this._animateNavigateForward.bind(this);

        this._hooks = new Mail.Disposer(
            new Mail.EventHook(Mail.Globals.splashScreen, Mail.SplashScreen.Events.dismissed, this._onAppLaunch, this)
        );

        Debug.only(Object.seal(this));
    };

    Mail.Animator.appLaunchAnimated = "appLaunchAnimated";
    Debug.Events.define(Mail.Animator.prototype, Mail.Animator.appLaunchAnimated);
    Jx.augment(Mail.Animator, Jx.Events);

    Mail.Animator.prototype.setNavPaneElements = function (navPaneBackground, navPane, header, viewSwitcher) {
        Debug.assert(Jx.isHTMLElement(navPaneBackground));
        Debug.assert(Jx.isHTMLElement(navPane));
        Debug.assert(Jx.isHTMLElement(header));
        Debug.assert(Jx.isHTMLElement(viewSwitcher));
        this._navPaneBackground = navPaneBackground;
        this._navPane = navPane;
        this._navPaneHeader = header;
        this._viewSwitcher = viewSwitcher;
    };

    Mail.Animator.prototype.setMessageListElements = function (messageListBackground, messageList, messageListListView) {
        Debug.assert(Jx.isHTMLElement(messageListBackground));
        Debug.assert(Jx.isHTMLElement(messageList));
        Debug.assert(Jx.isHTMLElement(messageListListView));
        this._messageListBackground = messageListBackground;
        this._messageList = messageList;
        this._messageListListView = messageListListView;
    };

    Mail.Animator.prototype.setReadingPaneElements = function (readingPane) {
        Debug.assert(Jx.isHTMLElement(readingPane));
        this._readingPane = readingPane;
    };

    Mail.Animator.prototype.setWelcomeMessageElement = function (welcomeMessage) {
        Debug.assert(Jx.isNullOrUndefined(welcomeMessage) || Jx.isHTMLElement(welcomeMessage));
        this._welcomeMessage = welcomeMessage;
    };

    Object.defineProperty(Mail.Animator.prototype, "readingPaneContent", {
        get: function () {
            return this._readingPane.querySelector(".mailReadingPaneContent");
        }, enumerable: true
    });

    Mail.Animator.prototype.dispose = function () {
        this._hooks.dispose();
    };

    Mail.Animator.prototype._onMessageListAnimationStarted = function () {
        this._messageListListView.classList.add("messageListAnimating");
    };

    Mail.Animator.prototype._onMessageListAnimationStopped = function () {
        this._messageListListView.classList.remove("messageListAnimating");
    };

    Mail.Animator.prototype._animateEnterPage = function () {
        var promises = [];

        // Animation can be disabled (Remote Desktop, Ease of Access, etc) - don't spend time to do animation
        if (!this._isAnimating && WinJS.UI.isAnimationEnabled()) {
            this._isAnimating = true;

            var welcomeMessage = this._welcomeMessage;
            promises.push(WinJS.UI.Animation.enterContent(welcomeMessage ?
                [[this._navPane], [welcomeMessage]] :
                [[this._navPane], [this._messageList], [this._readingPane]]
            ));
            promises.push(WinJS.UI.Animation.fadeIn(welcomeMessage ?
                [[this._navPaneBackground]] :
                [[this._navPaneBackground], [this._messageListBackground]]
            ));
        }

        return WinJS.Promise.join(promises);
    };

    Mail.Animator.prototype._animateExitPage = function () {
        Mail.writeProfilerMark("Animator_animateExitPage", Mail.LogEvent.start);

        var promises = [];

        // Animation can be disabled (Remote Desktop, Ease of Access, etc) or another one already executing - don't spend time to do animation in that case
        if (!this._isAnimating && WinJS.UI.isAnimationEnabled()) {
            this._isAnimating = true;
            promises.push(WinJS.UI.Animation.exitPage([[this._navPane], [this._messageList], [this._readingPane]]));
            promises.push(WinJS.UI.Animation.fadeOut([[this._navPaneBackground], [this._messageListBackground]]));
        }

        var completionFunction = function () {
                this._isAnimating = false;
                Mail.writeProfilerMark("Animator_animateExitPage", Mail.LogEvent.stop);
            } .bind(this),
            errorFunction = function (e) {
                Jx.log.exception("_animateExitPage failed during execution with error: ", e);
                Debug.assert(false, "_animateExitPage failed during execution with error: " + e);
                completionFunction();
            };

        return WinJS.Promise.join(promises).then(completionFunction, errorFunction);
    };

    Mail.Animator.prototype._onAppLaunch = function () {
        Debug.assert(!document.body.classList.contains("invisible"));

        this._onMessageListAnimationStarted();
        this._animateEnterPage().done(function () {
            this._onMessageListAnimationStopped();
            Mail.writeProfilerMark("App launch animation complete");
            this.raiseEvent(Mail.Animator.appLaunchAnimated);
            this._isAnimating = false;
        }.bind(this));
    };

    Mail.Animator.prototype._hideElements = function (includeNavPane, includeMessageList) {
        Mail.writeProfilerMark("Animator_hideElements", Mail.LogEvent.start);
        Debug.assert(Jx.isBoolean(includeNavPane));
        Debug.assert(Jx.isBoolean(includeMessageList));

        var elements = [this.readingPaneContent];
        if (includeNavPane) {
            elements.push(this._viewSwitcher);
            elements.push(this._navPaneHeader);
        }

        if (includeMessageList) {
            elements.push(this._messageList);
        }

        elements.forEach(function (element) { element.style.opacity = 0; });

        Mail.writeProfilerMark("Animator_hideElements", Mail.LogEvent.stop);
    };

    Mail.Animator.prototype._removeStyleAttributes = function (elements) {
        Debug.assert(Jx.isArray(elements));
        elements.forEach(function (element) { element.removeAttribute("style"); });
    };

    function createReadingPaneLoadingPromise() {
        Mail.writeProfilerMark("Animator._waitForReadingPaneHeaderLoad", Mail.LogEvent.start);
        return Mail.Promises.waitForEventWithTimeout(Mail.EventHook.globalSource, "readingPaneHeaderLoaded")
            .then(function () { Mail.writeProfilerMark("Animator._waitForReadingPaneHeaderLoad", Mail.LogEvent.stop); });
    }

    Mail.Animator.prototype._waitForReadingPaneHeaderLoad = function (earlyReturnIfLoaded) {
        Debug.assert(Jx.isBoolean(earlyReturnIfLoaded));
        if (Jx.isObject(this._readingPaneHeaderPromise) && earlyReturnIfLoaded) {
            return this._readingPaneHeaderPromise;
        }
        return createReadingPaneLoadingPromise();
    };

    Mail.Animator.prototype._waitForReadingPaneBodyLoad = function () {
        Mail.writeProfilerMark("Animator._waitForReadingPaneBodyLoad", Mail.LogEvent.start);
        return Mail.Promises.waitForEventWithTimeout(Mail.EventHook.globalSource, "readingPaneBodyLoaded")
            .then(function () { Mail.writeProfilerMark("Animator._waitForReadingPaneBodyLoad", Mail.LogEvent.stop); });
    };

    Mail.Animator.prototype._waitForMessageList = function () {
        Mail.writeProfilerMark("Animator._waitForMessageList", Mail.LogEvent.start);
        return WinJS.Promise.any([
            Mail.Promises.waitForEventWithTimeout(Mail.EventHook.globalSource, "mail-messageList-loadedEmptyFolder"),
            Mail.ListViewHelper.waitForListView(this._listView)
        ]).then(function () {
            Mail.writeProfilerMark("Animator._waitForMessageList", Mail.LogEvent.stop);
        });
    };

    Mail.Animator.prototype._animateThreePaneInternal = function (messageListPromise, readingPaneHeaderPromise, readingPaneBodyPromise) {
        Debug.assert(Jx.isObject(messageListPromise));
        Debug.assert(Jx.isObject(readingPaneHeaderPromise));
        Debug.assert(Jx.isObject(readingPaneBodyPromise));

        Mail.writeProfilerMark("Animator_animateSelection_wait_for_message_list", Mail.LogEvent.start);

        if (!this._isMessageListAnimating) {
            messageListPromise.done(function () {
                Mail.writeProfilerMark("Animator_animateSelection_wait_for_message_list", Mail.LogEvent.stop);
                Mail.writeProfilerMark("Animator.animateNewSelection.listViewEnterContent", Mail.LogEvent.start);
                WinJS.UI.Animation.enterContent(this._messageList).done(function () {
                    Mail.writeProfilerMark("Animator.animateNewSelection.listViewEnterContent", Mail.LogEvent.stop);
                    this._onMessageListAnimationStopped();
                    this._isMessageListAnimating = false;
                }.bind(this));
            }.bind(this));
            this._isMessageListAnimating = true;
        } else {
            this._onMessageListAnimationStopped();
            Mail.writeProfilerMark("Not animating the message list because animation is in progress");
        }
        Mail.writeProfilerMark("Animator_animateSelection_wait_for_reading_pane_header", Mail.LogEvent.start);
        readingPaneHeaderPromise.done(function () {
            Mail.writeProfilerMark("Animator_animateSelection_wait_for_reading_pane_header", Mail.LogEvent.stop);
            WinJS.UI.Animation.enterContent(this.readingPaneContent);
        }.bind(this));
        Mail.writeProfilerMark("Animator_animateSelection_wait_for_reading_pane_body", Mail.LogEvent.start);
        readingPaneBodyPromise.done(function () {
            Mail.writeProfilerMark("Animator_animateSelection_wait_for_reading_pane_body", Mail.LogEvent.stop);
            messageListPromise.cancel();
            readingPaneHeaderPromise.cancel();
            this._isAnimating = false;
            Mail.writeProfilerMark("Animator_animateSelection_full_scenario", Mail.LogEvent.stop);
        }.bind(this));
    };

    Mail.Animator.prototype._animateThreePane = function (includeNavPane) {
        Mail.writeProfilerMark("Animator._animateSelection", Mail.LogEvent.start);
        Debug.assert(Jx.isBoolean(includeNavPane));

        if (this._isAnimating || Mail.Globals.splashScreen.isShown /* no point to animate if the user won't see it*/) {
            Mail.writeProfilerMark("Animator._animateSelection", Mail.LogEvent.stop);
            return;
        }

        Debug.assert(this._guiState.isThreePane);
        Mail.writeProfilerMark("Animator_animateSelection_full_scenario", Mail.LogEvent.start);
        this._onMessageListAnimationStarted();
        this._isAnimating = true;

        this._hideElements(includeNavPane, !this._isMessageListAnimating /*include Message List*/);

        var messageListPromise = this._waitForMessageList(),
            readingPaneHeaderPromise = this._waitForReadingPaneHeaderLoad(false),
            readingPaneBodyPromise = this._waitForReadingPaneBodyLoad();

        if (includeNavPane) {
            WinJS.UI.Animation.enterContent([this._viewSwitcher, this._navPaneHeader]);
        }

        this._animateThreePaneInternal(messageListPromise, readingPaneHeaderPromise, readingPaneBodyPromise);
        Mail.writeProfilerMark("Animator._animateSelection", Mail.LogEvent.stop);
    };

    Mail.Animator.prototype._animateOnePane = function (isAccountSwitch) {
        Debug.assert(Jx.isBoolean(isAccountSwitch));

        if (!this._isAnimating) {
            this._isAnimating = true;
            this._onMessageListAnimationStarted();
            var elements = [this._messageList];
            if (isAccountSwitch) {
                elements.push(this._viewSwitcher);
                elements.push(this._navPaneHeader);
            }
            this._waitForMessageList().then(function () {
                return WinJS.UI.Animation.enterContent(elements);
            }).done(function () {
                this._removeStyleAttributes(elements);
                this._isAnimating = false;
                this._onMessageListAnimationStopped();
            }.bind(this));
        }
    };

    Mail.Animator.prototype._animateSwitchAccount = function () {
        Mail.writeProfilerMark("Animator._animateSwitchAccount", Mail.LogEvent.start);
        this._animateSelection(true /*isAccountSwitch*/);
        Mail.writeProfilerMark("Animator._animateSwitchAccount", Mail.LogEvent.stop);
    };

    Mail.Animator.prototype._animateSwitchView = function () {
        Mail.writeProfilerMark("Animator._animateSwitchView", Mail.LogEvent.start);
        this._animateSelection(false /*isAccountSwitch*/);
        Mail.writeProfilerMark("Animator._animateSwitchView", Mail.LogEvent.stop);
    };

    Mail.Animator.prototype._animateNavigateBack = function () {
        // This method can be invoked in three pane mode by keyboard or mouse shortcuts - don't animate
        if (!this._isAnimating && this._guiState.isReadingPaneActive) {
            this._navPane.style.opacity = "0";
            this._messageList.style.opacity = "0";
            this._guiState.navigateBackward(); // Switch panes

            WinJS.UI.Animation.enterContent([this._navPane, this._messageList]).done(function () { // Start animating in the new panes
                this._removeStyleAttributes([this._navPane, this._messageList, this._readingPane]); // Cleanup
            }.bind(this));
        } else {
            this._guiState.navigateBackward();
        }
    };

    Mail.Animator.prototype._animateNavigateForward = function (workItem, isSameSelection) {
        Debug.assert(Jx.isFunction(workItem));
        Debug.assert(Jx.isBoolean(isSameSelection));

        if (!this._isAnimating && !Mail.Globals.splashScreen.isShown && this._guiState.isNavPaneActive) {
            Debug.assert(this._guiState.isOnePane);

            this._isAnimating = true;

            var paneSwitchPromise = WinJS.Promise.wrap();

            if (!isSameSelection) { // Find out how long we need to wait before entering the new pane
                paneSwitchPromise = this._waitForReadingPaneHeaderLoad(true);
            }

            this._readingPane.style.opacity = "0";
            this._guiState.navigateForward(); // Switch panes
            workItem();

            paneSwitchPromise.then(function () {
                // On slow machines, the animation promise sometimes fulfills before the animation is visually finished. To keep the animation promise
                // honest, wrap it inside a requestAnimationFrame call and wait for the wrapped promise.
                return Mail.Promises.wrapWithRAF(WinJS.UI.Animation.enterContent.bind(null, this._readingPane)); // Start animating in the new pane
            }.bind(this)).done(function () {
                this._removeStyleAttributes([this._readingPane]); // Cleanup
                this._isAnimating = false;
            }.bind(this));
        } else {
            workItem();
            this._guiState.navigateForward(); // Switch panes
        }
    };

    Mail.Animator.prototype._animateSelection = function (isAccountSwitch) {
        Debug.assert(Jx.isBoolean(isAccountSwitch));
        if (this._guiState.isThreePane) {
            this._animateThreePane(isAccountSwitch /* includeNavPane = isAccountSwitch */);
        } else {
            this._animateOnePane(isAccountSwitch);
        }
    };

    Mail.Animator.prototype.registerMessageList = function (listView) {
        Debug.assert(Jx.isObject(listView));
        this._listView = listView;
    };

    Mail.Animator.prototype.unregisterMessageList = function () {
        this._listView = null;
    };

    Mail.Animator.prototype.shortFadeIn = function (/*@dynamic*/shown) {
        return WinJS.UI.executeTransition(
            shown,
            {
                property: "opacity",
                delay: 0,
                duration: 85,
                timing: "linear",
                from: 0,
                to: 1
            }
        );
    };

    Mail.Animator.prototype.shortFadeOut = function (/*@dynamic*/hidden) {
        return WinJS.UI.executeTransition(
            hidden,
            {
                property: "opacity",
                delay: 0,
                duration: 85,
                timing: "linear",
                from: 1,
                to: 0
            }
        );
    };

});
