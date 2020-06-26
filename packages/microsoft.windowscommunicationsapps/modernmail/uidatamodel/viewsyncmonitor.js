﻿Jx.delayDefine(Mail,"ViewSyncMonitor",function(){"use strict";function u(n){Jx.mark("Mail.ViewSyncMonitor."+n+",StartTA,Mail")}function f(n){Jx.mark("Mail.ViewSyncMonitor."+n+",StopTA,Mail")}var r=Microsoft.WindowsLive.Platform,i=Mail.ViewSyncMonitor=function(n){u("ctor");this.initEvents();var i=n.account,r=this._resource=i.mailResource;this._disposer=new Mail.Disposer(new Mail.EventHook(r,"changed",this._resourceChanged,this),new Mail.EventHook(Mail.EventHook.getGlobalRootSource(),Mail.Utilities.ConnectivityMonitor.Events.connectivityChanged,this._onNetworkStatusChanged,this));this._syncStatus=t.notStarted;this._updateJob=null;this._update();f("ctor")},n,t;Jx.augment(i,Jx.Events);n=i.prototype;i.create=function(n){return n.type===r.MailViewType.allPinnedPeople?new Mail.AllPinnedViewSyncMonitor(n):n.folder?new Mail.FolderViewSyncMonitor(n):new Mail.FolderViewSyncMonitor(n.account.inboxView)};t=i.SyncStatus={notStarted:0,syncing:1,failed:2,completed:3,offline:4};n.dispose=function(){Jx.dispose(this._disposer)};Object.defineProperty(n,"isSyncCompleted",{get:function(){var n=this._syncStatus;return n===t.completed||n===t.offline||n===t.failed},enumerable:true});n._onNetworkStatusChanged=function(){this._queueUpdate()};n._resourceChanged=function(n){Mail.Validators.havePropertiesChanged(n,["isSynchronizing","lastSyncResult"])?this._queueUpdate():Mail.Validators.hasPropertyChanged(n,"syncWindowSize")&&this.raiseEvent("syncWindowChanged")};n._queueUpdate=function(){this._updateJob=this._disposer.replace(this._updateJob,Jx.scheduler.addJob(null,Mail.Priority.updateSyncStatus,"update sync status",this._update,this))};n._update=function(){u("update");var n=this._calculateSyncStatus(),t=this._syncStatus;Jx.log.info("Sync status "+t+"->"+n+" "+this._getLogString());n!==t&&(this._syncStatus=n,this.raiseEvent("syncStatusChanged"));f("update")};n._getLogString=n._getAccountLogString=function(){var n=this._resource;return"mailResource(id:"+n.objectId+",synchronizing:"+n.isSynchronizing+",lastSyncResult:"+n.lastSyncResult+")"};n.getSyncStatus=function(){return this._syncStatus};n.getSyncWindow=function(){return this._resource.syncWindowSize};n._calculateSyncStatus=n._getAccountSyncStatus=function(){var n=this._resource.lastSyncResult;return this._resource.isSynchronizing?t.syncing:n===0?t.completed:Mail.Utilities.ConnectivityMonitor.hasNoInternetConnection()?t.offline:n===r.Result.authNotAttempted?t.notStarted:t.failed}})