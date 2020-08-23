/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    WinJS.Namespace.define("MS.Entertainment.Animations.HubStrip", {
        panelContainerClass: "panelContainer", showHubStrip: function showNavigationContainer(navigationContainer, strip) {
                var navigationContainerPromise = MS.Entertainment.Animations.HubStrip._fadeInNavigationContainer(navigationContainer);
                var stripPromise = MS.Entertainment.Animations.HubStrip._fadeInStrip(strip);
                return WinJS.Promise.join([navigationContainerPromise, stripPromise])
            }, _fadeInNavigationContainer: function _fadeInNavigationContainer(navigationContainer) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var eventCount = 0;
                var animationEnd = function(event) {
                        if (event.srcElement === navigationContainer) {
                            eventCount++;
                            if (eventCount === 2) {
                                navigationContainer.removeEventListener("transitionend", animationEnd, false);
                                WinJS.Utilities.removeClass(navigationContainer, "navigationContainerStartLocation");
                                WinJS.Utilities.removeClass(navigationContainer, "hubStripFadeIn");
                                completion()
                            }
                        }
                    };
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    WinJS.Utilities.addClass(navigationContainer, "navigationContainerStartLocation");
                    navigationContainer.addEventListener("transitionend", animationEnd, false);
                    WinJS.Utilities.addClass(navigationContainer, "hubStripFadeIn");
                    WinJS.Utilities.addClass(navigationContainer, "navigationContainerEndLocation")
                }
                else {
                    WinJS.Utilities.addClass(navigationContainer, "navigationContainerEndLocation");
                    completion()
                }
                return promise
            }, _fadeInStrip: function _fadeInStrip(strip) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var eventCount = 0;
                var animationEnd = function(event) {
                        if (event.srcElement === strip) {
                            eventCount++;
                            if (eventCount === 2) {
                                strip.removeEventListener("transitionend", animationEnd, false);
                                WinJS.Utilities.removeClass(strip, "scrollerStartLocation");
                                WinJS.Utilities.removeClass(strip, "hubStripFadeIn");
                                completion()
                            }
                        }
                    };
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    WinJS.Utilities.addClass(strip, "scrollerStartLocation");
                    strip.addEventListener("transitionend", animationEnd, false);
                    WinJS.Utilities.addClass(strip, "hubStripFadeIn");
                    WinJS.Utilities.addClass(strip, "scrollerEndLocation")
                }
                else {
                    WinJS.Utilities.addClass(strip, "scrollerEndLocation");
                    completion()
                }
                return promise
            }, _slideInPanelComponents: function _slideInPanelComponents(panel, expand) {
                var baseDelay = 570;
                var offsetDelay = 50;
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var panelContainer = panel.domElement.querySelector(".panelContainer");
                var panelItems = panel.domElement.querySelectorAll(".secondaryPanelComponent");
                var subPromises = [];
                subPromises.push(MS.Entertainment.Animations.HubStrip._togglePanelItemExpansion(panelContainer, expand, 0));
                var item = null;
                for (var index = 0; index < panelItems.length; index++) {
                    item = panelItems[index].parentElement;
                    WinJS.Utilities.addClass(item, "collapsed");
                    WinJS.Utilities.addClass(item, "panelItemTransition");
                    var subPromise = MS.Entertainment.Animations.HubStrip._togglePanelItemExpansion(item, expand, (index * offsetDelay) + baseDelay).then(function removeTransition() {
                            WinJS.Utilities.removeClass(item, "panelItemTransition")
                        });
                    subPromises.push(subPromise)
                }
                return WinJS.Promise.join(subPromises)
            }, _togglePanelContainerExpansion: function _togglePanelContainerExpansion(panel, expand) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var panelContainer = panel.domElement.querySelector(".panelContainer");
                return MS.Entertainment.Animations.HubStrip._togglePanelItemExpansion(panelContainer, expand, 0)
            }, _togglePanelItemExpansion: function _togglePanelItemExpansion(panelItem, expand, delay) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var animationEnd = function animationEnd(event) {
                        if (event.srcElement === panelItem) {
                            panelItem.removeEventListener("transitionend", animationEnd, false);
                            completion()
                        }
                    };
                var expandCollapse = function expandCollapse() {
                        if (WinJS.Utilities.hasClass(panelItem, "collapsed") && expand) {
                            panelItem.addEventListener("transitionend", animationEnd, false);
                            WinJS.Utilities.removeClass(panelItem, "collapsed");
                            WinJS.Utilities.addClass(panelItem, "expanded")
                        }
                        else if (WinJS.Utilities.hasClass(panelItem, "expanded") && !expand) {
                            panelItem.addEventListener("transitionend", animationEnd, false);
                            WinJS.Utilities.removeClass(panelItem, "expanded");
                            WinJS.Utilities.addClass(panelItem, "collapsed")
                        }
                        else
                            completion();
                        if (MS.Entertainment.ServiceLocator && !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled)
                            completion()
                    };
                if (delay && delay > 0)
                    window.setTimeout(function delayExpansion() {
                        expandCollapse()
                    }, delay);
                else
                    expandCollapse();
                return promise
            }, setupDeclarativeAnimsHubStripPanels: function setupDeclarativeAnimsHubStripPanels(activePanelContainer) {
                var hubScroller = MS.Entertainment.Utilities.findParentElementByClassName(activePanelContainer, "hubStripScroller");
                if (hubScroller) {
                    hubScroller.setAttribute("data-ent-hideanimation", "exitPage");
                    hubScroller.setAttribute("data-ent-showanimation", "enterPage");
                    WinJS.Utilities.addClass(hubScroller, "enterPageOffset3")
                }
            }, scrollHubStrip: function scrollHubStrip(hubStrip, destinationOffset, extraAnimations) {
                var completion;
                var extraAnimationsComplete = false;
                var animationComplete = false;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                function animationEnd(event) {
                    if (event.srcElement === hubStrip._scroller) {
                        hubStrip._scroller.removeEventListener("transitionend", animationEnd, false);
                        hubStrip.animationEnd = null;
                        animationComplete = true;
                        cleanupStrip()
                    }
                }
                {};
                function cleanupStrip() {
                    if (!animationComplete || (extraAnimations && !extraAnimationsComplete))
                        return;
                    WinJS.Utilities.removeClass(hubStrip._scroller, "hubStripScrollTransition");
                    hubStrip._scroller.style.msTransform = "";
                    hubStrip._scroller.style.overflow = "";
                    hubStrip._scroller.scrollLeft = destinationOffset;
                    hubStrip.animating = false;
                    animationComplete = false;
                    completion()
                }
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    if (!hubStrip.animating) {
                        var offset = hubStrip._scroller.scrollLeft;
                        hubStrip._scroller.style.overflow = "visible";
                        hubStrip._scroller.style.msTransform = "translateX(-" + offset + "px)";
                        hubStrip.animating = true
                    }
                    else {
                        hubStrip._scroller.removeEventListener("transitionend", hubStrip.animationEnd, false);
                        hubStrip.animationEnd = null
                    }
                    hubStrip.animationEnd = animationEnd;
                    hubStrip._scroller.addEventListener("transitionend", animationEnd, false);
                    if (extraAnimations)
                        extraAnimations().then(function completeExtraAnimations() {
                            extraAnimationsComplete = true;
                            cleanupStrip()
                        });
                    WinJS.Utilities.addClass(hubStrip._scroller, "hubStripScrollTransition");
                    hubStrip._scroller.style.msTransform = "translateX(-" + destinationOffset + "px)"
                }
                else {
                    hubStrip._scroller.scrollLeft = destinationOffset;
                    completion()
                }
                return promise
            }
    })
})()
