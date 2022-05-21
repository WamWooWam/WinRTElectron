
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Debug,FontSelector,Mail*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "FontSettings", function () {
    "use strict";

    Mail.FontSettings = function (host) {
        Debug.assert(Jx.isHTMLElement(host));

        this._host = host;
        this._composeSettings = null;
        this._disposer = new Mail.Disposer();

        Debug.only(Object.seal(this));
    };

    var proto = Mail.FontSettings.prototype;

    proto.dispose = function () {
        this._disposer.dispose();
        this._disposer = null;
        this._composeSettings = null;
        this._host = null;
    };

    proto.getHTML = function () {
        return '<div id="mailSettingsPaneFontSelectorDiv">' +
                   '<div id="mailSettingsPaneFontSelectorHeader" class="typeSizeNormal">' +
                        Jx.res.getString("mailSettingsPaneDefaultFontLabel") +
                   '</div>' +
                   '<div id="mailSettingsPanePreviewTextDiv">' +
                       '<span class="previewText authoringFontFamilyClass" id="mailSettingsPanePreviewText">'+
                           Jx.res.getString("mailSettingsPanePreviewText") +
                       '</span>' +
                   '</div>' +
                   '<div id="mailSettingsFontNameControl"></div>' +
                   '<div id="mailSettingsFontSizeControl"></div>' +
                   '<div id="mailSettingsFontColorControl"></div>' +
                   '<div id="mailSettingsFocusFix" tabindex="-1"></div>' +
               '</div>';
    };

    proto.populateControls = function () {
        _markStart("populateControls");

        this._initComposeSettings();

        var host = this._host,
            focusFix = host.querySelector("#mailSettingsFocusFix"),
            lastControl = null;

        // In order to override a button inside the color control getting focused using shift+tab
        // a div is added that will take the focus and correctly focus the color control div
        focusFix.addEventListener("focus", function () {
            Debug.assert(Boolean(lastControl), "No target found for last control in settings options flyout");
            lastControl.focus();
        });

        var appSettings = Mail.Globals.appSettings,
            fontSelectorDiv = host.querySelector("#mailSettingsPaneFontSelectorDiv"),
            previewText = host.querySelector("#mailSettingsPanePreviewText");

        this._composeSettings.forEach(function (composeSetting) {
            var config = composeSetting.config || {};

            // Set the host for the config so the querySelector on the Components works
            config.host = host;

            var control = composeSetting.control = new composeSetting.ctor(config),
                div = fontSelectorDiv.querySelector(composeSetting.selector);

            control.initUI(div);

            lastControl = control;

            if (appSettings[composeSetting.appSettingsProperty]) {
                // Try to set the control to be the app settings value
                // It will be checked after the flyout is shown, and handled accordingly
                // if the value isn't valid
                control.value = appSettings[composeSetting.appSettingsProperty];
            }

            composeSetting.eventHandler = function (evt) {
                if (appSettings[this.appSettingsProperty] !== evt.value) {
                    appSettings[this.appSettingsProperty] = evt.value;
                }
                previewText.style[this.styleSetting] = evt.value;
            };

            this._disposer.add(new Mail.EventHook(control, "change", composeSetting.eventHandler, composeSetting));
        }, this);

        _markStop("populateControls");
    };

    proto.update = function () {
        _markStart("update");

        this._updateFontSettings();
        this._stylePreviewText();

        _markStop("update");
    };

    proto._stylePreviewText = function () {
        // After the flyout is shown, the computed styles of the preview text after css rules have to be applied
        var previewText = this._host.querySelector("#mailSettingsPanePreviewText");

        // Font family is first
        var setting = this._composeSettings[0];
        Debug.assert(setting.styleSetting === "fontFamily");
        if (!Boolean(setting.control.value)) {
            setting.control.value = previewText.currentStyle.fontFamily.replace(/.Color.Emoji.,\s*/i, "").replace(/,.*/, "").replace(/"/g, "");
        }
        previewText.style[setting.styleSetting] = setting.control.value;

        setting = this._composeSettings[1];
        Debug.assert(setting.styleSetting === "fontSize");
        if (!Boolean(setting.control.value)) {
            setting.control.value = previewText.currentStyle.fontSize;
        }
        previewText.style[setting.styleSetting] = setting.control.value;

        setting = this._composeSettings[2];
        Debug.assert(setting.styleSetting === "color");
        if (!Boolean(setting.control.value)) {
            setting.control.value = previewText.currentStyle.color;
        }
        previewText.style[setting.styleSetting] = setting.control.value;
    };

    proto._updateFontSettings = function () {
        Debug.assert(Jx.isArray(this._composeSettings));
        var appSettings = Mail.Globals.appSettings;
        this._composeSettings.forEach(function (composeSetting) {
            Debug.assert(composeSetting.control);
            composeSetting.control.value = appSettings[composeSetting.appSettingsProperty];
        });
    };

    proto._initComposeSettings = function () {
        Debug.assert(this._composeSettings === null);
        this._composeSettings = [
            {
                className: "fontNameControl",
                selector: "#mailSettingsFontNameControl",
                appSettingsProperty: "composeFontFamily",
                ctor: FontSelector.NameControl,
                styleSetting: "fontFamily",
                config: {
                    styleOptions: true
                }
            },
            {
                className: "fontSizeControl",
                selector: "#mailSettingsFontSizeControl",
                appSettingsProperty: "composeFontSize",
                ctor: FontSelector.SizeControl,
                styleSetting: "fontSize"
            },
            {
                className: "fontColorControl",
                selector: "#mailSettingsFontColorControl",
                appSettingsProperty: "composeFontColor",
                styleSetting: "color",
                ctor: FontSelector.ColorControl,
                config: {
                    itemsTabbable: false,
                    gridLayout: { rows: "56px 56px 56px", columns: "56px 56px 56px 56px 56px" },
                    colors: [
                            { value: "#000000", name: Jx.res.getString("black") },
                            { value: '#375623', name: Jx.res.getString("darkgreen") },
                            { value: '#1F3864', name: Jx.res.getString("darkblue") },
                            { value: '#1E4E79', name: Jx.res.getString("mediumdarkblue") },
                            { value: '#833C0B', name: Jx.res.getString("darkbrown") },
                            { value: '#525252', name: Jx.res.getString("darkgrey") },
                            { value: "#4BA524", name: Jx.res.getString("green") },
                            { value: "#006FC9", name: Jx.res.getString("blue") },
                            { value: "#7232AD", name: Jx.res.getString("purple") },
                            { value: "#BD1398", name: Jx.res.getString("pink") },
                            { value: "#757B80", name: Jx.res.getString("grey") },
                            { value: "#D03A3A", name: Jx.res.getString("red") },
                            { value: "#D05C12", name: Jx.res.getString("orange") },
                            { value: "#E2C501", name: Jx.res.getString("yellow") }
                    ]
                }
            }
        ];
    };

    function _markStart(s) { Jx.mark("FontSettings." + s + ",StartTA,FontSettings"); }
    function _markStop(s) { Jx.mark("FontSettings." + s + ",StopTA,FontSettings"); }

});