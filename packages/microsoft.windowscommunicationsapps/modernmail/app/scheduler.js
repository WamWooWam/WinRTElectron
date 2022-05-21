
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail*/

(function () {
    "use strict";
    var Base = Jx.Scheduler.BasePriority;
    Mail.Priority = Jx.scheduler.definePriorities({
        dismissSplashScreen:                { base: Base.aboveHigh },

        bodyContentChanged:                 { base: Base.high },
        workerCurrentSelectionScrubber:     { base: Base.high },
        messageListSetSelection:            { base: Base.high },
        readingPaneNewSelectedMessage:      { base: Base.high },

        composeSelectionUpdateNav:          { base: Base.aboveNormal },
        bodyLinkFlyout:                     { base: Base.aboveNormal },
        postHideAppBar:                     { base: Base.aboveNormal },
        commandsEnabled:                    { base: Base.aboveNormal },
        registerAuthPresenter:              { base: Base.aboveNormal },
        messageListAcceptPendingChanges:    { base: Base.aboveNormal },
        messageListTryAnimation:            { base: Base.aboveNormal },
        messageListPendingInvoke:           { base: Base.aboveNormal },
        messageListExitSelectionMode:       { base: Base.aboveNormal },
        readingPaneContentChanged:          { base: Base.aboveNormal },
        focusCompose:                       { base: Base.aboveNormal },

        showAppBar:                         { base: Base.normal },
        readingPaneBodyResetZoomLevel:      { base: Base.normal },
        readingPaneBodyResetFrameSize:      { base: Base.normal },
        readingPaneWriteContent:            { base: Base.normal },
        framePostStartupWork:               { base: Base.normal },
        registerCommandBar:                 { base: Base.normal },
        registerPrintHandler:               { base: Base.normal },
        queryCount:                         { base: Base.normal },
        readingPaneBodySecondPass:          { base: Base.normal },
        readingPaneCommandBar:              { base: Base.normal },
        workerScrubber:                     { base: Base.normal },
        workerMessageGetter:                { base: Base.normal },
        workerRater:                        { base: Base.normal },
        workerMessageScrubber:              { base: Base.normal },
        composeSelection:                   { base: Base.normal },

        finishMessageListItem:              { base: Base.belowNormal },
        addOverflowReadingPaneICs:          { base: Base.belowNormal },
        hideKeyboard:                       { base: Base.belowNormal },
        messageListInitSearch:              { base: Base.belowNormal },
        searchResultsFetch:                 { base: Base.belowNormal },
        updateSyncStatus:                   { base: Base.belowNormal },
        updateView:                         { base: Base.belowNormal, description: "Bind and update properties in the view switcher" },
        updateCommandContext:               { base: Base.belowNormal },
        updateAriaFlow:                     { base: Base.belowNormal },

        updateComposeWidth:                 { base: Base.idle },
        createMoreMenu:                     { base: Base.idle },
        postStartupWork:                    { base: Base.idle },
        viewFlyout:                         { base: Base.idle, description: "Prepopulate the view switcher flyout" },
        unrealizeMessageListItem:           { base: Base.idle },
        cleanupOldReadingPaneICs:           { base: Base.idle },
        galLookup:                          { base: Base.idle, description: "Background GAL lookups" },
        composeAutoSave:                    { base: Base.idle },
        reportTelemetryOnVisible:           { base: Base.idle },
        reportTelemetryOnNavigation:        { base: Base.idle },
        addSearchTooltips:                  { base: Base.idle }
    });

})();
