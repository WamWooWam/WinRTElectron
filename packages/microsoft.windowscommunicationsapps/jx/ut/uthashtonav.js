
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// HashToNav UTs

/// <reference path="../core/HashToNav.js" />

/*global Jx,Tx*/

Tx.test("HashToNavTests.testHashToNav", function (tc) {
    var urlHash = new Jx.UrlHash();
    var nav = new Jx.Nav();
    var hashToNav = new Jx.HashToNav(urlHash, nav);
    var navigateCalled = 0;

    nav.addListener(nav.navigate, function (ev) {
        navigateCalled++;
        tc.areEqual(ev.location.view, "foo", "invalid view");
        tc.areEqual(ev.location.id, "1", "invalid id");
    });

    urlHash._onhashchange({target: {location : {hash: "view=foo&id=1"}}});

    tc.areEqual(navigateCalled, 1, "navigateCalled:" + navigateCalled);
        
    hashToNav.dispose();
    nav.dispose();
    urlHash.dispose();
});
