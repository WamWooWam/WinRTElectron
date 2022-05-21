
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>

/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        
Jx.delayDefine(People, "Handler", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = People;

     var Handler = P.Handler = /*@constructor*/function (data, jobSet) {
         /// <summary> Handler represents an object bound to UI </summary>
         /// <param name="jobSet" type="P.JobSet">jobSet with which to schedule operations</param>
         /// <param name="data" type="Object">optional initial context</param>
         this._jobSet = jobSet;

         if (data !== undefined && data !== null) {
             this.setDataContext(data);
         }
     };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

     Handler.prototype.setDataContext = function Handler_setContext(data) {
         this._data = data;
     };

     Handler.prototype.nullify = function Handler_nullify() {
         this._data = null;
     };

     Handler.prototype._data = /* @dynamic */ null;
     
});
