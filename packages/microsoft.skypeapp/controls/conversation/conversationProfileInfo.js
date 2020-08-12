

(function () {
    "use strict";

    var conversationProfileInfo = Skype.UI.Control.define(
        function constructor() {
        }, {

            
           _avatarEl: null,

            
            _viewModel: null,

            
            _isVisible: true, 


            _onWindowResize: function () {
                if (this._isVisible) {
                    this._viewModel.onWindowResize();
                }
            },

            _onFileSent: function (evt) {
                var promise = evt.detail.promise;
                if (promise) {
                    promise.then(null,
                        function (args) {
                            this.dispatchEvent(Skype.UI.ConversationProfileInfo.Events.FileTransferError, { messageGuid: args.messageGuid, errorCode: args.errorCode });
                        }.bind(this),
                        function (args) {
                            this.dispatchEvent(Skype.UI.ConversationProfileInfo.Events.FilesPicked, args);
                        }.bind(this));
                }
            },

            _onConversationShow: function () {
                this._isVisible = true;
                this._viewModel.onShow();
                this._onWindowResize(); 
            },

            _onConversationHide: function () {
                this._isVisible = false;
                this._viewModel.onHide();
            },

            _initEvents: function () {
                this.regEventListener(window, 'resize', this._onWindowResize.bind(this));
                this.regEventListener(this._viewModel, Skype.ViewModel.ConversationProfileInfoVM.Events.FileSent, this._onFileSent.bind(this));
                this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationShow, this._onConversationShow.bind(this));
                this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationHide, this._onConversationHide.bind(this));
            },

            _onReady: function (conversationSharedState) {
                return WinJS.UI.processAll(this.element, true).then(function () {
                    WinJS.Resources.processAll(this.element);

                    this._avatarEl = this.element.querySelector("div.profile div.avatar");
                    var avatar = new Skype.UI.Avatar(this._avatarEl, { identity: conversationSharedState.identity });

                    this._viewModel = new Skype.ViewModel.ConversationProfileInfoVM(conversationSharedState, avatar);
                    this._initEvents();

                    this._viewModel.alive();
                    return WinJS.Binding.processAll(this.element, this._viewModel);
                }.bind(this));
            },

            

            render: function (conversationSharedState) {
                log("conversationProfileInfo render()");
                return WinJS.UI.Fragments.renderCopy("/controls/conversation/conversationProfileInfo.html", this.element).then(this._onReady.bind(this, conversationSharedState));
            },

            updateProfileInfo: function () {
                this._viewModel && this._viewModel.updateProfileInfo();
            },

        }, {
            Events: {
                FilesPicked: "FilesPicked",
                FileTransferError: "FileTransferError"
            },
        });

    WinJS.Namespace.define("Skype.UI", {
        ConversationProfileInfo: WinJS.Class.mix(conversationProfileInfo, Skype.Model.hierarchicalMixin)
    });
}());