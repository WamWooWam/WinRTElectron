/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Controls", {
        DomUtil: WinJS.Class.mix(WinJS.Class.define(function (domElement, options) { }, {}, {
            domCollapser: WinJS.Binding.converter(function (data) {
                return data && data.length > 0 ? "" : "none"
            })
        }), WinJS.UI.DOMEventMixin)
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Controls", {
        MoreColumnControl: WinJS.Class.mix(WinJS.Class.define(function (element, options) {
            var that = this;
            element.winControl = this;
            this._domElement = element;
            WinJS.Utilities.addClass(this._domElement, "newsMoreEntriesColumn");
            var addTileContainer = document.createElement("div");
            WinJS.Utilities.addClass(addTileContainer, "newsMoreEntriesTileContainer");
            this._domElement.appendChild(addTileContainer);
            if (options.addTileOptions.itemclick) {
                this._itemClick = options.addTileOptions.itemclick;
                PlatformJS.Utilities.enablePointerUpDownAnimations(this._domElement);
                PlatformJS.Utilities.registerItemClickProxy(this._domElement, function (domElement) {
                    return WinJS.Utilities.hasClass(domElement, "newsMoreEntriesColumn")
                }, function (domElement) {
                    that._itemClick(domElement)
                });
                Object.defineProperties(this, WinJS.Utilities.createEventProperties("itemclick"))
            }
            this._itemsContainer = PlatformJS.Utilities.createObject("CommonJS.Immersive.ItemsContainer", addTileContainer, options.addTileOptions);
            var clusterElement = element.parentElement;
            if (WinJS.Utilities.hasClass(clusterElement, "platformCluster")) {
                WinJS.Utilities.addClass(clusterElement, "newsMoreEntriesCluster")
            }
            WinJS.UI.setOptions(this, options.options)
        }, {
            _domElement: null, _itemsContainer: null, _itemClick: null, refresh: function refresh() { }, render: function render() {
                var that = this;
                return new WinJS.Promise(function (complete, error) {
                    if (that._itemsContainer) {
                        that._itemsContainer.render().done(function () {
                            var clusterItem = that._itemsContainer.element.querySelector(".platformClusterItem");
                            if (clusterItem) {
                                clusterItem.setAttribute("aria-label", PlatformJS.Services.resourceLoader.getString("AddTopic"));
                                clusterItem.setAttribute("role", "button")
                            }
                            complete()
                        })
                    }
                    else {
                        complete()
                    }
                })
            }
        }, {}), WinJS.UI.DOMEventMixin)
    })
})();
(function () {
    "use strict";
    var T = Microsoft.Bing.AppEx.Telemetry;
    WinJS.Namespace.define("NewsJS", {
        SlideShowEntryBlock: WinJS.Class.define(function (element, options) {
            this.element = element || document.createElement("div");
            WinJS.Utilities.addClass(this.element, "newsSlideShowEntry");
            this.element.winControl = this;
            this._clickBinding = this.onclick.bind(this);
            this._keyUpBinding = this._onKeyUp.bind(this);
            this.element.addEventListener("click", this._clickBinding);
            this.element.addEventListener("keyup", this._keyUpBinding);
            var articleData = options.controlOptions;
            var thumbnail = articleData.thumbnail;
            var imageElt = document.createElement("div");
            WinJS.Utilities.addClass(imageElt, "newsSlideShowEntryImage fitWidth sized");
            var background = document.createElement("div");
            WinJS.Utilities.addClass(background, "newsSlideShowEntryBackground");
            this.element.appendChild(background);
            var imageCard = new CommonJS.ImageCard(imageElt, {
                alternateText: thumbnail.altText, imageSource: {
                    url: thumbnail.url, cacheId: "PlatformImageCache"
                }
            });
            this.element.setAttribute("tabIndex", "0");
            this.element.setAttribute("role", "link");
            this.element.setAttribute("aria-label", thumbnail.altText || "");
            this.element.appendChild(imageElt);
            var attribution = document.createElement("div");
            WinJS.Utilities.addClass(attribution, "attribution");
            attribution.innerText = thumbnail.attribution;
            this.element.appendChild(attribution);
            var icon = document.createElement("div");
            WinJS.Utilities.addClass(icon, "icon");
            this.element.appendChild(icon);
            var iconRing = document.createElement("div");
            WinJS.Utilities.addClass(iconRing, "iconRing win-commandring win-commandicon");
            icon.appendChild(iconRing);
            var iconImage = document.createElement("div");
            WinJS.Utilities.addClass(iconImage, "iconImage");
            iconRing.appendChild(iconImage);
            PlatformJS.Utilities.enablePointerUpDownAnimations(this.element);
            WinJS.UI.setOptions(this, options.controlOptions)
        }, {
            _clickBinding: null, _keyUpBinding: null, _onKeyUp: function _onKeyUp(event) {
                var keyCode = event.keyCode;
                if (keyCode === WinJS.Utilities.Key.enter || keyCode === WinJS.Utilities.Key.space) {
                    this._openSlideShowPage(Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard)
                }
            }, _logUserAction: function _logUserAction(actionContext, element, navMethod) {
                T.FlightRecorder.logUserAction(T.LogLevel.normal, actionContext, element, T.UserActionOperation.click, navMethod, 0)
            }, _openSlideShowPage: function _openSlideShowPage(navMethod) {
                this._logUserAction("Article Reader", "Slideshow", navMethod);
                WinJS.Navigation.navigate({
                    fragment: "/html/newsSlideshow.html", page: this.slideShowPage || "NewsJS.SlideShowPage"
                }, {
                    providerType: this.providerType, providerConfiguration: this.articleData, theme: this.theme, parentArticle: this.parentArticle
                })
            }, articleData: null, parentArticle: null, providerType: null, element: null, theme: null, slideShowPage: null, onclick: function onclick(event) {
                var clickUserActionMethod = PlatformJS.Utilities.getClickUserActionMethod(event);
                this._openSlideShowPage(clickUserActionMethod)
            }, dispose: function dispose() {
                this.element.removeEventListener("click", this._clickBinding);
                this._clickBinding = null;
                this.element.removeEventListener("keyup", this._keyUpBinding);
                this._keyUpBinding = null
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Controls", {
        VerticalScrollContainer: WinJS.Class.derive(CommonJS.Immersive.ItemsContainer, function (element, options) {
            CommonJS.Immersive.ItemsContainer.call(this, element, options);
            this._wheelEvent = function (event) {
                event.stopPropagation()
            };
            this.element.addEventListener("wheel", this._wheelEvent)
        }, {
            _wheelEvent: null, dispose: function dispose() {
                if (this.element) {
                    this.element.removeEventListener("wheel", this._wheelEvent);
                    this._wheelEvent = null
                }
                CommonJS.Immersive.ItemsContainer.prototype.dispose.call(this)
            }
        })
    })
})()