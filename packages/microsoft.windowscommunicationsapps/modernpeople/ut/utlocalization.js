
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,People,document,Include*/

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\..\Social\UI\Core\Helpers\LocalizationHelper.js" />

Include.initializeFileScope(function () {
    // Provides unit tests for the list view control.

    function createTextNodes (values) {
        /// <param name="values" type="Array" elementType="String"></param>
        /// <returns type="Array" elementType="Object" elementDomElement="true"></returns>
        var elements = new Array(values.length);
        for (var i = 0; i < values.length; i++) {
            elements[i] = document.createTextNode(values[i]);
        }

        return elements;
    }
    
    Tx.test("LocalizationTests.testSingleLoadCompound", function (tc) {
        /// <summary>
        ///     Tests that a single formatter works correctly.
        /// </summary>

        var output;
        // test a single formatter, no surrounding text.
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('%1', createTextNodes([ 'test' ]));
        tc.areEqual('test', output.innerText);
        // test a single formatter at the start.
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement("%1 I'm a teapot", createTextNodes([ '418' ]));
        tc.areEqual("418 I'm a teapot", output.innerText);
        // test a single formatter at the end
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('hello %1', createTextNodes([ 'world' ]));
        tc.areEqual('hello world', output.innerText);
        // test a single formatter in the middle.
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('hello %1, user', createTextNodes([ 'world' ]));
        tc.areEqual('hello world, user', output.innerText);
    });

    Tx.test("LocalizationTests.testMultiLoadCompound", function (tc) {
        /// <summary>
        ///     Tests that multiple formatters work.
        /// </summary>

        var output;
        // just formatters
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('%1 %2', createTextNodes([ 'hello', 'world' ]));
        tc.areEqual('hello world', output.innerText);
        // text surrounding formatters
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('hello %1, the %2 said', createTextNodes([ 'world', 'user' ]));
        tc.areEqual('hello world, the user said', output.innerText);
        // double digit formatters
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('%1 %2 %3 %4 %5 %6 %7 %8 %9 %10', createTextNodes([ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ]));
        tc.areEqual('1 2 3 4 5 6 7 8 9 10', output.innerText);
    });

    Tx.test("LocalizationTests.testMultiReverseLoadCompound", function (tc) {
        /// <summary>
        ///     Tests that multiple formatters work in random order.
        /// </summary>

        var output;
        // test reverse
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('%2 %1', createTextNodes([ 'world', 'hello' ]));
        tc.areEqual('hello world', output.innerText);
        // test random order
        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('%3 %1 %4 %2', createTextNodes([ '2', '4', '1', '3' ]));
        tc.areEqual('1 2 3 4', output.innerText);
    });

    Tx.test("LocalizationTests.testLoadCompoundWithReplacements", function testLoadCompoundWithReplacements(tc) {
        /// <summary>
        /// Verifies that input strings such as %n %% and %%1 are replaced correctly
        /// </summary>

        var output;

        output = People.RecentActivity.UI.Core.LocalizationHelper.loadLiteralCompoundElement('%1 %%2 %%%3 %%%%4 %%%%%5 %6 %%^ %n %%n %t %%t %%', createTextNodes(['A1', 'B2', 'C3', 'D4', 'E5', '%']));
        tc.areEqual("A1 %2 %C3 %%4 %%E5 % %^   %n   %t %", output.innerHTML);
    });

});