
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $, */

// Actions available from Default Settings
Jx.delayDefine(self, "DefaultSettingsPom", function () {
    // Constructor
    DefaultSettingsPom = function () { };

    // Get properties
    DefaultSettingsPom.prototype = {
        get fontControl() { return $("#mailSettingsFontNameControl > select")[0]; },
        get sizeControl() { return $("#mailSettingsFontSizeControl > select")[0]; },
        get colorControl() { return $("#mailSettingsFontColorControl").find(".fontColorButton[aria-checked='true']")[0]; }
    };
});
