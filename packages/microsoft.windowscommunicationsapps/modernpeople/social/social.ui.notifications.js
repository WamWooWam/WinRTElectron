
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People.RecentActivity.UI.Notifications, ["NotificationPanel", "NotificationLayout"], function () {

People.loadSocialModel();
People.loadSocialUICore();
People.RecentActivity.UI.Host.LandingPagePanelProvider;

$include("$(cssResources)/Social.css");

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciClickthroughAction.js" />
/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\Imports\IdentityControl\IdentityElementContextOptions.js" />
/// <reference path="..\..\Imports\IdentityControl\IdentityElementTileOptions.js" />
/// <reference path="..\..\Model\FeedObjectType.js" />
/// <reference path="..\..\Model\Network.js" />
/// <reference path="..\..\Model\NotificationEntry.js" />
/// <reference path="..\..\Model\NotificationType.js" />
/// <reference path="..\Core\Controls\ContactControl.js" />
/// <reference path="..\Core\Controls\ContactControlType.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\Core\Helpers\UriHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="..\Core\Navigation\SelfPageNavigationData.js" />
/// <reference path="..\Core\TimestampUpdateTimer.js" />
/// <reference path="NotificationControlHydrationData.js" />

People.RecentActivity.UI.Notifications.NotificationControl = function(network, entry) {
    /// <summary>
    ///     Provides a control to display a single notification.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="entry" type="People.RecentActivity.NotificationEntry">The notification entry.</param>
    /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_entry$1" type="People.RecentActivity.NotificationEntry">The notification entry.</field>
    /// <field name="_contentContainer$1" type="People.RecentActivity.UI.Core.Control">The content container containing the text and time of the notification.</field>
    /// <field name="_identity$1" type="People.RecentActivity.UI.Core.ContactControl">The identity control.</field>
    /// <field name="_text$1" type="People.RecentActivity.UI.Core.Control">The main text.</field>
    /// <field name="_timeVia$1" type="People.RecentActivity.UI.Core.Control">The time element.</field>
    /// <field name="_displayUnread$1" type="Boolean">Whether the control will display as unread.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.notificationItem));
    Debug.assert(network != null, 'network != null');
    Debug.assert(entry != null, 'entry != null');
    this._entry$1 = entry;
    this._network$1 = network;
};

Jx.inherit(People.RecentActivity.UI.Notifications.NotificationControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Notifications.NotificationControl._convertType$1 = function(type) {
    /// <param name="type" type="People.RecentActivity.NotificationType"></param>
    /// <returns type="String"></returns>
    var convertedType = People.RecentActivity.FeedObjectType.none;
    switch (type) {
        case People.RecentActivity.NotificationType.entry:
        case People.RecentActivity.NotificationType.video:
            convertedType = People.RecentActivity.FeedObjectType.entry;
            break;
        case People.RecentActivity.NotificationType.photo:
            convertedType = People.RecentActivity.FeedObjectType.photo;
            break;
        case People.RecentActivity.NotificationType.photoAlbum:
            convertedType = People.RecentActivity.FeedObjectType.photoAlbum;
            break;
    }

    return (convertedType).toString();
};


People.RecentActivity.UI.Notifications.NotificationControl.prototype._network$1 = null;
People.RecentActivity.UI.Notifications.NotificationControl.prototype._entry$1 = null;
People.RecentActivity.UI.Notifications.NotificationControl.prototype._contentContainer$1 = null;
People.RecentActivity.UI.Notifications.NotificationControl.prototype._identity$1 = null;
People.RecentActivity.UI.Notifications.NotificationControl.prototype._text$1 = null;
People.RecentActivity.UI.Notifications.NotificationControl.prototype._timeVia$1 = null;
People.RecentActivity.UI.Notifications.NotificationControl.prototype._displayUnread$1 = false;

People.RecentActivity.UI.Notifications.NotificationControl.prototype.applyState = function(data) {
    /// <summary>
    ///     Applies hydration data.
    /// </summary>
    /// <param name="data" type="People.RecentActivity.UI.Notifications.notificationControlHydrationData">The data.</param>
    Debug.assert(data != null, 'data != null');
    Debug.assert(this.isRendered, 'this.IsRendered');
    this._displayUnread$1 = data.isu;
    this._applyUnreadStyle$1();
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype.getState = function() {
    /// <summary>
    ///     Gets the state.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.Notifications.notificationControlHydrationData"></returns>
    // construct the final blob of data for this item.
    return People.RecentActivity.UI.Notifications.create_notificationControlHydrationData(this._displayUnread$1);
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype.invoke = function() {
    /// <summary>
    ///     Invokes the item.
    /// </summary>
    this._navigate$1();
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the item is being disposed.
    /// </summary>
    if (this._text$1 != null) {
        this._text$1.dispose();
        this._text$1 = null;
    }

    if (this._timeVia$1 != null) {
        this._timeVia$1.dispose();
        this._timeVia$1 = null;
    }

    if (this._identity$1 != null) {
        this._identity$1.dispose();
        this._identity$1 = null;
    }

    if (this._contentContainer$1 != null) {
        this._contentContainer$1.dispose();
        this._contentContainer$1 = null;
    }

    People.RecentActivity.UI.Core.TimestampUpdateTimer.unsubscribe(this._onUpdateTimerElapsed$1, this);
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the item is being rendered.
    /// </summary>
    People.RecentActivity.Core.EtwHelper.writeNotificationEvent(People.RecentActivity.Core.EtwEventName.uiRenderNotificationControlStart, this._entry$1.info);
    this.addClass('sn-item-' + this._entry$1.sourceId);
    var element = this.element;
    var elementDetails = element.children[1];
    this._identity$1 = new People.RecentActivity.UI.Core.ContactControl(this._entry$1.publisher.getDataContext(), false);
    // find the content container.
    this._contentContainer$1 = new People.RecentActivity.UI.Core.Control(elementDetails);
    // find the text control.
    this._text$1 = new People.RecentActivity.UI.Core.Control(elementDetails.children[0]);
    this._text$1.id = this._text$1.uniqueId;
    if (this._entry$1.isReply || this._entry$1.isShare) {
        // we need to format the text with an IC for the person.
        var elementName = this._identity$1.getElement(People.RecentActivity.UI.Core.ContactControlType.name, People.RecentActivity.Imports.create_identityElementContextOptions(this._entry$1.sourceId));
        this._text$1.appendChild(elementName);
        this._text$1.appendChild(document.createTextNode(' ' + this._entry$1.message.replace("@", "\u202a@\u202c")));
    }
    else {
        // just set the plain text, easy as 1-2-3.
        this._text$1.text = this._entry$1.message.replace("@", "\u202a@\u202c");
    }

    // find the time/via control.
    this._timeVia$1 = new People.RecentActivity.UI.Core.Control(elementDetails.children[1]);
    this._timeVia$1.id = this._timeVia$1.uniqueId;
    // update the labelled-by thingamajig.
    this.labelledBy = this._text$1.id + ' ' + this._timeVia$1.id;
    var elementPicture = element.children[0];
    elementPicture.appendChild(this._identity$1.getElement(People.RecentActivity.UI.Core.ContactControlType.tile, People.RecentActivity.Imports.create_identityElementTileOptions(60, null)));
    // activate the identity control.
    this._identity$1.activate(element);
    // initialize the timestamp.
    this._updateTimeVia$1();
    // initialize the unread style.
    this._updateUnreadStatus$1();
    People.RecentActivity.UI.Core.TimestampUpdateTimer.subscribe(this._onUpdateTimerElapsed$1, this);
    People.RecentActivity.Core.EtwHelper.writeNotificationEvent(People.RecentActivity.Core.EtwEventName.uiRenderNotificationControlStop, this._entry$1.info);
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype._updateTimeVia$1 = function() {
    var timestamp = this._entry$1.timestamp;
    var text = People.RecentActivity.UI.Core.LocalizationHelper.getTimeString(timestamp);
    var via = this._entry$1.via;
    if (Jx.isNonEmptyString(via)) {
        text = Jx.res.loadCompoundString('/strings/notificationItemVia', text, via);
    }

    this._timeVia$1.text = text;
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype._applyUnreadStyle$1 = function() {
    if (this._displayUnread$1) {
        this._contentContainer$1.label = Jx.res.getString('/strings/notificationUnreadLabel');
        this.addClass('sn-itemUnread');
    }
    else {
        this._contentContainer$1.label = Jx.res.getString('/strings/notificationReadLabel');
        this.removeClass('sn-itemUnread');
    }
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype._updateUnreadStatus$1 = function() {
    this._displayUnread$1 = this._entry$1.isUnreadInUI;
    this._applyUnreadStyle$1();
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype._navigate$1 = function() {
    // once we've navigated to a notification we should not mark it as unread when
    // saving state (i.e. for when the user comes back to the page via the backstack.)
    this._displayUnread$1 = false;
    switch (this._entry$1.objectType) {
        case People.RecentActivity.NotificationType.entry:
        case People.RecentActivity.NotificationType.photo:
        case People.RecentActivity.NotificationType.photoAlbum:
            this._navigateToSelfPage$1();
            break;
        case People.RecentActivity.NotificationType.person:
            this._navigateToPerson$1();
            break;
        default:
            this._navigateToUrl$1();
            break;
    }
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype._navigateToSelfPage$1 = function() {
    var data = People.RecentActivity.UI.Core.create_selfPageNavigationData(this._entry$1.sourceId, this._entry$1.objectId, People.RecentActivity.UI.Notifications.NotificationControl._convertType$1(this._entry$1.objectType));
    data.fallbackUrl = this._entry$1.link;
    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigate(this._network$1.identity.id, data);
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype._navigateToPerson$1 = function() {
    var contact = this._entry$1.publisher;
    // We need to make sure that we have a person ID before we navigate.
    var personId = contact.personId;
    if (Jx.isNonEmptyString(personId)) {
        // navigate straight to the person we know and love.
        People.Nav.navigate(People.Nav.getViewPersonUri(personId, null));
    }
    else {
        // if we don't know the person, we can still use the temporary person infrastructure
        // to navigate to their profile and what's new.
        var info = contact.getDataContext();
        People.Nav.navigate(People.Nav.getViewPersonUri(null, info));
    }
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype._navigateToUrl$1 = function() {
    var link = this._entry$1.link;
    if (Jx.isNonEmptyString(link)) {
        // log the clickthrough action, then launch the URI.
        People.RecentActivity.Core.BiciHelper.createClickThroughDatapoint(this._entry$1.sourceId, People.RecentActivity.Core.BiciClickthroughAction.unsupportedNotification);
        People.RecentActivity.UI.Core.UriHelper.launchUri(link);
    }
};

People.RecentActivity.UI.Notifications.NotificationControl.prototype._onUpdateTimerElapsed$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');
    this._updateTimeVia$1();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Notifications.create_notificationControlHydrationData = function(isUnread) {
    var o = { };
    o.isu = isUnread;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\BICI\BiciPageNames.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Imports\LayoutState.js" />
/// <reference path="..\..\Model\Events\ActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\..\Model\Network.js" />
/// <reference path="..\..\Model\NotificationCollection.js" />
/// <reference path="..\..\Model\NotificationEntry.js" />
/// <reference path="..\..\Model\NotificationFeed.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\Core\Controls\ErrorMessageType.js" />
/// <reference path="..\Core\Controls\GlobalProgressControl.js" />
/// <reference path="..\Core\Controls\PsaUpsellControl.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Helpers\MoCoHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="..\Core\KeyboardRefresher.js" />
/// <reference path="..\Core\SnapManager.js" />
/// <reference path="NotificationControl.js" />
/// <reference path="NotificationLayoutHydrationData.js" />

(function () {

    var hydrationVersion = 3;

    People.RecentActivity.UI.Notifications.NotificationLayout = function (identity, element) {
        /// <summary>
        ///     Provides the main entry point for the notifications UI.
        /// </summary>
        /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
        /// <param name="element" type="HTMLElement">The element to take over.</param>
        /// <field name="_hydrationVersion$1" type="Number" integer="true" static="true">The hydration version.</field>
        /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
        /// <field name="_hydrationData$1" type="People.RecentActivity.UI.Notifications.notificationLayoutHydrationData">The hydration data, if any.</field>
        /// <field name="_network$1" type="People.RecentActivity.Network">The network used for displaying notifications.</field>
        /// <field name="_notifications$1" type="People.RecentActivity.NotificationFeed">The notifications.</field>
        /// <field name="_collection$1" type="People.RecentActivity.NotificationCollection">The collection.</field>
        /// <field name="_content$1" type="People.RecentActivity.UI.Core.Control">The content box.</field>
        /// <field name="_contentErrors$1" type="People.RecentActivity.UI.Core.Control">The content credentials message.</field>
        /// <field name="_contentPsa$1" type="People.RecentActivity.UI.Core.Control">The PSA content.</field>
        /// <field name="_refresh$1" type="People.Command">The refresh command.</field>
        /// <field name="_refreshing$1" type="Boolean">Whether we're currently refreshing.</field>
        /// <field name="_gridDataSource$1" type="WinJS.Binding.List">The grid's data source.</field>
        /// <field name="_grid$1" type="WinJS.UI.ListView">The grid.</field>
        /// <field name="_controls$1" type="Object">The controls.</field>
        /// <field name="_lastResult$1" type="People.RecentActivity.Core.ResultInfo">The last returned result.</field>
        /// <field name="_psa$1" type="People.RecentActivity.UI.Core.PsaUpsellControl">The actual PSA control.</field>
        /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors control.</field>
        /// <field name="_itemInvokedHandler$1" type="Function">The item invoked handler.</field>
        /// <field name="_loadingStateChangedHandler$1" type="Function">The loading state change handler.</field>
        /// <field name="_layoutLoadingStateChangedHandler$1" type="Function">The loading state change handler for layout updates.</field>
        /// <field name="_isRenderComplete$1" type="Boolean">Whether rendering completed.</field>
        People.RecentActivity.UI.Core.Control.call(this, element);

        Debug.assert(identity != null, 'identity != null');

        this._controls$1 = {};
        this._identity$1 = identity;
        this._lastResult$1 = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);
        this._itemInvokedHandler$1 = this._onItemInvoked$1.bind(this);
        this._contentAnimatingHandler = this._onContentAnimating$1.bind(this);
        this._loadingStateChangedHandler$1 = this._onLoadingStateChanged$1.bind(this);
        this._layoutLoadingStateChangedHandler$1 = this._onLayoutLoadingStateChanged$1.bind(this);
    };

    Jx.inherit(People.RecentActivity.UI.Notifications.NotificationLayout, People.RecentActivity.UI.Core.Control);

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._identity$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._hydrationData$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._network$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._notifications$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._collection$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._content$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._contentErrors$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._contentPsa$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._refresh$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._refreshing$1 = false;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._gridDataSource$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._grid$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._controls$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._psa$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._errors$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._itemInvokedHandler$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._contentAnimatingHandler = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._loadingStateChangedHandler$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._layoutLoadingStateChangedHandler$1 = null;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._isRenderComplete$1 = false;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._itemsLoaded = false;
    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._animationPromise = null;

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype.initialize = function (hydrationData) {
        /// <summary>
        ///     Initializes the layout and the underlying model.
        /// </summary>
        /// <param name="hydrationData" type="Object">The hydration data.</param>
        // We will use only the aggregated network.
        this._network$1 = this._identity$1.networks.aggregatedNetwork;

        this._notifications$1 = this._network$1.notifications;
        this._notifications$1.addListener("refreshcompleted", this._onRefreshCompleted$1, this);

        this._collection$1 = this._notifications$1.notifications;

        // store the hydration data for later use.
        this._hydrationData$1 = hydrationData;

        // unless the feed has not yet been initialized we do not refresh when going to
        // the full page experience. to refresh notifications, the user has to tap the refresh button.
        var capabilities = this._identity$1.capabilities;
            capabilities.addListener("propertychanged", this._onCapabilitiesPropertyChanged$1, this);

        if (capabilities.canShowNotifications) {
            // initialize the notifications.
            this._initializeInternal$1();
        }

        People.RecentActivity.Core.BiciHelper.setCurrentPageName(People.RecentActivity.Core.BiciPageNames.notifications);
        People.RecentActivity.Core.BiciHelper.createPageViewDatapoint(this._network$1.id);
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype.getState = function () {
        /// <summary>
        ///     Collects the necessary data for dehydration.
        /// </summary>
        /// <returns type="Object"></returns>
        if (this._grid$1 != null) {
            var controlData = {};

            for (var k in this._controls$1) {
                var entry = { key: k, value: this._controls$1[k] };

                // save hydration data for each individual item.
                controlData[entry.key] = entry.value.getState();
            }

            return People.RecentActivity.UI.Notifications.create_notificationLayoutHydrationData(hydrationVersion, this._grid$1.indexOfFirstVisible, this._grid$1.currentItem, controlData);
        }

        // no point in saving data if we don't even have a grid yet.
        return null;
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype.deactivate = function () {
        /// <summary>
        ///     Deactivates the layout.
        /// </summary>
        if (this._notifications$1 != null) {
            // on deactivation we need to mark everything as read in the UI.
            this._notifications$1.markAllNotificationsReadInUI();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype.refresh = function () {
        this._onRefreshClicked$1(null);
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype.onLayoutChanged = function (layout) {
        /// <param name="layout" type="People.RecentActivity.Imports.LayoutState"></param>
        this._grid$1.addEventListener('loadingstatechanged', this._layoutLoadingStateChangedHandler$1, false);
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype.onDisposed = function () {
        /// <summary>
        ///     Occurs when the instance is being disposed.
        /// </summary>
        this._network$1 = null;
        this._refresh$1 = null;
        this._lastResult$1 = null;

        People.RecentActivity.UI.Core.SnapManager.removeControl(this);
        People.RecentActivity.UI.Core.KeyboardRefresher.removeControl(this);

        if (this._animationPromise != null) {
            this._animationPromise.cancel();
            this._animationPromise = null;
        }

        if (this._identity$1 != null) {
            this._identity$1.capabilities.removeListenerSafe("propertychanged", this._onCapabilitiesPropertyChanged$1, this);
            this._identity$1.dispose();
            this._identity$1 = null;
        }

        if (this._notifications$1 != null) {
            // when we're being disposed it means the view is going away. in this case it also means that
            // whatever was marked as "unread" in the UI can now become read. this is an in-memory operation
            // so it completes fast enough to do that here.
            this._notifications$1.markAllNotificationsReadInUI();
            this._notifications$1.removeListenerSafe("initializecompleted", this._onInitializeCompleted$1, this);
            this._notifications$1.removeListenerSafe("refreshcompleted", this._onRefreshCompleted$1, this);
            this._notifications$1 = null;
        }

        if (this._collection$1 != null) {
            this._collection$1.removeListenerSafe("collectionchanged", this._onCollectionChanged$1, this);
            this._collection$1 = null;
        }

        if (this._content$1 != null) {
            this._content$1.dispose();
            this._content$1 = null;
        }

        if (this._contentErrors$1 != null) {
            this._contentErrors$1.dispose();
            this._contentErrors$1 = null;
        }

        if (this._contentPsa$1 != null) {
            this._contentPsa$1.dispose();
            this._contentPsa$1 = null;
        }

        if (this._psa$1 != null) {
            this._psa$1.dispose();
            this._psa$1 = null;
        }

        if (this._errors$1 != null) {
            this._errors$1.dispose();
            this._errors$1 = null;
        }

        if (this._controls$1 != null) {
            for (var k in this._controls$1) {
                var control = { key: k, value: this._controls$1[k] };
                    control.value.dispose();
            }

            People.Social.clearKeys(this._controls$1);

            this._controls$1 = null;
        }

        if (this._grid$1 != null) {
            if (this._grid$1.element != null) {
                this._grid$1.removeEventListener('iteminvoked', this._itemInvokedHandler$1, false);
                this._grid$1.removeEventListener('contentanimating', this._contentAnimatingHandler, false);
                this._grid$1.removeEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
                this._grid$1.removeEventListener('loadingstatechanged', this._layoutLoadingStateChangedHandler$1, false);
            }

            this._itemInvokedHandler$1 = null;
            this._contentAnimatingHandler = null;
            this._loadingStateChangedHandler$1 = null;
            this._layoutLoadingStateChangedHandler$1 = null;

            this._grid$1 = null;
            this._gridDataSource$1 = null;
        }

        People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype.onRendered = function () {
        /// <summary>
        ///     Occurs when the instance is being rendered.
        /// </summary>
        this._renderInternal$1();
        People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._initializeInternal$1 = function () {
        if (this._notifications$1.initialized) {
            if (this._hydrationData$1 == null) {
                // we've already been initialized, so just refresh.
                this._onRefreshClicked$1(null);
            }

        }
        else {
            People.RecentActivity.UI.Core.GlobalProgressControl.add(this);

            this._notifications$1.addListener("initializecompleted", this._onInitializeCompleted$1, this);

            if (this._hydrationData$1 != null) {
                // we need to intialize from hydration.
                this._notifications$1.initializeFromHydration();
            }
            else {
                // we need to do a regular initialize.
                // this flow should never happen (there is no way to get here without it being initialized), but
                // we still capture this scenario to be double-triple-quadruply safe.
                this._notifications$1.initialize();
            }
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._renderInternal$1 = function () {
        if (this.isRendered && this._notifications$1.initialized) {
            this._isRenderComplete$1 = true;
            this.element.style.opacity = 0;   // hide the element until all items are loaded for smooth entrance animation 

            // fetch all the required elements.
            var element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.notificationLayout);
            this.element.appendChild(element);
            this._content$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'notification-list-content');

            // initialize the "credentials" controls
            this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._identity$1, People.RecentActivity.UI.Core.ErrorMessageContext.notifications, People.RecentActivity.UI.Core.ErrorMessageOperation.read);
            this._errors$1.render();

            this._contentErrors$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'notification-list-content-errors');
            this._contentErrors$1.isVisible = false;
            this._contentErrors$1.appendControl(this._errors$1);

            // initialize the PSA controls.
            this._psa$1 = new People.RecentActivity.UI.Core.PsaUpsellControl();
            this._psa$1.render();

            this._contentPsa$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'notification-list-content-psa');
            this._contentPsa$1.appendControl(this._psa$1);

            // we can now initialize the grid view and all the items, hooray.
            this._renderList$1();

            // initialize the refresh button.
            this._refresh$1 = new People.Command('notifications-refresh', '/strings/raRefresh', '/strings/raRefreshTooltip', '\ue117', true, false, null, this._onRefreshClicked$1.bind(this));

            var commands = Jx.root.getCommandBar();
                commands.addCommand(this._refresh$1);
                commands.refresh();

            // start monitoring changes to the collection.
            this._collection$1.addListener("collectionchanged", this._onCollectionChanged$1, this);

            // apply hydration data, if we have it.
            this._applyState$1();

            // and then mark all the notifications as read.
            // don't mark them as ready in the UX because we want them to show as unread, of course.
            this._notifications$1.markAllNotificationsRead();
            this._setContentVisibility$1();
            this._setRefreshVisibility$1();

            People.RecentActivity.UI.Core.KeyboardRefresher.addControl(this);
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._renderList$1 = function () {
        var element = this._content$1.element;

        this._gridDataSource$1 = new WinJS.Binding.List();
        this._grid$1 = new WinJS.UI.ListView(element);
        this._grid$1.addEventListener('iteminvoked', this._itemInvokedHandler$1, false);
        this._grid$1.addEventListener('contentanimating', this._contentAnimatingHandler, false);
        this._grid$1.itemDataSource = this._gridDataSource$1.dataSource;
        this._grid$1.itemTemplate = this._onRenderingItem$1.bind(this);
        this._grid$1.loadingBehavior = 'randomaccess';
        this._grid$1.selectionMode = 'none';
        this._applyGridLayout$1(People.RecentActivity.UI.Core.SnapManager.currentLayout);

        People.RecentActivity.UI.Core.SnapManager.addControl(this);

        // add all the notifications we have.
        this._addNotifications$1(this._collection$1.toArray(), 0);
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._applyGridLayout$1 = function (layout) {
        /// <param name="layout" type="People.RecentActivity.Imports.LayoutState"></param>
        Debug.assert(layout !== 'none', 'layout != LayoutState.None');

        if (this._grid$1 != null) {
            if (layout === 'snapped') {
                this._grid$1.layout = new WinJS.UI.ListLayout();
            }
            else {
                this._grid$1.layout = new WinJS.UI.GridLayout();
            }
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._applyState$1 = function () {
        if ((this._hydrationData$1 != null) && (this._hydrationData$1.v === hydrationVersion)) {
            for (var k in this._hydrationData$1.cd) {
                var entry = { key: k, value: this._hydrationData$1.cd[k] };
                // apply hydration data to each item.
                var key = entry.key;
                if (!Jx.isUndefined(this._controls$1[key])) {
                    this._controls$1[key].applyState(entry.value);
                }
            }

            try {
                // apply the scroll position to the container.
                this._grid$1.indexOfFirstVisible = this._hydrationData$1.i;
                this._grid$1.currentItem = this._hydrationData$1.ci;
            }
            catch (ex) {
                // ignore exceptions when setting state, as it may be outdated (but there isn't a good way for us to check.)
                Jx.log.write(3, 'Failed to set state on grid: ' + ex.toString());
            }
        }

        this._hydrationData$1 = null;
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._addNotifications$1 = function (notifications, index) {
        /// <param name="notifications" type="Array" elementType="NotificationEntry"></param>
        /// <param name="index" type="Number" integer="true"></param>
        Debug.assert(notifications != null, 'notifications != null');
        Debug.assert(index >= 0, 'index >= 0');

        this._setContentVisibility$1();
        this._grid$1.addEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);

        // begin modifying the list first (for performance)
        var dataSource = this._grid$1.itemDataSource;
        dataSource.beginEdits();

        for (var i = 0, len = notifications.length; i < len; i++) {
            this._gridDataSource$1.splice(index++, 0, notifications[i]);
        }

        // once we're done simply commit.
        dataSource.endEdits();
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._removeNotifications$1 = function (notifications) {
        /// <param name="notifications" type="Array" elementType="NotificationEntry"></param>
        Debug.assert(notifications != null, 'notifications != null');

        this._grid$1.addEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);

        // begin modifying the list.
        var dataSource = this._grid$1.itemDataSource;
            dataSource.beginEdits();

        for (var n = 0; n < notifications.length; n++) {
            var entry = notifications[n];
            var index = this._gridDataSource$1.indexOf(entry);
            if (index !== -1) {
                this._gridDataSource$1.splice(index, 1);
            }
        }

        dataSource.endEdits();

        this._setContentVisibility$1();
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._getNotificationKey$1 = function (notification) {
        /// <param name="notification" type="People.RecentActivity.NotificationEntry"></param>
        /// <returns type="String"></returns>
        Debug.assert(notification != null, 'notification != null');

        return notification.sourceId + ';' + notification.objectId + ';' + notification.id + ';' + notification.publisher.id;
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._setContentVisibility$1 = function () {
        if (this._isRenderComplete$1) {
            this._content$1.isVisible = false;
            this._contentErrors$1.isVisible = false;
            this._contentPsa$1.isVisible = false;

            var initialized = this._notifications$1.initialized;
            if (initialized && !this._identity$1.capabilities.canShowNotifications) {
                // we can't show notifications because no networks are hooked up. show PSA.
                this._contentPsa$1.isVisible = true;
            }
            else {
                if (initialized && (!this._notifications$1.notifications.count)) {
                    // there are no notifications, so errors can be shown inline.
                    this._contentErrors$1.isVisible = true;
                    this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;

                    if (this._lastResult$1.code === People.RecentActivity.Core.ResultCode.success) {
                        // no notifications, so show the "no recent notifications" message.
                        this._errors$1.showType(People.RecentActivity.UI.Core.ErrorMessageType.empty);
                    }
                    else {
                        this._errors$1.show(this._lastResult$1);
                    }
                }
                else {
                    // there are notifications, so errors should be displayed in the bar.
                    this._content$1.isVisible = true;
                    this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;
                    this._errors$1.show(this._lastResult$1);
                }
            }
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._setRefreshVisibility$1 = function () {
        if (this._isRenderComplete$1) {
            var commands = Jx.root.getCommandBar();
            if (this._notifications$1.initialized && this._identity$1.capabilities.canShowNotifications) {
                commands.showCommand(this._refresh$1.commandId);
            }
            else {
                commands.hideCommand(this._refresh$1.commandId);
            }
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onLoadingStateChanged$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        var details = (ev.detail);

        if (this._grid$1.loadingState === 'complete') {
            if ((details == null) || !details.scrolling) {
                // the listview was updated not because we were scrolling, so set focus on the first item.
                if (this._gridDataSource$1.length > 0) {
                    var key = this._getNotificationKey$1(this._gridDataSource$1.getAt(0));
                    if (!Jx.isUndefined(this._controls$1[key])) {
                        // set "focus" on the first item.
                        this._controls$1[key].setActive();
                    }
                }
            }

            this._grid$1.removeEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
        } else if (this._grid$1.loadingState === 'itemsLoaded' && !this._itemsLoaded) {
            this._itemsLoaded = true;
            var that = this;
            this._animationPromise = People.Animation.enterPage(this.element).done(function () {
                that._animationPromise = null;
            });
            if (!this._refreshing$1) {
                People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
            }
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onLayoutLoadingStateChanged$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        if (this._grid$1.loadingState === 'complete') {
            this._grid$1.removeEventListener('loadingstatechanged', this._layoutLoadingStateChangedHandler$1, false);
            this._applyGridLayout$1(People.RecentActivity.UI.Core.SnapManager.currentLayout);
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onItemInvoked$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        var notification = People.RecentActivity.UI.Core.MoCoHelper.getItemFromEvent(this._gridDataSource$1, ev.detail);

        // fetch the control and invoke it, if possible.
        var key = this._getNotificationKey$1(notification);
        if (!Jx.isUndefined(this._controls$1[key])) {
            this._controls$1[key].invoke();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onRenderingItem$1 = function (promise) {
        /// <param name="promise" type="WinJS.UI.ListViewRenderPromise"></param>
        /// <returns type="Object"></returns>
        var that = this;

        Debug.assert(promise != null, 'promise != null');

        return promise.then(function (data) {
            if (that.isDisposed) {
                // we've already been disposed, whoops.
                return null;
            }

            var notification = that._gridDataSource$1.getAt(data.index);

            // figure out if we've rendered this item before.
            var key = that._getNotificationKey$1(notification);

            if (!Jx.isUndefined(that._controls$1[key])) {
                // we can't re-use cached elements, because MoCo will clear out the innerHTML.
                that._controls$1[key].dispose();
                that._controls$1[key] = null;
            }

            var control = new People.RecentActivity.UI.Notifications.NotificationControl(that._network$1, notification);
                control.render();

            that._controls$1[key] = control;

            return control.element;
        });
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onInitializeCompleted$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        // remove the event handler, we don't need it after this.
        this._notifications$1.removeListenerSafe("initializecompleted", this._onInitializeCompleted$1, this);

        People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);

        this._lastResult$1 = e.result;
        this._renderInternal$1();
        this._setContentVisibility$1();
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onRefreshCompleted$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        this._refreshing$1 = false;
        this._lastResult$1 = e.result;

        if (this._itemsLoaded) {
            People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
        }

        this._setContentVisibility$1();

        if (this._lastResult$1.isSuccessOrPartialFailure) {
            // once new entries have come in, just mark them as ready right away.
            this._notifications$1.markAllNotificationsRead();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onContentAnimating$1 = function (ev) {
        // Disable the ListView entranceAnimation as it doesn't work well with our AppFrame entrance animation.
        if (ev.detail.type === WinJS.UI.ListViewAnimationType.entrance) {
            ev.preventDefault();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onRefreshClicked$1 = function (context) {
        /// <param name="context" type="Object"></param>
        if (this._notifications$1.initialized && !this._refreshing$1) {
            // show a progress element, then make the outbound call.
            People.RecentActivity.UI.Core.GlobalProgressControl.add(this);

            this._refreshing$1 = true;
            this._notifications$1.refresh();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onCollectionChanged$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        switch (e.action) {
            case People.RecentActivity.NotifyCollectionChangedAction.add:
                this._addNotifications$1(e.newItems, e.newItemIndex);
                break;
            case People.RecentActivity.NotifyCollectionChangedAction.remove:
                this._removeNotifications$1(e.oldItems);
                break;
        }
    };

    People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onCapabilitiesPropertyChanged$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        if (e.propertyName === 'CanShowNotifications') {
            var capabilities = e.sender;
            if (capabilities.canShowNotifications) {
                this._initializeInternal$1();
            }

            this._setContentVisibility$1();
            this._setRefreshVisibility$1();
        }
    };

})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Notifications.create_notificationLayoutHydrationData = function(version, indexOfFirstVisible, currentItem, controlData) {
    var o = { };
    o.cd = controlData;
    o.ci = currentItem;
    o.i = indexOfFirstVisible;
    o.v = version;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Imports\LayoutState.js" />
/// <reference path="..\..\Imports\Panel.js" />
/// <reference path="..\..\Model\Events\ActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\..\Model\Network.js" />
/// <reference path="..\..\Model\NotificationCollection.js" />
/// <reference path="..\..\Model\NotificationEntry.js" />
/// <reference path="..\..\Model\NotificationFeed.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\Core\Controls\ErrorMessageType.js" />
/// <reference path="..\Core\EventManager.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Helpers\MoCoHelper.js" />
/// <reference path="..\Core\Helpers\ScrollHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="..\Core\SnapManager.js" />
/// <reference path="NotificationControl.js" />

(function () {
    var notificationOutline = 8;

    People.RecentActivity.UI.Notifications.NotificationPanel = function (identity, hydrationData) {
        /// <summary>
        ///     Provides a panel for notifications.
        /// </summary>
        /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
        /// <param name="hydrationData" type="Object">The hydration data.</param>
        /// <field name="_notificationOutline$1" type="Number" integer="true" static="true">The total amount of outline/margin each item receives. Unfortunately we cannot compute this.</field>
        /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
        /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
        /// <field name="_notifications$1" type="People.RecentActivity.NotificationFeed">The notifications.</field>
        /// <field name="_collection$1" type="People.RecentActivity.NotificationCollection">The collection.</field>
        /// <field name="_element$1" type="HTMLElement">The element.</field>
        /// <field name="_title$1" type="People.RecentActivity.UI.Core.Control">The title.</field>
        /// <field name="_titleName$1" type="People.RecentActivity.UI.Core.Control">The title element.</field>
        /// <field name="_titleMore$1" type="People.RecentActivity.UI.Core.Control">The title chevron element.</field>
        /// <field name="_content$1" type="People.RecentActivity.UI.Core.Control">The content element.</field>
        /// <field name="_contentViewport$1" type="People.RecentActivity.UI.Core.Control">The content viewport.</field>
        /// <field name="_contentErrors$1" type="People.RecentActivity.UI.Core.Control">The errors content.</field>
        /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors.</field>
        /// <field name="_isDisposed$1" type="Boolean">Occurs when the instance has been disposed.</field>
        /// <field name="_isNavigatingToFull$1" type="Boolean">Whether we're navigating to the full notification page.</field>
        /// <field name="_isReady$1" type="Boolean">Whether the panel is ready.</field>
        /// <field name="_isInitialized$1" type="Boolean">Whether we've been initialized.</field>
        /// <field name="_grid$1" type="WinJS.UI.ListView">The grid.</field>
        /// <field name="_gridDataSource$1" type="WinJS.Binding.List">The data source.</field>
        /// <field name="_maximumCount$1" type="Number" integer="true">The maximum number of items to show.</field>
        /// <field name="_controls$1" type="Object">The set of rendered controls.</field>
        /// <field name="_hydrationData$1" type="Object">The hydration data.</field>
        /// <field name="_lastResult$1" type="People.RecentActivity.Core.ResultInfo">The last result.</field>
        /// <field name="_notificationHeight$1" type="Number" integer="true">The real height of a notification.</field>
        /// <field name="_itemInvokedHandler$1" type="Function">The item invoked handler.</field>
        People.RecentActivity.Imports.Panel.call(this, null, 'ra-notificationPanelOuter panelView-snapActivePanel', People.PanelView.PanelPosition.notificationsPanel);

        Debug.assert(identity != null, 'identity != null');
        Debug.assert(identity.isMe, 'identity.IsMe');

        this._lastResult$1 = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);
        this._controls$1 = {};
        this._hydrationData$1 = hydrationData;
        this._identity$1 = identity;
        this._itemInvokedHandler$1 = this._onItemInvoked$1.bind(this);
    };

    Jx.inherit(People.RecentActivity.UI.Notifications.NotificationPanel, People.RecentActivity.Imports.Panel);

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._identity$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._network$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._notifications$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._collection$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._element$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._title$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._titleName$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._titleMore$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._content$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._contentViewport$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._contentErrors$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._errors$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._isDisposed$1 = false;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._isNavigatingToFull$1 = false;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._isReady$1 = false;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._isInitialized$1 = false;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._grid$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._gridDataSource$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._maximumCount$1 = 0;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._controls$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._hydrationData$1 = null;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._notificationHeight$1 = 0;
    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._itemInvokedHandler$1 = null;

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype.activateUI = function (element) {
        /// <summary>
        ///     Activates the UI, signaling that light-weight operations can be performed.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element.</param>    
        Debug.assert(element != null, 'element != null');

        People.RecentActivity.UI.Core.EventManager.events.addListener("windowresized", this._onWindowResized$1, this);
        People.RecentActivity.UI.Core.SnapManager.addControl(this);

        this._element$1 = element;

        // update the title and such.
        this._title$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-title');
        this._title$1.attach('keypress', this._onTitleKeyPress$1.bind(this));
        this._title$1.attach('click', this._onTitleClicked$1.bind(this));

        this._titleName$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1, 'panel-title-name');
        this._titleName$1.id = this._titleName$1.uniqueId;
        this._titleName$1.text = Jx.res.getString('/strings/raNotificationPanelTitle');

        this._titleMore$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1, 'panel-title-more');
        this._titleMore$1.id = this._titleMore$1.uniqueId;
        this._titleMore$1.text = (People.RecentActivity.UI.Core.HtmlHelper.isRightToLeft) ? '\ue096' : '\ue097';

        People.Animation.addPressStyling(this._title$1.element);

        this._content$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-content');
        this._content$1.labelledBy = this._titleName$1.id + ' ' + this._titleMore$1.id;
        this._content$1.render();

        this._contentViewport$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-viewport');
        this._contentViewport$1.render();

        // initialize the errors stuff.
        this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._identity$1, People.RecentActivity.UI.Core.ErrorMessageContext.notifications, People.RecentActivity.UI.Core.ErrorMessageOperation.read);
        this._contentErrors$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-errors');
        this._contentErrors$1.render();
        this._contentErrors$1.appendControl(this._errors$1);
        this._contentErrors$1.isVisible = false;

        // once all of that is done, we can go fetch the notifications (if we haven't already.)
        this._network$1 = this._identity$1.networks.aggregatedNetwork;
        this._notifications$1 = this._network$1.notifications;
        this._collection$1 = this._notifications$1.notifications;

        var that = this;
        window.msSetImmediate(function () {
            if (that._isDisposed$1) {
                // we've been disposed already.
                return;
            }

            if (that._notifications$1.initialized) {
                if (that._hydrationData$1 == null) {
                    // the notifications have already been initialized. we should do a refresh call instead.
                    that._notifications$1.addListener("refreshcompleted", that._onNotificationsRefreshCompleted$1, that);
                    that._notifications$1.refresh();
                }
                else {
                    // we have hydration data, and the notifications have been initialized, so we don't need to refresh or anything like that.
                    that._lastResult$1 = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);
                    that._isInitialized$1 = true;
                    that._onReady$1();
                }
            }
            else {
                // this is the first time we're initializing the notifications.
                that._notifications$1.addListener("initializecompleted", that._onNotificationsInitializeCompleted$1, that);

                if (that._hydrationData$1 != null) {
                    that._notifications$1.initializeFromHydration();
                }
                else {
                    that._notifications$1.initialize();
                }
            }
        });
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype.getUI = function () {
        /// <summary>
        ///     Gets the HTML markup that should be shown.
        /// </summary>
        /// <returns type="String"></returns>
        return People.RecentActivity.UI.Core.Html.notificationPanel;
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype.deactivateUI = function () {
        /// <summary>
        ///     Deactivates the UI.
        /// </summary>
        this._isDisposed$1 = true;

        People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowresized", this._onWindowResized$1, this);
        People.RecentActivity.UI.Core.SnapManager.removeControl(this);

        this._identity$1 = null;
        this._network$1 = null;
        this._element$1 = null;
        this._lastResult$1 = null;

        if (this._notifications$1 != null) {
            // if we're not navigating to the full page experience, then we should now mark 
            // everything as read in the UI.
            if (!this._isNavigatingToFull$1) {
                // if we're not navigating to the full page, we need to mark stuff as read in the UX.
                this._notifications$1.markAllNotificationsReadInUI();
            }

            // get rid of all of our event handlers and such.
            this._notifications$1.removeListenerSafe("initializecompleted", this._onNotificationsInitializeCompleted$1, this);
            this._notifications$1.removeListenerSafe("refreshcompleted", this._onNotificationsRefreshCompleted$1, this);

            this._notifications$1 = null;
            this._collection$1 = null;
        }

        if (this._controls$1 != null) {
            for (var k in this._controls$1) {
                var control = { key: k, value: this._controls$1[k] };
                control.value.dispose();
            }

            People.Social.clearKeys(this._controls$1);
            this._controls$1 = null;
        }

        if (this._title$1 != null) {
            this._title$1.dispose();
            this._title$1 = null;
        }

        if (this._titleName$1 != null) {
            this._titleName$1.dispose();
            this._titleName$1 = null;
        }

        if (this._titleMore$1 != null) {
            this._titleMore$1.dispose();
            this._titleMore$1 = null;
        }

        if (this._content$1 != null) {
            this._content$1.dispose();
            this._content$1 = null;
        }

        if (this._contentViewport$1 != null) {
            this._contentViewport$1.dispose();
            this._contentViewport$1 = null;
        }

        if (this._contentErrors$1 != null) {
            this._contentErrors$1.dispose();
            this._contentErrors$1 = null;
        }

        if (this._errors$1 != null) {
            this._errors$1.dispose();
            this._errors$1 = null;
        }

        if (this._grid$1 != null) {
            if (this._grid$1.element != null) {
                this._grid$1.removeEventListener('iteminvoked', this._itemInvokedHandler$1, false);
            }

            this._itemInvokedHandler$1 = null;

            this._grid$1 = null;
            this._gridDataSource$1 = null;
        }
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype.ready = function () {
        /// <summary>
        ///     Signals that the UX is ready for heavy-weight operations.
        /// </summary>
        this._isReady$1 = true;
        this._onReady$1();
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype.suspend = function () {
        /// <summary>
        ///     Suspends the panel.
        /// </summary>
        /// <returns type="Object"></returns>
        // we don't need anything except for a token to indicate we need to come back from
        // hydration the next time we load.
        return {};
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype.onLayoutChanged = function (layout) {
        /// <summary>
        ///     Called when application layout is changed.
        /// </summary>
        /// <param name="layout" type="People.RecentActivity.Imports.LayoutState">The layout.</param>
        Jx.log.write(4, 'NotificationPanel.OnLayoutchanged: ' + layout);

        this._onReady$1();

        var listView = this._element$1.querySelector(".ra-notificationLayoutGrid").winControl;
        if (listView) {
            listView.layout = (layout === People.Layout.layoutState.snapped) ? new WinJS.UI.ListLayout() : new WinJS.UI.GridLayout();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._getNotificationKey$1 = function (entry) {
        /// <param name="entry" type="People.RecentActivity.NotificationEntry"></param>
        /// <returns type="String"></returns>
        Debug.assert(entry != null, 'entry');

        return entry.sourceId + ';' + entry.objectId + ';' + entry.id + ';' + entry.publisher.id;
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._updateNotifications = function (notifications) {
        /// <param name="notifications" type="Array" elementType="NotificationEntry"></param>
        Debug.assert(notifications != null, 'notifications != null');

        // hide the progress control as soon as we're adding notifications.
        this._hideProgress$1();

        // begin edits on the list.
        var dataSource = this._grid$1.itemDataSource;
        dataSource.beginEdits();
        this._updateNotificationsList(notifications);

        // once we're done with that, end the edits and do some clean-up.
        dataSource.endEdits();
        this._updateErrorState$1();
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._updateNotificationsList = function (notifications) {
        /// <param name="notifications" type="Array" elementType="NotificationEntry"></param>
        Debug.assert(notifications != null, 'notifications != null');

        // The final value of dataIndex will be used as the length of the data source.
        var dataIndex = 0;

        for (var i = 0; i < notifications.length && dataIndex < this._maximumCount$1; i++, dataIndex++) {
            var ix = this._gridDataSource$1.indexOf(notifications[i]);
            if (ix === -1) {
                // The item isn't currently in the list, just insert it.
                this._gridDataSource$1.splice(dataIndex, 0, notifications[i]);
            }
            else if (ix < dataIndex) {
                // Hmmm, this appears to be a duplicate, decrement the dataIndex so we can try again next round.
                dataIndex--;
            }
            else if (ix > dataIndex) {
                // The item is currently in the list, but ahead of the expected position.  Blow away everything in between.
                this._gridDataSource$1.splice(dataIndex, ix - dataIndex);
            }
        }

        // set the height of the container so that the listview doesn't scroll infinitely
        this._content$1.element.style.height = (dataIndex * this._notificationHeight$1) + 'px';

        // Force the length to truncate extra notifications.
        this._gridDataSource$1.length = dataIndex;
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onReady$1 = function () {
        if (this._isReady$1) {
            if (this._isInitialized$1) {
                // hide the progress once we've been initialized and we're ready to show stuff.
                this._hideProgress$1();
            }

            if ((this._grid$1 == null) && (this._gridDataSource$1 == null)) {
                this._content$1.attach('keyboardnavigating', this._onKeyboardNavigating$1.bind(this));

                // now that we have stuff we can initialize the list and such.
                this._gridDataSource$1 = new WinJS.Binding.List();
                this._grid$1 = new WinJS.UI.ListView(this._contentViewport$1.element);
                this._grid$1.addEventListener('iteminvoked', this._itemInvokedHandler$1, false);
                this._grid$1.itemDataSource = this._gridDataSource$1.dataSource;
                this._grid$1.itemTemplate = this._onRenderingItem$1.bind(this);
                this._grid$1.layout = (Jx.root.getLayout().getLayoutState() === People.Layout.layoutState.snapped) ? new WinJS.UI.ListLayout() : new WinJS.UI.GridLayout();
                this._grid$1.loadingBehavior = 'randomaccess';
                this._grid$1.selectionMode = 'none';
            }

            // measure the size of a single notification. we simply do this by creating a dummy item and inserting it temporarily.
            var dummy = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.notificationItem);
            this._content$1.appendChild(dummy);
            this._notificationHeight$1 = WinJS.Utilities.getTotalHeight(dummy) + notificationOutline;
            this._content$1.removeChild(dummy);

            // figure out how many notifications we can show.
            if (Jx.root.getLayout().getLayoutState() === People.Layout.layoutState.snapped) {
                // show at most 4 notifications in snap mode
                this._maximumCount$1 = 4;
            } else {
                // reset the container's height before it's used to make maximum count calculations
                this._content$1.element.style.height = 'auto';
                this._maximumCount$1 = Math.floor(this._content$1.element.clientHeight / this._notificationHeight$1);
            }

            // off-load this to a different "time-slice".
            var that = this;
            window.msSetImmediate(function () {
                if (!that._isDisposed$1) {
                    // add all the notifications that we want to and update the count.
                    that._updateNotifications(that._collection$1.toArray());
                }
            });

            // as soon as we get here, we should mark everything as read.
            this._notifications$1.markAllNotificationsRead();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._updateErrorState$1 = function () {
        this._contentErrors$1.isVisible = false;

        if (this._gridDataSource$1.length > 0) {
            // errors need to be displayed in the message bar.
            this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.messageBar;
            this._errors$1.show(this._lastResult$1);
        }
        else {
            if (this._isInitialized$1) {
                this._contentErrors$1.isVisible = true;
                this._content$1.element.style.height = 'auto';

                // errors need to be displayed inline as there is no other content.
                this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;

                if (this._lastResult$1.code === People.RecentActivity.Core.ResultCode.success) {
                    // there is no real error, but there are also no notifications, which means that we need to show an "empty" list.
                    this._errors$1.showType(People.RecentActivity.UI.Core.ErrorMessageType.empty);
                }
                else {
                    this._errors$1.show(this._lastResult$1);
                }
            }
        }
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._hideProgress$1 = function () {
        var element = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._element$1, 'panel-progress');
        if (element != null) {
            // remove the element from the DOM completely... which is the best way to make sure its "hidden".
            element.parentNode.removeChild(element);
        }
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._navigateToFull$1 = function () {
        // navigate to the full experience.
        this._isNavigatingToFull$1 = true;
        People.Nav.navigate(People.Nav.getNotificationUri(null));
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onItemInvoked$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        var notification = People.RecentActivity.UI.Core.MoCoHelper.getItemFromEvent(this._gridDataSource$1, ev.detail);

        // fetch the control and invoke it, if possible.
        var key = this._getNotificationKey$1(notification);
        if (!Jx.isUndefined(this._controls$1[key])) {
            var invokable = this._controls$1[key];
            invokable.invoke();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onRenderingItem$1 = function (promise) {
        /// <param name="promise" type="WinJS.UI.ListViewRenderPromise"></param>
        /// <returns type="Object"></returns>
        Debug.assert(promise != null, 'promise != null');

        var that = this;
        return promise.then(function (data) {
            Debug.assert(data != null, 'data != null');

            if (that._isDisposed$1) {
                // we've been disposed in the meantime.
                return null;
            }

            // fetch the entry, and check if we've rendered it before.
            var entry = that._gridDataSource$1.getAt(data.index);

            var key = that._getNotificationKey$1(entry);
            if (!Jx.isUndefined(that._controls$1[key])) {
                // we can't re-use existing controls because MoCo will recycle the element (clearing out the innerHTML).
                that._controls$1[key].dispose();
                that._controls$1[key] = null;
            }

            // initialize a new NotificationControl instance and store it.
            var control = new People.RecentActivity.UI.Notifications.NotificationControl(that._network$1, entry);
            control.render();
            that._controls$1[key] = control;

            return control.element;
        });
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onNotificationsInitializeCompleted$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        // save the last result and then update the UX (if needed.)
        this._lastResult$1 = e.result;
        this._isInitialized$1 = true;

        this._onReady$1();
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onNotificationsRefreshCompleted$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        // store state and update the UX as needed.
        this._lastResult$1 = e.result;
        this._isInitialized$1 = true;

        this._onReady$1();
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onTitleKeyPress$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        if (ev.keyCode === WinJS.Utilities.Key.enter || ev.keyCode === WinJS.Utilities.Key.space) {
            this._navigateToFull$1();
        }
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onTitleClicked$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        this._navigateToFull$1();
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onKeyboardNavigating$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        var item = ev.detail;

        // make sure the element is visible.
        var key = this._getNotificationKey$1(this._gridDataSource$1.getAt(item.newFocus));
        if (!Jx.isUndefined(this._controls$1[key])) {
            // simply scroll the item into view.
            People.RecentActivity.UI.Core.ScrollHelper.scrollIntoView(this._controls$1[key].element);
        }
    };

    People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onWindowResized$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        this._onReady$1();
    };
})();

});