//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Publish.Canvas", {
        screens: [], visuals: [], _parentMap: {}, _requirementsManager: null, currentScreen: null, controlManager: null, addControl: function(createInfo) {
                AppMagic.Publish.Canvas.controlManager === null && (AppMagic.Publish.Canvas.controlManager = new AppMagic.Controls.ControlManager(new AppMagic.Controls.RequirementsManager));
                var container = document.createElement("div");
                container.id = this.buildContainerName(createInfo.name);
                container.className = "canvasContentDiv";
                var template = createInfo.template;
                if (AppMagic.Utility.isScreen(template.className)) {
                    this.currentScreen === null && createInfo.index === 0 ? (this.currentScreen = createInfo.name, AppMagic.AuthoringTool.Runtime.activeScreenIndex(this.currentScreen)) : container.style.display = "none";
                    var publishedCanvas = document.getElementById("publishedCanvas");
                    publishedCanvas.appendChild(container);
                    this.screens[createInfo.name] = createInfo.name;
                    container = null
                }
                else {
                    container.style.position = "absolute";
                    var controlParent = document.getElementById(this.buildNestedCanvasName(createInfo.parent.name, createInfo.index));
                    controlParent || (controlParent = document.getElementById(this.buildContainerName(createInfo.parent.name)));
                    controlParent.appendChild(container)
                }
                return this._parentMap[createInfo.name] = typeof createInfo.parent == "undefined" ? createInfo.parent : createInfo.parent.name, this._requirementsManager = this._requirementsManager || new AppMagic.Controls.RequirementsManager, AppMagic.Publish.Canvas.controlManager.create(container, createInfo)
            }, getParentScreenName: function(controlName) {
                for (var screenName = controlName, parentName = this._parentMap[controlName]; parentName !== null && typeof parentName == "string"; )
                    screenName = parentName,
                    parentName = this._parentMap[parentName];
                return screenName
            }, buildContainerName: function(controlName) {
                return controlName + "container"
            }, buildNestedCanvasName: function(controlName, index) {
                return controlName + "nestedcanvas" + index.toString()
            }
    })
})();