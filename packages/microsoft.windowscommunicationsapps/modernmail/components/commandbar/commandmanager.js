﻿Jx.delayDefine(Mail.Commands,["Events","Manager"],function(){"use strict";function i(n){Jx.mark("Commands.Manager."+n)}function n(n){Jx.mark("Commands.Manager."+n+",StartTA,Commands-Manager")}function t(n){Jx.mark("Commands.Manager."+n+",StopTA,Commands-Manager")}Mail.Commands.Events={showPreviousMessage:"Mail.Commands.Events.showPreviousMessage",showNextMessage:"Mail.Commands.Events.showNextMessage",showNextSyncStatus:"Mail.Commands.Events.showNextSyncStatus",onToggleSelectionMode:"Mail.Commands.Events.onToggleSelectionMode",allFilterApplied:"Mail.Commands.Events.allFilterApplied",unreadFilterApplied:"Mail.Commands.Events.unreadFilterApplied",reapplyFilter:"Mail.Commands.Events.reapplyFilter",onAddContext:"Mail.Commands.Events.onAddContext",onRemoveContext:"Mail.Commands.Events.onRemoveContext",appBarSubscription:"appBarSubscription"};Mail.Commands.Manager=function(n,t){var r,i;this._glomManager=n;this._selection=t;this._factory=null;this._shortcutManager=null;this._commandToHostBinding={};this._contextToCommandBinding={toggleContexts:{},enableContexts:{}};this._updateContextJob=null;this._updateContextPendingChanges=[];this._messageListeners=null;this._accountListeners=null;this._appBar=null;this._disables=["splashscreen"];r=Mail.Globals.appState;this._contexts={appState:r,guiState:Mail.guiState};this._hooks=new Mail.Disposer(new Mail.EventHook(t,"messagesChanged",this._onMessagesChanged,this),new Mail.EventHook(t,"navChanged",this._onNavigationChanged,this),new Mail.EventHook(Mail.guiState,"viewStateChanged",this._onLayoutChanged,this),new Mail.EventHook(Mail.guiState,"layoutChanged",this._onLayoutChanged,this),Mail.EventHook.createGlobalHook("isSearchingChanged",this._onSearchStateChanged,this),Mail.EventHook.createGlobalHook("isSelectionModeChanged",this._onSelectionModeChanged,this));this._onMessagesChanged();r.selectedAccount&&this._onNavigationChanged({accountChanged:true});i=Mail.Globals.splashScreen;i&&i.isShown?this._hooks.add(new Mail.EventHook(i,Mail.SplashScreen.Events.dismissed,this._onSplashScreenDismissed,this)):this._onSplashScreenDismissed()};Jx.augment(Mail.Commands.Manager,Jx.Events);Mail.Commands.Manager.prototype.dispose=function(){Jx.dispose(this._updateContextJob);this._updateContextJob=null;Jx.dispose(this._hooks)};Mail.Commands.Manager.prototype._getFactory=function(){return this._factory||(this._factory=new Mail.Commands.Factory(this._glomManager)),this._factory};Mail.Commands.Manager.prototype._getShortcutManager=function(){return this._shortcutManager||(this._shortcutManager=new Mail.Commands.ShortcutManager(this._selection)),this._shortcutManager};Mail.Commands.Manager.prototype.subscribeToAppBar=function(n){this._appBar=n;this._appBar.setEnabled(this._disables.length===0);this._hooks.add(new Mail.EventHook(n,Mail.CompCommandBar.Events.beforeshow,this._onBeforeShownAppBar,this));this.raiseEvent(Mail.Commands.Events.appBarSubscription,this._appBar)};Mail.Commands.Manager.prototype.subscribeToSaS=function(){this._hooks.add(new Mail.EventHook(SasManager,"sasenabled",this._onSaSChanged,this))};Mail.Commands.Manager.prototype.getContext=function(n){return this._contexts[n]};Mail.Commands.Manager.prototype.addContext=function(n,t){this._contexts[n]=t;this._onAddContext(n);this.raiseEvent(Mail.Commands.Events.onAddContext,n)};Mail.Commands.Manager.prototype.removeContext=function(n){this.raiseEvent(Mail.Commands.Events.onRemoveContext,n);this._onRemoveContext(n);delete this._contexts[n]};Mail.Commands.Manager.prototype._onAddContext=function(n){if(n==="composeSelection"){var t=this.getContext(n);t.addListener("selectionchange",this._onComposeSelectionChange,this);t.addListener("aftercommand",this._onComposeSelectionChange,this);t.addListener("contextmenu",this._onComposeSelectionChange,this)}};Mail.Commands.Manager.prototype._onRemoveContext=function(n){if(n==="composeSelection"){var t=this.getContext(n);t.removeListener("selectionchange",this._onComposeSelectionChange,this);t.removeListener("aftercommand",this._onComposeSelectionChange,this);t.removeListener("contextmenu",this._onComposeSelectionChange,this)}};Mail.Commands.Manager.prototype._onComposeSelectionChange=function(){this._updateContext("composeSelection")};Mail.Commands.Manager.prototype.hideAppBar=function(){return this._appBar.hideAppBar()};Mail.Commands.Manager.prototype.showAppBar=function(){return this._appBar.showAppBar()};Mail.Commands.Manager.prototype._onBeforeShownAppBar=function(){this._updateContext("showAppBar")};Mail.Commands.Manager.prototype.pinnedFolderChange=function(){this._updateContext("pinnedFolder")};Jx.augment(Mail.Commands.Manager,Jx.Attr);Mail.Commands.Manager.prototype._onSearchStateChanged=function(){this._updateContext("isSearching")};Mail.Commands.Manager.prototype._onSelectionModeChanged=function(){this._updateContext("selectionMode")};Mail.Commands.Manager.prototype._onNavigationChanged=function(n){var t,i;n.accountChanged&&(t=this._selection.account.platformObject,this._accountListeners=this._hooks.replace(this._accountListeners,[new Mail.EventHook(t,"changed",this._onAccountScenarioStateChanged,this)]),i=t.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.mail),i&&this._accountListeners.push(new Mail.EventHook(i,"changed",this._onMailResourceStateChanged,this)),this._updateContext("accountState"),this._updateContext("resourceState"));n.viewChanged&&this._updateContext("folderChange")};Mail.Commands.Manager.prototype._onMailResourceStateChanged=function(n){Mail.Validators.hasPropertyChanged(n,"hasEverSynchronized")&&this._updateContext("resourceState")};Mail.Commands.Manager.prototype._onAccountScenarioStateChanged=function(n){Mail.Validators.hasPropertyChanged(n,"mailScenarioState")&&this._updateContext("accountState")};Mail.Commands.Manager.prototype._onLayoutChanged=function(){this._updateContext("guiState")};Mail.Commands.Manager.prototype._onMessageChanged=function(n){Mail.Validators.hasPropertyChanged(n,"read")&&this._updateContext("readStatus");Mail.Validators.hasPropertyChanged(n,"flagged")&&this._updateContext("flagStatus");(Mail.Validators.hasPropertyChanged(n,"irmCannotForward")||Mail.Validators.hasPropertyChanged(n,"irmCannotReply")||Mail.Validators.hasPropertyChanged(n,"irmCannotReplyAll"))&&this._updateContext("irm")};Mail.Commands.Manager.prototype._onSaSChanged=function(){this._updateContext("sasStatus")};Mail.Commands.Manager.prototype._updateContext=function(r){var u="_updateContext - context:"+r;n(u);this._updateContextPendingChanges.length>0?this._updateContextPendingChanges.indexOf(r)!==-1?i("_updateContext - already queued"):(i("_updateContext - added"),this._updateContextPendingChanges.push(r)):(this._updateContextPendingChanges=[r],this._updateContextJob=Jx.scheduler.addJob(null,Mail.Priority.updateCommandContext,"Update command context",function(){var t=this._updateContextPendingChanges.pop(),n;return this._onToggleContextChanged(t),this._onEnableContextChanged(t),n=this._updateContextPendingChanges.length===0,n&&(this._updateContextJob=null),Jx.Scheduler.repeat(!n)},this));t(u)};Mail.Commands.Manager.prototype.completeContextUpdate=function(){this._updateContextJob&&this._updateContextJob.run()};Mail.Commands.Manager.prototype._onMessagesChanged=function(){var i,r;n("_onMessagesChanged");i=this._selection;n("_onMessagesChanged-cleanup");this._hooks.disposeNow(this._messageListeners);this._messageListeners=[];this._messageListenerIndex=0;Jx.dispose(this._updateMessageListeners);t("_onMessagesChanged-cleanup");r=i.messages.length;r>0&&(this._updateMessageListeners=Jx.scheduler.addJob(null,Mail.Priority.updateCommandContext,"Update _messageListeners",function(n){var i=this._messageListenerIndex,t;return this._messageListeners.push(new Mail.EventHook(n[i],"changed",this._onMessageChanged,this)),this._messageListenerIndex++,t=this._messageListenerIndex===n.length,t&&this._updateContext("selection"),Jx.Scheduler.repeat(!t)},this,[i.messages]),r<3&&this._updateMessageListeners.run());i.message&&this._messageListeners.push(new Mail.EventHook(i.message,"changed",this._onMessageChanged,this));this._hooks.add(this._messageListeners);this._updateContext("selection");t("_onMessagesChanged")};Mail.Commands.Manager.prototype._onToggleContextChanged=function(i){var r,u;r="_onToggleContextChanged-"+i;n(r);u=this._contextToCommandBinding.toggleContexts[i];Jx.isArray(u)&&u.forEach(function(n){n.invalidateContextualFields();var t=this._commandToHostBinding[n.id];t.forEach(function(t){t.toggleCommand(n)},this)},this);t(r)};Mail.Commands.Manager.prototype._onEnableContextChanged=function(r){var o,f,s,u,c,e,h;o="_onEnableContextChanged-"+r;n(o);f=[];s=this._contextToCommandBinding.enableContexts[r];Jx.isArray(s)&&s.forEach(function(n){f.indexOf(n)===-1&&f.push(n)});u={};c=this._selection;f.forEach(function(n){var f=n.isEnabled(c),t=n.id,r;r=this._commandToHostBinding[t];r.forEach(function(n){var i=n.id;u[i]||(u[i]={host:n,show:[],hide:[]});f?u[i].show.push(t):u[i].hide.push(t)})},this);for(e in u)h=u[e].host,h.updateEnabledLists(u[e].show,u[e].hide),h.showCommands();t(o)};Mail.Commands.Manager.prototype._registerContext=function(n,t){Jx.isArray(n[t])&&n[t].forEach(function(i){Mail.Commands.Manager._addToBinding(this._contextToCommandBinding[t],i,n)},this)};Mail.Commands.Manager.prototype._registerEnableContext=function(n){this._registerContext(n,"enableContexts")};Mail.Commands.Manager.prototype._registerToggleContext=function(n){n.type==="toggle"&&this._registerContext(n,"toggleContexts")};Mail.Commands.Manager._addToBinding=function(n,t,i){n[t]=n[t]||[];n[t].indexOf(i)===-1&&n[t].push(i)};Mail.Commands.Manager.prototype.disableCommands=function(i){var r,u,f;n("disableAppBar:"+i);r=this._disables;r.push(i);r.length===1&&(u=this._shortcutManager,u&&u.disableKeyboardListener(),f=this._appBar,f&&f.setEnabled(false));t("disableAppBar:"+i)};Mail.Commands.Manager.prototype._onSplashScreenDismissed=function(){Jx.scheduler.addJob(null,Mail.Priority.commandsEnabled,"CommandManager._onSplashScreenDismissed",this.enableCommands,this,["splashscreen"])};Mail.Commands.Manager.prototype.enableCommands=function(i){var r,u,f;n("enableAppBar:"+i);r=this._disables;u=r.indexOf(i);u!==-1&&(r.splice(u,1),r.length===0&&(this._getShortcutManager().enableKeyboardListener(),f=this._appBar,f&&f.setEnabled(true)));t("enableAppBar:"+i)};Mail.Commands.Manager.prototype.onKeyDown=function(n){this._getShortcutManager().onKeyDown(n)};Mail.Commands.Manager.prototype.registerCommandHost=function(i){var u,r;n("registerCommandHost-"+i.id);u=this._getFactory().filterCommands(i.registeredCommandIds);r=u.map(function(n){return this.getCommand(n)}.bind(this));this._getShortcutManager().register(r);var f=[],e=[],o=this._selection;r.forEach(function(n){Mail.Commands.Manager._addToBinding(this._commandToHostBinding,n.id,i);this._registerEnableContext(n);this._registerToggleContext(n);n.isEnabled(o)?f.push(n.id):e.push(n.id)},this);i.activateCommands(r);i.updateEnabledLists(f,e);i.showCommands();t("registerCommandHost-"+i.id)};Mail.Commands.Manager.prototype.registerShortcuts=function(n){n=this._getFactory().filterCommands(n);var t=n.map(function(n){return this.getCommand(n)}.bind(this));this._getShortcutManager().register(t)};Mail.Commands.Manager.prototype.isValidCommandId=function(n){return Jx.isNonEmptyString(n)&&n in this._getFactory().commands};Mail.Commands.Manager.prototype.getCommand=function(n){return this._getFactory().commands[n]};Mail.Commands.Manager.prototype.executeShortcut=function(n){return this._getShortcutManager().executeShortcut(n)};Mail.Commands.Manager.prototype.invokeCommand=function(n,t,i){n.onInvoke(this._selection,t,i)};Object.defineProperty(Mail.Commands.Manager.prototype,"appBar",{enumerable:true,get:function(){return this._appBar}});Mail.showPopupAsync=function(n){try{n.showAsync()}catch(t){if(t.number!==-2147024891)throw t}}})