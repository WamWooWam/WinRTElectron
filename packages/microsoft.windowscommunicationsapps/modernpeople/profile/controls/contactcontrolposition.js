﻿Jx.delayDefine(People.Controls,"ContactControlPosition",function(){var r=window.People,n=r.Controls,f=r.Layout,t=getComputedStyle(document.body).direction,i=t==="rtl"?"right":"left",u=t==="rtl"?"left":"right",e=0,o=40,s=380;n.ContactControlPosition={};n.ContactControlPosition.update=function(n,r,h,c,l){if(n.getLayoutState()!==f.layoutState.snapped&&h.hasChildNodes()){var y=h.lastChild.getBoundingClientRect(),p=h.getBoundingClientRect(),a=t==="rtl"?-1:1,w=p[i]-a*(l?l:s),v=a*Math.round(y[u]-p[i])-e;return v!==r&&(h.style.width=v+"px",c.style[i]=a*Math.round(y[u]-w)+o+"px"),v}};n.ContactControlPosition.getScrollPosition=function(n){return{scroll:{scrollLeft:n.scrollLeft,scrollTop:n.scrollTop}}};n.ContactControlPosition.setScrollPosition=function(n,t){if(Jx.isObject(t)&&Jx.isObject(t.scroll))for(var i in t.scroll)n[i]=t.scroll[i]}})