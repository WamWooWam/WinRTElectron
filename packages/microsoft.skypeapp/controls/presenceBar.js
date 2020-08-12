


(function (Skype) {
    "use strict";

    var presenceBar = Skype.UI.Control.define(function () {
        this.init();
    }, {
        updateWatchList: ["name", "formattedMoodInline", "isAvailable", "avatarUri"],
        contact: null,

        init: function () {
            log('PresenceBar init()');

            this.avatarEl = this.element.querySelector("header div.avatar");
            this.moodEl = this.element.querySelector("span.mood");
            this.presenceEl = this.element.querySelector("span.presence");

            this.update = this.update.bind(this);

            this.regEventListener(this.element, "click", this.onClicked.bind(this));

            var loginHandlerManager = Skype.Application.LoginHandlerManager;

            
            lib.myself ? this.onLogin() : this.regEventListener(loginHandlerManager.instance, loginHandlerManager.Events.LOGIN_FULL, this.onLogin.bind(this));
        },

        onClicked: function () {
            Skype.UI.MePanel.show();
        },

        onLogin: function () {
            this.contact = new Skype.Model.Contact(lib.getContactByIdentity(lib.myIdentity));
            this.contact.alive();
            this.regEventListener(this.contact, "propertychanged", this.handleLibPropChange.bind(this));
            this.update();
        },

        handleLibPropChange: function (e) {
            var propertyName = e.detail;

            if (this.updateWatchList.indexOf(propertyName) > -1) {
                this.update();
            }
        },

        update: function () {
            
            this.avatarEl.style.backgroundImage = 'url({0})'.format(this.contact.avatarUri);
            Skype.UI.Util.setClass(this.presenceEl, 'INVISIBLE', !this.contact.isAvailable);
            this.moodEl.innerHTML = this.contact.formattedMoodInline;
            this.element.setAttribute("aria-label", (this.contact.mood) ? "aria_hub_me_mood".translate(this.contact.isAvailable ? "aria_me_available".translate() : "aria_me_invisible".translate(), this.moodEl.textContent) : "aria_hub_me".translate(this.contact.isAvailable ? "aria_me_available".translate() : "aria_me_invisible".translate()));
            this.element.setAttribute("title", 
                            (this.contact.mood) ? this.moodEl.textContent : ""
                            );
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        PresenceBar: presenceBar
    });
})(Skype);