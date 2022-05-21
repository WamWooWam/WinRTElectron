
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Tx*/

Tx.test("Tx event handler leak", {garbageCollect: true}, function (tc) {  
    // intentional event handler leak
    window.addEventListener("beforeunload", function () {
        tc.log("Tx beforeunload handler leak");
    });
});

Tx.test("Tx global object leak", {garbageCollect: true}, function () {  
    // intentional global leak
    window._tx_global_leak = new Array(5000);
});

// TODO: add an async test leak 

