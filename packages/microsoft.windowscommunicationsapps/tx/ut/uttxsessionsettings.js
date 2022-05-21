
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.test("Tx.SessionSettings: ctor/dispose", function () {
    var s = new Tx.SessionSettings();
    s.dispose();
});

Tx.test("Tx.SessionSettings: set/get", function (tc) {
    var s = new Tx.SessionSettings();

    // values are stored as strings
    
    s.set("utfoo", "abc");
    tc.areEqual(s.get("utfoo"), "abc");
    
    s.set("utfoo", 999);
    tc.areEqual(s.get("utfoo"), "999");
    
    s.set("utfoo", true);
    tc.areEqual(s.get("utfoo"), "true");

    s.set("utfoo", false);
    tc.areEqual(s.get("utfoo"), "false");

    s.dispose();
});

// TODO: add more tests
