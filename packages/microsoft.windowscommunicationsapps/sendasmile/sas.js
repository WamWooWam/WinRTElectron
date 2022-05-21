
//
// Copyright (C) Microsoft Corporation. All rights reserved.
//

/// <reference path="Windows.Foundation.js" />
/// <reference path="Windows.Devices.Input.js" />
/// <reference path="sas.ref.js" />
/// <reference path="Windows.Storage.Streams.js" />
/// <reference path="%INETROOT%\modern\shared\jx\core\Jx.dep.js" />
/// <reference path="sasManager.js" />
/// <reference path="%_NTTREE%\drop\published\ModernShared\bici\Microsoft.WindowsLive.Instrumentation.js" />
/// <reference path="Windows.UI.ApplicationSettings.js" />
/// <reference path="..\..\..\Shared\WinJS\WinJS.ref.js" />

Jx.delayDefine(Jx, "Sas", function () {

    Jx.Sas = /*@constructor*/function (application, localizedAppName) {
        /// <summary>Creates a new instance of the SendASmile control</summary>
        /// <param name="application" type="string" optional="false">The name of the application (e.g Mail)</param>
        /// <param name="localizedAppName" type="string" optional="false">The localized name of the current app</param>
        /// <returns type="Jx.Sas">A SendASmile feedback control</returns>
        this._feedback = {
            userid: "Anonymous",
            device: "",
            build: "",
            application: application,
            isBeta: false
        };
        this._filesRegistered = false;
        this._localizedAppName = localizedAppName;
        this.initComponent();
        this._id = "SendASmile";
    };

    Jx.augment(Jx.Sas, Jx.Component);

    // Location of the survey helper page (which is hosted in an iframe)
    Jx.Sas.HELPER_PAGE_URL = "ms-appx-web:///sendasmile/survey_helper.html";
    Jx.Sas.POST_MESSAGE_URL = "ms-appx-web://" + Windows.ApplicationModel.Package.current.id.name;

    Jx.Sas.LoadState = {
        loading : 0,
        jsLoaded: 1,
        firstPage: 2,
        secondPage: 3,
        submitted: 4,
        error: 5
    };

    var proto = Jx.Sas.prototype;

    proto.getUI = function (ui) {
        /// <summary>Gets the SendASmile Flyout UI</summary>
        /// <param name="ui" type="JxUI">UI object</param>
        var privacyLinkUrl = SasManager.getConfig().privacyUrl;
        privacyLinkUrl = Jx.escapeHtml(privacyLinkUrl.replace(/\{0\}/, SasManager.getMarket()));

        ui.html = "<div id='SendASmile' data-win-control='WinJS.UI.SettingsFlyout'>" +
                        "<div id='sasHeader' class='win-header'>" +
                            "<button id='sasBackButton' type='button' class='win-backbutton' aria-label='" + Jx.escapeHtml(Jx.res.getString("/accountsStrings/asc-backButtonAriaLabel")) + "'></button>" +
                            "<div class='typeSizeMedium singleLineText' id='sasTitle'>" + Jx.res.getString("/strings/sasSurveyHeader") + "</div>" +
                            "<div id='sasAppIcon'></div>" +
                        "</div>" +
                        "<div id='sasLoadCtr'>" +
                            "<div id='sasLoadHeader'>" +
                                "<progress id='sasLoadSpinner' class='win-ring win-small'></progress>" +
                                "<span id='sasLoadHeaderText' class='typeSizeNormal'>" + Jx.res.getString("/strings/sasLoadingHeader") + "</span>" +
                            "</div>" +
                            "<div id='sasLoadText' class='typeSizeNormal'></div>" +
                        "</div>" +
                        "<div id='sasForm'>" +
                            "<div id='surveyIFrameHost'></div>" +
                            "<a id='sasLegalLink' href='" + privacyLinkUrl + "'>" +
                                Jx.res.getString("/strings/sasPrivacyText") +
                            "</a>" +
                        "</div>" +
                    "</div>";


        // Add a <link> the old-fashioned way for the non-colorized and the colorized CSS
        this._addCss("/resources/sendasmile/css/sas.css");
        this._addCss("/resources/sendasmile/css/" + this._feedback.application + "SaSColor.css");

        this._hasUI = true;
    };

    proto.activateUI = function () {
        /// <summary>Starts listening to DOM events and collects feedback parameters</summary>

        Jx.Component.activateUI.call(this);

        // safeHTML does not allow iframes, insert it here
        var iframe = document.createElement("iframe");
        iframe.className = "settings_section";
        iframe.id = "surveyFrame";
        document.getElementById("surveyIFrameHost").replaceNode(iframe);

        this._flyout = document.getElementById("SendASmile");
        this._surveyFrame = document.getElementById("surveyFrame");
        this._backButton = document.getElementById("sasBackButton");

        // Process the Flyout
        WinJS.UI.processAll(this._flyout).done();

        var that = this;

        this._listeners =
        [{ element: window,
            type: "message",
            handler: function () { that._onMessage.apply(that, arguments); }
        },
        { element: this._flyout,
            type: "afterhide",
            handler: function () { that._onHide.apply(that); }
        },
        { element: this._backButton,
            type: "click",
            handler: function () { that._handleBackButton.apply(that); }
        }];

        this._listeners.forEach(function (l) {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            l.element.addEventListener(l.type, l.handler);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        });

        // Get feedback parameters to send to FMS
        this._collectFeedback();

        this._loadState = Jx.Sas.LoadState.loading;
    };

    proto.deactivateUI = function () {
        /// <summary>Stop listening to DOM events</summary>
        Jx.Component.deactivateUI.call(this);

        this._listeners.forEach(function (l) {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            if (l.element) {
                l.element.removeEventListener(l.type, l.handler);
            }
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        });

    };

    proto.show = function () {
        /// <summary>Shows the SettingsFlyout: will also begin loading the iframe if not already loaded</summary>
        try {
            if (this._flyout.winControl) {
                this._flyout.winControl.show();
            }

            if (this._loadState === Jx.Sas.LoadState.loading) {
                var appId = Jx.appId ? Jx.appId : 0;
                var survey = SasManager._config.application.lookup(appId).surveyId;
                this._loadIframe(this._surveyFrame, survey);
                this._startLoadTime = new Date().getTime();
            }

            SasManager.fireShowEvent();
        } catch (ex) {
            Jx.log.exception("Feedback: Error showing feedback form", ex);
        }
    };

    proto.hide = function () {
        /// <summary>Hides the SettingsFlyout</summary>
        if (this._flyout.winControl) {
            this._flyout.winControl.hide();
        }
    };

    proto.setUserInfo = function (userName, betaState) {
        /// <summary>Set the userid (i.e contoso@live.com) and Dogfood state</summary>
        /// <param name="userName" type="String">The live user-id</param>
        /// <param name="betaState" type="Boolean">Whether or not the user is Dogfood enabled</param>
        this._feedback.isBeta = betaState;
        this._feedback.userid = userName;
    };

    proto.collectAndUploadLogs = function (applicationName, bugDescription) {
        /// <summary>Collect and Upload logs</summary>
        /// <param name="applicationName" type="String">Name of the application</param>
        /// <param name="bugDescription" type="String">Description of the bug</param>
        if (SasManager.enableIssueReporting()) {
            // An arbitrary integer to help us pivot on WLI
            var familyName = Windows.ApplicationModel.Package.current.id.familyName;
            var packageFullName = Windows.ApplicationModel.Package.current.id.fullName;
            var version = Windows.ApplicationModel.Package.current.id.version;
            var packageVersion = version.major + "." + version.minor + "." + version.revision + "." + version.build;
            var localFolder = Windows.Storage.ApplicationData.current.localFolder;
            var bugFileName = applicationName + "_bug.txt";
            var uploadFilePaths = [];
            var uploadFiles = function (filePaths) {
                /// <summary>Upload files using Error Responder</summary>
                /// <param name="filePaths" type="Array">Array of the file paths that need to be uploaded</param>

                // Upload using Error Responder
                if (!that._filesRegistered) {
                    filePaths.forEach(function (filePath) {
                        Jx.erRegisterFile(filePath);
                    });

                    that._filesRegistered = true;
                }

                Jx.fault("sas_bugreport", "sas_bugreport");
            };
            var logError = function (error) {
                return function (){
                    Jx.log.error("Feedback: " + error);
                };
            };

            var that = this;

            localFolder.createFileAsync(bugFileName, Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (/*@type(Windows.Storage.StorageFile)*/ bugFile) {
                uploadFilePaths.push(bugFile.path);

                // To register LiveCommLast, all we have to do is replace the bug filename (i.e mail_bug.txt)
                // with the LiveCommLast filename (LiveCommLast.etl)
                uploadFilePaths.push(bugFile.path.replace(bugFileName, "LiveCommLast.etl"));
                return bugFile.openAsync(Windows.Storage.FileAccessMode.readWrite);
            }, logError("Unable to create a new text file for bug information."))
            .then(function (/*@type(Windows.Storage.Streams.IRandomAccessStream)*/stream) {
                var outputStream = stream.getOutputStreamAt(stream.size);
                var writer = new Windows.Storage.Streams.DataWriter(outputStream);

                function finalize() {
                    writer.detachStream();
                    return outputStream.flushAsync();
                }

                // Bug report
                writer.writeString("Bug report");
                writer.writeString("Bug title: " + applicationName + "," + that._feedback.userid);
                writer.writeString("Bug description: " + bugDescription);
                writer.writeString("Application name: " + applicationName);
                writer.writeString("Package full name: " + packageFullName);
                writer.writeString("Package version: " + packageVersion);
                writer.writeString("User id: " + that._feedback.userid);

                return writer.storeAsync().then(finalize, logError("Unable to write bug information to newly created file."));
            }, logError("Unable to open newly created bug file."))
            .done(function () {
                uploadFiles(uploadFilePaths);
            }, logError("Unable to flush bug information to file stream."));
        }
    };

    proto._loadIframe = function (iframe, surveyId) {
        /// <summary>Loads an FMS inline survey in the given iframe</summary>
        /// <param name="iframe" type="DOMElement">Iframe</param>
        /// <param name="surveyId" type="Number">ID of the FMS survey</param>
        var surveyConfig = {
            target: "", // Will also be set in survey_helper.html
            template: "default", // Will be overriden, anyways
            enableLTS: 0,
            survey: {
                language: SasManager.getLanguage(),
                id: surveyId,
                host: SasManager.getConfig().fmsDomain,
                features: ["Title,AllNormalPages,NextButton,Thankyou,SubmitButton,PreviousButton"],
                renderOption: "noDefault,overrideall"
            },
            site: {
                name: this._id,
                id: "3",
                brand: "3"
            },
            content: {
                id: "7D36270F8ABD495CADEF88DE0F0B904A",
                type: "kb",
                aggregateId: "Sas"
            },
            parameters: [this._feedback.application,
                        this._feedback.userid,
                        this._feedback.build,
                        this._feedback.device,
                        this._feedback.isBeta,
                        SasManager.getMarket()],
            localCss: "//Microsoft.WinJS.2.0/css/ui-light.css", // Flyout uses the light theme
            loadTimeout: 15000, // The time, in ms, before we give up trying to load the survey,
            localizedAppName: this._localizedAppName
        };

        iframe.src = Jx.Sas.HELPER_PAGE_URL + "?" + JSON.stringify(surveyConfig);
    };

    proto._onMessage = function (evt) {
        ///<summary>Handles postMessage from the iframes</summary>
        ///<param name="evt" type="PostMessage">Event data from the post message</param>
        var msg = /*@static_cast(PostMessageData)*/evt.data;
        if (evt.origin === Jx.Sas.POST_MESSAGE_URL) {
            if (msg.badLoad) {
                if (this._loadState === Jx.Sas.LoadState.loading || this._loadState === Jx.Sas.LoadState.jsLoaded) {
                    document.getElementById("sasLoadHeaderText").innerText = Jx.res.getString("/strings/sasBadLoadHeader");
                    document.getElementById("sasLoadText").innerText = Jx.res.getString("/strings/sasBadLoad");
                    document.getElementById("sasLoadSpinner").outerText = "";
                    this._loadState = Jx.Sas.LoadState.error;
                    // Instrument the error
                    Jx.bici.increment(Microsoft.WindowsLive.Instrumentation.Ids.General.sendSmileErrorCount, 1);

                    // If we were unable to pull down the JS, assume it was a network issue. If we did pull down the JS
                    // but were unable to load anyways (because the subsequent call to the handler failed), record a fault
                    var errType = this._loadState === Jx.Sas.LoadState.jsLoaded ? Microsoft.WindowsLive.Instrumentation.ErrorType.network : Microsoft.WindowsLive.Instrumentation.ErrorType.fault;

                    this._recordQos(this._startLoadTime, 2, errType);
                }
            } else if (msg.loaded) {
                if (this._loadState === Jx.Sas.LoadState.loading || this._loadState === Jx.Sas.LoadState.jsLoaded) {
                    // We loaded the survey in the iframe
                    document.getElementById("sasLoadCtr").outerText = "";
                    document.getElementById("sasForm").style.display = "block";
                    this._loadState = Jx.Sas.LoadState.firstPage;

                    // Record the success
                    this._recordQos(this._startLoadTime, 0, Microsoft.WindowsLive.Instrumentation.ErrorType.success);
                }
            } else if (msg.jsLoaded) {
                if (this._loadState === Jx.Sas.LoadState.loading) {
                    // We pulled down surveystrapper.js from FMS
                    this._loadState = Jx.Sas.LoadState.jsLoaded;
                }
            } else if (msg.submitted) {
                // Upload logs
                this.collectAndUploadLogs(this._feedback.application, msg.textInput);
                this._loadState = Jx.Sas.LoadState.submitted;

                // Instrument the submission
                Jx.bici.addToStream(Microsoft.WindowsLive.Instrumentation.Ids.General.sendSmile, 0);
            } else if (msg.onFirstPage && this._loadState === Jx.Sas.LoadState.secondPage) {
                this._loadState = Jx.Sas.LoadState.firstPage;
            } else if (msg.onFirstPage !== undefined && this._loadState === Jx.Sas.LoadState.firstPage) {
                this._loadState = Jx.Sas.LoadState.secondPage;

                // If we are not on the first page AND show help is true, show the help flyout
                if (msg.showHelp) {
                    Jx.bici.increment(Microsoft.WindowsLive.Instrumentation.Ids.General.sendSmile, 1);
                    this._loadState = Jx.Sas.LoadState.submitted;
                    var showJxHelpFlyout = true;
                    var appId = Jx.appId ? Jx.appId : 0;

                    if (appId === Jx.AppId.photo) {
                        try {
                            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                            var settingsView = new window.PhotoViewer.SettingsView();
                            settingsView.helpPaneInvoked();
                            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

                            showJxHelpFlyout = false;
                        } catch (ex) {
                            Jx.log.exception("Feedback: Unable to show Photo-specific Help Flyout", ex);
                        }
                    } else if (SasManager._helpFlyoutCallbackFn) {
                        try {
                            SasManager._helpFlyoutCallbackFn();
                        } catch (ex) {
                            Jx.log.exception("Feedback: Unable to show app-specific Help Flyout", ex);
                        }
                    }

                    if (showJxHelpFlyout) {
                        var helpUrl = SasManager._config.application.lookup(appId).helpFlyoutUrl;
                        if (helpUrl) {
                            this._launchUrl(helpUrl);
                        }
                    }

                    this.hide();
                }
            } // Ignore bad messages
        }
    };

    proto._recordQos = function (startTime, errorCode, errorType) {
        /// <summary>
        /// Logs QoS data by calling the BICI API
        /// </summary>
        /// <param name="startTime" type="Number">Time when the API was first called</param>
        /// <param name="errorCode" type="Number">Return code of the resulting action</param>
        /// <param name="errorType" type="Microsoft.WindowsLive.Instrumentation.ErrorType">Categorization of 'returnCode' into a category</param>
        try {
            var duration = new Date().getTime() - startTime;
            var WLI = Microsoft.WindowsLive.Instrumentation;
            Jx.bici.recordDependentApiQos(WLI.ScenarioId.modernSendaSmile_ShowSurvey, WLI.ApiId.fms_LoadSurvey, WLI.PropertyId.fms, duration, 0, errorCode, errorType, null);
            Jx.bici.recordScenarioQos(WLI.ScenarioId.modernSendaSmile_ShowSurvey, WLI.PropertyId.fms, duration, 0, errorCode, errorType, null);
        } catch (ex) {
             Jx.log.exception("Feedback: Unable to record QoS", ex);
        }
    };

    proto._collectFeedback = function () {
        /// <summary>Collects feedback parameters (device and package name)</summary>
        var hasKeyboard = new Windows.Devices.Input.KeyboardCapabilities().keyboardPresent;
        var hasMouse = new Windows.Devices.Input.MouseCapabilities().mousePresent;
        var hasTouch = new Windows.Devices.Input.TouchCapabilities().touchPresent;

        this._feedback.device = hasKeyboard + "," + hasMouse + "," + hasTouch;
        this._feedback.build = Windows.ApplicationModel.Package.current.id.fullName;
    };

    proto._handleBackButton = function () {
        ///<summary>Fired when the user clicks the "back" button. Will take user back to settings pane or go to the previous page in the survey</summary>
        if (this._loadState !== Jx.Sas.LoadState.secondPage) {
            this.hide();
            Windows.UI.ApplicationSettings.SettingsPane.show();
        } else {
            this._surveyFrame.contentWindow.postMessage({backButtonPressed: true}, Jx.Sas.POST_MESSAGE_URL);
        }
    };

    proto._onHide = function () {
        ///<summary>Fired when the settings flyout is hidden</summary>
        if (this._loadState === Jx.Sas.LoadState.submitted || this._loadState === Jx.Sas.LoadState.error) {
            this.shutdownUI();
        }

        SasManager.fireHideEvent();
    };

    proto._addCss = function (href) {
        ///<summary>Adds a link element to the DOM</summary>
        ///<param name="href" type="String">The URL of the CSS file to reference</param>
        var cssFile = document.createElement("link");
        cssFile.type = "text/css";
        cssFile.rel = "stylesheet";
        cssFile.href = href;

        document.head.appendChild(cssFile);
    };

    proto._launchUrl = function (url) {
        var Sys = Windows.System;
        var options = new Sys.LauncherOptions();
        options.desiredRemainingView = Windows.UI.ViewManagement.ViewSizePreference.useHalf;
        Sys.Launcher.launchUriAsync(new Windows.Foundation.Uri(url), options).done();
    }

});
