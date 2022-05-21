
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug*/
Jx.delayDefine(Mail, "ListViewVDSMonitor", function () {
    "use strict";

    ///<summary>The VDS (Virtualized List Datasource) of the ListView has a track record of dropping 
    ///notifications to the ListView (BLUE:22439, BLUE:424176) which results in count mismatches.
    ///This change wraps the ListView VDS with a monitor component that isolates the insanity of the 
    ///workaround with the rest of the code.  The monitor detects the count mismatch and calls invalidateAll
    ///to refresh the list when necessary.  When the ListView bug is fixed, we can remove the workaround 
    ///with the smallest code change by simply removing the wrapper for the notification handler.
    ///</summary>
    var ListViewVDSMonitor = Mail.ListViewVDSMonitor = function (collection, listView, notificationHandler) {
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isObject(listView));
        Debug.assert(Jx.isObject(notificationHandler));

        _markStart("Ctor");
        this._collection = collection;
        this._listView = listView;
        this._editor = notificationHandler;
        this._invalidateAllPromise = null;
        Debug.only(Object.seal(this));
        _markStop("Ctor");
    };

    ListViewVDSMonitor.prototype = {
        beginNotifications: function () {
            if (this._editor) {
                this._editor.beginNotifications();
                _markInfo("beginNotifications count:=" + this._collection.count);
            }
        },
        endNotifications: function () {
            if (this._editor) {
                // The call to endNotifications can run to completion and raises a loadingstate complete event
                // synchronously.  Upon the complete event, we try to process more notifications and update the list view,
                // causing this function to get potentially called on top of itself.
                this._editor.endNotifications();
                _markInfo("endNotifications count:=" + this._collection.count);
                this._ensureCountInSync();                
            }
        },
        inserted: function (item, prevKey, nextKey, index) {
            if (this._editor) {
                this._editor.inserted(item, prevKey, nextKey);
                _markInfo("inserted index:=" + index +
                    " key:=" + item.key +
                    " prevKey:= " + prevKey +
                    " nextKey:= " + nextKey +
                    " count:=" + this._collection.count
                );
            }
        },
        moved: function (item, prevKey, nextKey, prevIndex, index) {
            if (this._editor) {
                this._editor.moved(item, prevKey, nextKey, prevIndex, index);
                _markInfo("moved  key:=" + item.key +
                    " prevKey:= " + prevKey +
                    " nextKey:= " + nextKey +
                    " prevIndex:=" + prevIndex +
                    " index:=" + index +
                    " count:=" + this._collection.count
                );
            }
        },
        removed: function (id) {
            if (this._editor) {
                this._editor.removed(id);
                _markInfo("removed objectId:=" + id + " count:=" + this._collection.count);
            }
        },
        _getListViewCount: function () {
            // It is not ideal to access listView privates but this is the ListView's team recommended way
            // of detecting a count mismatch
            var cachedCount = this._listView._cachedCount;
            Debug.assert(Jx.isNumber(cachedCount), "ListView privates changed");
            return cachedCount;
        },
        _ensureCountInSync: function () {
            // if the editor is already null, we are in the process of refreshing the listView, don't do anything
            if (this._editor) {
                var cachedCount = this._getListViewCount(),
                    collectionCount = this._collection.count;
                if (cachedCount !== collectionCount) {
                    Jx.log.error("Mail.ListViewVDSMonitor count mismatch listView:=" + cachedCount + " collection:=" + collectionCount);

                    // Null out this._editor to ignore incoming notifications while refreshing to avoid unnecessary edits.
                    var VDSEditor = this._editor;
                    this._editor = null;

                    Debug.assert(this._invalidateAllPromise === null);
                    this._invalidateAllPromise = VDSEditor.invalidateAll();
                    this._invalidateAllPromise.then(function (editor) {
                        this._invalidateAllPromise = null;
                        this._editor = editor;
                    }.bind(this, VDSEditor));
                }
            }
        },
        dispose: function () {
            _markStart("dispose");
            if (this._invalidateAllPromise) {
                // The invalidatePromise implementation has no effect on canceling under the hood.
                // However, still calling cancel here for consistency
                this._invalidateAllPromise.cancel();
                this._invalidateAllPromise = null;
            }
            _markStop("dispose");
        }
    };

    function _markInfo(s) { Jx.mark("ListViewVDSMonitor:" + s); }
    function _markStart(s) { Jx.mark("ListViewVDSMonitor." + s + ",StartTA,ListViewVDSMonitor"); }
    function _markStop(s) { Jx.mark("ListViewVDSMonitor." + s + ",StopTA,ListViewVDSMonitor"); }
});

