

(function () {
    "use strict";
    

    var eventType = {
        clickStream: 37,
        skypeStats: 38,
        inventoryInfo: 40
    };

    var schemas = {
        application: { id: 1 },
        navigation: { id: 2 },
        login: { id: 3 },
        conversation: { id: 4 },
        search: { id: 5 },
        signout: { id: 6 },
        calling: { id: 7 },
        skypeOutCalling: { id: 8 },
        videoCalls: { id: 9 },
        audioCalls: { id: 10 }
    };

    var contextAreas = {
        application: { id: 1 },
        upgrade: { id: 2 },
        msaLogin: { id: 3 },
        msaLinking: { id: 4 },
        uiPage: { id: 50 },
        appBar: { id: 51 },
        hub: { id: 52 },
        conversation: { id: 53 },
        mePanel: { id: 54 },
        search: { id: 55 },
        dialer: { id: 56 },
        call: { id: 57 },
        contacts: { id: 58 },
        participantList: { id: 59 },
        uriHandler: { id: 6 },
    };

    var eventGroups = {
        applicationEvents: { id: 1 }, 
        userEvents: { id: 2 }, 
        fileTransfer: { id: 3 },
        userNavigation: { id: 10 }, 
        userActivity: { id: 11 } 
    };

    var eventsDefinition = {
        
        hardwareInventory: { id: 1, schemaId: schemas.application, contextId: contextAreas.application, eventType: eventType.inventoryInfo },

        
        startup: { id: 100, schemaId: schemas.application, eventGroupId: eventGroups.applicationEvents, contextId: contextAreas.application, eventType: eventType.skypeStats },
        mandatoryUpgradeCheck: { id: 101, schemaId: schemas.application, eventGroupId: eventGroups.applicationEvents, contextId: contextAreas.upgrade, eventType: eventType.skypeStats },
        mandatoryUpgradeDialog: { id: 102, schemaId: schemas.application, eventGroupId: eventGroups.applicationEvents, contextId: contextAreas.upgrade, eventType: eventType.skypeStats },
        mandatoryUpgradeDialog_Install: { id: 103, schemaId: schemas.application, eventGroupId: eventGroups.applicationEvents, contextId: contextAreas.upgrade, eventType: eventType.skypeStats },

        screenResolution: { id: 107, schemaId: schemas.application, eventGroupId: eventGroups.applicationEvents, contextId: contextAreas.application, eventType: eventType.skypeStats },

        login: { id: 200, schemaId: schemas.application, eventGroupId: eventGroups.userEvents, contextId: contextAreas.application, eventType: eventType.skypeStats },

        msaLogin_Success: { id: 201, schemaId: schemas.login, eventGroupId: eventGroups.userEvents, contextId: contextAreas.msaLogin, eventType: eventType.skypeStats },
        msaLogin_Logout: { id: 202, schemaId: schemas.login, eventGroupId: eventGroups.userEvents, contextId: contextAreas.msaLogin, eventType: eventType.skypeStats },
        msaLogin_Failed: { id: 203, schemaId: schemas.login, eventGroupId: eventGroups.userEvents, contextId: contextAreas.msaLogin, eventType: eventType.skypeStats },

        msaLinking_NewUserCreated: { id: 205, schemaId: schemas.login, eventGroupId: eventGroups.userEvents, contextId: contextAreas.msaLinking, eventType: eventType.skypeStats },
        msaLinking_AccountsLinkSuccess: { id: 208, schemaId: schemas.login, eventGroupId: eventGroups.userEvents, contextId: contextAreas.msaLinking, eventType: eventType.skypeStats },

        
        fileTransfer_send: { id: 210, schemaId: schemas.conversation, eventGroupId: eventGroups.fileTransfer, contextId: contextAreas.conversation, eventType: eventType.skypeStats },
        fileTransfer_receive: { id: 211, schemaId: schemas.conversation, eventGroupId: eventGroups.fileTransfer, contextId: contextAreas.conversation, eventType: eventType.skypeStats },
        fileTransfer_cancel_locally: { id: 212, schemaId: schemas.conversation, eventGroupId: eventGroups.fileTransfer, contextId: contextAreas.conversation, eventType: eventType.skypeStats },
        fileTransfer_cancel_remotely: { id: 213, schemaId: schemas.conversation, eventGroupId: eventGroups.fileTransfer, contextId: contextAreas.conversation, eventType: eventType.skypeStats },
        fileTransfer_completed_send: { id: 214, schemaId: schemas.conversation, eventGroupId: eventGroups.fileTransfer, contextId: contextAreas.conversation, eventType: eventType.skypeStats },
        fileTransfer_completed_receive: { id: 215, schemaId: schemas.conversation, eventGroupId: eventGroups.fileTransfer, contextId: contextAreas.conversation, eventType: eventType.skypeStats },
        fileTransfer_failed_sending: { id: 216, schemaId: schemas.conversation, eventGroupId: eventGroups.fileTransfer, contextId: contextAreas.conversation, eventType: eventType.skypeStats },
        fileTransfer_failed_receiving: { id: 217, schemaId: schemas.conversation, eventGroupId: eventGroups.fileTransfer, contextId: contextAreas.conversation, eventType: eventType.skypeStats },

        
        showPage: { id: 1001, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.uiPage, eventType: eventType.clickStream },
        hidePage: { id: 1002, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.uiPage, eventType: eventType.clickStream },
        disposePage: { id: 1003, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.uiPage, eventType: eventType.clickStream },
        openUnreadedMessages: { id: 1004, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.uiPage, eventType: eventType.clickStream },
        applicationSize: { id: 1030, schemaId: schemas.application, eventGroupId: eventGroups.applicationEvents, contextId: contextAreas.application, eventType: eventType.clickStream },
        osLanguage: { id: 108, schemaId: schemas.application, eventGroupId: eventGroups.applicationEvents, contextId: contextAreas.application, eventType: eventType.clickStream },

        applicationSuspended_sessionTime: { id: 109, schemaId: schemas.application, eventGroupId: eventGroups.applicationEvents, contextId: contextAreas.application, eventType: eventType.clickStream },

        applicationSuspended: { id: 1101, schemaId: schemas.application, eventGroupId: eventGroups.userActivity, contextId: contextAreas.application, eventType: eventType.clickStream },
        applicationResuming: { id: 1102, schemaId: schemas.application, eventGroupId: eventGroups.userActivity, contextId: contextAreas.application, eventType: eventType.clickStream },

        
        appBar_show: { id: 1010, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.appBar, eventType: eventType.clickStream },
        appBar_executeCommand: { id: 1011, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.appBar, eventType: eventType.clickStream },

        
        hub_openContact: { id: 1020, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },
        hub_openRecentMessages: { id: 1021, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },
        hub_openFavorites: { id: 1022, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },
        hub_openPeople: { id: 1023, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },
        hub_openRecentConversation: { id: 1024, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },
        hub_openDiler: { id: 1025, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },
        hub_openSearch: { id: 1026, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },
        hub_openNewChat: { id: 1027, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },
        hub_newChatParticipants: { id: 1028, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.hub, eventType: eventType.clickStream },

        
        mePanel_presenceChange: { id: 1120, schemaId: schemas.application, eventGroupId: eventGroups.userActivity, contextId: contextAreas.mePanel, eventType: eventType.clickStream },

        
        signout: { id: 1040, schemaId: schemas.signout, eventGroupId: eventGroups.userEvents, contextId: contextAreas.mePanel, eventType: eventType.clickStream },

        
        search_openContact: { id: 1050, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.search, eventType: eventType.clickStream },
        search_directorySearchInvoked: { id: 1051, schemaId: schemas.search, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.search, eventType: eventType.clickStream },
        search_openDirectoryContact: { id: 1052, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.search, eventType: eventType.clickStream },

        
        conversation_skypeoutSkypeContact: { id: 1060, schemaId: schemas.skypeOutCalling, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.conversation, eventType: eventType.clickStream },
        conversation_skypeoutPSTNContact: { id: 1061, schemaId: schemas.skypeOutCalling, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.conversation, eventType: eventType.clickStream },
        conversation_s2sSkypeContact: { id: 1062, schemaId: schemas.calling, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.conversation, eventType: eventType.clickStream },

        
        call_addedPSTNContact: { id: 1070, schemaId: schemas.skypeOutCalling, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_menu_show: { id: 1071, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_menu_executeCommand: { id: 1072, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_swipeOpenChat: { id: 1073, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_backButton: { id: 1074, schemaId: schemas.navigation, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.call, eventType: eventType.clickStream },

        
        call_video_muteOn: { id: 1170, schemaId: schemas.videoCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_video_muteOff: { id: 1171, schemaId: schemas.videoCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_video_addParticipants: { id: 1172, schemaId: schemas.videoCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.participantList, eventType: eventType.clickStream },
        call_video_hangupParticipants: { id: 1173, schemaId: schemas.videoCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.participantList, eventType: eventType.clickStream },
        call_video_removeParticipants: { id: 1174, schemaId: schemas.videoCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.participantList, eventType: eventType.clickStream },
        call_video_ringParticipants: { id: 1185, schemaId: schemas.videoCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.participantList, eventType: eventType.clickStream },

        
        call_audio_muteOn: { id: 1175, schemaId: schemas.audioCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_audio_muteOff: { id: 1176, schemaId: schemas.audioCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_audio_addParticipants: { id: 1177, schemaId: schemas.audioCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.participantList, eventType: eventType.clickStream },
        call_audio_hangupParticipants: { id: 1178, schemaId: schemas.audioCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.participantList, eventType: eventType.clickStream },
        call_audio_removeParticipants: { id: 1179, schemaId: schemas.audioCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.participantList, eventType: eventType.clickStream },
        call_audio_ringParticipants: { id: 1186, schemaId: schemas.audioCalls, eventGroupId: eventGroups.userActivity, contextId: contextAreas.participantList, eventType: eventType.clickStream },

        
        call_videoEnabled: { id: 1180, schemaId: schemas.calling, eventGroupId: eventGroups.userActivity, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_videoDisabled: { id: 1181, schemaId: schemas.calling, eventGroupId: eventGroups.userActivity, contextId: contextAreas.call, eventType: eventType.clickStream },
        call_switchCamera: { id: 1182, schemaId: schemas.calling, eventGroupId: eventGroups.userActivity, contextId: contextAreas.call, eventType: eventType.clickStream },

        
        dialer_skypeOutDialed: { id: 1080, schemaId: schemas.skypeOutCalling, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.dialer, eventType: eventType.clickStream },
        dialer_skypeOutRecents: { id: 1081, schemaId: schemas.skypeOutCalling, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.dialer, eventType: eventType.clickStream },
        dialer_s2sRecents: { id: 1082, schemaId: schemas.calling, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.dialer, eventType: eventType.clickStream },

        
        uri_skypeOut: { id: 1090, schemaId: schemas.skypeOut, eventGroupId: eventGroups.userNavigation, contextId: contextAreas.uriHandler, eventType: eventType.clickStream },

        
        contacts_onlineViewed: { id: 1110, schemaId: schemas.application, eventGroupId: eventGroups.userActivity, contextId: contextAreas.contacts, eventType: eventType.clickStream },
        contacts_allViewed: { id: 1111, schemaId: schemas.application, eventGroupId: eventGroups.userActivity, contextId: contextAreas.contacts, eventType: eventType.clickStream }
    };

    var lastEventId = 0;
    var lastEventDateTime = null;
    var startUpEvents = [];

    function getDevicePixelRatio() {
        var ratio = window.devicePixelRatio;
        if (!ratio) {
            ratio = 1;
        }
        return ratio;
    }

    function getOsName() {
        return "Windows Modern";
    }

    function getOsLanguage() {
        return Windows.Globalization.ApplicationLanguages.languages[0];
    }

    function init() {
        var loginHandlerManager = Skype.Application.LoginHandlerManager;

        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGIN_FULL, onLogin);
        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGIN_READONLY, function () {
            sendStats(eventsDefinition.msaLogin_Success);
        });
        lib.addEventListener("statsreported", onStatsReported);
        lib.addEventListener("libready", restoreEventsState);
        Skype.Statistics.ExternalAPI.WebUIApplication.addEventListener("resuming", resumingHandler);
    }

    function resumingHandler(e) {
        restoreEventsState();
        sendStats(eventsDefinition.applicationResuming);
    }

    function restoreEventsState() {
        getEventsFromCache().done(
            function (cachedEvents) {
                startUpEvents = mergeEventArrays(cachedEvents, startUpEvents);
            });
    }

    function saveEventsState() {
        return saveEventsToCache(startUpEvents);
    }

    function onLogin() {
        
        while (startUpEvents.length > 0) {
            sendEventObjectInternally(startUpEvents.shift());
        }
        saveEventsToCache([]);

        sendScreenResolutionEvent();
        sendStats(eventsDefinition.osLanguage, getOsLanguage());
    }
    window.traceFunction && (onLogin = window.traceFunction(onLogin, "Statistics,onLogin"));

    function onStatsReported(stats) {
        if (stats.detail && stats.detail[0] === 1) {
            var keyboardCapabilities = new Windows.Devices.Input.KeyboardCapabilities();
            var mouseCapabilities = new Windows.Devices.Input.MouseCapabilities();
            var touchCapabilities = new Windows.Devices.Input.TouchCapabilities();
            var deviceInfo = new Skype.Statistics.ExternalAPI.EasClientDeviceInformation();
            
            var screenwidth = window.screen.width;
            var screenheight = window.screen.height;
            
            var devicePixelRatio = getDevicePixelRatio();
            var screenwidthdp = screenwidth / devicePixelRatio;
            var screenheightdp = screenheight / devicePixelRatio;
            
            var displayInfo = Windows.Graphics.Display.DisplayInformation.getForCurrentView();
            var screenwidthin = screenwidthdp / displayInfo.rawDpiX;
            var screenheightin = screenheightdp / displayInfo.rawDpiY;

            var inventoryString = "keyboard={0}&mouse={1}&touch={2}&screenwidth={3}&screenheight={4}&screenwidthin={5}&screenheightin={6}".format(
                keyboardCapabilities.keyboardPresent,
                mouseCapabilities.mousePresent,
                touchCapabilities.touchPresent,
                screenwidth,
                screenheight,
                screenwidthin,
                screenheightin);
            inventoryString = encodeURIComponent(inventoryString);

            var inventoryExtra = "dipx={0}&dipy={1}&rawdpix={2}&rawdpiy={3}".format(
                screenwidthdp,
                screenheightdp,
                displayInfo.rawDpiX,
                displayInfo.rawDpiY
                );
            inventoryExtra = encodeURIComponent(inventoryExtra);

            var data = {
                data: inventoryString,
                deviceManufacturer: deviceInfo.systemManufacturer,
                deviceName: deviceInfo.systemProductName,
                inventoryExtra: inventoryExtra
            };

            sendStatsObj(eventsDefinition.hardwareInventory, data);
        }
    }

    function sendScreenResolutionEvent() {
        
        var screenInfo = "screen={0}x{1}&scale={2}".format(window.screen.width, window.screen.height, Windows.Graphics.Display.DisplayProperties.resolutionScale);

        var data = encodeURIComponent(screenInfo);
        sendStats(eventsDefinition.screenResolution, data);
    }

    function isEqual(eventObjLeft, eventObjRight) {
        return (eventObjLeft.eventId === eventObjRight.eventId && eventObjLeft.eventData === eventObjRight.eventData);
    }

    function indexOf(eventObj, events) {
        for (var i = 0; i < events.length; i++) {
            if (isEqual(events[i], eventObj)) {
                return i;
            }
        }
        return -1;
    }

    function addEventToCache(eventObj) {
        
        if (eventObj.eventType === eventType.skypeStats) {
            log("[Stats] Adding event to cache id={0}, data={1}".format(eventObj.eventId, eventObj.eventData));
            var index = indexOf(eventObj, startUpEvents);
            if (index === -1) {
                startUpEvents.push(eventObj);
            } else {
                startUpEvents[index].raiseCount++;
            }
        }
    }

    function saveEventsToCache(events) {
        var localFolder = Skype.Statistics.ExternalAPI.ApplicationData.current.localFolder;
        return localFolder.createFileAsync("stats.json", Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                return Skype.Statistics.ExternalAPI.FileIO.writeTextAsync(file, JSON.stringify(events));
            })
            .then(null, function (error) {
                log("[Stats] Error {0} accessing stats.json ({1})".format(error.number, error.message));
                return WinJS.Promise.wrapError(error);
            });
    }

    function getEventsFromCache() {
        return new WinJS.Promise(function (completeCallback) {
            var localFolder = Skype.Statistics.ExternalAPI.ApplicationData.current.localFolder;
            localFolder.getFileAsync("stats.json").done(
                function (file) {
                    Skype.Statistics.ExternalAPI.FileIO.readTextAsync(file).done(
                        function (fileData) {
                            try {
                                var cachedEvents = JSON.parse(fileData);
                                Array.isArray(cachedEvents) ? completeCallback(cachedEvents) : completeCallback([]);
                            } catch (ex) {
                                log("invalid data in stats cache: Probably cache is corrupted? " + ex.description);
                                completeCallback([]);
                            }
                        },
                        function () {
                            
                            completeCallback([]);
                        });
                },
                function () {
                    completeCallback([]);
                });
        });
    }

    function mergeEventArrays() {
        var mergedArray = [];
        for (var i = 0; i < arguments.length; i++) {
            var array = arguments[i];
            for (var j = 0; j < array.length; j++) {
                var index = indexOf(array[j], mergedArray);
                if (index === -1) {
                    mergedArray.push(array[j]);
                } else {
                    mergedArray[index].raiseCount++;
                }
            }
        }
        return mergedArray;
    }

    
    function sendStats(event, data) {
        var dataObj = { data: data };
        sendStatsObj(event, dataObj);
    }

    function sendStatsObj(event, dataObj) {
        if (!validateEvent(event)) {
            log("[Stats] Unsupported event {0}".format(event.toString()));
            return;
        }

        
        var eventObj = {};
        eventObj.eventId = event.id;
        eventObj.eventType = event.eventType;
        eventObj.eventData = dataObj.data;
        eventObj.deviceManufacturer = dataObj.deviceManufacturer;
        eventObj.deviceName = dataObj.deviceName;
        eventObj.inventoryExtra = dataObj.inventoryExtra;
        eventObj.raiseCount = 1;

        if (event.eventType == eventType.clickStream) {
            var eventDateTime = Date.now();
            var secondsSinceLast = 0;

            if (lastEventDateTime !== null) {
                secondsSinceLast = (eventDateTime - lastEventDateTime) / 1000;
            }
            eventObj.lastEventId = lastEventId;
            eventObj.secondsSinceLast = secondsSinceLast;

            lastEventId = event.id;
            lastEventDateTime = eventDateTime;
        }

        if (typeof lib !== "undefined" && lib.loggedIn) {
            setImmediate(sendEventObjectInternally, eventObj);
        } else {
            addEventToCache(eventObj);
        }
    }

    function sendEventObjectInternally(eventObj) {
        log("[Stats] Sending event id={0}, data={1}".format(eventObj.eventId, eventObj.eventData));
        var attrContainer = new Skype.Statistics.ExternalAPI.StatsContainer();

        var valueKey;
        switch (eventObj.eventType) {
            case eventType.skypeStats:
                attrContainer.addIntegerValue(LibWrap.StatsWin8Events.event_ID, eventObj.eventId);
                attrContainer.addIntegerValue(LibWrap.StatsWin8Events.event_COUNTER, eventObj.raiseCount ? eventObj.raiseCount : 0);
                valueKey = LibWrap.StatsWin8Events.value;
                break;
            case eventType.clickStream:
                attrContainer.addIntegerValue(LibWrap.StatsClickStreamEvents.event_ID, eventObj.eventId);
                attrContainer.addIntegerValue(LibWrap.StatsClickStreamEvents.last_EVENT_ID, eventObj.lastEventId);
                attrContainer.addIntegerValue(LibWrap.StatsClickStreamEvents.sec_FROM_LAST_EVENT, eventObj.secondsSinceLast);
                valueKey = LibWrap.StatsClickStreamEvents.value;
                break;
            case eventType.inventoryInfo:
                attrContainer.addIntegerValue(LibWrap.StatsHardwareInventoryInfo.trigger_TYPE, 1);
                attrContainer.addIntegerValue(LibWrap.StatsHardwareInventoryInfo.relation_ID, 0);

                attrContainer.addStringValue(LibWrap.StatsHardwareInventoryInfo.os_NAME, getOsName());
                attrContainer.addStringValue(LibWrap.StatsHardwareInventoryInfo.os_VERSION, "");

                eventObj.deviceManufacturer && attrContainer.addStringValue(LibWrap.StatsHardwareInventoryInfo.device_MANUFACTURER, eventObj.deviceManufacturer);
                eventObj.deviceName && attrContainer.addStringValue(LibWrap.StatsHardwareInventoryInfo.device_NAME, eventObj.deviceName);
                eventObj.inventoryExtra && attrContainer.addStringValue(LibWrap.StatsHardwareInventoryInfo.inventory_STRING_EXTRAS, eventObj.inventoryExtra);

                valueKey = LibWrap.StatsHardwareInventoryInfo.inventory_STRING;
                break;
            default:
                log("[Stats] Invalid eventType");
                return;
        }

        switch (typeof eventObj.eventData) {
            case "number":
                attrContainer.addIntegerValue(valueKey, eventObj.eventData);
                break;
            case "string":
                attrContainer.addStringValue(valueKey, eventObj.eventData);
                break;
            default:
                attrContainer.addIntegerValue(valueKey, 0);
                break;
        }
        attrContainer.send(eventObj.eventType);
    }

    function validateEvent(event) {
        return event && event.hasOwnProperty("id") &&
            event.hasOwnProperty("schemaId") &&
            event.hasOwnProperty("contextId");
    }


    WinJS.Namespace.define("Skype.Statistics", {
        init: init,
        sendStats: sendStats,
        saveEventsState: saveEventsState,
        restoreEventsState: restoreEventsState,
        eventContextArea: contextAreas,
        eventSchema: schemas,
        eventGroup: eventGroups,
        event: eventsDefinition,
        ExternalAPI: {
            StatsContainer: LibWrap.StatsEventAttributeContainer,
            WebUIApplication: Windows.UI.WebUI.WebUIApplication,
            FileIO: Windows.Storage.FileIO,
            ApplicationData: Windows.Storage.ApplicationData,
            EasClientDeviceInformation: Windows.Security.ExchangeActiveSyncProvisioning.EasClientDeviceInformation
        }
    });
})();