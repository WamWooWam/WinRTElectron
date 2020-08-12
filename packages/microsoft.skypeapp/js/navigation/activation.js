

(function () {
    "use strict";

    var serviceIds = {
        SkypeCom: "skype.com",
        OutlookCom: "outlook.com",
        Telephone: "telephone"
    };

    function buildUriForContactActivation(identity, contactVerb, serviceId) {
        var uri = "";

        if (serviceId === serviceIds.OutlookCom) {
            identity = "1%3a" + identity;
        }
        switch (contactVerb) {
            case Windows.ApplicationModel.Contacts.ContactLaunchActionVerbs.call:
                if (serviceId === serviceIds.Telephone) {
                    uri = "tel:" + identity;
                } else if ((serviceId === serviceIds.SkypeCom) || (serviceId === serviceIds.OutlookCom)) {
                    uri = "skype:" + identity + "?call";
                } else {
                    log("buildUriForContactActivation: Unsupported service type for contactVerb " + contactVerb);
                }
                break;
            case Windows.ApplicationModel.Contacts.ContactLaunchActionVerbs.videoCall:
                if ((serviceId === serviceIds.SkypeCom) || (serviceId === serviceIds.OutlookCom)) {
                    uri = "skype:" + identity + "?call&video=true";
                } else {
                    log("buildUriForContactActivation: Unsupported service type for contactVerb " + contactVerb);
                }
                break;
            case Windows.ApplicationModel.Contacts.ContactLaunchActionVerbs.message:
                if (serviceId === serviceIds.Telephone) {
                    uri = "sms:" + identity;
                } else if ((serviceId === serviceIds.SkypeCom) || (serviceId === serviceIds.OutlookCom)) {
                    uri = "skype:" + identity + "?chat";
                } else {
                    log("buildUriForContactActivation: Unsupported service type for contactVerb " + contactVerb);
                }
                break;
            default:
                log("Unsupported contactVerb");
                break;
        }

        return uri;
    }

    
    function parseActivationParams(e) {
        if (!e) {
            return {};
        }
        log("WinJS.Application.activated: kind [{0}] arguments [{1}] previousExecutionState [{2}] URI [{3}]".format(
            Skype.Utilities.getEnumKeyName(Windows.ApplicationModel.Activation.ActivationKind, e.detail.kind),
            e.detail.arguments,
            Skype.Utilities.getEnumKeyName(Windows.ApplicationModel.Activation.ApplicationExecutionState, e.detail.previousExecutionState),
            e.detail.uri ? e.detail.uri.rawUri : ""));

        
        var activationParams = {
            pageName: Skype.UI.Navigation.Pages.RESUME_LAST,
            args: {},
            uri: "",
            isProtocolActivation: false,
            isRetailModeActivation: false,
        };

        Skype.Diagnostics.PerfTrack.instance.activationKind = e.detail.kind;
        
        
        switch (e.detail.kind) {
            case Windows.ApplicationModel.Activation.ActivationKind.protocol:
                activationParams.isProtocolActivation = true;
                activationParams.uri = e.detail.uri.rawUri;
                break;
            case Windows.ApplicationModel.Activation.ActivationKind.contact:
                activationParams.isProtocolActivation = true;
                activationParams.safe = true; 
                activationParams.uri = buildUriForContactActivation(e.detail.serviceUserId, e.detail.verb, e.detail.serviceId);
                break;
            case Windows.ApplicationModel.Activation.ActivationKind.lockScreenCall:
                activationParams.pageName = Skype.UI.Navigation.Pages.CONVERSATION;
                activationParams.args = Skype.StartUpComponent.LockScreen.instance.getActivationArguments(e.detail.arguments, e.detail.callUI);
                break;
            default:
                if (e.detail.arguments) {
                    
                    var launchParams = Skype.Notifications.parseLaunchParams(e.detail.arguments);
                    if (launchParams) {
                        activationParams.pageName = Skype.UI.Navigation.Pages.CONVERSATION;
                        activationParams.args = {
                            id: launchParams.conversationId,
                            callId: launchParams.callId,
                            handlePushNotification: launchParams.handlePushNotification,
                            answerType: launchParams.answerType
                        };
                    }
                }
                break;
        }
        return activationParams;
    }

    function getConversationIdentityByCallId(callId, conversationIdentity) {
        if (!callId) {
            return conversationIdentity;
        }

        var identity = conversationIdentity;
        var conversation = lib.getConversationByCallGUID(callId);
        if (conversation) {
            identity = conversation.getIdentity();
            conversation.discard();
        }
        return identity;
    }

    function handleActivationArguments(activationParams) {
        var activationPromise;      

        function navigationError(e) {
            log("Error navigating to {0}: {1}".format(activationParams.pageName, e.stack ? e.stack : e));
            return Skype.UI.navigate("hub");
        }

        roboSky.write("Activation,scenario,StartTM");
        log("Activation params:" + JSON.stringify(activationParams));
        if (activationParams.args && activationParams.args.handlePushNotification) {
            
            Skype.Notifications.handleIncomingPushNotification();
        }

        if (activationParams.isProtocolActivation) {
            activationPromise = WinJS.Promise.as(Skype.URIHandler.handle(activationParams.uri, activationParams.safe));
        } else if (activationParams.pageName && activationParams.pageName === Skype.UI.Navigation.Pages.CONVERSATION) {
            if (activationParams.args.mode === "lockScreen" && activationParams.args.activateCall) {
                activationPromise = Skype.StartUpComponent.LockScreen.instance.handleActivationFinished();
            } else {
                var isCall = ["voice", "video"].contains(activationParams.args.answerType);
                var answerWithVideo = isCall ? activationParams.args.answerType === "video" : false;
                var conversationIdentity = getConversationIdentityByCallId(activationParams.args.callId, activationParams.args.id);

                activationPromise = Actions.invoke("focusConversation", [conversationIdentity], { goDirectlyToLive: isCall });
                if (activationPromise) {
                    activationPromise = activationPromise.then(null, navigationError);
                    if (isCall) {
                        Skype.CallManager.answerCall(conversationIdentity, answerWithVideo, activationParams.args.callId);
                    }
                } else {
                    activationPromise = Skype.UI.navigate("hub");
                }
            }
        } else if (activationParams.pageName) {
            activationPromise = Skype.UI.navigate(activationParams.pageName, activationParams.args).then(null, navigationError);
        } else {
            activationPromise = Skype.UI.navigate("hub");
        }

        activationPromise.then(function (control) {
            var promise = WinJS.Promise.as();
            if (control) {
                promise = control.renderFinishedPromise;                
            }
            promise.then(function () {
                Skype.Application.state.view.appReady = true;
            });
        });
               
        return activationPromise;
    }
    
    WinJS.Namespace.define("Skype.UI.Activation", {
        handleActivationArguments: handleActivationArguments,
        parseActivationParams: parseActivationParams
    });
})();