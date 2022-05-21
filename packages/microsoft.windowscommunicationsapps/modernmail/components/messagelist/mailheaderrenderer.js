
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail, "MailHeaderRenderer", function () {
    "use strict";

    var MailHeaderRenderer = Mail.MailHeaderRenderer = function (notificationHandler, selectionHandler, isThreading, selection) {
        _markStart("Ctor");
        Debug.assert(Jx.isInstanceOf(notificationHandler, WinJS.UI.ListDataNotificationHandler));
        Debug.assert(Jx.isInstanceOf(selectionHandler, Mail.SelectionHandler));
        Debug.assert(Jx.isBoolean(isThreading));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        this._notificationHandler = notificationHandler;
        this._selectionHandler = selectionHandler;
        this._selection = selection;
        this._isThreading = isThreading;
        _markStop("Ctor");
    };

    MailHeaderRenderer.prototype.dispose = function () {
        _markStart("dispose");
        Mail.MessageListItemFactory.resetAll();
        _markStop("dispose");
    };

    MailHeaderRenderer.prototype.renderItem = function (listViewItem) {
        _markStart("renderItem");
        var node = listViewItem.data,
            item = node.data;

        // Can't assert that message is an instance of Mail.UIDataModel.MailItem because it might not be.
        // It could be a fake message because the underlying message was deleted and we haven't told the listview yet.
        var objectId = node.objectId;
        Debug.assert(objectId === listViewItem.key);
        Debug.assert(objectId === node.objectId);

        var element = null;

        if (node.pendingRemoval) {
            // The item has been removed from the collection but we haven't received the delete notification yet
            Jx.log.warning("Mail.MailHeaderRenderer.prototype._renderItem - Rendering placeholder for deleted platform object <objectId=" + objectId + ">");
            element = document.createElement("div");
            element.classList.add("mailMessageListEntryContainer");
        } else if (Jx.isInstanceOf(item, Mail.EndOfListItem)) {
            var endOfListItem = item;
            Debug.assert(Jx.isFunction(endOfListItem.getElement));
            element = endOfListItem.getElement();
        } else if (Jx.isInstanceOf(item, Mail.UIDataModel.MailItem)) {
            Debug.Mail.log("Rendering item - " + item.subject + "(id:" + objectId + ")");
            element = Mail.MessageListItemFactory.getElement(this._selectionHandler, node, this._selection, this._isThreading);
        } else {
            Debug.assert(false, "Unsupported item type");
        }
        Debug.assert(Jx.isHTMLElement(element));
        _markStop("renderItem");
        return element;
    };

    function _markStart(s) { Jx.mark("MailHeaderRenderer." + s + ",StartTA,MailHeaderRenderer"); }
    function _markStop(s) { Jx.mark("MailHeaderRenderer." + s + ",StopTA,MailHeaderRenderer"); }
});
