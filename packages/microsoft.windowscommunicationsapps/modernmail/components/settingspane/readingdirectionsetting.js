
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Debug,Jx */
/*jshint browser:true*/

Jx.delayDefine(Mail, "ReadingDirectionSetting", function () {
    "use strict";

    var Utilities = Mail.Utilities;

    Mail.ReadingDirectionSetting = function (host) {
        Debug.assert(Jx.isHTMLElement(host));

        this._host = host;
        this._disposer = new Mail.Disposer();

        Debug.only(Object.seal(this));
    };

    var prototype = Mail.ReadingDirectionSetting.prototype;

    prototype.dispose = function () {
        this._disposer.dispose();
        this._disposer = null;
        this._host = null;
    };

    prototype.getHTML = function () {
        if (!Utilities.haveRtlLanguage()) {
            return '';
        }
        return '<div id="mailReadingDirectionWrapper">' +
                '<span id="mailReadingDirectionText">' + escapedResource("mailReadingDirectionText") + '</span>' +
                '<select id="mailReadingDirectionSelect" aria-label="' + escapedResource("mailReadingDirectionText")+'">' +
                    '<option value="' + Mail.AppSettings.Direction.ltr + '">' + escapedResource("mailReadingDirectionLeft") + '</option>' +
                    '<option value="' + Mail.AppSettings.Direction.auto + '">' + escapedResource("mailReadingDirectionAutomatic") + '</option>' +
                    '<option value="' + Mail.AppSettings.Direction.rtl + '">' + escapedResource("mailReadingDirectionRight") + '</option>' +
                '</select>' +
                '</div>';
    };

    prototype.populateControls = function () {
        if (!Utilities.haveRtlLanguage()) {
            return;
        }

        var dirSelect = this._host.querySelector("#mailReadingDirectionSelect"),
            appSettings = Mail.Globals.appSettings;

        dirSelect.value = appSettings.readingDirection;
        this._disposer.add(new Mail.EventHook(dirSelect, "change", this._onChange, this));
    };

    prototype.update = Jx.fnEmpty; // Feature parity

    prototype._onChange = function () {
        var dirSelect = this._host.querySelector("#mailReadingDirectionSelect"),
            appSettings = Mail.Globals.appSettings;

        appSettings.readingDirection = dirSelect.value;
    };

    function escapedResource(id) { return Jx.escapeHtml(Jx.res.getString(id)); }


});