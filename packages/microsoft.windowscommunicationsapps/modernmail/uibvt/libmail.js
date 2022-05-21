
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $, WinJS, Jx, self, MailTest, ComposeLfm, BVT, Tx */

Jx.delayDefine(self, "MailTest", function () {

    // Finds an ancestor of the specified element matching
    // the specified predicate.
    var getAncestor = function (elem, predicate) {
        var candidate = elem.parentNode;
        while (candidate && !predicate(candidate)) {
            candidate = candidate.parentNode;
        }
        return candidate;
    };

    // Actions available from Mail
    MailTest = {

        // Reference to ComposeLib
        get composeLfm() {
            return this._compose = (this._compose || new ComposeLfm());
        },

        // Reference to PowerPane
        get powerPane() {
            return this._powerPane = (this._powerPane || new MailTest.PowerPane());
        },

        // Reference to MessageListFrame
        get messageListFrame() {
            return this._messageListFrame = (this._messageListFrame || new MailTest.MessageListFrame());
        },

        // Deletes the email with the specified subject.
        deleteEmail: function (subject) {
            return new WinJS.Promise(function (complete) {
                MailTest.getMailItemBySubject(subject)
                .then(function (item) {
                    // Click the item to give it focus.
                    item.click();

                    // Wait for event signifying the item was removed from the message list.
                    BVT.marks.once("MessageList_itemRemoved,StopTM,Mail", function () {
                        Tx.log("Message deleted.");
                        complete();
                    });

                    // Click the delete button (trash icon)
                    $(".mailReadingPaneDeleteButton")[0].click();
                });
            });
        },

        // Select a folder from the folder list.
        selectFolder: function (folderName) {
            return new WinJS.Promise(function (complete) {
                $(".folderName").each(function () {
                    if (this.innerText === folderName) {

                        // Wait for event signifying the folder is selected.
                        BVT.marks.once("AppState.setSelectedMessages,StopTM,Mail", function () {
                            Tx.log("Folder selected.");
                            complete();
                        });

                        // Click the folder
                        this.click();
                    }
                });
            });
        },

        // Opens the New Email window.
        createMessage: function () {
            return new WinJS.Promise(function (complete) {
                var messageListReady = false;
                var canvasReady = false;

                // Wait for the event signifying the canvas is ready.
                BVT.marks.once("ComposeUtil.setInitialFocus,StopTM,Mail", function () {
                    Tx.log("Compose is onscreen.");
                    canvasReady = true;
                    // Only complete if both MessageList and Canvas are ready
                    if (messageListReady) {
                        complete();
                    }
                });

                // Wait for the event signifying the messageList is ready.
                BVT.marks.once("WinJS.UI.ListView:mailMessageListCollection:aria work,StopTM", function () {
                    Tx.log("Draft list item created");
                    messageListReady = true;
                    // Only complete if both MessageList and Canvas are ready
                    if (canvasReady) {
                        complete();
                    }
                });

                $(".mailReadingPaneComposeButton").click();
            });
        },

        // Returns a DOM element from the message list that has the specified
        // subject.
        getMailItemBySubject: function (subject) {
            var subjectDivs = $(".mailMessageListSubject");
            for (var i = 0; i < subjectDivs.length; i++) {
                if (subjectDivs[i].innerText === subject) {

                    // Get the ancestor that has the required class.
                    var parent = getAncestor(subjectDivs[i], function (candidate) { return candidate.classList.contains("win-item"); });

                    if (!parent) {
                        // Error in the case that we find a matching subject, but can't find
                        // its parent win-item container.
                        return WinJS.Promise.wrapError("Found subject, but couldn't find parent win-item for subject " + subject);
                    }
                    return WinJS.Promise.as(parent);
                }
            }

            // Didn't find message with the specified subject.
            return WinJS.Promise.wrapError("Couldn't find mail message with subject '" + subject + "'.");
        },

        // True if the message is selected, false otherwise
        isMailSelected: function (mailItem) {
            return mailItem.parentElement.classList.contains("win-selected");
        },

        // Resizes the Mail app such that the power pane will be in skinny mode
        switchToSkinnyMode: function () {
            // TODO: implement this method
        },

        // Resizes the Mail app such that the power pane will be in full mode
        switchToFullMode: function () {
            // TODO: implement this method
        },

        // Opens the sweep flyout
        openSweepFlyout: function (verify) {
            return new WinJS.Promise(function (complete) {
                // Wait for event signifying the sweep flyout was created.
                BVT.marks.once("WinJS.UI.Flyout:mailSweepFlyout:show,StopTM", function () {
                    Tx.log("Sweep flyout should be visible");
                    if (verify) {
                        verify();
                    }

                    complete();
                });

                $("#sweep")[0].click();
            });
        },

        // Dismisses a generic windows flyout by clicking on win-flyoutmenuclickeater
        dismissFlyout: function (flyoutId, verify) {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once("WinJS.UI.Flyout:" + flyoutId + ":hide,StopTM", function () {
                    Tx.log("Flyout should be dismissed");
                    if (verify) {
                        verify();
                    }

                    complete();
                });

                $(".win-flyoutmenuclickeater").trigger("MSPointerDown", { button: 0 });
                $(".win-flyoutmenuclickeater").trigger("click");
            });
        },

        // Opens the Move flyout
        openMoveFlyout: function (verify) {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once("WinJS.UI.Flyout:moveFlyout:show,StopTM", function () {
                    Tx.log("Move flyout created.");
                    if (verify) {
                        verify();
                    }

                    complete();
                });

                $("#move")[0].click();
            });
        },

        // Opens the move all from dialog
        openMoveAllFromDialog: function (verify) {
            return this.openMoveFlyout()
            .then(function () {
                return new WinJS.Promise(function (complete) {
                    BVT.marks.once("MoveAllDialog_showMoveAllDialog,StopTM,Mail", function () {
                        Tx.log("Move all from flyout created");
                        if (verify) {
                            verify();
                        }

                        complete();
                    });

                    $("#moveAllContainer")[0].click();
                });
            });
        }
    };
});

