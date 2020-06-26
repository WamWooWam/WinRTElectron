//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ArgsCount = 2,
        DataSourceItem = AppMagic.AuthoringTool.DataSourceItem,
        navigateFunctionName = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("Navigate()", null);
    navigateFunctionName = navigateFunctionName.substr(0, navigateFunctionName.length - 2);
    var collectFunctionName = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("Collect()", null);
    collectFunctionName = collectFunctionName.substr(0, collectFunctionName.length - 2);
    var removeFunctionName = Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific("Remove()", null);
    removeFunctionName = removeFunctionName.substr(0, removeFunctionName.length - 2);
    var argSeparator = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleListSeparator + " ",
        statementSeparator = Microsoft.AppMagic.Common.LocalizationHelper.currentLocaleChainingOperator,
        PropertyFunctionNames = {
            all: [navigateFunctionName, collectFunctionName, removeFunctionName], OnVisible: [], OnHidden: []
        },
        OptionsMaxSize = 4,
        BehaviorRuleFlyout = WinJS.Class.define(function BehaviorRuleFlyout_ctor(doc, entityManager, selectionManager, activeFlyouts, anchor, entities, rule) {
            this._document = doc;
            this._entityManager = entityManager;
            this._activeFlyouts = activeFlyouts;
            this._selectionManager = selectionManager;
            this._entities = entities;
            this._rule = rule;
            this._pageNavigator = new AppMagic.AuthoringTool.ViewModels.PageNavigator;
            this._buildRulePage();
            activeFlyouts.push(this);
            this._element.winControl.addEventListener("afterhide", this._handleAfterHide.bind(this));
            this._element.winControl.addEventListener("aftershow", this._handleAfterShow.bind(this));
            this._element.winControl.show(anchor)
        }, {
            _activeFlyouts: null, _document: null, _entityManager: null, _rule: null, _entities: null, _selectionManager: null, _element: null, _pageNavigator: null, element: {
                    get: function() {
                        return this._element
                    }, set: function(value) {
                            this._element = value
                        }
                }, hide: function() {
                    this._element.winControl.hide()
                }, pageNavigator: {get: function() {
                        return this._pageNavigator
                    }}, rule: {get: function() {
                        return this._rule
                    }}, _buildRulePage: function() {
                    var rulePage = new BehaviorRulePage(this._document, this._entityManager, this._pageNavigator, this._selectionManager, this._entities, this._rule);
                    this._pageNavigator.push(rulePage);
                    this._pageNavigator.navigateTop()
                }, _handleAfterHide: function() {
                    this._rule.isDisposed || (this._rule.intellisenseVM.visible = !1, this._pageNavigator.activePage.commitRule());
                    var i = this._activeFlyouts.indexOf(this);
                    this._activeFlyouts.splice(i, 1)
                }, _handleAfterShow: function() {
                    this._rule.isDisposed && this._element.winControl.hide()
                }
        }, {}),
        BehaviorRulePage = WinJS.Class.define(function BehaviorRulePage_ctor(doc, entityManager, pageNavigator, selectionManager, entities, rule) {
            this._document = doc;
            this._entityManager = entityManager;
            this._pageNavigator = pageNavigator;
            this._selectionManager = selectionManager;
            this._entities = entities;
            this._rule = rule;
            this._functions = BehaviorRulePage._getFunctions(rule.propertyInvariantName);
            this._toggleSwitchesDisabled = ko.observable(!1);
            this._toggleSwitchesState = {};
            for (var i = 0, len = this._functions.length; i < len; i++)
                this._toggleSwitchesState[this._functions[i]] = ko.observable(!1);
            this._updateToggleSwitches();
            this._textObservable = ko.computed(function() {
                return this._rule.rhs
            }.bind(this));
            this._textObservable.subscribe(function() {
                this._updateToggleSwitches()
            }, this);
            this._setEditableRuleTextBox = new AppMagic.AuthoringTool.Utility.ViewTrigger({elementHandler: function(viewModel, element) {
                    element.setEditable()
                }})
        }, {
            _document: null, _entityManager: null, _functions: null, _pageNavigator: null, _ruleFunctions: [], _ruleFunctionNames: [], _rule: null, _toggleSwitchesDisabled: null, _toggleSwitchesState: null, _entities: null, _selectionManager: null, _setEditableRuleTextBox: null, activate: function(data) {
                    data && data.editRule && this._setEditableRuleTextBox.tryInvoke(0)
                }, _createArgSelectorPage: function(functionName) {
                    for (var functionInfo = null, len = this._ruleFunctions.length, i = 0; i < len; i++) {
                        var ruleFnInfo = this._ruleFunctions[i];
                        if (ruleFnInfo.function === functionName) {
                            functionInfo = ruleFnInfo;
                            break
                        }
                    }
                    var argSelectorPage = new FunctionArgSelectorPage(this._document, this._entityManager, this._entities, this._pageNavigator, this._selectionManager, functionName, functionInfo, this._rule);
                    return this._pageNavigator.push(argSelectorPage), this._pageNavigator.navigateTop(), !0
                }, _updateToggleSwitches: function() {
                    this._toggleSwitchesDisabled(!1);
                    var ruleInvocations = this._rule.getInvocations();
                    if (this._ruleFunctions = [], this._ruleFunctionNames = [], ruleInvocations && this._rule.rhsChanged) {
                        var len = ruleInvocations.length;
                        if (this._rule.hasErrors || len === 0)
                            this._toggleSwitchesDisabled(!0);
                        else
                            for (var i = 0; i < len; i++) {
                                var functionName = ruleInvocations[i].function;
                                if (this._functions.indexOf(functionName) < 0) {
                                    this._toggleSwitchesDisabled(!0);
                                    break
                                }
                                else
                                    this._ruleFunctions.push(ruleInvocations[i]),
                                    this._ruleFunctionNames.push(ruleInvocations[i].function)
                            }
                    }
                    this._toggleSwitchesDisabled() || this._updateToggleSwitchesState()
                }, _updateToggleSwitchesState: function() {
                    for (var i = 0, len = this._functions.length; i < len; i++) {
                        var functionName = this._functions[i];
                        this._ruleFunctionNames.indexOf(functionName) >= 0 ? this._toggleSwitchesState[functionName](!0) : this._toggleSwitchesState[functionName](!1)
                    }
                }, commitRule: function(){}, handleChange: function(functionName, evt) {
                    if (evt.target.winControl.checked)
                        this._createArgSelectorPage(functionName);
                    else {
                        var invocationList = new InvocationList(this._rule.rhs, this._rule.getInvocations()),
                            isRemoved = invocationList.tryRemoveInvocation(functionName);
                        isRemoved && (this._rule.rhs = invocationList.toString())
                    }
                }, handleClick: function(functionName) {
                    return this._toggleSwitchesDisabled() ? !0 : (this._createArgSelectorPage(functionName), !0)
                }, pageName: {get: function() {
                        return "BehaviorRulePage"
                    }}, pageNavigator: {get: function() {
                        return this._pageNavigator
                    }}, rule: {get: function() {
                        return this._rule
                    }}, setEditableRuleTextBox: {get: function() {
                        return this._setEditableRuleTextBox
                    }}, toggleSwitchesDisabled: {get: function() {
                        return this._toggleSwitchesDisabled()
                    }}, toggleSwitchesState: {get: function() {
                        return this._toggleSwitchesState
                    }}, visibleFunctions: {get: function() {
                        return this._functions
                    }}
        }, {_getFunctions: function(propertyInvariantName) {
                switch (propertyInvariantName) {
                    case"OnVisible":
                    case"OnHidden":
                        return PropertyFunctionNames[propertyInvariantName];
                    default:
                        return PropertyFunctionNames.all
                }
            }}),
        FunctionArgSelectorPage = WinJS.Class.define(function FunctionArgSelectorPage_ctor(doc, entityManager, entities, pageNavigator, selectionManager, functionName, functionInfo, rule) {
            this._document = doc;
            this._entityManager = entityManager;
            this._entities = entities;
            this._pageNavigator = pageNavigator;
            this._selectionManager = selectionManager;
            this._functionName = functionName;
            this._functionInfo = functionInfo;
            this._rule = rule;
            this._functionText = ko.observable("");
            this._initializeArgs();
            this._updateFunctionText();
            document.addEventListener("click", this._handleDocClick.bind(this), !1)
        }, {
            _document: null, _entityManager: null, _entities: null, _pageNavigator: null, _selectionManager: null, _functionName: null, _rule: null, _args: null, _argsChanged: !1, _functionInfo: null, _functionText: null, _optionalArgs: null, _getArgsOptions: function() {
                    switch (this._functionName) {
                        case navigateFunctionName:
                            return this._getNavigateArgsOptions();
                        case collectFunctionName:
                            return this._getCollectRemoveArgsOptions();
                        case removeFunctionName:
                            return this._getCollectRemoveArgsOptions();
                        default:
                            return []
                    }
                }, _getOptionFromRuleExpression: function(ruleExpression, options) {
                    for (var i = 0, len = options.length; i < len; i++)
                        if (ruleExpression === options[i].ruleExpression)
                            return options[i];
                    return null
                }, _getNavigateArgsOptions: function() {
                    for (var screens = this._entityManager.screens(), screenItems = [], nextScreenName = this._getNextScreenName(), nextScreenPosition = 0, i = 0, len = screens.length; i < len; i++) {
                        var screenName = Microsoft.AppMagic.Common.LanguageHelper.escapeName(screens[i].name);
                        screenItems.push(new DataSourceItem(screenName));
                        screenName === nextScreenName && (nextScreenPosition = i)
                    }
                    var screenTransitions = AppMagic.AuthoringTool.VisualIntellisense.ScreenTransitions;
                    return [{
                                options: screenItems, defaultValue: screenItems[nextScreenPosition]
                            }, {
                                options: screenTransitions, defaultValue: screenTransitions[0]
                            }]
                }, _getCollectionDataSources: function() {
                    for (var dataSources = [], dataSourceIterator = this._document.dataSources.first(); dataSourceIterator.hasCurrent; dataSourceIterator.moveNext()) {
                        var dataSource = dataSourceIterator.current;
                        if (dataSource.kind === Microsoft.AppMagic.Authoring.DataSourceKind.collection) {
                            var dataSourceName = Microsoft.AppMagic.Common.LanguageHelper.escapeName(dataSource.name);
                            dataSources.push(new DataSourceItem(dataSourceName))
                        }
                    }
                    return dataSources
                }, _getCollectRemoveArgsOptions: function() {
                    var collections = this._getCollectionDataSources();
                    this._functionName !== removeFunctionName && collections.push(new DataSourceItem(AppMagic.AuthoringStrings.NewCollection));
                    var data = [];
                    if (this._entities.length === 1 && (!this._entities[0].groupedVisuals || this._entities[0].groupedVisuals.length === 0)) {
                        var dataSourceManager = new AppMagic.AuthoringTool.ViewModels.DataSourceManager(this._document, this._entityManager, this._entities[0], function() {
                                return []
                            });
                        data = dataSourceManager.getDocDataSources(AppMagic.Constants.DocDataSources.aggregate)
                    }
                    var currentDataValue = this._args[1].currentValue();
                    return currentDataValue.length > 0 && data.indexOf(currentDataValue) < 0 && data.unshift(new DataSourceItem(currentDataValue)), [{
                                options: collections, defaultValue: collections.length > 0 ? collections[0] : new DataSourceItem("")
                            }, {
                                options: data, defaultValue: data.length > 0 ? data[0] : new DataSourceItem("")
                            }]
                }, _getNewCollectionName: function() {
                    for (var dataSources = this._getCollectionDataSources(), index = 1, collectionName = Core.Utility.formatString(AppMagic.AuthoringStrings.CollectionNameFormat, index.toString()), existingCollection = this._getOptionFromRuleExpression(collectionName, dataSources); existingCollection !== null; )
                        index++,
                        collectionName = Core.Utility.formatString(AppMagic.AuthoringStrings.CollectionNameFormat, index.toString()),
                        existingCollection = this._getOptionFromRuleExpression(collectionName, dataSources);
                    return Microsoft.AppMagic.Common.LanguageHelper.escapeName(collectionName)
                }, _getNextScreenName: function() {
                    for (var screens = this._entityManager.screens(), currentScreenName = Microsoft.AppMagic.Common.LanguageHelper.escapeName(this._selectionManager.screen.name), currentScreenFound = !1, nextScreenName = Microsoft.AppMagic.Common.LanguageHelper.escapeName(screens[0].name), i = 0, len = screens.length; i < len; i++) {
                        var screenName = Microsoft.AppMagic.Common.LanguageHelper.escapeName(screens[i].name);
                        currentScreenFound && (nextScreenName = screenName, currentScreenFound = !1);
                        screenName === currentScreenName && (currentScreenFound = !0)
                    }
                    return nextScreenName
                }, _handleDocClick: function(evt) {
                    if (typeof evt.target.className != "string" || evt.target.className.indexOf("argOptions") < 0 && evt.target.className.indexOf("optionItem") < 0 && evt.target.className.indexOf("argText") < 0 && evt.target.className.indexOf("dropArrow") < 0 && evt.target.className.indexOf("dropArrowImg") < 0)
                        for (var i = 0, len = this._args.length; i < len; i++)
                            this._args[i].optionsVisible(!1)
                }, _initializeArgs: function() {
                    this._args = [];
                    for (var i = 0; i < ArgsCount; i++)
                        this._args.push({
                            currentValue: ko.observable(new DataSourceItem("")), options: ko.observableArray(), optionsVisible: ko.observable(!1)
                        });
                    var argsLen = this._args.length;
                    this._optionalArgs = ko.observable("");
                    var ruleArgs = this._functionInfo ? this._functionInfo.args : [],
                        ruleArgsLen = ruleArgs.length;
                    for (i = 0; i < argsLen && i < ruleArgsLen; i++)
                        this._args[i].currentValue(new DataSourceItem(ruleArgs[i].argument));
                    for (var optionalArgs = []; i < ruleArgsLen; i++)
                        optionalArgs.push(ruleArgs[i].argument);
                    optionalArgs.length > 0 && this._optionalArgs(optionalArgs.join(argSeparator));
                    var argsOptions = this._getArgsOptions();
                    for (i = 0; i < argsLen; i++) {
                        var arg = this._args[i],
                            options = argsOptions[i].options;
                        if (arg.currentValue().ruleExpression === "") {
                            var value = argsOptions[i].defaultValue;
                            if (value.ruleExpression === AppMagic.AuthoringStrings.NewCollection) {
                                var newCollectionName = this._getNewCollectionName();
                                value = new DataSourceItem(newCollectionName);
                                options.unshift(value)
                            }
                            this._updateArg(value, i)
                        }
                        else {
                            var option = this._getOptionFromRuleExpression(arg.currentValue().ruleExpression, options);
                            option !== null && (this._args[i].currentValue(option), this._updateFunctionText())
                        }
                        arg.options(options)
                    }
                }, _updateArg: function(value, index) {
                    this._argsChanged = !0;
                    this._args[index].currentValue(value);
                    this._updateFunctionText()
                }, _updateFunctionText: function() {
                    for (var text = this._functionName + "(", i = 0, len = this._args.length; i < len; i++)
                        text += this._args[i].currentValue().ruleExpression,
                        i < len - 1 && (text += argSeparator);
                    this._optionalArgs() !== "" && (text += argSeparator + this._optionalArgs());
                    text += ")";
                    this._functionText(text)
                }, commitRule: function() {
                    if (this._argsChanged) {
                        for (var hasEmptyArg = !1, i = 0, len = this._args.length; i < len; i++)
                            if (this._args[i].currentValue().ruleExpression === "") {
                                hasEmptyArg = !0;
                                break
                            }
                        if (!hasEmptyArg) {
                            var invocationList = new InvocationList(this._rule.rhs, this._rule.getInvocations());
                            invocationList.updateInvocationText(this._functionName, this._functionText());
                            this._rule.rhs = invocationList.toString()
                        }
                    }
                }, functionArgs: {get: function() {
                        return this._args
                    }}, functionName: {get: function() {
                        return this._functionName
                    }}, functionText: {get: function() {
                        return this._functionText()
                    }}, handleArrowClick: function(index, optionsContainerDiv) {
                    for (var arg = this._args[index], optionsVisible = arg.optionsVisible(), i = 0, len = this._args.length; i < len; i++) {
                        var tempArg = this._args[i];
                        i === index ? tempArg.options().length > 0 && tempArg.optionsVisible(!optionsVisible) : tempArg.optionsVisible(!1)
                    }
                    arg.optionsVisible() && AppMagic.AuthoringTool.Utility.scrollElementToTop(optionsContainerDiv, "argOptions", arg.currentValue().displayName)
                }, handleBackClick: function() {
                    this._goBack(!1)
                }, handleFunctionTextClick: function() {
                    this._goBack(!0)
                }, _goBack: function(editRule) {
                    this.commitRule();
                    this._pageNavigator.navigateBack({editRule: editRule});
                    document.removeEventListener("click", this._handleDocClick.bind(this), !1)
                }, handleBlur: function(index, data, ruleExpression) {
                    var option = this._getOptionFromRuleExpression(ruleExpression, data.options());
                    option !== null && this._updateArg(option, index)
                }, handleOptionClick: function(value, index) {
                    if (value.ruleExpression === AppMagic.AuthoringStrings.NewCollection) {
                        var newCollectionName = this._getNewCollectionName(),
                            existingCollection = this._getOptionFromRuleExpression(newCollectionName, this._args[index].options());
                        if (existingCollection === null) {
                            var newCollection = new DataSourceItem(newCollectionName),
                                options = this._args[index].options();
                            options.unshift(newCollection);
                            value = newCollection
                        }
                        else
                            value = existingCollection
                    }
                    this._updateArg(value, index);
                    this._args[index].optionsVisible(!1)
                }, handleOptionKeyDown: function(optionIndex, argIndex, optionsDiv, option, evt) {
                    if (evt.key === AppMagic.Constants.Keys.enter || evt.key === AppMagic.Constants.Keys.tab)
                        this.handleOptionClick(option, argIndex);
                    else {
                        var selectedText = AppMagic.AuthoringTool.Utility.tryGetTextOnSelectKeyUpDown(optionsDiv, optionIndex, OptionsMaxSize, evt.key);
                        selectedText !== null && this._updateArg(selectedText, argIndex)
                    }
                }, pageName: {get: function() {
                        return "FunctionArgSelector"
                    }}, pageNavigator: {get: function() {
                        return this._pageNavigator
                    }}
        }, {}),
        InvocationList = WinJS.Class.define(function InvocationList_ctor(rhs, ruleInvocations, statementSep) {
            this._statementSeparator = statementSep || statementSeparator;
            this._invocations = this._getInvocations(rhs, ruleInvocations)
        }, {
            _invocations: null, _statementSeparator: null, _getInvocations: function(rhs, ruleInvocations) {
                    var invocations = {};
                    if (ruleInvocations)
                        for (var i = 0, len = ruleInvocations.length; i < len; i++) {
                            var invocation = ruleInvocations[i],
                                text = rhs.substring(invocation.span.min, invocation.span.lim).trim(),
                                textLenWithoutSeparator = text.length - this._statementSeparator.length;
                            textLenWithoutSeparator > 0 && text.substring(textLenWithoutSeparator) === this._statementSeparator && (text = text.substring(0, textLenWithoutSeparator));
                            invocations[invocation.function] = text
                        }
                    return invocations
                }, toString: function() {
                    var textArray = [];
                    for (var invocation in this._invocations)
                        textArray.push(this._invocations[invocation]);
                    return textArray.join(this._statementSeparator + " ")
                }, tryRemoveInvocation: function(invocationName) {
                    return typeof this._invocations[invocationName] == "undefined" ? !1 : (delete this._invocations[invocationName], !0)
                }, updateInvocationText: function(invocationName, text) {
                    this._invocations[invocationName] = text
                }
        }, {});
    WinJS.Class.mix(BehaviorRulePage, WinJS.Utilities.eventMixin);
    WinJS.Class.mix(FunctionArgSelectorPage, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        BehaviorRuleFlyout: BehaviorRuleFlyout, _FunctionArgSelectorPage: FunctionArgSelectorPage, _InvocationList: InvocationList
    })
})();