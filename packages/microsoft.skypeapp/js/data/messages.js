

(function () {
    "use strict";

    var MessageType = {
        text: "text",
        file: "file",
        call: "call",
        sms: "sms",
        group: "group",
        blocked: "blocked",
        auth: "auth",
        initialAuthRequest: "initialAuthRequest",
        authorized: "authorized",
        contacts: "contacts",
        voicemail: "voicemail",
        videomessage: "videomessage",
        unknown: "unknown"
    };

    var CallStatus = {
        incoming: "incoming",
        missed: "missed",
        done: "done",
        canJoin: "canJoin",
        noAnswer: "noanswer",
        busy: "busy",
        current: "current",
        hold: "hold",
        declined: "declined",
        starting: "starting"
    };

    var CallType = {
        incoming: "incoming",
        outgoing: "outgoing",
        unknown: "unknown",
    };


    var Message = MvvmJS.Class.define(function (libMessage) {
        this.id = libMessage ? libMessage.getObjectID() : -1;
        this.timestamp = libMessage ? libMessage.getIntProperty(LibWrap.PROPKEY.message_TIMESTAMP) : 0;
    }, {
        id: null,
        timestamp: null,
        type: null
    }, {
        details: null
    });

    var CallMessageDetails = MvvmJS.Class.define(function (status, callType, duration) {
        this.status = status;
        this.callType = callType;
        this.formattedDuration = duration === undefined ? "" : duration;
    }, {
    }, {
        status: null,
        callType: null,
        formattedDuration: ""
    });

    WinJS.Namespace.define("Skype.Model", {
        MessageType: MessageType,
        CallStatus: CallStatus,
        Message: Message,
        CallMessageDetails: CallMessageDetails,
        CallType: CallType
    });

}());
