

(function () {
    "use strict";

    var instance; 

    var helpBubbles = Skype.UI.Control.define(function(element) {
        this.element = element;
        this.init();
    }, {
        _vm: null,
        _template: null,
        _container: null,

        init: function () {
            this._vm = new Skype.ViewModel.HelpBubblesVM();

            this.regEventListener(this._vm, Skype.ViewModel.HelpBubblesVM.Events.ADD_BUBBLE, this._createBubbleHTML.bind(this));
            this.regEventListener(this._vm, Skype.ViewModel.HelpBubblesVM.Events.REMOVE_BUBBLES, this._removeBubbleHTML.bind(this));
            
            this.regEventListener(document, "mouseup", this._onClick.bind(this), true);
            this.regEventListener(window, "resize", this._onResized.bind(this));

            this.regEventListener(this.element, "animationend", this._onBubbleAnimationEnd.bind(this), true);

            this._template = this.element.querySelector(".template");
            this._container = this.element.querySelector(".bubbles");
        },

        _onResized: function () {
            this._removeBubbleHTML();
        },

        _onClick: function (evt) {
            this._dismissActiveBubble();
        },

        
        _onBubbleAnimationEnd: function (e) {
            if (e.animationName == "helpBubbleOut") {
                this._removeBubbleHTML();
                this._vm.bubbleAnimationEnd();
            }
        },

        _removeBubbleHTML: function () {
            Skype.UI.Util.empty(this._container);
        },
        
        _dismissActiveBubble: function () {
            if (WinJS.UI.isAnimationEnabled()) {
                var bubbleDiv = this._container.querySelector("div.helpBubble");
                bubbleDiv && WinJS.Utilities.addClass(bubbleDiv, "ANIMATE_OUT");
            } else {
                this._vm.bubbleAnimationEnd();
            }
        },

        onDispose: function() {
            this._removeBubbleHTML();
        },

        _createBubbleHTML: function (e) {
            var bubble = e.detail;

            var data = WinJS.Binding.as({
                text: bubble.text.translate(),
                aria: bubble.aria.translate()
            });

            this._template.winControl.render(data).done(function (div) {
                var bubbleDiv = div.querySelector("div.helpBubble");
                WinJS.Utilities.addClass(bubbleDiv, bubble.id.toUpperCase());
                this._container.appendChild(bubbleDiv);
            }.bind(this));
        } 
    });
    WinJS.Namespace.define("Skype.UI.HelpBubbles", {
	    Control: helpBubbles
	});
})();