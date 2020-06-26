Jx.delayDefine(Mail, "Animator", function() {
    "use strict";
    function n() {
        return Mail.writeProfilerMark("Animator._waitForReadingPaneHeaderLoad", Mail.LogEvent.start),
        Mail.Promises.waitForEventWithTimeout(Mail.EventHook.globalSource, "readingPaneHeaderLoaded").then(function() {
            Mail.writeProfilerMark("Animator._waitForReadingPaneHeaderLoad", Mail.LogEvent.stop)
        })
    }
    Mail.Animator = function(n) {
        this.initEvents();
        this._guiState = n;
        this._isAnimating = false;
        this._navPaneBackground = this._navPane = this._navPaneHeader = this._viewSwitcher = null;
        this._messageListBackground = this._messageList = this._messageListListView = null;
        this._readingPane = null;
        this._welcomeMessage = null;
        this._listView = null;
        this._isMessageListAnimating = false;
        this._readingPaneHeaderPromise = null;
        this.animateEnterPage = function() {
            Mail.writeProfilerMark("Animator_animateEnterPage", Mail.LogEvent.start);
            var n = function() {
                this._isAnimating = false;
                Mail.writeProfilerMark("Animator_animateEnterPage", Mail.LogEvent.stop)
            }
            .bind(this)
              , t = function(t) {
                Jx.log.exception("animateEnterPage failed during execution with error: ", t);
                n()
            };
            return this._animateEnterPage().then(n, t)
        }
        .bind(this);
        this.animateExitPage = this._animateExitPage.bind(this);
        this.animateSwitchAccount = this._animateSwitchAccount.bind(this);
        this.animateSwitchView = this._animateSwitchView.bind(this);
        this.animateNavigateBack = this._animateNavigateBack.bind(this);
        this.animateNavigateForward = this._animateNavigateForward.bind(this);
        this._hooks = new Mail.Disposer(new Mail.EventHook(Mail.Globals.splashScreen,Mail.SplashScreen.Events.dismissed,this._onAppLaunch,this))
    }
    ;
    Mail.Animator.appLaunchAnimated = "appLaunchAnimated";
    Jx.augment(Mail.Animator, Jx.Events);
    Mail.Animator.prototype.setNavPaneElements = function(n, t, i, r) {
        this._navPaneBackground = n;
        this._navPane = t;
        this._navPaneHeader = i;
        this._viewSwitcher = r
    }
    ;
    Mail.Animator.prototype.setMessageListElements = function(n, t, i) {
        this._messageListBackground = n;
        this._messageList = t;
        this._messageListListView = i
    }
    ;
    Mail.Animator.prototype.setReadingPaneElements = function(n) {
        this._readingPane = n
    }
    ;
    Mail.Animator.prototype.setWelcomeMessageElement = function(n) {
        this._welcomeMessage = n
    }
    ;
    Object.defineProperty(Mail.Animator.prototype, "readingPaneContent", {
        get: function() {
            return this._readingPane.querySelector(".mailReadingPaneContent")
        },
        enumerable: true
    });
    Mail.Animator.prototype.dispose = function() {
        this._hooks.dispose()
    }
    ;
    Mail.Animator.prototype._onMessageListAnimationStarted = function() {
        this._messageListListView.classList.add("messageListAnimating")
    }
    ;
    Mail.Animator.prototype._onMessageListAnimationStopped = function() {
        this._messageListListView.classList.remove("messageListAnimating")
    }
    ;
    Mail.Animator.prototype._animateEnterPage = function() {
        var t = [], n;
        return !this._isAnimating && WinJS.UI.isAnimationEnabled() && (this._isAnimating = true,
        n = this._welcomeMessage,
        t.push(WinJS.UI.Animation.enterContent(n ? [[this._navPane], [n]] : [[this._navPane], [this._messageList], [this._readingPane]])),
        t.push(WinJS.UI.Animation.fadeIn(n ? [[this._navPaneBackground]] : [[this._navPaneBackground], [this._messageListBackground]]))),
        WinJS.Promise.join(t)
    }
    ;
    Mail.Animator.prototype._animateExitPage = function() {
        var n, t, i;
        return Mail.writeProfilerMark("Animator_animateExitPage", Mail.LogEvent.start),
        n = [],
        !this._isAnimating && WinJS.UI.isAnimationEnabled() && (this._isAnimating = true,
        n.push(WinJS.UI.Animation.exitPage([[this._navPane], [this._messageList], [this._readingPane]])),
        n.push(WinJS.UI.Animation.fadeOut([[this._navPaneBackground], [this._messageListBackground]]))),
        t = function() {
            this._isAnimating = false;
            Mail.writeProfilerMark("Animator_animateExitPage", Mail.LogEvent.stop)
        }
        .bind(this),
        i = function(n) {
            Jx.log.exception("_animateExitPage failed during execution with error: ", n);
            t()
        }
        ,
        WinJS.Promise.join(n).then(t, i)
    }
    ;
    Mail.Animator.prototype._onAppLaunch = function() {
        this._onMessageListAnimationStarted();
        this._animateEnterPage().done(function() {
            this._onMessageListAnimationStopped();
            Mail.writeProfilerMark("App launch animation complete");
            this.raiseEvent(Mail.Animator.appLaunchAnimated);
            this._isAnimating = false
        }
        .bind(this))
    }
    ;
    Mail.Animator.prototype._hideElements = function(n, t) {
        Mail.writeProfilerMark("Animator_hideElements", Mail.LogEvent.start);
        var i = [this.readingPaneContent];
        n && (i.push(this._viewSwitcher),
        i.push(this._navPaneHeader));
        t && i.push(this._messageList);
        i.forEach(function(n) {
            n.style.opacity = 0
        });
        Mail.writeProfilerMark("Animator_hideElements", Mail.LogEvent.stop)
    }
    ;
    Mail.Animator.prototype._removeStyleAttributes = function(n) {
        n.forEach(function(n) {
            n.removeAttribute("style")
        })
    }
    ;
    Mail.Animator.prototype._waitForReadingPaneHeaderLoad = function(t) {
        return Jx.isObject(this._readingPaneHeaderPromise) && t ? this._readingPaneHeaderPromise : n()
    }
    ;
    Mail.Animator.prototype._waitForReadingPaneBodyLoad = function() {
        return Mail.writeProfilerMark("Animator._waitForReadingPaneBodyLoad", Mail.LogEvent.start),
        Mail.Promises.waitForEventWithTimeout(Mail.EventHook.globalSource, "readingPaneBodyLoaded").then(function() {
            Mail.writeProfilerMark("Animator._waitForReadingPaneBodyLoad", Mail.LogEvent.stop)
        })
    }
    ;
    Mail.Animator.prototype._waitForMessageList = function() {
        return Mail.writeProfilerMark("Animator._waitForMessageList", Mail.LogEvent.start),
        WinJS.Promise.any([Mail.Promises.waitForEventWithTimeout(Mail.EventHook.globalSource, "mail-messageList-loadedEmptyFolder"), Mail.ListViewHelper.waitForListView(this._listView)]).then(function() {
            Mail.writeProfilerMark("Animator._waitForMessageList", Mail.LogEvent.stop)
        })
    }
    ;
    Mail.Animator.prototype._animateThreePaneInternal = function(n, t, i) {
        Mail.writeProfilerMark("Animator_animateSelection_wait_for_message_list", Mail.LogEvent.start);
        this._isMessageListAnimating ? (this._onMessageListAnimationStopped(),
        Mail.writeProfilerMark("Not animating the message list because animation is in progress")) : (n.done(function() {
            Mail.writeProfilerMark("Animator_animateSelection_wait_for_message_list", Mail.LogEvent.stop);
            Mail.writeProfilerMark("Animator.animateNewSelection.listViewEnterContent", Mail.LogEvent.start);
            WinJS.UI.Animation.enterContent(this._messageList).done(function() {
                Mail.writeProfilerMark("Animator.animateNewSelection.listViewEnterContent", Mail.LogEvent.stop);
                this._onMessageListAnimationStopped();
                this._isMessageListAnimating = false
            }
            .bind(this))
        }
        .bind(this)),
        this._isMessageListAnimating = true);
        Mail.writeProfilerMark("Animator_animateSelection_wait_for_reading_pane_header", Mail.LogEvent.start);
        t.done(function() {
            Mail.writeProfilerMark("Animator_animateSelection_wait_for_reading_pane_header", Mail.LogEvent.stop);
            WinJS.UI.Animation.enterContent(this.readingPaneContent)
        }
        .bind(this));
        Mail.writeProfilerMark("Animator_animateSelection_wait_for_reading_pane_body", Mail.LogEvent.start);
        i.done(function() {
            Mail.writeProfilerMark("Animator_animateSelection_wait_for_reading_pane_body", Mail.LogEvent.stop);
            n.cancel();
            t.cancel();
            this._isAnimating = false;
            Mail.writeProfilerMark("Animator_animateSelection_full_scenario", Mail.LogEvent.stop)
        }
        .bind(this))
    }
    ;
    Mail.Animator.prototype._animateThreePane = function(n) {
        if (Mail.writeProfilerMark("Animator._animateSelection", Mail.LogEvent.start),
        this._isAnimating || Mail.Globals.splashScreen.isShown) {
            Mail.writeProfilerMark("Animator._animateSelection", Mail.LogEvent.stop);
            return
        }
        Mail.writeProfilerMark("Animator_animateSelection_full_scenario", Mail.LogEvent.start);
        this._onMessageListAnimationStarted();
        this._isAnimating = true;
        this._hideElements(n, !this._isMessageListAnimating);
        var t = this._waitForMessageList()
          , i = this._waitForReadingPaneHeaderLoad(false)
          , r = this._waitForReadingPaneBodyLoad();
        n && WinJS.UI.Animation.enterContent([this._viewSwitcher, this._navPaneHeader]);
        this._animateThreePaneInternal(t, i, r);
        Mail.writeProfilerMark("Animator._animateSelection", Mail.LogEvent.stop)
    }
    ;
    Mail.Animator.prototype._animateOnePane = function(n) {
        if (!this._isAnimating) {
            this._isAnimating = true;
            this._onMessageListAnimationStarted();
            var t = [this._messageList];
            n && (t.push(this._viewSwitcher),
            t.push(this._navPaneHeader));
            this._waitForMessageList().then(function() {
                return WinJS.UI.Animation.enterContent(t)
            }).done(function() {
                this._removeStyleAttributes(t);
                this._isAnimating = false;
                this._onMessageListAnimationStopped()
            }
            .bind(this))
        }
    }
    ;
    Mail.Animator.prototype._animateSwitchAccount = function() {
        Mail.writeProfilerMark("Animator._animateSwitchAccount", Mail.LogEvent.start);
        this._animateSelection(true);
        Mail.writeProfilerMark("Animator._animateSwitchAccount", Mail.LogEvent.stop)
    }
    ;
    Mail.Animator.prototype._animateSwitchView = function() {
        Mail.writeProfilerMark("Animator._animateSwitchView", Mail.LogEvent.start);
        this._animateSelection(false);
        Mail.writeProfilerMark("Animator._animateSwitchView", Mail.LogEvent.stop)
    }
    ;
    Mail.Animator.prototype._animateNavigateBack = function() {
        !this._isAnimating && this._guiState.isReadingPaneActive ? (this._navPane.style.opacity = "0",
        this._messageList.style.opacity = "0",
        this._guiState.navigateBackward(),
        WinJS.UI.Animation.enterContent([this._navPane, this._messageList]).done(function() {
            this._removeStyleAttributes([this._navPane, this._messageList, this._readingPane])
        }
        .bind(this))) : this._guiState.navigateBackward()
    }
    ;
    Mail.Animator.prototype._animateNavigateForward = function(n, t) {
        if (this._isAnimating || Mail.Globals.splashScreen.isShown || !this._guiState.isNavPaneActive)
            n(),
            this._guiState.navigateForward();
        else {
            this._isAnimating = true;
            var i = WinJS.Promise.wrap();
            t || (i = this._waitForReadingPaneHeaderLoad(true));
            this._readingPane.style.opacity = "0";
            this._guiState.navigateForward();
            n();
            i.then(function() {
                return Mail.Promises.wrapWithRAF(WinJS.UI.Animation.enterContent.bind(null, this._readingPane))
            }
            .bind(this)).done(function() {
                this._removeStyleAttributes([this._readingPane]);
                this._isAnimating = false
            }
            .bind(this))
        }
    }
    ;
    Mail.Animator.prototype._animateSelection = function(n) {
        this._guiState.isThreePane ? this._animateThreePane(n) : this._animateOnePane(n)
    }
    ;
    Mail.Animator.prototype.registerMessageList = function(n) {
        this._listView = n
    }
    ;
    Mail.Animator.prototype.unregisterMessageList = function() {
        this._listView = null
    }
    ;
    Mail.Animator.prototype.shortFadeIn = function(n) {
        return WinJS.UI.executeTransition(n, {
            property: "opacity",
            delay: 0,
            duration: 85,
            timing: "linear",
            from: 0,
            to: 1
        })
    }
    ;
    Mail.Animator.prototype.shortFadeOut = function(n) {
        return WinJS.UI.executeTransition(n, {
            property: "opacity",
            delay: 0,
            duration: 85,
            timing: "linear",
            from: 1,
            to: 0
        })
    }
})
