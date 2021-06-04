/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../../common/js/tracing.js" />
/// <reference path="../../../common/js/utilities.js" />
/// <reference path="../../../common/js/errors.js" />

(function () {
    "use strict";

    // private static members
    var POP_VISUAL_IDENTITY = "bingsearch://data/popvisual";
    var POP_VISUAL_COUNT = 10;
    // Tag name for items in visual and text popular now feed
    var ELEMENT_TAG_FOR_VISUAL_AND_TEXT_POP_TRENDS = "Element";
    var RequiredProperties = Object.freeze({
        Image: true,
        ImageCredit: true,
        SearchTermActual: true,
        SearchTermDisplay: true,
        Text: false,
        ThumbnailURI: false,
		Url: true
    });

    function dateWithOffset(offset) {
        /// <summary>
        /// function to calculate current local time
        /// given the timezones's UTC offset
        /// </summary>
        /// <param name="offset" type="Number">
        /// time zone's offset from UTC in hours
        /// </param>
        /// <returns>
        /// date in timezone with given offset
        /// </returns>

        // create Date object for current location
        var current = new Date();
    
        // convert to msec
        // add local time zone offset 
        // get UTC time in msec
        var utc = current.getTime() + (current.getTimezoneOffset() * 60000);
    
        // create new Date object for different timezone
        // using supplied offset
        var newDate = new Date(utc + (3600000*offset));
    
        // return time as a string
        return newDate;

    }

    function createYYYYMMDDFormat(date) {
        /// <summary>
        /// returnes a string in YYYYMMDD format based on the given date
        /// </summary>
        /// <param name="date" type="Object">
        /// the date object passed
        /// </param>
        /// <returns>
        /// string with YYYYMMDD format of the date
        /// </returns>
        if (!date || isNaN(date.getTime())) {
            // date is not valid
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("date");
        }
        var month = date.getMonth() + 1;
        if (month < 10) { month = "0" + month; }
        var day = date.getDate();
        if (day < 10) { day = "0" + day; }
        return "" + date.getFullYear() + month + day;
    };


    function getPopVisualUrl() {
        /// <summary>
        /// returns url for visual popular trends
        /// </summary>
        /// <returns type="Object">
        /// string of complete url for visual popular trends
        /// </returns>
        return { url: BingApp.locator.env.getDataProviderUrl(BingApp.Classes.TrendingController.trendIds.popularNowVisual).replace("{date}", createYYYYMMDDFormat(dateWithOffset(-8))) };
    }

    function parsePopVisualDocument(responseText) {
        /// <summary>
        /// Parses the text input taken from popular visual feed and returns javascript list of news elements
        /// </summary>
        /// <param name="responseText" type="String">
        /// response text from XHR request to popular visual feed
        /// </param>
        /// <returns type="Array">
        /// items in a the array will have following format:
        ///     {
        ///         Image: "http://az29176.vo.msecnd.net/popnow-images/5-23-2012HeroV_0523A_DWTS.jpg"
        ///         ImageCredit: "© Adam Taylor/ABC"
        ///         SearchTermActual: "Wins mirror ball"
        ///         SearchTermDisplay: "Wins mirror ball"
        ///         Text: ""
        ///         ThumbnailURI: "http://az29176.vo.msecnd.net/popnow-images/5-23-2012ThumbTile_0523A_DWTS.jpg"
        ///         Url: "http://www.bing.com/videos/watch/video/wednesday-may-23-dancing-crowns-a-surprising-winner/51jahzf?form=IPADPN"
        ///     }
        /// </returns>
        if (BingApp.Utilities.isNullOrUndefined(responseText)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("responseText");
        }
        var doc;
        try {
            doc = new Windows.Data.Xml.Dom.XmlDocument();   // Create an empty document
            doc.loadXml(responseText);              //  Parse text into it
        } catch (err) {
            BingApp.traceError("PopVisualDataProvider.parsePopVisualDocument: Input is not valid xml - error name: {0}, error message: {1}", err.name ? err.name : "", err.message ? err.message : "");
            throw (new BingApp.Classes.ErrorArgument("responseText", "response from visual popular now is not a valid Xml"));
        }
        var elements = doc.selectNodes("//" + ELEMENT_TAG_FOR_VISUAL_AND_TEXT_POP_TRENDS);
        var count = elements.length;
        var results = [];
        for (var i = 0; i < count; i++) {
            var element = elements[i];
            var data = element.childNodes;
            var singleItem = {};
            var corruptDataElement = false;
            for (var j = 0; j < data.length; j++) {
                var value = data[j];
				if (value && !value.nodeName) {
				    BingApp.traceInfo("PopVisualDataProvider.parsePopVisualDocument: element in document is defective: {0}", value);
                    corruptDataElement = true;
                    break;
                }
                singleItem[value.nodeName] = value.innerText;
            }
            if (!corruptDataElement) {
                for (var property in RequiredProperties) {
                    if (RequiredProperties[property] && !singleItem[property]) {
                        corruptDataElement = true;
                        break;
                    }
                }
            }
            if (corruptDataElement) {
                continue;
            }
            singleItem.type = "image";
            results.push(singleItem);
        }
        return results;
    }

    /// <summary>
    /// Defines class that implements popular now Visual data provider.
    /// items in a json array from getItems having following format:
    ///     {
    ///         Image: "http://az29176.vo.msecnd.net/popnow-images/5-23-2012HeroV_0523A_DWTS.jpg"
    ///         ImageCredit: "© Adam Taylor/ABC"
    ///         SearchTermActual: "Wins mirror ball"
    ///         SearchTermDisplay: "Wins mirror ball"
    ///         Text: ""
    ///         ThumbnailURI: "http://az29176.vo.msecnd.net/popnow-images/5-23-2012ThumbTile_0523A_DWTS.jpg"
    ///         Url: "http://www.bing.com/videos/watch/video/wednesday-may-23-dancing-crowns-a-surprising-winner/51jahzf?form=IPADPN"
    ///     }
    /// </summary>
    WinJS.Namespace.define("BingApp.Classes", {
        PopVisualDataProvider: WinJS.Class.derive(
            BingApp.Classes.XhrDataProvider,
            function () {
                if (!(this instanceof BingApp.Classes.PopVisualDataProvider)) {
                    BingApp.traceWarning("PopVisualDataProvider.ctor: Attempted using PopVisualDataProvider ctor as function; redirecting to use 'new PopVisualDataProvider()'.");
                    return new BingApp.Classes.PopVisualDataProvider();
                }
                BingApp.Classes.XhrDataProvider.call(this, POP_VISUAL_IDENTITY, POP_VISUAL_COUNT, { urlOptions: getPopVisualUrl, parser: parsePopVisualDocument });

            })
    });

})();
