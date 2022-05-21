
var SetTileTest = SetTileTest || {};
SetTileTest.harness = null;

SetTileTest.SetTile = function () {
    var logElement = document.getElementById('UTLog');
    try {
        var wl = Microsoft.WindowsLive.Platform;
        if (SetTileTest.harness == null) {
            SetTileTest.harness = new wl.Test.ClientTestHarness("unittests", wl.Test.PluginsToStart.none);
        }
        
        var name = document.getElementById("setTileName").value;

        Windows.ApplicationModel.Package.current.installedLocation.getFileAsync("tile.png").then(function (file) {
            file.openAsync(Windows.Storage.FileAccessMode.read).then(function (stream) {

                var harness = SetTileTest.harness;
                var platform = harness.client;

                var peopleCollection = platform.peopleManager.getPeopleNameBetween(Microsoft.WindowsLive.Platform.OnlineStatusFilter.all,
                    name, true, name, true);

                peopleCollection.item(0).setPersonTile(stream);
                peopleCollection.dispose();
            });
        });

    }
    catch (e) {
        logElement.innerHTML = "Error:" + e;
    }
}

SetTileTest.ClearTile = function () {
    var logElement = document.getElementById('UTLog');
    try {
        var wl = Microsoft.WindowsLive.Platform;
        if (SetTileTest.harness == null) {
            SetTileTest.harness = new wl.Test.ClientTestHarness("unittests", wl.Test.PluginsToStart.none);
        }

        var name = document.getElementById("setTileName").value;
        var harness = SetTileTest.harness;
        var platform = harness.client;

        var peopleCollection = platform.peopleManager.getPeopleNameBetween(Microsoft.WindowsLive.Platform.OnlineStatusFilter.all,
            name, true, name, true);

        peopleCollection.item(0).clearPersonTile();
        peopleCollection.dispose();
    }
    catch (e) {
        logElement.innerHTML = "Error:" + e;
    }
}

SetTileTest.CanClearTile = function () {
    var logElement = document.getElementById('UTLog');
    try {
        var wl = Microsoft.WindowsLive.Platform;
        if (SetTileTest.harness == null) {
            SetTileTest.harness = new wl.Test.ClientTestHarness("unittests", wl.Test.PluginsToStart.none);
        }

        var name = document.getElementById("setTileName").value;
        var harness = SetTileTest.harness;
        var platform = harness.client;

        var peopleCollection = platform.peopleManager.getPeopleNameBetween(Microsoft.WindowsLive.Platform.OnlineStatusFilter.all,
            name, true, name, true);

        logElement.innerHTML = logElement.innerHTML + "CanClearTile = " + peopleCollection.item(0).canClearPersonTile;
        peopleCollection.dispose();
    }
    catch (e) {
        logElement.innerHTML = "Error:" + e;
    }
}
