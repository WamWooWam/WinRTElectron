
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global WinJS, Jx, Tx, BVT, Mail, MailTest */

// Actions available from MessageListFrame
Jx.delayDefine(MailTest, "MessageListFrame", function () {
    "use strict";

    // Constructor for MessageListFrame
    var MessageListFrame = MailTest.MessageListFrame = function () {
        this._frame = $("#mailFrameMessageList")[0];
    };

    MessageListFrame.prototype = {

        // Gets if the frame is visible
        get isVisible() {
            return BVT.isVisible(this._frame);
        },

        // Gets the account
        get account() {
            var element = $("#mailMessageListAccountName", this._frame)[0];
            return {
                // Gets the folder
                element: element,

                // Gets the folder name
                get name() {
                    return element.innerText;
                },

                // Gets if the folder is visible
                get isVisible() {
                    return BVT.isVisible(element);
                },
            };
        },

        // Gets the Folder
        get folder() {
            var element = $("#mailMessageListFolderName", this._frame)[0];
            return {
                // Gets the folder
                element: element,

                // Gets the folder name
                get name() {
                    return element.innerText;
                },

                // Gets if the folder is visible
                get isVisible() {
                    return BVT.isVisible(element);
                },
            };
        },

        // Gets the message list
        get messageList() {
            return new MessageList(this._frame);
        },
    }

    // Returns MessageList
    var MessageList = function (element) {
        this._element = element;
        this._messages = null;

        var messages = [];
        var messagesEl = $(".win-container", this._element);

        // We want to skip the last one, as it is not the message item
        var count = messagesEl.length - 1;
        for (var i = 0; i < count; ++i) {
            var messageEl = messagesEl[i];
            messages.push(new MessageItem(messageEl));
        }
    };

    MessageList.prototype = {
        // Gets the Element
        get element() {
            return this._element;
        },

        get list() {
            return this._messages
        },

        // Gets the item matching the given predicate
        // Of type FolderOrPersonItem
        item: function (pred) {
            var results = [];
            var count = this._messages.length;
            for (var i = 0; i < count; ++i) {
                var message = this._messages[i];
                if (pred(message)) {
                    results.push(message);
                }
            }
            return results;
        },
    };

    // Returns MessageItem
    var MessageItem = function (element) {
        this._element = element;
    };

    MessageItem.prototype = {
        // Gets the Element
        get element() {
            return this._element;
        },

        // Gets if the message is visible
        get isVisible() {
            return BVT.isVisible(this._element)
        },

        // Gets the From
        get from() {
            return getText(".mailMessageListFrom", this._element);
        },

        // Gets the Folder name
        get folder() {
            return getText(".mailMessageListFolder", this._element);
        },

        // Get the preview text
        get preview() {
            return getText(".mailMessageListPreview", this._element);
        },

        // Gets the unread count
        get unreadCount() {
            return getText(".mailMessageListGlyph.glyphCount", this._element);
        },

        // Gets if the message is selected
        get isSelected() {
            return this._element.classList.contains("win-selected");
        },

        get date() {
            return getText(".mailMessageListDate", this._element);
        },

        get subject() {
            return getText(".mailMessageListSubject", this._element);
        }
    };

    var getText = function (selector, parent) {
        var results = parent ? $(selector, parent) : $(selector);
        return results.length > 0 ? results[0].innerText : "";
    }
});