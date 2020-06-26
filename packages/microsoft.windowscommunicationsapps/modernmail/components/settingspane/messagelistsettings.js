﻿Jx.delayDefine(Mail,"MessageListSettings",function(){"use strict";function i(n){return Jx.escapeHtml(Jx.res.getString(n))}function u(n){Jx.mark("MessageListSettings."+n+",StartTA,MessageListSettings")}function f(n){Jx.mark("MessageListSettings."+n+",StopTA,MessageListSettings")}var n,t,r;Mail.MessageListSettings=function(n){this._host=n;this._toggleSwitchSettings=null;this._disposer=new Mail.Disposer};n=Mail.MessageListSettings.prototype;n.dispose=function(){this._disposer.dispose();this._disposer=null;this._toggleSwitchSettings=null;this._host=null};n.getHTML=function(){return'<div id="mailSettingsPaneMessageListOptionsHeader" class="typeSizeNormal">'+i("mailSettingsPaneMessageListOptionsHeaderLabel")+'<\/div><div id="mailSettingsPaneMessageListThreadingOptionToggleSwitch"><\/div><div id="mailSettingsPaneMessageListThreadingIncludesSentItemsToggleSwitch"><\/div><div id="mailSettingsPaneMessageListAutoMarkAsReadToggleSwitch"><\/div>'};n.populateControls=function(){u("populateControls");this._initToggleSettings();this._toggleSwitchSettings.forEach(function(n){n.toggleSwitch=new WinJS.UI.ToggleSwitch(this._host.querySelector(n.host),{checked:n.initialState,title:i(n.titleResId),labelOn:i("mailSettingsPaneOnLabel"),labelOff:i("mailSettingsPaneOffLabel"),disabled:!n.enabled});this._disposer.add(n.eventHooks)},this);f("populateControls")};n.update=Jx.fnEmpty;n._initToggleSettings=function(){this._toggleSwitchSettings=[new t("#mailSettingsPaneMessageListThreadingOptionToggleSwitch","mailSettingsPaneMessageListThreadingOptionDescriptionLabel","isThreadingEnabled"),new t("#mailSettingsPaneMessageListAutoMarkAsReadToggleSwitch","mailSettingsPaneMessageListAutoMarkAsReadDescriptionLabel","autoMarkAsRead"),new r]};t=function(n,t,i){this._host=n;this._titleResId=t;this._appSettingsProperty=i;this._toggleSwitch=null};t.prototype={get host(){return this._host},get titleResId(){return this._titleResId},get appSettingsProperty(){return this._appSettingsProperty},get enabled(){return true},get initialState(){return Mail.Globals.appSettings[this.appSettingsProperty]},toggledHandler:function(){Mail.Globals.appSettings[this.appSettingsProperty]=this.toggleSwitch.checked},get eventHooks(){return[new Mail.EventHook(this.toggleSwitch,"change",this.toggledHandler,this)]},get toggleSwitch(){return this._toggleSwitch},set toggleSwitch(n){this._toggleSwitch=n}};r=function(){this._host="#mailSettingsPaneMessageListThreadingIncludesSentItemsToggleSwitch";this._titleResId="mailSettingsPaneMessageListThreadingIncludesSentItemsDescriptionLabel";this._toggleSwitch=null};r.prototype={get host(){return this._host},get titleResId(){return this._titleResId},get appSettingsProperty(){},get enabled(){return Mail.Globals.appSettings.isThreadingEnabled},get initialState(){return Mail.Globals.platform.mailManager.getIncludeSentItemsInConversation()},toggledHandler:function(){var n=this.toggleSwitch.checked;Jx.log.info("toggleSwitchSetting.toggleSwitch.checked = "+n);Mail.Globals.platform.mailManager.setIncludeSentItemsInConversation(n)},get eventHooks(){return[new Mail.EventHook(this.toggleSwitch,"change",this.toggledHandler,this),new Mail.EventHook(Mail.Globals.appSettings,Mail.AppSettings.Events.threadingOptionChanged,function(){var n=this.toggleSwitch;n&&(n.disabled=!this.enabled)},this)]},get toggleSwitch(){return this._toggleSwitch},set toggleSwitch(n){this._toggleSwitch=n}}})