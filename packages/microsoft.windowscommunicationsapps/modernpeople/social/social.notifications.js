﻿
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People, "loadSocialNotifications", function () {

    People.loadSocialNotifications = Jx.fnEmpty;

    People.loadSocialImports();
    People.loadSocialCore();
    People.loadSocialPlatform();
    People.loadSocialProviders();
    People.loadSocialModel();

});