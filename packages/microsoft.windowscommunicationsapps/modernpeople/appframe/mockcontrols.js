
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../Shared/JSUtil/Namespace.js"/>
/// <reference path="main.js"/>
/// <reference path="../../Shared/jx/core/jx.js"/>
/// <reference path="../Shared/Navigation/UriGenerator.js"/>

/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
/// <disable>JS3092.DeclarePropertiesBeforeUse</disable> Jx references

(function () {

    var P = window.People;
    var M = window.People.MockPages;

    M.replaceControlsWithMocks = function (controls) {
        /// <summary>Replace the control map with the mock controls for testing purposes.</summary>
        /// <param name="controls" type="P.ControlMap">The control map that maps the controls with the creators</param>

        controls.ab.createInstance = function () { return new M.AddressBookPage(Jx.root, null); };
        controls.addprofile.createInstance = function () { return new M.EditProfilePage(Jx.root, null); };
        controls.editmepicture.createInstance = function () { return new M.EditMePicturePage(Jx.root, null); };
        controls.editprofile.createInstance = function () { return new M.EditProfilePage(Jx.root, null); };
        controls.landing.createInstance = function () { return new M.LandingPage(Jx.root, null); };
        controls.link.createInstance = function () { return new M.LinkPage(Jx.root, null); };
        controls.notification.createInstance = function () { return new M.NTFPage(Jx.root, null); };
        controls.photo.createInstance = function () { return new M.PhotoPage(Jx.root, null); };
        controls.profile.createInstance = function () { return new M.ProfilePage(Jx.root, null); };
        controls.ra.createInstance = function () { return new M.RAPage(Jx.root, null); };
        controls.raitem.createInstance = function () { return new M.RAItemPage(Jx.root, null); };
        controls.search.createInstance = function () { return new M.SearchPage(Jx.root, null); };
        controls.viewmeprofile.createInstance = function () { return new M.MeProfilePage(Jx.root, null); };
        controls.whatsnew.createInstance = function () { return new M.WNPage(Jx.root, null); };
    };

    M.BasePage = /* @constructor*/function (host, options) {
        /// <summary>Creates the hosted page.</summary>
        /// <param name="host" type="Object">The object that hosts the address book in a div.</param>
        /// <param name="options" type="Object" optional="true">Optional params for page setting, currently not used.</param>
        this._host = host;
        this._options = options;
    };

    var baseProto = M.BasePage.prototype;

    baseProto._host = /* @static_cast(Object)*/null;
    baseProto._div = /* @static_cast(HTMLElement)*/null;
    baseProto._options =  /* @static_cast(Object)*/null;

    baseProto.load = function (params) {
        /// <summary>Loads the control in the page.</summary>
        /// <param name="params" type="Object">
        ///     The params contains an object which includes the mode, data, fields, context.
        ///     params.element specifies the HTMLElement that hosts the control;
        ///     params.mode specifies if it's hydration vs. a new load;
        ///     params.data specifies the data object to be displayed in the page;
        ///     params.fields specifies other fields from deep linking;
        ///     params.context specifies the hydration data. This is the object returned by prepareSuspension;
        ///     params.state specifies the state saved for the control. This is the object returned by prepareSaveStates.
        /// </param>
        Debug.assert(params.element);
        this._div = params.element;
        Debug.assert(Jx.isHTMLElement(this._div));

        if (this._host !== null) {
            // load the content to be hosted in the div
            this._loadContent(this._div, params.data, params.fields);

            var hostElement = this._div;
 
            // Display the param data in the mock page.
            var displayParam = function (paramName, paramData, div) {
                if (paramData) {
                    var elParam = document.createElement("div");
                    elParam.id = "idParam";
                
                    var dumpObj = function (obj) {
                        var objText = "<ul>";
                        for (var propName in obj) {
                            if (typeof obj[propName] !== "function") {
                                objText += "<li>" + propName + ": " + obj[propName] + "</li>";
                            }
                        };
                        objText += "</ul>";
                        return objText;
                    };

                    if (Jx.isObject(paramData)) {
                        elParam.innerHTML = "<b>" + paramName + ":</b><br>" + dumpObj(paramData);
                    } else {
                        elParam.innerHTML = "<b>" + paramName + ":</b> " + paramData;
                    }
                    div.appendChild(elParam);
                }
            };

            displayParam("Mode", params.mode, hostElement);
            displayParam("Fields", params.fields, hostElement);
            displayParam("Context", params.context, hostElement);
            displayParam("State", params.state, hostElement);
            displayParam("Data", params.data, hostElement);
            
            // add commands to the command bar
            this._addCommands(this._host.getCommandBar(), params.data);
        }

        addTextInPage("Layout state is: " + this._host.getLayoutState(), this._div);
        
        var layout = this._host.getLayout();
        Jx.addListener(layout, layout.layoutChanged, this._onLayoutChanged, this);
    };
    
    baseProto.prepareSuspension = function () {
        /// <summary>Serializes the current state of the control into an object.
        ///     Used during the dehydrate operation.</summary>
        /// <returns type="Object">The object to be saved before going to suspension.</returns>
        return null;
    };

    baseProto.activate = function () {
        /// <summary>Called when the control is activated (being navigated to).
        ///     The control can set focus in this call.</summary> 
    };

    baseProto.deactivate = function (forceClose) {
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
        return true;
    };

    baseProto.unload = function () {
        /// <summary>Called when the control is unloaded. The control can release 
        ///     the resource and do cleanup at this time.</summary>
        var layout = this._host.getLayout();
        Jx.removeListener(layout, layout.layoutChanged, this._onLayoutChanged, this);
    };

    baseProto._onLayoutChanged = function (ev) {
        /// <summary>Layout change event handler.</summary>
        /// <param name="event" type="Object"/>
        Debug.assert(ev);
        addTextInPage("layoutChanged: layout=" + ev, this._div);
        Jx.log.info("M.BasePage._onLayoutChanged: layout=" + ev);
    };

    baseProto._loadContent = function (div, data, fields) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="data" type="Object">The data object to be displayed in the page.</param>
        /// <param name="fields" type="Object">The fields object from deep linking.</param>
    };

    baseProto._addCommands = function (commandBar, data) {
        /// <summary>Add commands to the command bar.</summary>
        /// <param name="commandBar" type="P.CpCommandBar">The command bar object.</param>
        /// <param name="data" type="Object">The data object being passed to the control.</param>
    };

    function addLinkInPage(id, href, linkText, div) {
        /// <summary>Add a link element in the page.</summary>
        /// <param name="id" type="String">The id for the link HTMLElement.</param>
        /// <param name="href" type="String">The uri for the link HTMLElement.</param>
        /// <param name="linkText" type="String">The text for the link HTMLElement.</param>
        /// <param name="div" type="HTMLElement">The element that the link will be appended to.</param>
        var link = document.createElement("div");
        link.innerHTML = '<a id="' + id + '" href="' + href + '">' + linkText + '</a>';
        div.appendChild(link);
    }

    function addAddressBookLink(div) {
        /// <summary>Add a linka link to address book.</summary>
        /// <param name="div" type="HTMLElement">The element that the link will be appended to.</param>
        addLinkInPage("idAddressBookLink", N.getViewAddressBookUri(null), "Go to address book", div);
    }

    function addTextInPage(text, div) {
        /// <summary>Add a text div in the page.</summary>
        /// <param name="text" type="String">The text to be shown in the div.</param>
        /// <param name="div" type="HTMLElement">The element that the text div will be appended to.</param>
        var textDiv = document.createElement("div");
        textDiv.innerText = text;
        div.appendChild(textDiv);
    }

    function addTitleInPage(text, div) {
        /// <summary>Add title in the page.</summary>
        /// <param name="text" type="String">The text to be shown in the div.</param>
        /// <param name="div" type="HTMLElement">The element that the text div will be appended to.</param>
        var textDiv = document.createElement("div");
        textDiv.id = "idMockControlTitle";
        textDiv.innerText = text;
        div.appendChild(textDiv);
    }
    
    // The mock address book page.
    M.AddressBookPage = /*@constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.AddressBookPage, M.BasePage);

    var N = window.People.Nav;

    M.AddressBookPage.prototype._loadContent = function (div, person, fields) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="data" type="Object">not used</param>
        /// <param name="fields" type="Object">The fields object from deep linking.</param>
        addTitleInPage(Jx.res.getString("/mocks/mockAddressBookContent"), div);

        addLinkInPage("idMockViewMeLink", N.getMeUri(null), "View me landing page", div);
        addLinkInPage("idMockViewMeProfileLink", N.getMeProfileUri(null), "View me profile", div);
        addLinkInPage("idMockEditMePictureLink", N.getEditMePictureUri(null), "Edit my picture", div);
        addLinkInPage("idMockViewMeRALink", N.getMeRAUri(null), "View me RA", div);
        addLinkInPage("idMockViewMePhotoLink", N.getMePhotoUri(null), "View me photo", div);

        addTextInPage(" ", div);
        addLinkInPage("idMockAddContactLink", N.getCreateContactUri(null), "Add a contact", div);

        // Add some links to the contact's profile page
        for (var i = 0; i < 2; i++) {
            var id = "fav" + i;
            addTextInPage(" ", div);
            addLinkInPage("idMockLandingPageLink" + id, N.getViewPersonUri(id, null), "View " + id + "\'s landing page", div);
            addLinkInPage("idMockProfileLink" + id, N.getProfileDetailUri(id, null), "View " + id + "\'s profile", div);
            addLinkInPage("idMockEditProfileLink" + id, N.getEditProfileDetailUri(id, null), "Edit " + id + "\'s profile", div);
            addLinkInPage("idMockLinkPersonLink" + id, N.getLinkPersonUri(id, null), "Linking for " + id, div);
            addLinkInPage("idMockRALink" + id, N.getViewRAUri(id, null), "View " + id + "\'s RA", div);
            addLinkInPage("idMockRAItemLink" + id, N.getRASelfpageUri(id, null), "View " + id + "\'s RA Self Page", div);
            addLinkInPage("idMockPhotoLink" + id, N.getViewPhotoUri(id, null), "View " + id + "\'s photo", div);
        }
        addTextInPage(" ", div);
        
        var fofData = { id: "idRAFof12345", name: "Bob Joe", userTile: "http://www.live.com/xxx", userId: "facebook1234567", network: "FB"};
        addLinkInPage("idMockFofLink", N.getViewFofUri(fofData), "view landing page for friend of friend", div);
        addLinkInPage("idMockRAFofLink", N.getRAFofUri(fofData), "view RA from friend of friend", div);
        addLinkInPage("idMockPhotoFofLink", N.getPhotoFofUri(fofData), "view photo from friend of friend", div);

        addTextInPage(" ", div);
        addLinkInPage("idMockWhatsNewLink", N.getWhatsNewUri(null), "Go to What's New page", div);
        addLinkInPage("idMocNotificationLink", N.getNotificationUri(null), "Go to Notification page", div);
        addLinkInPage("idMockSearchLink", N.getSearchUri("David Code", "en-us"), "Search for David Code", div);
 
        // Add an edit field for testing notification number
        var elEditNotif = document.createElement("div");
        elEditNotif.innerHTML = '<br>Update the notification number:<input id="idMockNotificationNumber"/><button id="idMockUpdateNotification">Update</button><br><br>';        
        div.appendChild(elEditNotif);
        document.getElementById("idMockUpdateNotification").addEventListener("click", this._onUpdateNofication.bind(this), false);

        // Add an edit field for testing custom command button which shows a number inside of the button icon
        var elEditLink = document.createElement("div");
        elEditLink.innerHTML = '<br>Update the link button with number:<input id="idMockLinkNumber"/><button id="idMockUpdateLink">Update</button><br><br>';        
        div.appendChild(elEditLink);
        document.getElementById("idMockUpdateLink").addEventListener("click", this._onUpdateLink.bind(this), false);
    };

    M.AddressBookPage.prototype._onUpdateLink = function () {
        var number = document.getElementById("idMockLinkNumber").value;
        this._host.getCommandBar().updateNumberOnButton("cmdid_link", parseInt(number));
    };

    M.AddressBookPage.prototype._onUpdateNofication = function () {
        var number = document.getElementById("idMockNotificationNumber").value;
        this._host.updateNotificationNumber(parseInt(number));
    };

    M.AddressBookPage.prototype._addCommands = function (commandBar, data) {
        /// <summary>Add commands to the command bar.</summary>
        /// <param name="commandBar" type="P.CpCommandBar">The command bar object.</param>
        /// <param name="data" type="Object">The data object being passed to the control.</param>
        if (commandBar !== null) {
            // Add a mock command.
            var cmdMock = new P.Command("cmdid_mock", "/mocks/mockCommandButtonText0", 
                            "/mocks/mockCommandButtonTooltip0",
                            "\uE109", true, true, this, this.onCmd);
            commandBar.addCommand(cmdMock);
            
            // Add a link command. 
            // Test: 1. use customLayout, 2. use formatted string as name
            var cmdLink = new P.Command("cmdid_link", null, null,
                            "\uE167", true, true, this, this.onCmd, null, true /*useCustomLayout*/);
            cmdLink.setFormattedName("/mocks/mockCommandButtonFormattedText", "David", "Dav");
            cmdLink.setFormattedTooltip("/mocks/mockCommandButtonFormattedText", "x", "y");
            commandBar.addCommand(cmdLink);
            
            commandBar.updateNumberOnButton("cmdid_link", parseInt("999"));
        }
    };

    M.AddressBookPage.prototype.onCmd = function (commandId, button) {
        ///<summary>Command handler</summary>
        ///<param name="commandId" type="String">Id for the command being invoked.</param>
        ///<param name="button" type="HTMLElement">The button being invoked.</param>
        if (commandId === "cmdid_link" || commandId === "cmdid_mock") {
            // Test the passed in param for button position.
            var clientRect = button.getBoundingClientRect();
            addTextInPage(commandId + " is clicked: left=" + clientRect.left + ",top=" + clientRect.top + ",width=" + clientRect.width + ",height=" + clientRect.height, this._div);
        }
    };

    M.AddressBookPage.prototype.goHome = function () {
        ///<summary>Go to the home position of the page</summary>
        addTextInPage("Home button is clicked inside the page.", this._div);
    };

    // The mock profile page.
    M.ProfilePage = /*@constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.ProfilePage, M.BasePage);

    M.ProfilePage.prototype._loadContent = function (div, person) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        addTitleInPage(Jx.res.getString("/mocks/mockProfilePageContent"), div);
        addAddressBookLink(div);

        // Add a link to the edit contact's profile page
        addLinkInPage("idMockProfileEditLink", N.getEditProfileDetailUri(person.objectId, null), "Edit " + person.calculatedUIName + "'s profile", div);

        // Add a link to the contact's ra page
        addLinkInPage("idMockViewRALink", N.getViewRAUri(person.objectId, null), "View " + person.calculatedUIName + "'s recent activity", div);

        // Add a link to the contact's photo page
        addLinkInPage("idMockViewPhoto", N.getViewPhotoUri(person.objectId, null), "View " + person.calculatedUIName + "'s photo", div);
    };

    M.ProfilePage.prototype._addCommands = function (commandBar, data) {
        /// <summary>Add commands to the command bar.</summary>
        /// <param name="commandBar" type="P.CpCommandBar">The command bar object.</param>
        /// <param name="data" type="Object">The data object being passed to the control.</param>
        if (commandBar !== null) {
            // Add a command.
            var command0 = new P.Command("cmdid_mockcontrol_0", "/mocks/mockCommandButtonText0", null,
                            "\uE104", true, true, this, this.onCmd);
            commandBar.addCommand(command0);

            // Add another command.
            var command1 = new P.Command("cmdid_mockcontrol_1", "/mocks/mockCommandButtonText1", null,
                            "\uE105", true, true, this, this.onCmd);
            commandBar.addCommand(command1);
                
            // Add a command for hide a button.
            var command2 = new P.Command("cmdid_mockcontrol_2", "/mocks/mockCommandButtonHide", null,
                            "\uE10A", true, true, this, this.onHideClicked);
            commandBar.addCommand(command2);

            // Add a command with link instead of onInvoke.
            var command3 = new P.Command("cmdid_mockcontrol_3", "/mocks/mockCommandButtonNav", null,
                            "\uE107", true, true, null, null, P.Nav.getEditProfileDetailUri(data.objectId, null));
            commandBar.addCommand(command3);

            // Add button to test flyout on a button
            var command4 = new P.Command("cmdid_mockcontrol_4", "/mocks/mockCommandButtonFlyout", null,
                            "\uE115", true, true, this, this.onFlyout);
            var flyoutDiv = document.createElement("div");
            var flyout = new WinJS.UI.Flyout(flyoutDiv, null);
            flyoutDiv.id = "idFlyout";
            flyoutDiv.innerHTML = "<div>item 1</div><div>item 2</div>";
            command4.setFlyout("idFlyout");
            commandBar.addCommand(command4);
            document.body.appendChild(flyoutDiv);
        }
    };

    M.ProfilePage.prototype._cmd0CalledCounter = 0;
    M.ProfilePage.prototype._cmd1CalledCounter = 0;
    M.ProfilePage.prototype.onCmd = function (commandId) {
        ///<summary>Command handler</summary>
        ///<param name="commandId" type="String">Id for the command being invoked.</param>
        var counter = 0;
        if (commandId === "cmdid_mockcontrol_0") {
            this._cmd0CalledCounter++;
            counter = this._cmd0CalledCounter;
        } else if (commandId === "cmdid_mockcontrol_1") {
            this._cmd1CalledCounter++;
            counter = this._cmd1CalledCounter;
        }
        this._div.innerText = (commandId + " is clicked " + counter + " times.");
    };

    M.ProfilePage.prototype.onHideClicked = function (commandId) {
        ///<summary>Command handler</summary>
        ///<param name="commandId" type="String">Id for the command being invoked.</param>
        var bar = this._host.getCommandBar();
        bar.hideCommand("cmdid_mockcontrol_0");
    };

    M.ProfilePage.prototype.onFlyout = function (commandId) {
        ///<summary>Command handler</summary>
        ///<param name="commandId" type="String">Id for the command being invoked.</param>
        this._div.innerText = ("Flyout is clicked!");
    };

    // The edit profile page.
    M.EditProfilePage = /*@constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.EditProfilePage, M.BasePage);

    M.EditProfilePage.prototype._loadContent = function (div, person) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        addTitleInPage("Edit profile", div);

        // Add a link to contact's profile page
        if (person) {
            var fields = {field1:"value1",field2:"value2"};
            addLinkInPage("idMockEditProfileToProfileLink", N.getProfileDetailUri(person.objectId, fields), "Go back to view " + person.calculatedUIName + "'s profile (passing extra fields)", div);
        } else {
            addAddressBookLink(div);
        }

        // Add an edit field for testing hydration scenario
        var elEdit = document.createElement("div");
        elEdit.innerHTML = 'Please enter some text. These fields will be saved on dehydration.' +
                    '<br> Name: <input id="idMockEditProfileName"/>' + 
                    '<br> Phone: <input id="idMockEditProfilePhone"/>';
        div.appendChild(elEdit);

        // Add button to test P.CpCommandBar.updateCommand. The updated button doesn't have a "pressed" state icon specified.
        var commandBar = this._host.getCommandBar();
        var elBtn = document.createElement("button");
        elBtn.id = "idBtn_testUpdateCommand";
        elBtn.innerText = "Update the command with id cmdid_mockEditProfile1 (the 2nd one)";
        function mockOnClick(bar) {
            var command = new P.Command("cmdid_mockEditProfile_1", "/mocks/mockCommandButtonText1", null,
                        "\uE141", true, true, null, null, P.Nav.getViewAddressBookUri(null));
            bar.updateCommand(command);
        }
        elBtn.addEventListener("click", mockOnClick.bind(window, commandBar), false);
        div.appendChild(elBtn);

        // Add button to test P.CpCommandBar.hideCommand
        var elBtn2 = document.createElement("button");
        elBtn2.id = "idBtn_testHideCommand";
        elBtn2.innerText = "Hide command with id cmdid_mockEditProfile1 (the 2nd one)";
        function mockOnClick2 (cmdBar) {
            cmdBar.hideCommand("cmdid_mockEditProfile_1");
        }
        elBtn2.addEventListener("click", mockOnClick2.bind(window, commandBar), false);
        div.appendChild(elBtn2);
        
        // Add button to test P.CpCommandBar.showCommand
        var elBtn3 = document.createElement("button");
        elBtn3.id = "idBtn_testShowCommand";
        elBtn3.innerText = "Show command with id cmdid_mockEditProfile1 (the 2nd one)";
        function mockOnClick3 (cmdBar) {
            cmdBar.showCommand("cmdid_mockEditProfile_1");
        }
        elBtn3.addEventListener("click", mockOnClick3.bind(window, commandBar), false);
        div.appendChild(elBtn3);
        
        // Add button to disable a command
        var elBtn4 = document.createElement("button");
        elBtn4.id = "idBtn_testDisableCommand";
        elBtn4.innerText = "Disable command with id cmdid_mockEditProfile1 (the 1st one)";
        function mockOnClick4 (cmdBar) {
            cmdBar.updateCommand({commandId: "cmdid_mockEditProfile_0", enabled: false});
        }
        elBtn4.addEventListener("click", mockOnClick4.bind(window, commandBar), false);
        div.appendChild(elBtn4);
        
        // Add button to toggle a command
        var elBtn5 = document.createElement("button");
        elBtn5.id = "idBtn_testToggleCommand";
        elBtn5.innerText = "Toggle command with id cmdid_mockEditProfile3 (the toggle button)";
        function mockOnClick5 (cmdBar) {
            this._toggleSelected = !this._toggleSelected;
            cmdBar.updateCommand({commandId: "cmdid_mockEditProfile_3", selected: this._toggleSelected});
        }
        elBtn5.addEventListener("click", mockOnClick5.bind(this, commandBar), false);
        div.appendChild(elBtn5);

        // Add a control to switch between enabling/disabling deactivate.
        var elDeactivateSelection = document.createElement("div");
        elDeactivateSelection.innerHTML = 'The control can specify if leaving the page is allowed before being deactivated. ' +
                                            'If it is not allowed, navigation will be prevented. Select if leaving the page is allowed: ' + 
                                            '<select id="idAllowDeactivate"><option value="1">Allow</option><option value="0">Disallow</option></select>';
        div.appendChild(elDeactivateSelection);
    };

    M.EditProfilePage.prototype._addCommands = function (commandBar, data) {
        /// <summary>Add commands to the command bar.</summary>
        /// <param name="commandBar" type="P.CpCommandBar">The command bar object.</param>
        /// <param name="data" type="Object">The data object being passed to the control.</param>
        if (commandBar !== null && data) {
            var command0 = new P.Command("cmdid_mockEditProfile_0", "/mocks/mockCommandButtonNav", "/mocks/mockCommandButtonNav", 
                            "\uE105", true, true, null, null, P.Nav.getProfileDetailUri(data.objectId, null));
            commandBar.addCommand(command0);

            var command1 = new P.Command("cmdid_mockEditProfile_1", "/mocks/mockCommandButtonNav", null,
                            "\uE10A", true, true, null, null, P.Nav.getProfileDetailUri(data.objectId, null));
            commandBar.addCommand(command1);

            var command2 = new P.Command("cmdid_mockEditProfile_2", "/mocks/mockCommandButtonNav", null,
                            "\uE115", true, true, null, null, P.Nav.getProfileDetailUri(data.objectId, null));
            commandBar.addCommand(command2);

            // Toggle button
            var command3 = new P.Command("cmdid_mockEditProfile_3", "/mocks/mockCommandButtonToggle", null,
                            "\uE113", true, true, this, this.onToggle);
            this._toggleSelected = false;
            command3.setSelected(false);
            commandBar.addCommand(command3);
        }
    };
    
    M.EditProfilePage.prototype.onToggle = function () {
        /// <summary> Toggle command handler. </summary>
        this._toggleSelected = !this._toggleSelected;
    };

    M.EditProfilePage.prototype.prepareSuspension = function () {
        var data = null;
        var profileName = document.getElementById("idMockEditProfileName").value;
        var phone = document.getElementById("idMockEditProfilePhone").value;
        if (profileName || phone) {
            data = { name: profileName, phone: phone };
        }
        return data;
    };

    M.EditProfilePage.prototype.prepareSaveState = function () {
        /// <summary> Prepare to save state before being unloaded. </summary>
        /// <returns type="Object"> Returns an object that it desires to save and to be consumed on next load.</returns>
        return { state1: "state1 value", state2: "state2 value" };
    };

    M.EditProfilePage.prototype.deactivate = function (forceClose) {
        /// <summary>Called when the control is deactivated (being navigated away). 
        ///     Returns bool to indicate if it's okay to be navigated away. 
        ///     If it returns true, the page will go to the new location.
        ///     If it returns false, the page will remain the same.
        ///     For example, if the control is an edit control, this is the 
        ///     chance to ask user if he/she wants to save the data before 
        ///     navigating away.</summary>
        /// <param name="forceClose" type="Boolean">Is the control forced to be closed? If it's being force 
        ///     closed, the host will not respect the return value. The control is responsible for saving
        ///     data or uncomitted work to avoid data loss.</param>
        var ret = true;
        if (!forceClose) {
            var elAllowDeactivate = document.getElementById("idAllowDeactivate");
            if (elAllowDeactivate.value === "0") {
                ret = false;
            }
        }
        return ret;
    };
    
    // The RA page.
    M.RAPage = /*@constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.RAPage, M.BasePage);

    M.RAPage.prototype._loadContent = function (div, person) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        addTitleInPage(Jx.res.getString("/mocks/mockRaPageContent"), div);
        addAddressBookLink(div);

        // Add a link to contact's RA item page
        addLinkInPage("idMockRAItemLink", N.getRASelfpageUri(person.objectId, null), "Go to open " + person.calculatedUIName + "'s RA item", div);
    };

    // The RA item selfpage.
    M.RAItemPage = /*@constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.RAItemPage, M.BasePage);

    M.RAItemPage.prototype._loadContent = function (div, person) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        addTitleInPage("RA item self page", div);
        addAddressBookLink(div);

        // Add a link to contact's RA page
        addLinkInPage("idMockRALink", N.getViewRAUri(person.objectId, null), "Go back to view " + person.calculatedUIName + "'s recent activity", div);
    };

    // The Me profile page.
    M.MeProfilePage = /* @constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.MeProfilePage, M.BasePage);

    M.MeProfilePage.prototype._loadContent = function (div, person) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        addTitleInPage("Me profile", div);
        addAddressBookLink(div);

        addLinkInPage("idMockMeLink", N.getMeProfileUri (null), "View my profile", div);
    };

    // The Edit Me Picture page.
    M.EditMePicturePage = /* @constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.EditMePicturePage, M.BasePage);

    M.EditMePicturePage.prototype._loadContent = function (div, person) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        addTitleInPage("Edit Me picture", div);
        addAddressBookLink(div);
    };

    // The What's new page.
    M.WNPage = /* @constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        this._currentFilter = 0;
        this._filterNameList = ["All", "Facebook", "Twitter"];
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.WNPage, M.BasePage);
    
    M.WNPage.prototype._loadContent = function (div, person) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        addTitleInPage("what's new", div);
        addAddressBookLink(div);
    };

    M.WNPage.prototype.hasFilter = function () {
        return true;
    };

    M.WNPage.prototype.getCurrentFilterName = function () {
        return this._filterNameList[this._currentFilter];
    };

    M.WNPage.prototype.getFilterItems = function () {
        var filterItems = [];

        var that = this;
        var updateFilter = function (index) {
            that._currentFilter = index;
        };

        this._filterNameList.forEach(function (filterName, index) {
            filterItems.push({
                id: "option" + index,
                name: filterName,
                selected: false,
                onItemSelected: updateFilter.bind(this, index)
            });
        });
        filterItems[this._currentFilter].selected = true;

        return filterItems;
    };

    // The notification page.
    M.NTFPage = /* @constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.NTFPage, M.BasePage);

    M.NTFPage.prototype._loadContent = function (div, person, fields) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        /// <param name="fields" type="Object">The fields object from deep linking.</param>
        div.innerHTML = '<div style="display: -ms-grid; -ms-grid-rows: 200px; -ms-grid-columns: 200px 1fr;">' +
                            '<div style="-ms-grid-row: 1; -ms-grid-column: 1;" id="idFirst">First Column</div>' + 
                            '<div style="-ms-grid-row: 1; -ms-grid-column: 2;" id="idSecond">Second Column</div>' +
                        '</div>';

        var hostElement = document.getElementById("idSecond");
        addTitleInPage("Notification", hostElement);
        addAddressBookLink(hostElement);
    };

    // The photo page.
    M.PhotoPage = /* @constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.PhotoPage, M.BasePage);

    M.PhotoPage.prototype._loadContent = function (div, person) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        addTitleInPage("View photo", div);
        addAddressBookLink(div);       
    };

    // The search page.
    M.SearchPage = /* @constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.SearchPage, M.BasePage);

    M.SearchPage.prototype._loadContent = function (div, data) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="data" type="String">The query string.</param>
        addTitleInPage("Search page", div);
        addTextInPage("search string is '" + data + "'", div);

        addAddressBookLink(div);

        var title = Jx.res.loadCompoundString("/strings/searchResultTitle", data, 10);
        this._host.getHeader().updateSecondaryTitle(title);
    };

    // The landing page for a person..
    M.LandingPage = /* @constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.LandingPage, M.BasePage);

    M.LandingPage.prototype._loadContent = function (div, person, fields) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        /// <param name="fields" type="Object">The fields object from deep linking.</param>
        Debug.assert(Jx.isObject(person) || Jx.isObject(fields));
        if (Jx.isObject(person)) {
            addTitleInPage("Landing page for person", div);
        } else {
            addTitleInPage("Landing page for friend of friend", div);
        }
        addAddressBookLink(div);

        if (Jx.isObject(person)) {
            var id = person.objectId;
            addLinkInPage("idMockProfileLink" + id, N.getProfileDetailUri(id, null), "View " + id + "\'s profile", div);
            addLinkInPage("idMockEditProfileLink" + id, N.getEditProfileDetailUri(id, null), "Edit " + id + "\'s profile", div);
            addLinkInPage("idMockLinkLink" + id, N.getLinkPersonUri(id, null), "Linking page for " + id, div);
            addLinkInPage("idMockRALink" + id, N.getViewRAUri(id, null), "View " + id + "\'s RA", div);
            addLinkInPage("idMockPhotoLink" + id, N.getViewPhotoUri(id, null), "View " + id + "\'s photo", div);
        } else {
            addLinkInPage("idMockRAFofLink", N.getRAFofUri(fields), "view RA from friend of friend", div);
            addLinkInPage("idMockPhotoFofLink", N.getPhotoFofUri(fields), "view photo from friend of friend", div);
        }
    };

    // The link page for a person.
    M.LinkPage = /* @constructor*/function (host, div, options) {
        /// <param name="options" optional="true" />
        M.BasePage.call(this, host, div, options);
    };

    Jx.augment(M.LinkPage, M.BasePage);

    M.LinkPage.prototype._loadContent = function (div, person, fields) {
        /// <summary>Load content into the div.</summary>
        /// <param name="div" type="HTMLElement">The element that hosts the content.</param>
        /// <param name="person" type="Object">The person object.</param>
        /// <param name="fields" type="Object">The fields object from deep linking.</param>
        Debug.assert(Jx.isObject(person));
        addTitleInPage("Link page for person", div);
        addAddressBookLink(div);
    };
})();
