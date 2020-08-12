

(function () {
    "use strict";

    var WrSkyLib, applicationState;

    var libraryManager = WinJS.Class.define(function (dependencies) {
        updateDependencies(dependencies || {});
        this._libStartSignal = new WinJS._Signal();
        this._isPrelaunched = false;
        this._lib = null;
        this._applicationActiveChangeHandler = this._applicationActiveChangeHandler.bind(this);
    }, {
        _libStartSignal: null,
        _lib: null,
        _isPrelaunched: null,
        _handler: null,

        _applicationActiveChangeHandler: function () {
            log("LibraryManager: _applicationActiveChangeHandler");
            this._updateLibStartBlock();
        },

        _updateLibStartBlock: function () {
            if (!this._lib) {
                log("LibraryManager: _updateLibStartBlock, library not constructed -> exiting");
                return;
            }

            log("LibraryManager: _updateLibStartBlock, isPrelaunched = {0}, isApplicationActive = {1}, libStatus = {2}".format(
                this._isPrelaunched, applicationState.isApplicationActive, this._lib.getLibStatus()));
            if (this._isPrelaunched &&
                applicationState.isApplicationActive &&
               (this._lib.getLibStatus() !== WrSkyLib.libstatus_RUNNING)) {
                Skype.LibraryManager.instance.unblockStart();
                this._isPrelaunched = false;
            }
        },

        create: function (version) {
            log("LibraryManager: creating library object instance, given version [{0}]".format(version));
            this._lib = new WrSkyLib(version);

            applicationState.bind("isApplicationActive", this._applicationActiveChangeHandler);

            return this._lib;
        },

        start: function () {
            log("LibraryManager: trying to start library");
            var that = this;
            this._libStartSignal.promise.then(function () {
                log("LibraryManager: lib.start");
                roboSky.write("libraryManager,libLogin,StartTM");
                that._lib.start(false);
                applicationState.unbind("isApplicationActive", that._applicationActiveChangeHandler);
            });
        },

        unblockStart: function () {
            log("LibraryManager: unblocking library start");
            this._libStartSignal.complete();
        },

        setIsPrelaunched: function () {
            log("LibraryManager: setting prelaunch flag");
            this._isPrelaunched = true;
            this._updateLibStartBlock();
        }
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.LibraryManager();
                }
                return instance;
            }
        }
    });

    var instance;

    function updateDependencies(dependencies) {
        WrSkyLib = dependencies.wrSkyLib || LibWrap.WrSkyLib;
        applicationState = dependencies.applicationState || Skype.Application.state;
    }

    WinJS.Namespace.define("Skype", {
        LibraryManager: libraryManager
    });
})();