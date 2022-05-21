
//
// Copyright (C) Microsoft. All rights reserved.
//
(function () {

    var UtAppData = window.UtAppData = function () {
        this._local = new UtAppDataContainer();
        this._roaming = new UtAppDataContainer();
    };
    Jx.inherit(UtAppData, Jx.AppData);
    UtAppData.prototype.dispose = Jx.fnEmpty;
    UtAppData.prototype.localSettings = function() { return this._local; };
    UtAppData.prototype.roamingSettings = function() { return this._roaming; };

    var UtAppDataContainer = window.UtAppDataContainer = function () {
        this._values = {};
    };
    Jx.inherit(UtAppDataContainer, Jx.AppDataContainer);

    function emptify(k) { this[k] = Jx.fnEmpty; }
    // Don't make any "smarts" we don't need/use, but neuter real functionality
    ["dispose","name","isLocal","isRoaming","_getContainer","getContainer","createContainer",
     "deleteContainer","setObject","getObject","setObjectInSegments","getObjectInSegments"].forEach(emptify, UtAppDataContainer.prototype);

    UtAppDataContainer.prototype.get = function(k) { return this._values[k]; };
    UtAppDataContainer.prototype.remove= function(k) { return delete this._values[k]; };
    UtAppDataContainer.prototype.set = function(k,v) { this._values[k] = v; return true; };
    UtAppDataContainer.prototype.container = function(child) { 
        return Jx.isObject(this._values[child]) ? this._values[child] : this._values[child] = new UtAppDataContainer(); 
    };

 }());
