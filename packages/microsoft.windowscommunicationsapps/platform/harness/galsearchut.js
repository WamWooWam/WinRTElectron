

var GalSearchTest = GalSearchTest || {};
GalSearchTest.harness = null;
GalSearchTest.collection1 = null;
GalSearchTest.collection2 = null;


GalSearchTest.printCollection = function (collection) {
    var logElement = document.getElementById('UTLog');
    var result = dumpToHtml(collection);
    logElement.innerHTML = logElement.innerHTML + "<br /> " + toStaticHTML(result);
}

GalSearchTest.GalCollectionChanged1 = function(ev) {
    var notification = ev.detail[0];
    if (notification.eType == 7) {
        var logElement = document.getElementById('UTLog');
        logElement.innerHTML = logElement.innerHTML + "<br /> result status: " + notification.index;
        GalSearchTest.printCollection(GalSearchTest.collection1);
    }
}

GalSearchTest.GalCollectionChanged2 = function(ev) {
    var notification = ev.detail[0];
    if (notification.eType == 7) {
        var logElement = document.getElementById('UTLog');
        logElement.innerHTML = logElement.innerHTML + "<br /> result status: " + notification.index;
        GalSearchTest.printCollection(GalSearchTest.collection2);
    }
}

GalSearchTest.CleanupGalSearch = function () {
    try {
        if (GalSearchTest.collection1 != null) {
            GalSearchTest.collection1.removeEventListener("collectionchanged", GalSearchTest.GalCollectionChanged1);
            GalSearchTest.collection1.dispose();
            
            GalSearchTest.collection1 = null;
        }
        if (GalSearchTest.collection2 != null) {
            GalSearchTest.collection2.removeEventListener("collectionchanged", GalSearchTest.GalCollectionChanged2);
            GalSearchTest.collection2.dispose();
            
            GalSearchTest.collection2 = null;
        }

        if (GalSearchTest.harness != null) {

            GalSearchTest.harness.store.clearTable("SearchPerson");
            GalSearchTest.harness.store.clearTable("SearchRequest");

            GalSearchTest.harness.dispose();
            GalSearchTest.harness = null;
        }


    }
    catch (e) {
        document.getElementById('UTLog').innerHTML = "" + e;
    }
}

GalSearchTest.ClearUTLog = function () {
    document.getElementById('UTLog').innerHTML = "";
    GalSearchTest.CleanupGalSearch();
}

GalSearchTest.FetchMore = function (count) {
    try {
        if (GalSearchTest.collection1) {
            GalSearchTest.collection1.fetchMoreItems(count);
        }
    }
    catch (e) {
        document.getElementById('UTLog').innerHTML = "Error " + e;
    }
}

GalSearchTest.StartEasPlugin = function () {

    var defaultUser = "default@live.com";
    if (GalSearchTest.harness == null) {
        GalSearchTest.harness = new Microsoft.WindowsLive.Platform.Test.ClientTestHarness("unittests", Microsoft.WindowsLive.Platform.Test.PluginsToStart.none);
    }
    var defaultAccount = GalSearchTest.harness.client.accountManager.defaultAccount;
    GalSearchTest.harness.requestServiceResources("eas", defaultAccount.objectId);

}

GalSearchTest.CancelGalSearch = function (id) {
    if (id == "1") {
        if (GalSearchTest.collection1 != null) {
            GalSearchTest.collection1.removeEventListener("collectionchanged", GalSearchTest.GalCollectionChanged1);
            GalSearchTest.collection1.dispose();

            GalSearchTest.collection1 = null;
        }
    }
    else if (id == "2") {
        GalSearchTest.collection2.dispose();
    }
    var logElement = document.getElementById('UTLog').innerHTML;
    logElement.innerHTML = logElement.innerHTML + "<br/> Search Canceled";
}

GalSearchTest.GalSearch = function (id) {
    var logElement = document.getElementById('UTLog');
    try {
        var wl = Microsoft.WindowsLive.Platform;
        var defaultUser = "default@live.com";
        if (GalSearchTest.harness == null) {
            GalSearchTest.harness = new wl.Test.ClientTestHarness("unittests", wl.Test.PluginsToStart.none);
        }
        var harness = GalSearchTest.harness;
        var platform = harness.client;
        var peopleManager = platform.peopleManager;
        var defaultAccount = platform.accountManager.defaultAccount;
        var c=platform.accountManager.getConnectedAccountsByScenario(wl.ApplicationScenario.peopleSearch, wl.ConnectedFilter.normal, wl.AccountSort.rank);
        var accountToUse = (c.count > 0 ? c.item(0) : defaultAccount);
        

        if (id == "1") {
            var term = document.getElementById("search1").value;
            var count = document.getElementById("count1").value;
            if (GalSearchTest.collection1 != null) {
                GalSearchTest.collection1.removeEventListener("collectionchanged", GalSearchTest.GalCollectionChanged1);
                GalSearchTest.collection1.dispose();

                GalSearchTest.collection1 = null;
            }
            GalSearchTest.collection1 = peopleManager.searchServer(term, count, accountToUse, 0);
            GalSearchTest.collection1.addEventListener("collectionchanged", GalSearchTest.GalCollectionChanged1);
            GalSearchTest.collection1.unlock();

            logElement.innerHTML = logElement.innerHTML + "<br /> search for " + term;
        }
        else if (id == "2") {
            var term = document.getElementById("search2").value;
            var count = document.getElementById("count2").value;
            GalSearchTest.collection2 = peopleManager.searchServer(term, count, accountToUse, 0);
            GalSearchTest.collection2.addEventListener("collectionchanged", GalSearchTest.GalCollectionChanged2);

            logElement.innerHTML = logElement.innerHTML + "<br /> search for " + term;
        }

    }
    catch (e) {
        logElement.innerHTML = "Error:" + e;
        GalSearchTest.CleanupGalSearch();
    }
}

GalSearchTest.Unlock2 = function () {
    if (GalSearchTest.collection2 != null) {
        GalSearchTest.collection2.unlock();
    }
}

GalSearchTest.InsertResult = function () {
    var logElement = document.getElementById('UTLog');
    try {
        var id = document.getElementById("requestid").value;
        GalSearchTest.harness.store.executeXmlTask(Microsoft.WindowsLive.Platform.Test.XmlSource.filePath, "platform\\harness\\GalSearchData.xml", "insert" + id);
    }
    catch (e) {
        logElement.innerHTML = "Error:" + e;
    }
}
