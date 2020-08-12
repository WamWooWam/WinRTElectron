

(function () {
    "use strict";

    var sidePanelAnimOffset = {
        top: "0px",
        left: "-100%",
        rtlflip: true
    };

    var conversationRingingPanel = Skype.UI.Control.define(
        function constructor() {
        }, {
            _callingAnimationControl: null,
            _viewModel: null,
            _innerContainer: null,

            _onReady: function () {
                this._innerContainer = this.element.querySelector("div.ringingPanel");
                var callAnimationContainer = this._innerContainer.querySelector("div.callAnimationContainer");

                this._callingAnimationControl = new Skype.UI.Conversation.ConversationCallingAnimation(callAnimationContainer, { conversationWrapper: this._conversationWrapper });
                this._viewModel = new Skype.ViewModel.ConversationRingingPanelVM(this._conversationWrapper);

                WinJS.Resources.processAll(this._innerContainer);
                WinJS.Binding.processAll(this._innerContainer, this._viewModel);
                return this._callingAnimationControl.render();
            },

            

            showAsync: function () {
                log("conversationRingingPanel showAsync()");

                this._viewModel.onShow(this._conversationWrapper.name);
                
                this._innerContainer.focus();
                
                return WinJS.UI.Animation.showEdgeUI(this.element, sidePanelAnimOffset, { mechanism: "transition" }).then(function () {
                    roboSky.write("Conversation,INCOMINGCALLRINGING,buttonsReady");
                });
            },

            hideAsync: function () {
                log("conversationRingingPanel hideAsync()");

                return WinJS.UI.Animation.hideEdgeUI(this.element, sidePanelAnimOffset);
            },

            render: function (conversationWrapper) {
                log("conversationRingingPanel render()");

                this._conversationWrapper = conversationWrapper;
                return WinJS.UI.Fragments.renderCopy("/controls/conversation/conversationRingingPanel.html", this.element).then(this._onReady.bind(this));
            },

        });

    WinJS.Namespace.define("Skype.UI", {
        ConversationRingingPanel: conversationRingingPanel
    });
}());