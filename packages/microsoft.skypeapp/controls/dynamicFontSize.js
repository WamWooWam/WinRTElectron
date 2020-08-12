




(function () {
    "use strict";

    var dynamicFontSize = Skype.UI.Control.define(function (element, options) {
        this.options = options || {
            "steps": { 
                20: "FONT-MEDIUM",
                40: "FONT-SMALL"
            },
            "observe": false, 
            "automeasure": false, 
            
            "custom": false
        };
        this.minLenght;
        this.textLength;
        this.arrSteps = [];
        this.currentStepClass = "";
        this.init();
    }, {
        init: function () {
            if (this.options.steps) {
                this.handleTextUpdate = this.handleTextUpdate.bind(this);
                this.handleDynamicTextUpdate = this.handleDynamicTextUpdate.bind(this);
                this.arrSteps = Object.keys(this.options.steps).sort(this.compareNumbers);
                this.minLength = parseInt(this.arrSteps[0]);
                this.maxLength = parseInt(this.arrSteps[this.arrSteps.length - 1]);
                if (this.options.automeasure) {
                    this.handleDynamicTextUpdate();
                    if (this.options.observe) {
                        if (this.options.custom) {
                            this.regEventListener(this.element, "customDOMChange", this.handleDynamicTextUpdate);
                        } else {
                            this.regEventListener(this.element, "DOMCharacterDataModified", this.handleDynamicTextUpdate);
                        }
                    }
                } else {
                    this.handleTextUpdate();
                    if (this.options.observe) {
                        this.regEventListener(this.element, "DOMCharacterDataModified", this.handleTextUpdate);
                    }
                }
            }
        },
        handleDynamicTextUpdate: function (depth) {
            this.getLength();
            depth = isNaN(depth) ? 0 : depth;
            if (this.checkOverflow(this.element) && (depth < this.arrSteps.length)) {
                this.replaceFontClass(this.options.steps[this.arrSteps[depth]]);
                if (this.checkOverflow(this.element)) {
                    depth++;
                    this.handleDynamicTextUpdate(depth);
                }
            } else if (depth == 0 && this.currentStepClass != "") { 
                WinJS.Utilities.removeClass(this.element, this.currentStepClass);
            };
        },
        handleTextUpdate: function () {
            this.getLength();
            if (this.textLength >= this.minLength) { 
                if (this.textLength >= this.maxLength) { 
                    this.replaceFontClass(this.options.steps[this.arrSteps[this.arrSteps.length - 1]]);
                } else {
                    this.setFontClass();
                }
            } else if (this.currentStepClass.length > 0) { 
                WinJS.Utilities.removeClass(this.element, this.currentStepClass);
                this.currentStepClass = "";
            }
        },
        getLength: function () {
            this.textLength = this.element.innerText.length;
        },
        setFontClass: function () {
            for (var i = 0; i < this.arrSteps.length - 1; i++) {
                if (parseInt(this.arrSteps[i + 1]) > this.textLength) {
                    this.replaceFontClass(this.options.steps[this.arrSteps[i]]);
                    break;
                }
            }
        },
        replaceFontClass: function (className) {
            if (this.currentStepClass != className) { 
                (this.options.observe || this.options.automeasure) && WinJS.Utilities.removeClass(this.element, this.currentStepClass);
                this.currentStepClass = className;
                WinJS.Utilities.addClass(this.element, className);
            };
        },
        
        
        checkOverflow: function (el) {
            var isOverflowing = el.clientWidth < el.scrollWidth;
            
            return isOverflowing;
        },
        compareNumbers: function(a, b) {
            return parseInt(a) - parseInt(b);
        }
    });
    WinJS.Namespace.define("Skype.UI", {
        DynamicFontSize: dynamicFontSize
    });
})();