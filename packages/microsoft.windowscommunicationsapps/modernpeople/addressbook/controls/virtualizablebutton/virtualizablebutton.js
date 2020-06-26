﻿Jx.delayDefine(People,"VirtualizableButton",function(){var t=window.People,i=t.Animation,n=t.VirtualizableButton=function(n){this._title="";this._text="";this._dataContext=null;this._clickCallback=n;this._internalClickHandler=this._onClick.bind(this);this._internalKeydownHandler=this._onKeydown.bind(this);var t=document.createElement("div");t.innerHTML=this.getUI();this._element=t.firstChild;this._element.id=this.id="vb"+Jx.uid();this.activateUI()};n.prototype.getUI=function(){var n=Jx.escapeHtml(this._title);return"<div class='virtualButton' role='button' aria-label='"+n+"'>"+Jx.escapeHtml(this._text)+"<\/div>"};n.prototype.activateUI=function(){this._element.addEventListener("click",this._internalClickHandler,false);this._element.addEventListener("keydown",this._internalKeydownHandler,false);i.addTapAnimation(this._element)};n.prototype._onClick=function(){this._clickCallback.invoke([this._dataContext])};n.prototype._onKeydown=function(n){(n.key==="Spacebar"||n.key==="Enter")&&this._onClick()};n.prototype.getHandler=function(){return this};n.prototype.getElement=function(){return this._element};n.prototype.setDataContext=function(n){this._dataContext=n;this._title=n.title;this._text=n.text;this._element.innerText=Jx.escapeHtml(this._text);this._element.setAttribute("aria-label",Jx.escapeHtml(this._title))};n.prototype.nullify=function(){this.setDataContext({title:"",text:""});this._dataContext=null};n.prototype.dispose=function(){this._element.removeEventListener("click",this._internalClickHandler);this._element.removeEventListener("keydown",this._internalKeydownHandler)}})