

(function () {
    "use strict";

    var conversationLayoutStreamWrapper = WinJS.Class.define(
        function conversationLayoutStreamWrapper_constructor(participantStream) {
            this._participantStream = participantStream;
            this.element.winItem = this;
            this.forwardEvent(participantStream, Skype.UI.ConversationParticipantStream.Events.ParticipantStreamToggled);
        }, {
            _participantStream: null,
            _itemPosition: Skype.UI.LiveGroupConversation.LayoutPlacement.NOT_SET,

            

            itemPosition: {
                set: function (value) {
                    if (value !== this._itemPosition) {
                        this._itemPosition = value;
                        
                        this._participantStream.setUIPosition(value);
                    }
                },

                get: function () {
                    return this._itemPosition;
                }
            },

            itemColumn: 1,

            element: {
                get: function () {
                    return this._participantStream.element;
                }
            },

            id: {
                get: function () {
                    return this._participantStream.getId();
                }
            },

            participantId: {
                get: function () {
                    return this._participantStream.getParticipantId();
                }
            },

            isScreenShare: {
                get: function () {
                    return this._participantStream.isScreenShare;
                }
            },
            isEnding: {
                get: function () {
                    return this._participantStream.getEnding();
                }
            },

            pinned: {
                get: function () {
                    return this._participantStream.pinned;
                },

                set: function (val) {
                    if (this._participantStream.pinned !== val) {
                        this._participantStream.toggle();
                    }
                }
            }

        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationLayoutStreamWrapper: WinJS.Class.mix(conversationLayoutStreamWrapper, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());