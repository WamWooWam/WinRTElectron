/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {PlaylistImageCollage: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.MediaImageCollage", null, null, {
            _albumResultsLength: -1, _frozen: false, _mediaItemBinding: null, _focused: false, _unfocusedArt: null, _savedAlbums: null, _focusBindings: null, _focusInPromise: null, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.MediaImageCollage.prototype.initialize.apply(this, arguments);
                    if (this.changeOnFocus) {
                        var focusedItem = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "win-focusable");
                        if (document.activeElement === focusedItem)
                            this._onFocusIn();
                        else
                            this._onFocusOut();
                        this._focusBindings = MS.Entertainment.Utilities.addEventHandlers(focusedItem, {
                            focusin: this._onFocusIn.bind(this), focusout: this._onFocusOut.bind(this)
                        })
                    }
                    this.timerTickInterval = 30000;
                    this.timerDelayPeriod = Math.floor(Math.random() * this.timerTickInterval);
                    this.cellAddPeriod = 0;
                    this.cellSwapPeriod = 20 + Math.floor(Math.random() * this.timerTickInterval - 20);
                    this.artShowPeriod = 30000;
                    this.artSwapPeriod = 11000;
                    this.artVisiblePeriod = 30000;
                    this.colorChangePeriod = 0;
                    this.cellRepeatBuffer = 0;
                    this.minimumSize = {
                        width: 60, height: 60
                    };
                    if (this.media && this.media.libraryId === -1)
                        this._mediaItemBinding = WinJS.Binding.bind(this.media, {libraryId: function libraryIdChanged() {
                                if (this.media.libraryId !== -1) {
                                    this._mediaItemBinding.cancel();
                                    this._mediaItemBinding = null;
                                    if (!this._frozen)
                                        this._loadImages()
                                }
                            }.bind(this)})
                }, unload: function unload() {
                    if (this._focusBindings) {
                        this._focusBindings.cancel();
                        this._focusBindings = null
                    }
                    if (this._mediaItemBinding) {
                        this._mediaItemBinding.cancel();
                        this._mediaItemBinding = null
                    }
                    if (this._focusInPromise) {
                        this._focusInPromise.cancel();
                        this._focusInPromise = null
                    }
                    MS.Entertainment.UI.Controls.MediaImageCollage.prototype.unload.call(this)
                }, freeze: function freeze() {
                    this._frozen = true;
                    MS.Entertainment.UI.Controls.MediaImageCollage.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    this._frozen = false;
                    if (this.media && MS.Entertainment.Utilities.isValidLibraryId(this.media.libraryId) && (this._albumResultsLength <= 0 || this.refreshOnThaw))
                        this._loadImages();
                    MS.Entertainment.UI.Controls.MediaImageCollage.prototype.thaw.call(this)
                }, _loadImages: function _loadImages() {
                    if (!this.media)
                        return;
                    var hydratePromise = WinJS.Promise.as();
                    if (!MS.Entertainment.Utilities.isValidLibraryId(this.media.libraryId) && this.media.hydrate)
                        hydratePromise = this.media.hydrate();
                    hydratePromise.then(function renderAlbums() {
                        return WinJS.Promise.timeout(this.loadDelay)
                    }.bind(this)).done(function getAlbums() {
                        if (this._unloaded || (!MS.Entertainment.Utilities.isValidLibraryId(this.media.libraryId) && !this.media.hasServiceId))
                            return;
                        if (this._queryPromise) {
                            this._queryPromise.cancel();
                            this._queryPromise = null
                        }
                        if (MS.Entertainment.Utilities.isValidLibraryId(this.media.libraryId)) {
                            var localAlbumQuery;
                            localAlbumQuery = new MS.Entertainment.Data.Query.libraryAlbums;
                            localAlbumQuery.aggregateChunks = false;
                            localAlbumQuery.chunkSize = 8;
                            localAlbumQuery.playlistId = this.media.libraryId;
                            this._queryPromise = localAlbumQuery.execute().then(function returnItems(q) {
                                if (q.result && q.result.items)
                                    return q.result.items.toArray(0, 8);
                                return null
                            })
                        }
                        else if (this.media.albumImages)
                            this._queryPromise = WinJS.Promise.as(this.media.albumImages);
                        if (this._queryPromise)
                            this._queryPromise.done(function(itemArray) {
                                if (itemArray) {
                                    if (this._unloaded)
                                        return;
                                    if (this._savedAlbums) {
                                        if (this._savedAlbums.length === itemArray.length) {
                                            var sameAlbums = true;
                                            for (var j = 0; j < itemArray.length; j++)
                                                if (!itemArray[j].isEqual || !itemArray[j].isEqual(this._savedAlbums[j])) {
                                                    sameAlbums = false;
                                                    break
                                                }
                                            if (sameAlbums)
                                                return
                                        }
                                        this._clearCells();
                                        this._cellUsedCount = 0;
                                        this._unfocusedArt = null
                                    }
                                    if (this.refreshOnThaw)
                                        this._savedAlbums = itemArray;
                                    this._albumResultsLength = itemArray.length;
                                    this._setCellDefinitions(itemArray.length);
                                    if (itemArray.length === 0 && this.useDefaultImages)
                                        if (this.size.width > 316 && this.size.height > 316 || this.changeOnFocus)
                                            itemArray.push(MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.playlistLarge);
                                        else
                                            itemArray.push(MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.playlist);
                                    if (itemArray.length < 4) {
                                        var modifiedAlbums = [];
                                        switch (itemArray.length) {
                                            case 1:
                                                modifiedAlbums.push(itemArray[0]);
                                                break;
                                            case 2:
                                                modifiedAlbums.push(itemArray[0]);
                                                modifiedAlbums.push(itemArray[0]);
                                                modifiedAlbums.push(itemArray[1]);
                                                modifiedAlbums.push(itemArray[1]);
                                                break;
                                            case 3:
                                                modifiedAlbums.push(itemArray[0]);
                                                modifiedAlbums.push(itemArray[1]);
                                                modifiedAlbums.push(itemArray[2]);
                                                modifiedAlbums.push(itemArray[0]);
                                                break
                                        }
                                        this.cellIdList = modifiedAlbums
                                    }
                                    else
                                        this.cellIdList = itemArray
                                }
                                else
                                    this.cellIdList = [MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.playlist];
                                this._queryPromise = null
                            }.bind(this))
                    }.bind(this))
                }, _setCellImages: function _setCellImages() {
                    var getUnfocusedImageUrl = WinJS.Promise.as();
                    if (this._albumResultsLength >= 0) {
                        if (this.domElement && this.domElement.clientWidth && this.domElement.clientHeight)
                            this.size = {
                                width: this.domElement.clientWidth, height: this.domElement.clientHeight
                            };
                        if (this.changeOnFocus && !this._unfocusedArt) {
                            this._maxCellWidth = this.size.width;
                            this._maxCellHeight = this.size.height;
                            if (this.cellIdList && this.cellIdList.length)
                                getUnfocusedImageUrl = WinJS.Promise.as(this._setUrlFromCellId(this.cellIdList[0]))
                        }
                        this._setCellDefinitions(this._albumResultsLength)
                    }
                    var originalArguments = arguments;
                    getUnfocusedImageUrl.done(function setUnfocusedImage(imageUrl) {
                        if (imageUrl)
                            this._unfocusedArt = imageUrl;
                        else if (imageUrl === null && !this._unfocusedArt)
                            this._unfocusedArt = MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.album;
                        if (!this._focused && this._unfocusedArt) {
                            if (!this.largeArtUrls || this.largeArtUrls[0] !== this._unfocusedArt)
                                this.largeArtUrls = [this._unfocusedArt]
                        }
                        else
                            MS.Entertainment.UI.Controls.ImageCollage.prototype._setCellImages.apply(this, originalArguments)
                    }.bind(this), function error() {
                        MS.Entertainment.UI.Controls.ImageCollage.prototype._setCellImages.apply(this, originalArguments)
                    }.bind(this))
                }, _onFocusIn: function _onFocusIn() {
                    if (this._focusInPromise || this._albumResultsLength === 0)
                        return;
                    this._focusInPromise = WinJS.Promise.timeout(250).then(function updateFocus() {
                        this._focused = true;
                        WinJS.Utilities.removeClass(this.wallContainer, "hideFromDisplay");
                        this._setArtVisible(false);
                        this._timerEnabled = false;
                        if (!this._cells || this._cells.length === 0)
                            this._setCellImages();
                        this._focusInPromise = null
                    }.bind(this))
                }, _onFocusOut: function _onFocusOut() {
                    if (this._focusInPromise) {
                        this._focusInPromise.cancel();
                        this._focusInPromise = null
                    }
                    this._focused = false;
                    if (this._unfocusedArt) {
                        if (!this.largeArtUrls)
                            this.largeArtUrls = [this._unfocusedArt];
                        WinJS.Utilities.addClass(this.wallContainer, "hideFromDisplay")
                    }
                    this._setArtVisible(true)
                }, _toggleCells: function _toggleCells(show) {
                    if (this.changeOnFocus) {
                        if (show === MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show)
                            this._cells.forEach(function(cell) {
                                var sleep = (cell.width + cell.height) / 4;
                                cell.toggleCell(show, sleep)
                            }.bind(this))
                    }
                    else
                        MS.Entertainment.UI.Controls.ImageCollage.prototype._toggleCells.apply(this, arguments)
                }
        }, {
            size: {
                width: 135, height: 135
            }, columns: 2, rows: 2, changeOnFocus: false, refreshOnThaw: false, cellOffset: 0, useDefaultImages: true, loadDelay: 500
        })})
})()
