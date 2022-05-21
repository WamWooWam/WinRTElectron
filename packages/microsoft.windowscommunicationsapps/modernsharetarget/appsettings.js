
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\Jx\Core\Jx.dep.js" />

Share.AppSettings = function () {
    this._settingsContainer = Jx.appData.roamingSettings().container("Mail");
    
    var keys = this.settingsKeys;
    var composeSettings = [
    {
        propertyName: "composeFontFamily",
        containerKey: keys.composeFontFamily,
    },
    {
        propertyName: "composeFontSize",
        containerKey: keys.composeFontSize,
    },
    {
        propertyName: "composeFontColor",
        containerKey: keys.composeFontColor,
    }
    ];

    composeSettings.forEach(function (composeSetting) {
        var currentSetting = this._settingsContainer.get(composeSetting.containerKey);

        Object.defineProperty(this, composeSetting.propertyName, {
            get: function () {
                return currentSetting;
            }
        });
    },this);
};

Share.AppSettings.prototype.settingsKeys = {
    composeFontFamily: "compose-font-family",
    composeFontSize: "compose-font-size",
    composeFontColor: "compose-font-color"
};

Share.AppSettings.prototype.dispose = function () {
    this._settingsContainer.dispose();
};