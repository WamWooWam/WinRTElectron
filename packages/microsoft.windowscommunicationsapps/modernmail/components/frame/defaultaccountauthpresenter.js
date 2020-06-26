﻿Jx.delayDefine(Mail,"DefaultAccountAuthPresenter",function(){"use strict";Mail.DefaultAccountAuthPresenter=function(){this._account=null};var n=Mail.DefaultAccountAuthPresenter.prototype;n._messageBar=null;n._platform=null;n._className=null;n._EMAIL_VERIFY_MESSAGE_ID="emailVerifyID";n.init=function(n,t,i){this._messageBar=n;this._platform=t;this._className=i;this._accountChanged=this._accountChanged.bind(this);Jx.scheduler.addJob(null,Mail.Priority.registerAuthPresenter,"register default auth presenter",this._register,this)};n._register=function(){try{this._account=this._platform.accountManager.defaultAccount;this._account.addEventListener("changed",this._accountChanged);this._checkErrorState(this._account.lastAuthResult)}catch(n){Jx.log.error("DefaultAccountAuthPresenter: Error registering change handler on default account");Jx.promoteOriginalStack(n);throw n}};n._accountChanged=function(n){var t=n.target;this._checkErrorState(t.lastAuthResult)};n.dispose=function(){this._account&&this._account.removeEventListener("changed",this._accountChanged)};n._checkErrorState=function(n){var i=Microsoft.WindowsLive.Platform.Result.emailVerificationRequired,t;n===i?(t={messageText:Jx.res.loadCompoundString("/messagebar/messageBarIDCRLUnverifiedEasi",this._account.emailAddress),button2:{text:Jx.res.getString("/messagebar/messageBarCloseText"),tooltip:Jx.res.getString("/messagebar/messageBarCloseText"),callback:this._closeClicked.bind(this)},cssClass:this._className},this._messageBar.addErrorMessage(this._EMAIL_VERIFY_MESSAGE_ID,1,t)):this._messageBar.removeMessage(this._EMAIL_VERIFY_MESSAGE_ID)};n._closeClicked=function(n,t){this._messageBar.removeMessage(t)}})