
//
// Copyright (C) Microsoft. All rights reserved.
//

Include.initializeFileScope(function() {
     var P = People,
         O = P.Orientation;

     var scrollDomAttributes = {};
     scrollDomAttributes[O.horizontal] = {
         extent:     "clientWidth",
         sectionPos: "clientLeft",
         scrollPos:  "scrollLeft",
         overflowX:  "scroll",
         overflowY:  "hidden"
     };
     scrollDomAttributes[O.vertical] = {
         extent:     "clientHeight",
         sectionPos: "clientTop",
         scrollPos:  "scrollTop",
         overflowX:  "hidden",
         overflowY:  "scroll"
     };

     var MockViewport = P.MockViewport = /* @constructor */ function(element, orientation) {
         this._element = element;
         this.onScroll = this._onScroll.bind(this);
         this._orientation = orientation;
         element.addEventListener('scroll', this.onScroll, false);
         var domAttr = this._domAttr = scrollDomAttributes[orientation];
         this._extent = element[domAttr.extent];

         element.style.overflowX = domAttr.overflowX;
         element.style.overflowY = domAttr.overflowY;
     };

     MockViewport.prototype._onScroll = function() {
         var scrollPos = this._element[this._domAttr.scrollPos];
         this._section.section.onScroll(scrollPos - this._section.element[this._domAttr.sectionPos], scrollPos - this._scrollPos);
         this._scrollPos = scrollPos;
     };

     MockViewport.prototype.extentChanged = function (child, position, extentChange) {
         // Record our width changes
         this._extentChanged = { child: child, position: position, extentChange: extentChange };
         if (this._section !== null) {
             this._onScroll(null);             
         }
     };

     MockViewport.prototype.getViewportExtent = function() {
         return this._extent;
     };

     MockViewport.prototype.getOrientation = function () {
         return this._orientation;
     };

     MockViewport.prototype.registerSection = function (section, element) {
         this._section = { section: section, element: element };             
     };

     MockViewport.prototype.setScrollPosition = function (scrollPos) {
         this._element[this._domAttr.scrollPos] = scrollPos;
         this._onScroll();
     };

     MockViewport.prototype.getScrollPosition = function () {
        return this._scrollPos;
     };

     MockViewport.prototype._domAttr = /* @dynamic */ null;
     MockViewport.prototype._scrollPos = 0;
     MockViewport.prototype._section = /* @static_cast(Object) */ null;
     MockViewport.prototype._extent = 0;
     MockViewport.prototype._extentChanged = /* @dynamic */ null;

});
