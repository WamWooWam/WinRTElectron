

(function () {
    "use strict";

    WinJS.Namespace.define("Skype.UI.About", {
        aboutPanelElement: null,

        run: function () {
            
            var that = this,
                pageContainer = document.querySelector("body > div.page"),
                aboutPanelContainer = document.getElementById("aboutPanelContainer");

            if (!aboutPanelContainer) {
                aboutPanelContainer = document.createElement("div");
                aboutPanelContainer.id = "aboutPanelContainer";
                pageContainer.appendChild(aboutPanelContainer);

                WinJS.UI.Fragments.render("/controls/about.html", aboutPanelContainer).then(function (container) {
                    var element = container.querySelector("div.about.panel");
                    that.aboutPanelElement = element;
                    
                    WinJS.UI.processAll(container);
                    WinJS.Binding.processAll(container, Skype.UI.About._getData());
                    WinJS.Resources.processAll(element);

                    element.addEventListener("keypress", that.handleBackspace.bind(that));

                    
                    element.winControl.show();
                });
            } else {
                
                this.aboutPanelElement && this.aboutPanelElement.winControl && this.aboutPanelElement.winControl.show();
            }
        },

        _data: null,

        _getData: function () {
            if (!Skype.UI.About._data) {
                Skype.UI.About._data = {
                    version: WinJS.Resources.getString("about_version").value.format(Skype.Version.uiVersion())
                };
            }
            return Skype.UI.About._data;
        },

        handleBackspace: function (evt) {
            if (evt.keyCode === WinJS.Utilities.Key.backspace) {
                evt.preventDefault();
                WinJS.UI.SettingsFlyout.show();
            }
        }

    });

})();
