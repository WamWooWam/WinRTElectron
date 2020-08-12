

(function () {
    "use strict";

    var conversationPage = Skype.UI.Page.define("/pages/conversation.html", "div.fragment.conversation", {
        
        element: null,

        
        _chatContainer: null,
        _liveGroupConversationContainer: null,
        _ringingPanelContainer: null,

        
        _conversationIdentity: null,
        _conversationWrapper: null,
        _viewModel: null,
        _conversationSharedState: null,
        _conversationStateMachine: null,
        
        _pageEnterAnimationPromise: null,

        
        _inFirstRender: false,
        _isVisible: false,

        
        _chat: null,
        _conversationProfileInfo: null,
        _ringingPanelContainerControl: null,
        _liveGroupConversation: null,

        _initSessionState: function () {
            WinJS.Application.sessionState.conversations = WinJS.Application.sessionState.conversations || {}; 
            WinJS.Application.sessionState.conversations[this._sessionStateId] = WinJS.Application.sessionState.conversations[this._sessionStateId] || {}; 

            
            Skype.UI.softSessionState.conversations = Skype.UI.softSessionState.conversations || {}; 
            Skype.UI.softSessionState.conversations[this._sessionStateId] = Skype.UI.softSessionState.conversations[this._sessionStateId] || {}; 
            this.convStateSoft = Skype.UI.softSessionState.conversations[this._sessionStateId]; 
        },

        _checkVideoPermissions: function () {
            
            if (this.options.acceptIncomingVideos) {
                this._conversationSharedState.acceptIncomingVideos = this.options.acceptIncomingVideos;
            } else if (typeof this.convStateSoft.acceptIncomingVideos !== 'undefined') {
                
                this._conversationSharedState.acceptIncomingVideos = this.convStateSoft.acceptIncomingVideos;
            }
        },

        onReady: function () {
            var fragmentContainer = this.element.parentNode;
            this._pageEnterAnimationPromise = new WinJS.Promise(function () { });
            this._sessionStateId = fragmentContainer._id;
            this._initSessionState();

            
            this._conversationSharedState = new Skype.UI.Conversation.ConversationSharedState(this.options, this.convStateSoft);
            this._conversationStateMachine = new Skype.UI.Conversation.ConversationStateMachine(this._conversationWrapper.libConversation, this._conversationSharedState, !!this.options.goDirectlyToLive);
            this._viewModel = new Skype.ViewModel.ConversationVM(this._conversationSharedState, this._conversationWrapper, this._conversationStateMachine, !!this.options.goDirectlyToLive);
            this._conversationWrapper.alive(); 
            this._initChildControls().then(function() {
                Skype.DebugInfo && Skype.DebugInfo.registerSwitcher(this.element.querySelector("div.profileInfo"), "dblclick", this._conversationSharedState);
            }.bind(this));
            this._chatContainer = this.element.querySelector("div.chatContainer");
            this._liveGroupConversationContainer = this.element.querySelector("div.liveGroupConversationContainer");
            this._ringingPanelContainer = this.element.querySelector("div.ringingPanelContainer");
            var bla = this._conversationWrapper.avatarUri; 
            this._checkVideoPermissions();

            this._inFirstRender = true; 
        },

        _onReadyLazyPart: function () {
            return WinJS.Binding.processAll(this.element, this._viewModel).then(function () {
                this._initLazyChildControls();
                this._registerEvents();

                this._viewModel.init(this._chat, this._conversationProfileInfo, this._liveGroupConversation);
                this._initTouchKeyboard();
            }.bind(this));
        },

        _registerEvents: function () {
            this.regEventListener(window, 'resize', this._onWindowResize.bind(this)); 
            this.regEventListener(this._viewModel, Skype.ViewModel.ConversationVM.Events.OnLiveModeEnd, this._onLiveModeEnd.bind(this));
            this.regEventListener(this._viewModel, Skype.ViewModel.ConversationVM.Events.OnLiveStart, this._onLiveStart.bind(this));
            this.regEventListener(this._viewModel, Skype.ViewModel.ConversationVM.Events.OnLiveStarting, this._onLiveStarting.bind(this));
            this.regEventListener(this._viewModel, Skype.ViewModel.ConversationVM.Events.OnLiveRinging, this._onLiveRinging.bind(this));
            this.regBind(this._viewModel, "hideChat", this._onChatVisibilityChanged.bind(this));

            this._eventsRegistered = true;
        },

        _initTouchKeyboard: function () {
            this.inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView(); 
            this.regEventListener(this.inputPane, "hiding", this._onKeyboardHiding.bind(this));
            this.regEventListener(this.inputPane, "showing", this._onKeyboardShowing.bind(this));
        },

        _initChildControls: function () {
            
            
            this._conversationProfileInfo = new Skype.UI.ConversationProfileInfo(this.element.querySelector("div.profileInfo"));
            this.addChildNode(this._conversationProfileInfo);
            this._profileInfoRenderPromise = this._conversationProfileInfo.render(this._conversationSharedState);
            return this._profileInfoRenderPromise;
        },

        _initLazyChildControls: function () {
            this._liveGroupConversation = new Skype.UI.LiveGroupConversation(this._liveGroupConversationContainer, {
                conversationSharedState: this._conversationSharedState,
                conversationWrapper: this._conversationWrapper
            });
            this.addChildNode(this._liveGroupConversation);

            this._chat = new Skype.UI.Conversation.Chat(this._chatContainer, {
                conversationSharedState: this._conversationSharedState,
                conversationSessionStateId: this._sessionStateId,
                conversationWrapper: this._conversationWrapper
            });
            this.addChildNode(this._chat);
            var chatRenderPromise = this._chat.renderAsync();

            WinJS.Promise.join([chatRenderPromise, this._profileInfoRenderPromise]).then(function () {
                this._renderFinishedSignals["default"].complete();
            }.bind(this));
        },

        _onDispose: function () {
            log('conversation page _onDispose()');
            this._conversationWrapper.conversationDispose();
            Skype.DebugInfo && Skype.DebugInfo.unRegisterSwitcher(this._conversationSharedState);
        },

        

        _onLiveModeEnd: function () {
            this._chat.onChatResized(); 
            if (this._isVisible) {
                this.element.focus();
            }
        },

        _initRingingPanelAsync: function () {
            if (!this._ringingPanelContainerControl) {
                this._ringingPanelContainerControl = new Skype.UI.ConversationRingingPanel(this._ringingPanelContainer);
                return this._ringingPanelContainerControl.render(this._conversationWrapper);
            }
            return WinJS.Promise.as();
        },

        _onLiveRinging: function (evt) {
            var skipPanelAnimation = evt.detail.skipPanelAnimation;

            if (!this._eventsRegistered) {
                return;
            }

            var onRingingPanelHideEnd = function () {
                
                
                if (this._viewModel) {
                    Skype.UI.Util.setClass(this.element, "SHOWINGCALLPANEL", this._viewModel.showingRingingPanel);
                    this.unregEventListener(this._ringingPanelContainer, "animationend", onRingingPanelHideEnd);
                }
            }.bind(this);

            this._initRingingPanelAsync().then(function () {
                if (!this._viewModel.showingRingingPanel) {
                    WinJS.Utilities.removeClass(this.element, "INCOMINGCALL");  
                    if (!skipPanelAnimation) {
                        this.regEventListener(this._ringingPanelContainer, 'animationend', onRingingPanelHideEnd); 
                        this._ringingPanelContainerControl && this._ringingPanelContainerControl.hideAsync().done(onRingingPanelHideEnd, onRingingPanelHideEnd);
                    } else {
                        WinJS.Utilities.removeClass(this.element, "SHOWINGCALLPANEL");
                    }
                } else {
                    WinJS.Utilities.addClass(this.element, "SHOWINGCALLPANEL");
                    this._ringingPanelContainerControl.showAsync().done(function () {
                        if (this._viewModel) {
                            Skype.UI.Util.setClass(this.element, "INCOMINGCALL", this._viewModel.showingRingingPanel);
                        }
                    }.bind(this));

                }
            }.bind(this));
        },

        _onLiveStart: function () {
            this._removeAntiBlinkingClasses();
        },

        _onLiveStarting: function () {
            if (this._isVisible) {
                window.getSelection().removeAllRanges(); 
                this.element.focus();
            }
        },

        

        _onResizeAnimComplete: function (ev) {
            this.unregEventListener(this.element, "transitionend", this._onResizeAnimComplete.bind(this));
            this._chat.onKeyboardAnimationEnded();
        },

        _onKeyboardShowing: function (ev) {
            ev.ensuredFocusedElementInView = true; 

            this._updateConversationHeight();
            this._chat.onKeyboardAnimationEnded(); 
        },

        _onKeyboardHiding: function (ev) {
            this.element.style.height = ''; 
            this._chat.onKeyboardAnimationEnded();
        },

        _onWindowResize: function () {
            if (this.inputPane && this.inputPane.occludedRect.height > 0) {
                this._updateConversationHeight();
            }

            if (this._isVisible && Skype.Application.state.view.isVertical) {
                
                WinJS.Utilities.query('.animSnapOnly', this.element).setStyle('opacity', '1');
            }
        },
        
        _updateConversationHeight: function () {
            var visibleContentHeight = document.body.clientHeight - this.inputPane.occludedRect.height;
            this.element.style.height = visibleContentHeight + 'px';
        },


        

        _onChatVisibilityChanged: function () {
            if (this._eventsRegistered && !this._viewModel.hideChat) {
                
                
                this._chat.onChatResized();
            }
        },

        _removeAntiBlinkingClasses: function () {
            if (this._hasBlinkingClasses && this._liveGroupConversationContainer.firstElementChild) {
                this._hasBlinkingClasses = false;
                assert(this._conversationSharedState != Skype.UI.Conversation.State.PRE_LIVE, "You call it from wrong context !");
                WinJS.Utilities.removeClass(this._liveGroupConversationContainer.firstElementChild, "PRELIVE");
            }
        },

        _addAntiBlinkingClasses: function () {
            this._hasBlinkingClasses = true;
            
            WinJS.Utilities.addClass(this.element, "SHOWINGFULLLIVE");
            if (this._liveGroupConversationContainer.firstElementChild) {
                WinJS.Utilities.addClass(this._liveGroupConversationContainer.firstElementChild, "PRELIVE");
            }
        },
        
        _getFullNamesFromIds: function (identities) {
            var fullNames = [];
            for (var i = 0; i < identities.length; i++) {
                var libContact = lib.getContactByIdentity(identities[i]);
                if (libContact) {
                    fullNames.push(libContact.getDisplayNameHtml());
                    libContact.discard();
                }
            }
            return fullNames;
        },

        _createCantAddContactsText: function (refused, someAdded) {
            var msgText = "";
            var refusedCount = refused.length;
            if (refusedCount > 0) {
                if (refusedCount === 1) {
                    msgText = "notification_add_to_call_one_failed_body".translate(this._getFullNamesFromIds(refused)[0]);
                } else {
                    if (someAdded > 0) {
                        msgText = "notification_add_to_call_some_failed_body".translate(Skype.Globalization.createLocalizedList(this._getFullNamesFromIds(refused)));
                    } else {
                        msgText = "notification_accept_call_all_failed_body".translate();
                    }
                }
            }
            return msgText;
        },

        _showCantAddContactsNotification: function (contacts) {
            var contactsAdded = contacts.allowed, 
                contactsRefused = contacts.refused;

            var msgText = this._createCantAddContactsText(contactsRefused, contactsAdded && contactsAdded.length);

            Skype.EventNotification.Manager.instance.show({
                type: Skype.EventNotification.Manager.NotificationType.ICON_TEXT,
                isTransient: true,
                isGlobal: false,
                icon: "&#xE600;",
                text: msgText,
                aria: "aria_notification_error".translate()
        });
        },

        
        init: function (element, options) {
            this._conversationIdentity = options.id; 
            var conversation = lib.getConversationByIdentity(this._conversationIdentity);
            this._conversationWrapper = Skype.Model.ConversationFactory.createConversation(conversation, Skype.Model.ConversationFactory.ConversationType.CONVERSATION_VIEW);

            this._renderFinishedSignals = {
                "default": new WinJS._Signal(),
            };
        },

        onShow: function (options) {
            log("Conversation onShow " + this._conversationIdentity);
            if (this._inFirstRender) {
                
                
                this._onReadyLazyPart();
                this._inFirstRender = false;
            }
            this._isVisible = true;
            
            this._viewModel.onBeforeShow(!!(options.goDirectlyToLive));

            assert(options.id === this._conversationIdentity, "We are navigating into different conversation that we should !");
            if (options.goDirectlyToLive && !this._conversationSharedState.isInFullLive) {
                this._addAntiBlinkingClasses();
            }

            this.renderFinishedPromise.then(function () {
                this.dispatchChildEvent(Skype.UI.Conversation.Events.ConversationShow);
            }.bind(this));

            if (options.addContacts && options.addContacts.refused.length ) {
                this._pageEnterAnimationPromise.then(function() {
                    this._showCantAddContactsNotification(options.addContacts);
                }.bind(this));
            }

            this._viewModel.onShow(!!(options.goDirectlyToLive));

            this._onWindowResize();
        },

        onPageEnteredAndAnimated: function () {
            if (this._pageEnterAnimationPromise) {
                this._pageEnterAnimationPromise.complete();
            }
        },

        onHide: function () {
            log("Conversation onHide " + this._conversationIdentity);
            this._viewModel.onHide();
            this._isVisible = false;
            Skype.DebugInfo && Skype.DebugInfo.stopMonitoring();
            this.dispatchChildEvent(Skype.UI.Conversation.Events.ConversationHide);
        }
    });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        Events: {
            ConversationShow: "ConversationShown",
            ConversationHide: "ConversationHide",
        }
    });

    WinJS.Class.mix(conversationPage, Skype.Model.hierarchicalMixin);
}());