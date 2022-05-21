
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
        
// Copyright (C) Microsoft. All rights reserved.

(function() {
     var P = People;
     var Super = P.Handler.prototype;

     var MockHeaderHandler = P.MockHeaderHandler = /*@constructor*/function(data, jobSet, element) {
         this._element = element;
         P.Handler.call(this, data, jobSet);
     };

     MockHeaderHandler.prototype.setDataContext = function (data) {
         this._element.innerText = data;
     };

     MockHeaderHandler.prototype.nullify = Super.nullify;

 })();
