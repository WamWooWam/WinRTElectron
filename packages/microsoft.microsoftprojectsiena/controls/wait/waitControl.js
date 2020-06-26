//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var WaitTransitionDuration = 250,
        WaitEntranceAnimationDelay = 750,
        WaitTransitionTimingIn = "steps(1, start)",
        WaitTransitionTimingOut = "ease-in",
        WaitControlView = WinJS.Class.define(function WaitControlView_ctor(element) {
            this._element = element;
            ko.applyBindings(this._viewModel, element);
            var active = ko.computed(function() {
                    return this._viewModel.active
                }, this);
            active.subscribe(this._handleActiveChanged.bind(this));
            waitHost.addEventListener("animationstart", function() {
                this._viewModel.notifyViewRendered()
            }.bind(this))
        }, {
            _element: null, _viewModel: {get: function() {
                        return AppMagic.context.shellViewModel.wait
                    }}, _handleActiveChanged: function() {
                    if (this._viewModel.active) {
                        var entranceAnimation;
                        entranceAnimation = this._viewModel.skipAnimationDelay ? {
                            delay: 0, duration: WaitTransitionDuration, timing: WaitTransitionTimingIn, property: "opacity", from: 0, to: 1
                        } : {
                            delay: 0, duration: WaitTransitionDuration + WaitEntranceAnimationDelay, keyframe: "wait-entrance-animation", timing: WaitTransitionTimingIn
                        };
                        waitHost.style.display = "block";
                        waitControl.style.opacity = "1";
                        this._element.focus();
                        WinJS.UI.executeAnimation(waitHost, entranceAnimation).then(function() {
                            if (this._viewModel.showCancelButton) {
                                var cancelButton = this._element.querySelector(".cancel-button");
                                cancelButton.focus()
                            }
                            this._viewModel.notifyViewRendered()
                        }.bind(this))
                    }
                    else {
                        var exitAnimation = {
                                delay: 0, duration: WaitTransitionDuration, property: "opacity", timing: WaitTransitionTimingOut, from: 1, to: 0
                            };
                        waitControl.style.opacity = "0";
                        WinJS.UI.executeAnimation(waitControl, exitAnimation).then(function() {
                            waitHost.style.display = "none"
                        })
                    }
                }
        }, {});
    AppMagic.UI.Pages.define("/controls/wait/waitControl.html", WaitControlView)
})();