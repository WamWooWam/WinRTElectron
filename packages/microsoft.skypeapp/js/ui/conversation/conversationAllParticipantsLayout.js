

(function () {
    "use strict";

    var document;
    var stateView;

    function updateDependencies(dependencies) {
        dependencies = dependencies || {};
        document = dependencies.document || window.document;
        stateView = dependencies.stateView || Skype.Application.state.view;
    }

    var LayoutPlacement = Skype.UI.LiveGroupConversation.LayoutPlacement,
        MAX_ITEMS_ON_STAGE = 3;

    var conversationAllParticipantLayout = WinJS.Class.define(
        function conversationAllParticipantLayout_constructor(layoutManager, dependencies) {
            updateDependencies(dependencies);
            this._layoutManager = layoutManager;
            this._orderedItems = [];
            this._endingItems = [];
        }, {
            _layoutManager: null,
            _orderedItems: null,
            _maxVisibleItemsOnStage: 1,
            _focus: null,

            _updateItemPosition: function (item, itemPosition) {
                if (item.itemPosition !== itemPosition) {
                    this._layoutManager.setItemPosition(item, itemPosition);
                }
            },

            _update: function (focus) {
                var i, stageSize = Math.min(this._maxVisibleItemsOnStage, this._orderedItems.length);

                
                for (i = 0; i < stageSize ; i++) {
                    this._orderedItems[i].itemColumn = stageSize - i;
                }
                
                

                
                for (i = this._orderedItems.length - 1; i >= 0; i--) {
                    this._updateItemPosition(this._orderedItems[i], i < this._maxVisibleItemsOnStage ? LayoutPlacement.STAGE : LayoutPlacement.ROSTER);
                }

                if (focus) {
                    this._updateFocus(focus);
                }
            },

            _updateVisibleItemsOnStage: function (currentScreenWidth, fullScreenWidth) {
                var breakpoint1 = 0.4 * fullScreenWidth,
                    breakpoint2 = fullScreenWidth - 320;
                
                if (stateView.isPortrait) {
                    
                    var fullScreenHeight = document.body.clientHeight;
                    this._maxVisibleItemsOnStage = (fullScreenHeight * 0.4 / fullScreenWidth) > (fullScreenWidth / fullScreenHeight) ? 1 : 2;
                } else {
                    
                    
                    
                    this._maxVisibleItemsOnStage = currentScreenWidth < breakpoint1 ? 1 : currentScreenWidth >= breakpoint1 && currentScreenWidth < breakpoint2 ? 2 : 3;
                }
            },

            _getFocusedStream: function () {
                var rv = { order: -1, placement: Skype.UI.LiveGroupConversation.LayoutPlacement.NOT_SET };
                var focusedElement = document.activeElement;

                if (focusedElement && focusedElement.winItem) {
                    var item = this._orderedItems.first(function (item) { return item.element == focusedElement; });

                    if (!item) {
                        
                        rv.order = this._orderedItems.length;
                    } else {
                        rv.order = this._orderedItems.indexOf(item);
                        rv.placement = item.itemPosition;
                    }
                }

                return rv.order >= 0 ? rv : null;
            },

            _updateFocus: function (focus) {
                if (this._orderedItems.length == 0) {
                    return;  
                }

                if (focus.placement == LayoutPlacement.STAGE) {
                    var maxStageIndex = Math.min(this._orderedItems.length, this._maxVisibleItemsOnStage) - 1;

                    this._orderedItems[Math.min(maxStageIndex, focus.order)].element.focus();
                } else {
                    if (this._orderedItems.length <= this._maxVisibleItemsOnStage) {
                        
                        this._orderedItems[0].element.focus();
                    } else {
                        this._orderedItems[Math.min(focus.order, this._orderedItems.length - 1)].element.focus();
                    }
                }

            },

            _pushItemsState: function () {
                
                this._focus = this._getFocusedStream();

                this._orderedItems.forEach(function (oItem, index) {
                    if (oItem.isEnding) {
                        this._endingItems.push({
                            item: oItem,
                            pos: index
                        });
                    }
                }.bind(this));
            },

            _popItemsState: function () {
                
                this._endingItems.forEach(function (eItem) {
                    this._orderedItems.moveObjectTo(eItem.item, eItem.pos);
                }.bind(this));
                this._endingItems = [];

                this._update(this._focus);
            },

            _getItemByParticipantId: function (participantId) {
                return this._layoutManager.items.first(function (it) {
                    return it.participantId === participantId;
                });
            },

            _getIndexByParticipantId: function (participantId) {
                return this._orderedItems.index(function (it) {
                    return it.participantId === participantId;
                });
            },

            _isItemLocked: function (item) {
                return item.isEnding;
            },

            

            onItemAdded: function (item) {
                if (this._orderedItems.contains(item)) {
                    return; 
                }
                this._pushItemsState();

                this._orderedItems.insertAt(this._maxVisibleItemsOnStage, item); 

                this._popItemsState();
            },

            onItemRemoved: function (item) {
                this._pushItemsState();

                
                this._orderedItems.removeObject(item);

                if (this._orderedItems.length > 1) {
                    this._popItemsState();
                } else {
                    var focusedElement = document.activeElement;
                    if (focusedElement && focusedElement.winItem) {
                        
                        focusedElement.blur();
                    }
                }
            },

            stageSpeakersChanged: function (vector) {
                assert(vector.length <= MAX_ITEMS_ON_STAGE, "_sanityCheck check #4 -- sending too much items !");

                var item, itemIndex, isSpeaker, orderedItem, stageSize = Math.min(this._orderedItems.length, MAX_ITEMS_ON_STAGE);
                this._pushItemsState();

                
                for (var i = 0; i < vector.length; i++) {
                    itemIndex = this._getIndexByParticipantId(vector[i]);
                    item = this._getItemByParticipantId(vector[i]);
                    
                    if (item && itemIndex >= this._maxVisibleItemsOnStage) {
                        
                        for (var j = 0; j < stageSize; j++) {
                            orderedItem = this._orderedItems[j];
                            
                            if (orderedItem.participantId === vector[i]) {
                                break;
                            }
                            isSpeaker = vector.contains(orderedItem.participantId);

                            if (!this._isItemLocked(item) && !isSpeaker) {
                                this._orderedItems.swapItems(j, itemIndex);
                                break;
                            }
                        }
                    }
                }
                
                this._popItemsState();
            },

            onLayoutChanged: function (options) {
                assert(this._layoutManager.items.length > 1, "Why we have diferrent number ? We should switch to this layout at first place !");

                var focus = this._getFocusedStream();

                this._updateVisibleItemsOnStage(options.currentScreenWidth, options.screenWidth);
                this._orderedItems = this._layoutManager.items.slice(0);
                this._update(focus);
            },

            onScreenWidthChanged: function (currentScreenWidth, fullScreenWidth) {
                assert(this._layoutManager.items.length > 1, "Why we have diferrent number ? We shoudn't be in this layout !");

                var focus = this._getFocusedStream();

                this._updateVisibleItemsOnStage(currentScreenWidth, fullScreenWidth);
                this._update(focus);
            },
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationAllParticipantLayout: WinJS.Class.mix(conversationAllParticipantLayout, Skype.Class.disposableMixin)
    });

}());