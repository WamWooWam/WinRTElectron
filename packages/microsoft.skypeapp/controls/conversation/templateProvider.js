

(function () {
    "use strict";

    var templateProvider = WinJS.Class.define(
        function constructor() {
        }, {
            templates: null,
            TEMPLATE_NAMES: ["notificationTemplate", "authMessageTemplate", "authMessageFollowTemplate", "chatMessageFollowTemplate", "chatMessageTemplate",
                                "chatMessageUnsupportedTemplate", "chatMessageNotificationTemplate", "chatMessageBlockTemplate", "initialAuthRequestMessageTemplate",
                                "initialAuthRequestMessageFollowTemplate", "rateCallQualityTemplate", "fileTransferTemplate", "fileTransferFollowTemplate", "dateTemplate",
                                "videoMessageTemplate", "videoMessageFollowTemplate"],

            loadAsync: function () {
                if (this.templates) {
                    return WinJS.Promise.as(this.templates);
                }
                
                return WinJS.UI.Fragments.render("/controls/conversation/chatLogTemplates.html")
                     .then(function (element) {
                         return WinJS.Resources.processAll(element);
                     })
                     .then(function (element) {
                         return WinJS.UI.processAll(element);
                     })
                     .then(this._onReady.bind(this));
            },

            _onReady: function (element) {
                this.templates = {};

                this.TEMPLATE_NAMES.forEach(function (template) {
                    this.templates[template] = element.querySelector("div." + template);
                }.bind(this));

                return this.templates;
            },
        }, {
            instance: {
                get: function () {
                    if (!instance) {
                        instance = new Skype.UI.Conversation.TemplateProvider();
                    }
                    return instance;
                }
            },

        });

    var instance = null;

    WinJS.Namespace.define("Skype.UI.Conversation", {
        TemplateProvider: WinJS.Class.mix(templateProvider, Skype.Class.disposableMixin)
    });

}());