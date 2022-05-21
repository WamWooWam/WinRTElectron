
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\common\common.js" />

/*jshint browser:true*/
/*global Windows,Microsoft,Debug,Jx,People,Chat,Calendar,BVT,setImmediate*/

Jx.delayDefine(Calendar, "App", function() {
    
    function _info(s) { Jx.mark("Calendar.App." + s + ",Info,Calendar,App"); }
    function _start(s) { Jx.mark("Calendar:App." + s + ",StartTA,Calendar,App"); }
    function _stop(s) { Jx.mark("Calendar:App." + s + ",StopTA,Calendar,App"); }

    var App = Calendar.App = function(host, platformWorker) {
        _start("ctor");

        // cache params
        this._host           = host;
        this._platformWorker = new Calendar.WorkerEx(platformWorker);

        // init members
        this._scheduler = null;
        this._jobset = null;
        this._deferredWork = new Calendar.WorkQueue();
        this._services = { deferredWork: this._deferredWork };
        this._firstRun = true;

        this._platform   = null;
        this._hrPlatform = 0;
        this._suspended = false;

        this._hadConnectedId = false;

        this.initComponent();
        this._id = "calApp";

        this._lastOuterWidth = window.outerWidth;

        // hook activation, except suspend.  we want to build the rest of our app
        // ui before hooking suspend, so our suspend event will be called last
        // preventing anybody from using a suspended platform.
        var activation = Jx.activation;
        activation.addListener(activation.tile, this._onTile, this);
        activation.addListener(activation.protocol, this._onProtocol, this);
        activation.addListener(activation.resuming, this._onResuming, this);
        activation.addListener(activation.appointmentsProvider, this._onShowTimeFrame, this);

        // hook jx events
        this.on("getPlatform",       this._onGetPlatform,       this);
        this.on("getPlatformWorker", this._onGetPlatformWorker, this);
        this.on("getSettings",       this._onGetSettings,       this);
        this.on("setShowArrows",     this._onSetShowArrows,     this);
        this.on("viewReady",         this._onViewReady,         this);

        // hook visibility
        this._time = Date.now();
        document.addEventListener("msvisibilitychange", this._onVisibilityChange.bind(this), false);

        this._onResize = this._onResize.bind(this);
        window.addEventListener("resize", this._onResize, false);

        // finally initialize the app
        document.title = Jx.res.getString("calendarAppTitle");

        _stop("ctor");
    };

    Jx.augment(App, Jx.Component);

    App._reloadTimeout = Calendar.DAY_IN_MILLISECONDS * 3;

    // override the reload timeout in debug for testing
    Debug.call(function () {
        App._reloadTimeout = Calendar.HOUR_IN_MILLISECONDS;
    });

    var proto = App.prototype;

    proto.dispose = function () {
        // TODO: dispose all members
        this._services = null;
        if (this._deferredWork) {
            this._deferredWork.dispose();
            this._deferredWork = null;
        }
    };

    proto.onQueryService = function (serviceName) {
        return this._services[serviceName];
    };

    proto.shutdownUI = function () {
        this._ui.shutdownUI();
    };

    proto._getPlatform = function() {
        Debug.call(function () {
            if (!this._platform && window.location.hash.indexOf("#testMode") >= 0) {
                var wlt = Microsoft.WindowsLive.Platform.Test;

                this._harness = new wlt.ClientTestHarness("calendarTest", wlt.PluginsToStart.defaultPlugins, "account@calendar.test", Microsoft.WindowsLive.Platform.ClientCreateOptions.delayResources);
                this._platform = this._harness.client;
            }
        }, this);

        if (!this._platform) {
            var Platform = Microsoft.WindowsLive.Platform,
                Options  = Platform.ClientCreateOptions;

            try {
                _start("createUiPlatform");
                this._platform = new Platform.Client("calendar", Options.delayResources | Options.failIfNoUser | Options.failIfUnverified);
                this._hrPlatform = 0;
                _stop("createUiPlatform");
            } catch (ex) {
                Jx.mark("Calendar:WinRT_GetPlatform_error: " + ex.toString().trim() + " (" + ex.number + ")");
                this._hrPlatform = ex.number;
            }
        }

        return this._platform;
    };

    proto._retryPlatformCreation = function (setError) {
        ///<summary>Attempts to create the platform</summary>
        ///<param name="setError" type="Function" optional="true">Callback to receive the hresult value for the platform creation</param>
        ///<returns type="Boolean">True if the platform was created successfully</returns>
        var platform = this._getPlatform();

        if (setError) {
            setError(this._hrPlatform);
        }

        return Jx.isObject(platform);
    };

    // Events

    proto._onTile = function(ev) {
        _start("_onTile");

        if (ev.arguments && this._ui) {
            Jx.log.info("launched with arguments: " + ev.arguments);

            // getEventFromHandle returns an error HRESULT (which translates into a JS exception) when it 
            // gets a handle with an unexpected format, so we need to put the getEventFromHandle in a try/catch.
            // since _onTile just handles the launched activation, the argument could be anything.  we have also
            // observed cases of old storeobjectid-style ids being passed (BLUE:362200), so until we have
            // identified the cause of that issue, we will still try to handle them

            // we're expecting event handle to be in ev.arguments
            var calEv;
            try {
                calEv = this._platform.calendarManager.getEventFromHandle(ev.arguments);
            } catch (ex) {
                // there was a problem with the handle (missing event would just return null), so try to
                // get the event as an old style id
                Jx.log.exception("tile received invalid handle: " + ev.arguments, ex);
                calEv = this._getEventFromPreHandleToastId(ev.arguments);
            }

            if (calEv) {
                Jx.EventManager.broadcast("editEvent", {event: calEv}, this._ui);
            }
        }

        _stop("_onTile");
    };

    proto._onProtocol = function (ev) {
        _start("_onProtocol");

        var uri    = ev.uri,
            action = uri.host,
            params = uri.queryParsed;        

        // we only support the "focusEvent" action
        if (action === "focusEvent") {
            var data = { 
                startDate: null,
                endDate: null,
                allDayEvent: null,
            };

            for (var i = 0, len = params.length; i < len; i++) {
                var param = params[i];

                switch (param.name) {
                case "start":
                    data.startDate = new Date(parseInt(param.value, 10));
                    break;

                case "end":
                    data.endDate = new Date(parseInt(param.value, 10));
                    break;

                case "allDay":
                    data.allDayEvent = (param.value === "true");
                    break;
                }
            }

            // verify we got the values we need
            if (Jx.isDate(data.startDate) && Jx.isDate(data.endDate) && Jx.isBoolean(data.allDayEvent)) {
                // further verify that the dates are valid
                if (!isNaN(data.startDate.valueOf()) && !isNaN(data.endDate.valueOf())) {
                    // lastly verify the end date is not before the start date
                    if (data.startDate <= data.endDate) {
                        Jx.EventManager.broadcast("focusEvent", data, this._ui);
                    }
                }
            }
        }

        _stop("_onProtocol");
    };

    proto._onShowTimeFrame = function (args) {
        /// <summary>Handles activation for the appointmentsProvider showTimeFrame verb</summary>
        /// <param name="args" type="Windows.ApplicationModel.Activation.IAppointmentsProviderShowTimeFrameActivatedEventArgs">activation arguments</param>

        _start("_onShowTimeFrame");

        // We should only see showTimeFrame here - the provider page should be activated for all other verbs
        var isShowTimeFrame = args.verb === Windows.ApplicationModel.Appointments.AppointmentsProvider.AppointmentsProviderLaunchActionVerbs.showTimeFrame;
        Debug.assert(isShowTimeFrame, "Unexpected appointments activation verb: " + args.verb);

        if (!isShowTimeFrame) {
            // This will launch calendar or bring it to the foreground without doing anything else.
            return;
        }

        // Translate the arguments into our data object
        var durationInMs = Math.round(args.duration);
        var data = {};
        // Since the input comes from a Windows API, the timeToShow date object passed in can be a C++ date object.
        // We've seen issues before where if we add a zero duration to this object, since the C++ date object is more precise than the JS one, 
        // the end date can be (very slightly) before the start date.  Prevent this by re-creating the start date object in JS.
        data.startDate = new Date(args.timeToShow);
        data.endDate = new Date(data.startDate.getTime() + durationInMs);
        data.allDayEvent = false;

        // Windows should make sure that the duration is never negative, so we shouldn't ever hit this.
        Debug.assert(data.startDate <= data.endDate, "endDate should not be before startDate");

        _stop("_onShowTimeFrame");
        Jx.EventManager.broadcast("focusEvent", data, this._ui);
    };

    proto._onCommandsRequested = function (ev) {
        // create the settings pane
        this._settingsPane = new Calendar.Views.Settings();
        this.append(this._settingsPane);
        this._settingsPane.activateUI();

        // tell it to handle this request
        this._settingsPane.appendCommands(ev.request.applicationCommands);

        // now remove ourself as a listener for this event
        ev.target.removeEventListener("commandsrequested", this._onCommandsRequested);
    };

    proto._onSuspending = function () {
        _start("_onSuspending");

        if (this._platform) {
            Debug.assert(!this._suspended);
            this._suspended = true;
            this._platform.suspend();
        }

        _stop("_onSuspending");
    };

    proto._onResuming = function () {
        _start("_onResuming");

        // resume the platform first
        if (this._platform) {
            Debug.assert(this._suspended);
            this._suspended = false;
            this._platform.resume();
        }

        // then fire resuming event for components
        this.fire("resuming");

        // record the perftrack resume point
        Jx.ptStopResume(Jx.TimePoint.responsive);

        _stop("_onResuming");
    };

    proto._onVisibilityChange = function () {
        // we only want to reload the app in the foreground
        // also don't handle the incoming visibility change if we've been told to suspend (work around for BLUE:459992)
        if (!document.msHidden && !this._suspended) {
            
            if (Jx.appData.localSettings().get("disableReload")) {
                return;
             }            
            
            var runningTime = (Date.now() - this._time);

            if (App._reloadTimeout < runningTime) {
                if (!this._ui || !this._ui.isEditing()) {
                    _start("reload");

                    Jx.EventManager.broadcast("reload");
                    window.location.reload();

                    _stop("reload");
                }
            }
        }
    };

    // Jx Events

    proto._onGetPlatform = function (ev) {
        if (!ev.handled) {
            Debug.assert(this._platform);

            ev.data.platform = this._platform;
            ev.handled = true;
        }
    };

    proto._onGetPlatformWorker = function (ev) {
        if (!ev.handled) {
            Debug.assert(this._platformWorker);

            ev.data.platformWorker = this._platformWorker;
            ev.handled = true;
        }
    };

    proto._onGetSettings = function (ev) {
        if (!ev.handled) {
            // get and cache our settings
            if (!this._settingsContainer) {
                var appData       = new Jx.AppData(),
                    localSettings = appData.localSettings();
                this._settingsContainer = localSettings.container("Calendar");
            }

            ev.data.settings = this._settingsContainer;
            ev.handled = true;
        }
    };

    proto._onSetShowArrows = function (ev) {
        if (!ev.handled) {
            this._settingsContainer.set("alwaysShowArrows", ev.data.value);
            Jx.EventManager.broadcast("showArrows", ev.data, this._ui);

            ev.handled = true;
        }
    };

    proto._onViewReady = function (ev) {
        if (ev.stage === Jx.EventManager.Stages.bubbling) {
            // let the children add work first

            var deferredWork = this._deferredWork;

            if (this._firstRun) {
                this._firstRun = false;

                var Accounts = People.Accounts;
                var idle = People.Priority.launch;

                // These are jobs that need to be done once per app
                deferredWork.queue("PlatformInit", 50, idle, this._platformInit, this);
                deferredWork.queue("NetFirstRun", 50, idle, Accounts.ensureNetworkOnFirstRun, null, [this._platform]);
                deferredWork.queue("EasiId", 50, idle, Accounts.checkForEasiId, null, [this._platform, App.scenario]);
                deferredWork.queue("JxLaunch", 50, idle, Jx.launch.startDeferredTasks, Jx.launch, [this._platform]);
                deferredWork.queue("LockScreen", 50, idle, Chat.Shared.ensureLockScreen);

                Debug.only(deferredWork.queue("BVT", 50, idle, function () {
                    Jx.loadScript("/ModernShared/uibvt/bvtLoader.js").then(function () {
                       
                        var map = {},
                            query = document.location.hash;
                        var url = decodeURIComponent(query);
                        
                        if (url.indexOf("?") === -1) {
                            // We only care if there are parameters after the ?. If no ?, no parameters.
                            map = null;
                        } else {
                            var parameters = url.substring(url.indexOf("?") + 1).split("&");
                            // Split returns an array of length 1 with an empty string when no elements are found.
                            if (parameters.length === 1 && parameters[0] === "") {
                                map = null;
                            } else {
                                parameters.forEach(function (parameter) {
                                    var pair = parameter.split("=");
                                    map[pair[0]] = pair[1] || "";
                                });
                            }
                        }
                        
                        return BVT.lab(map);
                    });
                }));
            }

            // The children can enqueue work on view change so we need to run the scheduler on each viewReady event.
            _info("RunDeferredWork");
            deferredWork.unlock();
        }
    };

    proto._platformInit = function () {
        _start("_platformInit");
        // let the platform load its plugins and kick off sync
        this._platform.addEventListener("restartneeded", App._onRestartNeeded);
        this._platform.requestDelayedResources();
        Jx.forceSync(this._platform, Calendar.scenario);
        _stop("_platformInit");
    };

    // App

    proto.initialize = function () {
        // try to load the platform
        if (this._getPlatform()) {
            this._hadConnectedId = true;
            this._initUi();
        } else {
            var getPlatform = this._retryPlatformCreation.bind(this),
                initUi      = this._initUi.bind(this);
            People.Accounts.showLogonErrorDialog(getPlatform, initUi, this._hrPlatform);
        }
    };

    proto._hookSuspend = function () {
        var activation = Jx.activation;
        activation.addListener(activation.suspending, this._onSuspending, this);
    };

    proto._hookSettings = function () {
        // bind our callback
        this._onCommandsRequested = this._onCommandsRequested.bind(this);

        // add our listener
        var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
        settingsPane.addEventListener("commandsrequested", this._onCommandsRequested);
    };

    proto._hookShare = function () {
        // listen for share source requests
        var shareManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        shareManager.addEventListener("datarequested", this._onShareSourceDataRequested.bind(this));
    };

    proto._onShareSourceDataRequested = function(ev) {
        // call into the frame to populate the share content
        this._ui.getShareData(ev.request);
    };

    App._onRestartNeeded = function() {
        // Present the user with a full-screen dialog informing them that they need
        // to sign-in to continue.
        People.Accounts.showMustSignInDialog(function () {
            // This will be invoked when the user hits the "try again" link
            // in the dialog.
            location.reload();
        }, true /*forceShow*/);
    };

    // UI

    proto._initUi = function() {
        _start("_initUi");

        // we need a scheduler for our ui work
        this._scheduler = new People.Scheduler();
        this._jobset    = this._scheduler.getJobSet();

        // if our host still exists, create our ui.  it won't exist if jx.launch
        // is forcing an upgrade.
        if (this._host) {
            // set up our worker
            if (!this._hadConnectedId) {
                this._platformWorker.postCommand("Worker/restartPlatform");
            }

            this._platformWorker.postCommand(
                "Worker/DOMContentLoaded",
                { isRtl: getComputedStyle(document.documentElement).direction === "rtl" }
            );

            // create our frame component
            this._ui = new Calendar.Views.Frame();
            this.appendChild(this._ui);

            // and initialize it once our resources are loaded
            this._ui.initUI(this._host, this._jobset);
        }

        // now that our UI is up, do some additional work
        this._hookSuspend();
        this._hookSettings();
        this._hookShare();

        _stop("_initUi");
    };

    proto._onResize = function() {
        _start("_onResize");

        // don't handle the incoming resize if we've been told to suspend (work around for BLUE:459992)
        if (!this._suspended) {

            // The resize handler should do as less work as possible to avoid the 200ms OS snapshot
            // See http://windowsblue/tenets/performance/Pages/Resize.aspx
            setImmediate(function () {

                var data = { outerWidth: window.outerWidth };

                // We don't want to reformat our layout unless the width changes.
                if (this._lastOuterWidth !== data.outerWidth) {
                    this._deferredWork.lock();
                    Jx.EventManager.broadcast("resizeWindow", data);
                    var isMajorChange = true;
                    var isRotate = false;
                    Jx.ptStopResize(Jx.TimePoint.responsive, isMajorChange, isRotate, data.outerWidth, window.outerHeight);
                    this._deferredWork.unlock();
                    this._lastOuterWidth = data.outerWidth;
                }
            }.bind(this));

        }
        _stop("_onResize");
    };

    proto._getEventFromPreHandleToastId = function(toastId) {
        /// <summary>tries to retrieve an event from the platform treating the passed toast id the way we did
        ///     before introducing event handles</summary>
        /// <param name="id" type="String">the id to try to treat as a pre-event handle identifier. such ids
        ///     have one of the following formats:
        ///     STOREOBJECTID for an single occurrence event
        ///     STOREOBJECTID.JSTIMESTAMP.toast for recurrences
        ///     STOREOBJECTID is the decimal representation of an event store object id
        ///     JSTIMESTAMP is an integer value that can be passed to a Date ctor to reconstruct the date of a
        ///     particular recurrence or exception
        ///     toast is literal and can be ignored
        ///     </param>
        /// <returns type="IEvent">the event the id represents, or null if the id is malformed or the event does
        ///     not exist</returns>

        var result = null;

        if (toastId) {
            // try to split
            var fields = toastId.split(".", 2);
            var id = parseInt(fields[0], 10);
            var startDate;

            if (fields.length > 1) {
                startDate = new Date(parseInt(fields[1], 10));
            }

            result = this._loadEvent(id, startDate);
        }

        return result;
    };

    proto._loadEvent = function (eventId, instanceStartDate) {
        /// <summary>
        /// Gets the given event from the platform using the object store id plus instance date method.
        /// DO NOT USE THIS METHOD IN NEW CODE!  This has been brought back in to handle cases where
        /// such ids are being fired in toasts.  Ideally, once we know why these legacy toasts are 
        /// persisting we will be able to remove this again.
        /// </summary>
        /// <param name="eventId">store object id of the event</param>
        /// <param name="instanceStartDate" optional="true" type="Date">instance ID of the event (if appropriate)</param>
        /// <returns>Loaded IEvent (will be the instanced event if appropriate), or null if not found.</returns>

        var manager = this._platform.calendarManager,
            targetEvent = null;

        try {
            targetEvent = manager.getEventFromID(eventId);

            if (instanceStartDate && targetEvent) {
                targetEvent = targetEvent.getOccurrence(instanceStartDate);
            }
        } catch (ex) {
            // Couldn't load event - event doesn't exist.
            Jx.log.exception("unable to load eventId [" + eventId + "] with instanceStartDate [" + instanceStartDate + "]", ex);
            targetEvent = null;
        }

        return targetEvent;
    };

    var WorkQueue = Calendar.WorkQueue = function () {
        this._queue = [];
        this._job = null;
        this._locked = true; // starts locked
        Debug.only(Object.seal(this));
    };

    WorkQueue.prototype = {
        dispose: function () {
            this._queue = null;
            if (this._job) {
                this._job.dispose();
                this._job = null;
            }
        },

        queue: function (description, delay, priority, fn, context, args) {
            ///<summary>Queues a job to the work queue.</summary>
            ///<param name="description" type="String">The description of the job.</param>
            ///<param name="delay" type="Number">The time in milliseconds to delay starting this job.</param>
            ///<param name="priority">The priority of this job.</param>
            ///<param name="fn" type="Function">The function that will be called.</param>
            ///<param name="context" optional="true">The this context for the callback function.</param>
            ///<param name="args" type="Array" optional="true">The arguments that will be passed to the callback function call.</param>
            Debug.assert(Jx.isNonEmptyString(description));
            Debug.assert(Jx.isValidNumber(delay) && delay > 11); // timers with less than 11ms are loading extra dlls
            Debug.assert(Jx.isObject(priority));
            Debug.assert(Jx.isFunction(fn));
            Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context));
            Debug.assert(Jx.isNullOrUndefined(args) || Jx.isArray(args));

            var queue = this._queue;

            // remove work items with the same description that were not scheduled yet
            for (var i = queue.length - 1; i >= 0; i--) {
                if (description === queue[i].description) {
                    _info("WorkQueue: remove:" + description);
                    queue.splice(i, 1);
                }
            }

            queue.push({ description: description, delay: delay, priority: priority, fn: fn, context: context, args: args });
        },

        _run: function () {
            var queue = this._queue;
            if (!this._locked && !this._job && (queue.length > 0)) {
                var item = queue.shift();
                this._job = Jx.scheduler.addTimerJob(null, item.priority, item.description, item.delay, function () {
                    this._job = null;
                    item.fn.apply(item.context, item.args);
                    this._run();
                }, this);
            }
        },

        lock: function () {
            this._locked = true;
        },

        unlock: function () {
            this._locked = false;
            this._run();
        },
    };
});
