
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People*/

Include.initializeFileScope(function () {

    var P = People;

    //Tests the logic of whether a tile should be greyed out or not.
    Tx.test("zoomedOutViewTests.testGreyingOut", function (tc) {
        var zoomedOutView = {};
        zoomedOutView.getTriggerZoom = function () { };

        var node = new People.ZoomedOutAlphabeticHeader(zoomedOutView);
        var headerCollection = new P.ArrayCollection("TestHeader");

        var item = {
            header: {
                type: "nameGrouping",
                data: {
                    label: "L",
                    longLabel: false
                }
            },
            collection: headerCollection
        };

        node.getHandler().setDataContext(item);
        tc.areEqual(node.getElement().firstChild.className, "zoomedOutHeaderBackground fadedZoomedOutHeaderBackground");
        headerCollection.appendItem({ name: "Laurel Schaefer" });
        headerCollection.loadComplete();
        tc.areEqual(node.getElement().firstChild.className, "zoomedOutHeaderBackground ");
    });

});