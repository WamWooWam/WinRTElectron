

(function (_LibWrap, global) {
    "use strict";
    var Windows, LibWrap = _LibWrap, lib;

    function updateDependencies(dependencies) {
        dependencies = dependencies || {};
        Windows = dependencies.Windows || global.Windows;
        LibWrap = dependencies.LibWrap || global.LibWrap;
        lib = dependencies.lib || global.lib;
    }

    var answerActions = {
        AUDIO: "audio",
        VIDEO: "video",
        REJECT: "reject",
        FOCUS: "focus"
    };

    var States = {
        NONE: "None",
        RINGING: "Ringing",
        LIVE: "Live",
        IGNORE: "Ignore"
    };

    var LibStateMapping = {
        NONE: [LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE],
        RINGING: [LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE_FULL],
        LIVE: [LibWrap.Conversation.local_LIVESTATUS_IM_LIVE, LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY, LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY],
        IGNORE: [LibWrap.Conversation.local_LIVESTATUS_STARTING, LibWrap.Conversation.local_LIVESTATUS_PLAYING_VOICE_MESSAGE, LibWrap.Conversation.local_LIVESTATUS_RECORDING_VOICE_MESSAGE, LibWrap.Conversation.local_LIVESTATUS_TRANSFERRING]
    };

    var BACKGROUND_CONVERSATION_POLLING_INTERVAL = 100;

    var callToast = WinJS.Class.define(function constructor(callNotification, context, dependencies) {
        updateDependencies(dependencies);

        this._context = context || Skype.Notifications.Toasts.CallToast.CONTEXT.FOREGROUND;
        this._callNotification = callNotification;

        this.conversationIdentity = this._callNotification.conversationIdentity;

        if (lib && this.conversationIdentity && this.conversationIdentity !== "") {
            this._conversation = lib.getConversationByIdentity(this.conversationIdentity);
        }
        this._updateCallInformation();
    }, {
        conversationIdentity: null,
        _callInformation: null,
        _conversation: null,
        _currentState: null,
        _context: null,

        _getState: function () {
            var libState = this._conversation && this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            log("callToast: _getState() libState=" + LibWrap.Conversation.local_LIVESTATUSToString(libState));

            var callToastState;
            switch (true) {
                case LibStateMapping.NONE.contains(libState):
                    callToastState = States.NONE;
                    break;
                case LibStateMapping.RINGING.contains(libState):
                    callToastState = States.RINGING;
                    break;
                case LibStateMapping.LIVE.contains(libState):
                    callToastState = States.LIVE;
                    break;
                case LibStateMapping.IGNORE.contains(libState):
                    callToastState = States.IGNORE;
                    break;
                default:
                    callToastState = States.NONE;
                    break;
            }
            log("callToast: _getState() callToastState=" + callToastState);
            return callToastState;
        },

        
        _onToastActivated: function (params) {
            log("callToast: _onToastActivated() " + (params ? params.arguments : "<null>"));
            log("callToast: ACTIVATED event dispatched");

            var toastParams = {};

            try {
                toastParams = JSON.parse(params.arguments);
            } catch (e) {
                log ("error parsing activation params json");
            }

            
            switch (toastParams.action) {
                case answerActions.REJECT:
                    this.dispatchEvent(Skype.Notifications.Toasts.CallToast.Events.REJECTED);
                    break;
                default:
                    this.dispatchEvent(Skype.Notifications.Toasts.CallToast.Events.ACTIVATED);
                    break;
            }

            this.dispose();
        },

        _onToastDismiss: function (e) {
            var reasons = Windows.UI.Notifications.ToastDismissalReason;
            log("callToast: _onToastDismiss() " + e.reason);

            switch (e.reason) {
                case reasons.applicationHidden:
                    log("callToast: CLOSE event dispatched");
                    this.dispatchEvent(Skype.Notifications.Toasts.CallToast.Events.CLOSE);
                    break;

                case reasons.timedOut:
                case reasons.userCanceled:
                    log("callToast: REJECTED event dispatched");
                    this.dispatchEvent(Skype.Notifications.Toasts.CallToast.Events.REJECTED);
                    break;
            }

            this.dispose();
        },

        _onToastFailed: function (e) {
            log("callToast: _onToastFailed() " + e.errorCode);
            log("callToast: CLOSE event dispatched");
            this.dispatchEvent(Skype.Notifications.Toasts.CallToast.Events.CLOSE);

            this.dispose();
        },

        _updateCallInformation: function () {
            this._callInformation = {
                id: this.conversationIdentity,
                name: this._callNotification.displayName,
                avatar: LibWrap.AvatarManager.offlineAvatarURI(this.conversationIdentity),
                note: "callnotification.note".translate(),
            };

            if (this._conversation) {
                var name = this._conversation.getStrProperty(LibWrap.PROPKEY.conversation_DISPLAYNAME);
                if (name && name !== this.conversationIdentity) {
                    this._callInformation.name = name;
                }
                
                var partnerContact = this._conversation.partnerContact;
                if (partnerContact) {
                    var contactType = partnerContact.getContactType();
                    if (contactType === LibWrap.Contact.type_UNDISCLOSED_PSTN) {
                        this._callInformation.name = "toast.unknownCallerId".translate();
                    }
                }                                            
            }                        
        },
       
        _monitorConversationState: function () {
            if (this._conversation) {
                log("callToast: _monitorConversationState() start conversation monitoring for " + this.conversationIdentity);
                var isBackgroundTask = this._context === Skype.Notifications.Toasts.CallToast.CONTEXT.BACKGROUND;
                if (isBackgroundTask) {
                    
                    this.regInterval(this._onLiveStatusChange.bind(this), BACKGROUND_CONVERSATION_POLLING_INTERVAL);
                } else {
                    this._conversation.subscribePropChanges([LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS]);
                    this.regEventListener(this._conversation, "propertieschanged", this._onLiveStatusChange.bind(this));
                }
            } else {
                log("callToast: _monitorConversationState() cannot start conversation monitoring for " + this.conversationIdentity);
            }
        },

        _onLiveStatusChange: function () {
            var oldState = this._currentState;
            var newState = this._getState();

            if (oldState === newState) {
                return;
            }

            switch (true) {
                case (oldState === States.NONE) && (newState === States.LIVE):
                case (oldState === States.RINGING) && (newState === States.NONE || newState === States.LIVE):
                case (oldState === States.IGNORE) && (newState === States.NONE || newState === States.LIVE):
                    this._hide();
                    break;
            }
            this._currentState = newState;
        },

        _hide: function () {
            log("callToast: _hide() hiding the toast");
            Windows.UI.Notifications.ToastNotificationManager.createToastNotifier().hide(this._toast);
            this.dispatchEvent(Skype.Notifications.Toasts.CallToast.Events.CLOSE);
            this.dispose();
        },

        _onDispose: function () {
            this._conversation && this._conversation.discard();
        },

        _getToastParams: function (action) {
            
            var toastParams;
            if (this._context === Skype.Notifications.Toasts.CallToast.CONTEXT.FOREGROUND) {
                toastParams = JSON.stringify({
                    identity: this._callInformation.id,
                    action: action
                });
            } else {
                
                var params = JSON.parse(JSON.stringify(this._callNotification));
                switch(action) {
                    case answerActions.AUDIO:
                        params.answerType = "voice";
                        break;
                    case answerActions.VIDEO:
                        params.answerType = "video";
                        break;
                    case answerActions.REJECT:
                        params = { action: "reject" };
                        break;
                }
                params.type = "local-toast-call";
                toastParams = JSON.stringify(params);
            }
            return toastParams;
        },

        _getXmlTemplate: function () {
            var template = new Windows.Data.Xml.Dom.XmlDocument();
            template.loadXml(Skype.Notifications.Toasts.CallToast.TOAST_DEFINITION);

            var name = this._callInformation.name || this._callInformation.id;

            this._setXmlNodeSafe(template.selectSingleNode("//text[@id=1]"), name, this._callInformation.id);
            template.selectSingleNode("//text[@id=2]").innerText = this._callInformation.note;

            var avatarSrc = template.selectSingleNode("//image[@id=1]/@src");
            avatarSrc.innerText = this._callInformation.avatar;

            var avatarAlt = template.selectSingleNode("//image[@id=1]/@alt");
            this._setXmlNodeSafe(avatarAlt, name, this._callInformation.id);

            template.selectSingleNode("//command[@id='voice']/@arguments").innerText = this._getToastParams(answerActions.AUDIO);
            template.selectSingleNode("//command[@id='video']/@arguments").innerText = this._getToastParams(answerActions.VIDEO);
            template.selectSingleNode("//command[@id='decline']/@arguments").innerText = this._getToastParams(answerActions.REJECT);
            template.selectSingleNode("/toast").setAttribute("launch", this._getToastParams(answerActions.FOCUS));

            return template;
        },

        _setXmlNodeSafe: function (node, value, fallbackValue) {
            try {
                node.innerText = value;
            } catch (error) {
                if (error.number === -2147467259) { 
                    node.innerText = fallbackValue;
                }
                log("Unable to set the name to callToast template: " + error);
            }
        },

        
        show: function () {
            log("callToast: show()");

            var notifier = Windows.UI.Notifications.ToastNotificationManager.createToastNotifier();
            if (notifier.setting !== Windows.UI.Notifications.NotificationSetting.enabled) {
                log("callToast: toasts are disabled by NotificationSettings");
                log("callToast: CLOSE event dispatched");
                this.dispatchEvent(Skype.Notifications.Toasts.CallToast.Events.CLOSE);
                return;
            }

            this._currentState = this._getState();
            if (this._currentState === States.NONE || this._currentState === States.RINGING) {
                var template = this._getXmlTemplate();

                this._toast = new Windows.UI.Notifications.ToastNotification(template);
                this.regEventListener(this._toast, "dismissed", this._onToastDismiss.bind(this));
                this.regEventListener(this._toast, "activated", this._onToastActivated.bind(this));
                this.regEventListener(this._toast, "failed", this._onToastFailed.bind(this));

                log("callToast: show() display toast to user");
                notifier.show(this._toast);

                
                this._monitorConversationState();
            } else {
                log("callToast: CLOSE event dispatched");
                this.dispatchEvent(Skype.Notifications.Toasts.CallToast.Events.CLOSE);
            }
        }
    }, {
        
        Events: {
            REJECTED: "rejected",
            CLOSE: "close",
            ACTIVATED: "activated"
        },
        CONTEXT: {
            FOREGROUND: 0,
            BACKGROUND: 1
        },

        TOAST_DEFINITION: ''
        + '<toast duration="long">'
        + '    <visual>'
        + '         <binding template="ToastImageAndText02">'
        + '             <image id="1" alt="" src="" />'
        + '             <text id="1"></text>'
        + '             <text id="2"></text>'
        + '        </binding>'
        + '    </visual>'
        + '    <commands scenario="incomingCall">'
        + '        <command id="video" arguments=""/>'
        + '        <command id="voice" arguments=""/>'
        + '        <command id="decline" arguments=""/>'
        + '    </commands>'
        + '    <audio src="ms-winsoundevent:Notification.Looping.Call" loop="true" />'
        + '</toast>'
    });

    WinJS.Namespace.define("Skype.Notifications.Toasts", {
        CallToast: WinJS.Class.mix(callToast, WinJS.Utilities.eventMixin, Skype.Class.disposableMixin)
    });
})(LibWrap, this);
