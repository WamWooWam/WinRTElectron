/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    try {
        if (Windows && !Windows.Xbox && Windows.Storage && Windows.Storage.ApplicationData && Windows.Storage.ApplicationData.current && Windows.Storage.ApplicationData.current.roamingSettings)
            var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings
    }
    catch(e) {
        debugger;
        var shipAssertProvider = new Microsoft.Entertainment.Infrastructure.ShipAssertProvider;
        shipAssertProvider.shipAssert("WarmupCode", "WarmupCode()", "WarmupCode()", "Message: " + e.toString() + e.stack, "")
    }
    try {
        var microsoftEntertainmentApplication = Microsoft.Entertainment.Application;
        var microsoftEntertainmentMarketplaceMarketplace = Microsoft.Entertainment.Marketplace.Marketplace;
        var microsoftEntertainmentConfigurationConfigurationManager = Microsoft.Entertainment.Configuration.ConfigurationManager;
        var microsoftEntertainmentInstrumentationProvidersShell = Microsoft.Entertainment.Instrumentation.Providers.Shell;
        var microsoftEntertainmentInstrumentationProvidersPipeline = Microsoft.Entertainment.Instrumentation.Providers.Pipeline
    }
    catch(e) {
        debugger;
        var shipAssertProvider = new Microsoft.Entertainment.Infrastructure.ShipAssertProvider;
        shipAssertProvider.shipAssert("WarmupCode", "WarmupCode()", "WarmupCode()", "Message: " + e.toString() + e.stack, "")
    }
})()
