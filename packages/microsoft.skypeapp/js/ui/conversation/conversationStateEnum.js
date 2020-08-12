

(function () {
    "use strict";

    var state = {
        CHAT: 1,
        PRE_LIVE: 2,
        INCOMMING_CALL: 3,
        LIVE: 4,
        LIVE_HOLD_LOCAL: 5,
        LIVE_HOLD_REMOTE: 6,
        LIVE_ENDING: 7,
        ERROR_IN_LIVE: 8,
        CHAT_CAN_JOIN: 9
    };

    function translateStateToClassName(stateToTranslate) {
        
        
        
        
        
        

        switch (stateToTranslate) {
            case state.CHAT: return "CHAT";
            case state.PRE_LIVE: return "PRELIVE";
            case state.INCOMMING_CALL: return "INCOMINGCALLRINGING";
            case state.LIVE: return "LIVE";
            case state.LIVE_HOLD_LOCAL: return "LIVEHOLDLOCAL";
            case state.LIVE_HOLD_REMOTE: return "LIVEHOLDREMOTE";
            case state.LIVE_ENDING: return "LIVEENDING";
            case state.ERROR_IN_LIVE: return "ERRORINLIVE";
            case state.CHAT_CAN_JOIN: return "CHATCANJOIN";
        }
        return "";
    }

    function isLiveState(stateToCheck) {
        
        
        
        
        
        

        return [state.LIVE, state.PRE_LIVE, state.ERROR_IN_LIVE, state.LIVE_HOLD_LOCAL, state.LIVE_HOLD_REMOTE, state.LIVE_ENDING].contains(stateToCheck);
    }

    WinJS.Namespace.define("Skype.UI.Conversation", {
        State: state,
        translateStateToClassName: translateStateToClassName,
        isLiveState: isLiveState,
    });

}());