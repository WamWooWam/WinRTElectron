
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Jx,Debug,People,Microsoft,NoShip,WinJS,$include*/

Jx.delayDefine(People.Accounts, "ConnectedAccounts", function () {

    var P = window.People,
        A = P.Accounts,
        Plat = Microsoft.WindowsLive.Platform;

    var ConnectedAccounts = A.ConnectedAccounts = function (scenario, jobSet, displayOnTwoLines, disabled) {
        ///<summary>"Connected To:" control displaying connected accounts</summary>
        ///<param name="scenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario">scenario</param>
        ///<param name="jobSet" type="P.JobSet" optional="true" />
        ///<param name="displayOnTwoLines" type="Boolean" optional="true">True for showing label and icons in two lines, false for showing both in one line. Default to false.</param>
        ///<param name="disabled" type="Boolean" optional="true">True for removing event listeners, false for retaining. Default to false. </param>
        this._scenario = scenario;
        this._jobSet = jobSet ? jobSet.createChild() : (new P.Scheduler()).getJobSet();
        this._disabled = disabled ? disabled : false;
        this._ellipsisShowing = false;
        this._displayOnTwoLines = displayOnTwoLines ? displayOnTwoLines : false;
        this._control = /* @static_cast(HTMLElement) */null;
        this._accountTemplate = /* @static_cast(HTMLElement) */null;
        this._canvasParent = /* @static_cast(HTMLElement) */null;
        this._canvas = /* @static_cast(HTMLElement) */null;
        this._accounts = /* @static_cast(HTMLElement) */null;
        this._ellipsis = /* @static_cast(HTMLElement) */null;
        this._platform = /* @static_cast(Microsoft.WindowsLive.Platform) */null;
        this._deferredCollection = /* @static_cast(P.DeferredCollection) */null;
        this._assets = [];
        this._animating = false;
        this._pendingChanges = false;
        this._populatedUI = false;

        this._onAccountUpdated = this._jobSet.addUIJob.bind(this._jobSet, this, this._crossFadeChanges, null, P.Priority.propertyUpdate);
        this.initComponent();

        $include("$(cssResources)/" + Jx.getAppNameFromId(Jx.appId) + "ConnectedAccounts.css");
    };
    Jx.inherit(ConnectedAccounts, Jx.Component);

    Object.defineProperty(ConnectedAccounts.prototype, "disabled", {
        get: function () {
            return this._disabled;
        },
        set: function (value) {
            if (this._disabled !== value) {
                this._updateDisabledState(value);
            }
        }
    });

    ConnectedAccounts.prototype.setPlatform = function (platform) {
        this._platform = platform;
    };

    ConnectedAccounts.prototype.getElement = function () {
        return this._control;
    };

    ConnectedAccounts.prototype.isPopulated = function () {
        return this._populatedUI;
    };

    ConnectedAccounts.prototype.getUI = function (ui) {
        var styleClasses = this._displayOnTwoLines ? " displayOnTwoLines" : "";

        ui.html =
            "<div id='" + this._id + "' class='connectedAccounts' role='link'>" +
                "<div class='connectedAccounts-label connectedAccounts-inlineBlock connectedAccounts-bottomAligned typeSizeSmall " + styleClasses + "'></div>" +
                "<div class='connectedAccounts-inlineBlock connectedAccounts-bottomAligned " + styleClasses + "'>" +
                    "<div class='connectedAccounts-canvasContainer' >" +
                        "<div class='connectedAccounts-canvas'>" +
                            "<div class='connectedAccounts-accounts connectedAccounts-inlineBlock'></div>" +
                            "<div class='connectedAccounts-ellipsis connectedAccounts-inlineBlock connectedAccounts-bottomAligned' style='display: none'>...</div>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
            "</div>";
    };

    ConnectedAccounts.prototype._updateDisabledState = function (isDisabled) {
        this._disabled = isDisabled;
        var control = this._control;
        Debug.assert(Jx.isHTMLElement(control));
        Jx.setClass(control, "disabled", isDisabled);
        control.setAttribute("aria-disabled", isDisabled);
        control.tabIndex = isDisabled ? -1 : 0;
    };

    ConnectedAccounts.prototype._setCanvasElements = function (canvas) {
        this._canvas = canvas;
        this._accounts = canvas.querySelector(".connectedAccounts-accounts");
        this._accounts.innerHTML = "";
        this._ellipsis = canvas.querySelector(".connectedAccounts-ellipsis");
    };

    ConnectedAccounts.prototype.activateUI = function () {
        var control = this._control = document.getElementById(this._id);
        this._updateDisabledState(this._disabled); // set accessibility attributes

        var templateContainer = document.createElement("div");
        templateContainer.innerHTML = "<div id='connectedAccounts-accountTemplate' class='connectedAccounts-account connectedAccounts-inlineBlock connectedAccounts-bottomAligned'>" +
                                         "<div class='connectedAccounts-icon' ></div>" +
                                      "</div>";
        this._accountTemplate = templateContainer.firstChild;

        this._setCanvasElements(control.querySelector(".connectedAccounts-canvas"));
        this._canvasParent = this._canvas.parentNode;

        Debug.assert(Jx.isObject(this._platform), "Must call setPlatform before activateUI");
        this._jobSet.addUIJob(this, this._query, null, P.Priority.connectedAccounts);

        Jx.Component.prototype.activateUI.call(this);
    };

    ConnectedAccounts.prototype._query = function () {
        var collection = this._platform.accountManager.getConnectedAccountsByScenario(this._scenario, Plat.ConnectedFilter.normal, Plat.AccountSort.rank);
        this._deferredCollection = new P.DeferredCollection(collection, this);
        var control = this._control;

        // Set label string
        control.querySelector(".connectedAccounts-label").innerText = Jx.res.loadCompoundString("/accountsStrings/connectedAccounts-label");

        // Listen for click
        control.addEventListener("click", this._onClickHandler = this._onClick.bind(this), false);
        control.addEventListener("keydown", this._onKeyDownHandler = this._onKeyDown.bind(this), false);

        this._populateUI();
    };

    ConnectedAccounts.prototype._disposeAssets = function () {
        this._assets.forEach(Jx.dispose);
        this._assets = [];
    };

    ConnectedAccounts.prototype._populateUI = function () {
        // populate the connected accounts list
        var accountNames = [];
        this._disposeAssets();
        for (var i = 0, len = Math.min(ConnectedAccounts.maxCount, this._deferredCollection.length); i < len; i++) {
            var account = this._deferredCollection.getItem(i);
            if (!Jx.isNullOrUndefined(account)) {
                var binder = new P.PlatformObjectBinder(account);
                var assetSource = binder.createAccessor(this._onAccountUpdated);
                var element = this._createNewAccountElement(assetSource);
                this._assets.push(binder);
                this._accounts.appendChild(element);
                accountNames.push(assetSource.displayName);
            }
        }
        var accountsLabel = accountNames.join(", ");

        // set aria-label on the overall container
        var resId = (this._deferredCollection.length > ConnectedAccounts.maxCount) ?
            "/accountsStrings/connectedAccounts-ariaLabelMoreAccounts" : "/accountsStrings/connectedAccounts-ariaLabel";
        var ariaLabel = Jx.res.loadCompoundString(resId, accountsLabel);
        this._control.setAttribute("aria-label", ariaLabel);
        this._populatedUI = true;
        this._setEllipsis();
    };

    ConnectedAccounts.prototype._shouldEllipsisShow = function () {
        return this._deferredCollection.length > ConnectedAccounts.maxCount;
    };

    ConnectedAccounts.prototype._setEllipsis = function () {
        var showEllipsis = this._shouldEllipsisShow();
        if (showEllipsis !== this._ellipsisShowing) {
            this._ellipsisShowing = showEllipsis;
            this._ellipsis.style.display = showEllipsis ? "" : "none";
        }
    };

    ConnectedAccounts.prototype._onClick = function () {
        if (!this._disabled) {
            Jx.log.info("ConnectedAccounts control activated by user");
            P.Accounts.showAccountSettingsPage(this._platform, this._scenario, P.Accounts.AccountSettingsPage.connectedAccounts, { launchedFromApp: true });
        }
    };

    ConnectedAccounts.prototype._onKeyDown = function (ev) {
        if (ev.key === "Spacebar" || ev.key === "Enter") {
            this._onClick(ev);
            ev.preventDefault();
        }
    };

    ConnectedAccounts.prototype._onAnimationEnd = function (priorCanvas) {
        this._canvasParent.removeChild(priorCanvas);
        NoShip.People.etw("connectedAnimation_end");
        this._animating = false;
        if (this._pendingChanges) {
            this.onChangesPending();
        }
    };

    function makeAnimationData(from, to) {
        /// <summary>A simple helper to create a collision-free name, and standard delay, duration, and timings.</summary>
        return {
            name: "ConnectedAccountsCrossFade" + Jx.uid(),
            delay: 0,
            duration: 167,
            timing: "linear",
            from: from,
            to: to
        };
    }

    // There exists no animation in WinJS that does quite what we want.  The existing crossFade animation doesn't handle
    // layout quite right and the executeTransition animation often does not invoke its callbacks.
    function customCrossFade(container, incoming, outgoing) {
        if (People.Animation.disabled) {
            return WinJS.Promise.wrap();
        }

        var incomingPromise = WinJS.UI.executeAnimation([incoming], makeAnimationData("width: " + outgoing.offsetWidth + "px; opacity: 0", "width: " + incoming.offsetWidth + "px; opacity: 1")),
            outgoingPromise = WinJS.UI.executeAnimation([outgoing], makeAnimationData("opacity: 1", "opacity: 0"));

        return WinJS.Promise.join([incomingPromise, outgoingPromise]);
    }

    ConnectedAccounts.prototype._crossFadeChanges = function () {
        /// <summary> Animate changes with a crossfade animation.  The custom crossfade animation involves setting the
        /// CSS position of old canavs to 'absolute' in order to ensure elements don't "move/pop around" but
        /// rather lay on top of one another.</summary>
        NoShip.People.etw("connectedAnimation_start");
        this._animating = true;

        var priorCanvas = this._canvas,
            priorCanvasStyle = priorCanvas.style;

        this._setCanvasElements(priorCanvas.cloneNode(true));
        this._populateUI();
        priorCanvasStyle.position = "absolute";
        this._canvasParent.appendChild(this._canvas);

        var that = this;
        customCrossFade(this._canvasParent, this._canvas, priorCanvas).done(function () {
            that._onAnimationEnd(priorCanvas);
        }, function () {
            that._onAnimationEnd(priorCanvas);
        });
    };

    ConnectedAccounts.prototype._createNewAccountElement = function (assetSource) {
        ///<summary>Create new account element</summary>
        ///<param name="assetSource" type="Object">Account to create new element</param>
        var clone = this._accountTemplate.cloneNode(true);
        clone.id = "";
        var accountImg = clone.firstChild;
        accountImg.style.backgroundImage = "url(" + assetSource.iconSmallUrl + ")";
        accountImg.setAttribute("aria-label", assetSource.displayName);
        return clone;
    };

    ConnectedAccounts.prototype.onChangesPending = function () {
        this._jobSet.addUIJob(this, this._applyChanges, null, P.Priority.connectedAccounts);
    };

    ConnectedAccounts.prototype._applyChanges = function () {
        if (!this._animating) {
            this._pendingChanges = false;

            this._deferredCollection.acceptPendingChanges();
            this._crossFadeChanges();
        } else {
            this._pendingChanges = true;
        }
    };

    ConnectedAccounts.prototype.deactivateUI = function () {
        Jx.dispose(this._deferredCollection);
        this._deferredCollection = null;
        this._jobSet.cancelJobs();
        this._control.removeEventListener("click", this._onClickHandler, false);
        this._control.removeEventListener("keydown", this._onKeyDownHandler, false);
        Jx.Component.prototype.deactivateUI.call(this);
    };

    ConnectedAccounts.prototype.shutdownComponent = function () {
        this._disposeAssets();
        this._jobSet.dispose();
        this._jobSet = null;
        this._platform = null;
        Jx.Component.prototype.shutdownComponent.call(this);
    };

    ConnectedAccounts.maxCount = 4;
    Object.freeze(ConnectedAccounts);

});
