
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global WinJS, Jx, Tx, BVT, Mail, MailTest */

// Actions available from ViewFlyout, PeopleFlyout, FolderFlyout
Jx.delayDefine(MailTest, ["PeopleFlyout", "FolderFlyout"], function () {
    "use strict";

    // Constructor for ViewFlyout [Abstract class]
    var ViewFlyout = MailTest.ViewFlyout = function (flyout) {
        this._flyout = flyout;
    };

    ViewFlyout.prototype = {

        // Gets if the frame is visible
        get isVisible() {
            return BVT.isVisible(this._flyout);
        },

        // Gets the primary header
        get header() {
            var element = $(".header", this._flyout)[0];
            return {
                element: element,

                get text() {
                    return element ? element.innerText : "";
                },

                get isVisible() {
                    return BVT.isVisible(element);
                },
            };
        },

        // Dismisses the flyout
        // Waits on the flyout to be dismissed
        dismiss: function () {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once("Mail.NavPaneFlyout.hide,StopTM,Mail", complete);
                $(window).trigger("keydown", { keyCode: Jx.KeyCode.escape });
            });
        }
    }

    // Returns PeopleFlyout
    var PeopleFlyout = MailTest.PeopleFlyout = function () {
        var element = $(".peopleFlyout.viewFlyout")[0];
        ViewFlyout.call(this, element);
    };
    Jx.inherit(PeopleFlyout, ViewFlyout);

    // Gets the secondary header
    Object.defineProperty(PeopleFlyout.prototype, "secondaryHeader", {
        get: function () {
            var element = $(".header.secondary", this._flyout)[0];
            return {
                element: element,

                get text() {
                    return element ? element.innerText : "";
                },

                get isVisible() {
                    return BVT.isVisible(element);
                },
            };
        }
    });

    // Gets the picker
    Object.defineProperty(PeopleFlyout.prototype, "picker", {
        get: function () {
            var element = $(".picker", this._flyout)[0];
            return {
                element: element,

                get text() {
                    return $(".text", element)[0].innerText;
                },

                get title() {
                    return element.getAttribute("title");
                },

                get isVisible() {
                    return BVT.isVisible(element)
                }
            };
        }
    });

    // Gets the favorites list
    Object.defineProperty(PeopleFlyout.prototype, "favoriteList", {
        get: function () {
            return new PersonItems(true);
        }
    });

    // Gets the frequent list
    Object.defineProperty(PeopleFlyout.prototype, "frequentList", {
        get: function () {
            return new PersonItems(false);
        }
    });

    // Returns FolderFlyout
    var FolderFlyout = MailTest.FolderFlyout = function () {
        var element = $(".folderFlyout.viewFlyout")[0];
        ViewFlyout.call(this, element);
    };
    Jx.inherit(FolderFlyout, ViewFlyout);

    // Gets the folder list
    Object.defineProperty(PeopleFlyout.prototype, "folderList", {
        get: function () {
            return new FolderItems();
        }
    });

    // Constructor for FolderOrPersonItem [Abstract class]
    var FolderOrPersonItems = MailTest.FolderOrPersonItems = function (list) {
        this._list = list;
    };

    FolderOrPersonItems.prototype = {

        get list() {
            return this._list;
        },

        // Gets the item with the specified name
        // Of type FolderOrPersonItem
        item: function (itemName) {
            var count = this._list.length;
            for (var i = 0; i < count; ++i) {
                var item = this._list[i];
                if (item.name === itemName) {
                    return item;
                }
            }
            return null;
        },
    }

    // Returns the PersonItems
    var PersonItems = function (isPinned) {
        var list = [];
        var items = $(".person", this._flyout);
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            var star = $(".star", item)[0];
            if (star && star.classList.contains("pinned") === isPinned) {
                list.push(new FolderOrPersonItem(item));
            }
        }
        FolderOrPersonItems.call(this, list);
    };
    Jx.inherit(PersonItems, FolderOrPersonItems);

    // Returns the FolderItems
    var FolderItems = function () {
        var list = [];
        var items = $(".folder", this._flyout);
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            list.push(new FolderOrPersonItem(item));
        }
        FolderOrPersonItems.call(this, list);
    };
    Jx.inherit(FolderItems, FolderOrPersonItems);

    // Returns the FolderOrPersonItem
    var FolderOrPersonItem = function (element) {
        this._element = element;
        this._content = $(".content", this._element)[0];
        this._star = $(".star", this._element)[0];
    };

    FolderOrPersonItem.prototype = {
        // Gets the element
        get element() {
            return this._element;
        },

        // Gets the content
        get content() {
            return this._content;
        },

        // Gets the star
        get star() {
            return this._star;
        },

        // Gets the unread count
        // "zero" implies there is no count displayed on the UI
        get unreadCount() {
            var count = $(".count", this._content)[0];
            var text = count ? count.innerText : "";
            return Jx.isNonEmptyString(text) ? text : "zero";
        },

        // Gets the title
        get title() {
            return this._content.getAttribute("title");
        },

        // Gets the name
        get name() {
            return $(".name", this._content)[0].innerText;
        },

        // Gets the aria label
        get ariaLabel() {
            return this._content.getAttribute("aria-label");
        },

        // Gets if the item is visible
        get isVisible() {
            return BVT.isVisible(this._element);
        },

        // Gets if the item is pinned
        get isPinned() {
            return this._star && this._star.classList.contains("pinned");
        },

        // Pins the item like Person or Folder
        pin: function () {
            var that = this;
            return new WinJS.Promise(function (complete) {
                if (that._star && !that.isPinned) {
                    BVT.marks.once("Mail.ViewFlyout.ViewPinner_Pin,StopTA,Mail", complete);
                    that._star.click();
                }
            });
        },

        // Unpins the item like Person or Folder
        unpin: function () {
            var that = this;
            return new WinJS.Promise(function (complete) {
                if (that._star && that.isPinned) {
                    BVT.marks.once("Mail.ViewFlyout.ViewPinner_Unpin,StopTA,Mail", complete);
                    that._star.click();
                }
            });
        },

        // Switches to the view
        // Clicks on the element, and waits for the etw event
        switchToView: function (waitForETW) {
            var item = this._content;
            return new WinJS.Promise(function (complete) {
                if (waitForETW) {
                    BVT.marks.once("MailHeaderRenderer.renderItem,StopTA,MailHeaderRenderer", complete);
                }
                // TODO: Also wait on "Mail.NavPaneFlyout.hide,StopTM,Mail"
                item.click();
            });
        },
    };
});
