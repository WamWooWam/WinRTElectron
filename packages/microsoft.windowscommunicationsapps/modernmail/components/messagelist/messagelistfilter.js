
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "MessageListFilter", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform,
        filterCriteria = P.FilterCriteria,
        menuItems = [
            {
                value: filterCriteria.all,
                textId: "mailFilterAll",
                tooltipId: "mailFilterTooltipAll"
            },
            {
                value: filterCriteria.unread,
                textId: "mailFilterUnread",
                tooltipId: "mailFilterTooltipUnread"
            }
        ];

    Mail.MessageListFilter = function (host, selection, settings) {
        _markStart("ctor");

        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isObject(settings));

        this._selection = selection;
        this._settings = settings;
        this._container = null;

        this._combobox = new Mail.ComboBox(host, menuItems, this._getLastAppliedFilter(), {
            getDropdownAriaLabel: this._getDropdownAriaLabel.bind(this),
            getHostAriaLabel: this._getHostAriaLabel.bind(this)
        });

        var commandEvents = Mail.Commands.Events;
        this._disposer = new Mail.Disposer(
            this._combobox,
            new Mail.EventHook(this._combobox, "changed", this._onComboBoxChanged, this),
            Mail.EventHook.createGlobalHook(commandEvents.allFilterApplied, this._onKeyboardShortcut, this),
            Mail.EventHook.createGlobalHook(commandEvents.unreadFilterApplied, this._onKeyboardShortcut, this),
            Mail.EventHook.createGlobalHook(commandEvents.reapplyFilter, this._onKeyboardShortcut, this)
        );

        _markStop("ctor");
    };
    Jx.augment(Mail.MessageListFilter, Jx.Events);

    var MLFProto = Mail.MessageListFilter.prototype;
    Debug.Events.define(MLFProto, "changed");

    MLFProto.dispose = function () {
        this._disposer.dispose();
    };

    MLFProto._getHostAriaLabel = function (currentFilter) {
        return Jx.res.getString(menuItems[currentFilter].textId);
    };

    MLFProto._getDropdownAriaLabel = function () {
        return Jx.res.getString("mailFilterDropdownMenuAriaLabel");
    };

    Object.defineProperty(MLFProto, "currentFilter", { get: function () { return this._combobox.value; }, enumerable: true });

    var filterStateStorageNames = {
        appliedViewId: "mail-filter-appliedViewId",
        lastAppliedFilter: "mail-filter-lastAppliedFilter"
    };

    MLFProto._getLastAppliedFilter = function () {
        Debug.assert(this._container === null);

        // Try to restore the last applied filter on the current view
        this._container = this._settings.getLocalSettings();
        var currentViewId = this._selection.view.objectId,
            storedViewId = this._container.get(filterStateStorageNames.appliedViewId);

        _mark("_getLastAppliedFilter - views: " + currentViewId + ", " + storedViewId);

        if (storedViewId === currentViewId) {
            var filter = this._container.get(filterStateStorageNames.lastAppliedFilter);
            if (filter === filterCriteria.unread || filter === filterCriteria.all) {
                _mark("_getLastAppliedFilter - last applied filter is " + filter);
                return filter;
            }
        }

        _mark("_getLastAppliedFilter - stored view/filter pair is out of date, defaulting to All");
        var filterCriteriaAll = filterCriteria.all;
        this._saveAppliedFilter(filterCriteriaAll);
        return filterCriteriaAll;
    };

    MLFProto._onComboBoxChanged = function () {
        _mark("_onComboBoxChanged");
        this._saveAppliedFilter(this.currentFilter);
        this.raiseEvent("changed");
    };

    MLFProto._saveAppliedFilter = function (filter) {
        Debug.assert(Jx.isValidNumber(filter));
        var viewId = this._selection.view.objectId;
        var container = this._container;
        _mark("_onComboBoxChanged - storing view and filter: " + viewId + ", " + filter);
        container.set(filterStateStorageNames.appliedViewId, viewId);
        container.set(filterStateStorageNames.lastAppliedFilter, filter);
    };

    MLFProto.setToAll = function () {
        _mark("setToAll");
        var filterCriteriaAll = filterCriteria.all;
        this._saveAppliedFilter(filterCriteriaAll);
        this._combobox.updateNewValue(filterCriteriaAll, false /* fireEvent */);
    };

    MLFProto.apply = function (view, threaded) {
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isBoolean(threaded));

        var filter = this.currentFilter;
        _mark("apply - applying " + filter + "; threaded = " + threaded);
        return threaded ? view.getConversations(filter) : view.getMessages(filter);
    };

    MLFProto._onKeyboardShortcut = function (evt) {
        Debug.assert(Jx.isObject(evt));
        Debug.assert(Jx.isNonEmptyString(evt.type));

        var commandEvents = Mail.Commands.Events,
            newFilter = null,
            updateFunc = this._combobox.updateNewValue;
        switch (evt.type) {
            case commandEvents.allFilterApplied:
                newFilter = filterCriteria.all;
                _mark("_onKeyboardShortcut - applying All filter");
                break;
            case commandEvents.unreadFilterApplied:
                newFilter = filterCriteria.unread;
                _mark("_onKeyboardShortcut - applying Unread filter");
                break;
            case commandEvents.reapplyFilter:
                if (!Mail.ViewCapabilities.isFiltered(this._selection.view, this.currentFilter)) {
                    // There is no point re-applying the filter if nothing is filtered out
                    updateFunc = null;
                    _mark("_onKeyboardShortcut - not changing filter");
                } else {
                    newFilter = this.currentFilter;
                    updateFunc = this._combobox.updateValue;
                    _mark("_onKeyboardShortcut - reapplying filter " + newFilter);
                }
                break;
            default:
                Debug.assert(false);
                break;
        }

        if (updateFunc) {
            updateFunc.call(this._combobox, newFilter, true /* fireEvent */);
        }
    };

    MLFProto.hide = function () {
        _mark("hide");
        this._combobox.hide();
    };

    MLFProto.show = function () {
        _mark("show");
        this._combobox.show();
    };

    function _mark(s) { Jx.mark("MessageListFilter:" + s); }
    function _markStart(s) { Jx.mark("MessageListFilter." + s + ",StartTA,MessageListFilter"); }
    function _markStop(s) { Jx.mark("MessageListFilter." + s + ",StopTA,MessageListFilter"); }

});
