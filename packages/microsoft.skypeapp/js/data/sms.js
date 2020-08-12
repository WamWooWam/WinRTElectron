

(function () {
    "use strict";

    function formatPrice(price, currencyCode) {
        formatPrice.formatters[currencyCode] = formatPrice.formatters[currencyCode] || new Windows.Globalization.NumberFormatting.CurrencyFormatter(currencyCode);
        return formatPrice.formatters[currencyCode].format(price);
    }
    formatPrice.formatters = {};

    var sms = MvvmJS.Class.define(function (libConversation) {
        this._conversation = libConversation;
        this._handlePropertyChanged = this._handlePropertyChanged.bind(this);

        this._init();
    }, {
        _sms: null,
        _conversation: null,
        _text: null,
        _phone: null,

        text: {
            get: function () {
                return this._text;
            }
        },

        phone: {
            get: function () {
                return this._phone;
            },
            set: function (value) {
                this._phone = value;
                this._updatePhone();
            }
        },

        send: function () {
            this._conversation.postSMS(this._sms.getObjectID(), this._text);
            this._resetLibSms();
            this._init();
            this._updatePhone();
        },
        _resetLibSms: function () {
            if (this._sms) {
                this._text = "";
                this.unregEventListener(this._sms, "propertychange", this._handlePropertyChanged);
                this._sms.discard();
                this._sms = null;
            }
        },
        updateText: function (text) {
            if (this._phone === null) {
                return null;
            }

            var setBodyResult = this._sms.setBody(text, this._chunks);
            
            this._updatePrice();

            var maxLength = this._calculateMaxLength(setBodyResult, text);

            var resultCode = setBodyResult.result;
            var textIsTooLong = resultCode === LibWrap.Sms.setbodyresult_BODY_LASTCHAR_IGNORED || resultCode === LibWrap.Sms.setbodyresult_BODY_TRUNCATED;
            if (textIsTooLong) {
                var arrText = [];
                for (var i = 0, length = this._chunks.getCount() ; i < length; i++) {
                    arrText.push(this._chunks.get(i));
                }
                this._text = arrText.join("");
                return {
                    result: false,
                    maxLength: maxLength,
                    remaining: 0
                };
            } else {
                this._text = text;
                return {
                    result: true,
                    maxLength: maxLength,
                    remaining: setBodyResult.charsUntilNextChunk
                };
            }
        },

        _init: function () {
            this._sms = sms.createLibSmsObject();
            lib.createOutgoingSms(this._sms);

            this._chunks = new LibWrap.VectGIString();
            this.regEventListener(this._sms, "propertychange", this._handlePropertyChanged);
        },
        _updatePhone: function () {
            if (this._phone === null) {
                this._resetLibSms();
                this._init();
            } else {
                log("setting target to phone {0}".format(this._phone));
                var targets = new LibWrap.VectGIString();
                targets.append(this._phone);
                this._sms.setTargets(targets);
            }
        },
        _calculateMaxLength: function (result, text) {
            var maxLength;
            var chunksCount = this._chunks.getCount();
            if (chunksCount > 1) {
                maxLength = 4 * this._chunks.get(0).length;
            } else {
                if (chunksCount > 0) {
                    maxLength = 4 * (result.charsUntilNextChunk + text.length);
                } else {
                    maxLength = 4 * 160;
                }
            }

            return maxLength;
        },
        _handlePropertyChanged: function (evt) {
            
            if (evt.detail[0] === LibWrap.PROPKEY.sms_PRICE) {
                this._updatePrice();
            }
        },
        _updatePrice: function () {
            var price = this._sms.getIntProperty(LibWrap.PROPKEY.sms_PRICE);
            
            if (price > 0) {
                var precision = this._sms.getIntProperty(LibWrap.PROPKEY.sms_PRICE_PRECISION);
                var currency = this._sms.getStrProperty(LibWrap.PROPKEY.sms_PRICE_CURRENCY);
                var priceInPrecision = price / Math.pow(10, precision);
                this.price = Skype.Globalization.formatPrice(priceInPrecision, currency);
            } else {
                this.price = "";
            }
        }

    }, {
        price: ""
    }, {
        createLibSmsObject: function () {
            return new LibWrap.Sms();
        }
    });

    WinJS.Namespace.define("Skype.Model", {
        Sms: WinJS.Class.mix(sms, Skype.Class.disposableMixin)
    });
}());
