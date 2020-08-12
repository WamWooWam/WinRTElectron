

(function () {
    "use strict";

    var SIZE_THRESHOLD = 600;
    var EMOTICON_BASEPATH = "/images/emoticons/80/";

    var emoticonPicker = WinJS.Class.derive(Skype.UI.LazyInitializedControl, function (element, options) {
        this.element = element;
        this.element.winControl = this;
    }, {
        element: null,
        pickerElement: null,
        containerEl: null,
        generatedItemsCount: 0,
        isBig: true,
        _callBackFunction: null,
        _viewModel: null,

        lazyInitAsync: function () {
            return WinJS.UI.Fragments.render("/controls/emoticonPicker.html", this.element).then(this.init.bind(this));
        },

        init: function () {
            this.viewModel = new Skype.ViewModel.EmoticonPickerVM(this, this.options);
            WinJS.UI.processAll(this.element, true);
            WinJS.Resources.processAll(this.element);
            WinJS.Binding.processAll(this.element, this.viewModel);

            WinJS.Utilities.query("button.backbutton, div.background, div.scroll, div.container").listen("click", function (e) {
                if (e.currentTarget == e.srcElement) {
                    this.hide();
                }
            }.bind(this));

            this._control = this.element.querySelector(".emoticonsList").winControl;
            this.pickerElement = this.element.querySelector(".picker-accessWrap");
            
            this.regEventListener(window, "resize", this._handleEmoticonSize.bind(this));
            
            this.regEventListener(this.element, "keydown", this._onEscOrBackspaceHandler.bind(this));
            this.regEventListener(this._control, "iteminvoked", this.onEmoticonClick.bind(this));
            this.regEventListener(this.element, "click", this.onClick.bind(this));
        },
        
        _handleEmoticonSize: function () {
            var _isBig = window.innerWidth > SIZE_THRESHOLD;
            if (this.isBig !== _isBig) {
                this.isBig = _isBig;
                this._control.forceLayout();
            }
        },
        
        _onLazyDispose: function () {
            WinJS.Utilities.removeClass(this.element, 'VISIBLE');
        },

        onClick: function () {
            this.hide();
        },

        onEmoticonClick: function (e) {
            e.detail.itemPromise.then(function (x) {
                var token = Skype.UI.emoticonDefinitions[x.index].shortcuts[0];
                this._callBackFunction && this._callBackFunction(token);
                e.preventDefault();
                this.hide();
            }.bind(this));
        },

        _onShow: function () {
            var el = this.element;
            WinJS.UI.disableAnimations();

            WinJS.Utilities.addClass(el, 'VISIBLE');
            this.isVisible = true;

            this._control.currentItem = { "index": 0, "type": "item", "key": null, "hasFocus": false, "showFocus": false };

            this.pickerElement.winControl.enable();
            this.pickerElement.setAttribute("aria-hidden", "false");

            Skype.UI.AppBar.instance.disable();
            this._handleAriaOfElementsLower(true);
        },

        hide: function () {
            if (WinJS.Utilities.hasClass(this.element, 'VISIBLE')) {
                Skype.UI.TabConstrainer.suppressed = false;

                this.pickerElement.winControl.disable();
                this.pickerElement.setAttribute("aria-hidden", "true");

                WinJS.Utilities.removeClass(this.element, 'VISIBLE');
                this.isVisible = false;
                this._callBackFunction && this._callBackFunction("");
                this._callBackFunction = null;

                Skype.UI.AppBar.instance.enable();
                
                WinJS.UI.enableAnimations();
                this._handleAriaOfElementsLower(false);
            }
        },
        
        _handleAriaOfElementsLower: function (show) {
            
            var conversationSwitcher = document.querySelector(".conversationSwitcher.POPULATED");
            Skype.Application.state.page.defaultFocusElement.setAttribute("aria-hidden", show ? "true" : "false");
            conversationSwitcher && conversationSwitcher.setAttribute("aria-hidden", show ? "true" : "false");
        },

        _onEscOrBackspaceHandler: function (e) {
            if (e.keyCode === WinJS.Utilities.Key.escape || e.keyCode === WinJS.Utilities.Key.backspace) {
                e.stopPropagation();
                e.preventDefault();
                this.hide();
            }
        },
    },
		{
		    
		    imagePath: WinJS.Binding.converter(function (path) {
		        return EMOTICON_BASEPATH + path; 
		    }),
		    		    
		    show: function (callBack) {
		        return Skype.UI.LazyInitializedControl.initAsync(document.querySelector("#emoticonPicker")).then(
		        function (control) {
		            control._callBackFunction = callBack;
		        });
		    },
		    
		    hide: function () {
		        var control = document.querySelector("#emoticonPicker").winControl;
		        if (control && control.isVisible) {
		            control.hide();
		        }
		    },
		    
		    dispose: function () {
		        var control = document.querySelector("#emoticonPicker").winControl;
		        control && control.dispose();
		    }
		});

    WinJS.Namespace.define("Skype.UI", {
        EmoticonPicker: emoticonPicker
    });
})();

(function emoticonAriaLabelBinding() {
    "use strict";
    
    var sourcePropertyArray = ["label"];

    function emoticonAriaLabel(source, sourceProperty, dest, destProperties, value) {

        var translationKey = Skype.UI.emoticonTranslationMap[source.id];

        var o = WinJS.Binding.as({
            label: WinJS.Resources.getString(translationKey).value
        });

        
        var binding = WinJS.Binding.setAttribute(o, sourcePropertyArray, dest.parentNode, destProperties);

        
        var cancel = binding.cancel;
        binding.cancel = function () {
            cancel.call(binding);
        };

        return binding;
    }


    WinJS.Namespace.define("Skype.UI.EmoticonPicker", {
        emoticonAriaLabel: WinJS.Binding.initializer(emoticonAriaLabel)
    });

    Skype.UI.EmoticonPicker.emoticonAriaLabel.delayable = true;
})();