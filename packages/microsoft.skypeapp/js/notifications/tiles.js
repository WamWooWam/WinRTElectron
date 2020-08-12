

(function () {
    "use strict";

    function updateBadgeCount(identity) {
        
        var conversations = Windows.Storage.ApplicationData.current.localSettings.values["notificationsBadgeCache"];
        if (conversations === undefined) {
            conversations = [];
        } else {
            conversations = JSON.parse(conversations);
        }

        
        
        if (identity) {
            if (conversations.indexOf(identity) === -1) {
                conversations.push(identity);
            }
        } else {
            conversations = [];
        }

        Windows.Storage.ApplicationData.current.localSettings.values["notificationsBadgeCache"] = JSON.stringify(conversations);

        return conversations.length;
    };

    function hashTag(tag) {
        
        
        
        
        var hasher = Windows.Security.Cryptography.Core.HashAlgorithmProvider.openAlgorithm(Windows.Security.Cryptography.Core.HashAlgorithmNames.sha256).createHash();
        var tagBinary = Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(tag, Windows.Security.Cryptography.BinaryStringEncoding.utf16BE);
        hasher.append(tagBinary);
        var hash = Windows.Security.Cryptography.CryptographicBuffer.convertBinaryToString(Windows.Security.Cryptography.BinaryStringEncoding.utf16BE, hasher.getValueAndReset());

        return hash;
    }

    function updateBadge(number) {
        if (number === 0) {
            Windows.UI.Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().clear();
        } else {
            var badgeXml = Windows.UI.Notifications.BadgeUpdateManager.getTemplateContent(Windows.UI.Notifications.BadgeTemplateType.badgeNumber);
            var badgeAttributes = badgeXml.getElementsByTagName("badge");
            badgeAttributes[0].setAttribute("value", number);
            var badgeNotification = new Windows.UI.Notifications.BadgeNotification(badgeXml);
            Windows.UI.Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badgeNotification);
        }
    }
    
    function _setTile(tileNotification) {
        var result = true;
        try {
            Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
        } catch (e) {
            log("tileUpdater failed with exception {0} ({1})".format(e.number, e.message));
            result = false;
        }
        return result;
    }

    function updateTile(image, title, content, tag) {
        var isValidXmlTitle = _checkXmlValue(title);
        if (!isValidXmlTitle) {
            title = tag;
        }
        
        var maxContentLength = 2400;
        if (content.length > maxContentLength) {
            content = content.substr(0, maxContentLength);
        }

        
        var wideTemplate = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText04);
        var squareTemplate = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileSquareText02);

        var tileTextAttributes = wideTemplate.getElementsByTagName("text");
        tileTextAttributes[0].appendChild(wideTemplate.createTextNode(title));
        tileTextAttributes[1].appendChild(wideTemplate.createTextNode(content));
        var tileImageAttributes = wideTemplate.getElementsByTagName("image");
        tileImageAttributes[0].setAttribute("src", image);

        
        
        tileTextAttributes = squareTemplate.getElementsByTagName("text");
        tileTextAttributes[0].appendChild(squareTemplate.createTextNode(title));
        tileTextAttributes[1].appendChild(squareTemplate.createTextNode(content));

        var node = wideTemplate.importNode(squareTemplate.getElementsByTagName("binding").item(0), true);
        wideTemplate.getElementsByTagName("visual").item(0).appendChild(node);

        var tileNotification = new Windows.UI.Notifications.TileNotification(wideTemplate);
        tileNotification.tag = hashTag(tag);
        
        return _setTile(tileNotification);
    }
    
    function showOfflineTile() {
        
        updateBadge(0);

        
        var title = "logout_tile_title".translate();
        var content = "logout_tile_body".translate();
 
        
        var wideTemplate = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileWideText09);
        var squareTemplate = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileSquareText04);

        var tileTextAttributes = wideTemplate.getElementsByTagName("text");
        tileTextAttributes[0].appendChild(wideTemplate.createTextNode(title));
        tileTextAttributes[1].appendChild(wideTemplate.createTextNode(content));

        
        
        tileTextAttributes = squareTemplate.getElementsByTagName("text");
        tileTextAttributes[0].appendChild(squareTemplate.createTextNode(title));

        var node = wideTemplate.importNode(squareTemplate.getElementsByTagName("binding").item(0), true);
        wideTemplate.getElementsByTagName("visual").item(0).appendChild(node);

        var tileNotification = new Windows.UI.Notifications.TileNotification(wideTemplate);
        
        return _setTile(tileNotification);
    }

    function update(identity, name, content) {
        if (name === "") {
            name = "tiles.unknownCallerId".translate();
        }
        Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);

        var avatar = LibWrap.AvatarManager.offlineAvatarURI(identity);
        log("updateTile: image [{0}] title [{1}] tag [{2}]".format(avatar, name, identity));
        if (updateTile(avatar, name, content, identity)) {
            var count = updateBadgeCount(identity);
            log("updateBadge: count [{0}]".format(count));
            updateBadge(count);
        }
    }

    function clear() {
        
        if (Skype.Application.state.forcedOffline) {
            log("clear not allowed - can't remove I'm offline tile");
            return;
        }

        updateBadgeCount();

        try {
            Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication().clear();
            Windows.UI.Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().clear();
        } catch (e) {
            log("Skype.Notifications.Tiles.clear failed with exception {0} ({1})".format(e.number, e.message));
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

    WinJS.Namespace.define("Skype.Notifications.Tiles", {
        update: update,
        showOfflineTile: showOfflineTile,
        clear: clear
    });

})();
