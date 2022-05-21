
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Allow for override of global components
(function () {

    // Mark Debug to throw errors rather than attempt a debug dialog
    Debug.throwOnAssert = true;

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    var emptyStack, emptyStackUndoUnit, emptyStackRedoUnit;
    var fullStack, fullStackUndoUnit, fullStackRedoUnit;
    var badStack, badStackUndoUnit, badStackRedoUnit;

    function setup(tc) {
        emptyStack = new UndoRedo.Stack();
        emptyStackUndoUnit = {
            execute: function () {
                emptyStackUndoUnit.executeCalled = true;
                emptyStack.add(emptyStackRedoUnit);
            },
            endUnit: function () {
                emptyStackUndoUnit.ended = true;
            }
        };
        emptyStackRedoUnit = {
            execute: function () {
                emptyStackRedoUnit.executeCalled = true;
                emptyStack.add(emptyStackUndoUnit);
            },
            endUnit: function () {
                emptyStackRedoUnit.ended = true;
            }
        };

        // Set these to a known value.
        emptyStackUndoUnit.executeCalled = false;
        emptyStackUndoUnit.ended = false;
        emptyStackRedoUnit.executeCalled = false;
        emptyStackRedoUnit.ended = false;

        fullStack = new UndoRedo.Stack();
        fullStackUndoUnit = {
            execute: function () {
                fullStackUndoUnit.executeCalled = true;
                fullStack.add(fullStackRedoUnit);
            },
            endUnit: function () {
                fullStackUndoUnit.ended = true;
            }
        };
        fullStackRedoUnit = {
            execute: function () {
                fullStackRedoUnit.executeCalled = true;
                fullStack.add(fullStackUndoUnit);
            },
            endUnit: function () {
                fullStackRedoUnit.ended = true;
            }
        };

        // Fill the undo/redo stack with 6 units, then undo 3 times so that there are 3 undo units on the undo stack and 3 redo units on the redo stack.
        fullStack.add(fullStackUndoUnit);
        fullStack.add(fullStackUndoUnit);
        fullStack.add(fullStackUndoUnit);
        fullStack.add(fullStackUndoUnit);
        fullStack.add(fullStackUndoUnit);
        fullStack.add(fullStackUndoUnit);
        fullStack.undo();
        fullStack.undo();
        fullStack.undo();

        // Make sure these get reset since after adding them onto the fullStack.
        fullStackUndoUnit.executeCalled = false;
        fullStackUndoUnit.ended = false;
        fullStackRedoUnit.executeCalled = false;
        fullStackRedoUnit.ended = false;

        badStack = new UndoRedo.Stack();
        badStackUndoUnit = {
            execute: function () {
                badStackUndoUnit.executeCalled = true;
                badStack.add(badStackThrowingRedoUnit);
            },
            endUnit: function () {
                badStackUndoUnit.ended = true;
            }
        };
        badStackThrowingUndoUnit = {
            execute: function () {
                badStackUndoUnit.executeCalled = true;
                badStack.add(badStackRedoUnit);
                throw new Error("Bad undo unit");
            },
            endUnit: function () {
                badStackUndoUnit.ended = true;
            }
        };
        badStackRedoUnit = {
            execute: function () {
                badStackRedoUnit.executeCalled = true;
                badStack.add(badStackThrowingUndoUnit);
            },
            endUnit: function () {
                badStackRedoUnit.ended = true;
            }
        };
        badStackThrowingRedoUnit = {
            execute: function () {
                badStackRedoUnit.executeCalled = true;
                badStack.add(badStackUndoUnit);
                throw new Error("Bad redo unit");
            },
            endUnit: function () {
                badStackRedoUnit.ended = true;
            }
        };

        // Fill the undo/redo stack with four units, then undo twice so that there are two undo units on the undo stack and two redo units on the redo stack.
        badStack.add(badStackThrowingUndoUnit);
        badStack.add(badStackThrowingUndoUnit);
        badStack.add(badStackUndoUnit);
        badStack.add(badStackUndoUnit);
        badStack.undo();
        badStack.undo();

        // Make sure these get reset since after adding them onto the fullStack.
        badStackUndoUnit.executeCalled = false;
        badStackUndoUnit.ended = false;
        badStackThrowingUndoUnit.executeCalled = false;
        badStackThrowingUndoUnit.ended = false;
        badStackRedoUnit.executeCalled = false;
        badStackRedoUnit.ended = false;
        badStackThrowingRedoUnit.executeCalled = false;
        badStackThrowingRedoUnit.ended = false;
    };

    var opt = {
        owner: "widuff",
        priority: "0"
    };

    Tx.test("UndoRedo.testEmptyStackReturnsEmptyUndoRedoStacks", opt, function (tc) {
        setup(tc);

        tc.areEqual(0, emptyStack.getUndoStack().length, "Expected undo stack to be empty");
        tc.areEqual(0, emptyStack.getRedoStack().length, "Expected redo stack to be empty");
    });

    Tx.test("UndoRedo.testAddUnitToStackInBaseState", opt, function (tc) {
        setup(tc);

        emptyStack.add(emptyStackUndoUnit);

        var undoStack = emptyStack.getUndoStack();
        tc.areEqual(1, undoStack.length, "Expected undo stack to contain one unit");
        tc.areEqual(emptyStackUndoUnit, undoStack.pop(), "Expected undo unit to be added to undo stack");
    });

    Tx.test("UndoRedo.testAddSecondUnitToStackInBaseStateCallsEndUnit", opt, function (tc) {
        setup(tc);

        emptyStack.add(emptyStackUndoUnit);
        tc.isFalse(emptyStackUndoUnit.ended, "Expected undo unit to NOT be ended");

        emptyStack.add(emptyStackUndoUnit);
        tc.isTrue(emptyStackUndoUnit.ended, "Expected undo unit to be ended");
    });

    Tx.test("UndoRedo.testAddUnitToStackInUndoStateAddsToRedoStack", opt, function (tc) {
        setup(tc);

        emptyStack.add(emptyStackUndoUnit);

        // During the undo, the undoUnit implicitly adds redoUnit to the stack.
        emptyStack.undo();

        var undoStack = emptyStack.getUndoStack();
        tc.areEqual(0, undoStack.length, "Expected undo stack to be empty");

        var redoStack = emptyStack.getRedoStack();
        tc.areEqual(1, redoStack.length, "Expected redo stack to contain one unit");
        tc.areEqual(emptyStackRedoUnit, redoStack.pop(), "Expected redo unit to be added to redo stack");
    });

    Tx.test("UndoRedo.testAddSecondUnitToStackInUndoStateCallsEndUnit", opt, function (tc) {
        setup(tc);

        emptyStack.add(emptyStackUndoUnit);
        emptyStack.add(emptyStackUndoUnit);

        // During the undo, the undoUnit implicitly adds redoUnit to the stack.
        emptyStack.undo();
        tc.isFalse(emptyStackRedoUnit.ended, "Expected redo unit to NOT be ended");

        emptyStack.undo();
        tc.isTrue(emptyStackRedoUnit.ended, "Expected redo unit to be ended");
    });

    Tx.test("UndoRedo.testAddUnitToStackInRedoStateAddsToUndoStack", opt, function (tc) {
        setup(tc);

        emptyStack.add(emptyStackUndoUnit);

        // During the undo, the undoUnit implicitly adds redoUnit to the stack.
        emptyStack.undo();

        // During the redo, the redoUnit implicitly adds undoUnit to the stack.
        emptyStack.redo();

        var undoStack = emptyStack.getUndoStack();
        tc.areEqual(1, undoStack.length, "Expected undo stack to contain one unit");
        tc.areEqual(emptyStackUndoUnit, undoStack.pop(), "Expected undo unit to be added to undo stack");

        var redoStack = emptyStack.getRedoStack();
        tc.areEqual(0, redoStack.length, "Expected redo stack to be empty");
    });

    Tx.test("UndoRedo.testAddSecondUnitToStackInRedoStateCallsEndUnit", opt, function (tc) {
        setup(tc);

        emptyStack.add(emptyStackUndoUnit);
        emptyStack.add(emptyStackUndoUnit);

        // During the undo, the undoUnit implicitly adds redoUnit to the stack.
        emptyStack.undo();
        emptyStack.undo();

        // During the undo, the undoUnit implicitly adds redoUnit to the stack.
        emptyStack.redo();

        // The undoUnit was ended on the second line of this test, but reset it here just before it should be ended again.
        emptyStackUndoUnit.ended = false;

        emptyStack.redo();
        tc.isTrue(emptyStackUndoUnit.ended, "Expected undo unit to be ended");
    });

    Tx.test("UndoRedo.testClearClearsUndoAndRedoStacks", opt, function (tc) {
        setup(tc);

        fullStack.clear();

        tc.areEqual(0, fullStack.getUndoStack().length, "Expected undo stack to be empty");
        tc.areEqual(0, fullStack.getRedoStack().length, "Expected redo stack to be empty");
    });

    Tx.test("UndoRedo.testClearUndoOnlyClearsUndoStack", opt, function (tc) {
        setup(tc);

        fullStack.clearUndo();

        tc.areEqual(0, fullStack.getUndoStack().length, "Expected undo stack to be empty");
        tc.areEqual(3, fullStack.getRedoStack().length, "Expected redo stack to contain three units");
    });

    Tx.test("UndoRedo.testClearRedoOnlyClearsRedoStack", opt, function (tc) {
        setup(tc);

        fullStack.clearRedo();

        tc.areEqual(3, fullStack.getUndoStack().length, "Expected undo stack to contain three units");
        tc.areEqual(0, fullStack.getRedoStack().length, "Expected redo stack to be empty");
    });

    Tx.test("UndoRedo.testUndoCallsDoOnUndoUnit", opt, function (tc) {
        setup(tc);

        tc.isFalse(fullStackUndoUnit.executeCalled, "Expected undoUnit.execute() to not have been called yet");
        fullStack.undo();
        tc.isTrue(fullStackUndoUnit.executeCalled, "Expected undo stack call undoUnit.execute()");
    });

    Tx.test("UndoRedo.testRedoCallsDoOnRedoUnit", opt, function (tc) {
        setup(tc);

        tc.isFalse(fullStackRedoUnit.executeCalled, "Expected redoUnit.execute() to not have been called yet");
        fullStack.redo();
        tc.isTrue(fullStackRedoUnit.executeCalled, "Expected undo stack call redoUnit.execute()");
    });

    Tx.test("UndoRedo.testUndoDoesNotThrowExceptionOnEmptyStack", opt, function (tc) {
        setup(tc);

        emptyStack.undo();
    });

    Tx.test("UndoRedo.testRedoDoesNotThrowExceptionOnEmptyStack", opt, function (tc) {
        setup(tc);

        emptyStack.redo();
    });

    Tx.test("UndoRedo.testUndoAttemptsRollbackWhenUndoUnitThrowsException", opt, function (tc) {
        setup(tc);

        tc.isFalse(badStackRedoUnit.executeCalled, "Expected badStackRedoUnit.execute() to not have been called yet");

        tc.expectException( function () {
            // During the undo, the badStackThrowingUndoUnit implicitly adds badStackRedoUnit to the stack.
            badStack.undo();
            tc.error("Expected badStack.undo() to throw exception");
        });
    });

    Tx.test("UndoRedo.testRedoAttemptsRollbackWhenRedoUnitThrowsException", opt, function (tc) {
        setup(tc);

        tc.isFalse(badStackUndoUnit.executeCalled, "Expected badStackUndoUnit.execute() to not have been called yet");
        tc.expectException(function () {
            // During the redo, the badStackThrowingRedoUnit implicitly adds badStackUndoUnit to the stack.
            badStack.redo();
            tc.error("Expected badStack.redo() to throw exception");
        });
    });

    Tx.test("UndoRedo.testUndoAndRedoStacksAreClearedWhenUndoUnitThrowsException", opt, function (tc) {
        setup(tc);

        tc.areEqual(2, badStack.getUndoStack().length, "Expected undo stack to contain two units");
        tc.areEqual(2, badStack.getRedoStack().length, "Expected redo stack to contain two units");

        try {
            badStack.undo();
            tc.error("Expected badStack.undo() to throw exception");
        } catch (ex) {
            tc.areEqual(0, badStack.getUndoStack().length, "Expected undo stack to be empty");
            tc.areEqual(0, badStack.getRedoStack().length, "Expected redo stack to be empty");
        }
    });

    Tx.test("UndoRedo.testUndoAndRedoStacksAreClearedWhenRedoUnitThrowsException", opt, function (tc) {
        setup(tc);

        tc.areEqual(2, badStack.getUndoStack().length, "Expected undo stack to contain two units");
        tc.areEqual(2, badStack.getRedoStack().length, "Expected redo stack to contain two units");

        try {
            badStack.redo();
            tc.error("Expected badStack.redo() to throw exception");
        } catch (ex) {
            tc.areEqual(0, badStack.getUndoStack().length, "Expected undo stack to be empty");
            tc.areEqual(0, badStack.getRedoStack().length, "Expected redo stack to be empty");
        }
    });

})();
