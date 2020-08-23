/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/iaservice.js", "/Framework/serviceLocator.js", "/Monikers.js");
(function() {
    "use strict";
    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.informationArchitecture)) {
        Trace.fail("InformationArchitecture - Information Architecture not registered. This should be impossible, but is always fatal");
        throw new Error("Information Architecture - Information Architecture not registered");
    }
    var ia = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
    var createImmersiveDetailsIA = function createImmersiveDetailsIA() {
            var Viewability = MS.Entertainment.InformationArchitecture.Viewability;
            var immersiveDetails = ia.createNode("", MS.Entertainment.UI.Monikers.immersiveDetails, null, {hub: Viewability.hidden}, false);
            immersiveDetails.getPage = (function() {
                var oldGetPage = immersiveDetails.getPage;
                return function customImmersiveDetailsGetPage() {
                        var page = oldGetPage.call(this);
                        page.overrideFragmentUrl = "/Components/Immersive/ImmersiveNavStub.html";
                        return page
                    }
            })();
            Object.defineProperty(immersiveDetails, "showNotifications", {get: function() {
                    return true
                }});
            ia.rootNode.addChild(immersiveDetails)
        };
    createImmersiveDetailsIA();
    ia.addIAHandler(createImmersiveDetailsIA, true)
})()
