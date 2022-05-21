
(function() {
     
     var P = window.People,
         G = P.Grid;

     var H = P.GridUTHelpers = {
         lt: function (left, top) {
             return { left: left, top: top };
         },

         rt: function (right, top) {
             return { right: right, top: top };
         },

         DomFocus : { activeElement: null },

         getMockItemElement: function (itemData, currentStyle, dir) {
             return Jx.mix({ id: "",
                             currentStyle: Jx.mix({ direction: dir }, currentStyle),
                             parentNode: null,
                             style: {},
                             tabIndex: -1,
                             focus: function () { H.DomFocus.activeElement = this; },
                             setAttribute: function (attr, val) { this[attr] = val; },
                             getAttribute: function (attr) { return this[attr]; }
                           }, itemData);
         },

         getMockContainerElement: function(dir, containerStyle) {
             return new H.Container(dir, containerStyle);
         },

         getMockViewportElement: function() {
             return new ViewportElement();
         },

         isActiveElement: function (element) {
             return element === H.DomFocus.activeElement;  
         },

         makeNodeFactory: function(itemData, currentStyle, dir) { 
             return { 
                 fn: function (data, jobSet) {
                     return new P.MockNode(new P.Handler(data, jobSet), 
                                           P.GridUTHelpers.getMockItemElement(itemData, currentStyle, dir));
                 }
             };
         },

         getComputedStyle: function (oldComputedStyle) {
             return function (elt) {
                 return elt.currentStyle || oldComputedStyle(elt, null);                 
             };
         },

         arraysEqual: function(a, b){
             if (a.length !== b.length) {
                 return false;
             } 
             for (var i = 0, len = a.length; i < len; ++i) {
                 if (a[i] !== b[i]) {
                     return false;
                 }
             }
             return true;
         },
         
         setUp: function () {
             // temporarily replace getComputedStyle with one that doesn't require an instance of IHtmlElement
             this.getComputedStyle = window.getComputedStyle;
             window.getComputedStyle = H.getComputedStyle(getComputedStyle);

            var containerStyle = this.containerStyle;
            function createDiv () { return H.getMockContainerElement("ltr", {}); };
            this._createElements = G.Layout.prototype._createElements;
            G.Layout.prototype._createElements = function () {
                var orientation = this._viewport.getOrientation(),
                    dimensions = this._dimensions = /*@static_cast(Dimension)*/G.Layout._dimension[orientation],
                    wrapper = this._wrapper = createDiv(),
                    canvas = this._canvas = createDiv(),
                    canvasStyle = canvas.style;

                this._leadingStylerEdge = createDiv(),
                this._visibleStylerBlock = createDiv(),
                wrapper.className = "gridStyler";
                canvasStyle[this._orthogonalAttr] = "0px";
                canvasStyle[this._scrollableAttr] = "0px";
                wrapper.style[dimensions.scrollableExtentAttr] = canvasStyle[dimensions.scrollableExtentAttr] = "100%";
                canvasStyle.overflow = "hidden";
                canvasStyle.position = "relative";

                // Add the canvas and canvas' wrapper to the DOM so that DOM width/height calculations work
                wrapper.appendChild(canvas);
                this._containerElement.appendChild(wrapper);
            };
            G.Layout.prototype.coverEmptySpaces = Jx.fnEmpty;

            this._priorReflow = G.Reflow.prototype.reflow;
            G.Reflow.prototype.reflow = G.Reflow.prototype._unanimatedReflow;
         },
         
         tearDown: function () {
            // replace getComputedStyle with old value
            window.getComputedStyle = this.getComputedStyle;
            G.Layout.prototype._createElements = this._createElements;
            P.Animation.disabled = this.animationDisabled;
        }

     };

     var ChildrenHandler = H.ChildrenHandler = function() {
         this.children = [];
     };
     ChildrenHandler.prototype.appendChild = function (child) {
         child.parentNode = this;
         this.children.push(child);
     };

     var DomEventing = H.DomEventing = function () {};
     DomEventing.prototype.addEventListener = function (event, callback) {
         return Jx.addListener(this, event, callback); 
     };

     var ContainerElement = H.ContainerElement = function () {};
     Jx.augment(ContainerElement, DomEventing);
     Debug.Events.define(ContainerElement.prototype, "keydown", "resize", "mousedown", "zoomOnElement");
     
     var Container = H.Container = function (dir, containerStyle) {
         ContainerElement.call(this);
         ChildrenHandler.call(this);

         this.currentStyle = Jx.mix({direction: dir}, containerStyle);
         this.style = {};
         this.clientLeft = 0;
         this.offsetWidth = this.offsetHeight = 540;
     };
     Jx.augment(Container, ContainerElement);
     Jx.augment(Container, ChildrenHandler);

    var ViewportElement = H.ViewportElement = function () {
        ChildrenHandler.call(this);

        this.style = { overflowX: "", overflowY: "" };
        this.clientWidth = 800;
        this.scrollLeft = 0;
    };
    Jx.augment(ViewportElement, DomEventing);
    Jx.augment(ViewportElement, ChildrenHandler);
    Debug.Events.define(ViewportElement.prototype, "scroll");

 })();
