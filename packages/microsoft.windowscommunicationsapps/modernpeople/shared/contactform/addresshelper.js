﻿Jx.delayDefine(People,"AddressHelper",function(){function e(n){if(n){var t=document.createElement("tempDiv"),i=document.createTextNode(n);t.appendChild(i);n=t.innerHTML}return n}function r(n){var r=n._localeHelper,i=t[r.region];return i||(i=t.Default),f[i.view]||f[0]}function o(n,t,i){if(t[n]){var r=t[n];return i&&typeof r=="string"&&(this._numeralSystemTranslator=new Windows.Globalization.NumberFormatting.NumeralSystemTranslator,r=this._numeralSystemTranslator.translateNumerals(r)),r}return null}function h(n,t,i){for(var r="",f="",e="",h="",u="",a=n.length,s,l,c=0;c<a;c++)if(s=n[c],l=s.substring(0,1),l==="#"||l==="%"){if(h=o(s.substring(1),t,i),h){for(e&&(f+=e,e=""),u=h,l==="%"&&(u=h.toLocaleUpperCase());u.substring(u.length-1)==="\n";)u=u.substring(0,u.length-1);f+=u}}else s==="\n"?(f&&(Boolean(r)&&r.substring(r.length-1)!=="\n"&&(r+="\n"),r+=f),f="",e="",u=""):e||u&&(e=s,u="");return f&&(Boolean(r)&&r.substring(r.length-1)!=="\n"&&(r+="\n"),r+=f),r}function s(n,t,i){for(var c="",l=n.split("\n"),r=0,f,o,h,s,u=0,a=l.length;u<a;u++)f="span",o="",r>0&&(f="div"),t&&(h=r===0?t:t+"_"+String(r),i&&i.push(h),o=" id='"+h+"'"),r++,s="<"+f,o&&(s+=o),s+=">"+e(l[u])+"<\/"+f+">",c+=s;return c}function c(n,t,i,r){for(var y="",u="",h="",l="",f="",w=n.length,c,v,p,a=0;a<w;a++)c=n[a],v=c.substring(0,1),v==="#"||v==="%"?(p=c.substring(1),l=o(p,t,false),l&&(h&&(u+="<span>"+e(h)+"<\/span>",h=""),f=l,v==="%"&&(f=l.toLocaleUpperCase()),u+=i?s(f,i+p,r):s(f,null,null))):c==="\n"?(u&&(y+="<div>"+u+"<\/div>"),u="",h="",f=""):h||f&&(h=c,f="");return u.length&&(y+="<div>"+u+"<\/div>"),y}var i=window.People,u={0:["street","city","state","zipCode","country"],1:["zipCode","state","city","street","country"],2:["state","city","street","zipCode","country"],3:["street","zipCode","city","state","country"]},f={0:["#street","\n","#city",", ","#state"," ","#zipCode","\n","#country"],1:["#zipCode","\n","#state","#city","#street","\n","#country"],2:["#street","\n","#zipCode"," ","#city","\n","#state","\n","#country"],3:["#street","\n","#zipCode"," ","#city","\n","#state","\n","#country"],4:["#street","\n","#zipCode"," ","#city"," ","#state","\n","#country"],5:["#zipCode","\n","#state","#city","#street","\n","#country"],6:["#country"," ","#state"," ","#city",", ","#street","\n","#zipCode"],7:["#street","\n","#zipCode"," ","%city","\n","#state","\n","#country"],8:["#street","\n","#zipCode",", ","#city","\n","#state","\n","#country"],9:["#street","\n","#city"," - ","#state","\n","#country","\n","#zipCode"],10:["#street","\n","#city","\n","#state","\n","#country","\n","#zipCode"],11:["#country","#state","#city","#street","\n","#zipCode"],12:["#street","\n","#zipCode"," ","#city","\n","#state","\n","#country"]},t={Default:{view:0,edit:0},TW:{view:1,edit:1},DE:{edit:3,view:2},CH:{edit:3,view:2},AT:{edit:3,view:2},LI:{edit:3,view:2},LU:{edit:3,view:2},FR:{edit:3,view:3},IT:{edit:3,view:4},JP:{edit:1,view:5},KP:{edit:2,view:6},KR:{edit:2,view:6},BE:{edit:3,view:7},NL:{edit:3,view:7},AN:{edit:3,view:7},PL:{edit:3,view:8},BR:{edit:0,view:9},RU:{edit:0,view:10},CN:{edit:2,view:11},ES:{edit:3,view:12},AR:{edit:3,view:12},BO:{edit:3,view:12},CL:{edit:3,view:12},CO:{edit:3,view:12},CR:{edit:3,view:12},CU:{edit:3,view:12},DO:{edit:3,view:12},EC:{edit:3,view:12},SV:{edit:3,view:12},GT:{edit:3,view:12},HN:{edit:3,view:12},MX:{edit:3,view:12},NI:{edit:3,view:12},PA:{edit:3,view:12},PY:{edit:3,view:12},PE:{edit:3,view:12},PR:{edit:3,view:12},UY:{edit:3,view:12},VE:{edit:3,view:12}},n;i.AddressHelper=function(){this._localeHelper=new i.LocaleHelper};n=i.AddressHelper.prototype;n._localeHelper=null;n.getAddressEditFieldOrder=function(){var i=this._localeHelper,n=t[i.region];return n||(n=t.Default),n.edit};n.getAddressEditFieldOrderStrings=function(){return u[this.getAddressEditFieldOrder()]||u[0]};n.getAddressViewFieldOrderStrings=function(){for(var u=[],f=r(this),e=f.length,t,i,n=0;n<e;n++)t=f[n],i=t.substring(0,1),(i==="#"||i==="%")&&u.push(t.substring(1));return u};n.formatViewAddressAsString=function(n,t){var i=r(this);return h(i,n,t)};n.formatViewAddressAsHtml=function(n,t,i){var u=r(this);return c(u,n,t,i)}})