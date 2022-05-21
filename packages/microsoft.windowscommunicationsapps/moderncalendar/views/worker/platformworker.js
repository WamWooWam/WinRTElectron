
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Windows,Calendar,Microsoft,msWriteProfilerMark,Jx*/

(function(global) {

function _start(evt) { msWriteProfilerMark("Calendar:PlatformWorker." + evt + ",StartTA,Calendar"); }
function _stop(evt)  { msWriteProfilerMark("Calendar:PlatformWorker." + evt + ",StopTA,Calendar");  }

//
// Namespaces
//

global.Calendar = global.Calendar || {
    Helpers: {},
    Views:   {}
};

//
// Imports
//


    global.addEventListener("message", function onInitialMessage(ev) {
        var mode = ev.data.name;
        

            // we import all our scripts here, because IE blocks importScripts on the UI
            // thread.  considering that, we can't afford to load them on demand.
            _start("ImportScripts");
                global.importScripts(
                    "Router.js", 
                    "/Jx/JxWorker.js", 
                    "../Scheduler/Scheduler.js", 
                    "../Helpers/Data.js",
                    "../Month/Worker.js",
                    "../Week/Worker.js",
                    "../Day/Worker.js",
                    "../FreeBusy/Worker.js",
                    "../Agenda/AgendaHelpers.js",
                    "../Agenda/AgendaWorker.js"
                );
            _stop("ImportScripts");

            //
            // AppData
            //

            // we want to load app data early.  this warms it for the entire app,
            // so when the ui thread needs it, it'll be faster.
            _start("createAppData");
            var localSettings = Windows.Storage.ApplicationData.current.localSettings;
            _stop("createAppData");

            // Start the ETW session
            Jx.startSession();

            //
            // Platform
            //

            function createPlatform() {
                var Platform = Microsoft.WindowsLive.Platform,
                    Options  = Platform.ClientCreateOptions;

                try {
                    _start("CreatePlatform");
                        
                            if (mode === "#testMode") {
                                var wlt = Microsoft.WindowsLive.Platform.Test;

                                global._harness  = new wlt.ClientTestHarness("calendarTest", wlt.PluginsToStart.defaultPlugins, "account@calendar.test");
                                global._platform = global._harness.client;
                            } else {
                                
                                    global._platform = new Platform.Client("calendarWorker", Options.failIfNoUser | Options.failIfUnverified);
                                
                            }
                        

                        global._manager = global._platform.calendarManager;
                    _stop("CreatePlatform");
                } catch (ex) {
                    msWriteProfilerMark("Calendar:PlatformWorker.CreatePlatform Error: " + ex.number);
                }

                return global._platform;
            }

            createPlatform();

            //
            // Router
            //

            global._router = new Calendar.Router();
            global._router.initialize(global);

            //
            // View Workers
            //

            global._scheduler = new Calendar.Scheduler(100 /* timeSlice */);

            var viewWorkersCreated = false;

            function setRtl(isRtl) {
                global._isRtl = isRtl;

                if (viewWorkersCreated) {
                    global._month._isRtl    = isRtl;
                    global._week._isRtl     = isRtl;
                    global._day._isRtl      = isRtl;
                    global._freeBusy._isRtl = isRtl;
                    global._agenda._isRtl   = isRtl;
                }
            }

            function createViewWorkers(router, scheduler, platform) {
                var calendarManager = platform.calendarManager;

                global._month    = new Calendar.Views.MonthWorker(router,    scheduler, calendarManager);
                global._week     = new Calendar.Views.WeekWorker(router,     scheduler, calendarManager);
                global._day      = new Calendar.Views.DayWorker(router,      scheduler, calendarManager);
                global._freeBusy = new Calendar.Views.FreeBusyWorker(router, scheduler, platform.accountManager, calendarManager);
                global._agenda   = new Calendar.Views.AgendaWorker(router,   scheduler, calendarManager);

                viewWorkersCreated = true;

                if (global._isRtl) {
                    setRtl(global._isRtl);
                }
            }

            //
            // Initialization
            //

            // if we have a platform, go ahead and create everything else
            if (global._platform) {
                createViewWorkers(global._router, global._scheduler, global._platform);
            } else {
                // otherwise, wait to be retold to restart the platform
                global._router.route("Worker/restartPlatform", function() {
                    if (createPlatform()) {
                        createViewWorkers(global._router, global._scheduler, global._platform);
                    }
                });
            }

            global._router.route("Worker/DOMContentLoaded", function (ev) {
                setRtl(ev.data.isRtl);
            });

        
        global.removeEventListener("message", onInitialMessage);
    });


})(this);

