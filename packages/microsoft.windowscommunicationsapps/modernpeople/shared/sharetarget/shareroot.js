﻿Jx.delayDefine(People.ShareTarget,"ShareRoot",function(){var t=window.People,i=t.RecentActivity.UI.Share,n=t.ShareTarget;n.ShareRoot=function(n,i,r){Jx.log.info("ShareTarget.ShareRoot");this._name="ShareTarget.ShareRoot";this.initComponent();this._shareOperation=n.shareOperation;this._jobSet=r.getJobSet().createChild();this._platformCache=new t.PlatformCache(i,this._jobSet)};Jx.augment(n.ShareRoot,Jx.Component);n.ShareRoot.prototype._jobSet=null;n.ShareRoot.prototype._layout=null;n.ShareRoot.prototype._platformCache=null;n.ShareRoot.prototype._shareOperation=null;n.ShareRoot.prototype.getPlatform=function(){return Jx.log.info("People.ShareTarget.ShareRoot.getPlatform"),this._platformCache.getPlatform()};n.ShareRoot.prototype.getPlatformCache=function(){return this._platformCache};n.ShareRoot.prototype.trackStartup=function(){Jx.log.info("People.ShareTarget.ShareRoot.trackStartup")};n.ShareRoot.prototype.getJobSet=function(){return this._jobSet};n.ShareRoot.prototype.getUI=function(n){Jx.log.info("People.ShareTarget.ShareRoot.getUI");n.html="";n.css=""};n.ShareRoot.prototype.deactivateUI=function(){Jx.log.info("People.ShareTarget.ShareRoot.deactivateUI");this._layout&&this._layout.dispose();Jx.Component.prototype.deactivateUI.call(this)};n.ShareRoot.prototype.shutdownComponent=function(){Jx.log.info("People.ShareTarget.ShareRoot.shutdownComponent");Jx.dispose(this._platformCache);this._platformCache=null;this._jobSet.dispose();this._jobSet=null};n.ShareRoot.prototype.initUI=function(n){Jx.log.info("People.ShareTarget.ShareRoot.initUI");this._layout=new i.ShareLayout(n,this._shareOperation);Jx.Component.prototype.initUI.apply(this,arguments)};n.ShareRoot.prototype.activateUI=function(){Jx.log.info("People.ShareTarget.ShareRoot.activateUI");Jx.Component.prototype.activateUI.call(this);this._layout.render()}})