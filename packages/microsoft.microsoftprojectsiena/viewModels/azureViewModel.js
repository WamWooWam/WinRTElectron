//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var AzureViewModel = WinJS.Class.define(function AzureViewModel_ctor() {
            this._certFriendlyName = ko.observable("");
            this._certPassword = ko.observable("")
        }, {
            _certFriendlyName: null, _certPassword: null, certFriendlyName: {
                    get: function() {
                        return this._certFriendlyName()
                    }, set: function(value) {
                            this._certFriendlyName(value)
                        }
                }, certPassword: {
                    get: function() {
                        return this._certPassword()
                    }, set: function(value) {
                            this._certPassword(value)
                        }
                }, showAddCert: function() {
                    this._certFriendlyName("");
                    this._certPassword("");
                    this.dispatchEvent("showAddCert")
                }, importCert: function() {
                    this.dispatchEvent("hideAddCert");
                    var friendlyName = this.certFriendlyName,
                        pwd = this.certPassword,
                        picker = new Windows.Storage.Pickers.FileOpenPicker,
                        importError = function() {
                            AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.BackStateAzureCertImportTitle, AppMagic.AuthoringStrings.BackStateAzureCertImportFailed)
                        },
                        importSuccess = function() {
                            AppMagic.AuthoringTool.PlatformHelpers.showMessage(AppMagic.AuthoringStrings.BackStateAzureCertImportTitle, AppMagic.AuthoringStrings.BackStateAzureCertImportComplete)
                        };
                    picker.fileTypeFilter.append(".pfx");
                    picker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
                    picker.pickSingleFileAsync().then(function(file) {
                        return AppMagic.Services.Azure.importCertificateAsync(friendlyName, pwd, file)
                    }).done(importSuccess, importError)
                }
        }, {});
    WinJS.Class.mix(AzureViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {AzureViewModel: AzureViewModel})
})();