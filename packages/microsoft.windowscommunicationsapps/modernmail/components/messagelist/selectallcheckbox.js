
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug*/
Jx.delayDefine(Mail, "SelectAllCheckBox", function () {
    "use strict";
    Mail.SelectAllCheckBox = function (host, selectionHandler, collection) {
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(Jx.isInstanceOf(selectionHandler, Mail.SelectionHandler));
        Debug.assert(Jx.isInstanceOf(selectionHandler.model, Mail.SelectionModel));
        Debug.assert(Jx.isObject(collection));
        this._selectionHandler = selectionHandler;
        this._model = selectionHandler.model;
        this._collection = collection;
        this._host = host;
        this._update();

        // hook change handlers
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(this._host, "click", this._onCheckboxClicked, this),
            new Mail.EventHook(this._collection, "endChanges", this._update, this),
            new Mail.EventHook(this._model, "selectionchanged", this._update, this));
    };

    var proto = Mail.SelectAllCheckBox.prototype;

    proto._onCheckboxClicked = function () {
        Mail.writeProfilerMark("Mail.SelectAllCheckBox._onCheckboxClicked", Mail.LogEvent.start);
        if (this._host.checked) {
            this._selectionHandler.startSelectionMode();
            this._model.selectAll();
        } else {
            this._selectionHandler.exitSelectionMode();
        }
        this._updateToolTip();
        Mail.writeProfilerMark("Mail.SelectAllCheckBox._onCheckboxClicked", Mail.LogEvent.stop);
    };

    proto.updateSelectionMode = function () {
        if (this._collection.count === 1) {
            this._host.checked = this._selectionHandler.isSelectionMode;
            this._updateToolTip();
        }
    };

    proto._update = function () {
        Mail.writeProfilerMark("Mail.SelectAllCheckBox._update", Mail.LogEvent.start);
        var selectionCount = this._model.selection().length,
            itemsCount = this._collection.count,
            hideCheckBox = itemsCount === 0;
        Jx.setClass(this._host, "invisible", hideCheckBox);
        if (!hideCheckBox) {
            if (itemsCount === 1) {
                // if the count is one, only show it as checked if we are in selection mode
                // it is weird to have an all check box when we are not in selection mode
                this._host.checked = this._selectionHandler.isSelectionMode;
            } else {
                this._host.checked = (selectionCount === itemsCount);
            }
            this._updateToolTip();
        }
        Mail.writeProfilerMark("Mail.SelectAllCheckBox._update", Mail.LogEvent.stop);
    };

    var selectAllToolTip = null,
        selectNoneToolTip = null;

    proto._updateToolTip = function () {
        if (!selectAllToolTip) {
            selectAllToolTip = Jx.res.getString("mailSelectAllCheckboxTooltipSelectAll");
            selectNoneToolTip = Jx.res.getString("mailSelectAllCheckboxTooltipSelectNone");
        }
        this._host.title = (this._host.checked) ? selectNoneToolTip : selectAllToolTip;
    };

    proto.dispose = function () {
        Mail.writeProfilerMark("Mail.SelectAllCheckBox.dispose", Mail.LogEvent.start);
        Jx.dispose(this._disposer);
        this._disposer = null;
        this._collection = null;
        this._selectionHandler = null;
        this._model = null;
        this._host = null;
        Mail.writeProfilerMark("Mail.SelectAllCheckBox.dispose", Mail.LogEvent.stop);
    };
});
