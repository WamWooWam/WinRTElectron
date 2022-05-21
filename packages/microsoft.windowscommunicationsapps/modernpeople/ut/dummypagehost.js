
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <disable>JS2043.RemoveDebugCode</disable>

(function (A) {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = A.People || (A.People = {}),
        U = P.UnitTest || (P.UnitTest = {});
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    U.createDummyPageHost = function (commandBarDiv) {
        var theHost = new U.DummyPageHost(commandBarDiv);
        var cmdBar = theHost.getAppBar();
        cmdBar.reset();
 
        return theHost;
    };

    U.DummyNavBar = /*@constructor*/function () {
        this._winappbar = { _element: document.createElement('div') };
        this._winappbar.element = this._winappbar._element;
    };
    U.DummyNavBar.prototype.getWinappbar = function () {
        return this._winappbar;
    };

    U.DummyFrameCommands = /*@constructor*/function () {
    };

    // Add a new command to the command bar
    U.DummyFrameCommands.prototype.addCommand = function (command) {
    };

    U.DummyCommandBar = /*@constructor*/function (div, host) {
        this._winappbar = { _element: document.createElement('div') };
        this._winappbar.element = this._winappbar._element;
    };

    U.DummyCommandBar.onInvoke = function (btn) {
        return false;
    };

    // Add a new command to the command bar
    U.DummyCommandBar.prototype.addCommand = function (command) {
    };

    // Update and existing command in the command bar
    U.DummyCommandBar.prototype.updateCommand = function (command) {
    };

    // Hide a command in the command bar
    U.DummyCommandBar.prototype.hideCommand = function (commandId) {
    };

    // Show a command in the command bar
    U.DummyCommandBar.prototype.showCommand = function (commandId) {
    };

    // Refresh command bar after adding commands
    U.DummyCommandBar.prototype.refresh = function () {
    };

    // Remove all (page) of the current commands from the command bar 
    // Note: the host is free to add / keep any of it own specific commands
    // if any
    U.DummyCommandBar.prototype.reset = function () {
    };

    // Return the mock windows appbar object
    U.DummyCommandBar.prototype.getWinappbar = function () {
        return this._winappbar;
    };

    U.DummyMessageBar = /*@constructor*/function (host) {
        this._host = host;
    };

    // Add an error message to the message bar
    U.DummyMessageBar.prototype.addErrorMessage = function (id, priority, options) {
    };

    // Remove an error message to the message bar
    U.DummyMessageBar.prototype.removeMessage = function (id) {
    };

     U.ControlNames = {
        profileEdit: 'profileEdit',
        profileView: 'profileView',
        editPicture: 'editPicture'
    },

    U.DummyPageHost = /*@constructor*/function (commandBar) {
        this._appbar = new U.DummyCommandBar(commandBar, this);
        this._navbar = new U.DummyNavBar();
        this._frameCommands = new U.DummyFrameCommands();
        this._activeControl = null;
        this._activeControlName = null;
        this._activeContainer = null;
        this._controls = [];
        this._containers = [];
        this._messagebar = new U.DummyMessageBar(this);
        this._rootElem = document.createElement('div');
        this._rootElem.innerHTML = '<div id="idPeopleAppContent"></div>';
    };

    U.DummyPageHost.prototype = {
        _addControl: function (controlName, theControl, container) {
            this._controls[controlName] = theControl;
            this._containers[controlName] = container;
        },

        // -----------------------------------------------------------------

        switchControl: function (controlName) {
            var newControl = this._controls[controlName];
            if (newControl === null) {
                alert("ControlName [" + controlName + "] is not currently implmented in the test container!");
                return false;
            }

            // deactivate the existing control is one is displayed
            if (this._activeControl !== null) {
                if (!this._activeControl.deactivate()) {
                    return false;
                }
                this._activeContainer.style.display = "none";
            }

            var newContainer = this._containers[controlName];
            newContainer.style.display = "inline";
            newControl.activate();
            this._activeControl = newControl;
            this._activeControlName = controlName;
            this._activeContainer = newContainer;

            return true;
        },
        cancelProfileEdit: function () {
            var editControl = this.getControl(U.ControlNames.profileEdit);
            editControl.cancelChanges();

            if (this.switchControl(U.ControlNames.profileView)) {
                // Successful switched away from the Edit control (so cancel valid)
                // to complete we need to "reset" the edit controls values
                this.reload(U.ControlNames.profileEdit);
            }
        },
        saveProfileEdit: function () {
            var editControl = this.getControl(U.ControlNames.profileEdit);
            if (editControl.save()) {
                this.reload(U.ControlNames.profileView);
                this.switchControl(U.ControlNames.profileView);
            }
        },
        initialize: function () {
            this.loadAll();
            this.switchControl(U.ControlNames.profileView);
        },

        // -----------------------------------------------------------------

        getNavBar: function () {
            return this._navbar;
        },
        getAppBar: function () {
            return this._appbar;
        },
        getFrameCommands: function () {
            return this._frameCommands;
        },
        // Deprecated: getCommandBar() is not part of the actual host object as of W5M3
        getCommandBar: function () {
            return this._appbar;
        },

        getMessageBar: function () {
            return this._messagebar;
        },

        dehydrate: function () {
            var dehydrateData = {};
            if (this._activeControl !== null) {
                dehydrateData.activeView = this._activeControlName;
                dehydrateData.hydrateData = this._activeControl.prepareSuspension();
            }
            return dehydrateData;
        },
        getControl: function (controlName) {
            return this._controls[controlName];
        },
        getCurrentControl: function () {
            return this._activeControls;
        },
        getLayout: function () {
            return {
                layoutState: {
                    snapped: "snapped",
                    mobody: "mobody"
                },
                getLayoutState: function () {
                    return "mobody";
                },
                addLayoutChangedEventListener: function (callback, context) {
                    return;
                },
                removeLayoutChangedEventListener: function (callback, context) {
                    return;
                },
                addOrientationChangedEventListener: function (callback, context) {
                    return;
                },
                removeOrientationChangedEventListener: function (callback, context) {
                    return;
                }
            };
        },
        getRootElem: function () {
            return this._rootElem;
        },
        createProfileViewControl: function (viewDiv, commands) {
            // Just load the person into the view control
            this._viewControlContainer = viewDiv;
            this._viewControl = new People.Controls.createProfileViewControl(this, viewDiv, commands);
            this._addControl(U.ControlNames.profileView, this._viewControl, viewDiv);
        },
        loadAll: function () {
            for (var name in this._controls) {
                var control = this._controls[name];
                control.load({ mode: "load", data: this.person });
            }
        },
        reload: function (controlName) {
            var control = this._controls[controlName];
            control.load({ mode: "load", data: this.person });
        },
        hydrate: function (hydrateData) {
            if (!hydrateData) {
                return;
            }
            var control = this.getControl(hydrateData.activeView);
            control.load({ mode: "hydrate", data: this.person, context: hydrateData.hydrateData });
            this.switchControl(hydrateData.activeView);
        },
        setJobSet: function (jobSet) {
            this._jobSet = jobSet;
        },
        getJobSet: function () {
            return this._jobSet;
        },
        getPlatform: function () {
            if (!this._platform) {
                this._platform = Mocks.Microsoft.WindowsLive.Platform.Data.makeHeadtraxDataset().getClient();
            }

            return this._platform;
        }
    };
} (window));
