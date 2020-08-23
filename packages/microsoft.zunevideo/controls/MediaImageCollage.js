/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MediaImageCollage: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ImageCollage", null, function mediaImageCollageConstructor(element, options) {
            this.timerTickInterval = 10000;
            this.timerDelayPeriod = 10 + Math.floor(Math.random() * 60000);
            this.cellAddPeriod = 0;
            this.cellSwapPeriod = 10000;
            this.artShowPeriod = 20000;
            this.artSwapPeriod = 40000;
            this.artVisiblePeriod = 40000;
            this.colorChangePeriod = 0;
            this.cellRepeatBuffer = 0;
            this._cellDefinitions = [];
            this._cellDefinitions.push(this._6x6CellDefinitions1);
            this._cellDefinitions.push(this._6x6CellDefinitions2);
            this._cellDefinitions.push(this._6x6CellDefinitions3);
            this._cellDefinitions.push(this._6x6CellDefinitions4);
            if (MS.Entertainment.Utilities.isApp2)
                this.backgroundColor = "#333333";
            else
                this.backgroundColor = "#ffffff"
        }, {
            _cellDefinitions: null, _4x4CellDefinitions: [{
                        ordinal: 1, x: 0, y: 0, size: 1
                    }, {
                        ordinal: 2, x: 0, y: 1, size: 1
                    }, {
                        ordinal: 3, x: 1, y: 0, size: 1
                    }, {
                        ordinal: 4, x: 1, y: 1, size: 1
                    }, ], _6x6CellDefinitions1: [{
                        ordinal: 1, x: 0, y: 0, size: 2
                    }, {
                        ordinal: 2, x: 2, y: 0, size: 1
                    }, {
                        ordinal: 3, x: 2, y: 1, size: 1
                    }, {
                        ordinal: 4, x: 0, y: 2, size: 1
                    }, {
                        ordinal: 5, x: 1, y: 2, size: 1
                    }, {
                        ordinal: 6, x: 2, y: 2, size: 1
                    }, ], _6x6CellDefinitions2: [{
                        ordinal: 1, x: 0, y: 0, size: 1
                    }, {
                        ordinal: 2, x: 1, y: 0, size: 1
                    }, {
                        ordinal: 3, x: 2, y: 0, size: 1
                    }, {
                        ordinal: 4, x: 0, y: 1, size: 2
                    }, {
                        ordinal: 5, x: 2, y: 1, size: 1
                    }, {
                        ordinal: 6, x: 2, y: 2, size: 1
                    }, ], _6x6CellDefinitions3: [{
                        ordinal: 1, x: 0, y: 0, size: 1
                    }, {
                        ordinal: 2, x: 1, y: 0, size: 2
                    }, {
                        ordinal: 3, x: 0, y: 1, size: 1
                    }, {
                        ordinal: 4, x: 0, y: 2, size: 1
                    }, {
                        ordinal: 5, x: 1, y: 2, size: 1
                    }, {
                        ordinal: 6, x: 2, y: 2, size: 1
                    }, ], _6x6CellDefinitions4: [{
                        ordinal: 1, x: 0, y: 0, size: 1
                    }, {
                        ordinal: 2, x: 1, y: 0, size: 1
                    }, {
                        ordinal: 3, x: 2, y: 0, size: 1
                    }, {
                        ordinal: 4, x: 0, y: 1, size: 1
                    }, {
                        ordinal: 5, x: 1, y: 1, size: 2
                    }, {
                        ordinal: 6, x: 0, y: 2, size: 1
                    }, ], _queryPromise: null, _imageCachePromises: null, _maxCellWidth: 0, _maxCellHeight: 0, _uiStateService: null, _networkStatusBinding: null, _delayInitializeFailed: false, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.ImageCollage.prototype.initialize.apply(this, arguments);
                    this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    this._imageCachePromises = [];
                    this.artVisible = false;
                    if (this._delayInitializeFailed)
                        this._delayInitialized()
                }, _delayInitialized: function _delayInitialized() {
                    if (!this._initialized) {
                        this._delayInitializeFailed = true;
                        return
                    }
                    MS.Entertainment.UI.Controls.ImageCollage.prototype._delayInitialized.apply(this, arguments);
                    this.bind("media", this._mediaChanged.bind(this))
                }, unload: function unload() {
                    if (this._queryPromise)
                        this._queryPromise.cancel();
                    if (this._imageCachePromises)
                        for (var i = 0; i < this._imageCachePromises.length; i++)
                            this._imageCachePromises[i].cancel();
                    this.cellIdList = null;
                    if (this._networkStatusBinding) {
                        this._networkStatusBinding.cancel();
                        this._networkStatusBinding = null
                    }
                    MS.Entertainment.UI.Controls.ImageCollage.prototype.unload.call(this)
                }, _mediaChanged: function _mediaChanged() {
                    if (!this._networkStatusBinding)
                        switch (this._uiStateService.networkStatus) {
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                                this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._networkStatusChanged.bind(this)});
                                break
                        }
                    this._loadImages()
                }, _networkStatusChanged: function _networkStatusChanged(newValue, oldValue) {
                    if (oldValue === undefined)
                        return;
                    if (this._networkStatusBinding) {
                        this._networkStatusBinding.cancel();
                        this._networkStatusBinding = null
                    }
                    this._mediaChanged()
                }, _loadImages: function _loadImages() {
                    if (!MS.Entertainment.Utilities.checkIfInDom(this.domElement))
                        return
                }, _setCellDefinitions: function _setCellDefinitions(count) {
                    if (count > 6 && this.useDynamicLayouts) {
                        this.rows = 3;
                        this.columns = 3;
                        var definitionIndex = Math.floor(Math.random() * this._cellDefinitions.length);
                        this.cellDefinitions = this._cellDefinitions[definitionIndex];
                        this._maxCellWidth = this.size.width / 3 * 2;
                        this._maxCellHeight = this.size.height / 3 * 2
                    }
                    else {
                        this.rows = 2;
                        this.columns = 2;
                        this.cellDefinitions = this._4x4CellDefinitions;
                        this._maxCellWidth = this.size.width / 2;
                        this._maxCellHeight = this.size.height / 2
                    }
                    this._blockSizeInPixels = {
                        x: this.size.width, y: this.size.height
                    };
                    this._blockSizeInCells = {
                        x: this.columns, y: this.rows
                    };
                    this._cellSizeInPixels = {
                        x: this.size.width / this.columns, y: this.size.height / this.rows
                    };
                    this._cellOffsetInPixels = this.cellOffset
                }, _setUrlFromCellId: function _getUrlFromCellId(media, cell) {
                    if (!MS.Entertainment.Utilities.checkIfInDom(this.domElement)) {
                        this.unload();
                        return
                    }
                    if (typeof media === "string") {
                        if (cell)
                            cell.setArt(media);
                        return media
                    }
                    if (media.cachedImageUrl) {
                        if (cell)
                            cell.setArt(media.cachedImageUrl);
                        return media.cachedImageUrl
                    }
                    var expectedWidth = Math.max(this._maxCellWidth, this.minimumSize.width);
                    var expectedHeight = Math.max(this._maxCellHeight, this.minimumSize.height);
                    var imageCachePromise = MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(media, expectedWidth, expectedHeight).then(function checkResult(url) {
                            media.cachedImageUrl = url;
                            if (url === MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.album)
                                return null;
                            if (cell)
                                cell.setArt(media.cachedImageUrl);
                            return media.cachedImageUrl
                        });
                    if (imageCachePromise) {
                        this._imageCachePromises.push(imageCachePromise);
                        return imageCachePromise
                    }
                }
        }, {
            media: null, size: {
                    width: 135, height: 135
                }, minimumSize: {
                    width: 0, height: 0
                }, columns: 2, rows: 2, useDynamicLayouts: true, cellOffset: 0
        })})
})()
