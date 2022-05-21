
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/Bici/Bici.js"/>
/// <reference path="../../Shared/ShareSource/ShareSource.js" />
/// <reference path="../../../Shared/jx/core/jx.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>

Jx.delayDefine(People.Controls, "ContactViewControl", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = P.Controls;
    var N = P.Nav;
    var L = P.Layout;
    var CtrlPos = C.ContactControlPosition;
    var InstruID = Microsoft.WindowsLive.Instrumentation.Ids;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.enableLiveProfile = false;

    // ================================================================================================
    // Perf Helper.
    //// <event value="2502" task="profileViewAction" opcode="win:Start" symbol="profileViewAction_start" template="profileActionTemplate" keywords="profile" level="win:Informational"/>
    //// <event value="2503" task="profileViewAction" opcode="win:Stop"  symbol="profileViewAction_end"   template="profileActionTemplate" keywords="profile" level="win:Informational"/>
    function perfContactViewAction(actionOp, actionFunc) {
        return function () {
            try {
                NoShip.People.etw("profileViewAction_start", { action: actionOp });

                return actionFunc.apply(this, arguments);
            } finally {
                NoShip.People.etw("profileViewAction_end", { action: actionOp });
            }
        };
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var ContactViewControl = C.ContactViewControl = /*@constructor*/function (host) {
        /// <summary>Creates the control.</summary>
        /// <param name="host" type="P.CpMain"/>
        Debug.assert(Jx.isObject(host));
        this._host = host;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var prototype = ContactViewControl.prototype;

    prototype.load = perfContactViewAction("load", _loadAction);
    /*@bind(ContactViewControl)*/function _loadAction(/*@dynamic*/params) {
        /// <summary>Loads the control in the page.</summary>
        /// <param name="params" type="Object">
        ///     The params contains an object which includes the mode, data, fields, context.
        ///     params.element specifies the hosting element;
        ///     params.mode specifies if it's hydration vs. a new load;
        ///     params.data specifies the data object to be displayed in the page;
        ///     params.fields specifies other fields from deep linking;
        ///     params.context specifies the hydration data. This is the object returned by prepareSuspension;
        ///     params.state specifies the state saved for the control. This is the object returned by prepareSaveStates.
        /// </param>
        
        Debug.assert(Jx.isObject(params), "invalid argument: params");
        $include("$(cssResources)/controls-people.css");

        var person = this._person = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/params.data;
        Debug.assert(Jx.isObject(person));
        var hostDiv = this._hostDiv = /*@static_cast(HTMLElement)*/params.element;
        Debug.assert(Jx.isHTMLElement(hostDiv));
        var host = this._host;

        this._cachedWidth = 0;
        this._jobSet = host.getJobSet().createChild();
        
        var layout = this._layout = host.getLayout();
        this._layoutChangedHandler = this._resizeContent;
        layout.addLayoutChangedEventListener(this._layoutChangedHandler, this);
        layout.addOrientationChangedEventListener(this._layoutChangedHandler, this);

        // Register to Share this person.
        this._shareCallback = P.ShareSource.sharePersonCallback.bind(this, person);
        var app = /*@static_cast(P.App)*/Jx.app;
        app.addListener("sharesourcedatarequested", this._shareCallback);

        // Set up the IC
        var ic = this._ic = new P.IdentityControl(person, this._jobSet, { interactive: false });
        var icHTML = ic.getUI(P.IdentityElements.TileLayout, {
            primaryContent: null,
            secondaryContent: { element: P.IdentityElements.Networks, className: "profileView-icNetworks" }
        });

        hostDiv.innerHTML = "<div id='contactViewContainer' class='profileBase-container' aria-label='" + 
                                Jx.escapeHtml(Jx.res.getString("/strings/profileDetailPageAriaLabel")) + "'>" + 
                                "<div class='profile-icContainer'>" + icHTML + "</div>" +
                                "<div id='contactViewControl'></div>" +
                                "<div id='contactViewPadding' class='profileBase-paddingDiv' aria-disabled='true'></div>" +
                            "</div>";

        var hydrateContext = params.context;
        this._jobSet.addUIJob(this, /*@bind(ContactViewControl)*/function () {
            this._loadContent(hostDiv.querySelector("#contactViewControl"), person, hydrateContext);
            ic.activateUI(hostDiv);
            
            // Rehydrate if necessary
            if (params.mode === 'hydrate' && hydrateContext) {
                CtrlPos.setScrollPosition(hostDiv, /*@static_cast(ControlPositionDescriptor)*/hydrateContext);
            }
        }, null, P.Priority.next);
        
        this._augmentAction = /*@static_cast(Windows.Foundation.IAsyncAction)*/null;
    };

    prototype.prepareSuspension = perfContactViewAction("prepareSuspension", _prepareSuspensionAction);
    /*@bind(ContactViewControl)*/function _prepareSuspensionAction() {
        /// <summary>Serializes the current state of the control into an object.</summary>
        /// <returns type="Object"/>
        return CtrlPos.getScrollPosition(this._hostDiv);
    };

    prototype.activate = perfContactViewAction("activate", function () {
    });

    prototype._loadContent = perfContactViewAction("loadContent", _loadContentAction);
    /*@bind(ContactViewControl)*/function _loadContentAction(div, person, hydrateContext) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">The data object to be displayed in the page.</param>
        /// <param name="hydrateContext" type="Object">Optional hydration information to be used for displaying the page.</param>

        // Load the form, and set it up to reload if the linked contact set changes
        this._pendingUpdate = false;
        var binder = this._binder = new P.PlatformObjectBinder(person);
        this._accessor = /*@static_cast(People.PersonAccessor)*/binder.createAccessor(this._updateForm.bind(this, div));
        this._loadForm(div);

        // Add commands to the appbar
        var host = this._host;
        this._jobSet.addUIJob(this, P.ContactCommands.addCommands.bind(P.ContactCommands, host, binder), null, P.Priority.appbar);

        // We only want to increment the BI/CI counter(s) if we are not re-hydrating
        if (!Boolean(hydrateContext)) {
            Jx.bici.increment(InstruID.People.profileDetailsView, 1);
            if (person.isFavorite) {
                Jx.bici.increment(InstruID.People.profileDetailsViewFavorite, 1);
            } else {
                Jx.bici.increment(InstruID.People.profileDetailsViewNonFavorite, 1);
            }
        }

        Jx.mark("People.ContactViewControl._loadContent:prfvTrackStartup_end,Info,People,Profile");
        Jx.ptStop("People-ProfileLoad");
    };

    prototype._augmentPerson = function () {
        ///<summary>Call platform API to augment person with GAL contact</summary>
        this._disposeAugmentAction();
        try {
            Jx.log.info("Calling augmentViaServerAsync on person: " + this._person.objectId);
            this._augmentAction = this._person.augmentViaServerAsync(false);
        } catch (err) {
            Jx.log.exception("Error calling augmentViaServerAsync on person: " + this._person.objectId, err);
        }
    };

    prototype._disposeAugmentAction = function () {
        var augmentAction = this._augmentAction;
        if (augmentAction) {
            augmentAction.cancel();
            this._augmentAction = null;
        }
    };
    
    prototype._resize = function () {
        var div = this._hostDiv;
        this._cachedWidth = CtrlPos.update(this._layout, 
                                            this._cachedWidth, 
                                            div.querySelector("#contactViewControl"), 
                                            div.querySelector("#contactViewPadding"));
    };

    prototype._resizeContent = function () {
        /// <summary>Resize the content control</summary>
        this._jobSet.addUIJob(this, this._resize, null, P.Priority.realizeItem);
    };

    prototype._loadForm = function (div) {
        /// <summary>Loads the form into the IC control</summary>
        /// <param name="div" type="HTMLElement"/>
        Debug.assert(Jx.isHTMLElement(div));

        var contacts = this._accessor.linkedContacts.map(function (contact) {
            /// <param name="contact" type="P.ContactAccessor"/>
            /// <returns type="P.ContactAccessor"/>
            // If the contact is deleted during the call to _loadForm， 
            // we'll get exception in uiform code. Use contact accessor to avoid that.
            return contact.createAccessor(null);
        });

        
        if (P.enableLiveProfile) {
            // We don't want the page to update when properties change, because we haven't tested that.
            // If we wanted that, we'd could just omit this map statement and pass the accessors through.
            contacts = this._accessor.linkedContacts;
        }
        

        var uniqueFields = P.Contact.createUniqueFields(contacts);
        var uiform = new P.UiForm({
            fieldList: P.Contact.viewFieldList,
            groupList: P.Contact.getViewGroupList(),
            loc: Jx.res,
            cssPrefix: "profileView-",
            residPrefix: "/strings/profile_"
        });
        uiform.createViewForm(div, contacts, uniqueFields);
        this._resizeContent();

        // Augment person to get GAL information. Page will refresh if the agumentation results in updated properties.
        this._augmentPerson();
    };

    prototype._updateForm = function (div) {
        /// <summary>Reloads the form in response to changes</summary>
        /// <param name="div" type="HTMLElement"/>
        Debug.assert(Jx.isHTMLElement(div));

        if (!this._pendingUpdate) {
            this._pendingUpdate = true;
            this._jobSet.addUIJob(this, /*@bind(ContactViewControl)*/function () {
                this._pendingUpdate = false;
                
                // Save state and clear the old control
                var displayDiv = this._hostDiv.querySelector("#contactViewContainer");
                var oldScrollLeft = displayDiv.scrollLeft;
                var oldScrollTop = displayDiv.scrollTop;
                div.innerHTML = '';

                // Reload the control and reset the scroll position
                this._loadForm(div);
                displayDiv.scrollLeft = oldScrollLeft;
                displayDiv.scrollTop = oldScrollTop;

            }, null, P.Priority.realizeItem);
        }
    };

    prototype.deactivate = perfContactViewAction("deactivate", _deactivateAction);
    /*@bind(ContactViewControl)*/function _deactivateAction(forceClose) {
        /// <summary>Called when the control is deactivated (being navigated away). 
        ///     Returns bool to indicate if it's okay to be navigated away. 
        ///     If it returns true, the page will go to the new location.
        ///     If it returns false, the page will remain the same.
        ///     For example, if the control is an edit control, this is the 
        ///     chance to ask user if he/she wants to save the data before 
        ///     navigating away.</summary>
        /// <param name="forceClose" type="Boolean">Is the control forced to be closed? If it's being forced 
        ///     to be closed, the host will not respect the return value. The control is responsible for saving
        ///     data or uncomitted work to avoid data loss.</param>

        if (this._shareCallback) {
            var app = /*@static_cast(P.App)*/Jx.app;
            app.removeListener("sharesourcedatarequested", this._shareCallback);
            this._shareCallback = null;
        }

        if (this._layoutChangedHandler) {
            this._layout.removeLayoutChangedEventListener(this._layoutChangedHandler, this);
            this._layout.removeOrientationChangedEventListener(this._layoutChangedHandler, this);
            this._layoutChangedHandler = null;
        }

        var jobSet = this._jobSet;
        if (jobSet) {
            jobSet.cancelAllChildJobs();
        }
        
        this._disposeAugmentAction();
 
        return true;
    };

    prototype.unload = perfContactViewAction("unload", _unloadAction);
    /*@bind(ContactViewControl)*/function _unloadAction() {
        ///<summary>Unloads the page</summary>

        Jx.dispose(this._binder);
        this._binder = null;
        this._accessor = null;

        if (this._ic) {
            this._ic.shutdownUI();
            this._ic = null;
        }

        Jx.dispose(this._jobSet);
        this._jobSet = null;

        this._person = null;

        this._hostDiv.innerHTML = "";
    };
});
