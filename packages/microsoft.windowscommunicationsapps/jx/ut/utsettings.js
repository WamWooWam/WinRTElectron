
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/Settings.js" />

/*global Tx,Debug,Jx,Windows*/

(function () {

    // Verify that an assert fires.
    function verifyAssert(tc, fn) {
        if (Debug.hasOwnProperty("assert")) {
            var lastError;
            try {
                Debug.throwOnAssert = true;
                fn();
            }
            catch (e) {
                Debug.throwOnAssert = false;
                lastError = e;
            }
            tc.isTrue(lastError instanceof Debug.AssertError);
        }
    }

    // Ignore assert and execute fn().
    function ignoreAssertAndExec(fn) {
        if (Debug.hasOwnProperty("assert")) {
            var origAssert = Debug.assert;
            Debug.assert = Jx.fnEmpty;
            fn();
            Debug.assert = origAssert;
        } else {
            fn();
        }
    }

    // Execute fn() and verify that it throws an exception with a specific number
    function assertException(tc, fn, number) {
        var exNumber;
        try {
            fn();
        }
        catch (ex) {
            exNumber = ex.number;
        }
        tc.areEqual(exNumber, number);
    }

    // Test WWA Application
    Tx.test("SettingsTests.testWWAAppData", function (tc) {
        var ad = Windows.Storage.ApplicationData.current;
        tc.isTrue(Jx.isObject(ad), "ApplicationData.current is not an object");

        var ls = ad.localSettings;
        tc.isTrue(Jx.isObject(ls), "localSettings is not an object");

        var rs = ad.roamingSettings;
        tc.isTrue(Jx.isObject(rs), "roamingSettings is not an object");
    });

    // Test WWA Settings Container API
    Tx.test("SettingsTests.testWWAContainer", function (tc) {
        // $TODO handle roaming settings too
        var ls = Windows.Storage.ApplicationData.current.localSettings;
        var ADC = Windows.Storage.ApplicationDataCreateDisposition;
        var c, c2, len;

        // Log top level containers count
        len = ls.containers.size;
        tc.log("ls.containers.size=" + ls.containers.size);

        // Ensure that the "_testnonex" container doesn't exist
        assertException(tc, function () {
            c = ls.containers.lookup("_testnonex");
        }, -2147483637); // The operation attempted to access data outside the valid range

        // Delete non existing container
        ls.deleteContainer("_testnonex");

        // Create a non existing container using the "existing" flag
        assertException(tc, function () {
            c = ls.createContainer("_testnonex", ADC.existing);
        }, -2147020584); // The object identifier does not represent a valid object.

        // Create a new container
        c = ls.createContainer("_testc1", ADC.always);
        tc.areEqual(c.name, "_testc1");

        // Create it again
        c = ls.createContainer("_testc1", ADC.always);
        tc.areEqual(c.name, "_testc1");

        // Look it up
        c2 = ls.containers.lookup("_testc1");
        tc.areEqual(c2.name, "_testc1");

        // Delete it
        ls.deleteContainer("_testc1");

        // Verify that it was deleted
        assertException(tc, function () {
            c = ls.containers.lookup("_testc1");
        }, -2147483637); // The operation attempted to access data outside the valid range
    });

    // Validate WWA Settings API
    Tx.test("SettingsTests.testWWA", function (tc) {
        var ls = Windows.Storage.ApplicationData.current.localSettings;
        var ADC = Windows.Storage.ApplicationDataCreateDisposition;
        var v, c, now;

        // Create a test container
        c = ls.createContainer("_testc1", ADC.always);
        tc.areEqual(c.name, "_testc1");
        tc.areEqual(c.locality, Windows.Storage.ApplicationDataLocality.local);

        var values = c.values;

        // Invalid lookup arg
        assertException(tc, function () {
            v = values.lookup([]);
        }, -2147024735); // The specified path is invalid.

        // Invalid lookup arg
        assertException(tc, function () {
            v = values.lookup("");
        }, -2147024735); // The specified path is invalid.

        // Invalid lookup arg
        assertException(tc, function () {
            v = values.lookup();
        }, -2146823186); // lookup: function called with too few arguments

        // Get nonexisting value
        v = values.lookup("nonexisting");
        tc.areEqual(v, null);

        // Set/get int
        values.insert("val", 88);
        v = values.lookup("val");
        tc.areEqual(v, 88);

        // Set/get double
        values.insert("val", 5.5);
        v = values.lookup("val");
        tc.areEqual(v, 5.5);

        // Set/get string
        values.insert("val", "abc");
        v = values.lookup("val");
        tc.areEqual(v, "abc");

        // Set/get bool true
        values.insert("val", true);
        v = values.lookup("val");
        tc.areEqual(v, true);

        // Set/get bool false
        values.insert("val", false);
        v = values.lookup("val");
        tc.areEqual(v, false);

        now = new Date();
        values.insert("_testval", now);
        v = values.lookup("_testval");
        tc.isTrue(v instanceof Date);
        tc.areEqual(v.toString(), now.toString());
    });

    Tx.test("SettingsTests.testAppData", function (tc) {
        var a = new Jx.AppData();
        var ls = a.localSettings();

        // $TODO bug 426446 reenable roaming setting on PDC-0
        // var rs = a.roamingSettings();

        tc.isTrue(Jx.isObject(ls));
        tc.isTrue(ls instanceof Jx.AppDataContainer);

        // tc.isTrue(Jx.isObject(rs));
        // tc.isTrue(rs instanceof Jx.AppDataContainer);

        a.dispose();
    });

    Tx.test("SettingsTests.testAppDataContainer1", function (tc) {
        var ad = new Jx.AppData();
        var ls = ad.localSettings();
        var c1, c2;
        var vals;

        // Create container
        c1 = ls.createContainer("_test1");
        tc.isTrue(Jx.isObject(c1));
        tc.isTrue(c1 instanceof Jx.AppDataContainer);
        tc.isTrue(c1.isLocal());
        tc.isFalse(c1.isRoaming());

        // Get container
        c2 = ls.getContainer("_test1");
        tc.isTrue(Jx.isObject(c2));
        tc.isTrue(c2 instanceof Jx.AppDataContainer);
        tc.areEqual(c1.name(), c2.name());

        // Set/get value
        c1.set("v1", 77);
        tc.areEqual(c1.get("v1"), 77);

        // getValues
        vals = c1.getValues();
        tc.areEqual(vals.v1, 77);
        
        // Remove value
        c1.remove("v1");
        tc.areEqual(c1.get("v1"), null);
        tc.areEqual(vals.v1, undefined);

        // Create subcontainer
        c2 = c1.createContainer("_test2");
        tc.isTrue(Jx.isObject(c2));
        tc.isTrue(c2 instanceof Jx.AppDataContainer);

        // Set/get value
        c2.set("v1", "abc");
        tc.areEqual(c2.get("v1"), "abc");

        // Delete subcontainer
        c1.deleteContainer("_test2");
        c2 = c1.getContainer("_test2");
        tc.areEqual(c2, null);

        // $TODO setObject, getObject, setObjectInSegments, getObjectInSegments are only supported in WWA
        if (Jx.isWWA) {
            
            // Set/get object
            var objEmpty = {};
            tc.isTrue(c1.setObject("objEmpty", objEmpty));
            tc.areEqual(JSON.stringify(c1.getObject("objEmpty")), JSON.stringify(objEmpty));       

            var verifyObjectsAreEqual = function (obj1, obj2) {
                var verifyObj2ContainsObj1 = function (obj1, obj2) {
                    for (var i in obj1) {
                        if (!Jx.isObject(obj1[i])) {
                            tc.areEqual(obj1[i], obj2[i]);
                        }
                        else {
                            verifyObj2ContainsObj1(obj1[i], obj2[i]);
                        }
                    }
                };
                verifyObj2ContainsObj1(obj1, obj2);
                verifyObj2ContainsObj1(obj2, obj1);
            };

            // set object with property value of type string, number and boolean
            var obj1 = { a: 1, b: 2, c: { ca: "xxx", cb: 22, cc: true} };
            tc.isTrue(c1.setObject("obj1", obj1));
            verifyObjectsAreEqual(c1.getObject("obj1"), obj1);
 
            // set object again using the same name.
            var obj1new = { a: 11, b: { xx: "xxx", y: 0} };
            tc.isTrue(c1.setObject("obj1", obj1new));
            verifyObjectsAreEqual(c1.getObject("obj1"), obj1new);

            // get non-existed object returns null
            tc.areEqual(c1.getObject("notExist"), null);

            // set object with null property value
            var objNullValue1 = { a: null };
            tc.isTrue(c1.setObject("objNullValue1", objNullValue1));
            tc.areEqual(JSON.stringify(c1.getObject("objNullValue1")), JSON.stringify(objEmpty));       

            var objNullValue2 = { a: null, b: "xxx" };
            var objNullValue2Saved = { b: "xxx" };
            tc.isTrue(c1.setObject("objNullValue2", objNullValue2));
            verifyObjectsAreEqual(c1.getObject("objNullValue2"), objNullValue2Saved);

            // set object with undefined property value
            var objUndefinedValue = { a: undefined, b: "xxx" };
            var objUndefinedValueSaved = { b: "xxx" };
            tc.isTrue(c1.setObject("objUndefinedValue", objUndefinedValue));
            verifyObjectsAreEqual(c1.getObject("objUndefinedValue"), objUndefinedValueSaved);

            // set object with property value of invalid type(function) should fail
            var objFunctionValue = { a: function() {} };
            verifyAssert(tc, function () {
                c1.setObject("objFunctionValue", objFunctionValue);
            });
            ignoreAssertAndExec(function () {
                tc.isFalse(c1.setObject("objFunctionValue", objFunctionValue));
            });
            tc.areEqual(c1.getObject("objFunctionValue"), null);

            // Set/get long string value which uses nested container
            c1._setLongString("vl1", "12345678901", 5);
            tc.areEqual(c1._getLongString("vl1"), "12345678901");

            // Set/get long string value without using nested container
            c1._setLongString("vl2", "abcdefg");
            tc.areEqual(c1.get("vl2"), "abcdefg");
            tc.areEqual(c1._getLongString("vl2"), "abcdefg");

            // Set/get long string values
            var str100 = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
            var str1k = str100 + str100 + str100 + str100 + str100 + str100 + str100 + str100 + str100 + str100;
            c1._setLongString("vl1k", str1k);
            tc.areEqual(c1.get("vl1k"), str1k);
            tc.areEqual(c1._getLongString("vl1k"), str1k);

            var str5k = str1k + str1k + str1k + str1k + str1k;
            var str4095 = str5k.substr(0, 4095);
            tc.areEqual(str4095.length, 4095);
            c1._setLongString("vl4095", str4095);
            tc.areEqual(c1.get("vl4095"), str4095);
            tc.areEqual(c1._getLongString("vl4095"), str4095);

            var str4096 = str4095 + '0';
            tc.areEqual(str4096.length, 4096);
            c1._setLongString("vl4096", str4096);
            tc.isTrue(c1.get("vl4096") === null);
            tc.areEqual(c1._getLongString("vl4096"), str4096);

            var str10k = str5k + str5k;
            c1._setLongString("vl10k", str10k);
            tc.isTrue(c1.get("vl10k") === null);
            tc.areEqual(c1._getLongString("vl10k"), str10k);

            // Set/get object in segments
            c1.setObjectInSegments("objEmptySeg", objEmpty);
            tc.areEqual(JSON.stringify(c1.getObjectInSegments("objEmptySeg")), JSON.stringify(objEmpty));

            var objSeg = { a: 1, b: str5k };
            c1.setObjectInSegments("objSeg", objSeg);
            verifyObjectsAreEqual(c1.getObjectInSegments("objSeg"), objSeg);
 
            // get non-existed object returns null
            tc.areEqual(c1.getObjectInSegments("notExist"), null);
       }
        
        // Delete container
        ls.deleteContainer("_test1");
        c1 = ls.getContainer("_test2");
        tc.areEqual(c1, null);

        // Test container()

        // Ensure _test3 does not exist
        ls.deleteContainer("_test3");

        // Create a new container
        c1 = ls.container("_test3");
        tc.areEqual(c1.name(), "_test3");

        // Get an existing container
        c1 = ls.container("_test3");
        tc.areEqual(c1.name(), "_test3");

        // Cleanup
        ls.deleteContainer("_test3");

        ls.dispose();
        ad.dispose();
    });

    // $TODO test roaming

})();