﻿Jx.delayDefine(People.Accounts,"Phase2Upsell",function(){var r=window.People,t=r.Accounts,i=t.Phase2Upsell=function(n,t,i,r){this._platform=i;this._scenario=r;this._upsellSettings=n;this._descriptionId=t.phase2InstructionsId||"";this.initComponent()},n;Jx.inherit(i,Jx.Component);n=i.prototype;n.getUI=function(n){var t=Jx.res.getString(this._descriptionId);n.html="<div id='"+this._id+"' class='phase2Upsell'><div class='upsell-instructions' title='"+Jx.escapeHtml(t)+"'>"+t+"<\/div><div role='button' class='upsell-dismiss typeSizeNormal' tabIndex='0' >"+Jx.res.getString("/accountsStrings/upsellOK")+"<\/div><\/div>"};n.activateUI=function(){var t=this._containerElement=document.getElementById(this._id),n=t.querySelector(".upsell-dismiss");n.addEventListener("click",this._onDismiss=this._onDismiss.bind(this),false);n.addEventListener("keypress",this._onKeyPress=this._onKeyPress.bind(this),false)};n._onDismiss=function(){this._upsellSettings.markDismissed();t.showAccountSettingsPage(this._platform,this._scenario,t.AccountSettingsPage.upsells,{launchedFromApp:true})};n._onKeyPress=function(n){["Spacebar","Enter"].indexOf(n.key)>=0&&(this._upsellSettings.markDismissed(),t.showAccountSettingsPage(this._platform,this._scenario,t.AccountSettingsPage.upsells,{launchedFromApp:true}),n.preventDefault())};n.shouldShow=function(){return true};n.render=Jx.fnEmpty})