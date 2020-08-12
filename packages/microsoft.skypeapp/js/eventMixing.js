

(function () {
    "use strict";

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    var HierarchicalEvent = WinJS.Class.define(function () {
    }, {
        stopped: false,

        stopPropagation: function () {
            this.stopped = true;
        },
    });

    var hierarchicalMix = WinJS.Class.define(function () { }, {

        _childNodes: null,
        _parentNode: null,

        addChildNode: function (childNode) {
            
            
            
            
            
            

            this._childNodes = this._childNodes || [];
            this._childNodes.push(childNode);
            childNode._parentNode = this;
        },

        registerCaptureEvent: function (/*@static_cast(string)*/eventName, handler) {
            
            
            
            
            
            

            this.regEventListener(this, eventName, handler);
        },

        dispatchChildEvent: function (/*@static_cast(string)*/eventName, detail) {
            
            
            
            
            
            
            
            
            

            if (!this._childNodes) {
                return;
            }
            detail = detail || {};

            this._childNodes.forEach(function (child) {
                detail.event = new HierarchicalEvent();
                if (child.dispatchEvent) {
                    child.dispatchEvent(eventName, detail);
                }
                if (!detail.event.stopped && child.dispatchChildEvent) {
                    child.dispatchChildEvent(eventName, detail);
                }
            }.bind(this));
        },
    });

    WinJS.Namespace.define("Skype.Model", {
        HierarchicalMix: WinJS.Class.mix(hierarchicalMix, WinJS.Utilities.eventMixin),
        hierarchicalMixin: hierarchicalMix.prototype,
    });

}());
