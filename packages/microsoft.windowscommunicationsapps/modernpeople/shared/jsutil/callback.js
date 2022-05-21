
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>

Jx.delayDefine(People, "Callback", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;

    // Why use this over Function.prototype.bind?  First here's an example of their use:
    // 
    //// function Foo() {}
    //// Foo.prototype.stuff = function(a){ return a + 1; }
    //// var f = new Foo;
    ////  
    //// var bound = f.stuff.bind(f,1);
    //// doStuffWithFunction(bound);
    //// var cb = new Callback(f.stuff, f, [1]);
    //// doStuffWithCallback(cb);
    //// 
    //// function doStuffWithFunction(fn) {
    ////     var result = fn();
    //// }
    ////
    //// function doStuffWithCallback(cb) {
    ////     var result = Callback.invoke(cb);
    //// }
    // 
    // The problem with Function.prototype.bind is that it yields a
    // closure.  These closures have slower performance than the
    // Callback object invocation.  Bind also hides the fact that its
    // storing references to bound properties when the resulting
    // function is passed around.  Someone might think storing such a
    // bound function is innocuous, but it might leak objects the
    // caller was not aware of.  Callback is slightly more explicit
    // about its true nature.
    // 
    var Callback = P.Callback = /* @constructor */function (fnIn, /* @dynamic */selfIn, argsIn) {
        /// <param name="fnIn" type="Function">The function to call</param>
        /// <param name="selfIn" optional="true">The context in which to call the function</param>
        /// <param name="argsIn" type="Array" optional="true">Array of arguments to pass to the function</param>
        this.fn = fnIn;
        this.self = selfIn;
        this.args = argsIn;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    Callback.prototype.invoke = function (args) {
        /// <summary> Call an object representing a Callback where arguments are supplied </summary>
        /// <param name="args" type="Array" optional="true">The arguments array</param>
        return this.fn.apply(this.self, args || this.args);
    };

});
