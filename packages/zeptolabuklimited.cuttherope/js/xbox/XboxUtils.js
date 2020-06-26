// Helper for common functions

WinJS.Namespace.define("ZL", {
    Util: {

        getErrorString: function (errorNumber) {
            // Map the errorNumber to pre-defined and localized error strings if available
            var errorString;
            switch (errorNumber) {
                case Microsoft.Xbox.Foundation.ErrorCode.spaFileError:
                case Microsoft.Xbox.Foundation.ErrorCode.notSignedIn:
                case Microsoft.Xbox.Foundation.ErrorCode.serverConnectionFailure:
                case Microsoft.Xbox.Foundation.ErrorCode.windowsLiveUserChanged:
                    errorString = "";
                    break;

                case Microsoft.Xbox.Foundation.ErrorCode.accountManagementRequired:
                case Microsoft.Xbox.Foundation.ErrorCode.userBanned:
                    errorString = Microsoft.Xbox.ResourceLoader.getStringById(Microsoft.Xbox.StringId.errorAccountNeedsManagement);
                    break;

                case Microsoft.Xbox.Foundation.ErrorCode.windowsLiveSignInFailure:
                case Microsoft.Xbox.Foundation.ErrorCode.xboxLIVESignInFailure:
                case Microsoft.Xbox.Foundation.ErrorCode.noXboxLIVEAccount:
                    errorString = Microsoft.Xbox.ResourceLoader.getStringById(Microsoft.Xbox.StringId.errorSignInFailed);
                    break;

                case Microsoft.Xbox.Foundation.ErrorCode.appReceiptError:
                case Microsoft.Xbox.Foundation.ErrorCode.noAppReceipt:
                    errorString = Microsoft.Xbox.ResourceLoader.getStringById(Microsoft.Xbox.StringId.errorProofOfPurchase);
                    break;

                case Microsoft.Xbox.Foundation.ErrorCode.serviceDeprecated:
                case Microsoft.Xbox.Foundation.ErrorCode.xboxLIVENeedsUpdate:
                    errorString = Microsoft.Xbox.ResourceLoader.getStringById(Microsoft.Xbox.StringId.errorServiceVersionOld);
                    break;

                case Microsoft.Xbox.Foundation.ErrorCode.termsOfServiceError:
                    errorString = Microsoft.Xbox.ResourceLoader.getStringById(Microsoft.Xbox.StringId.errorTermsOfServiceUpdate);
                    break;

                case Microsoft.Xbox.Foundation.ErrorCode.operationCancelled:
                    errorString = Microsoft.Xbox.ResourceLoader.getStringById(Microsoft.Xbox.StringId.errorSignInOrConsentNotGranted);
                    break;

                default:
                    errorString = Microsoft.Xbox.ResourceLoader.getStringById(Microsoft.Xbox.StringId.errorUnknown);
                    break;
            }
        }
    }
});
