

(function () {
    "use strict";

    var dialerVm = MvvmJS.Class.define(function () {
        this._dialerInputValue = "";
        this.rates = [];
        this.subscriptions = [];
    }, {
        
        countries: {
            
            list: [],
            defaultIndex: null,
            unknownIndex: null
        },

        
        rates: null,
        subscriptions: null,

        
        recentCalls: null,

        countryVm: null,
        emergencyCountryVm: null,

        
        _recentCallLimit: 6,

        _dialerInputValue: null,

        _countryOrigin: null,

        _recentsLoaded: false,

        identity: {
            get: function () {
                var prefix = this.countryVm.country ? this.countryVm.country.data.prefix : null,
                identity = Skype.Lib.getIdentityForCountryCode(this.dialerInputValue, prefix);
                return identity;
            }
        },

        
        init: function (countrySelectVm, emergencyCountryVm) {
            this.countryVm = countrySelectVm;
            this.emergencyCountryVm = emergencyCountryVm;
            this.recentCalls = new WinJS.Binding.List();

            this._loadCountryOrigin();
            this._updateBalance();
            this._updateSubscriptions();

            this.regBind(this.countryVm, "country", this._onCountryChange.bind(this));
            this.regEventListener(this.countryVm, Skype.ViewModel.CountryInputVM.Events.CountryLanguageSelected, this._replaceInputPrefix.bind(this));

            this.regEventListener(Skype.Model.Options.emergencyCalling, "countryChanged", this._onEmergencyCountryChanged.bind(this));
            this.regBind(this.emergencyCountryVm, "country", this._onEmergencyCountrySelectChange.bind(this));
            this.emergencyCountryVm.selectCountryByCode(Skype.Model.Options.emergencyCalling.emergencyCountry);
            this._onEmergencyCountryChanged();

            this.regEventListener(Skype.Application.state, "historyCleared", this._onHistoryCleared.bind(this));
        },

        updateRecentCallLimit: function (value) {
            if (this._recentCallLimit !== value) {
                this._recentCallLimit = value;
                this._recentsLoaded && this._sortAndLimitRecentCalls();
            }
        },

        loadRecentCalls: function () {
            var messages = this._loadSortedMessages();

            
            var uniqueMap = {}, uniqueCalls = 0;
            for (var i = 0, length = messages.length; i < length; i++) {
                var convoId = messages[i].getIntProperty(LibWrap.PROPKEY.message_CONVO_ID);
                if (!uniqueMap[convoId] && uniqueCalls < this._recentCallLimit) {
                    this._updateRecentCall(messages[i]);
                    uniqueMap[convoId] = true;
                    uniqueCalls++;
                }
                messages[i].discard();
            }

            this._updateHaveRecentsCallFlag();
            this._recentsLoaded = true;

            this.regEventListener(lib, "incomingmessage", this._handleIncomingMessage.bind(this));
            this.regEventListener(lib, "conversationlistchange", this._handleConversationListChange.bind(this));

            
            this.regInterval(this._onUpdateTimer.bind(this), 1000 * 60);
        },


        recentItemClicked: function (index, callBtnClicked) {
            var recentCallsItem = this.recentCalls.getAt(index);
            var conversation = recentCallsItem.conversation;
            var identity = conversation.identity;

            if (!callBtnClicked) {
                Actions.invoke("focusConversation", identity);
                return;
            }
            if (conversation.isBlocked) {
                return;
            }
            if (!Actions.isActionApplicable("call", [identity])) {
                Actions.invoke("focusConversation", identity);
            } else {
                var partnerLiveIdentity = conversation.isDialog ? this._getPartnerLiveIdentity(recentCallsItem.message, identity) : null;
                if (partnerLiveIdentity) {
                    Actions.invoke("call", [identity], { identityToUse: partnerLiveIdentity });
                } else {
                    Actions.invoke("call", [identity]);
                }
            }
            conversation.contact && this._statReport(conversation.contact.isPstnContact);
        },

        
        _formatSubscription: function (key, value) {
            if (value) {
                var resourceID = Skype.Globalization.formatNumericID("dialer_accountinfo_{0}_subscription", value);
                value = WinJS.Resources.getString(resourceID.format(key)).value.format(value);
            }
            return value;
        },

        _handleDialerInputChange: function (event) {
            this._updateCountrySelection();
            this._validateDialerInputAndSetFlags();
            this._updateActionButtonLabels();
        },

        _validateDialerInputAndSetFlags: function () {
            this.inputIsEmergencyNumber = lib.getContactType(this.identity) === LibWrap.Contact.type_EMERGENCY_PSTN;
            var isInvalidPSTN = !Skype.Lib.validPSTN(this.identity);
            this.canNotCall = isInvalidPSTN || (this.inputIsEmergencyNumber && !Skype.Model.Options.emergencyCalling.emergencyCallingAllowed());
            this.canNotSms = isInvalidPSTN || !!this.inputIsEmergencyNumber;
        },

        _updateCallRates: function (countryCode) {
            
            if (countryCode) {
                var language = null, currency = null;

                
                if (countryCode in this.rates) {
                    this.payAsYouGoRateString = this.rates[countryCode];
                } else {
                    language = this._getCurrentLanguage();
                    currency = this._getCurrency();
                    this._updatePayAsYouGoRates(currency, language, countryCode);
                }

                if (countryCode in this.subscriptions) {
                    this.subscriptionRateString = this.subscriptions[countryCode];
                } else {
                    if (!language || !currency) {
                        language = this._getCurrentLanguage();
                        currency = this._getCurrency();
                    }
                    this._updateCallSubscriptionsRates(currency, language, countryCode);
                }
            }
        },

        _getCurrentLanguage: function () {
            var language = Skype.Globalization.getCurrentLanguage();
            if (language.indexOf("-") !== -1) {
                language = language.substring(0, language.indexOf("-"));
            }
            return language;
        },

        _getCurrency: function () {
            
            var currency = lib.account.getStrProperty(LibWrap.PROPKEY.account_SKYPEOUT_BALANCE_CURRENCY);
            if (currency.length === 0) {
                currency = "usd";
            }
            return currency;
        },

        _loadCountryOrigin: function () {
            this._countryOrigin = lib.account.getStrProperty(LibWrap.PROPKEY.contact_IPCOUNTRY);
            WinJS.xhr({ url: "https://apps.skype.com/countrycode" }).then(this._updateCountryOrigin.bind(this), function () { });
        },

        _updateCountryOrigin: function (result) {
            try {
                var country = JSON.parse(result.responseText);
                if (country.country_code && country.country_code.toLowerCase() !== this._countryOrigin.toLowerCase()) {
                    this._countryOrigin = country.country_code;
                    var language = this._getCurrentLanguage();
                    var currency = this._getCurrency();
                    var countryCode = (this.countryVm && this.countryVm.country && this.countryVm.country.data.code) ? this.countryVm.country.data.code : this._countryOrigin;
                    this._updateCallSubscriptionsRates(currency, language, countryCode);
                }
            } catch (ex) { }  
        },

        _requestHeaders: function () {
            var hdr = {};
            hdr["X-Stratus-Caller"] = "{0}".format(Skype.Version.skypeVersion);
            return hdr;
        },

        _updateCallSubscriptionsRates: function (currency, language, countryCode, isFallback) {
            
            var uriString = "https://apps.skypeassets.com/packages/list/{0}?currency={1}&language={2}&origin={3}".format(countryCode, currency, language, this._countryOrigin);
            var fallBackFunc = isFallback ? this._handleSubscriptionRatesFailed.bind(this, uriString) : this._updateCallSubscriptionsRates.bind(this, currency, "en", countryCode, true);
            log("Skype.ViewModel.Dialer._updateCallSubscriptionsRates request [{0}]".format(uriString));

            WinJS.xhr({
                url: uriString,
                headers: this._requestHeaders()
            }).done(this._handleSubscriptionCompleted.bind(this, countryCode, language, isFallback), fallBackFunc);
        },

        _updatePayAsYouGoRates: function (currency, language, countryCode, isFallback) {
            var uriString = "https://apps.skypeassets.com/rates/skypeout?currency={0}&language={1}&destinationCountry={2}".format(currency, language, countryCode);
            var fallBackFunc = isFallback ? this._handlePayAsYoGoRatesFailed.bind(this, uriString) : this._updatePayAsYouGoRates.bind(this, currency, "en", countryCode, true);
            log("Skype.ViewModel.Dialer._updatePayAsYouGoRates request [{0}]".format(uriString));

            WinJS.xhr({
                url: uriString,
                headers: this._requestHeaders()
            }).done(this._handlePayAsYouGoCompleted.bind(this, currency, countryCode, isFallback), fallBackFunc);
        },

        _handleSubscriptionCompleted: function (countryCode, language, isFallback, result) {
            try {
                var callRates = JSON.parse(result.responseText),
                    directionControl = Skype.Globalization.DirectionControl,
                    subscriptionRate, rateString = '';

                if (callRates.pricelist.subscription.length > 0) {
                    
                    var minIndex = 0;
                    for (var i = 1; i < callRates.pricelist.subscription.length; i++) {
                        
                        if (!callRates.pricelist.subscription[i].unlimited && (callRates.pricelist.subscription[i].minute_rate_vat.amount < callRates.pricelist.subscription[minIndex].minute_rate_vat.amount)) {
                            minIndex = i;
                        }
                    }

                    if (minIndex !== -1) {
                        var isServiceFallback = !(callRates.pricelist.language === language);
                        
                        if (isServiceFallback || isFallback) {
                            var formatter = new Windows.Globalization.NumberFormatting.CurrencyFormatter(callRates.pricelist.subscription[minIndex].currency);
                            subscriptionRate = directionControl.leftToRightOverride + formatter.format(callRates.pricelist.subscription[minIndex].minute_rate_vat.amount) + directionControl.popDirectionalFormatting;
                        } else {
                            subscriptionRate = callRates.pricelist.subscription[minIndex].minute_rate_vat.formatted;
                        }

                        rateString = toStaticHTML("dialer_call_rate_subscription".translate(subscriptionRate));
                        
                        if (this.countryVm.country.data.code === countryCode) {
                            this.subscriptionRateString = rateString;
                        }
                    }
                } else {
                    log("Skype.ViewModel.Dialer._updateCallSubscriptionsRates error: no subscriptions for country [{0}]".format(countryCode));
                    this.subscriptionRateString = "";
                }
                
                this.subscriptions[countryCode] = rateString;
            } catch (exception) {
                log("Skype.ViewModel.Dialer._updateCallSubscriptionsRates: error parsing/processing the pricelist response from server");
                this.subscriptionRateString = "";
            }
        },

        _handlePayAsYouGoCompleted: function (currency, countryCode, isFallback, result) {
            try {
                var callRates = JSON.parse(result.responseText),
                    directionControl = Skype.Globalization.DirectionControl,
                    payAsYouGo, minimal = { price: Infinity }, rateString = "";

                
                callRates.destinations.forEach(function (destination) {
                    if ((destination.type === "landline" || destination.type === "mobile" || destination.type === "mixed") && destination.usageCharge.price < minimal.price) {
                        minimal = destination.usageCharge;
                    }
                });

                if (minimal) {
                    if (isFallback) {
                        var formatter = new Windows.Globalization.NumberFormatting.CurrencyFormatter(currency);
                        payAsYouGo = directionControl.leftToRightOverride + formatter.format(minimal.price) + directionControl.popDirectionalFormatting;
                    } else {
                        payAsYouGo = minimal.priceFormatted;
                    }

                    rateString = toStaticHTML("dialer_call_rate_payg".translate(payAsYouGo));
                    
                    if (this.countryVm.country.data.code === countryCode) {
                        this.payAsYouGoRateString = rateString;
                    }
                } else {
                    this.payAsYouGoRateString = "";
                    log("Skype.ViewModel.Dialer._updatePayAsYouGoRates error: no landline/mobile/mixed pay as you go call rates for country [{0}]".format(countryCode));
                }

                
                this.rates[countryCode] = rateString;
            } catch (exception) {
                this.payAsYouGoRateString = "";
                log("Skype.ViewModel.Dialer._updatePayAsYouGoRates: error parsing/processing the pricelist response from server");
            }
        },

        _handlePayAsYoGoRatesFailed: function (uri, result) {
            var errorStatus = result ? result.responseText : "";
            log("Skype.ViewModel.Dialer._updatePayAsYouGoRates: error when sending request for call rates [{0}], errorStatus:{1}".format(uri, errorStatus));
            this.payAsYouGoRateString = "";
        },

        _handleSubscriptionRatesFailed: function (uri, result) {
            var errorStatus = result ? result.responseText : "";
            log("Skype.ViewModel.Dialer._updateCallSubscriptionsRates: error when sending request for call rates [{0}], errorStatus:{1}".format(uri, errorStatus));
            this.subscriptionRateString = "";
        },


        _onCountryChange: function (country) {
            country && this._updateCallRates(country.data.code);
        },

        _updateCountrySelection: function () {
            this.countryVm.selectCountryByInput(this.dialerInputValue);
        },

        _onEmergencyCountrySelectChange: function (country) {
            if (country && country.data.code != Skype.Model.Options.emergencyCalling.emergencyCountry) {
                Skype.Model.Options.emergencyCalling.emergencyCountry = country.data.code;
            }
        },

        _onEmergencyCountryChanged: function (evt) {
            this.emergencyCountryVm.selectCountryByCode(Skype.Model.Options.emergencyCalling.emergencyCountry);
            var emergencyAllowed = Skype.Model.Options.emergencyCalling.emergencyCallingAllowed();
            this.hidePickEmergencyCountry = !!this.emergencyCountryVm.country;
            this.hideEmergencyCountryRestricted = !this.emergencyCountryVm.country || emergencyAllowed;
            this.hideEmergencyCountryAllowed = !this.emergencyCountryVm.country || !emergencyAllowed;

            this._handleDialerInputChange();
        },



        _replaceInputPrefix: function (evt) {
            var details = evt.detail;
            if (details && details.prev && details.current) {
                if (Skype.Lib.numberStartsWithPrefix(this.dialerInputValue) &&
                    this.dialerInputValue.indexOf(details.prev.data.prefix)) {
                    this.dialerInputValue = this.dialerInputValue.replace(details.prev.data.prefix, details.current.data.prefix);
                }
            }
        },

        _loadSortedMessages: function () {
            var messages = this._loadMessages(LibWrap.Message.type_STARTED_LIVESESSION);
            messages.concat(this._loadMessages(LibWrap.Message.type_ENDED_LIVESESSION));
            messages.sort(function (a, b) {
                return b.getIntProperty(LibWrap.PROPKEY.message_TIMESTAMP) - a.getIntProperty(LibWrap.PROPKEY.message_TIMESTAMP);
            });
            return messages;
        },

        _loadMessages: function (filter) {
            var nowTimestampInSec = (Date.now().valueOf()) / 1000;
            var msgIds = new LibWrap.VectUnsignedInt();

            lib.getMessageListByType(filter, true, msgIds, 0, nowTimestampInSec);

            var messages = [];
            for (var i = 0, len = msgIds.getCount() ; i < len ; i++) {
                var libmessage = lib.getConversationMessage(msgIds.get(i));
                if (libmessage) {
                    messages.push(libmessage);
                }
            }
            return messages;
        },

        _updateHaveRecentsCallFlag: function () {
            this.haveRecentCalls = !!this.recentCalls.length;
        },

        _sortAndLimitRecentCalls: function () {
            this.recentCalls.sort(function (a, b) {
                return b.message.timestamp - a.message.timestamp;
            });

            
            while (this.recentCalls.length > this._recentCallLimit) {
                var call = this.recentCalls.pop();
                call.dispose();
            }
            this._updateHaveRecentsCallFlag();
        },

        _handleConversationListChange: function (event) {
            var removed = !event.detail[2];
            var filter = event.detail[1];

            
            if (removed && filter !== LibWrap.Conversation.list_TYPE_LIVE_CONVERSATIONS) {
                var conversationId = event.detail[0];

                this._removeRecentCallByID(conversationId);
                this._sortAndLimitRecentCalls();
            }
        },

        _removeRecentCallByID: function (id) {
            var call;
            var itemIndex = this.recentCalls.index(function (item) {
                return item.conversation.id === id;
            });
            if (itemIndex !== -1) {
                call = this.recentCalls.splice(itemIndex, 1);
                call[0].dispose();
            }
            return call;
        },

        _onUpdateTimer: function () {
            this.recentCalls.forEach(function (i) {
                i.formatMessageFooter();
            });
        },

        _handleIncomingMessage: function (event) {
            var libmessage = lib.getConversationMessage(event.detail[0]);

            if (!libmessage) {
                return;
            }

            if ([LibWrap.Message.type_STARTED_LIVESESSION, LibWrap.Message.type_ENDED_LIVESESSION].indexOf(libmessage.getIntProperty(LibWrap.PROPKEY.message_TYPE)) !== -1) {
                var conv = lib.getConversationByConvoId(libmessage.getIntProperty(LibWrap.PROPKEY.message_CONVO_ID));
                if (conv) {
                    this._removeCallWithSameIdentity(conv.getIdentity());
                    conv.discard();
                }

                this._updateRecentCall(libmessage);
                this._sortAndLimitRecentCalls();
            }
            libmessage.discard();
        },

        _updateRecentCall: function (libmessage) {
            log('dialerVM _updateRecentCall()');

            var libconversation = lib.getConversationByConvoId(libmessage.getIntProperty(LibWrap.PROPKEY.message_CONVO_ID));

            
            var conversation = new Skype.Model.RecentCallConversation(libconversation);

            
            conversation.alive();

            
            
            conversation._updateLastMessage(libmessage);

            
            conversation.formatMessageFooter();

            this.recentCalls.push(conversation);
        },

        _removeCallWithSameIdentity: function (conversationIdentity) {
            
            var olditem = this.recentCalls.index(function (item) {
                return item.identity === conversationIdentity;
            });
            if (olditem !== -1) {
                var call = this.recentCalls.splice(olditem, 1);
                call[0].dispose();
            }
        },

        _getPartnerLiveIdentity: function (message, partnerId) {
            var result = "";
            var libMessage = lib.getConversationMessage(message.id);
            if (libMessage) {
                var body = libMessage.getStrProperty(LibWrap.PROPKEY.message_BODY_XML);
                var json = Skype.Utilities.xml2Json(body);
                var parts = json.partlist && json.partlist.part;
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (part.identity && part.identity === partnerId && part.live_identity) {
                        result = part.live_identity;
                        break;
                    }
                }
                libMessage.discard();
            }
            return result;
        },

        _statReport: function (isPstn) {
            if (isPstn) {
                Skype.Statistics.sendStats(Skype.Statistics.event.dialer_skypeOutRecents);
            } else {
                Skype.Statistics.sendStats(Skype.Statistics.event.dialer_s2sRecents);
            }
        },

        _onDispose: function () {
            while (this.recentCalls && this.recentCalls.length > 0) {
                var call = this.recentCalls.shift();
                call.dispose();
            }
        },

        _updateBalance: function () {
            this.regEventListener(lib.account, "propertychange", this._onAccountChange.bind(this));
            this._onAccountChange({ detail: [LibWrap.PROPKEY.account_SKYPEOUT_BALANCE] });
        },

        _updateActionButtonLabels: function () {
            
            if (this.canNotCall) {
                this.callButtonLabel = "aria_dialer_button".translate();
                this.smsButtonLabel = "aria_dialer_sms_button".translate();
            } else {
                this.callButtonLabel = "aria_dialer_recent_call_button".translate(this.identity);
                this.smsButtonLabel = "aria_dialer_sms_button_to_number".translate(this.identity);
            }
        },

        _updateSubscriptions: function () {
            
            var ssName = new LibWrap.VectGIString();
            var ssTime = new LibWrap.VectUnsignedInt();
            var ssStatus = new LibWrap.VectUnsignedInt();
            var ssPackage = new LibWrap.VectUnsignedInt();
            var ssService = new LibWrap.VectUnsignedInt();
            lib.account.getSubscriptionInfo(ssName, ssTime, ssStatus, ssPackage, ssService);

            var subscriptions = {
                total: ssName.getCount(),
                active: 0,
                expiring: 0,
                expired: 0
            };

            var expirationDays = 7 * 24 * 60 * 60;

            var now = Date.now().valueOf() / 1000;
            for (var i = 0; i < subscriptions.total; i++) {
                var endTime = ssTime.get(i);

                if (endTime > now) {
                    subscriptions.active += 1;
                    
                    if (endTime < now + expirationDays) {
                        subscriptions.expiring += 1;
                    }
                } else {
                    
                    if (endTime > now - expirationDays) {
                        subscriptions.expired += 1;
                    }
                }
            }

            this.activeSubscriptionLabel = this._formatSubscription("active", subscriptions["active"]);
            this.getSubscriptionLabel = subscriptions["active"] ? "" : WinJS.Resources.getString("dialer_accountinfo_getsubscription").value;
            this.expiringSubscriptionLabel = subscriptions["expiring"] ? this._formatSubscription("expiring", subscriptions["expiring"]) : "";
            this.expiredSubscriptionLabel = subscriptions["expired"] ? this._formatSubscription("expired", subscriptions["expired"]) : "";
        },

        _onAccountChange: function (event) {
            var property = event.detail[0];
            if (property === LibWrap.PROPKEY.account_SKYPEOUT_BALANCE ||
                property === LibWrap.PROPKEY.account_SKYPEOUT_BALANCE_CURRENCY ||
                property === LibWrap.PROPKEY.account_SKYPEOUT_PRECISION) {

                
                var currencyMap = {
                    EUR: '\u20AC',
                    USD: '\u0024',
                    GBP: '\u00A3',
                    JPY: '\u00A5'
                };

                var currency = lib.account.getStrProperty(LibWrap.PROPKEY.account_SKYPEOUT_BALANCE_CURRENCY);
                this.balanceAmount = lib.account.getIntProperty(LibWrap.PROPKEY.account_SKYPEOUT_BALANCE) / (Math.pow(10, lib.account.getIntProperty(LibWrap.PROPKEY.account_SKYPEOUT_PRECISION)));
                if (this.balanceAmount != 0) {
                    this.balanceAmountFormatted = Skype.Globalization.formatPrice(this.balanceAmount, currency);
                }
                this.buyCreditLabel = this.balanceAmount ? "" : WinJS.Resources.getString("dialer_accountinfo_buycredit").value;
            }
        },

        _onHistoryCleared: function (e) {
            this.dialerInputValue = "";
        },
    }, {
        
        inputIsEmergencyNumber: false,
        canNotCall: false,
        canNotSms: false,
        balanceAmount: 0,
        balanceAmountFormatted: "",
        payAsYouGoRateString: "",
        subscriptionRateString: "",
        smsButtonLabel: "aria_dialer_sms_button".translate(),
        callButtonLabel: "aria_dialer_button".translate(),
        buyCreditLabel: "",
        activeSubscriptionLabel: "",
        getSubscriptionLabel: "",
        expiringSubscriptionLabel: "",
        expiredSubscriptionLabel: "",

        hidePickEmergencyCountry: true,
        hideEmergencyCountryAllowed: true,
        hideEmergencyCountryRestricted: true,

        
        haveRecentCalls: true,

        dialerInputValue: {
            get: function () {
                return this._dialerInputValue;
            },
            set: function (value) {
                this._dialerInputValue = value;
                this._handleDialerInputChange();
            }
        },
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        Dialer: WinJS.Class.mix(dialerVm, Skype.Class.disposableMixin)
    });

}());