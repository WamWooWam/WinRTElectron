﻿Jx.delayDefine(People,["UiFlyoutMenu","UiFlyoutMenuItem"],function(){function i(n){function i(n){return p(t),t.show(),n.stopPropagation(),false}var t=this;t._items=[];t.$obj=document.createElement("span");t.$obj.innerHTML='<a href="#" role="menu" aria-haspopup="true"><\/a>';t._$a=t.$obj.querySelector("a");t._$menu=null;t._$a.appendChild(n);t._$mspan=t._$a.querySelector("span.c_mlu");t._$flyout=null;t._$a.onclick=i;t._$a.onkeydown=function(n){var t=event.keyCode;if(t===y)return i(n)}}function h(n){if(!n._$menu){var t=document.createElement("div");t.setAttribute("class","win-menu win-flyout uiflyoutmenu");t.setAttribute("role","menu");t.setAttribute("style","visibility: hidden; opacity: 0");t.setAttribute("aria-hidden","true");t.setAttribute("focusable","false");t.setAttribute("data-win-control","WinJS.UI.Flyout");n._$menu=t;n._$menu.onkeydown=function(t){var i=t.keyCode;if(i===o)n.setItemFocus(null,-1);else if(i===s)n.setItemFocus(null,0);else if(i===e)n.hide(),n.setFocus();else if(i===v){if(n._$menu!==document.activeElement)return}else return;return t.stopPropagation(),false};n._$flyout||(n._$flyout=new WinJS.UI.Flyout(n._$menu,{alignment:u.bidi.direction==="rtl"?"right":"left"}),n._$flyout.addEventListener("afterhide",function(){Jx.removeClass(n._$a,"menuOpen");document.body.removeChild(n._$menu)},false))}}function p(n){n._$beforeDisplay&&n._$beforeDisplay(n);Jx.addClass(n._$a,"menuOpen")}function w(n,t,i){var r=n._items.splice(t,1);return n._$menu&&n._$menu.removeChild(r[0]),i&&r[0].dispose(),n._$flyout&&n._$flyout.hide(),r[0]}function b(n){for(var i=n._items,t=0;t<i.length;t++)i[t].dispose();return n._items=[],n._$menu&&(n._$menu.innerHTML=""),n._$flyout&&n._$flyout.hide(),n}function c(n,t){var r=n||{},i;for(i in t)!r.hasOwnProperty(i)&&t.hasOwnProperty(i)&&(r[i]=t[i]);return r}function r(n){var t=this;t.$obj=n;a(t,false)}function k(){return f++,"uimenuitem_"+String(f)}function l(n){n._$button||(n._$button=document.createElement("button"),n._$button.setAttribute("class","win-command"),n._$button.setAttribute("role","menuitem"),n.$obj.appendChild(n._$button),Jx.addClass(n.$obj,"uiflyoutmenuitem"),n._$button.id=k())}function a(n,t){t&&(n.$obj=null);n._$button=null;n._$span=null;n._$sep=null;n.$parentMenu=null}var u=window.People,n,t,f;u.UgTest=true;var e=27,o=38,s=40,v=13,y=32;u.UiFlyoutMenu=i;n=i.prototype;n._items=null;n.$obj=null;n._$flyout=null;n._$beforeDisplay=null;n.addBeforeShowHandler=function(n){return this._$beforeDisplay=n,this};n.setAriaMenuTitle=function(n){this._$a&&this._$a.setAttribute("aria-label",n)};n.setAriaMenuTitleByIds=function(n){this._$a&&this._$a.setAttribute("aria-labelledby",n)};n.count=function(){return this._items?this._items.length:0};n.setHtml=function(n){var t=this;return t._$mspan&&(t._$mspan.innerHTML=n),t};n.add=function(n){var t=this,i;return h(t),i=t._$menu.querySelector(".win-final"),i?t._$menu.insertBefore(n.$obj,i):t._$menu.appendChild(n.$obj),n.$parentMenu=t,t._items.push(n),t._items.length===1&&t._$menu.setAttribute("aria-activedescendant",n.getActiveId()),t};n.remove=function(n,t){var r=this,i=w(r,n,t);return i&&(i.$parentMenu=null),i};n.clear=function(){var n=this;return b(n),n};i.defaultOptions={html:"",container:null,menuParams:null};n.show=function(){this._items.length>0&&(h(this),document.body.appendChild(this._$menu),this._$flyout.show(this._$a,"auto"))};n.hide=function(){this._$flyout&&this._$flyout.hide()};n.setFocus=function(){this._$a.focus()};n.setItemFocus=function(n,t){var i=0,u=this._items.length,r;if(u>0){for(r=0;r<u;r++)if(this._items[r]===n){i=r;break}if(t)for(i+=t;i<0;)i+=u;this._items[i%u].setFocus()}};i.create=function(n){var t=c(n,i.defaultOptions),r;return t.container||(t.container=document.createElement("span"),t.container.innerHTML='<span class="c_mlu"><\/span><span class="c_chev"> &#xE015;<\/span>'),r=new i(t.container),t.html&&r.setHtml(t.html),r};u.UiFlyoutMenuItem=r;t=r.prototype;t.$obj=null;t._$button=null;t._$sep=null;t._aclickHandler=null;t.$parentMenu=null;t.setHtml=function(n){var t=this;return l(t),t._$button.innerHTML=n,t};t.setAriaLabel=function(n){var t=this;t._$button&&t._$button.setAttribute("aria-label",n)};f=0;t.removeClick=function(){var n=this;return n._aclickHandler&&(n._aclickHandler=null),n};t.addClick=function(n){var t=this;return l(t),t.removeClick(),t._aclickHandler=function(){var t;try{t=n()}catch(i){return false}return t},t._$button.onclick=function(n){return t._aclickHandler&&t._aclickHandler(),t.$parentMenu&&t.$parentMenu.hide(),n.stopPropagation(),false},t._$button.onkeydown=function(n){var i=n.keyCode;if(i===o)t.$parentMenu.setItemFocus(t,-1);else if(i===s)t.$parentMenu.setItemFocus(t,1);else if(i===e)t.$parentMenu.hide(),t.$parentMenu.setFocus();else return;return n.stopPropagation(),false},t};t.getActiveId=function(){var n=this;return n._$button?n._$button.id:""};t.setFocus=function(){var n=this;n._$button&&n._$button.focus()};t.addSeparator=function(){var n=this;return n._$sep||(n._$sep=document.createElement("hr"),n.$obj.appendChild(n._$sep)),n._$sep.style.display="block",n};t.removeSeparator=function(){var n=this;return n._$sep&&(n._$sep.style.display="none"),n};t.dispose=function(){var n=this;n.removeClick();a(n,true)};r.defaultOptions={html:"",separator:false,click:null,container:null};r.create=function(n){var t=c(n,r.defaultOptions),i;return t.container||(t.container=document.createElement("div")),i=new r(t.container),t.html&&i.setHtml(t.html),t.separator&&i.addSeparator(),t.click&&i.addClick(t.click),i}})