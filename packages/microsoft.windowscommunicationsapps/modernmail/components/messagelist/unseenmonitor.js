
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "UnseenMonitor", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    var UnseenMonitor = Mail.UnseenMonitor = function (view, list, elem) {
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isObject(list));
        Debug.assert(Jx.isObject(elem));
        _mark("ctor:view=" + view.objectId);

        this._view = view;
        this._list = list;
        this._hidden = elem.hidden;

        var disposer = this._disposer = new Mail.Disposer();

        var collection = this._collection = view.getMessages(Plat.FilterCriteria.unseen);
        if (collection) {
            collection.unlock();
            disposer.addMany(
                collection,
                new Mail.EventHook(collection, "collectionchanged", this._onCollectionChanged, this),
                new Mail.EventHook(elem, "visibilitychange", this._onVisibilityChange, this)
            );
        }

        // Clear the count on initial view switch
        if (!this._hidden) {
            this._clearUnseen();
        }
    };
    var prototype = UnseenMonitor.prototype;

    prototype.dispose = function() {
        _mark("dispose");
        Jx.dispose(this._disposer);
    };

    prototype._onCollectionChanged = function(ev) {
        // Ensure the count is cleared for the view while the app is visible
        _mark("_onCollectionChanged:ev.eType=" + ev.eType + ";hidden=" + this._hidden);
        if (!this._hidden && (Plat.CollectionChangeType.itemAdded === ev.eType || Plat.CollectionChangeType.reset === ev.eType)) {
            this._clearUnseen();
        }
    };

    prototype._onVisibilityChange = function(ev) {
        // Ensure the count is cleared and items are visible when coming back into view
        this._hidden = ev.target.hidden;
        var collection = this._collection;
        if (collection) {
            _mark("_onVisibilityChange:hidden=" + this._hidden + ";count=" + collection.count);
            if (!this._hidden && collection.count > 0) {
                this._list.ensureVisible(0);
                this._clearUnseen();
            }
        }
    };

    prototype._clearUnseen = function() {
        // Queue a 1.5 second timer before clearing the count to ensure we actually show the messages
        _mark("_clearUnseen");
        this._timer = this._disposer.replace(this._timer, new Jx.Timer(1500, this._onTimer, this));
    };

    prototype._onTimer = function () {
        _mark("_onTimer");
        this._view.clearUnseenMessages();
    };

    function _mark(str) {
        Jx.mark("Mail.UnseenMonitor." + str);
    }

});

