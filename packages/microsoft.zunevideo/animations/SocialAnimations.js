/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    WinJS.Namespace.define("MS.Entertainment.Animations.Social", {
        enableChatBubbleFade: function enableTextContainerFade(container) {
            if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled)
                if (!WinJS.Utilities.hasClass(container, "hideFromDisplay"))
                    WinJS.Utilities.addClass(container, "hideFromDisplay")
        }, fadeInContainer: function fadeInContainer(container) {
                return MS.Entertainment.Animations.Social._fadeContainer(container, true)
            }, fadeOutContainer: function fadeOutContainer(container) {
                return MS.Entertainment.Animations.Social._fadeContainer(container, false)
            }, _fadeContainer: function _fadeContainer(container, fadeIn) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var transitionEnd = function(event) {
                        container.removeEventListener("transitionend", transitionEnd, false);
                        completion()
                    };
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    if (fadeIn && WinJS.Utilities.hasClass(container, "hideFromDisplay")) {
                        container.addEventListener("transitionend", transitionEnd, false);
                        WinJS.Utilities.addClass(container, "chatBubbleFadeIn");
                        WinJS.Utilities.removeClass(container, "hideFromDisplay")
                    }
                    else if (!fadeIn) {
                        WinJS.Utilities.addClass(container, "hideFromDisplay");
                        WinJS.Utilities.removeClass(container, "chatBubbleFadeIn");
                        completion()
                    }
                }
                else {
                    if (fadeIn)
                        WinJS.Utilities.removeClass(container, "hidden");
                    else
                        WinJS.Utilities.addClass(container, "hidden");
                    completion()
                }
                return promise
            }
    })
})()
