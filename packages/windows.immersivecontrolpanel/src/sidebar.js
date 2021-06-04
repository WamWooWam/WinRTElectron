(() => {
    var topLevelItems = [
        {
            title: "PC and devices", subItems: [
                { title: "Lock screen", page: "/pages/lockscreen.html" },
                { title: "Display", page: "/pages/blank.html" },
                { title: "Bluetooth", page: "/pages/blank.html" },
                { title: "Devices", page: "/pages/blank.html" },
                { title: "Mouse and touchpad", page: "/pages/blank.html" },
                { title: "Typing", page: "/pages/blank.html" },
                { title: "Corners and edges", page: "/pages/blank.html" },
                { title: "Power and sleep", page: "/pages/blank.html" },
                { title: "AutoPlay", page: "/pages/blank.html" },
                { title: "Disk space", page: "/pages/blank.html" },
                { title: "Advanced", page: "/pages/advanced.html" },
                { title: "PC info", page: "/pages/about.html" },
            ]
        },
        { title: "Accounts", page: "/pages/blank.html" },
        { title: "OneDrive", page: "/pages/blank.html" },
        { title: "Search and apps", page: "/pages/blank.html" },
        { title: "Privacy", page: "/pages/blank.html" },
        { title: "Network", page: "/pages/blank.html" },
        { title: "Time and language", page: "/pages/blank.html" },
        { title: "Ease of Access", page: "/pages/blank.html" },
        {
            title: "Update and recovery",
            subItems: [
                { title: "Windows Update", page: "/pages/windowsupdate.html" },
                { title: "File History", page: "/pages/blank.html" },
                { title: "Recovery", page: "/pages/blank.html" }
            ]
        }
    ];

    let listView = null;
    let sidebar = null;
    let sidebarTitle = null;
    let itemHistory = [];
    let listViewDataList = new WinJS.Binding.List(topLevelItems);
    let topLevel = "/pages/mainview.html";

    function onItemInvoked(e) {
        let item = itemHistory[itemHistory.length - 1][e.detail.itemIndex];
        if (item.subItems) {
            sidebarTitle.innerText = item.title;
            itemHistory.push(item.subItems);

            let first = item.subItems[0];
            listView.itemDataSource = new WinJS.Binding.List(item.subItems).dataSource;
            WinJS.UI.Animation.enterContent(sidebar, null);
            WinJS.Navigation.navigate(first.page);
        }
        else if (item.page) {
            WinJS.Navigation.navigate(item.page);
        }
    }

    function onNavigating(e) {
        // TODO: Handle this properly
        if (e.detail.delta < 0) {
            let delta = Math.abs(e.detail.delta) + 1;
            for (let i = 0; i < delta; i++) {
                itemHistory.pop();
            }
        }

        if (e.detail.location == topLevel) {
            itemHistory.push(topLevelItems);
            listView.itemDataSource = listViewDataList.dataSource;
            WinJS.UI.Animation.enterContent(sidebar, null);
        }
    }

    function onControlPanelInvoked(e) {
        e.preventDefault();

        var dialog = new Windows.UI.Popups.MessageDialog("Not yet implemented");
        dialog.showAsync();
    }

    function init() {
        let button = document.getElementById("control-panel-link");
        button.addEventListener("click", onControlPanelInvoked);

        WinJS.Navigation.addEventListener("navigating", onNavigating);

        sidebar = document.getElementById("sidebar-content");
        listView = document.getElementById("sidebar-list-view").winControl;
        listView.addEventListener("iteminvoked", onItemInvoked);
        listView.addEventListener("contentanimating", function (e) { e.preventDefault() });
        listView.itemDataSource = listViewDataList.dataSource;

        sidebarTitle = document.getElementById("sidebar-title");
        WinJS.UI.Animation.enterContent(sidebar, null);
    }

    WinJS.Namespace.define("ImmersiveControlPanel.Sidebar", {
        init
    });
})();