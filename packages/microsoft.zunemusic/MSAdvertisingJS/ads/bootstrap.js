/* Copyright (C) Microsoft Corporation. All rights reserved. */
"use strict";
/*!
  Copyright (C) Microsoft. All rights reserved.
  This library is supported for use in Windows Store apps only.
*/
var localCompartment = null;
var localCompartmentOrigin = "ms-appx://" + document.location.host;
var adControlId = null;
var adParams = null;
var prmParams = null;
var pointerDown = false;
var appParams = null;
var MSG_TYPE_SCRIPT = "script";
var MSG_TYPE_ADPARAMS = "adParams";
var MSG_TYPE_PRMPARAMS = "prmParams";
var MSG_TYPE_APPPARAMS = "appParams";
var MSG_TYPE_INIT = "init";
var MSG_TYPE_SETID = "setId";
var MSG_TYPE_ERROR = "error";
var MSG_TYPE_SETMAXSIZE = "setMaxSize";
var MSG_TYPE_SETSCREENSIZE = "setScreenSize";
var MSG_TYPE_SETSIZE = "setSize";
var MSG_TYPE_SETSTATE = "setState";
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
var MSG_TYPE_ONPOINTERDOWN = "MSPointerDown";
var MSG_TYPE_ONPOINTERUP = "MSPointerUp";
function injectJavaScript(scriptTxt) {
    try {
        var scr = document.createElement("script");
        var headID = document.getElementsByTagName("head")[0];
        scr.innerHTML = scriptTxt;
        headID.appendChild(scr)
    }
    catch(err) {
        var message = (err === null || typeof(err) === "undefined") ? "unknown" : err.message;
        reportAdError("error injecting javascript: " + message)
    }
}
function receiveMessage(msg) {
    if (typeof(localCompartmentOrigin) === "undefined" || msg.origin !== localCompartmentOrigin)
        return;
    if (typeof(MSG_TYPE_SCRIPT) === "undefined" || typeof(JSON) === "undefined")
        return;
    if (localCompartment === null)
        localCompartment = msg.source;
    var msgType = null;
    var msgContent = null;
    var colonIx = msg.data.indexOf(":");
    if (colonIx < 0)
        msgType = msg.data;
    else {
        msgType = msg.data.substr(0, colonIx);
        msgContent = msg.data.substr(colonIx + 1)
    }
    if (msgType === MSG_TYPE_SCRIPT) {
        if (msgContent !== "")
            injectJavaScript(msgContent)
    }
    else if (msgType === MSG_TYPE_ADPARAMS) {
        if (msgContent !== "")
            try {
                adParams = JSON.parse(msgContent)
            }
            catch(err) {
                reportAdError("Ad params JSON parse error: " + err.message)
            }
    }
    else if (msgType === MSG_TYPE_PRMPARAMS) {
        if (msgContent !== "")
            try {
                prmParams = JSON.parse(msgContent)
            }
            catch(err) {
                reportAdError("Prm params JSON parse error: " + err.message)
            }
    }
    else if (msgType === MSG_TYPE_APPPARAMS) {
        if (msgContent !== "")
            try {
                appParams = JSON.parse(msgContent)
            }
            catch(err) {
                reportAdError("App params JSON parse error: " + err.message)
            }
    }
    else if (msgType === MSG_TYPE_SETID)
        adControlId = msgContent;
    else if (msgType === MSG_TYPE_INIT) {
        if (Ormma.getState() === "expanded") {
            document.addEventListener("keyup", function(e) {
                if (e.keyCode === 27)
                    Ormma.close()
            });
            var adBodyEl = document.getElementById("adBody");
            if (adBodyEl !== null)
                adBodyEl.focus()
        }
        try {
            window.renderer = new microsoft.advertising.renderer;
            window.renderer.init({
                creativeData: adParams, container: msMainAdDiv.id, prm: prmParams, appOptions: appParams
            })
        }
        catch(msg) {
            reportAdError("unable to initialize renderer: " + msg);
            return
        }
        try {
            window.renderer.renderAd();
            postToLocal("rendered")
        }
        catch(msg) {
            reportAdError("unable to render ad: " + msg)
        }
    }
    else if (msgType === MSG_TYPE_SETADINSTANCESTATE)
        Ormma._setAdInstanceState(msgContent);
    else if (typeof(Ormma) !== "undefined" && Ormma !== null)
        if (msgType === MSG_TYPE_SETSIZE) {
            var size = JSON.parse(msgContent);
            Ormma._setSize(size.width, size.height)
        }
        else if (msgType === MSG_TYPE_SETMAXSIZE) {
            var maxSize = JSON.parse(msgContent);
            Ormma._maxSize = maxSize
        }
        else if (msgType === MSG_TYPE_SETSCREENSIZE) {
            var screenSize = JSON.parse(msgContent);
            Ormma._setScreenSize(screenSize.width, screenSize.height)
        }
        else if (msgType === MSG_TYPE_SETSTATE)
            Ormma._setState(msgContent);
        else if (msgType === MSG_TYPE_SETLOCALE)
            Ormma._setLocale(msgContent);
        else if (msgType === MSG_TYPE_SETSDKINFO) {
            var sdkInfo = JSON.parse(msgContent);
            Ormma._setSdkVersion(sdkInfo.sdkVersion, sdkInfo.client, sdkInfo.runtimeType)
        }
        else if (msgType === MSG_TYPE_SETCAPABILITY) {
            var capabilityInfo = JSON.parse(msgContent);
            Ormma._setCapability(capabilityInfo.capability, capabilityInfo.value)
        }
        else if (msgType === MSG_TYPE_START)
            Ormma._init(msgContent);
        else if (msgType === MSG_TYPE_FIRESHAKE)
            Ormma._shake();
        else if (msgType === MSG_TYPE_ORMMA_RESPONSE)
            Ormma._sendResponse(JSON.parse(msgContent));
        else if (msgType === MSG_TYPE_UPDATETILTCOORDS) {
            var coords = JSON.parse(msgContent);
            Ormma._tiltChange(coords)
        }
        else if (msgType === MSG_TYPE_VIEWABLECHANGE) {
            var viewable = JSON.parse(msgContent);
            Ormma._viewableChange(viewable.viewable)
        }
        else if (msgType === MSG_TYPE_UPDATEORIENTATION) {
            var orienation = JSON.parse(msgContent);
            Ormma._setOrientation(orienation.orientation)
        }
        else if (msgType === MSG_TYPE_SETNETWORK)
            Ormma._setNetwork(msgContent);
        else if (msgType === MSG_TYPE_ERROR) {
            var errorInfo = JSON.parse(msgContent);
            Ormma._throwError(errorInfo.action, errorInfo.message)
        }
}
function reportAdError(msg) {
    postToLocal(MSG_TYPE_ERROR + ":" + msg)
}
function postToLocal(msg) {
    if (localCompartment !== null)
        localCompartment.postMessage(adControlId + ":" + msg, localCompartmentOrigin)
}
window.addEventListener("message", receiveMessage);
var bubblePointerEvents = (location.search.match(/bubblePointerEvents=1/ig) !== null);
if (bubblePointerEvents) {
    document.body.addEventListener("MSPointerDown", function(evt) {
        pointerDown = true;
        postToLocal(MSG_TYPE_ONPOINTERDOWN + ":" + JSON.stringify({
            clientX: evt.clientX, clientY: evt.clientY
        }))
    }, false);
    document.body.addEventListener("MSPointerUp", function(evt) {
        pointerDown = false;
        postToLocal(MSG_TYPE_ONPOINTERUP)
    }, false);
    document.body.addEventListener("MSPointerCancel", function(evt) {
        pointerDown = false;
        postToLocal(MSG_TYPE_ONPOINTERUP)
    }, false);
    document.body.addEventListener("MSPointerOut", function(evt) {
        if (pointerDown) {
            pointerDown = false;
            postToLocal(MSG_TYPE_ONPOINTERUP)
        }
    }, false);
    document.body.addEventListener("MSLostPointerCapture", function(evt) {
        pointerDown = false;
        postToLocal(MSG_TYPE_ONPOINTERUP)
    }, false)
}
