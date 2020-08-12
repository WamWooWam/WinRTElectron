

(function () {
    "use strict";

    Skype.UI.Page.define("/pages/policyWarning.html", "div.policyWarning.fragment", {

        useOneInstance: true,
        disposeOnHide: true,  
        _viewModel: null,

        

        
        onRender: function () {
            log("policyWarning.onRender()");
            this._viewModel = new Skype.ViewModel.PolicyWarningVM();

            this._viewModel.init();
            return WinJS.Binding.processAll(this.element, this._viewModel);
        },

        onShow: function (options) {
            var identity = (options && options.identity) ? options.identity : "";
            var blockedAction = (options && options.blockedAction) ? options.blockedAction : null;

            this._viewModel.update(identity, blockedAction);
        },
    });
})();