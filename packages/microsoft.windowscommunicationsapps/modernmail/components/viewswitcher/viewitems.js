
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft,WinJS*/

Jx.delayDefine(Mail, "ViewItems", function () {
    "use strict";

    // Example view switcher
    //
    //     Inbox: inbox view
    //          FolderItem: newsletter view
    //          FolderItem: social view
    //          FolderItem: pinned folder view
    //          FlyoutItem: no backing view
    //     ViewIcon: newsletter view (only visible in skinny)
    //     ViewIcon: social view (only visible in skinny)
    //     FoldersIcon: no backing view (only visible in skinny)
    //     Favorites group: allPinnedPeople view
    //         PersonItem: person view
    //         PersonItem: person view
    //         FlyoutItem: no backing view
    //     ViewIcon: flagged view
    //
    var Plat = Microsoft.WindowsLive.Platform,
        MailViewType = Plat.MailViewType,
        MailView = Mail.UIDataModel.MailView,
        Filters = Mail.ViewFilters,
        Elements = Mail.BoundElements;

    var ViewItems = Mail.ViewItems = {
        create: function (switcher, platform, topLevel, view) {
            Debug.assert(Jx.isObject(switcher));
            Debug.assert(Jx.isObject(platform));
            Debug.assert(Jx.isBoolean(topLevel));
            Debug.assert(Jx.isObject(view));

            var item = null;
            if (view) {
                switch (view.objectType) {
                case "MailView":
                    switch (view.type) {
                    case MailViewType.inbox:
                        item = new Inbox(switcher, platform, view);
                        break;
                    case MailViewType.flagged:
                        item = new ViewIcon(switcher, view, "flagged");
                        break;
                    case MailViewType.newsletter:
                        if (topLevel) {
                            item = new ViewIcon(switcher, view, "newsletter");
                        } else {
                            item = new FolderItem(switcher, view);
                        }
                        break;
                    case MailViewType.social:
                        if (topLevel) {
                            item = new ViewIcon(switcher, view, "social");
                        } else {
                            item = new FolderItem(switcher, view);
                        }
                        break;
                    case MailViewType.allPinnedPeople:
                        item = new Favorites(switcher, platform, view);
                        break;
                    case MailViewType.person:
                        item = new PersonItem(switcher, view);
                        break;
                    case MailViewType.outbox:
                        item = new OutboxItem(switcher, view);
                        break;
                    default:
                        item = new FolderItem(switcher, view);
                        break;
                    }
                    break;
                case "FoldersIcon":
                    item = new FoldersIcon(switcher, platform);
                    break;
                case "MorePeople":
                    item = new FlyoutItem(switcher, "morePeople", "mailViewsMorePeople", "people", Filters.people);
                    break;
                case "MoreFolders":
                    item = new FlyoutItem(switcher, "moreFolders", "mailViewsMoreFolders", "folders", Filters.folders.concat(Filters.categories));
                    break;
                }
            }
            return item;
        }
    };

    ViewItems.getLabel = function (view, error) {
        var count = view.notificationCount;
        var template = (count === 1) ? "mailFolderListAriaTemplateSingular" : "mailFolderListAriaTemplatePlural";
        if ([ MailViewType.draft, MailViewType.outbox, MailViewType.flagged ].indexOf(view.type) !== -1) {
            template = (count === 1) ? "mailFolderListOutboxDraftAriaTemplateSingular" : "mailFolderListOutboxDraftAriaTemplatePlural";
        }
        return Jx.res.loadCompoundString(template, view.name, count, error || "");
    };

    function BaseItem(switcher, view) {
        Debug.assert(Jx.isObject(switcher));
        Debug.assert(Jx.isNullOrUndefined(view) || Jx.isInstanceOf(view, MailView));

        this.initComponent();

        this._switcher = switcher;
        this._view = view;
        this._activated = false;
        this._selected = false;

        if (view) {
            var count = this._count = new Elements.ViewCount(view);
            this.appendChild(count);
        }
    }
    Jx.augment(BaseItem, Jx.Component);
    BaseItem.prototype._getClassName = function (className) {
        var view = this._view;
        return className + " item" + (this._selected ? " selected": "") +
            (view ? (Mail.ViewCapabilities.canMoveTo(view) ? " draghoverable" : " inhibitDrop") : "");
    };
    BaseItem.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        this._activated = true;
    };
    BaseItem.prototype._getComponentElement = function () {
        ///<returns>The root element of this component</returns>
        return document.getElementById(this._id);
    };
    BaseItem.prototype._getActiveElement = function () {
        ///<returns>The element for the active item.  This is the element that should have aria and selection applied.</returns>
        return this._getComponentElement();
    };
    BaseItem.prototype._getElement = function (selector) {
        Debug.assert(Jx.isNonEmptyString(selector));
        var component = this._getComponentElement();
        return component && component.querySelector(selector);
    };
    BaseItem.prototype.setSelected = function (selected) {
        Debug.assert(Jx.isBoolean(selected));
        var element = null;
        this._selected = selected;
        if (this._activated) {
            element = this._getActiveElement();
            if (element) {
                Jx.setClass(element, "selected", selected);
                Mail.setAttribute(element, "aria-selected", selected ? "true" : "false");
            }
        }
        return element;
    };
    BaseItem.prototype._onInvoke = function (ev) {
        if (ev.type !== "contextmenu" || !this._selected) {
            this._switcher.selectView(this._view);
        }
    };
    BaseItem.prototype.onClick = function (ev) {
        if (Mail.isElementOrDescendant(ev.target, this._getActiveElement())) {
            this._onInvoke(ev);
        }
    };
    BaseItem.prototype.onKeyDown = function (ev) {
        var key = ev.key;
        if (key === "Spacebar" || key === "Enter") {
            this._onInvoke(ev);
            ev.stopPropagation();
            ev.preventDefault();
        }
    };
    BaseItem.prototype.onAttributeChange = function (mutation) {
        if (mutation.attributeName === "aria-selected") {
            var element = this._getActiveElement();
            var newValue = (element.getAttribute("aria-selected") === "true");
            if (newValue !== this._selected) {
                if (newValue) {
                    this._onInvoke(mutation);
                } else {
                    // Deselection isn't a concept we support
                    Mail.setAttribute(element, "aria-selected", "true");
                }
            }
        }
    };
    BaseItem.prototype.onDrop = function (ev) {
        var view = this._view;
        if (view) {
            var detail = ev.detail;
            Debug.assert(Jx.isInstanceOf(detail.selection, Mail.Selection));
            Mail.moveWithConfirmation(detail.selection, view, detail.messages);
        }
    };
    BaseItem.prototype.offerSelection = function (type, view) {
        Debug.assert(Jx.isValidNumber(type));
        Debug.assert(Jx.isNullOrUndefined(view) || Jx.isInstanceOf(view, MailView));

        if (view && MailView.areEqual(view, this._view)) {
            return this;
        }
        return null;
    };
    BaseItem.prototype.updateLabel = function () {
        Mail.setAttribute(this._getActiveElement(), "aria-label", this._getLabel());
    };
    BaseItem.prototype._getLabel = function () {
        return this._view ? ViewItems.getLabel(this._view) : "";
    };
    BaseItem.prototype._getAttributes = function (className, title) {
        Debug.assert(Jx.isNonEmptyString(className));
        Debug.assert(Jx.isNullOrUndefined(title) || Jx.isString(title));

        var label = this._getLabel();
        return " class='" + this._getClassName(className) + "'" +
               (label ? (" aria-label='" + Jx.escapeHtml(label) + "'") : "") +
               (title ? (" title='" + Jx.escapeHtml(title) + "'") : "") +
               " aria-selected='" + (this._selected ? "true" : "false") + "'" +
               " role='option'" +
               " tabIndex='-1'";
    };

    function ViewIcon(switcher, view, className) {
        ///<summary>ViewIcon represents one of the basic icons in the nav pane:  Inbox, Flagged, Newsletter and Social updates</summary>
        Debug.assert(Jx.isInstanceOf(view, MailView));
        Debug.assert(Jx.isNonEmptyString(className));

        BaseItem.call(this, switcher, view);

        this._className = className;
    }
    Jx.inherit(ViewIcon, BaseItem);
    ViewIcon.prototype.getUI = function (ui) {
        ui.html = "<div" +
                      " id='" + this._id + "'" +
                      this._getAttributes(this._className, this._view.name) +
                  ">" +
                      "<div class='content'>" +
                          "<div class='icon icon-" + this._className + "'></div>" +
                          Jx.getUI(this._count).html +
                      "</div>" +
                  "</div>";
    };

    function PersonItem(switcher, view) {
        /// <summary>Represents a MailView backed by a Person object</summary>
        Debug.assert(Jx.isInstanceOf(view, MailView));
        BaseItem.call(this, switcher, view);

        var name = this._name = new Elements.ViewName(view);
        this.appendChild(name);
    }
    Jx.inherit(PersonItem, BaseItem);
    PersonItem.prototype.getUI = function (ui) {
        ui.html = "<div" +
                      " id='" + this._id + "'" +
                      this._getAttributes("person", this._view.name) +
                  ">" +
                      "<div class='content'>" +
                          Jx.getUI(this._name).html +
                          Jx.getUI(this._count).html +
                      "</div>" +
                  "</div>";
    };
    PersonItem.prototype.updateLabel = function () {
        BaseItem.prototype.updateLabel.call(this);
        Mail.setAttribute(this._getActiveElement(), "title", this._view.name);
    };

    function FlyoutItem(switcher, className, title, flyout, viewTypes) {
        /// <summary>A simple text item that pops a flyout</summary>
        Debug.assert(Jx.isObject(switcher));
        Debug.assert(Jx.isNonEmptyString(className));
        Debug.assert(Jx.isNonEmptyString(title));
        Debug.assert(Jx.isNonEmptyString(flyout));
        Debug.assert(Jx.isArray(viewTypes));
        this._className = className;
        this._title = title;
        this._flyout = flyout;
        this._viewTypes = viewTypes;
        BaseItem.call(this, switcher);
    }
    Jx.inherit(FlyoutItem, BaseItem);
    FlyoutItem.prototype.getUI = function (ui) {
        var titleString = Jx.res.getString(this._title);
        ui.html = "<div" +
                      " id='" + this._id + "'" +
                      this._getAttributes(this._className + " inhibitDrop", titleString) +
                  ">" +
                      "<div class='content'>" +
                          "<div class='name'>" +
                              Jx.escapeHtml(titleString) +
                          "</div>" +
                      "</div>" +
                  "</div>";
    };
    FlyoutItem.prototype._onInvoke = function (ev) {
        if (ev.type !== "contextmenu") {
            this._switcher.getFlyout(this._flyout).show({ viaKeyboard: ev.type === "keydown" });
        }
    };
    FlyoutItem.prototype.offerSelection = function (type, view) {
        Debug.assert(Jx.isValidNumber(type));
        Debug.assert(Jx.isNullOrUndefined(view) || Jx.isInstanceOf(view, MailView));

        return (this._viewTypes.indexOf(type) !== -1) ? this : null;
    };

    function FolderItem(switcher, view) {
        /// <summary>Represents a MailView backed by a Folder object</summary>
        Debug.assert(Jx.isInstanceOf(view, MailView));
        BaseItem.call(this, switcher, view);

        var name = this._name = new Elements.ViewName(view);
        this.appendChild(name);
    }
    Jx.inherit(FolderItem, BaseItem);
    FolderItem.prototype.getUI = function (ui) {
        ui.html = "<div" +
                      " id='" + this._id + "'" +
                      this._getAttributes("folder", this._view.name) +
                  ">" +
                      "<div class='content'>" +
                          Jx.getUI(this._name).html +
                          Jx.getUI(this._count).html +
                      "</div>" +
                  "</div>";
    };
    FolderItem.prototype.updateLabel = function () {
        BaseItem.prototype.updateLabel.call(this);
        Mail.setAttribute(this._getActiveElement(), "title", this._view.name);
    };

    function OutboxItem(switcher, view) {
        FolderItem.call(this, switcher, view);
        var mailManager = view.platform.mailManager;

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
    Jx.inherit(OutboxItem, FolderItem);
    OutboxItem.prototype.shutdownComponent = function () {
        Jx.dispose(this._disposer);
        FolderItem.prototype.shutdownComponent.call(this);
    };
    OutboxItem.prototype._getLabel = function () {
        var error = this._stuck.count > 0 ? Jx.res.getString("mailAttentionNeeded") : "";
        return ViewItems.getLabel(this._view, error);
    };
    OutboxItem.prototype._getClassName = function (className) {
        return FolderItem.prototype._getClassName.call(this, className) +
            (this._stuck.count > 0 ? " error" : "");
    };
    OutboxItem.prototype._onCollectionChanged = function () {
        Jx.setClass(this._getComponentElement(), "error", this._stuck.count > 0);
        this.updateLabel();
    };

    function BaseGroup(switcher, platform, view, collection, className, title) {
        ///<summary>A header and a collapsible group of children</summary>
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isNonEmptyString(className));
        Debug.assert(Jx.isNonEmptyString(title));
        BaseItem.call(this, switcher, view);

        this._className = className;
        this._title = title;

        var settingName = this._settingName = className + "Collapsed";
        this._userExpanded = !this._switcher.getSettings().get(settingName);

        this._collection = collection;
        collection.unlock();

        var list = this._list = new Jx.List({
            role: null,
            factory: ViewItems.create.bind(null, switcher, platform, false /* not top level */),
            requestAnimation: this._requestAnimation.bind(this)
        });
        this._list.setSource(this._collection);
        this.appendChild(list);
        this._hooks = null;

        if (!this._isExpanded()) {
            this._list.disableAnimations();
        }
        this._animation = null;
    }
    Jx.inherit(BaseGroup, BaseItem);

    function getChevronText(expanded) {
        return expanded ? "\ue09c" : "\ue09d";
    }

    BaseGroup.prototype._canExpand = function () {
        /// <returns type="Boolean">True if the section should allow for expand collapse.  This is based on
        /// whether the nav pane is in wide mode, but derived types may override based on available content
        /// or sync state.</returns>
        return this._switcher.isWide;
    };

    BaseGroup.prototype._isExpanded = function () {
        /// <returns type="Boolean">True if the section should be expanded.  This is based on the values in
        /// canExpand, as well as the user's option to collapse the section.  Note that the UI may not
        /// necessarily be expanded, it may be in the process of animating to an expanded state.</returns>
        return this._canExpand() && this._userExpanded;
    };

    BaseGroup.prototype.getUI = function (ui) {
        var canExpand = this._canExpand(),
            isExpanded = this._isExpanded(),
            ariaExpanded = "";
        if (canExpand) {
            ariaExpanded = " aria-expanded='" + isExpanded + "'";
        }

        ui.html = "<div id='" + this._id + "' class='group'>" +
                      "<div" +
                          this._getAttributes(this._className) +
                          ariaExpanded +
                      ">" +
                          "<div" +
                              " class='chevron" + (canExpand ? "" : " hidden") + "'" +
                              " title='" + Jx.escapeHtml(this._getChevronLabel(isExpanded)) + "'" +
                          ">" +
                              Jx.escapeHtml(getChevronText(isExpanded)) +
                          "</div>" +
                          "<div" +
                              " class='content'" +
                              " title='" + Jx.escapeHtml(Jx.res.getString(this._title)) + "'" +
                          ">" +
                              "<div class='icon icon-" + this._className + "'></div>" +
                              Jx.getUI(this._count).html +
                          "</div>" +
                      "</div>" +
                      "<div class='children" + (isExpanded ? "" : " collapsed-wide") + "'>" +
                          Jx.getUI(this._list).html +
                      "</div>" +
                  "</div>";
    };

    BaseGroup.prototype.activateUI = function () {
        BaseItem.prototype.activateUI.call(this);

        var switcher = this._switcher;
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(switcher, "widthChanged", this._onWidthChanged, this)
        );
    };

    BaseGroup.prototype.deactivateUI = function () {
        var animation = this._animation;
        if (animation) {
            animation.cancel();
            Debug.assert(this._animation === null);
        }
        BaseItem.prototype.deactivateUI.call(this);
        Jx.dispose(this._hooks);
    };

    BaseGroup.prototype.shutdownComponent = function () {
        BaseItem.prototype.shutdownComponent.call(this);
        Jx.dispose(this._collection);
    };

    BaseGroup.prototype._getActiveElement = function () {
        return this._getElement("." + this._className);
    };

    BaseGroup.prototype.onClick = function (ev) {
        var child = this._list.getTarget(ev);
        if (child) {
            child.onClick(ev);
        } else if (ev.target.classList.contains("chevron")) {
            // A click on our chevron causes an expand/collapse
            this._setExpanded(!this._isExpanded());
        } else {
            BaseItem.prototype.onClick.call(this, ev);
        }
    };

    BaseGroup.prototype.onKeyDown = function (ev) {
        var key = ev.key;
        if (key === "Left" || key === "Right") {
            if (this._canExpand() &&
                Mail.isElementOrDescendant(ev.target, this._getActiveElement())) {

                var expand = (key === mirrorKey("Right"));
                if (expand !== this._isExpanded()) {
                    this._setExpanded(expand);
                    ev.stopPropagation();
                    ev.preventDefault();
                    return;
                }
            }

            var elementToFocus;
            var activeElement = this._getActiveElement();
            if (activeElement.tabIndex === 0) { // If the root is focused, pressing right will navigate to a child
                if (key === mirrorKey("Right")) {
                    elementToFocus = this._list.getElement(0);
                }
            } else { // If a child is focused, pressing left will navigate to the parent
                if (key === mirrorKey("Left")) {
                    elementToFocus = activeElement;
                }
            }

            if (elementToFocus) {
                elementToFocus.tabIndex = 0;
                elementToFocus.focus();
            }
            ev.stopPropagation();
            ev.preventDefault();
        } else {
            var child = this._list.getTarget(ev);
            if (child) {
                child.onKeyDown(ev);
            } else {
                BaseItem.prototype.onKeyDown.call(this, ev);
            }
        }
    };

    BaseGroup.prototype.onDrop = function (ev) {
        /// <returns type="BaseItem">The BaseItem that handled the drop event</returns>
        var child = this._list.getTarget(ev);
        if (child) {
            child.onDrop(ev);
            return child;
        }

        // If the drop is not targeted at one of the children, the header (this) should handle it.
        BaseItem.prototype.onDrop.call(this, ev);
        return this;
    };

    BaseGroup.prototype.offerSelection = function (type, view) {
        Debug.assert(Jx.isValidNumber(type));
        Debug.assert(Jx.isNullOrUndefined(view) || Jx.isInstanceOf(view, MailView));

        var selection = BaseItem.prototype.offerSelection.call(this, type, view);

        if (!selection) {
            var list = this._list;
            for (var i = 0, len = list.getChildrenCount(); i < len; ++i) {
                selection = list.getChild(i).offerSelection(type, view);
                if (selection) {
                    break;
                }
            }
            if (selection && !this._isExpanded()) {
                // If we are collapsed and one of our children would normally take selection, take it on the group instead.
                selection = this;
            }
        }

        return selection;
    };

    BaseGroup.prototype._requestAnimation = function () {
        return this._switcher.requestAnimation(this).then(function (affectedElements) {
            return affectedElements.concat(this._getActiveElement());
        }.bind(this));
    };

    BaseGroup.prototype.onAttributeChange = function (mutation) {
        var element = this._getActiveElement();
        if (mutation.target === element && mutation.attributeName === "aria-expanded") {
            if (this._canExpand()) {
                var expanded = element.getAttribute("aria-expanded");
                if (Jx.isNonEmptyString(expanded)) {
                    var newExpanded = expanded === "true";
                    if (this._userExpanded !== newExpanded) {
                        this._setExpanded(newExpanded);
                    }
                }
            }
        } else {
            var child = this._list.getTarget(mutation);
            if (child) {
                child.onAttributeChange(mutation);
            } else {
                BaseItem.prototype.onAttributeChange.call(this, mutation);
            }
        }
    };

    BaseGroup.prototype._setExpanded = function (value) {
        /// <summary>Invoked when the user changes the expand/collapse state manually.  Records the operation and updates
        /// as appropriate</summary>
        this._userExpanded = value;
        this._switcher.getSettings().set(this._settingName, !value);
        this._expandCollapse();
    };

    BaseGroup.prototype._expandCollapse = function () {
        /// <summary>Any expand/collapse, whether invoked by the user, content changes, or wide/skinny switches, should
        /// invoke this method.  It will update the visibility and accessibility properties of the elements before
        /// invoking the expand/collapse animation (which will only run when appropriate).</summary>
        var canExpand = this._canExpand();
        var isExpanded = this._isExpanded();

        var activeElement = this._getActiveElement();
        if (canExpand) {
            Mail.setAttribute(activeElement, "aria-expanded", String(isExpanded));
        } else {
            activeElement.removeAttribute("aria-expanded");
        }

        var chevron = activeElement.querySelector(".chevron");
        Jx.setClass(chevron, "hidden", !canExpand);
        chevron.innerText = getChevronText(isExpanded);
        Mail.setAttribute(chevron, "title", this._getChevronLabel(isExpanded));

        if (!this._animation) {
            var animation = this._animation = this._switcher.requestAnimation(this).then(this._runAnimation.bind(this));
            var cleanup = (function () { this._animation = null; }).bind(this);
            animation.done(cleanup, cleanup);
        }
    };

    BaseGroup.prototype._runAnimation = function (affectedElements) {
        if (!this._switcher.isWide) {
            return null; // No animations in skinny mode
        }

        var children = this._getElement(".children"),
            classList = children.classList;
        var currentlyExpanded = !classList.contains("collapsed-wide");
        var shouldBeExpanded = this._isExpanded();
        if (currentlyExpanded !== shouldBeExpanded) {
            var animation;
            if (shouldBeExpanded) {
                animation = WinJS.UI.Animation.createExpandAnimation(children, affectedElements);
                classList.remove("collapsed-wide");
                this._list.enableAnimations(); // List is visible, it should resume animating
            } else {
                animation = WinJS.UI.Animation.createCollapseAnimation(children, affectedElements);
                classList.add("collapsing");
            }
            this.fire("contentUpdated");

            _markAsyncStart("BaseGroup._runAnimation");
            return Jx.Promise.cancelable(animation.execute()).then(function () {
                if (!shouldBeExpanded) {
                    classList.add("collapsed-wide");
                    classList.remove("collapsing");
                    this.fire("contentUpdated");
                    this._list.disableAnimations(); // List is hidden, it should update without animating
                }
                _markAsyncStop("BaseGroup._runAnimation");
                return this._runAnimation(affectedElements);
            }.bind(this));
        }
    };

    BaseGroup.prototype.waitForAnimation = function () {
        return WinJS.Promise.join([
            this._list.waitForAnimation(),
            Jx.Promise.fork(this._animation)
        ]);
    };

    BaseGroup.prototype._onWidthChanged = function () {
        Jx.setClass(this._getElement(".children"), "collapsed-skinny", !this._switcher.isWide);
        this.fire("contentUpdated");
        this._expandCollapse();
    };

    function FoldersIcon(switcher, platform) {
        ///<summary>FoldersIcon represents the folder icon in the nav pane in skinny mode</summary>
        BaseItem.call(this, switcher);
    }
    Jx.inherit(FoldersIcon, BaseItem);

    FoldersIcon.prototype.getUI = function (ui) {
        ui.html = "<div" +
                      " id='" + this._id + "'" +
                      this._getAttributes("folders", Jx.res.getString("mailViewsFolders")) +
                  ">" +
                      "<div class='content'>" +
                          "<div class='icon icon-folders'></div>" +
                      "</div>" +
                  "</div>";
    };

    FoldersIcon.prototype._onInvoke = function (ev) {
        if (ev.type !== "contextmenu") {
            this._switcher.getFlyout("folders").show({ viaKeyboard: ev.type === "keydown" });
        }
    };

    FoldersIcon.prototype.offerSelection = function (type, view) {
        Debug.assert(Jx.isValidNumber(type));
        Debug.assert(Jx.isNullOrUndefined(view) || Jx.isInstanceOf(view, MailView));

        return (Filters.folders.indexOf(type) !== -1 || Filters.categories.indexOf(type) !== -1) ? this : null;
    };


    function Favorites(switcher, platform, view) {
        ///<summary>Favorites represents the star icon in the nav pane, and its children</summary>
        var collection = new Mail.ConcatenatedCollection([
            Filters.sortPeople(Filters.filterByType(switcher.getViewCollection(), Filters.people, Filters.topLevel), platform),
            new Mail.ArrayCollection([ { objectType: "MorePeople", objectId: "MorePeople" } ])
        ]);

        this._account = view.account;
        BaseGroup.call(this, switcher, platform, view, collection, "favorites", "mailViewsFavorites");
    }
    Jx.inherit(Favorites, BaseGroup);

    Favorites.prototype.activateUI = function () {
        BaseGroup.prototype.activateUI.call(this);
        this._hooks.addMany(
            new Mail.EventHook(this._collection, "collectionchanged", this._onCollectionChange, this),
            new Mail.EventHook(this._account, "changed", this._onAccountChange, this)
        );
    };

    Favorites.prototype._canExpand = function () {
        /// <returns type="Boolean">True if the section should allow for expand collapse.  This is based on
        /// whether there is anything in the collection (ignoring the omnipresent "More" option) and whether
        /// the nav pane is in wide mode</returns>
        Debug.assert(this._collection.count >= 1); // Should always have a "More" option
        return BaseGroup.prototype._canExpand.call(this) && this._collection.count > 1 && this._account.peopleViewComplete;
    };

    Favorites.prototype._requestAnimation = function () {
        /// <summary>When the list of children wants to animate a change, it may be the last child (other than "more")
        /// going away.  We will preempt it's animations with our own expand collapse.</summary>
        this._expandCollapse();
        return BaseGroup.prototype._requestAnimation.call(this);
    };

    Favorites.prototype._onCollectionChange = function () {
        ///<summary>When the collection changes, we may auto-collapse or expand</summary>
        this._expandCollapse();
    };

    Favorites.prototype._onAccountChange = function (ev) {
        ///<summary>When people views are ready, we may auto-expand</summary>
        if (Mail.Validators.hasPropertyChanged(ev, "peopleViewComplete")) {
            this._expandCollapse();
        }
    };

    Favorites.prototype._onInvoke = function (ev) {
        if (this._canExpand() || !this._view.account.peopleViewComplete) {
            // A click on the element, when it could be expanded by clicking on the chevron, causes
            // a switch to the All Important view.
            BaseGroup.prototype._onInvoke.call(this, ev);
        } else if (ev.type !== "contextmenu") {
            // When expansion isn't possible (either because we are in skinny or have no pinned people), a click
            // causes the flyout to open.  Right-click never causes this.
            this._switcher.getFlyout("people").show({ viaKeyboard: ev.type === "keydown" });
        }
    };

    Favorites.prototype._getChevronLabel = function (expanded) {
        return Jx.res.getString(expanded ? "mailViewsFavoritesChevronCollapse" : "mailViewsFavoritesChevronExpand");
    };


    function Inbox(switcher, platform, view) {
        ///<summary>Inbox represents the envelope icon in the nav pane and its children</summary>
        var collection = new Mail.ConcatenatedCollection([
            Filters.topLevelSort(Filters.filterByType(switcher.getViewCollection(), Filters.categories)),
            Filters.sortFolders(Filters.filterByType(switcher.getViewCollection(), Filters.folders, [ MailViewType.inbox ])),
            new Mail.ArrayCollection([ { objectType: "MoreFolders", objectId: "MoreFolders" } ])
        ]);

        BaseGroup.call(this, switcher, platform, view, collection, "inbox", "mailFolderNameInbox");
    }
    Jx.inherit(Inbox, BaseGroup);

    Inbox.prototype.offerSelection = function (type, view) {
        // In skinny mode, the Inbox acts only as a singular view and abdicates responsibility for selection on other folders/categories.
        if (this._switcher.isWide) {
            return BaseGroup.prototype.offerSelection.call(this, type, view);
        } else {
            return BaseItem.prototype.offerSelection.call(this, type, view);
        }
    };

    Inbox.prototype._getChevronLabel = function (expanded) {
        return Jx.res.getString(expanded ? "mailViewsInboxChevronCollapse" : "mailViewsInboxChevronExpand");
    };

    function mirrorKey(direction) {
        Debug.assert(direction === "Left" || direction === "Right");
        if (Jx.isRtl()) {
            direction = (direction === "Left") ? "Right" : "Left";
        }
        return direction;
    }

    function _markAsyncStart(str) {
        Jx.mark("Mail.ViewItems." + str + ",StartTM,Mail");
    }
    function _markAsyncStop(str) {
        Jx.mark("Mail.ViewItems." + str + ",StopTM,Mail");
    }

});
