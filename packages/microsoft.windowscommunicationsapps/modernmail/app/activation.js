
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx */

Jx.delayDefine(Mail, "Activation", function () {
    "use strict";

    Mail.Activation = {
        serializeEvent: function (ev) {
            // Serializes a WinRT activation event so it can be used post-activation
            return {
                type: ev.type,
                kind: ev.kind,
                previousExecutionState: ev.previousExecutionState,
                "arguments": ev.arguments,
                uri: ev.uri
            };
        },

        parseArguments: function (platform, args) {
            // Safely attempts to parse the activation event arguments as JSON. The parsed JSON object
            // is required to resolve to an account id and view id.  There may also be a message id.
            try {
                if (Jx.isNonEmptyString(args)) {
                    var parsed = platform.mailManager.parseLaunchArguments(args);
                    if (parsed && Jx.isNonEmptyString(parsed.accountId) && Jx.isNonEmptyString(parsed.viewId)) {
                        return parsed;
                    }
                }
            } catch (e) {
                // Ignore errors if anything failed to parse
                Jx.log.exception("Invalid activation arguments", e);
            }
            return null;
        },

        stringifyArguments: function (view, message) {
            // Returns a JSON string that can be used to navigate to given view/mesage
            try {
                return view.getLaunchArguments(message ? message.objectId : "");
            } catch (e) {
                // Ignore errors if we failed to generate the arguments
                Jx.log.exception("Invalid hibernation arguments", e);
            }
            return "";
        },
    };

});
