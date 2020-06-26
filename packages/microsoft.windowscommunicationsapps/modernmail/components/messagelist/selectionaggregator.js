﻿Jx.delayDefine(Mail,"SelectionAggregator",function(){"use strict";function u(t,i){var r={get:function(){return this._model[t]},enumerable:true};i||(r.set=function(n){this._model[t]=n});Object.defineProperty(n,t,r)}function i(n){Mail.writeProfilerMark("SelectionAggregator."+n,Mail.LogEvent.start)}function r(n){Mail.writeProfilerMark("SelectionAggregator."+n,Mail.LogEvent.stop)}function f(n){Mail.writeProfilerMark("SelectionAggregator."+n)}var e=Mail.SelectionAggregator=function(n,t,u,f){i("Ctor");this._collection=n;this._model=t;this._view=u;this._selectedParentNodes=[];this._treeView=n.getTreeView();this._handler=f;this._initializeSelection();this._modelEventHooks=new Mail.Disposer(new Mail.EventHook(t,"selectionchanging",this._onSelectionChanging,this),new Mail.EventHook(t,"selectionchanged",this._onSelectionChanged,this),new Mail.EventHook(t,"iteminvoked",this._onTapInvoked,this));this._exitSelectionModeJob=null;r("Ctor")},n,t;Jx.inherit(e,Jx.Events);n=e.prototype;n._initializeSelection=function(){i("_initializeSelection");var n=new t(this);this._model.selection().indices.forEach(function(t){this._notifySelectionChanged(t,true,n)},this);r("_initializeSelection")};n.dispose=function(){i("dispose");for(var n in this._selectedParentNodes)Jx.dispose(this._selectedParentNodes[n]);this._selectedParentNodes={};Jx.dispose(this._modelEventHooks);Jx.dispose(this._exitSelectionModeJob);r("dispose")};n.isValidIndex=function(n){return this._model.isValidIndex(n)};n.addSelection=function(n,t){var i=Jx.isArray(n)?n.join(","):n;return f("addSelection indices:=["+i+"] suppressEvents: "+t),this._model.addSelection(n,t)};n.removeSelection=function(n,t){var i=Jx.isArray(n)?n.join(","):n;return f("removeSelection indices:=["+i+"]  suppressEvents: "+t),this._model.removeSelection(n,t)};n.setSelection=function(n,t,i,r){return this._model.setSelection(n,t,r)};n.setSelectionRange=function(n,t){return this._model.setSelectionRange(n,t)};n.findIndexByElement=function(n){return this._model.findIndexByElement(n)};n.ensureVisible=function(n){return this._model.ensureVisible(n)};n.selection=function(){var n=this._model.selection();return n.logicalItems=this._getLogicallySelectedItems(n),n};u("currentItem",false);u("selectionPivot",false);u("indexOfFirstVisible",false);u("tapBehavior",false);u("listViewElement",true);n.onNodeExpanded=function(n){var t,u,f,e;t=n.index;u=this._collection.item(t);i("onNodeExpanded index:="+t+" id:="+u.objectId);f=this._getSelectionNode(u,false);f&&(e=f.getSelectedChildren(t),this.addSelection(e.indices,true));this._model.ensureVisible(t);r("onNodeExpanded index:="+t+" id:="+u.objectId)};n.getNodeSelection=function(n){return this._getSelectionNode(n,false)};n._shouldAllowTapSelection=function(n){var u=n.getIndices(),t=this._model.selection().diff(u),i,r;return t.added.length+t.removed.length===1?(i=t.added.length===1?t.added[0]:t.removed[0],!this._model.isValidIndex(i))?false:(r=this._collection.item(i),r.totalCount<=1):true};n._onSelectionChanging=function(n){var t=Mail.SelectionHelper.filterUnselectableItems(this._collection,n.detail.newSelection),i=this._shouldAllowTapSelection(t);i||n.detail.preventTapBehavior()};n._onSelectionChanged=function(n){i("onSelectionChanged");var u=new t(this),f=n.diff;f.added.forEach(function(n){this._notifySelectionChanged(n,true,u)},this);f.removed.forEach(function(n){this._notifySelectionChanged(n,false,u)},this);f.deletedItems.forEach(function(n){this._notifyItemDeleted(n,u)},this);u.hasPendingCollapse&&this._treeView.collapse();u.shouldExitSelectionMode||Object.keys(this._selectedParentNodes).length===0?this._exitSelectionMode():this.raiseEvent("selectionchanged",n);r("onSelectionChanged")};n._onTapInvoked=function(n){this.raiseEvent("iteminvoked",n)};n._notifyParentSelectionChanged=function(n,t,u,f){var o,e;i("_notifyParentSelectionChanged");o=this._isParentNodeSelected(t);u!==o&&(e=this._getSelectionNode(t,u),e.notifyParentSelectionChanged(u,n,f),u||this._removeNodeFromSelection(e.objectId));r("_notifyParentSelectionChanged")};n._notifyChildSelectionChanged=function(n,t,u,f){var o,e,s;i("_notifyChildSelectionChanged");o=this._collection.item(n);e=this._getSelectionNode(t,u);e&&(s=this._treeView.activeConversationIndex,e.notifyChildSelectionChanged(o.objectId,u,s,f),e.selected||this._removeNodeFromSelection(e.objectId));r("_notifyChildSelectionChanged")};n.onChildItemDeleted=function(n,t){var i={diff:{added:[],removed:[],deletedItems:[]}};i.diff.deletedItems.push({parentId:n.objectId,objectId:t});this._onSelectionChanged(i)};n._notifyItemDeleted=function(n,t){var e=!Boolean(n.parentId),i,r,u,f;e?this._removeNodeFromSelection(n.objectId):(i=n.parentId,r=this._selectedParentNodes[i],r&&(u=this._treeView.findIndexByThreadId(i),f=n.objectId,r.notifyChildDeleted(f,u,t),r.selected||this._removeNodeFromSelection(i)))};n._notifySelectionChanged=function(n,t,i){if(this._model.isValidIndex(n)){var r=this._collection.item(n),u=Boolean(r.parent),f=u?r.parent:r;u?this._notifyChildSelectionChanged(n,f,t,i):this._notifyParentSelectionChanged(n,f,t,i)}};n._exitSelectionMode=function(){this._exitSelectionModeJob=Jx.scheduler.addJob(null,Mail.Priority.messageListExitSelectionMode,"exit selection mode",function(){this._exitSelectionModeJob=null;this._handler.exitSelectionMode()},this);this._exitSelectionMode=Jx.fnEmpty};n._getSelectionNode=function(n,t){var i=n.objectId,r=this._selectedParentNodes[i];return!r&&t&&(f("SelectionAggregator._addNode id:="+i),r=this._selectedParentNodes[i]=new Mail.ConversationSelection(n,this._view,this)),r};n._removeNodeFromSelection=function(n){var t=this._selectedParentNodes[n];t&&(f("SelectionAggregator._removeNode id:="+n),Jx.dispose(t),delete this._selectedParentNodes[n])};n._getLogicallySelectedItems=function(n){var t=[];return n.items.forEach(function(n){if(!n.parent){var r=n.objectId,i=this._selectedParentNodes[r];i&&(t=t.concat(i.selectedItems))}},this),t};n.isOnlySelectedConversation=function(n){return n in this._selectedParentNodes&&Object.keys(this._selectedParentNodes).length===1};n._isParentNodeSelected=function(n){return n.objectId in this._selectedParentNodes};t=function(n){this._shouldExitSelectionMode=false;this._hasPendingCollapse=false;this._aggregator=n};t.prototype.select=function(n){this._aggregator.addSelection(n,true)};t.prototype.deselectParent=function(n,t){this._aggregator.isOnlySelectedConversation(t)?this._shouldExitSelectionMode=true:(this._aggregator.removeSelection(n,true),this._hasPendingCollapse=true)};t.prototype.collapseParent=function(n,t){this._aggregator.isOnlySelectedConversation(t)?this._shouldExitSelectionMode=true:this._hasPendingCollapse=true};Object.defineProperty(t.prototype,"shouldExitSelectionMode",{get:function(){return this._shouldExitSelectionMode}});Object.defineProperty(t.prototype,"hasPendingCollapse",{get:function(){return this._hasPendingCollapse}})})