

(function () {
    "use strict";

    function _showToast(image, title, content, identity) {
        
        var template = Skype.Notifications.Toasts.ExternalAPI.ToastNotificationManager.getTemplateContent(Windows.UI.Notifications.ToastTemplateType.toastImageAndText02);

        var textAttributes = template.getElementsByTagName("text");
        textAttributes[0].appendChild(template.createTextNode(title));
        textAttributes[1].appendChild(template.createTextNode(content));

        var imageAttributes = template.getElementsByTagName("image");
        imageAttributes[0].setAttribute("src", image);
        imageAttributes[0].setAttribute("alt", title);

        var rootNode = template.selectSingleNode("/toast");
        rootNode.setAttribute("launch", '{"type": "local-toast-im", "identity": "' + identity + '"}');

        var toast = new Skype.Notifications.Toasts.ExternalAPI.ToastNotification(template);
        Skype.Notifications.Toasts.ExternalAPI.ToastNotificationManager.createToastNotifier().show(toast);
    }

    function show(identity, name, content) {
        var avatar = Skype.Notifications.Toasts.ExternalAPI.OfflineAvatarURI(identity);

        log("_showToast: image [{0}] title [{1}]".format(avatar, name));

        var isValidXmlName = _checkXmlValue(name);
        if (!isValidXmlName) {
            name = identity;
        }

        try {
            _showToast(avatar, name, content, identity);
        } catch (e) {
            log("Skype.Notifications.Toasts._showToast failed with exception {0} ({1})".format(e.number, e.message));
        }
    }

    function _checkXmlValue(value) {
        var xml = new Windows.Data.Xml.Dom.XmlDocument();
        xml.loadXml("<xmlNode></xmlNode>");
        var isValid = true;

        try {
            xml.selectSingleNode("//xmlNode").innerText = value;
        } catch (e) {
            isValid = false;
        }

        return isValid;
    }

    WinJS.Namespace.define("Skype.Notifications.Toasts", {
        show: show,

        ExternalAPI: {
            ToastNotificationManager: Windows.UI.Notifications.ToastNotificationManager,
            ToastNotification: Windows.UI.Notifications.ToastNotification,
            OfflineAvatarURI: LibWrap.AvatarManager.offlineAvatarURI
        }
    });

})();
