﻿Jx.delayDefine(People.Accounts,["cannotConnectToNetwork","ensureNetworkOnFirstRun"],function(){var i=window.People,n=i.Accounts,r=Microsoft.WindowsLive.Platform,t;n.ensureNetworkOnFirstRun=function(n){var u=n.accountManager.defaultAccount.getResourceByType(r.ResourceType.meContactFolder),f,i;u&&!u.hasEverSynchronized&&(Jx.log.info("Initial sync has not completed. Checking network status..."),f=Windows.Networking.Connectivity,i=function(){t()&&(Jx.log.info("No network connection detected. Showing barricade."),People.Accounts.showNoConnectionErrorDialog(i))},i())};t=n.cannotConnectToNetwork=function(){try{var n=Windows.Networking.Connectivity,t=n.NetworkInformation.getInternetConnectionProfile();return!t||t.getNetworkConnectivityLevel()<n.NetworkConnectivityLevel.internetAccess}catch(i){return Jx.log.exception("Exception in cannotConnectToNetwork()",i),false}}})