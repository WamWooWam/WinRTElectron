/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
function _(){}
CommonJS.commonSchedulerEnabled = true;
var Orchestrator=function() {
var queue=[];
function schedule() {
msSetImmediate(executeNextTask)
}
function ranker(a, b) {
return b.getPriority() - a.getPriority()
}
function executeNextTask() {
if (queue.length > 0) {
queue.sort(ranker);
var operation,
task=queue.shift();
console.log("Executing: " + task.identifier);
operation = task.execute();
if (operation && operation.done) {
operation.done(function() {
console.log("Executed: " + task.identifier);
schedule()
}, function() {
schedule()
})
}
else {
console.log("Executed: " + task.identifier);
schedule()
}
}
else {
schedule()
}
}
function createCancellationHandle(task) {
return function() {
var index=queue.indexOf(task);
if (index > -1) {
console.log("Cancelling: " + task.identifier);
queue.splice(index, 1)
}
}
}
function submit(task) {
queue.push(task);
return {cancel: createCancellationHandle(task)}
}
if (!CommonJS.commonSchedulerEnabled) {
schedule()
}
return {submit: submit}
};
function getOrchestrator() {
if (CommonJS.commonSchedulerEnabled) {
return CommonJS.Scheduler
}
return NewsApp.Orchestration._globalOrchestrator
}
;
WinJS.Namespace.define("NewsApp.Orchestration", {
_globalOrchestrator: (NewsApp && NewsApp.Orchestration && NewsApp.Orchestration._globalOrchestrator ? NewsApp.Orchestration._globalOrchestrator : new Orchestrator), getOrchestrator: getOrchestrator
})
})();
(function() {
"use strict";
var Decorator=function(panel, item, source) {
function computeViewportPriority() {
if (!panel || !panel._viewport) {
return 0
}
var position=panel._viewport.scrollLeft,
width=panel._viewport.offsetWidth,
start=item.offset,
end=(item.offset + item.width);
if (start == position) {
return 10
}
else if ((start >= position && start <= position + width) || (end >= position && end <= position + width)) {
return 5
}
else {
return 0
}
}
function getPriority() {
return computeViewportPriority() + source.getPriority()
}
function execute() {
return source.execute()
}
return {
identifier: item.data.clusterTitle + " -> " + source.identifier, getPriority: getPriority, execute: execute
}
};
var ViewportOrchestrationProxy=function(panel, item) {
function submit(task) {
return NewsApp.Orchestration.getOrchestrator().submit(new Decorator(panel, item, task))
}
return {submit: submit}
};
WinJS.Namespace.define("NewsApp.Orchestration", {ViewportOrchestrationProxy: ViewportOrchestrationProxy})
})()