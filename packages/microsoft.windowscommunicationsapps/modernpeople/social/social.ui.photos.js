
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People.RecentActivity.UI.Photos, ["PhotoAlbumsPanel", "PhotoAlbumsLayout"], function () {

People.loadSocialModel();
People.loadSocialUICore();
People.RecentActivity.UI.Host.LandingPagePanelProvider;

$include("$(cssResources)/Social.css");

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Model\PhotoAlbum.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Controls\ImageControl.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\Core\Html.js" />

People.RecentActivity.UI.Photos.PhotoAlbumControl = function(album) {
    /// <summary>
    ///     Provides a way to render a single photo album in the Photos tab.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.PhotoAlbum">The album.</param>
    /// <field name="_album$1" type="People.RecentActivity.PhotoAlbum">The photo album.</field>
    /// <field name="_coverLow$1" type="People.RecentActivity.UI.Core.ImageControl">The cover image.</field>
    /// <field name="_coverHigh$1" type="People.RecentActivity.UI.Core.ImageControl">The high-quality cover image.</field>
    /// <field name="_name$1" type="People.RecentActivity.UI.Core.Control">The name control.</field>
    /// <field name="_count$1" type="People.RecentActivity.UI.Core.Control">The count control.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.photoAlbumItem));
    Debug.assert(album != null, 'album != null');
    this._album$1 = album;
    this._album$1.addListener("propertychanged", this._onAlbumPropertyChanged$1, this);
    this._album$1.photos.addListener("propertychanged", this._onPhotosPropertyChanged$1, this);
};

Jx.inherit(People.RecentActivity.UI.Photos.PhotoAlbumControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype._album$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype._coverLow$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype._coverHigh$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype._name$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype._count$1 = null;

People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype.invoke = function() {
    /// <summary>
    ///     Invokes the item.
    /// </summary>
    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject(this._album$1);
};

People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._album$1 != null) {
        this._album$1.removeListenerSafe("propertychanged", this._onAlbumPropertyChanged$1, this);
        if (this._album$1.photos != null) {
            this._album$1.photos.removeListenerSafe("propertychanged", this._onPhotosPropertyChanged$1, this);
        }
    }

    if (this._name$1 != null) {
        this._name$1.dispose();
        this._name$1 = null;
    }

    if (this._count$1 != null) {
        this._count$1.dispose();
        this._count$1 = null;
    }

    if (this._coverLow$1 != null) {
        this._coverLow$1.dispose();
        this._coverLow$1 = null;
    }

    if (this._coverHigh$1 != null) {
        this._coverHigh$1.dispose();
        this._coverHigh$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.uiRenderPhotoAlbumStart, this._album$1.objectInfo);
    var element = this.element;
    // get the name and count and create regular controls for them.
    this._name$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'album-name');
    this._name$1.id = this._name$1.uniqueId;
    this._name$1.text = this._album$1.name;
    this._name$1.title = this._album$1.name;
    this._count$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'album-count');
    this._updateCount$1();
    // get the cover image, and create a new delayed image for it
    // we use a delayed image so that MoCo renders quickly while we still pull down the image.
    var cover = this._album$1.cover;
    this._coverLow$1 = new People.RecentActivity.UI.Core.ImageControl(People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'album-cover-low'));
    this._coverLow$1.isBackground = true;
    this._coverLow$1.isDelayed = true;
    this._coverLow$1.isOneByOneError = true;
    this._coverHigh$1 = new People.RecentActivity.UI.Core.ImageControl(People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'album-cover-high'));
    this._coverHigh$1.isBackground = true;
    this._coverHigh$1.isDelayed = true;
    this._coverHigh$1.isOneByOneError = true;
    if (cover != null) {
        // "about:blank" is not a valid image, and will always fail, causing us to show the "failed image" UX.
        this._coverLow$1.source = cover.thumbnailSource;
        this._coverHigh$1.source = cover.source;
    }
    else {
        // there is no cover image, boo!
        this._coverLow$1.source = 'about:blank';
        this._coverHigh$1.source = 'about:blank';
    }

    // update the label of the item.
    this.labelledBy = this._name$1.id;
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.uiRenderPhotoAlbumStop, this._album$1.objectInfo);
};

People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype._updateCount$1 = function() {
    var count = this._album$1.photos.totalCount;
    this._count$1.label = People.RecentActivity.UI.Core.LocalizationHelper.getCountString(null/* no label for zero photos (this should never happen.)*/, '/strings/ra-label-photoAlbumCountOne', '/strings/ra-label-photoAlbumCountMany', count);
    this._count$1.text = count.toString();
};

People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype._onPhotosPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    switch (e.propertyName) {
        case 'Count':
        case 'TotalCount':
            // update the count on the label thingamajig.
            this._updateCount$1();
            break;
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumControl.prototype._onAlbumPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    switch (e.propertyName) {
        case 'Cover':
            var cover = this._album$1.cover;
            if (cover != null) {
                // update the cover image.
                this._coverLow$1.source = cover.thumbnailSource;
                this._coverHigh$1.source = cover.source;
            }
            else {
                // there is no cover image, boo!
                this._coverLow$1.source = 'about:blank';
                this._coverHigh$1.source = 'about:blank';
            }

            break;
        case 'Name':
            // update the name of the album.
            this._name$1.text = this._album$1.name;
            break;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\BICI\BiciPageNames.js" />
/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Model\Events\ActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\..\Model\Network.js" />
/// <reference path="..\..\Model\PhotoAlbum.js" />
/// <reference path="..\..\Model\PhotoAlbumCollection.js" />
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
/// <reference path="PhotoAlbumControl.js" />
/// <reference path="PhotoAlbumsLayoutHydrationData.js" />

People.RecentActivity.UI.Photos.PhotoAlbumsLayout = function(identity, element) {
    /// <summary>
    ///     Provides a layout for photo albums.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <field name="_hydrationVersion$1" type="Number" integer="true" static="true">The hydration data version.</field>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_albumControls$1" type="Object">The controls.</field>
    /// <field name="_albums$1" type="People.RecentActivity.PhotoAlbumCollection">The photo albums.</field>
    /// <field name="_hydrationData$1" type="People.RecentActivity.UI.Photos.photoAlbumsLayoutHydrationData">The hydration data.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_initialized$1" type="Boolean">Whether the layout has been initialized.</field>
    /// <field name="_refreshing$1" type="Boolean">Whether we're refreshing.</field>
    /// <field name="_refresh$1" type="People.Command">The refresh command.</field>
    /// <field name="_contentGrid$1" type="People.RecentActivity.UI.Core.Control">The element the grid is wrapping.</field>
    /// <field name="_contentGridList$1" type="WinJS.UI.ListView">The list view.</field>
    /// <field name="_dataSource$1" type="WinJS.Binding.List">The list view data source.</field>
    /// <field name="_contentPsa$1" type="People.RecentActivity.UI.Core.Control">The "PSA" content.</field>
    /// <field name="_contentErrors$1" type="People.RecentActivity.UI.Core.Control">The errors content.</field>
    /// <field name="_psa$1" type="People.RecentActivity.UI.Core.PsaUpsellControl">The actual PSA control.</field>
    /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors.</field>
    /// <field name="_lastResult$1" type="People.RecentActivity.Core.ResultInfo">The last result.</field>
    /// <field name="_itemInvokedHandler$1" type="Function">The item invoked handler.</field>
    /// <field name="_loadingStateChangedHandler$1" type="Function">The loading state change handler.</field>
    this._lastResult$1 = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);
    People.RecentActivity.UI.Core.Control.call(this, element);
    Debug.assert(identity != null, 'identity != null');
    this._albumControls$1 = {};
    this._identity$1 = identity;
    this._itemInvokedHandler$1 = this._onItemInvoked$1.bind(this);
    this._loadingStateChangedHandler$1 = this._onLoadingStateChanged$1.bind(this);
};

Jx.inherit(People.RecentActivity.UI.Photos.PhotoAlbumsLayout, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Photos.PhotoAlbumsLayout._hydrationVersion$1 = 3;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._identity$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._albumControls$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._albums$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._hydrationData$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._network$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._initialized$1 = false;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._refreshing$1 = false;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._refresh$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._contentGrid$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._contentGridList$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._dataSource$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._contentPsa$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._contentErrors$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._psa$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._errors$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._itemInvokedHandler$1 = null;
People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._loadingStateChangedHandler$1 = null;

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype.initialize = function(state) {
    /// <summary>
    ///     Initializes the layout.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
    if (!this._initialized$1) {
        this._initialized$1 = true;
        this._hydrationData$1 = state;
        // initialize the photo albums of the aggregated network.
        this._network$1 = this._identity$1.networks.aggregatedNetwork;
        if (this._network$1 == null) {
            // in some cases there is no aggregated network (i.e. friend-of-friend), so just pick the first one.
            this._network$1 = this._identity$1.networks.item(0);
        }

        this._albums$1 = this._network$1.albums;
        // monitor changes on the capabilities
        var capabilities = this._identity$1.capabilities;
        capabilities.addListener("propertychanged", this._onCapabilitiesPropertyChanged$1, this);
        if (capabilities.canShowPhotos) {
            this._initializeInternal$1();
        }

        People.RecentActivity.Core.BiciHelper.setCurrentPageName(People.RecentActivity.Core.BiciPageNames.photosTab);
        People.RecentActivity.Core.BiciHelper.createPageViewDatapoint(this._network$1.id);
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype.getState = function() {
    /// <summary>
    ///     Gets the hydration state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this._contentGridList$1 != null) {
        return People.RecentActivity.UI.Photos.create_photoAlbumsLayoutHydrationData(3, this._contentGridList$1.indexOfFirstVisible, this._contentGridList$1.currentItem);
    }

    return null;
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype.refresh = function() {
    this._onRefreshClicked$1(null);
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype.onDisposed = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    this._network$1 = null;
    this._lastResult$1 = null;
    People.RecentActivity.UI.Core.KeyboardRefresher.removeControl(this);
    if (this._albumControls$1 != null) {
        // dispose each entry.
        for (var k in this._albumControls$1) {
            var entry = { key: k, value: this._albumControls$1[k] };
            entry.value.dispose();
        }

        People.Social.clearKeys(this._albumControls$1);
        this._albumControls$1 = null;
    }

    // nullify some fields, and so on.
    if (this._albums$1 != null) {
        this._albums$1.removeListenerSafe("collectionchanged", this._onCollectionChanged$1, this);
        this._albums$1.removeListenerSafe("initializecompleted", this._onInitializeCompleted$1, this);
        this._albums$1.removeListenerSafe("refreshcompleted", this._onRefreshCompleted$1, this);
        this._albums$1 = null;
    }

    if (this._identity$1 != null) {
        this._identity$1.capabilities.removeListenerSafe("propertychanged", this._onCapabilitiesPropertyChanged$1, this);
        this._identity$1 = null;
    }

    this._refresh$1 = null;
    if (this._contentGrid$1 != null) {
        this._contentGrid$1.dispose();
        this._contentGrid$1 = null;
    }

    if (this._contentErrors$1 != null) {
        this._contentErrors$1.dispose();
        this._contentErrors$1 = null;
    }

    if (this._errors$1 != null) {
        this._errors$1.dispose();
        this._errors$1 = null;
    }

    if (this._contentPsa$1 != null) {
        this._contentPsa$1.dispose();
        this._contentPsa$1 = null;
    }

    if (this._psa$1 != null) {
        this._psa$1.dispose();
        this._psa$1 = null;
    }

    if (this._layoutChangedHandler) {
        this._layout.removeLayoutChangedEventListener(this._updateLayout, this);
        this._layoutChangedHandler = null;
    }

    if (this._contentGridList$1 != null) {
        if (this._contentGridList$1.element != null) {
            this._contentGridList$1.removeEventListener('iteminvoked', this._itemInvokedHandler$1, false);
            this._contentGridList$1.removeEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
        }

        this._itemInvokedHandler$1 = null;
        this._loadingStateChangedHandler$1 = null;

        this._contentGridList$1 = null;
        this._dataSource$1 = null;
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype.onRendered = function() {
    /// <summary>
    ///     Renders the layout.
    /// </summary>
    // initialize the DOM for the layout.
    var element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.photoAlbumLayout);
    this.element.appendChild(element);
    // initialzioe the credentials control.
    this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._identity$1, People.RecentActivity.UI.Core.ErrorMessageContext.photos, People.RecentActivity.UI.Core.ErrorMessageOperation.read);
    this._errors$1.render();
    this._contentErrors$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'layout-errors');
    this._contentErrors$1.isVisible = false;
    this._contentErrors$1.appendControl(this._errors$1);
    // initialize the PSA control.
    this._psa$1 = new People.RecentActivity.UI.Core.PsaUpsellControl();
    this._psa$1.render();
    this._contentPsa$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'layout-psa');
    this._contentPsa$1.appendControl(this._psa$1);
    // initialize a new grid view we can use to render the albums
    this._renderListView$1();
    // initialize the refresh button.
    this._refresh$1 = new People.Command('ra-refresh-photos', '/strings/raRefresh', '/strings/raRefreshTooltip', '\ue117', true, false, null, this._onRefreshClicked$1.bind(this));
    var commands = Jx.root.getCommandBar();
    commands.addCommand(this._refresh$1);
    commands.refresh();
    this._setContentVisibility$1();
    // if the photo albums have been loaded, we can render stuff.
    this._renderInternal$1();
    People.RecentActivity.UI.Core.KeyboardRefresher.addControl(this);
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._updateLayout = function () {
    var listView = this._element.querySelector(".ra-photoLayoutGrid").winControl;
    listView.layout = (this._layout.getLayoutState() === People.Layout.layoutState.snapped) ? new WinJS.UI.ListLayout() : new WinJS.UI.GridLayout();
}

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._renderListView$1 = function () {
    var layout = this._layout = Jx.root.getLayout();
    this._layoutChangedHandler = this._updateLayout;
    layout.addLayoutChangedEventListener(this._updateLayout, this);

    this._dataSource$1 = new WinJS.Binding.List();
    this._contentGrid$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'layout-content');
    this._contentGrid$1.isVisible = false;
    this._contentGridList$1 = new WinJS.UI.ListView(this._contentGrid$1.element);
    this._contentGridList$1.addEventListener('iteminvoked', this._itemInvokedHandler$1, false);
    this._contentGridList$1.itemDataSource = this._dataSource$1.dataSource;
    this._contentGridList$1.itemTemplate = this._onRenderingItem$1.bind(this);
    this._contentGridList$1.layout = (layout.getLayoutState() === People.Layout.layoutState.snapped) ? new WinJS.UI.ListLayout() : new WinJS.UI.GridLayout();
    this._contentGridList$1.loadingBehavior = 'randomaccess';
    this._contentGridList$1.selectionMode = 'none';
    if (this._albums$1.count > 0) {
        this._addAlbums$1(this._albums$1.toArray(), 0);
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._renderInternal$1 = function() {
    if (this.isRendered && this._albums$1.initialized) {
        this._setContentVisibility$1();
        this._setRefreshButtonVisibility$1();
        this._addAlbums$1(this._albums$1.toArray(), 0);
        if ((this._hydrationData$1 != null) && (this._hydrationData$1.v === 3)) {
            try {
                // apply the scroll position.
                this._contentGridList$1.indexOfFirstVisible = this._hydrationData$1.i;
                this._contentGridList$1.currentItem = this._hydrationData$1.ci;
            }
            catch (ex) {
                // ignore exceptions when setting state, as it may be outdated (but there isn't a good way for us to check.)
                Jx.log.write(3, 'Failed to set state on grid: ' + ex.toString());
            }        
        }

        this._hydrationData$1 = null;
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._initializeInternal$1 = function() {
    if (this._albums$1.initialized) {
        if (this._hydrationData$1 == null) {
            // the albums have already been initialized, so just do a quick refresh.
            this._onRefreshClicked$1(null);
        }

    }
    else {
        People.RecentActivity.UI.Core.GlobalProgressControl.add(this);
        this._albums$1.addListener("initializecompleted", this._onInitializeCompleted$1, this);
        People.RecentActivity.Core.EtwHelper.writeFeedEvent((this._hydrationData$1 != null) ? People.RecentActivity.Core.EtwEventName.uiGetCachedPhotoAlbumsStart : People.RecentActivity.Core.EtwEventName.uiGetPhotoAlbumsStart, this._network$1.id, this._identity$1.id);
        if (this._hydrationData$1 != null) {
            this._albums$1.initializeFromHydration();
        }
        else {
            this._albums$1.initialize();
        }    
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._addAlbums$1 = function(albums, index) {
    /// <param name="albums" type="Array" elementType="PhotoAlbum"></param>
    /// <param name="index" type="Number" integer="true"></param>
    Debug.assert(albums != null, 'albums != null');
    this._setContentVisibility$1();
    this._contentGridList$1.addEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
    // make sure the list view knows we're editing it.
    var dataSource = this._contentGridList$1.itemDataSource;
    dataSource.beginEdits();
    for (var n = 0; n < albums.length; n++) {
        var album = albums[n];
        this._addAlbum$1(album, index++);
    }

    dataSource.endEdits();
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._addAlbum$1 = function(album, index) {
    /// <param name="album" type="People.RecentActivity.PhotoAlbum"></param>
    /// <param name="index" type="Number" integer="true"></param>
    Debug.assert(album != null, 'album != null');
    // add the single album to the data source.
    // make sure it doesn't already exist, of course.
    if (this._dataSource$1.indexOf(album) === -1) {
        this._dataSource$1.splice(index, 0, album);
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._removeAlbums$1 = function(albums) {
    /// <param name="albums" type="Array" elementType="PhotoAlbum"></param>
    Debug.assert(albums != null, 'albums != null');
    this._contentGridList$1.addEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
    // make sure the list view knows we're editing it.
    var dataSource = this._contentGridList$1.itemDataSource;
    dataSource.beginEdits();
    for (var n = 0; n < albums.length; n++) {
        var album = albums[n];
        this._removeAlbum$1(album);
    }

    dataSource.endEdits();
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._removeAlbum$1 = function(album) {
    /// <param name="album" type="People.RecentActivity.PhotoAlbum"></param>
    Debug.assert(album != null, 'album != null');
    // simply remove the album from the data source.
    var index = this._dataSource$1.indexOf(album);
    if (index !== -1) {
        this._dataSource$1.splice(index, 1);
        var key = this._getAlbumKey$1(album);
        if (!Jx.isUndefined(this._albumControls$1[key])) {
            // dispose the control and remove it.
            this._albumControls$1[key].dispose();
            delete this._albumControls$1[key];
        }    
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._getAlbumKey$1 = function(album) {
    /// <param name="album" type="People.RecentActivity.PhotoAlbum"></param>
    /// <returns type="String"></returns>
    Debug.assert(album != null, 'album != null');
    return album.sourceId + ';' + album.id;
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._setContentVisibility$1 = function() {
    if (this.isRendered) {
        this._contentErrors$1.isVisible = false;
        this._contentGrid$1.isVisible = false;
        this._contentPsa$1.isVisible = false;
        var initialized = this._albums$1.initialized;
        if (initialized && !this._identity$1.capabilities.canShowPhotos) {
            // we can't show any photos because we're not hooked up.
            this._contentPsa$1.isVisible = true;
        }
        else {
            if (initialized && (!this._albums$1.count)) {
                // there are albums we need to show, so show errors in the bar.
                this._contentErrors$1.isVisible = true;
                this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;
                if (this._lastResult$1.code === People.RecentActivity.Core.ResultCode.success) {
                    // no error so this means that there are really no albums.
                    this._errors$1.showType(People.RecentActivity.UI.Core.ErrorMessageType.empty);
                }
                else {
                    this._errors$1.show(this._lastResult$1);
                }

            }
            else {
                // there are no albums, so we can show errors inline.
                this._contentGrid$1.isVisible = true;
                this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.messageBar;
                this._errors$1.show(this._lastResult$1);
            }        
        }    
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._setRefreshButtonVisibility$1 = function() {
    if (this.isRendered) {
        // show the refresh button.
        var commands = Jx.root.getCommandBar();
        // there's a few conditions we have to meet before showing the refresh button...
        if (this._albums$1.initialized && this._identity$1.capabilities.canShowPhotos) {
            commands.showCommand(this._refresh$1.commandId);
        }
        else {
            commands.hideCommand(this._refresh$1.commandId);
        }    
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._onLoadingStateChanged$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    var details = (ev.detail);
    if (this._contentGridList$1.loadingState === 'complete') {
        if ((details == null) || !details.scrolling) {
            // the listview was updated not because we were scrolling, so set focus on the first item.
            if (this._dataSource$1.length > 0) {
                var key = this._getAlbumKey$1(this._dataSource$1.getAt(0));
                if (!Jx.isUndefined(this._albumControls$1[key])) {
                    // set "focus" on the first item.
                    this._albumControls$1[key].setActive();
                }            
            }        
        }

        this._contentGridList$1.removeEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._onItemInvoked$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    var album = People.RecentActivity.UI.Core.MoCoHelper.getItemFromEvent(this._dataSource$1, ev.detail);
    // fetch the album control and invoke it.
    var key = this._getAlbumKey$1(album);
    if (!Jx.isUndefined(this._albumControls$1[key])) {
        this._albumControls$1[key].invoke();
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._onRenderingItem$1 = function(promise) {
    /// <param name="promise" type="WinJS.UI.ListViewRenderPromise"></param>
    /// <returns type="Object"></returns>
    var that = this;
    
    Debug.assert(promise != null, 'promise != null');
    return promise.then(function(data) {
        if (that.isDisposed) {
            // we've already been disposed, whoops.
            return null;
        }

        var album = that._dataSource$1.getAt(data.index);
        var key = that._getAlbumKey$1(album);
        if (!Jx.isUndefined(that._albumControls$1[key])) {
            // we can't re-use the existing element because MoCo will clear it out.
            that._albumControls$1[key].dispose();
            that._albumControls$1[key] = null;
        }

        var control = new People.RecentActivity.UI.Photos.PhotoAlbumControl(album);
        control.render();
        that._albumControls$1[key] = control;
        return control.element;
    });
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._onRefreshClicked$1 = function(context) {
    /// <param name="context" type="Object"></param>
    if (this.isRendered && this._initialized$1 && !this._refreshing$1) {
        People.RecentActivity.UI.Core.GlobalProgressControl.add(this);
        People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.uiRefreshPhotoAlbumsStart, this._network$1.id, this._identity$1.id);
        this._refreshing$1 = true;
        this._albums$1.addListener("refreshcompleted", this._onRefreshCompleted$1, this);
        this._albums$1.refresh();
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._onCollectionChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (this.isRendered) {
        // check whether we've actually rendered anything yet.
        switch (e.action) {
            case People.RecentActivity.NotifyCollectionChangedAction.add:
                this._addAlbums$1(e.newItems, e.newItemIndex);
                break;
            case People.RecentActivity.NotifyCollectionChangedAction.remove:
                this._removeAlbums$1(e.oldItems);
                break;
        }    
    }
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._onInitializeCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
    var isHydration = this._hydrationData$1 != null;
    this._lastResult$1 = e.result;
    this._albums$1.addListener("collectionchanged", this._onCollectionChanged$1, this);
    this._renderInternal$1();
    this._setContentVisibility$1();
    this._setRefreshButtonVisibility$1();
    People.RecentActivity.Core.EtwHelper.writeFeedEvent((isHydration) ? People.RecentActivity.Core.EtwEventName.uiGetCachedPhotoAlbumsStart : People.RecentActivity.Core.EtwEventName.uiGetPhotoAlbumsStart, this._network$1.id, this._identity$1.id);
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._onRefreshCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
    this._albums$1.removeListenerSafe("refreshcompleted", this._onRefreshCompleted$1, this);
    this._refreshing$1 = false;
    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.uiRefreshPhotoAlbumsStop, this._network$1.id, this._identity$1.id);
};

People.RecentActivity.UI.Photos.PhotoAlbumsLayout.prototype._onCapabilitiesPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    var capabilities = e.sender;
    if (e.propertyName === 'CanShowPhotos') {
        if (capabilities.canShowPhotos) {
            this._initializeInternal$1();
        }

        this._setContentVisibility$1();
        this._setRefreshButtonVisibility$1();
    }
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Photos.create_photoAlbumsLayoutHydrationData = function(version, indexOfFirstVisible, currentItem) {
    var o = { };
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
/// <reference path="..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\..\Model\PhotoAlbum.js" />
/// <reference path="..\..\Model\PhotoAlbumCollection.js" />
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
/// <reference path="PhotoAlbumControl.js" />

(function () {

    var albumColumns = 3;
    var albumRows = 3;
    var albumOutline = 20;
	var albumsOutlineOffset = -20;

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel = function (identity, hydrationData) {
        /// <summary>
        ///     Provides a panel for showing photo albums.
        /// </summary>
        /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
        /// <param name="hydrationData" type="Object">The hydration data.</param>
        /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
        /// <field name="_element$1" type="HTMLElement">The element.</field>
        /// <field name="_title$1" type="People.RecentActivity.UI.Core.Control">The title.</field>
        /// <field name="_titleName$1" type="People.RecentActivity.UI.Core.Control">The title element.</field>
        /// <field name="_titleMore$1" type="People.RecentActivity.UI.Core.Control">The title chevron element.</field>
        /// <field name="_content$1" type="People.RecentActivity.UI.Core.Control">The content element.</field>
        /// <field name="_contentViewport$1" type="People.RecentActivity.UI.Core.Control">The content viewport.</field>
        /// <field name="_contentErrors$1" type="People.RecentActivity.UI.Core.Control">The errors content element.</field>
        /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors control.</field>
        /// <field name="_isDisposed$1" type="Boolean">Occurs when the instance has been disposed.</field>
        /// <field name="_isReady$1" type="Boolean">Whether the panel is ready.</field>
        /// <field name="_isInitialized$1" type="Boolean">Whether the panel has been initialized.</field>
        /// <field name="_collection$1" type="People.RecentActivity.PhotoAlbumCollection">The photo albums.</field>
        /// <field name="_grid$1" type="WinJS.UI.ListView">The grid.</field>
        /// <field name="_gridDataSource$1" type="WinJS.Binding.List">The data source.</field>
        /// <field name="_maximumCount$1" type="Number" integer="true">The maximum count.</field>
        /// <field name="_controls$1" type="Object">The album controls.</field>
        /// <field name="_hydrationData$1" type="Object">The hydration data.</field>
        /// <field name="_lastResult$1" type="People.RecentActivity.Core.ResultInfo">The last result.</field>
        /// <field name="_albumHeight$1" type="Number" integer="true">The real album height.</field>
        /// <field name="_albumWidth$1" type="Number" integer="true">The real album width.</field>
        /// <field name="_itemInvokedHandler$1" type="Function">The item invoked handler.</field>
        People.RecentActivity.Imports.Panel.call(this, null, 'ra-photosPanelOuter panelView-snapActivePanel', People.PanelView.PanelPosition.photosPanel);

        Debug.assert(identity != null, 'identity != null');

        this._lastResult$1 = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);

        this._albumHeight$1 = -1;
        this._albumWidth$1 = -1;

        this._controls$1 = {};
        this._hydrationData$1 = hydrationData;
        this._identity$1 = identity;
        this._itemInvokedHandler$1 = this._onItemInvoked$1.bind(this);
    };

    Jx.inherit(People.RecentActivity.UI.Photos.PhotoAlbumsPanel, People.RecentActivity.Imports.Panel);

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._identity$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._element$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._title$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._titleName$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._titleMore$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._content$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._contentViewport$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._contentErrors$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._errors$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._isDisposed$1 = false;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._isReady$1 = false;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._isInitialized$1 = false;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._collection$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._grid$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._gridDataSource$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._maximumCount$1 = 0;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._controls$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._hydrationData$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._itemInvokedHandler$1 = null;
    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._isCollectionChangeAttached = false;

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype.activateUI = function (element) {
        /// <summary>
        ///     Activates the UI.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element.</param>
        Debug.assert(element != null, 'element != null');
        People.RecentActivity.UI.Core.SnapManager.addControl(this);
        People.RecentActivity.UI.Core.EventManager.events.addListener("windowresized", this._onWindowResized$1, this);

        this._element$1 = element;

        // fetch the title elements.
        this._title$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-title');
        this._title$1.attach('keypress', this._onTitleKeyPress$1.bind(this));
        this._title$1.attach('click', this._onTitleClicked$1.bind(this));

        this._titleName$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1, 'panel-title-name');
        this._titleName$1.id = this._titleName$1.uniqueId;
        this._titleName$1.text = Jx.res.getString('/strings/raPhotosPanelTitle');
        this._titleMore$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1, 'panel-title-more');
        this._titleMore$1.id = this._titleMore$1.uniqueId;
        this._titleMore$1.text = (People.RecentActivity.UI.Core.HtmlHelper.isRightToLeft) ? '\ue096' : '\ue097';

        People.Animation.addPressStyling(this._title$1.element);

        // fetch the basic elements that we need
        // for most people there will be the maximum number of columns of albums, so assume that width for now.
        this._content$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1, 'panel-content');
        this._content$1.labelledBy = this._titleName$1.id + ' ' + this._titleMore$1.id;

        this._measureAlbumSize$1();
        if (People.RecentActivity.UI.Core.SnapManager.currentLayout === 'snapped') {
            this._content$1.element.style.height = '';
            this._content$1.element.style.width = '';
        } else {
            this._content$1.element.style.height = + '';
            this._content$1.element.style.width = (this._albumWidth$1 * albumColumns) + 'px';
        }

        this._contentViewport$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1, 'panel-viewport');
        this._contentViewport$1.render();

        // initialize the error content, but hide it by default.
        this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._identity$1, People.RecentActivity.UI.Core.ErrorMessageContext.photos, People.RecentActivity.UI.Core.ErrorMessageOperation.read);
        this._errors$1.render();
        this._contentErrors$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1, 'panel-errors');
        this._contentErrors$1.render();
        this._contentErrors$1.appendControl(this._errors$1);
        this._contentErrors$1.isVisible = false;

        // initialize the photo albums and make the request.
        var collection = this._identity$1.networks;

        var network = collection.aggregatedNetwork;
        if (network == null) {
            // there is no aggregated network.
            network = collection.item(0);
        }

        this._collection$1 = network.albums;

        var that = this;

        window.msSetImmediate(function () {
            if (that._isDisposed$1) {
                // we've been disposed in the mean-time.
                return;
            }

            if (that._collection$1.initialized) {
                if (that._hydrationData$1 == null) {
                    // we've already been initialized, which means this is probably the "Me" person.
                    that._collection$1.addListener("refreshcompleted", that._onRefreshCompleted$1, that);
                    that._collection$1.refresh();
                }
                else {
                    that._lastResult$1 = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);
                    that._isInitialized$1 = true;
                    that._onReady$1();
                }
            }
            else {
                that._collection$1.addListener("initializecompleted", that._onInitializeCompleted$1, that);

                if (that._hydrationData$1 != null) {
                    that._collection$1.initializeFromHydration();
                }
                else {
                    that._collection$1.initialize();
                }
            }
        });
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype.getUI = function () {
        /// <summary>
        ///     Gets the UI markup.
        /// </summary>
        /// <returns type="String"></returns>
        return People.RecentActivity.UI.Core.Html.photoAlbumPanel;
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype.deactivateUI = function () {
        /// <summary>
        ///     Deactivates the panel.
        /// </summary>
        this._isDisposed$1 = true;
        this._identity$1 = null;
        this._element$1 = null;
        this._lastResult$1 = null;

        People.RecentActivity.UI.Core.SnapManager.removeControl(this);
        People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowresized", this._onWindowResized$1, this);

        if (this._collection$1 != null) {
            this._collection$1.removeListenerSafe("collectionchanged", this._onCollectionChanged$1, this);
            this._collection$1.removeListenerSafe("initializecompleted", this._onInitializeCompleted$1, this);
            this._collection$1.removeListenerSafe("refreshcompleted", this._onRefreshCompleted$1, this);
            this._collection$1 = null;
        }

        if (this._controls$1 != null) {
            for (var k in this._controls$1) {
                // dispose each control.
                this._controls$1[k].dispose();
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

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype.ready = function () {
        /// <summary>
        ///     Indicates the UX is ready for heavy operations.
        /// </summary>
        this._isReady$1 = true;
        this._onReady$1();
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype.suspend = function () {
        /// <summary>
        ///     Suspends the panel.
        /// </summary>
        /// <returns type="Object"></returns>
        // we don't need anything except for a token to indicate we need to come back from
        // hydration the next time we load.
        return {};
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype.onLayoutChanged = function (layout) {
        /// <summary>
        ///     Called when application layout is changed.
        /// </summary>
        /// <param name="layout" type="People.RecentActivity.Imports.LayoutState">The layout.</param>
        Jx.log.write(4, 'PhotoAlbumsPanel.OnLayoutchanged: ' + layout);

        // reset the album width and height before calling onReady because the CSS for the album
        // changes when the layout of the app changes, and thus the properties need to be recalculated
        this._albumHeight$1 = -1;
        this._albumWidth$1 = -1;

        this._onReady$1();

        var listView = this._element$1.querySelector(".ra-photoLayoutGrid").winControl;
        if (listView) {
            listView.layout = (layout === People.Layout.layoutState.snapped) ? new WinJS.UI.ListLayout() : new WinJS.UI.GridLayout();
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._measureAlbumSize$1 = function () {
        if ((this._albumWidth$1 === -1) || (this._albumHeight$1 === -1)) {
            // measure the size of a single (dummy) photo album, and then update the width, etc.
            var dummy = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.photoAlbumItem);

            this._content$1.appendChild(dummy);
            this._content$1.element.style.display = 'block';

            this._albumHeight$1 = WinJS.Utilities.getTotalHeight(dummy) + albumOutline;
            this._albumWidth$1 = WinJS.Utilities.getTotalWidth(dummy) + albumOutline;

            this._content$1.element.style.display = '';
            this._content$1.removeChild(dummy);

            this._updateMaxAlbumCount$1();
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._getAlbumKey$1 = function (album) {
        /// <param name="album" type="People.RecentActivity.PhotoAlbum"></param>
        /// <returns type="String"></returns>
        Debug.assert(album != null, 'album != null');

        return album.sourceId + ';' + album.albumId;
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._addAlbums$1 = function (albums, index) {
        /// <param name="albums" type="Array" elementType="PhotoAlbum"></param>
        /// <param name="index" type="Number" integer="true"></param>
        Debug.assert(albums != null, 'albums != null');
        Debug.assert(index >= 0, 'index >= 0');

        this._updateErrorState$1();
        this._updateSize$1();

        // do a quick check to make sure the list is not empty. we should not call Begin/EndEdits()
        // for the first time on an empty list -- this will cause weird behavior later.
        // also check to see if we're adding albums to the end of the list, where we can't even show them.
        if ((index > this._maximumCount$1) || (!albums.length)) {
            return;
        }

        this._hideProgress$1();

        // okay, first tell the list view we're going to update it.
        var dataSource = this._grid$1.itemDataSource;
            dataSource.beginEdits();

        this._addAlbumsToList$1(albums, index);

        // once we're done, tell it to update.
        dataSource.endEdits();
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._addAlbumsToList$1 = function (albums, index) {
        /// <param name="albums" type="Array" elementType="PhotoAlbum"></param>
        /// <param name="index" type="Number" integer="true"></param>
        Debug.assert(albums != null, 'albums != null');

        if (this._gridDataSource$1.length >= this._maximumCount$1) {
            return;
        }

        for (var n = 0; n < albums.length; n++) {
            var album = albums[n];
            var ix = this._gridDataSource$1.indexOf(album);
            if (ix !== index) {
                if (ix !== -1) {
                    // remove this album from its current position first.
                    this._gridDataSource$1.splice(ix, 1);
                }

                this._gridDataSource$1.splice(index, 0, album);
                if (this._gridDataSource$1.length >= this._maximumCount$1) {
                    // we can stop now, there's no need to add more albums than necessary.
                    break;
                }
            }

            index++;
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._addMoreAlbumsToList$1 = function () {
        var count = this._gridDataSource$1.length;

        for (var i = count; i < this._maximumCount$1 && i < this._collection$1.count; i++) {
            this._gridDataSource$1.splice(i, 0, this._collection$1.item(i));
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._removeExtraAlbumsFromList$1 = function () {
        var count = this._gridDataSource$1.length;

        for (var i = this._maximumCount$1; i < count; i++) {
            this._gridDataSource$1.splice(this._maximumCount$1, 1);
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._removeAlbums$1 = function (albums, index) {
        /// <param name="albums" type="Array" elementType="PhotoAlbum"></param>
        /// <param name="index" type="Number" integer="true"></param>
        Debug.assert(albums != null, 'albums != null');
        Debug.assert(index >= 0, 'index >= 0');

        if ((index > this._maximumCount$1) || (!albums.length)) {
            // this does not affect us.
            return;
        }

        // okay, first tell the list to begin edits (for perf and such.)
        var dataSource = this._grid$1.itemDataSource;
            dataSource.beginEdits();

        // remove all the albums
        var count = 0;

        for (var n = 0; n < albums.length; n++) {
            var album = albums[n];
            var i = this._gridDataSource$1.indexOf(album);
            this._gridDataSource$1.splice(i, 1);
            count++;
        }

        // now check to see if we need to re-fill the list of more albums.
        var length = this._gridDataSource$1.length;
        if (length < this._maximumCount$1) {
            this._addAlbumsToList$1(this._collection$1.toArray(), index + count);
        }

        // finish up the edits.
        dataSource.endEdits();

        this._updateErrorState$1();
        this._updateSize$1();
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._updateErrorState$1 = function () {
        this._contentErrors$1.isVisible = false;

        if (this._collection$1.count > 0) {
            // errors need to be displayed in the message bar.
            this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.messageBar;
            this._errors$1.show(this._lastResult$1);
        }
        else {
            if (this._isInitialized$1) {
                this._contentErrors$1.isVisible = true;
                // errors need to be displayed inline as there is no other content.
                this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;
                if (this._lastResult$1.code === People.RecentActivity.Core.ResultCode.success) {
                    // there is no real error, but there are also no photo albums, which means that we need to show an "empty" list.
                    this._errors$1.showType(People.RecentActivity.UI.Core.ErrorMessageType.empty);
                }
                else {
                    this._errors$1.show(this._lastResult$1);
                }

                // the width of the container should be at least two columns when showing an error.
                this._content$1.element.style.height = '';
                this._updateWidth$1(2);
            }
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._updateHeight$1 = function() {
        // ensure the album size is known.
        this._measureAlbumSize$1();

        var albums = Math.min(this._maximumCount$1, this._collection$1.count);
        this._content$1.element.style.height = (this._albumHeight$1 * albums) + 'px';
    }

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._updateWidth$1 = function (minimumColumns) {
        /// <param name="minimumColumns" type="Number" integer="true"></param>
        if (Jx.isUndefined(minimumColumns)) {
            minimumColumns = 1;
        }

        // ensure the album size is known.
        this._measureAlbumSize$1();

        var element = this._content$1.element;

        var albumsPerColumn = Math.floor(element.clientHeight / this._albumHeight$1);
        var albums = Math.min(this._maximumCount$1, Math.max(minimumColumns * albumsPerColumn, this._collection$1.count));
        var albumColumns = Math.ceil(albums / albumsPerColumn);

        this._content$1.element.style.width = (this._albumWidth$1 * albumColumns + albumsOutlineOffset) + 'px';
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._updateSize$1 = function () {
        if (People.RecentActivity.UI.Core.SnapManager.currentLayout === 'snapped') {
            this._content$1.element.style.width = '';
            this._updateHeight$1();
        } else {
            this._content$1.element.style.height = '';
            this._updateWidth$1();
        }
    }

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onReady$1 = function () {
        if (this._isReady$1) {
            if (this._isInitialized$1) {
                // hide the progress once we're initialized and we're ready to show stuff.
                this._hideProgress$1();
            }

            if ((this._grid$1 == null) || (this._gridDataSource$1 == null)) {
                this._contentViewport$1.attach('keyboardnavigating', this._onKeyboardNavigating$1.bind(this));

                // initialize the grid view.
                this._gridDataSource$1 = new WinJS.Binding.List();
                this._grid$1 = new WinJS.UI.ListView(this._contentViewport$1.element);
                this._grid$1.addEventListener('iteminvoked', this._itemInvokedHandler$1, false);
                this._grid$1.itemDataSource = this._gridDataSource$1.dataSource;
                this._grid$1.itemTemplate = this._onRenderingItem$1.bind(this);
                this._grid$1.layout = (Jx.root.getLayout().getLayoutState() === People.Layout.layoutState.snapped) ? new WinJS.UI.ListLayout() : new WinJS.UI.GridLayout();
                this._grid$1.loadingBehavior = 'randomaccess';
                this._grid$1.selectionMode = 'none';
                this._grid$1.swipeBehavior = ' none';
            }

            if (!this._isCollectionChangeAttached) {
                // once we're ready, we can monitor collection changes.
                this._collection$1.addListener("collectionchanged", this._onCollectionChanged$1, this);
                this._isCollectionChangeAttached = true;
            }

            var that = this;

            // off-load this to a different time-slice.
            window.msSetImmediate(function () {
                if (!that._isDisposed$1) {
                    if (that._collection$1.count > 0) {
                        that._addAlbums$1(that._collection$1.toArray(), 0);
                    }
                    else {
                        that._updateErrorState$1();
                    }
                }
            });
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._hideProgress$1 = function () {
        var element = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._element$1, 'panel-progress');
        if (element != null) {
            // remove the element from the DOM completely... which is the best way to make sure its "hidden".
            element.parentNode.removeChild(element);
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._navigateToFull$1 = function () {
        var dataContext = this._identity$1.getDataContext();

        // get the object type and object ID.
        var objectType = dataContext.objectType;
        var objectId = dataContext.objectId;

        switch (objectType) {
            case 'literal':
                People.Nav.navigate(People.Nav.getViewPhotoUri(null, dataContext));
                break;
            default:
                // navigate directly from RA to RA.
                People.Nav.navigate(People.Nav.getViewPhotoUri(objectId, null));
                break;
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._updateMaxAlbumCount$1 = function () {
        if (People.RecentActivity.UI.Core.SnapManager.currentLayout === 'snapped') {
            this._maximumCount$1 = albumRows;
        } else {
            var maxRows = Math.floor(this._content$1.element.clientHeight / this._albumHeight$1);
            var maxColumns = (maxRows <= albumColumns) ? albumColumns : albumColumns - 1;

            this._maximumCount$1 = maxColumns * maxRows;
        }

    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onItemInvoked$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        var album = People.RecentActivity.UI.Core.MoCoHelper.getItemFromEvent(this._gridDataSource$1, ev.detail);

        // fetch the album control and invoke it.
        var key = this._getAlbumKey$1(album);

        if (!Jx.isUndefined(this._controls$1[key])) {
            this._controls$1[key].invoke();
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onRenderingItem$1 = function (promise) {
        /// <param name="promise" type="WinJS.UI.ListViewRenderPromise"></param>
        /// <returns type="Object"></returns>
        Debug.assert(promise != null, 'promise != null');

        var that = this;

        return promise.then(function (data) {
            if (that._isDisposed$1) {
                // we've been disposed while the listview was still doing its thing.
                return null;
            }

            var album = that._gridDataSource$1.getAt(data.index);
            var key = that._getAlbumKey$1(album);

            if (!Jx.isUndefined(that._controls$1[key])) {
                // we've already rendered this item once, so there is no need to do it again.
                that._controls$1[key].dispose();
                that._controls$1[key] = null;
            }

            // initialize a new control for future reference.
            var control = new People.RecentActivity.UI.Photos.PhotoAlbumControl(album);
                control.render();

            that._controls$1[key] = control;

            return control.element;
        });
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onCollectionChanged$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        switch (e.action) {
            case People.RecentActivity.NotifyCollectionChangedAction.add:
                this._addAlbums$1(e.newItems, e.newItemIndex);
                break;
            case People.RecentActivity.NotifyCollectionChangedAction.remove:
                this._removeAlbums$1(e.oldItems, e.oldItemIndex);
                break;
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onInitializeCompleted$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        // save state and then update the UX, if needed.
        this._lastResult$1 = e.result;
        this._isInitialized$1 = true;
        this._onReady$1();
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onRefreshCompleted$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        // save state and then update the UX, if needed.
        this._isInitialized$1 = true;
        this._lastResult$1 = e.result;
        this._onReady$1();
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onTitleKeyPress$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        if (ev.keyCode === WinJS.Utilities.Key.enter || ev.keyCode === WinJS.Utilities.Key.space) {
            this._navigateToFull$1();
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onTitleClicked$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        this._navigateToFull$1();
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onKeyboardNavigating$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        var item = ev.detail;

        // make sure the element is visible.
        var key = this._getAlbumKey$1(this._gridDataSource$1.getAt(item.newFocus));

        if (!Jx.isUndefined(this._controls$1[key])) {
            // simply scroll the item into view.
            People.RecentActivity.UI.Core.ScrollHelper.scrollIntoView(this._controls$1[key].element);
        }
    };

    People.RecentActivity.UI.Photos.PhotoAlbumsPanel.prototype._onWindowResized$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        this._updateMaxAlbumCount$1();
        this._updateSize$1();

        if (this._gridDataSource$1 == null) {
            // if we haven't initialized grid yet, return.
            return;
        }

        var count = this._gridDataSource$1.length;
        if (count === this._maximumCount$1) {
            return;
        }

        // okay, first tell the list view we're going to update it.
        var dataSource = this._grid$1.itemDataSource;
            dataSource.beginEdits();

        if (this._gridDataSource$1.length < this._maximumCount$1) {
            this._addMoreAlbumsToList$1();
        }
        else {
            this._removeExtraAlbumsFromList$1();
        }

        // once we're done, tell it to update.
        dataSource.endEdits();
    };

})();

});