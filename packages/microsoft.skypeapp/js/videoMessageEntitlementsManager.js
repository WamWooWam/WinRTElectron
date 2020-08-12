

(function () {
    "use strict";

    var entitlements = {
        sendEnabledKey: 'send_enabled',
        messagesLeftKey: 'messages_left'
    };

    var videoMessageEntitlementsManager = MvvmJS.Class.define(function () {
    }, {
        init: function () {
            Skype.Application.LoginHandlerManager.instance.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGIN_FULL, this._onLogin.bind(this));
            this.regEventListener(lib, "videomessagingentitlementchanged", this._handleEntitlementsChange.bind(this));
        },

        _onLogin: function () {
            this._handleEntitlementsChange();
        },

        _parseEntitlements: function (ids, values) {
            
            this.messagesLeft = 0;
            this.sendEnabled = false;

            var entitlementsCount = ids.getCount();
            var entitlement;
            for (var i = 0; i < entitlementsCount; i++) {
                entitlement = ids.get(i);
                if (entitlement === entitlements.messagesLeftKey) {
                    this.messagesLeft = values.get(i);
                } else if (entitlement === entitlements.sendEnabledKey) {
                    this.sendEnabled = values.get(i);
                }
            }
        },

        _handleEntitlementsChange: function () {
            log('videoMessageEntitlementsManager._handleEntitlementsChange:');
            var values = new LibWrap.VectUnsignedInt();
            var ids = new LibWrap.VectGIString();
            var entitlementsResult = lib.getVideoMessagingEntitlement(ids, values);
            this.isEntitled = entitlementsResult.isEntitled;
            this._parseEntitlements(ids, values);
            this.hasMessagesLeft = this.isEntitled && this.messagesLeft > 0;

            log('isEntitled: {0}'.format(this.isEntitled));
            log('sendEnabled: {0}'.format(this.sendEnabled));
            log('messagesLeft: {0}'.format(this.messagesLeft));
        }
    },
    {
        isEntitled: true,
        hasMessagesLeft: true,
        sendEnabled: false,
        messagesLeft: 0,
    },
    {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.VideoMessageEntitlementsManager();
                }
                return instance;
            }
        }
    });

    var instance;

    WinJS.Namespace.define("Skype", {
        VideoMessageEntitlementsManager: videoMessageEntitlementsManager
    });
}());