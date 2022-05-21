
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Share*/

/// <summary>
/// Defines constants for Share object
/// </summary>
Share.MailConstants = {
    stringsPrefix: "/sharetargetstrings/",
    StartupError: {
        none: 0,
        mailNotSetup: 1,
        needsInternet: 2,
        genericError: 3
    },
    // Hard-coded timeout to load and render data.  
    // We've considered making this configurable but that would require re-architecting the data load flow (the configuration isn't loaded when this number is needed)
    waitForRender: 360000, 
    // BICI share type
    ShareType: {
        file : 0,
        html : 1,
        url : 2,
        text : 3
    },
    hresultResourceNotFound: -2146697211, // INET_E_RESOURCE_NOT_FOUND 
    MailError: {
        none: 0,
        outboxError: 1,
        preOutboxError: 2, 
        internetError: 3,
        authError: 4
    },
    maximumQuicklinkDataCount: 50, // How long we let the quicklink data list get before cleaning it
    daysToKeepQuicklinkData: 28, // How old quicklink data can get before it is eligible for cleaning
    messageSentEvent: "messagesent" // Event that is fired when the message is successfully sent
};
