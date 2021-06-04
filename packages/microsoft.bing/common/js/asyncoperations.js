/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='tracing.js' />
/// <reference path='utilities.js' />
/// <reference path='errors.js' />
(function () {
    "use strict";

    /// <summary>
    /// Constant string used as name of anonymous async operation.
    /// </summary>
    var anonymousOperationName = "Anonymous";

    /// <summary>
    /// Defines class that implements common pattern for executing asynchronous operation.
    /// </summary>
    var AsyncOperation = WinJS.Class.define(
        function (name) {
            /// <summary>
            /// Creates an AsyncOperation object that lays foundation for executing asynchronous
            /// operation using promises.
            /// </summary>
            /// <param name="name" optional="true" type="String">
            /// The name of the operation. This is used in traces output by this class.
            /// </param>
            /// <returns type="BingApp.Classes.AsyncOperation">
            /// AsyncOperation instance with .operationName property populated.
            /// </returns>
            if (!(this instanceof BingApp.Classes.AsyncOperation)) {
                BingApp.traceWarning("AsyncOperation.ctor: Attempted using AsyncOperation ctor as function; redirecting to use 'new AsyncOperation()'.");
                return new BingApp.Classes.AsyncOperation(name);
            }

            this.operationName = name || anonymousOperationName;
        },
        {
            run: function (options) {
                /// <summary>
                /// Starts execution of asynchronous operation.
                /// </summary>
                /// <param name="options" optional="true">
                /// Optional options object that can have additional information required to 
                /// execute operation.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise that will complete when operation is done.
                /// </returns>
                /// <remarks>
                /// If this instance is in the middle of executing aysnchronous operation then
                /// this method will call .shouldContinue method and will either will continue
                /// executing current operation by returning reference to existing promise or 
                /// will cancel current operation and start new one.
                /// </remarks>
                if (this.isRunning()) {
                    // Check if instance want to continue running current operation or cancel it
                    // and start new one.
                    if (this.shouldContinue(this.currentOptions, options)) {
                        return this.currentPromise;
                    }

                    // Cancel any ongoing operation
                    this.cancel();
                }

                // Store reference to passed options; it will be used in case this method is called
                // again before operation is completed.
                this.currentOptions = options;

                var that = this;
                this.currentPromise = new WinJS.Promise(
                    function init(complete, error) {
                        that.handleStart(options);
                        that.currentOperation = that.handleExecute(options);
                        that.currentOperation.done(
                            function onComplete(result) {
                                that.handleComplete(options, result);
                                that.currentOperation = null;
                                complete(result);
                            },
                            function onError(err) {
                                if (BingApp.Utilities.isPromiseCancellationError(err)) {
                                    that.handleComplete(options, undefined, true);
                                } else {
                                    that.handleComplete(options, undefined, false, err);
                                }
                                that.currentOperation = null;
                                error(err);
                            });
                    },
                    this.cancel);
                return this.currentPromise;
            },
            cancel: function () {
                /// <summary>
                /// Cancels currently running operation.
                /// </summary>
                if (this.currentOperation) {
                    BingApp.traceInfo("AsyncOperation.cancel: cancelling current <{0}> operation upon request.", this.operationName);
                    this.currentOperation.cancel();
                }
            },
            isRunning: function () {
                /// <summary>
                /// Gets a value indicating whether this instance is in the process of executing 
                /// asynchronous operation.
                /// </summary>
                /// <returns type="Boolean">
                /// True to indicate that this instance is executing operation; false, otherwise.
                /// </returns>
                return this.currentOperation ? true : false;
            },
            then: function (handleComplete, onError) {
                /// <summary>
                /// Allows to specify the work to be done on the completion of the running operation.
                /// </summary>
                /// <param name="handleComplete" optional="true" type="Function">
                /// The function to be called if current operation is completed successfully with result. 
                /// The result is passed as the single argument. If the result is null, the result is returned. 
                /// The result of the operation becomes the result of the promise returned by then. 
                /// If an exception is thrown while this function is being executed, the promise returned 
                /// by then moves into the error state.
                /// </param>
                /// <param name="onError" optional="true" type="Function">
                /// The function to be called if the operation is completed with an error. The error is passed 
                /// as the single argument. If it is null, the error is forwarded. The value returned from the 
                /// function becomes the fulfilled value of the promise returned by then.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A promise whose value is the result of executing completion functions specified 
                /// in method parameters.
                /// </returns>
                var promise = this.currentPromise || WinJS.Promise.as();
                return promise.then.apply(promise, arguments);
            },
            done: function (handleComplete, onError) {
                /// <summary>
                /// Allows to specify the work to be done on the completion of the running operation.
                /// After the handlers have finished executing, this function throws any error that 
                /// would have been returned from then as a promise in the error state.
                /// </summary>
                /// <param name="handleComplete" optional="true" type="Function">
                /// The function to be called if current operation is completed successfully with result.
                /// The result is passed as the single argument. If the result is null, the result is returned.
                /// The result of the operation becomes the value returned by done. If an exception is thrown 
                /// while this function is being executed, then it will be surface to the caller of this method.
                /// </param>
                /// <param name="onError" optional="true" type="Function">
                /// The function to be called if the operation is completed with an error. The error is passed
                /// as the single argument. If it is null, the error is forwarded. The value returned from the
                /// function becomes the result of this operation.
                /// </param>
                var promise = this.currentPromise || WinJS.Promise.as();
                promise.done.apply(promise, arguments);
            },
            shouldContinue: function (oldOptions, newOptions) {
                /// <summary>
                /// This method is called from .run method when this instance is already in the process of
                /// executing operation. It determines whether this instance should continue execution or
                /// should cancel it.
                /// </summary>
                /// <param name="oldOptions">
                /// Options that are used by current operation.
                /// </param>
                /// <param name="newOptions">
                /// Options that were passed to .run() method.
                /// </param>
                /// <returns type="Boolean">
                /// True to indicate that current operation should continue execution; otherwise, false
                /// to indicate that current operation should be cancelled and new started.
                /// </returns>
                /// <remarks>
                /// Default implementation returns result of .matchOptions method. Override this method
                /// if your class requires diferent logic to determine continuation of executing current
                /// operation.
                /// </remarks>
                return this.matchOptions(oldOptions, newOptions);
            },
            matchOptions: function (options1, options2) {
                /// <summary>
                /// This method is called to compare two options objects.
                /// </summary>
                /// <param name="options1">
                /// First option object.
                /// </param>
                /// <param name="options2">
                /// Second option object to compare to.
                /// </param>
                /// <returns type="Boolean">
                /// True to indicate that passed options objects match; otherwise, false.
                /// </returns>
                /// <remarks>
                /// Default implementation does reference comparison. Override this method if your class 
                /// requires different logic.
                /// </remarks>
                return options1 === options2;
            },
            handleStart: function (options) {
                /// <summary>
                /// This method is called before starting operation execution.
                /// </summary>
                /// <param name="options" optional="true">
                /// Optional options object that can have additional information required to
                /// execute operation.
                /// </param>
                /// <remarks>
                /// Override this method if your class needs to do some pre-processing before 
                /// executing operation.
                /// </remarks>
                BingApp.traceInfo("AsyncOperation.handleStart: starting <{0}> operation.", this.operationName);
            },
            handleExecute: function (options) {
                /// <summary>
                /// This method is called to execute operation.
                /// </summary>
                /// <param name="options" optional="true">
                /// Optional options object that can have additional information required to
                /// execute operation.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A Promise that will complete when operation is executed.
                /// </returns>
                /// <remarks>
                /// Default implementation with throw error so you must override this method in your class.
                /// </remarks>
                var methodName = "AsyncOperation.handleExecute";
                return WinJS.Promise.wrapError(new BingApp.Classes.ErrorInvalidOperation(
                    methodName,
                    BingApp.Utilities.format(WinJS.Resources.getString("error_must_override").value, methodName)));
            },
            handleComplete: function (options, result, canceled, error) {
                /// <summary>
                /// This method is called right after operation execution is completed.
                /// </summary>
                /// <param name="options">
                /// Options object that can have additional information required to execute operation.
                /// </param>
                /// <param name="result">
                /// Result of operation. It will be undefined if operation was cancelled or completed 
                /// with error.
                /// </param>
                /// <param name="canceled">
                /// Indicates whether the operation was cancelled.
                /// </param>
                /// <param name="error">
                /// Error object if operation was completed with error. It will be undefined if operation 
                /// completed successfully.
                /// </param>
                /// <remarks>
                /// Override this method if your class needs to do some post-processing before
                /// results are reported via promise object.
                /// </remarks>
                if (error) {
                    BingApp.traceInfo("AsyncOperation.handleComplete: <{0}> operation completed with error.", this.operationName);
                } else if (canceled) {
                    BingApp.traceInfo("AsyncOperation.handleComplete: <{0}> operation was cancelled.", this.operationName);
                } else {
                    BingApp.traceInfo("AsyncOperation.handleComplete: <{0}> operation completed.", this.operationName);
                }
            }
        });

    // Expose AsyncOperation class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        AsyncOperation: AsyncOperation
    });

    /// <summary>
    /// Defines class that implements asynchronous operation for loading object from JSON file.
    /// </summary>
    var LoadJsonOperation = WinJS.Class.derive(
        BingApp.Classes.AsyncOperation,
        function () {
            /// <summary>
            /// Creates a LoadJsonOperation object that implements asynchronous operation for 
            /// loading object from JSON file.
            /// </summary>
            /// <returns type="BingApp.Classes.LoadJsonOperation">
            /// LoadJsonOperation instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.LoadJsonOperation)) {
                BingApp.traceWarning("LoadJsonOperation.ctor: Attempted using LoadJsonOperation ctor as function; redirecting to use 'new LoadJsonOperation()'.");
                return new BingApp.Classes.LoadJsonOperation();
            }

            BingApp.Classes.AsyncOperation.call(this, "LoadJsonOperation");
        },
        {
            matchOptions: function (options1, options2) {
                /// <summary>
                /// This method is called to compare two options objects.
                /// </summary>
                /// <param name="options1">
                /// First option object.
                /// </param>
                /// <param name="options2">
                /// Second option object to compare to.
                /// </param>
                /// <returns type="Boolean">
                /// True to indicate that passed options objects match; otherwise, false.
                /// </returns>
                var fileLocation1 = this._getFileLocationFromOptions(options1);
                var fileLocation2 = this._getFileLocationFromOptions(options2);
                return fileLocation1 === fileLocation2;
            },
            handleStart: function (options) {
                /// <summary>
                /// This method is called before starting operation execution.
                /// </summary>
                /// <param name="options" optional="true">
                /// Optional options object that can have additional information required to
                /// execute operation.
                /// </param>
                var fileLocation = this._getFileLocationFromOptions(options);
                BingApp.traceInfo("LoadJsonOperation.handleStart: started loading object from {0} file.", fileLocation);
            },
            handleExecute: function (options) {
                /// <summary>
                /// This method is called to execute operation.
                /// </summary>
                /// <param name="options" optional="true">
                /// Optional options object that can have additional information required to
                /// execute operation.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A Promise that will complete when operation is executed.
                /// </returns>
                var fileLocation = this._getFileLocationFromOptions(options);
                return BingApp.Utilities.jsonLoader(fileLocation);
            },
            handleComplete: function (options, result, canceled, error) {
                /// <summary>
                /// This method is called right after operation execution is completed.
                /// </summary>
                /// <param name="options">
                /// Options object that can have additional information required to execute operation.
                /// </param>
                /// <param name="result">
                /// Result of operation. It will be undefined if operation was cancelled or completed
                /// with error.
                /// </param>
                /// <param name="canceled">
                /// Indicates whether the operation was cancelled.
                /// </param>
                /// <param name="error">
                /// Error object if operation was completed with error. It will be undefined if operation
                /// completed successfully.
                /// </param>
                var fileLocation = this._getFileLocationFromOptions(options);
                if (error) {
                    BingApp.traceInfo("LoadJsonOperation.handleComplete: failed to load object from {0} file.", fileLocation);
                } else if (canceled) {
                    BingApp.traceInfo("LoadJsonOperation.handleComplete: cancelled loading from {0} file.", fileLocation);
                } else {
                    BingApp.traceInfo("LoadJsonOperation.handleComplete: finished loading from {0} file.", fileLocation);
                }
            },
            _getFileLocationFromOptions: function (options) {
                /// <summary>
                /// Extracts file location from given options object.
                /// </summary>
                /// <param name="options">
                /// Options object that contains file location information.
                /// </param>
                /// <returns>
                /// File location stored in options object.
                /// </returns>
                if (BingApp.Utilities.isNullOrUndefined(options)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("options");
                }

                var fileLocation = options.fileLocation;
                if (BingApp.Utilities.isNullOrUndefined(fileLocation)) {
                    throw new BingApp.Classes.ErrorArgument("options");
                }

                return fileLocation;
            }
        });

    // Expose LoadJsonOperation class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        LoadJsonOperation: LoadJsonOperation
    });
})();
