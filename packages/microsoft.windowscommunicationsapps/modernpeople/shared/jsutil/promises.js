
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People, "Promises", function () {

    var P = window.People,
        F = Windows.Foundation,
        Promises = P.Promises = {};

    Promises.errorIfTimeout = function (promise, msec) {
        ///<summary>Fails and cancels a promise if it doesn't complete before the timeout</summary>
        var timeoutPromise = WinJS.Promise.timeout(msec).then(
            function () { return WinJS.Promise.wrapError("Timeout happened"); }
        );

        // If we timeout, cancel the original promise and return an error instead
        return WinJS.Promise.any([promise, timeoutPromise]).then(
            function (result) { return result.value; },
            function (err) { promise.cancel(); return err.value; }
        );
    };

    Promises.synchronousPromise = function (fn, context, args) {
        ///<summary>Converts a function into a promise so that it can easily be composed with other promises</summary>
        return new WinJS.Promise(function init(c, e) {
            var result = fn.apply(context, args);
            if (result instanceof Error) {
                e(result);
            } else {
                c(result);
            }
        });
    };

    Promises.waitForPropertyChange = function (obj, property) {
        ///<summary>Creates a promise that hooks a contact platform object and waits for a specific property
        ///to change. The promise is fulfilled with the value of said property.</summary>
        var listener;
        // Save the initial value of the property so that we can check that the property actually changed.
        var initialValue = obj[property];
        return new WinJS.Promise(
            function init(c) {
                listener = function (ev) {
                    if (Array.prototype.indexOf.call(ev, property) !== -1 && initialValue !== obj[property]) {
                        obj.removeEventListener("changed", listener);
                        c(obj[property]);
                    }
                };
                obj.addEventListener("changed", listener);
            },
            function cancel() {
                obj.removeEventListener("changed", listener);
            }
        );
    };

    Promises.waitForSettingsResult = function (obj, settingsChangedTime) {
        ///<summary>Creates a promise that hooks a contact platform object and waits for settingsSyncTime to match settingsChangedTime.
        ///The promise is fulfilled with the value of said property.</summary>
        var listener;
        // Save the initial value of the property so that we can check that the property actually changed.
        return new WinJS.Promise(
            function init(c) {
                listener = function (ev) {
                    if (Array.prototype.indexOf.call(ev, "settingsSyncTime") !== -1 && obj.settingsSyncTime >= settingsChangedTime) {
                        obj.removeEventListener("changed", listener);
                        c(obj.settingsResult);
                    }
                };
                obj.addEventListener("changed", listener);
            },
            function cancel() {
                obj.removeEventListener("changed", listener);
            }
        );
    };

    Promises.commitAndWait = function (timeout, obj, property, etw) {
        ///<summary>Commits a change on a platform object, waiting for the property change to be reflected on
        ///the object, or timesout.</summary>
        var waitPromise = Promises.waitForPropertyChange(obj, property);
        return Promises.commitAndWaitForPromise(timeout, obj, waitPromise, etw);
    };

    Promises.commitAndWaitForPromise = function (timeout, obj, waitPromise, etw) {
        ///<summary>Commits a change on a platform object, waiting for the property change to be reflected on
        ///the object, or timesout.</summary>
        try {
            obj.commit();
        } catch (e) {
            Jx.log.exception("Promises.commitAndWait failed on commit()", e);
            waitPromise.cancel();
            return WinJS.Promise.wrapError(e);
        }
    
        if (etw) {
            NoShip.People.etw(etw);
        }
    
        Jx.log.info("Commited object type=" + obj.objectType + " id=" + obj.objectId);

        return Promises.errorIfTimeout(waitPromise, timeout);
    };
});
