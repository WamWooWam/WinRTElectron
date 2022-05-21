
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../../Shared/Jx/core/Jx.js"/>
/// <reference path="../../Shared/ContactForm/NameHelper.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../../Shared/ShareSource/ShareSource.js" />
/// <reference path="../../appframe/appframe.ref.js"/>
/// <reference path="../../appframe/main.js"/>
/// <reference path="MeCommands.js"/>
/// <reference path="ContactControlPosition.js"/>

Jx.delayDefine(People.Controls, "ProfileViewControl", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = P.Controls;
    var N = P.Nav;
    var L = P.Layout;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var _localeHelper = null;
    var _nameHelper = null;

    // ================================================================================================
    // Perf Helper.
    //// <event value="2002" task="meProfileViewAction" opcode="win:Start" symbol="meProfileViewAction_start"          template="meProfileActionTemplate"  keywords="profile"/>
    //// <event value="2003" task="meProfileViewAction" opcode="win:Stop"  symbol="meProfileViewAction_end"            template="meProfileActionTemplate"  keywords="profile"/>

    var perfProfileViewAction = function (actionOp, actionFunc) {
        return function () {
            try {
                NoShip.People.etw("meProfileViewAction_start", { action: actionOp });

                return actionFunc.apply(this, arguments);
            } finally {
                NoShip.People.etw("meProfileViewAction_end", { action: actionOp });
            }
        };
    };

    // ================================================================================================

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var ProfileViewControl = C.ProfileViewControl = /*@constructor*/function (host) {
        /// <summary>Creates the control.</summary>
        /// <param name="host" type="P.CpMain"/>
        Debug.assert(Jx.isObject(host));
        this._host = host;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var prototype = ProfileViewControl.prototype;

    prototype.load = perfProfileViewAction("load", _loadAction);
    /*@bind(ProfileViewControl)*/function _loadAction(/*@dynamic*/params) {
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

        // Add commands to the appbar
        this._jobSet.addUIJob(P.MeCommands, P.MeCommands.addCommands, [host], P.Priority.appbar);

        var layout = this._layout = host.getLayout();
        this._layoutChangedHandler = this._resizeContent;
        layout.addLayoutChangedEventListener(this._layoutChangedHandler, this);
        layout.addOrientationChangedEventListener(this._layoutChangedHandler, this);

        // Register to Share profile
        this._shareCallback = P.ShareSource.sharePersonCallback.bind(this, person);
        var app = /*@static_cast(P.App)*/Jx.app;
        app.addListener("sharesourcedatarequested", this._shareCallback);        
        
        // Set up IC
        var identityControlOptions = {
            interactive: true,
            onClick: function () {
                P.Nav.navigate(P.Nav.getEditMePictureUri());
            }
        };
        var ic = this._ic = new P.IdentityControl(this._person, this._jobSet, identityControlOptions);
        var icHTML = ic.getUI(P.IdentityElements.TileLayout, { primaryContent: null, className: "mePrfView-ic-me" });

        hostDiv.innerHTML = "<div id='meProfileViewControl' class='profileBase-container' aria-label='" + 
                                Jx.escapeHtml(Jx.res.getString("/strings/profileDetailPageAriaLabel")) + "'>" + 
                                "<div class='profile-icContainer'>" + icHTML + "</div>" +
                                "<div id='profileViewControl'></div>" +
                                "<div id='profileViewPadding' class='profileBase-paddingDiv' aria-disabled='true'></div>" +
                            "</div>";

        this._jobSet.addUIJob(this, /*@bind(ProfileViewControl)*/function () {
            this._loadForm();
            ic.activateUI(hostDiv);
            
            // Rehydrate if necessary
            var hydrateContext = params.context;
            if (params.mode === 'hydrate' && hydrateContext) {
                C.ContactControlPosition.setScrollPosition(hostDiv, /*@static_cast(ControlPositionDescriptor)*/hydrateContext);
            }
        }, null, P.Priority.next);
    };

    prototype.prepareSuspension = perfProfileViewAction("prepareSuspension", _prepareSuspensionAction);
    /*@bind(ProfileViewControl)*/ function _prepareSuspensionAction() {
        /// <summary>Serializes the current state of the control into an object.</summary>
        /// <returns type="Object"/>
        return C.ContactControlPosition.getScrollPosition(this._hostDiv);
    };
 
    prototype.activate = perfProfileViewAction("activate", function () {
    });

    prototype.deactivate = perfProfileViewAction("deactivate", _deactivateAction);
    /*@bind(ProfileViewControl)*/function _deactivateAction(forcedClose) {
        /// <summary> Called when the control is deactivated (being navigated away). 
        ///     Returns bool to indicate if it's okay to be navigated away. 
        ///     For example, if the control is an edit control, this is the 
        ///     chance to ask user if he/she wants to save the data before 
        ///     navigating away.</summary>
        /// <param name="forcedClose" type="Boolean" optional="true"> Is the control forced to be closed? If it's being forced 
        ///     to be closed, the host will not respect the return value. The control is responsible for saving
        ///     data or uncomitted work to avoid data loss.</param>
        /// <returns type="Boolean"> True if the page will go to the new location.
        ///     False if the page should not loose focusand remain the same. </returns>
        
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

        return true;
    };

    prototype.unload = perfProfileViewAction("unload", _unloadAction);
    /*@bind(ProfileViewControl)*/function _unloadAction() {
        ///<summary>Unloads the page</summary>

        Jx.dispose(this._jobSet);
        this._jobSet = null;

        this._person = null;

        if (this._ic) {
            this._ic.shutdownUI();
            this._ic = null;
        }
        
        this._hostDiv.innerHTML = "";

    };

    prototype._resize = function () {
        var div = this._hostDiv;
        this._cachedWidth = C.ContactControlPosition.update(this._layout, 
                                            this._cachedWidth, 
                                            div.querySelector("#profileViewControl"), 
                                            div.querySelector("#profileViewPadding"));
    };

    prototype._resizeContent = function () {
        /// <summary>Resize the content control</summary>
        this._jobSet.addUIJob(this, this._resize, null, P.Priority.realizeItem);
    };

    prototype._loadForm = function () {
        ///<summary>Load uiForm</summary>
        var resourceContext = P.UiForm.getMarket();

        var _jajpMarket = function () {
            return resourceContext.region === "JP";
        };

        var fieldOrder = {
            "ja-JP": {
                name: [ "lastName", "firstName", "yomiLastName", "yomiFirstName", "title", "suffix", "middleName" ]
            },
            firstLast : { // firstname / lastname order
                name: [ "title", "firstName", "middleName", "lastName", "suffix", "yomiFirstName", "yomiLastName" ]
            },
            lastFirst : { // lastname / firstname order
                name: [ "title", "lastName", "firstName", "suffix", "yomiLastName", "yomiFirstName", "middleName" ]
            }
        };

        var fieldList = {
            // Name
            title: { group: 'name', active: false },
            firstName: { group: 'name', active: false },
            middleName: { group: 'name', active: false },
            lastName: { group: 'name', active: false },
            suffix: { group: 'name', active: false },
            yomiFirstName: { group: 'name', active: false, display: _jajpMarket },
            yomiLastName: { group: 'name', active: false, display: _jajpMarket },

            // Contact Info
            significantOther: { group: 'contactInfo', active: false },
            homePhoneNumber: { group: 'contactInfo', type: 'tel' },
            mobilePhoneNumber: { group: 'contactInfo', type: 'tel' },
            homeFaxNumber: { group: 'contactInfo', active: false },
            personalEmailAddress: { group: 'contactInfo', type: 'email' },
            homeLocation: { group: 'contactInfo', type: 'mapLocation' },

            // Work Info
            jobTitle: { group: 'workInfo', active: false },
            company: { group: 'workInfo', active: false },
            yomiCompanyName: { group: 'workInfo', active: false },
            businessPhoneNumber: { group: 'workInfo', type: 'tel' },
            pagerNumber: { group: 'workInfo', active: false },
            businessFaxNumber: { group: 'workInfo', active: false },
            businessEmailAddress: { group: 'workInfo', type: 'email' },
            businessLocation: { group: 'workInfo', type: 'mapLocation' }
        };

        var groupList = {
            name: {},
            contactInfo: {},
            workInfo: {}
        };

        if (!_localeHelper) {
            _localeHelper = new P.LocaleHelper();
        }
        if (!_nameHelper) {
            _nameHelper = new P.NameHelper(_localeHelper);
        }
        var viewFieldOrder = fieldOrder[_localeHelper.locale];
        if (!viewFieldOrder) {
            viewFieldOrder = fieldOrder["firstLast"];
            if (!_nameHelper.IsFirstLast()) {
                viewFieldOrder = fieldOrder["lastFirst"];
            }
        }
        _processList(fieldList, groupList, viewFieldOrder);

        this._jobSet.addUIJob(this, /*@bind(ProfileViewControl)*/function () {
            var viewControl = new P.UiForm({
                fieldList: fieldList,
                groupList: groupList,
                loc: Jx.res,
                cssPrefix: "mePrfView-",
                residPrefix: "/meStrings/meCtrl_"
            });
            viewControl.createViewForm(this._hostDiv.querySelector("#profileViewControl"), this._person);
            this._resizeContent();
        }, null, P.Priority.next);
    };

    function _processList(fieldList, groupList, fieldOrder) {
        for (var groupName in groupList) {
            if (!groupList[groupName].fieldList) {
                groupList[groupName].fieldList = [];
            }

            var order = fieldOrder[groupName];
            if (!order) {
                for (var fieldName in fieldList) {
                    var group = fieldList[fieldName].group;
                    if (groupName === group) {
                        groupList[group].fieldList.push(fieldName);
                    }
                }
            } else {
                groupList[groupName].fieldList = order;
            }
        }
    };

});
