//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var Globalization = WinJS.Class.define(function Globalization_ctor(){}, {
            _currencySymbol: null, _currentLocaleName: null, _dayNames: null, _decimalSymbol: null, _digitGroupingSymbol: null, _language: null, _monthNames: null, _negativeSymbol: null, _positiveSymbol: null, _shortDate: null, _longDate: null, _shortTime: null, _longTime: null, _currentLocaleNumberGroupSizes: null, language: {get: function() {
                        return this._language === null && (this._language = AppMagic.Strings.StringsLanguage), this._language
                    }}, currentLocaleName: {get: function() {
                        return this._currentLocaleName === null && (this._currentLocaleName = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleName), this._currentLocaleName
                    }}, decimalSymbol: {get: function() {
                        return this._decimalSymbol === null && (this._decimalSymbol = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator), this._decimalSymbol
                    }}, digitGroupingSymbol: {get: function() {
                        return this._digitGroupingSymbol === null && (this._digitGroupingSymbol = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleThousandsSeparator), this._digitGroupingSymbol
                    }}, currencySymbol: {get: function() {
                        return this._currencySymbol === null && (this._currencySymbol = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleCurrencySymbol), this._currencySymbol
                    }}, positiveSymbol: {get: function() {
                        return this._positiveSymbol === null && (this._positiveSymbol = Microsoft.AppMagic.Common.LocalizationHelper.currentLocalePositiveSymbol), this._positiveSymbol
                    }}, negativeSymbol: {get: function() {
                        return this._negativeSymbol === null && (this._negativeSymbol = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleNegativeSymbol), this._negativeSymbol
                    }}, shortDate: {get: function() {
                        return this._shortDate === null && (this._shortDate = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleShortDatePattern), this._shortDate
                    }}, longDate: {get: function() {
                        return this._longDate === null && (this._longDate = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleLongDatePattern), this._longDate
                    }}, shortTime: {get: function() {
                        return this._shortTime === null && (this._shortTime = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleShortTimePattern), this._shortTime
                    }}, longTime: {get: function() {
                        return this._longTime === null && (this._longTime = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleLongTimePattern), this._longTime
                    }}, dayNames: {get: function() {
                        return this._dayNames === null && (this._dayNames = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDayNames), this._dayNames
                    }}, monthNames: {get: function() {
                        return this._monthNames === null && (this._monthNames = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleMonthNames), this._monthNames
                    }}, currentLocaleNumberGroupSizes: {get: function() {
                        if (this._currentLocaleNumberGroupSizes === null) {
                            var numberGroupSizes = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleNumberGroupSizes.split(",");
                            this._currentLocaleNumberGroupSizes = [];
                            for (var i = 0; i < numberGroupSizes.length; i++) {
                                var groupSize = parseInt(numberGroupSizes[i]);
                                if (groupSize < 0 || !isFinite(groupSize)) {
                                    this._currentLocaleNumberGroupSizes = [0];
                                    break
                                }
                                this._currentLocaleNumberGroupSizes.push(groupSize)
                            }
                        }
                        return this._currentLocaleNumberGroupSizes
                    }}
        }, {});
    WinJS.Namespace.define("AppMagic", {Globalization: new Globalization})
})(Windows);