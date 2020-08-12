

(function () {

    "use strict";

    var callPushNotification = WinJS.Class.derive(Skype.Notifications.PushNotificationBase, function constructor(notification) {
        this._notification = notification;
    }, {
        _keepAliveSignal: null,

        _conversationId: {
            get: function () {
                return this._notification.conversationIdentity ? this._notification.conversationIdentity : this._notification.callerId;
            }
        },

        
        _onToastRejected: function () {
            var conversation = lib.getConversationByIdentity(this._conversationId);
            if (conversation) {
                log("toast rejected, rejecting call");
                conversation.leaveLiveSession(false);
                conversation.discard();
            }
            this._keepAliveSignal.complete();
        },


        
        _onToastClosed: function () {
            this._keepAliveSignal.complete();
        },

        _onToastActivated: function () {
            this._keepAliveSignal.complete();
        },

        
        handleAsync: function () {
            log("callPushNotification.handleAsync()");

            this._keepAliveSignal = new WinJS._Signal();

            Skype.Notifications.Tiles.update(this._notification.callerId, this._getDisplayName(this._notification.callerId, this._notification.displayName), "recent_call".translate());

            var toast = new Skype.Notifications.Toasts.CallToast(this._notification, Skype.Notifications.Toasts.CallToast.CONTEXT.BACKGROUND);

            if (lib) {
                log("pass PNH/call notification to lib.handleCallNotification");
                lib.handleCallNotification(this._notification.eventType, this._notification.nodeSpecificPayload, this._notification.genericPayload);
                toast.addEventListener(Skype.Notifications.Toasts.CallToast.Events.REJECTED, this._onToastRejected.bind(this));
                toast.addEventListener(Skype.Notifications.Toasts.CallToast.Events.CLOSE, this._onToastClosed.bind(this));
                toast.addEventListener(Skype.Notifications.Toasts.CallToast.Events.ACTIVATED, this._onToastActivated.bind(this));
            } else {
                log("no lib, no need to keep background task alive");
                this._keepAliveSignal.complete();
            }

            toast.show();

            
            
            
            
            
            
            if (this._notification.callId) {
                Windows.Storage.ApplicationData.current.localSettings.values["toastCallGUID"] = this._notification.callId;
                log("call GUID [{0}] toast shown".format(this._notification.callId));
            }

            return this._keepAliveSignal.promise.then(toast.dispose.bind(toast));
        }
    });

    WinJS.Namespace.define("Skype.Notifications", {
        CallPushNotification: callPushNotification
    });

}());