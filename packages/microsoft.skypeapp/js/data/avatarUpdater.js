

(function () {
    "use strict";

    var counter = 0;

    var avatarUpdater = WinJS.Class.define(function (avatarManager) {
        this._map = {};
        this._avatarManager = avatarManager;
        this._handleAvatarUriChange = this._handleAvatarUriChange.bind(this);
        this.regEventListener(avatarManager, "avatarurichange", this._handleAvatarUriChange);
    },
        {
            
            _map: null, 
            _avatarManager: null,

            subscribe: function (identity, handler) {
                assert(handler, "SUBSCRIBING TO AVATAR UPDATES WITH NULL HANDLER?!");

                var value = this._getMappedValueForIdentity(identity);

                value.handlers.push(handler);

                return {
                    dispose: function () {
                        if (!this.isDisposed) {
                            this._unsubscribe(identity, handler);
                        }
                    }.bind(this),
                };
            },

            getAvatarURI: function (identity) {
                var value = this._getMappedValueForIdentity(identity);
                if (!value.uri) {
                    value.uri = this._createUniqueURI(this._avatarManager.getAvatarURI(identity));
                }
                return value.uri;
            },
            
            _getMappedValueForIdentity: function(identity) {
                var value = this._map[identity];
                if (!value) {
                    value = {
                        handlers: [],
                        uri: null
                    };
                    this._map[identity] = value;
                }
                return value;
            },
            _createUniqueURI: function(uri) {
                return uri + "?" + counter++;
            },
          
            
            _unsubscribe: function (identity, handler) {
                var value = this._map[identity];
                if (value) {
                    var handlers = value.handlers;
                    var ix = handlers.indexOf(handler);
                    if (ix !== -1) {
                        handlers.removeAt(ix, 1);
                    }
                }
            },
            _handleAvatarUriChange: function (e) {
                if (this._isDisposing) {
                    return;
                }

                var identity = e.detail[0];
                var uri = e.detail[1];
                var value = this._map[identity];
                if (value) {
                    value.uri = this._createUniqueURI(uri);
                    value.handlers.forEach(function (h) { h(value.uri, identity); });
                }
            }
        }, {
            instance: {
                get: function () {
                    if (!instance) {
                        instance = new Skype.Model.AvatarUpdater(lib.avatarmanager);
                    }
                    return instance;
                }
            },
            dispose: function () {
                instance && instance.dispose();
                instance = null;
            }

        });

    var instance;

    WinJS.Namespace.define("Skype.Model", {
        AvatarUpdater: WinJS.Class.mix(avatarUpdater, Skype.Class.disposableMixin)
    });


}());