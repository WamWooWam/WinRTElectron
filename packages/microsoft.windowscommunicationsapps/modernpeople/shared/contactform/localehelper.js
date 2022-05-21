
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../../Shared/WinJS/WinJS.ref.js" />
///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>

Jx.delayDefine(People, "LocaleHelper", function () {

    var P = window.People;

    var _resourceContext = null;

    function _createContext(marketContext) {
        /// <Summary>
        /// Internal helper to build a context reference
        /// </Summary>
        /// <param name="marketContext" type="String" optional="true">The string locale of the current market/language</param>

        var mkt = marketContext || "";
        var tokens = mkt.split("-");
        var language = "en";
        if (tokens.length > 0) {
            language = tokens[0].toLowerCase() || language;
        }
        var region = language === "en" ? "US" : language;
        if (tokens.length >= 2) {
            // Attempt to grab the region from the passed language if it's
            // handles cases such as en-US, en-ID and va-es-valencia
            if (tokens[1] && tokens[1].length === 2) {
                // Only keep the region from the language if it appears to be a 2 character REGION and not a script type (generally > 2 characters)
                region = tokens[1];
            }
        }
        if (tokens.length >= 3) {
            // Attempt to grab the region from the passed language if it's
            // Handles cases such as ja-ploc-jp, sa-cryl-ba, en-locr-us
            if (tokens[2] && tokens[2].length === 2) {
                // Only keep the region from the language if it appears to be a 2 character REGION and not a script type (generally > 2 characters)
                region = tokens[2];
            }
        }
        region = region.toUpperCase();

        return {
            market: marketContext,              // Equivilent to the first valid looking language in BCP47 format (en, en-US, zh-HANS)
            locale: language + "-" + region,    // An ISO form of the locale xx-YY with xx = the language and YY = ISO Country
            language: language,                 // An ISO form of the language (first part of the first language) zh from zh-HANS.
            region: region                      // The region determined from either the language (en-AU) or defaulting to the home region
        };
    };

    function _getContext() {

        if (!_resourceContext) {

            var m = Microsoft.WindowsLive.Market;
            _resourceContext = _createContext(m.get(Microsoft.WindowsLive.FallbackLogic.language));
        }

        return _resourceContext;
    };


    // ---------------------------------------------------------------------------------------------------------------

    // LocaleHelper
    P.LocaleHelper = function () {
        /// <summary>
        /// A helper for locale processing
        /// </summary>

        Object.defineProperty(this, "market", { get: function () { return _getContext().market; }, enumerable: true });
        Object.defineProperty(this, "locale", { get: function () { return _getContext().locale; }, enumerable: true });
        Object.defineProperty(this, "language", { get: function () { return _getContext().language; }, enumerable: true });
        Object.defineProperty(this, "region", { get: function () { return _getContext().region; }, enumerable: true });
    };

    
    P.LocaleHelper.__class = true;
    

    
    P.LocaleHelper.setLocale = function (newLocale) {
        /// <Summary>
        /// For testing (unit and integration) allows you to override the current locale easily and reset back to default (null)
        /// </Summary>
        _resourceContext = _createContext(newLocale);
    };
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var LocaleHelperPrototype = P.LocaleHelper.prototype;
    /* @type(String) */LocaleHelperPrototype.market = null;
    /* @type(String) */LocaleHelperPrototype.locale = null;
    /* @type(String) */LocaleHelperPrototype.language = null;
    /* @type(String) */LocaleHelperPrototype.region = null;

});
