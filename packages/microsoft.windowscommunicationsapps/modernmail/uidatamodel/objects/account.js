﻿Jx.delayDefine(Mail,"Account",function(){"use strict";function e(n){Jx.mark("Mail.Account."+n+",StartTA,Mail")}function f(n){Jx.mark("Mail.Account."+n+",StopTA,Mail")}var t=Microsoft.WindowsLive.Platform,n=t.MailViewType,u=Mail.UIDataModel.MailView,r=Mail.Account=function(n,i){this._platform=i;this._account=n;this._resource=n.getResourceByType(t.ResourceType.mail);this._views={};this.initForwarder(n)},i=r.prototype={get platform(){return this._platform},get platformObject(){return this._account},get objectId(){return this._account.objectId},get objectType(){return"Account"},get accountType(){return this._account.accountType},get name(){return this._account.displayName},get syncType(){return this._account.syncType},get sourceId(){return this._account.sourceId},get inboxView(){return this.getView(n.inbox)},get flaggedView(){return this.getView(n.flagged)},get draftsView(){return this.getView(n.draft)},get outboxView(){return this.getView(n.outbox)},get deletedView(){return this.getView(n.deletedItems)},get sentView(){return this.getView(n.sentItems)},get junkView(){return this.getView(n.junkMail)},get pinnedPeopleView(){return this.getView(n.allPinnedPeople)},get newsletterView(){return this.getView(n.newsletter)},get socialView(){return this.getView(n.social)},get isConnected(){return this._account.mailScenarioState===t.ScenarioState.connected},get mailResource(){return this._resource||(this._resource=this._account.getResourceByType(t.ResourceType.mail))},get peopleViewComplete(){return this._account.peopleViewComplete},get settingsResult(){return this._account.settingsResult},get canCreateFolders(){var n=this._resource;return n&&n.canCreateFolders},get canUpdateFolders(){var n=this._resource;return n&&n.canUpdateFolders},get canDeleteFolders(){var n=this._resource;return n&&n.canDeleteFolders},get emailAddress(){return this._account.emailAddress}};Jx.augment(r,Mail.PlatformEventForwarder);i.queryViews=function(n,t){var i=this._platform.mailManager;return new Mail.MappedCollection(new Mail.QueryCollection(i.getMailViews,i,[n,this._account.objectId],false,t||"getMailViews("+n+")"),function(n){return u.create(n,this)},this)};i.queryView=function(t,i){return this._queryView(t,i)};i._queryView=function(n,t){var i=this._platform.mailManager.ensureMailView(n,this._account.objectId,t);return u.create(i,this)};i.getView=function(t){var r=this._views,i=r[t];return i&&i.isObjectValid&&i.type===t||(i=r[t]=this._queryView(t,"")),i};i.createFolder=function(n,i){var r,u;return r=this._platform.folderManager.createFolder(this._account),r.folderName=n,r.folderType=t.FolderType.mail,i&&(u=i.platformMailFolder,u&&u.canHaveChildren&&(r.parentFolder=u)),r.ensureNameUnique(),r.commit(),r};r.load=function(n,t){e("load");var i=t.accountManager.loadAccount(n);return i?(f("load"),new Mail.Account(i,t)):(f("load"),null)};i.loadView=function(n){var t=this._platform.mailManager.tryLoadMailView(n);return t&&t.accountId===this.objectId?new u(t,this):null};i.loadMessage=function(n){var t=this._platform.mailManager.loadMessage(n);return t&&t.accountId===this.objectId?new Mail.UIDataModel.MailMessage(t,this):null};i.search=function(n,t,i){return this._platform.mailManager.search(this._account,n,t,i)};i.isMailEnabled=function(){var n=this.mailResource;return false||this.isConnected&&n&&n.isEnabled};r.isMailEnabled=function(n,i){return new r(n,i||Mail.Globals.platform).isMailEnabled()};i.isWlasSupported=function(){var n=this._account.getServerByType(t.ServerType.eas);return n&&n.isWlasSupported};r.isWlasSupported=function(n,i){return new r(n,i).isWlasSupported()}})