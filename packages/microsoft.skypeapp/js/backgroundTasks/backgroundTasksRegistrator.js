

(function () {
    "use strict";

    var using = {
        Background: Windows.ApplicationModel.Background,
        backgroundTasks: { } 
    };

    using.backgroundTasks.keepAlive = {
        name: "keepAliveTimerTriggerBackgroundTask",
        entry: "js\\backgroundTasks\\keepAliveBackgroundTask.js",
        trigger: new using.Background.TimeTrigger(15, false),
        condition: new using.Background.SystemCondition(using.Background.SystemConditionType.internetAvailable)
    };
    using.backgroundTasks.pushNotification = {
        name: "pushNotificationBackgroundTask",
        entry: "js\\backgroundTasks\\pushNotificationBackgroundTask.js",
        trigger: createPushNotificationTriggerSafe()
    };
    using.backgroundTasks.refreshChannelUri = {
        name: "refreshChannelUriBackgroundTask",
        entry: "js\\backgroundTasks\\refreshChannelUriBackgroundTask.js",
        trigger: new using.Background.MaintenanceTrigger(1440, false),
        condition: new using.Background.SystemCondition(using.Background.SystemConditionType.internetAvailable)
    };
    using.backgroundTasks.userAccountStateChanged = {
        name: "userAccountStateChangedBackgroundTask",
        entry: "js\\backgroundTasks\\userAccountStateChanged.js",
        trigger: new using.Background.SystemTrigger(using.Background.SystemTriggerType.onlineIdConnectedStateChange, false)
    };

    function createPushNotificationTriggerSafe() {
        var trigger;
        try {
            trigger = new using.Background.PushNotificationTrigger();
        } catch (ex) {
            log("Unable to create PushNotificationTrigger ({0} ({1}): {2})".format(ex.message, ex.number, ex.description));
            trigger = null;
        }
        return trigger;
    }

    function registerBackgroundTask(task) {
        try {
            var isValidTaskDefinition = task.name && task.entry && task.trigger;
            if (!isValidTaskDefinition) {
                throw new Error("Invalid task definition: {0}", JSON.stringify(task));
            }

            var builder = new using.Background.BackgroundTaskBuilder();
            builder.name = task.name;
            builder.taskEntryPoint = task.entry;
            builder.setTrigger(task.trigger);

            if (task.condition) {
                builder.addCondition(task.condition);
            }

            builder.register();
            log("registerBackgroundTask: {0} at {1} succeeded".format(task.name, task.entry));
        } catch (e) {
            log("registerBackgroundTask: {0} at {1} failed - {2}".format(task.name, task.entry, e.message));
        }
    }

    function registerTasks() {
        for (var key in using.backgroundTasks) {
            var task = using.backgroundTasks[key];
            registerBackgroundTask(task);
        }
    }

    
    function knownTask(name) {
        for (var key in using.backgroundTasks) {
            var task = using.backgroundTasks[key];
            if (task.name === name) {
                return true;
            }
        }

        return false;
    }

    function unregisterTasks() {
        var iter = using.Background.BackgroundTaskRegistration.allTasks.first();
        var hascur = iter.hasCurrent;
        while (hascur) {
            var cur = iter.current.value;
            
            
            
            if (knownTask(cur.name)) {
                log("unregisterBackgroundTask: name {0}, id {1}".format(cur.name, cur.taskId));
                cur.unregister(true);
            } else {
                log("unregisterTasks: skipping unrecognized task name {0}, id {1}".format(cur.name, cur.taskId));
            }
            hascur = iter.moveNext();
        }
    }

    WinJS.Namespace.define("Skype.BackgroundTasks.Registrator", {
        
        
        
        
        registerTasks: registerTasks,
        unregisterTasks: unregisterTasks,
        external: using
    });
})();