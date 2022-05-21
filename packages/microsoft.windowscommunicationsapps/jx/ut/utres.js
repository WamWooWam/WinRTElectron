
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/Res.js" />

/*global Tx,Jx,document*/

Tx.test("ResTests.testGetFormatFunction", function (tc) {
    var res = new Jx.Res();

    // Check that simple formatting works.
    tc.log("Loading simple format string.");

    var fn1 = res.getFormatFunction("idFormatStringSimple"),
        fn2 = res.getFormatFunction("idFormatStringSimple", true);

    tc.areEqual("foo bar", fn1("foo", "bar"));
    tc.areEqual("foo bar", fn2("X", "foo", "bar"));

    // Check that out of order placeholder work (requirement for loc)
    tc.log("Loading format string with reversed placeholder.");

    var fn3 = res.getFormatFunction("idFormatStringReversed"),
        fn4 = res.getFormatFunction("idFormatStringReversed", true);

    tc.areEqual("bar foo", fn3("foo", "bar"));
    tc.areEqual("bar foo", fn4("X", "foo", "bar"));
});

Tx.test("ResTests.testGetFormatFunctionNewline", function (tc) {
    /// <summary>Verifies behavior when there is a newline in the localized string (bug 99035) </summary>

    var res = new Jx.Res();

    var fn1 = res.getFormatFunction("idFormatStringNewline");
    var fn2 = res.getFormatFunction("idFormatStringNewline", true);

    tc.areEqual("String has a parameter foo and a new-\nline", fn1("foo"));
    tc.areEqual("String has a parameter foo and a new-\nline", fn2("X", "foo"));
});

Tx.test("ResTests.testGetFormatFunctionSpecialCharacters", function (tc) {
    /// <summary>Validates getFormatFunction when there are characters with special meaning in JS in the string</summary>

    var res = new Jx.Res();

    var fn1 = res.getFormatFunction("idFormatStringSpecialCharacters");
    var fn2 = res.getFormatFunction("idFormatStringSpecialCharacters", true);

    tc.areEqual("Special foo characters \\x56 \" \' { # ^", fn1("foo"));
    tc.areEqual("Special foo characters \\x56 \" \' { # ^", fn2("X", "foo"));

});

Tx.test("ResTests.testGetFormatFunctionReplacements", function (tc) {
    /// <summary>Validates getFormatFunction with different sets of replacement values</summary>

    var res = new Jx.Res();

    var replaceFunction = res.getFormatFunction("idFormatStringReplacements");

    //String is:
    //%1 %%2 %%%3 %%%%4 %%%%%5 %6 %%^ %3 %n %%n %t %%t %%
    tc.areEqual("A1 %2 %C3 %%4 %%E5 % %^ C3   %n   %t %", replaceFunction("A1", "B2", "C3", "D4", "E5", "%"));
});

Tx.test("ResTests.testLoadString", function (tc) {

    var res = new Jx.Res();

    // Check that loading a simple string works
    tc.log("Loading string.");
    var str1 = res.getString("idPlainString");
    tc.areEqual("foo bar", str1);

    // Check that simple formatting works.
    tc.log("Loading simple format string.");
    var str2 = res.loadCompoundString("idFormatStringSimple", "foo", "bar");
    tc.areEqual("foo bar", str2);

    // Check that out of order placeholder work (requirement for loc)
    tc.log("Loading format string with reversed placeholder.");
    var str3 = res.loadCompoundString("idFormatStringReversed", "foo", "bar");
    tc.areEqual("bar foo", str3);

    // Check that placeholders can be repeated in a string (requirement for loc)
    tc.log("Loading format string with repeated placeholders.");
    var str4 = res.loadCompoundString("idFormatStringRepeated", "foo", "bar");
    tc.areEqual("foo foo bar", str4);

    // TODO: fix this
    // Check that strings with "." in the ID can be loaded
    // tc.log("Loading string with dot in the name.");
    // var str5 = res.getString("idFoo.Bar");
    // tc.areEqual("foo dot bar", str5);

    // Check that "placeholders" in arguments aren't processed as real placeholders
    tc.log("Loading format string with 'placeholders' in arguments");
    var str6 = res.loadCompoundString("idFormatStringSimple", "foo %2", "bar"); // The "%2" should be left alone - it should NOT result in "foo bar bar"
    tc.areEqual("foo %2 bar", str6);
});

Tx.test("ResTests.testLocalizeApp", function (tc) {
    if (Jx.isWorker) {
        return; // Doesn't work in web workers
    }

    var res = new Jx.Res();

    var app = document.createElement("div");

    var child = document.createElement("div");
    child.setAttribute(
        "data-win-res",
        "title:idFooTitle;aria-label:idFooAriaLabel");
    app.appendChild(child);

    tc.log("Localizing app.");
    res.processAll(app);

    tc.log("Checking for localized title attribute.");
    tc.areEqual("foo title", child.getAttribute("title"));

    tc.log("Checking for localized aria-label attribute.");
    tc.areEqual("foo aria-label", child.getAttribute("aria-label"));
});
