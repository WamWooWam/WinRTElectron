

(function () {
    "use strict";

    var MIN_FROM_LEFT_VERTICAL = 60,
        MIN_FROM_RIGHT_VERTICAL = 10,
        LIST_SPACE = 10, LIST_PADDING = 20;

    WinJS.Namespace.define("Skype.ViewModel", {
        CountryInputVM: WinJS.Namespace._lazy(function () {

            var countryInputVM = MvvmJS.Class.define(function (viewHideProvider, options) {
                this._viewHideProvider = viewHideProvider;
                this._init(options);
            }, {
                countries: null,
                _defaultCountry: null,
                _lastSelectedCountry: null,
                _isEmergency: false,


                DIALABLE_IDENTITIES: [LibWrap.Contact.type_SKYPE, LibWrap.Contact.type_PSTN, LibWrap.Contact.type_FREE_PSTN],

                _init: function (options) {
                    this.countries = Skype.Model.CountriesRepository.cloneCountryList();
                    this.placeholder = options.placeholder ? options.placeholder.translate() : "";
                    this.maxLength = options.maxLength || 99999;
                    this.countryInputHidden = !!options.useSelect;
                    this.hidePrefix = !!options.hidePrefix;
                    this._isEmergency = options.isEmergency || false;

                    this.loadCountries = this.loadCountries.bind(this);

                    if (!options.disableAutoloadCountry) {
                        this.loadDefaultCountry();
                    }

                    if (!this.countryInputHidden) {
                        this.bind("input", function () {
                            this._updateCountrySelection();
                            this._checkIsCallable();
                        }.bind(this));
                    }
                },

                _updateDefaultCountry: function (result) {
                    try {
                        var country = JSON.parse(result.responseText);

                        if (!country.country_code) {
                            return;
                        }
                        var myCountryCode = country.country_code.toLowerCase();

                        var defaultIndex = this.countries.index(function (item) {
                            return item.code === myCountryCode;
                        });

                        if (defaultIndex == -1) {
                            return;
                        }

                        if (this.selectedCountry == this._defaultCountry) {
                            
                            this.selectedCountry = this.countries.getItem(defaultIndex);
                        }
                        this._defaultCountry = this.countries.getItem(defaultIndex);
                    } catch (ex) { }  
                },

                loadDefaultCountry: function () {
                    var myCountryCode = lib.account.getStrProperty(LibWrap.PROPKEY.contact_IPCOUNTRY);

                    var defaultIndex = this.countries.index(function (item) {
                        return item.code === myCountryCode;
                    });

                    this._defaultCountry = this.countries.getItem(defaultIndex);
                    this.selectedCountry = this._defaultCountry;

                    try {
                        WinJS.xhr({ url: countryInputVM.COUNTRY_CODE_URL }).then(this._updateDefaultCountry.bind(this), function () { });  
                    } catch (ex) { }                                                                                                       
                },

                _getMaxCountryListItemWidth: function () {
                    var maxWidth,
                        dummyDiv = document.createElement("div"),
                        maxName = '',
                        maxNameLen = 0,
                        curName,
                        curNameLen;
                    dummyDiv.style.visibility = "hidden";
                    dummyDiv.style.position = "absolute";
                    for (var i = 0, len = this.countries.length; i < len; i++) {
                        curName = this.countries.getItem(i).data.name;
                        curNameLen = curName.length;
                        if (curNameLen > maxNameLen) {
                            maxName = curName;
                            maxNameLen = curNameLen;
                        }
                    }
                    dummyDiv.innerHTML = maxName; 
                    document.body.appendChild(dummyDiv);
                    maxWidth = dummyDiv.offsetWidth;

                    Skype.UI.Util.removeFromDOM(dummyDiv);

                    return maxWidth + 160;
                },

                _checkIsCallable: function () {
                    this.isInputCallable = this._isCallable();
                },

                _isCallable: function () {
                    if (!this.input) {
                        return false;
                    }
                    
                    var contactType = lib.getContactType(this.input);

                    if (contactType === LibWrap.Contact.type_EMERGENCY_PSTN) {
                        return false;
                    }
                    var identity = Skype.Lib.getIdentityForCountryCode(this.input, this.country ? this.country.data.prefix : null);
                    var validIdentity = Skype.Lib.validIdentity(identity);
                    contactType = lib.getContactType(identity);

                    if (!validIdentity || !this.DIALABLE_IDENTITIES.contains(contactType)) {
                        return false;
                    }
                    return true;
                },

                _updateCountrySelection: function () {
                    if (this.input === "") {
                        this.selectedCountry = this._lastSelectedCountry || this._defaultCountry;
                        return;
                    }
                    if (!Skype.Lib.numberStartsWithPrefix(this.input)) {
                        return;
                    }

                    var selectedIndex = Skype.Lib.identifyCountryCode(this.input, this.countries);
                    this.selectedCountry = selectedIndex != -1 ? this.countries.getItem(selectedIndex) : null;
                },

                resetValues: function () {
                    this.input = "";
                    this.selectedCountry = this._lastSelectedCountry = this._defaultCountry;
                },

                _setCountrySelection: function (country) {
                    if (!this.countriesData) {
                        return;
                    }
                    if (country) {
                        this.countriesData.selectSingleItem(country);
                    } else {
                        this.countriesData.clearSelection();
                    }
                },

                _setCountryName: function (country) {
                    if (Skype.Globalization.isRightToLeft()) {
                        this.countryName = country ? (country.data.name + " " + country.data.prefix + " +") : "countrysel_select_country".translate();
                    } else {
                        this.countryName = country ? (country.data.name + " +" + country.data.prefix) : "countrysel_select_country".translate();
                    }
                },

                _setAriaCountryNameLabel: function (countryName) {
                    this.ariaCountryNameLabel = "aria_add_number_dialog_country_selected".translate(countryName);
                    if (this._isEmergency) {
                        this.ariaEmergencyCountryNameLabel = this.country ? "dialer_emergency_country_selected".translate(countryName) : "dialer_no_emergency_country_selected".translate();
                    } else {
                        this.ariaEmergencyCountryNameLabel = this.countryName;
                    }
                },

                loadCountries: function () {
                    if (!this.countriesData) {
                        this.countriesData = Skype.Model.CountriesRepository.cloneCountryList();
                        this.countriesData.bind("selection", this.onLanguageSelected.bind(this));
                        this._setCountrySelection(this.country);
                    }
                },

                _replaceInputPrefix: function (prefix) {
                    if (Skype.Lib.numberStartsWithPrefix(this.input) && this.country && prefix &&
                        this.country.data && this.input.indexOf(this.country.data.prefix)) {
                        this.input = this.input.replace(this.country.data.prefix, prefix);
                    }
                },

                _calculateListHeight: function (bodyHeight, isShowingKeyboard) {
                    return isShowingKeyboard ? (bodyHeight - 2 * LIST_PADDING - LIST_SPACE - Skype.Application.state.keyboardOccludedRectangle.height) + "px" : "";
                },

                _setListOffset: function (listPosition, putLeft, leftShift, rightShift, isRTL) {
                    if (isRTL) {
                        listPosition.marginRight = putLeft ? rightShift : leftShift;
                    } else {
                        listPosition.marginLeft = putLeft ? leftShift : rightShift;
                    }
                },

                _calculateListPositionForInputControl: function (bodyWidth, preferedListWidth, isRTL, left, right, rightSpace) {
                    var leftSpace = left - LIST_SPACE,
                        fitLeft = leftSpace >= preferedListWidth,
                        fitRight = rightSpace >= preferedListWidth,
                        parentWidth = right - left,
                        listPosition = { marginRight: "", marginLeft: "" };

                    rightSpace = rightSpace - LIST_SPACE;
                    var frontShift = parentWidth + "px";
                    var backShift = "-" + preferedListWidth + "px";

                    if (fitLeft || fitRight) {
                        this._setListOffset(listPosition, fitLeft, backShift, frontShift, isRTL);
                        listPosition.width = preferedListWidth + "px";
                    } else {
                        var newWidth = (isRTL ? Math.max(rightSpace, right - LIST_SPACE) : Math.max(leftSpace, bodyWidth - left - LIST_SPACE)) + "px";
                        var putLeft = isRTL ? right - LIST_SPACE > rightSpace : leftSpace > bodyWidth - left - LIST_SPACE;

                        this._setListOffset(listPosition, putLeft, "-" + newWidth, "0px", isRTL);
                        listPosition.width = newWidth;
                    }

                    return listPosition;
                },

                _setSelectListOffset: function (minSpaceLeft, minSpaceRight, bodyWidth, preferedListWidth, parentWidth, canFitBack, property) {
                    var shift = minSpaceLeft < MIN_FROM_LEFT_VERTICAL ? MIN_FROM_LEFT_VERTICAL - minSpaceLeft : 0;
                    var maxWidth = bodyWidth - minSpaceLeft - shift - MIN_FROM_RIGHT_VERTICAL;
                    var listPosition = { marginRight: "", marginLeft: "" };

                    if (canFitBack) {
                        listPosition[property] = "-" + (preferedListWidth - parentWidth + (minSpaceRight < MIN_FROM_RIGHT_VERTICAL ? MIN_FROM_RIGHT_VERTICAL - minSpaceRight : 0)) + "px";
                        maxWidth = preferedListWidth;
                    } else {
                        listPosition[property] = shift + "px";
                    }
                    listPosition.width = Math.min(preferedListWidth, maxWidth) + "px";
                    return listPosition;
                },

                _calculateListPositionForSelectControl: function (bodyWidth, preferedListWidth, isRTL, left, right, rightSpace) {
                    var leftSpace = left,
                        fitLeft = right >= preferedListWidth,
                        fitRight = bodyWidth - left >= preferedListWidth,
                        parentWidth = right - left;

                    if (isRTL) {
                        return this._setSelectListOffset(rightSpace, left, bodyWidth, preferedListWidth, parentWidth, !fitLeft && fitRight, "marginRight");
                    } else {
                        return this._setSelectListOffset(leftSpace, rightSpace, bodyWidth, preferedListWidth, parentWidth, fitLeft && !fitRight, "marginLeft");
                    }
                },

                

                calculateListSizeAndPosition: function (isRTL, bodyWidth, bodyHeight, parentPos, isInputControl) {
                    var preferedListWidth = this._getMaxCountryListItemWidth(),
                        left = parseInt(parentPos.left),
                        right = left + parseInt(parentPos.width),
                        rightSpace = bodyWidth - right;

                    var listSizeAndPosition;

                    if (isInputControl) {
                        
                        
                        
                        listSizeAndPosition = this._calculateListPositionForInputControl(bodyWidth, preferedListWidth, isRTL, left, right, rightSpace);
                    } else {
                        
                        
                        listSizeAndPosition = this._calculateListPositionForSelectControl(bodyWidth, preferedListWidth, isRTL, left, right, rightSpace);
                    }
                    listSizeAndPosition.height = this._calculateListHeight(bodyHeight, Skype.Application.state.isShowingKeyboard);

                    return listSizeAndPosition;
                },

                onHide: function () {
                    this._viewHideProvider.onHide();
                },

                onLanguageSelected: function (items) {
                    if (items.length != 1) {
                        return; 
                    }
                    if (items[0] && this.country && this.country.data.code === items[0].data.code) {
                        return;
                    }

                    if (items[0] && items[0].data) {
                        this.dispatchEvent(countryInputVM.Events.CountryLanguageSelected, { source: this.element, prev: this.country, current: items[0] });
                        this._replaceInputPrefix(items[0].data.prefix);
                    }

                    this.selectedCountry = items[0];
                    this._lastSelectedCountry = items[0] || this._lastSelectedCountry;
                },

                selectCountryByInput: function (input) {
                    this.input = input;
                    this._updateCountrySelection();
                },

                selectCountryByCode: function (countryCode) {
                    var index = this.countries.index(function (item) {
                        return item.code === countryCode;
                    });
                    var country = this.countries.getItem(index);
                    if (!this.country || !country || country.data.code !== this.country.data.code) {
                        this.selectedCountry = country; 
                    }
                },

                
                selectedCountry: {
                    get: function () {
                        return this.country;
                    },
                    set: function (country) {
                        this.country = country;
                        this._setCountrySelection(country);
                        this._setCountryName(country);
                        this.countryCode = country ? ("+" + country.data.prefix) : "";
                        this._setAriaCountryNameLabel(this.countryName);
                    }
                },
            }, {
                input: "",
                placeholder: "",
                country: null,
                countriesData: null,
                maxLength: 99999,
                isInputCallable: true,
                countryInputHidden: false,
                countryName: "",
                countryCode: "",
                ariaCountryNameLabel: "",
                ariaEmergencyCountryNameLabel: "",
                hidePrefix: false
            }, {
                Events: {
                    CountryLanguageSelected: "CountryLanguageSelected",
                },

                COUNTRY_CODE_URL: "https://apps.skype.com/countrycode"
            });

            countryInputVM = WinJS.Class.mix(countryInputVM, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin);

            return countryInputVM;
        })
});

}());

