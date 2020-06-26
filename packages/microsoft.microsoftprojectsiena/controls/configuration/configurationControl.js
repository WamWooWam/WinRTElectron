//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ConfigurationControlView = WinJS.Class.define(function ConfigurationControlView_ctor(element) {
            var binding = ko.computed(function() {
                    return this._viewModel
                }, this);
            ko.applyBindings(binding, element);
            this._ruleLists = WinJS.Utilities.query(".ruleList", element);
            this._ruleListCounts = this._ruleLists.length;
            this._lastScrollTops = [];
            for (var i = 0; i < this._ruleListCounts; i++)
                this._lastScrollTops.push(0);
            for (this._mouseWheelHandler = this._handleMouseWheel.bind(this), i = 0; i < this._ruleListCounts; i++)
                this._ruleLists[i].addEventListener("mousewheel", this._mouseWheelHandler, !1);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                for (i = 0; i < this._ruleListCounts; i++)
                    this._ruleLists[i].removeEventListener("mousewheel", this._mouseWheelHandler)
            }.bind(this))
        }, {
            _lastScrollTops: null, _mouseWheelHandler: null, _ruleLists: null, _ruleListCounts: null, _handleMouseWheel: function(evt) {
                    for (var i = 0; i < this._ruleListCounts; i++) {
                        var ruleList = this._ruleLists[i],
                            flyoutContainers = WinJS.Utilities.query(".flyoutContainer", ruleList);
                        if (flyoutContainers.length !== 0)
                            for (var flyoutContainer = flyoutContainers[0], rules = WinJS.Utilities.query(".rule", ruleList), j = 0, len = rules.length; j < len; j++) {
                                var rule = rules[j],
                                    ruleView = rule.viewObject;
                                if (ruleView.editable) {
                                    if (flyoutContainer.contains(evt.target))
                                        return this._handleScrollOnFlyout(flyoutContainer, evt);
                                    this._lastScrollTops[i] !== ruleList.scrollTop && (ruleView.hideFlyout(), this._lastScrollTops[i] = ruleList.scrollTop)
                                }
                            }
                    }
                    return !0
                }, _handleScrollOnFlyout: function(flyoutContainer, evt) {
                    var scrollableElement = this._getScrollableElement(flyoutContainer, evt.target);
                    if (!scrollableElement)
                        return this._preventScroll(evt);
                    var scrollTop = scrollableElement.scrollTop,
                        delta = evt.wheelDelta,
                        height = scrollableElement.offsetHeight,
                        scrollHeight = scrollableElement.scrollHeight;
                    return delta > 0 && scrollTop === 0 || delta < 0 && scrollTop + height === scrollHeight ? this._preventScroll(evt) : !0
                }, _getScrollableElement: function(container, evtTarget) {
                    for (var scrollableElements = WinJS.Utilities.query(".scroll", container), i = 0, scrollsCount = scrollableElements.length; i < scrollsCount; i++) {
                        var scrollableElement = scrollableElements[i];
                        if (scrollableElement.contains(evtTarget))
                            return scrollableElement
                    }
                    return null
                }, _preventScroll: function(evt) {
                    return evt.stopPropagation(), evt.preventDefault(), !1
                }, _viewModel: {get: function() {
                        return AppMagic.context.documentViewModel.configuration
                    }}
        }, {});
    AppMagic.UI.Pages.define("/controls/configuration/configurationControl.html", ConfigurationControlView)
})();