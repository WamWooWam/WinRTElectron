//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var PropertyHelperUI = Microsoft.AppMagic.Authoring.PropertyHelperUI,
        RuleValueFactory = WinJS.Class.derive(AppMagic.Utility.Disposable, function RuleValueFactory_ctor(documentLayoutManager) {
            AppMagic.Utility.Disposable.call(this);
            this.track("_documentWidth", ko.computed(function() {
                return documentLayoutManager.width
            }));
            this.track("_documentHeight", ko.computed(function() {
                return documentLayoutManager.height
            }));
            this._colorMru = new AppMagic.RuleValues.ColorMru;
            this._fontFamilyMru = new AppMagic.RuleValues.FontFamilyMru
        }, {
            _documentWidth: null, _documentHeight: null, _colorMru: null, _fontFamilyMru: null, create: function(propertyHelperUI, observableRhs) {
                    var newValue = null;
                    switch (propertyHelperUI) {
                        case PropertyHelperUI.align:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("textAlign", observableRhs);
                            break;
                        case PropertyHelperUI.boolean:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("boolean", observableRhs);
                            break;
                        case PropertyHelperUI.color:
                            newValue = new AppMagic.RuleValues.ColorRuleValue(this._colorMru, observableRhs);
                            break;
                        case PropertyHelperUI.direction:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("direction", observableRhs);
                            break;
                        case PropertyHelperUI.fontFamily:
                            newValue = new AppMagic.RuleValues.FontFamilyRuleValue(this._fontFamilyMru, observableRhs);
                            break;
                        case PropertyHelperUI.fontSize:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.FontSize);
                            break;
                        case PropertyHelperUI.fontWeight:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("fontWeight", observableRhs);
                            break;
                        case PropertyHelperUI.lineStyle:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("borderStyle", observableRhs);
                            break;
                        case PropertyHelperUI.lineWidth:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.BorderThickness);
                            break;
                        case PropertyHelperUI.imagePosition:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("imagePosition", observableRhs);
                            break;
                        case PropertyHelperUI.transition:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("transition", observableRhs);
                            break;
                        case PropertyHelperUI.layout:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("layout", observableRhs);
                            break;
                        case PropertyHelperUI.themes:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("themes", observableRhs);
                            break;
                        case PropertyHelperUI.textMode:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("textMode", observableRhs);
                            break;
                        case PropertyHelperUI.penThickness:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.PenThickness);
                            break;
                        case PropertyHelperUI.penMode:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("penMode", observableRhs);
                            break;
                        case PropertyHelperUI.penType:
                            newValue = new AppMagic.RuleValues.PenTypeRuleValue("penType", observableRhs);
                            break;
                        case PropertyHelperUI.verticalAlign:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("verticalAlign", observableRhs);
                            break;
                        case PropertyHelperUI.padding:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.Padding);
                            break;
                        case PropertyHelperUI.templateSize:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.TemplateSize);
                            break;
                        case PropertyHelperUI.templatePadding:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.TemplatePadding);
                            break;
                        case PropertyHelperUI.width:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, {
                                min: 10, max: this._documentWidth
                            });
                            break;
                        case PropertyHelperUI.height:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, {
                                min: 10, max: this._documentHeight
                            });
                            break;
                        case PropertyHelperUI.fade:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.Fade);
                            break;
                        case PropertyHelperUI.minimumBarWidth:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.MinimumBarWidth);
                            break;
                        case PropertyHelperUI.numberOfSeries:
                            newValue = new AppMagic.RuleValues.RangeRuleValue("range", observableRhs, AppMagic.AuthoringTool.VisualIntellisense.NumberOfSeries);
                            break;
                        case PropertyHelperUI.overflow:
                            newValue = new AppMagic.RuleValues.EnumRuleValue("overflow", observableRhs);
                            break;
                        default:
                            break
                    }
                    return newValue
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {RuleValueFactory: RuleValueFactory})
})();