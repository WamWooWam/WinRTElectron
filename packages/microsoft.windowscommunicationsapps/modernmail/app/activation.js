Jx.delayDefine(Mail, "Activation", function() {
    "use strict";
    Mail.Activation = {
        serializeEvent: function(n) {
            return {
                type: n.type,
                kind: n.kind,
                previousExecutionState: n.previousExecutionState,
                arguments: n.arguments,
                uri: n.uri
            }
        },
        parseArguments: function(n, t) {
            try {
                if (Jx.isNonEmptyString(t)) {
                    var i = n.mailManager.parseLaunchArguments(t);
                    if (i && Jx.isNonEmptyString(i.accountId) && Jx.isNonEmptyString(i.viewId)) return i
                }
            } catch (r) {
                Jx.log.exception("Invalid activation arguments", r)
            }
            return null
        },
        stringifyArguments: function(n, t) {
            try {
                return n.getLaunchArguments(t ? t.objectId : "")
            } catch (i) {
                Jx.log.exception("Invalid hibernation arguments", i)
            }
            return ""
        }
    }
})