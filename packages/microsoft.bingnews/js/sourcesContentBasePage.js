/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        SourcesContentBasePage: WinJS.Class.derive(NewsJS.NewsBasePage, function (state) {
            NewsJS.NewsBasePage.call(this, state);
            var that = this
        }, {
            onBindingComplete: function onBindingComplete() {
                NewsJS.NewsBasePage.prototype.onBindingComplete.call(this)
            }, sourcesItemRenderer: function sourcesItemRenderer(item) {
                var container = document.createElement("div");
                container.className = "sourcesItemTemplate";
                CommonJS.setAutomationId(container);
                if (item && item.data && item.data.useWiderLayout) {
                    container.className += " widerSourceLayout"
                }
                var tileContainer = document.createElement("div");
                tileContainer.className = "sourceTileContainer";
                container.appendChild(tileContainer);
                var imageContainer = document.createElement("div");
                imageContainer.className = "sourceImageContainer";
                tileContainer.appendChild(imageContainer);
                if (item && item.data && item.data.data && item.data.data.win8_image) {
                    var imagePlaceholder = document.createElement("div");
                    imagePlaceholder.className = "sourceImage fitBoth platformImageCard platformPlaceHolderSmall";
                    imagePlaceholder.role = "img";
                    imageContainer.appendChild(imagePlaceholder);
                    var image = document.createElement("div");
                    image.className = "platformImageCardImage";
                    image.style.backgroundImage = "url('" + item.data.data.win8_image + "')";
                    imagePlaceholder.appendChild(image)
                }
                var textContainer = document.createElement("div");
                textContainer.className = "sourceTextContainer";
                textContainer.textContent = item && item.data && item.data.data ? item.data.data.displayname : "";
                textContainer.dir = PlatformJS.Utilities.getTextDirection(textContainer.textContent);
                tileContainer.appendChild(textContainer);
                return container
            }, updateStateOnSourceVisited: function updateStateOnSourceVisited(source) {
                NewsJS.Utilities.updateStateOnSourceVisited(source.id, this._state.market)
            }, sourceNavigate: function sourceNavigate(source, entrypoint, market) {
                var that = this;
                NewsJS.Utilities.navigateToSource(source, function (src) {
                    that.updateStateOnSourceVisited(src)
                }, entrypoint, market)
            }
        })
    })
})()