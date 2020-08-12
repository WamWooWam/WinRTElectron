

(function () {
    "use strict";

    var conversationCallingAnimation = Skype.UI.Control.define(
        function constructor(element, options) {
            this._element = element;
            this._conversationWrapper = options.conversationWrapper;
            this._element.winControl = this;
        }, {
            _element: null,
            avatar: null,
            _conversationWrapper: null,

            _setAvatar: function () {
                assert(!this.avatar, "ConversationCallingAnimation: Should be called just one time !");
                this.avatarContainer = this._element.querySelector("div.avatarImage");
                this.avatar = new Skype.UI.Avatar(this.avatarContainer, {
                    identity: this._conversationWrapper.identity
                });
            },

            _onReady: function () {
                this._setAvatar();
                this._viewModel = new Skype.ViewModel.ConversationCallingAnimationVM(this._conversationWrapper, this.avatar);

                this.regBind(Skype.Application.state.view, "size", this._onResize.bind(this));

                return WinJS.Binding.processAll(this._element, this._viewModel, true).then(function () {
                    this._viewModel.init();
                }.bind(this));
            },

            _onResize: function () {
                Skype.UI.Util.setTemporaryClass(this._element, "RESET", 16);
            },

            
            render: function () {
                return WinJS.UI.Fragments.renderCopy("/controls/conversation/conversationCallingAnimation.html", this._element).then(this._onReady.bind(this));
            }
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationCallingAnimation: conversationCallingAnimation
    });
}());