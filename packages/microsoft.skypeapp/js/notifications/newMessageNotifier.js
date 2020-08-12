

(function () {
    "use strict";

    var document = window.document;

    var messageTypesToHandle = [
        LibWrap.Message.type_POSTED_TEXT, LibWrap.Message.type_POSTED_CONTACTS, LibWrap.Message.type_POSTED_EMOTE,
        LibWrap.Message.type_POSTED_FILES, LibWrap.Message.type_POSTED_SMS, LibWrap.Message.type_POSTED_VIDEO_MESSAGE];

    var StateMachine = WinJS.Class.define(/*@constructor*/function () {
        this.setEvent(StateMachine.Event.NoEvent);
    }, {
        lastEvent: /*@static_cast(StateMachine.Event)*/null,
        currentState: /*@static_cast(StateMachine.State)*/null,
        timestamp: /*@static_cast(Number)*/null,

        stringify: function (type, value) {
            for (var key in type) {
                if (type[key] === value) {
                    return key;
                }
            }
            return value;
        },

        setEvent: function (event) {
            log("NewMessageNotifier: new event {0}".format(this.stringify(StateMachine.Event, event)));
            switch (event) {
                case StateMachine.Event.Login:
                case StateMachine.Event.AppIsVisible:
                    this.currentState = StateMachine.State.HandleMessages;
                    this.timestamp = /*@static_cast(Number)*/null;
                    break;
                case StateMachine.Event.Resume:
                    if (lib && lib.loggedIn) {
                        this.currentState = StateMachine.State.HandleMessages;
                    } else {
                        this.currentState = StateMachine.State.Silent;
                    }
                    this.timestamp = /*@static_cast(Number)*/null;
                    break;
                case StateMachine.Event.AppIsHidden:
                    this.currentState = StateMachine.State.ShowMessages;
                    this.timestamp = ((new Date()).getTime() / 1000);
                    break;
                case StateMachine.Event.Suspend:
                default:
                    this.currentState = StateMachine.State.Silent;
                    this.timestamp = /*@static_cast(Number)*/null;
                    break;
            }
            this.lastEvent = event;
            log("NewMessageNotifier: state {0}".format(this.stringify(StateMachine.State, this.currentState)));
        }
    }, {
        Event: {
            NoEvent: 0,
            Login: 1,
            Logout: 2,
            Resume: 3,
            Suspend: 4,
            AppIsVisible: 5,
            AppIsHidden: 6
        },
        State: {
            Silent: 0,
            HandleMessages: 1,
            ShowMessages: 2
        }
    });

    var stateMachine;

    function init(externals) {
        if (!externals) {
            externals = {};
        }
        var loginHandlerManager = Skype.Application.LoginHandlerManager;
        var webUIApplication = externals.webUIApplication || Windows.UI.WebUI.WebUIApplication;
        document = externals.document || window.document;

        stateMachine = new StateMachine();

        document.addEventListener("msvisibilitychange", onAppVisibleChanged);
        lib.addEventListener("incomingmessage", handleIncomingMessage);
        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGIN_FULL, handleCurrentState.bind(null, StateMachine.Event.Login));
        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGOUT, handleCurrentState.bind(null, StateMachine.Event.Logout));

        Skype.Application.Suspending.regHandler(Skype.Notifications.NewMessageNotifier, handleCurrentState.bind(null, StateMachine.Event.Suspend));
        webUIApplication.addEventListener("resuming", handleCurrentState.bind(null, StateMachine.Event.Resume));
    }
    
    function handleCurrentState(event) {
        stateMachine.setEvent(event);
        switch (stateMachine.currentState) {
            case StateMachine.State.HandleMessages:
            case StateMachine.State.Silent:
                Skype.Notifications.Tiles.clear();
                break;
        }
        if (event == StateMachine.Event.Resume) {
            roboSky.write('newMessageNotifier.js,Resumed');
        }
    }
    
    function onAppVisibleChanged() {
        var event = document.msHidden ? StateMachine.Event.AppIsHidden : StateMachine.Event.AppIsVisible;
        handleCurrentState(event);
    }
    
    function isMessageToShow(libMessage) {
        var messageType = libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE);
        if (messageTypesToHandle.indexOf(messageType) !== -1) {
            var authorId = libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR);
            if (lib.isMe(authorId)) {
                return false;
            }

            var cs = libMessage.getIntProperty(LibWrap.PROPKEY.message_CONSUMPTION_STATUS);
            if (cs === LibWrap.Message.consumption_STATUS_CONSUMED || cs === LibWrap.Message.consumption_STATUS_UNCONSUMED_SUPPRESSED) {
                return false;
            }

            var messageTimestamp = libMessage.getIntProperty(LibWrap.PROPKEY.message_TIMESTAMP);
            if (stateMachine.timestamp && messageTimestamp > stateMachine.timestamp) {
                return true;
            }
        }
        return false;
    }
    
    function parseSMSNotification(xmlMsg) {
        var result;
        var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
        try {
            xmlDoc.loadXml(xmlMsg);
            result = xmlDoc.selectSingleNode("/sms/encoded_body").innerText;
        } catch (exception) {
        }
        return result;
    }

    function getGroupConversation(libMessage) {
        var conversationId = libMessage.getIntProperty(LibWrap.PROPKEY.message_CONVO_ID);
        var libConversation = lib.getConversationByConvoId(conversationId);
        if (libConversation) {
            var conversationType = libConversation.getIntProperty(LibWrap.PROPKEY.conversation_TYPE);
            if (conversationType === LibWrap.Conversation.type_DIALOG) {
                libConversation.discard();
                return null;
            }
        }

        return libConversation;
    }

    function handleIncomingMessage(event) {
        if (stateMachine.currentState !== StateMachine.State.ShowMessages) {
            return;
        }

        var libMessage = lib.getConversationMessage(event.detail[0]);
        if (!libMessage) {
            return;
        }

        if (!isMessageToShow(libMessage)) {
            libMessage.discard();
            return;
        }

        log("Skype.Notifications.NewMessageNotifier.handleIncomingMessage: update toast and tile");
        var displayName = libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR_DISPLAYNAME);
        var authorId = libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR);
        var messageType = libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE);
        var content;
        if (messageType === LibWrap.Message.type_POSTED_FILES) {
            var message = Skype.Model.MessageFactory.createMessage(libMessage);
            content = message.details;
        } else if (messageType === LibWrap.Message.type_POSTED_VIDEO_MESSAGE) {
            var videoMessage = Skype.Model.MessageFactory.createMessage(libMessage);
            content = videoMessage.details.infoMsg;
        } else if (messageType === LibWrap.Message.type_POSTED_SMS) {
            content = parseSMSNotification(libMessage.getStrProperty(LibWrap.PROPKEY.message_BODY_XML));
        } else {
            content = Skype.Utilities.trimHtmlWhitespaces(Skype.Utilities.unEscapeHTML(libMessage.getStrProperty(LibWrap.PROPKEY.message_BODY_XML))); 
        }

        var groupConversation = getGroupConversation(libMessage);
        if (groupConversation) {
            if (messageType !== LibWrap.Message.type_POSTED_FILES) {
                
                content = "{0}: {1}".format(displayName, content);
            }
            displayName = groupConversation.getStrProperty(LibWrap.PROPKEY.conversation_DISPLAYNAME);
            authorId = groupConversation.getIdentity();
            groupConversation.discard();
        }

        Skype.Notifications.Tiles.update(authorId, displayName, content);
        Skype.Notifications.Toasts.show(authorId, displayName, content);

        libMessage.discard();
    }

    WinJS.Namespace.define("Skype.Notifications.NewMessageNotifier", {
        init: init
    });
})();