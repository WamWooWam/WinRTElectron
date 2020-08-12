

(function () {
    "use strict";

    var IMMERSIVE_IGNORE_CLASS = "immersiveIgnore",
        IMMERSIVE_STOP_CLASS = "immersiveStopper",
        IGNORE_GESTURE_CLASS = "gestureIgnore",
        ACTIVE_EVENT_THROTTLE = 200,
        SMALL_GESTURE_THRESHOLD = 20;

    var GESTURES_PERMITED_STATES = [ 
        Skype.UI.Conversation.State.LIVE,
        Skype.UI.Conversation.State.PRE_LIVE,
        Skype.UI.Conversation.State.LIVE_HOLD_LOCAL,
        Skype.UI.Conversation.State.LIVE_HOLD_REMOTE
    ];

    var conversationGestureHandler = WinJS.Class.define(
        function conversationGestureHandler_constructor(liveConversationContainer, parentConversationFragment, myselfVideo, liveConversationViewModel, conversationChatHandler) {
            this._init(liveConversationContainer, parentConversationFragment, myselfVideo, liveConversationViewModel, conversationChatHandler);
        }, {
            
            liveConversationContainer: null,
            myselfVideo: null,
            parentConversationFragment: null,

            
            liveConversationViewModel: null,
            conversationChatHandler: null,            

            
            _pointersOnScreen: null,
            _ongoingGesture: false,
            _dblClickTimer: null,

            _init: function (liveConversationContainer, parentConversationFragment, myselfVideo, liveConversationViewModel, conversationChatHandler) {
                this.liveConversationContainer = liveConversationContainer;
                this.liveConversationViewModel = liveConversationViewModel;
                this.myselfVideo = myselfVideo;
                this.parentConversationFragment = parentConversationFragment;
                this.conversationChatHandler = conversationChatHandler;
                this._gesturePointerDownHandler = this._gesturePointerDownHandler.bind(this);
                this._fragmentPointerUpHandler = this._fragmentPointerUpHandler.bind(this);
                this._pointersOnScreen = [];

                
                this.regEventListener(this.parentConversationFragment, "pointerdown", this._gesturePointerDownHandler);
                this.regEventListener(this.parentConversationFragment, "MSGestureStart", this._gestureStartHandler.bind(this)); 
                this.regEventListener(this.parentConversationFragment, "MSGestureChange", this._gestureChangeHandler.bind(this)); 
                this.regEventListener(this.parentConversationFragment, "MSGestureEnd", this._gestureEndHandler.bind(this));
                this.regEventListener(this.liveConversationContainer, "pointerdown", this._fragmentPointerDownHandler.bind(this));
                this.regEventListener(this.liveConversationContainer, "pointerup", this._conversationPointerUpHandler.bind(this)); 
                this.regEventListener(this.liveConversationContainer, "pointermove", this._fragmentPointerMoveHandler.bind(this)); 

                
                this.regEventListener(this.parentConversationFragment, "pointerout", this._fragmentPointerUpHandler);
                this.regEventListener(this.parentConversationFragment, "pointercancel", this._fragmentPointerUpHandler);
                this.regEventListener(this.parentConversationFragment, "lostpointercapture", this._fragmentPointerUpHandler);

            },

            _fragmentPointerUpHandler: function (evt) {
                this._pointersOnScreen.removeObject(evt.pointerId);
            },

            _conversationPointerUpHandler: function (evt) {
                if (evt.button === 2) { return; }
                if (!this._ongoingGesture && !this._dblClickTimer) {
                    if (!evt.target.classList) { 
                        return;
                    }
                    var isTapOnImmersiveStoppingEl = WinJS.Utilities.hasClass(evt.target, IMMERSIVE_STOP_CLASS),
                        isTapOnImmersiveStartingEl = !WinJS.Utilities.hasClass(evt.target, IMMERSIVE_IGNORE_CLASS) && !WinJS.Utilities.hasClass(evt.target, IMMERSIVE_STOP_CLASS) && !evt.ignoreImmersive;

                    if (isTapOnImmersiveStoppingEl || isTapOnImmersiveStartingEl) {
                        this._dblClickTimer = this.regTimeout(function () {
                            this._dblClickTimer = null;
                            this._sendUserInteractionEvent({ type: evt.type, isImmersiveStopping: isTapOnImmersiveStoppingEl, isImmersiveStarting: isTapOnImmersiveStartingEl });
                        }.bind(this), 200);
                    }
                } else {
                    this.unregTimeout(this._dblClickTimer);
                    this._dblClickTimer = null;
                    if (this._pointersOnScreen.length < 2) { 
                        this._ongoingGesture = false;
                    }
                }
                this._pointersOnScreen.removeObject(evt.pointerId);
            },

            _fragmentPointerDownHandler: function (evt) {
                this._pointersOnScreen.push(evt.pointerId);
            },

            _sendUserInteractionEvent: function (detailObj) {
                this.dispatchEvent(Skype.UI.LiveGroupConversation.Events.UserInteractionInLive, detailObj);
            },

            _fragmentPointerMoveHandler: function (evt) {
                
                if (evt.currentPoint.pointerDevice.pointerDeviceType === Windows.Devices.Input.PointerDeviceType.mouse) {
                    
                    this.throttle(ACTIVE_EVENT_THROTTLE, this._sendUserInteractionEvent, [{ type: evt.type }]);
                }
            },

            _gesturePointerDownHandler: function (evt) {
                var gestureObject = Skype.UI.Util.getGestureObjectForEvent(evt);
                gestureObject.addPointer(evt.pointerId);
            },

            _gesturesAreEnabled: function () {
                return GESTURES_PERMITED_STATES.contains(this.liveConversationViewModel.sharedState.state);
            },

            _gestureStartHandler: function (evt) {
                this._ongoingGesture = true;
                var gestureObject = Skype.UI.Util.getGestureObjectForEvent(evt);
                gestureObject._running = true;
                
            },

            _gestureEndHandler: function (evt) {
                var gestureObject = Skype.UI.Util.getGestureObjectForEvent(evt),
                    isVertical = Skype.Application.state.view.isVertical,
                    isNonScaleGesture = evt.scale === 1;

                gestureObject._running = false;
                gestureObject._cumulativeTransX = 0;
                gestureObject._cumulativeTransY = 0;

                if (this._gesturesAreEnabled() && isNonScaleGesture) {
                    this.conversationChatHandler.anchorChat(isVertical ? evt.translationY : evt.translationY);
                }
            },

            _handleSwipe: function (translation, cumulativeTrans, gestureObject, translationLimit) {
                cumulativeTrans = cumulativeTrans || 0;
                var newCumulativeTrans = translation + cumulativeTrans,
                    absNewCumulativeTrans = Math.abs(newCumulativeTrans);

                if (absNewCumulativeTrans > translationLimit) {
                    gestureObject.stop(); 
                    gestureObject._running = false;
                    this.conversationChatHandler.anchorChat(newCumulativeTrans);

                } else if (absNewCumulativeTrans > SMALL_GESTURE_THRESHOLD) { 
                    this.conversationChatHandler.moveChat(newCumulativeTrans);
                }
                return newCumulativeTrans;
            },

            _swipeHandler: function (evt) {
                var realTranslation = Skype.UI.Util.getRealEventTranslation(evt);
                var gestureObject = Skype.UI.Util.getGestureObjectForEvent(evt);

                if (!Skype.Application.state.view.isVertical) { 
                    var translationX = Skype.Globalization.isRightToLeft() ? realTranslation.translationX * -1 : realTranslation.translationX;

                    gestureObject._cumulativeTransX = this._handleSwipe(translationX, gestureObject._cumulativeTransX, gestureObject, Skype.UI.ConversationChatHandler.CHAT_OPEN_TRANSX);
                } else { 
                    gestureObject._cumulativeTransY = this._handleSwipe(realTranslation.translationY, gestureObject._cumulativeTransY, gestureObject, Skype.UI.ConversationChatHandler.CHAT_OPEN_TRANSY);
                }
            },

            _gestureChangeHandler: function (evt) {
                var gestureObject = Skype.UI.Util.getGestureObjectForEvent(evt),
                    isNonScaleGesture = evt.scale === 1;
                if (!gestureObject._running) {
                    
                    
                    return;
                }
                var isOnIgnoreGesturesTarget = evt.ignoreGesture || WinJS.Utilities.hasClass(evt.target, IGNORE_GESTURE_CLASS);

                if (this._gesturesAreEnabled() && isNonScaleGesture &&
                    !isOnIgnoreGesturesTarget && !this.liveConversationViewModel.flyoutVisible) { 
                    this._swipeHandler(evt);
                }
            },
        }, {
            ignoreImmersiveOnTree: function (element) {
                element.addEventListener("pointerup", function (event) {
                    event.ignoreImmersive = true;
                });
            },

            ignoreGesturesOnTree: function (element) {
                element.addEventListener("MSGestureChange", function (event) {
                    event.ignoreGesture = true;
                });
            }
        }
    );

    WinJS.Namespace.define("Skype.UI", {
        ConversationGestureHandler: WinJS.Class.mix(conversationGestureHandler, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });
}());