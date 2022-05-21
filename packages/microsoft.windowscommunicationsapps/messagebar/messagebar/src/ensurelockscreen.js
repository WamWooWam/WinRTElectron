
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Windows,Jx,Chat,setImmediate*/

Jx.delayDefine(Chat.Shared, "ensureLockScreen", function () {

    var background = Windows.ApplicationModel.Background;

    Chat.Shared.ensureLockScreen = function () {
        var isOnLockScreen = false;

        try {
            var lockScreenStatus = background.BackgroundExecutionManager.getAccessStatus();

            if (lockScreenStatus === /*@static_cast(Number)*/background.BackgroundAccessStatus.allowedWithAlwaysOnRealTimeConnectivity ||
                lockScreenStatus === /*@static_cast(Number)*/background.BackgroundAccessStatus.allowedMayUseActiveRealTimeConnectivity) {
                // We are on the lock screen
                isOnLockScreen = true;
            }
        } catch (err) {
            // Call will fail in branches that don't have these 3 apps mapped in
            Jx.log.info("BackgroundExecutionManager.getAccessStatus() failed");
        }

        if (!isOnLockScreen) {
            setImmediate(function () {
                try {
                    background.BackgroundExecutionManager.requestAccessAsync();
                } catch (err) {
                    // Call will fail when calling app is in Snap or not visible
                    Jx.log.info("BackgroundExecutionManager.requestAccessAsync() failed");
                }
            });
        }
    };

});
