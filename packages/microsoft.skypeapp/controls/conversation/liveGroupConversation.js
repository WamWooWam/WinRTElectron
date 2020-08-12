

(function () {
    "use strict";

    var _canBeActiveElementBlured = function () {
        
        
        if (document.activeElement) {
            return !(Skype.UI.Util.activeElementCantBeBlured() || document.activeElement.classList.contains("win-overlay") || document.activeElement.classList.contains("win-command"));
        } else {
            return true;
        }
    };

    var liveGroupConversation = Skype.UI.ObservableControl.define(function (element, options) {
        this._conversationSharedState = options.conversationSharedState;
        this._conversationWrapper = options.conversationWrapper;
    }, {
        
        _viewport: null,
        _myselfVideo: null,
        _ariaLiveContainer: null,
        _roster: null,
        _fragment: null,
        _presentation: null,
        _stage: null,
        _presentationSpeaker: null,
        _currentLayoutClass: "",
        _lastFocusedElement: Skype.Utilities.nondisposableProperty(null),
        _immersiveFocusStore: null,

        
        _conversationIdentity: null,
        _conversationWrapper: null,

        
        _layoutManager: null,
        _viewModel: null,
        _conversationChatHandler: null,
        _conversationGestureHandler: null,
        _messageBubbleControl: null,
        _callingAnimationControl: null,
        _callStatusControl: null,
        _groupAvatar: null,
        _conversationSharedState: null,
        _immersiveModeHandler: null,

        
        _isConversationVisible: true, 
        _eventsRegistered: false,
        _isDragged: false,

        render: function () {
            log("liveGroupConversation render()");
            this._conversationIdentity = this._conversationSharedState.identity;

            return WinJS.UI.Fragments.renderCopy("/controls/conversation/liveGroupConversation.html", this.element).then(this._onReady.bind(this));
        },

        _onReady: function () {
            var isInPL = this._conversationSharedState.state === Skype.UI.Conversation.State.PRE_LIVE; 
            this._myselfVideo = this.element.querySelector("div.myselfVideo");
            this._fragment = this.element.querySelector("div.fragment");
            this._immersiveFocusStore = this.element.querySelector("div.immersiveFocusStore");
            this._viewport = this.element.querySelector("div.viewport");
            this._ariaLiveContainer = this.element.querySelector("div.ariaLiveContainer");
            this._roster = this._viewport.querySelector("div.roster");
            this._presentation = this._viewport.querySelector("div.presentation");
            this._presentationSpeaker = this._viewport.querySelector("div.presentationSpeaker");
            this._stage = this._viewport.querySelector("div.stage");
            this._immersiveModeHandler = new Skype.UI.Conversation.ImmersiveModeHandler(this._conversationSharedState, this);

             var callStatusControlRenderPromise = this._initBlockingChildControls(isInPL);

             var liveGroupConversationRenderPromise = WinJS.UI.processAll(this.element, true).then(function () {
                this._viewModel = new Skype.ViewModel.LiveGroupConversationVM(this._conversationWrapper, this._conversationSharedState, this.element.querySelector("div.bottomHolder"));
                return WinJS.Binding.processAll(this.element, this._viewModel, true).then(this._onBindingReady.bind(this));
            }.bind(this));
            
            WinJS.Promise.join([callStatusControlRenderPromise, liveGroupConversationRenderPromise]).then(function () {
                this.regEventListener(this._callStatusControl.element.querySelector("span.numberOfParticipants"), "click", this.showParticipantList.bind(this));
                this.regEventListener(this._callStatusControl.element.querySelector("span.numberOfParticipants"), "keydown", this.showParticipantList.bind(this));
            }.bind(this));
        },

        _initEvents: function () {
            this.regEventListener(this._viewModel, Skype.UI.ConversationParticipant.Events.ParticipantStreamAddedRemoved, this._onParticipantStreamAddedRemoved.bind(this));
            this.regEventListener(this._viewModel, Skype.UI.ConversationParticipant.Events.VideoScreenShareStarted, this._onVideoScreenShareStarted.bind(this));
            this.regEventListener(this._viewModel, Skype.ViewModel.LiveGroupConversationVM.Events.FileSent, this._onFileSent.bind(this));
            this.regEventListener(this._viewModel, Skype.ViewModel.LiveGroupConversationVM.Events.FlyoutVisible, this._onFlyoutVisible.bind(this));
            this.forwardEvent(this._viewModel, Skype.UI.LiveGroupConversation.Events.DismissLiveConversation);
            this.regBind(this._conversationSharedState, "isInFullLive", this._onLiveConversationVisibilityChanged.bind(this));
            this.regBind(this._conversationSharedState, "isChatOpenInLive", this._onChatToggled.bind(this));
            this.regBind(this._conversationSharedState, "immersiveMode", this._actualizeAriaLiveContainer.bind(this));

            this.regBind(this._viewModel, "isReceivingVideo", this._onVideoRunning.bind(this));
            this.regBind(this._viewModel, "recoveryMode", this._onRecoveryModeChange.bind(this));

            this.regEventListener(this._layoutManager, Skype.UI.Conversation.ConversationLayoutManager.Events.LayoutTypeChanged, this._onLayoutTypeChanged.bind(this));
            this.forwardEvent(this._conversationGestureHandler, Skype.UI.LiveGroupConversation.Events.UserInteractionInLive);

            this.regEventListener(window, 'resize', this._onWindowResize.bind(this, false));
            this.regBind(Skype.Application.state, "isShowingKeyboard", this._onKeyboardVisibilityChanged.bind(this));
            Skype.DebugInfo && Skype.DebugInfo.registerSwitcher(this.element.querySelector("button.mute"), "dblclick", this._conversationSharedState);

            this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationShow, this._onConversationShow.bind(this));
            this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationHide, this._onConversationHide.bind(this));

            this.regEventListener(this._viewModel, Skype.Conversation.ActiveSpeakerManager.Events.Update, this._onStageSpeakersChanged.bind(this));

            this._eventsRegistered = true;
        },
        
        showParticipantList: function (e) {
            if (e.type === "keydown" && e.keyCode !== WinJS.Utilities.Key.space && e.keyCode !== WinJS.Utilities.Key.enter) {
                return;
            }
            this._viewModel.showParticipantList();
        },

        _initBlockingChildControls: function (isInPL) { 
            this._callStatusControl = new Skype.UI.Conversation.CallStatus(this.element.querySelector("div.callStatusContainer"));
            return this._callStatusControl.render(this._conversationWrapper, isInPL, this._conversationSharedState);
        },

        _initChildControls: function () {
            var containerWidth = document.body.clientWidth;
            var containerHeight = document.body.clientHeight;
            var parentConversationFragment = Skype.UI.Util.getParentElementByClass(this.element, 'conversation'); 

            this._callingAnimationControl = new Skype.UI.Conversation.ConversationCallingAnimation(this.element.querySelector("div.callAnimationContainer"), { conversationWrapper: this._conversationWrapper });
            this._layoutManager = new Skype.UI.Conversation.ConversationLayoutManager({ updateItemDOMPosition: this._updateItemDOMPosition.bind(this), updateStageGrid: this._updateStageGrid.bind(this) }, this._conversationSharedState.isDialog);
            this._messageBubbleControl = new Skype.UI.Conversation.MessageNotification(this.element.querySelector("div.chatNewMsgNotifContainer"), { conversationIdentity: this._conversationIdentity });
            this._callingAnimationControl.render();
            this._conversationChatHandler = new Skype.UI.ConversationChatHandler({ updateLiveConversationSize: this._updateLiveConversationSize.bind(this), setLiveConversationSlowdown: this._setLiveConversationSlowdown.bind(this), liveConvChatDragged: this._liveConvChatDragged.bind(this) }, this._viewModel, containerWidth, containerHeight, this._conversationSharedState);
            this._conversationGestureHandler = new Skype.UI.ConversationGestureHandler(this.element, parentConversationFragment, this._myselfVideo, this._viewModel, this._conversationChatHandler);

            if (!this._conversationSharedState.isDialog) {
                this._groupAvatar = new Skype.UI.Avatar(this.element.querySelector("div.avatarCont"), { identity: this._conversationIdentity });
                this._groupAvatar.updateAvatar();
            }
        },

        _onBindingReady: function () {
            WinJS.Resources.processAll(this.element);

            this._initChildControls();
            this._initEvents();

            this._viewModel.init(this._messageBubbleControl, this._callStatusControl, this._groupAvatar);
        },

        _setLiveConversationSlowdown: function (removeAfterMillis) {
            Skype.UI.Util.setSlowDownClass(this.element, removeAfterMillis);
        },

        _updateLiveConversationSize: function (width, height) {
            width !== undefined && (this.element.style.width = width);
            height !== undefined && (this.element.style.height = height);
        },

        _liveConvChatDragged: function (isDragging) {
            if (isDragging) {
                if (!this._isDragged) {
                    if (Skype.Application.state.view.isVertical) { 
                        this._viewport.style.height = this._getContainerSize().containerHeight + "px";
                    } else {
                        this._viewport.style.width = this._getContainerSize().containerWidth + "px";
                    }
                }
            } else {
                this._viewport.style.width = "";
                this._viewport.style.height = "";
                this._updateStageHeight();
                Skype.UI.Util.setClass(this._fragment, "CHATOPEN", this._conversationSharedState.isChatOpenInLive);
            }
            this._isDragged = isDragging;
        },

        _onFlyoutVisible: function (event) {
            var flyoutVisible = event.detail.visible;
            this.dispatchEvent(liveGroupConversation.Events.LiveConversationBlockImmersive, { block: flyoutVisible });
        },

        _onVideoRunning: function () { 
            this.dispatchEvent(liveGroupConversation.Events.VideoCallChange, { videoRunning: this._viewModel.isReceivingVideo }); 
        },

        _updateStageAndRoster: function () {
            this._updateStageGrid();
            this._viewModel.updateRibbonItemsCount(this._roster.children.length, this._presentationSpeaker.children.length);
            this._restoreRosterScrollPosition();
        },

        _updateStageHeight: function () {
            if (this._layoutManager.getCurrentLayoutClass() === "ALL_PARTICIPANTS") {
                var stageHeight = Math.min(3 * this._stage.clientWidth / (this._stage.children.length * 4), this.element.clientHeight);
                this._stage.style.height = stageHeight + "px";
                if (this._conversationSharedState.isChatOpenInLive && Skype.Application.state.view.isVertical) { 
                    this._stage.style.height = "100%";
                }
            } else {
                this._stage.style.height = "";
            }
        },

        _updateStageGrid: function () {
            var msGridColumnsStyle = "";
            for (var i = 0; i < this._stage.children.length; i++) {
                this._stage.children[i].style.msGridColumn = this._stage.children[i].winItem.itemColumn;
                msGridColumnsStyle += " 1fr";
            }
            this._stage.style.msGridColumns = msGridColumnsStyle;
            this._updateStageHeight();
        },

        
        _updateItemDOMPosition: function (item) {
            var element = item.element;

            switch (item.itemPosition) {
                case liveGroupConversation.LayoutPlacement.STAGE:
                    this._stage.appendChild(element); 
                    break;
                case liveGroupConversation.LayoutPlacement.ROSTER:
                    this._roster.appendChild(item.element); 
                    break;
                case liveGroupConversation.LayoutPlacement.PRESENTATION:
                    this._presentation.appendChild(element);
                    break;
                case liveGroupConversation.LayoutPlacement.PRESENTATION_SPEAKER:
                    this._presentationSpeaker.appendChild(element);
                    break;
            }
            this._updateStageAndRoster();
        },

        _restoreRosterScrollPosition: function () {
            this._roster.scrollLeft = this._roster.scrollWidth;
        },

        _updateElementClassFromProperty: function (classProperty, destinationElement, newValue) {
            if (classProperty) {
                WinJS.Utilities.removeClass(destinationElement, classProperty);
            }
            newValue && WinJS.Utilities.addClass(destinationElement, newValue);
            return newValue;
        },

        _onLayoutTypeChanged: function (e) {
            
            this._currentLayoutClass = this._updateElementClassFromProperty(this._currentLayoutClass, this._viewport, this._layoutManager.getCurrentLayoutClass());
            this._conversationSharedState.layout = e.detail; 
        },

        _onStageSpeakersChanged: function (event) {
            this._layoutManager.stageSpeakersChanged(event.detail);
        },

        _onVideoScreenShareStarted: function (event) {
            var started = event.detail ? event.detail.started : false;
            this._layoutManager.onVideoScreenShareStarted(started);
        },

        _onParticipantStreamAddedRemoved: function (event) {
            var participantStream = event.detail ? event.detail.participantStream : null;
            var added = event.detail ? event.detail.added : false;

            if (added) {
                var streamWrapper = new Skype.UI.Conversation.ConversationLayoutStreamWrapper(participantStream);
                this._layoutManager.onItemAdded(streamWrapper);
            } else {
                var removedItem = this._layoutManager.onItemRemoved(participantStream.getId());
                if (removedItem) {
                    Skype.UI.Util.removeFromDOM(removedItem.element);
                    if (removedItem.itemPosition === liveGroupConversation.LayoutPlacement.STAGE) {
                        this._updateStageGrid();
                    } else {
                        this._viewModel.updateRibbonItemsCount(this._roster.children.length, this._presentationSpeaker.children.length);
                    }
                } else {
                    log("You are removing stream that we don't have. It should happen when removing is triggered before participant is fully rendered. Check participant.");
                }
            }
        },

        _getContainerSize: function () {
            var chatOpen = this._conversationSharedState.isChatOpenInLive;
            var horizontalLayout = !Skype.Application.state.view.isVertical;
            var containerWidth = horizontalLayout && chatOpen ? document.body.clientWidth - Skype.UI.ConversationChatHandler.CHAT_SIZE_IN_LIVE : document.body.clientWidth;
            var containerHeight = !horizontalLayout && chatOpen ? Skype.UI.ConversationChatHandler.CONTAINER_HEIGHT : this._getScreenHeight();

            return { containerWidth: containerWidth, containerHeight: containerHeight };
        },

        _getScreenHeight: function () {
            var isKeyboardVisible = Skype.Application.state.isShowingKeyboard && Skype.Application.state.keyboardOccludedRectangle;
            return isKeyboardVisible ? document.body.clientHeight - Skype.Application.state.keyboardOccludedRectangle.height : document.body.clientHeight;
        },

        _onKeyboardVisibilityChanged: function () {
            this._onWindowResize(false);
        },

        _onWindowResize: function (force) {
            if (!force && (!this._isConversationVisible || (!this._conversationSharedState.isInFullLive))) {
                
                return;
            }
            var containerSize = this._getContainerSize();

            containerSize.containerHeight = Math.max(liveGroupConversation.LIVECONVERSATION_MINIMAL_HEIGHT, containerSize.containerHeight); 
            
            this._conversationChatHandler.onContainerSizeChanged(document.body.clientWidth, this._getScreenHeight());
            this._layoutManager.onResize(containerSize.containerWidth, containerSize.containerHeight, document.body.clientWidth);
            this._updateStageHeight();
            this._restoreRosterScrollPosition();
        },

        
        _onLiveConversationVisibilityChanged: function () {
            if (this._conversationSharedState.isInFullLive) {
                this._onWindowResize(); 
                this._layoutManager.onCallStarted(); 
            }
        },

        _onConversationShow: function () {
            this._isConversationVisible = true;
            this._onWindowResize(true); 
        },

        _onConversationHide: function () {
            this._isConversationVisible = false;
        },

        _onFileSent: function (evt) { 
            var promise = evt.detail.promise;
            if (promise) {
                promise.then(null,
                    function (args) {
                        this.dispatchEvent(liveGroupConversation.Events.FileTransferError, { messageGuid: args.messageGuid, errorCode: args.errorCode });
                    }.bind(this),
                    function (args) {
                        this.dispatchEvent(liveGroupConversation.Events.FilesPicked, args);
                    }.bind(this));
            }
        },

        _onRecoveryModeChange: function (visible) {
            if (visible) {
                this.element.querySelector("div.recoveringMessage").focus();
            } else {
                this._fragment.focus();
            }
        },

        
        _onChatToggled: function () {
            if (this._eventsRegistered) {
                this._conversationChatHandler.onChatToggled(this.element.style.width, this.element.style.height);
            }
        },

        _actualizeAriaLiveContainer: function () {
            var ariaLabel = "";
            if (this._conversationSharedState.immersiveMode) {
                
                ariaLabel = "aria_live_region_immersive_video_mode_notice".translate();

                if (_canBeActiveElementBlured()) {
                    this._lastFocusedElement = document.activeElement;
                    this._immersiveFocusStore.focus();
                }

            } else {
                if (this._lastFocusedElement && _canBeActiveElementBlured()) {
                    this._lastFocusedElement.focus();
                    this._lastFocusedElement = null;
                }
            }
            if (this._ariaLiveContainer) {
                this._ariaLiveContainer.innerText = ariaLabel;
            }
        },
    }, {}, {
        Events: {
            DismissLiveConversation: "DismissLiveConversation",
            VideoCallChange: "VideoCallChange",
            LiveConversationBlockImmersive: "LiveConversationBlockImmersive",
            UserInteractionInLive: "UserInteractionInLive",
            FilesPicked: "FilesPicked",
            FileTransferError: "FileTransferError", 
        },
        
        LIVECONVERSATION_MINIMAL_HEIGHT: 95,

        translateLayoutPlacementClassName: function (layoutPlacement) {
            switch (layoutPlacement) {
                case liveGroupConversation.LayoutPlacement.STAGE: return "STAGE";
                case liveGroupConversation.LayoutPlacement.PRESENTATION: return "PRESENTATION";
                case liveGroupConversation.LayoutPlacement.ROSTER: return "ROSTER";
                case liveGroupConversation.LayoutPlacement.PRESENTATION_SPEAKER: return "PRESENTATIONSPEAKER";
            }
            return "";
        },

        LayoutPlacement: {
            NOT_SET: -1,
            STAGE: 1,
            PRESENTATION: 2,
            ROSTER: 3,
            PRESENTATION_SPEAKER: 4
        },
    });

    WinJS.Namespace.define("Skype.UI", {
        LiveGroupConversation: WinJS.Class.mix(liveGroupConversation, Skype.Model.hierarchicalMixin)
    });

})(Skype);