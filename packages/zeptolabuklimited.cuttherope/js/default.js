
(function () {
    "use strict";

    var app = WinJS.Application,
        activation = Windows.ApplicationModel.Activation,
        applicationData = Windows.Storage.ApplicationData.current,
        roamingSettings = applicationData.roamingSettings,
        OfferTokens = {
            // enables all boxes (full version of game)
            ENABLE_ALL_BOXES: 'EnableAllBoxes',

            // removes the star requirements for all boxes (not yet implemented)
            UNLOCK_ALL_BOXES: 'UnlockAllBoxes'
        };

    WinJS.strictProcessing();

    var IS_PAID_FULL_VERSION = true,
        SHOW_EXCEPTION_DIALOG = false,
        SIMULATE_PURCHASES = false,
        MARKED_UP_APP_ID = SIMULATE_PURCHASES
            ? '0c0dd811-03c6-464a-8ae8-9908cd8eb71c' // test account
            : 'c31ea8d3-d7c8-434d-99a1-bb1dd1e8c10c', // production account
        initPurchases = function () {
            if (IS_PAID_FULL_VERSION) {

                // user purchased full version so mark all boxes as paid
                ZeptoLab.ctr.setPaidBoxes(true);

            } else if (SIMULATE_PURCHASES) {

                ZeptoLab.ctr.setPaidBoxes(false);
                Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync("data").done(
                function (folder) {
                    folder.getFileAsync("in-app-purchase-simulator.xml").done(
                        function (file) {
                            Windows.ApplicationModel.Store.CurrentAppSimulator.reloadSimulatorAsync(file).done();
                        });
                });

            } else {
                var currentApp = getCurrentApp(),
                licenseInfo = currentApp.licenseInformation,
                enableAllBoxes = licenseInfo.productLicenses.lookup(OfferTokens.ENABLE_ALL_BOXES);

                // tell app if full version has been purchased (enable all boxes)
                ZeptoLab.ctr.setPaidBoxes(enableAllBoxes.isActive);
            }
        };

    if (SHOW_EXCEPTION_DIALOG) {
        WinJS.Application.onerror = function (e) {
            var title = 'Unhandled Exception',
                content = 'File: ' + e.detail.errorUrl + '\r\n' +
                    'Line: ' + e.detail.errorLine + ' ' +
                    'Char: ' + e.detail.errorCharacter + '\r\n' +
                    'Message: \r\n' + e.detail.errorMessage,
                dialog = new Windows.UI.Popups.MessageDialog(content, title);

            dialog.showAsync().done();
            return true;
        };
    }

    function getCurrentApp() {

        if (SIMULATE_PURCHASES) {
            // testing
            return Windows.ApplicationModel.Store.CurrentAppSimulator;
        } else {
            // production 
            return Windows.ApplicationModel.Store.CurrentApp;
        }
    }

    function getAppVersion() {
        var p = Windows.ApplicationModel.Package.current.id.version;
        return p.major + "." + p.minor + "." + p.build + "." + p.revision;
    }

    var activated = false;
    app.onactivated = function (eventObject) {
        if (!activated) {
            
            // Populate settings pane and tie commands to settings flyouts.
            WinJS.Application.onsettings = function (e) {
                var getText = ZeptoLab.ctr.getMenuText,
                    MenuStringId = { // from js/resources/MenuStringId.js
                        SETTINGS: 200,
                        ABOUT: 7,
                        PRIVACY: 201
                    };

                // add standard div based setting panels
                e.detail.applicationcommands = {
                    "settingsDiv": { title: getText(MenuStringId.SETTINGS) },
                    "aboutDiv": { title: getText(MenuStringId.ABOUT) }
                };
                WinJS.UI.SettingsFlyout.populateSettings(e);

                $("#settingsDiv")[0].winControl.onbeforeshow = function() {
                    ZeptoLab.ctr.refreshOptions();
                };

                // set the current build's version in the about pane
                var versionSpan = document.getElementById('version');
                if (versionSpan) {
                    versionSpan.innerHTML = getAppVersion();
                }

                // add special commands (ex: privacy opens a browser link)
                var appCommands = e.detail.e.request.applicationCommands,
                    SettingsCommand = Windows.UI.ApplicationSettings.SettingsCommand;
                appCommands.append(new SettingsCommand("privacy", getText(MenuStringId.PRIVACY), function () {
                    var uri = new Windows.Foundation.Uri("http://www.zeptolab.com/pp.htm");
                    Windows.System.Launcher.launchUriAsync(uri);
                }));
            };
            
            eventObject.setPromise(WinJS.UI.processAll().done(function () {

                ZeptoLab.ctr.setAchievementsProvider(ZL.Achievements);
                ZeptoLab.ctr.setLeaderboardProvider(ZL.Leaderboards);

                // initialize xbox live user API
                ZL.Player.init();

                // attempt to sign-in
                ZL.Player.signIn();
            }));
            
            // ctr-winjs-test MarkedUp account
            //MK.initialize(MARKED_UP_APP_ID);

            activated = true;
        }

        /*
        if (eventObject.detail.kind === activation.ActivationKind.launch) {
            if (eventObject.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
               // newly launched
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }           
        }
        */

    };

    ZeptoLab.ctr.onAppRun(function () {
        initPurchases();
    });

    // called when the scrollable region needs to be updated
    ZeptoLab.ctr.onUpdateCandyScroller(function (sliderHeight) {
        $(".scrollable").nanoScroller({
            disableResize: true,
            preventPageScrolling: true,
            alwaysVisible: true,
            sliderMinHeight: sliderHeight,
            sliderMaxHeight: sliderHeight
        });
    });

    function getInstallationSource(callback) {

        function readCustomDataFile(file) {
            Windows.Storage.FileIO.readTextAsync(file).done(function (text) {
                callback(ZeptoLab.ctr.extractCustomDataSource(text));
            }, customDataError);
        }

        function customDataError() {
            // custom data file doesn't exist for standard non-OEM installs
            callback('WindowsStore');
        }

        var installedLocation = Windows.ApplicationModel.Package.current.installedLocation;
        if (SIMULATE_PURCHASES) {
            installedLocation.getFolderAsync("data").done(
                function (folder) {
                    folder.getFileAsync('sample-custom-data.xml')
                        .done(readCustomDataFile, customDataError);
                }, customDataError);
        } else {
            installedLocation.getFileAsync("microsoft.system.package.metadata\\custom.data")
                .done(readCustomDataFile, customDataError);
        }
    }

    ZeptoLab.ctr.promptPurchaseBoxes(function () {
        // var currentApp = getCurrentApp(),
        //     licenseInfo = currentApp.licenseInformation,
        //     enableAllBoxes = licenseInfo.productLicenses.lookup(OfferTokens.ENABLE_ALL_BOXES);

        if (false) {

            getInstallationSource(function (source) {
                var purchaseType = OfferTokens.ENABLE_ALL_BOXES + '-' + source,
                    PURCHASE_PAGE = 'Boxes';

                // TODO: MarkedUp in-app purchases not working yet
                //MK.inAppPurchaseOfferSelected(PURCHASE_PAGE, purchaseType);

                // prompt for purchase
                currentApp.requestProductPurchaseAsync(OfferTokens.ENABLE_ALL_BOXES, true).then(
                    function (receiptXml) {

                        // TODO: validate receipt. There is a MS server that can be
                        // queried to validate the receipt certificate. However, its
                        // not live yet, so we'll just verify that the receipt is not
                        // blank (unfortunately cancelling a purchase still calls the
                        // "success" function but with a blank receipt).

                        var success = (receiptXml != null && receiptXml !== '');
                        ZeptoLab.ctr.setPaidBoxes(success);

                        if (success) {

                            MK.sessionEvent(purchaseType);

                            // TODO: add currency and amount from receipt xml
                            //MK.inAppPurchaseComplete(PURCHASE_PAGE, purchaseType);
                        } else {
                            //MK.inAppPurchaseCancelled(PURCHASE_PAGE, purchaseType);
                        }
                    },
                    function (error) {
                        // The in-app purchase was not completed because 
                        // the customer canceled it or there was an error.
                        //MK.inAppPurchaseCancelled(PURCHASE_PAGE, purchaseType);

                        // TODO: log error
                    });
            });
        } else {
            // The customer already owns this feature.
            ZeptoLab.ctr.setPaidBoxes(true);
        }
    });

    // create and register a roaming settings provider for CTR
    ZeptoLab.ctr.setRoamingSettingProvider({
        get: function (key) {
            return roamingSettings.values[key];
        },
        set: function (key, value) {
            roamingSettings.values[key] = value;

            // TEST: simulate roaming by intentionally signaing change event 
            // applicationData.signalDataChanged();
        },
        remove: function (key) {
            roamingSettings.values.remove(key);
        }
    });

    // notify CTR when roaming data changes
    applicationData.ondatachanged = function (eventArgs) {
        ZeptoLab.ctr.onRoamingDataChanged();
    };

    // register a handler for the CTR options button
    ZeptoLab.ctr.onShowOptions(function () {
        Windows.UI.ApplicationSettings.SettingsPane.show();
    });

    // // listen for snap view related transitions
    // var mq = msMatchMedia("all and (-ms-view-state: snapped)");
    // mq.addListener(function snapListener(mql) {
    //     if (mql.matches) {
    //         ZeptoLab.ctr.disable();
    //     }
    //     else {
    //         ZeptoLab.ctr.enable();
    //     }
    // });


    $(document).ready(function () {
        /* test score tile creation
        setTimeout(function () {
            //createScoreTile(8888);
        }, 1000);
        */

        // xbox live games app button
        $('#xboxLiveBtn').click(function () {
            Microsoft.Xbox.XboxLIVEService.showGamesApplicationAsync(
                Microsoft.Xbox.LaunchAction.showHome);
        });
    });


    // returns a msapplication url that points to the tile image
    function createScoreTile(score) {

        var TILE_FILENAME = "tile.png",
            TILE_WIDTH = 434,
            TILE_HEIGHT = 210;

        var Imaging = Windows.Graphics.Imaging,
            imgData = null,
            fileStream = null,
            canvas = null;

        // tile image
        var bgImg = new Image();
        bgImg.src = "images/blanktile.png";

        // number image
        var numberImg = ZeptoLab.ctr.getScoreImage(score, 170),
            localFolder = Windows.Storage.ApplicationData.current.localFolder,
            replaceExisting = Windows.Storage.CreationCollisionOption.replaceExisting,
            notifications = Windows.UI.Notifications,
            tileNotifier = notifications.TileUpdateManager.createTileUpdaterForApplication();

        // clear any existing tile notifications
        tileNotifier.clear();

        localFolder.createFileAsync(TILE_FILENAME, replaceExisting)
        .then(function (file) {
            return file.openAsync(Windows.Storage.FileAccessMode.readWrite);
        })
        .then(function (stream) {

            fileStream = stream;

            // create canvas
            canvas = document.createElement("canvas");
            canvas.width = TILE_WIDTH;
            canvas.height = TILE_HEIGHT;

            // create context
            var context = canvas.getContext("2d");

            // draw stuff
            context.drawImage(bgImg, 0, 0, TILE_WIDTH, TILE_HEIGHT);
            context.drawImage(numberImg, 265, 5);

            // get the sweet image data
            imgData = context.getImageData(0, 0, canvas.width, canvas.height);

            return Imaging.BitmapEncoder.createAsync(Imaging.BitmapEncoder.pngEncoderId, fileStream);

        }).then(function (encoder) {

            // set pixel data 
            encoder.setPixelData(Imaging.BitmapPixelFormat.rgba8, Imaging.BitmapAlphaMode.straight, canvas.width, canvas.height, 96, 96, new Uint8Array(imgData.data));

            // do the encoding
            return encoder.flushAsync();

        }).done(function () {

            // make sure to do this at the end
            fileStream.close();

            var Notifications = Windows.UI.Notifications;

            // get the wide image template xml and set the image url
            var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileWideImage);
            var wideTileImageAttributes = tileXml.getElementsByTagName("image");

            wideTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + TILE_FILENAME);

            // tiles can have a minature logo or text - we don't want either
            var bindings = tileXml.getElementsByTagName("binding");
            for (var i = 0, len = bindings.length; i < len; i++) {
                bindings[i].setAttribute("branding", "none");
            }

            // create a notification from xml and send it to the app
            var tileNotification = new Notifications.TileNotification(tileXml);

            try {
                tileNotifier.update(tileNotification);
            }
            catch (ex) {
                // Rare, but sometimes a platform exception occurs when updating the
                // tile. We'll send another tile notification when the user completes
                // another level
            }
        });

    }

    ZeptoLab.ctr.addStarUpdateListener(createScoreTile);

    ZeptoLab.ctr.onShare(function (title, description, imageUrl) {
        // set the custom data
        shareData.custom = {
            title: title,
            desc: description,

            // TODO: re-enable sharing image (we can use canvas to generate
            // the final score image and then call canvas.msToBlob(); 
            //imageUrl: imageUrl

            imageUrl: "images\\promo.png"
        };

        // trigger the share sidebar
        Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
    });

    var shareData = {
        // the standard share info
        standard: {
            title: 'I\'m playing "Cut the Rope" on Windows 8!',
            desc: 'Cut the Rope is a fun game where you feed candy to the curiously cute green monster Om-nom.',
            imageUrl: "images\\promo.png"
        },
        // custom share info (hidden drawing found or game won)
        custom: null
    };

    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
    dataTransferManager.addEventListener("datarequested", function (e) {
        var data = shareData.custom ? shareData.custom : shareData.standard,
            request = e.request,
            link = new Windows.Foundation.Uri("http://www.cuttherope.net/");
        request.data.properties.title = data.title;
        request.data.properties.description = data.desc;
        request.data.setUri(link);

        if (data.imageUrl) {
            var installedLocation = Windows.ApplicationModel.Package.current.installedLocation;
            installedLocation.getFileAsync("images\\promo.png").then(function (shareThumbnail) {
                var thumbnailStreamReference = Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(shareThumbnail);
                request.data.properties.thumbnail = thumbnailStreamReference;
                var deferral = request.getDeferral();
                Windows.ApplicationModel.Package.current.installedLocation.getFileAsync(data.imageUrl).then(function (shareImage) {
                    var shareImageReference = Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(shareImage);
                    request.data.setBitmap(shareImageReference);
                    deferral.complete();
                });
            });
        }

        // clear the custom data
        shareData.custom = null;
    });

    app.oncheckpoint = function (eventObject) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // eventObject.setPromise().
    };

    app.start();
})();