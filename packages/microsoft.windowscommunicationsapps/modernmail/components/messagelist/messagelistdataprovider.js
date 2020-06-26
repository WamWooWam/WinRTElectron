﻿Jx.delayDefine(Mail,["MessageListDataProvider","ViewDataProvider","SearchDataProvider"],function(){"use strict";function i(n){if(!n.isSyncCompleted)return Mail.Promises.waitForEvent(n,"syncStatusChanged",function(){return n.isSyncCompleted})}var n,t;Mail.MessageListDataProvider=function(){};Mail.MessageListDataProvider.prototype.dispose=Jx.fnEmpty;Object.defineProperty(Mail.MessageListDataProvider.prototype,"collection",{get:function(){return this._collection},enumerable:true});Object.defineProperty(Mail.MessageListDataProvider.prototype,"query",{get:function(){return this._query},enumerable:true});Object.defineProperty(Mail.MessageListDataProvider.prototype,"selectionMode",{get:function(){return"multi"},enumerable:true});n=Mail.ViewDataProvider=function(n,t,r){var o,s;var f=this._syncMonitor=t.syncMonitor,e=t.isViewReady&&f.getSyncStatus()===Mail.ViewSyncMonitor.SyncStatus.completed,u=this._query=new Mail.QueryCollection(r.apply,r,[n,t.threaded],true);this._whenSyncComplete=WinJS.Promise.then(i(f),function(){u.unlock();u.execQuery()});o=t.threaded?new Mail.ThreadedListCollection(Mail.Globals.platform,u,n,!e,t):Mail.MessageListCollection.createForMessages(u,n,!e,null);s=new Mail.FolderEndOfListItem(f);this._collection=new Mail.TrailingItemCollection(o,s)};Jx.inherit(n,Mail.MessageListDataProvider);n.prototype.dispose=function(){this._whenSyncComplete&&(this._whenSyncComplete.cancel(),this._whenSyncComplete=null)};t=Mail.SearchDataProvider=function(n,t,i,r){var u=new Mail.SearchEndOfListItem(n,t,i);this._collection=new Mail.TrailingItemCollection(n,u);this._selectionMode=n.searchResultsEditable?"multi":"single";this._accessibilityHelper=new Mail.SearchAccessibility(n,r)};Jx.inherit(t,Mail.MessageListDataProvider);Mail.SearchDataProvider.prototype.dispose=function(){this._accessibilityHelper.dispose()};Object.defineProperty(t.prototype,"selectionMode",{get:function(){return this._selectionMode},enumerable:true})})