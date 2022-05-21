
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Common errors
var E_FAIL = -2147467259;

// Common setup function to instantiate the platform
function SetupPlatform() {
    defaultUser = "default@live.com";

    var wlt = Microsoft.WindowsLive.Platform.Test;
    platform = new wlt.ClientTestHarness("unittests", wlt.PluginsToStart.none, defaultUser);

    return platform;
}

// Utility function to create a generic message
function CreateGenericMessage(account, mailManager, subject, folder, readState) {
    var newMessage;

    if (folder)
    {
        newMessage = mailManager.createMessageInFolder(folder);
    }
    else
    {
        newMessage = mailManager.createMessage(account);
    }

    newMessage.subject = subject;
    newMessage.read = readState;
    var newBody = newMessage.createBody();
    newBody.type = Microsoft.WindowsLive.Platform.MailBodyType.html;
    newBody.body = "HelloWorldBody";
    newMessage.commit();

    return newMessage;
}
