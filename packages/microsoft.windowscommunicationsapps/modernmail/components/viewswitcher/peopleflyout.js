
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft,Windows*/

Jx.delayDefine(Mail, "PeopleFlyout", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        ViewItems = Mail.ViewItems;

    var PeopleFlyout = Mail.PeopleFlyout = function (switcher, account, jobSet) {
        /// <param name="switcher">The hosting AccountViews, provides isWides/selectView and a widthChanged event</param>
        /// <param name="account" type="Mail.Account"/>
        _markStart("ctor");
        Debug.assert(Jx.isObject(switcher));
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(Jx.isNullOrUndefined(jobSet) || Jx.scheduler.isValidJobSet(jobSet));

        this.initComponent();
        this._switcher = switcher;
        this._hasPinnedPeople = this._hasSuggestions = false;

        var platform = account.platform;
        this._lastFirst = platform.peopleManager.nameSortOrder;
        this._pinningActivity = null;

        // Get a collection of people views, both pinned and unpinned.  This represents most of the content in the flyout.
        var views = this._views = account.queryViews(Plat.MailViewScenario.allPeople, "peopleFlyout");

        // But the list also contains some ancillary items:  headers, the picker button, the all favorites view.  Put
        // these "extra" items into a filtered collection so that we can hide/show them as needed via this.matches.
        var extraItems = this._extraItems = [
            switcher.getViewCollection().find(function (view) { return view.type === Plat.MailViewType.allPinnedPeople; }),
            { objectId: "pinnedHeader", objectType:  "pinnedHeader" },
            { objectId: "suggestedHeader", objectType:  "suggestedHeader" },
            { objectId: "noPinnedText", objectType:  "noPinnedText" },
            { objectId: "picker", objectType:  "picker" }
        ];
        this._updateCounts();
        var extraItemsFilter = this._extraItemsFilter = new Mail.FilteredCollection(
            this, new Mail.ArrayCollection(extraItems)
        );

        // Join the two collections together, and sort them using this.compare
        var collection = this._collection = new Mail.SortedCollection(
            this, new Mail.ConcatenatedCollection([views, extraItemsFilter])
        );

        var list = this._list = new Jx.List({
            factory: createItem.bind(null, switcher, account),
            jobSet: jobSet
        });
        var ariaFlows = this._ariaFlows = new Mail.AriaFlows(list);
        this.appendChild(ariaFlows);
        list.setSource(collection);
        list.disableAnimations();
        collection.unlock();

        this._disposer = new Mail.Disposer(
            collection, views, extraItemsFilter,
            new Mail.EventHook(switcher, "widthChanged", this._onSwitcherWidthChanged, this),
            new Mail.EventHook(views, "collectionchanged", this._onViewCollectionChanged, this)
        );
        this._hooks = null;
        this._keyboardNavigation = null;

        _markStop("ctor");
    };
    Jx.augment(PeopleFlyout, Jx.Component);

    PeopleFlyout.prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='peopleFlyout viewFlyout' role='listbox'>" +
                      "<div class='inhibitTouchHover'></div>" +
                      Jx.getUI(this._ariaFlows).html +
                  "</div>";
    };

    PeopleFlyout.prototype.activateUI = function () {
        _markStart("activateUI");
        Jx.Component.prototype.activateUI.call(this);
        var element = document.getElementById(this._id);
        var keyboardNavigation = this._keyboardNavigation = new Jx.KeyboardNavigation(element, "vertical", this);
        this._hooks = new Mail.Disposer(
            new Jx.Clicker(element, this._onClick, this),
            new Mail.EventHook(element, "contextmenu", this._onClick, this),
            new Mail.EventHook(element, "MSHoldVisual", function (ev) { ev.preventDefault(); }), // prevent the context menu hint
            keyboardNavigation,
            new Jx.PressEffect(element, ".person, .picker, .content", [ "className" ], ".inhibitTouchHover"),
            new Mail.Disposable(Jx.observeMutation(element, {
                attributes: true,
                subtree: true,
                attributeFilter: [ "aria-checked" ]
            }, this._onAttributeChange, this), "disconnect")
        );
        _markStop("activateUI");
    };

    PeopleFlyout.prototype.deactivateUI = function () {
        Jx.Component.prototype.deactivateUI.call(this);
        Jx.dispose(this._hooks);
    };

    PeopleFlyout.prototype.shutdownComponent = function () {
        Jx.Component.prototype.shutdownComponent.call(this);
        Jx.dispose(this._disposer);
    };

    PeopleFlyout.prototype._onClick = function (ev) {
        var child = this._list.getTarget(ev);
        if (child) {
            child.onClick(ev);
        }
    };

    PeopleFlyout.prototype._onAttributeChange = function (mutations) {
        mutations.forEach(function (mutation) {
            var target = this._list.getTarget(mutation);
            if (target) {
                target.onAttributeChange(mutation);
            }
        }, this);
    };

    PeopleFlyout.prototype.setCallback = Jx.fnEmpty;

    PeopleFlyout.prototype.hook = function (view) {
        if (view && view.objectType === "MailView") {
            view.addListener("changed", this._onViewChanged, this);
        }
    };

    PeopleFlyout.prototype.unhook = function (view) {
        if (view && view.objectType === "MailView") {
            view.removeListener("changed", this._onViewChanged, this);
        }
    };

    PeopleFlyout.prototype.matches = function (view) {
        /// <summary>Called by filtered collection on this._extraItems, to include or exclude items from the list</summary>
        var matches = false;
        if (view) {
            switch (view.objectType) {
            case "MailView":
                Debug.assert(view.type === Plat.MailViewType.allPinnedPeople);
                matches = !this._switcher.isWide && this._hasPinnedPeople;
                break;
            case "pinnedHeader":
            case "picker":
                matches = true;
                break;
            case "suggestedHeader":
                matches = this._hasSuggestions;
                break;
            case "noPinnedText":
                matches = !this._hasPinnedPeople;
                break;
            default:
                Debug.assert(false, "Unrecognized type: " + view.objectType);
                break;
            }
        }
        return matches;
    };

    var SortOrder = {
        pinnedHeader: 0,
        allPinnedPeople: 1,
        noPinnedText: 2,
        pinnedPerson: 3,
        suggestedHeader: 4,
        unpinnedPerson: 5,
        picker: 6,
        max: 7
    };
    function getSortOrder(view) {
        // <summary>The primary sort order is based on the "type" of item as represented in the SortOrder enum above.</summary>
        var result = SortOrder.max;
        if (view) {
            var objectType = view.objectType;
            if (objectType === "MailView") {
                if (view.type === Plat.MailViewType.allPinnedPeople) {
                    result = SortOrder.allPinnedPeople;
                } else {
                    Debug.assert(view.type === Plat.MailViewType.person || !view.isObjectValid);
                    result = view.isPinnedToNavPane ? SortOrder.pinnedPerson : SortOrder.unpinnedPerson;
                }
            } else {
                result = SortOrder[objectType];
            }
        }
        Debug.assert(Jx.isValidNumber(result));
        return result;
    }

    function sortByName(viewA, viewB, lastFirst) {
        Debug.assert(SortOrder.pinnedPerson === getSortOrder(viewA));
        Debug.assert(SortOrder.pinnedPerson === getSortOrder(viewB));
        return viewA.getSortName(lastFirst).localeCompare(viewB.getSortName(lastFirst));
    }

    function sortByPinningActivity(viewA, viewB, pinningActivity) {
        Debug.assert(SortOrder.unpinnedPerson === getSortOrder(viewA));
        Debug.assert(SortOrder.unpinnedPerson === getSortOrder(viewB));
        return pinningActivity ? (pinningActivity.indexOf(viewB.objectId) - pinningActivity.indexOf(viewA.objectId)) : 0;
    }

    PeopleFlyout.prototype.compare = function (viewA, viewB) {
        var sortA = getSortOrder(viewA),
            sortB = getSortOrder(viewB);
        return (sortA - sortB) ||
               (sortA === SortOrder.pinnedPerson ?
                    sortByName(viewA, viewB, this._lastFirst) :
                    sortByPinningActivity(viewA, viewB, this._pinningActivity));
    };

    PeopleFlyout.prototype._onViewCollectionChanged = function () {
        /// <summary>When the list of views is updated, we may need to show/hide headers and upsell text</summary>
        if (this._updateCounts()) {
            this._updateExtraItems();
        }
    };

    PeopleFlyout.prototype._onSwitcherWidthChanged = function () {
        /// <summary>When the switcher width changes, the All Favorites item may need to be hidden or shown</summary>
        this._updateExtraItems();
    };

    PeopleFlyout.prototype._updateCounts = function () {
        /// <summary>Computes this._hasPinnedPeople and this._hasSuggestions based on the contents of the collection.</summary>
        /// <returns type="Boolean">true if the values have changed</returns>
        var hadPinnedPeople = this._hasPinnedPeople,
            hadSuggestions = this._hasSuggestions;

        this._hasPinnedPeople = this._hasSuggestions = false;
        this._views.forEach(function (view) {
            if (view.isPinnedToNavPane) {
                this._hasPinnedPeople = true;
            } else {
                this._hasSuggestions = true;
            }
        }, this);

        return (hadPinnedPeople !== this._hasPinnedPeople ||
                hadSuggestions !== this._hasSuggestions);
    };

    PeopleFlyout.prototype._updateExtraItems = function () {
        /// <summary>Based on the collection, view and width changes, rerun the filter on everything in this._extraItems,
        /// which cause them to be hidden/shown as needed</summary>
        this._extraItems.forEach(function (extraItem) {
            this._extraItemsFilter.update(extraItem);
        }, this);
    };

    PeopleFlyout.prototype._onViewChanged = function (ev) {
        /// <summary>Called when properties on a person view changes</summary>
        var view = ev.target;

        if (Mail.Validators.hasPropertyChanged(ev, "sortName")) {
            // Update the sort position of this item
            this._collection.update(view);
        }

        if (Mail.Validators.hasPropertyChanged(ev, "isPinnedToNavPane")) {
            // Record pinning/unpinning to support the custom sort
            var pinningActivity = this._pinningActivity;
            if (pinningActivity) {
                var objectId = view.objectId,
                    index = pinningActivity.indexOf(objectId);
                if (index !== -1) {
                    pinningActivity.splice(index, 1);
                }
                pinningActivity.push(objectId);
            }
            this._collection.update(view);

            // Pinning and unpinning may hide/show some of the extra items
            if (this._updateCounts()) {
                this._updateExtraItems();
            }
        }
    };

    PeopleFlyout.prototype.beforeShow = function () {
        ///<summary>When the flyout is visible, animations are enabled and pinning is tracked for our custom sort</summary>
        this._pinningActivity = [];
        this._list.enableAnimations();
        this._keyboardNavigation.update(true /* reset */);
    };

    PeopleFlyout.prototype.afterHide = function () {
        ///<summary>When the flyout is invisible, animations are disabled and the custom sort is reset</summary>
        _markStart("afterHide");
        this._list.disableAnimations();
        var pinningActivity = this._pinningActivity,
            collection = this._collection;
        if (pinningActivity && collection) {
            while (pinningActivity.length > 0) {
                collection.updateById(pinningActivity.pop());
            }
        }
        this._pinningActivity = null;
        _markStop("afterHide");
    };

    PeopleFlyout.prototype.waitForAnimation = function () {
        return this._list.waitForAnimation();
    };

    function createItem(switcher, account, view) {
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));

        switch (view.objectType) {
        case "MailView":
            return (view.type === Plat.MailViewType.allPinnedPeople) ?
                new AllPinnedItem(switcher, view) : new PeopleFlyoutItem(switcher, view);
        case "pinnedHeader":
            return new StaticItem(
                "<div class='header' role='heading'>" +
                    Jx.escapeHtml(Jx.res.getString("mailPeopleFlyoutHeader")) +
                "</div>"
            );
        case "suggestedHeader":
            return new StaticItem(
                "<div class='header secondary' role='heading'>" +
                    Jx.escapeHtml(Jx.res.getString("mailPeopleFlyoutSuggestionsHeader")) +
                "</div>"
            );
        case "noPinnedText":
            return new StaticItem(
                "<div class='blurb' role='note'>" +
                    Jx.escapeHtml(Jx.res.getString("mailPeopleFlyoutNoPinnedText")) +
                "</div>"
            );
        case "picker":
            return new PickerItem(switcher, account);
        }

        Debug.assert(false, "Unrecognized object type: " + view.objectType);
    }

    function PeopleFlyoutItem(switcher, view) {
        this.initComponent();
        this._switcher = switcher;
        this._view = view;

        var tile = this._tile = new Mail.BoundElements.ViewTile(view),
            name = this._name = new Mail.BoundElements.ViewName(view),
            count = this._count = new Mail.BoundElements.ViewCount(view),
            star = this._star = new Mail.BoundElements.ViewPinner(view, "mailPinPersonLabel", "mailUnpinPersonLabel");
        this.append(tile, name, count, star);

        this._job = this._augment = null;
    }
    Jx.augment(PeopleFlyoutItem, Jx.Component);
    PeopleFlyoutItem.prototype.getUI = function (ui) {
        var view = this._view;
        ui.html = "<div class='person' id='" + this._id + "'>" +
                      "<div" +
                          " class='content'" +
                          " tabIndex='-1'" +
                          " aria-label='" + Jx.escapeHtml(ViewItems.getLabel(view)) + "'" +
                          " title='" + Jx.escapeHtml(view.name) + "'" +
                          " role='option'" +
                      ">" +
                          Jx.getUI(this._tile).html +
                          Jx.getUI(this._name).html +
                          Jx.getUI(this._count).html +
                      "</div>" +
                      Jx.getUI(this._star).html +
                  "</div>";
    };
    PeopleFlyoutItem.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        this._job = Jx.scheduler.addJob(null, Mail.Priority.galLookup, null, this._galLookup, this);
    };
    PeopleFlyoutItem.prototype.deactivateUI = function () {
        Jx.Component.prototype.deactivateUI.call(this);
        Jx.dispose(this._job);
    };
    PeopleFlyoutItem.prototype.onClick = function (ev) {
        if (!this._star.onClick(ev)) {
            this._switcher.selectView(this._view);
        }
    };
    PeopleFlyoutItem.prototype.onAttributeChange = function (mutation) {
        this._star.onAttributeChange(mutation);
    };
    PeopleFlyoutItem.prototype.updateLabel = function () {
        var element = document.querySelector("#" + this._id + " .content"),
            view = this._view;
        Mail.setAttribute(element, "aria-label", ViewItems.getLabel(view));
        Mail.setAttribute(element, "title", view.name);
    };
    PeopleFlyoutItem.prototype._galLookup = function () {
        Debug.assert(!this._augment);
        var person = this._view.sourceObject;
        if (person) {
            try {
                this._augment = person.augmentViaServerAsync(false).done(Jx.fnEmpty, Jx.fnEmpty);
            } catch (ex) {
                Jx.log.exception("Error in GAL augmentation", ex);
            }
        }
    };


    function AllPinnedItem(switcher, view) {
        this.initComponent();
        this._switcher = switcher;
        this._view = view;
        var name = this._name = new Mail.BoundElements.ViewName(view);
        var count = this._count = new Mail.BoundElements.ViewCount(view);
        this.append(name, count);
    }
    Jx.augment(AllPinnedItem, Jx.Component);
    AllPinnedItem.prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='person favorites'>" +
                      "<div" +
                          " class='content'" +
                          " tabIndex='-1'" +
                          " aria-label='" + Jx.escapeHtml(ViewItems.getLabel(this._view)) + "'" +
                          " title='" + Jx.escapeHtml(this._view.name) + "'" +
                          " role='option'" +
                      ">" +
                          "<div class='tile'></div>" +
                          Jx.getUI(this._name).html +
                          Jx.getUI(this._count).html +
                      "</div>" +
                  "</div>";
    };
    AllPinnedItem.prototype.onClick = function () {
        this._switcher.selectView(this._view);
    };
    AllPinnedItem.prototype.onAttributeChange = Jx.fnEmpty;
    AllPinnedItem.prototype.updateLabel = function () {
        Mail.setAttribute(document.querySelector("#" + this._id + " .content"), "aria-label", ViewItems.getLabel(this._view));
    };

    function StaticItem(html) {
        this.initComponent();
        this._html = html;
    }
    Jx.augment(StaticItem, Jx.Component);
    StaticItem.prototype.getUI = function (ui) {
        ui.html = this._html;
    };
    StaticItem.prototype.onClick = Jx.fnEmpty;
    StaticItem.prototype.onAttributeChange = Jx.fnEmpty;

    function PickerItem(switcher, account) {
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        this.initComponent();
        this._switcher = switcher;
        this._account = account;
    }
    Jx.augment(PickerItem, Jx.Component);
    PickerItem.prototype.getUI = function (ui) {
        ui.html = "<div" +
                      " class='picker'" +
                      " tabIndex='-1'" +
                      " role='button'" +
                      " title='" + Jx.escapeHtml(Jx.res.getString("mailPeopleFlyoutPicker")) + "'" +
                  ">" +
                      "<div class='plus'>\ue109</div>" +
                      "<div class='text'>" + Jx.escapeHtml(Jx.res.getString("mailPeopleFlyoutPicker")) + "</div>" +
                  "</div>";
    };
    PickerItem.prototype.onClick = function () {
        Mail.PeopleFlyout.pickPeople(this._account);
    };
    PickerItem.prototype.onAttributeChange = Jx.fnEmpty;

    Mail.PeopleFlyout.pickPeople = function (account) {
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));

        var Contacts = Windows.ApplicationModel.Contacts;
        var picker = new Contacts.ContactPicker();
        picker.commitButtonText = Jx.res.getString("mailPeopleFlyoutPickerCommit");
        picker.selectionMode = Contacts.ContactSelectionMode.contacts;
        picker.desiredFieldsWithContactFieldType.append(Contacts.ContactFieldType.email);
        picker.pickContactsAsync().then(function (contacts) {
            if (contacts) {
                contacts.forEach(function (contact) {
                    var personId = contact.id;
                    if (personId) {
                        try {
                            var view = account.queryView(Plat.MailViewType.person, personId);
                            if (view) {
                                view.pinToNavPane(true);
                            }
                        } catch (ex) {
                            Jx.log.exception("Error creating and pinning view", ex);
                        }
                    }
                }, this);
            }
        }).done(Jx.fnEmpty, Jx.fnEmpty);
    };

    function _markStart(str) {
        Jx.mark("Mail.PeopleFlyout." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.PeopleFlyout." + str + ",StopTA,Mail");
    }
});

