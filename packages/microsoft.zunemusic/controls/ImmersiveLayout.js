/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    var _currentViewMorePopOver = null;
    var CloseOverlayAction = MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function closeOverlayAction() {
            this.base()
        }, {
            executed: function executed(parameter) {
                parameter.hide()
            }, canExecute: function canExecute(parameter) {
                    return true
                }
        });
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        ImmersiveLayout: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ItemsControl", null, function ImmersiveLayout_Constructor(element, options) {
            this._handleScroll = this._handleScroll.bind(this);
            this._handleFocusIn = this._handleFocusIn.bind(this);
            var navigationWrapper = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.navigationWrapper);
            MS.Entertainment.UI.Controls.assert(navigationWrapper, "No navigation wrapper found");
            var wrapperPosition = WinJS.Utilities.getPosition(navigationWrapper);
            var leftEdge = wrapperPosition.left + wrapperPosition.width;
            if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft)
                leftEdge = document.body.clientWidth - wrapperPosition.left;
            if (MS.Entertainment.Utilities.isApp2)
                this.bringIntoViewLeftMargin = 60;
            if (MS.Entertainment.Utilities.isMusicApp2)
                this.defaultHeroStyle = "immersiveHeroFrameColumn";
            this._backButtonLeftEdge = leftEdge;
            this._scroller.addEventListener("scroll", this._handleScroll);
            this.domElement.addEventListener("focusin", this._handleFocusIn)
        }, {
            columnWidth: 400, defaultHeroStyle: "immersiveTwoColumn", bringIntoViewLeftMargin: 120, _backButtonMargin: 40, _calculatedHeroFrameWidth: 0, _backButtonLeftEdge: 120, _currentHeroFrame: null, _boundHandleHeroFrameFullScreenChange: null, currentFrameIndex: MS.Entertainment.UI.Framework.observableProperty("currentFrameIndex", 0), loadItemTemplate: function loadItemTemplate() {
                    this._itemTemplateProvider = {
                        render: function render(context, element) {
                            var completionPromise = WinJS.Promise.as(element);
                            element.setAttribute("data-win-control", "MS.Entertainment.UI.Framework.UserControl");
                            if (context === this._workingDataSource.item(0)) {
                                WinJS.Utilities.addClass(element, this.defaultHeroStyle);
                                completionPromise = context.getData().then(function(data) {
                                    (new context.overviewConstructor(element, {
                                        dataContext: data, frame: context, parent: this
                                    }));
                                    return element
                                }.bind(this), function failedToGetData(error) {
                                    (new MS.Entertainment.UI.Controls.ImmersiveError(element, {dataContext: error}));
                                    return element
                                })
                            }
                            else
                                (new MS.Entertainment.UI.Controls.ImmersiveFrame(element, {
                                    frame: context, parent: this
                                }));
                            return completionPromise
                        }.bind(this), element: {tagName: "div"}
                    };
                    return WinJS.Promise.as()
                }, applyItemTemplate: function applyItemTemplate(container, item) {
                    if (item.columnStyle)
                        WinJS.Utilities.addClass(container, item.columnStyle);
                    switch (item.columnSpan) {
                        case 1:
                            WinJS.Utilities.addClass(container, "immersiveOneColumn");
                            break;
                        case 2:
                            WinJS.Utilities.addClass(container, "immersiveTwoColumn");
                            break;
                        case 3:
                            WinJS.Utilities.addClass(container, "immersiveThreeColumn");
                            break;
                        default:
                            if (!item.columnStyle) {
                                WinJS.Utilities.addClass(container, "immersiveOneColumn");
                                MS.Entertainment.UI.Controls.assert(false, "Unsupported columnspan. defaulting to 1")
                            }
                            break
                    }
                    WinJS.Utilities.addClass(container, "immersiveFrameContainer");
                    container.setAttribute("data-ent-type", "pageScrollerFrame");
                    return container
                }, itemsChanged: function itemsChanged() {
                    if (!this._boundHandleHeroFrameFullScreenChange)
                        this._boundHandleHeroFrameFullScreenChange = this._handleHeroFrameFullScreenChange.bind(this);
                    this.applyPanelTemplate();
                    if (!this._workingDataSource.length) {
                        if (this._currentHeroFrame)
                            this._currentHeroFrame.unbind(this._boundHandleHeroFrameFullScreenChange);
                        return
                    }
                    var heroItem = this._workingDataSource.item(0);
                    MS.Entertainment.UI.Controls.assert(heroItem._getObservable, "Frame 0 needs to be observable");
                    if (!heroItem._getObservable)
                        return;
                    if (heroItem !== this._currentHeroFrame) {
                        if (this._currentHeroFrame)
                            this._currentHeroFrame.unbind("isFullScreen", this._boundHandleHeroFrameFullScreenChange);
                        heroItem.bind("isFullScreen", this._boundHandleHeroFrameFullScreenChange);
                        this._currentHeroFrame = heroItem
                    }
                }, _handleHeroFrameFullScreenChange: function _handleHeroFrameFullScreenChange(newVal, oldVal) {
                    if (this.domElement)
                        if (newVal)
                            WinJS.Utilities.addClass(this.domElement, "immersiveFullScreen");
                        else
                            WinJS.Utilities.removeClass(this.domElement, "immersiveFullScreen")
                }, _handleScroll: function _handleScroll() {
                    if (!this._workingDataSource || !this._workingDataSource.length || MS.Entertainment.Utilities.isApp2 || MS.Entertainment.Utilities.isVideoApp)
                        return;
                    var currentScrollPosition = this._scroller.scrollLeft + (this._backButtonLeftEdge - this._backButtonMargin);
                    if (!this._calculatedHeroFrameWidth)
                        this._calculatedHeroFrameWidth = this.domElement.querySelector(".immersiveTwoColumn:first-of-type").clientWidth;
                    var currentFrameRightEdge = this._calculatedHeroFrameWidth;
                    var offScreenFrames = [];
                    var onScreenFrames = [];
                    for (var i = 1; i < this._workingDataSource.length; i++) {
                        var frame = this._workingDataSource.item(i);
                        if (currentFrameRightEdge < currentScrollPosition)
                            offScreenFrames.push(frame);
                        else
                            onScreenFrames.push(frame);
                        if (frame.columnSpan > 0)
                            currentFrameRightEdge += frame.columnSpan * this.columnWidth;
                        else {
                            var element = this.getElementForItem(frame);
                            currentFrameRightEdge += element.clientWidth
                        }
                    }
                    offScreenFrames.forEach(function(offScreenFrame) {
                        var element = this.getElementForItem(offScreenFrame);
                        var heading = element.querySelector(".headingRow > .headingLink");
                        if (heading && !heading.hasBeenHidden) {
                            heading.hasBeenHidden = true;
                            WinJS.UI.Animation.fadeOut(heading)
                        }
                    }.bind(this));
                    onScreenFrames.forEach(function(onScreenFrame) {
                        var element = this.getElementForItem(onScreenFrame);
                        var heading = element.querySelector(".headingRow > .headingLink");
                        if (heading && heading.hasBeenHidden) {
                            heading.hasBeenHidden = false;
                            WinJS.UI.Animation.fadeIn(heading)
                        }
                    }.bind(this))
                }, _handleFocusIn: function _handleFocusIn() {
                    var children = WinJS.Utilities.children(this.domElement);
                    children.forEach(function(element, index) {
                        if (!element.contains(document.activeElement)) {
                            WinJS.Utilities.removeClass(element, "activeFrame");
                            return
                        }
                        WinJS.Utilities.addClass(element, "activeFrame");
                        this.currentFrameIndex = index
                    }.bind(this))
                }, unload: function unload() {
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.unload.call(this);
                    if (!this._currentHeroFrame)
                        return;
                    this._currentHeroFrame.unbind(this._handleHeroFrameFullScreenChange)
                }, applyPanelTemplate: function applyPanelTemplate() {
                    var positions = [];
                    var nextOffset = 0;
                    for (var i = 0; i < this._workingDataSource.length; i++) {
                        var item = this._workingDataSource.item(i);
                        if (nextOffset)
                            positions.push(nextOffset);
                        var columnWidth = (item.columnSpan * this.columnWidth);
                        if (i === 0) {
                            if (!this._calculatedHeroFrameWidth) {
                                var hero = this.domElement.querySelector(".immersiveTwoColumn:first-of-type");
                                if (hero)
                                    this._calculatedHeroFrameWidth = hero.clientWidth
                            }
                            columnWidth = this._calculatedHeroFrameWidth - this._backButtonLeftEdge
                        }
                        nextOffset += columnWidth
                    }
                    var snaps = "snapList(0px, " + positions.join("px, ") + "px)";
                    this.domElement.style.msScrollSnapPointsX = snaps
                }
        }), ImmersiveFrame: MS.Entertainment.UI.Framework.defineUserControl("/Controls/ImmersiveLayout.html#Frame", function ImmersiveFrame_Constructor() {
                this._contentReadyHandler = this._contentReadyHandler.bind(this);
                this._viewMoreClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._viewMoreClicked, this);
                this.frame.showViewMore = this._viewMoreClicked;
                this.frame.hideFrame = this.hideFrame.bind(this)
            }, {
                _frameBindings: null, _viewMoreButton: null, _content: null, _contentControl: null, _viewMoreOpened: false, _overlayResult: null, _hideFrame: false, frame: null, ignoreChildrenInitialization: true, initialize: function initialize() {
                        MS.Entertainment.UI.assert(this._content, "Need a content element to place control content");
                        this.frame.getData().then(function(data) {
                            this._content.setAttribute("data-win-control", "MS.Entertainment.UI.Framework.UserControl");
                            this._contentControl = new this.frame.overviewConstructor(this._content, {dataContext: data})
                        }.bind(this), function failedToGetData(error) {
                            this._content.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.ImmersiveError");
                            this._contentControl = new MS.Entertainment.UI.Controls.ImmersiveError(this._content, {dataContext: error})
                        }.bind(this));
                        this._frameBindings = WinJS.Binding.bind(this.frame, {hideViewMoreIfEnoughSpace: this._hideViewMoreIfEnoughSpaceChanged.bind(this)});
                        if (this.frame.disableHeaderButton)
                            this._viewMoreHeaderButton.disabled = true;
                        if (this.frame.visibleSignal) {
                            WinJS.Utilities.addClass(this.domElement, "hideFromDisplay");
                            this.frame.visibleSignal.promise.done(function showFrame() {
                                this.frame.visible = !this._hideFrame;
                                WinJS.Utilities.removeClass(this.domElement, "hideFromDisplay");
                                this.frame.visibleSignal = null
                            }.bind(this))
                        }
                        else
                            this.frame.visible = true
                    }, unload: function unload() {
                        if (this._overlayResult && this._overlayResult.viewMore)
                            this._overlayResult.viewMore.hide();
                        if (this._frameBindings) {
                            this._frameBindings.cancel();
                            this._frameBindings = null
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, _hideViewMoreIfEnoughSpaceChanged: function _hideViewMoreIfEnoughSpaceChanged() {
                        this.viewMoreButtonVisible = !this.frame.hideViewMoreIfEnoughSpace;
                        this._viewMoreHeaderButton.disabled = this.frame.disableHeaderButton || !this.viewMoreButtonVisible;
                        if (this.viewMoreButtonVisible) {
                            this.viewMoreClickedHandler = this._viewMoreClicked;
                            this.domElement.removeEventListener("contentready", this._contentReadyHandler)
                        }
                        else
                            this.domElement.addEventListener("contentready", this._contentReadyHandler)
                    }, hideFrame: function hideFrameChanged(visible) {
                        this._hideFrame = !visible;
                        if (!this.frame.previousSignal)
                            this.frame.visible = visible;
                        if (this.domElement)
                            if (!visible)
                                WinJS.Utilities.addClass(this.domElement, "removeFromDisplay");
                            else
                                WinJS.Utilities.removeClass(this.domElement, "removeFromDisplay")
                    }, _viewMoreClicked: function _viewMoreClicked() {
                        if (this._viewMoreOpened)
                            return;
                        this._viewMoreOpened = true;
                        var telemetryParameters = {
                                title: this.frame.heading, automationId: MS.Entertainment.UI.AutomationIds.viewMoreImmersive
                            };
                        MS.Entertainment.Utilities.Telemetry.logCommandClicked(telemetryParameters);
                        WinJS.Binding.unwrap(this.parent).bringItemIntoView(this.frame, {
                            bringOnMinimally: true, animated: true
                        }).done(function viewMoreBroughtFrameIntoView() {
                            var framePosition = WinJS.Utilities.getPosition(this.domElement);
                            var frameIndex = -1;
                            if (this.frame.onShowMore)
                                this.frame.onShowMore();
                            if (this.parent && this.parent.dataSource)
                                frameIndex = this.parent.dataSource.indexOf(this.frame);
                            var result = MS.Entertainment.UI.Controls.ImmersiveViewMore.showPopOver({
                                    frame: this.frame, framePosition: framePosition, frameIndex: frameIndex
                                });
                            var events = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {
                                    windowresize: function viewMoreWindowResizeHandler() {
                                        WinJS.Binding.unwrap(this.parent).bringItemIntoView(this.frame, {
                                            bringOnMinimally: true, animated: false
                                        }).done(function viewMoreWindowResizeHandlerScrolledIntoView() {
                                            framePosition = WinJS.Utilities.getPosition(this.domElement);
                                            result.viewMore.framePosition = framePosition
                                        }.bind(this))
                                    }.bind(this), isSnappedChanged: function viewMoreIsSnappedChanged(e) {
                                            if (e.detail.newValue && result && result.viewMore)
                                                result.viewMore.hide()
                                        }
                                });
                            this._overlayResult = result;
                            result.completionPromise.done(function viewMorePopoverHiden() {
                                if (events)
                                    events.cancel();
                                if (this.frame.onHideMore)
                                    this.frame.onHideMore();
                                this._overlayResult = null;
                                this._viewMoreOpened = false
                            }.bind(this))
                        }.bind(this))
                    }, _contentReadyHandler: function _contentReadyHandler() {
                        if (this._content.clientHeight >= this._content.scrollHeight) {
                            this.viewMoreButtonVisible = false;
                            this.viewMoreClickedHandler = null;
                            this._viewMoreHeaderButton.disabled = true
                        }
                        else {
                            this.viewMoreButtonVisible = true;
                            this.viewMoreClickedHandler = this._viewMoreClicked;
                            this._viewMoreHeaderButton.disabled = false
                        }
                        if (this.frame.disableHeaderButton)
                            this._viewMoreHeaderButton.disabled = true
                    }
            }, {
                viewMoreButtonVisible: false, viewMoreClickedHandler: null
            }), ImmersiveTableOfContents: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ItemsControl", null, function ImmersiveTableOfContents_Constructor(element, options) {
                var parent = element.parentNode;
                while (parent) {
                    if (!parent.winControl) {
                        parent = parent.parentNode;
                        continue
                    }
                    if (parent.winControl instanceof MS.Entertainment.UI.Controls.ImmersiveLayout) {
                        this._immersiveLayoutControl = parent.winControl;
                        if (this._immersiveLayoutControl && this._immersiveLayoutControl.domElement)
                            this._heroHorizontalRule = this._immersiveLayoutControl.domElement.querySelector(".immersiveHeroContent .heroHorizonalRule");
                        break
                    }
                    parent = parent.parentNode
                }
                MS.Entertainment.UI.Controls.assert(this._immersiveLayoutControl, "Couldn't find immersive layout control. Make sure we're a child of it");
                this._immersiveLayoutControl.bind("dataSource", function() {
                    this.dataSource = this._immersiveLayoutControl.dataSource
                }.bind(this));
                this._updateNavigationHandler()
            }, {
                itemTemplate: "/Controls/ImmersiveLayout.html#TableOfContentsItem", _immersiveLayoutControl: null, _heroHorizontalRule: null, _jumpedToScrollPosition: 0, _scrollMovementPercentage: 1.1, applyItemTemplate: function applyItemTemplate(container, item) {
                        if (!item.heading) {
                            WinJS.Utilities.addClass(container, "removeFromDisplay");
                            return container
                        }
                        WinJS.Utilities.addClass(container, "immersiveTableOfContentsItemContainer");
                        container.addEventListener("click", function tocItemClicked() {
                            this._immersiveLayoutControl.bringItemIntoView(item, {
                                bringOnMinimally: false, animated: true
                            }).done(function() {
                                this._jumpedToScrollPosition = this._immersiveLayoutControl.domElement.scrollLeft;
                                MS.Entertainment.UI.Framework.focusFirstInSubTree(this._immersiveLayoutControl.getElementForItem(item))
                            }.bind(this))
                        }.bind(this));
                        return container
                    }, itemsChanged: function itemsChanged() {
                        if (!this._workingDataSource || this._workingDataSource.length < 3) {
                            WinJS.Utilities.addClass(this.domElement, "hideFromDisplay");
                            if (this._heroHorizontalRule)
                                WinJS.Utilities.addClass(this._heroHorizontalRule, "hideFromDisplay")
                        }
                        else {
                            if (WinJS.Utilities.hasClass(this.domElement, "hideFromDisplay"))
                                WinJS.Utilities.removeClass(this.domElement, "hideFromDisplay");
                            if (this._heroHorizontalRule && WinJS.Utilities.hasClass(this._heroHorizontalRule, "hideFromDisplay"))
                                WinJS.Utilities.removeClass(this._heroHorizontalRule, "hideFromDisplay")
                        }
                    }, _updateNavigationHandler: function _updateNavigationHandler() {
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var page = WinJS.Binding.unwrap(navigationService.currentPage);
                        var oldNavigateAway = page.onNavigateAway || function(){};
                        page.onNavigateAway = function() {
                            if (this._jumpedToScrollPosition) {
                                if (navigationService.navigationDirection === MS.Entertainment.Navigation.NavigationDirection.forward) {
                                    oldNavigateAway();
                                    return false
                                }
                                var layoutScrollPosition = 0;
                                if (this._immersiveLayoutControl && this._immersiveLayoutControl.domElement)
                                    layoutScrollPosition = this._immersiveLayoutControl.domElement.scrollLeft;
                                MS.Entertainment.UI.Controls.assert(this._scrollMovementPercentage > 0.0, "Need an actual percentage to calculate");
                                var leftLimit = this._jumpedToScrollPosition / this._scrollMovementPercentage;
                                var rightLimit = this._jumpedToScrollPosition * this._scrollMovementPercentage;
                                var movedMoreThanXPercent = !((layoutScrollPosition > leftLimit) && (layoutScrollPosition < rightLimit));
                                if (!movedMoreThanXPercent) {
                                    this._jumpedToScrollPosition = 0;
                                    this._immersiveLayoutControl.bringItemIntoView(this.dataSource.item(0), {
                                        bringOnMinimally: false, animated: true
                                    }).done(null);
                                    return true
                                }
                            }
                            page.onNavigateAway = oldNavigateAway;
                            oldNavigateAway();
                            return false
                        }.bind(this)
                    }
            }), ImmersiveViewMore: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.PopOver", "/Controls/ImmersiveLayout.html#ViewMorePopOver", function ImmersiveViewMore_Constructor(element, options) {
                options = options || {};
                this.closeAction = new CloseOverlayAction;
                this.closeAction.parameter = this;
                if (this.frame.columnStyle)
                    WinJS.Utilities.addClass(element, this.frame.columnStyle);
                if (options.frameIndex >= 0)
                    WinJS.Utilities.addClass(element, "immersiveViewMoreIndex" + options.frameIndex);
                switch (this.frame.columnSpan) {
                    case 1:
                        WinJS.Utilities.addClass(element, "immersiveViewMoreOneColumn");
                        break;
                    case 2:
                        WinJS.Utilities.addClass(element, "immersiveViewMoreTwoColumn");
                        break;
                    default:
                        if (!this.frame.columnStyle) {
                            WinJS.Utilities.addClass(element, "immersiveViewMoreOneColumn");
                            MS.Entertainment.UI.Controls.assert(false, "Unsupported columnspan. defaulting to 1")
                        }
                        break
                }
                this._calculateGridDefinition = this._calculateGridDefinition.bind(this);
                this.bind("framePosition", this._calculateGridDefinition)
            }, {
                closeAction: null, dontWaitForContent: true, autoSetFocus: false, initialize: function initialize() {
                        MS.Entertainment.UI.Controls.PopOver.prototype.initialize.call(this);
                        var navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        if (navigation.hasBackStack) {
                            WinJS.Utilities.removeClass(this.backButton, "homeIcon");
                            this.backButton.setAttribute("aria-label", String.load(String.id.IDS_ACC_BACK_BUTTON))
                        }
                        else {
                            WinJS.Utilities.addClass(this.backButton, "homeIcon");
                            this.backButton.setAttribute("aria-label", String.load(String.id.IDS_ACC_HOME_BUTTON))
                        }
                        if (this.frame.viewMoreColumnStyle)
                            WinJS.Utilities.addClass(this._contentLayoutContainer, this.frame.viewMoreColumnStyle)
                    }, backButtonClick: function backButtonClick() {
                        this.hide().done(function() {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            navigationService.navigateBack()
                        })
                    }, suppressBubblingClicks: function suppressBubblingClicks(e) {
                        e.stopPropagation()
                    }, showAnimation: function showAnimation(element) {
                        return WinJS.Promise.as()
                    }, _calculateGridDefinition: function _calculateGridDefinition() {
                        if (!this.framePosition)
                            return;
                        var back = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.backButton).domElement;
                        var position = WinJS.Utilities.getPosition(back);
                        var offset = this.framePosition.left - position.left - position.width;
                        if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft) {
                            var backEdge = MS.Entertainment.Utilities.getWindowWidth() - position.left;
                            var viewMoreEdge = MS.Entertainment.Utilities.getWindowWidth() - (this.framePosition.left + this.framePosition.width);
                            var adjustedEdge = viewMoreEdge - backEdge;
                            offset = adjustedEdge
                        }
                        this.gridDefinition = offset + "px 1fr"
                    }, handleTemplateLoaded: function handleTemplateLoaded() {
                        MS.Entertainment.UI.Framework.tryAndFocusElementInSubTreeWithTimer(this.overlayContent, 200).done(function focusCompleted() {
                            if (this._unloaded)
                                return;
                            MS.Entertainment.UI.Framework.focusFirstInSubTree(this.domElement)
                        }.bind(this))
                    }
            }, {
                gridDefinition: "", framePosition: null, headerVisible: true
            }, {
                showPopOver: function showPopOver(data) {
                    if (_currentViewMorePopOver)
                        return {completionPromise: WinJS.Promise.as()};
                    MS.Entertainment.UI.Controls.assert(data, "No data object supplied");
                    MS.Entertainment.UI.Controls.assert(data.frame, "No frame supplied");
                    MS.Entertainment.UI.Controls.assert(data.userControl || data.frame.viewMoreTemplate, "No user control supplied");
                    var userControlOptions = data.userControlOptions ? data.userControlOptions : {frame: data.frame};
                    var options = {
                            frame: data.frame, userControl: data.userControl || MS.Entertainment.UI.Controls.ImmersiveViewMore.TemplateRenderHelper, framePosition: data.framePosition, frameIndex: data.frameIndex, headerVisible: data.headerVisible !== undefined ? data.headerVisible : true, userControlOptions: userControlOptions, autoSetFocus: !!data.userControl
                        };
                    var viewMoreControl = new MS.Entertainment.UI.Controls.ImmersiveViewMore(document.createElement("div"), options);
                    _currentViewMorePopOver = viewMoreControl;
                    return {
                            viewMore: viewMoreControl, completionPromise: viewMoreControl.show().then(function() {
                                    _currentViewMorePopOver = null
                                })
                        }
                }, dismissCurrentPopOver: function dismissCurrentPopOver() {
                        if (!_currentViewMorePopOver)
                            return WinJS.Promise.wrap();
                        var currentViewMorePopover = _currentViewMorePopOver;
                        _currentViewMorePopOver = null;
                        return currentViewMorePopover.hide().then(function() {
                                currentViewMorePopover = null
                            })
                    }, TemplateRenderHelper: MS.Entertainment.UI.Framework.defineUserControl(null, function(element, options) {
                        this.viewMoreContentLoaded = this.frame.getData().then(function(data) {
                            MS.Entertainment.Utilities.loadHtmlPage(this.frame.viewMoreTemplate, element, data);
                            this.targetElement = element
                        }.bind(this))
                    }, {
                        ignoreChildrenInitialization: true, targetElement: null, viewMoreContentLoaded: null, initialize: function() {
                                this.viewMoreContentLoaded.then(function() {
                                    return WinJS.Promise.timeout()
                                }.bind(this)).done(function() {
                                    if (this.domElement) {
                                        var domEvent = document.createEvent("Event");
                                        domEvent.initEvent("PopOverTemplateLoaded", true, false);
                                        this.domElement.dispatchEvent(domEvent)
                                    }
                                }.bind(this))
                            }
                    })
            }), ImmersiveError: MS.Entertainment.UI.Framework.defineUserControl("/Controls/ImmersiveLayout.html#Error", function ImmersiveError_Constructor(element, options){}, {initialize: function initialize(){}})
    })
})()
