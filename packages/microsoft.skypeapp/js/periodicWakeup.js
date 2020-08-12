

(function () {
    "use strict";

    var LOCAL_SETTING_TRID = "msn_trid";
    var LOCAL_SETTING_EPID = "msn_epid";
    var LOCAL_SETTING_SERVER = "msn_server";
    var LOCAL_SETTING_SESSION_END = "msn_sessionEnd";
    var LOCAL_SETTING_XML_TEMPLATE = "msn_xmlTemplate";
    var LOCAL_SETTING_NEXT_WAKEUP = "msn_next_wakeup";
    var SESSION_LIFETIME_BUFFER_SECS = 120;
    var PING_TEMPLATE_SESSION_ID = "$sessionid";
    var INVALID_TRID = 0;
    var INVALID_SESSION_ID = "Disconnected";

    var reconnectPingResponseResult = {
        PING_RESPONSE_INCOMPLETE: 0,
        PING_RESPONSE_INVALID_COMMAND: 1,
        PING_RESPONSE_ALL_FINE: 2
    };

    var shouldPingResult = {
        SHOULD_PING_NO_TIMESTAMP: 0,
        SHOULD_PING_WE_ARE_OUT: 1,
        SHOULD_PING_GO_AHEAD: 2,
        SHOULD_PING_DELAYING: 3
    };

    var finishedCallbackParam = {
        FINISHED_PARAM_SHOULD_PING_FAILED: 0,
        FINISHED_PARAM_CONNECT_ERROR: 1,
        FINISHED_PARAM_SOCKET_WRITE_FAILED: 2,
        FINISHED_PARAM_SOCKET_READ_FAILED: 3,
        FINISHED_PARAM_INVALID_RESPONSE: 4,
        FINISHED_PARAM_ALL_FINE: 5,
        FINISHED_PARAM_FAILED_TO_LOAD_DATA: 6
    };

    var pinger = WinJS.Class.define(function (finishedCallback) {
        this.finishedCallback = finishedCallback;
        this._apiPasswordVault = new Windows.Security.Credentials.PasswordVault();
    }, {
        _apiPasswordVault: null,
        socket: null,
        globalData: {
            trid: 0,
            sessionId: "",
            server: "",
            epid: "",
            xmlTemplate: "",
            sessionRefreshTimestamp: 0, 
            nextWakeup: 0
        },

        storeToken: function (sessionTimeout, trid, sessionId, epid, nextWakeup) {
            if (!trid || !sessionId) {
                log("Storage failed, inputs missing");
                return;
            }

            var localSettings = Windows.Storage.ApplicationData.current.localSettings;
            localSettings.values[LOCAL_SETTING_SESSION_END] = sessionTimeout;
            localSettings.values[LOCAL_SETTING_TRID] = trid;
            localSettings.values[LOCAL_SETTING_EPID] = epid;
            localSettings.values[LOCAL_SETTING_NEXT_WAKEUP] = nextWakeup;
            try {
                this._apiPasswordVault.findAllByResource(epid).forEach(function (pw) {
                    this._apiPasswordVault.remove(pw);
                }.bind(this));
                this._apiPasswordVault.add(new Windows.Security.Credentials.PasswordCredential(epid, "..", sessionId));
            } catch (e) {
                log("Storage failed, unable to store sessionId");
            }
        },


        loadToken: function () {
            var localSettings = Windows.Storage.ApplicationData.current.localSettings;
            var ret = {
                sessionTimeout: localSettings.values[LOCAL_SETTING_SESSION_END],
                trid: localSettings.values[LOCAL_SETTING_TRID],
                server: localSettings.values[LOCAL_SETTING_SERVER],
                epid: localSettings.values[LOCAL_SETTING_EPID],
                xmlTemplate: localSettings.values[LOCAL_SETTING_XML_TEMPLATE]
            };

            try {
                var sessionTokens = this._apiPasswordVault.findAllByResource(ret.epid);
                if (sessionTokens.size === 1) {
                    sessionTokens[0].retrievePassword();
                    ret.sessionId = sessionTokens[0].password;
                } else {
                    log("SessionTokens: Had " + sessionTokens.size + " instead of 1.");
                }
            } catch (e) {
                log("SessionTokens: None.");
            }
            return ret;
        },

        store: function () {
            this.storeToken(this.globalData.sessionRefreshTimestamp, this.globalData.trid, this.globalData.sessionId, this.globalData.epid, this.globalData.nextWakeup);
            log("Stored.");
        },

        load: function load() {
            log("Loading...");
            var vals = this.loadToken();
            if (!Number(vals.trid) || !vals.server || !vals.sessionId || !vals.epid) {
                log("Invalid credentials stored, aborting.");
                return false;
            }

            log("sessionTimeout: " + vals.sessionTimeout);
            log("trid: " + vals.trid);
            log("sessionId: " + vals.sessionId);
            log("server: " + vals.server);
            log("epid: " + vals.epid);
            log("xmlTemplate: " + vals.xmlTemplate);
            log("Loaded.");

            return {
                sessionRefreshTimestamp: vals.sessionTimeout,
                trid: vals.trid,
                sessionId: vals.sessionId,
                server: vals.server,
                epid: vals.epid,
                xmlTemplate: vals.xmlTemplate,
            };
        },

        readResponse: function (reader, buffer) {
            var count = reader.unconsumedBufferLength;
            buffer += reader.readString(count);
            log("readResponse buffer = " + buffer);
            var status = this.reconnectPingResponded(buffer);
            switch (status) {
                case reconnectPingResponseResult.PING_RESPONSE_INCOMPLETE:
                    reader.loadAsync(512).done(function (res) {
                        this.readResponse(reader);
                    }.bind(this), function () {
                        this.reconnectPingConnectFailed("Socket read error (response incomplete)");
                        this.finishedCallback(finishedCallbackParam.FINISHED_PARAM_SOCKET_READ_FAILED);
                    }.bind(this));
                    break;
                case reconnectPingResponseResult.PING_RESPONSE_INVALID_COMMAND:
                    this.reconnectPingFailed("Invalid response");
                    this.finishedCallback(finishedCallbackParam.FINISHED_PARAM_INVALID_RESPONSE);
                    this.socket.close();
                    break;
                case reconnectPingResponseResult.PING_RESPONSE_ALL_FINE:
                    this.finishedCallback(finishedCallbackParam.FINISHED_PARAM_ALL_FINE);
                    this.socket.close();
                    break;
            }
        },

        constructPingBody: function (trid, sessionId, template) {
            var pingXML = template.replace(PING_TEMPLATE_SESSION_ID, sessionId);
            var commandLength = 2 + pingXML.length;
            return "CNT " + trid + " CON " + commandLength.toString() + "\r\n\r\n" + pingXML;
        },

        connectDone: function () {
            log("Connect complete!");

            
            var body = this.constructPingBody(this.globalData.trid, this.globalData.sessionId, this.globalData.xmlTemplate);
            var writer = new Windows.Storage.Streams.DataWriter(this.socket.outputStream);
            writer.writeString(body);
            log("Sending command body = " + body);
            writer.storeAsync().done(function () {
                log("connectDone: sending done");
                writer.detachStream();
            }.bind(this), function () {
                this.reconnectPingConnectFailed("Socket write error");
                this.finishedCallback(finishedCallbackParam.FINISHED_PARAM_SOCKET_WRITE_FAILED);
            }.bind(this));

            
            var reader = new Windows.Storage.Streams.DataReader(this.socket.inputStream);
            reader.inputStreamOptions = Windows.Storage.Streams.InputStreamOptions.partial;
            var promise = reader.loadAsync(512);
            var buffer = "";
            promise.done(function () {
                this.readResponse(reader, buffer);
            }.bind(this), function () {
                this.reconnectPingConnectFailed("Socket read error");
                this.finishedCallback(finishedCallbackParam.FINISHED_PARAM_SOCKET_READ_FAILED);
            }.bind(this));
        },

        reconnectPingConnectFailed: function (errorString) {
            log("Reconnect ping connect failed! Error: " + errorString);
        },

        connectError: function () {
            this.reconnectPingConnectFailed("Connect error");
            this.finishedCallback(finishedCallbackParam.FINISHED_PARAM_CONNECT_ERROR);
        },

        doPing: function (server) {
            this.socket = new Windows.Networking.Sockets.StreamSocket();
            try {
                var hostname = new Windows.Networking.HostName(server);
            } catch (ex) {
                this.reconnectPingConnectFailed("Hostname '" + server + "' invalid");
                return false;
            }
            log("Starting reconnect ping");
            log("Connecting to '" + hostname.canonicalName + "'...");

            this.socket.connectAsync(hostname, "443", Windows.Networking.Sockets.SocketProtectionLevel.ssl).done(this.connectDone.bind(this), this.connectError.bind(this));
        },

        reconnectPingResponded: function (responseXML) {
            var result = Skype.Notifications.RAW.parse(responseXML);
            
            if (result.status !== Skype.Notifications.RAW.Parsers.ParserBase.ParsingStatus.COMPLETE) {
                return reconnectPingResponseResult.PING_RESPONSE_INCOMPLETE;
            }

            
            if (result.content.command !== Skype.Notifications.RAW.Parsers.MsnParserBase.Commands.CNT) {
                log("unexpected command " + result.content.command);
                return reconnectPingResponseResult.PING_RESPONSE_INVALID_COMMAND;
            }

            var tridI = Number(this.globalData.trid) + 1;
            this.globalData.trid = tridI.toString();
            this.globalData.sessionId = result.content.sessionId;
            log("trid: " + this.globalData.trid);
            log("sessionId: " + this.globalData.sessionId);
            var parsedTimeout = result.content.sessionTimeout;
            if (parsedTimeout > (2 * SESSION_LIFETIME_BUFFER_SECS)) {
                log("Using session timeout " + parsedTimeout);
                this.globalData.sessionRefreshTimestamp = (Date.now() / 1000) + parsedTimeout;
                log("Session refresh timestamp: " + new Date(this.globalData.sessionRefreshTimestamp * 1000).toLocaleString());
            }
            this.store();

            return reconnectPingResponseResult.PING_RESPONSE_ALL_FINE;
        },

        reconnectPingFailed: function (errorString) {
            log("Reconnect ping failed! Error: " + errorString);
            
            this.globalData.trid = INVALID_TRID;
            this.globalData.sessionId = INVALID_SESSION_ID;
            this.store();
        },

        shouldPing: function (nextWakeup) {
            if (!this.globalData.sessionRefreshTimestamp) {
                log("shouldPing: No refresh timestamp, can't ping");
                return shouldPingResult.SHOULD_PING_NO_TIMESTAMP;
            }

            var nowSecs = Date.now() / 1000;
            if (nowSecs > this.globalData.sessionRefreshTimestamp) {
                log("shouldPing: Session already over");
                return shouldPingResult.SHOULD_PING_WE_ARE_OUT;
            }

            var nextWakeupSecs = nextWakeup / 1000;
            var endWithBuffer = this.globalData.sessionRefreshTimestamp - SESSION_LIFETIME_BUFFER_SECS;
            if (nextWakeupSecs > endWithBuffer) {
                log("shouldPing: Next wakeup after session expire (with buffer), doing ping");
                return shouldPingResult.SHOULD_PING_GO_AHEAD;
            }

            log("shouldPing: Next wakeup before buffer time, delaying ping");
            return shouldPingResult.SHOULD_PING_DELAYING;
        },

        checkDoPing: function () {
            if (this.shouldPing(this.globalData.nextWakeup) === shouldPingResult.SHOULD_PING_GO_AHEAD) {
                this.doPing(this.globalData.server);
            } else {
                this.finishedCallback(finishedCallbackParam.FINISHED_PARAM_SHOULD_PING_FAILED);
            }
        },

        periodicWakeup: function () {
            var data = this.load();
            if (!data) {
                this.finishedCallback(finishedCallbackParam.FINISHED_PARAM_FAILED_TO_LOAD_DATA);
                return;
            }

            this.globalData.sessionRefreshTimestamp = data.sessionRefreshTimestamp;
            this.globalData.trid = data.trid;
            this.globalData.sessionId = data.sessionId;
            this.globalData.server = data.server;
            this.globalData.epid = data.epid;
            this.globalData.xmlTemplate = data.xmlTemplate;
            this.globalData.nextWakeup = Date.now() + (15 * 60 * 1000);

            this.checkDoPing();
        }
    });

    function periodicWakeupAsync() {
        return new WinJS.Promise(function (completedHandler, errorHandler) {
            try {
                var pingerInstance = new Skype.PeriodicWakeup.Pinger(completedHandler);
                pingerInstance.periodicWakeup();
            } catch(error) {
                
                
                errorHandler(error);
            }
        });
    }

    WinJS.Namespace.define("Skype.PeriodicWakeup", {
        periodicWakeupAsync: periodicWakeupAsync,
        Pinger: pinger,
        ReconnectPingResponseResult: reconnectPingResponseResult,
        ShouldPingResult: shouldPingResult
    });
})();