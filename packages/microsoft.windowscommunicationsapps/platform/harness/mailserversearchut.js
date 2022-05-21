
var MailServerSearchTest = MailServerSearchTest || {};
MailServerSearchTest.harness = null;
MailServerSearchTest.collection = null;

MailServerSearchTest.handler = function (ev) {
    var args = ev;
    var logElement = document.getElementById('UTLog');
    var coll = MailServerSearchTest.collection;
    var CollectionChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType;

    logElement.innerHTML = logElement.innerHTML + "<br />" + "Event eType=<b>" + getPropertyName(CollectionChangeType, args.eType)
                            + "[" + args.eType + "]</b>, index=<b>" + args.index + "</b>; Collection: count=<b>" + coll.count 
                            + "</b>, totalCount=<b>" + coll.totalCount + "</b>";
    
    switch(args.eType) {
    case CollectionChangeType.batchEnd:
    case CollectionChangeType.localSearchComplete:
        break;
    case CollectionChangeType.serverSearchComplete:
        logElement.innerHTML = logElement.innerHTML + "<br /> result status: <b>" + getPropertyName(Microsoft.WindowsLive.Platform.SearchStatusCode, args.index) + "[" + args.index +"]</b>";
        break;
    case CollectionChangeType.itemAdded:
        logElement.innerHTML = logElement.innerHTML + "<br /> Item[" + args.index + "] subject=" + coll.item(args.index).subject;
    }
}

// Search for a mail on the server.
MailServerSearchTest.Search = function (id) {
    var logElement = document.getElementById('UTLog');

    try {
        var wl = Microsoft.WindowsLive.Platform;
        var defaultUser = "default@live.com";

        if (MailServerSearchTest.harness == null) {
            MailServerSearchTest.harness = new wl.Test.ClientTestHarness("unittests", wl.Test.PluginsToStart.none);
        }

        var harness = MailServerSearchTest.harness;
        var platform = harness.client;
        var mailManager = platform.mailManager;
        var defaultAccount = platform.accountManager.defaultAccount;
        var c = platform.accountManager.getConnectedAccountsByScenario(wl.ApplicationScenario.mail, wl.ConnectedFilter.normal, wl.AccountSort.rank);

        var term = document.getElementById("mailSearchTerm").value;
        var count = document.getElementById("mailSearchCount").value;
        var viewObjectId = document.getElementById("mailSearchViewObjectId").value;
        var viewType = document.getElementById("mailSearchViewType").value;
        var account = document.getElementById("mailSearchAccount").value;
        if (viewObjectId) {
            var searchScope = ensureMailView(viewType, viewObjectId, account);
        } else {
            var searchScope = platform.accountManager.loadAccount(account);
        }
        
        MailServerSearchTest.collection = mailManager.search(searchScope, term, "en-us", count);
        MailServerSearchTest.collection.beginServerSearch();
        MailServerSearchTest.collection.addEventListener("collectionchanged", MailServerSearchTest.handler);
        MailServerSearchTest.collection.unlock();

        logElement.innerHTML = logElement.innerHTML + "<br /> search for " + term;
    }
    catch (e) {
        logElement.innerHTML = "Error:" + e.stack;
    }
}

// Attempts to fetch another page from the collection
MailServerSearchTest.FetchMoreItems = function () {
    var logElement = document.getElementById('UTLog');

    try {
        if (null != MailServerSearchTest.collection) {
            var count = document.getElementById("mailSearchCount").value;
            
            MailServerSearchTest.collection.fetchMoreItems(count);
        }

        logElement.innerHTML = logElement.innerHTML + "<br /> fetching " + count + " more";
    }
    catch (e) {
        logElement.innerHTML = "Error:" + e.stack;
    }
}
