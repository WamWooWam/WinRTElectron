//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
        RuleButtonPanel = WinJS.Class.derive(AppMagic.Utility.Disposable, function RuleButtonPanel_ctor(doc, entityManager, selectionManager, dataConnectionsVm, loadedPromise, rulePanelsInfo) {
            Contracts.checkValue(doc);
            Contracts.checkValue(entityManager);
            Contracts.checkValue(selectionManager);
            Contracts.checkValue(dataConnectionsVm);
            Contracts.checkValue(loadedPromise);
            Contracts.checkValue(rulePanelsInfo);
            this._document = doc;
            this._entityManager = entityManager;
            this._selectionManager = selectionManager;
            this._rulePanelsInfo = rulePanelsInfo;
            this._categoryButtonsVisible = ko.observable(!1);
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._selectedCategory = ko.observable(PropertyRuleCategory.design);
            this._selectedSelectionBar = ko.observable(PropertyRuleCategory.design);
            this.trackAnonymous(this._selectedCategory.subscribe(function(newValue) {
                Contracts.checkNumber(newValue);
                this._selectedSelectionBar(newValue)
            }, this));
            this._maximumVisibleCategoryButtons = ko.observable(Infinity);
            this._behaviorRuleFlyouts = ko.observableArray();
            this._dataRuleFlyouts = ko.observableArray();
            this._designRuleFlyouts = ko.observableArray();
            this._showRuleFlyoutTrigger = new AppMagic.AuthoringTool.Utility.ViewTrigger({
                invokeHandler: function(rule) {
                    Contracts.checkValue(rule);
                    this._selectedCategory() !== rule.category && this._selectedCategory(rule.category)
                }.bind(this), elementHandler: function(button, buttonElement) {
                        Contracts.checkValue(button);
                        Contracts.checkValue(buttonElement);
                        this._showRuleFlyoutButton = button;
                        this._showRuleFlyoutButtonElement = buttonElement;
                        this._tryShowRuleFlyout()
                    }.bind(this)
            });
            this.track("_overflowBehaviorButtons", ko.computed(function() {
                return this.overflowBehaviorButtons
            }, this));
            this._behaviorOverflowFlyout = new OverflowFlyout(this._overflowBehaviorButtons, this._showOverflowFlyout.bind(this), "behavior", "behaviorOverflowFlyout");
            this.track("_overflowDataButtons", ko.computed(function() {
                return this.overflowDataButtons
            }, this));
            this._dataOverflowFlyout = new OverflowFlyout(this._overflowDataButtons, this._showOverflowFlyout.bind(this), "data", "dataOverflowFlyout");
            this.track("_overflowDesignButtons", ko.computed(function() {
                return this.overflowDesignButtons
            }, this));
            this._designOverflowFlyout = new OverflowFlyout(this._overflowDesignButtons, this._showOverflowFlyout.bind(this), "design", "designOverflowFlyout");
            this.track("_categoryButtonLengths", AppMagic.AuthoringTool.Utility.changingComputed(function() {
                var behaviorButtonLength = this.behaviorButtons.length + (this.overflowBehaviorButtons.length > 0 ? 1 : 0),
                    dataButtonLength = this.dataButtons.length + (this.overflowDataButtons.length > 0 ? 1 : 0),
                    designButtonLength = this.designButtons.length + (this.overflowDesignButtons.length > 0 ? 1 : 0);
                return behaviorButtonLength * 1e4 + dataButtonLength * 100 + designButtonLength
            }, this));
            this.trackAnonymous(this._categoryButtonLengths.subscribe(function() {
                this._raiseCategoryContentChanged()
            }, this));
            this.trackAnonymous(this._selectedCategory.subscribe(function() {
                this._raiseCategoryContentChanged()
            }, this));
            this._eventTracker.add(rulePanelsInfo, "rulepanelsinfochanged", this._handleRulePanelsInfoChanged, this);
            loadedPromise.then(function() {
                this._categoryButtonsVisible(!0)
            }.bind(this))
        }, {
            _document: null, _entityManager: null, _rulePanelsInfo: null, _selectionManager: null, _selectedCategory: null, _selectedSelectionBar: null, _maximumVisibleCategoryButtons: null, _categoryButtonsVisible: null, _categoryAnimationState: "finished", _showRuleFlyoutTrigger: null, _showRuleFlyoutButton: null, _showRuleFlyoutButtonElement: null, _behaviorRuleFlyouts: null, _dataRuleFlyouts: null, _designRuleFlyouts: null, _behaviorOverflowFlyout: null, _dataOverflowFlyout: null, _designOverflowFlyout: null, handleRuleClick: function(button, evt) {
                    Contracts.checkValue(button);
                    Contracts.checkValue(evt);
                    var selection = this._selectionManager.selection,
                        propertyRuleMap = this._rulePanelsInfo.propertyRuleMap;
                    if (button.canShow(propertyRuleMap))
                        switch (button.selectedRule.category) {
                            case PropertyRuleCategory.behavior:
                                this._selectedSelectionBar(PropertyRuleCategory.behavior);
                                new AppMagic.AuthoringTool.ViewModels.BehaviorRuleFlyout(this._document, this._entityManager, this._selectionManager, this._behaviorRuleFlyouts, this._getButtonClickFlyoutAnchor(evt), selection, button.selectedRule);
                                break;
                            case PropertyRuleCategory.data:
                                this._selectedSelectionBar(PropertyRuleCategory.data);
                                new AppMagic.AuthoringTool.ViewModels.DataRuleFlyout(this._document, this._entityManager, this._dataRuleFlyouts, this._getButtonClickFlyoutAnchor(evt), selection, button.property, this._getDataRuleFlyoutConnectionsFunction(), button.selectedRule);
                                break;
                            case PropertyRuleCategory.design:
                                this._selectedSelectionBar(PropertyRuleCategory.design);
                                new DesignRuleFlyout(this._designRuleFlyouts, this._getButtonClickFlyoutAnchor(evt), button.observableRule, button.tabs);
                                break;
                            default:
                                Contracts.check(!1, "Category not supported.");
                                break
                        }
                }, notifyCategoryAnimationState: function(state) {
                    Contracts.check(state === "animating" || state === "finished");
                    this._categoryAnimationState = state;
                    this._tryShowRuleFlyout()
                }, selectCategory: function(categoryName) {
                    Contracts.checkNonEmpty(categoryName);
                    switch (categoryName) {
                        case"behavior":
                            this._selectedCategory(PropertyRuleCategory.behavior);
                            break;
                        case"data":
                            this._selectedCategory(PropertyRuleCategory.data);
                            break;
                        case"design":
                            this._selectedCategory(PropertyRuleCategory.design);
                            break;
                        default:
                            Contracts.check(!1, "Unknown category name.");
                            break
                    }
                }, showOverflow: function(categoryName, data, evt) {
                    Contracts.checkValue(data);
                    Contracts.checkValue(evt);
                    Contracts.checkNonEmpty(categoryName);
                    var anchor = this._getButtonClickFlyoutAnchor(evt);
                    switch (categoryName) {
                        case"behavior":
                            this._behaviorOverflowFlyout.show(anchor);
                            break;
                        case"data":
                            this._dataOverflowFlyout.show(anchor);
                            break;
                        case"design":
                            this._designOverflowFlyout.show(anchor);
                            break;
                        default:
                            Contracts.check(!1, "invalid category");
                            break
                    }
                }, isCategoryExpanded: function(categoryName) {
                    Contracts.checkNonEmpty(categoryName);
                    switch (categoryName) {
                        case"behavior":
                            return this._selectedCategory() === PropertyRuleCategory.behavior || this.behaviorButtons.length + this.overflowBehaviorButtons.length === 1;
                        case"data":
                            return this._selectedCategory() === PropertyRuleCategory.data || this.dataButtons.length + this.overflowDataButtons.length === 1;
                        case"design":
                            return this._selectedCategory() === PropertyRuleCategory.design || this.designButtons.length + this.overflowDesignButtons.length === 1;
                        default:
                            return Contracts.check(!1, "Unknown category name."), !1
                    }
                }, isCategorySelected: function(categoryName) {
                    Contracts.checkNonEmpty(categoryName);
                    switch (categoryName) {
                        case"behavior":
                            return this._selectedCategory() === PropertyRuleCategory.behavior;
                        case"data":
                            return this._selectedCategory() === PropertyRuleCategory.data;
                        case"design":
                            return this._selectedCategory() === PropertyRuleCategory.design;
                        default:
                            return Contracts.check(!1, "Unknown category name."), !1
                    }
                }, isRuleInCategorySelected: function(categoryName) {
                    Contracts.checkNonEmpty(categoryName);
                    switch (categoryName) {
                        case"behavior":
                            return this._selectedSelectionBar() === PropertyRuleCategory.behavior;
                        case"data":
                            return this._selectedSelectionBar() === PropertyRuleCategory.data;
                        case"design":
                            return this._selectedSelectionBar() === PropertyRuleCategory.design;
                        default:
                            return Contracts.check(!1, "Unknown category name."), !1
                    }
                }, isShowingRuleFlyout: function(rule) {
                    return Contracts.checkObject(rule), this._designRuleFlyouts().some(function(flyout) {
                            return Contracts.checkObject(flyout), flyout.rule === rule
                        }) || this._dataRuleFlyouts().some(function(flyout) {
                            return Contracts.checkObject(flyout), flyout.rule === rule
                        }) || this._behaviorRuleFlyouts().some(function(flyout) {
                            return Contracts.checkObject(flyout), flyout.rule === rule
                        })
                }, behaviorButtons: {get: function() {
                        return this._getCategoryButtons("behavior", !1)
                    }}, dataButtons: {get: function() {
                        return this._getCategoryButtons("data", !1)
                    }}, designButtons: {get: function() {
                        return this._getCategoryButtons("design", !1)
                    }}, overflowBehaviorButtons: {get: function() {
                        return this._getCategoryButtons("behavior", !0)
                    }}, overflowDataButtons: {get: function() {
                        return this._getCategoryButtons("data", !0)
                    }}, overflowDesignButtons: {get: function() {
                        return this._getCategoryButtons("design", !0)
                    }}, hasBehaviorButtons: {get: function() {
                        return this.behaviorButtons.length + this.overflowBehaviorButtons.length > 0
                    }}, hasDataButtons: {get: function() {
                        return this.dataButtons.length + this.overflowDataButtons.length > 0
                    }}, hasDesignButtons: {get: function() {
                        return this.designButtons.length + this.overflowDesignButtons.length > 0
                    }}, hasBehaviorErrors: {get: function() {
                        var entity = this._selectionManager.singleVisualOrScreen;
                        return entity ? entity.hasBehaviorErrors : !1
                    }}, hasDataErrors: {get: function() {
                        var entity = this._selectionManager.singleVisualOrScreen;
                        return entity ? entity.hasDataErrors : !1
                    }}, hasDesignErrors: {get: function() {
                        var entity = this._selectionManager.singleVisualOrScreen;
                        return entity ? entity.hasDesignErrors : !1
                    }}, hasBehaviorOverflowErrors: {get: function() {
                        return this._hasErrorsInOverflowProperties(this.overflowBehaviorButtons)
                    }}, hasDataOverflowErrors: {get: function() {
                        return this._hasErrorsInOverflowProperties(this.overflowDataButtons)
                    }}, designOverflowErrorInfo: {get: function() {
                        for (var i = 0, len = this.overflowDesignButtons.length; i < len; i++) {
                            var button = this.overflowDesignButtons[i];
                            if (button.errorInfo.hasErrors)
                                return {
                                        hasErrors: !0, message: button.errorInfo.message
                                    }
                        }
                        return {
                                hasErrors: !1, message: ""
                            }
                    }}, _hasErrorsInOverflowProperties: function(overflowProperties) {
                    Contracts.checkArray(overflowProperties);
                    for (var i = 0, len = overflowProperties.length; i < len; i++) {
                        var hasErrors = overflowProperties[i].selectedRule.hasErrors;
                        if (Contracts.checkBoolean(hasErrors), hasErrors)
                            return !0
                    }
                    return !1
                }, dataOverflowErrorMessage: {get: function() {
                        return this.hasDataOverflowErrors ? this._getErrorsInOverflowProperties(this.overflowDataButtons) : ""
                    }}, behaviorOverflowErrorMessage: {get: function() {
                        return this.hasBehaviorOverflowErrors ? this._getErrorsInOverflowProperties(this.overflowBehaviorButtons) : ""
                    }}, _getErrorsInOverflowProperties: function(overflowProperties) {
                    Contracts.checkArray(overflowProperties);
                    for (var i = 0, len = overflowProperties.length; i < len; i++) {
                        var rule = overflowProperties[i].selectedRule,
                            hasErrors = rule.hasErrors;
                        if (Contracts.checkBoolean(hasErrors), hasErrors)
                            return rule.errorMessage
                    }
                    return ""
                }, behaviorRuleFlyouts: {get: function() {
                        return this._behaviorRuleFlyouts()
                    }}, dataRuleFlyouts: {get: function() {
                        return this._dataRuleFlyouts()
                    }}, designRuleFlyouts: {get: function() {
                        return this._designRuleFlyouts()
                    }}, behaviorOverflowFlyout: {get: function() {
                        return this._behaviorOverflowFlyout
                    }}, dataOverflowFlyout: {get: function() {
                        return this._dataOverflowFlyout
                    }}, designOverflowFlyout: {get: function() {
                        return this._designOverflowFlyout
                    }}, dataCategoryErrorMessage: {get: function() {
                        var entity = this._selectionManager.singleVisualOrScreen;
                        return entity && entity.hasDataErrors ? entity.errorMessage : ""
                    }}, designCategoryErrorMessage: {get: function() {
                        var entity = this._selectionManager.singleVisualOrScreen;
                        return entity && entity.hasDesignErrors ? entity.errorMessage : ""
                    }}, behaviorCategoryErrorMessage: {get: function() {
                        var entity = this._selectionManager.singleVisualOrScreen;
                        return entity && entity.hasBehaviorErrors ? entity.errorMessage : ""
                    }}, maximumVisibleCategoryButtons: {
                    get: function() {
                        return this._maximumVisibleCategoryButtons()
                    }, set: function(value) {
                            Contracts.check(value >= 0);
                            this._maximumVisibleCategoryButtons(value)
                        }
                }, selectedCategory: {get: function() {
                        return this._selectedCategory()
                    }}, showRuleFlyoutTrigger: {get: function() {
                        return this._showRuleFlyoutTrigger
                    }}, _getDataRuleFlyoutConnectionsFunction: function() {
                    return function() {
                            for (var importedConnections = [], iter = this._document.getServices().first(); iter.hasCurrent; iter.moveNext()) {
                                var service = iter.current;
                                service.hasConfig && importedConnections.push({serviceNamespace: service.serviceNamespace})
                            }
                            return importedConnections
                        }.bind(this)
                }, _getEntitySource: function(categoryName) {
                    Contracts.check(categoryName === "behavior" || categoryName === "data" || categoryName === "design");
                    var selection = null,
                        source = AppMagic.AuthoringTool.ViewModels.DesignButtonSource.regular;
                    return this._selectionManager.canvas ? categoryName === "design" && (selection = [this._selectionManager.canvas.owner], source = AppMagic.AuthoringTool.ViewModels.DesignButtonSource.nestedCanvas) : selection = this._selectionManager.selection, {
                            selection: selection, source: source
                        }
                }, _getCategoryButtons: function(categoryName, overflow) {
                    Contracts.check(categoryName === "behavior" || categoryName === "data" || categoryName === "design");
                    Contracts.checkBoolean(overflow);
                    var result = this._getEntitySource(categoryName),
                        ruleButtonManager = this._rulePanelsInfo.ruleButtonManager;
                    return ruleButtonManager && this._categoryButtonsVisible() ? ruleButtonManager.getCategoryButtons(categoryName, this._maximumVisibleCategoryButtons(), overflow, result.source) : []
                }, _getButtonClickFlyoutAnchor: function(evt) {
                    Contracts.checkValue(evt);
                    for (var anchor = evt.target; anchor && !WinJS.Utilities.hasClass(anchor, "button"); )
                        anchor = anchor.parentElement;
                    return Contracts.checkValue(anchor), anchor
                }, _handleRulePanelsInfoChanged: function() {
                    var buttons = {};
                    buttons[PropertyRuleCategory.data] = this.dataButtons;
                    buttons[PropertyRuleCategory.design] = this.designButtons;
                    buttons[PropertyRuleCategory.behavior] = this.behaviorButtons;
                    buttons[this._selectedSelectionBar()].length === 0 && this._tryChangeSelectedCategory(buttons);
                    this._hideActiveFlyouts()
                }, _hideActiveFlyouts: function() {
                    var overflowFlyouts = [this._behaviorOverflowFlyout, this._dataOverflowFlyout, this._designOverflowFlyout],
                        flyouts = this._behaviorRuleFlyouts().concat(this._dataRuleFlyouts(), this._designRuleFlyouts(), overflowFlyouts);
                    flyouts.forEach(function(flyout) {
                        flyout.hide()
                    })
                }, _tryChangeSelectedCategory: function(buttons) {
                    Contracts.checkObject(buttons);
                    for (var categories = [PropertyRuleCategory.design, PropertyRuleCategory.data, PropertyRuleCategory.behavior], i = 0, len = categories.length; i < len; i++) {
                        var category = categories[i],
                            categoryButtons = buttons[category];
                        if (Contracts.checkArray(categoryButtons), categoryButtons.length > 0) {
                            this._selectedCategory(category);
                            this._selectedSelectionBar(category);
                            return
                        }
                    }
                }, _raiseCategoryContentChanged: function() {
                    this.dispatchEvent("categoryContentChanged")
                }, _showOverflowFlyout: function(anchor, categoryName, button) {
                    Contracts.checkValue(anchor);
                    Contracts.checkNonEmpty(categoryName);
                    Contracts.checkValue(button);
                    var result = this._getEntitySource(categoryName);
                    Contracts.checkArray(result.selection, "Must have an entity since we are able to click the overflow flyout button.");
                    var rule = this._rulePanelsInfo.propertyRuleMap[button.propertyName];
                    switch (categoryName) {
                        case"behavior":
                            new AppMagic.AuthoringTool.ViewModels.BehaviorRuleFlyout(this._document, this._entityManager, this._selectionManager, this._behaviorRuleFlyouts, anchor, result.selection, rule);
                            break;
                        case"data":
                            new AppMagic.AuthoringTool.ViewModels.DataRuleFlyout(this._document, this._entityManager, this._dataRuleFlyouts, anchor, result.selection, button.property, this._getDataRuleFlyoutConnectionsFunction(), rule);
                            break;
                        case"design":
                            new DesignRuleFlyout(this._designRuleFlyouts, anchor, button.observableRule, button.tabs);
                            break;
                        default:
                            Contracts.check(!1, "Invalid category.");
                            break
                    }
                }, _tryShowRuleFlyout: function() {
                    this._showRuleFlyoutButton && this._categoryAnimationState === "finished" && (Contracts.checkValue(this._showRuleFlyoutButtonElement), this._showRuleFlyoutButton.selectedRule.isDisposed || this.handleRuleClick(this._showRuleFlyoutButton, {target: this._showRuleFlyoutButtonElement}), this._showRuleFlyoutButton = null, this._showRuleFlyoutButtonElement = null)
                }
        }, {});
    WinJS.Class.mix(RuleButtonPanel, WinJS.Utilities.eventMixin);
    var OverflowFlyout = WinJS.Class.define(function OverflowFlyout_ctor(overflowButtons, showOverflowFlyout, categoryName, flyoutId) {
            Contracts.checkObservable(overflowButtons);
            Contracts.checkFunction(showOverflowFlyout);
            Contracts.checkNonEmpty(categoryName);
            Contracts.checkNonEmpty(flyoutId);
            this._overflowButtons = overflowButtons;
            this._showOverflowFlyout = showOverflowFlyout;
            this._categoryName = categoryName;
            this._flyoutId = flyoutId;
            this._visible = ko.observable(!1)
        }, {
            _overflowButtons: null, _showOverflowFlyout: null, _categoryName: null, _flyoutId: null, _anchor: null, _visible: null, handleItemClick: function(data) {
                    Contracts.checkValue(data);
                    this._showOverflowFlyout(this._anchor, this._categoryName, data)
                }, show: function(anchor) {
                    Contracts.checkValue(anchor);
                    this._anchor = anchor;
                    var element = document.getElementById(this._flyoutId);
                    element && (Contracts.checkValue(element.winControl), element.winControl.show(anchor))
                }, hide: function() {
                    var element = document.getElementById(this._flyoutId);
                    element && (Contracts.checkValue(element.winControl), element.winControl.hide())
                }, overflowButtons: {get: function() {
                        return this._overflowButtons()
                    }}, visible: {get: function() {
                        return this._visible
                    }}
        }, {}),
        DesignRuleFlyout = WinJS.Class.define(function DesignRuleFlyout_ctor(activeFlyouts, anchor, selectedRule, tabs) {
            Contracts.checkObservable(activeFlyouts);
            Contracts.checkValue(anchor);
            Contracts.checkObservable(selectedRule);
            Contracts.checkArray(tabs);
            this._activeFlyouts = activeFlyouts;
            this._selectedRule = selectedRule;
            this._tabs = tabs;
            activeFlyouts.push(this);
            Contracts.checkValue(this._element);
            var presentationValue = selectedRule().presentationValue;
            Contracts.checkDefined(presentationValue);
            presentationValue && presentationValue.notifyBeforeShow();
            this._element.winControl.addEventListener("afterhide", this._handleAfterHide.bind(this));
            this._element.winControl.addEventListener("aftershow", this._handleAfterShow.bind(this));
            this._element.winControl.show(anchor)
        }, {
            _activeFlyouts: null, _selectedRule: null, _element: null, _tabs: null, element: {
                    get: function() {
                        return this._element
                    }, set: function(value) {
                            Contracts.checkDefined(value);
                            this._element = value
                        }
                }, hide: function() {
                    this._element.winControl.hide()
                }, rule: {get: function() {
                        return this._selectedRule()
                    }}, selectRule: function(data) {
                    Contracts.checkValue(data);
                    var rule = this._selectedRule();
                    Contracts.checkValue(rule);
                    Contracts.checkDefined(rule.presentationValue);
                    rule.presentationValue && rule.presentationValue.notifyAfterHide();
                    var newRule = data.rule;
                    Contracts.checkValue(newRule);
                    this._selectedRule(newRule)
                }, tabs: {get: function() {
                        return this._tabs
                    }}, _handleAfterHide: function() {
                    var i = this._activeFlyouts.indexOf(this);
                    Contracts.check(i >= 0);
                    this._activeFlyouts.splice(i, 1);
                    var rule = this._selectedRule();
                    rule.isDisposed || (Contracts.checkDefined(rule.presentationValue), rule.presentationValue && rule.presentationValue.notifyAfterHide())
                }, _handleAfterShow: function() {
                    this._selectedRule().isDisposed && this._element.winControl.hide()
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        RuleButtonPanel: RuleButtonPanel, _DesignRuleFlyout: DesignRuleFlyout
    })
})();