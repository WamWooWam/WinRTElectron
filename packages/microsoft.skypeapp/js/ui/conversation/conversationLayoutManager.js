

(function () {
    "use strict";

    var LAYOUT = {
        NO_LAYOUT: -1,
        ALL_PARTICIPANTS: 0,
        PRESENTATION: 1,
        ONE_TO_ONE: 2,
        NO_PARTICIPANT: 3,
        PINNED: 4
    };

    var conversationLayoutManager = WinJS.Class.define(
        function conversationLayoutManager_constructor(domPositionHandler, isDialog) {
            this.items = [];
            this._isDialog = isDialog;
            this._domPositionHandler = domPositionHandler;
        }, {
            _domPositionHandler: null,
            _hasScreenShare: false,
            _isDialog: false,
            _currentScreenWidth: 0,
            _activeSpeakers: null,

            
            _allParticipantLayout: null,
            _oneToOneLayout: null,
            _presentationLayout: null,
            _noParticipantLayout: null,
            _pinnedLayout: null,

            items: null,
            _pinnedItem: null,
            _currentLayout: LAYOUT.NO_LAYOUT, 

            _getLayout: function () {
                switch (this._currentLayout) {
                    case LAYOUT.ALL_PARTICIPANTS:
                        this._allParticipantLayout = this._allParticipantLayout || new Skype.UI.Conversation.ConversationAllParticipantLayout(this);
                        return this._allParticipantLayout;
                    case LAYOUT.ONE_TO_ONE:
                        this._oneToOneLayout = this._oneToOneLayout || new Skype.UI.Conversation.Conversation1to1Layout(this);
                        return this._oneToOneLayout;
                    case LAYOUT.PRESENTATION:
                        this._presentationLayout = this._presentationLayout || new Skype.UI.Conversation.ConversationPresentationLayout(this);
                        return this._presentationLayout;
                    case LAYOUT.NO_PARTICIPANT:
                        this._noParticipantLayout = this._noParticipant || new Skype.UI.Conversation.ConversationNoParticipantLayout(this);
                        return this._noParticipantLayout;
                    case LAYOUT.PINNED:
                        this._pinnedLayout = this._pinnedLayout || new Skype.UI.Conversation.ConversationPinnedLayout(this);
                        return this._pinnedLayout;
                }
                return null;
            },

            _updateLayout: function (forceLayoutUpdate) {
                if (this.items.length === 0 && this._isDialog) {
                    
                    return false;
                }
                var previousLayout = this._currentLayout;

                if (this._pinnedItem) {
                    this._currentLayout = LAYOUT.PINNED;
                } else if (this._hasScreenShare || (this.items.length > 1 && this._isDialog)) {
                    
                    this._currentLayout = LAYOUT.PRESENTATION;
                } else if (this.items.length > 1) {
                    this._currentLayout = LAYOUT.ALL_PARTICIPANTS;
                } else if (this.items.length === 0) {
                    this._currentLayout = LAYOUT.NO_PARTICIPANT;
                } else {
                    this._currentLayout = LAYOUT.ONE_TO_ONE;
                }

                if (previousLayout !== this._currentLayout || forceLayoutUpdate) {
                    this.dispatchEvent(conversationLayoutManager.Events.LayoutTypeChanged, this._currentLayout); 
                    this._getLayout().onLayoutChanged({ currentScreenWidth: this._currentScreenWidth, screenWidth: screen.width, activeSpeakers: this._activeSpeakers });
                }
                return true;
            },

            _getItemById: function (id) {
                return this.items.first(function (item) {
                    return item.id === id;
                });
            },

            _onItemToggled: function (streamWrapper) {
                if (this._isDialog) {
                    return;
                }

                
                if (streamWrapper.pinned && this._pinnedItem) {
                    this._pinnedItem.pinned = false;
                }

                this._pinnedItem = streamWrapper.pinned ? streamWrapper : null;
                this._updateLayout();
                this.updateStageGrid(); 
            },

            

            onResize: function (width, height, screenWidth) {
                
                
                
                
                
                
                
                
                
                
                
                

                this._currentScreenWidth = screenWidth;

                this._updateLayout(); 

                if (screenWidth && this._currentLayout === LAYOUT.ALL_PARTICIPANTS) {
                    
                    var layout = this._getLayout();
                    if (layout) { 
                        layout.onScreenWidthChanged(screenWidth, screen.width);
                    }
                }
            },

            onCallStarted: function () {
                
                
                
                
                

                this._hasScreenShare = false;
                this._pinnedItem = null;
                this._activeSpeakers = [];
                this._currentLayout = LAYOUT.NO_LAYOUT; 
                if (!this._updateLayout()) {
                    
                    this.dispatchEvent(conversationLayoutManager.Events.LayoutTypeChanged, this._currentLayout);
                }
            },

            stageSpeakersChanged: function (vector) {
                
                
                
                
                
                

				this._activeSpeakers = vector;
                this._updateLayout(); 

                var layout = this._getLayout();
                if (layout) { 
                    layout.stageSpeakersChanged(vector);
                }
            },

            setItemPosition: function (item, itemUiPosition) {
                
                
                

                if (item.itemPosition !== itemUiPosition) {
                    item.itemPosition = itemUiPosition;
                    this._domPositionHandler.updateItemDOMPosition(item);
                }
            },

            updateStageGrid: function (item, itemColumn) {
                
                
                
                
                

                this._domPositionHandler.updateStageGrid();
            },

            onItemAdded: function (streamWrapper) {
                
                
                

                var id = streamWrapper.id;
                log("ConversationLayoutManager: onItemAdded " + id);

                if (this._getItemById(id)) {
                    log("ConversationLayoutManager: ERROR, invalid state - duplicate item " + id);
                    return;
                }
                this.regEventListener(streamWrapper, Skype.UI.ConversationParticipantStream.Events.ParticipantStreamToggled, this._onItemToggled.bind(this, streamWrapper));
                this.items.push(streamWrapper);
                this._updateLayout();

                this._getLayout().onItemAdded(streamWrapper); 
            },

            onItemRemoved: function (id) {
                
                
                

                var item = this._getItemById(id);

                if (!item) {
                    log("ConversationLayoutManager: ERROR, invalid state - missing item " + id);
                    return null;
                }
                this.unregObjectEventListeners(item);
                this.items.removeObject(item); 
                if (this._pinnedItem === item) {
                    this._pinnedItem = null;
                }

                var layout = this._getLayout();  
                if (layout && this.items.length > 0) { 
                    layout.onItemRemoved(item);
                }

                
                this._updateLayout();

                return item;
            },

            onVideoScreenShareStarted: function (started) {
                
                
                
                

                
                var someItemHasScreenshare = this.items.first(function (item) {
                    return item.isScreenShare;
                });

                this._hasScreenShare = !!someItemHasScreenshare;
                this._updateLayout(true);
            },

            getCurrentLayoutClass: function () {
                switch (this._currentLayout) {
                    case LAYOUT.ALL_PARTICIPANTS:
                        return "ALL_PARTICIPANTS";
                    case LAYOUT.ONE_TO_ONE:
                        return "ONE_TO_ONE";
                    case LAYOUT.PRESENTATION:
                        return "PRESENTATION";
                    case LAYOUT.NO_PARTICIPANT:
                        return "NO_PARTICIPANT";
                    case LAYOUT.PINNED:
                        return "PINNED";
                }
                return "";
            }

        }, {
            Events: {
                LayoutTypeChanged: "LayoutTypeChanged",
            },
            Layout: LAYOUT
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationLayoutManager: WinJS.Class.mix(conversationLayoutManager, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin),
    });

}());