
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//
/*global Mail,Jx,Tx,document,Jm*/

(function () {
    "use strict";

    var MockSelectionHandler = function (tc, initialSelection) {
        this.model = {
            _selectAll: false,
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            mockedType: Mail.SelectionModel,
            selectAll : function () {
                this._selectAll = true;
            },
            selection : function () {
                return initialSelection;
            },
            setSelection: function () { }
        };
        this._tc = tc;
        this.mockedType = Mail.SelectionHandler;
        this.isSelectionMode = false;
    };

    MockSelectionHandler.prototype = {
        startSelectionMode: function () {
            this.isSelectionMode = true;
            this._tc.target.updateSelectionMode();
        },
        exitSelectionMode : function () {
            this.isSelectionMode = false;
            this._tc.target.updateSelectionMode();
        }
    };

    var MockCollection = function (count) {
        this.count = count;
    };

    MockCollection.prototype = {
        addListener : Jx.fnEmpty,
        removeListener : Jx.fnEmpty,
        mockedType : Mail.TrailingItemCollection
    };

    function setup(tc, initialSelection, count) {
        // preserve globals
        tc.preserver = Jm.preserve(Jx, "res");
        Jx.res = {
            getString: function (id) { return id; }
        };


        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;
        checkbox.indeterminate = false;
        tc.host = checkbox;
        tc.handler = new MockSelectionHandler(tc, initialSelection);
        tc.collection = new MockCollection(count);
        tc.target = new Mail.SelectAllCheckBox(tc.host, tc.handler, tc.collection);
        tc.cleanup = function () {
            cleanup(tc);
        };
    }

    function cleanup(tc) {
        tc.preserver.restore();
        tc.host = null;
        tc.handler = null;
        tc.collection = null;
        tc.target = null;
    }

    function verifyUIAll(tc) {
        tc.isFalse(tc.host.indeterminate);
        tc.areEqual(tc.host.title, "mailSelectAllCheckboxTooltipSelectNone");
        tc.isTrue(tc.host.checked);
        tc.isFalse(tc.host.classList.contains("invisible"));

    }

    function verifyUINone(tc) {
        tc.areEqual(tc.host.title, "mailSelectAllCheckboxTooltipSelectAll");
        tc.isFalse(tc.host.indeterminate);
        tc.isFalse(tc.host.checked);
        tc.isFalse(tc.host.classList.contains("invisible"));
    }

    function clickCheckBox(tc) {
        tc.host.checked = !tc.host.checked;
        tc.target._onCheckboxClicked();
    }

    Tx.test("SelectAllCheckBox_UnitTest.test_UIVisual_all", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, [0, 1, 3], 3);
        verifyUIAll(tc);
    });

    Tx.test("SelectAllCheckBox_UnitTest.test_UIVisual_none", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, [], 3);
        verifyUINone(tc);
    });

    Tx.test("SelectAllCheckBox_UnitTest.test_collectionChanged_all2Some", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, [0, 1, 2], 3);
        verifyUIAll(tc);
        tc.collection.count = 7;
        tc.target._update();
        verifyUINone(tc);
    });

    Tx.test("SelectAllCheckBox_UnitTest.test_selectionChanged", { owner: "kepoon", priority: 0 }, function (tc) {
        // all to some
        setup(tc, [0, 1, 3], 3);
        verifyUIAll(tc);
        tc.handler.model.selection = function () { return [0, 1]; };
        tc.target._update();
        verifyUINone(tc);

        // some to all
        cleanup(tc);
        setup(tc, [0, 1], 3);
        verifyUINone(tc);
        tc.handler.model.selection = function () { return [0, 1, 2]; };
        tc.target._update();
        verifyUIAll(tc);
    });

    Tx.test("SelectAllCheckBox_UnitTest.test_clickEmpty", { owner: "kepoon", priority: 0 }, function (tc) {
        // select all should be invoked
        setup(tc, [0, 1, 2], 10);
        verifyUINone(tc);
        clickCheckBox(tc);
        tc.isTrue(tc.handler.model._selectAll, "clicking on the checkbox in the partial state should select all");
        tc.isTrue(tc.handler.isSelectionMode, "clicking on the checkbox in the checked state should exit selection mode");

    });

    Tx.test("SelectAllCheckBox_UnitTest.test_clickAll", { owner: "kepoon", priority: 0 }, function (tc) {
        // select all should be invoked
        setup(tc, [0, 1, 2], 3);
        verifyUIAll(tc);
        clickCheckBox(tc);
        tc.isFalse(tc.handler.isSelectionMode, "clicking on the checkbox in the checked state should exit selection mode");
    });

    Tx.test("SelectAllCheckBox_UnitTest.test_emptyFolder", { owner: "kepoon", priority: 0 }, function (tc) {
        // select all should be invoked
        setup(tc, [], 0);
        tc.isTrue(tc.host.classList.contains("invisible"));
    });

    Tx.test("SelectAllCheckBox_UnitTest.test_singleItemFolder", { owner: "kepoon", priority: 0 }, function (tc) {
        // select all should be invoked
        setup(tc, [0], 1);
        verifyUINone(tc);
        tc.handler.startSelectionMode();
        verifyUIAll(tc);
    });
})();