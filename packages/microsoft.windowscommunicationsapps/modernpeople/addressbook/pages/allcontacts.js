﻿Jx.delayDefine(People,"AllContactsPage",function(){var n=window.People;n.AllContactsPage=function(t,i){this._alphabetIndex=0;this._semanticZoomActivated=true;this._queryText="";this._queryLanguage="";this._host=t;n.ViewportPage.call(this,t,i)};Jx.inherit(n.AllContactsPage,n.ViewportPage);n.AllContactsPage.prototype._createViewportChild=function(t,i){return t&&i?this._setQuery(t,i):i&&Jx.isValidNumber(i.alphabetIndex)&&(this._alphabetIndex=i.alphabetIndex),new n.Stitcher};n.AllContactsPage.prototype.prepareSaveBackState=function(){this._allContactsSection&&this._allContactsSection.onPrepareSaveBackState()};n.AllContactsPage.prototype._updateQuery=function(n,t){var i=false;this._queryText!==n&&(this._queryText=n,i=true);this._queryLanguage!==t&&(this._queryLanguage=t,this._queryText!==""&&(i=true));i&&this._host.reloadAllContactsPage()};n.AllContactsPage.prototype._setQuery=function(n,t){this._queryText=n;this._queryLanguage=t};n.AllContactsPage.prototype._initViewportChild=function(t,i){var r=this._host.getPlatformCache(),f=r.getPlatform(),u;i===n.Orientation.horizontal&&(u=new n.Accounts.UpsellSettings(Jx.appData.roamingSettings().container("People")),u.shouldShow()&&t.addChild(new n.UpsellSection(f,u)));Jx.isNonEmptyString(this._queryText)?(this._semanticZoomActivated=false,t.addChild(new n.SearchResultsSection(r._platform,this._queryText,this._queryLanguage,this._host.getHeader(),false))):(this._semanticZoomActivated=true,this._host.getHeader().clearSecondaryTitle(),this._allContactsSection=new n.AllContactsSection(r,this._host.getRootElem(),this._host.getCommandBar(),this._alphabetIndex),t.addChild(this._allContactsSection))}})