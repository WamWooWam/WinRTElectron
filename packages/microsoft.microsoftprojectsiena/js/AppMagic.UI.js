//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        (function(LayoutOrientation) {
            LayoutOrientation[LayoutOrientation.Landscape = 0] = "Landscape";
            LayoutOrientation[LayoutOrientation.Portrait = 1] = "Portrait"
        })(DocumentLayout.LayoutOrientation || (DocumentLayout.LayoutOrientation = {}));
        var LayoutOrientation = DocumentLayout.LayoutOrientation
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        DocumentLayout.instance = null
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        var Constants = function() {
                function Constants(){}
                return Constants.Platforms = {
                        Widescreen169: {
                            width: 1366, height: 768, displayName: AppMagic.Strings.LayoutWidescreen169DisplayName, imageUrl: "/images/appsetting_landscape.svg", aspectRatio: "16/9", aspectRatioDisplay: "16:9"
                        }, SurfacePro3: {
                                width: 1152, height: 768, displayName: AppMagic.Strings.LayoutSurfacePro3DisplayName, imageUrl: "/images/appsetting_landscape.svg", aspectRatio: "3/2", aspectRatioDisplay: "3:2"
                            }, Widescreen1610: {
                                width: 1229, height: 768, displayName: AppMagic.Strings.LayoutWidescreen1610DisplayName, imageUrl: "/images/appsetting_landscape.svg", aspectRatio: "16/10", aspectRatioDisplay: "16:10"
                            }
                    }, Constants.CustomLimits = {
                        Min: 768, Max: 1366
                    }, Constants
            }();
        DocumentLayout.Constants = Constants
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        var LayoutEngine = function() {
                function LayoutEngine(layoutInfo) {
                    this._documentGrids = new Collections.Generic.Dictionary;
                    this._ruleManager = new DocumentLayout.RuleManager;
                    this._visuals = [];
                    this._goalWidth = null;
                    this._goalHeight = null;
                    this._originalHeight = null;
                    this._originalWidth = null;
                    this._layoutInfo = layoutInfo
                }
                return LayoutEngine.prototype.setDesiredLayout = function(width, height) {
                        this._layoutInfo.orientation === 0 ? (this._goalWidth = width, this._goalHeight = height) : (this._goalWidth = height, this._goalHeight = width)
                    }, LayoutEngine.prototype.initialize = function(visuals) {
                        visuals && (this._visuals = visuals);
                        this._layoutInfo.layoutEngineActive ? (this._initialize(this._visuals), this._runEngine()) : this._layoutInfo.setDimensions(this._layoutInfo.width, this._layoutInfo.height, this._layoutInfo.orientation)
                    }, LayoutEngine.prototype.clean = function() {
                            var _this = this;
                            this._documentGrids.keys.forEach(function(value) {
                                _this._documentGrids.getValue(value).dispose()
                            });
                            this._documentGrids = new Collections.Generic.Dictionary;
                            this._goalHeight = null;
                            this._goalWidth = null;
                            Core.Utility.isNullOrUndefined(this._originalWidth) || (this._layoutInfo.setDimensions(this._originalWidth, this._originalHeight, this._layoutInfo.orientation), this._originalWidth = null, this._originalHeight = null)
                        }, LayoutEngine.prototype.addVisual = function(visual) {
                            this._visuals.unshift(visual)
                        }, LayoutEngine.prototype._initialize = function(visuals) {
                            var _this = this;
                            this._originalHeight = this._layoutInfo.height;
                            this._originalWidth = this._layoutInfo.width;
                            visuals.forEach(function(value) {
                                _this._documentGrids.containsKey(value.screen) || _this._documentGrids.addValue(value.screen, new DocumentLayout.ScreenLayoutContainer(_this._layoutInfo, _this._originalWidth, _this._originalHeight, 75, 100));
                                _this._documentGrids.getValue(value.screen).addVisual(value)
                            }, this);
                            this._ruleManager.initializeRules();
                            var zoomWidth = this._goalWidth / this._layoutInfo.width,
                                zoomHeight = this._goalHeight / this._layoutInfo.height,
                                zoom = Math.min(zoomWidth, zoomHeight);
                            if (zoom === zoomWidth) {
                                var scaledHeight = this._goalHeight / zoom;
                                this._layoutInfo.setDimensions(this._originalWidth, scaledHeight, this._layoutInfo.orientation)
                            }
                            else {
                                var scaledWidth = this._goalWidth / zoom;
                                this._layoutInfo.setDimensions(scaledWidth, this._originalHeight, this._layoutInfo.orientation)
                            }
                        }, LayoutEngine.prototype._runEngine = function() {
                            this._ruleManager.runRules(this._documentGrids, this._layoutInfo)
                        }, LayoutEngine
            }();
        DocumentLayout.LayoutEngine = LayoutEngine
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Utility;
    (function(Utility) {
        Utility.Disposable = Core.Knockout.KnockoutDisposable
    })(Utility = AppMagic.Utility || (AppMagic.Utility = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
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
    var DocumentLayout;
    (function(DocumentLayout) {
        var LayoutGrid = function(_super) {
                __extends(LayoutGrid, _super);
                function LayoutGrid(layoutInfo, originalWidth, originalHeight, rowCount, columnCount, visuals) {
                    var _this = this;
                    _super.call(this);
                    this._grid = [];
                    this._layoutInfo = layoutInfo;
                    this._rows = rowCount;
                    this._columns = columnCount;
                    this._originalWidth = originalWidth;
                    this._originalHeight = originalHeight;
                    this._buildGrid();
                    this.trackAnonymous(visuals.subscribe(function(newValue) {
                        _this._computeContainingCellsAndAddVisual(newValue[0])
                    }, this))
                }
                return Object.defineProperty(LayoutGrid.prototype, "grid", {
                        get: function() {
                            return this._grid
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(LayoutGrid.prototype, "rowCount", {
                        get: function() {
                            return this._rows
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(LayoutGrid.prototype, "columnCount", {
                            get: function() {
                                return this._columns
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGrid.prototype, "height", {
                            get: function() {
                                for (var currentHeight = 0, i = 0; i < this._columns; i++) {
                                    var columnHeight = this.getColumnHeight(i);
                                    columnHeight > currentHeight && (currentHeight = columnHeight)
                                }
                                return currentHeight
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGrid.prototype, "width", {
                            get: function() {
                                for (var currentWidth = 0, i = 0; i < this._rows; i++) {
                                    var rowWidth = this.getRowWidth(i);
                                    rowWidth > currentWidth && (currentWidth = rowWidth)
                                }
                                return currentWidth
                            }, enumerable: !0, configurable: !0
                        }), LayoutGrid.prototype.getColumnHeight = function(columnNumber) {
                            for (var totalHeight = 0, i = 0; i < this._rows; i++)
                                totalHeight += this._grid[i][columnNumber].height;
                            return totalHeight
                        }, LayoutGrid.prototype.getRowWidth = function(rowNumber) {
                            for (var totalWidth = 0, i = 0; i < this._columns; i++)
                                totalWidth += this._grid[rowNumber][i].width;
                            return totalWidth
                        }, LayoutGrid.prototype.modifyCellWidth = function(cell, newWidth) {
                            var _this = this;
                            cell.width = newWidth;
                            for (var newEdge = cell.absoluteBoundingBox.right, i = cell.location.column + 1; i < this._columns; i++) {
                                var distanceOffset = this._grid[cell.location.row][i].absoluteX - newEdge;
                                this._grid[cell.location.row][i].visuals.forEach(function(visual) {
                                    _this.visualStartInCell(_this._grid[cell.location.row][i], visual) && (visual.x = visual.x - distanceOffset)
                                }, this);
                                this._grid[cell.location.row][i].absoluteX = newEdge;
                                newEdge = newEdge + this._grid[cell.location.row][i].width
                            }
                        }, LayoutGrid.prototype.modifyCellHeight = function(cell, newHeight) {
                            var _this = this;
                            cell.height = newHeight;
                            for (var newEdge = cell.absoluteBoundingBox.bottom, i = cell.location.row + 1; i < this._rows; i++) {
                                var distanceOffset = this._grid[i][cell.location.column].absoluteY - newEdge;
                                this._grid[i][cell.location.column].visuals.forEach(function(visual) {
                                    _this.visualStartInCell(_this._grid[i][cell.location.column], visual) && (visual.y = visual.y - distanceOffset)
                                }, this);
                                this._grid[i][cell.location.column].absoluteY = newEdge;
                                newEdge = this._grid[i][cell.location.column].absoluteBoundingBox.bottom
                            }
                        }, LayoutGrid.prototype.visualStartInCell = function(cell, visual) {
                            return cell.location.row === visual.containingCell.row && cell.location.column === visual.containingCell.column ? !0 : !1
                        }, LayoutGrid.prototype.widthCondition = function(width) {
                            width === void 0 && (width = this.width);
                            var compareType = this._originalWidth - this._layoutInfo.width > 0 ? !0 : !1;
                            return compareType ? Math.ceil(width) <= this._layoutInfo.width ? !0 : !1 : Math.ceil(width) >= this._layoutInfo.width ? !0 : !1
                        }, LayoutGrid.prototype.heightCondition = function(height) {
                            height === void 0 && (height = this.height);
                            var compareType = this._originalHeight - this._layoutInfo.height > 0 ? !0 : !1;
                            return compareType ? Math.ceil(height) <= this._layoutInfo.height ? !0 : !1 : Math.ceil(height) >= this._layoutInfo.height ? !0 : !1
                        }, LayoutGrid.prototype._computeContainingCellsAndAddVisual = function(visual) {
                            var rowSize = this._layoutInfo.height / this._rows,
                                columnSize = this._layoutInfo.width / this._columns,
                                startingColumn = Math.floor(visual.x / columnSize),
                                startingRow = Math.floor(visual.y / rowSize),
                                endColumn = Math.min(Math.floor((visual.x + visual.width) / columnSize), this._columns - 1),
                                endRow = Math.min(Math.floor((visual.y + visual.height) / rowSize), this._rows - 1);
                            visual.setContainingCell(startingRow, startingColumn);
                            for (var i = startingRow; i <= endRow; i++)
                                for (var j = startingColumn; j <= endColumn; j++)
                                    this._grid[i][j].visuals.unshift(visual)
                        }, LayoutGrid.prototype._buildGrid = function() {
                            for (var rowSize = this._layoutInfo.height / this._rows, columnSize = this._layoutInfo.width / this._columns, i = 0; i < this._rows; i++) {
                                this._grid[i] = [];
                                for (var j = 0; j < this._columns; j++)
                                    this._grid[i][j] = new DocumentLayout.LayoutGridCell(columnSize, rowSize, i, j)
                            }
                        }, LayoutGrid
            }(AppMagic.Utility.Disposable);
        DocumentLayout.LayoutGrid = LayoutGrid
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        var LayoutGridCell = function() {
                function LayoutGridCell(width, height, rowNumber, columnNumber) {
                    this._visuals = [];
                    this._width = width;
                    this._height = height;
                    this._absoluteY = this._height * rowNumber;
                    this._absoluteX = this._width * columnNumber;
                    this._location = {
                        row: rowNumber, column: columnNumber
                    };
                    this._boundingBox = new AppMagic.Rectangle(this._absoluteX, this._absoluteY, this._width, this._height)
                }
                return Object.defineProperty(LayoutGridCell.prototype, "width", {
                        get: function() {
                            return this._width
                        }, set: function(value) {
                                this._width = value;
                                this._updateBoundingBox()
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(LayoutGridCell.prototype, "height", {
                        get: function() {
                            return this._height
                        }, set: function(value) {
                                this._height = value;
                                this._updateBoundingBox()
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(LayoutGridCell.prototype, "absoluteY", {
                            get: function() {
                                return this._absoluteY
                            }, set: function(value) {
                                    this._absoluteY = value;
                                    this._updateBoundingBox()
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridCell.prototype, "absoluteX", {
                            get: function() {
                                return this._absoluteX
                            }, set: function(value) {
                                    this._absoluteX = value;
                                    this._updateBoundingBox()
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridCell.prototype, "location", {
                            get: function() {
                                return this._location
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridCell.prototype, "absoluteBoundingBox", {
                            get: function() {
                                return this._boundingBox
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridCell.prototype, "visuals", {
                            get: function() {
                                return this._visuals
                            }, enumerable: !0, configurable: !0
                        }), LayoutGridCell.prototype._updateBoundingBox = function() {
                            this._boundingBox = new AppMagic.Rectangle(this._absoluteX, this._absoluteY, this._width, this._height)
                        }, LayoutGridCell
            }();
        DocumentLayout.LayoutGridCell = LayoutGridCell
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        var LayoutGridVisual = function() {
                function LayoutGridVisual(x, y, width, height, controlType) {
                    this._x = x;
                    this._y = y;
                    this._width = width;
                    this._height = height;
                    this._controlType = controlType
                }
                return LayoutGridVisual.prototype.setContainingCell = function(row, column) {
                        this._row = row;
                        this._column = column
                    }, Object.defineProperty(LayoutGridVisual.prototype, "width", {
                        get: function() {
                            return this._width()
                        }, set: function(value) {
                                this._width(value)
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(LayoutGridVisual.prototype, "height", {
                            get: function() {
                                return this._height()
                            }, set: function(value) {
                                    this._height(value)
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridVisual.prototype, "x", {
                            get: function() {
                                return this._x()
                            }, set: function(value) {
                                    this._x(value)
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridVisual.prototype, "y", {
                            get: function() {
                                return this._y()
                            }, set: function(value) {
                                    this._y(value)
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridVisual.prototype, "screen", {
                            get: function() {
                                return this._screen
                            }, set: function(value) {
                                    this._screen = value
                                }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridVisual.prototype, "containingCell", {
                            get: function() {
                                return {
                                        row: this._row, column: this._column
                                    }
                            }, enumerable: !0, configurable: !0
                        }), Object.defineProperty(LayoutGridVisual.prototype, "controlType", {
                            get: function() {
                                return this._controlType
                            }, enumerable: !0, configurable: !0
                        }), LayoutGridVisual.prototype.storeOriginal = function() {
                            this._originalX = this.x;
                            this._originalY = this.y;
                            this._originalWidth = this.width;
                            this._originalHeight = this.height
                        }, LayoutGridVisual.prototype.restoreOriginal = function() {
                            this._x(this._originalX);
                            this._y(this._originalY);
                            this._width(this._originalWidth);
                            this._height(this._originalHeight)
                        }, LayoutGridVisual
            }();
        DocumentLayout.LayoutGridVisual = LayoutGridVisual
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        var RuleManager = function() {
                function RuleManager() {
                    this._rules = []
                }
                return RuleManager.prototype.initializeRules = function() {
                        this._rules = [];
                        this._rules.unshift(new DocumentLayout.Rule.BlankSpaceRule)
                    }, RuleManager.prototype.runRules = function(documentScreens, layoutInfo) {
                        this._rules.forEach(function(ruleToRun) {
                            documentScreens.keys.forEach(function(gridKey) {
                                var grid = documentScreens.getValue(gridKey).screenGrid;
                                grid.heightCondition() && grid.widthCondition() || ruleToRun.applyRule(documentScreens.getValue(gridKey).screenGrid, layoutInfo)
                            })
                        })
                    }, RuleManager
            }();
        DocumentLayout.RuleManager = RuleManager
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        var Rule;
        (function(Rule) {
            var BlankSpaceRule = function() {
                    function BlankSpaceRule(){}
                    return BlankSpaceRule.prototype.applyRule = function(grid, layoutInfo) {
                            this._layoutInfo = layoutInfo;
                            grid.widthCondition() || this._freeEmptyColumns(grid);
                            grid.heightCondition() || this._freeEmptyRows(grid)
                        }, BlankSpaceRule.prototype._freeEmptyColumns = function(grid) {
                            var emptyCount = this._getEmptyCount(grid.columnCount, grid.rowCount, function(i, j) {
                                    return grid.grid[i][j]
                                }),
                                widthDifference = grid.getRowWidth(0) - this._layoutInfo.width,
                                resizeAmount = widthDifference / emptyCount.totalEmpty;
                            this._resizeOnEmptiness(grid.modifyCellWidth.bind(grid), grid.columnCount, grid.rowCount, function(i, j) {
                                return grid.grid[j][i]
                            }, resizeAmount, emptyCount.totalEmpty, emptyCount.emptyCount)
                        }, BlankSpaceRule.prototype._freeEmptyRows = function(grid) {
                                var emptyCount = this._getEmptyCount(grid.rowCount, grid.columnCount, function(i, j) {
                                        return grid.grid[j][i]
                                    }),
                                    heightDifference = grid.getColumnHeight(0) - this._layoutInfo.height,
                                    resizeAmount = heightDifference / emptyCount.totalEmpty;
                                this._resizeOnEmptiness(grid.modifyCellHeight.bind(grid), grid.rowCount, grid.columnCount, function(i, j) {
                                    return grid.grid[i][j]
                                }, resizeAmount, emptyCount.totalEmpty, emptyCount.emptyCount)
                            }, BlankSpaceRule.prototype._getEmptyCount = function(dimensionCount, opposingDimensionCount, gridCellAccessor) {
                                for (var emptyCount = new Array(dimensionCount), totalEmpty = 0, i = 0; i < opposingDimensionCount; i++)
                                    for (var j = 0; j < dimensionCount; j++) {
                                        var gridCell = gridCellAccessor(i, j);
                                        gridCell.visuals.length === 0 && (typeof emptyCount[j] != "number" && (emptyCount[j] = 0), emptyCount[j]++, emptyCount[j] === opposingDimensionCount && totalEmpty++)
                                    }
                                return {
                                        totalEmpty: totalEmpty, emptyCount: emptyCount
                                    }
                            }, BlankSpaceRule.prototype._resizeOnEmptiness = function(modifyCellFn, dimensionCount, opposingDimensionCount, gridCellAcessor, resizeAmount, totalEmpty, emptyCount) {
                                for (var i = 0; i < dimensionCount && totalEmpty > 0; i++)
                                    if (emptyCount[i] === opposingDimensionCount)
                                        for (var j = 0; j < opposingDimensionCount; j++)
                                            modifyCellFn(gridCellAcessor(i, j), Math.max(1, gridCellAcessor(i, j).height - resizeAmount))
                            }, BlankSpaceRule
                }();
            Rule.BlankSpaceRule = BlankSpaceRule
        })(Rule = DocumentLayout.Rule || (DocumentLayout.Rule = {}))
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var DocumentLayout;
    (function(DocumentLayout) {
        var ScreenLayoutContainer = function(_super) {
                __extends(ScreenLayoutContainer, _super);
                function ScreenLayoutContainer(layoutInfo, originalWidth, originalHeight, rows, columns) {
                    _super.call(this);
                    this._visuals = ko.observableArray([]);
                    this._screenGrid = new DocumentLayout.LayoutGrid(layoutInfo, originalWidth, originalHeight, rows, columns, this._visuals)
                }
                return ScreenLayoutContainer.prototype.addVisual = function(visual) {
                        visual.storeOriginal();
                        visual.controlType !== "AppMagic.Controls.Group" && this._visuals.unshift(visual)
                    }, Object.defineProperty(ScreenLayoutContainer.prototype, "screenGrid", {
                        get: function() {
                            return this._screenGrid
                        }, enumerable: !0, configurable: !0
                    }), ScreenLayoutContainer.prototype.dispose = function() {
                            this._visuals().forEach(function(value) {
                                value.restoreOriginal()
                            });
                            _super.prototype.dispose.call(this)
                        }, ScreenLayoutContainer
            }(AppMagic.Utility.Disposable);
        DocumentLayout.ScreenLayoutContainer = ScreenLayoutContainer
    })(DocumentLayout = AppMagic.DocumentLayout || (AppMagic.DocumentLayout = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Popups;
    (function(Popups) {
        var DialogContainerClassName = "dialog-container",
            InnerContentClassName = "content-inner",
            Dialog = function() {
                function Dialog(viewModel) {
                    this._state = AppMagic.Constants.DialogState.closed;
                    this._isActive = !1;
                    this._viewModel = null;
                    this._focusKeeper = null;
                    this._defaultCommandIndex = 0;
                    this._cancelCommandIndex = 0;
                    this._completionFunction = null;
                    this._element = null;
                    this._renderPromise = null;
                    this._contentElement = null;
                    this._shortcutsProvider = null;
                    this._viewModel = viewModel;
                    typeof this._viewModel.fullScreen == "undefined" && (this._viewModel.fullScreen = !1);
                    this._element = document.createElement("div");
                    WinJS.Utilities.addClass(this._element, DialogContainerClassName);
                    this._contentElement = document.createElement("div");
                    WinJS.Utilities.addClass(this._contentElement, InnerContentClassName);
                    this._contentElement.viewModel = viewModel;
                    this._focusKeeper = new AppMagic.Utility.FocusKeeper(this._element);
                    var dialogPromise = AppMagic.UI.Utility.createControlAsync(this._element, "/controls/common/dialog/dialog.html"),
                        contentsPromise = AppMagic.UI.Utility.createControlAsync(this._contentElement, this._viewModel.url);
                    this._renderPromise = WinJS.Promise.join([dialogPromise, contentsPromise]);
                    this._shortcutsProvider = this._viewModel.shortcutsProvider = new AppMagic.Common.Shortcuts.DialogShortcutProvider(this, this._viewModel.buttons)
                }
                return Object.defineProperty(Dialog.prototype, "element", {
                        get: function() {
                            return this._element
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Dialog.prototype, "defaultCommandIndex", {
                        get: function() {
                            return this._defaultCommandIndex
                        }, set: function(value) {
                                this._defaultCommandIndex = value
                            }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Dialog.prototype, "cancelCommandIndex", {
                            get: function() {
                                return this._cancelCommandIndex
                            }, set: function(value) {
                                    this._cancelCommandIndex = value
                                }, enumerable: !0, configurable: !0
                        }), Dialog.prototype.showAsync = function() {
                            var promise = new WinJS.Promise(function(c) {
                                    this._completionFunction = c
                                }.bind(this));
                            return this._showDialog(), promise
                        }, Dialog.prototype.cancel = function() {
                            var buttonElements = this._element.getElementsByTagName("button");
                            0 <= this._cancelCommandIndex && this._cancelCommandIndex < buttonElements.length && buttonElements[this._cancelCommandIndex].click()
                        }, Dialog.prototype.close = function(dialogValue) {
                            Popups.DialogManager.notifyDialogClosed(this);
                            this._state === AppMagic.Constants.DialogState.rendered && this._element.parentElement.removeChild(this._element);
                            this._state = AppMagic.Constants.DialogState.closed;
                            this._completionFunction(dialogValue);
                            this._completionFunction = null;
                            this.dispose()
                        }, Dialog.prototype.getFocusedButton = function(buttonElements) {
                            Core.Utility.isNullOrUndefined(buttonElements) && (buttonElements = Array.prototype.slice.call(this._element.getElementsByTagName("button")));
                            for (var len = buttonElements.length, i = 0; i < len; i++)
                                if (document.activeElement === buttonElements[i])
                                    return i;
                            return 0
                        }, Dialog.prototype.focusButtonByIndex = function(index) {
                            var buttonElements = this._element.getElementsByTagName("button");
                            !Core.Utility.isNullOrUndefined(buttonElements) && index > -1 && index < buttonElements.length && buttonElements[index].focus()
                        }, Dialog.prototype.dispose = function() {
                            this._renderPromise.then(function() {
                                Core.Utility.isNullOrUndefined(this._viewModel.dispose) || this._viewModel.dispose();
                                this._contentElement.viewModel = null;
                                ko.cleanNode(this._element)
                            }.bind(this))
                        }, Dialog.prototype._activate = function() {
                            this._isActive = !0;
                            this._element.style.display = "";
                            this._state === AppMagic.Constants.DialogState.rendered && this._focusKeeper.addFocusOutHandler()
                        }, Dialog.prototype._deactivate = function() {
                            this._isActive = !1;
                            this._focusKeeper.removeFocusOutHandler();
                            this._element.style.display = "none"
                        }, Dialog.prototype._showDialog = function() {
                            Popups.DialogManager.notifyDialogOpened(this);
                            this._state = AppMagic.Constants.DialogState.opened;
                            this._renderPromise.then(function() {
                                if (this._state !== AppMagic.Constants.DialogState.closed) {
                                    ko.applyBindings(this._viewModel, this._element);
                                    var contentContainerElements = this._element.getElementsByClassName("content");
                                    contentContainerElements[0].appendChild(this._contentElement);
                                    document.body.insertBefore(this._element, document.body.firstChild);
                                    this._state = AppMagic.Constants.DialogState.rendered;
                                    this._isActive && this._activate()
                                }
                            }.bind(this))
                        }, Dialog
            }();
        Popups.Dialog = Dialog
    })(Popups = AppMagic.Popups || (AppMagic.Popups = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Popups;
    (function(Popups) {
        var DialogManager = function() {
                function DialogManager(){}
                return DialogManager.cancelAll = function() {
                        for (var dialogs = this._openDialogs().slice(0), i = 0, len = dialogs.length; i < len; i++)
                            dialogs[i].cancel()
                    }, DialogManager.notifyDialogOpened = function(dialog) {
                        DialogManager._openDialogs.push(dialog);
                        this._updateActiveDialog()
                    }, DialogManager.notifyDialogClosed = function(dialog) {
                            DialogManager._openDialogs.remove(dialog);
                            this._updateActiveDialog()
                        }, DialogManager.getOpenDialogCount = function() {
                            return DialogManager._openDialogs().length
                        }, DialogManager.getActiveDialog = function() {
                            return DialogManager._activeDialog
                        }, DialogManager._updateActiveDialog = function() {
                            var newActiveDialog = DialogManager._getTopDialogOrNull();
                            DialogManager._activeDialog !== newActiveDialog && (Core.Utility.isNullOrUndefined(DialogManager._activeDialog) || DialogManager._activeDialog._deactivate(), Core.Utility.isNullOrUndefined(newActiveDialog) ? Core.Utility.isNullOrUndefined(AppMagic.context) || Core.Utility.isNullOrUndefined(AppMagic.context.documentViewModel) || AppMagic.context.documentViewModel.focusToScreenCanvas() : newActiveDialog._activate(), DialogManager._activeDialog = newActiveDialog)
                        }, DialogManager._getTopDialogOrNull = function() {
                            var dialogsArray = DialogManager._openDialogs();
                            return dialogsArray.length === 0 ? null : dialogsArray[dialogsArray.length - 1]
                        }, DialogManager._openDialogs = ko.observableArray([]), DialogManager._activeDialog = null, DialogManager._openDialogCount = ko.observable(0), DialogManager
            }();
        Popups.DialogManager = DialogManager
    })(Popups = AppMagic.Popups || (AppMagic.Popups = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var Shortcuts;
        (function(Shortcuts) {
            var BaseShortcutProvider = function() {
                    function BaseShortcutProvider() {
                        this._shortcutKeys = []
                    }
                    return BaseShortcutProvider.prototype.addShortcutKey = function(shortcut, callbackFunction) {
                            this._shortcutKeys.push({
                                shortcut: shortcut, callbackFunction: callbackFunction.bind(this)
                            })
                        }, Object.defineProperty(BaseShortcutProvider.prototype, "shortcutKeys", {
                            get: function() {
                                return this._shortcutKeys
                            }, enumerable: !0, configurable: !0
                        }), BaseShortcutProvider.prototype.reset = function() {
                                while (this._shortcutKeys.length)
                                    this._shortcutKeys.pop()
                            }, BaseShortcutProvider
                }();
            Shortcuts.BaseShortcutProvider = BaseShortcutProvider
        })(Shortcuts = Common.Shortcuts || (Common.Shortcuts = {}))
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Common;
    (function(Common) {
        var Shortcuts;
        (function(Shortcuts) {
            var DialogShortcutProvider = function(_super) {
                    __extends(DialogShortcutProvider, _super);
                    function DialogShortcutProvider(dialog, buttons) {
                        _super.call(this);
                        this._dialog = dialog;
                        this._buildShortcutKeys(buttons)
                    }
                    return DialogShortcutProvider.prototype.reset = function() {
                            _super.prototype.reset.call(this);
                            this.addShortcutKey(AppMagic.Constants.Keys.left, this._handleLeftKey);
                            this.addShortcutKey(AppMagic.Constants.Keys.right, this._handleRightKey);
                            this.addShortcutKey(AppMagic.Constants.Keys.esc, this._handleEscKey)
                        }, DialogShortcutProvider.prototype.addButtonShortcut = function(buttonViewModel) {
                            var shortcut = buttonViewModel.shortcutLetter;
                            Core.Utility.isNullOrUndefined(shortcut) || this.addShortcutKey(shortcut, buttonViewModel.onButtonClick.bind(buttonViewModel))
                        }, DialogShortcutProvider.prototype._buildShortcutKeys = function(buttons) {
                                this.reset();
                                buttons.forEach(this.addButtonShortcut)
                            }, DialogShortcutProvider.prototype._handleLeftKey = function() {
                                return this._dialog.focusButtonByIndex(this._dialog.getFocusedButton() - 1), !1
                            }, DialogShortcutProvider.prototype._handleRightKey = function() {
                                return this._dialog.focusButtonByIndex(this._dialog.getFocusedButton() + 1), !1
                            }, DialogShortcutProvider.prototype._handleEscKey = function() {
                                return this._dialog.cancel(), !0
                            }, DialogShortcutProvider
                }(AppMagic.Common.Shortcuts.BaseShortcutProvider);
            Shortcuts.DialogShortcutProvider = DialogShortcutProvider
        })(Shortcuts = Common.Shortcuts || (Common.Shortcuts = {}))
    })(Common = AppMagic.Common || (AppMagic.Common = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var UI;
    (function(UI) {
        var Utility = function() {
                function Utility(){}
                return Utility.createControlAsync = function(element, uri) {
                        return element.renderedHtmlControlUri = uri, AppMagic.MarkupService.instance.render(uri, element)
                    }, Utility
            }();
        UI.Utility = Utility
    })(UI = AppMagic.UI || (AppMagic.UI = {}))
})(AppMagic || (AppMagic = {}));