// This background task is executed upon the user's first login to setup the
// Bing App live tile. The task is not executed by normal app install, it is 
// only invoked by Windows when we're bundled as an OEM app. 

(function (notifications) {
    // TODO: Bug 159968 This duplicates code in livetile.js and env.js
    var market = new Windows.ApplicationModel.Resources.ResourceLoader("market");
    var queryParams = {
        cc: Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion,
        setlang: Windows.System.UserProfile.GlobalizationPreferences.languages[0]
    };

    var params = [];

    Object.keys(queryParams).forEach(function (key) {
        params.push(key + "=" + queryParams[key]); 
    });

    var querystring = params.join("&");

    // append the app version so that we do not redirect for kr language, without this the live tile
    // query to http://www.bing-int.com/livetile?cc=kr redirects to http://bing.search.daum.net/bing?q=bing
    var version = Windows.ApplicationModel.Package.current.id.version;
    var versionQueryParamVal = version.major + "." + version.minor + "." + version.build + "." + version.revision;
    querystring += "&w8-version=" + versionQueryParamVal;
    
    var pollUrl = "http://www.bing.com/livetile?" + querystring;
    var tileUpdater = notifications.TileUpdateManager.createTileUpdaterForApplication();
    var frequency = notifications.PeriodicUpdateRecurrence.daily;
    var uri = new Windows.Foundation.Uri(pollUrl);

    tileUpdater.startPeriodicUpdate(uri, frequency);
    close();
})(Windows.UI.Notifications);
