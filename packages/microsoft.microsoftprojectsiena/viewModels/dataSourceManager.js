//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var MediaTypes = AppMagic.Constants.MediaTypes,
        PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory,
        DataSourceItem = AppMagic.AuthoringTool.DataSourceItem,
        DataSourceManager = WinJS.Class.define(function DataSourceManager_ctor(doc, entityManager, entity, serviceConnections) {
            this._document = doc;
            this._serviceConnections = serviceConnections;
            this._entityManager = entityManager;
            this._entity = entity
        }, {
            _document: null, _serviceConnections: null, _entityManager: null, _entity: null, getDocDataSources: function(docDataSources) {
                    return AppMagic.Constants.DocDataSources.verify(docDataSources), this._getDataSourcesImpl(docDataSources, {
                            includeCurrentControl: !0, includeControlsName: !1, includeAggregateProperties: !0
                        })
                }, getDataSourcesForControlProperty: function(docDataSources, property) {
                    return AppMagic.Constants.DocDataSources.verify(docDataSources), this._getDataSourcesImpl(docDataSources, {
                            includeCurrentControl: !1, includeControlsName: !0, includeAggregateProperties: !0
                        }, property)
                }, _getDataSourcesImpl: function(docDataSources, options, property) {
                    if (AppMagic.Constants.DocDataSources.verify(docDataSources), property && property.propertyInvariantName === "DefaultStrokes" && this._entity.templateClassName === "AppMagic.Controls.InkControl")
                        return [];
                    var currentControlDataSources = [],
                        otherDataSources = [];
                    this._addControlsSources({
                        currentControlDataSources: currentControlDataSources, otherDataSources: otherDataSources
                    }, options, property);
                    this._addThisItem(currentControlDataSources);
                    docDataSources === AppMagic.Constants.DocDataSources.all ? this._addDocDataSources(otherDataSources, !1, !1) : docDataSources === AppMagic.Constants.DocDataSources.aggregate && this._addDocDataSources(otherDataSources, !0, !1);
                    var propertyType = property ? property.propertyType : null;
                    return (propertyType === MediaTypes.image || propertyType === MediaTypes.audioVideo) && this._addMediaSources(otherDataSources, propertyType), currentControlDataSources.sort(DataSourceItem.compareDisplayName), otherDataSources.sort(DataSourceItem.compareDisplayName), typeof property != "undefined" && property.propertyType === "b" && (currentControlDataSources.unshift(new DataSourceItem(Microsoft.AppMagic.Common.LocalizationHelper.getCurrentLocaleKeyword("false"))), currentControlDataSources.unshift(new DataSourceItem(Microsoft.AppMagic.Common.LocalizationHelper.getCurrentLocaleKeyword("true")))), currentControlDataSources.concat(otherDataSources)
                }, _tryMatchDataOutputProperties: function(dataSources, control, property) {
                    for (var hasMatchingProperties = !1, template = control.template, idx = 0, propLength = template.outputProperties.length; idx < propLength; idx++) {
                        var currentProperty = template.outputProperties[idx];
                        if (currentProperty.propertyCategory === PropertyRuleCategory.data) {
                            var propertyType = property ? property.propertyType : null;
                            if (currentProperty.propertyType === propertyType)
                                hasMatchingProperties = !0;
                            else if (currentProperty.isAggregate) {
                                var quotedControlName = Microsoft.AppMagic.Common.LanguageHelper.escapeName(control.name);
                                this._addMatchingAggregateProperties(dataSources, control.name, quotedControlName, currentProperty, property)
                            }
                        }
                    }
                    return hasMatchingProperties
                }, _addMatchingAggregateProperties: function(dataSources, controlName, quotedControlName, matchingProperty, property) {
                    var isTableProperty = property.isTable,
                        isMatchingTableProperty = matchingProperty.isTable;
                    if (isTableProperty || isMatchingTableProperty) {
                        isTableProperty && isMatchingTableProperty && dataSources.push(new DataSourceItem(quotedControlName + "!" + matchingProperty.propertyName));
                        return
                    }
                    var passThroughInput = matchingProperty.passThroughInput;
                    if (passThroughInput) {
                        var entity = this._entityManager.getEntityByName(controlName);
                        var ruleVm = entity.getRuleByPropertyName(passThroughInput.propertyName),
                            ruleType = ruleVm.ruleType;
                        if (ruleType) {
                            var columns = ruleType.getColumnsOfType(property.propertyType, !0);
                            columns.first().hasCurrent && dataSources.push(new DataSourceItem(quotedControlName + "!" + matchingProperty.propertyName))
                        }
                    }
                }, _addControlsSources: function(dataSources, options, property) {
                    for (var controlIterator = this._document.controls.first(); controlIterator.hasCurrent; controlIterator.moveNext()) {
                        var control = controlIterator.current;
                        if (!control.isReplicable) {
                            if (!options.includeCurrentControl && control.name === this._entity.name)
                                continue;
                            var sources = dataSources.otherDataSources,
                                entityParent = this._entity.parent;
                            if ((this._entity.name === control.name || entityParent && !AppMagic.Utility.isScreen(entityParent.templateClassName) && entityParent.name === control.name) && (sources = dataSources.currentControlDataSources), options.includeControlsName && options.includeAggregateProperties) {
                                var controlName = Microsoft.AppMagic.Common.LanguageHelper.escapeName(control.name);
                                this._tryMatchDataOutputProperties(dataSources.otherDataSources, control, property) && sources.push(new DataSourceItem(controlName));
                                continue
                            }
                            options.includeAggregateProperties && this._addAggregateDataOutputProperties(sources, control)
                        }
                    }
                }, _addAggregateDataOutputProperties: function(dataSources, control) {
                    for (var controlName = Microsoft.AppMagic.Common.LanguageHelper.escapeName(control.name), template = control.template, idx = 0, propLength = template.outputProperties.length; idx < propLength; idx++) {
                        var currentProperty = template.outputProperties[idx];
                        currentProperty.propertyCategory === PropertyRuleCategory.data && (currentProperty.isAggregate ? dataSources.push(new DataSourceItem(controlName + "!" + currentProperty.propertyName)) : currentProperty.isPrimaryOutputProperty && dataSources.push(new DataSourceItem("{" + currentProperty.propertyName + ": " + controlName + "!" + currentProperty.propertyName + "}")))
                    }
                }, _addDocDataSources: function(dataSources, onlyAggregate, includeDynamic) {
                    for (var dataSourceIterator = this._document.dataSources.first(); dataSourceIterator.hasCurrent; dataSourceIterator.moveNext()) {
                        var dataSource = dataSourceIterator.current;
                        (!onlyAggregate || dataSource.type.isAggregate) && (includeDynamic || dataSource.kind !== Microsoft.AppMagic.Authoring.DataSourceKind.dynamic) && !dataSource.isSampleData && dataSources.push(new DataSourceItem(Microsoft.AppMagic.Common.LanguageHelper.escapeName(dataSource.name), dataSource.name))
                    }
                    this._serviceConnections().forEach(function(connection) {
                        dataSources.push(new DataSourceItem(Microsoft.AppMagic.Common.LanguageHelper.escapeName(connection.serviceNamespace) + "!", connection.serviceNamespace))
                    })
                }, _addThisItem: function(dataSources) {
                    if (this._entity.parent && this._entity.parent._control.template.replicatesNestedControls) {
                        var thisItemKeyword = Microsoft.AppMagic.Common.LocalizationHelper.getCurrentLocaleKeyword("ThisItem");
                        dataSources.push(new DataSourceItem(thisItemKeyword))
                    }
                }, _addMediaSources: function(dataSources, type) {
                    MediaTypes.verify(type);
                    for (var iter = type === MediaTypes.image ? this._document.resourceManager.imageResources.first() : this._document.resourceManager.mediaResources.first(); iter.hasCurrent; iter.moveNext())
                        dataSources.push(new DataSourceItem(Microsoft.AppMagic.Common.LanguageHelper.escapeName(iter.current.name), iter.current.name))
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        DataSourceManager: DataSourceManager, _MediaTypes: MediaTypes
    })
})();