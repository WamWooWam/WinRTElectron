
// Copyright (C) Microsoft Corporation.  All rights reserved.

/// <reference path="../Shared/JsUtil/namespace.js"/>
/// <reference path="../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../Shared/Accounts/AccountSynchronization.js"/>
/// <reference path="WinJSAppbar.ref.js"/>

Jx.delayDefine(People, "CpNavBar", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.CpNavBar = /* @constructor*/function (jobSet, host) {
        /// <summary>Constructor</summary>
        /// <param name="jobSet" type="P.JobSet" />
        /// <param name="host" type="P.CpMain" />
        Jx.log.info("People.CpNavBar");
        this._name = "People.CpNavBar";
        this.initComponent();
        
        this._jobSet = jobSet;
        this._host = host;
        this._accountSync = /*@static_cast(P.Accounts.AccountSynchronization)*/null;
    };
    Jx.augment(P.CpNavBar, Jx.Component);
    P.CpNavBar.prototype._winappbar = /* @static_cast(WinJSAppBarDescriptor)*/ null;
    
    P.CpNavBar.prototype.deactivateUI = function () {
        /// <summary>Called on application shutdown UI.</summary>
        Jx.dispose(this._accountSync);
        Jx.Component.prototype.deactivateUI.call(this);
    };

    P.CpNavBar.prototype._createAppBar = function () {
        /// <summary>Create WinJS appbar</summary>
        Debug.assert(!this._winappbar);
        var appBarElement = document.createElement("div");
        appBarElement.id = "idNavBar";
        /* apply win-ui-dark style on as the back ground color is dark */
        Jx.addClass(appBarElement, "win-ui-dark");
        document.body.appendChild(appBarElement);

        var appbarControl = new WinJS.UI.AppBar(appBarElement, {commands: [], placement: "top", layout: "custom"});
        this._winappbar = /* @static_cast(WinJSAppBarDescriptor)*/appbarControl;
    };
    P.CpNavBar.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        ui.html = "";
    };
    P.CpNavBar.prototype.initialize = function () {
        /// <summary>Intilialize the commands for nav bar.</summary>
        Jx.log.info("People.CpNavBar.initialize");

        if (!this._winappbar) {
            this._createAppBar();
        }
        
        // Only show What's New button if the account synchronization is complete.
        var accountSync = this._accountSync = new P.Accounts.AccountSynchronization(this._host.getPlatform());
        var showWhatsNew = accountSync.areAccountsAvailable(this._showWhatsNew, this);
        if (showWhatsNew) {
            Jx.dispose(this._accountSync);
        }

        var commands = [{
                id: "idNavHome", 
                label: Jx.res.getString("/strings/homeButtonLabel"),
                section: "selection",
                icon: "\uE10F", // house
                extraClass: "nav-command-container", 
                onclick: this._onClick.bind(this, "idNavHome")
            },{
                id: "idNavMe", 
                label: Jx.res.getString("/strings/abMe"),
                section: "selection",
                icon: "\uE136",  // person with text
                extraClass: "nav-command-container", 
                onclick: this._onClick.bind(this, "idNavMe")
            },{
                id: "idNavWhatsNew", 
                label: Jx.res.getString("/strings/whatsNewHeader"),
                section: "selection",
                icon: "\uE12A",  // pane
                extraClass: "nav-command-container", 
                onclick: this._onClick.bind(this, "idNavWhatsNew"),
                hidden: !showWhatsNew
            }, {
                id: "idNavAllContacts",
                label: Jx.res.getString("/strings/allContactsButtonLabel"),
                section: "selection",
                icon: "\uE14C",  // pane
                extraClass: "nav-command-container",
                onclick: this._onClick.bind(this, "idNavAllContacts")
            }
        ];


        var navBar = this._winappbar;
        navBar.placement = "top";
        navBar.commands = commands;
        
        commands.forEach(/*@bind(P.CpNavBar)*/function (/*@type(WinJSCommandDescriptor)*/command) {
            var button = navBar.getCommandById(command.id).element;
            Debug.assert(button);
            button.innerHTML = P.CpNavBar.getNavCommandUI(command.icon, command.label);
            button.title = command.label;
            P.Animation.addTapAnimation(button);
        });
         
        this.updateShowHide();
    };
    
    P.CpNavBar.prototype.getWinappbar = function () {
        /// <returns type="WinJSAppBarDescriptor"/>
        Debug.assert(Jx.isObject(this._winappbar));
        return this._winappbar;
    };
    
    P.CpNavBar.prototype.hideNavBar = function () {
        /// <summary>Hide the nav bar.</summary>
        if (this._winappbar) {
            this._winappbar.hide();
        }
    };
    
    P.CpNavBar.prototype.hide = function () {
        /// <summary>Hide the nav bar and app bar.</summary>
        this.hideNavBar();
        // Make sure app bar is hidden along with nav bar.
        this._host.hideAppBar();
    };

    P.CpNavBar.prototype._onClick = function (id) {
        // Hide both the app bar and nav bar when a nav button is clicked.
        this.hide();
        // Then do the navigation or scrolling.
        switch (id) {
            case "idNavHome": this._host.goHome(); break;
            case "idNavMe": this._host.navToPageOrScroll(P.Nav.Pages.viewme.id); break;
            case "idNavWhatsNew": this._host.navToPageOrScroll(P.Nav.Pages.whatsnew.id); break;
            case "idNavAllContacts": this._host.navToPageOrScroll(P.Nav.Pages.allcontacts.id); break;
            default: Debug.assert(false); break;
        }
    };

    P.CpNavBar.getNavCommandUI = function (glyph, label) {
        /// <summary>Gets the UI string for the nav command button.</summary>
        /// <param name="glyph" type="String" />
        /// <param name="label" type="String" />
        /// <returns type="String"/>
        return "<div class='nav-command'>" + 
                    "<div class='nav-command-icon'>" + glyph + "</div>" + 
                    "<div class='nav-command-label'>" + Jx.escapeHtml(label) + "</div>" +
                "</div>";
    };
    
    P.CpNavBar.prototype.updateShowHide = function () {
        /// <summary>Enable/disable the nav bar. It doesn't show if disabled.</summary> 
        Debug.assert(this._host);
        if (this._winappbar) {
            if (this._host.hasNavbar()) {
                this._winappbar.disabled = false;
            } else {
                this._winappbar.disabled = true;
            }
        }            
    };
    
    P.CpNavBar.prototype._showWhatsNew = function () {
        if (this._winappbar) {
            this._winappbar.showCommands(["idNavWhatsNew"]);
        }
        Jx.dispose(this._accountSync);
    };
});
