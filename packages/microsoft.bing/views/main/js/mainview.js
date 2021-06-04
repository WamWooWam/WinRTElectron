/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../../common/js/tracing.js' />
/// <reference path='../../../common/js/utilities.js' />
/// <reference path='../../../shell/js/backgroundImageLoader.js' />
/// <reference path='../../../shell/js/nativeinstrumentation.js' />
/// <reference path='../../../shell/js/viewcontroller.js' />
/// <reference path='../../../shell/js/servicelocator.js' />
/// <reference path='../../../shell/js/eventrelay.js' />
/// <reference path='../../../shell/js/shell.js' />
/// <reference path='searchbar.js' />

(function (env) {
    "use strict";

    var searchBarMessageContentLoaded = "searchBar:contentLoaded";
    var searchBarMessageResize = "searchBar:resize";
    var searchBarMessageResizeFull = "full";
    var searchBarMessageResizeNormal = "normal";
    var searchBarMessageResizeHidden = "hidden";
    var searchBarResizeDuration = 0; // milliseconds
    var searchBarFullSize = "100%";
    var searchBarNormalSize = "120px";
    var searchBarNormalSnappedSize = "60px";
    var searchBarHiddenSize = "0%";
    var mainViewMessageShowContent = "mainView:showContent";
    var lightOpacity = "0.6";
    var darkOpacity = "0.8";
    var transparentOpacity = "0";
    var opaqueOpacity = "1";
    var searchBarShieldLight = "light";
    var searchBarShieldDark = "dark";
    var searchBarOpacityChangeDuration = 250; // milliseconds
    var winJSAnimationFadeInTimeMS = 167; // duration (in milliseconds), from fadeIn implementation in ui.js
    var hotspotCount = 4;

    var isLandscapeMode = true,
        isHotspotsShowing = false,
        isScrollComplete = true,
        scrollTimer,
        scrollTimeoutMS = 100,
        hotspotIdleFadeTimer,
        hotspotIdleTimeoutMS = 3500,
        hotspotFadeTimeMS = 500,
        fadeInOutAnimationTimeMS = 300,
        attribUnselectedOpacity = "0.4",
        attribSelectedOpacity = "0.6",
        hotspotSelectedOpacity = "1.0",
        hotspotIndex = -1,
        currentImageIndex = 0,
        pageWidth = 0,
        pageHeight = 0,
        defImageDimension = 100,
        hsDescriptWidthOffset = 486,
        hsDescriptLeftOffset = "-486px",
        hsDescriptDefaultOffset = "46px",
        defaultHost,
        cachedSettings = [],
        strHstId = "#hst",
        strHscId = "#hsc",
        strHsc = ".hsContainer",
        strHst = ".hsTrigger",
        strStyle = "style",
        strSelectedClass = "selected",
        strDisplay = "display",
        strBlock = "block",
        strNone = "none",
        strPx = "px",
        maxnumimages = 7,
        newImageTimeoutMS = 2000,
        isFirstDisplay = true;

    /// <summary>
    /// Defines class for main view controller.
    /// </summary>
    var MainViewController = WinJS.Class.derive(
        BingApp.Classes.ViewController,
        function constructor(mainViewPage) {
            /// <summary>
            /// Allocates a new MainViewController which is to be associated with the provided main
            /// view page.
            /// </summary>
            /// <param name="mainViewPage">
            /// The main view page.
            /// </param>
            BingApp.Classes.ViewController.call(this);

            var searchBarIFrame = document.querySelector("#searchbariframe");
            this._searchBar = new BingApp.Classes.SearchBar(searchBarIFrame);
            this._mainViewPage = mainViewPage;
        },
        {
            getHost: function () {
                /// <summary>
                /// Gets element that will host contained view.
                /// </summary>
                return document.querySelector("#containedviewhost");
            },
            setNavigationUri: function (uri) {
                /// <summary>
                /// This method is used by View Manager to set navigation Uri for the view.
                /// </summary>
                /// <param name="uri">
                /// Navigation Uri.
                /// </param>
                if (!this._previousUri || this._previousUri.absoluteUri !== uri.absoluteUri) {
                    this._refreshContentDisplay();
                    this._previousUri = uri;
                }
            },
            notifyUnloading: function () {
                /// <summary>
                /// Cleanup when the controller is unloaded
                /// </summary>
                var eventRelay = BingApp.locator.eventRelay;
                if (this._mainViewPage._onNetworkStatusChangeWrapper) {
                    eventRelay.removeEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, this._mainViewPage._onNetworkStatusChangeWrapper);
                }

                if (this._searchBarResizeEventListener) {
                    eventRelay.removeEventListener(searchBarMessageResize, this._searchBarResizeEventListener);
                }

                if (this._searchBarContentLoadedEventListener) {
                    eventRelay.removeEventListener(searchBarMessageContentLoaded, this._searchBarContentLoadedEventListener);
                }

                if (this._settingsCompleteListener) {
                    eventRelay.removeEventListener(BingApp.BackgroundImageLoader.events.settingsLoaded, this._settingsCompleteListener);
                }

                if (this._downloadCompleteListener) {
                    eventRelay.removeEventListener(BingApp.BackgroundImageLoader.events.downloadComplete, this._downloadCompleteListener);
                }

                if (this._windowResizeEventListener) {
                    window.removeEventListener("resize", this._windowResizeEventListener);
                }

                this._searchBar.unregister();

                this._mainViewPage._onNetworkStatusChangeWrapper = null;
                this._searchBarResizeEventListener = null;
                this._searchBarContentLoadedEventListener = null;
                this._settingsCompleteListener = null;
                this._downloadCompleteListener = null;
                this._windowResizeEventListener = null;
                clearTimeout(hotspotIdleFadeTimer);

                BingApp.Classes.ViewController.prototype.notifyUnloading.call(this);
            },
            getSearchBar: function () {
                /// <summary>
                /// Gets the searchbar.
                /// </summary>
                return this._searchBar;
            },
            notifyViewReady: function () {
                /// <summary>
                /// Notifies that the main view page is ready.
                /// view page.
                /// </summary>

                var that = this;
                this._isViewReady = true;

                var eventRelay = BingApp.locator.eventRelay;
                if (!this._searchBarResizeEventListener) {
                    this._searchBarResizeEventListener = {
                        callback: function (data) {
                            that._refreshContentDisplay(data);
                        }
                    };
                    eventRelay.addEventListener(searchBarMessageResize, this._searchBarResizeEventListener);
                }
                if (!this._searchBarContentLoadedEventListener) {
                    this._searchBarContentLoadedEventListener = {
                        callback: function (data) {
                            that._refreshContentDisplay(data);
                        }
                    };
                    eventRelay.addEventListener(searchBarMessageContentLoaded, this._searchBarContentLoadedEventListener);
                }

                if (!this._windowResizeEventListener) {
                    this._windowResizeEventListener = function () {
                            if (that._isSearchBarNormalSize) {
                                if (Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                                    // BugBug: 257766 - Garbage line appears in SNAP mode when set SafeSearch to STRICT
                                    // This repros on Win Builds 8500+ Probably an issue with IE not flushing out it's draw buffer correctly
                                    // For now we are using setImmediate to force IE to redraw and that takes care of the issue
                                    // This might cause side effects to frame rate on low-power machines like ARM but we should revisit
                                    // this if IE fixes this (PS #940227) in future.
                                    setImmediate(function () { header.style.height = searchBarNormalSnappedSize; });
                                } else {
                                    header.style.height = searchBarNormalSize;
                                }
                            }

                        var previousIsLandscapeMode = isLandscapeMode;
                        getPageDimensions();

                        if (isLandscapeMode !== previousIsLandscapeMode) {
                            var navigationUri = BingApp.locator.navigationManager.getCurrentUri();
                            var isUpdateHotspots = false;
                            if (navigationUri) {
                                navigationUri = navigationUri.schemeName + "://" + navigationUri.host + navigationUri.path;
                                if (BingApp.Utilities.areEqualIgnoreCase(navigationUri, BingApp.Classes.Shell.uris.home)) {
                                    isUpdateHotspots = true;
                                }
                            }

                            updatePage(true, isUpdateHotspots);
                        }

                        if (Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                            showAttribTextInSnap();
                        }

                        // When we resize the window, the offset of the bgimagediv changes, causing images to partially show
                        // We need to scroll the div into view to fix this.
                        var currImageDiv = querySelector("#bgImage" + currentImageIndex);
                        if (currImageDiv) {
                            currImageDiv.scrollIntoView();
                        }
                    };
                    window.addEventListener("resize", this._windowResizeEventListener);
                }

                this._refreshContentDisplay();
            },
            _refreshContentDisplay: function (resizeData) {
                /// <summary>
                /// Refreshes the main view content display (opacity, display, etc...).
                /// </summary>
                /// <param name="resizeData" type="Object" optional="true">
                /// The resize event data. This is an object containing a "height" property which
                /// specifies the new size of the search bar ("full", "normal", "hidden").
                /// </param>
                var navigationUri = BingApp.locator.navigationManager.getCurrentUri();
                if (this._isViewReady && navigationUri) {
                    navigationUri = navigationUri.schemeName + "://" + navigationUri.host + navigationUri.path;
                    var hotspots = [hsc0, hsc1, hsc2, hsc3];
                    var searchBarSizeChanged;

                    // Handle search bar resize animation
                    if (resizeData && this._currentSearchBarSize !== resizeData.height) {
                        var newHeaderSize;

                        searchBarSizeChanged = true;

                        // TODO: This transition animation will change based on UX feedbacks
                        if (resizeData.height === searchBarMessageResizeFull) {
                            newHeaderSize = searchBarFullSize;
                            this._isSearchBarNormalSize = false;
                        } else if (resizeData.height === searchBarMessageResizeNormal) {
                            if (Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                                newHeaderSize = searchBarNormalSnappedSize;
                            } else {
                                newHeaderSize = searchBarNormalSize;
                            }
                            this._isSearchBarNormalSize = true;
                        } else if (resizeData.height === searchBarMessageResizeHidden) {
                            newHeaderSize = searchBarHiddenSize;
                            this._isSearchBarNormalSize = false;
                        }
                        if (newHeaderSize) {
                            this._currentSearchBarSize = resizeData.height;
                            header.style.display = "";
                            WinJS.UI.executeTransition(header, {
                                property: "height",
                                delay: 0,
                                duration: searchBarResizeDuration,
                                timing: "linear",
                                to: newHeaderSize
                            }).done(function () {
                                if (header.style.height === searchBarHiddenSize) {
                                    header.style.display = strNone;
                                } else {
                                    header.style.display = "";
                                }
                            });
                            // Shield is always displayed if the search bar expands to full screen
                            if (resizeData.height === searchBarMessageResizeFull) {
                                shield.style.display = "";
                            }
                        }
                    }

                    var newShieldOpacity;

                    if (resizeData && resizeData.shield) {
                        // Keep track of shield opacity request, if available
                        if (resizeData.shield === searchBarShieldLight) {
                            newShieldOpacity = lightOpacity;
                        } else if (resizeData.shield === searchBarShieldDark) {
                            newShieldOpacity = darkOpacity;
                        } // Else: to be handled afterwards
                    }

                    var isNavigating;

                    if (resizeData && resizeData.navigating) {
                        isNavigating = true;
                    }

                    // Handle shield opacity animation
                    if (!newShieldOpacity) {
                        // Shield opacity has not been set by a search bar resize event
                        if (BingApp.Utilities.areEqualIgnoreCase(navigationUri, BingApp.Classes.Shell.uris.search) ||
                                BingApp.Utilities.areEqualIgnoreCase(navigationUri, BingApp.Classes.Shell.uris.start)) {
                            newShieldOpacity = lightOpacity;
                        } else if (BingApp.Utilities.areEqualIgnoreCase(navigationUri, BingApp.Classes.Shell.uris.imagesdetail) ||
                                BingApp.Utilities.areEqualIgnoreCase(navigationUri, BingApp.Classes.Shell.uris.imagesgrid)) {
                            newShieldOpacity = darkOpacity;
                        } else {
                            newShieldOpacity = transparentOpacity;
                        }
                    }
                    if (shield.style.opacity === "") {
                        shield.style.opacity = "0";
                        shield.style.display = strNone;
                    }
                    if (shield.style.opacity !== newShieldOpacity) {
                        if (!isNavigating) {
                            // Update the shield opacity
                            shield.style.display = "";
                            var onOpacityComplete = function () {
                                // Remove shield if it became transparent
                                if (shield.style.opacity === transparentOpacity) {
                                    shield.style.display = strNone;
                                }
                            };
                            WinJS.UI.executeTransition(shield, {
                                property: "opacity",
                                delay: 0,
                                duration: searchBarOpacityChangeDuration,
                                timing: "linear",
                                from: shield.style.opacity,
                                to: newShieldOpacity
                            }).then(onOpacityComplete, onOpacityComplete);
                        } // Else keep the shield opacity unchanged
                    } else if (shield.style.opacity === "0") {
                        shield.style.display = strNone;
                    }

                    // Show or hide content
                    if (this._currentSearchBarSize === searchBarMessageResizeFull) {
                        if (searchBarSizeChanged) {
                            // Full screen search bar, hide everything behind it whichever page we're
                            // currently displaying now
                            WinJS.UI.Animation.fadeOut(attribButton).then(function () {
                                attribButton.style.display = strNone;
                            });
                            WinJS.UI.Animation.fadeOut(attribText).then(function () {
                                attribText.style.display = strNone;
                            });
                            closeOpenHotspot(true);
                            hideHotspotContainers(true, true);

                            // Hide hosted content
                            WinJS.UI.Animation.fadeOut(containedviewhost).then(function () {
                                containedviewhost.style.display = strNone;
                            });
                        }
                    } else {
                        // Search bar height is normal or hidden, show appropriate content
                        // depending on the current view
                        if (BingApp.Utilities.areEqualIgnoreCase(navigationUri, BingApp.Classes.Shell.uris.home)) {
                            // Start page
                            attribButton.style.display = "";
                            attribText.style.display = "";
                            hotspots.forEach(function (hotspot) {
                                hotspot.style.display = strBlock;
                            });

                            fadeAttribButton(attribUnselectedOpacity);
                            WinJS.UI.Animation.fadeIn(attribText); // Attribution
                            showHotspotContainers();
                        } else {
                            // Other pages

                            // Shield is always displayed on other pages than home
                            shield.style.display = "";

                            WinJS.UI.Animation.fadeOut(attribButton).then(function () {
                                attribButton.style.display = strNone;
                            });
                            WinJS.UI.Animation.fadeOut(attribText).then(function () {
                                attribText.style.display = strNone;
                            });
                            closeOpenHotspot(true);
                            hideHotspotContainers(true, true);
                        }

                        var fireUnhideEvent = containedviewhost.style.display === strNone;

                        // Always show hosted content if search bar height is normal or hidden
                        containedviewhost.style.display = "";

                        if (fireUnhideEvent) {
                            BingApp.locator.eventRelay.fireEvent(mainViewMessageShowContent, null);
                        }

                        var from = containedviewhost.style.opacity;
                        if (from !== "" && from !== opaqueOpacity) {
                            WinJS.UI.Animation.fadeIn(containedviewhost);
                        }
                    }
                }
            },
            _mainViewPage: null,
            _searchBar: null,
            _searchBarResizeEventListener: null,
            _searchBarContentLoadedEventListener: null,
            _settingsCompleteListener: null,
            _downloadCompleteListener: null,
            _isSearchBarNormalSize: false,
            _windowResizeEventListener: null,
            _currentSearchBarSize: null,
            _isViewReady: false,
            _previousUri: null,
        });

    function getController() {
        /// <summary>
        /// Gets the controller object used by View Manager to communicate with this view. This
        /// getter method initializes the controller lazily.
        /// </summary>
        /// <returns>
        /// The view controller.
        /// </returns>
        if (!this._controller) {
            this._controller = new MainViewController(this);
        }
        return this._controller;
    }

    function ready() {
        /// <summary>
        /// Starts the rest of the mainview page
        /// </summary>

        // localize
        WinJS.Resources.processAll();
        defaultHost = BingApp.locator.env.getHostUrl();
        bindEvents();
        getPageDimensions();

        var settingLoadedFromDisk = false;

        var eventRelay = BingApp.locator.eventRelay;

        // Register to listen for hp-related messages 
        var controller = this.getController();

        if (!controller._settingsCompleteListener) {
            controller._settingsCompleteListener = {
                callback: function () {
                    BingApp.traceInfo("mainview.ready: Received settings loaded event");

                    // This is primarily to handle the case we have previous cached settings. We don't want to do
                    // this repeatedly to prevent flashes on the screen if not needed. MESSAGE_HPDOWNLOAD_COMPLETE
                    // will fire if there are any updates over the cached settings loaded here
                    //
                    if (!settingLoadedFromDisk) {
                        getCachedSettings();
                        updatePage(true, true);
                        settingLoadedFromDisk = true;
                    }
                }
            };
            eventRelay.addEventListener(BingApp.BackgroundImageLoader.events.settingsLoaded, controller._settingsCompleteListener);
        }

        if (!controller._downloadCompleteListener) {
            controller._downloadCompleteListener = {
                callback: function () {
                    BingApp.traceInfo("mainview.ready: Received download complete event");
                    getCachedSettings();
                    closeOpenHotspot();
                    closeOpenAttribText();

                    // When we get new images we fade out and fade in
                    // add a timer for so in the cold start scenario you don't see a large flash
                    // on fast connections when the new image of the day in downloaded and replaces the old one
                    //
                    WinJS.Promise.timeout(newImageTimeoutMS).done(function HPTimer() {
                        WinJS.UI.Animation.fadeOut(bgImagePanorama).done(function fadeOutSuccess() {
                            updatePage(false, true);
                            WinJS.UI.Animation.fadeIn(bgImagePanorama);
                        });
                    });

                }
            };
            eventRelay.addEventListener(BingApp.BackgroundImageLoader.events.downloadComplete, controller._downloadCompleteListener);
        }

        BingApp.BackgroundImageLoader.start();

        // check if we have internet connection since the event might have already fired
        if (!BingApp.locator.networkDetectionService.isConnected()) {
            onNetworkStatusChange({ connectionState: BingApp.Classes.NetworkDetectionService.connectionStates.none });
        }

        this._onNetworkStatusChangeWrapper = function (eventArgs) {
            onNetworkStatusChange(eventArgs);
        };


        eventRelay.addEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, this._onNetworkStatusChangeWrapper);

        header.style.height = searchBarHiddenSize;
        this.getController().notifyViewReady();
    }

    function updatePage(isCachedImage, isUpdateHotspots) {
        /// <summary>
        /// Updates the mainview page
        /// </summary>
        /// <param name="isCachedImage">
        /// Whether this is loaded from cache or download. Used for perf events
        /// </param>
        /// <param name="isUpdateHotspots">
        /// Whether to update hotspots. Used to avoid re-rendering hotspots when unsnapping
        /// SERP
        /// </param>

        if (!cachedSettings || cachedSettings.length === 0) {
            showDefaultImage();
        }
        else {
            updateBackgroundImages();
            updateAttribInfo();
            // This is a localized fix for 255761 
            // We need to refactor this code for GA
            //
            if (isUpdateHotspots) {
                updateHotspotInfo();
            }
        }

        // Only trace after all elements are updated
        //
        if (isCachedImage) {
            BingApp.tracePerf("Homepage:CachedImageLoaded");
        }
        else {
            BingApp.tracePerf("Homepage:DownloadedImageLoaded");
        }
    }

    function getCachedSettings() {
        /// <summary>
        /// Gets the cached settings
        /// </summary>

        cachedSettings = BingApp.BackgroundImageLoader.getSettings();

        // Update links to point within the app when supported
        cachedSettings.forEach(function (value, i, arr) {
            value.hs.forEach(function (hotspot, j, arr) {
                var appLink = BingApp.Classes.Shell.getAppPathFromWebPath(hotspot.link);
                if (appLink) {
                    cachedSettings[i].hs[j].link = appLink;
                }
            });
        });
    }

    function bindEvents() {
        /// <summary>
        /// Binds page events
        /// </summary>

        bindHotspotTrigger();
        bgImagePanorama.addEventListener("mousewheel", wheelScrollHandler);
        bgImagePanorama.addEventListener("mousemove", onMouseMoveHandler);
        bgImagePanorama.addEventListener("scroll", onScrollHandler);
        bgImagePanorama.addEventListener("click", onPageClick);
        bgImagePanorama.addEventListener("keydown", keyDownHandler);
        attribButton.addEventListener("click", onAttribClick);
        attribButton.addEventListener("keydown", onAttribClick);
    }

    function onMouseMoveHandler() {
        /// <summary>
        /// Handles mouse move events on page
        /// </summary>
        if (hotspotIndex === -1 && !isHotspotsShowing) {
            // Show hotspot containers only if no active hotspot 
            // and if they are invisible or in process of becoming invisible
            showHotspotContainers();
        }
    }

    function onPageClick() {
        /// <summary>
        /// Handles onpage click
        /// </summary>

        closeOpenHotspot();
        closeOpenAttribText();
        showHotspotContainers();
    }

    function keyDownHandler(e) {
        /// <summary>
        /// Handles the left, right keyboard events
        /// </summary>
        /// <param name="e">
        /// The event object
        /// </param>

        // left arrow key = 37, right arrow key = 39
        if (e.which === 37 || e.which === 39) {
            e.preventDefault();
            var move = 38 - e.which;
            bgImagePanorama.scrollLeft += (move * pageWidth);
        }
    }

    function wheelScrollHandler(e) {
        /// <summary>
        /// Handles the mouse wheel scroll event
        /// </summary>
        /// <param name="e">
        /// The event object
        /// </param>

        e.preventDefault();
        var move = -1;
        if (e.wheelDelta > 0) {
            move = 1;
        }

        bgImagePanorama.scrollLeft += move * pageWidth;
        if (bgImagePanorama.scrollLeft < 0) {
            bgImagePanorama.scrollLeft = 0;
        }
    }

    function onScrollHandler() {
        /// <summary>
        /// scroll handler
        /// </summary>

        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(onScrollComplete, scrollTimeoutMS);
        if (isScrollComplete) {
            // start of scroll
            isScrollComplete = false;
            closeOpenHotspot();
            closeOpenAttribText();
        }
    }

    function onScrollComplete() {
        /// <summary>
        /// Scroll complete handler
        /// </summary>

        var offsetLeft = bgImagePanorama.scrollLeft;
        isScrollComplete = true;

        var thisImageIndex = Math.round(offsetLeft / pageWidth);

        if (thisImageIndex !== currentImageIndex) {
            var instrumentionObj = { name: "HPSwipe", state: currentImageIndex < thisImageIndex ? "Back" : "Front" };
            BingApp.Instrumentation.logClick(instrumentionObj);

            currentImageIndex = thisImageIndex;
            updateAttribInfo();
            updateHotspotInfo();
        }
    }

    function updateBackgroundImages() {
        /// <summary>
        /// Updates the background images
        /// </summary>

        var imageDiv;

        for (var i = 0; i < cachedSettings.length && i < maxnumimages; i++) {
            imageDiv = querySelector("#bgImage" + i);
            var imagePath = "url('ms-appdata:///local/";
            if (isLandscapeMode) {
                imagePath += "landscape";
            } else {
                imagePath += "portrait";
            }

            imagePath += cachedSettings[i].index + ".jpg')";
            imageDiv[strStyle].backgroundImage = imagePath;
        }

        updateImageDisplay(cachedSettings.length);
    }


    function updateHotspotInfo() {
        /// <summary>
        /// updates the hotspots
        /// </summary>

        var transitionPromises = [];

        var hspots = cachedSettings[currentImageIndex].hs,
            hotspotContainers = querySelectorAll(strHsc),
            hotspotTriggers = querySelectorAll(strHst),
            hotspotDescriptions = querySelectorAll(".hsDescription"),
            hotspotAnchors = querySelectorAll(".hsAnchor"),
            hotspotLinksText = querySelectorAll(".hsLinkText");

        var scaledWidth = (pageWidth / defImageDimension);
        var scaledHeight = (pageHeight / defImageDimension);

        // We reduce animation time to 0 in two cases:
        // 1) Hostspots are currently not visible, so moving them slowly just takes up cycles
        // 2) On startup we don't have current coordinates so we don't want them to slide slowly from 0,0
        //
        var animationDuration = 1000;
        if (!isHotspotsShowing || isFirstDisplay) {
            animationDuration = 0;
        }

        isFirstDisplay = false;

        for (var i = 0; i < hspots.length; i++) {
            var hotspot = hspots[i],
                hotspotAnchor = hotspotAnchors[i],
                hotspotLinkText = hotspotLinksText[i],
                locX = parseInt(hotspot.LocX) * scaledWidth,
                locY = parseInt(hotspot.LocY) * scaledHeight;

            // Hide hotspot if it is outside the page
            if (locX < pageWidth || locY < pageHeight) {
                if (locX + hsDescriptWidthOffset > pageWidth) {
                    hotspotAnchor.style.left = hsDescriptLeftOffset;
                }
                else {
                    hotspotAnchor.style.left = hsDescriptDefaultOffset;
                }

                hotspotTriggers[i].style.visibility = "visible";
                hotspotTriggers[i].style.display = strBlock;
                hotspotDescriptions[i].innerHTML = hotspot.desc;

                var translate = "translatex(" + locX + strPx + ") translateY(" + locY + strPx + ")";

                // do not execute more animations until these promises complete, breaking
                // this rule causes animations on hotspots to break (they jump instead of
                // moving smoothly)
                //
                transitionPromises.push(WinJS.UI.executeTransition(
                hotspotContainers[i],
                {
                    property: "transform",
                    delay: 0,
                    duration: animationDuration,
                    // bezier curve coordinates, will move fast initially then slow down as approach destination
                    timing: "cubic-bezier(0.1, 0.9, 0.2, 1)", 
                    to: translate,
                }));

                var newLink = updateHotspotLinkWithFormCode(hotspot.link, i + 1);
                hotspotAnchor.href = newLink;
                hotspotLinkText.innerHTML = hotspot.query;
            } else {
                hotspotTriggers[i].style.display = strNone;
            }
        }

        if (hspots.length === 0) {
            WinJS.Utilities.addClass(hotspotsContainer, "hidden");
        }
        else {
            // remove class to hide hotspots 
            //
            WinJS.Utilities.removeClass(hotspotsContainer, "hidden");
            showHotspotContainers(WinJS.Promise.join(transitionPromises));
        }
    }

    function HotspotNavigate(href) {
        /// <summary>
        /// Navigates to the href specified and logs appropriate instrumentation
        /// </summary>
        /// <param name="href">
        /// The href to navigate to
        /// </param>

        var instrumentionObj = { name: "HotSpot" };
        BingApp.Instrumentation.logClick(instrumentionObj);

        if (href) {
            if (BingApp.Classes.Shell.isSupportedAppUri(href)) {
                BingApp.locator.navigationManager.navigateTo(href);
            }
            else {
                BingApp.Utilities.invokeURI(href);
            }
        }
    };

    function bindHotspotTrigger() {
        /// <summary>
        /// binds the click, enter and space keys to the hotspots
        /// </summary>

        var hotspotTriggers = querySelectorAll(strHst);
        for (var i = 0; i < hotspotTriggers.length; i++) {
            hotspotTriggers[i].addEventListener("click", function (index) { return function () { hotspotTriggerClicked(index); } }(i));

            hotspotTriggers[i].addEventListener("keydown", function (index) {
                return function (eventArg) {
                    if (!isKeyDownAndSpaceOrEnterKey(eventArg)) { return; }
                    hotspotTriggerClicked(index);
                }
            }(i));
        }

        var hslinks = querySelectorAll(".hsLinkText");
        for (var i = 0; i < hslinks.length; i++) {
            var hslink = hslinks[i];
            if (!hslink.onblur) {
                hslink.onblur = function () {
                    closeOpenHotspot();
                };
            }
        }

        var hotspotAnchors = querySelectorAll(".hsAnchor");
        for (var i = 0; i < hotspotAnchors.length; i++) {
            var hotspotAnchor = hotspotAnchors[i];
            hotspotAnchor.addEventListener("keydown", function (eventArg) {
                    if (!BingApp.Utilities.isKeyDownAndSpaceOrEnterKey(eventArg)) { return; }
                    HotspotNavigate(this.href);
                });

            if (!hotspotAnchor.onclick) {
                hotspotAnchor.onclick = function () {
                    HotspotNavigate(this.href);
                }
            }
        }
    }

    function hotspotTriggerClicked(index, keepHotspotContainersHidden) {
        /// <summary>
        /// handler for hotspot clicked event
        /// </summary>
        /// <param name="index">
        /// The index of the hotspot
        /// </param>
        /// <param name="keepHotspotContainersHidden" type="Boolean">
        /// Flag specifying whether the hotspot containers should remained hidden or not, in case
        /// the clicked hotspot description needs to be hidden.
        /// </param>

        if (index < 0) {
            return;
        }

        var domIndex = index;
        var hotspotTrigger = querySelector(strHstId + domIndex),
            hotspotContainer = querySelector(strHscId + domIndex),
            hotspotAnchor = querySelectorAll(".hsAnchor")[domIndex];

        if (hotspotAnchor) {
            closeOpenAttribText();

            if (hotspotAnchor.style.display === strBlock) {
                hotspotIndex = -1;
                WinJS.UI.executeTransition(hotspotAnchor, {
                    property: "opacity",
                    delay: 0,
                    duration: fadeInOutAnimationTimeMS,
                    timing: "linear",
                    to: transparentOpacity
                }).done(function () {
                    hotspotAnchor.style.display = strNone;
                    if (!keepHotspotContainersHidden) {
                        showHotspotContainers();
                    }
                });
            } else {
                hotspotIndex = index;
                // hide any other hotspots containers
                hideHotspotContainers();
                hotspotAnchor.style.display = strBlock;
                // Cant run css style animation right after changing display of container. 
                // We need to run the fade animation after display is complete.
                WinJS.UI.executeTransition(hotspotContainer, {
                    property: "display",
                    delay: 0,
                    duration: 0,
                    timing: "linear",
                    to: strBlock
                }).done(function () {
                    WinJS.UI.executeTransition(hotspotAnchor, {
                        property: "opacity",
                        delay: 0,
                        duration: fadeInOutAnimationTimeMS,
                        timing: "linear",
                        to: hotspotSelectedOpacity
                    })
                });
            }

            hotspotTrigger.focus();
        }
    }

    function updateHotspotLinkWithFormCode(link, index) {
        /// <summary>
        /// Updates the hotspot link form code
        /// </summary>
        /// <param name="link">
        /// The original link
        /// </param>
        /// <param name="index">
        /// The index we want to append
        /// </param>
        /// <returns>
        /// Updated link with form code
        /// </returns>

        var updatedLink;
        var lowcaseLink = link.toLowerCase();
        var startIndex = lowcaseLink.indexOf("&form=");

        if (startIndex === -1) {
            startIndex = lowcaseLink.indexOf("?form=");
        }

        if (startIndex !== -1) {
            // replace the 6-character form code
            // 12 = 6 (length of "&form=" string) + 6 (length of form code)
            updatedLink = link.substring(0, startIndex + 6) + (BingApp.Classes.Shell.formCodes.fromHotspot + index) + link.substring(startIndex + 12);
        } else {
            var fragment = "";
            var fragmentIndex = link.indexOf("#");
            if (fragmentIndex !== -1) {
                fragment = link.substring(fragmentIndex);
                updatedLink = link.substring(0, fragmentIndex);
            }
            else {
                updatedLink = link;
            }

            var paramIndex = link.indexOf("?");
            if (paramIndex === -1) {
                // append as first param
                updatedLink += "?";
            } else {
                updatedLink += "&";
            }

            updatedLink += "form=" + (BingApp.Classes.Shell.formCodes.fromHotspot + index) + fragment;
        }

        return updatedLink;
    }

    function showHotspotContainers(previousAnimationPromise) {
        /// <summary>
        /// Shows all the hotspots
        /// </summary>
        /// <param name="previousAnimationPromise">
        /// The animation to complete before starting the opacity animation
        /// </param>

        clearTimeout(hotspotIdleFadeTimer);
        hotspotIdleFadeTimer = setTimeout(hotspotIdleTimerCallback, hotspotIdleTimeoutMS);

        if (isHotspotsShowing) {
            return;
        }

        function showHotspotContainersHelper()
        {
            isHotspotsShowing = true;
            var hotspots = querySelectorAll(strHsc);
            for (var i = 0; i < hotspots.length; i++) {
                hotspots[i].style.display = strBlock;
            }

            WinJS.UI.executeTransition(hotspots, {
                property: "opacity",
                delay: 0,
                duration: hotspotFadeTimeMS,
                timing: "linear",
                // don't start from opacity 0 as there are
                // cases when we have a hotspot already selected
                // and we don't want that to fade out and in when we
                // click to remove hotspot anchor
                //
                to: 1
            }).done(function () {
                // Make sure the hotspot containers are still visible
                for (var i = 0; i < hotspots.length; i++) {
                    hotspots[i].style.display = strBlock;
                }
            });
        }

        if (previousAnimationPromise) {
            previousAnimationPromise.done(showHotspotContainersHelper);
        }
        else {
            showHotspotContainersHelper();
        }
    }

    function hideHotspotContainers(animateFadeOut, dontSkipCurrentHotspot) {
        /// <summary>
        /// Hides all the hotspots apart from active hotspot
        /// </summary>
        /// <param name="animateFadeOut">
        /// true if it should animate fadeout, false if not
        /// </param>
        /// <param name="dontSkipCurrentHotspot" type="Boolean">
        /// If true, the current hotspot won't be skipped; otherwise it will.
        /// </param>
        var hotspots = querySelectorAll(strHsc);
        isHotspotsShowing = false;
        for (var i = 0; i < hotspots.length; i++) {
            if (!dontSkipCurrentHotspot && i === hotspotIndex) {
                // skip current hotspot
                continue;
            }

            var hotspot = hotspots[i];

            if (animateFadeOut) {
                WinJS.UI.executeTransition(hotspot, {
                    property: "opacity",
                    delay: 0,
                    duration: hotspotFadeTimeMS,
                    timing: "linear",
                    from: hotspot.style.opacity,
                    to: transparentOpacity
                }).done((function (element) {
                    return function () {
                        element.style.display = strNone;
                    }
                })(hotspot));
            }
            else {
                hotspot.style.display = strNone;
                hotspot.style.opacity = transparentOpacity;
            }
        }
    }

    function hotspotIdleTimerCallback() {
        /// <summary>
        /// handles the hotspotidle timer
        /// </summary>
        hideHotspotContainers(true);
    }

    function closeOpenHotspot(keepHotspotContainersHidden) {
        /// <summary>
        /// close any hotspot showing a description
        /// </summary>
        /// <param name="keepHotspotContainersHidden" type="Boolean">
        /// Flag specifying whether the hotspot containers should remained hidden or not, in case
        /// the clicked hotspot description needs to be shown.
        /// </param>

        if (hotspotIndex >= 0 && hotspotIndex < hotspotCount) {
            hotspotTriggerClicked(hotspotIndex, keepHotspotContainersHidden);
        }
    }

    // TODO - this is a temporary fix for regression caused by checkin 71909
    // causes info button to regress
    //
    function isKeyDownAndSpaceOrEnterKey(eventArg) {
        /// <summary>
        /// Determines if the keypress was space or enter key
        /// </summary>
        /// <param name="eventArg">
        /// Event args for event
        /// </param>
        /// <returns>
        /// True if key is space or enter
        /// </returns>

        // Enter = 13, Space = 32
        if (eventArg.type == "keydown" && (eventArg.which !== 32 && eventArg.which !== 13)) {
            return false;
        }

        return true;
    }


    function onAttribClick(eventArg) {
        /// <summary>
        /// Handles the image attrib button click
        /// </summary>

        if (!isKeyDownAndSpaceOrEnterKey(eventArg)) { return; }

        if (WinJS.Utilities.hasClass(attribText, strSelectedClass)) {
            closeOpenAttribText();
        } else {
            closeOpenHotspot();
            attribText.style.display = strBlock;
            fadeAttribButton(attribSelectedOpacity);
            WinJS.Utilities.addClass(attribText, strSelectedClass);
        }
    }

    function closeOpenAttribText() {
        /// <summary>
        /// Closes any open attrib text
        /// </summary>

        if (Windows.UI.ViewManagement.ApplicationView.value !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {
            attribText.style.display = strNone;
            fadeAttribButton(attribUnselectedOpacity);
            WinJS.Utilities.removeClass(attribText, strSelectedClass);
        }
        else {
            showAttribTextInSnap();
        }
    }

    function showAttribTextInSnap() {
        /// <summary>
        /// Shows attrib text in snap mode
        /// </summary>
        var accessibilitySettings = new Windows.UI.ViewManagement.AccessibilitySettings();
        if (!accessibilitySettings.highContrast) {
            attribText.style.display = strBlock;
            WinJS.Utilities.addClass(attribText, strSelectedClass);
        }
    }

    function fadeAttribButton(newOpacity) {
        /// <summary>
        /// Fades the attrib button to set opacity
        /// </summary>
        /// <param name="newOpacity">
        /// The new opacity
        /// </param>

        var currOpacity = attribButton.style.opacity;
        if (currOpacity !== newOpacity) {
            WinJS.UI.executeTransition(attribButton, {
                property: "opacity",
                delay: 0,
                duration: fadeInOutAnimationTimeMS,
                timing: "linear",
                from: currOpacity,
                to: newOpacity
            });
        }
    }

    function updateAttribInfo() {
        /// <summary>
        /// Updates the image attrib information text
        /// </summary>

        attribText.innerHTML = cachedSettings[currentImageIndex].info;
    }

    function getPageDimensions() {
        /// <summary>
        /// Gets the page orientation
        /// </summary>

        pageWidth = BingApp.Utilities.getPageDimensions().width;
        pageHeight = BingApp.Utilities.getPageDimensions().height;

        isLandscapeMode = pageWidth > pageHeight;
    }

    function showDefaultImage() {
        /// <summary>
        /// Shows the default image
        /// </summary>

        var imagePath = "url('/shell/images/defaultBg";
        if (isLandscapeMode) {
            imagePath += "Wide.jpg";
        } else {
            imagePath += "Tall.jpg";
        }

        imagePath += "')";
        bgImage0["style"].backgroundImage = imagePath;
        WinJS.Utilities.addClass(hotspotsContainer, "hidden");
        attribText.innerHTML = WinJS.Resources.getString("default_background_image_text").value;
        updateImageDisplay(1);
    }

    function updateImageDisplay(numImages) {
        /// <summary>
        /// Enables the display attribute on the number of images
        /// we want to display, hides all others
        /// </summary>
        /// <param name="numImages">
        /// The number of images to display
        /// </param>

        var index;
        var imageDiv;

        for (index = 0; index < numImages && index < maxnumimages; index++) {
            imageDiv = querySelector("#bgImage" + index);
            imageDiv["style"].display = "inline-block";
        }

        for (index = numImages; index < maxnumimages; index++) {
            imageDiv = querySelector("#bgImage" + index);
            imageDiv["style"].display = "none";
        }
    }

    function querySelector(selector) {
        /// <summary>
        /// Gets a single document element
        /// </summary>
        return document.querySelector(selector);
    }

    function querySelectorAll(selector) {
        /// <summary>
        /// Gets all document elements that match the selector
        /// </summary>
        return document.querySelectorAll(selector);
    }

    function onNetworkStatusChange(eventArg) {
        /// <summary>
        /// Handles the network change event. It shows the network indicator image if the connection is not available and hides the
        /// the image as soon as the internet connectivity is restored.
        /// </summary>
        /// <param name="eventArgs" type="Object">
        /// Event arguments
        /// </param>


        if (eventArg.connectionState === BingApp.Classes.NetworkDetectionService.connectionStates.internetAccess) {
            networkStatus.style.display = strNone;
        }
        else {
            networkStatusText.innerText = WinJS.Resources.getString("main_internet_connection_not_available").value;
            networkStatus.style.display = "-ms-grid";
        }
    }

    // This will define the constructor for object representing this view
    WinJS.UI.Pages.define("/views/main/html/mainview.html", {
        _controller: null,
        _onNetworkStatusChangeWrapper: null,
        getController: getController,
        showDefaultImage: showDefaultImage,
        ready: ready
    });
})(BingApp.locator.env);
