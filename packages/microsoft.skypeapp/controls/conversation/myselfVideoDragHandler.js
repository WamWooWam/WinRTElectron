

(function () {
    "use strict";

    var myselfVideoDragHandler = WinJS.Class.mix(WinJS.Class.define(
        function (element, conversationSharedState) {
            this._element = element;
            this._conversationSharedState = conversationSharedState;

            this._stopSlowDownTransition = this._stopSlowDownTransition.bind(this);

            this.regEventListener(element, 'pointerdown', this._pointerDown.bind(this));
            this.regEventListener(element, 'MSGestureStart', this._gestureStart.bind(this));
            this.regEventListener(element, 'MSGestureChange', this._gestureChange.bind(this));
            this.regEventListener(element, 'MSGestureEnd', this._gestureChange.bind(this));

            this.regBind(this._conversationSharedState, "state", this._checkDragging.bind(this));
            this.regBind(this._conversationSharedState, "isScreenShare", this._checkDragging.bind(this));
            this.regEventListener(window, 'resize', this._checkDragging.bind(this));
        }, {
            
            _element: null,

            
            _initialOffset: { x: 0, y: 0 },
            _initialY: 0,
            _conversationSharedState: null,

            
            _docking: false,
            _draggingEnabled: true,
            _dockedRight: true,
            _pipVisible: true,
            _isDragging: false,
            _draggingTimeout: null,
            _parentTop: 0,

            dockedRight: {
                get: function () {
                    return this._dockedRight;
                },
                set: function (value) {
                    if (this._dockedRight !== value) {
                        this._dockedRight = value;
                        Skype.UI.Util.setClass(this._element, "DOCKEDLEFT", !value);
                    }
                }
            },

            isDragging: {
                get: function () {
                    return this._isDragging;
                },
                set: function (value) {
                    if (this._isDragging !== value) {
                        this._isDragging = value;
                        if (this._isDragging) {
                            this._parentTop = this._element.parentNode.offsetTop;
                        } else {
                            this._element.style.left = "auto";
                            this._element.style.top = "auto";
                        }
                        Skype.UI.Util.setClass(this._element, "DRAGGING", value);
                    }
                }
            },

            _pointerDown: function (evt) {
                if (!this._draggingEnabled) {
                    return;
                }
                Skype.UI.Util.getGestureObjectForEvent(evt).addPointer(evt.pointerId);
            },

            _gestureStart: function (evt) {
                if (!this._draggingEnabled) {
                    return;
                }

                if (this._draggingTimeout) {
                    this._stopSlowDownTransition();
                }

                this._initialOffset.x =  evt.offsetX; 
                this._initialOffset.y = evt.offsetY;
                this._initialY = this._element.offsetTop;
                this.isDragging = true;

                var leftInnerOffset = this._element.offsetWidth - evt.offsetX;
                this._updateDragPos(evt.clientX  - this._element.parentNode.offsetParent.offsetLeft - leftInnerOffset, evt.clientY - evt.offsetY);
            },

            _checkDragging: function () {
                
                var conversationIsLive = this._conversationSharedState && this._conversationSharedState.state === Skype.UI.Conversation.State.LIVE; 
                var is1to1Call = this._conversationSharedState && this._conversationSharedState.isDialog && !this._conversationSharedState.isScreenShare;

                this._draggingEnabled = document.body.clientWidth > myselfVideoDragHandler.MYSELFVIDEO_DRAG_LIMIT && this._pipVisible &&
                    conversationIsLive && is1to1Call; 
            },

            _gestureChange: function (evt) {
                if (!this._draggingEnabled || !this._element.offsetParent) {
                    return;
                }
                var transX = evt.translationX,
                    gestureObject = Skype.UI.Util.getGestureObjectForEvent(evt),
                    cumulativeTransX = gestureObject._cumulativeTransX || 0,
                    newCumulativeTransX = transX + cumulativeTransX,
                    absNewCumulativeTransX = Math.abs(newCumulativeTransX);

                gestureObject._cumulativeTransX = newCumulativeTransX;
                gestureObject._cumulativeTransY = (gestureObject._cumulativeTransY || 0) + evt.translationY;

                if (absNewCumulativeTransX > this._element.offsetParent.offsetWidth / 2 ||
                    evt.clientY - this._initialOffset.y + this._element.clientHeight < 0 ||
                    evt.clientY - this._initialOffset.y > this._element.offsetParent.offsetHeight ||
                    evt.type === 'MSGestureEnd') {

                    
                    if (!this._docking) {
                        this._docking = true;
                        gestureObject.stop(); 
                        WinJS.Utilities.addClass(this._element, 'SLOWDOWNTRANSITION');
                        var dockedRight = true;
                        if ((evt.clientX - this._element.parentNode.offsetParent.offsetLeft) < this._element.offsetParent.offsetWidth / 2) { 
                            dockedRight = false;
                        }

                        this.dockedRight = dockedRight;
                        var parentLeft = this._element.parentNode.offsetLeft,
                            parentRight = parentLeft + this._element.parentNode.offsetWidth;

                        var dockedLeft = this.dockedRight ? parentRight - this._element.clientWidth : parentLeft;
                        this._updateDragPos(dockedLeft, this._initialY);
                    }
                    if (evt.type === 'MSGestureEnd') {
                        this._draggingTimeout = this.regTimeout(this._stopSlowDownTransition, 500);
                        gestureObject._cumulativeTransX = 0;
                        this._docking = false;
                    }
                } else {
                    
                    var left = evt.clientX - this._element.parentNode.offsetParent.offsetLeft - this._initialOffset.x;
                    var top = evt.clientY - this._initialOffset.y;

                    this._updateDragPos(left, top);
                }
                evt.stopPropagation(); 

            },

            _stopSlowDownTransition: function () {
                WinJS.Utilities.removeClass(this._element, 'SLOWDOWNTRANSITION');
                this.isDragging = false;
                this._draggingTimeout = null;
            },

            _updateDragPos: function (left, top) {
                if (left != null && top != null && this.isDragging) {
                    this._element.style.left = left + "px";
                    this._element.style.top = top + "px";
                }
            },

            
            onVideoVisibilityChanged: function (pipVisible) {
                this._pipVisible = pipVisible;
                this._checkDragging();
            },
        }, {
            MYSELFVIDEO_DRAG_LIMIT: 500,

        }), Skype.Class.disposableMixin, WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.UI.Conversation", {
        MyselfVideoDragHandler: myselfVideoDragHandler
    });
}());

