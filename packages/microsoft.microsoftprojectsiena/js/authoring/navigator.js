//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var appView = Windows.UI.ViewManagement.ApplicationView,
        nav = WinJS.Navigation;
    WinJS.Namespace.define("AppMagic.AuthoringTool", {Navigator: WinJS.Class.define(function PageControlNavigator(element, options) {
            this._element = element || document.createElement("div");
            this._element.appendChild(this._createPageElement());
            this.home = options.home;
            this._lastViewstate = appView.value;
            nav.onnavigated = this._navigated.bind(this);
            window.onresize = this._resized.bind(this);
            AppMagic.AuthoringTool.navigator = this
        }, {
            home: "", _element: null, _lastNavigationPromise: WinJS.Promise.as(), _lastViewstate: 0, pageControl: {get: function() {
                        return this.pageElement && this.pageElement.winControl
                    }}, pageElement: {get: function() {
                        return this._element.firstElementChild
                    }}, _createPageElement: function() {
                    var element = document.createElement("div");
                    return element.style.width = "100%", element.style.height = "100%", element
                }, _getAnimationElements: function() {
                    return this.pageControl && this.pageControl.getAnimationElements ? this.pageControl.getAnimationElements() : this.pageElement
                }, _navigated: function(args) {
                    var newElement = this._createPageElement(),
                        parentedComplete,
                        parented = new WinJS.Promise(function(c) {
                            parentedComplete = c
                        });
                    this._lastNavigationPromise.cancel();
                    this._lastNavigationPromise = WinJS.Promise.timeout().then(function() {
                        return WinJS.UI.Pages.render(args.detail.location, newElement, args.detail.state, parented)
                    }).then(function parentElement(control) {
                        var oldElement = this.pageElement;
                        oldElement.winControl && oldElement.winControl.unload && oldElement.winControl.unload();
                        this._element.appendChild(newElement);
                        this._element.removeChild(oldElement);
                        oldElement.innerText = "";
                        parentedComplete();
                        WinJS.UI.Animation.enterPage(this._getAnimationElements()).done();
                        var rootGrid = document.getElementById("rootGrid");
                        var configurationHost = document.getElementById("configurationHost");
                        WinJS.Utilities.addClass(rootGrid, "expanded");
                        WinJS.UI.Animation.showPanel(configurationHost);
                        this._updateAppBars(!1)
                    }.bind(this));
                    args.detail.setPromise(this._lastNavigationPromise)
                }, _resized: function(args) {
                    this.pageControl && this.pageControl.updateLayout && this.pageControl.updateLayout.call(this.pageControl, this.pageElement, appView.value, this._lastViewstate);
                    this._lastViewstate = appView.value
                }, _updateAppBars: function(isDisabled) {
                    AppMagic.context.documentViewModel.commandBar.visible = !isDisabled
                }
        })})
})();