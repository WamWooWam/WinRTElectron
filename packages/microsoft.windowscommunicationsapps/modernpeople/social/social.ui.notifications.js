﻿//! Copyright (c) Microsoft Corporation. All rights reserved.
Jx.delayDefine(People.RecentActivity.UI.Notifications,["NotificationPanel","NotificationLayout"],function(){People.loadSocialModel();People.loadSocialUICore();People.RecentActivity.UI.Host.LandingPagePanelProvider;$include("$(cssResources)/Social.css");People.RecentActivity.UI.Notifications.NotificationControl=function(n,t){People.RecentActivity.UI.Core.Control.call(this,People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.notificationItem));this._entry$1=t;this._network$1=n};Jx.inherit(People.RecentActivity.UI.Notifications.NotificationControl,People.RecentActivity.UI.Core.Control);People.RecentActivity.UI.Notifications.NotificationControl._convertType$1=function(n){var t=People.RecentActivity.FeedObjectType.none;switch(n){case People.RecentActivity.NotificationType.entry:case People.RecentActivity.NotificationType.video:t=People.RecentActivity.FeedObjectType.entry;break;case People.RecentActivity.NotificationType.photo:t=People.RecentActivity.FeedObjectType.photo;break;case People.RecentActivity.NotificationType.photoAlbum:t=People.RecentActivity.FeedObjectType.photoAlbum}return t.toString()};People.RecentActivity.UI.Notifications.NotificationControl.prototype._network$1=null;People.RecentActivity.UI.Notifications.NotificationControl.prototype._entry$1=null;People.RecentActivity.UI.Notifications.NotificationControl.prototype._contentContainer$1=null;People.RecentActivity.UI.Notifications.NotificationControl.prototype._identity$1=null;People.RecentActivity.UI.Notifications.NotificationControl.prototype._text$1=null;People.RecentActivity.UI.Notifications.NotificationControl.prototype._timeVia$1=null;People.RecentActivity.UI.Notifications.NotificationControl.prototype._displayUnread$1=false;People.RecentActivity.UI.Notifications.NotificationControl.prototype.applyState=function(n){this._displayUnread$1=n.isu;this._applyUnreadStyle$1()};People.RecentActivity.UI.Notifications.NotificationControl.prototype.getState=function(){return People.RecentActivity.UI.Notifications.create_notificationControlHydrationData(this._displayUnread$1)};People.RecentActivity.UI.Notifications.NotificationControl.prototype.invoke=function(){this._navigate$1()};People.RecentActivity.UI.Notifications.NotificationControl.prototype.onDisposed=function(){this._text$1!=null&&(this._text$1.dispose(),this._text$1=null);this._timeVia$1!=null&&(this._timeVia$1.dispose(),this._timeVia$1=null);this._identity$1!=null&&(this._identity$1.dispose(),this._identity$1=null);this._contentContainer$1!=null&&(this._contentContainer$1.dispose(),this._contentContainer$1=null);People.RecentActivity.UI.Core.TimestampUpdateTimer.unsubscribe(this._onUpdateTimerElapsed$1,this)};People.RecentActivity.UI.Notifications.NotificationControl.prototype.onRendered=function(){var n,t,i,r;People.RecentActivity.Core.EtwHelper.writeNotificationEvent(People.RecentActivity.Core.EtwEventName.uiRenderNotificationControlStart,this._entry$1.info);this.addClass("sn-item-"+this._entry$1.sourceId);n=this.element;t=n.children[1];this._identity$1=new People.RecentActivity.UI.Core.ContactControl(this._entry$1.publisher.getDataContext(),false);this._contentContainer$1=new People.RecentActivity.UI.Core.Control(t);this._text$1=new People.RecentActivity.UI.Core.Control(t.children[0]);this._text$1.id=this._text$1.uniqueId;this._entry$1.isReply||this._entry$1.isShare?(i=this._identity$1.getElement(People.RecentActivity.UI.Core.ContactControlType.name,People.RecentActivity.Imports.create_identityElementContextOptions(this._entry$1.sourceId)),this._text$1.appendChild(i),this._text$1.appendChild(document.createTextNode(" "+this._entry$1.message.replace("@","‪@‬")))):this._text$1.text=this._entry$1.message.replace("@","‪@‬");this._timeVia$1=new People.RecentActivity.UI.Core.Control(t.children[1]);this._timeVia$1.id=this._timeVia$1.uniqueId;this.labelledBy=this._text$1.id+" "+this._timeVia$1.id;r=n.children[0];r.appendChild(this._identity$1.getElement(People.RecentActivity.UI.Core.ContactControlType.tile,People.RecentActivity.Imports.create_identityElementTileOptions(60,null)));this._identity$1.activate(n);this._updateTimeVia$1();this._updateUnreadStatus$1();People.RecentActivity.UI.Core.TimestampUpdateTimer.subscribe(this._onUpdateTimerElapsed$1,this);People.RecentActivity.Core.EtwHelper.writeNotificationEvent(People.RecentActivity.Core.EtwEventName.uiRenderNotificationControlStop,this._entry$1.info)};People.RecentActivity.UI.Notifications.NotificationControl.prototype._updateTimeVia$1=function(){var i=this._entry$1.timestamp,n=People.RecentActivity.UI.Core.LocalizationHelper.getTimeString(i),t=this._entry$1.via;Jx.isNonEmptyString(t)&&(n=Jx.res.loadCompoundString("/strings/notificationItemVia",n,t));this._timeVia$1.text=n};People.RecentActivity.UI.Notifications.NotificationControl.prototype._applyUnreadStyle$1=function(){this._displayUnread$1?(this._contentContainer$1.label=Jx.res.getString("/strings/notificationUnreadLabel"),this.addClass("sn-itemUnread")):(this._contentContainer$1.label=Jx.res.getString("/strings/notificationReadLabel"),this.removeClass("sn-itemUnread"))};People.RecentActivity.UI.Notifications.NotificationControl.prototype._updateUnreadStatus$1=function(){this._displayUnread$1=this._entry$1.isUnreadInUI;this._applyUnreadStyle$1()};People.RecentActivity.UI.Notifications.NotificationControl.prototype._navigate$1=function(){this._displayUnread$1=false;switch(this._entry$1.objectType){case People.RecentActivity.NotificationType.entry:case People.RecentActivity.NotificationType.photo:case People.RecentActivity.NotificationType.photoAlbum:this._navigateToSelfPage$1();break;case People.RecentActivity.NotificationType.person:this._navigateToPerson$1();break;default:this._navigateToUrl$1()}};People.RecentActivity.UI.Notifications.NotificationControl.prototype._navigateToSelfPage$1=function(){var n=People.RecentActivity.UI.Core.create_selfPageNavigationData(this._entry$1.sourceId,this._entry$1.objectId,People.RecentActivity.UI.Notifications.NotificationControl._convertType$1(this._entry$1.objectType));n.fallbackUrl=this._entry$1.link;People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigate(this._network$1.identity.id,n)};People.RecentActivity.UI.Notifications.NotificationControl.prototype._navigateToPerson$1=function(){var n=this._entry$1.publisher,t=n.personId,i;Jx.isNonEmptyString(t)?People.Nav.navigate(People.Nav.getViewPersonUri(t,null)):(i=n.getDataContext(),People.Nav.navigate(People.Nav.getViewPersonUri(null,i)))};People.RecentActivity.UI.Notifications.NotificationControl.prototype._navigateToUrl$1=function(){var n=this._entry$1.link;Jx.isNonEmptyString(n)&&(People.RecentActivity.Core.BiciHelper.createClickThroughDatapoint(this._entry$1.sourceId,People.RecentActivity.Core.BiciClickthroughAction.unsupportedNotification),People.RecentActivity.UI.Core.UriHelper.launchUri(n))};People.RecentActivity.UI.Notifications.NotificationControl.prototype._onUpdateTimerElapsed$1=function(){this._updateTimeVia$1()};People.RecentActivity.UI.Notifications.create_notificationControlHydrationData=function(n){var t={};return t.isu=n,t},function(){var n=3;People.RecentActivity.UI.Notifications.NotificationLayout=function(n,t){People.RecentActivity.UI.Core.Control.call(this,t);this._controls$1={};this._identity$1=n;this._lastResult$1=new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);this._itemInvokedHandler$1=this._onItemInvoked$1.bind(this);this._contentAnimatingHandler=this._onContentAnimating$1.bind(this);this._loadingStateChangedHandler$1=this._onLoadingStateChanged$1.bind(this);this._layoutLoadingStateChangedHandler$1=this._onLayoutLoadingStateChanged$1.bind(this)};Jx.inherit(People.RecentActivity.UI.Notifications.NotificationLayout,People.RecentActivity.UI.Core.Control);People.RecentActivity.UI.Notifications.NotificationLayout.prototype._identity$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._hydrationData$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._network$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._notifications$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._collection$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._content$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._contentErrors$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._contentPsa$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._refresh$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._refreshing$1=false;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._gridDataSource$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._grid$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._controls$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._psa$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._errors$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._itemInvokedHandler$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._contentAnimatingHandler=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._loadingStateChangedHandler$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._layoutLoadingStateChangedHandler$1=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._isRenderComplete$1=false;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._itemsLoaded=false;People.RecentActivity.UI.Notifications.NotificationLayout.prototype._animationPromise=null;People.RecentActivity.UI.Notifications.NotificationLayout.prototype.initialize=function(n){this._network$1=this._identity$1.networks.aggregatedNetwork;this._notifications$1=this._network$1.notifications;this._notifications$1.addListener("refreshcompleted",this._onRefreshCompleted$1,this);this._collection$1=this._notifications$1.notifications;this._hydrationData$1=n;var t=this._identity$1.capabilities;t.addListener("propertychanged",this._onCapabilitiesPropertyChanged$1,this);t.canShowNotifications&&this._initializeInternal$1();People.RecentActivity.Core.BiciHelper.setCurrentPageName(People.RecentActivity.Core.BiciPageNames.notifications);People.RecentActivity.Core.BiciHelper.createPageViewDatapoint(this._network$1.id)};People.RecentActivity.UI.Notifications.NotificationLayout.prototype.getState=function(){var t,i,r;if(this._grid$1!=null){t={};for(i in this._controls$1)r={key:i,value:this._controls$1[i]},t[r.key]=r.value.getState();return People.RecentActivity.UI.Notifications.create_notificationLayoutHydrationData(n,this._grid$1.indexOfFirstVisible,this._grid$1.currentItem,t)}return null};People.RecentActivity.UI.Notifications.NotificationLayout.prototype.deactivate=function(){this._notifications$1!=null&&this._notifications$1.markAllNotificationsReadInUI()};People.RecentActivity.UI.Notifications.NotificationLayout.prototype.refresh=function(){this._onRefreshClicked$1(null)};People.RecentActivity.UI.Notifications.NotificationLayout.prototype.onLayoutChanged=function(){this._grid$1.addEventListener("loadingstatechanged",this._layoutLoadingStateChangedHandler$1,false)};People.RecentActivity.UI.Notifications.NotificationLayout.prototype.onDisposed=function(){var n,t;if(this._network$1=null,this._refresh$1=null,this._lastResult$1=null,People.RecentActivity.UI.Core.SnapManager.removeControl(this),People.RecentActivity.UI.Core.KeyboardRefresher.removeControl(this),this._animationPromise!=null&&(this._animationPromise.cancel(),this._animationPromise=null),this._identity$1!=null&&(this._identity$1.capabilities.removeListenerSafe("propertychanged",this._onCapabilitiesPropertyChanged$1,this),this._identity$1.dispose(),this._identity$1=null),this._notifications$1!=null&&(this._notifications$1.markAllNotificationsReadInUI(),this._notifications$1.removeListenerSafe("initializecompleted",this._onInitializeCompleted$1,this),this._notifications$1.removeListenerSafe("refreshcompleted",this._onRefreshCompleted$1,this),this._notifications$1=null),this._collection$1!=null&&(this._collection$1.removeListenerSafe("collectionchanged",this._onCollectionChanged$1,this),this._collection$1=null),this._content$1!=null&&(this._content$1.dispose(),this._content$1=null),this._contentErrors$1!=null&&(this._contentErrors$1.dispose(),this._contentErrors$1=null),this._contentPsa$1!=null&&(this._contentPsa$1.dispose(),this._contentPsa$1=null),this._psa$1!=null&&(this._psa$1.dispose(),this._psa$1=null),this._errors$1!=null&&(this._errors$1.dispose(),this._errors$1=null),this._controls$1!=null){for(n in this._controls$1)t={key:n,value:this._controls$1[n]},t.value.dispose();People.Social.clearKeys(this._controls$1);this._controls$1=null}this._grid$1!=null&&(this._grid$1.element!=null&&(this._grid$1.removeEventListener("iteminvoked",this._itemInvokedHandler$1,false),this._grid$1.removeEventListener("contentanimating",this._contentAnimatingHandler,false),this._grid$1.removeEventListener("loadingstatechanged",this._loadingStateChangedHandler$1,false),this._grid$1.removeEventListener("loadingstatechanged",this._layoutLoadingStateChangedHandler$1,false)),this._itemInvokedHandler$1=null,this._contentAnimatingHandler=null,this._loadingStateChangedHandler$1=null,this._layoutLoadingStateChangedHandler$1=null,this._grid$1=null,this._gridDataSource$1=null);People.RecentActivity.UI.Core.Control.prototype.onDisposed.call(this)};People.RecentActivity.UI.Notifications.NotificationLayout.prototype.onRendered=function(){this._renderInternal$1();People.RecentActivity.UI.Core.Control.prototype.onRendered.call(this)};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._initializeInternal$1=function(){this._notifications$1.initialized?this._hydrationData$1==null&&this._onRefreshClicked$1(null):(People.RecentActivity.UI.Core.GlobalProgressControl.add(this),this._notifications$1.addListener("initializecompleted",this._onInitializeCompleted$1,this),this._hydrationData$1!=null?this._notifications$1.initializeFromHydration():this._notifications$1.initialize())};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._renderInternal$1=function(){var n,t;this.isRendered&&this._notifications$1.initialized&&(this._isRenderComplete$1=true,this.element.style.opacity=0,n=People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.notificationLayout),this.element.appendChild(n),this._content$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(n,"notification-list-content"),this._errors$1=new People.RecentActivity.UI.Core.ErrorMessageControl(this._identity$1,People.RecentActivity.UI.Core.ErrorMessageContext.notifications,People.RecentActivity.UI.Core.ErrorMessageOperation.read),this._errors$1.render(),this._contentErrors$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(n,"notification-list-content-errors"),this._contentErrors$1.isVisible=false,this._contentErrors$1.appendControl(this._errors$1),this._psa$1=new People.RecentActivity.UI.Core.PsaUpsellControl,this._psa$1.render(),this._contentPsa$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(n,"notification-list-content-psa"),this._contentPsa$1.appendControl(this._psa$1),this._renderList$1(),this._refresh$1=new People.Command("notifications-refresh","/strings/raRefresh","/strings/raRefreshTooltip","",true,false,null,this._onRefreshClicked$1.bind(this)),t=Jx.root.getCommandBar(),t.addCommand(this._refresh$1),t.refresh(),this._collection$1.addListener("collectionchanged",this._onCollectionChanged$1,this),this._applyState$1(),this._notifications$1.markAllNotificationsRead(),this._setContentVisibility$1(),this._setRefreshVisibility$1(),People.RecentActivity.UI.Core.KeyboardRefresher.addControl(this))};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._renderList$1=function(){var n=this._content$1.element;this._gridDataSource$1=new WinJS.Binding.List;this._grid$1=new WinJS.UI.ListView(n);this._grid$1.addEventListener("iteminvoked",this._itemInvokedHandler$1,false);this._grid$1.addEventListener("contentanimating",this._contentAnimatingHandler,false);this._grid$1.itemDataSource=this._gridDataSource$1.dataSource;this._grid$1.itemTemplate=this._onRenderingItem$1.bind(this);this._grid$1.loadingBehavior="randomaccess";this._grid$1.selectionMode="none";this._applyGridLayout$1(People.RecentActivity.UI.Core.SnapManager.currentLayout);People.RecentActivity.UI.Core.SnapManager.addControl(this);this._addNotifications$1(this._collection$1.toArray(),0)};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._applyGridLayout$1=function(n){this._grid$1!=null&&(this._grid$1.layout=n==="snapped"?new WinJS.UI.ListLayout:new WinJS.UI.GridLayout)};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._applyState$1=function(){var t,i,r;if(this._hydrationData$1!=null&&this._hydrationData$1.v===n){for(t in this._hydrationData$1.cd)i={key:t,value:this._hydrationData$1.cd[t]},r=i.key,Jx.isUndefined(this._controls$1[r])||this._controls$1[r].applyState(i.value);try{this._grid$1.indexOfFirstVisible=this._hydrationData$1.i;this._grid$1.currentItem=this._hydrationData$1.ci}catch(u){Jx.log.write(3,"Failed to set state on grid: "+u.toString())}}this._hydrationData$1=null};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._addNotifications$1=function(n,t){var r,i,u;for(this._setContentVisibility$1(),this._grid$1.addEventListener("loadingstatechanged",this._loadingStateChangedHandler$1,false),r=this._grid$1.itemDataSource,r.beginEdits(),i=0,u=n.length;i<u;i++)this._gridDataSource$1.splice(t++,0,n[i]);r.endEdits()};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._removeNotifications$1=function(n){var i,t,u,r;for(this._grid$1.addEventListener("loadingstatechanged",this._loadingStateChangedHandler$1,false),i=this._grid$1.itemDataSource,i.beginEdits(),t=0;t<n.length;t++)u=n[t],r=this._gridDataSource$1.indexOf(u),r!==-1&&this._gridDataSource$1.splice(r,1);i.endEdits();this._setContentVisibility$1()};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._getNotificationKey$1=function(n){return n.sourceId+";"+n.objectId+";"+n.id+";"+n.publisher.id};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._setContentVisibility$1=function(){if(this._isRenderComplete$1){this._content$1.isVisible=false;this._contentErrors$1.isVisible=false;this._contentPsa$1.isVisible=false;var n=this._notifications$1.initialized;n&&!this._identity$1.capabilities.canShowNotifications?this._contentPsa$1.isVisible=true:n&&!this._notifications$1.notifications.count?(this._contentErrors$1.isVisible=true,this._errors$1.location=People.RecentActivity.UI.Core.ErrorMessageLocation.inline,this._lastResult$1.code===People.RecentActivity.Core.ResultCode.success?this._errors$1.showType(People.RecentActivity.UI.Core.ErrorMessageType.empty):this._errors$1.show(this._lastResult$1)):(this._content$1.isVisible=true,this._errors$1.location=People.RecentActivity.UI.Core.ErrorMessageLocation.inline,this._errors$1.show(this._lastResult$1))}};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._setRefreshVisibility$1=function(){if(this._isRenderComplete$1){var n=Jx.root.getCommandBar();this._notifications$1.initialized&&this._identity$1.capabilities.canShowNotifications?n.showCommand(this._refresh$1.commandId):n.hideCommand(this._refresh$1.commandId)}};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onLoadingStateChanged$1=function(n){var t,i,r;t=n.detail;this._grid$1.loadingState==="complete"?(t!=null&&t.scrolling||this._gridDataSource$1.length>0&&(i=this._getNotificationKey$1(this._gridDataSource$1.getAt(0)),Jx.isUndefined(this._controls$1[i])||this._controls$1[i].setActive()),this._grid$1.removeEventListener("loadingstatechanged",this._loadingStateChangedHandler$1,false)):this._grid$1.loadingState!=="itemsLoaded"||this._itemsLoaded||(this._itemsLoaded=true,r=this,this._animationPromise=People.Animation.enterPage(this.element).done(function(){r._animationPromise=null}),this._refreshing$1||People.RecentActivity.UI.Core.GlobalProgressControl.remove(this))};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onLayoutLoadingStateChanged$1=function(){this._grid$1.loadingState==="complete"&&(this._grid$1.removeEventListener("loadingstatechanged",this._layoutLoadingStateChangedHandler$1,false),this._applyGridLayout$1(People.RecentActivity.UI.Core.SnapManager.currentLayout))};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onItemInvoked$1=function(n){var i=People.RecentActivity.UI.Core.MoCoHelper.getItemFromEvent(this._gridDataSource$1,n.detail),t=this._getNotificationKey$1(i);Jx.isUndefined(this._controls$1[t])||this._controls$1[t].invoke()};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onRenderingItem$1=function(n){var t=this;return n.then(function(n){var u,i,r;return t.isDisposed?null:(u=t._gridDataSource$1.getAt(n.index),i=t._getNotificationKey$1(u),Jx.isUndefined(t._controls$1[i])||(t._controls$1[i].dispose(),t._controls$1[i]=null),r=new People.RecentActivity.UI.Notifications.NotificationControl(t._network$1,u),r.render(),t._controls$1[i]=r,r.element)})};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onInitializeCompleted$1=function(n){this._notifications$1.removeListenerSafe("initializecompleted",this._onInitializeCompleted$1,this);People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);this._lastResult$1=n.result;this._renderInternal$1();this._setContentVisibility$1()};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onRefreshCompleted$1=function(n){this._refreshing$1=false;this._lastResult$1=n.result;this._itemsLoaded&&People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);this._setContentVisibility$1();this._lastResult$1.isSuccessOrPartialFailure&&this._notifications$1.markAllNotificationsRead()};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onContentAnimating$1=function(n){n.detail.type===WinJS.UI.ListViewAnimationType.entrance&&n.preventDefault()};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onRefreshClicked$1=function(){this._notifications$1.initialized&&!this._refreshing$1&&(People.RecentActivity.UI.Core.GlobalProgressControl.add(this),this._refreshing$1=true,this._notifications$1.refresh())};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onCollectionChanged$1=function(n){switch(n.action){case People.RecentActivity.NotifyCollectionChangedAction.add:this._addNotifications$1(n.newItems,n.newItemIndex);break;case People.RecentActivity.NotifyCollectionChangedAction.remove:this._removeNotifications$1(n.oldItems)}};People.RecentActivity.UI.Notifications.NotificationLayout.prototype._onCapabilitiesPropertyChanged$1=function(n){if(n.propertyName==="CanShowNotifications"){var t=n.sender;t.canShowNotifications&&this._initializeInternal$1();this._setContentVisibility$1();this._setRefreshVisibility$1()}}}();People.RecentActivity.UI.Notifications.create_notificationLayoutHydrationData=function(n,t,i,r){var u={};return u.cd=r,u.ci=i,u.i=t,u.v=n,u},function(){var n=8;People.RecentActivity.UI.Notifications.NotificationPanel=function(n,t){People.RecentActivity.Imports.Panel.call(this,null,"ra-notificationPanelOuter panelView-snapActivePanel",People.PanelView.PanelPosition.notificationsPanel);this._lastResult$1=new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success);this._controls$1={};this._hydrationData$1=t;this._identity$1=n;this._itemInvokedHandler$1=this._onItemInvoked$1.bind(this)};Jx.inherit(People.RecentActivity.UI.Notifications.NotificationPanel,People.RecentActivity.Imports.Panel);People.RecentActivity.UI.Notifications.NotificationPanel.prototype._identity$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._network$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._notifications$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._collection$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._element$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._title$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._titleName$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._titleMore$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._content$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._contentViewport$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._contentErrors$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._errors$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._isDisposed$1=false;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._isNavigatingToFull$1=false;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._isReady$1=false;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._isInitialized$1=false;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._grid$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._gridDataSource$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._maximumCount$1=0;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._controls$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._hydrationData$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._notificationHeight$1=0;People.RecentActivity.UI.Notifications.NotificationPanel.prototype._itemInvokedHandler$1=null;People.RecentActivity.UI.Notifications.NotificationPanel.prototype.activateUI=function(n){People.RecentActivity.UI.Core.EventManager.events.addListener("windowresized",this._onWindowResized$1,this);People.RecentActivity.UI.Core.SnapManager.addControl(this);this._element$1=n;this._title$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(n,"panel-title");this._title$1.attach("keypress",this._onTitleKeyPress$1.bind(this));this._title$1.attach("click",this._onTitleClicked$1.bind(this));this._titleName$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1,"panel-title-name");this._titleName$1.id=this._titleName$1.uniqueId;this._titleName$1.text=Jx.res.getString("/strings/raNotificationPanelTitle");this._titleMore$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(this._element$1,"panel-title-more");this._titleMore$1.id=this._titleMore$1.uniqueId;this._titleMore$1.text=People.RecentActivity.UI.Core.HtmlHelper.isRightToLeft?"":"";People.Animation.addPressStyling(this._title$1.element);this._content$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(n,"panel-content");this._content$1.labelledBy=this._titleName$1.id+" "+this._titleMore$1.id;this._content$1.render();this._contentViewport$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(n,"panel-viewport");this._contentViewport$1.render();this._errors$1=new People.RecentActivity.UI.Core.ErrorMessageControl(this._identity$1,People.RecentActivity.UI.Core.ErrorMessageContext.notifications,People.RecentActivity.UI.Core.ErrorMessageOperation.read);this._contentErrors$1=People.RecentActivity.UI.Core.HtmlHelper.findOrCreateControlById(n,"panel-errors");this._contentErrors$1.render();this._contentErrors$1.appendControl(this._errors$1);this._contentErrors$1.isVisible=false;this._network$1=this._identity$1.networks.aggregatedNetwork;this._notifications$1=this._network$1.notifications;this._collection$1=this._notifications$1.notifications;var t=this;window.msSetImmediate(function(){t._isDisposed$1||(t._notifications$1.initialized?t._hydrationData$1==null?(t._notifications$1.addListener("refreshcompleted",t._onNotificationsRefreshCompleted$1,t),t._notifications$1.refresh()):(t._lastResult$1=new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success),t._isInitialized$1=true,t._onReady$1()):(t._notifications$1.addListener("initializecompleted",t._onNotificationsInitializeCompleted$1,t),t._hydrationData$1!=null?t._notifications$1.initializeFromHydration():t._notifications$1.initialize()))})};People.RecentActivity.UI.Notifications.NotificationPanel.prototype.getUI=function(){return People.RecentActivity.UI.Core.Html.notificationPanel};People.RecentActivity.UI.Notifications.NotificationPanel.prototype.deactivateUI=function(){var n,t;if(this._isDisposed$1=true,People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowresized",this._onWindowResized$1,this),People.RecentActivity.UI.Core.SnapManager.removeControl(this),this._identity$1=null,this._network$1=null,this._element$1=null,this._lastResult$1=null,this._notifications$1!=null&&(this._isNavigatingToFull$1||this._notifications$1.markAllNotificationsReadInUI(),this._notifications$1.removeListenerSafe("initializecompleted",this._onNotificationsInitializeCompleted$1,this),this._notifications$1.removeListenerSafe("refreshcompleted",this._onNotificationsRefreshCompleted$1,this),this._notifications$1=null,this._collection$1=null),this._controls$1!=null){for(n in this._controls$1)t={key:n,value:this._controls$1[n]},t.value.dispose();People.Social.clearKeys(this._controls$1);this._controls$1=null}this._title$1!=null&&(this._title$1.dispose(),this._title$1=null);this._titleName$1!=null&&(this._titleName$1.dispose(),this._titleName$1=null);this._titleMore$1!=null&&(this._titleMore$1.dispose(),this._titleMore$1=null);this._content$1!=null&&(this._content$1.dispose(),this._content$1=null);this._contentViewport$1!=null&&(this._contentViewport$1.dispose(),this._contentViewport$1=null);this._contentErrors$1!=null&&(this._contentErrors$1.dispose(),this._contentErrors$1=null);this._errors$1!=null&&(this._errors$1.dispose(),this._errors$1=null);this._grid$1!=null&&(this._grid$1.element!=null&&this._grid$1.removeEventListener("iteminvoked",this._itemInvokedHandler$1,false),this._itemInvokedHandler$1=null,this._grid$1=null,this._gridDataSource$1=null)};People.RecentActivity.UI.Notifications.NotificationPanel.prototype.ready=function(){this._isReady$1=true;this._onReady$1()};People.RecentActivity.UI.Notifications.NotificationPanel.prototype.suspend=function(){return{}};People.RecentActivity.UI.Notifications.NotificationPanel.prototype.onLayoutChanged=function(n){Jx.log.write(4,"NotificationPanel.OnLayoutchanged: "+n);this._onReady$1();var t=this._element$1.querySelector(".ra-notificationLayoutGrid").winControl;t&&(t.layout=n===People.Layout.layoutState.snapped?new WinJS.UI.ListLayout:new WinJS.UI.GridLayout)};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._getNotificationKey$1=function(n){return n.sourceId+";"+n.objectId+";"+n.id+";"+n.publisher.id};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._updateNotifications=function(n){this._hideProgress$1();var t=this._grid$1.itemDataSource;t.beginEdits();this._updateNotificationsList(n);t.endEdits();this._updateErrorState$1()};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._updateNotificationsList=function(n){for(var r,t=0,i=0;i<n.length&&t<this._maximumCount$1;i++,t++)r=this._gridDataSource$1.indexOf(n[i]),r===-1?this._gridDataSource$1.splice(t,0,n[i]):r<t?t--:r>t&&this._gridDataSource$1.splice(t,r-t);this._content$1.element.style.height=t*this._notificationHeight$1+"px";this._gridDataSource$1.length=t};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onReady$1=function(){var t,i;this._isReady$1&&(this._isInitialized$1&&this._hideProgress$1(),this._grid$1==null&&this._gridDataSource$1==null&&(this._content$1.attach("keyboardnavigating",this._onKeyboardNavigating$1.bind(this)),this._gridDataSource$1=new WinJS.Binding.List,this._grid$1=new WinJS.UI.ListView(this._contentViewport$1.element),this._grid$1.addEventListener("iteminvoked",this._itemInvokedHandler$1,false),this._grid$1.itemDataSource=this._gridDataSource$1.dataSource,this._grid$1.itemTemplate=this._onRenderingItem$1.bind(this),this._grid$1.layout=Jx.root.getLayout().getLayoutState()===People.Layout.layoutState.snapped?new WinJS.UI.ListLayout:new WinJS.UI.GridLayout,this._grid$1.loadingBehavior="randomaccess",this._grid$1.selectionMode="none"),t=People.RecentActivity.UI.Core.HtmlHelper.createElement(People.RecentActivity.UI.Core.Html.notificationItem),this._content$1.appendChild(t),this._notificationHeight$1=WinJS.Utilities.getTotalHeight(t)+n,this._content$1.removeChild(t),Jx.root.getLayout().getLayoutState()===People.Layout.layoutState.snapped?this._maximumCount$1=4:(this._content$1.element.style.height="auto",this._maximumCount$1=Math.floor(this._content$1.element.clientHeight/this._notificationHeight$1)),i=this,window.msSetImmediate(function(){i._isDisposed$1||i._updateNotifications(i._collection$1.toArray())}),this._notifications$1.markAllNotificationsRead())};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._updateErrorState$1=function(){this._contentErrors$1.isVisible=false;this._gridDataSource$1.length>0?(this._errors$1.location=People.RecentActivity.UI.Core.ErrorMessageLocation.messageBar,this._errors$1.show(this._lastResult$1)):this._isInitialized$1&&(this._contentErrors$1.isVisible=true,this._content$1.element.style.height="auto",this._errors$1.location=People.RecentActivity.UI.Core.ErrorMessageLocation.inline,this._lastResult$1.code===People.RecentActivity.Core.ResultCode.success?this._errors$1.showType(People.RecentActivity.UI.Core.ErrorMessageType.empty):this._errors$1.show(this._lastResult$1))};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._hideProgress$1=function(){var n=People.RecentActivity.UI.Core.HtmlHelper.findElementById(this._element$1,"panel-progress");n!=null&&n.parentNode.removeChild(n)};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._navigateToFull$1=function(){this._isNavigatingToFull$1=true;People.Nav.navigate(People.Nav.getNotificationUri(null))};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onItemInvoked$1=function(n){var i,t,r;i=People.RecentActivity.UI.Core.MoCoHelper.getItemFromEvent(this._gridDataSource$1,n.detail);t=this._getNotificationKey$1(i);Jx.isUndefined(this._controls$1[t])||(r=this._controls$1[t],r.invoke())};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onRenderingItem$1=function(n){var t=this;return n.then(function(n){var u,i,r;return t._isDisposed$1?null:(u=t._gridDataSource$1.getAt(n.index),i=t._getNotificationKey$1(u),Jx.isUndefined(t._controls$1[i])||(t._controls$1[i].dispose(),t._controls$1[i]=null),r=new People.RecentActivity.UI.Notifications.NotificationControl(t._network$1,u),r.render(),t._controls$1[i]=r,r.element)})};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onNotificationsInitializeCompleted$1=function(n){this._lastResult$1=n.result;this._isInitialized$1=true;this._onReady$1()};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onNotificationsRefreshCompleted$1=function(n){this._lastResult$1=n.result;this._isInitialized$1=true;this._onReady$1()};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onTitleKeyPress$1=function(n){(n.keyCode===WinJS.Utilities.Key.enter||n.keyCode===WinJS.Utilities.Key.space)&&this._navigateToFull$1()};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onTitleClicked$1=function(){this._navigateToFull$1()};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onKeyboardNavigating$1=function(n){var i=n.detail,t=this._getNotificationKey$1(this._gridDataSource$1.getAt(i.newFocus));Jx.isUndefined(this._controls$1[t])||People.RecentActivity.UI.Core.ScrollHelper.scrollIntoView(this._controls$1[t].element)};People.RecentActivity.UI.Notifications.NotificationPanel.prototype._onWindowResized$1=function(){this._onReady$1()}}()})