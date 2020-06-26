//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        DISABLED_STAR_COLOR = "RGBA(119, 119, 119, 1)",
        Rating = WinJS.Class.define(function Rating_ctor(){}, {
            initControlContext: function(controlContext) {
                util.createOrSetPrivate(controlContext, "_id", util.generateRandomId("rating"));
                util.createOrSetPrivate(controlContext, "_rating", this);
                util.createOrSetPrivate(controlContext, "handleClick", this.handleClick);
                util.createOrSetPrivate(controlContext, "_toolTipStrings", []);
                util.createOrSetPrivate(controlContext, "_valueChanged", !1);
                util.createOrSetPrivate(controlContext, "_winControl", null)
            }, initView: function(container, controlContext) {
                    util.createOrSetPrivate(controlContext, "isDisabled", ko.computed(function() {
                        return controlContext.controlWidget.isParentDisabled(controlContext) || controlContext.properties.Disabled() || controlContext.properties.Readonly()
                    }));
                    util.createOrSetPrivate(controlContext, "isDisabledColor", ko.computed(function() {
                        return controlContext.controlWidget.isParentDisabled(controlContext) || controlContext.properties.Disabled()
                    }));
                    controlContext.isDisabledColor.subscribe(function(disabled) {
                        this._updateColor(controlContext.properties.RatingFill(), controlContext)
                    }.bind(this));
                    var ratingControl = container.children[0];
                    if (ratingControl.id = controlContext._id, WinJS.UI.processAll(container), controlContext._winControl = ratingControl.winControl, this._updateStarSize(controlContext.properties.Width(), controlContext.properties.Max(), controlContext), this._updateColor(controlContext.properties.RatingFill(), controlContext), controlContext._toolTipStrings = ratingControl.winControl.tooltipStrings, !controlContext._valueChanged) {
                        var defaultValue = controlContext.modelProperties.Default.getValue(),
                            maxValue = controlContext.modelProperties.Max.getValue(),
                            value = defaultValue > maxValue ? maxValue : defaultValue;
                        controlContext.modelProperties.Value.setValue(value)
                    }
                    ko.applyBindings(controlContext, container);
                    var saveValue = controlContext.modelProperties.Value.getValue();
                    controlContext.modelProperties.Value.setValue(null);
                    controlContext.modelProperties.Value.setValue(saveValue)
                }, disposeView: function(container, controlContext) {
                    controlContext.isDisabled.dispose();
                    controlContext.isDisabled = null;
                    controlContext.isDisabledColor.dispose();
                    controlContext.isDisabledColor = null;
                    this._removeAllRules(controlContext)
                }, _onResizeStar: function(controlContext) {
                    this._updateStarSize(controlContext.modelProperties.Width.getValue(), controlContext.modelProperties.Max.getValue(), controlContext)
                }, onChangeMax: function(evt, controlContext) {
                    if (evt.newValue !== null && !(evt.newValue < 0)) {
                        if (controlContext.modelProperties.Value.getValue() > evt.newValue && (controlContext.modelProperties.Value.setValue(evt.newValue), controlContext._valueChanged = !0), this._updateStarSize(controlContext.modelProperties.Width.getValue(), controlContext.modelProperties.Max.getValue(), controlContext), !controlContext._valueChanged) {
                            var defaultValue = controlContext.modelProperties.Default.getValue();
                            if (evt.oldValue < defaultValue) {
                                var value = evt.newValue < defaultValue ? evt.newValue : defaultValue;
                                controlContext.modelProperties.Value.setValue(value)
                            }
                        }
                        if (!(controlContext._toolTipStrings.indexOf(evt.newValue) > 0))
                            for (var i = 0, len = evt.newValue; i < len; i++)
                                controlContext._toolTipStrings.indexOf(i + 1) < 0 && controlContext._toolTipStrings.splice(i, 0, i + 1)
                    }
                }, onChangeWidth: function(evt, controlContext) {
                    this._onResizeStar(controlContext)
                }, onChangeHeight: function(evt, controlContext) {
                    this._onResizeStar(controlContext)
                }, onChangeRatingFill: function(evt, controlContext) {
                    evt.newValue !== null && controlContext.realized && this._updateColor(controlContext.properties.RatingFill(), controlContext)
                }, onChangeShowValue: function(evt, controlContext) {
                    if (evt.newValue !== null && controlContext.realized) {
                        var ratingControl = controlContext.container.children[0];
                        ratingControl.winControl._tooltipStrings = evt.newValue ? controlContext._toolTipStrings : []
                    }
                }, handleClick: function(controlContext) {
                    controlContext.realized && !controlContext.isDisabled() && (controlContext.properties.Value() !== controlContext._winControl.userRating && (controlContext._valueChanged = !0, controlContext.properties.Value(controlContext._winControl.userRating), controlContext.behaviors.OnChange()), controlContext.behaviors.OnSelect())
                }, onChangeDefault: function(evt, controlContext) {
                    isNaN(evt.newValue) && (evt.newValue = 0);
                    controlContext._valueChanged = !1;
                    var maxValue = controlContext.modelProperties.Max.getValue(),
                        value = evt.newValue > maxValue ? maxValue : evt.newValue;
                    controlContext.modelProperties.Value.setValue(value)
                }, onChangeBorderStyle: function(evt, controlContext) {
                    this._updateStarSize(controlContext.modelProperties.Width.getValue(), controlContext.modelProperties.Max.getValue(), controlContext)
                }, _updateStarSize: function(width, maxValue, controlContext) {
                    if (width !== null && maxValue !== null) {
                        var selectors = this._getSelectors(controlContext);
                        AppMagic.CSSRuleUtility.removeRule(selectors.starSize);
                        maxValue === 0 && (maxValue = 1);
                        var newStarSize = Math.round(width / maxValue * .925).toString() + "px",
                            ratingStarSizeRule = {
                                ruleName: selectors.starSize, ruleValues: {
                                        "font-size": newStarSize, height: controlContext.modelProperties.Height.getValue() + "px"
                                    }
                            };
                        AppMagic.CSSRuleUtility.addRule(ratingStarSizeRule)
                    }
                }, _updateColor: function(starColor, controlContext) {
                    controlContext.isDisabledColor() && (starColor = DISABLED_STAR_COLOR);
                    var selectors = this._getSelectors(controlContext),
                        ratingRestStarRule = {
                            ruleName: selectors.restStar, ruleValues: {color: starColor}
                        },
                        ratingActiveStarRule = {
                            ruleName: selectors.activeStar, ruleValues: {color: starColor}
                        };
                    AppMagic.CSSRuleUtility.removeRule(selectors.restStar);
                    AppMagic.CSSRuleUtility.removeRule(selectors.activeStar);
                    AppMagic.CSSRuleUtility.addRule(ratingRestStarRule);
                    AppMagic.CSSRuleUtility.addRule(ratingActiveStarRule)
                }, _removeAllRules: function(controlContext) {
                    var selectors = this._getSelectors(controlContext);
                    AppMagic.CSSRuleUtility.removeRule(selectors.starSize);
                    AppMagic.CSSRuleUtility.removeRule(selectors.restStar);
                    AppMagic.CSSRuleUtility.removeRule(selectors.activeStar)
                }, _getSelectors: function(controlContext) {
                    return {
                            starSize: "#" + controlContext._id + " .win-star", restStar: "#" + controlContext._id + " .win-user.win-full", activeStar: "#" + controlContext._id + " .win-tentative.win-full"
                        }
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {Rating: Rating})
})();