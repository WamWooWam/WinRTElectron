
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../../Shared/WinJS/WinJS.ref.js" />
///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>
///<reference path="./LocaleHelper.js"/>

Jx.delayDefine(People, "NameHelper", function () {

    var P = window.People;

    var c_nameOrderFirstLast = 0;
    var c_nameOrderLastFirst = 1;

    var _inputFieldOrder = {
        "be-BY": c_nameOrderLastFirst,
        "en-ID": c_nameOrderLastFirst,  
        "hu-HU": c_nameOrderLastFirst,
        "ja-JP": c_nameOrderLastFirst,
        "kk-KZ": c_nameOrderLastFirst,
        "km-KH": c_nameOrderLastFirst,
        "ko-KR": c_nameOrderLastFirst,
        "ky-KG": c_nameOrderLastFirst,
        "ru-RU": c_nameOrderLastFirst,
        "uk-UA": c_nameOrderLastFirst,
        "vi-VN": c_nameOrderLastFirst,
        "zh-CN": c_nameOrderLastFirst,
        "zh-HK": c_nameOrderLastFirst,
        "zh-TW": c_nameOrderLastFirst
    };

    // ---------------------------------------------------------------------------------------------------------------

    // NameHelper
    P.NameHelper = function (localeHelper) {
        /// <summary>
        /// A helper for ordering of addresses for edit and view
        /// </summary>
        this._localeHelper = localeHelper || new P.LocaleHelper();
    };

    
    P.NameHelper.__class = true;
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var NameHelperPrototype = P.NameHelper.prototype;
    /* @type(People.LocaleHelper) */NameHelperPrototype._localeHelper = null;

    /// <enable>JS2076.IdentifierIsMiscased</enable>
    NameHelperPrototype.IsFirstLast = function () {
        /// <Summary>
        /// Returns whether the current market is a firstname / lastname or lastname/firstname display Order
        /// </Summary>

        var helper = /* @static_cast(People.LocaleHelper) */this._localeHelper;

        var entry = _inputFieldOrder[helper.locale];
        if (entry === undefined) {
            return true;
        }

        return entry === c_nameOrderFirstLast;
    };

});
