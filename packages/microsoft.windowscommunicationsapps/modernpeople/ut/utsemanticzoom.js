
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People,Jx*/

// There isn't much to be testing now since everything is stubbed. I'm only checking that my code doesn't throw any errors.

Include.initializeFileScope(function () {
    var zoomView;
    var mockViewport;
    var host;
    function SetUp() {
        mockViewport = {};
        Jx.mix(mockViewport, Jx.Component.prototype);
        zoomView = new People.ZoomableView("zoomedIn", mockViewport, "horizontal");
    }

    Tx.test("semanticZoomTests.testGetPanAxis", function (tc) {
        SetUp();
        zoomView.getPanAxis();
        return;
    });
    //this.testGetPanAxis["Owner"] = "hsinliu";
    //this.testGetPanAxis["Priority"] = "0";

    Tx.test("semanticZoomTests.testGetCurrentItem", function (tc) {
        SetUp();
        mockViewport.getCurrentItem = function (item) { return { scrollPos: 0, orthoPos: 0 }; };
        zoomView.getCurrentItem();
        return;
    });
    
    Tx.test("semanticZoomTests.testSetCurrentItem", function (tc) {
        SetUp();
        mockViewport.setCurrentItem = function (position) { return 0; };
        zoomView._element = document.createElement("div");
        zoomView.setCurrentItem(0, 0);
        return;
    });
    
    Tx.test("semanticZoomTests.testPositionItem", function (tc) {
        SetUp();
        mockViewport.positionItem = function () { return { left: 0, top: 0 }; };
        var position = { scrollPos: 0, orthoPos: 0 };
        zoomView.positionItem(0, position);
        return;
    });
});