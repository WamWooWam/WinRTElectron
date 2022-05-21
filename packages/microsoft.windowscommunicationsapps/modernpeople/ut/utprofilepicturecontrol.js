
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Debug,document,Include*/

Include.initializeFileScope(function () {
    // Shortcut for the changing namespace
    var C = People.Controls;
    var U = People.UnitTest;

    var style;
    var parentElement = null;
    var c_userTileSize = 220;
    var testPerson = null;
    var throwOnAssert = null;
    var control = null;

    function getDummyHost (tc, commandDiv) {
        if (commandDiv === null) {
            commandDiv = document.createElement('div');
        }

        var theHost = new U.DummyPageHost(commandDiv);
        // Sanity check to ensure that the dummy host is implementing the expected interface methods
        UnitTestUtils.assertImplements(tc, theHost, new U.Interfaces.IPageHost());

        return theHost;
    }

    function setup (tc) {
        
        throwOnAssert = Debug.throwOnAssert;
        Debug.throwOnAssert = true;
        
        if (!Jx.app) {
            Jx.app = new Jx.Application();
        }

        Jx.res.oldGetString = Jx.res.getString;
        Jx.res.getString = function (name) { return "UT" + name; };
        Jx.res.oldLoadCompoundString = Jx.res.loadCompoundString;
        Jx.res.loadCompoundString = function (name, values) { return "UT" + name; };

        style = document.createElement("link");
        style.rel = "stylesheet";
        style.type = "text/css";
        style.href = "/modernpeople/resources/css/Controls-people.css";
        document.head.appendChild(style);

        parentElement = document.createElement("div");
        parentElement.style.width = "1920px";
        parentElement.style.height = "1080px";
        parentElement.style.position = "relative";
        parentElement.style.left = "0px";
        parentElement.style.visibility = 'hidden';
        document.body.appendChild(parentElement);

        var mockProvider = new U.TestMockIMePeople();
        testPerson = mockProvider.getIMe('fred01');
        testPerson.userTileCrop = {};

        var myHost = getDummyHost(tc, null);
        control = new C.ProfilePictureControl(myHost);
        tc.isNotNull(control, "Expected a control object");
        tc.isTrue(control._host === myHost, 'Validate that the host has been assigned');
        tc.isNull(control._container, 'Validate that the host container is null');
        tc.isNull(control._person, 'Validate that the person object is null');
    }

    function cleanup () {
        if (parentElement) {
            document.body.removeChild(parentElement);
            parentElement = null;
        }

        document.head.removeChild(style);

        Jx.res.getString = Jx.res.oldGetString;
        Jx.res.loadCompoundString = Jx.res.oldLoadCompoundString;

        
        Debug.throwOnAssert = throwOnAssert;
        
    }

    function addPhoto (control) {
        // Create a dummy "photo"
        var photo = document.createElement('div');
        photo.id = 'profilePicture-photo';

        // Clear inner and add photo div
        var inner = control._elements.inner;
        inner.innerHTML = '';
        inner.appendChild(photo);

        // Replace reference to photo
        control._elements.photo = photo;
        return photo;
    }

    Tx.test("ProfilePictureControlTests.test_CheckLayout", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        UnitTestUtils.assertImplements(tc, control, new U.Interfaces.IPageControl());

        control.load({ element: parentElement, mode: 'load', data: testPerson });
        control.activate();

        var photo = addPhoto(control);

        var scroller = control._elements.scroller;
        var container = control._elements.container;
        var inner = control._elements.inner;

        // Test behavior for a variety of photo sizes
        var photoSizes = [{ width: 440, height: 440 },
                          { width: 880, height: 440 },
                          { width: 120, height: 120, newWidth: 220, newHeight: 220 },
                          { width: 100, height: 120, newWidth: 220, newHeight: 264 },
                          { width: 4400, height: 120, newWidth: 4400 * 220 / 120, newHeight: 220 },
                          { width: 4400, height: 2200, newWidth: 2200, newHeight: 1100}];

        for (var i = 0; i < photoSizes.length; i++) {
            var size = photoSizes[i];
            photo.naturalWidth = size.width;
            photo.naturalHeight = size.height;

            var photoWidth = size.newWidth ? size.newWidth : size.width;
            var photoHeight = size.newHeight ? size.newHeight : size.height;

            // Call _showImage to update scroll limits and position
            control._showImage();

            // Verify starting zoom
            var defaultZoom = 1;
            if (photoWidth / scroller.clientWidth >= photoHeight / scroller.clientHeight) {
                if (photoWidth / scroller.clientWidth > 1) {
                    defaultZoom = scroller.clientWidth / photoWidth;
                    if (photoHeight * defaultZoom < c_userTileSize) {
                        defaultZoom = c_userTileSize / photoHeight;
                    }
                }
            } else {
                if (photoHeight / scroller.clientHeight > 1) {
                    defaultZoom = scroller.clientHeight / photoHeight;
                    if (photoWidth * defaultZoom < c_userTileSize) {
                        defaultZoom = c_userTileSize / photoWidth;
                    }
                }
            }

            tc.areEqual(Math.round(defaultZoom * 100), Math.round(scroller.msContentZoomFactor * 100), "Starting zoom is incorrect.");

            // Verify photo size
            tc.areEqual(Math.round(photoWidth), photo.width, "Photo width incorrect");
            tc.areEqual(Math.round(photoHeight), photo.height, "Photo height incorrect");

            // Check that inner content is large enough for scrolling
            tc.isTrue(control._controlProperties.zoomMin * scroller.scrollWidth >= container.clientWidth - c_userTileSize + photo.width * control._controlProperties.zoomMin, "Inner width too small");
            tc.isTrue(control._controlProperties.zoomMin * scroller.scrollHeight >= container.clientHeight - c_userTileSize + photo.height * control._controlProperties.zoomMin, "Inner height too small");

            // Check that photo is centered
            tc.areEqual(Math.floor((inner.clientWidth - scroller.clientWidth / scroller.msContentZoomFactor) / 2), scroller.scrollLeft, "Scroll position not centered horizontally");
            tc.areEqual(Math.floor((inner.clientHeight - scroller.clientHeight / scroller.msContentZoomFactor) / 2), scroller.scrollTop, "Scroll position not centered vertically");

            tc.areEqual(Math.floor((inner.clientWidth - photo.width) / 2), photo.offsetLeft, "Photo not centered horizontally");
            tc.areEqual(Math.floor((inner.clientHeight - photo.height) / 2), photo.offsetTop, "Photo not centered vertically");
        }
        control.deactivate();
        control.unload();
        parentElement.innerHTML = "";
    });

    Tx.test("ProfilePictureControlTests.test_CheckCrop", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var tests = [{
            photoWidth: 500, photoHeight: 600,
            crop: { width: 220, height: 220, x: 0, y: 0 },
            newZoom: 1.5, newX: 100, newY: 200
        }, {
            photoWidth: 400, photoHeight: 1200,
            crop: { width: 220, height: 220, x: 100, y: 200 },
            newZoom: 0.6, newX: 0, newY: 0
        }, {
            photoWidth: 600, photoHeight: 600,
            crop: { width: 110, height: 110, x: 200, y: 300 },
            zoom: 2,
            newZoom: 1, newX: 250, newY: 111
        }, {
            photoWidth: 800, photoHeight: 600,
            crop: { width: 330, height: 330, x: 120, y: 50 },
            zoom: 220 / 330,
            newZoom: 2, newX: 300, newY: 300
        }];
        for (var i = 0; i < tests.length; i++) {
            var zoom = tests[i].zoom ? tests[i].zoom : 1;
            var crop = testPerson.userTileCrop = tests[i].crop;

            control.load({ element: parentElement, mode: 'load', data: testPerson });
            control.activate();

            var photo = addPhoto(control);

            var scroller = control._elements.scroller;

            photo.naturalWidth = tests[i].photoWidth;
            photo.naturalHeight = tests[i].photoHeight;

            // Call _showImage to update scroll limits and position
            control._showImage();

            // Verify starting zoom
            tc.areEqual(Math.round(zoom * 100), Math.round(scroller.msContentZoomFactor * 100), "Starting zoom is incorrect");

            // Get exact value of zoom
            zoom = scroller.msContentZoomFactor;

            // Check that photo is positioned to crop
            tc.areEqual(crop.x, Math.floor(scroller.scrollLeft + (scroller.clientWidth - c_userTileSize) / 2 / zoom) - photo.offsetLeft, "Starting x position is incorrect");
            tc.areEqual(crop.y, Math.floor(scroller.scrollTop + (scroller.clientHeight - c_userTileSize) / 2 / zoom) - photo.offsetTop, "Starting y position is incorrect");

            // Set new zoom and position
            scroller.style.msScrollLimitXMin = "";
            scroller.style.msScrollLimitXMax = "";
            scroller.style.msScrollLimitYMin = "";
            scroller.style.msScrollLimitYMax = "";
            scroller.msContentZoomFactor = tests[i].newZoom;
            scroller.scrollLeft = photo.offsetLeft - Math.floor((scroller.clientWidth - c_userTileSize) / 2 / zoom) + tests[i].newX;
            scroller.scrollTop = photo.offsetTop - Math.floor((scroller.clientHeight - c_userTileSize) / 2 / zoom) + tests[i].newY;

            // Save and check crop
            try {
                // Platform call will fail
                control.save();
            } catch (x) {
                tc.isTrue(Jx.isObject(control._controlProperties.crop), "Crop not set");
                tc.areEqual(tests[i].newX, control._controlProperties.crop.x, "Crop.x set incorrectly");
                tc.areEqual(tests[i].newY, control._controlProperties.crop.y, "Crop.y set incorrectly");
            }

            control.deactivate();
            control.unload();
        }

        parentElement.innerHTML = "";
    });

    Tx.test("ProfilePictureControlTests.test_CheckResize", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var photoWidth = 600, photoHeight = 600;
        var crop = { width: 110, height: 110, x: 200, y: 300 };
        var zoom = 2,
            newZoom = 1.5;
        var updatedX = 250,
            updatedY = 111;
        
        testPerson.userTileCrop = crop;

        control.load({ element: parentElement, mode: 'load', data: testPerson });
        control.activate();

        var photo = addPhoto(control);

        var scroller = control._elements.scroller;

        photo.naturalWidth = photoWidth;
        photo.naturalHeight = photoHeight;

        // Call _showImage to update scroll limits and position
        control._showImage();

        // Get exact value of zoom
        zoom = scroller.msContentZoomFactor;

        // Set new zoom and position
        scroller.style.msScrollLimitXMin = "";
        scroller.style.msScrollLimitXMax = "";
        scroller.style.msScrollLimitYMin = "";
        scroller.style.msScrollLimitYMax = "";
        scroller.msContentZoomFactor = newZoom;
        scroller.scrollLeft = photo.offsetLeft - Math.floor((scroller.clientWidth - c_userTileSize) / 2 / zoom) + updatedX;
        scroller.scrollTop = photo.offsetTop - Math.floor((scroller.clientHeight - c_userTileSize) / 2 / zoom) + updatedY;

        // Shrink and expand control to test that it retains crop position
        parentElement.style.width = "1024px";
        parentElement.style.height = "768px";
        control._onResize();

        parentElement.style.width = "1920px";
        parentElement.style.height = "1080px";
        control._onResize();

        // Save and check crop
        try {
            // Platform call will fail
            control.save();
        } catch (x) {
            var crop = control._controlProperties.crop;
            tc.isTrue(Jx.isObject(crop), "Crop not set");
            tc.isTrue(Math.abs(crop.x - updatedX) < 3, "Crop.x set incorrectly, was " + updatedX + " now is " + crop.x);
            tc.isTrue(Math.abs(crop.y - updatedY) < 3, "Crop.y set incorrectly, was " + updatedY + " now is " + crop.y);
        }

        control.deactivate();
        control.unload();

        parentElement.innerHTML = "";
    });
});