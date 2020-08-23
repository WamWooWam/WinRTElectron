/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    var fileScope = {
            CELL_USED: 1, CELL_BAD_IMAGE: 2
        };
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ImageCollageCell: MS.Entertainment.UI.Framework.define(function(){}, {
            domElement: null, _imageLoader: null, _svgImageElement: null, _colorOverlay: null, x: 0, y: 0, width: 0, height: 0, urlIndex: -1, _artUri: null, _loaded: false, _initialized: false, _pendingShow: false, _pendingToggle: false, _overlayListenerAdded: false, _transitionPromise: null, cellDefinition: null, initialize: function initialize(blockOffset, cellDefinition, cellSize, filter, backgroundColor) {
                    var that = this;
                    var cellSpacing = MS.Entertainment.Utilities.isMusicApp1 ? 2 : 0;
                    this.cellDefinition = cellDefinition;
                    this.x = blockOffset.x + cellDefinition.x * cellSize.x;
                    this.y = blockOffset.y + cellDefinition.y * cellSize.y;
                    this.width = cellDefinition.size * cellSize.x;
                    this.height = cellDefinition.size * cellSize.y;
                    var svgNS = "http://www.w3.org/2000/svg";
                    var svgElement = document.createElementNS(svgNS, "svg");
                    this._svgImageElement = document.createElementNS(svgNS, "image");
                    this._svgImageElement.setAttribute("x", cellSpacing);
                    this._svgImageElement.setAttribute("y", cellSpacing);
                    this._svgImageElement.setAttribute("width", this.width - (2 * cellSpacing));
                    this._svgImageElement.setAttribute("height", this.height - (2 * cellSpacing));
                    this._svgImageElement.setAttribute("preserveAspectRatio", "none");
                    this._svgImageElement.setAttribute("focusable", "false");
                    svgElement.setAttribute("focusable", "false");
                    this._loaded = false;
                    svgElement.appendChild(this._svgImageElement);
                    this._colorOverlay = document.createElement("div");
                    this._colorOverlay.className = "imageCollageCellColorOverlay";
                    this.domElement = document.createElement("div");
                    this.domElement.style.left = this.x + "px";
                    this.domElement.style.top = this.y + "px";
                    this.domElement.style.width = this.width + "px";
                    this.domElement.style.height = this.height + "px";
                    this.domElement.style.backgroundColor = backgroundColor ? backgroundColor : "#000000";
                    this.domElement.className = "imageCollageCell tranFadeShort";
                    this.domElement.appendChild(svgElement);
                    this.domElement.appendChild(this._colorOverlay);
                    this._cellTransitionEnd = this._cellTransitionEnd.bind(this);
                    this.domElement.addEventListener("transitionend", this._cellTransitionEnd, false)
                }, unload: function unload() {
                    this.domElement.removeEventListener("transitionend", this._cellTransitionEnd, false);
                    if (this._transitionPromise) {
                        this._transitionPromise.cancel();
                        this._transitionPromise = null
                    }
                }, setOverlay: function setOverlay(color, alpha, delay) {
                    var transitionEnd = function() {
                            this._colorOverlay.style.msTransitionDelay = String.empty;
                            this._colorOverlay.style.opacity = alpha
                        };
                    if (delay) {
                        this._colorOverlay.style.msTransitionDelay = delay;
                        if (!this._overlayListenerAdded) {
                            this._colorOverlay.addEventListener("transitionend", transitionEnd.bind(this), false);
                            this._overlayListenerAdded = true
                        }
                    }
                    else
                        this._colorOverlay.style.opacity = alpha;
                    this._colorOverlay.style.backgroundColor = color
                }, setArt: function setArt(artUri) {
                    this._initialized = true;
                    var wasLoaded = this._loaded;
                    this._artUri = artUri;
                    this._loaded = false;
                    if (wasLoaded) {
                        this._pendingShow = true;
                        if (this._transitionPromise)
                            this._transitionPromise.cancel();
                        this._transitionPromise = WinJS.Promise.timeout(600).then(function showCell() {
                            if (this._pendingShow) {
                                this._pendingShow = false;
                                this.toggleCell(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show)
                            }
                        }.bind(this));
                        this.toggleCell(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.hide);
                        return
                    }
                    if (this._pendingToggle) {
                        this._pendingToggle = false;
                        this.toggleCell(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show)
                    }
                }, toggleCell: function toggleCell(show, delay) {
                    if (!this._initialized) {
                        this._pendingToggle = (show === MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show);
                        return
                    }
                    if (show === MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show) {
                        if (!this._loaded) {
                            this._loaded = true;
                            var uri = this._artUri;
                            if (!uri)
                                uri = MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.album;
                            this._svgImageElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", uri)
                        }
                        if (delay)
                            this.domElement.style.msTransitionDelay = delay + "ms";
                        this.domElement.style.opacity = 1
                    }
                    else {
                        this._loaded = false;
                        if (delay)
                            this.domElement.style.msTransitionDelay = delay + "ms";
                        this.domElement.style.opacity = 0
                    }
                }, _cellTransitionEnd: function _cellTransitionEnd() {
                    if (this._transitionPromise) {
                        this._transitionPromise.cancel();
                        this._transitionPromise = null
                    }
                    this.domElement.style.msTransitionDelay = String.empty;
                    if (this._pendingShow) {
                        this._pendingShow = false;
                        this.toggleCell(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show)
                    }
                }
        }, {
            showDelay: 750, toggleCellState: {
                    show: "show", hide: "hide"
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LargeWallArt: MS.Entertainment.UI.Framework.define(function(){}, {
            domElement: null, svgElement: null, currentImageUrl: null, _imageLoader: null, _svgImageElement: null, _svgColorElement: null, _svgBlackElement: null, _loaded: false, _x: 0, _y: 0, _width: 0, _height: 0, _colorOverlay: null, _blackOverlay: null, _animationOffsets: null, _lastAnimationOffset: -1, _hideArtDelayPromise: null, _artDelay: 0, initialize: function initialize(domElement, x, y, w, h, backgroundColor, filter, artDelay) {
                    var that = this;
                    if (window.clientInformation && window.clientInformation.cpuClass === "ARM")
                        this.disableScaling = true;
                    this._artDelay = artDelay !== null ? artDelay : MS.Entertainment.UI.Controls.LargeWallArt.showDelay;
                    this.domElement = domElement;
                    this._animationOffsets = ["25% 25%", "50% 25%", "75% 25%", "25% 50%", "50% 50%", "75% 50%"];
                    var svgNS = "http://www.w3.org/2000/svg";
                    this.svgElement = document.createElementNS(svgNS, "svg");
                    this.svgElement.style.zIndex = 1;
                    this._svgImageElement = document.createElementNS(svgNS, "image");
                    this._svgImageElement.style.zIndex = 0;
                    this._svgImageElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", MS.Entertainment.UI.ImagePaths.imageNotFound);
                    this._svgImageElement.setAttribute("x", 0);
                    this._svgImageElement.setAttribute("y", 0);
                    this._svgImageElement.setAttribute("width", "100%");
                    this._svgImageElement.setAttribute("height", "100%");
                    this._svgImageElement.setAttribute("focusable", "false");
                    this._svgImageElement.setAttribute("preserveAspectRatio", "xMidYMid slice");
                    this.svgElement.setAttribute("focusable", "false");
                    this.svgElement.appendChild(this._svgImageElement);
                    if (filter && !this._svgColorElement) {
                        this._colorOverlay = document.createElement("div");
                        this._colorOverlay.className = "nowPlayingLargeArtColorOverlay tranFadeLong";
                        this._colorOverlay.style.zIndex = 2;
                        this._blackOverlay = document.createElement("div");
                        this._blackOverlay.className = "nowPlayingLargeArtBlackOverlay";
                        this._blackOverlay.style.zIndex = 3
                    }
                    this._imageLoader = new Image;
                    this._imageLoader.addEventListener("load", function imageLoaded(event) {
                        this._loaded = true;
                        this._svgImageElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", this._imageLoader.src);
                        if (this._pendingShow)
                            this.showArt()
                    }.bind(this), false);
                    this._imageLoader.addEventListener("error", function imageError(event) {
                        this._pendingShow = false;
                        this._loaded = true;
                        this.toggleArt(MS.Entertainment.UI.Controls.LargeWallArt.toggleArtState.hide)
                    }.bind(this), false);
                    this.domElement.style.backgroundColor = backgroundColor ? backgroundColor : "#000000";
                    this.domElement.style.position = "absolute";
                    this.domElement.style.left = x;
                    this.domElement.style.top = y;
                    this.domElement.style.width = w;
                    this.domElement.style.height = h;
                    this.domElement.style.opacity = "1.0";
                    if (filter && !this._svgColorElement) {
                        this.domElement.appendChild(this._colorOverlay);
                        this.domElement.appendChild(this._blackOverlay)
                    }
                    this.domElement.appendChild(this.svgElement)
                }, setOverlay: function setOverlay(color, alpha) {
                    if (this._svgColorElement)
                        this._svgColorElement.setAttribute("flood-color", color);
                    else if (color === this._colorOverlay.style.backgroundColor)
                        this._colorOverlay.style.opacity = alpha;
                    else {
                        this._colorOverlay.style.backgroundColor = color;
                        this._colorOverlay.style.opacity = alpha
                    }
                }, showArt: function showArt() {
                    if (this._hideArtDelayPromise) {
                        this._hideArtDelayPromise.cancel();
                        this._hideArtDelayPromise = null
                    }
                    this.domElement.style.display = String.empty;
                    this.toggleArt(MS.Entertainment.UI.Controls.LargeWallArt.toggleArtState.show);
                    var index = Math.floor(Math.random() * this._animationOffsets.length);
                    while (index === this._lastAnimationOffset)
                        index = Math.floor(Math.random() * this._animationOffsets.length);
                    this._lastAnimationOffset = index;
                    this.domElement.className = String.empty;
                    this.domElement.style.transformOrigin = this._animationOffsets[index];
                    if (!this.disableScaling)
                        WinJS.Utilities.addClass(this.domElement, "imageCollageLargeArt");
                    WinJS.Utilities.addClass(this.domElement, "tranFadeVeryShort")
                }, hideArt: function hideArt() {
                    if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isAppVisible) {
                        this.domElement.className = String.empty;
                        this.domElement.style.display = "none";
                        this._hideArtDelayPromise = WinJS.Promise.wrap()
                    }
                    else {
                        this.toggleArt(MS.Entertainment.UI.Controls.LargeWallArt.toggleArtState.hide);
                        if (this._imageLoader && this._imageLoader.src)
                            this._hideArtDelayPromise = WinJS.Promise.timeout(this._artDelay).then(function _delay() {
                                if (this._hideArtDelayPromise) {
                                    this.domElement.className = String.empty;
                                    this.domElement.style.display = "none";
                                    this._hideArtDelayPromise = null
                                }
                            }.bind(this));
                        else
                            this._hideArtDelayPromise = WinJS.Promise.wrap()
                    }
                    return this._hideArtDelayPromise
                }, clearArt: function clearArt() {
                    this.hideArt().done(function clearArtUrl() {
                        this.currentImageUrl = null;
                        if (this._svgImageElement)
                            this._svgImageElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", String.empty)
                    }.bind(this), function onError(){})
                }, setArt: function setArt(artUri) {
                    var wasLoaded = this._loaded;
                    this._loaded = false;
                    this.hideArt();
                    if (!String.isString(artUri))
                        return;
                    return WinJS.Promise.timeout(wasLoaded ? this._artDelay : 0).then(function _delay() {
                            if (this._hideArtDelayPromise) {
                                this._hideArtDelayPromise.cancel();
                                this._hideArtDelayPromise = null
                            }
                            if (artUri) {
                                this.currentImageUrl = artUri;
                                this._imageLoader.setAttribute("src", artUri);
                                this.showArt()
                            }
                            else {
                                this.currentImageUrl = null;
                                this._pendingShow = false;
                                this.domElement.style.opacity = 0;
                                this._loaded = true
                            }
                        }.bind(this))
                }, toggleArt: function toggleArt(show) {
                    if (show === MS.Entertainment.UI.Controls.LargeWallArt.toggleArtState.show || this._pendingShow)
                        if (this._loaded) {
                            this._pendingShow = false;
                            this.domElement.style.opacity = 1
                        }
                        else
                            this._pendingShow = true;
                    else
                        this.domElement.style.opacity = 0
                }
        }, {
            showDelay: 2000, colorShowDelay: 2000, toggleArtState: {
                    show: "show", hide: "hide"
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ImageCollage: MS.Entertainment.UI.Framework.defineUserControl("Controls/ImageCollage.html#Template", function ImageCollage(element, options) {
            this._cells = [];
            this._cellDefinitions = [];
            this._renderLoop = this._renderLoop.bind(this)
        }, {
            _initialized: false, _blockCountX: 0, _blockCountY: 0, _largeArt: null, _timerEnabled: false, _animationPaused: false, _frozen: false, _cells: null, _blockSizeInPixels: 0, _blockSizeInCells: 0, _cellSizeInPixels: 0, _artIndex: -1, _lastArtShow: 0, _lastArtSwap: 0, _lastCellSwap: 0, _lastColorChange: 0, _lastTimerTick: 0, _cellUsedList: null, _cellUsedCount: 0, _cellOffsetInPixels: 0, _resizeTimeoutPromise: null, _timerPromise: null, _minCellsForTimer: 10, _maxSearchCount: 20, _uiStateService: null, _renderLoopQueued: false, _lastWidth: 0, timerTickInterval: 1000, timerDelayPeriod: 3000, cellAddPeriod: 0, cellRepeatBuffer: 5, cellSwapPeriod: 5000, artShowPeriod: 30000, artSwapPeriod: 11000, artVisiblePeriod: 30000, colorChangePeriod: 0, cellDefinitions: null, cellFilter: null, backgroundColor: "#000000", largeArtDelay: null, initialize: function initialize(element, options, dom) {
                    this._updateSize = this._updateSize.bind(this);
                    this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState)
                }, _delayInitialized: function _delayInitialized() {
                    this.bind("cellIdList", this._onCellIdListChanged.bind(this));
                    this.bind("largeArtUrls", this._updateArt.bind(this));
                    MS.Entertainment.Utilities.attachResizeEvent(this.domElement, this._updateSize)
                }, unload: function unload() {
                    MS.Entertainment.Utilities.detachResizeEvent(this.domElement, this._updateSize);
                    this._timerEnabled = false;
                    this._clearCells();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this._frozen = false;
                    if (this._timerEnabled && !this._renderLoopQueued)
                        this._startRenderLoop();
                    this.play()
                }, pause: function pause() {
                    this._animationPaused = true;
                    if (this._largeArt)
                        this._largeArt.hideArt()
                }, play: function play() {
                    this._animationPaused = false;
                    if (this._largeArt && this.artVisible)
                        this._largeArt.showArt()
                }, freeze: function freeze() {
                    this._frozen = true;
                    this.pause();
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, _updateSize: function _updateSize() {
                    if (this.domElement.clientWidth > 0 && this._lastWidth === this.domElement.clientWidth)
                        return;
                    this._lastWidth = this.domElement.clientWidth;
                    if (this._resizeTimeoutPromise)
                        this._resizeTimeoutPromise.cancel();
                    this._resizeTimeoutPromise = WinJS.Promise.timeout(500).then(function updateCells() {
                        if (this.cellIdList)
                            this._setCellImages(true)
                    }.bind(this))
                }, _clearCells: function _clearCells() {
                    if (!this.wallContainer)
                        this._timerEnabled = false;
                    else {
                        MS.Entertainment.Utilities.empty(this.wallContainer);
                        this._cells = [];
                        this._cellUsedList = []
                    }
                }, _onCellIdListChanged: function _onCellIdListChanged(newValue) {
                    if (newValue)
                        this._setCellImages(false)
                }, _setCellImages: function _setCellImages(clearCells) {
                    if (!this._cells || !this._cells.length || clearCells || !this.cellIdList || !this.cellIdList.length)
                        this._clearCells();
                    if (!this.cellIdList || !this.cellIdList.length || this._unloaded)
                        return;
                    if (this._cells && this._cells.length > 0) {
                        this._cellUsedCount = 0;
                        this._cellUsedList = [];
                        this._cellUsedList.length = this.cellIdList.length;
                        this._updateCellArts();
                        return
                    }
                    if (!this._cellUsedList)
                        this._cellUsedList = [];
                    this._cellUsedList.length = this.cellIdList.length;
                    var defaultWidth = (this.size && this.size.width) ? this.size.width : window.screen.width;
                    var defaultHeight = (this.size && this.size.height) ? this.size.height : window.screen.height;
                    var elementWidth = this.domElement.clientWidth ? this.domElement.clientWidth : defaultWidth;
                    var elementHeight = this.domElement.clientHeight ? this.domElement.clientHeight : defaultHeight;
                    this._blockCountX = Math.ceil(elementWidth / this._blockSizeInPixels.x);
                    this._blockCountY = Math.ceil(elementHeight / this._blockSizeInPixels.y);
                    this._lastWidth = elementWidth;
                    this._toggleStartTime = 0;
                    var color = this.backdropColor;
                    if (this.colorChangePeriod > 0) {
                        var randomColor = this._randomizeLayerColor();
                        color = "rgba(" + randomColor.r + "," + randomColor.g + "," + randomColor.b + "," + randomColor.a + ")"
                    }
                    var cellCount = this._blockCountX * this._blockCountY * this.cellDefinitions.length;
                    for (var i = 0; i < cellCount; i++) {
                        var newCell = this._initCell(i, elementWidth, elementHeight, color);
                        if (newCell)
                            this._cells.push(newCell)
                    }
                    if (!this.artVisible)
                        this._toggleCells(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show);
                    if (!this._timerEnabled && ((this.largeArtUrls && this.largeArtUrls.length > 0) || ((this.cellIdList && this.cellIdList.length > this._cells.length) || this._cells.length >= this._minCellsForTimer))) {
                        this._timerEnabled = true;
                        this._startRenderLoop()
                    }
                    else if (this._timerEnabled && ((!this.largeArtUrls || this.largeArtUrls.length === 0) && ((!this.cellIdList || this.cellIdList.length <= this._cells.length) && this._cells.length < this._minCellsForTimer)))
                        this._timerEnabled = false
                }, _updateArt: function _updateArt(newVal, oldVal) {
                    if (oldVal === undefined || !this.artContainer)
                        return;
                    this._artIndex = -1;
                    if (!this.largeArtUrls) {
                        this._setArtVisible(false);
                        this._toggleCells(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show);
                        if (this._largeArt)
                            this._setLargeArt(null);
                        return
                    }
                    if (!this._largeArt) {
                        this._largeArt = new MS.Entertainment.UI.Controls.LargeWallArt;
                        this._largeArt.initialize(this.artContainer.domElement, 0, 0, "100%", "100%", this.backgroundColor, this.largeArtFilter, this.largeArtDelay);
                        if (this.colorChangePeriod > 0)
                            this._randomizeLayerColors()
                    }
                    if (!this.largeArtUrls)
                        this._setLargeArt(null);
                    if (this.largeArtUrls && (!this._timerEnabled || this.artVisible)) {
                        this._randomizeArt();
                        this._setArtVisible(true);
                        this._lastArtSwap = 0
                    }
                    else {
                        this._artIndex = -1;
                        this._setArtVisible(false)
                    }
                    if (!this._timerEnabled && (this.largeArtUrls.length > 1 || (this.largeArtUrls.length === 1 && this.largeArtUrls[0] === String.empty))) {
                        this._timerEnabled = true;
                        this._startRenderLoop()
                    }
                    this._lastArtShow = this.artShowPeriod - this.timerDelayPeriod
                }, _initCell: function _initCell(cellIndex, maxWidth, maxHeight, color) {
                    var that = this;
                    var cell = new MS.Entertainment.UI.Controls.ImageCollageCell;
                    var blockSet = Math.floor(cellIndex / this.cellDefinitions.length);
                    var blockOffsetX = (blockSet % this._blockCountX) * this._blockSizeInCells.x * this._cellSizeInPixels.x - this._cellSizeInPixels.x * this._cellOffsetInPixels;
                    var blockOffsetY = (Math.floor(blockSet / this._blockCountX)) * this._blockSizeInCells.y * this._cellSizeInPixels.y - this._cellSizeInPixels.y * this._cellOffsetInPixels;
                    var cellDefinition = this.cellDefinitions[cellIndex % this.cellDefinitions.length];
                    if ((blockOffsetX + (cellDefinition.x * this._cellSizeInPixels.x) + (cellDefinition.size * this._cellSizeInPixels.x)) <= 0 || (blockOffsetX + (cellDefinition.x * this._cellSizeInPixels.x)) > maxWidth || (blockOffsetY + (cellDefinition.y * this._cellSizeInPixels.y) + (cellDefinition.size * this._cellSizeInPixels.y)) <= 0 || (blockOffsetY + (cellDefinition.y * this._cellSizeInPixels.y)) > maxHeight)
                        return null;
                    cell.initialize({
                        x: blockOffsetX, y: blockOffsetY
                    }, cellDefinition, this._cellSizeInPixels, this.cellFilter, this.backgroundColor);
                    cell.setOverlay(color, 0.5);
                    this._setCellArt(cell);
                    if (!MS.Entertainment.Utilities.checkIfInDom(this.domElement) || !this.wallContainer)
                        return null;
                    else
                        this.wallContainer.appendChild(cell.domElement);
                    return cell
                }, _setCellArt: function _setCellArt(cell) {
                    if (!cell || !this.cellIdList || !this.cellIdList.length || this._unloaded)
                        return;
                    if (cell.urlIndex > 0 && cell.urlIndex < this.cellIdList.length - 1)
                        if (this._cellUsedList[cell.urlIndex]) {
                            if (this._cellUsedList[cell.urlIndex] < fileScope.CELL_BAD_IMAGE)
                                this._cellUsedList[cell.urlIndex] = 0;
                            if (this._cellUsedCount > 0)
                                this._cellUsedCount--
                        }
                    var random = -1;
                    var loopCount = 0;
                    var lastNonDefault = -1;
                    while (random < 0) {
                        var testIndex = Math.floor(Math.random() * this.cellIdList.length);
                        if (this._cellUsedList[testIndex] < fileScope.CELL_BAD_IMAGE)
                            lastNonDefault = testIndex;
                        if (!this._cellUsedList[testIndex] || loopCount > this._maxSearchCount || this._cellUsedCount >= this.cellIdList.length - this.cellRepeatBuffer)
                            random = testIndex;
                        loopCount++
                    }
                    if (this._cellUsedList[random] === fileScope.CELL_BAD_IMAGE && lastNonDefault >= 0)
                        random = lastNonDefault;
                    if (!this._cellUsedList[random]) {
                        this._cellUsedCount++;
                        this._cellUsedList[random] = fileScope.CELL_USED
                    }
                    cell.urlIndex = random;
                    WinJS.Promise.as(this._setUrlFromCellId(this.cellIdList[random], cell)).done(function checkIfSet(imageUrl) {
                        if (!imageUrl)
                            WinJS.Promise.timeout().done(function() {
                                this._cellUsedList[random] = fileScope.CELL_BAD_IMAGE;
                                this._setCellArt(cell)
                            }.bind(this))
                    }.bind(this))
                }, _setUrlFromCellId: function _getUrlFromCellId(cellId, cell) {
                    return cell.setArt(cellId)
                }, _setArtVisible: function _setArtVisible(visible) {
                    if (this.artVisible !== visible) {
                        this.artVisible = visible;
                        if (this._largeArt)
                            if (visible)
                                this._largeArt.showArt();
                            else
                                this._largeArt.hideArt()
                    }
                }, _timerTick: function _timerTick() {
                    if (!MS.Entertainment.Utilities.checkIfInDom(this.domElement))
                        this._unloaded = true;
                    if (this._timerEnabled && !this._unloaded)
                        if (this._uiStateService.isAppVisible && !this._frozen) {
                            if (this._lastArtShow >= this.artShowPeriod && this._largeArt && this.largeArtUrls) {
                                if (!this.artVisible) {
                                    this._lastArtSwap = 0;
                                    this._randomizeArt();
                                    this._setArtVisible(true);
                                    this._toggleCells(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.hide)
                                }
                                else if (this.artVisible && this._lastArtSwap >= this.artSwapPeriod) {
                                    this._lastArtSwap = 0;
                                    this._randomizeArt()
                                }
                                else if (this.artVisible && this._cells && this._cells.length > 0 && this._lastArtShow >= this.artShowPeriod + this.artVisiblePeriod) {
                                    this._setArtVisible(false);
                                    this._lastCellSwap = 0;
                                    this._toggleCells(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.show);
                                    this._lastArtShow = 0;
                                    this._lastArtSwap = 0
                                }
                            }
                            else if (this._cells && this._cells.length > 0 && !this.artVisible && this._lastCellSwap >= this.cellSwapPeriod) {
                                this._lastCellSwap = 0;
                                var randomCell = this._cells[Math.floor(Math.random() * this._cells.length)];
                                this._setCellArt(randomCell)
                            }
                            if (this.colorChangePeriod > 0 && this._lastColorChange > this.colorChangePeriod) {
                                this._lastColorChange = 0;
                                this._randomizeLayerColors()
                            }
                        }
                }, _startRenderLoop: function _startRenderLoop() {
                    this._lastInterval = (new Date).getTime();
                    window.requestAnimationFrame(this._renderLoop)
                }, _lastInterval: 0, _renderLoop: function _renderLoop() {
                    this._renderLoopQueued = false;
                    if (this._frozen || this._unloaded || !this._timerEnabled)
                        return;
                    var elapsedTime = ((new Date).getTime()) - this._lastInterval;
                    if (elapsedTime > 20) {
                        this._lastInterval = (new Date).getTime();
                        if (!this._animationPaused) {
                            this._lastTimerTick += elapsedTime;
                            if (this._lastTimerTick > this.timerTickInterval) {
                                this._updateTimerValues();
                                this._timerTick();
                                this._lastTimerTick = 0
                            }
                            this._updateStartTime += elapsedTime;
                            if (this._cellsToUpdate && this._cellsToUpdate.length > 0) {
                                var updateInfo = this._cellsToUpdate[0];
                                if (updateInfo.sleep <= this._updateStartTime) {
                                    this._setCellArt(updateInfo.cell);
                                    this._cellsToUpdate.shift()
                                }
                            }
                        }
                    }
                    window.requestAnimationFrame(this._renderLoop);
                    this._renderLoopQueued = true
                }, _updateTimerValues: function _updateTimerValues() {
                    this._lastArtShow += this.timerTickInterval;
                    this._lastArtSwap += this.timerTickInterval;
                    this._lastCellSwap += this.timerTickInterval;
                    this._lastColorChange += this.timerTickInterval
                }, _toggleCells: function _toggleCells(show) {
                    this._cells.forEach(function(cell, index) {
                        var sleep = (cell.x + cell.x + cell.width + cell.y + cell.y + cell.height) / 2;
                        cell.toggleCell(show, sleep)
                    }.bind(this))
                }, _cellsToUpdate: null, _updateStartTime: 0, _updateCellArts: function _updateCellArts() {
                    if (this._cellsToUpdate && this._cellsToUpdate.length > 0)
                        return;
                    this._cellsToUpdate = [];
                    this._cells.forEach(function(cell, index) {
                        var sleep = (cell.x + cell.x + cell.width + cell.y + cell.y + cell.height) / 2;
                        this._cellsToUpdate.push({
                            sleep: sleep, cell: cell
                        })
                    }.bind(this))
                }, _randomizeLayerColor: function _randomizeLayerColor() {
                    var r1 = Math.floor(Math.random() * 255);
                    var g1 = Math.floor(Math.random() * 255);
                    var b1 = Math.floor(Math.random() * 255);
                    var a1 = 1;
                    return {
                            r: r1, g: g1, b: b1, a: a1
                        }
                }, _randomizeLayerColors: function _randomizeLayerColors() {
                    var color = this._randomizeLayerColor();
                    var newColor = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
                    if (this.backgroundColor)
                        this.backdropColor = "rgba(" + color.r + "," + color.g + "," + color.b + ", .3)";
                    this._colorsToUpdate = [];
                    this._cells.forEach(function(cell, index) {
                        var sleep = (cell.x + cell.x + cell.width + cell.y + cell.y + cell.height) / 2;
                        cell.setOverlay(newColor, 0.5, sleep + "ms")
                    }.bind(this));
                    if (this._largeArt)
                        this._largeArt.setOverlay(newColor, 0.3)
                }, _randomizeArt: function _randomizeArt() {
                    if (this.largeArtUrls) {
                        if (this._artIndex < 0)
                            this._artIndex = Math.floor(Math.random() * this.largeArtUrls.length);
                        else {
                            if (this.largeArtUrls.length === 1 && this._largeArt.currentImageUrl)
                                return false;
                            this._artIndex++;
                            if (this._artIndex >= this.largeArtUrls.length)
                                this._artIndex = 0
                        }
                        var imageUrl = this.largeArtUrls[this._artIndex];
                        this._setLargeArt(imageUrl);
                        this._toggleCells(MS.Entertainment.UI.Controls.ImageCollageCell.toggleCellState.hide);
                        return true
                    }
                    else {
                        this._setLargeArt(null);
                        return false
                    }
                }, _setLargeArt: function _setLargeArt(art) {
                    if (this._largeArt)
                        this._largeArt.setArt(art)
                }
        }, {
            cellIdList: null, largeArtUrls: null, wallVisible: true, artVisible: false, backdropColor: "rgba(0,0,0,0.3)"
        })})
})()
