//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var AuthoringControlManager = WinJS.Class.derive(AppMagic.Controls.ControlManager, function AuthoringControlManager_Ctor(docViewModel, doc, requirementsManager) {
            this._controlDeletionWaitingPromises = Object.create(null);
            AppMagic.Controls.ControlManager.call(this, requirementsManager);
            this._manageControlZindex = !1;
            this._docViewModel = docViewModel;
            this._doc = doc;
            this._sampleDataImportPromises = {}
        }, {
            _controlDeletionWaitingPromises: null, _docViewModel: null, _doc: null, _sampleDataImportPromises: null, waitForControlDeletion: function(controlName) {
                    return (controlName in this._controlInstances) ? this._getOrCreateWaitingPromise(this._controlDeletionWaitingPromises, controlName) : WinJS.Promise.wrap(!0)
                }, updateName: function(oldName, newName) {
                    if (oldName !== newName) {
                        var control = this._controlInstances[oldName];
                        delete this._controlInstances[oldName];
                        this._controlInstances[newName] = control;
                        control.OpenAjax.updateId(newName)
                    }
                }, getClassName: function(template) {
                    var className = template.authoringClassName;
                    return className !== "" ? className : template.className
                }, createNestedCanvas: function(parentVisualName, id, element, width, height, options) {
                    var parentVisual = this._docViewModel.getVisualByName(parentVisualName);
                    if (parentVisual) {
                        var nestedCanvasViewModel = this._docViewModel.canvasManager.createNestedCanvas(parentVisual, id, width, height, options);
                        return element.canvasViewModel = nestedCanvasViewModel, element.setAttribute("data-bind", "winjsControl: '/controls/canvas/canvasControl.html'"), element.setAttribute("tabindex", "0"), Object.defineProperties({select: function() {
                                        this._docViewModel.selection.selectCanvas(nestedCanvasViewModel);
                                        AppMagic.context.documentViewModel.controlGallery.showVisualGallery()
                                    }.bind(this)}, {
                                    selected: {get: function() {
                                            return nestedCanvasViewModel._selected()
                                        }}, ownerDescendantSelected: {get: function() {
                                                return nestedCanvasViewModel._owner.descendantSelected
                                            }}, parentVisualSelected: {get: function() {
                                                return parentVisual._selected()
                                            }}
                                })
                    }
                    else
                        return null
                }, removeNestedCanvas: function(parentVisualName, id) {
                    var parentVisual = this._docViewModel.getVisualByName(parentVisualName);
                    this._docViewModel.canvasManager.removeNestedCanvas(parentVisual, id)
                }, addControlDataSourcesAsync: function(icontrol) {
                    for (var template = icontrol.template, promises = [], idx = 0, propLength = template.inputProperties.length; idx < propLength; idx++) {
                        var inputProperty = template.inputProperties[idx];
                        if (icontrol.isVariant) {
                            var result = template.tryGetControlVariant(icontrol.variantName);
                            if (result.value) {
                                var variant = result.controlVariant;
                                var propertyResult = variant.tryGetPropertyInvariant(inputProperty.propertyInvariantName);
                                propertyResult.value && (inputProperty = propertyResult.property)
                            }
                        }
                        if (inputProperty.hasSampleData) {
                            var uri = new Windows.Foundation.Uri("ms-appx:///" + inputProperty.sampleDataSourceLocation);
                            promises.push(this._importSampleData(icontrol, inputProperty, uri))
                        }
                    }
                    return promises.length === 0 ? WinJS.Promise.wrap(!0) : WinJS.Promise.join(promises)
                }, _importSampleData: function(icontrol, prop, fileUri) {
                    return prop.propertyType === "i" || prop.propertyType === "m" ? this._doc.resourceManager.createResourceFromUri(fileUri, !0) : this._doc.containsEntityByName(prop.sampleDataSourceName) ? new WinJS.Promise(function(comp) {
                            setImmediate(comp)
                        }) : (this._sampleDataImportPromises[fileUri] || (this._sampleDataImportPromises[fileUri] = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(fileUri).then(function(file) {
                            var importTimeout = AppMagic.AuthoringTool.Constants.DataImportTimeout,
                                staticDataImport = Microsoft.AppMagic.Authoring.Importers.StaticDataImport;
                            return staticDataImport.importSampleData(this._doc, file, importTimeout, prop.sampleDataSourceName)
                        }.bind(this)).then(function(importResult) {
                            return this._sampleDataImportPromises[fileUri] = null, WinJS.Promise.wrap(importResult)
                        }.bind(this))), this._sampleDataImportPromises[fileUri])
                }, changeOutputType: function(controlId, propertyName, schema) {
                    var control = this._controlInstances[controlId];
                    if (!control.OpenAjax.getControlInfo().changeOutputType(propertyName, schema))
                        var okay = control.OpenAjax.getControlInfo().deserializeAndChangeOutputType(propertyName, schema)
                }, changeOutputTypeUsingDocType: function(controlId, propertyName, dataWithLocMap, schema) {
                    var control = this._controlInstances[controlId];
                    var localizedSchema = Microsoft.AppMagic.Authoring.DataLocalizationHelper.convertDataTypeString(schema, dataWithLocMap),
                        result = control.OpenAjax.getControlInfo().changeOutputTypeUsingDocumentType(propertyName, localizedSchema)
                }, getInputDataTypeJSON: function(controlId, propertyName) {
                    var control = this._controlInstances[controlId];
                    var typeJSON = control.OpenAjax.getControlInfo().getStringifiedRuleTypeByInvariantName(propertyName);
                    return typeJSON
                }, removeControl: function(controlId) {
                    var control = this._controlInstances[controlId];
                    if (control) {
                        for (var template = control.OpenAjax.getControlInfo().template, idx = 0, propLength = template.inputProperties.length; idx < propLength; idx++) {
                            var prop = template.inputProperties[idx];
                            if (prop.hasSampleData) {
                                control.OpenAjax.getControlInfo().removeRule(prop.propertyName);
                                var sampleDataSource = this._doc.getStaticDataSource(prop.sampleDataSourceName);
                                if (sampleDataSource !== null)
                                    sampleDataSource.isInUse || this._doc.controlWithClassNameExists(template.className) || this._doc.removeDataSource(prop.sampleDataSourceName);
                                else {
                                    var resource = this._doc.resourceManager.getResourceByName(prop.sampleDataSourceName);
                                    resource === null || resource.isInUse || this._doc.controlWithClassNameExists(template.className) || this._doc.resourceManager.removeResourceAsync(prop.sampleDataSourceName)
                                }
                            }
                        }
                        typeof control.OpenAjax.removeControl == "function" && control.OpenAjax.removeControl();
                        typeof control.onUnload == "function" && control.onUnload();
                        var okay = delete this._controlInstances[controlId];
                        this._completeWaitingPromise(this._controlDeletionWaitingPromises, controlId, !0)
                    }
                }, removeAllControls: function() {
                    for (var treeList = this._doc.getControlNameListDepthFirst(), item = treeList.first(); item.hasCurrent; item.moveNext())
                        this.removeControl(item.current)
                }, dispose: function() {
                    this._docViewModel = null;
                    AppMagic.Controls.ControlManager.prototype.dispose.call(this)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Controls", {AuthoringControlManager: AuthoringControlManager})
})();