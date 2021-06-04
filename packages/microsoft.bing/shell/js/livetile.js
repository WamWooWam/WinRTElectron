/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="env.js" />
(function () {
    "use strict";

    function constructor(env, notifications) {
        /// <summary>
        /// Allocates a new instance of the BingApp.Classes.LiveTile class.
        /// </summary>
        /// <param name="env" type="BingApp.Classes.Env">
        /// The object containing the environment data.
        /// </param>
        /// <param name="notifications">
        /// The namespace which contains classes encapsulating tile notifications.
        /// </param>
        this._env = env;
        this._notifications = notifications;
    }

    function registerPolling() {
        /// <summary>
        /// Registers for periodic tile notifications.
        /// </summary>
        var pollUrl = this._env.getHostUrl() + "/livetile/?";
        pollUrl = pollUrl + this._env.getQueryString();

        // append the app version so that we do not redirect for kr language, without this the live tile
        // query to http://www.bing-int.com/livetile?cc=kr redirects to http://bing.search.daum.net/bing?q=bing
        pollUrl = pollUrl + "&w8-version=" + BingApp.Classes.Shell.fullVersion;

        var tileUpdater = this._notifications.TileUpdateManager.createTileUpdaterForApplication();
        var frequency = this._notifications.PeriodicUpdateRecurrence.daily;
        var uri = new Windows.Foundation.Uri(pollUrl);
        var startTime = getPollStartTime();

        // Trigger immediate live tile update in addition to scheduled polling
        tileUpdater.startPeriodicUpdate(uri, startTime, frequency);
    }

    function getPollStartTime() {
        /// <summary>
        /// Gets the correct time to start polling for live tile updates. This
        /// time should be between midnight and 1 am local time, and should be
        /// different values for different users to ensure even sever load.
        /// </summary>
        /// <returns>
        /// A time between midnight and 1am to start polling.
        /// </returns>
        var startTime = new Date();
        startTime.setDate(startTime.getDate() + 1); // Increment to tomorrow
        startTime.setHours(0);                      // Leave min/sec intact, but set hour to 12am.

        return startTime;
    }

    var instanceMembers = {
        // public
        registerPolling: registerPolling,

        // non-enumerable
        _env: null,
        _notifications: null
    };

    var staticMembers = {};

    WinJS.Namespace.define("BingApp.Classes", {
        LiveTile: WinJS.Class.define(constructor, instanceMembers, staticMembers)
    });
})();