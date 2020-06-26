﻿Jx.delayDefine(Mail,["MessageListTreeNode","EmptyMessageListTreeView"],function(){"use strict";Mail.MessageListTreeNode=function(n,t,i){this._data=n;this._parent=i;this._type=t;this._id=n.objectId;this._children=null;this._expanded=false};Jx.inherit(Mail.MessageListTreeNode,Jx.Events);Mail.MessageListTreeNode.prototype.expand=function(){return false};Mail.MessageListTreeNode.prototype.collapse=function(){return false};Mail.MessageListTreeNode.prototype.dispose=function(){this.raiseEvent("disposed",{target:this})};Mail.MessageListTreeNode.prototype.isParent=function(){return false};Mail.MessageListTreeNode.prototype.isDescendant=function(n){if(!n)return false;for(var t=this;t;){if(t.objectId===n)return true;t=t.parent}return false};Mail.MessageListTreeNode.prototype.lock=Jx.fnEmpty;Mail.MessageListTreeNode.prototype.unlock=Jx.fnEmpty;Object.defineProperty(Mail.MessageListTreeNode.prototype,"objectId",{get:function(){return this._id}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"parentId",{get:function(){return this._parent?this._parent.objectId:""}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"data",{get:function(){return this._data}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"children",{get:function(){return this._children}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"totalCount",{get:function(){return this._children?this._children.count:1}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"parent",{get:function(){return this._parent}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"type",{get:function(){return this._type}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"pendingRemoval",{get:function(){return this._data?this._data.pendingRemoval:true}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"selectable",{get:function(){return true}});Object.defineProperty(Mail.MessageListTreeNode.prototype,"expanded",{get:function(){return this._expanded},enumerable:true});Mail.EmptyMessageListTreeView=function(){};Mail.EmptyMessageListTreeView.prototype={expand:Jx.fnEmpty,collapse:Jx.fnEmpty,clearPendingExpandCollapse:Jx.fnEmpty,addListener:Jx.fnEmpty,removeListener:Jx.fnEmpty,expanded:false,activeConversationIndex:-1,activeConversation:null}})