﻿Jx.delayDefine(Mail,"CompCommandBar",function(){"use strict";var t=Mail.Instrumentation,i=Mail.CompCommandBar=function(n){Mail.log("CommandBar.Ctor",Mail.LogEvent.start);this._commandManager=n;this._commandIDs=["folderOperations","toggleSelectionMode","move","sweep","junkMessages","unjunkMessages","moveSeparator","print","toggleFlag","toggleUnread","deleteMessage","messageSeparator","save","clipboardToggle","font","fontColor","highlightColor","fontSeparator","bold","italic","underline","formatSeparator","listMenu","emojiCmd","linkToggle","newChildWindow","composeMoreMenu","moreMenu"];Mail.Commands.Host.call(this);this._selectionHelper=null;this._isActivated=false;this._lightDismissEventHook=null;this._composeSelectionHook=null;this._contextHooks=null;this._hooks=null;this._composeSelection=null;this._observer=null;this._name="Mail.CompCommandBar";this._appBar=null;this._appBarSelectionSticky=false;this._edgyHappening=false;this._buttonColor={fontColor:"#D03A3A",highlightColor:"#FFFF00"};this._peekBar=new Jx.PeekBar("bottom");this.append(this._peekBar);Mail.log("CommandBar.Ctor_InitComp",Mail.LogEvent.start);this.initComponent();Mail.log("CommandBar.Ctor_InitComp",Mail.LogEvent.stop);Mail.log("CommandBar.Ctor",Mail.LogEvent.stop)},n;Jx.inherit(i,Mail.Commands.Host);Jx.augment(i,Jx.Events);Jx.augment(i,Jx.Component);i.Events={beforeshow:"beforeshow",afterhide:"afterhide",aftershow:"aftershow"};n=i.prototype;i.appBarElementId="mailAppBar";n.getUI=function(n){n.html=Jx.getUI(this._peekBar).html+'<div id="mailAppBar" class="win-ui-dark"><\/div>'};n.setEnabled=function(n){this._appBar.setEnabled(n);n?this._peekBar.show():this._peekBar.hide()};n.hideAppBar=function(){return this._appBar||this.register(),this._appBar.hideAsync()};n.showAppBar=function(n){return n||this._commandManager.completeContextUpdate(),this._appBar||this.register(),this._appBar.showAsync()};n.toggleVisibility=function(){return this._commandManager.completeContextUpdate(),this._appBar||this.register(),this._appBar.toggleVisibility()};n.activateUI=function(){Mail.Commands.Host.prototype.activateUI.call(this);this._peekBar.hide()};n.register=function(){var n,t,i;this._isActivated||(this.register=Jx.fnEmpty,Mail.log("CommandBar.register",Mail.LogEvent.start),this._isActivated=true,Jx.Component.prototype.activateUI.call(this),n=this._commandManager,t=["prevMessage","nextMessage","applyAllFilter","applyUnreadFilter","reapplyFilter","markUnread","markRead","pinFolder","moveShortcut"],n.registerCommandHost(this),n.registerShortcuts(t),this._contextHooks=new Mail.Disposer(new Mail.EventHook(n,Mail.Commands.Events.onAddContext,this._onAddContext,this),new Mail.EventHook(n,Mail.Commands.Events.onRemoveContext,this._onRemoveContext,this)),i=n.getContext("composeSelection"),i&&this._onAddContext("composeSelection"),Mail.log("CommandBar.register",Mail.LogEvent.stop))};n.deactivateUI=function(){this._isActivated&&(Jx.Component.prototype.deactivateUI.call(this),Jx.dispose(this._selectionHelper),this._selectionHelper=null,this._deactivateLightDismiss(),Jx.Component.deactivateUI.call(this),Jx.dispose(this._contextHooks),Jx.dispose(this._hooks),this._observer.disconnect(),this._observer=null,Mail.Commands.Host.prototype.deactivateUI.call(this))};n._onAddContext=function(n){n==="composeSelection"&&(this._composeSelection=this._commandManager.getContext(n),this._lightDismissEventHook&&this._hookComposeSelection())};n._onRemoveContext=function(n){n==="composeSelection"&&(this._composeSelection=null,this._lightDismissEventHook&&this._composeSelectionHook&&(this._lightDismissEventHook.disposeNow(this._composeSelectionHook),this._composeSelectionHook=null))};n._activateLightDismiss=function(){var n=Mail.EventHook,t=document.getElementById(Mail.CompFrame.frameElementId);this._lightDismissEventHook=new Mail.Disposer(new n(t,"MSPointerDown",this._onClick,this),n.createGlobalHook(Mail.ReadingPaneBody.Events.frameClicked,this._onClick,this),n.createGlobalHook("mail-messageList-clicked",this._onMessageListClicked,this));this._composeSelection&&this._hookComposeSelection()};n._hookComposeSelection=function(){this._composeSelectionHook||(this._composeSelectionHook=new Mail.EventHook(this._composeSelection,"mspointerdown",this._onClick,this));this._lightDismissEventHook.add(this._composeSelectionHook)};n._deactivateLightDismiss=function(){Jx.dispose(this._lightDismissEventHook);this._lightDismissEventHook=null;this._composeSelectionHook=null};n._onClick=function(n){n.fromMessageList||n.pointerType==="mouse"&&n.button===2||this._appBar.hide()};n._onPeekBarShow=function(n){this._appBar.show();n.cancel=true;var i=t.AppBarInvokeType;t.instrumentAppBarInvoke(n.data.pointerType==="touch"?i.peekBarTouch:i.peekBarMouse)};n._onMutation=function(n){n[0].target.winControl.onclick(n[0])};n._onMessageListClicked=function(n){var t=n.data;t.fromMessageList=true};n._hideAppBarAndInvoke=function(n,t){return function(i){Jx.log.info("Mail.CompCommandBar.prototype._hideAppBarAndInvoke - begin invoking callback");Jx.scheduler.addJob(null,Mail.Priority.postHideAppBar,"post-hide-app-bar callback",n,null,[i]);Jx.log.info("Mail.CompCommandBar.prototype._hideAppBarAndInvoke - end invoking callback");var r=t?new Mail.WinJSAnimationSuppressor:null;this._appBar.hideAsync().done(function(){Jx.dispose(r)})}.bind(this)};n.activateCommands=function(n){var i,e,o,r;Mail.log("CommandBar.activateCommands",Mail.LogEvent.start);i=document.getElementById(Mail.CompCommandBar.appBarElementId);e=["folderOperations","toggleSelectionMode","save","clipboardToggle"];o=n.map(function(n){var t=n.getOption();return t.onclick=this._invokeCommand.bind(this,n),n.dismissAfterInvoke&&(t.onclick=this._hideAppBarAndInvoke(t.onclick,n.noAnimationOnDismiss)),e.indexOf(n.id)!==-1&&(t.section="selection"),n.useCustomFont&&(t.extraClass="useCustomFont"),n.id==="moreMenu"&&Jx.scheduler.addJob(null,Mail.Priority.createMoreMenu,"create the more menu",function(){Mail.Commands.FlyoutHandler.ensureFlyout("moreMenu")}),t.type==="toggle"&&(t.selected=n.showAsSelected),t},this);this._appBar=new Mail.AppBar(i,{commands:o,sticky:true});["bold","underline","italic","fontColor"].forEach(function(n){var t=document.getElementById(n);Jx.isHTMLElement(t)&&t.setAttribute("unselectable","on")});["clipboardToggle","linkToggle"].forEach(function(n){var t=document.getElementById(n);Jx.isHTMLElement(t)&&t.setAttribute("role","menuitem")});r=document.querySelector("#fontColor .win-commandimage");r.innerHTML="<span id='fontColor-colorBar' style='color:"+this._buttonColor.fontColor+"'>&#xE195;<\/span>&#xE196;";r=document.querySelector("#highlightColor .win-commandimage");r.innerHTML="<span id='highlightColor-colorBar' style='color:"+this._buttonColor.highlightColor+"'>&#xE197;<\/span>&#xE198;";this._peekBar.show();this._observer=Jx.observeMutation(i,{attributes:true,subtree:true,attributeFilter:["aria-checked"]},this._onMutation,this);var u=this._commandManager,f=Windows.UI.Input.EdgeGesture.getForCurrentView(),t=Mail.EventHook;this._hooks=new Mail.Disposer(new t(this._appBar,"beforeshow",function(n){this._peekBar.hide();this.raiseEvent("beforeshow",n)},this,false),new t(this._appBar,"beforehide",function(){this._peekBar.show()},this,false),new t(this._appBar,"afterhide",function(n){this.raiseEvent("afterhide",n)},this,false),new t(this._appBar,"aftershow",function(n){this.raiseEvent("aftershow",n)},this,false),new t(f,"starting",this._startingEdgy,this,false),new t(f,"completed",this._completedEdgy,this,false),new t(f,"canceled",this._canceledEdgy,this,false),new t(i,"keydown",u.onKeyDown,u,false),new t(this._appBar,"afterhide",this._clearAppBarSticky,this,false),new t(document.getElementById(Mail.CompMessageList.defaultElementId),"mailitemdragstart",this.hideAppBar,this),t.createEventManagerHook(this,"peekBarShow",this._onPeekBarShow,this),t.createGlobalHook("buttonColorUpdate",function(n){this._updateButtonColors(n.data)},this),t.createGlobalHook("composeVisibilityChanged",function(){this._updateButtonColors(this._buttonColor)},this));u.subscribeToAppBar(this);this._selectionHelper||(this._selectionHelper=new Mail.CommandBarSelectionHelper);this._selectionHelper.activate(this._appBar);this._activateLightDismiss();Mail.log("CommandBar.activateCommands",Mail.LogEvent.stop)};n._completedEdgy=function(n){if(this._edgyHappening)this._edgyHappening=false;else if(!this._appBar.hidden){var i=t.AppBarInvokeType,r=i.edgyTouch,u=Windows.UI.Input.EdgeGestureKind,f=n.kind;f===u.keyboard?r=i.edgyKeyboard:f===u.mouse&&(r=i.rightClick);t.instrumentAppBarInvoke(r)}};n._startingEdgy=function(){this._edgyHappening=true;this._appBar.hidden||t.instrumentAppBarInvoke(t.AppBarInvokeType.edgyTouch)};n._canceledEdgy=function(){this._edgyHappening=false};n._updateButtonColors=function(n){Object.keys(n).forEach(function(t){var i=document.getElementById(t+"-colorBar");i&&(i.style.color=n[t])},this)};n.showCommands=function(){Mail.log("CommandBar.showCommands",Mail.LogEvent.start);this._appBar&&this._appBar.showOnlyCommands(this.commandsToShow());Mail.log("CommandBar.showCommands",Mail.LogEvent.stop)};n.toggleCommand=function(n){var t=this._appBar.getCommandById(n.id);t.selected=n.showAsSelected;t.icon=n.icon;t.label=n.label;t.tooltip=n.tooltip;t.onclick=this._invokeCommand.bind(this,n);this._observer.takeRecords()};n._invokeCommand=function(n,t){this._commandManager.invokeCommand(n,Mail.Instrumentation.UIEntryPoint.appBar,t);this._observer.takeRecords()};n.focus=function(){this._appBar.focus()};n._clearAppBarSticky=function(){this._appBarSelectionSticky=false};Object.defineProperty(n,"id",{get:function(){return"appBar"},enumerable:true});Object.defineProperty(n,"registeredCommandIds",{get:function(){return this._commandIDs},enumerable:true});n.composeCommands=function(){return["bold","clipboardToggle","composeMoreMenu","emojiCmd","font","fontColor","fontSeparator","formatSeparator","highlightColor","italic","linkToggle","listMenu","newChildWindow","save","underline"]};n.consumeCommands=function(){return["deleteMessage","folderOperations","junkMessages","messageSeparator","moreMenu","move","moveSeparator","newChildWindow","print","sweep","toggleFlag","toggleSelectionMode","toggleUnread","unjunkMessages"]};n.viewStateCommands=function(n){if(this._composeSelection&&!this._composeSelection.canvasInFocus&&this._composeSelection.composeInFocus)return["newChildWindow","save"];var t=Jx.ApplicationView.State;return n===t.wide||n===t.full||n===t.large?["bold","clipboardToggle","composeMoreMenu","deleteMessage","emojiCmd","folderOperations","font","fontColor","fontSeparator","formatSeparator","highlightColor","italic","junkMessages","linkToggle","listMenu","messageSeparator","moreMenu","move","moveSeparator","newChildWindow","print","save","sweep","toggleFlag","toggleSelectionMode","toggleUnread","underline","unjunkMessages"]:n===t.more?["bold","clipboardToggle","composeMoreMenu","deleteMessage","emojiCmd","folderOperations","font","fontColor","fontSeparator","formatSeparator","highlightColor","italic","junkMessages","linkToggle","listMenu","messageSeparator","moreMenu","move","moveSeparator","newChildWindow","print","sweep","toggleFlag","toggleSelectionMode","toggleUnread","underline","unjunkMessages"]:n===t.portrait?["bold","clipboardToggle","composeMoreMenu","deleteMessage","emojiCmd","folderOperations","font","fontColor","fontSeparator","formatSeparator","highlightColor","italic","junkMessages","listMenu","messageSeparator","moreMenu","move","moveSeparator","newChildWindow","print","sweep","toggleFlag","toggleSelectionMode","toggleUnread","underline","unjunkMessages"]:n===t.split?["bold","clipboardToggle","composeMoreMenu","deleteMessage","folderOperations","font","fontColor","highlightColor","italic","junkMessages","listMenu","messageSeparator","moreMenu","move","moveSeparator","newChildWindow","print","toggleFlag","toggleSelectionMode","toggleUnread","underline","unjunkMessages"]:n===t.less?["bold","clipboardToggle","deleteMessage","folderOperations","font","italic","messageSeparator","moreMenu","newChildWindow","print","save","toggleFlag","toggleSelectionMode","toggleUnread","underline"]:n===t.snap||n===t.minimum?["clipboardToggle","deleteMessage","moreMenu","newChildWindow","print","save","toggleFlag","toggleUnread"]:void 0};n.applyReducedClass=function(n,t,i){this._appBar&&(this._appBar.reduce=t!==Jx.ApplicationView.State.wide&&t!==Jx.ApplicationView.State.full||n,i&&this._appBar.hide())};Object.defineProperty(n,"hidden",{get:function(){return this._appBar?this._appBar.hidden:true},enumerable:true});Object.defineProperty(n,"offsetHeight",{get:function(){return this._appBar?this._appBar.offsetHeight:0},enumerable:true});Object.defineProperty(n,"winAnimating",{get:function(){return this._appBar?this._appBar.winAnimating:null},enumerable:true});Object.defineProperty(n,"lightDismiss",{set:function(n){this.lightDismiss!==n&&(n?this._activateLightDismiss():this._deactivateLightDismiss())},get:function(){return Boolean(this._lightDismissEventHook)},enumerable:true});Object.defineProperty(n,"appBarSelectionSticky",{enumerable:true,get:function(){return this._appBarSelectionSticky},set:function(n){this._appBarSelectionSticky=n}})})