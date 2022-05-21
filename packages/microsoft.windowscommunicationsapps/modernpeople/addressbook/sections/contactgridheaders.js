
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/Jx/Core/Jx.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../Controls/Collections/AddressBookCollections.js"/>

Jx.delayDefine(People, ["AlphabeticHeader", "FavoritesHeader", "OtherHeader", "ZoomedOutAlphabeticHeader"], function () {

    "use strict";
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.BaseHeader = /* @constructor*/function (ariaRole, className, textNodeSelector, html) {
        ///<param name="ariaRole" type="String"/>
        ///<param name="className" type="String"/>
        ///<param name="textNodeSelector" type="String"/>
        ///<param name="html" type="String"/>

        var element = this._element = document.createElement("div");
        element.className = className;
        element.innerHTML = html;
        element.id = this.id = "hdr" + Jx.uid.toString();
        element.setAttribute("role", ariaRole);
        this._textNode = element.querySelector(textNodeSelector).firstChild;
        Debug.assert(Jx.isObject(this._textNode));
    };
    P.BaseHeader.prototype.getElement = function () {
        return this._element;
    };
    P.BaseHeader.prototype.setDataContext = function (/*@dynamic*/data) {
        this._update(data);
    };
    P.BaseHeader.prototype.getHandler = function () {
        return this;
    };
    P.BaseHeader.prototype.getTextNode = function () {
        return this._textNode;
    };
    P.BaseHeader.prototype.dispose = function () {
        this._textNode = null;
        this._element = null;
    };
    P.BaseHeader.prototype.getAlignmentOffset = function () {
        var elementStyle = getComputedStyle(this._element);
        Debug.assert((elementStyle.marginLeft === elementStyle.marginRight) && (elementStyle.paddingLeft === elementStyle.paddingRight));
        return parseInt(elementStyle.marginLeft) + parseInt(elementStyle.paddingLeft);
    };
    P.BaseHeader.prototype.nullify = function () { };
    P.BaseHeader.prototype._update = function (data) { };

    P.ZoomableHeader = /* @constructor*/function (zoomDirection, ariaRole, className, textNodeSelector, html) {
        P.BaseHeader.call(this, ariaRole, className, textNodeSelector, html);
        this._zoomDirection = zoomDirection;
        this._data = /*@static_cast(P.CollectionItem)*/null;
        this._clickHandler = this._onClick.bind(this);
        this._keydownHandler = this._onKeydown.bind(this);
        this._addEventListeners();
        P.Animation.addTapAnimation(this._element);
    };
    Jx.inherit(P.ZoomableHeader, P.BaseHeader);
    var zoomDir = P.ZoomableHeader.Direction = {
        zoomIn: "zoomIn",
        zoomOut: "zoomOut"
    };
    P.ZoomableHeader.prototype._onClick = function (ev) {
        var evt = /*@static_cast(CustomEvent)*/document.createEvent("CustomEvent");
        evt.initCustomEvent("zoomOnElement", true, false, { zoomDirection: this._zoomDirection, originalEvent: ev });
        var element = this.getElement();
        element.dispatchEvent(/*@static_cast(Event)*/evt);
        Jx.log.info("ZoomableHeader._onClick: " + this._zoomDirection);
    };
    P.ZoomableHeader.prototype._onKeydown = function (ev) {
        this._onClick(ev);
    };
    P.ZoomableHeader.prototype.dispose = function () {
        this._removeEventListeners();
        P.BaseHeader.prototype.dispose.call(this);
    };
    P.ZoomableHeader.prototype._addEventListeners = function () {
        this._element.addEventListener("click", this._clickHandler, false);
        this._element.addEventListener("keydown", this._keydownHandler, false);
    };
    P.ZoomableHeader.prototype._removeEventListeners = function () {
        this._element.removeEventListener("click", this._clickHandler, false);
        this._element.removeEventListener("keydown", this._keydownHandler, false);
    };

    P.AddressBookHeader = /* @constructor*/function () {
        P.ZoomableHeader.call(this, zoomDir.zoomOut, "separator", "abHeaderContainer", ".abHeaderText", "<div class='abHeaderMixin'><span class='abHeaderText'> </span><div class='abHeaderLine'></div></div>");
        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.AddressBookHeader, P.ZoomableHeader);

    P.FavoritesHeader = /* @constructor*/function () {
        P.ZoomableHeader.call(this, zoomDir.zoomOut, "separator", "abHeaderContainer", ".abFavHeaderText", "<div class='abHeaderMixin'><span class='abFavHeaderText'> </span><div class='abHeaderLine'></div></div>");
        this.getTextNode().nodeValue = "\uE249"; // star
        this.getElement().setAttribute("aria-label", Jx.res.getString("/strings/abFavoritesGroupingHeader"));
        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.FavoritesHeader, P.ZoomableHeader);

    P.AlphabeticHeader = /* @constructor*/function () {
        P.AddressBookHeader.call(this);
        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.AlphabeticHeader, P.AddressBookHeader);
    P.AlphabeticHeader.prototype._update = function (/*@dynamic*/data) {
        ///<param name="data"/>
        this.getTextNode().nodeValue = data.label;
    };

    P.OtherHeader = /* @constructor*/function () {
        P.AddressBookHeader.call(this);
        this.getTextNode().nodeValue = Jx.res.getString("/strings/abOtherGroupingHeader");
        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.OtherHeader, P.AddressBookHeader);

    P.ZoomedOutSocialHeader = /* @constructor*/function () {
        P.ZoomableHeader.call(this, zoomDir.zoomIn, "option", "zoomedOutHeaderContainer", ".zoomedOutHeaderText", "<div class='zoomedOutHeaderBackground'><span class='zoomedOutHeaderText'> </span></div>");
        var label = Jx.res.getString("/strings/abSocialSectionTitle");
        this._textNode.nodeValue = label;
        this.getElement().setAttribute("aria-label", label);
        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.ZoomedOutSocialHeader, P.ZoomableHeader);

    P.ZoomedOutDynamicHeader = /* @constructor*/function () {
        P.ZoomableHeader.call(this, zoomDir.zoomIn, "option", "zoomedOutHeaderContainer", ".zoomedOutHeaderText", "<div class='zoomedOutHeaderBackground'><span class='zoomedOutHeaderText'> </span></div>");
        this._wasEmpty = true;
        this._updateEmptiness(this._wasEmpty);
    };
    Jx.inherit(P.ZoomedOutDynamicHeader, P.ZoomableHeader);
    P.ZoomedOutDynamicHeader.prototype._updateEmptiness = function (isEmpty) {
        if (isEmpty) {
            Jx.addClass(this._element.firstChild, "fadedZoomedOutHeaderBackground");
            this._removeEventListeners();
        } else {
            Jx.removeClass(this._element.firstChild, "fadedZoomedOutHeaderBackground");
            this._addEventListeners();
        }
        this._wasEmpty = isEmpty;
    };
    P.ZoomedOutDynamicHeader.prototype._onUpdate = function () {
        var isEmpty = this._data.collection.length === 0;
        if (this._wasEmpty !== isEmpty) {
            this._updateEmptiness(isEmpty);
        }
    };
    P.ZoomedOutDynamicHeader.prototype.nullify = function () {
        if (this._data) {
            var coll = /*@static_cast(P.Collection)*/this._data.collection;
            coll.removeListener("load", this._onUpdate, this);
            coll.removeListener("changesApplied", this._onUpdate, this);
            this._data = null;
        }
    };
    P.ZoomedOutDynamicHeader.prototype.dispose = function () {
        this.nullify();
        P.ZoomableHeader.prototype.dispose.call(this);
    };
    P.ZoomedOutDynamicHeader.prototype._update = function (/*@dynamic*/data) {
        this._data = data;
        var coll = /*@static_cast(P.Collection)*/this._data.collection;
        coll.addListener("load", this._onUpdate, this);
        coll.addListener("changesApplied", this._onUpdate, this);
        this._onUpdate();
    };

    P.ZoomedOutFavoritesHeader = /* @constructor*/function () {
        P.ZoomedOutDynamicHeader.call(this);
        var label = Jx.res.getString("/strings/abFavoritesSectionTitle");
        this._textNode.nodeValue = label;
        this.getElement().setAttribute("aria-label", label);
        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.ZoomedOutFavoritesHeader, P.ZoomedOutDynamicHeader);

    P.ZoomedOutAlphabeticHeader = /* @constructor*/function () {
        P.ZoomedOutDynamicHeader.call(this);
        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.ZoomedOutAlphabeticHeader, P.ZoomedOutDynamicHeader);
    P.ZoomedOutAlphabeticHeader.prototype._update = function (/*@dynamic*/data) {
        ///<param name="data"/>
        P.ZoomedOutDynamicHeader.prototype._update.call(this, data);
        if (this._data.header.type === "nameGrouping") {
            this._textNode.nodeValue = this._data.header.data.label;
        } else {
            Debug.assert(this._data.header.type === "otherGrouping");
            this._textNode.nodeValue = Jx.res.getString("/strings/abOtherGroupingHeader");
        }
    };

});





