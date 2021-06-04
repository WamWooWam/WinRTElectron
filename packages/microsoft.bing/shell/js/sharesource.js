/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path='../../common/js/utilities.js' />
/// <reference path='shell.js' />
(function () {
    "use strict";

    // private members
    var _title;                 // title displayed on the Share charm
    var _description;           // description displayed on the Share charm
    var _uri;                   // uri in case uri sharing is requested (this is not a string)
    var _text;                  // text as a string in case text sharing is needed
    var _bitmap;                // bitmap in case image sharing is needed
    var _storageitems;          // files in case image sharing is needed
    var _markup;                // markup for HTML sharing
    var _bitmapDataProvider;    // DataProvider for Bitmap

    var _datatransfermanager;   // the data transfer manager for the application

    var init = function () {
        /// <summary>
        /// initializes the ShareSource once in the application by creating the data transfer manager
        /// </summary>
        checkDataTransferManager();
    };

    var setDefaults = function () {
        /// <summary>
        /// sets defaults
        /// currently HARDCODING to bing.com. this should change but not using properties for this.
        /// </summary>
        var market = new Windows.ApplicationModel.Resources.ResourceLoader("market");
        var DEFAULT_HOST = market.getString("DEFAULT_HOST"); // usually www.bing-int.com or www.bing.com

        var collection = {};
        collection["cc"] = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
        collection["form"] = BingApp.Classes.Shell.formCodes.fromShareCharmDefault;
        _uri = new Windows.Foundation.Uri(DEFAULT_HOST + BingApp.Utilities.QueryString.serialize(collection));

        _text = null;
        _bitmap = null;
        _storageitems = null;
        _markup = null;
        _bitmapDataProvider = null;

        _title = WinJS.Resources.getString("app_name").value;
        _description = WinJS.Resources.getString("app_description").value;
    };

    var canShare = function () {
        /// <summary>
        /// checks if sharing is possible
        /// there has to be a datatransfermanager & title, description and at least text/uri/bitmap/storageitem
        /// will try default title/description/uri
        /// </summary>
        /// <returns>
        /// True if sharing is possible else false
        /// </returns>
        var isShareable = (BingApp.Utilities.isNotNullOrUndefined(_datatransfermanager)
            && _title
            && BingApp.Utilities.isNotNullOrUndefined(_description)
            && (BingApp.Utilities.isNotNullOrUndefined(_uri)
                || _text
                || BingApp.Utilities.isNotNullOrUndefined(_bitmap)
                || BingApp.Utilities.isNotNullOrUndefined(_storageitems)
                || _markup
                || BingApp.Utilities.isNotNullOrUndefined(_bitmapDataProvider)
            )) ? true : false;
        if (isShareable === false && BingApp.Utilities.isNotNullOrUndefined(_datatransfermanager)) {
            setDefaults();
            isShareable = true;
        }
        return isShareable;
    };

    var checkDataTransferManager = function () {
        /// <summary>
        /// creates the data transfer manager and the callback
        /// </summary>
        if (BingApp.Utilities.isNullOrUndefined(_datatransfermanager)) {
            _datatransfermanager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            if (BingApp.Utilities.isNotNullOrUndefined(_datatransfermanager)) {
                _datatransfermanager.ondatarequested = datarequestedHandler;
            }
        }
    };

    //TODO: Consider converting to document object instead of multiple params.
    var addShareSources = function (title, description, uri, text, bitmap, storageitems, markup, bitmapDataProvider) {
        /// <summary>
        /// Checks if parameters enable sharing and if so updates the internal variables.
        /// </summary>
        /// <param name="title">
        /// title displayed on the Share charm
        /// </param>
        /// <param name="description">
        /// description displayed on the Share charm
        /// </param>
        /// <param name="uri">
        /// uri in case uri sharing is requested (this is not a string) and if passed must be valid uri
        /// </param>
        /// <param name="text">
        /// text as a string in case text sharing is needed
        /// </param>
        /// <param name="bitmap">
        /// bitmap in case image sharing is needed
        /// </param>
        /// <param name="storageitems">
        /// files in case file sharing is needed
        /// </param>
        /// <param name="markup">
        /// facilitates HTML sharing from the app to other HTML-capable apps
        /// </param>
        /// <param name="bitmapDataProvider">
        /// facilitates pull mechanism for bitmaps
        /// </param>
        clearShareSources();
        if (title && description
                && (uri ||
                    text ||
                    bitmap ||
                    storageitems ||
                    markup ||
                    typeof bitmapDataProvider === "function")) {
                        // the following variable to ensure parameters are really valid enough to be shared
            var parametersValid = true;
            checkDataTransferManager();
            if (uri && ((uri instanceof Windows.Foundation.Uri) === false)) {
                parametersValid = false;
            }
            if (parametersValid) {
                _title = title;
                _description = description;
                _uri = uri;
                _text = text;
                _bitmap = bitmap;
                _storageitems = storageitems;
                _markup = markup;
                _bitmapDataProvider = bitmapDataProvider;
            }
        }
    };

    function clearShareSources() {
        /// <summary>
        /// Clears the data from the internal state.
        /// Helps if the Share source does not have any data to share and ensures the previous state is not shared by mistake.
        /// Default behaviour should take over.
        ///</summary>
        _title = null;
        _description = null;
        _uri = null;
        _text = null;
        _bitmap = null;
        _storageitems = null;
        _markup = null;
        _bitmapDataProvider = null;
    }

    var showShareUI = function () {
        /// <summary>
        /// if sharing is possible brings up the share UI
        /// </summary>
        if (canShare()) {
            Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
        }
    };

    var datarequestedHandler = function (eventArgs) {
        /// <summary>
        /// if a callback exists, then the callback is immediately called so that the shareable objects are updated
        /// checks if sharing is now possible
        /// if sharing is possible then updates the request object for uri/text/bitmap
        /// </summary>
        /// <param name="eventArgs">
        /// This includes the request object which must be filled for the share
        /// </param>
        if (BingApp.Utilities.isNotNullOrUndefined(BingApp.ShareSource.ondatarequested) &&
                typeof BingApp.ShareSource.ondatarequested === "function") {
            BingApp.ShareSource.ondatarequested();
        }
        if (canShare()) {
            var request = eventArgs.request;
            if (BingApp.Utilities.isNotNullOrUndefined(request)
                    && BingApp.Utilities.isNotNullOrUndefined(request.data)
                    && BingApp.Utilities.isNotNullOrUndefined(request.data.properties)) {
                request.data.properties.title = _title;
                request.data.properties.description = _description;
                if (BingApp.Utilities.isNotNullOrUndefined(_uri)) {
                    request.data.setUri(_uri);
                }
                if (_text) {
                    request.data.setText(_text);
                }
                if (BingApp.Utilities.isNotNullOrUndefined(_bitmap)) {
                    request.data.properties.thumbnail = _bitmap;
                    request.data.setBitmap(_bitmap);
                }
                if (BingApp.Utilities.isNotNullOrUndefined(_storageitems)) {
                    request.data.setStorageItems(_storageitems);
                }
                if (_markup) {
                    var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(window.toStaticHTML(_markup)); 
                    request.data.setHtmlFormat(htmlFormat);
                }
                if (typeof _bitmapDataProvider === "function") {
                    request.data.setDataProvider(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap, _bitmapDataProvider);
                }
            }
        }
        else {
            BingApp.traceError("Sharing error since there is nothing to share.");
        }
    };

    WinJS.Namespace.define("BingApp.ShareSource", {
        init: init,
        ondatarequested: null,
            /// <summary>
            /// this member must always point to  a callback function
            /// the function must call addShareSource with a title, description and at least text/uri/bitmap
            ///  BingApp.ShareSource.addShareSources(...);
            /// </summary>
        addShareSources: addShareSources,
        showShareUI: showShareUI
    });

    BingApp.ShareSource.init();

})();
