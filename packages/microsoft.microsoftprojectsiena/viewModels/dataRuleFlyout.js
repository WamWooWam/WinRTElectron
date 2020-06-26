//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var ControlTemplateExtensions = AppMagic.AuthoringTool.Extensions.ControlTemplate,
        DocumentExtensions = AppMagic.AuthoringTool.Extensions.Document,
        MediaTypes = AppMagic.Constants.MediaTypes,
        PropertyRuleCategory = Microsoft.AppMagic.Authoring.PropertyRuleCategory;
    function getControlFromEntity(entity) {
        var control = entity._control || entity._screen;
        return control
    }
    function getFirstAggregateDataPropertyName(entity) {
        for (var control = getControlFromEntity(entity), i = 0, len = control.template.inputProperties.length; i < len; i++) {
            var property = control.template.inputProperties[i];
            if (property.propertyCategory === PropertyRuleCategory.data && property.isAggregate)
                return property.propertyName
        }
        return null
    }
    function addDataSource(doc, entity, propertyName, propertyType) {
        if (isMedia(propertyType)) {
            if (!AppMagic.AuthoringTool.Utility.canShowPicker())
                return;
            for (var picker = new Platform.Storage.Pickers.FileOpenPicker, formats = propertyType === MediaTypes.image ? AppMagic.AuthoringTool.Constants.ImageFormats : AppMagic.AuthoringTool.Constants.MediaFormats, i = 0, len = formats.length; i < len; i++)
                picker.fileTypeFilter.append(formats[i]);
            picker.suggestedStartLocation = getMediaPickerLocation(propertyType, entity);
            picker.pickMultipleFilesAsync().then(function(files) {
                if (files && files.length > 0) {
                    createResourceFromFile(files[0], doc, entity, propertyName);
                    for (var j = 1; j < files.length; j++)
                        doc.resourceManager.createResourceAsync(files[j], !1)
                }
            })
        }
        else
            AppMagic.context.documentViewModel.backStage.visible = !0,
            AppMagic.context.documentViewModel.backStage.selectSettingByName(AppMagic.AuthoringStrings.DataSources)
    }
    function getMediaPickerLocation(propertyType, entity) {
        return propertyType === MediaTypes.image ? Platform.Storage.Pickers.PickerLocationId.picturesLibrary : entity.templateName === "audioPlayback" ? Platform.Storage.Pickers.PickerLocationId.musicLibrary : Platform.Storage.Pickers.PickerLocationId.videosLibrary
    }
    function createResourceFromFile(file, doc, entity, propertyName) {
        return doc.resourceManager.createResourceAsync(file, !1).then(function(resource) {
                if (resource) {
                    var script = Microsoft.AppMagic.Common.LanguageHelper.escapeName(resource.name);
                    entity.setRule(propertyName, script)
                }
                else
                    AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.AddResourceErrorTitle, AppMagic.AuthoringStrings.AddResourceErrorMessage)
            }.bind(this))
    }
    function getAddDataSourceText(propertyType) {
        switch (propertyType) {
            case MediaTypes.image:
                return AppMagic.AuthoringStrings.AddImage;
            case MediaTypes.audioVideo:
                return AppMagic.AuthoringStrings.AddMedia;
            default:
                return AppMagic.AuthoringStrings.AddDataSource
        }
    }
    function isMedia(propertyType) {
        return propertyType === MediaTypes.image || propertyType === MediaTypes.audioVideo
    }
    var DataRuleFlyout = WinJS.Class.derive(AppMagic.Utility.Disposable, function DataRuleFlyout_ctor(doc, entityManager, activeFlyouts, anchor, entities, property, serviceConnections, rule) {
            AppMagic.Utility.Disposable.call(this);
            var propertyName = property.propertyName;
            this._entity = entities.length === 1 && (!entities[0].groupedVisuals || entities[0].groupedVisuals.length === 0) ? entities[0] : null;
            var targetEntity,
                targetPropertyName;
            this._entity && this._entity.parent && getControlFromEntity(this._entity.parent).template.replicatesNestedControls ? (targetEntity = this._entity, targetPropertyName = propertyName, this._entity = this._entity.parent, propertyName = getFirstAggregateDataPropertyName(this._entity)) : (targetEntity = null, targetPropertyName = null);
            this._document = doc;
            this._entityManager = entityManager;
            this._activeFlyouts = activeFlyouts;
            this._entities = entities;
            this._control = this._entity ? getControlFromEntity(this._entity) : null;
            this._property = this._entity ? ControlTemplateExtensions.getInput(this._control.template, propertyName) : property;
            this._rule = rule;
            this._serviceConnections = serviceConnections;
            this._pageNavigator = new AppMagic.AuthoringTool.ViewModels.PageNavigator;
            this._buildPages(targetEntity, targetPropertyName);
            activeFlyouts.push(this);
            this._element.addEventListener("afterhide", this._handleAfterHide.bind(this));
            this._element.addEventListener("aftershow", this._handleAfterShow.bind(this));
            this._element.winControl.show(anchor);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._eventTracker.add(this._pageNavigator, "hideflyout", this.hide, this);
            ko.utils.domNodeDisposal.addDisposeCallback(this._element, this.dispose.bind(this))
        }, {
            _document: null, _entity: null, _entityManager: null, _activeFlyouts: null, _entities: null, _control: null, _property: null, _rule: null, _serviceConnections: null, _element: null, _pageNavigator: null, element: {
                    get: function() {
                        return this._element
                    }, set: function(value) {
                            this._element = value
                        }
                }, hide: function() {
                    this._element.winControl.hide()
                }, isAggregate: {get: function() {
                        return this._property.isAggregate
                    }}, pageNavigator: {get: function() {
                        return this._pageNavigator
                    }}, rule: {get: function() {
                        return this._rule
                    }}, _buildPages: function(targetEntity, targetPropertyName) {
                    var dataSourcesPage = new DataSourcesPage(this._document, this._entityManager, this._pageNavigator, this._entity, this._property, this._serviceConnections, this._rule);
                    this._pageNavigator.push(dataSourcesPage);
                    targetEntity !== null && (this._pageNavigator.push(new NameMapPage(this._document, this._entityManager, this._pageNavigator, this._entity, this._property.propertyName)), this._pageNavigator.push(new ValueSelectorPage(this._document, this._pageNavigator, targetEntity, targetPropertyName, null, !1)));
                    this._pageNavigator.navigateTop()
                }, _isSampleSelected: function() {
                    return this._property.hasSampleData && this._rule.rhs === this._property.sampleDataSourceName
                }, _handleAfterHide: function() {
                    var i = this._activeFlyouts.indexOf(this);
                    this._activeFlyouts.splice(i, 1)
                }, _handleAfterShow: function() {
                    this._rule.isDisposed && this._element.winControl.hide()
                }
        }, {}),
        DataSourcesPage = WinJS.Class.define(function DataSourcesPage_ctor(doc, entityManager, pageNavigator, entity, property, serviceConnections, rule) {
            this._document = doc;
            this._entityManager = entityManager;
            this._pageNavigator = pageNavigator;
            this._entity = entity;
            this._control = this._entity ? getControlFromEntity(this._entity) : null;
            this._property = property;
            this._ruleVm = rule;
            this._dataSourceExpressions = ko.observableArray();
            this._entity && (this._dataSourceManager = new AppMagic.AuthoringTool.ViewModels.DataSourceManager(doc, entityManager, this._entity, serviceConnections));
            this._rule = ko.observable(null)
        }, {
            _document: null, _entityManager: null, _pageNavigator: null, _entity: null, _control: null, _property: null, _dataSourceExpressions: null, _dataSourceManager: null, _ruleVm: null, _rule: null, activate: function() {
                    if (!this._entity) {
                        this._dataSourceExpressions([]);
                        this._rule(this._ruleVm);
                        return
                    }
                    var docDataSources = this._property.isAggregate ? AppMagic.Constants.DocDataSources.aggregate : AppMagic.Constants.DocDataSources.none,
                        dataSources = this._dataSourceManager.getDataSourcesForControlProperty(docDataSources, this._property);
                    this._dataSourceExpressions(dataSources);
                    var rule = this._control.getRule(this._property.propertyName),
                        dataSource = "";
                    rule && (dataSource = rule.script);
                    this._rule(this._entity.setRule(this._property.propertyName, dataSource))
                }, addDataSource: function() {
                    this.dispatchEvent("hideflyout");
                    addDataSource(this._document, this._entity, this._property.propertyName, this._property.propertyType)
                }, addDataSourceText: {get: function() {
                        return getAddDataSourceText(this._property.propertyType)
                    }}, isDefault: {get: function() {
                        return this._property.propertyName === AppMagic.AuthoringTool.OpenAjaxPropertyNames.Default
                    }}, isMedia: {get: function() {
                        return !!this._entity && isMedia(this._property.propertyType)
                    }}, selectDataSource: function(dataSourceItem) {
                    this._document.undoManager.createGroup("Select DataSource");
                    var dataSourceRule = dataSourceItem.ruleExpression;
                    if (this._entity.setRule(this._property.propertyName, dataSourceRule), this._ruleVm.fireDataSourceSelectedEvent(), dataSourceRule !== Microsoft.AppMagic.Common.LocalizationHelper.getCurrentLocaleKeyword("true") && dataSourceRule !== Microsoft.AppMagic.Common.LocalizationHelper.getCurrentLocaleKeyword("false") && !this._property.isAggregate) {
                        var page = new ValueSelectorPage(this._document, this._pageNavigator, this._entity, this._property.propertyName, null, !1);
                        this._pageNavigator.navigate(page)
                    }
                    this._document.undoManager.closeGroup()
                }, showColumns: function() {
                    this._document.undoManager.createGroup("Select DataSource");
                    var page,
                        propertyName = this._property.propertyName;
                    if (this._control.template.name === "gallery" || this._control.template.name === "barChart" || this._control.template.name === "pieChart" || this._control.template.name === "lineChart")
                        page = new NameMapPage(this._document, this._entityManager, this._pageNavigator, this._entity, propertyName);
                    else {
                        var getSuggestedBinding = function(desiredType, expression) {
                                return Microsoft.AppMagic.BindingHelper.tryGetSuggestedBinding(this._document, desiredType, expression)
                            },
                            binder = new DataPropertyBinder(this._entityManager, this._entity, propertyName, getSuggestedBinding);
                        binder.activate();
                        var bindings = binder.bindings;
                        var binding = bindings[0];
                        page = new ValueSelectorPage(this._document, this._pageNavigator, this._entity, binding.sink.propertyName, binding.sink.sinkName, !1)
                    }
                    this._pageNavigator.navigate(page);
                    this._document.undoManager.closeGroup()
                }, dataSourceExpressions: {get: function() {
                        return this._dataSourceExpressions()
                    }}, nameMapIconVisible: {get: function() {
                        return this._property.isAggregate && this._property.hasEditableNameMap && !!this._entity
                    }}, pageName: {get: function() {
                        return "DataSources"
                    }}, pageNavigator: {get: function() {
                        return this._pageNavigator
                    }}, rule: {get: function() {
                        return this._rule()
                    }}
        }, {}),
        NameMapPage = WinJS.Class.define(function NameMapPage_ctor(doc, entityManager, pageNavigator, entity, propertyName) {
            var getSuggestedBinding = function(desiredType, expression) {
                    return Microsoft.AppMagic.BindingHelper.tryGetSuggestedBinding(doc, desiredType, expression)
                };
            this._binder = new DataPropertyBinder(entityManager, entity, propertyName, getSuggestedBinding);
            this._document = doc;
            this._entityManager = entityManager;
            this._pageNavigator = pageNavigator;
            this._propertyName = propertyName;
            this._entity = entity;
            var rule = entity.getRuleByPropertyName(propertyName);
            this._ruleValue = rule.rhs
        }, {
            _binder: null, _document: null, _entityManager: null, _pageNavigator: null, _propertyName: null, _ruleValue: null, _entity: null, activate: function() {
                    this._binder.activate()
                }, selectBinding: function(binding) {
                    var entity = this._entityManager.getEntityByName(binding.sink.entityName),
                        isLifted = typeof binding.sink.typeName != "undefined",
                        page = new ValueSelectorPage(this._document, this._pageNavigator, entity, binding.sink.propertyName, binding.sink.sinkName, isLifted);
                    this._pageNavigator.navigate(page)
                }, bindings: {get: function() {
                        return this._binder.bindings
                    }}, pageName: {get: function() {
                        return "NameMap"
                    }}, pageNavigator: {get: function() {
                        return this._pageNavigator
                    }}, propertyName: {get: function() {
                        return this._propertyName
                    }}, controlName: {get: function() {
                        return this._entity.name
                    }}, ruleValue: {get: function() {
                        return this._ruleValue
                    }}
        }, {}),
        DataPropertyBinder = WinJS.Class.define(function PropertyBinder_ctor(entityManager, entity, propertyName, getSuggestedBinding) {
            this._getSuggestedBinding = getSuggestedBinding;
            this._entityManager = entityManager;
            this._entity = entity;
            this._control = getControlFromEntity(entity);
            this._rule = entity.getRuleByPropertyName(propertyName);
            this._sinks = [];
            this._bindings = ko.observableArray()
        }, {
            _getSuggestedBinding: null, _entityManager: null, _entity: null, _control: null, _rule: null, _sinks: null, _bindings: null, activate: function() {
                    this._refresh()
                }, autoBind: function() {
                    this._autoBind(null)
                }, autoBindChild: function(childVisual) {
                    this._autoBind(childVisual)
                }, bindings: {get: function() {
                        return this._bindings()
                    }}, _addLiftedSinks: function() {
                    for (var sinks = this._buildLiftedSinkInfo(!0).sinks, i = 0, len = sinks.length; i < len; i++)
                        this._sinks.push(sinks[i])
                }, _addNameMapSinks: function() {
                    var ruleNameMap = this._rule.nameMap,
                        count = 0,
                        numberOfSeries;
                    if (this._control.template.name === "barChart" || this._control.template.name === "lineChart") {
                        var openAjaxControl = OpenAjax.widget.byId(this._control.name);
                        Contracts.checkValue(openAjaxControl);
                        numberOfSeries = openAjaxControl.OpenAjax.getPropertyValue("NumberOfSeries");
                        Contracts.checkNumber(numberOfSeries)
                    }
                    for (var sinkName in ruleNameMap) {
                        if (!!numberOfSeries && count > numberOfSeries)
                            return;
                        var sink = {
                                displayName: sinkName, entityName: this._entity.name, expression: this._rule.propertyName + "!" + sinkName, hasErrors: ruleNameMap[sinkName].hasErrors, propertyName: this._rule.propertyName, sinkName: sinkName, type: ruleNameMap[sinkName].sinkType
                            };
                        this._sinks.push(sink);
                        count++
                    }
                }, _autoBind: function(entity) {
                    if (this._rule.property.isTable && this._rule.rhs.length > 0) {
                        var liftedInfo = this._buildLiftedSinkInfo(!1),
                            typeWithLiftedProperties = this._getPropertyTypeWithLiftedProperties(liftedInfo),
                            result = this._getSuggestedBinding(typeWithLiftedProperties, this._rule.rhs);
                        result.value && this._autoBindNameMap(liftedInfo, this._rule.rhs, result.map, entity)
                    }
                    this._refresh()
                }, _autoBindNameMap: function(liftedInfo, expression, nameMap, entity) {
                    this._rule.rhs = expression;
                    for (var it = nameMap.sinkNames.first(); it.hasCurrent; it.moveNext()) {
                        var sinkName = it.current,
                            sourceName = nameMap.tryMapSinkToSource(it.current).mappedName;
                        this._autoBindSink(liftedInfo, expression, sinkName, sourceName, entity)
                    }
                }, _autoBindSink: function(liftedInfo, expression, sinkName, sourceName, entity) {
                    var baseExpression,
                        targetEntity,
                        sinkExpression,
                        liftedSink = liftedInfo.typeNameToSink[sinkName];
                    if (liftedSink) {
                        if (entity === null || liftedSink.entityName === entity.name) {
                            baseExpression = this._control.template.replicatesNestedControls ? Microsoft.AppMagic.Common.LocalizationHelper.getCurrentLocaleKeyword("ThisItem") : expression;
                            targetEntity = this._entityManager.getEntityByName(liftedSink.entityName);
                            var sourceExpression = baseExpression + "!" + Microsoft.AppMagic.Common.LanguageHelper.escapeName(sourceName);
                            targetEntity.setRule(liftedSink.expression, sourceExpression, !0)
                        }
                    }
                    else {
                        var ruleVm = this._entity.getRuleByPropertyName(this._rule.propertyName);
                        ruleVm.updateSource(sinkName, sourceName)
                    }
                }, _buildLiftedSinkInfo: function(liftAllProperties) {
                    for (var sinks = [], typeNameToSink = {}, childIt = this._control.children.first(); childIt.hasCurrent; childIt.moveNext()) {
                        for (var childControl = childIt.current, childProperties = [], childProperty, idx = 0, propLength = childControl.template.inputProperties.length; idx < propLength; idx++)
                            childProperty = childControl.template.inputProperties[idx],
                            childProperty.propertyCategory === PropertyRuleCategory.data && (liftAllProperties || childProperty.autoBind) && childProperties.push(childProperty);
                        for (var i = 0, len = childProperties.length; i < len; i++) {
                            childProperty = childProperties[i];
                            var childPropertyName = childProperty.propertyName,
                                displayName = childControl.name + (childProperties.length === 1 ? "" : "!" + childPropertyName),
                                typeName = childControl.name + "_" + childProperty.propertyName,
                                entity = this._entityManager.getEntityByName(childControl.name),
                                rule = entity.getRuleByPropertyName(childPropertyName),
                                sink = {
                                    displayName: displayName, entityName: childControl.name, expression: childPropertyName, hasErrors: ko.computed(function(sinkRule) {
                                            return sinkRule.hasErrors
                                        }.bind(null, rule)), propertyName: childPropertyName, sinkName: null, typeName: typeName, type: childProperty.propertyType
                                };
                            sinks.push(sink);
                            typeNameToSink[sink.typeName] = sink
                        }
                    }
                    return {
                            sinks: sinks, typeNameToSink: typeNameToSink
                        }
                }, _getPropertyTypeWithLiftedProperties: function(liftedInfo) {
                    var type = this._rule.propertyTypeString;
                    type = type.substr(0, type.length - 1);
                    for (var i = 0, len = liftedInfo.sinks.length; i < len; i++) {
                        var sink = liftedInfo.sinks[i];
                        type[type.length - 1] !== "[" && (type += ", ");
                        type += "'" + sink.typeName + "':" + sink.type
                    }
                    return type + "]"
                }, _getSourceDisplayName: function(ruleVm, sinkDisplayName, sinkName) {
                    if (sinkName)
                        return ruleVm.nameMap[sinkDisplayName].source();
                    else {
                        var result = AppMagic.AuthoringTool.Utility.tryParseDottedExpression(ruleVm.rhs);
                        if (result)
                            if (result.length >= 2) {
                                if (this._control.template.replicatesNestedControls && result.unquoted[0] === Microsoft.AppMagic.Common.LocalizationHelper.getCurrentLocaleKeyword("ThisItem"))
                                    return result.parts.length === 2 ? result.unquoted[1] : result.parts.slice(1).join("!")
                            }
                            else if (result.length === 1)
                                return result.unquoted[0];
                        return ruleVm.rhs
                    }
                }, _refresh: function() {
                    this._refreshSinks();
                    this._refreshBindings()
                }, _refreshBindings: function() {
                    this._bindings([]);
                    for (var i = 0, len = this._sinks.length; i < len; i++) {
                        var sink = this._sinks[i];
                        var entity = this._entityManager.getEntityByName(sink.entityName),
                            ruleVm = entity.getRuleByPropertyName(sink.propertyName),
                            binding = {
                                entity: entity, sink: sink, sourceDisplayName: this._getSourceDisplayName(ruleVm, sink.displayName, sink.sinkName)
                            };
                        this._bindings.push(binding)
                    }
                }, _refreshSinks: function() {
                    this._sinks = [];
                    this._addNameMapSinks();
                    this._rule.property.isTable && this._addLiftedSinks();
                    this._sinks.sort(function(a, b) {
                        return a.displayName.localeCompare(b.displayName)
                    })
                }
        }, {}),
        ValueSelectorPage = WinJS.Class.define(function ValueSelectorPage_ctor(doc, pageNavigator, entity, propertyName, sinkName, isLifted) {
            this._document = doc;
            this._pageNavigator = pageNavigator;
            this._entity = entity;
            this._propertyName = propertyName;
            this._control = getControlFromEntity(entity);
            this._ruleVm = entity.getRuleByPropertyName(propertyName);
            this._property = ControlTemplateExtensions.getInput(this._control.template, propertyName);
            this._sinkName = sinkName;
            this._isLifted = isLifted;
            this._values = ko.observableArray();
            this._refreshValues();
            this._selectedIndex = ko.observable(-1)
        }, {
            _document: null, _pageNavigator: null, _entity: null, _control: null, _isLifted: !1, _property: null, _propertyName: null, _ruleVm: null, _sinkName: null, _values: null, _selectedIndex: null, activate: function() {
                    this._refreshValues()
                }, addDataSource: function() {
                    this.dispatchEvent("hideflyout");
                    addDataSource(this._document, this._entity, this._property.propertyName, this._property.propertyType)
                }, addDataSourceText: {get: function() {
                        return getAddDataSourceText(this._property.propertyType)
                    }}, displaySinkName: {get: function() {
                        return this._sinkName ? AppMagic.AuthoringStrings.CommandBarNameMapSink : ""
                    }}, isMedia: {get: function() {
                        return isMedia(this._property.propertyType)
                    }}, isLiftedProperty: {get: function() {
                        return this._isLifted
                    }}, isNameMapBinding: {get: function() {
                        return this._sinkName ? !0 : !1
                    }}, selectValue: function(index, value) {
                    this._sinkName ? this._ruleVm.updateSource(this._sinkName, value.expression) : this._ruleVm.rhs = value.expression;
                    this._selectedIndex(index)
                }, pageName: {get: function() {
                        return "ValueSelector"
                    }}, pageNavigator: {get: function() {
                        return this._pageNavigator
                    }}, rule: {get: function() {
                        return this._ruleVm
                    }}, selectedValue: {get: function() {
                        if (this._sinkName) {
                            var sink = this._ruleVm.nameMap[this._sinkName];
                            return sink.source()
                        }
                        else
                            return this._ruleVm.rhs
                    }}, values: {get: function() {
                        return this._values()
                    }}, _refreshValues: function() {
                    var values = this._ruleVm.getBindableExpressions(this._sinkName);
                    this._values(values)
                }, selectedIndex: {get: function() {
                        return this._selectedIndex()
                    }}, handleBlur: function(data, evt) {
                    var activeElement = document.activeElement;
                    activeElement && WinJS.Utilities.hasClass(activeElement, "option") && WinJS.Utilities.hasClass(activeElement, "values") || this._selectedIndex(-1)
                }, handleKeyDown: function(data, evt) {
                    var currentItemIndex = this._selectedIndex();
                    if (currentItemIndex >= 0 && (evt.key === AppMagic.Constants.Keys.tab || evt.key === AppMagic.Constants.Keys.enter)) {
                        this.selectValue(currentItemIndex, data);
                        return
                    }
                    evt.key === AppMagic.Constants.Keys.down && currentItemIndex < this.values.length - 1 ? (currentItemIndex++, this._selectedIndex(currentItemIndex)) : evt.key === AppMagic.Constants.Keys.up && (currentItemIndex > 0 ? currentItemIndex-- : currentItemIndex = 0, this._selectedIndex(currentItemIndex))
                }
        }, {});
    WinJS.Class.mix(DataSourcesPage, WinJS.Utilities.eventMixin);
    WinJS.Class.mix(NameMapPage, WinJS.Utilities.eventMixin);
    WinJS.Class.mix(ValueSelectorPage, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        DataPropertyBinder: DataPropertyBinder, DataRuleFlyout: DataRuleFlyout, _DataSourcesPage: DataSourcesPage, _NameMapPage: NameMapPage, _ValueSelectorPage: ValueSelectorPage, _createResourceFromFile: createResourceFromFile, _getAddDataSourceText: getAddDataSourceText, _isMedia: isMedia, _getMediaPickerLocation: getMediaPickerLocation
    })
})(Windows);