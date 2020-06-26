﻿Share.RequestHelper=function(n,t){this._shareOperation=n;this._quickLink=t};Share.RequestHelper.prototype.sendMessageToOutbox=function(n,t,i){this._mailMessage=n;try{var u=i.mailManager,r=Microsoft.WindowsLive.Platform;this._resourceChanged=this._resourceChanged.bind(this);this._resource=t.getResourceByType(r.ResourceType.mail);this._resource.addEventListener("changed",this._resourceChanged);this._mailMessage.moveToOutbox();u.ensureMailView(r.MailViewType.outbox,this._mailMessage.accountId,"");this._mailMessage.addEventListener("changed",this._mailMessageChanged.bind(this));Jx.log.verbose("Sending Mail Message to outbox");this._mailMessage.commit();this._mailMessageId=this._mailMessage.objectId;Jx.log.info("Sent mail message ID: "+this._mailMessageId)}catch(f){Jx.fault("ShareToMail.MailSendFailure","OutboxCommitFailure",f);this._mailError=Share.MailConstants.MailError.preOutboxError;this.mailSent=true;this._endTransfer(false)}};Share.RequestHelper.prototype._resourceChanged=function(){var t,n,i;this._resource&&(this._resource.isSendingMail||(this._resource.removeEventListener("changed",this._resourceChanged),t=this._resource.lastSendMailResult,t!==0&&this._mailMessage.isInSpecialFolderType(Microsoft.WindowsLive.Platform.MailFolderType.outbox)&&(n=Microsoft.WindowsLive.Platform.Result,i=[n.authNotAttempted,n.credentialMissing,n.accountLocked,n.accountSuspendedAbuse,n.accountSuspendedCompromise,n.accountUpdateRequired,n.actionRequired,n.authRequestThrottled,n.defaultAccountDoesNotExist,n.emailVerificationRequired,n.forceSignIn,n.parentalConsentRequired,n.passwordDoesNotExist,n.passwordLogonFailure,n.passwordUpdateRequired,n.ixp_E_IMAP_LOGINFAILURE,n.ixp_E_SMTP_535_AUTH_FAILED,n.e_HTTP_DENIED,n.autoDiscoveryFailed,n.nteDecryptionFailure,-2147023665,-2146893042].indexOf(t)!==-1,i?this._mailError=Share.MailConstants.MailError.authError:this._checkForInternetConnection()&&(this._mailError=Share.MailConstants.MailError.outboxError,Jx.fault("ShareToMail.MailSendFailure","LastSendMailResult",t))),this._endTransfer(false)))};Share.RequestHelper.prototype._getInternetConnectionProfile=function(){return Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile()};Share.RequestHelper.prototype._checkForInternetConnection=function(){try{var n=this._getInternetConnectionProfile();if(n&&n.getNetworkConnectivityLevel()===Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess)return true}catch(t){Jx.log.exception("Exception from Connectivity.NetworkInformation",t)}return this._mailError=Share.MailConstants.MailError.internetError,false};Share.RequestHelper.prototype._mailMessageChanged=function(n){var i=n.target,t=null,r;i.syncStatus!==0&&(t={faultLocation:"MessageSyncStatus",message:"Received syncStatus error from mailMessage",number:i.syncStatus});t&&(this.mailSent=true,this._mailError=Share.MailConstants.MailError.outboxError,r=Share.MailConstants.hresultResourceNotFound,t.number===r&&this._checkForInternetConnection(),this._mailError!==Share.MailConstants.MailError.internetError&&Jx.fault("ShareToMail.MailSendFailure",t.faultLocation,t),this._endTransfer(false))};Share.RequestHelper.prototype.cancel=function(n){Jx.log.verbose("RequestHelper received request to cancel");this.mailSent||(n.deleteObject(),this.mailSent=true);this._endTransfer(true)};Share.RequestHelper.prototype._endTransfer=function(n){Jx.log.verbose("Share.RequestHelper.endTransfer");this._resource&&(this._resource.removeEventListener("changed",this._resourceChanged),this._resource=null);this._mailMessage&&(this._mailMessage.removeEventListener("changed",this._mailMessageChanged),this._mailMessage=null);n?Jx.log.verbose("Share.RequestHelper calling reportCompleted in cancel case"):Jx.EventManager.fire(null,Share.MailConstants.messageSentEvent);this._reportCompleted()};Share.RequestHelper.prototype._reportCompleted=function(){this._isCompleted||(Jx.log.verbose("Share.RequestHelper.reportCompleted; mailError: "+this._mailError),this._mailError===Share.MailConstants.MailError.outboxError?this._shareOperation.reportError(Jx.res.getString(Share.Constants.stringsPrefix+"mailInOutboxError")):this._mailError===Share.MailConstants.MailError.internetError?this._shareOperation.reportError(Jx.res.getString(Share.MailConstants.stringsPrefix+"offlineSendError")):this._mailError===Share.MailConstants.MailError.preOutboxError?this._shareOperation.reportError(Jx.res.getString(Share.Constants.stringsPrefix+"mailGenericNotInOutboxError")):this._mailError===Share.MailConstants.MailError.authError?this._shareOperation.reportError(Jx.res.getString(Share.MailConstants.stringsPrefix+"accountError")):Jx.isNullOrUndefined(this._quickLink)?this._shareOperation.reportCompleted():this._shareOperation.reportCompleted(this._quickLink),this._isCompleted=true)};Share.RequestHelper.prototype._shareOperation=null;Share.RequestHelper.prototype.mailSent=false;Share.RequestHelper.prototype._mailError=Share.MailConstants.MailError.none;Share.RequestHelper.prototype._resource=null;Share.RequestHelper.prototype._mailMessageId=null;Share.RequestHelper.prototype._mailMessage=null;Share.RequestHelper.prototype._quickLink=null;Share.RequestHelper.prototype._isCompleted=false