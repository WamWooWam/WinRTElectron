
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {

    var TestCommandHost = function () {
        Mail.Commands.Host.call(this);
    };

    Jx.inherit(TestCommandHost, Mail.Commands.Host);

    TestCommandHost.prototype.mock$commandToVisibilityBinding = {};
    TestCommandHost.prototype.showCommands =  function () {
        this.commandsToShow().forEach(function (commandId) {
            this.mock$commandToVisibilityBinding[commandId] = true;
        }, this);
        this.commandsToHide().forEach(function (commandId) {
            this.mock$commandToVisibilityBinding[commandId] = false;
        }, this);
    };
    TestCommandHost.prototype.composeCommands = function () {
        return ['bbb', 'ddd', 'fff'];
    };
    TestCommandHost.prototype.viewStateCommands = function (viewState) {
        return ['ddd', 'fff'];
    };
    Object.defineProperty(TestCommandHost.prototype, "registeredCommandIds", { get: function () { return ['fff', 'eee', 'aaa', 'bbb', 'ccc', 'ddd']; }, enumerable: true });
    TestCommandHost.prototype._composeInFocus = function () {
        return true;
    };
    TestCommandHost.prototype._canvasInFocus = function () {
        return true;
    };
    
    Tx.test("CommandHost.TestCommandHost", { owner: "jamima"}, function (tc) {
        var host = new TestCommandHost();
        host.updateEnabledLists(['ddd'], []);
        host.showCommands();
        tc.isTrue(host.mock$commandToVisibilityBinding['ddd'], 'ddd');

        tc.isFalse(host.mock$commandToVisibilityBinding['aaa'], 'aaa');
        tc.isFalse(host.mock$commandToVisibilityBinding['bbb'], 'bbb');
        tc.isFalse(host.mock$commandToVisibilityBinding['ccc'], 'ccc');
        tc.isFalse(host.mock$commandToVisibilityBinding['eee'], 'eee');
        tc.isFalse(host.mock$commandToVisibilityBinding['fff'], 'fff');
    });

    Tx.test("CommandHost.intersectionTest", { owner: "jamima"}, function (tc) {
        var intersection = Mail.Commands.Host.prototype._intersection;

        var expected = ['ddd', 'fff'];
        var actual = intersection(['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff'], ['bbb', 'ddd', 'fff'], ['ddd', 'fff']);
        
        tc.areEqual(actual.length, expected.length, "length");
        for (var i = 0; i < expected.length; i++) {
            tc.areEqual(actual[i], expected[i], i + "th value");
        }
    });

    Tx.test("CommandHost.unionTest", { owner: "jamima"}, function (tc) {
        var union = Mail.Commands.Host.prototype._union;

        var expected = ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg', 'hhh'];
        var actual = union(['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff'], ['bbb', 'eee', 'fff', 'ggg', 'hhh']);

        tc.areEqual(actual.length, expected.length, "length");
        for (var i = 0; i < expected.length; i++) {
            tc.areEqual(actual[i], expected[i], i + "th value");
        }
    });

    Tx.test("CommandHost.minusTest", { owner: "jamima"}, function (tc) {
        var minus = Mail.Commands.Host.prototype._minus;

        var expected = ['aaa', 'ccc', 'ddd'];
        var actual = minus(['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff'], ['bbb', 'eee', 'fff', 'ggg', 'hhh']);

        tc.areEqual(actual.length, expected.length, "length");
        for (var i = 0; i < expected.length; i++) {
            tc.areEqual(actual[i], expected[i], i + "th value");
        }
    });

    Tx.test("CommandHost.minusLastSameTest", { owner: "jamima"}, function (tc) {
        var minus = Mail.Commands.Host.prototype._minus;
        var expected = ['back', 'compose'];
        var actual = minus(['back', 'compose', 'deleteMessage', 'respond'], ['close', 'deleteMessage', 'edit', 'respond']);

        tc.areEqual(actual.length, expected.length, "length");
        for (var i = 0; i < expected.length; i++) {
            tc.areEqual(actual[i], expected[i], i + "th value");
        }
    });

    Tx.test("CommandHost.intersectionFirstTest", { owner: "jamima"}, function (tc) {
        var intersection = Mail.Commands.Host.prototype._intersection;

        var a = [                   'clearFormatting', 'editLink', 'emojiCmd', 'linkSeperator', 'openLink', 'redo', 'removeLink', 'save', 'undo'],
            b = ['addLinkMenuItem', 'clearFormatting', 'editLink', 'emojiCmd', 'linkSeperator', 'openLink', 'redo', 'removeLink', 'save', 'undo'],
            c = ['addLinkMenuItem', 'clearFormatting', 'editLink',             'linkSeperator', 'openLink', 'redo', 'removeLink', 'save', 'undo'];

        var expected = ['clearFormatting', 'editLink', 'linkSeperator', 'openLink', 'redo', 'removeLink', 'save', 'undo'];

        var actual = intersection(a,b,c);

        tc.areEqual(actual.length, expected.length, "length");
        for (var i = 0; i < expected.length; i++) {
            tc.areEqual(actual[i], expected[i], i + "th value");
        }
    });
})();
