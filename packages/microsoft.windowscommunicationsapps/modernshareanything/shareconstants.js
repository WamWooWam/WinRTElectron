
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareAnything.ref.js" />

window.Share = {}; // Share namespace definition

/// <summary>
/// Defines constants for Share object
/// </summary>
Share.Constants = {
    stringsPrefix: "/shareanythingstrings/", // Strings prefix for ShareAnything code (some strings are in use by ShareTarget code, should possibly be moved later)
    Environments: {
        /// <disable>IdentifierIsMiscased</disable> These Strings are set by EPDashboard, suppress JSCop's casing error.
        INT: "INT",
        Production: "Production"
        /// <enable>IdentifierIsMiscased</enable>
    },
    unknownType: "unknown",
    previewImageHeight: 145,
    previewImageWidth: 210,
    descriptionMax: 512,
    titleMax: 512,
    subjectMax: 250,
    minImageSize: 64,
    maxImageSize: 2048,
    maxImageRatio: 4, // we filter out images whose dimensions have a ratio greater than this
    DataError: {
        none: "none",
        internalError: "internalError",
        invalidFormat: "invalidFormat"
    },
    // HRESULTs that may be returned in errors created by ShareAnything components
    ErrorCode: {
        unknownError: -2147467259, // E_FAIL, 0x80004005
        timeout: -2147023436, // ERROR_TIMEOUT, 0x800705B4
        invalidArgument: -2147024809, // E_INVALIDARG, 0x80070057
        accessDenied: -2147024891 // E_ACCESSDENIED, 0x80070005
    }
};

Share.LogEvent = {
    start: "_begin",
    stop: "_end",
    toProfilerMarkString: {
        "_begin": ",StartTA,ShareAnything",
        "_end": ",StopTA,ShareAnything"
    }
};

Share.mark = function (eventName, eventType) {
    /// <summary>Log function for the Share Anything profiler marks.</summary>
    /// <param name="eventName" type="String">ETW event name</param>
    /// <param name="eventType" type="Share.LogEvent" optional="true">enum for start/stop/info/etc.</param>
    window.msWriteProfilerMark("ShareAnything." + eventName + (Share.LogEvent.toProfilerMarkString[eventType] || ""));
};