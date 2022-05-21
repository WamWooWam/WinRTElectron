
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../shared/Jx/Core/Jx.dep.js" />
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js"/>
/// <reference path="../JSUtil/Include.js"/>
/// <reference path="../JSUtil/Namespace.js"/>
/// <reference path="../../AddressBook/Controls/Scheduler/JobSet.js"/>
/// <reference path="FetchContacts.js"/>

Jx.delayDefine(People, "PlatformCache", function () {
  
       var P = People;

       /// <disable>JS2076.IdentifierIsMiscased</disable> 
       var PlatformCache = P.PlatformCache = /*@constructor*/function (platform, jobSet) {
           /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
           /// <param name="jobSet" type="P.JobSet"/>
           Debug.assert(Jx.isObject(platform), "invalid argument - platform");
           Debug.assert(Jx.isObject(jobSet), "invalid argument - jobSet");

           this._platform = platform;
           this._defaultAccount = /*@static_cast(Microsoft.WindowsLive.Platform.Account)*/null;
           this._defaultMeContact = /*@static_cast(Microsoft.WindowsLive.Platform.Me)*/null;
           jobSet = this._jobSet = jobSet.createChild();
           this._fetch = /*@static_cast(P.FetchContacts)*/null;

           this._collections = {};

           jobSet.addUIJob(this, this._fetchContacts, [jobSet], P.Priority.fetchContacts);
       };
       /// <enable>JS2076.IdentifierIsMiscased</enable> 

       PlatformCache.prototype.getPlatform = function () {
           /// <returns type="Microsoft.WindowsLive.Platform.Client"/>
           return this._platform;
       };
       
       PlatformCache.prototype.getDefaultAccount = function () {
           /// <returns type="Microsoft.WindowsLive.Platform.Account"/>
           var account = this._defaultAccount;
           if (!account) {
               Jx.log.warning("Loading default account");
               account = this._defaultAccount = /*@static_cast(Microsoft.WindowsLive.Platform.Account)*/this._platform.accountManager.defaultAccount;
               Debug.assert(Jx.isObject(account), "Default account unavailable");
           }
           return account;
       };

       PlatformCache.prototype.getDefaultMeContact = function () {
           /// <returns type="Microsoft.WindowsLive.Platform.Me"/>
           var me = this._defaultMeContact;
           if (!me) {
               var account = this.getDefaultAccount();
               if (account) {
                   Jx.log.warning("Loading me contact");
                   me = this._defaultMeContact = /*@static_cast(Microsoft.WindowsLive.Platform.Me)*/account.meContact;
                   Debug.assert(Jx.isObject(me), "Me contact unavailable");
               }
           }
           return me;
       };

       PlatformCache.prototype.getCollection = function (collectionName, fn, /*@dynamic*/context) {
           ///<param name="collectionName" type="String">A unique name for this collection, used to cache and store hydration data</param>
           ///<param name="fn" type="Function">A function that will create the collection if it doesn't already exist</param>
           ///<param name="context" optional="true">A context parameter for fn</param>
           var collections = this._collections;
           var collection = collections[collectionName];
           if (!collection) {
               Jx.log.warning("Creating " + collectionName + " collection");
               collection = collections[collectionName] = fn.call(context, this._platform, this._jobSet);
               
               var hydration;
               var setting = Jx.appData.localSettings().container("People").container("Collections").get(collectionName);
               if (Jx.isNonEmptyString(setting)) {
                   try {
                       hydration = JSON.parse(setting);
                   } catch (ex) {
                       Jx.log.exception("Invalid hydration data for " + collectionName, ex);
                   }
               }
               collection.hydrate(hydration);
           }
           return collection;
       };

       PlatformCache.prototype._fetchContacts = function (jobSet) {
           /// <param name="jobSet" type="P.JobSet"/>
           Debug.assert(Jx.isObject(jobSet));
           this._fetch = new P.FetchContacts(this._platform, jobSet);
       };

       PlatformCache.prototype.suspend = function () {
           var settings = Jx.appData.localSettings().container("People").container("Collections");
           for (var collectionName in this._collections) {
               var setting = JSON.stringify(this._collections[collectionName].dehydrate());
               settings.set(collectionName, setting); 
           }
       };

       PlatformCache.prototype.dispose = function () {
           this.suspend();

           this._platform = null;
           this._defaultAccount = null;
           this._defaultMeContact = null;
           Jx.dispose(this._jobSet);
           this._jobSet = null;
           Jx.dispose(this._fetch);
           this._fetch = null;

           for (var collectionName in this._collections) {
               Jx.dispose(this._collections[collectionName]);
           }
           this._collections = null;
       };
});
