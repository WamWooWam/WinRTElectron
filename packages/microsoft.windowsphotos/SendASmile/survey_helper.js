﻿(function(){var d=document.getElementById("FMSContainer");window.handleLoad=function(){parent.postMessage({jsLoaded:true},"*");var a=setInterval(function(){try{if(window.MS&&window.MS.Support.Fms.Survey.SurveyInstances.SURVERCONTAINER_plugin0){var b=window.MS.Support.Fms.Survey.SurveyInstances.SURVERCONTAINER_plugin0;b.startTime&&g(a,b)}}catch(c){Jx.log.exception("Feedback: Error when polling for FMS JS variables",c)}},100)};var j=document.URL.split("?")[1];window._ms_support_fms_surveyConfig=JSON.parse(j);window._ms_support_fms_surveyConfig.target=d.id;c(_ms_support_fms_surveyConfig.localCss);c("/resources/sendasmile/css/"+_ms_support_fms_surveyConfig.parameters[0]+"SaSColor.css");var a=document.createElement("script");a.type="text/javascript";a.src="/Jx/Jx.js";document.head.appendChild(a);window.addEventListener("message",k,false);var h=setTimeout(function(){parent.postMessage({badLoad:true},"*")},_ms_support_fms_surveyConfig.loadTimeout);function f(c,b,a){return c.replace(/\{0\}/g,a).replace(/\{1\}/g,b)}function c(b){var a=document.createElement("link");a.type="text/css";a.rel="stylesheet";a.href=b;document.head.appendChild(a)}function l(){Qx.prototype.find=function(a){return Qx(this[0].querySelectorAll(a))};Qx.prototype.val=function(a){if(!a)return this[0].value;this[0].value=a;return this};Qx.prototype.bind=Qx.prototype.on;Qx.prototype.attr=function(a,b){this[0][a]=b;return this};Qx.prototype.hide=function(){return this.css({display:"none"})}}function e(h){var q=function(b,c,a,d){return function(){if(c)a[d]=c.value!=="";else a[d]=true;b.disabled=false;for(var e in a)b.disabled=b.disabled||!a[e]}};l();for(var n=Qx(d),m=n.find(".SURVEYSECTION"),x=Qx(m[m.length-1]).find(".NAVBUTTON").last().val(),k=0;k<m.length;k++){var w=Qx(m[k]),s=w.find(".QUESTIONCONTAINER"),v=w.find(".NAVBUTTON"),c=Qx(v[v.length-1]);if(k>0){c.val(x);Jx.addClass(c[0],"SecondButton")}else Jx.addClass(c[0],"FirstButton");for(var i=[],e=0;e<s.length;e++){var g=Qx(s[e]);g.find("table").each(function(){Qx(this).css({width:"100%"})});var B=g.find(".helplink");if(B[0]){c.hide();continue}var t=g.find(".QUESTIONREQUIRED"),A=t.length>0&&t.html();if(A){c[0].disabled=true;i[e]=false;for(var u=g.find("input"),r=0;r<u.length;r++){var a=u[r];if(a.type==="radio"){Qx(a).on({click:q(c[0],null,i,e)});var p=document.createElement("label"),o=a.parentElement;if(a.nextSibling){o.removeChild(a.nextSibling);p.innerHTML=a.value;a.fmsId=a.id;a.id=a.name+a.value}else if(o.nextSibling)p.innerHTML=o.nextSibling.innerHTML;p.htmlFor=a.id;o.appendChild(p)}else if(a.type==="text"){var z=q(c[0],a,i,e);Qx(a).bind({input:z});a.type="email"}}var j=g.find("textarea");if(j[0]){j.attr("rows",4);var C=q(c[0],j[0],i,e);j.bind({input:C})}}}}n.find(".QUESTIONTEXT, .QUESTIONINSTRUCTION, .SURVEYINTROTEXT").each(function(){var a=this.innerHTML,b=Qx(this);if(!a)Qx(this).hide();else{a=f(a,_ms_support_fms_surveyConfig.parameters[0],_ms_support_fms_surveyConfig.localizedAppName);this.innerHTML=a}});var y=h.encodeAnswers;h.encodeAnswers=function(a){n.find("input").each(function(){if(this.fmsId)this.id=this.fmsId});n.find("option").each(function(){if(this.selected)for(var c=0;c<plugin0.pages.length;c++)for(var d=plugin0.pages[c].questions,a=0;a<d.length;a++){var b=d[a];if(b.getOptionById&&b.getOptionById(this.id))b.selected=true}});return y.apply(h,[a])};h.onAfterNext.add(new window.MS.Support.Fms.SurveyEventDelegate(null,b));h.onAfterPrevious.add(new window.MS.Support.Fms.SurveyEventDelegate(null,b))}function b(){var a=window.plugin0,b=a.getCurrentPage(),e=a.pages[a.pages.length-2],f=a.pages[a.pages.length-1],c=false,d=false;if(b===e)a.next();else if(b===f)i();else if(b===a.pages[0])c=true;else d=Qx(b.domObject).find("button").length>0;parent.postMessage({onFirstPage:c,showHelp:d},"*")}function i(){parent.postMessage({submitted:true,textInput:window.plugin0.submitFields.SURVEYANSWERS},"*")}function g(b,a){clearTimeout(h);clearInterval(b);e(a);parent.postMessage({loaded:true},"*")}function k(a){var b=a.data;if(a.origin!=="")b.backButtonPressed&&plugin0.previous()}window.alert=function(){}})()