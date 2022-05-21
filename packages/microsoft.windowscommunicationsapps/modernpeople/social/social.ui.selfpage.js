
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People.RecentActivity.UI.SelfPage, "SelfPage", function () {

People.loadSocialModel();
People.loadSocialUICore();
People.RecentActivity.UI.Host.LandingPagePanelProvider;

$include("$(cssResources)/Social.css");

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.SelfPage.create_selfPageSidebarHydrationData = function(version, isReactionsExpanded, isSummaryExpanded, scrollPosition, commentInput, extraData) {
    var o = { };
    o.ci = commentInput;
    o.id = extraData;
    o.ire = isReactionsExpanded;
    o.ise = isSummaryExpanded;
    o.ssp = scrollPosition;
    o.v = version;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.SelfPage.create_selfPageHydrationData = function(version, contentData, sidebarData, sidebarVisible) {
    var o = { };
    o.cd = contentData;
    o.sd = sidebarData;
    o.sv = sidebarVisible;
    o.v = version;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.SelfPage.create_selfPagePhotoAlbumItemHydrationData = function(version, currentItem, scrollPosition) {
    var o = {};
    o.v = version;
    o.c = currentItem;
    o.s = scrollPosition;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.SelfPage.create_selfPagePhotoAlbumPhoto = function(photo) {
    var o = { };
    Debug.assert(photo != null, 'photo != null');
    o.photo = photo;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.SelfPage.create_selfPagePhotoAlbumLayoutRecord = function(itemIndex, element) {
    var o = { };
    o.element = element;
    o.itemIndex = itemIndex;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.SelfPage.create_selfPageVideoItemHydrationData = function(isPaused, isEnded, offset) {
    var o = { };
    o.p = isPaused;
    o.s = isEnded;
    o.o = offset;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Model\CommentCollection.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="CommentListControl.js" />

People.RecentActivity.UI.SelfPage.CommentControl = function(obj) {
    /// <summary>
    ///     Provides a control for rendering comments.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The object.</param>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_comments$1" type="People.RecentActivity.CommentCollection">The comment collection.</field>
    /// <field name="_list$1" type="People.RecentActivity.UI.SelfPage.CommentListControl">The list of comments.</field>
    /// <field name="_title$1" type="People.RecentActivity.UI.Core.Control">The title.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPageComments));
    Debug.assert(obj != null, 'obj != null');
    this._obj$1 = obj;
    this._comments$1 = this._obj$1.comments;
    this._comments$1.addListener("propertychanged", this._onCommentCollectionPropertyChanged$1, this);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.CommentControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.SelfPage.CommentControl.prototype._obj$1 = null;
People.RecentActivity.UI.SelfPage.CommentControl.prototype._comments$1 = null;
People.RecentActivity.UI.SelfPage.CommentControl.prototype._list$1 = null;
People.RecentActivity.UI.SelfPage.CommentControl.prototype._title$1 = null;

People.RecentActivity.UI.SelfPage.CommentControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    var element = this.element;
    var loc = Jx.res;
    // render the little "COMMENTS" title.
    this._title$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-comment-title');
    this._title$1.id = this._title$1.uniqueId;
    this._title$1.text = loc.getString('/strings/selfPage-commentTitle-' + this._obj$1.sourceId);
    this._title$1.isVisible = this._comments$1.count > 0;
    this._title$1.isHiddenFromScreenReader = true;
    // initialize the actual list of comments.
    this._list$1 = new People.RecentActivity.UI.SelfPage.CommentListControl(People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'item-comment-list'), this._obj$1);
    this._list$1.labelledBy = this._title$1.id;
    this._list$1.render();
};

People.RecentActivity.UI.SelfPage.CommentControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the control is being disposed.
    /// </summary>
    if (this._title$1 != null) {
        this._title$1.dispose();
        this._title$1 = null;
    }

    if (this._list$1 != null) {
        this._list$1.dispose();
        this._list$1 = null;
    }

    // make sure to detach events.
    this._comments$1.removeListenerSafe("propertychanged", this._onCommentCollectionPropertyChanged$1, this);
    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.CommentControl.prototype._onCommentCollectionPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (e.propertyName === 'Count') {
        // update the visibility of the "COMMENTS" title.
        this._title$1.isVisible = this._comments$1.count > 0;
        this._title$1.isHiddenFromScreenReader = true;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\..\Core\BICI\BiciReactionTypes.js" />
/// <reference path="..\..\..\Core\BICI\BiciReactionUpdate.js" />
/// <reference path="..\..\..\Core\ResultCode.js" />
/// <reference path="..\..\..\Model\CommentCollection.js" />
/// <reference path="..\..\..\Model\Events\CommentActionCompletedEventArgs.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LinkHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.SelfPage.CommentInputControl = function(obj) {
    /// <summary>
    ///     Provides a control for rendering an input box for comments.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <field name="_urlMatcher$1" type="RegExp" static="true">The regular expression used to match URLs.</field>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The original object.</field>
    /// <field name="_sourceId$1" type="String">The source id.</field>
    /// <field name="_comments$1" type="People.RecentActivity.CommentCollection">The comments.</field>
    /// <field name="_input$1" type="People.RecentActivity.UI.Core.Control">The input control.</field>
    /// <field name="_button$1" type="People.RecentActivity.UI.Core.Control">The button.</field>
    /// <field name="_watermark$1" type="Boolean">Whether the watermark is currently displayed.</field>
    /// <field name="_details$1" type="People.RecentActivity.UI.Core.Control">The details.</field>
    /// <field name="_count$1" type="People.RecentActivity.UI.Core.Control">The count.</field>
    /// <field name="_errors$1" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors.</field>
    /// <field name="_maxLength$1" type="Number" integer="true">The maximum length.</field>
    /// <field name="_prefix$1" type="String">The prefix.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPageCommentInput));

    Debug.assert(obj != null, 'obj != null');

    this._obj$1 = obj;
    this._sourceId$1 = obj.sourceId;
    this._comments$1 = this._obj$1.comments;

    // cache these values for perf
    this._maxLength$1 = this._comments$1.maximumLength;
    this._prefix$1 = this._comments$1.prefix;

    this.render();
};

Jx.inherit(People.RecentActivity.UI.SelfPage.CommentInputControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.SelfPage.CommentInputControl._urlMatcher$1 = new RegExp('https?://[^\\s]+', 'i');
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._obj$1 = null;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._sourceId$1 = null;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._comments$1 = null;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._input$1 = null;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._button$1 = null;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._watermark$1 = true;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._details$1 = null;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._count$1 = null;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._errors$1 = null;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._maxLength$1 = 0;
People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._prefix$1 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.CommentInputControl.prototype, "input", {
    get: function() {
        /// <summary>
        ///     Gets or sets the input.
        /// </summary>
        /// <value type="String"></value>
        if (this._watermark$1) {
            return '';
        }

        return this._input$1.text;
    },
    set: function(value) {
        Debug.assert(value != null, 'value != null');

        if (Jx.isNonEmptyString(value)) {
            // enable the input and set the new value.
            this._hideWatermark$1();
            this._input$1.text = value;
            this._updateCount$1();
            this._updateSize$1();
        }
        else {
            this._showWatermark$1();
        }
    }
});

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype.focus = function() {
    /// <summary>
    ///     Focuses on the input.
    /// </summary>
    this._input$1.element.focus();
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    var loc = Jx.res;

    // append the HTML for the input control.
    var element = this.element;

    this._details$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-comment-details');
    this._details$1.isVisible = false;

    // initialize the input control.
    this._input$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-comment-input');
    this._input$1.attach('input', this._onInputChanged$1.bind(this));
    this._input$1.attach('focus', this._onInputFocus$1.bind(this));
    this._input$1.attach('blur', this._onInputBlur$1.bind(this));
    this._input$1.addClass('watermark');
    this._input$1.label = loc.getString('/strings/selfPage-commentInputLabel-' + this._sourceId$1);

    this._updateWatermark$1();

    // initialize the button.
    this._button$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-comment-submit');
    this._button$1.attach('click', this._onButtonClicked$1.bind(this));
    this._button$1.isDisabled = true;
    this._button$1.isVisible = false;
    this._button$1.label = loc.getString('/strings/selfPage-commentAddButtonLabel-' + this._sourceId$1);
    this._button$1.text = loc.getString('/strings/selfPage-commentAddButton-' + this._sourceId$1);

    // initialize the count
    this._count$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-comment-count');
    this._count$1.label = loc.getString('/strings/selfPage-commentCountLabel');

    // initialize the error controls.
    this._errors$1 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._comments$1.network.identity, People.RecentActivity.UI.Core.ErrorMessageContext.none, People.RecentActivity.UI.Core.ErrorMessageOperation.write, People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'item-comment-errors'));
    this._errors$1.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;
    this._errors$1.render();
    this._errors$1.isVisible = false;
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    // detach the event just in case we attached it just before we are getting disposed.
    this._comments$1.removeListenerSafe("addcommentcompleted", this._onAddCommentCompleted$1, this);

    if (this._input$1 != null) {
        this._input$1.dispose();
        this._input$1 = null;
    }

    if (this._errors$1 != null) {
        this._errors$1.dispose();
        this._errors$1 = null;
    }

    if (this._button$1 != null) {
        this._button$1.dispose();
        this._button$1 = null;
    }

    if (this._count$1 != null) {
        this._count$1.dispose();
        this._count$1 = null;
    }

    if (this._details$1 != null) {
        this._details$1.dispose();
        this._details$1 = null;
    }

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._hideWatermark$1 = function () {
    if (this._watermark$1) {
        var expandAnimation = People.Animation.createExpandAnimation(this._details$1.element, this._input$1.element);

        // remove the watermark and show the button, but keep it disabled.
        this._watermark$1 = false;
        this._input$1.removeClass('watermark');

        // only hide the watermark if there isn't a custom prefix.
        if (!Jx.isNonEmptyString(this._prefix$1)) {
            this._input$1.text = '';
        }

        this._button$1.isHiddenFromScreenReader = true;
        this._button$1.isDisabled = true;
        this._button$1.isVisible = true;
        this._details$1.isVisible = true;
        this._updateCount$1();

        expandAnimation.execute().done();
    }
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._showWatermark$1 = function () {
    var expandedHeight = this.element.offsetHeight;
    var collapseAnimation = People.Animation.createCollapseAnimation(this._details$1.element, this._input$1.element);

    // the user entered no text, so revert to the watermark.
    this._watermark$1 = true;

    this._input$1.addClass('watermark');
    this._input$1.isDisabled = false;

    this._updateWatermark$1();
    this._updateSize$1();

    this._button$1.isDisabled = true;
    this._button$1.isVisible = false;
    this._details$1.isVisible = false;

    this.element.style.marginTop = (expandedHeight - this.element.offsetHeight) + 'px';

    var that = this;
    collapseAnimation.execute().done(function () {
        if (!that.isDisposed) {
            that.element.style.marginTop = null;
        }

        return null;
    });
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._updateWatermark$1 = function() {
    if (Jx.isNonEmptyString(this._prefix$1)) {
        // we need to use the screen name of the publisher.
        this._input$1.text = this._prefix$1;
    }
    else {
        // this is a generic network, just show the default watermark.
        this._input$1.text = Jx.res.getString('/strings/selfPage-commentInputWatermark');
    }
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._updateCount$1 = function(length) {
    /// <param name="length" type="Number" integer="true"></param>
    if (this._maxLength$1 === -1) {
        // just keep hiding the count.
        this._count$1.isVisible = false;
    }
    else {
        if (Jx.isUndefined(length)) {
            // only get the length if it hasn't been passed in yet.
            length = this._getTextLength$1();
        }

        // update the count.
        this._count$1.isVisible = true;
        this._count$1.text = Jx.res.loadCompoundString('/strings/selfPage-commentCount', length, this._maxLength$1);
    }
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._updateSize$1 = function() {
    var element = this._input$1.element;
    var style = element.style;
    var height = element.scrollHeight - People.RecentActivity.UI.Core.HtmlHelper.getVerticalPadding(element);
    height = People.RecentActivity.UI.Core.HtmlHelper.snapToLineHeight(element, height);
    style.height = height + 'px';
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._getTextLength$1 = function() {
    /// <returns type="Number" integer="true"></returns>
    var element = this._input$1.element;
    return People.RecentActivity.UI.Core.LinkHelper.calculateContentLength(element.value, this._obj$1.sourceId);
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._onAddCommentCompleted$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.CommentActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (e.userState === this) {
        // we've added the comment, hooray!
        this._comments$1.removeListenerSafe("addcommentcompleted", this._onAddCommentCompleted$1, this);
        if (e.result.code === People.RecentActivity.Core.ResultCode.success) {
            People.RecentActivity.Core.BiciHelper.createReactionUpdateDatapoint(this._comments$1.network.id, People.RecentActivity.Core.BiciReactionUpdate.add, People.RecentActivity.Core.BiciReactionTypes.comment);
            this._showWatermark$1();
        }
        else {
            // show the error, woo!
            this._errors$1.isVisible = true;
            this._errors$1.show(e.result);
            // we need to keep the button around.
            this._input$1.isDisabled = false;
            this._button$1.isDisabled = false;
        }    
    }
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._onButtonClicked$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    // hide the error container.
    this._errors$1.isVisible = false;
    // disable the button and input box while submitting the comment.
    this._input$1.isDisabled = true;
    this._button$1.isDisabled = true;
    var text = this._input$1.text;
    text = text.trim();
    this._comments$1.addListener("addcommentcompleted", this._onAddCommentCompleted$1, this);
    this._comments$1.add(text, this);
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._onInputChanged$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    if (!this._watermark$1) {
        // enable or disable the button depending on whether text has been entered.
        var length = this._getTextLength$1();
        if ((!length) || ((this._maxLength$1 !== -1) && (length > this._maxLength$1))) {
            this._button$1.isDisabled = true;
            this._button$1.isHiddenFromScreenReader = true;
        }
        else {
            this._button$1.isDisabled = false;
            this._button$1.isHiddenFromScreenReader = false;
        }

        this._updateCount$1(length);
        this._updateSize$1();
    }
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._onInputFocus$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    var watermark = this._watermark$1;
    this._hideWatermark$1();
    if (watermark && Jx.isNonEmptyString(this._prefix$1)) {
        var length = this._prefix$1.length;
        // we were showing a watermark and the prefix is not empty (e.g. there's a "@something " shown)
        // this means we should set our cursor to the end of the input box.
        var element = this._input$1.element;
        element.setSelectionRange(length, length);
    }
};

People.RecentActivity.UI.SelfPage.CommentInputControl.prototype._onInputBlur$1 = function(ev) {
    /// <param name="ev" type="Event"></param>
    var text = this._input$1.text;
    if ((!text.trim().length) || (text === this._prefix$1)) {
        // show the watermark when the user has not entered any text (or just whitespace.)
        this._showWatermark$1();
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\Comment.js" />
/// <reference path="..\..\..\Model\CommentCollection.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\Core\Controls\NavigatableControl.js" />
/// <reference path="CommentListItemControl.js" />

People.RecentActivity.UI.SelfPage.CommentListControl = function(element, obj) {
    /// <summary>
    ///     Provides a control for rendering a list of items.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <field name="_obj$2" type="People.RecentActivity.FeedObject">The feed entry.</field>
    /// <field name="_comments$2" type="People.RecentActivity.CommentCollection">The comments.</field>
    /// <field name="_map$2" type="Object">A map to quickly look up comments.</field>
    /// <field name="_items$2" type="Array">The list of items.</field>
    People.RecentActivity.UI.Core.NavigatableControl.call(this, element, WinJS.Utilities.Key.downArrow, WinJS.Utilities.Key.upArrow);
    Debug.assert(obj != null, 'obj != null');
    this._obj$2 = obj;
    this._comments$2 = this._obj$2.comments;
    this._comments$2.addListener("collectionchanged", this._onCollectionChanged$2, this);
    this._items$2 = [];
    this._map$2 = {};
};

Jx.inherit(People.RecentActivity.UI.SelfPage.CommentListControl, People.RecentActivity.UI.Core.NavigatableControl);


People.RecentActivity.UI.SelfPage.CommentListControl.prototype._obj$2 = null;
People.RecentActivity.UI.SelfPage.CommentListControl.prototype._comments$2 = null;
People.RecentActivity.UI.SelfPage.CommentListControl.prototype._map$2 = null;
People.RecentActivity.UI.SelfPage.CommentListControl.prototype._items$2 = null;

People.RecentActivity.UI.SelfPage.CommentListControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    for (var i = this._comments$2.count - 1; i >= 0; i--) {
        // render each comment in the appropriate position.
        this._addComment$2(this._comments$2.item(i), 0);
    }

    if (this._items$2.length > 0) {
        // set the active item to the "last" item.
        this.activeItem = this._items$2[0];
    }

    People.RecentActivity.UI.Core.NavigatableControl.prototype.onRendered.call(this);
};

People.RecentActivity.UI.SelfPage.CommentListControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the control is being disposed.
    /// </summary>
    for (var i = 0; i < this._items$2.length; i++) {
        this._items$2[i].dispose();
        this._items$2[i] = null;
    }

    this._items$2.length = 0;
    People.Social.clearKeys(this._map$2);
    this._comments$2.removeListenerSafe("collectionchanged", this._onCollectionChanged$2, this);
    People.RecentActivity.UI.Core.NavigatableControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.CommentListControl.prototype._addComments$2 = function(comments, index) {
    /// <param name="comments" type="Array" elementType="Comment"></param>
    /// <param name="index" type="Number" integer="true"></param>
    Debug.assert(comments != null, 'comments != null');
    for (var n = 0; n < comments.length; n++) {
        var comment = comments[n];
        // add each comment in the correct position.
        this._addComment$2(comment, index++);
    }
};

People.RecentActivity.UI.SelfPage.CommentListControl.prototype._addComment$2 = function(comment, index) {
    /// <param name="comment" type="People.RecentActivity.Comment"></param>
    /// <param name="index" type="Number" integer="true"></param>
    Debug.assert(comment != null, 'comment != null');
    Debug.assert(index >= 0, 'index >= 0');
    if (!!Jx.isUndefined(this._map$2[comment.id])) {
        // initialize a new item, then add it to the DOM and map.
        var item = new People.RecentActivity.UI.SelfPage.CommentListItemControl(this._obj$2, comment);
        this._items$2.splice(index, 0, item);
        this._map$2[comment.id] = item;
        var element = this.element;
        // if this is the last item in the list, add it straight away -- otherwise
        // grab the sibling control and insert it before that control.
        if (index >= this._items$2.length - 1) {
            element.appendChild(item.element);
        }
        else {
            var sibling = this._items$2[index + 1];
            element.insertBefore(item.element, sibling.element);
        }

        if (comment.isPublishedInApp) {
            People.Animation.fadeIn(item.element).done();
        }

        // add the control for keyboard navigation.
        this.insertTabControl(item, index);
    }
};

People.RecentActivity.UI.SelfPage.CommentListControl.prototype._removeComments$2 = function(comments) {
    /// <param name="comments" type="Array" elementType="Comment"></param>
    Debug.assert(comments != null, 'comments != null');
    for (var n = 0; n < comments.length; n++) {
        var comment = comments[n];
        // remove each comment from the UI.
        this._removeComment$2(comment);
    }
};

People.RecentActivity.UI.SelfPage.CommentListControl.prototype._removeComment$2 = function(comment) {
    /// <param name="comment" type="People.RecentActivity.Comment"></param>
    Debug.assert(comment != null, 'comment != null');
    var item;
    if (!Jx.isUndefined(this._map$2[comment.id])) {
        // the comment is still in the UI, remove it.
        item = this._map$2[comment.id];
        item.removeFromParent();
        var index = this._items$2.indexOf(item);
        if (index !== -1) {
            this._items$2.splice(index, 1);
        }

        delete this._map$2[comment.id];
        // remove the control for keyboard navigation.
        this.removeTabControl(item);
        item.dispose();
    }
};

People.RecentActivity.UI.SelfPage.CommentListControl.prototype._onCollectionChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (!this.isRendered) {
        // we haven't been rendered yet, so ignore this event.
        return;
    }

    switch (e.action) {
        case People.RecentActivity.NotifyCollectionChangedAction.add:
            this._addComments$2(e.newItems, e.newItemIndex);
            break;
        case People.RecentActivity.NotifyCollectionChangedAction.remove:
            this._removeComments$2(e.oldItems);
            break;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementContextOptions.js" />
/// <reference path="..\..\..\Model\Comment.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\Core\Controls\ContactControl.js" />
/// <reference path="..\..\Core\Controls\ContactControlType.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\FormattedTextControl.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\TimestampUpdateTimer.js" />

People.RecentActivity.UI.SelfPage.CommentListItemControl = function(obj, comment) {
    /// <summary>
    ///     Initializes a new instance of the <see cref="T:People.RecentActivity.UI.SelfPage.CommentListItemControl" /> class.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <param name="comment" type="People.RecentActivity.Comment">The comment.</param>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_comment$1" type="People.RecentActivity.Comment">The comment.</field>
    /// <field name="_publisher$1" type="People.RecentActivity.UI.Core.ContactControl">The publisher.</field>
    /// <field name="_text$1" type="People.RecentActivity.UI.Core.FormattedTextControl">The text.</field>
    /// <field name="_time$1" type="People.RecentActivity.UI.Core.Control">The timestamp.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPageComment));
    Debug.assert(obj != null, 'obj != null');
    Debug.assert(comment != null, 'comment != null');
    this._comment$1 = comment;
    this._obj$1 = obj;
    this.render();
};

Jx.inherit(People.RecentActivity.UI.SelfPage.CommentListItemControl, People.RecentActivity.UI.Core.Control);


People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype._obj$1 = null;
People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype._comment$1 = null;
People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype._publisher$1 = null;
People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype._text$1 = null;
People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype._time$1 = null;

People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    var element = this.element;

    // initialize the pictuer and name (IC controls).
    this._publisher$1 = new People.RecentActivity.UI.Core.ContactControl(this._comment$1.publisher.getDataContext());
    var elementName = People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'item-comment-name');
    elementName.id = (elementName).uniqueID;
    elementName.appendChild(this._publisher$1.getElement(People.RecentActivity.UI.Core.ContactControlType.name, People.RecentActivity.Imports.create_identityElementContextOptions(this._obj$1.sourceId), -1));
    this._publisher$1.activate(elementName, false);

    // intialize the actual content.
    this._text$1 = new People.RecentActivity.UI.Core.FormattedTextControl(People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'item-comment-text'), this._obj$1.sourceId, false);
    this._text$1.id = this._text$1.uniqueId;
    this._text$1.update(this._comment$1.text, this._comment$1.entities);

    // initialize the time.
    this._time$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-comment-time');
    this._time$1.id = this._time$1.uniqueId;
    this._updateTime$1();

    // update the label.
    this.labelledBy = elementName.id + ' ' + this._text$1.id + ' ' + this._time$1.id;

    // attach a timer to update the timestamp.
    People.RecentActivity.UI.Core.TimestampUpdateTimer.subscribe(this._onTimerElapsed$1, this);
};

People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    this._publisher$1.dispose();
    this._publisher$1 = null;
    this._text$1.dispose();
    this._text$1 = null;
    this._time$1.dispose();
    this._time$1 = null;
    People.RecentActivity.UI.Core.TimestampUpdateTimer.unsubscribe(this._onTimerElapsed$1, this);
    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype._updateTime$1 = function() {
    // update the time with the new timestamp.
    this._time$1.text = People.RecentActivity.UI.Core.LocalizationHelper.getTimeString(this._comment$1.timestamp);
};

People.RecentActivity.UI.SelfPage.CommentListItemControl.prototype._onTimerElapsed$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');
    this._updateTime$1();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\BICI\BiciClickthroughAction.js" />
/// <reference path="..\..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\..\Core\BICI\BiciReactionTypes.js" />
/// <reference path="..\..\..\Core\BICI\BiciReactionUpdate.js" />
/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Core\Permissions.js" />
/// <reference path="..\..\..\Core\ResultCode.js" />
/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementTileOptions.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\..\Model\Events\Reaction.js" />
/// <reference path="..\..\..\Model\Events\ReactionActionCompletedEventArgs.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\..\Model\NetworkReactionType.js" />
/// <reference path="..\..\..\Model\ReactionCollection.js" />
/// <reference path="..\..\Core\Controls\ContactControl.js" />
/// <reference path="..\..\Core\Controls\ContactControlType.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\..\Core\Controls\NavigatableControl.js" />
/// <reference path="..\..\Core\Helpers\AriaHelper.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\UriHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.SelfPage.ReactionControl = function(obj, reactions) {
    /// <summary>
    ///     Provides a control for rendering reactions.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed entry.</param>
    /// <param name="reactions" type="People.RecentActivity.ReactionCollection">The reactions.</param>
    /// <field name="_tileSize$2" type="Number" integer="true" static="true">The size of the tile to use.</field>
    /// <field name="_tileCount$2" type="Number" integer="true" static="true">The number of tiles to render when not expanded.</field>
    /// <field name="_obj$2" type="People.RecentActivity.FeedObject">The feed entry.</field>
    /// <field name="_reactions$2" type="People.RecentActivity.ReactionCollection">The reaction collection.</field>
    /// <field name="_buttonReact$2" type="People.RecentActivity.UI.Core.Control">The button.</field>
    /// <field name="_buttonMore$2" type="People.RecentActivity.UI.Core.Control">The "x others" button.</field>
    /// <field name="_buttonMoreLabel$2" type="People.RecentActivity.UI.Core.Control">The "x others" button label.</field>
    /// <field name="_title$2" type="People.RecentActivity.UI.Core.Control">The title.</field>
    /// <field name="_content$2" type="People.RecentActivity.UI.Core.Control">The content.</field>
    /// <field name="_list$2" type="People.RecentActivity.UI.Core.Control">The list.</field>
    /// <field name="_tileContactControls" type="Object">The contact controls mapped by ID.</field>
    /// <field name="_tileControls" type="Object">The tile controls mapped by ID.</field>
    /// <field name="_expanded$2" type="Boolean">Whether the user has expanded the list of reactions.</field>
    /// <field name="_errors$2" type="People.RecentActivity.UI.Core.ErrorMessageControl">The errors.</field>
    /// <field name="_reacting$2" type="Boolean">Whether we have an outstanding request.</field>
    /// <field name="_userReaction$2" type="People.RecentActivity.Reaction">The cached reaction for the user.</field>
    /// <field name="_removedReactions$2" type="Array">The list of reactions that need to be disposed.</field>
    /// <field name="_moreButtonAnimating$2" type="Boolean">Whether the more button is currently animating.</field>
    People.RecentActivity.UI.Core.NavigatableControl.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPageReactions), WinJS.Utilities.Key.rightArrow, WinJS.Utilities.Key.leftArrow);

    Debug.assert(obj != null, 'obj != null');
    Debug.assert(reactions != null, 'reactions != null');

    this._tileContactControls = {};
    this._tileControls = {};

    this._obj$2 = obj;
    this._reactions$2 = reactions;

    this._reactions$2.addListener("collectionchanged", this._onCollectionChanged$2, this);
    this._reactions$2.addListener("propertychanged", this._onCollectionPropertyChanged$2, this);
    this._reactions$2.addListener("removereactioncompleted", this._onReactionOperationCompleted$2, this);
    this._reactions$2.addListener("addreactioncompleted", this._onReactionOperationCompleted$2, this);

    this._removedReactions$2 = [];
};

Jx.inherit(People.RecentActivity.UI.SelfPage.ReactionControl, People.RecentActivity.UI.Core.NavigatableControl);

People.RecentActivity.UI.SelfPage.ReactionControl._tileSize$2 = 60;
People.RecentActivity.UI.SelfPage.ReactionControl._tileCount$2 = 0;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._obj$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._reactions$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._buttonReact$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._buttonMore$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._buttonMoreLabel$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._title$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._content$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._list$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._tileContactControls = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._tileControls = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._expanded$2 = false;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._errors$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._reacting$2 = false;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._userReaction$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._removedReactions$2 = null;
People.RecentActivity.UI.SelfPage.ReactionControl.prototype._moreButtonAnimating$2 = false;

Object.defineProperty(People.RecentActivity.UI.SelfPage.ReactionControl.prototype, "isExpanded", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the list has been expanded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._expanded$2;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.ReactionControl.prototype, "reactions", {
    get: function() {
        /// <summary>
        ///     Gets the reaction collection for this control.
        /// </summary>
        /// <value type="People.RecentActivity.ReactionCollection"></value>
        return this._reactions$2;
    }
});

People.RecentActivity.UI.SelfPage.ReactionControl.prototype.expand = function(focus) {
    /// <summary>
    ///     Expands the reaction list of names.
    /// </summary>
    if (!this._expanded$2) {
        this._expanded$2 = true;

        this.addClass('expanded');
        this._updateList$2(true);
        this._updateMoreButton$2(false);

        if (focus) {
            var tileCount = People.RecentActivity.UI.SelfPage.ReactionControl._tileCount$2;

            if (this._canReact$2()) {
                tileCount--;
            }

            this._focusOnTile(tileCount - 1);
        }

        this.onPropertyChanged('IsExpanded');
    }
    else {
        People.RecentActivity.Core.BiciHelper.createClickThroughDatapoint(this._obj$2.sourceId, People.RecentActivity.Core.BiciClickthroughAction.selfPageReactionCount);

        // we're already expanded, so open up the item on the web.
        People.RecentActivity.UI.Core.UriHelper.launchUri(this._obj$2.url);
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._reactions$2.removeListenerSafe("collectionchanged", this._onCollectionChanged$2, this);
    this._reactions$2.removeListenerSafe("propertychanged", this._onCollectionPropertyChanged$2, this);
    this._reactions$2.removeListenerSafe("removereactioncompleted", this._onReactionOperationCompleted$2, this);
    this._reactions$2.removeListenerSafe("addreactioncompleted", this._onReactionOperationCompleted$2, this);

    Jx.root.getLayout().removeOrientationChangedEventListener(this._onOrientationChanged, this);
    
    if (this._removedReactions$2.length > 0) {
        // we need to dispose the controls for the old items.
        this._disposeControls$2(this._removedReactions$2);
        this._removedReactions$2.length = 0;
        this._removedReactions$2 = null;
    }

    this._disposeControls$2(this._reactions$2.toArray());
    
    if (this._buttonReact$2 != null) {
        this._buttonReact$2.dispose();
        this._buttonReact$2 = null;
    }

    if (this._buttonMoreLabel$2 != null) {
        this._buttonMoreLabel$2.dispose();
        this._buttonMoreLabel$2 = null;
    }

    if (this._buttonMore$2 != null) {
        this._buttonMore$2.dispose();
        this._buttonMore$2 = null;
    }

    if (this._list$2 != null) {
        this._list$2.dispose();
        this._list$2 = null;
    }

    if (this._content$2 != null) {
        this._content$2.dispose();
        this._content$2 = null;
    }

    if (this._title$2 != null) {
        this._title$2.dispose();
        this._title$2 = null;
    }

    if (this._errors$2 != null) {
        this._errors$2.dispose();
        this._errors$2 = null;
    }

    if (this._tileContactControls != null) {
        for (var k in this._tileContactControls) {
            var control = { key: k, value: this._tileContactControls[k] };
            control.value.dispose();
        }

        People.Social.clearKeys(this._tileContactControls);
        this._tileContactControls = null;
    }

    if (this._tileControls != null) {
        for (var k in this._tileControls) {
            var control = { key: k, value: this._tileControls[k] };
            control.value.dispose();
        }

        People.Social.clearKeys(this._tileControls);
        this._tileControls = null;
    }

    People.RecentActivity.UI.Core.NavigatableControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    // initialize the various controls.
    var children = this.element.children;

    this._title$2 = People.RecentActivity.UI.Core.Control.fromElement(children[0]);
    this._title$2.id = this._title$2.uniqueId;
    this._title$2.text = Jx.res.getString(this._reactions$2.type.stringId + 'title');

    this.labelledBy = this._title$2.id;

    // initialize error control.
    this._errors$2 = new People.RecentActivity.UI.Core.ErrorMessageControl(this._reactions$2.network.identity, People.RecentActivity.UI.Core.ErrorMessageContext.none, People.RecentActivity.UI.Core.ErrorMessageOperation.write, children[1]);
    this._errors$2.location = People.RecentActivity.UI.Core.ErrorMessageLocation.inline;
    this._errors$2.render();
    this._errors$2.isVisible = false;

    // fetch the content region and its children
    this._content$2 = People.RecentActivity.UI.Core.Control.fromElement(children[2]);

    var contentChildren = children[2].children;

    // fetch the react button
    this._buttonReact$2 = People.RecentActivity.UI.Core.Control.fromElement(contentChildren[0]);
    this._buttonReact$2.attach('click', this._onReactButtonClicked$2.bind(this));
    this._buttonReact$2.attach('keydown', this._onReactButtonKeyDown.bind(this));

    // fetch the list region
    this._list$2 = People.RecentActivity.UI.Core.Control.fromElement(contentChildren[1]);

    // fetch the "x more" button
    this._buttonMore$2 = People.RecentActivity.UI.Core.Control.fromElement(contentChildren[2]);
    this._buttonMore$2.attach('click', this._onMoreButtonClicked$2.bind(this));
    this._buttonMore$2.attach('keydown', this._onMoreButtonKeyDown.bind(this));
    this._buttonMore$2.isVisible = false;

    // fetch the "x more" label
    this._buttonMoreLabel$2 = People.RecentActivity.UI.Core.Control.fromElement(contentChildren[2].children[0]);
    this._buttonMoreLabel$2.isVisible = false;

    // add "tap" animations to the buttons.
    People.Animation.addTapAnimation(this._buttonMore$2.element);
    People.Animation.addTapAnimation(this._buttonReact$2.element);

    // update the controls
    this._updateTileCount$2();
    this._updateList$2(true);
    this._updateMoreButton$2(false);
    this._updateReactButton$2();
    this._updateTitle$2();

    if (this._canReact$2()) {
        // set the initial tabbable index thingy.
        this.activeItem = this._buttonReact$2;
    }

    Jx.root.getLayout().addOrientationChangedEventListener(this._onOrientationChanged, this);
    
    People.RecentActivity.UI.Core.NavigatableControl.prototype.onRendered.call(this);
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._canAddReaction$2 = function() {
    /// <returns type="Boolean"></returns>
    return (this._reactions$2.permissions & People.RecentActivity.Core.Permissions.add) === People.RecentActivity.Core.Permissions.add;
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._canRemoveReaction$2 = function() {
    /// <returns type="Boolean"></returns>
    return (this._reactions$2.permissions & People.RecentActivity.Core.Permissions.remove) === People.RecentActivity.Core.Permissions.remove;
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._canReact$2 = function() {
    /// <returns type="Boolean"></returns>
    if (this._reactions$2.containsUser()) {
        return this._canRemoveReaction$2();
    }

    return this._canAddReaction$2();
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._react = function () {
    if (!this._reacting$2) {
        // hide errors temporarily.
        this._errors$2.isVisible = false;

        // toggle the state of the reaction for the user.
        this._reacting$2 = true;

        if (this._reactions$2.containsUser()) {
            this._reactions$2.remove();
            People.RecentActivity.Core.BiciHelper.createReactionUpdateDatapoint(this._reactions$2.network.id, People.RecentActivity.Core.BiciReactionUpdate.remove, this._getBiciReactionType$2());
        }
        else {
            this._reactions$2.add();
            People.RecentActivity.Core.BiciHelper.createReactionUpdateDatapoint(this._reactions$2.network.id, People.RecentActivity.Core.BiciReactionUpdate.add, this._getBiciReactionType$2());
        }
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._disposeControls$2 = function(reactions) {
    /// <param name="reactions" type="Array" elementType="Reaction"></param>
    Debug.assert(reactions != null, 'reactions != null');

    for (var n = 0; n < reactions.length; n++) {
        var reaction = reactions[n];

        // check to see if the control exists, and if so destroy it.
        var id = this._getKey$2(reaction);
        var contactControl = this._tileContactControls[id];
        var control = this._tileControls[id];

        // Dispose the contact control.
        if (!Jx.isUndefined(contactControl)) {
            contactControl.dispose();
            delete this._tileContactControls[id];
        }

        // Dispose the control.
        if (!Jx.isUndefined(control)) {
            this.removeTabControl(control);
            control.dispose();
            delete this._tileControls[id];
        }
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._getCapacity$2 = function() {
    /// <returns type="Number" integer="true"></returns>
    // gets the current capacity.
    if (this._expanded$2) {
        return this._reactions$2.count;
    }
    else {
        var capacity = People.RecentActivity.UI.SelfPage.ReactionControl._tileCount$2;
        if (this._canReact$2()) {
            // the user can react, so subtract 1 for the like/retweet/... button.
            capacity--;
        }

        return capacity;
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._getKey$2 = function(reaction) {
    /// <param name="reaction" type="People.RecentActivity.Reaction"></param>
    /// <returns type="String"></returns>
    Debug.assert(reaction != null, 'reaction != null');

    var publisher = reaction.publisher;
    return publisher.sourceId + ';' + publisher.id;
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._renderTile$2 = function(reaction, index) {
    /// <param name="reaction" type="People.RecentActivity.Reaction"></param>
    /// <param name="index" type="Number" integer="true"></param>
    Debug.assert(reaction != null, 'reaction != null');
    Debug.assert(index > 0, 'index > 0');

    var control = null;

    // figure out if we've already rendered a control for this contact. if so, use that cached control.
    var id = this._getKey$2(reaction);
    if (!Jx.isUndefined(this._tileControls[id])) {
        // yup, re-use the existing control.
        control = this._tileControls[id];
    }
    else {
        // create a new control for this reaction.
        var contactControl = new People.RecentActivity.UI.Core.ContactControl(
            reaction.publisher.getDataContext(),
            true,
            this._reactions$2.type.stringId + 'contact-reacted');

        var element = contactControl.getElement(
            People.RecentActivity.UI.Core.ContactControlType.tile,
            People.RecentActivity.Imports.create_identityElementTileOptions(60, null),
            -1);

        contactControl.activate(element, false);

        // Wrap in a control.
        control = People.RecentActivity.UI.Core.Control.fromElement(element);

        // update the role of the control in the list.
        control.role = 'option';
        control.addClass('ra-fauxButton');

        this._tileContactControls[id] = contactControl;
        this._tileControls[id] = control;
    }

    // insert the control at the correct position.
    this._list$2.insertControl(control, index - 1);

    // insert it into the tabbable index.
    this.insertTabControl(control, index);
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._updateList$2 = function(disposeRemoved) {
    /// <param name="disposeRemoved" type="Boolean"></param>
    if (this._reactions$2.type.isToggle) {
        // if this is a toggle (i.e. only the user can react to this), then we don't need to update the list.
        return;
    }

    if (disposeRemoved && this._removedReactions$2.length > 0) {
        // we need to dispose the controls for the removed reactions.
        this._disposeControls$2(this._removedReactions$2);
        this._removedReactions$2.length = 0;
    }

    // get the capacity of the current list (i.e. everything, or only a few, etc.)
    var capacity = this._getCapacity$2();
    if (capacity > 0) {
        // clear out the current list of elements.
        var element = this._list$2.element;
        element.innerHTML = '';

        var index = 1;
        var count = this._reactions$2.count;

        if (!this._expanded$2 && Math.max(count, this._reactions$2.totalCount) > capacity) {
            // if there are more reactions than we have space for, we need to show the "more" button,
            // hence we need to actually make space for it.
            capacity--;
        }

        // figure out if we need to fit the user's tile first.
        var reactionUser = this._reactions$2.findUser();
        this._userReaction$2 = reactionUser;
        if (reactionUser != null) {
            // yup, render the user's reaction first, of course.
            this._renderTile$2(reactionUser, index);
            index++;
            capacity--;
        }

        for (var i = 0; (i < count) && (capacity > 0); i++) {
            var reaction = this._reactions$2.item(i);
            if (reaction !== reactionUser) {
                // render the tile at the appropriate place.
                this._renderTile$2(reaction, index);
                index++;
                capacity--;
            }        
        }    
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._updateMoreButton$2 = function(animate) {
    /// <param name="animate" type="Boolean"></param>    
    if (this._moreButtonAnimating$2) {
        // In the event that the more button is currently animating, we'll just return immediately.
        // The animations all call recursively call this method to ensure that the more button is updated
        // in the event that anything changed while the animation was running.
        return;
    }

    var currentLabel = this._buttonMoreLabel$2.text;
    var buttonVisible = false;

    var countTotal = Math.max(this._reactions$2.count, this._reactions$2.totalCount);
    var countRendered = this._getCapacity$2();

    if (!this._expanded$2 && countTotal > countRendered) {
        // if the total number of reactions exceeds the number of items we can render, we need to show the
        // "more" button, but we take into account that we can now show one less item.
        countRendered--;
    }

    var remaining = countTotal - countRendered;
    if (remaining > 99) {
        // there are more than 99+ reactions, so show a little down arrow instead.
        buttonVisible = true;

        this._buttonMore$2.label = Jx.res.loadCompoundString('/strings/raItemReaction-othersMany', Jx.res.getString('/strings/raItemReaction-99plus'));
        this._buttonMoreLabel$2.addClass('ra-reactionOthersButtonArrow');
        this._buttonMoreLabel$2.text = '\ue09d';

        this.addTabControl(this._buttonMore$2);
    }
    else if (remaining > 0) {
        // there is at least one hidden control, so update and show the "x more" button.
        buttonVisible = true;

        var labelId = (remaining === 1) ? '/strings/raItemReaction-othersOne' : '/strings/raItemReaction-othersMany';

        this._buttonMore$2.label = Jx.res.loadCompoundString(labelId, remaining);
        this._buttonMoreLabel$2.removeClass('ra-reactionOthersButtonArrow');
        this._buttonMoreLabel$2.text = Jx.res.loadCompoundString('/strings/raItemReaction-others', remaining);

        this.addTabControl(this._buttonMore$2);
    }
    else {
        this.removeTabControl(this._buttonMore$2);

        // no more remaining, hide the button.
        buttonVisible = false;
    }

    var that = this;

    if (!animate) {
        this._buttonMore$2.isVisible = buttonVisible;
        this._buttonMoreLabel$2.isVisible = buttonVisible;
        this._buttonMoreLabel$2.isHiddenFromScreenReader = true;
    }
    else if (!buttonVisible && this._buttonMore$2.isVisible) {
        this._moreButtonAnimating$2 = true;

        People.Animation.fadeOut(this._buttonMore$2.element).done(
            function () {
                if (!that.isDisposed) {
                    that._buttonMoreLabel$2.isVisible = false;
                    that._buttonMore$2.isVisible = false;
                    that._moreButtonAnimating$2 = false;

                    // In the unlikely case that something changed while animating, just force an update.
                    that._updateMoreButton$2(false);
                }

                return null;
            });
    }
    else if (buttonVisible && !this._buttonMore$2.isVisible) {
        this._buttonMore$2.isVisible = true;
        this._buttonMoreLabel$2.isVisible = true;
        this._buttonMoreLabel$2.isHiddenFromScreenReader = true;
        this._moreButtonAnimating$2 = true;

        People.Animation.fadeIn(this._buttonMore$2.element).done(
            function () {
                if (!that.isDisposed) {
                    that._moreButtonAnimating$2 = false;

                    // In the unlikely case that something changed while animating, just force an update.
                    that._updateMoreButton$2(false);
                }

                return null;
            });
    }
    else if (buttonVisible && this._buttonMore$2.isVisible && this._buttonMoreLabel$2.text !== currentLabel) {
        this._moreButtonAnimating$2 = true;
        People.Animation.updateBadge(this._buttonMoreLabel$2.element).done(
            function () {
                if (!that.isDisposed) {
                    that._moreButtonAnimating$2 = false;

                    // In the unlikely case that something changed while animating, just force an update.
                    that._updateMoreButton$2(false);
                }

                return null;
            });
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._updateReactButton$2 = function() {
    var type = this._reactions$2.type;

    // show or hide the "{react} this" text.;
    this._buttonReact$2.addClass(type.iconClass);
    this._buttonReact$2.text = type.iconSelfPage;

    // figure out whether the user can add/remove reactions, etc.
    if (this._reactions$2.containsUser()) {
        this._buttonReact$2.addClass('ra-reactionButtonActive');
        this._buttonReact$2.isVisible = this._canRemoveReaction$2();
        this._buttonReact$2.label = Jx.res.getString(type.stringId + 'unreact');
    }
    else {
        this._buttonReact$2.removeClass('ra-reactionButtonActive');
        this._buttonReact$2.isVisible = this._canAddReaction$2();
        this._buttonReact$2.label = Jx.res.getString(type.stringId + 'react');
    }

    if (this._canReact$2()) {
        this.insertTabControl(this._buttonReact$2, 0);
    }
    else {
        this.removeTabControl(this._buttonReact$2);
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._updateTitle$2 = function() {
    this._title$2.isVisible = (this._reactions$2.totalCount > 0) || this._canAddReaction$2();
    this._title$2.isHiddenFromScreenReader = true;
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._focusOnTile = function (index) {
    /// <param name="index" type="Number" integer="true"></param>
    var tiles = this._list$2.element.children;
    if (tiles.length > index) {
        tiles[index].focus();
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._getBiciReactionType$2 = function() {
    /// <returns type="People.RecentActivity.Core.BiciReactionTypes"></returns>
    switch (this._reactions$2.type.type) {
        case People.RecentActivity.NetworkReactionType.like:
            return People.RecentActivity.Core.BiciReactionTypes.like;

        case People.RecentActivity.NetworkReactionType.favorite:
            return People.RecentActivity.Core.BiciReactionTypes.favorite;

        case People.RecentActivity.NetworkReactionType.retweet:
            return People.RecentActivity.Core.BiciReactionTypes.retweet;
    }

    Debug.assert(false, 'Invalid reaction type.');

    return People.RecentActivity.Core.BiciReactionTypes.like;
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._updateUserReaction$2 = function() {
    /// <returns type="WinJS.Promise"></returns>
    var that = this;
    
    if (this._expanded$2 || this._reactions$2.type.isToggle) {
        // If the list is expanded or the reaction is a toggle, don't do anything special.
        this._updateList$2(true);

        if (this._userReaction$2 != null) {
            // The user's tile is in the list, focus on it.
            this._focusOnTile(0);
        }

        return WinJS.Promise.wrap(null);
    }

    var reactionUser = this._reactions$2.findUser();
    if (reactionUser != null && this._userReaction$2 == null) {
        // Render the user's tile to be animated in.
        this._renderTile$2(reactionUser, 1);

        // Position the list under the like button, hiding the user's tile.
        var listElement = this._list$2.element;

        var listStyle = listElement.style;
        listStyle.position = 'absolute';
        listStyle.top = '0px';
        listStyle.left = '0px';

        if (this._canRemoveReaction$2()) {
            // If the user can remove the reaction, we will slide the list out from under the reaction button.
            var reposition = People.Animation.createRepositionAnimation(listElement);

            // Don't allow wrapping so that the tiles will slide under the hidden region.
            var contentStyle = this._content$2.element.style;
            contentStyle.whiteSpace = 'nowrap';

            // Position the list back in the default location, showing the user's tile.
            listStyle.position = '';
            listStyle.top = '';
            listStyle.left = '';

            // Execute the reposition animation.
            return reposition.execute().then(function() {
                if (!that.isDisposed) {
                    // Reset the remaining CSS properties.
                    contentStyle.whiteSpace = '';

                    // Update the list to clean up any extra tiles.
                    that._updateList$2(true);

                    if (that._userReaction$2 != null) {
                        // The user's tile is in the list, focus on it.
                        that._focusOnTile(0);
                    }
                }

                return null;
            });
        }
        else {
            // If the user can't remove the reaction, we'll crossfade between the first element and the reaction button.
            this._buttonReact$2.isVisible = true;
            this._buttonReact$2.isHiddenFromScreenReader = true;

            // Capture the elements and apply starting opacity.
            var incoming = this._list$2.element.children[0];
            incoming.style.opacity = '0';

            var outgoing = this._buttonReact$2.element;
            outgoing.style.opacity = '1';

            // Execute the crossfade.
            People.Animation.crossFade(incoming, outgoing).done(function() {
                if (!that.isDisposed) {
                    // Reset the state of the CSS.
                    that._buttonReact$2.isVisible = false;
                    incoming.style.opacity = '';
                    outgoing.style.opacity = '';

                    // Position the list back in the default location.
                    listStyle.position = '';
                    listStyle.top = '';
                    listStyle.left = '';

                    // Update the list to ensure the correct view.
                    that._updateList$2(true);

                    if (that._userReaction$2 != null) {
                        // The user's tile is in the list, focus on it.
                        that._focusOnTile(0);
                    }
                }

                return null;
            });
        }

    }
    else if (reactionUser == null && this._userReaction$2 != null) {
        // Capture the current user reaction and update the list with the final set of tiles.
        var userReaction = this._userReaction$2;

        this._updateList$2(false);

        // Don't allow wrapping so the extra tiles will be hidden outside of the area.
        var contentStyle = this._content$2.element.style;
        contentStyle.whiteSpace = 'nowrap';

        // Render the user's tile to be animated out.
        this._renderTile$2(userReaction, 1);

        // Initialize the animation and capture the starting position of the list.
        var listElement = this._list$2.element;
        var reposition = People.Animation.createRepositionAnimation(listElement);

        // Position the list under the like button, hiding the user's tile.
        var listStyle = listElement.style;
        listStyle.position = 'absolute';
        listStyle.top = '0px';
        listStyle.left = '0px';

        return reposition.execute().then(function () {
            if (!that.isDisposed) {
                // Position the list back in the default location.
                listStyle.position = '';
                listStyle.top = '';
                listStyle.left = '';

                // Reset the remaining CSS properties.
                contentStyle.whiteSpace = '';

                // Update the list to render only the final set of tiles.
                that._updateList$2(true);

                if (that._userReaction$2 != null) {
                    // The user's tile is in the list, focus on it.
                    that._focusOnTile(0);
                }
            }

            return null;
        });
    }

    return WinJS.Promise.wrap(null);
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._updateTileCount$2 = function() {
    /// <returns type="Boolean"></returns>
    var state = Jx.root.getLayoutState();
    var count = ((state === 'portrait') || (state === 'snapped')) ? 4 : 5;

    if (People.RecentActivity.UI.SelfPage.ReactionControl._tileCount$2 !== count) {
        People.RecentActivity.UI.SelfPage.ReactionControl._tileCount$2 = count;
        return true;
    }

    return false;
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._onReactionOperationCompleted$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.ReactionActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e');

    var result = e.result;
    if (result.code !== People.RecentActivity.Core.ResultCode.success) {
        // whoops, there was an error, show the error control.
        this._errors$2.isVisible = true;
        this._errors$2.show(result);
        this._reacting$2 = false;
    }
    else {
        var that = this;
        this._updateUserReaction$2().done(
            function () {
                that._reacting$2 = false;
                return false;
            });
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._onReactButtonClicked$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');

    this._react();
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._onReactButtonKeyDown = function (e) {
    /// <param name="e" type="KeyboardEvent"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this._react();
            break;
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._onMoreButtonClicked$2 = function(e) {
    /// <param name="e" type="Event"></param>
    Debug.assert(e != null, 'e != null');

    this.expand(true);
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._onMoreButtonKeyDown = function (e) {
    /// <param name="e" type="KeyboardEvent"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this.expand(true);
            break;
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._onCollectionChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.action) {
        case People.RecentActivity.NotifyCollectionChangedAction.remove:
            this._removedReactions$2.push.apply(this._removedReactions$2, e.oldItems);
            break;
    }

    if (!this._reacting$2) {
        this._updateList$2(true);
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._onCollectionPropertyChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.propertyName) {
        case 'Count':
        case 'TotalCount':
            this._updateTitle$2();
            this._updateReactButton$2();
            this._updateMoreButton$2(true);

            if (!this._reacting$2) {
                // we also need to update the list because when the total count changes, we may have to 
                // change how many pictures we initially display (3 + button vs. 4 without button, etc.)
                this._updateList$2(true);
            }

            break;
    }
};

People.RecentActivity.UI.SelfPage.ReactionControl.prototype._onOrientationChanged = function() {
    if (this._updateTileCount$2()) {
        this._updateList$2(true);
        this._updateMoreButton$2(false);
    }
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Permissions.js" />
/// <reference path="..\..\..\Core\ResultCode.js" />
/// <reference path="..\..\..\Model\Events\ActionCompletedEventArgs.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\..\Model\Network.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\SelfPageSidebarHydrationData.js" />
/// <reference path="CommentControl.js" />
/// <reference path="CommentInputControl.js" />
/// <reference path="ReactionControl.js" />

(function () {
    var hydrationVersion = 1;

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl = function(obj) {
        /// <summary>
        ///     Provides a simple wrapper for the sidebar.
        /// </summary>
        /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
        /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The feed object.</field>
        /// <field name="_reactions$1" type="Array" elementType="ReactionControl">The various reactions.</field>
        /// <field name="_comments$1" type="People.RecentActivity.UI.SelfPage.CommentControl">The comments.</field>
        /// <field name="_commentInput$1" type="People.RecentActivity.UI.SelfPage.CommentInputControl">The input control.</field>
        /// <field name="_extra$1" type="People.RecentActivity.UI.Core.Control">The extra content, if any.</field>
        /// <field name="_scroll$1" type="People.RecentActivity.UI.Core.Control">The scrolling part.</field>
        /// <field name="_summaryContainer$1" type="HTMLElement">The summary container.</field>
        /// <field name="_reactionsContainer$1" type="HTMLElement">The reactions container.</field>
        /// <field name="_state$1" type="People.RecentActivity.UI.SelfPage.selfPageSidebarHydrationData">The state.</field>
        /// <field name="_isCommentInputFocusRequested$1" type="Boolean">Whether we need to set focus on comment input.</field>
        People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPageSidebar));
        Debug.assert(obj != null, 'obj != null');
        this._obj$1 = obj;
    };

    Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPageSidebarControl, People.RecentActivity.UI.Core.Control);


    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._obj$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._reactions$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._comments$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._commentInput$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._extra$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._scroll$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._summaryContainer$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._reactionsContainer$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._state$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._isCommentInputFocusRequested$1 = false;

    Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype, "extra", {
        get: function() {
            /// <summary>
            ///     Gets any extra content that should appear below the summary.
            /// </summary>
            /// <value type="People.RecentActivity.UI.Core.Control"></value>
            return null;
        },
        configurable: true
    });

    Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype, "object", {
        get: function() {
            /// <summary>
            ///     Gets the object the sidebar is displaying.
            /// </summary>
            /// <value type="People.RecentActivity.FeedObject"></value>
            return this._obj$1;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype, "network", {
        get: function() {
            /// <summary>
            ///     Gets the network.
            /// </summary>
            /// <value type="People.RecentActivity.Network"></value>
            return this._obj$1.network;
        }
    });

    Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype, "commentInputHeight", {
        get: function () {
            /// <summary>
            ///     Gets the height of the sidebar's commentInput control.
            /// </summary>
            /// <value type="Number"></value>
            var height = 0;
            if (this._commentInput$1 != null) {
                height = this._commentInput$1.element.clientHeight;
            }
            return height;
        }
    });

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.applyState = function(data) {
        /// <summary>
        ///     Applies hydration data.
        /// </summary>
        /// <param name="data" type="People.RecentActivity.UI.SelfPage.selfPageSidebarHydrationData">The data.</param>
        if (data.v !== hydrationVersion) {
            // this data does not match, so ignore it.
            return;
        }

        this._state$1 = data;
        this._applyReactionState$1();
        this._applyCommentState$1();
        this._applyExtraState$1();
        if (data.ise) {
            // apply the summary state.
            (this.summary).expand();
        }

        this._applyScrollState$1();
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.getState = function() {
        /// <summary>
        ///     Gets the hydration data.
        /// </summary>
        /// <returns type="People.RecentActivity.UI.SelfPage.selfPageSidebarHydrationData"></returns>
        // build a map of which reactions are expanded.
        var expandedReactions = {};
        
        var reactions = this._reactions$1;
        if (reactions != null) {
            for (var i = 0, len = reactions.length; i < len; i++) {
                var id = reactions[i].reactions.type.id;
                expandedReactions[id] = reactions[i].isExpanded;
            }
        }

        var expandedSummmy = false;
        
        // figure out if the summary has been expanded.
        var summary = this.summary;
        if (summary != null) {
            expandedSummmy = summary.isExpanded;
        }

        return People.RecentActivity.UI.SelfPage.create_selfPageSidebarHydrationData(
            hydrationVersion, 
            expandedReactions, 
            expandedSummmy, 
            this._scroll$1.element.scrollTop, 
            (this._commentInput$1 != null) ? this._commentInput$1.input : null, 
            this.getExtraHydrationState());
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.setFocusOnCommentInput = function() {
        /// <summary>
        ///     Sets focus on the comment input box, if possible.
        /// </summary>
        if (this._commentInput$1 != null) {
            this._commentInput$1.focus();
        }
        else {
            this._isCommentInputFocusRequested$1 = true;
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.onRenderedInDom = function() {
        /// <summary>
        ///     Occurs when the sidebar has been rendered in the DOM.
        /// </summary>
        // figure out if we need to pass along the message.
        var summary = this.summary;
        if (summary != null) {
            summary.onRenderedInDom();
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.onDisposed = function() {
        /// <summary>
        ///     Occurs when the sidebar is being disposed.
        /// </summary>
        this._summaryContainer$1 = null;
        this._reactionsContainer$1 = null;
        if (this._reactions$1 != null) {
            for (var i = 0, len = this._reactions$1.length; i < len; i++) {
                this._reactions$1[i].dispose();
                this._reactions$1[i] = null;
            }

            this._reactions$1 = null;
        }

        if (this._comments$1 != null) {
            this._comments$1.dispose();
            this._comments$1 = null;
        }

        if (this._commentInput$1 != null) {
            this._commentInput$1.dispose();
            this._commentInput$1 = null;
        }

        if (this._extra$1 != null) {
            this._extra$1.dispose();
            this._extra$1 = null;
        }

        if (this._scroll$1 != null) {
            this._scroll$1.dispose();
            this._scroll$1 = null;
        }

        this._obj$1.comments.removeListenerSafe("addcommentcompleted", this._onAddCommentCompleted$1, this);
        People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.onRendered = function() {
        /// <summary>
        ///     Occurs when the sidebar is being rendered.
        /// </summary>
        var that = this;
        
        this._scroll$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'selfpage-sidebar-scroll');
        this._summaryContainer$1 = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._scroll$1.element, 'selfpage-summary-container');
        this._reactionsContainer$1 = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._scroll$1.element, 'selfpage-reactions-container');
        // fetch the summary (if any), and render it.
        this._renderSummary$1();
        // render the reactions and comments.
        window.msSetImmediate(function() {
            if (!that.isDisposed) {
                // we're still alive, so render additional information in the sidebar.
                that._renderExtra$1();
                that._renderReactions$1();
                that._renderComments$1();
            }

        });
        People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this);
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.getExtraHydrationState = function() {
        /// <summary>
        ///     Gets any additional hydration state.
        /// </summary>
        /// <returns type="Object"></returns>
        return null;
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.applyExtraHydrationState = function(data) {
        /// <summary>
        ///     Applies any additional hydration state.
        /// </summary>
        /// <param name="data" type="Object">The data.</param>
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._applyReactionState$1 = function() {
        if ((this._state$1 != null) && (this._reactions$1 != null)) {
            for (var i = 0, len = this._reactions$1.length; i < len; i++) {
                // apply the reaction state(s).
                var id = this._reactions$1[i].reactions.type.id;
                if (this._state$1.ire[id]) {
                    this._reactions$1[i].expand(false);
                }        
            }    
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._applyCommentState$1 = function() {
        if ((this._state$1 != null) && (this._commentInput$1 != null)) {
            // apply the comment input state (if we have one, of course)
            if (Jx.isNonEmptyString(this._state$1.ci)) {
                this._commentInput$1.input = this._state$1.ci;
            }    
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._applyExtraState$1 = function() {
        if ((this._state$1 != null) && (this._extra$1 != null)) {
            if (this._state$1.id != null) {
                this.applyExtraHydrationState(this._state$1.id);
            }    
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._applyScrollState$1 = function() {
        if ((this._state$1 != null) && (this._reactions$1 != null) && (!this._obj$1.network.capabilities.commentsEnabled || (this._comments$1 != null))) {
            // apply the scroll state.
            this._scroll$1.element.scrollTop = this._state$1.ssp;
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._renderSummary$1 = function() {
        var summary = this.summary;
        if (summary != null) {
            // render the summary in the sidebar.
            this._summaryContainer$1.appendChild(summary.element);
            summary.render();
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._renderExtra$1 = function() {
        this._extra$1 = this.extra;
        if (this._extra$1 != null) {
            // append the control and render it
            this._reactionsContainer$1.appendChild(this._extra$1.element);
            this._extra$1.render();
            this._applyExtraState$1();
            this._applyScrollState$1();
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._renderReactions$1 = function() {
        var reactionTypes = this._obj$1.reactions;
        // initialize a new list of reaction controls.
        var controls = [];
        for (var i = 0, len = reactionTypes.count; i < len; i++) {
            var collection = reactionTypes.item(i);
            var control = new People.RecentActivity.UI.SelfPage.ReactionControl(this._obj$1, collection);
            this._reactionsContainer$1.appendChild(control.element);
            controls.push(control);
            control.render();
            People.Animation.fadeIn(control.element);
        }

        this._reactions$1 = controls;
        this._applyReactionState$1();
        this._applyScrollState$1();
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._renderComments$1 = function() {
        if (this._obj$1.network.capabilities.commentsEnabled) {
            // off-load to a new time-slice so we don't block the main UX thread for 
            // too long by rendering a bunch of comments here.
            this._comments$1 = new People.RecentActivity.UI.SelfPage.CommentControl(this._obj$1);
            this._scroll$1.appendControl(this._comments$1);
            this._comments$1.render();
            var comments = this._obj$1.comments;
            if ((comments.permissions & People.RecentActivity.Core.Permissions.add) === People.RecentActivity.Core.Permissions.add) {
                // when the user adds a comment we need to scroll down.
                comments.addListener("addcommentcompleted", this._onAddCommentCompleted$1, this);
                // render the comment input control as well. don't stick it in the part that scrolls, of course.
                this._commentInput$1 = new People.RecentActivity.UI.SelfPage.CommentInputControl(this._obj$1);
                this.appendControl(this._commentInput$1);
                People.Animation.fadeIn(this._commentInput$1.element);
            }

            this._applyCommentState$1();
            this._applyScrollState$1();
            People.Animation.fadeIn(this._comments$1.element);
            if (this._isCommentInputFocusRequested$1 && (this._commentInput$1 != null)) {
                // once everything has been rendered, and state has been applied, focus on the comment input (if we can.)
                this._commentInput$1.focus();
            }    
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype._onAddCommentCompleted$1 = function(e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e');
        if (e.result.code === People.RecentActivity.Core.ResultCode.success) {
            // we succesfully added a comment, scroll down.
            var element = this._scroll$1.element;
            element.scrollTop = element.scrollHeight;
        }
    };
})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="SelfPageEntrySummaryControl.js" />
/// <reference path="SelfPageSidebarControl.js" />
/// <reference path="SelfPageSummaryControl.js" />

People.RecentActivity.UI.SelfPage.SelfPageEntrySidebarControl = function(entry) {
    /// <summary>
    ///     Provides a sidebar control for entries.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_summary$2" type="People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl">The summary.</field>
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.call(this, entry);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPageEntrySidebarControl, People.RecentActivity.UI.SelfPage.SelfPageSidebarControl);


People.RecentActivity.UI.SelfPage.SelfPageEntrySidebarControl.prototype._summary$2 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageEntrySidebarControl.prototype, "summary", {
    get: function() {
        /// <summary>
        ///     Gets the summary.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPageSummaryControl"></value>
        this._renderSummary$2();
        return this._summary$2;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPageEntrySidebarControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the sidebar is being disposed.
    /// </summary>
    if (this._summary$2 != null) {
        this._summary$2.dispose();
        this._summary$2 = null;
    }

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPageEntrySidebarControl.prototype._renderSummary$2 = function() {
    if (this._summary$2 != null) {
        // we've already rendered the summary.
        return;
    }

    var entry = this.object;
    this._summary$2 = new People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl(entry);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementContextOptions.js" />
/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementTileOptions.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\..\Model\Network.js" />
/// <reference path="..\..\Core\Controls\ContactControl.js" />
/// <reference path="..\..\Core\Controls\ContactControlType.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\FormattedTextControl.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\TimestampUpdateTimer.js" />

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl = function(obj) {
    /// <summary>
    ///     Provides a default summary control.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_identity$1" type="People.RecentActivity.UI.Core.ContactControl">The identity control.</field>
    /// <field name="_text$1" type="People.RecentActivity.UI.Core.FormattedTextControl">The text control.</field>
    /// <field name="_timeVia$1" type="People.RecentActivity.UI.Core.Control">The time/via control.</field>
    /// <field name="_extra$1" type="People.RecentActivity.UI.Core.Control">The extra control.</field>
    /// <field name="_annotations$1" type="People.RecentActivity.UI.Core.Control">The annotations, if any.</field>
    /// <field name="_seeMore$1" type="People.RecentActivity.UI.Core.Control">The see more button.</field>
    /// <field name="_expanded$1" type="Boolean">Whether the summary has been expanded.</field>
    People.RecentActivity.UI.Core.Control.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPageSummary));

    Debug.assert(obj != null, 'obj != null');

    this._obj$1 = obj;
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPageSummaryControl, People.RecentActivity.UI.Core.Control);

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._obj$1 = null;
People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._identity$1 = null;
People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._text$1 = null;
People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._timeVia$1 = null;
People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._extra$1 = null;
People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._annotations$1 = null;
People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._seeMore$1 = null;
People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._expanded$1 = false;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype, "isExpanded", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the summary has been expanded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._expanded$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._obj$1.network;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype, "object", {
    get: function() {
        /// <summary>
        ///     Gets the feed object.
        /// </summary>
        /// <value type="People.RecentActivity.FeedObject"></value>
        return this._obj$1;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype, "extra", {
    get: function() {
        /// <summary>
        ///     Gets the extra content to display below the timestamp.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        return null;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype, "annotations", {
    get: function() {
        /// <summary>
        ///     Gets any additional annotations that should appear below the summary.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        return null;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype.expand = function() {
    /// <summary>
    ///     Expands the summary.
    /// </summary>
    if (!this._expanded$1) {
        // update the overflow style
        this._expanded$1 = true;
        this.addClass('expanded');
        this.removeClass('collapsed');

        if (this._seeMore$1 != null) {
            // remove the "see more" control.
            this._seeMore$1.removeFromParent();
            this._seeMore$1.dispose();
            this._seeMore$1 = null;
        }

        this.onPropertyChanged('IsExpanded');
    }
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype.onRenderedInDom = function() {
    /// <summary>
    ///     Occurs when the summary has been rendered in the DOM.
    /// </summary>
    if (!this._expanded$1) {
        var element = this._text$1.element;

        // due to the imprecise nature of our styles (lots of 16.12345 values) there is a little wiggle room here.
        if (element.scrollHeight - 5 > element.clientHeight) {
            this.addClass('collapsed');

            if (this._seeMore$1 == null) {
                var container = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPageSummarySeeMore);
                this._seeMore$1 = People.RecentActivity.UI.Core.Control.fromElement(container.children[0]);
                this._seeMore$1.text = Jx.res.getString('/strings/raSeeMore');

                this._seeMore$1.attach('click', this._onSeeMoreClicked$1.bind(this));
                this._seeMore$1.attach('keydown', this._onSeeMoreKeyDown.bind(this));

                this.insertControlAfter(People.RecentActivity.UI.Core.Control.fromElement(container), this._text$1);
            }

            return;
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (this._identity$1 != null) {
        this._identity$1.dispose();
        this._identity$1 = null;
    }

    if (this._text$1 != null) {
        this._text$1.dispose();
        this._text$1 = null;
    }

    if (this._timeVia$1 != null) {
        this._timeVia$1.dispose();
        this._timeVia$1 = null;
    }

    if (this._extra$1 != null) {
        this._extra$1.dispose();
        this._extra$1 = null;
    }

    if (this._annotations$1 != null) {
        this._annotations$1.dispose();
        this._annotations$1 = null;
    }

    if (this._seeMore$1 != null) {
        this._seeMore$1.dispose();
        this._seeMore$1 = null;
    }

    People.RecentActivity.UI.Core.TimestampUpdateTimer.unsubscribe(this._onTimerElapsed$1, this);

    this.network.removeListenerSafe("propertychanged", this._onNetworkPropertyChanged$1, this);
    this.removeListenerSafe("propertychanged", this._onSelfPropertyChanged$1, this);

    People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    var element = this.element;

    // initialize the name and rest of UI.
    this._identity$1 = new People.RecentActivity.UI.Core.ContactControl(this.publisher.getDataContext());

    var elementPicture = People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'summary-picture');
    elementPicture.appendChild(this._identity$1.getElement(People.RecentActivity.UI.Core.ContactControlType.tile, People.RecentActivity.Imports.create_identityElementTileOptions(80, null), 0));

    var elementName = People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'summary-name');
    elementName.appendChild(this._identity$1.getElement(People.RecentActivity.UI.Core.ContactControlType.name, People.RecentActivity.Imports.create_identityElementContextOptions(this._obj$1.sourceId), -1));

    this._identity$1.activate(element);

    // initialize the text + overflow
    this._text$1 = new People.RecentActivity.UI.Core.FormattedTextControl(People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'summary-text'), this._obj$1.sourceId, false);
    this._text$1.isVisible = Jx.isNonEmptyString(this.summaryText);
    this._text$1.update(this.summaryText, this.summaryEntities);

    // initialize the time.
    this._timeVia$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'summary-time-via');

    // render the extra content and annotations.
    var annotations = this.annotations;
    var extra = this.extra;

    if (extra != null) {
        this._extra$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'summary-extra');
        this._extra$1.appendControl(extra);
    }

    if (annotations != null) {
        this._annotations$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'summary-annotations');
        this._annotations$1.appendControl(annotations);
    }

    // initialize the timestamp.
    People.RecentActivity.UI.Core.TimestampUpdateTimer.subscribe(this._onTimerElapsed$1, this);
    this.network.addListener("propertychanged", this._onNetworkPropertyChanged$1, this);
    this._updateTimeVia$1();

    // attach to the property changed event so we know when to update the summary, etc.
    this.addListener("propertychanged", this._onSelfPropertyChanged$1, this);
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._updateTimeVia$1 = function() {
    var timestamp = '';

    var time = this.timestamp;
    if ((time != null) && (!!time.getTime())) {
        timestamp = People.RecentActivity.UI.Core.LocalizationHelper.getTimeString(time);
    }

    var text = timestamp;
    var name = this.network.name;

    if (Jx.isNonEmptyString(name)) {
        text = Jx.res.loadCompoundString('/strings/raItemVia', timestamp, name);
    }

    this._timeVia$1.text = text;
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._onNetworkPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    if (e.propertyName === 'Name') {
        this._updateTimeVia$1();
    }
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._onTimerElapsed$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');

    this._updateTimeVia$1();
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._onSeeMoreClicked$1 = function(e) {
    /// <param name="e" type="Event"></param>
    Debug.assert(e != null, 'e != null');

    this.expand();
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._onSeeMoreKeyDown = function (e) {
    /// <param name="e" type="KeyboardEvent"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this.expand();
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype._onSelfPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    if (e.propertyName === 'SummaryText') {
        this._text$1.update(this.summaryText, this.summaryEntities);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\Contact.js" />
/// <reference path="..\..\..\Model\FeedEntry.js" />
/// <reference path="..\..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Core\Controls\AnnotationsControl.js" />
/// <reference path="..\..\Core\Controls\AnnotationsControlPlacement.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="SelfPageSummaryControl.js" />

People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl = function(entry) {
    /// <summary>
    ///     Provides a default summary control.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.FeedEntry">The feed entry.</param>
    /// <field name="_annotations$2" type="People.RecentActivity.UI.Core.AnnotationsControl">The annoations.</field>
    People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.call(this, entry);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl, People.RecentActivity.UI.SelfPage.SelfPageSummaryControl);

People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl.prototype._annotations$2 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl.prototype, "publisher", {
    get: function() {
        /// <summary>
        ///     Gets the publisher.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return (this.object).publisher;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl.prototype, "summaryEntities", {
    get: function() {
        /// <summary>
        ///     Gets the entities.
        /// </summary>
        /// <value type="Array" elementType="Entity"></value>
        return (this.object).entities;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl.prototype, "summaryText", {
    get: function() {
        /// <summary>
        ///     Gets the summary text.
        /// </summary>
        /// <value type="String"></value>
        var entry = this.object;
        switch (entry.entryType) {
            case People.RecentActivity.FeedEntryType.video:
                return (entry.data).text;
            default:
                return '';
        }

    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl.prototype, "timestamp", {
    get: function() {
        /// <summary>
        ///     Gets the timestamp.
        /// </summary>
        /// <value type="Date"></value>
        return this.object.timestamp;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl.prototype, "annotations", {
    get: function() {
        /// <summary>
        ///     Gets the annotations to show in the sidebar.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        this._renderAnnotations$2();
        return this._annotations$2;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._annotations$2 != null) {
        this._annotations$2.dispose();
        this._annotations$2 = null;
    }

    People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPageEntrySummaryControl.prototype._renderAnnotations$2 = function() {
    if (this._annotations$2 != null) {
        // we've already rendered the annotations.
        return;
    }

    var entry = this.object;

    // render any annotations that we have.
    this._annotations$2 = new People.RecentActivity.UI.Core.AnnotationsControl(entry, document.createElement('div'), People.RecentActivity.UI.Core.AnnotationsControlPlacement.oneUp);
    this._annotations$2.render();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\PhotoAlbum.js" />
/// <reference path="SelfPagePhotoAlbumSummaryControl.js" />
/// <reference path="SelfPageSidebarControl.js" />
/// <reference path="SelfPageSummaryControl.js" />

People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSidebarControl = function(album) {
    /// <summary>
    ///     Provides a sidebar control for photo albums.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.PhotoAlbum">The photo album.</param>
    /// <field name="_summary$2" type="People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl">The summary.</field>
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.call(this, album);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSidebarControl, People.RecentActivity.UI.SelfPage.SelfPageSidebarControl);


People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSidebarControl.prototype._summary$2 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSidebarControl.prototype, "summary", {
    get: function() {
        /// <summary>
        ///     Gets the summary.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPageSummaryControl"></value>
        this._renderSummary$2();
        return this._summary$2;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSidebarControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the sidebar is being disposed.
    /// </summary>
    if (this._summary$2 != null) {
        this._summary$2.dispose();
        this._summary$2 = null;
    }

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSidebarControl.prototype._renderSummary$2 = function() {
    if (this._summary$2 == null) {
        this._summary$2 = new People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl(this.object);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Model\Contact.js" />
/// <reference path="..\..\..\Model\PhotoAlbum.js" />
/// <reference path="SelfPageSummaryControl.js" />

People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl = function(album) {
    /// <summary>
    ///     Provides a summary for photo album self pages.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.PhotoAlbum">The photo album.</param>
    People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.call(this, album);
    Debug.assert(album != null, 'album != null');
    album.addListener("propertychanged", this._onAlbumPropertyChanged$2, this);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl, People.RecentActivity.UI.SelfPage.SelfPageSummaryControl);

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl.prototype, "publisher", {
    get: function() {
        /// <summary>
        ///     Gets the publisher.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return (this.object).owner;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl.prototype, "summaryEntities", {
    get: function() {
        /// <summary>
        ///     Gets the entities.
        /// </summary>
        /// <value type="Array" elementType="Entity"></value>
        return (this.object).entities;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl.prototype, "summaryText", {
    get: function() {
        /// <summary>
        ///     Gets the summary text.
        /// </summary>
        /// <value type="String"></value>
        return (this.object).description;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl.prototype, "timestamp", {
    get: function() {
        /// <summary>
        ///     Gets the timestamp.
        /// </summary>
        /// <value type="Date"></value>
        return this.object.timestamp;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    (this.object).removeListenerSafe("propertychanged", this._onAlbumPropertyChanged$2, this);
    People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSummaryControl.prototype._onAlbumPropertyChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (e.propertyName === 'Description') {
        // update the summary.
        this.onPropertyChanged('SummaryText');
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Model\Photo.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="SelfPagePhotoSummaryControl.js" />
/// <reference path="SelfPagePhotoTagsControl.js" />
/// <reference path="SelfPageSidebarControl.js" />
/// <reference path="SelfPageSummaryControl.js" />

People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl = function(photo) {
    /// <summary>
    ///     Provides a sidebar control for photos.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Photo">The photo.</param>
    /// <field name="_summary$2" type="People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl">The summary.</field>
    /// <field name="_tags$2" type="People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl">The tags.</field>
    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.call(this, photo);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl, People.RecentActivity.UI.SelfPage.SelfPageSidebarControl);

People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype._summary$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype._tags$2 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype, "summary", {
    get: function() {
        /// <summary>
        ///     Gets the summary.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPageSummaryControl"></value>
        this._renderSummary$2();

        return this._summary$2;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype, "extra", {
    get: function() {
        /// <summary>
        ///     Gets the extra content.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        this._renderTags$2();

        return this._tags$2;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the sidebar is being disposed.
    /// </summary>
    if (this._summary$2 != null) {
        this._summary$2.dispose();
        this._summary$2 = null;
    }

    if (this._tags$2 != null) {
        this._tags$2.dispose();
        this._tags$2 = null;
    }

    People.RecentActivity.UI.SelfPage.SelfPageSidebarControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype.getExtraHydrationState = function() {
    /// <summary>
    ///     Gets any additional hydration state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this._tags$2 != null) {
        return this._tags$2.isExpanded;
    }

    return null;
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype.applyExtraHydrationState = function(data) {
    /// <summary>
    ///     Applies any additional hydration state.
    /// </summary>
    /// <param name="data" type="Object">The data.</param>
    if (this._tags$2 != null) {
        var state = data;
        if (state) {
            this._tags$2.expand(false);
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype._renderSummary$2 = function() {
    if (this._summary$2 == null) {
        this._summary$2 = new People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl(this.object);
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl.prototype._renderTags$2 = function() {
    if (this._tags$2 == null) {
        this._tags$2 = new People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl(this.object);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Model\Contact.js" />
/// <reference path="..\..\..\Model\Photo.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\..\Core\Html.js" />
/// <reference path="..\..\Core\Navigation\SelfPageNavigationData.js" />
/// <reference path="SelfPageSummaryControl.js" />

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl = function(photo) {
    /// <summary>
    ///     Provides a summary for photo self pages.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Photo">The photo.</param>
    /// <field name="_extra$2" type="People.RecentActivity.UI.Core.Control">The extra content.</field>
    /// <field name="_buttonAlbum$2" type="People.RecentActivity.UI.Core.Control">The button album.</field>
    People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.call(this, photo);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl, People.RecentActivity.UI.SelfPage.SelfPageSummaryControl);

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._extra$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._buttonAlbum$2 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype, "publisher", {
    get: function() {
        /// <summary>
        ///     Gets the publisher.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return (this.object).owner;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype, "summaryEntities", {
    get: function() {
        /// <summary>
        ///     Gets the entities.
        /// </summary>
        /// <value type="Array" elementType="Entity"></value>
        return (this.object).entities;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype, "summaryText", {
    get: function() {
        /// <summary>
        ///     Gets the summary text.
        /// </summary>
        /// <value type="String"></value>
        return (this.object).caption;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype, "timestamp", {
    get: function() {
        /// <summary>
        ///     Gets the timestamp.
        /// </summary>
        /// <value type="Date"></value>
        return this.object.timestamp;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype, "extra", {
    get: function() {
        /// <summary>
        ///     Gets the extra content.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        this._renderExtra$2();
        return this._extra$2;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance has been disposed.
    /// </summary>
    if (this._extra$2 != null) {
        this._disposeExtraContent$2();

        this._extra$2.dispose();
        this._extra$2 = null;

        var photo = this.object;
        var album = photo.album;

        photo.removeListenerSafe("propertychanged", this._onPhotoPropertyChanged$2, this);
        album.removeListenerSafe("propertychanged", this._onAlbumPropertyChanged$2, this);
        album.photos.removeListenerSafe("propertychanged", this._onAlbumPropertyChanged$2, this);
    }

    People.RecentActivity.UI.SelfPage.SelfPageSummaryControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._renderExtra$2 = function() {
    if (this._extra$2 == null) {
        var photo = this.object;

        var album = photo.album;
        if (album == null) {
            // if there is no album, then there's no point in showing this.
            return;
        }

        // initialize the DOM and set the "photo x of x" string.
        this._extra$2 = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPagePhotoExtra));

        // initialize a new button for the album name.
        this._renderExtraContent$2();

        // make sure to update this when the album refreshes.
        album.addListener("propertychanged", this._onAlbumPropertyChanged$2, this);
        album.photos.addListener("propertychanged", this._onAlbumPropertyChanged$2, this);
        photo.addListener("propertychanged", this._onPhotoPropertyChanged$2, this);
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._renderExtraContent$2 = function() {
    this._disposeExtraContent$2();

    var photo = this.object;
    var album = photo.album;

    // only show this if there is an album name.
    // if there is no album name, it means that this is a dummy album which has only one photo.
    if (Jx.isNonEmptyString(album.name)) {
        var buttonElement = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPagePhotoExtraAlbum);

        this._buttonAlbum$2 = new People.RecentActivity.UI.Core.Control(buttonElement);
        this._buttonAlbum$2.attach('click', this._onAlbumNameClicked$2.bind(this));
        this._buttonAlbum$2.attach('keydown', this._onAlbumNameKeyDown.bind(this));
        this._buttonAlbum$2.render();
        this._buttonAlbum$2.text = album.name;

        var elements = [document.createTextNode((photo.index + 1).toString()), document.createTextNode(album.photos.totalCount.toString()), this._buttonAlbum$2.element];
        this._extra$2.appendChild(People.RecentActivity.UI.Core.LocalizationHelper.loadCompoundElement('/strings/raPhotoIndex', elements));
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._disposeExtraContent$2 = function() {
    if (this._buttonAlbum$2 != null) {
        this._buttonAlbum$2.dispose();
        this._buttonAlbum$2 = null;
    }

    this._extra$2.text = '';
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._navigateToAlbum = function() {
    var album = this.object.album;
    var network = album.network;
    var identity = network.identity;

    var data = People.RecentActivity.UI.Core.create_selfPageNavigationData(album.sourceId, album.albumId, (album.objectType).toString());

    if (identity.isTemporary) {
        // this is an item for a temporary person, so pass that along as well.
        data.temporaryContact = identity.getDataContext();
    }

    data.isWhatsNew = identity.isWhatsNew;

    // Build the URL.
    var url = People.RecentActivity.UI.Core.SelfPageNavigationHelper.getNavigateUrl(
        (identity.isWhatsNew || identity.isTemporary) ? network.user.personId : identity.id,
        data);

    // Let's go!
    People.Nav.navigate(url);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._onPhotoPropertyChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.propertyName) {
        case 'Caption':
            // update the summary text.
            this.onPropertyChanged('SummaryText');
            break;

        case 'Index':
            // update the index of the photo and stuff.
            this._renderExtraContent$2();
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._onAlbumPropertyChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.propertyName) {
        case 'Name':
        case 'TotalCount':
            this._renderExtraContent$2();
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._onAlbumNameClicked$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');

    this._navigateToAlbum();
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoSummaryControl.prototype._onAlbumNameKeyDown = function (e) {
    /// <param name="e" type="KeyboardEvent"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this._navigateToAlbum();
            break;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\..\Imports\IdentityControl\IdentityElementTileOptions.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\..\Model\Photo.js" />
/// <reference path="..\..\..\Model\PhotoTag.js" />
/// <reference path="..\..\..\Model\PhotoTagCollection.js" />
/// <reference path="..\..\Core\Controls\ContactControl.js" />
/// <reference path="..\..\Core\Controls\ContactControlType.js" />
/// <reference path="..\..\Core\Controls\Control.js" />
/// <reference path="..\..\Core\Controls\NavigatableControl.js" />
/// <reference path="..\..\Core\Helpers\AriaHelper.js" />
/// <reference path="..\..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\..\Core\Helpers\UriHelper.js" />
/// <reference path="..\..\Core\Html.js" />

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl = function(photo) {
    /// <summary>
    ///     Provides a list of tags.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Photo">The photo.</param>
    /// <field name="_tileSize$2" type="Number" integer="true" static="true">The size of the tile to use.</field>
    /// <field name="_tileCount$2" type="Number" integer="true" static="true">The number of tiles to render when not expanded.</field>
    /// <field name="_photo$2" type="People.RecentActivity.Photo">The photo.</field>
    /// <field name="_tags$2" type="People.RecentActivity.PhotoTagCollection">The tags.</field>
    /// <field name="_expanded$2" type="Boolean">Whether the user has expanded the list of tags.</field>
    /// <field name="_list$2" type="People.RecentActivity.UI.Core.Control">The list of pictures.</field>
    /// <field name="_buttonMore$2" type="People.RecentActivity.UI.Core.Control">The "x others" button.</field>
    /// <field name="_title$2" type="People.RecentActivity.UI.Core.Control">The title.</field>
    /// <field name="_controls$2" type="Object">The tiles mapped by contact ID.</field>
    /// <field name="_elements$2" type="Object">The tiles mapped by contact ID.</field>
    People.RecentActivity.UI.Core.NavigatableControl.call(this, People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPagePhotoTags), WinJS.Utilities.Key.rightArrow, WinJS.Utilities.Key.leftArrow);

    Debug.assert(photo != null, 'photo != null');

    this._controls$2 = {};
    this._elements$2 = {};

    this._photo$2 = photo;
    this._tags$2 = this._photo$2.tags;

    this._tags$2.addListener("collectionchanged", this._onCollectionChanged$2, this);
    this._tags$2.addListener("propertychanged", this._onCollectionPropertyChanged$2, this);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl, People.RecentActivity.UI.Core.NavigatableControl);

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl._tileSize$2 = 60;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl._tileCount$2 = 0;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._photo$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._tags$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._expanded$2 = false;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._list$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._buttonMore$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._title$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._controls$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._elements$2 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype, "isExpanded", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the list of names has been expanded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._expanded$2;
    }
});

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype.expand = function() {
    /// <summary>
    ///     Expands the list of names.
    /// </summary>
    if (!this._expanded$2) {
        this._expanded$2 = true;
        this.addClass('expanded');

        this._updateList$2();
        this._updateMoreButton$2();

        if (focus) {
            var tileCount = People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl._tileCount$2;

            this._focusOnTile(tileCount - 1);
        }

        this.onPropertyChanged('IsExpanded');
    }
    else {
        // we've already been expanded.. open up on the web instead.
        People.RecentActivity.UI.Core.UriHelper.launchUri(this._photo$2.url);
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the control is being disposed.
    /// </summary>
    this._tags$2.removeListenerSafe("collectionchanged", this._onCollectionChanged$2, this);
    this._tags$2.removeListenerSafe("propertychanged", this._onCollectionPropertyChanged$2, this);

    Jx.root.getLayout().removeOrientationChangedEventListener(this._onOrientationChanged, this);

    if (this._list$2 != null) {
        this._list$2.dispose();
        this._list$2 = null;
    }

    if (this._buttonMore$2 != null) {
        this._buttonMore$2.dispose();
        this._buttonMore$2 = null;
    }

    if (this._title$2 != null) {
        this._title$2.dispose();
        this._title$2 = null;
    }

    if (this._controls$2 != null) {
        for (var k in this._controls$2) {
            var control = { key: k, value: this._controls$2[k] };
            control.value.dispose();
        }

        People.Social.clearKeys(this._controls$2);
        this._controls$2 = null;

        People.Social.clearKeys(this._elements$2);
        this._elements$2 = null;
    }

    People.RecentActivity.UI.Core.NavigatableControl.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype.onRendered = function() {
    /// <summary>
    ///     Occurs when the control is being rendered.
    /// </summary>
    // initialize the various controls.
    var element = this.element;

    this._title$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'photo-tags-title');
    this._title$2.id = this._title$2.uniqueId;
    this._title$2.text = Jx.res.getString('/strings/raPhotoTagsTitle');
    this.labelledBy = this._title$2.id;

    // fetch the "x more" button
    this._buttonMore$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'photo-tags-others');
    this._buttonMore$2.attach('click', this._onMoreButtonClicked$2.bind(this));
    this._buttonMore$2.attach('keydown', this._onMoreButtonKeyDown.bind(this));
    this._buttonMore$2.isVisible = false;

    this._list$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'photo-tags-list');

    this._updateTileCount$2();
    this._updateList$2();
    this._updateMoreButton$2();
    this._updateTitle$2();

    Jx.root.getLayout().addOrientationChangedEventListener(this._onOrientationChanged, this);

    People.RecentActivity.UI.Core.NavigatableControl.prototype.onRendered.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._disposeControls$2 = function(tags) {
    /// <param name="tags" type="Array" elementType="PhotoTag"></param>
    Debug.assert(tags != null, 'tags != null');

    for (var n = 0; n < tags.length; n++) {
        var tag = tags[n];

        // check to see if the control exists, and if so destroy it.
        var id = this._getKey$2(tag);
        if (!Jx.isUndefined(this._controls$2[id])) {
            this._controls$2[id].dispose();
            delete this._controls$2[id];
        }

        // also try to remove any associated HTML elements.
        delete this._elements$2[id];
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._getCapacity$2 = function() {
    /// <returns type="Number" integer="true"></returns>
    // gets the current capacity.
    if (this._expanded$2) {
        return this._tags$2.count;
    }
    else {
        // divide the amount of space we have by the size of each item, taking into the account the "more" button.
        var capacity = People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl._tileCount$2;
        if (capacity < this._tags$2.count) {
            capacity--;
        }

        return capacity;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._getKey$2 = function(tag) {
    /// <param name="tag" type="People.RecentActivity.PhotoTag"></param>
    /// <returns type="String"></returns>
    Debug.assert(tag != null, 'tag != null');

    var publisher = tag.contact;
    return publisher.sourceId + ';' + publisher.id;
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._renderTile$2 = function(tag, index) {
    /// <param name="tag" type="People.RecentActivity.PhotoTag"></param>
    /// <param name="index" type="Number" integer="true"></param>
    Debug.assert(tag != null, 'tag != null');
    
    var element = null;

    // figure out if we've already rendered a control for this contact. if so, use that cached control.
    var id = this._getKey$2(tag);
    if (!Jx.isUndefined(this._elements$2[id])) {
        // yup, re-use the existing control.
        element = this._elements$2[id];
    }
    else {
        // create a new control for this tag.
        var control = new People.RecentActivity.UI.Core.ContactControl(
            tag.contact.getDataContext(),
            true,
            '/strings/raPhotoTagsContactLabel');

        element = control.getElement(
            People.RecentActivity.UI.Core.ContactControlType.tile,
            People.RecentActivity.Imports.create_identityElementTileOptions(60, null),
            -1);

        control.activate(element, false);

        // update the role.
        People.RecentActivity.UI.Core.AriaHelper.setRole(element, 'option');
        Jx.addClass(element, 'ra-fauxButton');

        this._controls$2[id] = control;
        this._elements$2[id] = element;
    }

    // insert the element at the correct position.
    this._list$2.insertChild(element, index);
    this.insertTabControl(People.RecentActivity.UI.Core.Control.fromElement(element), index);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._updateList$2 = function() {
    // get the capacity of the current list (i.e. everything, or only a few, etc.)
    var capacity = this._getCapacity$2();
    if (capacity > 0) {
        // clear out the current list of elements.
        var element = this._list$2.element;
        element.innerHTML = '';

        // figure out if we need to fit the user's tile first.
        var index = 0;

        var tagUser = this._tags$2.findUser();
        if (tagUser != null) {
            // yup, render the user's tag first, of course.
            this._renderTile$2(tagUser, index);
            index++;
            capacity--;
        }

        for (var i = 0, count = this._tags$2.count; (i < count) && (capacity > 0); i++) {
            var tag = this._tags$2.item(i);
            if (tag !== tagUser) {
                // render the tile at the appropriate place.
                this._renderTile$2(tag, index);
                index++;
                capacity--;
            }        
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._updateMoreButton$2 = function() {
    var countTotal = this._tags$2.count;
    var countRendered = this._getCapacity$2();

    var remaining = countTotal - countRendered;
    if (remaining > 99) {
        // show the drop down button.
        this._buttonMore$2.addClass('ra-selfPagePhotoTagsOthersButtonArrow');
        this._buttonMore$2.isVisible = true;
        this._buttonMore$2.label = Jx.res.loadCompoundString('/strings/raPhotoTagsOthers-othersMany', Jx.res.getString('/strings/raPhotoTagsOthers99Plus'));
        this._buttonMore$2.text = '\ue09d';

        this.addTabControl(this._buttonMore$2);
    }
    else if (remaining > 0) {
        // there is at least one hidden control, so update and show the "x more" button.
        var labelId = '/strings/raPhotoTagsOthers' + ((remaining === 1) ? 'One' : 'Many');

        this._buttonMore$2.removeClass('ra-selfPagePhotoTagsOthersButtonArrow');
        this._buttonMore$2.isVisible = true;
        this._buttonMore$2.label = Jx.res.loadCompoundString(labelId, remaining);
        this._buttonMore$2.text = Jx.res.loadCompoundString('/strings/raPhotoTagsOthers', remaining);

        this.addTabControl(this._buttonMore$2);
    }
    else {
        this.removeTabControl(this._buttonMore$2);
        this._buttonMore$2.isVisible = false;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._updateTitle$2 = function() {
    this._title$2.isVisible = this._tags$2.count > 0;
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._focusOnTile = function (index) {
    /// <param name="index" type="Number" integer="true"></param>
    var tiles = this._list$2.element.children;
    Debug.assert(tiles.length > index, 'tiles.length > index');

    tiles[index].focus();
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._updateTileCount$2 = function () {
    /// <returns type="Boolean"></returns>
    var state = Jx.root.getLayoutState();
    var count = ((state === 'portrait') || (state === 'snapped')) ? 4 : 5;

    if (People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl._tileCount$2 !== count) {
        People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl._tileCount$2 = count;
        return true;
    }

    return false;
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._onMoreButtonClicked$2 = function (e) {
    /// <param name="e" type="MouseEvent"></param>
    Debug.assert(e != null, 'e != null');

    this.expand(true);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._onMoreButtonKeyDown = function (e) {
    /// <param name="e" type="KeyboardEvent"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this.expand(true);
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._onCollectionChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.action) {
        case People.RecentActivity.NotifyCollectionChangedAction.remove:
            // we need to dispose the controls for the old items.
            this._disposeControls$2(e.oldItems);
            break;
    }

    this._updateList$2();
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._onCollectionPropertyChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    switch (e.propertyName) {
        case 'Count':
        case 'TotalCount':
            // we also need to update the list because when the total count changes, we may have to 
            // change how many pictures we initially display (3 + button vs. 4 without button, etc.)
            this._updateList$2();
            this._updateMoreButton$2();
            this._updateTitle$2();
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoTagsControl.prototype._onOrientationChanged = function () {
    if (this._updateTileCount$2()) {
        this._updateList$2(true);
        this._updateMoreButton$2(false);
    }
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\..\Imports\PhotoViewer\PhotoViewerDataModel.js" />
/// <reference path="..\..\..\Imports\PhotoViewer\PhotoViewerItem.js" />
/// <reference path="..\..\..\Imports\PhotoViewer\PhotoViewerItemPhoto.js" />
/// <reference path="..\..\..\Imports\PhotoViewer\PhotoViewerItemThumbnail.js" />
/// <reference path="..\..\..\Imports\PhotoViewer\PhotoViewerItemThumbnailSet.js" />
/// <reference path="..\..\..\Imports\PhotoViewer\PhotoViewerRootItem.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="..\..\..\Model\FeedObjectType.js" />
/// <reference path="..\..\..\Model\Photo.js" />
/// <reference path="..\..\Core\Controls\ImageControl.js" />

People.RecentActivity.UI.SelfPage.PhotoDataModel = function(obj) {
    /// <summary>
    ///     Provides a data model.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_itemIdMap$1" type="Object">The item map, by id.</field>
    /// <field name="_itemKeyMap$1" type="Object">The item map, by key.</field>
    /// <field name="_photos$1" type="Object">The photos.</field>
    /// <field name="_root$1" type="People.RecentActivity.Imports.PhotoViewerRootItem">The root item.</field>
    /// <field name="_items$1" type="Array">The items.</field>
    /// <field name="_images$1" type="Object">The images.</field>
    /// <field name="_disposed$1" type="Boolean">Whether the instance has been disposed.</field>
    People.RecentActivity.Imports.PhotoViewerDataModel.call(this);
    Debug.assert(obj != null, 'obj != null');
    this._obj$1 = obj;
    this._images$1 = {};
    this._items$1 = [];
    this._itemIdMap$1 = {};
    this._itemKeyMap$1 = {};
    this._photos$1 = {};
    this._root$1 = new People.RecentActivity.Imports.PhotoViewerRootItem(this._items$1);
    switch (this._obj$1.objectType) {
        case People.RecentActivity.FeedObjectType.photo:
            // just create a photo item from the one single photo.
            this._addItems$1(0, [ this._obj$1 ]);
            break;
        case People.RecentActivity.FeedObjectType.photoAlbum:
            var album = this._obj$1;
            this._addItems$1(0, album.photos.toArray());
            break;
    }

    if (this._obj$1.objectType === People.RecentActivity.FeedObjectType.photoAlbum) {
        // initialize a new list of items from the photo collection.
        // also make sure to monitor changes to that collection so we can update our items.
        var album = this._obj$1;
        album.photos.addListener("collectionchanged", this._onPhotoCollectionChanged$1, this);
    }

};

Jx.inherit(People.RecentActivity.UI.SelfPage.PhotoDataModel, People.RecentActivity.Imports.PhotoViewerDataModel);


People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._obj$1 = null;
People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._itemIdMap$1 = null;
People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._itemKeyMap$1 = null;
People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._photos$1 = null;
People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._root$1 = null;
People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._items$1 = null;
People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._images$1 = null;
People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._disposed$1 = false;

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (!this._disposed$1) {
        this._disposed$1 = true;
        if (this._obj$1.objectType === People.RecentActivity.FeedObjectType.photoAlbum) {
            // detach the collection change event from the album in this case.
            var album = this._obj$1;
            album.photos.removeListenerSafe("collectionchanged", this._onPhotoCollectionChanged$1, this);
        }

        this._root$1 = null;
        // clean up all the collections we're holding on to.
        People.Social.clearKeys(this._photos$1);
        People.Social.clearKeys(this._itemIdMap$1);
        People.Social.clearKeys(this._itemKeyMap$1);
        this._items$1.length = 0;
        for (var k in this._images$1) {
            var kvpair = { key: k, value: this._images$1[k] };
            // detach events and clean up.
            var image = kvpair.value;
            image.removeListenerSafe("imagefailed", this._onImageFailed$1, this);
            image.removeListenerSafe("imageloaded", this._onImageLoaded$1, this);
            image.dispose();
        }

        People.Social.clearKeys(this._images$1);
    }
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype.getKey = function(id) {
    /// <summary>
    ///     Gets the key for an item.
    /// </summary>
    /// <param name="id" type="String">The ID of the item.</param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(id), '!string.IsNullOrEmpty(id)');
    return this._itemIdMap$1[id].key;
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype.getItem = function(key) {
    /// <summary>
    ///     Gets an item.
    /// </summary>
    /// <param name="key" type="String">The key of the item (or <c>null</c> for the root item).</param>
    /// <returns type="Object"></returns>
    if (key === 'root') {
        // we want to return the parent item here.
        return this._root$1;
    }

    return this._itemKeyMap$1[key];
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype.getChildCount = function() {
    /// <summary>
    ///     Gets the number of photos.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    return this._items$1.length;
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype.getChildByIndex = function(parent, index) {
    /// <summary>
    ///     Gets an item by index.
    /// </summary>
    /// <param name="parent" type="Object">The parent of the item (not required.)</param>
    /// <param name="index" type="Number" integer="true">The index of the item.</param>
    /// <returns type="Object"></returns>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(index < this._items$1.length, 'index < this.items.Count');
    return this._items$1[index];
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype.getIndexOfChild = function(parentKey, item) {
    /// <summary>
    ///     Gets the index of an item.
    /// </summary>
    /// <param name="parentKey" type="String">The parent key.</param>
    /// <param name="item" type="Object">The item.</param>
    /// <returns type="Number" integer="true"></returns>
    Debug.assert(item != null, 'item != null');
    return this._items$1.indexOf(item);
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._isZeroSizedPhoto$1 = function(photo) {
    /// <param name="photo" type="People.RecentActivity.Photo"></param>
    /// <returns type="Boolean"></returns>
    Debug.assert(photo != null, 'photo != null');
    return (!photo.originalHeight) || (!photo.originalWidth);
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._createItem$1 = function(photo) {
    /// <param name="photo" type="People.RecentActivity.Photo"></param>
    /// <returns type="People.RecentActivity.Imports.PhotoViewerItem"></returns>
    Debug.assert(photo != null, 'photo != null');
    // initialize the photo info (width/height, etc.)
    var photoInfo = People.RecentActivity.Imports.create_photoViewerItemPhoto(photo.sourceWidth, photo.sourceHeight);
    // initialize the two thumbnails we have (thumbnail and the source image).
    var photoThumbnailSmall = People.RecentActivity.Imports.create_photoViewerItemThumbnail('height128'/* photo viewer requires a thumbnail with this name.*/, photo.thumbnailWidth, photo.thumbnailHeight, photo.thumbnailSource);
    var photoThumbnailLarge = People.RecentActivity.Imports.create_photoViewerItemThumbnail('normal', photo.originalWidth, photo.originalHeight, photo.originalSource);
    var photoThumbnails = People.RecentActivity.Imports.create_photoViewerItemThumbnailSet([ photoThumbnailSmall, photoThumbnailLarge ]);
    // initialize the actual item.
    return new People.RecentActivity.Imports.PhotoViewerItem(photo.id, Jx.res.getString('/strings/raPhotoLabel'), photoInfo, photoThumbnails);
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._getPhotoKey$1 = function(photo) {
    /// <param name="photo" type="People.RecentActivity.Photo"></param>
    /// <returns type="String"></returns>
    Debug.assert(photo != null, 'photo != null');
    return photo.sourceId + ';' + photo.id;
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._getPhotoSize$1 = function(photo) {
    /// <param name="photo" type="People.RecentActivity.Photo"></param>
    Debug.assert(photo != null, 'photo != null');
    var key = this._getPhotoKey$1(photo);
    if (!Jx.isUndefined(this._images$1[key])) {
        // if the photo has been loaded, then we can set the appropriate size.
        var image = this._images$1[key];
        if (image.isLoaded) {
            this._updateItemSize$1(photo, this._itemIdMap$1[photo.id], image.width, image.height);
        }

    }
    else {
        // create a new ImageControl so we can pre-load the photo.
        var image = new People.RecentActivity.UI.Core.ImageControl(document.createElement('img'));
        image.id = key;
        image.addListener("imagefailed", this._onImageFailed$1, this);
        image.addListener("imageloaded", this._onImageLoaded$1, this);
        image.source = photo.originalSource;
    }
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._addItems$1 = function(index, photos) {
    /// <param name="index" type="Number" integer="true"></param>
    /// <param name="photos" type="Array" elementType="Photo"></param>
    Debug.assert(photos != null, 'photos != null');
    var preload = [];
    for (var n = 0; n < photos.length; n++) {
        var photo = photos[n];
        var item = this._createItem$1(photo);
        this._items$1.splice(index, 0, item);
        this._itemIdMap$1[item.id] = item;
        this._itemKeyMap$1[item.key] = item;
        this._photos$1[this._getPhotoKey$1(photo)] = photo;
        if (this._isZeroSizedPhoto$1(photo)) {
            // we need to preload this photo to find its size.
            preload.push(photo);
        }

        index++;
    }

    // make sure the root folder count is up-to-date.
    this._root$1.folder.photoCount = this._items$1.length;
    for (var n = 0; n < preload.length; n++) {
        var photo = preload[n];
        // preload this photo to get its size.
        this._getPhotoSize$1(photo);
    }
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._removeItems$1 = function(photos) {
    /// <param name="photos" type="Array" elementType="Photo"></param>
    Debug.assert(photos != null, 'photos != null');
    for (var n = 0; n < photos.length; n++) {
        var photo = photos[n];
        // find the item that belongs to this photo.
        var item = this._itemIdMap$1[photo.id];
        var index = this._items$1.indexOf(item);
        if (index !== -1) {
            this._items$1.splice(index, 1);
        }

        delete this._itemIdMap$1[item.id];
        delete this._itemKeyMap$1[item.key];
        delete this._photos$1[this._getPhotoKey$1(photo)];
    }

    // ensure the root folder count is up-to-date.
    this._root$1.folder.photoCount = this._items$1.length;
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._resetItems$1 = function() {
    // reset all the items in the collection, then re-add them.
    var album = this._obj$1;
    var photos = album.photos;
    this._items$1.length = 0;
    for (var i = 0, len = photos.count; i < len; i++) {
        // we've already created each item before, so just look them up in the map.
        this._items$1.push(this._itemIdMap$1[photos.item(i).id]);
    }
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._updateItemSize$1 = function(photo, item, width, height) {
    /// <param name="photo" type="People.RecentActivity.Photo"></param>
    /// <param name="item" type="People.RecentActivity.Imports.PhotoViewerItem"></param>
    /// <param name="width" type="Number" integer="true"></param>
    /// <param name="height" type="Number" integer="true"></param>
    Debug.assert(photo != null, 'photo != null');
    Debug.assert(item != null, 'item != null');
    // fetch the thumbnail of the normal photo, and then update the size.
    var thumbnails = item.thumbnailSet;
    var thumbnail = thumbnails.thumbnails[1];
    Debug.assert(thumbnail.name === 'normal', 'thumbnail.Name == normal');
    thumbnail.height = height;
    thumbnail.width = width;
    // also update the size of the photo itself.
    item.photo.height = height;
    item.photo.width = width;
    // tell the model that the item was updated.
    this.raiseEvent('dataChanged', item);
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._onPhotoCollectionChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    switch (e.action) {
        case People.RecentActivity.NotifyCollectionChangedAction.add:
            this._addItems$1(e.newItemIndex, e.newItems);
            break;
        case People.RecentActivity.NotifyCollectionChangedAction.remove:
            this._removeItems$1(e.oldItems);
            break;
        case People.RecentActivity.NotifyCollectionChangedAction.reset:
            this._resetItems$1();
            break;
    }

    // raise an event on the dataModel signaling the root folder has changed.
    // NOTE: unfortunately the raiseEvent method comes from a mix-in, and not an inherited class, so we cannot call it directly.
    this.raiseEvent('dataChanged', this._root$1);
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._onImageFailed$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');
    var image = e.sender;
    image.removeListenerSafe("imagefailed", this._onImageFailed$1, this);
    image.removeListenerSafe("imageloaded", this._onImageLoaded$1, this);
};

People.RecentActivity.UI.SelfPage.PhotoDataModel.prototype._onImageLoaded$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e != null');
    var image = e.sender;
    image.removeListenerSafe("imagefailed", this._onImageFailed$1, this);
    image.removeListenerSafe("imageloaded", this._onImageLoaded$1, this);
    var key = image.id;
    // ensure the photo still exists by the time we loaded it.
    // if so, then we can fetch the item and we can update it and the model.
    if (!Jx.isUndefined(this._photos$1[key])) {
        var photo = this._photos$1[image.id];
        this._updateItemSize$1(photo, this._itemIdMap$1[photo.id], image.width, image.height);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Imports\PhotoViewer\PhotoViewerViewContext.js" />
/// <reference path="..\..\..\Model\FeedObject.js" />
/// <reference path="PhotoDataModel.js" />

People.RecentActivity.UI.SelfPage.PhotoViewContext = function(obj) {
    /// <summary>
    ///     Provides a view context.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    People.RecentActivity.Imports.PhotoViewerViewContext.call(this, new People.RecentActivity.UI.SelfPage.PhotoDataModel(obj));
};

Jx.inherit(People.RecentActivity.UI.SelfPage.PhotoViewContext, People.RecentActivity.Imports.PhotoViewerViewContext);

People.RecentActivity.UI.SelfPage.PhotoViewContext.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    // dispose the data model.
    (this.dataModel).dispose();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Imports\ContentAnimationData.js" />
/// <reference path="..\..\Imports\LayoutState.js" />
/// <reference path="..\..\Model\Events\FeedObjectActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\..\Model\FeedObjectType.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\EventManager.js" />
/// <reference path="..\Core\Helpers\AnimationHelper.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="..\Core\InputManager.js" />
/// <reference path="..\Core\KeyboardRefresher.js" />
/// <reference path="..\Core\SnapManager.js" />
/// <reference path="Controls\SelfPageSidebarControl.js" />
/// <reference path="SelfPageCommands.js" />
/// <reference path="SelfPageHydrationData.js" />
/// <reference path="SelfPageItem.js" />
/// <reference path="SelfPagePhotoAlbumItem.js" />
/// <reference path="SelfPagePhotoItem.js" />
/// <reference path="SelfPagePlainItem.js" />
/// <reference path="SelfPageRefresher.js" />
/// <reference path="SelfPageVideoItem.js" />

People.RecentActivity.UI.SelfPage.SelfPage = function(context) {
    /// <summary>
    ///     Represents a self-page.
    /// </summary>
    /// <param name="context" type="People.RecentActivity.UI.Core.selfPageNavigationData">Additional context information.</param>
    /// <field name="_hydrationVersion" type="Number" integer="true" static="true">The hydration version.</field>
    /// <field name="_refreshTimeout" type="Number" integer="true" static="true">The refresh time out.</field>
    /// <field name="_context" type="People.RecentActivity.UI.Core.selfPageNavigationData">The optional additional context.</field>
    /// <field name="_isCommentScenario" type="Boolean">Whether it is a comment scenario.</field>
    /// <field name="_state" type="People.RecentActivity.UI.SelfPage.selfPageHydrationData">The optional state.</field>
    /// <field name="_obj" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_element" type="HTMLElement">The element.</field>
    /// <field name="_rendered" type="Boolean">Whether the self-page has been rendered.</field>
    /// <field name="_backButtonRendered" type="Boolean">Whether the back button has been rendered.</field>
    /// <field name="_sidebar" type="People.RecentActivity.UI.Core.Control">The sidebar.</field>
    /// <field name="_sidebarChild" type="People.RecentActivity.UI.SelfPage.SelfPageSidebarControl">The current sidebar child.</field>
    /// <field name="_content" type="People.RecentActivity.UI.Core.Control">The content.</field>
    /// <field name="_contentChild" type="People.RecentActivity.UI.Core.Control">The content child.</field>
    /// <field name="_item" type="People.RecentActivity.UI.SelfPage.SelfPageItem">The item.</field>
    /// <field name="_commands" type="People.RecentActivity.UI.SelfPage.SelfPageCommands">The commands.</field>
    /// <field name="_commandBack" type="People.RecentActivity.UI.Core.Control">The back button.</field>
    /// <field name="_refresher" type="People.RecentActivity.UI.SelfPage.SelfPageRefresher">The dedicated object responsible for refreshing items.</field>
    /// <field name="_disposed" type="Boolean">Whether the self-page has been disposed.</field>
    /// <field name="_refreshTimer" type="Number" integer="true">The refresh timer</field>
    /// <field name="_inputHandler" type="People.RecentActivity.UI.Core.InputManager">The input handler.</field>
    /// <field name="_inputHandlerHeight" type="People.RecentActivity.UI.Core.InputManager">The input handler height (in pixels).</field>
    /// <field name="_isResizing" type="Boolean">Whether we are currently resizing the UI.</field>
    this._refreshTimer = -1;
    this._context = context;
    // create the element up front. we add stuff to it later.
    this._element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPage);
    this._content = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element, 'selfpage-content');
    this._sidebar = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element, 'selfpage-sidebar');
    this._isCommentScenario = this._context.isCommentScenario;
};

Jx.mix(People.RecentActivity.UI.SelfPage.SelfPage.prototype, Jx.Events);
Jx.mix(People.RecentActivity.UI.SelfPage.SelfPage.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.UI.SelfPage.SelfPage.prototype, "refreshcompleted");

People.RecentActivity.UI.SelfPage.SelfPage._hydrationVersion = 2;
People.RecentActivity.UI.SelfPage.SelfPage._refreshTimeout = 200;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._context = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._isCommentScenario = false;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._state = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._obj = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._element = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._rendered = false;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._backButtonRendered = false;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._sidebar = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._sidebarChild = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._content = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._contentChild = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._item = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._commands = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._commandBack = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._refresher = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._disposed = false;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._inputHandler = null;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._inputHandlerHeight = 0;
People.RecentActivity.UI.SelfPage.SelfPage.prototype._isResizing = false;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPage.prototype, "element", {
    get: function() {
        /// <summary>
        ///     Gets the element.
        /// </summary>
        /// <value type="HTMLElement"></value>
        return this._element;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPage.prototype, "isSidebarVisible", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the sidebar is visible.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._sidebar.isVisible;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPage.prototype, "displayedObject", {
    get: function() {
        /// <summary>
        ///     Gets the currently displayed object.
        /// </summary>
        /// <value type="People.RecentActivity.FeedObject"></value>
        if (this._sidebarChild != null) {
            var obj = this._sidebarChild.object;
            if (obj != null) {
                return obj;
            }        
        }

        return this._obj;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPage.prototype, "object", {
    get: function() {
        /// <summary>
        ///     Gets the root feed object.
        /// </summary>
        /// <value type="People.RecentActivity.FeedObject"></value>
        return this._obj;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPage.prototype, "refresher", {
    get: function() {
        /// <summary>
        ///     Gets the refresher instance.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPageRefresher"></value>
        return this._refresher;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPage.prototype, "isCommentScenario", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether it is a comment scenario.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isCommentScenario;
    }
});

People.RecentActivity.UI.SelfPage.SelfPage.prototype.getState = function() {
    /// <summary>
    ///     Gets the hydration state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this._item != null && this._sidebar != null) {
        return People.RecentActivity.UI.SelfPage.create_selfPageHydrationData(2, this._item.getContentState(), this._item.getSidebarState(), this._sidebar.isVisible);
    }

    return null;
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the element.
    /// </summary>
    if (!this._disposed) {
        this._disposed = true;

        People.RecentActivity.UI.Core.SnapManager.removeControl(this);
        People.RecentActivity.UI.Core.KeyboardRefresher.removeControl(this);

        if (this._inputHandler != null) {
            this._inputHandler.removeListenerSafe("showing", this._onInputHandlerShowing, this);
            this._inputHandler.removeListenerSafe("hiding", this._onInputHandlerHiding, this);
            this._inputHandler.dispose();
            this._inputHandler = null;
        }

        if (this._refreshTimer !== -1) {
            // clear the refresh timer.
            clearTimeout(this._refreshTimer);
            this._refreshTimer = -1;
        }

        if (this._content != null) {
            this._content.dispose();
            this._content = null;
        }

        if (this._contentChild != null) {
            this._contentChild.dispose();
            this._contentChild = null;
        }

        if (this._sidebar != null) {
            this._sidebar.dispose();
            this._sidebar = null;
        }

        if (this._sidebarChild != null) {
            this._sidebarChild.dispose();
            this._sidebarChild = null;
        }

        if (this._item != null) {
            this._item.removeListenerSafe("propertychanged", this._onItemPropertyChanged, this);
            this._item.dispose();
            this._item = null;
        }

        if (this._commands != null) {
            this._commands.dispose();
            this._commands = null;
        }

        if (this._commandBack != null) {
            this._commandBack.dispose();
            this._commandBack = null;
        }

        if (this._refresher != null) {
            this._refresher.dispose();
            this._refresher = null;
        }

        // detach from static events
        People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowresized", this._onWindowResized, this);
        this._element = null;
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.getAnimationData = function() {
    /// <summary>
    ///     Gets the entering elements.
    /// </summary>
    /// <returns type="People.RecentActivity.Imports.contentAnimationData"></returns>
    Debug.assert(this._content != null, 'this.content');
    Debug.assert(this._sidebar != null, 'this.sidebar');
    var elements = [ [ this._content.element ], [ this._sidebar.element ] ];
    return People.RecentActivity.Imports.create_contentAnimationData(elements, this._onEnterComplete.bind(this));
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.render = function(obj, state) {
    /// <summary>
    ///     Renders the item.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The obj.</param>
    /// <param name="state" type="People.RecentActivity.UI.SelfPage.selfPageHydrationData">The hydration state.</param>
    Debug.assert(obj != null, 'obj');
    Jx.log.write(4, 'SelfPage::Render');
    if (this._rendered) {
        return;
    }

    this._rendered = true;
    this._obj = obj;
    this._refresher = new People.RecentActivity.UI.SelfPage.SelfPageRefresher(this._obj.network.identity);
    this._refresher.addListener("refreshcompleted", this._onRefreshCompleted, this);
    var data = state;
    if ((data != null) && (data.v === 2)) {
        // stash the hydration state for future use.
        this._state = data;
    }

    // get the item so we can render the content and summary.
    switch (this._obj.objectType) {
        case People.RecentActivity.FeedObjectType.photo:
            this._renderPhoto();
            break;
        case People.RecentActivity.FeedObjectType.photoAlbum:
            this._renderPhotoAlbum();
            break;
        case People.RecentActivity.FeedObjectType.entry:
            this._renderEntry();
            break;
        default:
            // we don't know about this item type.
            Debug.assert(false, 'Unknown object type for self-page: ' + this._obj.objectType);
            break;
    }

    People.RecentActivity.Core.BiciHelper.setCurrentPageName(this._item.biciPageName);
    People.RecentActivity.Core.BiciHelper.createPageViewDatapoint(this._obj.sourceId);
    switch (this._item.style) {
        case 1:
            Jx.removeClass(this._element, 'ra-selfPageLight');
            Jx.addClass(this._element, 'ra-selfPageDark');
            break;
        case 0:
            Jx.addClass(this._element, 'ra-selfPageLight');
            break;
    }

    Jx.addClass(this._element, 'ra-network' + this._obj.sourceId);
    People.RecentActivity.UI.Core.SnapManager.addControl(this);
    People.RecentActivity.UI.Core.KeyboardRefresher.addControl(this);
    this._addBackButtonStyle();
    this._renderContent();
    this._renderSidebar();
    // initialize the command bar. if we're not in a hydration scenario, we should also initiate a refresh action.
    this._renderCommands();
    // initialize events to listen for resolution changes.
    People.RecentActivity.UI.Core.EventManager.events.addListener("windowresized", this._onWindowResized, this);
    // make sure we listen for property changes from the item, because some items have content that causes
    // the sidebar etc. to update (in which case we should do transitions, etc.)
    this._item.addListener("propertychanged", this._onItemPropertyChanged, this);
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.renderBackButton = function() {
    /// <summary>
    ///     Renders the back button.
    /// </summary>
    if (this._backButtonRendered) {
        return;
    }

    this._backButtonRendered = true;
    this._commandBack = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this.element, 'selfpage-back');
    this._commandBack.attach('click', this._onBackButtonClicked.bind(this));
    this._commandBack.label = Jx.res.getString('/strings/backButtonAriaLabel');
    this._commandBack.text = (People.RecentActivity.UI.Core.HtmlHelper.isRightToLeft) ? '\ue0ae' : '\ue0d5';
    // Default to light, and switch later when we know actual style.
    Jx.addClass(this._element, 'ra-selfPageLight');
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.refresh = function() {
    this.refreshAll(null);
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.onLayoutChanged = function(state) {
    /// <param name="state" type="People.RecentActivity.Imports.LayoutState"></param>
    // render the content if needed.
    this._renderContentChild();
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.refreshAll = function(userState) {
    /// <summary>
    ///     Refreshes everything.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (this._refresher != null) {
        this._refresher.refresh(this._obj, userState);
        this.refreshCurrent(userState);
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.refreshCurrent = function(userState) {
    /// <summary>
    ///     Refreshes the currently displayed object.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (this._sidebarChild != null) {
        var obj = this._sidebarChild.object;
        if ((obj != null) && (obj !== this._obj)) {
            this._refresher.refresh(obj, userState);
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype.refreshObjects = function(obj, userState) {
    /// <summary>
    ///     Refreshes a specific feed object.
    /// </summary>
    /// <param name="obj" type="Array" elementType="FeedObject">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    var that = this;
    
    Debug.assert(obj != null, 'obj != null');
    if (this._refreshTimer !== -1) {
        // cancel the existing timer, we don't want to be refreshing too much content, obviously ...
        clearTimeout(this._refreshTimer);
    }

    this._refreshTimer = setTimeout(function() {
        for (var i = 0, len = obj.length; i < len; i++) {
            // refresh each object we were given.
            that._refresher.refresh(obj[i], userState);
        }

    }, 200);
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._renderSidebar = function() {
    Jx.log.write(4, 'SelfPage::RenderSidebar');
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUISelfPageRenderSidebarStart);
    this._sidebarChild = this._item.sidebar;
    if (this._state != null) {
        // show or hide the sidebar.
        this._sidebar.isVisible = this._state.sv;
    }

    if (this._sidebarChild != null) {
        // there is a sidebar child, hooray.
        this._sidebar.appendControl(this._sidebarChild);
        this._item.onSidebarRendered((this._state == null) ? null : this._state.sd);
    }

    // initialize a new input handler.
    this._inputHandler = new People.RecentActivity.UI.Core.InputManager();
    this._inputHandler.addListener("showing", this._onInputHandlerShowing, this);
    this._inputHandler.addListener("hiding", this._onInputHandlerHiding, this);
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUISelfPageRenderSidebarEnd);
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._renderContent = function() {
    Jx.log.write(4, 'SelfPage::RenderContent');
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUISelfPageRenderContentStart);
    // render the content child as well (i.e. the content supplied by the item)
    this._renderContentChild();
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUISelfPageRenderContentEnd);
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._renderContentChild = function() {
    if (this._contentChild == null) {
        this._contentChild = this._item.content;
        if (this._contentChild != null) {
            // prevent right clicks on any content in the self-page.
            this._content.appendControl(this._contentChild);
            this._item.onContentRendered((this._state == null) ? null : this._state.cd);
            if (!this._context.isCommentScenario) {
                // focus on the content.
                this._item.setFocusOnContent();
            }        
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._renderCommands = function() {
    this._commands = new People.RecentActivity.UI.SelfPage.SelfPageCommands(this, this._obj);
    if (this._state == null) {
        this._commands.refresh();
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._addBackButtonStyle = function() {
    // if we're on a dark experience we need to add some additional styles.
    if (this._item.style === 1) {
        this._commandBack.attach('MSPointerMove', this._onBackButtonHover.bind(this));
        this._commandBack.attach('MSPointerCancel', this._onBackButtonHoverCancelled.bind(this));
        this._commandBack.attach('MSPointerOut', this._onBackButtonHoverCancelled.bind(this));
        // set the default/rest background image.
        this._commandBack.element.style.backgroundImage = "url('" + People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-selfPageBackRest.png') + "')";
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._renderPhoto = function() {
    var photo = this._obj;
    var album = photo.album;
    if (album != null) {
        // use the album instead.
        this._obj = album;
    }

    this._item = new People.RecentActivity.UI.SelfPage.SelfPagePhotoItem(this, this._obj, photo.id);
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._renderPhotoAlbum = function() {
    if (this._context != null) {
        var context = this._context.data;
        if ((context != null) && context.isOneUp) {
            // initialize a one-up experience instead.
            this._item = new People.RecentActivity.UI.SelfPage.SelfPagePhotoItem(this, this._obj, (context != null) ? context.photoId : null);
        }
        else {
            // initialize a new photo album viewer.
            this._item = new People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem(this, this._obj, (context != null) ? context.photoId : null);
        }

    }
    else {
        // initialize a new photo album viewer.
        this._item = new People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem(this, this._obj, null);
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._renderEntry = function() {
    var entry = this._obj;
    switch (entry.entryType) {
        case People.RecentActivity.FeedEntryType.link:
            this._item = new People.RecentActivity.UI.SelfPage.SelfPagePlainItem(this, this._obj);
            break;
        case People.RecentActivity.FeedEntryType.text:
            this._item = new People.RecentActivity.UI.SelfPage.SelfPagePlainItem(this, this._obj);
            break;
        case People.RecentActivity.FeedEntryType.video:
            this._item = (People.RecentActivity.UI.SelfPage.SelfPageVideoItem.isSupported(this._obj)) ? new People.RecentActivity.UI.SelfPage.SelfPageVideoItem(this, this._obj) : new People.RecentActivity.UI.SelfPage.SelfPagePlainItem(this, this._obj);
            break;
        case People.RecentActivity.FeedEntryType.photo:
            var data = entry.data;
            // when we get a feed entry with a photo, we should just swap out the feed object we're looking 
            // at with the photo or the parent album.
            this._obj = data.photo;
            this._renderPhoto();
            break;
        case People.RecentActivity.FeedEntryType.photoAlbum:
            var data = entry.data;
            // when we get a feed entry with a photo album, we should just swap out the feed object
            // we're looking at with the album.
            this._obj = data.album;
            this._renderPhotoAlbum();
            break;
        default:
            // we don't know about this item type.
            Debug.assert(false, 'Unknown item type for self-page: ' + entry.entryType);
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._resizeItem = function() {
    if ((this._item != null) && (this._content != null) && (this._contentChild != null)) {
        // Update the UI forcing the area reserved for the input pane to be zero.
        this._adjustForInputPane(0);

        // We've started a resize operation.
        this._isResizing = true;

        // Tell the items to resize.
        var resizePromise = this._item.onResized();

        // Add the completion and error callbacks.
        var resizeHandler = this._onResizeCompleted.bind(this);
        resizePromise.done(resizeHandler, resizeHandler);
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._adjustForInputPane = function (inputPaneHeight) {
    /// <param name="inputPaneHeight" type="Number" optional="true"></param>
    if (this._isResizing) {
        // Ignore calls to this function while resizing.
        return;
    }

    if (!Jx.isValidNumber(inputPaneHeight)) {
        inputPaneHeight = this._inputHandlerHeight;
    }

    Debug.assert(inputPaneHeight >= 0, 'inputPaneHeight >= 0');
    // The sidebar isn't always allocated enough space to dodge the input pane.  In this case,
    // we'll get out of the way as much as we can, then return false to indicate that the whole page needs
    // adjusting to properly show the comment input.  Otherwise, we will fully dodge here, and return
    // true to indicate that no further action is necessary.
    var handled = true;
    var availableHeight = this._sidebar.element.offsetHeight - this._sidebarChild.commentInputHeight;
    if (inputPaneHeight > availableHeight) {
        handled = false;
        inputPaneHeight = availableHeight;
    }
    this._sidebar.element.style.marginBottom = inputPaneHeight + 'px';
    return handled;
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onWindowResized = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    this._resizeItem();
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onItemPropertyChanged = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    switch (e.propertyName) {
        case 'Content':
            this._onItemContentChanged();
            break;
        case 'Sidebar':
            this._onItemSidebarChanged();
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onItemContentChanged = function() {
    var that = this;
    
    var incoming = null;
    var outgoing = null;
    // we need to swap out the content.
    var contentChild = this._item.content;
    if (this._contentChild !== contentChild) {
        var switching = this._contentChild != null;
        if (switching) {
            // we need to hold on to this element because of the transition animation.
            outgoing = this._contentChild.element;
        }

        this._contentChild = contentChild;
        if (this._contentChild != null) {
            // we now have an incoming element as well.
            incoming = this._contentChild.element;
            this._content.appendControl(this._contentChild);
            // if this is the first time we're rendering content, then now is the time
            // to pass in the hydration state, otherwise just pass in null.
            this._item.onContentRendered((switching || (this._state == null)) ? null : this._state.cd);
        }

        if ((incoming != null) || (outgoing != null)) {
            // if we have an incoming or outgoing element, we should animate it.
            People.RecentActivity.UI.Core.AnimationHelper.transitionContent(incoming, outgoing).done(function() {
                if (!that._disposed) {
                    if ((outgoing != null) && (outgoing.parentNode != null)) {
                        // remove the content from the parent.
                        outgoing.parentNode.removeChild(outgoing);
                    }                
                }

                return null;
            });
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onItemSidebarChanged = function() {
    var that = this;
    
    // we need to swap out the sidebar.
    var incoming = null;
    var outgoing = null;
    var sidebarChild = this._item.sidebar;
    var switchingOld = this._sidebarChild != null;
    var switchingDifferent = this._sidebarChild !== sidebarChild;
    if (this._sidebarChild !== sidebarChild) {
        if (switchingOld) {
            // we need to hold on to this element because of the transition animation.
            outgoing = this._sidebarChild.element;
        }

        this._sidebarChild = sidebarChild;
        if (this._sidebarChild != null) {
            // we now have an incoming element.
            incoming = this._sidebarChild.element;
            this._sidebar.appendControl(this._sidebarChild);
            // if this is the first time we're rendering a sidebar, then now is the time to pass in
            // the hydration state, otherwise we should pass in null.
            this._item.onSidebarRendered((switchingOld || (this._state == null)) ? null : this._state.sd);
            if (!switchingOld && this._context.isCommentScenario) {
                // focus on the comment input box.
                this._item.setFocusOnCommentInput();
            }        
        }

        if ((incoming != null) || (outgoing != null)) {
            // if we have an incoming or outgoing element, we should animate it.
            People.RecentActivity.UI.Core.AnimationHelper.crossFadeContent(incoming, outgoing).done(function() {
                if (!that._disposed) {
                    if ((outgoing != null) && (outgoing.parentNode != null)) {
                        outgoing.parentNode.removeChild(outgoing);
                    }                
                }

                return null;
            });
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onBackButtonClicked = function(e) {
    /// <param name="e" type="Event"></param>
    Debug.assert(e != null, 'e != null');
    // go back to the previous page.
    People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateBack();
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onBackButtonHover = function(e) {
    /// <param name="e" type="Event"></param>
    Debug.assert(e != null, 'e != null');
    var element = this._commandBack.element;
    element.style.backgroundImage = "url('" + People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-selfPageBackHover.png') + "')";
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onBackButtonHoverCancelled = function(e) {
    /// <param name="e" type="Event"></param>
    Debug.assert(e != null, 'e != null');
    var element = this._commandBack.element;
    element.style.backgroundImage = "url('" + People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-selfPageBackRest.png') + "')";
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onInputHandlerShowing = function (ev) {
    /// <param name="ev" type="Windows.UI.ViewManagement.InputPaneEvent"></param>
    Debug.assert(ev != null, 'ev == null');

    // Capture the height of the keyboard and adjust the UI.
    this._inputHandlerHeight = ev.occludedRect.height;

    // _adjustForInputPane will let us know whether it was successful, or if more needs to be done.
    ev.ensuredFocusedElementInView = this._adjustForInputPane();
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onInputHandlerHiding = function (ev) {
    /// <param name="ev" type="Windows.UI.ViewManagement.InputPaneEvent"></param>
    Debug.assert(ev != null, 'ev == null');

    // Reset the height of the keyboard and adjust the UI.
    this._inputHandlerHeight = 0;
    this._adjustForInputPane();
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onEnterComplete = function() {
    if (this._item != null && this._context != null && this._context.isCommentScenario) {
        // focus on the comment input box.
        this._item.setFocusOnCommentInput();
    }
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onRefreshCompleted = function(e) {
    /// <param name="e" type="People.RecentActivity.FeedObjectActionCompletedEventArgs"></param>
    this.raiseEvent("refreshcompleted", e);
};

People.RecentActivity.UI.SelfPage.SelfPage.prototype._onResizeCompleted = function () {
    if (this.isDiposed) {
        // Bail out, we've already been disposed.
        return;
    }

    // We're done resizing, adjust the input pane back to the "natural" height.
    this._isResizing = false;
    this._adjustForInputPane();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciClickthroughAction.js" />
/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Model\Events\FeedObjectActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\..\Model\FeedObjectType.js" />
/// <reference path="..\Core\Helpers\UriHelper.js" />
/// <reference path="SelfPage.js" />

People.RecentActivity.UI.SelfPage.SelfPageCommands = function(selfPage, obj) {
    /// <summary>
    ///     Provides a control for rendering the commands at the bottom of a self-page.
    /// </summary>
    /// <param name="selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The self-page.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed entry.</param>
    /// <field name="_obj" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The self-page.</field>
    /// <field name="_commandRefresh" type="People.Command">The refresh command.</field>
    /// <field name="_commandOpenOnNetwork" type="People.Command">The "open on network" command.</field>
    /// <field name="_refreshing" type="Boolean">Whether we're refreshing.</field>
    Debug.assert(selfPage != null, 'selfPage != null');
    Debug.assert(obj != null, 'obj != null');
    this._obj = obj;
    this._selfPage = selfPage;
    this._selfPage.addListener("refreshcompleted", this._onRefreshCompleted, this);
    this._render();
};


People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._obj = null;
People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._selfPage = null;
People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._commandRefresh = null;
People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._commandOpenOnNetwork = null;
People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._refreshing = false;

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    this._commandRefresh = null;
    this._commandOpenOnNetwork = null;
    this._selfPage.removeListenerSafe("refreshcompleted", this._onRefreshCompleted, this);
    this._obj.network.removeListenerSafe("propertychanged", this._onNetworkPropertyChanged, this);
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype.refresh = function() {
    /// <summary>
    ///     Refreshes the object.
    /// </summary>
    if (!this._refreshing) {
        // then invoke the refresher specializer objectamitizer.
        this._refreshing = true;
        this._selfPage.refreshAll(this);
    }
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._render = function() {
    /// <summary>
    ///     Renders the commands.
    /// </summary>
    this._obj.network.addListener("propertychanged", this._onNetworkPropertyChanged, this);
    var commands = Jx.root.getCommandBar();
    this._commandOpenOnNetwork = new People.Command('ra-sp-open-network', null, null, '\ue128', true, true, null, this._onOpenOnNetworkClicked.bind(this));
    this._updateOpenOnNetwork();
    commands.addCommand(this._commandOpenOnNetwork);
    if (this._obj.objectType === People.RecentActivity.FeedObjectType.entry) {
        var entry = this._obj;
        if (entry.entryType === People.RecentActivity.FeedEntryType.link) {
            // also add the "open link button.
            var commandOpenInWeb = new People.Command('ra-sp-open', '/strings/ra-label-selfPageOpenInWeb', '/strings/ra-tooltip-selfPageOpenInWeb', '\ue143', true, true, null, this._onOpenInWebClicked.bind(this));
            commands.addCommand(commandOpenInWeb);
        }    
    }

    this._commandRefresh = new People.Command('ra-sp-refresh', '/strings/raRefresh', '/strings/raRefreshTooltip', '\ue117', true, true, null, this._onRefreshClicked.bind(this));
    commands.addCommand(this._commandRefresh);
    commands.refresh();
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._openUrl = function(url) {
    /// <param name="url" type="String"></param>
    People.RecentActivity.UI.Core.UriHelper.launchUri(url);
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._updateOpenOnNetwork = function() {
    var name = this._obj.network.name;
    this._commandOpenOnNetwork.setFormattedName('/strings/ra-label-selfPageOpenOnNetwork', name);
    this._commandOpenOnNetwork.setFormattedTooltip('/strings/ra-tooltip-selfPageOpenOnNetwork', name);
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._onOpenInWebClicked = function(context) {
    /// <param name="context" type="Object"></param>
    switch (this._obj.objectType) {
        case People.RecentActivity.FeedObjectType.entry:
            // open up the entry in web.
            this._onOpenEntryInWebClicked();
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._onOpenEntryInWebClicked = function() {
    var entry = this._obj;
    if (entry.entryType === People.RecentActivity.FeedEntryType.link) {
        // open up the link URL in the browser.
        var data = entry.data;
        this._openUrl(data.url);
    }
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._onOpenOnNetworkClicked = function(context) {
    /// <param name="context" type="Object"></param>
    People.RecentActivity.Core.BiciHelper.createClickThroughDatapoint(this._obj.sourceId, People.RecentActivity.Core.BiciClickthroughAction.selfPageViewOnNetwork);
    // open up the URL of the object in MoBro (or the default browser)
    this._openUrl(this._selfPage.displayedObject.url);
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._onRefreshClicked = function(context) {
    /// <param name="context" type="Object"></param>
    this.refresh();
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._onRefreshCompleted = function(e) {
    /// <param name="e" type="People.RecentActivity.FeedObjectActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (e.userState === this) {
        this._refreshing = false;
    }
};

People.RecentActivity.UI.SelfPage.SelfPageCommands.prototype._onNetworkPropertyChanged = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (e.propertyName === 'Name') {
        this._updateOpenOnNetwork();
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\..\Model\Network.js" />
/// <reference path="SelfPage.js" />

People.RecentActivity.UI.SelfPage.SelfPageItem = function(selfPage, obj) {
    /// <summary>
    ///     Provides a base class for self-page items.
    /// </summary>
    /// <param name="selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The parent self page.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <field name="_selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The selfpage.</field>
    /// <field name="_obj" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_disposed" type="Boolean">Whether the item has been disposed.</field>
    Debug.assert(selfPage != null, 'selfPage != null');
    Debug.assert(obj != null, 'obj != null');
    this._selfPage = selfPage;
    this._obj = obj;
};

Jx.mix(People.RecentActivity.UI.SelfPage.SelfPageItem.prototype, Jx.Events);
Jx.mix(People.RecentActivity.UI.SelfPage.SelfPageItem.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.UI.SelfPage.SelfPageItem.prototype, "propertychanged");

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype._selfPage = null;
People.RecentActivity.UI.SelfPage.SelfPageItem.prototype._obj = null;
People.RecentActivity.UI.SelfPage.SelfPageItem.prototype._disposed = false;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageItem.prototype, "style", {
    get: function() {
        /// <summary>
        ///     Gets the style of the self-page item.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPageItemStyle"></value>
        return 1;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageItem.prototype, "selfPage", {
    get: function() {
        /// <summary>
        ///     Gets the selfpage.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPage"></value>
        return this._selfPage;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageItem.prototype, "object", {
    get: function() {
        /// <summary>
        ///     Gets the feed entry.
        /// </summary>
        /// <value type="People.RecentActivity.FeedObject"></value>
        return this._obj;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageItem.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._obj.network;
    }
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageItem.prototype, "isDisposed", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the item was disposed.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._disposed;
    }
});

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.dispose = function() {
    /// <summary>
    ///     Occurs when the item is being disposed.
    /// </summary>
    if (!this._disposed) {
        this._disposed = true;
        this.onDisposed();
    }
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.getContentState = function() {
    /// <summary>
    ///     Gets the content state.
    /// </summary>
    /// <returns type="Object"></returns>
    return null;
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.getSidebarState = function() {
    /// <summary>
    ///     Gets the sidebar state.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.SelfPage.selfPageSidebarHydrationData"></returns>
    var sidebar = this.sidebar;
    if (sidebar != null) {
        return sidebar.getState();
    }

    return null;
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.setFocusOnContent = function() {
    /// <summary>
    ///     Sets focus on the content.
    /// </summary>
    // the cheap option is to set focus on the first item. this may not always work, so items
    // can override this method and do whatever they want.
    var content = this.content;
    if (content != null) {
        var element = content.element.querySelector("[tabindex='0']");
        if (element != null) {
            try {
                // we found an element we can focus on.
                element.setActive();
            }
            catch (e) {
            }        
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.setFocusOnCommentInput = function() {
    /// <summary>
    ///     Sets focus on the comment input.
    /// </summary>
    var sidebar = this.sidebar;
    if (sidebar != null) {
        sidebar.setFocusOnCommentInput();
    }
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onContentRendered = function(state) {
    /// <summary>
    ///     Occurs when the content has been rendered.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onSidebarRendered = function(state) {
    /// <summary>
    ///     Occurs when the sidebar has been rendered.
    /// </summary>
    /// <param name="state" type="People.RecentActivity.UI.SelfPage.selfPageSidebarHydrationData">The state.</param>
    var sidebar = this.sidebar;
    sidebar.onRenderedInDom();

    if (state != null) {
        // we have state we need to apply to the sidebar.
        sidebar.applyState(state);
    }
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onResized = function() {
    /// <summary>
    ///     Occurs when the item gets resized.
    /// </summary>
    /// <returns type="WinJS.Promise">The resize promise.</returns>
    return WinJS.Promise.wrap();
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the item is being disposed.
    /// </summary>
};

People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onPropertyChanged = function(propertyName) {
    /// <summary>
    ///     Occurs when the value of a property has changed.
    /// </summary>
    /// <param name="propertyName" type="String">The property name.</param>
    Debug.assert(Jx.isNonEmptyString(propertyName), '!string.IsNullOrEmpty(propertyName)');
    this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Model\FeedEntry.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="Controls\SelfPageEntrySidebarControl.js" />
/// <reference path="Controls\SelfPageSidebarControl.js" />
/// <reference path="SelfPage.js" />
/// <reference path="SelfPageItem.js" />

People.RecentActivity.UI.SelfPage.SelfPageEntryItem = function(selfPage, obj) {
    /// <summary>
    ///     Provides self-page items for feed entries.
    /// </summary>
    /// <param name="selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The self page.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The object.</param>
    /// <field name="_sidebar$1" type="People.RecentActivity.UI.SelfPage.SelfPageEntrySidebarControl">The sidebar.</field>
    People.RecentActivity.UI.SelfPage.SelfPageItem.call(this, selfPage, obj);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPageEntryItem, People.RecentActivity.UI.SelfPage.SelfPageItem);


People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype._sidebar$1 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype, "sidebar", {
    get: function() {
        /// <summary>
        ///     Gets the sidebar.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPageSidebarControl"></value>
        this._renderSidebar$1();
        return this._sidebar$1;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype, "entry", {
    get: function() {
        /// <summary>
        ///     Gets the feed entry.
        /// </summary>
        /// <value type="People.RecentActivity.FeedEntry"></value>
        return this.object;
    }
});

People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this._sidebar$1 != null) {
        this._sidebar$1.dispose();
        this._sidebar$1 = null;
    }

    People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype.onRenderSidebar = function() {
    /// <summary>
    ///     Occurs when the sidebar is being rendered.
    /// </summary>
    this._sidebar$1 = new People.RecentActivity.UI.SelfPage.SelfPageEntrySidebarControl(this.object);
    this._sidebar$1.render();
};

People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype._renderSidebar$1 = function() {
    if (this._sidebar$1 == null) {
        this.onRenderSidebar();
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciPageNames.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedAction.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\..\Model\Photo.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Helpers\AriaHelper.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\Core\Helpers\MoCoHelper.js" />
/// <reference path="..\Core\Helpers\SelfPageNavigationHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="..\Core\Navigation\SelfPageAlbumData.js" />
/// <reference path="Controls\SelfPagePhotoAlbumSidebarControl.js" />
/// <reference path="Controls\SelfPageSidebarControl.js" />
/// <reference path="SelfPage.js" />
/// <reference path="SelfPageItem.js" />
/// <reference path="SelfPagePhotoAlbumItemHydrationData.js" />
/// <reference path="SelfPagePhotoAlbumLayout.js" />
/// <reference path="SelfPagePhotoAlbumPhoto.js" />

(function () {
    var hydrationVersion = 4;

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem = function (selfPage, obj, photoId) {
        /// <summary>
        ///     Provides an item for album items.
        /// </summary>
        /// <param name="selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The self page.</param>
        /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
        /// <param name="photoId" type="String">The ID to focus on.</param>
        /// <field name="_state$1" type="People.RecentActivity.UI.SelfPage.selfPagePhotoAlbumItemHydrationData">The state, if any.</field>
        /// <field name="_stateApplied$1" type="Boolean">Whether the state has been applied to the view.</field>
        /// <field name="_content$1" type="People.RecentActivity.UI.Core.Control">The content.</field>
        /// <field name="_sidebar$1" type="People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSidebarControl">The sidebar.</field>
        /// <field name="_title$1" type="People.RecentActivity.UI.Core.Control">The title of the album.</field>
        /// <field name="_count$1" type="People.RecentActivity.UI.Core.Control">The number of items.</field>
        /// <field name="_listviewElement$1" type="HTMLElement">The list view element.</field>
        /// <field name="_listview$1" type="WinJS.UI.ListView">The list view.</field>
        /// <field name="_listviewList$1" type="WinJS.Binding.List">The list view data source.</field>
        /// <field name="_listviewMap$1" type="Object">The list view map.</field>
        /// <field name="_listviewImageMap$1" type="Object">The image map.</field>
        /// <field name="_isCoverSkipped$1" type="Boolean">Whether we skipped rendering the cover photo.</field>
        /// <field name="_photoId$1" type="String">The photo ID to focus on.</field>
        /// <field name="_itemInvokedHandler$1" type="Function">The item invoked handler.</field>
        /// <field name="_loadingStateChangedHandler$1" type="Function">The loading state change handler.</field>
        People.RecentActivity.UI.SelfPage.SelfPageItem.call(this, selfPage, obj);
        
        this._listviewMap$1 = {};
        this._listviewImageMap$1 = {};
        this._photoId$1 = photoId;
    };

    Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem, People.RecentActivity.UI.SelfPage.SelfPageItem);

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._state$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._stateApplied$1 = false;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._content$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._sidebar$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._title$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._count$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._listviewElement$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._listview$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._listviewList$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._listviewMap$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._listviewImageMap$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._isCoverSkipped$1 = false;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._photoId$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._itemInvokedHandler$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._loadingStateChangedHandler$1 = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._contentAnimatingHandler = null;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._enterPageAnimated = false;
    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._animationPromise = null;

    Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype, "content", {
        get: function () {
            /// <summary>
            ///     Gets the content.
            /// </summary>
            /// <value type="People.RecentActivity.UI.Core.Control"></value>
            this._renderContent$1();
            
            return this._content$1;
        },
        configurable: true
    });

    Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype, "sidebar", {
        get: function () {
            /// <summary>
            ///     Gets the sidebar.
            /// </summary>
            /// <value type="People.RecentActivity.UI.SelfPage.SelfPageSidebarControl"></value>
            this._renderSidebar$1();
            
            return this._sidebar$1;
        },
        configurable: true
    });

    Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype, "biciPageName", {
        get: function () {
            /// <summary>
            ///     Gets the BICI page name.
            /// </summary>
            /// <value type="People.RecentActivity.Core.BiciPageNames"></value>
            return People.RecentActivity.Core.BiciPageNames.selfPagePhotoAlbum;
        },
        configurable: true
    });

    Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype, "style", {
        get: function () {
            /// <summary>
            ///     Gets the style of the item.
            /// </summary>
            /// <value type="People.RecentActivity.UI.SelfPage.SelfPageItemStyle"></value>
            return 0;
        },
        configurable: true
    });

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype.getContentState = function () {
        /// <summary>
        ///     Gets the hydration state of the content.
        /// </summary>
        /// <returns type="Object"></returns>
        if (this._listview$1 != null) {
            return People.RecentActivity.UI.SelfPage.create_selfPagePhotoAlbumItemHydrationData(hydrationVersion, this._listview$1.currentItem, this._listview$1.scrollPosition);
        }

        return null;
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype.setFocusOnContent = function () {
        /// <summary>
        ///     Sets focus on the content.
        /// </summary>
        if ((this._state$1 == null) && (this._listviewList$1 != null) && (this._listviewList$1.length > 0)) {
            var id = this._photoId$1;
            if (!Jx.isNonEmptyString(id)) {
                // fetch the ID of the first photo in the list.
                id = (this._listviewList$1.getAt(0)).photo.id;
            }

            // ensure the item is in view so it will be rendered.
            var index = this._listviewList$1.indexOf(this._listviewMap$1[id]);
            if (index !== -1) {
                // set the "first visible index".
                this._listview$1.indexOfFirstVisible = index;
            }

            // once it's rendered it should be in this map.
            if (!Jx.isUndefined(this._listviewImageMap$1[id])) {
                try {
                    // set focus on the first item in the list.
                    this._listviewImageMap$1[id].setActive();
                }
                catch (e) {
                    Jx.log.exception('Error setting the active element.', e);
                }
            }
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype.onContentRendered = function (state) {
        /// <summary>
        ///     Occurs once the content has been added to the DOM.
        /// </summary>
        /// <param name="state" type="Object">The state.</param>
        // once we've got that sorted out, we can go set up the listview.
        var album = this.object;
        album.addListener("propertychanged", this._onAlbumPropertyChanged$1, this);

        var photos = album.photos;
        photos.addListener("collectionchanged", this._onPhotosCollectionChanged$1, this);
        photos.addListener("propertychanged", this._onPhotosPropertyChanged$1, this);

        // initialize the listview that is going to hold the content.
        this._listviewElement$1 = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._content$1.element, 'item-list');
        this._listviewElement$1.style.visibility = 'hidden';
        this._listviewElement$1.style.opacity = 0;

        this._listviewList$1 = new WinJS.Binding.List();
        this._listview$1 = new WinJS.UI.ListView(this._listviewElement$1);
        this._listview$1.itemDataSource = this._listviewList$1.dataSource;
        this._listview$1.itemTemplate = this._onRenderingItem$1.bind(this);
        
        this._listview$1.layout = new WinJS.UI.GridLayout();
        
        this._listview$1.loadingBehavior = 'randomaccess';
        this._listview$1.selectionMode = 'none';

        // attach some additional elements, of course.
        this._itemInvokedHandler$1 = this._onItemInvoked$1.bind(this);
        this._loadingStateChangedHandler$1 = this._onLoadingStateChanged$1.bind(this);
        this._contentAnimatingHandler = this._onContentAnimating$1.bind(this);

        this._listview$1.addEventListener('iteminvoked', this._itemInvokedHandler$1, false);
        this._listview$1.addEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
        this._listview$1.addEventListener('contentanimating', this._contentAnimatingHandler, false);

        if (state != null) {
            var data = state;
            if (data.v === hydrationVersion) {
                // save the state so we can apply it when needed.
                this._state$1 = data;
            }
        }

        var count = photos.count;
        if (count > 0) {
            // here there be magic. if the first and only photo is the cover photo, and its index is not 0 (i.e. it is not the first photo)
            // then we shouldn't show it until the rest come in. if we do, then it's going to look weird -- we render one photo and then
            // it disappears as soon as the rest comes in.
            if (this._isOnlyCoverPhoto$1()) {
                this._isCoverSkipped$1 = true;
            }
            else {
                this._addPhotos$1(photos.toArray());
            }
        }

        People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onContentRendered.call(this, state);
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype.onResized = function () {
        /// <summary>
        ///     Occurs when the item has been resized.
        /// </summary>
        var basePromise = People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onResized.call(this);

        var that = this;
        var listview = this._listview$1;

        return basePromise.then(
            function () {
                if (that.isDisposed) {
                    return;
                }

                return new WinJS.Promise(
                    function (complete, error, progress) {
                        setImmediate(
                            function () {
                                if (that.isDisposed) {
                                    return;
                                }

                                var onLoadingStateChanged = function (ev) {
                                    if (that.isDisposed || listview.loadingState == 'complete') {
                                        // We're either disposed or completed, time to clean up!
                                        listview.removeEventListener('loadingstatechanged', onLoadingStateChanged, false);
                                        listview = null;

                                        // All done, complete the promise.
                                        complete();
                                    }
                                };

                                // Listen for loading state changes so we know that the re-layout is complete.
                                listview.addEventListener('loadingstatechanged', onLoadingStateChanged, false);
                                that._forceLayout$1();
                            });
                    });
            });
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype.onDisposed = function () {
        /// <summary>
        ///     Occurs when the content has been disposed.
        /// </summary>
        if (this._content$1 != null) {
            this._content$1.dispose();
            this._content$1 = null;
        }

        if (this._title$1 != null) {
            this._title$1.dispose();
            this._title$1 = null;
        }

        if (this._count$1 != null) {
            this._count$1.dispose();
            this._count$1 = null;
        }

        if (this._animationPromise != null) {
            this._animationPromise.cancel();
            this._animationPromise = null;
        }

        if (this._listview$1 != null) {
            this._listview$1.removeEventListener('iteminvoked', this._itemInvokedHandler$1, false);
            this._listview$1.removeEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
            this._listview$1.removeEventListener('contentanimating', this._contentAnimatingHandler, false);

            this._listview$1 = null;
            this._listviewList$1 = null;

            People.Social.clearKeys(this._listviewImageMap$1);
            this._listviewImageMap$1 = null;

            People.Social.clearKeys(this._listviewMap$1);
            this._listviewMap$1 = null;

            this._loadingStateChangedHandler$1 = null;
            this._itemInvokedHandler$1 = null;
            this._contentAnimatingHandler = null;
        }

        this._listviewElement$1 = null;

        if (this._sidebar$1 != null) {
            this._sidebar$1.dispose();
            this._sidebar$1 = null;
        }

        this._state$1 = null;

        var album = this.object;
        album.removeListenerSafe("propertychanged", this._onAlbumPropertyChanged$1, this);

        var photos = album.photos;
        photos.removeListenerSafe("collectionchanged", this._onPhotosCollectionChanged$1, this);
        photos.removeListenerSafe("propertychanged", this._onPhotosPropertyChanged$1, this);

        People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onDisposed.call(this);
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._forceLayout$1 = function () {
        this._listview$1.forceLayout();
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._renderContent$1 = function () {
        if (this._content$1 == null) {
            var element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPagePhotoAlbumContent);
            
            // initialize the various parts of the content.
            var album = this.object;
            var name = album.name;
            
            this._title$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-title');
            this._title$1.text = name;
            this._title$1.title = name;
            
            this._count$1 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-count');
            this._updateCount$1();
            
            this._content$1 = new People.RecentActivity.UI.Core.Control(element);
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._renderSidebar$1 = function () {
        if (this._sidebar$1 == null) {
            this._sidebar$1 = new People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumSidebarControl(this.object);
            this._sidebar$1.render();
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._updateCount$1 = function () {
        var album = this.object;
        var count = People.RecentActivity.UI.Core.LocalizationHelper.getCountString('/strings/raSelfPagePhotoAlbumCountZero', '/strings/raSelfPagePhotoAlbumCountOne', '/strings/raSelfPagePhotoAlbumCountMany', album.photos.totalCount);
        
        if ((this._count$1 != null) && (this._title$1 != null)) {
            if (!Jx.isNonEmptyString(album.name)) {
                // use the title for the count instead.
                this._count$1.text = '';
                this._title$1.text = count;
            }
            else {
                // set the "x items" string.
                this._count$1.text = count;
            }
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._addPhotos$1 = function (photos) {
        /// <param name="photos" type="Array" elementType="Photo"></param>
        Debug.assert(photos != null, 'photos != null');
        
        if (!photos.length) {
            // um, what? okay, fine, have it your way.
            return;
        }

        this._listview$1.addEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
        var dataSource = this._listview$1.itemDataSource;
        dataSource.beginEdits();
        
        var minIndex = 2147483647; // 2^31-1
        var maxIndex = -1;
        
        for (var n = 0; n < photos.length; n++) {
            var photo = photos[n];
            
            // insert each photo into the right position.
            var index = photo.index;
            var item = this._createItemFromPhoto$1(photo);
            
            this._listviewList$1.splice(index, 0, item);
            this._listviewMap$1[photo.id] = item;
            
            // store the min/max index for later reference.
            minIndex = Math.min(minIndex, index);
            maxIndex = Math.max(maxIndex, index);
        }

        if (this._isCoverSkipped$1) {
            // check to see if the cover photo falls into this bucket, if so we should now render it.
            var cover = (this.object).cover;
            var coverIndex = cover.index;
            
            if ((coverIndex >= minIndex - 1) && (coverIndex <= maxIndex + 1)) {
                // okay, the cover photo can be added now, so.. add it. yeah.
                var item = this._createItemFromPhoto$1(cover);
                
                this._listviewList$1.splice(coverIndex, 0, item);
                this._listviewMap$1[cover.id] = item;
                
                this._isCoverSkipped$1 = false;
            }
        }
        
        // finalize the edits.
        dataSource.endEdits();
        
        // make sure the listview is now visible.
        this._listviewElement$1.style.visibility = '';
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._tryApplyState = function () {
        // when we're done, check to see if we need to apply to state.
        if (!this._stateApplied$1 && this._state$1 != null) {
            try {
                // yup, set the state bits on the listview, and we're done.
                this._listview$1.currentItem = this._state$1.c;
                this._listview$1.scrollPosition = this._state$1.s;
            }
            catch (e) {
                // ignore any errors regarding setting old state.
                Jx.log.exception('Error setting state on ListView', e);
            }

            this._stateApplied$1 = true;
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._removePhotos$1 = function (photos) {
        /// <param name="photos" type="Array" elementType="Photo"></param>
        Debug.assert(photos != null, 'photos != null');
        
        if (!photos.length) {
            // the list of photos we're removing is empty, err, okay.
            return;
        }

        this._listview$1.addEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
        var dataSource = this._listview$1.itemDataSource;
        dataSource.beginEdits();
        
        for (var n = 0; n < photos.length; n++) {
            var photo = photos[n];
            var key = photo.id;
            
            if (!Jx.isUndefined(this._listviewMap$1[key])) {
                // look up the item in the list view data source, and remove it if we found it.
                var item = this._listviewMap$1[key];
                var index = this._listviewList$1.indexOf(item);
                
                if (index !== -1) {
                    this._listviewList$1.splice(index, 1);
                }
            }
        }

        dataSource.endEdits();
        
        if (!this._listviewList$1.length) {
            // just hide the listview completely.
            this._listviewElement$1.style.visibility = 'hidden';
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._resetPhotos$1 = function () {
        this._listview$1.addEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
        var dataSource = this._listview$1.itemDataSource;
        dataSource.beginEdits();
        
        // first clear out the collection.
        this._listviewList$1.splice(0, this._listviewList$1.length);
        
        // then re-add every single photo. we don't have to recreate stuff though, because
        // the photos should already have been created.
        var photos = (this.object).photos;
        for (var i = 0, len = photos.count; i < len; i++) {
            this._listviewList$1.splice(i, 0, this._listviewMap$1[photos.item(i).id]);
        }

        dataSource.endEdits();
        
        // force the listview to re-layout.
        this._listview$1.forceLayout();
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._createItemFromPhoto$1 = function (photo) {
        /// <param name="photo" type="People.RecentActivity.Photo"></param>
        /// <returns type="People.RecentActivity.UI.SelfPage.selfPagePhotoAlbumPhoto"></returns>
        Debug.assert(photo != null, 'photo != null');
        
        return People.RecentActivity.UI.SelfPage.create_selfPagePhotoAlbumPhoto(photo);
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._isOnlyCoverPhoto$1 = function () {
        /// <returns type="Boolean"></returns>
        var album = this.object;
        var photos = album.photos;
        
        return (photos.count === 1) && (photos.totalCount !== 1) && (photos.item(0) === album.cover);
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._onRenderingItem$1 = function (promise) {
        /// <param name="promise" type="WinJS.UI.ListViewRenderPromise"></param>
        /// <returns type="Object"></returns>
        Debug.assert(promise != null, 'promise != null');
        
        var that = this;
        return promise.then(function (data) {
            if (that.isDisposed) {
                // we've already been disposed, whoops.
                return null;
            }

            var item = data.data;
            var id = item.photo.id;
            
            var elementId = null;
            
            if (!Jx.isUndefined(that._listviewImageMap$1[id])) {
                elementId = (that._listviewImageMap$1[id]).uniqueID;
                
                // remove the old wrapper first.
                that._listviewImageMap$1[id] = null;
            }
            
            // Put the image as the background of a div so it can take care of resizing and cropping for us.
            var wrapper = document.createElement('div');
            wrapper.className = 'ra-selfPagePhotoAlbumItemPhotoWrapper';
            wrapper.id = (Jx.isNonEmptyString(elementId)) ? elementId : (wrapper).uniqueID;
            wrapper.style.backgroundImage = "url('" + item.photo.originalSource + "')";
            
            // don't forget the ARIA attribute, otherwise narrator will read the URL.
            People.RecentActivity.UI.Core.AriaHelper.setLabel(wrapper, Jx.res.getString('/strings/raSelfPagePhotoAlbumLabel'));
            that._listviewImageMap$1[id] = wrapper;
            
            return wrapper;
        });
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._onPhotosPropertyChanged$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');
        
        switch (e.propertyName) {
            case 'Count':
            case 'TotalCount':
                this._updateCount$1();
                break;
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._onPhotosCollectionChanged$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');
        
        if (this._content$1 != null) {
            switch (e.action) {
                case People.RecentActivity.NotifyCollectionChangedAction.add:
                    this._addPhotos$1(e.newItems);
                    break;
                
                case People.RecentActivity.NotifyCollectionChangedAction.remove:
                    this._removePhotos$1(e.oldItems);
                    break;
                
                case People.RecentActivity.NotifyCollectionChangedAction.reset:
                    this._resetPhotos$1();
                    break;
            }
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._onAlbumPropertyChanged$1 = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');
        
        switch (e.propertyName) {
            case 'Name':
                // update the name of the album.
                this._title$1.text = (this.object).name;
                break;
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._onContentAnimating$1 = function (ev) {
        // Disable the ListView entranceAnimation as it doesn't work well with our AppFrame entrance animation.
        if (ev.detail.type === WinJS.UI.ListViewAnimationType.entrance) {
            ev.preventDefault();
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._onLoadingStateChanged$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        switch (this._listview$1.loadingState) {
            case 'itemsLoaded':
                // We are ready to animate in the contents if it hasn't been animated.
                if (!this._enterPageAnimated) {
                    var that = this;
                    this._animationPromise = People.Animation.enterPage(this._listviewElement$1).done(function () {
                        that._animationPromise = null;
                    });
                    
                    this._enterPageAnimated = true;
                }

                // We want to ignore any loading state changes in response to the user scrolling, restoring any state
                // would be jarring at this point.
                if ((ev.detail == null) || !ev.detail.scrolling) {
                    this._tryApplyState();

                    // Set focus on content, phase 1. The image we need isn't rendered yet, but it won't be
                    // rendered at all unless we push it into view. Phase 2 comes with the 'complete' event.
                    this.setFocusOnContent();
                }

                break;

            case 'complete':
                // We want to ignore any loading state changes in response to the user scrolling, restoring any state
                // would be jarring at this point.
                if ((ev.detail == null) || !ev.detail.scrolling) {
                    // Set focus on content, phase 2. The image we need should now be rendered, this second call
                    // will make sure the item we are looking for is currently active.
                    this.setFocusOnContent();
                }

                this._listview$1.removeEventListener('loadingstatechanged', this._loadingStateChangedHandler$1, false);
                break;
        }
    };

    People.RecentActivity.UI.SelfPage.SelfPagePhotoAlbumItem.prototype._onItemInvoked$1 = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');
        
        var item = People.RecentActivity.UI.Core.MoCoHelper.getItemFromEvent(this._listviewList$1, ev.detail);
        if (item != null) {
            // we have found a valid item, now lets see if theres an associated photo.
            People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigateToObject(this.object, People.RecentActivity.UI.Core.create_selfPageAlbumData(true, item.photo.id));
        }
    };
})();

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciPageNames.js" />
/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Imports\PhotoViewer\PhotoViewerImages.js" />
/// <reference path="..\..\Imports\PhotoViewer\PhotoViewerItem.js" />
/// <reference path="..\..\Imports\PhotoViewer\PhotoViewerOptions.js" />
/// <reference path="..\..\Imports\PhotoViewer\PhotoViewerStrings.js" />
/// <reference path="..\..\Model\Events\NotifyCollectionChangedEventArgs.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\..\Model\FeedObjectType.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="Controls\SelfPagePhotoSidebarControl.js" />
/// <reference path="Controls\SelfPageSidebarControl.js" />
/// <reference path="PhotoViewer\PhotoViewContext.js" />
/// <reference path="SelfPage.js" />
/// <reference path="SelfPageItem.js" />

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem = function(selfPage, obj, photoId) {
    /// <summary>
    ///     Provides an item for photo self pages.
    /// </summary>
    /// <param name="selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The self page.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <param name="photoId" type="String">The ID of the photo to show.</param>
    /// <field name="_photoFlipperCss$1" type="String" static="true">The flipper images CSS.</field>
    /// <field name="_photoSidebarPreloadCount$1" type="Number" integer="true" static="true">The number of sidebar instances to pre-load (on each side of the current sidebar).</field>
    /// <field name="_injectedPhotoFlipperCss$1" type="Boolean" static="true">Whether we've inject CSS for the flipper controls.</field>
    /// <field name="_currentIndex$1" type="Number" integer="true">The currently displayed photo.</field>
    /// <field name="_currentId$1" type="String">The currently displayed photo ID.</field>
    /// <field name="_currentItem$1" type="People.RecentActivity.Imports.PhotoViewerItem">The currently rendered item.</field>
    /// <field name="_currentSidebar$1" type="People.RecentActivity.UI.SelfPage.SelfPageSidebarControl">The current sidebar.</field>
    /// <field name="_content$1" type="People.RecentActivity.UI.Core.Control">The content.</field>
    /// <field name="_viewer$1" type="wLive.Controls.SelfView">The photo viewer.</field>
    /// <field name="_context$1" type="People.RecentActivity.UI.SelfPage.PhotoViewContext">The context.</field>
    /// <field name="_sidebars$1" type="Object">The sidebars</field>
    /// <field name="_isPropertyChangedQueued$1" type="Boolean">Whether a property change event has been queued.</field>
    /// <field name="_isInitialWithState$1" type="Boolean">Whether this is the first time we're rendering the item, with state.</field>
    /// <field name="_lockToken$1" type="People.RecentActivity.photoCollectionLockToken">The lock token, if we're holding on to one.</field>
    this._currentIndex$1 = -1;
    People.RecentActivity.UI.SelfPage.SelfPageItem.call(this, selfPage, obj);
    Debug.assert((obj.objectType === People.RecentActivity.FeedObjectType.photo) || (obj.objectType === People.RecentActivity.FeedObjectType.photoAlbum));
    this._currentId$1 = photoId;
    this._sidebars$1 = {};
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPagePhotoItem, People.RecentActivity.UI.SelfPage.SelfPageItem);

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem._photoFlipperCss$1 = "\r\n.selfnar { background-image: url('{0}'); }\r\n.selfnar:hover { background-image: url('{1}'); }\r\n.selfnar:active { background-image: url('{2}'); }\r\n.selfpar { background-image: url('{3}'); }\r\n.selfpar:hover { background-image: url('{4}'); }\r\n.selfpar:active { background-image: url('{5}'); }";
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem._photoSidebarPreloadCount$1 = 1;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem._injectedPhotoFlipperCss$1 = false;

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem._injectPhotoViewerFlipperCss$1 = function() {
    if (!People.RecentActivity.UI.SelfPage.SelfPagePhotoItem._injectedPhotoFlipperCss$1) {
        // unfortunately the photo viewe does not give us as much control over the flipper images for
        // things like hover and pressed states. usually we can work around this kind of thing with
        // CSS, but we don't know exactly where we're running from (i.e. there's no image path resolve in CSS).
        // so, we have to inject some CSS here.
        People.RecentActivity.UI.SelfPage.SelfPagePhotoItem._injectedPhotoFlipperCss$1 = true;
        var css;
        if (People.RecentActivity.UI.Core.HtmlHelper.isLeftToRight) {
            css = People.Social.format("\r\n.selfnar { background-image: url('{0}'); }\r\n.selfnar:hover { background-image: url('{1}'); }\r\n.selfnar:active { background-image: url('{2}'); }\r\n.selfpar { background-image: url('{3}'); }\r\n.selfpar:hover { background-image: url('{4}'); }\r\n.selfpar:active { background-image: url('{5}'); }", People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerNext.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerNext-hover.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerNext-pressed.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerPrevious.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerPrevious-hover.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerPrevious-pressed.png'));
        }
        else {
            // The button images need to be swapped in RTL, let's do that here.
            css = People.Social.format("\r\n.selfnar { background-image: url('{0}'); }\r\n.selfnar:hover { background-image: url('{1}'); }\r\n.selfnar:active { background-image: url('{2}'); }\r\n.selfpar { background-image: url('{3}'); }\r\n.selfpar:hover { background-image: url('{4}'); }\r\n.selfpar:active { background-image: url('{5}'); }", People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerPrevious.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerPrevious-hover.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerPrevious-pressed.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerNext.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerNext-hover.png'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-photoViewerNext-pressed.png'));
        }

        Jx.addStyle(css);
    }
};


People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._currentId$1 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._currentItem$1 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._currentSidebar$1 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._content$1 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._viewer$1 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._context$1 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._sidebars$1 = null;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._isPropertyChangedQueued$1 = false;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._isInitialWithState$1 = false;
People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._lockToken$1 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype, "content", {
    get: function() {
        /// <summary>
        ///     Gets the content control.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        this._renderContent$1();
        return this._content$1;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype, "sidebar", {
    get: function() {
        /// <summary>
        ///     Gets the sidebar control.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPageSidebarControl"></value>
        this._renderSidebar$1();
        return this._currentSidebar$1;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype, "biciPageName", {
    get: function() {
        /// <summary>
        ///     Gets the BICI page name.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciPageNames"></value>
        return People.RecentActivity.Core.BiciPageNames.selfPagePhoto;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype.getContentState = function() {
    /// <summary>
    ///     Gets the content state.
    /// </summary>
    /// <returns type="Object"></returns>
    return this._currentIndex$1;
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype.getSidebarState = function() {
    /// <summary>
    ///     Gets the sidebar state.
    /// </summary>
    /// <returns type="People.RecentActivity.UI.SelfPage.selfPageSidebarHydrationData"></returns>
    if (this._currentSidebar$1 != null) {
        // get the state of the current sidebar, bypassing the RenderSidebar() routine, as we don't need
        // to render sidebars and refresh objects just to get state.
        return this._currentSidebar$1.getState();
    }

    return null;
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype.onContentRendered = function(state) {
    /// <summary>
    ///     Occurs when the content is rendered in the DOM.
    /// </summary>
    /// <param name="state" type="Object"></param>
    this._isInitialWithState$1 = state != null;
    var obj = this.object;
    // set up the options, view context and data model for the photo viewer.
    this._context$1 = new People.RecentActivity.UI.SelfPage.PhotoViewContext(obj);
    if (obj.objectType === People.RecentActivity.FeedObjectType.photoAlbum) {
        // we also need to listen to changes in the album.
        var album = obj;
        var photos = album.photos;
        photos.addListener("collectionchanged", this._onPhotoCollectionChanged$1, this);
        photos.addListener("propertychanged", this._onPhotoCollectionPropertyChanged$1, this);
        if (Jx.isNonEmptyString(this._currentId$1)) {
            // if the current ID is not null or empty it means we want to show that specific photo. however, due to
            // various reasons (Facebook being buggy, hitting our cache boundaries, etc.) it's possible that the photo
            // with this ID will be removed once refresh completes. to prevent that, tell the model to lock the photo
            // in place. that way it will be ignored when we're refreshing.
            this._lockToken$1 = photos.lock(this._currentId$1);
        }    
    }

    this._renderViewer$1();
    if (state != null) {
        // we've got state for our contents, yay!
        var index = state;
        var count = this._context$1.dataModel.getChildCount();
        if (index < count) {
            this._currentIndex$1 = index;
        }
        else {
            // if the index falls outside the bounds, just select the next best thing.
            this._currentIndex$1 = count - 1;
        }    
    }

    this._renderCurrentItem$1(false);
    People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onContentRendered.call(this, state);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype.onResized = function() {
    /// <summary>
    ///     Occurs when the window size changes.
    /// </summary>
    var basePromise = People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onResized.call(this);

    // Make sure the base promise has completed.
    var that = this;
    return basePromise.then(
        function () {
            if (that.isDisposed) {
                return;
            }

            // There is a timing issue with the 'onresize' event when the comment input has focus. To work around this we 
            // execute the resize after the event returns.
            return new WinJS.Promise(
                function (complete, error, progress) {
                    setImmediate(function () {
                        if (that.isDisposed) {
                            return;
                        }

                        that._resizeGrid();
                        if (that._viewer$1 != null) {
                            that._viewer$1.resize();
                        }
                        complete();
                    });
                });
        });
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._resizeGrid = function() {
    var element = this.selfPage.element.querySelector(".ra-selfPageContainer");
    if ((element.offsetWidth / element.offsetHeight) < 1) {
        // When we are skinnier than square, we want the flipper control to maintain a consistent 
        // 4:3 aspect ratio, but no more than 50% of the total height.
        var desiredRatio = 4 / 3;
        var height = element.offsetWidth / desiredRatio;
        height = Math.min(height, element.offsetHeight / 2);
        element.style["-ms-grid-rows"] = height + "px 1fr";
    } else {
        element.style["-ms-grid-rows"] = "100%";
    }
}

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    var obj = this.object;
    this._currentItem$1 = null;
    if (obj.objectType === People.RecentActivity.FeedObjectType.photoAlbum) {
        // detach the "photo collection changed" event.
        var album = obj;
        var photos = album.photos;
        photos.removeListenerSafe("collectionchanged", this._onPhotoCollectionChanged$1, this);
        photos.removeListenerSafe("propertychanged", this._onPhotoCollectionPropertyChanged$1, this);
        if (this._lockToken$1 != null) {
            // release the lock we had.
            photos.unlock(this._lockToken$1);
            this._lockToken$1 = null;
        }    
    }

    if (this._context$1 != null) {
        this._context$1.dispose();
        this._context$1 = null;
    }

    if (this._content$1 != null) {
        this._content$1.dispose();
        this._content$1 = null;
    }

    if (this._viewer$1 != null) {
        this._viewer$1.dispose();
        this._viewer$1 = null;
    }

    if (this._sidebars$1 != null) {
        for (var k in this._sidebars$1) {
            var sidebar = { key: k, value: this._sidebars$1[k] };
            // dispose each sidebar we're holding on to.
            sidebar.value.dispose();
        }

        People.Social.clearKeys(this._sidebars$1);
    }

    if (this._currentSidebar$1 != null) {
        this._currentSidebar$1.dispose();
        this._currentSidebar$1 = null;
    }

    People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._renderContent$1 = function() {
    if (this._content$1 == null) {
        // load the actual photo viewer now.
        People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoViewerStart);
        $include('$(socialRoot)/Social.PhotoViewer.js');
        People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadPhotoViewerStop);
        this._resizeGrid();
        // initialize the container and wait until the content is rendered before initializing the viewer.
        this._content$1 = new People.RecentActivity.UI.Core.Control(People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPagePhotoContent));
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._renderViewer$1 = function() {
    Debug.assert(this._context$1 != null, 'this.context != null');
    var loc = Jx.res;
    // initialize the images.
    var images = People.RecentActivity.Imports.create_photoViewerImages(People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-1x1.gif'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-1x1.gif'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-1x1.gif'), People.RecentActivity.UI.Core.HtmlHelper.resolvePath('~/images/ra-1x1.gif'));
    People.RecentActivity.UI.SelfPage.SelfPagePhotoItem._injectPhotoViewerFlipperCss$1();
    // initialize the strings.
    var strings = People.RecentActivity.Imports.create_photoViewerStrings(loc.getString('/strings/raPhotoViewerPrevious'), loc.getString('/strings/raPhotoViewerNext'));
    // initialize a new photo viewer... and boom goes the dynamite.
    var element = this._content$1.element;
    this._viewer$1 = new wLive.Controls.SelfView($(element), this._context$1, People.RecentActivity.Imports.create_photoViewerOptions(images, strings, this._onPhotoViewerIndexChanged$1.bind(this)));
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._renderSidebar$1 = function() {
    var obj = this.object;
    switch (obj.objectType) {
        case People.RecentActivity.FeedObjectType.photo:
            if (this._currentSidebar$1 == null) {
                // we're looking at a single photo -- simple.
                this._currentSidebar$1 = new People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl(obj);
                this._currentSidebar$1.render();
            }

            break;
        case People.RecentActivity.FeedObjectType.photoAlbum:
            // we're looking at an album, pick the photo we're currently looking at.
            this._ensureCurrentIndex$1();
            if ((this._currentIndex$1 !== -1) && (this._currentItem$1 != null)) {
                if (this._currentSidebar$1 != null) {
                    // check to see if the photo ID matches our current ID. if so, no need to re-render the sidebar for it.
                    var photo = this._currentSidebar$1.object;
                    if (photo.id === this._currentItem$1.id) {
                        return;
                    }                
                }

                // initialize the sidebar at the current index -- InitializeSidebar will do the correct bounds checks.
                var objects = [];
                var control = this._initializeSidebar$1(this._currentIndex$1);
                if (control != null) {
                    // we got a sidebar for the current index, stash it for refresh.
                    objects.push(control.object);
                }

                // initialize sidebars for prev/next sidebars as well.
                for (var i = 1; i > 0; i--) {
                    control = this._initializeSidebar$1(this._currentIndex$1 - i);
                    if (control != null) {
                        objects.push(control.object);
                    }

                    control = this._initializeSidebar$1(this._currentIndex$1 + i);
                    if (control != null) {
                        objects.push(control.object);
                    }                
                }

                // store the currently selected sidebar.
                this._currentSidebar$1 = this._sidebars$1[this._currentItem$1.id];
                if (!this._isInitialWithState$1) {
                    // we also need to refresh each photo we've just rendered a sidebar for.
                    this.selfPage.refreshObjects(objects, null);
                }
                else {
                    this._isInitialWithState$1 = false;
                }            
            }

            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._renderCurrentItem$1 = function(ensureSidebar) {
    /// <param name="ensureSidebar" type="Boolean"></param>
    var dataModel = this._context$1.dataModel;
    this._ensureCurrentIndex$1();
    if ((this._currentIndex$1 !== -1) && (this._currentIndex$1 < dataModel.getChildCount())) {
        // render the current item.
        this._currentItem$1 = dataModel.getChildByIndex(null, this._currentIndex$1);
        if (ensureSidebar) {
            // do a double check to make sure the sidebar has been rendered.
            this._ensureSidebar$1();
        }

        this._viewer$1.render(this._currentItem$1);
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._updateCurrentItem$1 = function(index) {
    /// <param name="index" type="Number" integer="true"></param>
    if (index !== this._currentIndex$1) {
        var dataModel = this._context$1.dataModel;
        if ((index !== -1) && (index < dataModel.getChildCount())) {
            this._currentIndex$1 = index;
            this._currentItem$1 = dataModel.getChildByIndex(null, this._currentIndex$1);
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._ensureSidebar$1 = function() {
    if (this._currentSidebar$1 == null) {
        this._renderSidebar$1();
        if (this._currentSidebar$1 != null) {
            this.onPropertyChanged('Sidebar');
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._ensureCurrentIndex$1 = function() {
    if (this._currentIndex$1 === -1) {
        if (!Jx.isNonEmptyString(this._currentId$1)) {
            // start with the first photo.
            this._currentIndex$1 = 0;
        }
        else {
            var dataModel = this._context$1.dataModel;
            // attempt to look up the photo and get the index.
            var item = dataModel.getItem(this._currentId$1);
            if (item != null) {
                // we found the photo, so get the index of that photo.
                this._currentIndex$1 = dataModel.getIndexOfChild(null, item);
            }
            else {
                // start with the first photo.
                this._currentIndex$1 = 0;
            }        
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._initializeSidebar$1 = function(index) {
    /// <param name="index" type="Number" integer="true"></param>
    /// <returns type="People.RecentActivity.UI.SelfPage.SelfPageSidebarControl"></returns>
    Debug.assert(this.object.objectType === People.RecentActivity.FeedObjectType.photoAlbum, 'this.Object.ObjectType == FeedObjectType.PhotoAlbum');
    if (index < 0) {
        // yeah, how about no?
        return null;
    }

    var album = this.object;
    var photos = album.photos;
    if (photos.count > index) {
        var photo = photos.item(index);
        if (!!Jx.isUndefined(this._sidebars$1[photo.id])) {
            // initialize a new sidebar for the given photo.
            var sidebar = new People.RecentActivity.UI.SelfPage.SelfPagePhotoSidebarControl(photo);
            sidebar.render();
            this._sidebars$1[photo.id] = sidebar;
        }

        return this._sidebars$1[photo.id];
    }

    return null;
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._onPhotoCollectionChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyCollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (this._currentItem$1 == null) {
        // we haven't rendered an item yet. figure out if we can render the item now with the 
        // changes in the collection.
        this._renderCurrentItem$1(true);
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._onPhotoCollectionPropertyChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    if (e.propertyName === 'TotalCount') {
        // the total count changed, check to make sure our index is still valid.
        var collection = e.sender;
        if (this._currentIndex$1 >= collection.totalCount) {
            // adjust our index and check to see if we can render the current item.
            this._currentIndex$1 = collection.totalCount - 1;
            this._renderCurrentItem$1(true);
        }    
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePhotoItem.prototype._onPhotoViewerIndexChanged$1 = function(index) {
    /// <param name="index" type="Number" integer="true"></param>
    var that = this;
    
    // tell the sidebar to switch to the next photo.
    this._updateCurrentItem$1(index);
    if (!this._isPropertyChangedQueued$1) {
        this._isPropertyChangedQueued$1 = true;
        // off-load this to a seperate time chunk, such that the photo viewer doesn't get interrupted
        // by us rendering our new sidebar.
        window.msSetImmediate(function() {
            that._isPropertyChangedQueued$1 = false;
            if (!that.isDisposed) {
                // we've not been disposed, so raise a sidebar property change event.
                that.onPropertyChanged('Sidebar');
            }

        });
    }
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciPageNames.js" />
/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\..\Imports\IdentityControl\IdentityElementContextOptions.js" />
/// <reference path="..\..\Imports\IdentityControl\IdentityElementTileOptions.js" />
/// <reference path="..\..\Model\Configuration.js" />
/// <reference path="..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\Core\Controls\AnnotationsControl.js" />
/// <reference path="..\Core\Controls\AnnotationsControlPlacement.js" />
/// <reference path="..\Core\Controls\ContactControl.js" />
/// <reference path="..\Core\Controls\ContactControlType.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Controls\FormattedTextControl.js" />
/// <reference path="..\Core\Controls\ImageControl.js" />
/// <reference path="..\Core\Helpers\HtmlHelper.js" />
/// <reference path="..\Core\Helpers\LocalizationHelper.js" />
/// <reference path="..\Core\Helpers\UriHelper.js" />
/// <reference path="..\Core\Html.js" />
/// <reference path="..\Core\Point.js" />
/// <reference path="..\Core\TimestampUpdateTimer.js" />
/// <reference path="SelfPage.js" />
/// <reference path="SelfPageEntryItem.js" />

People.RecentActivity.UI.SelfPage.SelfPagePlainItem = function(selfPage, obj) {
    /// <summary>
    ///     Provides content for self-pages.
    /// </summary>
    /// <param name="selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The self page.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <field name="_content$2" type="People.RecentActivity.UI.Core.Control">The content.</field>
    /// <field name="_name$2" type="People.RecentActivity.UI.Core.Control">The contact name control.</field>
    /// <field name="_container$2" type="People.RecentActivity.UI.Core.Control">The content container</field>
    /// <field name="_publisher$2" type="People.RecentActivity.UI.Core.ContactControl">The publisher control.</field>
    /// <field name="_text$2" type="People.RecentActivity.UI.Core.FormattedTextControl">The user submitted text.</field>
    /// <field name="_image$2" type="People.RecentActivity.UI.Core.ImageControl">The image control, if any.</field>
    /// <field name="_title$2" type="People.RecentActivity.UI.Core.Control">The title.</field>
    /// <field name="_caption$2" type="People.RecentActivity.UI.Core.Control">The caption.</field>
    /// <field name="_description$2" type="People.RecentActivity.UI.Core.Control">The description.</field>
    /// <field name="_time$2" type="People.RecentActivity.UI.Core.Control">The timestamp.</field>
    /// <field name="_annotations$2" type="People.RecentActivity.UI.Core.AnnotationsControl">The annotations.</field>
    /// <field name="_isUnwrapped$2" type="Boolean">Whether we're showing an unwrapped URL.</field>
    /// <field name="_isSetFocusRequested$2" type="Boolean">Whether focus is requested.</field>
    People.RecentActivity.UI.SelfPage.SelfPageEntryItem.call(this, selfPage, obj);
    Jx.addClass(selfPage.element, 'ra-selfPagePlain');
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPagePlainItem, People.RecentActivity.UI.SelfPage.SelfPageEntryItem);

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._content$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._name$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._container$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._publisher$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._text$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._image$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._title$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._caption$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._description$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._time$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._annotations$2 = null;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._isUnwrapped$2 = false;
People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._isSetFocusRequested$2 = false;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype, "content", {
    get: function() {
        /// <summary>
        ///     Gets the content element.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        this._renderContent$2();
        return this._content$2;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype, "biciPageName", {
    get: function() {
        /// <summary>
        ///     Gets the BICI page name.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciPageNames"></value>
        switch (this.entry.entryType) {
            case People.RecentActivity.FeedEntryType.link:
                return People.RecentActivity.Core.BiciPageNames.selfPageLink;

            case People.RecentActivity.FeedEntryType.text:
                return People.RecentActivity.Core.BiciPageNames.selfPageText;

            case People.RecentActivity.FeedEntryType.video:
                return People.RecentActivity.Core.BiciPageNames.selfPageVideo;
        }

        Debug.assert(false, 'Unknown plain entry type. Type=' + this.entry.entryType);

        return People.RecentActivity.Core.BiciPageNames.none;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype, "style", {
    get: function() {
        /// <summary>
        ///     Gets the style of the self-page.
        /// </summary>
        /// <value type="People.RecentActivity.UI.SelfPage.SelfPageItemStyle"></value>
        return 0;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype.getContentState = function() {
    /// <summary>
    ///     Gets the content state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this._content$2 != null) {
        // simply store the scroll left/top of the content.
        var element = this._content$2.element;
        return People.RecentActivity.UI.Core.create_point(element.scrollLeft, element.scrollTop);
    }

    return null;
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype.setFocusOnContent = function() {
    /// <summary>
    ///     Sets focus on the content.
    /// </summary>
    if (this._container$2 != null) {
        this._container$2.setActive();
    }
    else {
        // wait until we've rendered.
        this._isSetFocusRequested$2 = true;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._updateContentAreaSize = function () {
    var containerElement = this.selfPage.element.querySelector(".ra-selfPageContainer");    
    if ((containerElement.offsetWidth / containerElement.offsetHeight) < 1) {
        // When we are skinnier than square, the content element should take up exactly the space it needs,
        // up to 50% of the container height.
        containerElement.style["-ms-grid-rows"] = "auto 1fr";
        setImmediate(function () {
            var contentElement = containerElement.querySelector(".ra-selfPageContent");
            var height = Math.min(contentElement.scrollHeight, containerElement.offsetHeight / 2);
            containerElement.style["-ms-grid-rows"] = height + "px 1fr";
        });
    } else {
        containerElement.style["-ms-grid-rows"] = "100%";
    }
}

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype.onResized = function () {
    /// <summary>
    ///     Occurs when the window size changes.
    /// </summary>
    var basePromise = People.RecentActivity.UI.SelfPage.SelfPageItem.prototype.onResized.call(this);

    // Make sure the base promise has completed.
    var that = this;
    return basePromise.then(
        function () {
            if (that.isDisposed) {
                return;
            }

            // There is a timing issue with the 'onresize' event when the comment input has focus. To work around this we 
            // execute the resize after the event returns.
            return new WinJS.Promise(
                function (complete, error, progress) {
                    setImmediate(function () {
                        if (that.isDisposed) {
                            return;
                        }
                        that._applyColumnLayout$2();
                        that._updateContentAreaSize();
                        complete();
                    });
                });
        });
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype.onContentRendered = function(state) {
    /// <summary>
    ///     Occurs when the content has been rendered.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
    if (state != null) {
        var point = state;

        // simply restore the left/top points.
        var element = this._content$2.element;
        element.scrollLeft = point.left;
        element.scrollTop = point.top;
    }

    this._updateContentAreaSize();
    People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype.onContentRendered.call(this, state);
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype.onDisposed = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (this._name$2 != null) {
        this._name$2.dispose();
        this._name$2 = null;
    }

    if (this._content$2 != null) {
        this._content$2.dispose();
        this._content$2 = null;
    }

    if (this._container$2 != null) {
        this._container$2.dispose();
        this._container$2 = null;
    }

    if (this._text$2 != null) {
        this._text$2.dispose();
        this._text$2 = null;
    }

    if (this._time$2 != null) {
        this._time$2.dispose();
        this._time$2 = null;
    }

    if (this._annotations$2 != null) {
        this._annotations$2.dispose();
        this._annotations$2 = null;
    }

    if (this._image$2 != null) {
        this._image$2.removeListenerSafe("imagefailed", this._onImageFailed$2, this);
        this._image$2.removeListenerSafe("imageloaded", this._onImageLoaded$2, this);

        this._image$2.dispose();
        this._image$2 = null;
    }

    if (this._title$2 != null) {
        this._title$2.dispose();
        this._title$2 = null;
    }

    if (this._caption$2 != null) {
        this._caption$2.dispose();
        this._caption$2 = null;
    }

    if (this._description$2 != null) {
        this._description$2.dispose();
        this._description$2 = null;
    }

    if (this._publisher$2 != null) {
        this._publisher$2.dispose();
        this._publisher$2 = null;
    }

    People.RecentActivity.UI.Core.TimestampUpdateTimer.unsubscribe(this._onTimerElapsed$2, this);
    this.network.removeListenerSafe("propertychanged", this._onNetworkPropertyChanged$2, this);

    People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._renderContent$2 = function() {
    if (this._content$2 != null) {
        // we've already rendered the content, no need to do it again.
        return;
    }

    var element = People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.selfPagePlainContent);
    this._content$2 = new People.RecentActivity.UI.Core.Control(element);
    this._name$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(element, 'item-contact-name');

    // render the name, but delay everything else.
    var entry = this.entry;
    var data = entry.data;
    this._publisher$2 = new People.RecentActivity.UI.Core.ContactControl(entry.publisher.getDataContext());
    var elementName = element.children[0];
    elementName.appendChild(this._publisher$2.getElement(People.RecentActivity.UI.Core.ContactControlType.name, People.RecentActivity.Imports.create_identityElementContextOptions(entry.sourceId), -1));

    // schedule rendering the rest of the content.
    this._renderBaseContent$2();
    this._renderPreview$2();
    this._publisher$2.activate(element);
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._renderBaseContent$2 = function() {
    var element = this._content$2.element;
    var elementContainer = People.RecentActivity.UI.Core.HtmlHelper.findElementById(element, 'item-content');
    this._container$2 = People.RecentActivity.UI.Core.Control.fromElement(elementContainer);

    // initialize the various contact elements
    var entry = this.entry;
    var data = entry.data;

    // append the controls to the DOM.
    var elementPicture = element.children[1];
    elementPicture.appendChild(this._publisher$2.getElement(People.RecentActivity.UI.Core.ContactControlType.tile, People.RecentActivity.Imports.create_identityElementTileOptions(100, null)));

    // intialize the text and timestamp.
    this._text$2 = new People.RecentActivity.UI.Core.FormattedTextControl(elementContainer.children[0], entry.sourceId, false);
    this._text$2.update(data.text, entry.entities);

    this._time$2 = People.RecentActivity.UI.Core.Control.fromElement(elementContainer.children[3]);
    this.network.addListener("propertychanged", this._onNetworkPropertyChanged$2, this);
    this._updateTimeVia$2();

    // render the annotations as well.
    this._annotations$2 = new People.RecentActivity.UI.Core.AnnotationsControl(entry, elementContainer.children[2], People.RecentActivity.UI.Core.AnnotationsControlPlacement.oneUp);
    this._annotations$2.render();

    People.RecentActivity.UI.Core.TimestampUpdateTimer.subscribe(this._onTimerElapsed$2, this);

    if (this._isSetFocusRequested$2) {
        this._isSetFocusRequested$2 = false;
        this._container$2.setActive();
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._renderPreview$2 = function() {
    var entry = this.entry;
    var entryType = entry.entryType;
    var caption = null;
    var description = null;
    var title = null;

    switch (entryType) {
        case People.RecentActivity.FeedEntryType.link:
            var data = entry.data;

            caption = data.caption;
            description = data.description;
            title = data.title;
            break;

        case People.RecentActivity.FeedEntryType.text:
            // hide the details for a plain text entry.
            var preview = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._content$2.element, 'item-preview');
            preview.style.display = 'none';
            return;

        case People.RecentActivity.FeedEntryType.video:
            var data = entry.data;

            caption = data.caption;
            description = data.description;
            title = data.title;
            break;
    }


    // start loading the image early.
    this._renderPreviewImage$2();

    var elementContainer = this._container$2.element;
    var elementPreview = elementContainer.children[1];
    elementPreview.style.opacity = '1';

    // render the caption.
    this._caption$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(elementPreview, 'item-caption');
    this._caption$2.isVisible = Jx.isNonEmptyString(caption);
    this._caption$2.isHiddenFromScreenReader = true;
    this._caption$2.text = caption;

    // render the description.
    this._description$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(elementPreview, 'item-description');
    this._description$2.isVisible = Jx.isNonEmptyString(description);
    this._description$2.isHiddenFromScreenReader = true;
    this._description$2.text = description;

    // render the title
    this._title$2 = People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(elementPreview, 'item-title');
    this._title$2.attach('click', this._onTitleClicked$2.bind(this));
    this._title$2.attach('keydown', this._onTitleKeyDown$2.bind(this));
    this._title$2.isVisible = Jx.isNonEmptyString(title);
    this._title$2.text = title;
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._renderPreviewImage$2 = function() {
    var image = this._getTileUrl$2();

    this._image$2 = new People.RecentActivity.UI.Core.ImageControl(People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._content$2.element, 'item-image'));
    this._image$2.isDelayed = true;
    this._image$2.isOneByOneError = true;
    this._image$2.isVisible = Jx.isNonEmptyString(image);
    this._image$2.isHiddenFromScreenReader = true;

    if (Jx.isNonEmptyString(image)) {
        this._image$2.addListener("imagefailed", this._onImageFailed$2, this);
        this._image$2.addListener("imageloaded", this._onImageLoaded$2, this);
        this._image$2.source = image;
    }
    else {
        // there is no image to load, so by definition it has been loaded.
        this._content$2.addClass('ra-selfPagePlainItemNoImage');
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._updateTimeVia$2 = function() {
    var timestamp = this.entry.timestamp;
    var time = People.RecentActivity.UI.Core.LocalizationHelper.getTimeString(timestamp);

    var name = this.network.name;
    if (Jx.isNonEmptyString(name)) {
        time = Jx.res.loadCompoundString('/strings/raItemVia', time, name);
    }

    this._time$2.text = time;
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._getTileUrl$2 = function() {
    /// <returns type="String"></returns>
    var entry = this.entry;
    var transforms = null;
    var urls = null;
    var url = null;

    switch (entry.entryType) {
        case People.RecentActivity.FeedEntryType.link:
            var data = entry.data;

            transforms = People.RecentActivity.Configuration.linkUrlTransforms;
            url = data.tile;
            urls = [ data.tile ];
            break;

        case People.RecentActivity.FeedEntryType.video:
            var data = entry.data;

            transforms = People.RecentActivity.Configuration.videoUrlTransforms;
            url = data.tile;
            urls = [ data.displayUrl, data.sourceUrl ];
            break;
    }

    for (var i = 0, len = urls.length; i < len; i++) {
        for (var j = 0, len2 = transforms.length; j < len2; j++) {
            // check to see if this transform will transform the tile.
            var previewUrl = transforms[j].createPreviewUrl(urls[i]);
            if (Jx.isNonEmptyString(previewUrl)) {
                this._isUnwrapped$2 = true;
                return previewUrl;
            }        
        }    
    }

    return url;
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._applyColumnLayout$2 = function() {
    var elementContainer = People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._content$2.element, 'item-preview');

    // get the size of the image and then figure out what template to use.
    if (this._image$2 && this._image$2.element.naturalWidth >= (elementContainer.clientWidth / 2)) {
        // In snap, we don't use column mode no matter what.
        this._content$2.removeClass('ra-selfPagePlainItemColumns');
    } else {
        // use the two-column layout for images that are this small.
        this._content$2.addClass('ra-selfPagePlainItemColumns');
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._launchUri$2 = function() {
    var entry = this.entry;
    var type = entry.entryType;
    var uri = null;

    switch (type) {
        case People.RecentActivity.FeedEntryType.link:
            uri = (entry.data).url;
            break;

        case People.RecentActivity.FeedEntryType.video:
            uri = (entry.data).displayUrl;
            break;
    }

    People.RecentActivity.UI.Core.UriHelper.launchUri(uri);
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._onTimerElapsed$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    this._updateTimeVia$2();
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._onImageFailed$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e');
    if (this._isUnwrapped$2) {
        // okay, we failed to load the unwrapped image, so lets try the normal one.
        this._isUnwrapped$2 = false;

        var entry = this.entry;
        switch (entry.entryType) {
            case People.RecentActivity.FeedEntryType.link:
                this._image$2.source = (entry.data).tile;
                break;

            case People.RecentActivity.FeedEntryType.video:
                this._image$2.source = (entry.data).tile;
                break;
        }
    }
    else {
        People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadLinkTileStop);

        // we failed to load the image completely.
        this._image$2.removeListenerSafe("imagefailed", this._onImageFailed$2, this);
        this._image$2.removeListenerSafe("imageloaded", this._onImageLoaded$2, this);
        this._image$2.isVisible = false;

        this._content$2.addClass('ra-selfPagePlainItemNoImage');
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._onImageLoaded$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e');

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialUILoadLinkTileStop);

    this._image$2.removeListenerSafe("imagefailed", this._onImageFailed$2, this);
    this._image$2.removeListenerSafe("imageloaded", this._onImageLoaded$2, this);

    this._applyColumnLayout$2();
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._onTitleClicked$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev');

    this._launchUri$2();
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._onTitleKeyDown$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev');
    switch (ev.keyCode) {
        case WinJS.Utilities.Key.enter:
        case WinJS.Utilities.Key.space:
            this._launchUri$2();
            break;
    }
};

People.RecentActivity.UI.SelfPage.SelfPagePlainItem.prototype._onNetworkPropertyChanged$2 = function(e) {
    /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
    Debug.assert(e != null, 'e');

    if (e.propertyName === 'Name') {
        this._updateTimeVia$2();
    }
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciPageNames.js" />
/// <reference path="..\..\Model\Configuration.js" />
/// <reference path="..\..\Model\Entries\FeedEntryVideoType.js" />
/// <reference path="..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\..\Model\FeedObjectType.js" />
/// <reference path="..\Core\Controls\Control.js" />
/// <reference path="..\Core\Controls\GlobalProgressControl.js" />
/// <reference path="SelfPage.js" />
/// <reference path="SelfPageEntryItem.js" />
/// <reference path="SelfPageVideoItemHydrationData.js" />

People.RecentActivity.UI.SelfPage.SelfPageVideoItem = function(selfPage, obj) {
    /// <summary>
    ///     Provides content for self-pages.
    /// </summary>
    /// <param name="selfPage" type="People.RecentActivity.UI.SelfPage.SelfPage">The self page.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <field name="_content$2" type="People.RecentActivity.UI.Core.Control">The content.</field>
    /// <field name="_isHtml5Player$2" type="Boolean">Whether we're using an HTML5 player.</field>
    /// <field name="_state$2" type="People.RecentActivity.UI.SelfPage.selfPageVideoItemHydrationData">The (optional) state.</field>
    People.RecentActivity.UI.SelfPage.SelfPageEntryItem.call(this, selfPage, obj);
};

Jx.inherit(People.RecentActivity.UI.SelfPage.SelfPageVideoItem, People.RecentActivity.UI.SelfPage.SelfPageEntryItem);

People.RecentActivity.UI.SelfPage.SelfPageVideoItem.isSupported = function(obj) {
    /// <param name="obj" type="People.RecentActivity.FeedObject"></param>
    /// <returns type="Boolean"></returns>
    Debug.assert(obj != null, 'obj != null');
    if (obj.objectType !== People.RecentActivity.FeedObjectType.entry) {
        return false;
    }

    var entry = obj;
    if (entry.entryType !== People.RecentActivity.FeedEntryType.video) {
        return false;
    }

    // figure out if we can get an embeddable URL from this one.
    var data = entry.data;
    if (data.sourceType === People.RecentActivity.FeedEntryVideoType.raw) {
        try {
            // make sure we actually support the <video /> tag.
            // setting these properties will fail on versions of Windows that don't support native media playback
            var video = document.createElement('video');
            video.autoplay = true;
            video.controls = true;
            // raw FB videos are supported.
            return true;
        }
        catch (e) {
            // we failed to initialize a new video element, so we don't support this.
            return false;
        }    
    }

    var url = People.RecentActivity.UI.SelfPage.SelfPageVideoItem._getEmbeddedPlayerUrl$2([ data.displayUrl, data.sourceUrl ]);
    return url != null;
};

People.RecentActivity.UI.SelfPage.SelfPageVideoItem._getEmbeddedPlayerUrl$2 = function(urls) {
    /// <param name="urls" type="Array" elementType="String"></param>
    /// <returns type="String"></returns>
    var videoTransforms = People.RecentActivity.Configuration.videoUrlTransforms;
    for (var i = 0, len = urls.length; i < len; i++) {
        for (var j = 0, len2 = videoTransforms.length; j < len2; j++) {
            var embedUrl = videoTransforms[j].createEmbedUrl(urls[i]);
            if (Jx.isNonEmptyString(embedUrl)) {
                return embedUrl;
            }        
        }    
    }

    return null;
};


People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype._content$2 = null;
People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype._isHtml5Player$2 = false;
People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype._state$2 = null;

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype, "content", {
    get: function() {
        /// <summary>
        ///     Gets the content element.
        /// </summary>
        /// <value type="People.RecentActivity.UI.Core.Control"></value>
        this._renderContent$2();
        return this._content$2;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype, "biciPageName", {
    get: function() {
        /// <summary>
        ///     Gets the BICI page name.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciPageNames"></value>
        return People.RecentActivity.Core.BiciPageNames.selfPageVideo;
    },
    configurable: true
});

People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype.getContentState = function() {
    /// <summary>
    ///     Gets the content state.
    /// </summary>
    /// <returns type="Object"></returns>
    if (this._isHtml5Player$2) {
        // simply get some information on the player.
        var element = this._content$2.element;
        return People.RecentActivity.UI.SelfPage.create_selfPageVideoItemHydrationData(element.paused, element.ended, element.currentTime);
    }

    return null;
};

People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype.setFocusOnContent = function() {
    /// <summary>
    ///     Sets focus on the content.
    /// </summary>
    if (this._content$2 != null) {
        this._content$2.setActive();
    }
};

People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype.onContentRendered = function(state) {
    /// <summary>
    ///     Occurs when the content has been rendered.
    /// </summary>
    /// <param name="state" type="Object">The state.</param>
    if (this._isHtml5Player$2) {
        // we need to ensure that we wait for the metadata to come in before setting currentTime,
        // otherwise the length of the track is 0, and we get an INVALID_STATE_ERROR.
        this._state$2 = state;
        this._content$2.attach('loadedmetadata', this._onVideoMetadataLoaded$2.bind(this));
    }

    People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype.onContentRendered.call(this, state);
};

People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the self-page is being disposed.
    /// </summary>
    if (this._content$2 != null) {
        if (this._isHtml5Player$2) {
            // pause the element to make sure we halt playback.
            var element = this._content$2.element;
            if (element != null) {
                element.pause();
            }

        }
        else {
            // clear out the source to prevent further playback.
            var element = this._content$2.element;
            if (element != null) {
                element.src = 'about:blank';
            }        
        }

        this._content$2.dispose();
        this._content$2 = null;
    }

    People.RecentActivity.UI.SelfPage.SelfPageEntryItem.prototype.onDisposed.call(this);
};

People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype._renderContent$2 = function() {
    if (this._content$2 == null) {
        People.RecentActivity.UI.Core.GlobalProgressControl.add(this);
        // get the data, and try to map the video to something we can display inline.
        // if we can't convert the entry, we simply open up the URL in x-ms-webview.
        var data = this.entry.data;
        if (data.sourceType === People.RecentActivity.FeedEntryVideoType.raw) {
            this._isHtml5Player$2 = true;
            // this is a raw video, that we should attempt to play using a <video> tag.
            var video = document.createElement('video');
            video.autoplay = true;
            video.controls = true;
            video.className = 'ra-selfPageVideoPlayer';
            video.src = data.sourceUrl;
            this._content$2 = new People.RecentActivity.UI.Core.Control(video);
            this._content$2.attach('play', this._onLoaded$2.bind(this));
        }
        else {
            // attempt to get an embedded player URL.
            var embedUrl = People.RecentActivity.UI.SelfPage.SelfPageVideoItem._getEmbeddedPlayerUrl$2([ data.displayUrl, data.sourceUrl ]);
            var frame = document.createElement('x-ms-webview');

            frame.className = 'ra-selfPageVideoFrame';
            if (embedUrl == null) {
                // couldn't convert the URL to an embedded player URL, use the page URL.
                frame.src = data.displayUrl;
            }
            else {
                frame.setAttribute('allowfullscreen', 'allowfullscreen');
                frame.src = embedUrl;
            }

            this._content$2 = new People.RecentActivity.UI.Core.Control(frame);
            this._content$2.attach('MSWebViewNavigationCompleted', this._onLoaded$2.bind(this));
        }
    }
};

People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype._onVideoMetadataLoaded$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    if (this._state$2 != null) {
        var element = this._content$2.element;
        element.autoplay = !this._state$2.p && !this._state$2.s;
        element.currentTime = this._state$2.o;
    }
};

People.RecentActivity.UI.SelfPage.SelfPageVideoItem.prototype._onLoaded$2 = function(ev) {
    /// <param name="ev" type="Event"></param>
    Debug.assert(ev != null, 'ev != null');
    // when we've loaded the resource, we can remove the progress element.
    People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\..\Model\FeedObject.js" />

People.RecentActivity.UI.SelfPage.SelfPageRefresherState = function(obj, refresher) {
    /// <summary>
    ///     Provides a thin user state wrapper.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject"></param>
    /// <param name="refresher" type="People.RecentActivity.IRefreshable"></param>
    /// <field name="object" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="refresher" type="People.RecentActivity.IRefreshable">The refresher.</field>
    Debug.assert(obj != null, 'obj != null');
    Debug.assert(refresher != null, 'refresher != null');
    this.object = obj;
    this.refresher = refresher;
};


People.RecentActivity.UI.SelfPage.SelfPageRefresherState.prototype.object = null;
People.RecentActivity.UI.SelfPage.SelfPageRefresherState.prototype.refresher = null;
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Model\Events\FeedObjectActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="..\..\Model\FeedEntryType.js" />
/// <reference path="..\..\Model\FeedObject.js" />
/// <reference path="..\..\Model\FeedObjectType.js" />
/// <reference path="..\..\Model\Identity.js" />
/// <reference path="..\Core\Controls\ErrorMessageContext.js" />
/// <reference path="..\Core\Controls\ErrorMessageControl.js" />
/// <reference path="..\Core\Controls\ErrorMessageLocation.js" />
/// <reference path="..\Core\Controls\ErrorMessageOperation.js" />
/// <reference path="..\Core\Controls\GlobalProgressControl.js" />
/// <reference path="SelfPageRefresherState.js" />

People.RecentActivity.UI.SelfPage.SelfPageRefresher = function(identity) {
    /// <summary>
    ///     Provides a class for refreshing objects.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity"></param>
    /// <field name="_objects" type="Object">The objects we're refreshing.</field>
    /// <field name="_userstates" type="Object">The user states.</field>
    /// <field name="_errors" type="People.RecentActivity.UI.Core.ErrorMessageControl">The error message.</field>
    Debug.assert(identity != null, 'identity');

    this._errors = new People.RecentActivity.UI.Core.ErrorMessageControl(identity, People.RecentActivity.UI.Core.ErrorMessageContext.none, People.RecentActivity.UI.Core.ErrorMessageOperation.read);
    this._errors.addClass('ra-selfPageBar');
    this._errors.location = People.RecentActivity.UI.Core.ErrorMessageLocation.messageBar;

    this._objects = {};

    this._userstates = {};
};

Jx.mix(People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype, Jx.Events);
Jx.mix(People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype, "refreshcompleted");

People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype._objects = null;
People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype._userstates = null;
People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype._errors = null;

People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the object.
    /// </summary>
    this._errors.dispose();

    for (var k in this._objects) {
        // for each of the entries in the list, detach and remove it from the progress stack.
        var list = this._objects[k];

        for (var i = 0, len = list.length; i < len; i++) {
            var state = list[i];
                state.refresher.removeListenerSafe("refreshcompleted", this._onRefreshCompleted, this);

            People.RecentActivity.UI.Core.GlobalProgressControl.remove(state);
        }

        list.length = 0;
    }

    People.Social.clearKeys(this._objects);
    People.Social.clearKeys(this._userstates);
};

People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype.refresh = function(obj, userState) {
    /// <summary>
    ///     Refreshes an object.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The object to refresh.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(obj != null, 'obj != null');

    var id = this._getStateId(obj);

    if (!Jx.isUndefined(this._objects[id])) {
        // we're still refreshing this object. go away.
        return;
    }

    // mark this object as being refreshing.
    switch (obj.objectType) {
        case People.RecentActivity.FeedObjectType.photo:
            // also refresh the photo itself to retrieve the photo tags.
            this._refreshObject(obj, obj, userState);
            break;

        case People.RecentActivity.FeedObjectType.photoAlbum:
            // don't refresh the album if its a fake album -- i.e. an album we got just because
            // someone was tagged or shared it, but we can't actually get the real one.
            if (!obj.isFakeAlbum) {
                this._refreshObject(obj, obj, userState);
            }

            break;

        case People.RecentActivity.FeedObjectType.entry:
            switch (obj.entryType) {
                case People.RecentActivity.FeedEntryType.photo:
                    // also refresh the photo associated with this entry.
                    this.refresh(entry.data.photo, userState);
                    break;

                case People.RecentActivity.FeedEntryType.photoAlbum:
                    // also refresh the album associated with this entry.
                    this.refresh(entry.data.album, userState);
                    break;
            }

            break;
    }

    // once we've done all that we can refresh the normal stuff.
    this._refreshObject(obj, obj.comments, userState);
    this._refreshObject(obj, obj.reactions, userState);
};

People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype._getStateId = function(obj) {
    /// <param name="obj" type="People.RecentActivity.FeedObject"></param>
    /// <returns type="String"></returns>
    Debug.assert(obj != null, 'obj != null');

    if (obj.objectType === People.RecentActivity.FeedObjectType.photoAlbum) {
        return obj.albumId;
    }

    return obj.id;
};

People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype._refreshObject = function(obj, refreshable, userState) {
    /// <param name="obj" type="People.RecentActivity.FeedObject"></param>
    /// <param name="refreshable" type="People.RecentActivity.IRefreshable"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(obj != null, 'obj != null');
    Debug.assert(refreshable != null, 'refreshable != null');

    var id = this._getStateId(obj);

    this._userstates[id] = userState;

    if (Jx.isUndefined(this._objects[id])) {
        // create a new list of "pending transactions".
        this._objects[id] = [];
    }

    var state = new People.RecentActivity.UI.SelfPage.SelfPageRefresherState(obj, refreshable);

    // add the state to the list of stuff we're tracking.
    var list = this._objects[id];
        list.push(state);

    People.RecentActivity.UI.Core.GlobalProgressControl.add(state);

    // once the bookkeeping is in place we can actually refresh the thing.
    refreshable.addListener("refreshcompleted", this._onRefreshCompleted, this);
    refreshable.refresh(state);
};

People.RecentActivity.UI.SelfPage.SelfPageRefresher.prototype._onRefreshCompleted = function(e) {
    /// <param name="e" type="People.RecentActivity.RefreshActionCompletedEventArgs"></param>
    Debug.assert(e != null, 'e != null');

    var state = e.userState;

    // do a quick check to see if this is really our state.
    if ((state != null) && !Jx.isNullOrUndefined(state.object) && !Jx.isNullOrUndefined(state.refresher)) {
        // okay, we know this is a valid state, let's first get rid of the event handler.
        state.refresher.removeListenerSafe("refreshcompleted", this._onRefreshCompleted, this);

        // don't forget the progress bar.
        People.RecentActivity.UI.Core.GlobalProgressControl.remove(state);

        // remove the state from the associated object, and check if we're done.
        var id = this._getStateId(state.object);

        var list = this._objects[id];
        if (list !== null) {
            var index = list.indexOf(state);
            if (index !== -1) {
                list.splice(index, 1);

                if (!list.length) {
                    // remove the list completely, and then invoke the appropriate event.
                    delete this._objects[id];

                    var result = e.result;
                    if (result.code !== People.RecentActivity.Core.ResultCode.success) {
                        // we need to display an error.
                        this._errors.show(e.result);
                    }

                    var userState = this._userstates[id];
                    delete this._userstates[id];

                    this.raiseEvent("refreshcompleted", new People.RecentActivity.FeedObjectActionCompletedEventArgs(this, result, state.object, userState));
                }
            }
        }
    }
};
});