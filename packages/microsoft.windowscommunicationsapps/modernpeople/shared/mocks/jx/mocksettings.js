
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../../Shared/jx/core/jx.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>

Include.initializeFileScope(function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var M = Mocks;
    var P = People;
    /// <enable>JS2076.IdentifierIsMiscased</enable>
    /// <disable>JS2008.DoNotUseCookies</disable>

    // M.Storage is the cookie version of Jx.Storage.
    // For perf reasons, Jx.Storage does not use cookies anymore so the original code was copied here.
    
    M.Storage = /*@constructor*/function () {
        /// <summary>Storage Constructor.</summary>
        Debug.assert(this instanceof M.Storage);
        this.initAttr();
    };

    Jx.augment(M.Storage, Jx.Attr);

    // The name of the cookie
    M.Storage.prototype._COOKIE = "jxStorage";

    M.Storage.prototype._isInit = function () {
        /// <summary>Checks if the object is initialized.</summary>
        /// <returns type="Boolean">Returns true is the object is initialized.</returns>
        return this.isAttrInit();
    };

    M.Storage.prototype.shutdown = function () {
        /// <summary>Shut down the storage.</summary>
        this.shutdownAttr();
    };

    M.Storage.prototype.reset = function () {
        /// <summary>Reset (empty) the storage.</summary>
        this.resetAttr();
    };

    M.Storage.prototype.setItems = function (data) {
        /// <summary>Populate the storage from the given data object.</summary>
        /// <param name="data" type="Object">Data object.</param>
        Debug.assert(this._isInit());
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                this.attr(key, { value: data[key] });
            }
        }
    };

    M.Storage.prototype.load = function () {
        /// <summary>Loads the persisted storage data into memory.</summary>
    
        Debug.assert(this._isInit());

        // Ours is the jxStorage cookie
        var cookie = document.cookie;
        var start = cookie.indexOf(this._COOKIE + "=");

        // Only do more work if we had a cookie set
        if (start !== -1) {
            // Cookies are separated by semicolons
            var end = cookie.indexOf(";", start);

            // If there was only one cookie, there is no semicolon
            if (end === -1) {
                end = cookie.length;
            }

            // The raw data is escaped and JSON stringified
            var raw = cookie.substring(start + this._COOKIE.length + 1, end);
            var data = JSON.parse(unescape(raw));

            // Create attrs
            Object.keys(data).forEach(/*@bind(M.Storage)*/function (value) {
                this.attr(value, { value: data[value] });
            }, this);
        }
    };

    M.Storage.prototype.save = function () {
        /// <summary>Persists the storage data.</summary>
    
        // Our data expires in a year
        var date = new Date();
        date.setDate(date.getDate() + 365);

        // We need to JSON stringify and escape the data for the cookie
        var values = this.getAttrValues();
        var data = escape(JSON.stringify(values));

        // Save out the actual cookie
        document.cookie = this._COOKIE + "=" + data + "; expires=" + date.toUTCString();
    };

    // The mock storage object
    M.storage = null;
    
    //
    // Mock AppData object
    //
    M.Jx.AppData = /*@constructor*/function () {
        this._containers = [];
        this._localStorage = null;
        this._roamingStorage = null;
        M.storage = new M.Storage();
        M.storage.load();
    };
    M.Jx.AppData.prototype.dispose = function () {
        if (M.storage) {
            M.storage.save();
            M.storage.shutdown();
            M.storage = null;
        }
    };
    M.Jx.AppData.prototype.localSettings = function () {
        /// <summary>Get the local settings container.</summary>
        if (!Jx.isObject(this._localStorage)) {
            this._localStorage = new M.Jx.AppDataContainer("localSettings", true, null, this._containers);
        }
        return this._localStorage;
    };
    M.Jx.AppData.prototype.roamingSettings = function () {
        /// <summary>Get the roaming settings container.</summary>
        Jx.log.info("Warning: any roaming settings with M.Jx.AppData will not actually roam");
        if (!Jx.isObject(this._roamingStorage)) {
            this._roamingStorage = new M.Jx.AppDataContainer("roamingSettings", true, null, this._containers);
        }
        return this._roamingStorage;
    };
    M.Jx.AppData.prototype.mock$reset = function () {
        M.storage.reset();
    };

    //
    // Mock AppDataContainer object
    //
    M.Jx.AppDataContainer = /*@constructor*/function (name, local, parent, containers) {
        this._name = name;
        this._isLocal = local;
        this._isRoaming = !local;
        this._containers = containers;
        this._parentContainer = parent;
    };

    M.Jx.AppDataContainer.prototype.dispose = function () {
    };
    M.Jx.AppDataContainer.prototype.name = function () {
        /// <summary>Get the container's name.</summary>
        return this._name;
    };
    M.Jx.AppDataContainer.prototype.isLocal = function () {
        /// <summary>Returns true if it's a local container.</summary>
        return this._isLocal;
    };
    M.Jx.AppDataContainer.prototype.isRoaming = function () {
        /// <summary>Returns true if it's a roaming container.</summary>
        return this._isRoaming;
    };
    M.Jx.AppDataContainer.prototype.getContainer = function (name) {
        /// <summary>Returns an existing container.</summary>
        return this._containers[name] || null;
    };
    M.Jx.AppDataContainer.prototype.createContainer = function (name) {
        /// <summary>Creates a new container.</summary>
        /// <param name="name" type="String">The container's name.</param>
        /// <returns type="M.Jx.AppDataContainer">Returns the new container.</returns>
        Debug.assert(Jx.isNonEmptyString(name), "Invalid container name");
        var container = new M.Jx.AppDataContainer(name, this._isLocal, this, this._containers);
        this._containers[name] = container;
        return container;
    };
    M.Jx.AppDataContainer.prototype.deleteContainer = function (name) {
        /// <summary>Deletes a container.</summary>
        delete this._containers[name];
    };
    M.Jx.AppDataContainer.prototype.container = function (name) {
        /// <summary>If the container exists then it returns it, otherwise it creates a new one.</summary>
        /// <param name="name" type="String">The container's name.</param>
        /// <returns type="M.Jx.AppDataContainer">Returns the container.</returns>
        return this.getContainer(name) || this.createContainer(name);
    };
    M.Jx.AppDataContainer.prototype.get = function (name) {
        /// <summary>Returns a value from the container.</summary>
        /// <param name="name" type="String">The value's name.</param>
        /// <returns>Returns the value.</returns>
        return M.storage.getAttr(this._fixName(name));
    };
    M.Jx.AppDataContainer.prototype.set = function (name, value) {
        /// <summary>Inserts a value in the container.</summary>
        /// <param name="name" type="String">The value's name.</param>
        /// <param name="value">The value.</param>
        /// <returns>Returns true if it succeeded.</returns>
        var ret = M.storage.setAttr(this._fixName(name), value);
        return ret;
    };
    M.Jx.AppDataContainer.prototype._fixName = function (name) {
        /// <summary>Fixup an attribute name to make is contextual to our container tree 
        /// to give use psuedo container support on our flat M.storage object. </summary>
        var path = this._name;
        var parent = this._parentContainer;
        while (parent) {
            path = parent.name() + "_" + path;
            parent = parent._parentContainer;
        }
        return "Mock.Jx.AppData?" + path + "_" + name;
    };
});
