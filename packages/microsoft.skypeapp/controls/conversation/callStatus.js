

(function (Skype) {
    "use strict";

    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.UI.Conversation.CallStatus");

    var callStatus = Skype.UI.Control.define(function () {
        this.initPromise = new WinJS.Promise(function () { });
    }, {
        
        _viewModel: null,
        initPromise: null,

        _onReady: function (conversationWrapper, isInPreLive, conversationSharedState) {
            this._viewModel = new Skype.ViewModel.CallStatusVM(conversationWrapper, isInPreLive, conversationSharedState);

            WinJS.Binding.processAll(this.element, this._viewModel).then(function () {
                this._viewModel.init();
                this.initPromise.complete();
            }.bind(this));
        },

        _containsElementByClassName: function (element) {
            if (!element) {
                return false;
            }

            return WinJS.Utilities.hasClass(element, "camera") || WinJS.Utilities.hasClass(element, "mute") || WinJS.Utilities.hasClass(element, "hangUp") || WinJS.Utilities.hasClass(element, "contextualMenu") || WinJS.Utilities.hasClass(element, "backbutton");
        },

        
        render: function (conversationWrapper, isInPreLive, conversationSharedState) {
            return WinJS.UI.Fragments.renderCopy("/controls/conversation/callStatus.html", this.element).then(this._onReady.bind(this, conversationWrapper, isInPreLive, conversationSharedState));
        },

        onNumberOfLiveParticipantsChanged: WinJS.Promise.async(function (number) {
            this._viewModel.onNumberOfLiveParticipantsChanged(number);
        }),

        setVisible: WinJS.Promise.async(function (visible) {
            this._viewModel.setVisible(visible);

            var activeElement = document.activeElement;
            if (!visible) {
                

                if (activeElement && this._containsElementByClassName(activeElement)) {
                    this.lastSelected = document.activeElement;
                }
            } else {
                if (this._containsElementByClassName(activeElement)) {
                    this.regImmediate(function () {
                        this.lastSelected && this.lastSelected.focus();
                    }.bind(this));
                }
            }
        }),
    });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        CallStatus: WinJS.Class.mix(callStatus, Skype.Model.hierarchicalMixin)
    });

})(Skype);