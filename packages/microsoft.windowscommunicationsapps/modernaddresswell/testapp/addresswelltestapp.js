
// This file contains logic specific to the share page and outside any component hierarchy.

// Upon loading of the page, set up the application's root component
window.addEventListener("DOMContentLoaded", function () {
    Jx.app = new Jx.Application();

    Jx.log.info("app.DOMContentLoaded.start");
    Jx.log.level = Jx.LOG_VERBOSE;
    Jx.root = new RootComponent();

    // The root component will insert the the HTML on the document.body
    Jx.app.initUI(document.getElementById("root"));

    Jx.log.info("app.DOMContentLoaded.end");
}, false);

// Upon unloading of the page, destroy the application and its root component
window.addEventListener("beforeunload", function() {
    Jx.log.info("app.beforeunload.start");
    Jx.log.info("app.beforeunload.end");
    Jx.app.shutdownUI();
    Jx.app.shutdown();
}, false);