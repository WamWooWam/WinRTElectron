﻿Jx.delayDefine(Mail,"ReadingPaneBody",function(){"use strict";var i=Mail.ReadingPaneBody=function(n,t,i,r){this._parent=t;this._downloadStatus=r;this._message=null;this._animator=i||null;this._disposer=new Mail.Disposer;this._writer=null;this._writerDisposer=null;this._frame=null;this._frameReadyStateHook=null;this._frameKeyDownHandler=this._frameKeyDownHandler.bind(this);this._framePointerUpHandler=this._framePointerUpHandler.bind(this);this._resizeJob=null;this._resetZoomLevelJob=null;this._updateJob=null;this._cachedReadingPaneWrapperWidth=0;this._setFocusAfterReload=false;this._imageListeners=null;this._numberOfImagesToLoad=0;this._resizeTimer=null;this._rootElementId=n;this._rootElement=null;this._hyperlinkTooltip=new ModernCanvas.HyperlinkTooltip(ModernCanvas.OpenLinkOptions.click)},t=i._Selectors={bodyFrameElementSelector:".mailReadingPaneBodyFrame",bodyWrapperSelector:".mailReadingPaneBodyWrapper",scrollPreserverSelector:".mailReadingPaneScrollPreserver",downloadImagesLink:".mailReadingPaneDownloadImagesLink"},r=i.Events={bodyLoaded:"bodyLoaded",frameClicked:"frameClicked"},n=i.prototype;Jx.augment(i,Jx.Events);Object.defineProperty(n,"focusAfterReload",{set:function(n){this._setFocusAfterReload=n},enumerable:true});n.getBodyType=function(){var n=this._writer;return n?n.getBodyType():null};n._clearAsyncUpdate=function(){Jx.dispose(this._updateJob);this._updateJob=null};n.deactivateUI=function(){this.disposeOldContent();this._disposer.dispose();Jx.dispose(this._resizeJob);Jx.dispose(this._resetZoomLevelJob);this._clearFrameReadyStateListener();Jx.dispose(this._resizeTimer);this._clearAsyncUpdate()};n.activateUI=function(){var n,i;n=this._rootElement=document.getElementById(this._rootElementId);this._frame=n.querySelector(t.bodyFrameElementSelector);this._disposer.add(new Mail.EventHook(window,"resize",this._onLayoutChanged,this,true));this._disposer.add(new Mail.EventHook(Mail.guiState,"layoutChanged",this._onLayoutChanged,this));i=n.querySelector(t.downloadImagesLink);this._disposer.add(new Mail.EventHook(i,"click",function(){this._message.allowExternalImages=true;this.disposeOldContent();this.update()},this,false));this._initPinchAndZoom()};n._onLayoutChanged=function(){this._cachedReadingPaneWrapperWidth=0;Mail.guiState.isReadingPaneVisible&&this._resetFrameSize()};n._initPinchAndZoom=function(){var t=this._frame.contentDocument,n=this._rootElement.querySelector(Mail.CompReadingPane.rootContentElementSelector);t.addEventListener("dblclick",function(){n.msContentZoomFactor=1}.bind(this),false);n.msContentZoomFactor=1};n.update=function(n){this._clearAsyncUpdate();this.disposeOldContent();this._refreshUI(n)};n.clearMessage=function(){this.disposeOldContent();this._message=null};n.disposeOldContent=function(){Jx.isNullOrUndefined(this._writer)||(Mail.writeProfilerMark("ReadingPaneBody.disposeOldContent",Mail.LogEvent.start),this._hyperlinkTooltip.deactivateUI(),this._disposer.disposeNow(this._writerDisposer),this._writerDisposer=null,this._writer=null,Jx.dispose(this._resizeJob),this._resizeJob=null,this._clearAsyncUpdate(),Jx.dispose(this._resizeTimer),Jx.dispose(this._imageListeners),this._imageListeners=null,this._numberOfImagesToLoad=0,this._nullifyBody(),Mail.writeProfilerMark("ReadingPaneBody.disposeOldContent",Mail.LogEvent.stop))};n._isFrameReady=function(){var n=this._isReady;return n||(n=this._isReady=Mail.Validators.isDocumentReady(this._frame.contentDocument)),n};n._clearFrameReadyStateListener=function(){this._disposer.disposeNow(this._frameReadyStateHook);this._frameReadyStateHook=null};n._refreshUI=function(n){if(Mail.writeProfilerMark("ReadingPaneBody._refreshUI",Mail.LogEvent.start),Jx.isInstanceOf(n,Mail.UIDataModel.MailMessage)&&(this._message=n),this._clearFrameReadyStateListener(),!this._isFrameReady()){this._frameReadyStateHook=new Mail.EventHook(this._frame.contentDocument,"readystatechange",this._refreshUI,this,false);this._disposer.add(this._frameReadyStateHook);return}this._load();this._showReadingPane();Mail.writeProfilerMark("ReadingPaneBody._refreshUI",Mail.LogEvent.stop)};n._nullifyBody=function(){this._frame.contentDocument.innerHTML=""};n._load=function(){if(this._nullifyBody(),!Jx.isObject(this._message)){Jx.log.info("ReadingPaneBody._loadBody: no message to load");return}Mail.log("ReadingPane_updateBody",Mail.LogEvent.start);var n=this._frame.contentDocument;this._showSpinner(false);this._writer=new Mail.BodyWriter(this._message,n,{onNoBody:this._onNoBody,onNoBodyContext:this},this._downloadStatus);this._writerDisposer=this._disposer.add(new Mail.Disposer(this._writer,new Mail.EventHook(this._writer,Mail.BodyWriter.Events.contentWritten,this._onContentReady,this),new Mail.EventHook(this._writer,Mail.BodyWriter.Events.processingDone,this._parent.onBodyProcessingDone,this._parent),new Mail.EventHook(this._writer,Mail.BodyWriter.Events.contentChanged,function(){this.disposeOldContent();this._clearAsyncUpdate();this._updateJob=Jx.scheduler.addJob(null,Mail.Priority.readingPaneContentChanged,"reading pane body - update",this.update,this)},this),new Mail.EventHook(n,"click",this._frameClickHandler,this),new Mail.EventHook(n,"keydown",this._frameKeyDownHandler,this),new Mail.EventHook(n,"MSPointerUp",this._framePointerUpHandler,this)));this._resetZoomLevel();this.raiseEvent(r.bodyLoaded,null);Mail.log("ReadingPane_updateBody",Mail.LogEvent.stop)};n._onNoBody=function(){this._showSpinner(true)};n._showSpinner=function(n){Mail.ReadingPaneTruncationControl.showSpinner(n,document.getElementById("mailFrameReadingPane"))};n._onContentReady=function(){var e,u,n,i;Mail.writeProfilerMark("ReadingPaneBody._onContentReady",Mail.LogEvent.start);var r=this._frame.contentDocument,s=r.documentElement,h=r.body;if(Jx.setClass(s,"mailReadingPaneSelection",this._message.irmCanExtractContent),r.title=Jx.res.getString("mailReadingPaneMessageBodyAriaLabel"),e=this._rootElement.querySelector(t.downloadImagesLink),u=this._writer.areImagesBlocked(),Jx.setClass(e,"hidden",!u),!u){var c=this._imageListeners=new Mail.Disposer,o=h.getElementsByTagName("img"),l=this._numberOfImagesToLoad=o.length,f=this._onImageDownloadStatusChanged;for(n=0;n<l;++n)i=o[n],c.addMany(new Mail.EventHook(i,"load",f,this,false),new Mail.EventHook(i,"error",f,this,false),new Mail.EventHook(i,"abort",f,this,false))}this._resetFrameSize(this._getFrameDirectionReversed());this._hyperlinkTooltip.iframeElement=this._frame;this._hyperlinkTooltip.activateUI();Mail.writeProfilerMark("ReadingPaneBody._onContentReady",Mail.LogEvent.stop)};n._getFrameDirectionReversed=function(){var n=this._frame.contentDocument,t;return n&&n.body&&(t=Jx.Bidi.getDocumentDirection(n),Jx.isNonEmptyString(t))?t!==document.body.getComputedStyle().direction:false};n._resetHScroll=function(){Mail.writeProfilerMark("ReadingPaneBody._resetHScroll",Mail.LogEvent.start);var n=this._rootElement.querySelector(Mail.CompReadingPane.rootContentElementSelector);n.scrollLeft=this._getFrameDirectionReversed()?this._frame.contentDocument.documentElement.scrollWidth:0;Mail.writeProfilerMark("ReadingPaneBody._resetHScroll",Mail.LogEvent.stop)};n._resetZoomLevel=function(){Jx.dispose(this._resetZoomLevelJob);this._resetZoomLevelJob=Jx.scheduler.addJob(null,Mail.Priority.readingPaneBodyResetZoomLevel,"ReadingPaneBody._resetZoomLevel",function(){Mail.writeProfilerMark("ReadingPaneBody._resetZoomLevel",Mail.LogEvent.start);var n=this._rootElement.querySelector(Mail.CompReadingPane.rootContentElementSelector);n.scrollTop=0;n.msContentZoomFactor=1;this._resetHScroll();Mail.writeProfilerMark("ReadingPaneBody._resetZoomLevel",Mail.LogEvent.stop)},this)};n._showReadingPane=function(){this._message&&(Mail.log("ReadingPane_showReadingPane",Mail.LogEvent.start),this._frame.classList.remove("hidden"),this._resetFrameSize(),this._animator&&this._animator.shortFadeIn(this._frame),this._setFocusAfterReload&&(this._setFocusAfterReload=false,Mail.setActiveElementBySelector(t.bodyFrameElementSelector,document.getElementById(this._rootElementId))),Mail.log("ReadingPane_showReadingPane",Mail.LogEvent.stop))};n._frameClickHandler=function(){Jx.EventManager.fireDirect(null,r.frameClicked)};n._frameKeyDownHandler=function(n){Mail.log("ReadingPane_body_keydown",Mail.LogEvent.start);Mail.Globals.commandManager.executeShortcut(Mail.Commands.ShortcutManager.mapKeyEvents(n))&&(n.preventDefault(),n.stopPropagation(),n.stopImmediatePropagation());Mail.log("ReadingPane_body_keydown",Mail.LogEvent.stop)};n._framePointerUpHandler=function(n){if(n.button===3){n.preventDefault();n.stopPropagation();n.stopImmediatePropagation();var t={control:false,shift:false,keyCode:Jx.KeyCode.browserback,alt:false};Mail.Globals.commandManager.executeShortcut(t)}};n._onImageDownloadStatusChanged=function(){Mail.writeProfilerMark("ReadingPaneBody._onImageDownloadStatusChanged",Mail.LogEvent.start);Jx.dispose(this._resizeTimer);this._numberOfImagesToLoad--;this._numberOfImagesToLoad>0?this._resizeTimer=new Jx.Timer(200,this._setFrameSize,this):this._setFrameSize();Mail.writeProfilerMark("ReadingPaneBody._onImageDownloadStatusChanged",Mail.LogEvent.stop)};n._clearFrameDimensions=function(){var n=this._frame.style;n.height="auto";n.width="280px"};n._resetFrameSize=function(n){this._writer&&this._writer.isContentWritten()&&(Mail.writeProfilerMark("ReadingPaneBody._resetFrameSize",Mail.LogEvent.start),Jx.dispose(this._resizeTimer),this._frame.classList.add("mailHideScrollbars"),Jx.dispose(this._resizeJob),this._resizeJob=Jx.scheduler.addJob(null,Mail.Priority.readingPaneBodyResetFrameSize,"ReadingPaneBody._resetFrameSize",function(t){Mail.writeProfilerMark("ReadingPaneBody._resetFrameSize-async",Mail.LogEvent.start);t.classList.remove("mailHideScrollbars");this._clearFrameDimensions();this._setFrameSize();n&&this._resetHScroll();Jx.EventManager.fireDirect(null,"bodyResized");Mail.writeProfilerMark("ReadingPaneBody._resetFrameSize-async",Mail.LogEvent.stop)},this,[this._frame]),Mail.writeProfilerMark("ReadingPaneBody._resetFrameSize",Mail.LogEvent.stop))};n._getReadingPaneWrapperWidth=function(){return this._cachedReadingPaneWrapperWidth===0&&(Mail.writeProfilerMark("ReadingPaneBody._getReadingPaneWrapperWidth",Mail.LogEvent.start),this._cachedReadingPaneWrapperWidth=this._rootElement.querySelector(t.bodyWrapperSelector).offsetWidth,Mail.writeProfilerMark("ReadingPaneBody._getReadingPaneWrapperWidth",Mail.LogEvent.stop)),this._cachedReadingPaneWrapperWidth};n._setFrameSize=function(){var r,e,o;Mail.writeProfilerMark("ReadingPaneBody._setFrameSize",Mail.LogEvent.start);var u=this._frame,s=u.contentDocument,n=s.documentElement,f=u.style,i=this._getReadingPaneWrapperWidth();if(i===0){Mail.writeProfilerMark("ReadingPaneBody._setFrameSize",Mail.LogEvent.stop);return}n.style.maxWidth=i+"px";r=this._rootElement.querySelector(t.scrollPreserverSelector).style;Mail.writeProfilerMark("ReadingPaneBody._setFrameSize - get document scrollWidth",Mail.LogEvent.start);e=n.scrollWidth;Mail.writeProfilerMark("ReadingPaneBody._setFrameSize - get document scrollWidth",Mail.LogEvent.stop);r.width=f.width=Math.max(i,e.toString())+"px";Mail.writeProfilerMark("ReadingPaneBody._setFrameSize - get document scrollHeight",Mail.LogEvent.start);o=n.scrollHeight;Mail.writeProfilerMark("ReadingPaneBody._setFrameSize - get document scrollHeight",Mail.LogEvent.stop);r.height=f.height=o.toString()+"px";Mail.writeProfilerMark("ReadingPaneBody._setFrameSize",Mail.LogEvent.stop)}})