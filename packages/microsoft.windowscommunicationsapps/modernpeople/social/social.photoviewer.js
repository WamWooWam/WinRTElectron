
//! Copyright (c) Microsoft Corporation. All rights reserved.
// DISABLE "use strict";

Jx.delayDefine(window, "wLive", function () {

(function() {

var w = window;

// initialize stubs for wLive/Core/CookieToss, etc.
w.wLive = {
    Controls: { },
    Core: { 
        CookieToss: {
            complete: true
        }
    }
};

w.wLiveControls = w.wLive.Controls;
w.wLiveCore = w.wLive.Core;

// add a few functions to prototypes (yikes!)
String.prototype.encodeHtml = function () {
    // just passing "this" will cause "typeof(o)" to return "object" rather than "string".
    // this causes a (harmless) assert down the line, so we use toString() to force the type.
    return Jx.escapeHtml(this.toString());
};

String.prototype.encodeHtmlAttribute = function() {
    return this.replace(/[^\w.,-]/g, function(m) {
        return "&#" + m.charCodeAt(0) + ";";
    });
};

String.prototype.format = function() {
    var a = arguments;
    return this.replace(/\{\d+\}/g, function(m) {
        var r = a[m.replace(/[\{\}]/g, '')];
        if (r === null) {
            return '';
        }
        return r;
    });
};

String.prototype.encodeUrl = function () {
    return encodeURI(this);
};

String.prototype.endsWith = function(suffix) {
    if (!suffix.length) {
        return true;
    }
    if (suffix.length > this.length) {
        return false;
    }
    return (this.substr(this.length - suffix.length) == suffix);
};

String.prototype.startsWith = function (prefix) {
    if (!prefix.length) {
        return true;
    }
    if (prefix.length > this.length) {
        return false;
    }
    return (this.substr(0, prefix.length) == prefix);
};

// add stub classes
w.wLiveCore.ActionManager = function() { };
w.wLiveCore.ActionManager.prototype = {
    doAction: function() { },
    getAction: function() { }
};

w.wLiveCore.ErrorManager = function() { };
w.wLiveCore.ErrorManager.prototype = {
    add: function() { },
    clear: function() { }
};

w.wLiveCore.SelectionManager = function() { };
w.wLiveCore.PageController = function() { };

w.wLiveCore.DataModel = { 
    dataChangedEvent: "dataChanged"
};

w.wLiveControls.EditableText = {
    CaptionOptions: { }
};

w.wLiveControls.Video = function() { };
w.wLiveControls.Video.prototype = {
    dispose: function() { }
};

w.wLiveControls.TagCreate = function() { };
w.wLiveControls.TagCreate.prototype = {
    dispose: function() { },
    render: function() { },
    resize: function() { },
    stop: function() { }
};

w.wLiveControls.TagHover = function() { };
w.wLiveControls.TagHover.prototype = { 
    dispose: function() { },
    render: function() { },
    resize: function() { }
};

w.wLiveControls.LoadingCue = function() { };
w.wLiveControls.LoadingCue.prototype = {
    setVisibility: function() { },
    update: function() { }
};

w.$BSI = {
    isLoading: function() { return false; },
    reportEvent: function() { }
};

w.$Do = {
    register: function() { },
    when: function() { }
};

w._ge = function() { return false; }
w.sutra = function() { };
w.unsutra = function() { };

w.$WebWatson = {
    submit: function() { }
};

w.$f = {
    createLoading: function() { return ''; },
    showLoading: function() { }
};

w.$baseMaster = {
    getHeaderHeight: function() { return 0; },
    toggleFixedHeader: function() { }
};

w.$Config = {
    prop: 'MoSelf', // Property Name (Hotmail/Skydrive)
    sd: 'a', // Shared domain - used for cookie stuff.
    BSI: {},
    mkt: 'en-us' // Shared domain.
};

w.$B = {
    IE: 1,
    IE_M10: 1,
    V: 10,
    Full: 1,
    ltr: !Jx.isRtl(),
    rtl: Jx.isRtl()
};

w.$menu = {
    current: false
};

w.FilesConfig = {
    contactUsLink: '',
    codeOfConductLink: ''
};

w.GetString = function () { return ''; };
w.skipSLReload = true;

w.Trace = {
    log: function(s) { Jx.log.info(s); },
    logTo: function(x,s) { Jx.log.info(S); },
    register: function() { }
};

})();/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    wLive.Core.StringHelpers = {
        caseInsensitiveStringEquals: function (string1, string2)
        {
            /// <summary>
            /// Determines if 2 strings are equal (reguardless of case).
            /// </summary>
            /// <param name="string1" type="String">First string to compare</param>
            /// <param name="string2" type="String">Second string to compare</param>
            /// <returns type="Boolean">True if strings are same</returns>

            if (string1 == string2)
            {
                return true;
            }

            if (string1 == null || string2 == null)
            {
                return false;
            }

            return string1.toLowerCase() == string2.toLowerCase();
        }
    };
})();
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var c_alePrefix = "live.shared.skydrive.";
    var c_marketInfoPrefix = "live.shared.marketinfo.";

    wLive.Core.AleHelpers = {
        getString: function (id)
        {
            return GetString(c_alePrefix + "shared." + id);
        },
        getPCString: function (id)
        {
            return GetString(c_alePrefix + "pc." + id);
        },
        getMobileString: function (id)
        {
            return GetString(c_alePrefix + "mobile." + id);
        },
        getMarketInfoValue: function (id)
        {
            return GetString(c_marketInfoPrefix + id);
        }
    };
})();
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    wLive.Core.BiciHelpers = {
        reportClickAction: function(skyCmnd, clickLoc, typeOfPage)
        {
            /// <summary>
            /// Helper function to determine if both items are the same
            /// </summary>
            /// <param name="skyCmnd" type="String">SkyCmnd BICI attribute.</param>
            /// <param name="clickLoc" type="String">ClickLoc BICI attribute.</param>
            /// <param name="typeOfPage" type="String" optional="true">TypeOfPage BICI attribute.</param>

            if (!typeOfPage)
            {
                /* @disable(0092) */
                var PageController = wLive.Core.PageController;
                var pageController = PageController && PageController.getInstance();
                var /* @dynamic */viewContext = pageController && pageController.getViewContext();
                /* @enable(0092) */
                
                if (viewContext)
                {
                    typeOfPage = viewContext && viewContext.biciPageId;
                    var biciSetViewContentType = viewContext && viewContext.biciSetViewContentType;
                    if (biciSetViewContentType)
                    {
                        typeOfPage += biciSetViewContentType;
                    }
                }
            }
            
            $BSI.reportEvent('ClickedSelected.Command.SkyDrive', {SkyCmnd: skyCmnd, ClickLoc: clickLoc, TypeOfPage: typeOfPage});
        },
        prependBiciReportClickAction: function (orgFunc, skyCmnd, clickLoc)
        {
            /// <summary>
            /// Helper function to determine if both items are the same
            /// </summary>
            /// <param name="orgFunc" type="Function">The function to prepend the BSI resport event to.</param>
            /// <param name="skyCmnd" type="String">SkyCmnd BICI attribute.</param>
            /// <param name="clickLoc" type="String">ClickLoc BICI attribute.</param>

            return function ()
            {
                wLive.Core.BiciHelpers.reportClickAction(skyCmnd, clickLoc);
                return orgFunc && orgFunc.apply(this, arguments);
            };
        }
    };
})();
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    wLive.Core.DomHelpers = {
        isTextInputElement: function ($el)
        {
            /// <summary>
            /// this returns true if the element is a text input element
            /// </summary>
            /// <param name="$el" type="jQuery">jQuery Object which contains the containing element.</param>
            /// <returns type="Boolean">Returns true if the element is a text input element.</returns>

            return $el.is('textarea') || ($el.is('input') && (/* @static_cast(String) */$el.attr('type') == "text" || /* @static_cast(String) */$el.attr('type') == "password"));
        },
        setTimeoutZero: function (func)
        {
            /// <summary>
            /// Sets a timer with a timeout of zero, or uses msSetImmediate
            /// if that function is available.
            /// </summary>

            /* @disable(0092) */
            if (window.msSetImmediate)
            {
                window.msSetImmediate(func);
                return /* @static_cast(Number) */null;
            }
            else
            {
                return /* @static_cast(Number) */window.setTimeout(func, 0);
            }
            /* @restore(0092) */
        }
    };
})();
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    // The ModalDialog notification has class "ModalDialog" on the outer div
    // PopoverHelpers is for working with ModalDialog and not Flyouts or NotificationBars
    var c_popoverSelector = ".ModalDialog";
    var c_traceCategory = "popoverHelpers";

    var _isDialogUp = false;
    var $w = jQuery(window);

    var setDialogUp = function (evt, notification)
    {
        /// <summary>
        /// Handler to set the _isDialogUp flag.
        /// </summary>

        Trace.log("PopoverHelpers: dialog up", c_traceCategory);

        _isDialogUp = true;
    };

    var clearDialogUp = function (evt, notification)
    {
        /// <summary>
        /// Handler to set the _isDialogUp flag.
        /// </summary>

        Trace.log("PopoverHelpers: dialog closed", c_traceCategory);

        _isDialogUp = false;
    };

    $Do.when("Notifications.js", 0, function ()
    {
        Trace.log("PopoverHelpers: creating bindings", c_traceCategory);

        // Create bindings to monitor ModalDialogs and Flyouts

        /* @disable(0092) */
        jQuery(wLive.Controls.Notifications).bind({
            "afterdialogshow.notifications": setDialogUp,
            "beforedialogdismiss.notifications": clearDialogUp,
            "afterflyoutshow.notifications": setDialogUp,
            "beforeflyoutdismiss.notifications": clearDialogUp
        });
        /* @restore(0092) */

        var /* @dynamic */monitor = {};
        monitor.cleanupBindings = function ()
        {
            // <summary>Clean up event bindings when we leave.</summary>

            Trace.log("PopoverHelpers: clearing bindings", c_traceCategory);
            /* @disable(0092) */
            jQuery(wLive.Controls.Notifications).unbind({
                "afterdialogshow.notifications": setDialogUp,
                "beforedialogdismiss.notifications": clearDialogUp,
                "afterflyoutshow.notifications": setDialogUp,
                "beforeflyoutdismiss.notifications": clearDialogUp
            });
            /* @restore(0092) */
        };

        // When someone clicks on the Header to go to hotmail (or a legacy page
        // in OneDrive) which turns our page into the persistence host we
        // need to dispose the current page controller and view.
        $Do.when("$PF.attach", monitor, monitor.cleanupBindings);
    });

    // add the PopoverHelpers object to wLive.Core
    wLive.Core.PopoverHelpers = {
        popoverSelector: c_popoverSelector,
        isPopoverVisible: function ()
        {
            /// <summary>
            /// Helper to check if there is a popover up
            /// </summary>
            /// <returns type="Boolean">Returns true if the popover is created or not.</returns>

            return _isDialogUp || (/* @static_cast(Boolean) */$menu && /* @static_cast(Boolean) */$menu.current);
        }
    };
})();

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    window.FilesIS32 = window.FilesIS32 || {};
    window.FilesIS8 = window.FilesIS8 || {};

    // image data
    var c_imageDataLists = [FilesIS32, FilesIS8];

    // image strip urls
    var c_imageDataUrls = [FilesConfig.imageStripUrl_32, FilesConfig.imageStripUrl_8];

    var ImageStrip = wLive.Core.ImageStrip =
    {
        ///
    };

    ImageStrip.getImage = function (imageName, alt, title)
    {
        /// <summary>
        /// Creates an image from the specified image strip.
        /// </summary>
        /// <param name="imageName" type="String">Name of the image.</param>
        /// <param name="alt" type="String" optional="true">Alt text for the image.</param>
        /// <param name="title" type="String" optional="true">Title text for the image.</param>
        /// <returns type="HTMLElement">Image element created from image strip.</returns>

        Debug.assert(imageName, "ImageName must be set");

        // set these to empty string if they are undefined
        alt = alt || "";
        title = title || "";

        var image;
        var imageStripIndex = getImageStripIndex(imageName);

        if (imageStripIndex > -1)
        {
            var imageStripData = c_imageDataLists[imageStripIndex];
            var imageStripUrl = c_imageDataUrls[imageStripIndex];

            var /* @type(wLive.Core.ImageStripCoordinates) */data = imageStripData[imageName];

            image = $IS.Create(data.x, data.y, data.w, data.h, FilesConfig.imgBaseUrl, imageStripUrl, alt, title);
        }

        return image;
    };

    function getImageStripIndex(name)
    {
        /// <summary>
        /// Find which image strip the index is.
        /// </summary>
        /// <param name="imageName" type="String">Name of the image.</param>
        /// <param name="alt" type="String" optional="true">Alt text for the image.</param>
        /// <param name="title" type="String" optional="true">Title text for the image.</param>
        /// <returns type="Number">Image strip index</returns>

        var imageStripIndex = -1;

        // figure out which image strip the image is in
        for (var i = 0; i < c_imageDataLists.length; i++)
        {
            if (c_imageDataLists[i].hasOwnProperty(name))
            {
                imageStripIndex = i;
                break;
            }
        }

        return imageStripIndex;
    }

    ///
})();

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var w = window;

    // Authenticated storage thumbnails can be over HTTP and HTTPS
    var storageDomainRegex = new RegExp('^http(?:s)?://(?:[A-Za-z0-9]*[.])*livefilestore(?:-int)?[.]com/', 'i');

    var cookieTossObj = wLive.Core.CookieToss =
    {
        /// <summary>
        /// Lets you know if the cookie Toss is complete.
        /// </summary>
        complete: true,

        eventName: 'cookieToss',

        requiresCookieToss: function (url)
        {
            /// <summary>
            /// Checks the provided url to see if it might require the cookie toss.
            /// </summary>
            /// <param name="url" type="String">Url to check.</param>

            Debug.assert(url, 'Must provide url.');

            return storageDomainRegex.test(url);
        }
    };

    // if (!_ge('cookieToss')) it means the cookie toss is not happening (not authenticated or already occured).
    // if (w.cookieToss.e) it means that the iframe completed before this script ran.
    if (/* @static_cast(Boolean) */_ge('cookieToss') && !w.cookieToss.e)
    {
        // Cookie toss is not complete and needs to be done.
        cookieTossObj.complete = false;

        // The child iframe will call window.parent.cookieToss.c() 
        // when the cookie toss is complete.
        w.cookieToss.c = cookieTossFinished;
    }

    function cookieTossFinished()
    {
        /// <summary>
        /// Function which gets called by the iframe when
        /// the cookie toss is complete.
        /// </summary>

        cookieTossObj.complete = true;
        jQuery(cookieTossObj).trigger(cookieTossObj.eventName);
    }
})();
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;

    // Constants.
    var c_maxPriority = 3;
    var c_defaultSimulatenousTasks = 5;
    var c_minExecuteDurationThresholdMilliseconds = 20;
    var c_maxExecuteDurationThresholdMilliseconds = 100;
    var c_delayBetweenProcessing = 0;
    var c_defaultQueueId = "root";
    var c_defaultPriority = 2;

    var c_taskStateDisconnected = 0;
    var c_taskStatePending = 1;
    var c_taskStateActive = 2;
    var c_taskStateExpiring = 3;
    var c_taskStateComplete = 4;

    wLiveCore.PriorityQueue = PriorityQueue;

    /* @bind(wLive.Core.PriorityQueue) */function PriorityQueue(maxSimultaneousTasks, maxSimultaneousTasksPerPriority, maxPriority)
    {
        /// <summary>
        /// PriorityQueue provides a queue that processes items in terms of priority buckets, and within those buckets processes items last-in-first-out.
        /// To use, simply instantiate a queue for shared usage, and then call enqueue to enqueue a task callback.
        /// </summary>
        /// <param name="maxSimultaneousTasks" type="Number" optional="true">This is the max number of simultaneous tasks that can be executed in parallel.</param>
        /// <param name="maxSimultaneousTasksPerPriority" type="Object" optional="true">This is a sparse hash of priority (key) to  max simultaneous tasks per priority(value)</param>
        /// <param name="maxPriority" type="Number" optional="true">This is maximum priority value</param>

        var _this = this;

        var _maxSimultaneousTasks = maxSimultaneousTasks || c_defaultSimulatenousTasks;

        var _maxSimultaneousTasksPerPriority = maxSimultaneousTasksPerPriority || {};

        var _maxPriority = maxPriority || c_maxPriority;

        var _pendingTaskCount = 0;
        var _activeTaskCount = 0;
        var _activeTaskCountPerPriority = [];

        // Make sure the _activeTaskCountPerPriority array is filled 
        for (var y = 0; y <= _maxPriority; y++)
        {
            _activeTaskCountPerPriority.push(0);
        }

        var _currentSetTimeoutId = 0;

        var _nextTaskId = 0;

        var _taskQueues = {};
        var _taskHeadsByPriority = [];
        var _taskTailsByPriority = [];
        var _expiringTasks = {};
        var _activeTasks = {};

        var _isAbortingAll = false;
        var _isProcessingTasks = false;

        _this.enqueue = function (taskCallback, abortCallback, priority, taskId, queueId)
        {
            /// <summary>
            /// Enqueues a task to be executed, given a priority. Task ids already enqueued are ignored. (If you want to re-prioritize a task higher, the
            /// caller must dequeue the task and re-enqueue it manually.
            /// </summary>
            /// <param name="taskCallback" type="Function">
            /// Task callback function. If the function executes synchronously, there are no special requirements for arguments or return values.
            /// However, if the function executes asynchronously, the function should take in a a single "onCompleteCallback" function parameter
            /// which must be called when the function is complete, and additionally should return true to indicate it is an asynchronous function.
            /// </param>
            /// <param name="abortCallback" type="Function" optional="true">Callback function that takes a single "complete" function parameter which must be called when the function is complete.</param>
            /// <param name="priority" type="Number" optional="true">Priority of task. 0 = realtime, don't respect max simultaneous tasks. 1 = high priority, 2 = normal, 3 = bg if time permits.</param>
            /// <param name="taskId" type="String" optional="true">Unique id to identify the task.</param>
            /// <param name="queueId" type="String" optional="true"></param>
            /// <returns type="Boolean">True if the request was enqueued, false if the request is already enqueued.</returns>

            var addedTaskToQueue = false;

            Debug.assert((priority <= _maxPriority) && (priority >= 0), "Task was enqueued with a priority out of range.");

            if (!_isAbortingAll)
            {
                // resolve defaults.
                queueId = queueId || c_defaultQueueId;
                taskId = taskId || String(_nextTaskId++);
                priority = (priority !== undefined) ? priority : c_defaultPriority;

                // get the appropriate queue.
                var queue = _taskQueues[queueId] = _taskQueues[queueId] || {};

                // find the task if it already exists.
                var task = /* @static_cast(wLive.Core.Task) */queue[taskId];

                // immediately short circuit redundant enqueues.
                if (!task ||
                (task.state == c_taskStatePending && (/* @static_cast(Boolean) */task.next || task.pri != priority)))
                {
                    if (task) // found, detach it so that we can reinsert it.
                    {
                        // if the existing task currently running, we should immediately no-op.
                        detachTask(task);

                        // update the priority in case it changes.
                        task.pri = priority;
                    }
                    else // not found, create a new one and increase the pending count.
                    {
                        Debug.assert(!_activeTasks[taskId], "An active task was found during an enqueue that wasn't in the queue list.");

                        addedTaskToQueue = true;
                        task = queue[taskId] = createNewTask(taskCallback, abortCallback, priority, taskId, queueId);
                    }

                    // insert task.
                    insertTask(task);

                    // make sure we're processing tasks.
                    ensureProcessingTasks();
                }
            }

            return addedTaskToQueue;
        }; // end: enqueue

        _this.abortAll = function ()
        {
            /// <summary>
            /// Abort all tasks in all queues.
            /// </summary>

            // Track the aborting all state so that we don't allow new tasks to be enqueued during abort.
            _isAbortingAll = true;

            ///

            for (queueId in _taskQueues)
            {
                Debug.assert(_taskQueues.hasOwnProperty(queueId), "priorityQueue::abortAll ran across a property in _taskQueues that wasn't a queue id.");

                _this.abort(queueId);
            }

            _isAbortingAll = false;

            Debug.assert(_pendingTaskCount == 0, "After abortAll, _pendingTaskCount should be 0. (Was " + _pendingTaskCount + ")");
            Debug.assert(_activeTaskCount == 0, "After abortAll, _activeTaskCount should be 0. (Was " + _activeTaskCount + ")");
        };

        _this.abort = function (queueId)
        {
            /// <summary>
            /// Aborts all tasks in a queue id. Tasks that are active get an abort call if they provide it,
            /// and pending tasks are simply removed from the queue.
            /// </summary>
            /// <param name="queueId" type="String" optional="true">Queue id, or defaults to the root queue id. To abort all queues, use abortAll.</param>

            // Cancel all pending tasks.
            queueId = queueId || c_defaultQueueId;

            var queue = /* @static_cast(Object) */_taskQueues[queueId];

            if (queue)
            {
                for (taskId in queue)
                {
                    Debug.assert(queue.hasOwnProperty(taskId), "priorityQueue::abort ran across a property in queue that wasn't a task id.");

                    var task = /* @static_cast(wLive.Core.Task) */queue[taskId];

                    if (task.state == c_taskStateActive) // we need to abort and complete task.
                    {
                        // Complete active tasks so that when we call abort and the completion callback is made, we can no-op.
                        completeTask(task);

                        // Call abort if necessary.
                        task.abort && task.abort();
                    }
                    else if (task.state == c_taskStateExpiring)
                    {
                        task.timeoutId && clearTimeout(task.timeoutId);
                        removeTaskFromQueue(task);
                    }
                    else // the task is pending. just remove it from the count.
                    {
                        detachTask(task);
                    }
                }

                // Clear all tasks.
                _taskQueues[queueId] = {};
            }
        }; // end: abort

        _this.getActiveTaskCount = function ()
        {
            /// <summary>
            /// This returns the active task count
            /// </summary>

            return _activeTaskCount;
        };

        _this.getActiveTasks = function ()
        {
            /// <summary>
            /// Gets the list of active tasks.
            /// </summary>

            return _activeTasks;
        };

        function createNewTask(taskCallback, abortCallback, priority, taskId, queueId)
        {
            /// <summary>
            /// Detaches the task from the list.
            /// </summary>
            /// <param name="taskCallback" type="Function">Callback to be executed for the task.</param>
            /// <param name="abortCallback" type="Function">Callback executed when aborting active tasks.</param>
            /// <param name="priority" type="Number">Priority of task.</param>
            /// <param name="taskId" type="String">Task id.</param>
            /// <param name="queueId" type="String">Queue id.</param>
            /// <returns type="wLive.Core.Task">The new task.</returns>

            return /* @static_cast(wLive.Core.Task) */ {
                id: taskId,
                queueId: queueId,
                exec: taskCallback,
                abort: abortCallback,
                pri: priority,
                timeoutId: 0,
                next: null,
                prev: null,
                state: c_taskStateDisconnected
            };
        }

        function detachTask(task)
        {
            /// <summary>
            /// Detaches the task from the list.
            /// </summary>
            /// <param name="task" type="wLive.Core.Task">Task to be detached.</param>
            /// <returns type="wLive.Core.Task">Task that was detached.</returns>

            if (/* @static_cast(Boolean) */task && task.state == c_taskStatePending)
            {
                task.prev && (task.prev.next = task.next);
                task.next && (task.next.prev = task.prev);

                var priority = task.pri;

                (_taskHeadsByPriority[priority] == task) && (_taskHeadsByPriority[priority] = task.next);
                (_taskTailsByPriority[priority] == task) && (_taskTailsByPriority[priority] = task.prev);

                task.state = c_taskStateDisconnected;
                task.prev = task.next = null;
                _pendingTaskCount--;
            }

            return task;
        }

        function insertTask(task)
        {
            /// <summary>
            /// Inserts the task into the execution queue.
            /// </summary>
            /// <param name="task" type="wLive.Core.Task">Task to be inserted.</param>

            if (/* @static_cast(Boolean) */task && task.state == c_taskStateDisconnected)
            {
                var priority = task.pri;

                var lastTask = _taskTailsByPriority[priority];

                if (lastTask)
                {
                    lastTask.next = task;
                    task.prev = lastTask;
                }
                else
                {
                    _taskHeadsByPriority[priority] = task;
                }

                _taskTailsByPriority[priority] = task;

                task.state = c_taskStatePending;
                _pendingTaskCount++;
            }
        }

        function ensureProcessingTasks()
        {
            /// <summary>
            /// Ensures that we have a setTimeout enqueued to process tasks as necessary.
            /// </summary>

            if (!_isProcessingTasks && !_currentSetTimeoutId && /* @static_cast(Boolean) */_pendingTaskCount && _activeTaskCount < _maxSimultaneousTasks)
            {
                _currentSetTimeoutId = window.setTimeout(processTasks, c_delayBetweenProcessing);
            }
        }

        function hasProcessTimeLeft(startTime, priority)
        {
            /// <summary>
            /// Helper to measure time since the given time.
            /// </summary>
            /// <param name="startTime" type="Number">Start time.</param>
            /// <param name="priority" type="Number">Priority.</param>
            /// <returns type="Boolean">True if we can still process things.</returns>

            ///

            var hasTimeLeft = true;

            if (priority > 0)
            {
                var executeDurationThresholdMilliseconds = Math.max(c_minExecuteDurationThresholdMilliseconds, c_maxExecuteDurationThresholdMilliseconds - (c_maxExecuteDurationThresholdMilliseconds * (priority / _maxPriority)));
                hasTimeLeft = ((new Date().getTime() - startTime) < executeDurationThresholdMilliseconds);
            }

            return hasTimeLeft;
        }

        function processTasks()
        {
            /// <summary>
            /// Executes tasks that are currently enqueued, called by setTimeout.
            /// </summary>

            var startProcessTime = new Date().getTime();
            var currentPriority = 0;

            // Set the current timeout to 0 to allow for dequeuing to call setTimeout again when things are done and we have more stuff to do.
            _currentSetTimeoutId = 0;

            _isProcessingTasks = true;

            while (
                (_pendingTaskCount > 0) &&
                (currentPriority <= _maxPriority) &&
                (_activeTaskCount < _maxSimultaneousTasks))
            {
                var task = /* @static_cast(wLive.Core.Task) */_taskHeadsByPriority[currentPriority];

                // Test if we over the priority task limit
                if (/* @static_cast(Boolean) */task && _activeTaskCountPerPriority[task.pri] < (_maxSimultaneousTasksPerPriority[task.pri] || _maxSimultaneousTasks))
                {
                    Debug.assert(task.state === c_taskStatePending, "Task was not in a pending state and we were just about to execute it.");
                    task = executeTask(detachTask(task));
                }
                else
                {
                    task = null;
                }

                if (!task)
                {
                    currentPriority++;
                }
                else // we executed a task, so check for process time left.
                    if (!hasProcessTimeLeft(startProcessTime, currentPriority))
                    {
                        break;
                    }
            }

            _isProcessingTasks = false;

            ensureProcessingTasks();
        }

        function executeTask(task)
        {
            /// <summary>
            /// Executes the given task.
            /// </summary>
            /// <param name="task" type="wLive.Core.Task">Task to be executed.</param>
            /// <returns type="wLive.Core.Task">Task that was executed.</returns>

            if (task)
            {
                Debug.assert(task.id != undefined && !_activeTasks[task.id], "Task didn't have an id or was already active!");
                _activeTaskCount++;
                _activeTasks[task.id] = task;
                task.startTime = new Date().getTime();
                _activeTaskCountPerPriority[task.pri]++;

                task.state = c_taskStateActive;

                var isAsyncTask = task.exec(function (expirationDuration) { completeTask(task, expirationDuration); });

                if (!isAsyncTask)
                {
                    completeTask(task);
                }
            }

            return task;
        }

        function completeTask(task, expirationDuration)
        {
            /// <summary>
            /// Remove the task from the queue.
            /// </summary>
            /// <param name="task" type="wLive.Core.Task">Task to be completed.</param>
            /// <param name="expirationDuration" type="Number" optional="true">Task to be completed.</param>

            if (task.state === c_taskStateActive)
            {
                _activeTaskCount--;

                Debug.assert(_activeTasks[task.id], "A task is being completed without being in the active task list.");

                delete _activeTasks[task.id];

                _activeTaskCountPerPriority[task.pri]--;


                // If a duration was not provided, remove the task now. We check for type here because if complete is called
                // from jquery ajax complete directly, it will pass in xhr for duration.
                if (!expirationDuration || typeof expirationDuration !== "number")
                {
                    removeTaskFromQueue(task);
                }
                else
                {
                    task.state = c_taskStateExpiring;
                    task.timeoutId = window.setTimeout(function () { removeTaskFromQueue(task); }, expirationDuration);
                }
            }
        }

        function removeTaskFromQueue(task)
        {
            /// <summary>
            /// Remove the task from the queue.
            /// </summary>
            /// <param name="task" type="wLive.Core.Task">Task to be completed.</param>

            var queue = _taskQueues[task.queueId];
            task.state = c_taskStateComplete;
            delete queue[task.id];
            ensureProcessingTasks();
        }

        ///
    } // end PriorityQueue definition

    ///

    // Define a task definition for coffeemaker/intellisense purposes.
    ///

})();

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;

    // Constants.
    var c_maxRequestPriority = 12;
    var c_requestSimulatenousTasksMax = 5;

    /* OneDrive Request Configuration */
    // This is the enum that defines values for certain operations
    var requestPriorityEnum = wLiveCore.RequestPriorityEnum = {
        FetchData: 0,
        FetchImages: 1,
        DefaultGet: 2,
        DefaultPost: 3,
        MoveOperation: 4,
        CopyOperation: 5,
        DeleteOperation: 6,
        RestoreOperation: 7,
        UploadOperation: 8,
        RemoteUploadOperation: 9,
        UpdateStatusOperation: 10,
        ResetAbuseScoreOperation: 11,
        OwnerRequestReviewOperation: 12
    };

    var requestMaxSimTasksPerPriority = {};

    // Set copy operation limits
    requestMaxSimTasksPerPriority[requestPriorityEnum.CopyOperation] = 1;

    // Set delete operation limits
    requestMaxSimTasksPerPriority[requestPriorityEnum.DeleteOperation] = 1;

    // Set move operation limits
    requestMaxSimTasksPerPriority[requestPriorityEnum.MoveOperation] = 1;

    // Set restore operation limits
    requestMaxSimTasksPerPriority[requestPriorityEnum.RestoreOperation] = 1;

    // Set upload operation limits
    requestMaxSimTasksPerPriority[requestPriorityEnum.UploadOperation] = 3;

    // Set remote upload operation limits
    requestMaxSimTasksPerPriority[requestPriorityEnum.RemoteUploadOperation] = 1;

    // Initialize global window.requests priority queue for network requests.
    window.requests = new wLiveCore.PriorityQueue(c_requestSimulatenousTasksMax, requestMaxSimTasksPerPriority, c_maxRequestPriority);
    window.domUpdates = new wLiveCore.PriorityQueue();
})();

(function ()
{
    var wLiveCore = wLive.Core;

    var getString = wLiveCore.AleHelpers.getString;

    var c_fetchQueueId = "fetch";
    var c_writeQueueId = "write";

    var c_requestTimeout = 30000; // 30 seconds

    var c_callTimeoutErrorCode = 8000;
    var c_callAbortedErrorCode = 8002;

    var c_defaultRetries = 1;
    var c_defaultPostPriority = wLiveCore.RequestPriorityEnum.DefaultPost;
    var c_defaultGetPriority = wLiveCore.RequestPriorityEnum.DefaultGet;

    var c_traceCategory = "DataRequest";

    var s_globalRequestNumber = 0;

    // Key to be added to url when key value is passed as null
    var _attempt = 0;

    wLiveCore.DataRequest = DataRequest;
    var s_errors = wLiveCore.DataRequest.Errors = [];

    /* @bind(wLive.Core.DataRequest) */function DataRequest(key, url, postData, successCallback, failureCallback, requestTimeout, priority, retries)
    {
        /// <summary>
        /// Wraps a data request to the server, abstracts retries, error parsing, and enqueueing/dequeueing of the request.
        /// </summary>
        /// <param name="key" type="String">Key to map the request to. This is used to ensure only one request goes through per key. If null, we generate unique key for request.</param>
        /// <param name="url" type="String">Url to make the request to.</param>
        /// <param name="postData" type="String" optional="true">Post data to send in the request. If not provided, the request will assume to be an http get.</param>
        /// <param name="successCallback" type="Object -> void" optional="true">Success callback, with the signature: function callback(responseObject)</param>
        /// <param name="failureCallback" type="Object -> void" optional="true">Failure callback, with the signature: function callback(responseObject)</param>
        /// <param name="requestTimeout" type="Number" optional="true">This is the request timeout in ms</param>
        /// <param name="priority" type="Number" optional="true">The priority for the data request</param>
        /// <param name="retries" type="Number" optional="true">The number of retries for the data request</param>

        // Private members.
        var _this = this;

        var /* @type(XMLHttpRequest)*/_xhr;
        var /* @type(void -> void) */_dequeueCallback; // function callback(reentranceDelay)

        // Some cases want no retries, so we set this field if passed else its default
        var _retriesLeft = (retries !== undefined) ? retries : c_defaultRetries;

        requestTimeout = requestTimeout || c_requestTimeout;

        var _traceContext = null;
        var /* @type(Date) */_startTime;
        var _isCrossDomain = isCrossDomain(url);

        // If key isn't set, we create a unique key
        key = key || 'key' + _attempt++;

        // Public properties that can be overridden.
        _this.priority = priority || (postData ? c_defaultPostPriority : c_defaultGetPriority);
        _this.queueId = postData ? c_writeQueueId : c_fetchQueueId;
        _this.originId = null;
        _this.jsonpParameterName = undefined;
        _this.successReentranceDelay = 0;
        _this.failureReentranceDelay = 0;

        // Bug 428412: Encode '??' and '=?' so that jQuery won't try to treat them as callback hooks
        if (postData)
        {
            postData = postData.replace(/\?/g, "\\u003F");
        }

        _this.start = function ()
        {
            /// <summary>
            /// Starts the asynchronous excution of the data request.
            /// </summary>
            /// <returns type="Boolean">True if the request key was unique and we were able to enqueue the request, otherwise false.</returns>


            return window.requests.enqueue(
                function (dequeueCallback)
                {
                    /// <summary>
                    /// Execution callback.
                    /// </summary>
                    /// <param type="void -> void"></param>

                    _dequeueCallback = dequeueCallback;

                    // Start a timer so we know the client time in page stats.
                    _startTime = new Date().getTime();

                    var headers = null;
                    var requestUrl = url;
                    var callbackFunctionName;

                    if (!_isCrossDomain)
                    {
                        headers = { canary: FilesConfig.canary, Accept: "application/json", AppId: FilesConfig.appId };

                        if (_this.originId)
                        {
                            headers["X-SkyApiOriginId"] = _this.originId;
                        }

                        if (FilesConfig.oauthToken)
                        {
                            headers["X-Auth"] = FilesConfig.oauthToken;
                        }
                    }
                    else
                    {
                        // Append the canary as a qs param.
                        requestUrl += (url.indexOf("?") === -1) ? "?" : "&";
                        requestUrl += "canary=" + FilesConfig.canary.encodeUrl();

                        // Create a jsonp callback function. Normally jquery would handle this for us, but has bugs regarding cleaning up the callback too soon.
                        // See http://bugs.jquery.com/ticket/8744 for more details.
                        callbackFunctionName = "dataRequestCallback_" + s_globalRequestNumber++;

                        // For cross domain jsonp requests, we need a timer to watch the request to fail it, since jquery does not reliably call failure callbacks.
                        var requestComplete = false;

                        var requestTimeoutId = setTimeout(function ()
                        {
                            if (!requestComplete)
                            {
                                requestComplete = true;
                                handleResponse(parseError(_xhr, "timeout", c_callTimeoutErrorCode));
                            }
                        }, requestTimeout);

                        wLiveCore.DataRequest[callbackFunctionName] = function (data)
                        {
                            /// <summary>Temporary function callback that will handle the jsonp response.</summary>

                            if (!requestComplete)
                            {
                                clearTimeout(requestTimeoutId);
                                requestComplete = true;
                                handleResponse(data);
                            }

                            delete wLiveCore.DataRequest[callbackFunctionName];
                        };
                    }

                    _xhr = /* @static_cast(XMLHttpRequest) */jQuery.ajax(
                        {
                            url: requestUrl,
                            dataType: _isCrossDomain ? "jsonp" : "json",
                            jsonp: _this.jsonpParameterName,
                            jsonpCallback: callbackFunctionName ? "wLive.Core.DataRequest." + callbackFunctionName : undefined,
                            data: postData,
                            processData: false,
                            type: postData ? "POST" : "GET",
                            headers: headers,
                            timeout: requestTimeout,
                            success: _isCrossDomain ? undefined : function (data, textStatus, xhr) { handleResponse(data); },
                            error: _isCrossDomain ? undefined : function (xhr, textStatus, errorThrown) { handleResponse(parseError(xhr, textStatus, errorThrown)); }
                        });

                    _traceContext = Trace.log("Request: " + url, c_traceCategory);

                    return true;
                },
                function ()
                {
                    /// <summary>
                    /// Abort callback.
                    /// </summary>

                    // Abort should be done when request is CrossDomain,
                    // or it will fail when response comes back and it is not expected.
                    // JQuery Bug 9782: http://bugs.jquery.com/ticket/9782
                    if (!_isCrossDomain)
                    {
                        _this.abort();
                    }
                },
                _this.priority,
                key,
                _this.queueId);
        }; // end: start

        _this.abort = function ()
        {
            /// <summary>
            /// Aborts the currently executing request.
            /// </summary>

            if (/* @static_cast(Boolean) */_xhr && !_isCrossDomain)
            {
                Trace.logTo(_traceContext, "Abort: " + url, c_traceCategory);

                _xhr.abort();
                _xhr = null;
            }

            if (_dequeueCallback)
            {
                _dequeueCallback();
                _dequeueCallback = null;
            }
        }; // end: abort

        function isCrossDomain(url)
        {
            /// <summary>
            /// Determines if the given domain is a cross-domain request.
            /// </summary>
            /// <param name="url" type="String">Domain.</param>
            /// <returns type="Boolean">True if the domain is not the same.</returns>

            var isCrossDomain = false;

            if (url.indexOf("/") != 0)
            {
                isCrossDomain = (getDomainFromUrl(url) != getDomainFromUrl(window.location.host));
            }

            return isCrossDomain;
        }

        function getDomainFromUrl(url)
        {
            /// <summary>
            /// Gets the domain of the given url.
            /// </summary>
            /// <param name="url" type="String">Domain.</param>

            // Trim leading "http[s]://"
            var i = url.indexOf("://");
            (i !== -1) && /* @static_cast(Boolean) */(url = url.substr(i + 3));

            // Trim trailing query parameters.
            i = url.indexOf("?");
            (i !== -1) && /* @static_cast(Boolean) */(url = url.substr(0, i));

            // Trim path.
            i = url.indexOf("/");
            (i !== -1) && /* @static_cast(Boolean) */(url = url.substr(0, i));

            return url.toLowerCase();
        }

        function parseError(xhr, textStatus, errorThrown)
        {
            /// <summary>
            /// Aborts the currently executing request.
            /// </summary>
            /// <param name="xhr" type="XMLHttpRequest">XHR object.</param>
            /// <param name="textStatus" type="String">Text status response</param>
            /// <param name="errorThrown" type="String">Error thrown.</param>
            /// <returns type="wLive.Core.IJSONServiceResponse">JSON response parsed from error data.</returns>

            var response = /* @static_cast(wLive.Core.IJSONServiceResponse) */{};

            // If the server returns a 500, try to parse a json response from the responseText.
            if (/* @static_cast(Number) */xhr.status == 500)
            {
                try
                {
                    response = /* @static_cast(wLive.Core.IJSONServiceResponse) */(Object.fromJSON(xhr.responseText) || {});
                } catch (e) { /* no-op and handle response null */ }
            }

            // If the object has no error in it, the request failed or the server returned an unexpected error response. (we check items too since batch responses return 500 if there is any error)
            if (!response.error && !response.items)
            {
                // These codes are not actioned on; just setting them to non-zero scenarios for now.
                var isRetriable = true;
                var code = c_callTimeoutErrorCode;
                var message = getString("LoadGenericError");

                // Make a fake page stats object for errors.
                response.pageStats =
                {
                    url: url,
                    error: textStatus,
                    tasks: [],
                    executionTimeMs: 0,
                    schedulerTimeMs: 0
                };

                // XHR doesn't return anything besides timeout textStatus for timeout errors.
                switch (textStatus)
                {
                    case "timeout":
                        code = 8001;
                        message = getString("LoadTimeoutError");
                        break;

                    case "abort":
                        code = c_callAbortedErrorCode;
                        isRetriable = false;
                        response.pageStats.info = textStatus;
                        response.pageStats.error = null;
                        break;
                }

                response.error =
                {
                    isRetriable: isRetriable,
                    code: code,
                    message: message,
                    debugMessage: '(xhr status ' + xhr.status + ') xhr.responseText: ' + xhr.responseText,
                    stackTrace: ''
                };
            }

            return response;
        } // end: parseError

        function handleResponse(dataObject)
        {
            /// <summary>
            /// Handles the response from the xhr request.
            /// </summary>
            /// <param name="dataObject" type="wLive.Core.IJSONServiceResponse">Data coming back from the json service.</param>

            // Ensure we have an object to parse, even if the server returns null.
            dataObject = dataObject || {};

            // Add the page stats data to the list of page stats data.
            wLive.PageStats.add(dataObject.pageStats, _startTime);

            if (dataObject.error)
            {
                var stackTrace = dataObject.error.stackTrace;
                stackTrace = (/* @static_cast(Boolean) */stackTrace && /* @static_cast(Boolean) */stackTrace.encodeJson) ? stackTrace.encodeJson() : "";

                var errorString = '{' +
                                '"code": "' + dataObject.error.code + '", ' +
                                '"message": "' + dataObject.error.message + '", ' +
                                '"debug": "' + dataObject.error.debugMessage + '", ' +
                                '"stacktrace": "' + stackTrace + '", ' +
                                '"retriesLeft": "' + _retriesLeft + '", ' +
                                '"requestUrl": "' + url + '"}';
                s_errors.push(errorString);
            }

            if (/* @static_cast(Boolean) */dataObject.error && dataObject.error.isRetriable && _retriesLeft > 0)
            {
                Trace.logTo(_traceContext, "Retrying request: " + url, c_traceCategory);

                /* @static_cast(Boolean) */_dequeueCallback && /* @static_cast(Boolean) */_dequeueCallback();
                _retriesLeft--;
                _this.start();
            }
            else // No retry required, either call success or failure callback.
            {
                if (dataObject.error)
                {
                    Trace.logTo(_traceContext, "Failed response: " + url, c_traceCategory);

                    /* @static_cast(Boolean) */_dequeueCallback && /* @static_cast(Boolean) */_dequeueCallback(_this.failureReentranceDelay);

                    // Call the failure callback only when there's a non-abort failure.
                    (dataObject.error.code != c_callAbortedErrorCode) && /* @static_cast(Boolean) */failureCallback && failureCallback(dataObject);
                }
                else
                {
                    Trace.logTo(_traceContext, "Response: " + url, c_traceCategory);

                    /* @static_cast(Boolean) */_dequeueCallback && /* @static_cast(Boolean) */_dequeueCallback(_this.successReentranceDelay);

                    // if we are making a cross domain call, we can't pass origin id as a header. just return it in the response.
                    _isCrossDomain && /* @static_cast(Boolean) */_this.originId && /* @static_cast(Boolean) */(dataObject.originId = _this.originId);

                    successCallback && successCallback(dataObject);
                }
            }
        } // end: handleResponse

        // Stubs for testing.
        ///

    }; // end: DataRequest

})();

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;

    wLiveCore.Events = {
        addListener: function (type, fn, /* @dynamic */obj, apiId)
        {
            /// <summary>Add an event listener to this object.</summary>
            /// <param name="type" type="String">The event identifier.</param>
            /// <param name="fn" type="Function">The function callback.</param>
            /// <param name="obj" optional="true">The context in which to call the callback function.</param>
            /// <param name="apiId" type="String" optional="true">The apiId to use to instrument the callback function.</param>
            /// <returns>Returns this object.</returns>
            
            var /* @dynamic */ qos = window['Qos'];
            var newFn = !qos ? fn : function()
            {           
                // Execute the callback under the instrumentation context of the given ApiId.
                /* @disable(0092) */
                return qos.instrument(qos.startOperation({newId: apiId}), fn).apply(obj, arguments);
                /* @restore(0092) */
            };

            // _skyEv isn't defined since it dynamically added.
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            /* @disable(0092) */
            var ev = this._skyEv = this._skyEv || {};
            /* @restore(0092) */
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

            ev[type] = ev[type] || { recursionCount: 0, isSweepNeeded: false, listeners: [] };
            ev[type].listeners.push({ fn: newFn, originalFn: fn, obj: obj });
            return this;
        },

        removeListener: function (type, fn, /* @dynamic */obj)
        {
            /// <summary>Remove an event listener from this object.</summary>
            /// <param name="type" type="String">The event identifier.</param>
            /// <param name="fn" type="Function">The function callback.</param>
            /// <param name="obj" optional="true">The context in which to call the callback function.</param>
            /// <returns>Returns this object.</returns>

            var listeners, /* @type(SkyDriveDirectEventListener) */listener, i, /* @type(SkyDriveDirectEvent) */evt;

            /* @disable(0092) */
            if (this._skyEv)
            {
                /* @restore(0092) */
                evt = this._skyEv[type];
                if (evt)
                {
                    listeners = evt.listeners;
                    for (i = listeners.length; i--; )
                    {
                        listener = listeners[i];
                        if (Boolean(listener) && listener.originalFn === fn && listener.obj === obj)
                        {
                            if (evt.recursionCount !== 0)
                            {
                                listeners[i] = null;
                                evt.isSweepNeeded = true;
                            } else
                            {
                                listeners.splice(i, 1);
                            }
                            return this;
                        }
                    }
                }
            }

            Debug.assert(false, "Listener not found");

            return this;
        },

        disposeEvents: function ()
        {
            /// <summary>Dispose events.</summary>

            if (this._skyEv)
            {
                this._skyEv = null;
            }
        },

        raiseEvent: function (type, /* @dynamic */ev)
        {
            /// <summary>Fire an event on this object.</summary>
            /// <param name="type" type="String">The event identifier.</param>
            /// <param name="ev" optional="true">The event arguments.</param>
            /// <returns>Returns this object.</returns>

            /// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

            // We call this raise event to make the events listenable by the new JSBase Object Eventing
            // this code will eventually be consolidated
            /* @disable(0058) */
            if (window['raiseEvent'])
            {
                raiseEvent(this, type, ev, false);
            }
            /* @restore(0058) */

            var listeners;
            var /* @type(SkyDriveDirectEventListener) */listener;
            var i;
            var len;
            var /* @type(SkyDriveDirectEvent) */evt;

            /* @disable(0092) */
            var skyev = this._skyEv;
            /* @restore(0092) */

            if (skyev)
            {
                evt = skyev[type];
                if (evt)
                {
                    listeners = evt.listeners;
                    ++evt.recursionCount;

                    // Invoke all listeners
                    for (i = 0, len = listeners.length; i < len; ++i)
                    {
                        listener = listeners[i];
                        if (listener)
                        {
                            // Similar to the DOM events, any exceptions thrown inside a listener will not stop propagation.
                            try
                            {
                                listener.fn.call(listener.obj, ev);
                            } catch (/* @type(Error) */e)
                            {
                                throw e; // rethrow the exception in debug
                            }
                        }
                    }

                    if (--evt.recursionCount === 0 && evt.isSweepNeeded)
                    {
                        // If this is the last call to fire on the stack and a sweep is needed 
                        // (a listener was nulled out rather than removed) then cleanup the listeners.
                        for (i = listeners.length; i--; )
                        {
                            if (!listeners[i])
                            {
                                listeners.splice(i, 1);
                            }
                        }
                        evt.isSweepNeeded = false;
                    }
                }
            }
            return this;
        }
    };
})();
(function ()
{
    var wLiveCore = wLive.Core;

    wLiveCore.ItemSet = ItemSet;

    /* @bind(wLive.Core.ItemSet) */function ItemSet()
    {
        /// <summary>
        /// ItemSet represents a collection class that exposes basic methods for accessing a collection of items.
        /// The collection can be filtered via a filter method.
        /// </summary>

        this._filters = [hiddenItemsFilter];

        this.clear();
    };

    var proto = wLiveCore.ItemSet.prototype;

    proto.clear = function ()
    {
        /// <summary>
        /// Clears the collection.
        /// </summary>

        var _this = this;

        _this._filteredCount = 0;
        _this._filteredIndexToActualIndex = {};
        _this._keyToFilteredIndex = {};

        _this._childCount = 0;
        _this._materializedCount = 0;

        // Clean up listeners if there are any on the item
        /* @disable(0092) */
        if (_this._indexToItem)
        {
            for (var x in _this._indexToItem)
            {
                var /* @type(wLive.Core.IBaseItem) */item = _this._indexToItem[x];

                if (/* @static_cast(Boolean) */item && /* @static_cast(Boolean) */item.removeListener)
                {
                    // clean up listeners
                    item.removeListener("change", _this._invalidateHandler, _this);
                    item.removeListener("removeItem", _this._removeItemHandler, _this);
                }
            }
        }
        /* @restore(0092) */

        _this._indexToItem = {};
        _this._keyToIndex = {};

        _this._requiresFilter = false;
    };

    proto.get = function (index, useUnfilteredIndex)
    {
        /// <summary>
        /// Gets the item at the specified index.
        /// Note: use setFiltersEnabled to disable filtering if necessary.
        /// </summary>
        /// <param name="index" type="Number">Index of item.</param>
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true">If specified as true, will treat the index as an unfiltered index.</param>
        /// <returns type="wLive.Core.IBaseItem">Item at the given index.</returns>

        var _this = this;

        // Update the filtered set. This will no-op if its unnecessary.
        _this._updateFilteredSet(useUnfilteredIndex);

        (!useUnfilteredIndex) && /* @static_cast(Boolean) */(index = _this._filteredIndexToActualIndex[index]);

        return this._indexToItem[index];
    };

    proto.getByKey = function (key, useUnfilteredIndex)
    {
        /// <summary>
        /// Gets the item in the collection that has the specified key. If the items don't have key properties
        /// or they haven't been populated in the set, this won't work very well.
        /// </summary>
        /// <param name="key" type="String">Item to be set.</param>
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true">If specified as true, will  return the item even if it's filtered.</param>
        /// <returns type="wLive.Core.IBaseItem">Item at the given index.</returns>

        var _this = this;

        // Update the filtered set. This will no-op if its unnecessary.
        _this._updateFilteredSet(useUnfilteredIndex);

        // The key lives at a particular index, but that index may vary based on whether filtering is enabled or not.
        var index = useUnfilteredIndex ? _this._keyToIndex[key] : _this._filteredIndexToActualIndex[_this._keyToFilteredIndex[key]];

        return this._indexToItem[index];
    };

    proto.set = function (index, item)
    {
        /// <summary>
        /// Sets the item as the specified index. This index is always the unfiltered index, regardless of whether
        /// filtering is enabled or not.
        /// </summary>
        /// <param name="index" type="Number">Unfiltered index of the item.</param>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to be set.</param>
        /// <returns type="Boolean">Whether the item at the given index changed as a result of setting.</returns>

        var _this = this;
        var itemChanged = false;

        var currentItem = /* @static_cast(wLive.Core.IBaseItem) */_this._indexToItem[index];

        if (currentItem != item)
        {
            if (/* @static_cast(Boolean) */currentItem && /* @static_cast(Boolean) */currentItem.removeListener)
            {
                currentItem.removeListener("change", _this._invalidateHandler, _this);
                currentItem.removeListener("removeItem", _this._removeItemHandler, _this);
            }

            itemChanged = true;

            _this._indexToItem[index] = item;

            if (item)
            {
                item.key && (_this._keyToIndex[item.key] = index);

                _this._childCount = Math.max(_this._childCount, index + 1);

                if (item.addListener)
                {
                    item.addListener("change", _this._invalidateHandler, _this);
                    item.addListener("removeItem", _this._removeItemHandler, _this);
                }
            }

            if (!currentItem && /* @static_cast(Boolean) */item)
            {
                _this._materializedCount++;
            }
            else if (/* @static_cast(Boolean) */currentItem && !item)
            {
                _this._materializedCount--;
            }

            _this._requiresFilter = true;
        }

        return itemChanged;
    };

    proto.insert = function (index, item, useUnfilteredIndex)
    {
        /// <summary>
        /// Inserts an item at the beginning of the set.
        /// </summary>
        /// <param name="index" type="Number">Unfiltered index of the item.</param>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to be set.</param>
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true"></param>

        this.insertWithGroupHint(index, item, true, useUnfilteredIndex);
    };

    proto.insertWithGroupHint = function (index, item, preferAfter, useUnfilteredIndex)
    {
        /// <summary>
        /// Inserts an item at the beginning of the set.
        /// </summary>
        /// <param name="index" type="Number">Unfiltered index of the item.</param>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to be set.</param>
        /// <param name="preferAfter" type="Boolean" optional="true">This specifies if we should should prefer the group after when we insert at a group boundry.</param>
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true"></param>

        var _this = this;

        // Update the filtered set. This will no-op if its unnecessary.
        _this._updateFilteredSet(useUnfilteredIndex);

        // resolve index.
        !useUnfilteredIndex && /* @static_cast(Boolean) */(index = (index < _this._filteredCount) ? _this._filteredIndexToActualIndex[index] : _this._childCount);

        // cap index within bounds.
        index = Math.max(0, Math.min(index, _this._childCount));

        Debug.assert(index >= 0, "ItemSet::insert - index was less than 0!");

        // Track item we're potentially replacing. Set the place to null, so that we don't unbind from change events.
        var /* @type(wLive.Core.IBaseItem) */currentItem = _this._indexToItem[index];
        _this._indexToItem[index] = null;

        // Clean up groups
        if (_this.groupings)
        {
            var groupings = _this.groupings;

            for (var x = 0; x < groupings.length; x++)
            {
                var group = /* @static_cast(wLive.Core.IBaseItemGroupData) */groupings[x];

                var endIndex = group.startIndex + group.count - 1;

                // If you at a group boundary we add it to the next group
                if (preferAfter)
                {
                    // We prefer the group after for insert
                    if (endIndex >= index)
                    {
                        group.startIndex > index && /* @static_cast(Boolean) */group.startIndex++;

                        // we found the group the item was in
                        if (group.startIndex <= index)
                        {
                            group.count++;
                        }
                    }
                    else if (index == _this._childCount && endIndex + 1 == _this._childCount)
                    {
                        // we are inserting at the end
                        // and we are the last group
                        group.count++;
                    }
                }
                else
                {
                    // We prefer the group before for insert
                    if (endIndex + 1 >= index)
                    {
                        // increment the start index as long as its not the first index
                        if ((group.startIndex == index && group.startIndex != 0) ||
                            group.startIndex > index)
                        {
                            group.startIndex++;
                        }

                        // we found the group the item was in
                        if (group.startIndex <= index)
                        {
                            group.count++;
                        }
                    }
                }
            }
        }

        // set new item in that location. This will bind to the new item's change events.
        _this.set(index, item);

        // Now while we have an item to move, move it to the next slot.
        while (currentItem)
        {
            var nextItem = _this._indexToItem[++index];
            _this._indexToItem[index] = currentItem;

            // Update the key index
            _this._keyToIndex[currentItem.key] = index;
            currentItem = nextItem;

            (index == _this._childCount) && /* @static_cast(Boolean) */(_this._childCount++);
        }

        _this._requiresFilter = true;
    };

    proto.add = function (item)
    {
        /// <summary>
        /// Adds an item to the end of the set.
        /// </summary>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to be set.</param>

        var _this = this;

        _this.insert(_this._childCount, item, true);
    };

    proto.indexOf = function (item, useUnfilteredIndex)
    {
        /// <summary>
        /// Gets the filtered index of an item.
        /// </summary>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to get the filtered index of.</param>
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true">If true specifies to return the unfiltered index.</param>
        /// <returns type="Number">Index of item or -1 if the item doesn't exist in the collection.</returns>

        Debug.assert(item, "ItemSet::indexOf - item was null.");
        Debug.assert(item.key, "ItemSet::indexOf - item didn't have a key.");

        var _this = this;
        var index;

        _this._updateFilteredSet(useUnfilteredIndex);

        index = useUnfilteredIndex ? _this._keyToIndex[item.key] : _this._keyToFilteredIndex[item.key];

        if (index === undefined)
        {
            index = -1;
        }

        return index;
    };

    proto.removeAt = function (index, useUnfilteredIndex)
    {
        /// <summary>
        /// Removes an item at the specified index.
        /// </summary>
        /// <param name="index" type="Number">Unfiltered index of item.</param>       
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true">If true specifies to return the unfiltered index.</param>

        var _this = this;

        // Update the filtered set. This will no-op if its unnecessary.
        _this._updateFilteredSet(useUnfilteredIndex);

        // resolve index.
        (!useUnfilteredIndex) && /* @static_cast(Boolean) */(index = _this._filteredIndexToActualIndex[index]);

        // clear up the item.
        var item = /* @static_cast(wLive.Core.IBaseItem)*/_this._indexToItem[index];

        if (item)
        {
            if (item.removeListener)
            {
                // clean up listeners
                item.removeListener("change", _this._invalidateHandler, _this);
                item.removeListener("removeItem", _this._removeItemHandler, _this);
            }

            delete _this._keyToIndex[item.key];
        }

        // Clean up groupings
        if (_this.groupings)
        {
            var groupings = _this.groupings;

            for (var x = 0; x < groupings.length; x++)
            {
                var group = /* @static_cast(wLive.Core.IBaseItemGroupData) */groupings[x];

                var endIndex = group.startIndex + group.count - 1;

                if (endIndex >= index)
                {
                    // we found the group the item was in
                    if (group.startIndex <= index)
                    {
                        group.count--;

                        if (group.count == 0)
                        {
                            // The group is empty now so remove it
                            groupings.splice(x, 1);
                            x--;
                        }
                    }
                    else
                    {
                        // we found a group after the removed item
                        group.startIndex--;
                    }
                }
            }
        }

        var maxIndex = _this._childCount - 1;

        while (index < maxIndex)
        {
            item = _this._indexToItem[index + 1];

            if (item)
            {
                _this._keyToIndex[item.key] = index;
                _this._indexToItem[index] = item;
            }

            index++;
        }

        // delete the last item and reduce child count.
        delete _this._indexToItem[_this._childCount - 1];
        _this._childCount--;

        _this._requiresFilter = true;
    };

    proto.remove = function (item)
    {
        /// <summary>
        /// Removes a specific item.
        /// </summary>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to remove from the collection.</param>       

        var _this = this;
        var index = _this.indexOf(item, true);

        if (index != -1)
        {
            _this.removeAt(index, true);
        }
    };

    proto.invalidate = function ()
    {
        /// <summary>
        /// Fires a change event on the set.
        /// </summary>

        var _this = this;

        _this._requiresFilter = true;

        _this.raiseEvent("change");
    };

    proto.getCount = function (useUnfilteredIndex)
    {
        /// <summary>
        /// Gets the filtered item count.
        /// </summary>
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true">Use unfiltered index.</param>
        /// <returns type="Number">The filtered item count.</returns>

        var _this = this;

        _this._updateFilteredSet(useUnfilteredIndex);

        return useUnfilteredIndex ? _this._childCount : _this._filteredCount;
    };

    proto.getGroupings = function (useUnfilteredGroupings)
    {
        /// <summary>
        /// Gets the groupings array.
        /// </summary>
        /// <param type="Boolean" optional="true">This is true if we should return the unfiltered group data</param>

        var _this = this;

        /* @disable(0092) */
        var groupings = _this.groupings;

        var returnValue;

        if (!groupings)
        {
            // short circuit and just evaluate the counts
            var count = _this.getCount(useUnfilteredGroupings);

            returnValue = [{
                groupingId: "other",
                startIndex: 0,
                endIndex: count - 1,
                count: count
            }];
            /* @restore(0092) */
        }
        else
        {
            _this._updateFilteredSet(useUnfilteredGroupings);

            if (useUnfilteredGroupings)
            {
                // fix up the groupings to have an end index
                for (var x = 0; x < groupings.length; x++)
                {
                    var group = /* @static_cast(wLive.Core.IBaseItemGroupData) */groupings[x];
                    group.endIndex = group.startIndex + group.count - 1;
                }

                returnValue = groupings;
            }
            else
            {
                returnValue = _this._filteredGroups;
            }
        }

        return returnValue;
    };

    proto.setCount = function (count)
    {
        /// <summary>
        /// Sets the unfiltered item count and clears the collection. Used for virtualization scenarios.
        /// </summary>

        var _this = this;

        if (_this._childCount != count)
        {
            _this.clear();
            _this._childCount = _this._filteredCount = count;
            _this._requiresFilter = true;
        }
    };

    proto.setFilters = function (filterCallbacks)
    {
        /// <summary>
        /// Sets the unfiltered item count and clears the collection. Used for virtualization scenarios.
        /// </summary>
        /// <param name="filterCallbacks" type="Array" optional="true">Set array of filter callbacks. Callbacks mus take an IBaseItem as input, and return true if item is visible.</param>

        var _this = this;

        _this._filters = filterCallbacks || [];

        _this._requiresFilter = true;
    };

    proto._updateFilteredSet = function (useUnfilteredIndex)
    {
        /// <summary>
        /// Updates the filtered set if necessary.
        /// </summary>
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true"></param>

        var _this = this;

        if (_this._requiresFilter && !useUnfilteredIndex)
        {
            _this._filteredGroups = [];
            _this._filteredIndexToActualIndex = {};
            _this._keyToFilteredIndex = {};

            var actualIndex = 0;
            var childCount = _this._childCount;
            var filterIndex = 0;
            var filters = _this._filters;

            var /* @type(wLive.Core.IBaseItemGroupData) */currentRealGrouping;
            var currentRealGroupingIndex = 0;
            var /* @type(wLive.Core.IBaseItemGroupData) */currentFilteredGrouping;

            // Setup the current real group
            if (/* @static_cast(Boolean) */_this.groupings && /* @static_cast(Boolean) */_this.groupings.length)
            {
                currentRealGrouping = _this.groupings[0];

                // Fix up the end index
                currentRealGrouping.endIndex = currentRealGrouping.startIndex + currentRealGrouping.count - 1;

                currentFilteredGrouping = {
                    groupingId: currentRealGrouping.groupingId,
                    name: currentRealGrouping.name,
                    startIndex: 0,
                    endIndex: 0,
                    count: 0
                };
            }

            for (_this._filteredCount = 0; actualIndex < childCount; actualIndex++)
            {
                var item = /* @static_cast(wLive.Core.IBaseItem) */_this._indexToItem[actualIndex];

                var itemVisible = true;

                for (filterIndex = 0; itemVisible && (filterIndex < filters.length); filterIndex++)
                {
                    itemVisible = filters[filterIndex](item);
                }

                if (itemVisible)
                {
                    _this._filteredIndexToActualIndex[_this._filteredCount] = actualIndex;

                    /* @static_cast(Boolean) */item && /* @static_cast(Boolean) */item.key && /* @static_cast(Boolean) */(_this._keyToFilteredIndex[item.key] = _this._filteredCount);

                    // Update groups end index and count
                    /* @static_cast(Boolean) */currentRealGrouping && /* @static_cast(Boolean) */currentFilteredGrouping.count++;

                    _this._filteredCount++;
                }

                // We are past the end of the current filtered group
                if (/* @static_cast(Boolean) */currentRealGrouping && actualIndex == currentRealGrouping.endIndex)
                {
                    // See if the current filtered group acutally had items
                    // and if so put it in the filtered group list
                    if (currentFilteredGrouping.count > 0)
                    {
                        // Update the end index
                        currentFilteredGrouping.endIndex = currentFilteredGrouping.startIndex + currentFilteredGrouping.count - 1;
                        _this._filteredGroups.push(currentFilteredGrouping);
                    }

                    // get the next real group
                    currentRealGrouping = _this.groupings[++currentRealGroupingIndex];

                    // Fix up the end index
                    /* @static_cast(Boolean) */currentRealGrouping && /* @static_cast(Boolean) */(currentRealGrouping.endIndex = currentRealGrouping.startIndex + currentRealGrouping.count - 1);

                    var endIndex = _this._filteredCount;

                    // Create the new filtered group
                    currentFilteredGrouping = {
                        groupingId: currentRealGrouping ? currentRealGrouping.groupingId : 'other',
                        name: currentRealGrouping ? currentRealGrouping.name : null,
                        startIndex: endIndex,
                        count: 0
                    };
                }
            }

            _this._requiresFilter = false;
        }
    };

    proto._invalidateHandler = function ()
    {
        /// <summary>
        /// The handles the invalidate event from an item.
        /// </summary>

        this.invalidate();
    };

    proto._removeItemHandler = function (item)
    {
        /// <summary>
        /// This handles the remove item event on an item.
        /// </summary>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to remove from the collection.</param>

        this.remove(item);
    };

    // This is observable since it fires the correct change event
    proto.__isObservable = true;

    proto.groupings = /* @static_cast(Array) */null;

    // Adds eventing to the item set
    var wLiveCoreEvents = wLiveCore.Events;
    proto.addListener = wLiveCore.Events.addListener;
    proto.removeListener = wLiveCoreEvents.removeListener;
    proto.disposeEvents = wLiveCoreEvents.disposeEvents;
    proto.raiseEvent = wLiveCoreEvents.raiseEvent;

    function hiddenItemsFilter(item)
    {
        /// <summary>
        /// Filters out hidden items. Returns false only if the item has an isVisible property explicitly set to false.
        /// </summary>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to compare.</param>
        /// <returns type="Boolean">True if visible or visibility can't be determined.</returns>

        return (!item || item.isVisible === undefined || item.isVisible);
    }

})();

/// Copyright (C) Microsoft Corporation. All rights reserved.

// Constants for creating set keys.
wLive.Core.JSONConstants =
{
    /// <summary>
    /// Constants for the sort and filter values for set keys.
    /// </summary>

    SortField:
    {
        Default: '0',
        Name: '1',
        ModifiedDate: '2',
        CreatedDate: '3',
        Size: '4',
        Type: '5',
        DateTaken: '6',
        Owner: '7',
        UserArranged: '8',
        LastOpened: '9',
        Relevancy: '10',
        DateDeleted: '11',
        OriginalLocation: '12'
    },

    SortDirection:
    {
        Default: '0',
        Ascending: '1',
        Descending: '2'
    },

    FilterType:
    {
        Albums: "1",
        Folder: "2",
        Favorites: "4",
        AllFolders: "7",
        PhotosAndVideos: "8",
        Documents: "16"
    }
};

(function ()
{
    var wLiveCore = wLive.Core;

    wLiveCore.SkyDriveItemSet = SkyDriveItemSet;

    // Collection for delay removing pinned header items.
    var s_headerItemsToBeRemoved = [];

    // Infinite scroll "overcount" used to enable scrolling past the end of the known results.
    s_infiniteScrollBuffer = 20;

    var c_traceCategory = "SkyDriveItemSet";

    /* @bind(wLive.Core.SkyDriveItemSet) */function SkyDriveItemSet(dataModel, parentItemKey, setKey)
    {
        /// <summary>
        /// SkyDriveItemSet is a subclass of ItemSet that represents a collection class of SkyDriveItem
        /// objects. When items are requested which are missing, we will automatically request them from
        /// the json service.
        /// </summary>
        /// <param name="dataModel" type="wLive.Core.IDataModel" >DataModel reference.</param>
        /// <param name="parentItemKey" type="String">Key to refer to item that this set belongs to.</param>
        /// <param name="setKey" type="String">The set key for the collection.</param>

        var _this = this;

        // Call the base constructor
        wLiveCore.ItemSet.apply(this);

        _this.modifiedDate = /* @static_cast(String) */-1;

        _this.groupings = null;
        _this._dataModel = dataModel;
        _this._parentItemKey = parentItemKey;
        _this._setKey = setKey;
        /* @disable(0092) */
        _this.setKeyParts = wLiveCore.SkyDriveItem.getSetKeyParts(setKey);
        /* @restore(0092) */
        _this._headerItemsSet = /* @static_cast(wLive.Core.ItemSet) */null;

        // Set up filter to also filter out real items that already exist in the header items set.
        _this._filters.push(headerItemsFilter);

        _this._type = "SkyDriveItemSet";

        function headerItemsFilter(item)
        {
            /// <summary>
            /// Filters out hidden items. Returns false only if the item has an isVisible property explicitly set to false.
            /// </summary>
            /// <param name="item" type="wLive.Core.IBaseItem">Item to compare.</param>
            /// <returns type="Boolean">True if item is not in the header items set.</returns>

            // return true if we don't have a header items set, or if the given item is not already in the set.
            var itemInHeaderItemsSet = (/* @static_cast(Boolean) */_this._headerItemsSet && /* @static_cast(Boolean) */item && _this._headerItemsSet.indexOf(item) !== -1);

            if (itemInHeaderItemsSet)
            {
                s_headerItemsToBeRemoved.push(
                    {
                        set: _this,
                        headerSet: _this._headerItemsSet,
                        item: item
                    });
            }

            return !itemInHeaderItemsSet;
        }
    };

    var _proto = SkyDriveItemSet.prototype = new wLiveCore.ItemSet();
    var _baseProto = wLiveCore.ItemSet.prototype;

    _proto.setHeaderItemsSet = function (itemSet)
    {
        /// <summary>
        /// Allows a separate item set to provide the initial items at the start of the list. This gives us
        /// the ability to store temporary items in a separate collection, and injecting them into our results
        /// without affecting the actual item set.
        /// </summary>
        /// <param name="itemSet" type="wLive.Core.ItemSet">Item set.</param>

        var _this = this;

        /* @disable(0092) */
        if (_this._headerItemsSet)
        {
            _this._headerItemsSet.removeListener("change", _this._invalidateHandler, _this);
        }
        /* @restore(0092) */

        _this._headerItemsSet = itemSet;

        /* @disable(0092) */
        itemSet.addListener("change", _this._invalidateHandler, _this, 'SkyDriveWeb_Internal_Framework_SkyDriveItemSet_ItemSetChanged');
        /* @restore(0092) */
    };

    _proto.isOutOfDate = function ()
    {
        /// <summary>
        /// Determines if the data set is out of date, by comparing its modifiedDate stamp with its parent's date.
        /// </summary>
        /// <returns type="Boolean">True if the item is out of date.</returns>

        var _this = this;

        /* @disable(0092) */
        var parent = _this.getParent(true);
        var parentHasExpired = /* @static_cast(Boolean) */parent && /* @static_cast(Boolean) */(parent.hasExpired() || parent.modifiedDate != _this.modifiedDate);
        /* @restore(0092) */

        // we are "out of date" if we don't know our parent, or the parent's modified date is not the same as the set's date.
        return parentHasExpired;
    };

    _proto.get = function (index, skipFetch, useUnfilteredIndex)
    {
        /// <summary>
        /// Gets the item at the specified index.
        /// </summary>
        /// <param name="index" type="Number">Index of item.</param>
        /// <param name="skipFetch" type="Boolean" optional="true">Skips fetching the index from the server if we don't know it.</param>
        /// <param name="useUnfilteredIndex" type="Boolean" optional="true">If specified as true, will treat the index as an unfiltered index.</param>
        /// <returns type="wLive.Core.ISkyDriveItem">Item at filtered index.</returns>

        var _this = this;

        var /* @type(wLive.Core.ISkyDriveItem) */item = null;
        var headerItemRequest = false;
        var itemMissingButInRange = false;

        // CoffeeMaker is having issues with inheritance and complains about member variables missing in this scenario.
        /* @disable(0092) */
        var dataModel = /* @static_cast(wLive.Core.IDataModel) */_this._dataModel;
        var key = _this._parentItemKey;
        var relationshipsKey = _this._setKey;
        var headerItemsSet = /* @static_cast(wLive.Core.SkyDriveItemSet) */_this._headerItemsSet;
        var childCount = _this.getCount(useUnfilteredIndex);
        var filteredIndexToActualIndex = _this._filteredIndexToActualIndex;
        var setIsOutOfDate = _this.isOutOfDate();
        /* @restore(0092) */

        // If we have header items, we need to adjust the index appropriately.
        if (/* @static_cast(Boolean) */headerItemsSet && headerItemsSet.getCount() > 0)
        {
            if (headerItemsSet.getCount() > index)
            {
                // we have header items and the index requested falls within the header item range. Return the header item.
                item = headerItemsSet.get(index);
                headerItemRequest = true;
            }
            else
            {
                // adjust the index and continue on.
                index -= headerItemsSet.getCount();
            }
        }

        // If we haven't fetched the item yet
        if (!headerItemRequest)
        {
            // Call base implementation. (NOTE we explicitly assume the items are SkyDriveItems and refer to the implementation
            // rather than the interface here, since we will access implementation specific methods.
            item = _baseProto.get.call(_this, index, useUnfilteredIndex);

            itemMissingButInRange = !item && (index >= 0) && (index < childCount);
        }

        // Fetch the page if the cached item is expired also
        if (item)
        {
            if (item.hasExpired())
            {
                setIsOutOfDate = true;

                // We need to expire the parent, which will force the dataModel to request the most recent data instead of possibly
                // a cached response (it will avoid passing the modifiedDate for the v param.)
                var parent = item.getParent(true);

                if (parent)
                {
                    parent.expire(false);
                }
            }
        }

        if (!skipFetch && (itemMissingButInRange || setIsOutOfDate))
        {
            if (dataModel.fetchItem(key, relationshipsKey, null, index))
            {
                Trace.log("get miss - index: " + index + ", exists: " + (!!item) + ", setExpired: " + setIsOutOfDate + ", setKey: " + relationshipsKey, c_traceCategory);
            }
        }

        // Because items may belong to multiple parents, ensure that the item being returned has the correct parent id.
        /* @static_cast(Boolean) */(item) && /* @static_cast(Boolean) */(item.parentKey = key);

        return /* @static_cast(wLive.Core.ISkyDriveItem) */item;
    };

    _proto.getCount = function (useUnfilteredCount)
    {
        /// <summary>
        /// Gets the count of the item set.
        /// </summary>
        /// <param name="useUnfilteredCount" type="Boolean" optional="true">This is true if you want the unfiltered count</param>
        /// <returns type="Number">The count of the item set.</returns>

        var _this = this;

        // CoffeeMaker is having issues with inheritance and complains about member variables missing in this scenario.
        /* @disable(0092) */
        var headerItemsSet = /* @static_cast(wLive.Core.SkyDriveItemSet) */_this._headerItemsSet;
        /* @restore(0092) */

        var count = /* @static_cast(Number) */_baseProto.getCount.call(_this, useUnfilteredCount);

        if (headerItemsSet)
        {
            count += headerItemsSet.getCount();
        }

        // If this set is out of date and we have no items to return, return 1 to force the caller to try to fetch the first item.
        /* @disable(0092) */
        _this.isOutOfDate() && !count && (count = 1);
        /* @restore(0092) */

        return count;
    };

    _proto.setCount = /* @bind(wLive.Core.SkyDriveItemSet) */function (count)
    {
        /// <summary>
        /// Sets the count of the item set.
        /// </summary>
        /// <param name="count" type="Number">The count to set on the OneDrive item set</param>

        var _this = this;

        /* @disable(0092) */
        var /* @type(wLive.Core.ISkyDriveItem) */parent = _this.getParent(true);
        /* @restore(0092) */

        if (/* @static_cast(Boolean) */parent && (parent.hasMoreResults === true || parent.hasMoreResults === false)) // respect flag if provided
        {
            var newCount = parent.folder.totalCount;
            var oldCount = _this._childCount;
            if (parent.hasMoreResults)
            {
                if (newCount <= oldCount)
                {
                    newCount = oldCount;
                }
                else
                {
                    // If there are more results, pad with extra items until we get a final count
                    // This enables "infinite" scroll
                    newCount += s_infiniteScrollBuffer;
                }
            }

            _this._childCount = _this._filteredCount = newCount;
            _this._requiresFilter = true;

            if (newCount < oldCount)
            {
                // we need to patch up the materialized count if we've shrunk the total count
                for (var i = oldCount - 1; i >= newCount; i--)
                {
                    if (_this._indexToItem[i])
                    {
                        _this._materializedCount--;
                    }

                    delete _this._indexToItem[i];
                }
            }
        }
        else
        {
            _baseProto.setCount.call(_this, count);
        }
    };

    _proto.getGroupings = function (useUnfilteredGroupings)
    {
        /// <summary>
        /// Gets the groupings array.
        /// </summary>
        /// <param name="useUnfilteredGroupings" type="Boolean" optional="true">This is true if we should return the unfiltered group data</param>
        /// <returns type="Array">The groupings array</returns>

        var _this = this;

        /* @disable(0092) */
        var headerItemsSet = /* @static_cast(wLive.Core.SkyDriveItemSet) */_this._headerItemsSet;
        /* @restore(0092) */

        var grouping;
        var groupings = /* @static_cast(Array) */_baseProto.getGroupings.call(_this, useUnfilteredGroupings);

        var count;

        // Modify the indexes if we have a header item set
        if (headerItemsSet)
        {
            count = headerItemsSet.getCount(useUnfilteredGroupings);

            if (count)
            {
                var newGroupings = [];

                if (groupings.length == 0 || groupings[0].groupingId != 'folder')
                {
                    // if the first grouping is not a folder
                    // we need to add a folder grouping for header items
                    newGroupings.push({
                        groupingId: 'folder',
                        startIndex: 0,
                        endIndex: count - 1,
                        count: count
                    });

                    // We need to copy the existing list
                    for (var i = 0; i < groupings.length; i++)
                    {
                        grouping = /* @static_cast(wLive.Core.IBaseItemGroupData) */groupings[i];

                        newGroupings.push({
                            groupingId: grouping.groupingId,
                            startIndex: grouping.startIndex + count,
                            endIndex: grouping.endIndex + count,
                            count: grouping.count
                        });
                    }
                }
                else
                {
                    // We need to copy the existing list 
                    for (var x = 0; x < groupings.length; x++)
                    {
                        grouping = /* @static_cast(wLive.Core.IBaseItemGroupData) */groupings[x];

                        newGroupings.push({
                            groupingId: grouping.groupingId,
                            name: grouping.name,
                            startIndex: grouping.startIndex ? grouping.startIndex + count : 0,
                            endIndex: grouping.endIndex + count,
                            count: grouping.groupingId == 'folder' ? grouping.count + count : grouping.count
                        });
                    }
                }

                groupings = newGroupings;
            }
        }

        // If there is a scenario where we don't have groups defined, we ensure there's at least an "other" group.
        /* @disable(0092) */
        count = this.getCount(useUnfilteredGroupings);
        /* @restore(0092) */

        if (/* @static_cast(Boolean) */count && !groupings.length)
        {
            groupings.push({
                groupingId: 'other',
                startIndex: 0,
                endIndex: count - 1,
                count: count
            });
        }

        return groupings;
    };

    _proto.getParent = function (skipFetch)
    {
        /// <summary>
        /// Gets the parent of the item set.
        /// </summary>
        /// <param name="skipFetch" type="Boolean">If this is true we will skip the fetch for the get item request</param>
        /// <returns type="wLive.Core.ISkyDriveItem">The parent item of the itemset, or null is returned</returns>

        var _this = this;

        /* @disable(0092) */
        var dataModel = /* @static_cast(wLive.Core.IDataModel) */_this._dataModel;
        return (dataModel ? dataModel.getItem(_this._parentItemKey, skipFetch) : null);
        /* @restore(0092) */
    };

    _proto.indexOf = function (item, getUnfiltered, skipFetch)
    {
        /// <summary>
        /// Gets the index of an item.
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to get the filtered index of.</param>
        /// <param name="getUnfiltered" type="Boolean" optional="true">Returns the unfiltered index.</param>
        /// <param name="skipFetch" type="Boolean" optional="true">Skips fetching the index from the server if we don't know it.</param>
        /// <returns type="Number">Index of item or -1 if the item doesn't exist in the collection.</returns>

        var _this = this;

        /* @disable(0092) */
        var headerItemsSet = /* @static_cast(wLive.Core.SkyDriveItemSet) */_this._headerItemsSet;
        /* @restore(0092) */

        // CoffeeMaker is having issues with inheritance and complains about member variables missing in this scenario.
        /* @disable(0092) */
        var dataModel = /* @static_cast(wLive.Core.IDataModel) */_this._dataModel;
        var key = _this._parentItemKey;
        var relationshipsKey = _this._setKey;
        var isOutOfDate = _this.isOutOfDate();
        /* @restore(0092) */

        var index = -1;

        if (headerItemsSet)
        {
            // The header item set is a regular item set, so skip fetch is not needed
            index = headerItemsSet.indexOf(item, getUnfiltered);
        }

        if (index == -1)
        {
            // Call base implementation.
            index = _baseProto.indexOf.call(_this, item, getUnfiltered);

            if (!skipFetch && (index === -1 || isOutOfDate))
            {
                if (dataModel.fetchItem(key, relationshipsKey, item.id, 0))
                {
                    Trace.log("indexOf miss - id: " + item.id + ", setExpired: " + isOutOfDate + ", setKey: " + relationshipsKey, c_traceCategory);
                }
            }

            if (headerItemsSet)
            {
                if (index !== -1)
                {
                    index += headerItemsSet.getCount(getUnfiltered);
                }
            }
        }

        return index;
    };

    _proto.remove = /* @bind(wLive.Core.SkyDriveItemSet) */function (item)
    {
        /// <summary>
        /// Removes a specific item.
        /// </summary>
        /// <param name="item" type="wLive.Core.IBaseItem">Item to remove from the collection.</param>       

        var _this = this;

        /* @disable(0053) */
        var index = _this.indexOf(item, true, true);
        /* @restore(0053) */

        if (index != -1)
        {
            _this.removeAt(index, true);
        }
    };

    _proto.clone = /* @bind(wLive.Core.SkyDriveItemSet) */function ()
    {
        /// <summary>
        /// Overwrites all properties of this itemSet with those of the passed in itemSet.
        /// </summary>

        var _this = this;

        var newItemSet = new wLiveCore.SkyDriveItemSet(_this._dataModel, _this._parentItemKey, _this._setKey);

        var baseGet = _baseProto.get;

        // copy grouping data
        newItemSet.groupings = this.groupings;

        for (var i = 0; i < _this.getCount(); i++)
        {
            var item = baseGet.call(_this, i);

            if (item)
            {
                newItemSet.set(i, item);
            }
        }

        newItemSet.modifiedDate = _this.modifiedDate;

        // copy header item set
        var headerItemSet = _this._headerItemsSet;
        var headerItemSetClone = new wLiveCore.ItemSet();

        for (i = 0; i < headerItemSet.getCount(); i++)
        {
            var headerItem = headerItemSet.get(i, /* skipFetch */true);
            if (headerItem)
            {
                headerItemSetClone.set(i, headerItem);
            }
        }

        /* @disable(0092) */
        newItemSet.setHeaderItemsSet(headerItemSetClone);
        /* @restore(0092) */

        return newItemSet;
    };

    _proto.isComplete = /* @bind(wLive.Core.SkyDriveItemSet) */function ()
    {
        /// <summary>
        /// Determines if all of the items in this set have been downloaded and are cached.
        /// </summary>
        /// <returns type="Boolean"></returns>

        var _this = this;

        return _this._materializedCount === _this._childCount;
    };

    _proto.sort = /* @bind(wLive.Core.SkyDriveItemSet) */function ()
    {
        /// <summary>
        /// Populates this item set with an exisiting complete itemSet.
        /// </summary>

        var _this = this;
        /* @disable(0092) */
        var /* @type(wLive.Core.IRelationshipsKeyParts) */setKeyParts = wLiveCore.SkyDriveItem.getSetKeyParts(_this._setKey);
        /* @restore(0092) */
        var children = [];

        for (var i = 0; i < _this.getCount(); i++)
        {
            var item = _this.get(i, /* skipFetch */true);

            Debug.assert(item, "You are trying to sort an incomplete itemSet.");

            children.push(item);
        }

        var sortedChildren = children.sort(function (itemA, itemB)
        {
            /// <param name="itemA" type="wLive.Core.ISkyDriveItem">Compare Item A.</param>
            /// <param name="itemB" type="wLive.Core.ISkyDriveItem">Compare Item B.</param>

            Debug.assert(itemA, "ItemA must be passed into the sort function.");
            Debug.assert(itemB, "ItemB must be passed into the sort function.");

            var sortReverse = setKeyParts.sr;

            if (setKeyParts.sd)
            {
                // Ascending sort for Size and Date Modified is sort reverse
                // These are the only ones we can do a client side sort on currently
                sortReverse = setKeyParts.sd == wLiveCore.JSONConstants.SortDirection.Default;
            }

            var first = sortReverse ? getField(itemA, setKeyParts.sb) : getField(itemB, setKeyParts.sb);
            var second = sortReverse ? getField(itemB, setKeyParts.sb) : getField(itemA, setKeyParts.sb);

            var sortValue = first - second;

            if (/* @static_cast(Boolean) */itemA.folder && !itemB.folder)
            {
                // a is folder and b isnt
                return -1; // move a up
            }
            else if (!itemA.folder && /* @static_cast(Boolean) */itemB.folder)
            {
                // b is folder and a isnt
                return 1; // move b up
            }
            else if ((/* @static_cast(Boolean) */itemA.video || /* @static_cast(Boolean) */itemA.photo) && !itemB.photo && !itemB.video)
            {
                // a is photo or video and b isnt
                return 1; // move b up
            }
            else if ((/* @static_cast(Boolean) */itemB.video || /* @static_cast(Boolean) */itemB.photo) && !itemA.photo && !itemA.video)
            {
                // b is photo or video and a isnt
                return -1; // move a up
            }

            return sortValue;

            function getField(item, sortField)
            {
                /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>

                var sortFields = wLiveCore.JSONConstants.SortField;

                switch (sortField)
                {
                    case sortFields.ModifiedDate: // Modified Date
                        return item.dateModifiedOnClient || /* @static_cast(String) */0;
                    case sortFields.CreatedDate: // Created Date
                        return item.creationDate || /* @static_cast(String) */0;
                    case sortFields.Size: // Size
                        return item.size || /* @static_cast(String) */0;
                }
            }
        });

        // Create and populate the new childSet.
        for (i = 0; i < sortedChildren.length; i++)
        {
            _this.set(i, sortedChildren[i]);
        }
    };

    wLiveCore.SkyDriveItemSet.removeMarkedHeaderItems = function ()
    {
        /// <summary>
        /// Removes items marked to be removed at a delayed time. (We only remove header items when the user navigates or re-sorts.)
        /// </summary>

        while (s_headerItemsToBeRemoved.length > 0)
        {
            /* @disable(0092)*/
            var pair = s_headerItemsToBeRemoved.pop();
            var set = pair.set;
            var headerSet = pair.headerSet;
            var item = pair.item;

            headerSet.remove(item);
            set._requiresFilter = true;
            /* @restore(0092)*/
        }
    };

    wLiveCore.SkyDriveItemSet.setInfiniteScrollBuffer = function (count)
    {
        /// <summary>
        /// Sets the buffer for infinite scrolling.
        /// </summary>
        /// <param name="count" type="Number">The desired infinite scroll buffer.</param>

        Debug.assert(count >= 0, "Infinite scrolling buffer cannot be negative.");

        s_infiniteScrollBuffer = count;
    };

    ///

})();

/// Copyright (C) Microsoft Corporation. All rights reserved.
(function ()
{
    var wLiveCore = wLive.Core;
    var getPCString = wLiveCore.AleHelpers.getPCString;
    var getString = wLiveCore.AleHelpers.getString;
    var BrowserStorage = wLiveCore.BrowserStorage;

    var c_rootParentId = "root";
    var c_defaultIconTypeName = "default";
    var c_defaultFolderIconTypeName = "NonEmptyDocumentFolder";
    var c_productNameString = wLive.Core.AleHelpers.getPCString("SkyDriveProductName");
    var c_instance = 0;
    var c_skyDriveItemTraceCategory = "SkyDriveItem";
    var c_localStorageAbdicatedItems = "SkyDrive.AbdicatedItems";

    var c_nextGeneratedId = 0;

    // Default list of commands for device-based items.
    var c_defaultDeviceItemCommands = "rd,1";

    // The time an item in cache will be considered "not expired". Expired items will be returned via getItem, but
    // for getItem calls we will re-fetch the item in the background.
    var c_itemTimeToLiveMilliseconds = 2 * 60 * 1000;

    // The time an item in cache will be considered "not expired", when an item has been marked as neverExpires.
    var c_neverExpireItemTimeToLiveMilliseconds = 100 * 60 * 60 * 1000;

    // Globals caching the key parts.
    var _keyParts = {};
    var _setKeyParts = {};
    var _defaultSetKey = /* @static_cast(String) */null;

    // Abdicated items from local storage.
    var _abdicatedItems = /* @static_cast(Array) */null;

    // Different format options available for creating new documents in skydrive.
    SkyDriveItem.DocumentFormat = {
        Default: 0,
        ODF: 1
    };

    // OneDrive item extended property options. 
    SkyDriveItem.ExtendedProperty = {
        Default: 0,
        MoSkyDocProperties: 1,
        QuotaInfo: 2
    };

    wLiveCore.SkyDriveItem = SkyDriveItem;

    /* @bind(wLive.Core.SkyDriveItem) */function SkyDriveItem(dataModel, key, parentKey)
    {
        /// <summary>
        /// Item represents a single item on SkyDrive.
        /// </summary>
        /// <param name="dataModel" type="wLive.Core.IDataModel" >DataModel reference.</param>
        /// <param name="key" type="String">Key to refer to this item.</param>
        /// <param name="parentKey" type="String">Key to refer to the item's parent.</param>

        Debug.assert(key != parentKey, "A SkyDriveItem was attempted to be created where the key == parentKey! This is horrible.");
        (key == parentKey) && /* @static_cast(Boolean) */(parentKey = null);

        var _this = this;

        _this.key = key;
        _this.instance = c_instance++;

        _this.keyParts = wLiveCore.SkyDriveItem.getItemKeyParts(key);
        _this.parentKey = parentKey;

        _this.id = _this.keyParts["id"];
        _this.did = /* @static_cast(String) */_this.keyParts["did"];

        _this.commands = null;
        _this.modifiedDate = /* @static_cast(String) */-1;
        _this.name = /* @static_cast(String) */null;
        _this.extension = /* @static_cast(String) */null;
        _this.ownerName = /* @static_cast(String) */null;
        _this.ownerCid = /* @static_cast(String) */null;
        _this.iconType = null;
        _this.isUnknownFileType = false;
        _this.folder = null;
        _this.sharingLevel = /* @static_cast(String) */null;
        _this.group = null;
        _this.hasPendingGroupJoinRequest = null,
        _this.userInvitedToGroupOnDifferentEmail = null,
        _this.partialData = null;
        _this.hasMoreResults = /* @static_cast(Boolean) */null;
        _this.neverExpires = null;
        _this.estimatedResultCount = null;
        _this.directlyShared = null;
        _this.snippet = null;
        _this.highlights = null;
        _this.tokenNeedsRedeeming = false;
        _this.video = /* @static_cast(wLive.Core.ISkyDriveVideo) */null;

        _this._isLoadingItem = false;
        _this._missingName = false;
        _this._expirationDate = 0;
        _this._dataModel = dataModel;
        _this._isNewFolder = false;
        _this._childSets = null;
        _this._headerItemsSet = /* @static_cast(wLive.Core.ItemSet) */null;

        _this._dataContext = null;

        _this._version = 0;
        _this.documentFormat = SkyDriveItem.DocumentFormat.Default;
    };

    var proto = wLiveCore.SkyDriveItem.prototype;

    proto.processItem = function (itemFromServer)
    {
        /// <summary>
        /// Processes a single item.
        /// </summary>
        /// <param name="itemFromServer" type="wLive.Core.ISkyDriveItem">Item from server.</param>
        /// <returns type="Boolean">If the item has changed since the last process (if modifiedDate has changed.)</returns>

        var _this = this;
        var hasChanged = false;

        // reset the new folder state.
        this._isNewFolder = false;

        // If the item from the server is newer than the one we have, evaluate it. (Otherwise, no-op.)
        if (itemFromServer.modifiedDate === undefined || itemFromServer.modifiedDate >= _this.modifiedDate)
        {
            preProcessItemFromServer(itemFromServer);

            // update the parent key since it could have changed (move scenario)
            if (this.parentKey)
            {
                var parentKeyParts = wLiveCore.SkyDriveItem.getItemKeyParts(this.parentKey);
                if (!parentKeyParts.qt && !parentKeyParts.did) // virtual views have special parent keys that need to remain intact
                {
                    this.parentKey = wLiveCore.SkyDriveItem.getItemKey(
                        itemFromServer.parentId,
                        parentKeyParts.cid,
                        parentKeyParts.group,
                        parentKeyParts.qt,
                        parentKeyParts.did,
                        parentKeyParts.q,
                        parentKeyParts.sft);
                }
            }

            /* @disable(0092) */
            var currentTotalCount = this.folder ? this.folder.totalCount : -1;
            /* @restore(0092) */
            var newTotalCount = itemFromServer.folder ? itemFromServer.folder.totalCount : -1;

            // Increment the version if the total count has changed
            if (itemFromServer.modifiedDate != _this.modifiedDate ||
                newTotalCount != currentTotalCount ||
                itemFromServer.sharingLevel != _this.sharingLevel)
            {
                _this._version++;
                hasChanged = true;
            }

            // remove children to prevent them from being included in the extend.
            var children = null;

            if (itemFromServer.folder)
            {
                children = itemFromServer.folder.children;
                delete itemFromServer.folder.children;
            }

            extend(_this, itemFromServer, 1);

            // add children back if necessary.
            (children) && (itemFromServer.folder.children = children);

            // Initialize sets for folders if necessary.
            if (itemFromServer.folder)
            {
                (!_this._childSets) && /* @static_cast(Boolean) */(_this._childSets = {});
                (!_this._headerItemsSet) && /* @static_cast(Boolean) */(_this._headerItemsSet = new wLiveCore.ItemSet());
            }

            // Mark name as missing.
            !itemFromServer.name && (_this._missingName = true);

            // Populate ownerName and ownerCid if missing.
            var isOwner = _this.isViewerOwner();

            (!_this.ownerName) && /* @static_cast(Boolean) */(_this.ownerName = isOwner ? FilesConfig.userDisplayName : '');
            (!_this.ownerCid) && /* @static_cast(Boolean) */(_this.ownerCid = _this.keyParts["cid"]);

            // If the item doesn't have an icon type, use a default.
            (!_this.iconType) && /* @static_cast(Boolean) */(_this.iconType = (itemFromServer.folder ? c_defaultFolderIconTypeName : c_defaultIconTypeName));

            // Items with the default icon are an unknown file type.
            _this.isUnknownFileType = wLiveCore.StringHelpers.caseInsensitiveStringEquals(_this.iconType, c_defaultIconTypeName);

            if (!!itemFromServer.docFormat && itemFromServer.docFormat == 1)
            {
                _this.documentFormat = SkyDriveItem.DocumentFormat.ODF;
            }
        }

        // Clear commands.
        _this._commands = null;

        // Set device commands to remove device only for now.
        if (!!_this.did)
        {
            _this.commands = c_defaultDeviceItemCommands + (_this.commands ? ("," + _this.commands) : "");
        }

        // Update expiration.
        // Items with neverExpires flag have a different expiration time than normal items.
        var expirationTime = _this.neverExpires ? c_neverExpireItemTimeToLiveMilliseconds : c_itemTimeToLiveMilliseconds;

        _this._expirationDate = new Date().getTime() + expirationTime;

        return hasChanged;
    };

    proto.updateItemProperties = function (properties, successCallback, failureCallback)
    {
        /// <summary>
        /// Update an item properties.
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to update.</param>
        /// <param name="properties" type="Object">The object of properties to pass to the update items call.</param>
        /// <param name="successCallback" type="Function">Callback called on success: function(response, item)</param>
        /// <param name="failureCallback" type="Function">Callback called on failure: function(response, item)</param>

        var _this = this;

        _this._dataModel.updateItemProperties(_this, properties, successCallback, failureCallback);
    };

    proto.updateItemProperty = function (propertyName, newValue, successCallback, failureCallback, overrideLock)
    {
        /// <summary>
        /// Update the item property.
        /// </summary>
        /// <param name="propertyName" type="String">The name of the property to update.</param>
        /// <param name="propertyValue" type="String">The new value of the property.</param>
        /// <param name="successCallback" type="Function">Callback called on success: function(response, item)</param>
        /// <param name="failureCallback" type="Function">Callback called on failure: function(response, item)</param>
        /// <param name="overrideLock" type="Boolean" optional="true">When true, forces an unlock before committing the update to the item.</param>

        var _this = this;

        if (this._isNewFolder && propertyName == "name")
        {
            _this.name = (newValue || '').trim();
            _this.invalidate();
            _this._dataModel.createSubfolder(_this.getParent(), _this, successCallback, failureCallback);
        }
        else
        {
            _this._dataModel.updateItemProperty(_this, propertyName, newValue, successCallback, failureCallback, overrideLock);
        }
    };

    proto.getExtendedInfo = function (successCallback, failureCallback, extendedProperty)
    {
        /// <summary>
        /// Retrieve the item with extended properties.
        /// </summary>
        /// <param name="successCallback" type="Function">Callback called on success: function(response)</param>
        /// <param name="failureCallback" type="Function">Callback called on failure: function(response)</param>
        /// <param name="extendedProperty" type="*">Enum representing the available extended property options.</param>

        var extendedPropertyParams;
        switch (extendedProperty)
        {
            case SkyDriveItem.ExtendedProperty.MoSkyDocProperties:
                extendedPropertyParams = "&with=davUrl,mimetype";
                break;
            case SkyDriveItem.ExtendedProperty.QuotaInfo:
                extendedPropertyParams = "";
                break;
            default:
                break;
        }

        this._dataModel.fetchItem(this.key, wLiveCore.SkyDriveItem.getSetKey(), null, 0, true, this.modifiedDate, successCallback, failureCallback, 0, extendedPropertyParams);
    };

    proto.hasExpired = function ()
    {
        /// <summary>
        /// Determines if the item has expired.
        /// </summary>
        /// <returns type="Boolean">True if the item has been manually expired (via item.expire())</returns>

        /* @disable(0092) */
        return !this.isPlaceholder && this._expirationDate < new Date().getTime();
        /* @restore(0092) */
    };

    proto.getVersion = function ()
    {
        /// <summary>
        /// Retrieves the version of the item, used for determining if the item has changed.
        /// </summary>
        /// <returns type="Number">Returns the version of the item.</returns>

        return this._version;
    };

    proto.getDisplayName = function (viewContext)
    {
        /// <summary>
        /// Retrieves the display name for of the item based on the item and the current view context.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext"></param>
        /// <returns type="String">Returns the name of the item.</returns>

        var _this = this;
        var name = _this.name;

        if (/* @static_cast(Boolean) */viewContext && !_this.parentKey) // root item.
        {
            if (_this.did) // device root item.
            {
                var device = /* @static_cast(wLive.Core.IDeviceItem) */viewContext.deviceItemSet.getByKey(_this.did.toLowerCase());
                name = device ? device.name : '';
            }
            else if (_this.isQt('search'))
            {
                name = getString("SearchResults").format(_this.getSearchQuery());
            }
            else if (_this.isQt('recyclebin'))
            {
                name = getString("RecycleBinLowerCase");
            }
            else // non-device root.
            {
                name = _this.ownerName ? getString("UsersSkyDrive").format(_this.ownerName) : c_productNameString;
            }
        }
        else
        {
            // If the item uses a default icon type and an extension is available, append the extension to the name.
            var extension = _this.extension;
            if (_this.isUnknownFileType && /* @static_cast(Boolean) */extension)
            {
                name += extension;
            }
        }

        return name;
    };

    proto.isViewerOwner = function ()
    {
        /// <summary>
        /// Determines if the logged in user is the owner of the file
        /// </summary>
        /// <returns type="Boolean">Is the logged in user is the owner of this file?</returns>

        var _this = this;

        return !_this.ownerCid || _this.ownerCid.toLowerCase() == FilesConfig.hcid.toLowerCase();
    };

    proto.isLoading = function ()
    {
        /// <summary>
        /// Returns true if the item is a loading item.
        /// </summary>
        /// <returns type="Boolean">True if loading item.</returns>

        return this._isLoadingItem;
    };

    proto.isWebPlayableVideo = function ()
    {
        /// <summary>
        /// Returns true if the item has a video property with attributes === 7.
        /// The value 7 means all 3 bits are set, 0001, 0010, and 0100. 
        ///     VideoFormat = bit 0001
        ///     AudioFormat = bit 0010
        ///     MimeType = bit 0100
        /// </summary>
        /// <returns type="Boolean">True if is web playable video.</returns>

        var _this = this;

        var isVideo = /* @static_cast(Boolean) */_this.video;

        var hasVideoAttributes = isVideo && /* @static_cast(Boolean) */_this.video.attributes;

        // if the video property doesn't have an attributes value, then check if it's from a device "did" === device id
        var hasPlayableAttributes = hasVideoAttributes ? _this.video.attributes === 7 : /* @static_cast(Boolean) */_this.did;

        return isVideo && hasPlayableAttributes;
    };

    proto.isQt = function (qt)
    {
        /// <summary>
        /// Determines if current item is part of the matched queryType.
        /// </summary>
        /// <param name="qt" type="String">QueryType to match against.</param>
        /// <returns type="Boolean">Is this item part of the supplied queryType?</returns>

        return wLiveCore.StringHelpers.caseInsensitiveStringEquals(this.keyParts['qt'], qt);
    };

    proto.getSearchQuery = function ()
    {
        /// <summary>
        /// Extracts the search query from the item.
        /// </summary>
        /// <returns type="String">The search query</returns>

        return /* @static_cast(String) */(this.keyParts['q'] || '');
    };

    proto.extendPartialData = function (successCallback)
    {
        /// <summary>
        /// Add additional data to the item.
        /// </summary>
        /// <param name="successCallback" type="wLive.Core.ISkyDriveItem -> void">Callback called on success: function(item)</param>

        var _this = this;

        // strip the search attributes out of the key in order to fetch the full item
        var /* @type(wLive.Core.ISkyDriveItemKeyParts) */keyParts = wLiveCore.SkyDriveItem.getItemKeyParts(_this.key);
        var fullKey = wLiveCore.SkyDriveItem.getItemKey(
                keyParts.id,
                keyParts.cid,
                parseInt(keyParts.group),
        /* queryType: */undefined,
                keyParts.did,
        /* searchQuery: */undefined,
        /* searchQueryFilter: */undefined);

        var fullItem = _this._dataModel.getItem(fullKey, /* skipFetch: */true);
        if (/* @static_cast(Boolean) */fullItem && !fullItem.hasExpired())
        {
            extendPartialData(_this, fullItem);
            successCallback(_this);
        }
        else
        {
            _this._dataModel.fetchItem(
                fullKey,
                wLiveCore.SkyDriveItem.getSetKey('0'),
                null,
                0,
                false,
                _this.modifiedDate,
                function (newItem)
                {
                    extendPartialData(_this, newItem);
                    successCallback(_this);
                });
        }

    };

    function extendPartialData(partialItem, fullItem)
    {
        /// <summary>
        /// Extend a partial item with data from a complete item.
        /// </summary>
        /// <param name="partialItem" type="wLive.Core.ISkyDriveItem">Partial item to extend.</param>
        /// <param name="fullItem" type="wLive.Core.ISkyDriveItem">Full item to clone from.</param>

        var parentKey = partialItem.parentKey;
        var key = partialItem.key;
        var snippet = partialItem.snippet;
        var highlights = partialItem.highlights;

        var keyParts = {};
        extend(keyParts, partialItem.keyParts, 1);
        extend(partialItem, fullItem, 1);
        delete partialItem.partialData;

        partialItem.parentKey = parentKey;
        partialItem.key = key;
        partialItem.keyParts = keyParts;
        partialItem.snippet = snippet;
        partialItem.highlights = highlights;
    }

    proto.getParent = function (skipFetch)
    {
        /// <summary>
        /// Retrieves the parent item if it exists.
        /// </summary>
        /// <param name="skipFetch" type="Boolean" optional="true">If false or not provided, will attempt to fetch the item if it doesn't exist.</param>
        /// <returns type="wLive.Core.ISkyDriveItem">True if the item has expired.</returns>

        var _this = this;

        return /* @static_cast(wLive.Core.ISkyDriveItem) */_this._dataModel.getItem(_this.parentKey, skipFetch);
    };

    proto.getChildren = function (setKey)
    {
        /// <summary>
        /// Retrieves the set of children for the given set key. If there isn't one, a new
        /// one will be created with a default child count of 1.
        /// </summary>
        /// <param name="setKey" type="String" optional="true">Which the set key to use to associate with the children.</param>
        /// <returns type="wLive.Core.SkyDriveItemSet">The correct set of children, or null if the item doesn't support child relationships.</returns>

        var _this = this;
        var childSets = this._childSets;
        var /* @type(wLive.Core.SkyDriveItemSet) */childSet = null;

        // If we have child sets, that means the item supports child relationships.
        if (childSets)
        {
            setKey = setKey || _defaultSetKey;

            childSet = childSets[setKey];

            if (!childSet)
            {
                // We check to see if there is a complete itemSet downloaded for this item. If there is we clone it and sort it.
                for (var childSetKey in childSets)
                {
                    // We have to use the same filterType as the one we're searching for.
                    if (wLiveCore.SkyDriveItem.getSetKeyParts(setKey).ft === wLiveCore.SkyDriveItem.getSetKeyParts(childSetKey).ft)
                    {
                        var tmpChildSet = /* @static_cast(wLive.Core.SkyDriveItemSet) */childSets[childSetKey];
                        // Only some of the fields are sortable. We can fake sort on the other columns when there is only 1 item.
                        var setKeyParts = wLiveCore.SkyDriveItem.getSetKeyParts(setKey);

                        if ((wLiveCore.ClientSortableFields[setKeyParts.sb] && setKeyParts.sd != wLiveCore.JSONConstants.SortDirection.Default) || tmpChildSet._childCount === 1)
                        {
                            /* @disable(0092) */
                            if (tmpChildSet.isComplete() && false)
                            {
                                childSet = childSets[setKey] = tmpChildSet.clone();
                                childSet._setKey = setKey;
                                childSet.setKeyParts = $Utility.deserialize(setKey, "&", false, false);
                                if (tmpChildSet._childCount > 1)
                                {
                                    childSet.sort();
                                }
                                break;
                            }
                            /* @restore(0092) */
                        }
                    }
                }

                // Otherwise, we create an empty childset with a non-deterministic child count.
                if (!childSet)
                {
                    childSet = childSets[setKey] = new wLiveCore.SkyDriveItemSet(_this._dataModel, _this.key, setKey);

                    var /* @type(wLive.Core.IRelationshipsKeyParts) */setKeyParts2 = wLiveCore.SkyDriveItem.getSetKeyParts(setKey);

                    // for non filters or folder only filters, support pinned folders.
                    if (!setKeyParts2 || !setKeyParts2.ft || setKeyParts2.ft !== wLiveCore.JSONConstants.FilterType.PhotosAndVideos)
                    {
                        // We disable this because coffeemaker things SkyDriveItemSet is an ItemSet and can't handle subclasses.
                        /* @disable(0092) */
                        childSet.setHeaderItemsSet(_this._headerItemsSet);
                        /* @restore(0092) */
                    }

                    // Add any filters to the childSet
                    addFilters(childSet, this.keyParts);
                }
            }

            // If the child set is not fresh, ensure that the count is what we expect.            
            if (childSet.modifiedDate === /* @static_cast(String) */-1)
            {
                childSet.setCount(getExpectedChildCount(_this.folder, setKey));
            }
        }

        return childSet;
    };

    proto.remove = function ()
    {
        /// <summary>
        /// Removes this element from all of the collections its part of.
        /// </summary>

        this.raiseEvent("removeItem", this);
    };

    proto.setVisibility = function (isVisible)
    {
        /// <summary>
        /// Sets the visibility of the item and fires the appropriate change events.
        /// </summary>
        /// <param name="isVisible" type="Boolean">True indicates the item should be visible.</param>

        var _this = this;

        _this.isVisible = isVisible;

        // This will cause listeners of the item to update.
        _this.raiseEvent("change");
    };

    proto.getVisibility = function ()
    {
        /// <summary>
        /// Gets the visibility of the item.
        /// </summary>
        /// <returns type="Boolean">If the item is visible</returns>

        var _this = this;

        return _this.isVisible === undefined || _this.isVisible;
    };

    proto.invalidate = function (suppressVersionIncrement)
    {
        /// <summary>
        /// Invalidates the item; increments the version number and fires change events.
        /// </summary>
        /// <param name="suppressVersionIncrement" type="Boolean" optional="true"></param>
        var _this = this;

        // Increment version to cause invalidation.
        if (!suppressVersionIncrement)
        {
            _this._version++;
        }

        var item = _this;

        _this.raiseEvent("change");

        while (item)
        {
            _this._dataModel._fireDataChanged(item);
            item = item.getParent(true);
        }
    };

    proto.expire = function (expireAllAncestors)
    {
        /// <summary>
        /// Sets the item to an expired state.
        /// </summary>
        /// <param name="expireAllAncestors" type="Boolean" optional="true">If true, will expire ancestors as well.</param>

        var _this = this;

        _this._expirationDate = -1;

        if (expireAllAncestors)
        {
            var parent = _this.getParent(true);
            parent && parent.expire(true);
        }

        // abort pending requests for this item.
        _this._dataModel.abortPendingRequests(_this.key);
    };

    proto.getHasSubfolders = function ()
    {
        /// <summary>
        /// Checks if the item has subfolders.
        /// </summary>

        /* @disable(0092) */
        var hasSubfolders = /* @static_cast(Boolean) */this.folder && this.folder.hasSubfolders;
        /* @restore(0092) */

        return hasSubfolders || (/* @static_cast(Boolean) */this._headerItemsSet && this._headerItemsSet.getCount() > 0);
    };

    proto.createPinnedSubfolder = function ()
    {
        /// <summary>
        /// Creates a pinned subfolder.
        /// </summary>
        /// <returns type="wLive.Core.ISkyDriveItem">The pinned subfolder.</returns>

        var _this = this;

        var pinnedFolder = /* @static_cast(wLive.Core.ISkyDriveItem) */null;

        if (_this._headerItemsSet)
        {
            var id = 'NewFolder' + (c_nextGeneratedId++);

            pinnedFolder = new SkyDriveItem(this._dataModel, wLiveCore.SkyDriveItem.getItemKey(id), this.key);

            pinnedFolder.processItem(
            {
                folder: { totalCount: 0, childCount: 0 },
                name: FilesConfig.defaultFolderString, // this should be getPCString("NewFolderDefaultName") but we've hit text freeze.
                commands: 'rn,1',
                group: _this.group,
                cid: _this.ownerCid,
                ownerName: _this.ownerName,
                sharingLevel: _this.sharingLevel,
                _isNewFolder: true
            });

            Trace.log("Creating a pinned subfolder under: " + this.key, c_skyDriveItemTraceCategory);

            _this._headerItemsSet.insert(0, pinnedFolder);
            _this._headerItemsSet.invalidate();
        }

        return /* @static_cast(wLive.Core.ISkyDriveItem) */pinnedFolder;
    };

    proto.removePinnedSubfolder = function (pinnedSubfolder)
    {
        /// <summary>
        /// Removes the pinned subfolder.
        /// </summary>
        /// <param name="pinnedSubfolder" type="wLive.Core.SkyDriveItem">Pinned subfolder.</param>

        var _this = this;
        var headerItemsSet = _this._headerItemsSet;

        if (headerItemsSet)
        {
            headerItemsSet.remove(pinnedSubfolder);
            headerItemsSet.invalidate();
        }
    };

    proto.updatePinnedSubfolderKey = function (pinnedSubfolder)
    {
        /// <summary>
        /// Updates the pinned item's key after its key has been updated.
        /// </summary>
        /// <param name="pinnedSubfolder" type="wLive.Core.ISkyDriveItem">Pinned item.</param>

        var _this = this;

        var updatedItem = false;

        if (_this._headerItemsSet)
        {
            var index = _this._headerItemsSet.indexOf(pinnedSubfolder);

            if (index >= 0)
            {
                _this._headerItemsSet.remove(pinnedSubfolder);
                pinnedSubfolder.key = wLiveCore.SkyDriveItem.getItemKey(pinnedSubfolder.id, pinnedSubfolder.ownerCid, pinnedSubfolder.group, null, null);
                pinnedSubfolder.keyParts = wLiveCore.SkyDriveItem.getItemKeyParts(pinnedSubfolder.key);

                /* @disable(0092) */
                pinnedSubfolder.clearItemSets();
                /* @restore(0092) */

                _this._headerItemsSet.insert(index, pinnedSubfolder);
                _this._headerItemsSet.invalidate();

                updatedItem = true;
            }
        }

        if (!updatedItem)
        {
            pinnedSubfolder.key = wLiveCore.SkyDriveItem.getItemKey(pinnedSubfolder.id, pinnedSubfolder.ownerCid, pinnedSubfolder.group, null, null);
            pinnedSubfolder.keyParts = wLiveCore.SkyDriveItem.getItemKeyParts(pinnedSubfolder.key);

            /* @disable(0092) */
            pinnedSubfolder.clearItemSets();
            /* @restore(0092) */
        }
    };

    proto.clearItemSets = function ()
    {
        /// <summary>
        /// Clears item sets if they exist.
        /// </summary>

        var _this = this;

        if (_this._childSets !== null)
        {
            // We need to call clear on each child set to make sure event handlers are removed
            for (var x in _this._childSets)
            {
                _this._childSets[x].clear();
            }

            _this._childSets = {};
        }
    };

    proto.getDevice = function ()
    {
        /// <summary>
        /// This returns the device for the item or null.
        /// </summary>
        /// <returns type="wLive.Core.IDeviceItem">The device item for this OneDrive item.</returns>

        var _this = this;

        var /* @type(wLive.Core.IDeviceItem) */device = null;

        /* @disable(0092) */
        if (_this.keyParts.did)
        {
            var deviceItemSet = wLiveCore.PageController.getInstance().getViewContext().deviceItemSet;
            device = deviceItemSet.getByKey(_this.keyParts.did.toLowerCase());
        }
        /* @restore(0092) */

        return device;
    };

    proto.getDeviceBaseUrl = function ()
    {
        /// <summary>
        /// This returns the device base url or null.
        /// </summary>
        /// <returns type="String">The device base url for this item.</returns>

        var _this = this;
        var baseUrl = /* @static_cast(String) */null;

        var /* @type(wLive.Core.IDeviceItem)*/device = _this.getDevice();

        if (device)
        {
            baseUrl = device.baseUrl;
        }

        return /* @static_cast(String) */(baseUrl || FilesConfig.devicesBaseUrl);
    };

    // This is observable since it fires the correct change event
    proto.__isObservable = true;

    function extend(targetObject, sourceObject, maxDepth)
    {
        /// <summary>
        /// Extends the targetObject with the sourceObject, given a max depth.
        /// </summary>
        /// <param name="targetObject" type="Object">Object to extend.</param>
        /// <param name="sourceObject" type="Object">Object to copy from.</param>
        /// <param name="maxDepth" type="Number">Number of depths to recursively extend. 0 implies a shallow copy.</param>

        for (var property in sourceObject)
        {
            var propertyValue = sourceObject[property];

            if (propertyValue && typeof propertyValue == "object" && !Object.isArray(propertyValue) && maxDepth > 0)
            {
                var targetPropertyObject = targetObject[property] = targetObject[property] || {};

                extend(targetPropertyObject, propertyValue, maxDepth - 1);
            }
            else
            {
                targetObject[property] = propertyValue;
            }
        }
    }

    function abdicatedItemsFilter(item)
    {
        /// <summary>
        /// Filters out abdicated items.
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to compare.</param>
        /// <returns type="Boolean">True if item is not stored as abdicated.</returns>

        if (/* @static_cast(Boolean) */_abdicatedItems && /* @static_cast(Boolean) */item)
        {
            // Hide abdicated items
            for (var i = 0; i < _abdicatedItems.length; i++)
            {
                if (item.id === _abdicatedItems[i].id)
                {
                    return false;
                }
            }
        }

        return true;
    }

    function addFilters(itemSet, keyParts)
    {
        /// <summary>
        /// Adds filters to the SkyDriveItemSet
        /// </summary>
        /// <param name="itemSet" type="wLive.Core.SkyDriveItemSet">The item set to add filters to.</param>
        /// <param name="keyParts" type="wLive.Core.ISkyDriveItemKeyParts">The key parts for current item.</param>

        if (keyParts.qt == 'shared')
        {
            if (!_abdicatedItems)
            {
                _abdicatedItems = BrowserStorage.getLocalValue(c_localStorageAbdicatedItems);

                if (_abdicatedItems)
                {
                    // Remove expired items from localStorage
                    var now = new Date();

                    for (var i = 0; i < _abdicatedItems.length; i++)
                    {
                        var /* @dynamic */item = _abdicatedItems[i];

                        if (new Date(/* @static_cast(String) */item.expire) < now)
                        {
                            _abdicatedItems.splice(i, 1);
                            i--;
                        }
                    }

                    BrowserStorage.setLocalValue(c_localStorageAbdicatedItems, _abdicatedItems);
                }
            }

            itemSet._filters.push(abdicatedItemsFilter);
        }
    }

    function preProcessItemFromServer(item)
    {
        /// <summary>
        /// Pre-process an item from the server before processing it. Clear variables as necessary.
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to process.</param>

        var folder = item.folder;

        if (folder)
        {
            folder.covers = folder.covers || null;

            // Make sure hasSubfolders is defined, since it isn't returned if subfolders don't exist (which is the case after we
            // delete the last subfolder of a parent.)
            folder.hasSubfolders = folder.hasSubfolders ? true : false;
        }

        // Make sure this is set since it changes from true to undefined.
        item.isProcessingVideo = item.isProcessingVideo || false;
    }

    function getExpectedChildCount(folder, setKey)
    {
        /// <summary>
        /// Gets the expected count for the set, based on the currently set folder properties.
        /// </summary>
        /// <param name="folder" type="wLive.Core.ISkyDriveFolder">Folder to inspect.</param>
        /// <param name="setKey" type="String">Set key.</param>
        /// <returns type="Number">Expected child count, or 1 if it can't be determined.</returns>

        var filterTypes = wLiveCore.JSONConstants.FilterType;
        var expectedCount = folder.totalCount;
        var setKeyParts = wLiveCore.SkyDriveItem.getSetKeyParts(setKey);
        var childFilter = setKeyParts ? setKeyParts["ft"] : '';

        if (childFilter == filterTypes.AllFolders)
        {
            expectedCount = (folder.folderCount !== undefined ? folder.folderCount : (folder.hasSubfolders ? 1 : 0));
        }
        else if (childFilter == filterTypes.PhotosAndVideos && folder.photoCount !== undefined)
        {
            expectedCount = folder.photoCount;
        }

        return expectedCount !== undefined ? expectedCount : 1;
    }

    wLiveCore.SkyDriveItem.getItemKey = function (id, ownerCid, isGroup, queryType, deviceId, searchQuery, searchFilterType)
    {
        /// <summary>
        /// Gets the key of an item, which is used for uniquely identifying the item in memory
        /// cache, or generating the url to fetch the item from the server.
        /// </summary>
        /// <param name="id" type="String" optional="true">Resource id of item. If null, root is assumed.</param>
        /// <param name="ownerCid" type="String" optional="true">Cid of the owner. If null, the caller cid is assumed.</param>
        /// <param name="isGroup" type="Boolean" optional="true">Specifies if its a group cid. If null, assumes its not a group cid.</param>
        /// <param name="queryType" type="String" optional="true">Query type ("folder", "mru", etc). If null, defaults to "folder".</param>
        /// <param name="deviceId" type="String" optional="true">Device id, defaults to SkyDrive.</param>
        /// <param name="searchQuery" type="String" optional="true">Search query string.</param>
        /// <param name="searchFilterType" type="String" optional="true">Search filter type (should be '8' for 1up or undefined otherwise).</param>
        /// <returns type="String">The key for the item.</returns>

        var key =
        {
            /* @type(String) */id: (id || c_rootParentId),                               // default to blank id. assume case sensitive.
            /* @type(String) */cid: (ownerCid || ('' + FilesConfig.hcid)).toLowerCase(), // default to caller as owner if not specified
            /* @type(String) */group: (Number(isGroup) ? "1" : "0"),                     // default to not a group cid
            /* @type(String) */qt: (queryType || '').toLowerCase(),                      // "folder" default
            /* @type(String) */did: (deviceId || ''),
            /* @type(String) */q: (searchQuery || ''),
            /* @type(String) */sft: (searchFilterType || '')
        };

        // If this is not a device, we can assume lowercase. Device items have case sensitive ids.
        if (!deviceId)
        {
            key.id = key.id.toLowerCase();
        }

        var keyString =
                "id=" + key.id.encodeUrl() +
                "&cid=" + key.cid.encodeUrl() +
                "&group=" + key.group.encodeUrl() +
                "&qt=" + key.qt.encodeUrl();

        if (deviceId)
        {
            keyString += "&did=" + key.did.encodeUrl();
        }

        if (searchQuery)
        {
            keyString += "&q=" + key.q.encodeUrl();
        }

        if (searchFilterType)
        {
            keyString += "&sft=" + key.sft.encodeUrl();
        }

        _keyParts[keyString] = key;

        return keyString;
    };

    wLiveCore.SkyDriveItem.getItemKeyParts = function (key)
    {
        /// <summary>
        /// Gets the deserialized version of the key.
        /// </summary>
        /// <returns type="wLive.Core.ISkyDriveItemKeyParts">Value of the property</returns>

        var /* @type(wLive.Core.ISkyDriveItemKeyParts) */keyParts = _keyParts[key];

        if (!keyParts)
        {
            var /* @type(wLive.Core.ISkyDriveItemKeyParts)*/tempKeyParts = $Utility.deserialize(key, "&", false, false);

            // Fetch the key again
            wLiveCore.SkyDriveItem.getItemKey(
                tempKeyParts.id,
                tempKeyParts.cid,
                parseInt(tempKeyParts.group),
                tempKeyParts.qt,
                tempKeyParts.did,
                tempKeyParts.q,
                tempKeyParts.sft);

            keyParts = _keyParts[key];
        }

        Debug.assert(keyParts, "getItemKeyParts was called with a key that wasn't created by getItemKey: " + key);

        return keyParts;
    };

    wLiveCore.SkyDriveItem.getSetKey = function (sortBy, sortReverse, filterType, groupings, sortDirection)
    {
        /// <summary>
        /// Creates a set key used to identify a child set.
        /// </summary>
        /// <param name="sortBy" type="String" optional="true">Sort by field.</param>
        /// <param name="sortReverse" type="Boolean" optional="true">Sort reverse. (This is deprecated)</param>
        /// <param name="filterType" type="String" optional="true">Filter type, comma delimited. ("d,f" for docs+folders, "p" for photos/videos, etc). If null, defaults to no filter.</param>
        /// <param name="groupings" type="String" optional="true">groupings, semicolon delimited. If null, defaults to folder, document, photo groupings.</param>
        /// <param name="sortDirection" type="String" optional="true">The sort direction value. (0 = default, 1 = ascending, 2 = descending)</param>
        /// <returns type="String">Set key.</returns>

        var setKeyParts = /* @static_cast(wLive.Core.IRelationshipsKeyParts) */(_setKeyParts[_defaultSetKey] || {});
        var /* @type(String) */sb = sortBy || setKeyParts.sb || '0';
        var isSortReversePassed = (sortReverse !== null && sortReverse !== undefined);
        var isSortReverse = isSortReversePassed ? sortReverse : setKeyParts.sr;
        var /* @type(String) */sr = Number(isSortReverse) ? '1' : '0';
        var /* @type(String) */ft = filterType || '';
        groupings = groupings || '0,1,2'; // Defaults to folder, document, photo
        sortDirection = sortDirection || '0';

        var setKey =
            "ft=" + ft.encodeUrl() +    // "a" all filter default
            "&sb=" + sb.encodeUrl() +   // 0 sortby default
            (isSortReversePassed ? "&sr=" + sr : '') + // defaults to not reversed
            (!isSortReversePassed ? "&sd=" + sortDirection : '') + // defaults to not reversed
            "&gb=" + groupings.encodeUrl();

        // Update lookup for parts.
        _setKeyParts[setKey] =
        {
            ft: ft,
            sb: sb,
            gb: groupings
        };

        if (isSortReversePassed)
        {
            _setKeyParts[setKey].sr = isSortReverse;
        }
        else
        {
            _setKeyParts[setKey].sd = sortDirection;
        }

        return setKey;
    };

    wLiveCore.SkyDriveItem.getSetKeyParts = function (setKey)
    {
        /// <summary>
        /// Gets the set key parts of the given set key, or the current default set key if none is provided.
        /// </summary>
        /// <param name="setKey" type="String" optional="true">Set key.</param>
        /// <returns type="wLive.Core.IRelationshipsKeyParts">Set key parts.</returns>

        setKey = setKey || _defaultSetKey;

        return _setKeyParts[setKey];
    };

    wLiveCore.SkyDriveItem.setDefaultSetKey = function (setKey)
    {
        /// <summary>
        /// Sets the default set key to be used for getting/setting sets of children for items.
        /// </summary>
        /// <param name="setKey" type="String">Set key.</param>

        _defaultSetKey = setKey;
    };

    wLiveCore.SkyDriveItem.getDefaultSetKey = function ()
    {
        /// <summary>
        /// Gets the default set key.
        /// </summary>
        /// <returns type="String">Set key.</returns>

        return _defaultSetKey;
    };

    wLiveCore.SkyDriveItem.areItemsSame = function (currentItem, newItem, strictMode)
    {
        /// <summary>
        /// Helper function to determine if both items are the same
        /// </summary>
        /// <param name="currentItem" type="wLive.Core.ISkyDriveItem">Item to check</param>
        /// <param name="newItem" type="wLive.Core.ISkyDriveItem">Item to check</param>
        /// <param name="strictMode" type="Boolean" optional="true">If true then we do additional checks on other properties that could have changed (name, commands)</param>
        /// <returns type="Boolean">Returns true if the items are the same item</returns>

        if (currentItem && newItem)
        {
            // Strict mode is used for controls that need to test other properties that may have changed, depending on the call
            var strictModeValue = !strictMode || (currentItem.commands === newItem.commands && currentItem.name === newItem.name);

            return currentItem.key === newItem.key && currentItem.modifiedDate === newItem.modifiedDate && strictModeValue;
        }
        else
        {
            // they are not the same if either is null or undefined
            return false;
        }
    };

    wLiveCore.SkyDriveItem.IsFolderWithCovers = function (item)
    {
        /// <summary>
        /// Helper function to determine if an item is a folder with covers.
        /// This allows us to show the item tile with a big photo stretched across it.
        /// This is used by info pane and item tile.
        /// Note an empty album is different.
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to check</param>

        return /* @static_cast(Boolean) */item && /* @static_cast(Boolean) */item.folder && item.folder.covers;
    };

    // SortFields that are sortable.
    wLiveCore.ClientSortableFields =
    {
        2: true, // DateModified
        3: true, // CreatedDate
        4: true // Size
    };

    // QuotaStatus enum values
    wLiveCore.QuotaStatus =
    {
        Normal: 0,
        Nearing: 1,
        Exceeded: 2
    };

    // Enum for targeted takedown restriction status
    wLiveCore.ItemStatus =
    {
        Active: 0,
        Restricted: 1,
        RestrictedICN: 2
    };

    // Enum for targeted takedown review state
    wLiveCore.ReviewState =
    {
        NotReviewed: 0,
        AutoReviewed: 1,
        AgentReviewed: 2,
        Challenged: 3,
        ChallengeReviewed: 4
    };

    // Initialize the setkey with a default set key.
    _defaultSetKey = wLiveCore.SkyDriveItem.getSetKey();

    // Adds eventing to the OneDrive item
    var wLiveCoreEvents = wLiveCore.Events;
    proto.addListener = wLiveCore.Events.addListener;
    proto.removeListener = wLiveCoreEvents.removeListener;
    proto.disposeEvents = wLiveCoreEvents.disposeEvents;
    proto.raiseEvent = wLiveCoreEvents.raiseEvent;

    // Stubs for testing.
    ///
})();

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

/// ************************************************************************
/// This file contains all of the helpers that DONT HAVE jQuery dependencies
/// ************************************************************************

(function ()
{
    var wLiveCore = wLive.Core;
    var getPCString = wLiveCore.AleHelpers.getPCString;

    var c_traceCategory = "SkyDriveItemHelper";
    Trace.register(c_traceCategory, { isEnabled: false });

    var c_stringEmpty = '';
    var c_timeSeperator = ':';
    var c_oneSecond = 1000; // 1 second = 1000
    var c_oneMinute = 60000; // 1 minute = 60 * 1000 = 60000
    var c_oneHour = 3600000; // 1 hour = 60 * 60 * 1000 = 3600000

    /* This is the percentage of area we allow as wiggle room for image coverage when picking a thumbnail to render in the available space. */
    var c_thumbnailUpscaleAllowance = .85;

    var c_alePCPrefix = 'live.shared.skydrive.pc.';
    var c_aleMobilePrefix = 'live.shared.skydrive.mobile.';

    // Audio download url query
    var c_audioUrlQueryParams = '&videoplayer=skysl';

    var c_root = 'root';
    var c_photomailPrefix = 'photomail_';

    // IconType to FileType mapping, for types with a corresponding PC.FileType.* string
    var c_folder = 'Folder';
    var c_doc = 'Doc';
    var c_one = 'One';
    var c_ppt = 'Ppt';
    var c_xls = 'Xls';
    var c_vsd = 'Vsd';
    var c_lib = 'Lib';
    var c_drive = 'Drive';
    var c_cdDrive = 'CDDrive';
    var c_usbDrive = 'USBDrive';
    var c_extDrive = 'ExtDrive';
    var c_netDrive = 'NetDrive';
    var c_brDrive = 'BrDrive';

    var c_iconTypeToFileType =
        {
            WinDocuments: c_lib,
            WinLibrary: c_lib,
            WinMusic: c_lib,
            WinPictures: c_lib,
            WinPodcastLibrary: c_lib,
            WinVideos: c_lib,
            WinDrive: c_drive,
            CDDrive: c_cdDrive,
            GenericDrive: c_drive,
            UsbDrive: c_usbDrive,
            ExternalDrive: c_extDrive,
            NetworkStorage: c_netDrive,
            Accdb: "Mdb",
            Doc: c_doc,
            Docm: c_doc,
            Docx: c_doc,
            Dot: c_doc,
            Dotm: c_doc,
            Dotx: c_doc,
            Exe: "Exe",
            Html: "Html",
            Mdb: "Mdb",
            Mpp: "Mpp",
            Mpt: "Mpp",
            Odp: c_ppt,
            Ods: c_xls,
            Odt: c_doc,
            One: c_one,
            Onepkg: c_one,
            Onetoc2: c_one,
            Notebook: "OneNotebook",
            Pot: c_ppt,
            Potm: c_ppt,
            Potx: c_ppt,
            Ppa: c_ppt,
            Ppam: c_ppt,
            Pps: c_ppt,
            Ppsm: c_ppt,
            Ppsx: c_ppt,
            Ppt: c_ppt,
            Pptm: c_ppt,
            Pptx: c_ppt,
            Pub: "Pub",
            Rtf: "Rtf",
            Txt: "Txt",
            Vdw: c_vsd,
            Vsd: c_vsd,
            Vsdm: c_vsd,
            Vsdx: c_vsd,
            Vsl: c_vsd,
            Vss: c_vsd,
            Vssm: c_vsd,
            Vssx: c_vsd,
            Vst: c_vsd,
            Vstm: c_vsd,
            Vstx: c_vsd,
            Xaml: "Xaml",
            Xla: c_xls,
            Xlam: c_xls,
            Xll: c_xls,
            Xls: c_xls,
            Xlsb: c_xls,
            Xlsm: c_xls,
            Xlsx: c_xls,
            Xlt: c_xls,
            Xltm: c_xls,
            Xltx: c_xls,
            Xml: "Xml",
            Xps: "Xps",
            Xsn: "Xsn",
            Zip: "Zip"
        };

    wLive.Core.SkyDriveItemHelper =
    {
        duration: function (duration)
        {
            /// <summary>
            /// Returns a string to represent the video duration
            /// </summary>
            /// <param name="duration" type="Number">duration</param>
            /// <returns type="String">Duration UI string</returns>

            Debug.assert(duration !== undefined, 'Duration must be defined');
            Debug.assert(duration >= 0, 'Duration must be positive number');

            var durationString = c_stringEmpty;
            var outputStarted = false;

            if (duration >= c_oneHour)
            {
                var hours = Math.floor(duration / c_oneHour);
                duration = duration % c_oneHour;

                durationString += hours + c_timeSeperator;
                outputStarted = true;
            }

            var minutes = Math.floor(duration / c_oneMinute);
            duration = duration % c_oneMinute;

            if (minutes < 10 && outputStarted)
            {
                // Output leading 0 if we had an hour.
                durationString += '0';
            }

            durationString += minutes + c_timeSeperator;

            var seconds = Math.floor(duration / c_oneSecond);

            if (seconds < 10)
            {
                durationString += '0';
            }

            durationString += seconds;

            return durationString;
        },
        getThumbnail: function (thumbnailSet, name)
        {
            /// <summary>
            /// Pick a thumbnail by name.
            /// </summary>
            /// <param name="thumbnailSet" type="wLive.Core.ISkyDriveThumbnailSet">Thumbnails object</param>
            /// <param name="name" type="String">Thumbnail name.</param>
            /// <returns type="wLive.Core.ISkyDriveThumbnail">Thumbnail</returns>

            Debug.assert(thumbnailSet, 'Thumbnails object must not be null');

            var thumbnailArray = thumbnailSet.thumbnails;

            if (thumbnailArray)
            {
                var thumbnailArrayLength = thumbnailArray.length;
                var index = 0;

                // Pick the thumbnail that matches the name.
                for (; index < thumbnailArrayLength; index++)
                {
                    var /* @type(wLive.Core.ISkyDriveThumbnail) */thumbnail = thumbnailArray[index];

                    if (thumbnail.name == name)
                    {
                        return thumbnail;
                    }
                }
            }
            Debug.fail('Thumbnail with that name is missing');

            return /* @static_cast(wLive.Core.ISkyDriveThumbnail) */undefined;
        },
        pickThumbnail: function (thumbnailSet, width, height)
        {
            /// <summary>
            /// Pick a thumbnail to show in constrained size
            /// </summary>
            /// <param name="thumbnailSet" type="wLive.Core.ISkyDriveThumbnailSet">Thumbnails object</param>
            /// <param name="width" type="Number">Width of container</param>
            /// <param name="height" type="Number">Height of container</param>
            /// <returns type="wLive.Core.ISkyDriveThumbnail">Thumbnail</returns>

            Debug.assert(thumbnailSet, 'Thumbnails object must not be null');

            var /* @type(wLive.Core.ISkyDriveThumbnail) */bestFullCoverageThumbnail = null;
            var /* @type(wLive.Core.ISkyDriveThumbnail) */bestPartialCoverageThumbnail = null;
            var targetCoverage = width * height * c_thumbnailUpscaleAllowance;

            if (/* @static_cast(Boolean) */thumbnailSet && /* @static_cast(Boolean) */thumbnailSet.thumbnails && thumbnailSet.thumbnails.length > 0)
            {
                for (var i = 0; i < thumbnailSet.thumbnails.length; i++)
                {
                    var thumbnail = /* @static_cast(wLive.Core.ISkyDriveThumbnail) */thumbnailSet.thumbnails[i];

                    thumbnail.totalPixels = thumbnail.width * thumbnail.height;
                    var thumbnailCoverage = thumbnail.coverage = Math.min(thumbnail.width, width) * Math.min(thumbnail.height, height);

                    if (thumbnailCoverage >= targetCoverage) // Full coverage.
                    {
                        if (!bestFullCoverageThumbnail || thumbnail.totalPixels < bestFullCoverageThumbnail.totalPixels)
                        {
                            bestFullCoverageThumbnail = thumbnail;
                        }
                    }
                    else // Partial coverage.
                    {
                        if (!bestPartialCoverageThumbnail || thumbnail.totalPixels > bestPartialCoverageThumbnail.totalPixels)
                        {
                            bestPartialCoverageThumbnail = thumbnail;
                        }
                    }
                }
            }

            ///

            return /* @static_cast(wLive.Core.ISkyDriveThumbnail) */(bestFullCoverageThumbnail || bestPartialCoverageThumbnail);
        },
        isHtml5DropEnabled: function (item, viewContext)
        {
            /// <summary>
            /// This returns true is uploading to this item is allowed.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The OneDrive item to test.</param>
            /// <param name="viewContext" type="wLive.Core.ViewContext">View context object.</param>

            // Only allow uploads on all folders that are not from devices, that are not the shared root, are not the recent docs root, and not recyclebin
            return /* @static_cast(Boolean) */item && /* @static_cast(Boolean) */item.folder && !item.did && viewContext.viewParams.qt != 'mru' && viewContext.viewParams.qt != 'shared' && viewContext.viewParams.qt != 'recyclebin';
        },
        isRootItem: function (item)
        {
            /// <summary>
            /// Determines if an item is a root item (more general than OneDrive root)
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a root item?</returns>

            return item.id === c_root;
        },
        isSkyDriveRoot: function (item)
        {
            /// <summary>
            /// Determines if an item is the OneDrive root
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <param name="viewContext" type="wLive.Core.ViewContext">ViewContext</param>
            /// <returns type="Boolean">Is the item the OneDrive root?</returns>

            return wLiveCore.SkyDriveItemHelper.isRootItem(item) && !item.group && !item.did && !isSpecialQuery(item);
        },
        isDeviceRoot: function (item)
        {
            /// <summary>Determines if the item is a device root.</summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a device root?</returns>

            return /* @static_cast(Boolean) */item && wLiveCore.SkyDriveItemHelper.isRootItem(item) && /* @static_cast(Boolean) */item.did;
        },
        isGroupRoot: function (item)
        {
            /// <summary>
            /// Determines if an item is a group root
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a group root?</returns>

            return /* @static_cast(Boolean) */wLiveCore.SkyDriveItemHelper.isRootItem(item) &&
                    getKeyValue(item, 'group') === '1' &&
                    item.ownerCid != /* @static_cast(String) */null;
        },
        isGroupItem: function (item)
        {
            /// <summary>
            /// Determines if an item is owned by a group.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item group-owned?</returns>

            return getKeyValue(item, 'group') === '1';
        },
        isLegacyPhotomail: function (item)
        {
            /// <summary>
            /// Determines if an item is a legacy photomail item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">True if the item is a legacy photomail item.</returns>

            return /* @static_cast(Boolean) */item.id && item.id.startsWith(c_photomailPrefix);
        },
        isTopLevelItem: function (item)
        {
            /// <summary>
            /// Determines if an item is top-level.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item top-level?</returns>

            if (wLiveCore.SkyDriveItemHelper.isRootItem(item))
            {
                return false;
            }
            var parent = item.getParent(/* skipFetch */true);
            return /* @static_cast(Boolean) */parent && wLiveCore.SkyDriveItemHelper.isRootItem(parent);
        },
        getTopLevelItem: function (item)
        {
            /// <summary>
            /// Fetch the top-level ancestor of the specified item
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the ancestor of.</param>
            /// <param name="response" type="wLive.Core.ISkyDriveItem">The top-level ancestor.</param>

            while (/* @static_cast(Boolean) */item && !wLiveCore.SkyDriveItemHelper.isTopLevelItem(item))
            {
                item = item.getParent(/* skipFetch */true);
            }

            Debug.assert(item, "Unable to find a top-level item");

            return item;
        },
        isViewerOwner: function (item)
        {
            /// <summary>
            /// Determines if the logged in user is the owner of the file
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the logged in user is the owner of this file?</returns>

            return !item.ownerCid || item.ownerCid.toLowerCase() == FilesConfig.hcid.toLowerCase();
        },
        isMruQuery: function (item)
        {
            /// <summary>
            /// Determines if item is the MRU query
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item an Mru query?</returns>

            var qt = getKeyValue(item, 'qt');

            return /* @static_cast(Boolean) */qt && qt.toLowerCase() === 'mru';
        },
        isRecycleBinQuery: function (item)
        {
            /// <summary>
            /// Determines if item is the Recycle Bin query
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a Recycle Bin query?</returns>

            var qt = getKeyValue(item, 'qt');

            return /* @static_cast(Boolean) */qt && qt.toLowerCase() === 'recyclebin';
        },
        isSharedQuery: function (item)
        {
            /// <summary>
            /// Determines if item is the shared query
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a shared query?</returns>

            var qt = getKeyValue(item, 'qt');

            return /* @static_cast(Boolean) */qt && qt.toLowerCase() === 'shared';
        },
        isSearchQuery: function (item)
        {
            /// <summary>
            /// Determines if item is a search query
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a search query?</returns>

            var qt = getKeyValue(item, 'qt');

            return /* @static_cast(Boolean) */qt && qt.toLowerCase() === 'search' && wLiveCore.SkyDriveItemHelper.isRootItem(item);
        },
        getSearchQuery: function (item)
        {
            /// <summary>
            /// Gets the search query string
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="String">The search query string</returns>

            return /* @static_cast(String) */(getKeyValue(item, 'q') || '');
        },
        isSearchResult: function (item)
        {
            /// <summary>
            /// Determines if item is a search result
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a search result?</returns>

            var parent = /* @static_cast(wLive.Core.ISkyDriveItem) */item && /* @static_cast(wLive.Core.ISkyDriveItem) */item.getParent && item.getParent(/* skipFetch */true);
            return wLiveCore.SkyDriveItemHelper.isSearchQuery(parent);
        },
        isSearchOrDescendent: function (item)
        {
            /// <summary>
            /// Determines if item is a search query or a descendent of one.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a search query or descendent?</returns>

            while (item)
            {
                if (wLiveCore.SkyDriveItemHelper.isSearchQuery(item))
                {
                    return true;
                }

                item = /* @static_cast(wLive.Core.ISkyDriveItem) */item.getParent && item.getParent(/* skipFetch */true);
            }

            return false;
        },
        highlightAndEncodeField: function (item, fieldName)
        {
            /// <summary>
            /// Gets a field name with highlights injected.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>
            /// <param name="fieldName" type="String">Field name.</param>
            /// <returns type="String">The highlighted and encoded field</returns>

            if (item && item[fieldName])
            {
                // if we have highlights, loop over the highlights starting at the back:
                //   1. chop off the segments of the string around the current highlight
                //   2. html encode the string pieces
                //   3. inject the hightlight span
                //   4. continue loopingover the remainder of the string and highlights
                var /* @type(String) */remainder = item[fieldName];
                var pieces = [];
                var highlights = item.highlights;
                if (highlights)
                {
                    for (var i = highlights.length - 1; i >= 0; i--)
                    {
                        if (highlights[i].fieldName == fieldName && highlights[i].startIndex < remainder.length)
                        {
                            pieces.unshift(remainder.substring(highlights[i].endIndex).encodeHtml());
                            /* @disable(0058) */
                            /* @disable(0092) */
                            var $highlight = jQuery(_ce("span")).addClass("highlight").html(
                                remainder.substring(highlights[i].startIndex, highlights[i].endIndex).encodeHtml());
                            sutra($highlight, "$Sutra.SkyDrive.SearchHighlight");
                            var $wrapper = jQuery(_ce("span")).append($highlight);
                            pieces.unshift($wrapper.html());
                            /* @restore(0092) */
                            /* @restore(0058) */
                            remainder = remainder.substring(0, highlights[i].startIndex);
                        }
                    }
                }

                pieces.unshift(remainder.encodeHtml());
                return pieces.join('');
            }
            else
            {
                return '';
            }
        },
        clearFieldHighlights: function (item, fieldName)
        {
            /// <summary>
            /// Clears the highlights for a specific field.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>
            /// <param name="fieldName" type="String">Field name.</param>

            if (item && item.highlights)
            {
                var highlights = item.highlights;
                for (var i = 0; i < highlights.length; )
                {
                    if (highlights[i].fieldName == fieldName)
                    {
                        highlights.splice(i, 1);
                    }
                    else
                    {
                        i++;
                    }
                }
            }
        },
        getSongForPlayer: function (item)
        {
            /// <summary>
            /// Creates a song object for the music player playlist
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>

            var song;
            var /* @type(wLive.Core.ISkyDriveAudio)*/audio = item.audio;
            if (audio)
            {
                var albumArtURL = null;

                if (item.thumbnailSet)
                {
                    albumArtURL = item.thumbnailSet.baseUrl + wLive.Core.SkyDriveItemHelper.getThumbnail(item.thumbnailSet, "height128").url;
                }

                song = {
                    songUrl: item.urls.download + c_audioUrlQueryParams,
                    songTitle: audio.title || item.name || c_stringEmpty,
                    artistName: audio.artist || getPCString("InfoPane.Information.UnknownArtist"),
                    albumArtUrl: albumArtURL,
                    mimeType: item.mimeType,
                    error: 0
                };

            }

            return song;
        },
        getNormalizedExtension: function (item)
        {
            /// <summary>
            /// Gets the normalized extension.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>
            /// <returns type="String">The normalized extension, e.g. "Doc" for all Word types including ODT, or undefined if no mapping exists.</returns>

            return /* @static_cast(String) */item && c_iconTypeToFileType[item.iconType];
        },
        getFriendlyFileType: function (item)
        {
            /// <summary>
            /// Gets the filetype string.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>

            // Local vars for crunching.
            var currentVersion = item.getVersion();
            var versionPropertyName = 'friendlyFileTypeVersion';

            if (item[versionPropertyName] !== currentVersion)
            {
                var extension = item.extension;
                var upperCaseExtension = extension && extension.substring(1).toUpperCase();
                var fileType = wLiveCore.SkyDriveItemHelper.getNormalizedExtension(item);

                var fileTypeText = getFiletypeString('NoExtension');
                if (!fileType && /* @static_cast(Boolean) */item.folder)
                {
                    fileTypeText = getFiletypeString('Folder');
                }
                else if (/* @static_cast(Boolean) */item.photo && !item.video)
                {
                    fileTypeText = getFiletypeString('Image').format(upperCaseExtension || '').trim();
                }
                else if (fileType)
                {
                    fileTypeText = getFiletypeString(fileType);
                }
                else if (upperCaseExtension)
                {
                    fileTypeText = getFiletypeString('Unknown').format(upperCaseExtension);
                }

                item.friendlyFileType = fileTypeText;
                item[versionPropertyName] = currentVersion;
            }

            return item.friendlyFileType;
        }
    };

    function isSpecialQuery(item)
    {
        /// <summary>
        /// Determines if we are looking at a special query
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">item</param>
        /// <returns type="Boolean">Is the user looking at a query item?</returns>

        Debug.assert(item, 'Item must be set');
        Debug.assert(item.key, 'Item must have a key');

        var qt = getKeyValue(item, 'qt');

        return /* @static_cast(Boolean) */qt && qt !== "";
    }

    function getKeyValue(item, property)
    {
        /// <summary>
        /// Gets the value of a property in an item key
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
        /// <param name="property" type="String">Name of the property</param>
        /// <returns type="String">Value of the property</returns>

        if (!item)
        {
            return /* @static_cast(String) */undefined;
        }

        if (!item.keyParts)
        {
            item.keyParts = $Utility.deserialize(item.key, "&", false, false);
        }

        return /* @static_cast(String) */item.keyParts[property];
    }

    function getFiletypeString(id)
    {
        /// <summary>
        /// Get a filetype string.
        /// </summary>
        /// <param name="id" type="String">ID of the string.</param>
        return getPCString('FileType.' + id);
    }

    ///
})();
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

/// ************************************************************************
/// This file contains all of the helpers that DONT HAVE jQuery dependencies
/// ************************************************************************

(function ()
{
    var wLiveCore = wLive.Core;
    var getPCString = wLiveCore.AleHelpers.getPCString;

    var c_traceCategory = "SkyDriveItemHelper";
    Trace.register(c_traceCategory, { isEnabled: false });

    var c_stringEmpty = '';
    var c_timeSeperator = ':';
    var c_oneSecond = 1000; // 1 second = 1000
    var c_oneMinute = 60000; // 1 minute = 60 * 1000 = 60000
    var c_oneHour = 3600000; // 1 hour = 60 * 60 * 1000 = 3600000

    /* This is the percentage of area we allow as wiggle room for image coverage when picking a thumbnail to render in the available space. */
    var c_thumbnailUpscaleAllowance = .85;

    var c_alePCPrefix = 'live.shared.skydrive.pc.';
    var c_aleMobilePrefix = 'live.shared.skydrive.mobile.';

    // Audio download url query
    var c_audioUrlQueryParams = '&videoplayer=skysl';

    var c_root = 'root';
    var c_photomailPrefix = 'photomail_';

    // IconType to FileType mapping, for types with a corresponding PC.FileType.* string
    var c_folder = 'Folder';
    var c_doc = 'Doc';
    var c_one = 'One';
    var c_ppt = 'Ppt';
    var c_xls = 'Xls';
    var c_vsd = 'Vsd';
    var c_lib = 'Lib';
    var c_drive = 'Drive';
    var c_cdDrive = 'CDDrive';
    var c_usbDrive = 'USBDrive';
    var c_extDrive = 'ExtDrive';
    var c_netDrive = 'NetDrive';
    var c_brDrive = 'BrDrive';

    var c_iconTypeToFileType =
        {
            WinDocuments: c_lib,
            WinLibrary: c_lib,
            WinMusic: c_lib,
            WinPictures: c_lib,
            WinPodcastLibrary: c_lib,
            WinVideos: c_lib,
            WinDrive: c_drive,
            CDDrive: c_cdDrive,
            GenericDrive: c_drive,
            UsbDrive: c_usbDrive,
            ExternalDrive: c_extDrive,
            NetworkStorage: c_netDrive,
            Accdb: "Mdb",
            Doc: c_doc,
            Docm: c_doc,
            Docx: c_doc,
            Dot: c_doc,
            Dotm: c_doc,
            Dotx: c_doc,
            Exe: "Exe",
            Html: "Html",
            Mdb: "Mdb",
            Mpp: "Mpp",
            Mpt: "Mpp",
            Odp: c_ppt,
            Ods: c_xls,
            Odt: c_doc,
            One: c_one,
            Onepkg: c_one,
            Onetoc2: c_one,
            Notebook: "OneNotebook",
            Pot: c_ppt,
            Potm: c_ppt,
            Potx: c_ppt,
            Ppa: c_ppt,
            Ppam: c_ppt,
            Pps: c_ppt,
            Ppsm: c_ppt,
            Ppsx: c_ppt,
            Ppt: c_ppt,
            Pptm: c_ppt,
            Pptx: c_ppt,
            Pub: "Pub",
            Rtf: "Rtf",
            Txt: "Txt",
            Vdw: c_vsd,
            Vsd: c_vsd,
            Vsdm: c_vsd,
            Vsdx: c_vsd,
            Vsl: c_vsd,
            Vss: c_vsd,
            Vssm: c_vsd,
            Vssx: c_vsd,
            Vst: c_vsd,
            Vstm: c_vsd,
            Vstx: c_vsd,
            Xaml: "Xaml",
            Xla: c_xls,
            Xlam: c_xls,
            Xll: c_xls,
            Xls: c_xls,
            Xlsb: c_xls,
            Xlsm: c_xls,
            Xlsx: c_xls,
            Xlt: c_xls,
            Xltm: c_xls,
            Xltx: c_xls,
            Xml: "Xml",
            Xps: "Xps",
            Xsn: "Xsn",
            Zip: "Zip"
        };

    wLive.Core.SkyDriveItemHelper =
    {
        duration: function (duration)
        {
            /// <summary>
            /// Returns a string to represent the video duration
            /// </summary>
            /// <param name="duration" type="Number">duration</param>
            /// <returns type="String">Duration UI string</returns>

            Debug.assert(duration !== undefined, 'Duration must be defined');
            Debug.assert(duration >= 0, 'Duration must be positive number');

            var durationString = c_stringEmpty;
            var outputStarted = false;

            if (duration >= c_oneHour)
            {
                var hours = Math.floor(duration / c_oneHour);
                duration = duration % c_oneHour;

                durationString += hours + c_timeSeperator;
                outputStarted = true;
            }

            var minutes = Math.floor(duration / c_oneMinute);
            duration = duration % c_oneMinute;

            if (minutes < 10 && outputStarted)
            {
                // Output leading 0 if we had an hour.
                durationString += '0';
            }

            durationString += minutes + c_timeSeperator;

            var seconds = Math.floor(duration / c_oneSecond);

            if (seconds < 10)
            {
                durationString += '0';
            }

            durationString += seconds;

            return durationString;
        },
        getThumbnail: function (thumbnailSet, name)
        {
            /// <summary>
            /// Pick a thumbnail by name.
            /// </summary>
            /// <param name="thumbnailSet" type="wLive.Core.ISkyDriveThumbnailSet">Thumbnails object</param>
            /// <param name="name" type="String">Thumbnail name.</param>
            /// <returns type="wLive.Core.ISkyDriveThumbnail">Thumbnail</returns>

            Debug.assert(thumbnailSet, 'Thumbnails object must not be null');

            var thumbnailArray = thumbnailSet.thumbnails;

            if (thumbnailArray)
            {
                var thumbnailArrayLength = thumbnailArray.length;
                var index = 0;

                // Pick the thumbnail that matches the name.
                for (; index < thumbnailArrayLength; index++)
                {
                    var /* @type(wLive.Core.ISkyDriveThumbnail) */thumbnail = thumbnailArray[index];

                    if (thumbnail.name == name)
                    {
                        return thumbnail;
                    }
                }
            }
            Debug.fail('Thumbnail with that name is missing');

            return /* @static_cast(wLive.Core.ISkyDriveThumbnail) */undefined;
        },
        pickThumbnail: function (thumbnailSet, width, height)
        {
            /// <summary>
            /// Pick a thumbnail to show in constrained size
            /// </summary>
            /// <param name="thumbnailSet" type="wLive.Core.ISkyDriveThumbnailSet">Thumbnails object</param>
            /// <param name="width" type="Number">Width of container</param>
            /// <param name="height" type="Number">Height of container</param>
            /// <returns type="wLive.Core.ISkyDriveThumbnail">Thumbnail</returns>

            Debug.assert(thumbnailSet, 'Thumbnails object must not be null');

            var /* @type(wLive.Core.ISkyDriveThumbnail) */bestFullCoverageThumbnail = null;
            var /* @type(wLive.Core.ISkyDriveThumbnail) */bestPartialCoverageThumbnail = null;
            var targetCoverage = width * height * c_thumbnailUpscaleAllowance;

            if (/* @static_cast(Boolean) */thumbnailSet && /* @static_cast(Boolean) */thumbnailSet.thumbnails && thumbnailSet.thumbnails.length > 0)
            {
                for (var i = 0; i < thumbnailSet.thumbnails.length; i++)
                {
                    var thumbnail = /* @static_cast(wLive.Core.ISkyDriveThumbnail) */thumbnailSet.thumbnails[i];

                    thumbnail.totalPixels = thumbnail.width * thumbnail.height;
                    var thumbnailCoverage = thumbnail.coverage = Math.min(thumbnail.width, width) * Math.min(thumbnail.height, height);

                    if (thumbnailCoverage >= targetCoverage) // Full coverage.
                    {
                        if (!bestFullCoverageThumbnail || thumbnail.totalPixels < bestFullCoverageThumbnail.totalPixels)
                        {
                            bestFullCoverageThumbnail = thumbnail;
                        }
                    }
                    else // Partial coverage.
                    {
                        if (!bestPartialCoverageThumbnail || thumbnail.totalPixels > bestPartialCoverageThumbnail.totalPixels)
                        {
                            bestPartialCoverageThumbnail = thumbnail;
                        }
                    }
                }
            }

            ///

            return /* @static_cast(wLive.Core.ISkyDriveThumbnail) */(bestFullCoverageThumbnail || bestPartialCoverageThumbnail);
        },
        isHtml5DropEnabled: function (item, viewContext)
        {
            /// <summary>
            /// This returns true is uploading to this item is allowed.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The OneDrive item to test.</param>
            /// <param name="viewContext" type="wLive.Core.ViewContext">View context object.</param>

            // Only allow uploads on all folders that are not from devices, that are not the shared root, are not the recent docs root, and not recyclebin
            return /* @static_cast(Boolean) */item && /* @static_cast(Boolean) */item.folder && !item.did && viewContext.viewParams.qt != 'mru' && viewContext.viewParams.qt != 'shared' && viewContext.viewParams.qt != 'recyclebin';
        },
        isRootItem: function (item)
        {
            /// <summary>
            /// Determines if an item is a root item (more general than OneDrive root)
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a root item?</returns>

            return item.id === c_root;
        },
        isSkyDriveRoot: function (item)
        {
            /// <summary>
            /// Determines if an item is the OneDrive root
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <param name="viewContext" type="wLive.Core.ViewContext">ViewContext</param>
            /// <returns type="Boolean">Is the item the OneDrive root?</returns>

            return wLiveCore.SkyDriveItemHelper.isRootItem(item) && !item.group && !item.did && !isSpecialQuery(item);
        },
        isDeviceRoot: function (item)
        {
            /// <summary>Determines if the item is a device root.</summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a device root?</returns>

            return /* @static_cast(Boolean) */item && wLiveCore.SkyDriveItemHelper.isRootItem(item) && /* @static_cast(Boolean) */item.did;
        },
        isGroupRoot: function (item)
        {
            /// <summary>
            /// Determines if an item is a group root
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a group root?</returns>

            return /* @static_cast(Boolean) */wLiveCore.SkyDriveItemHelper.isRootItem(item) &&
                    getKeyValue(item, 'group') === '1' &&
                    item.ownerCid != /* @static_cast(String) */null;
        },
        isGroupItem: function (item)
        {
            /// <summary>
            /// Determines if an item is owned by a group.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item group-owned?</returns>

            return getKeyValue(item, 'group') === '1';
        },
        isLegacyPhotomail: function (item)
        {
            /// <summary>
            /// Determines if an item is a legacy photomail item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">True if the item is a legacy photomail item.</returns>

            return /* @static_cast(Boolean) */item.id && item.id.startsWith(c_photomailPrefix);
        },
        isTopLevelItem: function (item)
        {
            /// <summary>
            /// Determines if an item is top-level.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item top-level?</returns>

            if (wLiveCore.SkyDriveItemHelper.isRootItem(item))
            {
                return false;
            }
            var parent = item.getParent(/* skipFetch */true);
            return /* @static_cast(Boolean) */parent && wLiveCore.SkyDriveItemHelper.isRootItem(parent);
        },
        getTopLevelItem: function (item)
        {
            /// <summary>
            /// Fetch the top-level ancestor of the specified item
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the ancestor of.</param>
            /// <param name="response" type="wLive.Core.ISkyDriveItem">The top-level ancestor.</param>

            while (/* @static_cast(Boolean) */item && !wLiveCore.SkyDriveItemHelper.isTopLevelItem(item))
            {
                item = item.getParent(/* skipFetch */true);
            }

            Debug.assert(item, "Unable to find a top-level item");

            return item;
        },
        isViewerOwner: function (item)
        {
            /// <summary>
            /// Determines if the logged in user is the owner of the file
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the logged in user is the owner of this file?</returns>

            return !item.ownerCid || item.ownerCid.toLowerCase() == FilesConfig.hcid.toLowerCase();
        },
        isMruQuery: function (item)
        {
            /// <summary>
            /// Determines if item is the MRU query
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item an Mru query?</returns>

            var qt = getKeyValue(item, 'qt');

            return /* @static_cast(Boolean) */qt && qt.toLowerCase() === 'mru';
        },
        isRecycleBinQuery: function (item)
        {
            /// <summary>
            /// Determines if item is the Recycle Bin query
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a Recycle Bin query?</returns>

            var qt = getKeyValue(item, 'qt');

            return /* @static_cast(Boolean) */qt && qt.toLowerCase() === 'recyclebin';
        },
        isSharedQuery: function (item)
        {
            /// <summary>
            /// Determines if item is the shared query
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a shared query?</returns>

            var qt = getKeyValue(item, 'qt');

            return /* @static_cast(Boolean) */qt && qt.toLowerCase() === 'shared';
        },
        isSearchQuery: function (item)
        {
            /// <summary>
            /// Determines if item is a search query
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a search query?</returns>

            var qt = getKeyValue(item, 'qt');

            return /* @static_cast(Boolean) */qt && qt.toLowerCase() === 'search' && wLiveCore.SkyDriveItemHelper.isRootItem(item);
        },
        getSearchQuery: function (item)
        {
            /// <summary>
            /// Gets the search query string
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="String">The search query string</returns>

            return /* @static_cast(String) */(getKeyValue(item, 'q') || '');
        },
        isSearchResult: function (item)
        {
            /// <summary>
            /// Determines if item is a search result
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a search result?</returns>

            var parent = /* @static_cast(wLive.Core.ISkyDriveItem) */item && /* @static_cast(wLive.Core.ISkyDriveItem) */item.getParent && item.getParent(/* skipFetch */true);
            return wLiveCore.SkyDriveItemHelper.isSearchQuery(parent);
        },
        isSearchOrDescendent: function (item)
        {
            /// <summary>
            /// Determines if item is a search query or a descendent of one.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
            /// <returns type="Boolean">Is the item a search query or descendent?</returns>

            while (item)
            {
                if (wLiveCore.SkyDriveItemHelper.isSearchQuery(item))
                {
                    return true;
                }

                item = /* @static_cast(wLive.Core.ISkyDriveItem) */item.getParent && item.getParent(/* skipFetch */true);
            }

            return false;
        },
        highlightAndEncodeField: function (item, fieldName)
        {
            /// <summary>
            /// Gets a field name with highlights injected.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>
            /// <param name="fieldName" type="String">Field name.</param>
            /// <returns type="String">The highlighted and encoded field</returns>

            if (item && item[fieldName])
            {
                // if we have highlights, loop over the highlights starting at the back:
                //   1. chop off the segments of the string around the current highlight
                //   2. html encode the string pieces
                //   3. inject the hightlight span
                //   4. continue loopingover the remainder of the string and highlights
                var /* @type(String) */remainder = item[fieldName];
                var pieces = [];
                var highlights = item.highlights;
                if (highlights)
                {
                    for (var i = highlights.length - 1; i >= 0; i--)
                    {
                        if (highlights[i].fieldName == fieldName && highlights[i].startIndex < remainder.length)
                        {
                            pieces.unshift(remainder.substring(highlights[i].endIndex).encodeHtml());
                            /* @disable(0058) */
                            /* @disable(0092) */
                            var $highlight = jQuery(_ce("span")).addClass("highlight").html(
                                remainder.substring(highlights[i].startIndex, highlights[i].endIndex).encodeHtml());
                            sutra($highlight, "$Sutra.SkyDrive.SearchHighlight");
                            var $wrapper = jQuery(_ce("span")).append($highlight);
                            pieces.unshift($wrapper.html());
                            /* @restore(0092) */
                            /* @restore(0058) */
                            remainder = remainder.substring(0, highlights[i].startIndex);
                        }
                    }
                }

                pieces.unshift(remainder.encodeHtml());
                return pieces.join('');
            }
            else
            {
                return '';
            }
        },
        clearFieldHighlights: function (item, fieldName)
        {
            /// <summary>
            /// Clears the highlights for a specific field.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>
            /// <param name="fieldName" type="String">Field name.</param>

            if (item && item.highlights)
            {
                var highlights = item.highlights;
                for (var i = 0; i < highlights.length; )
                {
                    if (highlights[i].fieldName == fieldName)
                    {
                        highlights.splice(i, 1);
                    }
                    else
                    {
                        i++;
                    }
                }
            }
        },
        getSongForPlayer: function (item)
        {
            /// <summary>
            /// Creates a song object for the music player playlist
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>

            var song;
            var /* @type(wLive.Core.ISkyDriveAudio)*/audio = item.audio;
            if (audio)
            {
                var albumArtURL = null;

                if (item.thumbnailSet)
                {
                    albumArtURL = item.thumbnailSet.baseUrl + wLive.Core.SkyDriveItemHelper.getThumbnail(item.thumbnailSet, "height128").url;
                }

                song = {
                    songUrl: item.urls.download + c_audioUrlQueryParams,
                    songTitle: audio.title || item.name || c_stringEmpty,
                    artistName: audio.artist || getPCString("InfoPane.Information.UnknownArtist"),
                    albumArtUrl: albumArtURL,
                    mimeType: item.mimeType,
                    error: 0
                };

            }

            return song;
        },
        getNormalizedExtension: function (item)
        {
            /// <summary>
            /// Gets the normalized extension.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>
            /// <returns type="String">The normalized extension, e.g. "Doc" for all Word types including ODT, or undefined if no mapping exists.</returns>

            return /* @static_cast(String) */item && c_iconTypeToFileType[item.iconType];
        },
        getFriendlyFileType: function (item)
        {
            /// <summary>
            /// Gets the filetype string.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item.</param>

            // Local vars for crunching.
            var currentVersion = item.getVersion();
            var versionPropertyName = 'friendlyFileTypeVersion';

            if (item[versionPropertyName] !== currentVersion)
            {
                var extension = item.extension;
                var upperCaseExtension = extension && extension.substring(1).toUpperCase();
                var fileType = wLiveCore.SkyDriveItemHelper.getNormalizedExtension(item);

                var fileTypeText = getFiletypeString('NoExtension');
                if (!fileType && /* @static_cast(Boolean) */item.folder)
                {
                    fileTypeText = getFiletypeString('Folder');
                }
                else if (/* @static_cast(Boolean) */item.photo && !item.video)
                {
                    fileTypeText = getFiletypeString('Image').format(upperCaseExtension || '').trim();
                }
                else if (fileType)
                {
                    fileTypeText = getFiletypeString(fileType);
                }
                else if (upperCaseExtension)
                {
                    fileTypeText = getFiletypeString('Unknown').format(upperCaseExtension);
                }

                item.friendlyFileType = fileTypeText;
                item[versionPropertyName] = currentVersion;
            }

            return item.friendlyFileType;
        }
    };

    function isSpecialQuery(item)
    {
        /// <summary>
        /// Determines if we are looking at a special query
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">item</param>
        /// <returns type="Boolean">Is the user looking at a query item?</returns>

        Debug.assert(item, 'Item must be set');
        Debug.assert(item.key, 'Item must have a key');

        var qt = getKeyValue(item, 'qt');

        return /* @static_cast(Boolean) */qt && qt !== "";
    }

    function getKeyValue(item, property)
    {
        /// <summary>
        /// Gets the value of a property in an item key
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
        /// <param name="property" type="String">Name of the property</param>
        /// <returns type="String">Value of the property</returns>

        if (!item)
        {
            return /* @static_cast(String) */undefined;
        }

        if (!item.keyParts)
        {
            item.keyParts = $Utility.deserialize(item.key, "&", false, false);
        }

        return /* @static_cast(String) */item.keyParts[property];
    }

    function getFiletypeString(id)
    {
        /// <summary>
        /// Get a filetype string.
        /// </summary>
        /// <param name="id" type="String">ID of the string.</param>
        return getPCString('FileType.' + id);
    }

    ///
})();
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var wLiveCoreCookieToss = wLiveCore.CookieToss;

    var c_imagePoolIdPrefix = 'imgPool';
    var c_unload = 'unload';
    // Watson Error Codes: http://wlxwiki/wiki/default.aspx/Microsoft.WLX.ServerShared/WebWatson.html
    var c_imageFailureErrorCode = 29001;

    /// <summary>
    /// The Image Loader component is a static helper class.
    /// It uses an image pool to download X images at the same time.
    /// </summary>
    /// <remarks>
    /// Currently there is not any Flush/Abort/Unregister API.
    /// </remarks>
    var images = wLive.Core.Images =
    {
        ///
    };

    // Currently we hardcode the image pool size to 10.
    // Later the image pool size may grow and shrink based on user bandwidth
    /// and other factors.
    var _imgPoolSize = 10;

    // Array of image elements to use to load up the urls registered.
    var _$imgEls = [];

    // Array of Urls to load when the pool has a free spot.
    var _imgUrlQueue = [];

    // Hash table which maps Url -> List of image elements.
    var _urlToElementListHashTable = {};

    // Hash table of running Urls.
    var _running = {};

    // Hash table of completed Urls.
    // After the persistence architecture is integrated we might place this
    // hash table in the window.parent scope.
    var _completedUrls = {};

    // Static Id used to generate unquie Html ids for images elements.
    var _imgId = 0;
    var _processedImgCount = 0;

    var _windowUnloadOccurred = false;

    (function ()
    {
        /// <summary>
        /// Initialize the image pool.
        /// </summary>

        for (var i = 0; i < _imgPoolSize; i++)
        {
            // Note: each time the image element is reused for a different source
            // the onerror, onabort, and onload continue to work.
            // If a browser stopped supporting that the image pool would not work
            // and we would have to use the real image elements.
            // One downside to using the real images are that we will be holding
            // a large hash table to destroyed dom elements in some scenarios
            // and don't want a large memory footprint.
            // Another downside is that we would have to bind many more events
            // and think that may cause a large memory footprint as well.
            // This is not something we believe to change in the future though.
            // However if it needs to switch to the real image elements it will
            // not be a big change.

            _$imgEls.push(jQuery(document.createElement("img")).bind(
            {
                error: imgElOnError,
                abort: imgElOnAbort,
                load: imgElOnLoad
            }));
        }

        jQuery(window).bind(c_unload, windowUnload);

        if (!wLiveCoreCookieToss.complete)
        {
            jQuery(wLiveCoreCookieToss).bind(wLiveCoreCookieToss.eventName, cookieTossComplete);
        }

        function cookieTossComplete(ev)
        {
            /// <summary>
            /// Cookie toss is complete so call processImage.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Cookie toss complete event</param>

            processImg();
        }
    })();

    images.getId = function ()
    {
        /// <summary>
        /// Generates a unique Html id.
        /// </summary>

        return c_imagePoolIdPrefix + _imgId++;
    };

    images.isComplete = function (url)
    {
        /// <summary>
        /// Determines if the url has already been loaded.
        /// </summary>
        /// <param name="url" type="String">Url to check</param>
        /// <returns type="Boolean">True if the image has already been loaded, false otherwise</returns>

        return _completedUrls[url];
    };

    images.isIdle = function ()
    {
        /// <summary>
        /// Determines if the image loader is idle.
        /// </summary>
        /// <returns type="Boolean">True if the image loader is idle, false otherwise</returns>

        // No images in the queue and pool is not inuse.
        return _imgUrlQueue.length == 0 && _$imgEls.length == _imgPoolSize;
    };

    images.hasLoadedImage = function (url)
    {
        /// <summary>
        /// Determines if the image loader has loaded an image url.
        /// </summary>
        /// <param name="url" type="String">Url to check if it has loaded</param>
        /// <returns type="Boolean">True if the image has loaded. False otherwise</returns>

        Debug.assert(url, 'Must provide url to check.');

        return _completedUrls[url];
    };

    images.loadImage = function (url, imgElement)
    {
        /// <summary>
        /// Register image to be loaded.
        /// </summary>
        /// <param name="url" type="String">URL to set as the src attribute on the image element</param>
        /// <param name="imgElement" type="HTMLElement" optional="true">Optional image element to populate with img when available.</param>

        Debug.assert(url, 'Must provide url to check.');
        Debug.assert(!_windowUnloadOccurred, 'Images Register after Window Unload');

        if (_completedUrls[url])
        {
            // Image has already loaded so just apply the url to the element.
            /* @static_cast(Boolean) */imgElement && /* @static_cast(Boolean) */(imgElement.src = url);
        }
        else if (_urlToElementListHashTable[url])
        {
            // Image is currently being run or already in the queue.
            // Add it the array of Html elements associated with the url.
            _urlToElementListHashTable[url].push(imgElement);
        }
        else
        {
            // Image Url has not been requested before.
            // Add the Url to the queue.
            _imgUrlQueue.push(url);

            // Insert a node into the Url to Html Id hashtable.
            _urlToElementListHashTable[url] = [imgElement];

            processImg();
        }
    };

    function windowUnload(ev)
    {
        /// <summary>
        /// Stops processing images on window unload.
        /// </summary>
        /// <param name="ev" type="HTMLEvent">Event</param>

        // jQuery already detaches all events on window.onunload.
        // So we do not need to unbind the window's unload or the 
        // image elements 3 events.

        // Stop processing more images after unload.
        _windowUnloadOccurred = true;
    }

    function processImg($imgEl)
    {
        /// <summary>
        /// Processes next Image in the queue.
        /// </summary>
        /// <param name="$imgEl" type="jQuery" optional="true">jQuery Object to be used</param>

        var src;

        if (!$imgEl && _$imgEls.length > 0)
        {
            // The image has not been passed in.
            // This means we use an image from the pool not in use.
            $imgEl = _$imgEls.pop();
        }

        if ($imgEl)
        {
            // This is temporary until storage moves thumbnails to *.live(-int).com in M1.
            // At that time we will probably stop sending the cookie toss'ed urls through Images.
            // This means the item tile and video control will directly deal with the Cookie Toss
            // api.
            // If we decide to put cookie tossed resources through the image loader we will 
            // skip to the next image or use an alternate queue for cookie tossed resources so that
            // we dont hault everything.
            if (!_windowUnloadOccurred && _imgUrlQueue.length > 0 &&
                (wLiveCoreCookieToss.complete || !wLiveCoreCookieToss.requiresCookieToss(_imgUrlQueue[0])))
            {
                // The image url queue has more images to download.
                // Dequeue off the next image Url from the queue and begin downloading it.
                src = _imgUrlQueue.splice(0, 1)[0];

                if (_imgUrlQueue.length > 0 && _$imgEls.length > 0)
                {
                    // This can only happen if there was an "Abort" before.
                    // This allows our aborts to keep items in the queue.
                    // This allows our next register to use the full pool
                    // to attach the queue again.
                    processImg();
                }

                _processedImgCount++;

                if (_processedImgCount % 10)
                {
                    // 9 out of 10 times call it immediately.
                    // This assumes that a stack overflow won't occur with 9 times through.
                    applySrcOnPoolImage();
                }
                else
                {
                    // This must be last because setting the source automatically calls onload (interrupting the thread).
                    // Use a set timeout to stop the browser from potentially having a stack overflow.
                    wLiveCore.DomHelpers.setTimeoutZero(applySrcOnPoolImage);
                }
            }
            else
            {
                // Ran out of Urls to process.
                // Put the image back into the pool.
                _$imgEls.push($imgEl);
            }
        }

        function applySrcOnPoolImage()
        {
            /// <summary>
            /// Helper function to apply the src attribute
            /// on the image pool element.
            /// </summary>

            // Store the src on the .s expando because we cannot read the .src later
            // in firefox because firefox modifies (encodes/decodes) the src attribute.
            $imgEl[0].s = src;
            $imgEl[0].src = src;
        }
    };

    /* @bind(HTMLElement) */function imgElOnError(ev)
    {
        /// <summary>
        /// Error handler for image loading.
        /// </summary>
        /// <param name="ev" type="HTMLEvent">Event</param>

        // jQuery is not returning the img element in the ev.target in IE8
        // So we rely on "this" aka "ev.currentTarget" to get the image element.
        var srcElement = this;
        var $imgEl = jQuery(srcElement);
        /* @disable(0092) */
        var url = srcElement.s;
        /* @restore(0092) */

        // Currently there is no retry logic.
        // Retry would be benefitial for flaky network scenarios.
        // How many times would we retry?
        // Not sure if setting src attribute to the same url would cause a retry
        // Might have to set it to some neutral url first (string empty or a previously completed url).
        // Might have to put an extra query string.
        // However the extra query string will cause us to request the original one on a later view.
        // Some browsers may pull the "Error" back from browser memory.
        // Until all of this is figured out there is currently no retry logic.
        // This means that the next image element that requests the same URL will
        // be treated as if it was the first one as far as the image pool is concerned.

        // Send error to watson.
        $WebWatson.submit("Image failed to download.", url, 0, null, c_imageFailureErrorCode, null, null, true);

        // Clear out Url to Id Hash list.
        delete _urlToElementListHashTable[url];

        // Continue to next one.
        processImg($imgEl);
    }

    /* @bind(HTMLElement) */function imgElOnAbort(ev)
    {
        /// <summary>
        /// Abort handler for image loading.
        /// </summary>
        /// <param name="ev" type="HTMLEvent">Event</param>

        // jQuery is not returning the img element in the ev.target in IE8
        // So we rely on "this" aka "ev.currentTarget" to get the image element.
        var srcElement = this;
        var $imgEl = jQuery(srcElement);
        /* @disable(0092) */
        var url = srcElement.s;
        /* @restore(0092) */

        // This can happen in firefox if you press escape which
        // stops network requests.

        // Currently there is no retry logic since you are probably unloading the page anyways.
        // On abort we are not sending data to Watson.

        // Clear out Url to Id Hash list.
        delete _urlToElementListHashTable[url];

        // Instead of calling processImg we push the image back into the pool.
        // This means we do not keep going with the queue.
        // More images will start the queue again.
        _$imgEls.push($imgEl);
    }

    /* @bind(HTMLElement) */function imgElOnLoad(ev)
    {
        /// <summary>
        /// Load handler for image loading.
        /// </summary>
        /// <param name="ev" type="HTMLEvent">Event</param>

        // jQuery is not returning the img element in the ev.target in IE8
        // So we rely on "this" aka "ev.currentTarget" to get the image element.
        var srcElement = this;
        var $imgEl = jQuery(srcElement);
        /* @disable(0092) */
        var url = srcElement.s;
        /* @restore(0092) */

        var /* @type(Array) */elementArray = _urlToElementListHashTable[url];
        Debug.assert(elementArray, 'Image url not found in hash table');
        var i = 0;
        var elementArrayLength = elementArray.length;

        // Mark the url as completed.
        _completedUrls[url] = true;

        // Set the real image elements src attribute.
        for (; i < elementArrayLength; i++)
        {
            elementArray[i] && (elementArray[i].src = url);
        }

        // Remove the Url to element list entry since it is completed.
        delete _urlToElementListHashTable[url];

        // Continue processing images.
        processImg($imgEl);
    }

    

})();

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var SortFieldEnum = wLiveCore.JSONConstants.SortField;
    var SortDirectionEnum = wLiveCore.JSONConstants.SortDirection;

    /// <summary>
    /// The DataModel class is responsible for abstracting the fetching/accessing/manipulating of file data. It internally allows
    /// for data virtualization (only fetch pages of data at a time) and abstracts semantics about how long the data lives and when
    /// it needs to be refreshed.
    /// </summary>

    // Assert dependencies.
    Debug.assert(wLive.Core.PriorityQueue, "PriorityQueue does not exist. Ensure PriorityQueue.js is loaded before loading DataModel.js.");

    // Constants
    var c_rootParentId = "root";
    var c_idKey = 'id';
    var c_cidKey = 'cid';
    var c_sortByKey = 'sb';
    var c_sortReverseKey = 'sr';
    var c_skyApiCommonQueryParams = 'lct=1';
    var c_skyApiPresetParameterName = 'rset';
    var c_skyApiGetItemsResponsePreset = $B.Mobile ? 'web_mobile' : 'web';
    var c_traceCategory = "DataModel";

    var wLiveCoreSkyDriveItem = wLiveCore.SkyDriveItem;

    // The time until we give up trying to fetch data from the server.
    var c_requestTimeout = 30000;
    var c_deviceRequestTimeout = 150000;

    var c_getItemsFailureReentranceDelay = 2000; // 2 seconds

    // This is the max number of modified changes before we say its a refresh loop
    var c_maxModifiedChangesBeforeError = 3;

    // After hitting an error requesting items, this is the time we allow to pass before making another attempt to download the same request.
    var c_delayRequestsAfterComplete = 30000;

    wLiveCore.DataModel = DataModel;

    // DataModel event constants.
    wLiveCore.DataModel.dataChangedEvent = "dataChanged";
    wLiveCore.DataModel.groupInfoChangedEvent = "groupInfoChanged";
    wLiveCore.DataModel.errorEvent = "error";

    /* @bind(wLive.Core.DataModel) */function DataModel(baseUrl, canary, appId, callerCid, market, pageSize)
    {
        /// <summary>
        /// Initializes a new instance of the DataModel class.
        /// </summary>
        /// <param name="baseUrl" type="String" optional="true">Base url to use for making item requests. This should include protocol, path, and version. E.g.: https://skydrive.live.com/api/2 </param>
        /// <param name="canary" type="String" optional="true">User's canary.</param>
        /// <param name="appId" type="String" optional="true">AppId for the website.</param>
        /// <param name="callerCid" type="String" optional="true">User's cid. E.g. 1234567890abcdef</param>
        /// <param name="market" type="String" optional="true">User's market. E.g. en-us</param>
        /// <param name="pageSize" type="Number" optional="true">Number of children to request at a time. Defaults to 100 if not provided.</param>

        var _this = this;

        // This can be overwritten externally.
        _this.extraGetItemsParams = '';

        // Member variables
        var _baseUrl = baseUrl || null;
        var /* @type(String) */_callerCid = callerCid || '';
        var _canary = canary || '';
        var _market = market || '';
        var _pageSize = pageSize || 100;
        var _appId = appId || '';

        Debug.assert(_pageSize > 0, "pageSize should be larger than 0");

        var _items = [];
        var _maxRetries = 1;

        var _groupInfo = [];

        var _pendingRequests = {};

        var /* @type(Array) */_suspendedChangeEvents = null;

        _this.hasPendingRequests = function (itemKey)
        {
            /// <summary>
            /// Returns true if there is a pending network request for the given key.
            /// </summary>
            /// <param name="itemKey" type="String">Item query</param>
            /// <returns type="Boolean">True if there is a pending request.</returns>

            return !!(_pendingRequests[itemKey]);
        };

        _this.abortPendingRequests = function (itemKey)
        {
            /// <summary>
            /// Aborts any pending data requests for this item key
            /// </summary>
            /// <param name="itemKey" type="String">Item query</param>

            var pendingRequestsForItem = _pendingRequests[itemKey];

            if (pendingRequestsForItem)
            {
                for (var setKey in pendingRequestsForItem)
                {
                    if (setKey !== "count")
                    {
                        var /* @type(wLive.Core.DataRequest) */request = pendingRequestsForItem[setKey];
                        request.abort();
                    }
                }

                delete _pendingRequests[itemKey];
            }
        };

        _this.getItem = function (itemKey, skipFetch, modifiedDate, setKey)
        {
            /// <summary>
            /// Get an item by key.
            /// </summary>
            /// <param name="itemKey" type="String">Item query</param>
            /// <param name="skipFetch" type="Boolean" optional="true">Skip fetching the item from server if not in memory cache.</param>
            /// <param name="modifiedDate" type="Number" optional="true">This is a known previous modified date for this item, that if correct will cause a cache hit.</param>
            /// <param name="setKey" type="String" optional="true">This is the set key used to fetch the item.</param>
            /// <returns type="wLive.Core.ISkyDriveItem">Item from cache, or null if cache miss.</returns>

            var item = /* @static_cast(wLive.Core.ISkyDriveItem) */null;

            if (itemKey)
            {
                // Check in-memory cache.
                item = /* @static_cast(wLive.Core.ISkyDriveItem) */(_items[itemKey] || null);

                if (!skipFetch)
                {
                    var isExpired = isNullOrExpired(item);
                    var ancestorsAvailable = hasAncestors(item, itemKey);

                    if (isExpired || (!ancestorsAvailable && item.id !== 'root'))
                    {
                        // Enqueue fetching the item and its first page.
                        if (_this.fetchItem(itemKey, setKey || wLiveCoreSkyDriveItem.getDefaultSetKey(), null, 0, false, item ? null : modifiedDate))
                        {
                            Trace.log("getItem miss - exists: " + (!!item) + ", expired: " + isExpired + ", hasAncestors: " + ancestorsAvailable + ", key: " + itemKey, c_traceCategory);
                        }
                    }
                }
            }

            return item;
        };

        _this.processResponse = function (response, itemKey, setKey)
        {
            /// <summary>
            /// Processes a GetItems response object. Can be used to prime the DataModel cache with data.
            /// </summary>
            /// <param name="response" type="wLive.Core.IJSONServiceResponse">Response from the json service to parse.</param>
            /// <param name="itemKey" type="String" optional="true">Request key that was used to identify the item that was requested.</param>
            /// <param name="setKey" type="String" optional="true">Set key used to idenify which child relationships to fetch.</param>
            /// <returns type="Boolean">True is the response caused items to change in the memory cache.</returns>

            var itemsChanged = false;

            // If relationshipsKey not provided, use the current default.
            setKey = setKey || wLiveCoreSkyDriveItem.getDefaultSetKey();

            var originalSetKey = setKey;

            if (/* @static_cast(Boolean) */response && /* @static_cast(Boolean) */response.items && !response.error)
            {
                var did = getKeyParamValue(itemKey, 'did');

                // Fix up the set key
                var setKeyParts = wLiveCore.SkyDriveItem.getSetKeyParts(setKey);
                if (setKeyParts.sb == SortFieldEnum.Default || setKeyParts.sd == SortDirectionEnum.Default)
                {
                    if (did)
                    {
                        var sortBy = setKeyParts.sb == SortFieldEnum.Default ? SortFieldEnum.Name : setKeyParts.sb;
                        var sortDirection = setKeyParts.sd;

                        if (sortDirection == SortDirectionEnum.Default)
                        {
                            sortDirection = (sortBy != SortFieldEnum.Name) ? SortDirectionEnum.Descending : SortDirectionEnum.Ascending;
                        }

                        setKey = wLiveCore.SkyDriveItem.getSetKey(sortBy + '', null, setKeyParts.ft, setKeyParts.gb, sortDirection + '');
                    }
                    else
                    {
                        setKey = wLiveCore.SkyDriveItem.getSetKey(response.sortOrder + '', null, setKeyParts.ft, setKeyParts.gb, response.sortDirection + '');
                    }
                }

                var items = response.items;

                preprocessGetItemsResponse(response);


                var baseUrl = response.baseUrl;

                if (did && baseUrl)
                {
                    var /* @type(wLive.Core.IDeviceItem)*/device = getDeviceFromDid(did);

                    if (device)
                    {
                        device.baseUrl = baseUrl;
                    }
                }

                for (var i = 0; i < items.length; i++)
                {
                    itemsChanged = processItem(items[i], itemKey, setKey, null, itemsChanged, originalSetKey) || itemsChanged;
                }

                // Once this gets set we don't want it to lose it's value, otherwise GetItems calls that don't
                // specify lastVersion will overwrite the value stored as the last version the user has seen.
                var item = _this.getItem(itemKey, true);

                /* @disable(0092) */
                if (response.lastVersion !== /* @static_cast(String) */undefined || (/* @static_cast(Boolean) */item && /* @static_cast(Boolean) */wLiveCore.SkyDriveItemHelper.isSkyDriveRoot(item) && /* @static_cast(Boolean) */wLiveCore.SkyDriveItemHelper.isViewerOwner(item)))
                {
                    /* @restore(0092) */
                    var /* @type(String) */lastVersion = FilesConfig.lastVersion || response.lastVersion;
                    var versionParts = lastVersion ? lastVersion.split(",") : [];

                    FilesConfig.lastVersion = versionParts[0] || "0";
                    (FilesConfig.freRenderIndex === undefined) && /* @static_cast(Boolean) */(FilesConfig.freRenderIndex = Number(versionParts[1] || "0"));
                }
            }

            return itemsChanged;
        };

        _this.suspendChangeEvents = function ()
        {
            /// <summary>
            /// Suspends the change event from firing. Change events will be queued up and refired when resumeChangeEvents is called.
            /// </summary>

            if (!_suspendedChangeEvents)
            {
                _suspendedChangeEvents = [];
            }
        };

        _this.resumeChangeEvents = function ()
        {
            /// <summary>
            /// Resumes the firing of change events and fires any pending change events that were fired during suppress state.
            /// </summary>

            if (_suspendedChangeEvents)
            {
                var itemsToUpdate = _suspendedChangeEvents;
                _suspendedChangeEvents = null;

                while (itemsToUpdate.length)
                {
                    _this._fireDataChanged(itemsToUpdate.pop());
                }

            }
        };

        _this.createSubfolder = function (parentItem, childItem, successCallback, failureCallback)
        {
            /// <summary>
            /// Creates a subfolder.
            /// </summary>
            /// <param name="parentItem" type="wLive.Core.ISkyDriveItem">Parent item.</param>
            /// <param name="childItem" type="wLive.Core.SkyDriveItem">Placeholder subfolder item.</param>
            /// <param name="successCallback" type="Object, wLive.Core.ISkyDriveItem -> void">Success callback.</param>
            /// <param name="failureCallback" type="Object, wLive.Core.ISkyDriveItem -> void">Failure callback.</param>

            var url = _baseUrl + 'AddFolder?' + c_skyApiCommonQueryParams;

            var postData = {
                parentId: parentItem.id,
                cid: parentItem.ownerCid,
                group: parentItem.group,
                name: childItem.name
            };

            /* @disable(0092) */
            if (wLiveCore.SkyDriveItemHelper.isRootItem(parentItem) && wLiveCore.PageController && (wLiveCore.PageController.getInstance().getViewContext().viewParams.sc == 'photos'))
            {
                /* @restore(0092) */
                // Make it a photo album if its a photos filter and its a root folder
                postData.category = 1;
            }

            var request = new wLiveCore.DataRequest(
                url,
                url,
                Object.toJSON(postData),
                function (response)
                {
                    /* @disable(0092) */
                    var item = response ? response.item : null;
                    childItem.processItem(item);
                    parentItem.updatePinnedSubfolderKey(childItem);
                    /* @restore(0092) */

                    // Add a lookup reference to the item in the global cache.
                    _items[childItem.key] = childItem;

                    parentItem.expire();
                    parentItem.invalidate();

                    successCallback && successCallback(response, childItem);
                },
                function (response)
                {
                    failureCallback && failureCallback(response, childItem);
                });

            request.start();
        };

        _this.updateItem = function (item, method, data, successCallback, failureCallback)
        {
            /// <summary>
            /// Asynchronously posts a call to an update API for the given item, and invalidates it on success.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to update.</param>
            /// <param name="method" type="String">Method specified in the url (e.g. "AddPeopleTag".)</param>
            /// <param name="data" type="String">Data object that will get serialized into a JSON string and sent as the POST body.</param>
            /// <param name="successCallback" type="Object, wLive.Core.ISkyDriveItem -> void">Callback called on success: function(response, item)</param>
            /// <param name="failureCallback" type="Object, wLive.Core.ISkyDriveItem -> void">Callback called on failure: function(response, item)</param>

            var url = _baseUrl + method + "?" + c_skyApiCommonQueryParams;

            var request = new wLiveCore.DataRequest(
                url + Math.random(),    // request key
                url,    // url
                data,   // post data
                function (response)
                {
                    /// <summary>
                    /// Success callback for making the UpdateItem request.
                    /// </summary>
                    /// <param name="response" type="wLive.Core.UpdateItemResponse">Response object.</param>

                    var /* @type(wLive.Core.SkyDriveItem) */successItem = response && response.item;
                    if (successItem)
                    {
                        var itemKey = wLiveCoreSkyDriveItem.getItemKey(successItem.id, successItem.ownerCid, successItem.group);
                        if (processItem(successItem, itemKey))
                        {
                            _this.getItem(itemKey).invalidate();
                        }
                    }

                    successCallback && successCallback(response, item);
                },
                function (response)
                {
                    /// <summary>
                    /// Failure callback for making the UpdateItem request.
                    /// </summary>

                    // Get the latest cached item in case any updates have happened before the server call returned.

                    if (failureCallback)
                    {
                        var /* @type(wLive.Core.ISkyDriveItem) */failureItem = _this.getItem(item.key, /* skipFetch: */true);
                        failureCallback(response, failureItem);
                    }
                }
            );

            request.start();
        };

        _this.updateItemProperties = function (item, properties, successCallback, failureCallback)
        {
            /// <summary>
            /// Update an item properties.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to update.</param>
            /// <param name="properties" type="Object">The object of properties to pass to the update items call.</param>
            /// <param name="successCallback" type="Function">Callback called on success: function(response, item)</param>
            /// <param name="failureCallback" type="Function">Callback called on failure: function(response, item)</param>

            var parentId = item.parentId;

            properties.id = item.id;

            if (/* @static_cast(Boolean) */parentId && (parentId !== 'root'))
            {
                properties.lid = item.parentId;
            }

            properties[c_skyApiPresetParameterName] = c_skyApiGetItemsResponsePreset;

            _this.updateItem
            (
                item,
                'UpdateItem',
                Object.toJSON(properties),
                successCallback,
                failureCallback
            );
        };

        _this.updateItemProperty = function (item, propertyName, propertyValue, successCallback, failureCallback, overrideLock)
        {
            /// <summary>
            /// Update an item property.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to update.</param>
            /// <param name="propertyName" type="String">The name of the property to update.</param>
            /// <param name="propertyValue" type="String">The new value of the property.</param>
            /// <param name="successCallback" type="Object, wLive.Core.ISkyDriveItem -> void">Callback called on success: function(response, item)</param>
            /// <param name="failureCallback" type="Object, wLive.Core.ISkyDriveItem -> void">Callback called on failure: function(response, item)</param>
            /// <param name="overrideLock" type="Boolean" optional="true">When true, forces an unlock before committing the update to the item.</param>

            var propertyUpdates = {};

            // to override and update a locked file, the caller will pass true
            // at which point we'll append "overrideLock" : "true" to the JSON post body
            var lockData = "";
            if (overrideLock)
            {
                lockData = ', "overrideLock":"true"';
            }

            var originalValue = item[propertyName];
            var propertyValueToServer = item[propertyName] = propertyValue;

            // The API requires the full name + extension.
            var extension = item.extension;
            if ((propertyName === "name") && /* @static_cast(Boolean) */extension)
            {
                propertyValueToServer += extension;
            }

            // Invalidate the item so that the UI can reflect the updates.
            item.invalidate();

            var parentId = item.parentId;

            _this.updateItem
            (
                item,
                'UpdateItem',
                '{"id":"' + item.id + '","' + propertyName + '":"' + propertyValueToServer.encodeJson() + (/* @static_cast(Boolean) */parentId && (parentId !== 'root') ? '","lid":"' + parentId.encodeJson() : '') + '","' + c_skyApiPresetParameterName + '":"' + c_skyApiGetItemsResponsePreset + '"' + lockData + '}',
                successCallback,
                function (response, failureItem)
                {
                    /// <summary>
                    /// Failure callback.
                    /// </summary>
                    /// <param name="response" type="wLive.Core.IJSONServiceResponse">Response object.</param>
                    /// <param name="failureItem" type="wLive.Core.ISkyDriveItem">Failure callback.</param>

                    failureCallback(response, failureItem);

                    if (failureItem[propertyName] === propertyValue)
                    {
                        failureItem[propertyName] = originalValue;

                        // Invalidate the item so that the UI can roll back the updates.
                        failureItem.invalidate();
                    }
                }

            );
        };

        _this.getPlaceholderItem = function (itemKey, name, hasChildren, options)
        {
            /// <summary>
            /// Returns the placeholder loading item.
            /// </summary>
            /// <param name="itemKey" type="String">The item key</param>
            /// <param name="name" type="String">The item name</param>
            /// <param name="hasChildren" type="Boolean">True if the placeholder item has children</param>
            /// <param name="options" type="Object">The options to mix into the placeholder</param>
            /// <returns type="wLive.Core.ISkyDriveItem">Returns a new instance of the "loading" item.</returns>

            // Clear out the name to allow the caller to override it.
            /* @disable(0053) */
            /* @disable(0092) */
            var placeholderItem = /* @static_cast(wLive.Core.ISkyDriveItem) */new wLiveCore.SkyDriveItem(_this, itemKey, null);
            /* @restore(0092) */
            /* @restore(0053) */
            var childCount = hasChildren ? 1 : 0;

            placeholderItem.processItem(
            {
                name: name,
                folder:
                {
                    totalCount: childCount, // undetermined child count to force the client to not render a 0 items message.
                    childCount: childCount
                },
                isPlaceholder: true,
                id: getKeyParamValue(itemKey, c_idKey),
                ownerName: "",
                ownerCid: getKeyParamValue(itemKey, c_cidKey).toUpperCase()
            });

            mix(placeholderItem, options);

            return placeholderItem;
        };

        _this.getLoadingItem = function (itemKey)
        {
            /// <summary>
            /// Returns the placeholder loading item.
            /// </summary>
            /// <returns type="wLive.Core.ISkyDriveItem">Returns a new instance of the "loading" item.</returns>

            return /* @static_cast(wLive.Core.ISkyDriveItem) */_this.getPlaceholderItem(itemKey, "", true, { _isLoadingItem: true });
        };

        _this.getGroupInformation = function (groupCid, itemKey, viewContext)
        {
            /// <summary>
            /// Get the groupInformation from the server
            /// </summary>
            /// <param name="groupCid" type="String">Group key to fetch.</param>
            /// <param name="viewContext" type="wLive.Core.ViewContext">ViewContext.</param>
            /// <returns type="*">Group information if available.</returns>

            Debug.assert(groupCid, "groupCid must be set to get group information");
            Debug.assert(viewContext, "ViewContext must be set");
            Debug.assert(viewContext.viewParams, "ViewContext.viewParams must be set");

            // create the request key
            var groupKey = "cid=" + groupCid.toLowerCase().encodeUrl();

            // add additional params
            var /* @type(wLive.Core.ViewContext.ViewParams) */viewParams = viewContext.viewParams;
            if (viewParams.authkey)
            {
                // multi-user ticket
                groupKey += "&authkey=" + (viewParams.authkey || '').encodeUrl();
            }
            if (viewParams.ticket)
            {
                // single-user ticket
                groupKey += "&ticket=" + (viewParams.ticket || '').encodeUrl();
            }

            var groupInfo = /* @static_cast(*) */(_groupInfo[groupKey]);

            if (!groupInfo)
            {
                fetchGroupInformation(groupKey, itemKey, _maxRetries);
            }

            return groupInfo;
        };

        _this.ensureCompletelyDownloaded = function (item, successCallback, failureCallback, setKey, indexes)
        {
            /// <summary>
            /// This ensures the items children have been completely downloaded.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to ensure that is completely downloaded.</param>
            /// <param name="successCallback" type="wLive.Core.ISkyDriveItem -> void">Success callback: function(item)</param>
            /// <param name="failureCallback" type="Object -> void">Failure callback: function(error)</param>
            /// <param name="setKey" type="String" optional="true">Set key for item's children.</param>
            /// <param name="indexes" type="Array" optional="true">An array of indexes to ensure are downloaded.</param>

            setKey = setKey || wLiveCoreSkyDriveItem.getDefaultSetKey();

            var itemKey = item.key;

            var modifiedDateChanges = 0;
            var itemModifiedDate = item.modifiedDate;

            tryGetAllChildren();

            function fetchError(error)
            {
                /// <summary>
                /// This is called when a fetch error happens.
                /// </summary>
                /// <param name="error" type="Object">The response error.</param>

                Trace.log("EnsureCompletelyDownloaded fetch error: itemKey - " + itemKey + " setKey - " + setKey, c_traceCategory);

                failureCallback(error);
            }

            function tryGetAllChildren()
            {
                /// <summary>
                /// This tries to get all of the specified children.
                /// </summary>

                var allChildrenAreLoaded = true;
                var fetchIndex = 0;

                // Check the modified date to see if we have a load loop
                if (itemModifiedDate != item.modifiedDate)
                {
                    Trace.log("EnsureCompletelyDownloaded refresh loop detected: modifiedDateChanges - " + modifiedDateChanges + " itemModifiedDate - " + itemModifiedDate + " item.modifiedDate - " + item.modifiedDate, c_traceCategory);

                    modifiedDateChanges++;
                    itemModifiedDate = item.modifiedDate;
                }

                if (modifiedDateChanges > c_maxModifiedChangesBeforeError)
                {
                    Trace.log("EnsureCompletelyDownloaded refresh loop hit: modifiedDateChanges - " + modifiedDateChanges + " itemModifiedDate - " + itemModifiedDate + " item.modifiedDate - " + item.modifiedDate, c_traceCategory);

                    // We have caught a load loop so fail the request
                    failureCallback(null);
                }
                else
                {
                    var childSet = item.getChildren(setKey);

                    // Make sure the set is loaded
                    if (childSet)
                    {
                        // Test if we are already loaded
                        if (childSet.isComplete())
                        {
                            allChildrenAreLoaded = true;
                        }
                        else if (indexes) // Test if we are checking a few indexes or loading all of the children
                        {
                            // Check the indexes 
                            for (var i = 0; i < indexes.length; i++)
                            {
                                var index = indexes[i];
                                if (!childSet.get(index, true))
                                {
                                    allChildrenAreLoaded = false;
                                    fetchIndex = index;
                                    break;
                                }
                            }
                        }
                        else
                        {
                            // Check all of the children
                            var count = childSet.getCount();
                            for (var x = 0; x < count; x++)
                            {
                                if (!childSet.get(x, true))
                                {
                                    allChildrenAreLoaded = false;
                                    fetchIndex = x;
                                    break;
                                }
                            }
                        }
                    }
                    else
                    {
                        // We have no child set so do the fetch
                        allChildrenAreLoaded = false;
                    }

                    if (allChildrenAreLoaded)
                    {
                        // Call the callback function.
                        successCallback(item);
                    }
                    else
                    {
                        Trace.log("EnsureCompletelyDownloaded fetch item: itemKey - " + itemKey + " setKey - " + setKey + " fetchIndex - " + fetchIndex, c_traceCategory);

                        // get the items children
                        _this.fetchItem(itemKey, setKey, null, fetchIndex, false, null, tryGetAllChildren, fetchError);
                    }
                }
            }
        };

        _this.fetchItem = function (itemKey, setKey, startId, startIndex, shouldForceCacheBreak, modifiedDate, successCallback, failureCallback, fetchDepth, customExtendedParameters)
        {
            /// <summary>
            /// Get the item from the server.
            /// </summary>
            /// <param name="itemKey" type="String">Item key to fetch.</param>
            /// <param name="setKey" type="String">Set key for item's children.</param>
            /// <param name="startId" type="String">The id of the first child to return for the item. Mutually exclusive with startIndex.</param>
            /// <param name="startIndex" type="Number">The index of the first child to return for the item. Mutually exclusive with startId.</param>
            /// <param name="shouldForceCacheBreak" type="Boolean" optional="true">Whether we should force cache break or not.</param>
            /// <param name="modifiedDate" type="String" optional="true">This is a known previous modified date for this item, that if correct will cause a cache hit.</param>
            /// <param name="successCallback" type="wLive.Core.ISkyDriveItem -> void" optional="true">Optional success callback: function(item)</param>
            /// <param name="failureCallback" type="Object -> void" optional="true">Optional failure callback: function(error)</param>
            /// <param name="fetchDepth" type="Number" optional="true">The depth at which fetch should be made.</param>
            /// <param name="customExtendedParameters" type="String" optional="true">Custome extended parameters for fetching extended properties of an item.</param>
            /// <returns type="Boolean">True if we're going to actively fetch this item; false if it's already being fetched.</returns>

            // Test stub for mocking a private method.
            ///

            // Allow mock responses for unit test purposes.
            ///

            var pageSize = _pageSize;

            // If we don't have a starting Id, move the start index to the appropriate location.
            if (!startId)
            {

                // Move index to a page break to ensure we download cacheable urls.
                startIndex -= (startIndex % _pageSize);

                // If we are not at index 0, start on the previous page and download 2 pages to avoid
                // rendering on a page crease. The issue we're solving here is to reduce the ping pong effect
                // when we render a folder that's changing very frequently.
                //
                // Example: Download page 2, page 2 reveals the folder has changed, we discard page 1, we
                // download page 1, this reveals the folder has changed, we discard and download page 2, etc.)
                if (startIndex)
                {
                    startIndex -= _pageSize;
                    pageSize = _pageSize * 2;
                }
            }

            /* @disable(0092) */
            // This method only exists when in admin mode. It checks to see if the querytype matches any known admin views,
            // and if not returns null, therefore continuing with the normal flow.
            var replacementGetItemsUrl = _this.replaceGetItemsUrl && _this.replaceGetItemsUrl(itemKey, _baseUrl);
            /* @restore(0092) */

            var requestBaseUrl = replacementGetItemsUrl || createGetItemsUrl(itemKey, setKey, startId, startIndex, pageSize, fetchDepth, customExtendedParameters);

            // If the item exists and is not expired, it's OK to refer to a cacheable url. Otherwise if it doesn't exist or is expired,
            // tack on a random number to ensure the request is not a cache hit
            var existingItem = _this.getItem(itemKey, true);

            // Origin id is used as a pass through header (returns in the response) as a method of indicating if the response
            // came from the server or from the browser cache.
            var originId = Math.random();

            var /* @type(wLive.Core.SkyDriveItem) */item = _this.getItem(itemKey, true);
            if (/* @static_cast(Boolean) */item && item.hasExpired())
            {
                shouldForceCacheBreak = true;
            }

            var version;
            /* @disable(0092) */
            if (wLiveCore.Search && isSearchRootKey(itemKey) && !shouldForceCacheBreak)
            {
                version = wLiveCore.Search.getSearchOrigin(getKeyParamValue(itemKey, 'q'));
            }
            /* @enable(0092) */
            else
            {
                version = (((/* @static_cast(Boolean) */existingItem || /* @static_cast(Boolean) */modifiedDate) && !shouldForceCacheBreak) ? (modifiedDate || existingItem.modifiedDate) : originId);
            }

            // In normal circumstances, we will provide the existing item's last modified date in the request url.
            // If we don't know the item's last modified date, OR we've run into a force cache break scenario, we will use
            // the origin id to force the url to be unique.
            var optionalAuthParams = FilesConfig.authKey
                    ? "&authkey=" + FilesConfig.authKey.encodeUrl()
                    : (FilesConfig.ticket ? "&ticket=" + FilesConfig.ticket.encodeUrl() : '');

            var requestUrl = requestBaseUrl + "&v=" + version + optionalAuthParams;
            var isDeviceRequest = !!wLiveCore.SkyDriveItem.getItemKeyParts(itemKey).did;

            var request = new wLiveCore.DataRequest(requestBaseUrl, requestUrl, null,
            function onSuccess(responseObject)
            {
                handleServerResponse(responseObject, itemKey, setKey, startId, startIndex, originId);

                successCallback && successCallback(_this.getItem(itemKey, true));
            },
            function onError(responseObject)
            {
                handleServerResponse(responseObject, itemKey, setKey, startId, startIndex, originId);

                failureCallback && failureCallback(responseObject ? responseObject.error : null);
            }, isDeviceRequest ? c_deviceRequestTimeout : c_requestTimeout);

            // Set the origin id for the request.
            request.originId = originId;

            request.failureReentranceDelay = c_getItemsFailureReentranceDelay;

            var fetchingItem = request.start();

            if (fetchingItem)
            {

                var pendingRequestsForItem = _pendingRequests[itemKey] = _pendingRequests[itemKey] || {};
                pendingRequestsForItem[setKey] = request;
                pendingRequestsForItem["count"] = (pendingRequestsForItem["count"] || 0) + 1;
            }

            return fetchingItem;
        }; // end: fetchItem

        _this.dispose = function ()
        {
            /// <summary>
            /// Processes the response from the server and re-enqueues the request if it fails and there are retries left.
            /// </summary>

            for (var x in _pendingRequests)
            {
                _pendingRequests[x].abort();
            }

            _this.disposeEvents();
        };


        _this._fireDataChanged = function (item)
        {
            /// <summary>
            /// Fires the change event on the given item.
            /// </summary>
            /// <param name="item" type="wLive.Core.SkyDriveItem">Item to invalidate (will invalidate ancestors as well.)</param>

            if (!_suspendedChangeEvents)
            {
                _this.raiseEvent(DataModel.dataChangedEvent, item);
            }
            else
            {
                _suspendedChangeEvents.push(item);
            }

        };


        function handleServerResponse(response, itemKey, setKey, startId, startIndex, originId)
        {
            /// <summary>
            /// Processes the response from the server and re-enqueues the request if it fails and there are retries left.
            /// </summary>
            /// <param name="response" type="wLive.Core.IJSONServiceResponse">Data coming back from the json service.</param>
            /// <param name="itemKey" type="String">Key for the request, used to identify the requested item in the response.</param>
            /// <param name="setKey" type="String">Key for the item's child set.</param>
            /// <param name="startId" type="String">Id of the first child to request.</param>
            /// <param name="startIndex" type="Number">Index of the first child to request.</param>
            /// <param name="originId" type="String">Origin id used to determine if the server response came from cache or not.</param>

            var pendingRequestsForItem = _pendingRequests[itemKey];
            if (pendingRequestsForItem)
            {
                delete pendingRequestsForItem[setKey];
                pendingRequestsForItem["count"]--;

                if (!pendingRequestsForItem["count"])
                {
                    delete _pendingRequests[itemKey];
                }
            }

            Debug.assert(response, "The response from the server was null. This is totally unexpected.");
            Debug.assert(!response || /* @static_cast(Boolean) */response.items || /* @static_cast(Boolean) */response.error, "The response has neither items or error. This is totally unexpected.");

            if (/* @static_cast(Boolean) */response && /* @static_cast(Boolean) */response.items && !response.error)
            {
                var responseCameFromCache = (/* @static_cast(Boolean) */originId && originId != response.originId);

                // If the response came from browser cache, and the item is null or expired, we need to ask the server for the real
                // state of the item. In this condition we'll refetch the item but force a cache break.
                var shouldRevalidateFromServer = responseCameFromCache && isNullOrExpired(_this.getItem(itemKey, true));

                var itemsChanged = _this.processResponse(response, itemKey, setKey);

                Trace.log("Received response: (fromCache: " + responseCameFromCache + ", revalidating: " + shouldRevalidateFromServer + ", itemsChanged: " + itemsChanged + ")", c_traceCategory);

                // Get the item requested, which should be in the response.
                var item = _this.getItem(itemKey, true);

                Debug.assert(item != null, "A getItems request was made to the server, but after processing the response, the item is still not available in the cache. itemKey=(" + itemKey + ")");

                if (item)
                {
                    // fire data changed event only if it actually has changed.
                    if (itemsChanged)
                    {
                        item.invalidate(/* suppressVersionIncrement */true);
                    }
                }

                // Resubmit the request if necessary (got a cached response for an expired item.)
                if (shouldRevalidateFromServer)
                {
                    _this.fetchItem(itemKey, setKey, startId, startIndex, true);
                }
            }
            else
            {
                var error = response ? response.error : { debugMessage: "Server returned no success or failure" };

                // Test if we should refetch the request because there is a new device id
                var did = /* @static_cast(String) */getKeyParamValue(itemKey, 'did');
                if (did)
                {
                    var /* @type(wLive.Core.IDeviceItem)*/device = getDeviceFromDid(did);

                    /* @disable(0092) */
                    if (/* @static_cast(Boolean) */device && /* @static_cast(Boolean) */device.baseUrl && wLiveCore.DeviceItem.hasNewBaseUrlError(error, did))
                    {
                        /* @restore(0092) */
                        _this.fetchItem(itemKey, setKey, startId, startIndex, true);
                    }
                }

                // we got an invalid JSON Api response.
                $WebWatson.submit("JSON error", itemKey, 0, error.debugMessage, error.code, error.stackTrace, 0, true);

                // fire error event.
                error.key = itemKey;
                _this.raiseEvent(DataModel.errorEvent, error);
            }
        }

        function getDeviceFromDid(did)
        {
            /// <summary>
            /// This returns the device from a did.
            /// </summary>
            /// <param name="did" type="String">The device id.</param>
            /// <returns type="wLive.Core.IDeviceItem">The device item.</returns>

            /* @disable(0092) */
            var deviceItemSet = /* @static_cast(wLive.Core.ItemSet) */wLiveCore.PageController.getInstance().getViewContext().deviceItemSet;
            /* @restore(0092) */
            return /* @static_cast(wLive.Core.IDeviceItem) */deviceItemSet.getByKey(did.toLowerCase());
        }

        function keyContainsId(itemKey, id)
        {
            /// <summary>
            /// Determines if the key contains the given id.
            /// </summary>
            /// <param name="key" type="String">Item key.</param>
            /// <param name="id" type="String">Id of an item.</param>
            /// <returns type="Boolean">True if the key contains the id.</returns>

            keyComponents = /* @static_cast(wLive.Core.ViewContext.ViewParams) */wLiveCoreSkyDriveItem.getItemKeyParts(itemKey);

            return (wLiveCore.StringHelpers.caseInsensitiveStringEquals(keyComponents.id, id) || (!id && !keyComponents.id));
        } // end: keyContainsId

        function getKeyParamValue(key, param)
        {
            /// <summary>
            /// Get the string value of the param from the key.
            /// </summary>
            /// <param name="key" type="String">Key to be parsed.</param>
            /// <param name="param" type="String">Param name to be parsed out.</param>

            var keyComponents = /* @static_cast(wLive.Core.ViewContext.ViewParams) */wLiveCoreSkyDriveItem.getItemKeyParts(key);

            return keyComponents[param];
        }

        function processItem(itemFromResponse, requestKey, setKey, parentKey, changesMade, originalSetKey)
        {
            /// <summary>
            /// Processes a single item from the json response. If the item matches the id in the request key,
            /// we will use the request key as the item's key. Otherwise we will build a key based on the item contents
            /// (which may not have enough
            /// </summary>
            /// <param name="itemFromResponse" type="wLive.Core.ISkyDriveItem">Item from response.</param>
            /// <param name="requestKey" type="String" optional="true">Key used for request.</param>
            /// <param name="setKey" type="String" optional="true">This is the real set key for the request, this may be different from the orginal if you queried for the default sort, or default sort direction.</param>
            /// <param name="parentKey" type="String" optional="true">Parent key to set on children.</param>
            /// <param name="changesMade" type="Boolean" optional="true">Whether processed items have caused changes in the cache.</param>
            /// <param name="originalSetKey" type="String" optional="true">This is the original set key to add the child item set too.</param>
            /// <returns type="Boolean">Whether processed items have caused changes in the cache (returns true if changesMade was already true.)</returns>

            Debug.assert(itemFromResponse != null, "processItem was called with a null item.");
            Debug.assert(!!itemFromResponse.id, "processItem was called with an item without an id.");

            // The request key contains the full query for the request, while the generated key from the item doesn't.
            // We need to match the item in the response with the request key so that we preserve that key.
            var itemKey;
            var keyParts = wLiveCoreSkyDriveItem.getItemKeyParts(requestKey);

            if (requestKey && keyContainsId(requestKey, itemFromResponse.id))
            {
                itemKey = requestKey;
            }
            else
            {
                itemKey = wLiveCoreSkyDriveItem.getItemKey(
                    itemFromResponse.id,
                    itemFromResponse.ownerCid,
                    itemFromResponse.group,
                    keyParts["qt"],
                    keyParts["did"],
                    keyParts["q"],
                    keyParts["sft"]);
            }

            var itemInCache = /* @static_cast(wLive.Core.ISkyDriveItem) */_this.getItem(itemKey, true);
            var folder = itemFromResponse.folder;

            // The parentKey will initially be null for depth 0 items in the response. In this case we need to derive it
            // either by the item being a root item (parentKey stays null), by the item's in cache parentKey value, or 
            // by looking at the parentId on the item itself.
            if (!parentKey && /* @static_cast(Boolean) */itemFromResponse.parentId)
            {
                if (keyParts["qt"] === 'search')
                {
                    // For search results, the parent ID will be the actual parent,
                    // but the key needs to point to the search root.
                    parentKey = wLiveCoreSkyDriveItem.getItemKey(
                        'root',
                    /* ownerCid: */undefined,
                    /* group: */0,
                        keyParts["qt"],
                    /* deviceId: */0,
                        keyParts["q"],
                        keyParts["sft"]);
                }
                else
                {
                    parentKey = wLiveCoreSkyDriveItem.getItemKey(
                        itemFromResponse.parentId,
                        itemFromResponse.ownerCid,
                        itemFromResponse.group,
                        keyParts["qt"],
                        keyParts["did"]);
                }
            }

            // if item is not in cache, store this item in cache.
            if (!itemInCache)
            {
                changesMade = true;
                /* @disable(0053) */
                /* @disable(0092) */
                itemInCache = _items[itemKey] = new wLiveCore.SkyDriveItem(_this, itemKey, parentKey);
                /* @restore(0092) */
                /* @restore(0053) */

                // Add the special folder under the canoncial name
                if (itemFromResponse.isSpecialFolder && itemKey != requestKey)
                {
                    var specialFolderKey = wLiveCoreSkyDriveItem.getItemKey(
                        itemFromResponse.specialFolderCanonicalName.toLowerCase(),
                        itemFromResponse.ownerCid,
                        itemFromResponse.group,
                        null,
                        keyParts["did"]);
                    _items[specialFolderKey] = itemInCache;
                }
            }

            changesMade = itemInCache.processItem(itemFromResponse) || changesMade;

            // if the item from response is a folder, update child references and process the children returned with this item.
            if (folder)
            {
                var children = itemInCache.getChildren(setKey);

                // We need to update the secondary set key with this children item set
                if (/* @static_cast(Boolean) */originalSetKey && setKey != originalSetKey)
                {
                    /* @disable(0092) */
                    changesMade = changesMade || itemInCache._childSets[originalSetKey] !== children;
                    /* @restore(0092) */
                    itemInCache._childSets[originalSetKey] = children;
                }

                // For device roots convert header items.
                /* @disable(0092) */
                wLiveCore.SkyDriveItemHelper.isDeviceRoot(itemInCache) && _convertHeaderItemsIntoGroups(folder);
                /* @restore(0092) */

                // update count if necessary.
                if ((children.modifiedDate != itemInCache.modifiedDate || children.getCount(true) != folder.childCount) && folder.childCount != undefined)
                {
                    /* @static_cast(Boolean) */(folder.groupings) && !(itemInCache.hasMoreResults === true || itemInCache.hasMoreResults === false) && /* @static_cast(Boolean) */(children.groupings = folder.groupings);
                    children.modifiedDate = itemInCache.modifiedDate;
                    children.setCount(folder.childCount);

                    // we set the groupings so we need to update the requires filter
                    children._requiresFilter = true;

                    changesMade = true;
                }

                // Update the photo count.
                /* @disable(0092) */
                (folder.photoCount !== undefined) && /* @static_cast(Boolean) */(itemInCache.folder.photoCount = folder.photoCount);
                /* @restore(0092) */

                var qt = getKeyParamValue(requestKey, 'qt');
                var q = getKeyParamValue(requestKey, 'q');
                var sft = getKeyParamValue(requestKey, 'sft');

                if (folder.children)
                {
                    var startIndex = folder.startIndex || 0;

                    if (startIndex + folder.children.length > folder.totalCount)
                    {
                        // If the child count is zero, it could be that the data actually changed (e.g. results deleted)
                        // so we don't assert.  Otherwise, it means that the totalCount is simply wrong.
                        Debug.assert(folder.children.length == 0, "Max child index exceeds specified total count.");

                        var newsize = folder.totalCount - startIndex;
                        folder.children.length = newsize > 0 ? newsize : 0;
                    }

                    for (var i = 0, index = startIndex; i < folder.children.length; i++, index++)
                    {
                        var childItemFromServer = /* @static_cast(wLive.Core.ISkyDriveItem) */folder.children[i];
                        var childKey = wLiveCoreSkyDriveItem.getItemKey(
                            childItemFromServer.id,
                            childItemFromServer.ownerCid,
                            childItemFromServer.group,
                            qt,
                            itemInCache.did,
                            q,
                            sft);

                        changesMade = processItem(childItemFromServer, childKey, setKey, itemKey, changesMade) || changesMade;
                        changesMade = children.set(index, _this.getItem(childKey, true)) || changesMade;
                    }
                }
            }

            return changesMade;
        } // end: processItem

        function preprocessGetItemsResponse(response)
        {
            /// <summary>
            /// Sets the tokenNeedsRedeeming and tokenType on this item and it's children.
            /// </summary>
            /// <param name="response" type="wLive.Core.IJSONServiceResponse">JSON Response.</param>

            var items = response.items;
            var tokenNeedsRedeeming = response.tokenNeedsRedeeming;
            var tokenType = response.tokenType;

            for (var i = 0; i < items.length; i++)
            {
                var item = /* @static_cast(wLive.Core.ISkyDriveItem) */items[i];
                if (item.id != 'root' && /* @static_cast(Boolean) */tokenNeedsRedeeming && tokenType != /* @static_cast(Number) */null)
                {
                    item.tokenNeedsRedeeming = tokenNeedsRedeeming;
                    item.tokenType = tokenType;

                    var folder = item.folder;
                    if (folder && folder.children)
                    {
                        for (var j = 0, index = (folder.startIndex || 0); j < folder.children.length; j++)
                        {
                            var child = /* @static_cast(wLive.Core.ISkyDriveItem) */folder.children[j];
                            child.tokenNeedsRedeeming = tokenNeedsRedeeming;
                            child.tokenType = tokenType;
                        }
                    }
                }
            }
        }

        function createGetItemsUrl(itemKey, setKey, startId, startIndex, pageSize, depth, customExtendedParameters)
        {
            /// <summary>
            /// Get the item from the server.
            /// </summary>
            /// <param name="itemKey" type="String">Item key to fetch.</param>
            /// <param name="setKey" type="String">Key for item's child set to fetch.</param>
            /// <param name="startId" type="Number">Starting id.</param>
            /// <param name="startIndex" type="Number">Index of child to start on.</param>
            /// <param name="pageSize" type="Number">Size of page to download.</param>
            /// <param name="depth" type="Number" optional="true">Depth of the call, for single item depth=0.</param>
            /// <param name="customExtendedParameters" type="String" optional="true">Custom extended parameters.</param>
            /// <remarks>
            /// Example url and how we build each part:
            /// 
            /// the base url is derived off the current url. We want it to be overridable however using a qs param on the page. Also in M2 when
            /// we want to support fetching items from other json urls, we'd want to check the item's data source id to determine which base url
            /// to use.
            ///
            /// If the domain is different from location.host, XHR won't work and we have to use JSONP or iframe posting.
            ///
            /// http[s]://currentdomain.live.com/api/2    // base api url, provided at c'tor time. At server rendering time, it's assumed protocol will always match page.
            /// /getItems?                                // action name.
            ///
            /// key will be expected to contain these parameters if important to the queury (will already be url encoded and ready to append):
            ///
            /// id={item id}&amp;
            /// cid={owner cid}&amp; (optional)
            /// qt={query type}&amp; (optional)
            ///
            /// these are in the key, but are optional since we usually only care about server defaults:
            ///
            /// ft={filter type}&amp;
            /// sb={sort by}&amp;
            /// sr={sort reverse}&amp;
            ///
            /// extra parameters not in key that we need to take care of here:
            ///
            /// d={depth or default to 1};
            /// caller={caller cid} &amp;
            /// path={0 for all depth=0 calls or calls which do not require ancestors fetch, 1=get ancestors}&amp;
            /// si={startIndex}&amp;
            /// ps={pageSize}&amp;
            /// pi={count of previewItems}&amp;
            /// m={market}&amp;
            /// v={date modified}
            ///
            /// </remarks>

            Debug.assert(/* @static_cast(Boolean) */startId || startIndex >= 0, "While creating a GetItems url, both startId and startIndex were not provided.");

            var item = _this.getItem(itemKey, true);
            var library = getLibrary(item);

            // Any extra parameters that should be added.
            var extraQueryParams = customExtendedParameters ? customExtendedParameters : _this.extraGetItemsParams;

            /* @disable(0092) */
            var /* @dynamic */pageController = wLiveCore.PageController && wLiveCore.PageController.getInstance();
            var /* @dynamic */viewContext = pageController && pageController.getViewContext();
            /* @restore(0092) */

            var /* @type(wLive.Core.ViewContext.ViewParams) */viewParams = viewContext && viewContext.viewParams;

            var extraParameters =
                (depth === undefined ? "&d=1" : "&d=" + depth) +         // depth, default to 1.
                "&iabch=1" +                                            // if possible, ignore ABCH failures.
                "&lid=" + (library ? library.id : '') +      // add the library id.
                "&caller=" + _callerCid +                               // caller cid, used as a cache breaker.
                "&path=" + (depth === 0 || hasAncestors(item, itemKey) ? "0" : "1") + // depth=0 requests should have path=0, otherwise fetch ancestors by setting path=1 if we don't already have ancestors from cache.
                (startId ? "&sid=" + startId : "&si=" + startIndex) +   // startIndex or key for children, aligned to a page.
                "&ps=" + pageSize +                                     // max number of children to retrieve.
                "&pi=5" +                                               // number of cover images for albums.
                "&m=" + _market +                                       // market of user.
                "&" + c_skyApiPresetParameterName + "=" + c_skyApiGetItemsResponsePreset + // Response fields preset
                "&" + c_skyApiCommonQueryParams +                       // params common to all SkyApi requests, e.g. enabling live.com thumbnails.
                (/* @static_cast(Boolean) */viewParams && (viewParams.v == FilesConfig.filePickerViewParam && viewParams.auth == FilesConfig.skyDrivePickerOAuth) ? "&urlType=2" : '') + // FilePickerView needs pre-Authenticated download urls.
                extraQueryParams;                                       // any extra parameters that we should always add. (MoSky needs some extra thumbnails.

            // For mobile scenarios, the server may return different thumbnails. Make sure to break cache in these cases.
            if ($B.Mobile)
            {
                extraParameters += "&isMobile=1";
            }

            // TODO: Resolve the remove access url. For now until remote access service is online, default to the test server.
            var baseUrl = _baseUrl;

            // Test if this is a device url
            if (itemKey.indexOf("&did=") !== -1)
            {
                // Get the device for this url
                var /* @type(wLive.Core.IDeviceItem)*/device = getDeviceFromDid(getKeyParamValue(itemKey, 'did'));

                baseUrl = (/* @static_cast(Boolean) */device && /* @static_cast(Boolean) */device.baseUrl) ? device.baseUrl : FilesConfig.devicesBaseUrl;

                // fix up did url
                var setKeyParts = wLiveCore.SkyDriveItem.getSetKeyParts(setKey);
                if (setKeyParts.sd !== undefined)
                {
                    var sortReverse = '0';
                    if (setKeyParts.sb == SortFieldEnum.Default ||
                        setKeyParts.sb == SortFieldEnum.Name)
                    {
                        sortReverse = setKeyParts.sd == SortDirectionEnum.Descending ? '1' : '0';
                    }
                    else
                    {
                        sortReverse = setKeyParts.sd == SortDirectionEnum.Ascending ? '0' : '1';
                    }

                    setKey = setKey.replace("sd=" + setKeyParts.sd, "sr=" + sortReverse);
                }
            }

            return baseUrl + "GetItems?" + itemKey + "&" + setKey + extraParameters;
        } // end: createGetItemsUrl

        function getLibrary(item)
        {
            /// <summary>
            /// Returns the library of the item, or null.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item used to check for parents.</param>

            var parentItem = item ? item.getParent(true) : null;

            // While the parentItem is not the root, iterate up the heirarchy.
            while (/* @static_cast(Boolean) */parentItem && /* @static_cast(Boolean) */parentItem.parentKey)
            {
                item = parentItem;
                parentItem = parentItem.getParent(true);
            }

            // If we have a parentItem, we know that item has a parent, and that the parent doesn't have a parentKey.
            return parentItem ? item : null;
        }

        function isNullOrExpired(item)
        {
            /// <summary>
            /// Determines if the given item is a null or expired item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item used to check for parents.</param>
            /// <returns type="Boolean">True if the item's ancestors are in the cache.</returns>

            return (!item || item.hasExpired());
        }

        function isSearchRootKey(itemKey)
        {
            /// <summary>
            /// Determines if an item key is for a search root.
            /// </summary>
            /// <param name="itemKey" type="String" optional="true">Item key</param>
            /// <returns type="Boolean">True if the item key is for a search root.</returns>

            return /* @static_cast(Boolean) */itemKey && (getKeyParamValue(itemKey, 'qt') === 'search') && (getKeyParamValue(itemKey, 'id') === 'root');
        }

        function isRecycleBinRootKey(itemKey)
        {
            /// <summary>
            /// Determines if an item key is for a search root.
            /// </summary>
            /// <param name="itemKey" type="String" optional="true">Item key</param>
            /// <returns type="Boolean">True if the item key is for a search root.</returns>

            return /* @static_cast(Boolean) */itemKey && (getKeyParamValue(itemKey, 'qt') === 'recyclebin') && (getKeyParamValue(itemKey, 'id') === 'root');
        }

        function hasAncestors(item, itemKey)
        {
            /// <summary>
            /// Determines if we have ancestors of the given item in the cache.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item used to check for parents.</param>
            /// <param name="itemKey" type="String" optional="true">Item key</param>
            /// <returns type="Boolean">True if the item's ancestors are in the cache.</returns>

            var libraryItem = getLibrary(item);

            // search roots never have ancestors
            // !! means to cast to Boolean. Unit tests like true bools better than "object" responses.
            return (isSearchRootKey(itemKey) || isRecycleBinRootKey(itemKey)) ? false : !!((/* @static_cast(Boolean) */item && !item.parentKey) || (/* @static_cast(Boolean) */libraryItem && /* @static_cast(Boolean) */_this.getItem(libraryItem.parentKey, true)));
        } // end: hasAncestors

        function fetchGroupInformation(groupKey, itemKey, retriesLeft)
        {
            /// <summary>
            /// Get the groupInformation from the server
            /// </summary>
            /// <param name="groupKey" type="String">Group key to fetch.</param>
            /// <param name="itemKey" type="String">Key for the group root item.</param>
            /// <param name="retriesLeft" type="Number">The number of retriest left.</param>

            var requestUrl = _baseUrl + "GetGroupInfo?" + groupKey + "&retrieveMembership=true";

            var request = new wLiveCore.DataRequest(
                requestUrl,
                requestUrl,
                null,
                function (responseObject)
                {
                    /// <summary>
                    /// Success callback for getting group info.
                    /// </summary>
                    /// <param name="responseObject" type="wLive.Core.IJSONServiceResponse">Data coming back from the json service.</param>
                    /* @disable(0092) */
                    var groupInfo = new wLiveCore.GroupInfo(responseObject.groupInfo, groupKey);
                    /* @restore(0092) */
                    _groupInfo[groupKey] = groupInfo;

                    // raise the event so that the new data can get rendered
                    _this.raiseEvent(DataModel.groupInfoChangedEvent);
                });

            request.start();
        }; // end: fetchGroupInformation

        // Stubs for testing the DataModel.
        ///

    } // end: DataModel

    function _convertHeaderItemsIntoGroups(folder)
    {
        /// <summary>Translation function to translate device root responses to include the normalized group definitions.</summary>
        /// <param name="folder" type="wLive.Core.ISkyDriveFolder">Folder from response.</param>

        // Only do this is we have a child count
        if (folder.childCount !== undefined)
        {
            var childCount = folder.childCount;
            var newChildren = [];
            var groupings = [];
            var /* @dynamic */currentGrouping = null;

            for (var i = 0; i < childCount; i++)
            {
                var child = /* @static_cast(wLive.Core.ISkyDriveItem) */folder.children[i];

                if (child.isHeader)
                {
                    (currentGrouping && currentGrouping.count) && groupings.push(currentGrouping);
                    currentGrouping = { groupingId: "folder", name: child.name, startIndex: newChildren.length, endIndex: newChildren.length, count: 0 };
                }
                else
                {
                    currentGrouping.endIndex = newChildren.length;
                    newChildren.push(child);
                    currentGrouping.count++;
                }
            }

            currentGrouping && currentGrouping.count && groupings.push(currentGrouping);
            folder.groupings = groupings;
            folder.children = newChildren;

            folder.totalCount = newChildren.length;
            folder.childCount = newChildren.length;
        }
    }

    // Adds eventing to the data model
    var dataModelPrototype = DataModel.prototype;
    var wLiveCoreEvents = wLiveCore.Events;
    dataModelPrototype.addListener = wLiveCore.Events.addListener;
    dataModelPrototype.removeListener = wLiveCoreEvents.removeListener;
    dataModelPrototype.disposeEvents = wLiveCoreEvents.disposeEvents;
    dataModelPrototype.raiseEvent = wLiveCoreEvents.raiseEvent;

    ///

})();


/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var c_stringEmpty = '';
    var _viewContext = null;
    var itemHelper = wLive.Core.SkyDriveItemHelper;

    function _getViewContext()
    {
        /// <summary>
        /// This function get a refence to the view context
        /// </summary>
        /// <returns type="wLive.Core.ViewContext">This is the view context.</returns>

        if (!_viewContext)
        {
            // Suppressing the warning because we can assume this method will never execute until the page controller is available and instantiated.
            /* @disable(0092) */
            _viewContext = wLive.Core.PageController.getInstance().getViewContext();
            /* @restore(0092) */
        }
        return /* @static_cast(wLive.Core.ViewContext) */_viewContext;
    }

    function encodeURIComponentHelper(s)
    {
        /// <summary>
        /// Executes encodeURIComponent on the string.
        /// </summary>
        /// <param name="s" type="String">The String to encode.</param>
        return s ? s.encodeURIComponent() : c_stringEmpty;
    }

    function getCid(item, vContext, filesConfig, cid)
    {
        /// <summary>
        /// Gets the right cid to pass to the next page
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
        /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
        /// <param name="filesConfig" type="FilesConfig">The files config.</param>
        /// <param name="cid" type="String" optional="true">The cid to use.</param>
        var ownercid = item ? item.ownerCid : null;
        return cid ? cid : (ownercid || vContext.callerCid);
    }

    wLive.Core.ItemActionHelper =
    {
        itemStringFormat: function (s, item, cid, isGroup)
        {
            /// <summary>
            /// This is a helper function that formats the string with the item passed.
            /// </summary>
            /// <param name="s" type="String">The String to format.</param>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to use in the format.</param>
            /// <param name="cid" type="String" optional="true">The cid to use.</param>
            /// <param name="isGroup" type="Boolean" optional="true">This specifies the cid type.</param>

            var viewContext = _getViewContext();

            return s.itemFormat(
            {
                "item": item,
                "$Config": window.$Config,
                "FilesConfig": window.FilesConfig,
                "ViewContext": viewContext
            },
            {
                encodeUrl: function (s)
                {
                    /// <summary>
                    /// Executes encodeUrl on the string.
                    /// </summary>
                    /// <param name="s" type="String">The String to encode.</param>
                    return s ? s.encodeUrl() : c_stringEmpty;
                },
                encodeURIComponent: encodeURIComponentHelper,
                cid: getCid,
                cidQueryString: function (item, vContext, filesConfig, cid, isGroup)
                {
                    /// <summary>
                    /// Gets the right cid to pass to the next page
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
                    /// <param name="filesConfig" type="FilesConfig">The files config.</param>
                    /// <param name="cid" type="String" optional="true">The cid to use.</param>
                    /// <param name="isGroup" type="Boolean" optional="true">This specifies the cid type.</param>

                    var isGroupCid = (isGroup || (/* @static_cast(Boolean) */item && /* @static_cast(Boolean) */item.group));
                    var isSearchRoot = /* @static_cast(Boolean) */item && itemHelper.isSearchQuery(item) && item.id == "root";
                    var isRecycleBinQuery = /* @static_cast(Boolean) */item && itemHelper.isRecycleBinQuery(item);

                    if (isSearchRoot)
                    {
                        return "qt=search&q=" + itemHelper.getSearchQuery(item);
                    }
                    else
                    {
                        return "cid=" + encodeURIComponentHelper(getCid(item, vContext, filesConfig, cid)) +
                            (isGroupCid ? "&group=1" : c_stringEmpty) + (isRecycleBinQuery ? "&qt=recyclebin" : c_stringEmpty);
                    }
                },
                profileDomain: function (item, vContext, filesConfig, cid, isGroup)
                {
                    /// <summary>
                    /// Gets the right profile domain depending on the item
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
                    /// <param name="filesConfig" type="FilesConfig">The files config.</param>
                    /// <param name="cid" type="String" optional="true">The cid to use.</param>
                    /// <param name="isGroup" type="Boolean" optional="true">This specifies the cid type.</param>

                    var isGroupVal = (isGroup === true || isGroup === false)
                                   ? isGroup
                                   : /* @static_cast(Boolean) */item && /* @static_cast(Boolean) */item.group;
                    return (isGroupVal ? filesConfig.groupsDomain : filesConfig.profileDomain);
                },
                groupsDomain: function ()
                {
                    /// <summary>
                    /// Gets the domain of the group.
                    /// </summary>

                    return FilesConfig.groupsDomain;
                },
                groupEmail: function (item)
                {
                    /// <summary>
                    /// Gets the email of the group if provisioned.
                    /// </summary>

                    return item && itemHelper.isGroupRoot(item) && item.groupEmail ? item.groupEmail : "";
                },
                deviceIdQueryString: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the res id Query String
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
                    return /* @static_cast(Boolean) */item && (!!item.did) ? '&did=' + item.did.encodeURIComponent() : c_stringEmpty;
                },
                resIdQueryString: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the res id Query String
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
                    return !item || item.id == 'root' ? c_stringEmpty : '&resid=' + item.id.encodeURIComponent();
                },
                appQueryString: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the application hint Query String
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>

                    var filetype = wLive.Core.SkyDriveItemHelper.getNormalizedExtension(item);

                    // We default to word if we don't know
                    var app = null;

                    switch (filetype)
                    {
                        case 'Doc':
                            app = 'Word';
                            break;
                        case 'Xls':
                            app = 'Excel';
                            break;
                        case 'Ppt':
                            app = 'PowerPoint';
                            break;
                        case 'One':
                        case 'OneNotebook':
                            app = 'OneNote';
                            break;
                    }

                    return app ? '&app=' + app : c_stringEmpty;
                },
                authKeyQueryString: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the auth token Query String
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the auth token from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the auth token from.</param>

                    var vParams = vContext.viewParams;
                    if (vParams.ticket)
                    {
                        return '&ticket=' + vParams.ticket;
                    }
                    else if (vParams.authkey)
                    {
                        return '&authkey=' + vParams.authkey;
                    }
                    else
                    {
                        return c_stringEmpty;
                    }
                },
                idQueryString: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the id Query String
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
                    return !item || item.id == 'root' ? c_stringEmpty : '&id=' + item.id.encodeURIComponent();
                },
                parentIdQueryString: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the id Query String for the parent
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
                    if (/* @static_cast(Boolean) */item.parentId && !item.directlyShared)
                    {
                        return item.parentId == 'root' ? c_stringEmpty : '&id=' + item.parentId.encodeURIComponent();
                    }
                    else
                    {
                        return c_stringEmpty;
                    }
                },
                parentId: function (item, vContext)
                {
                    /// <summary>
                    /// This returns the parent id string
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
                    return (/* @static_cast(String) */(item.parentId || c_stringEmpty)).encodeURIComponent();
                },
                isFolder: function (item)
                {
                    /// <summary>
                    /// Gets the right cid to pass to the next page
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    return item.folder ? 1 : 0;
                },
                scenario: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the scenario to pass as a query string value
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the scenario from.</param>

                    return vContext.viewParams.sc ? '&sc=' + vContext.viewParams.sc : c_stringEmpty;
                },
                queryType: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the right cid to pass to the next page
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the scenario from.</param>

                    return vContext.viewParams.qt ? '&qt=' + vContext.viewParams.qt : c_stringEmpty;
                },
                searchParams: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the search params (qt and q)
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the scenario from.</param>

                    var isSearchResult = /* @static_cast(Boolean) */item && itemHelper.isSearchResult(item);
                    var shouldUseSelfView = /* @static_cast(Boolean) */item && (/* @static_cast(Boolean) */item.photo || /* @static_cast(Boolean) */item.video || /* @static_cast(Boolean) */item.isProcessingVideo || vContext.currentViewType === "SelfView");

                    return (isSearchResult && shouldUseSelfView) ? ('&qt=search&q=' + itemHelper.getSearchQuery(item)) : c_stringEmpty;
                },
                viewQueryString: function (item, vContext)
                {
                    /// <summary>
                    /// Gets the view param query string
                    /// </summary>
                    /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to get the owner cid from.</param>
                    /// <param name="vContext" type="wLive.Core.ViewContext">The view context to get the caller cid from.</param>
                    return vContext.viewParams.v ? '&v=' + vContext.viewParams.v : c_stringEmpty;
                }
            },
            [item, viewContext, window.FilesConfig, cid, isGroup]);
        }
    };

    ///
})();
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

/// *******************************************************************
/// This file contains all of the helpers that HAVE jQuery dependencies
/// *******************************************************************

(function ()
{
    var wLiveCore = wLive.Core;

    var SkyDriveItemHelper = wLiveCore.SkyDriveItemHelper;
    SkyDriveItemHelper.getLoadedThumbnailUrl = function (thumbnailSet)
    {
        /// <summary>
        /// Find a thumbnail url that has already been loaded.
        /// </summary>
        /// <param name="thumbnailSet" type="wLive.Core.ISkyDriveThumbnailSet">Thumbnails object.</param>
        /// <returns type="String">Thumbnail url or undefined</returns>

        Debug.assert(thumbnailSet, 'Thumbnails object must not be null');

        var url;

        var thumbnailArray = thumbnailSet.thumbnails;

        if (thumbnailArray)
        {
            var thumbnailArrayLength = thumbnailArray.length;
            var index = 0;

            for (; index < thumbnailArrayLength; index++)
            {
                var /* @type(wLive.Core.ISkyDriveThumbnail) */thumbnail = thumbnailArray[index];
                var thumbnailUrl = thumbnailSet.baseUrl + thumbnail.url;
                /* @disable(0092) */
                if (wLiveCore.Images.isComplete(thumbnailUrl))
                {
                    /* @restore(0092) */
                    url = thumbnailUrl;
                    break;
                }
            }
        }

        return url;
    };

    SkyDriveItemHelper.isFavoritesLib = function (item, viewContext)
    {
        /// <summary>
        /// Determines if item is a favorites library
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">ViewContext</param>
        /// <returns type="Boolean">Is the item a favorites library?</returns>

        return isLibOfCategory(item, viewContext, 2);
    };

    SkyDriveItemHelper.isPhotoAlbum = function (item, viewContext)
    {
        /// <summary>
        /// Determines if item is a photo album
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">ViewContext</param>
        /// <returns type="Boolean">Is the item a photo album?</returns>

        return isLibOfCategory(item, viewContext, 1);
    };

    SkyDriveItemHelper.getIcon = function (item, size)
    {
        /// <summary>
        /// Gets an Html element that contains the file icon
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
        /// <param name="size" type="Number">Width of the icon. 16, 32, or 48</param>
        /// <returns type="HTMLElement">Html element that contains the file icon</returns>

        Debug.assert(item, "Item must be set");
        Debug.assert(size == 16 || size == 32 || size == 48, "Size must be 16, 32 or 48");


        // Aliases for crunching.
        var imageName = 'ft_' + size + '_' + item.iconType;
        var iconNameAndSizeKey = 'icon' + size + imageName;

        if (!item[iconNameAndSizeKey])
        {
            if (this.isRootItem(item) && size === 16)
            {
                return wLiveCore.ImageStrip.getImage("skydrive_16", item.ownerName);
            }

            // we have a special icon for group roots
            if (this.isGroupRoot(item))
            {
                // group icon
                return wLiveCore.ImageStrip.getImage('groups', item.ownerName);
            }

            // get the image from the imagestrip
            var alt = item.name;
            var image = wLiveCore.ImageStrip.getImage(imageName, alt);

            if (!image)
            {
                // this filetype is not in the imageStrip
                var iconSize = size === 16 ? 'tiny' : (size === 32 ? 'smaller' : 'small');
                var fileIconSrc = (FilesConfig.foldersImgBaseUrl + '/icons/{0}/{1}.png').format(iconSize, item.iconType);
                image = $IS.Create(0, 0, size, size, FilesConfig.imgBaseUrl, fileIconSrc, alt, "");
            }

            item[iconNameAndSizeKey] = image;
        }

        return item[iconNameAndSizeKey].cloneNode(true);
    };

    function isLibOfCategory(item, viewContext, category)
    {
        /// <summary>
        /// Determines if item is lib of passed in category
        /// </summary>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">ViewContext</param>
        /// <param name="category" type="Number">The category</param>
        /// <returns type="Boolean">Is the item a library of the category?</returns>

        var isOfCategoryType = false;

        // While we don't have a null item and we aren't at the root, check the item for category.
        while (!isOfCategoryType && /* @static_cast(Boolean) */item && item.parentKey != /* @static_cast(String) */null)
        {
            isOfCategoryType = (/* @static_cast(Boolean) */item.folder && item.folder.category === category);
            item = viewContext.dataModel.getItem(item.parentKey, true);
        }

        return isOfCategoryType;
    }
})();
/// <reference path=".../setview.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var getPCString = wLiveCore.AleHelpers.getPCString;

    var c_linkHtml = '<a href="{0}">{1}</a>';
    var c_stringNameSpace = 'GroupInfo';
    var c_emptyString = "";
    var c_clickLoc = 'IPR';

    // email
    var c_emailUrl = FilesConfig.groupMailUrl; // {0} is the group alias

    // options link
    var c_optionsUrl = FilesConfig.groupsDomain + '{0}/options'; // {0} is the group alias
    var c_viewGroupOptions = getPCString(c_stringNameSpace + '.ViewGroupOptions');

    // email history
    var c_emailHistoryUrl = FilesConfig.groupMailSearchUrl; // {0} is the group alias
    var c_viewGroupEmail = getPCString(c_stringNameSpace + '.ViewEmail');
    var c_emailTurnedOff = getPCString(c_stringNameSpace + '.EmailTurnedOff');
    var c_emailTurnOnLink = getPCString(c_stringNameSpace + '.TurnOnEmailLinkText');
    var c_emailOptionsUrl = c_optionsUrl + '/email'; // {0} is the group alias
    var c_membershipPageUrl = FilesConfig.groupsDomain + '{0}/membership/'; // {0} is the group alias

    var c_icTemplateName = "TagListTemplate";

    var prependBiciReportClickAction = wLiveCore.BiciHelpers.prependBiciReportClickAction;

    wLiveCore.GroupInfo = GroupInfo;

    /* @bind(wLive.Core.GroupInfo) */function GroupInfo(info, groupKey)
    {
        /// <summary>
        /// Class that contains the data for the InfoPane GroupInformation section
        /// </summary>
        /// <param name="info" type="wLive.Core.IGroupInfoItem">GroupInfoItem from the json response</param>
        /// <param name="groupKey" type="String">Group key</param>

        var _this = this;

        var keyComponents = $Utility.deserialize(groupKey, "&", false, false);

        // member variables
        var _alias = info.groupAlias;
        var _displayName = info.displayName;
        var _email = info.email;
        var _membership = info.membershipState;
        var _permissions = info.permissions;
        var /* @type(Array) */_groupMembership = info.membership;

        var _cid = keyComponents['cid'];

        _this.emailHtml = function ()
        {
            /// <summary>
            /// Gets the html for the group email link
            /// </summary>
            /// <returns type="String">html for the group email link</returns>

            var html;

            if (/* @static_cast(Boolean) */_email && _email !== c_emptyString)
            {
                // show the email link
                var url = c_emailUrl.format(_email.encodeUrl());

                html = c_linkHtml.format(url.encodeHtmlAttribute(), _email.encodeHtmlAttribute());

                // add BICI data point to the email group link
                var $link = jQuery(html);
                $link.click(prependBiciReportClickAction(null, /* skyCmnd: */ 'EG', /* clickLoc: */ c_clickLoc));

                html = $link;
            }
            else if (/* @static_cast(Boolean) */_membership && _membership > 5) // owner or co-owner
            {
                var emailOptionsUrl = c_emailOptionsUrl.format(getAlias().encodeUrl());

                // email is turned off, suggest turning it on
                html = c_emailTurnedOff + '<br /><a href="' + emailOptionsUrl.encodeHtmlAttribute() + '">' + c_emailTurnOnLink + '</a>';
            }

            return html;
        };

        _this.emailTitle = function ()
        {
            /// <summary>
            /// Gets the title for the group email link
            /// </summary>

            return _email;
        };

        _this.emailHistoryHtml = function ()
        {
            /// <summary>
            /// Gets the html for the group email history link
            /// </summary>
            /// <returns type="String">html for the group email history link</returns>

            var html;

            if (/* @static_cast(Boolean) */_email && _email !== c_emptyString)
            {
                var url = c_emailHistoryUrl.format(_email.encodeUrl());

                html = c_linkHtml.format(url.encodeHtmlAttribute(), c_viewGroupEmail);

                // add BICI data point to the view email history link
                var $link = jQuery(html);
                $link.click(prependBiciReportClickAction(null, /* skyCmnd: */ 'VGE', /* clickLoc: */ c_clickLoc));

                html = $link;
            }

            return html;
        };

        _this.membershipHtml = function ()
        {
            /// <summary>
            /// Gets the html for the group membership
            /// </summary>
            /// <returns type="String">html for the group membership</returns>

            var html;

            if (/* @static_cast(Boolean) */_membership && _membership > 3)
            {
                // for membership[0-2] we don't show anything since that means 'visitor'
                html = getPCString(c_stringNameSpace + '.Membership' + _membership);
            }

            return html;
        };

        _this.permissionsHtml = function ()
        {
            /// <summary>
            /// Gets the html for the group permissions
            /// </summary>
            /// <returns type="String">html for the group permissions</returns>

            var html;

            if (_permissions != /* @static_cast(Number) */null)
            {
                html = getPCString(c_stringNameSpace + '.Permissions' + _permissions);
            }

            return html;
        };

        _this.groupOptionsLink = function ()
        {
            /// <summary>
            /// Gets the html for the group profile link
            /// </summary>
            /// <returns type="String">html for the group profile link</returns>

            var html;

            if (/* @static_cast(Boolean) */_membership && _membership > 4) // at least a member
            {
                var url = c_optionsUrl.format(getAlias().encodeUrl());

                html = c_linkHtml.format(url.encodeHtmlAttribute(), c_viewGroupOptions);

                // add BICI data point to the view email history link
                var $link = jQuery(html);
                $link.click(prependBiciReportClickAction(null, /* skyCmnd: */ 'VGO', /* clickLoc: */ c_clickLoc));

                html = $link;
            }

            return html;
        };

        _this.canInvite = function ()
        {
            /// <summary>
            /// Check whether the current user can invite other people to the group.
            /// </summary>
            /// <returns type="Boolean">true if the current user is an owner or co-owner.</returns>
            return (/* @static_cast(Boolean) */_membership && _membership > 5);
        };

        _this.groupMembership = function ()
        {
            /// <summary>
            /// Gets the html for the group email link
            /// </summary>
            /// <returns type="Array">html for the group profile link</returns>
            
            return _groupMembership;
        };

        _this.membershipPageLink = function (linkText)
        {
            /// <summary>
            /// Gets the html for the link to the Groups membership page.
            /// </summary>
            /// <param name="linkText" type="String">Text of the link.</param>
            /// <returns type="String">html for the Group membership page link</returns>

            var url = c_membershipPageUrl.format(getAlias().encodeUrl());
            return c_linkHtml.format(url.encodeHtmlAttribute(), linkText);
        };

        function getAlias()
        {
            var alias;

            if (_alias)
            {
                alias = _alias;
            }
            else
            {
                alias = 'cid-' + _cid;
            }

            return alias;
        }

        ///
    }


    ///
})();
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;

    wLiveCore.ActionManager = ActionManager;
    /* @bind(wLive.Core.ActionManager) */function ActionManager()
    {
        /// <summary>
        /// This class holds a collectoin of actions
        /// </summary>
        this._actions = {};
    };

    var ActionManagerPrototype = ActionManager.prototype;

    ActionManagerPrototype.registerAction = function (name, actionCreator)
    {
        /// <summary>
        /// This adds an action creator to the action manager. This function will throw a debug assert if the action name is already added.
        /// </summary>
        /// <param name="name" type="String">The name of the action.</param>
        /// <param name="action" type="wLive.Core.ActionManagerActionCreator">The action creator to add.</param>
        Debug.assert(!this.isActionRegistered(name), "The action {0} is already registered".format(name));
        this._actions[name] = actionCreator;
    };

    ActionManagerPrototype.isActionRegistered = function (name)
    {
        /// <summary>
        /// This returns true if the action has already been registered.
        /// </summary>
        /// <param name="name" type="String">The name of the action.</param>
        /// <returns type="Boolean">Returns true or false based on if the action is registered.</returns>

        return this._actions[name] ? true : false;
    };

    ActionManagerPrototype.getAction = /* @varargs */ function (name, o)
    {
        /// <summary>
        /// This returns the created action for that name with the specified parameters. If the action is not available, or registered null will be returned.
        /// </summary>
        /// <param name="name" type="String">The name of the action.</param>
        /// <param name="o" type="Object" parameterArray="true" optional="true">Parameters to pass to the function.</param>
        /// <returns type="wLive.Core.ActionManagerAction">Returns the action to execute.</returns>

        var /* @type(wLive.Core.ActionManagerActionCreator) */action = this._actions[name];

        if (!action)
        {
            return /* @static_cast(wLive.Core.ActionManagerAction) */null;
        }

        return /* @static_cast(wLive.Core.ActionManagerAction) */action.getAction.apply(action, arguments);
    };

    ActionManagerPrototype.doAction = function (action)
    {
        /// <summary>
        /// This executes the action.
        /// </summary>
        /// <param name="action" type="wLive.Core.ActionManagerAction">The action to execute.</param>

        if (action)
        {
            if (action.click)
            {
                action.click();
            }

            if (action.url)
            {
                // Url is an actual page navigation.
                $BSI.navigateTo(action.url, action.target);
                // Internally this might update the ajax history api if the url begins with a "#" sign.
                // So we do not need to call: history.navigateTo(action.url).
            }
        }
    };

    ActionManager.getATagAction = ActionManagerPrototype.getATagAction = function (action, biciClickLocation, clickFilter)
    {
        /// <summary>
        /// This is a helper function that creates/sets a html Anchor tag.
        /// </summary>
        /// <param name="action" type="wLive.Core.ActionManagerAction">The action to set on the Anchor tag.</param>
        /// <param name="biciClickLocation" type="String" optional="true">BICI click location.</param>
        /// <param name="clickFilter" type="HTMLEvent, Function -> Boolean" optional="true">clickFilter will wrap the actions click handler. It has to call click() itself if it wants run the click handler.</param>
        /// <returns type="wLive.Core.ActionManagerAction">The updated or created jquery object with the action set.</returns>

        Debug.assert(action, "The action should not be null, you should check if the action is null before calling this function and update the ui correctly");

        var click = action.click || function ()
        {
            $BSI.navigateTo(action.url);

            return false;
        };

        var skyCmd = action.skyCmd;
        if (biciClickLocation && skyCmd)
        {
            // We always want an action click if biciParams is set. If action.click is already specified then we prepend the
            // the bici.reportEvent(). If it's not, then the onclick only invokes the bici.reportEvent() function.
            /* @disable(0086)*/
            click = action.click = wLiveCore.BiciHelpers.prependBiciReportClickAction(click, skyCmd, biciClickLocation);
            /* @disable(0086)*/
        }

        if (clickFilter)
        {
            action.click = function (ev)
            {
                return clickFilter(ev, click);
            };
        }

        return action;
    };

    ActionManager.setATagAction = ActionManagerPrototype.setATagAction = function (action, $jQueryObject, biciClickLocation, clickFilter)
    {
        /// <summary>
        /// This is a helper function that creates/sets a html Anchor tag.
        /// </summary>
        /// <param name="action" type="wLive.Core.ActionManagerAction">The action to set on the Anchor tag.</param>
        /// <param name="$jQueryObject" type="jQuery" optional="true">The jquery object to add the action too.</param>
        /// <param name="biciClickLocation" type="String" optional="true">BICI click location.</param>
        /// <param name="clickFilter" type="Function" optional="true">clickFilter will wrap the actions click handler. It has to call click() itself if it wants run the click handler.</param>
        /// <returns type="jQuery">The updated or created jquery object with the action set.</returns>

        Debug.assert(action, "The action should not be null, you should check if the action is null before calling this function and update the ui correctly");

        $jQueryObject = $jQueryObject || jQuery(_ce('a'));

        action = ActionManager.getATagAction(action, biciClickLocation, clickFilter);

        if (action.click)
        {
            // Set click handler
            $jQueryObject.bind("click.action", action.click);
        }

        // Set href and fall back to #
        $jQueryObject.attr('href', action.url || '#');

        // Set the url target
        if (action.target)
        {
            $jQueryObject.attr('target', action.target);
        }


        return $jQueryObject;
    };

    ///
})();
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;

    wLiveCore.OperationManager = OperationManager;

    var c_operationManagerInstance = new OperationManager();

    var c_operationsNamespace = 'Operation_';

    wLiveCore.OperationManager.getInstance = function ()
    {
        /// <summary>
        /// This is the single operation manager instance.
        /// </summary>

        return c_operationManagerInstance;
    };

    /* @bind(wLive.Core.OperationManager) */function OperationManager()
    {
        /// <summary>
        /// This is the operation manager.
        /// </summary>

        var _this = this;

        _this.execute = function (name, options)
        {
            /// <summary>
            /// This method executes the operation once the script has be downloaded.
            /// </summary>
            /// <param name="name" type="String">This is the name of the operation.</param>
            /// <param name="options" type="*">This is the options object to call the operation with.</param>

            $Do.when('Bucket4.js', 0, function ()
            {
                $Do.when(c_operationsNamespace + name, 0, options);
            });
        };

        _this.register = function (name, func)
        {
            /// <summary>
            /// This method registers an operation with the operation manager.
            /// </summary>
            /// <param name="name" type="String">This is the name of the operation.</param>
            /// <param name="func" type="String, Object -> void">This is the operation handler.</param>

            $Do.register(c_operationsNamespace + name, function (data)
            {
                func(name, data);
            });
        };
    }

    // Set the Current Operations Manager
    wLiveCore.OperationManager.Current = new OperationManager();
})();
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;

    var areItemsSame = wLiveCore.SkyDriveItem.areItemsSame;

    // Direction keys.
    var c_up = 38;
    var c_down = 40;

    // MultiSelect options.
    var c_singleSelect = 0;
    var c_ctrl = 1;
    var c_shift = 2;

    // Static properties.
    SelectionManager.SelectionChangedEvent = 'selectionChanged';
    SelectionManager.ResolveFailed = -1;
    SelectionManager.ResolveWaiting = 1;
    SelectionManager.ResolveSuccess = 2;

    wLive.Core.SelectionManager = SelectionManager;
    /* @bind(wLive.Core.SelectionManager) */function SelectionManager(_dataModel)
    {
        /// <summary>
        /// Initializes a new instance of the SelectionManager class.
        /// This class tracks the indices of the items that are selected in the setView and
        /// works as an intermediary between the DetailsList and the InfoPane.
        /// The DetailsList will call SelectionManager.selectItem(parent, index) when an item is selected.
        /// The InfoPane will bind to the SelectionManager.SelectionChangedEvent to retreive these changes.
        /// </summary>
        /// <param name="_dataModel" type="wLive.Core.DataModel">Data model.</param>


        // Variable shortcuts.
        var _this = this;
        var _$this = jQuery(_this);

        // Current state.
        var /* @type(wLive.Core.ISkyDriveItem) */_parent;
        var /* @type(String) */_setKey;
        var /* @type(Number) */_childCount;
        var _groupings = [];
        var _hasCustomGroupings = false;
        var _parentsByIndex = {};
        var _indexsByParent = {};

        // Selection state.
        var _selectedIndexes = {};
        var _downloadedItemsByIndex = {};
        var _inPreselectionMode = false;
        var _lastInteractedIndex = -1;
        var _anchorIndex = -1;
        var _canMultiSelect = true;
        var _canCrossGroupSelect = true;

        _this.dispose = function ()
        {
            /// <summary>
            /// Disposes the selection manager.
            /// </summary>

            clearSelection();

            // clear out references.
            _parent = null;
            _parentsByIndex = null;

            _this = null;
            _$this = null;
        };

        _this.setMultiSelectEnabled = function (canMultiSelect)
        {
            /// <summary>Toggles multiselect and single select mode.</summary>
            /// <param name="canMultiSelect" type="Boolean">If true will behave with multiselect, else will use single select mode.</param>

            _canMultiSelect = canMultiSelect;
        };

        _this.setCrossGroupSelectEnabled = function (canCrossGroupSelect)
        {
            /// <summary>Toggles multiselect and single select mode.</summary>
            /// <param name="canCrossGroupSelect" type="Boolean">If true we will allow cross group selection.</param>

            _canCrossGroupSelect = canCrossGroupSelect;
        };

        _this.registerList = function (index, parent)
        {
            /// <summary>
            /// Registers an instance of a list control. We need to track them separately so that we know what to do when the user pressed DOWN.
            /// </summary>
            /// <param name="index" type="Number">Parent Index.</param>
            /// <param name="parent" type="wLive.Core.ISkyDriveItem">Parent container.</param>

            Debug.assert(index > -1, "Invalid index in SelectionManager.registerList()");
            Debug.assert(parent, "Must provide a parent in SelectionManager.registerList()");

            _parentsByIndex[index] = parent;
            _indexsByParent[parent.key] = index;
        };

        _this.unregisterList = function ()
        {
            /// <summary>
            /// Unregisters the individual instances of a list control.
            /// </summary>

            _indexsByParent = {};
            _parentsByIndex = {};
        };

        _this.clickSelect = function (parent, index, options)
        {
            /// <summary>
            /// Select a specific child index of a given parent. Handles all logic around ctrl, shift, event firing.
            /// </summary>
            /// <param name="parent" type="wLive.Core.ISkyDriveItem">Parent container.</param>
            /// <param name="index" type="Number">Index of the selected item.</param>
            /// <param name="options" type="wLive.Core.SelectionManagerOptions" optional="true">Selection options.</param>

            Debug.assert(parent, "Parent must be specified when calling SelectionManager.clickSelect()");
            Debug.assert(index > -1 && index < parent.getChildren().getCount(), "Index must be in the correct range for the parent when calling SelectionManager.clickSelect()");

            options = _processOptions(options);

            updateSelectionAndFireEvent(function ()
            {
                // When we enter preselection mode we always call clickSelect which is why this logic isn't in keyboardSelect.
                selectIndex(index, options);

                _inPreselectionMode = /* @static_cast(Boolean) */options && options.preselect;
            }, parent);
        };

        _this.keyboardSelect = function (parent, key, options)
        {
            /// <summary>
            /// Select items based on keyboard events (UP, DOWN, SHIFT, CTRL).
            /// </summary>
            /// <param name="parent" type="wLive.Core.ISkyDriveItem">Parent container.</param>
            /// <param name="key" type="Number">Key pressed.</param>
            /// <param name="options" type="wLive.Core.SelectionManagerOptions" optional="true">Selection options.</param>
            /// <returns type="Boolean">Should override browser keyboard behavior.</returns>

            Debug.assert(parent, "Parent must be specified when calling SelectionManager.keyboardSelect()");
            Debug.assert(key, "A key must be specified when calling SelectionManager.keyboardSelect()");

            options = _processOptions(options);

            if (shouldIgnoreInput(parent))
            {
                return true;
            }

            return /* @static_cast(Boolean) */updateSelectionAndFireEvent(function ()
            {
                // We need to calculate the index that is getting selected so we can call selectIndex().
                var index = _lastInteractedIndex;
                var shift = options.shift;

                switch (key)
                {
                    case c_up:
                        if (index !== -1)
                        {
                            // Decrement by 1.
                            var previousIndex = shift ? index - 1 : getPreviousUnselectedIndex(index);
                            index = Math.max(0, previousIndex);
                        }
                        else
                        {
                            // Nothing was selected before so we select the last item.
                            setParent(_parentsByIndex[0]);
                            index = _childCount - 1;
                        }
                        break;
                    case c_down:
                        if (index !== -1)
                        {
                            // Increment by 1.
                            var nextIndex = shift ? index + 1 : getNextUnselectedIndex(index);
                            index = Math.min(_childCount - 1, nextIndex);
                        }
                        else
                        {
                            // Nothing was selected before so we select the first item.
                            setParent(_parentsByIndex[0]);
                            index = 0;
                        }
                        break;
                    default:
                        // We don't care about any other keys.
                        return true;
                }

                // When you get to the last item and hit 'down' we reselect the
                // same item which would actually deselects the item. Super confusing.
                if (index !== _lastInteractedIndex)
                {
                    // we never support ctrl + key for selecting
                    options.ctrl = false;
                    selectIndex(index, options);
                }
                else
                {
                    // This means we are either at the top or bottom so
                    // we don't want to override the browser scroll behavior.
                    return true;
                }

                return false;
            }, parent);
        };

        _this.resolveSelection = function (parent)
        {
            /// <summary>
            /// Tries to resolve the current selection with a new parent.
            /// </summary>
            /// <param name="parent" type="wLive.Core.ISkyDriveItem">Parent container.</param>

            var resolveStatus = SelectionManager.ResolveSuccess;
            var children = parent ? parent.getChildren() : null;

            if (!children || children.getCount() === 0)
            {
                _this.deselectAll();
            }
            else
            {
                var _itemsByNewIndex = {};

                var currentSelection = _this.getSelection();
                // We can only try to resolve the selection if the new parent is the same.
                if (!setParent(parent))
                {
                    if (children.get(0))
                    {
                        for (var i in _selectedIndexes)
                        {
                            var item = _downloadedItemsByIndex[i];
                            var newIndex = item ? children.indexOf(item, false, true) : -1;
                            if (newIndex > -1)
                            {
                                // This selected item is already downloaded in the new SetView.
                                _itemsByNewIndex[newIndex] = item;
                            }
                            else
                            {
                                // This item has not been downloaded in the new ItemSet. We can't resolve this selection.
                                resolveStatus = SelectionManager.ResolveFailed;
                            }
                        }
                    }
                    else
                    {
                        resolveStatus = SelectionManager.ResolveWaiting;
                    }
                }
                else
                {
                    // Couldn't resolve because the parents were different.
                    resolveStatus = SelectionManager.ResolveFailed;
                }

                if (resolveStatus === SelectionManager.ResolveSuccess)
                {
                    // Need to translate the last interacted index to the new selection.
                    var lastInteractedItem = _downloadedItemsByIndex[_lastInteractedIndex];
                    var lastInteractedIndex = lastInteractedItem ? children.indexOf(lastInteractedItem, false, true) : -1;

                    updateSelectionAndFireEvent(function ()
                    {
                        // Clear out the old selected indexes.
                        clearSelection();

                        // Set the new selected indexes.
                        for (var index in _itemsByNewIndex)
                        {
                            setIndexAsSelected(index);
                        }

                        _lastInteractedIndex = lastInteractedIndex;
                    }, parent);

                }
                else if (resolveStatus === SelectionManager.ResolveFailed)
                {
                    _this.deselectAll();
                }
            }

            return resolveStatus;
        };

        _this.selectAll = function (parent)
        {
            /// <summary>
            /// Select all items of this parent.
            /// </summary>
            /// <param name="parent" type="wLive.Core.ISkyDriveItem">Parent container.</param>

            Debug.assert(parent, "Parent must be specified when calling SelectionManager.selectAll()");

            if (shouldIgnoreInput(parent) || !_canMultiSelect)
            {
                return true;
            }

            updateSelectionAndFireEvent(function ()
            {
                clearSelection();

                // Include all of the items in the selection.
                for (var i = 0; i < _childCount; i++)
                {
                    setIndexAsSelected(i);
                }
            }, parent);

            return false;
        };

        _this.deselectAll = function (parent, supressEvent)
        {
            /// <summary>
            /// Deselect all items.
            /// </summary>
            /// <param name="parent" type="wLive.Core.ISkyDriveItem" optional="true">Parent container.</param>
            /// <param name="supressEvent" type="Boolean" optional="true">Optionally supress the change event, useful when switching views.</param>

            if (supressEvent)
            {
                clearSelection();
            }
            else
            {
                updateSelectionAndFireEvent(function ()
                {
                    clearSelection();
                }, parent);
            }
        };

        _this.getSingleSelectedItem = function (parent)
        {
            /// <summary>
            /// Gets an item if it is the only one selected.
            /// </summary>
            /// <param name="parent" type="wLive.Core.ISkyDriveItem" optional="true">Parent container.</param>
            /// <returns type="wLive.Core.ISkyDriveItem">Selected item.</returns>

            var /* @type(wLive.Core.ISkyDriveItem) */item;
            var /* @type(wLive.Core.SelectionManagerSelection) */selection = this.getSelection();

            // We only do this if there is only 1 item selected.
            if (/* @static_cast(Boolean) */parent && selection.selectionCount === 1)
            {
                // Get the selected item.
                for (var index in selection.indexes)
                {
                    item = parent.getChildren().get(index);
                    break;
                }
            }

            return item;
        };

        _this.multipleSelected = function ()
        {
            /// <summary>Determines if more than 1 item is selected.</summary>
            /// <returns type="Boolean">True if more than 1 item is selected.</returns>

            var selectionCount = 0;

            for (var i in _selectedIndexes)
            {
                if (_selectedIndexes.hasOwnProperty(i))
                {
                    selectionCount++;

                    if (selectionCount > 1)
                    {
                        break;
                    }
                }
            }

            return selectionCount > 1;
        };

        _this.anySelected = function ()
        {
            /// <summary>
            /// Determines if any items are selected.
            /// </summary>
            /// <returns type="Boolean">True if any items are selected.</returns>

            var anySelected = false;

            for (var i in _selectedIndexes)
            {
                if (_selectedIndexes.hasOwnProperty(i))
                {
                    anySelected = true;
                    break;
                }
            }

            return anySelected;
        };

        _this.getSelection = function ()
        {
            /// <summary>
            /// Get the current selection data.
            /// </summary>
            /// <returns type="wLive.Core.SelectionManagerSelection">Current Selection Data</returns>

            var selectionCount = 0;
            for (var i in _selectedIndexes)
            {
                selectionCount++;
            }

            var toReturn = /* @static_cast(wLive.Core.SelectionManagerSelection) */{
            parent: _parent,
            inPreselectionMode: _inPreselectionMode,
            indexes: _selectedIndexes,
            selectionCount: selectionCount,
            lastInteractedIndex: _lastInteractedIndex
        };

        return toReturn;
    };

    _this.getSelectedItems = function (callbackFunction)
    {
        /// <summary>
        /// Loads all of the selected items and once downloaded, calls the callbackFunction supplied.
        /// </summary>
        /// <param name="callbackFunction" type="Array -> void">Callback function to be called when data is ready.</param>

        Debug.assert(callbackFunction, 'A callback function must be passed in to onSelectedItemsLoaded.');

        // Helper shortcuts.
        /* @disable(0092) */
        var viewContext = /* @static_cast(wLive.Core.ViewContext) */wLiveCore.PageController.getInstance().getViewContext();
        /* @restore(0092) */
        var dataModel = viewContext.dataModel;

        // Selection data.
        var selection = /* @static_cast(wLive.Core.SelectionManagerSelection) */_this.getSelection();
        var parent = /* @static_cast(wLive.Core.ISkyDriveItem) */selection.parent;
        var indexes = [];

        // Makes indexes into an array since that is what ensureCompletelyDownloaded expects
        for (var i in selection.indexes)
        {
            indexes.push(i);
        }

        // Save the set key since it could change before the fetch completes
        var itemSetKey = wLiveCore.SkyDriveItem.getDefaultSetKey();

        dataModel.ensureCompletelyDownloaded(parent, function ()
        {
            /// <summary>
            /// The success callback.
            /// </summary>

            var items = [];
            for (var i in selection.indexes)
            {
                var item = parent.getChildren(itemSetKey).get(i);
                Debug.assert(item, 'Item should be downloaded');
                items.push(item);
            }

            callbackFunction(items);
        },
        function ()
        {
            /// <summary>
            /// The failure callback.
            /// </summary>

            Trace.log('Failed to get the selected items for: ' + parent.key, 'Selection Manager');
        }, null, indexes);
    };

    _this.isSelected = function (parent, index)
    {
        /// <summary>
        /// Checks to see if a specific item is selected.
        /// </summary>
        /// <param name="parent" type="wLive.Core.ISkyDriveItem">Parent container.</param>
        /// <param name="index" type="Number">Index of child.</param>
        /// <returns type="Boolean">Item is selected</returns>

        Debug.assert(parent, "Parent must be specified when calling SelectionManager.isSelected()");
        Debug.assert(index != null, "Index must be specified when calling SelectionManager.isSelected()");

        return areItemsSame(parent, _parent) && _selectedIndexes[index] === index;
    };

    _this.hasPreselectedChild = function (parent)
    {
        /// <summary>
        /// Checks to see if the parent has a preselected item.
        /// </summary>
        /// <param name="parent" type="wLive.Core.ISkyDriveItem">Parent container.</param>
        /// <returns type="Boolean">Does this parent have a current preselected item?</returns>

        return areItemsSame(parent, _parent) && _inPreselectionMode;
    };

    _this.resetPreselectionFlag = function ()
    {
        /// <summary>
        /// Clears the preselection mode flag.  
        /// </summary>

        _inPreselectionMode = false;
    };

    _this.setGroupings = function (groupings)
    {
        /// <summary>
        /// This updates the groupings, this is needed if the list view is using a custom item set
        /// </summary>
        /// <param name="groupings" type="Array">The groupings array</param>

        if (groupings)
        {
            _groupings = groupings;
            _hasCustomGroupings = true;
        }
        else
        {
            _groupings = _parent ? _parent.getChildren().getGroupings() : [];
            _hasCustomGroupings = false;
        }
    };

    function selectIndex(index, options)
    {
        /// <summary>
        /// Selects the index and range indexes based on options.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>
        /// <param name="options" type="wLive.Core.SelectionManagerOptions" optional="true">Selection options.</param>

        Debug.assert(index > -1 && index < _childCount, "Invalid index for this parent. Index is " + index + " and the parent childCount is " + _childCount + ".");

        var selectionType = getSelectionType(options);

        switch (selectionType)
        {

            case c_ctrl:
                ctrlSelect(index);
                _anchorIndex = index;
                break;
            case c_shift:
                shiftSelect(index, options);
                break;
            case c_singleSelect:
                singleSelect(index);
                _anchorIndex = index;
                break;
            default:
                Debug.assert(false, 'getSelectionType() returned an invalid selectionType.');
                break;
        }

        var selection = _this.getSelection();
        _lastInteractedIndex = selection.selectionCount === 0 ? -1 : index;
    }

    function ctrlSelect(index)
    {
        /// <summary>
        /// Selects the index and range indexes based on options.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>

        Debug.assert(!_inPreselectionMode, 'SelectionManager.ctrlSelect() was called in preselectionMode. This shouldnt happen.');

        if (!_canCrossGroupSelect && isCrossGroupSelection(index))
        {
            clearSelection();
        }

        toggleSelection(index);
    }

    function shiftSelect(index, options)
    {
        /// <summary>
        /// Selects the range of indexes for when a user selects an item holding shift.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>
        /// <param name="options" type="wLive.Core.SelectionManagerOptions">Selection options.</param>

        Debug.assert(!_inPreselectionMode, 'shiftSelect() was called in preselectionMode. This shouldnt happen.');
        Debug.assert(options, "Options should have been defaulted out by the time SelectionManager.shiftSelect() gets called.");

        if (!options.ctrl)
        {
            // This is a fresh shift-select so we erase everything and start over.
            _selectedIndexes = {};
            _downloadedItemsByIndex = {};
            setIndexAsSelected(_anchorIndex);
        }

        var anchorIsSelected = _this.isSelected(_parent, _anchorIndex);

        var affectRangeStart = Math.min(Math.min(_anchorIndex, _lastInteractedIndex), index);
        var affectRangeEnd = Math.max(Math.max(_anchorIndex, _lastInteractedIndex), index);

        var selectedStart = Math.max(Math.min(_anchorIndex, index), 0);
        var selectedEnd = Math.max(Math.max(_anchorIndex, index), 0);

        // This is the range of all of the items that can change selection state.
        for (var i = affectRangeStart; i <= affectRangeEnd; i++)
        {
            // These are the items that are getting selected (or deselected in the case that they were already selected)
            if (i >= selectedStart && i <= selectedEnd)
            {
                if (i !== _anchorIndex)
                {
                    anchorIsSelected && ((!_canCrossGroupSelect && !isCrossGroupSelection(i)) || _canCrossGroupSelect) ? select(i) : deselect(i);
                }
            }
            else
            {
                // Deselect previously selected items.
                delete _selectedIndexes[i];
                delete _downloadedItemsByIndex[i];
            }
        }
    }

    function _processOptions(options)
    {
        /// <summary>Process selection options.</summary>
        /// <param name="options">Selection options.</param>
        /// <returns>Processed selection options.</returns>

        options = options || {};
        options.ctrl = (_canMultiSelect && options.ctrl);
        options.shift = (_canMultiSelect && options.shift);

        return options;
    }

    function singleSelect(index)
    {
        /// <summary>
        /// Deselects all and selects this single index.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>

        var selection = _this.getSelection();
        var isOnlySelectedIndex = /* @static_cast(Boolean) */selection && selection.selectionCount === 1 && _this.isSelected(_parent, index);

        clearSelection();

        if (!isOnlySelectedIndex)
        {
            // We toggle the single select in the case that the index is the only one previously selected.
            setIndexAsSelected(index);
        }
    }

    function clearSelection()
    {
        /// <summary>
        /// Resets all selection data.
        /// </summary>

        _selectedIndexes = {};
        _downloadedItemsByIndex = {};
        _inPreselectionMode = false;
        _lastInteractedIndex = -1;
        _anchorIndex = -1;
    }

    function select(index)
    {
        /// <summary>
        /// Adds this index to this list of selected items.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>

        setIndexAsSelected(index);
    }

    function deselect(index)
    {
        /// <summary>
        /// Removes this index from the list of selected items.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>

        delete _selectedIndexes[index];
        delete _downloadedItemsByIndex[index];
    }

    function toggleSelection(index)
    {
        /// <summary>
        /// Toggles the selection state of this index from list of selected items.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>

        if (_this.isSelected(_parent, index))
        {
            delete _selectedIndexes[index];
            delete _downloadedItemsByIndex[index];
        }
        else
        {
            setIndexAsSelected(index);
        }
    }

    function getPreviousUnselectedIndex(index)
    {
        /// <summary>
        /// Gets the first index before this index that is unselected.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>

        var i = index;
        while (_selectedIndexes[i] != null)
        {
            i--;
        }

        return i;
    }

    function getNextUnselectedIndex(index)
    {
        /// <summary>
        /// Gets the first index after this index that is unselected.
        /// </summary>
        /// <param name="index" type="Number">Index of child.</param>

        var i = index;
        while (_selectedIndexes[i] != null)
        {
            i++;
        }

        return i;
    }

    function setParent(parent)
    {
        /// <summary>
        /// Sets the new parent and determines whether or not it is different from the previous parent.
        /// </summary>
        /// <param name="parent" type="wLive.Core.ISkyDriveItem" optional="true">Parent container.</param>

        var parentHasChanged = false;

        if (!parent)
        {
            parentHasChanged = true;
        }

        if (!areItemsSame(parent, _parent) && /* @static_cast(Boolean) */parent)
        {
            parentHasChanged = true;
            _parent = parent;
        }

        var newSetKey = wLiveCore.SkyDriveItem.getDefaultSetKey();
        if (_setKey !== newSetKey)
        {
            _setKey = newSetKey;
        }

        if (parent)
        {
            var children = parent.getChildren();

            if (!_hasCustomGroupings)
            {
                _groupings = children.getGroupings();
            }

            _childCount = children.getCount();
        }

        return parentHasChanged;
    }

    function getSelectionType(options)
    {
        /// <summary>
        /// Gets the selection type from options (SHIFT, CTRL or SINGLE SELECT).
        /// </summary>
        /// <param name="options" type="wLive.Core.SelectionManagerOptions" optional="true">Selection options.</param>
        /// <returns type="Number">Selection mode.</returns>

        var ctrl = /* @static_cast(Boolean) */options && options.ctrl;
        var shift = /* @static_cast(Boolean) */options && options.shift;

        return shift ? c_shift :  // Range multi-select
                       ctrl ? c_ctrl :    // Single multi-select
                       c_singleSelect;    // Single-select
    }

    function shouldIgnoreInput(parent)
    {
        /// <summary>
        /// Should keyboardSelect ignore events for this parent? It matters for when we have two lists, both listening to events.
        /// </summary>
        /// <param name="parent" type="wLive.Core.ISkyDriveItem">Parent container.</param>

        var count = 0;
        for (var index in _parentsByIndex) { count++; }

        if (count > 1 && !areItemsSame(parent, _parent))
        {
            return true;
        }

        return false;
    }

    function areSelectionsEqual(selectionA, selectionB)
    {
        /// <summary>
        /// Checks to see if two selections are equivalent.
        /// </summary>
        /// <param name="selectionA" type="wLive.Core.SelectionManagerSelection"></param>
        /// <param name="selectionB" type="wLive.Core.SelectionManagerSelection"></param>

        var areSelectionsSame =
                    areItemsSame(selectionA.parent, selectionB.parent) && // Check to see if selections have the same parent.
                    selectionA.relationshipsKey === selectionB.relationshipsKey && // Check to see if selections have the same relationshipsKey.
                    selectionA.inPreselectionMode === selectionB.inPreselectionMode && // Check to see if inPreselectionMode has changed.
                    selectionA.selectionCount === selectionB.selectionCount; // Check to see if selections have the same number of selected items.

        if (areSelectionsSame)
        {
            // Check the actual selection values
            var indexesA = selectionA.indexes;
            var indexesB = selectionB.indexes;
            for (var i in indexesA)
            {
                if (indexesA[i] !== indexesB[i])
                {
                    areSelectionsSame = false;
                    break;
                }
            }
        }

        return areSelectionsSame;
    }

    function getGroupingIndexFromItemIndex(itemIndex)
    {
        /// <summary>
        /// Gets the grouping index from an item index
        /// </summary>
        /// <param name="itemIndex" type="Number">The item index</param>
        /// <returns type="Number">The group index</returns>

        for (var x = 0; x < _groupings.length; x++)
        {
            var group = /* @static_cast(wLive.Core.IBaseItemGroupData) */_groupings[x];
            if (group.startIndex <= itemIndex && group.endIndex >= itemIndex)
            {
                return x;
            }
        }

        return -1;
    }

    function isCrossGroupSelection(index)
    {
        /// <summary>
        /// This returns true if there is a cross group selection
        /// </summary>
        /// <param name="index" type="Number">The index to check if it would make a cross group selection</param>
        /// <returns type="Boolean">The value stating if it was a cross group selection</returns>

        for (var x in _selectedIndexes)
        {
            if (getGroupingIndexFromItemIndex(index) != getGroupingIndexFromItemIndex(x))
            {
                // We are not the same group so dont select
                return true;
            }
            else
            {
                // We only need the first index
                break;
            }
        }

        return false;
    }

    function setIndexAsSelected(index)
    {
        /// <summary>
        /// Selects the index and tries to save the downloaded item.
        /// </summary>
        /// <param name="index" type="Number">Index to select.</param>

        _selectedIndexes[index] = parseInt(index);
        var item = _parent.getChildren().get(index, true);
        if (item)
        {
            _downloadedItemsByIndex[index] = item;
        }
    }

    function updateSelectionAndFireEvent(selectionFunction, parent)
    {
        /// <summary>
        /// Saves the previous selection, runs the selectionFunction, and then compares the new selection with the previous selection and if different fires SelectionChangedEvent.
        /// </summary>
        /// <param name="selectionFunction" type="void -> void">Function pointer that runs the selection logic.</param>
        /// <param name="parent" type="wLive.Core.ISkyDriveItem" optional="true">Parent container.</param>

        // Save the previous selection so we can see if it changes.
        var previousSelection = _this.getSelection();

        // Set the new parent.
        // This needs to come after saving the previous selection as it will change values of the previousSelection.
        if (setParent(parent))
        {
            // The parent has changed so we clear previous selection data.
            clearSelection();
        }

        // This actually runs the selection function. This is just a function pointer and contains the logic for all of the different selection scenarios.
        var returnValue = selectionFunction();

        // Check to see if the selection has changed.
        if (!areSelectionsEqual(previousSelection, _this.getSelection()))
        {
            // Selection has changed. Fire the event.
            fireSelectionChangedEvent();
        }

        return returnValue;
    }

    function fireSelectionChangedEvent()
    {
        _$this.trigger(SelectionManager.SelectionChangedEvent, [_this.getSelection()]);
    }
};

///

})();

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var getString = wLiveCore.AleHelpers.getString;
    var wLiveControls = wLive.Controls;

    /* @disable(0092) */
    var /* @dynamic */notifications = wLiveControls.Notifications;
    /* @restore(0092) */

    wLiveCore.ErrorManager = ErrorManager;

    /* @bind(wLive.Core.ErrorManager) */function ErrorManager()
    {
        var _this = this;

        _this._errors = [];

        // "errorreceived" is fired when a new error is added.
        _this.errorReceivedEventName = 'errorreceived';

        // "errorcleared" is fired when all errors are cleared.
        _this.errorClearedEventName = 'errorcleared';

        function addBurntMessages()
        {
            /// <summary>
            /// Adds messages that is burnt in FilesConfig.
            /// </summary>
            /// <remarks>This method is called at the end of ErrorManager class.</remarks>

            var filesConfig = window.FilesConfig;
            var messages = filesConfig.notificationBarMessages;

            // Add error messages that is burned in FilesConfig.
            if (messages)
            {
                for (var key in messages)
                {
                    var message = messages[key];

                    if (typeof message === 'object')
                    {
                        _this.add(message);
                    }
                }
            }
        }

        function sortError(a, b)
        {
            /// <summary>
            /// Sorts error by priority, then importance.
            /// </summary>
            /// <param name="a" type="wLive.Core.Error"></param>
            /// <param name="b" type="wLive.Core.Error"></param>

            if (a.priority != b.priority)
            {
                return a.priority - b.priority;
            }
            else
            {
                return a.type - b.type;
            }
        };

        _this.add = function (error)
        {
            /// <summary>
            /// Adds error to the page. May append a link to either the help site or status.live.com.
            /// </summary>
            /// <param name="error" type="wLive.Core.Error"></param>

            // ensure error has a priority and type, so that sorting works on IE7 and below.
            error.priority |= 0;
            error.type |= 0;

            // check if it is an "actual" error (type 1 is warning, types > 1 are info)
            if (error.type == 0 && /* @static_cast(Boolean) */$Config.hc && /* @static_cast(Boolean) */error.$element)
            {
                // We have four scenarios, each with a different errorShow value:
                // SLC/0: There was no pre-existing link AND there was an error code AND the error code is in the slc whitelist
                //    We added a link to SLC
                // Help/1: There was no pre-existing link AND there was an error code  
                //    We added a link to WOL
                // Other/2: There was a pre-existing link 
                //    We did not add a link
                // None/3: There was no pre-existing link AND there was no error code
                //    We did not add a link
                var errorShown = "Help"; // default to "we showed a help link" 
                var alreadyHasLink = (error.$element.children('a').length > 0);
                if (!alreadyHasLink)
                {
                    if (error.code)
                    {
                        // We have a code and there is not a pre-existing link
                        var $link = /* @static_cast(jQuery) */null;
                        if ($Config.hc.slcList && $Config.hc.slcList[error.code])
                        {
                            errorShown = "SLC";

                            // Construct the status message and link using ALE strings and a url in $Config
                            var statusText = "&nbsp;" + getString("ErrorStatusMessage");
                            var statusLink = '<a href="' + $Config.hc.slcUrl + '" target="_blank">' + getString("ErrorStatusLinkLabel") + '</a>';
                            $link = jQuery('<span/>', { "class": "errorHelpLink", html: statusText.format(statusLink) });

                            // Instrument the status link click
                            $link.click(function ()
                            {
                                $BSI.reportEvent("ClickSelected.SLC.SkyDriveInProductLink", { CMXErrorCodeSD: error.code });
                            });

                            // Instrument the error (in addition to the CMXError)
                            $BSI.reportEvent("Action.SLC.SkyDriveOutageError", { CMXErrorCodeSD: error.code });
                        }
                        else
                        {
                            // use $HelpContext to get the right url in the href and to instrument the clicks
                            $link = jQuery('<span class="errorHelpLink">&nbsp;<a target="_blank">' + $Config.hc.label + '</a></span>');
                            $HelpContext.attachContextTo($link.children('a'), error.code, error.$element.text());
                        }
                        error.$element.append($link);
                    }
                    else
                    {
                        // We didn't add a link because there was no error code
                        error.code = "noCode";
                        errorShown = "None";
                    }
                }
                else
                {
                    // There was already a link, so we don't add one
                    errorShown = "Other";
                }

                // instrument the error regardless of whether or not we showed a link
                $BSI.reportEvent("Log.WL.ErrorDisplayed", { WLErrorProduct: $Config.prop, WLErrorCode: error.code, WLErrorLinkType: errorShown });
            }

            _this._errors.push(error);
            _this._errors.sort(sortError);

            jQuery(_this).trigger(_this.errorReceivedEventName);
        };

        _this.removeAt = function (index)
        {
            /// <summary>
            /// Remove the error at the specified index.
            /// </summary>
            /// <param name="index" type="Number">Index of the item to remove.</param>

            var len = /* @static_cast(Number) */_this._errors && _this._errors.length;
            if (len > 0 && index >= 0 && index < len)
            {
                _this._errors.splice(index, 1);
                if (_this._errors.length === 0)
                {
                    jQuery(_this).trigger(_this.errorClearedEventName);
                }
            }
        };

        _this.clear = function ()
        {
            /// <summary>
            /// Clears all errors.
            /// </summary>

            if (_this._errors.length > 0)
            {
                _this._errors = [];
                jQuery(_this).trigger(_this.errorClearedEventName);
            }
        };

        _this.dismiss = function ()
        {
            /// <summary>
            /// If the error that was being shown has a dismissCallback
            /// then the callback function is called ONLY for that one error message.
            ///
            /// All of the errors are cleared after that.
            /// </summary>

            // Call the dismiss callback on the error that was actually closed
            var errors = _this._errors;
            if (errors.length > 0)
            {
                errors[0].dismissCallback && errors[0].dismissCallback();
            }

            // clear all of the notifications
            _this.clear();
        };

        _this.getErrors = function ()
        {
            /// <summary>
            /// Gets all current errors sorted by priority, then type.
            /// </summary>

            return _this._errors;
        };

        // We cannot call addBurnMessages() until _this.add method is defined.
        addBurntMessages();

        ///
    }
})();
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var wLiveControls = wLive.Controls;

    wLiveCore.PopoverManager = {
        showPopover: function (popoverName, params)
        {
            /// <summary>
            /// This waits for Bucket3 to load, then creates and shows the popover given.
            /// </summary>
            /// <param name="popoverName" type="String">Name of the popover control. Needs to be in wLive.Controls</param>
            /// <param name="params" type="Object" optional="true">Popover control options. Will be passed into the popover.show(params) function.</param>

            Debug.assert(popoverName, 'PopoverName must be defined in order to "show" it.');
            Debug.assert(!$B.Mobile, 'You cannot use popover manager for mobile controls.');

            // Wait for Bucket3 to load.
            $Do.when('Bucket3.js', 0, function ()
            {
                // Make sure this popover exists.
                Debug.assert(wLiveControls[popoverName], popoverName + ' doesnt exist in Bucket3.');

                // Create and show the popover.
                /* @disable(0092) */
                var popover = /* @static_cast(wLive.Controls.IPopoverControl) */new wLiveControls[popoverName](wLiveCore.PageController.getInstance().getViewContext());
                /* @restore(0092) */
                popover.show(params);
            });

            if (!wLiveControls[popoverName])
            {
                // TODO (414309): Show blocking loading UI.
            }
        }
    };

    ///
})();
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var wLiveControls = wLive.Controls;
    var getPCString = wLiveCore.AleHelpers.getPCString;

    wLiveControls.CommandBarHelper =
    {
        populateSharedCommands: function populateSharedCommands(viewContext, item, selection, commandBarList, isEnabledCallbacks, stringIdPart)
        {
            /// <summary>
            /// Fills the given command bar list with the available commands.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
            /// <param name="selection" type="wLive.Core.SelectionManagerSelection">Selection to render.</param>
            /// <param name="commandBarList" type="ObservableArray">The command bar list.</param>
            /// <param name="isEnabledCallbacks" type="Object">Mapping of command ID to callback indicating if the command is enabled.</param>
            /// <param name="stringIdPart" type="String">Fragment of the string ID for commands.</param>

            stringIdPart = stringIdPart || '';

            var /* @type(wLiveCore.Commands.CommandItem) */firstCommand;

            var processCommandCallback = function processCommandCallback(command, state)
            {
                /// <summary>
                /// Processes a command in the list.
                /// </summary>
                /// <param name="command" type="wLive.Core.Commands.CommandItem">The command to process.</param>
                /// <param name="state" type="*">Persisted state for processing commands.</param>

                // Save a reference to the first command in the group.
                firstCommand = firstCommand || command;

                // Use specific text for display if it exists, fall back to standard text.
                var commandString = getPCString(command.stringId + stringIdPart + 'Command') || command.string;

                // Create the NavLink.
                var navLink = wLiveControls.CommandBarHelper.createNavLink(command.action, command.sutraId, commandString, /* static_cast(ObservableArray) */state, /* clickLoc: */'CB');
            };

            var processCommandGroupCallback = function processCommandGroupCallback(commandGroupName, state, processCommands)
            {
                /// <summary>
                /// Processes a command group in the list.
                /// </summary>
                /// <param name="commandGroupName" type="String">The name of the command group.</param>
                /// <param name="state" type="*">Persisted state for processing commands.</param>
                /// <param name="processCommands" type="Array -> void">Callback for processing the commands of the group.</param>

                var collection = /* @static_cast(ObservableArray) */state;

                // Populate the menu.
                var links = [];
                processCommands(links);

                var length = links.length;
                if (length)
                {
                    var itemForCollection;
                    if (length === 1)
                    {
                        // If the menu has just one child then put the child directly in the top-level collection.
                        itemForCollection = links[0];
                    }
                    else
                    {
                        var menuName = commandGroupName + stringIdPart + 'Menu';
                        var menuHtml = wLiveControls.CommandBarHelper.createNavLinkElement(getPCString(menuName));

                        var splitMenu;
                        var menu;
                        if (commandGroupName === 'Open')
                        {
                            // Special case to show "Open" as a split menu.
                            splitMenu = wLiveControls.SplitMenu.create();
                            menu = splitMenu.getMenu();
                        }
                        else
                        {
                            // Create the menu.
                            menu = wLiveControls.Menu.create({ html: menuHtml });
                        }

                        // Add the individual links to the menu.
                        for (var i = 0; i < length; i++)
                        {
                            menu.push(links[i]);
                        }

                        if (splitMenu)
                        {
                            // Copy the first item in the menu as the top-level action of the split menu..
                            var /* @type(wLive.Core.ActionManagerAction) */firstAction = firstCommand.action;
                            var splitMenuTopLink = splitMenu.getLink();
                            splitMenuTopLink.setHtml(menuHtml);
                            splitMenuTopLink.setUrl(firstAction.url);
                            if (firstAction.click)
                            {
                                splitMenuTopLink.addClick(firstAction.click, firstAction.url);
                            }

                            itemForCollection = splitMenu;
                        }
                        else
                        {
                            itemForCollection = menu;
                        }

                        sutra(menu._$a, '$Sutra.SkyDrive.' + menuName);
                    }

                    collection.push(itemForCollection);
                }
            };

            var processCommandSeparatorCallback = function processCommandSeparatorCallback(state)
            {
                /// <summary>
                /// Processes a separator in the command list.
                /// </summary>
                /// <param name="state" type="*">Persisted state for processing commands.</param>

                var array = state['array'] || state;
                var length = array.length;
                if (length)
                {
                    var navLink = /* @static_cast(wLive.Controls.NavLink) */array[length - 1];
                    navLink.removeSeparator();
                    navLink.addSeparator();
                }
            };

            /* @disable(0092) */
            wLiveCore.CommandManager.processCommands(viewContext, item, selection, isEnabledCallbacks, processCommandCallback, processCommandGroupCallback, processCommandSeparatorCallback, /* state: */commandBarList);
            /* @restore(0092) */
        },

        initializeCommandBar: function initializeCommandBar(viewContext, sutraId)
        {
            /// <summary>
            /// Initializes the commmand bar.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <param name="sutraId" type="String">Full sutra ID of the command bar.</param>
            /// <returns type="wLive.Controls.CommandBar">The command bar (if present).</returns>

            if (window.$CommandBar)
            {
                sutra($CommandBar['$obj'], sutraId);

                var /* @dynamic */action = viewContext.actionManager.getAction('SkyDriveRoot');

                if (action)
                {
                    var logo = /* @static_cast(wLive.Controls.SplitMenu) */$CommandBar.getDataModel().logo;
                    logo.setProperty('url', action.url);
                }

                return $CommandBar;
            }

            return /* @static_cast(wLive.Controls.CommandBar) */undefined;
        },

        createNavLink: function createNavLink(navLinkOptions, actionName, text, collection, clickLoc, imageStripOptions)
        {
            /// <summary>
            /// Builds a nav link item and adds it to the given collection.
            /// </summary>
            /// <param name="navLinkOptions" type="wLive.Core.ActionManagerAction">Optiosn for the nav link.</param>
            /// <param name="actionName" type="String">Name of the action.</param>
            /// <param name="text" type="String">The text to set on the nav link.</param>
            /// <param name="collection" type="ObservableArray">The collection to add to the nav link too.</param>
            /// <param name="clickLoc" type="String">ClickLoc DataPoint for Bici.</param>
            /// <param name="imageStripOptions" type="Object" optional="true">The data to create the image strip.</param>
            /// <returns type="wLive.Controls.NavLink">The created nav link</returns>

            var navLink = /* @static_cast(wLive.Controls.NavLink) */null;

            // We need to add the bsi report event calls
            var skyCmd = navLinkOptions.skyCmd;
            if (skyCmd)
            {
                /* @disable(0086)*/
                navLinkOptions.click = wLiveCore.BiciHelpers.prependBiciReportClickAction(navLinkOptions.click, skyCmd, clickLoc);
                /* @restore(0086)*/
            }

            navLinkOptions.html = wLiveControls.CommandBarHelper.createNavLinkElement(text, imageStripOptions);
            navLink = wLiveControls.NavLink.create(navLinkOptions);
            var url = navLinkOptions.url;
            if (/* @static_cast(Boolean) */url && (url.indexOf('http') === 0))
            {
                var target = navLinkOptions.target || '_top';
                navLink._$a.attr('target', target);
            }

            sutra(navLink._$a, '$Sutra.SkyDrive.' + actionName + 'Command');

            collection.push(navLink);

            return navLink;
        },

        createNavLinkElement: function createNavLinkElement(text, imageStripOptions)
        {
            /// <summary>
            /// Builds a nav link element and returns it as a jQuery object.
            /// </summary>
            /// <param name="text" type="String">The text to set on the nav link.</param>
            /// <param name="imageStripOptions" type="Object" optional="true">The data to create the image strip.</param>
            /// <returns type="jQuery">The created nav link</returns>

            var $html = jQuery(_ce("span"));

            if (imageStripOptions)
            {
                $html.append(wLive.Core.ImageStrip.getImage(imageStripOptions));
                $html.append('&nbsp;' + text.encodeHtml());
            }
            else
            {
                $html.text(text);
            }

            return $html;
        }
    };
})();    
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var getPCString = wLiveCore.AleHelpers.getPCString;

    var c_title = 'title';

    function _processCommands(viewContext, actionManager, commands, object, isEnabledCallbacks, processCommandCallback, processCommandGroupCallback, processCommandSeparatorCallback, state)
    {
        /// <summary>
        /// Processes the commands for an item or selection.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="actionManager" type="wLive.Core.ActionManager">The action manager.</param>
        /// <param name="commands" type="Array">The commands to process.</param>
        /// <param name="object" type="*">Object for which to process commands.</param>
        /// <param name="options" type="wLive.Core.CommandManager.CommandOptions">Options for command processing.</param>
        /// <param name="state" type="*">State for command processing.</param>

        var length = commands.length;
        for (var i = 0; i < length; i++)
        {
            var commandItem = /* @static_cast(wLive.Core.Commands.CommandItem) */mix({}, /* @static_cast(Object) */commands[i]);
            var commandName = commandItem.command;
            var commandGroupName = commandItem.commandGroup;

            if (commandName)
            {
                // Process a single command.
                var action = actionManager.getAction(commandName, object);
                var commandToCheck = commandItem.alias || commandName;
                var isEnabledCallback = (isEnabledCallbacks && isEnabledCallbacks[commandToCheck]);

                if (/* @static_cast(Boolean) */action && (!commandItem.isEnabled || commandItem.isEnabled(viewContext, object)) && (!isEnabledCallback || isEnabledCallback(viewContext, object)))
                {
                    // If allowed, set the command action.
                    commandItem.action = action;

                    // Set the command ID.
                    commandItem.id = commandName;

                    // Set the string.
                    var getStringId = commandItem.getStringId;
                    commandItem.stringId = (/* @static_cast(String) */getStringId && getStringId(viewContext, object)) || commandName;
                    commandItem.string = action.string || getPCString(commandItem.stringId + 'Command');

                    var getSutraId = commandItem.getSutraId;
                    commandItem.sutraId = (/* @static_cast(String) */getSutraId && getSutraId(object)) || commandName;

                    // Process the command.
                    processCommandCallback(commandItem, state);
                }
            }
            else if (commandGroupName)
            {
                var continueProcessCommands = function continueProcessCommands(innerState)
                {
                    /// <summary>
                    /// Callback to continue processing the command list.
                    /// </summary>
                    /// <param name="innerState" type="*">State for command processing.</param>

                    _processCommands(viewContext, actionManager, commandItem.members, object, isEnabledCallbacks, processCommandCallback, processCommandGroupCallback, processCommandSeparatorCallback, innerState);
                };

                if (processCommandGroupCallback)
                {
                    // Process a command group.
                    processCommandGroupCallback(commandGroupName, state, continueProcessCommands);
                }
                else
                {
                    // In the abscence of a callback just process the inner commands with the current state..
                    continueProcessCommands(state);
                }
            }
            else
            {
                // Separation between commands.
                processCommandSeparatorCallback && processCommandSeparatorCallback(state);
            }
        };
    }

    function _isCurrentItem(viewContext, item)
    {
        /// <summary>
        /// Returns true if the given item is the current item (item being viewed).
        /// Most of the time this is the item in the hash, except in the case of a preselected document, when it is the containing folder.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the item is the current item.</returns>

        var currentItem = viewContext.currentItem;
        var viewedItemKey = currentItem.key;

        if (viewContext.currentViewType === 'SetView' && !currentItem.folder)
        {
            // When viewing a preselected document in set view use the key of the containing folder as the "viewed" item.
            viewedItemKey = currentItem.parentKey;
        }

        return viewedItemKey === item.key;
    }

    function _isNotCurrentItem(viewContext, item)
    {
        /// <summary>
        /// Returns true if the given item is not the current item.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the item is the current item.</returns>

        return !_isCurrentItem(viewContext, item);
    }

    function _isGroupRoot(viewContext, item)
    {
        /// <summary>
        /// Returns true if the given item is a group root item.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the item is a group item.</returns>

        return wLiveCore.SkyDriveItemHelper.isGroupRoot(item);
    }

    function _isNotRoot(viewContext, item)
    {
        /// <summary>
        /// Returns true if the given item is not a root item.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the item is not a root item.</returns>

        return !wLiveCore.SkyDriveItemHelper.isRootItem(item);
    }

    function _isViewItemEnabled(viewContext, item)
    {
        /// <summary>
        /// Returns true if the ViewItem command should be enabled.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the ViewItem command should be enabled.</returns>

        /* @disable(0092) */
        var defaultClickAction = viewContext.actionManager.getAction('DefaultClick', item);
        var defaultClickActionName = defaultClickAction && defaultClickAction.name;
        /* @restore(0092) */
        var isDefaultClickAction = defaultClickActionName === 'ViewItem';

        // Enabled when it is the default click action and not the item being looked at.
        return _isNotCurrentItem(viewContext, item) && isDefaultClickAction;
    }

    function _isDeleteEnabled(viewContext, item)
    {
        /// <summary>
        /// Returns true if the Delete command should be enabled.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the Delete command should be enabled.</returns>

        // If we are in the recycle bin view, the nested delete command should not be enabled
        // Selected items with the abdicate command should not have "Delete" enabled also.
        // This is to avoid confusion as to the proper action to take to remove the item from the shared list.
        return !_isRecycleBinItem(viewContext) && (_isCurrentItem(viewContext, item) || !viewContext.actionManager.getAction('Abdicate', item));
    }

    function _isOwnerRequestReviewEnabled(viewContext, item)
    {
        /// <summary>
        /// Returns true if the owner request review command should be enabled.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the owner request review command should be enabled.</returns>

        return true;
    }

    function _isOpenInExcelEnabled(viewContext, item)
    {
        /// <summary>
        /// Returns true if the OpenInExcel command should be enabled.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the OpenInExcel command should be enabled.</returns>

        // Excel forms should be opened in the Excel Web App.
        return !item.form;
    }

    function _isRecycleBinItem(viewContext)
    {
        /// <summary>
        /// Returns true if the user is currently in the recycle bin
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <returns type="Boolean">True if the user is currently in the recycle bin</returns>

        return viewContext.viewParams.qt == 'recyclebin';
    }

    function _isAddToSharedEnabled(viewContext)
    {
        /// <summary>
        /// Returns true if the AddToShared command should be enabled.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <returns type="Boolean">True if the AddToShared command should be enabled.</returns>

        return !viewContext.tokenHasBeenRedeemed;
    }

    wLiveCore.CommandManager =
    {
        processCommands: function (viewContext, item, selection, isEnabledCallbacks, processCommandCallback, processCommandGroupCallback, processCommandSeparatorCallback, initialState)
        {
            /// <summary>
            /// Processes the commands for an item or selection.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item for which to process commands.</param>
            /// <param name="selection" type="wLive.Core.SelectionManagerSelection">Selection for which to process commands.</param>
            /// <param name="options" type="wLiveCore.CommandManager.CommandOptions">Options for command processing.</param>
            /// <param name="intialState" type="*">Initial state for command processing.</param>

            var object = item;
            var actionManager = viewContext.actionManager;

            if (!item)
            {
                object = selection;
                actionManager = viewContext.multiselectActionManager;
            }

            _processCommands(viewContext, actionManager, wLiveCore.CommandManager._commands, object, isEnabledCallbacks, processCommandCallback, processCommandGroupCallback, processCommandSeparatorCallback, initialState);
        },
        commandDisabled: function commandDisabled(viewContext, item)
        {
            /// <summary>
            /// Returns that the command is not enabled.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
            /// <returns type="Boolean">True if the command is enabled.</returns>

            return false;
        },
        isCurrentItem: function isCurrentItem(viewContext, item)
        {
            /// <summary>
            /// Returns true if the given item is the current item.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
            /// <returns type="Boolean">True if the item is the current item.</returns>

            return _isCurrentItem(viewContext, item);
        },
        isNotCurrentItem: function isNotCurrentItem(viewContext, item)
        {
            /// <summary>
            /// Returns true if the given item is not the current item.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
            /// <returns type="Boolean">True if the item is the current item.</returns>

            return _isNotCurrentItem(viewContext, item);
        },
        isDeleteEnabled: function isDeleteEnabled(viewContext, item)
        {
            /// <summary>
            /// Returns true if delete is enabled for the item.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
            /// <returns type="Boolean">True if delete is enabled for the item.</returns>

            return _isDeleteEnabled(viewContext, item);
        },
        isOwnerRequestReviewEnabled: function isOwnerRequestReviewEnabled(viewContext, item)
        {
            /// <summary>
            /// Returns true if delete is enabled for the item.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
            /// <returns type="Boolean">True if delete is enabled for the item.</returns>

            return _isOwnerRequestReviewEnabled(viewContext, item);
        },
        isRecycleBinItem: function isRecycleBinItem(viewContext)
        {
            /// <summary>
            /// Returns true if the user is currently in the recycle bin.
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
            /// <returns type="Boolean">True if the user is currently in the recycle bin.</returns>

            return _isRecycleBinItem(viewContext);

        },
        _commands:
        [
            {
                commandGroup: 'Survey',
                members:
                [
                    {
                        command: 'SendSurvey'
                    },
                    {
                        command: 'PreviewSurvey'
                    },
                    {
                        command: 'EditSurvey'
                    }
                ]
            },
            {
                command: 'SlideShow'
            },
            {
                isEnabled: _isViewItemEnabled,
                command: 'ViewItem'
            },
            {
                commandGroup: 'Open',
                members:
                [
                    {
                        getStringId: function (viewContext, item)
                        {
                            /// <summary>
                            /// Gets the string ID for the item.
                            /// </summary>
                            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
                            /// <param name="item" type="*">The item.</param>
                            /// <returns type="String">The command ID.</returns>

                            var skyDriveItem = /* @static_cast(wLive.Core.ISkyDriveItem) */item;

                            if (skyDriveItem.form)
                            {
                                return 'OpenWorkbookInExcelWebApp';
                            }

                            return /* @static_cast(String) */undefined;
                        },
                        command: 'OpenInExcelWebApp'
                    },
                    {
                        command: 'OpenInOneNoteWebApp'
                    },
                    {
                        isEnabled: _isNotCurrentItem,
                        command: 'OpenInPdfWebApp'
                    },
                    {
                        command: 'OpenInPowerPointWebApp'
                    },
                    {
                        command: 'OpenInWordWebApp'
                    },
                    {
                        isEnabled: _isOpenInExcelEnabled,
                        command: 'OpenInExcel'
                    },
                    {
                        command: 'OpenInOneNote'
                    },
                    {
                        command: 'OpenInPowerPoint'
                    },
                    {
                        command: 'OpenInWord'
                    },
                    {
                        command: 'OpenInVisio'
                    },
                    {
                        command: 'OpenInProject'
                    },
                    {
                        command: 'OpenInPublisher'
                    },
                    {
                        command: 'OpenInExpo'
                    }
                ]
            },
            {
                alias: 'TopLevelDownload',
                command: 'Download'
            },
            {
                command: 'Play'
            },
            {
                command: 'Restore'
            },
            {
                isEnabled: _isRecycleBinItem,
                command: 'Delete'
            },
            {
                command: 'CopyToSkyDrive'
            },
            {
                command: 'ViewOrginal'
            },
            {
                commandGroup: 'Share',
                members:
                [
                    {
                        getStringId: function (viewContext, item)
                        {
                            /// <summary>
                            /// Gets the string ID for the item.
                            /// </summary>
                            /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
                            /// <param name="item" type="*">The item.</param>
                            /// <returns type="String">The command ID.</returns>

                            var stringId;
                            var skyDriveItem = /* @static_cast(wLive.Core.ISkyDriveItem) */item;

                            if (/* @static_cast(Boolean) */skyDriveItem.form && skyDriveItem.isViewerOwner())
                            {
                                stringId = 'ShareWorkbook';
                            }
                            else if (_isCurrentItem(viewContext, item) && viewContext.actionManager.getAction('Share', item))
                            {
                                // Use more specific strings when viewing an item in self view that is shareable.

                                if (item.video)
                                {
                                    stringId = 'ShareVideo';
                                }
                                else if (item.photo)
                                {
                                    stringId = 'SharePhoto';
                                }
                            }

                            return /* @static_cast(String) */stringId;
                        },

                        getSutraId: function (item)
                        {
                            /// <summary>
                            /// Gets the sutra ID for the item.
                            /// </summary>
                            /// <param name="item" type="*">The item.</param>
                            /// <returns type="String">The sutra id for the command.</returns>

                            return 'Share';
                        },

                        command: 'Sharing'
                    },
                    {
                        command: 'ShareParent'
                    }
                ]
            },
            {
                alias: 'TopLevelEmbed',
                command: 'Embed'
            },
            {
                isEnabled: _isAddToSharedEnabled,
                command: 'AddToShared'
            },
            {
                commandGroup: 'Manage',
                members:
                [
                    {
                        alias: 'NestedDownload',
                        command: 'Download'
                    },
                    {
                        alias: 'NestedEmbed',
                        command: 'Embed'
                    },
                    {
                        isEnabled: _isCurrentItem,
                        command: 'OrderPrints'
                    },
                    {
                    },
                    {
                        command: 'RemoveFromMRU'
                    },
                    {
                        isEnabled: _isNotCurrentItem,
                        command: 'Rename'
                    },
                    {
                        alias: 'NestedDelete',
                        isEnabled: _isDeleteEnabled,
                        command: 'Delete'
                    },
                    {
                        command: 'Abdicate'
                    },
                    {
                        command: 'ReportAbuse'
                    },
                    {
                        command: 'Move'
                    },
                    {
                        command: 'Copy'
                    },
                    {
                    },
                    {
                        command: 'ViewVersions'
                    },
                    {
                    },
                    {
                        command: 'OpenFileLocation'
                    },
                    {
                        command: 'ViewInFolder'
                    },
                    {
                        isEnabled: _isOwnerRequestReviewEnabled,
                        command: 'OwnerRequestReview'
                    },
                    {
                        isEnabled: _isNotRoot,
                        command: 'Properties'
                    }
                ]
            },
            {
                commandGroup: 'Group',
                members:
                [
                    {
                        command: 'GroupSendMail'
                    },
                    {
                        command: 'GroupViewMail'
                    },
                    {
                    },
                    {
                        command: 'GroupDiscussions'
                    },
                    {
                        command: 'GroupInvite'
                    },
                    {
                        command: 'GroupMembership'
                    },
                    {
                    },
                    {
                        command: 'ViewGroupCalendar'
                    },
                    {
                        command: 'AddGroupCalendar'
                    },
                    {
                        isEnabled: _isGroupRoot,
                        command: 'Properties'
                    }
                ]
            },
            {
                command: 'GroupProfile'
            },
            {
                command: 'GroupOptions'
            },
            {
                command: 'Deselect'
            }
        ]
    };
})();

/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var CommandManager = wLiveCore.CommandManager;
    var SkyDriveItemHelper = wLiveCore.SkyDriveItemHelper;
    var getPCString = wLiveCore.AleHelpers.getPCString;

    var c_commandListHtml = '<ul class="c_m t_hovl"></ul>';
    var c_menuParentHtml = '<div class="c_mp co_me" style="position:absolute;"></div>';
    var c_dividerHtml = '<span class="c_ms"></span>';

    var c_rightclick = 'contextmenu';

    var c_visibility = 'visibility';

    var c_visible = 'visible';

    var key_escape = 27;

    function _isOpenFileLocationEnabled(viewContext, item)
    {
        /// <summary>
        /// Returns true if the OpenFileLocation command should be enabled.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the OpenFileLocation command should be enabled.</returns>

        // Enabled for self view and items in the search results list.
        return CommandManager.isCurrentItem(viewContext, item) || SkyDriveItemHelper.isSearchResult(item);
    }

    function _isViewInFolderEnabled(viewContext, item)
    {
        /// <summary>
        /// Returns true if the ViewInFolder command should be enabled.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the ViewInFolder command should be enabled.</returns>

        // Enabled for items in the MRU list.
        return SkyDriveItemHelper.isMruQuery(item);
    }

    function _isRenameEnabled(viewContext, item)
    {
        /// <summary>
        /// Returns true if the Rename command should be enabled.
        /// </summary>
        /// <param name="viewContext" type="wLive.Core.ViewContext">The view context.</param>
        /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
        /// <returns type="Boolean">True if the Rename command should be enabled.</returns>

        // Enabled only for set view.
        return viewContext.currentViewType === 'SetView';
    }

    // Callbacks to indicate when commands should be hidden.
    var c_isEnabledCallbacks =
    {
        NestedDownload: CommandManager.commandDisabled,
        NestedShare: CommandManager.commandDisabled,
        NestedEmbed: CommandManager.commandDisabled,
        OpenFileLocation: _isOpenFileLocationEnabled,
        Properties: CommandManager.isNotCurrentItem,
        Rename: _isRenameEnabled,
        ShareParent: CommandManager.commandDisabled,
        SlideShow: CommandManager.commandDisabled,
        ViewInFolder: _isViewInFolderEnabled,
        NestedDelete: CommandManager.isDeleteEnabled,
        OwnerRequestReview: CommandManager.isOwnerRequestReviewEnabled
    };

    wLive.Controls.ContextMenu = ContextMenu;
    /* @bind(wLive.Controls.ContextMenu) */function ContextMenu($container, viewContext)
    {
        /// <summary>
        /// Initializes a new instance of the ContextMenu class.
        /// </summary>
        /// <param name="$container" type="jQuery">jQuery Object. Not used in this control, but shown for consistency with other controls.</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">View Context Object.</param>

        // Local Variable to crunch "this" and allow callbacks to use "this" without making delegates.
        var _this = this;

        // Parent element to context menu, which is used to determine menu's position
        var /* @type(jQuery) */_$menuParent;

        // Binding to the menu object
        var /* @type($menu) */_menuControl;

        var menuShowing = false;

        var rightClickEvent;

        var _$selectionManager;

        if (viewContext)
        {
            _$selectionManager = jQuery(viewContext.selectionManager);
            _$selectionManager.bind(wLiveCore.SelectionManager.SelectionChangedEvent, _onSelectionChanged);
        }

        _this.render = function (item, selection, options)
        {
            /// <summary>
            /// Render the ContextMenu control.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render menu for (used when only 1 item was selected).</param>
            /// <param name="selection" type="wLive.Core.SelectionManagerSelection">Selection manager selection (used when 1 or more items's were selected).</param>
            /// <param name="options" type="wLive.Controls.ContextMenuOptions">Context menu options.</param>

            Debug.assert(!(item && selection), "Item and selection can't both be defined.");
            Debug.assert((item || selection), "Either item or selection must be defined.");

            rightClickEvent = options.ev;

            menuShowing = true;

            // Treat a selection of 1 as an item.
            var selectionCount = /* @static_cast(Number) */selection && selection.selectionCount;
            if (selectionCount === 1)
            {
                for (var index in selection.indexes)
                {
                    var parent = /* @static_cast(wLive.Core.ISkyDriveItem) */selection.parent;
                    item = parent.getChildren().get(index);
                    break;
                }
            }

            if (_menuControl)
            {
                /* @disable(0092) */
                _menuControl.dispose();
                /* @restore(0092) */

                _menuControl = null;
            }
            else
            {
                // Add context menu to disposable items, so that it gets disposed on page navs
                viewContext.itemScopedDisposables.push(_this);
            }

            // Remove command list
            if (_$menuParent)
            {
                _$menuParent.remove();
            }

            _$menuParent = jQuery(c_menuParentHtml).appendTo(document.body);

            // Position the context menu where specified by the options
            var position = options.pos;
            _$menuParent.css({ 'left': position.x, 'top': position.y });

            // Create ul
            var $commandList = jQuery(c_commandListHtml).bind('keydown', _onKeyDown).bind(c_rightclick, function () { return false; });
            sutra($commandList, '$Sutra.SkyDrive.ContextMenu');

            function processCommandCallback(commandItem, state)
            {
                /// <summary>
                /// Processes a command in the list.
                /// </summary>
                /// <param name="commandItem" type="wLive.Core.Commands.CommandItem">The command to process.</param>
                /// <param name="state" type="*">Persisted state for processing commands.</param>

                var $container = /* @static_cast(jQuery) */state;
                var $a = wLiveCore.ActionManager.setATagAction(commandItem.action, /* $jQueryObject: */null, options.bici, _commandClickHandler);
                $a.html(commandItem.string.encodeHtml());
                sutra($a, '$Sutra.SkyDrive.' + commandItem.sutraId + 'Command');

                // IE tabs correctly only if tabindex is not set
                // FF/Chrome needs tabindex
                if (!$B.IE && $a instanceof jQuery)
                {
                    $a.attr("tabindex", 1);
                }
                var $li = jQuery('<li></li>').append($a).appendTo($container);
            };

            function processCommandGroupCallback(commandGroupName, state, processCommands)
            {
                /// <summary>
                /// Processes a command group in the list.
                /// </summary>
                /// <param name="commandGroupName" type="String">The name of the command group.</param>
                /// <param name="state" type="*">Persisted state for processing commands.</param>
                /// <param name="processCommands" type="jQuery -> void">Callback for processing the commands of the group.</param>

                var $container = /* @static_cast(jQuery) */state;

                // Create a temporary element to hold the processed commands.
                var $subContainer = jQuery('<ul></ul>');

                // Process the child commands.
                processCommands($subContainer);

                var $subContainerChildren = $subContainer.children();
                var $containerChildren = $container.children();

                // Place a divider between sections with more than one command.
                if ($subContainerChildren.length > 1)
                {
                    if ($containerChildren.length > 0 && $containerChildren.last().find('.c_ms').length === 0)
                    {
                        $containerChildren.last().append(c_dividerHtml);
                    }
                    $subContainerChildren.last().append(c_dividerHtml);
                }
                $container.append($subContainerChildren);


                $container.append($subContainerChildren);
            };

            wLiveCore.CommandManager.processCommands(viewContext, item, selection, c_isEnabledCallbacks, processCommandCallback, processCommandGroupCallback, /* processCommandSeparatorCallback: */null, $commandList);
            var $containerChildren = $commandList.children();

            // Remove the seperator at the end if it exists
            $containerChildren.last().find('.c_ms').remove();

            // Add context menu to parent
            _$menuParent.append($commandList);

            // Using _$menuParent.get(0) instead of _$menuParent[0] since Menu.js expects a Dom element not a jquery object
            var parentElem = _$menuParent.get(0);

            window.$menu.create(/* HtmlEvent */rightClickEvent, /* Position */0,  /* Params */{menuEl: $commandList.get(0), sourceEl: parentElem, parentEl: document.body });

            // Store the menu object, so that we can access its internal methods
            // Disabling since this produces a Menu.js object, which doesn't have a vsdoc
            /* @disable(0092) */
            _menuControl = parentElem.menu;
            /* @restore(0092) */

            // Puts a hidden anchor at the top of the menu to fix TAB focusing in Firefox
            // var $focusMe = jQuery('<a tabindex="1"></a>');
            // $commandList.css(c_visibility, c_visible).prepend(jQuery('<li></li>').append($focusMe));
            // $focusMe.focus().parent().hide();
        };

        _this.hide = function ()
        {
            /// <summary>
            /// Hides the context menu if it is showing.
            /// </summary>

            if (menuShowing)
            {
                /* @disable(0092) */
                _menuControl && _menuControl.hide();
                /* @restore(0092) */

                menuShowing = false;
            }
        };

        _this.dispose = function ()
        {
            /// <summary>
            /// Disposes the context menu.
            /// </summary>

            // Dispose the menu item
            if (_menuControl)
            {
                /* @disable(0092) */
                _menuControl.dispose();
                /* @restore(0092) */

                _menuControl = null;
            }

            // Remove menu html
            if (_$menuParent)
            {
                _$menuParent.empty();
            }

            _$selectionManager && _$selectionManager.unbind(wLiveCore.SelectionManager.SelectionChangedEvent, _onSelectionChanged);
        };

        function _commandClickHandler(ev, click)
        {
            /// <summary>
            /// This is the click handler for all context menu commands.
            /// </summary>
            /// <param name="ev" type="HTMLEvent"></param>
            /// <param name="click" type="Object, Object, Object, Object, HTMLElement -> Boolean"></param>

            _this.hide();

            // Execute the default click behavior for the command.
            return click(null, null, null, null, ev.target);
        }

        function _onKeyDown(e)
        {
            /// <summary>
            /// Keydown event handler.
            /// </summary>
            /// <param name="e" type="HTMLEvent"></param>

            var which = e.which;

            // When the user presses ESC we invoke the default click handler for the selected item.
            if (which === key_escape || which > 36 && which < 41 /* Arrow keys */)
            {
                _this.hide();

                return false;
            }

            return /* @static_cast(Boolean) */undefined;
        }

        function _onSelectionChanged()
        {
            /// <summary>Hide context menu on selection changes.</summary>

            _this.hide();
        }

        ///
    }

    ///
})();

/// Copyright (C) Microsoft Corporation. All rights reserved.
///
/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLive = window.wLive;

    wLive.Controls.EditableTextOptions = function ()
    {
        /// <summary>
        /// DO NOT INSTANTIATE THIS. This class is defined for type checking in CoffeeMaker.
        /// </summary>
    };

    ///

    wLive.Controls.EditableTextOptions.prototype =
    {
        /// <summary>
        /// Name of the item property to be edited.
        /// </summary>
        n: "name",

        gdt: function (viewContext, item)
        {
            /// <summary>
            /// Gets the display text for the item property;
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">View Context Object.</param>
            /// <param name="item" type="wLive.Core.SkyDriveItem">The item.</param>
        },

        /// <summary>
        /// True if the snippet should be displayed with the field.
        /// </summary>
        snp: false,

        /// <summary>
        /// Function to return the default value of the property to show if the item lacks it.
        /// </summary>
        v: function (item) { return "defaultValue"; },

        /// <summary>
        /// True if the editable area should grow as more characters are entered.
        /// </summary>
        g: true,

        /// <summary>
        /// True if the editable area should be centered like on the self view.
        /// </summary>
        c: false,
        
        /// <summary>
        /// Max length allowed in the input area.  0 means unlimited.
        /// </summary>
        ml: 0,
        
        /// <summary>
        /// True if the edit entry UI should be disabled.
        /// </summary>
        de: false,
        
        /// <summary>
        /// The click action for the text.
        /// </summary>
        ca: "ClickAction",
        
        /// <summary>
        /// Custom class to be applied to the action text.
        /// </summary>
        ac: "actionClass",
        
        /// <summary>
        /// Custom class to be applied to the input element.
        /// </summary>
        ic: "inputClass",
        
        /// <summary>
        /// Custom class to be applied to the edit element.
        /// </summary>
        ec: "editClass",
        
        gem: function (item, input)
        {
            /// <summary>
            /// Gets the error message (if any) for an input.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item that the input is being used against.</param>
            /// <param name="input" type="String">The input to validate.</param>
        },
        
        get: function (item)
        {
            /// <summary>
            /// Gets the error title (if any) for an item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item.</param>
        },
        
        sc: function (item)
        {
            /// <summary>
            /// Success callback; An edit action occurred for an item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item.</param>
        },

        /// <summary>
        /// Name of the action representing the person's ability to edit the property.
        /// </summary>
        aa: "authAction",
        
        /// <summary>
        /// Name of the action associated with editing this property.
        /// </summary>
        ea: "editAction"
    };

})();
 
/// <reference path=".../../setview.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var getString = wLiveCore.AleHelpers.getString;
    var getMarketInfoValue = wLiveCore.AleHelpers.getMarketInfoValue;

    // this is the difference between the .net ticks and the javascript Date ticks
    var c_ticksConversionConstant = 62135596800000;

    var c_yesterday = getString('Dates.Yesterday');
    var c_daysAgo = getString('Dates.DaysAgo');
    var c_hourAgo = getString('Dates.HourAgo');
    var c_hoursAgo = getString('Dates.HoursAgo');
    var c_minuteAgo = getString('Dates.MinuteAgo');
    var c_minutesAgo = getString('Dates.MinutesAgo');
    var c_momentAgo = getString('Dates.MomentAgo');
    var c_momentAgoLowercase = getString('Dates.MomentAgoLowerCase');
    var c_dayMonthYearPattern = getMarketInfoValue('DateFormat.DayMonthYearPattern');
    var c_dayWithSuffix = getMarketInfoValue('DateFormat.DayAndSuffixPattern');
    var c_appendAfterDay = getMarketInfoValue('DateFormat.AppendAfterDay');

    var c_dataAttrTicks = '_t';
    var c_dateUpdateInterval = 60 * 1000; // 1 minute

    var _dates = [];
    var c_updatePageSize = 10;

    wLiveCore.DateFactory =
    {
        getDate: function (ticks, localizedDate, useLowercase)
        {
            /// <summary>
            /// Creates a dynamic jQuery object which auto updates itself and contains a friendly text representation of the date.
            /// </summary>
            /// <param name="ticks" type="Number">DateTime in ticks.</param>
            /// <param name="localizedDate" type="String">.Net localized date. item.DisplayModifiedDate or item.DisplayCreationDate</param>
            /// <param name="useLowercase" type="Boolean" optional="true">True if a lowercase date string is desired.</param>
            /// <returns type="jQuery">jQuery object with logic that auto updates itself every so often.</returns>

            var $date = jQuery(_ce("span"));

            if (ticks > 0)
            {
                _dates.push({ el: $date.text(_getDateString(ticks, localizedDate, useLowercase)), ticks: ticks, localizedDate: localizedDate });
            }

            return $date;
        },

        getDateString: _getDateString,

        getFormattedDate: function (ticks)
        {
            /// <summary>
            /// Gets date formatted in current locale.
            /// </summary>
            /// <param name="ticks" type="Number">DateTime in ticks.</param>
            /// <returns type="String">A string of date formatted in current locale.</returns>

            var ticksInMilliseconds = getTicksInMilliseconds(ticks);
            var itemDate = new Date(ticksInMilliseconds);

            var monthNumber = (itemDate.getMonth() + 1).toString();
            var dayOfMonth = itemDate.getDate();

            var abbreviatedMonth = getString(("Dates.AbbreviatedMonth_{0}").format(monthNumber));

            var day = c_dayWithSuffix.format(dayOfMonth, c_appendAfterDay);

            var formattedDate = c_dayMonthYearPattern.format(abbreviatedMonth, day, itemDate.getFullYear());

            return formattedDate;
        },

        getUTCDateTime: function (ticks, localizedDate)
        {
            /// <summary>
            /// Gets date formatted in utc format.
            /// </summary>
            /// <param name="ticks" type="Number">DateTime in ticks.</param>
            /// <param name="localizedDate" type="String" optional="true">Not used. Here only for signature parity.</param>
            /// <returns type="jQuery">A string of date formatted in utc format.</returns>

            var $date = jQuery(_ce("span"));

            var ticksInMilliseconds = getTicksInMilliseconds(ticks);
            var itemDate = new Date(ticksInMilliseconds);

            var monthNumber = (itemDate.getUTCMonth() + 1).toString();
            var dayOfMonth = itemDate.getUTCDate();
            var yearOfMonth = itemDate.getUTCFullYear();
            var hourNumber = itemDate.getUTCHours();
            var minutesNumber = itemDate.getUTCMinutes();
            var secondsNumber = itemDate.getUTCSeconds();

            minutesNumber = minutesNumber > 9 ? minutesNumber : '0' + minutesNumber;
            secondsNumber = secondsNumber > 9 ? secondsNumber : '0' + secondsNumber;

            var formattedDate = "{0}/{1}/{2} {3}:{4}:{5} UTC";
            var readableDate = formattedDate.format(monthNumber, dayOfMonth, yearOfMonth, hourNumber, minutesNumber, secondsNumber);

            $date.text(readableDate);
            return $date;
        }
    };

    function getTicksInMilliseconds(ticks)
    {
        /// <summary>
        /// Converts ticks from .NET to JavaScript style.
        /// </summary>

        var ticksInMilliseconds = (ticks / 10000) - c_ticksConversionConstant;

        return ticksInMilliseconds;
    }

    function _getDateString(ticks, localizedDate, useLowercase)
    {
        /// <summary>
        /// Gets the text for the date.
        /// </summary>
        /// <param name="ticks" type="Number">DateTime in UTC ticks.</param>
        /// <param name="localizedDate" type="String">DateTime Localized.</param>
        /// <param name="useLowercase" type="Boolean" optional="true">True if a lowercase date string is desired.</param>

        var currentDate = new Date();
        var ticksInMilliseconds = getTicksInMilliseconds(ticks);
        var timeDifference = (currentDate.getTime() - ticksInMilliseconds); // in milliseconds

        var days = getDays(timeDifference);
        var hours = getHours(timeDifference);
        var minutes = getMinutes(timeDifference);

        if (days > 0)
        {
            if (days < 7)
            {
                // {0} days ago
                return (days == 1 ? c_yesterday : c_daysAgo).format(days);
            }
            else
            {
                return localizedDate ? localizedDate : wLiveCore.DateFactory.getFormattedDate(ticks);
            }
        }
        else if (hours > 0)
        {
            // {0} hour(s) ago
            return (hours == 1 ? c_hourAgo : c_hoursAgo).format(hours);
        }
        else if (minutes > 0)
        {
            // {0} minutes(s) ago
            return (minutes == 1 ? c_minuteAgo : c_minutesAgo).format(minutes);
        }
        else
        {
            return useLowercase ? c_momentAgoLowercase : c_momentAgo;
        }
    }

    function getDays(milliseconds)
    {
        if (milliseconds == 0)
        {
            return 0;
        }

        return Math.floor(milliseconds / 1000 / 60 / 60 / 24);
    }

    function getHours(milliseconds)
    {
        if (milliseconds == 0)
        {
            return 0;
        }

        return Math.floor(milliseconds / 1000 / 60 / 60);
    }

    function getMinutes(milliseconds)
    {
        if (milliseconds == 0)
        {
            return 0;
        }

        return Math.floor(milliseconds / 1000 / 60);
    }


    setTimeout(updateDates, c_dateUpdateInterval);

    function updateDates()
    {
        /// <summary>
        /// Updates the strings of all the dates that are onscreen.
        /// Dates that are no longer in the DOM are removed from the list of dates to update in the future.
        /// </summary>

        var onscreenDates = [];

        updateSomeDates(_dates, onscreenDates, 0);
    }

    function updateSomeDates(dates, onscreenDates, start)
    {
        /// <summary>
        /// Updates a pagesize of dates. Calls itself again with the next page.
        /// </summary>
        /// <param name="dates" type="Array">List of all dates that we are updating.</param>
        /// <param name="onscreenDates" type="Array">Array to add the onscreen dates to once they're updated.</param>
        /// <param name="start" type="Number">Starting index for our array.</param>

        Debug.assert(dates, "updateSomeDates was called without an array of dates");
        Debug.assert(start != null && start > -1, "updateSomeDates was called with an invalid start index");

        var end = Math.min(start + c_updatePageSize, dates.length);

        // update the dates in the current page
        for (var i = start; i < end; i++)
        {
            var dateData = dates[i];
            if (updateDate(dateData))
            {
                // add to good array
                onscreenDates.push(dateData);
            }
        }

        // kick off next batch if there are more
        if (end < dates.length)
        {
            setTimeout(function () { updateSomeDates(dates, onscreenDates, end); }, 10);
        }
        else
        {
            // all finished so reset the full date with with the new good date list
            _dates = onscreenDates;

            setTimeout(updateDates, c_dateUpdateInterval);
        }
    }

    function updateDate(dateData)
    {
        /// <summary>
        /// Updates a single date object.
        /// </summary>
        /// <param name="dateData" type="Object">Contains the date element and ticks.</param>
        /// <returns type="Boolean">Is the date on screen still?</returns>

        var isStillOnScreen = false;

        var $date = /* @static_cast(jQuery) */dateData['el'];
        var ticks = dateData['ticks'];
        var localizedDate = dateData['localizedDate'];
        if (/* @static_cast(Boolean) */$date && $date.closest('body').size() !== 0 && /* @static_cast(Boolean) */ticks)
        {
            // The date is in the DOM.
            // Update the string.
            $date.text(_getDateString(ticks, localizedDate));

            isStillOnScreen = true;
        }

        return isStillOnScreen;
    }
})();

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var wLiveControls = wLive.Controls;
    var wLiveCoreImages = wLiveCore.Images;
    var getString = wLiveCore.AleHelpers.getString;
    var CommandManager = wLiveCore.CommandManager;

    var c_mediumImageSize = 128;
    var c_smallImageSize = 64;
    var c_largeIconSize = 48;
    var c_mediumIconSize = 32;

    // 5px on left, 5px on right, 5px between icon and text.
    var c_documentPadding = $B.Mobile ? 5 : 12;

    var c_period = '.';
    var c_albumOverlayClassName = 'itemTos';

    var c_stringEmpty = '';
    var c_alt = 'alt';
    var c_title = 'title';
    var c_src = 'src';
    var c_widthKey = 'w';
    var c_heightKey = 'h';
    var c_pulseIdKey = 'p';

    var c_rightclick = 'contextmenu';

    var c_img = 'img';
    var c_load = 'load';
    var c_error = 'error';
    var c_abort = 'abort';
    var c_margin_top = 'margin-top';
    var c_opacity = 'opacity';
    var c_zIndex = 'z-index';
    var c_loadedItemTileClassName = 'itemTl';
    var c_linear = 'linear';
    var c_pulseFadeOutSpeed = c_pulseFadeInSpeed = 1000;
    var c_pulseFadeOutOpacity = 0;

    // Time limits before showing loading and error messages.
    var c_timeBeforeLoading = 500;
    var c_timeBeforeError = 9500;

    // This represents a small image.
    var c_smallWidth = 0;
    var c_smallThumbnailHeight = $B.Full ? 128 : 64;
    var c_smallThumbnailName = 'height' + c_smallThumbnailHeight;

    var c_right = $B.rtl ? "left" : "right";
    var c_left = $B.rtl ? "right" : "left";
    var margin_left = "margin-" + c_left;
    var c_visibility = 'visibility';
    var c_hidden = 'hidden';

    // Simple image template
    // {0} is alt text (html attribute encoded)
    var c_imageTemplate = '<span class="itemTp"><img alt="{0}" title="" /></span>';

    // Photo template
    // {0} is alt text (html attribute encoded)
    // Note - the itemTS is only here for an IE 8 right click bug on photos/videos.
    // However it also causes a bug in pulsing of albums which is why we don't use itemTs there.
    var c_photoTemplate = ($B.Mobile ? '' : '<span class="itemTs"></span>') + c_imageTemplate;

    // Video template (technically a photo with an overlay)
    // {0} is alt text (html attribute encoded)
    // itemTvo will contain the image strip but will be set in resize since size determines which strip to use.
    var c_videoTemplate = '<span class="itemTo"><span class="itemTvo"></span></span>' +
        '<span class="itemTos">' + c_photoTemplate + '</span>';

    // Album template (technically a photo with an overlay)
    // {0} is alt text (html attribute encoded)
    // {1} is child count
    var c_albumTemplate = '<span class="itemTo itemTag"><span class="itemTa"><span class="itemTan"><span class="itemName"></span></span></span><span class="itemTac">{1}</span></span>' +
        '<span class="itemTos">' + c_imageTemplate + '</span><span class="itemTos">' + c_imageTemplate + '</span>';

    // Folder template
    // {0} is child count
    var c_folderGradient = $B.Mobile ? "/mobile_folder_gradient.png" : "/folder_gradient.png";
    var c_folderOverlay = $B.Mobile ? "/mobile_folder_overlay.png" : "/folder_overlay.png";
    var c_folderTemplate = '<span class="itemTo itemTf"><span class="itemTfhov"><span class="itemTfg"><span class="itemTfi"><img src="' + (FilesConfig.foldersImgBaseUrl + c_folderGradient).encodeHtmlAttribute() + '" class="itemTgrad" width="100%" height="100%" /></span><img class="itemTfo" src="' + (FilesConfig.foldersImgBaseUrl + c_folderOverlay).encodeHtmlAttribute() + '" /></span></span><span class="itemTa"><span class="itemTan"><span class="itemName"></span></span></span><span class="itemTac">{0}</span></span>';

    // Document (including generic item) template
    // Date modified will be added to itemTdm
    // itemTd will contain the image strip but will be set in resize since size determines which strip to use.
    var c_documentTemplate = '<span class="itemTd"><span class="itemTdc"><span class="itemTdio"><span class="itemTdi"></span></span><span class="itemTdt"><span class="itemTdn"><span class="itemName"></span></span><span class="itemTdm"></span></span></span></span>';

    // Missing video thumbnail template
    // {0} is video static content image url
    // {1} is alt text (html attribute encoded)
    var c_noVideoThumbnailTemplate = '<span class="itemTo"><span class="itemTvo"></span></span>' +
        '<span class="itemTos"><img class="itemTnv" src="{0}" alt="{1}" title="" /></span>'; ;

    // Missing photo thumbnail template
    var c_noPhotoThumbnailTemplate = '<span class="itemTnp"></span>';

    wLive.Controls.ItemTile = ItemTile;
    /* @bind(wLive.Controls.ItemTile) */function ItemTile($container, viewContext, options)
    {
        /// <summary>
        /// Initializes a new instance of the ItemTile class.
        /// </summary>
        /// <param name="$container" type="jQuery">jQuery Object which contains the containing element to render the Item Tile Control within.</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">View Context Object.</param>
        /// <param name="options" type="wLive.Controls.ItemTileOptions" optional="true">Item tile options</param>

        // Local Variable to crunch "this" and allow callbacks to use "this" without making delegates.
        var _this = this;

        options = options || {};

        var _$positionWrapper = jQuery('<span class="itemT"></span>');

        // Current State
        var /* @type(wLive.Core.ISkyDriveItem) */_currentItem;
        var /* @type(Number) */_currentItemVersion;
        var /* @type(jQuery) */_$img;
        /* When the high resolution image has to replace the low resolution image
        we have to fade it in. If we just change the src the resolution change
        is too jaring and produces optical illusions of the image moving by a pixel. */
        var /* @type(jQuery) */_$highResImg;
        var /* @type(jQuery) */_$pulseImg;
        var /* @type(String) */_thumbnailSrc;
        var _smallThumbnailSrc;

        var _isLoaded;

        var /* @type(Number) */_constrainedWidth;
        var /* @type(Number) */_constrainedHeight;
        var _itemWidth = 0;
        var _itemHeight = 0;
        var /* @type(Number) */_largestLoadedWidth;
        var /* @type(Number) */_largestLoadedHeight;
        var _isFolderWithCovers = false;
        var /* @type(Boolean) */_quick;
        // Current index of the album's cover.
        // This allows us to force pulse to actually change something.
        var /* @type(Number) */_currentAlbumThumbnailIndex;
        // To remember what the current image is.
        var /* @type(Boolean) */_secondImageShown;
        var /* @dynamic */_editableName;

        // To deal with slow loading images.
        // Use header loading dots and some time outs.
        var /* @type(Number) */_loadingTimerId;
        var /* @type(Number) */_errorTimerId;

        sutra(_$positionWrapper, '$Sutra.SkyDrive.ItemTile');

        $container.append(_$positionWrapper);

        if ($B.Full)
        {
            _$positionWrapper.bind(c_rightclick,
                function (ev)
                {
                    /// <summary>
                    /// Event handler for context menu event.
                    /// </summary>
                    /// <param name="ev" type="wLive.JQueryEvent">Context menu event.</param>

                    // Menu should only show if sm option is set, and shift key isn't pressed
                    if (options.sm && !ev.shiftKey)
                    {
                        showContextMenu(ev);
                        return false;
                    }

                    return /* @static_cast(Boolean) */undefined;
                }
            );
        }

        _this.render = function (item, quick, newOptions)
        {
            /// <summary>
            /// Render the item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
            /// <param name="quick" type="Boolean" optional="true">Allows item tile to render without network requests.</param>
            /// <param name="newOptions" type="wLive.Controls.ItemTileOptions" optional="true">Item tile options to override existing options.</param>

            Debug.assert(item, 'Must provide item to Render');

            var sameItem = wLiveCore.SkyDriveItem.areItemsSame(_currentItem, item, /* strictMode: */true) && _currentItemVersion === item.getVersion();

            // Optionally override options on render calls.
            options = newOptions || options;

            if (sameItem)
            {
                _this.resize();
            }

            if (!sameItem || _quick != quick)
            {
                _quick = quick;

                if (sameItem)
                {
                    if (/* @static_cast(Boolean) */_$highResImg && !_quick)
                    {
                        if (!_isLoaded)
                        {
                            // Start timer before loading the image.
                            if (!_loadingTimerId)
                            {
                                _loadingTimerId = setTimeout(showLoading, c_timeBeforeLoading);

                                if (_errorTimerId)
                                {
                                    clearTimeout(_errorTimerId);
                                    _errorTimerId = null;
                                }
                            }

                            // Upgrade.
                            _$highResImg.bind(c_load, showHighResImage);
                            wLiveCoreImages.loadImage(_thumbnailSrc, _$highResImg[0]);
                        }
                    }
                }
                else
                {
                    _isLoaded = false;
                    _currentItem = item;
                    _currentItemVersion = _currentItem.getVersion();

                    // Reset state variables.
                    _itemWidth = 0;
                    _itemHeight = 0;
                    _constrainedWidth = 0;
                    _constrainedHeight = 0;
                    _largestLoadedWidth = 0;
                    _largestLoadedHeight = 0;

                    // Dispose events, null out some elements and stop animations for the different images.
                    disposeInternal();

                    hideLoading();

                    // Reset the position wrapper.
                    _$positionWrapper.empty();
                    _$positionWrapper.removeClass(c_loadedItemTileClassName);

                    // Check container size.
                    // Must occur before we parse item for thumbnail.
                    checkContainerSize();

                    // Parse the item for the thumbnail (Photo/Video/Folder with Cover and sometimes audio)
                    parseItemForThumbnail();

                    _secondImageShown = false;

                    renderItem();

                    positionContents();
                }
            }
        };

        _this.isLoaded = function ()
        {
            /// <summary>
            /// If the item is fully loaded;
            /// </summary>

            return _isLoaded;
        };


        function renderItem()
        {
            /// <summary>
            /// Chooses what item to render and calls on appropriate render function.
            /// </summary>

            if (_thumbnailSrc)
            {
                // Order matters because videos can be photos.
                if (_currentItem.video)
                {
                    renderVideo();
                }
                else if (_currentItem.photo || _currentItem.audio)
                {
                    renderPhoto();
                }
                else
                {
                    renderAlbum();
                }
            }
            else
            {
                if (!options.df && /* @static_cast(Boolean) */ _currentItem.folder)
                {
                    // Render folders without cover thumbnails.
                    renderFolder();
                }
                else if (/* @static_cast(Boolean) */_currentItem.photo || /* @static_cast(Boolean) */_currentItem.video || _currentItem.isProcessingVideo)
                {
                    // Render photo/video without a thumbnail.
                    renderMissingThumbnail();
                }
                else
                {
                    // Includes anything without a thumbnail.
                    // This means it might be a document, generic item, video or photo.
                    renderDocument();
                }

                _isLoaded = true;
            }
        }

        function renderVideo()
        {
            /// <summary>
            /// Renders a video in the item tile control.
            /// </summary>

            var template = options.dv ? c_photoTemplate : c_videoTemplate;
            var markup = template.format(_currentItem.name.encodeHtmlAttribute());
            _$positionWrapper.html(markup);
            _$img = jQuery(c_img, _$positionWrapper);
            _$img.bind(c_error, imageError);
            setImageSrc();
        }

        function setImageSrc()
        {
            /// <summary>
            /// Helper function to set the src of the image.
            /// This uses the low res image first then upgrades to perfect image
            /// later.
            /// It also allows you to skip perfect image when rendering in quick mode.
            /// </summary>

            if (wLiveCoreImages.isComplete(_thumbnailSrc))
            {
                // If big one is already loaded just use it now.
                _$img.attr(c_src, _thumbnailSrc);
                _$positionWrapper.addClass(c_loadedItemTileClassName);
                _isLoaded = true;
            }
            else
            {
                var smallLoaded = wLiveCoreImages.isComplete(_smallThumbnailSrc);

                if (smallLoaded)
                {
                    // If small one is already loaded just use it now.
                    _$img.attr(c_src, _smallThumbnailSrc);
                    _$positionWrapper.addClass(c_loadedItemTileClassName);
                }
                else
                {
                    // hide this image since its not loaded, and we wont load that image
                    _$img.hide();
                }

                if (!smallLoaded || _smallThumbnailSrc != _thumbnailSrc)
                {
                    // If the thumbnail urls are different prepare an img element for the high resolution image.
                    _$highResImg = jQuery('<img />').attr(c_title, '').attr(c_alt, _$img.attr(c_alt)).css(c_opacity, 0).css(c_zIndex, 1);
                    _$highResImg.insertBefore(_$img);

                    if (!_quick)
                    {
                        // Start timer before loading the image.
                        if (!_loadingTimerId)
                        {
                            _loadingTimerId = setTimeout(showLoading, c_timeBeforeLoading);

                            if (_errorTimerId)
                            {
                                clearTimeout(_errorTimerId);
                                _errorTimerId = null;
                            }
                        }

                        // Fade it in when it loads.
                        _$highResImg.bind(c_load, showHighResImage);
                        wLiveCoreImages.loadImage(_thumbnailSrc, _$highResImg[0]);
                    }
                }
            }
        }

        function renderPhoto()
        {
            /// <summary>
            /// Renders a photo in the item tile control.
            /// </summary>

            var markup = c_photoTemplate.format(_currentItem.name.encodeHtmlAttribute());
            _$positionWrapper.html(markup);
            _$img = jQuery(c_img, _$positionWrapper);
            _$img.bind(c_error, imageError);
            setImageSrc();
        }

        function imageError()
        {
            /// <summary>
            /// Occurs when the image has an on error.
            /// </summary>
            _$img.css(c_visibility, c_hidden);
        }

        function renderAlbum()
        {
            /// <summary>
            /// Renders an album (Folder with cover) in the item tile control.
            /// </summary>

            // Albums use string empty for alt text since their image is similar to a background treatment.
            // This is different from Photos and Videos which actually use their image as content.
            var markup = c_albumTemplate.format('', _currentItem.getChildren().getCount());
            _$positionWrapper.html(markup);

            renderEditableName();

            // Albums have 2 images (and overlays) for pulsing.
            // Hide the second one and use the first one for the _$img element.
            var $itemAlbumOverlays = jQuery(c_period + c_albumOverlayClassName, _$positionWrapper);
            jQuery($itemAlbumOverlays[0]).css(c_opacity, 1);
            jQuery($itemAlbumOverlays[1]).css(c_opacity, 0);

            _$img = jQuery(c_img, jQuery($itemAlbumOverlays[0]));
            _$img.bind(c_error, imageError);
            _$img.bind(c_load, showImage);
            wLiveCoreImages.loadImage(_thumbnailSrc, _$img[0]);
        }

        function renderMissingThumbnail()
        {
            /// <summary>
            /// Renders a Video/Photo with missing thumbnail.
            /// </summary>

            var markup;

            if (_currentItem.photo)
            {
                markup = c_noPhotoThumbnailTemplate;
            }
            else
            {
                var staticImageUrl = FilesConfig.foldersImgBaseUrl + '/videoNoThumbnail.png';
                markup = c_noVideoThumbnailTemplate.format(staticImageUrl.encodeHtmlAttribute(), _currentItem.name.encodeHtmlAttribute());
            }

            _$positionWrapper.html(markup);
        }

        function renderDocument()
        {
            /// <summary>
            /// Renders a document (or generic item) in the item tile control.
            /// </summary>

            _$positionWrapper.html(c_documentTemplate);

            //  For device items render the friendly file type as the subtext.
            if (_currentItem.did)
            {
                jQuery('.itemTdm', _$positionWrapper).append(wLiveCore.SkyDriveItemHelper.getFriendlyFileType(_currentItem).encodeHtml());
            }
            else
            {
                jQuery('.itemTdm', _$positionWrapper).append(wLiveCore.DateFactory.getDate(_currentItem.dateModifiedOnClient, _currentItem.displayModifiedDate));
            }

            renderEditableName();
        }

        function renderFolder()
        {
            /// <summary>
            /// Renders a folder in the item tile control.
            /// This actually renders a empty album and a folder without covers as well.
            /// </summary>

            // Since device items don't have a reliable child count, only render it for non-device items.
            _$positionWrapper.html(c_folderTemplate.format(_currentItem.did ? '' : _currentItem.getChildren().getCount()));

            renderEditableName();
        }

        function renderEditableName()
        {
            /// <summary>
            /// Renders the editable name in the item tile.
            /// </summary>

            var $nameContainer = jQuery('.itemName', _$positionWrapper);
            /* @disable(0092) */
            if (options.de || !wLiveControls.EditableText)
            {
                /* @restore(0092) */
                $nameContainer.text(_currentItem.name);
            }
            else
            {
                if (_editableName)
                {
                    /* @disable(0092) */
                    $nameContainer.replaceWith(_editableName.getContainer());

                    // Re-bind events since replaceWith loses them in the move.
                    _editableName.bindAll();
                    /* @restore(0092) */
                }
                else
                {
                    /* @disable(0092) */
                    _editableName = new wLiveControls.EditableText($nameContainer, viewContext, jQuery.extend({}, wLiveControls.EditableText.RenameOptions, {
                        de: true,
                        ec: 'itemNameEdit',
                        hc: true
                    }));
                    /* @restore(0092) */
                }

                if (!_editableName.isEditing())
                {
                    _editableName.render(_currentItem);
                }
            }
        }

        function checkContainerSize()
        {
            /// <summary>
            /// Determines the size of the container (or options).
            /// This must be done before "Pick thumbnail" is called.
            /// </summary>
            /// <returns type="Boolean">True if the size changed to a photo that we haven't loaded up till now</returns>

            var sizeChangeOccurred = false;
            var newWidth;
            var newHeight;

            // Incase I want 0 to be valid:
            // null > -1 == true
            // undefined > -1 == false
            if (options.w > 0)
            {
                newWidth = options.w;
            }
            else
            {
                newWidth = $container.width();
            }

            if (options.h > 0)
            {
                newHeight = options.h;
            }
            else
            {
                newHeight = $container.height();
            }

            if (newWidth != _constrainedWidth || newHeight != _constrainedHeight)
            {
                _constrainedWidth = newWidth;
                _constrainedHeight = newHeight;
                sizeChangeOccurred = true;
            }

            return sizeChangeOccurred;
        }

        _this.resize = function ()
        {
            /// <summary>
            /// Redraws the item in the new size.
            /// </summary>

            if (checkContainerSize())
            {
                // If the new size is larger than thumbnails we've had previously, check if we should change thumbnail
                if (_largestLoadedWidth < _constrainedWidth || _largestLoadedHeight < _constrainedHeight)
                {
                    _largestLoadedWidth = _constrainedWidth;
                    _largestLoadedHeight = _constrainedHeight;

                    // If the thumbnail that we should use changes, re-render the item
                    if (parseItemForThumbnail() && /* @static_cast(Boolean) */_currentItem.photo)
                    {
                        setImageSrc();
                    }
                }

                positionContents();
            }
        };

        function positionContents()
        {
            /// <summary>
            /// Position the contents of the item tile.
            /// </summary>

            _$positionWrapper.width(_constrainedWidth);
            _$positionWrapper.height(_constrainedHeight);

            if (_$img)
            {
                // Photo, video or folder with thumbnail.
                resizeOverlays(_constrainedWidth, _constrainedHeight);
                resizeImage(_constrainedWidth, _constrainedHeight);
            }
            else if (/* @static_cast(Boolean) */_currentItem.video || _currentItem.isProcessingVideo)
            {
                // Videos without thumbnail still need to have overlays resized.
                resizeOverlays(_constrainedWidth, _constrainedHeight);
            }
            else if ((options.df || !_currentItem.folder) && !_currentItem.photo)
            {
                // Do not resize folders or no thumbnail videos or no thumbnail photos.

                // Resize everything else.
                resizeDocument(_constrainedWidth, _constrainedHeight);
            }
        }

        function resizeDocument(_constrainedWidth, _constrainedHeight)
        {
            /// <summary>
            /// Resize the document (including photos without thumbnails).
            /// </summary>
            /// <param name="_constrainedWidth" type="Number">Constrainted width</param>
            /// <param name="_constrainedHeight" type="Number">Constrainted height</param>

            var $documentTile = _$positionWrapper.find('.itemTd');
            var $documentContainer = _$positionWrapper.find('.itemTdc');
            var $documentIconContainer = _$positionWrapper.find('.itemTdi');
            var $documentTextContainer = _$positionWrapper.find('.itemTdt');
            var thumbnailSize = c_largeIconSize;

            // There are only 4 valid scenarios for documents.
            // First is PC best fit grid with c_mediumImageSize height.
            // Second is PC film strip and Mobile best fit grid with c_smallImageSizepx height.
            // Third is Mobile Details list with c_largeIconSizepx height.
            // Forth is PC info pane with c_mediumIconSizepx height.

            // When the image strips fit exactly we do not want any margin top.
            // When they don't fit exactly we follow redlines for 20px margin top or 5px margin top.

            if (_constrainedHeight == c_smallImageSize || _constrainedHeight == c_mediumIconSize)
            {
                thumbnailSize = c_mediumIconSize;
            }

            // Only use the document background color if the
            // item tile is not the same size as the icon.
            if (_constrainedHeight == thumbnailSize)
            {
                $documentTile.removeClass('itemTdb');
            }
            else
            {
                $documentTile.addClass('itemTdb');
            }

            var shouldHideTextAndRemovePadding = (_constrainedHeight == c_largeIconSize || _constrainedHeight == c_mediumIconSize);

            $documentIconContainer.
                empty().
                height(thumbnailSize).
                width(thumbnailSize).
                css(c_left, shouldHideTextAndRemovePadding ? 0 : c_documentPadding).
                css("margin-top", -thumbnailSize / 2).
                append(jQuery(wLiveCore.SkyDriveItemHelper.getIcon(_currentItem, thumbnailSize)));

            $documentTextContainer.css(c_left, (c_documentPadding * 2) + thumbnailSize).
                css(c_right, c_documentPadding);

            if (shouldHideTextAndRemovePadding)
            {
                $documentTextContainer.hide();
            }
            else
            {
                $documentTextContainer.show();
            }
        }

        function resizeOverlays(_constrainedWidth, _constrainedHeight)
        {
            /// <summary>
            /// Resize the overlays (video, folder with covers).
            /// </summary>
            /// <param name="_constrainedWidth" type="Number">Constrainted width</param>
            /// <param name="_constrainedHeight" type="Number">Constrainted height</param>

            var $overlay = jQuery('.itemTo', _$positionWrapper);

            // Photos do not have overlays but albums and videos do.
            if ($overlay[0])
            {
                var $overlayProtection = jQuery(jQuery('.itemTos', _$positionWrapper)[_secondImageShown ? 1 : 0]);
                $overlayProtection.width(_constrainedWidth);
                $overlayProtection.height(_constrainedHeight);

                $overlay.width(_constrainedWidth);
                $overlay.height(_constrainedHeight);

                if (_constrainedHeight < c_mediumIconSize || (_isFolderWithCovers && options.dt))
                {
                    // Info pane has been set to disable
                    // overlays or the info pane is too small
                    // to show overlays currently.
                    // When I get mobile numbers to counter
                    // c_mediumImageSize and c_mediumIconSize I will move to a shared location
                    // with zearing.
                    $overlay.hide();
                }
                else
                {
                    // To small to show overlays currently.
                    $overlay.show();

                    if (!_isFolderWithCovers)
                    {
                        Debug.assert(/* @static_cast(Boolean) */_currentItem.video || _currentItem.isProcessingVideo, 'It must be a video or being processed video');

                        var $videoOverlay = $overlay.find('.itemTvo');

                        var thumbnailSize = c_largeIconSize;
                        if (_constrainedHeight < c_mediumImageSize)
                        {
                            thumbnailSize = c_mediumIconSize;
                        }

                        var videoOverlayImageStripName = ((!_currentItem.video && _currentItem.isProcessingVideo) ? 'processingVideo_' : 'video_') + thumbnailSize;

                        $videoOverlay.
                            empty().
                            width(thumbnailSize).
                            append(jQuery(wLiveCore.ImageStrip.getImage(videoOverlayImageStripName))).
                            css(c_margin_top, (_constrainedHeight - thumbnailSize) / 2);
                    }
                }
            }
        }

        function resizeImage(_constrainedWidth, _constrainedHeight)
        {
            /// <summary>
            /// Resize the image (photo, video, album).
            /// </summary>
            /// <param name="_constrainedWidth" type="Number">Constrainted width</param>
            /// <param name="_constrainedHeight" type="Number">Constrainted height</param>

            var newWidth;
            var newHeight;

            if (_itemWidth == 0 || _itemHeight == 0)
            {
                // Image should be not be shown.
                newWidth = 0;
                newHeight = 0;
            }
            else if (_isFolderWithCovers || options.as)
            {
                // Best fit grid album likes to pick a fixed sized cell for albums.
                // In this scenario we like to show an image all the way across the cell.

                if (_constrainedWidth == 0 || _constrainedHeight == 0)
                {
                    Debug.assert(false, 'Album can not have 0 as constrainted height/width');
                    // Just hide image.
                    newWidth = 0;
                    newHeight = 0;
                }
                else if (_itemWidth / _itemHeight < _constrainedWidth / _constrainedHeight)
                {
                    // Stretch/Shrink width to show the smallest image that fills the entire container.
                    newWidth = _constrainedWidth;
                    newHeight = _itemHeight / _itemWidth * _constrainedWidth;
                }
                else
                {
                    // Stretch/Shrink the height to show the smallest image that fills the entire container.
                    newHeight = _constrainedHeight;
                    newWidth = _itemWidth / _itemHeight * _constrainedHeight;
                }
            }
            else
            {
                if (options.iw && options.ih)
                {
                    // No constraints.
                    // Use the native height/width.
                    newHeight = _itemHeight;
                    newWidth = _itemWidth;
                }
                else if (options.iw)
                {
                    // Constrain height

                    // There are several scenarios where a fixed height is choosen.
                    // With that height they apply a min width and max width.
                    // Best fit grid also crops width extra (as if there was a max width on
                    // each item.

                    if (_itemHeight < _constrainedHeight)
                    {
                        // Image is shorter than height.
                        // Don't stretch image, just center it.
                        newHeight = _itemHeight;
                        newWidth = _itemWidth;
                    }
                    else
                    {
                        // Shrink height to match constrained height.
                        newHeight = _constrainedHeight;
                        // Use aspect ratio math to get the new width.
                        newWidth = _itemWidth / _itemHeight * _constrainedHeight;
                    }
                }
                else if (options.ih)
                {
                    // Constrain width

                    if (_itemHeight < _constrainedWidth)
                    {
                        // Image is thinner than width.
                        // Don't stretch image, just center it.
                        newHeight = _itemHeight;
                        newWidth = _itemWidth;
                    }
                    else
                    {
                        // Shrink width to match constrained width.
                        newWidth = _constrainedWidth;
                        // Use aspect ratio math to get the new height.
                        newHeight = _itemHeight / _itemWidth * _constrainedWidth;
                    }
                }
                else
                {
                    // Constrain width and height.

                    // The goal is to show the largest image that fits within the container.
                    if (_constrainedWidth == 0 || _constrainedHeight == 0)
                    {
                        // Just hide image.
                        newWidth = 0;
                        newHeight = 0;
                    }
                    else
                    {
                        if (_itemWidth < _constrainedWidth && _itemHeight < _constrainedHeight)
                        {
                            // Image is already smaller than the container.
                            newHeight = _itemHeight;
                            newWidth = _itemWidth;
                        }
                        else if (_itemWidth / _itemHeight > _constrainedWidth / _constrainedHeight)
                        {
                            // Shrink the width so that we end up with the largest image that fits within the container.
                            newWidth = _constrainedWidth;
                            // Use aspect ratio math to get the new height.
                            newHeight = _itemHeight / _itemWidth * _constrainedWidth;
                        }
                        else
                        {
                            // Shrink the height so that we end up with the largest image that fits within the container.
                            newHeight = _constrainedHeight;
                            // Use aspect ratio math to get the new width.
                            newWidth = _itemWidth / _itemHeight * _constrainedHeight;
                        }
                    }
                }
            }

            newWidth = Math.ceil(newWidth);
            newHeight = Math.ceil(newHeight);


            // Width/height and positioning are done to the image's parent
            // instead of the image tag itself so that the positioning
            // is correct for the loading UI.
            var _$imgParent = _$img.parent();

            // Set width/height
            _$imgParent.width(newWidth).height(newHeight);
            if ($B.IE && $B.V < 9)
            {
                // IE 8 has a problem with width:100% and height:100%
                // It does not respect the property (until UI reflow) and needs to be set explicitly.
                _$img.width(newWidth).height(newHeight);
            }

            // Center the image.
            _$imgParent.css(margin_left, Math.floor((_constrainedWidth - newWidth) / 2));
            if (_isFolderWithCovers)
            {
                // For album we don't center the same way.
                // Instead we go an extra 1/2 up the photo.
                _$imgParent.css(c_margin_top, Math.floor((_constrainedHeight - newHeight) / 4));
            }
            else
            {
                _$imgParent.css(c_margin_top, Math.floor((_constrainedHeight - newHeight) / 2));
            }
        }

        _this.dispose = function ()
        {
            /// <summary>
            /// Disposes the Item Tile.
            /// </summary>

            disposeInternal();

            _$positionWrapper.unbind();

            _editableName && _editableName.dispose();
        };

        function disposeInternal()
        {
            /// <summary>
            /// Logic necessary to reset internal state.
            /// </summary>

            // Stop pulse animation (on both items).
            jQuery(c_period + c_albumOverlayClassName, $container).stop(true, true);

            if (_$pulseImg)
            {
                _$pulseImg.unbind();
                _$pulseImg = null;
            }

            if (_$highResImg)
            {
                _$highResImg.stop(true);
                _$highResImg.unbind(c_load, showHighResImage);
                _$highResImg = null;
            }

            if (_$img)
            {
                _$img.unbind();
                _$img = null;
            }

            // Clear the timeouts.
            clearTimeout(_loadingTimerId);
            _loadingTimerId = null;
            clearTimeout(_errorTimerId);
            _errorTimerId = null;
        }

        function parseItemForThumbnail()
        {
            /// <summary>
            /// Parses item for thumbnails
            /// </summary>
            /// <return>True if thumbnail changed, false otherwise</return>

            var oldThumbnailSrc = _thumbnailSrc;

            _thumbnailSrc = _smallThumbnailSrc = null;
            _isFolderWithCovers = false;
            var /* @type(wLive.Core.ISkyDriveThumbnailSet) */thumbnailSet;
            var /* @type(wLive.Core.ISkyDriveThumbnail) */thumbnail;
            var /* @type(wLive.Core.ISkyDriveThumbnail) */itemWithDimensions;

            var containerWidth = _constrainedWidth;
            var containerHeight = _constrainedHeight;

            if (_currentItem)
            {
                if (/* @static_cast(Boolean) */_currentItem.thumbnailSet && (!_currentItem.audio || options.ap))
                {
                    thumbnailSet = _currentItem.thumbnailSet;

                    thumbnail = wLiveCore.SkyDriveItemHelper.pickThumbnail(thumbnailSet, containerWidth, containerHeight);

                    itemWithDimensions = _currentItem.photo || _currentItem.video || thumbnail;

                    // Only if the container is bigger than BFG row hight should we
                    // also get the small size.
                    if (containerHeight > c_smallThumbnailHeight)
                    {
                        // For photos and videos also get the small Thumbnail src.
                        var smallThumbnail = wLiveCore.SkyDriveItemHelper.pickThumbnail(thumbnailSet, c_smallThumbnailHeight, c_smallThumbnailHeight);
                        if (smallThumbnail.width != thumbnail.width || smallThumbnail.height != thumbnail.height)
                        {
                            _smallThumbnailSrc = thumbnailSet.baseUrl + smallThumbnail.url;
                        }
                    }
                }
                else if (wLiveCore.SkyDriveItem.IsFolderWithCovers(_currentItem))
                {
                    var covers = _currentItem.folder.covers;
                    var index = 0;
                    var length = covers.length;

                    if (length > 0)
                    {
                        // Always start with the first one.
                        _currentAlbumThumbnailIndex = 0;
                        thumbnailSet = covers[_currentAlbumThumbnailIndex];
                        thumbnail = wLiveCore.SkyDriveItemHelper.pickThumbnail(thumbnailSet, containerWidth, containerHeight);

                        Debug.assert(thumbnail, 'Cover should contain a thumbnail');
                        itemWithDimensions = thumbnail;
                        // This is now an album.
                        _isFolderWithCovers = true;
                    }
                }

                if (thumbnail)
                {
                    _itemWidth = itemWithDimensions.width;
                    _itemHeight = itemWithDimensions.height;

                    _thumbnailSrc = thumbnailSet.baseUrl + thumbnail.url;
                    if (!_smallThumbnailSrc)
                    {
                        _smallThumbnailSrc = _thumbnailSrc;
                    }
                }
            }

            return oldThumbnailSrc != _thumbnailSrc;
        }

        _this.canPulse = function ()
        {
            /// <summary>
            /// Checks if an item can be pulsed.
            /// </summary>
            /// <returns type="Boolean">True if item can be pulsed.</returns>

            return (_isFolderWithCovers && _currentItem.folder.covers.length > 1);
        };

        _this.pulse = function (pulseId)
        {
            /// <summary>
            /// Attempt to pulse the album.
            /// </summary>
            /// <param name="pulseId" type="Number">Unique id for the pulse</param>
            /// <returns type="Boolean">True if pulse was attempted. False if not</returns>

            var pulseAttempted = false;
            if (_isFolderWithCovers && wLiveCoreImages.isIdle())
            {
                var coverLength = _currentItem.folder.covers.length;

                // Only pulse if there are 2+ covers
                if (coverLength > 1)
                {
                    _currentAlbumThumbnailIndex = (_currentAlbumThumbnailIndex + 1) % coverLength;

                    var containerWidth = _constrainedWidth;
                    var containerHeight = _constrainedHeight;

                    var thumbnailSet = _currentItem.folder.covers[_currentAlbumThumbnailIndex];
                    var thumbnail = wLiveCore.SkyDriveItemHelper.pickThumbnail(thumbnailSet, containerWidth, containerHeight);

                    Debug.assert(thumbnail, 'Cover should contain a thumbnail');
                    pulseAttempted = true;

                    var thumbnailUrl = thumbnailSet.baseUrl + thumbnail.url;

                    if (!_$pulseImg)
                    {
                        // We need to know the load/error/abort events so we are using our own
                        // image instead of the image loader.
                        // We also are doing this when the image loader is not loading anything.
                        _$pulseImg = jQuery('<img/>').
                            bind(c_load + ' ' + c_error + ' ' + c_abort, animatePulse);
                    }

                    // Remember width/height for onload event.
                    _$pulseImg.data(c_heightKey, thumbnail.height).data(c_widthKey, thumbnail.width).data(c_pulseIdKey, pulseId);

                    _$pulseImg.attr(c_src, thumbnailUrl);
                }
            }

            return pulseAttempted;
        };

        /* @bind(HTMLElement) */function animatePulse(ev)
        {
            /// <summary>
            /// Animate pulse.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Image load, error, or abort event</param>

            // jQuery is not returning the img element in the ev.target in IE8
            // So we rely on "this" aka "ev.currentTarget" to get the image element.
            var srcElement = this;
            var $srcElement = jQuery(srcElement);

            $container.trigger(ItemTile.pulseEventName, $srcElement.data(c_pulseIdKey));

            /* @disable(0092) */
            if (ev.type == c_load)
            {
                /* @restore(0092) */

                // Fade out old one.
                var $itemToFadeOut = jQuery(jQuery(c_period + c_albumOverlayClassName, $container)[_secondImageShown ? 1 : 0]);
                $itemToFadeOut.animate({ opacity: c_pulseFadeOutOpacity }, c_pulseFadeOutSpeed, c_linear);

                // Switch local variables

                _secondImageShown = !_secondImageShown;

                // Switch to new Image
                var $itemToFadeIn = jQuery(jQuery(c_period + c_albumOverlayClassName, $container)[_secondImageShown ? 1 : 0]);
                // Update local state variables.
                _$img = jQuery(c_img, $itemToFadeIn);
                _itemWidth = $srcElement.data(c_widthKey);
                _itemHeight = $srcElement.data(c_heightKey);
                _thumbnailSrc = $srcElement.attr(c_src);
                _smallThumbnailSrc = _thumbnailSrc;

                // Switch to the next image.
                _$img.attr(c_src, _thumbnailSrc);

                // Mark it as loaded if it wasnt already.
                _$positionWrapper.addClass(c_loadedItemTileClassName);

                // force resize since thumbnails can be different sizes.
                positionContents();

                // Fade in new one.
                $itemToFadeIn.animate({ opacity: 1 }, c_pulseFadeInSpeed, c_linear);
            }
        };

        /* @bind(HTMLElement) */function showImage(ev)
        {
            /// <summary>
            /// Image load event.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Image load event</param>

            // jQuery is not returning the img element in the ev.target in IE8
            // So we rely on "this" aka "ev.currentTarget" to get the image element.
            var srcElement = this;
            _$positionWrapper.addClass(c_loadedItemTileClassName);

            if (_smallThumbnailSrc == _thumbnailSrc)
            {
                setLoaded();
            }
        }

        _this.showContextMenu = showContextMenu;

        function showContextMenu(ev)
        {
            /// <summary>
            /// Shows the context menu on the item.
            /// </summary>
            /// <param name="ev" type="wLive.JQueryEvent">Event for the context menu.</param>

            var /* @type(*) */menuOptions =
            {
                pos: { x: ev.pageX, y: ev.pageY },
                ev: ev,
                bici: "CM"
            };

            /* @disable(0092) */
            viewContext.contextMenu.render(_currentItem, /* selection */null, menuOptions);
            /* @restore(0092) */
        }

        function setLoaded()
        {
            /// <summary>
            /// Set loaded variable and fire event.
            /// </summary>

            _isLoaded = true;
            if ($BSI.isLoading())
            {
                jQuery(viewContext).trigger('perfLoad');
            }

            hideLoading();

            // When an image loads the setLoaded() method is called
            // What's happening here is that when it takes a very long
            // time to load the hi res image, more than 10 seconds, we
            // pop a notification (with code "imageload") to let them
            // know it's on the way down. This code here gets the list
            // of errors in the errorManager list and sees if there is
            // one of these errors in there. If so it removes it from the list
            /* @disable(0092) */
            var /* @type(Array) */errors = viewContext.errorManager.getErrors();
            /* @restore(0092) */
            var errorCount = /* @static_cast(Number) */errors && errors.length;
            if (errorCount > 0)
            {
                for (var i = 0; i < errorCount; i++)
                {
                    if (errors[i].code === "imageLoad")
                    {
                        /* @disable(0092) */
                        viewContext.errorManager.removeAt(i);
                        /* @restore(0092) */
                        break;
                    }
                }
            };


            clearTimeout(_loadingTimerId);
            _loadingTimerId = null;
            clearTimeout(_errorTimerId);
            _errorTimerId = null;
        }

        /* @bind(HTMLElement) */function showHighResImage(ev)
        {
            /// <summary>
            /// Image load event.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Image load event</param>

            // jQuery is not returning the img element in the ev.target in IE8
            // So we rely on "this" aka "ev.currentTarget" to get the image element.
            var srcElement = this;

            _$positionWrapper.addClass(c_loadedItemTileClassName);

            _$highResImg.animate({ opacity: 1 }, c_pulseFadeInSpeed);
            setLoaded();
        }

        function showLoading()
        {
            /// <summary>
            /// Shows the loading dots.
            /// </summary>

            clearTimeout(_loadingTimerId);
            _loadingTimerId = null;

            /* @disable(0058) */
            /* @disable(0092) */
            if ("undefined" != typeof $header)
            {
                $header.showLoading();
            }
            /* @restore(0092) */
            /* @restore(0058) */

            _errorTimerId = setTimeout(triggerError, c_timeBeforeError);
        }

        function hideLoading()
        {
            /// <summary>
            /// Hides the loading dots.
            /// </summary>

            /* @disable(0058) */
            /* @disable(0092) */
            if ("undefined" != typeof $header)
            {
                $header.hideLoading();
            }
            /* @restore(0092) */
            /* @restore(0058) */
        }

        function triggerError()
        {
            /// <summary>
            /// Shows the error message.
            /// </summary>

            clearTimeout(_errorTimerId);
            _errorTimerId = null;

            if (/* @static_cast(Boolean) */viewContext && wLiveCore.StringHelpers.caseInsensitiveStringEquals(viewContext.viewParams.id, _currentItem.id) && _currentItem.photo)
            {
                /* @disable(0092) */
                viewContext.errorManager.add({
                    $element: jQuery('<span>' + getString('image.loaderror').encodeHtml() + '</span>'),
                    priority: 2,
                    type: 4, // top bar timer dismissed
                    code: "imageLoad"
                });
                /* @restore(0092) */
            }
        }

        ///
    }

    ItemTile.pulseEventName = 'pulse';

    ///
})();

/// Copyright (C) Microsoft Corporation. All rights reserved.
wLive.Core.SoftBlockEnum =
{
    MoveAction: 0,
    RenameAction: 1,
    DeleteAction: 2
};

/// <reference path=".../files.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var wLiveControls = wLive.Controls;
    var getPCString = wLiveCore.AleHelpers.getPCString;
    var itemHelper = wLiveCore.SkyDriveItemHelper;

    var c_documentLockedErrorCode = 9001;
    var c_selectorPrefix = "et_";
    var c_mainClass = c_selectorPrefix + "main";
    var c_textClass = c_selectorPrefix + "text";
    var c_primarytextClass = c_selectorPrefix + "primary";
    var c_snippettextClass = c_selectorPrefix + "snippet";
    var c_textContainerClass = c_selectorPrefix + "textContainer";
    var c_emptyClass = c_selectorPrefix + "empty";
    var c_inactiveClass = c_selectorPrefix + "inactive";
    var c_editableClass = c_selectorPrefix + "editable";
    var c_editClass = c_selectorPrefix + "edit";
    var c_editingClass = c_selectorPrefix + "editing";
    var c_outlineClass = c_selectorPrefix + "outline";
    var c_errorClass = c_selectorPrefix + "error";
    var c_growableClass = c_selectorPrefix + "growable";
    var c_centeredClass = c_selectorPrefix + "centered";
    var c_hiddenInputClass = c_selectorPrefix + "hinput";
    var c_inputClass = c_selectorPrefix + "input";
    var c_textareaClass = c_selectorPrefix + "textarea";
    var c_processingClass = c_selectorPrefix + "processing";

    var c_period = '.';
    var c_hash = '#';

    var c_click = 'click';
    var c_resize = 'resize';
    var c_scroll = 'scroll';
    var c_mousewheel = 'mousewheel';
    var c_blur = 'blur';
    var c_mouseup = 'mouseup';
    var c_keydown = 'keydown';

    var key_escape = 27;
    var key_enter = 13;

    var $window = jQuery(window);
    var $document = jQuery(document);

    var softBlockEnum = wLiveCore.SoftBlockEnum;

    var g_uniqueIdFragment = 0;
    var getUniqueId = function ()
    {
        /// <summary>
        /// Gets a unique ID in the editable text closure.
        /// </summary>

        return c_selectorPrefix + g_uniqueIdFragment++;
    };

    var /* @type(String) */c_invalidNameCharacters = jQuery(['<div>', ':', '*', '?', '\\', '/', ';', '"', '<', '>', '|', '&#xff0f;', '&#xff1b;', '&#xff0a;', '</div>'].join('')).text();

    wLiveControls.EditableText = EditableText;

    // Base options when using the editable text control in Rename scenarios.
    EditableText.RenameOptions =
    {
        n: 'name',
        gdt: function (viewContext, item)
        {
            /// <summary>
            /// Gets the display text for the item property;
            /// </summary>
            /// <param name="viewContext" type="wLive.Core.ViewContext">View Context Object.</param>
            /// <param name="item" type="wLive.Core.SkyDriveItem">The item.</param>

            return item.getDisplayName(viewContext);
        },
        g: false,
        // Invalid characters.
        gem: function (item, input)
        {
            /// <summary>
            /// Gets the error message (if any) for an input.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item that the input is being used against.</param>
            /// <param name="input" type="String">The input to validate.</param>

            var error;

            if (!input)
            {
                error = getPCString('NameRequiredError');
            }
            else if (input.startsWith('.') || (!item.extension && input.endsWith('.')))
            {
                error = getPCString('CantStartOrEndWithDotError');
            }
            else
            {
                // Check for any invalid characters.
                var invalidChar;

                for (var i = 0; i < input.length; i++)
                {
                    var c = input.charAt(i);

                    if (c_invalidNameCharacters.indexOf(c) !== -1)
                    {
                        invalidChar = c;
                        break;
                    }
                }

                if (invalidChar)
                {
                    error = getPCString('InvalidTextFormatError').format(invalidChar);
                }
            }

            return error;
        },
        get: function (item)
        {
            /// <summary>
            /// Gets the error title (if any) for an item.
            /// </summary>
            /// <param name="item" type="wLive.Core.SkyDriveItem">The item.</param>

            return item._isNewFolder ? getPCString("NewFolderErrorTitle") : getPCString('RenameErrorTitleFormat').format(item.name);
        },
        aa: 'Rename',
        ea: 'Rename'
    };

    // Base options when using the editable text control in caption update scenarios.
    EditableText.CaptionOptions =
    {
        n: 'caption',
        aa: 'ModifyCaption',
        get: function (item)
        {
            /// <summary>
            /// Gets the error title (if any) for an item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item.</param>

            return item.photo ? getPCString('CaptionErrorTitle') : getPCString('DescriptionErrorTitle');
        },
        ml: 255,
        v: function (item)
        {
            /// <summary>
            /// Implments EditableTextOptions.v.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item.</param>

            return item.photo ? getPCString('AddCaption') : getPCString('AddDescription');
        }
    };

    /* @bind(wLive.Controls.EditableText) */function EditableText($container, viewContext, options)
    {
        /// <summary>
        /// Initializes a new instance of the EditableText class.
        /// </summary>
        /// <param name="$container" type="jQuery">jQuery Object which contains the containing element to render the Info Pane Header Control within.</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">View Context Object.</param>
        /// <param name="options" type="wLive.Controls.EditableTextOptions">Editable text options.</param>

        var _this = this;

        var /* @dynamic */_errMgr = viewContext.errorManager;

        var _dataModel = viewContext.dataModel;
        var $rootElement = viewContext.$rootElement;
        var $viewContext = jQuery(viewContext);

        var /* @type(wLive.Core.SkyDriveItem) */_currentItem;
        var /* @type(String) */_currentItemPropertyDisplayText;
        var /* @type(Boolean) */_currentItemHasError;
        var /* @type(Boolean) */_skipErrorPopover;
        var /* @type(wLive.Controls.SoftBlock) */_softBlockPopover;
        var _propertyName = options.n;
        var _getDisplayText = options.gdt;
        var _clickAction = options.ca;
        var _customActionClass = options.ac;
        var _customInputClass = options.ic;
        var _customEditClass = options.ec;
        var _authAction = options.aa;
        var _editAction = options.ea;
        var _growable = options.g;
        var _centered = options.c;
        var _maxLength = options.ml;
        var _disableEdit = options.de;
        var _getErrorMessage = options.gem;
        var _getErrorTitle = options.get;
        var _showSnippet = options.snp;
        var /* @type(Object -> void) */_successCallback = options.sc;
        var _isDisposed = false;
        var _uniqueId = getUniqueId();
        var _uniqueNamespace = c_period + _uniqueId;
        var _cachedOffset = { top: 0, left: 0 };

        // True if the current text is editable.
        var /* @type(Boolean) */_editable;

        // True if the text is currently in edit mode.
        var _editing = false;

        // True if the control is currently saving the edited text.
        var _saving = false;

        var textareaAdditionalClasses = ' ' + c_textareaClass + (_customInputClass ? ' ' + _customInputClass : '');
        var textareaAdditionalAttributes = _maxLength ? ' maxlength="' + _maxLength + '"' : '';
        var c_hiddenInputHtml = '<textarea class="' + c_hiddenInputClass + textareaAdditionalClasses + '" disabled="disabled" + textareaAdditionalAttributes></textarea>';

        $container.html('<span class="' + c_textContainerClass + '"></span>');
        $container.addClass(c_mainClass).addClass(_growable ? c_growableClass : '');

        var _$textContainer = jQuery(c_period + c_textContainerClass, $container);

        var /* @type(jQuery) */_$textlink;
        var /* @type(jQuery) */_$text;
        var /* @type(jQuery) */_$snippet;
        var /* @type(jQuery) */_$hiddenInput;
        var /* @type(jQuery) */_$input;

        var _$edit = jQuery(
            '<div id="' + _uniqueId + '" class="' + c_editClass + (_disableEdit ? ' ' + c_outlineClass : '') + (_customEditClass ? ' ' + _customEditClass : '') + '">' +
                '<textarea class="' + c_inputClass + textareaAdditionalClasses + '"' + textareaAdditionalAttributes + '></textarea>' +
            '</div>'
        );

        var /* @type(jQuery) */_$loadingSpinner;

        sutra($container, '$Sutra.SkyDrive.EditableText');

        _dataModel.addListener(wLiveCore.DataModel.dataChangedEvent, handleDataChanged, /* context: */undefined, 'SkyDriveWeb_Internal_Control_EditableText_DataChanged');

        function handleDataChanged(item)
        {
            /// <summary>
            /// Respond to a data changed event.
            /// </summary>
            /// <param name="item" type="wLive.Core.SkyDriveItem">Changed item.</param>

            if (/* @static_cast(Boolean) */_currentItem && _currentItem.key === item.key)
            {
                _this.render(item);
            }
        }

        function onEditAction(event, editEventArgs)
        {
            /// <summary>
            /// Respond to an edit action event.
            /// </summary>
            /// <param name="editEventArgs">Edit event args.</param>

            if (/* @static_cast(Boolean) */_currentItem && editEventArgs && (_currentItem.key === editEventArgs["key"]))
            {
                tryEnterEditMode();
            }
        };

        if (_editAction)
        {
            $viewContext.bind(_editAction, onEditAction);
        }

        if (_centered)
        {
            addEditableTextStateClass(c_centeredClass);
        }

        function saveIfEditing()
        {
            /// <summary>
            /// Save the current text (if in edit mode).
            /// </summary>

            if (_editing)
            {
                // If the person errors again then they are probably trying to click somewhere else without resolving the error.
                // Just cancel their edit operation.
                _skipErrorPopover = _currentItemHasError;

                // Execute the "save" action.
                onSaveClick();
            }
        }

        function onDocumentMouseUp(event)
        {
            /// <summary>
            /// Handle the "mouseup" event on the document.
            /// </summary>
            /// <param name="event" type="HTMLEvent">The event.</param>.

            var target = event.target;
            var className = target.className;
            var selector = className && c_period + className.split(' ')[0];

            // Ignore clicks from the edit area or the popover.
            var popoverElement = jQuery(wLiveCore.PopoverHelpers.popoverSelector)[0];
            if (!(/* @static_cast(Boolean) */className && /* @static_cast(Boolean) */(jQuery(selector, $container.add(_$edit)).length)) && !(popoverElement && jQuery.contains(popoverElement, target)))
            {
                saveIfEditing();
            }
        }

        function showEditUI()
        {
            /// <summary>
            /// Puts the UI in an editing state.
            /// </summary>

            var height;

            if (_centered)
            {
                height = _$textlink.height();
            }
            else
            {
                height = _$textContainer.height();
            }

            setEditing(true);

            setInputDimension('height', height);

            // Give the browser time to update the DOM before resizing.
            setTimeout(function ()
            {
                _this.resize(function ()
                {
                    ///

                        // if we don't have the popup showing the error dialog
                        // then it's OK to steal the focus for the edit control
                        _$input.focus().select();

                        ///
                });
            }, 0);
        }

        function getPropertyDisplayText(item)
        {
            /// <summary>
            /// Gets the display text of the property.
            /// </summary>
            /// <returns type="String"></returns>

            var propertyDisplayText = /* @static_cast(String) */_getDisplayText && /* @static_cast(String) */_getDisplayText(viewContext, item);
            return /* @static_cast(String) */(propertyDisplayText || getPropertyValue(item));
        }

        function getPropertyValue(item)
        {
            /// <summary>
            /// Gets the value of the property.
            /// </summary>
            /// <returns type="String"></returns>

            return /* @static_cast(String) */item[_propertyName];
        }

        function setCurrentSnippet(item)
        {
            /// <summary>
            /// Sets the current snippet.
            /// </summary>
            /// <param name="item" type="wLive.Core.SkyDriveItem">The current item.</param>

            var snippet = /* @static_cast(String) */(/* @static_cast(String) */item.snippet || '');
            if (snippet)
            {
                _$snippet.html("..." + itemHelper.highlightAndEncodeField(item, "snippet") + "...");
            }
        }

        function setCurrentText(text, encoded)
        {
            /// <summary>
            /// Sets the current text.
            /// </summary>
            /// <param name="text" type="String">The new text</param>
            /// <param name="encoded" type="Boolean" optional="true">Whether the text is already encoded</param>

            // Create the DOM for the text if it doesn't yet exist or if is not the correct tag name (only actionable text should be in an anchor tag);
            var isActionable = /* @static_cast(Boolean) */_clickAction || (_editable && !_disableEdit);
            if (!_$textlink || (isActionable !== (_$textlink[0].nodeName === "A")))
            {
                _$textlink && _$textlink.remove();

                var tagName = isActionable ? 'a' : 'span';
                _$textlink = jQuery('<' + tagName + ' class="' + c_textClass + (_customActionClass ? ' ' + _customActionClass : '') + '">' +
                    '<span class="' + c_primarytextClass + '"></span>' +
                    (_showSnippet ? '<span class="' + c_snippettextClass + '"></span>' : '') +
                    '</' + tagName + '>');

                rebind(_$textlink, c_click, onTextlinkClick);

                _$text = jQuery('.' + c_primarytextClass, _$textlink);
                sutra(_$text, '$Sutra.SkyDrive.EditableTextCurrentText');

                _$snippet = jQuery('.' + c_snippettextClass, _$textlink);

                _$textContainer.append(_$textlink);
            }

            text = text && text.trim();

            if (text)
            {
                _$textlink.removeClass(c_emptyClass);
            }
            else if (_editable)
            {
                _$textlink.addClass(c_emptyClass);

                if (options.v)
                {
                    text = options.v(_currentItem);
                }
            }

            text = text || '';

            if (encoded)
            {
                _$text.html(text);
            }
            else
            {
                _$text.text(text);
            }

            var action;
            if (_clickAction)
            {
                action = viewContext.actionManager.getAction(_clickAction, _currentItem);
            }

            if (action)
            {
                wLiveCore.ActionManager.setATagAction(action, _$textlink);
                _$textlink.removeClass(c_inactiveClass);
            }
            else
            {
                if (_$textlink[0].nodeName === "A")
                {
                    _$textlink.attr('href', c_hash).bind(c_click, function (event)
                    {
                        /// <summary>
                        /// Click handler to stop the navigation to #
                        /// </summary>
                        /// <param name="event" type="HTMLEvent">The event.</param>.

                        event.preventDefault();
                    });
                }

                _$textlink.addClass(c_inactiveClass);
            }
        }

        function clearCurrentError()
        {
            /// <summary>
            /// Clears any error from the current item.
            /// </summary>

            _errMgr.clear();
            _currentItemHasError = false;
            _$input && _$input.removeClass(c_errorClass);
        }

        function tryEnterEditMode()
        {
            /// <summary>
            /// Click handler to show the edit UI (if available).
            /// </summary>

            if (_editable && !_editing)
            {
                showEditUI();
                _$input.val(getPropertyValue(_currentItem));
            }
        }

        function setError(message)
        {
            /// <summary>
            /// Sets an error updating the text.
            /// </summary>
            /// <param name="message" type="String">The error message.</param>

            clearCurrentError();
            if (_skipErrorPopover)
            {
                // Don't skip the popover again for this item.
                _skipErrorPopover = false;
            }
            else
            {
                var itemName = _getErrorTitle ? _getErrorTitle(_currentItem) : getPCString("UpdateItemErrorTitle");

                var $error = jQuery('<span>' + itemName + ' ' + message + '</span>');

                _errMgr.add(
                {
                    $element: $error,
                    priority: 0,
                    type: 0
                });

                _currentItemHasError = true;
                showEditUI();

                _$input && _$input.addClass(c_errorClass);

            }
        }

        function onTextlinkClick()
        {
            /// <summary>
            /// Click handler for the text field.
            /// </summary>
            /// <param name="ev)" type="HTMLEvent">The event.</param>.

            if (!_disableEdit)
            {
                tryEnterEditMode();
                return false;
            }

            return /* @static_cast(Boolean) */undefined;
        }

        function onInputKeydown(event)
        {
            /// <summary>
            /// Click handler to for keystrokes in the input field.
            /// </summary>
            /// <param name="event" type="HTMLEvent">The event.</param>.

            if (_editing)
            {
                // user is typing and could be trying to fix the previous error
                clearCurrentError();
                _skipErrorPopover = false;

                var methodToCall;

                var which = event.which;
                if (which === key_escape)
                {
                    methodToCall = onCancelClick;
                }
                else if (which === key_enter)
                {
                    methodToCall = onSaveClick;
                }

                if (methodToCall)
                {
                    methodToCall();

                    /* stop enter from adding a new line */
                    event.preventDefault();
                }
                else if (_growable)
                {
                    // Try out the new text in the hidden input box to see if the height of the input area needs updating.
                    _$hiddenInput.text(_$input.val() + String.fromCharCode(which));
                }

                // IE8 returns the old scroll height on first access.
                var throwaway = _$hiddenInput[0].scrollHeight;

                var scrollHeight = _$hiddenInput[0].scrollHeight;
                if (_$input.innerHeight() < scrollHeight)
                {
                    setInputDimension('height', scrollHeight);
                }

                // Input element handles its own events.
                event.stopPropagation();
            }
        }

        function removeLoadingState(wasNewItem)
        {
            /// <summary>
            /// This removes the loading state.
            /// </summary>
            /// <param name="wasNewItem" type="Boolean">This is true if it was a new folder rename</param>

            if (wasNewItem)
            {
                _$loadingSpinner && _$loadingSpinner.hide();
                removeEditableTextStateClass(c_processingClass);
            }
        }

        function onSaveClick()
        {
            /// <summary>
            /// Click handler to save the edited text.
            /// </summary>

            var /* @type(String) */input = _$input.val();
            input = input.trim();

            var wasNewItem = _currentItem._isNewFolder;

            if (wasNewItem)
            {
                if (!_$loadingSpinner)
                {
                    _$loadingSpinner = $f && jQuery($f.createLoading({
                        returnMarkup: true,
                        useTransparentFallback: true
                    }));

                    _$textContainer.prepend(_$loadingSpinner);
                }
                else
                {
                    _$loadingSpinner.show();
                }

                addEditableTextStateClass(c_processingClass);
            }

            var error = _getErrorMessage && _getErrorMessage(_currentItem, input);
            if (error)
            {
                removeLoadingState(wasNewItem);
                setError(error);
            }
            else
            {
                // Only save if the text has changed, or its a new folder.
                var original = getPropertyValue(_currentItem);
                if (input !== (/* currentText: */_$textlink.hasClass(c_emptyClass) ? '' : original) || _currentItem._isNewFolder)
                {
                    setCurrentText(input);
                    setSaving(true);
                    resetView(false);

                    _currentItem.updateItemProperty(_propertyName, input, onSuccess, onFailure);
                }
                else
                {
                    onCancelClick();
                }
            }

            function onSuccess()
            {
                /// <summary>
                /// Callback to process the UpdateItem success response.
                /// </summary>

                if (wasNewItem)
                {
                    viewContext.pendingFolderToCreate = false;
                    _currentItem.invalidate();
                    removeLoadingState(wasNewItem);

                    // Select the newly created item as long as nothing else was selected.
                    if (viewContext.selectionManager.getSelection().selectionCount === 0)
                    {
                        var parent = _currentItem.getParent();
                        if (parent)
                        {
                            var myIndex = parent.getChildren().indexOf(_currentItem, true);
                            if (myIndex > -1)
                            {
                                /* @disable(0092) */
                                viewContext.selectionManager.clickSelect(parent, myIndex);
                                /* @restore(0092) */
                            }
                        }
                    }
                }

                if (_successCallback)
                {
                    _successCallback(_currentItem);
                }

                if (_propertyName == "caption")
                {
                    viewContext.tokenHasBeenRedeemed = true;
                }

                setSaving(false);

                // Clear out the flag to skip the error popover.
                _skipErrorPopover = false;
            }

            function onFailure(response, failureItem)
            {
                /// <summary>
                /// Callback to process the UpdateItem failure response.
                /// </summary>
                /// <param name="response" type="wLive.Core.IJSONServiceResponse">Response object.</param>
                /// <param name="failureItem" type="wLive.Core.ISkyDriveItem">Failure callback.</param>

                if (wLiveCore.StringHelpers.caseInsensitiveStringEquals(_currentItem.id, failureItem.id))
                {
                    if (/* @static_cast(Boolean) */response && /* @static_cast(Boolean) */response.error && response.error.code === c_documentLockedErrorCode)
                    {
                        $Do.when("Bucket3.js", 0, function ()
                        {
                            // make sure conditions still hold
                            if (wLiveCore.StringHelpers.caseInsensitiveStringEquals(_currentItem.id, failureItem.id))
                            {
                                // see if the cid of the person with lock
                                // was passed back in the error.data member
                                // The lockOwnerCid can be null
                                /* @disable(0092) */
                                var responseData = response.error.data;
                                /* @restore(0092) */
                                var /* @type(wLive.Controls.LockedFileExceptionInfo) */lockOwnerInfo = /* @static_cast(wLive.Controls.LockedFileExceptionInfo) */responseData && /* @static_cast(wLive.Controls.LockedFileExceptionInfo) */jQuery.parseJSON(responseData);

                                // invoke the soft block popover
                                /* @disable(0092) */
                                _softBlockPopover = new wLiveControls.SoftBlock(softBlockEnum.RenameAction, viewContext.callerCid, _currentItem, lockOwnerInfo, wLiveControls.Notifications);
                                _softBlockPopover.show(function ()
                                {
                                    /* @restore(0092) */
                                    /// <summary>
                                    /// Callback to process the user clicking the action to force rename button.
                                    /// </summary>

                                    setSaving(true);
                                    _dataModel.updateItemProperty(
                                        _currentItem,
                                        _propertyName,
                                        input,
                                    /* onSuccess: */function ()
                                    {
                                        setSaving(false);
                                    },
                                        onFailure,
                                    /* overrideLock */true
                                    );
                                },
                                function ()
                                {
                                    /// <summary>
                                    /// Callback to process the user clicking the cancel button.
                                    /// </summary>
                                    setCurrentText(original);
                                    resetView(true);
                                });
                            }
                        });
                    }
                    else
                    {
                        // Stay in edit mode to allow fixup of the error.
                        _$input.val(input);
                        setCurrentText(original);
                        removeLoadingState(wasNewItem);

                        setError(response.error.message || getPCString('UpdateItemError'));
                    }
                }

                setSaving(false);
            }

            return false;
        }

        function onCancelClick()
        {
            /// <summary>
            /// Click handler to hide the edit UI.
            /// </summary>

            resetView(true);

            return false;
        }

        function rebindEditUI()
        {
            /// <summary>
            /// Bind events in the edit area.
            /// </summary>

            // Save whenever the input is blurred.
            rebind(_$input, c_blur, saveIfEditing);

            rebind(_$input, c_keydown, onInputKeydown);
        }

        function unbindEditUI()
        {
            /// <summary>
            /// Unbind events in the edit area.
            /// </summary>

            _$input && _$input.unbind();
            $document.unbind(c_mouseup, saveIfEditing);
        }

        _this.bindAll = function ()
        {
            /// <summary>
            /// Bind events to the contained HTML elements.
            /// </summary> 

            rebind(_$textlink, c_click, onTextlinkClick);

            if (_editing)
            {
                rebindEditUI();
            }
        };

        _this.isEditing = function ()
        {
            /// <summary>
            /// Helper function to inform consumers that the control is in editing mode.
            /// It is currently being used by self view to ignore clicks on background/photo when people
            /// click away from caption control.
            /// </summary>
            /// <returns type="Boolean">True if in editing mode and false otherwise</returns>

            return _editing;
        };

        _this.getContainer = function ()
        {
            /// <summary>
            /// Gets the container element.
            /// </summary>
            /// <returns type="jQuery">The container element.</returns>

            return $container;
        };

        _this.focus = function ()
        {
            /// <summary>
            /// Allows text to have focus.
            /// </summary>

            if (_editing)
            {
                _$input.focus();
            }
            else
            {
                _$textlink.focus();
            }
        };

        _this.render = function (item)
        {
            /// <summary>
            /// Render the editable text.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">The item to render.</param>

            // Render if the item or the relevant property has changed . . . 
            if ((!wLiveCore.SkyDriveItem.areItemsSame(_currentItem, item) || (_currentItemPropertyDisplayText !== getPropertyDisplayText(item))) &&
            // . . . unless the item to be rendered is currently being edited.
                !(_editing && _currentItem.key === item.key))
            {
                resetView(true);

                _currentItem = item;
                _currentItemPropertyDisplayText = getPropertyDisplayText(_currentItem);

                // Set if the text is editable for this item.
                _editable = !!viewContext.actionManager.getAction(_authAction, _currentItem);
                if (!_disableEdit && _editable)
                {
                    addEditableTextStateClass(c_editableClass);
                }
                else
                {
                    removeEditableTextStateClass(c_editableClass);
                }

                var /* @type(String) */property = (/* @static_cast(String) */getPropertyDisplayText(_currentItem) || '');
                setCurrentText(itemHelper.highlightAndEncodeField(_currentItem, _propertyName), /* encoded */true);
                setCurrentSnippet(item);
            }

            if (_centered)
            {
                _this.resize();
            }
        };

        _this.resize = function (callback)
        {
            /// <summary>
            /// Resize is called when browser resize occurs.
            /// </summary>
            /// <param name="callback" type="void -> void" optional="true">Callback to execute after resizing.</param>

            var maxWidth;
            if (_centered)
            {
                // Leave room for the border.
                maxWidth = $container.width() - 2;
            }
            else
            {
                // Leave room for the border.
                maxWidth = _$textContainer.width() - 2;
            }

            if (_centered && !_editing)
            {
                if (_$text)
                {
                    // Allow it to grow when you make the browser bigger.
                    // this allows the _$text.width() to return the correct size.
                    _$textContainer.width('auto');

                    // 20 is from 10px padding on each side between the border (hover) and the text.
                    // Extra 1 because it was truncating early.
                    _$textContainer.width(Math.min(_$text.width() + 21, maxWidth));
                }
            }
            else
            {
                setInputDimension('width', maxWidth);
            }

            // Allow browser to finish DOM placement before updating the offset.
            setTimeout(function ()
            {
                updateInputOffset();
                callback && callback();
            }, 0);
        };

        _this.dispose = function ()
        {
            /// <summary>
            /// Dispose the editable text.
            /// </summary>
            if (!_isDisposed)
            {
                _isDisposed = true;

                resetView(true);

                clearCurrentError();
                _dataModel.removeListener(wLiveCore.DataModel.dataChangedEvent, handleDataChanged);
                if (_editAction)
                {
                    $viewContext.unbind(_editAction, onEditAction);
                }
                $window.unbind(_uniqueNamespace);
                _$textlink && _$textlink.unbind();
                unbindEditUI();
            }

            if (_softBlockPopover)
            {
                _softBlockPopover.dispose();
                _softBlockPopover = null;
            }
        };

        function updateInputOffset()
        {
            /// <summary>
            /// Updates the offset of the input element.
            /// </summary>

            if (_editing)
            {
                var elem = _centered ? $container : _$textContainer;

                // Move the position of the input box if we can obtain a valid offset position.
                var offset = elem.offset();

                if (!offset.top || !offset.left)
                {
                    // Fall back to the cached offset in case the browser cannot determine the current offset.
                    offset = _cachedOffset;
                }

                if (offset.top && offset.left)
                {
                    _cachedOffset = offset;

                    // RTL lines up with 3px adjustment.
                    var rtlAdjustment = $B.rtl ? 3 : 0;

                    // Adjust the left position in case the view has horizontally scrolled from the document root.
                    offset.left = offset.left - $rootElement.offset().left - rtlAdjustment;

                    _$edit.show();
                    _$edit.offset(offset);
                }
            }
        }

        // Listen to the window resize event since the input area is positioned based on the relation of the control to the document root.
        $window.bind(c_resize + _uniqueNamespace, function ()
        {
            _this.resize();
        });
        $window.bind(c_scroll + _uniqueNamespace, updateInputOffset);

        $window.bind(c_mousewheel + _uniqueNamespace, saveIfEditing);

        function resetView(removePendingNewItem)
        {
            /// <summary>
            /// Resets the view to the initial state.
            /// </summary>
            /// <param name="removePendingNewItem" type="Boolean">This removes the pending item if we were editing</param>

            // Make sure we cancel if we are reseting the view and we were editing
            if (_editing && removePendingNewItem && /* @static_cast(Boolean) */_currentItem && _currentItem._isNewFolder)
            {
                // This needs to happen here to break an infinite loop
                resetState();

                // We must remove this item from the ui
                viewContext.pendingFolderToCreate = false;
                // Remove the pinned item
                var parent = _currentItem.getParent();
                if (parent)
                {
                    parent.removePinnedSubfolder(_currentItem);
                    parent.invalidate();
                }
            }
            else
            {
                resetState();
            }
        };

        function setEditing(editing)
        {
            /// <summary>
            /// Sets the "editing" state of the control.
            /// </summary>

            if (_editing != editing)
            {
                _editing = editing;

                if (_editing)
                {
                    _$hiddenInput = jQuery(c_hiddenInputHtml);
                    _$input = jQuery(c_period + c_inputClass, _$edit);

                    $container.append(_$hiddenInput);

                    addEditableTextStateClass(c_editingClass);

                    sutra(_$input, '$Sutra.SkyDrive.EditableTextInput');

                    // Place the input area of this editable text as a direct child of the page element.
                    // This strategy ensures that other controls won't obstruct click events from the input area from reaching the DOM document.
                    // See WinLive #419882, #415932, #418468, #412038.
                    _$edit.hide().appendTo($rootElement);

                    rebindEditUI();
                }
                else
                {
                    unbindEditUI();

                    _$edit.remove();
                    unsutra(_$input);
                    removeEditableTextStateClass(c_editingClass);

                    _$hiddenInput && _$hiddenInput.remove();
                }

                updateDataModelChangeEvents();
            }
        }

        function setSaving(saving)
        {
            /// <summary>
            /// Sets the "saving" state of the control.
            /// </summary>

            if (_saving != saving)
            {
                _saving = saving;

                updateDataModelChangeEvents();
            }
        }

        function resetState()
        {
            /// <summary>
            /// Resets the state of the control.
            /// </summary>

            if (_editing)
            {
                clearCurrentError();
            }

            setEditing(false);
        }

        function updateDataModelChangeEvents()
        {
            /// <summary>
            /// Update the state of data model change events.
            /// </summary>

            // Suspend data changed events when the control is in save or edit mode.
            // This is important because a data changed event may cause the parent control to rerender,
            // leaving this control unable to respond to lose unsaved user input.
            if (_saving || _editing)
            {
                _dataModel.suspendChangeEvents();
            }
            else
            {
                _dataModel.resumeChangeEvents();
            }
        }

        function addEditableTextStateClass(className)
        {
            /// <summary>
            /// Adds a class that represents the state of the editable text control.
            /// </summary>

            $container.addClass(className);
            _$edit.addClass(className);
        }

        function removeEditableTextStateClass(className)
        {
            /// <summary>
            /// Removes a class that represents the state of the editable text control.
            /// </summary>

            $container.removeClass(className);
            _$edit.removeClass(className);
        }

        function setInputDimension(name, value)
        {
            /// <summary>
            /// Sets a dimension on the input area.
            /// </summary>

            if (value)
            {
                // Ensure that the dimenions of the input and the hidden input stay in sync.
                _$input && _$input[name](value);

                // IE has an off-by one behavior where the hidden element is just barely visible if the same size.
                var hiddenValue = $B.IE ? value - 1 : value;
                _$hiddenInput && _$hiddenInput[name](hiddenValue);
            }
        }

        function rebind($elem, eventName, func)
        {
            /// <summary>
            /// Crunchable helper to rebind an event on an element to a function.
            /// </summary>

            $elem && $elem.unbind(eventName, func).bind(eventName, func);
        }

        _this.bindAll();

        ///
    }
})();
/// <reference path=".../setview.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var c_defaultMessage = wLive.Core.AleHelpers.getString("Loading");

    wLive.Controls.LoadingSpinner = LoadingSpinner;
    /* @bind(wLive.Controls.LoadingSpinner) */function LoadingSpinner($container, message)
    {
        /// <summary>
        /// A very simple loading spinner ui.
        /// </summary>
        /// <param name="$container" type="jQuery">jQuery object which refers to the containing element this control should live within.</param>
        /// <param name="message" type="String" optional="true">An optional loading message.  If this isn't passed, "Loading..." will be used.</param>

        var _this = this;
        _this.render = function ()
        {
            /// <summary>
            /// Renders the loading spinner.
            /// </summary>

            message = message == null ? c_defaultMessage : message;

            var spinnerHtml = $f && $f.createLoading({
                returnMarkup: true,
                useTransparentFallback: true,
                text: message
            });
            var $spinner = jQuery(spinnerHtml);
            $container.append($spinner);
            $f.showLoading($spinner);
            $spinner.find(".c_loadingText").addClass('t_ctc');
            sutra($spinner, '$Sutra.SkyDrive.LoadingSpinner');
        };
    }

    ///
})();

/// <reference path=".../setview.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveControls = wLive.Controls;

    var c_loadingCueHtmlTemplate = '<div class="lcCenter"><div class="lcWrapper"></div></div>';

    var c_delayUntilShowMilliseconds = 250;
    var c_useFade = jQuery.support.opacity;
    var c_leftProperty = $B.ltr ? "left" : "right";

    wLiveControls.LoadingCue = LoadingCue;

    /* @bind(wLive.Controls.LoadingCue) */function LoadingCue($container)
    {
        /// <summary>
        /// A very simple loading spinner ui cue for use in the details list and best fit grid.
        /// </summary>
        /// <param name="$container" type="jQuery">jQuery object which refers to the containing element this control should live within.</param>

        $container.html(c_loadingCueHtmlTemplate);
        var _$centerDiv = jQuery(".lcCenter", $container);
        var _$loadingDiv = jQuery(".lcWrapper", $container).hide();
        var _loadingSpinner = new wLiveControls.LoadingSpinner(_$loadingDiv);
        _loadingSpinner.render();

        // We apply a negative left margin to offset the ?left=50% set in css styling. This allows us to always be centered.
        _$loadingDiv.css("margin-" + c_leftProperty, -(_$loadingDiv.width() / 2));

        sutra(_$loadingDiv, '$Sutra.SkyDrive.LoadingCue');

        var _this = this;
        var _isVisible = false;

        _this.setVisibility = function (isVisible)
        {
            /// <summary>
            /// Shows the spinner if it's not already visible.
            /// </summary>
            /// <param name="isVisible" type="Boolean">True if should be visible.</param>

            if (!isVisible)
            {
                _$loadingDiv.stop(true).hide();
            }
            else
            {
                if (!_isVisible)
                {
                    if (c_useFade)
                    {
                        _$loadingDiv
                            .stop(true)
                            .delay(c_delayUntilShowMilliseconds)
                            .css("opacity", 0)
                            .show()
                            .animate({ opacity: 1 }, 500);
                    }
                    else
                    {
                        _$loadingDiv.show();
                    }
                }


                // If the loading cue has gone off the screen, lock it to the top of the window.
                if (_$centerDiv.offset().top >= jQuery(window).scrollTop())
                {
                    _$loadingDiv.css({ position: "absolute" });
                }
                else
                {
                    _$loadingDiv.css({ position: "fixed" });
                }

            }

            _isVisible = isVisible;
        };

        _this.update = function ()
        {
            /// <summary>
            /// Updates the presentation of the spinner (centered and fixed states.)
            /// </summary>

            _this.setVisibility(_isVisible);
        };
    }

    ///
})();

/// <reference path=".../selfview.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var wLiveControls = wLive.Controls;
    var getString = wLiveCore.AleHelpers.getString;
    var getPCString = wLiveCore.AleHelpers.getPCString;
    var _config = window.FilesConfig;

    var c_markup = '<div class="selfItem">' +
                    '<div class="selfItemP"></div>' +
                    '<div class="selfItemV"></div>' +
                    '<div class="selfItemTH"></div>' +
                    '<div class="selfItemTC"></div>' +
                   '</div>';
    var c_openAnchorFormat = '<a target="_blank" href="{0}">';

    var c_closeAnchor = '</a>';

    var c_htmlOwnerCodeOfConductFormatString = getString('RestrictedNotification.Owner');
    var c_htmlOwnerICNCodeOfConductFormatString = getString('RestrictedNotification.OwnerICN');
    var c_htmlCantLoadItemString = getString('Video.LoadError');
    var c_htmlUnsupportedVideoFormatString = getString('Video.UnsupportedFormat');
    var c_contactUsOpenAnchor = c_openAnchorFormat.format(_config.contactUsLink.encodeHtmlAttribute());

    var formatedOwnerContactUsMessage;
    if ($B.Mobile)
    {
        formatedOwnerMessage = getString('RestrictedNotification.OwnerContactUs').format(c_contactUsOpenAnchor, c_closeAnchor);
    }
    else
    {
        formatedOwnerMessage = getString('RestrictedNotification.OwnerContactUs').format("", "");
    }

    var c_contactUsButtonText = getString('RestrictedNotification.ContactUs');
    var c_contactUsNavigationDestination = _config.contactUsLink.encodeHtmlAttribute();

    var c_contactUsMsgHtml = '<div>' + formatedOwnerMessage + '</div>';

    var c_codeOfConductAnchor = c_openAnchorFormat.format(_config.codeOfConductLink.encodeHtmlAttribute());

    var c_icnMsgHtml = '<div>' + c_htmlOwnerICNCodeOfConductFormatString.format(c_codeOfConductAnchor, c_closeAnchor) + '</div>' + c_contactUsMsgHtml;
    var c_stdMsgHtml = '<div>' + c_htmlOwnerCodeOfConductFormatString.format(c_codeOfConductAnchor, c_closeAnchor) + '</div>' + c_contactUsMsgHtml;
    var c_cantLoadItemMsgHtml = '<div>' + c_htmlCantLoadItemString + '</div>';
    var c_unsupportedItemVideoFormatMsgHtml = '<div>' + c_htmlUnsupportedVideoFormatString + '</div>';

    wLiveControls.SelfItem = SelfItem;
    /* @bind(wLive.Controls.SelfItem) */function SelfItem($container, viewContext, options)
    {
        /// <summary>
        /// Initializes a new instance of the SelfItem class.
        /// </summary>
        /// <param name="$container" type="jQuery">jQuery Object which contains the containing element to render the Self Item Control within.</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">View Context Object.</param>
        /// <param name="options" type="wLive.Controls.TaggingOptions" optional="true">Tagging options.</param>

        var _this = this;
        var _itemHelper = wLiveCore.SkyDriveItemHelper;
        var dataModel = viewContext.dataModel;

        options = options || {};

        // Current state.
        var /* @type(wLive.Core.ISkyDriveItem) */_currentItem;

        // Setup container elements.
        $container.html(c_markup);

        // Retrieve container elements.
        var _$selfItem = jQuery('.selfItem', $container);
        var _$itemTileContainer = jQuery('.selfItemP', $container);
        var _$videoContainer = jQuery('.selfItemV', $container);
        var _$tagHoverContainer = jQuery('.selfItemTH', $container);
        var _$tagCreationContainer = jQuery('.selfItemTC', $container);

        var /* @type(Number) */_lastWidth;
        var /* @type(Number) */_lastHeight;

        var _itemTileOptions =
        {
            // Do not enable context menu here.
            // MoSelf does not want it.
            // Also the right click is handled by the SelfView
            // so it can surround the people tags and the video control.
            dt: true,
            dv: true,
            // Allow stretching.
            as: true,
            // Show Properties command in right click menu only when info pane is closed
            sp: 2,
            // No minimum size for thumbnail
            nms: options.nms
        };

        // Instanciate sub controls.
        var _itemTile = new wLiveControls.ItemTile(_$itemTileContainer, viewContext, _itemTileOptions);
        /* @disable(0092) */
        var _videoControl = new wLiveControls.Video(_$videoContainer, viewContext);
        /* @restore(0092) */
        var _tagHoverControl;
        var _tagCreationControl;

        if (!$B.Mobile && !options.ht)
        {
            // We need to disable the error here since this will only happen in the none mobile code
            /* @disable(0092) */
            _tagHoverControl = new wLiveControls.TagHover(_$tagHoverContainer, viewContext, options);
            _tagCreationControl = new wLiveControls.TagCreate(_$tagCreationContainer, viewContext, options);
            /* @restore(0092) */
        }
        else
        {
            _$tagHoverContainer.hide();
            _$tagCreationContainer.hide();
        }

        var /* @type(Boolean) */_quick;


        _this.isLoaded = function ()
        {
            /// <summary>
            /// Returns if the view completely loaded.
            /// </summary>
            /// <returns type="Boolean">Is loaded</returns>

            // Note the self item is "loaded if the image.
            // We may include the video control loading as well later
            // but due to buffering we are not right now.
            return _itemTile.isLoaded();
        };

        _this.showContextMenu = function (ev)
        {
            /// <summary>
            /// Event handler for context menu event.
            /// </summary>
            /// <param name="ev" type="wLive.JQueryEvent">Context menu event.</param>

            _itemTile.showContextMenu(ev);
        };

        _this.render = function (item, quick)
        {
            /// <summary>
            /// Render causes the Film Strip Item to display the Item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>
            /// <param name="quick" type="Boolean" optional="true">Force quick item tile.</param>

            var sameItem = wLiveCore.SkyDriveItem.areItemsSame(_currentItem, item);

            sutra(_$selfItem, '$Sutra.SkyDrive.SelfItem');

            if (!quick && $B.IE && $B.V < 9)
            {
                // IE 8 has a bug where the opacity filter
                // causes overflow:hidden.
                // Remove the opacity = 100% filter
                // jQuery is tracking the same bug: http://bugs.jquery.com/ticket/6652
                $container.css('filter', '');
            }

            //Trace.log('Render - itemId - '+ item.id +' - quick='+quick, 'Self Item');

            if (!sameItem || _quick != quick)
            {
                _quick = quick;
                _currentItem = item;

                resizeContainers();

                _$tagHoverContainer.hide();

                if (_currentItem)
                {
                    // If item is not a photo or video, we should show an error message about not being able to show it.
                    if (!_currentItem.photo && !_currentItem.isWebPlayableVideo() && !_currentItem.isProcessingVideo)
                    {
                        var errMsg = (/* @static_cast(Boolean) */_currentItem.video && !_currentItem.isWebPlayableVideo()) ? c_unsupportedItemVideoFormatMsgHtml : c_cantLoadItemMsgHtml;
                        viewContext.errorManager.add({
                            $element: jQuery(errMsg),
                            priority: 1,
                            type: 4
                        });
                    }

                    if (!viewContext.isSuper && (/* @static_cast(Boolean) */_currentItem.itemStatus && _currentItem.itemStatus > 0))
                    {
                        var restrictedType = 1;
                        var restrictedReason = 1;

                        var parent = dataModel.getItem(_currentItem.parentKey, /* skipFetch */true);

                        // only show the owner a sharing warning when folder or the item itself is shared
                        if (_itemHelper.isViewerOwner(_currentItem))
                        {
                            // owner doesn't get notified if the album is private unless item has been shared
                            // sharingLevelValue: 4 === private
                            if (parent.sharingLevelValue != 4 || _currentItem.sharingLevelValue != 4)
                            {
                                // the one custom notification is for those items with review status ICN
                                // Status values are { Active: 0, Restricted: 1, RestrictedICN: 2 }
                                // All the rest get the same notification
                                var $msgElem = null;
                                if (_currentItem.itemStatus == 2)
                                {
                                    $msgElem = jQuery(c_icnMsgHtml);
                                    restrictedReason = 2;
                                }
                                else
                                {
                                    $msgElem = jQuery(c_stdMsgHtml);
                                    restrictedReason = 1;
                                }

                                viewContext.errorManager.add({
                                    $element: $msgElem,
                                    actionBtnName: c_contactUsButtonText,
                                    actionCallback: function ()
                                    {
                                        var itemChallengeReviewed = /* @static_cast(Boolean) */_currentItem.reviewState && _currentItem.reviewState == wLiveCore.ReviewState.ChallengeReviewed;
                                        if (!$B.Mobile && !itemChallengeReviewed)
                                        {
                                            /* @disable(0092) */
                                            // send them to the simple challenge flow
                                            var _items = [];
                                            _items.push(item);
                                            viewContext.operationManager.execute("OwnerRequestReview", { items: _items });
                                            /* @restore(0092) */
                                        }
                                        else
                                        {
                                            // they go to the standard contact us page
                                            $BSI.navigateTo(c_contactUsNavigationDestination, "_blank");
                                        }
                                    },
                                    priority: 1,
                                    type: 4
                                });
                            }
                        }
                        else
                        {
                            restrictedType = 2; // visitor
                            restrictedReason = _currentItem.itemStatus == 2 ? 2 : 1; // ICN == 2, others == 1

                            viewContext.errorManager.add({
                                $element: jQuery('<span>' + getString('RestrictedNotification.Visitor') + '</span>'),
                                priority: 1,
                                type: 4
                            });
                        }

                        $BSI.reportEvent(
                            "SkyDrive.Abuse.TargetedTakedown",
                            {
                                RestrictedType: restrictedType,
                                RestrictedReason: restrictedReason
                            }
                        );
                    }

                    if ((/* @static_cast(Boolean) */_currentItem.video || _currentItem.isProcessingVideo) && !_currentItem.thumbnailSet)
                    {
                        // Hide item tile for videos without thumbnails.
                        _$itemTileContainer.hide();
                    }
                    else
                    {
                        _$itemTileContainer.show();
                        _itemTile.render(_currentItem, quick);
                    }

                    if (_currentItem.isWebPlayableVideo() && !quick)
                    {
                        options.te = true;

                        _$videoContainer.show();
                        _videoControl.render(_currentItem);
                    }
                    else
                    {
                        options.te = false;

                        _$videoContainer.hide();

                        if (!quick)
                        {
                            options.te = true;

                            if (_tagHoverControl)
                            {
                                _$tagHoverContainer.show();
                                _tagHoverControl.render(_currentItem);
                            }
                        }

                        if (!item.video && item.isProcessingVideo)
                        {
                            // Add error to notification bar.
                            viewContext.errorManager.add({
                                $element: jQuery('<span>' + getString('Video.BeingProcessedHeader') + '. ' + getString('Video.BeingProcessedMessage') + '</span>'),
                                priority: 1,
                                type: 4
                            });
                        }
                    }
                }
                else
                {
                    // Self View is filtering out non video/photos
                    // later in the milestone.
                    // However we probably want to cover this case
                    // in a larger scenario when photo and video
                    // doesn't have a thumbnail.
                    // This will be fixed after we get the image strip
                    // work item checked in.
                    _$itemTileContainer.hide();
                    _$videoContainer.hide();
                }
            }

            if (!_quick)
            {
                if (_tagCreationControl)
                {
                    // We need to disable the error here since this will only happen in the none mobile code
                    /* @disable(0092) */
                    _tagCreationControl.render(_currentItem);
                    /* @restore(0092) */
                }
            }
        };

        _this.stop = function ()
        {
            /// <summary>
            /// Stop animations (such as item tile or video fading in) and video playing.
            /// </summary>

            if (_currentItem && _currentItem.video)
            {
                _videoControl.stop();
            }

            if (_tagCreationControl)
            {
                // We need to disable the error here since this will only happen in the none mobile code
                /* @disable(0092) */
                _tagCreationControl.stop();
                /* @restore(0092) */
            }
        };

        _this.unset = function ()
        {
            /// <summary>
            /// Call when the self item will be hidden.
            /// </summary>

            unsutra(_$selfItem);
        };

        function copyWidthHeight($element, width, height)
        {
            /// <summary>
            /// Helper to copy width/height
            /// </summary>
            /// <param name="$element" type="jQuery">Element to size</param>
            /// <param name="width" type="Number">Width to set.</param>
            /// <param name="height" type="Number">Height to set.</param>

            $element.width(width);
            $element.height(height);
        }

        function resizeContainers()
        {
            /// <summary>
            /// Helper function to resize containers
            /// </summary>
            /// <returns type="Boolean">True if the size changed</returns>

            var sizeChangeOccurred = false;

            var containerData = $container[0];

            var width = containerData.w || /* @static_cast(Number) */$container.width();
            var height = containerData.h ||  /* @static_cast(Number) */$container.height();

            if (width != _lastWidth || height != _lastHeight)
            {
                _lastWidth = width;
                _lastHeight = height;

                sizeChangeOccurred = true;

                _itemTileOptions.w = options.cw = width;
                _itemTileOptions.h = options.ch = height;

                copyWidthHeight(_$selfItem, width, height);
                copyWidthHeight(_$videoContainer, width, height);
                copyWidthHeight(_$tagCreationContainer, width, height);
            }

            return sizeChangeOccurred;
        }

        _this.resize = function ()
        {
            /// <summary>
            /// Position containers resizes the containers
            /// when there is a browser resize or items have been determined.
            /// </summary>

            if (resizeContainers())
            {
                if (_currentItem)
                {
                    // resize the item tile for both video and photos.
                    _itemTile.resize();

                    if (_currentItem.photo)
                    {
                        if (!_quick && /* @static_cast(Boolean) */_tagHoverControl)
                        {
                            _tagHoverControl.resize();
                        }
                    }

                    if (!_quick)
                    {
                        if (_currentItem.video)
                        {
                            _videoControl.resize();
                        }
                    }
                }
            }

            if (!_quick)
            {
                if (_tagCreationControl)
                {
                    // We need to disable the error here since this will only happen in the none mobile code
                    /* @disable(0092) */
                    _tagCreationControl.resize();
                    /* @restore(0092) */
                }
            }
        };

        _this.dispose = function ()
        {
            /// <summary>
            /// Disposes the Film Strip Item
            /// </summary>

            _itemTile.dispose();
            _itemTile = null;

            _videoControl.dispose();
            _videoControl = null;

            if (_tagHoverControl)
            {
                // We need to disable the error here since this will only happen in the none mobile code
                /* @disable(0092) */
                _tagHoverControl.dispose();
                /* @restore(0092) */
            }

            if (_tagCreationControl)
            {
                // We need to disable the error here since this will only happen in the none mobile code
                /* @disable(0092) */
                _tagCreationControl.dispose();
                /* @restore(0092) */
            }
        };
    }

    ///
})();

/// <reference path=".../video.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var wLiveControls = wLive.Controls;
    var wFilesConfig = FilesConfig;
    var wLiveCoreCookieToss = wLiveCore.CookieToss;
    var getString = wLiveCore.AleHelpers.getString;
    var getPCString = wLiveCore.AleHelpers.getPCString;

    var c_markup = '<div class="videoLoading"></div><div class="videoControl"></div>';

    // Height of the controls (play, pause, etc) for the player
    var c_slPlayerControlsHeight = 30;

    var c_eventSilverlightLoaded = 'slLoaded';
    var c_eventKeyDown = 'keydown';

    var c_zIndex = 'z-index';

    // View Original string
    var c_stringViewOriginal = getString('video.original');

    // Four CC constants
    var c_FourCcH264 = 'H264';

    // The profiles we have available for requesting remote video from devices.
    var c_devicesStreamingProfiles = [720, 480, 360, 240];
    var c_devicesStreamingBufferTimes = [30, 15, 10, 5];
    var c_devicesStreamingDefaultProfile = 360;

    // Player types
    var c_PlayerTypes = { HTML5: 0, SL: 1, Upsell: 2, None: 3 };


    // We need to disable the error here since this will only happen in the none mobile code
    /* @disable(0092) */

    // Whether or not silverlight is installed in browser
    var _silverlightInstalled = wLiveCore.SilverlightInstalled;
    var _silverlightSupported = wLiveCore.SilverlightSupported;
    /* @restore(0092) */

    // Whether or not HTML5 H264 playback is supported in browser
    var /* @type(Boolean) */_supportsHtml5H264Playback;

    wLiveControls.Video = Video;

    // Properties which should be equal across all video controls.
    wLiveControls.Video.currentVideo = /* @static_cast(String) */null;
    wLiveControls.Video.viewableItemKey = /* @static_cast(String) */null;
    wLiveControls.Video.volume = 1;
    wLiveControls.Video.muted = false;

    var $document = jQuery(document);

    /* @bind(wLive.Controls.Video) */function Video($container, viewContext)
    {
        /// <summary>
        /// Initializes a new instance of the Video class.
        /// </summary>
        /// <param name="$container" type="jQuery">jQuery Object which contains the containing element to render the Video Control within.</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">View Context Object.</param>

        // Local Variable to crunch "this" and allow callbacks to use "this" without making delegates.
        var _this = this;
        var _dataModel = viewContext.dataModel;

        // Current Item
        var /* @type(wLive.Core.ISkyDriveItem) */_currentItem;

        // Current Player Element (HTML5 or Silverlight)
        var /* @type(jQuery) */_$currentPlayer;

        // Current Player type (c_PlayerTypes)
        var /* @type(Number) */_currentPlayerType;

        // Resource strings
        var _videoLoadingPercentageText = getString('video.loading');
        var _videoLoadingText = getString('loading');
        var _videoLoadError = getString('video.loaderror');
        var _videoLoadErrorUnsupported = getString('Video.LoadErrorUnsupported');
        var _installSilverlight = getString('video.installsilverlightformatstring');

        // Stores a previously thrown error. Whenever a video throws an error, we iterate away, and then come back (with same item)
        // we need to rethrow the error, since video is already loaded and won't rethrow the error.
        var _errorThrown = null;

        // Used to keep track of whether a video loaded the last time it was shown or not. Needed since some HTML5 videos don't respond on second time,
        // they're called on, so we reload the HTML5 video control instead of just resetting and playing.
        var _videoLoaded = false;
        var _videoLoadedBefore = false;

        // Setup container elements.
        $container.html(c_markup);

        // Container dimensions
        var /* @type(Number) */_containerWidth;
        var /* @type(Number) */_containerHeight;

        // Retrieve container elements.
        var _$videoElement = jQuery('.videoControl', $container);
        sutra(_$videoElement, '$Sutra.SkyDrive.VideoControl');

        var _$videoLoading = jQuery('.videoLoading', $container);
        var _loadingCue = new wLiveControls.LoadingCue(_$videoLoading);

        // Bind to silverlight loaded event, which is triggered whenever
        // the silverlightvideo has finished loading.
        jQuery(viewContext).bind(c_eventSilverlightLoaded,
            function (ev, itemKey)
            {
                OnSilverlightVideoPlayerLoaded(itemKey);
            });

        $document.bind(c_eventKeyDown, keyDownChecker);

        _this.stop = function ()
        {
            /// <summary>
            /// Pauses playback of HTML5 player if it exists, otherwise empties the video player
            /// </summary>

            // Set viewableItemKey to null, since video is no longer showing.
            wLiveControls.Video.viewableItemKey = null;

            if (_$currentPlayer && _$currentPlayer[0])
            {
                if (_currentPlayerType == c_PlayerTypes.HTML5 && _$currentPlayer[0].pause)
                {
                    // Adding try/catch since calling on pause method throws error when video hasn't been loaded yet.
                    try
                    {
                        _$currentPlayer[0].pause();
                    }
                    catch (err) { }
                    ResetVideoControl();
                }
                else if (_currentPlayerType == c_PlayerTypes.SL && _$currentPlayer[0].Content && _$currentPlayer[0].Content.VideoControls)
                {
                    _$currentPlayer[0].Content.VideoControls.StopVideo();
                }
            }
        };

        _this.render = function (item)
        {
            /// <summary>
            /// Render the video control based on the item type. If already
            /// rendered, start playing again.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render.</param>

            Debug.assert(item, 'Must provide item to Render');

            wLiveControls.Video.viewableItemKey = item.key;
            wLiveControls.Video.currentVideo = _this;

            var itemChanged = !wLiveCore.SkyDriveItem.areItemsSame(_currentItem, item);

            _currentItem = item;

            if (itemChanged)
            {
                // Reset state variables since this is a different item.
                _errorThrown = null;
                _videoLoaded = false;
                _videoLoadedBefore = false;

                // Get container width and height
                CaptureContainerDimensions();

                // Check for cookie toss having completed
                if (wLiveCoreCookieToss.complete || !wLiveCoreCookieToss.requiresCookieToss(_currentItem.urls.download))
                {
                    // Render player
                    RenderPlayer();
                }
                else
                {
                    // Wait for cookie toss to complete and then render player
                    jQuery(wLiveCoreCookieToss).bind(wLiveCoreCookieToss.eventName, RenderPlayer);
                }
            }
            else if (_$currentPlayer && _$currentPlayer[0])
            {
                if (_videoLoaded)
                {
                    // Reset video control if it has been previously loaded, so that video will be shown right away
                    ResetVideoControl();
                }

                _videoLoadedBefore = _videoLoaded;

                if (_errorThrown)
                {
                    // Since error was thrown before, we need to throw it again.
                    ShowError(_errorThrown);
                }
                else if (_currentPlayerType == c_PlayerTypes.HTML5 && _$currentPlayer[0].play)
                {
                    // Start from the begining.
                    if (_$currentPlayer[0].currentTime)
                    {
                        _$currentPlayer[0].currentTime = 0;
                    }
                    if (!$B.Mobile)
                    {
                        _$currentPlayer[0].play();
                    }
                    _$currentPlayer[0].volume = wLiveControls.Video.volume;
                    _$currentPlayer[0].muted = wLiveControls.Video.muted;
                }
                else if (_currentPlayerType == c_PlayerTypes.SL && _$currentPlayer[0].Content && _$currentPlayer[0].Content.VideoControls)
                {
                    _$currentPlayer[0].Content.VideoControls.ResetVideo();
                    _$currentPlayer[0].Content.VideoControls.PlayVideo();
                    SetSilverlightVolume();
                }
            }
            else if (_currentPlayerType == c_PlayerTypes.Upsell)
            {
                // Load Silverlight Upsell
                LoadSilverlightUpsell();
            }
            else if (_errorThrown)
            {
                // Show error which was previously shown
                ShowError(_errorThrown);
            }
        };

        _this.resize = function ()
        {
            /// <summary>
            /// Redraws the player in the new size.
            /// </summary>

            // Do nothing if no player was loaded or upsell message is being displayed.
            if (_currentPlayerType == c_PlayerTypes.None || _currentPlayerType == c_PlayerTypes.Upsell)
            {
                return;
            }

            if (CaptureContainerDimensions())
            {
                var height = _containerHeight;

                if (_currentPlayerType == c_PlayerTypes.SL)
                {
                    /* Add height for silverlight player controls. */
                    height += c_slPlayerControlsHeight;
                }

                _$currentPlayer.height(height);
                _$currentPlayer.width(_containerWidth);
            }
        };

        _this.playPause = function ()
        {
            /// <summary>
            /// Plays the video if paused, pauses it otherwise.
            /// </summary>

            if (_$currentPlayer && _$currentPlayer[0])
            {
                var currentPlayer = /* @static_cast(VideoElement) */_$currentPlayer[0];

                /* @disable(0092) */
                if (_currentPlayerType == c_PlayerTypes.HTML5)
                {
                    if (currentPlayer.paused)
                    {
                        currentPlayer.play();
                    }
                    else
                    {
                        currentPlayer.pause();
                    }
                }
                else if (_currentPlayerType == c_PlayerTypes.SL && currentPlayer.Content && currentPlayer.Content.VideoControls)
                {
                    currentPlayer.Content.VideoControls.PlayClick();
                }
                /* @enable(0092) */
            }
        };

        _this.dispose = function ()
        {
            /// <summary>
            /// Disposes the video element.
            /// </summary>

            _this.stop();
            
            _$videoElement.remove();

            jQuery(viewContext).unbind(c_eventSilverlightLoaded);
            $document.unbind(c_eventKeyDown, keyDownChecker);
            jQuery(wLiveCoreCookieToss).unbind(wLiveCoreCookieToss.eventName);

            _this = null;
            _dataModel = null;

            _$videoElement = null;
            _$videoLoading = null;
        };

        function RenderPlayer()
        {
            /// <summary>
            /// Render the video control based on the _currentItem type.
            /// </summary>

            // Empty video element
            _$videoElement.empty();
            _$videoElement.removeClass('videoOverlay');

            ResetVideoControl();

            if (/* @static_cast(Boolean) */_currentItem.video && /* @static_cast(Boolean) */_currentItem.urls && /* @static_cast(Boolean) */_currentItem.urls.download)
            {
                var fourCC = _currentItem.video.fourCC;
                var showUnplayableVideoAsset = false;

                // Detect HTML5 video H264 support
                if (_supportsHtml5H264Playback === undefined)
                {
                    _supportsHtml5H264Playback = SupportsH264BaselineVideo();
                }

                if (fourCC == c_FourCcH264 && _supportsHtml5H264Playback && !_currentItem.did)
                {
                    // Load HTML5 player
                    HideHtml5VideoControl();
                    _$videoElement.html(LoadHTML5Player());
                    _$currentPlayer = jQuery('#vHTML5Preview', _$videoElement);
                    _$currentPlayer.bind('error', Html5Failed);
                    _$currentPlayer.bind('loadeddata', Html5VideoPlayerLoaded);
                    _$currentPlayer.bind('volumechange', Html5VolumeChanged);
                    _$currentPlayer.bind('ended', Html5Ended);

                    _$currentPlayer[0].volume = wLiveControls.Video.volume;
                    _$currentPlayer[0].muted = wLiveControls.Video.muted;

                    _currentPlayerType = c_PlayerTypes.HTML5;
                }
                else if ($B.Mobile)
                {
                    // Show error message, since we don't support SL on mobile
                    ShowError(_videoLoadErrorUnsupported);
                    _currentPlayerType = c_PlayerTypes.None;
                    showUnplayableVideoAsset = true;
                }
                else
                {
                    if (_silverlightInstalled)
                    {
                        // Load Silverlight player
                        LoadSilverlightPlayer();
                    }
                    else
                    {
                        showUnplayableVideoAsset = true;

                        if (_silverlightSupported)
                        {
                            // Load Silverlight Upsell
                            LoadSilverlightUpsell();
                            _currentPlayerType = c_PlayerTypes.Upsell;
                        }
                        else
                        {
                            // Show unsupported message
                            ShowError(_videoLoadErrorUnsupported);
                            _currentPlayerType = c_PlayerTypes.None;
                        }
                    }
                }

                if (showUnplayableVideoAsset)
                {
                    _$videoElement.addClass('videoOverlay');
                    ShowVideoControl();
                }
            }
        }

        function ResetVideoControl()
        {
            /// <summary>
            /// Restore video control to initial setup.
            /// </summary>

            _$videoElement.show();
            _$videoLoading.hide();
            $container.css(c_zIndex, 10);
        }

        function ShowVideoControl()
        {
            /// <summary>
            /// Action to show video control once it has been loaded.
            /// </summary>

            ResetVideoControl();

            if (_currentPlayerType == c_PlayerTypes.SL)
            {
                _$currentPlayer.height(_containerHeight + c_slPlayerControlsHeight);
                _$currentPlayer.addClass('videoSL');
            }
        }

        function HideSilverlightVideoControl()
        {
            /// <summary>
            /// Actions to hide video control on render.
            /// </summary>

            $container.css(c_zIndex, 0);
        }

        function HideHtml5VideoControl()
        {
            /// <summary>
            /// Actions to hide video control on render.
            /// </summary>

            // Don't want this behavior on  mobile as it interfears with the default video player
            if (!$B.Mobile)
            {
                _$videoElement.hide();
                _$videoLoading.show();
                _loadingCue.setVisibility(true);
            }
        }

        function LoadSilverlightPlayer()
        {
            /// <summary>
            /// Loads silverlight markup and sets corresponding variables.
            /// </summary>

            HideSilverlightVideoControl();

            _$videoElement.html(GetSilverlightMarkup());
            _$currentPlayer = jQuery('#vSLPreview', _$videoElement);

            _currentPlayerType = c_PlayerTypes.SL;
        }

        function GetSilverlightMarkup()
        {
            /// <summary>
            /// Creates the silverlight player markup based on the currentItem.
            /// </summary>

            var videoSource = 'downloadUrlAVOverride=' + _currentItem.urls.download;
            var profileOptions = '';
            var profileBufferTimes = '';

            // Check if video is coming from devices
            if (_currentItem.did)
            {
                var streamingUrl = _currentItem.urls.videoStream;
                var videoHeight = _currentItem.video.height;
                var videoLength = _currentItem.video.duration;

                if (/* @static_cast(Boolean) */streamingUrl && /* @static_cast(Boolean) */videoHeight)
                {
                    // Add extension so that Silverlight can determine whether to offer the download url as an option or not
                    var extension = _currentItem.extension;
                    if (extension)
                    {
                        videoSource += ',extension=' + extension;
                    }

                    // Use streamingUrl instead of download url
                    videoSource += ',streamingUrl=' + streamingUrl;

                    var profileParamName = ',profiles=';
                    var defaultProfile = c_devicesStreamingDefaultProfile;

                    var profileIndex;
                    for (profileIndex = 0; profileIndex <= c_devicesStreamingProfiles.length; profileIndex++)
                    {
                        var currentProfile = c_devicesStreamingProfiles[profileIndex];
                        if (currentProfile <= videoHeight || currentProfile == 240)
                        {
                            if (currentProfile < defaultProfile)
                            {
                                // Default profile is no longer part of the list, so set new one
                                defaultProfile = currentProfile;
                            }

                            profileOptions = profileParamName + SilverlightInitParamEncode(c_devicesStreamingProfiles.slice(profileIndex).join(','));
                            profileBufferTimes = ',profileBuffers=' + SilverlightInitParamEncode(c_devicesStreamingBufferTimes.slice(profileIndex).join(','));
                            break;
                        }
                    }

                    if (!profileOptions)
                    {
                        // We should at least pass in the smallest video quality, and use it as the default profile
                        defaultProfile = c_devicesStreamingProfiles.slice(-1)[0];
                        profileOptions = profileParamName + defaultProfile;
                    }

                    profileOptions += ",defaultProfile=" + defaultProfile;

                    if (videoLength)
                    {
                        profileOptions += ",duration=" + videoLength;
                    }
                }
            }
            else
            {
                // Add videoplayer query param, as this is used by storage to not provide chunked video
                videoSource += '&videoplayer=skysl';
            }

            var slPlayerHTML =
                '<object id="vSLPreview" data="data:application/x-silverlight," type="application/x-silverlight-2" width="' + _containerWidth + '" height="' + _containerHeight + '">' +
                '<param name="source" value="' + wFilesConfig.itemPreviewXapUrl.encodeHtmlAttribute() + '" /><param name="MaxFrameRate" value="30" /><param name="background" value="#000000" /><param name="windowless" value="true" /><param name="enableHtmlAccess" value="true" />' +
                '<param name="initParams" value="' + videoSource.encodeHtmlAttribute() + profileOptions.encodeHtmlAttribute() + profileBufferTimes.encodeHtmlAttribute() + ',videoWidth=' + _containerWidth + ',videoHeight=' + _containerHeight + ',itemKey=' + _currentItem.key + ',originalString=' + SilverlightInitParamEncode(c_stringViewOriginal.encodeHtmlAttribute()) +
                                                ',videoLoading=' + SilverlightInitParamEncode(_videoLoadingText.encodeHtmlAttribute()) + ',videoLoadingPercentage=' + SilverlightInitParamEncode(_videoLoadingPercentageText.encodeHtmlAttribute()) + ',videoLoadError=' + SilverlightInitParamEncode(_videoLoadError.encodeHtmlAttribute()) + ',errorMethod=ShowVideoError,loadMethod=TriggerSilverlightLoaded,endedMethod=VideoCompleted,volumeMethod=SilverlightVolumeChanged"/></object>';

            return slPlayerHTML;
        }

        function LoadHTML5Player()
        {
            /// <summary>
            /// Creates the HTML5 player markup based on the currentItem and container dimensions.
            /// </summary>

            var posterFrameAttribute = "";

            // Set the poster frame using the best fit thumbnail
            if (/* @static_cast(Boolean) */_currentItem.thumbnailSet && /* @static_cast(Boolean) */_currentItem.thumbnailSet.baseUrl)
            {
                // Get best fit thumbnail
                var pickedThumbnail = wLiveCore.SkyDriveItemHelper.pickThumbnail(_currentItem.thumbnailSet, _containerWidth, _containerHeight);

                // If there was a thumbnail, use it
                if (/* @static_cast(Boolean) */pickedThumbnail && /* @static_cast(Boolean) */pickedThumbnail.url)
                {
                    var posterFrameThumb = _currentItem.thumbnailSet.baseUrl + pickedThumbnail.url;
                    posterFrameAttribute = 'poster="' + posterFrameThumb.encodeHtmlAttribute() + '"';
                }
            }

            var videoSource = _currentItem.urls.download + '&videoplayer=skysl';

            var h5PlayerHTML =
                '<video id="vHTML5Preview"  width="' + _containerWidth + '" height="' + _containerHeight + '" ' + posterFrameAttribute + ' controls><source src="' + videoSource.encodeHtmlAttribute() + '" type="video/mp4" /></video>';

            return h5PlayerHTML;
        }

        function LoadSilverlightUpsell()
        {
            /// <summary>
            /// Creates the markup to show the silverlight upsell.
            /// </summary>

            // Add error to notification bar.
            viewContext.errorManager.add({
                $element: jQuery('<span>' + _installSilverlight + '</span>'),
                actionBtnName: getPCString("DownloadCommand"),
                actionCallback: function () { $BSI.navigateTo(wFilesConfig.installSilverlightUrl, "_blank"); },
                priority: 1,
                type: 4
            });
        }

        function CaptureContainerDimensions()
        {
            /// <summary>
            /// Captures the container width and height.
            /// </summary>
            /// <return>True if dimensions changed, false otherwise.</return>

            var width = /* @static_cast(Number) */$container.width();
            var height = /* @static_cast(Number) */$container.height();

            // Width must be at a minimum 300px in order to fit the controls correctly
            width = width > 300 ? width : 300;

            if (width != _containerWidth || height != _containerHeight)
            {
                _containerWidth = width;
                _containerHeight = height;
                return true;
            }

            return false;
        }

        function SupportsH264BaselineVideo()
        {
            /// <summary>
            /// Determines if HTML5 H264 video playback is supported
            /// in the current browser.
            /// </summary>

            var videoElement = /* @static_cast(VideoElement) */document.createElement('video');

            return !!(/* @static_cast(Boolean) */videoElement.canPlayType && /* @static_cast(Boolean) */videoElement.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));
        }

        function SilverlightInitParamEncode(initParam)
        {
            /// <summary>
            /// Encode string to be passed in as Silverlight init param.
            /// Commas can't be passed in, so turning into pipes.
            /// </summary>
            /// <param name="initParam" type="String">String to encode.</param>
            /// <return>Encoded string.</return>

            return initParam.replace(/,/g, '|');
        }

        function keyDownChecker(ev)
        {
            /// <summary>
            /// Key Down Checker is a helper function which is called when there
            /// is a key down event on the window.
            /// If a video is in view, it plays/pauses the video.
            /// Added outside of control, since event using it oustide of control.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Key down event.</param>

            var which = ev.which;

            var videoControl = /* @static_cast(*) */wLiveControls.Video.currentVideo;
            var itemKey = /* @static_cast(String) */wLiveControls.Video.viewableItemKey;

            if (!wLiveCore.DomHelpers.isTextInputElement(jQuery(ev.target)) && /* @static_cast(Boolean) */itemKey && /* @static_cast(Boolean) */videoControl && !wLiveCore.PopoverHelpers.isPopoverVisible())
            {
                if (which == 32 /* space */ && /* @static_cast(Boolean) */_currentItem && itemKey == _currentItem.key)
                {
                    // Play/pause video
                    videoControl.playPause();
                    return false;
                }
            }

            return /* @static_cast(Boolean) */undefined;
        }

        function Html5VolumeChanged()
        {
            /// <summary>
            /// Handles HTML5 player's volume being changed.
            /// </summary>

            if (/* @static_cast(String) */wLiveControls.Video.viewableItemKey == _currentItem.key)
            {
                wLiveControls.Video.muted = _$currentPlayer[0].muted;
                wLiveControls.Video.volume = _$currentPlayer[0].volume;
            }
        }

        function SilverlightVolumeChanged(volume, itemKey)
        {
            /// <summary>
            /// Handles the Silverlight player's volume being changed.
            /// </summary>
            /// <param name="volume" type="Number">New volume changed.</param>
            /// <param name="itemKey" type="String" optional="true">Key for item which is changing it's volume.</param>

            if (!itemKey || wLiveControls.Video.viewableItemKey == itemKey)
            {
                wLiveControls.Video.muted = volume == 0 ? true : false;
                wLiveControls.Video.volume = volume;
            }
        }

        function SetSilverlightVolume()
        {
            /// <summary>
            /// Sets the silverlight player's volume.
            /// </summary>

            var volumeLevel = wLiveControls.Video.volume;
            if (wLiveControls.Video.muted)
            {
                volumeLevel = 0;
            }

            if (_$currentPlayer[0].Content && _$currentPlayer[0].Content.VideoControls)
            {
                _$currentPlayer[0].Content.VideoControls.SetVolume(volumeLevel);
            }
        }

        function Html5VideoPlayerLoaded()
        {
            /// <summary>
            /// Handles HTML5 player being loaded.
            /// </summary>

            _videoLoaded = true;

            if (/* @static_cast(String) */wLiveControls.Video.viewableItemKey == _currentItem.key)
            {
                ShowVideoControl();

                if (!$B.Mobile)
                {
                    _$currentPlayer[0].play();
                }
            }
        }

        function TriggerSilverlightLoaded(itemKey)
        {
            /// <summary>
            /// Triggers the event signaling the Silverlight player has finished loaded.
            /// This function is attached to window, so it is not instance specific. Therefore, we need to trigger an event, which will
            /// be caught by each videoControl instance, and then each videoControl will determine if they should handle or ignore the 
            /// the event, depending on the itemKey.
            /// </summary>
            /// <param name="errorMessage" type="String">Error message to display.</param>
            /// <param name="itemKey" type="String" optional="true">Key for item which is throwing error.</param>

            jQuery(viewContext).trigger(c_eventSilverlightLoaded, [itemKey]);
        }

        function OnSilverlightVideoPlayerLoaded(itemKey)
        {
            /// <summary>
            /// Handles the Silverlight player being loaded.
            /// This is called whenever a SilverlightLoaded event is thrown.
            /// </summary>
            /// <param name="itemKey" type="String" optional="true">Key for item which is throwing error.</param>

            _videoLoaded = true;

            if (/* @static_cast(Boolean) */itemKey && /* @static_cast(Boolean) */_currentItem && /* @static_cast(Boolean) */wLiveControls.Video.viewableItemKey && _currentItem.key == itemKey && wLiveControls.Video.viewableItemKey == itemKey)
            {
                ShowVideoControl();
                SetSilverlightVolume();
                if (_$currentPlayer[0].Content && _$currentPlayer[0].Content.VideoControls)
                {
                    _$currentPlayer[0].Content.VideoControls.PlayVideo();
                }
            }
        }

        function Html5Failed(ev)
        {
            /// <summary>
            /// Handles HTML5 player errors.
            /// </summary>
            /// <param name="ev" type="Html5VideoError">Event which contains error information.</param>

            _$videoLoading.hide();

            var currentItemKey = _currentItem.key;
            var errorString = _videoLoadError;

            // If the video has loaded before without an error, then try re-rendering
            // the control, since it might have been it didn't like being reset.
            if (_videoLoadedBefore && !_errorThrown && wLiveControls.Video.viewableItemKey == currentItemKey)
            {
                _videoLoadedBefore = false;
                RenderPlayer();
                return;
            }

            var errorCode = "videoErrorUnknown";
            switch (ev.target.error.code)
            {
                case ev.target.error.MEDIA_ERR_NETWORK:
                    errorString = getString('Video.LoadErrorNetwork');
                    errorCode = "videoErrorNetwork";
                    break;
                case ev.target.error.MEDIA_ERR_DECODE:
                    errorString = getString('Video.LoadErrorDecode');
                    errorCode = "videoErrorDecode";
                    break;
                case ev.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorString = getString('Video.LoadErrorUnsupported');
                    errorCode = "videoErrorUnsupported";
                    if (_silverlightInstalled)
                    {
                        _$videoElement.empty();

                        ResetVideoControl();

                        // Load Silverlight player
                        LoadSilverlightPlayer();

                        return;
                    }

                    break;
            }

            ShowError(errorString, errorCode, currentItemKey);
        }

        function ShowError(errorMessage, errorCode, itemKey)
        {
            /// <summary>
            /// Shows the given error in the notification bar.
            /// </summary>            
            /// <param name="errorMessage" type="String">Error message to display.</param>
            /// <param name="errorCode" type="String" optional="true">Error code for the error.</param>
            /// <param name="itemKey" type="String" optional="true">Key for item which is throwing error.</param>

            _errorThrown = errorMessage;

            if (!itemKey || wLiveControls.Video.viewableItemKey == itemKey)
            {
                // Add error to notification bar.
                viewContext.errorManager.add({
                    $element: jQuery('<span>' + errorMessage.encodeHtml() + '</span>'),
                    priority: 2,
                    type: 4,
                    code: errorCode
                });

                jQuery(wLive.Controls.Video.Events).trigger('error', itemKey);
            }
        }

        function Html5Ended()
        {
            /// <summary>
            /// Handles HTML5 player ended event.
            /// </summary>
            /// <param name="ev" type="Html5VideoError">Event which contains error information.</param>

            VideoCompleted(_currentItem.key);
        }

        function VideoCompleted(itemKey)
        {
            /// <summary>
            /// Notify self view when the video has completed.
            /// </summary>
            /// <param name="itemKey" type="String" optional="true">Key for item which is throwing error.</param>

            if (!itemKey || wLiveControls.Video.viewableItemKey == itemKey)
            {
                jQuery(wLive.Controls.Video.Events).trigger('complete', itemKey);
            }
        }
    }

    // Exposing the player controls height to container
    wLiveControls.Video.ch = c_slPlayerControlsHeight;

    // Object to trigger complete and error events on.
    wLiveControls.Video.Events = {};

    ///
})();

/// <reference path=".../selfview.vsref.js" />
/// Copyright (C) Microsoft Corporation. All rights reserved.

(function ()
{
    var wLiveCore = wLive.Core;
    var CommandManager = wLiveCore.CommandManager;
    var wLiveControls = wLive.Controls;
    var CommandBarHelper = wLiveControls.CommandBarHelper;
    var getString = wLiveCore.AleHelpers.getString;
    var wBaseMaster = window.$baseMaster;

    var _imageStrip = wLiveCore.ImageStrip;
    var wLiveCoreImages = wLiveCore.Images;
    var EditableText = wLiveControls.EditableText;

    var areItemsSame = wLiveCore.SkyDriveItem.areItemsSame;

    // String constants
    var c_searchQt = 'search';
    var c_html = 'html';
    var c_self = 'self';
    var c_selfZoom = 'selfZoom';
    var c_opacity = 'opacity';
    var c_stringEmpty = '';
    // Event constants.
    var c_load = 'load';
    var c_selectstart = 'selectstart';
    var c_keydown = 'keydown';
    var c_click = 'click';
    var c_left = 'left';
    var c_right = 'right';
    var c_zIndex = 'z-index';
    // For opacity
    var c_linear = 'linear';

    var c_selfViewNamespace = ".SelfView";

    var c_enabledArrowClassName = 'enabled';
    var c_darkThemeClassName = 'darkTheme';
    var c_transitionsEnabledClassName = 'transitionsOn';
    var c_fullViewClassName = 'fullView';
    var c_webViewClassName = 'webView';

    // Used to detect IE Modern browser
    var c_isMoBro = $B.IE && $B.V > 9 && window.outerHeight === window.innerHeight;
    var c_isArm = navigator.userAgent.indexOf('ARM') > 0;
    var c_isAppHost = navigator.userAgent.indexOf('MSAppHost') > 0;

    // Touch events
    var c_touchstart = $B.IE ? 'pointerdown' : 'touchstart';
    var c_touchmove = $B.IE ? 'pointermove' : 'touchmove';
    var c_touchend = $B.IE ? 'pointerup' : 'touchend';

    var c_mousemove = 'mousemove';
    var c_mousedown = 'mousedown';
    var c_rightclick = 'contextmenu';
    var c_mouseleave = 'mouseleave';
    var c_mouseup = 'mouseup';
    var c_mousewheel = 'mousewheel DOMMouseScroll';

    var c_focus = 'focus';
    var c_top = 'top';
    var c_bottom = 'bottom';
    var c_eventNamespace = '.self';
    var c_enabletagging = 'enableTagging' + c_eventNamespace;
    var c_disabletagging = 'disableTagging' + c_eventNamespace;
    var c_filmStripOpenHeight = 77;
    var c_infoPaneWidth = 300;
    var c_iterationArrowHeight = 40;

    var c_sideItemPadding = 20;
    var c_topPhotoPadding = 10;
    var c_topVideoPadding = 20;
    var c_bottomPhotoPadding = 10;
    var c_bottomVideoPadding = 20;


    var c_minScreenSize = 240;
    var c_iterationScale = .1; // 10%

    // Distance to move self items for PC experience.
    var c_distanceToTravel = $B.rtl ? -30 : 30;
    // Time for the slide to next self item takes to complete.
    var c_timeToSlide = 300;
    // Interval that you have to hold down mouse to "iterate to next photo".
    var c_mouseDownIntervalTime = 800;
    var c_slideInterval = 50;
    // Extra delay for delayed render past the animation.
    // This needs to be at least as big as the c_slideInterval.
    // so that it does not interfere with the last step of
    // the animation.
    var c_extraDelay = 50;

    // Hover and unhover speeds for iterator arrows
    var c_hoverSpeed = 200;
    var c_unhoverSpeed = 200;

    var c_rightArrowKey = $B.ltr ? 39 : 37;
    var c_leftArrowKey = $B.ltr ? 37 : 39;

    // Number of items to preload
    var c_smallItemsToPreload = 5;
    var c_largeItemsToPreload = $B.Mobile ? 3 : 5;

    // Markup content for the Self View Containers
    var c_previousSideContainerMarkup =
    '<div class="selfps">' +
        '<span class="selfih"></span>' +
        '<span class="selfpa"></span>' +
    '</div>';

    var c_nextSideContainerMarkup =
    '<div class="selfns">' +
        '<span class="selfih"></span>' +
        '<span class="selfna"></span>' +
    '</div>';

    // On Mobile the previous and next side containers need
    // to come outside of the self item container (overlap the info pane).
    // On PC they need to come within it.
    var c_markup =
    ($B.Mobile ? c_previousSideContainerMarkup : c_stringEmpty) +
    '<div>' +
           '<div class="selfi">' +
    /// Slide show cover div (to catch events).
            '<div class="selfssc"></div>' +
    // Background for info pane toggle
            '<div class="selfb"></div>' +
            ($B.Mobile ? c_stringEmpty : c_previousSideContainerMarkup) +
    // Preview self item container.
            '<div class="selfp"></div>' +
            '<div class="selfp"></div>' +
            '<div class="selfp"></div>' +
    // Caption.
            '<div class="selfc"></div>' +
            '<div class="selfc" style="visibility: hidden"></div>' +
            ($B.Mobile ? c_stringEmpty : c_nextSideContainerMarkup) +
        '</div>' +
        ($B.Mobile ? c_nextSideContainerMarkup : c_stringEmpty) +
    // Info pane control container.
        '<div class="selfip"></div>' +
    '</div>' +
    // Film strip control container.
    '<div class="selff"></div>' +
    // Notification bars container    
    '<div class="selfnbs">' +
    // Notification bar.
        '<div class="selfnb"></div>' +
    // Tagging notification bar
        '<div class="selftn"></div>' +
    '</div>';

    var _infoPaneOptions = { fh: true, lp: true, i: true, bici: 'IP1', cs: true, oi: true,
        h: {
            sp: true,
            vf: true
        }
    };

    // Options for caption editable text control.
    var c_editableTextOptions = ($B.Mobile ? null : jQuery.extend({}, EditableText.CaptionOptions,
    {
        c: true,
        hc: true,
        ic: 'selfci'
    }));

    // Static variable that changes.
    var selfViewGlobalState =
    {
        /* Infopane, header and filmstrip are shown in full view, hidden otherwise */
        fullView: true,
        /* Disable animations for film strip */
        disableAnimations: ($B.Full && $B.IE && $B.V < 9),
        useCSS3Animations: !(($B.IE && $B.V < 10) || ($B.Firefox && $B.V < 4)),
        animationDuration: c_timeToSlide,
        animationInterval: c_slideInterval,
        useTouchAnimations: false
    };

    var $window = jQuery(window);
    var $document = jQuery(document);

    // Callbacks to indicate when commands should be hidden.
    var c_isEnabledCallbacks = CommandManager ?
    {
        ViewItem: CommandManager.commandDisabled,
        Rename: CommandManager.commandDisabled,
        NestedDownload: CommandManager.commandDisabled,
        NestedEmbed: CommandManager.commandDisabled,
        Properties: CommandManager.commandDisabled,
        ViewInFolder: CommandManager.commandDisabled
    } : null;

    wLiveControls.SelfView = SelfView;

    /* @bind(wLive.Controls.SelfView) */function SelfView($container, viewContext, selfViewOptions)
    {
        /// <summary>
        /// Initializes a new instance of the SelfView class.
        /// </summary>
        /// <param name="$container" type="jQuery">jQuery Object which contains the containing element to render the Self View within.</param>
        /// <param name="viewContext" type="wLive.Core.ViewContext">View Context Object.</param>
        /// <param name="selfViewOptions" type="wLive.Controls.SelfViewOptions" optional="true">Self view options</param>

        var _this = this;
        var _$viewContext = jQuery(viewContext);
        var _itemHelper = wLiveCore.SkyDriveItemHelper;
        var /* @dynamic */actionManager = viewContext.actionManager;
        var _dataModel = viewContext.dataModel;
        /* @disable(0092) */
        var _notifications = wLiveControls.Notifications;
        /* @restore(0092) */

        // reference to the id='c_base' host div
        var _$cBase = jQuery('#c_base');

        selfViewOptions = selfViewOptions || {};

        if (selfViewOptions.moSelf || $B.Mobile)
        {
            selfViewGlobalState.fullView = false;
        }
        else
        {
            $container.addClass(c_fullViewClassName);
        }

        // Touch animation should be used for moself
        selfViewGlobalState.useTouchAnimations = selfViewOptions.moSelf && (c_isArm || c_isAppHost);

        // TODO: remove
        //selfViewGlobalState.useTouchAnimations = c_isArm;

        // Current State Variables
        var /* @type(wLive.Core.ISkyDriveItem) */_currentFolder;
        var /* @type(String) */_currentFolderKey;
        var /* @type(wLive.Core.ISkyDriveItem) */_currentItem;
        var _currentItemIndex = -1;
        var /* @type(Boolean) */_currentFolderIsFiltered;

        var /* @type(String) */_currentItemVersion;

        // The animated item and animated item index are used to track where
        // we are in the animation.
        // However we only update the currentItem and the currentItemIndex
        // when the real render occurs (high quality photo and info pane).
        // This is because when animation completes an asyncrounous call to update
        // the browser URL occurs which might finish after the user started animating
        // again.
        var /* @type(wLive.Core.ISkyDriveItem) */_animatedItem;
        var _animatedItemIndex = -1;

        var /* @type(wLive.Core.ISkyDriveItem) */_waitingForHashItem;
        var _waitingForHashItemIndex = -1;

        // Slide show state.
        var /* @type(Boolean) */_slideShowRunning;
        var /* @type(Number) */_slideShowTimeoutId;
        var _slideShowSpeed = 3000;
        var _waitingForVideo = false;
        var /* @type(Boolean) */_slideShowStateFilmStripShouldBeToggled;
        var /* @type(Boolean) */_slideShowStateInfoPaneShouldBeToggled;
        var _waitingForPhoto = false;
        var _testImage = new Image();
        var /* @type(String) */_testImageSrc;
        var /* @type(String) */_testNextImageSrc;
        var _$testImage = jQuery(_testImage).bind(c_load, photoReady);

        // State to handle missing search results
        var _missingSearchItemKey = null;
        var _missingSearchAttempts = 0;
        var c_maxMissingSearchAttempts = 2;

        // Set header height contstant
        var c_headerHeight = /* @static_cast(Number) */wBaseMaster && wBaseMaster.getHeaderHeight();

        // Current UI State Variables
        var _taggingBarHeight = 0;
        var _headerHeight = selfViewGlobalState.fullView ? c_headerHeight : 0;
        var _infoPaneWidth = selfViewGlobalState.fullView ? c_infoPaneWidth : 0;
        var _filmStripHeight = selfViewGlobalState.fullView ? c_filmStripOpenHeight : 0;
        var _filmStripRenderCalled;
        var _previousHasMouseOver = true;
        var _nextHasMouseOver = true;
        var /* @type(Boolean) */_mouseMoveOverFlipperOccurred;

        // Timeout Id which captures timeout for removing transitions class
        var /* @type(Number) */_transitionsTimeoutId;

        // Touch apis.
        var /* @type(Boolean) */_listenForTouchMove;
        var /* @type(Boolean) */_lastClickWasSwipe;
        var /* @type(Number) */_startTouchXPosition;
        var /* @type(Number) */_startTouchYPosition;
        var /* @type(Boolean) */_peekingItemNext;
        var /* @type(Boolean) */_peekingItemPrevious;
        var /* @type(Number) */_lastSeenTouchX;
        var /* @type(Number) */_lastSeenTouchX2;
        var /* @type(Boolean) */_validTouchOccurred;
        var c_touchAnimationTime = $B.Full ? 200 : 100;
        var /* @type(Boolean) */_allowMovement = true;
        var /* @type(Boolean) */_css3ClassesAdded = true;

        var /* @type(Boolean) */_isSavingCaption;

        // This is the interval id for the mouse down
        // event on the iterator to allow someone to just
        // hold down mouse to iterate over and over.
        var /* @type(Number) */_mouseDownIntervalId;
        // This is the set timeout id to allow parts of the 
        // self page to be delayed until the animations complete
        // before the renders occur.
        var /* @type(Number) */_delayedRenderTimerId;

        ///
        var /* @type(Number) */_animationStartTime;

        // Stores if we are bouncing past the first or last item.
        var /* @type(Boolean) */_bouncing;

        var _firstRender = true;
        var _firstRenderWithIndex = true;

        var /* @type(Number) */_containerWidth;
        var /* @type(Number) */_containerHeight;
        var /* @type(Number) */_iterationWidth;
        var /* @type(Number) */_itemConstraintWidth;
        var /* @type(Number) */_itemConstraintHeight;

        // Variables to roll our own animation.
        var /* @type(Number) */_animationStopTime;
        var _animationDistance = 0;
        var /* @type(Number) */_oldStartLeft;
        var /* @type(Number) */_currentStartLeft;
        var /* @type(Number) */_animationIntervalId;
        var /* @type(Number) */_animationTimeoutId;

        // Tagging options
        var _taggingOptions = { tm: false, thc: 0, tcc: 0, te: true, at: true, nms: selfViewOptions.moSelf, ht: selfViewOptions.moSelf };
        _infoPaneOptions.to = _taggingOptions;

        // TODO: Remove this
        _taggingOptions.ht = true;

        var /* @type(ObservableArray) */_commandBarList;

        if (CommandBarHelper)
        {
            var $CommandBar = CommandBarHelper.initializeCommandBar(viewContext, '$Sutra.SkyDrive.SelfCommandBar');
            if ($CommandBar)
            {
                _commandBarList = $CommandBar.getDataModel().list;
            }
        }

        $container.html(c_markup);

        // Sub Control Containers
        var _$selfViewItemContainer = jQuery('.selfi', $container).bind(c_selectstart,
        function (ev)
        {
            /// <summary>
            /// Select start event handler.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Selection start event.</param>

            if (!wLiveCore.DomHelpers.isTextInputElement(jQuery(ev.target)))
            {
                // Allow selection in input elements (caption control).
                // IE doesn't use the CSS user-select: none so we have to use this technique instead.
                return false;
            }

            return /* @static_cast(Boolean) */undefined;
        });

        var _$selfViewBackground = jQuery('.selfb', $container);
        var _$previousIterationContainer = jQuery('.selfps', $container);
        var _$tagNotificationBarContainer = jQuery('.selftn', $container);
        var _$notificationBarContainer = jQuery('.selfnb', $container);
        var _$notificationBarsContainer = jQuery('.selfnbs', $container);
        var _$previewContainers = jQuery('.selfp', $container);
        var _$previewContainerCurrent = jQuery(_$previewContainers[0]).attr('role', 'main');
        var _$previewContainerOld = jQuery(_$previewContainers[1]);
        var _$previewContainerTouch = jQuery(_$previewContainers[2]);
        var _$nextIterationContainer = jQuery('.selfns', $container);
        var _$previousArrowContainer = jQuery('.selfpa', $container);
        var _$filmStripContainer = jQuery('.selff', $container);
        var _$nextArrowContainer = jQuery('.selfna', $container);
        var _$infoPaneContainer = jQuery('.selfip', $container);
        var _$captionContainer = jQuery(jQuery('.selfc', $container)[0]);
        var _$measureCaptionContainer = jQuery(jQuery('.selfc', $container)[1]);

        var /* @type(wLiveControls.EditableText) */_captionControl;
        var /* @type(wLiveControls.EditableText) */_captionMeasureControl;
        if (selfViewOptions.moSelf || $B.Mobile)
        {
            _$captionContainer.hide();
        }
        else
        {
            _captionControl = new EditableText(_$captionContainer, viewContext, c_editableTextOptions);
            _captionMeasureControl = new EditableText(_$measureCaptionContainer, viewContext, c_editableTextOptions);

            // Adding web class so that we can apply web only css classes
            $container.addClass(c_webViewClassName);
        }

        if (selfViewGlobalState.useTouchAnimations && selfViewGlobalState.useCSS3Animations)
        {
            addCss3Classes();
        }

        var /* @type(*) */_filmStripControl;
        var /* @type(*) */_selfNotificationBarControl;

        var /* @type(*) */_tagStatusBarControl;

        var _$previousRestArrow;
        var _$previousHoverArrow;
        var _$nextRestArrow;
        var _$nextHoverArrow;

        var _windowScreen = window.screen;

        /* @disable(0092) */
        var _originalDeviceXDPI = _windowScreen.deviceXDPI;
        var _originalDeviceYDPI = _windowScreen.deviceYDPI;
        /* @restore(0092) */

        // Change to OneDrive Dark theme
        /* @disable(0092) */
        if (window['$theme'])
        {
            $theme.previewTheme(['SkyDriveDark2', null, null, $theme.version], false, null);
            $container.addClass(c_darkThemeClassName);
            window.$CommandBar && $CommandBar.addLightHover();
        }
        /* @restore(0092) */

        // Resize view after WebIM shows and hides
        if ("undefined" != typeof $WLXIM)
        {
            $Do.when('$WLXIM.SidebarCreated', 0, function ()
            {
                jQuery($WLXIM.sidebar).bind("onSidebarOpenCompletedEvent" + c_selfViewNamespace, _this.resize);
                jQuery($WLXIM.sidebar).bind("onSidebarCloseCompletedEvent" + c_selfViewNamespace, _this.resize);
            });
        }

        function startSlideShow()
        {
            /// <summary>
            /// Starts the slide show.
            /// </summary>

            Debug.assert(!_slideShowRunning, 'Slide show should not be running yet');

            // Only start the slide show if we know the index in the folder.
            if (_currentItemIndex != -1)
            {
                _slideShowRunning = true;

                _slideShowStateFilmStripShouldBeToggled = _filmStripHeight != 0;
                _slideShowStateInfoPaneShouldBeToggled = !viewContext.infoPaneClosed;

                // Hide some UI.
                _$nextIterationContainer.hide();
                _$previousIterationContainer.hide();
                _$infoPaneContainer.hide();

                if (_slideShowStateFilmStripShouldBeToggled)
                {
                    toggleIterator();
                }

                // Change background color
                _$selfViewItemContainer.addClass('selfis');

                _slideShowTimeoutId = setTimeout(slideShowNext, _slideShowSpeed);

                makeFullScreen(document.documentElement);
            }
        }

        function slideShowNext()
        {
            /// <summary>
            /// Goes to next item in slide show.
            /// </summary>

            clearTimeout(_slideShowTimeoutId);
            _slideShowTimeoutId = null;

            photoReady();

            if (!_waitingForVideo && !_waitingForPhoto)
            {
                var childCount = _currentFolder.getChildren().getCount();

                if (childCount - 1 > _animatedItemIndex)
                {
                    switchToIndex(_animatedItemIndex + 1);
                }
                else
                {
                    switchToIndex(0);
                }
            }
        }

        function videoReady(ev, itemKey)
        {
            /// <summary>
            /// Lets us know that we are no longer waiting for video.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Event that triggered error or complete.</param>
            /// <param name="itemKey" type="String">Item key that error/complete occurred for</param>

            if (_animatedItem.key === itemKey)
            {
                _waitingForVideo = false;

                if (_slideShowRunning && !_slideShowTimeoutId)
                {
                    // Immediately show next item.
                    slideShowNext();
                }
            }
        }

        function photoReady()
        {
            /// <summary>
            /// During Slideshow if we are waiting for the current or next image to load
            /// this event allows us to check both current and next photo.
            /// </summary>

            if (_waitingForPhoto &&
                (!_testImageSrc || wLiveCoreImages.hasLoadedImage(_testImageSrc)) &&
                (!_testNextImageSrc || wLiveCoreImages.hasLoadedImage(_testNextImageSrc)))
            {
                _waitingForPhoto = false;

                if (_slideShowRunning && !_slideShowTimeoutId)
                {
                    // Immediately show next item.
                    slideShowNext();
                }
            }
        }

        function stopSlideShow()
        {
            /// <summary>
            /// Stops the slide show.
            /// </summary>

            if (_slideShowRunning)
            {
                clearTimeout(_slideShowTimeoutId);
                _slideShowTimeoutId = null;

                _slideShowRunning = false;

                // Reset UI.
                _$nextIterationContainer.show();
                _$previousIterationContainer.show();
                _$infoPaneContainer.show();

                if (_slideShowStateFilmStripShouldBeToggled)
                {
                    toggleIterator();
                }

                // Change background color
                _$selfViewItemContainer.removeClass('selfis');

                // Exit browser full screen mode
                // WinLive#577639 Adding timeout as some browsers resize the browser if we 
                // don't give it time between the click and exiting fullscreen
                setTimeout(exitFullScreen, 100);
            }
        }

        // TODO: Move this to a helper class
        function makeFullScreen(element)
        {
            /// <summary>
            /// Makes the given element go to browser full screen if possible.
            /// </summary>

            /* @disable(0092) */
            if (element.requestFullscreen)
            {
                element.requestFullscreen();
            }
            else if (element.mozRequestFullScreen)
            {
                element.mozRequestFullScreen();
            }
            else if (element.webkitRequestFullScreen)
            {
                element.webkitRequestFullScreen();
            }
            else if (element.msRequestFullScreen)
            {
                element.msRequestFullScreen();
            }
            /* @restore(0092) */
        }

        // TODO: Move this to a helper class
        function exitFullScreen()
        {
            /// <summary>
            /// Exits the browser full screen if possible.
            /// </summary>

            var doc = document;

            /* @disable(0092) */
            if (doc.exitFullscreen)
            {
                doc.exitFullscreen();
            }
            else if (doc.mozCancelFullScreen)
            {
                doc.mozCancelFullScreen();
            }
            else if (doc.webkitCancelFullScreen)
            {
                doc.webkitCancelFullScreen();
            }
            else if (doc.msCancelFullScreen)
            {
                doc.msCancelFullScreen();
            }
            /* @restore(0092) */
        }

        function createImage(imageSrc, imageAltText)
        {
            /// <summary>
            /// Create an image with the correct source and alt text
            /// </summary>
            /// <param name="imageSrc" type="String">Image source</param>
            /// <param name="imageAltText" type="String">Image alt text</param>
            /// <returns type="jQuery">jQuery image element</returns>

            return jQuery('<img src="' + imageSrc.encodeHtmlAttribute() + '" alt="' + imageAltText.encodeHtmlAttribute() + '" />');
        }

        var previousArrowString;
        var nextArrowString;

        if (selfViewOptions.moSelf)
        {
            var selfViewOptionsImages = selfViewOptions.images;
            var selfViewOptionsStrings = selfViewOptions.strings;

            previousArrowString = selfViewOptionsStrings.Previous;
            nextArrowString = selfViewOptionsStrings.Next;

            // MoSelf overrides our css, and sets hover/rest/pressed states on their transparent image, so we just set all states to a single image.
            _$previousHoverArrow = _$previousRestArrow = createImage(selfViewOptionsImages.previousEnabled, previousArrowString);
            _$nextHoverArrow = _$nextRestArrow = createImage(selfViewOptionsImages.nextEnabled, nextArrowString);
        }
        else
        {
            previousArrowString = getString('Previous');
            nextArrowString = getString('Next');

            _$previousRestArrow = jQuery(_imageStrip.getImage('previousRest', previousArrowString));
            _$previousHoverArrow = jQuery(_imageStrip.getImage('previousHover', previousArrowString));
            _$nextRestArrow = jQuery(_imageStrip.getImage('nextRest', nextArrowString));
            _$nextHoverArrow = jQuery(_imageStrip.getImage('nextHover', nextArrowString));
        }

        _$previousRestArrow.addClass('selfpar');
        _$previousHoverArrow.addClass('selfpah');
        _$nextRestArrow.addClass('selfnar');
        _$nextHoverArrow.addClass('selfnah');

        _$previousArrowContainer.append(_$previousRestArrow);
        _$previousArrowContainer.append(_$previousHoverArrow);
        _$nextArrowContainer.append(_$nextRestArrow);
        _$nextArrowContainer.append(_$nextHoverArrow);

        if ($B.Full)
        {
            // PC UI specific logic

            // Prepare the next previewContainer for first animate.
            _$previewContainerOld.css({ opacity: 0 });
            _$previewContainerTouch.css({ opacity: 0 });

            // Height of these controls is defined differently in Mobile experience.
            _$previousArrowContainer.height(c_iterationArrowHeight);
            _$filmStripContainer.height(c_filmStripOpenHeight);
            _$nextArrowContainer.height(c_iterationArrowHeight);

            _$captionContainer.css(c_bottom, _filmStripHeight);

            if (!selfViewOptions.moSelf)
            {
                // Need to disable for moself
                /* @disable(0092) */

                // Only instanciate a film strip and tag status bar control in PC experience.
                // The classes don't even exist in the mobile one.

                _filmStripControl = new wLiveControls.FilmStrip(_$filmStripContainer, viewContext, selfViewGlobalState);
                _tagStatusBarControl = new wLiveControls.TagStatusBar(_$tagNotificationBarContainer, viewContext, _taggingOptions);
                /* @restore(0092) */

                // Bind scroll events for the film strip.
                var mouseScroll = function (ev)
                {
                    /// <summary>
                    /// Tell the FilmStrip to scroll.
                    /// </summary>
                    /// <param name="ev" type="HTMLEvent">The mousewheel event.</param>

                    // Don't scroll if we're not in the full view.
                    /* @disable(0092) */
                    selfViewGlobalState.fullView && _filmStripControl && _filmStripControl.mouseScroll(ev.originalEvent.wheelDelta || ev.originalEvent.detail);
                    /* @restore(0092) */
                };

                // Scrolling can occur from the main view area, or the FilmStrip container.
                _$selfViewItemContainer.bind(c_mousewheel, function (ev)
                {
                    mouseScroll(ev);
                });

                _$filmStripContainer.bind(c_mousewheel, function (ev)
                {
                    mouseScroll(ev);
                });
            }

            // Bind up some PC only events
            _$previousIterationContainer.bind(c_mousemove, mouseMovePrevious);

            _$nextIterationContainer.bind(c_mousemove, mouseMoveNext);

            $document.bind(c_mousemove, documentMouseMove);

            _$viewContext.bind(c_enabletagging, enableTaggingHandler);
            _$viewContext.bind(c_disabletagging, disableTaggingHandler);

            // Bind events to detect exit of fullscreen
            var doc = document;

            /* @disable(0092) */
            $document.bind("fullscreenchange" + c_selfViewNamespace, function ()
            {
                if (!doc.fullscreen)
                {
                    stopSlideShow();
                }
            });

            $document.bind("mozfullscreenchange" + c_selfViewNamespace, function ()
            {
                if (!doc.mozFullScreen)
                {
                    stopSlideShow();
                }
            });

            $document.bind("webkitfullscreenchange" + c_selfViewNamespace, function ()
            {
                if (!doc.webkitIsFullScreen)
                {
                    stopSlideShow();
                }
            });

            $document.bind("msfullscreenchange" + c_selfViewNamespace, function ()
            {
                if (!doc.msFullScreen)
                {
                    stopSlideShow();
                }
            });
            /* @restore(0092) */

            _$viewContext.bind('toggleProperties', onToggleProperties);
        }

        var _infoPaneControl;

        // Initialize the sub controls.
        if (!selfViewOptions.moSelf)
        {
            // We have to disable this for mo self
            /* @disable(0092) */
            _selfNotificationBarControl = new wLiveControls.SelfNotificationBar(_$notificationBarContainer, viewContext);

            _infoPaneControl = new wLiveControls.InfoPane(_$infoPaneContainer, viewContext, _infoPaneOptions);

            _$viewContext.bind('slideshow', startSlideShow);
            /* @restore(0092) */
        }

        var _selfItemControlCurrent = new wLiveControls.SelfItem(_$previewContainerCurrent, viewContext, _taggingOptions);
        var _selfItemControlOld = new wLiveControls.SelfItem(_$previewContainerOld, viewContext, _taggingOptions);
        var _selfItemControlTouch = new wLiveControls.SelfItem(_$previewContainerTouch, viewContext, _taggingOptions);

        jQuery(wLiveControls.Video.Events).bind('error', videoReady);
        jQuery(wLiveControls.Video.Events).bind('complete', videoReady);

        // Hide the scroll bars in IE.
        // In Mobile apply the background color as well.
        var _$html = jQuery(c_html).addClass(c_self);

        var _$document = jQuery(document);

        // Bind up some events
        // Note: IE 8 does not work with $window;
        var _$keyDownElement = _$document;

        var _$body = jQuery('body');

        var _$touchElement = _$selfViewItemContainer;

        // Attach touch events
        _$touchElement.bind(c_touchstart, touchStart);
        _$touchElement.bind(c_touchmove, touchMove);
        _$touchElement.bind(c_touchend, touchEnd);

        // TODO: Remove this
        _$touchElement.bind('mousedown', touchStart);
        _$touchElement.bind('mousemove', touchMove);
        _$touchElement.bind('mouseup', touchEnd);

        _$keyDownElement.bind(c_keydown, keyDownChecker);
        _$keyDownElement.bind(c_click, mouseDownChecker);

        _dataModel.addListener(wLiveCore.DataModel.dataChangedEvent, dataChanged, /* context: */undefined, 'SkyDriveWeb_Internal_Control_SelfView_DataChanged');
        _$selfViewBackground.bind(c_click, toggleIteratorClick);

        _$previewContainers.bind(c_click, toggleIteratorIfPhoto);
        if (!selfViewOptions.moSelf && $B.Full)
        {
            _$previewContainers.bind(c_rightclick, showContextMenu);
        }

        _$selfViewBackground.bind(c_mousedown, mouseDownForToggle);
        _$previewContainers.bind(c_mousedown, mouseDownForToggle);

        // Add aria labels.
        _$previousIterationContainer.attr('role', 'button');
        _$previousIterationContainer.attr('aria-label', previousArrowString);
        _$nextIterationContainer.attr('role', 'button');
        _$nextIterationContainer.attr('aria-label', nextArrowString);

        if (!selfViewOptions.moSelf)
        {
            _$previousIterationContainer.bind(c_mousedown, startGoPrevious);
            _$previousIterationContainer.bind(c_mouseleave, stopIteratingViaMouseDown);
            _$previousIterationContainer.bind(c_mouseup, stopIteratingViaMouseDown);
            _$nextIterationContainer.bind(c_mousedown, startGoNext);
            _$nextIterationContainer.bind(c_mouseleave, stopIteratingViaMouseDown);
            _$nextIterationContainer.bind(c_mouseup, stopIteratingViaMouseDown);
        }
        else
        {
            // MoSelf needs to listen to click instead of mouseDown so that
            // they are compliant with Aria narration.
            _$previousIterationContainer.bind(c_click, goPrevious);
            _$nextIterationContainer.bind(c_click, goNext);
        }

        _$previewContainers.bind(c_touchstart, preventMouseForPhoto);
        /*
        // IE 10 needs us to prevent mouse on touch start.
        // This means that our click will not fire if they did a quick tap.
        // So we want to attach the guesture tap.
        // However they fire the tap event too often.
        _$previewContainers.bind('MSGestureTap', function (ev)
        {
        //$Debug.trace('tap photo');
        toggleIteratorIfPhoto(ev);
        });
        */

        /*
        // The previous and next arrows keep getting focus in IE 10
        // when a user taps on them.
        // The order of events is MouseEnter (hover), Touch Start (which we can call unhover), touch move, touch end, mouse move.
        // In Touch Start we can try preventing the mouse.
        // However it does not prevent the mouse move.
        _$previousIterationContainer.bind(c_touchstart, preventMouseForIterators);
        _$previousIterationContainer.bind('MSGestureTap', function (ev)
        {
        //$Debug.trace('tap previous');
        goPrevious();
        });
        _$nextIterationContainer.bind(c_touchstart, preventMouseForIterators);
        _$nextIterationContainer.bind('MSGestureTap', function (ev)
        {
        //$Debug.trace('tap next');
        goNext();
        });
        */

        sutra(_$previousIterationContainer, '$Sutra.SkyDrive.PreviousHover');
        sutra(_$previousArrowContainer, '$Sutra.SkyDrive.PreviousArrow');
        sutra(_$nextIterationContainer, '$Sutra.SkyDrive.NextHover');
        sutra(_$nextArrowContainer, '$Sutra.SkyDrive.NextArrow');

        if ($B.Full)
        {
            // Show the header if it should be open, otherwise, trigger clean view
            if (selfViewGlobalState.fullView)
            {
                wBaseMaster.toggleFixedHeader(true);
            }
            else
            {
                triggerCleanView();
            }
        }

        function preventMouseForPhoto(ev)
        {
            /// <summary>
            /// Prevent the mouse events when a touch event occurs.
            /// This is used to prevent the "click" from firing on
            /// the self photo (toggling the film strip) when a swipe occurs.
            /// If we are in tagging mode however, we don't want to prevent it,
            /// as that would disable tagging.
            /// </summary>

            /* @disable(0092) */
            if (ev.originalEvent.preventDefault && ((ev.originalEvent.pointerType == 2) || (ev.originalEvent.pointerType === 'touch')) && _animatedItem && _animatedItem.photo && !_taggingOptions.tm)
            {
                //$Debug.trace('Prevent mouse');
                ev.originalEvent.preventDefault();
            }
            /* @restore(0092) */
        }

        /*
        function preventMouseForIterators(ev)
        {
        /// <summary>
        /// Prevent the mouse events to try and prevent the mouse move event from 
        /// firing on the next/previous iteration arrows on a tap however
        /// that does not work.
        /// </summary>

        if (ev.originalEvent.preventDefault && ev.originalEvent.pointerType == 2)
        {
        //$Debug.trace('Prevent mouse');
        ev.originalEvent.preventDefault();

        // In IE 10 the mouse enter happens before the touchstart.
        // This means that the hoverNext or hoverPrevious have already been called.
        // We can remove the Arrows in this case.
        // Unfortunately due to preventDefault from not canceling the mouse move
        // event this approach does not work.
        unhoverNext();
        unhoverPrevious();
        }
        }
        */


        _this.isLoaded = function ()
        {
            /// <summary>
            /// Returns if the view completely loaded.
            /// </summary>
            /// <returns type="Boolean">Is loaded</returns>

            // Note the self view is "loaded if the image
            // or video is loaded.
            // We do not check the film strip nor comment control.
            return _selfItemControlCurrent.isLoaded();
        };

        _this.render = function (item)
        {
            /// <summary>
            /// Render is called from Page Controller when the Item in URL is changed.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">item</param>

            Debug.assert(item, 'Render must be passed an Item');
            var sameItemAsWaiting = areItemsSame(_waitingForHashItem, item);

            var sameItemAsCurrent = areItemsSame(_currentItem, item) && item.getVersion() == _currentItemVersion;
            var sameItemAsAnimated = areItemsSame(_animatedItem, item);

            var parentFolder = _dataModel.getItem(item.parentKey);
            Debug.assert(parentFolder, 'parent should be here');

            var parentFolderKey = item.parentKey;

            // If the user navigates directly to the self view of a non mixed content foler
            // the "primed response" returns undefined for photoCount.
            // We have to make calls to get the siblings and so we just start filtering assuming that it is 
            // a mixed content scenario.
            // However after the first page comes back and we know it is not mixed the photo count will
            // equal the childCount and we didn't need to filter.
            // We should just keep the filter on so we don't have to make an extra call before showing the self item.
            var keepFilteringParent = _currentFolderIsFiltered && areItemsSame(_currentFolder, parentFolder);

            // When we navigate directly to the self view the parent will be there but the
            // document count will be unknown so filter always.

            // BUGBUG: 412142 have to use < instead of != until the photoCount is filtered (by hidden items) like the getCount result is.
            if (keepFilteringParent || parentFolder.folder.photoCount === undefined || parentFolder.folder.photoCount < parentFolder.getChildren().getCount())
            {
                // Override the default set key to filter to photos/videos.
                /* @disable(0092) */
                var setKeyParts = wLiveCore.SkyDriveItem.getSetKeyParts(wLiveCore.SkyDriveItem.getDefaultSetKey());
                var filteredSetKey = wLiveCore.SkyDriveItem.getSetKey(setKeyParts.sb, null, wLiveCore.JSONConstants.FilterType.PhotosAndVideos /*Photos and Videos */, wLiveCore.PageController.getInstance().getGroupByParam(), setKeyParts.sd);
                wLiveCore.SkyDriveItem.setDefaultSetKey(filteredSetKey);
                /* @restore(0092) */
                _currentFolderIsFiltered = true;
            }
            else
            {
                _currentFolderIsFiltered = false;
            }

            // Clear selection, so that we don't get any weird behavior when coming in from set view
            viewContext.selectionManager.deselectAll();

            // If we are already showing the current item just ignore the render.
            if (!sameItemAsCurrent || sameItemAsWaiting || !_currentFolder || _currentItemIndex == -1)
            {
                if (!sameItemAsCurrent)
                {
                    // Clear errors from the page
                    viewContext.errorManager.clear();

                    var eventName = 'ReadView.Content.File.Photo';

                    if (item.video)
                    {
                        eventName = 'ReadView.Content.File.Movie';
                    }

                    $BSI.reportEvent(eventName,
                    {
                        ViewMethod: 'oneup',
                        ResourceId: item.id,
                        // Don't include the '.' in .jpg
                        Extension: (item.extension ? item.extension.replace('\.', c_stringEmpty) : c_stringEmpty)
                    });
                }

                if (sameItemAsWaiting)
                {
                    Debug.assert(_waitingForHashItemIndex != -1, 'How is the waiting for hash item index -1?');

                    // Must happen after relationship key is set.
                    renderDelayedItem();
                }
                // If we are animating to the exact item anyways just ignore the render.                
                else if (!sameItemAsAnimated || _animatedItemIndex == -1)
                {
                    // Now after applying the filter (if necessary) make the request for the index.
                    var itemIndex = parentFolder.getChildren().indexOf(item);

                    if (/* @static_cast(Boolean) */_currentFolder && /* @static_cast(Boolean) */_animatedItem && _currentItemIndex != -1 && _currentFolderKey == parentFolderKey && itemIndex != -1)
                    {
                        // This is the same parent and it is not the "fix current item" case where _animatedItem == null.
                        // Make sure to do animation.
                        switchToIndex(itemIndex);
                    }
                    else
                    {
                        var allowVideoToContinuePlaying =  /* @static_cast(Boolean) */_currentItem && _currentItem.key == item.key;
                        stopAnimations(allowVideoToContinuePlaying);

                        _waitingForHashItem = null;
                        _waitingForHashItemIndex = -1;

                        _animatedItem = _currentItem = item;
                        _animatedItemIndex = _currentItemIndex = itemIndex;
                        _currentFolder = parentFolder;
                        _currentFolderKey = parentFolderKey;
                        _currentItemVersion = item.getVersion();

                        if (_animatedItem)
                        {
                            if (_animatedItem.video)
                            {
                                _waitingForVideo = true;
                            }
                            else
                            {
                                _waitingForPhoto = true;
                            }
                        }

                        updateZIndex();

                        if ($B.Mobile)
                        {
                            // At the end of the render scroll top.
                            window.scrollTo(0, 1);

                            if (selfViewGlobalState.fullView)
                            {
                                // Start next/previous in right state.
                                hoverNext();
                                hoverPrevious();
                            }
                        }

                        resizeContainers();

                        renderSubControls();
                    }
                }
            }
        };

        _this.resize = function ()
        {
            /// <summary>
            /// Position containers resizes the containers
            /// when there is a toggle (info pane or FilmStrip)
            /// or when there is a browser resize.
            /// </summary>

            resizeContainers();

            if (_filmStripControl)
            {
                // We need to disable the error here since this will only happen in the none mobile code
                /* @disable(0092) */
                _filmStripControl.resize();
                /* @restore(0092) */
            }

            if (_tagStatusBarControl)
            {
                // We need to disable the error here since this will only happen in the none mobile code
                /* @disable(0092) */
                _tagStatusBarControl.resize();
                /* @restore(0092) */
            }

            if (_infoPaneControl)
            {
                /* @disable(0092) */
                _infoPaneControl.resize();
                /* @restore(0092) */
            }

            if (_captionControl)
            {
                _captionControl.resize();
                _captionMeasureControl.resize();
            }

            _selfItemControlCurrent.resize();
        };

        function determineContainerSize(item)
        {
            /// <summary>
            /// Determines the container size for the self item.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render in container</param>

            var /* @type(Number) */windowHeight;
            var /* @type(Number) */windowWidth;

            if ($B.Full)
            {
                if (selfViewOptions.moSelf)
                {
                    // MoSelf uses container size not window size.
                    windowHeight = $container.height();
                    windowWidth = $container.width();
                }
                else
                {
                    // This is here as a default and so we calculate width/height correctly (without scroll bars).
                    _$html.removeClass(c_selfZoom);

                    windowHeight = $window.height() - _headerHeight;
                    windowWidth = $container.width();

                    /* @disable(0092) */
                    var deviceXDPI = _windowScreen.deviceXDPI;
                    var deviceYDPI = _windowScreen.deviceYDPI;
                    var logicalXDPI = _windowScreen.logicalXDPI;
                    var logicalYDPI = _windowScreen.logicalYDPI;
                    /* @restore(0092) */

                    // When the user zooms in they want the photo to get larger.
                    // However by default we will just think the screen size is smaller
                    // and the photo will get smaller as the info pane and film strip get larger.
                    // To fix this we compare the deviceXDPI.
                    // There are 3 dpi properties (deviceXDPI, logicalXDPI, and systemXDPI)
                    if (deviceXDPI && deviceYDPI && logicalXDPI && logicalYDPI &&
                        (deviceXDPI >= logicalXDPI || deviceYDPI >= logicalYDPI))
                    {
                        // The zoom feature only is necessary for zoom in.
                        // Zoom out already works great.
                        _originalDeviceXDPI = Math.min(_originalDeviceXDPI, deviceXDPI);
                        _originalDeviceYDPI = Math.min(_originalDeviceYDPI, deviceYDPI);

                        if (deviceYDPI != _originalDeviceYDPI || deviceXDPI != _originalDeviceXDPI)
                        {
                            windowWidth = Math.floor(1.0 * windowWidth * deviceXDPI / _originalDeviceXDPI);
                            windowHeight = Math.floor(1.0 * windowHeight * deviceYDPI / _originalDeviceYDPI);

                            _$html.addClass(c_selfZoom);
                        }
                    }

                    $container.height(windowHeight);
                }

                _containerWidth = windowWidth - _infoPaneWidth;
                _containerHeight = windowHeight - _filmStripHeight - _taggingBarHeight;
            }
            else
            {
                windowHeight = /* @static_cast(Number) */$window.height();
                windowWidth = /* @static_cast(Number) */$window.width();

                // We want window height to equal the
                // height of the browser screen space when the
                // address bar is scrolled away.

                // This is hard to do if the address bar is showing.
                // This is why the window.scrollTo is so important.

                // Here are the properties we tried when the
                // address bar was showing:
                // window.screenY
                // document.body.clientHeight
                // window.outerHeight
                // window.innerHeight
                // document.documentElement.clientHeight
                // window.screen.availHeight
                // window.screen.height
                // jQuery(window).height()

                // These are the calculations we found to get the value
                // when the address bar is shown:
                // Android is: window.outerHeight / 2
                // iOS is jQuery(window).height() + 60

                if ($B.IE)
                {
                    // IE Mobile does not return valid height in any JS API.

                    if ($B.V < 9)
                    {
                        // IE 9 (Windows Phone 7 Mango)
                        // Always shows 72px (of real resolution) chrome in height
                        // Then multiply by the scale since the screen is 480x800 pretending to be 320 or 480 width.
                        // Portrait height = (800 - 72) * 320/480 = 485
                        // Landscape height = (480 - 72) * 480/800 = 244
                        windowHeight = windowWidth == 320 ? 485 : 244;
                    }
                    else
                    {
                        // IE 7 (Windows Phone 7)
                        // In portrait it shows 72 + 32 + 48 chrome in height.
                        // In landscape there is no chrome.
                        // Then multiply by the scale since the screen is 480x800 pretending to be 320 or 480 width.
                        // Portrait height = (800 - 72 - 32 - 48) * 320 / 480 = 432
                        // Landscape height = 480 * 480/800 = 288
                        windowHeight = windowWidth == 320 ? 432 : 288;
                    }
                }

                // Make mobile work with ?width=320 query string.
                var testWidth = jQuery(document.body).width();
                // However the test width does not grow/shrink when the phone is rotated.
                // so we have to take the minimum value.
                _containerWidth = Math.max(c_minScreenSize, Math.min(windowWidth, testWidth));
                _containerHeight = Math.max(c_minScreenSize, windowHeight);
            }

            _iterationWidth = Math.floor(_containerWidth * c_iterationScale);

            if ($B.Mobile || selfViewOptions.moSelf)
            {
                _itemConstraintWidth = _containerWidth;
                _itemConstraintHeight = _containerHeight;
            }
            else
            {
                // PC has padding
                _itemConstraintWidth = _containerWidth - c_sideItemPadding * 2;

                // Padding is different for a photo than a video. We want to have the photo have as little
                // padding as possible, yet we need to leave space above and below video where user can click
                // in order to go into clean view, since clicking on video doesn't invoke clean view (clicking
                // on a photo does)
                if (item.video)
                {
                    _itemConstraintHeight = _containerHeight - c_topVideoPadding - c_bottomVideoPadding;
                }
                else
                {
                    _itemConstraintHeight = _containerHeight - c_topPhotoPadding - c_bottomPhotoPadding;
                }

                if (_captionMeasureControl)
                {
                    if (item)
                    {
                        // Have to remove the height of the caption.
                        _captionMeasureControl.render(item);
                    }

                    // Constraint height needs to be adjusted to fit the caption if there is one. We need to get the 
                    // difference of caption height (plus 15 extra for margin top/bottom of caption control) and the
                    // bottom item padding, and reduce it from the constraint height
                    var extraCaptionPadding = Math.max(0, (_$measureCaptionContainer.outerHeight() + 15) - (item.video ? c_bottomVideoPadding : c_bottomPhotoPadding));
                    _itemConstraintHeight -= extraCaptionPadding;
                }
            }
        }

        function resizeContainers()
        {
            /// <summary>
            /// Sets the width/heights of the container elements.
            /// </summary>

            determineContainerSize(_animatedItem);

            if ($B.Full)
            {
                _$selfViewItemContainer.width(_containerWidth);
                _$infoPaneContainer.height(_containerHeight);
                _$infoPaneContainer.css('margin-top', _taggingBarHeight);

                // Resize the Previous/Next iteration layers
                _$previousIterationContainer.width(_iterationWidth);
                _$nextIterationContainer.width(_iterationWidth);
            }
            else
            {
                // This is only here so that ?width=320 works.
                _$selfViewItemContainer.width(_containerWidth);
                _$infoPaneContainer.width(_containerWidth);
            }

            // Resize the Next/Previous iteration arrows.
            var arrowTop = (_containerHeight - c_iterationArrowHeight);
            if ($B.Full)
            {
                if (c_isMoBro && !selfViewOptions.moSelf)
                {
                    // Bug WinLive#579915 - For Modern IE10, we need to move the flippers up to avoid colliding with the browser arrows
                    arrowTop = Math.floor(arrowTop * .35);
                }
                else
                {
                    arrowTop = Math.floor(arrowTop / 2);
                }
                _$previousArrowContainer.css(c_top, arrowTop + _taggingBarHeight);
                _$nextArrowContainer.css(c_top, arrowTop + _taggingBarHeight);
            }
            else
            {
                arrowTop = Math.floor(arrowTop * .35);
                _$previousIterationContainer.css(c_top, arrowTop + _taggingBarHeight);
                _$nextIterationContainer.css(c_top, arrowTop + _taggingBarHeight);
            }

            // Stop all animations
            stopAnimations(true);

            resizePreviewContainer(_animatedItem, _$previewContainerCurrent);

            centerContainer(_animatedItem, _$previewContainerCurrent);
        }

        function updateZIndex()
        {
            /// <summary>
            /// Places photos below iterators and tagging mode and videos above iterators.
            /// </summary>

            // Current self item is 1

            if (_taggingOptions.tm || /* @static_cast(Boolean) */_currentItem.video)
            {
                // In tagging mode we move it to 0.
                _$previousIterationContainer.css(c_zIndex, 1);
                _$nextIterationContainer.css(c_zIndex, 1);
            }
            else
            {
                // Normally iterators are 2 (above self item).
                _$previousIterationContainer.css(c_zIndex, 3);
                _$nextIterationContainer.css(c_zIndex, 3);
            }
        }

        function resizePreviewContainer(item, $container)
        {
            /// <summary>
            /// Resize Preview Container.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to render in container</param>
            /// <param name="$container" type="jQuery">Container for item.</param>

            var imgWidth = 0;
            var imgHeight = 0;

            if (item)
            {
                var itemConstraintHeight = _itemConstraintHeight;
                var itemConstraintWidth = _itemConstraintWidth;

                if ($B.Full && (_taggingOptions.tm || /* @static_cast(Boolean) */item.video))
                {
                    if (selfViewOptions.moSelf)
                    {
                        // In tagging or video we use extra constraint on each side for the arrow size.
                        // 40 (arrow width) * 2 = 80
                        itemConstraintWidth -= 80;
                    }
                    else
                    {
                        // In tagging or video we use extra constraint on each side for the arrow size.
                        // 40 (arrow width) * 2 - 20 (standard padding)* 2 = 40
                        itemConstraintWidth -= 40;
                    }
                }

                if ($B.Full && /* @static_cast(Boolean) */item.video)
                {
                    // Adding extra constraints for the video to accomadate the video controls.
                    itemConstraintHeight -= 30;
                }

                if (item.video)
                {
                    imgWidth = item.video.width;
                    imgHeight = item.video.height;
                }
                else if (item.photo)
                {
                    imgWidth = item.photo.width;
                    imgHeight = item.photo.height;
                }
                else
                {
                    // Self View is filtering out non video/photos
                    // later in the milestone.
                    // However we probably want to cover this case
                    // in a larger scenario when photo and video
                    // doesn't have a thumbnail.
                    // This will be fixed after we get the image strip
                    // work item checked in.
                }

                if (selfViewOptions.moSelf)
                {
                    // Mo Self like Mo Photo supports stretching images 2x.
                    imgWidth *= 2;
                    imgHeight *= 2;
                }

                var size = getForcedSize(item, imgWidth, imgHeight, itemConstraintWidth, itemConstraintHeight);

                $container.height(size.h);
                $container.width(size.w);

                // Remember width/height as expandos for performance improvement in touch move.
                $container[0].h = size.h;
                $container[0].w = size.w;
            }
        }

        function centerContainer(item, $container, offsetWidth, touchAnimation)
        {
            /// <summary>
            /// Center Container
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to center in container</param>
            /// <param name="$container" type="jQuery">Container to center</param>
            /// <param name="offsetWidth" type="Number" optional="true">Offset width from center</param>
            /// <param name="touchAnimation" type="Boolean" optional="true">Does the X positioning with animation</param>

            // Force offset to be a number
            offsetWidth = offsetWidth || 0;

            var containerData = $container[0];

            var containerHeight = containerData.h || /* @static_cast(Number) */$container.height();
            var containerWidth = containerData.w || /* @static_cast(Number) */$container.width();

            // Center
            var positionTop;
            var positionLeft;

            if ($B.Full)
            {
                positionTop = Math.floor((_itemConstraintHeight - containerHeight) / 2) + _taggingBarHeight;
                positionLeft = Math.floor((_itemConstraintWidth - containerWidth) / 2) + offsetWidth;

                // Don't add padding for moSelf.
                if (!selfViewOptions.moSelf)
                {
                    positionTop += item && item.video ? c_topVideoPadding : c_topPhotoPadding;
                    positionLeft += c_sideItemPadding;
                }
            }
            else
            {
                // Mobile centers the photo 1/2 way higher than normal so
                // that you can see more of the info pane.
                positionTop = Math.floor((_itemConstraintHeight - containerHeight) / 4);
                positionLeft = Math.floor((_itemConstraintWidth - containerWidth) / 2) + offsetWidth;

                var heightOfPaddingPlusSelfItem = positionTop + containerHeight;
                _$selfViewItemContainer.height(heightOfPaddingPlusSelfItem);
                _$infoPaneContainer.css(c_top, heightOfPaddingPlusSelfItem);
            }

            if (containerData[c_top] != positionTop)
            {
                $container.css(c_top, positionTop);
            }

            if (touchAnimation)
            {
                // Animate to the location if needed.
                $container.animate({ left: positionLeft }, c_touchAnimationTime);
            }
            else
            {
                $container.css(c_left, positionLeft);
            }

            // Store it on the container as well so during slide we can check it.
            $container[0][c_left] = positionLeft;
            $container[0][c_top] = positionTop;
        }

        _this.dispose = function ()
        {
            /// <summary>
            /// Dispose sub controls and clean up bindings.
            /// </summary>

            _$testImage.unbind(c_load, photoReady);
            _$testImage = null;
            _testImage = null;

            stopAnimations(false);

            clearInterval(_mouseDownIntervalId);
            _mouseDownIntervalId = null;
            clearTimeout(_delayedRenderTimerId);
            _delayedRenderTimerId = null;

            _dataModel.removeListener(wLiveCore.DataModel.dataChangedEvent, dataChanged);

            _$keyDownElement.unbind(c_keydown, keyDownChecker);
            _$keyDownElement.unbind(c_click, mouseDownChecker);
            _$keyDownElement = null;

            _$touchElement.unbind(c_touchstart, touchStart);
            _$touchElement.unbind(c_touchmove, touchMove);
            _$touchElement.unbind(c_touchend, touchEnd);
            _$touchElement = null;

            _$selfViewItemContainer.unbind();
            _$selfViewItemContainer = null;

            _$infoPaneContainer.unbind();
            _$infoPaneContainer = null;

            _$selfViewBackground.unbind();
            _$selfViewBackground = null;

            _$previewContainers.unbind();
            _$previewContainers = null;

            _$previousIterationContainer.unbind();
            _$previousIterationContainer = null;

            _$nextIterationContainer.unbind();
            _$nextIterationContainer = null;

            jQuery(selfViewGlobalState).unbind();

            _$viewContext.unbind(c_eventNamespace);
            _$viewContext.unbind('toggleProperties', onToggleProperties);
            _$viewContext.unbind('slideshow', startSlideShow);
            _$viewContext = null;

            $document.unbind(c_mousemove, documentMouseMove);
            $document.unbind(c_selfViewNamespace);

            if ("undefined" != typeof $WLXIM)
            {
                jQuery($WLXIM.sidebar).unbind(c_selfViewNamespace);
            }

            _$previousArrowContainer.stop(true);
            _$nextArrowContainer.stop(true);

            // Show the scroll bars in IE.
            // In Mobile revert the background color.
            _$html.removeClass(c_self);
            _$html.removeClass(c_selfZoom);
            _$html = null;

            $container.width('auto');
            $container.height('auto');

            if (_filmStripControl)
            {
                // We need to disable the error here since this will only happen in the none mobile code
                _$filmStripContainer.unbind(c_mousewheel);
                /* @disable(0092) */
                _filmStripControl.dispose();
                /* @restore(0092) */
            }

            if (_selfNotificationBarControl)
            {
                /* @disable(0092) */
                _selfNotificationBarControl.dispose();
                /* @restore(0092) */
            }

            if (_tagStatusBarControl)
            {
                // We need to disable the error here since this will only happen in the none mobile code
                /* @disable(0092) */
                _tagStatusBarControl.dispose();
                /* @restore(0092) */
            }

            if (_infoPaneControl)
            {
                /* @disable(0092) */
                _infoPaneControl.dispose();
                /* @restore(0092) */
            }

            _selfItemControlCurrent.dispose();
            _selfItemControlCurrent = null;
            _selfItemControlOld.dispose();
            _selfItemControlOld = null;
            _selfItemControlTouch.dispose();
            _selfItemControlTouch = null;

            jQuery(wLiveControls.Video.Events).unbind('error', videoReady).unbind('complete', videoReady);

            clearTimeout(_slideShowTimeoutId);
            _slideShowTimeoutId = null;

            // Change back to OneDrive default theme
            /* @disable(0092) */
            if (window['$theme'])
            {
                $theme.previewTheme(['SkyDrive', null, null, $theme.version], false, null);
                $container.removeClass(c_darkThemeClassName);
                window.$CommandBar && $CommandBar.removeLightHover();
            }

            // Hide loading in header
            /* @disable(0058) */
            if ("undefined" != typeof $header)
            {
                $header.hideLoading();
            }
            /* @restore(0058) */
            /* @restore(0092) */

            // If header is currently hidden, show it
            if (!selfViewGlobalState.fullView && /* @static_cast(Boolean) */wBaseMaster)
            {
                wBaseMaster.toggleFixedHeader(true);
            }

            // release additional references.
            _$body = null;
            _this = null;
        };

        function showContextMenu(ev)
        {
            /// <summary>
            /// Event handler for context menu event.
            /// </summary>
            /// <param name="ev" type="wLive.JQueryEvent">Context menu event.</param>

            // Menu should only show if shift key isn't pressed
            if (!ev.shiftKey)
            {
                _selfItemControlCurrent.showContextMenu(ev);
                return false;
            }

            return /* @static_cast(Boolean) */undefined;
        }

        function touchStart(ev)
        {
            /// <summary>
            /// Handle touch start events.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Touch start event.</param>

            // To debug on a computer without touch screen nor IE 10 touch apis
            // is useful to use mousedown, mousemove, mouseup events and then
            // set ev.touches like such:
            //ev.touches = [{ pageX: ev.clientX, pageY: ev.clientY}];

            //Trace.log('TouchStart');

            if (!_listenForTouchMove)
            {
                var /* @type(HTMLEvent) */touch = getTouchEvent(ev);

                if (touch)
                {
                    _listenForTouchMove = true;
                    _startTouchXPosition = touch.pageX;

                    // Reset state variables
                    _validTouchOccurred = false;
                    _peekingItemNext = false;
                    _peekingItemPrevious = false;
                    _lastSeenTouchX2 = _startTouchXPosition;
                    _lastSeenTouchX = _startTouchXPosition;

                    if ($B.Full && !_taggingOptions.tm)
                    {
                        // On mobile we have to wait for part of a swipe before we can determine
                        // if the user was scrolling up/down but on PC we can just assume they were
                        // swiping to iterate.
                        // In tagging mode we don't want to stop animations either, since it would kill tagging.
                        _validTouchOccurred = true;
                        _lastClickWasSwipe = true;
                        if (!selfViewGlobalState.useTouchAnimations)
                        {
                            // Stop any type of animation since we are going to move now.
                            stopAnimations();
                        }
                        else
                        {
                            addCss3Classes();
                        }
                    }

                    // Note before we used to use:
                    // $window.scrollTop() to detect scroll
                    // but we had to do it in a setTimeout after
                    // the touch move.
                    // Hopefully we can do it with pageY instead.
                    _startTouchYPosition = touch.pageY;

                    // In user is using touch, we want to hide the previous and next arrows
                    unhoverNext();
                    unhoverPrevious();
                }
            }
        }

        function touchMove(ev)
        {
            /// <summary>
            /// Handle touch move events.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Touch start event.</param>

            // To debug on a computer without touch screen nor IE 10 touch apis
            // is useful to use mousedown, mousemove, mouseup events and then
            // set ev.touches like such:
            //ev.touches = [{ pageX: ev.clientX, pageY: ev.clientY}];

            //Trace.log('TouchMove');

            var children = _currentFolder.getChildren();

            // Ignore touch move if we already moved or if we didn't get a touch start.
            if (_listenForTouchMove)
            {
                var /* @type(HTMLEvent) */touch = getTouchEvent(ev);

                if (touch)
                {
                    var touchX = touch.pageX;
                    var touchXDistance = touchX - _startTouchXPosition;

                    if (!_validTouchOccurred)
                    {
                        // We have to test the first touch move
                        // If they moved more up/down then left/right 
                        // ignore the touches.

                        var touchYDistance = touch.pageY - _startTouchYPosition;
                        var absY = Math.abs(touchYDistance);
                        var absX = Math.abs(touchXDistance);

                        // Using 10 in case we get 1px y before anything x.
                        if (absY < 10 && absX < 10)
                        {
                            // wait for real movement.
                            return true;
                        }
                        else if (absY >= absX)
                        {
                            // They moved too vertical so we should stop 
                            // listening for the move event.
                            _listenForTouchMove = false;
                            return true;
                        }
                        else
                        {
                            // Valid horizontal movement.
                            _validTouchOccurred = true;

                            // Stop any type of animation since we are going to move now.
                            // That is unless we are in tagging mode, since it would kill tagging.
                            if (!_taggingOptions.tm)
                            {
                                if (!selfViewGlobalState.useTouchAnimations)
                                {
                                    stopAnimations();
                                }
                            }
                        }
                    }

                    var itemToRender;
                    // -1 for previous and 1 for next
                    var distanceOffset;
                    var directionDone;

                    if (touchXDistance > 0)
                    {
                        // Show previous if possible.
                        if (_animatedItemIndex > 0)
                        {
                            if (!_peekingItemPrevious)
                            {
                                _peekingItemPrevious = children.get(_animatedItemIndex - 1);
                                itemToRender = _peekingItemPrevious;
                            }
                        }
                        else
                        {
                            // Already at first.
                            directionDone = true;
                        }

                        distanceOffset = -1;
                        _peekingItemNext = null;
                    }
                    else
                    {
                        // Show next if possible.

                        if (_animatedItemIndex + 1 < children.getCount())
                        {
                            if (!_peekingItemNext)
                            {
                                _peekingItemNext = children.get(_animatedItemIndex + 1);
                                itemToRender = _peekingItemNext;
                            }
                        }
                        else
                        {
                            // Already at last
                            directionDone = true;
                        }

                        distanceOffset = 1;
                        _peekingItemPrevious = null;
                    }

                    if (itemToRender)
                    {
                        // This means that we are now going next or previous
                        // when we were not before so resize and render that item
                        Trace.log("Changing animation direction");

                        _$previewContainerTouch.css(c_opacity, 1).hide();
                        resizePreviewContainer(itemToRender, _$previewContainerTouch);
                        _selfItemControlTouch.render(itemToRender, true);
                    }

                    if (!selfViewGlobalState.useTouchAnimations || _allowMovement && touchXDistance != 0 || itemToRender)
                    {
                        _allowMovement = false;
                        setTimeout(function () { _allowMovement = true; }, 100);

                        if (directionDone)
                        {
                            // This means we are not able to peek so just
                            // hide the preview container but still
                            // let the item move.
                            _peekingItemPrevious = _peekingItemNext = null;
                            _$previewContainerTouch.css(c_opacity, 0).hide();

                            // Since there is no other item to show, we shouldn't allow movement of more than 20%
                            var maxMovement = _containerWidth * .2;

                            if (Math.abs(touchXDistance) > maxMovement)
                            {
                                touchXDistance = touchXDistance > 0 ? maxMovement : maxMovement * -1;
                            }
                        }
                        else
                        {
                            // Use container width - previewContainer width so the peek happens fast for portrait photos.
                            var distanceOfMarginBetweenEdgeAndPhoto = (_containerWidth - _$previewContainerTouch[0].w) / 2;
                            var distanceToCenter = touchXDistance + distanceOffset * (_containerWidth - distanceOfMarginBetweenEdgeAndPhoto);
                            centerContainer(itemToRender, _$previewContainerTouch, distanceToCenter);
                            Trace.log('TouchItem' + distanceToCenter);
                        }

                        // Note order matters since both modify position top of mobile info pane.
                        centerContainer(_animatedItem, _$previewContainerCurrent, touchXDistance);

                        Trace.log('CurrentItem' + touchXDistance);
                    }

                    if (itemToRender)
                    {
                        _$previewContainerTouch.show();
                    }

                    if (Math.abs(touchX - _lastSeenTouchX) > 10)
                    {
                        // Record the last seen touch.
                        // This will help "stop" determine last second momentum.
                        // However only record it if the distance was different by 10.
                        // If it was less then 10 they might have just been moving slowly.
                        _lastSeenTouchX2 = _lastSeenTouchX;
                        _lastSeenTouchX = touchX;
                    }

                    // Don't allow browser to scroll up/down if we are doing this.
                    // Unfortunately Windows 8 IE 10 does not automatically do
                    // ev.originalEvent.preventDefault() and even if we manually
                    // call it IE 10 only listens to it in MSPointerDown not in
                    // MSPointerMove like iOS...
                    return false;
                }
            }

            return /* @static_cast(Boolean) */undefined;
        }

        function touchEnd(ev)
        {
            /// <summary>
            /// Handle touch end events.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Touch end event.</param>

            // To debug on a computer without touch screen nor IE 10 touch apis
            // is useful to use mousedown, mousemove, mouseup events and then
            // set ev.touches like such:
            //ev.touches = [];

            //Trace.log('TouchEnd');

            // Ignore touch move if we already moved or if we didn't get a touch start.
            if (_listenForTouchMove)
            {
                if (isValidTouchEnd(ev))
                {
                    _listenForTouchMove = false;
                    _validTouchOccurred = false;

                    var touchX = _lastSeenTouchX;
                    var direction = touchX - _lastSeenTouchX2;
                    var touchXDistance = touchX - _startTouchXPosition;
                    var swap;
                    var touchOffset;
                    var children = _currentFolder.getChildren();

                    // using 10 and -10 because a tap on a windows machine causes some movement
                    if (_peekingItemPrevious && touchXDistance > 10 && direction >= 0)
                    {
                        // Move to previous item.
                        touchOffset = _containerWidth;
                        _animatedItemIndex--;
                        swap = true;
                    }
                    else if (_peekingItemNext && touchXDistance < -10 && direction <= 0)
                    {
                        // Move to next item.
                        touchOffset = -1 * _containerWidth;
                        _animatedItemIndex++;
                        swap = true;
                    }
                    else
                    {
                        // Center back on current item.
                        if (_peekingItemNext)
                        {
                            touchOffset = _containerWidth;
                        }
                        else
                        {
                            touchOffset = -1 * _containerWidth;
                        }
                    }

                    if (swap)
                    {
                        // We are actually moving to previous/next item.
                        // So swap all variables.
                        _animatedItem = children.get(_animatedItemIndex);

                        // swap element pointers
                        var $temp = _$previewContainerTouch;
                        _$previewContainerTouch = _$previewContainerCurrent;
                        _$previewContainerCurrent = $temp;

                        // swap control pointers
                        var tempControl = _selfItemControlTouch;
                        _selfItemControlTouch = _selfItemControlCurrent;
                        _selfItemControlCurrent = tempControl;

                        // Clear errors from the page
                        viewContext.errorManager.clear();
                        updateArrowState();

                        if (_filmStripControl)
                        {
                            // Only render if we have data for the film strip.
                            _filmStripControl.render(_currentFolder, _animatedItemIndex);
                        }
                        else
                        {
                            preloadSmallImages();
                        }

                        if (_delayedRenderTimerId)
                        {
                            clearTimeout(_delayedRenderTimerId);
                        }

                        _delayedRenderTimerId = setTimeout(delayedRender, selfViewGlobalState.animationDuration + c_extraDelay);
                    }
                    else
                    {
                        _lastClickWasSwipe = false;
                    }

                    // Note order matters since both modify position top of mobile info pane.
                    centerContainer(_animatedItem, _$previewContainerTouch, touchOffset, !selfViewGlobalState.useTouchAnimations);
                    centerContainer(_animatedItem, _$previewContainerCurrent, 0, !selfViewGlobalState.useTouchAnimations);

                    if (_nextHasMouseOver)
                    {
                        unhoverNext();
                    }

                    if (_previousHasMouseOver)
                    {
                        unhoverPrevious();
                    }
                    _mouseMoveOverFlipperOccurred = true;

                    Trace.log('TouchEnd finished');
                }
            }
        }

        function isValidTouchEnd(ev)
        {
            /// <summary>
            /// Determines if the event is a valid touch end.
            /// </summary>

            var touches = ev.touches || ev.originalEvent.touches;
            if (touches)
            {
                if (touches.length == 0)
                {
                    return true;
                }
            }
            else if ((ev.originalEvent.pointerType == 2) || (ev.originalEvent.pointerType == 'touch') /* finger */)
            {
                // jQuery does not put the "pointerType" on ev so use "originalEvent".
                return true;
            }

            return false;
        }

        function getTouchEvent(ev)
        {
            /// <summary>
            /// Gets the touch event from iOS/Android/Etc and Win 8 IE 10 touch
            /// </summary>
            /// <param name="ev" type="HTMLEvent">One of the browsers touch events</param>

            var touches = ev.touches || ev.originalEvent.touches;
            if (touches)
            {
                // iOS stuff.
                // jQuery does not put the "touches" on ev so use "originalEvent".
                if (touches.length > 0)
                {
                    // Only care about the first finger.
                    return /* @static_cast(HTMLEvent) */touches[0];
                }
            }
            else if ((ev.originalEvent.pointerType == 2) || (ev.originalEvent.pointerType == 'touch') /* finger */)
            {
                // jQuery does not put the "pointerType" on ev so use "originalEvent".
                return ev.originalEvent;
            }

            return /* @static_cast(HTMLEvent) */null;
        }

        function mouseDownChecker()
        {
            /// <summary>
            /// Mouse down checker stops slide show.
            /// </summary>

            if (_slideShowRunning && !_lastClickWasSwipe)
            {
                stopSlideShow();

                // Don't let it bubble or propogate.
                return false;
            }

            return /* @static_cast(Boolean) */undefined;
        }

        function keyDownChecker(ev)
        {
            /// <summary>
            /// Key Down Checker is a helper function which is called when there
            /// is a key down event on the window.
            /// It iterates to the next or previous photo.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Key down event.</param>

            var which = ev.which;

            if (!wLiveCore.DomHelpers.isTextInputElement(jQuery(ev.target)) && !wLiveCore.PopoverHelpers.isPopoverVisible())
            {
                var allowedKey;

                // Iteration won't work until we know the items Index.
                if (_animatedItemIndex != -1 && /* @static_cast(Boolean) */_currentFolder)
                {
                    var children = _currentFolder.getChildren();

                    if (which == c_rightArrowKey || which == 34 /* page down */)
                    {
                        allowedKey = true;

                        goNext();
                    }
                    else if (which == c_leftArrowKey || which == 33 /* page up */)
                    {
                        allowedKey = true;

                        goPrevious();
                    }
                    else if (which == 36 /* home */)
                    {
                        allowedKey = true;

                        if (_animatedItemIndex != 0)
                        {
                            // Go to first item.
                            switchToIndex(0);
                        }
                        else
                        {
                            // force bounce.
                            goPrevious();
                        }
                    }
                    else if (which == 35 /* end */)
                    {
                        allowedKey = true;

                        if (_animatedItemIndex != children.getCount() - 1)
                        {
                            // Go to last item.
                            switchToIndex(children.getCount() - 1);
                        }
                        else
                        {
                            // force bounce.
                            goNext();
                        }
                    }
                }

                if (_slideShowRunning)
                {
                    // This makes alt+tab and shift+alt+tab not stop slide show.
                    var specialKey =
                    /* @static_cast(Boolean) */ev.altKey
                        || /* @static_cast(Boolean) */ev.ctrlKey
                        || /* @static_cast(Boolean) */ev.metaKey
                        || /* @static_cast(Boolean) */ev.shiftKey
                        || /* @static_cast(Boolean) */allowedKey
                        || which == 122 // F11
                        || which == 91;

                    // If we want to ignore ctrl but stop slide show on ctrl+A we would do:
                    /*
                    var specialKey =
                    which == 91 // windows key
                    || which == 224 // windows key on firefox
                    || which == 93 // apple key
                    || which == 18 // alt key
                    || which == 17 // ctrl key
                    || which == 122 // F11
                    || which == 16; // shift key
                    */

                    if (!specialKey)
                    {
                        // If slide show is in progress any key down event stops the slide show.
                        stopSlideShow();

                        // Don't let it bubble or propogate.
                        return false;
                    }
                }

                if (which == 27 /* escape */)
                {
                    // Escape goes to parent folder.
                    goToParent();

                    // Prevent the bubbling of this event.
                    return false;
                }
                else if (which == 40 /* down arrow */ && selfViewGlobalState.fullView)
                {
                    // Down arrow hides iterator if it was open.
                    toggleIterator();
                }
                else if (which == 38 /* up arrow */ && !selfViewGlobalState.fullView)
                {
                    // Up arrow shows iterator if it was closed.
                    toggleIterator();
                }
            }

            return /* @static_cast(Boolean) */undefined;
        }

        function goToParent()
        {
            /// <summary>
            /// Helper to go to parent.
            /// </summary>

            // Don't want to navigate to the parent if the user doesn't have access to the parent.
            if (/* @static_cast(Boolean) */_currentFolder && !_currentFolder.isPlaceholder)
            {
                actionManager.doAction(actionManager.getAction("ViewItem", _currentFolder));
            }
        }

        function mouseDownForToggle()
        {
            /// <summary>
            /// Cancel mouse event if we were saving and clicking away.
            /// </summary>

            _isSavingCaption = /* @static_cast(Boolean) */_captionControl && _captionControl.isEditing();
        }

        function toggleIteratorIfPhoto(ev)
        {
            /// <summary>
            /// Click handler to toggle iterator for self item (if not a video).
            /// </summary>
            /// <param name="ev" type="HTMLEvent" optional="true">Click event.</param>

            //$Debug.trace('Click' + (_validTouchOccurred ? '-ignored' : ''));

            // Do not toggle if the current item is a video and the item is clicked.
            if ((!_animatedItem || !_animatedItem.video) && !_validTouchOccurred && !_isSavingCaption && !_lastClickWasSwipe)
            {
                toggleIterator();
            }
            else
            {
                // Helps prevent listening to the click event invoked whenever we use touch.
                _lastClickWasSwipe = false;
            }

            _isSavingCaption = false;
        }

        function toggleIteratorClick()
        {
            /// <summary>
            /// Click handler to toggle iterator.
            /// </summary>

            //$Debug.trace('Click' + (_validTouchOccurred ? '-ignored' : ''));

            if (!_validTouchOccurred && !_isSavingCaption)
            {
                toggleIterator();
            }

            _isSavingCaption = false;
        }

        function toggleIterator()
        {
            /// <summary>
            /// Toggles the iterator.
            /// </summary>

            if (!selfViewOptions.moSelf)
            {
                // Enable transitions since we're resizing
                if (_transitionsTimeoutId)
                {
                    clearTimeout(_transitionsTimeoutId);
                    _transitionsTimeoutId = null;
                }
                else
                {
                    _$body.addClass(c_transitionsEnabledClassName);
                }

                if (selfViewGlobalState.fullView)
                {
                    triggerCleanView();
                }
                else
                {
                    // Move the filmstrip and infopane back into screen
                    _$filmStripContainer.css(c_bottom, '0px');
                    _$infoPaneContainer.css($B.rtl ? c_left : c_right, '0px');

                    _filmStripHeight = c_filmStripOpenHeight;
                    _headerHeight = c_headerHeight;
                    _infoPaneWidth = c_infoPaneWidth;

                    selfViewGlobalState.fullView = true;
                    $container.addClass(c_fullViewClassName);

                    if ($B.Mobile)
                    {
                        // show Arrows
                        hoverNext();
                        hoverPrevious();
                    }
                }

                _$captionContainer.css(c_bottom, _filmStripHeight);

                // resize preview item
                _this.resize();

                // Toggle of header must happen after resize in order to avoid scrollbars from showing up
                if (selfViewGlobalState.fullView && /* @static_cast(Boolean) */wBaseMaster)
                {
                    wBaseMaster.toggleFixedHeader(true);
                }

                // this makes sure any notifications that are up stay at the top
                jQuery('.TopBar').offset(_$cBase.offset());

                // Disable transitions after 200 ms as we don't want transitions when iterating
                _transitionsTimeoutId = setTimeout(function () { _$body.removeClass(c_transitionsEnabledClassName); _transitionsTimeoutId = null; }, 200);
            }
        }

        function triggerCleanView()
        {
            /// <summary>
            /// Hides Infopane, header and filmstrip, and sets appropirate variables.
            /// </summary>

            // Move the filmstrip, infopane, and header out of the screen
            _$filmStripContainer.css(c_bottom, '-' + c_filmStripOpenHeight + 'px');
            _$infoPaneContainer.css($B.rtl ? c_left : c_right, '-' + c_infoPaneWidth + 'px');

            wBaseMaster && wBaseMaster.toggleFixedHeader(false);

            _filmStripHeight = 0;
            _headerHeight = 0;
            _infoPaneWidth = 0;

            // Must happen before hideNext/Previous()
            selfViewGlobalState.fullView = false;
            $container.removeClass(c_fullViewClassName);

            if ($B.Mobile)
            {
                // hide Arrows
                unhoverNext();
                unhoverPrevious();
            }
        }

        function enableTaggingHandler()
        {
            /// <summary>
            /// Set tagging bar height and resize the view.
            /// </summary>

            _taggingBarHeight = _$tagNotificationBarContainer.height();
            _this.resize();

            updateZIndex();
        }

        function disableTaggingHandler()
        {
            /// <summary>
            /// Set tagging bar height to 0 and resize the view.
            /// </summary>

            _taggingBarHeight = 0;
            _this.resize();

            updateZIndex();
        }

        function onToggleProperties()
        {
            /// <summary>
            /// Responds to a request to toggle properties.
            /// </summary>

            /* @disable(0092) */
            _infoPaneControl.toggle();
            /* @restore(0092) */
        }

        function preloadSmallImages()
        {
            /// <summary>
            /// Preload the images before/after the current image.
            /// </summary>
            if (/* @static_cast(Boolean) */_currentFolder && _animatedItemIndex != -1)
            {
                var index = Math.max(0, _animatedItemIndex - c_smallItemsToPreload);
                var stopIndex = Math.min(_animatedItemIndex + c_smallItemsToPreload, _currentFolder.getChildren().getCount() - 1);
                var width = 1;
                var height = 1;

                preloadImages(index, stopIndex, width, height);

            }
        }

        function preloadLargeImages()
        {
            /// <summary>
            /// Preload the images before/after the current image.
            /// </summary>

            if (/* @static_cast(Boolean) */_currentFolder && _animatedItemIndex != -1)
            {
                var index = Math.max(0, _animatedItemIndex - c_largeItemsToPreload);
                var stopIndex = Math.min(_animatedItemIndex + c_largeItemsToPreload, _currentFolder.getChildren().getCount() - 1);

                preloadImages(index, stopIndex, _itemConstraintWidth, _itemConstraintHeight, _animatedItemIndex);
            }
        }

        function getForcedSize(item, imgWidth, imgHeight, constraintWidth, constraintHeight)
        {
            /// <summary>
            /// Returns a size (width/height) of the image that fits exactly within the constrained size.
            /// </summary>
            /// <param name="item" type="wLive.Core.ISkyDriveItem">Item to fit.</param>
            /// <param name="imgWidth" type="Number">Full image width</param>
            /// <param name="imgHeight" type="Number">Full image height</param>
            /// <param name="constraintWidth" type="Number">constrained width for image to fit within</param>
            /// <param name="constraintHeight" type="Number">constrained height for image to fit within</param>
            /// <returns type="wLive.Controls.SelfViewSize">Size of constrained image.</returns>

            var newWidth;
            var newHeight;

            if (constraintHeight <= 0 || constraintWidth <= 0)
            {
                // Error case of window too small.
                newWidth = 0;
                newHeight = 0;
            }
            else if (imgWidth > constraintWidth || imgHeight > constraintHeight)
            {
                // At least one side is larger than the container so we shrink the image.
                // Show the largest image that exactly fits within the container.
                if (imgWidth / imgHeight > constraintWidth / constraintHeight)
                {
                    newWidth = constraintWidth;
                    newHeight = imgHeight / imgWidth * constraintWidth;
                }
                else
                {
                    newHeight = constraintHeight;
                    newWidth = imgWidth / imgHeight * constraintHeight;
                }
            }
            else
            {
                // Already smaller than the container so just center.
                newHeight = imgHeight;
                newWidth = imgWidth;
            }

            newHeight = Math.round(newHeight);
            newWidth = Math.round(newWidth);

            return { w: newWidth, h: newHeight };
        }

        function preloadImages(startIndex, stopIndex, width, height, currentIndex)
        {
            /// <summary>
            /// Preload the images with correct height/width.
            /// </summary>
            /// <param name="startIndex" type="Number">Start index.</param>
            /// <param name="stopIndex" type="Number">Stop index.</param>
            /// <param name="width" type="Number">Width</param>
            /// <param name="height" type="Number">Height</param>
            /// <param name="currentIndex" type="Number" optional="true">Current Index</param>

            if (currentIndex !== undefined)
            {
                _testImageSrc = null;
                _testNextImageSrc = null;
            }

            var children = _currentFolder.getChildren();

            for (var index = startIndex; index < stopIndex; index++)
            {
                var item = /* @static_cast(wLive.Core.ISkyDriveItem) */children.get(index);

                if (item && item.photo && item.thumbnailSet)
                {
                    var size = getForcedSize(item, item.photo.width, item.photo.height, width, height);

                    var thumbnail = _itemHelper.pickThumbnail(item.thumbnailSet, size.w, size.h);
                    if (thumbnail)
                    {
                        var thumbnailSrc = item.thumbnailSet.baseUrl + thumbnail.url;
                        var image;

                        if (currentIndex !== undefined)
                        {
                            if (index == currentIndex)
                            {
                                _testImageSrc = thumbnailSrc;

                            }
                            else if (index == currentIndex + 1)
                            {
                                _testNextImageSrc = thumbnailSrc;
                            }

                            // These need to go through the test image so we get the on load event.
                            image = _testImage;
                        }

                        wLiveCore.Images.loadImage(thumbnailSrc, image);
                    }
                }
            }
        }

        function bounce(directionNext)
        {
            /// <summary>
            /// Bounce away animation.
            /// </summary>
            /// <param name="directionNext" type="Boolean" optional="true">True for next and false for previous</param>

            if (!_bouncing)
            {
                _bouncing = true;

                if (_slideShowRunning)
                {
                    clearTimeout(_slideShowTimeoutId);
                    _slideShowTimeoutId = setTimeout(slideShowNext, _slideShowSpeed);
                }

                // Stop video and previous animations.
                stopAnimations();

                // We move half the distance in half the time.
                // Then go backwards half the distance in half the time.
                // Both Mobile and PC do the same bounce distance/speed.
                var distanceToSlide = (directionNext ? -1 * c_distanceToTravel : c_distanceToTravel) / 2;
                var timeToSlide = selfViewGlobalState.animationDuration / 2;

                var previousInterval = jQuery.fx.interval;
                jQuery.fx.interval = c_slideInterval;

                // Animate to side and back.
                _$previewContainerCurrent.animate({ left: '+=' + distanceToSlide }, timeToSlide, c_linear);
                _$previewContainerCurrent.animate({ left: '-=' + distanceToSlide }, timeToSlide, c_linear, bounceCompleted);

                jQuery.fx.interval = previousInterval;
            }
        }

        function bounceCompleted()
        {
            /// <summary>
            /// Bounce completed.
            /// </summary>

            _bouncing = false;

            // When bounce is complete, download big image and start video if it hasn't started.
            if (_delayedRenderTimerId)
            {
                clearTimeout(_delayedRenderTimerId);
                _delayedRenderTimerId = null;
            }
            _delayedRenderTimerId = setTimeout(delayedRender, c_extraDelay);
        }

        function stopAnimations(allowVideoToContinuePlaying)
        {
            /// <summary>
            /// Stop animations
            /// </summary>
            /// <param name="allowVideoToContinuePlaying" type="Boolean" optional="true">True if we allow video to continue playing</param>

            // Stop animations
            // We stop it twice because we want to stop both animations but we want to 
            // jump the the end of the animation for each
            // If we did _$previewContainerCurrent.stop(true, true); it would only
            // jump to the end of the first animation and not the rest.
            _$previewContainerCurrent.stop(false, true);
            _$previewContainerCurrent.stop(false, true);
            _$previewContainerOld.stop(false, true);
            _$previewContainerOld.stop(false, true);
            _$previewContainerTouch.stop(false, true);

            // Especially needed for mobile so that peaking a file then rotate does not overlap it.
            _$previewContainerTouch.hide();
            _$previewContainerOld.hide();

            if (selfViewGlobalState.useCSS3Animations)
            {
                if (_animationTimeoutId)
                {
                    // If the users action (right arrow to switch to "bounce")
                    // caused this JS thread to occur before the setTimeout(0)
                    // event.
                    // Instead we should force that animation to start and then stop (by removing the class names)
                    clearTimeout(_animationTimeoutId);
                    _animationTimeoutId = null;
                    css3Animation();
                }

                _$previewContainerOld.removeClass('selfAnimate');
                _$previewContainerCurrent.removeClass('selfAnimate');
                _$previewContainerTouch.removeClass('selfAnimate');
                _css3ClassesAdded = false;
            }
            else
            {
                if (_animationIntervalId)
                {
                    animationStep(true);
                }
            }

            if (!allowVideoToContinuePlaying)
            {
                // Don't let full render occur either (that will start the video).
                if (_delayedRenderTimerId)
                {
                    clearTimeout(_delayedRenderTimerId);
                    _delayedRenderTimerId = null;
                }

                // Stop videos
                _selfItemControlCurrent.stop();
            }

        }

        function switchToIndex(index)
        {
            /// <summary>
            /// Switch to index of parent item.
            /// For example this is called when you iterate from item 34 to item 35.
            /// </summary>
            /// <param name="index" type="Number">index to select</param>

            Debug.assert(_currentFolder, 'Error Current folder is null when we are switching to index');

            /* @disable(0092) */
            _notifications && _notifications.getQueue().reset();
            /* @restore(0092) */

            // If transitions are currently set, unset them, since we don't want to have them collide with iteration animation
            _$body.removeClass(c_transitionsEnabledClassName);
            _transitionsTimeoutId = null;

            if (_slideShowRunning)
            {
                clearTimeout(_slideShowTimeoutId);
                _slideShowTimeoutId = setTimeout(slideShowNext, _slideShowSpeed);
            }

            if (index != _animatedItemIndex)
            {
                var directionNext = (index > _animatedItemIndex);

                // Update index and item.
                // We are updating animated item instead of current item because
                // we are only showing some UI change but not other parts like the info pane.
                _animatedItemIndex = index;
                _animatedItem = _currentFolder.getChildren().get(_animatedItemIndex);

                // Clear errors from the page
                /* @disable(0092) */
                viewContext.errorManager.clear();
                /* @restore(0092) */

                updateArrowState();

                // Now instantly render the film strip so we get movement.
                if (/* @static_cast(Boolean) */_currentFolder && _animatedItemIndex != -1)
                {
                    if (_filmStripControl)
                    {
                        // Only render if we have data for the film strip.
                        // We need to disable the error here since this will only happen in the none mobile code
                        /* @disable(0092) */
                        _filmStripControl.render(_currentFolder, _animatedItemIndex);
                        /* @restore(0092) */
                    }
                    else
                    {
                        preloadSmallImages();
                    }
                }

                stopAnimations();
                // We are animating more so don't actually render the info pane because of the complete.
                clearTimeout(_delayedRenderTimerId);
                _delayedRenderTimerId = null;

                // Mobile moves the whole screen width.
                // PC moves a fixed amount.
                var distanceToSlide = (directionNext ? -1 : 1) * ($B.Mobile ? _containerWidth : c_distanceToTravel);

                // Swap containers
                var $tempContainer = _$previewContainerOld;
                _$previewContainerOld = _$previewContainerCurrent;
                _$previewContainerCurrent = $tempContainer;

                _$previewContainerOld.removeAttr('role');
                _$previewContainerCurrent.attr('role', 'main');

                // Swap controls
                var tempControl = _selfItemControlOld;
                _selfItemControlOld = _selfItemControlCurrent;
                _selfItemControlCurrent = tempControl;

                // Remove sutra labels
                _selfItemControlOld.unset();

                // Place the new one on top of the old one.
                _$previewContainerOld.css(c_zIndex, -1);
                _$previewContainerCurrent.css(c_zIndex, 2);
                _$previewContainerCurrent.css('display', 'block');

                _animationDistance = distanceToSlide;

                _oldStartLeft = _$previewContainerOld[0][c_left];

                if (selfViewGlobalState.useCSS3Animations)
                {
                    if ($B.Full)
                    {
                        _$previewContainerCurrent.css(c_opacity, 0);
                    }

                    resizePreviewContainer(_animatedItem, _$previewContainerCurrent);
                    centerContainer(_animatedItem, _$previewContainerCurrent, -1 * distanceToSlide);
                    _currentStartLeft = _$previewContainerCurrent[0][c_left];

                    if (_animationTimeoutId)
                    {
                        clearTimeout(_animationTimeoutId);
                    }

                    _animationTimeoutId = wLiveCore.DomHelpers.setTimeoutZero(css3Animation);
                }
                else
                {
                    var cheatingRatio = c_slideInterval / selfViewGlobalState.animationDuration;
                    var cheatingDistance = Math.round(distanceToSlide * cheatingRatio);

                    // Cheat by starting 1 iterval into the future (opacity and left) for old container
                    if ($B.Full)
                    {
                        _$previewContainerOld.css(c_opacity, 1 - cheatingRatio);
                    }

                    var oldLeftAfterCheat = _oldStartLeft + cheatingDistance;
                    _$previewContainerOld.css(c_left, oldLeftAfterCheat);
                    _$previewContainerOld[0][c_left] = oldLeftAfterCheat;

                    // Position and render new item
                    // Cheat by starting 1 iterval into the future (opacity and left) for new container
                    if ($B.Full)
                    {
                        _$previewContainerCurrent.css(c_opacity, cheatingRatio);
                    }
                    resizePreviewContainer(_animatedItem, _$previewContainerCurrent);
                    centerContainer(_animatedItem, _$previewContainerCurrent, -1 * distanceToSlide + cheatingDistance);
                    _currentStartLeft = _$previewContainerCurrent[0][c_left] - cheatingDistance;

                    _animationStartTime = (new Date()).getTime();

                    // Subtract off a slide interval because of the cheat.
                    _animationStopTime = _animationStartTime + selfViewGlobalState.animationDuration - c_slideInterval;

                    // Count this cheat as a step.
                    ///

                    _animationIntervalId = setInterval(animationStepInterval, c_slideInterval);
                }

                _selfItemControlCurrent.render(_animatedItem, true);
                if (_animatedItem)
                {
                    if (_animatedItem.video)
                    {
                        _waitingForVideo = true;
                    }
                    else
                    {
                        _waitingForPhoto = true;
                    }
                }

                if (_captionControl)
                {
                    if (_animatedItem)
                    {
                        _$captionContainer.show();
                        _captionControl.render(_animatedItem);

                        // To allow people to keep editing captions as they
                        // iterate through photos add focus here.
                        if (!_slideShowRunning)
                        {
                            // Adding focus makes the status bar show the URL.
                            // During slideshow the status bar in chrome overlaps the
                            // caption so lets minimize this.
                            _captionControl.focus();
                        }
                    }
                    else
                    {
                        _$captionContainer.hide();
                    }
                }
            }
        }

        function css3Animation()
        {
            /// <summary>
            /// Apply the Final CSS 3 animation properties and add the
            /// class that allows them to animate.
            /// </summary>

            _animationTimeoutId = null;

            if (_animationDistance == 0)
            {
                // Short circut for stop() when not animating.
                return;
            }

            addCss3Classes();

            var oldItemLeft = _oldStartLeft + _animationDistance;
            var newItemLeft = _currentStartLeft + _animationDistance;

            _$previewContainerOld.css(c_left, oldItemLeft);
            _$previewContainerOld[0][c_left] = oldItemLeft;
            _$previewContainerCurrent.css(c_left, newItemLeft);
            _$previewContainerCurrent[0][c_left] = newItemLeft;

            if ($B.Full)
            {
                _$previewContainerOld.css(c_opacity, 0);
                _$previewContainerCurrent.css(c_opacity, 1);
            }

            _animationDistance = 0;

            if (_delayedRenderTimerId)
            {
                clearTimeout(_delayedRenderTimerId);
            }

            _delayedRenderTimerId = setTimeout(delayedRender, selfViewGlobalState.animationDuration + c_extraDelay);
        }

        function addCss3Classes()
        {
            /// <summary>
            /// Apply CSS 3 properties.
            /// </summary>

            if (!_css3ClassesAdded)
            {
                Trace.log('Starting animations');
                _$previewContainerOld.addClass('selfAnimate');
                _$previewContainerCurrent.addClass('selfAnimate');
                _$previewContainerTouch.addClass('selfAnimate');
                _css3ClassesAdded = true;
            }
        }

        function animationStepInterval()
        {
            /// <summary>
            /// Set Interval helper since some browsers pass arguments to callback.
            /// </summary>

            animationStep();
        }

        function animationStep(stop)
        {
            /// <summary>
            /// Hand rolled animation function which applies the
            /// correct left and opacity values to the 2 self items.
            /// JQuery animations are too slow for this action.
            /// </summary>
            /// <param name="stop" type="Boolean" optional="true">Stop (and go to end) of animation</param>

            if (_animationDistance == 0)
            {
                // Short circut for stop() when not animating.
                return;
            }

            ///

            var animationPercentageRemainder;

            if (stop)
            {
                animationPercentageRemainder = 0;
            }
            else
            {
                var currentTime = (new Date()).getTime();
                animationPercentageRemainder = Math.max(_animationStopTime - currentTime, 0) / selfViewGlobalState.animationDuration;
            }

            var animationPercentageComplete = 1 - animationPercentageRemainder;
            var distanceFromStart = Math.round(animationPercentageComplete * _animationDistance);

            if ($B.Full)
            {
                _$previewContainerOld.css(c_opacity, animationPercentageRemainder);
                _$previewContainerCurrent.css(c_opacity, animationPercentageComplete);
            }

            var oldItemLeft = _oldStartLeft + distanceFromStart;
            var newItemLeft = _currentStartLeft + distanceFromStart;
            _$previewContainerOld.css(c_left, oldItemLeft);
            _$previewContainerOld[0][c_left] = oldItemLeft;
            _$previewContainerCurrent.css(c_left, newItemLeft);
            _$previewContainerCurrent[0][c_left] = newItemLeft;

            if (animationPercentageRemainder == 0 || stop)
            {
                clearInterval(_animationIntervalId);
                _animationIntervalId = null;

                // Reset disance for animation so future "Stop" do not cause more movement
                // such as after a resize.
                _animationDistance = 0;

                if (!stop)
                {
                    ///

                    if (_delayedRenderTimerId)
                    {
                        clearTimeout(_delayedRenderTimerId);
                    }

                    _delayedRenderTimerId = setTimeout(delayedRender, c_extraDelay);
                }

                ///
            }
        }

        function delayedRender()
        {
            /// <summary>
            /// This is so we change the hash before doing the delayed render
            /// of hte filmstrip and infopane
            /// </summary>

            // Reset timeout so its ready for later.
            _delayedRenderTimerId = null;

            if (_animatedItem)
            {
                _waitingForHashItem = _animatedItem;
                _waitingForHashItemIndex = _animatedItemIndex;

                if (!selfViewOptions.moSelf && !wLiveCore.StringHelpers.caseInsensitiveStringEquals(viewContext.viewParams.id, _animatedItem.id))
                {
                    // If we have the current Item then update the Url (and browser title and count the page view).
                    // We are doing this in delayedRender instead of switchToIndex
                    // so that if you hold down the arrow key we only switch the
                    // url at the end so your back stack is not full.
                    actionManager.doAction(actionManager.getAction("ViewItem", _animatedItem));
                }
                else
                {
                    renderDelayedItem();
                }
            }
            else
            {
                renderDelayedItem();
            }
        }

        function renderDelayedItem()
        {
            /// <summary>
            /// This is so we animate the film strip quickly.
            /// However we do not start doing bigger processes such as
            /// resize the Self Item nor make image requests for the big
            /// self item because the user is probably still moving to
            /// the next item.
            /// </summary>

            if ($B.Mobile)
            {
                // At the end of the animate scroll top.
                window.scrollTo(0, 1);
            }

            // Hide it so the background gets the click
            _$previewContainerOld.css('display', 'none');

            if (_waitingForHashItem)
            {
                _currentItem = _waitingForHashItem;
                _currentItemIndex = _waitingForHashItemIndex;

                _waitingForHashItem = null;
                _waitingForHashItemIndex = -1;

                if (selfViewOptions.onSelectedIndexChanged)
                {
                    selfViewOptions.onSelectedIndexChanged(_currentItemIndex);
                }

                updateZIndex();

                // Download better quality image
                _selfItemControlCurrent.render(_animatedItem);

                if (_animatedItem.video)
                {
                    _waitingForVideo = true;
                }
                else
                {
                    _waitingForPhoto = true;
                }

                if (_captionControl)
                {
                    if (_animatedItem)
                    {
                        _$captionContainer.show();
                        _captionControl.render(_animatedItem);
                    }
                    else
                    {
                        _$captionContainer.hide();
                    }
                }

                // Leave the old Info pane contents until the item is known.
                if (_infoPaneControl)
                {
                    /* @disable(0092) */
                    _infoPaneControl.render(_animatedItem);

                    // Need to open infopane if it is closed.
                    if (viewContext.infoPaneClosed)
                    {
                        _infoPaneControl.toggle();
                    }
                    /* @restore(0092) */
                }

                // Update the tag status bar control.
                if (_tagStatusBarControl)
                {
                    // We need to disable the error here since this will only happen in the none mobile code
                    /* @disable(0092) */
                    _tagStatusBarControl.render(_animatedItem);
                    /* @restore(0092) */
                }

                if (_commandBarList && _animatedItem)
                {
                    _commandBarList.clear();
                    CommandBarHelper.populateSharedCommands(viewContext, _animatedItem, /* selection: */null, _commandBarList, c_isEnabledCallbacks, /* stringIdPart: */null);
                }
            }

            preloadLargeImages();
        }

        function updateArrowState()
        {
            /// <summary>
            /// Helper to show/hide the right states arrows.
            /// </summary>

            var disablePrevious = true;
            var disableNext = true;

            if (/* @static_cast(Boolean) */_currentFolder && _animatedItemIndex != -1)
            {
                if (_animatedItemIndex != 0)
                {
                    disablePrevious = false;
                }

                if (_currentFolder.getChildren().getCount() - 1 != _animatedItemIndex)
                {
                    disableNext = false;
                }
            }

            if (disablePrevious)
            {
                _$previousArrowContainer.removeClass(c_enabledArrowClassName);
            }
            else
            {
                _$previousArrowContainer.addClass(c_enabledArrowClassName);
            }

            if (disableNext)
            {
                _$nextArrowContainer.removeClass(c_enabledArrowClassName);
            }
            else
            {
                _$nextArrowContainer.addClass(c_enabledArrowClassName);
            }
        }

        function renderSubControls()
        {
            /// <summary>
            /// Render Sub Controls is called by render and when we iterate without a render
            /// </summary>

            updateArrowState();

            if ( /* @static_cast(Boolean) */_currentFolder && _animatedItemIndex != -1)
            {
                if (_filmStripControl)
                {
                    // Only render if we have data for the film strip.
                    _filmStripControl.render(_currentFolder, _animatedItemIndex);
                }
                else
                {
                    preloadSmallImages();
                }

                if (_firstRenderWithIndex)
                {
                    _firstRenderWithIndex = false;
                    showArrows(!_firstRender);
                }
            }

            if (_firstRender)
            {
                _firstRender = false;
            }

            if (_delayedRenderTimerId)
            {
                clearTimeout(_delayedRenderTimerId);
            }
            _delayedRenderTimerId = setTimeout(delayedRender, c_extraDelay);
        }

        function goPrevious()
        {
            /// <summary>
            /// Handler for clicking on previous arrow.
            /// </summary>

            // Don't iterate to the previous Item if we are at the first Item.
            if (/* @static_cast(Boolean) */_currentFolder && _animatedItemIndex > -1)
            {
                if (_animatedItemIndex > 0)
                {
                    switchToIndex(_animatedItemIndex - 1);
                }
                else
                {
                    bounce();
                }
            }
        }

        function startGoPrevious(ev)
        {
            /// <summary>
            /// Allow user to hold down mouse on iterator to go previous
            /// similar to how they can hold down their arrow key.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Mouse down event</param>

            //$Debug.trace('MouseDown-GoPrevious' + (_validTouchOccurred ? '-ignored' : ''));

            if (ev.which == 1 /* Left button */ && !_validTouchOccurred)
            {
                stopIteratingViaMouseDown();
                _mouseDownIntervalId = setInterval(goPrevious, c_mouseDownIntervalTime);
                goPrevious();
            }
        }

        function startGoNext(ev)
        {
            /// <summary>
            /// Allow user to hold down mouse on iterator to go next
            /// similar to how they can hold down their arrow key.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Mouse down event</param>

            //$Debug.trace('MouseDown-GoNext' + (_validTouchOccurred ? '-ignored' : ''));

            if (ev.which == 1 /* Left button */ && !_validTouchOccurred)
            {
                stopIteratingViaMouseDown();
                _mouseDownIntervalId = setInterval(goNext, c_mouseDownIntervalTime);
                goNext();
            }
        }

        function stopIteratingViaMouseDown()
        {
            /// <summary>
            /// On mouse up or mouse leave we stop iterating.
            /// This is the same as them not pressing the arrow key anymore.
            /// </summary>

            //$Debug.trace('MouseUp-GoNext/Previous');

            clearInterval(_mouseDownIntervalId);
            _mouseDownIntervalId = null;
        }

        function goNext()
        {
            /// <summary>
            /// Handler for clicking on next arrow.
            /// </summary>
            /// <param name="ev" type="HTMLEvent" optional="true">Click event.</param>

            // Don't iterate to the next Item if we are at the last item.
            if (_animatedItemIndex != -1 && /* @static_cast(Boolean) */_currentFolder)
            {
                if (_currentFolder.getChildren().getCount() - 1 > _animatedItemIndex)
                {
                    switchToIndex(_animatedItemIndex + 1);
                }
                else
                {
                    bounce(true);
                }
            }
        }

        function documentMouseMove(ev)
        {
            /// <summary>
            /// Listen to mouse move all over the document.
            /// This is because a touch event causes a mouse move but not a mouse leave.
            /// </summary>
            /// <param name="ev" type="HTMLEvent" optional="true">Mouse move event.</param>

            if (_mouseMoveOverFlipperOccurred)
            {
                if ((_previousHasMouseOver || _nextHasMouseOver) && !(jQuery(ev.target).closest('.selfps').length || jQuery(ev.target).closest('.selfns').length))
                {
                    // No longer on top of previous or next.
                    unhoverPrevious();
                    unhoverNext();
                }
            }
        }

        function mouseMovePrevious()
        {
            /// <summary>
            /// Apparently you can trick the browser
            /// and get the mouse over the previous area
            /// without a mouse enter.
            /// </summary>

            //$Debug.trace('Mouse Move Previous');
            hoverPrevious();
            hoverNext();
        }

        function hoverPrevious()
        {
            /// <summary>
            /// Handler for hovering over previous container.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Mouse enter event.</param>

            if (!_previousHasMouseOver)
            {
                _previousHasMouseOver = true;
                _$previousArrowContainer.stop(true);
                _$previousArrowContainer.animate({ opacity: 1 }, c_hoverSpeed);
            }

            _mouseMoveOverFlipperOccurred = true;
        }

        function unhoverPrevious()
        {
            /// <summary>
            /// Handler for stop hovering over previous container.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Mouse leave event.</param>

            if (_previousHasMouseOver)
            {
                _previousHasMouseOver = false;
                _$previousArrowContainer.stop(true);
                _$previousArrowContainer.animate({ opacity: 0 }, c_unhoverSpeed);
            }
        }

        function showArrows(fadeIn)
        {
            /// <summary>
            /// Show both arrows to let users know they are there.
            /// They will fade out after the user hovers over one of them.
            /// </summary>
            /// <param name="fadeIn" type="Boolean">If we should fade them in.</param>

            if ($B.Full)
            {
                if (fadeIn)
                {
                    _$previousArrowContainer.animate({ opacity: 1 }, c_hoverSpeed * 4);
                    _$nextArrowContainer.animate({ opacity: 1 }, c_hoverSpeed * 4);
                }
                else
                {
                    _$previousArrowContainer.css('opacity', 1);
                    _$nextArrowContainer.css('opacity', 1);
                }
            }
        }

        function mouseMoveNext()
        {
            /// <summary>
            /// Apparently you can trick the browser
            /// and get the mouse over the next area
            /// without a mouse enter.
            /// </summary>

            //$Debug.trace('Mouse Move Next');

            hoverPrevious();
            hoverNext();
        }

        function hoverNext()
        {
            /// <summary>
            /// Handler for hovering over next container.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Mouse enter event.</param>

            if (!_nextHasMouseOver)
            {
                _nextHasMouseOver = true;
                _$nextArrowContainer.stop(true);
                _$nextArrowContainer.animate({ opacity: 1 }, c_hoverSpeed);
            }

            _mouseMoveOverFlipperOccurred = true;
        }

        function unhoverNext()
        {
            /// <summary>
            /// Handler for stop hovering over next container.
            /// </summary>
            /// <param name="ev" type="HTMLEvent">Mouse leave event.</param>

            if (_nextHasMouseOver)
            {
                _nextHasMouseOver = false;
                _$nextArrowContainer.stop(true);
                _$nextArrowContainer.animate({ opacity: 0 }, c_unhoverSpeed);
            }
        }

        function dataChanged(changedItem)
        {
            /// <summary>
            /// Data Changed Handler which helps us call render again when we determine current items id or index.
            /// </summary>
            /// <param name="changedItem" type="wLive.Core.ISkyDriveItem">ItemId of changed Folder</param>

            // If the event is not for the current folder ignore it.
            if (_currentFolderKey == changedItem.key)
            {
                // Reminder: we at least have either have _currentFolder && _animatedItemIndex != -1 or we have _animatedItem.
                if (_animatedItem)
                {
                    // This path fixes _currentFolder and _animatedItemIndex if they were incorrect.
                    // Generally from F5 on self view or navigating from set to self where a filter needs to be applied.
                    // This allows the film strip and iterating to work.

                    var givenIndex = changedItem.getChildren().indexOf(_animatedItem);

                    // reset attempt count if item has changed
                    if (!_missingSearchItemKey || _animatedItem.key != /* @static_cast(String) */_missingSearchItemKey)
                    {
                        _missingSearchItemKey = _animatedItem.key;
                        _missingSearchAttempts = 0;
                    }

                    // If the item isn't in the set, we'll try to fetch. Then we'll redirect to the parent search.
                    if (givenIndex == -1 && viewContext.viewParams.qt == c_searchQt)
                    {
                        if (_missingSearchAttempts < c_maxMissingSearchAttempts)
                        {
                            _missingSearchAttempts++;
                        }
                        else
                        {
                            _missingSearchAttempts = 0;
                            $BSI.navigateTo("#qt=search&q=" + encodeURIComponent(viewContext.viewParams.q));
                            return;
                        }
                    }

                    if (givenIndex != -1 /*|| _animatedItemIndex == -1*/)
                    {
                        resetIndexes();
                        // The item still exists, so load everything around the item
                        _this.render(_animatedItem);
                    }
                    else
                    {
                        handleDeletedItem();
                    }
                }
                else
                {
                    // This path fixes _animatedItem and causes the self item and info pane to render. 
                    // Generally from iterating off the page of data.
                    // This is easiest to see by going to a list with a lot of items and pressing "end" or holding down arrow key.

                    Debug.assert(_currentFolder, 'Current folder should be known since animated item is not known');
                    Debug.assert(_animatedItemIndex != -1, 'Item index should be known since animated item is not known');

                    var newitem = _currentFolder.getChildren().get(_animatedItemIndex);
                    if (newitem)
                    {
                        _this.render(newitem);
                    }
                }
            }
            else if (/* @static_cast(Boolean) */_animatedItem && _animatedItem.key === changedItem.key)
            {
                // Re-render the filmstrip
                var itemIndex = _currentFolder.getChildren().indexOf(_animatedItem);

                if (itemIndex != -1)
                {
                    // The item still exists, so load everything around the item

                    if (!selfViewOptions.moSelf)
                    {
                        // The item we are looking at has changed.
                        // First render it in the captionControl.
                        _$captionContainer.show();
                        _captionControl.render(changedItem);
                    }

                    // Then resize the containers.
                    _this.resize();
                }
                else if (!_firstRenderWithIndex)
                {
                    handleDeletedItem();
                }
            }
        }

        function handleDeletedItem()
        {
            /// <summary>
            /// Rerenders appropriately when an item is deleted.
            /// </summary>

            if (_currentFolder)
            {
                Debug.assert(_animatedItemIndex != -1, 'Animated item index should not be -1');

                // Item no longer exists
                var childCount = _currentFolder.getChildren().getCount();
                var callRenderNow;

                var itemToNavigateTo;

                if (childCount > 0)
                {
                    var newItemIndex = Math.min(childCount - 1, _animatedItemIndex);
                    itemToNavigateTo = _currentFolder.getChildren().get(newItemIndex);
                    callRenderNow = true;
                }
                else
                {
                    itemToNavigateTo = _currentFolder;
                }

                Debug.assert(itemToNavigateTo, 'Must have found an item');

                resetState();

                if (callRenderNow)
                {
                    _this.render(itemToNavigateTo);
                }

                actionManager.doAction(actionManager.getAction("ViewItem", itemToNavigateTo));
            }
        }

        function resetIndexes()
        {
            /// <summary>
            /// Resets indexes for all items used in view.
            /// </summary>

            _currentItemIndex = -1;
            _animatedItemIndex = -1;
            _waitingForHashItemIndex = -1;

            if (_filmStripControl)
            {
                // We need to disable the error here since this will only happen in the none mobile code
                /* @disable(0092) */
                _filmStripControl.resetState();
                /* @restore(0092) */
            }
        }

        function resetState()
        {
            /// <summary>
            /// Resets all variables used throughout the view.
            /// </summary>

            resetIndexes();
            _currentItem = null;
            _animatedItem = null;
            _waitingForHashItem = -null;
            _currentFolder = null;
            _currentFolderKey = null;
            _currentFolderIsFiltered = false;
        }
    };

    ///

    // Register the SelfView.
    $Do.register("wLive.Controls.SelfView");

})();

});