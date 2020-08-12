

(function () {
    "use strict";

    importScripts("//Microsoft.WinJS.2.0/js/base.js");

    var using = {
        Windows_ApplicationModel_Background_BackgroundWorkCost: Windows.ApplicationModel.Background.BackgroundWorkCost,
        Windows_UI_WebUI_WebUIBackgroundTaskInstance: Windows.UI.WebUI.WebUIBackgroundTaskInstance,
        Close: function () {
            close();
        }
    };

    var backgroundTaskBase = WinJS.Class.define(function constructor(taskName, webUIBackgroundTaskInstance) {
        this._backgroundTaskInstance = webUIBackgroundTaskInstance;
        this._backgroundTaskInstance.addEventListener("canceled", this._onCanceled.bind(this));
        this._taskName = taskName;
        this.log = this.log.bind(this);
        this._canceled = false;
    }, {
        _canceled: false,
        _taskName: "",
        _backgroundTaskInstance: null,

        _onCanceled: function (cancelSender, reason) {
            this._canceled = true;
            var canceledMessage = "Cancelled with reason " + reason;
            this.log(canceledMessage);
            this.writeProfilerMark(canceledMessage);
            
            
            WinJS.Promise.timeout(100).then(function () {
                this._closeInstance();
            }.bind(this));
        },

        writeProfilerMark: function (message) {
            msWriteProfilerMark(this._taskName + ":" + message);
        },

        log: function (message) {
            
            ///<disable>JS2043.RemoveDebugCode</disable>
            console.log(this._taskName + ": " + message);
            ///<enable>JS2043.RemoveDebugCode</enable>

            
            LibWrap.WrSkyLib.log(this._taskName, message);
        },

        execute: function () {
            this.writeProfilerMark("Execute");
            this.log("Enter");
            if (this._canceled) {
                this._closeInstance();
                return;
            }

            if (!this._executeAsync) {
                this.log("No _executeAsync defined, exiting");
                this._closeInstance();
                return;
            }

            this._executeAsync = this._executeAsync.bind(this);
            try {
                this._executeAsync().done(function () {
                    this._closeInstance();
                }.bind(this), function onError(error) {
                    this._reportError(error);
                    this._closeInstance();
                }.bind(this));
            } catch (exception) {
                this._reportError(exception);
                this._closeInstance();
            }
        },

        _reportError: function (error) {
            var errorMsg = "Error: " + error;
            this.writeProfilerMark(errorMsg);
            this.log(errorMsg);
        },

        _closeInstance: function () {
            this._backgroundTaskInstance.removeEventListener("canceled", this._onCanceled.bind(this));
            this.log("Leave");
            this.writeProfilerMark("Closed");
            using.Close();
        }
    }, {
        _canExecute: function() {
            var currentBackgroundWorkCost = using.Windows_ApplicationModel_Background_BackgroundWorkCost.currentBackgroundWorkCost;

            switch (currentBackgroundWorkCost) {
                case Windows.ApplicationModel.Background.BackgroundWorkCostValue.low:
                case Windows.ApplicationModel.Background.BackgroundWorkCostValue.medium:
                    return true;
                case Windows.ApplicationModel.Background.BackgroundWorkCostValue.high:
                    
                    msWriteProfilerMark("High work cost, skipping task execution");
                    return false;
                default:
                    
                    msWriteProfilerMark("Unexpected work cost, skipping task execution");
                    return false;
            }
        },

        
        run: function (BackgroundTaskType, executionPolicy) {
            
            
            
            if (typeof backgroundTaskExecutionRestricted === "undefined" || !backgroundTaskExecutionRestricted) {
                executionPolicy = executionPolicy || Skype.BackgroundTasks.BackgroundTaskBase.ExecutionPolicy.useWorkCost;
                msWriteProfilerMark("executionPolicy: " + executionPolicy);

                if (executionPolicy === Skype.BackgroundTasks.BackgroundTaskBase.ExecutionPolicy.executeAlways || Skype.BackgroundTasks.BackgroundTaskBase._canExecute()) {
                    
                    var taskInstance = new BackgroundTaskType(using.Windows_UI_WebUI_WebUIBackgroundTaskInstance.current);
                    lib = LibWrap.WrSkyLib.getInstance();
                    log = taskInstance.log;
                    taskInstance.execute();
                } else {
                    using.Close();
                }
            }
        },

        dependencies: using,
        ExecutionPolicy: {
            executeAlways: "always",
            useWorkCost: "workCost"
        }
    });

    WinJS.Namespace.define("Skype.BackgroundTasks", {
        BackgroundTaskBase: backgroundTaskBase
    });
})();

///<disable>JS3085.VariableDeclaredMultipleTimes</disable>

var lib;
var log;
///<enable>JS3085.VariableDeclaredMultipleTimes</enable>
