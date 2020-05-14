/*!
  Copyright (C) Microsoft. All rights reserved.
  This library is supported for use in Windows Store apps only.
*/
/// <disable>EnableStrictMode.EnforceModulePattern</disable>
"use strict";

var adParams = null;
var prmParams = null;
var pointerDown = false;
var appParams = null;

var MSG_TYPE_SCRIPT = "script";
var MSG_TYPE_ADPARAMS = "adParams";
var MSG_TYPE_PRMPARAMS = "prmParams";
var MSG_TYPE_APPPARAMS = "appParams";
var MSG_TYPE_INIT = "init";
var MSG_TYPE_ERROR = "error";
var MSG_TYPE_SETMAXSIZE = "setMaxSize";
var MSG_TYPE_SETSCREENSIZE = "setScreenSize";
var MSG_TYPE_SETSIZE = "setSize";
var MSG_TYPE_SETSTATE = "setState";
var MSG_TYPE_WIREAPPEVENTS = "wireAppEvents";
var MSG_TYPE_START = "ormmaStart";
var MSG_TYPE_ORMMA_RESPONSE = "ormmaResponse";
var MSG_TYPE_FIRESHAKE = "fireShake";
var MSG_TYPE_UPDATETILTCOORDS = "updateTiltCoords";
var MSG_TYPE_UPDATEORIENTATION = "updateOrienation";
var MSG_TYPE_VIEWABLECHANGE = "viewableChange";
var MSG_TYPE_SETNETWORK = "setNetwork";
var MSG_TYPE_SETLOCALE = "setLocale";
var MSG_TYPE_SETSDKINFO = "setSdkInfo";
var MSG_TYPE_SETCAPABILITY = "setCapability";
var MSG_TYPE_SETADINSTANCESTATE = "setAdInstanceState";
var MSG_TYPE_SETFOCUS = "setFocus";
var MSG_TYPE_ONPOINTERDOWN = "MSPointerDown";
var MSG_TYPE_ONPOINTERUP = "MSPointerUp";
var MSG_TYPE_ONPOINTERMOVE = "MSPointerMove";
var MSG_TYPE_ONMOUSEWHEEL = "MSMouseWheel";
var MSG_TYPE_ONMANIPSTATECHANGED = "MSManipulationStateChanged";
var MSG_TYPE_ADINITIALIZED = "adInitialized";

// If updating this, make sure to also update in ad control.
var EVENT_TYPE_ENUM = {
    All: ~0,
    PointerDown: 1 << 0,
    PointerUp: 1 << 1,
    PointerMove: 1 << 2,
    // 1 << 3, was used by pointer hover but freed up due to TFS #864590
    MouseWheel: 1 << 4,
    ManipulationStateChanged: 1 << 5
    // We can only send a max of 1<<31 events this way.
};

var applicationEventHandlers = {
    onPointerDown: null,
    onPointerUp: null,
    onMouseWheel: null,
    onPointerMove: null,
    onManipulationStateChanged: null
};

function injectJavaScript(scriptTxt) {
    try {
        var scr = document.createElement("script");
        var headID = document.getElementsByTagName("head")[0];
        scr.innerHTML = scriptTxt;
        headID.appendChild(scr);
    }
    catch (err) {
        var message = (err === null || typeof (err) === "undefined") ? "unknown" : err.message;
        reportAdError("error injecting javascript: " + message);
    }
}

function receiveMessage(msg) {
    try {
        if (typeof (MSG_TYPE_SCRIPT) === "undefined" || typeof (JSON) === "undefined") {
            // If these variables are not defined, it means the iframe has been removed from the document and is being cleaned up.
            // This can occur if ad frames are being repeatedly created/desctroyed very very quickly (not a likely scenario).
            // But if the iframe has been removed, there is no need to process pending messages for it, so just return.
            return;
        }

        var msgType = null;
        var msgContent = null;
        var colonIx = msg.indexOf(":");
        if (colonIx < 0) {
            msgType = msg;
        } else {
            msgType = msg.substr(0, colonIx);
            msgContent = msg.substr(colonIx + 1);
        }

        if (msgType === MSG_TYPE_SCRIPT) {
            if (msgContent !== "") {
                injectJavaScript(msgContent);
            }
        } else if (msgType === MSG_TYPE_ADPARAMS) {
            // The message is a JSON blob containing the ad parameters. These will
            // be passed to the Renderer during initialization.
            if (msgContent !== "") {
                try {
                    adParams = JSON.parse(msgContent);
                }
                catch (err) {
                    reportAdError("Ad params JSON parse error: " + err.message);
                }
            }
        } else if (msgType === MSG_TYPE_PRMPARAMS) {
            // The message is a JSON blob containing the prm parameters. These will
            // be passed to the Renderer during initialization.
            if (msgContent !== "") {
                try {
                    prmParams = JSON.parse(msgContent);
                }
                catch (err) {
                    reportAdError("Prm params JSON parse error: " + err.message);
                }
            }
        } else if (msgType === MSG_TYPE_APPPARAMS) {
            // The message is a JSON blob containing the app parameters. These will
            // be passed to the Renderer during initialization.
            if (msgContent !== "") {
                try {
                    appParams = JSON.parse(msgContent);
                }
                catch (err) {
                    reportAdError("App params JSON parse error: " + err.message);
                }
            }
        } else if (msgType === MSG_TYPE_INIT) {

            if (Ormma.getState() === "expanded") {
                // if we're expanded setup escape key close
                document.addEventListener("keyup", function (e) {
                    /*escape key is code 27*/
                    if (e.keyCode === 27) {
                        Ormma.close();
                    }
                });
                var adBodyEl = document.getElementById("adBody");
                if (adBodyEl !== null) {
                    adBodyEl.focus();
                }
            } else {
                document.addEventListener("keyup", function (e) {
                    if (e.keyCode === 32 || e.keyCode === 13) {
                        Ormma._clicked();
                    }
                });
            }

            try {
                if (typeof (microsoft) !== "undefined" && typeof (msMainAdDiv) !== "undefined") {
                    window.renderer = new microsoft.advertising.renderer();
                    window.renderer.init({ creativeData: adParams, container: msMainAdDiv.id, prm: prmParams, appOptions: appParams });
                    window.renderer.renderAd();
                }
                postToLocal(MSG_TYPE_ADINITIALIZED);
            }
            catch (msg) {
                reportAdError("unable to initialize and load renderer: " + msg);
                return;
            }
        } else if (msgType === MSG_TYPE_SETADINSTANCESTATE) {
            Ormma._setAdInstanceState(msgContent);
        } else {
            if (typeof (Ormma) !== "undefined" && Ormma !== null) {
                if (msgType === MSG_TYPE_SETSIZE) {
                    var size = JSON.parse(msgContent);
                    Ormma._setSize(size.width, size.height);
                } else if (msgType === MSG_TYPE_SETMAXSIZE) {
                    var maxSize = JSON.parse(msgContent);
                    Ormma._maxSize = maxSize;
                } else if (msgType === MSG_TYPE_SETSCREENSIZE) {
                    var screenSize = JSON.parse(msgContent);
                    Ormma._setScreenSize(screenSize.width, screenSize.height);
                } else if (msgType === MSG_TYPE_SETSTATE) {
                    Ormma._setState(msgContent);
                } else if (msgType === MSG_TYPE_SETLOCALE) {
                    Ormma._setLocale(msgContent);
                } else if (msgType === MSG_TYPE_SETSDKINFO) {
                    var sdkInfo = JSON.parse(msgContent);
                    Ormma._setSdkVersion(sdkInfo.sdkVersion, sdkInfo.client, sdkInfo.runtimeType);
                } else if (msgType === MSG_TYPE_SETCAPABILITY) {
                    var capabilityInfo = JSON.parse(msgContent);
                    Ormma._setCapability(capabilityInfo.capability, capabilityInfo.value);
                } else if (msgType === MSG_TYPE_START) {
                    Ormma._init(msgContent);
                } else if (msgType === MSG_TYPE_FIRESHAKE) {
                    Ormma._shake();
                } else if (msgType === MSG_TYPE_ORMMA_RESPONSE) {
                    Ormma._sendResponse(JSON.parse(msgContent));
                } else if (msgType === MSG_TYPE_UPDATETILTCOORDS) {
                    var coords = JSON.parse(msgContent);
                    Ormma._tiltChange(coords);
                } else if (msgType === MSG_TYPE_VIEWABLECHANGE) {
                    var viewable = JSON.parse(msgContent);
                    Ormma._viewableChange(viewable.viewable);
                } else if (msgType === MSG_TYPE_UPDATEORIENTATION) {
                    var orienation = JSON.parse(msgContent);
                    Ormma._setOrientation(orienation.orientation);
                } else if (msgType === MSG_TYPE_SETNETWORK) {
                    Ormma._setNetwork(msgContent);
                } else if (msgType === MSG_TYPE_WIREAPPEVENTS) {
                    var params = JSON.parse(msgContent);
                    _wireApplicationEvents(params);
                } else if (msgType === MSG_TYPE_ERROR) {
                    var errorInfo = JSON.parse(msgContent);
                    Ormma._throwError(errorInfo.action, errorInfo.message);
                } else if (msgType === MSG_TYPE_SETFOCUS) {
                    if (msgContent === "true") {
                        document.body.focus();
                    }
                }
            }
        }
    }
    catch (err) {
        reportAdError("unable to process SDK message, error=" + err);
        //Error during receive message. This is often caused by render ready ads over-writing basic funcitonality. 
    }
}

function reportAdError(msg) {
    postToLocal(MSG_TYPE_ERROR + ":" + msg);
}

function postToLocal(msg) {
    window.external.notify(msg)
}

function _wireApplicationEvents(params) {
    if (params === null || typeof (params) === "undefined") {
        return;
    }

    var eventMask = parseInt(params.events);

    // NOTE: these MUST be attached to window and using bubbling (false param to addEventListener), otherwise the renderer will not be
    //   able to intercept and cancel (stopImmediatePropagation()) on these events if needed!
    //   There renderer will attach to a more down level element (ie: window.document). Because these are in bubbling phase the renderer
    //   will be able to call stopImmediatePropagation and thus the event will stop bubbling at that point. Bubbling events execute
    //   on the lowest level element first.

    if ((eventMask & EVENT_TYPE_ENUM.PointerDown) !== 0 && typeof (applicationEventHandlers.onPointerDown) !== "function") {
        applicationEventHandlers.onPointerDown = function (evt) {
            if (evt.which === 2 && params.preventDefault) {
                evt.preventDefault(); // prevent the default windows handling of mouse wheel, hard code for appex...
            }

            pointerDown = true;
            postToLocal(MSG_TYPE_ONPOINTERDOWN + ":" + JSON.stringify({
                "clientX": evt.clientX,
                "clientY": evt.clientY,
                "pointerType": evt.pointerType,
                "which": evt.which
            }));
        };

        window.addEventListener("MSPointerDown", applicationEventHandlers.onPointerDown, false);
    } else if ((eventMask & EVENT_TYPE_ENUM.PointerDown) === 0 && typeof (applicationEventHandlers.onPointerDown) === "function") {
        window.removeEventListener("MSPointerDown", applicationEventHandlers.onPointerDown, false);
        applicationEventHandlers.onPointerDown = null;
    }

    if ((eventMask & EVENT_TYPE_ENUM.PointerUp) !== 0 && typeof (applicationEventHandlers.onPointerUp) !== "function") {
        applicationEventHandlers.onPointerUp = function (evt) {
            if (evt.type === "MSPointerOut") {
                if (pointerDown) {
                    pointerDown = false;
                    postToLocal(MSG_TYPE_ONPOINTERUP);
                }
            }
            else {
                pointerDown = false;
                postToLocal(MSG_TYPE_ONPOINTERUP);
            }
        };

        window.addEventListener("MSPointerUp", applicationEventHandlers.onPointerUp, false);
        window.addEventListener("MSPointerCancel", applicationEventHandlers.onPointerUp, false);
        window.addEventListener("MSPointerOut", applicationEventHandlers.onPointerUp, false);
        window.addEventListener("MSLostPointerCapture", applicationEventHandlers.onPointerUp, false);
    } else if ((eventMask & EVENT_TYPE_ENUM.PointerUp) === 0 && typeof (applicationEventHandlers.onPointerUp) === "function") {
        window.removeEventListener("MSPointerUp", applicationEventHandlers.onPointerUp, false);
        window.removeEventListener("MSPointerCancel", applicationEventHandlers.onPointerUp, false);
        window.removeEventListener("MSPointerOut", applicationEventHandlers.onPointerUp, false);
        window.removeEventListener("MSLostPointerCapture", applicationEventHandlers.onPointerUp, false);
        applicationEventHandlers.onPointerUp = null;
    }

    if ((eventMask & EVENT_TYPE_ENUM.PointerMove) !== 0 && typeof (applicationEventHandlers.onPointerMove) !== "function") {
        applicationEventHandlers.onPointerMove = function (evt) {
            postToLocal(MSG_TYPE_ONPOINTERMOVE + ":" + JSON.stringify({
                "clientX": evt.clientX,
                "clientY": evt.clientY,
            }));
        };

        window.addEventListener("MSPointerMove", applicationEventHandlers.onPointerMove, false);
    } else if ((eventMask & EVENT_TYPE_ENUM.PointerMove) === 0 && typeof (applicationEventHandlers.onPointerMove) === "function") {
        window.removeEventListener("MSPointerMove", applicationEventHandlers.onPointerMove, false);
        applicationEventHandlers.onPointerMove = null;
    }

    if ((eventMask & EVENT_TYPE_ENUM.ManipulationStateChanged) !== 0 && typeof (applicationEventHandlers.onManipulationStateChanged) !== "function") {
        applicationEventHandlers.onManipulationStateChanged = function (evt) {
            postToLocal(MSG_TYPE_ONMANIPSTATECHANGED + ":" + JSON.stringify({
                "lastState": evt.lastState,
                "currentState": evt.currentState
            }));
        };

        window.addEventListener("MSManipulationStateChanged", applicationEventHandlers.onManipulationStateChanged, false);
    } else if ((eventMask & EVENT_TYPE_ENUM.ManipulationStateChanged) === 0 && typeof (applicationEventHandlers.onManipulationStateChanged) === "function") {
        window.removeEventListener("MSManipulationStateChanged", applicationEventHandlers.onManipulationStateChanged, false);
        applicationEventHandlers.onManipulationStateChanged = null;
    }

    if ((eventMask & EVENT_TYPE_ENUM.MouseWheel) !== 0 && typeof (applicationEventHandlers.onMouseWheel) !== "function") {
        applicationEventHandlers.onMouseWheel = function (evt) {
            if (params.preventDefault) {
                evt.preventDefault(); // prevent the default windows handling of mouse wheel, hard code for appex...
            }

            postToLocal(MSG_TYPE_ONMOUSEWHEEL + ":" + JSON.stringify({
                "clientX": evt.clientX,
                "clientY": evt.clientY,
                "ctrlKey": evt.ctrlKey,
                "wheelDelta": evt.wheelDelta
            }));
        };

        window.addEventListener("mousewheel", applicationEventHandlers.onMouseWheel, false);
    } else if ((eventMask & EVENT_TYPE_ENUM.MouseWheel) === 0 && typeof (applicationEventHandlers.onMouseWheel) === "function") {
        window.removeEventListener("mousewheel", applicationEventHandlers.onMouseWheel, false);
        applicationEventHandlers.onMouseWheel = null;
    }
}
// SIG // Begin signature block
// SIG // MIIanwYJKoZIhvcNAQcCoIIakDCCGowCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFJudyYpvZTop
// SIG // 18JJ7fn8SbL7q6TcoIIVejCCBLswggOjoAMCAQICEzMA
// SIG // AABa7S/05CCZPzoAAAAAAFowDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE0MDUyMzE3
// SIG // MTMxNVoXDTE1MDgyMzE3MTMxNVowgasxCzAJBgNVBAYT
// SIG // AlVTMQswCQYDVQQIEwJXQTEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MQ0wCwYDVQQLEwRNT1BSMScwJQYDVQQLEx5uQ2lwaGVy
// SIG // IERTRSBFU046QjhFQy0zMEE0LTcxNDQxJTAjBgNVBAMT
// SIG // HE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggEi
// SIG // MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCzISLf
// SIG // atC/+ynJ1Wx6iamNE7yUtel9KWXaf/Qfqwx5YWZUYZYH
// SIG // 8NRgSzGbCa99KG3QpXuHX3ah0sYpx5Y6o18XjHbgt5YH
// SIG // D8diYbS2qvZGFCkDLiawHUoI4H3TXDASppv2uQ49UxZp
// SIG // nbtlJ0LB6DI1Dvcp/95bIEy7L2iEJA+rkcTzzipeWEbt
// SIG // qUW0abZUJpESYv1vDuTP+dw/2ilpH0qu7sCCQuuCc+lR
// SIG // UxG/3asdb7IKUHgLg+8bCLMbZ2/TBX2hCZ/Cd4igo1jB
// SIG // T/9n897sx/Uz3IpFDpZGFCiHHGC39apaQExwtWnARsjU
// SIG // 6OLFkN4LZTXUVIDS6Z0gVq/U3825AgMBAAGjggEJMIIB
// SIG // BTAdBgNVHQ4EFgQUvmfgLgIbrwpyDTodf4ydayJmEfcw
// SIG // HwYDVR0jBBgwFoAUIzT42VJGcArtQPt2+7MrsMM1sw8w
// SIG // VAYDVR0fBE0wSzBJoEegRYZDaHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljcm9z
// SIG // b2Z0VGltZVN0YW1wUENBLmNybDBYBggrBgEFBQcBAQRM
// SIG // MEowSAYIKwYBBQUHMAKGPGh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljcm9zb2Z0VGltZVN0
// SIG // YW1wUENBLmNydDATBgNVHSUEDDAKBggrBgEFBQcDCDAN
// SIG // BgkqhkiG9w0BAQUFAAOCAQEAIFOCkK6mTU5+M0nIs63E
// SIG // w34V0BLyDyeKf1u/PlTqQelUAysput1UiLu599nOU+0Q
// SIG // Fj3JRnC0ANHyNF2noyIsqiLha6G/Dw2H0B4CG+94tokg
// SIG // 0CyrC3Q4LqYQ/9qRqyxAPCYVqqzews9KkwPNa+Kkspka
// SIG // XUdE8dyCH+ZItKZpmcEu6Ycj6gjSaeZi33Hx6yO/IWX5
// SIG // pFfEky3bFngVqj6i5IX8F77ATxXbqvCouhErrPorNRZu
// SIG // W3P+MND7q5Og3s1C2jY/kffgN4zZB607J7v/VCB3xv0R
// SIG // 6RrmabIzJ6sFrliPpql/XRIRaAwsozEWDb4hq5zwrhp8
// SIG // QNXWgxYV2Cj75TCCBOwwggPUoAMCAQICEzMAAADKbNUy
// SIG // EjXE4VUAAQAAAMowDQYJKoZIhvcNAQEFBQAweTELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EwHhcNMTQwNDIyMTczOTAw
// SIG // WhcNMTUwNzIyMTczOTAwWjCBgzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjENMAsGA1UECxMETU9QUjEeMBwGA1UEAxMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMIIBIjANBgkqhkiG9w0B
// SIG // AQEFAAOCAQ8AMIIBCgKCAQEAlnFd7QZG+oTLnVu3Rsew
// SIG // 4bQROQOtsRVzYJzrp7ZuGjw//2XjNPGmpSFeVplsWOSS
// SIG // oQpcwtPcUi8MZZogYUBTMZxsjyF9uvn+E1BSYJU6W7lY
// SIG // pXRhQamU4K0mTkyhl3BJJ158Z8pPHnGERrwdS7biD8XG
// SIG // J8kH5noKpRcAGUxwRTgtgbRQqsVn0fp5vMXMoXKb9CU0
// SIG // mPhU3xI5OBIvpGulmn7HYtHcz+09NPi53zUwuux5Mqnh
// SIG // qaxVTUx/TFbDEwt28Qf5zEes+4jVUqUeKPo9Lc/PhJiG
// SIG // cWURz4XJCUSG4W/nsfysQESlqYsjP4JJndWWWVATWRhz
// SIG // /0MMrSvUfzBAZwIDAQABo4IBYDCCAVwwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwMwHQYDVR0OBBYEFB9e4l1QjVaGvko8
// SIG // zwTop4e1y7+DMFEGA1UdEQRKMEikRjBEMQ0wCwYDVQQL
// SIG // EwRNT1BSMTMwMQYDVQQFEyozMTU5NStiNDIxOGYxMy02
// SIG // ZmNhLTQ5MGYtOWM0Ny0zZmM1NTdkZmM0NDAwHwYDVR0j
// SIG // BBgwFoAUyxHoytK0FlgByTcuMxYWuUyaCh8wVgYDVR0f
// SIG // BE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljQ29kU2lnUENB
// SIG // XzA4LTMxLTIwMTAuY3JsMFoGCCsGAQUFBwEBBE4wTDBK
// SIG // BggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNDb2RTaWdQQ0FfMDgtMzEt
// SIG // MjAxMC5jcnQwDQYJKoZIhvcNAQEFBQADggEBAHdc69eR
// SIG // Pc29e4PZhamwQ51zfBfJD+0228e1LBte+1QFOoNxQIEJ
// SIG // ordxJl7WfbZsO8mqX10DGCodJ34H6cVlH7XPDbdUxyg4
// SIG // Wojne8EZtlYyuuLMy5Pbr24PXUT11LDvG9VOwa8O7yCb
// SIG // 8uH+J13oxf9h9hnSKAoind/NcIKeGHLYI8x6LEPu/+rA
// SIG // 4OYdqp6XMwBSbwe404hs3qQGNafCU4ZlEXcJjzVZudiG
// SIG // qAD++DF9LPSMBZ3AwdV3cmzpTVkmg/HCsohXkzUAfFAr
// SIG // vFn8/hwpOILT3lKXRSkYTpZbnbpfG6PxJ1DqB5XobTQN
// SIG // OFfcNyg1lTo4nNTtaoVdDiIRXnswggW8MIIDpKADAgEC
// SIG // AgphMyYaAAAAAAAxMA0GCSqGSIb3DQEBBQUAMF8xEzAR
// SIG // BgoJkiaJk/IsZAEZFgNjb20xGTAXBgoJkiaJk/IsZAEZ
// SIG // FgltaWNyb3NvZnQxLTArBgNVBAMTJE1pY3Jvc29mdCBS
// SIG // b290IENlcnRpZmljYXRlIEF1dGhvcml0eTAeFw0xMDA4
// SIG // MzEyMjE5MzJaFw0yMDA4MzEyMjI5MzJaMHkxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xIzAhBgNVBAMTGk1pY3Jvc29mdCBD
// SIG // b2RlIFNpZ25pbmcgUENBMIIBIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAQ8AMIIBCgKCAQEAsnJZXBkwZL8dmmAgIEKZdlNs
// SIG // PhvWb8zL8epr/pcWEODfOnSDGrcvoDLs/97CQk4j1XIA
// SIG // 2zVXConKriBJ9PBorE1LjaW9eUtxm0cH2v0l3511iM+q
// SIG // c0R/14Hb873yNqTJXEXcr6094CholxqnpXJzVvEXlOT9
// SIG // NZRyoNZ2Xx53RYOFOBbQc1sFumdSjaWyaS/aGQv+knQp
// SIG // 4nYvVN0UMFn40o1i/cvJX0YxULknE+RAMM9yKRAoIsc3
// SIG // Tj2gMj2QzaE4BoVcTlaCKCoFMrdL109j59ItYvFFPees
// SIG // CAD2RqGe0VuMJlPoeqpK8kbPNzw4nrR3XKUXno3LEY9W
// SIG // PMGsCV8D0wIDAQABo4IBXjCCAVowDwYDVR0TAQH/BAUw
// SIG // AwEB/zAdBgNVHQ4EFgQUyxHoytK0FlgByTcuMxYWuUya
// SIG // Ch8wCwYDVR0PBAQDAgGGMBIGCSsGAQQBgjcVAQQFAgMB
// SIG // AAEwIwYJKwYBBAGCNxUCBBYEFP3RMU7TJoqV4ZhgO6gx
// SIG // b6Y8vNgtMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBB
// SIG // MB8GA1UdIwQYMBaAFA6sgmBAVieX5SUT/CrhClOVWeSk
// SIG // MFAGA1UdHwRJMEcwRaBDoEGGP2h0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL21pY3Jv
// SIG // c29mdHJvb3RjZXJ0LmNybDBUBggrBgEFBQcBAQRIMEYw
// SIG // RAYIKwYBBQUHMAKGOGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2kvY2VydHMvTWljcm9zb2Z0Um9vdENlcnQu
// SIG // Y3J0MA0GCSqGSIb3DQEBBQUAA4ICAQBZOT5/Jkav629A
// SIG // sTK1ausOL26oSffrX3XtTDst10OtC/7L6S0xoyPMfFCY
// SIG // gCFdrD0vTLqiqFac43C7uLT4ebVJcvc+6kF/yuEMF2nL
// SIG // pZwgLfoLUMRWzS3jStK8cOeoDaIDpVbguIpLV/KVQpzx
// SIG // 8+/u44YfNDy4VprwUyOFKqSCHJPilAcd8uJO+IyhyugT
// SIG // pZFOyBvSj3KVKnFtmxr4HPBT1mfMIv9cHc2ijL0nsnlj
// SIG // VkSiUc356aNYVt2bAkVEL1/02q7UgjJu/KSVE+Traeep
// SIG // oiy+yCsQDmWOmdv1ovoSJgllOJTxeh9Ku9HhVujQeJYY
// SIG // XMk1Fl/dkx1Jji2+rTREHO4QFRoAXd01WyHOmMcJ7oUO
// SIG // jE9tDhNOPXwpSJxy0fNsysHscKNXkld9lI2gG0gDWvfP
// SIG // o2cKdKU27S0vF8jmcjcS9G+xPGeC+VKyjTMWZR4Oit0Q
// SIG // 3mT0b85G1NMX6XnEBLTT+yzfH4qerAr7EydAreT54al/
// SIG // RrsHYEdlYEBOsELsTu2zdnnYCjQJbRyAMR/iDlTd5aH7
// SIG // 5UcQrWSY/1AWLny/BSF64pVBJ2nDk4+VyY3YmyGuDVyc
// SIG // 8KKuhmiDDGotu3ZrAB2WrfIWe/YWgyS5iM9qqEcxL5rc
// SIG // 43E91wB+YkfRzojJuBj6DnKNwaM9rwJAav9pm5biEKgQ
// SIG // tDdQCNbDPTCCBgcwggPvoAMCAQICCmEWaDQAAAAAABww
// SIG // DQYJKoZIhvcNAQEFBQAwXzETMBEGCgmSJomT8ixkARkW
// SIG // A2NvbTEZMBcGCgmSJomT8ixkARkWCW1pY3Jvc29mdDEt
// SIG // MCsGA1UEAxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNh
// SIG // dGUgQXV0aG9yaXR5MB4XDTA3MDQwMzEyNTMwOVoXDTIx
// SIG // MDQwMzEzMDMwOVowdzELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEh
// SIG // MB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // n6Fssd/bSJIqfGsuGeG94uPFmVEjUK3O3RhOJA/u0afR
// SIG // TK10MCAR6wfVVJUVSZQbQpKumFwwJtoAa+h7veyJBw/3
// SIG // DgSY8InMH8szJIed8vRnHCz8e+eIHernTqOhwSNTyo36
// SIG // Rc8J0F6v0LBCBKL5pmyTZ9co3EZTsIbQ5ShGLieshk9V
// SIG // UgzkAyz7apCQMG6H81kwnfp+1pez6CGXfvjSE/MIt1Nt
// SIG // UrRFkJ9IAEpHZhEnKWaol+TTBoFKovmEpxFHFAmCn4Tt
// SIG // VXj+AZodUAiFABAwRu233iNGu8QtVJ+vHnhBMXfMm987
// SIG // g5OhYQK1HQ2x/PebsgHOIktU//kFw8IgCwIDAQABo4IB
// SIG // qzCCAacwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU
// SIG // IzT42VJGcArtQPt2+7MrsMM1sw8wCwYDVR0PBAQDAgGG
// SIG // MBAGCSsGAQQBgjcVAQQDAgEAMIGYBgNVHSMEgZAwgY2A
// SIG // FA6sgmBAVieX5SUT/CrhClOVWeSkoWOkYTBfMRMwEQYK
// SIG // CZImiZPyLGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJ
// SIG // bWljcm9zb2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9v
// SIG // dCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHmCEHmtFqFKoKWt
// SIG // THNY9AcTLmUwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvbWljcm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUF
// SIG // BwEBBEgwRjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRS
// SIG // b290Q2VydC5jcnQwEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // DQYJKoZIhvcNAQEFBQADggIBABCXisNcA0Q23em0rXfb
// SIG // znlRTQGxLnRxW20ME6vOvnuPuC7UEqKMbWK4VwLLTiAT
// SIG // UJndekDiV7uvWJoc4R0Bhqy7ePKL0Ow7Ae7ivo8KBciN
// SIG // SOLwUxXdT6uS5OeNatWAweaU8gYvhQPpkSokInD79vzk
// SIG // eJkuDfcH4nC8GE6djmsKcpW4oTmcZy3FUQ7qYlw/FpiL
// SIG // ID/iBxoy+cwxSnYxPStyC8jqcD3/hQoT38IKYY7w17gX
// SIG // 606Lf8U1K16jv+u8fQtCe9RTciHuMMq7eGVcWwEXChQO
// SIG // 0toUmPU8uWZYsy0v5/mFhsxRVuidcJRsrDlM1PZ5v6oY
// SIG // emIp76KbKTQGdxpiyT0ebR+C8AvHLLvPQ7Pl+ex9teOk
// SIG // qHQ1uE7FcSMSJnYLPFKMcVpGQxS8s7OwTWfIn0L/gHkh
// SIG // gJ4VMGboQhJeGsieIiHQQ+kr6bv0SMws1NgygEwmKkgk
// SIG // X1rqVu+m3pmdyjpvvYEndAYR7nYhv5uCwSdUtrFqPYmh
// SIG // dmG0bqETpr+qR/ASb/2KMmyy/t9RyIwjyWa9nR2HEmQC
// SIG // PS2vWY+45CHltbDKY7R4VAXUQS5QrJSwpXirs6CWdRrZ
// SIG // kocTdSIvMqgIbqBbjCW/oO+EyiHW6x5PyZruSeD3AWVv
// SIG // iQt9yGnI5m7qp5fOMSn/DsVbXNhNG6HY+i+ePy5VFmvJ
// SIG // E6P9MYIEkTCCBI0CAQEwgZAweTELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0IENvZGUgU2ln
// SIG // bmluZyBQQ0ECEzMAAADKbNUyEjXE4VUAAQAAAMowCQYF
// SIG // Kw4DAhoFAKCBqjAZBgkqhkiG9w0BCQMxDAYKKwYBBAGC
// SIG // NwIBBDAcBgorBgEEAYI3AgELMQ4wDAYKKwYBBAGCNwIB
// SIG // FTAjBgkqhkiG9w0BCQQxFgQUkhL3UTVffPNtIGcE18yy
// SIG // UMrw2kwwSgYKKwYBBAGCNwIBDDE8MDqgGoAYAGIAbwBv
// SIG // AHQAcwB0AHIAYQBwAC4AagBzoRyAGmh0dHA6Ly93d3cu
// SIG // bWljcm9zb2Z0LmNvbS8gMA0GCSqGSIb3DQEBAQUABIIB
// SIG // AAPBoe1/t1RsXyJy7aLiNBeNDVSqGLOz2Vsfy2vPzuJz
// SIG // SKMogoHjw2+ChlBFalY2DwRntbyjUTMgrTwBmcbMuCtx
// SIG // c6CCIMtU6yoBV7P5VSOSWhJX7klE/Q9GSHkKRhYe6DN8
// SIG // gE34QIN9XM4VTmacjdb21bCaxQnw/iraXNxZfhQO1yuv
// SIG // TwJG3ljTfiLf8ES5VIdUpgjKIRfI2hSachqU11v2DAg5
// SIG // flqU5AjmG9EaWK+dSBDD7q+9wnQqdXvXsL4sZAfx9hPX
// SIG // JXfAcKYSUc7EgpmPGyWQxbgj7f80LcH2E/0P3HA7ZFdO
// SIG // xLxZyu/PpnLet1m4lRR0TYBztd7t02NjrnmhggIoMIIC
// SIG // JAYJKoZIhvcNAQkGMYICFTCCAhECAQEwgY4wdzELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBAhMzAAAAWu0v9OQgmT86AAAA
// SIG // AABaMAkGBSsOAwIaBQCgXTAYBgkqhkiG9w0BCQMxCwYJ
// SIG // KoZIhvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0xNTA0MDMx
// SIG // OTM3MzBaMCMGCSqGSIb3DQEJBDEWBBQTdVOQqgD34bhk
// SIG // EONCTQZcns9FDTANBgkqhkiG9w0BAQUFAASCAQAyUZcj
// SIG // B2ltOdcitX4kbaoGnpxMMtWE5mLfrCFih/MhAw+rUqGG
// SIG // aCk+Kt/wMJgipo0ffVi7SNchd9AlDj+6j3HuSkjLUrnB
// SIG // fQMISmlj+wMUxOZAc8IpbmW7VbaxvvVBIC9XHupmFAC0
// SIG // BsALtt/2BN+oZGAwkKV+YOrHa7LldNIoUWJWRVkaXBM+
// SIG // dODQqJLhj+9r7NztgvP7HGGVbZYAxQL6HO3fombtLIgl
// SIG // lllrl/pey6MhbHT/bX0AbzHpFRT+D/uxcg5ld0MrVExC
// SIG // 5PY9ZwJfKhHP24TzGMQUnyqmA1UAAaQpR0SbMaPOC1sY
// SIG // Qz4yw+g8yA68HkjUOlRvP4iaI4Xx
// SIG // End signature block
