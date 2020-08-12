

(function () {
    "use strict";

    var DTMFS = {
            '0': LibWrap.Participant.dtmf_DTMF_0,
            '1': LibWrap.Participant.dtmf_DTMF_1,
            '2': LibWrap.Participant.dtmf_DTMF_2,
            '3': LibWrap.Participant.dtmf_DTMF_3,
            '4': LibWrap.Participant.dtmf_DTMF_4,
            '5': LibWrap.Participant.dtmf_DTMF_5,
            '6': LibWrap.Participant.dtmf_DTMF_6,
            '7': LibWrap.Participant.dtmf_DTMF_7,
            '8': LibWrap.Participant.dtmf_DTMF_8,
            '9': LibWrap.Participant.dtmf_DTMF_9,
            '*': LibWrap.Participant.dtmf_DTMF_STAR,
            '#': LibWrap.Participant.dtmf_DTMF_POUND
        },
        POINTER_UP = "pointerup",
        POINTER_DOWN = "pointerdown";

    var dialpad = Skype.UI.Control.define(
        function constructor(element) {
            return this._init();
        }, {
            
            currentKeyElm: null,
            element: null,

            _init: function () {
                return WinJS.UI.Fragments.renderCopy("/controls/dialpad.html", this.element).then(this._onReady.bind(this));
            },

            _onReady: function () {
                this._initDialpadKeys();
                WinJS.UI.processAll(this.element, true);
            },

            _initDialpadKeys: function () {
                var keys = this.element.querySelectorAll('div.numbers > button.number'),
                    key,
                    i = keys.length;

                
                this.regEventListener(this.element, "keydown", this._keyDownHandler.bind(this));

                this._dialpadKeyClickHandler = this._dialpadKeyClickHandler.bind(this);
                while (i--) {
                    key = keys[i];
                    
                    this.regEventListener(key, 'click', this._dialpadKeyClickHandler);
                    this.regEventListener(key, POINTER_DOWN, this._dialpadKeyPointerDownUpHandler); 
                    this.regEventListener(key, POINTER_UP, this._dialpadKeyPointerDownUpHandler);
                }
            },

            _dialpadKeyPointerDownUpHandler: function (evt) {
                var currentKeyElm = evt.currentTarget,
                    isUp = evt.type === POINTER_UP;

                if (isUp && this.currentKeyElm && this.currentKeyElm !== currentKeyElm) {
                    WinJS.UI.Animation.pointerUp(this.currentKeyElm.querySelector('.numberInnerCont')); 
                }
                if (!isUp) {
                    this.currentKeyElm = currentKeyElm;
                }
                WinJS.UI.Animation[isUp ? "pointerUp" : "pointerDown"](currentKeyElm.querySelector('.numberInnerCont'));
            },

            _keyDownHandler: function (evt) {
                this._dispatchKeyClickedEvent(evt.char);
            },

            _dialpadKeyClickHandler: function (evt) {
                this._dispatchKeyClickedEvent(evt.currentTarget.dataset.key);
            },

            _dispatchKeyClickedEvent: function (keyStr) {
                
                if (DTMFS[keyStr] != undefined) {
                    this.dispatchEvent(dialpad.Events.KeyClicked, { keyStr: keyStr, dtmf: DTMFS[keyStr] });
                }
            }
        }, {
            Events: {
                KeyClicked: "KeyClicked"
            }
        }
    );

    WinJS.Namespace.define("Skype.UI", {
        Dialpad: WinJS.Class.mix(dialpad, WinJS.Utilities.eventMixin)
    });
}());