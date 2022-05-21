
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global ModernCanvas,Jx,Tx*/
(function() {
    var img,
        imgResize,
        screenX,
        screenY;

    function setUp() {
        img = {
            style: {
                width: "100px",
                height: "50px"
            },
            getAttribute: Jx.fnEmpty,
            setAttribute: Jx.fnEmpty,
            removeAttribute: Jx.fnEmpty
        };

        Object.defineProperty(img, "width", {
            get: function() {
                return Number(this.style.width.replace("px", ""));
            }
        });

        Object.defineProperty(img, "height", {
            get: function() {
                return Number(this.style.height.replace("px", ""));
            }
        });

        imgResize = new ModernCanvas.Plugins.ImageResize();
        imgResize._pointerCaptured = true;
        imgResize._image = img;
        imgResize._canvasElement = {
            msSetPointerCapture: function () { },
            msReleasePointerCapture: function () { }
        };

        screenX = 50;
        screenY = 50;
    }

    function tearDown() {
        img = null;
    }

    function makePointerMoveEvent(dx, dy, shiftKey) {
        screenX += dx;
        screenY += dy;

        return {
            screenX: screenX,
            screenY: screenY,
            shiftKey: Jx.isBoolean(shiftKey) ? shiftKey : false
        };
    }

    var opt = {
        owner: "andrha",
        priority: "0"
    };

    opt.description = "Test that the base functionality works";
    Tx.test("ImageResize.baseTest", opt, function(tc) {
        tc.tearDown = tearDown;
        setUp();

        // The first pointer move event is ignored
        imgResize._onPointerMove(makePointerMoveEvent(2, 2));
        imgResize._onPointerMove(makePointerMoveEvent(2, 2));

        tc.areEqual(img.style.height, "52px");
        tc.areEqual(img.style.width, "104px");
    });

    opt.description = "Test that the functionality works when x is moved more than y";
    Tx.test("ImageResize.moveX", opt, function(tc) {
        tc.tearDown = tearDown;
        setUp();

        imgResize._onPointerMove(makePointerMoveEvent(2, 2));
        imgResize._onPointerMove(makePointerMoveEvent(20, 2));

        tc.areEqual(img.style.height, "60px");
        tc.areEqual(img.style.width, "120px");
    });

    opt.description = "Test that the functionality works when y is moved more than x";
    Tx.test("ImageResize.moveY", opt, function(tc) {
        tc.tearDown = tearDown;
        setUp();

        imgResize._onPointerMove(makePointerMoveEvent(2, 2));
        imgResize._onPointerMove(makePointerMoveEvent(2, 20));

        tc.areEqual(img.style.height, "70px");
        tc.areEqual(img.style.width, "140px");
    });
    
    opt.description = "Test that the greatest change is being used, not just the highest value, by using a negative x.";
    Tx.test("ImageResize.moveXNegative", opt, function(tc) {
        tc.tearDown = tearDown;
        setUp();

        imgResize._onPointerMove(makePointerMoveEvent(2, 2));
        imgResize._onPointerMove(makePointerMoveEvent(-20, 2));

        tc.areEqual(img.style.height, "40px");
        tc.areEqual(img.style.width, "80px");
    });

    opt.description = "Test that the greatest change is being used, not just the highest value, by using a negative y.";
    Tx.test("ImageResize.moveYNegative", opt, function (tc) {
        tc.tearDown = tearDown;
        setUp();

        imgResize._onPointerMove(makePointerMoveEvent(2, 2));
        imgResize._onPointerMove(makePointerMoveEvent(2, -20));

        tc.areEqual(img.style.height, "30px");
        tc.areEqual(img.style.width, "60px");
    });
    
    opt.description = "Test that if the height is 1 already, the size won't get smaller";
    Tx.test("ImageResize.testHeight1", opt, function (tc) {
        tc.tearDown = tearDown;
        setUp();
        
        img.style.height = "1px";
        
        imgResize._onPointerMove(makePointerMoveEvent(2, 2));
        imgResize._onPointerMove(makePointerMoveEvent(2, -20));
        
        tc.areEqual(img.style.height, "1px");
        tc.areEqual(img.style.width, "100px");
    });
    
    opt.description = "Test that if the width is 1 already, the width won't get smaller";
    Tx.test("ImageResize.testWidth1", opt, function (tc) {
        tc.tearDown = tearDown;
        setUp();
        
        img.style.width = "1px";
        
        imgResize._onPointerMove(makePointerMoveEvent(2, 2));
        imgResize._onPointerMove(makePointerMoveEvent(2, -20));
        
        tc.areEqual(img.style.width, "1px");
        tc.areEqual(img.style.height, "30px");
    });
    
    opt.description = "Test that if the shift key is held, resizing doesn't keep aspect ratio";
    Tx.test("ImageResize.testShiftResize", opt, function (tc) {
        tc.tearDown = tearDown;
        setUp();
        
        imgResize._onPointerMove(makePointerMoveEvent(2, 2, true));
        imgResize._onPointerMove(makePointerMoveEvent(2, -20, true));
        
        tc.areEqual(img.style.width, "102px");
        tc.areEqual(img.style.height, "30px");
    });

})();