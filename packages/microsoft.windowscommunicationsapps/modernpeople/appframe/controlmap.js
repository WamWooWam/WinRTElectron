
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../Shared/JsUtil/namespace.js" />
/// <reference path="AppFrame.ref.js" />
/// <reference path="../AddressBook/Pages/GALSearchResults.js" />
/// <reference path="../Profile/Controls/ContactViewControl.js" />
/// <reference path="../Profile/Controls/ContactEditControl.js" />
/// <reference path="../Profile/Controls/ContactAddControl.js" />
/// <reference path="../Profile/Controls/LandingPage/LandingPage.js" />
/// <reference path="../Profile/Controls/ContactLinkingControl.js" />

Jx.delayDefine(People, "ControlMap", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = window.People.Controls;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    // This maps the control with its creator (in the 'createInstance' property).
    // The map is referenced in content.js for creating the hosted controls.
    // The map itself uses a constructor so that it can be overwritten with mocks in tests.
    P.ControlMap = /*@constructor*/function () {
        this.ab = {
            createInstance: function () { return new P.AddressBookPage(Jx.root, null); }
        };
        this.addprofile = {
            createInstance: function () { return new C.ContactAddControl(Jx.root); },
            navStartEvent: "prfaTrackStartup_start"
        };
        this.allcontactsctrl = {
            createInstance: function () { return new P.AllContactsPage(Jx.root, null); }
        };
        this.editmepicture = {
            createInstance: function () { return new C.ProfilePictureControl(Jx.root); },
            navStartEvent: "mePicTrackStartup_start",
            navEndEvent: "mePicTrackStartup_end"
        };
        this.editprofile = {
            createInstance: function () { return new C.ContactEditControl(Jx.root); },
            navStartEvent: "prfeTrackStartup_start"
        };
        this.landing = {
            createInstance: function () { return new P.LandingPage(Jx.root, null); },
            navStartEvent: "navigateToLandingPage_start",
            navEndEvent: "navigateToLandingPage_end"
        };
        this.link = {
            createInstance: function () { return new P.ContactLinkingControl(Jx.root); },
        };
        this.notification = {
            scriptSrc: "$(socialRoot)/Social.UI.Notifications.js",
            createInstance: function () { return new P.RecentActivity.UI.Host.NotificationHostedControl(Jx.root, null); },
            navStartEvent: "raUI_NavigateToNotifications_start",
            navEndevent: "raUI_NavigateToNotifications_end",
            perfTrackStart: "People-Notifications",
            perfTrackStop: "People-Notifications"
        };
        this.photo = {
            scriptSrc: "$(socialRoot)/Social.UI.Photos.js",
            createInstance: function () { return new P.RecentActivity.UI.Host.PhotosHostedControl(Jx.root, null); },
            navStartEvent: "raUI_NavigateToPhotos_start",
            navEndEvent: "raUI_NavigateToPhotos_end"
        };
        this.profile = {
            createInstance: function () { return new C.ContactViewControl(Jx.root); },
            navStartEvent: "prfvTrackStartup_start",
            perfTrackStart: "People-ProfileLoad"
        };
        this.ra = {
            scriptSrc: "$(socialRoot)/Social.UI.Feed.js",
            createInstance: function () { return new P.RecentActivity.UI.Host.RAHostedControl(Jx.root, null); },
            navStartEvent: "raUI_NavigateToFeed_start",
            navEndEvent: "raUI_NavigateToFeed_end",
            perfTrackStart: "People-Profile-RA",
            perfTrackStop: "People-Profile-RA"
        };
        this.raitem = {
            scriptSrc: "$(socialRoot)/Social.UI.SelfPage.js",
            createInstance: function () { return new P.RecentActivity.UI.Host.SelfPageHostedControl(Jx.root, null); },
            navStartEvent: "raUI_NavigateToSelfPage_start",
            navEndEvent: "raUI_NavigateToSelfPage_end"
        };
        this.viewmeprofile = {
            createInstance: function () { return new C.ProfileViewControl(Jx.root); },
            navStartEvent: "mePrfTrackStartup_start",
            navEndEvent: "mePrfTrackStartup_end"
        };
        this.whatsnew = {
            scriptSrc: "$(socialRoot)/Social.UI.Feed.js",
            createInstance: function () { return new P.RecentActivity.UI.Host.WhatsNewHostedControl(Jx.root, null); },
            navStartEvent: "raUI_NavigateToFeed_start",
            navEndevent: "raUI_NavigateToFeed_end",
            perfTrackStart: "People-RA",
            perfTrackStop: "People-RA"
        };
        this.galsearchresults = {
            createInstance: function () { return new P.GALSearchResultsPage(Jx.root, null); }
        };
    };

});
