
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global WinJS, Jx, Tx, BVT, Mail, MailTest */

// Actions available from PowerPane
Jx.delayDefine(MailTest, "PowerPane", function () {
    "use strict";

    // Constructor for PowerPane
    var PowerPane = MailTest.PowerPane = function () {
        this._pane = $(".mailNavPane")[0];
    };

    PowerPane.prototype = {

        // Gets if the Power pane is visible
        get isVisible() {
            return BVT.isVisible(this._pane);
        },

        // Gets if the Power pane is in skinny mode
        get isSkinnyMode() {
            return !BVT.isVisible(this.currentAccount.element);
        },

        // Gets the current account
        get currentAccount() {
            var item = $("#mailNavPaneHeader", this._pane)[0];
            return {
                // Gets the element
                element: item,

                // Gets the name of the current account
                get name() {
                    return item.innerText;
                },

                // Gets if the current account is visible
                get isVisible() {
                    return BVT.isVisible(item);
                },
            };
        },

        // Gets the inbox
        get inbox() {
            return new AccountItem(this._pane, "inbox");
        },

        // Gets the Newsletter
        get newsletter() {
            return new AccountItem(this._pane, "newsletter");
        },

        // Gets the Favorites
        get favorites() {
            return new AccountItem(this._pane, "favorites");
        },

        // Gets the Favorites More
        get favoritesMore() {
            return new AccountItem(this._pane, "morePeople");
        },

        // Gets the Favorites List
        get favoritesGroup() {
            return new ItemList(this._pane, "favorites", "person");
        },

        // Gets the Social
        get social() {
            return new AccountItem(this._pane, "social");
        },

        // Gets the Flagged
        get flagged() {
            return new AccountItem(this._pane, "flagged");
        },

        // Gets the Folders
        get folders() {
            return new AccountItem(this._pane, "folders");
        },

        // Gets the Folders List
        get foldersGroup() {
            return new ItemList(this._pane, "folders", "folder");
        },

        // Gets the Favorites Chevron
        get favoritesChevron() {
            var _item = $(".favorites .chevron", this._pane)[0];

            return {
                element: _item,
                name: _item.innerText,
                title: _item.getAttribute("title"),
                isVisible: BVT.isVisible(_item),

                // Gets if the favorites group can be expanded based on the text of the chevron
                get canExpand() {
                    var str = _item.innerText;
                    return str === "\uE09D" ? true :
                        str === "\uE09C" ? false : null;
                },

                // Clicks the chevron
                click: function () {
                    return new WinJS.Promise(function (complete) {
                        BVT.marks.once("Mail.ViewItems.Favorites._runAnimation,StopTM,Mail", complete);
                        _item.click();
                    });
                }
            };
        }
    }

    // Returns PowerPaneItem
    var PowerPaneItem = function (element) {
        this._element = element;
    };

    PowerPaneItem.prototype = {
        // Gets the Element
        get element() {
            return this._element;
        },

        // Gets the unread count
        // "zero" implies there is no count displayed on the UI
        get unreadCount() {
            var count = $(".item .count", this._element)[0];
            var text = count ? count.innerText : "";
            return Jx.isNonEmptyString(text) ? text : "zero";
        },

        // Gets the aria label
        get ariaLabel() {
            return this._element.getAttribute("aria-label");
        },

        // Gets if the item is selected
        get isSelected() {
            return this._element.classList.contains("selected");
        },

        // Gets if the item is visible
        get isVisible() {
            return BVT.isVisible(this._element);
        },

        // Switches to the view
        // Clicks on the element, and waits for the etw event
        switchToView: function (waitForETW) {
            var item = this._element;
            return new WinJS.Promise(function (complete) {
                if (waitForETW) {
                    BVT.marks.once("MailHeaderRenderer.renderItem,StopTA,MailHeaderRenderer", complete);
                }
                item.click();
            });
        },

        // Opens the flyout
        // Clicks on the element, and waits for the etw event
        openFlyout: function () {
            var item = this._element;
            return new WinJS.Promise(function (complete) {
                BVT.marks.once("Mail.NavPaneFlyout.show,StopTM,Mail", complete);
                item.click();
            });
        },
    };

    // Returns AccountItem
    var AccountItem = function (pane, className) {
        var element = $("." + className + ".item", pane)[0];
        PowerPaneItem.call(this, element);
    };
    Jx.inherit(AccountItem, PowerPaneItem);

    // Returns ItemList
    // The list of folder or person item in the groups
    var ItemList = function (pane, classNameParent, classNameListItem) {

        this._item = null;
        this._result = [];

        var groups = $(".group", pane);
        var k = groups.length;

        for (var i = 0; i < k; ++i) {
            var group = groups[i];
            var head = $("." + classNameParent, group)[0];
            if (head) {
                this._item = $(".children", group)[0];
                break;
            }
        }

        var items = $("." + classNameListItem + ".item", this._item);
        var len = items.length;

        for (var i = 0; i < len; ++i) {
            this._result.push(new FolderOrPersonItem(items[i]));
        }
    };

    ItemList.prototype = {

        // Gets the element
        get element() {
            return this._item;
        },

        // Gets if the element is visible
        get isVisible() {
            return BVT.isVisible(this._item);
        },

        // Gets the list of items like folder or person
        get list() {
            return this._result;
        },

        // Gets the item with the specified name
        // Of type FolderOrPersonItem
        item: function (itemName) {
            var count = this._result.length;
            for (var i = 0; i < count; ++i) {
                var item = this._result[i];
                if (item.name === itemName) {
                    return item;
                }
            }
            return null;
        },
    };

    // Returns FolderOrPersonItem
    var FolderOrPersonItem = function (element) {
        PowerPaneItem.call(this, element);
    };
    Jx.inherit(FolderOrPersonItem, PowerPaneItem);

    // Gets the name
    Object.defineProperty(FolderOrPersonItem.prototype, "name", {
        get: function () {
            return $(".item .name", this._element)[0].innerText;
        }
    });
});
