//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Constants = AppMagic.AuthoringTool.Constants,
        DataKind = Microsoft.AppMagic.Authoring.DataKind,
        TemplateNames = Microsoft.AppMagic.Authoring.TemplateNames,
        OpenAjaxPropertyNames = AppMagic.AuthoringTool.OpenAjaxPropertyNames,
        ClipboardManager = WinJS.Class.derive(AppMagic.Utility.Disposable, function ClipboardManager_ctor(doc, clipboard, selectionManager, entityManager, controlManager, entityNameFactory, undoManager) {
            AppMagic.Utility.Disposable.call(this);
            this._document = doc;
            this._clipboard = clipboard;
            this._selectionManager = selectionManager;
            this._entityManager = entityManager;
            this._controlManager = controlManager;
            this._entityNameFactory = entityNameFactory;
            this._undoManager = undoManager;
            this._copiedCtrlNames = Object.create(null);
            this._isPasteValid = ko.observable(this._clipboard.isPasteValid);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._eventTracker.add(this._clipboard, "contentchanged", this._onContentChanged, this);
            this._eventTracker.add(window, "focus", this._onContentChanged, this)
        }, {
            _document: null, _clipboard: null, _selectionManager: null, _entityManager: null, _eventTracker: null, _controlManager: null, _entityNameFactory: null, _undoManager: null, _copiedCtrlNames: null, _isPasteValid: null, doCopy: function() {
                    if (this.isCopyValid) {
                        var selectedVisualNames = this._getSelectedVisualNames();
                        this._clipboard.copy(selectedVisualNames);
                        this._reassignCopiedCtrlNames(selectedVisualNames)
                    }
                    else
                        this.doClear()
                }, doCut: function() {
                    var selectedVisualNames = this._getSelectedVisualNames();
                    if (this.isCutValid) {
                        this._undoManager.createGroup("Cut operation");
                        try {
                            this._clipboard.cut(selectedVisualNames);
                            this._copiedCtrlNames = Object.create(null)
                        }
                        finally {
                            this._undoManager.closeGroup()
                        }
                    }
                    else
                        this.doClear()
                }, doPaste: function(position) {
                    this._undoManager.createGroup("Paste operation");
                    var pasteResult = this._clipboard.paste();
                    return pasteResult === null ? (this._undoManager.closeGroup(), WinJS.Promise.as(!1)) : pasteResult.pastedDataKind === DataKind.controls ? this._handlePastedEntities(pasteResult, position).then(function() {
                            this._undoManager.closeGroup()
                        }.bind(this), function() {
                            this._undoManager.closeGroup()
                        }.bind(this)) : pasteResult.data.then(function(text) {
                            return this._doPasteText(text, position)
                        }.bind(this)).then(function() {
                            return this._undoManager.closeGroup()
                        }.bind(this), function() {
                            return this._undoManager.closeGroup()
                        }.bind(this))
                }, _handlePastedEntities: function(pasteResult, position) {
                    var pastedVisuals = this._getEntitiesForControls(pasteResult.data.topLevelControlNames);
                    return this._waitForControlCreation(pasteResult.data.allPastedControlNames).then(function() {
                            for (var result = this._clipboard.pasteRules(pasteResult), dataSourcesPromises = [], iter = pasteResult.data.allPastedControlNames.first(); iter.hasCurrent; iter.moveNext()) {
                                var icontrol = this._document.getControlByName(iter.current);
                                dataSourcesPromises.push(this._controlManager.addControlDataSourcesAsync(icontrol))
                            }
                            return WinJS.Promise.join(dataSourcesPromises).then(this._handlePastedControls.bind(this, position, pastedVisuals))
                        }.bind(this), function() {
                            return WinJS.Promise.wrapError()
                        })
                }, _handlePastedControls: function(position, pastedVisuals) {
                    var selectedVisuals = [];
                    this._refreshRulesForControls(pastedVisuals);
                    var canOffset = this._canOffset(pastedVisuals),
                        offset = canOffset ? this._findBestOffset(pastedVisuals) : 0,
                        bounds = position ? this._getBounds(pastedVisuals) : null;
                    for (var visualName in pastedVisuals) {
                        var visual = pastedVisuals[visualName];
                        selectedVisuals.push(visual);
                        this._copiedCtrlNames[visual.name] = !0;
                        position ? this._reposition(visual, bounds, position) : canOffset && this._offsetVisual(visual, offset);
                        this._clampToContainer(visual);
                        Microsoft.AppMagic.Common.TelemetrySession.telemetry.logPasteControl(visual._control.template.className, visual._control.variantName)
                    }
                    this._entityManager.notifyVisualsCreationComplete(selectedVisuals);
                    selectedVisuals.forEach(function(selectedVisual) {
                        selectedVisual.initGroup()
                    });
                    this._selectionManager.selectVisualsOrGroups(selectedVisuals)
                }, _waitForControlCreation: function(controls) {
                    for (var promises = [], it = controls.first(); it.hasCurrent; it.moveNext())
                        promises.push(AppMagic.context.documentViewModel.controlGallery.waitForVisualInitialization(it.current));
                    return WinJS.Promise.join(promises)
                }, _doPasteText: function(text, position) {
                    var templateResult = Microsoft.AppMagic.Authoring.DocumentFactory.templateStore.tryGetTemplate(Constants.LabelTemplateName + "Template");
                    return AppMagic.context.documentViewModel.controlGallery.addControlAsyncAndNotifyCompletion(Constants.LabelTemplateName, templateResult.template, !0).then(function(labelControl) {
                            var labelEntity = this._entityManager.getEntityByName(labelControl.name);
                            if (labelEntity.setRuleInvariant(Constants.LabelTextPropertyName, '"' + text.replace(/\"/g, "'") + '"'), position) {
                                var labelName = labelEntity.name,
                                    bounds = this._getBounds({labelName: labelEntity});
                                this._reposition(labelEntity, bounds, position)
                            }
                            return this._copiedCtrlNames = Object.create(null), Microsoft.AppMagic.Common.TelemetrySession.telemetry.logPasteText(), !0
                        }.bind(this), function() {
                            return !1
                        })
                }, _canOffset: function(visuals) {
                    for (var visualName in visuals)
                        if (!this._isRuleNumberLiteral(visuals[visualName], OpenAjaxPropertyNames.X) || !this._isRuleNumberLiteral(visuals[visualName], OpenAjaxPropertyNames.Y))
                            return !1;
                    return !0
                }, _getEntitiesForControls: function(names) {
                    for (var pastedVisuals = Object.create(null), it = names.first(); it.hasCurrent; it.moveNext()) {
                        var entityName = it.current,
                            visual = this._entityManager.tryGetVisualByName(entityName);
                        visual && (pastedVisuals[visual.name] = visual)
                    }
                    return pastedVisuals
                }, doClear: function() {
                    this._clipboard.clear();
                    this._copiedCtrlNames = Object.create(null)
                }, isCutValid: {get: function() {
                        return this.isCopyValid
                    }}, isCopyValid: {get: function() {
                        return this._selectionManager.visuals.length > 0
                    }}, isPasteValid: {get: function() {
                        return this._isPasteValid()
                    }}, _onContentChanged: function() {
                    this._isPasteValid(this._clipboard.isPasteValid)
                }, _getBounds: function(visuals) {
                    var maxX = Number.MIN_VALUE,
                        minX = Number.MAX_VALUE,
                        maxY = Number.MIN_VALUE,
                        minY = Number.MAX_VALUE;
                    for (var visualName in visuals) {
                        var visual = visuals[visualName],
                            x = visual.bounds.x,
                            y = visual.bounds.y;
                        maxX = x > maxX ? x : maxX;
                        minX = x < minX ? x : minX;
                        maxY = y > maxY ? y : maxY;
                        minY = y < minY ? y : minY
                    }
                    var centerPoint = {
                            x: (maxX + minX) / 2, y: (maxY + minY) / 2
                        };
                    return {
                            maxX: maxX, minX: minX, maxY: maxY, minY: minY, centerPoint: centerPoint
                        }
                }, _getDelta: function(visual, centerPoint) {
                    return {
                            x: visual.bounds.x - centerPoint.x, y: visual.bounds.y - centerPoint.y
                        }
                }, _reposition: function(visual, bounds, position) {
                    var delta = this._getDelta(visual, bounds.centerPoint);
                    visual.bounds.x = position.x + delta.x;
                    visual.bounds.y = position.y + delta.y
                }, _reassignCopiedCtrlNames: function(selectedVisualNames) {
                    this._copiedCtrlNames = Object.create(null);
                    selectedVisualNames.forEach(function(ctrlName) {
                        this._copiedCtrlNames[ctrlName] = !0
                    }, this)
                }, _getSelectedVisualNames: function() {
                    var visuals = this._selectionManager.visuals;
                    visuals.sort(function(a, b) {
                        return b.zindex - a.zindex
                    });
                    var len = visuals.length,
                        selectedVisualNames = [];
                    if (len > 0)
                        for (var i = 0; i < len; i++)
                            selectedVisualNames.push(visuals[i].name);
                    else
                        this._selectionManager.canvas || selectedVisualNames.push(this._selectionManager.screen.name);
                    return selectedVisualNames
                }, _clampToContainer: function(visual) {
                    if (this._isRuleNumberLiteral(visual, OpenAjaxPropertyNames.Width) && this._isRuleNumberLiteral(visual, OpenAjaxPropertyNames.Height)) {
                        var containerHeight = visual.bounds._containerSize.height,
                            containerWidth = visual.bounds._containerSize.width;
                        visual.bounds.height = Math.min(containerHeight, visual.bounds.height);
                        visual.bounds.width = Math.min(containerWidth, visual.bounds.width)
                    }
                }, _isRuleNumberLiteral: function(visual, propertyInvariantName) {
                    var rule = visual.getRuleByPropertyInvariantName(propertyInvariantName);
                    return rule.isNumberLiteral
                }, _refreshRulesForControls: function(visuals) {
                    for (var visualName in visuals)
                        this._refreshRulesForNestedControls(visuals[visualName])
                }, _refreshRulesForNestedControls: function(controlVisual) {
                    controlVisual.updateRules();
                    for (var child = controlVisual._control.children.first(); child.hasCurrent; child.moveNext()) {
                        var childEntity = this._entityManager.getEntityByName(child.current.name);
                        this._refreshRulesForNestedControls(childEntity)
                    }
                }, _offsetVisual: function(visual, offset) {
                    visual.bounds.x += offset;
                    visual.bounds.y += offset
                }, _findBestOffset: function(pastedVisuals) {
                    for (var offset = 0; !this._checkOffset(pastedVisuals, offset); )
                        offset += Constants.PasteOffset;
                    return offset
                }, _checkOffset: function(pastedVisuals, offset) {
                    for (var visualName in pastedVisuals)
                        if (!this._checkOffsetPerVisual(pastedVisuals[visualName], offset))
                            return !1;
                    return !0
                }, _checkOffsetPerVisual: function(visual, offset) {
                    for (var children = visual.parent._control.children, it = children.first(); it.hasCurrent; it.moveNext()) {
                        var childControlModel = it.current;
                        if (childControlModel.template.positionable) {
                            var childVisual = this._entityManager.visualFromModel(childControlModel);
                            if (this._copiedCtrlNames[childVisual.name] && this._isOffsetInvalid(childVisual, visual, offset))
                                return !1
                        }
                    }
                    return !0
                }, _isOffsetInvalid: function(otherVisual, thisVisual, offset) {
                    return otherVisual.bounds.x === thisVisual.bounds.x + offset && otherVisual.bounds.y === thisVisual.bounds.y + offset && otherVisual.bounds.width === thisVisual.bounds.width && otherVisual.bounds.height === thisVisual.bounds.height
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {ClipboardManager: ClipboardManager})
})();