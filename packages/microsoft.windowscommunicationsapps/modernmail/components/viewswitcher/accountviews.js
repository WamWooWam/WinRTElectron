
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "AccountViews", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        Filters = Mail.ViewFilters;

    var flyoutDefinitions = [
        { name: "people",  viewType: Plat.MailViewType.person },
        { name: "folders", viewType: Plat.MailViewType.userGeneratedFolder }
    ];

    var excluded = ".collapsed-wide .item, .collapsed-skinny .item, .collapsing .item"; // Don't allow keyboard navigation to collapsed items

    var AccountViews = Mail.AccountViews = function (account, switcher, settings, flyoutFactory) {
        _markStart("ctor");
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(Jx.isObject(switcher));
        Debug.assert(Jx.isObject(settings));
        Debug.assert(Jx.isFunction(flyoutFactory));

        Debug.only(this._debugState = "init");

        this.initComponent();
        this._switcher = switcher;
        this._settings = settings;

        // allViews gets all of the views for the power pane with a single query
        var allViews = this._allViews = account.queryViews(Plat.MailViewScenario.navPane, "navPane");

        // views includes only the top-level views for the pane
        var views = this._views = Filters.topLevelSort(new Mail.ConcatenatedCollection([
            Filters.filterByType(allViews, Filters.topLevel),
            new Mail.ArrayCollection([ { objectType: "FoldersIcon", objectId: "FoldersIcon" } ])
        ]));
        views.unlock();

        var list = this._list = new Jx.List({
            role: null,
            factory: Mail.ViewItems.create.bind(null, this, account.platform, true /* top level */),
            requestAnimation: this.requestAnimation.bind(this, null)
        });
        list.setSource(views);

        var ariaFlows = this._ariaFlows = new Mail.AriaFlows(list, excluded);
        this.appendChild(ariaFlows);

        this._flyouts = flyoutDefinitions.map(function (definition) {
            return new Mail.ViewFlyout(this, account, definition.name, flyoutFactory);
        }, this);

        this._disposer = new Mail.Disposer(views, allViews, this._flyouts);

        this._selectedChild = null;
        this._selectedView = null;
        this._hooks = null;
        this._element = null;
        this._dragListener = null;

        _markStop("ctor");
    };
    Jx.augment(AccountViews, Jx.Component);
    var prototype = AccountViews.prototype;

    prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='accountViews' role='listbox'>" +
                      "<div class='inhibitTouchHover'></div>" +
                      Jx.getUI(this._ariaFlows).html +
                  "</div>";
    };

    prototype.activateUI = function () {
        Debug.only(this._debugState = "activating");
        Jx.Component.prototype.activateUI.call(this);
        var element = this._element = document.getElementById(this._id);

        this._hooks = new Mail.Disposer(
            new Jx.PressEffect(element, ".item, .chevron, .content", [ "className" ], ".inhibitTouchHover"),
            new Mail.EventHook(element, "click", this._onClick, this),
            new Mail.EventHook(element, "contextmenu", this._onClick, this),
            new Mail.EventHook(element, "MSHoldVisual", function (ev) { ev.preventDefault(); }), // prevent the context menu hint
            new Mail.EventHook(element, "keydown", this._onKeyDown, this),
            new Mail.EventHook(element, "maildragenter", this._onDragEnter, this),
            new Mail.EventHook(element, "maildrop", this._onDrop, this),
            new Jx.KeyboardNavigation(element, "vertical", this, excluded),
            new Mail.Disposable(Jx.observeMutation(element, {
                attributes: true,
                subtree: true,
                attributeFilter: [ "aria-selected", "aria-expanded" ]
            }, this._onAttributeChange, this), "disconnect")
        );
        this._flyouts.forEach(function (flyout) {
            this._hooks.addMany(
                new Mail.EventHook(flyout, "beforeShow", this._updateSelection, this),
                new Mail.EventHook(flyout, "afterHide", this._updateSelection, this)
            );
        }, this);
        this.on("contentUpdated", this._updateSelection, this);
        this._updateSelection();
        Debug.only(this._debugState = "ready");
    };

    prototype._onClick = function (ev) {
        var target = this._list.getTarget(ev);
        if (target) {
            target.onClick(ev);
        }
    };

    prototype._onAttributeChange = function (mutations) {
        Debug.assert(this._debugState === "ready", "Invalid state: " + this._debugState);
        mutations.forEach(function (mutation) {
            var target = this._list.getTarget(mutation);
            if (target) {
                target.onAttributeChange(mutation);
            }
        }, this);
    };

    prototype._onKeyDown = function (ev) {
        var target = this._list.getTarget(ev);
        if (target) {
            target.onKeyDown(ev);
        }
    };

    prototype._onDragEnter = function (ev) {
        if (!this._dragListener) {
            this.getFlyout("folders").show({ sticky: true, abovePeekBar: true });
            this._dragListener = new Mail.EventHook(ev.detail.dragElement, "dragend", this._onDragEnd, this);
        }
    };

    prototype._onDragEnd = function () {
        // Close the flyout at the end of the drag regardless of drop outcome
        Jx.dispose(this._dragListener);
        this._dragListener = null;
        this.getFlyout("folders").hide();
    };

    prototype._onDrop = function (ev) {
        var target = this._list.getTarget(ev);
        if (target) {
            target.onDrop(ev);
        }
    };

    prototype.deactivateUI = function () {
        Debug.only(this._debugState = "deactivating");
        Jx.Component.prototype.deactivateUI.call(this);
        Jx.dispose(this._disposer);
        Jx.dispose(this._hooks);
        this.detach("contentUpdated", this._updateSelection, this);
        Debug.only(this._debugState = "dead");
    };

    prototype.selectView = function (view) {
        ///<summary>Called by sub-components to update the view.  Forwarded up to the switcher</summary>
        this.onViewSelected(view); // Respond to the pending selection update immediately, for better responsiveness
        this._switcher.selectViewAsync(view); // Queue an async update for the rest of the app
    };

    prototype.onViewSelected = function (view) {
        ///<summary>Called by the switcher when the selected view has been changed (perhaps by this object or perhaps
        ///externally</summary>
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        _markStart("onViewSelected");

        this._flyouts.forEach(function (flyout) { flyout.hide(); });

        this._selectedView = view;
        this._updateSelection();

        if (this._selectedId !== view.objectId) {
            this._selectedId = view.objectId;
            Jx.scheduler.addJob(null,
                Mail.Priority.reportTelemetryOnNavigation,
                "Mail telemetry reporting on navigation",
                Mail.Instrumentation.instrumentNavigation,
                null,
                [view]
            );
        }

        _markStop("onViewSelected");
    };

    prototype._updateSelection = function () {
        _markStart("updateSelection");

        var view, type;

        // When a flyout is opened, we'll act as if a null view of the specified type is selected.
        // This selection should be claimed by the entry point to that flyout, as would any unpinned
        // view of that type.
        var activeFlyout = this._flyouts.reduce(function (result, flyout, index) {
            return result ||
                   (flyout.isVisible ? { flyout: flyout, type: flyoutDefinitions[index].viewType } : null);
        }, null);
        if (activeFlyout) {
            type = activeFlyout.type;
        } else {
            view = this._selectedView;
            if (view) {
                type = view.type;
            }
        }

        // Ask the children to claim the selection.  They will decide for themselves, recursively, which of them
        // best represents this selected view.
        var newSelection = null;
        if (Jx.isDefined(type)) {
            var list = this._list;
            for (var i = 0, len = list.getChildrenCount(); i < len; ++i) {
                newSelection = list.getChild(i).offerSelection(type, view);
                if (newSelection) {
                    break;
                }
            }
        }

        // Toggle the selected state for the old and new views.
        var element;
        var oldSelection = this._selectedChild;
        if (newSelection !== oldSelection) {
            if (oldSelection) {
                oldSelection.setSelected(false);
            }
            if (newSelection) {
                element = newSelection.setSelected(true);
            }
            this._selectedChild = newSelection;
        }

        if (activeFlyout && element) {
            activeFlyout.flyout.setEntryPoint(element);
        }

        _markStop("updateSelection");
    };

    prototype.getFlyout = function (name) {
        Debug.assert(flyoutDefinitions.some(function (definition) { return name === definition.name; }));
        return this._flyouts.reduce(function (result, flyout, index) {
            return result || (flyoutDefinitions[index].name === name ? flyout : null);
        }, null);
    };

    prototype.getViewCollection = function () {
        return this._allViews;
    };

    prototype.getSettings = function () {
        return this._settings.container("viewSwitcher");
    };

    Object.defineProperty(prototype, "isWide", { get: function () {
        return this._switcher.isWide;
    }, enumerable: true });

    prototype.addListener = function (ev, fn, target) {
        return this._switcher.addListener(ev, fn, target);
    };

    prototype.removeListener = function (ev, fn, target) {
        return this._switcher.removeListener(ev, fn, target);
    };

    prototype.waitForAnimation = function () {
        /// <summary>Recursively wait for any ongoing or queued animation to complete.  The returned promise will
        /// complete when previousl queued animation is done, but does not consider new animations queued after this
        /// wait begins.</summary>
        return this._list.waitForAnimation();
    };

    prototype.requestAnimation = function (component) {
        /// <summary>Before any list or item can perform an animation, they need to request permission here.  That
        /// permission will be granted when any existing animation is complete, and any previously queued requests
        /// for animation have been granted.  It is expected that callers of this method include the returned promise
        /// in their animation chain, and wait on it in their waitForAnimation calls, so that only one request is
        /// processed at a time.</summary>
        return this.waitForAnimation().then(function () {
            return this._list.getAffectedElements(component);
        }.bind(this));
    };

    function _markStart(str) {
        Jx.mark("Mail.AccountViews." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.AccountViews." + str + ",StopTA,Mail");
    }

});
