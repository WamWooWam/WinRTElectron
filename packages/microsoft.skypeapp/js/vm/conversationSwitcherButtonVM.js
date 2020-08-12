

(function () {
    "use strict";

    var using = {
        UnreadCountQuery: LibWrap.VM.UnreadCountQuery
    };
    
    var NEW_MESSAGE_PULSE_TIMEOUT_MS = 4500;

    var ConversationSwitcherButtonVM = MvvmJS.Class.define(function () {
        this._query = new using.UnreadCountQuery(lib);
        this._resetUnreadStatus = this._resetUnreadStatus.bind(this);
    }, {
        _query: null,
        _unreadCount: 0,
        _unreadPulseTimer: null,

        _resetUnreadStatus: function () {
            this.hasNewUnread = false;
        },

        _setNewPulseAnimationTimeout: function () {
            this._unreadPulseTimer && this.unregTimeout(this._unreadPulseTimer);
            this._unreadPulseTimer = this.regTimeout(this._resetUnreadStatus, NEW_MESSAGE_PULSE_TIMEOUT_MS);
        },

        _updateUnreadCount: function (unreadCount) {
            var prevUnreadCount = this._unreadCount;
            this.hasUnread = unreadCount > 0;
            this.hasNewUnread = unreadCount > 0 && unreadCount > prevUnreadCount;

            if (this.hasNewUnread) {
                this._setNewPulseAnimationTimeout();
            }

            this.formattedUnreadCount = unreadCount !== 0 ? (unreadCount > 99 ? "9+" : "" + unreadCount) : "";
            this.formattedAriaUnreadCountLabel = "aria_conversation_button".translate(unreadCount);
            this._unreadCount = unreadCount;
        },

        _handleUnreadCountChanged: function (event) {
            var unreadCount = event.detail[0];
            var identity = event.detail[1];

            
            if (unreadCount > this._unreadCount && identity === Skype.Application.state.focusedConversation.identity) {
                unreadCount--;
            }

            if (unreadCount !== this._unreadCount) {
                this._updateUnreadCount(unreadCount);
            }
        },

        
        run: function () {
            log("ConversationSwitcherButtonVM: run");

            this.regEventListener(this._query, "countchanged", this._handleUnreadCountChanged.bind(this));
            this._query.reload();
        },

    }, {
        
        hasUnread: false,

        
        hasNewUnread: "",

        
        formattedUnreadCount: "",

        
        formattedAriaUnreadCountLabel: "aria_conversation_button".translate(0),
    }, {
        external: using
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationSwitcherButtonVM: ConversationSwitcherButtonVM
    });
}());