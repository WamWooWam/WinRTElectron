

///<disable>JS3045.MissingInputFile</disable>



(function () {
    "use strict";

    Skype.UI.Page.define("/pages/dialer.html", "div.dialer.fragment", {
        useOneInstance: true,

        init: function () {
            log("dialer page init()");

            this._renderFinishedSignals = {
                "default": new WinJS._Signal(),
            };
        },
        _inputCaretPosition: null,

        _initDone: false,

        onReady: function () {
            this._onReadyLazyPart = this._onReadyLazyPart.bind(this);
            
            this._recentsList = this.element.querySelector('div.categoryContainer.recents div.recentsList');
            this._dialerInput = this.element.querySelector("div.dialerInputContainer input");
            this._countrySelect = this.element.querySelector("div.countrySelectorContainer div.countryInput");
            this._callButton = this.element.querySelector("div.actionButtons div.call");
            this._smsButton = this.element.querySelector("div.actionButtons div.sms");
            this._creditBtn = this.element.querySelector("div.item.balance div.balance");
            this._subscriptionBtn = this.element.querySelector("div.item.subscriptions div.balance");
            var emergencyCountrySelect = this.element.querySelector("div.categoryContainer.emergencyCall div.emergencyCountry");
            
            var countrySelectControl = new Skype.UI.CountryInput(this._countrySelect, { useSelect: true, ownHider: true });
            var countrySelectVm = countrySelectControl.getViewModel();
                        
            var emergencyCountryControl = new Skype.UI.CountryInput(emergencyCountrySelect, { useSelect: true, ownHider: true, disableAutoloadCountry: true, hidePrefix: true, isEmergency: true });            
            var emergencyCountryVm = emergencyCountryControl.getViewModel();
                        
            this._initViewModel(countrySelectVm, emergencyCountryVm);
            
            this.regEventListener(this.element.querySelector("button.backbutton"), 'click', Skype.UI.navigateBack);
            this.regImmediate(this._onReadyLazyPart);
        },

        _onReadyLazyPart: function () {
            var numbersEls = this.element.querySelectorAll("div.numbers div.number");

            
            this.regEventListener(this._dialerInput, "focus", this._handleDialerInputFocus.bind(this));
            this.regEventListener(this._dialerInput, "blur", this._handleDialerInputBlur.bind(this));
            this.regEventListener(this._dialerInput, "keydown", this._handleDialerInputTrackEnter.bind(this));

            for (var i = 0, len = numbersEls.length; i < len; i++) {
                this._registerNumber(numbersEls[i], numbersEls[i].getAttribute("data-key"));
            }

            this.regEventListener(this._callButton, 'click', this._onCallClicked.bind(this));
            this.regEventListener(this._callButton, 'keydown', this._onCallClicked.bind(this));
            this.regEventListener(this._smsButton, 'click', this._onSmsClicked.bind(this));
            this.regEventListener(this._smsButton, 'keydown', this._onSmsClicked.bind(this));
            this.regEventListener(this._creditBtn, 'click', this._onCreditClicked.bind(this));
            this.regEventListener(this._subscriptionBtn, 'click', this._onSubscriptionClicked.bind(this));
            this.regEventListener(this._creditBtn.parentElement, 'keydown', this._onCreditClicked.bind(this));
            this.regEventListener(this._subscriptionBtn.parentElement, 'keydown', this._onSubscriptionClicked.bind(this));
            this._initRecentCalls();
            WinJS.Binding.processAll(this.element, this.dialerVM);
            this._renderFinishedSignals["default"].complete();
            
            this.regImmediate(this.dialerVM.loadRecentCalls.bind(this.dialerVM));
        },

        _initRecentCalls: function () {
            this._recentsList.setAttribute('data-win-control', this._recentsList.getAttribute('data-lazy-win-control'));
            WinJS.UI.processAll(this._recentsList);
            this.recents = this._recentsList.winControl;

            this.regEventListener(this.recents, 'iteminvoked', this._onItemClicked.bind(this));
            Skype.UI.Util.preventTextLinks(this._recentsList);
            this.regBind(Skype.Application.state.view, "size", this._updateRecentCallsCount.bind(this));
        },

        _initViewModel: function (countrySelectVm, emergencyCountryVm) {
            this.dialerVM = new Skype.ViewModel.Dialer();            
            this.dialerVM.init(countrySelectVm, emergencyCountryVm);            
        },

        onShow: function (options) {
            if (options && options.number) {
                this.dialerVM.dialerInputValue = options.number;
            }
            
            this.recents && this.recents.forceLayout();
        },

        _updateRecentCallsCount: function (oldValue, resizingValue) {
            var resizing = !!resizingValue;
            if (resizing) {
                WinJS.UI.disableAnimations();
                var scheduler = WinJS.Utilities.Scheduler;
                scheduler.schedule(function () {
                    WinJS.UI.enableAnimations();
                }, scheduler.Priority.idle, null, "Skype.UI.Dialer._relayout");
            }

            this._relayout();

            if (this._recentsList) {
                var itemHeight = 110;
                var headerSize = 236;

                var maxSize = Skype.Application.state.view.isPortrait ? Skype.Application.state.view.size.width : Skype.Application.state.view.size.height;
                var count = Math.floor((maxSize - headerSize) / itemHeight);
                this.dialerVM.updateRecentCallLimit(count * 2);
            }
        },

        _relayout: function () {
            if (this.recents) {
                var itemWidth = 300;
                var needToSwitchLayout;
                var numberOfColumns = Skype.Application.state.view.size.width / itemWidth;
                if (numberOfColumns < 2) {
                    needToSwitchLayout = !(this.recents.layout instanceof WinJS.UI.ListLayout);
                    if (needToSwitchLayout) {
                        this.recents.layout = new WinJS.UI.ListLayout();
                    }
                    return;
                }

                needToSwitchLayout = !(this.recents.layout instanceof WinJS.UI.GridLayout);
                var orientation = Skype.Application.state.view.orientation;
                if (needToSwitchLayout) {
                    this.recents.layout = new WinJS.UI.GridLayout({
                        orientation: orientation
                    });
                } else {
                    this.recents.layout.orientation = orientation;
                }
            }
        },

        _registerNumber: function (cont, numb) {
            this.regEventListener(cont, "pointerdown", this._handleKey.bind(this));
            this.regEventListener(cont, "pointerup", this._handleKey.bind(this));
            this.regEventListener(cont, "click", this._handleKey.bind(this));
            this.regEventListener(cont, "keydown", this._handleKey.bind(this));
            if (numb === "0") { 
                this.regEventListener(cont, "MSGestureHold", this._handleKey.bind(this));
            }
        },

        _onCreditClicked: function (e) {
            if (e.type === "keydown" && e.keyCode != WinJS.Utilities.Key.enter) {
                
                return;
            }

            if (!WinJS.Utilities.hasClass(this._creditBtn, "disabled")) {
                WinJS.Utilities.addClass(this._creditBtn, "disabled");

                this.regPromise(Skype.SSOTokenRequestManager.instance.requestTokenAsync())
                   .then(function success(token) {
                       WinJS.Utilities.removeClass(this._creditBtn, "disabled");

                       var url = Skype.SSOTokenRequestManager.getSSOUrlWithGoLink(token, "store.buy.credit") + "&" + Skype.UI.Util.getTrackingParam("go-store-buy-credit");
                       Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri(url));
                   }.bind(this), 
                   function error() {
                       WinJS.Utilities.removeClass(this._creditBtn, "disabled");
                       Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri("https://www.skype.com/go/store.buy.credit"));
                   }.bind(this));
            }
        },

        _onSubscriptionClicked: function (e) {
            if (e.type === "keydown" && e.keyCode != WinJS.Utilities.Key.enter) {
                
                return;
            }
            if (!WinJS.Utilities.hasClass(this._subscriptionBtn, "disabled")) {
                WinJS.Utilities.addClass(this._subscriptionBtn, "disabled");

                var hasSubs = WinJS.Utilities.query("div.item.subscriptions div.balance", this.element).hasClass("ACTIVE");

                this.regPromise(Skype.SSOTokenRequestManager.instance.requestTokenAsync())
                   .then(function success(token) {
                       WinJS.Utilities.removeClass(this._subscriptionBtn, "disabled");

                       var url;
                       if (hasSubs) {
                           url = Skype.SSOTokenRequestManager.getSSOUrlWithGoLink(token, "myaccount") + "&" + Skype.UI.Util.getTrackingParam("go-my-account");
                       } else {
                           url = Skype.SSOTokenRequestManager.getSSOUrlWithGoLink(token, "subs") + "&" + Skype.UI.Util.getTrackingParam("go-store-buy-subs");
                       }

                       Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri(url));
                   }.bind(this),
                   function error() {
                       WinJS.Utilities.removeClass(this._subscriptionBtn, "disabled");

                       if (hasSubs) {
                           Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri("https://www.skype.com/go/myaccount"));
                       } else {
                           Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri("https://www.skype.com/go/subs"));
                       }
                   }.bind(this));
            }
        },

        _onItemClicked: function (evt) {
            this.dialerVM.recentItemClicked(evt.detail.itemIndex, evt.srcElement.querySelector(".buttonFrame > div.call:hover, .buttonFrame > div.call:active"));
        },

        
        
        

        _getInputCaretPosition: function () {
            if (this._dialerInput.selectionStart || this._dialerInput.selectionStart == '0') {
                return this._dialerInput.selectionStart;
            }
            return 0;
        },

        _clearInputSelection: function () {
            if (this._dialerInput.selectionStart < this._dialerInput.selectionEnd) {
                this._inputCaretPosition = this._dialerInput.selectionStart;
                this.dialerVM.dialerInputValue = this.dialerVM.dialerInputValue.substring(0, this._dialerInput.selectionStart) + this.dialerVM.dialerInputValue.substring(this._dialerInput.selectionEnd, this.dialerVM.dialerInputValue.length);
            }
        },

        _updateCaretPosition: function () {
            this._inputCaretPosition = this._getInputCaretPosition();
        },

        _insertKeyIntoNumber: function (key) {
            var returnString = '';
            this._clearInputSelection();

            if (this._inputCaretPosition === null) {
                returnString = key;
            } else if (this._inputCaretPosition > 0) {
                returnString = this.dialerVM.dialerInputValue.substring(0, this._inputCaretPosition) + key + this.dialerVM.dialerInputValue.substring(this._inputCaretPosition, this.dialerVM.dialerInputValue.length);
            } else {
                returnString = key + this.dialerVM.dialerInputValue;
            }

            this._inputCaretPosition++;
            return returnString;
        },

        _handleKey: function (evt) {
            var el = evt.currentTarget && evt.currentTarget.firstChild;
            var key = evt.currentTarget.getAttribute("data-key");

            switch (evt.type) {
                case "pointerdown":
                    Skype.UI.Util.getGestureObjectForEvent(evt).addPointer(evt.pointerId);
                    WinJS.UI.Animation['pointerDown'](el);
                    break;
                case "click":
                    if (!this._preventClick) { 
                        this.dialerVM.dialerInputValue = this._insertKeyIntoNumber(key);
                    }
                    this._preventClick = false;
                    break;
                case "MSGestureHold":
                    if (evt.detail === 1 && key === "0") {
                        this._preventClick = true;
                        this.dialerVM.dialerInputValue = this._insertKeyIntoNumber('+');
                    }
                    break;
                case "pointerup":
                    WinJS.UI.Animation['pointerUp'](el);
                    break;
                case "keydown":
                    if (evt.keyCode === WinJS.Utilities.Key.enter || evt.keyCode === WinJS.Utilities.Key.space) {
                        this.dialerVM.dialerInputValue = this._insertKeyIntoNumber(key);
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                    break;
            }
        },

        _onSmsClicked: function (e) {
            if (this.dialerVM.canNotSms || (e.type === "keydown" && e.keyCode !== WinJS.Utilities.Key.space)) {
                return;
            }
            var identity = this.dialerVM.identity;

            Actions.invoke("sms", [identity]);
        },

        _onCallClicked: function (e) {
            if (this.dialerVM.canNotCall || (e.type === "keydown" && e.keyCode !== WinJS.Utilities.Key.space && e.keyCode !== WinJS.Utilities.Key.enter)) {
                return;
            }
            
            var identity = this.dialerVM.identity;

            Actions.invoke("callPhone", [identity]);

            Skype.Statistics.sendStats(Skype.Statistics.event.dialer_skypeOutDialed);
        },

        _handleDialerInputBlur: function (event) {
            this._updateCaretPosition();
        },

        _handleDialerInputTrackEnter: function (event) {
            
            if (event.keyCode === WinJS.Utilities.Key.enter) {
                this._onCallClicked(event);
            }
        },          

        _handleDialerInputFocus: function (event) {
            var viewport = this.element.querySelector(".viewport");
            var propertyToSet = Skype.Application.state.view.orientation === WinJS.UI.Orientation.vertical ? "scrollTop" : "scrollLeft";
            viewport[propertyToSet] = 0;
        },       
    });

}());
