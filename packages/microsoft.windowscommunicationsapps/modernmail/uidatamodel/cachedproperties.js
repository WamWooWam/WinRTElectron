
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Jx, Mail, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail.UIDataModel, "CachedProperties", function () {
    "use strict";


    var CachedProperties = Mail.UIDataModel.CachedProperties = /*@constructor*/ function (baseObject) {
        Debug.assert(Jx.isObject(baseObject));
        this._base = baseObject;
        this._map = {};
    };

    CachedProperties.prototype.add = function (basePropertyName, complexPropertyName, calculateFunc, calculateFuncContext) {
        Debug.assert(Jx.isNonEmptyString(basePropertyName));
        Debug.assert(Jx.isNonEmptyString(complexPropertyName));
        Debug.assert(Jx.isFunction(calculateFunc));
        Debug.assert(Jx.isUndefined(this._map[complexPropertyName]));
        this._map[complexPropertyName] = {
            basePropertyName: basePropertyName,
            calculateFunc: calculateFunc,
            calculateFuncContext: calculateFuncContext,
            beenCalculated: false
        };
    };

    CachedProperties.prototype.get = function (complexPropertyName) {
        Debug.assert(Jx.isNonEmptyString(complexPropertyName));
        Debug.assert(this._map[complexPropertyName]);
        var propInfo = this._map[complexPropertyName];

        // An undefined base property likely indicates a bug where an incorrect property was specified
        Debug.assert(!Jx.isUndefined(this._base[propInfo.basePropertyName]));
        if (!propInfo.beenCalculated || (this._base[propInfo.basePropertyName] !== propInfo.lastBasePropertyValue)) {
            this._calculateValue(propInfo);
        }
        Debug.assert(propInfo.lastBasePropertyValue === this._base[propInfo.basePropertyName]);
        return propInfo.complexPropertyValue;
    };

    CachedProperties.prototype._calculateValue = function (propInfo) {
        Debug.assert(Jx.isObject(propInfo));

        propInfo.complexPropertyValue = propInfo.calculateFunc.call(propInfo.calculateFuncContext);
        propInfo.lastBasePropertyValue = this._base[propInfo.basePropertyName];
        propInfo.beenCalculated = true;
    };
});


