

(function () {
    "use strict";

    var sidePanelAnimOffset = {
        top: "0px",
        left: "-100%",
        rtlflip: true
    };

    var participantListPanel = Skype.UI.ObservableControl.define(
        function constructor() {
        }, {
            _viewModel: null,
            _innerContainer: null,
            _focusedParticipantId: null,
            _participantListContents: null,
            _focusedElement: Skype.Utilities.nondisposableProperty(null),
            _clickEater: null,

            
            initialized: false,
            _isVisible: false,

            _onDOMUpdate: function (evt) {
                if (evt.detail) {
                    this._focusedParticipantId = document.activeElement ? document.activeElement.getAttribute("participant-id") : null;
                    if (!this._focusedParticipantId) {
                        this._focusedElement = document.activeElement;
                    } else {
                        this._focusedElement = null;
                    }
                    this._innerContainer.winControl.disable();
                } else {
                    
                    this._innerContainer.winControl.elements = [];
                    this._innerContainer.winControl.enable();

                    var participant = null;
                    if (this._focusedParticipantId) {
                        participant = this._innerContainer.querySelector("div[participant-id='{0}']".format(this._focusedParticipantId));
                        if (participant) {
                            participant.focus();
                        }
                    }
                    if (!participant && this._focusedElement) {
                        this._focusedElement.focus();
                    }
                }
            },

            _onReady: function (participantListProvider, conversationSharedState) {
                log("ConversationParticipantListPanel _onReady()");

                this._innerContainer = this.element.querySelector("div.participantListContents");
                this._participantListContents = this.element.querySelector("div.participantListContents");
                this._hide = this.hideAsync.bind(this);
                this._clickEater = document.createElement("div");
                this._clickEater.className = "clickEater participantList";
                this._clickEater.style.display = "none";
                document.body.appendChild(this._clickEater);

                
                this._viewModel = new Skype.ViewModel.ConversationParticipantListVM(participantListProvider, conversationSharedState);
                
                this.regEventListener(this._clickEater, "click", this._hide);
                this.regEventListener(this._viewModel, Skype.ViewModel.ConversationParticipantListVM.Events.HideParticipantList, this._hide);
                this.regEventListener(this._viewModel, Skype.ViewModel.ConversationParticipantListVM.Events.TabConstrainerElementChange, this._onDOMUpdate.bind(this));

                Skype.UI.ConversationGestureHandler.ignoreImmersiveOnTree(this._innerContainer);
                Skype.UI.ConversationGestureHandler.ignoreGesturesOnTree(this._innerContainer);

                WinJS.UI.processAll(this._innerContainer);
                WinJS.Resources.processAll(this._innerContainer);
                WinJS.Binding.processAll(this._innerContainer, this._viewModel).then(this._viewModel.alive.bind(this._viewModel));

                this.initialized = true;
            },

            _onDispose: function () {
                this._clickEater && document.body.removeChild(this._clickEater);
            },

            _setVisible: function (isVisible) {
                this._isVisible = isVisible;
                this._viewModel.setVisible(isVisible);
                Skype.UI.Util.setClass(this.element, 'VISIBLE', isVisible);
                this._participantListContents.winControl[isVisible ? "enable" : "disable"]();
            },

            

            hideAsync: function () {
                log("ConversationParticipantListPanel _hide()");
                if (this._clickEater) {
                    this._clickEater.style.display = "none";
                }

                if (!this.initialized || !this._isVisible) {
                    return WinJS.Promise.as();
                }

                var animDoneCallback = (function () {
                    if (!this.isDisposed) {
                        this._setVisible(false);
                        this.unregEventListener(this.element, "animationend", animDoneCallback);
                    }
                }).bind(this);

                
                this.regEventListener(this.element, "animationend", animDoneCallback);

                return WinJS.UI.Animation.hideEdgeUI(this.element, sidePanelAnimOffset).then(animDoneCallback.bind(this), animDoneCallback.bind(this));
            },

            showAsync: function (participantListProvider, conversationSharedState) {
                log("ConversationParticipantListPanel showAsync()");

                var initPromise = WinJS.Promise.as();
                if (!this.initialized) {
                    initPromise = WinJS.UI.Fragments.renderCopy("/controls/conversation/participantList.html", this.element).then(this._onReady.bind(this, participantListProvider, conversationSharedState));
                }
                
                return initPromise.then(function () {
                    this._clickEater.style.display = "block";
                    this._setVisible(true);
                    this._innerContainer.focus();
                    return WinJS.UI.Animation.showEdgeUI(this.element, sidePanelAnimOffset, { mechanism: "transition" });
                }.bind(this));
            }
        }, {});

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ParticipantListPanel: participantListPanel
    });
}());