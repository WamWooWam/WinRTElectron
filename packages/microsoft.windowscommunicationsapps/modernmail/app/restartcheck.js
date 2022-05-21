
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail, Debug, Jx */
/*jshint browser:true*/

Jx.delayDefine(Mail, "RestartCheck", function () {

    Mail.RestartCheck = function () {
        this._restartChecks = [];
        this.addRestartCheck("Days since app start check", this._canRestart, this);
    };

    var proto = Mail.RestartCheck.prototype;
    
    // Test Note: Test overides this method as part of a manual test case.
    Mail.daysSinceAppStart = function () {
        return (Date.now() - window.performance.timing.navigationStart) / Mail.Utilities.msInOneDay; // turns milliseconds into days
    };
        
    proto.addRestartCheck = function (description, checkFunction, context) {
        // Restart check methods should return true to allow restart, and false to prevent it
        // Restart happen on visablity handler if all check methods return true.
        Debug.assert(Jx.isFunction(checkFunction));
        Debug.assert(Jx.isObject(context) || Jx.isNullOrUndefined(context));
        Debug.assert(Jx.isNonEmptyString(description));
        this._restartChecks.push({ desc: description, check: checkFunction, context: context });
    };
        
    proto._canRestart = function () {
        return (Mail.daysSinceAppStart() > /*Min days till restart*/3);
    };

    proto.onAppVisible = function () {
        if( this._restartChecks.every(function(restartCheck) { return restartCheck.check.call(restartCheck.context); })) {
            Jx.root.restart();
        }
    };

});

