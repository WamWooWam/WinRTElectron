
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "FolderFlyout", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform,
        ViewItems = Mail.ViewItems,
        ViewFilters = Mail.ViewFilters,
        FolderFlyoutItem, FolderFlyoutSection;

    var excluded = ".folderFlyout.wideNav .section.Pinned *";
    var FolderFlyout = Mail.FolderFlyout = function(switcher, account, jobSet) {
        // Builds the list of folders for the flyout from the nav pane
        Debug.assert(Jx.isObject(switcher));
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(Jx.isNullOrUndefined(jobSet) || Jx.scheduler.isValidJobSet(jobSet));

        this.initComponent();
        this._switcher = switcher;
        this._account = account;
        this._hooks = null;
        this._views = null;
        this._categories = null;
        this._pinned = null;
        var list = this._list = new Jx.List({
            requestAnimation: this.requestAnimation.bind(this, null),
            jobSet: jobSet
        });
        var ariaFlows = this._ariaFlows = new Mail.AriaFlows(list, excluded);
        this.append(ariaFlows);
        this._element = null;
    };
    Jx.augment(FolderFlyout, Jx.Component);

    FolderFlyout.prototype.getUI = function (ui) {
        var account = this._account,
            views = this._views = account.queryViews(P.MailViewScenario.allFolders, "folderFlyout"),
            folders = ViewFilters.filterByType(views, ViewFilters.folders),
            categories = this._categories = ViewFilters.filterByType(views, ViewFilters.categories),
            pinned = this._pinned = ViewFilters.filterPinned(folders);

        this._list.setSource(new Mail.ArrayCollection([
            new FolderFlyoutSection(Mail.ViewHierarchy.wrapFlat(categories), "Categories", this),
            new FolderFlyoutSection(Mail.ViewHierarchy.wrapFlat(pinned), "Pinned", this),
            new FolderFlyoutSection(Mail.TreeFlattener.create(folders), "All", this)
        ]));

        var wideNavClass = this._switcher.isWide ? "wideNav" : "";
        ui.html = "<div id='" + this._id + "' class='folderFlyout viewFlyout " + wideNavClass + "' role='listbox'>" +
                      "<div class='inhibitTouchHover'></div>" +
                      Jx.getUI(this._ariaFlows).html +
                  "</div>";
    };

    FolderFlyout.prototype.onActivateUI = function () {
        var element = this._element = document.getElementById(this._id);

        this._hooks = new Mail.Disposer(this._views, this._categories, this._pinned,
            new Jx.KeyboardNavigation(element, "vertical", this, excluded),
            new Jx.PressEffect(element, ".folder, .content", [ "className" ], ".inhibitTouchHover"),
            new Mail.EventHook(this._switcher, "widthChanged", this._onSwitcherWidthChange, this)
        );
    };

    FolderFlyout.prototype.onDeactivateUI = function () {
        Jx.dispose(this._hooks);
    };

    FolderFlyout.prototype.beforeShow = Jx.fnEmpty;
    FolderFlyout.prototype.afterHide = Jx.fnEmpty;

    FolderFlyout.prototype.selectView = function (view) {
        this._switcher.selectView(view);
    };

    FolderFlyout.prototype.waitForAnimation = function () {
        return this._list.waitForAnimation();
    };

    FolderFlyout.prototype.requestAnimation = function (component) {
        return this.waitForAnimation().then(function () {
            return this._list.getAffectedElements(component);
        }.bind(this));
    };

    FolderFlyout.prototype._onSwitcherWidthChange = function () {
        Jx.setClass(this._element, "wideNav", this._switcher.isWide);
        this.fire("contentUpdated");
    };

    FolderFlyoutSection = function(collection, title, flyout) {
        // List of folders with title the flyout
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isNonEmptyString(title));
        Debug.assert(Jx.isObject(flyout));

        this.initComponent();
        this._flyout = flyout;
        this._title = title;
        this._collection = collection;

        var list = this._list = new Jx.List({
            factory: function (node) {
                if (node.objectId === "header") {
                    return new HeaderItem("mailFolderFlyout" + title);
                } else if (node.view.type === P.MailViewType.outbox) {
                    return new OutboxFlyoutItem(node, flyout);
                }
                return new FolderFlyoutItem(node, flyout);
            },
            requestAnimation: this._requestAnimation.bind(this)
        });
        this.appendChild(list);

        list.setSource(new HeaderCollection({ objectId: "header" }, collection));

        this._hooks = null;
        this._element = null;
        this._animation = null;
    };
    Jx.augment(FolderFlyoutSection, Jx.Component);

    FolderFlyoutSection.prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='section " + this._title + "'>" +
                      Jx.getUI(this._list).html +
                  "</div>";
    };

    FolderFlyoutSection.prototype.onActivateUI = function () {
        var element = this._element = document.getElementById(this._id);

        this._hooks = new Mail.Disposer(
            new Jx.Clicker(element, this._onClick, this),
            new Mail.EventHook(element, "contextmenu", this._onClick, this),
            new Mail.EventHook(element, "MSHoldVisual", function (ev) { ev.preventDefault(); }), // prevent the context menu hint
            new Mail.EventHook(element, "maildrop", this._onDrop, this),
            new Mail.Disposable(Jx.observeMutation(element, {
                attributes: true,
                subtree: true,
                attributeFilter: [ "aria-checked" ]
            }, this._onAttributeChange, this), "disconnect")
        );

        this._collection.unlock();
    };

    FolderFlyoutSection.prototype.onDeactivateUI = function () {
        Jx.dispose(this._hooks);
    };

    FolderFlyoutSection.prototype.waitForAnimation = function () {
        return this._list.waitForAnimation();
    };

    FolderFlyoutSection.prototype._requestAnimation = function () {
        return this._flyout.requestAnimation(this);
    };

    FolderFlyoutSection.prototype._onClick = function (ev) {
        // Delegate click events to the child object
        var child = this._list.getTarget(ev);
        if (child) {
            child.onClick(ev);
        }
    };

    FolderFlyoutSection.prototype._onAttributeChange = function (mutations) {
        mutations.forEach(function (mutation) {
            var target = this._list.getTarget(mutation);
            if (target) {
                target.onAttributeChange(mutation);
            }
        }, this);
    };

    FolderFlyoutSection.prototype._onDrop = function (ev) {
        // Delegate drop events to the child object
        var child = this._list.getTarget(ev);
        if (child) {
            child.onDrop(ev);
        }
    };

    FolderFlyoutSection.prototype.shutdownComponent = function () {
        Jx.dispose(this._collection);
        Jx.Component.prototype.shutdownComponent.call(this);
    };


    FolderFlyoutItem = function (node, flyout) {
        // Represents an individual folder in the flyout UI. Renders the name, notification
        // count, and an icon for toggling the pin state for the folder in the nav pane.
        Debug.assert(Jx.isObject(flyout));
        Debug.assert(Jx.isInstanceOf(node.view, Mail.UIDataModel.MailView));

        this.initComponent();
        this._node = node;
        this._flyout = flyout;
        this._element = null;

        var view = node.view;
        this._count = new Mail.BoundElements.ViewCount(view);
        this._name = new Mail.BoundElements.ViewName(view);
        this._star = new Mail.BoundElements.ViewPinner(view, "mailPinFolderLabel", "mailUnpinFolderLabel");
        this.append(this._count, this._name, this._star);
    };
    Jx.augment(FolderFlyoutItem, Jx.Component);

    FolderFlyoutItem.prototype.getUI = function (ui) {
        var node = this._node,
            view = node.view,
            error = this._getError();

        ui.html = "<div" +
                      " id='" + this._id + "'" +
                      " class='folder" + (Mail.ViewCapabilities.canMoveTo(view) ? " draghoverable'" : " inhibitDrop'") +
                  ">" +
                      "<div" +
                          " class='content " + (error ? "error " : "") + "depth" + node.depth + "'" +
                          " tabIndex='-1'" +
                          " aria-label='" + Jx.escapeHtml(ViewItems.getLabel(view, error)) + "'" +
                          " title='" + Jx.escapeHtml(view.name) + "'" +
                          " role='option'" +
                      ">" +
                          Jx.getUI(this._name).html +
                          Jx.getUI(this._count).html +
                      "</div>" +
                      Jx.getUI(this._star).html +
                  "</div>";
    };

    FolderFlyoutItem.prototype.updateLabel = function () {
        var element = this._getElement(),
            view = this._node.view;
        Mail.setAttribute(element, "aria-label", ViewItems.getLabel(view, this._getError()));
        Mail.setAttribute(element, "title", view.name);
    };

    FolderFlyoutItem.prototype.onClick = function (ev) {
        // The star will handle the pin/unpin action if the click event was
        // targetted at their element, otherwise switch to the new view.
        if (!this._star.onClick(ev)) {
            this._flyout.selectView(this._node.view);
        }
    };

    FolderFlyoutItem.prototype.onAttributeChange = function (mutation) {
        this._star.onAttributeChange(mutation);
    };

    FolderFlyoutItem.prototype.onDrop = function (ev) {
        var detail = ev.detail;
        Debug.assert(Jx.isInstanceOf(detail.selection, Mail.Selection));
        Mail.moveWithConfirmation(detail.selection, this._node.view, detail.messages);
    };

    FolderFlyoutItem.prototype._getElement = function () {
        return this._element || (this._element = document.querySelector("#" + this._id + " .content"));
    };

    FolderFlyoutItem.prototype._getError = function () { return ""; };

    function OutboxFlyoutItem(node, flyout) {
        FolderFlyoutItem.call(this, node, flyout);
        var view = node.view,
            mailManager = view.platform.mailManager;

        var stuck = this._stuck = new Mail.CollectionCounter(
            new Mail.ScheduledQueryCollection(
                mailManager.getPermanentlyFailedMessageCollection,
                mailManager,
                [view.account.objectId],
                Mail.Priority.updateView,
                Jx.scheduler,
                "stuck-in-outbox")
        );
        stuck.unlock();

        this._disposer = new Mail.Disposer(stuck, new Mail.EventHook(stuck, "collectionchanged", this._onCollectionChanged, this));
    }
    Jx.inherit(OutboxFlyoutItem, FolderFlyoutItem);

    OutboxFlyoutItem.prototype.shutdownComponent = function () {
        Jx.dispose(this._disposer);
        FolderFlyoutItem.prototype.shutdownComponent.call(this);
    };

    OutboxFlyoutItem.prototype._getError = function () {
        return this._stuck.count > 0 ? Jx.res.getString("mailAttentionNeeded") : "";
    };

    OutboxFlyoutItem.prototype._onCollectionChanged = function () {
        Jx.setClass(this._getElement(), "error", this._stuck.count > 0);
        this.updateLabel();
    };

    function HeaderItem(title) {
        this.initComponent();
        this._title = title;
    }
    Jx.augment(HeaderItem, Jx.Component);
    HeaderItem.prototype.getUI = function (ui) {
        ui.html = "<div class='header' role='heading'>" +
                      Jx.escapeHtml(Jx.res.getString(this._title)) +
                  "</div>";
    };
    HeaderItem.prototype.onClick = Jx.fnEmpty;
    HeaderItem.prototype.onAttributeChange = Jx.fnEmpty;
    HeaderItem.prototype.onDrop = Jx.fnEmpty;

    function HeaderCollection(header, items) {
        this._items = items;
        this._header = header;

        var array = this._array = new Mail.ArrayCollection(items.count ? [header] : []);
        array.unlock();

        Mail.CollectionWrapper.call(this, new Mail.ConcatenatedCollection([array, items]));
    }
    Jx.inherit(HeaderCollection, Mail.CollectionWrapper);

    HeaderCollection.prototype.item = function (index) {
        return this._collection.item(index);
    };

    HeaderCollection.prototype._onCollectionChanged = function (ev) {
        // Forward the event
        this._raiseChange({
            eType: ev.eType,
            objectId: ev.objectId,
            index: ev.index,
            previousIndex: ev.previousIndex,
        });

        // Add or remove the header if necessary
        var items = this._items, array = this._array;
        if (array.count === 1 && items.count === 0) {
            array.removeItem(0);
        } else if (array.count === 0 && items.count > 0) {
            array.insertItem(this._header, 0);
        }
    };

});
