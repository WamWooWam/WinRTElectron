

(function () {
    "use strict";

    var videoMessage = Skype.UI.Control.define(function (element) {
        this.element = element;
        
    }, {
        initialized: false,
        viewModel: null,
        element: null,
        activeElement: null,

        _onReady: function () {
            if (this.isDisposed) {
                return WinJS.Promise.as();
            }

            
            this._handlePointerEvent = this._handlePointerEvent.bind(this);
            this.activeElement = this.element.querySelector('div.preview');
            this.regEventListener(this.activeElement, "pointerdown", this._handlePointerEvent);
            this.regEventListener(this.activeElement, "pointerup", this._handlePointerEvent);
            this.regEventListener(this.activeElement, "click", this._handlePointerEvent);
            this.regEventListener(this.activeElement, "pointerout", this._handlePointerEvent);
            this.regEventListener(this.element, "focus", this._onContainerFocused.bind(this));

            WinJS.Utilities.addClass(this.activeElement, "kb-accessible");

            WinJS.Resources.processAll(this.element);
            return WinJS.Binding.processAll(this.element, this.viewModel).then(function () {
                roboSky.write("conversation,videomessage,ready");
            });
        },

        _onContainerFocused: function () {
            this.activeElement.focus();
        },

        _handlePointerEvent: function (evt) {
            
            if (this.viewModel.formattedStatus === "UPLOADED") {
                switch (evt.type) {
                    case "pointerdown":
                        WinJS.UI.Animation['pointerDown'](this.activeElement);
                        break;
                    case "click":
                        this.viewModel.playback();
                        break;
                    case "pointerout":
                    case "pointerup":
                        WinJS.UI.Animation['pointerUp'](this.activeElement);
                        break;
                }
            }
        },

        

        init: function () {
            if (!this.initialized) {
                this.initialized = true;
                this.regImmediate(function () {
                    log('VideoMessage init()');
                    this._libMessage.getVideoMessageAsync().then(function (vim) {
                        if (this.isDisposed) {
                            return;
                        }

                        this.vMwrapper = new Skype.Model.VideoMessage(vim);
                        this.initViewModel(this.vMwrapper);
                        this._render();
                    }.bind(this));
                }.bind(this));
            }
        },

        _render: function () {
            WinJS.UI.Fragments.renderCopy("/controls/videoMessage.html", this.element).then(this._onReady.bind(this));
        },

        initViewModel: function (wrapper) {
            this.viewModel = new Skype.ViewModel.VideoMessageVM(wrapper);
        },

        libMsgId: {
            set: function (value) {
                if (value) {
                    this._libMessage = lib.getConversationMessage(value);
                }
            }
        },

    });

    WinJS.Namespace.define("Skype.UI", {
        VideoMessage: videoMessage
    });
})();
