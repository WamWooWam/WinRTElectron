﻿Jx.delayDefine(People,"ControlMap",function(){var n=window.People,t=window.People.Controls;n.ControlMap=function(){this.ab={createInstance:function(){return new n.AddressBookPage(Jx.root,null)}};this.addprofile={createInstance:function(){return new t.ContactAddControl(Jx.root)},navStartEvent:"prfaTrackStartup_start"};this.allcontactsctrl={createInstance:function(){return new n.AllContactsPage(Jx.root,null)}};this.editmepicture={createInstance:function(){return new t.ProfilePictureControl(Jx.root)},navStartEvent:"mePicTrackStartup_start",navEndEvent:"mePicTrackStartup_end"};this.editprofile={createInstance:function(){return new t.ContactEditControl(Jx.root)},navStartEvent:"prfeTrackStartup_start"};this.landing={createInstance:function(){return new n.LandingPage(Jx.root,null)},navStartEvent:"navigateToLandingPage_start",navEndEvent:"navigateToLandingPage_end"};this.link={createInstance:function(){return new n.ContactLinkingControl(Jx.root)}};this.notification={scriptSrc:"$(socialRoot)/Social.UI.Notifications.js",createInstance:function(){return new n.RecentActivity.UI.Host.NotificationHostedControl(Jx.root,null)},navStartEvent:"raUI_NavigateToNotifications_start",navEndevent:"raUI_NavigateToNotifications_end",perfTrackStart:"People-Notifications",perfTrackStop:"People-Notifications"};this.photo={scriptSrc:"$(socialRoot)/Social.UI.Photos.js",createInstance:function(){return new n.RecentActivity.UI.Host.PhotosHostedControl(Jx.root,null)},navStartEvent:"raUI_NavigateToPhotos_start",navEndEvent:"raUI_NavigateToPhotos_end"};this.profile={createInstance:function(){return new t.ContactViewControl(Jx.root)},navStartEvent:"prfvTrackStartup_start",perfTrackStart:"People-ProfileLoad"};this.ra={scriptSrc:"$(socialRoot)/Social.UI.Feed.js",createInstance:function(){return new n.RecentActivity.UI.Host.RAHostedControl(Jx.root,null)},navStartEvent:"raUI_NavigateToFeed_start",navEndEvent:"raUI_NavigateToFeed_end",perfTrackStart:"People-Profile-RA",perfTrackStop:"People-Profile-RA"};this.raitem={scriptSrc:"$(socialRoot)/Social.UI.SelfPage.js",createInstance:function(){return new n.RecentActivity.UI.Host.SelfPageHostedControl(Jx.root,null)},navStartEvent:"raUI_NavigateToSelfPage_start",navEndEvent:"raUI_NavigateToSelfPage_end"};this.viewmeprofile={createInstance:function(){return new t.ProfileViewControl(Jx.root)},navStartEvent:"mePrfTrackStartup_start",navEndEvent:"mePrfTrackStartup_end"};this.whatsnew={scriptSrc:"$(socialRoot)/Social.UI.Feed.js",createInstance:function(){return new n.RecentActivity.UI.Host.WhatsNewHostedControl(Jx.root,null)},navStartEvent:"raUI_NavigateToFeed_start",navEndevent:"raUI_NavigateToFeed_end",perfTrackStart:"People-RA",perfTrackStop:"People-RA"};this.galsearchresults={createInstance:function(){return new n.GALSearchResultsPage(Jx.root,null)}}}})