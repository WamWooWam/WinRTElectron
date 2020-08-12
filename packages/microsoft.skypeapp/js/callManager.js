

(function () {
    "use strict";

    var liveConversations = [];
    var listeners = [];
    var NONLIVE_STATES = [LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE_FULL];
    var callToAnswer = null;
    var videoToStartIdentity = null;
    var answerCallTimeout = 30 * 1000; 

    function init() {
        var loginHandlerManager = Skype.Application.LoginHandlerManager;

        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGIN_READONLY, handleLogin);
        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGOUT, handleLogout);

        lib.addEventListener("conversationlistchange", handleConversationListChange);

        
        Skype.Application.state.bind("isApplicationActive", function (value) {
            if (lib && lib.loggedIn && value) {
                checkAutoAnswerCalls();
            }
        });
    }

    function handleLogin() {
        updateLiveConversationList();
    }
    window.traceFunction && (handleLogin = window.traceFunction(handleLogin, "CallManager,handleLogin"));

    function handleLogout() {
        listeners.clear();
        liveConversations.forEach(function (liveConversation) {
            liveConversation.discard();
        });
        liveConversations.clear();
        callToAnswer = null;
    }

    
    
    
    
    
    
    
    function otherConversationIsLive(conversation) {
        var givenID;
        if (conversation !== undefined) {
            givenID = conversation.getIdentity();
        }
        for (var i = 0; i < liveConversations.length; i++) {
            var ID = liveConversations[i].getIdentity();

            if (ID === givenID) {
                continue;
            }

            var status = liveConversations[i].getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            switch (status) {
                case LibWrap.Conversation.local_LIVESTATUS_STARTING:
                case LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME:
                case LibWrap.Conversation.local_LIVESTATUS_IM_LIVE:
                    return true;
            }
        }

        return false;
    }

    function checkAutoAnswerCalls() {
        if (Skype.Model.Options.auto_answer_calls) {
            updateLiveConversationList();
        }
    }

    function shouldAutomaticallyAnswerCall(status, conversation) {
        return Skype.Application.state.isApplicationActive &&
            status == LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME &&
            Skype.Model.Options.auto_answer_calls &&
            !Skype.Lib.isUpgradedCall(conversation.getIdentity()) &&
            !Skype.Application.state.view.isOnLockScreen &&
            
            
            
            !Skype.Application.BackgroundState.isInBackground();
    }

    function updateLiveConversationList() {
        var list = new LibWrap.VectUnsignedInt();
        lib.getConversationList(list, LibWrap.Conversation.list_TYPE_LIVE_CONVERSATIONS);
        var deleted = [];
        for (var i = 0; i < liveConversations.length; i++) {
            deleted.push(liveConversations[i].getObjectID());
        }
        var count = list.getCount();
        for (var j = 0; j < count; j++) {
            var conversation = lib.getConversation(list.get(j));
            var status = conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            if (shouldAutomaticallyAnswerCall(status, conversation)) {
                var identity = conversation.getIdentity();
                setImmediate(function () {
                    Actions.invoke(Skype.Model.Options.auto_answer_calls_with_video ? "answerVideo" : "answer", identity, { focusConversation: true });
                });
            }
            var index = deleted.indexOf(list.get(j));
            if (index >= 0) {
                deleted.splice(index, 1);
                conversation.discard();
                continue;
            }
            conversation.subscribePropChanges([LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS]);
            conversation.onpropertieschanged = handleConversationPropertiesChange.bind(conversation);
            conversation.oncapabilitieschanged = handleConversationCapabilitiesChange.bind(conversation);
            liveConversations.push(conversation);
        }
        for (var k = liveConversations.length - 1; k >= 0 ; k--) {
            if (deleted.indexOf(liveConversations[k].getObjectID()) >= 0) {
                liveConversations[k].discard();
                liveConversations.splice(k, 1);
            }
        }

        log("CallManager updateLiveConversationList: liveConversations: " + liveConversations.length);
        notifyChanges();
        updateScreenSaver();
        checkCallToAnswer();
    }

    function handleConversationListChange(event) {
        if (event.detail[1] === LibWrap.Conversation.list_TYPE_LIVE_CONVERSATIONS) {
            updateLiveConversationList();
        }
    }

    function videoShouldBeStartedForConversation(conversation) {
        return videoToStartIdentity && videoToStartIdentity === conversation.getIdentity();
    }

    function handleConversationPropertiesChange() {
        updateLiveConversationList();
        if (videoShouldBeStartedForConversation(this)) {
            
            var localLiveStatus = this.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            if (NONLIVE_STATES.contains(localLiveStatus)) {
                
                log("CallManager clearing cached video");
                videoToStartIdentity = null;
            }
        }
    }

    function handleConversationCapabilitiesChange() {
        log("Capabilities changed " + this.getIdentity());
        if (videoShouldBeStartedForConversation(this)) {
            log("CallManager starting cached video");
            if (Actions.invoke("startVideo", [videoToStartIdentity])) {
                videoToStartIdentity = null;
            }
        }
    }

    function notifyChanges() {
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i].liveConversationsChange) {
                listeners[i].liveConversationsChange();
            }
        }
    }

    function registerListener(listener) {
        var index = listeners.indexOf(listener);
        if (index < 0) {
            listeners.push(listener);
        }
    }

    function unregisterListener(listener) {
        var index = listeners.indexOf(listener);
        if (index >= 0) {
            listeners.splice(index, 1);
        }
    }

    function holdAllCalls(ignoredIdentity) {
        for (var i = 0; i < liveConversations.length; i++) {
            var status = liveConversations[i].getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            if (liveConversations[i].getIdentity() !== ignoredIdentity){
                if ([LibWrap.Conversation.local_LIVESTATUS_IM_LIVE, LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY].indexOf(status) > -1) {
                    
                    if (Skype.Application.state.view.isOnLockScreen) {
                        liveConversations[i].leaveLiveSession(false);
                    } else {
                        liveConversations[i].holdMyLiveSession();
                    }
                }
                if ([LibWrap.Conversation.local_LIVESTATUS_STARTING].indexOf(status) > -1) {
                    liveConversations[i].leaveLiveSession(false);
                }
            }

        }
    }

    var dispRequest = null;
    function updateScreenSaver() {
        var disableScreenSaver = false;
        for (var i = 0; i < liveConversations.length; i++) {
            var status = liveConversations[i].getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            if ([LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE,
                  LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE_FULL, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE,
                  LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY, LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY].indexOf(status) === -1) {
                disableScreenSaver = true;
                break;
            }
        }

        if (disableScreenSaver) {
            
            try {
                if (!dispRequest) {
                    dispRequest = new Windows.System.Display.DisplayRequest();
                    dispRequest.requestActive();
                    log("callManager.updateScreenSaver: TurnOffScreen disabled.");
                }
            } catch (e) {
                log("callManager.updateScreenSaver: Request failed with error: " + e.message);
            }
        } else {
            
            try {
                if (dispRequest) {
                    dispRequest.requestRelease();
                    dispRequest = null;
                    log("callManager.updateScreenSaver: TurnOffScreen enabled.");
                }
            } catch (e) {
                log("callManager.updateScreenSaver: Release failed with error: " + e.message);
            }
        }
    }

    function getLiveConversations() {
        var result = [];
        for (var i = 0; i < liveConversations.length; i++) {
            if (!NONLIVE_STATES.contains(liveConversations[i].getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS))) {
                result.push(liveConversations[i]);
            }
        }
        return result;
    }

    function liveConversationExists() {
        return getLiveConversations().length > 0;
    }

    function answerCallByIdentity(answerWithVideo, conversationIdentity) {
        if (Actions.invoke("answer", conversationIdentity, { focusConversation: true })) {
            log("CallManager answerCallByIdentity: call was answered");
            if (answerWithVideo && !Actions.invoke("startVideo", conversationIdentity)) {
                log("CallManager caching not started video");
                videoToStartIdentity = conversationIdentity;
            }
            if (callToAnswer) {
                clearTimeout(callToAnswer.timeoutId);
                callToAnswer = null;
            }
            return true;
        }
        return false;
    }

    function tryToAnswerCall(callId, conversationIdentity, answerWithVideo) {
        log("CallManager tryToAnswerCall: callId: {0}, conversationIdentity: {1}, answerWithVideo: {2}".format(callId, conversationIdentity, answerWithVideo));
        var conversationToDiscard = null, conversation = null, callWasAnswered = false;

        if (callId) {
            
            conversationToDiscard = conversation = lib.getConversationByCallGUID(callId);
        }

        if (!conversation) {
            
            log("CallManager answerCallByIdentity: fallback liveConversations: " + liveConversations.map(function (item) { return item.getIdentity(); }).join(","));
            conversation = liveConversations.first(function (item) { return item.getIdentity() === conversationIdentity; });
        }

        if (conversation) {
            
            callWasAnswered = answerCallByIdentity(answerWithVideo, conversation.getIdentity());
        }

        conversationToDiscard && conversationToDiscard.discard();
        return callWasAnswered;
    }

    function checkCallToAnswer() {
        if (!callToAnswer) {
            return;
        }
        if (liveConversations.length === 0) {
            log("CallManager answerCallByIdentity: no live conversation");
            return;
        }
        log("CallManager checkCallToAnswer");
        tryToAnswerCall(callToAnswer.callId, callToAnswer.conversationIdentity, callToAnswer.answerWithVideo);
    }

    function normalizeConversationIdentity(conversationIdentity) {
        var conversation = lib.getConversationByIdentity(conversationIdentity);
        conversationIdentity = conversation ? conversation.getIdentity() : conversationIdentity;

        if (conversation) {
            conversation.discard();
        } else {
            log("CallManager normalizeConversationIdentity: couldn't normalize identity !");
        }
        return conversationIdentity;
    }

    function answerCall(conversationIdentity, answerWithVideo, callId) {
        
        
        
        
        
        
        
        
        
        
        
        

        log("CallManager.answerCall, conversationIdentity = {0}, callId = {1}, answerWithVideo = {2}".format(conversationIdentity, callId, answerWithVideo));

        
        conversationIdentity = normalizeConversationIdentity(conversationIdentity);

        
        var callWasAnswered = tryToAnswerCall(callId, conversationIdentity, answerWithVideo);
        if (!callWasAnswered) {
            var timeoutId = setTimeout(function () {
                log("CallManager.answerCall, answering call for {0} timed out, removing from cache".format(conversationIdentity));
                callToAnswer = null;
            }, answerCallTimeout);

            log("CallManager.answerCall, caching call to answer - " + conversationIdentity);
            callToAnswer = { conversationIdentity: conversationIdentity, callId: callId, answerWithVideo: answerWithVideo, timeoutId: timeoutId };
        }
    }

    WinJS.Namespace.define("Skype.CallManager", {
        init: init,
        otherConversationIsLive: otherConversationIsLive,
        registerListener: registerListener,
        unregisterListener: unregisterListener,
        liveConversations: getLiveConversations,
        holdAllCalls: holdAllCalls,
        liveConversationExists: liveConversationExists,
        answerCall: answerCall
    });
})();