/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../../common/js/tracing.js" />
/// <reference path="../../../common/js/utilities.js" />
/// <reference path="../../../common/js/errors.js" />

(function () {
    "use strict";

    var BING_NEWS_IDENTITY = "bingsearch://data/bingnews";
    var BING_NEWS_COUNT = 20;
    var RequiredProperties = Object.freeze({
        Category: false,
        Date: false,
        Snippet: true,
        Source: true,
        Title: true,
        Url: true,
        Image: true
    });

    function parseBingNewsDocument(responseText) {
        /// <summary>
        /// Parses the text input taken from Bing's news feed and returns javascript list of news elements
        /// </summary>
        /// <param name="responseText" type="String">
        /// response text from XHR request to Bing news feed
        /// </param>
        /// <returns type="Array">
        /// items in a the array will have following format:
        /// {
        ///    Category:    "rt_Sports",
        ///    Date[date]:  Tue Jun 5 13:54:35 PDT 2012,
        ///    Image {
        ///         Height: 232
        ///         Url:    "http://www.bing.com/imagenewsfetcher.aspx?q=http%3a%2f%2fl1.yimg.com%2fbt%2fapi%2fres%2f1.2%2f4s8cOdvaW7Kd49cmEbJ52Q--%2fYXBwaWQ9eW5ld3M7cT04NTt3PTMxMA--%2fhttp%3a%2f%2fmedia.zenfs.com%2fen_us%2fNews%2fgettyimages.com%2foklahoma-city-thunder-v-san-20120604-210249-219.jpg&id=20C02B8B24C6F5BB538BCA720BD46CA4"
        ///         Width:  310
        ///    },
        ///    Snippet:     "SAN ANTONIO – Manu Ginobili watched his 3-pointer skip off the back of the rim, and the frustration began to build within him. He'd carried the San Antonio Spurs through the night, twice raising them from the dead, and now the game had finally caromed out of his reach. A timeout followed, and ... "
        ///    Source:      "YAHOO!"
        ///    Title:       "Spurs facing final stand after Game 5 loss to Thunder pushes them to brink of elimination"
        ///    type:        "news"
        ///    Url:         "http://sports.yahoo.com/news/nba--spurs-facing-final-stand-after-game-5-loss-to-thunder-pushes-them-to-brink-of-elimination.html"
        /// }
        /// </returns>
        if (BingApp.Utilities.isNullOrUndefined(responseText)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("responseText");
        }
        var doc;
        try {
            doc = JSON.parse(responseText);
        } catch (err) {
            BingApp.traceError("BingNewsDataProvider.parseBingNewsDocument: Input is not valid json - error name: {0} and error message:{1}", err.name ? err.name : "", err.message ? err.message : "");
            throw (new BingApp.Classes.ErrorArgument("responseText", "response from bing news is not a valid Json"));
        }
        if (doc && doc.SearchResponse && doc.SearchResponse.News && doc.SearchResponse.News.Results) {
            var newsItems = doc.SearchResponse.News.Results;
            var results = [];
            for (var i = 0; i < newsItems.length; i++) {
                if (newsItems[i] && newsItems[i].Cluster) {
                    var cluster = newsItems[i].Cluster;
                    var currentNewsItem = null;
                    if (cluster.Articles) {
                        for (var key in cluster.Articles) {
                            var currentItem = cluster.Articles[key];
							if (currentItem) {
								var corruptDataElement = false;
								for (var property in RequiredProperties) {
								    if (property === "Image") {
                                        // we deal with images in the next if clause
								        continue;
								    }
									if (RequiredProperties[property] && !currentItem[property]) {
										corruptDataElement = true;
										break;
									}
								}
								if (corruptDataElement) {
									continue;
								}
								currentItem.Date = (currentItem.Date) ? new Date(currentItem.Date) : new Date(""); //returns InvalidDate instance of date if its in null or empty or undefined
								currentNewsItem = currentItem;
								break;
							}
						}
                    }
                    if (RequiredProperties.Image && currentNewsItem && cluster.Images) {
                        for (var key in cluster.Images) {
                            var currentImageItem = cluster.Images[key];
							if (currentImageItem && currentImageItem.Thumbnail && currentImageItem.Thumbnail.Url) {
								currentNewsItem.Image = currentImageItem.Thumbnail;
								if (!currentNewsItem.Image.Url.match(/^http:\/\//i)) {
									currentNewsItem.Image.Url = BingApp.locator.env.getHostUrl() + currentNewsItem.Image.Url;
								}
								currentNewsItem.type = "news"; //Setting the type for this element
								results.push(currentNewsItem);							
								break;
							}
						}
                    }
                }
            }
            return results;
        }
        BingApp.traceError("BingNewsDataProvider.parseBingNewsDocument: Input does not the have the expected format");
        throw (new BingApp.Classes.ErrorArgument("responseText", "response from bing news does not have the expected format"));
    }

    function getBingNewsUrl() {
        /// <summary>
        /// returns url for bing news end point
        /// </summary>
        /// <returns type="Object">
        /// string of complete url for bing news
        /// </returns>
        return { url: BingApp.locator.env.getDataProviderUrl(BingApp.Classes.TrendingController.trendIds.bingNews) + "&" + BingApp.locator.env.getQueryString() };
    }

    /// <summary>
    /// Defines class that implements Bing news data provider.
    /// items in a array from getItems having following format:
    /// {
    ///    Category:    "rt_Sports",
    ///    Date[date]:  Tue Jun 5 13:54:35 PDT 2012,
    ///    Image {
    ///         Height: 232
    ///         Url:    "http://www.bing.com/imagenewsfetcher.aspx?q=http%3a%2f%2fl1.yimg.com%2fbt%2fapi%2fres%2f1.2%2f4s8cOdvaW7Kd49cmEbJ52Q--%2fYXBwaWQ9eW5ld3M7cT04NTt3PTMxMA--%2fhttp%3a%2f%2fmedia.zenfs.com%2fen_us%2fNews%2fgettyimages.com%2foklahoma-city-thunder-v-san-20120604-210249-219.jpg&id=20C02B8B24C6F5BB538BCA720BD46CA4"
    ///         Width:  310
    ///    },
    ///    Snippet:     "SAN ANTONIO – Manu Ginobili watched his 3-pointer skip off the back of the rim, and the frustration began to build within him. He'd carried the San Antonio Spurs through the night, twice raising them from the dead, and now the game had finally caromed out of his reach. A timeout followed, and ... "
    ///    Source:      "YAHOO!"
    ///    Title:       "Spurs facing final stand after Game 5 loss to Thunder pushes them to brink of elimination"
    ///    type:        "news"
    ///    Url:         "http://sports.yahoo.com/news/nba--spurs-facing-final-stand-after-game-5-loss-to-thunder-pushes-them-to-brink-of-elimination.html"
    /// }
    /// </summary>
    WinJS.Namespace.define("BingApp.Classes", {
        BingNewsDataProvider: WinJS.Class.derive(
            BingApp.Classes.XhrDataProvider,
            function () {
                if (!(this instanceof BingApp.Classes.BingNewsDataProvider)) {
                    BingApp.traceWarning("BingNewsDataProvider.ctor: Attempted using BingNewsDataProvider ctor as function; redirecting to use 'new BingNewsDataProvider()'.");
                    return new BingApp.Classes.BingNewsDataProvider();
                }
                BingApp.Classes.XhrDataProvider.call(this, BING_NEWS_IDENTITY, BING_NEWS_COUNT, { urlOptions: getBingNewsUrl, parser: parseBingNewsDocument });

            })
    });

})();
