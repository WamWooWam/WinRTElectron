﻿Jx.delayDefine(People,"UpsellSection",function(){var n=window.People,t=Microsoft.WindowsLive.Platform;n.UpsellSection=function(i,r){n.StaticSection.call(this,"upsellSection");this._renderRequested=false;var u={getAssetText:function(n){return n.serviceContactsName},delayRender:true,phase2Ctor:Jx.Component};this._upsellControl=new n.Accounts.UpsellControl(i,t.ApplicationScenario.people,r,{phase1InstructionsId:"/strings/upsellInstructions",phase1DismissId:"/strings/upsellPhase1Dismiss",phase2InstructionsId:"/strings/upsellPhase2Instructions"},u);this.appendChild(this._upsellControl);Jx.EventManager.addListener(this._upsellControl,"upsellDismissed",this._onUpsellDismissed.bind(this),this)};Jx.inherit(n.UpsellSection,n.StaticSection);n.UpsellSection.prototype.hydrateExtent=function(t){if(this._upsellControl.shouldShow()&&this._upsellControl.getPhase()<=1){var i=Jx.getUI(this._upsellControl);this._contentElement.innerHTML=i.html;this._upsellControl.activateUI()}else this.hide();Jx.EventManager.addListener(this._upsellControl,"upsellAvailable",this._onUpsellsAvailable.bind(this),this);n.StaticSection.prototype.hydrateExtent.call(this,t)};n.UpsellSection.prototype.render=function(){n.StaticSection.prototype.render.call(this);this._upsellControl.shouldShow()&&this._upsellControl.getPhase()<=1&&this._upsellControl.render();this._renderRequested=true};n.UpsellSection.prototype._onUpsellDismissed=function(){this._hidden||this.hide();this._upsellControl&&(this.removeChild(this._upsellControl),this._upsellControl.shutdownUI(),this._upsellControl=null)};n.UpsellSection.prototype._onUpsellsAvailable=function(){this._hidden?(this._upsellControl.initUI(this._contentElement),this._renderRequested&&this._upsellControl.render(),this.show()):this._upsellControl&&this._upsellControl.getPhase()>1&&this._onUpsellDismissed()};n.UpsellSection.prototype._upsellControl=null})