﻿Jx.delayDefine(Mail,"ReadingPaneHeader",function(){"use strict";Mail.ReadingPaneHeader=function(n){this._message=this._messageHook=null;this._host=null;this._header=new Mail.HeaderControl(n);this._resizeHook=null};Mail.ReadingPaneHeader.prototype.initialize=function(n){this._host=n;this._header.initialize(n)};Mail.ReadingPaneHeader.prototype.dispose=function(){Mail.writeProfilerMark("ReadingPaneHeader.dispose",Mail.LogEvent.start);Jx.dispose(this._resizeHook);Jx.dispose(this._messageHook);this._message=this._messageHook=this._resizeHook=null;this._header.dispose();Mail.writeProfilerMark("ReadingPaneHeader.dispose",Mail.LogEvent.stop)};Mail.ReadingPaneHeader.prototype.setMessage=function(n){Jx.dispose(this._messageHook);this._messageHook=null;this._message=n;Jx.isObject(this._message)?(this._messageHook=new Mail.EventHook(this._message,"changed",this._messageChanged,this),this._resizeHook||(this._resizeHook=new Mail.EventHook(window,"resize",this._updateDateTime,this,false)),this._updateHeader(),this._host.classList.remove("hidden")):(Jx.dispose(this._resizeHook),this._resizeHook=null)};Mail.ReadingPaneHeader.prototype._messageChanged=function(n){Mail.Validators.havePropertiesChanged(n,["to","cc","bcc","from","receivedDate","irmTemplateId"])&&this._updateHeader()};Mail.ReadingPaneHeader.prototype._updateDateTime=function(){var n=this._message,t=Jx.ApplicationView.State,i=Jx.ApplicationView.getState();i===t.minimum||i===t.snap?this._header.updateDateTime(n.bestDateShortString):this._header.updateDateTime(n.bestDateLongString,n.bestTimeShortString)};Mail.ReadingPaneHeader.prototype._updateHeader=function(){var n=this._message;this._updateDateTime();this._header.updateIrmInfo(n.irmHasTemplate,n.irmTemplateName,n.irmTemplateDescription);this._header.updateHeader(n.to,n.cc,n.bcc,n.fromRecipientArray,n.headerNoRecipientsString,n.isOutboundFolder,n.isOutboundFolder,n.isInSentItems,n.senderRecipient)}})