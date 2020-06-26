﻿Share.DataLoader=function(n){this._formatOrder=n};Share.DataLoader.prototype._dataPackage=null;Share.DataLoader.prototype._shareData=null;Share.DataLoader.prototype._started=false;Share.DataLoader.prototype._canceled=false;Share.DataLoader.prototype._completed=false;Share.DataLoader.prototype._error=null;Share.DataLoader.prototype._currentLoadPromise=null;Share.DataLoader.prototype._successCallback=null;Share.DataLoader.prototype._errorCallback=null;Share.DataLoader.prototype.loadDataAsync=function(n,t){if(this._started)throw new Error("Usage error: each instance of DataLoader can only load data once.");this._started=true;this._dataPackage=n;this._shareData=t;try{this.beginLoading()}catch(r){this.callError(r)}var i=this;return new WinJS.Promise(function(n,t){i._successCallback=n;i._errorCallback=t;i._completed&&i._successCallback();i._error&&i._errorCallback(i._error)},function(){i._canceled=true;i._currentLoadPromise&&(i._currentLoadPromise.cancel(),i._currentLoadPromise=null)})};Share.DataLoader.prototype.callCompleted=function(){this._canceled||(this._completed=true,this._successCallback&&this._successCallback())};Share.DataLoader.prototype.callError=function(n){this._canceled||(this._error=n,this._errorCallback&&this._errorCallback(n))};Share.DataLoader.prototype.beginLoading=function(){this._loadDataInOrder(0)};Share.DataLoader.prototype._loadDataInOrder=function(n){var u,i,r,t;this._canceled||(u=this._formatOrder,i=n+1,r=false,n<u.length&&(t=u[n],Jx.log.verbose("Share.DataLoader looking for format: "+t),this._dataPackage.contains(t)&&(Jx.log.verbose("Share.DataLoader found format "+t+", loading format."),t===Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink?(r=true,this._currentLoadPromise=this._dataPackage.getWebLinkAsync(),this._currentLoadPromise.then(this._getUriCallback(i),this._getFailureCallback(t,i))):t===Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems?(r=true,this._currentLoadPromise=this._dataPackage.getStorageItemsAsync(),this._currentLoadPromise.then(this._getStorageItemsCallback(i),this._getFailureCallback(t,i))):t===Windows.ApplicationModel.DataTransfer.StandardDataFormats.html?(r=true,this._currentLoadPromise=this._dataPackage.getHtmlFormatAsync(),this._currentLoadPromise.then(this._getHtmlCallback(i),this._getFailureCallback(t,i))):t===Windows.ApplicationModel.DataTransfer.StandardDataFormats.text?(r=true,this._currentLoadPromise=this._dataPackage.getTextAsync(),this._currentLoadPromise.then(this._getTextCallback(i),this._getFailureCallback(t,i))):Jx.fault("ShareAnything.ShareDataLoader.js","UnrecognizedConfigFormat"))),r||(i<u.length?(Jx.log.verbose("Share.DataLoader calling loadDataInOrder with next index because there was no promise"),this._loadDataInOrder(i)):(Jx.log.info("Share.DataLoader was not able to find any data to use in the data package."),this._shareData.recordError(null,Share.Constants.DataError.invalidFormat),this.callCompleted())))};Share.DataLoader.prototype._getFailureCallback=function(n,t){var i=this;return function(r){try{Jx.log.exception("Share.DataLoader: Error loading from dataPackage for type: "+n,r);i._currentLoadPromise=null;i._canceled||(Jx.log.verbose("Share.DataLoader: Data load callback failure.  Trying next format."),i._loadDataInOrder(t))}catch(u){i.callError(u)}}};Share.DataLoader.prototype._getStorageItemsCallback=function(n){var t=this;return function(i){try{t._currentLoadPromise=null;var r=t._shareData.tryInitializeWithFiles(i);r?(Jx.log.info("Share.DataLoader successfully added storageItems information to data object"),t.callCompleted()):(Jx.log.verbose("Share.DataLoader failed to validate storageItems format, trying next format"),t._loadDataInOrder(n))}catch(u){t.callError(u)}}};Share.DataLoader.prototype._getUriCallback=function(n){var t=this;return function(i){try{t._currentLoadPromise=null;var u=new Share.LinkData,r=u.tryInitialize(i,t._dataPackage);r&&(r=t._shareData.tryInitializeWithLink(u));r?(Jx.log.info("Share.DataLoader successfully added URI data to data object"),t.callCompleted()):(Jx.log.info("Share.DataLoader failed to validate URI format, trying next format"),t._loadDataInOrder(n))}catch(f){t.callError(f)}}};Share.DataLoader.prototype._getHtmlCallback=function(n){var t=this;return function(i){try{t._currentLoadPromise=null;var r=t._shareData.tryInitializeWithHtml(i);r?(Jx.log.info("Share.DataLoader successfully added html information to data object"),t.callCompleted()):(Jx.log.verbose("Share.DataLoader failed to validate html format, trying next format"),t._loadDataInOrder(n))}catch(u){t.callError(u)}}};Share.DataLoader.prototype._getTextCallback=function(n){var t=this;return function(i){try{t._currentLoadPromise=null;var r=t._shareData.tryInitializeWithText(i);r?(Jx.log.info("Share.DataLoader successfully added Text data to data object"),t.callCompleted()):(Jx.log.info("Share.DataLoader failed to validate text format, trying next format"),t._loadDataInOrder(n))}catch(u){t.callError(u)}}}