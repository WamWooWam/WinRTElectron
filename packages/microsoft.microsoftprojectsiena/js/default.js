//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    WinJS.Binding.optimizeBindingReferences = !0;
    var promise,
        mediaFeatureCheck = function() {
            var vid = document.createElement("video");
            try {
                vid.src = ""
            }
            catch(err) {
                return !1
            }
            return !0
        };
    WinJS.Application.onactivated = function onActivated(args) {
        var activation = Windows.ApplicationModel.Activation;
        AppMagic.Utility.disableAutoUrlDetect();
        var hasMediaSupport = mediaFeatureCheck();
        if (promise || (promise = AppMagic.Settings.instance.load().then(function() {
            return WinJS.UI.processAll()
        }).then(function() {
            return hasMediaSupport ? AppMagic.context.shellViewModel.firstRun.checkIfShowFirstRunExperience() : AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.InvalidSKUTitle, AppMagic.AuthoringStrings.InvalidSKUMessage, !1, function() {
                    MSApp.terminateApp(new Error(AppMagic.AuthoringStrings.InvalidSKUMessage))
                }), ko.applyBindings(AppMagic.context.shellViewModel.firstRun, document.querySelector(".firstLaunch")), ko.applyBindings(AppMagic.context.shellViewModel, document.getElementById("rootGrid")), document.getElementById("rootGrid").focus(), WinJS.Navigation.navigate("/pages/blank/blankPage.html")
        })), args.detail.kind === activation.ActivationKind.launch)
            promise.then(function() {
                return args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated || args.detail.previousExecutionState === activation.ApplicationExecutionState.closedByUser && AppMagic.context.wasDocumentDirtyOnLastSuspend() ? AppMagic.AuthoringTool.Utility.StartupWinjsControlProgress.ready.then(function() {
                        return AppMagic.Controls.Importer.waitForControlImport()
                    }).then(function() {
                        return AppMagic.context.resumeFromTerminateAsync(WinJS.Application.sessionState)
                    }) : WinJS.Promise.join([AppMagic.AuthoringTool.Runtime.onNewSessionAsync(), Microsoft.AppMagic.Authoring.Document.cleanupResourcesFolder()])
            }),
            hasMediaSupport && promise.then(function() {
                topAppBar.winControl.show()
            }),
            args.setPromise(promise);
        else if (hasMediaSupport && args.detail.kind === activation.ActivationKind.file) {
            var file = args.detail.files[0];
            promise.then(function() {
                return AppMagic.Controls.Importer.waitForControlImport().then(function() {
                        return args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated || args.detail.previousExecutionState === activation.ApplicationExecutionState.suspended ? AppMagic.AuthoringTool.Utility.StartupWinjsControlProgress.ready.then(function() {
                                return WinJS.Application.sessionState && WinJS.Application.sessionState.document.hasUnsavedChanges ? AppMagic.context.resumeFromTerminateAsync(WinJS.Application.sessionState).then(function() {
                                        return AppMagic.context.openFileDirect(file)
                                    }) : AppMagic.context.openFileDirect(file)
                            }) : AppMagic.context.openFileDirect(file)
                    })
            });
            args.setPromise(promise)
        }
        typeof Microsoft.AppMagic.Common != "undefined" && typeof Microsoft.AppMagic.Common.Debug != "undefined" && AppMagic.AuthoringTool.DomUtil.injectScript("/js/authoring/console.js")
    };
    Platform.UI.WebUI.WebUIApplication.addEventListener("resuming", function(args) {
        WinJS.Application.sessionState && AppMagic.context.resumeFromSuspendAsync(WinJS.Application.sessionState)
    }, !1);
    WinJS.Application.oncheckpoint = function(args) {
        args.setPromise(AppMagic.context.suspendAsync(WinJS.Application.sessionState))
    };
    WinJS.Application.onerror = function(args) {
        var crashFilename = "SienaCrashCallStack.txt";
        return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(crashFilename, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function(crashFile) {
                var errorMsg = "Error is undefined.";
                return typeof args.detail.errorMessage != "undefined" ? errorMsg = "Error message : '" + args.detail.errorMessage + "'\nError location: " + args.detail.errorUrl + ", " + args.detail.errorLine : typeof args.detail.exception != "undefined" && (errorMsg = "Error message : '" + args.detail.exception.message + "'\nError call stack:\n" + args.detail.exception.stack), errorMsg = errorMsg.split("\n").join("\r\n"), Windows.Storage.FileIO.writeTextAsync(crashFile, errorMsg)
            }), !1
    };
    WinJS.Application.onsettings = function(e) {
        AppMagic.AuthoringTool.Utility.addLinkButtonToSettingsPane(e, "help", AppMagic.AuthoringStrings.Help, AppMagic.AuthoringStrings.HelpUrl);
        AppMagic.AuthoringTool.Utility.addLinkButtonToSettingsPane(e, "privacy", AppMagic.AuthoringStrings.Privacy, AppMagic.AuthoringStrings.PrivacyUrl)
    };
    WinJS.Application.start()
})(Windows);