

(function () {
    'use strict';

    WinJS.Namespace.define("Skype.UI.Help", {
        helpPanelElement: null,
        learnHowElement: null,
        supportElement: null,
        communityElement: null,

        run: function () {
            
            var that = this,
                pageContainer = document.querySelector('body > div.page'),
                helpPanelContainer = document.getElementById('helpPanelContainer');
            if (!helpPanelContainer) {
                helpPanelContainer = document.createElement('div');
                helpPanelContainer.id = 'helpPanelContainer';
                pageContainer.appendChild(helpPanelContainer);

                this.afterShowHandler = this.afterShowHandler.bind(this);

                WinJS.UI.Fragments.render("/controls/help.html", helpPanelContainer).then(function (container) {
                    var element = container.querySelector('div.help.panel');
                    that.helpPanelElement = element;
                    
                    WinJS.UI.processAll(container);
                    WinJS.Binding.processAll(container, Skype.UI.Help._getData());
                    WinJS.Resources.processAll(element);

                    element.winControl.addEventListener('aftershow', that.afterShowHandler);

                    element.addEventListener("keypress", that.handleBackspace.bind(that));

                    that.learnHowElement = element.querySelector("button.learnHow");
                    that.supportElement = element.querySelector("button.support");
                    that.communityElement = element.querySelector("button.community");

                    that._onClick = that._onClick.bind(that);
                    that.learnHowElement.addEventListener('click', that._onClick);
                    that.supportElement.addEventListener('click', that._onClick);
                    that.communityElement.addEventListener('click', that._onClick);


                    
                    element.winControl.show();
                });
            } else {
                
                this.helpPanelElement.winControl.show();
            }
        },

        _getData: function () {
            var suportLink = "https://www.skype.com/go/support?" + Skype.UI.Util.getTrackingParam("go-support");
            var communityLink = "https://www.skype.com/go/community?" + Skype.UI.Util.getTrackingParam("go-community");
            var learnHowLink = "https://www.skype.com/go/win8support?" + Skype.UI.Util.getTrackingParam("win8support");
            return {
                help_support_text: "help_support".translate(suportLink),
                help_community_text: "help_community".translate(communityLink),
                help_learn_how_text: "help_learn_how_text".translate(learnHowLink)
            };
        },

        _onClick: function (e) {
            if (e.currentTarget) {
                var element = e.currentTarget.querySelector("a");
                if (element && element.href) {
                    Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri(element.href));
                }
            }
        },

        afterShowHandler: function () {
            this.learnHowElement.focus();
        },

        handleBackspace: function (evt) {
            if (evt.key === WinJS.Utilities.Key.backspace) {
                evt.preventDefault();
                WinJS.UI.SettingsFlyout.show();
            }
        }
    });

})();
