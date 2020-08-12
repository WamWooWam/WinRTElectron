

(function () {
    "use strict";

    var countryInput = Skype.UI.Control.define(function () {
        this.init();
    }, {
        viewModel: null,
        countryListEl: null,
        countryNameCont: null,
        imageActionElement: null,
        hiderClass: null,
        isInputControl: true,
        countryInputClickHider: null,
        _countryInputcontainer: null,
        ownHider: false,
        INPUT_CLICK_AREA_WIDTH: 40,

        init: function() {
            log('CountryInput control init()');
            this.element.setAttribute("data-win-control", "Skype.UI.CountryInput");
            this.element.winControl = this;
            this.hiderClass = this.options.hiderClass;
            this.isInputControl = !this.options.useSelect;
            this.ownHider = this.options.ownHider;

            this.countryListOpen = false;

            this._collapse = this._collapse.bind(this);

            this.viewModel = new Skype.ViewModel.CountryInputVM(this, this.options);

            WinJS.UI.Fragments.renderCopy("/controls/countryInput.html", this.element).then(this.onReady.bind(this));
        },

        onReady: function() {
            WinJS.UI.processAll(this.element, true);
            this._countryInputcontainer = this.element.querySelector("div.countryInputcontainer");

            WinJS.Binding.processAll(this._countryInputcontainer, this.viewModel);

            this.countryNameCont = this._countryInputcontainer.querySelector("a.countryNameCont");
            this.imageActionElement = this._countryInputcontainer.querySelector("button.imageActionElement");
            this.regEventListener(this.imageActionElement, "click", this._onActionClicked.bind(this));
            !this.isInputControl && this.regEventListener(this.countryNameCont, "click", this._onActionClicked.bind(this));

            this.countryListEl = this._countryInputcontainer.querySelector("div.countriesList");
            var inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();

            this.countryNameCont.tabIndex = this.element.tabIndex;
            this.element.removeAttribute("tabIndex");

            this.regEventListener(this.element, "iteminvoked", this._onLanguageSelected.bind(this));
            this.regEventListener(window, 'resize', this._onResize.bind(this));
            this.regEventListener(inputPane, "showing", this._onKeyboardShow.bind(this));
            this.regEventListener(inputPane, "hiding", this._onKeyboardHide.bind(this));

            Skype.UI.Util.disableElementAnimation(this.countryListEl, this);

            this.regEventListener(this.countryListEl, "keydown", this._handleKeyDown.bind(this));

            if (this.hiderClass) {
                var listHider = this._getParentHider();
                listHider && this.regEventListener(listHider, "click", this._collapse);
            }
            if (this.ownHider) {
                this.countryInputClickHider = document.createElement("div");
                WinJS.Utilities.addClass(this.countryInputClickHider, "countryInputClickHider");
                this.regEventListener(this.countryInputClickHider, "click", this._clickEaterClicked.bind(this));
                this.regEventListener(window, 'blur', this._collapse);
            }
            this._onResize();
        },

        _clickEaterClicked: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this._collapse();
        },

        _handleKeyDown: function(e) {
            
            if ((e.keyCode === WinJS.Utilities.Key.backspace || e.keyCode === WinJS.Utilities.Key.escape || e.keyCode === WinJS.Utilities.Key.tab) && this.countryListOpen) {
                this._collapse();
                if (e.keyCode === WinJS.Utilities.Key.tab) {
                    e.stopPropagation();  
                    e.preventDefault();
                }
            }
        },

        _getParentHider: function () {
            var el = this.element.parentNode;
            while (this.hiderClass && el) {
                if (WinJS.Utilities.hasClass(el, this.hiderClass)) {
                    return el;
                }
                el = el.parentNode;
            }
            return null;
        },

        _onKeyboardShow: function (e) {
            e.ensuredFocusedElementInView = true; 
        },

        _onKeyboardHide: function () {
            this._onResize(); 
        },

        _onLanguageSelected: function () {
            this._collapse();
        },

        _onActionClicked: function (evt) {
            this._expand();
            evt.stopPropagation();
        },

        
        
        
        

        _checkListPosition: function () {
            if (!this.countryListEl) {
                return;
            }

            var parentPos = WinJS.Utilities.getPosition(this.element);

            var listSizeAndPosition = this.viewModel.calculateListSizeAndPosition(Skype.Globalization.isRightToLeft(),
                                        window.innerWidth, window.innerHeight,
                                        parentPos, this.isInputControl);

            this.countryListEl.style.marginLeft = listSizeAndPosition.marginLeft;
            this.countryListEl.style.marginRight = listSizeAndPosition.marginRight;
            this.countryListEl.style.height = listSizeAndPosition.height;
            this.countryListEl.style.width = listSizeAndPosition.width;
        },

        _expand: function () {
            if (!this.countryListEl) {
                return; 
            }
            if (this.countryListOpen) {
                this._collapse();
                return;
            }

            this._checkListPosition();
            this.countryInputClickHider && document.body.appendChild(this.countryInputClickHider);

            WinJS.Utilities.addClass(this.countryListEl, 'VISIBLE');
            
            this.countryListEl.style.visibility = "visible";
            this.countryListEl.style.opacity = 1;
            WinJS.UI.Animation.showPopup(this.countryListEl).done( function() {
                this.countryListEl.focus();
            }.bind(this));

            this.countryListEl.winControl.forceLayout(); 
            this.viewModel.loadCountries();
            this.countryListOpen = true;
        },

        _onResize: function () {
            if (this.countryListOpen) {
                this._checkListPosition();
            }
        },

        removeHider: function () {
            var hider = document.body.querySelector("div.countryInputClickHider");
            if (hider) {
                Skype.UI.Util.removeFromDOM(hider);
            }
        },

        _collapse: function () {
            var that = this;
            if (this.countryListOpen) {
                that.countryListOpen = false; 
                if (this.countryListEl) {
                    this.countryListEl.style.opacity = 0;
                    if (WinJS.Utilities.hasClass(this.countryNameCont, "HIDDEN")) {
                        this.imageActionElement.focus(); 
                    } else {
                        this.countryNameCont.focus(); 
                    }
                    WinJS.UI.Animation.hidePopup(this.countryListEl).done(function countryListElHidePopupAnimCallback() {
                        WinJS.Utilities.removeClass(that.countryListEl, 'VISIBLE');
                    });
                }
                this.removeHider();
            }
        },

        onHide: function () {
            this._collapse();
        },

        _onDispose: function () {
            this.removeHider();
        },

        getViewModel: function () {
            return this.viewModel;
        },

    });

    WinJS.Namespace.define("Skype.UI", {
        CountryInput: WinJS.Class.mix(countryInput, WinJS.Utilities.eventMixin)
    });
})();
