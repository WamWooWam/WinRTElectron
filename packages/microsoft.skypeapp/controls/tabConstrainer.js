



(function () {
    "use strict";

    var tabConstrainer = Skype.UI.Control.define(function (element, options) {

        this.elements = []; 

        this._inside = false; 
        this._insideExternal = false;
        this._isPassed = false;

        this._used = false;

        
        this.startHolder;
        this.startElement;

        this.startElementAlpha;
        this.zoomControl;
        this.zoomedOut = false;

        this.endHolder;
        this.endElement;

        this.startsWithcontrol = false; 

        this.externalTarget = null; 
        this.externalTargetContainer = null; 
        this.externalExit = null;
        this._externalLoopEnd = false;

        this.enabled = false;
        this.isBack = false; 

        this.currentListviewItem; 
        this.firstFocusElement = null; 

        this.init(); 
    }, {
        
        init: function () {
            
            this._constrain = this._constrain.bind(this);
            this._release = this._release.bind(this);
            this._handleExtFocusLoop = this._handleExtFocusLoop.bind(this);
            this._resolveInner = this._resolveInner.bind(this);
            this._resolveOuter = this._resolveOuter.bind(this);
            this._setExternalTargets = this._setExternalTargets.bind(this);
            this._redirectFocus = this._redirectFocus.bind(this);
            this._updateListviewCurrentItem = this._updateListviewCurrentItem.bind(this);
            this.setZoomControl = this.setZoomControl.bind(this);

            this.firstFocusElement = this.element.querySelector(this.options.firstFocusQuery) || null;
            this.hasSelfFocus = this.options.hasSelfFocus || false;

            
            if (this.options.active) {
                this.enable();
            }
        },
        
        enable: function (byNewerInstance) {

            if (!this.enabled && !this.isDisposed && Skype.UI.Util.isHTMLNode(this.element)) {

                
                if (!this.elements || this.elements.length === 0) {
                    this._createPool();
                }

                
                var seZoContainer = this.element.querySelector(".contactList");
                if (seZoContainer) {
                    this.setZoomControl();
                }

                
                if (!this.element.querySelector(".startHolder")) {
                    this.startHolder = document.createElement("div");
                    this.startHolder.className = "startHolder";
                    this.startHolder.style.width = "0px";
                    this.startHolder.style.height = "0px";
                    this.element.appendChild(this.startHolder);
                    if (this.options.ariaLabel == "mePanel") {
                        this.startHolder.setAttribute("aria-label", "aria_me_window_aria_label".translate(lib.myself.getDisplayNameHtml()));
                        this.startHolder.setAttribute("role", "heading");
                    }
                    this.startHolder.tabIndex = 999;
                    
                    this.regEventListener(this.startHolder, "focus", this._redirectFocus);
                }

                
                if (!this.element.querySelector(".endHolder")) {
                    this.endHolder = document.createElement("div");
                    this.endHolder.className = "endHolder";
                    this.endHolder.style.width = "0px";
                    this.endHolder.style.height = "0px";
                    this.element.appendChild(this.endHolder);
                    
                    this.regEventListener(this.endHolder, "focus", this._redirectFocus);
                }

                
                this.on(byNewerInstance);
                this.enabled = true;
            } else {
                return; 
            }
        },
        setZoomControl: function () {
            this.startElementAlpha = this.element.querySelector(".alphabet");
            this.zoomControl = this.element.querySelector("div.zoomContainer");
            this.zoomControl.winControl.addEventListener("zoomchanged", this._handleZoom.bind(this));
            this.zoomedOut = this.zoomControl.winControl.zoomedOut;
        },
        disable: function (byNewerInstance) {
            if (this.enabled) {

                
                this.off(byNewerInstance);

                this.enabled = false; 
                this._used = false; 
                this.externalExit = null;

            }
        },
        on: function (byNewerInstance) {

            
            if (!byNewerInstance) {
                this._addInstance();
                this._disablePrevious();
            }

            
            this.regEventListener(this.element, "keydown", this._resolveInner, 1);
            this.regEventListener(window, "keydown", this._resolveOuter, 1);

            
            

            
            if (this.elements.length > 0) {

                
                this.elements.forEach(this._constrain);

                
                this.endHolder.tabIndex = this.elements.length + 1000;

                
                
                
                if (this.options.externalTargetQuery && this.options.externalExitQuery) {
                    
                    this.externalTargetContainer = document.getElementById("appBar");
                    this.regEventListener(this.externalTargetContainer, "DOMNodeInserted", this._setExternalTargets);
                }

                
                if (this.hasSelfFocus) {
                    this.firstFocusElement = this.element;
                }
                this.focusFirst(); 
            }
        },
        off: function (byNewerInstance) {
            
            this.unregObjectEventListeners(this.element);
            this.unregObjectEventListeners(window);
            this.unregObjectEventListeners(this.startHolder);
            this.unregObjectEventListeners(this.endHolder);

            
            this.elements.forEach(this._release);

            if (!byNewerInstance) {
                
                this._enablePrevious();
                this._removeInstance();
            }

            
            this.element.removeChild(this.endHolder);
            this.element.removeChild(this.startHolder);

        },

        
        _redirectFocus: function (e) {
            if (this.isBack) {
                if (this.externalTarget) {
                    this._isPassed = true;
                    this.externalTarget.focus();
                    e.preventDefault();
                } else {
                    this.focusLast();
                }
            } else {
                if (this.externalTarget) { 
                    this._isPassed = true;
                    this.externalTarget.focus();
                    e.preventDefault();
                } else {
                    this.focusFirst();
                }
            }
        },
        _constrain: function (element, index, array) {
            if (index === 0) {
                this.startElement = element;
            }

            
            element._tabindex = element.tabIndex;
            element.tabIndex = index + 1000;

            if (element.getAttribute("data-win-control")) {
                if (!WinJS.Utilities.hasClass(element, "win-listview")) {
                    element.querySelector(".contacts").tabIndex = 1000;
                    element.querySelector(".alphabet").tabIndex = 1000;
                    this.startElement = element.querySelector(".contacts");
                }
                this.regEventListener(this.startElement, "keyup", this._updateListviewCurrentItem);
                this.startsWithcontrol = true;
            }
        },
        _release: function (element, index, array) {
            
            element.tabIndex = element._tabindex;
        },
        
        _addInstance: function () { 
            if (!Skype.UI.TabConstrainer.instances) {
                Skype.UI.TabConstrainer.instances = [this];
            } else {
                Skype.UI.TabConstrainer.instances.push(this);
            }
        },
        _removeInstance: function () { 
            Skype.UI.TabConstrainer.instances.pop();
        },
        
        _enablePrevious: function () {
            if (Skype.UI.TabConstrainer.instances.length > 1) {
                
                if (Skype.UI.TabConstrainer.instances[Skype.UI.TabConstrainer.instances.length - 2] &&
                    !Skype.UI.TabConstrainer.instances[Skype.UI.TabConstrainer.instances.length - 2].isDisposed &&
                    !Skype.UI.TabConstrainer.instances[Skype.UI.TabConstrainer.instances.length - 2].enabled) {
                    Skype.UI.TabConstrainer.instances[Skype.UI.TabConstrainer.instances.length - 2].enable(true);
                } else {
                    Skype.UI.TabConstrainer.instances.splice(Skype.UI.TabConstrainer.instances.length - 2, 1); 
                    this._enablePrevious();
                }
            }
        },
        _disablePrevious: function () {
            if (Skype.UI.TabConstrainer.instances.length > 1) {
                
                if (Skype.UI.TabConstrainer.instances[Skype.UI.TabConstrainer.instances.length - 2] &&
                    !Skype.UI.TabConstrainer.instances[Skype.UI.TabConstrainer.instances.length - 2].isDisposed &&
                    Skype.UI.TabConstrainer.instances[Skype.UI.TabConstrainer.instances.length - 2].enabled) {
                    Skype.UI.TabConstrainer.instances[Skype.UI.TabConstrainer.instances.length - 2].disable(true);
                } else {
                    Skype.UI.TabConstrainer.instances.splice(Skype.UI.TabConstrainer.instances.length - 2, 1); 
                    this._disablePrevious();
                }
            }
        },
        _updateListviewCurrentItem: function (e) {
            if (e.keyCode >= 37 && e.keyCode <= 40 && this.startElement.winControl) { 
                var currentItem = this.startElement.winControl.currentItem;
                if (currentItem && typeof (currentItem) !== "undefined" && currentItem.type !== "groupHeader") {
                    this.currentListviewItem = currentItem;
                }
            }
        },
        focusFirst: function () {
            if (this.firstFocusElement) {
                this.firstFocusElement.focus();
                this.firstFocusElement = null; 
            } else if (this.startsWithcontrol && this.startElement.winControl) {
                var firstItem;
                if (this.zoomedOut) { 
                    firstItem = this.startElementAlpha.winControl.currentItem; 
                    if (firstItem && typeof (firstItem) !== "undefined") {
                        firstItem.showFocus = true;
                        firstItem.hasFocus = true;
                        this.startElementAlpha.winControl.currentItem = firstItem;
                        this.startElementAlpha.winControl.ensureVisible(firstItem.index);
                    }
                } else {
                    firstItem = this.startElement.winControl.currentItem;
                    if (firstItem && typeof (firstItem) !== "undefined") {
                        if (firstItem.type !== "groupHeader") {
                            firstItem.showFocus = true;
                            firstItem.hasFocus = true;
                            this.startElement.winControl.currentItem = firstItem;
                            this.startElement.winControl.ensureVisible(firstItem.index);
                            this.currentListviewItem = firstItem;
                        } else {
                            if (!this.currentListviewItem || typeof (this.currentListviewItem) === "undefined") {
                                this.currentListviewItem = this.startElement.winControl.itemDataSource.list.getItem(1).data;
                                this.currentListviewItem.index;
                            }
                            if (this.currentListviewItem && typeof (this.currentListviewItem) !== "undefined") {
                                this.startElement.winControl.currentItem = this.currentListviewItem;
                                this.startElement.winControl.ensureVisible(this.currentListviewItem.index);
                            }
                        }
                    }
                }
            } else {
                this.startElement.focus();
            }
        },
        focusLast: function () {
            var lastElement = this.elements[this.elements.length - 1];
            if (lastElement) {
                lastElement.focus();
            }
        },
        _resolveInner: function (e) {
            if (e.keyCode === WinJS.Utilities.Key.tab && !Skype.UI.TabConstrainer.suppressed) {
                
                if (e.shiftKey) {
                    this.isBack = true;
                } else {
                    this.isBack = false;
                }
                this._inside = true;
                if (document.activeElement.tabIndex < 999 && !this.isBack) { 
                    if (this.startElement) {
                        this.startElement.focus();
                    } else {
                        this.startHolder.focus();
                    }
                }
            }
        },
        _resolveOuter: function (e) {
            
            if (e.keyCode === WinJS.Utilities.Key.tab) {

                if (!Skype.UI.TabConstrainer.suppressed) {
                    if (!this._inside && !this.externalTarget) {
                        e.preventDefault();
                        if (this.elements.length > 0) {
                            
                            if (e.shiftKey) {
                                this.focusLast();
                            } else {
                                this.focusFirst();
                            }
                        }
                    }
                    this._inside = false;
                }
            }
        },
        _handleExtFocusLoop: function (e) {
            if (this._isPassed) {
                this._isPassed = false; 
                e.preventDefault();
            } else {
                this._externalLoopEnd = true;
                if (this.isBack) {
                    this.focusLast();
                } else {
                    this.focusFirst();
                }
                this._externalLoopEnd = false;
            }
        },
        _createPool: function () {
            
            if (Skype.UI.Util.isHTMLNode(this.element)) {
                this.elements = Array.prototype.slice.call(this.element.querySelectorAll(".tab-accessible[tabindex]"), 0);
                this.elements.sort(this._sortByIndex);
            }
        },
        _sortByIndex: function (a, b) {
            return parseInt(a.tabIndex) - parseInt(b.tabIndex);
        },
        _setExternalTargets: function (e) { 
            this.externalTarget = document.querySelector(this.options.externalTargetQuery);
            this.externalExit = document.querySelector(this.options.externalExitQuery);
            if (this.externalTarget && this.externalExit) {
                this.unregEventListener(e.relatedNode, "DOMNodeInserted", this._setExternalTargets);
            }
        },
        _handleZoom: function (e) {
            this.zoomedOut = this.zoomControl.winControl.zoomedOut;
            var firstItem;
            if (!this.zoomedOut) {
                firstItem = this.startElement.winControl.currentItem; 
                if (firstItem) {
                    firstItem.showFocus = true;
                    firstItem.hasFocus = true;
                    this.startElement.winControl.currentItem = firstItem;
                    this.startElement.winControl.ensureVisible(firstItem.index);
                    this.currentListviewItem = firstItem;
                }
            } else {
                firstItem = this.startElementAlpha.winControl.currentItem; 
                if (firstItem) {
                    firstItem.showFocus = true;
                    firstItem.hasFocus = true;
                    this.startElementAlpha.winControl.currentItem = firstItem;
                    this.startElementAlpha.winControl.ensureVisible(firstItem.index);
                }
            }
        }

    }, { 
        instances: [], 
        suppressed: false 
    });

    
    tabConstrainer.isDeclarativeControlContainer = false;

    WinJS.Namespace.define("Skype.UI", {
        TabConstrainer: tabConstrainer
    });

})();