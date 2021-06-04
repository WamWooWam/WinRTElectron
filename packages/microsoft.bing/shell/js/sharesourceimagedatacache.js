/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path='../../common/js/utilities.js' />
/// <reference path='sharesource.js' />
/// <reference path='shell.js' />
(function () {
    "use strict";

    ///<summary>
    /// Data that is cached before used for sharing.
    /// This data will be cleaned after it is consumed once for sharing
    /// </summary>
    var _cacheFromIframe;
    var _deferredImageLoadData = {};
    var eventRelay = BingApp.locator.eventRelay;
    var _imageTransferTimeout = 5000;  //Wait time to the deferred base64 BitMap data to be received. The value looked more apt for user to wait.
    var _fileName = "lastBingImageShareThubmnail.png"; //Name of the file used to share the thumbnail in the temp folder.

    /// <summary>
    /// Events handled .
    /// </summary>
    var events = Object.freeze({
        /// <summary>
        /// Event fired by server code to transfer essential data
        /// </summary>
        shareSourceData: "ImageShareSourceData",
        /// <summary> 
        /// Event fired by deferredDataProvider to get images data in tourl was sent.
        /// </summary>
        getImageData: "ImageShareSourceGetImageData",
        /// <summary> 
        /// Event fired from server code with the base64Data of the image. 
        /// </summary>
        recvImageData: "ImageShareSourceImageData",
    });

    var removeParam = ['id', 'FORM'];

    function consume() {
        ///<summary>
        /// Consumes the share data if available
        /// Parses the url for scraping Win8 specific params.
        /// </summary>
        if (!_cacheFromIframe) {
            return;
        }

        var data = _cacheFromIframe;
        if (!data.title || !data.description) {
            BingApp.ShareSource.clearShareSources();
            _cacheFromIframe = null;
            return;
        }

        var url = (data.url && prepareShareUrl(data.url, data.form)) || data.imgurl;

        if (data.tourl) {
            _deferredImageLoadData.id = data.tourl;
        }

        ///Call to framework to add data for sharing
        BingApp.ShareSource.addShareSources(data.title,
            data.description,
            url ? new Windows.Foundation.Uri(url) : null,
            data.text,
            data.bitmap,
            data.storageitems,
            data.markup,
            _deferredImageLoadData.id ? onDeferredImageRequested : null
        );
        _cacheFromIframe = null;
    };

    function prepareShareUrl(url, formCode) {
        /// <summary>
        /// Parses the url for scraping Win8 specific params.
        /// </summary>
        /// <param name=url datatype=string>
        /// Url that needs to be parse and stripped of unwanted params
        /// </param>
        /// <param name=formcode datatype=string>
        /// formcode to be added to the url
        /// </param>
        if (!url) {
            return null;
        }

        var uri = new Windows.Foundation.Uri(url);
        var queryParsed = BingApp.Utilities.QueryString.parse(url);
        var query = queryParsed ? (queryParsed["q"] || queryParsed["Q"]) : null;


        var returl = uri.schemeName + "://"
            + uri.host
            + (uri.port === 80 ? "" : ":" + uri.port)
            + uri.path;

        var queryParams = [];
        if (query) {
            queryParams.push("q=" + query);
        }
        if (formCode) {
            queryParams.push("form=" + formCode);
        }
        var queryString = queryParams.join("&");

        return returl + (queryString ? "?" + queryString : "");
    };

    function save(data) {
        /// <summary>
        /// Saves the data to cache as well sets the onDataRequested to ensure this is consumed for sharing.
        /// <param name="data" type="Object">
        /// Data to be cached
        /// The properties mandatory are title, description, url or (urlPath and queryString)
        /// </param>
        /// </summary>
        _cacheFromIframe = data;
        if (_deferredImageLoadData.id) {
            deferralComplete("Discarding existing deferral as new data is being shared");
        }
        BingApp.ShareSource.ondatarequested = consume;
    };

    function onDeferredImageRequested(request) {
        /// <summary>
        /// Called in the case of thumnail url shared (tourl).
        /// </summary>
        /// <param name=request datatype=DataRequest>
        /// the deferral request
        /// </param>
        _deferredImageLoadData.request = request;
        _deferredImageLoadData.deferral = request.getDeferral();
        _deferredImageLoadData.timeout = WinJS.Promise.timeout(_imageTransferTimeout);

        _deferredImageLoadData.timeout.done(function () {
            delete _deferredImageLoadData.timeout;
            deferralComplete("Deferral timedout for " + _deferredImageLoadData.id);
        });

        eventRelay.fireEvent(events.getImageData, { id: _deferredImageLoadData.id });
    };

    function sharebase64image(data) {
        /// <summary>
        /// Saves the data to cache as well sets the onDataRequested to ensure this is consumed for sharing.
        /// <param name="data" type="Object">
        /// Data to be cached
        /// The properties mandatory are title, description, url or (urlPath and queryString)
        /// </param>
        /// </summary>
        if (BingApp.Utilities.isNullOrUndefined(data) ||
            !data.id ||
            !data.base64img) {

            deferralComplete("Incoming payload not valid");
            return;
        }

        if (BingApp.Utilities.isNullOrUndefined(_deferredImageLoadData) ||
            !_deferredImageLoadData.id ||
            BingApp.Utilities.isNullOrUndefined(_deferredImageLoadData.request) ||
            BingApp.Utilities.isNullOrUndefined(_deferredImageLoadData.deferral)) {

            deferralComplete("deferredImageLoad data is not valid");
            return false;
        }

        if (data.id === _deferredImageLoadData.id) {
            var folder = Windows.Storage.ApplicationData.current.temporaryFolder;
            folder.createFileAsync(_fileName, Windows.Storage.CreationCollisionOption.replaceExisting).done(
                function (file) {
                    var imgIBuffer = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(data.base64img);
                    Windows.Storage.FileIO.writeBufferAsync(file, imgIBuffer).done(
                        function () {
                            try {
                                _deferredImageLoadData.request.setData(Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(file));
                            }
                            catch (ex) {
                                BingApp.traceError("ShareSourceImageDataCache.sharebase64image: {0}", ex.message);
                            }

                            deferralComplete();
                        },
                        deferralComplete
                        );
                },
                deferralComplete
                );
        }

        return true;
    };

    function deferralComplete(errmsg) {
        /// <summary>
        /// This is called either on error or after the deferral is shared.
        /// Cleanup the deferral related data.
        /// <param name="errmsg" type="Object">
        /// Error object in case of effor while doing 
        /// </param>
        /// </summary>
        if (_deferredImageLoadData.deferral && _deferredImageLoadData.deferral.complete) {
            _deferredImageLoadData.deferral.complete();
            delete _deferredImageLoadData.deferral;
        }

        delete _deferredImageLoadData.request;
        delete _deferredImageLoadData.id;

        if (_deferredImageLoadData.timeout && _deferredImageLoadData.timeout.cancel) {
            _deferredImageLoadData.timeout.cancel();
            delete _deferredImageLoadData.timeout;
        }

        if (errmsg) {
            if (errmsg.message) {
                BingApp.traceError("ShareSourceImageDataCache.deferralComplete {0}", errmsg.message);
            } else {
                BingApp.traceError("ShareSourceImageDataCache.deferralComplete Message: {0}", errmsg);
            }
        }
    };

    eventRelay.addEventListener(events.recvImageData, {
        callback: function (payload) {
            sharebase64image(payload);
        }
    });

    eventRelay.addEventListener(events.shareSourceData, {
        callback: function (payload) {
            save(payload);
        }
    });

})();