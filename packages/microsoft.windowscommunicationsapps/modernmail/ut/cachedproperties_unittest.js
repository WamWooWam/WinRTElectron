
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {

    Tx.test("CachedProperties_UnitTest.test_CachedProperties", function (tc) {
        var base = {
                x: "abcdefghi",
                y: 123456,
                z: {
                    abc: "something",
                    def: "not the same thing"
                }
            },
            calcComplexXCalls = 0,
            calcComplexYCalls = 0,
            calcComplexZCalls = 0,
            calcComplexX = function () {
                calcComplexXCalls++;
                var result = "";
                for (var ii = this.x.length; ii--;) {
                    result += this.x[ii];
                }
                return result;
            },
            calcComplexY = function () {
                calcComplexYCalls++;
                return this.y * -1;
            },
            calcComplexZ = function () {
                calcComplexZCalls++;
                return {
                    a: this.z.def,
                    b: this.z.abc
                };
            };
        var cache = new Mail.UIDataModel.CachedProperties(base);
        cache.add("x", "complexX", calcComplexX, base);
        cache.add("y", "complexY", calcComplexY, base);
        cache.add("z", "complexZ", calcComplexZ, base);

        // Initializing the properties should not evaluate them
        tc.isTrue(calcComplexXCalls === 0);
        tc.isTrue(calcComplexYCalls === 0);
        tc.isTrue(calcComplexZCalls === 0);

        // Validate the right value is returned
        tc.isTrue(cache.get("complexX") === "ihgfedcba");
        tc.isTrue(cache.get("complexY") === -123456);
        var complexZ = cache.get("complexZ");
        tc.isTrue(complexZ.a === base.z.def);
        tc.isTrue(complexZ.b === base.z.abc);
        tc.isTrue(Object.keys(complexZ).length === 2);

        // Validate that we only calculated each property once
        tc.isTrue(calcComplexXCalls === 1);
        tc.isTrue(calcComplexYCalls === 1);
        tc.isTrue(calcComplexZCalls === 1);

        // Validate the right value is returned a second time
        tc.isTrue(cache.get("complexX") === "ihgfedcba");
        tc.isTrue(cache.get("complexY") === -123456);
        complexZ = cache.get("complexZ");
        tc.isTrue(complexZ.a === base.z.def);
        tc.isTrue(complexZ.b === base.z.abc);
        tc.isTrue(Object.keys(complexZ).length === 2);

        // Validate that we STILL only calculated each property once
        tc.isTrue(calcComplexXCalls === 1);
        tc.isTrue(calcComplexYCalls === 1);
        tc.isTrue(calcComplexZCalls === 1);

        // Change the base values
        base.x = "abc";
        base.y = 654321;
        base.z = {
            abc: "something",
            def: "not the same thing"
        };

        // Validate the right value is returned based on the new base values
        tc.isTrue(cache.get("complexX") === "cba");
        tc.isTrue(cache.get("complexY") === -654321);
        complexZ = cache.get("complexZ");
        tc.isTrue(complexZ.a === base.z.def);
        tc.isTrue(complexZ.b === base.z.abc);
        tc.isTrue(Object.keys(complexZ).length === 2);

        // Validate that we have only calculated each property twice
        tc.isTrue(calcComplexXCalls === 2);
        tc.isTrue(calcComplexYCalls === 2);
        tc.isTrue(calcComplexZCalls === 2);
    });

})();
