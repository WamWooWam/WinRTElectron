//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var FILL_THEMES = [["rgba(1, 176, 241, 1)", "rgba(146, 208, 81, 1)", "rgba(112, 48, 160, 1)", "rgba(253, 193, 0, 1)", "rgba(176, 0, 0, 1)", "rgba(0, 210, 210, 1)", "rgba(119, 119, 119, 1)", "rgba(255, 131, 6, 1)", "rgba(2, 33, 97, 1)", "rgba(0, 175, 82, 1)"], ["rgba(69, 95, 81, 1)", "rgba(227, 222, 209, 1)", "rgba(84, 158, 57, 1)", "rgba(138, 184, 51, 1)", "rgba(192, 207, 58, 1)", "rgba(2, 150, 118, 1)", "rgba(74, 181, 196, 1)", "rgba(9, 137, 177, 1)", "rgba(155, 45, 31, 1)", "rgba(255, 189, 71, 1)"], ["rgba(229, 194, 67, 1)", "rgba(165, 48, 15, 1)", "rgba(213, 88, 22, 1)", "rgba(225, 152, 37, 1)", "rgba(177, 156, 125, 1)", "rgba(127, 95, 82, 1)", "rgba(178, 125, 73, 1)", "rgba(111, 129, 131, 1)", "rgba(123, 167, 157, 1)", "rgba(93, 115, 154, 1)"], ["rgba(119, 95, 85, 1)", "rgba(235, 221, 195, 1)", "rgba(148, 182, 210, 1)", "rgba(221, 128, 71, 1)", "rgba(165, 171, 129, 1)", "rgba(216, 178, 92, 1)", "rgba(123, 167, 157, 1)", "rgba(150, 140, 140, 1)", "rgba(208, 175, 114, 1)", "rgba(86, 130, 120, 1)"], ["rgba(31, 73, 125, 1)", "rgba(216, 217, 220, 1)", "rgba(79, 129, 189, 1)", "rgba(192, 80, 77, 1)", "rgba(155, 187, 89, 1)", "rgba(128, 100, 162, 1)", "rgba(75, 172, 198, 1)", "rgba(247, 150, 70, 1)", "rgba(165, 194, 73, 1)", "rgba(156, 106, 106, 1)]"]],
            MIN_COS_VALUE = .5,
            DEFAULT_SIZE_PX = 10,
            PT_TO_PX_RATIO = 1.34,
            LABEL_CHART_HEIGHT_RATIO = .3,
            DEFAULT_MIN_LABEL_HEIGHT = 50,
            GRADIENT_FADE = .15,
            MAX_ITEMS = 100,
            ChartViewModel = function() {
                function ChartViewModel(controlContext) {
                    this._properties = null;
                    this._behaviors = null;
                    this._viewState = null;
                    this._chartElement = null;
                    this._chartElement = controlContext.chartElement;
                    this._properties = controlContext.properties;
                    this._behaviors = controlContext.behaviors;
                    this._viewState = controlContext.viewState;
                    this._chartElement.addEventListener("flotr:mousemoveOnChart", this.mouseMoveOnChart.bind(this), !0);
                    this._chartElement.addEventListener("flotr:mousemoveOffChart", this.mouseMoveOffChart.bind(this), !0);
                    this._chartElement.addEventListener("flotr:clickOnChart", this.mouseClickOnChart.bind(this), !0);
                    this._chartElement.addEventListener("flotr:mouseoutOfChart", this.mouseMoveOffControl.bind(this), !0);
                    this._chartElement.addEventListener("flotr:mouseclickOffChart", this.mouseClickOffChart.bind(this), !0);
                    this._chartElement.addEventListener("flotr:initializeSeries", this.initializeFlotrContext.bind(this), !0);
                    this._chartElement.addEventListener("flotr:initializeCanvas", this.initializeFlotrContext.bind(this), !0)
                }
                return ChartViewModel.prototype.dispose = function() {
                        this._chartElement.removeEventListener("flotr:mousemoveOnChart", this.mouseMoveOnChart);
                        this._chartElement.removeEventListener("flotr:mousemoveOffChart", this.mouseMoveOffChart);
                        this._chartElement.removeEventListener("flotr:clickOnChart", this.mouseClickOnChart);
                        this._chartElement.removeEventListener("flotr:mouseoutOfChart", this.mouseMoveOffControl)
                    }, Object.defineProperty(ChartViewModel.prototype, "viewState", {
                        get: function() {
                            return this._viewState
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(ChartViewModel.prototype, "properties", {
                            get: function() {
                                return this._properties
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ChartViewModel.prototype, "behaviors", {
                            get: function() {
                                return this._behaviors
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(ChartViewModel.prototype, "chartElement", {
                            get: function() {
                                return this._chartElement
                            }, enumerable: !0, configurable: !0
                        }), ChartViewModel.prototype.mouseMoveOnChart = function(evt) {
                            this.viewState.disabled() || this.mouseMoveOnChartAction(evt)
                        }, ChartViewModel.prototype.mouseMoveOnChartAction = function(evt){}, ChartViewModel.prototype.mouseMoveOffChart = function(evt) {
                            this.viewState.disabled() || this.mouseMoveOffChartAction(evt)
                        }, ChartViewModel.prototype.mouseMoveOffChartAction = function(evt){}, ChartViewModel.prototype.mouseClickOnChart = function(evt) {
                            this.viewState.disabled() || this.mouseClickOnChartAction(evt)
                        }, ChartViewModel.prototype.mouseClickOnChartAction = function(evt){}, ChartViewModel.prototype.mouseMoveOffControl = function(evt) {
                            this.viewState.disabled() || this.mouseMoveOffControlAction(evt)
                        }, ChartViewModel.prototype.mouseMoveOffControlAction = function(evt){}, ChartViewModel.prototype.mouseClickOffChart = function(evt) {
                            this.viewState.disabled() || this.mouseClickOffChartAction(evt)
                        }, ChartViewModel.prototype.mouseClickOffChartAction = function(evt){}, ChartViewModel.prototype.initializeFlotrContext = function(evt){}, ChartViewModel.prototype.getFadedColors = function(colors, fade) {
                            for (var fadedColors = [], i = 0; i < colors.length; i++)
                                typeof colors[i] == "string" && fadedColors.push(this._getFadedColor(colors[i], fade));
                            return fadedColors
                        }, ChartViewModel.prototype.getColor = function(rgbaColorString) {
                            var colorObject = this.getComponentArray(rgbaColorString);
                            return AppMagic.Functions.rGBA(parseInt(colorObject[1]), parseInt(colorObject[2]), parseInt(colorObject[3]), parseFloat(colorObject[4]))
                        }, ChartViewModel.prototype.getAlpha = function(rgbaColorString) {
                            var colorObject = this.getComponentArray(rgbaColorString);
                            return parseFloat(colorObject[4])
                        }, ChartViewModel.prototype.getColorsFade = function(currentSelectionId, fadedColorsClick, colors) {
                            for (var colorsFade = [], j = 0; j < MAX_ITEMS; j++)
                                colorsFade[j] = j === currentSelectionId ? fadedColorsClick[j] : colors[j];
                            return colorsFade
                        }, ChartViewModel.prototype.getNumericSeriesCount = function(inputItems) {
                            var count = 0;
                            if (inputItems.length > 0)
                                for (var i = 1; i <= 10; i++)
                                    if (inputItems[0] && typeof inputItems[0]["Series" + i] == "number")
                                        count++;
                                    else
                                        break;
                            return count
                        }, ChartViewModel.prototype.getFillTheme = function(inputFillValue, scale) {
                            switch (inputFillValue) {
                                case 4294967296:
                                    return scale ? this._scaleThemeValues(FILL_THEMES[0]) : FILL_THEMES[0];
                                case 4294967297:
                                    return scale ? this._scaleThemeValues(FILL_THEMES[1]) : FILL_THEMES[1];
                                case 4294967298:
                                    return scale ? this._scaleThemeValues(FILL_THEMES[2]) : FILL_THEMES[2];
                                case 4294967299:
                                    return scale ? this._scaleThemeValues(FILL_THEMES[3]) : FILL_THEMES[3];
                                case 4294967300:
                                    return scale ? this._scaleThemeValues(FILL_THEMES[4]) : FILL_THEMES[4]
                            }
                            if (typeof inputFillValue == "number") {
                                for (var result = [], i = 0, i = 0; i < 5; i++)
                                    result.push(AppMagic.Utility.Color.create(AppMagic.Functions.colorFade(inputFillValue, GRADIENT_FADE * i)).toCss());
                                for (i = -1; i > -6; i--)
                                    result.push(AppMagic.Utility.Color.create(AppMagic.Functions.colorFade(inputFillValue, GRADIENT_FADE * i)).toCss());
                                return scale ? this._scaleThemeValues(result) : result
                            }
                            return scale ? this._scaleThemeValues(FILL_THEMES[0]) : FILL_THEMES[0]
                        }, ChartViewModel.prototype.getComponentArray = function(rbgaString) {
                            var rbgaStringLower = rbgaString.toLowerCase(),
                                rbgaStringNoSpaces = rbgaStringLower.replace(/\s/g, "");
                            return /rgba?\((\d+),(\d+),(\d+),(\d.+)/.exec(rbgaStringNoSpaces)
                        }, ChartViewModel.prototype.getMaxLength = function(labelAngle, size, height) {
                            var labelCharSizePx = DEFAULT_SIZE_PX;
                            if (typeof size == "string") {
                                var sizeInPt = parseInt(size);
                                sizeInPt < 1 && (sizeInPt = 1);
                                labelCharSizePx = sizeInPt * PT_TO_PX_RATIO
                            }
                            var availableAngledPx = this.getMaxLabelHeight(height),
                                labelLength = availableAngledPx / labelCharSizePx;
                            return Math.ceil(labelLength)
                        }, ChartViewModel.prototype.getMaxLabelHeight = function(height) {
                            var horizontalPx = DEFAULT_MIN_LABEL_HEIGHT;
                            return height !== null && typeof height == "number" && (horizontalPx = height * LABEL_CHART_HEIGHT_RATIO), horizontalPx
                        }, ChartViewModel.prototype._scaleThemeValues = function(themeValues) {
                            for (var scaledThemeValues = [], i = 0; i < MAX_ITEMS; i++)
                                scaledThemeValues.push(themeValues[i % 10]);
                            return scaledThemeValues
                        }, ChartViewModel.prototype._getFadedColor = function(rgbaColorToFade, fade) {
                            var colorNumber = this.getColor(rgbaColorToFade),
                                fadedColorNumber = AppMagic.Functions.colorFade(colorNumber, fade);
                            return AppMagic.Controls.converters.argbConverter.view(fadedColorNumber)
                        }, ChartViewModel.prototype._getCosineInDegrees = function(value) {
                            var valueRadians = value / 180 * Math.PI;
                            return Math.cos(valueRadians)
                        }, ChartViewModel
            }();
        Controls.ChartViewModel = ChartViewModel
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Chart = function() {
                function Chart(){}
                return Chart.prototype.onChangeFill = function(evt, controlContext) {
                        controlContext.realized && controlContext.viewmodel.changeFill(evt.newValue)
                    }, Chart.prototype.onChangeItems = function(evt, controlContext) {
                        controlContext.realized && controlContext.viewmodel.changeItems(evt.newValue, controlContext.realized)
                    }, Chart.prototype.onChangeFadeOnHover = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeFadeOnHover(evt.newValue)
                        }, Chart.prototype.onChangeFadeOnClick = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeFadeOnClick(evt.newValue)
                        }, Chart.prototype.onChangeFadeOnClickBorder = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeFadeOnClickBorder(evt.newValue)
                        }, Chart.prototype.onChangePaddingLeft = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.redrawChart()
                        }, Chart.prototype.onChangePaddingRight = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.redrawChart()
                        }, Chart.prototype.onChangePaddingTop = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.redrawChart()
                        }, Chart.prototype.onChangePaddingBottom = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.redrawChart()
                        }, Chart
            }();
        Controls.Chart = Chart
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Legend = function() {
                function Legend(){}
                return Legend.prototype.initView = function(container, controlContext) {
                        controlContext.chartElement = container.children[0];
                        controlContext.viewmodel = new AppMagic.Controls.LegendViewModel(controlContext);
                        ko.applyBindings(controlContext, container)
                    }, Legend.prototype.onChangeItems = function(evt, controlContext) {
                        controlContext.realized && controlContext.viewmodel.changeItems(evt.newValue)
                    }, Legend.prototype.onChangeFill = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeFill(evt.newValue)
                        }, Legend.prototype.onChangeSize = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeFontSize(evt.newValue)
                        }, Legend.prototype.onChangeFont = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeFont(evt.newValue)
                        }, Legend
            }();
        Controls.Legend = Legend
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            b.hasOwnProperty(p) && (d[p] = b[p]);
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    },
    AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var SQUARE_ELEMENT = "XX",
            MAX_LEGEND_ITEMS = 100,
            LegendViewModel = function(_super) {
                __extends(LegendViewModel, _super);
                function LegendViewModel(controlContext) {
                    _super.call(this, controlContext);
                    this._legendElement = null;
                    this._colors = null;
                    this._items = null;
                    this._canvasContext = null;
                    this._font = null;
                    this._fontSize = null;
                    this._colors = [];
                    this._items = [];
                    this._font = controlContext.properties.Font();
                    this._fontSize = parseInt(controlContext.properties.Size());
                    this._legendElement = controlContext.chartElement;
                    var canvas = document.createElement("canvas");
                    this._canvasContext = canvas.getContext("2d")
                }
                return LegendViewModel.prototype.changeItems = function(newValue) {
                        this._items = newValue instanceof Array ? newValue.slice(0, MAX_LEGEND_ITEMS) : newValue;
                        this._updateLegend()
                    }, LegendViewModel.prototype.changeFontSize = function(newValue) {
                        this._fontSize = newValue;
                        this._updateLegend()
                    }, LegendViewModel.prototype.changeFont = function(newValue) {
                            newValue && (this._font = newValue, this._updateLegend())
                        }, LegendViewModel.prototype.changeFill = function(newValue) {
                            this._colors = this.getFillTheme(newValue, !0);
                            this._updateLegend()
                        }, LegendViewModel.prototype._updateLegend = function() {
                            var constructedHTML = this._setInnerHtml()
                        }, LegendViewModel.prototype._setInnerHtml = function() {
                            var constructedHTML = "";
                            if (this._legendElement.innerHTML = "", this._items && this._items.length > 0 && typeof this._items[0].Value != "undefined") {
                                var maxWidthInSeries = this._getMaximumItemWidthInSeries(this._items),
                                    minLineHeight = this._getElementWidth(SQUARE_ELEMENT),
                                    seriesItemWidth = maxWidthInSeries + minLineHeight * 2;
                                if (this._colors.length > 0)
                                    for (var i = 0; i < this._items.length; i++) {
                                        var safeHTML = AppMagic.Functions.getSafeHTML(this._items[i].Value, !1),
                                            newliTag = document.createElement("li");
                                        newliTag.className = "legend-item";
                                        newliTag.style.width = seriesItemWidth + "px";
                                        newliTag.style.height = minLineHeight * 1.5 + "px";
                                        var newinputTag = document.createElement("input");
                                        newinputTag.className = "legend-item-label";
                                        newinputTag.style.paddingLeft = minLineHeight / 2 + "px";
                                        newinputTag.setAttribute("unselectable", "on");
                                        newinputTag.setAttribute("disabled", "disabled");
                                        newinputTag.value = safeHTML;
                                        var newdivTag = document.createElement("div");
                                        newdivTag.className = "legend-item-color-box";
                                        newdivTag.style.width = minLineHeight / 2 + "px";
                                        newdivTag.style.height = minLineHeight / 2 + "px";
                                        newdivTag.style.backgroundColor = this._colors[i];
                                        newliTag.appendChild(newinputTag);
                                        newliTag.appendChild(newdivTag);
                                        this._legendElement.appendChild(newliTag)
                                    }
                            }
                        }, LegendViewModel.prototype._getMaximumItemWidthInSeries = function(items) {
                            for (var maxLength = 0, i = 0; i < items.length; i++) {
                                var currentElementWidth = this._getElementWidth(items[i].Value);
                                maxLength < currentElementWidth && (maxLength = currentElementWidth)
                            }
                            return maxLength
                        }, LegendViewModel.prototype._getElementWidth = function(item) {
                            var font = this._fontSize + "pt " + this._font;
                            return this._canvasContext.font = font, this._canvasContext.measureText(item).width
                        }, LegendViewModel
            }(Controls.ChartViewModel);
        Controls.LegendViewModel = LegendViewModel
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var LineChart = function(_super) {
                __extends(LineChart, _super);
                function LineChart() {
                    _super.apply(this, arguments)
                }
                return LineChart.prototype.initView = function(container, controlContext) {
                        var containerChildren = container.children;
                        var lineChartContainer = containerChildren[0],
                            lineChartElement = lineChartContainer.children[0];
                        controlContext.chartElement = lineChartElement;
                        controlContext.id = AppMagic.Utility.generateRandomId("appmagic-linechart");
                        controlContext.viewmodel = new AppMagic.Controls.LineChartViewModel(controlContext);
                        Flotr.defaultOptions.fontColor = "";
                        ko.applyBindings(controlContext.viewmodel, container);
                        controlContext.properties.Items() && controlContext.viewmodel.initProperties(controlContext._previousClickLocationObject);
                        controlContext.clickedItemIndex >= 0 && controlContext.viewmodel.reselectItem(controlContext.clickedItemIndex)
                    }, LineChart.prototype.disposeView = function(container, controlContext) {
                        controlContext._previousClickLocationObject = controlContext.viewmodel._previousClick;
                        controlContext.clickedSeriesIndex = controlContext.viewmodel.selectedSeriesId;
                        controlContext.viewmodel.dispose();
                        controlContext.viewmodel = null
                    }, LineChart.prototype.onChangeWidth = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.redrawChart()
                        }, LineChart.prototype.onChangeHeight = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeHeight()
                        }, LineChart.prototype.onChangeSize = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeLabelSize(evt.newValue)
                        }, LineChart.prototype.onChangeXLabelAngle = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeXLabelAngle(evt.newValue)
                        }, LineChart.prototype.onChangeYLabelAngle = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeYLabelAngle(evt.newValue)
                        }, LineChart.prototype.onChangeYAxisMin = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeYAxisMin(evt.newValue)
                        }, LineChart.prototype.onChangeYAxisMax = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeYAxisMax(evt.newValue)
                        }, LineChart.prototype.onChangeNumberOfSeries = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeNumberOfSeries(evt.newValue)
                        }, LineChart.prototype.onChangeMarkers = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeMarkers(evt.newValue)
                        }, LineChart.prototype.onChangeDisabled = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeDisabled(evt.newValue)
                        }, LineChart
            }(Controls.Chart);
        Controls.LineChart = LineChart
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CHART_TYPE = "lines",
            util = AppMagic.Utility,
            runtimeConstants = AppMagic.Constants.Runtime,
            SERIES_PADDING = .5,
            CANVAS_PADDING = 30,
            ELLIPSIS = "...",
            CANVAS_MIN_WIDTH = 50,
            CANVAS_MIN_HEIGHT = 1,
            BORDER_THICKNESS = 2,
            LineChartViewModel = function(_super) {
                __extends(LineChartViewModel, _super);
                function LineChartViewModel(controlContext) {
                    _super.call(this, controlContext);
                    this._scrollElement = null;
                    this._disabled = null;
                    this._chart = null;
                    this._labelSize = null;
                    this._markers = null;
                    this._labelAngleX = null;
                    this._labelAngleY = null;
                    this._labelColor = null;
                    this._yAxisMin = null;
                    this._yAxisMax = null;
                    this._count = null;
                    this._dataCount = null;
                    this._displayedCount = null;
                    this._canvasWidth = null;
                    this._canvasHeight = null;
                    this._containerWidth = null;
                    this._containerHeight = null;
                    this._previousClick = null;
                    this._series = null;
                    this._canvas = null;
                    this._chartClicked = null;
                    this._selectedSeriesId = null;
                    this._defaultColors = null;
                    this._colors = null;
                    this._fadedColorsHover = null;
                    this._fadedColorsClick = null;
                    this._colorsFade = null;
                    this._fadedBarColors = null;
                    this._formattedItems = null;
                    this._formattedLabels = null;
                    this._show = null;
                    this._rawinput = null;
                    this._scrollElement = controlContext.scrollElement;
                    this._disabled = controlContext.properties.Disabled();
                    this._count = 0;
                    this._dataCount = 0;
                    this._markers = controlContext.properties.Markers();
                    this._labelSize = parseFloat(controlContext.properties.Size());
                    this._labelColor = controlContext.properties.Color();
                    this._labelAngleX = controlContext.properties.XLabelAngle();
                    this._labelAngleY = controlContext.properties.YLabelAngle();
                    this._displayedCount = controlContext.properties.NumberOfSeries();
                    this._containerWidth = ko.observable(String(controlContext.properties.Width()) + "px");
                    this._containerHeight = ko.observable(String(controlContext.properties.Height()) + "px");
                    this._canvasWidth = ko.computed(function() {
                        return String(controlContext.properties.Width() - parseInt(controlContext.properties.PaddingLeft()) - parseInt(controlContext.properties.PaddingRight())) + "px"
                    });
                    this._canvasHeight = ko.computed(function() {
                        return String(controlContext.properties.Height() - parseInt(controlContext.properties.PaddingTop()) - parseInt(controlContext.properties.PaddingBottom())) + "px"
                    });
                    this._previousClick = null;
                    this._chartClicked = !1;
                    this._selectedSeriesId = -1;
                    this._defaultColors = [];
                    this._colors = [];
                    this._fadedColorsHover = [];
                    this._fadedColorsClick = [];
                    this._colorsFade = [];
                    this._fadedBarColors = [];
                    this._formattedItems = [[[0, 0]]];
                    this._formattedLabels = [];
                    this._series = null;
                    this._canvas = null;
                    this.changeFill(null);
                    this._drawChart(this._colors)
                }
                return Object.defineProperty(LineChartViewModel.prototype, "containerWidth", {
                        get: function() {
                            return this._containerWidth()
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(LineChartViewModel.prototype, "containerHeight", {
                        get: function() {
                            return this._containerHeight()
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(LineChartViewModel.prototype, "canvasWidth", {
                            get: function() {
                                return this._canvasWidth()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LineChartViewModel.prototype, "canvasHeight", {
                            get: function() {
                                return this._canvasHeight()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LineChartViewModel.prototype, "selectedSeriesId", {
                            get: function() {
                                return this._selectedSeriesId
                            }, enumerable: !0, configurable: !0
                        }), LineChartViewModel.prototype.mouseClickOnChartAction = function(evt) {
                            if (typeof evt.seriesIndex != "undefined") {
                                var items = this._rawinput;
                                this._selectedSeriesId = evt.seriesIndex;
                                for (var seriesId = evt.seriesIndex + 1, result = [], i = 0; i < items.length; i++) {
                                    var value = items[i]["Series" + seriesId],
                                        label = items[i].Labels;
                                    typeof label != "string" && (label = "Item(" + String(i + 1) + ")");
                                    result.push({
                                        id: items[i][runtimeConstants.idProperty], _src: items[i]._src, Value: value, Labels: label
                                    })
                                }
                                this.properties.SelectedItems(result);
                                this.behaviors.OnSelect()
                            }
                            this._drawChart(this._colors)
                        }, LineChartViewModel.prototype.mouseMoveOnChartAction = function(evt){}, LineChartViewModel.prototype.mouseMoveOffChartAction = function(evt){}, LineChartViewModel.prototype.mouseMoveOffControlAction = function(evt){}, LineChartViewModel.prototype.mouseClickOffChartAction = function(evt) {
                            this._selectedSeriesId = -1;
                            this.properties.SelectedItems([]);
                            this._drawChart(this._colors)
                        }, LineChartViewModel.prototype.initializeFlotrContext = function(evt) {
                            evt.series && (this._series = evt.series[0]);
                            evt.canvas && (this._canvas = evt.canvas)
                        }, LineChartViewModel.prototype.initProperties = function(previousClick) {
                            this.changeFadeOnHover(this.properties.FadeOnHover());
                            this.changeFadeOnClick(this.properties.FadeOnClick());
                            this.changeFadeOnClickBorder(this.properties.FadeOnClickBorder());
                            this.changeFill(this.properties.Fill());
                            this.changeItems(this.properties.Items(), !0);
                            this._previousClick = previousClick;
                            this._drawChart(this._colorsFade);
                            this.changeYAxisMax(this.properties.YAxisMax());
                            this.changeYAxisMin(this.properties.YAxisMin())
                        }, LineChartViewModel.prototype.reselectItem = function(clickedSeriesIndex, clickedItemIndex) {
                            clickedItemIndex >= 0 && clickedSeriesIndex >= 0 && (this._chartClicked = !0, this._selectedSeriesId !== clickedSeriesIndex && (this._selectedSeriesId = clickedSeriesIndex), this._drawChart(this._colorsFade))
                        }, LineChartViewModel.prototype.changeLabelSize = function(newValue) {
                            newValue !== null && newValue > 0 && (this._labelSize = newValue);
                            this._rawinput && (this._formattedLabels = this._getLabels(this._rawinput));
                            this._drawChart(this._colorsFade)
                        }, LineChartViewModel.prototype.changeXLabelAngle = function(newValue) {
                            newValue !== null && (this._labelAngleX = newValue);
                            this._rawinput && (this._formattedLabels = this._getLabels(this._rawinput));
                            this._drawChart(this._colorsFade)
                        }, LineChartViewModel.prototype.changeYLabelAngle = function(newValue) {
                            newValue !== null && (this._labelAngleY = newValue);
                            this._drawChart(this._colorsFade)
                        }, LineChartViewModel.prototype.changeMarkers = function(newValue) {
                            this._markers = newValue !== null ? newValue : !0;
                            this._drawChart(this._colorsFade)
                        }, LineChartViewModel.prototype.changeYAxisMin = function(newValue) {
                            this._yAxisMin = newValue;
                            this._drawChart(this._colorsFade)
                        }, LineChartViewModel.prototype.changeYAxisMax = function(newValue) {
                            this._yAxisMax = newValue;
                            this._drawChart(this._colorsFade)
                        }, LineChartViewModel.prototype.changeFadeOnHover = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedColorsHover = this.getFadedColors(this._colors, newValue / 100))
                        }, LineChartViewModel.prototype.changeFadeOnClick = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedColorsClick = this.getFadedColors(this._colors, newValue / 100))
                        }, LineChartViewModel.prototype.changeFadeOnClickBorder = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedBarColors = this.getFadedColors(this._colors, newValue / 100))
                        }, LineChartViewModel.prototype.changeFill = function(inputFillValue) {
                            var newValue = this.getFillTheme(inputFillValue, !1);
                            if (Array.isArray(newValue) && newValue.length > 0) {
                                this._colors = [];
                                this._colorsFade = [];
                                typeof this._defaultColors == "undefined" && (this._defaultColors = []);
                                for (var i = 0; i < 10; i++) {
                                    this._defaultColors.length < 10 && this._defaultColors.push(newValue[i]);
                                    var componentArray = [];
                                    newValue.length > i && (componentArray = this.getComponentArray(newValue[i]));
                                    newValue.length > i && componentArray !== null && componentArray.length === 5 ? (this._colors.push(newValue[i]), this._colorsFade.push(newValue[i])) : this._defaultColors.length > i && (this._colors.push(this._defaultColors[i]), this._colorsFade.push(this._defaultColors[i]))
                                }
                                this._fadedColorsHover = this.getFadedColors(this._colors, this.properties.FadeOnHover() / 100);
                                this._fadedColorsClick = this.getFadedColors(this._colors, this.properties.FadeOnClick() / 100);
                                this._fadedBarColors = this.getFadedColors(this._colors, this.properties.FadeOnClickBorder() / 100);
                                this._drawChart(this._colorsFade)
                            }
                        }, LineChartViewModel.prototype.changeNumberOfSeries = function(newValue) {
                            this._previousClick = null;
                            newValue > 0 && newValue < 11 && (this._displayedCount = newValue, this._formattedItems = this._addXaxis(this._rawinput || null), this._updateSeriesLabels(this._rawinput), this._drawChart(this._colors))
                        }, LineChartViewModel.prototype.changeItems = function(newValue, realized) {
                            this._previousClick = null;
                            var inputItems = newValue;
                            if (this.properties.SelectedItems(null), this._selectedSeriesId = -1, Array.isArray(inputItems) && inputItems.length > 0) {
                                for (var i = 0, len = inputItems.length; i < len; i++)
                                    inputItems[i] = inputItems[i] || {};
                                this._rawinput = inputItems;
                                this._count = this.getNumericSeriesCount(inputItems);
                                this._formattedItems = this._addXaxis(inputItems);
                                this._formattedLabels = this._getLabels(inputItems)
                            }
                            else
                                this._rawinput = [],
                                this._formattedItems = [[[0, 0]]],
                                this._formattedLabels.length = 0;
                            this._updateSeriesLabels(this._rawinput);
                            this._drawChart(this._colors)
                        }, LineChartViewModel.prototype.changeDisabled = function(newValue) {
                            this._disabled = !!newValue;
                            this._drawChart(this._colors)
                        }, LineChartViewModel.prototype._updateSeriesLabels = function(seriesInput) {
                            var output = [];
                            if (seriesInput && seriesInput.hasOwnProperty(AppMagic.Constants.nameMapProperty) && seriesInput[AppMagic.Constants.nameMapProperty].hasOwnProperty("Series1"))
                                for (var i = 1; i <= this._displayedCount; i++)
                                    output.push({Value: seriesInput[AppMagic.Constants.nameMapProperty]["Series" + i]});
                            else
                                output.push({Value: "Series1"});
                            this.properties.SeriesLabels(output)
                        }, LineChartViewModel.prototype.dispose = function() {
                            this._canvasWidth.dispose();
                            this._canvasHeight.dispose();
                            this._chart.destroy();
                            this._chart = null
                        }, LineChartViewModel.prototype.changeHeight = function() {
                            this._rawinput && (this._formattedLabels = this._getLabels(this._rawinput));
                            this._drawChart(this._colors)
                        }, LineChartViewModel.prototype.redrawChart = function() {
                            this._drawChart(this._colors)
                        }, LineChartViewModel.prototype._addXaxis = function(inputItems) {
                            var result = [];
                            if (Array.isArray(inputItems) && inputItems.length > 0) {
                                var temp = [];
                                if (typeof inputItems[0].Value == "number") {
                                    temp = [];
                                    this._count = 1;
                                    for (var i = 0; i < inputItems.length; i++)
                                        temp.push([i, inputItems[i].Value ? inputItems[i].Value : 0]);
                                    result.push(temp)
                                }
                                else {
                                    this._dataCount = this.getNumericSeriesCount(inputItems);
                                    this._count = this._displayedCount > 0 && this._displayedCount < 11 && this._dataCount > this._displayedCount ? this._displayedCount : this._dataCount;
                                    for (var j = 1; j <= this._count; j++) {
                                        temp = [];
                                        for (var k = 0; k < inputItems.length; k++)
                                            temp.push([k, inputItems[k]["Series" + j] ? inputItems[k]["Series" + j] : 0]);
                                        result.push(temp)
                                    }
                                }
                            }
                            return result.length === 0 && (result = [[[0, 0]]]), result
                        }, LineChartViewModel.prototype._getLabels = function(inputItems) {
                            var result = [];
                            if (!Array.isArray(inputItems))
                                return result;
                            for (var label = null, maxLength = this.getMaxLength(this.properties.XLabelAngle(), this.properties.Size(), this.properties.Height()), i = 0; i < inputItems.length; i++) {
                                var temp = [];
                                typeof inputItems[i].Labels == "string" ? (label = AppMagic.Functions.getSafeHTML(inputItems[i].Labels, !1), label.length > maxLength && (label = label.slice(0, maxLength) + ELLIPSIS), result.push([i, label])) : (label = "[" + String(i + 1) + "]", label.length > maxLength && (label = label.slice(0, maxLength) + ELLIPSIS), result.push([i, label]))
                            }
                            return result
                        }, LineChartViewModel.prototype._drawChart = function(colors) {
                            var maxXaxis = 0;
                            this._formattedItems.length > 0 && (maxXaxis = this._formattedItems[0].length);
                            Flotr.defaultOptions.fontSize = this._labelSize;
                            var alpha = 1;
                            colors[0] && (alpha = this.getAlpha(colors[0]));
                            this._chart = Flotr.draw(this.chartElement, this._formattedItems, {
                                HtmlText: !0, colors: colors, title: "placeholder", defaultType: CHART_TYPE, maxLabelHeight: this.getMaxLabelHeight(this.properties.Height()), disabled: this._disabled, lines: {
                                        show: !0, steps: !1, shadowSize: 0, fillOpacity: 1, stacked: !1, selecetedseries: this._selectedSeriesId, selectedLineWidth: 5
                                    }, points: {show: this._markers}, mouse: {
                                        track: !0, relative: !0, fillOpacity: 1, sensibility: 0, radius: 1, margin: 0, trackDecimals: 1, lineColor: null, trackFormatter: function(obj) {
                                                return "(" + obj.y + ")"
                                            }
                                    }, yaxis: {
                                        autoscale: !0, min: this._yAxisMin, max: this._yAxisMax, autoscaleMargin: 1, showLabels: !0, showMinorLabels: !0, labelsAngle: this._labelAngleY, tickFormatter: this._globAwareNumberFormatter
                                    }, xaxis: {
                                        min: -.5, max: maxXaxis - .5, showLabels: !0, showMinorLabels: !0, labelsAngle: this._labelAngleX, ticks: this._formattedLabels, tickFormatter: this._globAwareNumberFormatter
                                    }, grid: {
                                        verticalLines: !1, outline: "ws", labelColor: this._labelColor, labelMargin: 5
                                    }
                            });
                            this._drawSelection()
                        }, LineChartViewModel.prototype._drawSelection = function() {
                            typeof this._previousClick != "undefined" && this._previousClick !== null && this._series !== null && this._canvas !== null && this._selectedSeriesId >= 0 && (this._previousClick.series.mouse.lineColor = this._fadedBarColors[this._selectedSeriesId], Flotr.plugins.hit.drawSelectedBar(this._series, this._previousClick, this._canvas, this.chartElement, CHART_TYPE, BORDER_THICKNESS))
                        }, LineChartViewModel.prototype._globAwareNumberFormatter = function(val, options) {
                            if (typeof val == "number")
                                return AppMagic.Functions.text(val);
                            var num = parseFloat(val);
                            return isNaN(num) ? val.toString() : AppMagic.Functions.text(num)
                        }, LineChartViewModel
            }(Controls.ChartViewModel);
        Controls.LineChartViewModel = LineChartViewModel
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var PieChart = function(_super) {
                __extends(PieChart, _super);
                function PieChart() {
                    _super.apply(this, arguments)
                }
                return PieChart.prototype.initView = function(container, controlContext) {
                        var containerChildren = container.children;
                        var pieChartElement = containerChildren[0];
                        controlContext.chartElement = pieChartElement;
                        controlContext.id = AppMagic.Utility.generateRandomId("appmagic-piechart");
                        controlContext.viewmodel = new AppMagic.Controls.PieChartViewModel(controlContext);
                        Flotr.defaultOptions.fontColor = "";
                        ko.applyBindings(controlContext.viewmodel, container);
                        controlContext.properties.Items() && controlContext.viewmodel.initProperties(controlContext._previousClickLocationObject);
                        controlContext.clickedItemIndex >= 0 && controlContext.viewmodel.reselectItem(controlContext.clickedItemIndex)
                    }, PieChart.prototype.disposeView = function(container, controlContext) {
                        controlContext._previousClickLocationObject = controlContext.viewmodel._previousClick;
                        controlContext.clickedItemIndex = controlContext.viewmodel.selectedItemId;
                        controlContext.viewmodel.dispose();
                        controlContext.viewmodel = null
                    }, PieChart.prototype.onChangeWidth = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.redrawChart()
                        }, PieChart.prototype.onChangeHeight = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.redrawChart()
                        }, PieChart.prototype.onChangeExplode = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeExplode(evt.newValue)
                        }, PieChart
            }(Controls.Chart);
        Controls.PieChart = PieChart
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var BarChart = function(_super) {
                __extends(BarChart, _super);
                function BarChart() {
                    _super.apply(this, arguments)
                }
                return BarChart.prototype.initView = function(container, controlContext) {
                        var containerChildren = container.children;
                        var barChartContainer = containerChildren[0],
                            scrollElement = barChartContainer.children[0];
                        controlContext.scrollElement = scrollElement;
                        var barChartElements = scrollElement.children;
                        var barChartElement = barChartElements[0];
                        controlContext.chartElement = barChartElement;
                        controlContext.id = AppMagic.Utility.generateRandomId("appmagic-barchart");
                        controlContext.viewmodel = new AppMagic.Controls.BarChartViewModel(controlContext);
                        ko.applyBindings(controlContext.viewmodel, container);
                        controlContext.properties.Items() && controlContext.viewmodel.initProperties(controlContext._previousClickLocationObject);
                        controlContext.clickedSeriesIndex >= 0 && controlContext.viewmodel.reselectItem(controlContext.clickedSeriesIndex)
                    }, BarChart.prototype.disposeView = function(container, controlContext) {
                        controlContext._previousClickLocationObject = controlContext.viewmodel._previousClick;
                        controlContext.clickedSeriesIndex = controlContext.viewmodel.selectedSeriesId;
                        controlContext.viewmodel.dispose();
                        controlContext.viewmodel = null
                    }, BarChart.prototype.onChangeWidth = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeWidth(evt.newValue)
                        }, BarChart.prototype.onChangeHeight = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeHeight(evt.newValue)
                        }, BarChart.prototype.onChangeSize = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeLabelSize(evt.newValue)
                        }, BarChart.prototype.onChangeXLabelAngle = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeXLabelAngle(evt.newValue)
                        }, BarChart.prototype.onChangeYLabelAngle = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeYLabelAngle(evt.newValue)
                        }, BarChart.prototype.onChangeYAxisMin = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeYAxisMin(evt.newValue)
                        }, BarChart.prototype.onChangeYAxisMax = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeYAxisMax(evt.newValue)
                        }, BarChart.prototype.onChangeSeriesOverlap = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeSeriesOverlap(evt.newValue)
                        }, BarChart.prototype.onChangeNumberOfSeries = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeNumberOfSeries(evt.newValue)
                        }, BarChart.prototype.onChangeMinimumBarWidth = function(evt, controlContext) {
                            controlContext.realized && controlContext.viewmodel.changeMinimumBarWidth()
                        }, BarChart
            }(Controls.Chart);
        Controls.BarChart = BarChart
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var util = AppMagic.Utility,
            runtimeConstants = AppMagic.Constants.Runtime,
            MAX_ITEMS = 100,
            MAX_LABEL_LENGTH = 15,
            MAJOR_SLICE_RATIO = 15,
            ELLIPSIS = "...",
            CHART_EXPANDED = 5,
            GRADIENT_FADE = .15,
            PieChartViewModel = function(_super) {
                __extends(PieChartViewModel, _super);
                function PieChartViewModel(controlContext) {
                    _super.call(this, controlContext);
                    this._scrollElement = null;
                    this._chart = null;
                    this._canvasWidth = null;
                    this._canvasHeight = null;
                    this._previousClick = null;
                    this._canvas = null;
                    this._chartClicked = null;
                    this._selectedItemId = null;
                    this._hoverItemId = null;
                    this._defaultColors = null;
                    this._colors = null;
                    this._fadedColorsHover = null;
                    this._fadedColorsClick = null;
                    this._fadedSliceColors = null;
                    this._colorsFade = null;
                    this._formattedItems = null;
                    this._formattedLabels = null;
                    this._rawinput = null;
                    this._explode = null;
                    this._canvasWidth = ko.computed(function() {
                        return controlContext.properties.Width() > 1 ? String(controlContext.properties.Width()) + "px" : "1px"
                    });
                    this._canvasHeight = ko.computed(function() {
                        return controlContext.properties.Height() > 1 ? String(controlContext.properties.Height()) + "px" : "1px"
                    });
                    this._explode = controlContext.properties.Explode();
                    this._chartClicked = !1;
                    this._selectedItemId = -1;
                    this._hoverItemId = -1;
                    this._previousClick = null;
                    this._canvas = null;
                    this._defaultColors = [];
                    this._colors = [];
                    this._fadedColorsHover = [];
                    this._fadedColorsClick = [];
                    this._fadedSliceColors = [];
                    this._colorsFade = [];
                    this._formattedItems = [];
                    this._formattedLabels = [];
                    this.changeFill(null);
                    this._drawChart(this._explode, this._colors)
                }
                return Object.defineProperty(PieChartViewModel.prototype, "canvasWidth", {
                        get: function() {
                            return this._canvasWidth()
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(PieChartViewModel.prototype, "canvasHeight", {
                        get: function() {
                            return this._canvasHeight()
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(PieChartViewModel.prototype, "selectedItemId", {
                            get: function() {
                                return this._selectedItemId
                            }, enumerable: !0, configurable: !0
                        }), PieChartViewModel.prototype.mouseClickOnChartAction = function(evt) {
                            if (typeof evt.itemIndex != "undefined" && typeof evt.seriesIndex != "undefined") {
                                var itemId = evt.seriesIndex,
                                    items = this._rawinput;
                                if (!items || typeof items[itemId] == "undefined")
                                    return;
                                this._chartClicked = !0;
                                var result = [];
                                if (this._previousClick = evt.click_n, this._selectedItemId !== itemId) {
                                    this._colorsFade = this.getColorsFade(itemId, this._fadedColorsClick, this._colors);
                                    var selectedItem = {
                                            id: items[itemId][runtimeConstants.idProperty], _src: items[itemId]._src, Value: items[itemId].Series
                                        };
                                    selectedItem._src.Color = this.getColor(this._colors[itemId]);
                                    selectedItem._src.Label = this._formattedLabels[itemId];
                                    this._selectedItemId = itemId;
                                    this.properties.Selected(selectedItem);
                                    this.behaviors.OnSelect()
                                }
                                this._drawChart(this._getExplode(), this._colorsFade)
                            }
                        }, PieChartViewModel.prototype.mouseMoveOnChartAction = function(evt) {
                            if (typeof evt.itemIndex != "undefined" && typeof evt.seriesIndex != "undefined") {
                                this._hoverItemId = evt.seriesIndex;
                                var items = this._rawinput;
                                if (!items)
                                    return;
                                this._colorsFade = this._colors.slice();
                                for (var j = 0; j < MAX_ITEMS; j++)
                                    this._colorsFade[j] = j === this._selectedItemId ? this._fadedColorsClick[j] : j === evt.seriesIndex ? this._fadedColorsHover[j] : this._colors[j];
                                this._formattedItems && this._formattedItems.length > 1 ? this._drawChart(this._explode + CHART_EXPANDED, this._colorsFade) : this._drawChart(this._explode, this._colorsFade)
                            }
                        }, PieChartViewModel.prototype.mouseMoveOffChartAction = function(evt) {
                            var items = this._rawinput;
                            items && (this._hoverItemId = -1, this._colorsFade = this.getColorsFade(this._selectedItemId, this._fadedColorsClick, this._colors), this._drawChart(this._getExplode(), this._colorsFade))
                        }, PieChartViewModel.prototype.mouseClickOffChartAction = function(evt) {
                            var items = this._rawinput;
                            items && (this._hoverItemId = -1, this._selectedItemId = -1, this.properties.Selected([]), this._colorsFade = this.getColorsFade(this._selectedItemId, this._fadedColorsClick, this._colors), this._drawChart(this._getExplode(), this._colorsFade))
                        }, PieChartViewModel.prototype.mouseMoveOffControlAction = function(evt) {
                            if (this._hoverItemId = -1, !this._chartClicked) {
                                this._colorsFade = this._colors.slice();
                                var selectedItem = null;
                                this._drawChart(this._getExplode(), this._colorsFade)
                            }
                        }, PieChartViewModel.prototype.initializeFlotrContext = function(evt) {
                            evt.canvas && (this._canvas = evt.canvas)
                        }, PieChartViewModel.prototype.initProperties = function(previousClick) {
                            this.changeExplode(this.properties.Explode());
                            this.changeFadeOnHover(this.properties.FadeOnHover());
                            this.changeFadeOnClick(this.properties.FadeOnClick());
                            this.changeFadeOnClickBorder(this.properties.FadeOnClickBorder());
                            this.changeFill(this.properties.Fill());
                            this.changeItems(this.properties.Items(), !0);
                            this._previousClick = previousClick;
                            this._drawChart(this._getExplode(), this._colorsFade)
                        }, PieChartViewModel.prototype.reselectItem = function(clickedItemIndex) {
                            if (clickedItemIndex >= 0) {
                                var itemId = clickedItemIndex;
                                this._chartClicked = !0;
                                this._selectedItemId !== itemId && (this._colorsFade = this.getColorsFade(itemId, this._fadedColorsClick, this._colors), this._selectedItemId = itemId);
                                this._drawChart(this._explode + CHART_EXPANDED, this._colorsFade)
                            }
                        }, PieChartViewModel.prototype.changeExplode = function(newValue) {
                            this._explode = newValue !== null && newValue >= 0 ? newValue : 0;
                            this._drawChart(this._getExplode(), this._colorsFade)
                        }, PieChartViewModel.prototype.changeFadeOnHover = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedColorsHover = this.getFadedColors(this._colors, newValue / 100))
                        }, PieChartViewModel.prototype.changeFadeOnClick = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedColorsClick = this.getFadedColors(this._colors, newValue / 100))
                        }, PieChartViewModel.prototype.changeFadeOnClickBorder = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedSliceColors = this.getFadedColors(this._colors, newValue / 100))
                        }, PieChartViewModel.prototype.changeFill = function(inputFillValue) {
                            var newValue = this.getFillTheme(inputFillValue, !0);
                            if (Array.isArray(newValue) && newValue.length > 0) {
                                this._colors = [];
                                this._colorsFade = [];
                                typeof this._defaultColors == "undefined" && (this._defaultColors = []);
                                for (var i = 0; i < MAX_ITEMS; i++) {
                                    this._defaultColors.length < MAX_ITEMS && this._defaultColors.push(newValue[i]);
                                    var componentArray = [];
                                    newValue.length > i && (componentArray = this.getComponentArray(newValue[i]));
                                    newValue.length > i && componentArray !== null && componentArray.length === 5 ? (this._colors.push(newValue[i]), this._colorsFade.push(newValue[i])) : this._defaultColors.length > i && (this._colors.push(this._defaultColors[i]), this._colorsFade.push(this._defaultColors[i]))
                                }
                                this._fadedColorsHover = this.getFadedColors(this._colors, this.properties.FadeOnHover() / 100);
                                this._fadedColorsClick = this.getFadedColors(this._colors, this.properties.FadeOnClick() / 100);
                                this._fadedSliceColors = this.getFadedColors(this._colors, this.properties.FadeOnClickBorder() / 100);
                                this._drawChart(this._getExplode(), this._colorsFade)
                            }
                        }, PieChartViewModel.prototype.redrawChart = function() {
                            this._drawChart(this._getExplode(), this._colorsFade)
                        }, PieChartViewModel.prototype.changeItems = function(newValue, realized) {
                            var inputItems = newValue;
                            if (this._previousClick = null, this.properties.Selected(null), this._hoverItemId = -1, this._selectedItemId = -1, Array.isArray(inputItems) && inputItems.length > 0) {
                                for (var i = 0, len = inputItems.length; i < len; i++)
                                    inputItems[i] = inputItems[i] || {};
                                inputItems.length >= MAX_ITEMS && (inputItems.length = MAX_ITEMS);
                                this._rawinput = inputItems;
                                this._formattedItems = this._addXaxis(inputItems);
                                this._formattedLabels = this._getLabels(inputItems)
                            }
                            else
                                this._rawinput = [],
                                this._formattedItems.length = 0,
                                this._formattedLabels.length = 0;
                            this._updateSeriesLabels(this._formattedLabels);
                            this._drawChart(this._explode, this._colors)
                        }, PieChartViewModel.prototype._updateSeriesLabels = function(nameMap) {
                            for (var output = [], i = 0; i < nameMap.length; i++)
                                output.push({Value: nameMap[i]});
                            this.properties.SeriesLabels(output)
                        }, PieChartViewModel.prototype.dispose = function() {
                            this._chart.destroy();
                            this._chart = null;
                            this._canvasWidth.dispose();
                            this._canvasHeight.dispose()
                        }, PieChartViewModel.prototype._getExplode = function() {
                            var hasMoreThanOneItem = this._formattedItems && this._formattedItems.length > 1;
                            return this.properties.Selected() && this.properties.Selected().hasOwnProperty("id") && hasMoreThanOneItem ? this._explode + CHART_EXPANDED : this._explode
                        }, PieChartViewModel.prototype._addXaxis = function(inputItems) {
                            var result = [];
                            if (!Array.isArray(inputItems))
                                return result;
                            var type = null;
                            if (typeof inputItems[0].Value == "number" ? type = "Value" : typeof inputItems[0].Series == "number" && (type = "Series"), type)
                                for (var i = 0; i < inputItems.length; i++) {
                                    var temp = [];
                                    inputItems[i][type] >= 0 && (temp.push([0, inputItems[i][type] ? inputItems[i][type] : 0]), result.push(temp))
                                }
                            return result
                        }, PieChartViewModel.prototype._getLabels = function(inputItems) {
                            var result = [];
                            if (!Array.isArray(inputItems))
                                return result;
                            for (var i = 0; i < inputItems.length; i++)
                                if (typeof inputItems[i].Labels == "string") {
                                    var safeLabel = AppMagic.Functions.getSafeHTML(inputItems[i].Labels, !1);
                                    result.push(safeLabel)
                                }
                                else
                                    result.push("Item(" + String(i + 1) + ")");
                            return result
                        }, PieChartViewModel.prototype._drawChart = function(explode, colors) {
                            var id = 0,
                                type = "pie",
                                alpha = 1;
                            colors[0] && (alpha = this.getAlpha(colors[0]));
                            this._chart = Flotr.draw(this.chartElement, this._formattedItems, {
                                colors: colors, HtmlText: !0, defaultType: type, shadowSize: 0, grid: {
                                        verticalLines: !1, horizontalLines: !1, outlineWidth: 0
                                    }, xaxis: {
                                        showLabels: !1, margin: !1
                                    }, yaxis: {
                                        showLabels: !1, margin: !1
                                    }, pie: {
                                        show: !0, explode: explode, fillOpacity: alpha, lineWidth: 2, lineColor: "#FFFFFF", labelFormatter: function(pie, slice) {
                                                var label = "";
                                                return this._selectedItemId === id || this._hoverItemId === id ? label = this._formattedLabels[id++] + " (" + String(AppMagic.Functions.text(slice)) + ")" : this._formattedLabels.length > id && pie / slice < MAJOR_SLICE_RATIO ? (label = this._formattedLabels[id++] + " (" + String(AppMagic.Functions.text(slice)) + ")", label.length > MAX_LABEL_LENGTH && (label = label.slice(0, MAX_LABEL_LENGTH) + ELLIPSIS)) : id++, label
                                            }.bind(this)
                                    }, mouse: {
                                        track: !0, lineColor: null
                                    }, legend: {
                                        position: "se", backgroundColor: "#D2E8FF"
                                    }
                            });
                            typeof this._previousClick != "undefined" && this._previousClick !== null && this._canvas !== null && this._selectedItemId >= 0 && (this._previousClick.series.mouse.lineColor = this._fadedSliceColors[this._selectedItemId], Flotr.plugins.hit.drawSelectedBar(null, this._previousClick, this._canvas, this.chartElement, type))
                        }, PieChartViewModel
            }(Controls.ChartViewModel);
        Controls.PieChartViewModel = PieChartViewModel
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var CHART_TYPE = "bars",
            util = AppMagic.Utility,
            runtimeConstants = AppMagic.Constants.Runtime,
            SERIES_PADDING = .5,
            ELLIPSIS = "...",
            CANVAS_MIN_WIDTH = 50,
            BORDER_THICKNESS = 2,
            BarChartViewModel = function(_super) {
                __extends(BarChartViewModel, _super);
                function BarChartViewModel(controlContext) {
                    _super.call(this, controlContext);
                    this._scrollElement = null;
                    this._chart = null;
                    this._labelSize = null;
                    this._labelAngleX = null;
                    this._labelAngleY = null;
                    this._labelColor = null;
                    this._yAxisMin = null;
                    this._yAxisMax = null;
                    this._count = null;
                    this._seriesOverlap = null;
                    this._dataCount = null;
                    this._displayedCount = null;
                    this._canvasWidth = null;
                    this._canvasHeight = null;
                    this._scrollWidth = null;
                    this._previousClick = null;
                    this._series = null;
                    this._canvas = null;
                    this._chartClicked = null;
                    this._selectedSeriesId = null;
                    this._defaultColors = null;
                    this._colors = null;
                    this._fadedColorsHover = null;
                    this._fadedColorsClick = null;
                    this._colorsFade = null;
                    this._fadedBarColors = null;
                    this._formattedItems = null;
                    this._formattedLabels = null;
                    this._show = null;
                    this._rawinput = null;
                    this._selectedItemId = null;
                    this._paddingForXLabels = null;
                    this._scrollElement = controlContext.scrollElement;
                    this._count = 0;
                    this._dataCount = 0;
                    this._seriesOverlap = controlContext.properties.SeriesOverlap() / 100 * -1;
                    this._labelSize = parseFloat(controlContext.properties.Size());
                    this._labelColor = controlContext.properties.Color();
                    this._labelAngleX = controlContext.properties.XLabelAngle();
                    this._labelAngleY = controlContext.properties.YLabelAngle();
                    this._displayedCount = controlContext.properties.NumberOfSeries();
                    this._paddingForXLabels = ko.observable("0px");
                    this._scrollWidth = ko.computed(function() {
                        return String(controlContext.properties.Width() - parseInt(controlContext.properties.PaddingLeft()) - parseInt(controlContext.properties.PaddingRight())) + "px"
                    });
                    this._canvasHeight = ko.computed(function() {
                        return String(controlContext.properties.Height() - parseInt(controlContext.properties.PaddingTop()) - parseInt(controlContext.properties.PaddingBottom())) + "px"
                    });
                    this._canvasWidth = ko.observable(String(controlContext.properties.Width() - this._getYLabelPadding() - this._getXLabelPadding() + "px"));
                    this._previousClick = null;
                    this._chartClicked = !1;
                    this._selectedSeriesId = -1;
                    this._selectedItemId = -1;
                    this._defaultColors = [];
                    this._colors = [];
                    this._fadedColorsHover = [];
                    this._fadedColorsClick = [];
                    this._colorsFade = [];
                    this._fadedBarColors = [];
                    this._formattedItems = [[[0, 0]]];
                    this._formattedLabels = [];
                    this._series = null;
                    this._canvas = null;
                    this.changeFill(null);
                    this._drawChart(this._colors)
                }
                return Object.defineProperty(BarChartViewModel.prototype, "paddingForXLabels", {
                        get: function() {
                            return this._paddingForXLabels()
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(BarChartViewModel.prototype, "scrollWidth", {
                        get: function() {
                            return this._scrollWidth()
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(BarChartViewModel.prototype, "canvasWidth", {
                            get: function() {
                                return this._canvasWidth()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(BarChartViewModel.prototype, "canvasHeight", {
                            get: function() {
                                return this._canvasHeight()
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(BarChartViewModel.prototype, "selectedSeriesId", {
                            get: function() {
                                return this._selectedSeriesId
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(BarChartViewModel.prototype, "selectedItemId", {
                            get: function() {
                                return this._selectedItemId
                            }, enumerable: !0, configurable: !0
                        }), BarChartViewModel.prototype.mouseClickOnChartAction = function(evt) {
                            if (this._previousClick = null, this._drawChart(this._colorsFade), typeof evt.itemIndex != "undefined" && typeof evt.seriesIndex != "undefined") {
                                this._selectedSeriesId = evt.seriesIndex;
                                this._selectedItemId = evt.itemIndex;
                                var items = this._rawinput,
                                    itemId = evt.itemIndex;
                                if (!items || typeof items[itemId] == "undefined")
                                    return;
                                var seriesId = evt.seriesIndex + 1;
                                this._chartClicked = !0;
                                this._previousClick = evt.click_n;
                                for (var result = [], i = 0; i < items.length; i++) {
                                    var value = items[i]["Series" + seriesId],
                                        label = items[i].Labels;
                                    typeof label != "string" && (label = "Item(" + String(i + 1) + ")");
                                    result.push({
                                        id: items[i][runtimeConstants.idProperty], _src: items[i]._src, Value: value, Labels: label
                                    })
                                }
                                var currentItem = items[itemId],
                                    selectedItem = {
                                        id: currentItem[runtimeConstants.idProperty], _src: currentItem._src, Value: items[itemId]["Series" + seriesId]
                                    };
                                selectedItem._src.Color = this.getColor(this._colors[evt.seriesIndex]);
                                selectedItem._src.Label = currentItem.Labels;
                                this.properties.Selected(selectedItem);
                                this.properties.SelectedItems(result);
                                this.behaviors.OnSelect();
                                this._drawSelection()
                            }
                        }, BarChartViewModel.prototype.mouseMoveOnChartAction = function(evt) {
                            if (typeof evt.itemIndex != "undefined" && typeof evt.seriesIndex != "undefined" && (evt.seriesIndex !== this._selectedSeriesId || evt.itemIndex !== this._selectedItemId)) {
                                var items = this._rawinput,
                                    itemId = evt.itemIndex,
                                    clickData = evt.click_n;
                                clickData.series.mouse.fillColor = this._fadedColorsHover[evt.seriesIndex];
                                Flotr.plugins.hit.drawHoverBar(this._series, clickData, this._canvas, this.chartElement, CHART_TYPE)
                            }
                        }, BarChartViewModel.prototype.mouseMoveOffChartAction = function(evt) {
                            var items = this._rawinput;
                            items && this._drawChart(this._colors)
                        }, BarChartViewModel.prototype.mouseMoveOffControlAction = function(evt) {
                            if (!this._chartClicked) {
                                this._colorsFade = this._colors.slice();
                                var selectedItem = null;
                                this._drawChart(this._colorsFade)
                            }
                        }, BarChartViewModel.prototype.mouseClickOffChartAction = function(evt){}, BarChartViewModel.prototype.initializeFlotrContext = function(evt) {
                            evt.series && (this._series = evt.series[0]);
                            evt.canvas && (this._canvas = evt.canvas)
                        }, BarChartViewModel.prototype.initProperties = function(previousClick) {
                            this.changeFadeOnHover(this.properties.FadeOnHover());
                            this.changeFadeOnClick(this.properties.FadeOnClick());
                            this.changeFadeOnClickBorder(this.properties.FadeOnClickBorder());
                            this.changeFill(this.properties.Fill());
                            this.changeWidth(this.properties.Width());
                            this.changeHeight(this.properties.Height());
                            this.changeItems(this.properties.Items(), !0);
                            this._previousClick = previousClick;
                            this._drawChart(this._colorsFade);
                            this.changeYAxisMax(this.properties.YAxisMax());
                            this.changeYAxisMin(this.properties.YAxisMin())
                        }, BarChartViewModel.prototype.reselectItem = function(clickedSeriesIndex, clickedItemIndex) {
                            clickedItemIndex >= 0 && clickedSeriesIndex >= 0 && (this._chartClicked = !0, (this._selectedSeriesId !== clickedSeriesIndex || this._selectedItemId !== clickedItemIndex) && (this._selectedSeriesId = clickedSeriesIndex, this._selectedItemId = clickedItemIndex), this._drawChart(this._colorsFade))
                        }, BarChartViewModel.prototype.redrawChart = function() {
                            this.changeWidth(this.properties.Width())
                        }, BarChartViewModel.prototype.changeSeriesOverlap = function(newValue) {
                            this._previousClick = null;
                            this._seriesOverlap = newValue !== null ? newValue / 100 * -1 : 0;
                            this._rawinput && (this._formattedItems = this._addXaxis(this._rawinput));
                            this._drawChart(this._colorsFade)
                        }, BarChartViewModel.prototype.changeLabelSize = function(newValue) {
                            newValue !== null && newValue > 0 && (this._labelSize = newValue);
                            this._rawinput && (this._formattedLabels = this._getLabels(this._rawinput));
                            this.changeWidth(this.properties.Width())
                        }, BarChartViewModel.prototype.changeXLabelAngle = function(newValue) {
                            newValue !== null && (this._labelAngleX = newValue);
                            this._rawinput && (this._formattedLabels = this._getLabels(this._rawinput));
                            this._drawChart(this._colorsFade)
                        }, BarChartViewModel.prototype.changeYLabelAngle = function(newValue) {
                            newValue !== null && (this._labelAngleY = newValue);
                            this._drawChart(this._colorsFade)
                        }, BarChartViewModel.prototype.changeYAxisMin = function(newValue) {
                            this._yAxisMin = newValue;
                            this._drawChart(this._colorsFade)
                        }, BarChartViewModel.prototype.changeYAxisMax = function(newValue) {
                            this._yAxisMax = newValue;
                            this._drawChart(this._colorsFade)
                        }, BarChartViewModel.prototype.changeFadeOnHover = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedColorsHover = this.getFadedColors(this._colors, newValue / 100))
                        }, BarChartViewModel.prototype.changeFadeOnClick = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedColorsClick = this.getFadedColors(this._colors, newValue / 100))
                        }, BarChartViewModel.prototype.changeFadeOnClickBorder = function(newValue) {
                            newValue !== null && newValue >= -100 && newValue <= 100 && (this._fadedBarColors = this.getFadedColors(this._colors, newValue / 100))
                        }, BarChartViewModel.prototype.changeMinimumBarWidth = function() {
                            this._resetWidth(!0);
                            this._drawChart(this._colorsFade)
                        }, BarChartViewModel.prototype.changeFill = function(inputFillValue) {
                            var newValue = this.getFillTheme(inputFillValue, !1);
                            if (Array.isArray(newValue) && newValue.length > 0) {
                                this._colors = [];
                                this._colorsFade = [];
                                typeof this._defaultColors == "undefined" && (this._defaultColors = []);
                                for (var i = 0; i < 10; i++) {
                                    this._defaultColors.length < 10 && this._defaultColors.push(newValue[i]);
                                    var componentArray = [];
                                    newValue.length > i && (componentArray = this.getComponentArray(newValue[i]));
                                    newValue.length > i && componentArray !== null && componentArray.length === 5 ? (this._colors.push(newValue[i]), this._colorsFade.push(newValue[i])) : this._defaultColors.length > i && (this._colors.push(this._defaultColors[i]), this._colorsFade.push(this._defaultColors[i]))
                                }
                                this._fadedColorsHover = this.getFadedColors(this._colors, this.properties.FadeOnHover() / 100);
                                this._fadedColorsClick = this.getFadedColors(this._colors, this.properties.FadeOnClick() / 100);
                                this._fadedBarColors = this.getFadedColors(this._colors, this.properties.FadeOnClickBorder() / 100);
                                this._drawChart(this._colorsFade)
                            }
                        }, BarChartViewModel.prototype.changeWidth = function(newValue) {
                            this._drawChart(this._colorsFade);
                            this._resetWidth(!1) || (newValue = Math.max(newValue, CANVAS_MIN_WIDTH), this._canvasWidth((newValue - this._getXLabelPadding() - parseInt(this.properties.PaddingLeft()) - parseInt(this.properties.PaddingRight())).toString() + "px"), this._paddingForXLabels("0px"));
                            this._drawChart(this._colorsFade)
                        }, BarChartViewModel.prototype.changeHeight = function(newValue) {
                            this._rawinput && (this._formattedLabels = this._getLabels(this._rawinput));
                            this._drawChart(this._colorsFade)
                        }, BarChartViewModel.prototype.changeNumberOfSeries = function(newValue) {
                            this._previousClick = null;
                            newValue > 0 && newValue < 11 && (this._displayedCount = newValue, this._formattedItems = this._addXaxis(this._rawinput || null), this._resetWidth(!0), this._updateSeriesLabels(this._rawinput), this._drawChart(this._colors))
                        }, BarChartViewModel.prototype.changeItems = function(newValue, realized) {
                            this._previousClick = null;
                            var inputItems = newValue;
                            if (this.properties.Selected(null), this.properties.SelectedItems(null), Array.isArray(inputItems) && inputItems.length > 0) {
                                for (var i = 0, len = inputItems.length; i < len; i++)
                                    inputItems[i] = inputItems[i] || {};
                                this._rawinput = inputItems;
                                this._count = this.getNumericSeriesCount(inputItems);
                                this._formattedItems = this._addXaxis(inputItems);
                                this._formattedLabels = this._getLabels(inputItems)
                            }
                            else
                                this._rawinput = [],
                                this._formattedItems = [[[0, 0]]],
                                this._formattedLabels.length = 0,
                                realized && (this._canvasWidth(String(this._scrollElement.clientWidth - this._getYLabelPadding() - this._getXLabelPadding()) + "px"), this._paddingForXLabels("0px"));
                            this._updateSeriesLabels(this._rawinput);
                            this._drawChart(this._colors);
                            this._formattedItems.length > 0 && this._resetWidth(!0);
                            this._drawChart(this._colors)
                        }, BarChartViewModel.prototype._updateSeriesLabels = function(seriesInput) {
                            var output = [];
                            if (seriesInput && seriesInput.hasOwnProperty(AppMagic.Constants.nameMapProperty) && seriesInput[AppMagic.Constants.nameMapProperty].hasOwnProperty("Series1"))
                                for (var i = 1; i <= this._displayedCount; i++)
                                    output.push({Value: seriesInput[AppMagic.Constants.nameMapProperty]["Series" + i]});
                            else
                                output.push({Value: "Series1"});
                            this.properties.SeriesLabels(output)
                        }, BarChartViewModel.prototype.dispose = function() {
                            this._scrollWidth.dispose();
                            this._canvasHeight.dispose();
                            this._chart.destroy();
                            this._chart = null
                        }, BarChartViewModel.prototype._addXaxis = function(inputItems) {
                            var result = [];
                            if (Array.isArray(inputItems) && inputItems.length > 0) {
                                var temp = [];
                                if (typeof inputItems[0].Value == "number") {
                                    temp = [];
                                    this._count = 1;
                                    for (var i = 0; i < inputItems.length; i++)
                                        temp.push([i, inputItems[i].Value ? inputItems[i].Value : 0]);
                                    result.push(temp)
                                }
                                else {
                                    this._dataCount = this.getNumericSeriesCount(inputItems);
                                    this._count = this._displayedCount > 0 && this._displayedCount < 11 && this._dataCount > this._displayedCount ? this._displayedCount : this._dataCount;
                                    for (var offset = this._seriesOverlap > 0 ? 1 / (this._count + SERIES_PADDING) : (1 + this._seriesOverlap) / (this._count + SERIES_PADDING), j = 1; j <= this._count; j++) {
                                        temp = [];
                                        for (var k = 0; k < inputItems.length; k++)
                                            temp.push([k + offset * (j - 1), inputItems[k]["Series" + j] ? inputItems[k]["Series" + j] : 0]);
                                        result.push(temp)
                                    }
                                }
                            }
                            return result.length === 0 && (result = [[[0, 0]]]), result
                        }, BarChartViewModel.prototype._getLabels = function(inputItems) {
                            var result = [];
                            if (!Array.isArray(inputItems))
                                return result;
                            for (var label = null, maxLength = this.getMaxLength(this.properties.XLabelAngle(), this.properties.Size(), this.properties.Height()), i = 0; i < inputItems.length; i++) {
                                var temp = [];
                                typeof inputItems[i].Labels == "string" ? (label = AppMagic.Functions.getSafeHTML(inputItems[i].Labels, !1), label.length > maxLength && (label = label.slice(0, maxLength) + ELLIPSIS), result.push([i, label])) : (label = "[" + String(i + 1) + "]", label.length > maxLength && (label = label.slice(0, maxLength) + ELLIPSIS), result.push([i, label]))
                            }
                            return result
                        }, BarChartViewModel.prototype._resetWidth = function(inputChangedFlag) {
                            if (!Array.isArray(this._formattedItems))
                                return !1;
                            if (this._formattedItems.length > 0 && this._count > 0) {
                                var itemsCount = this._formattedItems[0].length,
                                    elementWidth = parseInt(this.chartElement.style.width) - this._getYLabelPadding() - this._getXLabelPadding(),
                                    elementBarWidth = elementWidth / (itemsCount * this._count),
                                    containerWidth = parseInt(this.properties.Width()) - this._getYLabelPadding() - this._getXLabelPadding(),
                                    containerBarWidth = containerWidth / (itemsCount * this._count);
                                if ((elementBarWidth <= this.properties.MinimumBarWidth() || containerBarWidth <= this.properties.MinimumBarWidth() || inputChangedFlag) && itemsCount > 0) {
                                    var newWidth = itemsCount * this._count * this.properties.MinimumBarWidth(),
                                        availableWidth = this.properties.Width() - this._getYLabelPadding() - this._getXLabelPadding() - parseInt(this.properties.PaddingLeft()) - parseInt(this.properties.PaddingRight());
                                    return newWidth > availableWidth ? (this._canvasWidth((itemsCount * this._count * this.properties.MinimumBarWidth() + this._getYLabelPadding()).toString() + "px"), this._paddingForXLabels(this._getXLabelPadding() + "px")) : (this._canvasWidth((availableWidth + this._getYLabelPadding()).toString() + "px"), this._paddingForXLabels("0px")), !0
                                }
                            }
                            return !1
                        }, BarChartViewModel.prototype._getBarWidth = function() {
                            return this._seriesOverlap > 0 ? 1 / (this._count + SERIES_PADDING + this._count * this._seriesOverlap) : 1 / (this._count + SERIES_PADDING)
                        }, BarChartViewModel.prototype._drawChart = function(colors) {
                            Flotr.defaultOptions.fontSize = this._labelSize;
                            var alpha = 1;
                            colors[0] && (alpha = this.getAlpha(colors[0]));
                            var adjustedBarWidth = this._getBarWidth();
                            this._chart = Flotr.draw(this.chartElement, this._formattedItems, {
                                HtmlText: !0, colors: colors, title: "placeholder", defaultType: CHART_TYPE, maxLabelHeight: this.getMaxLabelHeight(this.properties.Height()), bars: {
                                        show: !0, horizontal: !1, shadowSize: 0, barWidth: adjustedBarWidth, fillOpacity: alpha, lineWidth: 0
                                    }, mouse: {
                                        track: !0, relative: !0, fillOpacity: 1, sensibility: 0, radius: 1, margin: 0, trackDecimals: 1, lineColor: null, trackFormatter: Flotr.defaultTrackFormatter
                                    }, yaxis: {
                                        autoscale: !0, autoscaleMargin: 1, min: this._yAxisMin, max: this._yAxisMax, showLabels: !0, showMinorLabels: !0, labelsAngle: this._labelAngleY, tickFormatter: this._globAwareNumberFormatter
                                    }, xaxis: {
                                        showLabels: !0, showMinorLabels: !0, autoscaleMargin: 0, labelsAngle: this._labelAngleX, ticks: this._formattedLabels, tickFormatter: this._globAwareNumberFormatter
                                    }, grid: {
                                        verticalLines: !1, outline: "ws", labelColor: this._labelColor, labelMargin: 10
                                    }
                            });
                            this._drawSelection()
                        }, BarChartViewModel.prototype._drawSelection = function() {
                            typeof this._previousClick != "undefined" && this._previousClick !== null && this._series !== null && this._canvas !== null && this._selectedSeriesId >= 0 && (this._previousClick.series.mouse.lineColor = this._fadedBarColors[this._selectedSeriesId], Flotr.plugins.hit.drawSelectedBar(this._series, this._previousClick, this._canvas, this.chartElement, CHART_TYPE, BORDER_THICKNESS))
                        }, BarChartViewModel.prototype._getXLabelPadding = function() {
                            var lastXLabelElement = this.chartElement ? this.chartElement.getElementsByClassName("flotr-grid-label last flotr-grid-label-x") : null,
                                padding = null;
                            lastXLabelElement && lastXLabelElement.length === 1 && (padding = lastXLabelElement[0].style.width);
                            var numericPadding = parseInt(padding);
                            return isNaN(numericPadding) ? 0 : numericPadding
                        }, BarChartViewModel.prototype._getYLabelPadding = function() {
                            var lastXLabelElement = this.chartElement ? this.chartElement.getElementsByClassName("flotr-grid-label first flotr-grid-label-y") : null,
                                padding = null;
                            lastXLabelElement && lastXLabelElement.length === 1 && (padding = lastXLabelElement[0].style.width);
                            var numericPadding = parseInt(padding);
                            return isNaN(numericPadding) ? 0 : numericPadding
                        }, BarChartViewModel.prototype._globAwareNumberFormatter = function(val, options) {
                            if (typeof val == "number")
                                return AppMagic.Functions.text(val);
                            var num = parseFloat(val);
                            return isNaN(num) ? val.toString() : AppMagic.Functions.text(num)
                        }, BarChartViewModel
            }(Controls.ChartViewModel);
        Controls.BarChartViewModel = BarChartViewModel
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
