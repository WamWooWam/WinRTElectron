//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ColorDivClass = "colorDiv",
        ColorMruIndex = AppMagic.AuthoringTool.VisualIntellisense.ColorMruIndex,
        RGBA_TRANSPARENTCOLOR = new AppMagic.Utility.Color,
        Util = Core.Utility,
        RuleValue = WinJS.Class.derive(AppMagic.Utility.Disposable, function RuleValue_ctor(template) {
            AppMagic.Utility.Disposable.call(this);
            this._template = template;
            this._selectedIndex = ko.observable(-1)
        }, {
            _template: null, _selectedIndex: null, notifyAfterHide: function() {
                    this._selectedIndex(-1)
                }, notifyBeforeShow: function(){}, template: {get: function() {
                        return this._template
                    }}, selectedIndex: {get: function() {
                        return this._selectedIndex()
                    }}, handleKeyDown: function(values, isKeyUpDown, data, evt) {
                    if ((isKeyUpDown || evt.key !== AppMagic.Constants.Keys.down && evt.key !== AppMagic.Constants.Keys.up) && (!isKeyUpDown || evt.key !== AppMagic.Constants.Keys.right && evt.key !== AppMagic.Constants.Keys.left)) {
                        for (var currentItemIndex = this._selectedIndex(), isItemSelected = !1, i = 0, len = values.length; i < len; i++)
                            if (values[i].text === this.normalizedValue) {
                                currentItemIndex === -1 && (currentItemIndex = i);
                                isItemSelected = !0;
                                break
                            }
                        if (isItemSelected || (currentItemIndex = -1), currentItemIndex >= 0 && (evt.key === AppMagic.Constants.Keys.tab || evt.key === AppMagic.Constants.Keys.enter))
                            return this.normalizedValue = values[currentItemIndex].text, !0;
                        (evt.key === AppMagic.Constants.Keys.down || evt.key === AppMagic.Constants.Keys.right) && currentItemIndex < values.length - 1 ? (currentItemIndex++, this._selectedIndex(currentItemIndex)) : (evt.key === AppMagic.Constants.Keys.up || evt.key === AppMagic.Constants.Keys.left) && (currentItemIndex > 0 ? currentItemIndex-- : currentItemIndex = 0, this._selectedIndex(currentItemIndex))
                    }
                }, handleClick: function(text, index) {
                    this.normalizedValue = text;
                    this._selectedIndex(index)
                }, handleBlur: function(data, evt) {
                    var activeElement = document.activeElement,
                        targetClassName = evt.target.className;
                    return (!activeElement || typeof activeElement.className != "string" || activeElement.className.indexOf(targetClassName) < 0 && targetClassName.indexOf(activeElement.className) < 0) && this._selectedIndex(-1), !0
                }
        }, {}),
        EnumRuleValue = WinJS.Class.derive(RuleValue, function EnumRuleValue_ctor(template, rhs) {
            RuleValue.call(this, template);
            this._rhs = rhs
        }, {
            _rhs: null, lowerNormalizedValue: {get: function() {
                        var value = this.normalizedValue;
                        return value === null ? null : value.toLowerCase()
                    }}, normalizedValue: {
                    get: function() {
                        return this._rhs()
                    }, set: function(value) {
                            this._rhs(value)
                        }
                }
        }, {}),
        RangeRuleValue = WinJS.Class.derive(RuleValue, function RangeRuleValue_ctor(template, rhs, range) {
            RuleValue.call(this, template);
            this._ruleValue = rhs;
            this._range = range;
            (ko.isObservable(range.min) || ko.isComputed(range.min)) && (this.trackAnonymous(range.min.subscribe(function(value) {
                this._range = {
                    min: value, max: this._range.max
                }
            }, this)), this._range = {
                min: this._range.min(), max: this._range.max
            });
            (ko.isObservable(range.max) || ko.isComputed(range.max)) && (this.trackAnonymous(range.max.subscribe(function(value) {
                this._range = {
                    min: this._range.min, max: value
                }
            }, this)), this._range = {
                min: this._range.min, max: this._range.max()
            });
            this._rangeValue = ko.observable(null);
            this._textBoxValue = ko.observable(null);
            this.trackAnonymous(this._ruleValue.subscribe(function(text) {
                this._updating || (this._normalizedValue(this._ruleValueToNormalizedValue(text)), this._propagateUpdate("ruleValue"))
            }, this));
            this.trackAnonymous(this._rangeValue.subscribe(function(text) {
                this._updating || (this._normalizedValue(this._rangeTextBoxValueToNormalizedValue(text)), this._propagateUpdate("rangeValue"))
            }, this));
            this.trackAnonymous(this._textBoxValue.subscribe(function(text) {
                this._updating || (this._normalizedValue(this._rangeTextBoxValueToNormalizedValue(text)), this._propagateUpdate("textBoxValue"))
            }, this));
            this._normalizedValue = ko.observable(this._ruleValueToNormalizedValue(rhs()));
            this._propagateUpdate("ruleValue")
        }, {
            _createdUndoGroup: !1, _normalizedValue: null, _range: null, _rangeValue: null, _ruleValue: null, _textBoxValue: null, _updating: !1, disabled: {get: function() {
                        return AppMagic.Functions.value(this._ruleValue()) === null && this._ruleValue() !== ""
                    }}, normalizedValue: {
                    get: function() {
                        return this._normalizedValue()
                    }, set: function(value) {
                            this._normalizedValue(value);
                            this._propagateUpdate("normalizedValue")
                        }
                }, rangeMin: {get: function() {
                        return this._range.min
                    }}, rangeMax: {get: function() {
                        return this._range.max
                    }}, ruleValue: {
                    get: function() {
                        return this._ruleValue()
                    }, set: function(value) {
                            this._ruleValue(value)
                        }
                }, rangeValue: {
                    get: function() {
                        return this._rangeValue()
                    }, set: function(value) {
                            this._rangeValue(value)
                        }
                }, textBoxValue: {
                    get: function() {
                        return this._textBoxValue()
                    }, set: function(value) {
                            this._textBoxValue(value)
                        }
                }, _propagateUpdate: function(source) {
                    this._updating = !0;
                    try {
                        source !== "ruleValue" && this._ruleValue(this._normalizedValueToRuleValue());
                        source !== "rangeValue" && this._rangeValue(this._normalizedValueToRangeValue());
                        source !== "textBoxValue" && this._textBoxValue(this._normalizedValueToTextBoxValue())
                    }
                    finally {
                        this._updating = !1
                    }
                }, _ruleValueToNormalizedValue: function(text) {
                    var value = AppMagic.Functions.value(text);
                    return this.disabled ? null : value
                }, _normalizedValueToRangeValue: function() {
                    return this._normalizedValue() === null ? "" : this._normalizedValue().toString()
                }, _normalizedValueToTextBoxValue: function() {
                    return this._normalizedValue() === null ? "" : this._normalizedValue().toString().replace(".", Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator)
                }, _normalizedValueToRuleValue: function() {
                    return this._normalizedValueToTextBoxValue()
                }, _rangeTextBoxValueToNormalizedValue: function(text) {
                    if (text = text.replace(Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator, "."), text.length > 1) {
                        var regex = /^0*\./,
                            result = regex.exec(text);
                        text = result ? text.replace(regex, "0.") : text.replace(/^0+/, "");
                        regex = /(\d*\.\d*[1-9])0*/;
                        result = regex.exec(text);
                        text = result ? result[1] : text.replace(/\.0*$/, "")
                    }
                    var value = parseFloat(text);
                    return text === value.toString() ? value : null
                }, handleRangeMouseDown: function() {
                    return !this._createdUndoGroup && AppMagic.AuthoringTool.Runtime.isAuthoring && (AppMagic.context.documentViewModel.undoManager.createGroup("Updating range value slider."), this._createdUndoGroup = !0), !0
                }, handleRangeMouseUp: function() {
                    return this._createdUndoGroup && AppMagic.AuthoringTool.Runtime.isAuthoring && (AppMagic.context.documentViewModel.undoManager.closeGroup(), this._createdUndoGroup = !1), !0
                }
        }, {}),
        FontFamilyMru = WinJS.Class.define(function FontFamilyMru_ctor() {
            this._fontFamilies = ko.observableArray(AppMagic.AuthoringTool.VisualIntellisense.TopFontFamilies.slice(0))
        }, {
            _fontFamilies: null, values: {get: function() {
                        return this._fontFamilies()
                    }}, update: function(value) {
                    for (var fontFamilies = this._fontFamilies(), i = 0, len = fontFamilies.length; i < len; i++) {
                        var fontFamily = fontFamilies[i];
                        if (fontFamily.text.toLowerCase() === value.toLowerCase()) {
                            this._fontFamilies.splice(i, 1);
                            this._fontFamilies.unshift(fontFamily);
                            return
                        }
                    }
                }
        }, {}),
        FontFamilyRuleValue = WinJS.Class.derive(RuleValue, function FontRuleValue_ctor(mru, rhs) {
            RuleValue.call(this, "fontFamily");
            this._mru = mru;
            this._rhs = rhs
        }, {
            _mru: null, _rhs: null, notifyAfterHide: function() {
                    this._updateMru();
                    this._selectedIndex(-1)
                }, notifyBeforeShow: function() {
                    this._updateMru()
                }, lowerNormalizedValue: {get: function() {
                        var value = this.normalizedValue;
                        return value === null ? null : value.toLowerCase()
                    }}, normalizedValue: {
                    get: function() {
                        return this._rhs()
                    }, set: function(value) {
                            this._rhs(value)
                        }
                }, values: {get: function() {
                        return this._mru.values
                    }}, _updateMru: function() {
                    var value = this._rhs();
                    value !== null && value !== "" && this._mru.update(value)
                }
        }, {}),
        PenTypeRuleValue = WinJS.Class.derive(RuleValue, function PenTypeRuleValue_ctor(template, rhs) {
            RuleValue.call(this, template);
            this._rhs = rhs;
            this._typeList = ko.observableArray(this._loadTypeList());
            this.trackAnonymous(this._typeList.subscribe(function() {
                var typeMask = 0;
                if (!this._loadingTypeList) {
                    for (var i = 0; i < this._typeList().length; i++)
                        typeMask = typeMask | parseInt(this._typeList()[i]);
                    this._afterArrayUpdate = !0;
                    this._rhs(typeMask.toString());
                    this._afterArrayUpdate = !1
                }
            }.bind(this)));
            this.trackAnonymous(this._rhs.subscribe(function() {
                this._afterArrayUpdate || (this._loadingTypeList = !0, this._typeList(this._loadTypeList()), this._loadingTypeList = !1)
            }.bind(this)))
        }, {
            _rhs: null, _typeList: null, _afterArrayUpdate: !1, _loadingTypeList: !1, _loadPenType: function(typeMask, penType, array) {
                    (typeMask & penType) === penType && array.push(penType.toString())
                }, _loadTypeList: function() {
                    var typeMask = parseInt(this._rhs()),
                        result = [];
                    return this._loadPenType(typeMask, AppMagic.Constants.PenType.mouse, result), this._loadPenType(typeMask, AppMagic.Constants.PenType.touch, result), this._loadPenType(typeMask, AppMagic.Constants.PenType.pen, result), result
                }, typeList: {
                    get: function() {
                        return this._typeList
                    }, set: function(value) {
                            this._typeList(value)
                        }
                }
        }, {}),
        ColorMru = WinJS.Class.define(function ColorMru_ctor() {
            this._recentlyUsedColors = ko.observableArray(AppMagic.AuthoringTool.VisualIntellisense.RecentlyUsedColors.slice(0))
        }, {
            _recentlyUsedColors: null, preDefinedColors: AppMagic.AuthoringTool.VisualIntellisense.PreDefinedColors, values: {get: function() {
                        return this._recentlyUsedColors()
                    }}, update: function(value) {
                    if (!RGBA_TRANSPARENTCOLOR.equals(value)) {
                        for (var row, color, colorIndex, colorLength, rowIndex = 0, rowLength = this.preDefinedColors.length; rowIndex < rowLength; rowIndex++)
                            for (row = this.preDefinedColors[rowIndex], colorIndex = 0, colorLength = row.length; colorIndex < colorLength; colorIndex++)
                                if (color = row[colorIndex], color.value.equals(value))
                                    return;
                        if (colorIndex = this._indexOf(value), colorIndex >= 0) {
                            color = this._recentlyUsedColors()[colorIndex];
                            this._recentlyUsedColors.splice(colorIndex, 1);
                            this._recentlyUsedColors.splice(1, 0, color);
                            return
                        }
                        this._recentlyUsedColors().length === AppMagic.AuthoringTool.VisualIntellisense.MaxRecentlyUsedColors && this._recentlyUsedColors.pop();
                        this._recentlyUsedColors.splice(1, 0, {
                            value: value, image: "", description: ""
                        })
                    }
                }, _indexOf: function(value) {
                    for (var recentlyUsedColors = this._recentlyUsedColors(), colorIndex = 0, colorLength = recentlyUsedColors.length; colorIndex < colorLength; colorIndex++) {
                        var color = recentlyUsedColors[colorIndex];
                        if (color.value.equals(value))
                            return colorIndex
                    }
                    return -1
                }
        }, {}),
        ColorRuleValue = WinJS.Class.derive(RangeRuleValue, function ColorRuleValue_ctor(mru, rhs) {
            RangeRuleValue.call(this, "color", rhs, AppMagic.AuthoringTool.VisualIntellisense.ColorTransparency);
            this._mru = mru;
            this._selectedColumn = ko.observable(-1);
            this._selectedRow = ko.observable(-1)
        }, {
            _mru: null, _selectedColumn: null, _selectedRow: null, handleColorBlur: function(data, evt) {
                    var activeElem = document.activeElement;
                    return activeElem && WinJS.Utilities.hasClass(activeElem, ColorDivClass) || (this._selectedRow(-1), this._selectedColumn(-1)), !0
                }, handleColorClick: function(value, row, col) {
                    this.normalizedValue = value.clone();
                    this._selectedRow(row);
                    this._selectedColumn(col)
                }, handleColorKeyDown: function(value, element, evt) {
                    switch (evt.key) {
                        case AppMagic.Constants.Keys.down:
                            this._handleArrow(0, 1);
                            break;
                        case AppMagic.Constants.Keys.up:
                            this._handleArrow(0, -1);
                            break;
                        case AppMagic.Constants.Keys.left:
                            this._handleArrow(-1, 0);
                            break;
                        case AppMagic.Constants.Keys.right:
                            this._handleArrow(1, 0);
                            break;
                        case AppMagic.Constants.Keys.tab:
                            this.normalizedValue = value.clone();
                            break;
                        case AppMagic.Constants.Keys.enter:
                            this.normalizedValue = value.clone();
                            typeof colorPickerPopup != "undefined" && colorPickerPopup.winControl.hide();
                            break
                    }
                    return !0
                }, _handleArrow: function(xOffset, yOffset) {
                    var selectedCol = this._selectedColumn(),
                        selectedRow = this._selectedRow(),
                        expectedCol = selectedCol + xOffset,
                        expectedRow = selectedRow + yOffset;
                    var maxCol = expectedRow === ColorMruIndex ? this.recentlyUsedColors.length - 1 : this.preDefinedColors[0].length - 1;
                    this._selectedColumn(Util.clamp(expectedCol, 0, maxCol));
                    var maxRow = this.preDefinedColors.length;
                    this._selectedRow(Util.clamp(expectedRow, 0, maxRow))
                }, notifyAfterHide: function() {
                    this._mru.update(this.normalizedValue)
                }, selectedColumn: {get: function() {
                        return this._selectedColumn()
                    }}, selectedRow: {get: function() {
                        return this._selectedRow()
                    }}, _createDefaultColor: function() {
                    return new AppMagic.Utility.Color(0, 0, 0, 1)
                }, _rangeTextBoxValueToNormalizedValue: function(text) {
                    text = text.replace(Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator, ".");
                    var alphaValue = parseFloat(text),
                        color = this.normalizedValue.clone();
                    return color.a = isNaN(alphaValue) ? text === "" ? this.rangeMin : this.rangeMax : alphaValue, color
                }, preDefinedColors: {get: function() {
                        return this._mru.preDefinedColors
                    }}, recentlyUsedColors: {get: function() {
                        return this._mru.values
                    }}, _ruleValueToNormalizedValue: function(text) {
                    var color = AppMagic.Utility.Color.parseRuleValue(text);
                    return color || (color = this._createDefaultColor()), color
                }, _normalizedValueToRangeValue: function() {
                    return this.normalizedValue.a.toString()
                }, _normalizedValueToTextBoxValue: function() {
                    return this.normalizedValue.a.toString().replace(".", Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleDecimalSeparator)
                }, _normalizedValueToRuleValue: function() {
                    return this.normalizedValue.toRuleValue()
                }
        }, {});
    WinJS.Namespace.define("AppMagic.RuleValues", {
        ColorMru: ColorMru, ColorRuleValue: ColorRuleValue, EnumRuleValue: EnumRuleValue, FontFamilyMru: FontFamilyMru, FontFamilyRuleValue: FontFamilyRuleValue, RangeRuleValue: RangeRuleValue, PenTypeRuleValue: PenTypeRuleValue
    })
})();