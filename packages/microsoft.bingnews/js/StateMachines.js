/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
function _(){}
var StateMachine=function(events, handlers, initial, context) {
var current,
promise,
vectors={},
instance={},
_traceEnabled=false;
events = events || [];
handlers = handlers || {};
context = context || instance;
function enter(target, args) {
if (!handlers["on" + target]) {
throw new Error("State Machine cannot initialize to " + target);
}
current = target;
return handlers["on" + current].apply(context, [instance].concat(args))
}
function execute(handler, args) {
return handler.apply(context, [instance].concat(args))
}
function create(eventName) {
return function() {
var args=Array.prototype.slice.call(arguments),
source=current;
var target=current = vectors[eventName][source] || vectors[eventName]["*"];
if (!source) {
trace("ERROR: source state is null or undefined.");
debugger;
return null
}
var exit=handlers["onexit" + source];
if (exit) {
execute(exit, args)
}
var enter=handlers["on" + target];
if (!enter) {
trace("ERROR: State Machine cannot transition from " + source + " using event: " + eventName);
debugger;
return null
}
return execute(enter, args)
}
}
function trace(txt) {
if (_traceEnabled) {
console.log(txt)
}
}
for (var i=0, ilen=events.length; i < ilen; i++) {
var metadata=events[i];
vectors[metadata.name] = vectors[metadata.name] || {};
vectors[metadata.name][metadata.from] = metadata.to;
if (!instance[metadata.name]) {
instance[metadata.name] = create(metadata.name)
}
}
if (initial) {
enter(initial, null)
}
return instance
};
WinJS.Namespace.define("NewsApp", {StateMachine: StateMachine})
})()