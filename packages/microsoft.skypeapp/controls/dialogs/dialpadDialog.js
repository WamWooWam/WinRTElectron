


(function () {
    "use strict";

    var dialpadDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "dialpadDialog";
        this._dialPadHistoryChanged = this._dialPadHistoryChanged.bind(this);
    }, {
        _conversation: null,
        _currentDialpadVM: null,
        MAX_NUMBER_SIZE: 19,

        _onDialpadKeyClicked: function (event) {
            if (event.detail && event.detail.dtmf !== "undefined" && event.detail.keyStr) {
                var curHistStr = this._currentDialpadVM.dialpadHistoryStr;
                this._currentDialpadVM.dialpadHistoryStr = (curHistStr.length < this.MAX_NUMBER_SIZE ? curHistStr : curHistStr.slice(1)) + event.detail.keyStr;
                this._conversation.sendDTMF(event.detail.dtmf, 260);
            }
        },

        keyPress: function (e) {
            
            if (e.keyCode === WinJS.Utilities.Key.backspace) {
                e.preventDefault();
                this.setResultAndHide(true);
            }
        },

        onHide: function () {
            this._replaceBinds(this._currentDialpadVM, this.vm);

            
            this._element.querySelector(".dialpad-accessWrap").winControl.disable();
            this._completeCallback();
        },

        onShow: function (conversation, dialpadVM) {            
            this._replaceBinds(this.vm, dialpadVM);        
            this._conversation = conversation;            
        },
        
        onAfterShow: function() {
            this._element.querySelector(".dialpad-accessWrap").winControl.enable();
        },

        _replaceBinds: function(oldBinding, newBinding) {
            this.unregBind(oldBinding, "dialpadHistoryStr", this._dialPadHistoryChanged);
            this._currentDialpadVM = newBinding;
            this.regBind(newBinding, "dialpadHistoryStr", this._dialPadHistoryChanged);
        },
        
        _dialPadHistoryChanged: function() {
            if (!this._historyDiv) {
                this._historyDiv = this._element.querySelector("div.toneHistory div.inner");
            }
            this._historyDiv.innerText = this._currentDialpadVM.dialpadHistoryStr;
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                dialpadHistoryStr: ""
            });
            this.regEventListener(this._element.querySelector("div.dialpadKeys").winControl,
                Skype.UI.Dialpad.Events.KeyClicked, this._onDialpadKeyClicked.bind(this));
        }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        DialpadDialog: dialpadDialog
    });
})();