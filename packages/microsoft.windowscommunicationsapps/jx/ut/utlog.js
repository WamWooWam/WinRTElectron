
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Log UTs

/// <reference path="../core/Log.js" />

/*global Jx,Tx*/

Tx.test("LogTests.testEnabled", function (tc) {
    var m = null;
    var log = new Jx.Log();
        
    log._writeMsg = function (msg) {
        m = msg;
    };

    log.enabled = false;

    m = null;
    log.always("foo");
    tc.isTrue(m === null);

    log.enabled = true;

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");
});
    
    
Tx.test("LogTests.testWriteMsg", function (tc) {
    var m = null;
    var log = new Jx.Log();

    log.always("foo");
    tc.isTrue(m === null);

    log._writeMsg = function (msg) {
        m = msg;
    };

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");

    delete log._writeMsg;

    m = null;
    log.always("foo");
    tc.isTrue(m === null);
});

Tx.test("LogTests.testDefault", function (tc) {
    var m = null;
    var log = new Jx.Log();

    log._writeMsg = function (msg) {
        m = msg;
    };

    tc.isTrue(log.enabled);
    tc.isTrue(log.level === Jx.LOG_INFORMATIONAL);

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.critical("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.error("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.warning("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.info("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.verbose("foo");
    tc.isTrue(m === null);
});
    
Tx.test("LogTests.testLogAlways", function (tc) {
    var m = null;
    var log = new Jx.Log();
        
    log._writeMsg = function (msg) {
        m = msg;
    };

    log.level = Jx.LOG_ALWAYS;

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.critical("foo");
    tc.isTrue(m === null);

    m = null;
    log.error("foo");
    tc.isTrue(m === null);

    m = null;
    log.warning("foo");
    tc.isTrue(m === null);

    m = null;
    log.info("foo");
    tc.isTrue(m === null);

    m = null;
    log.verbose("foo");
    tc.isTrue(m === null);
});
    
Tx.test("LogTests.testLogCritical", function (tc) {
    var m = null;
    var log = new Jx.Log();
        
    log._writeMsg = function (msg) {
        m = msg;
    };

    log.level = Jx.LOG_CRITICAL;

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.critical("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.error("foo");
    tc.isTrue(m === null);

    m = null;
    log.warning("foo");
    tc.isTrue(m === null);

    m = null;
    log.info("foo");
    tc.isTrue(m === null);

    m = null;
    log.verbose("foo");
    tc.isTrue(m === null);
});
    
Tx.test("LogTests.testLogError", function (tc) {
    var m = null;
    var log = new Jx.Log();
        
    log._writeMsg = function (msg) {
        m = msg;
    };

    log.level = Jx.LOG_ERROR;

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.critical("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.error("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.warning("foo");
    tc.isTrue(m === null);

    m = null;
    log.info("foo");
    tc.isTrue(m === null);

    m = null;
    log.verbose("foo");
    tc.isTrue(m === null);
});
    
Tx.test("LogTests.testLogWarning", function (tc) {
    var m = null;
    var log = new Jx.Log();
        
    log._writeMsg = function (msg) {
        m = msg;
    };

    log.level = Jx.LOG_WARNING;

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.critical("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.error("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.warning("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.info("foo");
    tc.isTrue(m === null);

    m = null;
    log.verbose("foo");
    tc.isTrue(m === null);
});
    
Tx.test("LogTests.testLogInformational", function (tc) {
    var m = null;
    var log = new Jx.Log();
        
    log._writeMsg = function (msg) {
        m = msg;
    };

    log.level = Jx.LOG_INFORMATIONAL;

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.critical("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.error("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.warning("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.info("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.verbose("foo");
    tc.isTrue(m === null);
});
    
Tx.test("LogTests.testLogVerbose", function (tc) {
    var m = null;
    var log = new Jx.Log();
        
    log._writeMsg = function (msg) {
        m = msg;
    };

    log.level = Jx.LOG_VERBOSE;

    m = null;
    log.always("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.critical("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.error("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.warning("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.info("foo");
    tc.isTrue(m === "foo");

    m = null;
    log.verbose("foo");
    tc.isTrue(m === "foo");
});

Tx.test("LogTests.testLogException", function testLogException(tc) {
    var m = null;
    var log = new Jx.Log();
        
    log._writeMsg = function (msg) {
        m = msg;
    };

    [
        { message: "msg1",  exception: { stack: "stack1", number: 1 },  expected: "msg1\nstack1\nError Code: 1" },
        { message: "msg2",  exception: { description: "desc2", number: 2 },  expected: "msg2\ndesc2\nError Code: 2" },
        { message: "msg3",  exception: { message: "msg3", number: 3 },  expected: "msg3\nmsg3\nError Code: 3" },
        { message: "msg4",  exception: { toString: function() { return "toString4"; }, number: 4 },  expected: "msg4\ntoString4\nError Code: 4" },
        { message: "msg5",  exception: { number: 5 },  expected: "msg5\n[object Object]\nError Code: 5" },
        { message: "msg6",  exception: { },  expected: "msg6\n[object Object]\nError Code: undefined" },
        { message: "msg7",  exception: 7,  expected: "msg7\n7\nError Code: undefined" },
        { message: "msg8",  exception: { stack: "stack8", description: "desc8", message: "msg8", toString: function() { return "toString8"; } },  expected: "msg8\nstack8\nError Code: undefined" }
    ].forEach(function (test) {
        m = null;
        log.exception(test.message, test.exception);
        tc.areEqual(test.expected, m);
    });

    try {
        throw Error(152, "Unique error message");
    } catch (ex) {
        m = null;
        log.exception("Something failed", ex);
        tc.isTrue(m.indexOf("Something failed") !== -1); // contains message
        tc.isTrue(m.indexOf("Unique error message") !== -1); // contains error description
        tc.isTrue(m.indexOf("Error Code: 152") !== -1); // contains error code
        if (ex.stack) { // Don't fail on older IE versions
            tc.isTrue(m.indexOf("testLogException") !== -1); // contains current function (callstack)
        }
    }
});
