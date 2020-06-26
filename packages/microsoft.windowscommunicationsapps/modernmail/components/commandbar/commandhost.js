﻿Jx.delayDefine(Mail.Commands,"Host",function(){Mail.Commands.Host=function(){this._viewState=Jx.ApplicationView.getState();this._sortedRegisteredCommandsIds=[].concat(this.registeredCommandIds).sort();this._showingCommandIds=[];this._cmdHosthooks=null;this._currentComposeState=null;this._currentCanvasState=null};Object.defineProperty(Mail.Commands.Host.prototype,"registeredCommandIds",{get:function(){},enumerable:true});Mail.Commands.Host.prototype.activateCommands=function(){};Mail.Commands.Host.prototype.activateUI=function(){var n=Mail.Globals.commandManager,t;this._cmdHosthooks=new Mail.Disposer(new Mail.EventHook(Mail.guiState,"viewStateChanged",this._viewStateChanged,this),new Mail.EventHook(n,Mail.Commands.Events.onAddContext,this._onAddContextHost,this),new Mail.EventHook(n,Mail.Commands.Events.onRemoveContext,this._onRemoveContextHost,this));t=n.getContext("composeSelection");t&&this._onAddContextHost("composeSelection")};Mail.Commands.Host.prototype.deactivateUI=function(){Jx.dispose(this._cmdHosthooks)};Mail.Commands.Host.prototype.updateEnabledLists=function(n,t){n=n.sort();t=t.sort();this._showingCommandIds=this._minus(this._union(this._showingCommandIds,n),t)};Mail.Commands.Host.prototype.consumeCommands=function(){var n=this._minus(this._sortedRegisteredCommandsIds,this.composeCommands());return this.consumeCommands=function(){return n},n};Mail.Commands.Host.prototype.composeCommands=function(){};Mail.Commands.Host.prototype.viewStateCommands=function(){};Mail.Commands.Host.prototype.commandsToShow=function(){var t=this._composeInFocus()?this.composeCommands():this.consumeCommands(),n=this.viewStateCommands(this._viewState);return this._intersection(this._showingCommandIds,t,n)};Mail.Commands.Host.prototype.commandsToHide=function(){return this._minus(this._sortedRegisteredCommandsIds,this.commandsToShow())};Mail.Commands.Host.prototype.showCommands=function(){};Mail.Commands.Host.prototype.toggleCommand=function(){};Mail.Commands.Host.prototype.applyReducedClass=function(){};Mail.Commands.Host.prototype._composeInFocus=function(){var n=Mail.Globals.commandManager.getContext("composeSelection");return n&&n.composeInFocus};Mail.Commands.Host.prototype._canvasInFocus=function(){var n=Mail.Globals.commandManager.getContext("composeSelection");return n&&n.canvasInFocus};Mail.Commands.Host.prototype._onAddContextHost=function(n){if(n==="composeSelection"){var t=Mail.Globals.commandManager.getContext(n);t.addListener("focuschange",this._onComposeSelectionChange,this)}};Mail.Commands.Host.prototype._onRemoveContextHost=function(n){if(n==="composeSelection"){var t=Mail.Globals.commandManager.getContext(n);t.removeListener("focuschange",this._onComposeSelectionChange,this)}};Mail.Commands.Host.prototype._onComposeSelectionChange=function(){var t=this._composeInFocus(),n=this._canvasInFocus();(t!==this._currentComposeState||n!==this._currentCanvasState)&&(this._currentComposeState=t,this._currentCanvasState=n,this.showCommands(),this.applyReducedClass(n,this._viewState,true))};Mail.Commands.Host.prototype._viewStateChanged=function(n){this._viewState=n;Jx.isNullOrUndefined(this._currentComposeState)&&(this._currentComposeState=this._composeInFocus());Jx.isNullOrUndefined(this._currentCanvasState)&&(this._currentCanvasState=this._canvasInFocus());this.showCommands();this.applyReducedClass(this._currentCanvasState,n,false)};Mail.Commands.Host.prototype._intersection=function(){for(var n=Array.prototype.shift.call(arguments),r;r=Array.prototype.shift.call(arguments);){for(var t=0,i=0,u=[];t<n.length&&i<r.length;)n[t]<r[i]?t++:n[t]>r[i]?i++:(u.push(n[t]),t++,i++);n=u}return n};Mail.Commands.Host.prototype._union=function(n,t){for(var i=0,r=0,u=[];i<n.length||r<t.length;)r===t.length||n[i]<t[r]?(u.push(n[i]),i++):i===n.length||n[i]>t[r]?(u.push(t[r]),r++):(u.push(n[i]),i++,r++);return u};Mail.Commands.Host.prototype._minus=function(n,t){for(var i=0,r=0,u=[];i<n.length;)r===t.length||n[i]<t[r]?(u.push(n[i]),i++):n[i]>t[r]?r++:(i++,r++);return u}})