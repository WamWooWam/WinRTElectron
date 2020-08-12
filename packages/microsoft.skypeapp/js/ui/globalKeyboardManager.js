

(function () {
    "use strict";

    var keyboardManager = MvvmJS.Class.define(function () {
        this.backspaceDisabled = ["hub", "login", "loginToSkype", "upgrade", "linkOrCreateAccount", "policyWarning", "logout"];
    }, {
        init: function () {
            this._resolveKey = this._resolveKey.bind(this);
            this._testParent = this._testParent.bind(this);

            
            var inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            inputPane.addEventListener("showing", this._onShowingInputPane.bind(this));
            inputPane.addEventListener("hiding", this._onHidingInputPane.bind(this));
            window.addEventListener("keydown", this._resolveKey);
        },
        
        _onShowingInputPane: function (args) {
            log('keyboardManager: keyboard going up');
            WinJS.Utilities.addClass(document.body, 'KEYBOARDUP');
            Skype.UI.Util.sendEvent("keyboardup", window, { occludedHeight: args.occludedRect.height });
        },

        _onHidingInputPane: function (args) {
            log('keyboardManager: keyboard going down');
            WinJS.Utilities.removeClass(document.body, 'KEYBOARDUP');
            Skype.UI.Util.sendEvent("keyboarddown", window);
        },
             
        _resolveKey: function (args) {
            
            if (this._testParent(document.activeElement)) {
                var scrollTarget = document.querySelector(".page .pagecontrol:not(.HIDDEN) .kb-scrollTarget");
                if (scrollTarget && scrollTarget.getAttribute("data-win-control")) {
                    scrollTarget = scrollTarget.querySelector(".win-viewport");
                };
            }
            if (scrollTarget) {
                var step = 40,
                    offset;
                switch (args.keyCode) {
                    case WinJS.Utilities.Key.home:
                        scrollTarget.scrollLeft = 0;
                        break;
                    case WinJS.Utilities.Key.end:
                        scrollTarget.scrollLeft = scrollTarget.scrollWidth;
                        break;
                    case WinJS.Utilities.Key.leftArrow:
                        offset = (scrollTarget.scrollLeft >= step) ? step : step - scrollTarget.scrollLeft;
                        if (offset > 0) {
                            scrollTarget.scrollLeft = scrollTarget.scrollLeft - offset;
                        }
                        break;
                    case WinJS.Utilities.Key.rightArrow:
                        offset = (scrollTarget.scrollLeft + step <= scrollTarget.scrollWidth) ? step : scrollTarget.scrollWidth - scrollTarget.scrollLeft;
                        if (step > 0) {
                            scrollTarget.scrollLeft = scrollTarget.scrollLeft + offset;
                        }
                        break;
                    case WinJS.Utilities.Key.pageUp:
                        step = scrollTarget.offsetWidth;
                        offset = (scrollTarget.scrollLeft >= step) ? step : step - scrollTarget.scrollLeft;
                        if (offset > 0) {
                            scrollTarget.scrollLeft = scrollTarget.scrollLeft - offset;
                        }
                        break;
                    case WinJS.Utilities.Key.pageDown:
                        step = scrollTarget.offsetWidth;
                        offset = (scrollTarget.scrollLeft + step <= scrollTarget.scrollWidth) ? step : scrollTarget.scrollWidth - scrollTarget.scrollLeft;
                        if (step > 0) {
                            scrollTarget.scrollLeft = scrollTarget.scrollLeft + offset;
                        }
                        break;
                }
            }
            
            switch (args.keyCode) {
                case WinJS.Utilities.Key.enter:
                    if (WinJS.Utilities.hasClass(args.target, "kb-accessible")) { 
                        if (!args.target.getAttribute("win-control")) {
                            args.target.click();
                            args.preventDefault();
                        }
                    }
                    break;
                case WinJS.Utilities.Key.backspace:
                    if (this.backspaceDisabled.indexOf(Skype.Application.state.page.name) === -1 && !WinJS.Utilities.hasClass(document.body, "SUPPRESSPAGENAVIGATION") && !Skype.Application.state.isPeoplePickerOpened) {
                        if (Skype.UI.Util.activeElementCantBeBlured()) {
                            return;
                        } else if ((args.srcElement.parentElement && WinJS.Utilities.hasClass(args.srcElement.parentElement, "win-flyout")) || WinJS.Utilities.hasClass(args.srcElement, "win-flyout")) {
                            return;
                        }
                        Skype.UI.navigateBack();
                    }
                    break;
            }
        },
        
        _testParent: function (element) {
            if (element) {
                if (WinJS.Utilities.hasClass(element, "fragment")) {
                    return true;
                } else if (WinJS.Utilities.hasClass(element, "page")) {
                    return false;
                } else if (element === document.body) {
                    return true;
                } else {
                    return this._testParent(element.parentNode);
                };
            } else {
                return true;
            }
        }
    }, {        
    }, {
        instance: {
            get: function() {
                if (!instance) {
                    instance = new Skype.UI.KeyboardManager();
                }
                return instance;
            }
        },
    });

    var instance;

    WinJS.Namespace.define("Skype.UI", {
        KeyboardManager: keyboardManager
    });
})();