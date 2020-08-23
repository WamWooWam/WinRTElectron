/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/music1/metadataeditcontrols.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var MetadataField = (function(_super) {
                        __extends(MetadataField, _super);
                        function MetadataField(element, options) {
                            _super.call(this, element, options);
                            this._child = null;
                            this._dataContext = null;
                            this._dataContextHandlers = null;
                            this._domEventHandlers = null;
                            this._child = element.querySelector("[data-ent-type=metadataField]")
                        }
                        Object.defineProperty(MetadataField.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, set: function(value) {
                                    this.updateAndNotify("dataContext", value)
                                }, enumerable: true, configurable: true
                        });
                        MetadataField.prototype.initialize = function() {
                            _super.prototype.initialize.call(this);
                            MS.Entertainment.Utilities.addEventHandlers(this, {dataContextChanged: this._onDataContextChanged.bind(this)});
                            this._domEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {focusout: this._onBlur.bind(this)});
                            this._onDataContextChanged()
                        };
                        MetadataField.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            this._releaseDataContextHandlers();
                            if (this._domEventHandlers) {
                                this._domEventHandlers.cancel();
                                this._domEventHandlers = null
                            }
                        };
                        MetadataField.prototype._onBlur = function() {
                            if (this._unloaded || !this.dataContext || !this._child)
                                return;
                            this.dataContext.value = this._child.winControl ? this._child.winControl.value : this._child.value
                        };
                        MetadataField.prototype._releaseDataContextHandlers = function() {
                            if (this._dataContextHandlers) {
                                this._dataContextHandlers.cancel();
                                this._dataContextHandlers = null
                            }
                        };
                        MetadataField.prototype._onDataContextChanged = function() {
                            if (this._unloaded)
                                return;
                            this._releaseDataContextHandlers();
                            if (this._dataContext) {
                                this._dataContextHandlers = MS.Entertainment.Utilities.addEventHandlers(this._dataContext, {displayValueChanged: this._onDataContextValueChanged.bind(this)});
                                this._onDataContextValueChanged()
                            }
                        };
                        MetadataField.prototype._onDataContextValueChanged = function() {
                            if (this._unloaded || !this.dataContext || !this._child)
                                return;
                            this._child.value = this.dataContext.displayValue
                        };
                        return MetadataField
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.MetadataField = MetadataField;
                var MetadataItemsControl = (function(_super) {
                        __extends(MetadataItemsControl, _super);
                        function MetadataItemsControl(element, options) {
                            this.tallThreshold = 57;
                            this.tallerClassName = "metadataItemsControl-tallerItems";
                            _super.call(this, element, options);
                            this.repeaterContainer = element.querySelector("[data-ent-type=repeaterContainer]") || element
                        }
                        MetadataItemsControl.prototype.initialize = function() {
                            _super.prototype.initialize.call(this);
                            if (this.domElement)
                                this._domEventHandler = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {mselementresize: this.recalculateSize.bind(this)})
                        };
                        MetadataItemsControl.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            if (this._domEventHandler) {
                                this._domEventHandler.cancel();
                                this._domEventHandler = null
                            }
                        };
                        MetadataItemsControl.prototype.itemsRendered = function() {
                            this.recalculateSize()
                        };
                        MetadataItemsControl.prototype.recalculateSize = function() {
                            if (!this.repeaterContainer || !this.domElement || this._unloaded)
                                return;
                            var firstChild = this.repeaterContainer.firstElementChild;
                            var firstChildHeight = 0;
                            if (firstChild)
                                firstChildHeight = firstChild.clientHeight;
                            if (firstChildHeight > this.tallThreshold)
                                WinJS.Utilities.addClass(this.domElement, this.tallerClassName);
                            else
                                WinJS.Utilities.removeClass(this.domElement, this.tallerClassName)
                        };
                        return MetadataItemsControl
                    })(MS.Entertainment.UI.Controls.ItemsControl);
                Controls.MetadataItemsControl = MetadataItemsControl;
                WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.MetadataField);
                WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.MetadataItemsControl)
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/controls/music1/editablecombobox.js:127 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var Utilities = MS.Entertainment.Utilities;
                var EditableComboBox = (function(_super) {
                        __extends(EditableComboBox, _super);
                        function EditableComboBox(element, options) {
                            this.editModeIndex = -1;
                            this._hideClass = "removeFromDisplay";
                            this._inEditMode = false;
                            this._comboBox = element.querySelector("select");
                            this._editBox = element.querySelector("input");
                            _super.call(this, element, options);
                            this.repeaterContainer = this._comboBox || this.domElement
                        }
                        Object.defineProperty(EditableComboBox.prototype, "value", {
                            get: function() {
                                return this._value
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EditableComboBox.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, set: function(value) {
                                    this.updateAndNotify("dataContext", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EditableComboBox.prototype, "inEditMode", {
                            get: function() {
                                return this._inEditMode
                            }, set: function(value) {
                                    this.updateAndNotify("inEditMode", value)
                                }, enumerable: true, configurable: true
                        });
                        EditableComboBox.prototype.initialize = function() {
                            _super.prototype.initialize.call(this);
                            this._onDataContextChanged();
                            this._onEditModeChanged();
                            MS.Entertainment.Utilities.addEventHandlers(this, {
                                inEditModeChanged: this._onEditModeChanged.bind(this), dataContextChanged: this._onDataContextChanged.bind(this)
                            });
                            if (this._comboBox)
                                this._comboBoxEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._comboBox, {change: this._onComboBoxSelection.bind(this)});
                            if (this._editBox)
                                this._editBoxEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._editBox, {focusout: this._onBlur.bind(this)})
                        };
                        EditableComboBox.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            this._releaseDataContextHandlers();
                            if (this._comboBoxEventHandlers) {
                                this._comboBoxEventHandlers.cancel();
                                this._comboBoxEventHandlers = null
                            }
                            if (this._editBoxEventHandlers) {
                                this._editBoxEventHandlers.cancel();
                                this._editBoxEventHandlers = null
                            }
                        };
                        EditableComboBox.prototype.selectTemplate = function(item) {
                            var completePromise;
                            if (!this.isDivider(item))
                                completePromise = _super.prototype.selectTemplate.call(this, item);
                            else
                                completePromise = this.loadDividerTemplate();
                            return completePromise
                        };
                        EditableComboBox.prototype.loadDividerTemplate = function() {
                            var _this = this;
                            var completePromise;
                            if (!this._dividerTemplateProvider)
                                completePromise = this._loadTemplate(this.dividerItemTemplate);
                            else
                                completePromise = WinJS.Promise.wrap(this._dividerTemplateProvider);
                            completePromise = completePromise || WinJS.Promise.wrapError(new Error("No divider template provided"));
                            return completePromise.then(function(template) {
                                    _this._dividerTemplateProvider = template;
                                    return template
                                })
                        };
                        EditableComboBox.prototype.isDivider = function(item) {
                            return !item
                        };
                        EditableComboBox.prototype.applyItemTemplate = function(container, item, index) {
                            if (container)
                                if (this.isDivider(item)) {
                                    container.disabled = true;
                                    WinJS.Utilities.addClass(container, "editableComboBox-divider")
                                }
                                else
                                    container.setAttribute("value", item && item.toString());
                            return container
                        };
                        EditableComboBox.prototype._setValue = function(value) {
                            this.updateAndNotify("value", value)
                        };
                        EditableComboBox.prototype._releaseDataContextHandlers = function() {
                            if (this._dataContextHandlers) {
                                this._dataContextHandlers.cancel();
                                this._dataContextHandlers = null
                            }
                        };
                        EditableComboBox.prototype._onDataContextChanged = function() {
                            if (this._unloaded)
                                return;
                            this._releaseDataContextHandlers();
                            if (this.dataContext) {
                                this.dataSource = this.dataContext.dataSource;
                                this._dataContextHandlers = MS.Entertainment.Utilities.addEventHandlers(this.dataContext, {selectedIndexChanged: this._onSelectionChanged.bind(this)})
                            }
                            else
                                this.dataSource = null;
                            this._onSelectionChanged()
                        };
                        EditableComboBox.prototype._onEditModeChanged = function() {
                            var _this = this;
                            if (this._unloaded)
                                return;
                            if (this.inEditMode)
                                WinJS.Promise.timeout().done(function() {
                                    if (_this.inEditMode && !_this._unloaded) {
                                        Utilities.safeAddClass(_this._comboBox, _this._hideClass);
                                        Utilities.safeRemoveClass(_this._editBox, _this._hideClass);
                                        if (_this._editBox) {
                                            _this._editBox.disabled = false;
                                            _this._editBox.focus()
                                        }
                                    }
                                });
                            else {
                                Utilities.safeAddClass(this._editBox, this._hideClass);
                                Utilities.safeRemoveClass(this._comboBox, this._hideClass);
                                if (this._editBox)
                                    this._editBox.disabled = true
                            }
                        };
                        EditableComboBox.prototype._onComboBoxSelection = function() {
                            if (this._unloaded || !this._comboBox || !this.dataContext || !this.dataSource)
                                return;
                            if (this.isDivider(this.dataSource.item(this._comboBox.selectedIndex)))
                                this._comboBox.selectedIndex = this.dataContext ? this.dataContext.selectedIndex : 0;
                            else if (this._comboBox.selectedIndex >= 0 && this._comboBox.selectedIndex < this.dataContext.dataSource.length)
                                this.dataContext.selectedIndex = this._comboBox.selectedIndex
                        };
                        EditableComboBox.prototype._onBlur = function() {
                            if (this.inEditMode && this._editBox) {
                                this._setValue(this._editBox.value);
                                this.inEditMode = false
                            }
                        };
                        EditableComboBox.prototype._onSelectionChanged = function() {
                            if (this._unloaded || !this.dataContext)
                                return;
                            if (this.dataContext.selectedIndex === this.editModeIndex)
                                this.inEditMode = true;
                            if (this._comboBox && this.dataContext.selectedIndex >= 0 && this.dataContext.selectedIndex < this._comboBox.children.length)
                                this._comboBox.selectedIndex = this.dataContext.selectedIndex;
                            if (!this.inEditMode)
                                this._setValue(this.dataContext.selectedItem)
                        };
                        return EditableComboBox
                    })(MS.Entertainment.UI.Controls.ItemsControl);
                Controls.EditableComboBox = EditableComboBox;
                WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.EditableComboBox)
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
