
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global setTimeout, BVT */
/// <reference
(function () {
    // testCleanup function that cleans up after running a test. Not to be confused with tc.cleanup
    var testCleanup = function (tc) {
        tc.start();
    };

    // Options for BVT.Test
    var options = {
        powerPane: {
            feature: "PowerPane",
            owner: "JerryDeR",
        },
        powerPaneAlt: {
            feature: "PowerPane",
            owner: "AshisB",
            // TODO: Blue: 313819 Make power pane and people view Tx BVTs robust to window size [full/skinny] and screen resolution [scrolling]. Enable them to run as a part of cits
            disabled: true,
        },
        peopleView: {
            feature: "PeopleView",
            owner: "AshisB",
            // TODO: Blue: 313819 Make power pane and people view Tx BVTs robust to window size [full/skinny] and screen resolution [scrolling]. Enable them to run as a part of cits
            disabled: true,
        },
    };

    // Verifies the PowerPane UI in full mode
    BVT.Test("VerifyPowerPaneUI_FullMode", options.powerPaneAlt, function (tc) {
        tc.stop();

        verifyPowerPaneUI(tc, /*verifyFullMode*/ true)
            .done(function () {
                testCleanup(tc);
            },
            function (failure) {
                tc.error(failure);
                testCleanup(tc);
            });
    });

    // Verifies the PowerPane UI in skinny mode
    BVT.Test("VerifyPowerPaneUI_SkinnyMode", options.powerPaneAlt, function (tc) {
        tc.stop();

        MailTest.switchToSkinnyMode();
        return verifyPowerPaneUI(tc, /*verifyFullMode*/ false);
    });

    // Verifies that the favorites group expands and collapses when clicked on the chevron
    BVT.Test("VerifyPowerPaneUI_FavoritesChevron_ExpandCollapse", options.powerPaneAlt, function (tc) {
        tc.stop();

        var verify = function (isExpanded) {
            var pane = MailTest.powerPane;

            // Verify Chevron
            var favoritesChevron = pane.favoritesChevron;
            tc.areEqual(favoritesChevron.canExpand, !isExpanded, "Verify: favorites chevron state");

            // Verify Favorites list is present
            var favoritesGroup = pane.favoritesGroup;
            tc.isNotNullOrUndefined(favoritesGroup.element, "Verify: favorites list is present");
            tc.areEqual(favoritesGroup.isVisible, isExpanded, "Verify: favorites list is visible");

            // Each element in Favorites list
            var favoritesList = favoritesGroup.list;
            var len = favoritesList.length;
            for (var i = 0; i < len; ++i) {
                var actFavorite = favoritesList[i];
                tc.areEqual(actFavorite.isVisible, isExpanded, "Verify: favorites list - person is visible");
            }
        };

        // Power Pane
        var pane = MailTest.powerPane;
        tc.areEqual(pane.isVisible, true, "Verify: power pane is visible");
        tc.areEqual(pane.isSkinnyMode, false, "Verify: mode of power pane");

        // Verify People View Chevron is present
        var favoritesChevron = pane.favoritesChevron;
        tc.isNotNullOrUndefined(favoritesChevron.element, "Verify: favorites chevron is present");
        tc.areEqual(favoritesChevron.isVisible, true, "Verify: favorites chevron is visible");

        var isExpanded = !favoritesChevron.canExpand;
        verify(isExpanded);
        favoritesChevron.click().then(function () {
            isExpanded = !isExpanded;
            verify(isExpanded);
            return favoritesChevron.click();
        }).then(function () {
            isExpanded = !isExpanded;
            verify(isExpanded);
        }).done(function () {
            testCleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            testCleanup(tc);
        });
    });

    // Verifies that the Newsletter view shows up when you click on the Newsletter icon
    BVT.Test("VerifyPowerPaneUI_Newsletter", options.powerPane, function (tc) {
        tc.stop();

        var pane = MailTest.powerPane;
        var newsletter = pane.newsletter;

        newsletter.switchToView(true)
            .then(function () {
                var messageListFrame = MailTest.messageListFrame;
                tc.areEqual(messageListFrame.folder.name, "Newsletters", "Verify: view name is Newsletters");
            })
            .done(function () {
                testCleanup(tc);
            },
            function (failure) {
                tc.error(failure);
                testCleanup(tc);
            });
    });

    // Verifies that the Social Updates view shows up when you click on the Social icon
    BVT.Test("VerifyPowerPaneUI_Social", options.powerPane, function (tc) {
        tc.stop();

        var pane = MailTest.powerPane;
        var social = pane.social;

        social.switchToView(true)
            .then(function () {
                var messageListFrame = MailTest.messageListFrame;
                tc.areEqual(messageListFrame.folder.name, "Social updates", "Verify: view name is Social updates");
            })
            .done(function () {
                testCleanup(tc);
            },
            function (failure) {
                tc.error(failure);
                testCleanup(tc);
            });
    });

    // Verifies that the All favorites view shows up when you click on the Favorites
    BVT.Test("VerifyPowerPaneUI_PeopleView_Favorites_Full", options.peopleView, function (tc) {
        tc.stop();

        var pane = MailTest.powerPane;
        if (pane.isSkinnyMode) {
            MailTest.switchToFullMode();
        }
        var favorites = pane.favorites;

        favorites.switchToView(true)
            .then(function () {
                var messageListFrame = MailTest.messageListFrame;
                tc.areEqual(messageListFrame.folder.name, "All favorites", "Verify: view name is All favorites");
            })
            .done(function () {
                testCleanup(tc);
            },
            function (failure) {
                tc.error(failure);
                testCleanup(tc);
            });
    });

    // Verifies that the favorite view shows up when you click on the Favorite on powerpane
    BVT.Test("Verify_PowerPane_FavoritePeopleView", options.peopleView, function (tc) {
        tc.stop();

        var pane = MailTest.powerPane;
        if (pane.isSkinnyMode) {
            MailTest.switchToFullMode();
        }

        var favoritesGroup = pane.favoritesGroup;

        var favName = "Justin Nafziger";
        var fav = favoritesGroup.item(favName);

        fav.switchToView(true)
            .then(function () {
                verifyPeopleView_Favorite(tc, favName);
            })
            .done(function () {
                testCleanup(tc);
            },
            function (failure) {
                tc.error(failure);
                testCleanup(tc);
            });
    });

    // Verifies that the favorite view shows up when you click on the Frequent from the People flyout
    BVT.Test("Verify_PeopleFlyout_FrequentPeopleView", options.peopleView, function (tc) {
        tc.stop();

        var pane = MailTest.powerPane;
        var isSkinnyMode = pane.isSkinnyMode;
        if (isSkinnyMode) {
            MailTest.switchToFullMode()
        }
        var fav = pane.favoritesMore;

        fav.openFlyout()
            .then(function () {
                var flyout = new MailTest.PeopleFlyout();

                var freqName = "Brian Lapinski";
                var freq = flyout.frequentList.item(freqName);

                freq.switchToView(true)
                    .then(function () {
                        verifyPeopleView_Favorite(tc, freqName);
                    })
                    .done(function () {
                        testCleanup(tc);
                    },
                    function (failure) {
                        tc.error(failure);
                        testCleanup(tc);
                    });
            });
    });

    // Verifies that favorites can be unpinned and frequent contacts can be pinned
    BVT.Test("VerifyPowerPaneUI_PeopleView_ContactPinUnpin", options.peopleView, function (tc) {
        tc.stop();

        var pane = MailTest.powerPane;
        if (pane.isSkinnyMode) {
            MailTest.switchToFullMode();
        }
        var fav = pane.favoritesMore;

        fav.openFlyout()
            .then(function () {
                var favName = "Justin Nafziger";
                var freqName = "Brian Lapinski";

                var flyout = new MailTest.PeopleFlyout();

                var favoriteList = flyout.favoriteList;
                var frequentList = flyout.frequentList;

                var fav = favoriteList.item(favName);
                var freq = frequentList.item(freqName);

                freq.pin()
                    .then(function () {
                        tc.isTrue(freq.isPinned, "Verify: contact is pinned");

                        var favoriteList = flyout.favoriteList;
                        var frequentList = flyout.frequentList;
                        tc.isNull(frequentList.item(freqName), "Verify: contact is removed from frequent list");
                        tc.isNotNull(favoriteList.item(freqName), "Verify: contact is added to favorites list");

                        var pane = MailTest.powerPane;
                        var favList = pane.favoritesGroup;
                        tc.isNotNull(favList.item(freqName), "Verify: contact is added to power pane");
                    })
                    .then(function () {
                        fav.unpin()
                            .then(function () {
                                tc.isFalse(fav.isPinned, "Verify: contact is not pinned");

                                var favoriteList = flyout.favoriteList;
                                var frequentList = flyout.frequentList;
                                tc.isNull(favoriteList.item(favName), "Verify: contact is removed from favorites list");
                                tc.isNotNull(frequentList.item(favName), "Verify: contact is added to frequent list");
                            })
                    });
            })
            .done(function () {
                testCleanup(tc);
            },
            function (failure) {
                tc.error(failure);
                testCleanup(tc);
            });
    });

    // Verifies that the People Flyout shows up in Full mode
    // Verifies the UI elements on the People flyout
    BVT.Test("VerifyPowerPaneUI_PeopleView_Flyout_Full", options.peopleView, function (tc) {
        tc.stop();

        verifyPeopleViewFlyout(tc, true);
    });

    // Verifies that the People Flyout shows up in Skinny mode
    // Verifies the UI elements on the People flyout
    BVT.Test("VerifyPowerPaneUI_PeopleView_Flyout_Skinny", options.peopleView, function (tc) {
        tc.stop();

        verifyPeopleViewFlyout(tc, false);
    });

    // Verify the power pane UI
    var verifyPowerPaneUI = function (tc, verifyFullMode) {
        return new WinJS.Promise(function (complete) {
            var pane = MailTest.powerPane;

            // Power Pane
            tc.isTrue(pane.isVisible, "Verify: power pane is visible");
            tc.areEqual(pane.isSkinnyMode, !verifyFullMode, "Verify: mode of power pane");

            // Current Account
            var account = pane.currentAccount;
            tc.isNotNullOrUndefined(account.element, "Verify: Current account is present");
            tc.areEqual(account.isVisible, verifyFullMode, "Verify: Current account is visible");
            tc.areEqual(account.name, "Work", "Verify: Current Account name is present");

            // Verify Inbox is present
            var inbox = pane.inbox;
            tc.isNotNullOrUndefined(inbox.element, "Verify: inbox is present");
            tc.areEqual(inbox.unreadCount, "zero", "Verify: inbox unread count");
            tc.isTrue(inbox.isVisible, "Verify: inbox is visible");

            // Verify People View is present
            var favorites = pane.favorites;
            tc.isNotNullOrUndefined(favorites.element, "Verify: favorites is present");
            tc.isTrue(favorites.isVisible, "Verify: favorites is visible");

            // Verify Newsletter is present
            var newsletter = pane.newsletter;
            tc.isNotNullOrUndefined(newsletter.element, "Verify: newsletter is present");
            tc.areEqual(newsletter.unreadCount, "zero", "Verify: newsletter unread count");
            tc.isTrue(newsletter.isVisible, "Verify: newsletter is visible");

            // Verify Social is present
            var social = pane.social;
            tc.isNotNullOrUndefined(social.element, "Verify: social is present");
            tc.areEqual(social.unreadCount, "zero", "Verify: social unread count");
            tc.isTrue(social.isVisible, "Verify: social is visible");

            // Verify Flagged is present
            var flagged = pane.flagged;
            tc.isNotNullOrUndefined(flagged.element, "Verify: flagged is present");
            tc.areEqual(flagged.unreadCount, "1", "Verify: flagged unread count");
            tc.isTrue(flagged.isVisible, "Verify: flagged is visible");

            // Verify Folders is present
            var folders = pane.folders;
            tc.isNotNullOrUndefined(folders.element, "Verify: folders is present");
            tc.isTrue(folders.isVisible, "Verify: folders is visible");

            // Verify People View Chevron is present
            var favoritesChevron = pane.favoritesChevron;
            tc.isNotNullOrUndefined(favoritesChevron.element, "Verify: favorites chevron is present");
            tc.areEqual(favoritesChevron.isVisible, verifyFullMode, "Verify: favorites chevron is visible");
            if (verifyFullMode) {
                tc.isFalse(favoritesChevron.canExpand, "Verify: favorites chevron state");
            }

            // Verify People View More is present
            var favoritesMore = pane.favoritesMore;
            tc.isNotNullOrUndefined(favoritesMore.element, "Verify: favorites more is present");
            tc.areEqual(favoritesMore.isVisible, verifyFullMode, "Verify: favorites more is visible");

            // Verify Favorites list is present
            var favoritesGroup = pane.favoritesGroup;
            tc.isNotNullOrUndefined(favoritesGroup.element, "Verify: favorites list is present");
            tc.areEqual(favoritesGroup.isVisible, verifyFullMode, "Verify: favorites list is visible");

            // Each element in Favorites list
            var expectedFavorites = [
                { name: "Justin Nafziger", count: "zero" },
                { name: "Mark Flick", count: "zero" }];
            var favoritesList = favoritesGroup.list;
            var len = favoritesList.length;
            tc.areEqual(len, expectedFavorites.length, "Verify: favorites list length")
            for (var i = 0; i < len; ++i) {
                var actFavorite = favoritesList[i];
                var expFavorite = expectedFavorites[i];
                tc.areEqual(actFavorite.name, expFavorite.name, "Verify: favorites list - person name");
                tc.areEqual(actFavorite.unreadCount, expFavorite.count, "Verify: favorites list - person unread count");
                tc.areEqual(actFavorite.isVisible, verifyFullMode, "Verify: favorites list - person is visible");
            }

            // Verify Folders list is present
            var foldersGroup = pane.foldersGroup;
            tc.isNotNullOrUndefined(foldersGroup.element, "Verify: folders list is present");
            tc.areEqual(foldersGroup.isVisible, verifyFullMode, "Verify: folders list is visible");

            // Each element in Folders list
            var expectedFolders = [
                { name: "Code Reviews", count: "3" }];
            var foldersList = foldersGroup.list;
            var len = foldersList.length;
            tc.areEqual(len, expectedFolders.length, "Verify: folder list length")
            for (var i = 0; i < len; ++i) {
                var actFolder = foldersList[i];
                var expFolder = expectedFolders[i];
                tc.areEqual(actFolder.name, expFolder.name, "Verify: folder list - folder name");
                tc.areEqual(actFolder.unreadCount, expFolder.count, "Verify: folder list - folder unread count");
                tc.areEqual(actFolder.isVisible, verifyFullMode, "Verify: folder list - folder is visible");
            }

            complete(true);
        });
    };

    // Verify the People view flyout
    var verifyPeopleViewFlyout = function (tc, verifyFullMode) {
        var pane = MailTest.powerPane;
        var isSkinnyMode = pane.isSkinnyMode;
        if (verifyFullMode && isSkinnyMode) {
            MailTest.switchToFullMode()
        } else if (!verifyFullMode && !isSkinnyMode) {
            MailTest.switchToSkinnyMode();
        }
        isSkinnyMode = pane.isSkinnyMode;
        var fav = !isSkinnyMode ? pane.favoritesMore : pane.favorites;

        fav.openFlyout()
            .then(function () {
                var flyout = new MailTest.PeopleFlyout();

                // Header
                var header = flyout.header;
                tc.isNotNullOrUndefined(header.element, "Verify: primary header is present");
                tc.isTrue(header.isVisible, "Verify: primary header is visible");
                tc.areEqual(header.text, "Favorites", "Verify: primary header text");

                header = flyout.secondaryHeader;
                tc.isNotNullOrUndefined(header.element, "Verify: secondary header is present");
                tc.isTrue(header.isVisible, "Verify: secondary header is visible");
                tc.areEqual(header.text, "Frequent", "Verify: secondary header text");

                // Verify person items
                var verifyPersons = function (actualPersons, expectedPersons) {
                    var len = actualPersons.length;
                    tc.areEqual(len, expectedPersons.length, "Verify: favorites list length")
                    for (var i = 0; i < len; ++i) {
                        var actualPerson = actualPersons[i];
                        var expectedPerson = expectedPersons[i];
                        tc.areEqual(actualPerson.name, expectedPerson.name, "Verify: list - person name");
                        tc.areEqual(actualPerson.unreadCount, expectedPerson.count, "Verify: list - person unread count");
                        tc.areEqual(actualPerson.isPinned, expectedPerson.isPinned, "Verify: list - person isPinned");
                        tc.isTrue(actualPerson.isVisible, "Verify: list - person is visible");
                    }
                };

                // Each element in Favorites list
                var expectedFavorites = [
                    { name: "Justin Nafziger", count: "zero", isPinned: true },
                    { name: "Mark Flick", count: "zero", isPinned: true }];
                verifyPersons(flyout.favoriteList.list, expectedFavorites);

                // Each element in frequent list
                var expectedFrequents = [
                    { name: "Brian Lapinski", count: "zero", isPinned: false },
                    { name: "Daniel Feies", count: "zero", isPinned: false }];
                verifyPersons(flyout.frequentList.list, expectedFrequents);

                // Picker
                var picker = flyout.picker;
                tc.isNotNullOrUndefined(picker.element, "Verify: picker is present");
                tc.isTrue(picker.isVisible, "Verify: picker is visible");
                tc.areEqual(picker.text, "Search contacts", "Verify: picker text");
                tc.areEqual(picker.title, "Search contacts", "Verify: picker title");

            })
            .then(function () {
                // Dismiss the flyout
                var flyout = new MailTest.PeopleFlyout();
                flyout.dismiss();
            })
            .done(function () {
                testCleanup(tc);
            },
            function (failure) {
                tc.error(failure);
                testCleanup(tc);
            });
    };

    // Verify the People view for Favorite
    var verifyPeopleView_Favorite = function (tc, favName) {
        var messageListFrame = MailTest.messageListFrame;
        tc.areEqual(messageListFrame.folder.name, favName, "Verify: view name is the favorite name");
    }

})();
