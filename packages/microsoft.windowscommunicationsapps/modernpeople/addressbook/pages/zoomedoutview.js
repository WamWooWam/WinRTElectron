
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../Sections/ContactGridSection.js" />
/// <reference path="../Controls/SemanticZoom/zoomhost.js" />
/// <reference path="../Controls/Viewport/Position.ref.js" />

Jx.delayDefine(People, "ZoomedOutView", function () {
    
    var P = window.People;

    P.ZoomedOutView = /* @constructor*/function (zoomhost) {
        /// <param name="disableEnterKey" type="Boolean">true for tiles to ignore Enter key inputs.</param>
        P.ContactGridSection.call(this, "zoomedOutSection");
        this._zoomhost = zoomhost;
        this._rendered = false;
    };
    Jx.inherit(P.ZoomedOutView, P.ContactGridSection);

    var proto = P.ZoomedOutView.prototype;
    proto.shutdownComponent = function () {
        Jx.dispose(this._collection);
        P.ContactGridSection.prototype.shutdownComponent.call(this);
    };

    proto._getCollection = function () {
        return this._zoomhost.getCollection();
    };

    proto._getFactories = function () {
        return {
            zoomedOutAlphabeticHeader: new P.Callback(function () { return new P.ZoomedOutAlphabeticHeader(); }, this),
            zoomedOutFavoritesHeader: new P.Callback(function () { return new P.ZoomedOutFavoritesHeader(); }, this),
            zoomedOutSocialHeader: new P.Callback(function () { return new P.ZoomedOutSocialHeader(); }, this)
        };
    };

    proto._getCanonicalType = function () {
        return "zoomedOutAlphabeticHeader";
    };

    proto.render = function () {
        /// <summary>Schedule the content of the semantic zoom section so that it doesn't interfere with normal loading. 
        ///  JobSet visibility and order will ensure that these items render immediately if semantic zoom is invoked, 
        ///  and last if it is not</summary>
        this.getJobSet().addUIJob(this, this._ensureRendered, null, P.Priority.semanticZoom);
    };

    proto.setCurrentItem = function (position) {
        /// <param name="position" type="Position" />
        var sectionElementStyle = getComputedStyle(this._sectionElement);

        var isHorizontal = (this.getOrientation() === P.Orientation.horizontal);
        var isLTR = sectionElementStyle.direction === "ltr";

        var scrollMargin, orthoMargin;
        if (isHorizontal) {
            scrollMargin = isLTR ? sectionElementStyle.marginLeft : sectionElementStyle.marginRight;
            orthoMargin = sectionElementStyle.marginTop;
        } else {
            Debug.assert(sectionElementStyle.marginLeft === sectionElementStyle.marginRight);
            scrollMargin = sectionElementStyle.marginTop;
            orthoMargin = sectionElementStyle.marginLeft;
        }

        position.scrollPos -= parseInt(scrollMargin);
        position.orthoPos -= parseInt(orthoMargin);

        P.ContactGridSection.prototype.setCurrentItem.call(this, position);
    };

    proto.positionItem = function (item) {
        // Semantic zoom has been invoked.  We must render immediately or we won't be able to take focus, because
        // sectionHidden is still set.
        this._ensureRendered();
        return P.ContactGridSection.prototype.positionItem.call(this, item);
    };

    proto._ensureRendered = function () {
        if (!this._rendered) {
            this._rendered = true;
            P.ContactGridSection.prototype.render.call(this);
        }
    };
});

