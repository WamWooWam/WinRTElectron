/* Copyright (C) Microsoft Corporation. All rights reserved. */
try {
    securityVersion = Microsoft.Media.PlayReadyClient.PlayReadyStatics.playReadySecurityVersion;
    postMessage(true)
}
catch(ex) {
    postMessage(false)
}
