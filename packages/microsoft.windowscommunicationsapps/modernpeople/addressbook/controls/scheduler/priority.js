
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="Job.ref.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

/*global window,Jx,People*/

Jx.delayDefine(People, "Priority", function () {

    var P = window.People,
        Base = Jx.Scheduler.BasePriority;

    P.Priority = Jx.scheduler.definePriorities({
        // responsiveness
        next:              { base: Base.aboveNormal },
        scroll:            { base: Base.aboveNormal },
        resize:            { base: Base.aboveNormal },

        // low fidelity rendering - at this point, the page is visible and interactive
        realizeHeader:     { base: Base.aboveNormal },
        realizeItem:       { base: Base.aboveNormal },
        query:             { base: Base.aboveNormal },
        focus:             { base: Base.aboveNormal },
        userTileRender:    { base: Base.aboveNormal },
        perfLowFidelity:   { base: Base.aboveNormal },
       
        // high fidelity rendering - these elements trickle in shortly after the page is visible
        panel:             { base: Base.normal },
        semanticZoom:      { base: Base.normal },
        feedModule:        { base: Base.normal },
        typeToSearch:      { base: Base.normal },
        navbar:            { base: Base.normal },
        appbar:            { base: Base.normal },
        slowData:          { base: Base.normal },
        connectedAccounts: { base: Base.normal },
        settingsPane:      { base: Base.normal },
        accessibility:     { base: Base.normal },
        perfHighFidelity:  { base: Base.normal },

        // background UI updates - these activities may be significantly delayed
        messageBar:        { base: Base.belowNormal },
        tileError:         { base: Base.belowNormal },
        firstRun:          { base: Base.belowNormal },
        tooltip:           { base: Base.belowNormal },
        userTileDownload:  { base: Base.belowNormal },
        queryUpdate:       { base: Base.belowNormal },
        propertyUpdate:    { base: Base.belowNormal },
        notifications:     { base: Base.belowNormal },
        socialData:        { base: Base.belowNormal },

        // idle tasks
        bici:              { base: Base.idle },
        backgroundLoad:    { base: Base.idle },
        suggestions:       { base: Base.idle },
        replication:       { base: Base.idle },
        fetchContacts:     { base: Base.idle },
        launch:            { base: Base.idle },

        // DEBUG (lowest) priority.  Run after anything/everything else.
        debug:             { base: Base.idle }

    });
 
    // synchronous - Not a real priority, this is a placeholder to signal synchronous operation.
    P.Priority.synchronous = {};

});
