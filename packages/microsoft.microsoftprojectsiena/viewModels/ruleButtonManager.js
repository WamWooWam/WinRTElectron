//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var PropertyGroup = Microsoft.AppMagic.Authoring.PropertyGroup,
        PropertyHelperUI = Microsoft.AppMagic.Authoring.PropertyHelperUI,
        PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
        GroupComparator = AppMagic.Utility.propertyGroupComparator,
        DesignButtonSource = {
            regular: "regular", nestedCanvas: "nestedCanvas", verify: function(value){}
        },
        _propertyComparator = function(a, b) {
            var idxA = a.property.commandBar.position,
                idxB = b.property.commandBar.position;
            return idxA === -1 && idxB === -1 ? a.propertyName.localeCompare(b.propertyName) : idxA === -1 ? 1 : idxB === -1 ? -1 : idxA - idxB
        },
        RuleButtonManager = WinJS.Class.define(function RuleButtonManager_ctor(propertyRuleMap) {
            this._propertyRuleMap = propertyRuleMap;
            this._behaviorButtons = [];
            this._dataButtons = [];
            this._designButtons = [];
            this._designNestedCanvasButtons = [];
            this._overflowBehaviorButtons = [];
            this._overflowDataButtons = [];
            this._overflowDesignButtons = [];
            this._createBehaviorAndDataButtons(propertyRuleMap);
            this._createPropertyValueMap(propertyRuleMap);
            this._createDesignButtons(propertyRuleMap);
            this._createDesignNestedCanvasButtons(propertyRuleMap)
        }, {
            _propertyRuleMap: null, _propertyValueMap: null, _behaviorButtons: null, _dataButtons: null, _designButtons: null, _designNestedCanvasButtons: null, _overflowBehaviorButtons: null, _overflowDataButtons: null, _overflowDesignButtons: null, getCategoryButtons: function(categoryName, maximumVisible, overflow, designButtonSource) {
                    var buttons = [],
                        overflowButtons = [];
                    switch (categoryName) {
                        case"behavior":
                            buttons = this._behaviorButtons;
                            overflowButtons = this._overflowBehaviorButtons;
                            break;
                        case"data":
                            buttons = this._dataButtons;
                            overflowButtons = this._overflowDataButtons;
                            break;
                        case"design":
                            var designButtons = this._getDesignButtons(designButtonSource);
                            buttons = designButtons.buttons;
                            overflowButtons = designButtons.overflowButtons;
                            break;
                        default:
                            break
                    }
                    var overflowVisible = overflowButtons.length > 0 || buttons.length > maximumVisible;
                    return overflowVisible && maximumVisible--, overflow ? (buttons = overflowButtons.concat(buttons.slice(maximumVisible, buttons.length)), categoryName === "design" ? buttons.sort(GroupComparator) : buttons.sort(_propertyComparator)) : buttons = buttons.slice(0, maximumVisible), buttons
                }, _getDesignButtons: function(source) {
                    DesignButtonSource.verify(source);
                    switch (source) {
                        case DesignButtonSource.regular:
                            return {
                                    buttons: this._designButtons, overflowButtons: this._overflowDesignButtons
                                };
                        case DesignButtonSource.nestedCanvas:
                            return {
                                    buttons: this._designNestedCanvasButtons, overflowButtons: []
                                };
                        default:
                            return {}
                    }
                }, notifyPropertyChanged: function(propertyName, newValue) {
                    for (var i = 0, len = this._designButtons.length; i < len; i++)
                        if (this._designButtons[i].tryChangePropertyValue(propertyName, newValue))
                            return;
                    for (i = 0, len = this._designNestedCanvasButtons.length; i < len; i++)
                        if (this._designNestedCanvasButtons[i].tryChangePropertyValue(propertyName, newValue))
                            return
                }, getDesignTabValue: function(propertyName) {
                    for (var i = 0, len = this._designButtons.length; i < len; i++) {
                        var value = this._designButtons[i].tryGetPropertyValue(propertyName);
                        if (value)
                            return value
                    }
                    return null
                }, addNestedRules: function(propertyRuleMap) {
                    for (var propertyName in propertyRuleMap)
                        this._propertyRuleMap[propertyName] = propertyRuleMap[propertyName];
                    this._behaviorButtons = [];
                    this._dataButtons = [];
                    this._designButtons = [];
                    this._designNestedCanvasButtons = [];
                    this._overflowBehaviorButtons = [];
                    this._overflowDataButtons = [];
                    this._overflowDesignButtons = [];
                    this._createBehaviorAndDataButtons(this._propertyRuleMap);
                    this._createPropertyValueMap(this._propertyRuleMap);
                    this._createDesignButtons(this._propertyRuleMap);
                    this._createDesignNestedCanvasButtons(this._propertyRuleMap)
                }, behaviorButtons: {get: function() {
                        return this._behaviorButtons
                    }}, dataButtons: {get: function() {
                        return this._dataButtons
                    }}, designButtons: {get: function() {
                        return this._designButtons
                    }}, designNestedCanvasButtons: {get: function() {
                        return this._designNestedCanvasButtons
                    }}, overflowBehaviorButtons: {get: function() {
                        return this._overflowBehaviorButtons
                    }}, overflowDataButtons: {get: function() {
                        return this._overflowDataButtons
                    }}, overflowDesignButtons: {get: function() {
                        return this._overflowDesignButtons
                    }}, _createBehaviorAndDataButtons: function(propertyRuleMap) {
                    for (var propertyName in propertyRuleMap) {
                        var property = propertyRuleMap[propertyName].property;
                        if (!property.hidden && property.commandBar.visible && (property.propertyCategory === PropertyRuleCategory.behavior || property.propertyCategory === PropertyRuleCategory.data)) {
                            var rule = propertyRuleMap[property.propertyName];
                            var button = new SingleRuleButton(property, rule);
                            property.propertyCategory === PropertyRuleCategory.behavior ? property.commandBar.isInOverflow ? this._overflowBehaviorButtons.push(button) : this._behaviorButtons.push(button) : property.commandBar.isInOverflow ? this._overflowDataButtons.push(button) : this._dataButtons.push(button)
                        }
                    }
                    this._behaviorButtons.sort(_propertyComparator);
                    this._overflowBehaviorButtons.sort(_propertyComparator);
                    this._dataButtons.sort(_propertyComparator);
                    this._overflowDataButtons.sort(_propertyComparator)
                }, _addDesignButton: function(propertyGroup, properties, target) {
                    var button = new GroupRuleButton(propertyGroup, properties, this._propertyRuleMap, this._propertyValueMap);
                    target === "regular" ? this._designButtons.push(button) : this._designNestedCanvasButtons.push(button)
                }, _createPropertyValueMap: function(propertyRuleMap) {
                    this._propertyValueMap = {};
                    for (var propertyName in propertyRuleMap) {
                        var property = propertyRuleMap[propertyName].property;
                        this._propertyValueMap[property.propertyInvariantName] = ko.observable("")
                    }
                }, _createDesignButtons: function(propertyRuleMap) {
                    var properties = this._getRegularProperties(propertyRuleMap);
                    this._createGroupButtons(properties, "regular");
                    this._designButtons.sort(GroupComparator);
                    this._overflowDesignButtons.sort(GroupComparator)
                }, _getRegularProperties: function(propertyRuleMap) {
                    var properties = Object.keys(propertyRuleMap).map(function(propertyName) {
                            return propertyRuleMap[propertyName].property
                        }),
                        nestedPropertyNames = AppMagic.AuthoringTool.ViewModels.VisualViewModel.getNestedCanvasPropertyNames(properties, AppMagic.AuthoringTool.ViewModels.NestedPropertyDisplayMode.nestedCanvasOnly);
                    return properties.filter(function(property) {
                            return nestedPropertyNames.indexOf(property.propertyName)
                        })
                }, _createGroupButtons: function(properties, target) {
                    var propertyGroupMap = this._createPropertyGroupMap(properties);
                    for (var group in propertyGroupMap) {
                        var groupProperties = propertyGroupMap[group];
                        this._addDesignButton(parseInt(group), groupProperties, target)
                    }
                }, _createPropertyGroupMap: function(properties) {
                    var propertyGroupMap = {};
                    return properties.forEach(function(property) {
                            if (property.propertyCategory === PropertyRuleCategory.design && !property.hidden) {
                                var propertyGroup = property.commandBar.group;
                                propertyGroup !== PropertyGroup.none && (typeof propertyGroupMap[propertyGroup] == "undefined" && (propertyGroupMap[propertyGroup] = []), propertyGroupMap[propertyGroup].push(property))
                            }
                        }), propertyGroupMap
                }, _createDesignNestedCanvasButtons: function(propertyRuleMap) {
                    var properties = Object.keys(propertyRuleMap).map(function(propertyName) {
                            return propertyRuleMap[propertyName].property
                        }),
                        nestedProperties = AppMagic.AuthoringTool.ViewModels.VisualViewModel.getNestedCanvasProperties(properties);
                    this._createGroupButtons(nestedProperties, "nestedCanvas")
                }
        }, {}),
        RuleButton = WinJS.Class.define(function RuleButton_ctor(){}, {
            canShow: null, displayName: null, imageUrl: null, selectedRule: null, tooltip: null
        }, {}),
        SingleRuleButton = WinJS.Class.derive(RuleButton, function SingleRuleButton_ctor(property, rule) {
            RuleButton.call(this);
            this._property = property;
            this._rule = rule
        }, {
            _property: null, _rule: null, canShow: function(propertyRuleMap) {
                    return !!propertyRuleMap[this._property.propertyName]
                }, displayName: {get: function() {
                        return this._property.displayName
                    }}, tooltip: {get: function() {
                        return this._property.tooltip
                    }}, imageUrl: {get: function() {
                        return this._property.commandBar.iconPath
                    }}, property: {get: function() {
                        return this._property
                    }}, propertyName: {get: function() {
                        return this._property.propertyName
                    }}, selectedRule: {get: function() {
                        return this._rule
                    }}
        }, {}),
        GroupRuleButton = WinJS.Class.derive(RuleButton, function GroupRuleButton_ctor(group, properties, propertyRuleMap, propertyValueMap) {
            RuleButton.call(this);
            this._group = group;
            this._selectedRule = ko.observable();
            this._propertyValueMap = propertyValueMap;
            this._tabs = [];
            this._createRuleTabs(properties, propertyRuleMap, propertyValueMap)
        }, {
            _group: null, _groupInfo: null, _selectedRule: null, _tabs: null, _createRuleTabs: function(properties, propertyRuleMap, propertyValueMap) {
                    this._tabs = properties.map(function(property) {
                        var rule = propertyRuleMap[property.propertyName];
                        return new DesignRuleTab(property, rule, propertyValueMap)
                    });
                    this._tabs.sort(_propertyComparator);
                    this._selectedRule(this._tabs[0].rule)
                }, _getGroupInfo: function() {
                    return this._groupInfo || (this._groupInfo = AppMagic.Utility.getPropertyGroupInfo(this._group)), this._groupInfo
                }, canShow: function(propertyRuleMap) {
                    return this._tabs.some(function(tab) {
                            return !!propertyRuleMap[tab.propertyName]
                        })
                }, colorCss: {get: function() {
                        var primaryProperty = this._getGroupInfo().primaryProperty;
                        var color = new AppMagic.Utility.Color,
                            colorPropertyValue = this._propertyValueMap[primaryProperty]();
                        return typeof colorPropertyValue == "string" ? (color = AppMagic.Utility.Color.parseRuleValue(colorPropertyValue), color === null && (color = new AppMagic.Utility.Color)) : color = AppMagic.Utility.Color.create(colorPropertyValue), color.toCss()
                    }}, appearance: {get: function() {
                        return this._getGroupInfo().appearance || "generic"
                    }}, displayName: {get: function() {
                        return this._getGroupInfo().displayName
                    }}, errorInfo: {get: function() {
                        for (var i = 0, len = this._tabs.length; i < len; i++) {
                            var rule = this._tabs[i].rule;
                            if (rule.hasErrors)
                                return {
                                        hasErrors: !0, message: rule.errorMessage
                                    }
                        }
                        return {
                                hasErrors: !1, message: ""
                            }
                    }}, imageUrl: {get: function() {
                        return this._getGroupInfo().imgUrl
                    }}, position: {get: function() {
                        return this._getGroupInfo().position
                    }}, selectedRule: {get: function() {
                        return this._selectedRule()
                    }}, observableRule: {get: function() {
                        return this._selectedRule
                    }}, tabs: {get: function() {
                        return this._tabs
                    }}, tryChangePropertyValue: function(propertyName, newValue) {
                    for (var i = 0, len = this._tabs.length; i < len; i++) {
                        var tab = this._tabs[i];
                        if (tab.propertyInvariantName === propertyName)
                            return tab.propertyValue = newValue, !0
                    }
                    return !1
                }, tryGetPropertyValue: function(propertyName) {
                    for (var i = 0, len = this._tabs.length; i < len; i++) {
                        var tab = this._tabs[i];
                        if (tab.propertyInvariantName === propertyName)
                            return tab.propertyValue
                    }
                    return null
                }
        }, {}),
        DesignRuleTab = WinJS.Class.define(function DesignRuleTab_ctor(property, rule, propertyValueMap) {
            this._property = property;
            this._rule = rule;
            this._propertyValueMap = propertyValueMap
        }, {
            _property: null, _propertyValueMap: null, _rule: null, alignImageUrl: {get: function() {
                        var value = "left";
                        this.propertyValue && (value = this.propertyValue.toString());
                        switch (value.toLowerCase()) {
                            case"left":
                            case"center":
                            case"right":
                            case"justify":
                                break;
                            default:
                                value = "left";
                                break
                        }
                        return "/images/rulebutton_" + value + "align.png"
                    }}, verticalAlignImageUrl: {get: function() {
                        var value = "middle";
                        this.propertyValue && (value = this.propertyValue.toString());
                        switch (value.toLowerCase()) {
                            case"middle":
                            case"top":
                            case"bottom":
                                break;
                            default:
                                value = "middle";
                                break
                        }
                        return "/images/rulebutton_vertical" + value + "align.svg"
                    }}, appearance: {get: function() {
                        switch (this._property.propertyHelperUI) {
                            case PropertyHelperUI.align:
                                return "align";
                            case PropertyHelperUI.boolean:
                                return "boolean";
                            case PropertyHelperUI.color:
                                return "color";
                            case PropertyHelperUI.fontFamily:
                                return "fontFamily";
                            case PropertyHelperUI.fontSize:
                                return "fontSize";
                            case PropertyHelperUI.fontWeight:
                                return "fontWeight";
                            case PropertyHelperUI.imagePosition:
                                return "imagePosition";
                            case PropertyHelperUI.transition:
                                return "transition";
                            case PropertyHelperUI.layout:
                                return "layout";
                            case PropertyHelperUI.textMode:
                                return "textMode";
                            case PropertyHelperUI.templateSize:
                                return "templateSize";
                            case PropertyHelperUI.penThickness:
                                return "penThickness";
                            case PropertyHelperUI.penMode:
                                return "penMode";
                            case PropertyHelperUI.penType:
                                return "penType";
                            case PropertyHelperUI.verticalAlign:
                                return "verticalAlign";
                            case PropertyHelperUI.direction:
                                return "direction";
                            case PropertyHelperUI.width:
                                return "width";
                            case PropertyHelperUI.height:
                                return "height";
                            case PropertyHelperUI.fade:
                                return "fade";
                            case PropertyHelperUI.minimumBarWidth:
                                return "minimumBarWidth";
                            case PropertyHelperUI.numberOfSeries:
                                return "numberOfSeries";
                            case PropertyHelperUI.themes:
                                return "themes";
                            case PropertyHelperUI.overflow:
                                return "overflow";
                            case PropertyHelperUI.lineStyle:
                            case PropertyHelperUI.lineWidth:
                            case PropertyHelperUI.padding:
                            case PropertyHelperUI.templatePadding:
                            case PropertyHelperUI.none:
                                return "generic"
                        }
                        return "generic"
                    }}, designImageUrl: {get: function() {
                        switch (this.appearance) {
                            case"align":
                                return this.alignImageUrl;
                            case"verticalAlign":
                                return this.verticalAlignImageUrl;
                            case"fontWeight":
                                return this.fontWeightImageUrl;
                            case"layout":
                                return this.layoutImageUrl;
                            case"templateSize":
                                return this.templateSizeImageUrl;
                            default:
                                return this._property.commandBar.iconPath
                        }
                    }}, displayName: {get: function() {
                        return this._property.displayName
                    }}, tooltip: {get: function() {
                        return this._property.tooltip
                    }}, fontWeightImageUrl: {get: function() {
                        var value = "normal";
                        this.propertyValue && (value = this.propertyValue.toString());
                        switch (value.toLowerCase()) {
                            case"bold":
                            case"semibold":
                            case"lighter":
                            case"normal":
                                break;
                            default:
                                value = "normal";
                                break
                        }
                        return "/images/rulebutton_" + value + "weight.png"
                    }}, layoutImageUrl: {get: function() {
                        return this.propertyValue === "vertical" ? "/images/rulebutton_verticallayout.svg" : "/images/rulebutton_horizontallayout.svg"
                    }}, templateSizeImageUrl: {get: function() {
                        var layoutPropertyValue = this._propertyValueMap.Layout;
                        return layoutPropertyValue && layoutPropertyValue() === "vertical" ? "/images/designrule_heighticon.svg" : "/images/designrule_widthicon.svg"
                    }}, colorCss: {get: function() {
                        var color,
                            colorPropertyValue = this.propertyValue;
                        return typeof colorPropertyValue == "string" ? (color = AppMagic.Utility.Color.parseRuleValue(colorPropertyValue), color === null && (color = new AppMagic.Utility.Color)) : color = AppMagic.Utility.Color.create(colorPropertyValue), color.toCss()
                    }}, property: {get: function() {
                        return this._property
                    }}, propertyName: {get: function() {
                        return this._property.propertyName
                    }}, propertyInvariantName: {get: function() {
                        return this._property.propertyInvariantName
                    }}, propertyValue: {
                    get: function() {
                        var observableValue = this._propertyValueMap[this._property.propertyInvariantName];
                        return observableValue()
                    }, set: function(value) {
                            var observableValue = this._propertyValueMap[this._property.propertyInvariantName];
                            var defaultValue = this._property.defaultValue ? this._property.defaultValue : "";
                            observableValue(value !== null ? value : defaultValue)
                        }
                }, rule: {get: function() {
                        return this._rule
                    }}
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        DesignButtonSource: DesignButtonSource, RuleButtonManager: RuleButtonManager, _propertyComparator: _propertyComparator, _RuleButton: RuleButton, _SingleRuleButton: SingleRuleButton, _GroupRuleButton: GroupRuleButton, _DesignRuleTab: DesignRuleTab
    })
})();