
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $, WinJS, Mail, DefaultSettingsPom */

// Default Font Settings LFM
Jx.delayDefine(self, "DefaultFontSettingsLfm", function () {
    // Constructor
    DefaultFontSettingsLfm = function () {
        this.objectModel = new DefaultSettingsPom();
    };
    var proto = DefaultFontSettingsLfm.prototype;
   
    proto._oldJxSettings;

    // Colors that are use in the settings,
    proto.black = "#000000";
    proto.green = "#4BA524";
    proto.blue = "#006FC9";
    proto.purple = "#7232AD";
    proto.pink = "#BD1398";
    proto.grey = "#757B80";
    proto.red = "#D03A3A";
    proto.orange = "#D05C12";
    proto.yellow = "#E2C501";
    proto.darkGreen = "#375623";
    proto.darkBlue = "#1F3864";
    proto.mediumDarkBlue = "#1E4E79";
    proto.darkBrown = "#833C0B";
    proto.darkGrey = "#525252";

    var ColorMap = {
        "#000000": ".fontColorButton1",
        "#375623": ".fontColorButton2",
        "#1F3864": ".fontColorButton3",
        "#1E4E79": ".fontColorButton4",
        "#833C0B": ".fontColorButton5",
        "#525252": ".fontColorButton6",
        "#4BA524": ".fontColorButton7",
        "#006FC9": ".fontColorButton8",
        "#7232AD": ".fontColorButton9",
        "#BD1398": ".fontColorButton10",
        "#757B80": ".fontColorButton11",
        "#D03A3A": ".fontColorButton12",
        "#D05C12": ".fontColorButton13",
        "#E2C501": ".fontColorButton14"

    };

    // Create the Default font options settings and add it to document
    proto.showDefaultFontSettings = function () {
        return new WinJS.Promise(function (complete /*, error, progress*/) {
            // Save old Jx.SettingsFlyout to restore later
            this._oldJxSettings = Jx.SettingsFlyout;

            // create the Div that will contain the Settings
            var divToUse = document.createElement("div");
            divToUse.id = "TestDefaultSettings";

            // override SettingsFlyout and the functions we need
            Jx.SettingsFlyout = Jx.fnEmpty;
            var proto = Jx.SettingsFlyout.prototype;
            proto.show = function () { };
            proto.getContentElement = function () { return divToUse; };

            // Create the Settings pane and add it to the document so it is accessible
            var settingsPane = new Mail.CompSettingsPane();
            document.body.appendChild(divToUse);

            // "show" settings pane
            settingsPane._onOptions();
            complete();
        });
    };

    // Remove the Default Font Settings from the Document
    proto.hideDefaultFontSettings = function () {
        // Try and find the test settings pane we would have created in ShowDefaultFontSettings
        var settings = $("#TestDefaultSettings")[0];

        // Remove the Settings pane if found and revert Jx.SettingsFlyout back to what it was.
        if (settings) {
            Jx.SettingsFlyout = _oldJxSettings;
            document.body.removeChild(settings);
        }
    };

    // Sets values and returns a promise for when they are done
    proto.setValuesAsync = function (color, size, font) {
        // Font color uses aria-checked mutation observer 
        // to fire the event for change, so we can hook to the same
        // event and then call complete on the promise
        var that = this;
        return new WinJS.Promise(function (complete /*, error, progress*/) {
            var observer,
                onMutation = function () {
                    observer.disconnect();
                    complete();
                };

            observer = new MutationObserver(onMutation);

            observer.observe($("#TestDefaultSettings .fontColorControl")[0], {
                attributes: true,
                subtree: true,
                attributeFilter: ["aria-checked"]
            });

            that.fontColor(color);
            that.fontSize(size);
            that.fontStyle(font);
        });
    };

    // Gets or set the default Font Color 
    proto.fontColor = function (fontColor) {
        if (fontColor !== undefined) {
            // Get the control for the color we want to set it to and trigger an Click event so the color is saved.
            var colorClass = this._getColorClass(fontColor);
            $("#TestDefaultSettings " + colorClass).trigger("click");
        } else {
            return this.objectModel.colorControl.value;
        }
    };

    // Gets or sets the default Font size
    proto.fontSize = function (fontSize) {
        if (fontSize !== undefined) {
            this.objectModel.sizeControl.value = fontSize;
            $(this.objectModel.sizeControl).trigger("change");
        } else {
            return this.objectModel.sizeControl.value;
        }
    };

    // Gets or sets the default font Style
    proto.fontStyle = function (fontStyle) {
        if (fontStyle !== undefined) {
            this.objectModel.fontControl.value = fontStyle;
            $(this.objectModel.fontControl).trigger("change");
        } else {
            return this.objectModel.fontControl.value;
        }
    };

    // Get the Button that corresponds to the color
    proto._getColorClass = function (hex) {
        return ColorMap[hex];
    };
});
