
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/JsUtil/include.js" />
/// <reference path="../../Shared/Bici/Bici.js"/>
/// <reference path="../../../Shared/jx/core/jx.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../../appframe/appframe.ref.js"/>
/// <reference path="../../appframe/FrameCommands.js"/>
/// <reference path="../../appframe/main.js"/>
/// <reference path="ContactControlPosition.js"/>

Jx.delayDefine(People.Controls, "ContactEditControl", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = P.Controls;
    var N = P.Nav;
    var L = P.Layout;
    var CtrlPos = C.ContactControlPosition;
    var Plat = Microsoft.WindowsLive.Platform;
    var InstruID = Microsoft.WindowsLive.Instrumentation.Ids;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var c_containerOffsetLeft = 120;

    // ================================================================================================
    // Perf Helper.
    //// <event value="2504" task="profileEditAction" opcode="win:Start" symbol="profileEditAction_start" template="profileActionTemplate" keywords="profile" level="win:Informational"/>
    //// <event value="2505" task="profileEditAction" opcode="win:Stop"  symbol="profileEditAction_end"   template="profileActionTemplate" keywords="profile" level="win:Informational"/>
    function perfContactEditAction(actionOp, actionFunc) {
        return function () {
            try {
                NoShip.People.etw("profileEditAction_start", { action: actionOp });

                return actionFunc.apply(this, arguments);
            } finally {
                NoShip.People.etw("profileEditAction_end", { action: actionOp });
            }
        };
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var ContactEditControl = C.ContactEditControl = /* @constructor*/function (host) {
        /// <summary>Creates the hosted control.</summary>
        /// <param name="host" type="P.CpMain"/>
        Debug.assert(Jx.isObject(host));
        this._host = host;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var prototype = C.ContactEditControl.prototype;
    prototype._uiform = /*@static_cast(P.UiForm)*/ null;
    prototype._contact = /*@static_cast(Plat.IContact)*/null;
    prototype._person = /*@static_cast(Plat.Person)*/null;
    prototype._timeout = null;
    prototype._onFocus = null;
    prototype._personChangedListener = null;
    prototype._contactChangedListener = null;
    prototype._leavePage = null;
    prototype._personBinder = null;
    prototype._personAccessor = /*@static_cast(P.PersonAccessor)*/null;
    prototype._contactAccessor = /*@static_cast(P.ContactAccessor)*/null;
    prototype._commitContact = /*@static_cast(P.CommitContact)*/null;

    prototype.load = perfContactEditAction("load", _loadAction);
    /*@bind(ContactEditControl)*/function _loadAction(/*@dynamic*/params) {
        /// <summary>Loads the control in the page.</summary>
        /// <param name="params" type="Object">
        ///     The params contains an object which includes the mode, data, fields, context.
        ///     params.element specifies the hosting element;
        ///     params.mode specifies if it's hydration vs. a new load;
        ///     params.data specifies the data object to be displayed in the page;
        ///     params.fields specifies other fields from deep linking;
        ///     params.context specifies the hydration data. This is the object returned by prepareSuspension;
        ///     params.state specifies the state saved for the control. This is the object returned by prepareSaveState and prepareSaveBackState.
        /// </param>

        Debug.assert(Jx.isObject(params), "invalid argument: params");
        $include("$(cssResources)/controls-people.css");

        var hostDiv = this._hostDiv = /*@static_cast(HTMLElement)*/params.element;
        Debug.assert(Jx.isHTMLElement(hostDiv));

        this._cachedWidth = 0;
        this._explicitLeave = false;

        var host = this._host;
        this._jobSet = host.getJobSet().createChild();

        this._setContact(/*@static_cast(Plat.Person)*/params.data, params.fields);

        var contact = this._contact;
        var frameCommands = host.getFrameCommands();
        if (!Jx.isNullOrUndefined(contact) && contact.canDelete) {
            frameCommands.addCommand(new P.Command("cmdid_profile_delete", null, "/strings/profileFrameButtonDelete_tooltip", "\uE107", true, true, this, this._onDelete));
        }
        frameCommands.addCommand(new P.Command("cmdid_profile_save", null, "/strings/profileFrameButtonSave_tooltip", "\uE105", true, true, this, this._onSave));
        frameCommands.addCommand(new P.Command("cmdid_profile_cancel", null, "/strings/profileFrameButtonCancel_tooltip", "\uE10A", true, true, this, this._onCancel));

        var layout = this._layout = host.getLayout();
        this._layoutChangedHandler = this._resizeContent;
        layout.addLayoutChangedEventListener(this._resizeContent, this);
        layout.addOrientationChangedEventListener(this._resizeContent, this);

        hostDiv.innerHTML = "<div id='displayDiv_addLinkEdit' class='profileBase-container' aria-label='" + 
                                Jx.escapeHtml(Jx.res.getString("/strings/editContactHeader")) + "'>" + 
                                "<div id='contactEditControl'></div>" +
                                "<div id='contactEditPadding' class='profileBase-paddingDiv' aria-disabled='true'></div>" +
                            "</div>";

        var hydrateContext = params.context || params.state;
        this._jobSet.addUIJob(this, /*@bind(ContactEditControl)*/function () {
            this._loadContent(hostDiv.querySelector("#contactEditControl"), hydrateContext);

            // Rehydrate if necessary
            if (params.mode === 'hydrate' && hydrateContext) {
                CtrlPos.setScrollPosition(hostDiv, /*@static_cast(ControlPositionDescriptor)*/hydrateContext);
            }
        }, null, P.Priority.next);
    };

    prototype._setContact = function (person, /*@dynamic*/fields) {
        /// <param name="person" type="Plat.Person">The associated person.</param>
        this._person = person;
        var personBinder = this._personBinder = person ? new P.PlatformObjectBinder(person) : null;
        var personAccessor = this._personAccessor = personBinder ? /*@static_cast(P.PersonAccessor)*/personBinder.createAccessor() : null;
        if (personBinder) {
            personBinder.getCollection(this._onContactDelete.bind(this), "linkedContacts");
        }

        var contact = /*@static_cast(Plat.IContact)*/null;
        var contactId = fields && fields.contactId ? fields.contactId : null;
        // If the contact is deleted during the call to _loadContent, we'll get exception in uiform code. Use contact accessor to avoid that.
        var contactAccessor = /*@static_cast(P.ContactAccessor)*/null;

        // Select either the first editable contact or the designated contact.
        if (personAccessor) {
            var linked = personAccessor.linkedContacts;
            for (var i = 0, len = linked.length; i < len; i++) {
                var lc = /*@static_cast(P.ContactAccessor)*/linked[i];
                if (lc.canEdit && (!contactId || lc.objectId === contactId)) {
                    contactAccessor = lc;
                    contact = /*@static_cast(Plat.IContact)*/lc.getPlatformObject();
                    break;
                }
            }
        }

        this._contact = contact;
        this._contactAccessor = contactAccessor;
    };

    prototype.prepareSaveBackState = function () {
        /// <summary>Returns the back-state object for the control. If an edit page is on back stack, 
        /// the modified data will be resumed if user uses back button to return to the page.</summary>
        /// <returns type="Object">This includes the scroll positions and the uncommitted data in the form.</returns>
 
        var hydrateObject = null;
        // Only do so if the edit page will be on the back stack. In common cases where user use save/cancel/delete 
        // to leave the page, there's no need to save any state.
        if (!this._explicitLeave) {
            hydrateObject = this._getCurrentState();
        }
        return hydrateObject;
    };

    prototype.prepareSuspension = perfContactEditAction("prepareSuspension", _prepareSuspensionAction);
    /*@bind(ContactEditControl)*/function _prepareSuspensionAction() {
        /// <summary>Serializes the current state of the control into an object.</summary>
        /// <returns type="Object">This includes the scroll positions and the uncommitted data in the form.</returns>

        return this._getCurrentState();
    };
    
    prototype._getCurrentState = function () {
        /// <summary>Serializes the current state of the control into an object.</summary>
        /// <returns type="Object">This includes the scroll positions and the uncommitted data in the form.</returns>

        var state = CtrlPos.getScrollPosition(this._hostDiv);
        if (this._uiform) {
            state.form = this._uiform.dehydrateEditForm(this._contact);
        }
        return state;
    };

    prototype.activate = perfContactEditAction("activate", function () {
    });

    prototype.deactivate = function (forceClose) {
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

        Jx.dispose(this._commitContact);
        this._commitContact = null;

        if (this._layoutChangedHandler) {
            this._layout.removeLayoutChangedEventListener(this._resizeContent, this);
            this._layout.removeOrientationChangedEventListener(this._resizeContent, this);
            this._layoutChangedHandler = null;
        }

        var jobSet = this._jobSet;
        if (jobSet) {
            jobSet.cancelAllChildJobs();
        }

        return true;
    };

    prototype.unload = function () {
        /// <summary>Called by the appframe to unload the page</summary>
        this._uiform = null;

        Jx.dispose(this._jobSet);
        this._jobSet = null;

        Jx.dispose(this._personBinder);
        this._personBinder = null;

        this._personAccessor = null;
        this._contactAccessor = null;
        this._person = null;
        this._contact = null;

        this._hostDiv.innerHTML = "";
    };

    prototype._loadContent = perfContactEditAction("loadContent", _loadContentAction);
    /*@bind(ContactEditControl)*/function _loadContentAction(div, hydrateContext) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="hydrateContext" type="Object">Optional hydration information to be used for displaying the page.</param>

        var personAccessor = this._personAccessor;
        var contact = this._contact;
        var contactAccessor = this._contactAccessor;
        Debug.assert(personAccessor);

        if (!contact) {
            var platform = this._host.getPlatform();
            var account = platform.accountManager.defaultAccount;
            contact = platform.peopleManager.createContact(account);
            if (Boolean(personAccessor) && Boolean(personAccessor.firstName)) {
                contact.firstName = personAccessor.firstName;
            }
            if (Boolean(personAccessor) && Boolean(personAccessor.lastName)) {
                contact.lastName = personAccessor.lastName;
            }
        }
        
        this._contact = contact;

        this._uiform = new P.UiForm({
            fieldList: P.Contact.editFieldList,
            groupList: P.Contact.getEditGroupList(),
            loc: Jx.res,
            formValidator: P.Contact._formValidator,
            cssPrefix: "profileEdit-",
            residPrefix: "/strings/profile_",
            onFormChanged: this._resizeContent.bind(this)
        });
        
        if (contactAccessor) {
            // Load existing contact
            this._createEditForm(div, contactAccessor, hydrateContext);
        } else {
            // Load the newly created contact
            this._createEditForm(div, contact, hydrateContext);
        }

        NoShip.People.etw("prfeTrackStartup_end");
    };

    prototype._createEditForm = function (div, /*@dynamic*/contact, /*@dynamic*/hydrateContext) {
        /// <summary>Creates the contact editing form</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="contact">A contact object or object literal</param>
        /// <param name="hydrateContext">Optional hydration information to be used for displaying the page.</param>
        var formHydrateContext = null;
        if (hydrateContext && hydrateContext.form) {
            formHydrateContext = hydrateContext.form;
        }

        this._uiform.createEditForm(div, contact, formHydrateContext);

        this._saved = false;
        this._resizeContent();
    };

    prototype._resize = function () {
        var div = this._hostDiv;
        this._cachedWidth = CtrlPos.update(this._layout, 
                                            this._cachedWidth, 
                                            div.querySelector("#contactEditControl"), 
                                            div.querySelector("#contactEditPadding"),
                                            c_containerOffsetLeft);
    };

    prototype._resizeContent = function () {
        /// <summary>Resize the content control</summary>
        this._jobSet.addUIJob(this, this._resize, null, P.Priority.realizeItem);
    };

    prototype._leavePage = function (destinationUri) {
        /// <summary>Leave edit page. If destinationUri is provided, navigate to that location.</summary>
        /// <param name="destinationUri" type="String" optional="true"/>
        this._explicitLeave = true;
        this._host.back(destinationUri);
    };

    function _getSelectedAccount(platform, selectedAccountId) {
        /// <param name="platform" type="Plat.Client"/>
        /// <param name="selectedAccountId" type="String"/>
        /// <returns type="Plat.Account"/>
        var accountManager = platform.accountManager;
        var connectedAccounts = accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.people, Plat.ConnectedFilter.normal, Plat.AccountSort.name);
        for (var i = 0, len = connectedAccounts.count; i < len; i++) {
            var connectedAccount = /*@static_cast(Plat.Account)*/connectedAccounts.item(i);
            
            var mockAccount = /*@static_cast(Mocks.Microsoft.WindowsLive.Platform.Account)*/connectedAccount;
            if (mockAccount.mock$fire) {
                // Mock data.
                if (connectedAccount.objectId === selectedAccountId) {
                    return connectedAccount;
                }
                continue;
            }
            
            var resources = connectedAccount.editableResources;
            // Real data.
            var l = resources.count;
            for (var j = 0; j < l; j++) {
                var resource = /*@static_cast(Plat.AccountResource)*/resources.item(j);
                if (Number(resource.resourceType) === Plat.ResourceType.contacts) {
                    if (connectedAccount.objectId === selectedAccountId) {
                        return connectedAccount;
                    }
                    break;
                }
            }
        }

        return accountManager.defaultAccount;
    };

    function _createNewContact(that, selectedAccountId) {
        /// <param name="that" type="ContactEditControl"/>
        /// <param name="selectedAccountId" type="String"/>
        /// <returns type="Plat.IContact"/>
        var platform = that._host.getPlatform();
        var selectedAccount = _getSelectedAccount(platform, selectedAccountId);

        return platform.peopleManager.createContact(selectedAccount);
    };
    
    prototype._onSave = perfContactEditAction("onSave", _onSaveAction);
    /*@bind(ContactEditControl)*/function _onSaveAction(cmdId, button) {
        ///<summary>Save Command handler</summary>
        ///<param name="commandId" type="String">Id for the command being invoked.</param>
        ///<param name="button" type="HTMLElement">The command button.</param>
        if (this._commitContact) {
            Jx.log.error("Commit is already in progress");
            return;
        }

        NoShip.People.etw("profileEditAction_start", { action: "save" });

        var person = this._person;
        var contact = this._contact;
        var uiform = this._uiform;

        var isCreatedContact = true;
        // If the person has been deleted, accessing contact.person will cause exception to be thrown as platform will try to load the person
        try {
            isCreatedContact = !contact.person; /* the contact was created when loading the edit page */
        } catch (ex) {
            Jx.log.exception("Error accessing contact.person on ContactEditControl._onSave.", ex);
            this._onCancel();
        }
        var needManualLink = Boolean(person) && isCreatedContact; /* need to be linked to an existing person that the contact was created upon */

        if (isCreatedContact && !needManualLink) {
            contact = _createNewContact(this, /*@static_cast(String)*/uiform.getInputFieldValueByName('account'));
            this._contact = contact;
            Jx.bici.increment(InstruID.People.contactAddSave, 1);
        } else {
            Jx.bici.increment(InstruID.People.profileEditSave, 1);
        }

        if (Boolean(uiform) && uiform.saveEditForm(contact)) {
            // Fields are validated.
            this._commitContact = new P.CommitContact(contact, /*@static_cast(Plat.IPerson)*/person, /*@bind(ContactEditControl)*/function (newPerson) {
                NoShip.People.etw("profileEditAction_end", { action: "save" });

                // If we are editing an existing contact (!isCreatedContact) or creating a new contact to link to the existing person (needManualLink), we'll navigate back to their page.
                // If we timed out waiting for aggregation (!newPerson), we'll go back to wherever we came from.
                // Otherwise, we'll navigate away to the newly created person's page.
                var isNewPerson = isCreatedContact && !needManualLink && newPerson;
                this._leavePage(isNewPerson ? N.getViewPersonUri(newPerson.objectId) : null);
            }, this);
        }
    };

    prototype._onCancel = function () {
        ///<summary>Cancel Command handler</summary>
        ///<param name="commandId" type="String">Id for the command being invoked.</param>
        ///<param name="button" type="HTMLElement">The command button.</param>
        this._leavePage();
        Jx.bici.increment(InstruID.People.profileEditCancel, 1);
    };

    prototype._onContactDelete = function () {
        ///<summary>Contact delete handler. Navigates back to profile landing page if the person still exist.</summary>
        Debug.assert(this._personAccessor);
        var linkedContacts = this._personAccessor.linkedContacts;
        var contact = this._contact;

        var hasCurrentContact = linkedContacts.some(function (/*@type(P.ContactAccessor)*/linkedContact) {
            return linkedContact.objectId === contact.objectId;
        });
 
        // If it's a delete contact event and the person still exists, navigates back to the person's page. 
        // If the deleted contact is the last contact on person, (GAL contact shouldn't count), let appframe's
        // deleted person watcher handle it. It should auto navigate when the person for current page is deleted.
        if (!hasCurrentContact) {
            var hasOtherContact = linkedContacts.some(function (/*@type(P.ContactAccessor)*/linkedContact) {
                return (!linkedContact.isGal);
            });
            if (hasOtherContact) {
                this._leavePage();
            } else {
                Jx.log.info("Last contact on person is deleted.");
            }
        }
    };

    prototype._onDelete = function (commandId, element) {
        ///<summary>Delete Command handler</summary>
        ///<param name="commandId" type="String">Id for the command being invoked.</param>
        ///<param name="button" type="HTMLElement">The command button.</param>
        var personAccessor = this._personAccessor;
        Debug.assert(personAccessor);

        var flyout = new P.Controls.ContactDeleteFlyout();
        flyout.show(personAccessor, element, "bottom", this._contactAccessor);
    };
});
