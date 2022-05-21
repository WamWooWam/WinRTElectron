
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People,Jx,MockJobSet*/

Include.initializeFileScope(function () {

    var P = window.People,
        O = P.Orientation,
        G = P.Grid,
        H = P.GridUTHelpers;

    var sampleData = [
        "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM",
        "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ",
        "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BK", "BL", "BM",
        "BN", "BO", "BP", "BQ", "BR", "BS", "BT", "BU", "BV", "BW", "BX", "BY",
        "CA", "CB", "CC", "CD", "CE", "CF", "CG", "CH", "CI", "CJ", "CK", "CL", "CM",
        "CN", "CO", "CP", "CQ", "CR", "CS", "CT", "CU", "CV", "CW", "CX",
        "DA", "DB", "DC", "DD", "DE", "DF", "DG", "DH", "DI", "DJ", "DK", "DL", "DM",
        "DN", "DO", "DP", "DQ", "DR", "DS", "DT", "DU", "DV", "DW",
        "EA", "EB", "EC", "ED", "EE", "EF", "EG", "EH", "EI", "EJ", "EK", "EL", "EM",
        "EN", "EO", "EP", "EQ", "ER", "ES", "ET", "EU", "EV",
        "FA", "FB", "FC", "FD", "FE", "FF", "FG", "FH", "FI", "FJ", "FK", "FL", "FM",
        "FN", "FO", "FP", "FQ", "FR", "FS", "FT", "FU",
        "GA", "GB", "GC", "GD", "GE", "GF", "GG", "GH", "GI", "GJ", "GK", "GL", "GM",
        "GN", "GO", "GP", "GQ", "GR", "GS", "GT",
        "HA", "HB", "HC", "HD", "HE", "HF", "HG", "HH", "HI", "HJ", "HK", "HL", "HM",
        "HN", "HO", "HP", "HQ", "HR", "HS",
        "IA", "IB", "IC", "ID", "IE", "IF", "IG", "IH", "II", "IJ", "IK", "IL", "IM",
        "IN", "IO", "IP", "IQ", "IR",
        "JA", "JB", "JC", "JD", "JE", "JF", "JG", "JH", "JI", "JJ", "JK", "JL", "JM",
        "JN", "JO", "JP", "JQ",
        "KA", "KB", "KC", "KD", "KE", "KF", "KG", "KH", "KI", "KJ", "KK", "KL", "KM",
        "KN", "KO", "KP",
        "LA", "LB", "LC", "LD", "LE", "LF", "LG", "LH", "LI", "LJ", "LK", "LL", "LM",
        "LN", "LO"
    ];

    var dataAndHeaders = sampleData.reduce(function (result, item) {
        if (result.length === 0 || result[result.length - 1][0] !== item[0]) {
            result.push(item[0]);
        }
        result.push(item);
        return result;
    }, []);

    var lt = H.lt;

    // Expected LTR placements corresponding to dataAndHeaders
    var ltrPlacements = [
        lt(0, 0), lt(0, 150), lt(0, 300), lt(450, 0), lt(450, 150), lt(450, 300),
        lt(900, 0), lt(900, 150), lt(900, 300), lt(1350, 0), lt(1350, 150), lt(1350, 300),
        lt(1800, 0), lt(1800, 150), lt(1800, 300), lt(2250, 0), lt(2250, 150), lt(2250, 300),
        lt(2700, 0), lt(2700, 150), lt(2700, 300), lt(3150, 0), lt(3150, 150), lt(3150, 300),
        lt(3600, 0), lt(3600, 150), lt(3600, 300), lt(4050, 0), lt(4050, 150), lt(4050, 300),
        lt(4500, 0), lt(4500, 150), lt(4500, 300), lt(4950, 0), lt(4950, 150), lt(4950, 300),
        lt(5400, 0), lt(5400, 150), lt(5400, 300), lt(5850, 0), lt(5850, 150), lt(5850, 300),
        lt(6300, 0), lt(6300, 150), lt(6300, 300), lt(6750, 0), lt(6750, 150), lt(6750, 300),
        lt(7200, 0), lt(7200, 150), lt(7200, 300), lt(7650, 0), lt(7650, 150), lt(8100, 0),
        lt(8100, 150), lt(8100, 300), lt(8550, 0), lt(8550, 150), lt(8550, 300), lt(9000, 0),
        lt(9000, 150), lt(9000, 300), lt(9450, 0), lt(9450, 150), lt(9450, 300), lt(9900, 0),
        lt(9900, 150), lt(9900, 300), lt(10350, 0), lt(10350, 150), lt(10350, 300), lt(10800, 0),
        lt(10800, 150), lt(10800, 300), lt(11250, 0), lt(11250, 150), lt(11250, 300), lt(11700, 0),
        lt(11700, 150), lt(11700, 300), lt(12150, 0), lt(12150, 150), lt(12150, 300), lt(12600, 0),
        lt(12600, 150), lt(12600, 300), lt(13050, 0), lt(13050, 150), lt(13050, 300), lt(13500, 0),
        lt(13500, 150), lt(13500, 300), lt(13950, 0), lt(13950, 150), lt(13950, 300), lt(14400, 0),
        lt(14400, 150), lt(14400, 300), lt(14850, 0), lt(14850, 150), lt(14850, 300), lt(15300, 0),
        lt(15300, 150), lt(15300, 300), lt(15750, 0), lt(15750, 150), lt(15750, 300), lt(16200, 0),
        lt(16200, 150), lt(16200, 300), lt(16650, 0), lt(16650, 150), lt(16650, 300), lt(17100, 0),
        lt(17100, 150), lt(17100, 300), lt(17550, 0), lt(17550, 150), lt(17550, 300), lt(18000, 0),
        lt(18000, 150), lt(18000, 300), lt(18450, 0), lt(18450, 150), lt(18450, 300), lt(18900, 0),
        lt(18900, 150), lt(18900, 300), lt(19350, 0), lt(19350, 150), lt(19350, 300), lt(19800, 0),
        lt(19800, 150), lt(19800, 300), lt(20250, 0), lt(20250, 150), lt(20250, 300), lt(20700, 0),
        lt(20700, 150), lt(20700, 300), lt(21150, 0), lt(21150, 150), lt(21150, 300), lt(21600, 0),
        lt(21600, 150), lt(21600, 300), lt(22050, 0), lt(22050, 150), lt(22050, 300), lt(22500, 0),
        lt(22500, 150), lt(22500, 300), lt(22950, 0), lt(22950, 150), lt(22950, 300), lt(23400, 0),
        lt(23400, 150), lt(23400, 300), lt(23850, 0), lt(23850, 150), lt(23850, 300), lt(24300, 0),
        lt(24300, 150), lt(24300, 300), lt(24750, 0), lt(24750, 150), lt(24750, 300), lt(25200, 0),
        lt(25200, 150), lt(25200, 300), lt(25650, 0), lt(25650, 150), lt(25650, 300), lt(26100, 0),
        lt(26100, 150), lt(26100, 300), lt(26550, 0), lt(26550, 150), lt(26550, 300), lt(27000, 0),
        lt(27000, 150), lt(27000, 300), lt(27450, 0), lt(27450, 150), lt(27450, 300), lt(27900, 0),
        lt(27900, 150), lt(27900, 300), lt(28350, 0), lt(28350, 150), lt(28350, 300), lt(28800, 0),
        lt(28800, 150), lt(28800, 300), lt(29250, 0), lt(29250, 150), lt(29250, 300), lt(29700, 0),
        lt(29700, 150), lt(29700, 300), lt(30150, 0), lt(30150, 150), lt(30150, 300), lt(30600, 0),
        lt(30600, 150), lt(30600, 300), lt(31050, 0), lt(31050, 150), lt(31050, 300), lt(31500, 0),
        lt(31500, 150), lt(31500, 300), lt(31950, 0), lt(31950, 150), lt(31950, 300), lt(32400, 0),
        lt(32400, 150), lt(32400, 300), lt(32850, 0), lt(32850, 150), lt(32850, 300), lt(33300, 0),
        lt(33300, 150), lt(33300, 300), lt(33750, 0), lt(33750, 150), lt(33750, 300), lt(34200, 0),
        lt(34200, 150), lt(34200, 300), lt(34650, 0), lt(34650, 150), lt(34650, 300), lt(35100, 0),
        lt(35100, 150), lt(35100, 300), lt(35550, 0), lt(35550, 150), lt(35550, 300), lt(36000, 0),
        lt(36000, 150), lt(36000, 300), lt(36450, 0), lt(36450, 150), lt(36450, 300), lt(36900, 0),
        lt(36900, 150), lt(36900, 300), lt(37350, 0), lt(37350, 150), lt(37350, 300), lt(37800, 0),
        lt(37800, 150), lt(37800, 300), lt(38250, 0), lt(38250, 150), lt(38250, 300), lt(38700, 0)
    ];

    var itemData = {
        offsetWidth: 400,
        offsetHeight: 100
    };

    var currentStyle = {
        marginLeft: 10,
        marginTop: 20,
        marginBottom: 30,
        marginRight: 40
    };

    var containerStyle = {
        paddingLeft: 10,
        paddingTop: 20,
        paddingBottom: 30,
        paddingRight: 40,

        borderTopWidth: 0,
        borderBottomWidth: 0
    };

    var Constants = {
        rows: 3
    };

    function makeGrid(data, viewport, dir) {
        dir = dir || "ltr";
        var containerElement = H.getMockContainerElement(dir, containerStyle),
            nodeFactory = H.makeNodeFactory(itemData, currentStyle, dir);

        var grid = G.createGrid({
            items: data,
            factories: { "nameGrouping": nodeFactory, "person": nodeFactory },
            canonicalType: "person",
            jobSet: new MockJobSet(),
            viewport: viewport,
            containerElement: containerElement
        });
        // turn off synchronous DOM validation
        grid._isValidateDomScheduled = true;
        grid._isActiveElement = H.isActiveElement;
        viewport.registerSection(grid, containerElement);
        // add aria divs for layout
        var layout = grid._layout;
        layout._ariaFlowStart = H.getMockItemElement({}, {});
        layout._ariaFlowEnd = H.getMockItemElement({}, {});
        return grid;
    }

    var setup = H.setUp;
    var cleanup = H.tearDown;

    Tx.test("VirtualizedGrid_UnitTest.testWidth", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var sampleCollection = P.makeTestCollection(sampleData),
            viewportElement = H.getMockViewportElement();

        var vg = makeGrid(sampleCollection, new P.MockViewport(viewportElement, O.horizontal));

        tc.areEqual(Constants.rows, vg._layout.getRows());

        // There should be 86 columns of 450px each
        tc.areEqual(vg._layout._scrollableExtent, 450 * 87);
    });
    //this.testWidth["Owner"] = "neilpa";
    //this.testWidth["Priority"] = "0";

    Tx.test("VirtualizedGrid_UnitTest.testPlacement", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var sampleCollection = P.makeTestCollection(sampleData),
            viewportElement = H.getMockViewportElement(),
            viewport = new P.MockViewport(viewportElement, O.horizontal);

        var vg = makeGrid(sampleCollection, viewport);

        // Scroll all the way to end, validating each nodes position along the way
        do {
            viewport.onScroll(null);

            vg._cells.forEach(function (cell, i) {
                var node = cell.node,
                    elemStyle = node.getElement().style,
                    data = node.getHandler()._data,
                    text = data.calculatedUIName || data,
                    expectedPosition = ltrPlacements[dataAndHeaders.indexOf(text)];
                tc.areEqual(expectedPosition.left, parseInt(elemStyle.left));
                tc.areEqual(expectedPosition.top, parseInt(elemStyle.top));
            });
            viewportElement.scrollLeft += viewportElement.clientWidth;
        } while (viewportElement.scrollLeft - viewportElement.clientWidth < vg._layout._scrollableExtent);
    });
  
    Tx.test("VirtualizedGrid_UnitTest.testDynamicUpdates", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var addClass = Jx.addClass;
        var hasClass = Jx.hasClass;
        Jx.addClass = Jx.fnEmpty;
        Jx.hasClass = Jx.fnEmpty;
        var collections = P.makeTestCollectionEx(sampleData),
            sampleCollection = collections.collection,
            platformCollections = collections.platformCollections,
            viewportElement = H.getMockViewportElement(),
            viewport = new P.MockViewport(viewportElement, O.horizontal);

        var vg = makeGrid(sampleCollection, viewport);
        vg._reflow._completeAnimation = function () { this._grid.onAnimationComplete(); };

        viewport.onScroll(null);

        tc.isTrue(H.arraysEqual(
            [0, 27, 54, 79, 103, 126, 148, 169, 189, 208, 226, 243, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259],
            vg._groupGridIndices));

        var oldLength = vg._cells.length;
        var newItem = { objectId: Jx.uid(), calculatedUIName: "ACA" };
        var groupA = platformCollections[0];

        groupA.mock$addItem(newItem, 3);

        // We should have added one cell falling outside the view, but within the recycling bounds (the create but don't recycle zone).
        tc.areEqual(oldLength + 1, vg._cells.length);
        tc.areEqual(newItem, vg._cells[4].node._handler._data);

        tc.isTrue(H.arraysEqual(
            [0, 28, 54, 79, 103, 126, 148, 169, 189, 208, 226, 243, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259],
            vg._groupGridIndices));

        // Assert the nodes maintain the same order
        vg._cells.slice(1, groupA.count).forEach(function (cell, i) {
            tc.areEqual(groupA.item(i), cell.node._handler._data);
        });

        // scroll over to near the B's so we'll have them in vg._cells
        viewportElement.scrollLeft += (viewportElement.clientWidth * 4);
        viewport.onScroll(null);

        // Adding another new A would orphan 'B', verify this happens
        var azz = { objectId: Jx.uid(), calculatedUIName: "AZZ" };
        oldLength = vg._cells.length;
        groupA.mock$addItem(azz, groupA.count);

        // The start of B's should bump up by 2 and other similar adjustments for the groups following
        tc.isTrue(H.arraysEqual(
            [0, 30, 57, 82, 106, 129, 151, 172, 192, 211, 229, 246, 262, 262, 262, 262, 262, 262, 262, 262, 262, 262, 262, 262, 262, 262, 262],
            vg._groupGridIndices));

        // We should have a net loss of 1 node since 2 moved to an
        // out-of-bounds column ('B' header and first B node) and
        // only inserted one 'A' node.
        tc.areEqual(oldLength - 1, vg._cells.length);
        var newNode = vg._cells[13];
        tc.areEqual(azz, newNode.node._handler._data);
        tc.areEqual(28, newNode.gridIndex);

        vg._cells.forEach(function (cell) {
            tc.isTrue(cell.gridIndex >= vg._minGridIndexView &&
                                   cell.gridIndex <= vg._maxGridIndexView);
        });

        // Assert the nodes maintain the same order
        vg._cells.slice(0, 13).forEach(function (cell, i) {
            tc.areEqual(this._items[i + 14], cell.node._handler._data);
        }, groupA);

        // Remove "azz"
        groupA.mock$removeItem(groupA.count - 1);

        tc.isTrue(H.arraysEqual(
            [0, 28, 54, 79, 103, 126, 148, 169, 189, 208, 226, 243, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259],
            vg._groupGridIndices));

        tc.areEqual(vg._cells[13].node._handler._data, "B");

        // Remove an item not showing, but to the left, and ensure we reflect it
        groupA.mock$removeItem(0);

        tc.isTrue(H.arraysEqual(
            [0, 27, 54, 79, 103, 126, 148, 169, 189, 208, 226, 243, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259, 259],
            vg._groupGridIndices));
        Jx.addClass = addClass;
        Jx.hasClass = hasClass;
    });
  
    Tx.test("VirtualizedGrid_UnitTest.testAssert", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var sampleCollection = P.makeTestCollection(sampleData),
            viewportElement = H.getMockViewportElement(),
            viewport = new P.MockViewport(viewportElement, O.horizontal);

        var vg = makeGrid(sampleCollection, viewport);

        viewportElement.scrollLeft = 450 * 86;
        viewport.onScroll(null);
        viewportElement.scrollLeft = 450 * 89;
        viewport.onScroll(null);
        viewportElement.scrollLeft = 450 * 87;
        viewport.onScroll(null);
    });
 
    function MockKeyEvent(key) { this.key = key; }
    MockKeyEvent.prototype.preventDefault = function () { };

    var leftKey = new MockKeyEvent("Left"),
        upKey = new MockKeyEvent("Up"),
        rightKey = new MockKeyEvent("Right"),
        downKey = new MockKeyEvent("Down");

    function verifyAriaFlowTo(tc, nodes) {
        nodes.reduce(function (prev, next) {
            tc.areEqual(next.node._element.id, prev.node._element["aria-flowto"]);
            return next;
        });

        var lastFlowTo = nodes[nodes.length - 1].node._element["aria-flowto"];
        tc.isTrue(lastFlowTo === "" || lastFlowTo === undefined);
    }

    Tx.test("VirtualizedGrid_UnitTest.testKeyboardNavigation", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var sampleCollection = P.makeTestCollection(sampleData),
            viewportElement = H.getMockViewportElement(),
            viewport = new P.MockViewport(viewportElement, O.horizontal),
            vg = makeGrid(sampleCollection, viewport);


        viewportElement.scrollLeft = 0;
        viewport.onScroll();

        Debug.call(function() {
            vg._isValidateDomScheduled = false;
            vg._validateDom();
            vg._isValidateDomScheduled = true;
        });

        // Verify the first node is keyboard "focus-able".
        tc.areEqual(0, vg._focusedCell.gridIndex);

        // Start focus on the first node.
        H.DomFocus.activeElement = vg._focusedCell.node.getElement();

        // Verify focus stays there, when the user keeps pressing left or up
        vg._keyNavigation._listener(leftKey);
        tc.areEqual(0, vg._focusedCell.gridIndex);
        tc.areEqual(H.DomFocus.activeElement, vg._cells[0].node._element);

        vg._keyNavigation._listener(upKey);
        tc.areEqual(0, vg._focusedCell.gridIndex);
        tc.areEqual(H.DomFocus.activeElement, vg._cells[0].node._element);

        // Going right should move focus forward a column.
        vg._keyNavigation._listener(rightKey);
        tc.areEqual(3, vg._focusedCell.gridIndex);
        tc.areEqual(H.DomFocus.activeElement, vg._cells[3].node._element);

        // Going down should move focus down a row.
        vg._keyNavigation._listener(downKey);
        tc.areEqual(4, vg._focusedCell.gridIndex);
        tc.areEqual(H.DomFocus.activeElement, vg._cells[4].node._element);

        // Going down should move focus back a column.
        vg._keyNavigation._listener(leftKey);
        tc.areEqual(1, vg._focusedCell.gridIndex);
        tc.areEqual(H.DomFocus.activeElement, vg._cells[1].node._element);

        verifyAriaFlowTo(tc, vg._cells);

        var priorFocusedNode = vg._focusedCell;

        // Scroll far to the right - Roughly simulates tabbing over to a section to the right
        viewportElement.scrollLeft = 450 * 86;
        viewport.onScroll();

        Debug.call(function() {
            vg._isValidateDomScheduled = false;
            vg._validateDom();
        });

        // Verify we still have the focused node
        tc.areEqual(priorFocusedNode, vg._focusedCell);
        verifyAriaFlowTo(tc, vg._cells);
    });
 
    Tx.test("VirtualizedGrid_UnitTest.testScrollItemIntoView", function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.cleanup = cleanup;
        setup();
        var sampleCollection = P.makeTestCollection(sampleData),
            viewportElement = H.getMockViewportElement(),
            viewport = new P.MockViewport(viewportElement, O.horizontal),
            vg = makeGrid(sampleCollection, viewport);

        viewportElement.scrollLeft = 0;
        viewport.onScroll();

        // Verify the first node is keyboard "focus-able".
        tc.areEqual(0, vg._focusedCell.gridIndex);

        // Start focus on the first node.
        H.DomFocus.activeElement = vg._focusedCell.node.getElement();

        // Verify focus changes with a call to focusItem
        vg.scrollItemIntoView(1, 1);
        tc.areEqual(29, vg._focusedCell.gridIndex);
        tc.areEqual(H.DomFocus.activeElement, vg._focusedCell.node._element);

    });

});




