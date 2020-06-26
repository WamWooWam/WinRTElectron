//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var categoryNum = 3,
        PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
        util = AppMagic.Utility,
        ConfigurationControlWidths = {
            collapsed: 0, normal: 480
        },
        ConfigurationVisibility = {
            collapsed: "collapsed", normal: "normal", verify: function(value){}
        },
        ConfigurationLayoutState = {
            collapsed: "collapsed", hidden: "hidden", visible: "visible", verify: function(value){}
        },
        ConfigurationViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function ConfigurationViewModel_ctor(selectionManager, smallLayout, gallery, rulePanelsInfo) {
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._controlGallery = gallery;
            this._selectionManager = selectionManager;
            this._rulePanelsInfo = rulePanelsInfo;
            this._smallLayout = smallLayout;
            this._renderedOnce = ko.observable(!1);
            this._visibility = ko.observable(ConfigurationVisibility.collapsed);
            this.track("_ruleCategories", ko.computed(function() {
                var categories = this._rulePanelsInfo.ruleCategories;
                return [categories[PropertyRuleCategory.behavior], categories[PropertyRuleCategory.data], categories[PropertyRuleCategory.design]]
            }, this));
            this.track("_ruleFilter", ko.computed(function() {
                var ruleFilter = this._rulePanelsInfo.ruleFilter;
                return ruleFilter
            }, this));
            this.track("_ruleFilterView", ko.computed(function() {
                return this._ruleFilter().view
            }, this));
            this._focusRuleTrigger = new AppMagic.AuthoringTool.Utility.ViewTrigger({elementHandler: function(rule, ruleElement) {
                    ruleElement.viewObject ? ruleElement.viewObject.setEditable() : ruleElement.winControl.viewReady = function() {
                        ruleElement.viewObject.setEditable()
                    }
                }});
            this._scrollIntoViewTrigger = new AppMagic.AuthoringTool.Utility.ViewTrigger({elementHandler: function(rule, ruleElement) {
                    ruleElement.viewObject ? ruleElement.viewObject.scrollIntoView() : ruleElement.winControl.viewReady = function() {
                        ruleElement.viewObject.scrollIntoView()
                    }
                }});
            this._collapsedCategories = [];
            this._collapsedCategories[PropertyRuleCategory.behavior] = ko.observable(!0);
            this._collapsedCategories[PropertyRuleCategory.data] = ko.observable(!0);
            this._collapsedCategories[PropertyRuleCategory.design] = ko.observable(!0);
            this._eventTracker.add(selectionManager, "visualschanged", this._onSelectionChanged, this);
            this._eventTracker.add(selectionManager, "screenchanged", this._onSelectionChanged, this)
        }, {
            _collapsedCategories: null, _controlGallery: null, _focusRuleTrigger: null, _renderedOnce: null, _ruleCategories: null, _ruleFilter: null, _selectionManager: null, _rulePanelsInfo: null, _smallLayout: null, _visibility: null, _onSelectionChanged: function() {
                    this._ruleFilter().resetEditable()
                }, collapsedCategories: {get: function() {
                        return this._collapsedCategories
                    }}, changeCategoryView: function(categoryId) {
                    var isCollapsed = this._collapsedCategories[categoryId]();
                    this._collapsedCategories[categoryId](!isCollapsed)
                }, configurationCtrlCssWidth: {get: function() {
                        return this.configurationCtrlWidth.toString() + "px"
                    }}, configurationCtrlWidth: {get: function() {
                        var width = 0;
                        return this.layoutState !== ConfigurationLayoutState.collapsed && (width = ConfigurationControlWidths[this._visibility()]), width
                    }}, cssVisibility: {get: function() {
                        return this.layoutState === ConfigurationLayoutState.visible ? "visible" : "hidden"
                    }}, ensureExpandedView: function(categoryId) {
                    this._collapsedCategories[categoryId]() && this._collapsedCategories[categoryId](!1)
                }, ensureVisible: function() {
                    this._visibility() === ConfigurationVisibility.collapsed && this.toggleVisibility()
                }, ensureHidden: function() {
                    this._visibility() === ConfigurationVisibility.normal && this._visibility(ConfigurationVisibility.collapsed)
                }, focusRuleTrigger: {get: function() {
                        return this._focusRuleTrigger
                    }}, scrollIntoViewTrigger: {get: function() {
                        return this._scrollIntoViewTrigger
                    }}, getHasMoreErrors: function(categoryId) {
                    for (var i = 0, len = this._selectionManager.selection.length; i < len; i++) {
                        var entity = this._selectionManager.selection[i];
                        switch (categoryId) {
                            case PropertyRuleCategory.behavior:
                                if (entity.hasMoreBehaviorErrors)
                                    return !0;
                                break;
                            case PropertyRuleCategory.data:
                                if (entity.hasMoreDataErrors)
                                    return !0;
                                break;
                            case PropertyRuleCategory.design:
                                if (entity.hasMoreDesignErrors)
                                    return !0;
                                break;
                            default:
                                break
                        }
                    }
                    return !1
                }, renderedOnce: {get: function() {
                        return this._renderedOnce()
                    }}, ruleCategories: {get: function() {
                        return this._ruleCategories()
                    }}, ruleFilter: {get: function() {
                        return this._ruleFilter()
                    }}, resume: function(suspendState) {
                    this._visibility(suspendState.visibility);
                    suspendState.visibility !== ConfigurationVisibility.collapsed && this._renderedOnce(!0)
                }, suspend: function(suspendState) {
                    suspendState.visibility = this._visibility()
                }, visibility: {get: function() {
                        return this._visibility()
                    }}, toggleVisibility: function() {
                    var visibility = this._visibility();
                    switch (visibility) {
                        case ConfigurationVisibility.collapsed:
                            this._visibility(ConfigurationVisibility.normal);
                            this._renderedOnce(!0);
                            break;
                        case ConfigurationVisibility.normal:
                            this._controlGallery.visible || this._visibility(ConfigurationVisibility.collapsed);
                            break;
                        default:
                            break
                    }
                    this._controlGallery.visible = !1
                }, layoutState: {get: function() {
                        return this._visibility() === ConfigurationVisibility.collapsed ? ConfigurationLayoutState.collapsed : this._controlGallery.visible ? ConfigurationLayoutState.hidden : ConfigurationLayoutState.visible
                    }}
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        ConfigurationLayoutState: ConfigurationLayoutState, ConfigurationViewModel: ConfigurationViewModel, ConfigurationVisibility: ConfigurationVisibility
    })
})();