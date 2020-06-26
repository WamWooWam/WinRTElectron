//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var MaximumNestingDepth = 3,
        TemplateStore = Microsoft.AppMagic.Authoring.DocumentFactory.templateStore,
        ControlGalleryViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function ControlGalleryViewModel_ctor(doc, entityManager, controlManager, entityNameFactory, selectionManager, canvasManager, undoManager, requirementsManager, backstageVm) {
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._document = doc;
            this._entityManager = entityManager;
            this._controlManager = controlManager;
            this._entityNameFactory = entityNameFactory;
            this._selectionManager = selectionManager;
            this._canvasManager = canvasManager;
            this._undoManager = undoManager;
            this._requirementsManager = requirementsManager;
            this._backstageVm = backstageVm;
            this._variantChildControls = Object.create(null);
            this._variantChildrenControlInfo = Object.create(null);
            this._variantParentOverride = [];
            this._visualWaitingPromises = Object.create(null);
            this._visible = ko.observable(!1);
            this._eventTracker.add(entityManager, AppMagic.AuthoringTool.ViewModels.EntityManager.events.visualadded, this._onVisualAdded, this)
        }, {
            _backstageVm: null, _document: null, _entityManager: null, _controlManager: null, _entityNameFactory: null, _selectionManager: null, _canvasManager: null, _undoManager: null, _nextId: 0, _primaryDataFlyoutEnabled: !0, _visible: null, _controlsInCreation: 0, _completeAddedPromise: null, _variantChildControls: null, _variantChildrenControlInfo: null, _variantParentOverride: null, _visualWaitingPromises: null, _requirementsManager: null, waitForVisualAdded: function() {
                    return this._completeAddedPromise ? this._completeAddedPromise.promise : WinJS.Promise.wrap(0)
                }, addControl: function(templateName, variantName, isComposite, groupVisuals) {
                    typeof isComposite == "undefined" && (isComposite = !1);
                    var dependenciesResult = this._tryGetControlDependencies(templateName, isComposite);
                    if (dependenciesResult.success)
                        return this._controlsInCreation === 0 && (this._completeAddedPromise = new Core.Promise.createCompletablePromise), this._controlsInCreation++, isComposite ? (this._undoManager.createGroup("Adding control: " + templateName), this._addCompositeControlAsync(templateName, dependenciesResult).then(function() {
                                    AppMagic.context.documentViewModel.undoManager.closeGroup();
                                    Microsoft.AppMagic.Common.TelemetrySession.telemetry.logAddControl(templateName, "");
                                    this._controlsInCreation--;
                                    this._controlsInCreation === 0 && this._completeAddedPromise.complete()
                                }.bind(this))) : this._addNonCompositeControl(templateName, variantName, groupVisuals).then(function(control) {
                                    return this._controlsInCreation--, this._controlsInCreation === 0 && this._completeAddedPromise.complete(), control
                                }.bind(this))
                }, _tryGetControlDependencies: function(templateName, isComposite) {
                    if (isComposite) {
                        var templateResult = TemplateStore.tryGetCompositeControlTemplate(templateName + "Template");
                        var controlTemplate = templateResult.template;
                        var connectorId = controlTemplate.restServiceConnectorId;
                        if (connectorId) {
                            var serviceNamespace = this._backstageVm.getServiceNamespaceForConnectorId(connectorId);
                            if (serviceNamespace === null) {
                                var onConnectedCallback = function() {
                                        this.addControl(templateName, "", !0)
                                    }.bind(this);
                                return this._backstageVm.connectToServiceByConnectorId(connectorId, onConnectedCallback), {success: !1}
                            }
                            else
                                return {
                                        success: !0, serviceNamespace: serviceNamespace
                                    }
                        }
                        else
                            return {
                                    success: !0, serviceNamespace: ""
                                }
                    }
                    else
                        return {success: !0}
                }, addGroup: function(visuals) {
                    return visuals || (visuals = this._selectionManager.selection), this.addControl("Group", "", !1, visuals)
                }, _addNonCompositeControl: function(templateName, variantName, groupVisuals) {
                    var controlTemplateInfo = this._getControlTemplateInfo(templateName, variantName);
                    return this.addControlAsyncAndNotifyCompletion(templateName, controlTemplateInfo.controlTemplate, !0, variantName, controlTemplateInfo.childrenTemplates, groupVisuals).then(function(control) {
                            return Microsoft.AppMagic.Common.TelemetrySession.telemetry.logAddControl(templateName, variantName ? variantName : ""), control
                        })
                }, _getControlTemplateInfo: function(templateName, variantName) {
                    var templateResult = TemplateStore.tryGetTemplate(templateName + "Template");
                    var controlTemplate = templateResult.template;
                    var childrenTemplates = [];
                    return variantName && (childrenTemplates = this._getVariantChildren(controlTemplate, variantName)), {
                            controlTemplate: controlTemplate, childrenTemplates: childrenTemplates
                        }
                }, _getVariantChildren: function(controlTemplate, variantName) {
                    var childrenTemplates = [],
                        result = controlTemplate.tryGetControlVariant(variantName);
                    var controlVariant = result.controlVariant;
                    return controlVariant.childControlNames.forEach(function(childControlName) {
                            var childControlInfo = controlVariant.childControls[childControlName];
                            var getChildTemplateResult = TemplateStore.tryGetTemplate(childControlInfo.template + "Template");
                            var childTemplate = getChildTemplateResult.template;
                            childrenTemplates.push({
                                info: childControlInfo, template: childTemplate
                            })
                        }), childrenTemplates
                }, showVisualGallery: function() {
                    AppMagic.Controls.Importer.waitForControlImport().then(function() {
                        this._visible(!0);
                        AppMagic.context.views.ControlGalleryView.resetGallery()
                    }.bind(this))
                }, toggleVisualGallery: function() {
                    this._visible(!this.visible);
                    AppMagic.context.documentViewModel.configuration.ensureHidden()
                }, assignNewVisualParent: function(visual) {
                    var singleSelectedVisual = this._selectionManager.singleVisual;
                    if (!visual.parent) {
                        if (this._variantParentOverride.length > 0) {
                            var variantCanvas = this._variantParentOverride[0],
                                variantCanvasOwner = variantCanvas.owner;
                            visual.setCanvasInfo(variantCanvas.id, variantCanvas.replicateControls);
                            visual.parent = variantCanvasOwner
                        }
                        else if (this._selectionManager.canvas) {
                            var canvasOwner = this._selectionManager.canvas.owner;
                            visual.setCanvasInfo(this._selectionManager.canvas.id);
                            visual.parent = canvasOwner
                        }
                        else
                            singleSelectedVisual && singleSelectedVisual.parent && singleSelectedVisual.parent.supportsNestedControls && (visual.setCanvasInfo(singleSelectedVisual.canvasId), visual.parent = singleSelectedVisual.parent);
                        if (visual.parent === null) {
                            var selectedVisuals = this._selectionManager.visuals;
                            if (selectedVisuals.length >= 2) {
                                for (var hasSameParent = !0, tparent = selectedVisuals[0].parent, i = 1; i < selectedVisuals.length && hasSameParent; i++)
                                    hasSameParent = hasSameParent && tparent === selectedVisuals[i].parent;
                                visual.parent = hasSameParent ? tparent : this._selectionManager.screen
                            }
                            else
                                visual.parent = this._selectionManager.screen
                        }
                        visual.supportsNestedControls && visual.depth >= MaximumNestingDepth && (visual.parent = this._selectionManager.screen)
                    }
                }, addControlAsyncAndNotifyCompletion: function(controlKindName, controlTemplate, generateUniqueName, variant, variantChildren, groupVisuals) {
                    var ctrl;
                    return this.addControlWithParentAsync(controlKindName, controlTemplate, null, generateUniqueName, variant, variantChildren, groupVisuals).then(function(control) {
                            return ctrl = control, this.waitForVisualInitialization(control.name)
                        }.bind(this)).then(function() {
                            var visual = this._entityManager.getVisualByName(ctrl.name);
                            return visual.notifyCreationComplete(), ctrl
                        }.bind(this))
                }, addControlWithParentAsync: function(controlKindName, controlTemplate, parentControl, generateUniqueName, variant, variantChildren, groupVisuals) {
                    typeof generateUniqueName == "undefined" && (generateUniqueName = !0);
                    typeof variant == "undefined" && (variant = "");
                    var controlId;
                    return this._requirementsManager.ensureRequirements(controlTemplate.requirements).then(function() {
                            var promise = WinJS.Promise.wrap();
                            try {
                                if (this._undoManager.createGroup("Creating control"), controlId = this._entityNameFactory.getName(controlKindName, generateUniqueName), variant !== "") {
                                    for (var childrenRequirementsPromises = [], i = 0, len = variantChildren.length; i < len; i++) {
                                        var childControlInfo = variantChildren[i].info;
                                        var uniqueName = this._entityNameFactory.getName(childControlInfo.name, generateUniqueName);
                                        Object.defineProperty(variantChildren[i], "uniqueName", {
                                            configurable: !1, enumerable: !0, value: uniqueName, writable: !1
                                        });
                                        childrenRequirementsPromises.push(this._requirementsManager.ensureRequirements(variantChildren[i].template.requirements))
                                    }
                                    variantChildren.length > 0 && (this._variantChildControls[controlId] = variantChildren);
                                    promise = WinJS.Promise.join(childrenRequirementsPromises)
                                }
                            }
                            finally {
                                this._undoManager.closeGroup()
                            }
                            return promise
                        }.bind(this)).then(function() {
                            this._undoManager.createGroup("Creating Group");
                            var groupNamesString = "";
                            controlTemplate.name === AppMagic.AuthoringTool.Constants.GroupTemplateName && (Contracts.check(groupVisuals.length > 1), groupNamesString = this._getFlattenedVisualNamesString(groupVisuals));
                            var control = this._document.createControl(controlId, controlTemplate, variant, parentControl, groupNamesString);
                            return this._undoManager.closeGroup(), control
                        }.bind(this))
                }, _getFlattenedVisualNamesString: function(visuals) {
                    var flattenedVisuals = this._flattenVisuals(visuals),
                        flattenedVisualNames = flattenedVisuals.map(function(visual) {
                            return visual.name
                        });
                    return JSON.stringify(flattenedVisualNames)
                }, _flattenVisuals: function(visuals) {
                    var visualsCopy = visuals.slice(0),
                        flattenedVisuals = [];
                    return visualsCopy.forEach(function(visual) {
                            var groupedVisuals = visual.groupedVisuals;
                            groupedVisuals.length > 0 ? (flattenedVisuals = flattenedVisuals.concat(groupedVisuals), visual.ungroup()) : flattenedVisuals.push(visual)
                        }), flattenedVisuals
                }, _onVisualAdded: function(evt) {
                    var visual = evt.detail.visual,
                        control = evt.detail.control,
                        addedType = evt.detail.changeType;
                    var visualInitializationComplete;
                    if (this._visualWaitingPromises[visual.name] = new WinJS.Promise(function(comp) {
                        visualInitializationComplete = function() {
                            comp();
                            delete this._visualWaitingPromises[visual.name]
                        }.bind(this)
                    }.bind(this)), addedType === Microsoft.AppMagic.Authoring.EntityChangeType.creation)
                        WinJS.Promise.wrap().then(function() {
                            return visual.parent ? this._controlManager.waitForControlCreation(visual.parent.name) : (this.assignNewVisualParent(visual), WinJS.Promise.wrap())
                        }.bind(this)).then(function() {
                            return this._undoManager.createGroup("Adding the Visual"), visual.create(this._canvasManager)
                        }.bind(this)).then(function() {
                            return this._controlManager.addControlDataSourcesAsync(control)
                        }.bind(this)).then(function() {
                            return this._addPropertyDefaults(control)
                        }.bind(this)).then(function() {
                            return this._addNestedTemplates(control)
                        }.bind(this)).then(function() {
                            return typeof this._variantChildControls[control.name] != "undefined" ? this._addVariantChildControls(visual, control) : WinJS.Promise.wrap()
                        }.bind(this)).then(function() {
                            visual.updateAfterCreation();
                            this._variantParentOverride.length === 0 && (this._selectionManager.selectVisual(visual), control.isGroupControl && this._setGroupZindex(visual));
                            this._addVariantRules(visual, control)
                        }.bind(this)).done(function() {
                            this._entityManager.notifyResumeVisualUpdate(visual, !1);
                            visualInitializationComplete();
                            this._undoManager.closeGroup();
                            this._showPrimaryDataPropertyFlyout(visual)
                        }.bind(this), function(error) {
                            visualInitializationComplete();
                            this._undoManager.closeGroup()
                        }.bind(this));
                    else if (addedType === Microsoft.AppMagic.Authoring.EntityChangeType.copyPaste || addedType === Microsoft.AppMagic.Authoring.EntityChangeType.clone) {
                        var parentCreationPromise;
                        visual.parent ? parentCreationPromise = this._controlManager.waitForControlCreation(visual.parent.name) : (this.assignNewVisualParent(visual), parentCreationPromise = WinJS.Promise.as(!0));
                        parentCreationPromise.then(function() {
                            return visual.create(this._canvasManager, !0)
                        }.bind(this)).then(function() {
                            return this._controlManager.waitForControlCreation(visual.name)
                        }.bind(this)).then(function() {
                            visual.updateAfterCreation();
                            this._entityManager.notifyResumeVisualUpdate(visual, !1);
                            control.isGroupControl && this._setGroupZindex(visual);
                            visualInitializationComplete()
                        }.bind(this))
                    }
                    else
                        visual.create(this._canvasManager, !0).then(function() {
                            this._entityManager.notifyResumeVisualUpdate(visual, !0);
                            visualInitializationComplete()
                        }.bind(this))
                }, _showPrimaryDataPropertyFlyout: function(visual) {
                    if (Contracts.checkValue(visual), !visual._control.isReplicable && this._primaryDataFlyoutEnabled) {
                        var primaryDataPropertyName = visual.primaryDataPropertyName;
                        primaryDataPropertyName && this._controlManager.waitForControlCreation(visual.name).then(function() {
                            var dataRule = visual.getRuleByPropertyName(primaryDataPropertyName);
                            AppMagic.context.documentViewModel.commandBar.ruleButtonPanel.showRuleFlyoutTrigger.tryInvoke(dataRule)
                        })
                    }
                }, _setGroupZindex: function(visual) {
                    Contracts.checkValue(visual);
                    Contracts.checkValue(visual.parent);
                    var manipulator = new AppMagic.AuthoringTool.ViewModels.ZIndexManipulator(this._canvasManager.getParentCanvasForVisual(visual).visuals, [visual]);
                    manipulator.manipulateSelected(Infinity)
                }, _addNestedTemplates: function(control) {
                    var promises = [],
                        nestedTemplateList = control.template.nestedTemplates;
                    if (nestedTemplateList && nestedTemplateList.size > 0)
                        for (var i = 0, len = nestedTemplateList.size; i < len; i++) {
                            var nestedTemplate = nestedTemplateList.getAt(i),
                                nestedTemplateName = nestedTemplate.name;
                            promises.push(this.addControlWithParentAsync(nestedTemplateName, nestedTemplate, control).then(function(nestedControl) {
                                return this._addPropertyDefaults(nestedControl)
                            }.bind(this)))
                        }
                    if (control.template.dataControlTemplate) {
                        var dataControlEntity;
                        promises.push(this.addControlWithParentAsync(control.template.dataControlTemplate.name, control.template.dataControlTemplate, control).then(function(dataControl) {
                            return dataControlEntity = this._entityManager.tryGetDataControlByName(dataControl.name), this._addPropertyDefaults(dataControl, !!this._variantChildControls[control.name])
                        }.bind(this)).then(function() {
                            dataControlEntity.updateRules()
                        }.bind(this)))
                    }
                    return WinJS.Promise.join(promises)
                }, _addVariantChildControls: function(visual, icontrol) {
                    var result = icontrol.template.tryGetControlVariant(icontrol.variantName);
                    var controlVariant = result.controlVariant;
                    if (controlVariant !== null) {
                        var canvas = this._canvasManager.tryGetNestedCanvasForVisual(visual, 0);
                        var promises = [];
                        try {
                            this._variantParentOverride.push(canvas);
                            for (var childControls = this._variantChildControls[icontrol.name], i = 0, len = childControls.length; i < len; i++) {
                                var childControlInfo = childControls[i];
                                this._variantChildrenControlInfo[childControlInfo.uniqueName] = childControlInfo.info;
                                this.addControlAsyncAndNotifyCompletion(childControlInfo.uniqueName, childControlInfo.template, !1);
                                promises.push(this.waitForVisualInitialization(childControlInfo.uniqueName))
                            }
                            delete this._variantChildControls[icontrol.name]
                        }
                        finally {
                            this._variantParentOverride.pop()
                        }
                        return WinJS.Promise.join(promises)
                    }
                }, waitForVisualInitialization: function(visualName) {
                    var control;
                    return this._controlManager.waitForControlCreation(visualName).then(function(result) {
                            return control = result, this._visualWaitingPromises[visualName] || WinJS.Promise.wrap()
                        }.bind(this)).then(function() {
                            return WinJS.Promise.wrap(control)
                        })
                }, _addPropertyDefaults: function(icontrol, parentIsVariant) {
                    parentIsVariant = !!parentIsVariant;
                    for (var template = icontrol.template, idx = 0, propLength = template.inputProperties.length; idx < propLength; idx++) {
                        var inputProperty = template.inputProperties[idx];
                        if (icontrol.isVariant) {
                            var result = template.tryGetControlVariant(icontrol.variantName);
                            if (result.value) {
                                var variant = result.controlVariant,
                                    propertyResult = variant.tryGetPropertyInvariant(inputProperty.propertyInvariantName);
                                propertyResult.value && (inputProperty = propertyResult.property)
                            }
                        }
                        var defaultValue;
                        if (icontrol.template.className === "AppMagic.Controls.Camera" && inputProperty.propertyInvariantName === "Camera") {
                            var widget = OpenAjax.widget.byId(icontrol.name);
                            defaultValue = typeof widget.getDefaultScriptCamera != "undefined" ? widget.getDefaultScriptCamera() : "0"
                        }
                        else
                            defaultValue = parentIsVariant || icontrol.template.name !== "galleryTemplate" || inputProperty.propertyInvariantName !== "TemplateFill" ? inputProperty.hasSampleData ? inputProperty.sampleDataSourceName : inputProperty.defaultValue : "RGBA(229, 229, 229, 1)";
                        if (defaultValue !== "") {
                            inputProperty.isExpr && (defaultValue = defaultValue.replace(/%CONTROL\.ID%/g, this._document.escapeIdentifier(icontrol.name)));
                            defaultValue = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(defaultValue, this._document);
                            var okay = icontrol.addRule(inputProperty.propertyName, defaultValue, inputProperty.propertyCategory, null, Microsoft.AppMagic.Authoring.RuleAdditionCategories.overwriteExisting)
                        }
                    }
                    return WinJS.Promise.wrap(!0)
                }, _addVariantRules: function(visual, icontrol) {
                    var variantChildInfo = this._variantChildrenControlInfo[icontrol.name];
                    if (typeof variantChildInfo != "undefined") {
                        for (var it = variantChildInfo.rules.first(); it.hasCurrent; it.moveNext()) {
                            var ruleInfo = it.current.value,
                                result = icontrol.template.tryGetPropertyInvariant(ruleInfo.name);
                            var ruleValue = result.property.getExpressionValue(ruleInfo.value, ruleInfo.isExpr);
                            ruleInfo.isExpr && (ruleValue = ruleInfo.value.replace(/%PARENTCONTROL\.ID%/g, this._document.escapeIdentifier(icontrol.parent.name)), ruleValue = ruleValue.replace(/%CONTROL\.ID%/g, this._document.escapeIdentifier(icontrol.name)));
                            ruleValue = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(ruleValue, this._document);
                            visual.setRuleInvariant(ruleInfo.name, ruleValue);
                            AuthoringToolOpenAjax.isBoundsProperty(ruleInfo.name) && !isNaN(ruleValue) && visual.updateBounds(ruleInfo.name, parseInt(ruleValue))
                        }
                        delete this._variantChildrenControlInfo[icontrol.name]
                    }
                }, visible: {
                    get: function() {
                        return this._visible()
                    }, set: function(value) {
                            this._visible(value)
                        }
                }, _addCompositeControlAsync: function(templateName, dependenciesResult) {
                    var templateResult = TemplateStore.tryGetCompositeControlTemplate(templateName + "Template");
                    var controlTemplate = templateResult.template;
                    var connectorId = controlTemplate.restServiceConnectorId;
                    connectorId;
                    var completablePromise = Core.Promise.createCompletablePromise();
                    return this._addCompositeControlChildControls(controlTemplate, dependenciesResult.serviceNamespace, completablePromise.complete), completablePromise.promise
                }, _addCompositeControlChildControls: function(controlTemplate, restServiceName, completeCompositeControlCreation) {
                    var childControls = AppMagic.Utility.enumerableToArray(controlTemplate.childControls),
                        len = childControls.length,
                        childEntities = [],
                        controlMetaDataIdMap = Object.create(null),
                        offset = null,
                        primaryControl = null;
                    this._primaryDataFlyoutEnabled = !1;
                    var addChildControlAsync = function(index) {
                            if (index >= len)
                                childEntities.forEach(function(childEntity) {
                                    childEntity.notifyCreationComplete()
                                }),
                                this._primaryDataFlyoutEnabled = !0,
                                this._selectionManager.selectVisualsOrGroups(childEntities),
                                this.addGroup(childEntities).then(function() {
                                    primaryControl && (this._selectionManager.selectVisual(primaryControl), this._showPrimaryDataPropertyFlyout(primaryControl));
                                    completeCompositeControlCreation()
                                }.bind(this));
                            else {
                                var childControlInfo = childControls[index];
                                var childTemplateName = childControlInfo.templateName;
                                var childControlVariantName = childControlInfo.variantName,
                                    childTemplateInfo = this._getControlTemplateInfo(childTemplateName, childControlVariantName),
                                    childTemplate = childTemplateInfo.controlTemplate;
                                this.addControlWithParentAsync(childTemplateName, childTemplate, null, !0, childControlVariantName, childTemplateInfo.childrenTemplates).then(function(control) {
                                    return this.waitForVisualInitialization(control.name)
                                }.bind(this)).then(function(control) {
                                    var openAjaxInfo = control.OpenAjax.getControlInfo(),
                                        controlName = openAjaxInfo.name;
                                    offset || (offset = this._getCompositeControlOffset(controlName));
                                    var addedEntity = this._addCompositeControlChildEntity(childTemplate, controlName, childControlInfo.metaDataId, childControlInfo.rules, controlMetaDataIdMap, childEntities, offset, restServiceName);
                                    childControlInfo.isPrimaryControl && (Contracts.check(primaryControl === null), primaryControl = addedEntity);
                                    addChildControlAsync(index + 1)
                                }.bind(this))
                            }
                        }.bind(this);
                    addChildControlAsync(0)
                }, _getCompositeControlOffset: function(controlName) {
                    var entity = this._entityManager.getVisualByName(controlName);
                    var xRule = entity.getRuleByPropertyInvariantName("X"),
                        xOffset = xRule.rhs,
                        yRule = entity.getRuleByPropertyInvariantName("Y"),
                        yOffset = yRule.rhs;
                    return {
                            x: xOffset, y: yOffset
                        }
                }, _addCompositeControlChildEntity: function(template, controlName, metaDataId, ruleList, controlMetaDataIdMap, childEntities, offset, restServiceName) {
                    metaDataId && (controlMetaDataIdMap[metaDataId] = controlName);
                    var entity = this._entityManager.getVisualByName(controlName);
                    var rules = AppMagic.Utility.enumerableToArray(ruleList);
                    return this._addCompositeControlRules(entity, template, rules, controlMetaDataIdMap, offset, restServiceName), childEntities.push(entity), entity
                }, _addCompositeControlRules: function(entity, template, rules, controlMetaDataIdMap, offset, restServiceName) {
                    entity.autoBindOnRuleChangeDisabled = !0;
                    try {
                        rules.forEach(function(rule) {
                            var ruleInfo = rule.value,
                                propertyName = ruleInfo.propertyName,
                                ruleValue = ruleInfo.value,
                                isExpr = ruleInfo.isExpr,
                                dataSourceLocation = ruleInfo.dataSourceLocation,
                                nameMap = ruleInfo.nameMap;
                            propertyName === "X" && (ruleValue = (parseFloat(ruleValue) + parseFloat(offset.x)).toString());
                            propertyName === "Y" && (ruleValue = (parseFloat(ruleValue) + parseFloat(offset.y)).toString());
                            var propertyResult = template.tryGetPropertyInvariant(propertyName);
                            var property = propertyResult.property;
                            if (ruleValue = property.getExpressionValue(ruleValue, isExpr), ruleValue = ruleValue.replace(/%RESTServiceName%/g, this._document.escapeIdentifier(restServiceName)), ruleValue = this._replaceControlMetaDataIds(ruleValue, controlMetaDataIdMap), ruleValue = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(ruleValue, this._document), dataSourceLocation) {
                                var uri = new Windows.Foundation.Uri("ms-appx:///" + dataSourceLocation);
                                this._document.resourceManager.createResourceFromUri(uri, !0)
                            }
                            var localizedNameMap = {};
                            nameMap ? Object.keys(nameMap).forEach(function(sinkName) {
                                localizedNameMap[property.lookupLocalizedType(sinkName)] = nameMap[sinkName]
                            }) : localizedNameMap = nameMap;
                            entity.setRuleInvariant(propertyName, ruleValue, localizedNameMap)
                        }, this)
                    }
                    finally {
                        entity.autoBindOnRuleChangeDisabled = !1
                    }
                }, _replaceControlMetaDataIds: function(ruleValue, controlMetaDataIdMap) {
                    var matchResults = ruleValue.match(/%\w+\.ID%/g);
                    return matchResults && matchResults.forEach(function(match) {
                            var controlName = controlMetaDataIdMap[match];
                            ruleValue = ruleValue.replace(match, this._document.escapeIdentifier(controlName))
                        }.bind(this)), ruleValue
                }
        }, {}),
        EntityNameFactory = WinJS.Class.define(function EntityNameFatory_ctor(doc) {
            this._document = doc;
            this._controlsCounter = []
        }, {
            _document: null, _controlsCounter: null, getName: function(baseName, generateUniqueName) {
                    if (!generateUniqueName)
                        return baseName;
                    var baseString = typeof AppMagic.ControlStrings[baseName + "EntityName"] == "undefined" ? baseName : AppMagic.ControlStrings[baseName + "EntityName"],
                        count = this._controlsCounter[baseString];
                    typeof count == "undefined" ? count = 1 : count++;
                    var controlId;
                    do
                        controlId = baseString + count.toString(),
                        count++;
                    while (!this._document.isNameAvailable(controlId));
                    return this._controlsCounter[baseString] = --count, controlId
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        ControlGalleryViewModel: ControlGalleryViewModel, EntityNameFactory: EntityNameFactory
    })
})();