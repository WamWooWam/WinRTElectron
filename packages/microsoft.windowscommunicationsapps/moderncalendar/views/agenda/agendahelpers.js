﻿Jx.delayDefine(Calendar.Views,"AgendaHelpers",function(){function i(n){Jx.mark("Calendar:AgendaHelpers."+n+",StartTA,Calendar")}function r(n){Jx.mark("Calendar:AgendaHelpers."+n+",StopTA,Calendar")}var t=Calendar.Helpers,n=Calendar.Views.AgendaHelpers={};n.ChangeType={add:0,remove:1,change:2};n.ensureInitialized=function(){n._initialized||(n._initialized=true,t.ensureFormats(),n._yesterday=Jx.res.getString("Yesterday"),n._today=Jx.res.getString("Today"),n._tomorrow=Jx.res.getString("Tomorrow"),n._heroUpNext=Jx.res.getString("UpNext"),n._heroNow=Jx.res.getString("Now"),n._heroInOneMinute=Jx.res.getString("InOneMinute"),n._heroInMinutes={format:Jx.res.getFormatFunction("InMinutes")},n._timeRange={format:Jx.res.getFormatFunction("AgendaTimeRange")},n._accEventAllDay={format:Jx.res.getFormatFunction("AccEventAllDay")},n._accEventAllDayWithDate={format:Jx.res.getFormatFunction("AccEventAllDayWithDate")},n._accAgendaAllDayMultiDay={format:Jx.res.getFormatFunction("AccAgendaAllDayMultiDay")},n._accAgendaHero={format:Jx.res.getFormatFunction("AccAgendaHero")},n._accAgendaEvent={format:Jx.res.getFormatFunction("AccAgendaEvent")},n._accAgendaEventMultiDay={format:Jx.res.getFormatFunction("AccAgendaEventMultiDay")},n._timeWithMinutes=new Jx.DTFormatter("hour minute"),n._shortDate=new Jx.DTFormatter("shortDate"),n._dayFull=new Jx.DTFormatter("{dayofweek.full}"),n._fullDateWithDay=new Jx.DTFormatter("dayofweek month day year"),n._fullDateWithDayAndTime=new Jx.DTFormatter("dayofweek month day year hour minute"))};n.registerInteractiveHandlers=function(n){var i=n._anchorHandlers,t=n;i||(i={},t._anchorHandlers=i,i.onMouseOver=function(n){t&&t.classList.add("hover");n.stopPropagation();n.preventDefault()},i.onMouseOut=function(n){if(t){var i=t.classList;i.remove("hover");i.remove("active")}n.stopPropagation();n.preventDefault()},i.onMouseDown=function(n){t&&t.classList.add("active");n.stopPropagation();n.preventDefault()},i.onMouseUp=function(n){t&&t.classList.remove("active");n.stopPropagation();n.preventDefault()},i.onMouseClick=function(){if(t){var n=t.classList;n.remove("active");n.remove("hover")}},t.addEventListener("mouseover",i.onMouseOver),t.addEventListener("mouseout",i.onMouseOut),t.addEventListener("mousedown",i.onMouseDown),t.addEventListener("mouseup",i.onMouseUp),t.addEventListener("click",i.onMouseClick))};n.unregisterInteractiveHandlers=function(n){var t=n._anchorHandlers,i=n;t&&(i._anchorHandlers=null,i.removeEventListener("mouseover",t.onMouseOver),i.removeEventListener("mouseout",t.onMouseOut),i.removeEventListener("mousedown",t.onMouseDown),i.removeEventListener("mouseup",t.onMouseUp),i.removeEventListener("click",t.onMouseClick))};n.getDayFromDate=function(n,t){return t=Jx.isValidNumber(t)?t:0,new Date(n.getFullYear(),n.getMonth(),n.getDate()+t)};n.containsDate=function(n,t,i){return n.getTime()<=i.getTime()&&i.getTime()<t.getTime()};n.compareDates=function(n,t){return n.getTime()-t.getTime()};n.getEventDaySpans=function(t){i("getEventDaySpans");var f=[],u=new Date(t.startDate.getTime()),e=new Date(t.endDate.getTime());do f.push(u),u=n.getDayFromDate(u,1);while(u.getTime()<e.getTime());return f.push(e),r("getEventDaySpans"),f};n.showInAllDayCard=function(n){return n.allDayEvent?true:n.endDate.getTime()-n.startDate.getTime()>=t.dayInMilliseconds?true:false};n.isWithinWeek=function(t,i){t=n.getDayFromDate(t);var r=new Date(t.getFullYear(),t.getMonth(),t.getDate()+8);return n.containsDate(t,r,i)};n.getDateString=function(i,r){var u=t.getDayInfo(i,r);return u.isToday?n._today:u.isTomorrow?n._tomorrow:n._fullDateWithDay.format(r)};n.getRelativeDateString=function(i,r,u){if(t.isSameDate(i,r)){var f=t.getDayInfo(i,u);if(f.isYesterday)return n._yesterday;if(f.isToday)return n._today;if(f.isTomorrow)return n._tomorrow}return n.isWithinWeek(i,u)?n._dayFull.format(u):n._shortDate.format(u)};n.getTimeRange=function(u,f,e,o,s){var h;if(i("getTimeRange"),h={startHtml:null,fullHtml:null},f.getTime()===e.getTime())return h.fullHtml=Jx.escapeHtml(n._timeWithMinutes.format(f)),h;var p=new Date(e.getTime()-1),l=new Date(s.endDate.getTime()-1),a=t.isSameDate(f,s.startDate),v=t.isSameDate(p,l);if(o)s.allDayEvent||a&&!v&&(h.startHtml=Jx.escapeHtml(t.simpleTimeUpper.format(f)));else{var c=a?n._timeWithMinutes.format(f):n.getRelativeDateString(u,f,s.startDate),y=v?n._timeWithMinutes.format(e):n.getRelativeDateString(u,f,l),w=c!==y?n._timeRange.format(c,y):c;h.fullHtml=Jx.escapeHtml(w)}return r("getTimeRange"),h};n.getHeroHeader=function(i,r){if(Jx.isObject(r)){var f=t.getDayInfo(i,r.startDate),u=(r.startDate-i)/t.minuteInMilliseconds;return f.isTomorrow?n._tomorrow:u<=0?n._heroNow:u<=1?n._heroInOneMinute:u<=15?n._heroInMinutes.format(Math.ceil(u)):n._heroUpNext}return null};n.getEventLabel=function(t,i,r,u){var b;var p=i.startDate,k=i.endDate,c=t.startDate,l=t.endDate,d=new Date(l.getTime()-1),w=t.allDayEvent,f=t.subject,e=t.location,o=t.calendar,s=t.email,h=t.statusText;if(t.showInAllDayCard)return w&&!i.multiDay?n._accEventAllDay.format(f,e,o,s,h):w?n._accEventAllDayWithDate.format(n._fullDateWithDay.format(c),n._fullDateWithDay.format(d),f,e,o,s,h):n._accAgendaAllDayMultiDay.format(n._fullDateWithDayAndTime.format(c),n._fullDateWithDayAndTime.format(l),f,e,o,s,h);var a=n.getDateString(r,p),v=i.multiDay?n._fullDateWithDayAndTime.format(c):n._timeWithMinutes.format(p),y=i.multiDay?n._fullDateWithDayAndTime.format(l):n._timeWithMinutes.format(k);return u?(b=n.getHeroHeader(r,i),n._accAgendaHero.format(a,b,v,y,f,e,o,s,h)):i.multiDay?n._accAgendaEventMultiDay.format(a,v,y,f,e,o,s,h):n._accAgendaEvent.format(a,v,y,f,e,o,s,h)};n.wrapEvent=function(u,f,e){var l,k,a,d,s;i("wrapEvent");var v=n.getEventDaySpans(e),y=v.length,o=t.getEventUiInfo(e),p=o.handle,w=n.showInAllDayCard(e),b=[],h={allDayEvent:e.allDayEvent,startDate:e.startDate,endDate:e.endDate,handle:p,objectId:e.objectId,subject:o.subject,location:o.location,statusText:o.statusText,calendar:o.calendar,email:o.email,showInAllDayCard:w,items:b},g=e.busyStatus,nt=y>2,tt=Jx.escapeHtml(o.color),it=Jx.escapeHtml(p),rt=Jx.escapeHtml(o.location),ut=Jx.escapeHtml(o.subject),c=v[0];for(l=1,k=y;l<k;l++)a=v[l],n.containsDate(u,f,c)&&(d=n.getTimeRange(u,c,a,w,e),s={startDate:c,endDate:a,busyStatus:g,multiDay:nt,busyStatusClass:o.status,timeRange:d,colorHtml:tt,handleHtml:it,locationHtml:rt,subjectHtml:ut},s.label=n.getEventLabel(h,s,u),s.startDate=s.startDate.getTime(),s.endDate=s.endDate.getTime(),b.push(s)),c=a;return h.startDate=h.startDate.getTime(),h.endDate=h.endDate.getTime(),r("wrapEvent"),h}})