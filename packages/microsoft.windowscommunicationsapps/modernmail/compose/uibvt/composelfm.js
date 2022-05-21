
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global WinJS, Tx, ComposePom, BVT, Mail, Compose */

// Actions available from Compose
Jx.delayDefine(self, "ComposeLfm", function () {
    //Constructor
    ComposeLfm = function () {
        this.objectModel = new ComposePom();
    };
    var proto = ComposeLfm.prototype;

    // Sends the current mail.
    proto.sendMail = function () {
        return new WinJS.Promise(function (complete) {
            BVT.marks.once("Animator_animateEnterPage,StopTM,Mail", function () {
                Tx.log("Mail sent.");
                complete();
            });

            this.objectModel.send.click();
        }.bind(this));
    };

    // Saves the draft
    // Param updateMessageList: true if test case expects saving to cause an update in the messagelist, false otherwise
    proto.save = function (updateMessageList) {
        var messageListReady = false,
            draftSaved = false;

        return new WinJS.Promise(function (complete) {
            // If the toline, subject or preview text are updated, we should wait for the message list to update in addition to saving the draft
            if (updateMessageList) {
                BVT.marks.once("MessageListItem_finishUpdates,StopTM,Mail", function () {
                    Tx.log("Message list updated on save.");
                    messageListReady = true;
                    if (draftSaved) {
                        complete();
                    }
                });
            }

            BVT.marks.once("Compose.saveDraft,StopTA,Compose", function () {
                Tx.log("Draft saved.");
                draftSaved = true;

                // If we don't need the messagelist to update, complete the promise. If we do, only complete if the messagelist update event has been fired.
                if (!updateMessageList || (updateMessageList && messageListReady)) {
                    complete();
                }
            });

            // Start save operation
            TestApplication.ToggleAppBar();
            this.objectModel.save.click();
            TestApplication.ToggleAppBar();
        }.bind(this));
    };

    // Deletes the current mail.
    proto.discardDraft = function () {

        // Wait for draft to be dismissed
        return new WinJS.Promise(function (complete) {
            this.save(false).done(function () {
                BVT.marks.once("StandardReadingPane._onNewSelectedMessageSynchronous,StopTA,Mail,StandardReadingPane", function () {
                    Tx.log("Draft deleted.");
                    complete();
                });

                // Test hook: bypass the confirmation dialog by tricking Compose into thinking it's clean
                Compose.ComposeImpl.getComposeImpl(Mail.Utilities.ComposeHelper._builder._currentComposeBuilder._getComponentCache()).isDirty = function () {
                    return false;
                }
                this.objectModel.deleteButton.click();
            }.bind(this));
        }.bind(this));
    };

    // Get or set the subject of the open email.
    proto.subject = function (subject) {
        if (subject !== undefined) {
            this.objectModel.subject.value = subject;
        } else {
            return this.objectModel.subject.value;
        }
    };

    // Get or set the to line
    proto.to = function (recipient) {
        if (recipient !== undefined) {
            return this.objectModel.toLine.addRecipient(recipient);
        } else {
            return this.objectModel.toLine.recipients();
        }
    };
});