
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../Shared/JsUtil/namespace.js"/>
/// <reference path="Main.js"/>
/// <reference path="../Shared/Navigation/UriGenerator.js"/>
/// <reference path="AppFrame.ref.js"/>

Jx.delayDefine(People, "CpContent", function () {

    function _markInfo(s) { Jx.mark("People.CpContent." + s + ",Info,People,AppFrame"); }

    var P = window.People;
    var N = window.People.Nav;

    P.CpContent = /* @constructor*/function (jobSet) {
        /// <summary>Constructor</summary>
        this._name = "People.CpContent";
        this.initComponent();

        this._jobSet = jobSet.createChild("CpContent");

        // Hosted controls
        this._controlMap = new P.ControlMap();
        this._control = /*@static_cast(AppControl)*/null;

        // Arrays that cache the outgoing elements and pages for animation
        this._leftoverControls = [];
        this._container = /*@static_cast(HTMLElement)*/null;
        this._pendingEnterAnimation = false;
        this._outgoingElements = [];

        
        // Overwrite the controls with mocks if desired.
        if (N.useMockPages) {
            this.useMockPages();
        }
        
    };

    
    P.CpContent.prototype.useMockPages = function () {
        /// <summary>Test hook for automation</summary>
        NoShip.$include("$(peopleRoot)/AppFrame/MockControls.js");
        Jx.log.info("People.CpContent.useMockPages");
        P.MockPages.replaceControlsWithMocks(this._controlMap);
    };
    

    Jx.augment(P.CpContent, Jx.Component);

    P.CpContent.prototype.deactivateUI = function () {
        /// <summary>Called on application shutdown UI.</summary>
        // cleanup unloaded controls in case deactivateUI is called before animation is completed.
        this._cleanupLeftoverControls();

        if (Jx.isNonEmptyString(this._page) && !Jx.isNullOrUndefined(this._control)) {
            this._unloadControl(this._page, this._control);
        }

        Jx.Component.prototype.deactivateUI.call(this);
    };

    P.CpContent.prototype._cleanupLeftoverControls = function () {
        /// <summary>Clean up(unload) the controls used in previous pages.</summary>
        this._leftoverControls.forEach(/*@bind(P.CpContent)*/function (pageControl) {
            /// <param name="pageControl" type="ContentPageControl"/>
            this._unloadControl(pageControl.page, pageControl.control);
        }, this);
        this._leftoverControls = [];
    };

    P.CpContent.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="JxUI">Returns the object which contains html and css properties.</param>
        ui.html = '<div id="content_container" class="content-container"></div>';
    };

    P.CpContent.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        Jx.log.info("People.CpContent.activateUI");
        this._container = document.getElementById("content_container");
        Jx.Component.prototype.activateUI.call(this);
    };

    P.CpContent.prototype._getControl = function (page) {
        /// <summary>Gets the control that should be hosted in the given page.</summary>
        /// <param name="page" type="String">Identifier for the page.</param>
        /// <returns type="AppControl">Returns the cached control for the page.</returns>
        var control = null;
        var controlName = N.Pages[page].control;
        if (controlName) {
            var /*@type(ControlCreator)*/cntrlDef = this._controlMap[controlName];
            if (cntrlDef.scriptSrc) {
                NoShip.People.etw("controlLoadScript_start");
                $include(cntrlDef.scriptSrc);
                NoShip.People.etw("controlLoadScript_end");
            }
            control = cntrlDef.createInstance();
        }

        return control;
    };

    P.CpContent.prototype._currentControlName = "";
    P.CpContent.prototype._page = "";

    function getControlStateName(controlName) {
        /// <summary>Generate the name for saving control state</summary>
        return controlName + "_state";
    }

    function saveControlState(controlName, control) {
        /// <summary>Saves state data for the control to setting.</summary>
        /// <param name="controlName" type="String">The name of the control.</param>
        /// <param name="control" type="AppControl">The control object.</param>
        if (control.prepareSaveState) {
            var controlState = control.prepareSaveState();
            var cpMain = /*@static_cast(P.CpMain)*/Jx.root;
            getControlStateContainer().setObject(getControlStateName(controlName), { version: cpMain.getHydraDataVersion(), controlState: controlState });
        }
    }

    function loadControlState(controlName, control) {
        /// <summary>Loads state data for the control.</summary>
        /// <param name="controlName" type="String">The name of the control.</param>
        /// <param name="control" type="AppControl">The control object.</param>
        /// <returns type="Object">The data object saved by the control in saveControlState.</returns>
        var controlState = null;
        if (control.prepareSaveState) {
            var stateName = getControlStateName(controlName);
            var container = getControlStateContainer();
            var /*@dynamic*/controlStateData = container.getObject(stateName);
            container.setObject(stateName, {});
            var cpMain = /*@static_cast(P.CpMain)*/Jx.root;
            if (controlStateData && controlStateData.version === cpMain.getHydraDataVersion()) {
                controlState = controlStateData.controlState;
            }
        }
        return controlState;
    }

    function getControlBackState(controlName, control) {
        /// <summary>Saves the back-state for the current control</summary>
        /// <param name="controlName" type="String">The name of the control.</param>
        /// <param name="control" type="AppControl">The control object.</param>
        /// <returns type="Object">The state to save.</returns>
        if (control.prepareSaveBackState) {
            return control.prepareSaveBackState();
        }

        return null;
    }

    function getControlStateContainer() {
        /// <summary>Returns appdata container that is used for control state data</summary>
        /// <returns type="Jx.AppDataContainer"/>
        return Jx.appData.localSettings().container("controlState");
    }

    P.CpContent.clearControlState = function () {
        /// <summary>Remove control state data</summary>
        Jx.appData.localSettings().deleteContainer("controlState");
    };

    P.CpContent.prototype.getCurrentLocationState = function () {
        /// <summary>Returns the location specific state</summary>
        /// <returns type="Object"/>
        var state = null;
        if (Jx.isNonEmptyString(this._page) && !Jx.isNullOrUndefined(this._control)) {
            state = getControlBackState(this._currentControlName, this._control);
        }
        return state;
    };

    P.CpContent.prototype.deactivate = function (forceClose) {
        /// <summary>Deactivate the current active control.</summary>
        /// <param name="forceClose" type="Boolean" optional="true">If it's being force closed, the caller will not respect the return value.</param>
        /// <returns type="Boolean">Returns if deactivating the current control is allowed. The control can choose to not allow
        ///     user leaving the page without doing some actions such as save the uncommitted work. If forceClose is false and it
        ///     returns false, navigation out of the page will be prevented.</returns>
        var canClose = true;
        var /*@type(AppControl)*/currentControl = this._control;
        if (currentControl) {
            canClose = currentControl.deactivate(forceClose);
            if (canClose === undefined) {
                // If the control isn't returning a valid value, fix it. Otherwise we get stuck in the page.
                canClose = true;
            }
            if (!forceClose && !canClose) {
                Jx.log.info("People.CpContent.deactivate: can't deactivate current hosted control " + this._currentControlName);
            }
            if (forceClose) {
                Jx.log.info("People.CpContent.deactivate: current hosted control " + this._currentControlName + " is being forced to be closed ");
            }
        }
        return canClose;
    };

    P.CpContent.prototype._clearEntering = Jx.fnEmpty;

    P.CpContent.prototype.setupUpdate = function (page) {
        /// <summary>Setup the DOM tree to host both incoming and outgoing control.
        /// Create the element to host incoming control and add it to DOM tree.
        /// The element that hosts the outgoing control will be removed after animation is complete.</summary>   
        NoShip.People.etw("appFrameAnimationSetup_start", { target: "content" });

        // If there's uncommited jobs for the current page, cancel them. This prevents job being run on the wrong page when fast navigation happens.
        this._jobSet.cancelJobs();

        // When the search input box has focus we should keep that focus across page transitions.
        // If we temporarily set the focus to the body then we can lose input between this setupUpdate call and the eventual setDefaultFocus call.
        var searchInputBox = document.getElementsByClassName("win-searchbox-input").item(0);
        if ((document.activeElement != searchInputBox) || (page !== N.Pages.allcontacts.id)) {
            document.body.setActive();
        }

        if (Jx.isNonEmptyString(this._currentControlName)) {
            // Remove the leftover from previous animation if it hasn't completed. This could happen if
            // user navigates fast enough that the animation from previous page is still executing.
            // Or the old control threw exception in load function.
            this._cleanupAnimations();
            Debug.assert(this._outgoingElements.length === 0);

            var outgoing = this._outgoing = this._container;
            Debug.assert(outgoing);
            var incoming = this._container = document.createElement("div");
            incoming.id = "content_container";
            outgoing.parentNode.appendChild(incoming);  
            outgoing.id = "idOutgoingContent";

            var noHeaderScene = P.CpHeader.Scenes.none;
            var pts = P.CpTitle.PageToScene;
            // The content position is not the same for all pages (selfpage doesn't have appframe header).
            // To avoid content being pushed down/up during page transition, explicitly set position to be fixed.
            if (pts[this._page] === noHeaderScene || pts[page] === noHeaderScene) {
                var outgoingHeight = outgoing.offsetHeight;
                var outgoingTop = outgoing.parentNode.offsetTop;
                outgoing.style.position = 'fixed';
                outgoing.style.height = String(outgoingHeight) + 'px'; // Prevent content container from growing
                outgoing.style.top = String(outgoingTop) + 'px';
            }
            Debug.call(Array.prototype.push, this._outgoingElements, outgoing);

            if (!Jx.isNullOrUndefined(this._control)) {
                this._leftoverControls.push({ page: this._page, control: this._control });
            }
        }
        NoShip.People.etw("appFrameAnimationSetup_end", { target: "content" });
    };

    P.CpContent.prototype._cleanupAnimations = Jx.fnEmpty;

    P.CpContent.prototype.update = function (page, /*@dynamic*/data, fields, context, backState, trigger) {
        /// <summary>Loads the control and host it in the app frame.</summary>
        /// <param name="page" type="String">Identifier for the page</param>
        /// <param name="data">The data for the page. For most pages, this is the person object. For search, this is the query string.</param>
        /// <param name="fields" type="Object">The customized fields retrieved from deep linking</param>
        /// <param name="context" type="Object">The hydration data object</param>
        /// <param name="backState" type="Object">The back-stack state.</param>
        /// <param name="trigger" type="String">What triggered the navigation. Currently 'back' or undefined.</param>
        /// <returns type="WinJS.Promise">The promise holding the results from the control load/update</returns>
        Jx.log.info("People.CpContent.update: " + page);

        // Verify that when the control expects a person object, we do have the person object.
        Debug.assert((N.Pages[page].requirePerson && Jx.isObject(data)) || (!N.Pages[page].requirePerson && !Jx.isObject(data)) || (page === N.Pages.search.id));

        var control = this._getControl(page);
        Debug.assert(Jx.isObject(control));
        if (control) {
            var /*@type(AppControl)*/oldControl = this._control;
            var cpMain = /*@static_cast(P.CpMain)*/Jx.root;
            if (oldControl) {
                if (trigger !== 'back') {
                    // We are moving forward, so we should save data for the current control.
                    cpMain.setBackStateOfTopItem(getControlBackState(this._currentControlName, oldControl));
                }

                cpMain.getCommandBar().reset();
            }

            var incomingDiv = this._container;
            incomingDiv.className = "content-container under";
            var controlName = N.Pages[page].control;
            // Load the control state if it supports saving state. This state is separate from the hydration data.
            // It persists per control whereas the hydration data persists per app.
            var controlState = loadControlState(controlName, control) || backState;
            var mode = (context === null) ? "load" : "hydrate";
            var focusHandled = false;
            var contentReadyPromise = WinJS.Promise.wrap();
            var params = { element: incomingDiv, mode: mode, data: data, fields: fields, context: context, state: controlState };
            var contentAnimationData = control.load(params);
            contentReadyPromise = WinJS.Promise.wrap(contentAnimationData);
            focusHandled = !!control.activate();

            this._currentControlName = controlName;
            this._page = page;
            this._control = control;

            var outgoingDiv = this._outgoing;
            this._outgoing = null;
            var animData = null;
            this._cleanupAnimations = function () {
                NoShip.People.etw("appFrameAnimationCleanup_start", { target: "content" });
                if (animData) {
                    animData.onExitComplete = animData.onEnterComplete = Jx.fnEmpty;
                }
                outgoingDiv = this._removeOutgoing(outgoingDiv);
                this._cleanupAnimations = Jx.fnEmpty;
                this._cleanupLeftoverControls();
                NoShip.People.etw("appFrameAnimationCleanup_end", { target: "content" });
            };
            var that = this;
            return contentReadyPromise.then(function (/*@dynamic*/contentResult) {
                contentResult = contentResult || {};
                var entering = contentResult.elements || [incomingDiv];
                var enteringFlattened = P.Sequence.flatten(entering);
                Jx.removeClass(incomingDiv, "under");
                Jx.addClass(incomingDiv, "entering");
                if (outgoingDiv) {
                    Jx.addClass(outgoingDiv, "under");
                }
                enteringFlattened.forEach(function (/*@type(HTMLElement)*/e) { e.style.opacity = "0"; });
                animData = {
                    entering: entering,
                    exiting: outgoingDiv ? [outgoingDiv] : [],
                    onExitComplete: function () {
                        outgoingDiv = that._removeOutgoing(outgoingDiv);
                        that._cleanupLeftoverControls();
                    },
                    onEnterComplete: function () {
                        Jx.removeClass(incomingDiv, "entering");
                        if (contentResult.onEnterComplete) {
                            Debug.assert(Jx.isFunction(contentResult.onEnterComplete));
                            contentResult.onEnterComplete.call(control);
                        }
                        if (!focusHandled) {
                            that._jobSet.addUIJob(that, that._setDefaultFocus, null, P.Priority.focus);
                        }
                        animData = null;
                        that._cleanupAnimations();
                    }
                };
                return animData;
            });
        }

        return WinJS.Promise.wrap({
            entering: [],
            exiting: []
        });
    };

    P.CpContent.prototype._removeOutgoing = function (/*@type(HTMLElement)*/outgoingDiv) {
        if (outgoingDiv) {
            P.Animation.removeOutgoingElement(outgoingDiv);
            Debug.call(P.Sequence.remove, null, this._outgoingElements, outgoingDiv);
        }
        return null;
    };

    P.CpContent.prototype._setDefaultFocus = function (incomingDiv) {
        /// <summary>Set focus to an item in the control.</summary>
        var currentFocus = document.activeElement;
        // Only set focus if focus is not currently set (activeElement was set to body in setupUpdate if focus
        // was not previously on the search input box)
        if (Jx.isHTMLElement(currentFocus) && currentFocus === document.body) {
            this.setDefaultFocus();
        }
    };

    P.CpContent.prototype.setDefaultFocus = function () {
        /// <summary>Set focus to an item in the control.</summary>
        Jx.log.info("People.CpContent.setDefaultFocus");
        var activeElement;
        // We'll pick the first visible keyboard accessible item from the control.
        // Currently none of the elements in the control are using tabIndex with greater than 0.
        var focusableElements = this._container.querySelectorAll("[tabIndex='0']");
        for (var i = 0, len = focusableElements.length; i < len; i++) {
            var el = /* @static_cast(HTMLElement)*/focusableElements[i];
            // Check if the element is visible. Note that it triggers a layout pass.
            if (el.offsetWidth > 0 && el.offsetHeight > 0 && getComputedStyle(el).visibility !== "hidden") {
                activeElement = el;
                break;
            }
        }

        if (activeElement) {
            Jx.safeSetActive(activeElement);
        }
    };

    P.CpContent.prototype._unloadControl = function (page, control) {
        ///<summary>Unload the control</summary>
        /// <param name="page" type="String">Name of the page</param>
        /// <param name="control" type="AppControl">control</param>
        Debug.assert(Jx.isNonEmptyString(page));
        Debug.assert(control);
        if (control) {
            NoShip.People.etw("controlUnload_start", { pageName: page });

            // Give the control a chance to save state before deactivate.
            saveControlState(N.Pages[page].control, control);

            control.unload();

            NoShip.People.etw("controlUnload_end", { pageName: page });
        }
    };

    P.CpContent.prototype.trackStartup = function () {
        ///<summary>Informs the control it should report its startup perfTrack point</summary>
        var control = this._control;
        if (Jx.isObject(control) && Jx.isFunction(control.trackStartup)) {
            control.trackStartup();
        }
    };

    P.CpContent.prototype.prepareSuspension = function () {
        /// <summary>Prepare for going to suspension.</summary>
        /// <returns>Returns the data object to be saved for resuming.</returns>
        var data = null;
        if (this._currentControlName) {
            var /*@type(AppControl)*/currentControl = this._control;
            if (currentControl) {
                data = currentControl.prepareSuspension();
            }
        }
        return data;
    };

    P.CpContent.prototype.getControl = function () {
        /// <summary>Get current control.</summary>
        /// <returns type="AppControl">The current control</returns>
        return this._control;
    };

    P.CpContent.prototype.getAddressBookControl = function () {
        /// <summary>Get the address book control.</summary>
        /// <returns type="P.AddressBookPage">The address book control</returns>

        // Should only be called from address book page.
        Debug.assert(this._currentControlName === N.Pages.viewab.control);
        if (this._currentControlName === N.Pages.viewab.control) {
            return this._control;
        }
        return null;
    };
    
    P.CpContent.prototype.scrollToBeginning = function () {
        /// <summary>Scroll to beginning of the page.</summary>
        if (Jx.isFunction(this._control.scrollToBeginning)) {
            this._control.scrollToBeginning();
        }
    };

    P.CpContent.prototype.trackNavStart = function (page) {
        /// <summary>
        /// Logs the ETW and PerfTrack events necessary to track the loading start time of the page controls, this includes
        /// additional point required for perfTrack (if defined).
        /// </summary>
        /// <param name="page" type="String">Identifier for the page.</param>
        Debug.assert(N.Pages[page] && N.Pages[page].control, "Page " + page + " is not defined in the map!");

        var /*@type(ControlCreator)*/cntrlDef = this._controlMap[N.Pages[page].control];
        if (cntrlDef.navStartEvent) {
            _markInfo("trackNavStart:" + cntrlDef.navStartEvent);
        }
        if (cntrlDef.perfTrackStart) {
            Jx.ptStart(cntrlDef.perfTrackStart);
        }
    };

    P.CpContent.prototype.trackNavEnd = function (page) {
        /// <summary>
        /// Logs the ETW and PerfTrack events necessary to track the loading end time of the page controls, this includes
        /// additional point required for perfTrack (if defined).
        /// </summary>
        /// <param name="page" type="String">Identifier for the page.</param>
        Debug.assert(N.Pages[page] && N.Pages[page].control, "Page " + page + " is not defined in the map!");

        var /*@type(ControlCreator)*/cntrlDef = this._controlMap[N.Pages[page].control];
        if (cntrlDef.navEndEvent) {
            _markInfo("trackNavEnd:" + cntrlDef.navEndEvent);
        }
        if (cntrlDef.perfTrackStop) {
            Jx.ptStop(cntrlDef.perfTrackStop);
        }
    };
});
