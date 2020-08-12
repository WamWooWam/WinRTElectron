

(function () {
    "use strict";

    Skype.UI.Page.define("/pages/upgrade.html", "div.fragment.upgrade", {
        
        useOneInstance: true,
        disposeOnHide: true,
        
        mandatoryEl: null,
        btnInstall: null,
        
        storeURI: "ms-windows-store:updates",

        onReady: function () {
            
            this.mandatoryEl = this.element.querySelector('div.inner.mandatory');
            this.btnInstall = this.mandatoryEl.querySelector('a.btnInstall');
            this.btnInstall.href = this.storeURI;

            this.onInstall = this.onInstall.bind(this);
            this.regEventListener(this.btnInstall, "click", this.onInstall);
        },

        onShow: function () {
            Skype.Statistics.sendStats(Skype.Statistics.event.mandatoryUpgradeDialog);
        },

        
        onInstall: function () {
            Skype.Statistics.sendStats(Skype.Statistics.event.mandatoryUpgradeDialog_Install);
        },
    });
})();

