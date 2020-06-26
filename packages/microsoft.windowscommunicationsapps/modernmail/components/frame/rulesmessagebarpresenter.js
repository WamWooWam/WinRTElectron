﻿Jx.delayDefine(Mail,"RulesMessageBarPresenter",function(){"use strict";function o(n){return f+n.objectId}var n=Microsoft.WindowsLive.Platform,r="ruleRunning",f="errorRule-",e=Chat.MessageBar.Priority,i=function(t,i,r){var u=n.AccountType,f=r.accountType;this._presenter=t;this._account=r;this._ruleResource=null;this._disposer=null;(f===u.liveId||f===u.eas)&&(this._ruleResource=r.getResourceByType(n.ResourceType.mailRule),this._disposer=new Mail.Disposer(new Mail.EventHook(this._ruleResource,"changed",this._ruleResourceChanged,this)))},u,t;i.prototype.dispose=function(){if(this._ruleResource)this._presenter.onRemoveAccount(this._account,this._ruleResource);Jx.dispose(this._disposer)};i.prototype._ruleResourceChanged=function(){this._presenter.onRuleResourceChanged(this._account,this._ruleResource)};u=Mail.RulesMessageBarPresenter=function(){this._messageBar=null;this._platform=null;this._className=null;this._accounts=null;this._runningCount=0;this._runningStatusShownTime=0;this._runningRules={};this._clearRunningTimerId=null;this._messageDuration=(new Windows.UI.ViewManagement.UISettings).messageDuration*500};t=u.prototype;t.init=function(t,r,u){this._messageBar=t;this._platform=r;this._className=u;var f=new Mail.QueryCollection(r.accountManager.getConnectedAccountsByScenario,r.accountManager,[n.ApplicationScenario.mail,n.ConnectedFilter.normal,n.AccountSort.name]);this._accounts=new Mail.MappedCollection(f,function(n){return new i(this,r,n)},this);this._accounts.forEach(Jx.fnEmpty);this._accounts.unlock()};t.dispose=function(){this._accounts&&this._accounts.dispose();Jx.isNumber(this._clearRunningTimerId)&&(clearTimeout(this._clearRunningTimerId),this._clearRunningTimerId=null)};t.onRuleResourceChanged=function(t,i){this._updateRunningRules(t,i,false)};t._updateRunningRules=function(t,i,u){var o,c,s,l,h,f;o=this._runningCount;c=Mail.Utilities.ConnectivityMonitor.hasNoInternetConnection();i.running&&!u?this._runningRules[i.objectId]||(this._runningRules[i.objectId]=true,this._runningCount++):this._runningRules[i.objectId]&&(this._runningRules[i.objectId]=false,this._runningCount--);this._runningCount>0&&o===0&&!c?(s=Jx.res.getString("mailRuleRunningStatusMessage"),l={messageText:s,button2:{text:Jx.res.getString("/messagebar/messageBarCloseText"),tooltip:Jx.res.getString("/messagebar/messageBarCloseTooltip"),callback:this._closeClicked.bind(this)},tooltip:s,cssClass:this._className},this._messageBar.addErrorMessage(r,e.low,l),this._runningStatusShownTime=Date.now()):this._runningCount===0&&o>0&&(h=function(){this._runningCount===0&&(this._messageBar.removeMessage(r),this._runningStatusShownTime=0,this._clearRunningTimerId=null)}.bind(this),f=Date.now()-this._runningStatusShownTime,f>0&&f<=this._messageDuration?this._clearRunningTimerId=setTimeout(h,this._messageDuration-f):h(),u||this._checkResult(t,i));u&&delete this._runningRules[i.objectId]};t._checkResult=function(t,i){var u,r,f,e;u=i.ruleRunResult;r=o(i);this._messageBar.removeMessage(r);u!==n.Result.success&&(f=Jx.res.loadCompoundString("mailRuleRunningErrorMessage",t.emailAddress),e={messageText:f,button2:{text:Jx.res.getString("/messagebar/messageBarCloseText"),tooltip:Jx.res.getString("/messagebar/messageBarCloseTooltip"),callback:this._closeClicked.bind(this)},cssClass:this._className},this._messageBar.addErrorMessage(r,2,e))};t._closeClicked=function(n,t){this._messageBar.removeMessage(t)};t.onRemoveAccount=function(t,i){this._updateRunningRules(t,i,true)}})