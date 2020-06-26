Jx.delayDefine(People, ["AlphabeticHeader", "FavoritesHeader", "OtherHeader", "ZoomedOutAlphabeticHeader"], function() {
    "use strict";
    var n = window.People, i = Microsoft.WindowsLive.Platform, t;
    n.BaseHeader = function(n, t, i, r) {
        var u = this._element = document.createElement("div");
        u.className = t;
        u.innerHTML = r;
        u.id = this.id = "hdr" + Jx.uid.toString();
        u.setAttribute("role", n);
        this._textNode = u.querySelector(i).firstChild
    }
    ;
    n.BaseHeader.prototype.getElement = function() {
        return this._element
    }
    ;
    n.BaseHeader.prototype.setDataContext = function(n) {
        this._update(n)
    }
    ;
    n.BaseHeader.prototype.getHandler = function() {
        return this
    }
    ;
    n.BaseHeader.prototype.getTextNode = function() {
        return this._textNode
    }
    ;
    n.BaseHeader.prototype.dispose = function() {
        this._textNode = null;
        this._element = null
    }
    ;
    n.BaseHeader.prototype.getAlignmentOffset = function() {
        var n = getComputedStyle(this._element);
        return parseInt(n.marginLeft) + parseInt(n.paddingLeft)
    }
    ;
    n.BaseHeader.prototype.nullify = function() {}
    ;
    n.BaseHeader.prototype._update = function() {}
    ;
    n.ZoomableHeader = function(t, i, r, u, f) {
        n.BaseHeader.call(this, i, r, u, f);
        this._zoomDirection = t;
        this._data = null;
        this._clickHandler = this._onClick.bind(this);
        this._keydownHandler = this._onKeydown.bind(this);
        this._addEventListeners();
        n.Animation.addTapAnimation(this._element)
    }
    ;
    Jx.inherit(n.ZoomableHeader, n.BaseHeader);
    t = n.ZoomableHeader.Direction = {
        zoomIn: "zoomIn",
        zoomOut: "zoomOut"
    };
    n.ZoomableHeader.prototype._onClick = function(n) {
        var t = document.createEvent("CustomEvent"), i;
        t.initCustomEvent("zoomOnElement", true, false, {
            zoomDirection: this._zoomDirection,
            originalEvent: n
        });
        i = this.getElement();
        i.dispatchEvent(t);
        Jx.log.info("ZoomableHeader._onClick: " + this._zoomDirection)
    }
    ;
    n.ZoomableHeader.prototype._onKeydown = function(n) {
        this._onClick(n)
    }
    ;
    n.ZoomableHeader.prototype.dispose = function() {
        this._removeEventListeners();
        n.BaseHeader.prototype.dispose.call(this)
    }
    ;
    n.ZoomableHeader.prototype._addEventListeners = function() {
        this._element.addEventListener("click", this._clickHandler, false);
        this._element.addEventListener("keydown", this._keydownHandler, false)
    }
    ;
    n.ZoomableHeader.prototype._removeEventListeners = function() {
        this._element.removeEventListener("click", this._clickHandler, false);
        this._element.removeEventListener("keydown", this._keydownHandler, false)
    }
    ;
    n.AddressBookHeader = function() {
        n.ZoomableHeader.call(this, t.zoomOut, "separator", "abHeaderContainer", ".abHeaderText", "<div class='abHeaderMixin'><span class='abHeaderText'> <\/span><div class='abHeaderLine'><\/div><\/div>")
    }
    ;
    Jx.inherit(n.AddressBookHeader, n.ZoomableHeader);
    n.FavoritesHeader = function() {
        n.ZoomableHeader.call(this, t.zoomOut, "separator", "abHeaderContainer", ".abFavHeaderText", "<div class='abHeaderMixin'><span class='abFavHeaderText'> <\/span><div class='abHeaderLine'><\/div><\/div>");
        this.getTextNode().nodeValue = "";
        this.getElement().setAttribute("aria-label", Jx.res.getString("/strings/abFavoritesGroupingHeader"))
    }
    ;
    Jx.inherit(n.FavoritesHeader, n.ZoomableHeader);
    n.AlphabeticHeader = function() {
        n.AddressBookHeader.call(this)
    }
    ;
    Jx.inherit(n.AlphabeticHeader, n.AddressBookHeader);
    n.AlphabeticHeader.prototype._update = function(n) {
        this.getTextNode().nodeValue = n.label
    }
    ;
    n.OtherHeader = function() {
        n.AddressBookHeader.call(this);
        this.getTextNode().nodeValue = Jx.res.getString("/strings/abOtherGroupingHeader")
    }
    ;
    Jx.inherit(n.OtherHeader, n.AddressBookHeader);
    n.ZoomedOutSocialHeader = function() {
        n.ZoomableHeader.call(this, t.zoomIn, "option", "zoomedOutHeaderContainer", ".zoomedOutHeaderText", "<div class='zoomedOutHeaderBackground'><span class='zoomedOutHeaderText'> <\/span><\/div>");
        var i = Jx.res.getString("/strings/abSocialSectionTitle");
        this._textNode.nodeValue = i;
        this.getElement().setAttribute("aria-label", i)
    }
    ;
    Jx.inherit(n.ZoomedOutSocialHeader, n.ZoomableHeader);
    n.ZoomedOutDynamicHeader = function() {
        n.ZoomableHeader.call(this, t.zoomIn, "option", "zoomedOutHeaderContainer", ".zoomedOutHeaderText", "<div class='zoomedOutHeaderBackground'><span class='zoomedOutHeaderText'> <\/span><\/div>");
        this._wasEmpty = true;
        this._updateEmptiness(this._wasEmpty)
    }
    ;
    Jx.inherit(n.ZoomedOutDynamicHeader, n.ZoomableHeader);
    n.ZoomedOutDynamicHeader.prototype._updateEmptiness = function(n) {
        n ? (Jx.addClass(this._element.firstChild, "fadedZoomedOutHeaderBackground"),
        this._removeEventListeners()) : (Jx.removeClass(this._element.firstChild, "fadedZoomedOutHeaderBackground"),
        this._addEventListeners());
        this._wasEmpty = n
    }
    ;
    n.ZoomedOutDynamicHeader.prototype._onUpdate = function() {
        var n = this._data.collection.length === 0;
        this._wasEmpty !== n && this._updateEmptiness(n)
    }
    ;
    n.ZoomedOutDynamicHeader.prototype.nullify = function() {
        if (this._data) {
            var n = this._data.collection;
            n.removeListener("load", this._onUpdate, this);
            n.removeListener("changesApplied", this._onUpdate, this);
            this._data = null
        }
    }
    ;
    n.ZoomedOutDynamicHeader.prototype.dispose = function() {
        this.nullify();
        n.ZoomableHeader.prototype.dispose.call(this)
    }
    ;
    n.ZoomedOutDynamicHeader.prototype._update = function(n) {
        this._data = n;
        var t = this._data.collection;
        t.addListener("load", this._onUpdate, this);
        t.addListener("changesApplied", this._onUpdate, this);
        this._onUpdate()
    }
    ;
    n.ZoomedOutFavoritesHeader = function() {
        n.ZoomedOutDynamicHeader.call(this);
        var t = Jx.res.getString("/strings/abFavoritesSectionTitle");
        this._textNode.nodeValue = t;
        this.getElement().setAttribute("aria-label", t)
    }
    ;
    Jx.inherit(n.ZoomedOutFavoritesHeader, n.ZoomedOutDynamicHeader);
    n.ZoomedOutAlphabeticHeader = function() {
        n.ZoomedOutDynamicHeader.call(this)
    }
    ;
    Jx.inherit(n.ZoomedOutAlphabeticHeader, n.ZoomedOutDynamicHeader);
    n.ZoomedOutAlphabeticHeader.prototype._update = function(t) {
        n.ZoomedOutDynamicHeader.prototype._update.call(this, t);
        this._textNode.nodeValue = this._data.header.type === "nameGrouping" ? this._data.header.data.label : Jx.res.getString("/strings/abOtherGroupingHeader")
    }
})
