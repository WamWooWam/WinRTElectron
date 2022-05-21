
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="Pinning.ref.js"/>

/*jshint browser:true*/
/*global Windows,Microsoft,People,WinJS,Jx,Debug*/

Jx.delayDefine(People, "Pinning", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;

    var Pinning = P.Pinning = {};
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    function parse(candidate) {
        return JSON.parse(candidate || "{}");
    }

    function objectToTileId(json) {
        /// <summary> Turn candidate into a decent filepath.  Since we're only working on json strings, this is a bit of overkill.
        /// We only really need to escape the commas and colons, but this will be resilient in case opaque string IDs from Contacts platform
        /// have any strange characters. </summary>
        var tileId = Object.keys(json).map(P.Sequence.value, json).join("_").replace(/[\n\t\";,:!<>\/\\\*\? ]/g, "");

        if (tileId.length > 64) {
            // The TileId has to be <= 64 characteres.
            // We will use device id combined with local time since it is unlikely to incorrectly conflict.
            // NOTE: we format the device id and the time in a way to help ensure that the end result is
            var deviceId = new Windows.Security.ExchangeActiveSyncProvisioning.EasClientDeviceInformation().id;
            tileId = "P_" + deviceId.replace(/-/g, "") + "_" + Date.now().toString(16);
        }

        return tileId;
    }

    function applyPinAction(fnAction, personTile, args) {
        try { // The Promise doesn't handle some errors for us strangely and blows up on the stack instead.  Handle those.
            return fnAction.apply(personTile, args);
        } catch (e) {
            Jx.log.error(e);
            return WinJS.Promise.wrapError(e);
        }
    }

    function pinAsync(platform, person, pin, pinnedTileId, pinnedLaunchArguments, fnAction, args) {
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        /// <param name="pin" type="Boolean"/>
        /// <param name="pinnedTileId" type="String"/>
        /// <param name="pinnedLaunchArguments" type="String"/>
        /// <param name="fnAction" type="Function">Function hanging off SecondaryTile prototype with which to perform pin/unpin</param>
        /// <param name="args" type="Array">Args to apply to fnAction</param>
        var launchArguments = Jx.isNonEmptyString(pinnedLaunchArguments) ? pinnedLaunchArguments : person.tileId,
            jsonArguments = parse(launchArguments),
            tileId = Jx.isNonEmptyString(pinnedTileId) ? pinnedTileId : objectToTileId(jsonArguments);
        if (!Jx.isNonEmptyString(tileId) || !Jx.isNonEmptyString(launchArguments)) {
            return WinJS.Promise.wrapError(new Error("Could not create tile id or arguments"));
        }
        var personTile = new Windows.UI.StartScreen.SecondaryTile(tileId);
        if (pin) {
            var wl = Microsoft.WindowsLive.Platform,
                userTile = person.getUserTile(wl.UserTileSize.extraLarge, false),
                shouldRoam = (jsonArguments.type !== wl.TileIdType.easTileId) && (jsonArguments.type !== wl.TileIdType.localContactId); // Don't roam local types (EasTileId and LocalContactId)

            var imageUri = userTile.appdataURI;
            
            if (imageUri.match("^http://")) { // HTTP paths (from the mocks) are not allowed on a tile.
                imageUri = "";
            }
            
            if (!Jx.isNonEmptyString(imageUri)) { // If we don't have a usertile, use the default.
                imageUri = "ms-appx:///ModernPeople/Images/Default_User_Tile_270.png";
            }

            personTile.displayName = person.calculatedUIName;
            personTile.shortName = person.calculatedUIName;
            personTile.phoneticName = person.calculatedYomiDisplayName;
            personTile.arguments = launchArguments;
            var startScreen = Windows.UI.StartScreen;
            personTile.foregroundText = startScreen.ForegroundText.light;
            personTile.roamingEnabled = shouldRoam;
            personTile.visualElements.showNameOnSquare150x150Logo = true;
            personTile.visualElements.showNameOnWide310x150Logo = true;
            personTile.visualElements.showNameOnSquare310x310Logo = true;
            var uri = new Windows.Foundation.Uri(imageUri);
            personTile.visualElements.wide310x150Logo = uri;
            personTile.visualElements.square70x70Logo = uri;
            personTile.visualElements.square150x150Logo = uri;
            personTile.visualElements.square310x310Logo = uri;
        }

        var action = (pin ? "" : "un") + "pinning";
        return applyPinAction(fnAction, personTile, args).then(function (confirmed) {
            Jx.log.info(action + " person, " + person.objectId + " succeeded.  User confirmed: " + confirmed);
            if (confirmed) {
                if (pin)
                {
                    person.setStartScreenTileId(tileId, launchArguments);
                }
                else
                {
                    person.setStartScreenTileId(null, null);
                }
                // Whether pinning or unpinning, we should update our channels registered w/ SUP
                platform.runResourceVerbAsync(platform.accountManager.defaultAccount, "peopleTile",
                    platform.createVerb("RegisterChannels", !pin ? "" : JSON.stringify({
                        tileId: tileId,
                        arguments: launchArguments
                    })));
                if (pin) {
                    var tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForSecondaryTile(tileId);
                    tileUpdater.enableNotificationQueue(true);
                    Jx.bici.addToStream(Microsoft.WindowsLive.Instrumentation.Ids.People.socialReactionUpdated, "", P.Bici.landingPage, 0, P.Bici.pinContact);
                }
            }
            return confirmed;
        }, function (err) {
            Debug.assert(false, action + " failed " + err);
            Jx.log.error(action + " person, " + person.objectId + " failed");
        });
    }

    Pinning.pinPersonAsync = function (platform, person, pin, tileId, launchArguments, args) {
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        /// <param name="pin" type="Boolean"/>
        /// <param name="tileId" type="String"/>
        /// <param name="launchArguments" type="String"/>
        /// <param name="args" optional="true" type="Array"> Arguments to pass along to SecondaryTile action</param>
        var proto = Windows.UI.StartScreen.SecondaryTile.prototype;
        var fnAction = pin ? proto.requestCreateAsync : proto.requestDeleteAsync;
        return pinAsync(platform, person, pin, tileId, launchArguments, fnAction, args);
    };

    Pinning.isPersonPinnedAsync = function (platform, candidate) {
        /// <summary>Check if the person is pinned to MoGo. If yes, return the tile Id as well.
        /// Tile id is needed for unpin in case person.tileId has changed due to update in linked contacts.
        /// (person.tileId is generated dynamically in CPeopleTileManager::GetTileId.) </summary>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        /// <param name="candidate" type="Microsoft.WindowsLive.Platform.Person"/>
        /// <return type="IsPinnedTile"/>
        var peopleManager = platform.peopleManager;
        return Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function (tiles) {
            var tileId = "";
            var launchArguments = "";
            var isPinned = tiles.some(function (tile) {
                var person = peopleManager.tryLoadPersonByTileId(tile.arguments);
                if (!Jx.isNullOrUndefined(person) && person.objectId === candidate.objectId) {
                    tileId = tile.tileId;
                    launchArguments = tile.arguments;
                    return true;
                } else {
                    return false;
                }                    
            });
            return { isPinned: isPinned, tileId: tileId, launchArguments: launchArguments };
        });
    };

    Pinning.tileLaunchError = function (platform, tileId) {
        ///<summary>To be used in conjunction with tile-activation failures. Specifically for the
        ///case where the person for the pinned tile from which we are launched cannot be found</summary>
        ///<param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        ///<param name="tile" type="Windows.UI.StartScreen.SecondaryTile"/>
        ///<param name="messageBar" type="Chat.MessageBar"/>
        Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function (tiles) {
            var tile = P.Sequence.find(tiles, function (candidate) {
                ///<param name="candidate" type="SecondaryTile"/>
                return candidate.tileId === tileId;
            });

            var host = /*static_cast(P.CpMain)*/Jx.root;
            if (host && tile) {
                showMessageBarError(platform, tile, host.getMessageBar());
            }
        });
    };

    function showMessageBarError(platform, tile, messageBar) {
        var msgId = "PINERROR_" + tile.tileId;
        var removeMessage = function () {
            messageBar.removeMessage(msgId);
            document.removeEventListener("msvisibilitychange", onVisibilityChange, false);
        };
        var onVisibilityChange = function () {
            if (document.msVisibilityState !== "visible") {
                removeMessage();
            }
        };

        var Platform = Microsoft.WindowsLive.Platform,
            defaultAccount = platform.accountManager.defaultAccount,
            contacts = defaultAccount.getResourceByType(Platform.ResourceType.contacts);
        if ((defaultAccount.lastAuthResult === Platform.Result.defaultAccountDoesNotExist) || (contacts && contacts.isInitialSyncFinished)) {
            messageBar.addErrorMessage(msgId, 2/*priority*/, {
                messageText: Jx.res.loadCompoundString("/strings/brokenTileErrorMessage", tile.displayName),
                button1: {
                    text: Jx.res.getString("/meStrings/picCtrl_cmdDelete"),
                    tooltip: Jx.res.getString("/meStrings/picCtrl_cmdDelete"),
                    callback: function () {
                        // Remove the tile from the start screen
                        tile.requestDeleteAsync().done(function (confirmed) {
                            if (confirmed) {
                                removeMessage();
                            }
                        });
                    }
                },
                button2: {
                    text: Jx.res.getString("/accountsStrings/actdlgCancel"),
                    tooltip: Jx.res.getString("/accountsStrings/actdlgCancel"),
                    callback: removeMessage
                },
                cssClass: "ab-messageBar"
            });
        } else {
            messageBar.addErrorMessage(msgId, 2/*priority*/, {
                messageText: Jx.res.getString("/strings/incompleteSyncTileErrorMessage"),
                button2: {
                    text: Jx.res.getString("/accountsStrings/actdlgClose"),
                    tooltip: Jx.res.getString("/accountsStrings/actdlgClose"),
                    callback: removeMessage
                },
                cssClass: "ab-messageBar"
            });
        }

        // This message loses context when the user switches away then returns to our
        // app. So, remove the error when we detect the app's visibility being lost.
        document.addEventListener("msvisibilitychange", onVisibilityChange, false);
    }

});

