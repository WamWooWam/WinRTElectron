
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../../Shared/WinJS/WinJS.ref.js" />
///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>
///<reference path="./LocaleHelper.js"/>

Jx.delayDefine(People, "AddressHelper", function () {

    var P = window.People;

    var _localeHelper = null;

    var _addressEditFieldOrder = {
        // Default
        0: ["street", "city", "state", "zipCode", "country"],
        // zh-TW (CHT), Japan
        1: ["zipCode", "state", "city", "street", "country"],
        // ko zh-CN (CHS)
        2: ["state", "city", "street", "zipCode", "country"],
        // it, nl, fr, de, pl, es
        3: ["street", "zipCode", "city", "state", "country"]
    };

    var _addressViewFieldOrder = {
        // Default
        0: ["#street", "\n", "#city", ", ", "#state", " ", "#zipCode", "\n", "#country"],

        // Chinese - Traditional - Taiwan
        // 1. Postal Code
        // 2. City + Address1
        // 3. [Address 2]
        1: ["#zipCode", "\n", "#state", "#city", "#street", "\n", "#country"],

        // German (Germany, Switzerland, Austria, Liechtenstein, Luxembourg)
        // 1. Address1
        // 2. [Address2]
        // 3. [CountryCode-]PostalCode City
        // 4. [Country]
        2: ["#street", "\n", "#zipCode", " ", "#city", "\n", "#state", "\n", "#country"],

        // French (France)
        // 1. Address1
        // 2. [Address2]
        // 3. PostalCode City
        // 4. Country
        3: ["#street", "\n", "#zipCode", " ", "#city", "\n", "#state", "\n", "#country"],

        // Italy
        // 1. Address1
        // 2. [Address2]
        // 3. [CountryCode - ]PostalCode City [Province]
        // 4. [Country]
        4: ["#street", "\n", "#zipCode", " ", "#city", " ", "#state", "\n", "#country"],

        // Japan
        // 1. Postal Code
        // 2. Prefecture + City + Address
        5: ["#zipCode", "\n", "#state", "#city", "#street", "\n", "#country"],

        // Korea
        // 1. [Country] [Province] City, Address1
        // 2. PostalCode
        6: ["#country", " ", "#state", " ", "#city", ", ", "#street", "\n", "#zipCode"],

        // Dutch (Netherlands, Belgium)
        // 1. Address1
        // 2. [Address2]
        // 3. PostalCode CITY
        // 4. Country
        7: ["#street", "\n", "#zipCode", " ", "%city", "\n", "#state", "\n", "#country"],

        // Poland
        // 1. Address1
        // 2. [Address2]
        // 3. PostalCode City
        // 4. Country
        8: ["#street", "\n", "#zipCode", ", ", "#city", "\n", "#state", "\n", "#country"],

        // Portuguese (Brazil)
        // 1. Address line 1
        // 2. Address line 2
        // 3. City - State
        // 4. [Country]
        // 5. ZipCode
        9: ["#street", "\n", "#city", " - ", "#state", "\n", "#country", "\n", "#zipCode"],

        // Russia
        // 1. Address
        // 2. City
        // 3. [State/region]
        // 4. [Country]
        // 5. PostalCode
        10: ["#street", "\n", "#city", "\n", "#state", "\n", "#country", "\n", "#zipCode"],

        // China - Simplified (China)
        // 1. [Country]Province/City[City]DistrictStreetAddress
        // 2. PostalCode
        11: ["#country", "#state", "#city", "#street", "\n", "#zipCode"],

        // Spanish (Spain; Argentina; Bolivia; Chile; Colombia; Costa Rica; Cuba; Dominican Republic; 
        // Ecuador; El Salvador; Guatemala; Honduras; Mexico; Nicaragua; Panama; Paraguay; Peru; Puerto Rico; 
        // Uruguay; Venezuela)
        // 1. Address1
        // 2. [Address2]
        // 3. PostalCode City
        // 4. [Country]
        12: ["#street", "\n", "#zipCode", " ", "#city", "\n", "#state", "\n", "#country"]

    };

    var _addressFieldOrder = {
        // Default
        Default: { view: 0, edit: 0 },

        // Chinese - Traditional - Taiwan
        TW: { view: 1, edit: 1 },

        // German (Germany, Switzerland, Austria, Liechtenstein, Luxembourg)
        DE: { edit: 3, view: 2 },
        CH: { edit: 3, view: 2 },
        AT: { edit: 3, view: 2 },
        LI: { edit: 3, view: 2 },
        LU: { edit: 3, view: 2 },

        // French (France)
        FR: { edit: 3, view: 3 },

        // Italy
        IT: { edit: 3, view: 4 },

        // Japan
        JP: { edit: 1, view: 5 },

        // Korea
        KP: { edit: 2, view: 6 },
        KR: { edit: 2, view: 6 },

        // Dutch (Netherlands, Belgium)
        BE: { edit: 3, view: 7 },
        NL: { edit: 3, view: 7 },
        AN: { edit: 3, view: 7 },

        // Poland
        PL: { edit: 3, view: 8 },

        // Portuguese (Brazil)
        BR: { edit: 0, view: 9 },

        // Russia
        RU: { edit: 0, view: 10 },

        // China - Simplified (China)
        CN: { edit: 2, view: 11 },

        // Spanish (Spain; Argentina; Bolivia; Chile; Colombia; Costa Rica; Cuba; Dominican Republic; 
        // Ecuador; El Salvador; Guatemala; Honduras; Mexico; Nicaragua; Panama; Paraguay; Peru; Puerto Rico; 
        // Uruguay; Venezuela)
        ES: { edit: 3, view: 12 },
        AR: { edit: 3, view: 12 },
        BO: { edit: 3, view: 12 },
        CL: { edit: 3, view: 12 },
        CO: { edit: 3, view: 12 },
        CR: { edit: 3, view: 12 },
        CU: { edit: 3, view: 12 },
        DO: { edit: 3, view: 12 },
        EC: { edit: 3, view: 12 },
        SV: { edit: 3, view: 12 },
        GT: { edit: 3, view: 12 },
        HN: { edit: 3, view: 12 },
        MX: { edit: 3, view: 12 },
        NI: { edit: 3, view: 12 },
        PA: { edit: 3, view: 12 },
        PY: { edit: 3, view: 12 },
        PE: { edit: 3, view: 12 },
        PR: { edit: 3, view: 12 },
        UY: { edit: 3, view: 12 },
        VE: { edit: 3, view: 12 }
    };


    /// <summary>
    /// Encodes a string to be displayed in the browser.
    /// Usage: _divElement.innerHTML =_someValue.encodeHtml());
    /// </summary>
    /// <returns>Encode Xml/Html</returns>
    function _encodeHtml(value) {
        /// <param name="value" type="String" />
        if (value) {
            var div = document.createElement('tempDiv');
            var text = document.createTextNode(value);
            div.appendChild(text);
            value = div.innerHTML;
        }
        return value;
    };

    function _getViewAddressOrdering(/* @type(People.AddressHelper) */that) {
        var helper = /* @static_cast(People.LocaleHelper) */that._localeHelper;

        var entry = _addressFieldOrder[helper.region];
        if (!entry) {
            entry = _addressFieldOrder["Default"];
        }

        return _addressViewFieldOrder[entry.view] || _addressViewFieldOrder[0];
    };

    function _formatField(fieldName, address, nativeDigits) {
        if (address[fieldName]) {
            var value = address[fieldName];
            if (nativeDigits && (typeof value === "string")) {
                this._numeralSystemTranslator = new Windows.Globalization.NumberFormatting.NumeralSystemTranslator();
                value = this._numeralSystemTranslator.translateNumerals(value);
            }
            return value;
        }
        return null;
    };

    function _formatViewAddressAsString(/* @type(Array) */format, address, nativeDigits) {
        var result = /* @type(String) */"";
        var line = "";
        var trail = "";
        var value = "";
        var lastValue = "";
        var count = format.length;
        for (var lp = 0; lp < count; lp++) {
            var token = /* @type(string) */format[lp];
            var prefix = token.substring(0, 1);
            if (prefix === "#" || prefix === "%") {
                value = _formatField(token.substring(1), address, nativeDigits);
                if (value) {
                    if (trail) {
                        line += trail;
                        trail = "";
                    }
                    lastValue = value;
                    if (prefix === "%") {
                        lastValue = value.toLocaleUpperCase();
                    }
                    while (lastValue.substring(lastValue.length - 1) === "\n") {
                        lastValue = lastValue.substring(0, lastValue.length - 1);
                    }
                    line += lastValue;
                }
            } else if (token === "\n") {
                if (line) {
                    if (Boolean(result) && result.substring(result.length - 1) !== "\n") {
                        result += "\n";
                    }
                    result += line;
                }
                line = "";
                trail = "";
                lastValue = "";
            } else if (!trail) {
                if (lastValue) {
                    trail = token;
                    lastValue = "";
                }
            }
        }
        if (line) {
            if (Boolean(result) && result.substring(result.length - 1) !== "\n") {
                result += "\n";
            }
            result += line;
        }

        return result;
    };

    function _formatValueAsHtml(value, idPrefix, labelIds) {
        var html = "";
        var details = value.split('\n');
        var count = 0;

        for (var line = 0, len = details.length; line < len; line++) {
            var htmlType = "span";
            var htmlId = "";
            if (count > 0) {
                htmlType = "div";
            }
            if (idPrefix) {
                var lineId = (count === 0 ? idPrefix : idPrefix + "_" + String(count));
                if (labelIds) {
                    labelIds.push(lineId);
                }
                htmlId = " id='" + lineId + "'";
            }
            count++;

            var htmlLine = "<" + htmlType;
            if (htmlId) {
                htmlLine += htmlId;
            }
            htmlLine += ">" + _encodeHtml(details[line]) + "</" + htmlType + ">";

            html += htmlLine;
        }

        return html;
    }

    function _formatViewAddressAsHtml(/* @type(Array) */format, address, /* @type(string) */idPrefix, /* @type(Array) */labelIds) {
        var result = "";
        var line = "";
        var trail = "";
        var value = "";
        var lastValue = "";
        var count = format.length;
        for (var lp = 0; lp < count; lp++) {
            var token = /* @type(string) */format[lp];
            var prefix = token.substring(0, 1);
            if (prefix === "#" || prefix === "%") {
                var fieldName = /* @type(String) */token.substring(1);
                value = _formatField(fieldName, address, false);
                if (value) {
                    if (trail) {
                        line += "<span>" + _encodeHtml(trail) + "</span>";
                        trail = "";
                    }
                    lastValue = value;
                    if (prefix === "%") {
                        lastValue = value.toLocaleUpperCase();
                    }
                    if (idPrefix) {
                        line += _formatValueAsHtml(lastValue, idPrefix + fieldName, labelIds);
                    } else {
                        line += _formatValueAsHtml(lastValue, null, null);
                    }
                }
            } else if (token === "\n") {
                if (line) {
                    result += "<div>" + line + "</div>";
                }
                line = "";
                trail = "";
                lastValue = "";
            } else if (!trail) {
                if (lastValue) {
                    trail = token;
                    lastValue = "";
                }
            }
        }
        if (line.length) {
            result += "<div>" + line + "</div>";
        }

        return result;
    };

    // ---------------------------------------------------------------------------------------------------------------

    // AddressHelper
    P.AddressHelper = function () {
        /// <summary>
        /// A helper for ordering of addresses for edit and view
        /// </summary>
        this._localeHelper = new P.LocaleHelper();
    };

    
    P.AddressHelper.__class = true;
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var AddressHelperPrototype = P.AddressHelper.prototype;
    /* @type(People.LocaleHelper) */AddressHelperPrototype._localeHelper = null;

    /// <enable>JS2076.IdentifierIsMiscased</enable>
    AddressHelperPrototype.getAddressEditFieldOrder = function () {
        /// <Summary>
        /// Returns the edit field order index for the current market
        /// </Summary>

        var helper = /* @static_cast(People.LocaleHelper) */this._localeHelper;

        var entry = _addressFieldOrder[helper.region];
        if (!entry) {
            entry = _addressFieldOrder["Default"];
        }

        return entry.edit;
    };

    AddressHelperPrototype.getAddressEditFieldOrderStrings = function () {
        /// <Summary>
        /// Returns the edit field ordering as an array of field names
        /// </Summary>

        return _addressEditFieldOrder[this.getAddressEditFieldOrder()] || _addressEditFieldOrder[0];
    };

    AddressHelperPrototype.getAddressViewFieldOrderStrings = function () {
        /// <Summary>
        /// Returns the edit field ordering as an array of field names
        /// </Summary>
        var viewOrder = [];
        var format = _getViewAddressOrdering(this);
        var count = format.length;
        for (var lp = 0; lp < count; lp++) {
            var token = format[lp];
            var prefix = token.substring(0, 1);
            if (prefix === "#" || prefix === "%") {
                viewOrder.push(token.substring(1));
            }
        }

        return viewOrder;
    };

    AddressHelperPrototype.formatViewAddressAsString = function (address, nativeDigits) {
        /// <Summary>
        /// Returns a formatted string for the address 
        /// </Summary>

        var format = _getViewAddressOrdering(this);

        return _formatViewAddressAsString(format, address, nativeDigits);
    };

    AddressHelperPrototype.formatViewAddressAsHtml = function (address, idPrefix, labelIds) {
        /// <Summary>
        /// Returns a formatted string for the address 
        /// </Summary>
        /// <param name="address" type="Object">The target object that will be transformed</param>
        /// <param name="idPrefix" type="String">If not null this causes 2 outcomes, 1) each value will have an id='' added to the span / div. 2) The value is the prefix of the id field.</param>
        /// <param name="labelIds" type="Array">If not null, any generated Id's will be added to this array.</param>

        var format = _getViewAddressOrdering(this);

        return _formatViewAddressAsHtml(format, address, idPrefix, labelIds);
    };

});
