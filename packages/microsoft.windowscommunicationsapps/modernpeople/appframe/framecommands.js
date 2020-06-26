﻿Jx.delayDefine(People,"FrameCommands",function(){var n=window.People;n.FrameCommands=function(t){this._jobSet=t;this._element=null;this._keyboardNavigation=null;this._focusOutListener=this._onFocusOut.bind(this);this._commands=new n.AppCommands;this.initComponent()};Jx.inherit(n.FrameCommands,Jx.Component);n.FrameCommands.prototype.hasCommands=function(){return this._commands.getCommandsLength()!=0};n.FrameCommands.prototype.addCommand=function(n){this._commands.addCommand(n)};n.FrameCommands.prototype.getUI=function(n){n.html='<div class="grid-header-frameCommands"><\/div>'};n.FrameCommands.prototype.activateUI=function(){this._element=document.querySelector(".grid-header-frameCommands")};n.FrameCommands.prototype.deactivateUI=function(){Jx.dispose(this._keyboardNavigation);this._keyboardNavigation=null};n.FrameCommands.prototype.getElement=function(){return this._element};n.FrameCommands.prototype.reset=function(){this._commands.reset()};n.FrameCommands.prototype.update=function(){for(var u=this._commands,n=this._element,i,r,t=n.childNodes.length-1;t>=0;t--)n.removeChild(n.childNodes[t]);for(i=0;i<u.getCommandsLength();i++)r=u.getCommandByIndex(i),r.visible&&n.appendChild(this._createCommandButton(r));Jx.dispose(this._keyboardNavigation);this._keyboardNavigation=new Jx.KeyboardNavigation(n,"horizontal")};n.FrameCommands.prototype._createCommandButton=function(n){var t=document.createElement("button");return t.id=n.commandId,t.disabled=!n.enabled,t.tabIndex=-1,Jx.isNullOrUndefined(n.tooltip)||(t.title=Jx.res.getString(n.tooltip),t.setAttribute("aria-label",t.title)),Jx.addClass(t,"win-command"),Jx.addClass(t,"win-hidefocus"),Jx.setClass(t,"hidden",!n.visible),t.addEventListener("keyup",this._onKeyup.bind(this),false),t.addEventListener("click",this._onClick.bind(this,n),false),t.innerHTML="<span class='win-commandicon win-commandring' aria-hidden='true'><span class='win-commandimage' aria-hidden='true'>"+n.iconSymbol+"<\/span><\/span>",t};n.FrameCommands.prototype._onKeyup=function(n){var t=n.target;Jx.removeClass(t,"win-hidefocus");t.addEventListener("focusout",this._focusOutListener,false)};n.FrameCommands.prototype._onFocusOut=function(n){var t=n.target;Jx.addClass(t,"win-hidefocus");t.removeEventListener("focusout",this._focusOutListener,false)};n.FrameCommands.prototype._onClick=function(t){if(t.enabled){var i=null;if(t.onInvoke)try{i=t.onInvoke.call(t.context,t.commandId,event.srcElement,this);Jx.log.info("Command + "+t.commandId+" invoked")}catch(r){Jx.log.exception("Invoking command "+t.commandId+" failed.",r)}else t.link&&n.Nav.navigate(t.link)}else Jx.log.error("Invoking command "+t.commandId+" failed.")}})