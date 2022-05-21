
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Windows.Foundation.js" />
/// <reference path="Windows.ApplicationModel.Contacts.js" />
/// <reference path="Windows.ApplicationModel.Search.js" />
/// <reference path="Windows.ApplicationModel.Activation.js" />
/// <reference path="Windows.ApplicationModel.DataTransfer.js" />
/// <reference path="Windows.UI.Notifications.js" />
/// <reference path="Main.js" />
/// <reference path="../Shared/JsUtil/include.js" />
/// <reference path="../Shared/JsUtil/namespace.js" />
/// <reference path="../Shared/JSUtil/PeopleLog.js" />
/// <reference path="AppFrame.ref.js" />
/// <reference path="../../shared/Jx/Core/Jx.dep.js" />
/// <reference path="../Shared/Accounts/LogonErrorDialog.js" />
/// <reference path="../Shared/Accounts/EasiIdConnector.js" />
/// <reference path="../Shared/Accounts/NetworkConnectivity.js" />
/// <reference path="../AddressBook/pages/PeoplePicker/PeopleProvider.js" />
/// <reference path="../Shared/ShareTarget/ShareRoot.js" />
/// <reference path="../Shared/ShareSource/ShareSource.js" />
/// <reference path="../Shared/Mocks/Platform/SampleData.js" />
/// <reference path="CreatePlatform.js"/>
//

/*jshint browser:true*/
/*global Jx,Windows,Debug,NoShip,Microsoft,WinJS,unescape,URL*/

(function () {

    var P = window.People,
        Activation = Windows.ApplicationModel.Activation;
    P.errorOccurred = false;
    P.inPeopleApp = true;

    // Whether the app should check for EASI IDs on launch (default: true).
    // This is required for the People Share Target as we don't want this dialog to pop up in the Share experience.
    var checkForEasiId = true;

    // Start PerfTrack startup reports.  This is about as early as we can meaningfully run this code.
    // We have to have loaded our ETW logger, which requires Jx and our loader.  Nothing else should be
    // loaded at this point.
    //
    // Because this is so early, we don't actually know why the app has been launched.  PerfTrack doesn't allow
    // branching scenarios, so we'll fire all possible start points and be careful only to fire the one real end point.
    //
    // Note that this does not capture platform startup.  Starting it early is important for performance, and loading
    // a bunch of JS and ETW dlls first would compromise that goal.
    //
    var trackStartup = true;

    window.addEventListener("DOMContentLoaded", function () {
        // Keep track of loaded scripts and assert if it finds duplicates
        Debug.only(Jx.Dep.collect());

        NoShip.People.etw("peopleAppInit_start");
        Jx.mark("People:AppInit,StartTA,People");
        Jx.app = new P.App(window.initialPlatformResult); // initialPlatformResult is set in CreatePlatform.js
        window.initialPlatformResult = null;
        document.title = Jx.res.getString("/strings/peopleAppName");
        NoShip.People.etw("peopleAppInit_end");
        Jx.mark("People:AppInit,StopTA,People");
    }, false);

    // beforeunload handler doesn't get called in normal exit scenarios.
    // However, it does get called in some scenarios, such as when a restart is needed, or Ctrl+F4 is pressed in debug version.
    window.addEventListener("beforeunload", function () {
        // Don't call cleanup code if error has occurred. This is to avoid false alarm for crashes/leaks/asserts. 
        if (!P.errorOccurred) {
            Jx.log.info("beforeunload called.");
            NoShip.People.etw("peopleAppClose_start");
            Jx.app.shutdownUI();
            NoShip.People.etw("peopleAppClose_end");
            Jx.app.shutdown();
        }
    }, false);

    // Hooks window.onerror to set P.errorOccurred flag.
    window.addEventListener("error", function (/*@dynamic*/ev) {
        if (Jx.log) {
            Jx.log.info("People.errorOccurred set to true.");
            Jx.log.error("Unhandled exception: " + ev.message + "\n  file: " + ev.filename + "\n  line: " + ev.lineno + "\n  column: " + ev.colno);
            Jx.app.shutdownLog();
        }
        P.errorOccurred = true;
    }, false);

    var App = P.App = /*@constructor*/function (platformResult) {
        ///<summary>Instantiates the people app. It owns creating the platform and launching
        ///the proper UI depending on it's activated</summary>
        ///<param name="platformResult" type="CreatePlatformResult">The results of the first call to window.createPlatform in people.htm.</param>
        Debug.assert(Jx.isObject(platformResult));

        Jx.Application.call(this, Jx.AppId.people, true /* skip deferred tasks */);
        if (Jx.root) {
            // If the root component is already set, bail out. This happens on mandatory update where Jx.launch sets the root
            // component to be the update required page. In that case we don't need to finish starting up the app.
            Debug.assert(Jx.launch.getApplicationStatus(true /* skipDeferredLaunchTasks */) === Jx.Launch.AppStatus.mandatoryUpdate);

            // Create a settings handler so help and about are available in this state
            this._settings = new P.Settings();
            return;
        }

        this._root = /*@static_cast(P.CpMain)*/null;
        this._scheduler = new P.Scheduler();
        this._schedulerVisibility = new P.SchedulerVisibility();
        this._jobSet = this._scheduler.getJobSet();
        this._platform = platformResult.client;
        this._hrPlatform = platformResult.hr;
        this._restartneededEventListener = null;
        this._pendingActivation = /*@static_cast(Activation.IActivatedEventArgs)*/null;
        this._activationKind = -1;
        this._settings = /*@static_cast(P.Settings)*/null;

        var activation = Jx.activation;
        activation.addListener(activation.activated, this._activated, this);
        activation.addListener(activation.navigated, this._navigated, this);
        activation.addListener(activation.suspending, this._suspend, this);
        activation.addListener(activation.resuming, this._resume, this);

        // Register for the Share contract.
        var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.addEventListener("datarequested", this._shareSourceDataRequested.bind(this));
    };
    Jx.inherit(App, Jx.Application);
    Jx.augment(App, Jx.Events);
    Debug.Events.define(App.prototype, "suspending", "sharesourcedatarequested");

    App.prototype.shutdown = function () {
        ///<summary>Tears down the app, removing the last of the event listeners</summary>
        if (this._scheduler) {
            if (this._restartneededEventListener) {
                this._platform.removeEventListener("restartneeded", this._restartneededEventListener);
                this._restartneededEventListener = null;
            }

            var activation = Jx.activation;
            activation.removeListener(activation.activated, this._activated, this);
            activation.removeListener(activation.navigated, this._navigated, this);
            activation.removeListener(activation.suspending, this._suspend, this);
            activation.removeListener(activation.resuming, this._resume, this);

            Jx.dispose(this._jobSet);
            this._jobSet = null;
        }

        Jx.Application.prototype.shutdown.call(this);
        Jx.dispose(this._platform);
        this._platform = null;
    };

    App.prototype._activated = function (/*@type(Activation.IActivatedEventArgs)*/ev) {
        ///<summary>Ensure we create the platform before proceeding to handle activation</summary>
        if (this._platform !== null) {
            // Safe to start creating the app because we already have the platform
            this._handleActivation(ev);
        } else if (!this._pendingActivation && this._activationKind === -1) {
            // Only handle the first activation if we get multiple while waiting to start the platform.
            this._pendingActivation = ev;
            this._ensurePlatform();

            // Create a temporary settings handler so help and about are available while the user connects an account
            this._settings = new P.Settings();
        }
    };

    App.prototype._handleActivation = function (/*@type(Activation.IActivatedEventArgs), @optional*/ev) {
        ///<summary>Loads/navigates the app depending on the activation context</summary>
        Debug.assert(this._platform !== null);
        ev = ev || this._pendingActivation;
        this._pendingActivation = null;
        this._activationKind = ev.kind;

        // Remove the temporary settings handler. The root component will add a new one if necessary
        if (this._settings) {
            this._settings.shutdownComponent();
            this._settings = null;
        }

        // Extract the activation context
        var k = Activation.ActivationKind, root = null;
        if (ev.kind === k.contactPicker) {
            root = new P.PeopleProvider(/*@static_cast(Activation.ContactPickerActivatedEventArgs)*/ev, this._platform, this._scheduler);
            this._root = Jx.root = root;
            this._showUI();
        } else if (ev.kind === k.shareTarget) {
            checkForEasiId = false;
            root = new P.ShareTarget.ShareRoot(/*@static_cast(Activation.ShareTargetActivatedEventArgs)*/ev, this._platform, this._scheduler);
            this._root = Jx.root = root;
            this._showUI();
        } else {
            // "Normal" activation through either tile, website (from IE app bar), protocol or search
            var that = this;
            var navigate = function (uri) {
                if (!that._root) {
                    // Cleanup previous session if needed
                    if ((ev.previousExecutionState === Activation.ApplicationExecutionState.notRunning) || (ev.previousExecutionState === Activation.ApplicationExecutionState.closedByUser)) {
                        P.CpMain.reset();
                    }

                    // Track startup perf when launching to the address book and not delayed by the sign-in dialog
                    trackStartup = (trackStartup && uri === "");
                    root = new P.CpMain(that._platform, that._scheduler, uri);
                    that._root = Jx.root = root;
                    that._showUI();
                } else {
                    if (Jx.isNonEmptyString(uri)) {
                        // Already running, nav to the desired location
                        that._root.navToActivatedUri(uri);
                    }
                }
            };

            if (ev.kind === k.launch) {
                if (ev.verb) {
                    this._getActionActivationUriAsync(ev).done(function (url) {
                        navigate(url);
                    }, function err() {
                        navigate("");
                    });
                } else {
                    navigate(this._getTileActivationUri(/*@static_cast(Activation.LaunchActivatedEventArgs)*/ev));
                }
            } else if (ev.kind === k.protocol) {
                navigate(this._getProtocolActivationUri(/*@static_cast(Activation.ProtocolActivatedEventArgs)*/ev));
            } else if (ev.kind === k.search) {
                navigate(this._getSearchActivationUri(/*@static_cast(Activation.SearchActivatedEventArgs)*/ev));
            } else if (ev.kind === k.contact) {
                if (ev.verb === Windows.ApplicationModel.Contacts.ContactLaunchActionVerbs.post) {
                    navigate(this._getPostActionActivationUri(/*@static_cast(Windows.UI.WebUI.WebUIContactPostActivatedEventArgs)*/ev));
                } else {
                    navigate("");
                }
            }
        }
    };

    App.prototype._showUI = function () {
        ///<summary>Called once we've successfully created the platform and we can transition to building the appropriate UI depending
        ///on the mode of activation</summary>
        NoShip.People.etw("peopleAppActivation_start");
        Jx.mark("People:AppActivation,StartTA,People");
        var platform = this._platform;

        this.initUI(document.getElementById("idRoot"));
        if (trackStartup) {
            this._root.trackStartup();
        }

        // Enqueue post-startup tasks
        if (checkForEasiId) {
            this._jobSet.addUIJob(null, function () { P.Accounts.checkForEasiId(platform, Microsoft.WindowsLive.Platform.ApplicationScenario.people); }, null, P.Priority.firstRun);
        }

        this._jobSet.addUIJob(this, function () { P.Accounts.ensureNetworkOnFirstRun(platform); }, null, P.Priority.firstRun);

        this._jobSet.addUIJob(this, this._beginReplication, null, P.Priority.replication);
        if (Jx.launch) {
            this._jobSet.addUIJob(Jx.launch, Jx.launch.startDeferredTasks, [platform], P.Priority.launch);
        }

        this._scheduler.runVisibleJobsUntil(P.Priority.perfLowFidelity);
    };

    App.prototype._getTileActivationUri = function (/*@type(Activation.LaunchActivatedEventArgs)*/ev) {
        // When launched from IE app bar, the tileId would be the app id. We shouldn't try to load person from the arguments. Just launch People with no navigation.
        if (Jx.isNonEmptyString(ev.arguments) && ev.tileId !== "Microsoft.WindowsLive.People") {
            // Launched from a secondary tile for a pinned person
            var person = null;
            try {
                person = this._platform.peopleManager.tryLoadPersonByTileId(ev.arguments);
            } catch (err) {
                Jx.log.exception("People.App._getTileActivationUri: failed to load person by tile Id.", err);
            }
            var tileId = ev.tileId;
            if (person) {
                try {
                    Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForSecondaryTile(tileId).clear();
                } catch (err) {
                    if (err.number === -2143420158 /* WPN_E_INVALID_APP */) {
                        // Couldn't clear pinned secondary tile for a contact. The tile may have been unpinned before we got here, so let's 
                        // not crash the app over this.
                        // JavaScript runtime error: The application identifier provided is invalid
                        Jx.log.exception("People.App._getTileActivationUri: failed to clear tile updater for secondary tile.", err);
                    } else {
                        throw err;
                    }
                }
                return P.Nav.getViewPersonUri(person.objectId);
            } else {
                // The pinned tile is invalid, e.g. the associated person was deleted
                var that = this;
                this._jobSet.addUIJob(null, function () { P.Pinning.tileLaunchError(that._platform, tileId); }, null, P.Priority.tileError);
            }
        }
        // Default launch or the secondary tile is bad. In either case, return an empty uri to avoid further navigation
        return "";
    };

    App.prototype._getActionActivationUriAsync = function (/*@type(Activation.LaunchActivatedEventArgs)*/ev) {
        var that = this;
        return new WinJS.Promise(function (complete, error) {
            if (ev.verb === "Windows.ContactsProvider.ShowContact") {
                that._extractContactDataAsync(ev.contact).then(function (data) {
                    complete(P.Nav.getViewPersonUri(ev.contact.id, data, ev.verb));
                });
            } else if (ev.verb === "Windows.ContactsProvider.AddContact") {
                that._extractContactDataAsync(ev.contact).then(function (data) {
                    complete(P.Nav.getViewPersonUri("", data, ev.verb));
                });
            } else {
                error();
            }
        });
    };

    App.prototype._getProtocolActivationUri = function (/*@type(Activation.ProtocolActivatedEventArgs)*/ev) {
        var uri = ev.uri;
        if (uri.schemeName === "wlpeople") {
            // Get the requested pageName
            var path = uri.path;
            var trimmedPath = path.replace(/\s*$/, "");
            var match = /([^,]*)(?:,([^,]*)(?:,(.*))?)?/g.exec(trimmedPath);
            var tokens = match ? match.slice(1) : [];
            var pageName = unescape(tokens[0] || "").toLowerCase();

            if (pageName === "search") {
                // The 'search' page no longer exists - it is now just a subset of the allcontacts page. To continue to support the search
                // keyword for protocol launches the pageName 'search' is replaced by 'allcontacts'
                var newPath = "allcontacts";
                if (tokens.length > 2) {
                    newPath += ",";
                    for (var i = 1; i < tokens.length; i++) {
                        newPath += tokens[i] + ",";
                    }
                }
                return newPath;
            } else {
                return uri.path;
            }
        } else if (uri.schemeName === "ms-accountpictureprovider") {
            return P.Nav.getEditMePictureUri();
        } else {
            var person = P.Protocol.fromUri(uri).toPerson(this._platform);
            return person ? P.Nav.getViewPersonUri(person.objectId) : "";
        }
    };

    App.prototype._getSearchActivationUri = function (/*@type(Activation.SearchActivatedEventArgs)*/ev) {
        var query = ev.queryText.trim();
        return Jx.isNonEmptyString(query) ? P.Nav.getAllContactsSearchUri(query, ev.language) : "";
    };

    App.prototype._getPostActionActivationUri = function (/*@static_cast(Windows.UI.WebUI.WebUIContactPostActivatedEventArgs)*/ev) {
        var protocol = P.Protocol.createFromPostInfo(ev.serviceId, ev.serviceUserId);
        var person = protocol.toPerson(this._platform);
        if (person) {
            var data = { isPostScenario: true, postNetworkSelection: protocol.contact.sourceId };
            return P.Nav.getViewPersonUri(person.objectId, data);
        }
        return "";
    };

    App.prototype._navigated = function () {
        ///<summary>Treat the navigation event like a fresh launch</summary>
        this._activated({
            kind: Activation.ActivationKind.launch,
            previousExecutionState: Activation.ApplicationExecutionState.terminated
        });
    };

    App.prototype._suspend = function () {
        this.raiseEvent("suspending");
        // platform.suspend flushes logs. This has to be called last to ensure the logs from suspend handler are saved.
        if (this._platform) {
            //The platform crashed at some point before this call.
            //Since there isn't a platform around to suspend, we will ignore this and not immediately crash and lose 
            //all of the data we have cached at the javascript layer.
            try {
                this._platform.suspend();
            } catch (err) {
                if (err.number !== -2147023174 /*RPC_S_SERVER_UNAVAILABLE*/) {
                    throw err;
                }
            }
        }
    };

    App.prototype._resume = function () {
        NoShip.People.etw("peopleAppResume");
        if (this._platform) {
            this._platform.resume();
        }
        Jx.ptStopResume(Jx.TimePoint.responsive);
    };

    App.prototype._ensurePlatform = function () {
        ///<summary>Launch the logon error dialog so the user can enter creds. Once complete we can attempt to create the platform again.</summary>
        trackStartup = false; // Don't fire perf track events if we block startup on this dialog
        NoShip.People.etw("peopleLogonError_start");
        P.Accounts.showLogonErrorDialog(this._retryPlatformCreation.bind(this), /*@bind(App)*/function (platformCreated) {
            NoShip.People.etw("peopleLogonError_end");
            
            if (!platformCreated) {
                return WinJS.Promise.join([ "/Platform/MockPlatform.js", "/ModernPeople/Shared/Mocks/Platform/SampleData.js", "/ModernPeople/AppFrame/MockLogin.js"].map(function (src) {
                    return new WinJS.Promise(function (c) {
                        var script = document.createElement("script");
                        script.addEventListener("load", function () {
                            c();
                        });
                        script.src = src;
                        document.head.appendChild(script);
                    });
                })).done(function () {
                    this._showLoginPage();
                }.bind(this));
                return;
            }
            
            Debug.assert(platformCreated);
            this._handleActivation();
        } .bind(this), this._hrPlatform);
    };

    App.prototype._retryPlatformCreation = function (setError) {
        ///<summary>Attempts to create the platform</summary>
        ///<param name="setError" type="Function" optional="true">Callback to receive the hresult value for the platform creation</param>
        ///<returns type="Boolean">True if the platform was created successfully</returns>
        Debug.assert(this._platform === null);

        var result = window.createPlatform();
        var platform = this._platform = result.client;
        this._hrPlatform = result.hr;

        if (setError) {
            setError(result.hr);
        }

        return platform !== null;
    };

    App.prototype._beginReplication = function () {
        var platform = this._platform;
        var listener = this._restartneededEventListener = this._onRestartNeeded.bind(this);
        platform.addEventListener("restartneeded", listener);
        platform.requestDelayedResources();
        Jx.forceSync(platform, Microsoft.WindowsLive.Platform.ApplicationScenario.people);
        P.AppTile.enableTilePush(platform);
    };

    App.prototype._shareSourceDataRequested = function (e) {
        /// <summary>Called in response to "datarequested" callbacks from invocation of the Share charm.</summary>
        /// <param name="e" type="Windows.ApplicationModel.DataTransfer.DataRequestedEventArgs">Data request from Share contract</param>

        // We need to pass along an instance of our own People.ShareSource.DataRequestedEventArgs because the WinRT object does not
        // have a "handled" property.
        // We're also transforming the "datarequested" event name to "sharesourcedatarequested" to make it more explicit.
        var S = P.ShareSource;
        var localEventArgs = new S.DataRequestedEventArgs(e);
        this.raiseEvent("sharesourcedatarequested", localEventArgs);
        if (!localEventArgs.handled) {
            e.request.failWithDisplayText(Jx.res.getString("/strings/shareFailGeneric"));
        }
    };

    App.prototype._onRestartNeeded = function () {
        /// <summary>Called by the platform when the connected account has changed.</summary>
        Jx.log.warning("Restarting due to connected account change");

        // Force the app to restart only if we haven't been activated in the contactPicker, or share context.
        if (this._activationKind !== Activation.ActivationKind.contactPicker &&
            this._activationKind !== Activation.ActivationKind.shareTarget) {
            P.Accounts.showMustSignInDialog(function () {
                // This will be invoked when the user hits the "try again" link in the dialog.
                location.reload();
            } /*retry*/, true /*forceShow*/);
        }
    };

    // Phone kind constants come from Windows.ApplicationModel.Contacts.ContactPhoneKind
    var homePhoneKind = 0;
    var mobilePhoneKind = 1;
    var workPhoneKind = 2;
    var otherPhoneKind = 3;

    // Email kind constants come from Windows.ApplicationModel.Contacts.ContactEmailKind
    var personalEmailKind = 0;
    var workEmailKind = 1;
    var otherEmailKind = 2;

    // Address kind constants come from Windows.ApplicationModel.Contacts.ContactAddressKind
    var homeAddressKind = 0;
    var workAddressKind = 1;
    var otherAddressKind = 2;

    App.prototype._extractContactDataAsync = function (contact) {
        return new WinJS.Promise(function (complete) {
            var extendedData = {
                firstName: contact.firstName || "",
                lastName: contact.lastName || "",
                middleName: contact.middleName || "",
                title: contact.honorificNamePrefix || "",
                suffix: contact.honorificNameSuffix || "",
                yomiFirstName: contact.yomiGivenName || "",
                yomiLastName: contact.yomiFamilyName || "",
                notes: contact.notes || ""
            };

            if (contact.providerProperties && contact.providerProperties.augmented) {
                extendedData.accountId = contact.providerProperties.accountId;
            }

            if (contact.phones && (contact.phones.size > 0)) {
                var homePhones = 0, mobilePhones = 0, workPhones = 0;
                var otherPhoneNumbers = [];
                var unusedKeys = {
                    businessPhoneNumber: true,
                    business2PhoneNumber: true,
                    mobilePhoneNumber: true,
                    mobile2PhoneNumber: true,
                    homePhoneNumber: true,
                    home2PhoneNumber: true
                };
                contact.phones.forEach(function (phone) {
                    var key;
                    if ((phone.kind === homePhoneKind) && (homePhones < 2)) {
                        key = (homePhones === 0) ? "homePhoneNumber" : "home2PhoneNumber";
                        extendedData[key] = phone.number;
                        unusedKeys[key] = false;
                        homePhones++;
                    } else if ((phone.kind === mobilePhoneKind) && (mobilePhones < 2)) {
                        key = (mobilePhones === 0) ? "mobilePhoneNumber" : "mobile2PhoneNumber";
                        extendedData[key] = phone.number;
                        unusedKeys[key] = false;
                        mobilePhones++;
                    } else if ((phone.kind === workPhoneKind) && (workPhones < 2)) {
                        key = (workPhones === 0) ? "businessPhoneNumber" : "business2PhoneNumber";
                        extendedData[key] = phone.number;
                        unusedKeys[key] = false;
                        workPhones++;
                    } else if (phone.kind === otherPhoneKind) {
                        otherPhoneNumbers.push(phone.number);
                    }
                });

                // Iterate through every unused phone number key, and add as many unused phone numbers
                // as possible to the person.
                var i = 0;
                for (var key in unusedKeys) {
                    if (i === otherPhoneNumbers.length) {
                        break;
                    }
                    if (unusedKeys[key]) {
                        extendedData[key] = otherPhoneNumbers[i];
                        i++
                    }
                }
            }

            if (contact.emails && (contact.emails.size > 0)) {
                var personalEmailAddress = false, workEmailAddress = false, otherEmailAddress = false;
                contact.emails.forEach(function (email) {
                    if ((email.kind === personalEmailKind) && !personalEmailAddress) {
                        extendedData.personalEmailAddress = email.address;
                        personalEmailAddress = true;
                    } else if ((email.kind === workEmailKind) && !workEmailAddress) {
                        extendedData.businessEmailAddress = email.address;
                        workEmailAddress = true;
                    } else if ((email.kind === otherEmailKind) && !otherEmailAddress) {
                        extendedData.otherEmailAddress = email.address;
                        otherEmailAddress = true;
                    }
                });
            }

            if (contact.significantOthers && (contact.significantOthers.size > 0)) {
                // We only have room for the first significant other
                extendedData.significantOther = contact.significantOthers[0].name;
            }

            if (contact.websites && (contact.websites.size > 0)) {
                // We only have room for the first website
                extendedData.webSite = contact.websites[0].uri.absoluteCanonicalUri;
            }

            var workAddress = false;
            if (contact.addresses && (contact.addresses.size > 0)) {
                var homeAddress = false, otherAddress = false;
                contact.addresses.forEach(function (address) {
                    var data = {
                        street: address.streetAddress || "",
                        city: address.locality || "",
                        state: address.region || "",
                        zipCode: address.postalCode || "",
                        country: address.country || ""
                    }

                    if ((address.kind === homeAddressKind) && !homeAddress) {
                        extendedData.homeLocation = data;
                        homeAddress = true;
                    } else if ((address.kind === workAddressKind) && !workAddress) {
                        extendedData.businessLocation = data;
                        workAddress = true;
                    } else if ((address.kind === otherAddressKind) && !otherAddress) {
                        extendedData.otherLocation = data;
                        otherAddress = true;
                    }
                });
            }

            if (contact.jobInfo && (contact.jobInfo.size > 0)) {
                // Only the first jobInfo details get saved because that's all we can store
                var job = contact.jobInfo[0];
                extendedData.companyName = job.companyName;
                extendedData.yomiCompanyName = job.companyYomiName;
                extendedData.officeLocation = job.office;
                extendedData.jobTitle = job.title;

                if (!workAddress) {
                    extendedData.businessLocation = {
                        street: job.companyAddress || "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: ""
                    }
                }
            }

            var completed = function () {
                complete({
                    objectType: "literal",
                    name: contact.displayName,
                    yomiName: contact.calculatedYomiName,
                    extendedData: extendedData
                });
            };

            if (contact.thumbnail) {
                contact.thumbnail.openReadAsync().then(function (stream) {
                    extendedData.url = URL.createObjectURL(stream);
                    completed();
                }, function () {
                    completed();
                });
            } else {
                completed();
            }
        });
    };

})();

