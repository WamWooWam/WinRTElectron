
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People.RecentActivity.UI.Host, ["LandingPagePanelProvider", "WhatsNewHostedControl", "NotificationHostedControl", "SelfPageHostedControl", "PhotosHostedControl", "RAHostedControl"], function () {

People.loadSocialModel();
People.loadSocialUICore();
People.Social.loadUtilities();

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents hosted control suspension scenarios.
/// </summary>
People.RecentActivity.UI.Host.HostedControlSuspensionScenario = {
    /// <field name="suspension" type="Number" integer="true" static="true">The hosted control is being suspended.</field>
    suspension: 0,
    /// <field name="navigateBack" type="Number" integer="true" static="true">The hosted control is being dismissed because the user clicked the back button.</field>
    navigateBack: 1,
    /// <field name="navigateForward" type="Number" integer="true" static="true">The hosted control is being dismissed by a forward navigate.</field>
    navigateForward: 2
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Host.create_whatsNewHostedControlImplState = function(itemStateId, markupStateId, state) {
    var o = { };
    o.itemStateId = itemStateId;
    o.markupStateId = markupStateId;
    o.state = state;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="PanelProviderImpl.js" />

People.RecentActivity.UI.Host.PanelProvider = function() {
    /// <summary>
    ///     Provides a base implementation for a panel provider.
    /// </summary>
    /// <field name="_impl" type="People.RecentActivity.UI.Host.PanelProviderImpl">The implementation.</field>
    /// <field name="_host" type="People.PanelHost">The host.</field>
    /// <field name="_person" type="Microsoft.WindowsLive.Platform.Person">The current person.</field>
    /// <field name="_fields" type="Object">The data fields.</field>
};


People.RecentActivity.UI.Host.PanelProvider.prototype._impl = null;
People.RecentActivity.UI.Host.PanelProvider.prototype._host = null;
People.RecentActivity.UI.Host.PanelProvider.prototype._person = null;
People.RecentActivity.UI.Host.PanelProvider.prototype._fields = null;

Object.defineProperty(People.RecentActivity.UI.Host.PanelProvider.prototype, "host", {
    get: function() {
        /// <summary>
        ///     Gets the host.
        /// </summary>
        /// <value type="People.PanelHost"></value>
        return this._host;
    }
});

Object.defineProperty(People.RecentActivity.UI.Host.PanelProvider.prototype, "person", {
    get: function() {
        /// <summary>
        ///     Gets the person.
        /// </summary>
        /// <value type="Microsoft.WindowsLive.Platform.Person"></value>
        return this._person;
    }
});

Object.defineProperty(People.RecentActivity.UI.Host.PanelProvider.prototype, "fields", {
    get: function() {
        /// <summary>
        ///     Gets the data fields.
        /// </summary>
        /// <value type="Object"></value>
        return this._fields;
    }
});

People.RecentActivity.UI.Host.PanelProvider.prototype.load = function(host, person, fields, hydrationData) {
    /// <summary>
    ///     Loads the panel provider with the given data.
    /// </summary>
    /// <param name="host" type="People.PanelHost">The host.</param>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">The person.</param>
    /// <param name="fields" type="Object">The data fields.</param>
    /// <param name="hydrationData" type="Object">The hydration data.</param>
    Debug.assert(host != null, 'host != null');
    Debug.assert(person != null, 'person != null');
    if (this._impl != null) {
        // dispose of the old instance first.
        this.unload();
    }

    this._host = host;
    this._person = person;
    this._fields = fields;
    this._impl = this.onLoad();
    this._impl.load(hydrationData);
};

People.RecentActivity.UI.Host.PanelProvider.prototype.unload = function() {
    /// <summary>
    ///     Unloads the panel provider.
    /// </summary>
    this.onUnload();
};

People.RecentActivity.UI.Host.PanelProvider.prototype.suspend = function(data) {
    /// <summary>
    ///     Suspends the panel provider.
    /// </summary>
    /// <param name="data" type="Object">The data.</param>
    Debug.assert(data != null, 'data != null');
    this.onSuspend(data);
};

People.RecentActivity.UI.Host.PanelProvider.prototype.onUnload = function() {
    /// <summary>
    ///     Occurs on unload.
    /// </summary>
    if (this._impl != null) {
        this._impl.unload();
        this._impl = null;
    }

    this._fields = null;
    this._person = null;
    this._host = null;
};

People.RecentActivity.UI.Host.PanelProvider.prototype.onSuspend = function(data) {
    /// <summary>
    ///     Occurs on suspension.
    /// </summary>
    /// <param name="data" type="Object">The data store.</param>
    Debug.assert(data != null, 'data != null');
    if (this._impl != null) {
        this._impl.suspend(data);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="LandingPagePanelProviderImpl.js" />
/// <reference path="PanelProvider.js" />
/// <reference path="PanelProviderImpl.js" />

People.RecentActivity.UI.Host.LandingPagePanelProvider = function() {
    /// <summary>
    ///     Provides a panel provider for the landing pages.
    /// </summary>
    People.RecentActivity.UI.Host.PanelProvider.call(this);
};

Jx.inherit(People.RecentActivity.UI.Host.LandingPagePanelProvider, People.RecentActivity.UI.Host.PanelProvider);

People.RecentActivity.UI.Host.LandingPagePanelProvider.prototype.onLoad = function() {
    /// <summary>
    ///     Occurs on load.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.Host.PanelProviderImpl"></returns>
    return new People.RecentActivity.UI.Host.LandingPagePanelProviderImpl(this.host, this.person, this.fields);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Host.PanelProviderImpl = function(host, person, fields) {
    /// <summary>
    ///     Provides a base class for panel provider implementations.
    /// </summary>
    /// <param name="host" type="People.PanelHost">The host.</param>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">The person.</param>
    /// <param name="fields" type="Object">The data fields.</param>
    /// <field name="_host" type="People.PanelHost">The host.</field>
    /// <field name="_person" type="Microsoft.WindowsLive.Platform.Person">The person.</field>
    /// <field name="_fields" type="Object">The data fields.</field>
    Debug.assert(host != null, 'host != null');
    Debug.assert(person != null, 'person != null');
    this._host = host;
    this._person = person;
    this._fields = fields;
};


People.RecentActivity.UI.Host.PanelProviderImpl.prototype._host = null;
People.RecentActivity.UI.Host.PanelProviderImpl.prototype._person = null;
People.RecentActivity.UI.Host.PanelProviderImpl.prototype._fields = null;

Object.defineProperty(People.RecentActivity.UI.Host.PanelProviderImpl.prototype, "host", {
    get: function() {
        /// <summary>
        ///     Gets the host.
        /// </summary>
        /// <value type="People.PanelHost"></value>
        return this._host;
    }
});

Object.defineProperty(People.RecentActivity.UI.Host.PanelProviderImpl.prototype, "person", {
    get: function() {
        /// <summary>
        ///     Gets the person.
        /// </summary>
        /// <value type="Microsoft.WindowsLive.Platform.Person"></value>
        return this._person;
    }
});

Object.defineProperty(People.RecentActivity.UI.Host.PanelProviderImpl.prototype, "fields", {
    get: function() {
        /// <summary>
        ///     Gets the data fields.
        /// </summary>
        /// <value type="Object"></value>
        return this._fields;
    }
});

People.RecentActivity.UI.Host.PanelProviderImpl.prototype.suspend = function(data) {
    /// <summary>
    ///     Suspends the implementation.
    /// </summary>
    /// <param name="data" type="Object">The data store.</param>
    Debug.assert(data != null, 'data != null');
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Imports\Panel.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\Feed\FeedPanel.js" />
/// <reference path="..\Notifications\NotificationPanel.js" />
/// <reference path="..\Photos\PhotoAlbumsPanel.js" />
/// <reference path="PanelProviderImpl.js" />

People.RecentActivity.UI.Host.LandingPagePanelProviderImpl = function(host, person, fields) {
    /// <summary>
    ///     Provides an implementation for the landing page provider.
    /// </summary>
    /// <param name="host" type="People.PanelHost">The host.</param>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">The person.</param>
    /// <param name="fields" type="Object">The data fields.</param>
    /// <field name="_feedHydrationKey$1" type="String" static="true">The key for the feed hydration data.</field>
    /// <field name="_photosHydrationKey$1" type="String" static="true">The key for the photos hydration data.</field>
    /// <field name="_notificationsHydrationKey$1" type="String" static="true">The key for the notifications hydration data.</field>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_panelFeed$1" type="People.RecentActivity.Imports.Panel">The feed panel.</field>
    /// <field name="_panelPhoto$1" type="People.RecentActivity.Imports.Panel">The photos panel.</field>
    /// <field name="_panelNotification$1" type="People.RecentActivity.Imports.Panel">The notifications panel.</field>
    People.RecentActivity.UI.Host.PanelProviderImpl.call(this, host, person, fields);
};

Jx.inherit(People.RecentActivity.UI.Host.LandingPagePanelProviderImpl, People.RecentActivity.UI.Host.PanelProviderImpl);


People.RecentActivity.UI.Host.LandingPagePanelProviderImpl._feedHydrationKey$1 = 'FeedPanel';
People.RecentActivity.UI.Host.LandingPagePanelProviderImpl._photosHydrationKey$1 = 'PhotosPanel';
People.RecentActivity.UI.Host.LandingPagePanelProviderImpl._notificationsHydrationKey$1 = 'NotificationsPanel';
People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype._identity$1 = null;
People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype._panelFeed$1 = null;
People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype._panelPhoto$1 = null;
People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype._panelNotification$1 = null;

People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype.load = function(hydrationData) {
    /// <summary>
    ///     Occurs on load. Once this method has been called, panels may be added.
    /// </summary>
    /// <param name="hydrationData" type="Object">The data store.</param>
    // initialize a new identity from the person.
    this._identity$1 = People.RecentActivity.Identity.createFromDataContext(this.person, this.fields);
    if (this._identity$1 != null) {
        this._identity$1.capabilities.addListener("propertychanged", this._onCapabilityPropertyChanged$1, this);
        var hydrationFeed = null;
        var hydrationNotifications = null;
        var hydrationPhotos = null;
        if (hydrationData != null) {
            // fetch the hydration data from the store.
            hydrationFeed = hydrationData['FeedPanel'];
            hydrationNotifications = hydrationData['NotificationsPanel'];
            hydrationPhotos = hydrationData['PhotosPanel'];
        }

        // figure out which panels we can add.
        this._addOrRemoveFeedPanel$1(hydrationFeed);
        this._addOrRemoveNotificationPanel$1(hydrationNotifications);
        this._addOrRemovePhotosPanel$1(hydrationPhotos);
    }
};

People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype.unload = function() {
    /// <summary>
    ///     Occurs on unload.
    /// </summary>
    this._panelFeed$1 = null;
    this._panelNotification$1 = null;
    this._panelPhoto$1 = null;
    if (this._identity$1 != null) {
        // detach event handlers of course :-)
        this._identity$1.capabilities.removeListenerSafe("propertychanged", this._onCapabilityPropertyChanged$1, this);
        this._identity$1.dispose();
        this._identity$1 = null;
    }
};

People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype.suspend = function(data) {
    /// <summary>
    ///     Suspends the panel provider.
    /// </summary>
    /// <param name="data" type="Object">The data.</param>
    if (this._panelFeed$1 != null) {
        data['FeedPanel'] = this._panelFeed$1.suspend();
    }

    if (this._panelNotification$1 != null) {
        data['NotificationsPanel'] = this._panelNotification$1.suspend();
    }

    if (this._panelPhoto$1 != null) {
        data['PhotosPanel'] = this._panelPhoto$1.suspend();
    }

    People.RecentActivity.UI.Host.PanelProviderImpl.prototype.suspend.call(this, data);
};

People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype._addOrRemoveFeedPanel$1 = function(hydrationData) {
    /// <param name="hydrationData" type="Object"></param>
    if (this._identity$1.capabilities.canShowWhatsNew) {
        if (this._panelFeed$1 == null) {
            // we now support the feed panel.
            this._panelFeed$1 = new People.RecentActivity.UI.Feed.FeedPanel(this._identity$1, this.fields, hydrationData);
            this.host.addPanel(this._panelFeed$1);
        }

    }
    else {
        if (this._panelFeed$1 != null) {
            // apparently we no longer support the feed.
            this.host.removePanel(this._panelFeed$1.id);
            this._panelFeed$1 = null;
        }    
    }
};

People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype._addOrRemoveNotificationPanel$1 = function(hydrationData) {
    /// <param name="hydrationData" type="Object"></param>
    if (this._identity$1.capabilities.canShowNotifications) {
        if (this._panelNotification$1 == null) {
            // we now support the notification panel.
            this._panelNotification$1 = new People.RecentActivity.UI.Notifications.NotificationPanel(this._identity$1, hydrationData);
            this.host.addPanel(this._panelNotification$1);
        }

    }
    else {
        if (this._panelNotification$1 != null) {
            // we no longer support notifications.
            this.host.removePanel(this._panelNotification$1.id);
            this._panelNotification$1 = null;
        }    
    }
};

People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype._addOrRemovePhotosPanel$1 = function(hydrationData) {
    /// <param name="hydrationData" type="Object"></param>
    if (this._identity$1.capabilities.canShowPhotos) {
        if (this._panelPhoto$1 == null) {
            // we now support the photos panel.
            this._panelPhoto$1 = new People.RecentActivity.UI.Photos.PhotoAlbumsPanel(this._identity$1, hydrationData);
            this.host.addPanel(this._panelPhoto$1);
        }

    }
    else {
        if (this._panelPhoto$1 != null) {
            // remove the photos panel.
            this.host.removePanel(this._panelPhoto$1.id);
            this._panelPhoto$1 = null;
        }    
    }
};

People.RecentActivity.UI.Host.LandingPagePanelProviderImpl.prototype._onCapabilityPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    switch (e.propertyName) {
        case 'CanShowWhatsNew':
            this._addOrRemoveFeedPanel$1(null);
            break;
        case 'CanShowPhotos':
            this._addOrRemovePhotosPanel$1(null);
            break;
        case 'CanShowNotifications':
            this._addOrRemoveNotificationPanel$1(null);
            break;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="HostedControlImpl.js" />

People.RecentActivity.UI.Host.HostedControl = function(host, options) {
    /// <summary>
    ///     Provides a base class for hosted controls.
    /// </summary>
    /// <param name="host" type="People.Host">The host.</param>
    /// <param name="options" type="Object">The options (optional.)</param>
    /// <field name="_host" type="People.Host">The host object.</field>
    /// <field name="_options" type="Object">The options.</field>
    /// <field name="_impl" type="People.RecentActivity.UI.Host.HostedControlImpl">The implementation.</field>
    Debug.assert(host != null, 'host != null');
    this._host = host;
    this._options = options;
    // load the required resources.
    this.onLoadResources();
};


People.RecentActivity.UI.Host.HostedControl.prototype._host = null;
People.RecentActivity.UI.Host.HostedControl.prototype._options = null;
People.RecentActivity.UI.Host.HostedControl.prototype._impl = null;

Object.defineProperty(People.RecentActivity.UI.Host.HostedControl.prototype, "host", {
    get: function() {
        /// <summary>
        ///     Gets the host.
        /// </summary>
        /// <value type="People.Host"></value>
        return this._host;
    }
});

Object.defineProperty(People.RecentActivity.UI.Host.HostedControl.prototype, "options", {
    get: function() {
        /// <summary>
        ///     Gets the options.
        /// </summary>
        /// <value type="Object"></value>
        return this._options;
    }
});

People.RecentActivity.UI.Host.HostedControl.prototype.load = function(data) {
    /// <summary>
    ///     Loads the control.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    Debug.assert(data != null, 'data != null');
    if (this._impl != null) {
        // destroy our current implementation first.
        this.unload();
    }

    this._impl = this.onLoad(data);
    return this._impl.getAnimationData();
};

People.RecentActivity.UI.Host.HostedControl.prototype.prepareSaveBackState = function() {
    /// <summary>
    ///     Prepares the control for intra-page hydration.
    /// </summary>
    /// <returns type="Object"></returns>
    return this.onPrepareSaveBackState();
};

People.RecentActivity.UI.Host.HostedControl.prototype.prepareSuspension = function() {
    /// <summary>
    ///     Prepares the control for dehydration.
    /// </summary>
    /// <returns type="Object"></returns>
    return this.onPrepareSuspension();
};

People.RecentActivity.UI.Host.HostedControl.prototype.prepareSaveState = function() {
    /// <summary>
    ///     Prepares the control for intra-page hydration.
    /// </summary>
    /// <returns type="Object"></returns>
    return this.onPrepareSaveState();
};

People.RecentActivity.UI.Host.HostedControl.prototype.activate = function() {
    /// <summary>
    ///     Activates the control. Will be invoked when the user navigates to the control.
    /// </summary>
    /// <returns type="Boolean"></returns>
    this._impl.render();
    this.onActivate();
    return true;
};

People.RecentActivity.UI.Host.HostedControl.prototype.scrollToBeginning = function() {
    /// <summary>
    ///     Scroll to beginnning of the control.
    /// </summary>
    this._impl.scrollToBeginning();
};

People.RecentActivity.UI.Host.HostedControl.prototype.deactivate = function() {
    /// <summary>
    ///     Deactivates the control. Will be invoked whent he user navigates away from the control.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this.onDeactivate();
};

People.RecentActivity.UI.Host.HostedControl.prototype.unload = function() {
    /// <summary>
    ///     Unloads the control, releasing any resources.
    /// </summary>
    this.onUnload();
    if (this._impl != null) {
        // destroy the current implementation.
        this._impl.dispose();
        this._impl = null;
    }
};

People.RecentActivity.UI.Host.HostedControl.prototype.save = function() {
    /// <summary>
    ///     Saves the current contents of the control (for edit controls.)
    ///     This method has no effect on the RA <see cref="T:People.RecentActivity.UI.Host.HostedControl" />.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this.onSave();
};

People.RecentActivity.UI.Host.HostedControl.prototype.hasFilter = function() {
    /// <summary>
    ///     Whether the control implements a filter.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this.onHasFilter();
};

People.RecentActivity.UI.Host.HostedControl.prototype.getCurrentFilterName = function() {
    /// <summary>
    ///     Gets the name of the active filter.
    /// </summary>
    /// <returns type="String"></returns>
    return this.onGetCurrentFilterName();
};

People.RecentActivity.UI.Host.HostedControl.prototype.getFilterItems = function() {
    /// <summary>
    ///     Gets the array of filter items.
    /// </summary>
    /// <returns type="Array" elementType="flyoutItemDescriptor"></returns>
    return this.onGetFilterItems();
};

People.RecentActivity.UI.Host.HostedControl.prototype.onLoadResources = function() {
    /// <summary>
    ///     Occurs when the host needs to load the required resources.
    /// </summary>
};

People.RecentActivity.UI.Host.HostedControl.prototype.onActivate = function() {
    /// <summary>
    ///     Occurs when the page is being navigated to.
    /// </summary>
};

People.RecentActivity.UI.Host.HostedControl.prototype.onDeactivate = function() {
    /// <summary>
    ///     Occurs on deactivation (when the user navigates away from the page).
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this._impl.deactivate();
};

People.RecentActivity.UI.Host.HostedControl.prototype.onPrepareSuspension = function() {
    /// <summary>
    ///     Occurs when the application is being dehydrated.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this._impl != null) {
        return this._impl.prepareSaveState(0);
    }

    return null;
};

People.RecentActivity.UI.Host.HostedControl.prototype.onPrepareSaveState = function() {
    /// <summary>
    ///     Occurs when the application is moving away from the page by going back to the previous page.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this._impl != null) {
        return this._impl.prepareSaveState(1);
    }

    return null;
};

People.RecentActivity.UI.Host.HostedControl.prototype.onPrepareSaveBackState = function() {
    /// <summary>
    ///     Occurs when the application is moving away from the page.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this._impl != null) {
        return this._impl.prepareSaveState(2);
    }

    return null;
};

People.RecentActivity.UI.Host.HostedControl.prototype.onSave = function() {
    /// <summary>
    ///     Occurs when the current contents of the control (for edit controls) needs to be saved.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return false;
};

People.RecentActivity.UI.Host.HostedControl.prototype.onUnload = function() {
    /// <summary>
    ///     Occurs on unload.
    /// </summary>
};

People.RecentActivity.UI.Host.HostedControl.prototype.onHasFilter = function() {
    /// <summary>
    ///     Whether the control implements a filter.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return (this._impl != null) && this._impl.hasFilter();
};

People.RecentActivity.UI.Host.HostedControl.prototype.onGetCurrentFilterName = function() {
    /// <summary>
    ///     Gets the name of the active filter.
    /// </summary>
    /// <returns type="String"></returns>
    return (this._impl != null) ? this._impl.getCurrentFilterName() : null;
};

People.RecentActivity.UI.Host.HostedControl.prototype.onGetFilterItems = function() {
    /// <summary>
    ///     Gets the array of filter items.
    /// </summary>
    /// <returns type="Array" elementType="flyoutItemDescriptor"></returns>
    return (this._impl != null) ? this._impl.getFilterItems() : null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="HostedControl.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="NotificationHostedControlImpl.js" />

People.RecentActivity.UI.Host.NotificationHostedControl = function(host, options) {
    /// <summary>
    ///     Provides the main entry point for the notifications feed.
    /// </summary>
    /// <param name="host" type="People.Host">The host.</param>
    /// <param name="options" type="Object">The options (optional.)</param>
    People.RecentActivity.UI.Host.HostedControl.call(this, host, options);
};

Jx.inherit(People.RecentActivity.UI.Host.NotificationHostedControl, People.RecentActivity.UI.Host.HostedControl);

People.RecentActivity.UI.Host.NotificationHostedControl.prototype.onLoad = function(data) {
    /// <summary>
    ///     Occurs when the host is being loaded.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <returns type="People.RecentActivity.UI.Host.HostedControlImpl"></returns>
    return new People.RecentActivity.UI.Host.NotificationHostedControlImpl(data);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Controls\GlobalProgressControl.js" />
/// <reference path="HostedControlSuspensionScenario.js" />

People.RecentActivity.UI.Host.HostedControlImpl = function(data) {
    /// <summary>
    ///     Provides the implementation for a hosted control.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <field name="_data" type="People.HostedControlData">The control data.</field>
    /// <field name="_disposed" type="Boolean">Whether the instance has been disposed.</field>
    /// <field name="_rendered" type="Boolean">Whether the instance has been rendered.</field>
    /// <field name="_state" type="Object">The state, that can be used to restore from hydration.</field>
    /// <field name="_stateScenario" type="People.RecentActivity.UI.Host.HostedControlSuspensionScenario">The scenario we saved state for.</field>
    Debug.assert(data != null, 'data != null');
    Debug.assert(data.element != null, 'data.Element != null');
    this._data = data;
    switch (this._data.mode) {
        case 'load':
            // when the page is being loaded, we should pass along any state we saved between page navigates.
            this.onInitialize(this._deserializeState(this._data.state));
            break;
        case 'hydrate':
            // when the app is coming back from hydration, pass along any state we saved before the app was suspended.
            this.onInitialize(this._deserializeState(this._data.context));
            break;
        case 'linked':
            // when coming from a deep-link, there will never be hydration state, so we don't have to pass that along.
            this.onInitializeFromLinked();
            break;
        default:
            // yeah.. we don't support this mode.
            Debug.assert(false, 'Unknown load mode: ' + this._data.mode);
            break;
    }

};


People.RecentActivity.UI.Host.HostedControlImpl.prototype._data = null;
People.RecentActivity.UI.Host.HostedControlImpl.prototype._disposed = false;
People.RecentActivity.UI.Host.HostedControlImpl.prototype._rendered = false;
People.RecentActivity.UI.Host.HostedControlImpl.prototype._state = null;
People.RecentActivity.UI.Host.HostedControlImpl.prototype._stateScenario = 0;

Object.defineProperty(People.RecentActivity.UI.Host.HostedControlImpl.prototype, "data", {
    get: function() {
        /// <summary>
        ///     Gets the data.
        /// </summary>
        /// <value type="People.HostedControlData"></value>
        return this._data;
    }
});

Object.defineProperty(People.RecentActivity.UI.Host.HostedControlImpl.prototype, "isDisposed", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this host was disposed.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._disposed;
    }
});

People.RecentActivity.UI.Host.HostedControlImpl.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the control.
    /// </summary>
    if (!this._disposed) {
        this._disposed = true;
        // reset the global progress control.
        People.RecentActivity.UI.Core.GlobalProgressControl.reset();
        this.onDispose();
    }
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.prepareSaveState = function(scenario) {
    /// <summary>
    ///     Gets the saved state.
    /// </summary>
    /// <param name="scenario" type="People.RecentActivity.UI.Host.HostedControlSuspensionScenario">The scenario.</param>
    /// <returns type="Object"></returns>
    if (this._state == null) {
        // fetch the state
        this._state = this._serializeState(this.onPrepareSaveState(scenario));
        this._stateScenario = scenario;
    }

    if (scenario === this._stateScenario) {
        // only return the cached state if it matches. if we're being asked for state
        // that is not for the cached scenario, it means we can safely ignore that request,
        // as we already have enough state stashed away.
        return this._state;
    }

    return null;
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.getAnimationData = function() {
    /// <summary>
    ///     Gets the elements that must enter on render.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    return this.onGetAnimationData();
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.render = function() {
    /// <summary>
    ///     Renders the control.
    /// </summary>
    if (!this._rendered) {
        this._rendered = true;
        this.onRender();
    }
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.deactivate = function() {
    /// <summary>
    ///     Deactivates the hosted control.
    /// </summary>
    /// <returns type="Boolean"></returns>
    // reset the global progress control.
    People.RecentActivity.UI.Core.GlobalProgressControl.reset();
    return this.onDeactivate();
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.scrollToBeginning = function() {
    /// <summary>
    ///     Scroll to beginnning of the control.
    /// </summary>
    this.resetScrollPosition();
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.hasFilter = function() {
    /// <summary>
    ///     Whether the control implements a filter.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this.onHasFilter();
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.getCurrentFilterName = function() {
    /// <summary>
    ///     Gets the name of the active filter.
    /// </summary>
    /// <returns type="String"></returns>
    return this.onGetCurrentFilterName();
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.getFilterItems = function() {
    /// <summary>
    ///     Gets the array of filter items.
    /// </summary>
    /// <returns type="Array" elementType="flyoutItemDescriptor"></returns>
    return this.onGetFilterItems();
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.resetScrollPosition = function() {
    /// <summary>
    ///     Reset scroll position to zero.
    /// </summary>
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onDispose = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onInitialize = function(state) {
    /// <summary>
    ///     Occurs when the control is being initialized.
    /// </summary>
    /// <param name="state" type="Object">The hydration state, if any.</param>
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onInitializeFromLinked = function() {
    /// <summary>
    ///     Occurs when the control is being initialized from deep-linking.
    /// </summary>
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onPrepareSaveState = function(scenario) {
    /// <summary>
    ///     Occurs when the instance is being dehydrated.
    /// </summary>
    /// <param name="scenario" type="People.RecentActivity.UI.Host.HostedControlSuspensionScenario">The scenario.</param>
    /// <returns type="Object"></returns>
    return null;
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onGetAnimationData = function() {
    /// <summary>
    ///     Occurs when the instance is looking for elements to enter.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    return null;
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onRender = function() {
    /// <summary>
    ///     Occurs when the instance has to be rendered.
    /// </summary>
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onDeactivate = function() {
    /// <summary>
    ///     Occurs when the control is being deactivated.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return true;
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onHasFilter = function() {
    /// <summary>
    ///     Whether the control implements a filter.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return false;
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onGetCurrentFilterName = function() {
    /// <summary>
    ///     Gets the name of the active filter.
    /// </summary>
    /// <returns type="String"></returns>
    return null;
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype.onGetFilterItems = function() {
    /// <summary>
    ///     Gets the array of filter items.
    /// </summary>
    /// <returns type="Array" elementType="flyoutItemDescriptor"></returns>
    return null;
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype._serializeState = function(state) {
    /// <param name="state" type="Object"></param>
    /// <returns type="Object"></returns>
    if (state != null) {
        return JSON.stringify(state);
    }

    return null;
};

People.RecentActivity.UI.Host.HostedControlImpl.prototype._deserializeState = function(state) {
    /// <param name="state" type="Object"></param>
    /// <returns type="Object"></returns>
    if (state != null) {
        try {
            return JSON.parse(state);
        }
        catch (e) {
            // ignore deserialization exceptions.
        }    
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\Notifications\NotificationLayout.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="HostedControlSuspensionScenario.js" />

People.RecentActivity.UI.Host.NotificationHostedControlImpl = function(data) {
    /// <summary>
    ///     Provides the implementation of the notification hosted control.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <field name="_layout$1" type="People.RecentActivity.UI.Notifications.NotificationLayout">The layout.</field>
    People.RecentActivity.UI.Host.HostedControlImpl.call(this, data);
};

Jx.inherit(People.RecentActivity.UI.Host.NotificationHostedControlImpl, People.RecentActivity.UI.Host.HostedControlImpl);


People.RecentActivity.UI.Host.NotificationHostedControlImpl.prototype._layout$1 = null;

People.RecentActivity.UI.Host.NotificationHostedControlImpl.prototype.onDispose = function() {
    /// <summary>
    ///     Disposes the control.
    /// </summary>
    // dispose all data we're holding on to.
    this._layout$1.dispose();
    this._layout$1 = null;
};

People.RecentActivity.UI.Host.NotificationHostedControlImpl.prototype.onInitialize = function(hydrationState) {
    /// <summary>
    ///     Occurs when the control is being initialized.
    /// </summary>
    /// <param name="hydrationState" type="Object">The hydration state.</param>
    this._initialize$1(hydrationState);
};

People.RecentActivity.UI.Host.NotificationHostedControlImpl.prototype.onPrepareSaveState = function(scenario) {
    /// <summary>
    ///     Occurs when the instance is being dehydrated.
    /// </summary>
    /// <param name="scenario" type="People.RecentActivity.UI.Host.HostedControlSuspensionScenario">The scenario.</param>
    /// <returns type="Object"></returns>
    if (scenario !== 1) {
        return this._layout$1.getState();
    }

    return null;
};

People.RecentActivity.UI.Host.NotificationHostedControlImpl.prototype.onRender = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    this._layout$1.render();
};

People.RecentActivity.UI.Host.NotificationHostedControlImpl.prototype.onGetAnimationData = function () {
    /// <summary>
    ///     Occurs when the instance is looking for elements to enter.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    return { elements: [] };
};

People.RecentActivity.UI.Host.NotificationHostedControlImpl.prototype.onDeactivate = function() {
    /// <summary>
    ///     Deactivates the control.
    /// </summary>
    /// <returns type="Boolean"></returns>
    this._layout$1.deactivate();
    return People.RecentActivity.UI.Host.HostedControlImpl.prototype.onDeactivate.call(this);
};

People.RecentActivity.UI.Host.NotificationHostedControlImpl.prototype._initialize$1 = function(state) {
    /// <param name="state" type="Object"></param>
    this._layout$1 = new People.RecentActivity.UI.Notifications.NotificationLayout(People.RecentActivity.Identity.createMeIdentity(), this.data.element);
    this._layout$1.initialize(state);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="HostedControl.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="PhotosHostedControlImpl.js" />

People.RecentActivity.UI.Host.PhotosHostedControl = function(host, options) {
    /// <summary>
    ///     Provides a hosted control for Photos.
    /// </summary>
    /// <param name="host" type="People.Host">The host.</param>
    /// <param name="options" type="Object">The options.</param>
    People.RecentActivity.UI.Host.HostedControl.call(this, host, options);
};

Jx.inherit(People.RecentActivity.UI.Host.PhotosHostedControl, People.RecentActivity.UI.Host.HostedControl);

People.RecentActivity.UI.Host.PhotosHostedControl.prototype.onLoad = function(data) {
    /// <summary>
    ///     Occurs on load.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <returns type="People.RecentActivity.UI.Host.HostedControlImpl"></returns>
    return new People.RecentActivity.UI.Host.PhotosHostedControlImpl(data);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\Photos\PhotoAlbumsLayout.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="HostedControlSuspensionScenario.js" />

People.RecentActivity.UI.Host.PhotosHostedControlImpl = function(data) {
    /// <summary>
    ///     Provides the implementation of a hosted control.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_layout$1" type="People.RecentActivity.UI.Photos.PhotoAlbumsLayout">The layout.</field>
    People.RecentActivity.UI.Host.HostedControlImpl.call(this, data);
};

Jx.inherit(People.RecentActivity.UI.Host.PhotosHostedControlImpl, People.RecentActivity.UI.Host.HostedControlImpl);


People.RecentActivity.UI.Host.PhotosHostedControlImpl.prototype._identity$1 = null;
People.RecentActivity.UI.Host.PhotosHostedControlImpl.prototype._layout$1 = null;

People.RecentActivity.UI.Host.PhotosHostedControlImpl.prototype.onDispose = function() {
    /// <summary>
    ///     Disposes the control.
    /// </summary>
    // dispose all data we're holding on to.
    this._layout$1.dispose();
    this._layout$1 = null;
    this._identity$1.dispose();
    this._identity$1 = null;
};

People.RecentActivity.UI.Host.PhotosHostedControlImpl.prototype.onInitialize = function(hydrationState) {
    /// <summary>
    ///     Occurs when the control is being initialized.
    /// </summary>
    /// <param name="hydrationState" type="Object">The hydration state.</param>
    this._initialize$1(hydrationState);
};

People.RecentActivity.UI.Host.PhotosHostedControlImpl.prototype.onInitializeFromLinked = function() {
    /// <summary>
    ///     Occurs when the control is being initialized from deep-linking.
    /// </summary>
    // check to see if we need to navigate to a network.
    this._initialize$1(null);
};

People.RecentActivity.UI.Host.PhotosHostedControlImpl.prototype.onPrepareSaveState = function(scenario) {
    /// <summary>
    ///     Occurs when the instance is being dehydrated.
    /// </summary>
    /// <param name="scenario" type="People.RecentActivity.UI.Host.HostedControlSuspensionScenario">The scenario.</param>
    /// <returns type="Object"></returns>
    if (scenario !== 1) {
        return this._layout$1.getState();
    }

    return null;
};

People.RecentActivity.UI.Host.PhotosHostedControlImpl.prototype.onRender = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    this._layout$1.render();
};

People.RecentActivity.UI.Host.PhotosHostedControlImpl.prototype._initialize$1 = function(state) {
    /// <param name="state" type="Object"></param>
    var data = this.data;
    this._identity$1 = People.RecentActivity.Identity.createFromDataContext(data.data, data.fields);
    this._layout$1 = new People.RecentActivity.UI.Photos.PhotoAlbumsLayout(this._identity$1, data.element);
    this._layout$1.initialize(state);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="HostedControl.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="RAHostedControlImpl.js" />

People.RecentActivity.UI.Host.RAHostedControl = function(host, options) {
    /// <summary>
    ///     Provides the main entry point for the RA feed.
    /// </summary>
    /// <param name="host" type="People.Host">The host.</param>
    /// <param name="options" type="Object">The options (optional.)</param>
    People.RecentActivity.UI.Host.HostedControl.call(this, host, options);
};

Jx.inherit(People.RecentActivity.UI.Host.RAHostedControl, People.RecentActivity.UI.Host.HostedControl);

People.RecentActivity.UI.Host.RAHostedControl.prototype.onLoad = function(data) {
    /// <summary>
    ///     Occurs when the host is being loaded.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <returns type="People.RecentActivity.UI.Host.HostedControlImpl"></returns>
    return new People.RecentActivity.UI.Host.RAHostedControlImpl(data);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\Feed\FeedLayout.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="HostedControlSuspensionScenario.js" />
/// <reference path="WhatsNewHostedControlImplState.js" />

People.RecentActivity.UI.Host.RAHostedControlImpl = function(data) {
    /// <summary>
    ///     Provides the implementation of a hosted control.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_layout$1" type="People.RecentActivity.UI.Feed.FeedLayout">The layout.</field>
    People.RecentActivity.UI.Host.HostedControlImpl.call(this, data);
};

Jx.inherit(People.RecentActivity.UI.Host.RAHostedControlImpl, People.RecentActivity.UI.Host.HostedControlImpl);


People.RecentActivity.UI.Host.RAHostedControlImpl.prototype._identity$1 = null;
People.RecentActivity.UI.Host.RAHostedControlImpl.prototype._layout$1 = null;

People.RecentActivity.UI.Host.RAHostedControlImpl.prototype.onGetAnimationData = function() {
    /// <summary>
    ///     Gets the content animation data.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    return this._layout$1.getAnimationData();
};

People.RecentActivity.UI.Host.RAHostedControlImpl.prototype.onDispose = function() {
    /// <summary>
    ///     Disposes the control.
    /// </summary>
    // dispose all data we're holding on to.
    this._layout$1.dispose();
    this._layout$1 = null;
    this._identity$1.dispose();
    this._identity$1 = null;
};

People.RecentActivity.UI.Host.RAHostedControlImpl.prototype.onInitialize = function(hydrationState) {
    /// <summary>
    ///     Occurs when the control is being initialized.
    /// </summary>
    /// <param name="hydrationState" type="Object">The hydration state.</param>
    this._initialize$1(hydrationState);
};

People.RecentActivity.UI.Host.RAHostedControlImpl.prototype.onInitializeFromLinked = function() {
    /// <summary>
    ///     Occurs when the control is being initialized from deep-linking.
    /// </summary>
    this._initialize$1(null);
};

People.RecentActivity.UI.Host.RAHostedControlImpl.prototype.onPrepareSaveState = function(scenario) {
    /// <summary>
    ///     Occurs when the instance is being dehydrated.
    /// </summary>
    /// <param name="scenario" type="People.RecentActivity.UI.Host.HostedControlSuspensionScenario">The scenario.</param>
    /// <returns type="Object"></returns>
    var saveBatchItemState = true;
    var stateMarkupId = null;
    var state = null;
    // if we're doing a back navigate, that is all we're going to save.
    // otherwise, we should also store the scroll position, but we should store that in the app-frame
    // so it is returned to us at the appropriate time.
    switch (scenario) {
        case 2:
        case 0:
            // fetch the layout state.
            state = this._layout$1.getState();
            stateMarkupId = this._layout$1.getMarkupState();
            // in these cases we need to save all item states.
            saveBatchItemState = false;
            break;
    }

    // tell the layout to store the item state, and give us back the key it used.
    var stateItemsId = this._layout$1.getItemState(saveBatchItemState);
    return People.RecentActivity.UI.Host.create_whatsNewHostedControlImplState(stateItemsId, stateMarkupId, state);
};

People.RecentActivity.UI.Host.RAHostedControlImpl.prototype.onRender = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    this._layout$1.render();
};

People.RecentActivity.UI.Host.RAHostedControlImpl.prototype._initialize$1 = function(state) {
    /// <param name="state" type="Object"></param>
    var wrappedState = state;
    var data = this.data;
    this._identity$1 = People.RecentActivity.Identity.createFromDataContext(data.data, data.fields);
    this._layout$1 = new People.RecentActivity.UI.Feed.FeedLayout(this._identity$1, data.element);
    this._layout$1.initialize((wrappedState != null) ? wrappedState.state : null, (wrappedState != null) ? wrappedState.itemStateId : null, (wrappedState != null) ? wrappedState.markupStateId : null);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="HostedControl.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="SelfPageHostedControlImpl.js" />

People.RecentActivity.UI.Host.SelfPageHostedControl = function(host, options) {
    /// <summary>
    ///     Provides a hosted control for self pages.
    /// </summary>
    /// <param name="host" type="People.Host">The host.</param>
    /// <param name="options" type="Object">The options.</param>
    People.RecentActivity.UI.Host.HostedControl.call(this, host, options);
};

Jx.inherit(People.RecentActivity.UI.Host.SelfPageHostedControl, People.RecentActivity.UI.Host.HostedControl);

People.RecentActivity.UI.Host.SelfPageHostedControl.prototype.onLoad = function(data) {
    /// <summary>
    ///     Occurs on load.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <returns type="People.RecentActivity.UI.Host.HostedControlImpl"></returns>
    return new People.RecentActivity.UI.Host.SelfPageHostedControlImpl(data);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciClickthroughAction.js" />
/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Model\Events\FeedObjectActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\..\Model\FeedObjectType.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\..\Model\Network.js" />
/// <reference path="..\Core\Controls\GlobalProgressControl.js" />
/// <reference path="..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\Core\Helpers\UriHelper.js" />
/// <reference path="..\SelfPage\SelfPage.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="HostedControlSuspensionScenario.js" />

People.RecentActivity.UI.Host.SelfPageHostedControlImpl = function(data) {
    /// <summary>
    ///     Provides the implementation for self-page hosted controls.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <field name="_selfpage$1" type="People.RecentActivity.UI.SelfPage.SelfPage">The selfpage.</field>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_initialized$1" type="Boolean">Whether we've been fully initialized.</field>
    /// <field name="_rendered$1" type="Boolean">Whether <see cref="M:People.RecentActivity.UI.Host.SelfPageHostedControlImpl.OnRender" /> has been invoked.</field>
    /// <field name="_selfpageInitialized$1" type="Boolean">Whether we have initialized the selfpage object.</field>
    /// <field name="_hydrationData$1" type="People.RecentActivity.UI.SelfPage.selfPageHydrationData">The hydration data.</field>
    /// <field name="_isEnterComplete$1" type="Boolean">Whether the "enter content" animation has been completed.</field>
    /// <field name="_onEnterCompleteCallback$1" type="Function">The action to perform when the enter content animation has been completed, if any.</field>
    People.RecentActivity.UI.Host.HostedControlImpl.call(this, data);
};

Jx.inherit(People.RecentActivity.UI.Host.SelfPageHostedControlImpl, People.RecentActivity.UI.Host.HostedControlImpl);


People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._selfpage$1 = null;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._identity$1 = null;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._network$1 = null;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._obj$1 = null;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._initialized$1 = false;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._rendered$1 = false;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._selfpageInitialized$1 = false;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._hydrationData$1 = null;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._isEnterComplete$1 = false;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._onEnterCompleteCallback$1 = null;
People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._isAborted = false;

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype.onDispose = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._selfpage$1 != null) {
        this._selfpage$1.dispose();
        this._selfpage$1 = null;
    }

    if (this._network$1 != null) {
        this._network$1.removeListenerSafe("getobjectcompleted", this._onGetObjectCompleted$1, this);
        this._network$1 = null;
    }

    if (this._identity$1 != null) {
        this._identity$1.dispose();
        this._identity$1 = null;
    }

    this._hydrationData$1 = null;
    People.RecentActivity.UI.Host.HostedControlImpl.prototype.onDispose.call(this);
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype.onInitialize = function(state) {
    /// <summary>
    ///     Occurs when the hosted control is being initialized.
    /// </summary>
    /// <param name="state" type="Object">The state, if any.</param>
    this._hydrationData$1 = state;
    this._initializeInternal$1();
    People.RecentActivity.UI.Host.HostedControlImpl.prototype.onInitialize.call(this, state);
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype.onInitializeFromLinked = function() {
    /// <summary>
    ///     Occurs when the hosted control is being initialized from deep-linking.
    /// </summary>
    this._initializeInternal$1();
    People.RecentActivity.UI.Host.HostedControlImpl.prototype.onInitializeFromLinked.call(this);
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype.onPrepareSaveState = function(scenario) {
    /// <summary>
    ///     Occurs before suspension.
    /// </summary>
    /// <param name="scenario" type="People.RecentActivity.UI.Host.HostedControlSuspensionScenario">The scenario.</param>
    /// <returns type="Object"></returns>
    if (scenario !== 1) {
        if (this._selfpage$1 != null) {
            return this._selfpage$1.getState();
        }    
    }

    return null;
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype.onGetAnimationData = function() {
    /// <summary>
    ///     Occurs when the instance is looking for elements to enter.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    if (this._selfpage$1 != null) {
        var data = this._selfpage$1.getAnimationData();

        // Capture the current callback and replace it with our own.
        this._onEnterCompleteCallback$1 = data.onEnterComplete;
        data.onEnterComplete = this._onEnterComplete$1.bind(this);

        return data;
    }
    else {
        return People.RecentActivity.Imports.create_contentAnimationData([], this._onEnterComplete$1.bind(this));
    }
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype.onRender = function() {
    /// <summary>
    ///     Occurs when the self-page needs to be rendered.
    /// </summary>
    this._rendered$1 = true;
    this._renderInternal$1();
    People.RecentActivity.UI.Host.HostedControlImpl.prototype.onRender.call(this);
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._initializeInternal$1 = function() {
    Jx.log.write(4, 'SelfPageHostedControlImpl::InitializeInternal()');

    // add a progress control to indicate we're doing ... stuff.
    People.RecentActivity.UI.Core.GlobalProgressControl.add(this);
    var data = this.data;

    // figure out what network we have to get.
    var navigationData = data.fields;
    var networkId = navigationData.networkId;
    var objectId = navigationData.objectId;
    var objectType = parseInt(navigationData.objectType);

    // log the perf start point.
    People.RecentActivity.Core.EtwHelper.writeSelfPageEvent(People.RecentActivity.Core.EtwEventName.uiSelfPageStart, objectId);

    if (!Jx.isNonEmptyString(networkId) || !Jx.isNonEmptyString(objectId) || (objectType === People.RecentActivity.FeedObjectType.none)) {
        // cannot go to this self-page because there are parameters missing.
        Jx.log.write(2, 'One or more parameters are missing.');
        this._navigateBack$1(People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateBack);
        return;
    }

    if (navigationData.isWhatsNew) {
        this._identity$1 = People.RecentActivity.Identity.createWhatsNewIdentity();
    }
    else {
        this._identity$1 = People.RecentActivity.Identity.createFromDataContext((navigationData.temporaryContact == null) ? data.data : null, navigationData.temporaryContact);
    }

    this._network$1 = this._identity$1.networks.findById(networkId);
    if (this._network$1 == null) {
        // cannot go to this self-page because we don't know the network.
        Jx.log.write(2, 'Unknown network: ' + networkId);
        this._navigateBack$1(People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateBack);
        return;
    }

    // create the self page and append the element.
    this._selfpage$1 = new People.RecentActivity.UI.SelfPage.SelfPage(navigationData);
    this.data.element.appendChild(this._selfpage$1.element);

    // fetch the given object from the network.
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUISelfPageGetStart);
    this._network$1.addListener("getobjectcompleted", this._onGetObjectCompleted$1, this);
    this._network$1.getObject(objectId, objectType, null);
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._renderInternal$1 = function() {
    Jx.log.write(4, 'SelfPageHostedControlImpl::RenderInternal(' + this._rendered$1 + ',' + this._initialized$1 + ',' + this._isAborted + ')');

    if (this._isAborted) {
        // We initiated a back navigate, skip rendering.
        return;
    }

    if (this._rendered$1) {
        if (!this._selfpageInitialized$1) {
            this._selfpageInitialized$1 = true;

            // render back button right away, so there is at least something on self page immediately.
            // also make sure the sidebar is (or isn't) visible, depending on the resolution.
            this._selfpage$1.renderBackButton();
        }

        if (this._initialized$1) {
            // render the self page. we also tell it whether we're coming from a hydration
            // scenario so we can skip refreshing certain collections.
            this._selfpage$1.render(this._obj$1, this._hydrationData$1);

            // now that we're done rendering, we should remove the progress bar.
            People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);

            // once we're done rendering and the self-page is shown, log the event.
            var data = this.data.fields;
            People.RecentActivity.Core.EtwHelper.writeSelfPageEvent(People.RecentActivity.Core.EtwEventName.uiSelfPageEnd, data.objectId);
        }    
    }
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._navigateBack$1 = function(action) {
    /// <param name="action" type="Function"></param>
    Debug.assert(action != null, 'action != null');

    this._isAborted = true;

    // if the enter animation has completed, we should navigate back now.
    if (this._isEnterComplete$1) {
        action();
    }
    else {
        this._onEnterCompleteCallback$1 = action;
    }
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._onEnterComplete$1 = function() {
    this._isEnterComplete$1 = true;
    if (this._onEnterCompleteCallback$1 != null) {
        // we need to invoke the callback right now.
        this._onEnterCompleteCallback$1();
        this._onEnterCompleteCallback$1 = null;
    }
};

People.RecentActivity.UI.Host.SelfPageHostedControlImpl.prototype._onGetObjectCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.FeedObjectActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    Jx.log.write(4, 'SelfPageHostedControlImpl::OnGetObjectCompleted()');

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUISelfPageGetEnd);
    this._network$1.removeListenerSafe("getobjectcompleted", this._onGetObjectCompleted$1, this);

    if (e.result.code !== People.RecentActivity.Core.ResultCode.success) {
        // we couldn't fetch the object.
        Jx.log.write(2, 'Failed to retrieve feed object. ResultCode=' + e.result.code);

        // create local copies so we can access these after this.OnDispose() has already been called.
        var networkId = this._network$1.id;
        var data = this.data.fields;

        this._navigateBack$1(function () {
            People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateBack();

            // check to see if we can open a fallback URL in the browser.
            if (Jx.isNonEmptyString(data.fallbackUrl)) {
                People.RecentActivity.Core.BiciHelper.createClickThroughDatapoint(networkId, People.RecentActivity.Core.BiciClickthroughAction.selfPageGetFeedObjectFailed);
                People.RecentActivity.UI.Core.UriHelper.launchUri(data.fallbackUrl);
            }

        });
    }
    else {
        this._initialized$1 = true;
        this._obj$1 = e.feedObject;
        this._renderInternal$1();
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="HostedControl.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="WhatsNewHostedControlImpl.js" />

People.RecentActivity.UI.Host.WhatsNewHostedControl = function(host, options) {
    /// <summary>
    ///     Provides a hosted control for What's New.
    /// </summary>
    /// <param name="host" type="People.Host">The host.</param>
    /// <param name="options" type="Object">The options.</param>
    People.RecentActivity.UI.Host.HostedControl.call(this, host, options);
};

Jx.inherit(People.RecentActivity.UI.Host.WhatsNewHostedControl, People.RecentActivity.UI.Host.HostedControl);

People.RecentActivity.UI.Host.WhatsNewHostedControl.prototype.onLoad = function(data) {
    /// <summary>
    ///     Occurs on load.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <returns type="People.RecentActivity.UI.Host.HostedControlImpl"></returns>
    return new People.RecentActivity.UI.Host.WhatsNewHostedControlImpl(data);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\Feed\FeedLayout.js" />
/// <reference path="HostedControlImpl.js" />
/// <reference path="HostedControlSuspensionScenario.js" />
/// <reference path="WhatsNewHostedControlImplState.js" />

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl = function(data) {
    /// <summary>
    ///     Provides the implementation of a hosted control.
    /// </summary>
    /// <param name="data" type="People.HostedControlData">The data.</param>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_layout$1" type="People.RecentActivity.UI.Feed.FeedLayout">The layout.</field>
    People.RecentActivity.UI.Host.HostedControlImpl.call(this, data);
};

Jx.inherit(People.RecentActivity.UI.Host.WhatsNewHostedControlImpl, People.RecentActivity.UI.Host.HostedControlImpl);


People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype._identity$1 = null;
People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype._layout$1 = null;

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onGetAnimationData = function() {
    /// <summary>
    ///     Gets the content animation data.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    return this._layout$1.getAnimationData();
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onDispose = function() {
    /// <summary>
    ///     Disposes the control.
    /// </summary>
    // dispose all data we're holding on to.
    this._layout$1.dispose();
    this._layout$1 = null;
    this._identity$1.dispose();
    this._identity$1 = null;
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onInitialize = function(hydrationState) {
    /// <summary>
    ///     Occurs when the control is being initialized.
    /// </summary>
    /// <param name="hydrationState" type="Object">The hydration state.</param>
    this._initialize$1(hydrationState);
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onInitializeFromLinked = function() {
    /// <summary>
    ///     Occurs when the contorl is being initialized from deep-linking.
    /// </summary>
    // check to see if we need to navigate to a network.
    this._initialize$1(null);
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onPrepareSaveState = function(scenario) {
    /// <summary>
    ///     Occurs when the instance is being dehydrated.
    /// </summary>
    /// <param name="scenario" type="People.RecentActivity.UI.Host.HostedControlSuspensionScenario">The scenario.</param>
    /// <returns type="Object"></returns>
    var saveBatchItemState = true;
    var stateMarkupId = null;
    var state = null;
    // if we're doing a back navigate, that is all we're going to save.
    // otherwise, we should also store the scroll position, but we should store that in the app-frame
    // so it is returned to us at the appropriate time.
    switch (scenario) {
        case 2:
        case 0:
            // fetch the layout state.
            state = this._layout$1.getState();
            stateMarkupId = this._layout$1.getMarkupState();
            // in these cases we need to save all item states.
            saveBatchItemState = false;
            break;
    }

    // tell the layout to store the item state, and give us back the key it used.
    var stateItemId = this._layout$1.getItemState(saveBatchItemState);
    return People.RecentActivity.UI.Host.create_whatsNewHostedControlImplState(stateItemId, stateMarkupId, state);
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onRender = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    this._layout$1.render();
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.resetScrollPosition = function() {
    /// <summary>
    ///     Reset scroll position to zero.
    /// </summary>
    this._layout$1.resetScrollPosition();
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onHasFilter = function() {
    /// <summary>
    ///     Whether the control implements a filter.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this._layout$1.hasFilter();
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onGetCurrentFilterName = function() {
    /// <summary>
    ///     Gets the name of the active filter.
    /// </summary>
    /// <returns type="String"></returns>
    return this._layout$1.getCurrentFilterName();
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype.onGetFilterItems = function() {
    /// <summary>
    ///     Gets the array of filter items.
    /// </summary>
    /// <returns type="Array" elementType="flyoutItemDescriptor"></returns>
    return this._layout$1.getFilterItems();
};

People.RecentActivity.UI.Host.WhatsNewHostedControlImpl.prototype._initialize$1 = function(state) {
    /// <param name="state" type="Object"></param>
    var data = state;
    this._identity$1 = People.RecentActivity.Identity.createWhatsNewIdentity();
    this._layout$1 = new People.RecentActivity.UI.Feed.FeedLayout(this._identity$1, this.data.element);
    this._layout$1.initialize((data != null) ? data.state : null, (data != null) ? data.itemStateId : null, (data != null) ? data.markupStateId : null);
};
});