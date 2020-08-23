/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var ContentItemNotifier = (function(_super) {
                        __extends(ContentItemNotifier, _super);
                        function ContentItemNotifier(element, options) {
                            _super.call(this, element, options);
                            this.defaultTimeout = 2000;
                            this.errorTimeout = 2000;
                            this._createContentItemNotifierUI(element)
                        }
                        ContentItemNotifier.prototype.initialize = function(){};
                        ContentItemNotifier.prototype.unload = function() {
                            if (this._containerElementClickHandler) {
                                this._containerElementClickHandler.cancel();
                                this._containerElementClickHandler = null
                            }
                            _super.prototype.unload.call(this)
                        };
                        ContentItemNotifier.prototype._createContentItemNotifierUI = function(element) {
                            this._containerElement = element;
                            if (!this._containerElement.hasAttribute("aria-live")) {
                                MS.Entertainment.fail("ContentItemNotifier requires aria-live on its container div");
                                this._containerElement.setAttribute("aria-live", "polite")
                            }
                            if (!this._containerElement.hasAttribute("aria-atomic")) {
                                MS.Entertainment.fail("ContentItemNotifier requires aria-atomic on its container div");
                                this._containerElement.setAttribute("aria-atomic", "true")
                            }
                            if (!this._containerElement.hasAttribute(ContentItemNotifier.containerShowAnimationAttribute)) {
                                MS.Entertainment.fail("ContentItemNotifier requires " + ContentItemNotifier.containerShowAnimationAttribute + " attribute on its container div");
                                this._containerElement.setAttribute(ContentItemNotifier.containerShowAnimationAttribute, ContentItemNotifier.containerShowAnimationClass)
                            }
                            if (!this._containerElement.hasAttribute(ContentItemNotifier.containerHideAnimationAttribute)) {
                                MS.Entertainment.fail("ContentItemNotifier requires " + ContentItemNotifier.containerHideAnimationAttribute + " attribute on its container div");
                                this._containerElement.setAttribute(ContentItemNotifier.containerHideAnimationAttribute, ContentItemNotifier.containerHideAnimationClass)
                            }
                            if (!WinJS.Utilities.hasClass(this._containerElement, ContentItemNotifier.containerClass)) {
                                MS.Entertainment.fail("ContentItemNotifier requires " + ContentItemNotifier.containerClass + " class on its container div");
                                WinJS.Utilities.addClass(this._containerElement, ContentItemNotifier.containerClass)
                            }
                            this._containerElementClickHandler = MS.Entertainment.Utilities.addEventHandlers(this._containerElement, {
                                click: this.contentInfoNotificationClicked.bind(this), keydown: this.contentInfoNotificationClicked.bind(this)
                            })
                        };
                        ContentItemNotifier.prototype.contentInfoNotificationClicked = function(e) {
                            if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                                return;
                            if (this._isErrorState && this.action) {
                                this.action.execute(this.domElement);
                                e.preventDefault();
                                e.stopPropagation()
                            }
                        };
                        Object.defineProperty(ContentItemNotifier.prototype, "notification", {
                            get: function() {
                                return this._currentNotification
                            }, set: function(content) {
                                    this._currentNotification = content;
                                    this.setNotification(content)
                                }, enumerable: true, configurable: true
                        });
                        ContentItemNotifier.prototype.setNotification = function(content) {
                            if (!content)
                                return;
                            if (!this._contentElement) {
                                this._contentElement = document.createElement("div");
                                WinJS.Utilities.addClass(this._contentElement, ContentItemNotifier.contentClass);
                                this._containerElement.appendChild(this._contentElement)
                            }
                            try {
                                this._contentElement.textContent = content.notificationContent.toString()
                            }
                            catch(e) {
                                return
                            }
                            this._isErrorState = content.isError;
                            if (this._isErrorState) {
                                this._containerElement.setAttribute("aria-label", this.errorAccessibilityString || String.empty);
                                if (this.action) {
                                    this._containerElement.setAttribute("tabindex", "0");
                                    this._containerElement.setAttribute("role", "button")
                                }
                            }
                            else {
                                this._containerElement.setAttribute("aria-label", this.successAccessibilityString || String.empty);
                                this._containerElement.setAttribute("tabindex", "-1");
                                this._containerElement.setAttribute("role", "tooltip")
                            }
                            if (this._contentElement.textContent)
                                this._showNotification()
                        };
                        ContentItemNotifier.prototype._showNotification = function() {
                            var _this = this;
                            if (this._currentAnimationStagePromise)
                                this._currentAnimationStagePromise.cancel();
                            if (!this._containerElement)
                                return;
                            WinJS.Utilities.addClass(this._containerElement, "hideFromDisplay");
                            WinJS.Utilities.removeClass(this._containerElement, ContentItemNotifier.containerShowAnimationClass);
                            WinJS.Utilities.removeClass(this._containerElement, ContentItemNotifier.containerHideAnimationClass);
                            this._currentAnimationStagePromise = MS.Entertainment.Utilities.showElement(this._containerElement, 0, ContentItemNotifier.containerHideAnimationAttribute, ContentItemNotifier.containerShowAnimationAttribute);
                            var animationTimeoutDuration = this._isErrorState ? this.errorTimeout : this.defaultTimeout;
                            this._currentAnimationStagePromise = this._currentAnimationStagePromise.then(function() {
                                return WinJS.Promise.timeout(animationTimeoutDuration)
                            }).then(function() {
                                _this._hideNotification()
                            }, function() {
                                _this._hideNotification()
                            })
                        };
                        ContentItemNotifier.prototype._hideNotification = function() {
                            if (this._containerElement)
                                MS.Entertainment.Utilities.hideElement(this._containerElement, 0, ContentItemNotifier.containerShowAnimationAttribute, ContentItemNotifier.containerHideAnimationAttribute)
                        };
                        ContentItemNotifier.containerClass = "control-contentItemNotifier";
                        ContentItemNotifier.contentClass = "contentItemNotifier-content";
                        ContentItemNotifier.containerShowAnimationClass = "anim-contentItemNotifier-showing";
                        ContentItemNotifier.containerHideAnimationClass = "anim-contentItemNotifier-hiding";
                        ContentItemNotifier.containerShowAnimationAttribute = "data-ent-contentItemNotifierShowAnimation";
                        ContentItemNotifier.containerHideAnimationAttribute = "data-ent-contentItemNotifierHideAnimation";
                        return ContentItemNotifier
                    })(UI.Framework.UserControl);
                Controls.ContentItemNotifier = ContentItemNotifier
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
