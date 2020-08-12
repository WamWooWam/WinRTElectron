

(function (Skype) {
    "use strict";

    var mutedClass = "MUTED",
        onHoldClass = "ONHOLD";

    var callNotifications = WinJS.Class.derive(Skype.UI.LazyInitializedControl, function (element, options) {
        this.element = element;
        element.winControl = this;
        this._conversations = {};
    }, {
        
        ongoingCallWrapper: null,
        ongoingCallAvatar: null,
        _conversations: {},

        lazyInitAsync: function () {
            log("CallNotifications: lazyInit");
            return WinJS.UI.Fragments.render("/controls/callNotifications.html", this.element).then(this._onReady.bind(this));
        },

        _onReady: function () {
            log("CallNotifications: ready()");
            WinJS.UI.processAll(this.element);
            WinJS.Resources.processAll(this.element);

            this.ongoingCallElement = this.element.querySelector("div.ongoingNotification");
            this.multipleOngoingCallElement = this.element.querySelector("div.multipleOngoingNotification");

            this.regEventListener(this.ongoingCallElement.querySelector("button.notification "), 'click', this.handleOngoingCallClick.bind(this));
            this.regEventListener(this.multipleOngoingCallElement.querySelector("button.notification "), 'click', this.handleMultipleOngoingCallClick.bind(this));
            this.regEventListener(this.ongoingCallElement.querySelector("button.hangup "), 'click', this.handleHangupClick.bind(this));
            this.regEventListener(this.ongoingCallElement.querySelector("button.mute "), 'click', this.handleMuteClick.bind(this));
            this.regBind(Skype.Application.state.focusedConversation, "identity", this._onFocusedConversationChanged.bind(this));

            this._muteButton = this.ongoingCallElement.querySelector("button.mute");
            this._hangupButton = this.ongoingCallElement.querySelector("button.hangup");

            Skype.CallManager.registerListener(this);
        },

        _onFocusedConversationChanged: function () {
            
            log("CallNotifications: _onFocusedConversationChanged()");
            this.updateList();
        },

        _onLazyDispose: function () {
            Skype.CallManager.unregisterListener(this);
        },

        setLayerOnTopOfConversation: function (value) {
            this.layerOnTopOfConversation = value;
            log("CallNotifications: setLayerOnTopOfConversation({0})".format(value));
            this.updateList();
        },

        liveConversationsChange: function (event) {
            log("CallNotifications: liveConversationsChange()");

            this.updateList();
        },

        handleOngoingCallClick: function (event) {
            if (this.ongoingCallWrapper) {
                Actions.invoke("focusConversation", [this.ongoingCallWrapper.identity]);
            }
        },

        handleHangupClick: function (event) {
            if (this.ongoingCallWrapper) {
                Actions.invoke("hangup", [this.ongoingCallWrapper.identity]);
            }
        },

        handleMuteClick: function (event) {
            if (this.ongoingCallWrapper) {
                var item = this.getOngoingRenderItem();
                if(item.muted) {
                    this.ongoingCallWrapper.libConversation.unmuteMyMicrophone();
                    this._muteButton.setAttribute("aria-label", "aria_call_connection_mute".translate());
                } else {
                    this.ongoingCallWrapper.libConversation.muteMyMicrophone();
                    this._muteButton.setAttribute("aria-label", "aria_call_connection_unmute".translate());
                }
                this.updateOngoingCallElement();
            }
        },
        
        handleDurationUpdateInterval: function (event) {
            if (this.ongoingCallWrapper) {
                var node = this.ongoingCallElement;
                var item = this.getOngoingRenderItem();

                var text = node.querySelector("div.status span.text");
                text.innerText = item.text;
            }
        },

        handleMultipleOngoingCallClick: function (event) {
            Skype.UI.AppBar.instance.show(Skype.UI.AppBar.Location.top);
            Skype.UI.AppBar.instance.focusRecentsList();
        },

        getOngoingRenderItem: function () {
            var wrapper = this.ongoingCallWrapper,
                libConversation = wrapper.libConversation,
                item = {
                    id: libConversation.getIdentity(),
                    name: wrapper.name,
                    text: wrapper.formattedDuration,
                    muted: !!libConversation.getIntProperty(LibWrap.PROPKEY.conversation_LIVE_IS_MUTED)
                },
                livestatus = libConversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            
            if (livestatus === LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY || livestatus === LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY) {
                item.text = "onHold".translate();
                item.onHold = true;
            }
            if (livestatus === LibWrap.Conversation.local_LIVESTATUS_STARTING) {
                item.text = "ongoing_call_starting".translate();
                item.isStarting = true;
            }
            return item;
        },
        
        updateOngoingCallElement: function () {
            var item = this.getOngoingRenderItem();
            
            this.ongoingCallElement.querySelector("div.name").innerHTML = item.name;
            this.ongoingCallElement.querySelector("div.status span.text").innerText = item.text;
            this.ongoingCallAvatar = this.ongoingCallAvatar || new Skype.UI.Avatar(this.ongoingCallElement.querySelector("div.avatar"), { identity: item.id });
            this.ongoingCallAvatar.identity = item.id;
            
            var icon = this.ongoingCallElement.querySelector("div.status"); 
            var muted = this.ongoingCallElement.querySelector("button.mute");
            
            (item.onHold) ? muted.setAttribute("disabled", "disabled") : muted.removeAttribute("disabled");

            Skype.UI.Util.setClass(muted, mutedClass, item.muted);
            Skype.UI.Util.setClass(icon, onHoldClass, item.onHold);


        },

        updateMultipleOngoingCallElement: function (count) {
            this.multipleCallsElementVisible = count > 1;

            if (this.multipleCallsElementVisible) {
                var text = this.multipleOngoingCallElement.querySelector("div.status span.text");
                text.innerText = Skype.Globalization.formatNumericID("callnotification.active", count).translate(count);
            }
            Skype.UI.Util.setClass(this.multipleOngoingCallElement, "ACTIVE", this.multipleCallsElementVisible);
        },

        _getConversationsByState: function(state) {
            var identities = [];
            for (var identity in this._conversations) {
                if (this._conversations[identity].state === state) {
                    identities.push(identity);
                }
            }
            return identities;
        },
        
        _isIncomingCallConversationInFocus: function (conversationIdentity) {
            log("CallNotifications: _isIncomingCallConversationInFocus layerOnTopOfConversation:" + this.layerOnTopOfConversation);
            if (this.layerOnTopOfConversation) {
                
                return false;
            }

            log("CallNotifications: _isIncomingCallConversationInFocus VideoMessageDialog.isActive:" + Skype.UI.Conversation.VideoMessageDialog.isActive);
            if (Skype.UI.Conversation.VideoMessageDialog.isActive) {
                
                return false;
            }
            
            log("CallNotifications: Skype.Application.state.focusedConversation.identity:" + Skype.Application.state.focusedConversation.identity);
            return conversationIdentity === Skype.Application.state.focusedConversation.identity;
        },

        updateList: function () {
            
            var liveConversations = Skype.CallManager.liveConversations();
            for (var i = 0; i < liveConversations.length; i++) {
                var conversation = liveConversations[i];
                var status = conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
                var newConversationState =
                    (status === LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME) ?
                    Skype.UI.CallNotifications.ConversationState.INCOMING : Skype.UI.CallNotifications.ConversationState.ONGOING;

                var conversationIdentity = conversation.getIdentity();
                if (!this._conversations.hasOwnProperty(conversationIdentity)) {
                    this._conversations[conversationIdentity] = {};
                } 
                
                this._conversations[conversationIdentity].state = newConversationState;
                this._conversations[conversationIdentity].isAlive = true;
            }
            
            
            for (var identity in this._conversations) {
                if (this._conversations.hasOwnProperty(identity)) {
                    if (!this._conversations[identity].isAlive) {
                        delete this._conversations[identity];
                    } else {
                        this._conversations[identity].isAlive = false;
                    }
                }
            }

            this._updateOngoingCalls();
            this._showIncomingCallsToasts();
            this.updateVisibility();
        },
        
        _updateOngoingCalls: function() {
            
            var allOngoingCalls = this._getConversationsByState(Skype.UI.CallNotifications.ConversationState.ONGOING);
            
            var ongoingCalls = allOngoingCalls.filter(function(conversationIdentity) {
                return !this._isIncomingCallConversationInFocus(conversationIdentity);
            }.bind(this));

            var removeOngoingWrapper = true;
            var singleConv = ongoingCalls.length === 1;

            Skype.UI.Util.setClass(this.ongoingCallElement, "ACTIVE", singleConv);

            if (singleConv) {
                removeOngoingWrapper = false;
                if (!this.ongoingCallWrapper || this.ongoingCallWrapper.identity != ongoingCalls[0]) {
                    if (this.ongoingCallWrapper) {
                        this.ongoingCallWrapper.dispose();
                    }
                    var conv = lib.getConversationByIdentity(ongoingCalls[0]);
                    this.ongoingCallWrapper = Skype.Model.ConversationFactory.createConversation(conv);
                }
                this.updateOngoingCallElement();
            }

            if (this.ongoingCallWrapper && removeOngoingWrapper) {
                this.ongoingCallWrapper.dispose();
                this.ongoingCallWrapper = null;
            }

            this.updateMultipleOngoingCallElement(ongoingCalls.length);
        },
        
        _canAutoAnswerCall: function (conversationIdentity) {
            if (!Skype.Model.Options.auto_answer_calls) {
                log("CallNotifications: _canAutoAnswerCall=false, no auto_answer flag set");
                return false;
            } else if (Skype.Lib.isUpgradedCall(conversationIdentity)) {
                log("CallNotifications: _canAutoAnswerCall=false, as _isUpgradedCall=tue");
                return false;
            }

            if (!Skype.Application.state.isApplicationActive) {
                log("CallNotifications: _canAutoAnswerCall=false, as isApplicationActive=false");
                return false;
            }

            if (Skype.Application.state.view.isOnLockScreen) {
                log("CallNotifications: _canAutoAnswerCall=false, as isOnLockScreen=true");
                return false;
            }

            
            
            
            if (Skype.Application.BackgroundState.isInBackground()) {
                log("CallNotifications: _canAutoAnswerCall=false, as isInBackground=true");
                return false;
            }
            return true;
        },
        
        
        _toastsEnabled: function () {
            log("CallNotifications: _toastsEnabled() isInBackground:{0}, isApplicationActive:{1}, isOnLockScreen:{2}".format(Skype.Application.BackgroundState.isInBackground(), Skype.Application.state.isApplicationActive, Skype.Application.state.view.isOnLockScreen));

            if (!Skype.Application.state.policy.application.enabled) {
                
                log("CallNotification: _toastsEnabled=false, application is disabled by policy");
                return false;
            }

            if (Skype.Application.BackgroundState.isInBackground()) {
                
                
                
                
                
                log("CallNotifications: _toastsEnabled=false, do not show toasts isInBackground == true");
                return false;
            }

            log("CallNotifications: _toastsEnabled=true");
            return true;
        },

        _canShowToast: function (conversationIdentity) {
            if (Skype.Application.state.view.isOnLockScreen && conversationIdentity === Skype.ViewModel.LockScreenCall.activatedConversationId) {
                
                log("CallNotifications: _canShowToast() == false, isOnLockScreen/already activated from toast");
                return false;
            }

            log("CallNotifications: _isIncomingCallConversationInFocus(conversationIdentity):" + this._isIncomingCallConversationInFocus(conversationIdentity));
            if (Skype.Application.state.isApplicationActive && this._isIncomingCallConversationInFocus(conversationIdentity)) {
                log("CallNotifications: _canShowToast() == false, isApplicationActive && _isIncomingCallConversationInFocus");
                return false;
            }

            if (this._canAutoAnswerCall(conversationIdentity)) {
                log("CallNotifications: _canShowToast() == false, _canAutoAnswerCall=true");
                return false;
            }

            
            
            
            var callGuid = Windows.Storage.ApplicationData.current.localSettings.values["toastCallGUID"];
            if (callGuid) {
                var conversation = lib.getConversationByCallGUID(callGuid);
                if (conversation) {
                    log("CallNotifications._canShowToast() == false, toast for call GUID {0} has been shown by BG context".format(callGuid));
                    conversation.discard();
                    return false;
                }
            }

            log("CallNotifications: _canShowToast({0})=true".format(conversationIdentity));
            return true;
        },

        
        _showIncomingCallsToasts: function () {
            log("CallNotifications: _showIncomingCallsToasts()");

            if (this._toastsEnabled()) {
                var incomingCalls = this._getConversationsByState(Skype.UI.CallNotifications.ConversationState.INCOMING);
                log("CallNotifications: _showIncomingCallsToasts incomingCalls.length:" + incomingCalls.length);

                incomingCalls.forEach(function (conversationIdentity) {
                    log("CallNotifications: _showIncomingCallsToasts (" + conversationIdentity + ").toasted:" + this._conversations[conversationIdentity].toasted);
                    if (!this._conversations[conversationIdentity].toasted) {
                        if (this._canShowToast(conversationIdentity)) {
                            log("CallNotifications: _canShowToast() == true, show the toast");
                            this._showToast(conversationIdentity);
                            roboSky.write("Notifications,incommingCall");
                        } else {
                            log("CallNotifications: _canShowToast() == false, do not show the toast");
                        }
                        this._conversations[conversationIdentity].toasted = true;
                    }
                }.bind(this));
            }
        },
        
        
        updateVisibility: function () {

            var shouldBeActive = this.ongoingCallWrapper || this.multipleCallsElementVisible;

            Skype.UI.Util.setClass(this.element, "ACTIVE", shouldBeActive);
            if (this.ongoingCallWrapper) {
                if (!this.updateDurationTimer) {
                    this.updateDurationTimer = this.regInterval(this.handleDurationUpdateInterval.bind(this), 1000);
                }
            } else {
                if (this.updateDurationTimer) {
                    this.unregInterval(this.updateDurationTimer);
                    this.updateDurationTimer = 0;
                }
            }
        },

        _onToastRejected: function (params) {
            
            var toast = params.target;

            Actions.invoke("reject", toast.conversationIdentity);
        },

        _showToast: function (conversationIdentity) {
            var conversation = lib.getConversationByIdentity(conversationIdentity);
            var callNotification = {
                conversationIdentity: conversationIdentity,
                displayName: conversation.getStrProperty(LibWrap.PROPKEY.conversation_DISPLAYNAME)
            };
            conversation.discard();

            
            var toast = new Skype.Notifications.Toasts.CallToast(callNotification);
            this.regEventListener(toast, Skype.Notifications.Toasts.CallToast.Events.REJECTED, this._onToastRejected.bind(this));
            toast.show();
        }
    }, {
        init: function () {
            Skype.UI.LazyInitializedControl.initAsync(document.querySelector("div.callNotifications"));
        },

        dispose: function () {
            var control = document.querySelector("div.callNotifications").winControl;
            control && control.dispose();
        },

        setLayerOnTopOfConversation: function (value) {
            var control = document.querySelector("div.callNotifications").winControl;

            
            if (control && !control.isDisposed) {
                if (!control.isInitialized) {
                    Skype.UI.CallNotifications.init();
                }

                control.setLayerOnTopOfConversation(value);
            }
        },
        ConversationState: {
            INCOMING: 0,
            ONGOING: 1
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        CallNotifications: callNotifications
    });
})(Skype);