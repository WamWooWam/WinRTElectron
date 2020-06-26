//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var EntityType = Microsoft.AppMagic.Authoring.EntityType,
        EntityChangeType = Microsoft.AppMagic.Authoring.EntityChangeType,
        EventOp = Microsoft.AppMagic.Authoring.EventOp,
        EntityEvents = AppMagic.AuthoringTool.ViewModels.EntityManager.events,
        OpenAjaxPropertyNames = AppMagic.AuthoringTool.OpenAjaxPropertyNames,
        UndoManager = WinJS.Class.derive(AppMagic.Utility.Disposable, function UndoManager_ctor(doc, undoManager, selectionManager, entityManager) {
            AppMagic.Utility.Disposable.call(this);
            this._undoManager = undoManager;
            this._selectionManager = selectionManager;
            this._entityManager = entityManager;
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this.track("_undoEvent", {
                changedVisualNames: {}, changedRuleVisualNames: {}, rulesChanged: [], visualRemoved: !1, swapNames: function(oldName, newName) {
                        delete this.changedVisualNames[oldName];
                        this.changedVisualNames[newName] = !0
                    }, screen: null, reset: function() {
                        this.changedVisualNames = {};
                        this.changedRuleVisualNames = {};
                        this.rulesChanged = [];
                        this.visualRemoved = !1;
                        this.screen = null
                    }
            });
            this._eventTracker.add(doc, "ruleevent", this._onUndoRedoRule, this);
            this._eventTracker.add(this._entityManager, EntityEvents.visualadded, this._onUndoRedoVisual, this);
            this._eventTracker.add(this._entityManager, EntityEvents.visualremoved, this._onUndoRedoVisual, this);
            this._eventTracker.add(this._entityManager, EntityEvents.entityrenamed, this._onUndoRedoVisual, this);
            this._eventTracker.add(this._entityManager, EntityEvents.screenadded, this._onUndoRedoVisual, this);
            this._eventTracker.add(this._entityManager, EntityEvents.screenremoved, this._onUndoRedoVisual, this)
        }, {
            _undoManager: null, _selectionManager: null, _entityManager: null, _undoEvent: null, _eventTracker: null, enable: function() {
                    this._undoManager.enable()
                }, disable: function() {
                    this._undoManager.disable()
                }, reset: function() {
                    this._undoManager.reset()
                }, createGroup: function(description) {
                    this._undoManager.createGroup(description)
                }, createUndoableGroup: function(description) {
                    this._undoManager.createUndoableGroup(description)
                }, closeGroup: function() {
                    this._undoManager.closeGroup()
                }, closeUndoableGroup: function() {
                    this._undoManager.closeUndoableGroup()
                }, hasOpenGroup: {get: function() {
                        return this._undoManager.hasOpenGroup
                    }}, add: function(item) {
                    this._undoManager.add(item)
                }, undo: function() {
                    return (this._undoEvent.reset(), this._undoManager.undo()) ? (this.hasOpenGroup || this._navigateAndSelect(), !0) : !1
                }, redo: function() {
                    return (this._undoEvent.reset(), this._undoManager.redo()) ? (this.hasOpenGroup || this._navigateAndSelect(), !0) : !1
                }, _perpetuateUndoAction: function(action) {
                    var success = action();
                    return this.add(function() {
                            this.add(this._perpetuateUndoAction.bind(this, action))
                        }.bind(this)), success
                }, performUndoableAction: function(action, undoaction, redoaction) {
                    var success = null;
                    this.createGroup("Undoable action");
                    try {
                        this.add(this._perpetuateUndoAction.bind(this, undoaction));
                        success = action();
                        this.add(function() {
                            this.add(this._perpetuateUndoAction.bind(this, redoaction))
                        }.bind(this))
                    }
                    finally {
                        this.closeGroup()
                    }
                    return success
                }, _onZIndexChangeAction: function(entititesChanged) {
                    return entititesChanged.forEach(function(entityName) {
                            this._undoEvent.changedRuleVisualNames[entityName] = !0;
                            this._undoEvent.rulesChanged.push({
                                entityName: entityName, propertyName: OpenAjaxPropertyNames.ZIndex
                            })
                        }.bind(this)), !0
                }, onZIndexChange: function(visualNames) {
                    return this._onZIndexChangeAction(visualNames), this.createGroup(""), this.add(this.queueOnZIndexChange.bind(this, visualNames)), this.closeGroup(), !0
                }, queueOnZIndexChange: function(visualNames) {
                    return this.createGroup(""), this.add(this.onZIndexChange.bind(this, visualNames)), this.closeGroup(), !0
                }, _onUndoRedoVisual: function(args) {
                    if (args.detail.changeType === EntityChangeType.undoRedo)
                        switch (args.type) {
                            case EntityEvents.visualadded:
                                this._undoEvent.changedVisualNames[args.detail.visual.name] = !0;
                                this._undoEvent.screen = args.detail.visual.screen;
                                args.detail.visual.notifyCreationComplete();
                                Microsoft.AppMagic.Common.TelemetrySession.telemetry.logUndoRedoAddControl(args.detail.control.template.className, args.detail.control.variantName);
                                break;
                            case EntityEvents.visualremoved:
                                this._undoEvent.visualRemoved = !0;
                                delete this._undoEvent.changedVisualNames[args.detail.visual.name];
                                this._undoEvent.screen = args.detail.visual.screen;
                                Microsoft.AppMagic.Common.TelemetrySession.telemetry.logUndoRedoDeleteControl(args.detail.visual._control.template.className, args.detail.visual._control.variantName);
                                break;
                            case EntityEvents.entityrenamed:
                                var oldName = args.detail.oldName,
                                    newName = args.detail.entity.name;
                                this._undoEvent.swapNames(oldName, newName);
                                this._undoEvent.screen = this._getScreenForEntity(args.detail.entity);
                                break;
                            case EntityEvents.screenadded:
                                var screenVisual = args.detail.screen;
                                this._undoEvent.screen = screenVisual;
                                this._undoEvent.changedVisualNames[screenVisual.name] = !0;
                                Microsoft.AppMagic.Common.TelemetrySession.telemetry.logUndoRedoAddScreen();
                                break;
                            case EntityEvents.screenremoved:
                                this._undoEvent.reset();
                                Microsoft.AppMagic.Common.TelemetrySession.telemetry.logUndoRedoDeleteScreen();
                                break
                        }
                }, _onUndoRedoRule: function(args) {
                    args.entityChangeType === EntityChangeType.undoRedo && args.entityType === EntityType.control && args.propertyName !== OpenAjaxPropertyNames.ZIndex && (this._undoEvent.changedRuleVisualNames[args.entity.name] = !0, this._undoEvent.screen = this._getScreenForEntity(args.entity), args.eventOpType !== EventOp.removed && this._undoEvent.rulesChanged.push({
                            entityName: args.entityName, propertyName: args.propertyName
                        }))
                }, _getScreenForEntity: function(entity) {
                    var entityViewModel = this._entityManager.tryGetVisualByName(entity.name);
                    return entityViewModel || (entityViewModel = this._entityManager.tryGetDataControlByName(entity.name)), entityViewModel ? entityViewModel.screen : this._entityManager.getScreenByName(entity.name)
                }, _navigateAndSelect: function() {
                    this._navigateToScreen();
                    this._selectVisuals();
                    this._setFocusToRule()
                }, _navigateToScreen: function() {
                    this._undoEvent.screen && this._selectionManager.screen.name !== this._undoEvent.screen.name && this._selectionManager.selectScreen(this._undoEvent.screen)
                }, _selectVisuals: function() {
                    Object.keys(this._undoEvent.changedVisualNames).length > 0 ? this._select(this._undoEvent.changedVisualNames) : this._undoEvent.visualRemoved || this._select(this._undoEvent.changedRuleVisualNames)
                }, _select: function(visualNames) {
                    var selectedVisual = this._selectionManager.singleVisual;
                    if (!selectedVisual || Object.keys(visualNames).length !== 1 || !visualNames[selectedVisual.name]) {
                        var shouldSelect = [];
                        for (var visualName in visualNames) {
                            var ctrlVisual = this._entityManager.tryGetVisualByName(visualName);
                            if (ctrlVisual) {
                                var parentName = ctrlVisual.parent.name;
                                this._undoEvent.changedVisualNames[parentName] || this._undoEvent.changedRuleVisualNames[parentName] || shouldSelect.push(ctrlVisual)
                            }
                        }
                        this._selectionManager.selectVisualsOnUndo(shouldSelect)
                    }
                }, _setFocusToRule: function() {
                    var rulesChanged = this._undoEvent.rulesChanged;
                    var selectedVisual = this._selectionManager.singleVisualOrScreen;
                    if (rulesChanged.length === 1 && selectedVisual && selectedVisual.name === rulesChanged[0].entityName) {
                        var rule = selectedVisual.getRuleByPropertyName(rulesChanged[0].propertyName);
                        rule.scrollIntoViewInExpressView()
                    }
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {UndoManager: UndoManager})
})();