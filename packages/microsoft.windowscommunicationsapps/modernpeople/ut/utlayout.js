
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People,MockJobSet,layoutUnitTest*/

Include.initializeFileScope(function () {

    var P = People,
        O = P.Orientation,
        G = P.Grid,
        H = P.GridUTHelpers;

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

        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0
    };

    var placements = { };
    placements[O.horizontal] = {
        ltr: [ H.lt(0, 0), H.lt(0, 150), H.lt(0, 300), H.lt(450, 0), H.lt(450, 150), H.lt(450, 300),
               H.lt(900, 0), H.lt(900, 150), H.lt(900, 300), H.lt(1350, 0), H.lt(1350, 150), H.lt(1350, 300) ],
        rtl: [ H.rt(0, 0), H.rt(0, 150), H.rt(0, 300), H.rt(450, 0), H.rt(450, 150), H.rt(450, 300), 
               H.rt(900, 0), H.rt(900, 150), H.rt(900, 300), H.rt(1350, 0), H.rt(1350, 150), H.rt(1350, 300) ]
    };

    placements[O.vertical] = {
        ltr: [ H.lt(0, 0), H.lt(0, 150), H.lt(0, 300), H.lt(0, 450), H.lt(0, 600), H.lt(0, 750),
               H.lt(0, 900), H.lt(0, 1050), H.lt(0, 1200), H.lt(0, 1350), H.lt(0, 1500), H.lt(0, 1650) ],
        rtl: [ H.rt(0, 0), H.rt(0, 150), H.rt(0, 300), H.rt(0, 450), H.rt(0, 600), H.rt(0, 750),
               H.rt(0, 900), H.rt(0, 1050), H.rt(0, 1200), H.rt(0, 1350), H.rt(0, 1500), H.rt(0, 1650) ]
    };

    function createLayout(orientation, dir) {
        var viewport = new P.MockViewport(H.getMockViewportElement(), orientation),
            containerElement = H.getMockContainerElement(dir, containerStyle),
            layout = new G.Layout(viewport, containerElement, "person"),
            cellCreator = new G.CellCreator({
                containerElement: containerElement,
                jobSet: new MockJobSet(),
                layout: layout,
                uniqueGridId: "gridUT"
            }),
            nodeFactory = H.makeNodeFactory(itemData, currentStyle, dir),
            pooledCells = new G.PooledCells(cellCreator, { person: nodeFactory });
        cellCreator._gridNotifier = { 
            createCell: function (node,jobSet,pool,layout) { 
                return new G.Cell(node, jobSet, pool, layout); 
            }
        };
        layout.initialize(pooledCells, null /* no grid */);

        return layout;
    }

    layoutUnitTest = function () {
        this.containerStyle = containerStyle;
        var setup = H.setUp;
        var cleanup = H.tearDown;

        var orientations = { };
        orientations[O.horizontal] = "Horizontal";
        orientations[O.vertical] = "Vertical";

        [O.horizontal, O.vertical].forEach(function (orientation) {
            ["ltr","rtl"].forEach(function (dir) {
                Tx.test("layoutTests.test" + orientations[orientation] + dir, function (tc) {
                    this.cleanup = cleanup;
                    setup();
                    
                    var layout = createLayout(orientation, dir);
                    placements[orientation][dir].forEach(function (placement, i) {
                        var pool = layout._pooledCells.getPool(layout._canonicalType),
                            cell = pool.pop();

                        cell.gridIndex = i;
                        layout.positionCell(cell);

                        var eltStyle = cell.node.getElement().style;
                        for (var attr in placement) {
                            tc.areEqual(placement[attr], parseInt(eltStyle[attr]));
                        }
                        pool.push(cell);
                    });
                });
            }, this);
        }, this);
    };
    var test = new layoutUnitTest();

});
