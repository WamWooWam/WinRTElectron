﻿Jx.delayDefine(Mail,"AccessibilityHelper",function(){"use strict";var n=Mail.AccessibilityHelper=function(n,t){Mail.writeProfilerMark("AccessibilityHelper.ctor",Mail.LogEvent.start);this._collection=t;this._listView=n;this._updateAccessibility=this._updateAccessibility.bind(this);this._expandedConvLength=null;this._expandedConvNode=null;this._positionById={};this._conversationTree=this._collection.getTreeView();this._disposer=new Mail.Disposer(new Mail.EventHook(this._listView,"accessibilityannotationcomplete",this._updateAccessibility,this),new Mail.EventHook(this._conversationTree,"expanded",this._onExpandedConversationChanged,this),new Mail.EventHook(this._conversationTree,"collapsed",this._onExpandedConversationChanged,this),new Mail.EventHook(this._conversationTree,"reset",this._onReset,this));this._setExpandedConversation(this._conversationTree.activeConversation);Mail.writeProfilerMark("AccessibilityHelper.ctor",Mail.LogEvent.stop)};n.prototype.dispose=function(){Mail.writeProfilerMark("AccessibilityHelper.dispose",Mail.LogEvent.start);this._clearExpandedConversation();Jx.dispose(this._disposer);this._disposer=null;this._listView=null;this._collection=null;Mail.writeProfilerMark("AccessibilityHelper.dispose",Mail.LogEvent.stop)};n.prototype._updateAccessibility=function(n){var t,u;Mail.writeProfilerMark("AccessibilityHelper._updateAccessibility",Mail.LogEvent.start);var r=n.detail,f=r.firstIndex,i=r.lastIndex;if(!(i>=this._collection.count)){if(i>=0)for(t=f;t<=i;t++)u=this._collection.item(t),this._updateMessage(u.objectId);Mail.writeProfilerMark("AccessibilityHelper._updateAccessibility",Mail.LogEvent.stop)}};n.prototype._onExpandedConversationChanged=function(n){Mail.writeProfilerMark("AccessibilityHelper._onExpandedConversationChanged",Mail.LogEvent.start);var t=n.newValue;this._setExpandedConversation(t);Mail.writeProfilerMark("AccessibilityHelper._onExpandedConversationChanged",Mail.LogEvent.stop)};n.prototype._clearExpandedConversation=function(){this._expandedConvNode&&(this._expandedConvNode.removeListener("endChanges",this._updateExpandedMessages,this),this._expandedConvNode=null)};n.prototype._onReset=function(){this._setExpandedConversation(null)};n.prototype._setExpandedConversation=function(n){Mail.writeProfilerMark("AccessibilityHelper._setExpandedConversation",Mail.LogEvent.start);this._clearExpandedConversation();n&&(this._expandedConvNode=n,this._expandedConvNode.addListener("endChanges",this._updateExpandedMessages,this));this._updateExpandedMessages();Mail.writeProfilerMark("AccessibilityHelper._setExpandedConversation",Mail.LogEvent.stop)};n.prototype._updateExpandedMessages=function(){var n,t;if(Mail.writeProfilerMark("AccessibilityHelper._updateExpandedMessages",Mail.LogEvent.start),this._expandedConvLength=0,this._positionById={},this._expandedConvNode)for(this._expandedConvLength=this._expandedConvNode.totalCount,n=0;n<this._expandedConvLength;n++)t=this._expandedConvNode.item(n),this._positionById[t.objectId]=n+1;Mail.writeProfilerMark("AccessibilityHelper._updateExpandedMessages",Mail.LogEvent.stop)};n.prototype._updateMessage=function(n){var i,t,r;i=this._getMessagePosition(n);i!==-1&&(t=Mail.MessageListItemFactory.getElementById(n),t&&(Mail.setAttribute(t,"aria-setsize",String(this._expandedConvLength)),Mail.setAttribute(t,"aria-posinset",String(i)),r=i===this._expandedConvLength,Jx.setClass(t,"mailMessageListLastItemInConversation",r)))};n.prototype._getMessagePosition=function(n){var t=this._positionById[n];return Jx.isValidNumber(t)?t:-1}})