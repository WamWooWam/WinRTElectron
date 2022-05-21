
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/UrlHash.js" />

/*global Tx,Jx*/

Tx.test("UrlHashTests.testHashChangeEvent", function (tc) {
    // Verify that the Jx hashchange event fires.

    var urlHash = new Jx.UrlHash();

    var onHashChangeCalled = false;

    function onHashChange(hash) {
        tc.isTrue(hash === "foo");
        onHashChangeCalled = true;
    }

    urlHash.addListener(urlHash.hashChange, onHashChange);

    // Call the private event handler directly.
    urlHash._onhashchange({target: {location : {hash: "foo"}}});

    tc.isTrue(onHashChangeCalled);

    urlHash.dispose();
});

Tx.test("UrlHashTests.testDefaultHash", function (tc) {
    // Verify the default value of the browser's hash.

    var urlHash = new Jx.UrlHash();
    tc.areEqual(urlHash.getHash(), "");
    urlHash.dispose();
});

Tx.test("UrlHashTests.testClear", function (/*tc*/) {
    // Verify Jx.UrlHash.clear().
    // $TODO It's not safe to change the hash in LiveUnit.
});

// $TODO add a test which changes window.location.hash.
// Unfortunately it can't be done easily in liveunit since the hashchange event is async 
// and also we need to change the page's hash which might affect how liveunit works.

// $TODO verify that the hashchange event listener got removed after dispose().