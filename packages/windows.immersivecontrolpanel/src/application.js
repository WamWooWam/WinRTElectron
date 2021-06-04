(() => {   

    let nav = WinJS.Navigation;
    let renderHost = null;

    function init() {
        ImmersiveControlPanel.Sidebar.init();
        nav.history.current.initialPlaceholder = true;
        nav.navigate(nav.location || Application.navigator.home, nav.state)
    }

    WinJS.Namespace.define("ImmersiveControlPanel.Application", {
        init
    });
})();