

(function () {
    "use strict";

    var messageNotification = Skype.UI.Control.define(
        function () {
            assert(this.options.conversationIdentity, "messageNotification Incorrect usage");
            this.initPromise = new WinJS.Promise(function () { });
        }, {
            _viewModel: null,
            _initialized: false,
            initPromise: null,

            _render: function () {
                var conversation = lib.getConversationByIdentity(this.options.conversationIdentity);
                this._viewModel = new Skype.ViewModel.MessageNotificationVM(conversation);

                return WinJS.UI.Fragments.renderCopy("/controls/conversation/messageNotification.html", this.element).then(this._onReady.bind(this));
            },

            _onReady: function () {
                var element = this.element.querySelector("div.messageBubbleContainer");

                this.regEventListener(element, 'click', function () {
                    this.dispatchEvent(Skype.UI.Conversation.MessageNotification.Events.Click, this);
                }.bind(this));

                var messageBubbleAvatar = new Skype.UI.Avatar(element.querySelector("div.avatar"), {});
                this._viewModel.init(messageBubbleAvatar);
                WinJS.Binding.processAll(element, this._viewModel);

                this._initialized = true;
                this.initPromise.complete();
            },

            

            stopListeningAsync: WinJS.Promise.async(function () {
                log("messageNotification stopListeningAsync()");

                this._viewModel.onStop();
            }),

            startListeningAsync: function () {
                log("messageNotification startListeningAsync()");

                if (!this._initialized) {
                    this._render();
                }

                return this.initPromise.then(this._viewModel.onStart.bind(this._viewModel));
            },
        }, {
            Events: {
                
                Click: "Click"
            }

        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        MessageNotification: WinJS.Class.mix(messageNotification, WinJS.Utilities.eventMixin)
    });
})();
