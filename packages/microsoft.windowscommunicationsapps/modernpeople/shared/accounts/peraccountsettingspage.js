﻿Jx.delayDefine(People.Accounts,"PerAccountSettingsPage",function(){function y(n,t){return t.toastState}function p(n,t,i,r){var u=n.mailManager.ensureMailView(i,t.objectId,"");return u?(r.checked=u.isEnabled,r.addEventListener("change",function(){u.setEnabled(r.checked)})):r.parentElement.style.display="none",Boolean(u)}function w(n,t){var i=new Date;return(!n||i>n)&&(!t||i<t)}function b(n){return!isNaN(n)&&parseInt(n,10)>0}function d(n,t){while(n!==t&&n.parentNode!==null)n=n.parentNode;return n!==t}function o(n,t,i,r){var u=document.createElement("option");return u.innerText=t,u.value=i,u.selected=!!r,n.appendChild(u),u}function l(n,t){var i=n.querySelectorAll(t);Array.prototype.forEach.call(i,function(n){n.style.display="none"})}function a(n,t,i){var r=n.querySelectorAll(t);Array.prototype.forEach.call(r,function(n){n.disabled=i;a(n,"*",i)})}function k(n){if(Jx.isNonEmptyString(n)){var t=s.DataProtection.DataProtectionProvider("local=user"),i=s.CryptographicBuffer.convertStringToBinary(n,s.BinaryStringEncoding.utf8);return t.protectAsync(i)}return WinJS.Promise.wrap(null)}function n(n){return Jx.res.getString("/accountsStrings/"+n)}var h=window.People,r=h.Accounts,t=Microsoft.WindowsLive.Platform,s=Windows.Security.Cryptography,v=Windows.Security.Authentication.OnlineId,c=Windows.UI.Notifications,i=r.PerAccountSettingsPage=function(n,t,i,u,f){r.AccountControlBase.call(this,n,i);this._account=t;this._platform=n;this._scenario=i;this._specialFoldersControl=new e(n,t);this._certificateSettingsControl=new r.CertificateSettingsControl(n,t);this._jobset=u?u.createChild():(new h.Scheduler).getJobSet();this._delayFocusSetting=f;this.append(this._specialFoldersControl,this._certificateSettingsControl);this.initComponent()},u,f,e;Jx.augment(i,Jx.Component);Jx.augment(i,r.AccountControlBase);u={push:0,manual:1,poll15:15,poll30:30,poll60:60};Object.freeze(u);Object.defineProperty(i.prototype,"accountName",{get:function(){return this._inputs.accountName.value}});i.prototype._getBiciSuffix=function(){return"settings"};i.prototype.getUI=function(i){this._id="idPerAccountSettingsPage"+Jx.uid();var u=this._account,c=u.getServerByType(t.ServerType.eas),o=c||u.getServerByType(t.ServerType.imap)||{server:"",domain:"",userId:"",port:0,useSsl:true},f=u.getServerByType(t.ServerType.smtp)||{server:"",userId:"",port:0,useSsl:true,serverRequiresLogin:false,hasPasswordCookie:false,usesMailCredentials:false},l=u.getConfigureType(this._scenario)===t.ConfigureType.editOnClient,s=u.accountType===t.AccountType.imap,a=u.accountType===t.AccountType.eas,e=u.authType===t.AccountAuthType.password,v=s&&!f.usesMailCredentials&&e,h=c&&c.isWlasSupported;i.html="<div id='"+this._id+"'><div id='pasAccountStatus' data-easOrImapOnly='true' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'>"+n("pasCatchAllError")+"<\/div><label id='pasAccountNameLabel' data-easOrImapOnly='false' class='pas-tooltipCheck'>"+n("pasAccountNameLabel")+"<\/label><div data-easOrImapOnly='false'><input id='pasAccountName' aria-labelledby='pasAccountNameLabel' type='text' value='"+Jx.escapeHtml(u.displayName)+"' maxlength='129' "+(l?"":"readonly")+" tabIndex='0'><\/div><label id='pasUserDisplayNameLabel' data-imapOnly='true' class='pas-tooltipCheck'>"+n("actdlgDisplayNameLabel")+"<\/label><div data-imapOnly='true'><input id='pasUserDisplayName' aria-labelledby='pasUserDisplayNameLabel' type='text' value='"+Jx.escapeHtml(u.userDisplayName)+"' maxlength='129'><\/div><div id='pasSyncIntevalStatus' data-easOrImapOnly='true' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'><\/div><label id='pasSyncIntervalLabel' data-easOrImapOnly='true' class='pas-tooltipCheck' >"+n("pasSyncIntervalLabel")+"<\/label><div data-easOrImapOnly='true'><select id='pasSyncInterval' aria-labelledby='pasSyncIntervalLabel'><\/select><\/div><div data-requiresMail='true' data-easOrImapOnly='true'><label id='pasSyncWindowLabel' class='pas-tooltipCheck'>"+n("pasSyncWindowLabel")+"<\/label><select id='pasSyncWindow' aria-labelledby='pasSyncWindowLabel'><option value='"+t.SyncWindowSize.threeDays+"'>"+n("pasSyncWindow3Days")+"<\/option><option value='"+t.SyncWindowSize.oneWeek+"'>"+n("pasSyncWindow7Days")+"<\/option><option value='"+t.SyncWindowSize.twoWeeks+"'>"+n("pasSyncWindow2Weeks")+"<\/option><option value='"+t.SyncWindowSize.oneMonth+"'>"+n("pasSyncWindowMonth")+"<\/option><option value='"+t.SyncWindowSize.all+"'>"+n("pasSyncWindowAll")+"<\/option><\/select><\/div><div id='pasContentToSync' class='pas-checkboxGroup' data-easOrImapOnly='true' ><label id='pasEnabledContentLabel' class='pas-tooltipCheck'>"+n("pasEnabledContentLabel")+"<\/label><div class='pas-checkbox'><label><input id='pasContentTypeEmail' type='checkbox' aria-label='"+Jx.escapeHtml(n("pasContentTypeEmail"))+"'>"+n("pasContentTypeEmail")+"<\/label><\/div><div class='pas-checkbox'><label><input id='pasContentTypeContacts' type='checkbox' aria-label='"+Jx.escapeHtml(n("pasContentTypeContacts"))+"'>"+n("pasContentTypeContacts")+"<\/label><\/div><div class='pas-checkbox'><label><input id='pasContentTypeCalendar' type='checkbox' aria-label='"+Jx.escapeHtml(n("pasContentTypeCalendar"))+"'>"+n("pasContentTypeCalendar")+"<\/label><\/div><\/div><div id='pasOrganizeYourMail' data-requiresMail='true' data-easOnly='true' class='pas-checkboxGroup'><label class='pas-tooltipCheck'>"+n("pasOrganizeYourMailLabel")+"<\/label><div class='pas-checkbox'><label><input id='pasNewsletterView' type='checkbox' aria-label='"+Jx.escapeHtml(n("pasNewsletterView"))+"'>"+n("pasNewsletterView")+"<\/label><\/div><div class='pas-checkbox'><label><input id='pasSocialUpdatesView' type='checkbox' aria-label='"+Jx.escapeHtml(n("pasSocialUpdatesView"))+"'>"+n("pasSocialUpdatesView")+"<\/label><\/div><\/div><div data-requiresMail='true' data-easOrImapOnly='true'><div id='pasEnableToastInstructions' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'>"+n("pasEnableToastsInstructions")+"<\/div><label id='pasEnableToastsLabel' class='pas-tooltipCheck'>"+n("pasEnableToastsLabel")+"<\/label><select id='pasEnableToast' aria-labelledby='pasEnableToastsLabel'><option value='"+t.ToastState.all+"'>"+n("pasEnableToastsAllEmailLabel")+"<\/option><option value='"+t.ToastState.favoritesOnly+"'>"+n("pasEnableToastsFavoritesOnlyLabel")+"<\/option><option value='"+t.ToastState.none+"'>"+n("pasEnableToastsNeverLabel")+"<\/option><\/select><\/div><div data-easOrImapOnly='true' data-requiresMail='true' class='pas-toggle'><div id='pasEnableExternalImages' data-win-control='WinJS.UI.ToggleSwitch' data-win-options='{title:&quot;"+Jx.escapeHtml(n("pasEnableExternalImagesLabel"))+"&quot;, labelOn:&quot;"+Jx.escapeHtml(n("pasOnLabel"))+"&quot;, labelOff:&quot;"+Jx.escapeHtml(n("pasOffLabel"))+"&quot; }'><\/div><\/div><div data-requiresMail='true' data-easOrImapOnly='true'><div id='pasEnableSignature' data-win-control='WinJS.UI.ToggleSwitch' data-win-options='{title:&quot;"+Jx.escapeHtml(n("pasUseSignatureLabel"))+"&quot;, labelOn:&quot;"+Jx.escapeHtml(n("pasYesLabel"))+"&quot;, labelOff:&quot;"+Jx.escapeHtml(n("pasNoLabel"))+"&quot; }'><\/div><div class='pas-textarea'><textarea id='pasSignature' rows='5' maxlength='8000' aria-label='"+Jx.escapeHtml(n("pasUseSignatureLabel"))+"' disabled><\/textarea><\/div><\/div><div data-requiresMail='true' data-easOofSupportedOnly='true'><div class='pas-toggle'><div id='pasEnableAutoreply' aria-label='"+Jx.escapeHtml(n("pasEnableAutoreplyAriaLabel"))+"' data-win-control='WinJS.UI.ToggleSwitch' data-win-options='{title:&quot;"+Jx.escapeHtml(n("pasEnableAutoreplyLabel"))+"&quot;, labelOn:&quot;"+Jx.escapeHtml(n("pasOnLabel"))+"&quot;, labelOff:&quot;"+Jx.escapeHtml(n("pasOffLabel"))+"&quot; }'><\/div><\/div><div id='pasAutoreplyDetails'><div class='pas-settingGroup'><label id='pasAutoreplyMessageTitle' class='pas-tooltipCheck"+(h?" hidden":"")+"'>"+n("pasAutoreplyForInternalExchangeLabel")+"<\/label><div class='pas-textarea'><textarea id='pasAutoreplyMessage' rows='5' maxlength='"+(h?"800":"64000")+"' aria-label='"+Jx.escapeHtml(n("pasAutoreplyMessageLabel"))+"' placeholder='"+Jx.escapeHtml(n("pasAutoreplyHintMessage"))+"'><\/textarea><\/div><\/div><div class='pas-settingGroup'><div class='pas-checkbox'><label><input id='pasAutoreplyForKnownCheck' type='checkbox' aria-label='"+Jx.escapeHtml(n(h?"pasEnableAutoreplyForKnownOnlyHotmailLabel":"pasEnableAutoreplyForExternalExchangeLabel"))+"'>"+n(h?"pasEnableAutoreplyForKnownOnlyHotmailLabel":"pasEnableAutoreplyForExternalExchangeLabel")+"<\/label><\/div><div class='pas-textarea'><textarea id='pasAutoreplyMessageExternal' rows='5' maxlength='64000' aria-label='"+Jx.escapeHtml(n("pasAutoreplyMessageLabel"))+"' placeholder='"+Jx.escapeHtml(n("pasAutoreplyHintMessage"))+"'><\/textarea><\/div><\/div><\/div><\/div><div id='pasCredentialStatus' data-easOrImapOnly='true' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'>"+n("pasBadCredentialsError")+"<\/div><label id='pasPreferredEmailLabel' data-easOrImapOnly='false' class='pas-tooltipCheck'>"+n("pasPreferredEmailLabel")+"<\/label><div data-easOrImapOnly='false'><select id='pasPreferredEmail' aria-labelledby='pasPreferredEmailLabel'><\/select><\/div><label id='pasPasswordLabel' data-easOrImapOnly='true' class='"+(e?"pas-tooltipCheck":"hidden")+"' >"+n("pasPasswordLabel")+"<\/label><div data-easOrImapOnly='true' class='"+(e?"":"hidden")+"'><input id='pasPassword' aria-labelledby='pasPasswordLabel' type='password' value='"+(o.hasPasswordCookie?"********":"")+"' maxlength='256'><\/div><label id='pasDomainLabel' data-easAdvancedOnly='true' class='pas-tooltipCheck'>"+n("pasDomainLabel")+"<\/label><div data-easAdvancedOnly='true'><input id='pasDomain' aria-labelledby='pasDomainLabel' type='text' value='"+Jx.escapeHtml(o.domain)+"' maxlength='256'><\/div><label id='pasUsernameLabel' data-easOrImapAdvancedOnly='true' class='"+(e?"pas-tooltipCheck":"hidden")+"'>"+n("pasUsernameLabel")+"<\/label><div data-easOrImapAdvancedOnly='true' class='"+(e?"":"hidden")+"'><input id='pasUsername' aria-labelledby='pasUsernameLabel' type='text' value='"+Jx.escapeHtml(o.userId)+"' maxlength='256'><\/div><div data-easOrImapAdvancedOnly='true' class='"+(s?"serverAndPortLeft":"")+"'><div class='singleLineText' ><label id='pasServerLabel' class='pas-tooltipCheck'>"+(s?n("pasImapServerLabel"):n("pasServerLabel"))+"<\/label><\/div><input id='pasServer' aria-labelledby='pasServerLabel' type='url' value='"+Jx.escapeHtml(o.server)+"' maxlength='256'><\/div><div data-imapAdvancedOnly='true' class='serverAndPortRight "+(s?"":"hidden")+"'><div class='singleLineText'><label id='pasImapPortLabel' class='pas-tooltipCheck'>"+n("pasPortLabel")+"<\/label><\/div><input id='pasImapPort' aria-labelledby='pasImapPortLabel' type='number' value='"+String(o.port)+"' maxlength='5'><\/div><div class='clear'><\/div><div data-easOrImapAdvancedOnly='true' class='pas-checkbox pas-settingGroup'><label><input id='pasUseSsl' type='checkbox' "+(a?"disabled":"")+" aria-label='"+Jx.escapeHtml(n("pasUseSslLabel"))+"' "+(o.useSsl?"checked":"")+">"+n("pasUseSslLabel")+"<\/label><\/div><div data-imapAdvancedOnly='true' class='serverAndPortLeft'><div class='singleLineText'><label id='pasSmtpServerLabel' class='pas-tooltipCheck'>"+n("pasSmtpServerLabel")+"<\/label><\/div><input id='pasSmtpServer' aria-labelledby='pasSmtpServerLabel' type='url' value='"+Jx.escapeHtml(f.server)+"' maxlength='256'><\/div><div data-imapAdvancedOnly='true' class='serverAndPortRight'><div class='singleLineText'><label id='pasSmtpPortLabel' class='pas-tooltipCheck'>"+n("pasPortLabel")+"<\/label><\/div><input id='pasSmtpPort' aria-labelledby='pasSmtpPortLabel' type='number' value='"+String(f.port)+"' maxlength='5'><\/div><div class='clear'><\/div><div class='pas-settingGroup'><div data-imapAdvancedOnly='true' class='pas-checkbox'><label><input id='pasSmtpUseSsl' type='checkbox' aria-label='"+Jx.escapeHtml(n("pasUseSslLabel"))+"' "+(f.useSsl?"checked":"")+">"+n("pasUseSslLabel")+"<\/label><\/div><div data-imapAdvancedOnly='true' class='pas-checkbox "+(e?"":"hidden")+"'><label><input id='pasSmtpRequiresAuth' type='checkbox' aria-label='"+Jx.escapeHtml(n("pasSmtpRequiresAuthLabel"))+"' "+(f.serverRequiresLogin?"checked":"")+">"+n("pasSmtpRequiresAuthLabel")+"<\/label><\/div><div class='pas-checkbox "+(!f.serverRequiresLogin||!e?"hidden":"")+"'><label><input id='pasSmtpReuseCreds' type='checkbox' aria-label='"+Jx.escapeHtml(n("pasSmtpReuseCredsLabel"))+"'"+(f.usesMailCredentials?"checked":"")+">"+n("pasSmtpReuseCredsLabel")+"<\/label><\/div><\/div><div id='pasSmtpUsernameAndPassword'"+(v?"":"class='hidden pas-settingGroup'")+"><label id='pasSmtpUsernameLabel' class='pas-tooltipCheck'>"+n("pasUsernameLabel")+"<\/label><input id='pasSmtpUsername' aria-labelledby='pasSmtpUsernameLabel' type='text' value='"+Jx.escapeHtml(f.userId)+"' maxlength='256'><label id='pasSmtpPasswordLabel' class='pas-tooltipCheck'>"+n("pasPasswordLabel")+"<\/label><input id='pasSmtpPassword' aria-labelledby='pasSmtpPasswordLabel' type='password' value='"+(f.hasPasswordCookie?"********":"")+"' maxlength='256'><\/div>"+Jx.getUI(this._certificateSettingsControl).html+Jx.getUI(this._specialFoldersControl).html+"<div id='removalUI' data-easOrImapOnly='true'><div id='pasRemovalNeededStatus' role='status' class='hidden pas-inlineAdvise pas-tooltipCheck'>"+n("pasRemovalNeeded_"+r.AccountControlBase.mapAppScenarioToAppName[this._scenario])+"<\/div><div class='hidden pas-inlineInfo pas-tooltipCheck' id='pasRemovalMessage' role='alert' aria-live='polite'><\/div><input id='pasRemoveBtn' class='singleLineText' type='button' value='"+Jx.escapeHtml(n("pasRemoveAccountButton"))+"'><input id='pasRoamedRemoveBtn' class='hidden singleLineText' type='button' value='"+Jx.escapeHtml(n("pasCloudButton"))+"'><input id='pasLocalRemoveBtn' class='hidden singleLineText' type='button' value='"+Jx.escapeHtml(n("pasPCButton"))+"'><\/div><div data-webOnly='true'><a id='pasManageAccountLink' tabIndex='0'>"+n("pasManageAccountLink")+"<\/a><\/div><\/div>"};i.prototype.activateUI=function(){var i,e,u,s,c,p,w,l;Jx.Component.prototype.activateUI.call(this);i=this._container=document.getElementById(this._id);WinJS.strictProcessing();WinJS.UI.processAll(i);e=this._account;u=this._inputs={accountName:i.querySelector("#pasAccountName"),userDisplayName:i.querySelector("#pasUserDisplayName"),password:i.querySelector("#pasPassword"),domain:i.querySelector("#pasDomain"),username:i.querySelector("#pasUsername"),server:i.querySelector("#pasServer"),smtpServer:i.querySelector("#pasSmtpServer"),port:i.querySelector("#pasImapPort"),smtpPort:i.querySelector("#pasSmtpPort"),smtpPassword:i.querySelector("#pasSmtpPassword"),smtpUsername:i.querySelector("#pasSmtpUsername"),signature:i.querySelector("#pasSignature"),autoreply:i.querySelector("#pasAutoreplyMessage"),autoreplyExternal:i.querySelector("#pasAutoreplyMessageExternal")};this._dropDowns={preferredEmail:i.querySelector("#pasPreferredEmail"),syncInterval:i.querySelector("#pasSyncInterval"),syncWindow:i.querySelector("#pasSyncWindow"),toast:i.querySelector("#pasEnableToast")};var o=this._checkBoxes={syncMail:i.querySelector("#pasContentTypeEmail"),syncContacts:i.querySelector("#pasContentTypeContacts"),syncCalendar:i.querySelector("#pasContentTypeCalendar"),enableNewsletterView:i.querySelector("#pasNewsletterView"),enableSocialUpdatesView:i.querySelector("#pasSocialUpdatesView"),ssl:i.querySelector("#pasUseSsl"),smtpSsl:i.querySelector("#pasSmtpUseSsl"),smtpRequiresAuth:i.querySelector("#pasSmtpRequiresAuth"),smtpReuseCreds:i.querySelector("#pasSmtpReuseCreds"),autoreplyForKnownCheck:i.querySelector("#pasAutoreplyForKnownCheck")},b=this._toggles={externalImages:i.querySelector("#pasEnableExternalImages").winControl,signature:i.querySelector("#pasEnableSignature").winControl,autoreply:i.querySelector("#pasEnableAutoreply").winControl},f=this._buttons={remove:i.querySelector("#pasRemoveBtn"),roamedRemove:i.querySelector("#pasRoamedRemoveBtn"),localRemove:i.querySelector("#pasLocalRemoveBtn")},y=this._links={manageAccount:i.querySelector("#pasManageAccountLink")};this._groups={autoreplyDetails:i.querySelector("#pasAutoreplyDetails")};this._showHideControls();this._account.getConfigureType(this._scenario)===t.ConfigureType.editOnClient&&(this._updateSyncIntervalSetting(),this._updatePreferredEmailSetting(),this._updateContentToSyncGroup(),this._updateCategoryViewsGroup(),this._updateMailSpecificControls(),s=this._getCurrentError(e),s===r.KnownAccountError.badCredentials?Jx.removeClass(i.querySelector("#pasCredentialStatus"),"hidden"):s===r.KnownAccountError.noCredentials?(c=i.querySelector("#pasCredentialStatus"),c.innerText=n("actdlgDescription-EasiID"),Jx.removeClass(c,"hidden")):s===r.KnownAccountError.syncFailed?Jx.removeClass(i.querySelector("#pasAccountStatus"),"hidden"):s===r.KnownAccountError.removalNeeded&&Jx.removeClass(i.querySelector("#pasRemovalNeededStatus"),"hidden"));this._onRemove=this._confirmRemove;f.remove.addEventListener("click",function(){this._onRemove()}.bind(this),true);f.roamedRemove.addEventListener("click",this._onAccountRemove.bind(this,t.Account.prototype.deleteObject),false);f.localRemove.addEventListener("click",this._onAccountRemove.bind(this,t.Account.prototype.deleteFromLocalDevice),false);y.manageAccount.addEventListener("click",this._onManage.bind(this),false);y.manageAccount.addEventListener("keydown",function(n){(n.key==="Spacebar"||n.key==="Enter")&&this._onManage()}.bind(this),false);o.smtpRequiresAuth.addEventListener("change",function(){Jx.setClass(o.smtpReuseCreds.parentElement,"hidden",!o.smtpRequiresAuth.checked)});o.smtpReuseCreds.addEventListener("change",function(){Jx.setClass(document.querySelector("#pasSmtpUsernameAndPassword"),"hidden",o.smtpReuseCreds.checked)});p=e.getResourceByType(t.ResourceType.mail);o.syncMail.addEventListener("change",function(){a(i,"[data-requiresMail='true']",!o.syncMail.checked);this._updateToastSetting(p);b.signature.checked||(u.signature.disabled="disabled")}.bind(this));u.password.addEventListener("change",function(){this._passwordDirty=true}.bind(this));u.smtpPassword.addEventListener("change",function(){this._smtpPasswordDirty=true}.bind(this));u.signature.addEventListener("change",function(){this._signatureDirty=true}.bind(this));u.accountName.addEventListener("change",function(){u.accountName.value=u.accountName.value||e.serviceName;this.getParent().updateHeaderText()}.bind(this),false);e.isDefault?(w=new v.OnlineIdAuthenticator,w.canSignOut?(f.remove.value=n("pasRemoveAllAccountsButton"),i.querySelector("#pasRemovalMessage").innerText=n("pasRemoveLocalIdConfirm")):(f.remove.disabled="disabled",l=i.querySelector("#pasRemovalMessage"),l.innerText=n("pasRemovalInstructions"),Jx.removeClass(l,"hidden"))):e.canDelete?t.HintState.primaryAccount===e.hintState?(f.remove.value=n("pasRemoveAllAccountsButton"),i.querySelector("#pasRemovalMessage").innerText=n("pasRemoveLocalIdConfirm")):i.querySelector("#pasRemovalMessage").innerText=n("pasRemoveSecondaryAccountConfirm"):f.remove.disabled="disabled";msSetImmediate(function(){var n,t,e;this.hasUI()&&(s!==r.KnownAccountError.removalNeeded?(n=Array.prototype.filter.call(i.querySelectorAll(".pas-inlineAdvise"),function(n){return n.offsetWidth!==0&&n.offsetHeight!==0}),n&&n[0]?(t=n[0],t.scrollIntoView(),e=t.getAttribute("data-associatedControl"),Jx.isNonEmptyString(e)&&(this._activeElement=i.querySelector("#"+e))):this._activeElement=u.accountName,this._delayFocusSetting||this._setActiveElement()):f.remove.scrollIntoView())}.bind(this));this._jobset.addUIJob(this,this._tooltipCheck,null,h.Priority.accessibility)};i.prototype.flyoutReady=function(){this._delayFocusSetting&&this._setActiveElement()};i.prototype._setActiveElement=function(){this._activeElement&&Jx.safeSetActive(this._activeElement)};i.prototype.shutdownUI=function(){Jx.isObject(this._account)&&this._applySettings();Jx.dispose(this._jobset);this._account=null;this._pointerDownListener&&(document.removeEventListener("MSPointerDown",this._pointerDownListener,true),this._pointerDownListener=null);Jx.Component.prototype.shutdownUI.call(this)};i.prototype._tooltipCheck=function(){var n=this._container.querySelectorAll(".pas-tooltipCheck");Array.prototype.forEach.call(n,function(n){n.style.overflow="visible";n.title=n.scrollWidth>n.clientWidth?n.innerText:"";n.style.overflow=""},this)};i.prototype._showHideControls=function(){var e=this._account.getConfigureType(this._scenario),r=this._container,n=[],u,i,f;switch(e){case t.ConfigureType.editOnClient:u=this._account.accountType===t.AccountType.imap;n.push("[data-webOnly=true]");i=this._account.getServerByType(t.ServerType.eas);i&&(!i||i.isOofSupported())&&this._scenario===t.ApplicationScenario.mail&&t.ScenarioState.unknown!==this._account.mailScenarioState||n.push("[data-easOofSupportedOnly=true]");f=i||this._account.getServerByType(t.ServerType.imap);f&&!f.supportsAdvancedProperties?n.push("[data-easAdvancedOnly=true]","[data-imapAdvancedOnly=true]","[data-easOrImapAdvancedOnly=true]"):u?n.push("[data-easAdvancedOnly=true]"):n.push("[data-imapAdvancedOnly=true]");u?n.push("[data-easOnly=true]"):n.push("[data-imapOnly=true]");l(r,n.join(","));break;case t.ConfigureType.editOnWeb:n.push("[data-imapOnly=true]","[data-easOnly=true]","[data-easAdvancedOnly=true]","[data-imapAdvancedOnly=true]","[data-easOrImapAdvancedOnly=true]","[data-easOrImapOnly=true]","[data-easOofSupportedOnly=true]");Jx.appData.localSettings().get("RetailExperience")&&n.push("[data-webOnly=true]");l(r,n.join(","));Jx.isNonEmptyString(this._account.emailAddress)||(Jx.addClass(this._dropDowns.preferredEmail,"hidden"),Jx.addClass(r.querySelector("#pasPreferredEmailLabel"),"hidden"))}};i.prototype._updateMailSpecificControls=function(){var n=this._account.getResourceByType(t.ResourceType.mail);n&&this._scenario===t.ApplicationScenario.mail&&t.ScenarioState.unknown!==this._account.mailScenarioState?(this._mailControlsHidden=false,this._toggles.externalImages.checked=n.allowExternalImages,this._dropDowns.syncWindow.value=n.syncWindowSize.toString(),this._updateSignatureSetting(n),this._updateToastSetting(n),n.isEnabled||a(this._container,"[data-requiresMail=true]",true),this._updateAutoreplySettings()):(this._mailControlsHidden=true,l(this._container,"[data-requiresMail=true]"))};i.prototype._updateToastSetting=function(n){var i,u,r;if(i=this._dropDowns,this._isPackageOnLockScreen())try{u=c.ToastNotificationManager;r=u.createToastNotifier();r.setting!==c.NotificationSetting.enabled&&(i.toast.disabled=true,(r.setting===c.NotificationSetting.disabledForUser||r.setting===c.NotificationSetting.disabledForApplication)&&Jx.removeClass(this._container.querySelector("#pasEnableToastInstructions"),"hidden"))}catch(f){i.toast.disabled=true;Jx.log.exception("PerAccountSettingsPage._updateToastSetting failed",f)}else i.toast.disabled=true,Jx.removeClass(this._container.querySelector("#pasEnableToastInstructions"),"hidden");i.toast.value=i.toast.disabled?t.ToastState.none:y(this._account,n)};i.prototype._updateSyncIntervalSetting=function(){var h=this._account,i=this._dropDowns,e=this._container.querySelector("#pasSyncIntevalStatus"),f,s;this._isPackageOnLockScreen()?(f=h.syncType,s=h.pollInterval,(f===t.SyncType.push||this._platform.accountManager.canSetSyncTypePush())&&o(i.syncInterval,n("pasSyncIntervalPush"),u.push,true),o(i.syncInterval,n("pasSyncIntervalPoll15"),u.poll15,f===t.SyncType.poll&&s===15),o(i.syncInterval,n("pasSyncIntervalPoll30"),u.poll30,f===t.SyncType.poll&&s===30),o(i.syncInterval,n("pasSyncIntervalPoll60"),u.poll60,f===t.SyncType.poll&&s===60),o(i.syncInterval,n("pasSyncIntervalManual"),u.manual,f===t.SyncType.manual),this._getCurrentError(h)===r.KnownAccountError.pushFailed&&(e.innerText=n("pasPushError"),Jx.removeClass(e,"hidden"))):(o(i.syncInterval,n("pasSyncIntervalManual"),u.manual,true),e.innerText=n("pasAddToLockScreenInfo"),Jx.removeClass(e,"hidden"))};i.prototype._updatePreferredEmailSetting=function(){for(var i=this._account,r=this._dropDowns.preferredEmail,u=i.sendAsAddresses,f=u.size,e=i.preferredSendAsAddress,t,n=0;n<f;n++)t=u[n],o(r,t,t,t===e);r.disabled=f<2};i.prototype._updateContentToSyncGroup=function(){var i=this._account,n=this._checkBoxes,u=i.getResourceByType(t.ResourceType.mail),f=i.getResourceByType(t.ResourceType.calendar),e=i.getResourceByType(t.ResourceType.contacts),r=0,o=t.HintState.primaryAccount===i.hintState,s=i.isDefault||o;u&&u.canEdit?n.syncMail.checked=u.isEnabled:(n.syncMail.parentElement.style.display="none",r++);f&&f.canEdit?n.syncCalendar.checked=f.isEnabled:(n.syncCalendar.parentElement.style.display="none",r++);e&&e.canEdit?n.syncContacts.checked=e.isEnabled:(n.syncContacts.parentElement.style.display="none",r++);(o||t.ScenarioState.unknown===i.mailScenarioState)&&(n.syncMail.parentElement.style.display="none",r++);s&&(n.syncCalendar.parentElement.style.display="none",n.syncContacts.parentElement.style.display="none",r+=2);r===3&&(this._container.querySelector("#pasContentToSync").style.display="none")};i.prototype._updateCategoryViewsGroup=function(){var n=this._account,i=this._platform,r=this._checkBoxes,u=p(i,n,t.MailViewType.newsletter,r.enableNewsletterView),f=p(i,n,t.MailViewType.social,r.enableSocialUpdatesView);u||f||(this._container.querySelector("#pasOrganizeYourMail").style.display="none")};i.prototype._updateAutoreplySettings=function(){var u=this._toggles,i=this._inputs,o=this._groups,r=this._checkBoxes,n=this._account.getServerByType(t.ServerType.eas),f,s,e;Jx.isObject(n)&&n.isOofSupported()?(f=n.oofState&&w(n.oofStartTime,n.oofEndTime),u.autoreply.checked=f,o.autoreplyDetails.style.display=f?"":"none",u.autoreply.addEventListener("change",function(){o.autoreplyDetails.style.display=u.autoreply.checked?"":"none"}),Jx.isNonEmptyString(n.oofBodyForInternal)&&(i.autoreply.value=n.oofBodyForInternal),s=n.isWlasSupported,s?(r.autoreplyForKnownCheck.checked=!n.oofEnabledForUnknownExternal,i.autoreplyExternal.style.display="none"):(e=n.oofEnabledForKnownExternal,r.autoreplyForKnownCheck.checked=e,i.autoreplyExternal.style.display=e?"":"none",r.autoreplyForKnownCheck.addEventListener("change",function(){i.autoreplyExternal.style.display=r.autoreplyForKnownCheck.checked?"":"none"}),Jx.isNonEmptyString(n.oofBodyForKnownExternal)&&(i.autoreplyExternal.value=n.oofBodyForKnownExternal))):this._container.querySelector("[data-easOofSupportedOnly=true]").style.display="none"};i.prototype._applyAutoreplySettings=function(){var f=this._toggles,r=this._inputs,u=this._checkBoxes,i=false,n=this._account.getServerByType(t.ServerType.eas),e,o;return n&&n.isOofSupported()&&(e=n.isWlasSupported,Jx.isNonEmptyString(r.autoreply.value)||(f.autoreply.checked=false),Jx.isNonEmptyString(r.autoreplyExternal.value)||e||(u.autoreplyForKnownCheck.checked=false),e?(n.oofState!==f.autoreply.checked&&(n.oofState=n.oofEnabledForInternal=n.oofEnabledForKnownExternal=f.autoreply.checked,i=true),n.oofBodyForInternal.replace(/\r/g,"")!==r.autoreply.value&&(n.oofBodyForInternal=n.oofBodyForKnownExternal=r.autoreply.value,i=true),n.oofEnabledForUnknownExternal===u.autoreplyForKnownCheck.checked&&(n.oofEnabledForUnknownExternal=!u.autoreplyForKnownCheck.checked,i=true),i&&(n.oofBodyForUnknownExternal=u.autoreplyForKnownCheck.checked?null:n.oofBodyForKnownExternal)):(o=n.oofState&&w(n.oofStartTime,n.oofEndTime),o!==f.autoreply.checked&&(n.oofState=n.oofEnabledForInternal=f.autoreply.checked,i=true),n.oofBodyForInternal.replace(/\r/g,"")!==r.autoreply.value&&(n.oofBodyForInternal=r.autoreply.value,i=true),n.oofEnabledForKnownExternal!==u.autoreplyForKnownCheck.checked&&(n.oofEnabledForKnownExternal=n.oofEnabledForUnknownExternal=u.autoreplyForKnownCheck.checked,i=true),n.oofBodyForKnownExternal.replace(/\r/g,"")!==r.autoreplyExternal.value&&(n.oofBodyForKnownExternal=n.oofBodyForUnknownExternal=r.autoreplyExternal.value,i=true)),i&&(n.oofStartTime=n.oofEndTime=null)),i};i.prototype._updateSignatureSetting=function(n){var i,r,u;i=this._toggles;r=this._inputs;r.signature.value=n.signatureText;n.signatureType!==t.SignatureType.disabled?(i.signature.checked=true,r.signature.disabled=""):i.signature.checked=false;i.signature.addEventListener("change",function(){r.signature.disabled=i.signature.checked?"":"disable"});u=function(){i.signature.checked&&!Jx.isNonEmptyString(r.signature.value)&&(i.signature.checked=false)};r.signature.addEventListener("input",u);u()};i.prototype._applySettings=function(){var n=false,f=this._account,ut=this._account.getConfigureType(this._scenario),d,c,o,it,g,nt,tt,w;if(ut===t.ConfigureType.editOnClient){var i=this._inputs,e=this._checkBoxes,l=this._dropDowns,a=this._toggles,ft=document.activeElement;for(d in i)i[d]===ft&&i[d].blur();c=f.getServerByType(t.ServerType.eas)||f.getServerByType(t.ServerType.imap);o=f.getServerByType(t.ServerType.smtp);this._specialFoldersControl.applyChanges();n=this._certificateSettingsControl.applyChanges();it=f.displayName;it!==i.accountName.value.trim()&&(n=true,f.displayName=i.accountName.value);f.userDisplayName!==i.userDisplayName.value.trim()&&(n=true,f.userDisplayName=i.userDisplayName.value);c.domain!==i.domain.value&&(n=true,c.domain=i.domain.value.trim());c.userId!==i.username.value&&(n=true,c.userId=i.username.value.trim());c.server!==i.server.value&&(n=true,c.server=i.server.value.trim());c.port!==parseInt(i.port.value,10)&&b(i.port.value)&&(n=true,c.port=parseInt(i.port.value,10));c.useSsl!==e.ssl.checked&&(n=true,c.useSsl=e.ssl.checked);o&&(e.smtpReuseCreds.checked?o.usesMailCredentials||(n=true,o.usesMailCredentials=true):o.userId!==i.smtpUsername.value&&(n=true,o.userId=i.smtpUsername.value.trim()),o.server!==i.smtpServer.value&&(n=true,o.server=i.smtpServer.value.trim()),o.port!==parseInt(i.smtpPort.value,10)&&b(i.port.value)&&(n=true,o.port=parseInt(i.smtpPort.value,10)),o.useSsl!==e.smtpSsl.checked&&(n=true,o.useSsl=e.smtpSsl.checked),o.serverRequiresLogin!==e.smtpRequiresAuth.checked&&(n=true,o.serverRequiresLogin=e.smtpRequiresAuth.checked));var h=f.getResourceByType(t.ResourceType.mail),v=f.getResourceByType(t.ResourceType.calendar),p=f.getResourceByType(t.ResourceType.contacts);if(h&&h.canEdit&&(h.isEnabled!==e.syncMail.checked&&(n=true,h.isEnabled=e.syncMail.checked),this._mailControlsHidden||(g=parseInt(l.syncWindow.value,10),h.syncWindowSize!==g&&(n=true,h.syncWindowSize=g),l.toast.disabled||(nt=parseInt(l.toast.value,10),y(f,h)!==nt&&(n=true,h.toastState=nt)),tt=a.externalImages.checked,h.allowExternalImages!==tt&&(n=true,h.allowExternalImages=tt),this._signatureDirty&&i.signature.value!==h.signatureText&&(n=true,h.signatureText=i.signature.value),Jx.isNonEmptyString(i.signature.value)||(a.signature.checked=false),!a.signature.checked&&(h.signatureType!==t.SignatureType.disabled||this._signatureDirty)?(n=true,h.signatureType=t.SignatureType.disabled):a.signature.checked&&(h.signatureType!==t.SignatureType.enabled||this._signatureDirty)&&(n=true,h.signatureType=t.SignatureType.enabled),this._applyAutoreplySettings()&&(n=true))),v&&v.canEdit&&v.isEnabled!==e.syncCalendar.checked&&(n=true,v.isEnabled=e.syncCalendar.checked),p&&p.canEdit&&p.isEnabled!==e.syncContacts.checked&&(n=true,p.isEnabled=e.syncContacts.checked),l.syncInterval.options.length!==1){w=parseInt(l.syncInterval.value,10);switch(w){case u.push:f.syncType!==t.SyncType.push&&(n=true,f.syncType=t.SyncType.push);break;case u.manual:f.syncType!==t.SyncType.manual&&(n=true,f.syncType=t.SyncType.manual);break;case u.poll15:case u.poll30:case u.poll60:(f.syncType!==t.SyncType.poll||f.pollInterval!==w)&&(n=true,f.syncType=t.SyncType.poll,f.pollInterval=w)}}f.preferredSendAsAddress!==l.preferredEmail.value&&(n=true,f.preferredSendAsAddress=l.preferredEmail.value);var et=this._passwordDirty?i.password.value:"",ot=!e.smtpReuseCreds.checked&&this._smtpPasswordDirty?i.smtpPassword.value:"",rt=function(){if(n){var i=f.getResourceByType(t.ResourceType.mail);i&&(i.isSyncNeeded=true);this._safeCommit(f)}}.bind(this);WinJS.Promise.join([k(et),k(ot)]).then(function(t){if(t[0]&&(c.setPasswordCookie(s.CryptographicBuffer.encodeToBase64String(t[0])),n=true),o&&(t[1]&&!e.smtpReuseCreds.checked||t[0]&&e.smtpReuseCreds.checked)){var i=e.smtpReuseCreds.checked?t[0]:t[1];o.setPasswordCookie(s.CryptographicBuffer.encodeToBase64String(i));n=true}}.bind(this)).then(function(){var n=this._certificateSettingsControl.selectedCertificate;return Jx.isObject(c.certificateThumbPrint)&&Jx.isObject(n)?r.CertificateUtils.invokeCertificatePromptIfNeededAsync(n):WinJS.Promise.wrap(null)}.bind(this)).done(function(t){t===r.CertPromptResult.accessGranted&&(n=true);rt()},rt)}else n&&(f.isSyncNeeded=true,this._safeCommit(f))};i.prototype._safeCommit=function(n){try{n.commit()}catch(t){Jx.log.exception("PerAccountSettingsPage failed on commit().",t)}};i.prototype._onManage=function(){this._manageAccountOnline(this._account)};i.prototype._onAccountRemove=function(n){this._account.canDelete&&(n.call(this._account),this._account=null,this.getParent().navigateToPage(r.AccountSettingsPage.connectedAccounts))};i.prototype._onPrimarySignout=function(){if(this._account.canDelete){var n=this._platform,t=n.accountManager.defaultAccount;this._account.deleteObject();this._forcePlatformConnectedIdCheckAsync(n,t);this._buttons.remove.disabled="disabled"}};i.prototype._onSignout=function(){var t=new v.OnlineIdAuthenticator,i,n;t.canSignOut&&(i=this._account,n=this._platform,t.signOutUserAsync().done(function(){var t=n.createVerb("ConnectedIdChange","");n.runResourceVerbAsync(i,"backgroundTasks",t)}))};i.prototype._resetRemovalUI=function(){var n=this._buttons,t=this._container.querySelector("#pasRemovalMessage");Jx.addClass(t,"hidden");Jx.addClass(n.roamedRemove,"hidden");Jx.addClass(n.localRemove,"hidden");Jx.removeClass(n.remove,"hidden");this._onRemove=this._confirmRemove;this._pointerDownListener&&(document.removeEventListener("MSPointerDown",this._pointerDownListener,true),this._pointerDownListener=null)};i.prototype._confirmRemove=function(){var n=this._buttons,r=this._container,i=r.querySelector("#pasRemovalMessage"),u=r.querySelector("#removalUI"),f=this._account.isDefault||t.HintState.primaryAccount===this._account.hintState;Jx.removeClass(i,"hidden");i.innerText=i.innerText;this._jobset.addUIJob(this,this._tooltipCheck,null,h.Priority.accessibility);f?(this._onRemove=this._account.isDefault?this._onSignout:this._onPrimarySignout,n.remove.scrollIntoView()):(this._hasDefaultAccount()&&Jx.removeClass(n.roamedRemove,"hidden"),Jx.removeClass(n.localRemove,"hidden"),Jx.addClass(n.remove,"hidden"),n.roamedRemove.focus(),n.localRemove.scrollIntoView());this._pointerDownListener=function(n){d(n.target,u)&&this._resetRemovalUI()}.bind(this);document.addEventListener("MSPointerDown",this._pointerDownListener,true)};f={};f[t.MailFolderType.sentItems]=Jx.res.getString("mailFolderNameSentItems");f[t.MailFolderType.deletedItems]=Jx.res.getString("mailFolderNameDeletedItems");f[t.MailFolderType.junkMail]=Jx.res.getString("mailFolderNameJunkMail");f[t.MailFolderType.drafts]=Jx.res.getString("mailFolderNameDrafts");f[t.MailFolderType.outbox]=Jx.res.getString("mailFolderNameOutbox");f[t.MailFolderType.inbox]=Jx.res.getString("mailFolderNameInbox");e=function(n,i){if(this.initComponent(),this._platform=n,this._account=i,i.accountType===t.AccountType.imap){var r=i.getServerByType(t.ServerType.imap),u=r.deletedItemsFolderXlist&&r.sentItemsFolderXlist&&r.junkFolderXlist;u&&(this.getUI=null)}else this.getUI=null};Jx.augment(e,Jx.Component);e.prototype.getUI=function(i){var r=this._account.getServerByType(t.ServerType.imap),u;this._id="idSpecialFoldersSettings"+Jx.uid();u=function(t){var i="pas"+t+"Label";return"<div id='"+i+"' role='sectionhead' class='"+r.sentItemsFolderXlist+" pas-tooltipCheck' >"+n(i)+"<\/div><select id='pas"+t+"' aria-labelledby='"+i+"'><\/select>"};i.html="<div id='"+this._id+"'><div id='pasSpecialFoldersLabel' role='sectionhead' class='pas-inlineInfo pas-tooltipCheck'>"+n("pasSpecialFoldersLabel")+"<\/div>"+(r.sentItemsFolderXlist?"":u("SentItems"))+(r.deletedItemsFolderXlist?"":u("DeletedItems"))+(r.junkFolderXlist?"":u("JunkEmail"))+"<\/div>"};e.prototype.activateUI=function(){var i;Jx.Component.prototype.activateUI.call(this);var n=document.getElementById(this._id),r=this._account,u=this._platform.folderManager;this._folders={sentItems:{dropDown:n.querySelector("#pasSentItems"),type:t.MailFolderType.sentItems},deletedItems:{dropDown:n.querySelector("#pasDeletedItems"),type:t.MailFolderType.deletedItems},junkEmail:{dropDown:n.querySelector("#pasJunkEmail"),type:t.MailFolderType.junkMail}};i=this._generateFolderOptions();Jx.isNonEmptyString(i)&&this._forEachFolder(function(n){n.dropDown&&(n.dropDown.innerHTML=i,n.dropDown.value=u.getImapSpecialFolderId(r,n.type))},this)};e.prototype.applyChanges=function(){if(this.hasUI()){var n=this._account,t=this._platform.folderManager;this._forEachFolder(function(i){i.dropDown&&i.dropDown.value!==t.getImapSpecialFolderId(n,i.type)&&t.setImapSpecialFolderPath(n,i.type,i.dropDown.value)},this)}};e.prototype._forEachFolder=function(n){var t=this._folders,i;for(i in t)n.call(this,t[i])};e.prototype._generateFolderOptions=function(){for(var n=[],e=function(n,t){return"<option value='"+t+"'>"+n+"<\/option>"},o=function(n,t){var i=[],s=n.folderName||f[n.specialMailFolderType],u=n.getChildFolderCollection(false),r,h,c;if(n.selectionDisabled||i.push(e(t+s,n.objectId)),u.count>0)for(r=0,h=u.count;r<h;r++)c=u.item(r),i=i.concat(o(c,t+s+"\\"));return i},r=this._platform.folderManager.getRootFolderCollection(this._account,t.FolderType.mail),u,i=0,s=r.count;i<s;i++)u=r.item(i),u.isLocalMailFolder||(n=n.concat(o(u,"")));return r.dispose(),n.push(e("","")),n.join("")}})