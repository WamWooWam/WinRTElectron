(function () {
    const { remote } = require("electron")
    const path = require("path")
    const fs = require("fs")

    var DataContext = WinJS.Class.define(function () {
        this._initObservable();
        
        const filePath = path.join(remote.app.getPath('userData'), "app-launch-flags.txt")
        const content = fs.existsSync(filePath) ? fs.readFileSync(filePath) : "";

        this.forceGPUAcceleration = content.length > 0;
    }, {})

    WinJS.Class.mix(DataContext, WinJS.Binding.mixin, WinJS.Binding.expandProperties({ forceGPUAcceleration: true }));
    var bindingSource = null;
    var PageConstructor = WinJS.UI.Pages.define("/pages/advanced.html", {
        // This function is called after the page control contents
        // have been loaded, controls have been activated, and
        // the resulting elements have been parented to the DOM.
        ready: function (element, options) {
            let context = new DataContext();
            WinJS.Binding.processAll(element, context, false);
            bindingSource = WinJS.Binding.as(context);

            let toggleSwitch = document.getElementById("forceAccelToggleSwitch").winControl;
            toggleSwitch.checked = context.forceGPUAcceleration;
            toggleSwitch.onchange = function (event) {
                bindingSource.forceGPUAcceleration = toggleSwitch.checked;

                const filePath = path.join(remote.app.getPath('userData'), "app-launch-flags.txt")
                fs.writeFileSync(filePath, bindingSource.forceGPUAcceleration ? "ignore-gpu-blocklist" : "");
            }
        },
    });

    WinJS.Namespace.define("ImmersiveControlPanel.Pages", {
        Advanced: PageConstructor
    });
})();