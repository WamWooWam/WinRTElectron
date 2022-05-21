
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, ["FolderEndOfListItem", "EndOfListItem"], function () {
    "use strict";

    var SyncWindowSize = Microsoft.WindowsLive.Platform.SyncWindowSize;

    Mail.EndOfListItem = /*@constructor*/ function () {};
    Jx.inherit(Mail.EndOfListItem, Mail.MessageListTreeNode);
    Debug.Events.define(Mail.EndOfListItem.prototype, "visibilityChanged");

    Object.defineProperty(Mail.EndOfListItem.prototype, "data", { get : function () { return this; }});
    Object.defineProperty(Mail.EndOfListItem.prototype, "pendingRemoval", { get: function () { return false; } });

    Mail.EndOfListItem.prototype.onInvoke = Jx.fnEmpty;
    Mail.EndOfListItem.prototype.dispose = Jx.fnEmpty;

    Mail.FolderEndOfListItem = function (syncMonitor) {
        /// <summary>
        /// An item that we show at the end of the message list - e.g. "To get messages older than two weeks, go to settings"
        /// </summary>
        Debug.assert(Jx.isInstanceOf(syncMonitor, Mail.UIDataModel.ViewSyncMonitor));
        this._isVisible = false;
        this._element = null;
        this._syncMonitor = syncMonitor;
        this._hooks = new Mail.EventHook(this._syncMonitor, "syncWindowChanged", this._onSyncWindowChanged, this);
        this._adjustVisibility();
    };
    Jx.inherit(Mail.FolderEndOfListItem, Mail.EndOfListItem);

    Mail.FolderEndOfListItem.prototype.dispose = function () {
        Jx.dispose(this._hooks);
        this._syncMonitor = null;
        this._hooks = null;
        this._element = null;
    };

    Mail.FolderEndOfListItem.prototype.getElement = function () {
        Mail.writeProfilerMark("EndOfListItem.getElement", Mail.LogEvent.start);
        var div = document.createElement("div");
        // mailEndOfList is used in test code to filter this item from the message list count
        div.innerHTML = "<div class='mailMessageListEntryContainer mailEndOfList typeSizeNormal win-nondraggable win-nonselectable win-nonswipeable' aria-hidden='false'> <div class='mailFolderEndOfList'></div></div>";
        Debug.assert(div.children.length === 1);
        div = div.firstElementChild;   // get mailMessageListEntryContainer
        Debug.assert(div.children.length === 1);
        this._element = div.firstElementChild;
        this._updateElement();
        Mail.writeProfilerMark("EndOfListItem.getElement", Mail.LogEvent.stop);
        return div;
    };

    var noMoreMessagesResources = [];
    noMoreMessagesResources[SyncWindowSize.oneDay] = "mailMessageListNoMoreMessagesOneDay";
    noMoreMessagesResources[SyncWindowSize.threeDays] = "mailMessageListNoMoreMessagesThreeDays";
    noMoreMessagesResources[SyncWindowSize.oneWeek] = "mailMessageListNoMoreMessagesOneWeek";
    noMoreMessagesResources[SyncWindowSize.twoWeeks] = "mailMessageListNoMoreMessagesTwoWeeks";
    noMoreMessagesResources[SyncWindowSize.oneMonth] = "mailMessageListNoMoreMessagesOneMonth";
    noMoreMessagesResources[SyncWindowSize.threeMonths] = "mailMessageListNoMoreMessagesThreeMonths";
    noMoreMessagesResources[SyncWindowSize.sixMonths] = "mailMessageListNoMoreMessagesSixMonths";

    Mail.FolderEndOfListItem.prototype._updateElement = function () {
        Mail.writeProfilerMark("EndOfListItem._updateElement", Mail.LogEvent.start);
        Debug.assert(this._checkVisibility(), "Why are we updating the element when it is invisible");
        if (Jx.isHTMLElement(this._element)) {
            var resource = noMoreMessagesResources[this._syncMonitor.getSyncWindow()];
            this._element.innerText = resource ? Jx.res.getString(resource) : "";
        } // if the element is never on screen, wait for it to be added to the collection
        Mail.writeProfilerMark("EndOfListItem._updateElement", Mail.LogEvent.stop);

    };

    Mail.FolderEndOfListItem.prototype._onSyncWindowChanged = function () {
        this._adjustVisibility();
        if (this._isVisible) {
            this._updateElement();
        }
    };

    Mail.FolderEndOfListItem.prototype.onInvoke = function () {
        var appState = /*@static_cast(Mail.AppState)*/Mail.Globals.appState;
        Mail.AppSettings.openAccountUI(appState.selectedAccount);
    };

    Mail.FolderEndOfListItem.prototype._checkVisibility = function () {
        return this._syncMonitor.getSyncWindow() in noMoreMessagesResources;
    };

    Mail.FolderEndOfListItem.prototype._adjustVisibility = function () {
        var showItem = this._checkVisibility();
        if (showItem !== this._isVisible) {
            this._isVisible = showItem;
            this.raiseEvent("visibilityChanged", this._isVisible);
        }
    };

    Object.defineProperty(Mail.FolderEndOfListItem.prototype, "visible", { get: function () { return this._isVisible; }, enumerable: true});
    Object.defineProperty(Mail.FolderEndOfListItem.prototype, "objectId", { get: function () { return "Mail.FolderEndOfListItem.objectId"; }, enumerable: true});
    Object.defineProperty(Mail.FolderEndOfListItem.prototype, "selectable", { get: function () { return false; } });
});
