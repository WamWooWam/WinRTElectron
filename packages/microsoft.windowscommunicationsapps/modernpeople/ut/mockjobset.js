
/* @constructor*/function MockJobSet() {
}
MockJobSet.prototype.setVisibility = function (isVisible) { };
MockJobSet.prototype.setOrder = function (order) { };
MockJobSet.prototype.createChild = function () {
    return this;
};
MockJobSet.prototype.dispose = function () { };
MockJobSet.prototype.addUIJob = function (uiObject, /* @type(Function)*/uiFunction, uiArguments, priority) {
    uiFunction.apply(uiObject, uiArguments); 
};
MockJobSet.prototype.cancelJobs = function () { };

