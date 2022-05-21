
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "Announcer", function () {
    "use strict";

    Mail.Announcer = function (host, /* optional */ role, /* optional */ priority) {
        Debug.assert(Jx.isHTMLElement(host));

        role = role || "status";
        priority = priority || "polite";

        host.classList.add("hidden");
        Mail.setAttribute(host, "role", role);
        Mail.setAttribute(host, "aria-live", priority);

        this._host = host;
    };

    Mail.Announcer.prototype.dispose = function () {
        this._host = null;
    };

    Mail.Announcer.prototype.speak = function (message) {
        Debug.assert(Jx.isString(message));
        var host = this._host;
        host.title = message;
        host.innerText = message;
    };

});
