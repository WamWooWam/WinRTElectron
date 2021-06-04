/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='tracing.js' />
/// <reference path='utilities.js' />
(function () {
    "use strict";

    /// <summary>
    /// Shortcut for format utility function.
    /// </summary>
    var format = BingApp.Utilities.format;

    WinJS.Namespace.define("BingApp.Classes", {
        ErrorInvalidOperation: WinJS.Class.derive(Error, function (operationName, message) {
            /// <summary>
            /// Creates an Error object that is thrown to indicate execution of invalid operation.
            /// </summary>
            /// <param name="operationName" type="String">
            /// The name of the invalid operation.
            /// </param>
            /// <param name="message" type="String" optional="true">
            /// The message for this error. The message is meant to be consumed by humans and should be localized.
            /// </param>
            /// <returns type="Error">
            /// Error instance with .name and .message properties populated.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ErrorInvalidOperation)) {
                BingApp.traceWarning("ErrorInvalidOperation.ctor: Attempted using ErrorInvalidOperation ctor as function; redirecting to use 'new ErrorInvalidOperation()'.");
                return new BingApp.Classes.ErrorInvalidOperation(operationName, message);
            }

            if (BingApp.Utilities.isNullOrUndefined(operationName)) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("operationName");
            }

            this.name = "BingApp.Errors.InvalidOperation";
            this.message = message || format(WinJS.Resources.getString("error_invalid_operation").value, operationName);
            this.operationName = operationName;
        }),
        ErrorArgument: WinJS.Class.derive(Error, function (argumentName, message) {
            /// <summary>
            /// Creates an Error object that is thrown to indicate invalid value for function argument.
            /// </summary>
            /// <param name="argumentName" type="String">
            /// The name of the argument with invalid value.
            /// </param>
            /// <param name="message" type="String" optional="true">
            /// The message for this error. The message is meant to be consumed by humans and should be localized.
            /// </param>
            /// <returns type="Error">
            /// Error instance with .name and .message properties populated.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ErrorArgument)) {
                BingApp.traceWarning("ErrorArgument.ctor: Attempted using ErrorArgument ctor as function; redirecting to use 'new ErrorArgument()'.");
                return new BingApp.Classes.ErrorArgument(argumentName, message);
            }

            if (BingApp.Utilities.isNullOrUndefined(argumentName)) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("argumentName");
            }

            this.name = "BingApp.Errors.Argument";
            this.message = message || format(WinJS.Resources.getString("error_argument").value, argumentName);
            this.argumentName = argumentName;
        }),
        ErrorArgumentNullOrUndefined: WinJS.Class.derive(Error, function (argumentName, message) {
            /// <summary>
            /// Creates an Error object that is thrown to indicate null or undefined value 
            /// for function argument.
            /// </summary>
            /// <param name="argumentName" type="String">
            /// The name of the argument with invalid value.
            /// </param>
            /// <param name="message" type="String" optional="true">
            /// The message for this error. The message is meant to be consumed by humans and should be localized.
            /// </param>
            /// <returns type="Error">
            /// Error instance with .name and .message properties populated.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ErrorArgumentNullOrUndefined)) {
                BingApp.traceWarning("ErrorArgumentNullOrUndefined.ctor: Attempted using ErrorArgumentNullOrUndefined ctor as function; redirecting to use 'new ErrorArgumentNullOrUndefined()'.");
                return new BingApp.Classes.ErrorArgumentNullOrUndefined(argumentName, message);
            }

            if (BingApp.Utilities.isNullOrUndefined(argumentName)) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("argumentName");
            }

            this.name = "BingApp.Errors.ArgumentNullOrUndefined";
            this.message = message || format(WinJS.Resources.getString("error_argument_null_or_undefined").value, argumentName);
            this.argumentName = argumentName;
        }),
        ErrorNavigationPath: WinJS.Class.derive(Error, function (path, message) {
            /// <summary>
            /// Creates an Error object that is thrown to indicate failure to resolve navigation path.
            /// </summary>
            /// <param name="path" type="String">
            /// The navigation path that was failed to be resolved.
            /// </param>
            /// <param name="message" type="String" optional="true">
            /// The message for this error. The message is meant to be consumed by humans and should be localized.
            /// </param>
            /// <returns type="Error">
            /// Error instance with .name and .message properties populated.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ErrorNavigationPath)) {
                BingApp.traceWarning("ErrorNavigationPath.ctor: Attempted using ErrorNavigationPath ctor as function; redirecting to use 'new ErrorNavigationPath()'.");
                return new BingApp.Classes.ErrorNavigationPath(path, message);
            }

            if (BingApp.Utilities.isNullOrUndefined(path)) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("path");
            }

            this.name = "BingApp.Errors.NavigationPath";
            this.message = message || format(WinJS.Resources.getString("error_navigation_path").value, path);
            this.path = path;
        }),
        ErrorViewRegistration: WinJS.Class.derive(Error, function (viewId, message) {
            /// <summary>
            /// Creates an Error object that is thrown to indicate failure to find registration
            /// information for view with given id.
            /// </summary>
            /// <param name="viewId" type="String">
            /// The view id that was not found in view registry.
            /// </param>
            /// <param name="message" type="String" optional="true">
            /// The message for this error. The message is meant to be consumed by humans and should be localized.
            /// </param>
            /// <returns type="Error">
            /// Error instance with .name and .message properties populated.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ErrorViewRegistration)) {
                BingApp.traceWarning("ErrorViewRegistration.ctor: Attempted using ErrorViewRegistration ctor as function; redirecting to use 'new ErrorViewRegistration()'.");
                return new BingApp.Classes.ErrorViewRegistration(viewId, message);
            }

            if (BingApp.Utilities.isNullOrUndefined(viewId)) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("viewId");
            }

            this.name = "BingApp.Errors.ViewRegistration";
            this.message = message || format(WinJS.Resources.getString("error_view_not_registered").value, viewId);
            this.viewId = viewId;
        }),
        ErrorViewLoadingFailure: WinJS.Class.derive(Error, function (viewId, message) {
            /// <summary>
            /// Creates an Error object that is thrown to indicate failure to load view with given id.
            /// </summary>
            /// <param name="viewId" type="String">
            /// The id for the view that failed to load.
            /// </param>
            /// <param name="message" type="String" optional="true">
            /// The message for this error. The message is meant to be consumed by humans and should be localized.
            /// </param>
            /// <returns type="Error">
            /// Error instance with .name and .message properties populated.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ErrorViewLoadingFailure)) {
                BingApp.traceWarning("ErrorViewLoadingFailure.ctor: Attempted using ErrorViewLoadingFailure ctor as function; redirecting to use 'new ErrorViewLoadingFailure()'.");
                return new BingApp.Classes.ErrorViewLoadingFailure(viewId, message);
            }

            if (BingApp.Utilities.isNullOrUndefined(viewId)) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("viewId");
            }

            this.name = "BingApp.Errors.ViewLoadingFailure";
            this.message = message || format(WinJS.Resources.getString("error_view_failed_to_load").value, viewId);
            this.viewId = viewId;
        })
    });
})();
