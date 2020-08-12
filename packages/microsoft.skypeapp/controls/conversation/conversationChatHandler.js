

(function () {
    "use strict";

    var conversationChatHandler = WinJS.Class.define(
        function constructor(liveConversationSizeSetter, liveConversationViewModel, containerWidth, containerHeight, conversationSharedState) {
            this._liveConversationSizeSetter = liveConversationSizeSetter;
            this._liveConversationViewModel = liveConversationViewModel;
            this._containerWidth = containerWidth;
            this._containerHeight = containerHeight;
            this._sharedState = conversationSharedState;
        }, {
            
            _chatIsMoved: false,

            
            _containerWidth: null,
            _containerHeight: null,

            _liveConversationViewModel: null,
            _liveConversationSizeSetter: null,
            _sharedState: null,
            _removeInlineStylesTimeout: null,

            _calculateAbsMove: function (initValue, containerSizeChatOpen, transOnAxis) {
                var absMove = 0;

                if (transOnAxis < 0 && this._sharedState.isChatOpenInLive) {
                    absMove = Math.min(Math.abs(transOnAxis), initValue); 
                }
                if ((transOnAxis > 0 && this._sharedState.isChatOpenInLive) || (transOnAxis < 0 && !this._sharedState.isChatOpenInLive)) {
                    absMove = Math.min(Math.abs(transOnAxis), containerSizeChatOpen);
                }
                if (transOnAxis > 0 && !this._sharedState.isChatOpenInLive) {
                    absMove = 0;
                }
                return absMove;
            },

            _removeInlineStyles: function () {
                
                

                if (this._removeInlineStylesTimeout) {
                    this.unregTimeout(this._removeInlineStylesTimeout);
                }

                this._removeInlineStylesTimeout = this.regTimeout(function () {
                    if (!this._chatIsMoved) {
                        this._liveConversationSizeSetter.updateLiveConversationSize('', '');
                        this._liveConversationSizeSetter.liveConvChatDragged(false);
                    }
                }.bind(this), conversationChatHandler.CHAT_SLOWDOWN_IN_MS);
            },

            _setChatPosition: function (isChatOpen) {
                var width = '', height = '';

                if (!Skype.Application.state.view.isVertical) {
                    width = isChatOpen ? this._containerWidth - conversationChatHandler.CHAT_SIZE_IN_LIVE : this._containerWidth;
                    width = width + 'px';
                } else {
                    height = isChatOpen ? conversationChatHandler.CONTAINER_HEIGHT : this._containerHeight;
                    height = height + 'px';
                }

                this._liveConversationSizeSetter.updateLiveConversationSize(width, height);
            },

            _updateChatPosition: function (slowDown) {
                
                
                
                
                
                

                slowDown && this._liveConversationSizeSetter.setLiveConversationSlowdown(conversationChatHandler.CHAT_SLOWDOWN_IN_MS);
                this._setChatPosition(this._sharedState.isChatOpenInLive);
            },

            

            onChatToggled: function (currentWidth, currentHeight) {
                
                
                
                
                
                
                
                
                

                
                if (currentWidth === "" && currentHeight === "") {
                    this._setChatPosition(!this._sharedState.isChatOpenInLive);
                    
                    this.regImmediate(function () {
                        this._updateChatPosition(true);
                        this._removeInlineStyles();
                    }.bind(this));
                } else {
                    this._updateChatPosition(true);
                    this._removeInlineStyles();
                }
            },

            onContainerSizeChanged: function (containerWidth, containerHeight) {
                
                
                
                
                
                
                
                
                

                this._containerWidth = containerWidth;
                this._containerHeight = containerHeight;
                this._liveConversationSizeSetter.updateLiveConversationSize('', '');
            },

            moveChat: function (transOnAxis) {
                
                
                
                
                
                

                this._chatIsMoved = true;
                
                var isVertical = Skype.Application.state.view.isVertical,
                    direction = transOnAxis < 0 ? -1 : 1,
                    absMove,
                    containerSizeChatOpen = isVertical ? conversationChatHandler.CONTAINER_HEIGHT : this._containerWidth - conversationChatHandler.CHAT_SIZE_IN_LIVE,
                    containerSizeChatClosed = isVertical ? this._containerHeight : this._containerWidth,
                    startingPos = this._sharedState.isChatOpenInLive ? containerSizeChatOpen : containerSizeChatClosed,
                    newPos,
                    width, height;

                absMove = this._calculateAbsMove(isVertical ? 50 : 100, containerSizeChatOpen, transOnAxis);
                newPos = startingPos + absMove * direction;

                if (!isVertical) {
                    width = newPos + 'px';
                } else { 
                    this._liveConversationSizeSetter.setLiveConversationSlowdown(0);
                    height = newPos + 'px';
                }
                this._liveConversationSizeSetter.updateLiveConversationSize(width, height);
                this._liveConversationSizeSetter.liveConvChatDragged(true);
            },

            anchorChat: function (transOnAxis) {
                
                
                
                
                
                
                

                if (!this._chatIsMoved) {
                    return; 
                }

                var isVertical = Skype.Application.state.view.isVertical,
                    chatOpenLimit = isVertical ? conversationChatHandler.CHAT_OPEN_TRANSY : conversationChatHandler.CHAT_OPEN_TRANSX,
                    shouldToggleChat = (this._sharedState.isChatOpenInLive && transOnAxis > chatOpenLimit) || (!this._sharedState.isChatOpenInLive && transOnAxis < -chatOpenLimit);

                if (shouldToggleChat) {
                    this._liveConversationViewModel.toggleChat(); 
                    this._sharedState.isChatOpenInLive && Skype.Statistics.sendStats(Skype.Statistics.event.call_swipeOpenChat);
                } else {
                    this._updateChatPosition(true); 
                    this._removeInlineStyles();
                }

                this._chatIsMoved = false;
            }
        }, {
            CHAT_SIZE_IN_LIVE: 320, 
            CHAT_OPEN_TRANSX: 150, 
            CHAT_OPEN_TRANSY: 200, 
            CHAT_SLOWDOWN_IN_MS: 500, 
            CONTAINER_HEIGHT: 240 
        }
    );

    WinJS.Namespace.define("Skype.UI", {
        ConversationChatHandler: WinJS.Class.mix(conversationChatHandler, Skype.Class.disposableMixin)
    });
}());