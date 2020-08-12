

(function () {
    "use strict";

    var Configuration = {
        DELAY_ON_NAVIGATION: 2000, 
        DELAY_AFTER_PREVIOUS_BUBBLE_FADE_OUT: 500, 
    };

    var Events = {
        ADD_BUBBLE: "addBubble",
        REMOVE_BUBBLES: "removeBubbles"
    };

    var helpBubblesVM = MvvmJS.Class.define(function () {
        this._init();
    }, {
        _delayTimeoutId: null,

        _init: function () {
            this.regEventListener(Skype.Application.state, "navigated", this._onNavigated.bind(this));

            this.regBind(Skype.Application.state.view, "orientation", this._onViewOrientationChanged.bind(this));

            this.regBind(Skype.Application.state, "isAppBarOpened", this._onModalControlOpened.bind(this));
            this.regBind(Skype.Application.state, "isPeoplePickerOpened", this._onModalControlOpened.bind(this));
            this.regBind(Skype.Application.state, "isMePanelOpened", this._onModalControlOpened.bind(this));

            
            this._onNavigated();
        },

        
        bubbleAnimationEnd: function () {
            this.unregTimeout(this._delayTimeoutId);
            this._delayTimeoutId = this.regTimeout(this._updateBubbles.bind(this), Configuration.DELAY_AFTER_PREVIOUS_BUBBLE_FADE_OUT);
        },

        _onNavigated: function () {
            this.unregTimeout(this._delayTimeoutId);
            this._delayTimeoutId = this.regTimeout(this._updateBubbles.bind(this), Configuration.DELAY_ON_NAVIGATION);
        },

        _onViewOrientationChanged: function (orientation) {
            if (orientation == WinJS.UI.Orientation.vertical) {
                this.dispatchEvent(Events.REMOVE_BUBBLES);
            }
        },

        _onModalControlOpened: function (opened) {
            if (opened) {
                this.dispatchEvent(Events.REMOVE_BUBBLES);
            }
        },

        _updateBubbles: function () {
            this.dispatchEvent(Events.REMOVE_BUBBLES);

            
            if (Skype.Application.state.view.orientation == WinJS.UI.Orientation.vertical) {
                log("no help bubbles - vertical layout");
                return;
            }

            
            if (Skype.Application.state.isAppBarOpened || Skype.Application.state.isPeoplePickerOpened || Skype.Application.state.isMePanelOpened) {
                log("no help bubbles - modal control open");
                return;
            }

            var bubbles = Skype.Model.HelpBubbles.BubblesByPage[Skype.Application.state.page.name];
            if (bubbles) {
                this._showNextHelpBubble(bubbles);
            }
        },

        _showNextHelpBubble: function (bubbles) {
            
            for (var i = 0; i < bubbles.length; i++) {
                var bubble = bubbles[i];
                if (!Skype.Model.HelpBubbles.isShown(bubble)) {
                    Skype.Model.HelpBubbles.setShown(bubble, true);

                    this.dispatchEvent(Events.ADD_BUBBLE, bubble);
                    return;
                }
            }
        },
    }, {
        
    }, {
        Events: Events,
        Configuration: Configuration
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        HelpBubblesVM: WinJS.Class.mix(helpBubblesVM, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });
}());

