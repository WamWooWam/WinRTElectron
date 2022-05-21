
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JSUtil/Include.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, ["cannotConnectToNetwork", "ensureNetworkOnFirstRun"], function () {

    var P = window.People,
        A = P.Accounts,
        Plat = Microsoft.WindowsLive.Platform;

    A.ensureNetworkOnFirstRun = function (platform) {
        ///<summary>Ensures that we either have sufficient data to show or have a network connection.
        /// If both these conditions fail, we'll present the user with a barricade which indicates a network connections is required.</summary>
        ///<param name="platform" type="Plat.Client"/>
        var meFolder = platform.accountManager.defaultAccount.getResourceByType(Plat.ResourceType.meContactFolder);
        if (meFolder && !meFolder.hasEverSynchronized) {
            Jx.log.info("Initial sync has not completed. Checking network status...");
            var Con = Windows.Networking.Connectivity;

            // The me-contact-folder's initial sync has not completed. Check to see if we have a network connection.
            var ensureNetworkConnectivity = function () {
                if (cannotConnectToNetwork()) {
                    Jx.log.info("No network connection detected. Showing barricade.");
                    // No network connection. Tell the user he must connect to proceed, since we don't have any real data to show.
                    People.Accounts.showNoConnectionErrorDialog(ensureNetworkConnectivity);
                }
            };
            ensureNetworkConnectivity();
        }
    };

    var cannotConnectToNetwork = A.cannotConnectToNetwork = function () {
        ///<summary>Checks network connectivity. If we can't connect to the internet, fails.</summary>
        try {
            var Con = Windows.Networking.Connectivity;
            var profile = Con.NetworkInformation.getInternetConnectionProfile();
            return (!profile || (profile.getNetworkConnectivityLevel() < Con.NetworkConnectivityLevel.internetAccess));
        } catch (ex) {
            Jx.log.exception("Exception in cannotConnectToNetwork()", ex);
            return false;
        }
    };
});
