

(function () {
    "use strict";

    Skype.UI.Page.define("/pages/logout.html", "div.logout.fragment", {
        useOneInstance: true,
        disposeOnHide: true,

        vm: null,

        onShow: function (options) {
            var startLogout = (options && options.state == "start logout");

            this.vm = new Skype.ViewModel.LogoutPageVM(startLogout);

            WinJS.Binding.processAll(this.element, this.vm);
        }
    });
})();