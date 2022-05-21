
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.Navigator UTs

/*global Tx*/

Tx.test("Tx.Navigator: ctor/dispose", function () {
    var n = new Tx.Navigator({ addEventListener: Tx.fnEmpty, removeEventListener: Tx.fnEmpty });
    n.dispose();
});

Tx.test("Tx.Navigator: substring filter", function (tc) {
    var filter = Tx.Navigator.prototype._filter;
    var pages;
    var filteredPages;

    filteredPages = filter([], "");
    tc.areEqual(filteredPages.length, 0);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, "htm");
    tc.areEqual(filteredPages.length, 2);
    tc.areEqual(filteredPages[0].htm, pages[0].htm);
    tc.areEqual(filteredPages[1].htm, pages[1].htm);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, "2");
    tc.areEqual(filteredPages.length, 1);
    tc.areEqual(filteredPages[0].htm, pages[1].htm);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, "3");
    tc.areEqual(filteredPages.length, 0);
});

Tx.test("Tx.Navigator: regexp filter ", function (tc) {
    var filter = Tx.Navigator.prototype._filter;
    var pages;
    var filteredPages;

    filteredPages = filter([], /.*/);
    tc.areEqual(filteredPages.length, 0);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, /htm$/);
    tc.areEqual(filteredPages.length, 2);
    tc.areEqual(filteredPages[0].htm, pages[0].htm);
    tc.areEqual(filteredPages[1].htm, pages[1].htm);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, /2/);
    tc.areEqual(filteredPages.length, 1);
    tc.areEqual(filteredPages[0].htm, pages[1].htm);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, /3/);
    tc.areEqual(filteredPages.length, 0);
});

Tx.noop("Tx.Navigator: array filter ", function (tc) {
    var filter = Tx.Navigator.prototype._filter;
    var pages;
    var filteredPages;

    filteredPages = filter([], /.*/);
    tc.areEqual(filteredPages.length, 0);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, ["1.htm", "2.htm"]);
    tc.areEqual(filteredPages.length, 2);
    tc.areEqual(filteredPages[0].htm, pages[0].htm);
    tc.areEqual(filteredPages[1].htm, pages[1].htm);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, ["2.htm"]);
    tc.areEqual(filteredPages.length, 1);
    tc.areEqual(filteredPages[0].htm, pages[1].htm);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, []);
    tc.areEqual(filteredPages.length, 0);

    pages = [{ htm: "1.htm" }, { htm: "2.htm" }];
    filteredPages = filter(pages, ["3.htm"]);
    tc.areEqual(filteredPages.length, 0);
});

// TODO: add more tests

