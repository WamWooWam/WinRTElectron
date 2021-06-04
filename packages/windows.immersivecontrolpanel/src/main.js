(() => {
    let app = WinJS.Application;
    let activation = Windows.ApplicationModel.Activation;
    let settings = Windows.UI.ApplicationSettings;

    app.addEventListener("activated", (args) => {

        // if (!Windows.Foundation.IsFakeWWA) {
        //     let dialog = new Windows.UI.Popups.MessageDialog(
        //         "This app is only designed to run under the Windows 8.1 for Web shim, and may not actually work on Windows 8.1. Proceed with caution",
        //         "Warning");
        //     dialog.showAsync();
        // }

        if (args.detail.kind == activation.ActivationKind.launch) {
            WinJS.Application.onsettings = (e) => {
                var commands = e.detail.e.request.applicationCommands;
                commands.append(new settings.SettingsCommand("help", "Help", () => {
                    Windows.System.Launcher.launchUriAsync("https://go.microsoft.com/fwlink/p/?LinkId=296426");
                }));
            }

            args.setPromise(WinJS.UI.processAll().then(() => {
                ImmersiveControlPanel.Application.init();
            }));
        }
    })

    app.addEventListener("checkpoint", (args) => {
        // App is about to be suspended, cleanup here.
    })

    app.start();
})();