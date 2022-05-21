
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,WinJS */
/*jshint browser:true*/

Jx.delayDefine(Mail, "SelectionHandler", function () {
    "use strict";

    var instance = null,
        Instr = Mail.Instrumentation;

    var SelectionHandler = Mail.SelectionHandler = function (collection, listView, selection, commandBar) {
        Mail.writeProfilerMark("Mail.SelectionHandler.Ctor", Mail.LogEvent.start);
        Debug.assert(Jx.isInstanceOf(collection, Mail.TrailingItemCollection));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));
        Debug.assert(Jx.isInstanceOf(commandBar, Mail.CompCommandBar));

        this._model = new Mail.SelectionModel(collection, listView);
        this._aggregator = null;
        this._controller = new Mail.SelectionController(collection, selection, this._model, this);
        this._selection = selection;
        this._collection = collection;
        this._isSelectionMode = false;

        // UI Components
        this._host = document.getElementById("messageList");
        Debug.assert(Jx.isHTMLElement(this._host));

        var checkBoxHost = this._host.querySelector(".mailMessageListAllCheckbox");
        this._allCheckBox = new Mail.SelectAllCheckBox(checkBoxHost, this, this._collection.mailItems);
        this._appBar = commandBar;

        // hook events
        var EventHook = Mail.EventHook,
            listViewCanvas = this._model.listViewElement.querySelector(".win-viewport");
        Debug.assert(Jx.isHTMLElement(listViewCanvas));

        this._disposer = new Mail.Disposer(
            this._model,
            this._controller,
            this._allCheckBox,
            new EventHook(listViewCanvas, "MSPointerDown", this._onMSPointerDown, this),
            new EventHook(listViewCanvas, "keydown", this._onKeyDown, this),
            new EventHook(this._model, "selectionchanged", this._onSelectionChanged, this),
            EventHook.createGlobalHook("exitSelectionMode", this.exitSelectionMode, this),
            new Mail.KeyboardDismisser(listViewCanvas, selection)
        );

        Mail.Globals.commandManager.registerShortcuts(["exitSelectionMode"]);

        // Show/hide checkboxes
        var messageListFrameElement = document.getElementById("mailFrameMessageList");
        Debug.assert(Jx.isHTMLElement(messageListFrameElement));
        this._supportMultiSelect = Mail.Commands.Contexts.supportMultiSelect();
        Jx.setClass(messageListFrameElement, "supportMultiSelect", this._supportMultiSelect);

        // Set up the instance
        Debug.assert(Jx.isNullOrUndefined(instance), "Only one instance should be active at a time");
        instance = this;
        Mail.writeProfilerMark("Mail.SelectionHandler.Ctor", Mail.LogEvent.stop);
    };

    var proto = SelectionHandler.prototype;

    Object.defineProperty(SelectionHandler, "isSelectionMode", {
        get: function () {
            return instance && instance.isSelectionMode;
        }
    });

    SelectionHandler.toggleSelectionMode = function () {
        if (instance) {
            instance.toggleSelectionMode();
        }
    };

    SelectionHandler.exitSelectionMode = function () {
        if (instance) {
            instance.exitSelectionMode();
        }
    };

    proto.startSelectionMode = function () {
        this._setIsSelectionMode(true);
    };

    proto.exitSelectionMode = function () {
        this._setIsSelectionMode(false);
    };

    proto.toggleSelectionMode = function () {
        this._setIsSelectionMode(!this.isSelectionMode);
    };

    proto.getModel = function () {
        var model = (this.isSelectionMode) ? this._aggregator : this._model;
        Debug.assert(Jx.isObject(model));
        return model;
    };

    proto.dispose = function () {
        // Exit selection Mode
        this._setIsSelectionMode(false /*isSelectionMode*/, true /*isDisposing*/);

        // Unhook events
        Jx.dispose(this._disposer);
        this._disposer = null;
        this._allCheckBox = null;
        this._controller = null;
        this._model = null;
        this._host = null;

        instance = null;
    };

    Object.defineProperty(proto, "isSelectionMode", { get : function () { return this._isSelectionMode; },    enumerable: true });
    Object.defineProperty(proto, "controller",      { get : function () { return this._controller; },   enumerable: true });
    Object.defineProperty(proto, "model",           { get : function () { return this._model; },         enumerable: true });

    proto._setIsSelectionMode = function (isSelectionMode, isDisposing) {
        Debug.assert(Jx.isBoolean(isSelectionMode));
        Debug.assert(Jx.isUndefined(isDisposing) || Jx.isBoolean(isDisposing));

        if (this._isSelectionMode === isSelectionMode || !this._supportMultiSelect) {
            return;
        }
        Mail.writeProfilerMark("Mail.SelectionHandler._setIsSelectionMode:=" + isSelectionMode, Mail.LogEvent.start);

        // update the CSS to show/hide the check box
        var hostClassList = this._host.classList;
        Debug.assert(hostClassList.contains("selectionModeActive") === this._isSelectionMode);
        hostClassList.toggle("selectionModeActive");
        Debug.assert(hostClassList.contains("selectionModeInactive") !== this._isSelectionMode);
        hostClassList.toggle("selectionModeInactive");

        this._isSelectionMode = isSelectionMode;

        if (isSelectionMode) {
            this._onEnterSelectionMode();
        } else {
            this._onExitSelectionMode(isDisposing);
        }

        Jx.EventManager.fireDirect(null, "isSelectionModeChanged");
        Mail.writeProfilerMark("Mail.SelectionHandler._setIsSelectionMode:=" + isSelectionMode, Mail.LogEvent.stop);
    };

    function isRightClickOnSelectedItem(pointerEvent) {
        // We use MSPointerDown instead of context menu for right-click detection.
        // In the listView, selection events are initialized during the MSPointerDown event.
        // The DOM context menu event, which is fired much later after the MSPointerDown event, will create race conditions.
        // For example, when the user right-click on the last item to exit out of selectionMode, we close the app bar and
        // start subscribing to contextMenu event again in the messageList.  At this moment, trident fires the contextMenu event
        // of the original right-click, which causes the appbar to toggle up again.
        Debug.assert(Jx.isObject(pointerEvent));
        if (pointerEvent.pointerType !== "mouse") {
            return false;
        }

        if (!pointerEvent.currentPoint.properties.isRightButtonPressed) {
            return false;
        }
        var currentNode = pointerEvent.srcElement;
        while (currentNode.id !== Mail.CompMessageList.defaultElementId) {
            if (currentNode.classList.contains("win-selected")) {
                return true;
            }
            currentNode = currentNode.parentNode;
        }
        return false;
    }

    proto._onMSPointerDown = function (/*@type(Event)*/e) {
        if (!this._isSelectionMode && isRightClickOnSelectedItem(e)) {
            if (this._appBar.hidden) {
                Instr.instrumentAppBarInvoke(Instr.AppBarInvokeType.rightClick);
            }
            this._appBar.toggleVisibility();
        }
    };

    proto._onKeyDown = function (/*@type(Event)*/evt) {
        // Toggle the app bar if the user press the select key on the selected item when we are not in selection mode
        Debug.assert(Jx.isObject(evt));
        if (!this._isSelectionMode && evt.keyCode === Jx.KeyCode.select) {
            var selection = this._model.selection(),
                isCurrentItemSelected = selection.isIndexSelected(this._model.currentItem.index);
            if (isCurrentItemSelected) {
                this._appBar.toggleVisibility();
            }
        }
    };

    proto._onSelectionChanged = function () {
        var isMultiSelect = this._model.selection().length > 1;
        if (isMultiSelect) {
            this._setIsSelectionMode(true);
        }
    };

    proto._onEnterSelectionMode = function () {
        this._allCheckBox.updateSelectionMode();
        this._model.tapBehavior = "toggleSelect";

        Debug.assert(!this._aggregator);
        this._aggregator = new Mail.SelectionAggregator(this._collection, this._model, this._selection.view, this);

        this._controller.setModel(this._aggregator);
        this._controller.setNodeExpansionHandler(this._aggregator);

        this._appBar.showAppBar(true /*skipCommandUpdate*/);
        this._appBar.lightDismiss = false;
        Instr.instrumentAppBarInvoke(Instr.AppBarInvokeType.consumeSelection);
        Instr.instrumentMailCommand(Instr.Commands.enterSelectionMode);
    };

    proto._onExitSelectionMode = function (/*@optional*/ isDisposing) {
        Debug.assert(Jx.isUndefined(isDisposing) || Jx.isBoolean(isDisposing));
        this._allCheckBox.updateSelectionMode();
        this._model.tapBehavior = "directSelect";

        Jx.dispose(this._aggregator);
        this._aggregator = null;

        if (!isDisposing) {
            // Do not update the controller if we exit selection mode due to a shut down of the handler
            // The controller will try to set selection upon leaving selection mode, which has a high performance cost
            this._controller.exitSelectionMode();
            this._controller.setModel(this._model);
            this._controller.setNodeExpansionHandler(new Mail.SimpleNodeExpansionHandler(this._selection.view, this._collection, this._model));
        }

        this._appBar.hideAppBar();
        this._appBar.lightDismiss = true;
    };
});

