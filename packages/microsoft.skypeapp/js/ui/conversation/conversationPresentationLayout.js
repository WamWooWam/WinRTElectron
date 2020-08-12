

(function () {
    "use strict";

    var LayoutPlacement = Skype.UI.LiveGroupConversation.LayoutPlacement;

    var conversationPresentationLayout = WinJS.Class.define(
        function conversationPresentationLayout_constructor(layoutManager) {
            this._layoutManager = layoutManager;
        }, {
            _layoutManager: null,
            _activeSpeaker: null,

            _checkSSLayoutPosition: function () {
                

                this._layoutManager.items.forEach(function (item) {
                    this._layoutManager.setItemPosition(item, item.isScreenShare ? LayoutPlacement.PRESENTATION : LayoutPlacement.ROSTER);
                }.bind(this));

                
                

                var itemAtPresentation = this._layoutManager.items.first(function (item) {
                    return item.itemPosition === LayoutPlacement.PRESENTATION;
                });

                if (!itemAtPresentation) {
                    this._layoutManager.setItemPosition(this._layoutManager.items[0], LayoutPlacement.PRESENTATION);
                }
            },

            _setItemUniquePosition: function (item, uiPosition) {
                var focusedElement = document.activeElement;
                var updateFocus = focusedElement && focusedElement.winItem && uiPosition == LayoutPlacement.PRESENTATION_SPEAKER;

                var blockingItem = this._layoutManager.items.first(function (it) {
                    return it.itemPosition === uiPosition;
                });
                if (blockingItem) {
                    this._layoutManager.setItemPosition(blockingItem, LayoutPlacement.ROSTER);
                }
                this._layoutManager.setItemPosition(item, uiPosition);

                if (updateFocus) {
                    item.element.focus();
                }
            },

            _getSSAvatar: function () {
                var itemAtPresentation = this._layoutManager.items.first(function (it) {
                    return it.itemPosition === LayoutPlacement.PRESENTATION;
                });
                if (itemAtPresentation) {
                    return this._layoutManager.items.first(function (it) {
                        return it != itemAtPresentation && it.participantId === itemAtPresentation.participantId;
                    });
                }
                return null;
            },

            _setDefaultActiveSpeaker: function () {
                var screenSharingAvatar = this._getSSAvatar();
                this._activeSpeaker = 0;
                if (screenSharingAvatar) {
                    this._setItemUniquePosition(screenSharingAvatar, LayoutPlacement.PRESENTATION_SPEAKER);
                    this._activeSpeaker = screenSharingAvatar.participantId;
                }
            },

            
            onItemAdded: function (item) {
                
                
                
                

                var isActiveSpeaker = this._activeSpeaker === item.participantId && !item.isScreenShare;

                if (item.isScreenShare) {
                    this._setItemUniquePosition(item, LayoutPlacement.PRESENTATION);
                } else if (isActiveSpeaker) {
                    this._setItemUniquePosition(item, LayoutPlacement.PRESENTATION_SPEAKER);
                } else {
                    this._layoutManager.setItemPosition(item, LayoutPlacement.ROSTER);
                }
            },

            onItemRemoved: function (item) {
                
                
                
                

                if (item.itemPosition === LayoutPlacement.PRESENTATION_SPEAKER) {
                    this._setDefaultActiveSpeaker();
                }

                if (item.itemPosition === LayoutPlacement.PRESENTATION) {
                    
                    var focusedElement = document.activeElement;
                    if (focusedElement && focusedElement.winItem) {
                        focusedElement.blur();
                    }
                }
            },

            stageSpeakersChanged: function (vector) {
                

                this._activeSpeaker = vector[0];
                var activeSpeakerCandidate = this._layoutManager.items.first(function (it) {
                    return it.participantId === vector[0] && !it.isScreenShare;
                });
                if (activeSpeakerCandidate) {
                    this._setItemUniquePosition(activeSpeakerCandidate, LayoutPlacement.PRESENTATION_SPEAKER);
                }
            },

            onLayoutChanged: function (options) {

                
                this._checkSSLayoutPosition();

                
                if (options.activeSpeakers.length > 0) {
                    this.stageSpeakersChanged(options.activeSpeakers);
                } else {
                    this._setDefaultActiveSpeaker();
                }
            },
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationPresentationLayout: conversationPresentationLayout
    });

}());