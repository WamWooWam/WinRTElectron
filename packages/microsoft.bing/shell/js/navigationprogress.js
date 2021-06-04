/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='progress.js' />
/// <reference path='navigation.js' />
(function () {
    "use strict";

    var currentNavigationManager;
    var currentProgressIndicatorService;
    var currentNavigationJob;
    var jobCount = 0;

    var startNavigationJob = function () {
        /// <summary>
        /// Internal function used to start progress job for navigation operation.
        /// </summary>
        jobCount++;
        BingApp.traceInfo("NavigationProgressTracking.startNavigationJob: incrementing job counter for new navigation operation. Current number is at {0}.", jobCount);

        if (!currentNavigationJob) {
            currentNavigationJob = currentProgressIndicatorService.startJob();
            BingApp.traceInfo("NavigationProgressTracking.startNavigationJob: creating progress tracking job for navigation.");
        }
    };

    var finishNavigationJob = function () {
        /// <summary>
        /// Internal function used to stop progress job for navigation operation.
        /// </summary>
        if (currentNavigationJob) {
            jobCount--;
            BingApp.traceInfo("NavigationProgressTracking.finishNavigationJob: decrementing job counter for new navigation operation. Current number is at {0}.", jobCount);

            if (jobCount === 0) {
                currentProgressIndicatorService.finishJob(currentNavigationJob);
                currentNavigationJob = null;
                BingApp.traceInfo("NavigationProgressTracking.finishNavigationJob: finishing progress tracking job for navigation.");
            }
        } else {
            BingApp.traceError("NavigationProgressTracking.finishNavigationJob: handling navigation operation completion but there is no active progress tracking job for it.");
        }
    };

    var navigationStartedHandler = function (args) {
        /// <summary>
        /// Handler for navigation started event.
        /// </summary>
        /// <param name="args">
        /// Event-related data.
        /// </param>
        startNavigationJob();
    };

    var navigationCompletedHandler = function (args) {
        /// <summary>
        /// Handler for navigation completed event.
        /// </summary>
        /// <param name="args">
        /// Event-related data.
        /// </param>
        if (args.error || args.canceled) {
            finishNavigationJob();
        }
    };

    var contentLoadedHandler = function (args) {
        /// <summary>
        /// Handler for content loaded event.
        /// </summary>
        /// <param name="args">
        /// Event-related data.
        /// </param>
        finishNavigationJob();
    };

    var initNavigationTracking = function (navigationManager, progressIndicatorService) {
        /// <summary>
        /// Sets up listeners for navigation events that are used to track the progress of 
        /// navigation operations.
        /// </summary>
        /// <param name="navigationManager" type="BingApp.Classes.NavigationManager">
        /// Navigation manager object which raises navigation related events.
        /// </param>
        /// <param name="progressIndicatorService" type="BingApp.Classes.ProgressIndicatorService">
        /// Progress indicator service manager object which raises navigation related events.
        /// </param>
        if (!navigationManager) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("navigationManager");
        }

        if (!progressIndicatorService) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("progressIndicatorService");
        }

        if (currentNavigationManager || currentProgressIndicatorService || currentNavigationJob) {
            resetNavigationTracking();
        }

        currentProgressIndicatorService = progressIndicatorService;
        currentNavigationManager = navigationManager;

        var navigationEvents = BingApp.Classes.NavigationManager.events;
        currentNavigationManager.addEventListener(navigationEvents.navigationStarted, navigationStartedHandler);
        currentNavigationManager.addEventListener(navigationEvents.navigationCompleted, navigationCompletedHandler);
        currentNavigationManager.addEventListener(navigationEvents.contentLoaded, contentLoadedHandler);
    }

    var resetNavigationTracking = function () {
        /// <summary>
        /// Resets internal objects used to track the progress of navigation operations.
        /// </summary>
        if (currentNavigationManager) {
            var navigationEvents = BingApp.Classes.NavigationManager.events;
            currentNavigationManager.removeEventListener(navigationEvents.navigationStarted, navigationStartedHandler);
            currentNavigationManager.removeEventListener(navigationEvents.navigationCompleted, navigationCompletedHandler);
            currentNavigationManager.removeEventListener(navigationEvents.contentLoaded, contentLoadedHandler);
        } else {
            BingApp.traceWarning("NavigationProgressTracking.resetNavigationTracking: resetTracking was called before initTracking.");
        }

        if (jobCount > 0 || currentNavigationJob) {
            BingApp.traceInfo("NavigationProgressTracking.resetNavigationTracking: job counter was at {0}; resetting it to zero.", jobCount);
            jobCount = 0;

            if (currentNavigationJob) {
                if (currentProgressIndicatorService) {
                    currentProgressIndicatorService.finishJob(currentNavigationJob);
                }

                currentNavigationJob = null;

                BingApp.traceInfo("NavigationProgressTracking.resetNavigationTracking: finishing progress tracking job for navigation.");
            } else {
                BingApp.traceError("NavigationProgressTracking.resetNavigationTracking: job counter was non-zero but progress tracking job was not found.");
            }
        };

        currentNavigationManager = null;
        currentProgressIndicatorService = null;
    }

    // Expose navigation tracking functionality as static members of BingApp.Classes.NavigationManager
    WinJS.Namespace.define("BingApp.Classes.NavigationManager", {
        initTracking: initNavigationTracking,
        resetTracking: resetNavigationTracking
    });
})();
