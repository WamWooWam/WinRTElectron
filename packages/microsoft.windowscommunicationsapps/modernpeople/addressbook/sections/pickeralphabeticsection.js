﻿Jx.delayDefine(People,"PickerAlphabeticSection",function(){var n=window.People,t=Windows.ApplicationModel.Contacts,i=Microsoft.WindowsLive.Platform,r=i.PeoplePickerFilter,f=n.PeopleProvider.CustomDesiredFields,u;n.PickerAlphabeticSection=function(i,r,u,e,o,s){n.ContactGridSection.call(this,"pickerAlphabeticSection",null,i.peopleManager);this._platform=i;this._personClickedHandler=r;this._selectionManager=u;this._desiredFields=this._resolveDesiredFields(e);this._selectionMode=e.selectionMode;this._totalCounter=null;this._showFavorites=!this._isDesiredFieldSet(f.link);this._filterToggle=s;this._filterOnline=s?Jx.appData.localSettings().container("People").get("ppFilterOnline"):false;this._keyboardListenerElement=o;this._keyboardJump=null;this._pickerFilter=null;this._mapKnownFieldToSecondaryContentType=[{knownField:t.KnownContactField.email,contactType:n.PeopleProvider.SupportedPropertyType.email},{knownField:t.KnownContactField.phoneNumber,contactType:n.PeopleProvider.SupportedPropertyType.phone},{knownField:t.KnownContactField.location,contactType:n.PeopleProvider.SupportedPropertyType.location}].reduce(function(n,t){return n[t.knownField]=t.contactType,n},{})};Jx.inherit(n.PickerAlphabeticSection,n.ContactGridSection);u=n.ContactGridSection.prototype;n.PickerAlphabeticSection.prototype._resolveDesiredFields=function(n){var i,t;for(Jx.mark("People.PickerAlphabeticSection._resolveDesiredFields,StartTA,People,PickerAlphabeticSection"),i=[],t=0;t<n.desiredFields.length;t++)i.push(n.desiredFields[t]);for(t=0;t<n.desiredFieldsWithContactFieldType.length;t++)n.desiredFieldsWithContactFieldType[t]==Windows.ApplicationModel.Contacts.ContactFieldType.custom&&i.push(f.link);return Jx.mark("People.PickerAlphabeticSection._resolveDesiredFields,StopTA,People,PickerAlphabeticSection"),i};n.PickerAlphabeticSection.prototype.activateUI=function(){u.activateUI.apply(this,arguments);var n=this._filterToggle;this._filterToggle&&(n.selectTab(this._filterOnline?"Online":"All"),n.addListener("selectionChanged",this._toggleOnlineFilter,this),n.show())};n.PickerAlphabeticSection.prototype.deactivateUI=function(){this._filterToggle&&this._filterToggle.removeListener("selectionChanged",this._toggleOnlineFilter,this);u.deactivateUI.apply(this,arguments)};n.PickerAlphabeticSection.prototype.extentReady=function(){this._totalCounter=new n.TotalCounter(this._collection,this);Jx.setClass(this._sectionElement,"zeroContacts",this._totalCounter.count===0);this._keyboardJump=new n.HeaderKeyboardJump(this._keyboardListenerElement,this._grid,this._collection);u.extentReady.apply(this,arguments)};n.PickerAlphabeticSection.prototype.hide=function(){var e=this._placeholder,r=e.firstElementChild,u=r.nextElementSibling,o=this._filterToggle,i,f;this._collection.length!==0&&this._filterOnline?(r.innerText=Jx.res.getString("/strings/abOnlineFilterEmptyTitle"),u.style.display="",u.addEventListener("click",function s(){u.removeEventListener("click",s,false);o.selectTab("All")},false)):(this._desiredFields[0]===n.PeopleProvider.CustomDesiredFields.chat?r.innerText=Jx.res.getString("/strings/ppNoContactsChat"):(i={},i[t.KnownContactField.email]="/strings/ppNoContactsEmail",i[t.KnownContactField.phoneNumber]="/strings/ppNoContactsPhone",i[t.KnownContactField.location]="/strings/ppNoContactsLocation",f=i[this._desiredFields[0]],Jx.isNonEmptyString(f)||(f="/strings/ppNoContacts"),r.innerText=Jx.res.getString(f)),u.style.display="none");e.style.display=""};n.PickerAlphabeticSection.prototype._getPlaceholderUI=function(){return"<div class='pp-noContacts' style='display:none'><div><\/div><button id='btnClearFilter'>"+Jx.res.getString("/strings/abOnlineFilterEmptyMessage")+"<\/button><\/div>"};n.PickerAlphabeticSection.prototype.totalCountChanged=function(n){Jx.setClass(this._sectionElement,"zeroContacts",n===0);n>0&&this._placeholder.style.display===""&&(this._filterToggle&&this._filterToggle.show(),this._placeholder.style.display="none")};n.PickerAlphabeticSection.prototype.shutdownComponent=function(){Jx.dispose(this._collection);Jx.dispose(this._totalCounter);Jx.dispose(this._keyboardJump);u.shutdownComponent.call(this)};n.PickerAlphabeticSection.prototype._toggleOnlineFilter=function(t){var r=t==="Online",s,h,c;if(r!==this._filterOnline){var e=this._pickerFilter,u=this._collection,f=this._platform.peopleManager,o=this.getJobSet();this._showFavorites&&u.length>0&&(s=u.getItem(0),h=s.collection,h.replace(new n.Callback(f.getPeopleByPickerQuery,f,[e,i.FavoritesFilter.favorites,r,"",true,"",false]),o));c=this._grid;n.AddressBookCollections.replaceAlphabeticCollection(f,u,function(t,u,f){return new n.Callback(t.getPeopleByPickerQuery,t,[e,i.FavoritesFilter.all,r,u,true,f,false])},o).done(function(){c.resetAnimationTimeout()});Jx.appData.localSettings().container("People").set("ppFilterOnline",r);this._filterOnline=r}};n.PickerAlphabeticSection.prototype._getCollection=function(){var u=this._collection=new n.ArrayCollection("picker"),e=this._pickerFilter=this._desiredFields.reduce(function(n,i){switch(i){case f.chat:n|=r.canChat;break;case t.KnownContactField.email:n|=r.hasEmail;break;case t.KnownContactField.location:n|=r.hasLocation;break;case t.KnownContactField.phoneNumber:n|=r.hasPhone;break;case f.link:n|=r.none;break;default:Jx.log.info("PeopleProvider: Ignoring unknown custom field: "+i)}return n},null),s,o;return(e!==null||this._desiredFields.length===0)&&(e=e||i.PeoplePickerFilter.none,s=this._filterOnline,o=this._platform.peopleManager,this._showFavorites&&u.appendItem({header:{type:"favoritesGrouping",data:null},collection:new n.QueryCollection("person",new n.Callback(o.getPeopleByPickerQuery,o,[e,i.FavoritesFilter.favorites,s,"",true,"",false]),"favorites")}),n.AddressBookCollections.appendAlphabeticCollection(o,u,function(t,r,u){return new n.Callback(t.getPeopleByPickerQuery,t,[e,i.FavoritesFilter.all,s,r,true,u,false])})),u.loadComplete(),u.hydrate(null),u};n.PickerAlphabeticSection.prototype._getFactories=function(){var i={className:"ic-listItem",tilePriority:n.Priority.userTileRender,secondaryContent:null},e={selectionManager:this._selectionManager,onClick:this._personClickedHandler,onRightClick:this._personClickedHandler},f=n.IdentityElements.BillboardLayout,r,u;return this._isDesiredFieldSet(n.PeopleProvider.CustomDesiredFields.chat)||(i.statusIndicator=null),r=this._getFirstNonCustomDesiredField(),r===t.KnownContactField.email?(i.secondaryContent={element:n.PickerIdentityElements.DisambiguatedProperty,types:this._getSupportedTypes()},i.secondaryHitTarget=n.PickerIdentityElements.EmailDisambiguator):r===t.KnownContactField.location?(i.secondaryContent={element:n.PickerIdentityElements.DisambiguatedProperty,types:this._getSupportedTypes()},i.secondaryHitTarget=n.PickerIdentityElements.LocationDisambiguator):r===t.KnownContactField.phoneNumber&&(i.secondaryContent={element:n.PickerIdentityElements.DisambiguatedProperty,types:this._getSupportedTypes()},i.secondaryHitTarget=n.PickerIdentityElements.PhoneNumberDisambiguator),this._isDesiredFieldSet(n.PeopleProvider.CustomDesiredFields.link)&&(i.secondaryContent=n.IdentityElements.Networks,i.secondaryHitTarget=null),this._selectionMode!==t.ContactSelectionMode.fields||Jx.isNullOrUndefined(i.secondaryHitTarget)||this._desiredFields.length!==1?i.className+=" pp-hoverListItem":(f=People.IdentityElements.PickerLayout,Jx.addClass(this._contentElement,"pp-hasDisambiguators")),u=new n.IdentityControlNodeFactory(f,i,e),{person:new n.Callback(u.create,u),favoritesGrouping:new n.Callback(function(){return new n.FavoritesHeader}),nameGrouping:new n.Callback(function(){return new n.AlphabeticHeader}),otherGrouping:new n.Callback(function(){return new n.OtherHeader})}};n.PickerAlphabeticSection.prototype._getSupportedTypes=function(){for(var i=[],r=this._desiredFields,t,n=0;n<r.length;n++)t=this._mapKnownFieldToSecondaryContentType[r[n]],t&&i.push(t);return i};n.PickerAlphabeticSection.prototype._isDesiredFieldSet=function(n){return this._desiredFields.indexOf(n)>=0};n.PickerAlphabeticSection.prototype._getFirstNonCustomDesiredField=function(){for(var t=this._desiredFields,i=t.length,n=0;n<i;n++)if(this._isNonCustomDesiredField(t[n]))return t[n];return null};n.PickerAlphabeticSection.prototype._isNonCustomDesiredField=function(n){return n===t.KnownContactField.email||n===t.KnownContactField.phoneNumber||n===t.KnownContactField.location};n.PickerAlphabeticSection.prototype._platform=null;n.PickerAlphabeticSection.prototype.appendSemanticZoomCollection=function(t){for(var r=new n.ArrayCollection("AllSection"),u,i=0;i<this._collection.length;i++)u=this._collection.getItem(i),r.appendItem({type:u.header.type==="favoritesGrouping"?"zoomedOutFavoritesHeader":"zoomedOutAlphabeticHeader",data:u,collection:null});r.loadComplete();t.appendItem({collection:r})}})