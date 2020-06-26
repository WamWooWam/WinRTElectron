﻿Jx.delayDefine(Mail,"SelectionHandler",function(){"use strict";function u(n){if(n.pointerType!=="mouse"||!n.currentPoint.properties.isRightButtonPressed)return false;for(var t=n.srcElement;t.id!==Mail.CompMessageList.defaultElementId;){if(t.classList.contains("win-selected"))return true;t=t.parentNode}return false}var t=null,i=Mail.Instrumentation,r=Mail.SelectionHandler=function(n,i,r,u){var o,f,e,s;Mail.writeProfilerMark("Mail.SelectionHandler.Ctor",Mail.LogEvent.start);this._model=new Mail.SelectionModel(n,i);this._aggregator=null;this._controller=new Mail.SelectionController(n,r,this._model,this);this._selection=r;this._collection=n;this._isSelectionMode=false;this._host=document.getElementById("messageList");o=this._host.querySelector(".mailMessageListAllCheckbox");this._allCheckBox=new Mail.SelectAllCheckBox(o,this,this._collection.mailItems);this._appBar=u;f=Mail.EventHook;e=this._model.listViewElement.querySelector(".win-viewport");this._disposer=new Mail.Disposer(this._model,this._controller,this._allCheckBox,new f(e,"MSPointerDown",this._onMSPointerDown,this),new f(e,"keydown",this._onKeyDown,this),new f(this._model,"selectionchanged",this._onSelectionChanged,this),f.createGlobalHook("exitSelectionMode",this.exitSelectionMode,this),new Mail.KeyboardDismisser(e,r));Mail.Globals.commandManager.registerShortcuts(["exitSelectionMode"]);s=document.getElementById("mailFrameMessageList");this._supportMultiSelect=Mail.Commands.Contexts.supportMultiSelect();Jx.setClass(s,"supportMultiSelect",this._supportMultiSelect);t=this;Mail.writeProfilerMark("Mail.SelectionHandler.Ctor",Mail.LogEvent.stop)},n=r.prototype;Object.defineProperty(r,"isSelectionMode",{get:function(){return t&&t.isSelectionMode}});r.toggleSelectionMode=function(){t&&t.toggleSelectionMode()};r.exitSelectionMode=function(){t&&t.exitSelectionMode()};n.startSelectionMode=function(){this._setIsSelectionMode(true)};n.exitSelectionMode=function(){this._setIsSelectionMode(false)};n.toggleSelectionMode=function(){this._setIsSelectionMode(!this.isSelectionMode)};n.getModel=function(){return this.isSelectionMode?this._aggregator:this._model};n.dispose=function(){this._setIsSelectionMode(false,true);Jx.dispose(this._disposer);this._disposer=null;this._allCheckBox=null;this._controller=null;this._model=null;this._host=null;t=null};Object.defineProperty(n,"isSelectionMode",{get:function(){return this._isSelectionMode},enumerable:true});Object.defineProperty(n,"controller",{get:function(){return this._controller},enumerable:true});Object.defineProperty(n,"model",{get:function(){return this._model},enumerable:true});n._setIsSelectionMode=function(n,t){if(this._isSelectionMode!==n&&this._supportMultiSelect){Mail.writeProfilerMark("Mail.SelectionHandler._setIsSelectionMode:="+n,Mail.LogEvent.start);var i=this._host.classList;i.toggle("selectionModeActive");i.toggle("selectionModeInactive");this._isSelectionMode=n;n?this._onEnterSelectionMode():this._onExitSelectionMode(t);Jx.EventManager.fireDirect(null,"isSelectionModeChanged");Mail.writeProfilerMark("Mail.SelectionHandler._setIsSelectionMode:="+n,Mail.LogEvent.stop)}};n._onMSPointerDown=function(n){!this._isSelectionMode&&u(n)&&(this._appBar.hidden&&i.instrumentAppBarInvoke(i.AppBarInvokeType.rightClick),this._appBar.toggleVisibility())};n._onKeyDown=function(n){if(!this._isSelectionMode&&n.keyCode===Jx.KeyCode.select){var t=this._model.selection(),i=t.isIndexSelected(this._model.currentItem.index);i&&this._appBar.toggleVisibility()}};n._onSelectionChanged=function(){var n=this._model.selection().length>1;n&&this._setIsSelectionMode(true)};n._onEnterSelectionMode=function(){this._allCheckBox.updateSelectionMode();this._model.tapBehavior="toggleSelect";this._aggregator=new Mail.SelectionAggregator(this._collection,this._model,this._selection.view,this);this._controller.setModel(this._aggregator);this._controller.setNodeExpansionHandler(this._aggregator);this._appBar.showAppBar(true);this._appBar.lightDismiss=false;i.instrumentAppBarInvoke(i.AppBarInvokeType.consumeSelection);i.instrumentMailCommand(i.Commands.enterSelectionMode)};n._onExitSelectionMode=function(n){this._allCheckBox.updateSelectionMode();this._model.tapBehavior="directSelect";Jx.dispose(this._aggregator);this._aggregator=null;n||(this._controller.exitSelectionMode(),this._controller.setModel(this._model),this._controller.setNodeExpansionHandler(new Mail.SimpleNodeExpansionHandler(this._selection.view,this._collection,this._model)));this._appBar.hideAppBar();this._appBar.lightDismiss=true}})