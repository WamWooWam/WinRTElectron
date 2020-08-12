

(function () {
    "use strict";

    var Configuration = {
        HELP_SHOWN_TIMES_KEY: "UI/General/Bubbles/{0}"
    };

    
    var Bubbles = {
        
        AddContact: {
            id: "addcontact",
            text: "helpbubble_hub_addcontact",
            aria: "helpbubble_hub_addcontact_live_aria",
        },
        AppBar: {
            id: "appbar",
            text: "helpbubble_hub_appbar",
            aria: "helpbubble_hub_appbar_aria",
        },
    };

    
    var BubblesByPage = {
        "hub": [Bubbles.AddContact, Bubbles.AppBar]
    };

    function isShown(bubble) {
        if (lib && lib.setup) {
            return lib.setup.getInt(Configuration.HELP_SHOWN_TIMES_KEY.format(bubble.id), 0) > 0;
        } else {
            return false;
        }
    }

    function setShown(bubble, value) {
        if (lib && lib.setup) {
            lib.setup.setInt(Configuration.HELP_SHOWN_TIMES_KEY.format(bubble.id), value ? 1 : 0);
        }
    }

    function allBubblesShown() {
        for (var key in Bubbles) {
            if (!isShown(Bubbles[key])) {
                return false;
            }
        }
        return true;
    }

    WinJS.Namespace.define("Skype.Model", {
        HelpBubbles: {
            Configuration: Configuration,
            Bubbles: Bubbles,
            BubblesByPage: BubblesByPage,

            
            isShown: isShown,
            setShown: setShown,

            
            allBubblesShown: allBubblesShown
        }
    });
}());

