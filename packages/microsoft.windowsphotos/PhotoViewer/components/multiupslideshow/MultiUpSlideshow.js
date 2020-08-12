﻿(function(){PhotoViewer.MultiUpSlideshowComponent=function(b,a){this.initComponent();this._site=b;this._dataHub=a;this._multiUpAlbumsRootContainer=null;this._controller=null};Jx.augment(PhotoViewer.MultiUpSlideshowComponent,Jx.Component);var a=PhotoViewer.MultiUpSlideshowComponent.prototype;a.getUI=function(a){if(!this._controller)this._controller=new PhotoViewer.MultiUpSlideshowController(this._site,this._dataHub);this._controller.getMainViewUI(this._id,a)};a.activateUI=function(){Jx.Component.prototype.activateUI.call(this);this._controller.activate(this._multiUpAlbumsRootContainer)};a.deactivateUI=function(){if(this._controller){this._controller.deactivate();this._controller=null}this._dataHub.executeAsync("refreshMultiUpLayout",null);this._dataHub.executeAsync("setPassiveMultiUpGenerationMode",null);Jx.Component.prototype.deactivateUI.call(this)};a.setInitializationParameters=function(a){this._multiUpAlbumsRootContainer=a.additionalData};a.getEntranceAnimationInfo=function(){return this._controller.getEntranceAnimationInfo()};a.getExitAnimationInfo=function(){return this._controller.getExitAnimationInfo()}})();(function(){var d=Windows.UI.ViewManagement,c=d.ApplicationView,b=d.ApplicationViewState;PhotoViewer.MultiUpSlideshowController=function(b,a){this._site=b;this._dataHub=a;this._view=null;this._displayRequest=null;this._rootContainer=null;this._timeoutToken=null;this._iterationSpeed=3e3;this._populateInitialViewCount=0;this._contentItemIndex=0;this._contentLayout=null;this._contentDisplayOrderIndex=0;this._contentAlbumName=null;this._getNextActiveAlbumCompletedCallback=null;this._getNextActiveAlbumErrorCallback=null;this._slideshowInErrorState=false;this._currentViewState=c.value;this._onContentCollectionChanged=this._onContentCollectionChanged.bind(this);this._onVisibilityChanged=this._onVisibilityChanged.bind(this);this._onSizeOrPlateauChanged=this._onSizeOrPlateauChanged.bind(this)};var a=PhotoViewer.MultiUpSlideshowController.prototype;a.getMainViewUI=function(a,b){if(!this._view)this._view=new PhotoViewer.MultiUpSlideshowView(this._site);this._view.getMainViewUI(a,b)};a.activate=function(b){this._rootContainer=b;this._view.activate();var a=this;this._getNextActiveAlbum().done(function(){PhotoViewer.log.perf("evPhotoViewer_MultiUpSlideshow_IterateToNextAlbum",{itemData:a._contentAlbumName});if(!a._view)return;a._populateInitialView();a._site.displayStateManager.addSizeChangeCallback(a._onSizeOrPlateauChanged);a._site.plateauScaleManager.addScaleChangeCallback(a._onSizeOrPlateauChanged);a._displayRequest=new Windows.System.Display.DisplayRequest;a._displayRequest.requestActive()},function(){a._showError()})};a.deactivate=function(){if(this._displayRequest){this._displayRequest.requestRelease();this._displayRequest=null}document.removeEventListener("visibilitychange",this._onVisibilityChanged,false);this._dataHub.content.removeEventListener("changed",this._onContentCollectionChanged);this._site.displayStateManager.removeSizeChangeCallback(this._onSizeOrPlateauChanged);this._site.plateauScaleManager.removeScaleChangeCallback(this._onSizeOrPlateauChanged);this._stopIteration();if(this._view){this._view.deactivate();this._view=null}};a.getEntranceAnimationInfo=function(){return this._view.getEntranceAnimationInfo()};a.getExitAnimationInfo=function(){document.removeEventListener("visibilitychange",this._onVisibilityChanged,false);this._site.displayStateManager.removeSizeChangeCallback(this._onSizeOrPlateauChanged);this._site.plateauScaleManager.removeScaleChangeCallback(this._onSizeOrPlateauChanged);this._stopIteration();return this._view.getExitAnimationInfo()};a._scheduleIteration=function(){if(!this._slideshowInErrorState&&!this._timeoutToken){var a=this;this._timeoutToken=setTimeout(function(){a._iterateNext()},this._iterationSpeed)}};a._stopIteration=function(){if(this._timeoutToken){clearTimeout(this._timeoutToken);this._timeoutToken=null}};a._isSameLayout=function(a,b){if(Boolean(a)!==Boolean(b))return false;if(a.columns!==b.columns||a.rows!==b.rows)return false;if(a.minThumbnailWidth!==b.minThumbnailWidth||a.minThumbnailHeight!==b.minThumbnailHeight)return false;if(a.grids.length!==b.grids.length)return false;for(var e=0;e<a.grids.length;e++){var d=a.grids[e],c=b.grids[e];if(d.top!==c.top||d.left!==c.left)return false;if(d.width!==c.width||d.height!==c.height)return false}return true};a._getAlbumProperties=function(e,b){var a=this,c="filename",d=this._getLayoutPropHelper();this._dataHub.contentContainer.getProperties([d,c],function(l,g,k){if(!k)return;var i=g[d];if(!Jx.isNonEmptyString(i)){b();return}var f=JSON.parse(i);if(!a._isSameLayout(a._contentLayout,f)){a._contentLayout=f;a._view.setLayout(a._contentLayout)}else a._contentLayout.order=f.order;var h=g[c];if(!Jx.isNonEmptyString(h)){b();return}a._contentAlbumName=h;a._contentItemIndex=0;a._contentDisplayOrderIndex=0;var j=a._dataHub.content;if(j.size<a._contentLayout.grids.length)b();else e()})};a._onContentCollectionChanged=function(){var a=this._dataHub.content;if(!a.isPopulationComplete)return;a.removeEventListener("changed",this._onContentCollectionChanged);var b=this._getNextActiveAlbumCompletedCallback,c=this._getNextActiveAlbumErrorCallback;this._getNextActiveAlbumCompletedCallback=null;this._getNextActiveAlbumErrorCallback=null;this._getAlbumProperties(b,c)};a._getNextActiveAlbum=function(){var a=this;return new WinJS.Promise(function(d,b){var c=a._rootContainer.nextActiveItem;if(!c){b();return}a._dataHub.content.removeEventListener("changed",a._onContentCollectionChanged);a._getNextActiveAlbumCompletedCallback=d;a._getNextActiveAlbumErrorCallback=b;a._dataHub.content.addEventListener("changed",a._onContentCollectionChanged);a._dataHub.contentContainer=c})};a._populateInitialView=function(){this._populateInitialViewCount++;var a=this,b=[],c=function(){var d=a._dataHub.content.objectAt(a._contentItemIndex++);while(!d)if(a._contentItemIndex<a._dataHub.content.size)d=a._dataHub.content.objectAt(a._contentItemIndex++);else{a._showError();return}var e=d.id;d.getThumbnailAsync(a._contentLayout.minThumbnailWidth,a._contentLayout.minThumbnailHeight,null,false).done(function(g){if(!a._view)return;if(Boolean(g.data)){PhotoViewer.log.perf("evPhotoViewer_MultiUpSlideshow_IterateToNextThumbnail",{itemData:e});b[b.length]=g;if(b.length===a._contentLayout.grids.length-1){var f=[];f[a._contentLayout.order[0]]={albumName:a._contentAlbumName,thumbnailResult:null};for(var d=0,h=b.length;d<h;d++)f[a._contentLayout.order[d+1]]={albumName:null,thumbnailResult:b[d]};a._contentDisplayOrderIndex+=1+b.length;a._view.populateInitialView(f).done(function(){if(!a._view)return;a._populateInitialViewCount--;if(a._populateInitialViewCount===0){a._scheduleIteration();document.addEventListener("visibilitychange",a._onVisibilityChanged,false);a._dataHub.executeAsync("setActiveMultiUpGenerationMode",null)}});return}}if(a._contentItemIndex<a._dataHub.content.size)c();else a._showError()})};c()};a._iterateNext=function(){this._timeoutToken=null;if(this._dataHub.content.size===0){this._showError();return}if(this._site.mode!==PhotoViewer.Coordinator.Mode.multiUpSlideshow||!this._view)return;var a=this;if(this._contentItemIndex>=this._dataHub.content.size)this._getNextActiveAlbum().done(function(){if(!a._view)return;PhotoViewer.log.perf("evPhotoViewer_MultiUpSlideshow_IterateToNextAlbum",{itemData:a._contentAlbumName});a._view.displayAlbumName(a._contentLayout.order[a._contentDisplayOrderIndex++],a._contentAlbumName,0,1e3);a._scheduleIteration()},function(){a._showError()});else{var b=this._dataHub.content.objectAt(this._contentItemIndex++);if(!b){a._iterateNext();return}var c=b.id;b.getThumbnailAsync(a._contentLayout.minThumbnailWidth,a._contentLayout.minThumbnailHeight,null,false).then(function(b){if(!a._view)return;if(Boolean(b.data)){PhotoViewer.log.perf("evPhotoViewer_MultiUpSlideshow_IterateToNextThumbnail",{itemData:c});a._view.displayThumbnail(a._contentLayout.order[a._contentDisplayOrderIndex++],b,0,1e3);a._scheduleIteration()}else a._iterateNext()})}};a._showError=function(){this._slideshowInErrorState=true;this._view.showErrorMessage(Jx.res.getString("resid-multiUpSlideshow-NoPhotoError"));if(this._displayRequest){this._displayRequest.requestRelease();this._displayRequest=null}};a._getLayoutPropHelper=function(){var a="layoutLandscape";if(this._currentViewState===b.fullScreenPortrait)a="layoutPortrait";else if(this._currentViewState===b.snapped)a="layoutSnap";return a};a._onVisibilityChanged=function(){var a=document.msVisibilityState;if(a==="hidden")this._stopIteration();else a==="visible"&&this._scheduleIteration()};a._onSizeOrPlateauChanged=function(){var a=c.value,d=this._currentViewState!==a;if((this._currentViewState===b.fullScreenLandscape||this._currentViewState===b.filled)&&(a===b.fullScreenLandscape||a===b.filled))d=false;this._currentViewState=a;if(d){this._stopIteration();document.removeEventListener("visibilitychange",this._onVisibilityChanged,false);var e=this;this._getAlbumProperties(function(){e._populateInitialView()},function(){e._showError()})}else this._view.refreshView()}})();(function(){var f=PhotoViewer.DataHubHelpers,c=PhotoViewer.AnimationHelpers,b="multiUpSlideshow-content",d=66.66,e=83.33;PhotoViewer.MultiUpSlideshowView=function(a){this._site=a;this._containers=null;this._content=null;this._hideCursorTimeoutToken=null;this._documentWidth=0;this._documentHeight=0;this._contentLayout=null;this._onKeyUp=this._onKeyUp.bind(this);this._onClick=this._onClick.bind(this);this._onPointerMove=this._onPointerMove.bind(this)};var a=PhotoViewer.MultiUpSlideshowView.prototype;a.getMainViewUI=function(c,a){a.html+='<div id="'+c+'">';a.html+='<div id="'+b+'">';a.html+="</div>";a.html+="</div>"};a.activate=function(){var a=document.getElementById(b);this._content=a;a.addEventListener("keyup",this._onKeyUp,false);a.addEventListener("click",this._onClick,false);a.addEventListener("MSPointerMove",this._onPointerMove,false)};a.deactivate=function(){var a=this._content;if(a){a.removeEventListener("keyup",this._onKeyUp,false);a.removeEventListener("click",this._onClick,false);a.removeEventListener("MSPointerMove",this._onPointerMove,false);this._content=null}this._stopHideCursorTimer()};a.getEntranceAnimationInfo=function(){PhotoViewer.log.perf("evPhotoViewer_MultiUpSlideshow_EntranceAnimation_start",{emptyValue:true});return PhotoViewer.AnimationHelpers.genericComponentAnimationInfoById(b,"MultiUpSlideshow","Entrance",true)};a.getExitAnimationInfo=function(){PhotoViewer.log.perf("evPhotoViewer_MultiUpSlideshow_ExitAnimation_start",{emptyValue:true});var f=this._content,a=this._containers,d=PhotoViewer.AnimationHelpers.genericComponentAnimationInfoById(b,"MultiUpSlideshow","Exit",true);d.entranceAnimationDelay=a?750:167;d.runCustomAnimation=function(){if(a){for(var g=[],d=c.customAnimationDelay,b=a.length-1;b>=0;b--){g[g.length]=WinJS.UI.executeTransition(a[b],[{property:"opacity",delay:d,duration:500,timing:PhotoViewer.AnimationHelpers.pvlEaseInCurve,from:1,to:0},{property:"transform",delay:d,duration:500,timing:"linear",from:"scale(1.0, 1.0)",to:"scale(0.9, 0.9)"}]);d+=e}var h=WinJS.Promise.join(g);return h.then(function(){PhotoViewer.log.perf("evPhotoViewer_MultiUpSlideshow_ExitAnimation_stop",{emptyValue:true})})}else if(f)return WinJS.UI.executeTransition(f,{property:"opacity",delay:c.customAnimationDelay,duration:500,timing:"linear",from:1,to:0});return WinJS.Promise.wrap(null)};return d};a.setLayout=function(a){this._contentLayout=a};a.refreshView=function(){var g=this._containers.length;if(g===0)return;var n=document.body,f=n.clientWidth,e=n.clientHeight;if(this._documentWidth===f&&this._documentHeight===e)return;for(var l=f/this._contentLayout.columns,j=e/this._contentLayout.rows,q=this._contentLayout.grids.length,d=0;d<g;d++){var a=this._contentLayout.grids[d],p=this._containers[d],b=p.style,k=Math.ceil(a.left*l),m=Math.ceil(a.top*j),i=Math.ceil((a.left+a.width)*l)-k,h=Math.ceil((a.top+a.height)*j)-m;b.left=String(k)+"px";b.top=String(m)+"px";b.width=String(i)+"px";b.height=String(h)+"px";var o=p.childNodes,c=o[o.length-1];c.tagName==="IMG"&&PhotoViewer.Graphics.scaleAndCenter(c,c.width,c.height,i,h,true)}this._documentWidth=f;this._documentHeight=e};a.populateInitialView=function(s){var t=this._content;if(this._containers)for(var i=0,w=this._containers.length;i<w;i++)t.removeChild(this._containers[i]);var f=this._contentLayout,r=document.body,o=r.clientWidth,l=r.clientHeight,p=o/f.columns,m=l/f.rows;this._containers=[];for(var z=f.grids.length,e=0;e<z;e++){var a=f.grids[e],g=document.createElement("div"),j=g.style;g.id="multiUpSlideshow-container"+e.toString();j.position="absolute";j.overflow="hidden";var n=Math.ceil(a.left*p),q=Math.ceil(a.top*m),x=Math.ceil((a.left+a.width)*p)-n,v=Math.ceil((a.top+a.height)*m)-q;j.cssText+=";left:"+String(n)+"px;top:"+String(q)+"px;width:"+String(x)+"px;height:"+String(v)+"px";t.appendChild(g);this._containers[e]=g}this._documentWidth=o;this._documentHeight=l;for(var h=167,c=[],b=0,y=s.length;b<y;b++){var k=s[b];if(k.albumName)c[c.length]=this.displayAlbumName(b,k.albumName,h,500);else c[c.length]=this.displayThumbnail(b,k.thumbnailResult,h,500);h+=d}this._content.focus();this._scheduleHideCursorTimer();var u=WinJS.Promise.join(c);return u.then(function(){PhotoViewer.log.perf("evPhotoViewer_MultiUpSlideshow_EntranceAnimation_stop",{emptyValue:true})})};a.displayAlbumName=function(i,j,h,d){var b=this._containers[i],a=document.createElement("div");a.id="multiUpSlideshow-container-text";a.className="multiUpSlideshow-container-text";a.innerText=j;var e=parseInt(this._content.currentStyle.lineHeight),g=parseInt(b.style.height),f=25,c=a.style;c.bottom=String(f)+"px";c.maxHeight=String(Math.floor((g-2*f)/e)*e)+"px";this._animateChildElementExit(b,d);return this._animateChildElementEntrance(b,a,h,d)};a.displayThumbnail=function(j,e,i,d){var b=this._containers[j],c=e.dimensions,l=c.width,h=c.height,m=b.style,k=parseInt(b.style.width),g=parseInt(b.style.height),a=document.createElement("img");a.id="multiUpSlideshow-container-image";a.draggable=false;a.src=f.getSourceFromBlobOperationResult(e,false);PhotoViewer.Graphics.scaleAndCenter(a,l,h,k,g,true);this._animateChildElementExit(b,d);return this._animateChildElementEntrance(b,a,i,d)};a.showErrorMessage=function(e){var c=this._content;if(this._containers){for(var b=0,d=this._containers.length;b<d;b++)c.removeChild(this._containers[b]);this._containers=null}var a=document.createElement("div");a.id="multiUpSlideshow-error";a.className="multiUpSlideshow-error";a.innerText=e;c.appendChild(a);WinJS.UI.executeTransition(a,{property:"opacity",delay:167,duration:1e3,timing:"linear",from:0,to:1});this._site.showAppBars(true,PhotoViewer.AppBar.Bars.top);c.removeEventListener("MSPointerMove",this._onPointerMove,false);this._stopHideCursorTimer()};a._animateChildElementEntrance=function(e,d,a,b){a+=c.customAnimationDelay;e.appendChild(d);return WinJS.UI.executeTransition(d,[{property:"opacity",delay:a,duration:b,timing:"linear",from:0,to:1},{property:"transform",delay:a,duration:b,timing:PhotoViewer.AnimationHelpers.pvlEaseOutCurve,from:"scale(0.9, 0.9)",to:"scale(1.0, 1.0)"}])};a._animateChildElementExit=function(d,e){var a=d.childNodes;if(a.length>0){var b=a[a.length-1];WinJS.UI.executeTransition(b,{property:"opacity",delay:c.customAnimationDelay,duration:e,timing:"linear",from:1,to:0}).done(function(){d.removeChild(b)})}};a._scheduleHideCursorTimer=function(){this._stopHideCursorTimer();var a=this;this._hideCursorTimeoutToken=setTimeout(function(){a._content.style.cursor="none"},3e3)};a._stopHideCursorTimer=function(){if(this._hideCursorTimeoutToken){clearTimeout(this._hideCursorTimeoutToken);this._hideCursorTimeoutToken=null}};a._onKeyUp=function(a){a.key==="Esc"&&this._site.doCommand(PhotoViewer.AppBar.Commands.navigateBack,WindowsLive.Photo.Viewer.Commanding.CommandSurface.keyboardShortcut,null,null)};a._onClick=function(){this._site.showAppBars(true,PhotoViewer.AppBar.Bars.top)};a._onPointerMove=function(){this._content.style.cursor="default";this._scheduleHideCursorTimer()}})()