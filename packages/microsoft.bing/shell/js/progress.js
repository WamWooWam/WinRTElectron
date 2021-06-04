/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='eventrelay.js' />
/// <reference path='globaleventrelay.js' />
/// <reference path='shell.js' />
/// <reference path='servicelocator.js' />
(function () {
    "use strict";

    /// <summary>
    /// Name that is used when progress job does not have explicit name specified.
    /// </summary>
    var anonymousJob = "anonymous";

    /// <summary>
    /// Events handled by progress indicator service.
    /// </summary>
    var events = Object.freeze({
        /// <summary>
        /// This event is used to start showing progress indicator. It allows for specifying
        /// optional arguments object in the following format:
        ///     {
        ///         name: /*Optional. Progress indicator job id. If omitted then default 
        ///                     'anonymous' name will be used. It is recommended to specify
        ///                     unique name for troubleshooting purposes.*/
        ///     }
        /// </summary>
        start: "progress:start",
        /// <summary>
        /// This event is used to stop showing progress indicator. Event arguments object 
        /// should match by value the event arguments specified for 'start' event. 
        finish: "progress:finish",
    });

    /// <summary>
    /// Defines class that exposes service for tracking busy state of the application.
    /// </summary>
    var ProgressIndicatorService = WinJS.Class.define(
        function (eventRelay) {
            /// <summary>
            /// Initializes a new instance of BingApp.Classes.ProgressIndicatorService class.
            /// </summary>
            /// <param name="eventRelay" optional="true" type="BingApp.Classes.EventRelay">
            /// Optional event relay object which allows for handling progress-related messages.
            /// </param>
            if (!(this instanceof BingApp.Classes.ProgressIndicatorService)) {
                BingApp.traceWarning("ProgressIndicatorService.ctor: Attempted using ProgressIndicatorService ctor as function; redirecting to use 'new ProgressIndicatorService()'.");
                return new BingApp.Classes.ProgressIndicatorService(eventRelay);
            }

            Object.defineProperties(this, {
                // Stores array of job objects that are being tracked
                jobs: { value: [], writable: false, enumerable: false, configurable: false },
                // Stores object which maps name to specific progress job
                namedJobs: { value: {}, writable: false, enumerable: false, configurable: false },
                // Stores flag indicating whether progress indicator control is currently being shown
                showingIndicator: { value: false, writable: true, enumerable: false, configurable: false },
            });

            // Register to listen for progress-related messages 
            var that = this;
            if (eventRelay) {
                eventRelay.addEventListener(events.start, {
                    callback: function (data) {
                        that._onMessageStartJob(data);
                    }
                });
                eventRelay.addEventListener(events.finish, {
                    callback: function (data) {
                        that._onMessageFinishJob(data);
                    }
                });
            }
        },
        {
            startJob: function () {
                /// <summary>
                /// Issues a ticket for tracking completion of asynchronous operation.
                /// The application will be in busy state until this object recieves notification
                /// about job completion.
                /// </summary>
                /// <returns>
                /// Object that uniquely identifies the job.
                /// </returns>
                var startTime = Date.now();

                var job = { start: startTime };
                this.jobs.push(job);

                if (!this.showingIndicator) {
                    this.showingIndicator = true;
                    var shell = BingApp.locator.shell;
                    if (shell) {
                        shell.showProgressIndicator();
                    }
                }

                return job;
            },
            finishJob: function (job) {
                /// <summary>
                /// Indicates that given job is completed.
                /// </summary>
                /// <param name="job">
                /// Ticket issued to identify the job
                /// </param>
                var index = this.jobs.indexOf(job);
                if (index >= 0) {
                    this.jobs.splice(index, 1);

                    // stop showing progress indicator once there is no active jobs
                    if (this.showingIndicator && this.jobs.length === 0) {
                        this.showingIndicator = false;
                        var shell = BingApp.locator.shell;
                        if (shell) {
                            shell.hideProgressIndicator();
                        }
                    }
                }
            },
            _onMessageStartJob: function (data) {
                /// <summary>
                /// Handles message indicating that service should start new progress job.
                /// </summary>
                /// <param name="data">
                /// Data object that was passed with message.
                /// </param>
                var jobName = anonymousJob;
                if (data && data.name) {
                    jobName = data.name;
                } else {
                    BingApp.traceWarning(
                        "ProgressIndicatorService._onMessageStartJob: job name has not been specified; using '{0}' name.",
                        jobName);
                }

                var runningJobs = this.namedJobs[jobName];
                if (!runningJobs) {
                    runningJobs = [];
                    this.namedJobs[jobName] = runningJobs;
                }

                var job = this.startJob();
                runningJobs.push(job);

                BingApp.traceInfo(
                    "ProgressIndicatorService._onMessageStartJob: started running '{0}' job (job counter={1}, overall counter={2}).",
                    jobName,
                    runningJobs.length,
                    this.jobs.length);
            },
            _onMessageFinishJob: function (data) {
                /// <summary>
                /// Handles message indicating that service should stop running progress job.
                /// </summary>
                /// <param name="data">
                /// Data object that was passed with message.
                /// </param>
                var jobName = anonymousJob;
                if (data && data.name) {
                    jobName = data.name;
                } else {
                    BingApp.traceWarning(
                        "ProgressIndicatorService._onMessageFinishJob: job name has not been specified; using '{0}' name.",
                        jobName);
                }

                var runningJobs = this.namedJobs[jobName];
                if (!runningJobs) {
                    BingApp.traceError(
                        "ProgressIndicatorService._onMessageFinishJob: there is no record of running job with '{0}' name.",
                        jobName);
                    return;
                }

                var job = runningJobs.pop();
                this.finishJob(job);

                BingApp.traceInfo(
                    "ProgressIndicatorService._onMessageFinishJob: finished running '{0}' job (job counter={1}, overall counter={2}).",
                    jobName,
                    runningJobs.length,
                    this.jobs.length);
            },
        },
        {
            events: events,
        });

    // Expose ProgressIndicatorService class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        ProgressIndicatorService: ProgressIndicatorService
    });
})();
