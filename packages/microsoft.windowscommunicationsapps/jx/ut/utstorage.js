
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/Storage.js" />

/*global Tx,Jx*/

(function() {

    if (!Jx.isWWA) return; // It only works in WWA

    var _appDataCreated = false;
    var utStorage = {};

    function tearDown() {
        if (_appDataCreated) {
            Jx.appData.dispose();
            Jx.appData = null;
            _appDataCreated = false;
        }
    }

    function setUp(tc) {
        if (!Jx.appData) {
            Jx.appData = new Jx.AppData();
            _appDataCreated = true;
        }
    
        // Called before the first test
        utStorage.init = function () {
            Jx.storage = new Jx.Storage();
            Jx.storage.remove();
        };

        // Called after every test
        utStorage.reset = function() {
            Jx.storage.remove();
            Jx.storage.reset();
        };

        // Called after the last test
        utStorage.shutdown = function () {
            Jx.storage.shutdown();
            Jx.storage = null;
        };

        // Set the cleanup function
        tc.cleanup = tearDown;
    }
    
    Tx.test("StorageTests.testSetAttr", function (tc) {
        setUp(tc);

        utStorage.init(); 
        var s = Jx.storage;

        s.setAttr("a", 1);
        s.setAttr("b", 2);
        s.setAttr("c", 3);

        tc.isTrue(s.getAttr("a") === 1);
        tc.isTrue(s.getAttr("b") === 2);
        tc.isTrue(s.getAttr("c") === 3);
        
        utStorage.reset();
    });
    
    Tx.test("StorageTests.testSetAttr2", function (tc) {
        setUp(tc);

        utStorage.init();
        var s = Jx.storage;

        s.setAttr("a", 1);
        s.setAttr("a", 2);

        tc.isTrue(s.getAttr("a") === 2);
        
        utStorage.reset();
    });

    Tx.test("StorageTests.testSave1", function (tc) {
        setUp(tc);

        utStorage.init();
        var s = Jx.storage;

        s.setAttr("a", 1);
        s.setAttr("b", 2);
        s.setAttr("c", 3);
        
        s.save();
        
        tc.isTrue(s._getData() === '{"a":1,"b":2,"c":3}');
        
        utStorage.reset();
    });

    Tx.test("StorageTests.testSave2", function (tc) {
        setUp(tc);

        utStorage.init();
        var s = Jx.storage;

        var obj = { obj: true };

        s.setAttr("a", null);
        s.setAttr("b", "string");
        s.setAttr("c", obj);

        s.save();

        tc.isTrue(s._getData() === '{"a":null,"b":"string","c":{"obj":true}}');
        
        utStorage.reset();
    });

    Tx.test("StorageTests.testGetAttr", function (tc) {
        setUp(tc);

        utStorage.init();
        var s = Jx.storage;

        var obj = { obj: true };

        s.setAttr("a", null);
        s.setAttr("b", "string");
        s.setAttr("c", obj);

        tc.isTrue(s.getAttr("a") === null);
        tc.isTrue(s.getAttr("b") === "string");
        tc.isTrue(s.getAttr("c").obj === obj.obj);
        
        utStorage.reset();
    });
    
    Tx.test("StorageTests.testGetAttr2", function (tc) {
        setUp(tc);

        utStorage.init();
        var s = Jx.storage;

        s.setAttr("a", 1);

        tc.isTrue(s.getAttr("a") === 1);
        tc.isTrue(s.getAttr("a") === 1);
        
        utStorage.reset();
    });
        
    Tx.test("StorageTests.testLoad", function (tc) {
        setUp(tc);

        utStorage.init();
        var s = Jx.storage;

        var obj = { obj: true };

        s.setAttr("a", null);
        s.setAttr("b", "string");
        s.setAttr("c", obj);

        s.save();

        tc.isTrue(s._getData() === '{"a":null,"b":"string","c":{"obj":true}}');
        
        s.reset();
        
        tc.isTrue(s.getAttr("a") === undefined);
        tc.isTrue(s.getAttr("b") === undefined);
        tc.isTrue(s.getAttr("c") === undefined);
        
        s.load();
        
        tc.isTrue(s.getAttr("a") === null);
        tc.isTrue(s.getAttr("b") === "string");
        tc.isTrue(s.getAttr("c").obj === obj.obj);
        
        utStorage.reset();  
    });
    
    Tx.test("StorageTests.testLoad2", function (tc) {
        setUp(tc);

        utStorage.init();
        var s = Jx.storage;

        var obj = { obj: true };

        s.setAttr("a", null);
        s.setAttr("b", "string");
        s.setAttr("c", obj);

        s.save();

        tc.isTrue(s._getData() === '{"a":null,"b":"string","c":{"obj":true}}');
        
        s.reset();
        
        tc.isTrue(s.getAttr("a") === undefined);
        tc.isTrue(s.getAttr("b") === undefined);
        tc.isTrue(s.getAttr("c") === undefined);
        
        s.save();
        s.load();
        
        tc.isTrue(s.getAttr("a") === undefined);
        tc.isTrue(s.getAttr("b") === undefined);
        tc.isTrue(s.getAttr("c") === undefined);
        
        utStorage.reset();  
    });

    Tx.test("StorageTests.testReset1", function (tc) {
        setUp(tc);

        utStorage.init();
        var s = Jx.storage;

        s.setAttr("a", 1);
        s.setAttr("b", 2);
        s.setAttr("c", 3);
        
        s.save();

        tc.isTrue(s._getData() === '{"a":1,"b":2,"c":3}');
       
        s.remove();
        s.reset();

        tc.isTrue(s.getAttr("a") === undefined);
        tc.isTrue(s.getAttr("b") === undefined);
        tc.isTrue(s.getAttr("c") === undefined);
        
        utStorage.reset();
        utStorage.shutdown();
    });

})();