
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/Jx/Core/Jx.js"/>

Jx.delayDefine(People, "Hydration", function () {

    var P = window.People;

    /// The hydration namespace provides a couple of utilities for extracting and setting data in a 
    /// hydration/dehydration context.  Mostly it deals with the fact that the hydration data might be 
    /// null.
    P.Hydration = {}; 

    P.Hydration.get = function (data, property, /*@dynamic*/defaultValue) {
        ///<summary>Retrieves the named property from the hydration data.  If not present or invalid, returns
        ///defaultValue instead.</summary>
        ///<param name="data" type="Object">The hydration data</param>
        ///<param name="property" type="String">The name of the property to retrieve</param>
        ///<param name="defaultValue" optional="true">The value to return if the data is null, or if the property is missing or invalid</param>
        if (Jx.isObject(data)) { 
            var value = data[property];
            if (Jx.isUndefined(defaultValue) || (typeof value === typeof defaultValue)) {
                return value;
            } else if (!Jx.isUndefined(value)) {
                Jx.log.warning("Ignoring bad hydration data for " + property + ".  Expected " + (typeof defaultValue) + ", received " + (typeof value) + ".");
            }
        }
        return defaultValue;
    };
    P.Hydration.set = function (data, property, /* @dynamic*/value) {
        ///<summary>Sets the named property into the hydration data.  Trivial, just exists as a complement to the get
        ///method</summary>
        ///<param name="data" type="Object">The dehydration data object</param>
        ///<param name="property" type="String">The name of the property to set</param>
        ///<param name="value">The value to store</param>
        data[property] = value;
        return value;
    };

});
