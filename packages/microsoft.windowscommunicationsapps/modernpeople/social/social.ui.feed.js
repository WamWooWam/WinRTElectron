
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People.RecentActivity.UI.Feed, ["FeedPanel", "FeedLayout"], function () {

People.loadSocialModel();
People.loadSocialUICore();

People.RecentActivity.UI.Host.LandingPagePanelProvider;

$include("$(cssResources)/Social.css");

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_stackingListViewAnimations = function() {
    var o = { };
    o.introAnimationsEnabled = true;
    o.insertAnimationsEnabled = true;
    o.removeAnimationsEnabled = true;
    o.fadeInEnabled = true;
    o.repositionEnabled = true;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_stackingListViewData = function() {
    var o = { };
    o.elements = [];
    o.items = [];
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the list view control direction.
/// </summary>
People.RecentActivity.UI.Feed.StackingListViewOrientation = {
    /// <field name="horizontal" type="Number" integer="true" static="true">Horizontal direction.</field>
    horizontal: 0,
    /// <field name="vertical" type="Number" integer="true" static="true">Vertical direction.</field>
    vertical: 1
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_stackingListViewPositionState = function(column, row, rowSpan, widthOverride, size, offset, stackingState, state) {
    var o = { };
    o.c = column;
    o.r = row;
    o.s = rowSpan;
    o.w = widthOverride;
    o.z = size;
    o.o = offset;
    o.p = stackingState;
    o.i = state;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_stackingListViewSchedulerTask = function(priority, action) {
    var o = { };
    Debug.assert(action != null, 'action != null');
    o.action = action;
    o.priority = priority;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="StackingListViewAnimations.js" />

People.RecentActivity.UI.Feed.create_stackingListViewSettings = function() {
    var o = { };
    o.animations = People.RecentActivity.UI.Feed.create_stackingListViewAnimations();
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="StackingListViewItem.js" />

/// <summary>
///     Provides the stacking state of a <see cref="T:People.RecentActivity.UI.Feed.StackingListViewItem" /> class.
/// </summary>
People.RecentActivity.UI.Feed.StackingListViewStackingState = {
    /// <field name="none" type="Number" integer="true" static="true">The item has not yet been determined to be either stackable or unstackable.</field>
    none: 0,
    /// <field name="stackable" type="Number" integer="true" static="true">The item can be stacked, but there no available neighbours.</field>
    stackable: 1,
    /// <field name="unstackable" type="Number" integer="true" static="true">The item cannot be stacked, it is taking up the full height of the list.</field>
    unstackable: 2
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_stackingListViewState = function(activeItemIndex, scrollPosition, firstItemInViewId, firstItemInViewIndex, layout) {
    var o = { };
    o.a = activeItemIndex;
    o.l = layout;
    o.d = firstItemInViewId;
    o.i = firstItemInViewIndex;
    o.s = scrollPosition;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_stackingListViewItemState = function(layout, items) {
    var o = { };
    o.i = items;
    o.l = layout;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_stackingListViewMarkupState = function(layout, markup) {
    var o = { };
    o.m = markup;
    o.o = layout;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_baseEntryState = function(contentHeight) {
    var o = { };
    o.c = contentHeight;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_linkEntryState = function(isColumnLayout, imageSize) {
    var o = { };
    o.i = isColumnLayout;
    o.s = imageSize;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_photoAlbumEntryImageState = function(imageHeight, imageWidth, imageX, imageY) {
    var o = { };
    o.h = imageHeight;
    o.w = imageWidth;
    o.x = imageX;
    o.y = imageY;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_photoAlbumEntryState = function(hero, thumb1, thumb2) {
    var o = { };
    o.h = hero;
    o.a = thumb1;
    o.b = thumb2;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_photoEntryState = function(containerWidth, imageWidth, imageHeight, imageX, imageY) {
    var o = { };
    o.c = containerWidth;
    o.h = imageHeight;
    o.w = imageWidth;
    o.x = imageX;
    o.y = imageY;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_videoEntryState = function(isColumnLayout, imageWidth, imageHeight) {
    var o = { };
    o.i = isColumnLayout;
    o.h = imageHeight;
    o.w = imageWidth;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.create_feedLayoutHydrationData = function(version, listViewState, timestamp) {
    var o = { };
    o.t = timestamp;
    o.s = listViewState;
    o.v = version;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\..\Core\EventManager.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\FeedLayout.js" />
/// <reference path="ListView\StackingListViewControl.js" />

People.RecentActivity.UI.Feed.SeeMoreStatusPanel = function(element, feedLayout) {
    /// <summary>
    ///     Provides a control to display see more progress wheel or error message.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to wrap.</param>
    /// <param name="feedLayout" type="People.RecentActivity.UI.Feed.FeedLayout">The feed layout.</param>
    /// <field name="_feedLayout$1" type="People.RecentActivity.UI.Feed.FeedLayout">The feed layout.</field>
    /// <field name="_listview$1" type="People.RecentActivity.UI.Feed.StackingListViewControl">The list view control.</field>
    /// <field name="_progress$1" type="People.RecentActivity.UI.Core.Control">The progress wheel.</field>
    /// <field name="_errorContainer$1" type="People.RecentActivity.UI.Core.Control">The error container.</field>
    /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The error control.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);

    Debug.assert(feedLayout != null, 'feedLayout');

    this._feedLayout$1 = feedLayout;
    this._listview$1 = feedLayout.listView;
};

Jx.inherit(People.RecentActivity.UI.Feed.SeeMoreStatusPanel, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype._feedLayout$1 = null;
People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype._listview$1 = null;
People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype._progress$1 = null;
People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype._errorContainer$1 = null;
People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype._errors$1 = null;

People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype.showProgress = function() {
    /// <summary>
    ///     Shows the progress.
    /// </summary>
    this._errorContainer$1.isVisible = false;
    this._progress$1.isVisible = true;
};

People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype.showError = function(result, location) {
    /// <summary>
    ///     Shows the error.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="location" type="People.RecentActivity.UI.Core.ErrorMessageLocation">The location.</param>
    if (this._errors$1 == null) {
        // render the error control on-demand.
        this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._feedLayout$1.feed.network.identity, People.RecentActivity.UI.Core.ErrorMessageContext.whatsNew, People.RecentActivity.UI.Core.ErrorMessageOperation.read);
        this._errors$1.render();
        this._errorContainer$1.appendControl(this._errors$1);
    }

    if (location === People.RecentActivity.UI.Core.ErrorMessageLocation.inline) {
        this._progress$1.isVisible = false;
        this._errorContainer$1.isVisible = true;
    }

    this._errors$1.location = location;
    this._errors$1.show(result);
};

People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the control is being disposed.
    /// </summary>
    this._feedLayout$1 = null;
    this._listview$1 = null;

    People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("documentkeydown", this._onKeyDown$1, this);

    if (this._errorContainer$1 != null) {
        this._errorContainer$1.dispose();
        this._errorContainer$1 = null;
    }

    if (this._errors$1 != null) {
        this._errors$1.dispose();
        this._errors$1 = null;
    }

    if (this._progress$1 != null) {
        this._progress$1.dispose();
        this._progress$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control needs to be rendered.
    /// </summary>
    People.RecentActivity.UI.Core.EventManager.events.addListener("documentkeydown", this._onKeyDown$1, this);

    var element = this.element;

    this._errorContainer$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'seemore-error');
    this._progress$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'seemore-progress');
    this._progress$1.label = Jx.res.getString('/strings/raSeeMoreProgressUpdating');
};

People.RecentActivity.UI.Feed.SeeMoreStatusPanel.prototype._onKeyDown$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');

    var moveNext = false;
    var movePrevious = false;

    switch (ev.keyCode) {
        case WinJS.Utilities.Key.end:
            if (this.isVisible) {
                // if the see more panel is already visible, just focus on it.
                this.focus();
                this._listview$1.activeItemIndex = -1;

                // so StackingListViewInputHandler won't handle it again.
                ev.preventDefault();
            }
            else if (this._feedLayout$1.canRequestMoreEntries && this._listview$1.isFullyRendered) {
                this.isVisible = true;

                var that = this;

                People.Animation.fadeIn(this.element).done(function() {
                    if (!that.isDisposed) {
                        that.focus();
                    }

                    return null;
                });

                this._listview$1.scrollToEnd();
                this._listview$1.activeItemIndex = -1;

                ev.preventDefault();
            }

            break;

        case WinJS.Utilities.Key.leftArrow:
        case WinJS.Utilities.Key.upArrow:
            if (People.RecentActivity.UI.Core.HtmlHelper.isLeftToRight) {
                movePrevious = true;
            }
            else {
                moveNext = true;
            }

            break;

        case WinJS.Utilities.Key.rightArrow:
        case WinJS.Utilities.Key.downArrow:
            if (People.RecentActivity.UI.Core.HtmlHelper.isLeftToRight) {
                moveNext = true;
            }
            else {
                movePrevious = true;
            }

            break;
    }

    var lastItemIndex = this._listview$1.lastItemIndex;
    if (lastItemIndex !== -1) {
        if (moveNext) {
            if (this.isActive) {
                // do nothing, we can't move further.
                ev.preventDefault();
            }
            else if (this.isVisible && (this._listview$1.activeItemIndex === lastItemIndex)) {
                // last item in the list view  is active, so move focus to the see more.
                this.focus();
                this._listview$1.activeItemIndex = -1;
                ev.preventDefault();
            }
        }
        else if (movePrevious) {
            if (this.isActive) {
                this._listview$1.activeItemIndex = lastItemIndex;
                this._listview$1.activeItem.focus();

                ev.preventDefault();
            }
        }
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.StackingListViewChanges = function() {
    /// <summary>
    ///     Provides a simple container for keeping track of changes.
    /// </summary>
    /// <field name="_inserts" type="Array">The current inserts.</field>
    /// <field name="_insertsProcessed" type="Boolean">Whether the inserts have been processed.</field>
    /// <field name="_removals" type="Array">The current removals.</field>
    /// <field name="_removalsProcessed" type="Boolean">Whether removals have been processed.</field>
    this._inserts = [];
    this._removals = [];
};


People.RecentActivity.UI.Feed.StackingListViewChanges.prototype._inserts = null;
People.RecentActivity.UI.Feed.StackingListViewChanges.prototype._insertsProcessed = false;
People.RecentActivity.UI.Feed.StackingListViewChanges.prototype._removals = null;
People.RecentActivity.UI.Feed.StackingListViewChanges.prototype._removalsProcessed = false;

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewChanges.prototype, "inserts", {
    get: function() {
        /// <summary>
        ///     Gets the current inserts.
        /// </summary>
        /// <value type="Array"></value>
        return this._inserts;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewChanges.prototype, "insertsProcessed", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the inserts have been processed.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._insertsProcessed;
    },
    set: function(value) {
        this._insertsProcessed = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewChanges.prototype, "removals", {
    get: function() {
        /// <summary>
        ///     Gets the current removals.
        /// </summary>
        /// <value type="Array"></value>
        return this._removals;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewChanges.prototype, "removalsProcessed", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether removals have been processed.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._removalsProcessed;
    },
    set: function(value) {
        this._removalsProcessed = value;
    }
});

People.RecentActivity.UI.Feed.StackingListViewChanges.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the current instance.
    /// </summary>
    for (var n = 0; n < this._inserts.length; n++) {
        var item = this._inserts[n];
        item.dispose();
    }

    this._inserts.length = 0;
    for (var n = 0; n < this._removals.length; n++) {
        var item = this._removals[n];
        item.dispose();
    }

    this._removals.length = 0;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\..\Model\Configuration.js" />
/// <reference path="..\..\..\Core\Controls\Control.js" />
/// <reference path="..\..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\..\Core\Html.js" />
/// <reference path="StackingListViewChanges.js" />
/// <reference path="StackingListViewData.js" />
/// <reference path="StackingListViewHorizontalLayoutEngine.js" />
/// <reference path="StackingListViewInputHandler.js" />
/// <reference path="StackingListViewItem.js" />
/// <reference path="StackingListViewItemState.js" />
/// <reference path="StackingListViewLayoutEngine.js" />
/// <reference path="StackingListViewOrientation.js" />
/// <reference path="StackingListViewScheduler.js" />
/// <reference path="StackingListViewSettings.js" />
/// <reference path="StackingListViewState.js" />
/// <reference path="StackingListViewStateManager.js" />
/// <reference path="StackingListViewVerticalLayoutEngine.js" />

(function () {

    var batchItemCount = 50;
    var batchInitialRenderTimeout = 500;
    var batchRepeatRenderTimeout = 500;

    var scrollTimeout = 250;

    People.RecentActivity.UI.Feed.StackingListViewControl = function (element, orientation) {
        /// <summary>
        ///     Provides a listview that can stack items.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element.</param>
        /// <param name="orientation" type="People.RecentActivity.UI.Feed.StackingListViewOrientation">The orientation.</param>
        /// <field name="_batchRenderCount$1" type="Number" integer="true" static="true">The number of entries we render in each batch.</field>
        /// <field name="_data$1" type="People.RecentActivity.UI.Feed.stackingListViewData">The data.</field>
        /// <field name="_scheduler$1" type="People.RecentActivity.UI.Feed.StackingListViewScheduler">The scheduler.</field>
        /// <field name="_settings$1" type="People.RecentActivity.UI.Feed.stackingListViewSettings">Provides settings.</field>
        /// <field name="_changes$1" type="Array">The current list of changes.</field>
        /// <field name="_stateManager$1" type="People.RecentActivity.UI.Feed.StackingListViewStateManager">The state manager.</field>
        /// <field name="_viewport$1" type="HTMLElement">The viewport.</field>
        /// <field name="_currentChanges$1" type="People.RecentActivity.UI.Feed.StackingListViewChanges">The current changes we're processing.</field>
        /// <field name="_pendingChanges$1" type="People.RecentActivity.UI.Feed.StackingListViewChanges">The changes that are pending (these will be comitted once <see cref="M:People.RecentActivity.UI.Feed.StackingListViewControl.EndEdits" /> has been invoked.)</field>
        /// <field name="_editing$1" type="Boolean">Whether the listview is being modified.</field>
        /// <field name="_initial$1" type="Boolean">Whether the listview has yet to be "initialized".</field>
        /// <field name="_orientation$1" type="People.RecentActivity.UI.Feed.StackingListViewOrientation">The current orientation.</field>
        /// <field name="_layoutHorizontal$1" type="People.RecentActivity.UI.Feed.StackingListViewLayoutEngine">The horizontal layout engine.</field>
        /// <field name="_layoutVertical$1" type="People.RecentActivity.UI.Feed.StackingListViewLayoutEngine">The vertical layout engine.</field>
        /// <field name="_layout$1" type="People.RecentActivity.UI.Feed.StackingListViewLayoutEngine">The current layout engine.</field>
        /// <field name="_inputHandler$1" type="People.RecentActivity.UI.Feed.StackingListViewInputHandler">The input handler.</field>
        /// <field name="_timerScroll$1" type="Number" integer="true">The scroll timer.</field>
        /// <field name="_timerScrollOffset$1" type="Number" integer="true">The scroll offset at the time of scheduling the scroll timer.</field>
        /// <field name="_timerBatchRender$1" type="Number" integer="true">The batch render timer.</field>
        this._timerScroll$1 = -1;
        this._timerBatchRender$1 = -1;

        People.RecentActivity.UI.Core.Control.call(this, element);

        // add the viewport element.
        this._viewport$1 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.stackingListViewViewport);

        if (this.element.children.length > 0) {
            this.element.insertBefore(this._viewport$1, this.element.children[0]);
        }
        else {
            this.element.appendChild(this._viewport$1);
        }

        this._data$1 = People.RecentActivity.UI.Feed.create_stackingListViewData();
        this._settings$1 = People.RecentActivity.UI.Feed.create_stackingListViewSettings();
        this._changes$1 = [];
        this._orientation$1 = orientation;
        this._stateManager$1 = new People.RecentActivity.UI.Feed.StackingListViewStateManager();

        // intialize the scheduler.
        this._scheduler$1 = new People.RecentActivity.UI.Feed.StackingListViewScheduler();
        this._scheduler$1.addListener("emptied", this._onSchedulerEmptied$1, this);

        // initialize the initial layout engine. 
        this._initializeLayoutEngine$1();

        // initialize the CSS class for orientation.
        this._updateViewportCssClass$1();

        // initialize the element.
        this.addClass('ra-listView');
    };

    Jx.inherit(People.RecentActivity.UI.Feed.StackingListViewControl, People.RecentActivity.UI.Core.Control);

    Debug.Events.define(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "editscompleted", "moreitemsrequested");

    People.RecentActivity.UI.Feed.StackingListViewControl._batchRenderCount$1 = People.RecentActivity.Configuration.maxStackableEntries;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._data$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._scheduler$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._settings$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._changes$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._stateManager$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._viewport$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._currentChanges$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._pendingChanges$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._editing$1 = false;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._initial$1 = true;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._orientation$1 = 0;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._layoutHorizontal$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._layoutVertical$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._layout$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._inputHandler$1 = null;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._timerScrollOffset$1 = 0;
    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._cachedScrollOffset = -1;

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "activeItem", {
        get: function () {
            /// <summary>
            ///     Gets or sets the active item.
            /// </summary>
            /// <value type="People.RecentActivity.UI.Feed.StackingListViewItem"></value>
            return this._inputHandler$1.activeItem;
        },
        set: function (value) {
            this._inputHandler$1.activeItem = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "activeItemIndex", {
        get: function () {
            /// <summary>
            ///     Gets or sets the index of the active item.
            /// </summary>
            /// <value type="Number" integer="true"></value>
            return this._inputHandler$1.activeItemIndex;
        },
        set: function (value) {
            this._inputHandler$1.activeItemIndex = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "lastItemIndex", {
        get: function () {
            /// <summary>
            ///     Gets the index of the last item in the list view control.
            /// </summary>
            /// <value type="Number" integer="true"></value>
            return this._layout$1.lastItemIndex;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "count", {
        get: function () {
            /// <summary>
            ///     Gets the number of items in the list.
            /// </summary>
            /// <value type="Number" integer="true"></value>
            return this._data$1.items.length;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "orientation", {
        get: function () {
            /// <summary>
            ///     Gets or sets the orientation of the listview.
            /// </summary>
            /// <value type="People.RecentActivity.UI.Feed.StackingListViewOrientation"></value>
            return this._orientation$1;
        },
        set: function (value) {
            if (this._orientation$1 !== value) {
                this._orientation$1 = value;
                this._onOrientationUpdated$1();
            }

        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "scrollPosition", {
        get: function () {
            /// <summary>
            ///     Gets or sets the scroll position.
            /// </summary>
            /// <value type="Number" integer="true"></value>
            return this._layout$1.viewportOffset;
        },
        set: function (value) {
            Jx.log.write(4, 'StackingListViewControl::ScrollPosition::set: ' + value);
            this._layout$1.viewportOffset = value;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "rowHeight", {
        get: function () {
            /// <summary>
            ///     Gets the height of the grid row.
            /// </summary>
            /// <value type="Number" integer="true"></value>
            return this._layout$1.rowHeight;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "isFullyRendered", {
        get: function () {
            /// <summary>
            ///     Gets a value indicating whether all items in the list view have been rendered.
            /// </summary>
            /// <value type="Boolean"></value>
            for (var n = 0; n < this._data$1.items.length; n++) {
                var item = this._data$1.items[n];
                if (!item.isRendered || item.orientation !== this._orientation$1) {
                    // if the item is not rendered, or not yet re-rendered for the new orientation.
                    return false;
                }
            }

            return true;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "containsVirtualizedItem", {
        get: function () {
            /// <summary>
            ///     Gets a value indicating whether any item in the list is virtualized.
            /// </summary>
            /// <value type="Boolean"></value>
            for (var n = 0; n < this._data$1.items.length; n++) {
                var item = this._data$1.items[n];
                if (item.isReadyForStacking && !item.isLoaded) {
                    return true;
                }
            }

            return false;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "isWithinSeeMoreRange", {
        get: function () {
            /// <summary>
            ///     Gets a value indicating whether the user is within range of "see more".
            /// </summary>
            /// <value type="Boolean"></value>
            return this._layout$1.viewportOffset + (this._layout$1.viewportSize * 2) >= this._layout$1.scrollerSize;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "batchCount", {
        get: function () {
            /// <summary>
            ///     Gets the number of batches of items we added to the list view control.
            /// </summary>
            /// <value type="Number" integer="true"></value>
            return Math.ceil(this._data$1.items.length / batchItemCount);
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "scheduler", {
        get: function () {
            /// <summary>
            ///     Gets the scheduler.
            /// </summary>
            /// <value type="People.RecentActivity.UI.Feed.StackingListViewScheduler"></value>
            return this._scheduler$1;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewControl.prototype, "viewport", {
        get: function () {
            /// <summary>
            ///     Gets the viewport element.
            /// </summary>
            /// <value type="HTMLElement"></value>
            return this._viewport$1;
        }
    });

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.getFirstItemInView = function (offset) {
        /// <summary>
        ///     Gets the first item in view.
        /// </summary>
        /// <param name="offset">The offset to start at. Null, undefined and -1 values will be ignored.</param>
        /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
        return this._layout$1.getFirstItemInView(offset);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.getPreviousItem = function (item) {
        /// <summary>
        ///     Gets the item that is visually placed before the given item.
        /// </summary>
        /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
        /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
        Debug.assert(item != null, 'item != null');
        return this._layout$1.getPreviousItem(item);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.getNextItem = function (item) {
        /// <summary>
        ///     Gets the item that is visually placed after the given item.
        /// </summary>
        /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
        /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
        Debug.assert(item != null, 'item != null');
        return this._layout$1.getNextItem(item);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.scrollToEnd = function () {
        /// <summary>
        ///     Scrolls to the end.
        /// </summary>
        this._layout$1.scrollToEnd();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.invalidateStates = function () {
        /// <summary>
        ///     Invalidates the states for the list view.
        /// </summary>
        this._stateManager$1.invalidate();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.beginEdits = function () {
        /// <summary>
        ///     Signals that the listview is about to be updated.
        /// </summary>
        Debug.assert(!this._editing$1, '!this.editing');
        if (!this._editing$1) {
            this._editing$1 = true;
            this._pendingChanges$1 = new People.RecentActivity.UI.Feed.StackingListViewChanges();
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.endEdits = function () {
        /// <summary>
        ///     Signals that the listview has been modified and the UX can be updated.
        /// </summary>
        Debug.assert(this._editing$1, 'this.editing');
        if (this._editing$1) {
            this._editing$1 = false;
            if (this._pendingChanges$1.inserts.length > 0 || this._pendingChanges$1.removals.length > 0) {
                this._changes$1.push(this._pendingChanges$1);
                // process the changes
                this._scheduler$1.schedule(3, this._processChanges$1.bind(this));
            }

            this._pendingChanges$1 = null;
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.insert = function (item, index) {
        /// <summary>
        ///     Inserts a new item.
        /// </summary>
        /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
        /// <param name="index" type="Number" integer="true">The index.</param>
        Debug.assert(item != null, 'item != null');
        Debug.assert(index >= 0, 'index >= 0');
        Debug.assert(this._editing$1, 'this.editing');

        // add the item to the pending changes and set the index.
        this._pendingChanges$1.inserts.push(item);
        item.index = index;
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.remove = function (item) {
        /// <summary>
        ///     Removes an item.
        /// </summary>
        /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item to remove.</param>
        Debug.assert(item != null, 'item != null');
        Debug.assert(this._editing$1, 'this.editing');

        // add the item to the pending changes.
        // the check to see if it exists will be done later (which is more efficient.)
        this._pendingChanges$1.removals.push(item);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.getState = function () {
        /// <summary>
        ///     Gets the state of the list view, which can be restored using <see cref="M:People.RecentActivity.UI.Feed.StackingListViewControl.SetState(People.RecentActivity.UI.Feed.StackingListViewState)" />.
        /// </summary>
        /// <returns type="People.RecentActivity.UI.Feed.stackingListViewState"></returns>
        return this._layout$1.getState();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.getItemStates = function (batchOnly) {
        /// <summary>
        ///     Gets the state of items in the list view, which can be restored using <see cref="M:People.RecentActivity.UI.Feed.StackingListViewControl.SetItemStates(System.Collections.Generic.Dictionary{Windows.UI.ViewManagement.ApplicationViewState,People.RecentActivity.UI.Feed.StackingListViewItemState})" />.
        /// </summary>
        /// <param name="batchOnly" type="Boolean">Whether to only save state for a batch only.</param>
        /// <returns type="Object"></returns>

        // first, saving the item states for the current layout state to the state manager.
        this._stateManager$1.setItemState(this._layout$1.getItemState(batchOnly));

        // then we return available item states for all layouts (mobody, snap, portrait).
        return this._stateManager$1.getItemStates();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.getMarkupState = function () {
        /// <summary>
        ///     Gets the markup of items.
        /// </summary>
        /// <returns type="People.RecentActivity.UI.Feed.stackingListViewMarkupState"></returns>

        // first, save the markup to the state manager.
        this._stateManager$1.setMarkupState(this._layout$1.getMarkupState());

        // return the available state.
        return this._stateManager$1.getMarkupState();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.setState = function (state) {
        /// <summary>
        ///     Sets the state of the list view, previously retrieved with <see cref="M:People.RecentActivity.UI.Feed.StackingListViewControl.GetState" />.
        /// </summary>
        /// <param name="state" type="People.RecentActivity.UI.Feed.stackingListViewState">The state.</param>
        Debug.assert(state != null, 'state != null');

        this._stateManager$1.setListViewState(state);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.setItemStates = function (states) {
        /// <param name="states" type="Object"></param>
        Debug.assert(states != null, 'state != null');

        this._stateManager$1.setItemStates(states);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.setMarkupState = function (state) {
        /// <summary>
        ///     Sets the state of the markup for items in the listview.
        /// </summary>
        /// <param name="state" type="People.RecentActivity.UI.Feed.stackingListViewMarkupState">The state.</param>
        Debug.assert(state != null, 'state != null');

        if (state.o === this._layout$1.layoutState) {
            this._stateManager$1.setMarkupState(state);
            // notify the layout we have markup, and as such we can now proceed to intro the viewport.
            this._layout$1.initializeFromMarkup();
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.forceLayout = function () {
        /// <summary>
        ///     Forces the layout to be updated.
        /// </summary>

        // if this happened because we're going to snap, then we should ignore this forced layout. we will receive
        // an additional "orientation changed" event as well.
        if ((Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.snapped) && (Windows.UI.ViewManagement.ApplicationView.value !== this._layout$1.layoutState)) {
            return;
        }

        // similarly, if we're snapped and we're going to non-snap, we should just ignore this.
        if ((Windows.UI.ViewManagement.ApplicationView.value !== Windows.UI.ViewManagement.ApplicationViewState.snapped) && (this._layout$1.layoutState === Windows.UI.ViewManagement.ApplicationViewState.snapped)) {
            return;
        }

        this._layout$1.forceLayout();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.freeze = function () {
        /// <summary>
        ///     Pauses any activity that is happening in the listview.
        /// </summary>
        if (this._scheduler$1 != null) {
            this._scheduler$1.freeze();
        }

        // cancel any timers we may have
        clearTimeout(this._timerBatchRender$1);
        clearTimeout(this._timerScroll$1);

        this._timerBatchRender$1 = -1;
        this._timerScroll$1 = -1;
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.clearTimers = function () {
        /// <summary>
        ///     Clears the timers.
        /// </summary>
        if ((this._timerScroll$1 !== -1) && this._scheduler$1.isPaused) {
            // we paused the scheduler, but we're about to clear out the timer that will resume it.
            this._scheduler$1.resume();
        }

        // clear all the timers.
        clearTimeout(this._timerBatchRender$1);
        clearTimeout(this._timerScroll$1);

        this._timerBatchRender$1 = -1;
        this._timerScroll$1 = -1;
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.resumeScrollListener = function () {
        /// <summary>
        ///     Resumes the scroll listener.
        /// </summary>
        Jx.log.write(4, 'StackingListViewControl::ResumeScrollListener()');
        this.attach('scroll', this._onScroll$1.bind(this));
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.stopScrollListener = function () {
        /// <summary>
        ///     Stops the scroll listener.
        /// </summary>
        Jx.log.write(4, 'StackingListViewControl::StopScrollListener()');
        this.detach('scroll');
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.checkMoreItemsRequested = function () {
        /// <summary>
        ///     Checks to see if the user is able to retrieve more items.
        /// </summary>
        // if all current items have been rendered and the user is less than 2 viewports away
        // from the end of the feed we need to ask for more items.
        if (this.isFullyRendered && this.isWithinSeeMoreRange) {
            // we've come within range of "see more", and all items have been rendered.
            this._onMoreItemsRequested$1();
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.onDisposed = function () {
        /// <summary>
        ///     Occurs when the control is being disposed.
        /// </summary>
        // make sure to clean up the scheduler.
        this._scheduler$1.removeListenerSafe("emptied", this._onSchedulerEmptied$1, this);
        this._scheduler$1.dispose();

        for (var n = 0; n < this._data$1.items.length; n++) {
            var item = this._data$1.items[n];
                item.dispose();
        }

        this._data$1.items.length = 0;

        for (var n = 0; n < this._changes$1.length; n++) {
            var changes = this._changes$1[n];
            changes.dispose();
        }

        this._changes$1.length = 0;

        if (this._currentChanges$1 != null) {
            this._currentChanges$1.dispose();
            this._currentChanges$1 = null;
        }

        if (this._pendingChanges$1 != null) {
            this._pendingChanges$1.dispose();
            this._pendingChanges$1 = null;
        }

        if (this._timerScroll$1 !== -1) {
            // clear the scroll timer.
            clearTimeout(this._timerScroll$1);
            this._timerScroll$1 = -1;
        }

        if (this._timerBatchRender$1 !== -1) {
            // clear the batch render timer.
            clearTimeout(this._timerBatchRender$1);
            this._timerBatchRender$1 = -1;
        }

        if (this._layoutHorizontal$1 != null) {
            this._layoutHorizontal$1.dispose();
            this._layoutHorizontal$1 = null;
        }

        if (this._layoutVertical$1 != null) {
            this._layoutVertical$1.dispose();
            this._layoutVertical$1 = null;
        }

        if (this._inputHandler$1 != null) {
            this._inputHandler$1.dispose();
            this._inputHandler$1 = null;
        }

        this._layout$1 = null;
        this._viewport$1 = null;

        People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.onRendered = function () {
        /// <summary>
        ///     Occurs when the control is being rendered.
        /// </summary>
        People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);

        // make sure to listen to any scroll & wheel events.
        this.attach('scroll', this._onScroll$1.bind(this));

        // update the role of the element.
        this.role = 'list';

        // initialize the keyboard handler.
        this._inputHandler$1 = new People.RecentActivity.UI.Feed.StackingListViewInputHandler(this, this._data$1);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._initializeLayoutEngine$1 = function () {
        var engine = null;
        if (!this._orientation$1) {
            if (this._layoutHorizontal$1 == null) {
                // initialize the horizontal layout engine.
                this._layoutHorizontal$1 = new People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine(this, this._data$1, this._settings$1, this._stateManager$1);
            }

            engine = this._layoutHorizontal$1;
        }
        else if (this._orientation$1 === 1) {
            if (this._layoutVertical$1 == null) {
                // initialize the vertical layout engine.
                this._layoutVertical$1 = new People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine(this, this._data$1, this._settings$1, this._stateManager$1);
            }

            engine = this._layoutVertical$1;
        }

        if (engine !== this._layout$1) {
            // we actually switched the layout, check if we need to disown the old engine first.
            if (this._layout$1 != null) {
                this._layout$1.disown();
            }

            // reset the scroll position of the viewport.
            Jx.log.write(4, 'StackingListViewControl::InitializeLayoutEngine: resetting scroll position to 0...');

            this.element.scrollLeft = 0;
            this.element.scrollTop = 0;
            this._layout$1 = engine;
            this._layout$1.takeOwnership();
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._updateViewportCssClass$1 = function () {
        if (!this._orientation$1) {
            this.removeClass('ra-listViewVertical');
            this.addClass('ra-listViewHorizontal');
        }
        else if (this._orientation$1 === 1) {
            this.removeClass('ra-listViewHorizontal');
            this.addClass('ra-listViewVertical');
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._processChanges$1 = function () {
        if (this.isDisposed) {
            return;
        }

        if (this._changes$1.length > 0) {
            // fetch the next changes that need to be processed.
            this._currentChanges$1 = this._changes$1[0];
            this._changes$1.shift();
            this._processCurrentChange$1();
        }
        else {
            this.raiseEvent("editscompleted", new People.RecentActivity.EventArgs(this));

            // update the list of snap points now that we're done repositioning.
            this._layout$1.updateAriaAttributes();
            this._layout$1.updateScrollPoints();

            // and notify the scheduler we're done.
            this._scheduler$1.onCompleted();
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._processCurrentChange$1 = function () {
        if (!this._currentChanges$1.removalsProcessed) {
            // make a quick note to indicate we've processed the removals.
            this._currentChanges$1.removalsProcessed = true;

            if (this._currentChanges$1.removals.length > 0) {
                // okay, we need to actually remove items from the list (bummer.)
                this._processRemovals$1();
                return;
            }
        }

        if (!this._currentChanges$1.insertsProcessed) {
            // make a quick note to indicate we've processed the inserts.
            this._currentChanges$1.insertsProcessed = true;

            if (this._currentChanges$1.inserts.length > 0) {
                // okay, we need to process the inserts. this can be either the initial, or an update.
                this._processInserts$1();
                return;
            }
        }

        this._currentChanges$1 = null;
        this._processChanges$1();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._processRemovals$1 = function () {
        Jx.log.write(4, 'StackingListViewControl::ProcessRemovals()');

        var removals = this._currentChanges$1.removals;

        this._layout$1.remove(removals, this._onUpdateCompleted$1.bind(this));
        this._inputHandler$1.remove(removals);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._processInserts$1 = function () {
        Jx.log.write(4, 'StackingListViewControl::ProcessInserts(' + this._initial$1 + ')');

        var inserts = this._currentChanges$1.inserts;
        
        if (this._initial$1) {
            this._initial$1 = false;
            this._layout$1.initialize(inserts, this._onUpdateCompleted$1.bind(this));
        }
        else {
            this._layout$1.add(inserts, this._onUpdateCompleted$1.bind(this));
        }

        this._inputHandler$1.add(inserts);
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._onOrientationUpdated$1 = function () {
        var that = this;

        this._scheduler$1.empty();
        
        // clear all the timers.
        this.clearTimers();
        
        // stop listening for any scroll event during re-layout.
        this.stopScrollListener();
        
        // we need to save this before scheduling the task, because scheduler uses msSetImmediate, which has a delay causing
        // us to always get scroll position as 0.
        var firstItemInView = this._layout$1.getFirstItemInView(this._cachedScrollOffset);
        
        if (this._settings$1.animations.fadeInEnabled) {
            // temporarily hide the items in the viewport until we've re-arranged them.
            this._viewport$1.style.opacity = '0';

            // update the viewport CSS class.
            this._updateViewportCssClass$1();
            
            this._scheduler$1.schedule(1, function () {
                // hide the old UX first.
                that._onOrientationUpdatedInternal$1(firstItemInView);
            
                // reset the viewport size.
                that._viewport$1.style.width = '';
                
                // then animate everything back in.
                People.Animation.fadeIn(that._viewport$1).done(function () {
                    if (!that.isDisposed) {
                        that.resumeScrollListener();
                        that._scheduler$1.onCompleted();
                    }

                    return null;
                });
            });
        }
        else {
            // update the viewport CSS class.
            this._updateViewportCssClass$1();
            
            // just execute everything without animations.
            this._onOrientationUpdatedInternal$1(firstItemInView);
            this.resumeScrollListener();
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._onOrientationUpdatedInternal$1 = function (firstItemInView) {
        /// <param name="firstItemInView" type="People.RecentActivity.UI.Feed.StackingListViewItem"></param>
        // initialize the new layout engine (horizontal, vertical, etc.)
        this._initializeLayoutEngine$1();

        if ((firstItemInView != null) && (firstItemInView.orientation === this._orientation$1)) {
            // bring the item into view, only when the item is already re-oriented.
            // otherwise the viewport will be scrolled to beginning.
            if ((firstItemInView.column === 1) && (firstItemInView.row === 1)) {
                // this is the first item in the view, so scroll to the beginning of the list.
                this._layout$1.viewportOffset = 0;
            }
            else {
                this._layout$1.viewportOffset = firstItemInView.offset;
            }
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._onUpdateCompleted$1 = function () {
        // we're done updating, so process the current change.
        this._processCurrentChange$1();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._onScroll$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        if (this._timerBatchRender$1 !== -1) {
            // cancel the batch rendered while we're scrolling.
            clearTimeout(this._timerBatchRender$1);
            this._timerBatchRender$1 = -1;
        }

        if (this._timerScroll$1 !== -1) {
            // cancel the existing timer, clearly we're not done scrolling yet.
            clearTimeout(this._timerScroll$1);
        }

        // the user scrolled. however, we should make sure they really stopped.
        this._timerScrollOffset$1 = this._cachedScrollOffset = this._layout$1.viewportOffset;
        this._timerScroll$1 = setTimeout(this._onScrollTimerElapsed$1.bind(this), scrollTimeout);
        
        // pause the scheduler so no tasks are executed while scrolling.
        this._scheduler$1.pause();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._onScrollTimerElapsed$1 = function () {
        var that = this;

        var viewportOffset = this._layout$1.viewportOffset;
        if (viewportOffset !== this._timerScrollOffset$1) {
            // liar, liar, pants on fire!
            Jx.log.write(3, "StackingListViewControl: Scrolling hasn't stopped yet");
            this._timerScrollOffset$1 = viewportOffset;
            this._timerScroll$1 = setTimeout(this._onScrollTimerElapsed$1.bind(this), scrollTimeout);
            return;
        }

        Jx.log.write(4, 'StackingListViewControl::OnScrollTimerElapsed()');

        this._timerScroll$1 = -1;
        
        // check to see if the user can request more items.
        this.checkMoreItemsRequested();
        
        var viewportSize = this._layout$1.viewportSize;
        var viewportScrollerSize = this._layout$1.scrollerSize;
        
        if (viewportOffset + viewportSize >= viewportScrollerSize - (viewportSize / 8)) {
            Jx.log.write(4, 'StackingListViewControl::OnScrollTimerElapsed::RenderBatch()');
        
            // if we've come within range of the end of the viewport, just render the next batch of entries.
            this._scheduler$1.schedule(2, function () {
                that._layout$1.renderBatch(People.RecentActivity.UI.Feed.StackingListViewControl._batchRenderCount$1, function () {
                    that._scheduler$1.onCompleted();
                });
            });
        }
        else if (this.containsVirtualizedItem) {
            Jx.log.write(4, 'StackingListViewControl::OnScrollTimerElapsed::RenderItemsInView()');
            
            // if we have scroll position to restore from saved states, we virtualize the list view control.
            // At this point, we must have already rendered the initial viewport based on the saved scroll position.
            // When user scrolls, we need to render the items in the new viewport.
            this._scheduler$1.schedule(2, function () {
                that._layout$1.renderItemsInView(that._data$1.items, true, viewportOffset, false, false, function () {
                    that._scheduler$1.onCompleted();
                });
            });
        }

        // resume the scheduler, picking up the scroll update first (it has the highest priority).
        this._scheduler$1.resume();
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._onBatchRenderTimerElapsed$1 = function () {
        var that = this;

        Jx.log.write(4, 'StackingListViewControl::OnBatchRenderTimerElapsed()');
        
        this._timerBatchRender$1 = -1;

        // its possible that we ended up processing stuff while this timer was running, so
        // make sure we're not (otherwise we end up rendering items while other stuff is happening)
        if (this._scheduler$1.isEmpty && !this._scheduler$1.isPaused) {
            this._scheduler$1.schedule(4, function () {
                Jx.log.write(4, 'StackingListViewControl::OnBatchRenderTimerElapsed::RenderBatch()');
                that._layout$1.renderBatch(People.RecentActivity.UI.Feed.StackingListViewControl._batchRenderCount$1, function (backwardRendered, forwardRendered) {
                    if (that.isDisposed) {
                        // we've since been disposed, don't do anything.
                        return;
                    }

                    if (backwardRendered >= People.RecentActivity.UI.Feed.StackingListViewControl._batchRenderCount$1 || forwardRendered >= People.RecentActivity.UI.Feed.StackingListViewControl._batchRenderCount$1) {
                        // we've rendered the maximum number of items in this batch, so do it again in a bit!
                        that._timerBatchRender$1 = setTimeout(that._onBatchRenderTimerElapsed$1.bind(that), batchRepeatRenderTimeout);
                    }

                    that._scheduler$1.onCompleted();
                });
            });
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._onSchedulerEmptied$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.EventArgs"></param>
        Debug.assert(e != null, 'e != null');
        if (this._timerBatchRender$1 === -1 && !this.isFullyRendered) {
            this._timerBatchRender$1 = setTimeout(this._onBatchRenderTimerElapsed$1.bind(this), batchInitialRenderTimeout);
        }
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype._onMoreItemsRequested$1 = function () {
        Jx.log.write(4, 'StackingListViewControl::OnMoreItemsRequested()');
        this.raiseEvent("moreitemsrequested", new People.RecentActivity.EventArgs(this));
    };

    People.RecentActivity.UI.Feed.StackingListViewControl.prototype.item = function (index) {
        /// <summary>
        ///     Gets the item at the given index.
        /// </summary>
        /// <param name="index" type="Number" integer="true">The index of the item.</param>
        /// <param name="value" type="People.RecentActivity.UI.Feed.StackingListViewItem"></param>
        /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
        Debug.assert(index >= 0, 'index >= 0');
        Debug.assert(index < this._data$1.items.length, 'index < this.data.Items.Count');

        return this._data$1.items[index];
    };

})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\..\..\Model\Configuration.js" />
/// <reference path="..\..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="StackingListViewControl.js" />
/// <reference path="StackingListViewItem.js" />
/// <reference path="StackingListViewItemState.js" />
/// <reference path="StackingListViewMarkupState.js" />
/// <reference path="StackingListViewState.js" />
/// <reference path="StackingListViewStateManager.js" />

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine = function(control, data, settings, stateManager) {
    /// <summary>
    ///     Provides a base for layout engines. Implements basic logic around adding items to the DOM,
    ///     provides animations, rendering logic for viewports, etc. The layout engine is only responsible
    ///     for rendering and positioning items. It is not response for keeping track of scrolling, etc.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Feed.StackingListViewControl">The parent control.</param>
    /// <param name="data" type="People.RecentActivity.UI.Feed.stackingListViewData">The data.</param>
    /// <param name="settings" type="People.RecentActivity.UI.Feed.stackingListViewSettings">the settings.</param>
    /// <param name="stateManager" type="People.RecentActivity.UI.Feed.StackingListViewStateManager">The state manager.</param>
    /// <field name="_removeAriaLabelRegex" type="RegExp" static="true">The regular expression used to remove the ARIA label attribute.</field>
    /// <field name="_data" type="People.RecentActivity.UI.Feed.stackingListViewData">The data.</field>
    /// <field name="_settings" type="People.RecentActivity.UI.Feed.stackingListViewSettings">The settings.</field>
    /// <field name="_stateManager" type="People.RecentActivity.UI.Feed.StackingListViewStateManager">The state manager.</field>
    /// <field name="_control" type="People.RecentActivity.UI.Feed.StackingListViewControl">The control.</field>
    /// <field name="_promise" type="WinJS.Promise">The promise that is currently being executed.</field>
    /// <field name="_ownership" type="Boolean">Whether this layout has current ownership of the viewport.</field>
    /// <field name="_disposed" type="Boolean">Whether the instance has been disposed.</field>
    /// <field name="_updateScrollPointsScheduled" type="Boolean">Whether an update for scroll points was scheduled.</field>
    /// <field name="_updateAriaAttributesScheduled" type="Boolean">Whether an update for ARIA attributes was scheduled.</field>
    /// <field name="_layoutState" type="Windows.UI.ViewManagement.ApplicationViewState">The current layout state(mobody, snap, portrait)</field>
    Debug.assert(control != null, 'control != null');
    Debug.assert(data != null, 'data != null');
    Debug.assert(settings != null, 'settings != null');
    Debug.assert(stateManager != null, 'stateManager != null');
    this._control = control;
    this._data = data;
    this._settings = settings;
    this._stateManager = stateManager;
    this._layoutState = Windows.UI.ViewManagement.ApplicationView.value;
};


People.RecentActivity.UI.Feed.StackingListViewLayoutEngine._removeAriaLabelRegex = new RegExp("aria-label=(['\"]).*?\\1", '');
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._data = null;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._settings = null;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._stateManager = null;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._control = null;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._promise = null;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._ownership = false;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._disposed = false;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._updateScrollPointsScheduled = false;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._updateAriaAttributesScheduled = false;
People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._layoutState = 0;

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "element", {
    get: function() {
        /// <summary>
        ///     Gets the element wrapping the viewport.
        /// </summary>
        /// <value type="HTMLElement"></value>
        return this._control.element;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "layoutState", {
    get: function() {
        /// <summary>
        ///     Gets or sets the layout state.
        /// </summary>
        /// <value type="Windows.UI.ViewManagement.ApplicationViewState"></value>
        return this._layoutState;
    },
    set: function(value) {
        this._layoutState = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "control", {
    get: function() {
        /// <summary>
        ///     Gets the control.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.StackingListViewControl"></value>
        return this._control;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "viewportElement", {
    get: function() {
        /// <summary>
        ///     Gets the viewport element.
        /// </summary>
        /// <value type="HTMLElement"></value>
        return this._control.viewport;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "elements", {
    get: function() {
        /// <summary>
        ///     Gets the elements.
        /// </summary>
        /// <value type="Array"></value>
        return this._data.elements;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "items", {
    get: function() {
        /// <summary>
        ///     Gets the items.
        /// </summary>
        /// <value type="Array"></value>
        return this._data.items;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "settings", {
    get: function() {
        /// <summary>
        ///     Gets the settings.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.stackingListViewSettings"></value>
        return this._settings;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "hasOwnership", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the layout has ownership.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._ownership;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "stateManager", {
    get: function() {
        /// <summary>
        ///     Gets the state manager.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.StackingListViewStateManager"></value>
        return this._stateManager;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "state", {
    get: function() {
        /// <summary>
        ///     Gets the state.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.stackingListViewState"></value>
        return this._stateManager.getListViewState();
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype, "stateItems", {
    get: function() {
        /// <summary>
        ///     Gets the item state.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.stackingListViewItemState"></value>
        return this._stateManager.getItemState(this._layoutState);
    }
});

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.dispose = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (!this._disposed) {
        this._disposed = true;
        this.disown();
        this._control = null;
        this.onDisposed();
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.disown = function() {
    /// <summary>
    ///     Disowns the layout engine, indicating it is no longer in control of the viewport. This
    ///     may be called whenever the layout engine is being changed (e.g. for snap)
    /// </summary>
    this._ownership = false;
    if (this._promise != null) {
        try {
            // if we can cancel this promise, then we should.
            this._promise.cancel();
        }
        catch (e) {
        }

        this._promise = null;
    }

    this.onDisowned();
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.takeOwnership = function() {
    /// <summary>
    ///     Lets the layout take ownership.
    /// </summary>
    if (!this._ownership) {
        this._ownership = true;
        // notify "ourselves" that we took ownership.
        this.onOwnershipTaken();
        var items = this._data.items;
        var len = items.length;
        if (len > 0) {
            this.repositionItemsWithoutStacking();
            // update the layout of each item.
            var orientation = this._control.orientation;
            var state = this.stateItems;
            var batch = People.RecentActivity.Configuration.batchEntryCount;
            // if not all items have states, this is the max items we will re-orient now.
            var max = (!orientation) ? batch : 3 * batch;
            for (var i = 0; i < len; i++) {
                var id = items[i].itemId;
                // clear out the state first, then update the orientation.
                var item = items[i];
                if ((state != null) && !Jx.isUndefined(state.i[id])) {
                    // apply the position state we have for this orientation.
                    item.isRepositioned = false;
                    item.positionState = state.i[id];
                }
                else {
                    item.positionState = null;
                }

                item.orientation = orientation;
            }

            this.repositionItems(0, len - 1);
        }    
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.forceLayout = function() {
    /// <summary>
    ///     Forces the layout to be updated.
    /// </summary>
    var that = this;
    
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIForceLayoutStart);
    // notify whoever is listening that we got forced to update our layout.
    // we need to do this before scheduling, otherwise we won't be able to save the correct scroll position.
    this.onLayoutForced();
    var element = this.viewportElement;
    element.style.opacity = '0';
    var scheduler = this._control.scheduler;
    Jx.log.write(4, 'StackingListViewLayoutEngine::ForceLayout(), window.screen.height=' + window.screen.height);
    // empty the scheduler.
    scheduler.empty();
    this._control.clearTimers();
    this._control.stopScrollListener();
    scheduler.schedule(1, function() {
        Jx.log.write(4, 'StackingListViewLayoutEngine::ForceLayout::ExecuteScheduledTask()');
        var items = that.items;
        var len = items.length;
        var stateItems = that.stateItems;
        var stateList = that.state;
        for (var i = 0; i < len; i++) {
            var item = items[i];
            var id = item.itemId;
            if ((stateItems != null) && !Jx.isUndefined(stateItems.i[id])) {
                // this item has state for the new layout, apply it. 
                item.isRepositioned = false;
                item.positionState = stateItems.i[id];
            }

            item.resize();
        }

        // reposition each item and then force each item to recompute what it needs to hide, etc.
        that.repositionItems(0, len - 1);
        if (stateList != null) {
            // bring the same item into view in the new layout.
            var index = stateList.i;
            if (index > 0 && index < len) {
                that.viewportOffset = items[index].offset;
            }        
        }

        People.Animation.fadeIn(that.viewportElement).done(function() {
            if (!that._disposed) {
                that._control.resumeScrollListener();
                scheduler.onCompleted();
            }

            People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIForceLayoutStop);
            return null;
        });
    });
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.add = function(items, onCompleted) {
    /// <param name="items" type="Array"></param>
    /// <param name="onCompleted" type="Function"></param>
    var that = this;
    
    Debug.assert(items != null, 'items != null');
    Jx.log.write(4, 'StackingListViewLayoutEngine::Add()');
    this._sortItemsByIndex(items);
    // insert all the items into the correct position.
    // also take a snapshot of the current elements such that we can animate them properly.
    var list = this.items;
    var elem = this.elements;
    var elemOriginal = Array.apply(null, elem);
    var elemNew = [];
    var element = this.viewportElement;
    var orientation = this._control.orientation;
    var append = true;
    var listlen = list.length;
    if (!listlen) {
        append = false;
    }

    for (var i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        // figure out the index and insert it into the list.
        var index = item.index;
        item.orientation = orientation;
        item.owner = this._control;
        this.loadItem(item);
        list.splice(index, 0, item);
        // all items are expected to have an element, even if its an empty one.
        // we will call Render on the item when it is time to fill in the content.
        var elementItem = item.element;
        Debug.assert(elementItem != null, 'elementItem != null');
        Jx.addClass(elementItem, 'ra-listViewItem');
        elem.splice(index, 0, elementItem);
        elemNew.push(elementItem);
        // when the entry hasn't been rendered yet, hide it.
        elementItem.style.display = 'none';
        // although we could just append the element randomly in the DOM (the positioning algorithm will
        // make things look right), we should still insert it into the correct position for screen readers, etc.
        if (index + 1 < listlen) {
            element.insertBefore(elementItem, elem[index + 1]);
            append = false;
        }
        else {
            // we've reached the end of the list, just append.
            element.appendChild(elementItem);
        }    
    }

    // update the indices of all the items.
    this._updateItemIndices();
    window.msSetImmediate(function() {
        if (that._isAlive()) {
            // initialize a new animation.
            that.executeInsertAnimation(items, elemNew, elemOriginal, append, onCompleted);
        }

    });
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.initializeFromMarkup = function() {
    /// <summary>
    ///     Initializes the layout from markup.
    /// </summary>
    var that = this;
    
    Jx.log.write(4, 'StackingListViewLayoutEngine::InitializeFromMarkup()');
    this._control.scheduler.schedule(0, function() {
        if (!that._isAlive()) {
            // the layout is no longer alive, just shortcircuit this stuff.
            that._control.scheduler.onCompleted();
            return;
        }

        var viewport = that.viewportElement;
        viewport.innerHTML = that._stateManager.getMarkupState().m;
        viewport.style.opacity = '0';
        that.viewportOffset = that._stateManager.getScrollPosition();
        if (that._settings.animations.introAnimationsEnabled) {
            // give IE time to render everything by yielding to the engine.
            window.msSetImmediate(function() {
                if (!that._isAlive()) {
                    // we've been disposed, curses!
                    that._control.scheduler.onCompleted();
                    return;
                }

                // execute the enter content animation.
                that._promise = People.Animation.enterContent(that.viewportElement);
                that._promise.done(function() {
                    // once the animation has been completed, set IntroAnimationsEnabled to false so that 
                    // ExecuteEnterContentAnimation will skip its animation.
                    that._settings.animations.introAnimationsEnabled = false;
                    // mark the task as complete.
                    that._control.scheduler.onCompleted();
                    return null;
                });
            });
        }
        else {
            // we're done, no animations to be executed.
            that._control.scheduler.onCompleted();
        }

    });
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.initialize = function(items, onCompleted) {
    /// <param name="items" type="Array"></param>
    /// <param name="onCompleted" type="Function"></param>
    Debug.assert(items != null, 'items != null');
    Jx.log.write(4, 'StackingListViewLayoutEngine::Initialize()');
    People.RecentActivity.Core.EtwHelper.writeSimpleEvent(People.RecentActivity.Core.EtwEventName.uiListViewRenderInitialBatchStart);
    this._sortItemsByIndex(items);
    // insert all the items into the correct position.
    var list = this.items;
    var elem = this.elements;
    var len = items.length;
    var element = this.viewportElement;
    list.push.apply(list, items);
    var orientation = this._control.orientation;
    for (var i = 0; i < len; i++) {
        var item = items[i];
        var index = item.index;
        // load the item such that it has an element, etc.
        item.owner = this._control;
        item.orientation = orientation;
        this.loadItem(item);
        // all items are expected to have an element, even if its an empty one.
        // we will call Render on the item when it is time to fill in the content.
        var elementItem = item.element;
        Debug.assert(elementItem != null, 'elementItem != null');
        Jx.addClass(elementItem, 'ra-listViewItem');
        elem.splice(index, 0, elementItem);
        element.appendChild(elementItem);
    }

    // do a quick "positioning" to let every item have an initial position
    // for any items which we have states, we apply them here.
    this.repositionItems(0, len - 1);
    this.onLayoutInitialized();
    // update the item indices
    this._updateItemIndices();
    // if state is not null AND offset is -1, which means we don't have enough item states saved to restore the scroll position.
    // for example, you quickly switch to snap when only a few entries are rendered in mobody, and more entries
    // rendered in snap, click one of the new entry to go to self page, and then in mobody, click backbutton.
    // in this case we have to render everything up to the first in view item in snap, which is slow, so
    // we set a limit here (only less than 100 entries to render in addition to the items having states). 
    // If more than that, we have to do a regular render and put you to the beginning.
    var offset = this._stateManager.getScrollPosition();
    var state = this.state;
    var itemState = this.stateItems;
    var stateItemCount = (itemState == null) ? 0 : Object.keys(itemState.i).length;
    if ((state != null) && (state.i !== -1) && (state.i <= stateItemCount + (2 * People.RecentActivity.Configuration.batchEntryCount)) && (state.i < this.items.length) && (offset === -1)) {
        this.bringItemIntoView(this.items[state.i], onCompleted);
    }
    else {
        // execute the intro animation, of course.
        this.executeEnterContentAnimation(items, elem, offset, onCompleted);
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.remove = function(items, onCompleted) {
    /// <param name="items" type="Array"></param>
    /// <param name="onCompleted" type="Function"></param>
    var that = this;
    
    Debug.assert(items != null, 'items != null');
    Jx.log.write(4, 'StackingListViewLayoutEngine::Remove()');
    // we don't need to sort items for removal.
    var list = this.items;
    var elem = this.elements;
    var elemRemoved = [];
    for (var i = 0, len = items.length; i < len; i++) {
        var index = list.indexOf(items[i]);
        if (index !== -1) {
            list[index].dispose();
            list.splice(index, 1);
            elemRemoved.push(elem[index]);
            elem.splice(index, 1);
        }    
    }

    // update the indices of all the items.
    this._updateItemIndices();
    window.msSetImmediate(function() {
        if (that._isAlive()) {
            // execute the removal animation.
            that.executeRemoveAnimation(elemRemoved, elem, onCompleted);
        }

    });
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.renderBatch = function(batchSize, callback) {
    /// <summary>
    ///     Renders a batch of items.
    /// </summary>
    /// <param name="batchSize" type="Number" integer="true">The maximum batch size.</param>
    /// <param name="callback" type="Function">The callback.</param>
    var that = this;
    
    Debug.assert(batchSize > 0, 'batchSize > 0');
    Debug.assert(callback != null, 'callback != null');
    var items = this._data.items;
    var rendered = [];
    var backwardRenderStart = -1;
    var forwardRenderStart = -1;
    var item = items[0];
    // try to get the first one not rendered.
    while (item != null) {
        if (item.isRendered) {
            break;
        }

        item = this.getNextItem(item);
    }

    if (item != null && !!item.index) {
        var previous = this.getPreviousItem(item);
        Debug.assert(previous != null, 'previous');
        // we backward render from here.
        backwardRenderStart = previous.index;
    }
    else if (item == null) {
        // nothing is rendered yet, so we forward start from beginning.
        forwardRenderStart = 0;
    }

    // try to find one not rendered yet.
    while (item != null) {
        if (!item.isRendered || item.orientation !== this._control.orientation) {
            break;
        }

        item = this.getNextItem(item);
    }

    if (item != null) {
        // we forward render from here.
        forwardRenderStart = item.index;
    }

    var backwardRenderCount = 0;
    var forwardRenderCount = 0;
    if (backwardRenderStart !== -1) {
        item = items[backwardRenderStart];
        while (item != null && backwardRenderCount < batchSize) {
            if (!item.isRendered) {
                this.renderItem(item);
                backwardRenderCount++;
                rendered.push(item);
            }

            item = this.getPreviousItem(item);
        }    
    }

    // if we backward rendered items, the first in UI would be the last rendered.
    var firstItemRendered = (backwardRenderCount > 0) ? rendered[rendered.length - 1] : null;
    if (forwardRenderStart !== -1) {
        item = items[forwardRenderStart];
        while (item != null && forwardRenderCount < batchSize) {
            if (!item.isRendered) {
                this.renderItem(item);
                forwardRenderCount++;
                rendered.push(item);
            }
            else if (item.orientation !== this._control.orientation) {
                // this item needs to be re-rendered with the new orientation.
                item.element.style.opacity = '0';
                item.isVisible = true;
                item.orientation = this._control.orientation;
                item.isReadyForStacking = true;
                forwardRenderCount++;
                rendered.push(item);
            }

            item = this.getNextItem(item);
        }    
    }

    if (firstItemRendered == null && forwardRenderCount > 0) {
        // if we backward rendered nothing and forward rendered items, the first in UI would be the first rendered.
        firstItemRendered = rendered[0];
    }

    if (firstItemRendered != null) {
        // reposition the items we just rendered
        this.repositionFromBatch(firstItemRendered);
        this.updateAriaAttributes();
        this.updateScrollPoints();
        // now that we've rendered more entries, check to see if we're in range of see more
        this._control.checkMoreItemsRequested();
        if (this._settings.animations.fadeInEnabled) {
            // fade in the elements after rendering a batch.
            var elements = new Array(rendered.length);
            for (var i = 0, len = elements.length; i < len; i++) {
                elements[i] = rendered[i].element;
            }

            People.Animation.fadeIn(elements).done(function() {
                if (that._isAlive()) {
                    // the layout is still alive, so invoke the callback.
                    callback(backwardRenderCount, forwardRenderCount);
                }

                return null;
            });
            return;
        }    
    }

    callback(0, 0);
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.bringItemIntoView = function(item, onCompleted) {
    /// <summary>
    ///     Brings an item into view.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <param name="onCompleted" type="Function">The callback.</param>
    var that = this;
    
    Debug.assert(item != null, 'item');
    Jx.log.write(4, 'StackingListViewLayoutEngine::BringItemIntoView(' + item.index + ')');
    // ensure all items up (and including) this one have been rendered.
    // because each item should already have a predetermined width at this point,
    // scrolling will automatically force items between the origin and destination
    // offset to be rendered.
    var items = this.items;
    // ensure to render all the items in the mean time.
    var elem = this.renderItems(items.slice(0, items.indexOf(item) + 1));
    // we need to render more items to fill the view port we are going to scroll to.
    var renderedItems = this._renderItemsInViewInternal(items.slice(items.indexOf(item) + 1), (item.isStateApplied) ? item.offset : this.getItemOffset(item));
    for (var n = 0; n < renderedItems.length; n++) {
        var render = renderedItems[n];
        elem.push(render.element);
    }

    if (elem.length > 0) {
        // now that items have been rendered, we should reposition items. we should start at the
        // lowest index we rendered minus one, such that that entry could potentially be stacked.
        this.repositionItems(0, items.length - 1);
        // we need to apply scroll position first, otherwise we will see jumping when fading in items.
        this.viewportOffset = item.offset;
        if (this._settings.animations.fadeInEnabled) {
            // we need to fade in these items.
            People.Animation.fadeIn(elem).done(function() {
                if (that._isAlive()) {
                    that._safeInvokeCallback(onCompleted);
                }

                return null;
            });
            return;
        }    
    }

    this.viewportOffset = item.offset;
    this._safeInvokeCallback(onCompleted);
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.scrollToEnd = function() {
    /// <summary>
    ///     Scrolls to the end.
    /// </summary>
    this.viewportOffset = this.scrollerSize - this.viewportSize;
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.getState = function() {
    /// <summary>
    ///     Gets the state of the layout.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.Feed.stackingListViewState"></returns>
    var item = this.getFirstItemInView();
    return People.RecentActivity.UI.Feed.create_stackingListViewState(this._control.activeItemIndex, this.viewportOffset, (item != null) ? item.itemId : null, (item != null) ? item.index : -1, this._layoutState);
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.getItemState = function(batchOnly) {
    /// <summary>
    ///     Gets the state of the items in the layout.
    /// </summary>
    /// <param name="batchOnly" type="Boolean">Whether to only save state for a batch only.</param>
    /// <returns type="People.RecentActivity.UI.Feed.stackingListViewItemState"></returns>
    var states = {};
    var items = this._data.items;
    var len = items.length;
    if (batchOnly) {
        len = Math.min(len, People.RecentActivity.Configuration.batchEntryCount);
    }

    for (var i = 0; i < len; i++) {
        // fetch the position state.
        var item = items[i];
        states[item.itemId] = item.positionState;
    }

    return People.RecentActivity.UI.Feed.create_stackingListViewItemState(this._layoutState, states);
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.getMarkupState = function() {
    /// <summary>
    ///     Gets the markup state.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.Feed.stackingListViewMarkupState"></returns>
    var markup = [];

    var items = this._data.items;
    if (items.length > 0) {
        // fetch the markup of each item. note that we only get the full markup of items in view.
        // the remaining items are just husks of their former selves.
        var viewportOffset = this.viewportOffset;
        var viewportSize = this.viewportSize;

        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];

            if (item.isElementLoaded) {
                var element = item.element;
            
                // figure out if this item is inside the viewport.
                var itemOffset = item.offset;
                var itemSize = item.size;

                if ((itemOffset + itemSize < viewportOffset) || (itemOffset > viewportOffset + viewportSize)) {
                    if (!this._control.orientation) {
                        if (item.isRendered && !item.hasImplicitWidth && (item.widthOverride === -1)) {
                            // set the explicit width so we can restore it correctly later.
                            var size = item.size !== 0 ? item.size : item.contentWidthPixels;
                            element.style.width = size + 'px';
                        }
                    }

                    // remove the ARIA label first, then strip out anything inside the HTML blob.
                    var outerHtml = element.outerHTML;

                    outerHtml = outerHtml.replace(People.RecentActivity.UI.Feed.StackingListViewLayoutEngine._removeAriaLabelRegex, '');
                    outerHtml = outerHtml.substr(0, outerHtml.indexOf('>') + 1) + outerHtml.substr(outerHtml.lastIndexOf('<'));

                    markup.push(outerHtml);
                }
                else {
                    // push all of the markup into the list.
                    markup.push(element.outerHTML);
                }
            }        
        }    
    }

    return People.RecentActivity.UI.Feed.create_stackingListViewMarkupState(this._layoutState, window.toStaticHTML(markup.join('')));
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.updateScrollPoints = function() {
    /// <summary>
    ///     Updates the list of snap points.
    /// </summary>
    var that = this;
    
    if (!this._updateScrollPointsScheduled) {
        this._updateScrollPointsScheduled = true;
        // scroll points are nice to have, but we don't have to update them right away, especially given
        // that getting the offset for each item is relatively expensive.
        this._control.scheduler.schedule(6, function() {
            // update the scroll points, and we're done.
            that._updateScrollPointsScheduled = false;
            that.onUpdateScrollPoints();
            that._control.scheduler.onCompleted();
        });
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.updateAriaAttributes = function() {
    /// <summary>
    ///     Updates the list of ARIA attributes for each item in the list.
    /// </summary>
    var that = this;
    
    if (!this._updateAriaAttributesScheduled) {
        this._updateAriaAttributesScheduled = true;
        // the ARIA attributes aren't super important, but a little bit more important than updating scroll points.
        this._control.scheduler.schedule(5, function() {
            // udpate the aria attributes, and we're done.
            that._updateAriaAttributesScheduled = false;
            that.onUpdateAriaAttributes();
            that._control.scheduler.onCompleted();
        });
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.renderItemsInView = function(items, animate, offsetOverride, append, repositionAll, callback) {
    /// <param name="items" type="Array"></param>
    /// <param name="animate" type="Boolean"></param>
    /// <param name="offsetOverride" type="Number" integer="true"></param>
    /// <param name="append" type="Boolean"></param>
    /// <param name="repositionAll" type="Boolean"></param>
    /// <param name="callback" type="System.Action`1"></param>
    var that = this;
    
    Debug.assert(items != null, 'items != null');
    Debug.assert(callback != null, 'callback != null');
    if ((!items.length) || !this._isAlive()) {
        // no need to reposition items, there are none.
        callback(0);
    }

    // render items and reposition them until we've filled the viewport.
    var elements = [];
    // clone the list so we can modify it without worrying about what got passed in.
    items = Array.apply(null, items);
    // render items in view in batches, so it doesn't look like we're stuck for a long time.
    var totalCount = this.items.length;
    while (items.length > 0) {
        var item = items[0];
        // pass the list to our internal rendering method. if that returns elements that were positioned,
        // it means we can do it again. otherwise, it would appear that we're done.
        var rendered = this._renderItemsInViewInternal(items, offsetOverride);
        if (rendered.length > 0) {
            for (var i = 0, len = rendered.length; i < len; i++) {
                // add the elements to the list ...
                elements.push(rendered[i].element);
            }

            // ... and then reposition the items we've just rendered.
            if (repositionAll) {
                this.repositionItems(0, totalCount - 1);
            }
            else if (!append) {
                this.repositionFromBatch(rendered[0]);
            }
            else {
                var first = this.getFirstItemInSection(item);
                if (first != null) {
                    // we can reposition just from the first index in the section.
                    this.repositionItems(first.index, totalCount - 1);
                }
                else {
                    // there is no information relating to positioning of this item yet, so we just have to reposition the current batch.
                    this.repositionFromBatch(rendered[0]);
                }            
            }

        }
        else {
            break;
        }    
    }

    var count = elements.length;
    if (count > 0) {
        // once we've rendered the base set of items in view, do one last pass to render any items that 
        // are neighbours of the items we've rendered, but who are too far down in the list for us to have
        // considered so far. note that we don't do this in every call in to RenderItemsInViewInternal
        // because it would slow us down too much (we only need to do this check once.)
        var rendered = this._renderItemsInViewNeighbours(items, offsetOverride);

        for (var i = 0, len = rendered.length; i < len; i++) {
            elements.push(rendered[i].element);
        }

        if (rendered.length !== 0) {
            this.repositionFromBatch(rendered[0]);
        }

        // now that we've rendered more entries, check to see if we're in range of see more
        this._control.checkMoreItemsRequested();

        // we're done, so do we need to animate anything?
        if (animate && this._settings.animations.fadeInEnabled) {
            this._promise = People.Animation.fadeIn(elements);
            this._promise.done(function() {
                that._promise = null;
                if (that._isAlive()) {
                    // we're done with the animation, so invoke the callback.
                    callback(count);
                }

                return null;
            });
            return;
        }    
    }

    // invoke the callback even though we're not running animations, it just becomes a sync operation.
    callback(count);
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.onDisowned = function() {
    /// <summary>
    ///     Occurs when the engine is being disowned, meaning it is no longer in control of the viewport.
    ///     All background work should be cancelled. This happens in scenarios like snap.
    /// </summary>
    if (!this._disposed) {
        // when we're being disowned, we save the state so that when we go back to this layout we can quickly restore that state.
        this._stateManager.setListViewState(this.getState());
        this._stateManager.setItemState(this.getItemState(false));
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.onOwnershipTaken = function() {
    /// <summary>
    ///     Occurs when the layout has taken ownership.
    /// </summary>
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.onLayoutForced = function() {
    /// <summary>
    ///     Occurs when the layout is being forced to update.
    /// </summary>
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.repositionLatestBatch = function() {
    /// <summary>
    ///     Repositions the items in latest batch. For example, if the list view has 100 items now, we just
    ///     reposition from item 50 to 100.
    /// </summary>
    /// <returns type="Array" elementType="Object" elementDomElement="true"></returns>
    return this.repositionItems((this._control.batchCount - 1) * 50, this.items.length - 1);
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.repositionFromBatch = function(item) {
    /// <summary>
    ///     Repositions the items starting from the batch that the given item belongs to.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item indicating which batch to start with.</param>
    /// <returns type="Array" elementType="Object" elementDomElement="true"></returns>
    Debug.assert(item != null, 'item != null');
    var index = item.index;
    var batch = Math.floor(index / 50);
    return this.repositionItems(batch * 50, this.items.length - 1);
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.executeEnterContentAnimation = function(items, elements, offset, onCompleted) {
    /// <param name="items" type="Array"></param>
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true"></param>
    /// <param name="offset" type="Number" integer="true"></param>
    /// <param name="onCompleted" type="Function"></param>
    var that = this;
    
    Debug.assert(items != null, 'items != null');
    Debug.assert(elements != null, 'elements != null');
    Jx.log.write(4, People.Social.format('StackingListViewLayoutEngine::ExecuteEnterContentAnimation(items:{0}, elements:{1}, offset:{2})', items.length, elements.length, offset));
    this.renderItemsInView(items, false, offset, false, true, function() {
        People.RecentActivity.Core.EtwHelper.writeSimpleEvent(People.RecentActivity.Core.EtwEventName.uiListViewRenderInitialBatchStop);
        People.RecentActivity.Core.EtwHelper.writeSimpleEvent(People.RecentActivity.Core.EtwEventName.uiListViewAnimateInStart);
        if ((offset > 0) && (that.state != null) && (that.state.a < items.length)) {
            that.viewportOffset = offset;
            that._control.activeItemIndex = that.state.a;
        }

        // figure out if we actually need to run this animation.
        if ((elements.length > 0) && that.settings.animations.introAnimationsEnabled) {
            that._promise = People.Animation.enterContent(that.viewportElement);
            that._promise.done(function() {
                // the animation has been completed.
                People.RecentActivity.Core.EtwHelper.writeSimpleEvent(People.RecentActivity.Core.EtwEventName.uiListViewAnimateInStop);
                that._promise = null;
                if (that._isAlive()) {
                    that._safeInvokeCallback(onCompleted);
                }

                return null;
            });
        }
        else {
            // we don't need to run the animation -- there are either no items, or animations have been turned off.
            People.RecentActivity.Core.EtwHelper.writeSimpleEvent(People.RecentActivity.Core.EtwEventName.uiListViewAnimateInStop);
            if (that._isAlive()) {
                that._safeInvokeCallback(onCompleted);
            }        
        }

    });
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.executeInsertAnimation = function(items, elementsNew, elementsAffected, append, onCompleted) {
    /// <param name="items" type="Array"></param>
    /// <param name="elementsNew" type="Array" elementType="Object" elementDomElement="true"></param>
    /// <param name="elementsAffected" type="Array" elementType="Object" elementDomElement="true"></param>
    /// <param name="append" type="Boolean"></param>
    /// <param name="onCompleted" type="Function"></param>
    var that = this;
    
    Debug.assert(items != null, 'items != null');
    Debug.assert(elementsNew != null, 'elementsNew != null');
    Debug.assert(elementsAffected != null, 'elementsAffected != null');
    Jx.log.write(4, People.Social.format('StackingListViewLayoutEngine::ExecuteInsertAnimation(items:{0}, elementsNew:{1}, elementsAffected:{2}, append:{3})', items.length, elementsNew.length, elementsAffected.length, append));
    if (!elementsNew.length) {
        this._safeInvokeCallback(onCompleted);
        return;
    }

    // if append, this is the first time we reposition the appended items, so we start from the current last item in UI.
    if (append) {
        this.repositionItems(this.lastItemIndex, this.items.length - 1);
    }
    else {
        this.repositionFromBatch(items[0]);
    }

    this.renderItemsInView(items, true, -1, append, false, function() {
        if (that._isAlive()) {
            that._safeInvokeCallback(onCompleted);
        }

    });
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.executeRemoveAnimation = function(elementsRemoved, elementsAffected, onCompleted) {
    /// <summary>
    ///     Executes a "remove items" animation.
    /// </summary>
    /// <param name="elementsRemoved" type="Array" elementType="Object" elementDomElement="true">The removed elements.</param>
    /// <param name="elementsAffected" type="Array" elementType="Object" elementDomElement="true">The affected elements.</param>
    /// <param name="onCompleted" type="Function">The "completed" callback.</param>
    var that = this;
    
    Debug.assert(elementsRemoved != null, 'elementsRemoved != null');
    Debug.assert(elementsAffected != null, 'elementsAffected != null');
    Jx.log.write(4, People.Social.format('StackingListViewLayoutEngine::ExecuteRemoveAnimation(elementsRemoved:{0}, elementsAffected:{1})', elementsRemoved.length, elementsAffected.length));
    var count = this.items.length;
    if (elementsRemoved.length > 0) {
        // null out the state we're holding on to.
        this._stateManager.invalidate();
        if (this.settings.animations.removeAnimationsEnabled) {
            var promise = People.Animation.createDeleteFromListAnimation(elementsRemoved, elementsAffected);
            // reposition all the various items.
            this.repositionItems(0, count - 1);
            for (var i = 0, len = elementsRemoved.length; i < len; i++) {
                // make the removed elements ready for deletion by hiding them (this will animate once we call Execute.)
                elementsRemoved[i].style.opacity = '0';
            }

            this._promise = promise.execute();
            this._promise.done(function() {
                that._promise = null;
                if (that._isAlive()) {
                    // now we can remove all the elements from the DOM and invoke the callback.
                    that._removeElements(elementsRemoved);
                    that._safeInvokeCallback(onCompleted);
                }

                return null;
            });
        }
        else {
            // elements were removed, so we still need to reposition stuff.
            this._removeElements(elementsRemoved);
            this.repositionItems(0, count - 1);
            this._safeInvokeCallback(onCompleted);
        }

    }
    else {
        // no animations have to be executed.
        this._safeInvokeCallback(onCompleted);
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.renderItems = function(items) {
    /// <param name="items" type="Array"></param>
    /// <returns type="Array"></returns>
    Debug.assert(items != null, 'items');
    if ((!items.length) || !this._ownership) {
        // no need to reposition items, there are none.
        return [];
    }

    var elem = [];
    var len = items.length;
    for (var i = 0; i < len; i++) {
        var item = items[i];
        if (!item.isRendered) {
            // found an item that needs to be rendered, cool.
            this.renderItem(item);
            elem.push(item.element);
        }    
    }

    return elem;
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.renderItem = function(item) {
    /// <summary>
    ///     Renders a single item.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item to render.</param>
    Debug.assert(item != null, 'item != null');
    if (!item.isRendered) {
        if (!item.isStateApplied) {
            var itemState = this.stateItems;
            if (itemState != null) {
                // try to look up the item by ID, and then apply the position state if needed.
                var id = item.itemId;
                if (!Jx.isUndefined(itemState.i[id])) {
                    item.positionState = itemState.i[id];
                }            
            }        
        }

        item.load();
        item.render();
        var element = item.element;
        element.id = item.itemId;
        var style = element.style;
        if (item.isStateApplied && item.widthOverride === -1) {
            // now we rendered the item, reset the width.
            style.width = '';
        }

        // now that the item has been rendered, show it.
        style.display = '';
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.loadItem = function(item) {
    /// <summary>
    ///     Loads the markup/element for an item.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    Debug.assert(item != null, 'item != null');
    if (!item.isElementLoaded) {
        var element = null;
        if (this._stateManager.hasMarkupState) {
            // try to look up the existing element for this item.
            element = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this.viewportElement, item.itemId);
        }

        item.loadElement(element);
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.setViewportStyle = function(rows) {
    /// <summary>
    ///     Sets the viewport style.
    /// </summary>
    /// <param name="rows" type="Number" integer="true">The number of rows.</param>
    var style = this.viewportElement.style;
    if (rows === -1) {
        style['msGridRows'] = '';
    }
    else {
        style['msGridRows'] = '(' + (100 / rows) + '%)[' + rows + ']';
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._isAlive = function() {
    /// <returns type="Boolean"></returns>
    return !this._disposed && this._ownership;
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._sortItemsByIndex = function(items) {
    /// <param name="items" type="Array"></param>
    Debug.assert(items != null, 'items != null');
    items.sort(function(a, b) {
        return a.index - b.index;
    });
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._removeElements = function(elements) {
    /// <param name="elements" type="Array" elementType="Object" elementDomElement="true"></param>
    var element = this.viewportElement;
    for (var i = 0, len = elements.length; i < len; i++) {
        element.removeChild(elements[i]);
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._safeInvokeCallback = function(callback) {
    /// <param name="callback" type="Function"></param>
    if (callback != null) {
        callback();
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._updateItemIndices = function() {
    var items = this.items;
    for (var i = 0, len = items.length; i < len; i++) {
        items[i].index = i;
    }
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._renderItemsInViewInternal = function(items, offsetOverride) {
    /// <param name="items" type="Array"></param>
    /// <param name="offsetOverride" type="Number" integer="true"></param>
    /// <returns type="Array"></returns>
    Debug.assert(items != null, 'items != null');
    var viewportOffset = (offsetOverride !== -1) ? offsetOverride : this.viewportOffset;
    var viewportSize = this.viewportSize + 400;
    // get the current viewport position.
    var viewportEdge = viewportOffset + viewportSize;
    var list = this.items;
    var rendered = [];
    // first let's do a quick pass to render anything <= offset + size.
    var count = items.length;
    // if there is an offset override, which means we don't need to render all the way up to the offset.
    // instead we can virtualize to only render a little bit more than the current viewport initially.
    if (offsetOverride !== -1) {
        var renderStart = viewportOffset - viewportSize / 2;
        var renderEnd = viewportOffset + viewportSize;
        for (var n = 0; n < items.length; n++) {
            var item = items[n];
            if (!item.isRendered) {
                var offset = (item.isStateApplied) ? item.offset : this.getItemOffset(item);
                if (offset >= renderStart && offset <= renderEnd) {
                    // we need to render this item.
                    this.renderItem(item);
                    rendered.push(item);
                }            
            }        
        }

        return rendered;
    }

    var i = 0;
    for (; i < count; i++) {
        var item = items[i];
        if (!item.isRendered) {
            var offset = (item.isStateApplied) ? item.offset : this.getItemOffset(item);
            if (offset <= viewportEdge) {
                // we need to render this item.
                this.renderItem(item);
                rendered.push(item);
                continue;
            }        
        }

        break;
    }

    items.splice(0, i);
    return rendered;
};

People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype._renderItemsInViewNeighbours = function(items, offsetOverride) {
    /// <param name="items" type="Array"></param>
    /// <param name="offsetOverride" type="Number" integer="true"></param>
    /// <returns type="Array"></returns>
    Debug.assert(items != null, 'items != null');
    var rendered = [];
    var viewportOffset = (offsetOverride !== -1) ? offsetOverride : this.viewportOffset;
    var viewportSize = this.viewportSize + 400;

    // get the current viewport position.
    var viewportEdge = viewportOffset + viewportSize;

    for (var i = 0, len = items.length; i < len; i++) {
        var item = items[i];

        if (!item.isRendered) {
            var offset = (item.isStateApplied) ? item.offset : this.getItemOffset(item);
            if (offset <= viewportEdge) {
                // render this item.
                this.renderItem(item);

                rendered.push(item);
            }
        }
    }

    return rendered;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\..\..\Model\Configuration.js" />
/// <reference path="StackingListViewControl.js" />
/// <reference path="StackingListViewItem.js" />
/// <reference path="StackingListViewLayoutEngine.js" />
/// <reference path="StackingListViewStateManager.js" />

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine = function(control, data, settings, stateManager) {
    /// <summary>
    ///     Provides a layout engine for horizontal listviews.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Feed.StackingListViewControl">The control.</param>
    /// <param name="data" type="People.RecentActivity.UI.Feed.stackingListViewData">The data.</param>
    /// <param name="settings" type="People.RecentActivity.UI.Feed.stackingListViewSettings">The settings.</param>
    /// <param name="stateManager" type="People.RecentActivity.UI.Feed.StackingListViewStateManager">The state manager.</param>
    /// <field name="_rowHeight$1" type="Number" integer="true">The grid row height.</field>
    /// <field name="_map$1" type="Array">The map of items.</field>
    People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.call(this, control, data, settings, stateManager);

    // initialize the map of items.
    this._map$1 = [];
};

Jx.inherit(People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine, People.RecentActivity.UI.Feed.StackingListViewLayoutEngine);

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype._rowHeight$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype._map$1 = null;

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype, "viewportOffset", {
    get: function() {
        /// <summary>
        ///     Gets or sets the offset ("scroll position") of the viewport.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.element.scrollLeft;
    },
    set: function(value) {
        Jx.log.write(4, 'StackingListViewHorizontalLayoutEngine::ViewportOffset::set: ' + value);
        this.element.scrollLeft = value;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype, "viewportSize", {
    get: function() {
        /// <summary>
        ///     Gets the viewport size.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.element.clientWidth;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype, "rowHeight", {
    get: function() {
        /// <summary>
        ///     Gets the height of a grid row. It only makes sense in horizontal layout.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        if (!this._rowHeight$1) {
            this._rowHeight$1 = Math.floor(this.viewportElement.clientHeight / People.RecentActivity.Configuration.maxStackableEntries);
        }

        return this._rowHeight$1;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype, "scrollerSize", {
    get: function() {
        /// <summary>
        ///     Gets the size of the scroller.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.element.scrollWidth;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype, "lastItemIndex", {
    get: function() {
        /// <summary>
        ///     Gets the index of the last item in the list (visually).
        /// </summary>
        /// <value type="Number" integer="true"></value>
        // index into the last column, and fetch the index of the last item in the column.
        var items = this._map$1[this._map$1.length - 1];
        if (items && Boolean(items.length)) {
            return items[items.length - 1].index;
        }

        return -1;
    },
    configurable: true
});

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.getFirstItemInView = function(offset) {
    /// <summary>
    ///     Gets the first item in view.
    /// </summary>
    /// <param name="offset" type="Number">The offset to start at. Null, undefined and -1 will be ignored.</param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>

    // for each column, figure out if the first item in that column is in view.
    // we don't need to go over every single item, because if the first item in the column
    // is out of view, then anything stacked below it will be as well.
    if (Jx.isNullOrUndefined(offset) || (offset === -1)) {
        offset = this.viewportOffset;
    }

    for (var i = 1, len = this._map$1.length; i < len; i++) {
        var items = this._map$1[i];
        if (items != null) {
            var item = items[1];
            if (item != null && item.isRendered && item.offset + item.size >= offset) {
                // this item is in view, and it is the first one.
                return item;
            }
        }
    }

    return null;
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.getFirstItemInSection = function(item) {
    /// <summary>
    ///     Gets the first item in the section.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
    Debug.assert(item != null, 'item != null');

    // simply index into the map, couldn't be easier!
    var items = this._map$1[item.column];
    return (items != null) ? items[1] : null;
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._map$1 = null;

    People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.onUpdateScrollPoints = function() {
    /// <summary>
    ///     Occurs when the scroll points need to be updated.
    /// </summary>
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIUpdateSnapListStart);

    // for each column, add a snap point.
    var points = [];
    for (var i = 1, len = this._map$1.length; i < len; i++) {
        var items = this._map$1[i];
        if (items != null) {
            // find the first non-null item in the column.
            for (var j = 1; j < items.length; j++) {
                if (items[j] != null) {
                    points.push(items[j].offset);
                    break;
                }            
            }        
        }    
    }

    // set the snap list once we're done.
    var element = this.element;
    element.style['msScrollSnapPointsX'] = 'snapList(' + points.join('px, ') + 'px)';
    element.style['msScrollSnapPointsY'] = '';

    Jx.log.write(4, points.join(','));

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIUpdateSnapListStop);
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.onUpdateAriaAttributes = function() {
    /// <summary>
    ///     Occurs when the ARIA attributes need to be updated.
    /// </summary>
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIUpdateAriaStart);

    for (var i = 1, len = this._map$1.length, set = this.items.length, pos = 1; i < len; i++) {
        // for each item in this column, update the flow-to, flow-from, setsize and posinset.
        var items = this._map$1[i];
        if (items != null) {
            for (var j = 1, len2 = items.length; j < len2; j++) {
                var item = items[j];
                if ((item != null) && item.isRendered && !item.isDisposed) {
                    var prev = this.getPreviousItem(item);
                    var next = this.getNextItem(item);
                    item.flowFrom = (prev != null && !prev.isDisposed) ? prev.id : null;
                    item.flowTo = (next != null && !next.isDisposed) ? next.id : null;
                    item.setPosition = pos++;
                    item.setSize = set;
                }            
            }        
        }    
    }

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIUpdateAriaStop);
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.onLayoutForced = function() {
    /// <summary>
    ///     Occurs when the layout is being forced.
    /// </summary>
    // we changed from landscape to portrait or vice versa.
    if (Windows.UI.ViewManagement.ApplicationView.value !== this.layoutState) {
        // we need to save the state.
        this.stateManager.setItemState(this.getItemState(false));
        this.stateManager.setListViewState(this.getState());
        this.layoutState = Windows.UI.ViewManagement.ApplicationView.value;
    }

    Jx.log.write(4, 'StackingListViewHorizontalLayoutEngine::OnLayoutForced(), window.screen.height=' + window.screen.height);

    this.setViewportStyle(People.RecentActivity.Configuration.maxStackableEntries);

    People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.onLayoutForced.call(this);
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.onOwnershipTaken = function() {
    /// <summary>
    ///     Occurs when the layout engine has taken ownership.
    /// </summary>
    // update the viewport state.
    this.setViewportStyle(People.RecentActivity.Configuration.maxStackableEntries);

    People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.onOwnershipTaken.call(this);
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.getItemOffset = function(item) {
    /// <summary>
    ///     Gets an item offset.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <returns type="Number" integer="true"></returns>
    Debug.assert(item != null, 'item != null');

    var element = item.element;
    var oldDisplay = element.style.display;
    element.style.display = '';
    var offset = item.element.offsetLeft;
    element.style.display = oldDisplay;
    return offset;
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.getPreviousItem = function(item) {
    /// <summary>
    ///     Gets the item that is visually placed before the given item.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
    Debug.assert(item != null, 'item != null');

    if ((!item.index) || ((item.column === 1) && (item.row === 1))) {
        // there is no previous item, the first item will always be... the first item.
        return null;
    }

    if (item.row === 1) {
        // we need to get the last item in the previous column.
        var items = this._map$1[item.column - 1];
        return (items != null) ? items[items.length - 1] : null;
    }
    else {
        return this._getSiblingFromMap$1(this._map$1[item.column], item.row - 1, -1);
    }
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.getNextItem = function(item) {
    /// <summary>
    ///     Gets the item that is visually placed after the given item.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
    Debug.assert(item != null, 'item != null');

    // figure out if this is the last item in the column.
    var items = this._map$1[item.column];
    if (items != null) {
        var row = item.row + item.rowSpan;
        if (items.length > row) {
            // we've found our next sibling.
            return items[row];
        }

        var col = item.column + 1;
        if (this._map$1.length > col) {
            // we've found the next sibling at the top of the next column.
            var column = this._map$1[col];
            if (column != null) {
                return column[1];
            }        
        }    
    }

    return null;
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.repositionItemsWithoutStacking = function() {
    /// <summary>
    ///     Repositions all the items, ignoring stacking.
    /// </summary>
    var rows = People.RecentActivity.Configuration.maxStackableEntries;
    var list = this.items;
    for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i];
        item.column = i + 1;
        item.row = 1;
        item.rowSpan = rows;
        item.stackingState = 0;
        item.widthOverride = -1;
    }
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.onLayoutInitialized = function() {
    /// <summary>
    ///     Called when the layout is initialized.
    /// </summary>
    var scrollPosition = this.stateManager.getScrollPosition();

    Jx.log.write(4, 'StackingListViewHorizontalLayoutEngine::OnLayoutInitialized(' + scrollPosition + ')');

    for (var n = 0, coll = this.items; n < coll.length; n++) {
        var item = coll[n];
        var style = item.element.style;

        // if scrollPosition is not -1, which means we have a scroll position to restore, so we will virtualize the listview.
        if (item.isStateApplied && scrollPosition !== -1) {
            if (item.widthOverride === -1 && !item.hasImplicitWidth) {
                if (item.size !== 0) {
                    // if the item's width is not defined through css, we need to set it here to let it take up the space it should.
                    style.width = item.size + 'px';
                }

                // mark it ready for stacking since even though the item is not rendered, but we know its size.
                item.isReadyForStacking = true;
            }

        }
        else {
            // if we don't virtualize, we just make display none.
            style.display = 'none';
        }    
    }
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype.repositionItems = function(start, end) {
    /// <summary>
    ///     Repositions all the items starting at a specified index and ending at a specified index.
    /// </summary>
    /// <param name="start" type="Number" integer="true">The start.</param>
    /// <param name="end" type="Number" integer="true">The end.</param>
    /// <returns type="Array" elementType="Object" elementDomElement="true"></returns>
    Debug.assert(start >= 0, 'start >= 0');

    Jx.log.write(4, People.Social.format('StackingListViewHorizontalLayoutEngine::RepositionItems(start:{0}, end:{1})', start, end));
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIRepositionItemsStart);

    var list = this.items;
    var count = list.length;

    if ((!count) || !this.hasOwnership) {
        // if there are no items, or if we don't own the layout, bail out.
        People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIRepositionItemsStop);

        // clear out the map
        this._map$1.length = 0;

        return new Array(0);
    }

    // set up the start variables -- col is the column, pos is the position in the set, etc.
    var col = 1;
    var max = People.RecentActivity.Configuration.maxStackableEntries;

    if (!!start) {
        // we're not starting from the beginning of the list, so figure out the first 
        // item in the column and adjust the column, position, etc. accordingly.
        var first = this.getFirstItemInSection(list[start]);
        if (first != null) {
            start = first.index;
            col = list[start].column;
        }
        else {
            // just start from the beginning of the list.
            start = 0;
        }    
    }

    // keep a list of items we've already positioned.
    var processed = {};

    // the items having states but still need neighbors, for those items, we don't want them to change positions. (moved to be other items' neighbor)
    var needsNeighbors = {};

    // check to see if we can reposition items using existing state.
    var state = this.stateItems;
    if (state != null) {
        if (this._repositionItemsWithState$1(start, end, col, max, state, processed, needsNeighbors)) {
            Jx.log.write(4, 'StackingListViewHorizontalLayoutEngine::RepositionItems::RepositionItemsWithState == true');
            People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIRepositionItemsStop);
            return new Array(0);
        }    
    }

    // keep a list of all the elements we've repositioned.
    var changes = [];
    var batch = 50;

    // if the number of items between start and end is more than batch count (50), we won't pull in the neighbor 
    // from the next batch. batchStart is the index of the first item in the batch we will start positioning.
    var batchStart = Math.ceil(start / batch) * batch;

    for (var i = start; i <= end; i++) {
        var current = list[i];

        if ((!!start) && (current.column > 0) && (current.column < col)) {
            // if we're not starting from the beginning and the item is already positioned elsewhere, we should skip this processed.
            continue;
        }

        if (!Jx.isUndefined(processed[current.itemId])) {
            // we've already processed the item.
            if (current.column > col) {
                // it is possible items in front of this were pulled into columns earlier in the feed. that means that there is 
                // now a gap between this item and the previous item. to correct this, we need to pull everything in this column forward.
                var itemsInColumn = this._map$1[current.column];

                for (var j = 1, len = itemsInColumn.length; j < len; j++) {
                    // indices will be undefined if there are items that span multiple rows, so...
                    var itemInColumn = itemsInColumn[j];
                    if (itemInColumn) {
                        // update the column, flag the item as have been repositioned.
                        itemInColumn.isRepositioned = true;
                        itemInColumn.column = col;

                        // keep track that this item was moved.
                        changes.push(itemsInColumn[j].element);
                    }
                }
            }

            if (current.column >= col) {
                // now that we're all settled in, move on to the next column. don't do this for items that have been 
                // procesed and were pulled in earlier in the feed (i.e. current.column < col)
                col++;
            }

            continue;
        }

        // alright, update the state of the item!
        var element = current.element;

        if ((col !== current.column) || (1 !== current.row)) {
            changes.push(element);
        }

        current.isRepositioned = true;
        current.column = col;
        current.row = 1;
        current.widthOverride = -1;
        current.offset = element.offsetLeft;
        current.size = current.contentWidthPixels;

        // whatever happens, this item has been processed.
        processed[current.itemId] = current;

        // check to see if this item is stackable, and if so, find neighbours.
        var stackable = false;

        if (current.isReadyForStacking) {
            // if current is not loaded, this item is already virtualized, so just get the current row span.
            var rows = (current.isLoaded) ? current.contentHeight : current.rowSpan;
            var rowsAvailable = max - rows;

            if (rowsAvailable > 0) {
                stackable = true;

                // this item can be stacked, so find a list of neighbours for the current item. note that we 
                // reposition items as we go along -- this avoids having to loop too many times.
                var neighbours = [];
                    neighbours.push(current);

                var width = current.size;
                var neighbourWidthMax = width;
                var neighbourWidthMin = neighbourWidthMax;
                var neighbourColumn = 0;
                var neighbourRow = 0;
                var neighbourRowSpan = 0;

                // batchEnd is the last item in the same batch with item i.
                var batchEnd = (i <= batchStart) ? (batchStart + batch - 1) : (Math.ceil(i / batch) * batch) - 1;
                    batchEnd = Math.min(batchEnd, end);

                for (var j = i + 1; (j <= batchEnd) && (rowsAvailable > 0) ; j++) {
                    var candidate = list[j];
                    var id = candidate.itemId;

                    if (!candidate.isReadyForStacking || !Jx.isUndefined(processed[id]) || (!Jx.isUndefined(needsNeighbors[id]) && current.column !== candidate.column) || ((!!start) && (candidate.column > 0) && (candidate.column < col)) || !current.acceptsNeighbour(candidate)) {
                        // this candidate needs to be skipped as it does not meet our stringent quality bar:
                        // a) The candidate has to be ready to be stacked (obviously)
                        // b) The candidate must not have been processed yet (i.e. it was moved elsewhere)
                        // c) The candidate must not be looking for neighbors -- i.e. if the column the candidate is currently in is not entirely filled, it should stay put
                        // d) The candidate must not be positioned earlier in the list (i.e. once it has been pulled in, it cannot be pulled back in this loop).
                        // e) The current item must accept the neighbour. This is a custom check, but is currently only used to make sure items from e.g. a year ago aren't pulled in.
                        continue;
                    }

                    var rowsCandidate = (candidate.isLoaded) ? candidate.contentHeight : candidate.rowSpan;
                    if (rowsCandidate > rowsAvailable) {
                        // this candidate is too tall, so skip it.
                        continue;
                    }

                    // alright, we got ourselves a new neighbour. update the position of the next item.
                    // we temporarily store the old rowspan, such that for the last neighbour we find we can determine
                    // if the rowspan really changed or not -- if not, we can remove the item from the "changes" list.
                    neighbourColumn = candidate.column;
                    neighbourRow = candidate.row;
                    neighbourRowSpan = candidate.rowSpan;

                    if ((candidate.column !== col) || (candidate.row !== max - rowsAvailable + 1) || (candidate.rowSpan !== rowsCandidate)) {
                        changes.push(candidate.element);
                    }

                    candidate.isRepositioned = true;
                    candidate.column = col;
                    candidate.row = max - rowsAvailable + 1;
                    candidate.rowSpan = rowsCandidate;
                    candidate.stackingState = 1;
                    candidate.widthOverride = -1;

                    // subtract the available rows
                    rowsAvailable -= rowsCandidate;

                    // mark the item as having been processed.
                    processed[candidate.itemId] = candidate;

                    // figure out the maximum width.
                    candidate.size = width = candidate.contentWidthPixels;
                    candidate.offset = current.offset;
                    neighbourWidthMax = Math.max(neighbourWidthMax, width);
                    neighbourWidthMin = Math.min(neighbourWidthMin, width);
                    neighbours.push(candidate);
                }

                if (neighbours.length !== 1) {
                    // update the rowspan and state of the first item.
                    if (current.rowSpan !== rows) {
                        changes.push(element);
                    }

                    current.rowSpan = rows;
                    current.stackingState = 1;

                    // we might also have more space available so add the remaining rows to the last item.
                    if (rowsAvailable > 0) {
                        var tail = neighbours[neighbours.length - 1];
                            tail.rowSpan = tail.rowSpan + rowsAvailable;

                        // if the only thing that changed previously was the rowspan of this item, then we should
                        // remove the item from the list of changes, as it is in exactly the same state it was before.
                        if ((neighbourColumn === tail.column) && (neighbourRow === tail.row) && (neighbourRowSpan === tail.rowSpan)) {
                            changes.splice(changes.indexOf(tail.element), 1);
                        }                    
                    }

                    if (neighbourWidthMax !== neighbourWidthMin) {
                        // we found items that need to get a different width, so override the width on the current column.
                        for (var k = 0, len = neighbours.length; k < len; k++) {
                            neighbours[k].size = neighbours[k].widthOverride = neighbourWidthMax;
                        }                    
                    }

                    // we found neighbours, which means we're done here.
                    col++;

                    continue;
                }            
            }        
        }

        // if we're still here it means the item cannot be stacked.
        if (current.rowSpan !== max) {
            changes.push(element);
        }

        current.rowSpan = max;

        if (stackable) {
            // the item is stackable, but we just didn't find any neighbours.
            current.stackingState = 1;
        }
        else if (current.isReadyForStacking) {
            // the item is not stackable, but did indicate it is ready for stacking -- i.e. it has a known height, etc.
            current.stackingState = 2;
        }
        else {
            // the item is in an unknown state.
            current.stackingState = 0;
        }

        // increment the column.
        col++;
    }

    // we're done, write a quick fake ETW event and return the updated elements.
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIRepositionItemsStop);
    // update the stuff in the map.
    this._repositionItemsInMap$1();
    return changes;
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype._repositionItemsWithState$1 = function(start, end, col, maxRows, state, processed, needsNeighbors) {
    /// <param name="start" type="Number" integer="true"></param>
    /// <param name="end" type="Number" integer="true"></param>
    /// <param name="col" type="Number" integer="true"></param>
    /// <param name="maxRows" type="Number" integer="true"></param>
    /// <param name="state" type="People.RecentActivity.UI.Feed.stackingListViewItemState"></param>
    /// <param name="processed" type="Object"></param>
    /// <param name="needsNeighbors" type="Object"></param>
    /// <returns type="Boolean"></returns>
    Jx.log.write(4, 'StackingListViewHorizontalLayoutEngine::RepositionItemsWithState(' + start + ', ' + end + ')');

    var itemsWithState = 0;
    var list = this.items;

    for (var i = start; i <= end; i++) {
        // check to see if we have state for this specific item.
        var current = list[i];
        var id = current.itemId;
        if (!Jx.isUndefined(state.i[id])) {
            if (!current.isStateApplied) {
                // apply the position state to the item.
                current.positionState = state.i[id];
            }

            itemsWithState++;

            // if we don't start from beginning, col is the column we start with, for anything in this column, even if it has states,
            // we won't mark it as processed.
            if ((!start) || (current.column !== col)) {
                if (current.stackingState === 2) {
                    // if the item is unstackable, then it means it has most definitely been processed.
                    processed[id] = current;
                }
                else if ((current.stackingState === 1) && (!current.isLoaded || !current.isReadyForStacking || (current.contentHeight === current.rowSpan))) {
                    // if the item is stackable, sometimes it still needs to participate in repositioning -- for example, its possible
                    // to have an item which could have neighbours, if only we had rendered a few more items (the ContentHeight == RowSpan check).
                    // HOWEVER, this is negated by one very important condition: if the item has not been loaded yet, or has indicated
                    // it is not yet ready for stacking, then the value returned by ContentHeight will be inaccurate, and thus the
                    // ContentHeight == RowSpan check cannot be trusted. in this case, we happily pretend the item has been processed, until
                    // we hit a RenderBatch or RenderItemsInView code path which ensures the item has been rendered.
                    processed[id] = current;
                }
                else if (!!current.stackingState) {
                    needsNeighbors[id] = current;
                }            
            }

        }
        else {
            break;
        }    
    }

    // update map with positions of current items.
    this._repositionItemsInMap$1();

    for (var i = 1; i < this._map$1.length; i++) {
        var column = this._map$1[i];
        if (column != null) {
            // figure out the total number of rows taken by the items in this column.
            var rows = 0;
            for (var j = 1; j < column.length; j++) {
                var item = column[j];
                if (item != null) {
                    rows += item.rowSpan;
                }            
            }

            if (rows !== maxRows) {
                // something is wrong with this column.
                Jx.log.write(4, 'StackingListViewHorizontalLayoutEngine::RepositionItemsWithState::RemoveColumnItems(' + rows + ' != ' + maxRows + ')');
                this._removeColumnItems$1(processed, i);
            }        
        }    
    }

    // if not all items were repositioned, we need to go through the list of items that need neighbours, and mark 
    // each item in the column of one of those items as "not processed". seperately, each of these items in the column
    // should be marked as needsNeighbours as well -- usually only the last item in the list will be marked as such, 
    // sometimes causing the other items in the column to be pulled in earlier in the feed, orphaning the last item
    // in the current column, never to be repositioned again, and causing gaps in the feed.
    var removedNeighbours = 0;
    for (var k in needsNeighbors) {
        var kvp = { key: k, value: needsNeighbors[k] };
        var removed = this._removeColumnItems$1(processed, kvp.value.column);
        for (var i = 0, len = removed.length; i < len; i++) {
            var item = removed[i];
            needsNeighbors[item.itemId] = item;
        }

        removedNeighbours += removed.length;
    }

    if (removedNeighbours > 0) {
        Jx.log.write(4, 'StackingListViewHorizontalLayoutEngine::RepositionItemsWithState::RemoveColumnItems(neighbors, removed=' + removedNeighbours + ')');
    }

    return Object.keys(processed).length === end - start + 1;
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype._removeColumnItems$1 = function(processed, col) {
    /// <param name="processed" type="Object"></param>
    /// <param name="col" type="Number" integer="true"></param>
    /// <returns type="Array"></returns>
    var removed = [];
    var column = this._map$1[col];
    if (column != null) {
        for (var i = 1; i < column.length; i++) {
            var item = column[i];
            if (item != null) {
                delete processed[item.itemId];
                removed.push(item);
            }        
        }    
    }

    return removed;
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype._repositionItemsInMap$1 = function() {
    // first clear out the map so we can rebuild it.
    this._map$1.length = 0;
    var list = this.items;

    for (var i = 0, count = list.length; i < count; i++) {
        var item = list[i];
        var column = item.column;
        var row = item.row;
        var items = this._map$1[column];
        if (items == null) {
            // this row has not yet been defined.
            items = this._map$1[column] = [];
        }

        items[row] = item;
    }
};

People.RecentActivity.UI.Feed.StackingListViewHorizontalLayoutEngine.prototype._getSiblingFromMap$1 = function(items, start, jump) {
    /// <param name="items" type="Array"></param>
    /// <param name="start" type="Number" integer="true"></param>
    /// <param name="jump" type="Number" integer="true"></param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
    if (items != null) {
        for (; (start > 0) && (start < items.length) && (items[start] == null); start += jump) {
        }

        return items[start];
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Controls\Control.js" />
/// <reference path="..\..\..\Core\Helpers\AriaHelper.js" />
/// <reference path="StackingListViewControl.js" />
/// <reference path="StackingListViewOrientation.js" />
/// <reference path="StackingListViewPositionState.js" />
/// <reference path="StackingListViewStackingState.js" />

People.RecentActivity.UI.Feed.StackingListViewItem = function(element) {
    /// <summary>
    ///     Provides a simple listview item.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <field name="_index$1" type="Number" integer="true">The index of the item.</field>
    /// <field name="_loaded$1" type="Boolean">Whether the item has been loaded.</field>
    /// <field name="_loadedElement$1" type="Boolean">Whether the item's element has been loaded.</field>
    /// <field name="_orientation$1" type="People.RecentActivity.UI.Feed.StackingListViewOrientation">The orientation.</field>
    /// <field name="_stackingState$1" type="People.RecentActivity.UI.Feed.StackingListViewStackingState">The state.</field>
    /// <field name="_row$1" type="Number" integer="true">The row position.</field>
    /// <field name="_column$1" type="Number" integer="true">The column position.</field>
    /// <field name="_rowSpan$1" type="Number" integer="true">The row span.</field>
    /// <field name="_isReadyForStacking$1" type="Boolean">Whether the item is ready for stacking.</field>
    /// <field name="_widthOverride$1" type="Number" integer="true">The width override, if needed.</field>
    /// <field name="_setPosition$1" type="Number" integer="true">The position in the set.</field>
    /// <field name="_setSize$1" type="Number" integer="true">The size of the set.</field>
    /// <field name="_flowFrom$1" type="String">The flow-from.</field>
    /// <field name="_flowTo$1" type="String">The flow-to.</field>
    /// <field name="_owner$1" type="People.RecentActivity.UI.Feed.StackingListViewControl">The owner list view control.</field>
    /// <field name="_size$1" type="Number" integer="true">The actual size of the item. (e.g. width in horizontal, and height in vertical.)</field>
    /// <field name="_offset$1" type="Number" integer="true">The offset position of the item.</field>
    /// <field name="_isStateApplied$1" type="Boolean">Whether the item has state applied.</field>
    /// <field name="_isRepositioned$1" type="Boolean">Whether the item has been repositioned.</field>
    this._widthOverride$1 = -1;
    People.RecentActivity.UI.Core.Control.call(this, element);
};

Jx.inherit(People.RecentActivity.UI.Feed.StackingListViewItem, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Feed.StackingListViewItem.prototype._index$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._loaded$1 = false;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._loadedElement$1 = false;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._orientation$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._stackingState$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._row$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._column$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._rowSpan$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._isReadyForStacking$1 = false;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._setPosition$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._setSize$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._flowFrom$1 = null;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._flowTo$1 = null;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._owner$1 = null;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._size$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._offset$1 = 0;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._isStateApplied$1 = false;
People.RecentActivity.UI.Feed.StackingListViewItem.prototype._isRepositioned$1 = false;

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "isReadyForStacking", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether this item is ready for stacking.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isReadyForStacking$1;
    },
    set: function(value) {
        this._isReadyForStacking$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "orientation", {
    get: function() {
        /// <summary>
        ///     Gets the orientation.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.StackingListViewOrientation"></value>
        return this._orientation$1;
    },
    set: function(value) {
        if (value !== this._orientation$1) {
            this._orientation$1 = value;
            this.onOrientationChanged();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "stackingState", {
    get: function() {
        /// <summary>
        ///     Gets the stacking state.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.StackingListViewStackingState"></value>
        return this._stackingState$1;
    },
    set: function(value) {
        if (value !== this._stackingState$1) {
            this._stackingState$1 = value;
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "owner", {
    get: function() {
        /// <summary>
        ///     Gets or sets the owner list view control.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.StackingListViewControl"></value>
        return this._owner$1;
    },
    set: function(value) {
        this._owner$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "row", {
    get: function() {
        /// <summary>
        ///     Gets or sets the row position.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._row$1;
    },
    set: function(value) {
        if (value !== this._row$1) {
            this._row$1 = value;
            this.element.style['msGridRow'] = value.toString();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "rowSpan", {
    get: function() {
        /// <summary>
        ///     Gets or sets the row span.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._rowSpan$1;
    },
    set: function(value) {
        if (value !== this._rowSpan$1) {
            this._rowSpan$1 = value;
            this.element.style['msGridRowSpan'] = value.toString();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "column", {
    get: function() {
        /// <summary>
        ///     Gets or sets the column position.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._column$1;
    },
    set: function(value) {
        if (value !== this._column$1) {
            this._column$1 = value;
            this.element.style['msGridColumn'] = value.toString();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "isElementLoaded", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the element was loaded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._loadedElement$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "isLoaded", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the item was loaded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._loaded$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "flowFrom", {
    get: function() {
        /// <summary>
        ///     Gets or sets the ARIA flow-from attribute.
        /// </summary>
        /// <value type="String"></value>
        return this._flowFrom$1;
    },
    set: function(value) {
        if (value !== this._flowFrom$1) {
            this._flowFrom$1 = value;
            People.RecentActivity.UI.Core.AriaHelper.setFlowFrom(this.element, value);
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "flowTo", {
    get: function() {
        /// <summary>
        ///     Gets or sets the ARIA flow-to attribute.
        /// </summary>
        /// <value type="String"></value>
        return this._flowTo$1;
    },
    set: function(value) {
        if (value !== this._flowTo$1) {
            this._flowTo$1 = value;
            People.RecentActivity.UI.Core.AriaHelper.setFlowTo(this.element, value);
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "setPosition", {
    get: function() {
        /// <summary>
        ///     Gets or sets the position of the item in the set.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._setPosition$1;
    },
    set: function(value) {
        if (value !== this._setPosition$1) {
            this._setPosition$1 = value;
            People.RecentActivity.UI.Core.AriaHelper.setPositionInSet(this.element, value);
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "setSize", {
    get: function() {
        /// <summary>
        ///     Gets or sets the set size this item belongs to.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._setSize$1;
    },
    set: function(value) {
        if (value !== this._setSize$1) {
            this._setSize$1 = value;
            People.RecentActivity.UI.Core.AriaHelper.setSetSize(this.element, value);
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "widthOverride", {
    get: function() {
        /// <summary>
        ///     Gets or sets the width override.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._widthOverride$1;
    },
    set: function(value) {
        this._widthOverride$1 = value;

        if (this._loaded$1 || (value !== -1)) {
            // set the width override -- for -1 just unset the width.
            var style = this.element.style;
                style.width = (value === -1) ? '' : value + 'px';
        }
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "index", {
    get: function() {
        /// <summary>
        ///     Gets or sets the index of the item.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._index$1;
    },
    set: function(value) {
        this._index$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "size", {
    get: function() {
        /// <summary>
        ///     Gets or sets the size.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._size$1;
    },
    set: function(value) {
        this._size$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "offset", {
    get: function() {
        /// <summary>
        ///     Gets or sets the offset.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._offset$1;
    },
    set: function(value) {
        this._offset$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "isStateApplied", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the item has stated applied.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isStateApplied$1;
    },
    set: function(value) {
        this._isStateApplied$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "isRepositioned", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the item has been repositioned.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isRepositioned$1;
    },
    set: function(value) {
        this._isRepositioned$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewItem.prototype, "positionState", {
    get: function() {
        /// <summary>
        ///     Gets the position state.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.stackingListViewPositionState"></value>
        return People.RecentActivity.UI.Feed.create_stackingListViewPositionState(this._column$1, this._row$1, this._rowSpan$1, this._widthOverride$1, this._size$1, this._offset$1, this._stackingState$1, (this._isReadyForStacking$1) ? this.getState() : null);
    },
    set: function(value) {
        if (value != null) {
            this._stackingState$1 = value.p;
            this.widthOverride = value.w;
            // ignore the row and column of the item if they've already participated in a reposition loop -- its possible
            // we call RenderItem() after a RepositionItems() loop, and we definitely don't want to overwrite these values.
            if (!this._isRepositioned$1) {
                this.row = value.r;
                if (!this._owner$1.orientation) {
                    // apply the column and rowspan only if we're in a horizontal layout (they have no meaning in vertical)
                    this.column = value.c;
                    this.rowSpan = value.s;
                }

                this._offset$1 = value.o;
            }

            // the size is still valid, regardless of whether we've been repositioned.
            this._size$1 = value.z;
            // apply the state the item saved, if any.
            if (value.i != null) {
                this._isReadyForStacking$1 = true;
                this.setState(value.i);
            }

            this._isStateApplied$1 = true;
        }
        else {
            this._widthOverride$1 = -1;
            var elementStyle = this.element.style;
            // reset the width and height.
            elementStyle.width = '';
            elementStyle.height = '';
            this._isStateApplied$1 = false;
            // clear out the item specific state.
            this.setState(null);
        }

    }
});

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.acceptsNeighbour = function(neighbour) {
    /// <summary>
    ///     Returns a value based on whether the given control can be a neighbour of the current control.
    /// </summary>
    /// <param name="neighbour" type="People.RecentActivity.UI.Feed.StackingListViewItem">The neighbour.</param>
    /// <returns type="Boolean"></returns>
    return true;
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.loadElement = function(element) {
    /// <summary>
    ///     Loads the element for the item.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element for the item, if one has been cached.</param>
    if (!this._loadedElement$1) {
        this._loadedElement$1 = true;
        this.onLoadElement(element);
    }
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.load = function() {
    /// <summary>
    ///     Loads the item, ensuring it has an element and width.
    /// </summary>
    if (!this._loaded$1) {
        this._loaded$1 = true;
        this.onLoad();
    }
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.resize = function() {
    /// <summary>
    ///     Forces the item to re-layout its content based on new screen size.
    /// </summary>
    this.onResized();
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.getState = function() {
    /// <summary>
    ///     Gets the state of the item.
    /// </summary>
    /// <returns type="Object"></returns>
    return null;
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.setState = function(state) {
    /// <summary>
    ///     Sets the state of the item.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.onLoad = function() {
    /// <summary>
    ///     Occurs when the item should be loaded.
    /// </summary>

    if (this._widthOverride$1 === -1) {
        // unset the width now that we've been loaded.
        this.element.style.width = '';
    }
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.onLoadElement = function(element) {
    /// <summary>
    ///     Occurs when the item's element should be loaded. By the end of this method,
    ///     the item should have an element.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element for the item, if it has been cached, <c>null</c> otherwise. May be ignored.</param>
    // make sure the element has a fixed ID.
    this.id = this.itemId;
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.onOrientationChanged = function() {
    /// <summary>
    ///     Occurs when the orientation has changed.
    /// </summary>
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.onReadyForStacking = function() {
    /// <summary>
    ///     Occurs when the item is ready for stacking.
    /// </summary>
    this._isReadyForStacking$1 = true;
};

People.RecentActivity.UI.Feed.StackingListViewItem.prototype.onResized = function() {
    /// <summary>
    ///     Occurs when the item needs to be resized.
    /// </summary>
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\EventManager.js" />
/// <reference path="..\..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="StackingListViewControl.js" />
/// <reference path="StackingListViewItem.js" />

People.RecentActivity.UI.Feed.StackingListViewInputHandler = function(control, data) {
    /// <summary>
    ///     Provides the keyboard and mouse handler for a <see cref="T:People.RecentActivity.UI.Feed.StackingListViewControl" />.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Feed.StackingListViewControl">The control.</param>
    /// <param name="data" type="People.RecentActivity.UI.Feed.stackingListViewData">The data.</param>
    /// <field name="_data" type="People.RecentActivity.UI.Feed.stackingListViewData">The data.</field>
    /// <field name="_control" type="People.RecentActivity.UI.Feed.StackingListViewControl">The control.</field>
    /// <field name="_activeItem" type="People.RecentActivity.UI.Feed.StackingListViewItem">The active item.</field>
    /// <field name="_disposed" type="Boolean">Whether the instance has been disposed.</field>
    Debug.assert(control != null, 'control != null');
    Debug.assert(data != null, 'data != null');
    this._control = control;
    this._data = data;
    People.RecentActivity.UI.Core.EventManager.events.addListener("documentkeydown", this._onKeyDown, this);
};


People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype._data = null;
People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype._control = null;
People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype._activeItem = null;
People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype._disposed = false;

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype, "activeItem", {
    get: function() {
        /// <summary>
        ///     Gets or sets the active item.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.StackingListViewItem"></value>
        return this._activeItem;
    },
    set: function(value) {
        if (value !== this._activeItem) {
            if ((this._activeItem != null) && !this._activeItem.isDisposed) {
                // remove the tab index of the current item, if its still around.
                this._activeItem.tabIndex = -1;
            }

            this._activeItem = value;
            if ((this._activeItem != null) && !this._activeItem.isDisposed) {
                // set the new tab index.
                this._activeItem.tabIndex = 0;
            }        
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype, "activeItemIndex", {
    get: function() {
        /// <summary>
        ///     Gets the index of the active item.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._data.items.indexOf(this._activeItem);
    },
    set: function(value) {
        if (value === -1) {
            this.activeItem = null;
        }
        else {
            Debug.assert(value >= 0, 'value >= 0');
            Debug.assert(value < this._data.items.length, 'value < this.data.Items.Count');
            this.activeItem = this._data.items[value];
        }

    }
});

People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (!this._disposed) {
        this._disposed = true;
        // detach keyboard event handlers
        People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("documentkeydown", this._onKeyDown, this);
        // detach events and animations from items.
        this._detachEvents(this._data.items);
        this._control = null;
        this._activeItem = null;
    }
};

People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype.add = function(items) {
    /// <param name="items" type="Array"></param>
    var that = this;
    
    Debug.assert(items != null, 'items != null');
    items.forEach(function(item) {
        item.role = 'option';
        var handler = function() {
            // set the current item as the active item.
            that.activeItem = item;
        };
        item.attach('focus', handler);
        item.attach('click', handler);
    });
    if (this._activeItem == null) {
        // the first item should receive a tab index.
        var list = this._data.items;
        if (list.length > 0) {
            this.activeItem = list[0];
        }    
    }
};

People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype.remove = function(items) {
    /// <param name="items" type="Array"></param>
    Debug.assert(items != null, 'items != null');
    if ((items.indexOf(this._activeItem) !== -1)) {
        // if the active item is in the removed bunch, update the active item/index.
        var list = this._data.items;
        this.activeItem = (list.length > 0) ? list[0] : null;
    }

    this._detachEvents(items);
};

People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype._detachEvents = function(items) {
    /// <param name="items" type="Array"></param>
    Debug.assert(items != null, 'items != null');
    for (var i = 0, len = items.length; i < len; i++) {
        items[i].detach('focus');
        items[i].detach('click');
    }
};

People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype._safeSetActiveItemIndex = function(index, ev) {
    /// <param name="index" type="Number" integer="true"></param>
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    var items = this._data.items;
    // sanitize the index.
    index = Math.min(Math.max(0, index), items.length - 1);
    var item = items[index];
    // focus on the element.
    item.tabIndex = 0;
    item.focus();
    // prevent the default action (i.e. scrolling)
    ev.preventDefault();
};

People.RecentActivity.UI.Feed.StackingListViewInputHandler.prototype._onKeyDown = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    // defaultPrevented is not exported in Script#'s import of the Event object.
    // note the use of {0} so we don't have to worry about variable minimization.
    if (ev.defaultPrevented) {
        return;
    }

    var items = this._data.items;
    if (!items.length) {
        // no point in doing anything, there are no items.
        return;
    }

    if (this._control._isClickEatingDivVisible()) {
        // ignore this when there's a click-eating div.
        return;
    }

    // check for the cheap keys first, of course.
    switch (ev.keyCode) {
        case WinJS.Utilities.Key.home:
            this._safeSetActiveItemIndex(0, ev);
            return;
        case WinJS.Utilities.Key.end:
            this._safeSetActiveItemIndex(this._control.lastItemIndex, ev);
            return;
    }

    // figure out what the next and previous elements are.
    var next = null;
    var prev = null;
    if (this._activeItem != null) {
        if (this._activeItem.isActive) {
            // get the next/previous elements for this item.
            next = this._control.getNextItem(this._activeItem);
            prev = this._control.getPreviousItem(this._activeItem);
        }
        else {
            // the "next" and "previous" elements are the current one.
            next = prev = this._activeItem;
        }

    }
    else {
        // the "next" and "prev" items are the first item (this happens when we haven't put focus
        // on an element yet, and the first keystroke should focus on the first element in the list)
        next = prev = items[0];
    }

    if ((next !== prev) && People.RecentActivity.UI.Core.HtmlHelper.isRightToLeft) {
        // in RTL the ordering is reversed, of course.
        var temp = next;
        next = prev;
        prev = temp;
    }

    var focus = null;
    switch (ev.keyCode) {
        case WinJS.Utilities.Key.leftArrow:
        case WinJS.Utilities.Key.upArrow:
            focus = prev;
            break;
        case WinJS.Utilities.Key.rightArrow:
        case WinJS.Utilities.Key.downArrow:
            focus = next;
            break;
        default:
            // if we're still here, then we've reached some key that we shouldn't handle.
            return;
    }

    if (focus != null) {
        // we have an element we can focus on, so move to it.
        var index = focus.index;
        if (index >= 0) {
            this._safeSetActiveItemIndex(index, ev);
            return;
        }    
    }

    // prevent the default action (i.e. scrolling)
    ev.preventDefault();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\..\Core\Events\EventArgs.js" />
/// <reference path="StackingListViewControl.js" />
/// <reference path="StackingListViewSchedulerTask.js" />

People.RecentActivity.UI.Feed.StackingListViewScheduler = function() {
    /// <summary>
    ///     Provides a simple scheduler for a <see cref="T:People.RecentActivity.UI.Feed.StackingListViewControl" />.
    /// </summary>
    /// <field name="_tasks" type="Array">The scheduled actions.</field>
    /// <field name="_processing" type="Boolean">Whether we're currently processing a job.</field>
    /// <field name="_disposed" type="Boolean">Whether the instance has been disposed.</field>
    /// <field name="_paused" type="Boolean">Whether the queue has been paused.</field>
    /// <field name="_frozen" type="Boolean">Whether the queue has been frozen.</field>
    this._tasks = [];
};

Jx.mix(People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype, Jx.Events);
Jx.mix(People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype, "emptied");

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype._tasks = null;
People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype._processing = false;
People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype._disposed = false;
People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype._paused = false;
People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype._frozen = false;

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype, "isEmpty", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the scheduler is empty.
        /// </summary>
        /// <value type="Boolean"></value>
        return !this._processing && (!this._tasks.length);
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype, "isPaused", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the scheduler has been paused.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._paused;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype, "isProcessing", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the scheduler is currently processing a work item.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._processing;
    }
});

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype.empty = function() {
    /// <summary>
    ///     Empties all the scheduled actions.
    /// </summary>
    Jx.log.write(4, 'StackingListViewScheduler::Empty()');
    this._tasks.length = 0;
    this._onEmptied();
};

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    Jx.log.write(4, 'StackingListViewScheduler::Dispose()');
    this._tasks.length = 0;
    this._disposed = true;
};

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype.schedule = function(priority, action) {
    /// <summary>
    ///     Schedules an action.
    /// </summary>
    /// <param name="priority" type="People.RecentActivity.UI.Feed.StackingListViewSchedulerPriority">The priority.</param>
    /// <param name="action" type="Function">The action to schedule.</param>
    Debug.assert(action != null, 'action != null');
    Jx.log.write(4, 'StackingListViewScheduler::Schedule(' + priority + ')');
    if (!this._frozen) {
        this._tasks.push(People.RecentActivity.UI.Feed.create_stackingListViewSchedulerTask(priority, action));
        if (!this._processing) {
            // we can immediately execute this job.
            this.onCompleted();
        }    
    }
};

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype.pause = function() {
    /// <summary>
    ///     Pauses the scheduler.
    /// </summary>
    if (!this._paused) {
        Jx.log.write(4, 'StackingListViewScheduler::Pause()');
        this._paused = true;
    }
};

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype.resume = function() {
    /// <summary>
    ///     Resumes the scheduler.
    /// </summary>
    if (this._paused) {
        Jx.log.write(4, 'StackingListViewScheduler::Resume()');
        this._paused = false;
        if (!this._processing) {
            this.onCompleted();
        }    
    }
};

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype.freeze = function() {
    /// <summary>
    ///     Pauses the scheduler, and does not allow it to be unpaused. When frozen, any attempt to
    ///     add new tasks to the scheduler will be ignored.
    /// </summary>
    if (!this._frozen) {
        Jx.log.write(4, 'StackingListViewScheduler::Freeze()');
        this._frozen = true;
    }
};

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype.onCompleted = function() {
    /// <summary>
    ///     Indicates a scheduled job has been completed.
    /// </summary>
    var that = this;
    
    if (this._disposed) {
        // just ignore this completion ... nothing to see here, move along.
        return;
    }

    this._processing = false;
    if (this._paused) {
        // we've been paused, so don't execute anything.
        return;
    }

    if (this._tasks.length > 0) {
        this._processing = true;
        // make sure we don't flood the UI thread with operations, by scheduling this task
        // with the setImmediate function (which will yield control back to the UI thread if needed.)
        window.msSetImmediate(function() {
            if (!that._disposed && !that._paused && !that._frozen && (that._tasks.length > 0)) {
                // we're not disposed, so we can execute the next action.
                // sort the actions by priority and then take the "top" one.
                Jx.log.write(4, 'StackingListViewScheduler::OnCompleted(), executing task');
                that._tasks.sort(function(a, b) {
                    return a.priority - b.priority;
                });
                var task = that._tasks[0];
                Jx.log.write(4, 'StackingListViewScheduler::OnCompleted:invoking ' + task.priority);
                var action = task.action;
                that._tasks.shift();
                action();
            }
            else {
                that._processing = false;
            }

        });
    }
    else {
        this._onEmptied();
    }
};

People.RecentActivity.UI.Feed.StackingListViewScheduler.prototype._onEmptied = function() {
    this.raiseEvent("emptied", new People.RecentActivity.EventArgs(this));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Feed.StackingListViewStateManager = function() {
    /// <summary>
    ///     Provides a class to manage StackingListViewState.
    /// </summary>
    /// <field name="_itemStateMap" type="Object">The item state map.</field>
    /// <field name="_listviewState" type="People.RecentActivity.UI.Feed.stackingListViewState">The list view state.</field>
    /// <field name="_markupState" type="People.RecentActivity.UI.Feed.stackingListViewMarkupState">The state of the markup for each item.</field>
    /// <field name="_scrollPosition" type="Number" integer="true">The scroll position, -2 means not set yet.</field>
    this._scrollPosition = -2;
    this._itemStateMap = {};
};


People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype._itemStateMap = null;
People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype._listviewState = null;
People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype._markupState = null;

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype, "hasMarkupState", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the manager has markup state.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._markupState != null;
    }
});

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.setItemState = function(state) {
    /// <summary>
    ///     Sets the state for a layout.
    /// </summary>
    /// <param name="state" type="People.RecentActivity.UI.Feed.stackingListViewItemState">The state.</param>
    Debug.assert(state != null, 'state');
    this._itemStateMap[state.l] = state;
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.getItemState = function(layout) {
    /// <summary>
    ///     Gets the state for the current layout.
    /// </summary>
    /// <param name="layout" type="Windows.UI.ViewManagement.ApplicationViewState">The layout.</param>
    /// <returns type="People.RecentActivity.UI.Feed.stackingListViewItemState"></returns>
    return this._itemStateMap[layout];
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.clearItemState = function(layout) {
    /// <summary>
    ///     Clears the item state for a layout.
    /// </summary>
    /// <param name="layout" type="Windows.UI.ViewManagement.ApplicationViewState">The layout.</param>
    delete this._itemStateMap[layout];
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.setListViewState = function(state) {
    /// <summary>
    ///     Sets the list view state.
    /// </summary>
    /// <param name="state" type="People.RecentActivity.UI.Feed.stackingListViewState">The state.</param>
    Debug.assert(state != null, 'state');
    // invalidate the scroll position we computed.
    this._scrollPosition = -2;
    this._listviewState = state;
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.getListViewState = function() {
    /// <summary>
    ///     Gets the list view state.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.Feed.stackingListViewState"></returns>
    return this._listviewState;
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.getItemStates = function() {
    /// <summary>
    ///     Gets all the states as a dictionary.
    /// </summary>
    /// <returns type="Object"></returns>
    return this._itemStateMap;
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.setItemStates = function(states) {
    /// <param name="states" type="Object"></param>
    Debug.assert(states != null, 'states');
    // invalidate all states.
    this.invalidate();
    for (var k in states) {
        var state = { key: k, value: states[k] };
        this._itemStateMap[state.key] = state.value;
    }
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.getMarkupState = function() {
    /// <summary>
    ///     Gets the markup state.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.Feed.stackingListViewMarkupState"></returns>
    return this._markupState;
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.setMarkupState = function(state) {
    /// <summary>
    ///     Sets the markup state.
    /// </summary>
    /// <param name="state" type="People.RecentActivity.UI.Feed.stackingListViewMarkupState">The state.</param>
    Debug.assert(state != null, 'state != null');
    this._markupState = state;
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.invalidate = function() {
    /// <summary>
    ///     Invalidates the existing states.
    /// </summary>
    People.Social.clearKeys(this._itemStateMap);
    this._scrollPosition = -2;
};

People.RecentActivity.UI.Feed.StackingListViewStateManager.prototype.getScrollPosition = function() {
    /// <summary>
    ///     Gets the scroll position to restore.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    if (this._scrollPosition === -2) {
        // get the item state for this layout.
        var itemState = this.getItemState(Windows.UI.ViewManagement.ApplicationView.value);
        if (itemState != null && this._listviewState != null) {
            if (this._listviewState.l === Windows.UI.ViewManagement.ApplicationView.value) {
                // if the listview state we saved is for the current layout, easy.
                this._scrollPosition = this._listviewState.s;
            }
            else {
                // user switched layout, e.g. user views a self page on portrait, and then clicks back button on landscape.
                // we can't accurately apply scroll position, but we might be able to bring the same item into view.
                if (!Jx.isUndefined(itemState.i[this._listviewState.d])) {
                    // if we have the item state for current layout saved for the item first in view from previous layout, just use the offset as the scroll position.
                    this._scrollPosition = itemState.i[this._listviewState.d].o;
                }
                else {
                    this._scrollPosition = -1;
                }            
            }

        }
        else {
            this._scrollPosition = -1;
        }    
    }

    return this._scrollPosition;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="StackingListViewControl.js" />
/// <reference path="StackingListViewItem.js" />
/// <reference path="StackingListViewLayoutEngine.js" />
/// <reference path="StackingListViewStateManager.js" />

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine = function(control, data, settings, stateManager) {
    /// <summary>
    ///     Provides a layout engine for vertical listviews.
    /// </summary>
    /// <param name="control" type="People.RecentActivity.UI.Feed.StackingListViewControl">The control.</param>
    /// <param name="data" type="People.RecentActivity.UI.Feed.stackingListViewData">The data.</param>
    /// <param name="settings" type="People.RecentActivity.UI.Feed.stackingListViewSettings">The settings.</param>
    /// <param name="stateManager" type="People.RecentActivity.UI.Feed.StackingListViewStateManager">The state manager.</param>
    People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.call(this, control, data, settings, stateManager);
};

Jx.inherit(People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine, People.RecentActivity.UI.Feed.StackingListViewLayoutEngine);

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype, "viewportOffset", {
    get: function() {
        /// <summary>
        ///     Gets or sets the offset ("scroll position") of the viewport.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.element.scrollTop;
    },
    set: function(value) {
        Jx.log.write(4, 'StackingListViewVerticalLayoutEngine::ViewportOffset::set: ' + value);
        this.element.scrollTop = value;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype, "viewportSize", {
    get: function() {
        /// <summary>
        ///     Gets the viewport size.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.element.clientHeight;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype, "rowHeight", {
    get: function() {
        /// <summary>
        ///     Gets the height of a grid row. It only makes sense in horizontal layout.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return -1;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype, "lastItemIndex", {
    get: function() {
        /// <summary>
        ///     Gets the index of the last item in the list view control.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.items.length - 1;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype, "scrollerSize", {
    get: function() {
        /// <summary>
        ///     Gets the size of the scroller.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.element.scrollHeight;
    },
    configurable: true
});

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.getFirstItemInView = function(offset) {
    /// <summary>
    ///     Gets the first item in view.
    /// </summary>
    /// <param name="offset" type="Number">The offset to start at. Null, undefined and -1 will be ignored.</param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
    if (Jx.isNullOrUndefined(offset) || (offset === -1)) {
        offset = this.viewportOffset;
    }

    var items = this.items;

    for (var i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        if (item.isRendered) {
            if (item.offset + item.size >= offset) {
                // this item is in view, and it is the first one.
                return item;
            }        
        }    
    }

    return null;
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.getFirstItemInSection = function(item) {
    /// <summary>
    ///     Gets the first item in the section.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
    Debug.assert(item != null, 'item != null');
    return item;
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.getPreviousItem = function(item) {
    /// <summary>
    ///     Gets the item that is visually placed before the given item.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
    Debug.assert(item != null, 'item != null');
    var index = item.index;
    if (!index) {
        return null;
    }

    return this.items[index - 1];
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.getNextItem = function(item) {
    /// <summary>
    ///     Gets the item that is visually placed after the given item.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewItem"></returns>
    Debug.assert(item != null, 'item != null');
    var items = this.items;
    var index = item.index;
    if (index === items.length - 1) {
        return null;
    }

    return items[index + 1];
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.onUpdateScrollPoints = function() {
    /// <summary>
    ///     Occurs when snap points need to be updated.
    /// </summary>
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIUpdateSnapListStart);
    var list = this.items;
    // get the position of each item, and then update the snapList() style.
    var points = new Array(list.length);
    for (var i = 0, len = points.length; i < len; i++) {
        points[i] = list[i].offset;
    }

    // set the snap list.
    var element = this.element;
    element.style['msScrollSnapPointsX'] = '';
    element.style['msScrollSnapPointsY'] = 'snapList(' + points.join('px, ') + 'px)';
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIUpdateSnapListStop);
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.onUpdateAriaAttributes = function() {
    /// <summary>
    ///     Occurs when the ARIA attributes need to be updated.
    /// </summary>
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIUpdateAriaStart);
    var list = this.items;
    for (var i = 0, len = list.length; i < len; i++) {
        // update the ARIA flow-from, flow-to, posinset and setsize.
        var item = list[i];
        if (item.isRendered) {
            item.flowFrom = (!i) ? null : list[i - 1].id;
            item.flowTo = (i + 1 === len) ? null : list[i + 1].id;
            item.setPosition = i + 1;
            item.setSize = len;
        }
        else {
            // as soon as we found an item that hasn't been rendered, abort.
            break;
        }    
    }

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIUpdateAriaStop);
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.onOwnershipTaken = function() {
    /// <summary>
    ///     Occurs when the layout engine has taken ownership.
    /// </summary>
    this.setViewportStyle(-1);
    People.RecentActivity.UI.Feed.StackingListViewLayoutEngine.prototype.onOwnershipTaken.call(this);
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.getItemOffset = function(item) {
    /// <summary>
    ///     Gets an item offset.
    /// </summary>
    /// <param name="item" type="People.RecentActivity.UI.Feed.StackingListViewItem">The item.</param>
    /// <returns type="Number" integer="true"></returns>
    Debug.assert(item != null, 'item != null');
    var element = item.element;
    var oldDisplay = element.style.display;
    element.style.display = '';
    var offset = item.element.offsetTop;
    element.style.display = oldDisplay;
    return offset;
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.repositionItemsWithoutStacking = function() {
    /// <summary>
    ///     Repositions items without stacking.
    /// </summary>
    // haha, yeah, right.
    this.repositionItems(0, this.items.length - 1);
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.repositionItems = function(start, end) {
    /// <summary>
    ///     Repositions items.
    /// </summary>
    /// <param name="start" type="Number" integer="true">The start.</param>
    /// <param name="end" type="Number" integer="true">The end.</param>
    /// <returns type="Array" elementType="Object" elementDomElement="true"></returns>
    Debug.assert(start >= 0, 'start');
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIRepositionItemsStart);
    var items = this.items;
    var len = items.length;
    Debug.assert(end < len, 'end');
    if (!len || !this.hasOwnership) {
        // no items to process, or we don't own the listview layout currently.
        return new Array(0);
    }

    var state = this.stateItems;
    var i = start;
    if (state != null) {
        Jx.log.write(4, 'RepositionItems: Using existing state to position items.');
        var states = state.i;
        for (; i <= end; i++) {
            // fetch the item, check to see if we have state for it.
            var item = items[i];
            var id = item.itemId;
            if (!item.isStateApplied && !Jx.isUndefined(states[id])) {
                item.positionState = states[id];
            }        
        }    
    }

    // keep track of changes.
    var changes = [];
    var offset = 0;
    var heightDelta = -1;
    // vertical layout is simple -- we can just set the row to the index and be done.
    for (var pos = i + 1; i <= end; i++, pos++) {
        var item = items[i];
        var element = item.element;
        var height = WinJS.Utilities.getContentHeight(element);
        if (heightDelta === -1) {
            // heightDelta is the height of vertical paddings + margins.
            heightDelta = WinJS.Utilities.getTotalHeight(element) - height;
            offset = element.offsetTop;
        }
        else {
            // we don't need to access DOM anymore, just do some math.
            offset += items[i - 1].size + heightDelta;
        }

        // save height and offset.
        item.size = height;
        item.offset = offset;
        item.stackingState = 2;
        item.widthOverride = -1;
        if (item.row !== pos) {
            changes.push(element);
        }

        item.row = pos;
    }

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUIRepositionItemsStop);
    return changes;
};

People.RecentActivity.UI.Feed.StackingListViewVerticalLayoutEngine.prototype.onLayoutInitialized = function() {
    /// <summary>
    ///     Called when layout is initialized.
    /// </summary>
    var scrollPosition = this.stateManager.getScrollPosition();

    for (var n = 0, coll = this.items; n < coll.length; n++) {
        var item = coll[n];
        var style = item.element.style;

        if (item.isStateApplied && scrollPosition !== -1) {
            // we need to virtualize. Let each item take the space they should.
            if (item.size !== 0) {
                style.height = item.size + 'px';
            }
        }
        else {
            style.display = 'none';
        }
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\BICI\BiciClickthroughAction.js" />
/// <reference path="..\..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementContextOptions.js" />
/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementTileOptions.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\Network.js" />
/// <reference path="..\..\Core\Controls\AnnotationsControl.js" />
/// <reference path="..\..\Core\Controls\AnnotationsControlPlacement.js" />
/// <reference path="..\..\Core\Controls\ContactControl.js" />
/// <reference path="..\..\Core\Controls\ContactControlType.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\..\Core\Helpers\UriHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\TimestampUpdateTimer.js" />
/// <reference path="..\States\BaseEntryState.js" />
/// <reference path="EntryControlClickedEventArgs.js" />
/// <reference path="ListView\StackingListViewItem.js" />
/// <reference path="MetadataControl.js" />

People.RecentActivity.UI.Feed.EntryControl = function(entry) {
    /// <summary>
    ///     Provides a base class for items.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_maximumStackingOffset$2" type="Number" integer="true" static="true">Them maximum amount of time between entries for stacking purposes, in milliseconds.</field>
    /// <field name="_entry$2" type="People.RecentActivity.FeedEntry">The feed entry.</field>
    /// <field name="_itemId$2" type="String">The item id.</field>
    /// <field name="_header$2" type="HTMLElement">The header.</field>
    /// <field name="_footer$2" type="HTMLElement">The footer.</field>
    /// <field name="_content$2" type="HTMLElement">The rich content of the entry, where photos and links are displayed.</field>
    /// <field name="_contact$2" type="People.RecentActivity.UI.Core.ContactControl">The publisher.</field>
    /// <field name="_time$2" type="People.RecentActivity.UI.Core.Control">The time element.</field>
    /// <field name="_icon$2" type="People.RecentActivity.UI.Core.Control">The icon element.</field>
    /// <field name="_iconButton$2" type="People.RecentActivity.UI.Core.Control">The icon button element.</field>
    /// <field name="_reactionsControl$2" type="People.RecentActivity.UI.Feed.MetadataControl">The reaction count.</field>
    /// <field name="_annotations$2" type="People.RecentActivity.UI.Core.AnnotationsControl">The annotation control (e.g. reply to, retweet, wall-post)</field>
    /// <field name="_isFixedWidth$2" type="Boolean">Whether the entry is in fixed-width mode.</field>
    /// <field name="_isFixedHeight$2" type="Boolean">Whether the entry is in fixed-height mode if <c>isFixedWidth</c> is also <c>true</c>.</field>
    /// <field name="_isMarkupInitialized$2" type="Boolean">Whether the markup for this element has been fully initialized.</field>
    /// <field name="_isFrameRendered$2" type="Boolean">Whether the frame has been rendered.</field>
    /// <field name="_contentHeight$2" type="Number">The total content height for the entry.</field>
    /// <field name="_contentWidth$2" type="Number" integer="true">The content width for the entry.</field>
    /// <field name="_contentWidthFinalized$2" type="Boolean">Whether content width has finalized.</field>
    /// <field name="_state$2" type="People.RecentActivity.UI.Feed.baseEntryState">The state.</field>
    People.RecentActivity.UI.Feed.StackingListViewItem.call(this);

    Debug.assert(entry != null, 'entry != null');

    this._contentHeight$2 = -1;
    this._entry$2 = entry;
    this._network = entry.network;
    this._itemId$2 = entry.sourceId + '_' + entry.id;
};

Jx.inherit(People.RecentActivity.UI.Feed.EntryControl, People.RecentActivity.UI.Feed.StackingListViewItem);

Jx.mix(People.RecentActivity.UI.Feed.EntryControl.prototype, Jx.Events);
Jx.mix(People.RecentActivity.UI.Feed.EntryControl.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.UI.Feed.EntryControl.prototype, "clicked");

People.RecentActivity.UI.Feed.EntryControl._maximumStackingOffset$2 = 7884000000;
People.RecentActivity.UI.Feed.EntryControl.prototype._entry$2 = null
People.RecentActivity.UI.Feed.EntryControl.prototype._network = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._itemId$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._header$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._footer$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._content$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._contact$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._time$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._icon$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._iconButton$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._reactionsControl$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._annotations$2 = null;
People.RecentActivity.UI.Feed.EntryControl.prototype._isFixedWidth$2 = false;
People.RecentActivity.UI.Feed.EntryControl.prototype._isFixedHeight$2 = false;
People.RecentActivity.UI.Feed.EntryControl.prototype._isMarkupInitialized$2 = false;
People.RecentActivity.UI.Feed.EntryControl.prototype._isFrameRendered$2 = false;
People.RecentActivity.UI.Feed.EntryControl.prototype._contentWidth$2 = 0;
People.RecentActivity.UI.Feed.EntryControl.prototype._contentWidthFinalized$2 = false;
People.RecentActivity.UI.Feed.EntryControl.prototype._state$2 = null;

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "entry", {
    get: function() {
        /// <summary>
        ///     Gets the feed entry.
        /// </summary>
        /// <value type="People.RecentActivity.FeedEntry"></value>
        return this._entry$2;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "isFixedWidth", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the entry is in fixed-width mode.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isFixedWidth$2;
    },
    set: function(value) {
        Debug.assert(!this.isRendered, '!this.IsRendered');

        if (value !== this._isFixedWidth$2) {
            this._isFixedWidth$2 = value;

            if (value) {
                this.addClass('ra-itemFixedWidth');
            }
            else {
                this.removeClass('ra-itemFixedWidth');
            }

            this.onFixedWidthChanged();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "isFixedHeight", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the entry is in fixed-height mode.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isFixedHeight$2;
    },
    set: function(value) {
        Debug.assert(this._isFixedWidth$2, 'isFixedWidth');

        if (value !== this._isFixedHeight$2) {
            this._isFixedHeight$2 = value;
            this.onFixedHeightChanged();
        }

    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "itemId", {
    get: function() {
        /// <summary>
        ///     Gets a unique item ID.
        /// </summary>
        /// <value type="String"></value>
        return this._itemId$2;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "contentHeight", {
    get: function() {
        /// <summary>
        ///     Gets the content height, in # of rows.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        // get the height in pixels, then divide and round up (so we always return at least 1 row).
        var pixels = this.contentHeightPixels;
        if (!pixels) {
            // no matter how hard you divide 0 by something, Math.Ceil will still return 0.
            return 1;
        }

        return Math.ceil(pixels / this.owner.rowHeight);
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "contentHeightPixels", {
    get: function() {
        /// <summary>
        ///     Gets the minimum height this entry can occupy.
        /// </summary>
        /// <value type="Number"></value>
        if (this.orientation === 1) {
            // in vertical, we never use this, so directly return -1. It is quite costly to calculate this when saving states in snap.
            return -1;
        }

        if ((this._state$2 != null) && (this._state$2.c > 0)) {
            // we can just use the cached content height.
            return this._state$2.c;
        }

        if (this._contentHeight$2 !== -1) {
            return this._contentHeight$2;
        }

        if (this.isLoaded && (this.isRendered || this.isReadyForStacking)) {
            // capture the display style for the element and then clear it
            var display = this.setTemporaryVisibility();

            // make the container non-compact, and then get its height.
            this.addClass('ra-itemFull');
            var element = this.element;

            // get the total height of the header, footer, etc.
            this._contentHeight$2 = 0;
            this._contentHeight$2 += WinJS.Utilities.getTotalHeight(this._header$2);
            this._contentHeight$2 += WinJS.Utilities.getTotalHeight(this._footer$2);
            this._contentHeight$2 += People.RecentActivity.UI.Core.HtmlHelper.getVerticalMargin(element);
            this._contentHeight$2 += People.RecentActivity.UI.Core.HtmlHelper.getVerticalPadding(element);

            // then ask for the content height of the .. actual.. you know.. content?
            this._contentHeight$2 += this.getContentHeight();
            this.removeClass('ra-itemFull');

            // restore the display style.
            this.restoreTemporaryVisibility(display);

            return this._contentHeight$2;
        }

        return 0;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "contentWidthPixels", {
    get: function() {
        /// <summary>
        ///     Gets the width of the item, in pixels.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        if (!this._contentWidthFinalized$2) {
            this._contentWidth$2 = WinJS.Utilities.getContentWidth(this.element);

            if (this.isReadyForStacking) {
                this._contentWidthFinalized$2 = true;
            }        
        }

        return this._contentWidth$2;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "hasImplicitWidth", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the width for item is predefined in CSS.
        /// </summary>
        /// <value type="Boolean"></value>
        return true;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "content", {
    get: function() {
        /// <summary>
        ///     Gets the content control.
        /// </summary>
        /// <value type="HTMLElement"></value>
        return this._content$2;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControl.prototype, "isMarkupInitialized", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the entry has been fully initialized when it was
        ///     rendered -- as such, only dynamic content needs to be restored.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isMarkupInitialized$2;
    }
});

People.RecentActivity.UI.Feed.EntryControl.prototype.acceptsNeighbour = function(neighbour) {
    /// <summary>
    ///     Returns a value based on whether the given control can be a neighbour of the current control.
    /// </summary>
    /// <param name="neighbour" type="People.RecentActivity.UI.Feed.StackingListViewItem">The neighbour.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(neighbour != null, 'neighbour != null');

    if (this.network.identity.isWhatsNew) {
        // what's new always accepts neighbour items.
        return true;
    }

    // check the offsets.
    var entry = neighbour;
    var timeA = this._entry$2.timestamp.getTime();
    var timeB = entry.entry.timestamp.getTime();

    return Math.abs(timeA - timeB) <= 7884000000;
};

People.RecentActivity.UI.Feed.EntryControl.prototype.openSelfPage = function() {
    /// <summary>
    ///     Opens the self-page.
    /// </summary>
    this.onSelfPageOpened();
};

People.RecentActivity.UI.Feed.EntryControl.prototype.ensureFrameRendered = function() {
    /// <summary>
    ///     Ensures that the frame around the entry has been rendered -- this includes
    ///     metadata, annotations, the header, etc.
    /// </summary>
    var rendered = true;
    if (this.element.children.length <= 0) {
        rendered = false;
    } else if (!this._isFrameRendered$2) {
        this._isFrameRendered$2 = true;

        // render the publisher content for this entry.
        this._renderPublisher$2();
        this._renderAnnotation$2();

        // render the metadata.
        this._renderMetadata$2();
    }
    return rendered;
};

People.RecentActivity.UI.Feed.EntryControl.prototype.invalidateContentSize = function() {
    /// <summary>
    ///     Invalidates the content height and width.
    /// </summary>
    this._contentHeight$2 = -1;
    this._contentWidth$2 = -1;
};

People.RecentActivity.UI.Feed.EntryControl.prototype.setTemporaryVisibility = function() {
    /// <summary>
    ///     Temporarily makes the item visible.
    /// </summary>
    /// <returns type="String"></returns>
    var style = this.element.style;
    var display = style.display;
    style.display = '';

    return display;
};

People.RecentActivity.UI.Feed.EntryControl.prototype.restoreTemporaryVisibility = function(display) {
    /// <summary>
    ///     Restores the temporary visibility change caused by <see cref="M:People.RecentActivity.UI.Feed.EntryControl.SetTemporaryVisibility" />.
    /// </summary>
    /// <param name="display" type="String">The display.</param>
    this.element.style.display = display;
};

People.RecentActivity.UI.Feed.EntryControl.prototype.getState = function() {
    /// <summary>
    ///     Gets the state.
    /// </summary>
    /// <returns type="Object"></returns>
    return People.RecentActivity.UI.Feed.create_baseEntryState(this.contentHeightPixels);
};

People.RecentActivity.UI.Feed.EntryControl.prototype.setState = function(state) {
    /// <summary>
    ///     Sets the state.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
    this._state$2 = state;
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedWidthChanged = function() {
    /// <summary>
    ///     Occurs when the <see cref="P:People.RecentActivity.UI.Feed.EntryControl.IsFixedWidth" /> property changes.
    /// </summary>
    this.onPropertyChanged('IsFixedWidth');
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedHeightChanged = function() {
    /// <summary>
    ///     Occurs when the <see cref="P:People.RecentActivity.UI.Feed.EntryControl.IsFixedHeight" /> property changes.
    /// </summary>
    this.onPropertyChanged('IsFixedHeight');
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the item is being disposed.
    /// </summary>
    this._header$2 = null;
    this._footer$2 = null;
    this._content$2 = null;

    if (this._time$2 != null) {
        this._time$2.dispose();
        this._time$2 = null;
    }

    this._disposePublisher$2();
    this._disposeAnnotation$2();
    this._disposeMetadata$2();

    this._content$2 = null;
    this._footer$2 = null;
    this._header$2 = null;

    this._entry$2 = null;
    this._network = null;

    People.RecentActivity.UI.Core.TimestampUpdateTimer.unsubscribe(this._onUpdateTimerElapsed$2, this);

    People.RecentActivity.UI.Feed.StackingListViewItem.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the item is being rendered.
    /// </summary>
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.uiRenderEntryStart, this._entry$2.objectInfo);

    this.addClass('ra-network' + this._entry$2.sourceId);

    // attach a few events to handle context menus and keypresses (for navigate invoke.)
    this.attach('keypress', this._onKeyPress$2.bind(this));
    this.attach('click', this._onClicked$2.bind(this));

    // attach events for touch events.
    this.attach('MSPointerDown', this._onPointerDown$2.bind(this));
    this.attach('MSPointerCancel', this._onPointerUp$2.bind(this));
    this.attach('MSPointerOut', this._onPointerUp$2.bind(this));
    this.attach('MSPointerUp', this._onPointerUp$2.bind(this));

    this.ensureFrameRendered();
    People.RecentActivity.UI.Core.TimestampUpdateTimer.subscribe(this._onUpdateTimerElapsed$2, this);

    // now it's time to render the content.
    this.onContentRendered();

    // once all of that is done, update the ARIA stuff.
    this._updateAriaProperties$2();
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onContentRendered = function() {
    /// <summary>
    ///     Occurs when the content can be rendered.
    /// </summary>
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onSelfPageOpened = function() {
    /// <summary>
    ///     Occurs when the self page should be opened.
    /// </summary>
    Jx.log.write(4, 'EntryControl::OnSelfPageOpened()');

    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject(this._entry$2);
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onRenderingEnded = function() {
    /// <summary>
    ///     Occurs when the rendering has ended.
    /// </summary>
    // signal the end of rendering this item by logging and ETW point.
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.uiRenderEntryEnd, this.entry.objectInfo);
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onLoad = function() {
    /// <summary>
    ///     Occurs when the item needs to load stuff.
    /// </summary>
    People.RecentActivity.UI.Feed.StackingListViewItem.prototype.onLoad.call(this);

    // some entries depend on having content on pre-load.
    var element = this.element;

    var children = element.children;
    if (children.length > 0) {
        // we have an existing element that contains markup -- so use it.
        this._header$2 = children[0];
        this._content$2 = children[1];
        this._footer$2 = children[2];
    }
    else {
        // we need to initialize new elements for the children.
        this._header$2 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryHeader);
        this._content$2 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryContent);
        this._footer$2 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryFooter);

        var fragment = document.createDocumentFragment();
        fragment.appendChild(this._header$2);
        fragment.appendChild(this._content$2);
        fragment.appendChild(this._footer$2);

        element.appendChild(fragment);
    }

    // entries are always ready for stacking, woo!
    this.onReadyForStacking();
};

People.RecentActivity.UI.Feed.EntryControl.prototype.onLoadElement = function(element) {
    /// <summary>
    ///     Occurs when the element should be loaded.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element, if any.</param>
    if (element != null) {
        // we have an existing element we can use. check to see if it has been fully initialized or not.
        this.element = element;
        this._isMarkupInitialized$2 = element.children.length > 0;
    }
    else {
        // initialize a new element for the entry.
        this.element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntry);
    }

    People.RecentActivity.UI.Feed.StackingListViewItem.prototype.onLoadElement.call(this, element);
};

People.RecentActivity.UI.Feed.EntryControl.prototype._updateAriaProperties$2 = function() {
    var elementName = this._header$2.children[1].children[0];

    // TODO (WinBlue 186590): Remove this workaround after IE's bug is fixed.
    // This workaround forces IE to layout the page before we later try to read the innerText.
    document.body.offsetHeight;

    // the ARIA label is compromised of various pieces of information, let's gather them all.
    var label = [];
    label.push(Jx.res.loadCompoundString('/strings/raItemBaseLabel', elementName.innerText));
    label.push.apply(label, this._annotations$2.getAriaLabels());

    if (People.RecentActivity.UI.Core.LocalizationHelper.isRelativeTimestamp(this._entry$2.timestamp)) {
        label.push(this._time$2.text);
    }
    else {
        label.push(Jx.res.loadCompoundString('/strings/raItemTimeLabel', this._time$2.text));
    }

    var content = this.getAriaContentLabel();
    if (Jx.isNonEmptyString(content)) {
        // there is actual content, so format with the "said ..." string.
        label.push(Jx.res.loadCompoundString('/strings/raItemContentLabel', content));
    }

    label.push(Jx.res.loadCompoundString('/strings/raItemNetworkLabel', this.network.name));
    label.push.apply(label, this._reactionsControl$2.getAriaLabels());

    // once we've gathered all the pieces, join them and set the label.
    this.label = label.join('\r\n');
};

People.RecentActivity.UI.Feed.EntryControl.prototype._updateIcon$2 = function() {
    var iconUrl = this.network.icon;
    if (!Jx.isNonEmptyString(iconUrl)) {
        this._icon$2.isVisible = false;
    }
    else {
        this._icon$2.isVisible = true;

        var image = this._icon$2.element;
        image.src = iconUrl;
    }
};

People.RecentActivity.UI.Feed.EntryControl.prototype._updateTime$2 = function() {
    // format the string.
    var timestamp = this._entry$2.timestamp;
    this._time$2.text = People.RecentActivity.UI.Core.LocalizationHelper.getTimeString(timestamp);
};

People.RecentActivity.UI.Feed.EntryControl.prototype._renderPublisher$2 = function() {
    this._contact$2 = new People.RecentActivity.UI.Core.ContactControl(this._entry$2.publisher.getDataContext());

    // unset the width/height of the Tile element, so we can resize it from CSS.
    var elementPicture = this._contact$2.getElement(People.RecentActivity.UI.Core.ContactControlType.tile, People.RecentActivity.Imports.create_identityElementTileOptions(60, null), -1);
    elementPicture.style.height = '';
    elementPicture.style.width = '';

    // clear out the containers, in case we're reactivating a contact control.
    var elementPictureContainer = this._header$2.children[0];
    elementPictureContainer.innerHTML = '';
    elementPictureContainer.appendChild(elementPicture);

    var elementNameContainer = this._header$2.children[1].children[0];
    elementNameContainer.innerHTML = '';
    elementNameContainer.appendChild(this._contact$2.getElement(People.RecentActivity.UI.Core.ContactControlType.name, People.RecentActivity.Imports.create_identityElementContextOptions(this._entry$2.sourceId), -1));

    this._contact$2.activate(this._header$2);
};

People.RecentActivity.UI.Feed.EntryControl.prototype._renderAnnotation$2 = function() {
    this._annotations$2 = new People.RecentActivity.UI.Core.AnnotationsControl(this._entry$2, this._footer$2.children[0], People.RecentActivity.UI.Core.AnnotationsControlPlacement.normal);
    this._annotations$2.hiddenEntities = true;
    this._annotations$2.render();
};

People.RecentActivity.UI.Feed.EntryControl.prototype._disposePublisher$2 = function() {
    if (this._contact$2 != null) {
        this._contact$2.dispose();
        this._contact$2 = null;
    }
};

People.RecentActivity.UI.Feed.EntryControl.prototype._disposeAnnotation$2 = function() {
    if (this._annotations$2 != null) {
        // also dispose the annotations element/control.
        this._annotations$2.dispose();
        this._annotations$2 = null;
    }
};

People.RecentActivity.UI.Feed.EntryControl.prototype._renderMetadata$2 = function() {
    var loc = Jx.res;

    var elementErrors = this._footer$2.children[1];
    var elementMetadata = this._footer$2.children[2];
    var elementMetadataChildren = elementMetadata.children;

    // render the little network icon.
    this._iconButton$2 = People.RecentActivity.UI.Core.Control.fromElement(elementMetadataChildren[0]);
    this._iconButton$2.attach('click', this._onIconClicked$2.bind(this));
    People.Animation.addTapAnimation(this._iconButton$2.element);

    this._icon$2 = People.RecentActivity.UI.Core.Control.fromElement(elementMetadataChildren[0].children[0]);
    this._updateIcon$2();

    // create a new control that keeps track of reactions + comments.
    this._reactionsControl$2 = new People.RecentActivity.UI.Feed.MetadataControl(elementMetadataChildren[1], elementErrors/* pass in the control that can be used for errors.*/, this._entry$2);
    this._reactionsControl$2.render();

    // render the time + via string as well of course.
    this._time$2 = People.RecentActivity.UI.Core.Control.fromElement(this._header$2.children[1].children[1]);
    this._updateTime$2();

    this.network.addListener("propertychanged", this._onNetworkPropertyChanged$2, this);
};

People.RecentActivity.UI.Feed.EntryControl.prototype._disposeMetadata$2 = function() {
    if (this._reactionsControl$2 != null) {
        this._reactionsControl$2.dispose();
        this._reactionsControl$2 = null;
    }

    if (this._icon$2 != null) {
        this._icon$2.dispose();
        this._icon$2 = null;
    }

    if (this._iconButton$2 != null) {
        this._iconButton$2.dispose();
        this._iconButton$2 = null;
    }

    this.network.removeListenerSafe("propertychanged", this._onNetworkPropertyChanged$2, this);
};

People.RecentActivity.UI.Feed.EntryControl.prototype._isHitTarget$2 = function(child) {
    /// <param name="child" type="HTMLElement"></param>
    /// <returns type="Boolean"></returns>
    Debug.assert(child != null, 'child != null');

    // don't search further than the root.
    var element = this.element;

    while ((child !== element) && (child != null)) {
        if (People.RecentActivity.UI.Core.HtmlHelper.isClickTarget(child)) {
            // ignore presses from links, buttons, etc. so the user can click on them.
            return true;
        }

        child = child.parentNode;
    }

    return false;
};

People.RecentActivity.UI.Feed.EntryControl.prototype._onIconClicked$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');

    People.RecentActivity.Core.BiciHelper.createClickThroughDatapoint(this._entry$2.sourceId, People.RecentActivity.Core.BiciClickthroughAction.feedEntryNetworkIcon);

    // open the entry on the network.
    People.RecentActivity.UI.Core.UriHelper.launchUri(this._entry$2.url);
};

People.RecentActivity.UI.Feed.EntryControl.prototype._onClicked$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    if (!this._isHitTarget$2(ev.srcElement)) {
        var preventDefault = false;

        var args = new People.RecentActivity.UI.Feed.EntryControlClickedEventArgs(this, this._entry$2);

        this.raiseEvent("clicked", args);

        preventDefault = args.preventDefault;
        if (!preventDefault) {
            this.openSelfPage();
        }    
    }
};

People.RecentActivity.UI.Feed.EntryControl.prototype._onPointerDown$2 = function(ev) {
    /// <param name="ev" type="MSPointerEvent"></param>
    Debug.assert(ev != null, 'ev != null');

    if ((!ev.button) || (ev.pointerType === 2)) {
        if (!this._isHitTarget$2(ev.srcElement)) {
            // start the pointer down animation.
            People.Animation.pointerDown(this.element);
        }    
    }
};

People.RecentActivity.UI.Feed.EntryControl.prototype._onPointerUp$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');

    People.Animation.pointerUp(this.element);
};

People.RecentActivity.UI.Feed.EntryControl.prototype._onUpdateTimerElapsed$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');

    this._updateTime$2();

    // when the time changes, the ARIA label should also change.
    this._updateAriaProperties$2();
};

People.RecentActivity.UI.Feed.EntryControl.prototype._onKeyPress$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');

    if (!this._isHitTarget$2(ev.srcElement)) {
        switch (ev.keyCode) {
            case WinJS.Utilities.Key.enter:
            case WinJS.Utilities.Key.space:
                this.openSelfPage();
                break;
        }    
    }
};

People.RecentActivity.UI.Feed.EntryControl.prototype._onNetworkPropertyChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    if (e.propertyName === 'Icon') {
        this._updateIcon$2();
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />

People.RecentActivity.UI.Feed.EntryControlClickedEventArgs = function(sender, entry) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.UI.Feed.EntryControlClickedEventHandler" /> class.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_entry$1" type="People.RecentActivity.FeedEntry">The feed entry.</field>
    /// <field name="_preventDefault$1" type="Boolean">Whether to prevent the default action from happening.</field>
    People.RecentActivity.EventArgs.call(this, sender);
    Debug.assert(entry != null, 'entry != null');
    this._entry$1 = entry;
};

Jx.inherit(People.RecentActivity.UI.Feed.EntryControlClickedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.UI.Feed.EntryControlClickedEventArgs.prototype._entry$1 = null;
People.RecentActivity.UI.Feed.EntryControlClickedEventArgs.prototype._preventDefault$1 = false;

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControlClickedEventArgs.prototype, "entry", {
    get: function() {
        /// <summary>
        ///     Gets the feed entry.
        /// </summary>
        /// <value type="People.RecentActivity.FeedEntry"></value>
        return this._entry$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.EntryControlClickedEventArgs.prototype, "preventDefault", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the default action should be cancelled.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._preventDefault$1;
    },
    set: function(value) {
        this._preventDefault$1 = value;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Model\Configuration.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\FormattedTextControl.js" />
/// <reference path="..\..\Core\Controls\ImageControl.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\UriHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\States\LinkEntryState.js" />
/// <reference path="EntryControl.js" />

People.RecentActivity.UI.Feed.LinkEntryControl = function(entry) {
    /// <summary>
    ///     Provides an item for link type entries.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The entry.</param>
    /// <field name="_columnLayoutThreshold$3" type="Number" integer="true" static="true">The threshold we use to determine whether to use two-column layout or not (in px)</field>
    /// <field name="_imageAssumedHeight$3" type="Number" integer="true" static="true">The assumed height of images of unknown size.</field>
    /// <field name="_element$3" type="HTMLElement">The element.</field>
    /// <field name="_text$3" type="People.RecentActivity.UI.Core.FormattedTextControl">The user text.</field>
    /// <field name="_image$3" type="People.RecentActivity.UI.Core.ImageControl">The image control, if any.</field>
    /// <field name="_title$3" type="People.RecentActivity.UI.Core.Control">The title.</field>
    /// <field name="_caption$3" type="People.RecentActivity.UI.Core.Control">The caption.</field>
    /// <field name="_description$3" type="People.RecentActivity.UI.Core.Control">The description.</field>
    /// <field name="_preview$3" type="HTMLElement">The preview container.</field>
    /// <field name="_isUnwrapped$3" type="Boolean">Whether we're showing an unwrapped URL.</field>
    /// <field name="_isImageLoaded$3" type="Boolean">Whether the image has been loaded.</field>
    /// <field name="_isColumnLayout$3" type="Boolean">Whether the two column layout is applied.</field>
    /// <field name="_state$3" type="People.RecentActivity.UI.Feed.linkEntryState">The state.</field>
    People.RecentActivity.UI.Feed.EntryControl.call(this, entry);

    Debug.assert(entry.entryType === People.RecentActivity.FeedEntryType.link, 'entry.EntryType == FeedEntryType.Link');
};

Jx.inherit(People.RecentActivity.UI.Feed.LinkEntryControl, People.RecentActivity.UI.Feed.EntryControl);

People.RecentActivity.UI.Feed.LinkEntryControl._columnLayoutThreshold$3 = 180;
People.RecentActivity.UI.Feed.LinkEntryControl._imageAssumedHeight$3 = 115;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._element$3 = null;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._text$3 = null;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._image$3 = null;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._title$3 = null;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._caption$3 = null;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._description$3 = null;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._preview$3 = null;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._isUnwrapped$3 = false;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._isImageLoaded$3 = false;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._isColumnLayout$3 = false;
People.RecentActivity.UI.Feed.LinkEntryControl.prototype._state$3 = null;

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Disposes the item.
    /// </summary>
    this._element$3 = null;
    this._preview$3 = null;

    if (this._text$3 != null) {
        this._text$3.dispose();
        this._text$3 = null;
    }

    if (this._image$3 != null) {
        this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
        this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);

        this._image$3.dispose();
        this._image$3 = null;
    }

    if (this._title$3 != null) {
        this._title$3.dispose();
        this._title$3 = null;
    }

    if (this._caption$3 != null) {
        this._caption$3.dispose();
        this._caption$3 = null;
    }

    if (this._description$3 != null) {
        this._description$3.dispose();
        this._description$3 = null;
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.onContentRendered = function() {
    /// <summary>
    ///     Renders the item.
    /// </summary>
    this._title$3.attach('click', this._onTitleClicked$3.bind(this));

    if (!this.isMarkupInitialized) {
        var entry = this.entry;
        var data = entry.data;

        // render the title, caption, description and text.
        this._caption$3.text = data.caption;
        this._description$3.text = data.description;
        this._text$3.update(data.text, entry.entities);
        this._title$3.text = data.title;

        this._adjustTextHeight$3();
    }

    if (this._isImageLoaded$3 || this._image$3.isDimensionsAvailable || (this._state$3 != null)) {
        if (this._image$3.isVisible) {
            // if the image is visible (i.e. it loaded) we should update the column layout.
            this._applyColumnLayout$3();
        }

        this.onRenderingEnded();
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onContentRendered.call(this);
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.onLoad = function() {
    /// <summary>
    ///     Loads the item.
    /// </summary>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoad.call(this);

    if (this.isMarkupInitialized) {
        // fetch the content element from the existing markup.
        this._element$3 = this.content.children[0];
    }
    else {
        // initialize the DOM for this entry.
        this._element$3 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryLink);
        this.content.appendChild(this._element$3);
    }

    var entry = this.entry;

    // fetch the preview container.
    this._preview$3 = this._element$3.children[1];

    // fetch the other children.
    var previewChildren = this._preview$3.children;
    var previewDetailsChildren = previewChildren[1].children;

    this._caption$3 = People.RecentActivity.UI.Core.Control.fromElement(previewDetailsChildren[1]);
    this._description$3 = People.RecentActivity.UI.Core.Control.fromElement(previewDetailsChildren[2]);
    this._title$3 = People.RecentActivity.UI.Core.Control.fromElement(previewDetailsChildren[0]);

    if (this.isMarkupInitialized) {
        // initialize the text from the existing element.
        this._text$3 = People.RecentActivity.UI.Core.FormattedTextControl.fromExistingElement(this._element$3.children[0], entry.sourceId, entry.entities);
    }
    else {
        // initialize the text from scratch.
        this._text$3 = new People.RecentActivity.UI.Core.FormattedTextControl(this._element$3.children[0], entry.sourceId, true);
    }

    // also start loading the image, if needed. this is a pretty cheap operation as it happens
    // async in the background. once the item needs to be fully rendered, it should show up right away.
    this._image$3 = new People.RecentActivity.UI.Core.ImageControl(previewChildren[0]);

    if (this._isImageLoaded$3) {
        // the image was loaded, so show it if possible.
        this._image$3.isVisible = !this.hasClass('ra-itemLinkNoImage');
    }
    else {
        var url = this._getTileUrl$3();
        if (Jx.isNonEmptyString(url)) {
            People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadLinkTileStart);

            this._image$3.isDelayed = true;
            this._image$3.isOneByOneError = true;
            this._image$3.addListener("imagefailed", this._onImageFailed$3, this);
            this._image$3.addListener("imageloaded", this._onImageLoaded$3, this);
            this._image$3.source = url;

            if (this._image$3.isDimensionsAvailable || (this._state$3 != null)) {
                // we know the size of the image, so we can already determine whether we use a column layout or not.
                this._applyColumnLayout$3();
            }
        }
        else {
            // there is no image to load, so by definition it has been loaded.
            this.addClass('ra-itemLinkNoImage');
            this._image$3.isVisible = false;
            this._setIsImageLoaded$3(true);
        }    
    }
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.onLoadElement = function(element) {
    /// <summary>
    ///     Occurs when the element should be loaded.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoadElement.call(this, element);

    this.addClass('ra-itemLink');

    // figure out whether the image has been loaded.
    this._isImageLoaded$3 = this.isMarkupInitialized && this.hasClass('ra-itemLinkImageLoaded');
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.onOrientationChanged = function() {
    /// <summary>
    ///     Occurs when the orientation has changed.
    /// </summary>
    if (this.isRendered) {
        this._adjustTextHeight$3();
        this._applyColumnLayout$3();
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onOrientationChanged.call(this);
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.onFixedHeightChanged = function() {
    /// <summary>
    ///     Occurs when the entry becomes fixed height.
    /// </summary>
    this.setState(null);
    this._adjustTextHeight$3();

    // also, if the preview is too large, then we should hide the image.
    if (this._preview$3.offsetHeight > this._element$3.clientHeight) {
        this._image$3.isVisible = false;
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedHeightChanged.call(this);
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.onFixedWidthChanged = function() {
    /// <summary>
    ///     Occurs when the entry becomes fixed width.
    /// </summary>
    this._applyColumnLayout$3();

    People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedWidthChanged.call(this);
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.getAriaContentLabel = function() {
    /// <summary>
    ///     Gets the ARIA content labels.
    /// </summary>
    /// <returns type="String"></returns>
    var data = this.entry.data;

    // if the text is not empty, we should format the string.
    if (Jx.isNonEmptyString(data.text)) {
        return Jx.res.loadCompoundString('/strings/raItemContentLinkLabel', data.text, data.title, data.caption, data.description);
    }

    // if there is no user submitted text, just concat the title, caption and description.
    return data.title + ' ' + data.caption + ' ' + data.description;
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.getContentHeight = function() {
    /// <summary>
    ///     Gets the content height.
    /// </summary>
    /// <returns type="Number"></returns>
    // don't include the description.
    var isImageVisible = this._image$3.isVisible;

    this._image$3.isVisible = true;
    var heightText = People.RecentActivity.UI.Core.HtmlHelper.getTotalScrollHeight(this._text$3.element);
    var heightPreview = People.RecentActivity.UI.Core.HtmlHelper.getTotalScrollHeight(this._preview$3);
    this._image$3.isVisible = isImageVisible;

    var contentHeight = heightText + heightPreview;

    if (!this._isImageLoaded$3 && !this.isFixedWidth) {
        var heightImage = this._image$3.height;

        if (this._isColumnLayout$3) {
            contentHeight += Math.max(115, heightImage - heightPreview);
        }
        else {
            // don't just add the height of the image, that'd be silly. make sure we take into account
            // that it might have been scaled (or will be scaled, depending on when this is called.)
            var widthImage = this._image$3.width;
            var widthContainer = WinJS.Utilities.getTotalWidth(this._preview$3);

            if (widthImage > widthContainer) {
                // multiply the height of the image with the scaling factor to get a more accurate estimate.
                heightImage *= widthContainer / widthImage;
            }

            contentHeight += heightImage;
        }    
    }

    return contentHeight;
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.getState = function() {
    /// <summary>
    ///     Gets the state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this.isLoaded) {
        var state = People.RecentActivity.UI.Feed.EntryControl.prototype.getState.call(this);

        // set the item specific state, which we already saved.
        state.s = this._state$3;

        return state;
    }

    return null;
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype.setState = function(state) {
    /// <summary>
    ///     Sets the state.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
    // retrieve the item specific state
    this._state$3 = (state != null) ? (state).s : null;

    People.RecentActivity.UI.Feed.EntryControl.prototype.setState.call(this, state);
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype._setIsColumnLayout$3 = function(isColumnLayout) {
    /// <param name="isColumnLayout" type="Boolean"></param>
    if (isColumnLayout !== this._isColumnLayout$3) {
        this._isColumnLayout$3 = isColumnLayout;
        if (this._isColumnLayout$3) {
            this.addClass('ra-itemLinkColumns');
        }
        else {
            this.removeClass('ra-itemLinkColumns');
        }    
    }
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype._setIsImageLoaded$3 = function(isImageLoaded) {
    /// <param name="isImageLoaded" type="Boolean"></param>
    if (isImageLoaded !== this._isImageLoaded$3) {
        this._isImageLoaded$3 = isImageLoaded;
        if (this._isImageLoaded$3) {
            this.addClass('ra-itemLinkImageLoaded');
        }
        else {
            this.removeClass('ra-itemLinkImageLoaded');
        }    
    }
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype._getTileUrl$3 = function() {
    /// <returns type="String"></returns>
    var entry = this.entry;
    var data = entry.data;

    // check to see if we can unwrap this URL to show a (usually) bigger image.
    var url = data.tile;
    if (Jx.isNonEmptyString(url)) {
        var transforms = People.RecentActivity.Configuration.linkUrlTransforms;
        for (var i = 0, count = transforms.length; i < count; i++) {
            // try to match the URL against the regex to try and get a proper/big image.
            var previewUrl = transforms[i].createPreviewUrl(url);
            if (Jx.isNonEmptyString(previewUrl)) {
                // mark as unwrapped so that we know we need to fall back if this image fails to load.
                this._isUnwrapped$3 = true;
                return previewUrl;
            }        
        }    
    }

    return url;
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype._adjustTextHeight$3 = function() {
    if (this.orientation === 1) {
        // there is no max-height in vertical or in fixed width mode.
        this._text$3.removeClass('ra-itemLinkTextFixed');
    }
    else {
        this._text$3.addClass('ra-itemLinkTextFixed');
    }
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype._applyColumnLayout$3 = function() {
    // for this to be correct, we should make sure the outer frame has been rendered.
    if (this.ensureFrameRendered()) {

        var styleImage = this._image$3.element.style;

        // if we have state, we stored whether this is a column layout, so we don't need to do all of that stuff.
        if (this._state$3 != null) {
            this._setIsColumnLayout$3(this._state$3.i);
            styleImage.maxHeight = this._state$3.s;
            return;
        }

        // capture the display style for the element and then clear it
        var display = this.setTemporaryVisibility();

        // get the size of the image and then figure out what template to use.
        styleImage.maxHeight = (this.isFixedWidth) ? '' : this._image$3.height + 'px';

        if (this.isFixedWidth || (this.orientation === 1)) {
            // in snap or fixed width, we don't use column mode no matter what.
            this._setIsColumnLayout$3(false);
        }
        else if (this._image$3.width > 180) {
            this._setIsColumnLayout$3(false);

            // sometimes this is hit before the content gets rendered.
            if ((this._preview$3 != null) && (this._title$3 != null)) {
                // when we're in horizontal mode, we need to ensure the image is always visible.
                var height = this._element$3.clientHeight - WinJS.Utilities.getTotalHeight(this._title$3.element) - WinJS.Utilities.getTotalHeight(this._text$3.element);
                styleImage.maxHeight = height + 'px';
            }
        }
        else {
            // use the two-column layout for images that are this small.
            this._setIsColumnLayout$3(true);
        }

        // restore the display style.
        this.restoreTemporaryVisibility(display);

        // since we already have everything needed ready, save them to state. So later we can quickly return the saved state when asked.
        this._state$3 = People.RecentActivity.UI.Feed.create_linkEntryState(this._isColumnLayout$3, styleImage.maxHeight);
    }
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype._onImageFailed$3 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');

    if (this._isUnwrapped$3) {
        // okay, we failed to load the unwrapped image, so lets try the normal one.
        this._isUnwrapped$3 = false;
        var entry = this.entry;
        var data = entry.data;
        this._image$3.source = data.tile;
    }
    else {
        People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadLinkTileStop);

        // we failed to load the image completely.
        this._setIsImageLoaded$3(true);
        this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
        this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);
        this._image$3.isVisible = false;
        this.addClass('ra-itemLinkNoImage');

        if (this.isRendered) {
            // only signal that the rendering has ended if we've rendered already.
            this.onRenderingEnded();
        }    
    }
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype._onImageLoaded$3 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadLinkTileStop);

    this._setIsImageLoaded$3(true);
    this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
    this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);

    // only update the text and so on if the entry has actually been rendered.
    if (this.isRendered) {
        this._adjustTextHeight$3();
        this._applyColumnLayout$3();
        this.onRenderingEnded();
    }
};

People.RecentActivity.UI.Feed.LinkEntryControl.prototype._onTitleClicked$3 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev');

    var entry = this.entry;
    var data = entry.data;

    // open up the URL in mobro.
    People.RecentActivity.UI.Core.UriHelper.launchUri(data.url);

    ev.cancelBubble = true;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Permissions.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="MetadataCommentControl.js" />
/// <reference path="MetadataReactionControl.js" />

People.RecentActivity.UI.Feed.MetadataControl = function(element, elementErrors, entry) {
    /// <summary>
    ///     Provides a control for rendering reaction and comment controls.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="elementErrors" type="HTMLElement">The errors container.</param>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_entry$1" type="People.RecentActivity.FeedEntry">The feed entry.</field>
    /// <field name="_reactions$1" type="Array">The controls.</field>
    /// <field name="_comments$1" type="People.RecentActivity.UI.Feed.MetadataCommentControl">The comment control.</field>
    /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);

    Debug.assert(element != null, 'element');
    Debug.assert(elementErrors != null, 'elementErrors');
    Debug.assert(entry != null, 'entry');

    this._reactions$1 = [];

    this._entry$1 = entry;
    this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._entry$1.network.identity, People.RecentActivity.UI.Core.ErrorMessageContext.none, People.RecentActivity.UI.Core.ErrorMessageOperation.write, elementErrors);
    this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;
    this._errors$1.render();
    this._errors$1.isVisible = false;
};

Jx.inherit(People.RecentActivity.UI.Feed.MetadataControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Feed.MetadataControl.prototype._entry$1 = null;
People.RecentActivity.UI.Feed.MetadataControl.prototype._reactions$1 = null;
People.RecentActivity.UI.Feed.MetadataControl.prototype._comments$1 = null;
People.RecentActivity.UI.Feed.MetadataControl.prototype._errors$1 = null;

People.RecentActivity.UI.Feed.MetadataControl.prototype.getAriaLabels = function() {
    /// <summary>
    ///     Gets the ARIA labels for the reactions, comments.
    /// </summary>
    /// <returns type="Array" elementType="String"></returns>
    var labels = [];

    for (var i = 0, len = this._reactions$1.length; i < len; i++) {
        // get the label for each reaction type.
        var label = this._reactions$1[i].getAriaLabel();
        if (Jx.isNonEmptyString(label)) {
            labels.push(label);
        }    
    }

    if (this._comments$1 != null) {
        // get the label for the comments control.
        var label = this._comments$1.getAriaLabel();
        if (Jx.isNonEmptyString(label)) {
            labels.push(label);
        }    
    }

    return labels;
};

People.RecentActivity.UI.Feed.MetadataControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    for (var i = 0, len = this._reactions$1.length; i < len; i++) {
        this._reactions$1[i].dispose();
    }

    this._reactions$1.length = 0;

    if (this._comments$1 != null) {
        this._comments$1.dispose();
        this._comments$1 = null;
    }

    if (this._errors$1 != null) {
        this._errors$1.dispose();
        this._errors$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.MetadataControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>

    // add all the reaction icons.
    this._renderReactions$1();

    // then add the comment icon (if needed)
    this._renderComments$1();

    // compute the max-width of each reaction/comment section.
    var length = this._reactions$1.length;

    if (this._comments$1 != null) {
        length += 1;
    }

    var width = (100 / length) + '%';

    // set the max-width on each control.
    for (var i = 0, len = this._reactions$1.length; i < len; i++) {
        this._reactions$1[i].element.style.maxWidth = width;
    }

    if (this._comments$1 != null) {
        // don't forget to update the width of comments.
        this._comments$1.element.style.maxWidth = width;
    }

    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
};

People.RecentActivity.UI.Feed.MetadataControl.prototype._renderReactions$1 = function() {
    var element = this.element;
    var reactions = this._entry$1.reactions;

    for (var i = 0, len = reactions.count; i < len; i++) {
        var child = People.RecentActivity.UI.Core.HtmlHelper.findElementByClass(element, reactions.item(i).type.iconClass);

        // initialize a new control, render it and append it -- but only if a control doesn't exist already.
        var control = new People.RecentActivity.UI.Feed.MetadataReactionControl(child, this._errors$1, reactions.item(i));
            control.render();

        if (child == null) {
            // we need to append the control because nothing was rendered yet.
            this.appendControl(control);
        }

        this._reactions$1.push(control);
    }
};

People.RecentActivity.UI.Feed.MetadataControl.prototype._renderComments$1 = function() {
    var comments = this._entry$1.comments;
    var commentsEnabled = this._entry$1.network.capabilities.commentsEnabled;
    var commentsPermissions = (comments.permissions & People.RecentActivity.Core.Permissions.add) === People.RecentActivity.Core.Permissions.add;

    if (commentsEnabled && commentsPermissions) {
        var child = People.RecentActivity.UI.Core.HtmlHelper.findElementByClass(this.element, 'ra-networkComments' + this._entry$1.sourceId);

        // append the control for the comments.
        this._comments$1 = new People.RecentActivity.UI.Feed.MetadataCommentControl(child, this._entry$1);
        this._comments$1.render();

        if (child == null) {
            // we generated a new element, so append it.
            this.appendControl(this._comments$1);
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Core\Permissions.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.Feed.MetadataCommentControl = function(element, entry) {
    /// <summary>
    ///     Provides a control for rendering a comment control.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element, if one has been pre-initialized.</param>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_entry$1" type="People.RecentActivity.FeedEntry">The feed entry.</field>
    /// <field name="_countSection$1" type="People.RecentActivity.UI.Core.Control">The count section.</field>
    /// <field name="_count$1" type="People.RecentActivity.UI.Core.Control">The count.</field>
    /// <field name="_countNext$1" type="People.RecentActivity.UI.Core.Control">The next count.</field>
    /// <field name="_icon$1" type="People.RecentActivity.UI.Core.Control">The icon.</field>
    /// <field name="_action$1" type="People.RecentActivity.UI.Core.Control">The action.</field>
    /// <field name="_actionUndo$1" type="People.RecentActivity.UI.Core.Control">The undo action.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);
    Debug.assert(entry != null, 'entry');
    this._entry$1 = entry;
};

Jx.inherit(People.RecentActivity.UI.Feed.MetadataCommentControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._entry$1 = null;
People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._countSection$1 = null;
People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._count$1 = null;
People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._countNext$1 = null;
People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._icon$1 = null;
People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._action$1 = null;
People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._actionUndo$1 = null;

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype.getAriaLabel = function() {
    /// <summary>
    ///     Gets the ARIA label.
    /// </summary>
    /// <returns type="String"></returns>
    return this._count$1.label;
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    // detach from the comments.
    this._entry$1.comments.removeListenerSafe("propertychanged", this._onCommentsPropertyChanged$1, this);
    if (this._count$1 != null) {
        this._count$1.dispose();
        this._count$1 = null;
    }

    if (this._countNext$1 != null) {
        this._countNext$1.dispose();
        this._countNext$1 = null;
    }

    if (this._countSection$1 != null) {
        this._countSection$1.dispose();
        this._countSection$1 = null;
    }

    if (this._icon$1 != null) {
        this._icon$1.dispose();
        this._icon$1 = null;
    }

    if (this._action$1 != null) {
        this._action$1.dispose();
        this._action$1 = null;
    }

    if (this._actionUndo$1 != null) {
        this._actionUndo$1.dispose();
        this._actionUndo$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    var dynamic = true;
    // attach to the collection for count updates.
    var comments = this._entry$1.comments;
    comments.addListener("propertychanged", this._onCommentsPropertyChanged$1, this);
    var element = this.element;
    if (element == null) {
        // we need to initialize a new element for this control.
        element = this.element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryReactionIcon);
        dynamic = false;
    }

    var elementChildren = element.children[0].children;
    this.attach('click', this._onClicked$1.bind(this));
    // attach animations to the button
    People.Animation.addTapAnimation(element);
    // don't forget to set the icon of course.
    this._countSection$1 = People.RecentActivity.UI.Core.Control.fromElement(elementChildren[0]);
    this._count$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(elementChildren[0], 'reaction-count');
    this._countNext$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(elementChildren[0], 'reaction-count-next');
    this._icon$1 = People.RecentActivity.UI.Core.Control.fromElement(elementChildren[1]);
    this._action$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'reaction-action');
    this._actionUndo$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'reaction-action-undo');
    if (!dynamic) {
        this.addClass('ra-networkComments' + this._entry$1.sourceId);
        // update the state of the count, and actions.
        this._countNext$1.isVisible = false;
        this._actionUndo$1.isVisible = false;
    }

    // update the count for the comments.
    // we need to do this even if we're dynamic because the user may have added comments on self-page.
    this._update$1();
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._canReact$1 = function() {
    /// <returns type="Boolean"></returns>
    return (this._entry$1.comments.permissions & People.RecentActivity.Core.Permissions.add) === People.RecentActivity.Core.Permissions.add;
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._update$1 = function() {
    this._updateAction$1();
    this._updateCount$1();
    this._updateIcon$1();
    if (this._canReact$1()) {
        this.addClass('ra-itemReactionActionable');
        this.isDisabled = false;
    }
    else {
        this.removeClass('ra-itemReactionActionable');
        this.isDisabled = true;
    }
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._updateAction$1 = function() {
    if (this._canReact$1()) {
        this._action$1.isVisible = true;
        this._action$1.text = Jx.res.getString('/strings/raItemReaction-Comment-' + this._entry$1.sourceId);
    }
    else {
        this._action$1.isVisible = false;
    }

    // always hide from the screenreader.
    this._action$1.isHiddenFromScreenReader = true;
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._updateCount$1 = function() {
    var sourceId = this._entry$1.sourceId;
    var count = this._entry$1.comments.totalCount;
    if ((!count) || !this._entry$1.comments.totalCountEnabled) {
        // hide the count element.
        this._count$1.label = Jx.res.getString('/strings/raItemReaction-Comment-' + sourceId + '-label-countZero');
        this._count$1.text = '';
        this._count$1.isVisible = false;
        this._countSection$1.isVisible = false;
        // only show ourselves if there is either a count, or the user can react (or both)
        this.isVisible = this._canReact$1();
    }
    else {
        this.isVisible = true;
        // set the count and show the element.
        this._countSection$1.isVisible = true;
        this._count$1.isVisible = true;
        this._count$1.isHiddenFromScreenReader = true;
        this._count$1.label = People.RecentActivity.UI.Core.LocalizationHelper.getCountString(null, '/strings/raItemReaction-Comment-' + sourceId + '-label-countOne', '/strings/raItemReaction-Comment-' + sourceId + '-label-countMany', count);
        this._count$1.text = (count >= 100) ? Jx.res.getString('/strings/raItemReaction-99plus') : count.toString();
    }

    // item can never be interacted with.
    this.isHiddenFromScreenReader = true;
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._updateIcon$1 = function() {
    // update the icon source based on the state.
    this._icon$1.text = this._entry$1.comments.icon;
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._onCommentsPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e');
    if (e.propertyName === 'TotalCount') {
        // update the count on the comments.
        this._update$1();
    }
};

People.RecentActivity.UI.Feed.MetadataCommentControl.prototype._onClicked$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev');
    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject(this._entry$1, null, true, false);
    ev.cancelBubble = true;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Core\Permissions.js" />
/// <reference path="..\..\..\Core\ResultCode.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\..\Model\Events\ReactionActionCompletedEventArgs.js" />
/// <reference path="..\..\..\Model\ReactionCollection.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.Feed.MetadataReactionControl = function(element, errors, collection) {
    /// <summary>
    ///     Provides a control for rendering reaction controls.
    /// </summary>
    /// <param name="element" type="HTMLElement">An existing element for the control, if any.</param>
    /// <param name="errors" type="People.RecentActivity.UI.Core.ErrorMessageControl">The error message control.</param>
    /// <param name="collection" type="People.RecentActivity.ReactionCollection">The collection.</param>
    /// <field name="_collection$1" type="People.RecentActivity.ReactionCollection">The collection.</field>
    /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors.</field>
    /// <field name="_countSection$1" type="People.RecentActivity.UI.Core.Control">The count section.</field>
    /// <field name="_count$1" type="People.RecentActivity.UI.Core.Control">The count.</field>
    /// <field name="_countNext$1" type="People.RecentActivity.UI.Core.Control">The next count.</field>
    /// <field name="_icon$1" type="People.RecentActivity.UI.Core.Control">The icon.</field>
    /// <field name="_action$1" type="People.RecentActivity.UI.Core.Control">The action.</field>
    /// <field name="_actionUndo$1" type="People.RecentActivity.UI.Core.Control">The undo action.</field>
    /// <field name="_currentCount$1" type="Number" integer="true">The current reaction count.</field>
    /// <field name="_userReaction$1" type="Boolean">Whether the user has reacted to this.</field>
    People.RecentActivity.UI.Core.Control.call(this, element);
    Debug.assert(errors != null, 'errors');
    Debug.assert(collection != null, 'collection');
    this._collection$1 = collection;
    this._errors$1 = errors;
};

Jx.inherit(People.RecentActivity.UI.Feed.MetadataReactionControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._collection$1 = null;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._errors$1 = null;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._countSection$1 = null;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._count$1 = null;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._countNext$1 = null;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._icon$1 = null;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._action$1 = null;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._actionUndo$1 = null;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._currentCount$1 = 0;
People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._userReaction$1 = false;

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype.getAriaLabel = function() {
    /// <summary>
    ///     Gets the ARIA label.
    /// </summary>
    /// <returns type="String"></returns>
    if (!this._canReact$1()) {
        // we can't react, so there is no point in reading this to the user.
        return '';
    }
    else {
        var type = this._collection$1.type;
        if (type.isToggle || !type.isCountShown) {
            // we need to return something along the lines of "Update is <not> reacted".
            if (this._collection$1.containsUser()) {
                return Jx.res.getString(type.stringId + 'label-active');
            }
            else {
                return Jx.res.getString(type.stringId + 'label-inactive');
            }

        }
        else {
            // simply return the label already on the count.
            return this._count$1.label;
        }    
    }
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._errors$1 = null;
    if (this._collection$1 != null) {
        this._collection$1.removeListenerSafe("collectionchanged", this._onCollectionChanged$1, this);
        this._collection$1.removeListenerSafe("propertychanged", this._onCollectionPropertyChanged$1, this);
        this._collection$1.removeListenerSafe("addreactioncompleted", this._onReactionActionCompleted$1, this);
        this._collection$1.removeListenerSafe("removereactioncompleted", this._onReactionActionCompleted$1, this);
        this._collection$1 = null;
    }

    if (this._count$1 != null) {
        this._count$1.dispose();
        this._count$1 = null;
    }

    if (this._countNext$1 != null) {
        this._countNext$1.dispose();
        this._countNext$1 = null;
    }

    if (this._countSection$1 != null) {
        this._countSection$1.dispose();
        this._countSection$1 = null;
    }

    if (this._icon$1 != null) {
        this._icon$1.dispose();
        this._icon$1 = null;
    }

    if (this._action$1 != null) {
        this._action$1.dispose();
        this._action$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    var dynamic = true;

    // attach to the collection for count updates.
    this._collection$1.addListener("collectionchanged", this._onCollectionChanged$1, this);
    this._collection$1.addListener("propertychanged", this._onCollectionPropertyChanged$1, this);
    this._collection$1.addListener("addreactioncompleted", this._onReactionActionCompleted$1, this);
    this._collection$1.addListener("removereactioncompleted", this._onReactionActionCompleted$1, this);

    var element = this.element;
    if (element == null) {
        // there is no element yet, so initialize one.
        element = this.element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryReactionIcon);
        dynamic = false;
    }

    var elementChildren = element.children[0].children;
    this.attach('click', this._onClicked$1.bind(this));

    // attach animations to the button
    People.Animation.addTapAnimation(element);

    // don't forget to set the icon of course.
    this._countSection$1 = People.RecentActivity.UI.Core.Control.fromElement(elementChildren[0]);
    this._count$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(elementChildren[0], 'reaction-count');
    this._countNext$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(elementChildren[0], 'reaction-count-next');
    this._icon$1 = People.RecentActivity.UI.Core.Control.fromElement(elementChildren[1]);
    this._action$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'reaction-action');
    this._actionUndo$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'reaction-action-undo');

    if (dynamic) {
        // figure out if the user had previously liked the item.
        this._userReaction$1 = this.hasClass('ra-itemReactionActive');
    }
    else {
        this.addClass(this._collection$1.type.iconClass);
        // update the text, and update the reactions.
        this._action$1.text = Jx.res.getString(this._collection$1.type.stringId + 'react');
        this._actionUndo$1.text = Jx.res.getString(this._collection$1.type.stringId + ((this._canRemoveReaction$1()) ? 'unreact' : 'user-reacted'));
    }

    // update the count for the reactions.
    // we need to do this even if we're "dynamic" because the user may have updated reaction count on the self-page.
    this._update$1(!dynamic);
    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._canAddReaction$1 = function() {
    /// <returns type="Boolean"></returns>
    return (this._collection$1.permissions & People.RecentActivity.Core.Permissions.add) === People.RecentActivity.Core.Permissions.add;
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._canRemoveReaction$1 = function() {
    /// <returns type="Boolean"></returns>
    return (this._collection$1.permissions & People.RecentActivity.Core.Permissions.remove) === People.RecentActivity.Core.Permissions.remove;
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._canReact$1 = function() {
    /// <returns type="Boolean"></returns>
    var userReaction = this._collection$1.containsUser();
    return (userReaction && this._canRemoveReaction$1()) || (!userReaction && this._canAddReaction$1());
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._updateAction$1 = function(initial) {
    /// <param name="initial" type="Boolean"></param>
    var that = this;
    
    var previousState = this._userReaction$1;
    this._userReaction$1 = this._collection$1.containsUser();
    if (initial) {
        // Force the change
        this._updateActionControls$1();
    }
    else if (previousState !== this._userReaction$1) {
        var incomingControl = (this._userReaction$1) ? this._actionUndo$1 : this._action$1;
        var outgoingControl = (this._userReaction$1) ? this._action$1 : this._actionUndo$1;
        incomingControl.isHidden = false;
        incomingControl.isHiddenFromScreenReader = true;
        outgoingControl.isHidden = false;
        outgoingControl.isHiddenFromScreenReader = true;
        var incoming = incomingControl.element;
        incoming.style.opacity = '0';
        incoming.style.zIndex = 1;
        var outgoing = outgoingControl.element;
        outgoing.style.opacity = '1';
        outgoing.style.zIndex = 0;
        People.Animation.crossFade(incoming, outgoing).done(function() {
            if (!that.isDisposed) {
                incoming.style.opacity = '';
                outgoing.style.opacity = '';
                that._updateActionControls$1();
            }

            return null;
        });
    }
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._updateActionControls$1 = function() {
    if (this._userReaction$1) {
        this.addClass('ra-itemReactionActive');
        this._actionUndo$1.isHidden = false;
        this._action$1.isHidden = true;
    }
    else {
        this.removeClass('ra-itemReactionActive');
        this._actionUndo$1.isHidden = true;
        this._action$1.isHidden = false;
    }

    // no matter what, hide it from the screenreader.
    this._action$1.isHiddenFromScreenReader = true;
    this._actionUndo$1.isHiddenFromScreenReader = true;
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._updateCount$1 = function(initial) {
    /// <param name="initial" type="Boolean"></param>
    var that = this;
    
    var previousCount = this._currentCount$1;
    this._currentCount$1 = this._collection$1.totalCount;
    var type = this._collection$1.type;
    if (initial) {
        this._updateCountControls$1(this._currentCount$1);
    }
    else if (this._countSection$1.isVisible && (previousCount !== this._currentCount$1)) {
        var stringId = type.stringId;
        // Ensure the next count is accurate before we transition.
        this._updateCountControl$1(this._countNext$1, stringId, this._currentCount$1);
        if (this._countNext$1.text === this._count$1.text) {
            // Don't animate since there will be no change.
            return;
        }

        this._countNext$1.isHidden = false;
        this._countNext$1.isHiddenFromScreenReader = true;
        var incoming = this._countNext$1.element;
        incoming.style.opacity = '0';
        incoming.style.zIndex = 1;
        var outgoing = this._count$1.element;
        outgoing.style.opacity = '1';
        outgoing.style.zIndex = 0;
        People.Animation.crossFade(incoming, outgoing).done(function() {
            if (!that.isDisposed) {
                incoming.style.opacity = '';
                outgoing.style.opacity = '';
                var next = that._count$1;
                that._count$1 = that._countNext$1;
                that._countNext$1 = next;
                that._updateCountControls$1(that._currentCount$1);
            }

            return null;
        });
    }
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._updateCountControls$1 = function(count) {
    /// <param name="count" type="Number" integer="true"></param>
    var type = this._collection$1.type;
    if (type.isToggle || !type.isCountShown) {
        this._count$1.isVisible = false;
        this._countNext$1.isVisible = false;
        this._countSection$1.isVisible = false;
        // only show if the user has already reacted, or if the user can add a reaction.
        this.isVisible = this._collection$1.containsUser() || this._canReact$1();
    }
    else {
        var stringId = type.stringId;
        this._countSection$1.isVisible = true;
        this._count$1.isVisible = true;
        // Update the primary count.
        this._updateCountControl$1(this._count$1, stringId, count);
        // Update the next count.
        if (this._canReact$1()) {
            var nextCount;
            if (this._collection$1.containsUser() && this._canRemoveReaction$1()) {
                nextCount = Math.max(0, count - 1);
            }
            else {
                nextCount = count + 1;
            }

            this._updateCountControl$1(this._countNext$1, stringId, nextCount);
            this._countNext$1.isVisible = true;
            this._countNext$1.isHidden = true;
        }
        else {
            this._countNext$1.isVisible = false;
            this._countNext$1.isHidden = true;
        }

        this.isVisible = count > 0 || this._canReact$1();
    }

    // item can never be interacted with.
    this.isHiddenFromScreenReader = true;
    this._countSection$1.isHiddenFromScreenReader = true;
    this._count$1.isHiddenFromScreenReader = true;
    this._countNext$1.isHiddenFromScreenReader = true;
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._updateCountControl$1 = function(countControl, stringId, count) {
    /// <param name="countControl" type="People.RecentActivity.UI.Core.Control"></param>
    /// <param name="stringId" type="String"></param>
    /// <param name="count" type="Number" integer="true"></param>
    countControl.label = People.RecentActivity.UI.Core.LocalizationHelper.getCountString(stringId + 'label-countZero', stringId + 'label-countOne', stringId + 'label-countMany', count);
    if (!count) {
        countControl.text = '';
    }
    else {
        countControl.text = (count >= 100) ? Jx.res.getString('/strings/raItemReaction-99plus') : count.toString();
    }
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._updateIcon$1 = function() {
    // update the icon source based on the state.
    if (!Jx.isNonEmptyString(this._icon$1.text)) {
        this._icon$1.text = this._collection$1.type.iconFeed;
    }
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._update$1 = function(initial) {
    /// <param name="initial" type="Boolean"></param>
    this._updateAction$1(initial);
    this._updateCount$1(initial);
    this._updateIcon$1();
    if (this._canReact$1()) {
        this.addClass('ra-itemReactionActionable');
        this.isDisabled = false;
    }
    else {
        this.removeClass('ra-itemReactionActionable');
        this.isDisabled = true;
    }
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._onReactionActionCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.ReactionActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e');
    // re-enable the control.
    this.isDisabled = false;
    var result = e.result;
    if (result.code !== People.RecentActivity.Core.ResultCode.success) {
        // show the error control.
        this._errors$1.isVisible = true;
        this._errors$1.show(result);
    }
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._onCollectionChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e');
    this._update$1(false);
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._onCollectionPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e');
    if (e.propertyName === 'TotalCount') {
        // update the count on the comments.
        this._update$1(false);
    }
};

People.RecentActivity.UI.Feed.MetadataReactionControl.prototype._onClicked$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev');
    // hide the errors ... for now.
    this._errors$1.isVisible = false;
    // disable the button until we get a response.
    this.isDisabled = true;
    if (this._collection$1.containsUser()) {
        if (this._canRemoveReaction$1()) {
            this._collection$1.remove();
            return;
        }

    }
    else {
        if (this._canAddReaction$1()) {
            this._collection$1.add();
            return;
        }    
    }

    // we should never get here, but whatever.
    this.isDisabled = false;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\..\Model\Photo.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\ImageControl.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\Navigation\SelfPageAlbumData.js" />
/// <reference path="..\States\PhotoAlbumEntryImageState.js" />
/// <reference path="EntryControl.js" />

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl = function(entry) {
    /// <summary>
    ///     Provides a simple photo album item.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_defaultMaximumWidth$3" type="Number" integer="true" static="true">The default maximum width of an entry.</field>
    /// <field name="_content$3" type="HTMLElement">The content.</field>
    /// <field name="_contentGrid$3" type="HTMLElement">The content grid.</field>
    /// <field name="_imageHero$3" type="People.RecentActivity.UI.Core.ImageControl">The hero container.</field>
    /// <field name="_imageThumb1$3" type="People.RecentActivity.UI.Core.ImageControl">The thumbnail container.</field>
    /// <field name="_imageThumb2$3" type="People.RecentActivity.UI.Core.ImageControl">The second thumbnail container.</field>
    /// <field name="_containerHero$3" type="People.RecentActivity.UI.Core.Control">The hero container.</field>
    /// <field name="_containerThumb1$3" type="People.RecentActivity.UI.Core.Control">The thumbnail container.</field>
    /// <field name="_containerThumb2$3" type="People.RecentActivity.UI.Core.Control">The second thumbnail container.</field>
    /// <field name="_caption$3" type="People.RecentActivity.UI.Core.Control">The caption.</field>
    /// <field name="_captionButton$3" type="People.RecentActivity.UI.Core.Control">Any sub-controls in the caption.</field>
    /// <field name="_photoHero$3" type="People.RecentActivity.Photo">The hero photo.</field>
    /// <field name="_photoThumb1$3" type="People.RecentActivity.Photo">The thumbnail photo.</field>
    /// <field name="_photoThumb2$3" type="People.RecentActivity.Photo">The second thumbnail photo.</field>
    /// <field name="_photoCount$3" type="Number" integer="true">The number of photos to load.</field>
    People.RecentActivity.UI.Feed.EntryControl.call(this, entry);
    Debug.assert(entry.entryType === People.RecentActivity.FeedEntryType.photoAlbum, 'EntryType != PhotoAlbum');
};

Jx.inherit(People.RecentActivity.UI.Feed.PhotoAlbumEntryControl, People.RecentActivity.UI.Feed.EntryControl);


People.RecentActivity.UI.Feed.PhotoAlbumEntryControl._defaultMaximumWidth$3 = 833;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._content$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._contentGrid$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._imageHero$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._imageThumb1$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._imageThumb2$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._containerHero$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._containerThumb1$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._containerThumb2$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._caption$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._captionButton$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._photoHero$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._photoThumb1$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._photoThumb2$3 = null;
People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._photoCount$3 = 0;

Object.defineProperty(People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype, "hasImplicitWidth", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the width for the entry control is predefined in CSS.
        /// </summary>
        /// <value type="Boolean"></value>
        return false;
    },
    configurable: true
});

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.getAriaContentLabel = function() {
    /// <summary>
    ///     Gets the ARIA content label.
    /// </summary>
    /// <returns type="String"></returns>
    // simply return the user submitted text.
    var data = this.entry.data;
    return data.text;
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.getContentHeight = function() {
    /// <summary>
    ///     Gets the content height.
    /// </summary>
    /// <returns type="Number"></returns>
    // capture the display style for the element and then clear it
    var display = this.setTemporaryVisibility();
    var contentHeight = WinJS.Utilities.getTotalHeight(this._content$3);
    // restore the display style.
    this.restoreTemporaryVisibility(display);
    return contentHeight;
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the entry has been disposed.
    /// </summary>
    this._content$3 = null;
    this._disposeControls$3(this._containerHero$3, this._imageHero$3);
    this._disposeControls$3(this._containerThumb1$3, this._imageThumb1$3);
    this._disposeControls$3(this._containerThumb2$3, this._imageThumb2$3);
    this._containerHero$3 = null;
    this._containerThumb1$3 = null;
    this._containerThumb2$3 = null;
    this._imageHero$3 = null;
    this._imageThumb1$3 = null;
    this._imageThumb2$3 = null;
    if (this._caption$3 != null) {
        this._caption$3.dispose();
        this._caption$3 = null;
    }

    if (this._captionButton$3 != null) {
        this._captionButton$3.dispose();
        this._captionButton$3 = null;
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.onContentRendered = function() {
    /// <summary>
    ///     Occurs when the item is rendered.
    /// </summary>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onContentRendered.call(this);
    // update the size of the container and such.
    this._updateCaption$3();
    if (!this.isMarkupInitialized) {
        this._updatePhotoSizes$3();
    }

    // we're done rendering.
    this._onReady$3();
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.onLoad = function() {
    /// <summary>
    ///     Occurs when the entry is being preloaded.
    /// </summary>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoad.call(this);
    if (this.isMarkupInitialized) {
        // fetch the content from the existing element.
        this._content$3 = this.content.children[0];
        this._contentGrid$3 = this._content$3.children[0];
    }
    else {
        // initialize the content and then figure out what we need to show (small or rich).
        this._content$3 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryPhotoAlbum);
        this._contentGrid$3 = this._content$3.children[0];
        this.content.appendChild(this._content$3);
    }

    // fetch the caption.
    this._caption$3 = People.RecentActivity.UI.Core.Control.fromElement(this._content$3.children[1]);
    // load the image right away because it happens async on the background thread.
    // but first hide the image until we need to render it.
    var elementAlbum = this._content$3.children[0];
    var elementAlbumChildren = elementAlbum.children;
    this._containerHero$3 = People.RecentActivity.UI.Core.Control.fromElement(elementAlbumChildren[0]);
    this._containerThumb1$3 = People.RecentActivity.UI.Core.Control.fromElement(elementAlbumChildren[1]);
    this._containerThumb2$3 = People.RecentActivity.UI.Core.Control.fromElement(elementAlbumChildren[2]);
    this._imageHero$3 = new People.RecentActivity.UI.Core.ImageControl(elementAlbumChildren[0].children[0]);
    this._imageThumb1$3 = new People.RecentActivity.UI.Core.ImageControl(elementAlbumChildren[1].children[0]);
    this._imageThumb2$3 = new People.RecentActivity.UI.Core.ImageControl(elementAlbumChildren[2].children[0]);
    // fetch the data. we need to figure out exactly which image we need to use for the
    // hero image. we prefer a landscape photo if it's available.
    this._selectPhotos$3();
    if (this.isMarkupInitialized) {
        // hide images if we know they failed.
        this._imageHero$3.isVisible = !this._imageHero$3.hasClass('ra-photoAlbumImageFailed');
        this._imageHero$3.isHiddenFromScreenReader = true;
        this._imageThumb1$3.isVisible = !this._imageHero$3.hasClass('ra-photoAlbumImageFailed');
        this._imageThumb1$3.isHiddenFromScreenReader = true;
        this._imageThumb2$3.isVisible = !this._imageHero$3.hasClass('ra-photoAlbumImageFailed');
        this._imageThumb2$3.isHiddenFromScreenReader = true;
    }
    else {
        // the hero image should always exist.
        this._setImageSource$3(this._imageHero$3, this._photoHero$3);
        this._setImageSource$3(this._imageThumb1$3, this._photoThumb1$3);
        this._setImageSource$3(this._imageThumb2$3, this._photoThumb2$3);
    }

    // attach event handlers -- SetImageClickHandler will do the appropriate checks.
    this._setImageClickHandler$3(this._imageHero$3, this._photoHero$3);
    this._setImageClickHandler$3(this._imageThumb1$3, this._photoThumb1$3);
    this._setImageClickHandler$3(this._imageThumb2$3, this._photoThumb2$3);
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.onLoadElement = function(element) {
    /// <summary>
    ///     Occurs when the element should be loaded.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoadElement.call(this, element);
    this.addClass('ra-itemPhotoAlbum');
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.onOrientationChanged = function() {
    /// <summary>
    ///     Invoked when the item layout needs to be updated if needed.
    /// </summary>
    this._resizePhotos$3();
    People.RecentActivity.UI.Feed.EntryControl.prototype.onOrientationChanged.call(this);
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.onResized = function() {
    /// <summary>
    ///     Occurs when the layout is forced.
    /// </summary>
    // the photo album entry depends on screen size, so we need to invalidate content height and state.
    this.invalidateContentSize();
    this.setState(null);
    this._resizePhotos$3();
    People.RecentActivity.UI.Feed.EntryControl.prototype.onResized.call(this);
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.onFixedHeightChanged = function() {
    /// <summary>
    ///     Occurs when the entry becomes fixed height.
    /// </summary>
    this._updatePhotoSizes$3();
    People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedHeightChanged.call(this);
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype.getState = function() {
    /// <summary>
    ///     Gets the state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this.isLoaded) {
        return People.RecentActivity.UI.Feed.EntryControl.prototype.getState.call(this);
    }

    return null;
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._getImageState$3 = function(container, image) {
    /// <param name="container" type="People.RecentActivity.UI.Core.Control"></param>
    /// <param name="image" type="People.RecentActivity.UI.Core.Control"></param>
    /// <returns type="People.RecentActivity.UI.Feed.photoAlbumEntryImageState"></returns>
    var styleContainer = container.element.style;
    var styleImage = image.element.style;
    return People.RecentActivity.UI.Feed.create_photoAlbumEntryImageState(styleContainer.height, styleContainer.width, styleImage.left, styleImage.top);
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._onReady$3 = function() {
    if (this.isRendered && (!this._photoCount$3)) {
        // we're done rendering, woo!
        People.RecentActivity.UI.Feed.EntryControl.prototype.onRenderingEnded.call(this);
    }
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._disposeControls$3 = function(container, image) {
    /// <param name="container" type="People.RecentActivity.UI.Core.Control"></param>
    /// <param name="image" type="People.RecentActivity.UI.Core.ImageControl"></param>
    if (container != null) {
        container.dispose();
    }

    if (image != null) {
        image.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
        image.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);
        image.dispose();
    }
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._selectPhotos$3 = function() {
    var data = this.entry.data;
    // walk over each photo in the album, first to find a landscape hero photo.
    // after that, do it again to find any thumbnails we can display, and to get a hero
    // photo in case there are no landscape photos. not the prettiest code, but its 
    // simple and works well.
    var photos = data.displayPhotos;
    for (var i = 0, len = photos.length; i < len; i++) {
        var photo = photos[i];
        if ((this._photoHero$3 == null) && photo.isLandscape) {
            // we've found our hero image, hooray!
            this._photoHero$3 = photo;
            break;
        }    
    }

    for (var i = 0, len = photos.length; i < len; i++) {
        var photo = photos[i];
        if (photo !== this._photoHero$3) {
            if (this._photoHero$3 == null) {
                // make sure there is always a hero photo, even if we didn't find a landscape photo.
                this._photoHero$3 = photo;
            }
            else if (this._photoThumb1$3 == null) {
                this._photoThumb1$3 = photo;
            }
            else if (this._photoThumb2$3 == null) {
                this._photoThumb2$3 = photo;
            }
            else {
                break;
            }        
        }    
    }

    // do a quick sanity check.
    Debug.assert(this._photoHero$3 != null, 'No hero photo found');
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._setImageSource$3 = function(control, photo) {
    /// <param name="control" type="People.RecentActivity.UI.Core.ImageControl"></param>
    /// <param name="photo" type="People.RecentActivity.Photo"></param>
    Debug.assert(control != null, 'control != null');
    if (photo == null) {
        // there is no photo, so just hide the control.
        control.isVisible = false;
    }
    else {
        // simply set the background image.
        this._photoCount$3++;
        control.isBackground = true;
        control.addListener("imagefailed", this._onImageFailed$3, this);
        control.addListener("imageloaded", this._onImageLoaded$3, this);
        control.source = photo.source;
    }
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._setImageClickHandler$3 = function(control, photo) {
    /// <param name="control" type="People.RecentActivity.UI.Core.ImageControl"></param>
    /// <param name="photo" type="People.RecentActivity.Photo"></param>
    var that = this;
    
    if (photo != null) {
        // attach the handler for the click event.
        control.attach('click', function(ev) {
            // navigate to the self-page for this photo.
            People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject(that.entry, People.RecentActivity.UI.Core.create_selfPageAlbumData(false, photo.id));
            ev.cancelBubble = true;
        });
        People.Animation.addTapAnimation(control.element);
    }
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._updateCaption$3 = function() {
    var entry = this.entry;
    var data = entry.data;
    if (!data.isTagged && !entry.isShared) {
        // simply add our own flavor text, i.e. "added photos to album <name>".
        // set the text of the name control, and then hook up an event for clicks.
        var name = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryPhotoAlbumName));
        name.attach('click', this._onNameClicked$3.bind(this));
        name.text = data.album.name;
        name.isHiddenFromScreenReader = true;
        People.Animation.addTapAnimation(name.element);
        // format the string and append it to the caption.
        this._captionButton$3 = name;
        this._caption$3.element.innerHTML = '';
        this._caption$3.appendChild(People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement('/strings/ra-itemPhotoAlbumCaption', [ name.element ]));
    }
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._updatePhotoSizes$3 = function() {
    // for this to be correct, we should make sure the outer frame has been rendered.
    this.ensureFrameRendered();
    // figure out the size for the hero and the thumbnail photos.
    // we do this by simply assigning the appropriate min/max values to the grid.
    var isFixedHeight = this.isFixedHeight;
    var isFixedWidth = this.isFixedWidth || (this.orientation === 1);
    var isThumbVisible = this._containerThumb1$3.isVisible || this._containerThumb2$3.isVisible;
    var maximumWidth = Math.min(833, window.screen.width - 40);
    if (!isThumbVisible) {
        // if the thumbnails are not shown, we should only make enough space for the hero.
        maximumWidth *= 0.7;
        // also re-adjust the grid to only have one column.
        this._contentGrid$3.style['msGridColumns'] = '100%';
    }

    // the content is at 100% width in fixed width mode, but only the maximum width otherwise.
    this._content$3.style.width = (isFixedWidth) ? '100%' : maximumWidth + 'px';
    this._contentGrid$3.style.width = '';
    // each row is half the height of the hero.  
    // the height computation needs relies on the width of the content, which we can short-circuit if we're not in fixed-width mode.
    var contentWidth = (isFixedWidth) ? WinJS.Utilities.getContentWidth(this._contentGrid$3) : maximumWidth;
    var contentHeight = WinJS.Utilities.getContentHeight(this._contentGrid$3);
    var heightHero = (contentWidth / 1.5) * 0.7;
    var heightThumbs = heightHero / 2;
    if (isFixedHeight && (heightHero > contentHeight)) {
        // we're in fixed height mode, and we have less space available than we'd like...
        heightHero = contentHeight;
        heightThumbs = heightHero / 2;
        // we need to update the width of the container, too...
        contentWidth = (contentHeight / (10 / 15)) * (10 / 7);
        this._contentGrid$3.style.width = contentWidth + 'px';
    }

    this._contentGrid$3.style['msGridRows'] = heightThumbs + 'px ' + heightThumbs + 'px';
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._resizePhotos$3 = function() {
    if (this.isRendered) {
        this._updatePhotoSizes$3();
    }
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._onImageFailed$3 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e');
    // hide the image, and set a gray background box.
    var control = e.sender;
    control.addClass('ra-photoAlbumImageFailed');
    control.isVisible = false;
    Jx.addClass(control.element.parentNode, 'ra-itemPhotoAlbumImageBoxFailed');
    this._photoCount$3--;
    this._onReady$3();
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._onImageLoaded$3 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e');
    this._photoCount$3--;
    this._onReady$3();
};

People.RecentActivity.UI.Feed.PhotoAlbumEntryControl.prototype._onNameClicked$3 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev');
    // navigate to the photo album without going to a specific index.
    var data = this.entry.data;
    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject(data.album);
    ev.cancelBubble = true;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\..\Model\Photo.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\FormattedTextControl.js" />
/// <reference path="..\..\Core\Controls\ImageControl.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\States\PhotoEntryState.js" />
/// <reference path="EntryControl.js" />

People.RecentActivity.UI.Feed.PhotoEntryControl = function(entry) {
    /// <summary>
    ///     Provides a simple photo item.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_maximumHeightFixedMode$3" type="Number" integer="true" static="true">The height of photos in fixed-width, unknown-sized photo mode.</field>
    /// <field name="_maximumWidth$3" type="Number" integer="true" static="true">The maximum width of an entry.</field>
    /// <field name="_initialHeightGuess$3" type="Number" integer="true" static="true">The size we guess the photo is initially going to be.</field>
    /// <field name="_content$3" type="HTMLElement">The content element.</field>
    /// <field name="_image$3" type="People.RecentActivity.UI.Core.ImageControl">The image.</field>
    /// <field name="_caption$3" type="People.RecentActivity.UI.Core.FormattedTextControl">The caption text.</field>
    /// <field name="_container$3" type="People.RecentActivity.UI.Core.Control">The container.</field>
    /// <field name="_isReady$3" type="Boolean">Whether the control is ready.</field>
    /// <field name="_isLoaded$3" type="Boolean">Whether the photo has been loaded.</field>
    /// <field name="_isSized$3" type="Boolean">Whether the photo has been sized properly.</field>
    /// <field name="_isImplicitFixedWidth$3" type="Boolean">
    ///     Whether we've marked the item as "fixed width" because we didn't know the size of the photo
    ///     when we were rendering it. This is different from <c>IsFixedWidth</c> which is an
    ///     externally facing property.
    
    /// </field>
    /// <field name="_state$3" type="People.RecentActivity.UI.Feed.photoEntryState">The state.</field>
    People.RecentActivity.UI.Feed.EntryControl.call(this, entry);

    Debug.assert(entry.entryType === People.RecentActivity.FeedEntryType.photo, 'entry.EntryType == FeedEntryType.Photo');
};

Jx.inherit(People.RecentActivity.UI.Feed.PhotoEntryControl, People.RecentActivity.UI.Feed.EntryControl);

People.RecentActivity.UI.Feed.PhotoEntryControl._maximumHeightFixedMode$3 = 200;
People.RecentActivity.UI.Feed.PhotoEntryControl._maximumWidth$3 = 700;
People.RecentActivity.UI.Feed.PhotoEntryControl._initialHeightGuess$3 = 400;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._content$3 = null;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._image$3 = null;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._caption$3 = null;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._container$3 = null;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._isReady$3 = false;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._isLoaded$3 = false;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._isSized$3 = false;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._isImplicitFixedWidth$3 = false;
People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._state$3 = null;

Object.defineProperty(People.RecentActivity.UI.Feed.PhotoEntryControl.prototype, "hasImplicitWidth", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the width for item is predefined in CSS.
        /// </summary>
        /// <value type="Boolean"></value>
        return false;
    },
    configurable: true
});

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.getAriaContentLabel = function() {
    /// <summary>
    ///     Gets the ARIA content label.
    /// </summary>
    /// <returns type="String"></returns>
    var data = this.entry.data;

    var text = (data.text || '').trim();
    if (!Jx.isNonEmptyString(text)) {
        // use the caption of the photo instead.
        text = data.photo.caption;
    }

    return text;
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.getContentHeight = function() {
    /// <summary>
    ///     Gets the content height.
    /// </summary>
    /// <returns type="Number"></returns>
    // capture the display style for the element and then clear it
    var display = this.setTemporaryVisibility();
    var contentHeight = WinJS.Utilities.getTotalHeight(this._content$3);

    if (!this._isSized$3) {
        // this means we don't (yet) know the size of the photo. by default, let's assume 400px.
        contentHeight += 400;
    }

    // restore the display style.
    this.restoreTemporaryVisibility(display);

    return contentHeight;
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the entry has been disposed.
    /// </summary>
    this._content$3 = null;

    if (this._caption$3 != null) {
        this._caption$3.dispose();
        this._caption$3 = null;
    }

    if (this._container$3 != null) {
        this._container$3.dispose();
        this._container$3 = null;
    }

    if (this._image$3 != null) {
        this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
        this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);

        this._image$3.dispose();
        this._image$3 = null;
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.onContentRendered = function() {
    /// <summary>
    ///     Occurs when the item is rendered.
    /// </summary>
    if (!this.isMarkupInitialized) {
        // first set the caption.
        this._updateCaption$3();
    }

    // if we know the photo size, we can actually do all of the computations right now.
    // if not we'll just have to wait for the image to be loaded.
    this._updateLayout$3();

    this._isReady$3 = true;
    this._onReady$3();

    People.RecentActivity.UI.Feed.EntryControl.prototype.onContentRendered.call(this);
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.onLoad = function() {
    /// <summary>
    ///     Occurs when the entry is being loaded.
    /// </summary>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoad.call(this);

    var photo = this._getPhoto$3();

    if (this.isMarkupInitialized) {
        // initialize the content from existing markup.
        this._content$3 = this.content.children[0];

        // initialize the caption from an existing control.
        this._caption$3 = People.RecentActivity.UI.Core.FormattedTextControl.fromExistingElement(this._content$3.children[1], photo.sourceId, this._getCaptionEntities$3());
    }
    else {
        // initialize the content and then figure out what we need to show (small or rich).
        this._content$3 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryPhoto);
        this.content.appendChild(this._content$3);

        // initialize the caption from scratch.
        this._caption$3 = new People.RecentActivity.UI.Core.FormattedTextControl(this._content$3.children[1], photo.sourceId, true);
    }

    this._container$3 = People.RecentActivity.UI.Core.Control.fromElement(this._content$3.children[0]);

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoStart);

    // load the image right away because it happens async on the background thread.
    // but first hide the image until we need to render it. also, we do this even if there is existing
    // markup because we may not have gone through the full flow when the markup was stored.
    this._image$3 = new People.RecentActivity.UI.Core.ImageControl(this._content$3.children[0].children[0]);
    this._image$3.isVisible = false;

    if (Jx.isNonEmptyString(photo.source)) {
        this._image$3.addListener("imagefailed", this._onImageFailed$3, this);
        this._image$3.addListener("imageloaded", this._onImageLoaded$3, this);
        this._image$3.source = photo.source;

        if (this._image$3.isDimensionsAvailable || this._isKnownImageSize$3()) {
            // we know the size of the image, so update the entry size.
            this._updateLayout$3();
        }
    }
    else {
        this._isLoaded$3 = true;
    }
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.onLoadElement = function(element) {
    /// <summary>
    ///     Occurs when the element should be loaded.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoadElement.call(this, element);

    this.addClass('ra-itemPhoto');
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.onOrientationChanged = function() {
    /// <summary>
    ///     Occurs when the orientation has changed.
    /// </summary>
    if (this.isRendered) {
        // only ever do this if we've loaded the image already or if we know the image size beforehand.
        if ((this._isReady$3 && this._isLoaded$3) || this._isKnownImageSize$3()) {
            this._updatePhotoSizeAndPosition$3();
        }    
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onOrientationChanged.call(this);
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.onFixedHeightChanged = function() {
    /// <summary>
    ///     Occurs when the entry becomes fixed height.
    /// </summary>
    this.setState(null);
    this._updatePhotoSizeAndPosition$3();

    People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedHeightChanged.call(this);
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.getState = function() {
    /// <summary>
    ///     Gets the state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this.isLoaded) {
        var state = People.RecentActivity.UI.Feed.EntryControl.prototype.getState.call(this);

        // stash the item specific state.
        state.s = this._state$3;

        return state;
    }

    return null;
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype.setState = function(state) {
    /// <summary>
    ///     Sets the state.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
    // fetch the item specific state.
    this._state$3 = (state != null) ? (state).s : null;

    People.RecentActivity.UI.Feed.EntryControl.prototype.setState.call(this, state);
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._isKnownImageSize$3 = function() {
    /// <returns type="Boolean"></returns>
    if (this._state$3 != null) {
        // if we have state it means we know the exact size of the image and box.
        return true;
    }

    var photo = this._getPhoto$3();
    return (!!photo.sourceHeight) && (!!photo.sourceWidth);
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._getCaptionText$3 = function() {
    /// <returns type="String"></returns>
    var entry = this.entry;
    var data = entry.data;

    var text = (data.text || '').trim();
    if (Jx.isNonEmptyString(text)) {
        // use the user-submitted text, and the entities from the entry.
        return text;
    }
    else {
        // okay, try the actual caption of the photo itself then.
        return (data.photo.caption || '').trim();
    }
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._getCaptionEntities$3 = function() {
    /// <returns type="Array" elementType="Entity"></returns>
    var entry = this.entry;
    var data = entry.data;

    var text = (data.text || '').trim();
    if (Jx.isNonEmptyString(text)) {
        // use the user-submitted text, and the entities from the entry.
        return entry.entities;
    }
    else {
        // okay, try the actual caption of the photo itself then.
        var photo = data.photo;
        if (Jx.isNonEmptyString((photo.caption || '').trim())) {
            return photo.entities;
        }    
    }

    return new Array(0);
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._onReady$3 = function() {
    if (this._isReady$3 && this._isLoaded$3) {
        if (!this._isKnownImageSize$3()) {
            // this should be done for unknown sized photos -- for known sized photos we have already
            // rendered the UX correctly (because, you know, we know the size of photos)
            this._updatePhotoSizeAndPosition$3();
        }

        People.RecentActivity.UI.Feed.EntryControl.prototype.onRenderingEnded.call(this);
    }
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._updateLayout$3 = function() {
    if (this._isKnownImageSize$3() || this._image$3.isDimensionsAvailable) {
        this._updatePhotoSizeAndPosition$3();
    }
    else {
        if (this.isFixedWidth) {
            // if we're fixed mode, we can still determine the size of the photo, of course.
            this._updatePhotoSizeAndPosition$3();
        }

        this._isImplicitFixedWidth$3 = true;
        this.addClass('ra-itemPhotoFixed');
    }
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._updateCaption$3 = function() {
    var text = this._getCaptionText$3();
    if (Jx.isNonEmptyString(text)) {
        this._caption$3.update(text, this._getCaptionEntities$3());
        this._updateCaptionSize$3();
    }
    else {
        // there is no caption, so hide it.
        this._caption$3.isVisible = false;
    }
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._updateCaptionSize$3 = function() {
    if (!this.orientation) {
        if (this._isSized$3) {
            Jx.addClass(this._content$3, 'ra-itemPhotoContentAuto');
        }
        else {
            Jx.removeClass(this._content$3, 'ra-itemPhotoContentAuto');
        }    
    }
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._updatePhotoSizeAndPosition$3 = function() {
    // for this to be correct, we should make sure the outer frame has been rendered.
    this.ensureFrameRendered();

    var elementContainer = this._container$3.element;
    var elementImage = this._image$3.element;

    var styleContent = this._content$3.style;
    var styleContainer = elementContainer.style;
    var styleImage = elementImage.style;

    if (this._state$3 != null) {
        // we've got state, which means we also know the size of the photo. woo!
        styleImage.position = 'relative';
        styleImage.height = this._state$3.h;
        styleImage.left = this._state$3.x;
        styleImage.top = this._state$3.y;
        styleImage.width = this._state$3.w;

        styleContainer.height = this._state$3.h;
        styleContainer.width = styleContent.width = this._state$3.c;

        this._isSized$3 = true;
        this._updateCaptionSize$3();

        return;
    }

    // capture the display style for the element and then clear it
    var display = this.setTemporaryVisibility();

    // make sure the caption takes up at least one line of text.
    Jx.addClass(this._content$3, 'ra-itemPhotoContentTemp');

    styleContent.height = '';
    styleContent.width = '';

    styleContainer.height = '';
    styleContainer.width = '';

    var maxHeight = -1;
    var maxWidth = -1;

    var containerHeight = WinJS.Utilities.getContentHeight(elementContainer);
    var containerWidth = WinJS.Utilities.getContentWidth(elementContainer);

    if (!containerHeight) {
        // this happens in fixed-width cases when there is no explicit container height yet.
        containerHeight = containerWidth * (7 / 10);
    }

    var isFixedWidth = this._isImplicitFixedWidth$3 || this.isFixedWidth;
    var isKnownSize = this._isKnownImageSize$3() || this._image$3.isDimensionsAvailable;

    if (!this.orientation) {
        // we are bounded by the height of the container.
        maxWidth = (isFixedWidth || !isKnownSize) ? containerWidth : 700;
        maxHeight = (isFixedWidth && !isKnownSize) ? 200 : containerHeight;
    }
    else {
        maxHeight = 16777215;
        // to infinity and beyond!
        maxWidth = containerWidth;
    }

    var photo = this._getPhoto$3();

    // scale the photo to either edge if needed.
    var photoHeight = Math.max(photo.sourceHeight, this._image$3.height);
    if (!photoHeight) {
        photoHeight = 400;
    }

    var photoWidth = Math.max(photo.sourceWidth, this._image$3.width);
    if (!photoWidth) {
        photoWidth = containerWidth;
    }

    if (photoHeight > maxHeight) {
        // scale along the height edge first.
        photoWidth = (maxHeight / photoHeight) * photoWidth;
        photoHeight = maxHeight;
    }

    if (photoWidth > maxWidth) {
        photoHeight = (maxWidth / photoWidth) * photoHeight;
        photoWidth = maxWidth;
    }

    // now size the image correctly.
    styleImage.height = photoHeight + 'px';
    styleImage.width = photoWidth + 'px';

    // check to see if the photo still doesn't fit in the box.
    if (photoHeight > maxHeight) {
        styleImage.position = 'relative';
        styleImage.top = ((maxHeight - photoHeight) / 2) + 'px';
    }

    if (photoWidth > maxWidth) {
        styleImage.position = 'relative';
        styleImage.left = ((maxWidth - photoWidth) / 2) + 'px';
    }

    // update the width of the container as well.
    styleContainer.height = photoHeight + 'px';
    styleContainer.width = styleContent.width = Math.min(photoWidth, maxWidth) + 'px';

    // unset the temporary style for the grid size.
    Jx.removeClass(this._content$3, 'ra-itemPhotoContentTemp');
    this._isSized$3 = true;
    this._updateCaptionSize$3();

    // restore the display style.
    this.restoreTemporaryVisibility(display);
    this._state$3 = People.RecentActivity.UI.Feed.create_photoEntryState(styleContent.width, styleImage.width, styleImage.height, styleImage.left, styleImage.top);
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._getPhoto$3 = function() {
    /// <returns type="People.RecentActivity.Photo"></returns>
    var entry = this.entry;
    var data = entry.data;
    return data.photo;
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._onImageFailed$3 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoStop);

    // hide the photo when it fails.
    this._container$3.addClass('image-failed');

    this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
    this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);

    this._isLoaded$3 = true;
    this._onReady$3();
};

People.RecentActivity.UI.Feed.PhotoEntryControl.prototype._onImageLoaded$3 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoStop);

    this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
    this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);

    this._isLoaded$3 = true;
    this._onReady$3();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Core\Controls\FormattedTextControl.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="EntryControl.js" />

People.RecentActivity.UI.Feed.TextEntryControl = function(entry) {
    /// <summary>
    ///     Provides a simple text item.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_text$3" type="People.RecentActivity.UI.Core.FormattedTextControl">The text.</field>
    /// <field name="_container$3" type="HTMLElement">The container.</field>
    People.RecentActivity.UI.Feed.EntryControl.call(this, entry);

    Debug.assert(entry.entryType === People.RecentActivity.FeedEntryType.text, 'entry.EntryType == FeedEntryType.Text');
};

Jx.inherit(People.RecentActivity.UI.Feed.TextEntryControl, People.RecentActivity.UI.Feed.EntryControl);

People.RecentActivity.UI.Feed.TextEntryControl.prototype._text$3 = null;
People.RecentActivity.UI.Feed.TextEntryControl.prototype._container$3 = null;

People.RecentActivity.UI.Feed.TextEntryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the entry has been disposed.
    /// </summary>
    this._container$3 = null;

    if (this._text$3 != null) {
        this._text$3.dispose();
        this._text$3 = null;
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.TextEntryControl.prototype.onContentRendered = function() {
    /// <summary>
    ///     Occurs when the item is rendered.
    /// </summary>
    this.onRenderingEnded();

    People.RecentActivity.UI.Feed.EntryControl.prototype.onContentRendered.call(this);
};

People.RecentActivity.UI.Feed.TextEntryControl.prototype.onLoad = function() {
    /// <summary>
    ///     Occurs when the element should be loaded.
    /// </summary>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoad.call(this);

    var entry = this.entry;
    var data = entry.data;

    if (this.isMarkupInitialized) {
        // initialize a new text control from the existing elements.
        this._container$3 = this.content.children[0];
        this._text$3 = People.RecentActivity.UI.Core.FormattedTextControl.fromExistingElement(this._container$3.children[0], entry.sourceId, entry.entities);
    }
    else {
        // initialize a new text control from scratch.
        this._container$3 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryText);
        this._text$3 = new People.RecentActivity.UI.Core.FormattedTextControl(this._container$3.children[0], entry.sourceId, true);
        this._text$3.update(data.text, entry.entities);
        this.content.appendChild(this._container$3);

        this._updateTextSize$3();
    }
};

People.RecentActivity.UI.Feed.TextEntryControl.prototype.onLoadElement = function(element) {
    /// <summary>
    ///     Occurs when the element should be loaded.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoadElement.call(this, element);

    this.addClass('ra-itemText');
};

People.RecentActivity.UI.Feed.TextEntryControl.prototype.onOrientationChanged = function() {
    /// <summary>
    ///     Occurs when the orientation changes.
    /// </summary>
    if (this.isRendered) {
        this._updateTextSize$3();
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onOrientationChanged.call(this);
};

People.RecentActivity.UI.Feed.TextEntryControl.prototype.onFixedHeightChanged = function() {
    /// <summary>
    ///     Occurs when the entry becomes fixed height.
    /// </summary>
    this._updateTextSize$3();

    People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedHeightChanged.call(this);
};

People.RecentActivity.UI.Feed.TextEntryControl.prototype.getAriaContentLabel = function() {
    /// <summary>
    ///     Gets the ARIA content label.
    /// </summary>
    /// <returns type="String"></returns>
    return this.entry.data.text;
};

People.RecentActivity.UI.Feed.TextEntryControl.prototype.getContentHeight = function() {
    /// <summary>
    ///     Gets the content height.
    /// </summary>
    /// <returns type="Number"></returns>
    return People.RecentActivity.UI.Core.HtmlHelper.getTotalScrollHeight(this._text$3.element);
};

People.RecentActivity.UI.Feed.TextEntryControl.prototype._updateTextSize$3 = function() {
    if (this._text$3 != null) {
        if ((this.isFixedWidth && !this.isFixedHeight) || (this.orientation === 1)) {
            // no maximum height for snapped entries.
            this._text$3.removeClass('ra-itemTextContentInnerFixed');
        }
        else {
            this._text$3.addClass('ra-itemTextContentInnerFixed');
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Model\Configuration.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\FormattedTextControl.js" />
/// <reference path="..\..\Core\Controls\ImageControl.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\UriHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\States\VideoEntryState.js" />
/// <reference path="EntryControl.js" />

People.RecentActivity.UI.Feed.VideoEntryControl = function(entry) {
    /// <summary>
    ///     Provides an item for video type entries.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The entry.</param>
    /// <field name="_element$3" type="HTMLElement">The element.</field>
    /// <field name="_text$3" type="People.RecentActivity.UI.Core.FormattedTextControl">The user text.</field>
    /// <field name="_image$3" type="People.RecentActivity.UI.Core.ImageControl">The image control, if any.</field>
    /// <field name="_imageOverlay$3" type="People.RecentActivity.UI.Core.Control">The image overlay.</field>
    /// <field name="_title$3" type="People.RecentActivity.UI.Core.Control">The title.</field>
    /// <field name="_caption$3" type="People.RecentActivity.UI.Core.Control">The caption.</field>
    /// <field name="_description$3" type="People.RecentActivity.UI.Core.Control">The description.</field>
    /// <field name="_preview$3" type="HTMLElement">The preview container.</field>
    /// <field name="_isTransformed$3" type="Boolean">Whether we're showing a transformed URL.</field>
    /// <field name="_isTileLoaded$3" type="Boolean">Whether the tile has been loaded.</field>
    /// <field name="_isColumnLayout$3" type="Boolean">Whether the two column layout is applied.</field>
    /// <field name="_state$3" type="People.RecentActivity.UI.Feed.videoEntryState">The state.</field>
    People.RecentActivity.UI.Feed.EntryControl.call(this, entry);

    Debug.assert(entry.entryType === People.RecentActivity.FeedEntryType.video, 'entry.EntryType == FeedEntryType.Video');
};

Jx.inherit(People.RecentActivity.UI.Feed.VideoEntryControl, People.RecentActivity.UI.Feed.EntryControl);

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._element$3 = null;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._text$3 = null;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._image$3 = null;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._imageOverlay$3 = null;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._title$3 = null;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._caption$3 = null;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._description$3 = null;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._preview$3 = null;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._isTransformed$3 = false;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._isTileLoaded$3 = false;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._isColumnLayout$3 = false;
People.RecentActivity.UI.Feed.VideoEntryControl.prototype._state$3 = null;

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Disposes the item.
    /// </summary>
    this._element$3 = null;
    this._preview$3 = null;

    if (this._text$3 != null) {
        this._text$3.dispose();
        this._text$3 = null;
    }

    if (this._image$3 != null) {
        this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);
        this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
        this._image$3.dispose();
        this._image$3 = null;
    }

    if (this._imageOverlay$3 != null) {
        this._imageOverlay$3.dispose();
        this._imageOverlay$3 = null;
    }

    if (this._title$3 != null) {
        this._title$3.dispose();
        this._title$3 = null;
    }

    if (this._caption$3 != null) {
        this._caption$3.dispose();
        this._caption$3 = null;
    }

    if (this._description$3 != null) {
        this._description$3.dispose();
        this._description$3 = null;
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.onContentRendered = function() {
    /// <summary>
    ///     Renders the item.
    /// </summary>
    this._title$3.attach('click', this._onTitleClicked$3.bind(this));

    if (!this.isMarkupInitialized) {
        var entry = this.entry;
        var data = entry.data;

        // render the title, caption, description and text.
        this._caption$3.text = data.caption;
        this._description$3.text = data.description;
        this._text$3.update(data.text, entry.entities);
        this._title$3.text = data.title;

        this._adjustTextHeight$3();
    }

    if (this._isTileLoaded$3 || this._image$3.isDimensionsAvailable || (this._state$3 != null)) {
        if (this._image$3.isVisible) {
            // the image is visible and we have dimensions, so figure out whether we should use a column layout.
            this._applyColumnLayout$3();
        }

        this.onRenderingEnded();
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onContentRendered.call(this);
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.onLoad = function() {
    /// <summary>
    ///     Occurs when the entry is being preloaded.
    /// </summary>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoad.call(this);

    if (this.isMarkupInitialized) {
        // fetch the content from the existing content.
        this._element$3 = this.content.children[0];
    }
    else {
        // create a new element.
        this._element$3 = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedEntryVideo);
        this.content.appendChild(this._element$3);
    }

    var entry = this.entry;

    // fetch the preview container.
    this._preview$3 = this._element$3.children[1];

    var previewChildren = this._preview$3.children;
    var previewDetailsChildren = previewChildren[2].children;

    this._caption$3 = People.RecentActivity.UI.Core.Control.fromElement(previewDetailsChildren[1]);
    this._description$3 = People.RecentActivity.UI.Core.Control.fromElement(previewDetailsChildren[2]);
    this._title$3 = People.RecentActivity.UI.Core.Control.fromElement(previewDetailsChildren[0]);

    if (this.isMarkupInitialized) {
        // initialize the text from the existing markup.
        this._text$3 = People.RecentActivity.UI.Core.FormattedTextControl.fromExistingElement(this._element$3.children[0], entry.sourceId, entry.entities);
    }
    else {
        // intialize the text from scratch.
        this._text$3 = new People.RecentActivity.UI.Core.FormattedTextControl(this._element$3.children[0], entry.sourceId, true);
    }

    // and last but not least, render the image. we need to do this last because the template
    // layout may change a little depending on the image size. 
    this._image$3 = new People.RecentActivity.UI.Core.ImageControl(previewChildren[0]);
    this._imageOverlay$3 = People.RecentActivity.UI.Core.Control.fromElement(previewChildren[1]);

    if (this._isTileLoaded$3) {
        // the image has been loaded -- however, when saving/restoring the markup state, the background style
        // will get lost, due to an unfortunate side-effect of toStatiHTML().
        this._image$3.isVisible = this._imageOverlay$3.isVisible = !this.hasClass('ra-itemVideoNoTile');
    }
    else {
        var url = this._getPreviewTile$3();

        if (Jx.isNonEmptyString(url)) {
            People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadVideoTileStart);

            this._image$3.isDelayed = true;
            this._image$3.isOneByOneError = true;
            this._image$3.addListener("imagefailed", this._onImageFailed$3, this);
            this._image$3.addListener("imageloaded", this._onImageLoaded$3, this);
            this._image$3.source = url;

            if (this._image$3.isDimensionsAvailable || (this._state$3 != null)) {
                // we have loaded a cache dimage, so we know whether we should use a column layout now.
                this._applyColumnLayout$3();
                this._setImageSize$3();
                this._adjustTextHeight$3();
            }
        }
        else {
            // there is no tile to load, so by definition it has been loaded.
            this._image$3.isVisible = false;
            this._imageOverlay$3.isVisible = false;
            this.addClass('ra-itemVideoNoTile');
            this._setIsTileLoaded$3(true);
        }    
    }
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.onLoadElement = function(element) {
    /// <summary>
    ///     Occurs when the element should be loaded.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    People.RecentActivity.UI.Feed.EntryControl.prototype.onLoadElement.call(this, element);

    this.addClass('ra-itemVideo');

    // check whether the tile has already been loaded.
    this._isTileLoaded$3 = this.isMarkupInitialized && this.hasClass('ra-itemVideoTileLoaded');
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.onOrientationChanged = function() {
    /// <summary>
    ///     Occurs when the orientation has changed.
    /// </summary>
    if (this.isRendered) {
        this._applyColumnLayout$3();
        this._setImageSize$3();
        this._adjustTextHeight$3();
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onOrientationChanged.call(this);
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.onFixedHeightChanged = function() {
    /// <summary>
    ///     Occurs when the entry becomes fixed height.
    /// </summary>
    // capture the display style for the element and then clear it
    var display = this.setTemporaryVisibility();

    this._adjustTextHeight$3();

    if (this._preview$3.offsetHeight > this._element$3.clientHeight) {
        // if the preview is too large, hide the image so we can at least show the title and such.
        this._image$3.isVisible = false;
        this._imageOverlay$3.isVisible = false;
    }

    People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedHeightChanged.call(this);

    // restore the display style.
    this.restoreTemporaryVisibility(display);
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.onFixedWidthChanged = function() {
    /// <summary>
    ///     Occurs when the entry becomes fixed width.
    /// </summary>
    this._applyColumnLayout$3();

    People.RecentActivity.UI.Feed.EntryControl.prototype.onFixedWidthChanged.call(this);
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.getAriaContentLabel = function() {
    /// <summary>
    ///     Gets the ARIA content label.
    /// </summary>
    /// <returns type="String"></returns>
    var data = this.entry.data;

    if (Jx.isNonEmptyString(data.text)) {
        // format the string with the user text.
        return Jx.res.loadCompoundString('/strings/raItemContentVideoLabel', data.text, data.title, data.caption, data.description);
    }

    return data.tile + ' ' + data.caption + ' ' + data.description;
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.getContentHeight = function() {
    /// <summary>
    ///     Gets the content height.
    /// </summary>
    /// <returns type="Number"></returns>
    // capture the display style for the element and then clear it
    var display = this.setTemporaryVisibility();
    var isImageVisible = this._image$3.isVisible;

    // cache the content height.
    this._image$3.isVisible = true;
    var contentHeight = WinJS.Utilities.getTotalHeight(this._element$3);
    this._image$3.isVisible = isImageVisible;

    // the majority of video entries will have a tile, so to prevent superfluous overflowing, we just pretend there
    // is a super tall image here such that this entry won't stack until we get the real height.
    // sometimes the tile was loaded, but we didn't get the event yet, so do a quick check.
    if (!this._isTileLoaded$3 && !this.isFixedWidth) {
        var height = this._image$3.height;
        if (height <= 1) {
            contentHeight += 325;
        }
        else {
            // this is a cached image, we have the height, but it probably hasn't been fully rendered yet.
            contentHeight += height;
        }    
    }

    // restore the display style.
    this.restoreTemporaryVisibility(display);

    return contentHeight;
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.getState = function() {
    /// <summary>
    ///     Gets the state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this.isLoaded) {
        var state = People.RecentActivity.UI.Feed.EntryControl.prototype.getState.call(this);
        state.s = this._state$3;

        return state;
    }

    return null;
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype.setState = function(state) {
    /// <summary>
    ///     Sets the state.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
    // get the item specific state.
    this._state$3 = (state != null) ? state.s : null;

    People.RecentActivity.UI.Feed.EntryControl.prototype.setState.call(this, state);
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._setIsColumnLayout$3 = function(isColumnLayout) {
    /// <param name="isColumnLayout" type="Boolean"></param>
    if (isColumnLayout !== this._isColumnLayout$3) {
        this._isColumnLayout$3 = isColumnLayout;

        if (this._isColumnLayout$3) {
            this.addClass('ra-itemVideoColumns');
        }
        else {
            this.removeClass('ra-itemVideoColumns');
        }    
    }
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._setIsTileLoaded$3 = function(isTileLoaded) {
    /// <param name="isTileLoaded" type="Boolean"></param>
    if (isTileLoaded !== this._isTileLoaded$3) {
        this._isTileLoaded$3 = isTileLoaded;

        if (this._isTileLoaded$3) {
            this.addClass('ra-itemVideoTileLoaded');
        }
        else {
            this.removeClass('ra-itemVideoTileLoaded');
        }    
    }
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._getPreviewTile$3 = function() {
    /// <returns type="String"></returns>
    var entry = this.entry;
    var data = entry.data;
    var videoTransforms = People.RecentActivity.Configuration.videoUrlTransforms;
    var displayUrls = [data.displayUrl, data.sourceUrl];

    for (var j = 0, len = displayUrls.length; j < len; j++) {
        for (var i = 0, len2 = videoTransforms.length; i < len2; i++) {
            var embedUrl = videoTransforms[j].createPreviewUrl(displayUrls[i]);
            if (Jx.isNonEmptyString(embedUrl)) {
                this._isTransformed$3 = true;
                return embedUrl;
            }        
        }    
    }

    return data.tile;
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._setImageSize$3 = function() {
    // for this to be correct, we should make sure the outer frame has been rendered.
    this.ensureFrameRendered();

    var imageElement = this._image$3.element;

    var style = imageElement.style;
    var styleOverlay = this._imageOverlay$3.element.style;
    var direction = (this._imageOverlay$3.element.currentStyle.direction === 'ltr') ? 'left' : 'right';

    if (this._state$3 != null) {
        // no need to figure out the exact size, we can just do this based on the state.
        style.height = this._state$3.h;
        style.width = this._state$3.w;

        // apply the position of the overlay.
        styleOverlay[direction] = 'calc(' + this._state$3.w + ' - 68px)';
        styleOverlay.top = 'calc(' + this._state$3.h + ' - 68px)';

        return;
    }

    // capture the display style for the element and then clear it
    var display = this.setTemporaryVisibility();
    var imageHeight = this._image$3.height;
    var imageWidth = this._image$3.width;

    if (this.isFixedWidth) {
        // scale the width along the fixed height edge.
        imageWidth = ((imageElement.clientHeight / imageHeight) * imageWidth);
        imageHeight = imageElement.clientHeight;
        style.width = imageWidth + 'px';
    } else {
        style.height = imageHeight + 'px';
        style.width = imageWidth + 'px';

        // even though we set the width/height, its still possible that styles override with max-width, so check if we need to resize.
        var realWidth = imageElement.offsetWidth;
        if (realWidth !== 0 && realWidth < imageWidth) {
            imageHeight = ((realWidth / imageWidth) * imageHeight);
            imageWidth = realWidth;

            style.height = imageHeight + 'px';
            style.width = imageWidth + 'px';
        }
    }

    // apply the position of the overlay.
    styleOverlay[direction] = (imageWidth - 68) + 'px';
    styleOverlay.top = (imageHeight - 68) + 'px';

    // restore the display style.
    this.restoreTemporaryVisibility(display);

    this._state$3 = People.RecentActivity.UI.Feed.create_videoEntryState(this._isColumnLayout$3, style.width, style.height);
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._adjustTextHeight$3 = function() {
    if (this.orientation === 1) {
        // in fixed-width mode, or in snap, we don't cut off the text.
        this._text$3.removeClass('ra-itemVideoTextFixed');
    }
    else {
        this._text$3.addClass('ra-itemVideoTextFixed');
    }
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._applyColumnLayout$3 = function() {
    if (((this._state$3 != null) && this._state$3.i) || this.isFixedWidth || (this.orientation === 1) || (this._image$3.width > 180)) {
        this._setIsColumnLayout$3(false);
    }
    else {
        // use the two-column layout for images that are this small.
        this._setIsColumnLayout$3(true);
    }
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._onImageFailed$3 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (this._isTransformed$3) {
        // okay, we failed to load the unwrapped image, so lets try the normal one.
        this._isTransformed$3 = false;

        var entry = this.entry;
        var data = entry.data;

        this._image$3.source = data.tile;
    }
    else {
        People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadVideoTileStop);

        this._setIsTileLoaded$3(true);

        // we failed to load the image completely.
        this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
        this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);
        this._image$3.isVisible = false;
        this._imageOverlay$3.isVisible = false;

        this.addClass('ra-itemVideoNoTile');

        if (this.isRendered) {
            this.onRenderingEnded();
        }    
    }
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._onImageLoaded$3 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadVideoTileStop);

    this._setIsTileLoaded$3(true);

    this._image$3.removeListenerSafe("imagefailed", this._onImageFailed$3, this);
    this._image$3.removeListenerSafe("imageloaded", this._onImageLoaded$3, this);

    this._applyColumnLayout$3();

    this._state$3 = null;
    this._setImageSize$3();

    if (this.isRendered) {
        this._adjustTextHeight$3();
        this.onRenderingEnded();
    }
};

People.RecentActivity.UI.Feed.VideoEntryControl.prototype._onTitleClicked$3 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev');

    var entry = this.entry;
    var data = entry.data;

    // open up the URL in mobro.
    People.RecentActivity.UI.Core.UriHelper.launchUri(data.displayUrl || data.sourceUrl);

    ev.cancelBubble = true;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\BICI\BiciPageNames.js" />
/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Core\FlyoutItemDescriptor.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Imports\ContentAnimationData.js" />
/// <reference path="..\..\Imports\LayoutState.js" />
/// <reference path="..\..\Model\Events\ActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\Events\GetMoreActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\Model\Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\Feed.js" />
/// <reference path="..\..\Model\FeedEntry.js" />
/// <reference path="..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\..\Model\Network.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\Core\Controls\ErrorMessageType.js" />
/// <reference path="..\Core\Controls\GlobalProgressControl.js" />
/// <reference path="..\Core\Controls\PsaUpsellControl.js" />
/// <reference path="..\Core\EventManager.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="..\Core\KeyboardRefresher.js" />
/// <reference path="..\Core\Navigation\LandingPageNavigationData.js" />
/// <reference path="..\Core\SnapManager.js" />
/// <reference path="Controls\EntryControlClickedEventArgs.js" />
/// <reference path="Controls\LinkEntryControl.js" />
/// <reference path="Controls\ListView\StackingListViewControl.js" />
/// <reference path="Controls\ListView\StackingListViewOrientation.js" />
/// <reference path="Controls\PhotoAlbumEntryControl.js" />
/// <reference path="Controls\PhotoEntryControl.js" />
/// <reference path="Controls\SeeMoreStatusPanel.js" />
/// <reference path="Controls\TextEntryControl.js" />
/// <reference path="Controls\VideoEntryControl.js" />
/// <reference path="FeedLayoutHydrationData.js" />

People.RecentActivity.UI.Feed.FeedLayout = function(identity, element) {
    /// <summary>
    ///     Provides the main entry point for the UI.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
    /// <param name="element" type="HTMLElement">The element to take over.</param>
    /// <field name="_hydrationVersion$1" type="Number" integer="true" static="true">The hydration version.</field>
    /// <field name="_hydrationRefreshTimeout$1" type="Number" integer="true" static="true">The timeout we use to determine whether we should refresh the feed, even when coming from a hydration scenario.</field>
    /// <field name="_settingKey$1" type="String" static="true">The setting key.</field>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_content$1" type="People.RecentActivity.UI.Core.Control">The content container.</field>
    /// <field name="_contentList$1" type="People.RecentActivity.UI.Core.Control">The listview container.</field>
    /// <field name="_seeMoreStatus$1" type="People.RecentActivity.UI.Feed.SeeMoreStatusPanel">The see more progress container.</field>
    /// <field name="_contentPsa$1" type="People.RecentActivity.UI.Core.Control">The PSA content.</field>
    /// <field name="_contentErrors$1" type="People.RecentActivity.UI.Core.Control">The credentials content.</field>
    /// <field name="_listview$1" type="People.RecentActivity.UI.Feed.StackingListViewControl">The list view.</field>
    /// <field name="_listviewMap$1" type="Object">The map of list view items.</field>
    /// <field name="_commandRefresh$1" type="People.Command">The refresh command.</field>
    /// <field name="_commandPost$1" type="People.Command">The post command.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The current network.</field>
    /// <field name="_feed$1" type="People.RecentActivity.Feed">The current feed.</field>
    /// <field name="_hydrationData$1" type="People.RecentActivity.UI.Feed.feedLayoutHydrationData">The hydration data.</field>
    /// <field name="_hydrationItemId$1" type="String">The ID used for item state.</field>
    /// <field name="_hydrationMarkupId$1" type="String">The ID used for the markup state.</field>
    /// <field name="_psa$1" type="People.RecentActivity.UI.Core.PsaUpsellControl">The PSA control.</field>
    /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The error control.</field>
    /// <field name="_initialized$1" type="Boolean">Whether the feed and network have been initialized.</field>
    /// <field name="_refreshing$1" type="Boolean">Whether the feed is being refreshed.</field>
    /// <field name="_commandsRendered$1" type="Boolean">Whether the commands have been rendered.</field>
    /// <field name="_lastResult$1" type="People.RecentActivity.Core.ResultInfo">The last result.</field>
    /// <field name="_hasSeeMoreFailed$1" type="Boolean">Whether see more failed, meaning we exhausted all queued entries and requests failed.</field>
    /// <field name="_isSeeMoreScenario$1" type="Boolean">Whether it is a see more scenario.</field>
    /// <field name="_lastItemIndex$1" type="Number" integer="true">The index of the last item in the list view before getting more entries.</field>
    /// <field name="_latestState$1" type="People.RecentActivity.UI.Feed.stackingListViewState">The latest state we saved.</field>
    /// <field name="_addEntriesRequested$1" type="Boolean">Whether we need to add entries initially.</field>
    this._lastResult$1 = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);
    this._lastItemIndex$1 = -1;
    People.RecentActivity.UI.Core.Control.call(this, element);
    Debug.assert(identity != null, 'identity != null');
    this._identity$1 = identity;

    // initialize the markup, as we need some stuff for animations.
    var content = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedLayout);
    this.appendChild(content);

    // initialize the credentials control -- which is needed for the intro animation.
    this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._identity$1, People.RecentActivity.UI.Core.ErrorMessageContext.whatsNew, People.RecentActivity.UI.Core.ErrorMessageOperation.read);
    this._errors$1.render();
    this._contentErrors$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(content, 'layout-errors');
    this._contentErrors$1.isVisible = false;
    this._contentErrors$1.appendControl(this._errors$1);

    // initialize the PSA control.
    this._psa$1 = new People.RecentActivity.UI.Core.PsaUpsellControl();
    this._psa$1.render();
    this._contentPsa$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(content, 'layout-psa');
    this._contentPsa$1.isVisible = false;
    this._contentPsa$1.appendControl(this._psa$1);
};

Jx.inherit(People.RecentActivity.UI.Feed.FeedLayout, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.Feed.FeedLayout._hydrationVersion$1 = 8;
People.RecentActivity.UI.Feed.FeedLayout._hydrationRefreshTimeout$1 = 60 * 60 * 1000;
People.RecentActivity.UI.Feed.FeedLayout._settingKey$1 = 'whatsNewPreferredNetwork';
People.RecentActivity.UI.Feed.FeedLayout.prototype._identity$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._content$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._contentList$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._seeMoreStatus$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._contentPsa$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._contentErrors$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._listview$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._listviewMap$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._commandRefresh$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._commandPost$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._network$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._feed$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._hydrationData$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._hydrationItemId$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._hydrationMarkupId$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._psa$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._errors$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._initialized$1 = false;
People.RecentActivity.UI.Feed.FeedLayout.prototype._refreshing$1 = false;
People.RecentActivity.UI.Feed.FeedLayout.prototype._commandsRendered$1 = false;
People.RecentActivity.UI.Feed.FeedLayout.prototype._hasSeeMoreFailed$1 = false;
People.RecentActivity.UI.Feed.FeedLayout.prototype._isSeeMoreScenario$1 = false;
People.RecentActivity.UI.Feed.FeedLayout.prototype._latestState$1 = null;
People.RecentActivity.UI.Feed.FeedLayout.prototype._addEntriesRequested$1 = false;

Object.defineProperty(People.RecentActivity.UI.Feed.FeedLayout.prototype, "feed", {
    get: function() {
        /// <summary>
        ///     Gets the feed.
        /// </summary>
        /// <value type="People.RecentActivity.Feed"></value>
        return this._feed$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.FeedLayout.prototype, "listView", {
    get: function() {
        /// <summary>
        ///     Gets the list view.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Feed.StackingListViewControl"></value>
        return this._listview$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.Feed.FeedLayout.prototype, "canRequestMoreEntries", {
    get: function() {
        /// <summary>
        ///     Determines whether we can request more entries at this time.
        /// </summary>
        /// <value type="Boolean"></value>
        Jx.log.write(4, People.Social.format('FeedLayout::CanRequestMoreEntries(feed!= null: {0}, initialized: {1}, isRefreshing: {2}, hasMoreEntries: {3}, isGettingMoreEntries: {4}, hasSeeMOreFailed: {5})', this._feed$1 != null, this._feed$1 != null && this._feed$1.initialized, this._feed$1 != null && this._feed$1.isRefreshing, this._feed$1 != null && this._feed$1.hasMoreEntries, this._feed$1 != null && this._feed$1.isGettingMoreEntries, this._hasSeeMoreFailed$1));
        return (this._feed$1 != null) && this._feed$1.initialized && !this._feed$1.isRefreshing && this._feed$1.hasMoreEntries && !this._feed$1.isGettingMoreEntries && !this._hasSeeMoreFailed$1;
    }
});

People.RecentActivity.UI.Feed.FeedLayout.prototype.getAnimationData = function() {
    /// <summary>
    ///     Gets the animation data.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    return People.RecentActivity.Imports.create_contentAnimationData([ [ this._psa$1.element, this._errors$1.element ] ], null);
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.hasFilter = function() {
    /// <summary>
    ///     Whether the control implements a filter.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this._identity$1.isWhatsNew &&
        this._identity$1.capabilities.canShowWhatsNew &&
        this._network$1 != null &&
        this._identity$1.networks.count > 2;
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.getCurrentFilterName = function() {
    /// <summary>
    ///     Gets the name of the active filter.
    /// </summary>
    /// <returns type="String"></returns>
    Debug.assert(this._identity$1.isWhatsNew, 'this._identity$1.isWhatsNew');
    Debug.assert(this._identity$1.capabilities.canShowWhatsNew, 'this._identity$1.capabilities.canShowWhatsNew');
    Debug.assert(this._network$1 != null, 'this.network != null');
    
    return this._network$1.name;
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.getFilterItems = function() {
    /// <summary>
    ///     Gets the array of filter items.
    /// </summary>
    /// <returns type="Array" elementType="flyoutItemDescriptor"></returns>
    Debug.assert(this._identity$1.isWhatsNew, 'this._identity$1.isWhatsNew');
    Debug.assert(this._identity$1.capabilities.canShowWhatsNew, 'this._identity$1.capabilities.canShowWhatsNew');
    Debug.assert(this._network$1 != null, 'this.network != null');
    Debug.assert(this._identity$1.networks.count > 2, 'this._identity$1.networks.count > 2');

    var flyoutItems = [];
    var networks = this._identity$1.networks;
    var all = networks.aggregatedNetwork;

    // All network first
    if (all != null) {
        flyoutItems.push(People.RecentActivity.Core.create_flyoutItemDescriptor(all.id, all.name, all.id === this._network$1.id, this._createFilterCallback$1(all)));
    }

    // Now the rest, in order
    for (var i = 0; i < networks.count; i++) {
        var network = networks.item(i);
        if (!network.isAggregatedNetwork) {
            flyoutItems.push(People.RecentActivity.Core.create_flyoutItemDescriptor(network.id, network.name, network.id === this._network$1.id, this._createFilterCallback$1(network)));
        }    
    }

    return flyoutItems;
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.initialize = function(hydrationData, hydrationItemId, hydrationMarkupId) {
    /// <summary>
    ///     Initializes the underlying model.
    /// </summary>
    /// <param name="hydrationData" type="Object">The hydration data.</param>
    /// <param name="hydrationItemId" type="String">The hydration item ID.</param>
    /// <param name="hydrationMarkupId" type="String">The markup ID.</param>
    // store the hydration data for later use.
    var data = hydrationData;
    if (data != null) {
        if (data.v !== 8) {
            // invalid hydration data, just ignore it.
            data = null;
        }    
    }

    this._hydrationData$1 = data;
    this._hydrationItemId$1 = hydrationItemId;
    this._hydrationMarkupId$1 = hydrationMarkupId;

    // if we can't show What's New we need to delay initialization until we know for sure.
    // monitor the capabilities to make sure we show/hide the feed as appropriate.
    var capabilities = this._identity$1.capabilities;
    capabilities.addListener("propertychanged", this._onCapabilitiesPropertyChanged$1, this);

    if (capabilities.canShowWhatsNew) {
        this._initializeInternal$1();
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.getState = function() {
    /// <summary>
    ///     Collects the necessary data for dehydration.
    /// </summary>
    /// <returns type="Object"></returns>
    var listViewState = this._latestState$1;
    if (this._listview$1 != null && listViewState == null) {
        // fetch the state of the list view.
        listViewState = this._listview$1.getState();
    }

    return People.RecentActivity.UI.Feed.create_feedLayoutHydrationData(8, listViewState, new Date().getTime());
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.getItemState = function(batchOnly) {
    /// <summary>
    ///     Gets the item state, represented by the ID it was saved with.
    /// </summary>
    /// <param name="batchOnly" type="Boolean">Whether to only save state for a batch only.</param>
    /// <returns type="String"></returns>
    if (this._listview$1 != null) {
        var listViewState = this._listview$1.getItemStates(batchOnly);
        var stateId = this._getStateId$1();
        try {
            // attempt to save the state in local storage.
            window.localStorage.setItem(stateId, JSON.stringify(listViewState));
            return stateId;
        }
        catch (e) {
            // we failed, write a log entry and then clear out the state ID.
            Jx.log.write(2, 'Failed to save state to local storage: ' + e.toString());
            try {
                // try to delete the old state, if possible.
                window.localStorage.removeItem(stateId);
            }
            catch (e2) {
                Jx.log.write(2, 'Failed to remove old state too! ' + e2.toString());
            }        
        }    
    }

    return null;
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.getMarkupState = function() {
    /// <summary>
    ///     Gets the state of the markup.
    /// </summary>
    /// <returns type="String"></returns>
    if (this._listview$1 != null) {
        // use the state ID for storing the data.
        var id = this._getStateId$1();
        // store the state in session storage.
        window.sessionStorage.setItem(id, JSON.stringify(this._listview$1.getMarkupState()));
        return id;
    }

    return null;
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.resetScrollPosition = function() {
    /// <summary>
    ///     Reset scroll position to zero.
    /// </summary>
    if (this._listview$1 != null) {
        this._listview$1.scrollPosition = 0;
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.refresh = function() {
    this._onRefreshClicked$1(null);
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.onLayoutChanged = function(layout) {
    /// <param name="layout" type="People.RecentActivity.Imports.LayoutState"></param>
    Debug.assert(layout !== 'none', 'layout != LayoutState.None');
    if (this._listview$1 != null) {
        this._listview$1.orientation = this._getListViewOrientation$1(layout);
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    People.RecentActivity.UI.Core.SnapManager.removeControl(this);
    People.RecentActivity.UI.Core.KeyboardRefresher.removeControl(this);
    People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowresized", this._onWindowResized$1, this);
    this._network$1 = null;
    this._commandRefresh$1 = null;
    this._commandPost$1 = null;
    this._lastResult$1 = null;
    if (this._identity$1 != null) {
        this._identity$1.capabilities.removeListenerSafe("propertychanged", this._onCapabilitiesPropertyChanged$1, this);
    }

    this._disposeFeed$1();
    if (this._content$1 != null) {
        this._content$1.dispose();
        this._content$1 = null;
    }

    if (this._contentErrors$1 != null) {
        this._contentErrors$1.dispose();
        this._contentErrors$1 = null;
    }

    if (this._contentList$1 != null) {
        this._contentList$1.dispose();
        this._contentList$1 = null;
    }

    if (this._seeMoreStatus$1 != null) {
        this._seeMoreStatus$1.dispose();
        this._seeMoreStatus$1 = null;
    }

    if (this._listview$1 != null) {
        this._listview$1.removeListenerSafe("editscompleted", this._onListEditsCompleted$1, this);
        this._listview$1.removeListenerSafe("moreitemsrequested", this._onMoreItemsRequested$1, this);
        this._listview$1.dispose();
        this._listview$1 = null;
    }

    if (this._listviewMap$1 != null) {
        for (var k in this._listviewMap$1) {
            var entry = { key: k, value: this._listviewMap$1[k] };
            // dispose the controls we've rendered.
            var control = entry.value;
            control.removeListenerSafe("clicked", this._onEntryClicked$1, this);
            control.dispose();
        }

        People.Social.clearKeys(this._listviewMap$1);
        this._listviewMap$1 = null;
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

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.Feed.FeedLayout.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the instance is being rendered.
    /// </summary>
    var element = this.element;
    this._content$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'layout-content');

    // initialize the list.
    this._contentList$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'layout-list');
    this._initializeListView$1();

    // we need to render the see more panel before rendering list view, since we want see more panel to attach to keyboard event first.
    this._seeMoreStatus$1 = new People.RecentActivity.UI.Feed.SeeMoreStatusPanel(People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'layout-seemore'), this);
    this._seeMoreStatus$1.render();
    this._seeMoreStatus$1.isVisible = false;

    this._listview$1.render();
    this._checkReadyState$1();

    People.RecentActivity.UI.Core.KeyboardRefresher.addControl(this);

    if (this._addEntriesRequested$1) {
        this._addEntries$1(this._feed$1.entries.toArray(), 0);
        this._addEntriesRequested$1 = false;
    }

    People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._detachFeedEvents$1 = function() {
    if (this._feed$1 != null) {
        this._feed$1.entries.removeListenerSafe("collectionchanged", this._onEntryCollectionChanged$1, this);
        this._feed$1.removeListenerSafe("ensureuptodatecompleted", this._onEnsureUpToDateCompleted$1, this);
        this._feed$1.removeListenerSafe("initializecompleted", this._onInitializeCompleted$1, this);
        this._feed$1.removeListenerSafe("refreshcompleted", this._onRefreshCompleted$1, this);
        this._feed$1.removeListenerSafe("getmoreentriescompleted", this._onGetMoreEntriesCompleted$1, this);
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._disposeFeed$1 = function() {
    this._detachFeedEvents$1();
    this._feed$1 = null;
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._initializeListView$1 = function() {
    var element = this._contentList$1.element;
    this._listviewMap$1 = {};

    this._listview$1 = new People.RecentActivity.UI.Feed.StackingListViewControl(element, this._getListViewOrientation$1(People.RecentActivity.UI.Core.SnapManager.currentLayout));
    this._listview$1.addListener("editscompleted", this._onListEditsCompleted$1, this);
    this._listview$1.addListener("moreitemsrequested", this._onMoreItemsRequested$1, this);

    if (this._hydrationData$1 != null) {
        // set the regular state on the list view.
        this._listview$1.setState(this._hydrationData$1.s);
    }

    if (Jx.isNonEmptyString(this._hydrationItemId$1)) {
        try {
            // parse the item state and apply it to the list view.
            var data = window.localStorage.getItem(this._hydrationItemId$1);
            var state = JSON.parse(data);
            if (state != null) {
                this._listview$1.setItemStates(state);
            }

        }
        catch (e) {
        }    
    }

    if (Jx.isNonEmptyString(this._hydrationMarkupId$1)) {
        try {
            // restore the markup to the listview.
            var data = window.sessionStorage.getItem(this._hydrationMarkupId$1);
            var state = JSON.parse(data);

            if (state != null) {
                this._listview$1.setMarkupState(state);
            }
        }
        catch (e) {
        }    
    }

    People.RecentActivity.UI.Core.SnapManager.addControl(this);

    // make sure we monitor resolution changes
    People.RecentActivity.UI.Core.EventManager.events.addListener("windowresized", this._onWindowResized$1, this);
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._renderCommands$1 = function() {
    var commandBar = Jx.root.getCommandBar();
    // add the command for refreshing.
    this._commandRefresh$1 = new People.Command('ra-refresh', '/strings/raRefresh', '/strings/raRefreshTooltip', '\ue117', true, (this._feed$1 != null) && this._feed$1.initialized, null, this._onRefreshClicked$1.bind(this));
    commandBar.addCommand(this._commandRefresh$1);
    // add commands specific to What's New.
    if (this._identity$1.isWhatsNew && this._identity$1.capabilities.canShare) {
        // add the command for adding a new post.
        this._commandPost$1 = new People.Command('ra-post', '/strings/raPost', '/strings/raPostTooltip', '\ue109', true, (this._feed$1 != null) && this._feed$1.initialized, null, this._onPostClicked$1.bind(this));
        commandBar.addCommand(this._commandPost$1);
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._setContentVisibility$1 = function() {
    if (this.isRendered && !this._isSeeMoreScenario$1) {
        // We don't set contentList visible to false here, because it will steal the focus from the first item in the list if any.
        this._contentErrors$1.isVisible = false;
        this._contentPsa$1.isVisible = false;

        if (!this._identity$1.capabilities.canShowWhatsNew) {
            // we're not hooked up to anything, so show the PSA.
            this._contentPsa$1.isVisible = true;
            this._contentList$1.isVisible = false;
        }
        else {
            var initialized = this._feed$1.initialized;

            // if there are entries, the error control should be in the bar, otherwise we can
            // show the errors inline in the feed.
            if (initialized && (!this._feed$1.entries.count)) {
                // errors need to be displayed inline.
                this._contentErrors$1.isVisible = true;
                this._contentList$1.isVisible = false;
                this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;
                if (this._lastResult$1.code === People.RecentActivity.Core.ResultCode.success) {
                    // no errors, so that just means there are no feed entries.
                    this._errors$1.showType(People.RecentActivity.UI.Core.ErrorMessageType.empty);
                }
                else {
                    this._errors$1.show(this._lastResult$1);
                }

            }
            else {
                if (!this._contentList$1.isVisible) {
                    this._contentList$1.isVisible = true;
                }

                // errors need to be displayed in the message bar.
                this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.messageBar;
                this._errors$1.show(this._lastResult$1);
            }        
        }    
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._setCommandButtonsVisibility$1 = function() {
    if (this.isRendered && this._initialized$1) {
        if (!this._commandsRendered$1) {
            // render the rest of the actual content.
            this._renderCommands$1();
            this._commandsRendered$1 = true;
        }

        var commands = Jx.root.getCommandBar();

        if (this._feed$1.initialized && this._identity$1.capabilities.canShowWhatsNew) {
            commands.showCommand(this._commandRefresh$1.commandId);

            if (this._commandPost$1 != null) {
                commands.showCommand(this._commandPost$1.commandId);
            }

        }
        else {
            commands.hideCommand(this._commandRefresh$1.commandId);

            if (this._commandPost$1 != null) {
                commands.hideCommand(this._commandPost$1.commandId);
            }        
        }

        commands.refresh();
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._addEntries$1 = function(entries, index) {
    /// <param name="entries" type="Array" elementType="FeedEntry"></param>
    /// <param name="index" type="Number" integer="true"></param>
    Debug.assert(entries != null, 'entries != null');
    this._listview$1.beginEdits();
    for (var i = 0, len = entries.length; i < len; i++) {
        // items need to be added in reverse order.
        this._addEntry$1(entries[i], index++);
    }

    this._listview$1.endEdits();
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._addEntry$1 = function(entry, index) {
    /// <param name="entry" type="People.RecentActivity.FeedEntry"></param>
    /// <param name="index" type="Number" integer="true"></param>
    Debug.assert(entry != null, 'entry != null');
    if (!Jx.isUndefined(this._listviewMap$1[entry.id])) {
        // we've already initialized this entry.
        return;
    }

    // initialize a new control for the given item.
    var control = null;
    switch (entry.entryType) {
        case People.RecentActivity.FeedEntryType.text:
            control = new People.RecentActivity.UI.Feed.TextEntryControl(entry);
            break;
        case People.RecentActivity.FeedEntryType.link:
            control = new People.RecentActivity.UI.Feed.LinkEntryControl(entry);
            break;
        case People.RecentActivity.FeedEntryType.photo:
            control = new People.RecentActivity.UI.Feed.PhotoEntryControl(entry);
            break;
        case People.RecentActivity.FeedEntryType.photoAlbum:
            control = new People.RecentActivity.UI.Feed.PhotoAlbumEntryControl(entry);
            break;
        case People.RecentActivity.FeedEntryType.video:
            control = new People.RecentActivity.UI.Feed.VideoEntryControl(entry);
            break;
    }

    control.addListener("clicked", this._onEntryClicked$1, this);
    // insert the item and keep track of it in our internal map as well.
    this._listviewMap$1[entry.id] = control;
    this._listview$1.insert(control, index);
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._removeEntries$1 = function(entries) {
    /// <param name="entries" type="Array" elementType="FeedEntry"></param>
    Debug.assert(entries != null, 'entries != null');
    this._listview$1.beginEdits();
    for (var i = 0, len = entries.length; i < len; i++) {
        // simply remove the item from the list.
        var entry = entries[i];
        if (!Jx.isUndefined(this._listviewMap$1[entry.id])) {
            var control = this._listviewMap$1[entry.id];
            control.removeListenerSafe("clicked", this._onEntryClicked$1, this);
            this._listview$1.remove(control);
            delete this._listviewMap$1[entry.id];
        }    
    }

    this._listview$1.endEdits();
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._checkReadyState$1 = function() {
    if (this.isRendered) {
        // we're initialized, so we can mark the end of the feed loading ETW events.
        People.RecentActivity.Core.EtwHelper.writeFeedEvent(
            (this._hydrationData$1 != null) ? People.RecentActivity.Core.EtwEventName.uiGetCachedFeedEnd : People.RecentActivity.Core.EtwEventName.uiGetFeedEnd,
            this._network$1 != null ? this._network$1.id : 'null',
            this._network$1 != null ? this._network$1.identity.id : 'null');

        // set the visibility of the various pieces of UX.
        this._setContentVisibility$1();
        this._setCommandButtonsVisibility$1();
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._initializeInternal$1 = function() {
    var networks = this._identity$1.networks;
    if (this._identity$1.isWhatsNew) {
        // figure out which network we should use.
        var currentId = Jx.appData.localSettings().get('whatsNewPreferredNetwork');
        this._network$1 = networks.findById(currentId) || networks.aggregatedNetwork;
    }
    else {
        // for non-top-level what's new we just use the aggregated network, and don't offer filtering.
        this._network$1 = networks.aggregatedNetwork;
    }

    if (this._network$1 == null) {
        // if we still can't find the proper network to use, just fall back to the first one available.
        this._network$1 = this._identity$1.networks.item(0);
    }

    this._initializeFeed$1();
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._initializeFeed$1 = function() {
    var that = this;
    
    this._disposeFeed$1();
    if (this.isDisposed) {
        // don't continue, we've been disposed.
        return;
    }

    this._feed$1 = this._network$1.feed;
    this._feed$1.entries.addListener("collectionchanged", this._onEntryCollectionChanged$1, this);
    this._feed$1.addListener("getmoreentriescompleted", this._onGetMoreEntriesCompleted$1, this);

    People.RecentActivity.Core.BiciHelper.setCurrentPageName((this._identity$1.isWhatsNew) ? People.RecentActivity.Core.BiciPageNames.whatsNew : People.RecentActivity.Core.BiciPageNames.recentActivity);
    People.RecentActivity.Core.BiciHelper.createPageViewDatapoint(this._network$1.id);
    this._initialized$1 = true;

    if (this._feed$1.initialized) {
        window.msSetImmediate(function() {
            if (that.isDisposed) {
                // we've been disposed already.
                return;
            }

            // ensure the feed/cache is up to date first.
            Jx.log.write(4, 'FeedLayout::InitializeFeed: EnsureUpToDate');
            that._feed$1.addListener("ensureuptodatecompleted", that._onEnsureUpToDateCompleted$1, that);
            that._feed$1.ensureUpToDate(that._hydrationData$1 == null);
            that._checkReadyState$1();
        });
    }
    else {
        People.RecentActivity.UI.Core.GlobalProgressControl.add(this);
        People.RecentActivity.Core.EtwHelper.writeFeedEvent((this._hydrationData$1 != null) ? People.RecentActivity.Core.EtwEventName.uiGetCachedFeedStart : People.RecentActivity.Core.EtwEventName.uiGetFeedStart, this._network$1.id, this._network$1.identity.id);
        if (this._feed$1.entries.count > 0) {
            // if feed already has entries before initialized, it means the feed is being initialized from previous request (e.g. FeedModule), and we already got cached entries.
            // so we need to add those entries once rendered.
            this._addEntriesRequested$1 = true;
        }

        window.msSetImmediate(function() {
            if (that.isDisposed) {
                // we've been disposed already.
                return;
            }

            that._feed$1.addListener("initializecompleted", that._onInitializeCompleted$1, that);
            // figure out how we need to intialize everything.
            if ((that._hydrationData$1 != null) && (new Date().getTime() - that._hydrationData$1.t < People.RecentActivity.UI.Feed.FeedLayout._hydrationRefreshTimeout$1)) {
                that._feed$1.initializeFromHydration();
            }
            else {
                that._feed$1.initialize();
            }

        });
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._getStateId$1 = function() {
    /// <returns type="String"></returns>
    if (this._identity$1.isWhatsNew) {
        // use the global What's New state.
        return 'FeedUxState_WN';
    }
    else {
        // use the base key + the ID of the person.
        return 'FeedUxState_' + this._identity$1.id;
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._createFilterCallback$1 = function(network) {
    /// <param name="network" type="People.RecentActivity.Network"></param>
    /// <returns type="Function"></returns>
    var that = this;
    
    return function() {
        that._onFilterChanged$1(network);
    };
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onEntryClicked$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.UI.Feed.EntryControlClickedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    // for some reason, wait until app frame to call GetState, the scroll position is always 0, so we get state here.
    this._latestState$1 = this._listview$1.getState();
    // rather than waiting for the app-frame to dispose the feed layout, we should immediately
    // dispose the listviewcontrol to prevent it from doing any more work than is needed,
    // which could interrupt rendering/transitioning to the self-page.
    this._listview$1.freeze();
    // detach all of the events we attached too, so we don't get interrupted by those.
    this._detachFeedEvents$1();
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onWindowResized$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    Jx.log.write(4, 'FeedLayout::OnWindowResized()');
    if (this._listview$1 != null) {
        this._listview$1.forceLayout();
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onListEditsCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');

    // Do not reset active element if controls like flyout is opened.
    if (this._isClickEatingDivVisible()) {
        return;
    }

    if (this._listview$1.count > 0 && !this._isSeeMoreScenario$1) {
        if (this._hydrationData$1 == null) {
            Jx.log.write(4, 'FeedLayout::OnListEditsCompleted: no hydration data, setting first item active.');
            // set focus on the first item.
            this._listview$1.item(0).setActive();
        }
        else {
            // make sure we actually have an active item.
            var item = this._listview$1.activeItem;
            if (item != null) {
                Jx.log.write(4, 'FeedLayout::OnListEditsCompleted: setting item active: ' + item.index);
                item.setActive();
            }
            else {
                Jx.log.write(4, 'FeedLayout::OnListEditsCompleted: setting first item active.');
                // just set focus on the first item.
                this._listview$1.item(0).setActive();
            }        
        }

    }
    else if (this._isSeeMoreScenario$1) {
        if (this._lastItemIndex$1 !== -1) {
            // we need to set the first of the more entries to be active.
            var item = this._listview$1.item(this._lastItemIndex$1);
            this._listview$1.activeItemIndex = this._listview$1.getNextItem(item).index;
            Jx.log.write(4, 'FeedLayout::OnListEditsCompleted(see more case): setting item active: ' + this._listview$1.activeItemIndex);
            this._listview$1.activeItem.setActive();
            this._lastItemIndex$1 = -1;
        }

        this._listview$1.resumeScrollListener();
        this._seeMoreStatus$1.isVisible = false;
        this._isSeeMoreScenario$1 = false;
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onMoreItemsRequested$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (this.canRequestMoreEntries) {
        this._seeMoreStatus$1.isVisible = true;
        this._seeMoreStatus$1.element.style.opacity = '';
        this._seeMoreStatus$1.showProgress();
        People.Animation.fadeIn(this._seeMoreStatus$1.element).done();
        this._isSeeMoreScenario$1 = true;
        this._feed$1.getMoreEntries();
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onGetMoreEntriesCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.GetMoreActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (e.count > 0 || e.result.code === People.RecentActivity.Core.ResultCode.success) {
        if (e.count > 0) {
            // we want to stop listening scroll event while more entries are displayed.
            this._listview$1.stopScrollListener();
        }

        if (this._seeMoreStatus$1.isActive) {
            var lastIndex = this._listview$1.lastItemIndex;
            if (!e.count) {
                // if the see more panel has focus, and we don't have more entries and the request is success, we move the focus to the last item.
                this._listview$1.activeItemIndex = lastIndex;
                this._listview$1.activeItem.setActive();
            }
            else {
                // save the current last item index.
                this._lastItemIndex$1 = lastIndex;
            }        
        }

        // FadeIn animation here seems to interfere with the FadeIn animation to fade in new entries, causing scroll to jump.
        // Need to investigate more, for now, don't use animation.
        this._seeMoreStatus$1.element.style.opacity = '0';
        if (!e.count) {
            // only make it hidden when we don't have more entries, otherwise do it in OnListEditComplete, so we don't cause the scrollbar to jump a bit
            // before new entries are faded in.
            this._seeMoreStatus$1.isVisible = false;
        }

        this._seeMoreStatus$1.showError(e.result, People.RecentActivity.UI.Core.ErrorMessageLocation.messageBar);
    }
    else {
        this._hasSeeMoreFailed$1 = true;
        this._seeMoreStatus$1.showError(e.result, People.RecentActivity.UI.Core.ErrorMessageLocation.inline);
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onEnsureUpToDateCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    this._lastResult$1 = e.result;
    this._feed$1.removeListenerSafe("ensureuptodatecompleted", this._onEnsureUpToDateCompleted$1, this);
    if (this._lastResult$1.code === People.RecentActivity.Core.ResultCode.success) {
        Jx.log.write(4, 'FeedLayout::OnEnsureUpToDateCompleted: success');
        if (this._hydrationData$1 == null) {
            // we've already initialized the feed and we're not coming from a hydration scenario, just refresh it.
            this._onRefreshClicked$1(null);
        }

    }
    else {
        // um, okay.. so.. getting cached entries failed, I guess?
        this._checkReadyState$1();
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onInitializeCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    this._feed$1.removeListenerSafe("initializecompleted", this._onInitializeCompleted$1, this);
    People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
    this._lastResult$1 = e.result;
    // check whether we can do other stuff yet.
    this._checkReadyState$1();
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onEntryCollectionChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (this.isRendered) {
        switch (e.action) {
            case People.RecentActivity.NotifyCollectionChangedAction.replace:
            case People.RecentActivity.NotifyCollectionChangedAction.reset:
                // ignore these collection change events.
                return;
        }

        this._setContentVisibility$1();
        switch (e.action) {
            case People.RecentActivity.NotifyCollectionChangedAction.add:
                this._addEntries$1(e.newItems, e.newItemIndex);
                break;
            case People.RecentActivity.NotifyCollectionChangedAction.remove:
                this._removeEntries$1(e.oldItems);
                break;
        }    
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onRefreshCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.RefreshActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    this._refreshing$1 = false;
    this._feed$1.removeListenerSafe("refreshcompleted", this._onRefreshCompleted$1, this);
    this._lastResult$1 = e.result;
    People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
    if (e.isUpdated) {
        // invalidate list view states since we have updates.
        this._listview$1.invalidateStates();
        if (this._lastResult$1.isSuccessOrPartialFailure) {
            // reset the scroll position if we successfully refresh.
            this._listview$1.scrollPosition = 0;
        }

        if (this._listview$1.count > 0) {
            this._listview$1.item(0).setActive();
        }    
    }

    this._setContentVisibility$1();
    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.uiRefreshFeedEnd, this._network$1.id, this._network$1.identity.id);
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onPostClicked$1 = function(state) {
    /// <param name="state" type="Object"></param>
    var navData = People.RecentActivity.UI.Core.create_landingPageNavigationData();
    navData.isPostScenario = true;
    People.Nav.navigate(People.Nav.getMeUri(navData));
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onRefreshClicked$1 = function(state) {
    /// <param name="state" type="Object"></param>
    Jx.log.write(4, People.Social.format('FeedLayout::OnRefreshClicked({0},{1},{2})', this.isRendered, this._initialized$1, this._refreshing$1));

    if (this.isRendered && this._initialized$1 && this._feed$1.initialized && !this._refreshing$1) {
        People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.uiRefreshFeedStart, this._network$1.id, this._network$1.identity.id);
        People.RecentActivity.UI.Core.GlobalProgressControl.add(this);

        this._refreshing$1 = true;

        this._feed$1.addListener("refreshcompleted", this._onRefreshCompleted$1, this);
        this._feed$1.refresh();
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._getListViewOrientation$1 = function(layout) {
    /// <param name="layout" type="People.RecentActivity.Imports.LayoutState"></param>
    /// <returns type="People.RecentActivity.UI.Feed.StackingListViewOrientation"></returns>
    return (layout === 'snapped') ? 1 : 0;
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onCapabilitiesPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    var capabilities = e.sender;
    if (e.propertyName === 'CanShowWhatsNew') {
        if (capabilities.canShowWhatsNew) {
            // we can now show the what's new feed.
            this._initializeInternal$1();
        }

        this._setContentVisibility$1();
        this._setCommandButtonsVisibility$1();
    }
};

People.RecentActivity.UI.Feed.FeedLayout.prototype._onFilterChanged$1 = function(network) {
    /// <param name="network" type="People.RecentActivity.Network"></param>
    if (network !== this._network$1) {
        // we've got a new network that we should use.
        if (this._feed$1 != null) {
            // make sure we clear out the current list first.
            this._removeEntries$1(this._feed$1.entries.toArray());
        }

        // update the network
        this._network$1 = network;
        Jx.appData.localSettings().set('whatsNewPreferredNetwork', network.id);
        // then re-initialize the feed with the current network.
        this._initializeFeed$1();
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Core\ResultCode.js" />
/// <reference path="..\..\..\Core\ResultInfo.js" />
/// <reference path="..\..\..\Imports\LayoutState.js" />
/// <reference path="..\..\..\Imports\Panel.js" />
/// <reference path="..\..\..\Model\Events\ActionCompletedEventArgs.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\..\Model\Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="..\..\..\Model\Feed.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\..\Model\Identity.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageType.js" />
/// <reference path="..\..\Core\EventManager.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\InputManager.js" />
/// <reference path="..\..\Share\Controls\ShareControl.js" />
/// <reference path="EntryControl.js" />
/// <reference path="LinkEntryControl.js" />
/// <reference path="PhotoAlbumEntryControl.js" />
/// <reference path="PhotoEntryControl.js" />
/// <reference path="TextEntryControl.js" />
/// <reference path="VideoEntryControl.js" />

(function () {

    var minimumEntryHeight = 250;

    People.RecentActivity.UI.Feed.FeedPanel = function (identity, fields, hydrationData) {
        /// <summary>
        ///     Represents the pane used for the feed.
        /// </summary>
        /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
        /// <param name="fields" type="Object">The data fields.</param>
        /// <param name="hydrationData" type="Object">The hydration data.</param>
        /// <field name="_minimumEntryHeight$1" type="Number" integer="true" static="true">The minimum height for an entry, in pixels.</field>
        /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
        /// <field name="_title$1" type="People.RecentActivity.UI.Core.Control">The title.</field>
        /// <field name="_titleName$1" type="People.RecentActivity.UI.Core.Control">The title.</field>
        /// <field name="_titleMore$1" type="People.RecentActivity.UI.Core.Control">The title chevron.</field>
        /// <field name="_content$1" type="People.RecentActivity.UI.Core.Control">The content.</field>
        /// <field name="_contentShare$1" type="People.RecentActivity.UI.Core.Control">The share panel.</field>
        /// <field name="_contentContainer$1" type="People.RecentActivity.UI.Core.Control">The container for the What's New content.</field>
        /// <field name="_contentEntries$1" type="People.RecentActivity.UI.Core.Control">The content for entries.</field>
        /// <field name="_contentProgress$1" type="People.RecentActivity.UI.Core.Control">The progress control.</field>
        /// <field name="_contentEntriesContainer$1" type="People.RecentActivity.UI.Core.Control">
        ///     The current control containing entries. This control is animated
        ///     in/out when entries are added/removed.

        /// </field>
        /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors control.</field>
        /// <field name="_share$1" type="People.RecentActivity.UI.Share.ShareControl">The share control.</field>
        /// <field name="_feed$1" type="People.RecentActivity.Feed">The feed.</field>
        /// <field name="_isReady$1" type="Boolean">Whether the panel has been marked ready.</field>
        /// <field name="_isEntriesRendered$1" type="Boolean">Whether entries have been rendered.</field>
        /// <field name="_isDisposed$1" type="Boolean">Whether the panel was "disposed".</field>
        /// <field name="_controls$1" type="Array">The controls we're rendering.</field>
        /// <field name="_controlsToDispose$1" type="Array">The controls to dispose.</field>
        /// <field name="_isInitialized$1" type="Boolean">Whether the feed has been initialized.</field>
        /// <field name="_lastResult$1" type="People.RecentActivity.Core.ResultInfo">The last result.</field>
        /// <field name="_hydrationData$1" type="Object">The hydration data.</field>
        /// <field name="_activeIndex$1" type="Number" integer="true">The active index.</field>
        /// <field name="_activeItem$1" type="People.RecentActivity.UI.Core.Control">The active item.</field>
        /// <field name="_isPostScenario$1" type="Boolean">Whether this is a "New post" scenario.</field>
        /// <field name="_postNetworkSelection$1" type="String">Default network for the post scenario.</field>
        /// <field name="_isAnimating$1" type="Boolean">Whether we're currently animating.</field>
        /// <field name="_isUpdatedRequested$1" type="Boolean">Whether an update was requested while animating.</field>
        /// <field name="_shareHasRichLink$1" type="Boolean">Whether the share control is currently displaying a rich link preview.</field>
        /// <field name="_shareHeight$1" type="Number" integer="true">The height of the share control.</field>
        /// <field name="_currentShareAnimation$1" type="WinJS.Promise">The current share animation.</field>
        /// <field name="_inputPane$1" type="People.RecentActivity.UI.Core.InputManager">The input manager for the soft keyboard.</field>
        /// <field name="_inputPaneRect$1" type="Windows.UI.ViewManagement.InputPaneRectangle">The most recent input pane rectangle.</field>
        /// <field name="_focusFirstItem$1" type="Boolean">Whether to focus on the first item in the list.</field>
        People.RecentActivity.Imports.Panel.call(this, null, 'ra-feedPanelOuter panelView-snapActivePanel', People.PanelView.PanelPosition.feedPanel);

        Debug.assert(identity != null, 'identity != null');

        this._controls$1 = [];
        this._hydrationData$1 = hydrationData;
        this._identity$1 = identity;
        this._lastResult$1 = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);

        if (fields != null) {
            var navData = fields;
            this._isPostScenario$1 = navData.isPostScenario;
            this._postNetworkSelection$1 = this._identity$1.networks.findById(navData.postNetworkSelection);
        }

    };

    Jx.inherit(People.RecentActivity.UI.Feed.FeedPanel, People.RecentActivity.Imports.Panel);

    People.RecentActivity.UI.Feed.FeedPanel.prototype._identity$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._title$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._titleName$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._titleMore$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._content$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._contentShare$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._contentContainer$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._contentEntries$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._contentProgress$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._contentEntriesContainer$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._errors$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._share$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._feed$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._isReady$1 = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._isEntriesRendered$1 = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._isDisposed$1 = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._controls$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._controlsToDispose$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._isInitialized$1 = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._hydrationData$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._activeIndex$1 = 0;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._activeItem$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._isPostScenario$1 = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._postNetworkSelection$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._isAnimating$1 = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._isRenderingEntries = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._isUpdatedRequested$1 = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._shareHasRichLink$1 = false;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._shareHeight$1 = 0;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._currentShareAnimation$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._inputPane$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._inputPaneRect$1 = null;
    People.RecentActivity.UI.Feed.FeedPanel.prototype._focusFirstItem$1 = false;

    People.RecentActivity.UI.Feed.FeedPanel.prototype.activateUI = function (element) {
        /// <summary>
        ///     Activates the UI.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element.</param>
        Debug.assert(element != null, 'element != null');

        this._title$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-title');
        this._title$1.attach('keypress', this._onTitleKeyPress$1.bind(this));
        this._title$1.attach('click', this._onTitleClicked$1.bind(this));

        this._titleName$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-title-name');
        this._titleName$1.id = this._titleName$1.uniqueId;
        this._titleName$1.text = Jx.res.getString('/strings/raFeedPanelTitle');

        this._titleMore$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-title-more');
        this._titleMore$1.id = this._titleMore$1.uniqueId;
        this._titleMore$1.text = (People.RecentActivity.UI.Core.HtmlHelper.isRightToLeft) ? '\ue096' : '\ue097';

        People.Animation.addPressStyling(this._title$1.element);

        this._content$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-content');
        this._content$1.labelledBy = this._titleName$1.id + ' ' + this._titleMore$1.id;
        this._contentContainer$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-content-container');
        this._contentProgress$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-progress');
        this._contentEntries$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-entries');
        this._contentEntriesContainer$1 = this._contentProgress$1;

        // initialize the errors content, but initially hide it.
        this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._identity$1, People.RecentActivity.UI.Core.ErrorMessageContext.whatsNew, People.RecentActivity.UI.Core.ErrorMessageOperation.read, People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'panel-errors'));
        this._errors$1.render();
        this._errors$1.isVisible = false;

        // attach keyboard events.
        this._contentEntries$1.attach('keydown', this._onKeyDown$1.bind(this));

        // determine which network/feed to display.
        var network = this._identity$1.networks.aggregatedNetwork;
        if (network == null) {
            // we don't have an aggregated network for this user. let's try the first network instead.
            network = this._identity$1.networks.item(0);
        }

        this._feed$1 = network.feed;

        // initialize the share control if necessary.
        this._contentShare$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'panel-share');
        this._contentShare$1.isVisible = false;

        // we can now do some light-weight stuff like .. I don't know, initialize the feed maybe?
        this._feed$1.entries.addListener("collectionchanged", this._onEntriesCollectionChanged$1, this);

        var that = this;

        window.msSetImmediate(function () {
            if (that._isDisposed$1) {
                // we've already been disposed.
                return;
            }

            if (that._feed$1.initialized) {
                if (that._hydrationData$1 == null) {
                    that._feed$1.addListener("refreshcompleted", that._onRefreshCompleted$1, that);
                    that._feed$1.refresh();
                }

                // while we're refreshing, we can still render entries, because we've already been initialized.
                that._onReady$1();
            }
            else {
                that._feed$1.addListener("initializecompleted", that._onInitializeCompleted$1, that);
                if (that._hydrationData$1 != null) {
                    that._feed$1.initializeFromHydration();
                }
                else {
                    that._feed$1.initialize();
                }
            }
        });
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype.deactivateUI = function () {
        /// <summary>
        ///     Deactivates the UI.
        /// </summary>
        this._isDisposed$1 = true;

        People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowresized", this._onWindowResized$1, this);

        this._identity$1 = null;
        this._activeItem$1 = null;
        this._lastResult$1 = null;

        if (this._currentShareAnimation$1 != null) {
            this._currentShareAnimation$1.cancel();
            this._currentShareAnimation$1 = null;
        }

        if (this._inputPane$1 != null) {
            this._inputPane$1.removeListenerSafe("showing", this._onInputPaneShowing$1, this);
            this._inputPane$1.removeListenerSafe("hiding", this._onInputPaneHiding$1, this);
            this._inputPane$1.dispose();
            this._inputPane$1 = null;
            this._inputPaneRect$1 = null;

            // Ensure that the margin on the viewport is reset if the viewport is still around.
            var viewportElement = document.querySelector(".panelView-viewport");
            if (viewportElement) {
                viewportElement.style.marginTop = null;
            }
        }

        // detach various event handlers and such. we're not responsible for other clean-up.
        if (this._feed$1 != null) {
            this._feed$1.removeListenerSafe("initializecompleted", this._onInitializeCompleted$1, this);
            this._feed$1.removeListenerSafe("refreshcompleted", this._onRefreshCompleted$1, this);
            this._feed$1.entries.removeListenerSafe("collectionchanged", this._onEntriesCollectionChanged$1, this);
            this._feed$1 = null;
        }

        // clean up the entries themselves.
        if (this._controls$1 != null) {
            this._disposeControls$1(this._controls$1);
            this._controls$1 = null;
        }

        if (this._controlsToDispose$1 != null) {
            // dispose the old controls.
            this._disposeControls$1(this._controlsToDispose$1);
            this._controlsToDispose$1 = null;
        }

        if (this._share$1 != null) {
            this._share$1.removeListenerSafe("propertychanged", this._onSharePropertyChanged$1, this);
            this._share$1.removeListenerSafe("completed", this._onShareCompleted$1, this);
            this._share$1.dispose();
            this._share$1 = null;
        }

        if (this._contentShare$1 != null) {
            this._contentShare$1.dispose();
            this._contentShare$1 = null;
        }

        if (this._content$1 != null) {
            this._content$1.dispose();
            this._content$1 = null;
        }

        if (this._contentEntriesContainer$1 != null) {
            this._contentEntriesContainer$1.dispose();
            this._contentEntriesContainer$1 = null;
        }

        if (this._contentEntries$1 != null) {
            this._contentEntries$1.dispose();
            this._contentEntries$1 = null;
        }

        if (this._contentProgress$1 != null) {
            this._contentProgress$1.dispose();
            this._contentProgress$1 = null;
        }

        if (this._errors$1 != null) {
            this._errors$1.dispose();
            this._errors$1 = null;
        }

        if (this._contentContainer$1 != null) {
            this._contentContainer$1.dispose();
            this._contentContainer$1 = null;
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
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype.getUI = function () {
        /// <summary>
        ///     Gets the UI.
        /// </summary>
        /// <returns type="String"></returns>
        return People.RecentActivity.UI.Core.Html.feedPanel;
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype.ready = function () {
        /// <summary>
        ///     Signals that the panel can now perform heavier operations.
        /// </summary>
        this._isReady$1 = true;
        this._onReady$1();

        People.RecentActivity.UI.Core.EventManager.events.addListener("windowresized", this._onWindowResized$1, this);
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype.suspend = function () {
        /// <summary>
        ///     Suspends the feed panel.
        /// </summary>
        /// <returns type="Object"></returns>
        // we don't have any hydration data, but we store an empty object to indicate
        // we need to initialize from hydration the next time.
        return {};
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype.onLayoutChanged = function (layout) {
        /// <param name="layout" type="People.RecentActivity.Imports.LayoutState"></param>
        Jx.log.write(4, 'FeedPanel.OnLayoutchanged: ' + layout);

        this._onReady$1();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._disposeControls$1 = function (controls) {
        /// <param name="controls" type="Array"></param>
        Debug.assert(controls != null, 'controls');

        for (var i = 0, len = controls.length; i < len; i++) {
            controls[i].dispose();
        }

        controls.length = 0;
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._renderEntries$1 = function () {
        if (this._isEntriesRendered$1 || !this._contentContainer$1.isVisible) {
            // we've already rendered entries or they are not visible.
            return;
        }

        if (this._isAnimating$1 || this._isRenderingEntries) {
            // we're currently animating, so wait until that's done.
            this._isUpdatedRequested$1 = true;
            return;
        }

        this._isRenderingEntries = true;

        // simply go over all of the entries and figure out which ones we can render.
        var entries = this._feed$1.entries;
        var elementContainer = null;
        var controlContainer = null;

        // show the more control if there is at least one entry.
        var count = entries.count;
        if (count > 0) {
            this._isEntriesRendered$1 = true;

            // keep track of old controls so we can dispose them after the animations.
            this._controlsToDispose$1 = Array.apply(null, this._controls$1);
            this._controls$1.length = 0;

            // initialize a new box that we can use to put entries in.
            // make sure its not yet visible, of course.
            elementContainer = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.feedPanelEntries);
            elementContainer.style.opacity = '0';

            // append a dummy element to the container so no entry will have the last-child pseudo class applied.
            controlContainer = new People.RecentActivity.UI.Core.Control(elementContainer);
            controlContainer.appendChild(document.createElement('div'));

            // append the container so we can measure stuff.
            this._contentEntries$1.appendControl(controlContainer);

            // fetch the height of the container so we can start filling in a box.
            // subtract the "more" button from this height, of course.
            var height = WinJS.Utilities.getContentHeight(elementContainer);
            var heights = [];

            for (var i = 0, row = 1; (!this._controls$1.length) || ((i < count) && (height >= minimumEntryHeight)) ; i++, row++) {
                // render this entry and push it into our list of entries.
                var control = this._renderEntry$1(controlContainer, entries.item(i), row);
                control.role = 'option';

                var h = control.contentHeightPixels;

                heights.push(h + 'px');
                height -= h;
            }

            var c = this._controls$1.length;

            if (height < 0 && c > 1) {
                // If we get here we ended up adding one too many entries and should remove the last one.
                this._controls$1[c - 1].removeFromParent();
                this._controls$1[c - 1].dispose();
                this._controls$1.splice(c - 1, 1);

                // remove the last height definition as wel.
                heights.splice(c - 1, 1);

                c--;
            }

            // the last height definition will take up "auto", so remove it.
            heights.splice(c - 1, 1);
            heights.push('1fr');

            // update the grid rows of the container, such that every element will take up "auto"
            // space, except for the last one which needs to fit to whatever space is left.
            elementContainer.style['msGridRows'] = heights.join(' ');
            elementContainer.removeChild(elementContainer.lastChild);

            // once the last item has received its final width, make sure it fits.
            this._controls$1[c - 1].isFixedHeight = true;
        }
        else {
            if (this._isInitialized$1) {
                // we only need to show the label when we've been fully initialized.
                this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;

                if (this._lastResult$1.code === People.RecentActivity.Core.ResultCode.success) {
                    // the request was successful, so there must not be any errors.
                    this._errors$1.showType(People.RecentActivity.UI.Core.ErrorMessageType.empty);
                }
                else {
                    this._errors$1.show(this._lastResult$1);
                }

                // the next control is the error control, because we have no entries.
                controlContainer = this._errors$1;
            }
            else {
                // if we're not yet initialized, we shouldn't do any transition stuff.
                this._isRenderingEntries = false;
                return;
            }
        }

        this._animateEntries$1(controlContainer);
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._animateEntries$1 = function (container) {
        /// <param name="container" type="People.RecentActivity.UI.Core.Control"></param>
        Debug.assert(container != null, 'container');

        this._isAnimating$1 = true;

        var promise = null;
        var that = this;

        if (this._contentEntriesContainer$1.isVisible) {
            promise = People.Animation.fadeOut(this._contentEntriesContainer$1.element);
        }
        else {
            promise = WinJS.Promise.wrap(null);
        }

        // chain a done() to render/update/whatever.
        promise.then(function () {
            if (!that._isDisposed$1) {
                // remove the old panel from the DOM.
                // update the current container and then make it appear, like magicks!
                that._contentEntriesContainer$1.removeFromParent();
                that._contentEntriesContainer$1 = container;
                that._contentEntries$1.appendControl(container);
                that._contentEntriesContainer$1.isVisible = true;

                return People.Animation.fadeIn(that._contentEntriesContainer$1.element);
            }

            return null;
        });
        promise.done(function () {
            that._isAnimating$1 = false;
            that._isRenderingEntries = false;

            if (!that._isDisposed$1) {
                if (that._controlsToDispose$1 != null) {
                    // dispose the old controls.
                    that._disposeControls$1(that._controlsToDispose$1);
                }

                if (that._focusFirstItem$1) {
                    that._activeItem$1.focus();
                    that._focusFirstItem$1 = false;
                }

                if (that._isUpdatedRequested$1) {
                    // an update was requested while animating, so run another update.
                    that._isEntriesRendered$1 = false;
                    that._isUpdatedRequested$1 = false;
                    that._renderEntries$1();
                }
            }

            return null;
        });
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._renderEntry$1 = function (parent, entry, row) {
        /// <param name="parent" type="People.RecentActivity.UI.Core.Control"></param>
        /// <param name="entry" type="People.RecentActivity.FeedEntry"></param>
        /// <param name="row" type="Number" integer="true"></param>
        /// <returns type="People.RecentActivity.UI.Feed.EntryControl"></returns>
        Debug.assert(parent != null, 'parent');
        Debug.assert(entry != null, 'entry');

        // we need to create a new control.
        var control = null;

        switch (entry.entryType) {
            case People.RecentActivity.FeedEntryType.link:
                control = new People.RecentActivity.UI.Feed.LinkEntryControl(entry);
                break;
            case People.RecentActivity.FeedEntryType.photo:
                control = new People.RecentActivity.UI.Feed.PhotoEntryControl(entry);
                break;
            case People.RecentActivity.FeedEntryType.text:
                control = new People.RecentActivity.UI.Feed.TextEntryControl(entry);
                break;
            case People.RecentActivity.FeedEntryType.video:
                control = new People.RecentActivity.UI.Feed.VideoEntryControl(entry);
                break;
            case People.RecentActivity.FeedEntryType.photoAlbum:
                control = new People.RecentActivity.UI.Feed.PhotoAlbumEntryControl(entry);
                break;
        }

        this._controls$1.push(control);

        // append the control to the parent.
        control.loadElement();
        parent.insertControlBeforeChild(control, parent.element.lastChild);

        // we need to render the entry.
        control.isFixedWidth = true;
        control.load();
        control.render();

        // update the style of the entry.
        var element = control.element;
        element.style['msGridRow'] = row.toString();

        if (row === 1) {
            // only the first entry receives initial tab focus.
            element.tabIndex = 0;

            this._activeIndex$1 = 0;
            this._activeItem$1 = control;
        }

        return control;
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onReady$1 = function () {
        if (this._isReady$1) {
            // Initialize share if necessary
            if (this._identity$1.capabilities.canShare && this._share$1 == null) {
                this._contentShare$1.isVisible = true;
                this._share$1 = new People.RecentActivity.UI.Share.ShareControl(this._identity$1, this._feed$1);
                this._share$1.addListener("propertychanged", this._onSharePropertyChanged$1, this);
                this._share$1.addListener("completed", this._onShareCompleted$1, this);
                this._contentShare$1.appendControl(this._share$1);

                var that = this;
                this._share$1.render().then(function () {
                    if (that._isPostScenario$1 && that._hydrationData$1 == null) {
                        that._share$1.focus();
                        if (that._postNetworkSelection$1) {
                            that._share$1.selectNetwork$1(that._postNetworkSelection$1);
                        }
                    }
                });

                this._shareHeight$1 = WinJS.Utilities.getContentHeight(this._contentShare$1.element);
                this._inputPane$1 = new People.RecentActivity.UI.Core.InputManager();
                this._inputPane$1.addListener("showing", this._onInputPaneShowing$1, this);
                this._inputPane$1.addListener("hiding", this._onInputPaneHiding$1, this);
            }

            this._renderEntries$1();

            // hide the error container by default.
            this._errors$1.isVisible = false;

            if (this._controls$1.length > 0) {
                // now that we're initialized, we can start rendering entries.
                this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.messageBar;
                this._errors$1.show(this._lastResult$1);
            }
        }
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._navigateToFull$1 = function () {
        if (this._identity$1.isTemporary) {
            People.Nav.navigate(People.Nav.getViewRAUri(null, this._identity$1.getDataContext()));
        }
        else {
            People.Nav.navigate(People.Nav.getViewRAUri(this._identity$1.id, null));
        }
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._resizeShareControl$1 = function () {
        /// <summary>
        ///     Resize the share control based upon whether it is currently displaying content.
        /// </summary>
        if (this._share$1 == null) {
            // Since there is no share control, there's nothing to resize.
            return;
        }

        if (this._shareHasRichLink$1 && this._contentContainer$1.isVisible) {
            var that = this;

            var container = this._contentContainer$1.element;

            this._currentShareAnimation$1 = People.Animation.fadeOut(container);
            this._currentShareAnimation$1.done(function () {
                that._currentShareAnimation$1 = null;

                if (!that._isDisposed$1) {
                    container.style.opacity = '';
                    that._contentEntriesContainer$1.isVisible = false;
                    that._contentContainer$1.isVisible = false;
                    that._content$1.addClass('ra-panelContentExpandShare');
                    that._adjustForInputPane$1();
                }

                return null;
            });
        }
        else if (!this._shareHasRichLink$1 && !this._contentContainer$1.isVisible) {
            this._content$1.removeClass('ra-panelContentExpandShare');
            this._adjustForInputPane$1();

            // We need to make sure the entries are rendered before showing.
            this._contentContainer$1.isVisible = true;
            this._isEntriesRendered$1 = false;
            this._onReady$1();
        }

        this._adjustForInputPane$1();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._adjustForInputPane$1 = function () {
        /// <summary>
        ///     Adjusts the content based on the input pane.
        /// </summary>
        if (this._share$1 == null) {
            // Since there is no share control, there is nothing to do.
            return;
        }

        var shareElement = this._contentShare$1.element;
        var shareStyle = shareElement.style;
        var viewportElement = document.querySelector(".panelView-viewport");
        var viewportStyle = viewportElement.style;

        if (this._inputPaneRect$1 != null) {
            // Reset the styles
            shareStyle.height = null;
            viewportStyle.marginTop = null;

            var sharePosition = WinJS.Utilities.getPosition(shareElement);
            var usableHeight = window.screen.height - this._inputPaneRect$1.height;
            var shareBottom = sharePosition.top + this._shareHeight$1;

            var bottomDiff = usableHeight - shareBottom;
            if (bottomDiff > 0 && (bottomDiff <= 100 || this._shareHasRichLink$1)) {
                shareStyle.height = (usableHeight - sharePosition.top) + 'px';
                viewportStyle.marginTop = null;
            }
            else if (bottomDiff < 0) {
                viewportStyle.marginTop = bottomDiff + 'px';
                shareStyle.height = this._shareHeight$1 + 'px';
            }

        } else if (this._inputPaneRect$1 == null) {
            shareStyle.height = null;
            viewportStyle.marginTop = null;
        }

        this._share$1.refreshSize();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onTitleKeyPress$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        if (ev.keyCode === WinJS.Utilities.Key.enter || ev.keyCode === WinJS.Utilities.Key.space) {
            this._navigateToFull$1();
        }
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onTitleClicked$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        // navigate to the full experience.
        this._navigateToFull$1();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onInitializeCompleted$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        this._isInitialized$1 = true;
        this._lastResult$1 = e.result;
        this._onReady$1();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onRefreshCompleted$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.RefreshActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        this._lastResult$1 = e.result;
        this._isInitialized$1 = true;
        this._onReady$1();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onEntriesCollectionChanged$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
        Debug.assert(e != null, 'e');

        // We only want to trigger an OnReady call if the items fall within the range of currently rendered items.
        if ((e.newItemIndex > -1 && e.newItemIndex < this._controls$1.length) ||
            (e.oldItemIndex > -1 && e.oldItemIndex < this._controls$1.length) ||
             e.action === People.RecentActivity.NotifyCollectionChangedAction.reset) {
            // the collection changed, so we should update.
            this._isEntriesRendered$1 = false;
            this._onReady$1();
        }
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onKeyDown$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev');

        var count = this._controls$1.length;
        if (!count) {
            // no controls, don't bother with this stuff.
            return;
        }

        switch (ev.keyCode) {
            case WinJS.Utilities.Key.downArrow:
                this._activeIndex$1++;
                break;
            case WinJS.Utilities.Key.upArrow:
                this._activeIndex$1--;
                break;
            default:
                // don't handle keystrokes we don't understand, of course :-)
                return;
        }

        // remove the tab index from the current item.
        this._activeItem$1.element.tabIndex = -1;
        // normalize to 0 (doesn't make much sense to tab to index -1 :-)

        this._activeIndex$1 = Math.min(Math.max(0, this._activeIndex$1), this._controls$1.length - 1);
        this._activeItem$1 = this._controls$1[this._activeIndex$1];

        var element = this._activeItem$1.element;
        element.tabIndex = 0;
        element.focus();

        ev.preventDefault();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onSharePropertyChanged$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
        var share = e.sender;
        switch (e.propertyName) {
            case 'HasRichLink':
                this._shareHasRichLink$1 = share.hasRichLink;
                this._resizeShareControl$1();
                break;
        }
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onShareCompleted$1 = function (result) {
        /// <param name="result" type="People.RecentActivity.Core.ResultCode"></param>
        if (result === People.RecentActivity.Core.ResultCode.success) {
            if (this._activeItem$1 != null) {
                this._focusFirstItem$1 = true;
            }
        }
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onInputPaneShowing$1 = function (e) {
        /// <summary>
        ///     Handles the <see cref="E:People.RecentActivity.UI.Core.InputManager.Showing" /> event.
        /// </summary>
        /// <param name="e" type="Windows.UI.ViewManagement.InputPaneEvent">The event arguments</param>
        e.ensuredFocusedElementInView = true;

        this._inputPaneRect$1 = e.occludedRect;
        this._resizeShareControl$1();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onInputPaneHiding$1 = function (e) {
        /// <summary>
        ///     Handles the <see cref="E:People.RecentActivity.UI.Core.InputManager.Hiding" /> event.
        /// </summary>
        /// <param name="e" type="Windows.UI.ViewManagement.InputPaneEvent">The event arguments</param>
        e.ensuredFocusedElementInView = true;

        this._inputPaneRect$1 = null;
        this._resizeShareControl$1();
    };

    People.RecentActivity.UI.Feed.FeedPanel.prototype._onWindowResized$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        this._isEntriesRendered$1 = false;
        this._resizeShareControl$1();
        this._onReady$1();
    };
})();
});