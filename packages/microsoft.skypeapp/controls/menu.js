

(function () {
    "use strict";

    var MENU_CONTAINER_ID = "skypeMenuContainer",
        menuContainer = null;

    var menu = MvvmJS.Class.derive(WinJS.UI.Menu, function menu_constructor(element) {
        this.base(element);
    }, {
        _onDispose: function () {
            WinJS.UI.Menu.prototype.dispose.call(this);
            menuContainer.removeChild(this.element);
        },

        setAttribute: function (attribute, value) {
            this.element && this.element.setAttribute(attribute, value);
        }
    }, {}, {

        create: function (className) {
            
            
            
            
            
            
            
            
            
            
            

            menuContainer = menuContainer || document.querySelector("#" + MENU_CONTAINER_ID);

            var menuEl = document.createElement("div");
            menuContainer.appendChild(menuEl);

            if (className) {
                WinJS.Utilities.addClass(menuEl, className);
            }

            return new Skype.UI.Menu(menuEl);
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        Menu: menu
    });
})();