



(function () {
    "use strict";
    var using = {
        MessageDialog: Windows.UI.Popups.MessageDialog,
        UICommand: Windows.UI.Popups.UICommand
    },
        URI_TO_ACTION = {
            call: "call",
            chat: "chat",
            sms: "sms",
            voicemail: "voicemail",
            add: "add",
            sendfile: "sendfile",
            userinfo: "userinfo",
            home: "home",
            dialer: "dialer"
        },
        TRANSLATE_URI = {
            tel: { suffix: "call" },
            sms: { suffix: "sms" },
            "message-skype-com": { suffix: "chat" },
            "audiocall-skype-com": { suffix: "call" },
            "videocall-skype-com": { suffix: "call&video=true" },
            "message-messenger": { suffix: "chat", identity_namespace: "1" },
            "audiocall-messenger": { suffix: "call", identity_namespace: "1" },
            "videocall-messenger": { suffix: "call&video=true", identity_namespace: "1" }
        },
        uriLengthLimit = 1024,
        _removeSlashes = function(uri) {
            while (uri.slice(0, 1) == "/") {
                uri = uri.slice(1);
            };
            return uri;
        },
        
        _getChatTarget = function(params) {
            var conv, targets = [];
            if (params.id) {
                conv = lib.getConversationByIdentity(params.id);                
            } else if (params.blob) {
                conv = lib.getConversationByBlob(params.blob, true);                
            }
            
            if (conv) {
                targets.push(conv.getIdentity());
                conv.discard();
                return targets;
            }
            return null;
        },    

        _handleNavigationFromLoginPage = function () {
            var currentPage = Skype.Application.state.page;
            if (currentPage && currentPage.name === "login") {
                Skype.UI.navigate(); 
            }
        };



    function handleURI(uri, safe) {
        
        
        
        
        
        
        
        
        
        

        log("URIHandler.handleURI: {0}".format(uri));

        var i,
            wfuri,
            action,
            actionSplit,
            params = {},
            arg,
            number,
            targets = [],
            targetNames = [],
            numberProcessed,
            message,
            messageDialog,
            split,
            protocol,
            length;

        uri = uri.trim();
        if (!uri || uri === "") {
            log("URIHandler.handleURI: ignore empty URI");
            return false;
        }

        wfuri = new Windows.Foundation.Uri(uri);
        if (wfuri.suspicious) {
            log("URIHandler.handleURI: ignore suspicious URI");
            return false;
        }

        if (uri.length > uriLengthLimit) {
            
            log("URIHandler.handleURI: too long URI, trimming to protocol:target?query");

            
            
            uri = "{0}:".format(wfuri.schemeName);
            if (uri.length + wfuri.path.length < uriLengthLimit) {
                uri += wfuri.path;

                if (wfuri.queryParsed.size > 0 && (uri.length + 1 + wfuri.queryParsed[0].name.length < uriLengthLimit)) {
                    uri = "{0}?{1}".format(uri, wfuri.queryParsed[0].name);
                }
            }
        }

        if (uri.slice(0, 6).toLowerCase() != "skype:") {
            
            length = uri.indexOf(":");
            protocol = TRANSLATE_URI[uri.slice(0, length)];
            if (protocol) {
                log(protocol.suffix + " URI translated to skype URI");
                uri = uri.slice(length + 1);
                uri = _removeSlashes(uri);
                
                if (protocol.identity_namespace) {
                    uri = protocol.identity_namespace + "%3a" + uri;
                }

                return handleURI("skype:" + uri + "?" + protocol.suffix, safe);
            }

            log("Failed: Not a Skype: URI");
            return false;
        };

        uri = uri.slice(6);
        uri = _removeSlashes(uri);
        split = uri.split("?");
        if (split.length > 2) {
            log("Failed: expected at most one question mark");
            return false;
        };

        
        action = split.length > 1 ? split[1] : "call"; 
        actionSplit = action.split("&");
        action = actionSplit[0].toLowerCase();
        for (i = 1; i < actionSplit.length; i++) {
            var separatorPos = actionSplit[i].indexOf("=");
            if (separatorPos !== -1) {
                var key = actionSplit[i].substr(0, separatorPos);
                var value = actionSplit[i].substr(separatorPos + 1);
                params[key] = decodeURIComponent(value);
            }
        };

        
        if (URI_TO_ACTION[action]) {
            action = URI_TO_ACTION[action];
        } else {
            log("Invalid action: " + action);
            return false;
        }

        number = split[0];
        if (!number && action === "call") {
            _handleNavigationFromLoginPage();
            return false;
        }

        
        if (!(action === "home" || action === "dialer" || action === "chat") && number.substr(0, 4) !== "1%3a") {
            if (!Skype.Lib.validIdentity(number)) {
                log("HandleURI - unrecognized number, sending to dialer");
                action = "dialer";
                params.number = number;
                numberProcessed = 1;
            }
        }

        
        if (!numberProcessed && split[0]) {
            targets = split[0].split(";").map(decodeURIComponent);
            for (i = 0; i < targets.length; i++) {
                if (lib.getIdentityType(targets[i]) == LibWrap.WrSkyLib.identitytype_UNRECOGNIZED) {
                    log("Invalid identity: " + targets[i]);
                    return false;
                }
            }
        }

        
        
        if (safe || action !== "call") {
            if (action === "add") {
                action = "chat";
            }
            if (action === "chat" && targets.length === 0 && params) {
                targets = _getChatTarget(params);
                if (!targets) {
                    log("Coversations not found");
                    _handleNavigationFromLoginPage();
                    return false;
                }
            }
            Actions.invoke(action, targets, params);
            log("URI handled");
        } else {
            
            targets.forEach(function(item, i, arr) {
                var conv = lib.getConversationByIdentity(item);
                if (conv) {
                    targetNames.push(conv.getDisplayNameHtml());
                    conv.discard();
                } else {
                    targetNames.push(item);
                }
            });

            message = targetNames ? "\n" + Skype.UI.Util.decodeHTMLEntities(targetNames.join("\n")) + "\n" : ""; 
            messageDialog = new using.MessageDialog("uri_warning_call".translate(message));
            
            messageDialog.commands.append(new using.UICommand(
                "options_yes".translate(),
                function (command) {
                    Actions.invoke(action, targets, params);
                    log("URI handled");
                 }));
            messageDialog.commands.append(new using.UICommand(
                "options_no".translate(),
                function (command) {
                    
                    
                    
                    _handleNavigationFromLoginPage();
                    log("URI not handled due to user disallowance");
                }));

            
            messageDialog.defaultCommandIndex = 0;

            
            messageDialog.cancelCommandIndex = 1;
            messageDialog.showAsync();
        }
    }

    WinJS.Namespace.define("Skype.URIHandler", {
        handle: handleURI,
        uriLengthLimit: uriLengthLimit,
        external: using
    });
})();