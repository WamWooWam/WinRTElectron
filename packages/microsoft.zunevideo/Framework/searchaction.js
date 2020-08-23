/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {SearchAutomationIds: {
            search: "search", searchByContext: "searchByContext", resetSearchFilter: "resetSearchFilter"
        }});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {
        SearchByContextAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function searchByContextActionConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.searchByContext, executed: function executed(param) {
                    if (this.canExecute(param)) {
                        var moniker = param.moniker;
                        if (moniker !== MS.Entertainment.UI.Monikers.searchPage)
                            if (MS.Entertainment.Utilities.isMusicApp)
                                if (moniker === MS.Entertainment.UI.Monikers.musicCollection)
                                    MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.localCollection;
                                else
                                    MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.all;
                            else if (MS.Entertainment.Utilities.isVideoApp)
                                if (param.defaultModifierIndex)
                                    MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = param.defaultModifierIndex;
                                else
                                    MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.all
                    }
                }, canExecute: function canExecute(param) {
                    return param != null && param != undefined && param.moniker != null
                }
        }), SearchAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function searchAction() {
                this.base()
            }, {
                defaultModifierIndex: null, automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.search, executed: function execute(param) {
                        if (MS.Entertainment.Utilities.isApp2 && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped)
                            return;
                        param = param || {};
                        var defaultModifierIndex = this.defaultModifierIndex || param.defaultModifierIndex || 0;
                        MS.Entertainment.UI.Actions.SearchAction.lastDefaultModifierIndex = defaultModifierIndex;
                        if (param && param.queryText) {
                            MS.Entertainment.ViewModels.SearchContractViewModel.init();
                            MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted({
                                queryText: param.queryText, defaultModifierIndex: defaultModifierIndex
                            })
                        }
                        else {
                            var commandingPopOver = MS.Entertainment.UI.Controls.CommandingPopOver;
                            var searchActionCommandingPopoverHidden = function() {
                                    var existingQuery = String.empty;
                                    if (this.startWithExistingQuery) {
                                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                        if (navigationService.checkUserLocation(MS.Entertainment.UI.Monikers.searchPage))
                                            existingQuery = MS.Entertainment.ViewModels.SearchContractViewModel.current.lastSearchedTerm
                                    }
                                    if (!MS.Entertainment.ViewModels.SearchContractViewModel.showSearchPane(existingQuery))
                                        MS.Entertainment.UI.Controls.TextInputOverlay.getTextInput({
                                            submitText: String.load(String.id.IDS_GLOBAL_COMMAND_SEARCH), watermark: String.load(String.id.IDS_GLOBAL_COMMAND_SEARCH), initialText: existingQuery || null
                                        }).done(function(query) {
                                            MS.Entertainment.ViewModels.SearchContractViewModel.init();
                                            MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted({
                                                queryText: query, defaultModifierIndex: defaultModifierIndex
                                            })
                                        }.bind(this), function searchCancelled(){})
                                }.bind(this);
                            if (commandingPopOver)
                                commandingPopOver.hideCurrentCommandingPopover().done(searchActionCommandingPopoverHidden);
                            else
                                searchActionCommandingPopoverHidden()
                        }
                    }, canExecute: function canExecute() {
                        return true
                    }, startWithExistingQuery: false
            }, {lastDefaultModifierIndex: 0})
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ResetSearchFilterAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function resetSearchFilterActionConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.resetSearchFilter, executed: function executed(param) {
                    if (this.canExecute(param)) {
                        var viewModel = param.viewModel;
                        MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.all;
                        viewModel.modifierSelectionManager.selectedIndex = MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter
                    }
                }, canExecute: function canExecute(param) {
                    return param !== null && param !== undefined && param.viewModel !== null
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ResetSearchHubAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function resetSearchFilterActionConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.resetSearchFilter, executed: function executed(param) {
                    if (this.canExecute(param)) {
                        var viewModel = param.viewModel;
                        if (viewModel)
                            viewModel.pivotSelectedIndexOverride = 0
                    }
                }, canExecute: function canExecute(param) {
                    return param && param.viewModel !== null
                }
        })});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.search, function() {
        return new MS.Entertainment.UI.Actions.SearchAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.searchByContext, function() {
        return new MS.Entertainment.UI.Actions.SearchByContextAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.resetSearchFilter, function() {
        return new MS.Entertainment.UI.Actions.ResetSearchFilterAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.resetSearchHub, function() {
        return new MS.Entertainment.UI.Actions.ResetSearchHubAction
    })
})()
