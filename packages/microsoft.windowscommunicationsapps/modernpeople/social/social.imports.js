
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People, "loadSocialImports", function () {

People.loadSocialImports = Jx.fnEmpty;

People.Social.loadUtilities();

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_contentAnimationData = function(elements, onEnterComplete) {
    var o = { };
    o.elements = elements;
    o.onEnterComplete = onEnterComplete;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.ExecutablePromise = function(action) {
    /// <summary>
    ///     Provides a simple wrapper around a promise to add an Execute() method.
    /// </summary>
    /// <param name="action" type="Function">The action.</param>
    /// <field name="_action" type="Function">The action to be wrapped in Promise.wrap().</field>
    Debug.assert(action != null, 'action != null');
    this._action = action;
};

People.RecentActivity.Imports.ExecutablePromise.prototype._action = null;

People.RecentActivity.Imports.ExecutablePromise.prototype.execute = function() {
    /// <summary>
    ///     Executes the action, returning a promise that can be chained on.
    /// </summary>
    /// <returns type="WinJS.Promise"></returns>
    return WinJS.Promise.wrap(this._action);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     The enum for application layout state.
/// </summary>
People.RecentActivity.Imports.LayoutState = {
    /// <field name="none" type="Number" integer="true" static="true">Unknown state.</field>
    none: 'none',
    /// <field name="snapped" type="Number" integer="true" static="true">The app is in snapped state.</field>
    snapped: 'snapped',
    /// <field name="mobody" type="Number" integer="true" static="true">The app is in mobody state..</field>
    mobody: 'mobody',
    /// <field name="portrait" type="Number" integer="true" static="true">The app is in portrait state.</field>
    portrait: 'portrait'
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_modernCanvasOptions = function () {
    return {};
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.Panel = function(id, className, position) {
    /// <summary>
    ///     Provides a base class for panels.
    /// </summary>
    /// <param name="id" type="String">The ID of the panel.</param>
    /// <param name="className" type="String">The class name.</param>
    /// <param name="position" type="People.PanelView.PanelPosition">The position.</param>
    /// <field name="id" type="String">Gets the ID.</field>
    /// <field name="className" type="String">Gets the class name.</field>
    /// <field name="position" type="People.PanelView.PanelPosition">Gets the position.</field>
    this.className = className;
    this.id = id;
    this.position = position;
};

People.RecentActivity.Imports.Panel.prototype.id = null;
People.RecentActivity.Imports.Panel.prototype.className = null;
People.RecentActivity.Imports.Panel.prototype.position = 0;
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_identityControlOptions = function (interactive, onClick, onContextMenu, getLabel) {
    var o = { };
    o.getLabel = getLabel;
    o.interactive = interactive;
    o.onClick = onClick;
    o.onContextMenu = onContextMenu;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_identityElementContextOptions = function(contextId, fallback) {
    var o = { };
    o.contextId = contextId;
    o.fallback = fallback;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_identityElementOptions = function(className) {
    var o = { };
    o.className = className;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_identityElementTileOptions = function(size, statusIndicator) {
    var o = { };
    o.size = size;
    o.statusIndicator = statusIndicator;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_listViewEndLayoutResult = function(animation) {
    var o = { };
    o.animationPromise = animation;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.ListViewLayout = function() {
    /// <summary>
    ///     Provides a base class for layouts.
    /// </summary>
    /// <field name="horizontal" type="Boolean">Gets a value indicating whether this layout is horizontal.</field>
};

People.RecentActivity.Imports.ListViewLayout.prototype.horizontal = true;
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_listViewPositionResult = function(left, top, contentHeight, contentWidth, totalHeight, totalWidth) {
    var o = { };
    o.left = left;
    o.top = top;
    o.contentHeight = contentHeight;
    o.contentWidth = contentWidth;
    o.totalHeight = totalHeight;
    o.totalWidth = totalWidth;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_listViewScrollRange = function(beginScrollPosition, endScrollPosition) {
    var o = { };
    o.beginScrollPosition = beginScrollPosition;
    o.endScrollPosition = endScrollPosition;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_listViewStartLayoutResult = function(beginIndex, endIndex) {
    var o = { };
    o.beginIndex = beginIndex;
    o.endIndex = endIndex;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_messageBarButton = function(text, tooltip, callback) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(text), 'text');
    o.text = text;
    o.tooltip = tooltip;
    o.callback = callback;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_messageBarMessage = function(text, cssClass) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(text), 'text');
    o.cssClass = cssClass;
    o.messageText = text;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.PhotoViewerDataModel = function() {
    /// <summary>
    ///     Provides the base class for the photo viewer data model.
    /// </summary>
    // augment this instance with a JS simpleton class for eventing.
    Jx.mix(this, wLive.Core.Events);
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.setRelationshipKey = function() {
    /// <summary>
    ///     Sets the relationship key (not required.)
    /// </summary>
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.getRelationshipKeyParts = function() {
    /// <summary>
    ///     Gets the relationship key parts (not required.)
    /// </summary>
    /// <returns type="String"></returns>
    return '';
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.getRelationshipsKey = function() {
    /// <summary>
    ///     Gets the relationship key (not required.)
    /// </summary>
    /// <returns type="String"></returns>
    return '';
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.hasPendingRequests = function() {
    /// <summary>
    ///     Gets a value indicating whether the model has pending requests (not required.)
    /// </summary>
    /// <returns type="Boolean"></returns>
    return false;
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.processResponse = function() {
    /// <summary>
    ///     Processes a response (not required.)
    /// </summary>
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.invalidateItem = function() {
    /// <summary>
    ///     Invalidates an item (not required.)
    /// </summary>
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.updateItem = function() {
    /// <summary>
    ///     Updates an item (not required.)
    /// </summary>
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.updateItemProperty = function() {
    /// <summary>
    ///     Updates an item property (not required.)
    /// </summary>
};

People.RecentActivity.Imports.PhotoViewerDataModel.prototype.getGroupInformation = function() {
    /// <summary>
    ///     Gets group information (not required.)
    /// </summary>
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_photoViewerFolder = function() {
    return {};
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_photoViewerImages = function(previousEnabled, previousDisabled, nextEnabled, nextDisabled) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(previousEnabled), 'previousEnabled');
    Debug.assert(Jx.isNonEmptyString(previousDisabled), 'previousDisabled');
    Debug.assert(Jx.isNonEmptyString(nextEnabled), 'nextEnabled');
    Debug.assert(Jx.isNonEmptyString(nextDisabled), 'nextDisabled');
    o.previousEnabled = previousEnabled;
    o.previousDisabled = previousDisabled;
    o.nextEnabled = nextEnabled;
    o.nextDisabled = nextDisabled;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.PhotoViewerItem = function(id, name, photoInfo, thumbnailInfo) {
    /// <summary>
    ///     Represents a single item in the photo viewer.
    /// </summary>
    /// <param name="id" type="String">The ID of the item.</param>
    /// <param name="name" type="String">The name of the item.</param>
    /// <param name="photoInfo" type="People.RecentActivity.Imports.photoViewerItemPhoto">The photo info.</param>
    /// <param name="thumbnailInfo" type="People.RecentActivity.Imports.photoViewerItemThumbnailSet">The thumbnail info.</param>
    /// <field name="id" type="String">The ID.</field>
    /// <field name="key" type="String">The key.</field>
    /// <field name="commands" type="String">The available commands.</field>
    /// <field name="name" type="String">The name.</field>
    /// <field name="parentId" type="String">The parent ID.</field>
    /// <field name="parentKey" type="String">The parent key.</field>
    /// <field name="photo" type="People.RecentActivity.Imports.photoViewerItemPhoto">The photo information.</field>
    /// <field name="thumbnailSet" type="People.RecentActivity.Imports.photoViewerItemThumbnailSet">The thumbnail set.</field>
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    Debug.assert(Jx.isNonEmptyString(name), 'name');
    Debug.assert(photoInfo != null, 'photoInfo');
    Debug.assert(thumbnailInfo != null, 'thumbnailInfo');
    this.id = id;
    this.key = id;
    this.name = name;
    this.parentKey = 'root';
    this.photo = photoInfo;
    this.thumbnailSet = thumbnailInfo;
    // set some things that we don't need but have to set to their default values.
    this.commands = '';
};

People.RecentActivity.Imports.PhotoViewerItem.prototype.id = null;
People.RecentActivity.Imports.PhotoViewerItem.prototype.key = null;
People.RecentActivity.Imports.PhotoViewerItem.prototype.commands = null;
People.RecentActivity.Imports.PhotoViewerItem.prototype.name = null;
People.RecentActivity.Imports.PhotoViewerItem.prototype.parentId = null;
People.RecentActivity.Imports.PhotoViewerItem.prototype.parentKey = null;
People.RecentActivity.Imports.PhotoViewerItem.prototype.photo = null;
People.RecentActivity.Imports.PhotoViewerItem.prototype.thumbnailSet = null;

People.RecentActivity.Imports.PhotoViewerItem.prototype.isWebPlayableVideo = function() {
    /// <summary>
    ///     Gets a value indicating whether this is a web-playable item.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return false;
};

People.RecentActivity.Imports.PhotoViewerItem.prototype.getVersion = function() {
    /// <summary>
    ///     Gets the version of the item.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    return 0;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_photoViewerItemPhoto = function(width, height) {
    var o = { };
    o.height = height;
    o.width = width;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_photoViewerItemThumbnail = function(name, width, height, url) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(name), 'name');
    Debug.assert(Jx.isNonEmptyString(url), 'url');
    o.name = name;
    o.height = height;
    o.width = width;
    o.url = url;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_photoViewerItemThumbnailSet = function(thumbnails) {
    var o = { };
    o.baseUrl = '';
    o.thumbnails = thumbnails;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_photoViewerOptions = function(images, strings, selectedIndexChanged) {
    var o = { };
    o.images = images;
    o.moSelf = true;
    o.strings = strings;
    o.onSelectedIndexChanged = selectedIndexChanged;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="PhotoViewerFolder.js" />
/// <reference path="PhotoViewerRootItemChildList.js" />

People.RecentActivity.Imports.PhotoViewerRootItem = function(items) {
    /// <summary>
    ///     Represents the root item in the photo viewer.
    /// </summary>
    /// <param name="items" type="Array"></param>
    /// <field name="folder" type="People.RecentActivity.Imports.photoViewerFolder">The folder information.</field>
    /// <field name="key" type="String">The key of the folder.</field>
    /// <field name="_items" type="People.RecentActivity.Imports.PhotoViewerRootItemChildList">The items.</field>
    Debug.assert(items != null, 'items');
    this._items = new People.RecentActivity.Imports.PhotoViewerRootItemChildList(items);
    this.folder = People.RecentActivity.Imports.create_photoViewerFolder();
    this.key = 'root';
};


People.RecentActivity.Imports.PhotoViewerRootItem.prototype.folder = null;
People.RecentActivity.Imports.PhotoViewerRootItem.prototype.key = null;
People.RecentActivity.Imports.PhotoViewerRootItem.prototype._items = null;

People.RecentActivity.Imports.PhotoViewerRootItem.prototype.getChildren = function() {
    /// <summary>
    ///     Gets the children.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.PhotoViewerRootItemChildList"></returns>
    return this._items;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.PhotoViewerRootItemChildList = function(items) {
    /// <summary>
    ///     Represents the root item's children in the photo viewer.
    /// </summary>
    /// <param name="items" type="Array"></param>
    /// <field name="_items" type="Array">The items.</field>
    Debug.assert(items != null, 'items');
    this._items = items;
};


People.RecentActivity.Imports.PhotoViewerRootItemChildList.prototype._items = null;

People.RecentActivity.Imports.PhotoViewerRootItemChildList.prototype.get = function(index) {
    /// <summary>
    ///     Gets an item at the given index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index.</param>
    /// <returns type="Object"></returns>
    return this._items[index];
};

People.RecentActivity.Imports.PhotoViewerRootItemChildList.prototype.getCount = function() {
    /// <summary>
    ///     Gets the number of children.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    return this._items.length;
};

People.RecentActivity.Imports.PhotoViewerRootItemChildList.prototype.indexOf = function(item) {
    /// <summary>
    ///     Gets the index of an item.
    /// </summary>
    /// <param name="item" type="Object">The item.</param>
    /// <returns type="Number" integer="true"></returns>
    return this._items.indexOf(item);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_photoViewerStrings = function(previous, next) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(previous), 'previous');
    Debug.assert(Jx.isNonEmptyString(next), 'next');
    o.Previous = previous;
    o.Next = next;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="PhotoViewerDataModel.js" />
/// <reference path="PhotoViewerViewParameters.js" />

People.RecentActivity.Imports.PhotoViewerViewContext = function(dataModel) {
    /// <summary>
    ///     Provides a base class for the photo viewer view context.
    /// </summary>
    /// <param name="dataModel" type="People.RecentActivity.Imports.PhotoViewerDataModel">The data model.</param>
    /// <field name="callerCid" type="String">The caller CID (mock, not used.)</field>
    /// <field name="dataModel" type="People.RecentActivity.Imports.PhotoViewerDataModel">The data model.</field>
    /// <field name="actionManager" type="wLive.Core.ActionManager">The action manager.</field>
    /// <field name="errorManager" type="wLive.Core.ErrorManager">The error manager.</field>
    /// <field name="selectionManager" type="wLive.Core.SelectionManager">The selection manager.</field>
    /// <field name="sortBy" type="String">The field to sort by (not used.)</field>
    /// <field name="sortField" type="String">The field to sort by (not used.)</field>
    /// <field name="sortReverse" type="Boolean">Whether to reverse sort.</field>
    /// <field name="viewParams" type="People.RecentActivity.Imports.photoViewerViewParameters">The view parameters.</field>
    Debug.assert(dataModel != null, 'dataModel');
    this.actionManager = new wLive.Core.ActionManager();
    this.callerCid = '';
    this.dataModel = dataModel;
    this.errorManager = new wLive.Core.ErrorManager();
    this.selectionManager = new wLive.Core.SelectionManager(dataModel);
    // initialize the first item in the view parameters.
    var item = this.dataModel.getChildByIndex(null, 0);
    this.viewParams = People.RecentActivity.Imports.create_photoViewerViewParameters(item.id);
};


People.RecentActivity.Imports.PhotoViewerViewContext.prototype.callerCid = null;
People.RecentActivity.Imports.PhotoViewerViewContext.prototype.dataModel = null;
People.RecentActivity.Imports.PhotoViewerViewContext.prototype.actionManager = null;
People.RecentActivity.Imports.PhotoViewerViewContext.prototype.errorManager = null;
People.RecentActivity.Imports.PhotoViewerViewContext.prototype.selectionManager = null;
People.RecentActivity.Imports.PhotoViewerViewContext.prototype.sortBy = null;
People.RecentActivity.Imports.PhotoViewerViewContext.prototype.sortField = null;
People.RecentActivity.Imports.PhotoViewerViewContext.prototype.sortReverse = false;
People.RecentActivity.Imports.PhotoViewerViewContext.prototype.viewParams = null;

People.RecentActivity.Imports.PhotoViewerViewContext.prototype.authenticateUser = function() {
    /// <summary>
    ///     Authenticates the user (not used.)
    /// </summary>
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Imports.create_photoViewerViewParameters = function(id) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    o.id = id;
    return o;
};
});