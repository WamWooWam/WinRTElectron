/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {
    Version: 'latest'
});
(function appexPlatformControlsSquareButtonInit() {
    "use strict";
    var STRINGS = {
        L2OPENED: "",
        CLICKTOOPENL2: ""
    };
    var NS = WinJS.Namespace.define("CommonJS", {
        SquareButton: WinJS.Class.define(function squareButton_ctor(element, options) {
            this.element = element || document.createElement("div");
            element = this.element;
            element.winControl = this;
            CommonJS.Utils.markDisposable(this.element);
            CommonJS.setAutomationId(element);
            WinJS.Utilities.addClass(element, "platformChannelButtonDiv win-focus-hide");
            var buttonElement = this.buttonElement = document.createElement("button");
            WinJS.Utilities.addClass(this.buttonElement, "platformChannelButton win-focus-hide");
            var toggleElement = this.toggleElement = document.createElement("button");
            WinJS.Utilities.addClass(this.toggleElement, "platformChannelToggle platformHidden win-focus-hide");
            element.setAttribute("tabIndex", -1);
            buttonElement.setAttribute("role", "link");
            toggleElement.setAttribute("role", "button");
            CommonJS.setAutomationId(buttonElement, element, "link");
            CommonJS.setAutomationId(toggleElement, element, "toggle");
            var blurHandler = this._blurHandler = this._onpointerblur.bind(this);
            var focusHandler = this._focusHandler = this._onpointerfocus.bind(this);
            var keyDownHandler = this._keyDownHandler = this._onKeyDown.bind(this);
            buttonElement.addEventListener("blur", blurHandler);
            buttonElement.addEventListener("focus", focusHandler);
            buttonElement.addEventListener("keydown", keyDownHandler);
            toggleElement.addEventListener("blur", blurHandler);
            toggleElement.addEventListener("focus", focusHandler);
            toggleElement.addEventListener("keydown", keyDownHandler);
            this._initButton();
            WinJS.UI.setOptions(this, options);
            this.setImage(CommonJS.SquareButton.ImageType.SINGLE);
            this._setAriaLabel(false);
            this.buttonElement.setAttribute("aria-label", this._title || this.channelId);
            element.appendChild(this.buttonElement);
            element.appendChild(this.toggleElement)
        }, {
            element: null,
            buttonElement: null,
            toggleElement: null,
            parentId: null,
            channelId: null,
            isSubChannel: false,
            buttonContainerType: null,
            images: null,
            pressedIcon: null,
            _title: null,
            _label: null,
            _icon: null,
            _iconDiv: null,
            _buttonDiv: null,
            _active: false,
            _expanded: false,
            _hasSubChannels: false,
            _blurHandler: null,
            _focusHandler: null,
            _keyDownHandler: null,
            _toggleButtonColor: null,
            _iconRest: null,
            _doubleWide: null,
            _onClick: null,
            _onkeyDown: null,
            _visible: null,
            _onKeyDown: function _onKeyDown(event) {
                if (event.keyCode === WinJS.Utilities.Key.downArrow && this.expanded) {
                    event.stopPropagation();
                    event.preventDefault();
                    var subChannelsDiv = document.querySelector(".platformChannelBar.subChannels .platformChannelBarButtonGroup.show");
                    if (subChannelsDiv && subChannelsDiv.childNodes.length > 0) {
                        var navigationBar = document.querySelector(".platformNavigationBar");
                        if (navigationBar) {
                            WinJS.Utilities.addClass(navigationBar, "tab")
                        }
                        var firstButton = subChannelsDiv.firstChild;
                        if (firstButton && firstButton.childNodes.length > 0) {
                            firstButton.firstChild.focus()
                        }
                    }
                } else if (event.keyCode === WinJS.Utilities.Key.upArrow && this.isSubChannel) {
                    event.stopPropagation();
                    event.preventDefault();
                    var parentButton = document.getElementById(this.parentId);
                    if (parentButton && parentButton.childNodes.length > 0) {
                        parentButton.lastChild.focus()
                    }
                }
            },
            _onpointerblur: function _onpointerblur(event) {
                WinJS.Utilities.removeClass(this.element, "focus")
            },
            _onpointerfocus: function _onpointerfocus(event) {
                WinJS.Utilities.addClass(this.element, "focus")
            },
            _invokeButton: function _invokeButton(event, handler) {
                if (handler) {
                    handler(event)
                }
            },
            _initButton: function _initButton() {
                var buttonHolder = this._buttonDiv = document.createElement("div");
                buttonHolder.setAttribute("aria-hidden", "true");
                WinJS.Utilities.addClass(buttonHolder, "platformEdgyIconHolder");
                var iconDiv = this._iconDiv = document.createElement("div");
                WinJS.Utilities.addClass(iconDiv, "platformEdgyIconDiv");
                var icon = this._icon = document.createElement("div");
                WinJS.Utilities.addClass(icon, "platformEdgyIcon ");
                iconDiv.appendChild(icon);
                buttonHolder.appendChild(iconDiv);
                var labelDiv = document.createElement("div");
                WinJS.Utilities.addClass(labelDiv, "platformEdgyLabelDiv");
                var label = this._label = document.createElement("div");
                WinJS.Utilities.addClass(label, "platformEdgyLabel");
                labelDiv.appendChild(label);
                buttonHolder.appendChild(labelDiv);
                this.buttonElement.appendChild(buttonHolder)
            },
            _setImage: function _setImage(imageUrl) {
                if (imageUrl) {
                    var buttonElement = this.buttonElement;
                    var element = this.element;
                    WinJS.Utilities.addClass(element, "platformSquareButtonImage");
                    if (this.hasSubChannels) {
                        WinJS.Utilities.addClass(buttonElement, "platformSquareButtonImage image fitMiddle")
                    } else {
                        WinJS.Utilities.addClass(buttonElement, "platformSquareButtonImage image fitHeight")
                    }
                    buttonElement.innerHTML = "";
                    var imageCard = new CommonJS.ImageCard(buttonElement,{
                        imageSource: {
                            url: imageUrl,
                            cacheId: "PlatformTopEdgyImageCache"
                        },
                        alternateText: this._title || this.channelId
                    })
                }
            },
            _setAriaLabel: function _setAriaLabel(subChannelsShown) {
                if (!STRINGS.L2OPENED) {
                    STRINGS.L2OPENED = CommonJS.resourceLoader.getString("/Platform/L2Opened") || ""
                }
                if (!STRINGS.CLICKTOOPENL2) {
                    STRINGS.CLICKTOOPENL2 = CommonJS.resourceLoader.getString("/Platform/ClickToOpenL2") || ""
                }
                var element = this.toggleElement;
                var ariaLabel = this.title || "";
                if (subChannelsShown) {
                    element.setAttribute("aria-label", ariaLabel.concat(" ", STRINGS.L2OPENED))
                } else {
                    if (this.hasSubChannels) {
                        ariaLabel = ariaLabel.concat(" ", STRINGS.CLICKTOOPENL2)
                    }
                    element.setAttribute("aria-label", ariaLabel)
                }
            },
            _setIcon: function _setIcon(value) {
                var icon = this._icon;
                icon.textContent = "";
                if (value) {
                    if (value.substring(0, 4) === "url(") {
                        WinJS.Utilities.addClass(icon, "platformSquareButtonImage");
                        icon.style.backgroundImage = value
                    } else {
                        WinJS.Utilities.addClass(icon, value)
                    }
                } else {
                    WinJS.Utilities.addClass(this._iconDiv, "platformHidden")
                }
            },
            disabled: {
                set: function set(value) {
                    var element = this.element;
                    if (value) {
                        WinJS.Utilities.addClass(element, "disabled")
                    } else {
                        WinJS.Utilities.removeClass(element, "disabled")
                    }
                },
                get: function get() {
                    var element = this.element;
                    return WinJS.Utilities.hasClass(element, "disabled")
                }
            },
            isSelected: {
                get: function get() {
                    return this.active || this.disabled
                }
            },
            active: {
                set: function set(isButtonActive) {
                    var element = this.element;
                    this._active = isButtonActive;
                    if (isButtonActive) {
                        WinJS.Utilities.addClass(element, "currentActive")
                    } else {
                        WinJS.Utilities.removeClass(element, "currentActive")
                    }
                },
                get: function get() {
                    return this._active
                }
            },
            hasSubChannels: {
                get: function get() {
                    return this._hasSubChannels
                },
                set: function set(v) {
                    this._hasSubChannels = v;
                    if (v) {
                        this.element.setAttribute("aria-owns", "platformChannelBarButtonGroup_" + this.channelId);
                        WinJS.Utilities.removeClass(this.toggleElement, "platformHidden")
                    }
                }
            },
            toggleButtonColor: {
                get: function get() {
                    return this._toggleButtonColor
                },
                set: function set(v) {
                    this._toggleButtonColor = v;
                    if (v) {
                        this.toggleElement.style.backgroundColor = v;
                        var buttonElement = this.buttonElement;
                        if (buttonElement) {
                            buttonElement.style.backgroundColor = v
                        }
                    }
                }
            },
            canExpand: {
                get: function get() {
                    var buttonContainerType = CommonJS.NavigationBar.ButtonContainerType;
                    return (this.buttonContainerType === buttonContainerType.MAIN || this.buttonContainerType === buttonContainerType.HOIST)
                }
            },
            expanded: {
                get: function get() {
                    return this._expanded
                },
                set: function set(expand) {
                    this._expanded = expand;
                    var element = this.element;
                    if (expand) {
                        WinJS.Utilities.addClass(element, "expanded")
                    } else {
                        WinJS.Utilities.removeClass(element, "expanded")
                    }
                    this._setAriaLabel(expand)
                }
            },
            platformHidden: {
                get: function get() {
                    return WinJS.Utilities.hasClass(this.element, "platformHidden")
                },
                set: function set(v) {
                    if (v) {
                        WinJS.Utilities.addClass(this.element, "platformHidden")
                    } else {
                        WinJS.Utilities.removeClass(this.element, "platformHidden")
                    }
                }
            },
            visible: {
                get: function get() {
                    if (this._visible === null) {
                        this._visible = true
                    }
                    return this._visible
                },
                set: function set(value) {
                    this._visible = value;
                    this.platformHidden = !value
                }
            },
            restoreVisible: function restoreVisible() {
                this.platformHidden = !this.visible
            },
            showIcon: {
                get: function get() {
                    return WinJS.Utilities.hasClass(this.element, "platformShowIcon")
                },
                set: function set(v) {
                    if (v) {
                        WinJS.Utilities.addClass(this.element, "platformShowIcon")
                    } else {
                        WinJS.Utilities.removeClass(this.element, "platformShowIcon")
                    }
                }
            },
            icon: {
                set: function set(value) {
                    this._setIcon(value);
                    this._iconRest = value
                },
                get: function get() {
                    return this._iconRest
                }
            },
            doubleWide: {
                set: function set(v) {
                    this._doubleWide = v;
                    var element = this.element;
                    if (v) {
                        WinJS.Utilities.addClass(element, "doubleWide")
                    } else {
                        WinJS.Utilities.removeClass(element, "doubleWide")
                    }
                },
                get: function get() {
                    return this._doubleWide
                }
            },
            title: {
                get: function get() {
                    return this._title
                },
                set: function set(value) {
                    if (value) {
                        this._title = value;
                        this._label.textContent = value
                    }
                }
            },
            setImage: function setImage(type) {
                if (this.images) {
                    var imageUrl;
                    switch (type) {
                    case CommonJS.SquareButton.ImageType.SNAP:
                        imageUrl = this.images.snap;
                        break;
                    case CommonJS.SquareButton.ImageType.HOIST:
                        imageUrl = this.images.hoist;
                        break;
                    case CommonJS.SquareButton.ImageType.DOUBLE:
                        imageUrl = this.images.double;
                        break;
                    default:
                        imageUrl = this.images.single;
                        break
                    }
                    this._setImage(imageUrl)
                }
            },
            onclick: {
                set: function set(value) {
                    var that = this;
                    var element = this.element;
                    if (this._onClick) {
                        element.removeEventListener("click", this._onClick, false);
                        this._onClick = null
                    }
                    var onclick = this._onClick = function squareButton_onClick(event) {
                        that._invokeButton(event, value)
                    }
                    ;
                    element.addEventListener("click", onclick, false)
                }
            },
            dispose: function dispose() {
                var element = this.element;
                var buttonElement = this.buttonElement;
                var toggleElement = this.toggleElement;
                buttonElement.removeEventListener("blur", this._blurHandler);
                buttonElement.removeEventListener("focus", this._focusHandler);
                buttonElement.removeEventListener("keydown", this._keyDownHandler);
                toggleElement.removeEventListener("blur", this._blurHandler);
                toggleElement.removeEventListener("focus", this._focusHandler);
                toggleElement.removeEventListener("keydown", this._keyDownHandler);
                element.removeEventListener("click", this._onClick);
                element.winControl = null;
                this.element = null;
                this._blurHandler = null;
                this._focusHandler = null;
                this._keyDownHandler = null;
                this._onClick = null
            }
        }, {
            ImageType: {
                SINGLE: 0,
                DOUBLE: 2,
                SNAP: 3,
                HOIST: 4
            }
        })
    })
}
)();
(function appexPlatformControlsSquareButtonContainerInit() {
    "use strict";
    var NS = WinJS.Namespace.define("CommonJS", {
        SquareButtonContainer: WinJS.Class.define(function squareButtonContainer_ctor(element, options) {
            this.element = element || document.createElement("div");
            this.element.winControl = this;
            CommonJS.Utils.markDisposable(this.element);
            this.channelIdToSubGroupMap = {};
            this._map = {};
            this._channelButtonGroups = {};
            this._pageCountArray = {};
            WinJS.Utilities.addClass(this.element, "platformChannelBar");
            if (options && options.id) {
                CommonJS.setAutomationId(this.element, null, null, "platformChannelBar_" + options.id)
            } else {
                CommonJS.setAutomationId(this.element)
            }
            this.element.winControl = this;
            WinJS.UI.setOptions(this, options);
            this._init()
        }, {
            _scrollAnimation: WinJS.Promise.wrap(null),
            _buttons: null,
            _maxWidth: 0,
            _maxHeight: 0,
            _scrollLeft: 0,
            _scrollTop: 0,
            _pageWidth: 0,
            _pageHeight: 0,
            _itemPerRow: null,
            _columnNum: null,
            _fullWidth: true,
            _map: null,
            _total: 0,
            _channelButtonGroups: null,
            _pageCountArray: null,
            _titleContainer: null,
            _pageContainer: null,
            _leftArrowContainer: null,
            _rightArrowContainer: null,
            _currentGroup: null,
            _inAutoScroll: false,
            element: null,
            wideScrollMode: true,
            title: null,
            activeGroupId: null,
            peak: null,
            pageControl: null,
            isEmpty: false,
            titleResource: null,
            buttonContainer: null,
            channelIdToSubGroupMap: null,
            active: {
                get: function get() {
                    var button = this.element.querySelector(".platformChannelButtonDiv.currentActive");
                    return button ? button.winControl : null
                }
            },
            fullWidth: {
                set: function set(v) {
                    this._fullWidth = v;
                    if (!v) {
                        WinJS.Utilities.addClass(this.element, "showLV")
                    } else {
                        WinJS.Utilities.removeClass(this.element, "showLV")
                    }
                },
                get: function get() {
                    return this._fullWidth
                }
            },
            channelBarActive: {
                set: function set(v) {
                    if (v) {
                        WinJS.Utilities.addClass(this.element, "channelBarActive")
                    } else {
                        WinJS.Utilities.removeClass(this.element, "channelBarActive")
                    }
                },
                get: function get() {
                    return WinJS.Utilities.hasClass(this.element, "channelBarActive")
                }
            },
            platformHidden: {
                get: function get() {
                    return WinJS.Utilities.hasClass(this.element, "platformHidden")
                },
                set: function set(v) {
                    if (v) {
                        WinJS.Utilities.addClass(this.element, "platformHidden")
                    } else {
                        WinJS.Utilities.removeClass(this.element, "platformHidden")
                    }
                }
            },
            disabled: {
                get: function get() {
                    var button = this.element.querySelector(".platformChannelButtonDiv.disabled");
                    return button ? button.winControl : null
                }
            },
            updateTitleText: function updateTitleText() {
                if (this.titleResource) {
                    var titleButton = this.element.querySelector("button.platformChannelBarTitleButton");
                    var titleLabel = this.element.querySelector(".platformChannelBarTitleLabel");
                    var titleText = PlatformJS.Services.resourceLoader.getString(this.titleResource);
                    if (titleText) {
                        titleButton.innerText = titleText;
                        titleLabel.innerText = titleText
                    }
                }
            },
            commands: {
                set: function set(value) {
                    msWriteProfilerMark("Platform:ButtonContainer:commands:s");
                    this._buttons = value;
                    this._channelButtonGroups = {};
                    this._pageCountArray = {};
                    var groupContainer = this.buttonContainer;
                    this.clearButtons();
                    this._buildChannelIdToDataMap(value);
                    groupContainer.innerHTML = "";
                    if (this._buttons.length > 0 && this._buttons[0] && this._buttons[0].length > 0) {
                        this.selectGroup(this._buttons[0][0].parentId, true);
                        this.isEmpty = false
                    }
                    msWriteProfilerMark("Platform:ButtonContainer:commands:e")
                }
            },
            clearChannelBar: function clearChannelBar() {
                this.platformHidden = true;
                this._buttons = null;
                this._total = 0;
                this.isEmpty = true;
                this.pageControl = null;
                this._channelButtonGroups = {};
                this._pageCountArray = {};
                this.buttonContainer.innerHTML = "";
                this._pageContainer.innerHTML = "";
                this._leftArrowContainer.innerHTML = "";
                this._rightArrowContainer.innerHTML = ""
            },
            containerOf: function containerOf(channelId) {
                return channelId ? this._map[channelId] : null
            },
            clearButtons: function clearButtons() {
                this._scrollAnimation.cancel();
                var buttons = this.buttonContainer.querySelectorAll(".platformChannelButtonDiv");
                var length = buttons.length;
                var button = null;
                for (var i = 0; i < length; i++) {
                    button = buttons[i].winControl;
                    button.dispose()
                }
            },
            dispose: function dispose() {
                this.clearButtons()
            },
            selectGroup: function selectGroup(channelId, force) {
                var layoutStale = false;
                var current = null;
                if (this._currentGroup) {
                    if (channelId !== this.activeGroupId) {
                        WinJS.Utilities.removeClass(this._currentGroup, "show");
                        this.activeGroupId = null
                    } else {
                        current = this._currentGroup
                    }
                }
                if (force) {
                    current = this._renderOnDemand(channelId)
                } else if (!current) {
                    current = this._channelButtonGroups[channelId];
                    if (!current) {
                        current = this._renderOnDemand(channelId)
                    } else {
                        layoutStale = true
                    }
                }
                if (current) {
                    this._currentGroup = current;
                    WinJS.Utilities.addClass(current, "show");
                    this.activeGroupId = channelId
                }
                if (layoutStale) {
                    this._layoutStandard(channelId)
                }
            },
            updatePaging: function updatePaging() {
                if (this.pageControl) {
                    var pageNo = this.pageControl.pageNo;
                    this._scrollTo(pageNo)
                }
            },
            getFirstVisibleButton: function getFirstVisibleButton() {
                var firstVisibleIndex = 0;
                var button = null;
                if (this.pageControl && this._itemPerRow) {
                    var pageNo = this.pageControl.pageNo;
                    firstVisibleIndex = (pageNo - 1) * this._itemPerRow
                }
                var buttons = this.buttonContainer.querySelectorAll(".platformChannelButton");
                var length = buttons.length;
                if (length && length > firstVisibleIndex) {
                    button = buttons[firstVisibleIndex]
                }
                return button
            },
            updateContainerLayout: function updateContainerLayout() {
                var groupId = this.activeGroupId;
                this.selectGroup(groupId);
                this._layoutStandard(groupId)
            },
            updateVisibility: function updateVisibility(channelIdToHoist) {
                if (this._total === 0) {
                    this.platformHidden = true;
                    this.isEmpty = true;
                    return
                }
                this.platformHidden = false;
                selector = ".platformChannelButtonDiv.platformHidden";
                button = this.element.querySelector(selector);
                buttonControl = button ? button.winControl : null;
                if (buttonControl) {
                    buttonControl.restoreVisible();
                    this.isEmpty = false
                }
                var buttonMap = this.containerOf(channelIdToHoist);
                var selector, button, buttonControl;
                if (buttonMap) {
                    selector = '.platformChannelButtonDiv[id="' + CommonJS.sanitizeId(channelIdToHoist) + '"]';
                    button = this.element.querySelector(selector);
                    buttonControl = button ? button.winControl : null;
                    if (buttonControl) {
                        buttonControl.platformHidden = true;
                        if (buttonMap.count === 1) {
                            this.isEmpty = true;
                            this.platformHidden = true
                        } else {
                            this.platformHidden = false;
                            this.isEmpty = false;
                            this._updatePageBar(this.activeGroupId, Math.ceil((buttonMap.count - 1) / this._itemPerRow))
                        }
                    }
                } else {
                    this._updatePageBar(this.activeGroupId, Math.ceil(this._total / this._itemPerRow))
                }
            },
            _init: function _init() {
                var title = this._titleContainer = document.createElement("div");
                WinJS.Utilities.addClass(title, "platformChannelBarTitle win-focus-hide");
                title.setAttribute("tabIndex", -1);
                var label = document.createElement("div");
                WinJS.Utilities.addClass(label, "platformChannelBarTitleLabel win-focus-hide");
                title.appendChild(label);
                var titleButton = document.createElement("button");
                WinJS.Utilities.addClass(titleButton, "platformChannelBarTitleButton win-focus-hide");
                title.appendChild(titleButton);
                titleButton.addEventListener("click", this._onClickHeader.bind(this));
                titleButton.setAttribute("tabIndex", 0);
                if (this.title) {
                    label.innerText = this.title;
                    titleButton.innerText = this.title
                }
                var peak = document.createElement("div");
                WinJS.Utilities.addClass(peak, "platformChannelBarPeak");
                this.peak = peak;
                var paging = this._pageContainer = document.createElement("div");
                WinJS.Utilities.addClass(paging, "platformChannelBarPaging");
                var left = this._leftArrowContainer = document.createElement("div");
                WinJS.Utilities.addClass(left, "platformChannelBarArrowContainer platformChannelBarLeft");
                var right = this._rightArrowContainer = document.createElement("div");
                WinJS.Utilities.addClass(right, "platformChannelBarArrowContainer platformChannelBarRight");
                this._updatePagingArrow(1);
                var buttonGroupContainer = this.buttonContainer = document.createElement("div");
                WinJS.Utilities.addClass(buttonGroupContainer, "platformChannelGroups");
                this.element.appendChild(title);
                this.element.appendChild(peak);
                this.element.appendChild(paging);
                this.element.appendChild(left);
                this.element.appendChild(right);
                this.element.appendChild(buttonGroupContainer);
                buttonGroupContainer.addEventListener("scroll", this._onScroll.bind(this))
            },
            _buildChannelIdToDataMap: function _buildChannelIdToDataMap(value) {
                var total = 0
                  , map = {}
                  , button = null
                  , buttonGroup = null
                  , groupIndex = 0
                  , channelIndex = 0
                  , channelCount = 0
                  , groupCount = this._buttons ? this._buttons.length : 0;
                for (groupIndex = 0; groupIndex < groupCount; groupIndex++) {
                    buttonGroup = this._buttons[groupIndex];
                    channelCount = buttonGroup ? buttonGroup.length : 0;
                    for (channelIndex = 0; channelIndex < channelCount; channelIndex++) {
                        button = buttonGroup[channelIndex];
                        if (button) {
                            total++;
                            map[button.channelId] = {
                                button: button,
                                count: channelCount
                            }
                        }
                    }
                }
                this._total = total;
                this._map = map
            },
            _renderOnDemand: function _renderOnDemand(groupId) {
                var buttons = groupId ? this.channelIdToSubGroupMap[groupId] : null;
                buttons = buttons || this._buttons[0];
                var buttonGroupContainer = this._renderButtonGroup(buttons);
                if (buttonGroupContainer) {
                    var groupContainer = this.buttonContainer;
                    groupContainer.appendChild(buttonGroupContainer)
                }
                var mainButton = buttonGroupContainer.querySelector('[id=\"' + groupId + '\"]');
                var location = WinJS.Navigation.location;
                var channelId = location.channelId;
                if (mainButton && groupId === channelId) {
                    mainButton.winControl.disabled = true
                }
                return buttonGroupContainer
            },
            _renderPageBar: function _renderPageBar(groupId) {
                this._pageContainer.innerHTML = "";
                this._leftArrowContainer.innerHTML = "";
                this._rightArrowContainer.innerHTML = "";
                var buttonContainer = this.buttonContainer;
                var pageCount = groupId ? this._pageCountArray[groupId] : 1;
                var pageNo = this.pageControl ? this.pageControl.pageNo : 1;
                if (pageCount && pageCount > 1) {
                    if (this._activeChannel && this._activeChannel.index) {
                        pageNo = Math.ceil(this._activeChannel.index / this._itemPerRow)
                    }
                    this.pageControl = new CommonJS.PagingBar(null,{
                        pageCount: pageCount,
                        pageNo: pageNo,
                        pageWidth: this._pageWidthForPagination
                    });
                    this._pageContainer.appendChild(this.pageControl.element);
                    var left = this._leftArrowContainer;
                    var leftButton = document.createElement("button");
                    left.appendChild(leftButton);
                    CommonJS.setAutomationId(leftButton, left.parentElement, "left");
                    leftButton.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/platform/scrollLeftAriaLabel"));
                    leftButton.addEventListener("click", this._onClickLeft.bind(this));
                    var right = this._rightArrowContainer;
                    var rightButton = document.createElement("button");
                    right.appendChild(rightButton);
                    CommonJS.setAutomationId(rightButton, right.parentElement, "right");
                    rightButton.addEventListener("click", this._onClickRight.bind(this));
                    rightButton.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("/platform/scrollRightAriaLabel"));
                    this._updatePagingArrow(this.pageControl.pageNo);
                    this._goto(this.pageControl.pageNo, false)
                } else {
                    this.pageControl = null
                }
                if (pageCount && pageCount > 1) {
                    buttonContainer.style.overflowX = "auto";
                    buttonContainer.style.overflowY = "hidden"
                } else {
                    buttonContainer.style.overflowX = "hidden";
                    buttonContainer.style.overflowY = "hidden"
                }
            },
            _onScroll: function _onScroll(evt) {
                if (!this.pageControl) {
                    return
                }
                if (this._inAutoScroll) {
                    return
                }
                var newPage;
                var scrollLeft = this.buttonContainer.scrollLeft;
                var deltaHoriz = scrollLeft - this._scrollLeft;
                var currentPage = this.pageControl.pageNo;
                if (deltaHoriz !== 0) {
                    this._scrollLeft = scrollLeft;
                    newPage = Math.ceil(this._scrollLeft / this._pageWidth) + 1;
                    if (newPage !== this.pageControl.pageNo) {
                        this._goto(newPage, true)
                    } else {
                        var subChannelsDiv = document.querySelector(".platformChannelBar.subChannels");
                        if (subChannelsDiv && !WinJS.Utilities.hasClass(subChannelsDiv, "platformHidden")) {
                            this._updateSubChannels(subChannelsDiv)
                        }
                    }
                }
            },
            _updateSubChannels: function _updateSubChannels(subChannelsDiv) {
                var subChannels = subChannelsDiv.winControl;
                var isViewing = false;
                var viewingDiv = document.querySelector(".platformChannelBar.viewing");
                if (viewingDiv && !WinJS.Utilities.hasClass(viewingDiv, "platformHidden")) {
                    var viewing = viewingDiv.winControl;
                    if (viewing.activeGroupId === subChannels.activeGroupId) {
                        isViewing = true
                    }
                }
                if (!isViewing) {
                    var buttonMAIN = document.getElementById(subChannels.activeGroupId);
                    if (buttonMAIN) {
                        var buttonControl = buttonMAIN.winControl;
                        if (subChannelsDiv.parentNode && subChannelsDiv.parentNode.winControl.positionPeak) {
                            subChannelsDiv.parentNode.winControl.positionPeak(buttonControl)
                        }
                    }
                }
            },
            _scrollTo: function _scrollTo(pageNo) {
                var that = this;
                if (this._inAutoScroll) {
                    return
                }
                pageNo = Math.max(1, pageNo);
                this._scrollLeft = (pageNo - 1) * (this._pageWidth);
                this._inAutoScroll = true;
                var toValue = this._scrollLeft;
                this._scrollAnimation = PlatformJS.Utilities.Transitions.applyTransitions(this.buttonContainer, {
                    property: "scrollLeft",
                    duration: 120,
                    to: this._scrollLeft
                });
                this._scrollAnimation.done(function scroll_finished(e) {
                    that._inAutoScroll = false;
                    var subChannelsDiv = document.querySelector(".platformChannelBar.subChannels");
                    if (subChannelsDiv && !WinJS.Utilities.hasClass(subChannelsDiv, "platformHidden")) {
                        that._updateSubChannels(subChannelsDiv, true)
                    }
                }, function error_handler(e) {
                    that._inAutoScroll = false
                })
            },
            _goto: function _goto(newPage, autoPosition) {
                this.pageControl.goto(newPage);
                var newPageNo = this.pageControl.pageNo;
                if (!autoPosition) {
                    this._scrollTo(newPageNo)
                }
                this._updatePagingArrow(newPageNo)
            },
            _updatePagingArrow: function _updatePagingArrow(newPageNo) {
                if (newPageNo === 1) {
                    WinJS.Utilities.addClass(this._leftArrowContainer, "platformInvisible")
                } else {
                    WinJS.Utilities.removeClass(this._leftArrowContainer, "platformInvisible")
                }
                var pageCount = this.pageControl ? this.pageControl.pageCount : 1;
                if (newPageNo === pageCount) {
                    WinJS.Utilities.addClass(this._rightArrowContainer, "platformInvisible")
                } else {
                    WinJS.Utilities.removeClass(this._rightArrowContainer, "platformInvisible")
                }
            },
            _onClickLeft: function _onClickLeft(evt) {
                var newPage = this.pageControl.pageNo;
                this._goto(newPage - 1)
            },
            _onClickRight: function _onClickRight(evt) {
                var newPage = this.pageControl.pageNo;
                this._goto(newPage + 1)
            },
            _onClickHeader: function _onClickHeader(evt) {
                var navBar = this.element.parentNode;
                if (navBar) {
                    navBar.winControl.clearChannelBarState();
                    this.channelBarActive = true
                }
            },
            _returnContainerId: function _returnContainerId(containerType) {
                var containerId = null;
                var bcTypes = CommonJS.NavigationBar.ButtonContainerType;
                switch (containerType) {
                case bcTypes.MAIN:
                    containerId = "L1";
                    break;
                case bcTypes.FEATURED:
                    containerId = "LF";
                    break;
                case bcTypes.HOIST:
                    containerId = "LV";
                    break;
                case bcTypes.SUBCHANNEL:
                    break;
                default:
                    console.log("wrong button container type");
                    break
                }
                return containerId
            },
            _renderButtonGroup: function _renderButtonGroup(buttons) {
                var i = 0
                  , button = null
                  , buttonData = null;
                var length = buttons.length;
                if (length === 0) {
                    return null
                }
                var element = this.element;
                buttonData = buttons[0];
                if (!buttonData) {
                    console.log("button contains invalid data");
                    return null
                }
                var container = document.createElement("div");
                var containerId = buttonData.parentId;
                WinJS.Utilities.addClass(container, "platformChannelBarButtonGroup");
                if (buttonData.buttonContainerType === CommonJS.NavigationBar.ButtonContainerType.SUBCHANNEL) {
                    container.setAttribute("parentId", containerId)
                } else {
                    container.setAttribute("aria-controls", containerId);
                    var containerIdNotParentId = this._returnContainerId(buttonData.buttonContainerType);
                    if (!containerIdNotParentId) {
                        console.log("wrong button container type");
                        return null
                    } else {
                        containerId = containerIdNotParentId
                    }
                }
                container.id = "platformChannelBarButtonGroup_" + containerId;
                this._channelButtonGroups[containerId] = container;
                for (i = 0; i < length; i++) {
                    buttonData = buttons[i];
                    if (!buttonData) {
                        continue
                    }
                    button = new CommonJS.SquareButton(CommonJS.createElement("div", element, "button" + i, buttonData.channelId),buttonData);
                    container.appendChild(button.element)
                }
                this._layoutStandard(containerId);
                return container
            },
            MAXBUTTONGAP: 15,
            _calculateButtonWidthAndGap: function _calculateButtonWidthAndGap() {
                var pageWidth = WinJS.Utilities.getTotalWidth(document.getElementById("platformPageArea")) - 40;
                var buttonWidth = 158;
                var itemPerRow = Math.floor(pageWidth / buttonWidth);
                var gap = Math.floor((pageWidth - (itemPerRow * buttonWidth)) / (itemPerRow - 1));
                if (gap < 6) {
                    itemPerRow -= 1;
                    gap = Math.floor((pageWidth - (itemPerRow * buttonWidth)) / (itemPerRow - 1))
                }
                if (gap > this.MAXBUTTONGAP) {
                    buttonWidth = buttonWidth + Math.floor((gap - this.MAXBUTTONGAP) * (itemPerRow - 1) / (itemPerRow));
                    gap = this.MAXBUTTONGAP
                }
                if (!this.fullWidth) {
                    itemPerRow -= 1
                }
                this._itemPerRow = itemPerRow;
                return {
                    buttonWidth: buttonWidth,
                    gap: gap,
                    itemPerRow: itemPerRow
                }
            },
            _layoutStandard: function _layoutStandard(containerId) {
                var i, element = this.element;
                containerId = (!this.isEmpty && this._returnContainerId(this._buttons[0][0].buttonContainerType)) || containerId;
                var container = this._channelButtonGroups[containerId];
                if (!container) {
                    return
                }
                var dims = this._calculateButtonWidthAndGap();
                var gap = dims.gap;
                var buttonWidth = dims.buttonWidth;
                var itemPerRow = dims.itemPerRow;
                var maxWidth = WinJS.Utilities.getTotalWidth(document.getElementById("platformPageArea")) - 40;
                var pageWidth = this._pageWidth = this._maxWidth = maxWidth;
                pageWidth = this._pageWidth = (buttonWidth + gap) * itemPerRow;
                this._pageWidthForPagination = pageWidth - gap;
                var columnNum = 1;
                var buttons = container.querySelectorAll(".platformChannelButtonDiv:not(.platformHidden)");
                var length = buttons.length;
                var totalSingleButtonSpace = length;
                var button = null;
                for (i = 0; i < length; i++) {
                    button = buttons[i].winControl;
                    button.element.style.msGridColumn = columnNum++;
                    button.element.style.width = buttonWidth + "px";
                    var rtl = (document.dir === "rtl");
                    if (!rtl) {
                        button.element.style.marginRight = (gap + "px");
                        button.element.style.marginLeft = ("0px")
                    } else {
                        button.element.style.marginLeft = (gap + "px");
                        button.element.style.marginRight = ("0px")
                    }
                    if (button.doubleWide && columnNum % itemPerRow !== 0) {
                        button.setImage(CommonJS.SquareButton.ImageType.DOUBLE);
                        button.element.style.width = buttonWidth * 2 + gap + "px";
                        totalSingleButtonSpace += 1
                    }
                    var buttonType = CommonJS.NavigationBar.ButtonContainerType;
                    if (button.buttonContainerType === buttonType.HOIST) {
                        button.setImage(CommonJS.SquareButton.ImageType.HOIST)
                    }
                }
                var pageCount = Math.ceil(totalSingleButtonSpace / itemPerRow);
                container.setAttribute("pageCount", pageCount);
                this._pageCountArray[containerId] = pageCount;
                this._columnNum = columnNum - 1;
                var msGridColumns = "(auto)[" + this._columnNum + "]";
                if (this.wideScrollMode) {
                    container.style.width = pageCount * pageWidth + "px";
                    this.buttonContainer.style.msScrollSnapPointsX = "snapInterval(0px," + pageWidth + "px)";
                    var placeHolderDiv = container.querySelector(".platformChannelSpaceHolder") || document.createElement("div");
                    WinJS.Utilities.addClass(placeHolderDiv, "platformChannelSpaceHolder");
                    msGridColumns += "1fr"
                }
                container.style.msGridRows = "1fr";
                container.style.msGridColumns = msGridColumns;
                this.buttonContainer.scrollLeft = 0;
                this._scrollLeft = this.buttonContainer.scrollLeft;
                this._renderPageBar(containerId)
            },
            _updatePageBar: function _updatePageBar(groupId, pageCount) {
                if (!this.pageControl || pageCount === this.pageControl.pageCount) {
                    return
                }
                var pageNo = this.pageControl.pageNo;
                var newPageNo = pageNo > pageCount ? pageCount : pageNo;
                groupId = (!this.isEmpty && this._returnContainerId(this._buttons[0][0].buttonContainerType)) || groupId;
                if (pageCount && pageCount > 1) {
                    if (this._pageContainer.innerHTML !== "") {
                        this._pageContainer.innerHTML = "";
                        this.pageControl = new CommonJS.PagingBar(null,{
                            pageCount: pageCount,
                            pageWidth: this._pageWidthForPagination
                        });
                        this._pageContainer.appendChild(this.pageControl.element);
                        if (this._channelButtonGroups[groupId]) {
                            this._channelButtonGroups[groupId].style.width = pageCount * this._pageWidth + "px"
                        }
                        if (pageNo > pageCount) {
                            this._goto(newPageNo, false)
                        } else {
                            this.pageControl.goto(newPageNo)
                        }
                        this._updatePagingArrow(newPageNo)
                    } else {
                        this._renderPageBar(groupId)
                    }
                } else {
                    pageNo = this.pageControl.pageNo;
                    if (pageNo > pageCount) {
                        this._goto(1, false)
                    }
                    this.pageControl.pageCount = this.pageControl.pageNo = 1;
                    this._pageContainer.innerHTML = "";
                    this._leftArrowContainer.innerHTML = "";
                    this._rightArrowContainer.innerHTML = "";
                    this.buttonContainer.style.overflowX = "hidden";
                    this.buttonContainer.style.overflowY = "hidden"
                }
            }
        })
    });
    WinJS.Class.mix(CommonJS.SquareButtonContainer, WinJS.UI.DOMEventMixin, WinJS.Utilities.createEventProperties("pageUpdated"))
}
)();
(function appexPlatformControlsPageBarInit() {
    "use strict";
    var NS = WinJS.Namespace.define("CommonJS", {
        PagingBar: WinJS.Class.define(function pagingBar_ctor(element, options) {
            this.element = element || document.createElement("div");
            WinJS.Utilities.addClass(this.element, "platformPagination");
            CommonJS.setAutomationId(this.element);
            this.element.winControl = this;
            WinJS.UI.setOptions(this, options);
            this._init()
        }, {
            _pageNo: null,
            _on: null,
            pageCount: null,
            pageNo: {
                get: function get() {
                    return this._pageNo
                },
                set: function set(v) {
                    this._pageNo = v < 1 ? 1 : v > this.pageCount ? this.pageCount : v
                }
            },
            pageWidth: null,
            on: {
                get: function get() {
                    return this._on
                },
                set: function set(v) {
                    this._on = v;
                    if (v) {
                        WinJS.Utilities.addClass(bar, "pageOn")
                    } else {
                        WinJS.Utilities.removeClass(bar, "pageOn")
                    }
                }
            },
            MAXPAGEBARWIDTH: 18,
            _init: function _init() {
                var i = 0;
                var bar = null;
                var count = this.pageCount;
                var widthToSet = Math.min(this.MAXPAGEBARWIDTH, Math.floor((this.pageWidth - count * 7) / count)) + "px";
                this.element.style.msGridColumns = "(auto)[" + count + "]";
                for (i = 0; i < count; i++) {
                    bar = document.createElement("div");
                    bar.style.msGridColumn = i + 1;
                    bar.style.width = widthToSet;
                    this.element.appendChild(bar)
                }
                this.goto(this._pageNo)
            },
            reset: function reset() {
                this.goto(1)
            },
            goto: function goto(pageNo) {
                this.pageNo = pageNo;
                var currentBar = this.element.querySelector(".pageOn");
                if (currentBar) {
                    WinJS.Utilities.removeClass(currentBar, "pageOn")
                }
                var children = this.element.childNodes;
                var newPage = this.pageNo;
                var curr = children[newPage - 1];
                if (curr) {
                    WinJS.Utilities.addClass(curr, "pageOn")
                }
            }
        })
    })
}
)();
(function appexPlatformNavigationBarInit() {
    "use strict";
    var PEAKWIDTH = 30;
    var CHANNELBARBUTTONWIDTH = 158;
    var LEFTARROWCONTAINERWIDTH = 16;
    var NS = WinJS.Namespace.define("CommonJS", {
        NavigationBar: WinJS.Class.define(function navigationBar_ctor(element, options) {
            var that = this;
            element = element || document.createElement("div");
            this.element = element;
            this.element.winControl = this;
            WinJS.Utilities.addClass(this.element, "platformNavigationBar");
            this._hoistable = {};
            if (PlatformJS.isDebug) {
                var otherButtonsContainer = document.createElement("div");
                WinJS.Utilities.addClass(otherButtonsContainer, "platformNavOtherButtons");
                this.element.appendChild(otherButtonsContainer);
                this._setupButtonsInDebugMode(otherButtonsContainer)
            }
            var channelBar = this._mainChannelBar = new CommonJS.NavBarContainer(null,{
                title: CommonJS.getAppName(),
                id: CommonJS.getAppName()
            });
            channelBar.channelBarActive = true;
            channelBar.addEventListener("pageUpdated", function navBarContainer_pageUpdated(event) {
                that._hideSubChannel(null, true)
            });
            var hoistChannelBar = this._hoistChannelBar = new CommonJS.NavBarContainer(null,{
                titleResource: "/platform/viewing",
                id: "platform_viewing"
            });
            WinJS.Utilities.addClass(hoistChannelBar.element, "viewing");
            hoistChannelBar.platformHidden = true;
            var featuredChannelBar = this._featuredChannelBar = new CommonJS.NavBarContainer(null,{
                titleResource: "/platform/featured",
                id: "platform_featured"
            });
            WinJS.Utilities.addClass(featuredChannelBar.element, "featured");
            featuredChannelBar.platformHidden = true;
            var subChannelBar = this._subChannelBar = new CommonJS.NavBarContainer(null,{
                id: "subChannels"
            });
            WinJS.Utilities.addClass(subChannelBar.element, "subChannels");
            subChannelBar.platformHidden = true;
            element.appendChild(hoistChannelBar.element);
            element.appendChild(channelBar.element);
            element.appendChild(featuredChannelBar.element);
            element.appendChild(subChannelBar.element);
            WinJS.UI.setOptions(this, options)
        }, {
            _mainChannelBar: null,
            _hoistChannelBar: null,
            _featuredChannelBar: null,
            _subChannelBar: null,
            _expandedButton: null,
            _hoistable: null,
            _animating: null,
            _tabKeypressHandler: null,
            element: null,
            _setMainChannels: function _setMainChannels(value) {
                if (this._animating) {
                    this._animating.cancel();
                    this._animating = null
                }
                var buttons = this._buildCommands(value, buttonType.MAIN);
                if (buttons && buttons.length > 0) {
                    this._mainChannelBar.commands = buttons
                }
            },
            _setFeaturedChannels: function _setFeaturedChannels(value) {
                this._featuredChannelBar.platformHidden = true;
                if (value && value.length > 0) {
                    var buttons = this._buildCommands(value, buttonType.FEATURED);
                    if (buttons && buttons.length > 0) {
                        this._featuredChannelBar.commands = buttons;
                        this._featuredChannelBar.platformHidden = false
                    }
                }
                if (this._featuredChannelBar.platformHidden) {
                    this._featuredChannelBar.clearChannelBar()
                }
            },
            _setSubChannels: function _setSubChannels(value) {
                var channelIdToSubGroupMap = {}, subChannelButtons;
                this._hoistable = {};
                var mainSubChannelButtons = this._buildSubLevelCommands(value.MAIN, null, channelIdToSubGroupMap, buttonType.MAIN);
                var featuredSubChannelButtons = this._buildSubLevelCommands(value.FEATURED, null, channelIdToSubGroupMap, buttonType.FEATURED);
                subChannelButtons = mainSubChannelButtons.concat(featuredSubChannelButtons);
                if (subChannelButtons && subChannelButtons.length > 0) {
                    this._subChannelBar.channelIdToSubGroupMap = channelIdToSubGroupMap;
                    this._subChannelBar.commands = subChannelButtons
                } else {
                    this._subChannelBar.clearChannelBar()
                }
            },
            _setExpandedButton: function _setExpandedButton(buttonControl) {
                var old = this._expandedButton;
                if (old !== buttonControl) {
                    if (old) {
                        old.expanded = false
                    }
                    this._expandedButton = buttonControl;
                    if (buttonControl) {
                        buttonControl.expanded = true
                    }
                }
            },
            _getExpandedChannel: function _getExpandedChannel() {
                return (this._expandedButton && this._expandedButton.channelId) || null
            },
            _setupGridTool: function _setupGridTool(otherButtonsContainer) {
                var button = document.createElement("button");
                var gridButton = new WinJS.UI.AppBarCommand(button,{
                    icon: "\uE063",
                    extraClass: "appexSymbol"
                });
                gridButton.label = "Grid Overlay";
                gridButton.currentState = "gridOFF";
                gridButton.onclick = function gridButton_onClick(event) {
                    var currentState = event.srcElement.winControl.currentState;
                    if (currentState === "gridOFF") {
                        currentState = event.srcElement.winControl.currentState = "gridALL"
                    } else if (currentState === "gridALL") {
                        currentState = event.srcElement.winControl.currentState = "grid10"
                    } else if (currentState === "grid10") {
                        currentState = event.srcElement.winControl.currentState = "grid20"
                    } else if (currentState === "grid20") {
                        currentState = event.srcElement.winControl.currentState = "grid100"
                    } else if (currentState === "grid100") {
                        currentState = event.srcElement.winControl.currentState = "gridOFF"
                    }
                    var previousGrid = document.querySelector(".platformGridOverlay");
                    if (previousGrid) {
                        previousGrid.outerHTML = ""
                    }
                    if (currentState !== "gridOFF") {
                        var grid = document.createElement("div");
                        WinJS.Utilities.addClass(grid, "platformGridOverlay");
                        document.body.appendChild(grid);
                        if (currentState === "grid10" || currentState === "gridALL") {
                            var grid10 = document.createElement("div");
                            grid10.style.background = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAAKCAYAAACe5Y9JAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABxJREFUeNpiOHPmzH8gYGAEESDAxAAFFDIAAgwAEoEJb+o2wU4AAAAASUVORK5CYII=) repeat," + "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAACCAYAAABhYU3QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABhJREFUeNpiOHPmzH8gYCCEGUEEMQAgwADQDSFHZxoDEQAAAABJRU5ErkJggg==) repeat";
                            grid.appendChild(grid10)
                        }
                        if (currentState === "grid20" || currentState === "gridALL") {
                            var grid20 = document.createElement("div");
                            grid20.style.background = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAUCAYAAABMDlehAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABlJREFUeNpi+N/w/z/DfyBmYgACmhAAAQYAcPUGn06Bi/gAAAAASUVORK5CYII=) repeat," + "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAABCAYAAADeko4lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABNJREFUeNpi+N/wHwQYqIUBAgwAuL48RSVu/iEAAAAASUVORK5CYII=) repeat";
                            grid.appendChild(grid20)
                        }
                        if (currentState === "grid100" || currentState === "gridALL") {
                            var grid100 = document.createElement("div");
                            grid100.style.background = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAABkCAYAAABHLFpgAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABpJREFUeNpiaPj//z8DCDMxAMEoMQIIgAADAEgbBz8iLLSFAAAAAElFTkSuQmCC) repeat," + "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAABCAYAAAAo2wu9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABhJREFUeNpibPj//389AwMjwygYFAAgwAA2zwP/z5qIdAAAAABJRU5ErkJggg==) repeat";
                            grid.appendChild(grid100)
                        }
                    }
                }
                ;
                otherButtonsContainer.appendChild(button)
            },
            _setupCSSViewTool: function _setupCSSViewTool(otherButtonsContainer) {
                var buttonCSSView = document.createElement("button");
                var buttonCSSViewControl = new WinJS.UI.AppBarCommand(buttonCSSView,{
                    icon: "\uE002",
                    extraClass: "appexSymbol"
                });
                buttonCSSViewControl.label = "CSS View";
                buttonCSSViewControl.currentState = "viewOFF";
                buttonCSSView.onclick = function buttonCSSView_onClick(event) {
                    var currentState = event.srcElement.winControl.currentState;
                    if (currentState === "viewOFF") {
                        currentState = event.srcElement.winControl.currentState = "viewON";
                        PlatformJS.Tools.init()
                    } else {
                        currentState = event.srcElement.winControl.currentState = "viewOFF";
                        document.getElementById("cssview").style.display = "none";
                        PlatformJS.Tools.resetToDefault()
                    }
                    WinJS.UI.AppBar._toggleAppBarEdgy()
                }
                ;
                otherButtonsContainer.appendChild(buttonCSSView)
            },
            _setupGarbageCollectorTool: function _setupGarbageCollectorTool(otherButtonsContainer) {
                var buttonGCJS = document.createElement("button");
                var buttonGCJSControl = new WinJS.UI.AppBarCommand(buttonGCJS,{
                    icon: "\uE066",
                    extraClass: "appexSymbol"
                });
                buttonGCJSControl.label = "Garbage Collector JS";
                buttonGCJS.onclick = function buttonGCJS_onClick(event) {
                    CollectGarbage()
                }
                ;
                otherButtonsContainer.appendChild(buttonGCJS);
                var ButtonGCCSharp = document.createElement("button");
                var ButtonGCCSharpControl = new WinJS.UI.AppBarCommand(ButtonGCCSharp,{
                    icon: "\uE066",
                    extraClass: "appexSymbol"
                });
                ButtonGCCSharpControl.label = "Garbage Collector C#";
                ButtonGCCSharp.onclick = function ButtonGCCSharp_onClick(event) {
                    Platform.Process.collect()
                }
                ;
                otherButtonsContainer.appendChild(ButtonGCCSharp)
            },
            _setupBlankPageButton: function _setupBlankPageButton(otherButtonsContainer) {
                var buttonNavigateToBlank = document.createElement("button");
                var buttonNavigateToBlankControl = new WinJS.UI.AppBarCommand(buttonNavigateToBlank,{
                    icon: "\uE054",
                    extraClass: "appexSymbol"
                });
                buttonNavigateToBlankControl.label = "Navigate to blank page";
                buttonNavigateToBlank.onclick = function buttonNavigateToBlank_onClick(event) {
                    PlatformJS.Navigation.navigateToChannel("EmptyPage")
                }
                ;
                otherButtonsContainer.appendChild(buttonNavigateToBlank)
            },
            _setupDebugTool: function _setupDebugTool(otherButtonsContainer) {
                var buttonDebugTools = document.createElement("button");
                var buttonDebugToolsControl = new WinJS.UI.AppBarCommand(buttonDebugTools,{
                    icon: "\uE063",
                    extraClass: "appexSymbol"
                });
                buttonDebugToolsControl.label = "Debug Tools";
                buttonDebugTools.onclick = function buttonDebugTools_onClick(event) {
                    var debugToolOptions = new Windows.UI.Popups.MessageDialog("Debug Tools Options");
                    debugToolOptions.commands.append(new Windows.UI.Popups.UICommand("Load String Resource Json"));
                    debugToolOptions.commands.append(new Windows.UI.Popups.UICommand("Load Configuration File"));
                    debugToolOptions.commands.append(new Windows.UI.Popups.UICommand("Load Versions File"));
                    debugToolOptions.showAsync().then(function debugTool_afterShow(command) {
                        var commandLabel = command.label;
                        switch (commandLabel) {
                        case "Load String Resource Json":
                            Platform.Resources.PlatformResourceManager.instance.loadResourcesFromFileAsync();
                            break;
                        case "Load Configuration File":
                            Platform.Configuration.ConfigurationManager.instance.loadConfigurationFromFileAsync();
                            break;
                        case "Load Versions File":
                            Platform.Utilities.VersionManagerUtil.instance.loadVersionFromDiskAsync();
                            break;
                        default:
                            break
                        }
                    })
                }
                ;
                otherButtonsContainer.appendChild(buttonDebugTools)
            },
            _setupPreviewNavBar: function _setupPreviewNavBar(otherButtonsContainer) {
                var buttonDebugTools = document.createElement("button");
                var buttonDebugToolsControl = new WinJS.UI.AppBarCommand(buttonDebugTools,{
                    icon: "\uE063",
                    extraClass: "appexSymbol previewFeaturedDataSourceButton"
                });
                var previewFeaturedDataSource = PlatformJS.Configuration.ConfigurationManager.previewFeaturedDataSource;
                var updatePreviewDataSourceButton = function updatePreviewDataSourceButton(previewFeaturedDataSource) {
                    if (previewFeaturedDataSource) {
                        buttonDebugToolsControl.label = "Disable Preview Mode"
                    } else {
                        buttonDebugToolsControl.label = "Enable Preview Mode"
                    }
                };
                updatePreviewDataSourceButton(previewFeaturedDataSource);
                buttonDebugTools.onclick = function buttonDebugTools_onlick(event) {
                    buttonDebugToolsControl.disabled = true;
                    buttonDebugToolsControl.label += " (wait...)";
                    previewFeaturedDataSource = !previewFeaturedDataSource;
                    if (CommonJS && CommonJS.State) {
                        CommonJS.State.isPreviewModeEnabled = previewFeaturedDataSource
                    }
                    if (typeof NewsJS !== "undefined" && NewsJS.State && NewsJS.State.temp) {
                        NewsJS.State.temp.isPreviewModeEnabled = previewFeaturedDataSource
                    }
                    PlatformJS.Configuration.ConfigurationManager.previewFeaturedDataSource = previewFeaturedDataSource;
                    var currentMarket = Platform.Configuration.ConfigurationManager.instance.currentConfigurationFolderName;
                    PlatformJS.Cache.CacheService.getInstance("ConfigurationCache").removeEntry(currentMarket + "-Features");
                    var reloadFunction = function previewNavBar_reload() {
                        var channelManager = PlatformJS.Navigation.mainNavigator.channelManager;
                        channelManager.downloadFeaturesConfigAsync().then(function downloadFeaturesConfigAsync_complete() {
                            Platform.Configuration.ConfigurationManager.instance.hasPendingFeaturesConfigUpdate = true;
                            channelManager.loadFeaturesConfigAsync(true).then(function loadFeaturesConfigAsync_complete() {
                                PlatformJS.Navigation.mainNavigator.onPreviewToggle();
                                channelManager.channelConfigChanged = true;
                                var md = Windows.UI.Popups.MessageDialog("Preview Mode Toggled!");
                                md.showAsync().then(function loadFeaturesConfigAsync_promptComplete() {
                                    buttonDebugToolsControl.disabled = false;
                                    updatePreviewDataSourceButton(previewFeaturedDataSource)
                                })
                            })
                        })
                    };
                    if (CommonJS.LocalPano && CommonJS.LocalPano.LocalPanoManager) {
                        CommonJS.LocalPano.LocalPanoManager.instance.getRegionsFeed(true).then(function getRegionsFeed_complete() {
                            reloadFunction()
                        }, function getRegionsFeed_error() {
                            reloadFunction()
                        })
                    } else {
                        reloadFunction()
                    }
                }
                ;
                otherButtonsContainer.appendChild(buttonDebugTools);
                var buttonFlushCache = document.createElement("button");
                var buttonFlushCacheControl = new WinJS.UI.AppBarCommand(buttonFlushCache,{
                    icon: "clear",
                    label: "Flush Caches"
                });
                buttonFlushCache.onclick = function buttonFlushCache_onClick(event) {
                    var flushCacheOptions = new Windows.UI.Popups.MessageDialog("This operation will terminate the app. Do you wish to continue?");
                    flushCacheOptions.commands.append(new Windows.UI.Popups.UICommand("Ok"));
                    flushCacheOptions.commands.append(new Windows.UI.Popups.UICommand("Cancel"));
                    flushCacheOptions.showAsync().then(function flushCache_afterShow(command) {
                        if (command.label === "Ok") {
                            PlatformJS.mainProcessManager.resetBootCacheAsync().then(function _NavigationBar_422() {
                                Platform.Process.signalFlushCachesAndShutdown()
                            })
                        }
                    })
                }
                ;
                otherButtonsContainer.appendChild(buttonFlushCache);
                var buttonECTemplate = document.createElement("button");
                var buttonECTemplateControl = new WinJS.UI.AppBarCommand(buttonECTemplate,{
                    icon: "\uE245",
                    label: "EC Templates"
                });
                buttonECTemplate.onclick = function(event) {
                    CommonJS.News.EntityCluster.TemplateSelectorDebuggingEnabled = !CommonJS.News.EntityCluster.TemplateSelectorDebuggingEnabled;
                    var message = new CommonJS.MessageBar('',{
                        autoHide: true
                    });
                    if (CommonJS.News.EntityCluster.TemplateSelectorDebuggingEnabled) {
                        CommonJS.Search.disableTypeToSearch();
                        message.message = "EC debugging ENABLED. Type to search disabled."
                    } else {
                        CommonJS.Search.enableTypeToSearch();
                        message.message = "EC debugging DISABLED. Type to search enabled."
                    }
                    message.addButton("ok", function _NavigationBar_444() {
                        message.hide()
                    });
                    message.show()
                }
                ;
                otherButtonsContainer.appendChild(buttonECTemplate)
            },
            _setupOptimalTextSizeNavBar: function _setupOptimalTextSizeNavBar(otherButtonsContainer) {
                var buttonOptimalTexSize = document.createElement("button");
                var buttonOptimalTexSizeControl = new WinJS.UI.AppBarCommand(buttonOptimalTexSize,{
                    icon: "\uE063",
                    extraClass: "appexSymbol"
                });
                buttonOptimalTexSizeControl.label = "Disable Optimal TextSize";
                PlatformJS.Configuration.ConfigurationManager.optimalTextSizeEnabled = true;
                buttonOptimalTexSize.onclick = function buttonTR_onClick(event) {
                    var configurationManager = PlatformJS.Configuration.ConfigurationManager;
                    var optimalTextSizeEnabled = configurationManager.optimalTextSizeEnabled = !configurationManager.optimalTextSizeEnabled;
                    if (optimalTextSizeEnabled) {
                        buttonOptimalTexSizeControl.label = "Disable Optimal TextSize"
                    } else {
                        buttonOptimalTexSizeControl.label = "Enable Optimal TextSize"
                    }
                    var articleReaderPage = document.querySelector(".articleReaderPage");
                    if (articleReaderPage) {
                        var articleReaderPageControl = PlatformJS.Navigation.mainNavigator.currentIPage;
                        if (articleReaderPageControl && articleReaderPageControl._updateDefaultTextSize && articleReaderPageControl._getSettingsContainer) {
                            var container = articleReaderPageControl._getSettingsContainer();
                            container.values["optimalTextHash"] = null;
                            container.values["optimalTextSize"] = null;
                            container.values["textSize"] = null;
                            container.values["textStyle"] = null;
                            articleReaderPageControl._updateDefaultTextSize(true)
                        }
                    }
                }
                ;
                otherButtonsContainer.appendChild(buttonOptimalTexSize)
            },
            _setupTestRunner: function _setupTestRunner(otherButtonsContainer) {
                var buttonTR = document.createElement("button");
                var buttonTRControl = new WinJS.UI.AppBarCommand(buttonTR,{
                    icon: "\uE063",
                    extraClass: "appexSymbol"
                });
                buttonTRControl.label = "Test Runner";
                buttonTR.onclick = function buttonTR_onClick(event) {
                    BingApps.TestRunner.show()
                }
                ;
                otherButtonsContainer.appendChild(buttonTR)
            },
            _setupPDPDeleteButton: function _setupPDPDeleteButton(otherButtonsContainer) {
                var buttonPDPDelete = document.createElement("button");
                var buttonPDPDeleteControl = new WinJS.UI.AppBarCommand(buttonPDPDelete,{
                    icon: "clear",
                    extraClass: "appexSymbol",
                    label: "PDP Delete"
                });
                buttonPDPDeleteControl.onclick = function buttonPDPDeleteControl_onClick(event) {
                    var pdpdeleteOptions = new Windows.UI.Popups.MessageDialog("This operation will delete your roaming data in PDP. Do you wish to continue?");
                    pdpdeleteOptions.commands.append(new Windows.UI.Popups.UICommand("Ok"));
                    pdpdeleteOptions.commands.append(new Windows.UI.Popups.UICommand("Cancel"));
                    pdpdeleteOptions.showAsync().then(function pdpdeleteOptions_afterShow(command) {
                        if (command.label === "Ok") {
                            var domain = Platform.Configuration.ConfigurationManager.custom.PersonalDataPlatform.AppDomain.value;
                            var pdpClient = new Platform.Storage.PersonalizedDataService(domain,null);
                            var result = pdpClient.deleteServerDataAsync()
                        }
                    })
                }
                ;
                otherButtonsContainer.appendChild(buttonPDPDelete)
            },
            _setupCheckUpdateButton: function _setupCheckUpdateButton(otherButtonsContainer) {
                var buttonCheckUpdateForce = document.createElement("button");
                var buttonCheckUpdateNotForce = document.createElement("button");
                var buttonCheckUpdateForceControl = new WinJS.UI.AppBarCommand(buttonCheckUpdateForce,{
                    icon: "\uE003",
                    extraClass: "appexSymbol",
                    label: "Update Version: Mandatory"
                });
                var buttonCheckUpdateNotForceControl = new WinJS.UI.AppBarCommand(buttonCheckUpdateNotForce,{
                    icon: "\uE003",
                    extraClass: "appexSymbol",
                    label: "Update Version: Optional"
                });
                buttonCheckUpdateForceControl.onclick = function buttonCheckUpdateForceControl_onClick(event) {
                    PlatformJS.mainProcessManager.showVersionUI(null, {
                        code: Platform.Utilities.VersionUpdateUIType.forcedUpdate,
                        message: JSON.stringify({
                            AppStoreUrl: "ms-windows-store:Updates",
                            ForceUpdate: true
                        })
                    })
                }
                ;
                buttonCheckUpdateNotForceControl.onclick = function buttonCheckUpdateNotForceControl_onClick(event) {
                    PlatformJS.mainProcessManager.showVersionUI(null, {
                        code: Platform.Utilities.VersionUpdateUIType.forcedUpdate,
                        message: JSON.stringify({
                            AppStoreUrl: "ms-windows-store:Updates",
                            ForceUpdate: false
                        })
                    })
                }
                ;
                otherButtonsContainer.appendChild(buttonCheckUpdateForce);
                otherButtonsContainer.appendChild(buttonCheckUpdateNotForce)
            },
            _setupLoadArticleTool: function _setupLoadArticleTool(otherButtonsContainer) {
                var buttonLoadArticle = document.createElement("button");
                var buttonLoadArticleControl = new WinJS.UI.AppBarCommand(buttonLoadArticle,{
                    icon: "\uE002",
                    extraClass: "appexSymbol"
                });
                buttonLoadArticleControl.label = "Load Article";
                buttonLoadArticle.onclick = function buttonLoadArticle_onClick(event) {
                    CommonJS.ArticleReader.DebugUtils.loadArticle(buttonLoadArticleControl)
                }
                ;
                otherButtonsContainer.appendChild(buttonLoadArticle)
            },
            _setupArticlesDump: function _setupArticlesDump(otherButtonsContainer) {
                var buttonArticleDump = document.createElement("button");
                var buttonbuttonArticleDumpControl = new WinJS.UI.AppBarCommand(buttonArticleDump,{
                    icon: "\uE168",
                    extraClass: "appexSymbol",
                    label: "Dump Articles"
                });
                buttonbuttonArticleDumpControl.onclick = function buttonbuttonArticleDumpControl_onClick(event) {
                    CommonJS.ArticleReader.DebugUtils.dumpArticles()
                }
                ;
                otherButtonsContainer.appendChild(buttonArticleDump)
            },
            _setupCommonUxVersion: function _setupCommonUxVersion(otherButtonsContainer) {
                var div = document.createElement("div");
                WinJS.Utilities.addClass(div, "win-type-large");
                div.innerText = "CUX Version: " + (CommonJS.Version || "latest");
                otherButtonsContainer.appendChild(div)
            },
            _setupButtonsInDebugMode: function _setupButtonsInDebugMode(otherButtonsContainer) {
                this._setupGridTool(otherButtonsContainer);
                this._setupCSSViewTool(otherButtonsContainer);
                this._setupGarbageCollectorTool(otherButtonsContainer);
                this._setupBlankPageButton(otherButtonsContainer);
                this._setupDebugTool(otherButtonsContainer);
                this._setupPreviewNavBar(otherButtonsContainer);
                this._setupTestRunner(otherButtonsContainer);
                this._setupOptimalTextSizeNavBar(otherButtonsContainer);
                this._setupPDPDeleteButton(otherButtonsContainer);
                this._setupCheckUpdateButton(otherButtonsContainer);
                this._setupCommonUxVersion(otherButtonsContainer);
                this._setupArticlesDump(otherButtonsContainer);
                this._setupLoadArticleTool(otherButtonsContainer)
            },
            _buildCommands: function _buildCommands(channels, buttonContainerType) {
                var edgyEnabled = false
                  , buttons = channels.map(function channelsToButtons(channel, index) {
                    if (channel && (typeof channel.visible === "undefined" || channel.visible)) {
                        edgyEnabled = true
                    }
                    return this._createNavBarButton(channel, channel.id, buttonContainerType, index + 1)
                }, this);
                var edgy = PlatformJS.Utilities.getControl("platformNavigationBar");
                edgy.disabled = !edgyEnabled;
                return [buttons]
            },
            _buildSubLevelCommands: function _buildSubLevelCommands(channels, parentId, channelIdToSubGroupMap, buttonContainerType) {
                if (!channels) {
                    return []
                }
                var buttons = []
                  , i = 0
                  , channel = null;
                for (i = 0; i < channels.length; i++) {
                    channel = channels[i];
                    var buttonGroup = this._buildSubChannel(channel, parentId, buttonContainerType);
                    if (buttonGroup && buttonGroup.length > 0) {
                        channelIdToSubGroupMap[channel.id] = buttonGroup;
                        buttons.push(buttonGroup);
                        var nextLevel = this._buildSubLevelCommands(channel.subChannels, channel.id, channelIdToSubGroupMap, buttonType.SUBCHANNEL);
                        if (nextLevel.length > 0) {
                            buttons = buttons.concat(nextLevel)
                        }
                    }
                }
                return buttons
            },
            _buildSubChannel: function _buildSubChannel(channel, parentId, buttonContainerType) {
                var hoistable = (parentId || buttonContainerType === buttonType.FEATURED);
                if (hoistable) {
                    this._hoistable[channel.id] = (this._createNavBarButton(channel, parentId ? parentId : channel.id, buttonType.HOIST, 0))
                }
                return channel.subChannels.filter(function filterVisiblesubChannels(subChannel) {
                    return subChannel && (typeof subChannel.visible === "undefined" || subChannel.visible)
                }).map(function subChannelsToButtons(subChannel, index) {
                    return this._createNavBarButton(subChannel, channel.id, buttonType.SUBCHANNEL, index + 1)
                }, this)
            },
            _updateChannelSelection: function _updateChannelSelection() {
                this._mainChannelBar.updateChannels();
                this._featuredChannelBar.updateChannels()
            },
            initialFocus: function initialFocus() {
                var activeChannel = null;
                if (!this._hoistChannelBar.platformHidden) {
                    activeChannel = this._hoistChannelBar.getFirstVisibleButton()
                } else {
                    activeChannel = this._mainChannelBar.getFirstVisibleButton()
                }
                return activeChannel
            },
            _tabKeypress: function _tabKeypress(event) {
                if (event.keyCode === WinJS.Utilities.Key.tab) {
                    WinJS.Utilities.addClass(this.element, "tab");
                    this.element.removeEventListener("keydown", this._tabKeypressHandler, true)
                }
            },
            handleTabKeyPress: function handleTabKeyPress(add) {
                if (add) {
                    if (!this._tabKeypressHandler) {
                        this._tabKeypressHandler = this._tabKeypress.bind(this);
                        this.element.addEventListener("keydown", this._tabKeypressHandler, true)
                    }
                } else if (this._tabKeypressHandler) {
                    WinJS.Utilities.removeClass(this.element, "tab");
                    this.element.removeEventListener("keydown", this._tabKeypressHandler, true);
                    this._tabKeypressHandler = null
                }
            },
            _updateTitleText: function _updateTitleText() {
                this._hoistChannelBar.updateTitleText();
                this._featuredChannelBar.updateTitleText()
            },
            renderChannelBar: function renderChannelBar() {
                var channelManager = PlatformJS.Navigation.mainNavigator.channelManager;
                if (!channelManager) {
                    return
                }
                var featured = channelManager.featuredChannels
                  , standard = channelManager.channels;
                this._updateTitleText();
                if (this._animating) {
                    this._animating.cancel();
                    this._animating = null
                }
                if (channelManager.channelConfigChanged) {
                    this._setExpandedButton(null);
                    if (channelManager.standardChannelChanged) {
                        this._setMainChannels(standard)
                    }
                    if (channelManager.featuredChannelChanged) {
                        this._setFeaturedChannels(featured)
                    }
                    this._setSubChannels({
                        MAIN: standard,
                        FEATURED: featured
                    });
                    this._updateChannelSelection()
                }
                this._showHoistChannel();
                this._updatePaging();
                this._updateSubChannel();
                this._initChannelBarActive();
                featured.forEach(this._featuredDisplayInstrumentation)
            },
            _featuredDisplayInstrumentation: function _featuredDisplayInstrumentation(featuredChannel) {
                if (featuredChannel.displayInstrumentation) {
                    WinJS.xhr({
                        url: featuredChannel.displayInstrumentation
                    }).done(null, function featuredDisplayInstrumentation_complete() {})
                }
            },
            _updateSubChannel: function _updateSubChannel() {
                var currentChannel = WinJS.Navigation.location.channelId;
                var channelData = this._subChannelBar.containerOf(currentChannel);
                if (channelData) {
                    currentChannel = channelData.button.parentId
                }
                if (currentChannel === this._getExpandedChannel()) {
                    var selector = '[id=\"' + currentChannel + '\"]';
                    var expandedButtonElt = this._hoistChannelBar.element.querySelector(selector) || this._mainChannelBar.element.querySelector(selector);
                    var expandedButton = expandedButtonElt ? expandedButtonElt.winControl : null;
                    if (expandedButton && expandedButton.hasSubChannels) {
                        this._showSubChannel(expandedButton, false)
                    } else {
                        this._hideSubChannel(null, false)
                    }
                } else {
                    this._hideSubChannel(null, false)
                }
            },
            _updatePaging: function _updatePaging() {
                this._mainChannelBar.updatePaging();
                this._featuredChannelBar.updatePaging();
                this._subChannelBar.updatePaging()
            },
            _toggleSubChannel: function _toggleSubChannel(buttonControl) {
                var channelId = buttonControl.channelId;
                if (!this._subChannelBar.platformHidden && this._subChannelBar.activeGroupId === channelId) {
                    this._hideSubChannel(buttonControl, true)
                } else {
                    this._showSubChannel(buttonControl, true)
                }
            },
            _setHoistChannel: function _setHoistChannel(channelId, activeOnly) {
                var hoistChannelBar = this._hoistChannelBar;
                var channelBar = this._mainChannelBar;
                var hoistBarVisible = hoistChannelBar.platformHidden
                  , hoistChannel = this._hoistable[channelId];
                if (!channelId || !hoistChannel) {
                    hoistChannelBar.platformHidden = true;
                    channelBar.fullWidth = true
                } else {
                    this._setExpandedButton(null);
                    hoistChannel.visible = true;
                    hoistChannelBar.wideScrollMode = false;
                    hoistChannelBar.commands = [[hoistChannel]];
                    channelBar.fullWidth = false;
                    hoistChannelBar.platformHidden = false;
                    var button = hoistChannelBar.element.querySelector(".platformChannelButtonDiv");
                    if (button) {
                        var buttonControl = button.winControl;
                        buttonControl.expanded = false;
                        if (!activeOnly) {
                            buttonControl.disabled = true
                        } else {
                            this._setExpandedButton(buttonControl)
                        }
                    }
                }
                this._featuredChannelBar.updateVisibility(hoistChannel ? channelId : null);
                if (hoistBarVisible !== hoistChannelBar.platformHidden) {
                    channelBar.updateContainerLayout()
                }
            },
            _initChannelBarActive: function _initChannelBarActive() {
                var channelId = WinJS.Navigation.location.channelId;
                var buttonData = this._featuredChannelBar.containerOf(channelId);
                this._featuredChannelBar.channelBarActive = buttonData ? true : false;
                this._mainChannelBar.channelBarActive = buttonData ? false : true
            },
            _showHoistChannel: function _showHoistChannel() {
                var channelId = PlatformJS.Navigation.getFeaturedChannelId(WinJS.Navigation.location.channelId);
                var buttonData = this._mainChannelBar.containerOf(channelId) || this._featuredChannelBar.containerOf(channelId) || this._subChannelBar.containerOf(channelId);
                var hoistChannelId = null;
                if (buttonData) {
                    var buttonControl = buttonData.button;
                    channelId = buttonControl.channelId;
                    switch (buttonControl.buttonContainerType) {
                    case buttonType.FEATURED:
                        hoistChannelId = channelId;
                        break;
                    case buttonType.SUBCHANNEL:
                        if (buttonControl.hasSubChannels) {
                            hoistChannelId = channelId
                        } else {
                            hoistChannelId = buttonControl.parentId
                        }
                        break;
                    default:
                        break
                    }
                }
                this._setHoistChannel(hoistChannelId, hoistChannelId !== channelId)
            },
            _hideSubChannel: function _hideSubChannel(buttonControl, animate) {
                var that = this;
                if (!this._animating) {
                    this._animating = this._hideSubChannelAnimation(animate);
                    this._animating.done(function hideSubChannelAnimation_complete() {
                        that._setExpandedButton(null);
                        that._animating = null
                    })
                }
            },
            _showSubChannel: function _showSubChannel(buttonControl, animate) {
                if (buttonControl) {
                    var that = this;
                    if (!this._animating) {
                        var channelId = buttonControl.channelId;
                        this._subChannelBar.selectGroup(channelId);
                        this.positionPeak(buttonControl);
                        this._animating = this._showSubChannelAnimation(animate);
                        this._animating.done(function showSUBCHANNELAnimation_complete() {
                            that._setExpandedButton(buttonControl);
                            that._animating = null
                        })
                    }
                }
            },
            _showSubChannelAnimation: function _showSubChannelAnimation(animate) {
                var that = this;
                var featured = this._featuredChannelBar.element;
                var SUBCHANNEL = this._subChannelBar.element;
                var animation;
                var SUBCHANNELHeight = "114px";
                if (this._featuredChannelBar.isEmpty) {
                    if (this._subChannelBar.platformHidden === true) {
                        SUBCHANNEL.style.height = "0px";
                        this._subChannelBar.platformHidden = false;
                        this._subChannelBar.updatePaging();
                        if (animate) {
                            animation = WinJS.UI.executeTransition(SUBCHANNEL, {
                                property: "height",
                                delay: 0,
                                duration: 120,
                                timing: "linear",
                                to: SUBCHANNELHeight
                            })
                        } else {
                            SUBCHANNEL.style.height = SUBCHANNELHeight;
                            animation = WinJS.Promise.wrap(null)
                        }
                        return animation.then(function showSUBCHANNELEmptyFeatured_complete() {
                            WinJS.Utilities.addClass(that._mainChannelBar.element, "showL2");
                            return WinJS.Promise.wrap(null)
                        }, function showSUBCHANNELEmptyFeaturedNoAnimate_complete() {
                            SUBCHANNEL.style.height = SUBCHANNELHeight;
                            WinJS.Utilities.addClass(that._mainChannelBar.element, "showL2");
                            return WinJS.Promise.wrap(null)
                        })
                    }
                    return WinJS.Promise.wrap(null)
                } else if (this._subChannelBar.platformHidden === true) {
                    var height = featured.offsetHeight;
                    var translate = "translateY(" + height + "px)";
                    SUBCHANNEL.style.height = height - 1 + "px";
                    this._subChannelBar.platformHidden = false;
                    this._subChannelBar.updatePaging();
                    WinJS.Utilities.addClass(this._mainChannelBar.element, "showL2");
                    if (animate) {
                        animation = WinJS.UI.executeTransition(featured, {
                            property: "-ms-transform",
                            delay: 0,
                            duration: 120,
                            timing: "linear",
                            from: "",
                            to: translate
                        })
                    } else {
                        featured.style.transform = translate;
                        animation = WinJS.Promise.wrap(null)
                    }
                    return animation.then(function showSUBCHANNELWithFeatured_complete() {
                        that._featuredChannelBar.platformHidden = true;
                        that._subChannelBar.platformHidden = false;
                        return WinJS.Promise.wrap(null)
                    })
                } else {
                    this._featuredChannelBar.platformHidden = true;
                    this._subChannelBar.platformHidden = false;
                    return WinJS.Promise.wrap(null)
                }
            },
            _hideSubChannelAnimation: function _hideSubChannelAnimation(animate) {
                var that = this;
                var featured = this._featuredChannelBar.element;
                var SUBCHANNEL = this._subChannelBar.element;
                var animation;
                if (this._featuredChannelBar.isEmpty) {
                    if (animate) {
                        animation = WinJS.UI.executeTransition(SUBCHANNEL, {
                            property: "height",
                            delay: 0,
                            duration: 120,
                            timing: "linear",
                            to: "0px"
                        })
                    } else {
                        SUBCHANNEL.style.height = "0px";
                        animation = WinJS.Promise.wrap(null)
                    }
                    return animation.then(function hideSUBCHANNELEmptyFeatured_complete() {
                        that._subChannelBar.platformHidden = true;
                        WinJS.Utilities.removeClass(that._mainChannelBar.element, "showL2");
                        return WinJS.Promise.wrap(null)
                    })
                } else {
                    var height = featured.offsetHeight;
                    this._featuredChannelBar.platformHidden = false;
                    if (animate) {
                        var animation1 = WinJS.UI.executeTransition(this._subChannelBar.peak, {
                            property: "opacity",
                            delay: 60,
                            duration: 40,
                            timing: "linear",
                            from: 1,
                            to: 0
                        });
                        var animation2 = WinJS.UI.executeTransition(featured, {
                            property: "-ms-transform",
                            delay: 0,
                            duration: 120,
                            timing: "linear",
                            to: ""
                        });
                        animation = WinJS.Promise.join([animation2, animation1])
                    } else {
                        featured.style.transform = "";
                        animation = WinJS.Promise.wrap(null)
                    }
                    return animation.then(function hideSUBCHANNELWithFeatured_complete() {
                        that._subChannelBar.platformHidden = true;
                        that._subChannelBar.peak.style.opacity = 1;
                        WinJS.Utilities.removeClass(that._mainChannelBar.element, "showL2");
                        return WinJS.Promise.wrap(null)
                    })
                }
            },
            _createNavBarButton: function _createNavBarButton(channel, parentId, buttonContainerType, sequence) {
                var that = this;
                var button = {};
                var title;
                try {
                    title = channel.isDisplayValue ? channel.title : (channel.title ? PlatformJS.Services.resourceLoader.getString(channel.title) : "");
                    title = title || channel.title
                } catch (e) {
                    if (channel.visible === "true") {
                        PlatformJS.Utilities.onError("You need to provide a localized string for the channel title")
                    }
                }
                var subTitle;
                try {
                    subTitle = channel.isDisplayValue ? channel.subTitle : (channel.subTitle ? PlatformJS.Services.resourceLoader.getString(channel.subTitle) : "");
                    subTitle = subTitle || channel.subTitle
                } catch (e) {
                    if (channel.visible === "true") {
                        PlatformJS.Utilities.onError("You need to provide a localized string for the channel subtitle")
                    }
                }
                if (buttonContainerType === buttonType.SUBCHANNEL && channel.id === parentId) {
                    title = subTitle || title
                }
                button.title = title;
                button.icon = channel.icon;
                button.pressedIcon = channel.pressedIcon;
                button.channelId = channel.pageInfo.channelId;
                button.isSubChannel = parentId !== button.channelId;
                button.hasSubChannels = channel.subChannels.length > 0;
                button.parentId = parentId;
                button.index = sequence;
                button.toggleButtonColor = channel.toggleButtonColor;
                button.images = channel.images;
                button.doubleWide = channel.doubleWide;
                button.subTitle = subTitle;
                button.showIcon = channel.showIcon;
                button.buttonContainerType = buttonContainerType ? buttonContainerType : buttonType.MAIN;
                button.visible = (typeof channel.visible === "undefined") ? true : channel.visible;
                button.onclick = function navBarButton_onClick(elt) {
                    msWriteProfilerMark("Platform:Navigation:NavBarClick:s");
                    var buttonContainerTypeReverseMap = {
                        1: 'L1',
                        2: 'LF',
                        3: 'LV',
                        4: 'L2'
                    };
                    var clickUserActionMethod = PlatformJS.Utilities.getLastClickUserActionMethod();
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.navBar, button.title, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, clickUserActionMethod, 0, JSON.stringify({
                        ButtonType: buttonContainerTypeReverseMap[button.buttonContainerType],
                        index: button.index
                    }));
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.navBar);
                    if (channel.hitInstrumentation) {
                        WinJS.xhr({
                            url: channel.hitInstrumentation
                        }).done(null, function navBarButtonHitInstrumentation_complete() {})
                    }
                    var buttonElt = elt.currentTarget;
                    var buttonControl = buttonElt.winControl;
                    var channelIDInView = PlatformJS.Navigation.mainNavigator.channelIDInView;
                    var clickTarget = elt.target;
                    if (clickTarget && (channel.toggleOnClick || WinJS.Utilities.hasClass(clickTarget, "platformChannelToggle"))) {
                        that._toggleSubChannel(buttonControl)
                    } else if (CommonJS.NavigationBar.shouldNavBarButtonNavigateAway(channel)) {
                        if (!buttonControl.expanded && that._mainChannelBar.containerOf(channel.pageInfo.channelId)) {
                            that._hideSubChannel()
                        }
                        if (channel.state) {
                            channel.state.isNavBarEvent = true
                        }
                        if (channel.isDeepLink) {
                            PlatformJS.Navigation.navigateTo(channel.pageInfo.fragment)
                        } else {
                            WinJS.Navigation.navigate(channel.pageInfo, channel.state)
                        }
                    } else {
                        CommonJS.dismissAllEdgies();
                        that._panningToFront();
                        CommonJS.WindowEventManager.getInstance().dispatchEvent("samePageNav", event)
                    }
                    msWriteProfilerMark("Platform:Navigation:NavBarClick:e")
                }
                ;
                return button
            },
            _panningToFront: function _panningToFront() {
                if (document.querySelector(".platformPanorama")) {
                    var containerPano = document.querySelector(".platformPanoramaViewport");
                    if (containerPano) {
                        var contentPano = containerPano.querySelector(".platformPanoramaSurface");
                        if (contentPano) {
                            this._horizontalScrollToLeft(containerPano, contentPano)
                        }
                    }
                } else {
                    if (document.querySelector(".ecv")) {
                        containerPano = document.querySelector(".win-viewport.win-horizontal");
                        if (containerPano) {
                            contentPano = containerPano.querySelector(".win-surface");
                            if (contentPano) {
                                this._horizontalScrollToLeft(containerPano, contentPano)
                            }
                        }
                    }
                }
            },
            _horizontalScrollToLeft: function _horizontalScrollToLeft(containerDiv, childDiv) {
                if (!containerDiv || !childDiv) {
                    return
                }
                var scrollLeft = containerDiv.scrollLeft;
                var scrollMin = parseInt(containerDiv.currentStyle.msScrollLimitXMin);
                if (scrollLeft === scrollMin) {
                    return
                }
                var activeScrollAnimation = WinJS.UI.executeAnimation(childDiv, {
                    property: "-ms-transform",
                    delay: 0,
                    duration: 500,
                    timing: "ease",
                    from: "translateX(-" + (scrollLeft - scrollMin) + "px)",
                    to: "none"
                });
                containerDiv.scrollLeft = scrollMin
            },
            switchChannelSet: function switchChannelSet(channels) {
                this._mainChannelBar.commands = this._buildCommands(channels, buttonType.MAIN);
                this._mainChannelBar.updateChannels()
            },
            clearChannelBarState: function clearChannelBarState() {
                this._mainChannelBar.channelBarActive = false;
                this._featuredChannelBar.channelBarActive = false
            },
            positionPeak: function positionPeak(buttonControl) {
                var middlePoint = 0;
                var channelBarOffsetLeft = Math.max(this._mainChannelBar.element.getOffsetLeft(), LEFTARROWCONTAINERWIDTH);
                var channelBarWidth = this._mainChannelBar.buttonContainer.clientWidth;
                var buttonContainerType = buttonControl.buttonContainerType;
                if (buttonContainerType === buttonType.MAIN) {
                    buttonControl = this._mainChannelBar.element.querySelector('[id=\"' + buttonControl.channelId + '\"]');
                    middlePoint += buttonControl.getOffsetLeft();
                    middlePoint -= this._mainChannelBar.buttonContainer.scrollLeft;
                    buttonControl = buttonControl.winControl
                }
                middlePoint = middlePoint >= 0 && middlePoint <= channelBarWidth - CHANNELBARBUTTONWIDTH ? middlePoint + CHANNELBARBUTTONWIDTH / 2 : (middlePoint < 0 ? (CHANNELBARBUTTONWIDTH + middlePoint) / 2 : (channelBarWidth + middlePoint) / 2);
                if (buttonContainerType === buttonType.MAIN) {
                    middlePoint += channelBarOffsetLeft
                }
                if ((WinJS.Utilities.hasClass(this._hoistChannelBar.element, "platformHidden") || buttonControl.channelId !== this._hoistChannelBar.activeGroupId) && (middlePoint < channelBarOffsetLeft || middlePoint > channelBarOffsetLeft + channelBarWidth)) {
                    this._mainChannelBar.dispatchEvent("pageUpdated")
                } else {
                    this._subChannelBar.peak.setLeft(middlePoint - PEAKWIDTH / 2 + "px")
                }
            }
        }, {
            ButtonContainerType: {
                MAIN: 1,
                FEATURED: 2,
                HOIST: 3,
                SUBCHANNEL: 4
            },
            NavBarControl: null,
            buildNavBar: function buildNavBar() {
                var that = this;
                var navBarId = "platformNavigationBar";
                var navBar = document.getElementById(navBarId);
                WinJS.UI.processAll(navBar).then(function navigator_buildNavBarProcessAllComplete() {
                    if (!navBar) {
                        var navBar = document.getElementById(navBarId);
                        if (!navBar || !navBar.children || !navBar.children.length > 0 || !navBar.children[0] || !navBar.children[0].winControl) {
                            debugger ;return
                        }
                    }
                    that.NavBarControl = navBar.children[0].winControl;
                    var control = PlatformJS.Utilities.getControl("platformNavigationBar");
                    if (control) {
                        control.addEventListener("aftershow", function navigator_onAfterShow(evt) {
                            var clickUserActionMethod = PlatformJS.Utilities.getLastClickUserActionMethod();
                            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.navBar, "", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.open, clickUserActionMethod, 0, "")
                        });
                        control.addEventListener("afterhide", function navigator_onAfterHide(evt) {
                            var clickUserActionMethod = PlatformJS.Utilities.getLastClickUserActionMethod();
                            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.navBar, "", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.close, clickUserActionMethod, 0, "")
                        });
                        var firstTime = true;
                        var beforeShow = function navigator_onBeforeShow() {
                            var channelManager = PlatformJS.Navigation.mainNavigator.channelManager;
                            if (!channelManager.channelConfigChanged && firstTime) {
                                channelManager.setChannelConfigData()
                            }
                            firstTime = false;
                            that.NavBarControl.handleTabKeyPress(true);
                            that.NavBarControl.renderChannelBar();
                            channelManager.channelConfigChanged = false
                        };
                        var beforeHide = function navigator_onBeforeHide() {
                            if (that.NavBarControl) {
                                that.NavBarControl.handleTabKeyPress(false)
                            }
                        };
                        control.addEventListener("beforeshow", beforeShow);
                        control.addEventListener("beforehide", beforeHide);
                        var activeChannel;
                        var afterShow = function navigator_onAfterShow() {
                            var pageEvents = CommonJS.Utils.PageEventListenerManager.getInstance();
                            activeChannel = that.NavBarControl.initialFocus();
                            if (activeChannel) {
                                activeChannel.focus();
                                pageEvents.add(activeChannel, "blur", onBlur);
                                pageEvents.add(control, "keydown", dismissActiveChannel);
                                pageEvents.add(control, "MSPointerDown", dismissActiveChannel)
                            }
                        };
                        var onBlur = function navigator_onBlur(event) {
                            var pageEvents = CommonJS.Utils.PageEventListenerManager.getInstance();
                            pageEvents.removeListenerForHostAndName(control, "keydown");
                            pageEvents.removeListenerForHostAndName(control, "MSPointerDown", dismissActiveChannel);
                            if (activeChannel) {
                                pageEvents.removeListenerForHostAndName(activeChannel, "blur");
                                activeChannel.focus()
                            }
                        };
                        var dismissActiveChannel = function navigator_dismissActiveChannel(event) {
                            var pageEvents = CommonJS.Utils.PageEventListenerManager.getInstance();
                            pageEvents.removeListenerForHostAndName(control, "keydown");
                            pageEvents.removeListenerForHostAndName(control, "MSPointerDown", dismissActiveChannel);
                            if (activeChannel) {
                                pageEvents.removeListenerForHostAndName(activeChannel, "blur")
                            }
                        };
                        control.addEventListener("aftershow", afterShow);
                        control.addEventListener("afterhide", dismissActiveChannel)
                    }
                })
            },
            shouldNavBarButtonNavigateAway: function shouldNavBarButtonNavigateAway(channel) {
                if (!channel || !channel.pageInfo) {
                    return false
                }
                var pageInfo = channel.pageInfo
                  , navigation = WinJS.Navigation
                  , location = navigation.location;
                if (location.channelId !== pageInfo.channelId || location.page !== pageInfo.page) {
                    return true
                }
                var channelIDInView = PlatformJS.Navigation.mainNavigator.channelIDInView;
                if (channelIDInView && channelIDInView !== pageInfo.channelId) {
                    return true
                }
                return navigation.state && channel.state && navigation.state.title !== channel.state.title
            }
        })
    });
    var buttonType = CommonJS.NavigationBar.ButtonContainerType
}
)();
(function appexPlatformControlsNavBarContainerInit() {
    "use strict";
    WinJS.Namespace.define("CommonJS", {
        NavBarContainer: WinJS.Class.derive(CommonJS.SquareButtonContainer, function navBarContainer_ctor(domElement, options) {
            CommonJS.SquareButtonContainer.call(this, domElement, options);
            var that = this;
            var commandUI = Windows.UI.Input.EdgeGesture.getForCurrentView();
            commandUI.addEventListener("completed", this._onEdgeGestureCompleted.bind(this), false);
            CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.WINDOW_RESIZE, function navBarContainer_onResize() {
                that._hasResized = true
            });
            WinJS.Navigation.addEventListener("navigated", function navBarContainer_onNavigated() {
                that.updateChannels()
            })
        }, {
            _activeChannel: null,
            _hasResized: false,
            _onEdgeGestureCompleted: function _onEdgeGestureCompleted() {
                if (!this._hasResized || !this._buttons || !this._buttons[0] || this._buttons[0].length === 0) {
                    return
                }
                this.updateChannels();
                this.updateContainerLayout();
                this._hasResized = false
            },
            activeChannel: {
                get: function get() {
                    return this._activeChannel
                }
            },
            updateChannels: function updateChannels() {
                var button = null
                  , i = 0;
                var location = WinJS.Navigation.location;
                var channelId = location.channelId;
                var buttons = this.element.querySelectorAll(".platformChannelButtonDiv");
                var len = buttons.length;
                for (i = 0; i < len; i++) {
                    button = buttons[i].winControl;
                    if (channelId === button.channelId) {
                        this._activeChannel = button;
                        button.disabled = true
                    } else {
                        button.disabled = false
                    }
                }
            }
        })
    })
}
)();
(function appexPlatformChannelManagerInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Navigation", {
        standardChannelsBootCacheKey: "CM.standardChannels",
        featuresChannelsBootCacheKey: "CM.featuredChannels",
        ChannelManager: WinJS.Class.define(function ChannelManager_ctor(processListeners) {
            var that = this;
            this.standardChannels = PlatformJS.BootCache.instance.getEntry(PlatformJS.Navigation.standardChannelsBootCacheKey, function _ChannelManager_30() {
                var temp = [];
                return that._readConfig(PlatformJS.Services.manifest.channels, temp)
            });
            this.standardChannelChanged = true;
            this.featuredChannels = PlatformJS.BootCache.instance.getEntry(PlatformJS.Navigation.featuresChannelsBootCacheKey, function _ChannelManager_35() {
                var temp = [];
                return that._readConfig(PlatformJS.Services.manifest.featuredChannels, temp)
            });
            this.featuredChannelChanged = true;
            this._navbarItemParsers = [];
            if (processListeners) {
                for (var i = 0; i < processListeners.length; i++) {
                    if (processListeners[i].parseNavBarItem) {
                        this._navbarItemParsers.push(processListeners[i].parseNavBarItem)
                    }
                }
            }
            this._navbarItemParsers.unshift(this._parseCloudPanoNavBarItem);
            msWriteProfilerMark("Platform:Navigation:ChannelManager:Constructor:e")
        }, {
            channels: null,
            standardChannels: null,
            featuredChannels: null,
            channelConfigChanged: {
                get: function get() {
                    return this.standardChannelChanged || this.featuredChannelChanged
                },
                set: function set(value) {
                    this.standardChannelChanged = this.featuredChannelChanged = value
                }
            },
            standardChannelChanged: false,
            featuredChannelChanged: false,
            _cloudFeaturedChannelsLoaded: false,
            reloadChannels: function reloadChannels() {
                this.standardChannels = [];
                this._readConfig(PlatformJS.Services.manifest.channels, this.standardChannels);
                PlatformJS.BootCache.instance.addOrUpdateEntry(PlatformJS.Navigation.standardChannelsBootCacheKey, this.standardChannels);
                PlatformJS.Navigation.mainNavigator.lastIPage = null;
                PlatformJS.Navigation.mainNavigator.currentIPage = null;
                this.channels = this.standardChannels;
                PlatformJS.Navigation.mainNavigator.canNavigate = true
            },
            resolveChannel: function resolveChannel(channelId, channelSet) {
                var channels = this.channels;
                if (channelSet === "standard") {
                    channels = this.standardChannels
                } else if (channelSet === "featured") {
                    channels = this.featuredChannels
                }
                var channelIdLowerCase = channelId.toLowerCase();
                for (var i = 0, ilen = channels.length; i < ilen; i++) {
                    var channel = channels[i];
                    if (channel.id && channel.id.toLowerCase() === channelIdLowerCase) {
                        return channel
                    }
                    if (channel.subChannels) {
                        for (var k = 0, klen = channel.subChannels.length; k < klen; k++) {
                            var subChannel = channel.subChannels[k];
                            if (subChannel.id && subChannel.id.toLowerCase() === channelIdLowerCase) {
                                return subChannel
                            }
                        }
                    }
                }
            },
            setChannelConfigData: function setChannelConfigData(channelConfig) {
                var mainNavigator = PlatformJS.Navigation.mainNavigator;
                this.channelConfigChanged = true;
                if (channelConfig) {
                    this.standardChannels = channelConfig.standardChannels;
                    PlatformJS.BootCache.instance.addOrUpdateEntry(PlatformJS.Navigation.standardChannelsBootCacheKey, this.standardChannels);
                    this.featuredChannels = channelConfig.featuredChannels;
                    PlatformJS.BootCache.instance.addOrUpdateEntry(PlatformJS.Navigation.featuresChannelsBootCacheKey, this.featuredChannels)
                }
                this.channels = this.standardChannels
            },
            downloadFeaturesConfigAsync: function downloadFeaturesConfigAsync() {
                var that = this;
                var listeningNetwork = false;
                var downloadFeaturesConfig = function() {
                    if (!PlatformJS.Utilities.hasInternetConnection()) {
                        if (!listeningNetwork) {
                            Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", downloadFeaturesConfig);
                            listeningNetwork = true
                        }
                    } else {
                        if (listeningNetwork) {
                            Platform.Networking.NetworkManager.removeEventListener("networkstatuschanged", downloadFeaturesConfig);
                            listeningNetwork = false
                        }
                    }
                    return Platform.Configuration.ConfigurationManager.instance.downloadFeaturesConfigurationAsync().then(function features_downloadComplete() {
                        return that.loadFeaturesConfigAsync(true)
                    }, function features_downloadError(error) {
                        console.log("Unable to load feature partner.js")
                    })
                };
                return PlatformJS.platformInitializedPromise.then(function downloadFeaturesConfigAsync_afterPlatformInitialized() {
                    return downloadFeaturesConfig()
                })
            },
            loadFeaturesConfigAsync: function loadFeaturesConfigAsync(bypassCheckForServerVersion) {
                var that = this;
                msWriteProfilerMark("LoadFeaturedConfigAsync:s");
                var loadFeaturesConfig = function() {
                    if (!that._cloudFeaturedChannelsLoaded || Platform.Configuration.ConfigurationManager.instance.hasPendingFeaturesConfigUpdate) {
                        var currentMarket = Platform.Configuration.ConfigurationManager.instance.currentConfigurationFolderName;
                        var region = CommonJS.LocalPano && CommonJS.LocalPano.LocalPanoManager && CommonJS.LocalPano.LocalPanoManager.instance.activeRegion;
                        var getFeaturesConfigPromise = null;
                        if (!region) {
                            getFeaturesConfigPromise = PlatformJS.Cache.CacheService.getInstance("ConfigurationCache").findEntry(currentMarket + "-Features", {
                                supportsInMemory: true,
                                bypassInMemory: true
                            }).then(function getFeaturesConfig_Complete(response) {
                                if (response) {
                                    msWriteProfilerMark("ParseFeaturedConfig:s");
                                    that.parseFeaturesConfig(response.dataValue);
                                    Platform.Configuration.ConfigurationManager.instance.hasPendingFeaturesConfigUpdate = false
                                }
                                if (!bypassCheckForServerVersion) {
                                    that.downloadFeaturesConfigAsync()
                                }
                                msWriteProfilerMark("LoadFeaturedConfigAsync:e")
                            })
                        } else {
                            var sourcesSearchEntry = currentMarket + "-Features";
                            var navItemsSearchEntry = currentMarket + "-NavBarItems-" + region;
                            var results = {
                                navbaritems: null,
                                sources: null
                            };
                            var promiseArray = [];
                            promiseArray[0] = PlatformJS.Cache.CacheService.getInstance("ConfigurationCache").findEntry(navItemsSearchEntry, {
                                supportsInMemory: true,
                                bypassInMemory: true
                            }).then(function getFeaturesNavBarItemsConfig_Complete(response) {
                                if (response) {
                                    results.navbaritems = response.dataValue.navbaritems
                                }
                            });
                            promiseArray[1] = PlatformJS.Cache.CacheService.getInstance("ConfigurationCache").findEntry(sourcesSearchEntry, {
                                supportsInMemory: true,
                                bypassInMemory: true
                            }).then(function getFeaturesSourcesConfig_Complete(response) {
                                if (response) {
                                    results.sources = response.dataValue.sources
                                }
                            });
                            getFeaturesConfigPromise = WinJS.Promise.join(promiseArray).then(function getFeaturesConfig_Complete() {
                                if (results.navbaritems && results.sources) {
                                    msWriteProfilerMark("ParseFeaturedConfig:s");
                                    that.parseFeaturesConfig(results);
                                    Platform.Configuration.ConfigurationManager.instance.hasPendingFeaturesConfigUpdate = false
                                }
                                if (!bypassCheckForServerVersion) {
                                    that.downloadFeaturesConfigAsync()
                                }
                                msWriteProfilerMark("LoadFeaturedConfigAsync:e")
                            })
                        }
                        that._cloudFeaturedChannelsLoaded = true;
                        return getFeaturesConfigPromise
                    }
                    msWriteProfilerMark("LoadFeaturedConfigAsync:e");
                    return WinJS.Promise.wrap(null)
                };
                return PlatformJS.platformInitializedPromise.then(function loadFeaturesConfigAsync_afterPlatformInitialized() {
                    return loadFeaturesConfig()
                })
            },
            parseFeaturesConfig: function parseFeaturesConfig(response) {
                var featuredChannels = [];
                var that = this;
                response.navbaritems.forEach(function parseFeaturedChannels(navBarItem) {
                    var channelInfo = that.parseChannel(navBarItem, response.sources);
                    if (channelInfo) {
                        featuredChannels.push(channelInfo)
                    }
                });
                this.featuredChannels = featuredChannels;
                this.featuredChannelChanged = true;
                PlatformJS.BootCache.instance.addOrUpdateEntry(PlatformJS.Navigation.featuresChannelsBootCacheKey, this.featuredChannels)
            },
            parseChannel: function parseChannel(navBarItem, sources) {
                var channel = null;
                if (navBarItem.destination) {
                    console.log("parserChannel " + navBarItem.destination);
                    if (navBarItem.destination.startsWith("//sources/")) {
                        var id = navBarItem.destination.substring(10);
                        for (var i = 0; i < sources.length; i++) {
                            if (sources[i].id && sources[i].id.toLowerCase() === id.toLowerCase()) {
                                channel = {};
                                channel.id = id;
                                channel.visible = CommonJS.Partners.Config.getConfig(id, "VisibleInFeatureNavigationBar", true);
                                if (this.featuredChannels && this.featuredChannels.length > 0) {
                                    for (var j = 0; j < this.featuredChannels.length; j++) {
                                        if (this.featuredChannels[j].id === sources[i].channelid) {
                                            return this.featuredChannels[j]
                                        }
                                    }
                                }
                                for (var k = 0; k < this.standardChannels.length; k++) {
                                    if (this.standardChannels[k].id === sources[i].channelid) {
                                        channel.pageInfo = {
                                            channelId: id,
                                            fragment: this.standardChannels[k].pageInfo.fragment,
                                            page: this.standardChannels[k].pageInfo.page
                                        };
                                        break
                                    }
                                }
                                if (navBarItem.title) {
                                    channel.isDisplayValue = true;
                                    channel.title = navBarItem.title
                                }
                                channel.displayInstrumentation = navBarItem.displayinstrumentation;
                                channel.hitInstrumentation = navBarItem.hitinstrumentation;
                                channel.toggleButtonColor = navBarItem.dropdowncolor;
                                channel.state = sources[i].state ? JSON.parse(sources[i].state) : {
                                    dynamicInfo: {
                                        isFeaturedSource: true,
                                        dataProviderOptions: {
                                            useByline: true
                                        }
                                    }
                                };
                                channel.state.clusterAdsConfigPageId = id;
                                channel.state.articleReaderAdsConfigPageId = id;
                                channel.state.dynamicInfo = this._readDynamicInfo(channel, sources[i]);
                                channel.images = {};
                                if (navBarItem.partnerlogo) {
                                    channel.images.single = navBarItem.partnerlogo
                                }
                                if (navBarItem.partnerlogosnap) {
                                    channel.images.snap = navBarItem.partnerlogosnap
                                }
                                if (navBarItem.partnerlogohoisted) {
                                    channel.images.hoist = navBarItem.partnerlogohoisted
                                }
                                channel.subChannels = [];
                                var that = this;
                                if (navBarItem.subchannels && navBarItem.subchannels.length > 0) {
                                    navBarItem.subchannels.forEach(function parseSubChannels(subChannel) {
                                        var subchannelInfo = that.parseChannel(subChannel, sources);
                                        if (subchannelInfo) {
                                            channel.subChannels.push(subchannelInfo)
                                        }
                                    })
                                }
                                break
                            }
                        }
                    } else {
                        var parseResult = Platform.Utilities.AppExUri.tryCreate(navBarItem.destination);
                        var uri = parseResult && parseResult.value ? parseResult.appExUri : null;
                        var handlerLength = this._navbarItemParsers.length;
                        for (var index = 0; index < handlerLength; index++) {
                            channel = this._navbarItemParsers[index](navBarItem, uri);
                            if (channel) {
                                break
                            }
                        }
                        if (channel) {
                            if (navBarItem.title) {
                                channel.title = navBarItem.title;
                                channel.isDisplayValue = true
                            }
                        }
                    }
                }
                if (channel && !channel.pageInfo) {
                    console.error("missing pageInfo for navBarItem" + navBarItem.destination);
                    channel = null
                }
                if (channel && channel.images) {
                    if (channel.images.single) {
                        PlatformJS.Utilities.downloadFile("PlatformTopEdgyImageCache", channel.images.single).done(null, function singleImageDownloadFile_error(error) {})
                    }
                    if (channel.images.hoist) {
                        PlatformJS.Utilities.downloadFile("PlatformTopEdgyImageCache", channel.images.hoist).done(null, function hoistImageDownloadFile_error(error) {})
                    }
                    if (channel.images.snap) {
                        PlatformJS.Utilities.downloadFile("PlatformTopEdgyImageCache", channel.images.snap).done(null, function snapImageDownloadFile_error(error) {})
                    }
                }
                return channel
            },
            returnHomeChannel: function returnHomeChannel() {
                var key = "Home";
                var channels = this.channels;
                var channel = null;
                for (var i = 0, ilen = channels.length; i < ilen; i++) {
                    channel = channels[i];
                    if (channel.id === key) {
                        break
                    }
                }
                return WinJS.Promise.wrap({
                    pageInfo: channel.pageInfo,
                    state: channel.state
                })
            },
            _readDynamicInfo: function _readDynamicInfo(channel, source) {
                var dynamicInfo = channel.state.dynamicInfo;
                if (dynamicInfo) {
                    dynamicInfo.entrypoint = "navbar";
                    dynamicInfo.channelID = channel.id;
                    dynamicInfo.adUnitId = source.adunitid;
                    dynamicInfo.id = channel.id;
                    dynamicInfo.instrumentationId = source.instrumentationid;
                    var panoClass = PlatformJS.Navigation.ChannelManager.getPanoClass(channel.id);
                    dynamicInfo.panoClass = source.panoclass ? source.panoclass : panoClass;
                    if (panoClass && typeof panoClass === "string") {
                        dynamicInfo.articleTheme = panoClass
                    }
                    if (source.icon) {
                        dynamicInfo.logoUrl = source.icon
                    }
                    if (source.searchIcon) {
                        dynamicInfo.snapLogoUrl = source.searchIcon
                    }
                    if (source.displayname) {
                        dynamicInfo.panoTitle = source.displayname
                    }
                    if (source.featuredurl) {
                        dynamicInfo.feedName = source.featuredurl
                    }
                    if (source.css) {
                        dynamicInfo.css = source.css
                    }
                    if (source.backbuttontype) {
                        dynamicInfo.backbuttontype = source.backbuttontype
                    }
                    if (source.themetype === 0) {
                        dynamicInfo.theme = "dynamicPanoBoxedTheme"
                    }
                    if (source.headerlogo) {
                        dynamicInfo.logoUrl = source.headerlogo
                    }
                    if (source.headerlogosnapped) {
                        dynamicInfo.snapLogoUrl = source.headerlogosnapped
                    }
                    if (source.providerid) {
                        dynamicInfo.providerId = source.providerid
                    }
                    if (source.adlayoutoverridekey) {
                        dynamicInfo.adLayoutOverrideKey = source.adlayoutoverridekey
                    }
                    dynamicInfo.pinLogoUrls = {};
                    dynamicInfo.pinLogoUrls[Windows.Graphics.Display.ResolutionScale.scale100Percent] = source.pinnedlogo1 ? source.pinnedlogo1 : null;
                    dynamicInfo.pinLogoUrls[Windows.Graphics.Display.ResolutionScale.scale140Percent] = source.pinnedlogo14 ? source.pinnedlogo14 : null;
                    dynamicInfo.pinLogoUrls[Windows.Graphics.Display.ResolutionScale.scale180Percent] = source.pinnedlogo18 ? source.pinnedlogo18 : null;
                    var feedName = dynamicInfo.feedName;
                    if (feedName) {
                        dynamicInfo.liveTileUrls = this._setUpLiveTileUrls(feedName.replace(".js", ""));
                        dynamicInfo.liveTileRecurrence = PlatformJS.Services.configuration.getDictionary("LiveTile").getInt32("secondaryTileUpdateFrequency")
                    }
                    if (source.messagedata && source.messagedata.message) {
                        var srcData = source.messagedata;
                        dynamicInfo.messageData = {
                            title: srcData.title,
                            message: srcData.message,
                            okButtonLabel: srcData.okbuttonlabel,
                            cancelButtonLabel: srcData.cancelbuttonlabel
                        }
                    }
                }
                return dynamicInfo
            },
            _setUpLiveTileUrls: function _setUpLiveTileUrls(feedName) {
                var pollUrls = [];
                var liveTileDic = PlatformJS.Services.configuration.getDictionary("LiveTile");
                var urlTemplate = liveTileDic.getString("secondaryTileURL");
                var urlCount = liveTileDic.getInt32("secondaryTileCount");
                var currentMarket = Platform.Utilities.Globalization.getCurrentMarket();
                for (var i = 2; i <= urlCount; i++) {
                    var url = urlTemplate;
                    while (url.indexOf("{mkt}") >= 0) {
                        url = url.replace("{mkt}", currentMarket)
                    }
                    url = url.replace("{feedName}", feedName);
                    url = url.replace("{id}", i);
                    pollUrls.push(url)
                }
                return pollUrls
            },
            _readConfig: function _readConfig(channelsList, channelArray) {
                var i = 0;
                var channelConfig = null;
                for (i = 0; i < channelsList.size; i++) {
                    channelConfig = channelsList[i];
                    var channel = this._readChannel(channelConfig);
                    channelArray.push(channel)
                }
                return channelArray
            },
            _readChannel: function _readChannel(channelConfig) {
                var i = 0
                  , state = null
                  , title = null
                  , images = null;
                if (!channelConfig.id) {
                    PlatformJS.Utilities.onError("Invalid channel Id")
                }
                if (!channelConfig.title) {
                    PlatformJS.Utilities.onError("Invalid channel title")
                }
                if (!channelConfig.fragment) {
                    PlatformJS.Utilities.onError("Invalid channel fragment")
                }
                if (!channelConfig.page) {
                    PlatformJS.Utilities.onError("Invalid channel page object name")
                }
                var subChannels = [];
                for (i = 0; i < channelConfig.subChannels.size; i++) {
                    var subChannelConfig = channelConfig.subChannels[i];
                    var subChannel = this._readChannel(subChannelConfig);
                    subChannels.push(subChannel)
                }
                try {
                    state = channelConfig.state.length > 0 ? JSON.parse(channelConfig.state) : null
                } catch (e) {
                    PlatformJS.Utilities.onError(e)
                }
                try {
                    images = channelConfig.images && channelConfig.images.length > 0 ? JSON.parse(channelConfig.images) : null
                } catch (e) {
                    PlatformJS.Utilities.onError(e)
                }
                title = channelConfig.title;
                var channel = ({
                    id: channelConfig.id,
                    visible: channelConfig.visible === "true",
                    title: title,
                    icon: channelConfig.icon,
                    context: channelConfig.context,
                    pressedIcon: channelConfig.pressedIcon,
                    pageInfo: {
                        fragment: channelConfig.fragment,
                        page: channelConfig.page,
                        channelId: channelConfig.id
                    },
                    subChannels: subChannels,
                    doubleWide: channelConfig.doubleWide,
                    images: images,
                    subTitle: channelConfig.subTitle,
                    state: state
                });
                return channel
            },
            _parseCloudPanoNavBarItem: function _parseCloudPanoNavBarItem(navBarItem, uri) {
                if (uri && uri.queryParameters && uri.queryParameters.hasKey("entitytype") && uri.queryParameters["entitytype"] === "cloudPano") {
                    var channelId = uri.queryParameters["entitytype"] + "_" + uri.queryParameters["campaign"] + "_" + uri.queryParameters["market"];
                    if (uri.queryParameters.hasKey("index")) {
                        channelId = channelId + "_" + uri.queryParameters["index"]
                    }
                    var channel = {
                        id: channelId,
                        displayInstrumentation: navBarItem.displayinstrumentation,
                        hitInstrumentation: navBarItem.hitinstrumentation,
                        isDeepLink: true,
                        images: {
                            single: navBarItem.partnerlogo,
                            snap: navBarItem.partnerlogosnap,
                            hoist: navBarItem.partnerlogohoisted
                        },
                        pageInfo: {
                            fragment: navBarItem.destination,
                            channelId: channelId
                        },
                        subChannels: []
                    };
                    return channel
                }
            }
        }, {
            getPanoClass: function getPanoClass(id) {
                return CommonJS.Partners.Config.getConfig(id, "panoClass", "")
            }
        })
    })
}
)();
(function appexPlatformNavigationInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Navigation", {
        uriNavigationControllers: {},
        entityViewMap: {},
        isNoop: function isNoop(url) {
            if (!url || url.length === 0) {
                return true
            } else {
                var parseResult = Platform.Utilities.AppExUri.tryCreate(url);
                return parseResult.value && parseResult.appExUri.controllerId === "noop"
            }
        },
        _tryNavigationInfo: function _tryNavigationInfo(command) {
            var result = false;
            if (command) {
                if (command.channelId) {
                    PlatformJS.Navigation.navigateToChannel(command.channelId, command.state || {});
                    result = true
                } else if (command.pageInfo) {
                    WinJS.Navigation.navigate(command.pageInfo, command.state || {});
                    result = true
                }
            }
            return result
        },
        _executeCommand: function _executeCommand(command) {
            if (WinJS.Promise.is(command)) {
                command.then(function _Navigation_53(actionCommand) {
                    PlatformJS.Navigation._tryNavigationInfo(actionCommand)
                })
            } else {
                debugger ;if (!PlatformJS.Navigation._tryNavigationInfo(actionCommand)) {
                    command()
                }
            }
        },
        _logUserAction: function _logUserAction(actionContext, element) {
            PlatformJS.deferredTelemetry(function navigation_logUserAction() {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, actionContext, element, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
            })
        },
        getFeaturedChannelId: function getFeaturedChannelId(channelId) {
            if (!channelId || !channelId.length || channelId.length < 1) {
                return channelId
            }
            var featuredChannel = CommonJS.Partners.Config.getConfig(channelId, "FeaturedChannel", channelId);
            return featuredChannel
        },
        navigateTo: function navigateTo(uri, context) {
            var command = PlatformJS.Navigation.createCommandFromUri(uri, context);
            PlatformJS.Navigation._executeCommand(command)
        },
        createCommandFromUri: function createCommandFromUri(uri, context) {
            var command = null;
            if (uri && uri.length !== 0) {
                var parseResult = Platform.Utilities.AppExUri.tryCreate(uri);
                if (parseResult.value) {
                    var appExUri = parseResult.appExUri;
                    var parameters = appExUri.queryParameters;
                    if (parameters) {
                        if (parseResult.appExUri.entityId !== "") {
                            parameters["id"] = parseResult.appExUri.entityId
                        }
                        command = this.createCommand(appExUri.controllerId, appExUri.commandId, parameters, context)
                    } else {
                        command = this.createNoopAction()
                    }
                } else {
                    var externalUri = new Windows.Foundation.Uri(uri);
                    command = this.createLaunchUriAction(externalUri)
                }
            } else {
                command = this.createNoopAction()
            }
            if (command && command.state) {
                command.state.__uri = uri
            }
            return command
        },
        isSearchTileActivation: function isSearchTileActivation(args) {
            var activationContext = PlatformJS.mainProcessManager.getActivationContextJson(args);
            return activationContext === "searchCharm"
        },
        createCommandFromSearchTile: function createCommandFromSearchTile(args) {
            if (this.isSearchTileActivation(args)) {
                try {
                    return this.createCommand(args.controller, args.command, args.parameters, args.context)
                } catch (e) {}
            }
            return null
        },
        createCommand: function createCommand(controllerId, commandId, parameters, context) {
            var command = null;
            try {
                command = PlatformJS.Navigation.uriNavigationControllers[controllerId.toLowerCase()][commandId.toLowerCase()](parameters, context);
                if (!command) {
                    command = this.createNoopAction()
                }
            } catch (e) {
                command = this.createNoopAction()
            }
            var uriBuilder = new Platform.Utilities.AppExUriBuilder;
            uriBuilder.controllerId = controllerId;
            uriBuilder.commandId = commandId;
            var isValidElement;
            isValidElement = function navigation_isValidParameterElement(element) {
                var result = typeof (element) === "string" || typeof (element) === "number" || typeof (element) === "boolean" || element instanceof Date || element instanceof Array;
                if (element instanceof Array) {
                    for (var i = 0; i < value.length; i++) {
                        var arrayValue = value[i];
                        result = result && isValidElement(arrayValue)
                    }
                }
                return result
            }
            ;
            var paramVals = String.empty;
            for (var key in parameters) {
                var value = parameters[key];
                if (!parameters.hasOwnProperty(key) || !isValidElement(value)) {
                    continue
                }
                uriBuilder.queryParameters.insert(key, value);
                paramVals += key + " - " + value + "\n"
            }
            try {
                command.uri = uriBuilder.toString()
            } catch (e) {
                var eStr = "Error Msg:\n" + e.message + "\n\nStack Trace:\n" + e.stack + "\n\nParamters:\n" + paramVals + "\n";
                console.log(eStr);
                debugger ;command.uri = ""
            }
            return command
        },
        createNavigationAction: function createNavigationAction(navigationInfo) {
            var result = {};
            if (navigationInfo) {
                var channelId = navigationInfo.channelId
                  , pageInfo = navigationInfo.pageInfo
                  , state = navigationInfo.state;
                if (channelId) {
                    var channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(channelId, "standard");
                    if (!channelInfo) {
                        channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(channelId, "featured")
                    }
                    if (channelInfo) {
                        result.channelId = channelId;
                        result.pageInfo = channelInfo.pageInfo;
                        result.state = state = state || channelInfo.state || {}
                    }
                } else if (pageInfo) {
                    result.pageInfo = pageInfo;
                    result.state = state = state || {}
                } else {
                    result = null
                }
            }
            return WinJS.Promise.wrap(result)
        },
        createLaunchUriAction: function createLaunchUriAction(uri) {
            msSetImmediate(function delayAction() {
                Windows.System.Launcher.launchUriAsync(uri)
            });
            return PlatformJS.Navigation.createNoopAction()
        },
        createNoopAction: function createNoopAction() {
            return WinJS.Promise.wrap(null)
        },
        executeCommand: function executeCommand(controllerId, commandId, parameters, context) {
            console.log("Executing command: " + controllerId + ", " + commandId + ", " + parameters + ", " + context);
            var command = PlatformJS.Navigation.createCommand(controllerId, commandId, parameters, context);
            PlatformJS.Navigation._executeCommand(command)
        },
        _convertObjKeysToLowerCase: function _convertObjKeysToLowerCase(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && typeof key === "string") {
                    obj[key.toLowerCase()] = obj[key]
                }
            }
        },
        addDefaultController: function addDefaultController(extraCommands) {
            var applicationController = {
                default: function(args) {
                    return PlatformJS.Navigation.createNavigationAction({
                        channelId: "Home"
                    })
                },
                view: function view(args) {
                    PlatformJS.Navigation._convertObjKeysToLowerCase(args);
                    var entityType = args.entitytype.toLowerCase();
                    if (entityType) {
                        var entityView = PlatformJS.Navigation.entityViewMap[entityType];
                        return entityView(args)
                    }
                    return PlatformJS.Navigation.createCommand("application", "default")
                },
                back: function back(args) {
                    if (!PlatformJS.Navigation || PlatformJS.Navigation.canGoBack) {
                        WinJS.Navigation.back()
                    }
                }
            };
            if (extraCommands) {
                for (var key in extraCommands) {
                    if (extraCommands.hasOwnProperty(key) && typeof extraCommands[key] === "function") {
                        applicationController[key] = extraCommands[key]
                    }
                }
            }
            PlatformJS.Navigation.addController("application", applicationController)
        },
        addController: function addController(id, controller) {
            PlatformJS.Navigation._convertObjKeysToLowerCase(controller);
            PlatformJS.Navigation.uriNavigationControllers[id] = controller;
            PlatformJS.Navigation.uriNavigationControllers[id.toLowerCase()] = controller
        },
        addEntityView: function addEntityView(id, command) {
            PlatformJS.Navigation.entityViewMap[id] = command;
            PlatformJS.Navigation.entityViewMap[id.toLowerCase()] = command
        },
        addPartnerPanoEntityView: function addPartnerPanoEntityView(onError) {
            PlatformJS.Navigation.addEntityView("partnerPano", function navigation_partnerPanoEntityViewCommand(args) {
                if (!args.sourceid) {
                    return PlatformJS.Navigation.createNavigationAction({
                        channelId: "Home"
                    })
                }
                var sources = new PlatformJS.FeaturedPartners.Sources;
                return sources.getSourceForID(args.sourceid).then(function _Navigation_414(sourceItem) {
                    if (args.cluster) {
                        var dynamicInfo = sourceItem && sourceItem.state && sourceItem.state.dynamicInfo;
                        if (dynamicInfo) {
                            dynamicInfo.clusterToRender = args.cluster;
                            dynamicInfo.clusterID = args.cluster
                        }
                    }
                    return sourceItem
                }, function _Navigation_423() {
                    if (onError) {
                        return onError(args)
                    } else {
                        return null
                    }
                })
            })
        },
        addFeedbackEntityView: function addFeedbackEntityView() {
            PlatformJS.Navigation.addEntityView("feedback", function navigation_FeedbackEntityViewCommand() {
                msSetImmediate(CommonJS.Feedback.onFeedbackCmd);
                return PlatformJS.Navigation.createNoopAction()
            })
        },
        addCustomizationEntityView: function addCustomizationEntityView() {
            var that = this;
            PlatformJS.Navigation.addEntityView("customize", function navigation_CustomizationEntityViewCommand() {
                msSetImmediate(function execution_customization(args) {
                    var page = that.currentIPage;
                    if (page && page.onCustomize) {
                        page.onCustomize()
                    } else {
                        var panoElements = WinJS.Utilities.query(".platformMainContent");
                        if (panoElements && panoElements.length === 1) {
                            if (panoElements[0]) {
                                var panoControl = panoElements[0].winControl;
                                if (panoControl && panoControl.showCustomizationView) {
                                    panoControl.showCustomizationView()
                                }
                            }
                        }
                    }
                });
                return PlatformJS.Navigation.createNoopAction()
            })
        },
        addHelpEntityView: function addHelpEntityView() {
            PlatformJS.Navigation.addEntityView("help", function navigation_HelpEntityViewCommand() {
                msSetImmediate(function execution_HelpLinkClick() {
                    CommonJS.Settings.onHelpCmd();
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Next Steps", "Help link", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, "")
                });
                return PlatformJS.Navigation.createNoopAction()
            })
        },
        addPersonalizationSettingsEntityView: function addPersonalizationSettingsEntityView() {
            PlatformJS.Navigation.addEntityView("personalizationSetting", function navigation_PersonalizationSettingEntityViewCommand() {
                msSetImmediate(CommonJS.Settings.CommonJS.PrivacySettings.onPrivacySettingsCmd);
                return PlatformJS.Navigation.createNoopAction()
            })
        },
        addTourEntityView: function addTourEntityView() {
            var that = this;
            PlatformJS.Navigation.addEntityView("video", function navigation_TourEntityViewCommand(args) {
                msSetImmediate(function execution_presentTour() {
                    if (args.externalurl) {
                        var externalUrl = args.externalurl;
                        var params = CommonJS.Utils.getUriParams(externalUrl) || {};
                        if (params["videoformat"] && params["videoformat"].toLowerCase() === "flash") {
                            try {
                                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(externalUrl))
                            } catch (error) {
                                PlatformJS.deferredTelemetry(function videoWrapper_logException() {
                                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeErrorWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.high, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.javascript, "VideoWrapper - Third party video - LaunchUriAsync error:" + error.message, error.stack, JSON.stringify({
                                        url: externalUrl
                                    }))
                                })
                            }
                        } else {
                            externalUrl = CommonJS.Utils.addParamsToThirdPartyVideoUrl(externalUrl);
                            var location = {
                                fragment: "/common/mediaplayback/html/ThirdPartyPlayerPage.html",
                                page: "CommonJS.Mediaplayback.ThirdPartyPlayerPage"
                            };
                            var state = {
                                url: externalUrl,
                                instrumentationEntryPoint: "",
                                impressionContext: "/Mediaplayback/Thirdpartyplayer"
                            };
                            WinJS.Navigation.navigate(location, state)
                        }
                        that._logUserAction("Navigation", "Entity view - Third party video")
                    } else {
                        var playVideoFunction = null;
                        var videoOptions = null;
                        if (args.title) {
                            videoOptions = {
                                title: args.title
                            }
                        }
                        try {
                            playVideoFunction = CommonJS.MediaApp.Controls.MediaPlayback.fullscreenPlayback
                        } catch (error) {}
                        if (playVideoFunction) {
                            var contentId = args.contentId || args.contentid;
                            if (contentId) {
                                playVideoFunction(contentId, videoOptions);
                                that._logUserAction("Navigation", "Entity view - First party video fullscreen")
                            }
                        }
                    }
                });
                return PlatformJS.Navigation.createNoopAction()
            })
        },
        addCommonEntityViews: function addCommonEntityViews() {
            PlatformJS.Navigation.addFeedbackEntityView();
            PlatformJS.Navigation.addCustomizationEntityView();
            PlatformJS.Navigation.addHelpEntityView();
            PlatformJS.Navigation.addPersonalizationSettingsEntityView();
            PlatformJS.Navigation.addTourEntityView()
        },
        navigateToChannel: function navigateToChannel(channelId, state) {
            PlatformJS.Navigation.mainNavigator.navigateToChannel(channelId, state)
        },
        currentIPage: {
            get: function get() {
                if (PlatformJS.Navigation.mainNavigator) {
                    return PlatformJS.Navigation.mainNavigator.currentIPage
                } else {
                    return null
                }
            }
        },
        saveCurrentPageState: function saveCurrentPageState() {
            if (PlatformJS.Navigation.mainNavigator) {
                PlatformJS.Navigation.mainNavigator.storeCurrentPage()
            }
        },
        canNavigate: {
            get: function get() {
                if (PlatformJS.Navigation.mainNavigator) {
                    return PlatformJS.Navigation.mainNavigator.canNavigate
                } else {
                    return true
                }
            }
        },
        canGoBack: {
            get: function get() {
                return PlatformJS.Navigation.canNavigate && WinJS.Navigation.canGoBack
            }
        }
    })
}
)();
(function appexPlatformNoopControllerInit() {
    "use strict";
    var noopController = {
        default: function navigation_noopController(args) {
            return PlatformJS.Navigation.createNoopAction()
        }
    };
    PlatformJS.Navigation.addController("noop", noopController)
}
)();
(function appexPlatformNavigationInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Navigation", {
        mainNavigator: null,
        enablingDiskPaging: true,
        namespace: "PlatformJS.Navigation.",
        BackNavigation: "backNavigation",
        NewNavigation: "newNavigation",
        Navigator: WinJS.Class.define(function navigator_ctor(processListeners) {
            msWriteProfilerMark("Platform:Navigation:Constructor:s");
            if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
                PlatformJS.modernPerfTrack.addStage("SI");
                PlatformJS.modernPerfTrack.writeLaunchStageStopEvent(PlatformJS.perfTrackScenario_Launch_ServiceInitialization, "Service Initialization");
                PlatformJS.modernPerfTrack.writeLaunchStageStartEvent(PlatformJS.perfTrackScenario_Launch_NavigationInitialization, "Navigation Initialization")
            }
            this._displayData = PlatformJS.Utilities.getDisplayData();
            var that = this;
            this._backstackHistory = {};
            this._forwardstackHistory = {};
            this._currentLocation = {};
            PlatformJS.Telemetry.flightRecorder.initializeDisplay(that._displayData.width, that._displayData.height, that._displayData.scale);
            this.weightedNavigationCounter = new PlatformJS.WeightedNavigationCounter;
            this.channelManager = new PlatformJS.Navigation.ChannelManager(processListeners);
            this.lastIPage = null;
            this.currentIPage = null;
            if (CommonJS.LocalPano && CommonJS.LocalPano.LocalPanoManager) {
                CommonJS.LocalPano.LocalPanoManager.instance.addEventListener("regionChanged", function navigator_onRegionChanged() {
                    that._onRegionChange()
                })
            }
            WinJS.Navigation.addEventListener("beforenavigate", this._beforeNavigating.bind(this));
            WinJS.Navigation.addEventListener("navigating", this._navigating.bind(this));
            WinJS.Navigation.addEventListener("navigated", function navigator_onNavigated(event) {
                PlatformJS.Events.dispose();
                PlatformJS.Events.init();
                PlatformJS.Images.dispose();
                that.loadPage(event.detail);
                if (event.detail && event.detail.location && event.detail.location.channelId) {
                    that._lastChannelIdentifier = event.detail.location.channelId
                } else {
                    WinJS.Navigation.location.channelId = that._lastChannelIdentifier
                }
            });
            this._pageArea = document.getElementById("platformPageArea");
            this.channelManager.channels = this.channelManager.standardChannels;
            this.canNavigate = true;
            CommonJS.NavigationBar.buildNavBar();
            msWriteProfilerMark("Platform:Navigation:Constructor:e")
        }, {
            canNavigate: true,
            currentIPage: null,
            lastIPage: null,
            channelManager: null,
            channelIDInView: null,
            weightedNavigationCounter: null,
            _loadFeaturesPromise: null,
            _pageArea: null,
            _currentStackSize: 0,
            _currentPageTimer: null,
            _lastChannelIdentifier: null,
            _lastSuspendedTime: null,
            _loadPagePromise: null,
            _appBarDiv: null,
            _backstackHistory: null,
            _forwardstackHistory: null,
            _lastContext: null,
            _currentLocation: null,
            _pendingPageLoadCall: false,
            _pendingPageLoadId: null,
            _beforeNavigating: function _beforeNavigating(event) {
                this.canNavigate = false;
                this.storeCurrentPage();
                if (this.currentIPage) {
                    var pageId;
                    var pageType;
                    if (this.currentIPage._entityData) {
                        pageType = this.currentIPage._entityData.entityType;
                        if (pageType !== "League") {
                            pageId = this.currentIPage._leagueName + "/" + this.currentIPage._entityData.entityId
                        } else {
                            pageId = this.currentIPage._entityData.entityId
                        }
                    } else if (this.currentIPage._stateData) {
                        pageId = this.currentIPage._stateData.leagueType ? this.currentIPage._stateData.leagueType : this.currentIPage._stateData.pageId;
                        pageType = this.currentIPage._pageType ? this.currentIPage._pageType : (this.currentIPage._stateData.entity ? this.currentIPage._stateData.entity : pageId)
                    } else if (this.currentIPage._options) {
                        pageId = this.currentIPage._options.id;
                        pageType = this.currentIPage._options.id
                    }
                    if (event.detail && event.detail.state && pageId) {
                        event.detail.state.pageId = pageId;
                        event.detail.state.pageType = pageType
                    }
                    this.lastIPage = this.currentIPage
                }
                this.currentIPage = null;
                if (event.detail && event.detail.location && event.detail.location.channelId) {
                    this.channelIDInView = event.detail.location.channelId
                } else {
                    this.channelIDInView = null
                }
            },
            _navigating: function _navigating(event) {
                var lastIPage = this.lastIPage;
                if (lastIPage) {
                    this.lastIPage = null;
                    if (lastIPage.onNavigateAway) {
                        lastIPage.onNavigateAway(WinJS.Navigation.canGoForward ? PlatformJS.Navigation.BackNavigation : PlatformJS.Navigation.NewNavigation)
                    }
                    if (lastIPage.dispose) {
                        lastIPage.dispose()
                    }
                }
                var pageArea = this._pageArea;
                if (pageArea) {
                    WinJS.Utilities.disposeSubTree(pageArea);
                    var templateElements = document.querySelectorAll("#platformPageArea *[data-win-control='WinJS.Binding.Template']");
                    if (templateElements) {
                        for (var i = 0, len = templateElements.length; i < len; i++) {
                            var templateElement = templateElements[i];
                            if (templateElement && templateElement.parentElement) {
                                templateElement.parentElement.removeChild(templateElement)
                            }
                        }
                    }
                    WinJS.Utilities.empty(pageArea)
                }
                if (CommonJS.processListener) {
                    CommonJS.processListener.onNavigating(event)
                }
            },
            _logNavigationStart: function _logNavigationStart(context, impressionType, navMethod, partnerCode, attributes) {
                var logLevel = PlatformJS.Telemetry.logLevel.normal;
                navMethod = navMethod || PlatformJS.Utilities.getLastClickUserActionMethod();
                if (attributes) {
                    var jsonAttributes = JSON.stringify(attributes);
                    return PlatformJS.Telemetry.flightRecorder.logImpressionStartWithJsonAttributes(logLevel, context, impressionType, navMethod, partnerCode, jsonAttributes)
                }
                return PlatformJS.Telemetry.flightRecorder.logImpressionStart(logLevel, context, impressionType, navMethod, partnerCode)
            },
            _logNavigationEnd: function _logNavigationEnd() {
                var logLevel = PlatformJS.Telemetry.logLevel.normal;
                PlatformJS.Telemetry.flightRecorder.logImpressionExit(logLevel)
            },
            _logNavigationResume: function _logNavigationResume(impression) {
                var logLevel = PlatformJS.Telemetry.logLevel.normal;
                PlatformJS.Telemetry.flightRecorder.logImpressionResume(logLevel, impression)
            },
            _computeStackSize: function _computeStackSize() {
                var stackSize = WinJS.Navigation.history.backStack.length + WinJS.Navigation.history.forwardStack.length;
                if (!WinJS.Navigation.history.current.initialPlaceholder) {
                    stackSize += 1
                }
                return stackSize
            },
            _readEntryStateFromDiskAsync: function _readEntryStateFromDiskAsync(entry, position) {
                var that = this;
                return new WinJS.Promise(function navigator_readEntryStateFromDiskAsyncPromiseInit(complete, error) {
                    var state = entry.state;
                    complete({
                        state: state,
                        readFromDisk: false
                    })
                }
                )
            },
            _clearPage: function _clearPage() {
                if (!this._appBarDiv) {
                    this._appBarDiv = document.getElementById("ms-appbardiv")
                }
                if (this._appBarDiv) {
                    var appbars = WinJS.Utilities.query(".win-appbar", this._appBarDiv);
                    for (var i = 0; i < appbars.length; i++) {
                        if (appbars[i].id !== "platformNavigationBar") {
                            this._appBarDiv.removeChild(appbars[i])
                        }
                    }
                    this._appBarDiv = null
                }
                if (this._pageArea) {
                    WinJS.Utilities.disposeSubTree(this._pageArea);
                    WinJS.Utilities.empty(this._pageArea)
                }
                var appBarControl = PlatformJS.Utilities.getControl(document.getElementById("platformNavigationBar"));
                if (appBarControl) {
                    appBarControl.hide()
                }
            },
            _clearHistory: function _clearHistory() {
                this._resetMemoryStructures();
                this._clearPage()
            },
            _limitHistoryLength: function _limitHistoryLength() {
                var history = WinJS.Navigation.history;
                var backStack = history.backStack;
                if (!this._historyRestrictionConfig) {
                    var historyConfig = PlatformJS.Services.configuration.getDictionary("HistoryBackStackSizeLimitation");
                    var enableLimitation = (historyConfig.Enable && historyConfig.Enable.value) || false;
                    var triggerSize = (historyConfig.TriggerSize && historyConfig.TriggerSize.value) || 0;
                    var restrictionSize = (historyConfig.RestrictionSize && historyConfig.RestrictionSize.value) || 0;
                    triggerSize = Math.max(triggerSize, restrictionSize + 1);
                    this._historyRestrictionConfig = {
                        enable: enableLimitation,
                        triggerSize: triggerSize,
                        restrictionSize: restrictionSize
                    }
                }
                if (this._historyRestrictionConfig.enable && this._historyRestrictionConfig.restrictionSize > 2 && backStack.length >= this._historyRestrictionConfig.triggerSize) {
                    var firstItem = backStack[0];
                    var numberToRemove = backStack.length - this._historyRestrictionConfig.restrictionSize;
                    var nextItem = backStack[numberToRemove + 1];
                    if (firstItem.location && nextItem.location && firstItem.location.fragment === nextItem.location.fragment) {
                        numberToRemove++
                    }
                    backStack.splice(1, numberToRemove)
                }
            },
            _resetMemoryStructures: function _resetMemoryStructures() {
                WinJS.Navigation.history.backStack = [];
                WinJS.Navigation.history.forwardStack = [];
                WinJS.Navigation.history.current = {
                    location: "",
                    initialPlaceholder: true
                };
                this.canNavigate = true
            },
            _navigateHome: function _navigateHome(state) {
                this.navigateToChannel("Home", state)
            },
            getCurrentImpression: function getCurrentImpression() {
                var current = WinJS.Navigation.history.current;
                var impression = current.impression || null;
                return impression
            },
            replaceCurrentImpression: function replaceCurrentImpression(context) {
                var current = WinJS.Navigation.history.current;
                if (!current.impression) {
                    console.log("replaceCurrentImpression() called on empty impression stack");
                    return null
                }
                this._logNavigationEnd();
                var results = {};
                if (this.currentIPage) {
                    results = this.currentIPage.getPageImpressionPartnerCodeAndAttributes()
                }
                var newImpression = this._logNavigationStart(context, current.impression.type, current.impression.navMethod, current.impression.partnerCode, results.attributes);
                current.impression = newImpression;
                this._lastContext = context;
                return newImpression
            },
            navigateAway: function navigateAway() {
                if (this.currentIPage) {
                    this.lastIPage = this.currentIPage
                }
                this._navigating()
            },
            initialize: function initialize(clearState, isVersionUpdate) {
                var that = this;
                msWriteProfilerMark("Platform:Navigation:initialize:s");
                var getChannelPromise = null;
                getChannelPromise = this.channelManager.returnHomeChannel();
                this._clearHistory();
                return getChannelPromise
            },
            afterFirstView: function afterFirstView() {
                msSetImmediate(this.loadFeaturesConfigAsync.bind(this))
            },
            loadFeaturesConfigAsync: function loadFeaturesConfigAsync() {
                if (!this._loadFeaturesPromise) {
                    this._loadFeaturesPromise = this.channelManager.loadFeaturesConfigAsync()
                }
                return this._loadFeaturesPromise
            },
            storeCurrentPage: function storeCurrentPage() {
                if (this.currentIPage && WinJS.Navigation.history.current) {
                    WinJS.Navigation.state = this.currentIPage.getPageState();
                    this._backstackHistory = WinJS.Navigation.history.backStack;
                    this._forwardstackHistory = WinJS.Navigation.history.forwardStack;
                    this._currentLocation = WinJS.Navigation.history.current
                }
            },
            resetApp: function resetApp(e) {
                if (WinJS.Navigation.history.current.location.channelId === "Home") {
                    if (this._shouldThrowDuringResetApp(e.innerError)) {
                        this._permissionDeniedRetryCount = 0;
                        throw e;
                    }
                }
                this.returnHomeAndClearHistoryIfNecessary(true)
            },
            returnHomeAndClearHistoryIfNecessary: function returnHomeAndClearHistoryIfNecessary(clearHistory, state) {
                if (clearHistory) {
                    this._resetMemoryStructures();
                    this._navigateHome(state)
                } else {
                    var that = this;
                    this.channelManager.returnHomeChannel().then(function navigator_returnHomeChannelComplete(channelInfo) {
                        if (WinJS.Navigation.history.current.location.page !== channelInfo.pageInfo.page) {
                            that._navigateHome(state)
                        }
                    })
                }
            },
            navigateToChannel: function navigateToChannel(channelId, state) {
                var channelInfo;
                var i;
                if (this.canNavigate) {
                    channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(channelId, "standard");
                    if (!channelInfo) {
                        channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(channelId, "featured")
                    }
                    if (channelInfo) {
                        WinJS.Navigation.navigate(channelInfo.pageInfo, state);
                        return
                    }
                }
            },
            readEntryStateFromDiskAsync: function readEntryStateFromDiskAsync(detail) {
                return this._readEntryStateFromDiskAsync(detail, WinJS.Navigation.history.backStack.length)
            },
            loadPage: function loadPage(detail) {
                msWriteProfilerMark("Platform:Navigation:LoadPage:s");
                var that = this
                  , state = null
                  , history = WinJS.Navigation.history;
                if (!detail.location || !detail.location.fragment) {
                    return
                }
                if (this._loadPagePromise) {
                    this._loadPagePromise.cancel()
                }
                if (this._pendingPageLoadCall) {
                    this.notifyPageLoadComplete()
                }
                this._pendingPageLoadId = detail.location.channelId ? detail.location.channelId : detail.location.page;
                PlatformJS.modernPerfTrack.writeStartEvent(PlatformJS.perfTrackScenario_PageLoaded, "Page Load", this._pendingPageLoadId);
                this._pendingPageLoadCall = true;
                this._loadPagePromise = this._readEntryStateFromDiskAsync(detail, history.backStack.length).then(function navigator_readEntryStateFromDiskAsyncComplete(stateInfo) {
                    state = stateInfo.state;
                    that._clearPage();
                    that.canNavigate = true;
                    CommonJS.Utils.getAllEventListeners().doForEach(function goThroughAllListenersManager(listeners) {
                        if (listeners) {
                            var hasCrossPageEventListener = false
                              , ids = listeners.getIds();
                            ids.forEach(function goThroughAllListenerInAList(id) {
                                var entry = listeners.getEntry(id);
                                if (entry) {
                                    if (!entry.isCrossPage) {
                                        if (typeof entry.isCrossPage !== undefined) {
                                            console.warn("An event listener of " + entry.message + " is not unregistered.");
                                            debugger
                                        }
                                        listeners.remove(id)
                                    } else {
                                        hasCrossPageEventListener = true
                                    }
                                }
                            });
                            if (!hasCrossPageEventListener) {
                                console.warn("An eventListenerManager: " + listeners + " is not disposed.");
                                debugger
                            }
                        }
                    });
                    return new WinJS.Promise(function _Navigator_657(c, e) {
                        WinJS.UI.Fragments.renderCopy(detail.location.fragment, that._pageArea).then(function _Navigator_665_1() {
                            c()
                        }, function _Navigator_665_2(exc) {
                            e(exc)
                        })
                    }
                    )
                }).then(function navigator_pageFragmentRenderCopyComplete() {
                    var fragments = WinJS.Utilities.query(".fragment", that._pageArea);
                    var elementToBind = fragments.length > 0 ? fragments[0] : that._pageArea;
                    WinJS.Utilities.addClass(elementToBind, "platformPage");
                    return WinJS.UI.processAll(that._pageArea)
                }).then(function navigator_pageFragmentProcessAllComplete() {
                    return WinJS.Resources.processAll(that._pageArea)
                }).then(function navigator_pageFragmentResourcesProcessAllComplete() {
                    if (detail.location.page) {
                        that._setupPageAndPopulate(detail, state, history)
                    } else {
                        that.notifyPageLoadComplete();
                        PlatformJS.Utilities.onError("Invalid page")
                    }
                }).then(function navigator_pageLoaded() {
                    PlatformJS.platformInitializedPromise.then(function setupSearchBox() {
                        CommonJS.processListener.setupSearchBox()
                    })
                });
                this._loadPagePromise.done(function loadpagedone() {
                    if (CommonJS.DogfoodFeedback) {
                        CommonJS.DogfoodFeedback.addFeedbackButton()
                    }
                }, function loadingPage_error(err) {
                    that.notifyPageLoadComplete();
                    PlatformJS.Utilities.onError(err)
                })
            },
            _setupPageAndPopulate: function _setupPageAndPopulate(detail, state, history) {
                try {
                    if (!detail || !detail.location || !detail.location.page) {
                        throw "Unable to create IPage: detail.location.page is not properly set.";
                    }
                    this.currentIPage = PlatformJS.Utilities.createObject(detail.location.page, state);
                    if (this.currentIPage === null) {
                        throw "Unable to create IPage '" + detail.location.page + "'";
                    }
                    this.weightedNavigationCounter.countWeightedNode(this.currentIPage)
                } catch (e) {
                    this.notifyPageLoadComplete();
                    var error = {
                        innerError: e,
                        detail: JSON.stringify(detail),
                        navigationHistory: JSON.stringify(history)
                    };
                    this.resetApp(error);
                    return
                }
                msWriteProfilerMark("Platform:Navigation:LoadPage:e");
                if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
                    PlatformJS.modernPerfTrack.addStage("LP");
                    PlatformJS.modernPerfTrack.writeLaunchStageStopEvent(PlatformJS.perfTrackScenario_Launch_LoadPage, "Load Page");
                    PlatformJS.modernPerfTrack.writeLaunchStageStartEvent(PlatformJS.perfTrackScenario_Launch_PopulatePage, "Populate Page")
                }
                if (this._lastContext) {
                    this._logNavigationEnd();
                    this._lastContext = null
                }
                var current = history.current;
                if (WinJS.Navigation.canGoForward) {
                    if (current.impression) {
                        var lastImpression = current.impression;
                        this._logNavigationResume(lastImpression);
                        this._lastContext = "resume"
                    }
                } else {
                    var context = null;
                    if (this.currentIPage && this.currentIPage.getPageImpressionContext) {
                        context = this.currentIPage.getPageImpressionContext()
                    } else if (detail && detail.location && detail.location.page && detail.location.fragment) {
                        if (!detail.location.channelId) {
                            context = detail.location.fragment + "_" + detail.location.page
                        } else {
                            var channelId = detail.location.channelId;
                            var found = false;
                            context = channelId + "_" + detail.location.fragment + "_" + detail.location.page;
                            for (var i = 0; !found && i < this.channelManager.channels.length; i++) {
                                var channel = this.channelManager.channels[i];
                                if (channel.id === channelId && channel.context) {
                                    context = channel.context;
                                    found = true
                                }
                                if (channel.subChannels) {
                                    for (var j = 0; !found && j < channel.subChannels.length; j++) {
                                        var subChannel = channel.subChannels[j];
                                        if (subChannel.id === channelId && subChannel.context) {
                                            context = subChannel.context;
                                            found = true
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!context) {
                        context = "unknown"
                    }
                    var partnerCode = "";
                    var attributes = null;
                    if (this.currentIPage && this.currentIPage.getPageImpressionPartnerCodeAndAttributes) {
                        var results = this.currentIPage.getPageImpressionPartnerCodeAndAttributes();
                        partnerCode = results.partnerCode;
                        attributes = results.attributes
                    }
                    current.impression = this._logNavigationStart(context, "", "", partnerCode, attributes);
                    this._lastContext = context
                }
                return this.populatePage()
            },
            populatePage: function populatePage(isRefreshed) {
                msWriteProfilerMark("Platform:Navigation:PopulatePage:s");
                var that = this;
                var currentPage = this.currentIPage;
                if (currentPage && currentPage.getPageData) {
                    return currentPage.getPageData().then(function navigator_currentPageGetDataComplete(data) {
                        if (data) {
                            var fragments = WinJS.Utilities.query(".fragment", that._pageArea);
                            var elementToBind = fragments.length > 0 ? fragments[0] : that._pageArea;
                            return WinJS.Binding.processAll(elementToBind, data)
                        } else {
                            return WinJS.Promise.wrap(true)
                        }
                    }).then(function navigator_currentPageBindingProcessAllComplete(stopProcessing) {
                        if (stopProcessing === true) {
                            return
                        }
                        if (currentPage.onBindingComplete) {
                            currentPage.onBindingComplete();
                            msWriteProfilerMark("Platform:Navigation:PopulatePage:e");
                            if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
                                PlatformJS.modernPerfTrack.addStage("PP");
                                PlatformJS.modernPerfTrack.writeLaunchStageStopEvent(PlatformJS.perfTrackScenario_Launch_PopulatePage, "Populate Page");
                                PlatformJS.modernPerfTrack.writeLaunchStageStartEvent(PlatformJS.perfTrackScenario_Launch_Realization, "Realization")
                            }
                            if (!isRefreshed) {
                                var pageBeingViewed = WinJS.Navigation.location;
                                var dataPointId = null;
                                var key = pageBeingViewed.fragment + "-" + pageBeingViewed.page;
                                var instrumentationMappingHasKey = PlatformJS.BootCache.instance.getEntry("Nav.InstrMapping:" + key, function _Navigator_906() {
                                    return PlatformJS.Services.manifest.instrumentationMapping.hasKey(key)
                                });
                                if (instrumentationMappingHasKey) {
                                    PlatformJS.deferredTelemetry(function _Navigator_911() {
                                        dataPointId = PlatformJS.Services.manifest.instrumentationMapping.lookup(key);
                                        PlatformJS.Services.instrumentation.incrementInt32(Platform.Instrumentation.InstrumentationDataSetId.platform, dataPointId, 1)
                                    })
                                }
                                if (that._currentPageTimer !== null) {
                                    clearTimeout(that._currentPageTimer)
                                }
                                that._currentPageTimer = setTimeout(function navigator_currentPageTimeout() {
                                    PlatformJS.deferredTelemetry(function _Navigator_929() {
                                        PlatformJS.Services.instrumentation.incrementInt32BasedOnConnectivity(Platform.Instrumentation.InstrumentationDataSetId.platform, Platform.Instrumentation.InstrumentationDataPointId.totalPageViewCount, 1);
                                        if (!that._historyRestrictionConfig || that._historyRestrictionConfig.enable) {
                                            that._limitHistoryLength()
                                        }
                                    })
                                }, 3000)
                            }
                        }
                    }, PlatformJS.Utilities.onError)
                } else {
                    PlatformJS.Utilities.onError("getPageData not defined")
                }
            },
            notifyPageLoadComplete: function notifyPageLoadComplete() {
                if (!this._pendingPageLoadCall) {
                    return
                }
                this._pendingPageLoadCall = false;
                PlatformJS.modernPerfTrack.writeStopEventWithMetadata(PlatformJS.perfTrackScenario_PageLoaded, "Page Load", this._pendingPageLoadId, true);
                PlatformJS.performTestModeGC()
            },
            onLayoutChange: function onLayoutChange(event) {
                PlatformJS.Telemetry.flightRecorder.logDisplayChange(PlatformJS.Telemetry.logLevel.normal, this._displayData.width, this._displayData.height, this._displayData.scale)
            },
            onPreviewToggle: function onPreviewToggle() {
                if (this.currentIPage && this.currentIPage.onPreviewToggle) {
                    this.currentIPage.onPreviewToggle()
                }
            },
            onDpiChange: function onDpiChange(event) {
                if (this.currentIPage && this.currentIPage.onDpiChange) {
                    this.currentIPage.onDpiChange(event)
                }
            },
            onWindowResize: function onWindowResize(event) {
                if (this.currentIPage && this.currentIPage.onWindowResize) {
                    this.currentIPage.onWindowResize(event)
                }
            },
            onSuspending: function onSuspending(event) {
                this._historyRestrictionConfig = {
                    enable: false,
                    triggerSize: 0,
                    restrictionSize: 0
                };
                if (this.currentIPage && this.currentIPage.onSuspending) {
                    this.currentIPage.onSuspending(event)
                }
                this.storeCurrentPage();
                this._lastSuspendedTime = Date.now()
            },
            onResuming: function onResuming(event) {
                if (this.currentIPage && this.currentIPage.onResuming) {
                    this.currentIPage.onResuming(event)
                }
                this.channelManager.downloadFeaturesConfigAsync();
                if (PlatformJS.Services.isConfigurationInitialized) {
                    var resetHistoryMillisecondThreshold = CommonJS.Configuration.ConfigurationManager.custom.getInt32("ResetHistoryMillisecondThreshold");
                    var millisecondsSinceLastSuspend = Date.now() - this._lastSuspendedTime;
                    if (millisecondsSinceLastSuspend > resetHistoryMillisecondThreshold) {
                        var forceNavigateToHomeWhileResumingOnHomePage = PlatformJS.BootCache.instance.getEntry("ForceNavigateToHomeWhileResumingOnHomePage", function getForceNavigateToHomeWhileResumingOnHomePageConfigValue() {
                            return PlatformJS.Services.configuration.getBool("ForceNavigateToHomeWhileResumingOnHomePage")
                        });
                        if (forceNavigateToHomeWhileResumingOnHomePage === false) {
                            if (WinJS.Navigation.location.channelId !== "Home") {
                                this.returnHomeAndClearHistoryIfNecessary(true)
                            }
                        } else {
                            this.returnHomeAndClearHistoryIfNecessary(true)
                        }
                    }
                }
                this._historyRestrictionConfig = null
            },
            onVisibilityChange: function onVisibilityChange(event) {
                if (this.currentIPage && this.currentIPage.onVisibilityChange) {
                    this.currentIPage.onVisibilityChange(event)
                }
            },
            _onRegionChange: function _onRegionChange() {
                Platform.Configuration.ConfigurationManager.instance.hasPendingFeaturesConfigUpdate = true;
                this.channelManager.downloadFeaturesConfigAsync()
            },
            _shouldThrowDuringResetApp: function _shouldThrowDuringResetApp(e) {
                if (e && e instanceof Error && e.message === 'Permission denied') {
                    return this._permissionDeniedRetryCount++ >= this._permissionDeniedRetryMax
                }
                return true
            },
            _permissionDeniedRetryCount: 0,
            _permissionDeniedRetryMax: 3,
            _adsClusterAddedListenerID: null
        })
    })
}
)();
(function appexPlatformWeightedNavigationCounterInit(WinJS) {
    "use strict";
    var NS = WinJS.Namespace.define("PlatformJS", {
        WeightedNavigationCounter: WinJS.Class.define(function weightedNavigationCounter_ctor() {
            this._count = 0
        }, {
            _count: null,
            countWeightedNode: function countWeightedNode(node) {
                var weight = node.countWeight || 1;
                this._count += weight
            },
            getCount: function getCount(event) {
                return this._count
            }
        })
    })
}
)(WinJS)
