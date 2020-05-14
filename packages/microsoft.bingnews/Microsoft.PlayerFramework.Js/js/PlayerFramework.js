(function (undefined) {
    "use strict";

    // Constants
    var invalidArgument = "Invalid argument.";
    var invalidResourceId = "Invalid resource identifier: {0}";
    var zeroDate = new Date(0, 0, 0, 0, 0, 0, 0);
    var isWinJS1 = (WinJS.Utilities.Scheduler === undefined);

    // Globalization
    var languages = Windows.System.UserProfile.GlobalizationPreferences.languages;
    var geographicRegion = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
    var calendar = Windows.System.UserProfile.GlobalizationPreferences.calendars[0];
    var clock = Windows.Globalization.ClockIdentifiers.twentyFourHour;

    // Formatters
    var timeFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(getResourceString("TimeFormat"), languages, geographicRegion, calendar, clock);
    var percentFormatter = new Windows.Globalization.NumberFormatting.PercentFormatter(languages, geographicRegion);

    percentFormatter.integerDigits = 1;
    percentFormatter.fractionDigits = 0;

    // Enumerations
    var AdvertisingState = {
        /// <field>No ad is loading or playing.</field>
        none: 0,
        /// <field>An ad is loading.</field>
        loading: 1,
        /// <field>A linear ad is playing.</field>
        linear: 2,
        /// <field>A non-linear ad is playing.</field>
        nonLinear: 3
    };

    var PlayerState = {
        /// <field>The player is unloaded and no media source is set.</field>
        unloaded: 0,
        /// <field>The media source is set and the player is waiting to load the media (e.g. autoload is false).</field>
        pending: 1,
        /// <field>The media source is set, but the player is still executing loading operations.</field>
        loading: 2,
        /// <field>The media has finished loading, but has not been opened yet.</field>
        loaded: 3,
        /// <field>The media can be played.</field>
        opened: 4,
        /// <field>The media has been told to start playing, but the player is still executing starting operations.</field>
        starting: 5,
        /// <field>The media has been started and the player is either playing or paused.</field>
        started: 6,
        /// <field>The media has finished, but the player is still executing ending operations.</field>
        ending: 7,
        /// <field>The media has ended.</field>
        ended: 8,
        /// <field>The media has failed and the player must be reloaded.</field>
        failed: 9
    };

    var ReadyState = {
        /// <field>The player has no information for the audio/video.</field>
        nothing: 0,
        /// <field>The player has metadata for the audio/video.</field>
        metadata: 1,
        /// <field>The player has data for the current playback position, but not enough data to play the next frame.</field>
        currentData: 2,
        /// <field>The player has data for the current playback position and at least the next frame.</field>
        futureData: 3,
        /// <field>The player has enough data available to start playing.</field>
        enoughData: 4
    };

    var NetworkState = {
        /// <field>The player has not yet initialized any audio/video.</field>
        empty: 0,
        /// <field>The player has active audio/video and has selected a resource, but is not using the network.</field>
        idle: 1,
        /// <field>The player is downloading data.</field>
        loading: 2,
        /// <field>The player has no audio/video source.</field>
        noSource: 3
    };

    var MediaQuality = {
        /// <field>Typically indicates less than 720p media quality.</field>
        standardDefinition: 0,
        /// <field>Typically indicates greater than or equal to 720p media quality.</field>
        highDefinition: 1
    };

    var MediaErrorCode = {
        /// <field>An unknown media error occurred.</field>
        unknown: 0,
        /// <field>Media playback was aborted.</field>
        aborted: 1,
        /// <field>Media download failed due to a network error.</field>
        network: 2,
        /// <field>Media playback was aborted due to a corruption problem or because unsupported features were used.</field>
        decode: 3,
        /// <field>Media source could not be loaded either because the server or network failed or because the format is not supported.</field>
        notSupported: 4
    };

    var ImageErrorCode = {
        /// <field>An unknown image error occurred.</field>
        unknown: 0,
        /// <field>Image download was aborted.</field>
        aborted: 1
    };

    var AutohideBehavior = {
        /// <field>No behaviors are applied to the autohide feature.</field>
        none: 0,
        /// <field>Autohide is allowed during media playback only.</field>
        allowDuringPlaybackOnly: 1,
        /// <field>Autohide is prevented when the pointer is over interactive components such as the control panel.</field>
        preventDuringInteractiveHover: 2,
        /// <field>All behaviors are applied to the autohide feature.</field>
        all: 3
    };

    var InteractionType = {
        /// <field>Indicates no interaction.</field>
        none: 0,
        /// <field>Indicates a "soft" interaction such as mouse movement or a timeout occurring.</field>
        soft: 1,
        /// <field>Indicates a "hard" interaction such as a tap, click, or a key is pressed.</field>
        hard: 2,
        /// <field>Indicates both "soft" and "hard" interactions.</field>
        all: 3
    };

    var TextTrackMode;
    if (isWinJS1) {
        TextTrackMode = {
            /// <field>The track is disabled.</field>
            off: 0,
            /// <field>The track is active, but the player is not actively displaying cues.</field>
            hidden: 1,
            /// <field>The track is active and the player is actively displaying cues.</field>
            showing: 2
        };
    }
    else {
        TextTrackMode = {
            /// <field>The track is disabled.</field>
            off: "off",
            /// <field>The track is active, but the player is not actively displaying cues.</field>
            hidden: "hidden",
            /// <field>The track is active and the player is actively displaying cues.</field>
            showing: "showing"
        };
    }

    var TextTrackDisplayMode = {
        /// <field>Indicates tracks should not be displayed.</field>
        none: 0,
        /// <field>Indicates tracks should be displayed using custom UI.</field>
        custom: 1,
        /// <field>Indicates tracks should be displayed using native UI.</field>
        native: 2,
        /// <field>Indicates tracks should be displayed using both custom and native UI. This is useful for debugging.</field>
        all: 3
    };

    var TextTrackReadyState = {
        /// <field>The track is unloaded.</field>
        none: 0,
        /// <field>The track is currently loading.</field>
        loading: 1,
        /// <field>The track is loaded.</field>
        loaded: 2,
        /// <field>The track failed to load.</field>
        error: 3
    };

    var ViewModelState = {
        /// <field>No media is loaded.
        unloaded: 0,
        /// <field>The media is loading.</field>
        loading: 1,
        /// <field>The media is paused.</field>
        paused: 2,
        /// <field>The media is playing.</field>
        playing: 3
    };

    // Functions
    function formatTime(value) {
        /// <summary>Formats the specified time value (in seconds) as a string.</summary>
        /// <param name="value" type="Number">The value to format.</param>
        /// <returns type="String">The formatted string.</returns>

        if (isFinite(value) && !isNaN(value) && value > 0) {
            value = new Date(0, 0, 0, 0, 0, value, 0);
        } else {
            value = zeroDate;
        }

        return timeFormatter.format(value);
    }

    function formatPercentage(value) {
        /// <summary>Formats the specified percentage value as a string.</summary>
        /// <param name="value" type="Number">The value to format.</param>
        /// <returns type="String">The formatted string.</returns>

        if (isFinite(value) && !isNaN(value) && value) {
            value = value.toFixed(4);
        } else {
            value = 0;
        }

        return percentFormatter.format(value);
    }

    function formatString(string /* , arg1, arg2, argN */) {
        /// <summary>Formats the specified string using the additional arguments provided.</summary>
        /// <param name="string" type="String">The string to format.</param>
        /// <returns type="String">The formatted string.</returns>

        // TODO: remove dependency on private implementation
        return WinJS.Resources._formatString.apply(null, arguments);
    }

    function formatResourceString(resourceId /* , arg1, arg2, argN */) {
        /// <summary>Formats the specified resource string using the additional arguments provided.</summary>
        /// <param name="resourceId" type="String">The resource identifier.</param>
        /// <returns type="String">The formatted resource string.</returns>

        var string = getResourceString(resourceId);
        
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(string);

        return formatString.apply(null, args);
    }

    function getResourceString(resourceId) {
        /// <summary>Returns the specified resource string.</summary>
        /// <param name="resourceId" type="String">The resource identifier.</param>
        /// <returns type="String">The resource string.</returns>

        // look in app resources
        var string = WinJS.Resources.getString("/PlayerFramework/" + resourceId);

        // look in component resources
        if (string.empty) {
            string = WinJS.Resources.getString("/Microsoft.PlayerFramework.Js/Resources/" + resourceId);
        }

        // resource not found
        if (string.empty) {
            throw formatString(invalidResourceId, resourceId);
        }

        return string.value;
    }

    function getMediaErrorMessage(error) {
        /// <summary>Gets an error message for the specified media error.</summary>
        /// <param name="error" type="MediaError">The error.</param>
        /// <returns type="String">The error message.</returns>

        return error ? getMediaErrorMessageForCode(error.code, error.msExtendedCode) : getMediaErrorMessageForCode(MediaErrorCode.unknown);
    }

    function getMediaErrorMessageForCode(code, extendedCode) {
        /// <summary>Gets an error message for the specified media error code.</summary>
        /// <param name="code" type="PlayerFramework.MediaErrorCode">The error code.</param>
        /// <param name="extendedCode" type="Number" optional="true">The extended error code.</param>
        /// <returns type="String">The error message.</returns>

        var message;

        switch (code) {
            case MediaErrorCode.aborted:
                message = "MEDIA_ERR_ABORTED"; 
                break;
            case MediaErrorCode.network:
                message = "MEDIA_ERR_NETWORK";
                break;
            case MediaErrorCode.decode:
                message = "MEDIA_ERR_DECODE";
                break;
            case MediaErrorCode.notSupported:
                message = "MEDIA_ERR_SRC_NOT_SUPPORTED";
                break;
            default:
                message = "MEDIA_ERR_UNKNOWN";
                break;
        }

        if (typeof extendedCode === "number") {
            message += " (" + convertDecimalToHex(extendedCode) + ")";
        }

        return message;
    }

    function getImageErrorMessageForCode(code) {
        /// <summary>Gets an error message for the specified image error code.</summary>
        /// <param name="code" type="PlayerFramework.ImageErrorCode">The error code.</param>
        /// <returns type="String">The error message.</returns>

        var message;

        switch (code) {
            case ImageErrorCode.aborted:
                message = "IMAGE_ERR_ABORTED";
                break;
            default:
                message = "IMAGE_ERR_UNKNOWN";
                break;
        }

        return message;
    }

    function getImageMimeTypes() {
        /// <summary>Returns an array of common image MIME types.</summary>
        /// <returns type="Array">The MIME types.</returns>

        var mimeTypes = [];
        var decoders = Windows.Graphics.Imaging.BitmapDecoder.getDecoderInformationEnumerator();

        for (var i = 0; i < decoders.length; i++) {
            var decoder = decoders[i];
            for (var j = 0; j < decoder.mimeTypes.length; j++) {
                var mimeType = decoder.mimeTypes[j];
                mimeTypes.push(mimeType);
            }
        }

        return mimeTypes;
    }

    function getArray(obj) {
        /// <summary>Gets an array from an "enumerable" object.</summary>
        /// <param name="obj" type="Object">The target object.</param>
        /// <returns type="Array">The array.</returns>

        if (obj) {
            if (Array.isArray(obj)) {
                return obj;
            } else if (typeof obj.length !== "undefined") {
                return Array.prototype.slice.call(obj);
            } else if (typeof obj.first === "function") {
                var array = [];

                for (var i = obj.first() ; i.hasCurrent; i.moveNext()) {
                    array.push(i.current);
                }

                return array;
            }
        }

        throw invalidArgument;
    }

    function setOptions(obj, options, defaults) {
        /// <summary>Applies a set of options to the properties and events of the specified object.</summary>
        /// <param name="obj" type="Object">The target object.</param>
        /// <param name="options" type="Object" optional="true">The options to apply.</param>
        /// <param name="defaults" type="Object" optional="true">The optional defaults to apply.</param>

        if (defaults) {
            options = extend({}, defaults, options);
        }

        if (options) {
            var keys = Object.keys(options);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var target = obj[key];
                var value = options[key];
                if (target instanceof PlayerFramework.PluginBase) {
                    setOptions(target, value);
                } else if (key.length > 2 && key.indexOf("on") === 0 && typeof value === "function" && obj.addEventListener) {
                    obj.addEventListener(key.substring(2), value);
                } else {
                    obj[key] = value;
                }
            }
        }
    }

    function convertDecimalToHex(value) {
        /// <summary>Converts a signed decimal value to a hexadecimal string.</summary>
        /// <param name="value" type="Number">The decimal value to convert.</param>
        /// <returns type="String">The hexadecimal string.</returns>

        return "0x" + (value >>> 0).toString(16).toUpperCase();
    }

    function convertHexToDecimal(value) {
        /// <summary>Converts a hexidecimal value to a signed decimal number.</summary>
        /// <param name="value" type="String">The hexidecimal value to convert.</param>
        /// <returns type="Number">The decimal number.</returns>

        var result = parseInt(value, 16);

        if ((result < 0x100) && (result & 0x80)) {
            result -= 0x100;
        } else if ((result < 0x10000) && (result & 0x8000)) {
            result -= 0x10000;
        } else if ((result < 0x100000000) && (result & 0x80000000)) {
            result -= 0x100000000;
        }

        return result;
    }

    function convertSecondsToTicks(value) {
        /// <summary>Converts the specified value (in seconds) to ticks.</summary>
        /// <param name="value" type="Number">The number of seconds to convert.</param>
        /// <returns type="Number">The number of ticks.</returns>

        return Math.round(value * 10000000);
    }

    function convertTicksToSeconds(value) {
        /// <summary>Converts the specified value (in ticks) to seconds.</summary>
        /// <param name="value" type="Number">The number of ticks to convert.</param>
        /// <returns type="Number">The number of seconds.</returns>

        return value / 10000000;
    }

    function convertMillisecondsToTicks(value) {
        /// <summary>Converts the specified value (in milliseconds) to ticks.</summary>
        /// <param name="value" type="Number">The number of milliseconds to convert.</param>
        /// <returns type="Number">The number of ticks.</returns>

        return value * 10000;
    }

    function convertTicksToMilliseconds(value) {
        /// <summary>Converts the specified value (in ticks) to milliseconds.</summary>
        /// <param name="value" type="Number">The number of ticks to convert.</param>
        /// <returns type="Number">The number of milliseconds.</returns>

        return value / 10000;
    }

    function calculateElapsedTime(currentTime, startTime, endTime) {
        /// <summary>Calculates the elapsed time (in seconds).</summary>
        /// <param name="currentTime" type="Number">The current time (in ticks).</param>
        /// <param name="startTime" type="Number">The start time (in ticks).</param>
        /// <param name="endTime" type="Number">The end time (in ticks).</param>
        /// <returns type="Number">The elapsed time.</returns>

        return Math.floor(convertTicksToSeconds(clamp(currentTime, startTime, endTime)));
    }

    function calculateRemainingTime(currentTime, startTime, endTime) {
        /// <summary>Calculates the remaining time (in seconds).</summary>
        /// <param name="currentTime" type="Number">The current time (in ticks).</param>
        /// <param name="startTime" type="Number">The start time (in ticks).</param>
        /// <param name="endTime" type="Number">The end time (in ticks).</param>
        /// <returns type="Number">The remaining time.</returns>

        return Math.floor(convertTicksToSeconds(endTime)) - Math.floor(convertTicksToSeconds(clamp(currentTime, startTime, endTime)));
    }

    function calculateBufferedTime(buffered) {
        /// <summary>Calculates the total buffered time.</summary>
        /// <param name="buffered" type="TimeRanges">The buffered time ranges.</param>
        /// <returns type="Number">The buffered time.</returns>

        if (!buffered) {
            return NaN;
        }

        var value = 0;

        for (var i = 0; i < buffered.length; i++) {
            value += buffered.end(i) - buffered.start(i);
        }

        return value;
    }

    function calculateBufferedPercentage(buffered, duration) {
        /// <summary>Calculates the buffered time as a percentage of the specified duration.</summary>
        /// <param name="buffered" type="TimeRanges">The buffered time ranges.</param>
        /// <param name="duration" type="Number">The duration.</param>
        /// <returns type="Number">The buffered percentage.</returns>

        if (!buffered || !duration) {
            return NaN;
        }

        var value = calculateBufferedTime(buffered) / duration;

        return clamp(value, 0, 1);
    }

    function launch(uri) {
        /// <summary>Launches the default application associated with the specified URI.</summary>
        /// <param name="uri" type="String">The URI.</param>
        /// <returns type="WinJS.Promise">The promise.</returns>

        if (uri) {
            return Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(uri));
        }

        return null;
    }

    function clamp(value, min, max) {
        /// <summary>Clamps a value to the specified minimum and maximum values.</summary>
        /// <param name="value" type="Number">The value to clamp.</param>
        /// <param name="min" type="Number">The minimum value.</param>
        /// <param name="max" type="Number">The maximum value.</param>
        /// <returns type="Number">The clamped value.</returns>

        if (!isNaN(min) && !isNaN(max)) {
            return Math.max(min, Math.min(max, value));
        } else if (!isNaN(min)) {
            return Math.max(min, value);
        } else if (!isNaN(max)) {
            return Math.min(max, value);
        } else {
            return value;
        }
    }

    function clone(obj /* , arg1, arg2, argN */) {
        /// <summary>Clones the specified object and extends it with the properties of the additional arguments provided.</summary>
        /// <param name="obj" type="Object">The object to clone.</param>
        /// <returns type="Object">The cloned object.</returns>

        var args = Array.prototype.slice.call(arguments);
        args.unshift({});

        return extend.apply(null, args);
    }

    function extend(obj /* , arg1, arg2, argN */) {
        /// <summary>Extends the specified object with the properties of the additional arguments provided.</summary>
        /// <param name="obj" type="Object">The object to extend.</param>
        /// <returns type="Object">The extended object.</returns>

        var args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            for (var property in arg) {
                obj[property] = arg[property];
            }
        }

        return obj;
    }

    function first(array, callback, thisObj) {
        /// <summary>Returns the first item in the array that passes the test implemented by the specified callback function.</summary>
        /// <param name="array" type="Array">The array to search.</param>
        /// <param name="callback" type="Function">A function that should return true if an item passes the test.</param>
        /// <param name="thisObj" type="Object" optional="true">The optional object to use as "this" when executing the callback.</param>
        /// <returns type="Object">The first item that passes the test.</returns>

        if (array === null || array === undefined) {
            throw invalidArgument;
        }

        if (typeof callback !== "function") {
            throw invalidArgument;
        }

        var obj = Object(array);
        var len = obj.length >>> 0;

        for (var i = 0; i < len; i++) {
            if (i in obj && callback.call(thisObj, obj[i], i, obj)) {
                return obj[i];
            }
        }

        return null;
    }

    function remove(array, item) {
        /// <summary>Removes the specified item from an array.</summary>
        /// <param name="array" type="Array">The array to search.</param>
        /// <param name="item" type="Object">The item to remove.</param>
        /// <returns type="Boolean">True if the item is removed.</returns>

        if (!(array instanceof Array)) {
            throw invalidArgument;
        }

        var index = array.indexOf(item);

        if (index !== -1) {
            array.splice(index, 1);
            return true;
        }

        return false;
    }

    function binaryInsert(array, value, comparer) {
        /// <summary>Inserts a value into a sorted array if it does not already exist.</summary>
        /// <param name="array" type="Array">The target array.</param>
        /// <param name="value" type="Object">The value to insert.</param>
        /// <param name="comparer" type="Function">The comparison function by which the array is sorted.</param>
        /// <returns type="Boolean">True if the value was inserted.</returns>

        var index = binarySearch(array, value, comparer);

        if (index < 0) {
            array.splice(-(index + 1), 0, value);
            return true;
        }

        return false;
    }

    function binarySearch(array, value, comparer) {
        /// <summary>Searches a sorted array for the specified value using the binary search algorithm.</summary>
        /// <param name="array" type="Array">The array to search.</param>
        /// <param name="value" type="Object">The value to search for.</param>
        /// <param name="comparer" type="Function">The comparison function by which the array is sorted.</param>
        /// <returns type="Number">The lowest index of the value if found, otherwise the insertion point.</returns>

        var left = 0;
        var right = array.length;
        var middle, compareResult, found;

        while (left < right) {
            middle = (left + right) >> 1;
            compareResult = comparer(value, array[middle]);
            if (compareResult > 0) {
                left = middle + 1;
            } else {
                right = middle;
                found = !compareResult;
            }
        }

        return found ? left : ~left;
    }

    function createElement(parent, options, namespace) {
        /// <summary>Creates a DOM element using the specified options.</summary>
        /// <param name="parent" type="HTMLElement" domElement="true" optional="true">The optional parent element.</param>
        /// <param name="options" type="Array">A JSON array containing the tag name, attributes, and child elements for the element.</param>
        /// <param name="namespace" type="Object" optional="true">An optional namespace for the element.</param>
        /// <returns type="HTMLElement" domElement="true">The created element.</returns>

        if (!(options instanceof Array) || options.length === 0 || typeof options[0] !== "string") {
            throw invalidArgument;
        }

        var element, attributes, namespace;

        if (options[1] && typeof options[1] === "object" && !(options[1] instanceof Array)) {
            attributes = options[1];
            namespace = attributes["xmlns"] || namespace;
        }

        // create the element
        if (namespace) {
            element = document.createElementNS(namespace, options[0]);
        } else {
            element = document.createElement(options[0]);
        }

        // set the attributes
        if (attributes) {
            for (var name in attributes) {
                var value = attributes[name];
                if (typeof value !== "string") {
                    element[name] = value;
                } else {
                    element.setAttribute(name, value);
                }
            }
        }

        // append the child elements
        for (var i = 1; i < options.length; i++) {
            var childOptions = options[i];
            if (childOptions instanceof Array) {
                createElement(element, childOptions, namespace);
            } else if (typeof childOptions === "string") {
                element.appendChild(document.createTextNode(childOptions));
            }
        }

        // append the element
        if (parent) {
            parent.appendChild(element);
        }

        return element;
    }

    function appendElement(parent, element) {
        /// <summary>Appends a DOM element.</summary>
        /// <param name="parent" type="HTMLElement" domElement="true">The parent element.</param>
        /// <param name="element" type="HTMLElement" domElement="true">The element to append.</param>

        if (!parent) {
            throw invalidArgument;
        }

        if (!element) {
            throw invalidArgument;
        }

        if (parent !== element.parentNode) {
            parent.appendChild(element);
        }
    }

    function removeElement(element) {
        /// <summary>Removes a DOM element.</summary>
        /// <param name="element" type="HTMLElement" domElement="true">The element to remove.</param>

        if (!element) {
            throw invalidArgument;
        }

        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function measureElement(element) {
        /// <summary>Measures the size of a DOM element.</summary>
        /// <param name="element" type="HTMLElement" domElement="true">The element to measure.</param>
        /// <returns type="Object">The element size.</returns>
        var scale = 1.0;
        if (isWinJS1) {
            var scale = Windows.Graphics.Display.DisplayProperties.resolutionScale / 100;
        }
        else {
            var scale = Windows.Graphics.Display.DisplayInformation.getForCurrentView().resolutionScale / 100;
        }
        var w = Math.ceil(WinJS.Utilities.getTotalWidth(element) * scale); // use ceil instead of round because WinJS reports whole numbers only
        var h = Math.ceil(WinJS.Utilities.getTotalHeight(element) * scale);
        return { width: w, height: h };
    }
    
    function addHideFocusClass(element) {
        /// <summary>Prevents the specified element from showing focus.</summary>
        /// <param name="element" type="HTMLElement">The target element.</param>

        if (element) {
            WinJS.Utilities.addClass(element, "pf-hide-focus");

            var onFocusOut = function (e) {
                if (element !== document.activeElement) {
                    WinJS.Utilities.removeClass(element, "pf-hide-focus");
                    element.removeEventListener("focusout", onFocusOut, false);
                }
            };

            element.addEventListener("focusout", onFocusOut, false);
        }
    }

    function createEventProperties(/* arg1, arg2, argN */) {
        /// <summary>Creates an object that has one event for each name in the arrays provided.</summary>
        /// <returns type="Object">The object with the specified event properties.</returns>

        var events = [];

        // concatenate the events
        for (var i = 0; i < arguments.length; i++) {
            events = events.concat(arguments[i]);
        }

        // lowercase the event names
        events = events.map(function (name) {
            return name.toLowerCase();
        })

        return WinJS.Utilities.createEventProperties.apply(null, events);
    }

    function addEventListener(type, target, listener, useCapture) {
        /// <summary>Adds an event listener to the specified target.</summary>
        /// <param name="type" type="String">The event type.</param>
        /// <param name="target" type="Object">The event target.</param>
        /// <param name="listener" type="Function">The event listener to add.</param>
        /// <param name="useCapture" type="Boolean" optional="true">True to initiate capture.</param>

        if (type === "resize" && typeof target.attachEvent === "function") {
            target.attachEvent("on" + type, listener);
        } else {
            target.addEventListener(type, listener, !!useCapture);
        }
    }

    function removeEventListener(type, target, listener, useCapture) {
        /// <summary>Removes an event listener from the specified target.</summary>
        /// <param name="type" type="String">The event type.</param>
        /// <param name="target" type="Object">The event target.</param>
        /// <param name="listener" type="Function">The event listener to remove.</param>
        /// <param name="useCapture" type="Boolean" optional="true">True if the event listener was registered as a capturing listener.</param>

        if (type === "resize" && typeof target.detachEvent === "function") {
            target.detachEvent("on" + type, listener);
        } else {
            target.removeEventListener(type, listener, !!useCapture);
        }
    }

    function processAll(rootElement, dataContext, skipRoot, bindingCache) {
        /// <summary>Binds values from the specified data context to an element and its descendants.</summary>
        /// <param name="rootElement" type="HTMLElement" optional="true">The element to search for binding declarations.</param>
        /// <param name="dataContext" type="Object" optional="true">The object containing values to use for data binding.</param>
        /// <param name="skipRoot" type="Boolean" optional="true">True to skip the root element during binding.</param>
        /// <param name="bindingCache">The cached binding data.</param>
        /// <returns type="WinJS.Promise">A promise that completes when all binding declarations have been processed.</returns>

        var promises = [];

        // process root element
        var promise = WinJS.Binding.processAll(rootElement, dataContext, skipRoot, bindingCache);
        promises.push(promise);

        return WinJS.Promise.join(promises);
    }

    function getPropertyValue(obj, properties) {
        /// <summary>Gets a property value on an object using the specified path.</summary>
        /// <param name="obj" type="Object">The object.</param>
        /// <param name="properties" type="Array">The path on the object to the property.</param>
        /// <returns type="Object">The property value.</returns>

        var value = WinJS.Utilities.requireSupportedForProcessing(obj);

        if (properties) {
            for (var i = 0; i < properties.length && value !== null && value !== undefined; i++) {
                var property = properties[i];
                if (value instanceof PlayerFramework.InteractiveViewModel) {
                    value = value[property];
                }
                else {
                    value = WinJS.Utilities.requireSupportedForProcessing(value[property]);
                }
            }
        }

        return value;
    }

    function setPropertyValue(obj, properties, value) {
        /// <summary>Sets a property value on an object using the specified path.</summary>
        /// <param name="obj" type="Object">The object.</param>
        /// <param name="properties" type="Array">The path on the object to the property.</param>
        /// <param name="value" type="Object">The value to set.</param>

        WinJS.Utilities.requireSupportedForProcessing(value);
        var target = WinJS.Utilities.requireSupportedForProcessing(obj);

        if (properties) {
            for (var i = 0; i < properties.length - 1; i++) {
                var property = properties[i];
                target = WinJS.Utilities.requireSupportedForProcessing(target[property]);
            }

            var property = properties[properties.length - 1];
            target[property] = value;
        }
    }

    function setIconText(source, sourceProperties, dest, destProperties) {
        /// <summary>Sets text to the icon property for controls which only support one-letter icon glyphs or images (e.g. AppBarCommand).</summary>
        /// <param name="source" type="Object">The source object.</param>
        /// <param name="sourceProperties" type="Array">The path on the source object to the source property.</param>
        /// <param name="dest" type="Object">The destination object.</param>
        /// <param name="destProperties" type="Array">The path on the destination object to the destination property.</param>

        var value = getPropertyValue(source, sourceProperties);
        var element = dest.querySelector(".win-commandimage");

        // see ui.js (line 32564)
        element.innerText = value;
        element.style.backgroundImage = "";
        element.style.msHighContrastAdjust = "";
    }

    function setEventHandler(source, sourceProperties, dest, destProperties) {
        /// <summary>Sets an event handler using the specified source as the context.</summary>
        /// <param name="source" type="Object">The source object.</param>
        /// <param name="sourceProperties" type="Array">The path on the source object to the source property.</param>
        /// <param name="dest" type="Object">The destination object.</param>
        /// <param name="destProperties" type="Array">The path on the destination object to the destination property.</param>

        var value = getPropertyValue(source, sourceProperties);

        if (value) {
            // we can safely mark the resulting bind function as supported for processing because value has already been verified in getPropertyValue
            var eventHandler = WinJS.Utilities.markSupportedForProcessing(value.bind(source));
            setPropertyValue(dest, destProperties, eventHandler);
        }
    }

    function setTransitionEndEventHandler(source, sourceProperties, dest, destProperties) {
        /// <summary>Sets the transitionend event handler (since the ontransitionend property does not exist) using the specified source as the context.</summary>
        /// <param name="source" type="Object">The source object.</param>
        /// <param name="sourceProperties" type="Array">The path on the source object to the source property.</param>
        /// <param name="dest" type="Object">The destination object.</param>
        /// <param name="destProperties" type="Array">The path on the destination object to the destination property.</param>

        var value = getPropertyValue(source, sourceProperties);

        if (value) {
            var eventHandler = value.bind(source);
            dest.addEventListener("transitionend", eventHandler, false);
        }
    }

    var mediaPackUrl = "http://www.microsoft.com/en-ie/download/details.aspx?id=30685";

    function isMediaPackRequired() {
        try {
            var junk = Windows.Media.VideoEffects.videoStabilization;
        }
        catch (error) {
            if (error.number === -2147221164) { // 'Class Not Registered'
                return true;
            }
        }
        return false;
    }

    function testForMediaPack() {
        if (isMediaPackRequired()) {
            promptForMediaPack();
            return false;
        }
        return true;
    }

    function promptForMediaPack() {
        var messageDialog = new Windows.UI.Popups.MessageDialog(PlayerFramework.Utilities.getResourceString("MediaFeaturePackRequiredLabel"), PlayerFramework.Utilities.getResourceString("MediaFeaturePackRequiredText"));
        //Add buttons and set their callback functions
        messageDialog.commands.append(new Windows.UI.Popups.UICommand(PlayerFramework.Utilities.getResourceString("MediaFeaturePackDownloadLabel"),
           function (command) {
               return Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(mediaPackUrl));
           }.bind(this)));
        messageDialog.commands.append(new Windows.UI.Popups.UICommand(PlayerFramework.Utilities.getResourceString("MediaFeaturePackCancelLabel")));
        return messageDialog.showAsync();
    }

    function styleSheetSelectorExists(selector) {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var styleSheet = document.styleSheets[i];
            for (var j = 0; j < styleSheet.rules.length; j++) {
                if (styleSheet.rules[j].selectorText == selector) return true;
            }
        }
        return false;
    }

    // Mixins
    var eventBindingMixin = {
        _eventBindings: null,

        _bindEvent: function (type, target, callback /* , arg1, arg2, argN */) {
            if (!this._eventBindings) {
                this._eventBindings = [];
            }

            var listener;

            if (arguments.length > 3) {
                var args = Array.prototype.slice.call(arguments, 3);
                args.unshift(this);

                listener = callback.bind.apply(callback, args);
            } else {
                listener = callback.bind(this);
            }

            var binding = {
                type: type,
                target: target,
                callback: callback,
                listener: listener,
                useCapture: false
            };

            this._eventBindings.push(binding);
            addEventListener(binding.type, binding.target, binding.listener, binding.useCapture);
        },

        _unbindEvent: function (type, target, callback) {
            if (this._eventBindings) {
                var bindings = this._eventBindings.filter(function (binding) {
                    return binding.type === type && binding.target === target && binding.callback === callback && binding.useCapture === false;
                });

                bindings.forEach(function (binding) {
                    removeEventListener(binding.type, binding.target, binding.listener, binding.useCapture);
                    remove(this._eventBindings, binding);
                }, this);

                if (!this._eventBindings.length) {
                    this._eventBindings = null;
                }
            }
        },

        _unbindEvents: function () {
            if (this._eventBindings) {
                this._eventBindings.forEach(function (binding) {
                    removeEventListener(binding.type, binding.target, binding.listener, binding.useCapture);
                }, this);

                this._eventBindings = null;
            }
        }
    };

    var propertyBindingMixin = {
        _propertyBindings: null,

        _bindProperty: function (name, target, callback /* , arg1, arg2, argN */) {
            if (!this._propertyBindings) {
                this._propertyBindings = [];
            }

            var action;

            if (arguments.length > 3) {
                var args = Array.prototype.slice.call(arguments, 3);
                args.unshift(this);

                action = callback.bind.apply(callback, args);
            } else {
                action = callback.bind(this);
            }

            var binding = {
                name: name,
                target: target,
                callback: callback,
                action: action
            };

            this._propertyBindings.push(binding);
            binding.target.bind(binding.name, binding.action);
        },

        _unbindProperty: function (name, target, callback) {
            if (this._propertyBindings) {
                var bindings = this._propertyBindings.filter(function (binding) {
                    return binding.name === name && binding.target === target && binding.callback === callback;
                });

                bindings.forEach(function (binding) {
                    binding.target.unbind(binding.name, binding.action);
                    remove(this._propertyBindings, binding);
                }, this);

                if (!this._propertyBindings.length) {
                    this._propertyBindings = null;
                }
            }
        },

        _unbindProperties: function () {
            if (this._propertyBindings) {
                this._propertyBindings.forEach(function (binding) {
                    binding.target.unbind(binding.name, binding.action);
                }, this);

                this._propertyBindings = null;
            }
        }
    };

    // Classes
    var DeferrableOperation = WinJS.Class.define(function () {
        this._promises = [];
    }, {
        getPromise: function () {
            return WinJS.Promise.join(this._promises);
        },

        setPromise: function (promise) {
            this._promises.push(promise);
        }
    });

    // Exports
    WinJS.Namespace.define("PlayerFramework", {
        AdvertisingState: AdvertisingState,
        PlayerState: PlayerState,
        ReadyState: ReadyState,
        NetworkState: NetworkState,
        MediaQuality: MediaQuality,
        MediaErrorCode: MediaErrorCode,
        ImageErrorCode: ImageErrorCode,
        AutohideBehavior: AutohideBehavior,
        InteractionType: InteractionType,
        TextTrackMode: TextTrackMode,
        TextTrackDisplayMode: TextTrackDisplayMode,
        TextTrackReadyState: TextTrackReadyState,
        ViewModelState: ViewModelState
    });

    WinJS.Namespace.define("PlayerFramework.Utilities", {
        formatTime: formatTime,
        formatPercentage: formatPercentage,
        formatString: formatString,
        formatResourceString: formatResourceString,
        getResourceString: getResourceString,
        getMediaErrorMessage: getMediaErrorMessage,
        getMediaErrorMessageForCode: getMediaErrorMessageForCode,
        getImageErrorMessageForCode: getImageErrorMessageForCode,
        getImageMimeTypes: getImageMimeTypes,
        getArray: getArray,
        setOptions: setOptions,
        convertDecimalToHex: convertDecimalToHex,
        convertHexToDecimal: convertHexToDecimal,
        convertSecondsToTicks: convertSecondsToTicks,
        convertTicksToSeconds: convertTicksToSeconds,
        convertMillisecondsToTicks: convertMillisecondsToTicks,
        convertTicksToMilliseconds: convertTicksToMilliseconds,
        calculateElapsedTime: calculateElapsedTime,
        calculateRemainingTime: calculateRemainingTime,
        calculateBufferedTime: calculateBufferedTime,
        calculateBufferedPercentage: calculateBufferedPercentage,
        launch: launch,
        clamp: clamp,
        clone: clone,
        extend: extend,
        first: first,
        remove: remove,
        binaryInsert: binaryInsert,
        binarySearch: binarySearch,
        createElement: createElement,
        appendElement: appendElement,
        removeElement: removeElement,
        measureElement: measureElement,
        addHideFocusClass: addHideFocusClass,
        createEventProperties: createEventProperties,
        eventBindingMixin: eventBindingMixin,
        propertyBindingMixin: propertyBindingMixin,
        DeferrableOperation: DeferrableOperation,
        isWinJS1: isWinJS1,
        styleSheetSelectorExists: styleSheetSelectorExists
    });

    WinJS.Namespace.define("PlayerFramework.Binding", {
        processAll: processAll,
        timeConverter: WinJS.Binding.converter(formatTime),
        setIconText: WinJS.Binding.initializer(setIconText),
        setEventHandler: WinJS.Binding.initializer(setEventHandler),
        setTransitionEndEventHandler: WinJS.Binding.initializer(setTransitionEndEventHandler)
    });

    WinJS.Namespace.define("PlayerFramework.MediaPackHelper", {
        mediaPackUrl: mediaPackUrl,
        isMediaPackRequired: isMediaPackRequired,
        testForMediaPack: testForMediaPack,
        promptForMediaPack: promptForMediaPack
    });

})();

(function (PlayerFramework, undefined) {
    "use strict";

    // InteractiveViewModel Errors
    var invalidConstruction = "Invalid construction: InteractiveViewModel constructor must be called using the \"new\" operator.",
        invalidMediaPlayer = "Invalid argument: InteractiveViewModel expects a MediaPlayer as the first argument.";

    // InteractiveViewModel Events
    var events = [
        "skipprevious",
        "skipnext",
        "skipback",
        "skipahead"
    ];

    // InteractiveViewModel Class
    var InteractiveViewModel = WinJS.Class.define(function (mediaPlayer) {
        if (!(this instanceof PlayerFramework.InteractiveViewModel)) {
            throw invalidConstruction;
        }

        if (!(mediaPlayer instanceof PlayerFramework.MediaPlayer)) {
            throw invalidMediaPlayer;
        }

        this._state = PlayerFramework.ViewModelState.unloaded;
        this._mediaPlayer = mediaPlayer;
        this._observableMediaPlayer = WinJS.Binding.as(mediaPlayer);
        this._observableViewModel = WinJS.Binding.as(this);
    }, {
        // Public Properties
        state: {
            get: function () {
                return this._state;
            },
            set: function (value) {
                var oldValue = this._state;
                this._state = value;
                this._observableViewModel.notify("state", this._state, oldValue);
            }
        },

        startTime: {
            get: function () {
                return this._getViewModelTime(this._mediaPlayer.startTime);
            }
        },

        maxTime: {
            get: function () {
                return this._getViewModelTime(this._mediaPlayer.liveTime !== null ? this._mediaPlayer.liveTime : this._mediaPlayer.endTime);
            }
        },

        endTime: {
            get: function () {
                return this._getViewModelTime(this._mediaPlayer.endTime);
            }
        },

        currentTime: {
            get: function () {
                return this._getViewModelTime(this._mediaPlayer.virtualTime);
            }
        },

        bufferedPercentage: {
            get: function () {
                return PlayerFramework.Utilities.calculateBufferedPercentage(this._mediaPlayer.buffered, this._mediaPlayer.duration);
            }
        },

        playPauseIcon: {
            get: function () {
                return this._mediaPlayer.isPlayResumeAllowed ? PlayerFramework.Utilities.getResourceString("PlayIcon") : PlayerFramework.Utilities.getResourceString("PauseIcon");
            }
        },

        playPauseLabel: {
            get: function () {
                return this._mediaPlayer.isPlayResumeAllowed ? PlayerFramework.Utilities.getResourceString("PlayLabel") : PlayerFramework.Utilities.getResourceString("PauseLabel");
            }
        },

        playPauseTooltip: {
            get: function () {
                return this._mediaPlayer.isPlayResumeAllowed ? PlayerFramework.Utilities.getResourceString("PlayTooltip") : PlayerFramework.Utilities.getResourceString("PauseTooltip");
            }
        },

        isPlayPauseDisabled: {
            get: function () {
                return !this._mediaPlayer.isPlayPauseEnabled || !this._mediaPlayer.isPlayPauseAllowed;
            }
        },

        isPlayPauseHidden: {
            get: function () {
                return !this._mediaPlayer.isPlayPauseVisible;
            }
        },

        playResumeIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("PlayIcon");
            }
        },

        playResumeLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("PlayLabel");
            }
        },

        playResumeTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("PlayTooltip");
            }
        },

        isPlayResumeDisabled: {
            get: function () {
                return !this._mediaPlayer.isPlayResumeEnabled || !this._mediaPlayer.isPlayResumeAllowed;
            }
        },

        isPlayResumeHidden: {
            get: function () {
                return !this._mediaPlayer.isPlayResumeVisible;
            }
        },

        pauseIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("PauseIcon");
            }
        },

        pauseLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("PauseLabel");
            }
        },

        pauseTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("PauseTooltip");
            }
        },

        isPauseDisabled: {
            get: function () {
                return !this._mediaPlayer.isPauseEnabled || !this._mediaPlayer.isPauseAllowed;
            }
        },

        isPauseHidden: {
            get: function () {
                return !this._mediaPlayer.isPauseVisible;
            }
        },

        replayIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("ReplayIcon");
            }
        },

        replayLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("ReplayLabel");
            }
        },

        replayTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("ReplayTooltip");
            }
        },

        isReplayDisabled: {
            get: function () {
                return !this._mediaPlayer.isReplayEnabled || !this._mediaPlayer.isReplayAllowed;
            }
        },

        isReplayHidden: {
            get: function () {
                return !this._mediaPlayer.isReplayVisible;
            }
        },

        rewindIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("RewindIcon");
            }
        },

        rewindLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("RewindLabel");
            }
        },

        rewindTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("RewindTooltip");
            }
        },

        isRewindDisabled: {
            get: function () {
                return !this._mediaPlayer.isRewindEnabled || !this._mediaPlayer.isRewindAllowed;
            }
        },

        isRewindHidden: {
            get: function () {
                return !this._mediaPlayer.isRewindVisible;
            }
        },

        fastForwardIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("FastForwardIcon");
            }
        },

        fastForwardLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("FastForwardLabel");
            }
        },

        fastForwardTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("FastForwardTooltip");
            }
        },

        isFastForwardDisabled: {
            get: function () {
                return !this._mediaPlayer.isFastForwardEnabled || !this._mediaPlayer.isFastForwardAllowed;
            }
        },

        isFastForwardHidden: {
            get: function () {
                return !this._mediaPlayer.isFastForwardVisible;
            }
        },

        slowMotionIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SlowMotionIcon");
            }
        },

        slowMotionLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SlowMotionLabel");
            }
        },

        slowMotionTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SlowMotionTooltip");
            }
        },

        isSlowMotionDisabled: {
            get: function () {
                return !this._mediaPlayer.isSlowMotionEnabled || !this._mediaPlayer.isSlowMotionAllowed;
            }
        },

        isSlowMotionHidden: {
            get: function () {
                return !this._mediaPlayer.isSlowMotionVisible;
            }
        },

        skipPreviousIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipPreviousIcon");
            }
        },

        skipPreviousLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipPreviousLabel");
            }
        },

        skipPreviousTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipPreviousTooltip");
            }
        },

        isSkipPreviousDisabled: {
            get: function () {
                return !this._mediaPlayer.isSkipPreviousEnabled || !this._mediaPlayer.isSkipPreviousAllowed;
            }
        },

        isSkipPreviousHidden: {
            get: function () {
                return !this._mediaPlayer.isSkipPreviousVisible;
            }
        },

        skipNextIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipNextIcon");
            }
        },

        skipNextLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipNextLabel");
            }
        },

        skipNextTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipNextTooltip");
            }
        },

        isSkipNextDisabled: {
            get: function () {
                return !this._mediaPlayer.isSkipNextEnabled || !this._mediaPlayer.isSkipNextAllowed;
            }
        },

        isSkipNextHidden: {
            get: function () {
                return !this._mediaPlayer.isSkipNextVisible;
            }
        },

        skipBackIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipBackIcon");
            }
        },

        skipBackLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipBackLabel");
            }
        },

        skipBackTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipBackTooltip");
            }
        },

        isSkipBackDisabled: {
            get: function () {
                return !this._mediaPlayer.isSkipBackEnabled || !this._mediaPlayer.isSkipBackAllowed;
            }
        },

        isSkipBackHidden: {
            get: function () {
                return !this._mediaPlayer.isSkipBackVisible;
            }
        },

        skipAheadIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipAheadIcon");
            }
        },

        skipAheadLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipAheadLabel");
            }
        },

        skipAheadTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SkipAheadTooltip");
            }
        },

        isSkipAheadDisabled: {
            get: function () {
                return !this._mediaPlayer.isSkipAheadEnabled || !this._mediaPlayer.isSkipAheadAllowed;
            }
        },

        isSkipAheadHidden: {
            get: function () {
                return !this._mediaPlayer.isSkipAheadVisible;
            }
        },

        elapsedTime: {
            get: function () {
                return PlayerFramework.Utilities.calculateElapsedTime(this.currentTime, this.startTime, this.endTime);
            }
        },

        elapsedTimeText: {
            get: function () {
                return PlayerFramework.Utilities.formatResourceString("ElapsedTimeText", this._mediaPlayer.skipBackInterval);
            }
        },

        elapsedTimeLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("ElapsedTimeLabel");
            }
        },

        elapsedTimeTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("ElapsedTimeTooltip");
            }
        },

        isElapsedTimeDisabled: {
            get: function () {
                return !this._mediaPlayer.isElapsedTimeEnabled || !this._mediaPlayer.isElapsedTimeAllowed;
            }
        },

        isElapsedTimeHidden: {
            get: function () {
                return !this._mediaPlayer.isElapsedTimeVisible;
            }
        },

        remainingTime: {
            get: function () {
                return PlayerFramework.Utilities.calculateRemainingTime(this.currentTime, this.startTime, this.endTime);
            }
        },

        remainingTimeText: {
            get: function () {
                return PlayerFramework.Utilities.formatResourceString("RemainingTimeText", this._mediaPlayer.skipAheadInterval);
            }
        },

        remainingTimeLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("RemainingTimeLabel");
            }
        },

        remainingTimeTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("RemainingTimeTooltip");
            }
        },

        isRemainingTimeDisabled: {
            get: function () {
                return !this._mediaPlayer.isRemainingTimeEnabled || !this._mediaPlayer.isRemainingTimeAllowed;
            }
        },

        isRemainingTimeHidden: {
            get: function () {
                return !this._mediaPlayer.isRemainingTimeVisible;
            }
        },

        totalTime: {
            get: function () {
                return PlayerFramework.Utilities.convertTicksToSeconds(this.endTime - this.startTime);
            }
        },

        totalTimeText: {
            get: function () {
                return PlayerFramework.Utilities.formatResourceString("TotalTimeText", this._mediaPlayer.skipAheadInterval);
            }
        },

        totalTimeLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("TotalTimeLabel");
            }
        },

        totalTimeTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("TotalTimeTooltip");
            }
        },

        isTotalTimeDisabled: {
            get: function () {
                return !this._mediaPlayer.isTotalTimeEnabled || !this._mediaPlayer.isTotalTimeAllowed;
            }
        },

        isTotalTimeHidden: {
            get: function () {
                return !this._mediaPlayer.isTotalTimeVisible;
            }
        },

        timelineLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("TimelineLabel");
            }
        },

        timelineTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("TimelineTooltip");
            }
        },

        isTimelineDisabled: {
            get: function () {
                return !this._mediaPlayer.isTimelineEnabled || !this._mediaPlayer.isTimelineAllowed;
            }
        },

        isTimelineHidden: {
            get: function () {
                return !this._mediaPlayer.isTimelineVisible;
            }
        },

        goLiveText: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("GoLiveText");
            }
        },

        goLiveLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("GoLiveLabel");
            }
        },

        goLiveTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("GoLiveTooltip");
            }
        },

        isGoLiveDisabled: {
            get: function () {
                return !this._mediaPlayer.isGoLiveEnabled || !this._mediaPlayer.isGoLiveAllowed;
            }
        },

        isGoLiveHidden: {
            get: function () {
                return !this._mediaPlayer.isGoLiveVisible;
            }
        },

        captionsIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("CaptionsIcon");
            }
        },

        captionsLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("CaptionsLabel");
            }
        },

        captionsTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("CaptionsTooltip");
            }
        },

        isCaptionsDisabled: {
            get: function () {
                return !this._mediaPlayer.isCaptionsEnabled || !this._mediaPlayer.isCaptionsAllowed;
            }
        },

        isCaptionsHidden: {
            get: function () {
                return !this._mediaPlayer.isCaptionsVisible;
            }
        },

        audioIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("AudioIcon");
            }
        },

        audioLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("AudioLabel");
            }
        },

        audioTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("AudioTooltip");
            }
        },

        isAudioDisabled: {
            get: function () {
                return !this._mediaPlayer.isAudioEnabled || !this._mediaPlayer.isAudioAllowed;
            }
        },

        isAudioHidden: {
            get: function () {
                return !this._mediaPlayer.isAudioVisible;
            }
        },

        volume: {
            get: function () {
                return this._getViewModelVolume(this._mediaPlayer.volume);
            }
        },

        volumeMuteIcon: {
            get: function () {
                return this._mediaPlayer.muted ? PlayerFramework.Utilities.getResourceString("UnmuteIcon") : PlayerFramework.Utilities.getResourceString("VolumeMuteIcon");
            }
        },

        volumeMuteLabel: {
            get: function () {
                return this._mediaPlayer.muted ? PlayerFramework.Utilities.getResourceString("UnmuteLabel") : PlayerFramework.Utilities.getResourceString("VolumeMuteLabel");
            }
        },

        volumeMuteTooltip: {
            get: function () {
                return this._mediaPlayer.muted ? PlayerFramework.Utilities.getResourceString("UnmuteTooltip") : PlayerFramework.Utilities.getResourceString("VolumeMuteTooltip");
            }
        },

        isVolumeMuteDisabled: {
            get: function () {
                return !this._mediaPlayer.isVolumeMuteEnabled || !this._mediaPlayer.isVolumeMuteAllowed;
            }
        },

        isVolumeMuteHidden: {
            get: function () {
                return !this._mediaPlayer.isVolumeMuteVisible;
            }
        },

        volumeIcon: {
            get: function () {
                return this._mediaPlayer.muted ? PlayerFramework.Utilities.getResourceString("UnmuteIcon") : PlayerFramework.Utilities.getResourceString("VolumeIcon");
            }
        },

        volumeLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("VolumeLabel");
            }
        },

        volumeTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("VolumeTooltip");
            }
        },

        isVolumeDisabled: {
            get: function () {
                return !this._mediaPlayer.isVolumeEnabled || !this._mediaPlayer.isVolumeAllowed;
            }
        },

        isVolumeHidden: {
            get: function () {
                return !this._mediaPlayer.isVolumeVisible;
            }
        },

        muteIcon: {
            get: function () {
                return this._mediaPlayer.muted ? PlayerFramework.Utilities.getResourceString("UnmuteIcon") : PlayerFramework.Utilities.getResourceString("MuteIcon");
            }
        },

        muteLabel: {
            get: function () {
                return this._mediaPlayer.muted ? PlayerFramework.Utilities.getResourceString("UnmuteLabel") : PlayerFramework.Utilities.getResourceString("MuteLabel");
            }
        },

        muteTooltip: {
            get: function () {
                return this._mediaPlayer.muted ? PlayerFramework.Utilities.getResourceString("UnmuteTooltip") : PlayerFramework.Utilities.getResourceString("MuteTooltip");
            }
        },

        isMuteDisabled: {
            get: function () {
                return !this._mediaPlayer.isMuteEnabled || !this._mediaPlayer.isMuteAllowed;
            }
        },

        isMuteHidden: {
            get: function () {
                return !this._mediaPlayer.isMuteVisible;
            }
        },

        fullScreenIcon: {
            get: function () {
                return this._mediaPlayer.isFullScreen ? PlayerFramework.Utilities.getResourceString("ExitFullScreenIcon") : PlayerFramework.Utilities.getResourceString("FullScreenIcon");
            }
        },

        fullScreenLabel: {
            get: function () {
                return this._mediaPlayer.isFullScreen ? PlayerFramework.Utilities.getResourceString("ExitFullScreenLabel") : PlayerFramework.Utilities.getResourceString("FullScreenLabel");
            }
        },

        fullScreenTooltip: {
            get: function () {
                return this._mediaPlayer.isFullScreen ? PlayerFramework.Utilities.getResourceString("ExitFullScreenTooltip") : PlayerFramework.Utilities.getResourceString("FullScreenTooltip");
            }
        },

        isFullScreenDisabled: {
            get: function () {
                return !this._mediaPlayer.isFullScreenEnabled || !this._mediaPlayer.isFullScreenAllowed;
            }
        },

        isFullScreenHidden: {
            get: function () {
                return !this._mediaPlayer.isFullScreenVisible;
            }
        },

        stopIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("StopIcon");
            }
        },

        stopLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("StopLabel");
            }
        },

        stopTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("StopTooltip");
            }
        },

        isStopDisabled: {
            get: function () {
                return !this._mediaPlayer.isStopEnabled || !this._mediaPlayer.isStopAllowed;
            }
        },

        isStopHidden: {
            get: function () {
                return !this._mediaPlayer.isStopVisible;
            }
        },

        infoIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("InfoIcon");
            }
        },

        infoLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("InfoLabel");
            }
        },

        infoTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("InfoTooltip");
            }
        },

        isInfoDisabled: {
            get: function () {
                return !this._mediaPlayer.isInfoEnabled || !this._mediaPlayer.isInfoAllowed;
            }
        },

        isInfoHidden: {
            get: function () {
                return !this._mediaPlayer.isInfoVisible;
            }
        },

        moreIcon: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("MoreIcon");
            }
        },

        moreLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("MoreLabel");
            }
        },

        moreTooltip: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("MoreTooltip");
            }
        },

        isMoreDisabled: {
            get: function () {
                return !this._mediaPlayer.isMoreEnabled || !this._mediaPlayer.isMoreAllowed;
            }
        },

        isMoreHidden: {
            get: function () {
                return !this._mediaPlayer.isMoreVisible;
            }
        },

        zoomIcon: {
            get: function () {
                return this._mediaPlayer.msZoom ? PlayerFramework.Utilities.getResourceString("ZoomLetterboxIcon") : PlayerFramework.Utilities.getResourceString("ZoomFillIcon");
            }
        },

        zoomLabel: {
            get: function () {
                return this._mediaPlayer.msZoom ? PlayerFramework.Utilities.getResourceString("ZoomLetterboxLabel") : PlayerFramework.Utilities.getResourceString("ZoomFillLabel");
            }
        },

        zoomTooltip: {
            get: function () {
                return this._mediaPlayer.msZoom ? PlayerFramework.Utilities.getResourceString("ZoomLetterboxTooltip") : PlayerFramework.Utilities.getResourceString("ZoomFillTooltip");
            }
        },

        isZoomDisabled: {
            get: function () {
                return !this._mediaPlayer.isZoomEnabled || !this._mediaPlayer.isZoomAllowed;
            }
        },

        isZoomHidden: {
            get: function () {
                return !this._mediaPlayer.isZoomVisible;
            }
        },

        signalStrength: {
            get: function () {
                return this._mediaPlayer.signalStrength;
            }
        },

        signalStrengthLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("SignalStrengthLabel");
            }
        },

        signalStrengthTooltip: {
            get: function () {
                return this._mediaPlayer.signalStrength < 0.25 ? PlayerFramework.Utilities.getResourceString("SignalStrengthTooltip1") : this._mediaPlayer.signalStrength < 0.5 ? PlayerFramework.Utilities.getResourceString("SignalStrengthTooltip2") : this._mediaPlayer.signalStrength < 0.75 ? PlayerFramework.Utilities.getResourceString("SignalStrengthTooltip3") : PlayerFramework.Utilities.getResourceString("SignalStrengthTooltip4");
            }
        },

        isSignalStrengthDisabled: {
            get: function () {
                return !this._mediaPlayer.isSignalStrengthEnabled || !this._mediaPlayer.isSignalStrengthAllowed;
            }
        },

        isSignalStrengthHidden: {
            get: function () {
                return !this._mediaPlayer.isSignalStrengthVisible;
            }
        },

        mediaQuality: {
            get: function () {
                return this._mediaPlayer.mediaQuality === PlayerFramework.MediaQuality.highDefinition ? PlayerFramework.Utilities.getResourceString("MediaQuality_HD") : PlayerFramework.Utilities.getResourceString("MediaQuality_SD");
            }
        },

        mediaQualityLabel: {
            get: function () {
                return PlayerFramework.Utilities.getResourceString("MediaQualityLabel");
            }
        },

        mediaQualityTooltip: {
            get: function () {
                return this._mediaPlayer.mediaQuality === PlayerFramework.MediaQuality.highDefinition ? PlayerFramework.Utilities.getResourceString("MediaQualityTooltip_HD") : PlayerFramework.Utilities.getResourceString("MediaQualityTooltip_SD");
            }
        },

        isMediaQualityDisabled: {
            get: function () {
                return !this._mediaPlayer.isMediaQualityEnabled || !this._mediaPlayer.isMediaQualityAllowed;
            }
        },

        isMediaQualityHidden: {
            get: function () {
                return !this._mediaPlayer.isMediaQualityVisible;
            }
        },

        visualMarkers: {
            get: function () {
                return this._mediaPlayer.visualMarkers;
            }
        },

        thumbnailImageSrc: {
            get: function () {
                return this._mediaPlayer.thumbnailImageSrc;
            }
        },

        isThumbnailVisible: {
            get: function () {
                return this._mediaPlayer.isThumbnailVisible;
            }
        },

        mediaMetadata: {
            get: function () {
                return this._mediaPlayer.mediaMetadata;
            }
        },

        // Public Methods
        initialize: function () {
            // media player events
            this._bindEvent("pause", this._mediaPlayer, this._onMediaPlayerPause);
            this._bindEvent("playing", this._mediaPlayer, this._onMediaPlayerPlaying);
            this._bindEvent("emptied", this._mediaPlayer, this._onMediaPlayerEmptied);
            this._bindEvent("loadstart", this._mediaPlayer, this._onMediaPlayerLoadStart);

            // media player value properties
            this._bindProperty("startTime", this._observableMediaPlayer, this._notifyProperties, ["startTime", "endTime", "currentTime", "elapsedTime", "remainingTime", "totalTime"]);
            this._bindProperty("isStartTimeOffset", this._observableMediaPlayer, this._notifyProperties, ["startTime", "endTime", "currentTime", "elapsedTime", "remainingTime", "maxTime"]);
            this._bindProperty("endTime", this._observableMediaPlayer, this._notifyProperties, ["endTime", "elapsedTime", "remainingTime", "totalTime", "maxTime"]);
            this._bindProperty("liveTime", this._observableMediaPlayer, this._notifyProperties, ["maxTime"]);
            this._bindProperty("virtualTime", this._observableMediaPlayer, this._notifyProperties, ["currentTime", "elapsedTime", "remainingTime"]);
            this._bindProperty("buffered", this._observableMediaPlayer, this._notifyProperties, ["bufferedPercentage"]);
            this._bindProperty("duration", this._observableMediaPlayer, this._notifyProperties, ["bufferedPercentage"]);
            this._bindProperty("skipBackInterval", this._observableMediaPlayer, this._notifyProperties, ["elapsedTimeText"]);
            this._bindProperty("skipAheadInterval", this._observableMediaPlayer, this._notifyProperties, ["remainingTimeText", "totalTimeText"]);
            this._bindProperty("volume", this._observableMediaPlayer, this._notifyProperties, ["volume"]);
            this._bindProperty("muted", this._observableMediaPlayer, this._notifyProperties, ["volumeMuteIcon", "volumeMuteLabel", "volumeMuteTooltip", "volumeIcon", "muteIcon", "muteLabel", "muteTooltip"]);
            this._bindProperty("isFullScreen", this._observableMediaPlayer, this._notifyProperties, ["fullScreenIcon", "fullScreenLabel", "fullScreenTooltip"]);
            this._bindProperty("signalStrength", this._observableMediaPlayer, this._notifyProperties, ["signalStrength", "signalStrengthTooltip"]);
            this._bindProperty("mediaQuality", this._observableMediaPlayer, this._notifyProperties, ["mediaQuality", "mediaQualityTooltip"]);
            this._bindProperty("visualMarkers", this._observableMediaPlayer, this._notifyProperties, ["visualMarkers"]);
            this._bindProperty("thumbnailImageSrc", this._observableMediaPlayer, this._notifyProperties, ["thumbnailImageSrc"]);
            this._bindProperty("isThumbnailVisible", this._observableMediaPlayer, this._notifyProperties, ["isThumbnailVisible"]);
            this._bindProperty("mediaMetadata", this._observableMediaPlayer, this._notifyProperties, ["mediaMetadata"]);

            // media player interaction properties
            this._bindProperty("isPlayPauseAllowed", this._observableMediaPlayer, this._notifyProperties, ["isPlayPauseDisabled"]);
            this._bindProperty("isPlayPauseEnabled", this._observableMediaPlayer, this._notifyProperties, ["isPlayPauseDisabled"]);
            this._bindProperty("isPlayPauseVisible", this._observableMediaPlayer, this._notifyProperties, ["isPlayPauseHidden"]);
            this._bindProperty("isPlayResumeAllowed", this._observableMediaPlayer, this._notifyProperties, ["isPlayResumeDisabled", "playPauseIcon", "playPauseLabel", "playPauseTooltip"]);
            this._bindProperty("isPlayResumeEnabled", this._observableMediaPlayer, this._notifyProperties, ["isPlayResumeDisabled"]);
            this._bindProperty("isPlayResumeVisible", this._observableMediaPlayer, this._notifyProperties, ["isPlayResumeHidden"]);
            this._bindProperty("isPauseAllowed", this._observableMediaPlayer, this._notifyProperties, ["isPauseDisabled"]);
            this._bindProperty("isPauseEnabled", this._observableMediaPlayer, this._notifyProperties, ["isPauseDisabled"]);
            this._bindProperty("isPauseVisible", this._observableMediaPlayer, this._notifyProperties, ["isPauseHidden"]);
            this._bindProperty("isReplayAllowed", this._observableMediaPlayer, this._notifyProperties, ["isReplayDisabled"]);
            this._bindProperty("isReplayEnabled", this._observableMediaPlayer, this._notifyProperties, ["isReplayDisabled"]);
            this._bindProperty("isReplayVisible", this._observableMediaPlayer, this._notifyProperties, ["isReplayHidden"]);
            this._bindProperty("isRewindAllowed", this._observableMediaPlayer, this._notifyProperties, ["isRewindDisabled"]);
            this._bindProperty("isRewindEnabled", this._observableMediaPlayer, this._notifyProperties, ["isRewindDisabled"]);
            this._bindProperty("isRewindVisible", this._observableMediaPlayer, this._notifyProperties, ["isRewindHidden"]);
            this._bindProperty("isFastForwardAllowed", this._observableMediaPlayer, this._notifyProperties, ["isFastForwardDisabled"]);
            this._bindProperty("isFastForwardEnabled", this._observableMediaPlayer, this._notifyProperties, ["isFastForwardDisabled"]);
            this._bindProperty("isFastForwardVisible", this._observableMediaPlayer, this._notifyProperties, ["isFastForwardHidden"]);
            this._bindProperty("isSlowMotionAllowed", this._observableMediaPlayer, this._notifyProperties, ["isSlowMotionDisabled"]);
            this._bindProperty("isSlowMotionEnabled", this._observableMediaPlayer, this._notifyProperties, ["isSlowMotionDisabled"]);
            this._bindProperty("isSlowMotionVisible", this._observableMediaPlayer, this._notifyProperties, ["isSlowMotionHidden"]);
            this._bindProperty("isSkipPreviousAllowed", this._observableMediaPlayer, this._notifyProperties, ["isSkipPreviousDisabled"]);
            this._bindProperty("isSkipPreviousEnabled", this._observableMediaPlayer, this._notifyProperties, ["isSkipPreviousDisabled"]);
            this._bindProperty("isSkipPreviousVisible", this._observableMediaPlayer, this._notifyProperties, ["isSkipPreviousHidden"]);
            this._bindProperty("isSkipNextAllowed", this._observableMediaPlayer, this._notifyProperties, ["isSkipNextDisabled"]);
            this._bindProperty("isSkipNextEnabled", this._observableMediaPlayer, this._notifyProperties, ["isSkipNextDisabled"]);
            this._bindProperty("isSkipNextVisible", this._observableMediaPlayer, this._notifyProperties, ["isSkipNextHidden"]);
            this._bindProperty("isSkipBackAllowed", this._observableMediaPlayer, this._notifyProperties, ["isSkipBackDisabled"]);
            this._bindProperty("isSkipBackEnabled", this._observableMediaPlayer, this._notifyProperties, ["isSkipBackDisabled"]);
            this._bindProperty("isSkipBackVisible", this._observableMediaPlayer, this._notifyProperties, ["isSkipBackHidden"]);
            this._bindProperty("isSkipAheadAllowed", this._observableMediaPlayer, this._notifyProperties, ["isSkipAheadDisabled"]);
            this._bindProperty("isSkipAheadEnabled", this._observableMediaPlayer, this._notifyProperties, ["isSkipAheadDisabled"]);
            this._bindProperty("isSkipAheadVisible", this._observableMediaPlayer, this._notifyProperties, ["isSkipAheadHidden"]);
            this._bindProperty("isElapsedTimeAllowed", this._observableMediaPlayer, this._notifyProperties, ["isElapsedTimeDisabled"]);
            this._bindProperty("isElapsedTimeEnabled", this._observableMediaPlayer, this._notifyProperties, ["isElapsedTimeDisabled"]);
            this._bindProperty("isElapsedTimeVisible", this._observableMediaPlayer, this._notifyProperties, ["isElapsedTimeHidden"]);
            this._bindProperty("isRemainingTimeAllowed", this._observableMediaPlayer, this._notifyProperties, ["isRemainingTimeDisabled"]);
            this._bindProperty("isRemainingTimeEnabled", this._observableMediaPlayer, this._notifyProperties, ["isRemainingTimeDisabled"]);
            this._bindProperty("isRemainingTimeVisible", this._observableMediaPlayer, this._notifyProperties, ["isRemainingTimeHidden"]);
            this._bindProperty("isTotalTimeAllowed", this._observableMediaPlayer, this._notifyProperties, ["isTotalTimeDisabled"]);
            this._bindProperty("isTotalTimeEnabled", this._observableMediaPlayer, this._notifyProperties, ["isTotalTimeDisabled"]);
            this._bindProperty("isTotalTimeVisible", this._observableMediaPlayer, this._notifyProperties, ["isTotalTimeHidden"]);
            this._bindProperty("isTimelineAllowed", this._observableMediaPlayer, this._notifyProperties, ["isTimelineDisabled"]);
            this._bindProperty("isTimelineEnabled", this._observableMediaPlayer, this._notifyProperties, ["isTimelineDisabled"]);
            this._bindProperty("isTimelineVisible", this._observableMediaPlayer, this._notifyProperties, ["isTimelineHidden"]);
            this._bindProperty("isGoLiveAllowed", this._observableMediaPlayer, this._notifyProperties, ["isGoLiveDisabled"]);
            this._bindProperty("isGoLiveEnabled", this._observableMediaPlayer, this._notifyProperties, ["isGoLiveDisabled"]);
            this._bindProperty("isGoLiveVisible", this._observableMediaPlayer, this._notifyProperties, ["isGoLiveHidden"]);
            this._bindProperty("isCaptionsAllowed", this._observableMediaPlayer, this._notifyProperties, ["isCaptionsDisabled"]);
            this._bindProperty("isCaptionsEnabled", this._observableMediaPlayer, this._notifyProperties, ["isCaptionsDisabled"]);
            this._bindProperty("isCaptionsVisible", this._observableMediaPlayer, this._notifyProperties, ["isCaptionsHidden"]);
            this._bindProperty("isAudioAllowed", this._observableMediaPlayer, this._notifyProperties, ["isAudioDisabled"]);
            this._bindProperty("isAudioEnabled", this._observableMediaPlayer, this._notifyProperties, ["isAudioDisabled"]);
            this._bindProperty("isAudioVisible", this._observableMediaPlayer, this._notifyProperties, ["isAudioHidden"]);
            this._bindProperty("isVolumeMuteAllowed", this._observableMediaPlayer, this._notifyProperties, ["isVolumeMuteDisabled"]);
            this._bindProperty("isVolumeMuteEnabled", this._observableMediaPlayer, this._notifyProperties, ["isVolumeMuteDisabled"]);
            this._bindProperty("isVolumeMuteVisible", this._observableMediaPlayer, this._notifyProperties, ["isVolumeMuteHidden"]);
            this._bindProperty("isVolumeAllowed", this._observableMediaPlayer, this._notifyProperties, ["isVolumeDisabled"]);
            this._bindProperty("isVolumeEnabled", this._observableMediaPlayer, this._notifyProperties, ["isVolumeDisabled"]);
            this._bindProperty("isVolumeVisible", this._observableMediaPlayer, this._notifyProperties, ["isVolumeHidden"]);
            this._bindProperty("isMuteAllowed", this._observableMediaPlayer, this._notifyProperties, ["isMuteDisabled"]);
            this._bindProperty("isMuteEnabled", this._observableMediaPlayer, this._notifyProperties, ["isMuteDisabled"]);
            this._bindProperty("isMuteVisible", this._observableMediaPlayer, this._notifyProperties, ["isMuteHidden"]);
            this._bindProperty("isFullScreenAllowed", this._observableMediaPlayer, this._notifyProperties, ["isFullScreenDisabled"]);
            this._bindProperty("isFullScreenEnabled", this._observableMediaPlayer, this._notifyProperties, ["isFullScreenDisabled"]);
            this._bindProperty("isFullScreenVisible", this._observableMediaPlayer, this._notifyProperties, ["isFullScreenHidden"]);
            this._bindProperty("isStopAllowed", this._observableMediaPlayer, this._notifyProperties, ["isStopDisabled"]);
            this._bindProperty("isStopEnabled", this._observableMediaPlayer, this._notifyProperties, ["isStopDisabled"]);
            this._bindProperty("isStopVisible", this._observableMediaPlayer, this._notifyProperties, ["isStopHidden"]);
            this._bindProperty("isInfoAllowed", this._observableMediaPlayer, this._notifyProperties, ["isInfoDisabled"]);
            this._bindProperty("isInfoEnabled", this._observableMediaPlayer, this._notifyProperties, ["isInfoDisabled"]);
            this._bindProperty("isInfoVisible", this._observableMediaPlayer, this._notifyProperties, ["isInfoHidden"]);
            this._bindProperty("isMoreAllowed", this._observableMediaPlayer, this._notifyProperties, ["isMoreDisabled"]);
            this._bindProperty("isMoreEnabled", this._observableMediaPlayer, this._notifyProperties, ["isMoreDisabled"]);
            this._bindProperty("isMoreVisible", this._observableMediaPlayer, this._notifyProperties, ["isMoreHidden"]);
            this._bindProperty("isZoomAllowed", this._observableMediaPlayer, this._notifyProperties, ["isZoomDisabled"]);
            this._bindProperty("isZoomEnabled", this._observableMediaPlayer, this._notifyProperties, ["isZoomDisabled"]);
            this._bindProperty("isZoomVisible", this._observableMediaPlayer, this._notifyProperties, ["isZoomHidden"]);
            this._bindProperty("msZoom", this._observableMediaPlayer, this._notifyProperties, ["zoomLabel", "zoomTooltip", "zoomIcon"]);
            this._bindProperty("isSignalStrengthAllowed", this._observableMediaPlayer, this._notifyProperties, ["isSignalStrengthDisabled"]);
            this._bindProperty("isSignalStrengthEnabled", this._observableMediaPlayer, this._notifyProperties, ["isSignalStrengthDisabled"]);
            this._bindProperty("isSignalStrengthVisible", this._observableMediaPlayer, this._notifyProperties, ["isSignalStrengthHidden"]);
            this._bindProperty("isMediaQualityAllowed", this._observableMediaPlayer, this._notifyProperties, ["isMediaQualityDisabled"]);
            this._bindProperty("isMediaQualityEnabled", this._observableMediaPlayer, this._notifyProperties, ["isMediaQualityDisabled"]);
            this._bindProperty("isMediaQualityVisible", this._observableMediaPlayer, this._notifyProperties, ["isMediaQualityHidden"]);
        },

        uninitialize: function () {
            this._observableViewModel.unbind();
            this._unbindProperties();
            this._unbindEvents();
        },

        playPause: function (e) {
            if (this._mediaPlayer.isPlayResumeAllowed) {
                this._mediaPlayer.playResume();
            } else {
                this._mediaPlayer.pause();
            }
        },

        playResume: function () {
            this._mediaPlayer.playResume();
        },

        pause: function () {
            this._mediaPlayer.pause();
        },

        replay: function () {
            this._mediaPlayer.replay();
        },

        rewind: function () {
            this._mediaPlayer.decreasePlaybackRate();
        },

        fastForward: function () {
            this._mediaPlayer.increasePlaybackRate();
        },

        slowMotion: function () {
            this._mediaPlayer.isSlowMotion = !this._mediaPlayer.isSlowMotion;
        },

        skipPrevious: function () {
            var minTime = this.startTime;
            var previousMarker = null;
            var previousMarkerTime = null;
            for (var i = 0; i < this.visualMarkers.length; i++) {
                var marker = this.visualMarkers[i];
                var markerTime = PlayerFramework.Utilities.convertSecondsToTicks(marker.time);
                if (marker.isSeekable && markerTime < this.currentTime && markerTime > minTime) {
                    if (!previousMarker || previousMarkerTime < markerTime) {
                        previousMarker = marker;
                        previousMarkerTime = markerTime;
                    }
                }
            }
            this._onSkipPrevious(previousMarker);
        },

        skipNext: function () {
            var maxTime = this.maxTime;
            var nextMarker = null;
            var nextMarkerTime = null;
            for (var i = 0; i < this.visualMarkers.length; i++) {
                var marker = this.visualMarkers[i];
                var markerTime = PlayerFramework.Utilities.convertSecondsToTicks(marker.time);
                if (marker.isSeekable && markerTime > this.currentTime && markerTime < maxTime) {
                    if (!nextMarker || nextMarkerTime > markerTime) {
                        nextMarker = marker;
                        nextMarkerTime = markerTime;
                    }
                }
            }
            this._onSkipNext(nextMarker);
        },

        skipBack: function () {
            var minTime = this._mediaPlayer.startTime;
            var time = this._mediaPlayer.skipBackInterval !== null ? Math.max(this._mediaPlayer.virtualTime - this._mediaPlayer.skipBackInterval, minTime) : minTime;

            if (!this.dispatchEvent("skipback", { time: time })) {
                this._mediaPlayer._seek(time);
            }
        },

        skipAhead: function () {
            var maxTime = this._mediaPlayer.liveTime !== null ? this._mediaPlayer.liveTime : this._mediaPlayer.endTime;
            var time = this._mediaPlayer.skipAheadInterval !== null ? Math.min(this._mediaPlayer.virtualTime + this._mediaPlayer.skipAheadInterval, maxTime) : maxTime;

            if (!this.dispatchEvent("skipahead", { time: time })) {
                this._mediaPlayer._seek(time);
            }
        },

        startScrub: function (time) {
            this._mediaPlayer._startScrub(time);
        },

        updateScrub: function (time) {
            this._mediaPlayer._updateScrub(time);
        },

        completeScrub: function (time) {
            this._mediaPlayer._completeScrub(time);
        },

        goLive: function () {
            this._mediaPlayer._seekToLive();
        },

        setVolume: function (volume) {
            this._mediaPlayer.muted = false;
            this._mediaPlayer.volume = volume;
        },

        toggleMuted: function () {
            this._mediaPlayer.muted = !this._mediaPlayer.muted;
        },

        toggleFullScreen: function () {
            this._mediaPlayer.isFullScreen = !this._mediaPlayer.isFullScreen;
        },

        stop: function () {
            this._mediaPlayer.stop();
        },

        info: function () {
            this._mediaPlayer.info();
        },

        more: function () {
            this._mediaPlayer.more();
        },

        toggleZoom: function () {
            this._mediaPlayer.msZoom = !this._mediaPlayer.msZoom;
        },

        captions: function () {
            this._mediaPlayer.captions();
        },

        audio: function () {
            this._mediaPlayer.audio();
        },

        onTimelineSliderStart: function (e) {
            var time = this._getMediaPlayerTime(e.target.winControl.value);
            this.startScrub(time);
        },

        onTimelineSliderUpdate: function (e) {
            var time = this._getMediaPlayerTime(e.target.winControl.value);
            this.updateScrub(time);
        },

        onTimelineSliderComplete: function (e) {
            var time = this._getMediaPlayerTime(e.target.winControl.value);
            this.completeScrub(time);
        },

        onTimelineSliderSkipToMarker: function (e) {
            var marker = e.detail;
            var markerTime = PlayerFramework.Utilities.convertSecondsToTicks(marker.time);
            var time = this._getMediaPlayerTime(markerTime);
            this._mediaPlayer._seek(time);
        },

        onVolumeSliderUpdate: function (e) {
            var volume = this._getMediaPlayerVolume(e.target.winControl.value);
            this.setVolume(volume);
        },

        onVolumeMuteClick: function (e) {
            var slider = e.target.nextSibling;

            if (slider.winControl.hidden) {
                this._mediaPlayer.muted = false;
                this._showVolumeMuteSlider(slider);
                this._resetVolumeMuteSliderAutohideTimeout(slider);
            } else if (this._mediaPlayer.muted) {
                this._clearVolumeMuteSliderAutohideTimeout(slider);
                this._hideVolumeMuteSlider(slider);
                this._mediaPlayer.muted = false;
            } else {
                this._clearVolumeMuteSliderAutohideTimeout(slider);
                this._hideVolumeMuteSlider(slider);
                this._mediaPlayer.muted = true;
            }
        },

        onVolumeMuteFocus: function (e) {
            if (!this._mediaPlayer.muted && !WinJS.Utilities.hasClass(e.target, "pf-hide-focus")) {
                var slider = e.target.nextSibling;
                this._showVolumeMuteSlider(slider);
                this._resetVolumeMuteSliderAutohideTimeout(slider);
            }
        },

        onVolumeMuteSliderUpdate: function (e) {
            var slider = e.target;
            var volume = this._getMediaPlayerVolume(slider.winControl.value);
            this.setVolume(volume);
        },

        onVolumeMuteSliderFocusIn: function (e) {
            var slider = e.currentTarget;
            this._clearVolumeMuteSliderAutohideTimeout(slider);
            this._showVolumeMuteSlider(slider);
        },

        onVolumeMuteSliderFocusOut: function (e) {
            var slider = e.currentTarget;
            this._resetVolumeMuteSliderAutohideTimeout(slider);
        },

        onVolumeMuteSliderMSPointerOver: function (e) {
            var slider = e.currentTarget;
            this._clearVolumeMuteSliderAutohideTimeout(slider);
            this._showVolumeMuteSlider(slider);
        },

        onVolumeMuteSliderMSPointerOut: function (e) {
            var slider = e.currentTarget;
            this._resetVolumeMuteSliderAutohideTimeout(slider);
        },

        onVolumeMuteSliderTransitionEnd: function (e) {
            var slider = e.target;
            if (slider.winControl.hidden) {
                slider.style.display = "none";
            }
        },

        // Private Methods
        _showVolumeMuteSlider: function (slider) {
            slider.style.display = "";
            slider.winControl.hidden = false;
        },

        _hideVolumeMuteSlider: function (slider) {
            slider.winControl.hidden = true;
        },

        _clearVolumeMuteSliderAutohideTimeout: function (slider) {
            var data = WinJS.Utilities.data(slider);
            window.clearTimeout(data.autohideTimeoutId);
            delete data.autohideTimeoutId;
        },

        _resetVolumeMuteSliderAutohideTimeout: function (slider) {
            var data = WinJS.Utilities.data(slider);
            window.clearTimeout(data.autohideTimeoutId);
            data.autohideTimeoutId = window.setTimeout(this._onVolumeMuteSliderAutohideTimeout.bind(this, slider), 3000);
        },

        _onVolumeMuteSliderAutohideTimeout: function (slider) {
            var preventAutohide = false;
            var activeElement = document.activeElement;

            if (activeElement && (slider === activeElement || slider.contains(activeElement)) && !WinJS.Utilities.hasClass(activeElement, "pf-hide-focus")) {
                preventAutohide = true;
            }

            if (!preventAutohide) {
                this._clearVolumeMuteSliderAutohideTimeout(slider);
                this._hideVolumeMuteSlider(slider);
            } else {
                this._resetVolumeMuteSliderAutohideTimeout(slider);
            }
        },

        _getMediaPlayerVolume: function (value) {
            return value / 100;
        },

        _getViewModelVolume: function (value) {
            return value * 100;
        },

        _getMediaPlayerTime: function (value) {
            var time = PlayerFramework.Utilities.convertTicksToSeconds(value);
            return this._mediaPlayer.isStartTimeOffset ? time : this._mediaPlayer.startTime + time;
        },

        _getViewModelTime: function (value) {
            var time = this._mediaPlayer.isStartTimeOffset ? value : value - this._mediaPlayer.startTime;
            return PlayerFramework.Utilities.convertSecondsToTicks(time);
        },

        _notifyProperties: function (propertyNames) {
            for (var i = 0; i < propertyNames.length; i++) {
                var propertyName = propertyNames[i];

                // prevents timeline interaction weirdness
                if (propertyName === "currentTime" && (this._mediaPlayer.seeking || this._mediaPlayer.scrubbing)) {
                    continue;
                }

                this._observableViewModel.notify(propertyName, this[propertyName]);
            }
        },

        _onSkipPrevious: function (marker) {
            if (marker) {
                var markerTime = PlayerFramework.Utilities.convertSecondsToTicks(marker.time);
                this._mediaPlayer._seek(this._getMediaPlayerTime(markerTime));
            }
            else {
                if (!this.dispatchEvent("skipprevious")) {
                    this._mediaPlayer._seek(this._mediaPlayer.startTime);
                }
            }
        },

        _onSkipNext: function (marker) {
            if (marker) {
                var markerTime = PlayerFramework.Utilities.convertSecondsToTicks(marker.time);
                this._mediaPlayer._seek(this._getMediaPlayerTime(markerTime));
            }
            else {
                if (!this.dispatchEvent("skipnext")) {
                    if (this._mediaPlayer.liveTime !== null) {
                        this._mediaPlayer._seek(this._mediaPlayer.liveTime);
                    } else {
                        this._mediaPlayer._seek(this._mediaPlayer.endTime);
                    }
                }
            }
        },

        _onMediaPlayerPause: function (e) {
            this.state = PlayerFramework.ViewModelState.paused;
        },

        _onMediaPlayerPlaying: function (e) {
            this.state = PlayerFramework.ViewModelState.playing;
        },

        _onMediaPlayerEmptied: function (e) {
            this.state = PlayerFramework.ViewModelState.unloaded;
        },

        _onMediaPlayerLoadStart: function (e) {
            this.state = PlayerFramework.ViewModelState.loading;
        },
    });

    // InteractiveViewModel Mixins
    WinJS.Class.mix(InteractiveViewModel, WinJS.Utilities.eventMixin);
    WinJS.Class.mix(InteractiveViewModel, PlayerFramework.Utilities.createEventProperties(events));
    WinJS.Class.mix(InteractiveViewModel, PlayerFramework.Utilities.eventBindingMixin);
    WinJS.Class.mix(InteractiveViewModel, PlayerFramework.Utilities.propertyBindingMixin);

    // InteractiveViewModel Exports
    WinJS.Namespace.define("PlayerFramework", {
        InteractiveViewModel: InteractiveViewModel
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // MediaPlayer Errors
    var invalidConstruction = "Invalid construction: MediaPlayer constructor must be called using the \"new\" operator.",
        invalidElement = "Invalid argument: MediaPlayer expects an element containing an audio or video element as the first argument.",
        invalidPlugin = "Invalid plugin: Plugin must extend PluginBase class.",
        invalidCaptionTrack = "Invalid caption track: Caption tracks must contain track.",
        invalidAudioTrack = "Invalid audio track: Audio tracks must contain track.";

    // MediaPlayer Events
    var events = [
        "advertisingstatechange",
        "canplay",
        "canplaythrough",
        "currentaudiotrackchange",
        "currentaudiotrackchanging",
        "currentcaptiontrackchange",
        "currentcaptiontrackchanging",
        "durationchange",
        "emptied",
        "ended",
        "ending",
        "error",
        "fullscreenchange",
        "initialized",
        "interactivestatechange",
        "interactiveviewmodelchange",
        "islivechange",
        "loadeddata",
        "loadedmetadata",
        "loading",
        "loadstart",
        "MSVideoFormatChanged",
        "MSVideoFrameStepCompleted",
        "MSVideoOptimalLayoutChanged",
        "mutedchange",
        "pause",
        "play",
        "playerstatechange",
        "playing",
        "progress",
        "ratechange",
        "readystatechange",
        "scrub",
        "scrubbed",
        "scrubbing",
        "seek",
        "seeked",
        "seeking",
        "stalled",
        "started",
        "starting",
        "suspend",
        "timeupdate",
        "updated",
        "volumechange",
        "waiting",
        "msneedkey",
        "markerreached",
        "stopped",
        "infoinvoked",
        "moreinvoked",
        "captionsinvoked",
        "audioinvoked"
    ];

    // MediaPlayer Class
    WinJS.Namespace.define("PlayerFramework", {
        /// <summary>Allows a user to watch and interact with media.</summary>
        /// <htmlSnippet><![CDATA[<div data-win-control="PlayerFramework.MediaPlayer"></div>]]></htmlSnippet>
        /// <event name="advertisingstatechange">Occurs when the advertising state of the player is changed.</event>
        /// <event name="canplay">Occurs when playback is possible, but would require further buffering.</event>
        /// <event name="canplaythrough">Occurs when playback to the end is possible without requiring further buffering.</event>
        /// <event name="currentaudiotrackchange">Occurs when the current audio track has changed.</event>
        /// <event name="currentaudiotrackchanging">Occurs when the current audio track is changing and presents an opportunity for custom behavior. Used by the adaptive plugin.</event>
        /// <event name="currentcaptiontrackchange">Occurs when the current caption track has changed.</event>
        /// <event name="currentcaptiontrackchanging">Occurs when the current caption track is changing and presents an opportunity for custom behavior. Used by the captions plugin.</event>
        /// <event name="durationchange">Occurs when the media duration is updated.</event>
        /// <event name="emptied">Occurs when the media element is reset to its initial state.</event>
        /// <event name="ended">Occurs when the end of playback is reached.</event>
        /// <event name="ending">Occurs before the ended event and presents an opportunity for deferral. Useful for postroll ads.</event>
        /// <event name="error">Occurs when the media element encounters an error.</event>
        /// <event name="fullscreenchange">Occurs when the full screen state of the player is changed.</event>
        /// <event name="initialized">Occurs when the player has finished initializing itself and its plugins.</event>
        /// <event name="interactivestatechange">Occurs when the interactive state of the player is changed.</event>
        /// <event name="interactiveviewmodelchange">Occurs when the view model used to drive interactive components such as the control panel is changed (e.g. when an ad start or ends).</event>
        /// <event name="islivechange">Occurs when the live state of the media source changes.</event>
        /// <event name="loadeddata">Occurs when media data is loaded at the current playback position.</event>
        /// <event name="loadedmetadata">Occurs when the duration and dimensions of the media have been determined.</event>
        /// <event name="loading">Occurs before the media source is set and offers the ability to perform blocking operations.</event>
        /// <event name="loadstart">Occurs after the media source is set and the player begins looking for media data.</event>
        /// <event name="MSVideoFormatChanged">Occurs when the video format changes.</event>
        /// <event name="MSVideoFrameStepCompleted">Occurs when the video frame has been stepped forward or backward one frame.</event>
        /// <event name="MSVideoOptimalLayoutChanged">Occurs when the msIsLayoutOptimalForPlayback state changes.</event>
        /// <event name="mutedchange">Occurs when the muted state of the player changes.</event>
        /// <event name="pause">Occurs when playback is paused.</event>
        /// <event name="play">Occurs when the play method is requested.</event>
        /// <event name="playerstatechange">Occurs when the state of the player has changed.</event>
        /// <event name="playing">Occurs when the media has started playing.</event>
        /// <event name="progress">Occurs when progress is made while downloading media data.</event>
        /// <event name="ratechange">Occurs when the playback rate is increased or decreased.</event>
        /// <event name="readystatechange">Occurs when the ready state has changed.</event>
        /// <event name="scrub">Occurs when a scrub operation is requested.</event>
        /// <event name="scrubbed">Occurs when a scrub operation ends.</event>
        /// <event name="scrubbing">Occurs when the current playback position is moved due to a scrub operation.</event>
        /// <event name="seek">Occurs when a seek operation is requested.</event>
        /// <event name="seeked">Occurs when a seek operation ends.</event>
        /// <event name="seeking">Occurs when the current playback position is moved due to a seek operation.</event>
        /// <event name="stalled">Occurs when the media download has stopped.</event>
        /// <event name="started">Occurs after playback has started.</event>
        /// <event name="starting">Occurs before playback has started and presents an opportunity for deferral or cancellation. Useful for preroll ads.</event>
        /// <event name="suspend">Occurs when the load operation has been intentionally halted.</event>
        /// <event name="timeupdate">Occurs when the current playback position is updated.</event>
        /// <event name="updated">Occurs when the player is updated with a new media source (e.g when the current playlist item is changed).</event>
        /// <event name="volumechange">Occurs when the volume is changed.</event>
        /// <event name="waiting">Occurs when playback stops because the next video frame is unavailable.</event>
        /// <event name="msneedkey">Occurs when a key is needed to decrypt the media data.</event> 
        /// <event name="markerreached">Occurs when a marker has been played through.</event>
        /// <event name="stopped">Occurs when stop button was pressed or the stop method was invoked.</event>
        /// <event name="infoinvoked">Occurs when info button is pressed or the info method was invoked.</event>
        /// <event name="moreinvoked">Occurs when more button is pressed or the more method was invoked.</event>
        /// <event name="captionsinvoked">Occurs when closed captions button is pressed or the captions method was invoked.</event>
        /// <event name="audioinvoked">Occurs when audio track selection button is pressed or the audio method was invoked.</event>
        MediaPlayer: WinJS.Class.define(function (element, options) {
            /// <summary>Creates a new instance of the MediaPlayer class.</summary>
            /// <param name="element" type="HTMLElement" domElement="true">The element that hosts the MediaPlayer control.</param>
            /// <param name="options" type="Object" optional="true">A JSON object containing the set of options to be applied initially to the MediaPlayer control.</param>
            /// <returns type="PlayerFramework.MediaPlayer">The new MediaPlayer instance.</returns>

            if (!(this instanceof PlayerFramework.MediaPlayer)) {
                throw invalidConstruction;
            }

            if (!element) {
                throw invalidElement;
            }

            this._element = null;
            this._shimElement = null;
            this._mediaElement = null;
            this._mediaExtensionManager = null;
            this._activePromises = [];
            this._plugins = [];
            this._updating = false;
            this._advertisingState = PlayerFramework.AdvertisingState.none;
            this._playerState = PlayerFramework.PlayerState.unloaded;
            this._src = "";
            this._sources = null;
            this._tracks = null;
            this._audioTracks = null;
            this._currentAudioTrack = null;
            this._captionTracks = null;
            this._currentCaptionTrack = null;
            this._dummyTrack = null;
            this._autoload = true;
            this._autoplay = false;
            this._autohide = true;
            this._autohideTime = 2;
            this._autohideTimeoutId = null;
            this._autohideBehavior = PlayerFramework.AutohideBehavior.all;
            this._startupTime = null;
            this._startTime = 0;
            this._endTime = null;
            this._liveTime = null;
            this._liveTimeBuffer = 10;
            this._isLive = false;
            this._isCurrentTimeLive = false;
            this._isStartTimeOffset = false;
            this._scrubbing = false;
            this._seekWhileScrubbing = true;
            this._scrubStartTime = null;
            this._scrubPlaybackRate = null;
            this._isPlayPauseEnabled = true;
            this._isPlayPauseVisible = true;
            this._isPlayResumeEnabled = true;
            this._isPlayResumeVisible = false;
            this._isPauseEnabled = true;
            this._isPauseVisible = false;
            this._replayOffset = 5;
            this._isReplayEnabled = true;
            this._isReplayVisible = false;
            this._isRewindEnabled = true;
            this._isRewindVisible = false;
            this._isFastForwardEnabled = true;
            this._isFastForwardVisible = false;
            this._slowMotionPlaybackRate = 0.25;
            this._isSlowMotionEnabled = true;
            this._isSlowMotionVisible = false;
            this._isSkipPreviousEnabled = true;
            this._isSkipPreviousVisible = false;
            this._isSkipNextEnabled = true;
            this._isSkipNextVisible = false;
            this._skipBackInterval = 30;
            this._isSkipBackEnabled = true;
            this._isSkipBackVisible = false;
            this._skipAheadInterval = 30;
            this._isSkipAheadEnabled = true;
            this._isSkipAheadVisible = false;
            this._isElapsedTimeEnabled = true;
            this._isElapsedTimeVisible = true;
            this._isRemainingTimeEnabled = true;
            this._isRemainingTimeVisible = true;
            this._isTotalTimeEnabled = true;
            this._isTotalTimeVisible = false;
            this._isTimelineEnabled = true;
            this._isTimelineVisible = true;
            this._isGoLiveEnabled = true;
            this._isGoLiveVisible = false;
            this._isCaptionsEnabled = true;
            this._isCaptionsVisible = false;
            this._isAudioEnabled = true;
            this._isAudioVisible = false;
            this._isVolumeMuteEnabled = true;
            this._isVolumeMuteVisible = true;
            this._isVolumeEnabled = true;
            this._isVolumeVisible = false;
            this._isMuteEnabled = true;
            this._isMuteVisible = false;
            this._isFullScreen = false;
            this._isFullScreenEnabled = true;
            this._isFullScreenVisible = false;
            this._isStopEnabled = true;
            this._isStopVisible = false;
            this._isInfoEnabled = true;
            this._isInfoVisible = false;
            this._isMoreEnabled = true;
            this._isMoreVisible = false;
            this._isZoomEnabled = true;
            this._isZoomVisible = false;
            this._signalStrength = 0;
            this._isSignalStrengthEnabled = true;
            this._isSignalStrengthVisible = false;
            this._mediaQuality = PlayerFramework.MediaQuality.standardDefinition;
            this._isMediaQualityEnabled = true;
            this._isMediaQualityVisible = false;
            this._isInteractive = false;
            this._isInteractiveHover = false;
            this._interactivePointerArgs = null;
            this._interactiveActivationMode = PlayerFramework.InteractionType.all;
            this._interactiveDeactivationMode = PlayerFramework.InteractionType.all;
            this._defaultInteractiveViewModel = new PlayerFramework.InteractiveViewModel(this);
            this._interactiveViewModel = this._defaultInteractiveViewModel;
            this._observableMediaPlayer = WinJS.Binding.as(this);
            this._lastTime = null;
            this._testForMediaPack = true;
            this._visualMarkers = [];
            this._markers = [];
            this._lastMarkerCheckTime = -1;
            this._virtualTime = 0;
            this._isTrickPlayEnabled = true;
            this._simulatedPlaybackRate = 1;
            this._simulatedPlaybackRateTimer = null;
            this._isThumbnailVisible = false;
            this._thumbnailImageSrc = null;
            this._mediaDescription = "";
            this._mediaMetadata = null;
            this._allowStartingDeferrals = true;

            this._setElement(element);
            this._setOptions(options);
            this._initializePlugins();
            this._updateCurrentSource();

            this.isInteractive = true;
            this.dispatchEvent("initialized");
        }, {
            /************************ Public Properties ************************/

            /// <field name="element" type="HTMLElement" domElement="true">Gets the host element for the control.</field>
            element: {
                get: function () {
                    return this._element;
                }
            },

            /// <field name="mediaElement" type="HTMLMediaElement" domElement="true">Gets the media element associated with the player.</field>
            mediaElement: {
                get: function () {
                    return this._mediaElement;
                }
            },

            /// <field name="mediaExtensionManager" type="Windows.Media.MediaExtensionManager">Gets or sets the media extension manager to be used by the player and its plugins. A new instance will be created on first use if one is not already set.</field>
            mediaExtensionManager: {
                get: function () {
                    if (!this._mediaExtensionManager) {
                        this.mediaExtensionManager = new Windows.Media.MediaExtensionManager();
                    }

                    return this._mediaExtensionManager;
                },
                set: function (value) {
                    var oldValue = this._mediaExtensionManager;
                    if (oldValue !== value) {
                        this._mediaExtensionManager = value;
                        this._observableMediaPlayer.notify("mediaExtensionManager", value, oldValue);
                    }
                }
            },

            /// <field name="plugins" type="Array">Gets the plugins associated with the player.</field>
            plugins: {
                get: function () {
                    return this._plugins;
                }
            },

            /// <field name="src" type="String">Gets or sets the URL of the current media source to be considered.</field>
            src: {
                get: function () {
                    return this._src;
                },
                set: function (value) {
                    var oldValue = this._src;
                    if (oldValue !== value) {
                        this._src = value;
                        this._observableMediaPlayer.notify("src", value, oldValue);
                        this._updateCurrentSource();
                    }
                }
            },

            /// <field name="currentSrc" type="String">Gets the URL of the current media source.</field>
            currentSrc: {
                get: function () {
                    return this._mediaElement.currentSrc;
                }
            },

            /// <field name="sources" type="Array">Gets or sets the media sources to be considered.</field>
            sources: {
                get: function () {
                    return this._sources;
                },
                set: function (value) {
                    var oldValue = this._sources;
                    if (oldValue !== value) {
                        var sourceElements = this._mediaElement.querySelectorAll("source");

                        // remove old sources
                        for (var i = 0; i < sourceElements.length; i++) {
                            var sourceElement = sourceElements[i];
                            PlayerFramework.Utilities.removeElement(sourceElement);
                        }

                        // add new sources
                        if (value) {
                            for (var i = 0; i < value.length; i++) {
                                var sourceObj = value[i];
                                PlayerFramework.Utilities.createElement(this._mediaElement, ["source", sourceObj]);
                            }
                        }

                        this._sources = value;
                        this._observableMediaPlayer.notify("sources", value, oldValue);
                    }
                }
            },

            /// <field name="tracks" type="Array">Gets or sets the tracks for the player.</field>
            tracks: {
                get: function () {
                    return this._tracks;
                },
                set: function (value) {
                    var oldValue = this._tracks;
                    if (oldValue !== value) {
                        var trackElements = this._mediaElement.querySelectorAll("track");

                        // remove old tracks
                        for (var i = 0; i < trackElements.length; i++) {
                            var trackElement = trackElements[i];
                            PlayerFramework.Utilities.removeElement(trackElement);
                        }

                        // add new tracks
                        if (value) {
                            for (var i = 0; i < value.length; i++) {
                                var trackObj = value[i];
                                PlayerFramework.Utilities.createElement(this._mediaElement, ["track", trackObj]);
                            }
                        }

                        // HACK: add dummy track required to show captions without native controls
                        this._dummyTrack = PlayerFramework.Utilities.createElement(this._mediaElement, ["track", { "default": true }]).track;

                        this._tracks = value;
                        this._observableMediaPlayer.notify("tracks", value, oldValue);
                    }
                }
            },

            /// <field name="textTracks" type="TextTrackList">Gets the text tracks for the current media source.</field>
            textTracks: {
                get: function () {
                    return this._mediaElement.textTracks;
                }
            },

            /// <field name="captionTracks" type="Array">Gets the caption and subtitle tracks for the current media source.</field>
            captionTracks: {
                get: function () {
                    return this._captionTracks;
                },
                set: function (value) {
                    var oldValue = this._captionTracks;
                    if (oldValue !== value) {
                        this._captionTracks = value;
                        this._observableMediaPlayer.notify("captionTracks", value, oldValue);
                    }
                }
            },

            /// <field name="currentCaptionTrack" type="TextTrack">Gets or sets the current caption/subtitle track.</field>
            currentCaptionTrack: {
                get: function () {
                    return this._currentCaptionTrack;
                },
                set: function (value) {
                    var oldValue = this._currentCaptionTrack;
                    if (oldValue !== value && !this.dispatchEvent("currentcaptiontrackchanging", { track: value })) {
                        // validate new track
                        if (value && this.captionTracks.indexOf(value) === -1) {
                            throw invalidCaptionTrack;
                        }

                        // hide old track
                        if (oldValue) {
                            this._dummyTrack.mode = PlayerFramework.TextTrackMode.showing;
                            oldValue.mode = PlayerFramework.TextTrackMode.off;
                        }

                        // show new track
                        if (value) {
                            value.mode = PlayerFramework.TextTrackMode.showing;
                            this._dummyTrack.mode = PlayerFramework.TextTrackMode.off;
                        }

                        this._currentCaptionTrack = value;
                        this._observableMediaPlayer.notify("currentCaptionTrack", value, oldValue);
                        this.dispatchEvent("currentcaptiontrackchange");
                    }
                }
            },

            /// <field name="audioTracks" type="Array">Gets the audio tracks for the current media source.</field>
            audioTracks: {
                get: function () {
                    return this._audioTracks;
                },
                set: function (value) {
                    var oldValue = this._audioTracks;
                    if (oldValue !== value) {
                        this._audioTracks = value;
                        this._observableMediaPlayer.notify("audioTracks", value, oldValue);
                    }
                }
            },

            /// <field name="currentAudioTrack" type="AudioTrack">Gets or sets the current audio track.</field>
            currentAudioTrack: {
                get: function () {
                    return this._currentAudioTrack;
                },
                set: function (value) {
                    var oldValue = this._currentAudioTrack;
                    if (oldValue !== value && !this.dispatchEvent("currentaudiotrackchanging", { track: value })) {
                        // validate new track
                        if (value && this.audioTracks.indexOf(value) === -1) {
                            throw invalidAudioTrack;
                        }

                        // disable old track
                        if (oldValue) {
                            try {
                                oldValue.enabled = false;
                            } catch (error) {
                                // do nothing
                            }
                        }

                        // enable new track
                        if (value) {
                            value.enabled = true;
                        }

                        this._currentAudioTrack = value;
                        this._observableMediaPlayer.notify("currentAudioTrack", value, oldValue);
                        this.dispatchEvent("currentaudiotrackchange");
                    }
                }
            },

            /// <field name="advertisingState" type="PlayerFramework.AdvertisingState">Gets or sets the current advertising state of the player.</field>
            advertisingState: {
                get: function () {
                    return this._advertisingState;
                },
                set: function (value) {
                    var oldValue = this._advertisingState;
                    if (oldValue !== value) {
                        this._advertisingState = value;
                        this._observableMediaPlayer.notify("advertisingState", value, oldValue);
                        this.dispatchEvent("advertisingstatechange");
                    }
                }
            },

            /// <field name="playerState" type="PlayerFramework.PlayerState">Gets or sets the current state of the player.</field>
            playerState: {
                get: function () {
                    return this._playerState;
                },
                set: function (value) {
                    var oldValue = this._playerState;
                    if (oldValue !== value) {
                        if (value === PlayerFramework.PlayerState.unloaded || value === PlayerFramework.PlayerState.pending || value === PlayerFramework.PlayerState.loaded) {
                            this._cancelActivePromises();
                            this.audioTracks = null;
                            this.currentAudioTrack = null;
                            this.currentCaptionTrack = null;
                            this.startTime = 0;
                            this.endTime = null;
                            this.liveTime = null;
                            this.isLive = false;
                            this.isCurrentTimeLive = false;
                            this.isStartTimeOffset = false;
                            this.signalStrength = 0;
                            this.mediaQuality = PlayerFramework.MediaQuality.standardDefinition;
                            this.interactiveViewModel = this.defaultInteractiveViewModel;
                            this.advertisingState = PlayerFramework.AdvertisingState.none;
                        }

                        this._playerState = value;
                        this._observableMediaPlayer.notify("playerState", value, oldValue);
                        this.dispatchEvent("playerstatechange");
                    }
                }
            },

            /// <field name="autoload" type="Boolean">Gets or sets a value that specifies whether to start loading the current media source automatically.</field>
            autoload: {
                get: function () {
                    return this._autoload;
                },
                set: function (value) {
                    var oldValue = this._autoload;
                    if (oldValue !== value) {
                        this._autoload = value;
                        this._observableMediaPlayer.notify("autoload", value, oldValue);
                    }
                }
            },

            /// <field name="autoplay" type="Boolean">Gets or sets a value that specifies whether to automatically start playing the current media source.</field>
            autoplay: {
                get: function () {
                    return this._autoplay;
                },
                set: function (value) {
                    var oldValue = this._autoplay;
                    if (oldValue !== value) {
                        this._autoplay = value;
                        this._observableMediaPlayer.notify("autoplay", value, oldValue);
                    }
                }
            },

            /// <field name="autohide" type="Boolean">Gets or sets a value that specifies whether interactive elements (e.g. the control panel) will be hidden automatically.</field>
            autohide: {
                get: function () {
                    return this._autohide;
                },
                set: function (value) {
                    var oldValue = this._autohide;
                    if (oldValue !== value) {
                        if (this.isInteractive) {
                            if (value && (this.interactiveDeactivationMode & PlayerFramework.InteractionType.soft) === PlayerFramework.InteractionType.soft) {
                                this._resetAutohideTimeout();
                            } else {
                                this._clearAutohideTimeout();
                            }
                        }

                        this._autohide = value;
                        this._observableMediaPlayer.notify("autohide", value, oldValue);
                    }
                }
            },

            /// <field name="autohideTime" type="Number">Gets or sets the amount of time (in seconds) before interactive elements (e.g. the control panel) will be hidden automatically.</field>
            autohideTime: {
                get: function () {
                    return this._autohideTime;
                },
                set: function (value) {
                    var oldValue = this._autohideTime;
                    if (oldValue !== value) {
                        this._autohideTime = value;
                        this._observableMediaPlayer.notify("autohideTime", value, oldValue);
                    }
                }
            },

            /// <field name="autohideBehavior" type="PlayerFramework.AutohideBehavior">Gets or sets the behavior of the autohide feature.</field>
            autohideBehavior: {
                get: function () {
                    return this._autohideBehavior;
                },
                set: function (value) {
                    var oldValue = this._autohideBehavior;
                    if (oldValue !== value) {
                        this._autohideBehavior = value;
                        this._observableMediaPlayer.notify("autohideBehavior", value, oldValue);
                    }
                }
            },

            /// <field name="controls" type="Boolean">Gets or sets a value that specifies whether to display the native controls for the current media source.</field>
            controls: {
                get: function () {
                    return this._mediaElement.controls;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.controls;
                    if (oldValue !== value) {
                        this._mediaElement.controls = value;
                        this._observableMediaPlayer.notify("controls", value, oldValue);
                    }
                }
            },

            /// <field name="defaultPlaybackRate" type="Number">Gets or sets the playback rate to use when play is resumed.</field>
            defaultPlaybackRate: {
                get: function () {
                    return this._mediaElement.defaultPlaybackRate;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.defaultPlaybackRate;
                    if (oldValue !== value) {
                        this._mediaElement.defaultPlaybackRate = value;
                        this._observableMediaPlayer.notify("defaultPlaybackRate", value, oldValue);
                    }
                }
            },

            /// <field name="playbackRate" type="Number">Gets or sets the playback rate for the current media source.</field>
            playbackRate: {
                get: function () {
                    if (!this.isTrickPlayEnabled) {
                        return this._simulatedPlaybackRate;
                    }
                    else {
                        return this._mediaElement.playbackRate;
                    }
                },
                set: function (value) {
                    var oldValue = this.playbackRate;
                    if (oldValue !== value) {
                        if (!this.isTrickPlayEnabled) {
                            this._simulatedPlaybackRate = value;
                            if (value === 1.0 || value === 0.0) {
                                window.clearInterval(this._simulatedPlaybackRateTimer);
                                this._simulatedPlaybackRateTimer = null;
                                if (oldValue !== 1.0 || oldValue !== 0.0) {
                                    this._seek(this.virtualTime); // we're coming out of simulated trick play, sync positions
                                }
                                this._mediaElement.playbackRate = value;
                            }
                            else {
                                if (oldValue === 1.0 || oldValue === 0.0) {
                                    this._mediaElement.playbackRate = 0;
                                    this._simulatedPlaybackRateTimer = window.setInterval(this._onSimulatedPlaybackRateTimerTick.bind(this), 250);
                                }
                                this.dispatchEvent("ratechange"); // manually raise event since we didn't actually set the mediaElement's playback rate
                            }
                        }
                        else {
                            this._mediaElement.playbackRate = value;
                        }
                        this._observableMediaPlayer.notify("playbackRate", value, oldValue);
                    }
                }
            },

            /// <field name="playbackRate" type="Number">Gets or sets the playback rate for the current media source.</field>
            isTrickPlayEnabled: {
                get: function () {
                    return this._isTrickPlayEnabled;
                },
                set: function (value) {
                    var oldValue = this._isTrickPlayEnabled;
                    if (oldValue !== value) {
                        this._isTrickPlayEnabled = value;
                        this._observableMediaPlayer.notify("isTrickPlayEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="slowMotionPlaybackRate" type="Number">Gets or sets the playback rate to use when in slow motion.</field>
            slowMotionPlaybackRate: {
                get: function () {
                    return this._slowMotionPlaybackRate;
                },
                set: function (value) {
                    var oldValue = this._slowMotionPlaybackRate;
                    if (oldValue !== value) {
                        this._slowMotionPlaybackRate = value;
                        this._observableMediaPlayer.notify("slowMotionPlaybackRate", value, oldValue);
                    }
                }
            },

            /// <field name="autobuffer" type="Boolean">Gets or sets a value that indicates whether to automatically start buffering the current media source.</field>
            autobuffer: {
                get: function () {
                    return this._mediaElement.autobuffer;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.autobuffer;
                    if (oldValue !== value) {
                        this._mediaElement.autobuffer = value;
                        this._observableMediaPlayer.notify("autobuffer", value, oldValue);
                    }
                }
            },

            /// <field name="buffered" type="TimeRanges">Gets the buffered time ranges for the current media source.</field>
            buffered: {
                get: function () {
                    try {
                        return this._mediaElement.buffered;
                    }
                    catch (error) { // triggered when Windows Media Feature Pack is not installed on Windows 8 N/KN
                        return null;
                    }
                }
            },

            /// <field name="played" type="TimeRanges">Gets the played time ranges for the current media source.</field>
            played: {
                get: function () {
                    return this._mediaElement.played;
                }
            },

            /// <field name="paused" type="Boolean">Gets a value that specifies whether playback is paused.</field>
            paused: {
                get: function () {
                    return this._mediaElement.paused;
                }
            },

            /// <field name="ended" type="Boolean">Gets a value that specifies whether playback has ended.</field>
            ended: {
                get: function () {
                    return this._mediaElement.ended;
                }
            },

            /// <field name="error" type="MediaError">Gets the current error state of the player.</field>
            error: {
                get: function () {
                    return this._mediaElement.error;
                }
            },

            /// <field name="networkState" type="PlayerFramework.NetworkState">Gets the current network state for the player.</field>
            networkState: {
                get: function () {
                    return this._mediaElement.networkState;
                }
            },

            /// <field name="readyState" type="PlayerFramework.ReadyState">Gets the current readiness state of the player.</field>
            readyState: {
                get: function () {
                    return this._mediaElement.readyState;
                }
            },

            /// <field name="initialTime" type="Number">Gets the earliest possible position (in seconds) that playback can begin.</field>
            initialTime: {
                get: function () {
                    return this._mediaElement.initialTime;
                }
            },

            /// <field name="startupTime" type="Number">Gets or sets the position (in seconds) where playback should start. This is useful for resuming a video where the user left off in a previous session.</field>
            startupTime: {
                get: function () {
                    return this._startupTime;
                },
                set: function (value) {
                    var oldValue = this._startupTime;
                    if (oldValue !== value) {
                        this._startupTime = value;
                        this._observableMediaPlayer.notify("startupTime", value, oldValue);
                    }
                }
            },

            /// <field name="startTime" type="Number">Gets or sets the start time (in seconds) of the current media source. This is useful in live streaming scenarios.</field>
            startTime: {
                get: function () {
                    return this._startTime;
                },
                set: function (value) {
                    var oldValue = this._startTime;
                    if (oldValue !== value && isFinite(value) && !isNaN(value) && value >= 0) {
                        this._startTime = value;
                        this._observableMediaPlayer.notify("startTime", value, oldValue);
                        this.dispatchEvent("durationchange");
                    }
                }
            },

            /// <field name="isStartTimeOffset" type="Boolean">Gets or sets a value that specifies whether the start time is offset.</field>
            isStartTimeOffset: {
                get: function () {
                    return this._isStartTimeOffset;
                },
                set: function (value) {
                    var oldValue = this._isStartTimeOffset;
                    if (oldValue !== value) {
                        this._isStartTimeOffset = value;
                        this._observableMediaPlayer.notify("isStartTimeOffset", value, oldValue);
                    }
                }
            },

            /// <field name="endTime" type="Number">Gets or sets the end time (in seconds) of the current media source. This is useful in live streaming scenarios.</field>
            endTime: {
                get: function () {
                    return this._endTime;
                },
                set: function (value) {
                    var oldValue = this._endTime;
                    if (oldValue !== value && isFinite(value) && !isNaN(value) && value >= 0) {
                        this._endTime = value;
                        this._observableMediaPlayer.notify("endTime", value, oldValue);
                        this.dispatchEvent("durationchange");
                    }
                }
            },

            /// <field name="duration" type="Number">Gets the duration (in seconds) of the current media source.</field>
            duration: {
                get: function () {
                    return this.endTime - this.startTime;
                }
            },

            /// <field name="liveTime" type="Number">Gets or sets the live position (in seconds).</field>
            liveTime: {
                get: function () {
                    return this._liveTime;
                },
                set: function (value) {
                    var oldValue = this._liveTime;
                    if (oldValue !== value) {
                        this._liveTime = value;
                        this._observableMediaPlayer.notify("liveTime", value, oldValue);
                        this._updateIsCurrentTimeLive();
                    }
                }
            },

            /// <field name="liveTimeBuffer" type="Number">Gets or sets the live buffer time (in seconds) for the current playback position to be considered "live".</field>
            liveTimeBuffer: {
                get: function () {
                    return this._liveTimeBuffer;
                },
                set: function (value) {
                    var oldValue = this._liveTimeBuffer;
                    if (oldValue !== value) {
                        this._liveTimeBuffer = value;
                        this._observableMediaPlayer.notify("liveTimeBuffer", value, oldValue);
                        this._updateIsCurrentTimeLive();
                    }
                }
            },

            /// <field name="isLive" type="Boolean">Gets a value that specifies whether the current media source is a live stream.</field>
            isLive: {
                get: function () {
                    return this._isLive;
                },
                set: function (value) {
                    var oldValue = this._isLive;
                    if (oldValue !== value) {
                        this._isLive = value;
                        this._observableMediaPlayer.notify("isLive", value, oldValue);
                        this.dispatchEvent("islivechange");
                    }
                }
            },

            /// <field name="currentTime" type="Number">Gets or sets the current playback position (in seconds).</field>
            currentTime: {
                get: function () {
                    var result = this._mediaElement.currentTime;
                    if (isFinite(result)) {
                        return result;
                    }
                    else {
                        return 0;
                    }
                },
                set: function (value) {
                    if (this._mediaElement.readyState !== PlayerFramework.ReadyState.nothing && isFinite(value) && !isNaN(value) && value >= 0) {
                        // note: the timeupdate event will notify the observable property for us
                        this._virtualTime = value;
                        this._mediaElement.currentTime = value;
                    }
                }
            },

            /// <field name="virtualTime" type="Number">Gets the position that is being seeked to (even before the seek completes). If seekWhileScrubbing = false, also returns the position being scrubbed to for visual feedback (in seconds).</field>
            virtualTime: {
                get: function () {
                    return this._virtualTime;
                }
            },

            /// <field name="isCurrentTimeLive" type="Boolean">Gets a value that specifies whether the current playback position is "live".</field>
            isCurrentTimeLive: {
                get: function () {
                    return this._isCurrentTimeLive;
                },
                set: function (value) {
                    var oldValue = this._isCurrentTimeLive;
                    if (oldValue !== value) {
                        this._isCurrentTimeLive = value;
                        this._observableMediaPlayer.notify("isCurrentTimeLive", value, oldValue);
                    }
                }
            },

            /// <field name="scrubbing" type="Boolean">Gets a value that specifies whether the player is currently moving to a new playback position due to a scrub operation.</field>
            scrubbing: {
                get: function () {
                    return this._scrubbing;
                }
            },

            /// <field name="seekWhileScrubbing" type="Boolean">Gets or sets a value that specifies whether the current video frame should be updated during a scrub operation.</field>
            seekWhileScrubbing: {
                get: function () {
                    return this._seekWhileScrubbing;
                },
                set: function (value) {
                    var oldValue = this._seekWhileScrubbing;
                    if (oldValue !== value) {
                        this._seekWhileScrubbing = value;
                        this._observableMediaPlayer.notify("seekWhileScrubbing", value, oldValue);
                    }
                }
            },

            /// <field name="seekable" type="TimeRanges">Gets the seekable time ranges of the current media source.</field>
            seekable: {
                get: function () {
                    return this._mediaElement.seekable;
                }
            },

            /// <field name="seeking" type="Boolean">Gets a value that specifies whether the player is currently moving to a new playback position due to a seek operation.</field>
            seeking: {
                get: function () {
                    return this._mediaElement.seeking;
                }
            },

            /// <field name="width" type="String">Gets or sets the width of the host element.</field>
            width: {
                get: function () {
                    return this._element.style.width;
                },
                set: function (value) {
                    var oldValue = this._element.style.width;
                    if (oldValue !== value) {
                        if (typeof value === "number") {
                            this._element.style.width = value + "px";
                        } else {
                            this._element.style.width = value;
                        }

                        this._observableMediaPlayer.notify("width", value, oldValue);
                    }
                }
            },

            /// <field name="height" type="String">Gets or sets the height of the host element.</field>
            height: {
                get: function () {
                    return this._element.style.height;
                },
                set: function (value) {
                    var oldValue = this._element.style.height;
                    if (oldValue !== value) {
                        if (typeof value === "number") {
                            this._element.style.height = value + "px";
                        } else {
                            this._element.style.height = value;
                        }

                        this._observableMediaPlayer.notify("height", value, oldValue);
                    }
                }
            },

            /// <field name="videoWidth" type="Number">Gets the intrinsic width of the current video (in pixels).</field>
            videoWidth: {
                get: function () {
                    return this._mediaElement.videoWidth;
                }
            },

            /// <field name="videoHeight" type="Number">Gets the intrinsic height of the current video (in pixels).</field>
            videoHeight: {
                get: function () {
                    return this._mediaElement.videoHeight;
                }
            },

            /// <field name="loop" type="Boolean">Gets or sets a value that specifies whether playback should be restarted after it ends.</field>
            loop: {
                get: function () {
                    return this._mediaElement.loop;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.loop;
                    if (oldValue !== value) {
                        this._mediaElement.loop = value;
                        this._observableMediaPlayer.notify("loop", value, oldValue);
                    }
                }
            },

            /// <field name="poster" type="String">Gets or sets the URL of an image to display while the current media source is loading.</field>
            poster: {
                get: function () {
                    return this._mediaElement.poster;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.poster;
                    if (oldValue !== value) {
                        this._mediaElement.poster = value;
                        this._observableMediaPlayer.notify("poster", value, oldValue);
                    }
                }
            },

            /// <field name="preload" type="String">Gets or sets a hint to how much buffering is advisable for the current media source.</field>
            preload: {
                get: function () {
                    return this._mediaElement.preload;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.preload;
                    if (oldValue !== value) {
                        this._mediaElement.preload = value;
                        this._observableMediaPlayer.notify("preload", value, oldValue);
                    }
                }
            },

            /// <field name="mediaMetadata" type="Object">Gets or sets metadata associated with the media.</field>
            mediaMetadata: {
                get: function () {
                    return this._mediaMetadata;
                },
                set: function (value) {
                    var oldValue = this._mediaMetadata;
                    if (oldValue !== value) {
                        this._mediaMetadata = value;
                        this._observableMediaPlayer.notify("mediaMetadata", value, oldValue);
                    }
                }
            },

            /// <field name="isPlayPauseAllowed" type="Boolean">Gets a value that specifies whether interaction with the play/pause control is allowed based on the current state of the player.</field>
            isPlayPauseAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isPlayPauseEnabled" type="Boolean">Gets or sets a value that specifies whether the play/pause control is enabled.</field>
            isPlayPauseEnabled: {
                get: function () {
                    return this._isPlayPauseEnabled;
                },
                set: function (value) {
                    var oldValue = this._isPlayPauseEnabled;
                    if (oldValue !== value) {
                        this._isPlayPauseEnabled = value;
                        this._observableMediaPlayer.notify("isPlayPauseEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isPlayPauseVisible" type="Boolean">Gets or sets a value that specifies whether the play/pause control is visible.</field>
            isPlayPauseVisible: {
                get: function () {
                    return this._isPlayPauseVisible;
                },
                set: function (value) {
                    var oldValue = this._isPlayPauseVisible;
                    if (oldValue !== value) {
                        this._isPlayPauseVisible = value;
                        this._observableMediaPlayer.notify("isPlayPauseVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isPlayResumeAllowed" type="Boolean">Gets a value that specifies whether interaction with the play/resume control is allowed based on the current state of the player.</field>
            isPlayResumeAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended) && (this.paused || this.ended || (this.playbackRate !== this.defaultPlaybackRate && this.playbackRate !== 0));
                }
            },

            /// <field name="isPlayResumeEnabled" type="Boolean">Gets or sets a value that specifies whether the play/resume control is enabled.</field>
            isPlayResumeEnabled: {
                get: function () {
                    return this._isPlayResumeEnabled;
                },
                set: function (value) {
                    var oldValue = this._isPlayResumeEnabled;
                    if (oldValue !== value) {
                        this._isPlayResumeEnabled = value;
                        this._observableMediaPlayer.notify("isPlayResumeEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isPlayResumeVisible" type="Boolean">Gets or sets a value that specifies whether the play/resume control is visible.</field>
            isPlayResumeVisible: {
                get: function () {
                    return this._isPlayResumeVisible;
                },
                set: function (value) {
                    var oldValue = this._isPlayResumeVisible;
                    if (oldValue !== value) {
                        this._isPlayResumeVisible = value;
                        this._observableMediaPlayer.notify("isPlayResumeVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isPauseAllowed" type="Boolean">Gets a value that specifies whether interaction with the pause control is allowed based on the current state of the player.</field>
            isPauseAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended) && !this.paused;
                }
            },

            /// <field name="isPauseEnabled" type="Boolean">Gets or sets a value that specifies whether the pause control is enabled.</field>
            isPauseEnabled: {
                get: function () {
                    return this._isPauseEnabled;
                },
                set: function (value) {
                    var oldValue = this._isPauseEnabled;
                    if (oldValue !== value) {
                        this._isPauseEnabled = value;
                        this._observableMediaPlayer.notify("isPauseEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isPauseVisible" type="Boolean">Gets or sets a value that specifies whether the pause control is visible.</field>
            isPauseVisible: {
                get: function () {
                    return this._isPauseVisible;
                },
                set: function (value) {
                    var oldValue = this._isPauseVisible;
                    if (oldValue !== value) {
                        this._isPauseVisible = value;
                        this._observableMediaPlayer.notify("isPauseVisible", value, oldValue);
                    }
                }
            },

            /// <field name="replayOffset" type="Number">Gets or sets the amount of time (in seconds) to offset the current playback position during replay. Set to null to cause replay to play from the beginning.</field>
            replayOffset: {
                get: function () {
                    return this._replayOffset;
                },
                set: function (value) {
                    var oldValue = this._replayOffset;
                    if (oldValue !== value) {
                        this._replayOffset = value;
                        this._observableMediaPlayer.notify("replayOffset", value, oldValue);
                    }
                }
            },

            /// <field name="isReplayAllowed" type="Boolean">Gets a value that specifies whether interaction with the replay control is allowed based on the current state of the player.</field>
            isReplayAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isReplayEnabled" type="Boolean">Gets or sets a value that specifies whether the replay control is enabled.</field>
            isReplayEnabled: {
                get: function () {
                    return this._isReplayEnabled;
                },
                set: function (value) {
                    var oldValue = this._isReplayEnabled;
                    if (oldValue !== value) {
                        this._isReplayEnabled = value;
                        this._observableMediaPlayer.notify("isReplayEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isReplayVisible" type="Boolean">Gets or sets a value that specifies whether the replay control is visible.</field>
            isReplayVisible: {
                get: function () {
                    return this._isReplayVisible;
                },
                set: function (value) {
                    var oldValue = this._isReplayVisible;
                    if (oldValue !== value) {
                        this._isReplayVisible = value;
                        this._observableMediaPlayer.notify("isReplayVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isRewindAllowed" type="Boolean">Gets a value that specifies whether interaction with the rewind control is allowed based on the current state of the player.</field>
            isRewindAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended) && !this.paused && !this.ended && this.playbackRate > -32;
                }
            },

            /// <field name="isRewindEnabled" type="Boolean">Gets or sets a value that specifies whether the rewind control is enabled.</field>
            isRewindEnabled: {
                get: function () {
                    return this._isRewindEnabled;
                },
                set: function (value) {
                    var oldValue = this._isRewindEnabled;
                    if (oldValue !== value) {
                        this._isRewindEnabled = value;
                        this._observableMediaPlayer.notify("isRewindEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isRewindVisible" type="Boolean">Gets or sets a value that specifies whether the rewind control is visible.</field>
            isRewindVisible: {
                get: function () {
                    return this._isRewindVisible;
                },
                set: function (value) {
                    var oldValue = this._isRewindVisible;
                    if (oldValue !== value) {
                        this._isRewindVisible = value;
                        this._observableMediaPlayer.notify("isRewindVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isFastForwardAllowed" type="Boolean">Gets a value that specifies whether interaction with the fast forward control is allowed based on the current state of the player.</field>
            isFastForwardAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended) && !this.paused && !this.ended && this.playbackRate < 32;
                }
            },

            /// <field name="isFastForwardEnabled" type="Boolean">Gets or sets a value that specifies whether the fast forward control is enabled.</field>
            isFastForwardEnabled: {
                get: function () {
                    return this._isFastForwardEnabled;
                },
                set: function (value) {
                    var oldValue = this._isFastForwardEnabled;
                    if (oldValue !== value) {
                        this._isFastForwardEnabled = value;
                        this._observableMediaPlayer.notify("isFastForwardEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isFastForwardVisible" type="Boolean">Gets or sets a value that specifies whether the fast forward control is visible.</field>
            isFastForwardVisible: {
                get: function () {
                    return this._isFastForwardVisible;
                },
                set: function (value) {
                    var oldValue = this._isFastForwardVisible;
                    if (oldValue !== value) {
                        this._isFastForwardVisible = value;
                        this._observableMediaPlayer.notify("isFastForwardVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isSlowMotion" type="Boolean">Gets or sets a value that specifies whether the player is playing in slow motion.</field>
            isSlowMotion: {
                get: function () {
                    return this.playbackRate === this.slowMotionPlaybackRate;
                },
                set: function (value) {
                    var oldValue = this.isSlowMotion;
                    if (oldValue !== value) {
                        if (value) {
                            this.playbackRate = this.slowMotionPlaybackRate;
                        } else {
                            this.playbackRate = this.defaultPlaybackRate;
                        }

                        this._observableMediaPlayer.notify("isSlowMotion", value, oldValue);
                    }
                }
            },

            /// <field name="isSlowMotionAllowed" type="Boolean">Gets a value that specifies whether interaction with the slow motion control is allowed based on the current state of the player.</field>
            isSlowMotionAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended) && !this.paused && !this.ended && this.playbackRate !== this.slowMotionPlaybackRate;
                }
            },

            /// <field name="isSlowMotionEnabled" type="Boolean">Gets or sets a value that specifies whether the slow motion control is enabled.</field>
            isSlowMotionEnabled: {
                get: function () {
                    return this._isSlowMotionEnabled;
                },
                set: function (value) {
                    var oldValue = this._isSlowMotionEnabled;
                    if (oldValue !== value) {
                        this._isSlowMotionEnabled = value;
                        this._observableMediaPlayer.notify("isSlowMotionEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isSlowMotionVisible" type="Boolean">Gets or sets a value that specifies whether the slow motion control is visible.</field>
            isSlowMotionVisible: {
                get: function () {
                    return this._isSlowMotionVisible;
                },
                set: function (value) {
                    var oldValue = this._isSlowMotionVisible;
                    if (oldValue !== value) {
                        this._isSlowMotionVisible = value;
                        this._observableMediaPlayer.notify("isSlowMotionVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isSkipPreviousAllowed" type="Boolean">Gets a value that specifies whether interaction with the skip previous control is allowed based on the current state of the player.</field>
            isSkipPreviousAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isSkipPreviousEnabled" type="Boolean">Gets or sets a value that specifies whether the skip previous control is enabled.</field>
            isSkipPreviousEnabled: {
                get: function () {
                    return this._isSkipPreviousEnabled;
                },
                set: function (value) {
                    var oldValue = this._isSkipPreviousEnabled;
                    if (oldValue !== value) {
                        this._isSkipPreviousEnabled = value;
                        this._observableMediaPlayer.notify("isSkipPreviousEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isSkipPreviousVisible" type="Boolean">Gets or sets a value that specifies whether the skip previous control is visible.</field>
            isSkipPreviousVisible: {
                get: function () {
                    return this._isSkipPreviousVisible;
                },
                set: function (value) {
                    var oldValue = this._isSkipPreviousVisible;
                    if (oldValue !== value) {
                        this._isSkipPreviousVisible = value;
                        this._observableMediaPlayer.notify("isSkipPreviousVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isSkipNextAllowed" type="Boolean">Gets a value that specifies whether interaction with the skip next control is allowed based on the current state of the player.</field>
            isSkipNextAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isSkipNextEnabled" type="Boolean">Gets or sets a value that specifies whether the skip next control is enabled.</field>
            isSkipNextEnabled: {
                get: function () {
                    return this._isSkipNextEnabled;
                },
                set: function (value) {
                    var oldValue = this._isSkipNextEnabled;
                    if (oldValue !== value) {
                        this._isSkipNextEnabled = value;
                        this._observableMediaPlayer.notify("isSkipNextEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isSkipNextVisible" type="Boolean">Gets or sets a value that specifies whether the skip next control is visible.</field>
            isSkipNextVisible: {
                get: function () {
                    return this._isSkipNextVisible;
                },
                set: function (value) {
                    var oldValue = this._isSkipNextVisible;
                    if (oldValue !== value) {
                        this._isSkipNextVisible = value;
                        this._observableMediaPlayer.notify("isSkipNextVisible", value, oldValue);
                    }
                }
            },

            /// <field name="skipBackInterval" type="Number">Gets or sets the amount of time (in seconds) that the skip back control will seek backward.</field>
            skipBackInterval: {
                get: function () {
                    return this._skipBackInterval;
                },
                set: function (value) {
                    var oldValue = this._skipBackInterval;
                    if (oldValue !== value) {
                        this._skipBackInterval = value;
                        this._observableMediaPlayer.notify("skipBackInterval", value, oldValue);
                    }
                }
            },

            /// <field name="isSkipBackAllowed" type="Boolean">Gets a value that specifies whether interaction with the skip back control is allowed based on the current state of the player.</field>
            isSkipBackAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isSkipBackEnabled" type="Boolean">Gets or sets a value that specifies whether the skip back control is enabled.</field>
            isSkipBackEnabled: {
                get: function () {
                    return this._isSkipBackEnabled;
                },
                set: function (value) {
                    var oldValue = this._isSkipBackEnabled;
                    if (oldValue !== value) {
                        this._isSkipBackEnabled = value;
                        this._observableMediaPlayer.notify("isSkipBackEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isSkipBackVisible" type="Boolean">Gets or sets a value that specifies whether the skip back control is visible.</field>
            isSkipBackVisible: {
                get: function () {
                    return this._isSkipBackVisible;
                },
                set: function (value) {
                    var oldValue = this._isSkipBackVisible;
                    if (oldValue !== value) {
                        this._isSkipBackVisible = value;
                        this._observableMediaPlayer.notify("isSkipBackVisible", value, oldValue);
                    }
                }
            },

            /// <field name="skipAheadInterval" type="Number">Gets or sets the amount of time (in seconds) that the skip ahead control will seek forward.</field>
            skipAheadInterval: {
                get: function () {
                    return this._skipAheadInterval;
                },
                set: function (value) {
                    var oldValue = this._skipAheadInterval;
                    if (oldValue !== value) {
                        this._skipAheadInterval = value;
                        this._observableMediaPlayer.notify("skipAheadInterval", value, oldValue);
                    }
                }
            },

            /// <field name="isSkipAheadAllowed" type="Boolean">Gets a value that specifies whether interaction with the skip ahead control is allowed based on the current state of the player.</field>
            isSkipAheadAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isSkipAheadEnabled" type="Boolean">Gets or sets a value that specifies whether the skip ahead control is enabled.</field>
            isSkipAheadEnabled: {
                get: function () {
                    return this._isSkipAheadEnabled;
                },
                set: function (value) {
                    var oldValue = this._isSkipAheadEnabled;
                    if (oldValue !== value) {
                        this._isSkipAheadEnabled = value;
                        this._observableMediaPlayer.notify("isSkipAheadEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isSkipAheadVisible" type="Boolean">Gets or sets a value that specifies whether the skip ahead control is visible.</field>
            isSkipAheadVisible: {
                get: function () {
                    return this._isSkipAheadVisible;
                },
                set: function (value) {
                    var oldValue = this._isSkipAheadVisible;
                    if (oldValue !== value) {
                        this._isSkipAheadVisible = value;
                        this._observableMediaPlayer.notify("isSkipAheadVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isElapsedTimeAllowed" type="Boolean">Gets a value that specifies whether interaction with the elapsed time control is allowed based on the current state of the player.</field>
            isElapsedTimeAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isElapsedTimeEnabled" type="Boolean">Gets or sets a value that specifies whether the elapsed time control is enabled.</field>
            isElapsedTimeEnabled: {
                get: function () {
                    return this._isElapsedTimeEnabled;
                },
                set: function (value) {
                    var oldValue = this._isElapsedTimeEnabled;
                    if (oldValue !== value) {
                        this._isElapsedTimeEnabled = value;
                        this._observableMediaPlayer.notify("isElapsedTimeEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isElapsedTimeVisible" type="Boolean">Gets or sets a value that specifies whether the elapsed time control is visible.</field>
            isElapsedTimeVisible: {
                get: function () {
                    return this._isElapsedTimeVisible;
                },
                set: function (value) {
                    var oldValue = this._isElapsedTimeVisible;
                    if (oldValue !== value) {
                        this._isElapsedTimeVisible = value;
                        this._observableMediaPlayer.notify("isElapsedTimeVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isRemainingTimeAllowed" type="Boolean">Gets a value that specifies whether interaction with the remaining time control is allowed based on the current state of the player.</field>
            isRemainingTimeAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isRemainingTimeEnabled" type="Boolean">Gets or sets a value that specifies whether the remaining time control is enabled.</field>
            isRemainingTimeEnabled: {
                get: function () {
                    return this._isRemainingTimeEnabled;
                },
                set: function (value) {
                    var oldValue = this._isRemainingTimeEnabled;
                    if (oldValue !== value) {
                        this._isRemainingTimeEnabled = value;
                        this._observableMediaPlayer.notify("isRemainingTimeEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isRemainingTimeVisible" type="Boolean">Gets or sets a value that specifies whether the remaining time control is visible.</field>
            isRemainingTimeVisible: {
                get: function () {
                    return this._isRemainingTimeVisible;
                },
                set: function (value) {
                    var oldValue = this._isRemainingTimeVisible;
                    if (oldValue !== value) {
                        this._isRemainingTimeVisible = value;
                        this._observableMediaPlayer.notify("isRemainingTimeVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isTotalTimeAllowed" type="Boolean">Gets a value that specifies whether interaction with the total time control is allowed based on the current state of the player.</field>
            isTotalTimeAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isTotalTimeEnabled" type="Boolean">Gets or sets a value that specifies whether the total time control is enabled.</field>
            isTotalTimeEnabled: {
                get: function () {
                    return this._isTotalTimeEnabled;
                },
                set: function (value) {
                    var oldValue = this._isTotalTimeEnabled;
                    if (oldValue !== value) {
                        this._isTotalTimeEnabled = value;
                        this._observableMediaPlayer.notify("isTotalTimeEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isTotalTimeVisible" type="Boolean">Gets or sets a value that specifies whether the total time control is visible.</field>
            isTotalTimeVisible: {
                get: function () {
                    return this._isTotalTimeVisible;
                },
                set: function (value) {
                    var oldValue = this._isTotalTimeVisible;
                    if (oldValue !== value) {
                        this._isTotalTimeVisible = value;
                        this._observableMediaPlayer.notify("isTotalTimeVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isTimelineAllowed" type="Boolean">Gets a value that specifies whether interaction with the timeline control is allowed based on the current state of the player.</field>
            isTimelineAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended);
                }
            },

            /// <field name="isTimelineEnabled" type="Boolean">Gets or sets a value that specifies whether the timeline control is enabled.</field>
            isTimelineEnabled: {
                get: function () {
                    return this._isTimelineEnabled;
                },
                set: function (value) {
                    var oldValue = this._isTimelineEnabled;
                    if (oldValue !== value) {
                        this._isTimelineEnabled = value;
                        this._observableMediaPlayer.notify("isTimelineEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isTimelineVisible" type="Boolean">Gets or sets a value that specifies whether the timeline control is visible.</field>
            isTimelineVisible: {
                get: function () {
                    return this._isTimelineVisible;
                },
                set: function (value) {
                    var oldValue = this._isTimelineVisible;
                    if (oldValue !== value) {
                        this._isTimelineVisible = value;
                        this._observableMediaPlayer.notify("isTimelineVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isGoLiveAllowed" type="Boolean">Gets a value that specifies whether interaction with the go live control is allowed based on the current state of the player.</field>
            isGoLiveAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended) && this.isLive && !this.isCurrentTimeLive;
                }
            },

            /// <field name="isGoLiveEnabled" type="Boolean">Gets or sets a value that specifies whether the go live control is enabled.</field>
            isGoLiveEnabled: {
                get: function () {
                    return this._isGoLiveEnabled;
                },
                set: function (value) {
                    var oldValue = this._isGoLiveEnabled;
                    if (oldValue !== value) {
                        this._isGoLiveEnabled = value;
                        this._observableMediaPlayer.notify("isGoLiveEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isGoLiveVisible" type="Boolean">Gets or sets a value that specifies whether the go live control is visible.</field>
            isGoLiveVisible: {
                get: function () {
                    return this._isGoLiveVisible;
                },
                set: function (value) {
                    var oldValue = this._isGoLiveVisible;
                    if (oldValue !== value) {
                        this._isGoLiveVisible = value;
                        this._observableMediaPlayer.notify("isGoLiveVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isCaptionsAllowed" type="Boolean">Gets a value that specifies whether interaction with the captions control is allowed based on the current state of the player.</field>
            isCaptionsAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended) && this.captionTracks.length > 0;
                }
            },

            /// <field name="isCaptionsEnabled" type="Boolean">Gets or sets a value that specifies whether the captions control is enabled.</field>
            isCaptionsEnabled: {
                get: function () {
                    return this._isCaptionsEnabled;
                },
                set: function (value) {
                    var oldValue = this._isCaptionsEnabled;
                    if (oldValue !== value) {
                        this._isCaptionsEnabled = value;
                        this._observableMediaPlayer.notify("isCaptionsEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isCaptionsVisible" type="Boolean">Gets or sets a value that specifies whether the captions control is visible.</field>
            isCaptionsVisible: {
                get: function () {
                    return this._isCaptionsVisible;
                },
                set: function (value) {
                    var oldValue = this._isCaptionsVisible;
                    if (oldValue !== value) {
                        this._isCaptionsVisible = value;
                        this._observableMediaPlayer.notify("isCaptionsVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isAudioAllowed" type="Boolean">Gets a value that specifies whether interaction with the audio control is allowed based on the current state of the player.</field>
            isAudioAllowed: {
                get: function () {
                    return this.advertisingState !== PlayerFramework.AdvertisingState.loading && this.advertisingState !== PlayerFramework.AdvertisingState.linear && (this.playerState === PlayerFramework.PlayerState.opened || this.playerState === PlayerFramework.PlayerState.started || this.playerState === PlayerFramework.PlayerState.ended) && this.audioTracks.length > 0;
                }
            },

            /// <field name="isAudioEnabled" type="Boolean">Gets or sets a value that specifies whether the audio control is enabled.</field>
            isAudioEnabled: {
                get: function () {
                    return this._isAudioEnabled;
                },
                set: function (value) {
                    var oldValue = this._isAudioEnabled;
                    if (oldValue !== value) {
                        this._isAudioEnabled = value;
                        this._observableMediaPlayer.notify("isAudioEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isAudioVisible" type="Boolean">Gets or sets a value that specifies whether the audio control is visible.</field>
            isAudioVisible: {
                get: function () {
                    return this._isAudioVisible;
                },
                set: function (value) {
                    var oldValue = this._isAudioVisible;
                    if (oldValue !== value) {
                        this._isAudioVisible = value;
                        this._observableMediaPlayer.notify("isAudioVisible", value, oldValue);
                    }
                }
            },

            /// <field name="volume" type="Number">Gets or sets the volume level (from 0 to 1) for the audio portions of media playback.</field>
            volume: {
                get: function () {
                    return this._mediaElement.volume;
                },
                set: function (value) {
                    if (isFinite(value) && !isNaN(value) && value >= 0 && value <= 1) {
                        // note: the volumechange event should notify the observable property for us
                        this._mediaElement.volume = value;
                        if (this._mediaElement.readyState === PlayerFramework.ReadyState.nothing) {
                            // firing the volume changed event will notify others that the volume has changed in the case that no mediaelement exists. This is useful for ads.
                            this._onMediaElementVolumeChange();
                        }
                    }
                }
            },

            /// <field name="isVolumeMuteAllowed" type="Boolean">Gets a value that specifies whether interaction with the volume/mute control is allowed based on the current state of the player.</field>
            isVolumeMuteAllowed: {
                get: function () {
                    return true;
                }
            },

            /// <field name="isVolumeMuteEnabled" type="Boolean">Gets or sets a value that specifies whether the volume/mute control is enabled.</field>
            isVolumeMuteEnabled: {
                get: function () {
                    return this._isVolumeMuteEnabled;
                },
                set: function (value) {
                    var oldValue = this._isVolumeMuteEnabled;
                    if (oldValue !== value) {
                        this._isVolumeMuteEnabled = value;
                        this._observableMediaPlayer.notify("isVolumeMuteEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isVolumeMuteVisible" type="Boolean">Gets or sets a value that specifies whether the volume/mute control is visible.</field>
            isVolumeMuteVisible: {
                get: function () {
                    return this._isVolumeMuteVisible;
                },
                set: function (value) {
                    var oldValue = this._isVolumeMuteVisible;
                    if (oldValue !== value) {
                        this._isVolumeMuteVisible = value;
                        this._observableMediaPlayer.notify("isVolumeMuteVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isVolumeAllowed" type="Boolean">Gets a value that specifies whether interaction with the volume control is allowed based on the current state of the player.</field>
            isVolumeAllowed: {
                get: function () {
                    return true;
                }
            },

            /// <field name="isVolumeEnabled" type="Boolean">Gets or sets a value that specifies whether the volume control is enabled.</field>
            isVolumeEnabled: {
                get: function () {
                    return this._isVolumeEnabled;
                },
                set: function (value) {
                    var oldValue = this._isVolumeEnabled;
                    if (oldValue !== value) {
                        this._isVolumeEnabled = value;
                        this._observableMediaPlayer.notify("isVolumeEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isVolumeVisible" type="Boolean">Gets or sets a value that specifies whether the volume control is visible.</field>
            isVolumeVisible: {
                get: function () {
                    return this._isVolumeVisible;
                },
                set: function (value) {
                    var oldValue = this._isVolumeVisible;
                    if (oldValue !== value) {
                        this._isVolumeVisible = value;
                        this._observableMediaPlayer.notify("isVolumeVisible", value, oldValue);
                    }
                }
            },

            /// <field name="muted" type="Boolean">Gets or sets a value that indicates whether the audio is muted.</field>
            muted: {
                get: function () {
                    return this._mediaElement.muted;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.muted;
                    if (oldValue !== value) {
                        this._mediaElement.muted = value;
                        this._observableMediaPlayer.notify("muted", value, oldValue);
                        this.dispatchEvent("mutedchange");
                    }
                }
            },

            /// <field name="isMuteAllowed" type="Boolean">Gets a value that specifies whether interaction with the mute control is allowed based on the current state of the player.</field>
            isMuteAllowed: {
                get: function () {
                    return true;
                }
            },

            /// <field name="isMuteEnabled" type="Boolean">Gets or sets a value that specifies whether the mute control is enabled.</field>
            isMuteEnabled: {
                get: function () {
                    return this._isMuteEnabled;
                },
                set: function (value) {
                    var oldValue = this._isMuteEnabled;
                    if (oldValue !== value) {
                        this._isMuteEnabled = value;
                        this._observableMediaPlayer.notify("isMuteEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isMuteVisible" type="Boolean">Gets or sets a value that specifies whether the mute control is visible.</field>
            isMuteVisible: {
                get: function () {
                    return this._isMuteVisible;
                },
                set: function (value) {
                    var oldValue = this._isMuteVisible;
                    if (oldValue !== value) {
                        this._isMuteVisible = value;
                        this._observableMediaPlayer.notify("isMuteVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isFullScreen" type="Boolean">Gets or sets a value that specifies whether the player is in full screen mode.</field>
            isFullScreen: {
                get: function () {
                    return this._isFullScreen;
                },
                set: function (value) {
                    var oldValue = this._isFullScreen;
                    if (oldValue !== value) {
                        if (value) {
                            this._shimElement.style.display = "block";
                            this.addClass("pf-full-screen");
                        } else {
                            this.removeClass("pf-full-screen");
                            this._shimElement.style.display = "none";
                        }

                        if (PlayerFramework.Utilities.isWinJS1) {
                            if (value && Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                                Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
                            }
                        }

                        this._isFullScreen = value;
                        this._observableMediaPlayer.notify("isFullScreen", value, oldValue);
                        this.dispatchEvent("fullscreenchange");
                    }
                }
            },

            /// <field name="isFullScreenAllowed" type="Boolean">Gets a value that specifies whether interaction with the full screen control is allowed based on the current state of the player.</field>
            isFullScreenAllowed: {
                get: function () {
                    return true;
                }
            },

            /// <field name="isFullScreenEnabled" type="Boolean">Gets or sets a value that specifies whether the full screen control is enabled.</field>
            isFullScreenEnabled: {
                get: function () {
                    return this._isFullScreenEnabled;
                },
                set: function (value) {
                    var oldValue = this._isFullScreenEnabled;
                    if (oldValue !== value) {
                        this._isFullScreenEnabled = value;
                        this._observableMediaPlayer.notify("isFullScreenEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isFullScreenVisible" type="Boolean">Gets or sets a value that specifies whether the full screen control is visible.</field>
            isFullScreenVisible: {
                get: function () {
                    return this._isFullScreenVisible;
                },
                set: function (value) {
                    var oldValue = this._isFullScreenVisible;
                    if (oldValue !== value) {
                        this._isFullScreenVisible = value;
                        this._observableMediaPlayer.notify("isFullScreenVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isStopAllowed" type="Boolean">Gets a value that specifies whether interaction with the stop control is allowed based on the current state of the player.</field>
            isStopAllowed: {
                get: function () {
                    return this.playerState !== PlayerFramework.PlayerState.unloaded;
                }
            },

            /// <field name="isStopEnabled" type="Boolean">Gets or sets a value that specifies whether the stop control is enabled.</field>
            isStopEnabled: {
                get: function () {
                    return this._isStopEnabled;
                },
                set: function (value) {
                    var oldValue = this._isStopEnabled;
                    if (oldValue !== value) {
                        this._isStopEnabled = value;
                        this._observableMediaPlayer.notify("isStopEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isStopVisible" type="Boolean">Gets or sets a value that specifies whether the stop control is visible.</field>
            isStopVisible: {
                get: function () {
                    return this._isStopVisible;
                },
                set: function (value) {
                    var oldValue = this._isStopVisible;
                    if (oldValue !== value) {
                        this._isStopVisible = value;
                        this._observableMediaPlayer.notify("isStopVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isInfoAllowed" type="Boolean">Gets a value that specifies whether interaction with the info control is allowed based on the current state of the player.</field>
            isInfoAllowed: {
                get: function () {
                    return this.playerState !== PlayerFramework.PlayerState.unloaded;
                }
            },

            /// <field name="isInfoEnabled" type="Boolean">Gets or sets a value that specifies whether the info control is enabled.</field>
            isInfoEnabled: {
                get: function () {
                    return this._isInfoEnabled;
                },
                set: function (value) {
                    var oldValue = this._isInfoEnabled;
                    if (oldValue !== value) {
                        this._isInfoEnabled = value;
                        this._observableMediaPlayer.notify("isInfoEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isInfoVisible" type="Boolean">Gets or sets a value that specifies whether the info control is visible.</field>
            isInfoVisible: {
                get: function () {
                    return this._isInfoVisible;
                },
                set: function (value) {
                    var oldValue = this._isInfoVisible;
                    if (oldValue !== value) {
                        this._isInfoVisible = value;
                        this._observableMediaPlayer.notify("isInfoVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isMoreAllowed" type="Boolean">Gets a value that specifies whether interaction with the more control is allowed based on the current state of the player.</field>
            isMoreAllowed: {
                get: function () {
                    return true;
                }
            },

            /// <field name="isMoreEnabled" type="Boolean">Gets or sets a value that specifies whether the more control is enabled.</field>
            isMoreEnabled: {
                get: function () {
                    return this._isMoreEnabled;
                },
                set: function (value) {
                    var oldValue = this._isMoreEnabled;
                    if (oldValue !== value) {
                        this._isMoreEnabled = value;
                        this._observableMediaPlayer.notify("isMoreEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isMoreVisible" type="Boolean">Gets or sets a value that specifies whether the more control is visible.</field>
            isMoreVisible: {
                get: function () {
                    return this._isMoreVisible;
                },
                set: function (value) {
                    var oldValue = this._isMoreVisible;
                    if (oldValue !== value) {
                        this._isMoreVisible = value;
                        this._observableMediaPlayer.notify("isMoreVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isZoomAllowed" type="Boolean">Gets a value that specifies whether interaction with the zoom control is allowed based on the current state of the player.</field>
            isZoomAllowed: {
                get: function () {
                    return true;
                }
            },

            /// <field name="isZoomEnabled" type="Boolean">Gets or sets a value that specifies whether the zoom control is enabled.</field>
            isZoomEnabled: {
                get: function () {
                    return this._isZoomEnabled;
                },
                set: function (value) {
                    var oldValue = this._isZoomEnabled;
                    if (oldValue !== value) {
                        this._isZoomEnabled = value;
                        this._observableMediaPlayer.notify("isZoomEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isZoomVisible" type="Boolean">Gets or sets a value that specifies whether the zoom control is visible.</field>
            isZoomVisible: {
                get: function () {
                    return this._isZoomVisible;
                },
                set: function (value) {
                    var oldValue = this._isZoomVisible;
                    if (oldValue !== value) {
                        this._isZoomVisible = value;
                        this._observableMediaPlayer.notify("isZoomVisible", value, oldValue);
                    }
                }
            },

            /// <field name="signalStrength" type="Number">Gets or sets the signal strength of the current media source. This is useful in adaptive streaming scenarios.</field>
            signalStrength: {
                get: function () {
                    return this._signalStrength;
                },
                set: function (value) {
                    var oldValue = this._signalStrength;
                    if (oldValue !== value) {
                        this._signalStrength = value;
                        this._observableMediaPlayer.notify("signalStrength", value, oldValue);
                    }
                }
            },

            /// <field name="isSignalStrengthAllowed" type="Boolean">Gets a value that specifies whether interaction with the signal strength control is allowed based on the current state of the player.</field>
            isSignalStrengthAllowed: {
                get: function () {
                    return true;
                }
            },

            /// <field name="isSignalStrengthEnabled" type="Boolean">Gets or sets a value that specifies whether the signal strength control is enabled.</field>
            isSignalStrengthEnabled: {
                get: function () {
                    return this._isSignalStrengthEnabled;
                },
                set: function (value) {
                    var oldValue = this._isSignalStrengthEnabled;
                    if (oldValue !== value) {
                        this._isSignalStrengthEnabled = value;
                        this._observableMediaPlayer.notify("isSignalStrengthEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isSignalStrengthVisible" type="Boolean">Gets or sets a value that specifies whether the signal strength control is visible.</field>
            isSignalStrengthVisible: {
                get: function () {
                    return this._isSignalStrengthVisible;
                },
                set: function (value) {
                    var oldValue = this._isSignalStrengthVisible;
                    if (oldValue !== value) {
                        this._isSignalStrengthVisible = value;
                        this._observableMediaPlayer.notify("isSignalStrengthVisible", value, oldValue);
                    }
                }
            },

            /// <field name="mediaQuality" type="PlayerFramework.MediaQuality">Gets or sets the quality of the current media source.</field>
            mediaQuality: {
                get: function () {
                    return this._mediaQuality;
                },
                set: function (value) {
                    var oldValue = this._mediaQuality;
                    if (oldValue !== value) {
                        this._mediaQuality = value;
                        this._observableMediaPlayer.notify("mediaQuality", value, oldValue);
                    }
                }
            },

            /// <field name="isMediaQualityAllowed" type="Boolean">Gets a value that specifies whether interaction with the media quality control is allowed based on the current state of the player.</field>
            isMediaQualityAllowed: {
                get: function () {
                    return true;
                }
            },

            /// <field name="isMediaQualityEnabled" type="Boolean">Gets or sets a value that specifies whether the media quality control is enabled.</field>
            isMediaQualityEnabled: {
                get: function () {
                    return this._isMediaQualityEnabled;
                },
                set: function (value) {
                    var oldValue = this._isMediaQualityEnabled;
                    if (oldValue !== value) {
                        this._isMediaQualityEnabled = value;
                        this._observableMediaPlayer.notify("isMediaQualityEnabled", value, oldValue);
                    }
                }
            },

            /// <field name="isMediaQualityVisible" type="Boolean">Gets or sets a value that specifies whether the media quality control is visible.</field>
            isMediaQualityVisible: {
                get: function () {
                    return this._isMediaQualityVisible;
                },
                set: function (value) {
                    var oldValue = this._isMediaQualityVisible;
                    if (oldValue !== value) {
                        this._isMediaQualityVisible = value;
                        this._observableMediaPlayer.notify("isMediaQualityVisible", value, oldValue);
                    }
                }
            },

            /// <field name="isInteractive" type="Boolean">Gets or sets a value that specifies whether the player is currently in interactive mode (e.g. showing the control panel).</field>
            isInteractive: {
                get: function () {
                    return this._isInteractive;
                },
                set: function (value) {
                    var oldValue = this._isInteractive;
                    if (oldValue !== value) {
                        if (value && (this.interactiveDeactivationMode & PlayerFramework.InteractionType.soft) === PlayerFramework.InteractionType.soft && this.autohide) {
                            this._resetAutohideTimeout();
                        }

                        this._isInteractive = value;
                        this._observableMediaPlayer.notify("isInteractive", value, oldValue);
                        this.dispatchEvent("interactivestatechange");
                    }
                }
            },

            /// <field name="interactiveActivationMode" type="PlayerFramework.InteractionType">Gets or sets the type of interactions that will cause interactive elements (e.g. the control panel) to be shown.</field>
            interactiveActivationMode: {
                get: function () {
                    return this._interactiveActivationMode;
                },
                set: function (value) {
                    var oldValue = this._interactiveActivationMode;
                    if (oldValue !== value) {
                        this._interactiveActivationMode = value;
                        this._observableMediaPlayer.notify("interactiveActivationMode", value, oldValue);
                    }
                }
            },

            /// <field name="interactiveDeactivationMode" type="PlayerFramework.InteractionType">Gets or sets the type of interactions that will cause interactive elements (e.g. the control panel) to be hidden.</field>
            interactiveDeactivationMode: {
                get: function () {
                    return this._interactiveDeactivationMode;
                },
                set: function (value) {
                    var oldValue = this._interactiveDeactivationMode;
                    if (oldValue !== value) {
                        if (this.isInteractive) {
                            if ((oldValue & PlayerFramework.InteractionType.soft) === PlayerFramework.InteractionType.soft && (value & PlayerFramework.InteractionType.soft) !== PlayerFramework.InteractionType.soft || !this.autohide) {
                                this._clearAutohideTimeout();
                            } else if ((oldValue & PlayerFramework.InteractionType.soft) !== PlayerFramework.InteractionType.soft && (value & PlayerFramework.InteractionType.soft) === PlayerFramework.InteractionType.soft && this.autohide) {
                                this._resetAutohideTimeout();
                            }
                        }

                        this._interactiveDeactivationMode = value;
                        this._observableMediaPlayer.notify("interactiveDeactivationMode", value, oldValue);
                    }
                }
            },

            /// <field name="defaultInteractiveViewModel" type="PlayerFramework.InteractiveViewModel">Gets the view model that will be restored following a temporary change to the current interactive view model (e.g. during an ad).</field>
            defaultInteractiveViewModel: {
                get: function () {
                    return this._defaultInteractiveViewModel;
                }
            },

            /// <field name="interactiveViewModel" type="PlayerFramework.InteractiveViewModel">Gets or sets the view model that interactive elements are bound to (e.g. the control panel).</field>
            interactiveViewModel: {
                get: function () {
                    return this._interactiveViewModel;
                },
                set: function (value) {
                    var oldValue = this._interactiveViewModel;
                    if (oldValue !== value) {
                        if (oldValue) {
                            oldValue.uninitialize();
                        }

                        if (value) {
                            value.initialize();
                        }

                        this._interactiveViewModel = value;
                        this._observableMediaPlayer.notify("interactiveViewModel", value, oldValue);
                        this.dispatchEvent("interactiveviewmodelchange");
                    }
                }
            },

            /// <field name="msIsLayoutOptimalForPlayback" type="Boolean">Gets a value that specifies whether the media can be rendered more efficiently.</field>
            msIsLayoutOptimalForPlayback: {
                get: function () {
                    return this._mediaElement.msIsLayoutOptimalForPlayback;
                }
            },

            /// <field name="msAudioCategory" type="String">Gets or sets a value that specifies the purpose of the media, such as background audio or alerts.</field>
            msAudioCategory: {
                get: function () {
                    return this._mediaElement.msAudioCategory;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msAudioCategory;
                    if (oldValue !== value) {
                        this._mediaElement.msAudioCategory = value;
                        this._observableMediaPlayer.notify("msAudioCategory", value, oldValue);
                    }
                }
            },

            /// <field name="msAudioDeviceType" type="String">Gets or sets a value that specifies the output device ID that the audio will be sent to.</field>
            msAudioDeviceType: {
                get: function () {
                    return this._mediaElement.msAudioDeviceType;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msAudioDeviceType;
                    if (oldValue !== value) {
                        this._mediaElement.msAudioDeviceType = value;
                        this._observableMediaPlayer.notify("msAudioDeviceType", value, oldValue);
                    }
                }
            },

            /// <field name="msHorizontalMirror" type="Boolean">Gets or sets a value that specifies whether the media is flipped horizontally.</field>
            msHorizontalMirror: {
                get: function () {
                    return this._mediaElement.msHorizontalMirror;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msHorizontalMirror;
                    if (oldValue !== value) {
                        this._mediaElement.msHorizontalMirror = value;
                        this._observableMediaPlayer.notify("msHorizontalMirror", value, oldValue);
                    }
                }
            },

            /// <field name="msPlayToDisabled" type="Boolean">Gets or sets a value that specifies whether the DLNA PlayTo device is available.</field>
            msPlayToDisabled: {
                get: function () {
                    return this._mediaElement.msPlayToDisabled;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msPlayToDisabled;
                    if (oldValue !== value) {
                        this._mediaElement.msPlayToDisabled = value;
                        this._observableMediaPlayer.notify("msPlayToDisabled", value, oldValue);
                    }
                }
            },

            /// <field name="msPlayToPrimary" type="Boolean">Gets or sets the primary DLNA PlayTo device.</field>
            msPlayToPrimary: {
                get: function () {
                    return this._mediaElement.msPlayToPrimary;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msPlayToPrimary;
                    if (oldValue !== value) {
                        this._mediaElement.msPlayToPrimary = value;
                        this._observableMediaPlayer.notify("msPlayToPrimary", value, oldValue);
                    }
                }
            },

            /// <field name="msPlayToSource" type="Object">Gets the media source for use by the PlayToManager.</field>
            msPlayToSource: {
                get: function () {
                    return this._mediaElement.msPlayToSource;
                }
            },

            /// <field name="msRealTime" type="Boolean">Gets or sets a value that specifies whether or not to enable low-latency playback.</field>
            msRealTime: {
                get: function () {
                    return this._mediaElement.msRealTime;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msRealTime;
                    if (oldValue !== value) {
                        this._mediaElement.msRealTime = value;
                        this._observableMediaPlayer.notify("msRealTime", value, oldValue);
                    }
                }
            },

            /// <field name="msIsStereo3D" type="Boolean">Gets a value that specifies whether the system considers the media to be stereo 3D.</field>
            msIsStereo3D: {
                get: function () {
                    return this._mediaElement.msIsStereo3D;
                }
            },

            /// <field name="msStereo3DPackingMode" type="String">Gets or sets the frame-packing mode for stereo 3D video content.</field>
            msStereo3DPackingMode: {
                get: function () {
                    return this._mediaElement.msStereo3DPackingMode;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msStereo3DPackingMode;
                    if (oldValue !== value) {
                        this._mediaElement.msStereo3DPackingMode = value;
                        this._observableMediaPlayer.notify("msStereo3DPackingMode", value, oldValue);
                    }
                }
            },

            /// <field name="msStereo3DRenderMode" type="String">Gets or sets a value that specifies whether the system display is set to stereo display.</field>
            msStereo3DRenderMode: {
                get: function () {
                    return this._mediaElement.msStereo3DRenderMode;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msStereo3DRenderMode;
                    if (oldValue !== value) {
                        this._mediaElement.msStereo3DRenderMode = value;
                        this._observableMediaPlayer.notify("msStereo3DRenderMode", value, oldValue);
                    }
                }
            },

            /// <field name="msZoom" type="Boolean">Gets or sets a value that specifies whether the video frame is trimmed to fit the display.</field>
            msZoom: {
                get: function () {
                    return this._mediaElement.msZoom;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msZoom;
                    if (oldValue !== value) {
                        this._mediaElement.msZoom = value;
                        this._observableMediaPlayer.notify("msZoom", value, oldValue);
                    }
                }
            },

            /// <field name="msKeys" type="MSMediaKeys">Gets the MSMediaKeys object, which is used for decrypting media data, that is associated with this media element.</field>
            msKeys: {
                get: function () {
                    return this._mediaElement.msKeys;
                }
            },

            /// <field name="msPlayToPreferredSourceUri" type="String">Gets or sets the path to the preferred media source. This enables the Play To target device to stream the media content, which can be DRM protected, from a different location, such as a cloud media server.</field>
            msPlayToPreferredSourceUri: {
                get: function () {
                    return this._mediaElement.msPlayToPreferredSourceUri;
                },
                set: function (value) {
                    var oldValue = this._mediaElement.msPlayToPreferredSourceUri;
                    if (oldValue !== value) {
                        this._mediaElement.msPlayToPreferredSourceUri = value;
                        this._observableMediaPlayer.notify("msPlayToPreferredSourceUri", value, oldValue);
                    }
                }
            },

            /// <field name="testForMediaPack" type="Boolean">Gets or sets whether a test for the media feature pack should be performed prior to allowing content to be laoded. This is useful to enable if Windows 8 N/KN users will be using this app.</field>
            testForMediaPack: {
                get: function () {
                    return this._testForMediaPack;
                },
                set: function (value) {
                    this._testForMediaPack = value;
                }
            },

            /// <field name="visualMarkers" type="Array">Gets or sets the collection of markers to display in the timeline</field>
            visualMarkers: {
                get: function () {
                    return this._visualMarkers;
                },
                set: function (value) {
                    var oldValue = this._visualMarkers;
                    if (oldValue !== value) {
                        this._visualMarkers = value;
                        this._observableMediaPlayer.notify("visualMarkers", value, oldValue);
                    }
                }
            },

            /// <field name="markers" type="Array">Gets or sets the collection of markers to track. Note: this is different from visualMarkers (which are displayed in the timeline)</field>
            markers: {
                get: function () {
                    return this._markers;
                },
                set: function (value) {
                    var oldValue = this._markers;
                    if (oldValue !== value) {
                        this._markers = value;
                        this._observableMediaPlayer.notify("markers", value, oldValue);
                    }
                }
            },

            /// <field name="isThumbnailVisible" type="Boolean">Gets or sets whether thumbnails should be displayed while scrubbing. Default is false.</field>
            isThumbnailVisible: {
                get: function () {
                    return this._isThumbnailVisible;
                },
                set: function (value) {
                    var oldValue = this._isThumbnailVisible;
                    if (oldValue !== value) {
                        this._isThumbnailVisible = value;
                        this._observableMediaPlayer.notify("isThumbnailVisible", value, oldValue);
                    }
                }
            },

            /// <field name="thumbnailImageSrc" type="String">Gets or sets the thumbnail to show (typically while scrubbing and/or in RW/FF mode).</field>
            thumbnailImageSrc: {
                get: function () {
                    return this._thumbnailImageSrc;
                },
                set: function (value) {
                    var oldValue = this._thumbnailImageSrc;
                    if (oldValue !== value) {
                        this._thumbnailImageSrc = value;
                        this._observableMediaPlayer.notify("thumbnailImageSrc", value, oldValue);
                    }
                }
            },

            /// <field name="allowStartingDeferrals" type="Boolean">Gets or sets whether the MediaStarting event supports deferrals before playback begins. Note: without this, pre-roll ads will not work. Interally, this causes autoplay to be set to false and play to be called automatically from the canplaythrough event (if autoplay is true).</field>
            allowStartingDeferrals: {
                get: function () {
                    return this._allowStartingDeferrals;
                },
                set: function (value) {
                    var oldValue = this._allowStartingDeferrals;
                    if (oldValue !== value) {
                        this._allowStartingDeferrals = value;
                        this._observableMediaPlayer.notify("allowStartingDeferrals", value, oldValue);
                    }
                }
            },

            /************************ Public Methods ************************/
            canPlayType: function (type) {
                /// <summary>Returns a value that specifies whether the player can play a given media type.</summary>
                /// <param name="type" type="String">The type of media to be played.</param>
                /// <returns type="String">One of the following values: "probably", "maybe", or an empty string if the media cannot be rendered.</returns>

                return this._mediaElement.canPlayType(type);
            },

            retry: function () {
                /// <summary>Reloads the current media source and resumes where playback was left off.</summary>

                this.autoload = true;
                if (this._lastTime) {
                    this.startupTime = this._lastTime;
                }
                this.autoplay = true;
                this.load();
            },

            load: function () {
                /// <summary>Reloads the current media source.</summary>

                if (this._mediaElement.getAttribute("src") === this.src) {
                    this._mediaElement.load();
                } else if (this.playerState !== PlayerFramework.PlayerState.loading) {
                    this.playerState = PlayerFramework.PlayerState.loading;

                    if (this.testForMediaPack) {
                        if (!PlayerFramework.MediaPackHelper.testForMediaPack()) {
                            this._onMediaElementError();
                            return;
                        }
                    }

                    var deferrableOperation = new PlayerFramework.Utilities.DeferrableOperation();
                    deferrableOperation.src = this.src;
                    this.dispatchEvent("loading", deferrableOperation);

                    var promise = deferrableOperation.getPromise().then(
                        function (result) {
                            var canceled = result.some(function (value) { return value === false; });
                            if (!canceled) {
                                this._mediaElement.autoplay = (this.autoplay && !this.allowStartingDeferrals);
                                this._mediaElement.setAttribute("src", deferrableOperation.src);
                            }
                            else {
                                this._onMediaElementError();
                            }
                        }.bind(this)
                    );

                    promise.done(
                        function () {
                            PlayerFramework.Utilities.remove(this._activePromises, promise);
                        }.bind(this),
                        function () {
                            PlayerFramework.Utilities.remove(this._activePromises, promise);
                        }.bind(this)
                    );

                    this._activePromises.push(promise);
                }
            },

            play: function (onAutoPlay) {
                /// <summary>Loads and starts playback of the current media source.</summary>

                if (this.playerState === PlayerFramework.PlayerState.started) {
                    this._mediaElement.play();
                } else if (this.playerState !== PlayerFramework.PlayerState.starting) {
                    this.playerState = PlayerFramework.PlayerState.starting;

                    var deferrableOperation = new PlayerFramework.Utilities.DeferrableOperation();
                    this.dispatchEvent("starting", deferrableOperation);

                    var promise = deferrableOperation.getPromise().then(
                        function (result) {
                            var canceled = result.some(function (value) { return value === false; });
                            if (!canceled) {
                                if (!onAutoPlay || this.allowStartingDeferrals) {
                                    this._mediaElement.play();
                                }
                                this.playerState = PlayerFramework.PlayerState.started;
                                this.dispatchEvent("started");
                            }
                        }.bind(this)
                    );

                    promise.done(
                        function () {
                            PlayerFramework.Utilities.remove(this._activePromises, promise);
                        }.bind(this),
                        function () {
                            PlayerFramework.Utilities.remove(this._activePromises, promise);
                        }.bind(this)
                    );

                    this._activePromises.push(promise);
                }
            },

            pause: function () {
                /// <summary>Pauses playback of the current media source.</summary>

                this._mediaElement.pause();
            },

            playResume: function () {
                /// <summary>Resets the playback rate and resumes playing the current media source.</summary>

                this.playbackRate = this.defaultPlaybackRate;
                this.play();
            },

            replay: function () {
                /// <summary>Supports replay by applying replayOffset to the current playback position or by restarting at the beginning if replayOffset is null.</summary>

                if (this.replayOffset === null) {
                    this.currentTime = this.initialTime;
                }
                else {
                    this.currentTime = Math.max(this.initialTime, this.currentTime - this.replayOffset);
                }
                this.play();
            },

            decreasePlaybackRate: function () {
                /// <summary>Decreases the current playback rate by a factor of two. After the rate reaches 1 (normal speed), it will flip to -1, and then begins to rewind.</summary>

                var playbackRate = this.playbackRate;

                if (playbackRate <= 1 && playbackRate > -1) {
                    this.playbackRate = -1;
                } else if (playbackRate > 1) {
                    this.playbackRate /= 2;
                } else {
                    this.playbackRate *= 2;
                }
            },

            increasePlaybackRate: function () {
                /// <summary>Increases the current playback rate by a factor of two. After the rate reaches -1, it flips to 1 (normal speed), and then begins to fast forward.</summary>

                var playbackRate = this.playbackRate;

                if (playbackRate >= -1 && playbackRate < 1) {
                    this.playbackRate = 1;
                } else if (playbackRate < -1) {
                    this.playbackRate /= 2;
                } else {
                    this.playbackRate *= 2;
                }
            },

            addClass: function (name) {
                /// <summary>Adds the specified CSS class to the host element.</summary>
                /// <param name="name" type="String">The name of the class to add. Multiple classes can be added using space-delimited names.</param>

                WinJS.Utilities.addClass(this._element, name);
            },

            removeClass: function (name) {
                /// <summary>Removes the specified CSS class from the host element.</summary>
                /// <param name="name" type="String">The name of the class to remove. Multiple classes can be removed using space-delimited names.</param>

                WinJS.Utilities.removeClass(this._element, name);
            },

            focus: function () {
                /// <summary>Gives focus to the host element.</summary>

                this._element.focus();
            },

            update: function (mediaSource) {
                /// <summary>Updates the player and its plugins with the specified media source (e.g. the current playlist item).</summary>
                /// <param name="mediaSource" type="Object" optional="true">A JSON object containing the set of options that represent a media source.</param>

                if (!this._updating) {
                    this._updating = true;

                    // update the player
                    this.playerState = PlayerFramework.PlayerState.unloaded;
                    this._setOptions(mediaSource);

                    // update the plugins
                    for (var i = 0; i < this.plugins.length; i++) {
                        var plugin = this.plugins[i];
                        plugin.update(mediaSource);
                    }

                    // update the source
                    this._updateCurrentSource();

                    this.dispatchEvent("updated");
                    this._updating = false;
                }
            },

            addTextTrack: function (kind, label, language) {
                /// <summary>Create a new TextTrack object to add to an HTML5 video.</summary>
                /// <param name="kind" type="String">The type of text track.</param>
                /// <param name="label" type="String" optional="true">A user readable title for a text track.</param>
                /// <param name="language" type="String" optional="true">The BCP47 language tag of the track. For example "en" for English or "fr" for French.</param>

                return this._mediaElement.addTextTrack(kind, label, language);
            },

            msSetMediaKeys: function (mediaKeys) {
                /// <summary>Sets the MSMediaKeys to be used for decrypting media data.</summary>
                /// <param name="mediaKeys" type="MSMediaKeys">The media keys to use for decrypting media data. </param>

                this._mediaElement.msSetMediaKeys(mediaKeys);
            },

            dispose: function () {
                /// <summary>Shuts down and releases all resources.</summary>

                if (this._element) {
                    this._cancelActivePromises();
                    this._clearAutohideTimeout();
                    this._uninitializePlugins();

                    this.interactiveViewModel = null;

                    this._observableMediaPlayer.unbind();
                    this._unbindProperties();
                    this._unbindEvents();
                    this._observableMediaPlayer = null;

                    WinJS.Utilities.data(this._element).mediaPlayer = null;
                    WinJS.Utilities.removeClass(this._element, "pf-container");
                    this._element.winControl = null;

                    PlayerFramework.Utilities.removeElement(this._shimElement);
                    PlayerFramework.Utilities.removeElement(this._mediaElement);

                    this._element.innerHTML = "";
                    this._element = null;
                    this._shimElement = null;

                    this._mediaElement.src = null;
                    this._mediaElement = null;
                    this._mediaExtensionManager = null;
                }
            },

            msFrameStep: function (forward) {
                /// <summary>Steps the video forward or backward by one frame.</summary>
                /// <param name="forward" type="Boolean">If true, the video is stepped forward, otherwise the video is stepped backward.</param>

                this._mediaElement.msFrameStep(forward);
            },

            msClearEffects: function () {
                /// <summary>Clears all effects from the media pipeline.</summary>

                this._mediaElement.msClearEffects();
            },

            msInsertAudioEffect: function (activatableClassId, effectRequired, config) {
                /// <summary>Inserts the specified audio effect into the media pipeline.</summary>
                /// <param name="activatableClassId" type="String">The audio effects class.</param>
                /// <param name="effectRequired" type="Boolean"></param>
                /// <param name="config" type="Object" optional="true"></param>

                this._mediaElement.msInsertAudioEffect(activatableClassId, effectRequired, config);
            },

            msInsertVideoEffect: function (activatableClassId, effectRequired, config) {
                /// <summary>Inserts the specified video effect into the media pipeline.</summary>
                /// <param name="activatableClassId" type="String">The video effects class.</param>
                /// <param name="effectRequired" type="Boolean"></param>
                /// <param name="config" type="Object" optional="true"></param>

                this._mediaElement.msInsertVideoEffect(activatableClassId, effectRequired, config);
            },

            msSetMediaProtectionManager: function (mediaProtectionManager) {
                /// <summary>Sets the media protection manager for a given media pipeline.</summary>
                /// <param name="mediaProtectionManager" type="Windows.Media.Protection.MediaProtectionManager"></param>

                this._mediaElement.msSetMediaProtectionManager(mediaProtectionManager);
            },

            msSetVideoRectangle: function (left, top, right, bottom) {
                /// <summary>Sets the dimensions of a sub-rectangle within a video.</summary>
                /// <param name="left" type="Number">The left position of the rectangle.</param>
                /// <param name="top" type="Number">The top position of the rectangle.</param>
                /// <param name="right" type="Number">The right position of the rectangle.</param>
                /// <param name="bottom" type="Number">The bottom position of the rectangle.</param>

                this._mediaElement.msSetVideoRectangle(left, top, right, bottom);
            },

            stop: function () {
                /// <summary>Stops playback and raises the stopped event.</summary>

                if (this.playerState >= PlayerFramework.PlayerState.loaded) {
                    this._mediaElement.pause();
                    this._mediaElement.currentTime = this.startTime;
                }
                this.dispatchEvent("stopped");
            },

            info: function () {
                /// <summary>raises the infoinvoked event used to indicate that more information about the current media should be displayed to the user.</summary>

                this.dispatchEvent("infoinvoked");
            },

            more: function () {
                /// <summary>raises the moreinvoked event typically used to indicate that more options that were unable to fit in the control panel should be presented to the user (usually in the form of a flyout).</summary>

                this.dispatchEvent("moreinvoked");
            },

            captions: function () {
                /// <summary>raises the captionsinvoked event used to indicate that closed options should be toggled on/off or that a caption selection dialog should be presented to the user (usually in the form of a flyout).</summary>

                this.dispatchEvent("captionsinvoked");
            },

            audio: function () {
                /// <summary>raises the audioinvoked event used to indicate that an audio selection dialog should be presented to the user (usually in the form of a flyout).</summary>

                this.dispatchEvent("audioinvoked");
            },

            /************************ Private Methods ************************/

            _setElement: function (element) {
                // host element
                this._element = element;
                this._element.tabIndex = 0;
                this._element.hideFocus = true;
                this._element.winControl = this;
                WinJS.Utilities.data(this._element).mediaPlayer = this;
                WinJS.Utilities.addClass(this._element, "pf-container");

                // media element
                this._mediaElement = this._element.querySelector("video") || this._element.querySelector("audio") || document.createElement("video");
                WinJS.Utilities.addClass(this._mediaElement, "pf-media");
                WinJS.Utilities.addClass(this._element, "pf-media-" + this._mediaElement.tagName.toLowerCase());

                PlayerFramework.Utilities.appendElement(this._element, this._mediaElement);

                // HACK: "iframe shim" fixes issues with full screen overlay
                this._shimElement = document.createElement("iframe");
                this._shimElement.setAttribute("style", "display: none; visibility: hidden; opacity: 0;");
                this._shimElement.setAttribute("role", "presentation");
                this._shimElement.setAttribute("aria-hidden", "true");
                this._shimElement.setAttribute("unselectable", "on");
                WinJS.Utilities.addClass(this._shimElement, "pf-shim");
                PlayerFramework.Utilities.appendElement(document.body, this._shimElement);

                // events
                this._bindEvent("focus", this._element, this._onElementFocus);
                this._bindEvent("keydown", this._element, this._onElementKeyDown);
                if (window.PointerEvent) {
                    this._bindEvent("pointerdown", this._element, this._onElementMSPointerDown);
                    this._bindEvent("pointermove", this._element, this._onElementMSPointerMove);
                    this._bindEvent("pointerover", this._element, this._onElementMSPointerOver);
                    this._bindEvent("pointerout", this._element, this._onElementMSPointerOut);
                }
                else {
                    this._bindEvent("MSPointerDown", this._element, this._onElementMSPointerDown);
                    this._bindEvent("MSPointerMove", this._element, this._onElementMSPointerMove);
                    this._bindEvent("MSPointerOver", this._element, this._onElementMSPointerOver);
                    this._bindEvent("MSPointerOut", this._element, this._onElementMSPointerOut);
                }

                // media element events
                this._bindEvent("canplay", this._mediaElement, this._onMediaElementCanPlay);
                this._bindEvent("canplaythrough", this._mediaElement, this._onMediaElementCanPlayThrough);
                this._bindEvent("durationchange", this._mediaElement, this._onMediaElementDurationChange);
                this._bindEvent("emptied", this._mediaElement, this._onMediaElementEmptied);
                this._bindEvent("ended", this._mediaElement, this._onMediaElementEnded);
                this._bindEvent("error", this._mediaElement, this._onMediaElementError);
                this._bindEvent("loadeddata", this._mediaElement, this._onMediaElementLoadedData);
                this._bindEvent("loadedmetadata", this._mediaElement, this._onMediaElementLoadedMetadata);
                this._bindEvent("loadstart", this._mediaElement, this._onMediaElementLoadStart);
                this._bindEvent("MSVideoFormatChanged", this._mediaElement, this._onMediaElementMSVideoFormatChanged);
                this._bindEvent("MSVideoFrameStepCompleted", this._mediaElement, this._onMediaElementMSVideoFrameStepCompleted);
                this._bindEvent("MSVideoOptimalLayoutChanged", this._mediaElement, this._onMediaElementMSVideoOptimalLayoutChanged);
                this._bindEvent("pause", this._mediaElement, this._onMediaElementPause);
                this._bindEvent("play", this._mediaElement, this._onMediaElementPlay);
                this._bindEvent("playing", this._mediaElement, this._onMediaElementPlaying);
                this._bindEvent("progress", this._mediaElement, this._onMediaElementProgress);
                this._bindEvent("ratechange", this._mediaElement, this._onMediaElementRateChange);
                this._bindEvent("readystatechange", this._mediaElement, this._onMediaElementReadyStateChange);
                this._bindEvent("seeked", this._mediaElement, this._onMediaElementSeeked);
                this._bindEvent("seeking", this._mediaElement, this._onMediaElementSeeking);
                this._bindEvent("stalled", this._mediaElement, this._onMediaElementStalled);
                this._bindEvent("suspend", this._mediaElement, this._onMediaElementSuspend);
                this._bindEvent("timeupdate", this._mediaElement, this._onMediaElementTimeUpdate);
                this._bindEvent("volumechange", this._mediaElement, this._onMediaElementVolumeChange);
                this._bindEvent("waiting", this._mediaElement, this._onMediaElementWaiting);
                this._bindEvent("msneedkey", this._mediaElement, this._onMediaElementMSNeedKey);

                // property notifications
                this._bindEvent("emptied", this._mediaElement, this._notifyProperties, ["currentTime", "virtualTime", "paused", "ended", "buffered"]);
                this._bindEvent("loadstart", this._mediaElement, this._notifyProperties, ["currentTime", "virtualTime", "paused", "ended", "buffered"]);
                this._bindEvent("loadeddata", this._mediaElement, this._notifyProperties, ["currentTime", "virtualTime", "paused", "ended", "buffered"]);
                this._bindEvent("timeupdate", this._mediaElement, this._notifyProperties, ["currentTime", "virtualTime"]);
                this._bindEvent("playing", this._mediaElement, this._notifyProperties, ["paused", "ended"]);
                this._bindEvent("pause", this._mediaElement, this._notifyProperties, ["paused", "ended"]);
                this._bindEvent("ended", this._mediaElement, this._notifyProperties, ["paused", "ended"]);
                this._bindEvent("progress", this._mediaElement, this._notifyProperties, ["buffered"]);
                this._bindEvent("ratechange", this._mediaElement, this._notifyProperties, ["playbackRate"]);
                this._bindEvent("volumechange", this._mediaElement, this._notifyProperties, ["volume", "muted"]);

                // property dependencies
                this._bindProperty("advertisingState", this._observableMediaPlayer, this._notifyProperties, ["isPlayPauseAllowed", "isPlayResumeAllowed", "isPauseAllowed", "isReplayAllowed", "isRewindAllowed", "isFastForwardAllowed", "isSlowMotionAllowed", "isSkipPreviousAllowed", "isSkipNextAllowed", "isSkipBackAllowed", "isSkipAheadAllowed", "isElapsedTimeAllowed", "isRemainingTimeAllowed", "isTotalTimeAllowed", "isTimelineAllowed", "isGoLiveAllowed", "isCaptionsAllowed", "isAudioAllowed"]);
                this._bindProperty("playerState", this._observableMediaPlayer, this._notifyProperties, ["isPlayPauseAllowed", "isPlayResumeAllowed", "isPauseAllowed", "isReplayAllowed", "isRewindAllowed", "isFastForwardAllowed", "isSlowMotionAllowed", "isSkipPreviousAllowed", "isSkipNextAllowed", "isSkipBackAllowed", "isSkipAheadAllowed", "isElapsedTimeAllowed", "isRemainingTimeAllowed", "isTotalTimeAllowed", "isTimelineAllowed", "isGoLiveAllowed", "isCaptionsAllowed", "isAudioAllowed", "isStopAllowed", "isInfoAllowed"]);
                this._bindProperty("paused", this._observableMediaPlayer, this._notifyProperties, ["isPlayResumeAllowed", "isPauseAllowed", "isRewindAllowed", "isFastForwardAllowed", "isSlowMotionAllowed"]);
                this._bindProperty("ended", this._observableMediaPlayer, this._notifyProperties, ["isPlayResumeAllowed", "isPauseAllowed", "isRewindAllowed", "isFastForwardAllowed", "isSlowMotionAllowed"]);
                this._bindProperty("playbackRate", this._observableMediaPlayer, this._notifyProperties, ["isPlayResumeAllowed", "isRewindAllowed", "isFastForwardAllowed", "isSlowMotionAllowed", "isSlowMotion"]);
                this._bindProperty("defaultPlaybackRate", this._observableMediaPlayer, this._notifyProperties, ["isPlayResumeAllowed"]);
                this._bindProperty("slowMotionPlaybackRate", this._observableMediaPlayer, this._notifyProperties, ["isSlowMotionAllowed", "isSlowMotion"]);
                this._bindProperty("isLive", this._observableMediaPlayer, this._notifyProperties, ["isGoLiveAllowed"]);
                this._bindProperty("isCurrentTimeLive", this._observableMediaPlayer, this._notifyProperties, ["isGoLiveAllowed"]);
                this._bindProperty("startTime", this._observableMediaPlayer, this._notifyProperties, ["duration"]);
                this._bindProperty("endTime", this._observableMediaPlayer, this._notifyProperties, ["duration"]);
                this._bindProperty("captionTracks", this._observableMediaPlayer, this._notifyProperties, ["isCaptionsAllowed"]);
                this._bindProperty("audioTracks", this._observableMediaPlayer, this._notifyProperties, ["isAudioAllowed"]);

                // initialize view model
                this.interactiveViewModel.initialize();
            },

            _setOptions: function (options) {
                // prevents source updates from loading immediately
                // and allows all plugins to be updated first
                if (options && options.src) {
                    this._src = options.src;
                } else {
                    this._src = "";
                }

                PlayerFramework.Utilities.setOptions(this, options);
            },

            _initializePlugins: function () {
                // instantiate plugins
                for (var pluginKey in PlayerFramework.Plugins) {
                    var pluginType = PlayerFramework.Plugins[pluginKey];
                    if (pluginType && pluginType.prototype instanceof PlayerFramework.PluginBase) {
                        var pluginName = pluginKey[0].toLowerCase() + pluginKey.substring(1);
                        var pluginOptions = this[pluginName] || undefined;
                        var plugin = new pluginType(pluginOptions);
                        this[pluginName] = plugin;
                        this.plugins.push(plugin);
                    } else {
                        throw invalidPlugin;
                    }
                }

                // load plugins
                for (var i = 0; i < this.plugins.length; i++) {
                    var plugin = this.plugins[i];
                    plugin.mediaPlayer = this;
                    plugin.load();
                }
            },

            _uninitializePlugins: function () {
                // unload plugins
                for (var i = 0; i < this.plugins.length; i++) {
                    var plugin = this.plugins[i];
                    plugin.unload();
                    plugin.mediaPlayer = null;
                }

                // reset plugins
                this._plugins = [];
            },

            _cancelActivePromises: function () {
                for (var i = 0; i < this._activePromises.length; i++) {
                    var promise = this._activePromises[i];
                    promise.cancel();
                }

                this._activePromises = [];
            },

            _notifyProperties: function (propertyNames) {
                if (this._observableMediaPlayer) {
                    for (var i = 0; i < propertyNames.length; i++) {
                        var propertyName = propertyNames[i];
                        var propertyValue = this[propertyName];
                        this._observableMediaPlayer.notify(propertyName, propertyValue);
                    }
                }
            },

            _seek: function (time) {
                var previousTime = (time === this._virtualTime ? this.currentTime : this._virtualTime);
                var e = { previousTime: previousTime, time: time, canceled: false };
                this.dispatchEvent("seek", e);

                if (!e.canceled) {
                    this.currentTime = time;
                }
            },

            _seekToLive: function () {
                if (this.liveTime) {
                    this._seek(this.liveTime);
                }
            },

            _startScrub: function (time) {
                if (!this._scrubbing) {
                    this._scrubbing = true;
                    this._scrubStartTime = this._virtualTime;

                    var e = { time: time, canceled: false };
                    this.dispatchEvent("scrub", e);

                    if (!e.canceled) {
                        this._scrubPlaybackRate = this.playbackRate;
                        if (this._mediaElement.tagName !== "AUDIO") {
                            // better UX to not stop playback for audio
                            this._mediaElement.playbackRate = 0;
                        }
                    } else {
                        this._completeScrub(time, true);
                    }
                }
            },

            _updateScrub: function (time) {
                if (this._scrubbing) {
                    var e = { startTime: this._scrubStartTime, time: time, canceled: false };
                    this.dispatchEvent("scrubbing", e);

                    if (!e.canceled) {
                        if (this.seekWhileScrubbing) {
                            this.currentTime = time;
                        }
                        else {
                            this._setVirtualTime(time);
                        }
                    } else {
                        this._completeScrub(time, true);
                    }
                }
            },

            _completeScrub: function (time, canceled) {
                if (this._scrubbing) {
                    this._scrubbing = false;

                    var e = { startTime: this._scrubStartTime, time: time, canceled: !!canceled };
                    this.dispatchEvent("scrubbed", e);

                    if (!e.canceled) {
                        this.currentTime = time;
                    }
                    if (this._mediaElement.tagName !== "AUDIO") {
                        this._mediaElement.playbackRate = this._scrubPlaybackRate;
                    }
                }
            },

            _updateCurrentSource: function () {
                if (this.src && this.autoload) {
                    this.load();
                } else {
                    this.playerState = this.src ? PlayerFramework.PlayerState.pending : PlayerFramework.PlayerState.unloaded;
                    this._mediaElement.removeAttribute("src");
                }
            },

            _updateIsCurrentTimeLive: function () {
                if (this.liveTime !== null) {
                    var liveThreshold = this.isCurrentTimeLive ? this.liveTimeBuffer * 1.1 : this.liveTimeBuffer * 0.9;
                    this.isCurrentTimeLive = this.liveTime - this._virtualTime < liveThreshold;
                } else {
                    this.isCurrentTimeLive = false;
                }
            },

            _updateMarkerState: function () {
                var now = this._virtualTime;
                for (var i = 0; i < this._markers.length; i++) {
                    var marker = this._markers[i];
                    if (marker.time < now && marker.time >= this._lastMarkerCheckTime) {
                        this.dispatchEvent("markerreached", marker);
                    }
                }
                this._lastMarkerCheckTime = now;
            },

            _isFunctionalElement: function (element) {
                var functionalElements = this.element.querySelectorAll(".pf-functional:not(:disabled)");
                return !!PlayerFramework.Utilities.first(functionalElements, function (functionalElement) {
                    return functionalElement === element || functionalElement.contains(element);
                });
            },

            _isInteractiveElement: function (element) {
                var interactiveElements = this.element.querySelectorAll(".pf-interactive, .pf-interactive *");
                for (var i = 0; i < interactiveElements.length; i++) {
                    if (interactiveElements[i] === element) {
                        return true;
                    }
                }
                return false;
            },

            _clearAutohideTimeout: function () {
                window.clearTimeout(this._autohideTimeoutId);
                this._autohideTimeoutId = null;
            },

            _resetAutohideTimeout: function () {
                window.clearTimeout(this._autohideTimeoutId);
                this._autohideTimeoutId = window.setTimeout(this._onAutohideTimeout.bind(this), this.autohideTime * 1000);
            },

            _onAutohideTimeout: function () {
                var preventAutohide = false;
                var activeElement = document.activeElement;

                if ((this.autohideBehavior & PlayerFramework.AutohideBehavior.allowDuringPlaybackOnly) === PlayerFramework.AutohideBehavior.allowDuringPlaybackOnly && this.interactiveViewModel.state !== PlayerFramework.ViewModelState.playing) {
                    preventAutohide = true;
                } else if ((this.autohideBehavior & PlayerFramework.AutohideBehavior.preventDuringInteractiveHover) === PlayerFramework.AutohideBehavior.preventDuringInteractiveHover && this._isInteractiveHover) {
                    preventAutohide = true;
                } else if (activeElement && this._isInteractiveElement(activeElement) && !WinJS.Utilities.hasClass(activeElement, "pf-hide-focus")) {
                    preventAutohide = true;
                }

                if (!preventAutohide) {
                    this._clearAutohideTimeout();
                    this.isInteractive = false;
                } else {
                    this._resetAutohideTimeout();
                }
            },

            _onUserInteraction: function (interactionType, handled) {
                if (this.isInteractive) {
                    if (!handled && (this.interactiveDeactivationMode & PlayerFramework.InteractionType.hard) === PlayerFramework.InteractionType.hard && (interactionType & PlayerFramework.InteractionType.hard) === PlayerFramework.InteractionType.hard) {
                        this.isInteractive = false;
                    } else if ((this.interactiveDeactivationMode & PlayerFramework.InteractionType.soft) === PlayerFramework.InteractionType.soft && this.autohide) {
                        this._resetAutohideTimeout();
                    }
                } else {
                    if ((this.interactiveActivationMode & interactionType) === interactionType) {
                        this.isInteractive = true;
                    }
                }
            },

            _onElementFocus: function (e) {
                this._onUserInteraction(PlayerFramework.InteractionType.hard, true);
            },

            _onElementKeyDown: function (e) {
                if (e.keyCode === WinJS.Utilities.Key.F11 && this.isFullScreenAllowed && this.isFullScreenEnabled) {
                    this.isFullScreen = !this.isFullScreen;
                } else if (e.keyCode === WinJS.Utilities.Key.escape && this.isFullScreenAllowed && this.isFullScreenEnabled) {
                    this.isFullScreen = false;
                }

                this._onUserInteraction(PlayerFramework.InteractionType.hard, true);
            },

            _onElementMSPointerDown: function (e) {
                // prevent conflict with MSPointerMove event
                this._interactivePointerArgs = e;

                if (this._isFunctionalElement(e.target)) {
                    this._onUserInteraction(PlayerFramework.InteractionType.hard, true);
                } else {
                    this._onUserInteraction(PlayerFramework.InteractionType.hard, false);
                }
            },

            _onElementMSPointerMove: function (e) {
                // prevent conflict with MSPointerDown event
                if (e.pointerType === e.MSPOINTER_TYPE_MOUSE || !this._interactivePointerArgs || e.clientX !== this._interactivePointerArgs.clientX || e.clientY !== this._interactivePointerArgs.clientY) {
                    this._onUserInteraction(PlayerFramework.InteractionType.soft, false);
                }

                this._interactivePointerArgs = e;
            },

            _onElementMSPointerOver: function (e) {
                if (this._isInteractiveElement(e.target)) {
                    this._isInteractiveHover = true;
                }
            },

            _onElementMSPointerOut: function (e) {
                this._isInteractiveHover = false;
            },

            _onMediaElementCanPlay: function (e) {
                this.playerState = PlayerFramework.PlayerState.opened;
                this.dispatchEvent("canplay");
            },

            _onMediaElementCanPlayThrough: function (e) {
                this.dispatchEvent("canplaythrough");

                if (this.autoplay) {
                    this.play(true);
                }
            },

            _onMediaElementDurationChange: function (e) {
                if (isFinite(this._mediaElement.duration)) {
                    // if duration is infinity, this means initialTime is not necessarily valid either. StartTime must be provided by another means (e.g. adaptive plugin)
                    this.startTime = this._mediaElement.initialTime;
                }
                this.endTime = this._mediaElement.duration;
            },

            _onMediaElementEmptied: function (e) {
                this._lastTime = null;
                this.playerState = this.src ? PlayerFramework.PlayerState.pending : PlayerFramework.PlayerState.unloaded;
                this.dispatchEvent("emptied");
            },

            _onMediaElementEnded: function (e) {
                this.playerState = PlayerFramework.PlayerState.ending;

                var deferrableOperation = new PlayerFramework.Utilities.DeferrableOperation();
                this.dispatchEvent("ending", deferrableOperation);

                var promise = deferrableOperation.getPromise().then(
                    function () {
                        this.playerState = PlayerFramework.PlayerState.ended;
                        this.dispatchEvent("ended");
                    }.bind(this)
                );

                promise.done(
                    function () {
                        PlayerFramework.Utilities.remove(this._activePromises, promise);
                    }.bind(this),
                    function () {
                        PlayerFramework.Utilities.remove(this._activePromises, promise);
                    }.bind(this)
                );

                this._activePromises.push(promise);
            },

            _onMediaElementError: function (e) {
                var e = { error: this.error, canceled: false };
                this.dispatchEvent("error", e);

                if (!e.canceled) {
                    this.playerState = PlayerFramework.PlayerState.failed;
                }
            },

            _onMediaElementLoadedData: function (e) {
                this.dispatchEvent("loadeddata");
                if (this.startupTime) {
                    this.currentTime = this.startupTime;
                }
            },

            _onMediaElementLoadedMetadata: function (e) {
                this.mediaQuality = this.videoHeight >= 720 ? PlayerFramework.MediaQuality.highDefinition : PlayerFramework.MediaQuality.standardDefinition;

                if (!this.audioTracks) {
                    this.audioTracks = PlayerFramework.Utilities.getArray(this._mediaElement.audioTracks);
                }
                this.currentAudioTrack = PlayerFramework.Utilities.first(this.audioTracks, function (track) { return track.enabled; });

                if (!this.captionTracks) {
                    this.captionTracks = Array.prototype.filter.call(this.textTracks, function (track) {
                        return (track.kind === "captions" || track.kind === "subtitles") && track !== this._dummyTrack;
                    }, this);
                }
                this.currentCaptionTrack = PlayerFramework.Utilities.first(this.captionTracks, function (track) { return track.mode === PlayerFramework.TextTrackMode.showing; });

                this.dispatchEvent("loadedmetadata");
            },

            _onMediaElementLoadStart: function (e) {
                this._lastMarkerCheckTime = -1;
                this.playerState = PlayerFramework.PlayerState.loaded;
                this.dispatchEvent("loadstart");
            },

            _onMediaElementMSVideoFormatChanged: function (e) {
                this.dispatchEvent("MSVideoFormatChanged");
            },

            _onMediaElementMSVideoFrameStepCompleted: function (e) {
                this.dispatchEvent("MSVideoFrameStepCompleted");
            },

            _onMediaElementMSVideoOptimalLayoutChanged: function (e) {
                this.dispatchEvent("MSVideoOptimalLayoutChanged");
            },

            _onMediaElementMSNeedKey: function (e) {
                this.dispatchEvent("msneedkey");
            },

            _onMediaElementPause: function (e) {
                this.dispatchEvent("pause");
            },

            _onMediaElementPlay: function (e) {
                this.dispatchEvent("play");
            },

            _onMediaElementPlaying: function (e) {
                this.dispatchEvent("playing");
            },

            _onMediaElementProgress: function (e) {
                this.dispatchEvent("progress");
            },

            _onMediaElementRateChange: function (e) {
                this.dispatchEvent("ratechange");
            },

            _onMediaElementReadyStateChange: function (e) {
                this.dispatchEvent("readystatechange");
            },

            _onMediaElementSeeked: function (e) {
                this.dispatchEvent("seeked");
            },

            _onMediaElementSeeking: function (e) {
                this.dispatchEvent("seeking");
            },

            _onMediaElementStalled: function (e) {
                this.dispatchEvent("stalled");
            },

            _onMediaElementSuspend: function (e) {
                this.dispatchEvent("suspend");
            },

            _onMediaElementTimeUpdate: function (e) {
                var time = this.currentTime;
                if ((this.isTrickPlayEnabled || this.playbackRate === 0.0 || this.playbackRate === 1.0) && !this.scrubbing) {
                    this._virtualTime = time;
                }
                this._lastTime = time;
                this._updateIsCurrentTimeLive();
                this._updateMarkerState();
                this.dispatchEvent("timeupdate");
            },

            _onMediaElementVolumeChange: function (e) {
                this.dispatchEvent("volumechange");
            },

            _onMediaElementWaiting: function (e) {
                this.dispatchEvent("waiting");
            },

            _setVirtualTime: function (time) {
                var oldValue = this._virtualTime;
                this._virtualTime = time;
                this._lastTime = this._virtualTime;
                this._updateIsCurrentTimeLive();
                this.dispatchEvent("timeupdate");
                this._observableMediaPlayer.notify("virtualTime", time, oldValue);
            },

            _onSimulatedPlaybackRateTimerTick: function () {
                if (this.playbackRate !== 0.0 && this.playbackRate !== 1.0 && !this.scrubbing) {
                    var newTime = this._virtualTime + this.playbackRate / 4;
                    if (newTime > this.endTime) newTime = this.endTime;
                    if (newTime < this.startTime) newTime = this.startTime;
                    this._setVirtualTime(newTime);
                }
            }
        })
    });

    // MediaPlayer Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, WinJS.Utilities.eventMixin);
    WinJS.Class.mix(PlayerFramework.MediaPlayer, PlayerFramework.Utilities.createEventProperties(events));
    WinJS.Class.mix(PlayerFramework.MediaPlayer, PlayerFramework.Utilities.eventBindingMixin);
    WinJS.Class.mix(PlayerFramework.MediaPlayer, PlayerFramework.Utilities.propertyBindingMixin);

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // DynamicTextTrack Errors
    var invalidConstruction = "Invalid construction: DynamicTextTrack constructor must be called using the \"new\" operator.";

    // AdHandlerPlugin Events
    var events = [
        "payloadaugmented"
    ];

    // DynamicTextTrack Class
    var DynamicTextTrack = WinJS.Class.define(function (stream) {
        if (!(this instanceof PlayerFramework.DynamicTextTrack)) {
            throw invalidConstruction;
        }

        this._stream = stream;
    }, {
        // Public Properties
        stream: {
            get: function () {
                return this._stream;
            }
        },

        label: {
            get: function () {
                return this._stream.name;
            }
        },

        language: {
            get: function () {
                return this._stream.language;
            }
        },
        
        // Public Methods
        augmentPayload: function (payload, startTime, endTime) {
            this.dispatchEvent("payloadaugmented", {
                "payload": payload,
                "startTime": startTime,
                "endTime": endTime,
            });
        }
    });

    // DynamicTextTrack Mixins
    WinJS.Class.mix(DynamicTextTrack, WinJS.Utilities.eventMixin);
    WinJS.Class.mix(DynamicTextTrack, PlayerFramework.Utilities.eventBindingMixin);
    WinJS.Class.mix(DynamicTextTrack, PlayerFramework.Utilities.createEventProperties(events));
    
    // DynamicTextTrack Exports
    WinJS.Namespace.define("PlayerFramework", {
        DynamicTextTrack: DynamicTextTrack
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // Button Errors
    var invalidConstruction = "Invalid construction: Button constructor must be called using the \"new\" operator.",
        invalidElement = "Invalid argument: Button expects an element as the first argument.";

    // Button Events
    var events = [
        "click"
    ];

    // Button Class
    var Button = WinJS.Class.define(function (element, options) {
        if (!(this instanceof PlayerFramework.UI.Button)) {
            throw invalidConstruction;
        }

        if (!element) {
            throw invalidElement;
        }

        this._element = null;
        this._containerElement = null;
        this._contentElement = null;
        this._hoverContentElement = null;
        this._type = null;
        this._flyout = null;

        this._setElement(element);
        this._setOptions(options);
    }, {
        // Public Properties
        element: {
            get: function () {
                return this._element;
            }
        },

        type: {
            get: function () {
                return this._type;
            },
            set: function (value) {
                if (value === "flyout") {
                    this._type = "flyout";
                    this._element.setAttribute("aria-haspopup", true);
                } else {
                    this._type = "button";
                    this._element.setAttribute("aria-haspopup", false);
                }
            }
        },

        content: {
            get: function () {
                return this._contentElement.textContent;
            },
            set: function (value) {
                this._contentElement.textContent = value;
            }
        },
        
        hoverContent: {
            get: function () {
                return this._hoverContentElement.textContent;
            },
            set: function (value) {
                this._hoverContentElement.textContent = value;

                if (value) {
                    WinJS.Utilities.addClass(this._element, "pf-hover");
                } else {
                    WinJS.Utilities.removeClass(this._element, "pf-hover");
                }
            }
        },

        label: {
            get: function () {
                return this._element.getAttribute("aria-label");
            },
            set: function (value) {
                this._element.setAttribute("aria-label", value);
            }
        },

        tooltip: {
            get: function () {
                return this._element.title;
            },
            set: function (value) {
                this._element.title = value;
            }
        },

        disabled: {
            get: function () {
                return this._element.disabled;
            },
            set: function (value) {
                this._element.disabled = value;
                this._element.setAttribute("aria-disabled", value);
            }
        },

        hidden: {
            get: function () {
                return WinJS.Utilities.hasClass(this._element, "pf-hidden");
            },
            set: function (value) {
                if (value) {
                    WinJS.Utilities.addClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", true);
                } else {
                    WinJS.Utilities.removeClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", false);
                }
            }
        },

        flyout: {
            get: function () {
                var flyout = this._flyout;

                if (typeof flyout === "string") {
                    flyout = document.getElementById(flyout);
                }

                if (flyout && !flyout.element) {
                    flyout = flyout.winControl;
                }

                return flyout;
            },
            set: function (value) {
                var id = value;

                if (id && typeof id !== "string") {
                    if (id.element) {
                        id = id.element;
                    }

                    if (id) {
                        if (id.id) {
                            id = id.id;
                        } else {
                            id = id.uniqueID;
                        }
                    }
                }

                if (typeof id === "string") {
                    this._element.setAttribute("aria-owns", id);
                }

                this._flyout = value;
            }
        },

        // Private Methods
        _setElement: function (element) {
            this._element = element;
            this._element.winControl = this;
            this._element.setAttribute("role", "button");
            WinJS.Utilities.addClass(this._element, "pf-button pf-control pf-functional");

            this._containerElement = PlayerFramework.Utilities.createElement(this._element, ["span", { "class": "pf-button-container" }]);
            this._contentElement = PlayerFramework.Utilities.createElement(this._containerElement, ["span", { "class": "pf-button-content" }]);
            this._hoverContentElement = PlayerFramework.Utilities.createElement(this._containerElement, ["span", { "class": "pf-button-content" }]);

            this._bindEvent("click", this._element, this._onElementClick);
        },

        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                type: "button",
                content: "",
                hoverContent: "",
                label: "",
                tooltip: "",
                disabled: false,
                hidden: false,
                flyout: null
            });
        },

        _onElementClick: function (e) {
            if (this.type === "flyout") {
                var flyout = this.flyout;
                if (flyout && flyout.show) {
                    flyout.show(this);
                }
            }
        }
    });

    // Button Mixins
    WinJS.Class.mix(Button, WinJS.UI.DOMEventMixin);
    WinJS.Class.mix(Button, PlayerFramework.Utilities.createEventProperties(events));
    WinJS.Class.mix(Button, PlayerFramework.Utilities.eventBindingMixin);

    // Button Exports
    WinJS.Namespace.define("PlayerFramework.UI", {
        Button: Button
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // ControlPanel Errors
    var invalidConstruction = "Invalid construction: ControlPanel constructor must be called using the \"new\" operator.",
        invalidElement = "Invalid argument: ControlPanel expects an element as the first argument.";

    // ControlPanel Class
    var ControlPanel = WinJS.Class.define(function (element, options) {
        if (!(this instanceof PlayerFramework.UI.ControlPanel)) {
            throw invalidConstruction;
        }

        if (!element) {
            throw invalidElement;
        }

        this._element = null;
        this._playPauseElement = null;
        this._playResumeElement = null;
        this._pauseElement = null;
        this._replayElement = null;
        this._rewindElement = null;
        this._fastForwardElement = null;
        this._slowMotionElement = null;
        this._skipPreviousElement = null;
        this._skipNextElement = null;
        this._skipBackElement = null;
        this._skipAheadElement = null;
        this._elapsedTimeElement = null;
        this._timeSeparatorElement = null;
        this._remainingTimeElement = null;
        this._totalTimeElement = null;
        this._timelineElement = null;
        this._goLiveElement = null;
        this._captionsElement = null;
        this._audioElement = null;
        this._volumeMuteContainerElement = null;
        this._volumeMuteElement = null;
        this._volumeMuteSliderElement = null;
        this._volumeElement = null;
        this._muteElement = null;
        this._fullScreenElement = null;
        this._stopElement = null;
        this._infoElement = null;
        this._moreElement = null;
        this._zoomElement = null;
        this._signalStrengthElement = null;
        this._mediaQualityElement = null;

        this._flyoutContainerElement = null;
        this._volumeFlyoutElement = null;

        this._setElement(element);
        this._setOptions(options);
    }, {
        // Public Properties
        element: {
            get: function () {
                return this._element;
            }
        },

        hidden: {
            get: function () {
                return WinJS.Utilities.hasClass(this._element, "pf-hidden");
            },
            set: function (value) {
                if (value) {
                    WinJS.Utilities.addClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", true);
                } else {
                    WinJS.Utilities.removeClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", false);
                }
            }
        },

        isPlayPauseHidden: {
            get: function () {
                return this._playPauseElement.winControl.hidden;
            },
            set: function (value) {
                this._playPauseElement.winControl.hidden = value;
            }
        },

        isPlayResumeHidden: {
            get: function () {
                return this._playResumeElement.winControl.hidden;
            },
            set: function (value) {
                this._playResumeElement.winControl.hidden = value;
            }
        },

        isPauseHidden: {
            get: function () {
                return this._pauseElement.winControl.hidden;
            },
            set: function (value) {
                this._pauseElement.winControl.hidden = value;
            }
        },

        isReplayHidden: {
            get: function () {
                return this._replayElement.winControl.hidden;
            },
            set: function (value) {
                this._replayElement.winControl.hidden = value;
            }
        },

        isRewindHidden: {
            get: function () {
                return this._rewindElement.winControl.hidden;
            },
            set: function (value) {
                this._rewindElement.winControl.hidden = value;
            }
        },

        isFastForwardHidden: {
            get: function () {
                return this._fastForwardElement.winControl.hidden;
            },
            set: function (value) {
                this._fastForwardElement.winControl.hidden = value;
            }
        },

        isSlowMotionHidden: {
            get: function () {
                return this._slowMotionElement.winControl.hidden;
            },
            set: function (value) {
                this._slowMotionElement.winControl.hidden = value;
            }
        },

        isSkipPreviousHidden: {
            get: function () {
                return this._skipPreviousElement.winControl.hidden;
            },
            set: function (value) {
                this._skipPreviousElement.winControl.hidden = value;
            }
        },

        isSkipNextHidden: {
            get: function () {
                return this._skipNextElement.winControl.hidden;
            },
            set: function (value) {
                this._skipNextElement.winControl.hidden = value;
            }
        },

        isSkipBackHidden: {
            get: function () {
                return this._skipBackElement.winControl.hidden;
            },
            set: function (value) {
                this._skipBackElement.winControl.hidden = value;
            }
        },

        isSkipAheadHidden: {
            get: function () {
                return this._skipAheadElement.winControl.hidden;
            },
            set: function (value) {
                this._skipAheadElement.winControl.hidden = value;
            }
        },

        isElapsedTimeHidden: {
            get: function () {
                return this._elapsedTimeElement.winControl.hidden;
            },
            set: function (value) {
                this._elapsedTimeElement.winControl.hidden = value;
            }
        },

        isRemainingTimeHidden: {
            get: function () {
                return this._remainingTimeElement.winControl.hidden;
            },
            set: function (value) {
                this._remainingTimeElement.winControl.hidden = value;
            }
        },

        isTotalTimeHidden: {
            get: function () {
                return this._totalTimeElement.winControl.hidden;
            },
            set: function (value) {
                this._totalTimeElement.winControl.hidden = value;
            }
        },

        isTimelineHidden: {
            get: function () {
                return this._timelineElement.winControl.hidden;
            },
            set: function (value) {
                this._timelineElement.winControl.hidden = value;
            }
        },

        isGoLiveHidden: {
            get: function () {
                return this._goLiveElement.winControl.hidden;
            },
            set: function (value) {
                this._goLiveElement.winControl.hidden = value;
            }
        },

        isCaptionsHidden: {
            get: function () {
                return this._captionsElement.winControl.hidden;
            },
            set: function (value) {
                this._captionsElement.winControl.hidden = value;
            }
        },

        isAudioHidden: {
            get: function () {
                return this._audioElement.winControl.hidden;
            },
            set: function (value) {
                this._audioElement.winControl.hidden = value;
            }
        },

        isVolumeMuteHidden: {
            get: function () {
                return this._volumeMuteElement.winControl.hidden;
            },
            set: function (value) {
                this._volumeMuteElement.winControl.hidden = value;
                this._volumeMuteContainerElement.style.display = value ? "none" : "";
            }
        },

        isVolumeHidden: {
            get: function () {
                return this._volumeElement.winControl.hidden;
            },
            set: function (value) {
                this._volumeElement.winControl.hidden = value;
            }
        },

        isMuteHidden: {
            get: function () {
                return this._muteElement.winControl.hidden;
            },
            set: function (value) {
                this._muteElement.winControl.hidden = value;
            }
        },

        isFullScreenHidden: {
            get: function () {
                return this._fullScreenElement.winControl.hidden;
            },
            set: function (value) {
                this._fullScreenElement.winControl.hidden = value;
            }
        },

        isStopHidden: {
            get: function () {
                return this._stopElement.winControl.hidden;
            },
            set: function (value) {
                this._stopElement.winControl.hidden = value;
            }
        },

        isInfoHidden: {
            get: function () {
                return this._infoElement.winControl.hidden;
            },
            set: function (value) {
                this._infoElement.winControl.hidden = value;
            }
        },

        isMoreHidden: {
            get: function () {
                return this._moreElement.winControl.hidden;
            },
            set: function (value) {
                this._moreElement.winControl.hidden = value;
            }
        },

        isZoomHidden: {
            get: function () {
                return this._zoomElement.winControl.hidden;
            },
            set: function (value) {
                this._zoomElement.winControl.hidden = value;
            }
        },

        isSignalStrengthHidden: {
            get: function () {
                return this._signalStrengthElement.winControl.hidden;
            },
            set: function (value) {
                this._signalStrengthElement.winControl.hidden = value;
            }
        },

        isMediaQualityHidden: {
            get: function () {
                return this._mediaQualityElement.winControl.hidden;
            },
            set: function (value) {
                this._mediaQualityElement.winControl.hidden = value;
            }
        },

        flyoutContainerElement: {
            get: function () {
                return this._flyoutContainerElement;
            },
            set: function (value) {
                if (this._flyoutContainerElement) {
                    this._volumeElement.winControl.flyout = null;

                    PlayerFramework.Utilities.removeElement(this._volumeFlyoutElement);
                }

                this._flyoutContainerElement = value;

                if (this._flyoutContainerElement) {
                    this._volumeFlyoutElement = PlayerFramework.Utilities.createElement(this._flyoutContainerElement, ["div", { "class": "pf-volume-flyout", "data-win-control": "WinJS.UI.Flyout" }, ["button", { "type": "button", "class": "pf-mute-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: muteIcon; winControl.label: muteLabel; winControl.tooltip: muteTooltip; winControl.disabled: isMuteDisabled; winControl.onclick: toggleMuted PlayerFramework.Binding.setEventHandler;" }], ["hr"], ["div", { "class": "pf-volume-slider-control", "data-win-control": "PlayerFramework.UI.Slider", "data-win-bind": "winControl.value: volume; winControl.label: volumeLabel; winControl.tooltip: volumeTooltip; winControl.disabled: isVolumeDisabled; winControl.onupdate: onVolumeSliderUpdate PlayerFramework.Binding.setEventHandler;", "data-win-options": "{ altStep1: 5, vertical: true }" }]]);

                    WinJS.UI.processAll(this._flyoutContainerElement);

                    this._volumeElement.winControl.flyout = this._volumeFlyoutElement.winControl;
                }
            }
        },

        // Private Methods
        _setElement: function (element) {
            this._element = element;
            this._element.winControl = this;
            WinJS.Utilities.addClass(this._element, "pf-control-panel");

            var isHierarchical = PlayerFramework.Utilities.styleSheetSelectorExists('.pf-controlpanel-hierarchy');
            if (isHierarchical) {

                var primaryContainer = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-controlcontainer-primary pf-interactive" }]);
                this._skipPreviousElement = PlayerFramework.Utilities.createElement(primaryContainer, ["button", { "type": "button", "class": "pf-skip-previous-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipPreviousIcon; winControl.label: skipPreviousLabel; winControl.tooltip: skipPreviousTooltip; winControl.disabled: isSkipPreviousDisabled; winControl.onclick: skipPrevious PlayerFramework.Binding.setEventHandler;" }]);
                this._rewindElement = PlayerFramework.Utilities.createElement(primaryContainer, ["button", { "type": "button", "class": "pf-rewind-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: rewindIcon; winControl.label: rewindLabel; winControl.tooltip: rewindTooltip; winControl.disabled: isRewindDisabled; winControl.onclick: rewind PlayerFramework.Binding.setEventHandler;" }]);
                this._skipBackElement = PlayerFramework.Utilities.createElement(primaryContainer, ["button", { "type": "button", "class": "pf-skip-back-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipBackIcon; winControl.label: skipBackLabel; winControl.tooltip: skipBackTooltip; winControl.disabled: isSkipBackDisabled; winControl.onclick: skipBack PlayerFramework.Binding.setEventHandler;" }]);
                this._playPauseElement = PlayerFramework.Utilities.createElement(primaryContainer, ["button", { "type": "button", "class": "pf-play-pause-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: playPauseIcon; winControl.label: playPauseLabel; winControl.tooltip: playPauseTooltip; winControl.disabled: isPlayPauseDisabled; winControl.onclick: playPause PlayerFramework.Binding.setEventHandler;" }]);
                this._skipAheadElement = PlayerFramework.Utilities.createElement(primaryContainer, ["button", { "type": "button", "class": "pf-skip-ahead-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipAheadIcon; winControl.label: skipAheadLabel; winControl.tooltip: skipAheadTooltip; winControl.disabled: isSkipAheadDisabled; winControl.onclick: skipAhead PlayerFramework.Binding.setEventHandler;" }]);
                this._fastForwardElement = PlayerFramework.Utilities.createElement(primaryContainer, ["button", { "type": "button", "class": "pf-fast-forward-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: fastForwardIcon; winControl.label: fastForwardLabel; winControl.tooltip: fastForwardTooltip; winControl.disabled: isFastForwardDisabled; winControl.onclick: fastForward PlayerFramework.Binding.setEventHandler;" }]);
                this._skipNextElement = PlayerFramework.Utilities.createElement(primaryContainer, ["button", { "type": "button", "class": "pf-skip-next-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipNextIcon; winControl.label: skipNextLabel; winControl.tooltip: skipNextTooltip; winControl.disabled: isSkipNextDisabled; winControl.onclick: skipNext PlayerFramework.Binding.setEventHandler;" }]);

                var transportBar = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-transportbar pf-functional pf-interactive" }]);

                var timelineContainer = PlayerFramework.Utilities.createElement(transportBar, ["div", { "class": "pf-controlcontainer-timeline pf-interactive" }]);
                this._elapsedTimeElement = PlayerFramework.Utilities.createElement(timelineContainer, ["button", { "type": "button", "class": "pf-elapsed-time-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: elapsedTime PlayerFramework.Binding.timeConverter; winControl.hoverContent: elapsedTimeText; winControl.label: elapsedTimeLabel; winControl.tooltip: elapsedTimeTooltip; winControl.disabled: isElapsedTimeDisabled; winControl.onclick: skipBack PlayerFramework.Binding.setEventHandler;" }]);
                this._timeSeparatorElement = PlayerFramework.Utilities.createElement(timelineContainer, ["div", { "class": "pf-time-separator" }, "/"]);
                this._timelineElement = PlayerFramework.Utilities.createElement(timelineContainer, ["div", { "class": "pf-timeline-control", "data-win-control": "PlayerFramework.UI.Slider", "data-win-bind": "winControl.value: currentTime; winControl.min: startTime; winControl.max: endTime; winControl.progress: bufferedPercentage; winControl.label: timelineLabel; winControl.tooltip: timelineTooltip; winControl.disabled: isTimelineDisabled; winControl.thumbnailImageSrc: thumbnailImageSrc; winControl.isThumbnailVisible: isThumbnailVisible; winControl.markers: visualMarkers; winControl.onstart: onTimelineSliderStart PlayerFramework.Binding.setEventHandler; winControl.onupdate: onTimelineSliderUpdate PlayerFramework.Binding.setEventHandler; winControl.oncomplete: onTimelineSliderComplete PlayerFramework.Binding.setEventHandler; winControl.onskiptomarker: onTimelineSliderSkipToMarker PlayerFramework.Binding.setEventHandler;", "data-win-options": "{ altStep1: 100000000, altStep2: 300000000, altStep3: Infinity }" }]);
                this._remainingTimeElement = PlayerFramework.Utilities.createElement(timelineContainer, ["button", { "type": "button", "class": "pf-remaining-time-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: remainingTime PlayerFramework.Binding.timeConverter; winControl.hoverContent: remainingTimeText; winControl.label: remainingTimeLabel; winControl.tooltip: remainingTimeTooltip; winControl.disabled: isRemainingTimeDisabled; winControl.onclick: skipAhead PlayerFramework.Binding.setEventHandler;" }]);
                this._totalTimeElement = PlayerFramework.Utilities.createElement(timelineContainer, ["button", { "type": "button", "class": "pf-total-time-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: totalTime PlayerFramework.Binding.timeConverter; winControl.hoverContent: totalTimeText; winControl.label: totalTimeLabel; winControl.tooltip: totalTimeTooltip; winControl.disabled: isTotalTimeDisabled; winControl.onclick: skipAhead PlayerFramework.Binding.setEventHandler;" }]);

                var secondaryContainer = PlayerFramework.Utilities.createElement(transportBar, ["div", { "class": "pf-controlcontainer-secondary  pf-interactive" }]);
                this._replayElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-replay-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: replayIcon; winControl.label: replayLabel; winControl.tooltip: replayTooltip; winControl.disabled: isReplayDisabled; winControl.onclick: replay PlayerFramework.Binding.setEventHandler;" }]);
                this._playResumeElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-play-resume-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: playResumeIcon; winControl.label: playResumeLabel; winControl.tooltip: playResumeTooltip; winControl.disabled: isPlayResumeDisabled; winControl.onclick: playResume PlayerFramework.Binding.setEventHandler;" }]);
                this._pauseElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-pause-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: pauseIcon; winControl.label: pauseLabel; winControl.tooltip: pauseTooltip; winControl.disabled: isPauseDisabled; winControl.onclick: pause PlayerFramework.Binding.setEventHandler;" }]);
                this._stopElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-stop-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: stopIcon; winControl.label: stopLabel; winControl.tooltip: stopTooltip; winControl.disabled: isStopDisabled; winControl.onclick: stop PlayerFramework.Binding.setEventHandler;" }]);
                this._slowMotionElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-slow-motion-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: slowMotionIcon; winControl.label: slowMotionLabel; winControl.tooltip: slowMotionTooltip; winControl.disabled: isSlowMotionDisabled; winControl.onclick: slowMotion PlayerFramework.Binding.setEventHandler;" }]);
                this._goLiveElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-go-live-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: goLiveText; winControl.label: goLiveLabel; winControl.tooltip: goLiveTooltip; winControl.disabled: isGoLiveDisabled; winControl.onclick: goLive PlayerFramework.Binding.setEventHandler;" }]);
                this._audioElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-audio-control pf-audioselection-anchor", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: audioIcon; winControl.label: audioLabel; winControl.tooltip: audioTooltip; winControl.disabled: isAudioDisabled; winControl.onclick: audio PlayerFramework.Binding.setEventHandler;" }]);
                this._captionsElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-captions-control pf-captionselection-anchor", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: captionsIcon; winControl.label: captionsLabel; winControl.tooltip: captionsTooltip; winControl.disabled: isCaptionsDisabled; winControl.onclick: captions PlayerFramework.Binding.setEventHandler;" }]);
                this._infoElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-info-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: infoIcon; winControl.label: infoLabel; winControl.tooltip: infoTooltip; winControl.disabled: isInfoDisabled; winControl.onclick: info PlayerFramework.Binding.setEventHandler;" }]);
                this._zoomElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-zoom-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: zoomIcon; winControl.label: zoomLabel; winControl.tooltip: zoomTooltip; winControl.disabled: isZoomDisabled; winControl.onclick: toggleZoom PlayerFramework.Binding.setEventHandler;" }]);
                this._volumeMuteContainerElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["div", { "class": "pf-volume-mute-container" }]);
                this._volumeMuteElement = PlayerFramework.Utilities.createElement(this._volumeMuteContainerElement, ["button", { "type": "button", "class": "pf-volume-mute-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: volumeMuteIcon; winControl.label: volumeMuteLabel; winControl.tooltip: volumeMuteTooltip; winControl.disabled: isVolumeMuteDisabled; winControl.onclick: onVolumeMuteClick PlayerFramework.Binding.setEventHandler; onfocus: onVolumeMuteFocus PlayerFramework.Binding.setEventHandler;" }]);
                this._volumeMuteSliderElement = PlayerFramework.Utilities.createElement(this._volumeMuteContainerElement, ["div", { "class": "pf-volume-slider-control", "style": "display: none;", "data-win-control": "PlayerFramework.UI.Slider", "data-win-bind": "winControl.value: volume; winControl.label: volumeLabel; winControl.tooltip: volumeTooltip; winControl.disabled: isVolumeMuteDisabled; winControl.onupdate: onVolumeMuteSliderUpdate PlayerFramework.Binding.setEventHandler; onfocusin: onVolumeMuteSliderFocusIn PlayerFramework.Binding.setEventHandler; onfocusout: onVolumeMuteSliderFocusOut PlayerFramework.Binding.setEventHandler; onmspointerover: onVolumeMuteSliderMSPointerOver PlayerFramework.Binding.setEventHandler; onmspointerout: onVolumeMuteSliderMSPointerOut PlayerFramework.Binding.setEventHandler; ontransitionend: onVolumeMuteSliderTransitionEnd PlayerFramework.Binding.setTransitionEndEventHandler;", "data-win-options": "{ altStep1: 5, vertical: true, hidden: true }" }]);
                this._muteElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-mute-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: muteIcon; winControl.label: muteLabel; winControl.tooltip: muteTooltip; winControl.disabled: isMuteDisabled; winControl.onclick: toggleMuted PlayerFramework.Binding.setEventHandler;" }]);
                this._volumeElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-volume-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: volumeIcon; winControl.label: volumeLabel; winControl.tooltip: volumeTooltip; winControl.disabled: isVolumeDisabled;", "data-win-options": "{ type: 'flyout' }" }]);
                this._fullScreenElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-full-screen-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: fullScreenIcon; winControl.label: fullScreenLabel; winControl.tooltip: fullScreenTooltip; winControl.disabled: isFullScreenDisabled; winControl.onclick: toggleFullScreen PlayerFramework.Binding.setEventHandler;" }]);
                this._moreElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["button", { "type": "button", "class": "pf-more-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: moreIcon; winControl.label: moreLabel; winControl.tooltip: moreTooltip; winControl.disabled: isMoreDisabled; winControl.onclick: more PlayerFramework.Binding.setEventHandler;" }]);
                this._signalStrengthElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["div", { "class": "pf-signal-strength-control", "data-win-control": "PlayerFramework.UI.Meter", "data-win-bind": "winControl.value: signalStrength; winControl.label: signalStrengthLabel; winControl.tooltip: signalStrengthTooltip; winControl.disabled: isSignalStrengthDisabled;" }]);
                this._mediaQualityElement = PlayerFramework.Utilities.createElement(secondaryContainer, ["div", { "class": "pf-media-quality-control", "data-win-control": "PlayerFramework.UI.Indicator", "data-win-bind": "winControl.value: mediaQuality; winControl.label: mediaQualityLabel; winControl.tooltip: mediaQualityTooltip; winControl.disabled: isMediaQualityDisabled;" }]);
            }
            else {
                WinJS.Utilities.addClass(this._element, "pf-interactive");
                this._replayElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-replay-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: replayIcon; winControl.label: replayLabel; winControl.tooltip: replayTooltip; winControl.disabled: isReplayDisabled; winControl.onclick: replay PlayerFramework.Binding.setEventHandler;" }]);
                this._skipPreviousElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-skip-previous-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipPreviousIcon; winControl.label: skipPreviousLabel; winControl.tooltip: skipPreviousTooltip; winControl.disabled: isSkipPreviousDisabled; winControl.onclick: skipPrevious PlayerFramework.Binding.setEventHandler;" }]);
                this._rewindElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-rewind-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: rewindIcon; winControl.label: rewindLabel; winControl.tooltip: rewindTooltip; winControl.disabled: isRewindDisabled; winControl.onclick: rewind PlayerFramework.Binding.setEventHandler;" }]);
                this._playPauseElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-play-pause-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: playPauseIcon; winControl.label: playPauseLabel; winControl.tooltip: playPauseTooltip; winControl.disabled: isPlayPauseDisabled; winControl.onclick: playPause PlayerFramework.Binding.setEventHandler;" }]);
                this._playResumeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-play-resume-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: playResumeIcon; winControl.label: playResumeLabel; winControl.tooltip: playResumeTooltip; winControl.disabled: isPlayResumeDisabled; winControl.onclick: playResume PlayerFramework.Binding.setEventHandler;" }]);
                this._pauseElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-pause-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: pauseIcon; winControl.label: pauseLabel; winControl.tooltip: pauseTooltip; winControl.disabled: isPauseDisabled; winControl.onclick: pause PlayerFramework.Binding.setEventHandler;" }]);
                this._stopElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-stop-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: stopIcon; winControl.label: stopLabel; winControl.tooltip: stopTooltip; winControl.disabled: isStopDisabled; winControl.onclick: stop PlayerFramework.Binding.setEventHandler;" }]);
                this._fastForwardElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-fast-forward-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: fastForwardIcon; winControl.label: fastForwardLabel; winControl.tooltip: fastForwardTooltip; winControl.disabled: isFastForwardDisabled; winControl.onclick: fastForward PlayerFramework.Binding.setEventHandler;" }]);
                this._slowMotionElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-slow-motion-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: slowMotionIcon; winControl.label: slowMotionLabel; winControl.tooltip: slowMotionTooltip; winControl.disabled: isSlowMotionDisabled; winControl.onclick: slowMotion PlayerFramework.Binding.setEventHandler;" }]);
                this._skipNextElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-skip-next-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipNextIcon; winControl.label: skipNextLabel; winControl.tooltip: skipNextTooltip; winControl.disabled: isSkipNextDisabled; winControl.onclick: skipNext PlayerFramework.Binding.setEventHandler;" }]);
                this._skipBackElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-skip-back-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipBackIcon; winControl.label: skipBackLabel; winControl.tooltip: skipBackTooltip; winControl.disabled: isSkipBackDisabled; winControl.onclick: skipBack PlayerFramework.Binding.setEventHandler;" }]);
                this._skipAheadElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-skip-ahead-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipAheadIcon; winControl.label: skipAheadLabel; winControl.tooltip: skipAheadTooltip; winControl.disabled: isSkipAheadDisabled; winControl.onclick: skipAhead PlayerFramework.Binding.setEventHandler;" }]);
                this._elapsedTimeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-elapsed-time-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: elapsedTime PlayerFramework.Binding.timeConverter; winControl.hoverContent: elapsedTimeText; winControl.label: elapsedTimeLabel; winControl.tooltip: elapsedTimeTooltip; winControl.disabled: isElapsedTimeDisabled; winControl.onclick: skipBack PlayerFramework.Binding.setEventHandler;" }]);
                this._timelineElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-timeline-control", "data-win-control": "PlayerFramework.UI.Slider", "data-win-bind": "winControl.value: currentTime; winControl.min: startTime; winControl.max: endTime; winControl.progress: bufferedPercentage; winControl.label: timelineLabel; winControl.tooltip: timelineTooltip; winControl.disabled: isTimelineDisabled; winControl.thumbnailImageSrc: thumbnailImageSrc; winControl.isThumbnailVisible: isThumbnailVisible; winControl.markers: visualMarkers; winControl.onstart: onTimelineSliderStart PlayerFramework.Binding.setEventHandler; winControl.onupdate: onTimelineSliderUpdate PlayerFramework.Binding.setEventHandler; winControl.oncomplete: onTimelineSliderComplete PlayerFramework.Binding.setEventHandler; winControl.onskiptomarker: onTimelineSliderSkipToMarker PlayerFramework.Binding.setEventHandler;", "data-win-options": "{ altStep1: 100000000, altStep2: 300000000, altStep3: Infinity }" }]);
                this._remainingTimeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-remaining-time-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: remainingTime PlayerFramework.Binding.timeConverter; winControl.hoverContent: remainingTimeText; winControl.label: remainingTimeLabel; winControl.tooltip: remainingTimeTooltip; winControl.disabled: isRemainingTimeDisabled; winControl.onclick: skipAhead PlayerFramework.Binding.setEventHandler;" }]);
                this._totalTimeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-total-time-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: totalTime PlayerFramework.Binding.timeConverter; winControl.hoverContent: totalTimeText; winControl.label: totalTimeLabel; winControl.tooltip: totalTimeTooltip; winControl.disabled: isTotalTimeDisabled; winControl.onclick: skipAhead PlayerFramework.Binding.setEventHandler;" }]);
                this._goLiveElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-go-live-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: goLiveText; winControl.label: goLiveLabel; winControl.tooltip: goLiveTooltip; winControl.disabled: isGoLiveDisabled; winControl.onclick: goLive PlayerFramework.Binding.setEventHandler;" }]);
                this._captionsElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-captions-control pf-captionselection-anchor", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: captionsIcon; winControl.label: captionsLabel; winControl.tooltip: captionsTooltip; winControl.disabled: isCaptionsDisabled; winControl.onclick: captions PlayerFramework.Binding.setEventHandler;" }]);
                this._zoomElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-zoom-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: zoomIcon; winControl.label: zoomLabel; winControl.tooltip: zoomTooltip; winControl.disabled: isZoomDisabled; winControl.onclick: toggleZoom PlayerFramework.Binding.setEventHandler;" }]);
                this._infoElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-info-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: infoIcon; winControl.label: infoLabel; winControl.tooltip: infoTooltip; winControl.disabled: isInfoDisabled; winControl.onclick: info PlayerFramework.Binding.setEventHandler;" }]);
                this._audioElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-audio-control pf-audioselection-anchor", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: audioIcon; winControl.label: audioLabel; winControl.tooltip: audioTooltip; winControl.disabled: isAudioDisabled; winControl.onclick: audio PlayerFramework.Binding.setEventHandler;" }]);
                this._volumeMuteContainerElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-volume-mute-container" }]);
                this._volumeMuteElement = PlayerFramework.Utilities.createElement(this._volumeMuteContainerElement, ["button", { "type": "button", "class": "pf-volume-mute-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: volumeMuteIcon; winControl.label: volumeMuteLabel; winControl.tooltip: volumeMuteTooltip; winControl.disabled: isVolumeMuteDisabled; winControl.onclick: onVolumeMuteClick PlayerFramework.Binding.setEventHandler; onfocus: onVolumeMuteFocus PlayerFramework.Binding.setEventHandler;" }]);
                this._volumeMuteSliderElement = PlayerFramework.Utilities.createElement(this._volumeMuteContainerElement, ["div", { "class": "pf-volume-slider-control", "style": "display: none;", "data-win-control": "PlayerFramework.UI.Slider", "data-win-bind": "winControl.value: volume; winControl.label: volumeLabel; winControl.tooltip: volumeTooltip; winControl.disabled: isVolumeMuteDisabled; winControl.onupdate: onVolumeMuteSliderUpdate PlayerFramework.Binding.setEventHandler; onfocusin: onVolumeMuteSliderFocusIn PlayerFramework.Binding.setEventHandler; onfocusout: onVolumeMuteSliderFocusOut PlayerFramework.Binding.setEventHandler; onmspointerover: onVolumeMuteSliderMSPointerOver PlayerFramework.Binding.setEventHandler; onmspointerout: onVolumeMuteSliderMSPointerOut PlayerFramework.Binding.setEventHandler; ontransitionend: onVolumeMuteSliderTransitionEnd PlayerFramework.Binding.setTransitionEndEventHandler;", "data-win-options": "{ altStep1: 5, vertical: true, hidden: true }" }]);
                this._volumeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-volume-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: volumeIcon; winControl.label: volumeLabel; winControl.tooltip: volumeTooltip; winControl.disabled: isVolumeDisabled;", "data-win-options": "{ type: 'flyout' }" }]);
                this._muteElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-mute-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: muteIcon; winControl.label: muteLabel; winControl.tooltip: muteTooltip; winControl.disabled: isMuteDisabled; winControl.onclick: toggleMuted PlayerFramework.Binding.setEventHandler;" }]);
                this._fullScreenElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-full-screen-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: fullScreenIcon; winControl.label: fullScreenLabel; winControl.tooltip: fullScreenTooltip; winControl.disabled: isFullScreenDisabled; winControl.onclick: toggleFullScreen PlayerFramework.Binding.setEventHandler;" }]);
                this._moreElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-more-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: moreIcon; winControl.label: moreLabel; winControl.tooltip: moreTooltip; winControl.disabled: isMoreDisabled; winControl.onclick: more PlayerFramework.Binding.setEventHandler;" }]);
                this._signalStrengthElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-signal-strength-control", "data-win-control": "PlayerFramework.UI.Meter", "data-win-bind": "winControl.value: signalStrength; winControl.label: signalStrengthLabel; winControl.tooltip: signalStrengthTooltip; winControl.disabled: isSignalStrengthDisabled;" }]);
                this._mediaQualityElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-media-quality-control", "data-win-control": "PlayerFramework.UI.Indicator", "data-win-bind": "winControl.value: mediaQuality; winControl.label: mediaQualityLabel; winControl.tooltip: mediaQualityTooltip; winControl.disabled: isMediaQualityDisabled;" }]);
            }

            WinJS.UI.processAll(this._element);
            
            if (window.PointerEvent) {
                this._bindEvent("pointerdown", this._element, this._onElementMSPointerDown);
            }
            else {
                this._bindEvent("MSPointerDown", this._element, this._onElementMSPointerDown);
            }
        },

        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                hidden: false,
                isPlayPauseHidden: false,
                isPlayResumeHidden: false,
                isPauseHidden: false,
                isReplayHidden: false,
                isRewindHidden: false,
                isFastForwardHidden: false,
                isSlowMotionHidden: false,
                isSkipPreviousHidden: false,
                isSkipNextHidden: false,
                isSkipBackHidden: false,
                isSkipAheadHidden: false,
                isElapsedTimeHidden: false,
                isRemainingTimeHidden: false,
                isTotalTimeHidden: false,
                isTimelineHidden: false,
                isGoLiveHidden: false,
                isCaptionsHidden: false,
                isAudioHidden: false,
                isVolumeMuteHidden: false,
                isVolumeHidden: false,
                isMuteHidden: false,
                isFullScreenHidden: false,
                isStopHidden: false,
                isInfoHidden: false,
                isMoreHidden: false,
                isZoomHidden: false,
                isSignalStrengthHidden: false,
                isMediaQualityHidden: false
            });
        },

        _onElementMSPointerDown: function (e) {
            PlayerFramework.Utilities.addHideFocusClass(e.target);
        }
    });

    // ControlPanel Mixins
    WinJS.Class.mix(ControlPanel, WinJS.UI.DOMEventMixin);
    WinJS.Class.mix(ControlPanel, PlayerFramework.Utilities.eventBindingMixin);

    // ControlPanel Exports
    WinJS.Namespace.define("PlayerFramework.UI", {
        ControlPanel: ControlPanel
    });

})(PlayerFramework);(function (PlayerFramework, undefined) {
    "use strict";

    // Indicator Errors
    var invalidConstruction = "Invalid construction: Indicator constructor must be called using the \"new\" operator.",
        invalidElement = "Invalid argument: Indicator expects an element as the first argument.";

    // Indicator Class
    var Indicator = WinJS.Class.define(function (element, options) {
        if (!(this instanceof PlayerFramework.UI.Indicator)) {
            throw invalidConstruction;
        }

        if (!element) {
            throw invalidElement;
        }

        this._element = null;
        this._textElement = null;

        this._setElement(element);
        this._setOptions(options);
    }, {
        // Public Properties
        element: {
            get: function () {
                return this._element;
            }
        },

        value: {
            get: function () {
                return this._textElement.textContent;
            },
            set: function (value) {
                this._textElement.textContent = value;
                this._element.setAttribute("aria-valuenow", value);
            }
        },

        label: {
            get: function () {
                return this._element.getAttribute("aria-label");
            },
            set: function (value) {
                this._element.setAttribute("aria-label", value);
            }
        },

        tooltip: {
            get: function () {
                return this._element.title;
            },
            set: function (value) {
                this._element.title = value;
            }
        },

        disabled: {
            get: function () {
                return this._element.disabled;
            },
            set: function (value) {
                this._element.disabled = value;
                this._element.setAttribute("aria-disabled", value);
            }
        },

        hidden: {
            get: function () {
                return WinJS.Utilities.hasClass(this._element, "pf-hidden");
            },
            set: function (value) {
                if (value) {
                    WinJS.Utilities.addClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", true);
                } else {
                    WinJS.Utilities.removeClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", false);
                }
            }
        },

        // Private Methods
        _setElement: function (element) {
            this._element = element;
            this._element.winControl = this;
            this._element.setAttribute("role", "status");
            WinJS.Utilities.addClass(this._element, "pf-indicator pf-control");

            this._textElement = PlayerFramework.Utilities.createElement(this._element, ["span", { "class": "pf-indicator-text" }]);
        },

        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                value: "",
                label: "",
                tooltip: "",
                disabled: false,
                hidden: false
            });
        }
    });

    // Indicator Mixins
    WinJS.Class.mix(Indicator, WinJS.UI.DOMEventMixin);

    // Indicator Exports
    WinJS.Namespace.define("PlayerFramework.UI", {
        Indicator: Indicator
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // Meter Errors
    var invalidConstruction = "Invalid construction: Meter constructor must be called using the \"new\" operator.",
        invalidElement = "Invalid argument: Meter expects an element as the first argument.";

    // Meter Class
    var Meter = WinJS.Class.define(function (element, options) {
        if (!(this instanceof PlayerFramework.UI.Meter)) {
            throw invalidConstruction;
        }

        if (!element) {
            throw invalidElement;
        }

        this._element = null;

        this._setElement(element);
        this._setOptions(options);
    }, {
        // Public Properties
        element: {
            get: function () {
                return this._element;
            }
        },

        value: {
            get: function () {
                return parseFloat(this._element.getAttribute("aria-valuenow"));
            },
            set: function (value) {
                this._element.setAttribute("aria-valuenow", value);

                if (value < 0.25) {
                    this._element.setAttribute("aria-valuetext", "none");
                } else if (value < 0.5) {
                    this._element.setAttribute("aria-valuetext", "low");
                } else if (value < 0.75) {
                    this._element.setAttribute("aria-valuetext", "medium");
                } else {
                    this._element.setAttribute("aria-valuetext", "high");
                }
            }
        },

        label: {
            get: function () {
                return this._element.getAttribute("aria-label");
            },
            set: function (value) {
                this._element.setAttribute("aria-label", value);
            }
        },

        tooltip: {
            get: function () {
                return this._element.title;
            },
            set: function (value) {
                this._element.title = value;
            }
        },

        disabled: {
            get: function () {
                return this._element.disabled;
            },
            set: function (value) {
                this._element.disabled = value;
                this._element.setAttribute("aria-disabled", value);
            }
        },

        hidden: {
            get: function () {
                return WinJS.Utilities.hasClass(this._element, "pf-hidden");
            },
            set: function (value) {
                if (value) {
                    WinJS.Utilities.addClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", true);
                } else {
                    WinJS.Utilities.removeClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", false);
                }
            }
        },

        // Private Methods
        _setElement: function (element) {
            this._element = element;
            this._element.winControl = this;
            this._element.setAttribute("role", "status");
            WinJS.Utilities.addClass(this._element, "pf-meter pf-control");

            PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-meter-bar" }]);
            PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-meter-bar" }]);
            PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-meter-bar" }]);
        },

        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                value: 0,
                label: "",
                tooltip: "",
                disabled: false,
                hidden: false
            });
        }
    });

    // Meter Mixins
    WinJS.Class.mix(Meter, WinJS.UI.DOMEventMixin);

    // Meter Exports
    WinJS.Namespace.define("PlayerFramework.UI", {
        Meter: Meter
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // Slider Errors
    var invalidConstruction = "Invalid construction: Slider constructor must be called using the \"new\" operator.",
        invalidElement = "Invalid argument: Slider expects an element as the first argument.";

    // Slider Events
    var events = [
        "start",
        "update",
        "complete",
        "skiptomarker"
    ];

    // Slider Class
    var Slider = WinJS.Class.define(function (element, options) {
        if (!(this instanceof PlayerFramework.UI.Slider)) {
            throw invalidConstruction;
        }

        if (!element) {
            throw invalidElement;
        }

        this._element = null;
        this._containerElement = null;
        this._progressElement = null;
        this._markerContainerElement = null;
        this._inputElement = null;
        this._altStep1 = 0;
        this._altStep2 = 0;
        this._altStep3 = 0;
        this._hasCapture = false;
        this._markers = [];
        this._thumbnailContainerElement = null;
        this._thumbnailViewElement = null;
        this._thumbnail1Element = null;
        this._thumbnail2Element = null;
        this._thumbnailImageSrc = null;
        this._isThumbnailVisible = false;
        this._thumbnailElementIndex = 0;

        this._setElement(element);
        this._setOptions(options);
    }, {
        // Public Properties
        element: {
            get: function () {
                return this._element;
            }
        },

        min: {
            get: function () {
                return this._inputElement.min;
            },
            set: function (value) {
                this._inputElement.min = value;
                this._element.setAttribute("aria-valuemin", value);
                this._updateMarkers();
                if (this._isThumbnailVisible) this._updateThumbnailPosition();
            }
        },

        max: {
            get: function () {
                return this._inputElement.max;
            },
            set: function (value) {
                this._inputElement.max = value;
                this._element.setAttribute("aria-valuemax", value);
                this._updateMarkers();
                if (this._isThumbnailVisible) this._updateThumbnailPosition();
            }
        },

        value: {
            get: function () {
                return this._inputElement.valueAsNumber;
            },
            set: function (value) {
                var clampedValue = PlayerFramework.Utilities.clamp(value, this.min, this.max);
                this._inputElement.value = clampedValue;
                this._element.setAttribute("aria-valuenow", clampedValue);
                if (this._isThumbnailVisible) this._updateThumbnailPosition();
            }
        },

        progress: {
            get: function () {
                return this._progressElement.value;
            },
            set: function (value) {
                this._progressElement.value = value;
            }
        },

        step: {
            get: function () {
                return this._inputElement.step;
            },
            set: function (value) {
                this._inputElement.step = value;
            }
        },

        altStep1: {
            get: function () {
                return this._altStep1;
            },
            set: function (value) {
                this._altStep1 = value;
            }
        },

        altStep2: {
            get: function () {
                return this._altStep2;
            },
            set: function (value) {
                this._altStep2 = value;
            }
        },

        altStep3: {
            get: function () {
                return this._altStep3;
            },
            set: function (value) {
                this._altStep3 = value;
            }
        },

        label: {
            get: function () {
                return this._element.getAttribute("aria-label");
            },
            set: function (value) {
                this._element.setAttribute("aria-label", value);
            }
        },

        tooltip: {
            get: function () {
                return this._element.title;
            },
            set: function (value) {
                this._element.title = value;
            }
        },

        vertical: {
            get: function () {
                return WinJS.Utilities.hasClass(this._element, "pf-vertical");
            },
            set: function (value) {
                if (value) {
                    WinJS.Utilities.addClass(this._element, "pf-vertical");
                } else {
                    WinJS.Utilities.removeClass(this._element, "pf-vertical");
                }
            }
        },

        disabled: {
            get: function () {
                return this._inputElement.disabled;
            },
            set: function (value) {
                this._inputElement.disabled = value;
                this._element.setAttribute("aria-disabled", value);

                if (this._inputElement.disabled) {
                    this._inputElement.releaseCapture();
                    this._onInputElementMSLostPointerCapture();
                }
            }
        },

        hidden: {
            get: function () {
                return WinJS.Utilities.hasClass(this._element, "pf-hidden");
            },
            set: function (value) {
                if (value) {
                    WinJS.Utilities.addClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", true);
                } else {
                    WinJS.Utilities.removeClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", false);
                }
            }
        },

        markers: {
            get: function () {
                return this._markers;
            },
            set: function (value) {
                this._markers = value;
                this._updateMarkers();
            }
        },

        thumbnailImageSrc: {
            get: function () {
                return this._thumbnailImageSrc;
            },
            set: function (value) {
                this._thumbnailImageSrc = value;
                if (value) {
                    if (this._thumbnailElementIndex === 0)
                        this._thumbnail1Element.src = value;
                    else
                        this._thumbnail2Element.src = value;
                }
                else {
                    this._thumbnail1Element.src = "";
                    this._thumbnail2Element.src = "";
                }
            }
        },

        isThumbnailVisible: {
            get: function () {
                return this._isThumbnailVisible;
            },
            set: function (value) {
                this._isThumbnailVisible = value;
                this._thumbnailContainerElement.style.display = value ? "" : "none";
                if (value) this._updateThumbnailPosition();
            }
        },

        // Private Methods
        _setElement: function (element) {
            this._element = element;
            this._element.winControl = this;
            this._element.setAttribute("role", "slider");
            WinJS.Utilities.addClass(this._element, "pf-slider pf-control pf-functional");

            this._containerElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-slider-container" }]);
            this._progressElement = PlayerFramework.Utilities.createElement(this._containerElement, ["progress"]);
            this._inputElement = PlayerFramework.Utilities.createElement(this._containerElement, ["input", { "type": "range" }]);
            this._markerContainerElement = PlayerFramework.Utilities.createElement(this._containerElement, ["div", { "class": "pf-slider-marker-container" }]);

            this._thumbnailContainerElement = PlayerFramework.Utilities.createElement(this._containerElement, ["div", { "class": "pf-slider-thumbnail-container", "style": "display: none;" }]);
            this._thumbnailViewElement = PlayerFramework.Utilities.createElement(this._thumbnailContainerElement, ["div", { "class": "pf-slider-thumbnailView" }]);
            // use 2 img tags to hold the thumbnail. This allows us to ensure the last image continues to show while the new one is downloading
            this._thumbnail1Element = PlayerFramework.Utilities.createElement(this._thumbnailViewElement, ["img", { "class": "pf-slider-thumbnailImage" }]);
            this._thumbnail2Element = PlayerFramework.Utilities.createElement(this._thumbnailViewElement, ["img", { "class": "pf-slider-thumbnailImage", "style": "display: none;" }]);
            this._bindEvent("load", this._thumbnail1Element, this._onThumbnailElementLoad);
            this._bindEvent("load", this._thumbnail2Element, this._onThumbnailElementLoad);

            this._bindEvent("MSGotPointerCapture", this._inputElement, this._onInputElementMSGotPointerCapture);
            this._bindEvent("MSLostPointerCapture", this._inputElement, this._onInputElementMSLostPointerCapture);
            this._bindEvent("change", this._inputElement, this._onInputElementChange);
            this._bindEvent("keydown", this._inputElement, this._onInputElementKeydown);
        },

        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                min: 0,
                max: 100,
                value: 0,
                progress: 0,
                step: "any",
                altStep1: 0,
                altStep2: 0,
                altStep3: 0,
                label: "",
                tooltip: "",
                vertical: false,
                disabled: false,
                hidden: false
            });
        },

        _onThumbnailElementLoad: function (e) {
            var newThumbnailElement;
            var oldThumbnailElement;
            if (this._thumbnailElementIndex === 0) {
                newThumbnailElement = this._thumbnail1Element;
                oldThumbnailElement = this._thumbnail2Element;
                this._thumbnailElementIndex = 1;
            }
            else {
                newThumbnailElement = this._thumbnail2Element;
                oldThumbnailElement = this._thumbnail1Element;
                this._thumbnailElementIndex = 0;
            }

            newThumbnailElement.style.display = "";
            oldThumbnailElement.style.display = "none";
        },

        _onInputElementMSGotPointerCapture: function (e) {
            if (!this._hasCapture) {
                this._hasCapture = true;
                this.dispatchEvent("start");
                this.dispatchEvent("update");
            }
        },

        _onInputElementMSLostPointerCapture: function (e) {
            if (this._hasCapture) {
                this._hasCapture = false;
                this.dispatchEvent("complete");
            }
        },

        _onInputElementChange: function (e) {
            if (this._hasCapture) {
                this.dispatchEvent("update");

                if (this._isThumbnailVisible) this._updateThumbnailPosition();
            }
        },

        _onInputElementKeydown: function (e) {
            if (e.keyCode >= 37 && e.keyCode <= 40) {
                e.preventDefault();

                // handle arrow keys
                if (this.vertical) {
                    if (e.key === "Up") {
                        this._increaseValue(e);
                    } else if (e.key === "Down") {
                        this._decreaseValue(e);
                    }
                } else if (window.getComputedStyle(this._inputElement).direction === "rtl") {
                    if (e.key === "Left") {
                        this._increaseValue(e);
                    } else if (e.key === "Right") {
                        this._decreaseValue(e);
                    }
                } else {
                    if (e.key === "Left") {
                        this._decreaseValue(e);
                    } else if (e.key === "Right") {
                        this._increaseValue(e);
                    }
                }
            }
        },

        _increaseValue: function (e) {
            if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                this._changeValue(this.value + this.altStep1);
            } else if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                this._changeValue(this.value + this.altStep2);
            } else if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
                this._changeValue(this.value + this.altStep3);
            }
        },

        _decreaseValue: function (e) {
            if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                this._changeValue(this.value - this.altStep1);
            } else if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                this._changeValue(this.value - this.altStep2);
            } else if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
                this._changeValue(this.value - this.altStep3);
            }
        },

        _changeValue: function (value) {
            var oldValue = this.value;
            this.value = value;

            if (oldValue !== this.value) {
                this.dispatchEvent("start");
                this.dispatchEvent("update");
                this.dispatchEvent("complete");
            }
        },

        _updateMarkers: function () {
            // remove existing markers
            var markerElements = this._markerContainerElement.querySelectorAll(".pf-slider-marker");
            for (var i = 0; i < markerElements.length; i++) {
                var markerElement = markerElements[i];
                if (markerElement.classList.contains("pf-slider-seekablemarker")) {
                    this._unbindEvent("click", markerElement, this._onMarkerClick);
                }
                this._markerContainerElement.removeChild(markerElement);
            }

            // add and position markers
            var seekRange = this.max - this.min;
            if (seekRange > 0) {
                for (var i = 0; i < this._markers.length; i++) {
                    var marker = this._markers[i];
                    var markerElement;

                    if (marker.isSeekable) {
                        markerElement = PlayerFramework.Utilities.createElement(this._markerContainerElement, ["div", { "class": "pf-slider-marker pf-slider-seekablemarker", "title": marker.text }]);
                        this._bindEvent("click", markerElement, this._onMarkerClick);
                    }
                    else {
                        markerElement = PlayerFramework.Utilities.createElement(this._markerContainerElement, ["div", { "class": "pf-slider-marker", "title": marker.text }]);
                    }
                    markerElement.setAttribute("data-marker", marker.time);
                    if (marker.extraClass) WinJS.Utilities.addClass(markerElement, marker.extraClass);
                    var positionPercentage = PlayerFramework.Utilities.convertSecondsToTicks(marker.time) / seekRange;
                    markerElement.style.marginLeft = (positionPercentage * 100) + "%";
                    this._markerContainerElement.appendChild(markerElement);
                }
            }
        },
        
        _onMarkerClick: function (e) {
            var markerTime = e.srcElement.getAttribute("data-marker");
            var marker = null;
            for (var i = 0; i < this._markers.length; i++) {
                var candidate = this._markers[i];
                if (candidate.time.toString() === markerTime) {
                    marker = candidate;
                    break;
                }
            }
            
            if (marker) this.dispatchEvent("skiptomarker", marker);
        },

        _updateThumbnailPosition: function ()
        {
            var percentageComplete = this._inputElement.value / (this.max - this.min);
            this._thumbnailViewElement.style.marginLeft = (percentageComplete * 100) + "%";
        }
    });

    // Slider Mixins
    WinJS.Class.mix(Slider, WinJS.UI.DOMEventMixin);
    WinJS.Class.mix(Slider, PlayerFramework.Utilities.createEventProperties(events));
    WinJS.Class.mix(Slider, PlayerFramework.Utilities.eventBindingMixin);

    // Slider Exports
    WinJS.Namespace.define("PlayerFramework.UI", {
        Slider: Slider
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // PluginBase Errors
    var invalidConstruction = "Invalid construction: PluginBase constructor must be called using the \"new\" operator.",
        invalidState = "Invalid state: The state of the plugin is invalid for the requested operation.";

    // PluginBase Class
    var PluginBase = WinJS.Class.define(function (options) {
        if (!(this instanceof PlayerFramework.PluginBase)) {
            throw invalidConstruction;
        }

        this._isEnabled = false;
        this._isLoaded = false;
        this._isActive = false;
        this._mediaPlayer = null;
        this._currentMediaSource = null;
        this._activePromises = [];
        this._observablePlugin = WinJS.Binding.as(this);

        this._setOptions(options);
    }, {
        // Public Properties
        isEnabled: {
            get: function () {
                return this._isEnabled;
            },
            set: function (value) {
                var oldValue = this._isEnabled;
                if (oldValue !== value) {
                    this._isEnabled = value;
                    this._observablePlugin.notify("isEnabled", value, oldValue);

                    if (this.isLoaded) {
                        if (value) {
                            this._activate();
                        } else {
                            this._deactivate();
                        }
                    }
                }
            }
        },

        isLoaded: {
            get: function () {
                return this._isLoaded;
            }
        },

        isActive: {
            get: function () {
                return this._isActive;
            }
        },

        mediaPlayer: {
            get: function () {
                return this._mediaPlayer;
            },
            set: function (value) {
                this._mediaPlayer = value;
            }
        },

        currentMediaSource: {
            get: function () {
                return this._currentMediaSource;
            }
        },

        // Public Methods
        load: function () {
            if (this.isLoaded || !this.mediaPlayer) {
                throw invalidState;
            }

            this._onLoad();
            this._currentMediaSource = this.mediaPlayer;
            this._isLoaded = true;

            if (this.isEnabled) {
                this._activate();
            }
        },

        unload: function () {
            if (!this.isLoaded) {
                throw invalidState;
            }

            this._deactivate();
            this._currentMediaSource = null;
            this._onUnload();
            this._isLoaded = false;
        },

        update: function (mediaSource) {
            if (this.isLoaded) {
                this._cancelActivePromises();
                this._currentMediaSource = mediaSource;
                this._onUpdate();
            }
        },

        // Private Methods
        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                isEnabled: true
            });
        },

        _cancelActivePromises: function () {
            for (var i = 0; i < this._activePromises.length; i++) {
                var promise = this._activePromises[i];
                promise.cancel();
            }

            this._activePromises = [];
        },

        _activate: function () {
            if (!this.isActive) {
                this._isActive = this._onActivate();
            }
        },

        _deactivate: function () {
            if (this.isActive) {
                this._cancelActivePromises();
                this._onDeactivate();
                this._isActive = false;
            }
        },

        _onLoad: function () {
        },

        _onUnload: function () {
        },

        _onActivate: function () {
            return true;
        },

        _onDeactivate: function () {
        },

        _onUpdate: function () {
        }
    });

    // PluginBase Mixins
    WinJS.Class.mix(PluginBase, WinJS.Utilities.eventMixin);
    WinJS.Class.mix(PluginBase, PlayerFramework.Utilities.eventBindingMixin);
    WinJS.Class.mix(PluginBase, PlayerFramework.Utilities.propertyBindingMixin);
    
    // PluginBase Exports
    WinJS.Namespace.define("PlayerFramework", {
        PluginBase: PluginBase
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // TrackingPluginBase Errors
    var invalidConstruction = "Invalid construction: TrackingPluginBase is an abstract class.";

    // TrackingPluginBase Events
    var events = [
        "eventtracked"
    ];

    // TrackingPluginBase Class
    var TrackingPluginBase = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        this._trackingEvents = [];

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Properties
        trackingEvents: {
            get: function () {
                return this._trackingEvents;
            },
            set: function (value) {
                var oldValue = this._trackingEvents;
                if (oldValue !== value) {
                    this._uninitializeTrackingEvents();

                    this._trackingEvents = value;
                    this._observablePlugin.notify("trackingEvents", value, oldValue);

                    this._initializeTrackingEvents();
                }
            }
        },

        // Private Methods
        _initializeTrackingEvents: function () {
            if (this.trackingEvents) {
                for (var i = 0; i < this.trackingEvents.length; i++) {
                    var trackingEvent = this.trackingEvents[i];
                    this._initializeTrackingEvent(trackingEvent);
                }
            }
        },

        _uninitializeTrackingEvents: function () {
            if (this.trackingEvents) {
                for (var i = 0; i < this.trackingEvents.length; i++) {
                    var trackingEvent = this.trackingEvents[i];
                    this._uninitializeTrackingEvent(trackingEvent);
                }
            }
        },

        _initializeTrackingEvent: function (trackingEvent) {
        },

        _uninitializeTrackingEvent: function (trackingEvent) {
        },

        _onActivate: function () {
            this._initializeTrackingEvents();

            return true;
        },

        _onDeactivate: function () {
            this._uninitializeTrackingEvents();
        }
    })

    // TrackingPluginBase Mixins
    WinJS.Class.mix(TrackingPluginBase, PlayerFramework.Utilities.createEventProperties(events));

    // TrackingPluginBase Exports
    WinJS.Namespace.define("PlayerFramework", {
        TrackingPluginBase: TrackingPluginBase
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // BufferingPlugin Errors
    var invalidConstruction = "Invalid construction: BufferingPlugin constructor must be called using the \"new\" operator.";

    // BufferingPlugin Class
    var BufferingPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.BufferingPlugin)) {
            throw invalidConstruction;
        }

        this._bufferingContainerElement = null;
        this._bufferingControlElement = null;
        this._isLoadingAd = false;
        this._isLoadingMediaPlayer = false;

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Methods
        show: function () {
            this.mediaPlayer.addClass("pf-show-buffering-container");
        },

        hide: function () {
            this.mediaPlayer.removeClass("pf-show-buffering-container");
        },

        // Private Methods
        _setElement: function () {
            this._bufferingContainerElement = PlayerFramework.Utilities.createElement(this.mediaPlayer.element, ["div", { "class": "pf-buffering-container" }]);
            this._bufferingControlElement = PlayerFramework.Utilities.createElement(this._bufferingContainerElement, ["progress", { "class": "pf-buffering-control" }]);
        },

        _onActivate: function () {
            this._setElement();

            this._bindEvent("advertisingstatechange", this.mediaPlayer, this._onMediaPlayerAdvertisingStateChange);
            this._bindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._bindEvent("canplaythrough", this.mediaPlayer, this._onMediaPlayerCanPlayThrough);

            if (this.mediaPlayer.advertisingState === PlayerFramework.AdvertisingState.loading || this.mediaPlayer.playerState === PlayerFramework.PlayerState.loading || this.mediaPlayer.playerState === PlayerFramework.PlayerState.loaded) {
                this.show();
            }

            return true;
        },

        _onDeactivate: function () {
            this.hide();

            this._unbindEvent("advertisingstatechange", this.mediaPlayer, this._onMediaPlayerAdvertisingStateChange);
            this._unbindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._unbindEvent("canplaythrough", this.mediaPlayer, this._onMediaPlayerCanPlayThrough);

            PlayerFramework.Utilities.removeElement(this._bufferingContainerElement);

            this._bufferingContainerElement = null;
            this._bufferingControlElement = null;
            this._isLoadingAd = false;
            this._isLoadingMediaPlayer = false;
        },

        _onMediaPlayerAdvertisingStateChange: function (e) {
            switch (this.mediaPlayer.advertisingState) {
                case PlayerFramework.AdvertisingState.loading:
                    this._isLoadingAd = true;
                    break;

                default:
                    this._isLoadingAd = false;
                    break;
            }

            this._updateVisibility();
        },

        _onMediaPlayerPlayerStateChange: function (e) {
            switch (this.mediaPlayer.playerState) {
                case PlayerFramework.PlayerState.loading:
                case PlayerFramework.PlayerState.loaded:
                    this._isLoadingMediaPlayer = true;
                    break;

                case PlayerFramework.PlayerState.unloaded:
                case PlayerFramework.PlayerState.pending:
                case PlayerFramework.PlayerState.ending:
                case PlayerFramework.PlayerState.ended:
                case PlayerFramework.PlayerState.failed:
                    this._isLoadingMediaPlayer = false;
                    break;
            }

            this._updateVisibility();
        },

        _onMediaPlayerCanPlayThrough: function (e) {
            this._isLoadingMediaPlayer = false;
            this._updateVisibility();
        },

        _updateVisibility: function () {
            if (this._isLoadingAd || this._isLoadingMediaPlayer) {
                this.show();
            } else {
                this.hide();
            }
        }
    });

    // BufferingPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        bufferingPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // BufferingPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        BufferingPlugin: BufferingPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // ControlPlugin Errors
    var invalidConstruction = "Invalid construction: ControlPlugin constructor must be called using the \"new\" operator.";

    // ControlPlugin Class
    var ControlPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.ControlPlugin)) {
            throw invalidConstruction;
        }

        this._controlContainerElement = null;
        this._controlPanelElement = null;
        this._flyoutContainerElement = null;
        this._compactThresholdInInches = 5.0;
        this._orientation = "landscape";
        this._isCompact = false;

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Methods
        show: function () {
            this.mediaPlayer.addClass("pf-show-control-container");
        },

        hide: function () {
            this.mediaPlayer.removeClass("pf-show-control-container");
        },

        compactThresholdInInches: {
            get: function () {
                return this._compactThresholdInInches;
            },
            set: function (value) {
                this._compactThresholdInInches = value;
            }
        },

        isCompact: {
            get: function () {
                return this._isCompact;
            },
            set: function (value) {
                if (value !== this._isCompact) {
                    if (this._isCompact) {
                        WinJS.Utilities.removeClass(this._controlPanelElement, "pf-compact");
                    }
                    this._isCompact = value;
                    if (this._isCompact) {
                        WinJS.Utilities.addClass(this._controlPanelElement, "pf-compact");
                    }
                }
            }
        },

        orientation: {
            get: function () {
                return this._orientation;
            },
            set: function (value) {
                if (value !== this._orientation) {
                    if (this._orientation === "portrait") {
                        WinJS.Utilities.removeClass(this._controlPanelElement, "pf-portrait");
                    }
                    this._orientation = value;
                    if (this._orientation === "portrait") {
                        WinJS.Utilities.addClass(this._controlPanelElement, "pf-portrait");
                    }
                }
            }
        },

        // Private Methods
        _setElement: function () {
            this._controlContainerElement = PlayerFramework.Utilities.createElement(this.mediaPlayer.element, ["div", { "class": "pf-control-container" }]);
            this._controlPanelElement = PlayerFramework.Utilities.createElement(this._controlContainerElement, ["div", { "data-win-control": "PlayerFramework.UI.ControlPanel", "data-win-bind": "winControl.isPlayPauseHidden: isPlayPauseHidden; winControl.isPlayResumeHidden: isPlayResumeHidden; winControl.isPauseHidden: isPauseHidden; winControl.isReplayHidden: isReplayHidden; winControl.isRewindHidden: isRewindHidden; winControl.isFastForwardHidden: isFastForwardHidden; winControl.isSlowMotionHidden: isSlowMotionHidden; winControl.isSkipPreviousHidden: isSkipPreviousHidden; winControl.isSkipNextHidden: isSkipNextHidden; winControl.isSkipBackHidden: isSkipBackHidden; winControl.isSkipAheadHidden: isSkipAheadHidden;  winControl.isElapsedTimeHidden: isElapsedTimeHidden; winControl.isRemainingTimeHidden: isRemainingTimeHidden; winControl.isTotalTimeHidden: isTotalTimeHidden; winControl.isTimelineHidden: isTimelineHidden; winControl.isGoLiveHidden: isGoLiveHidden; winControl.isCaptionsHidden: isCaptionsHidden; winControl.isAudioHidden: isAudioHidden; winControl.isVolumeMuteHidden: isVolumeMuteHidden; winControl.isVolumeHidden: isVolumeHidden; winControl.isMuteHidden: isMuteHidden; winControl.isFullScreenHidden: isFullScreenHidden; winControl.isStopHidden: isStopHidden; winControl.isInfoHidden: isInfoHidden; winControl.isMoreHidden: isMoreHidden; winControl.isZoomHidden: isZoomHidden; winControl.isSignalStrengthHidden: isSignalStrengthHidden; winControl.isMediaQualityHidden: isMediaQualityHidden;" }]);

            this._controlContainerElement.winControl = this;

            WinJS.UI.processAll(this._controlContainerElement);
            PlayerFramework.Binding.processAll(this._controlContainerElement, this.mediaPlayer.interactiveViewModel);

            if (!WinJS.Utilities.isPhone) {
                this._flyoutContainerElement = PlayerFramework.Utilities.createElement(document.body, ["div", { "class": "pf-flyout-container" }]);
                this._controlPanelElement.winControl.flyoutContainerElement = this._flyoutContainerElement;
                PlayerFramework.Binding.processAll(this._flyoutContainerElement, this.mediaPlayer.interactiveViewModel);
            }
        },

        _onActivate: function () {
            this._setElement();

            this._bindEvent("interactiveviewmodelchange", this.mediaPlayer, this._onMediaPlayerInteractiveViewModelChange);
            this._bindEvent("interactivestatechange", this.mediaPlayer, this._onMediaPlayerInteractiveStateChange);
            this._bindEvent("transitionend", this._controlPanelElement, this._onControlPanelTransitionEnd);
            if (PlayerFramework.Utilities.isWinJS1) {
                this._bindEvent("resize", this.mediaPlayer.element, this._onMediaPlayerResize);
            }
            else { // IE11 no longer supports resize event for arbitrary elements. The best we can do is listen to the window resize event.
                this._bindEvent("resize", window, this._onMediaPlayerResize);
            }
            this._onMediaPlayerResize();

            if (this.mediaPlayer.isInteractive) {
                this.show();
                this._controlPanelElement.winControl.hidden = false;
            } else {
                this._controlPanelElement.winControl.hidden = true;
            }

            return true;
        },

        _onDeactivate: function () {
            this.hide();

            this._unbindEvent("interactiveviewmodelchange", this.mediaPlayer, this._onMediaPlayerInteractiveViewModelChange);
            this._unbindEvent("interactivestatechange", this.mediaPlayer, this._onMediaPlayerInteractiveStateChange);
            this._unbindEvent("transitionend", this._controlPanelElement, this._onControlPanelTransitionEnd);
            if (PlayerFramework.Utilities.isWinJS1) {
                this._unbindEvent("resize", this.mediaPlayer.element, this._onMediaPlayerResize);
            }
            else {
                this._unbindEvent("resize", window, this._onMediaPlayerResize);
            }

            PlayerFramework.Utilities.removeElement(this._controlContainerElement);
            if (this._flyoutContainerElement) {
                PlayerFramework.Utilities.removeElement(this._flyoutContainerElement);
            }

            this._controlContainerElement = null;
            this._controlPanelElement = null;
            this._flyoutContainerElement = null;
        },

        _onMediaPlayerInteractiveViewModelChange: function (e) {
            PlayerFramework.Binding.processAll(this._controlContainerElement, this.mediaPlayer.interactiveViewModel);
        },

        _onMediaPlayerInteractiveStateChange: function (e) {
            if (this.mediaPlayer.isInteractive) {
                this.show();
                this._controlPanelElement.winControl.hidden = false;
            } else {
                this._controlPanelElement.winControl.hidden = true;
            }
        },

        _onControlPanelTransitionEnd: function (e) {
            if (e.target === this._controlPanelElement && this._controlPanelElement.winControl.hidden) {
                this.hide();
            }
        },

        _onMediaPlayerResize: function () {
            var w = this.mediaPlayer.element.scrollWidth;
            var h = this.mediaPlayer.element.scrollHeight;

            this.orientation = (h > w) ? "portrait" : "landscape";
            if (PlayerFramework.Utilities.isWinJS1) {
                this.isCompact = Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.snapped;
            }
            else {
                var physicalSize = this._getPhysicalSize({ width: w, height: h });
                this.isCompact = (physicalSize.width <= this.compactThresholdInInches);
            }
        },

        _getPhysicalSize: function (size) {
            var displayInfo = Windows.Graphics.Display.DisplayInformation.getForCurrentView();
            var scale = displayInfo.resolutionScale / 100;
            var w = size.width * scale / displayInfo.rawDpiX;
            var h = size.height * scale / displayInfo.rawDpiY;
            return { width: w, height: h };
        }

    }, {
        // Static Properties
        isDeclarativeControlContainer: {
            get: function () {
                return true;
            }
        }
    });

    // ControlPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        controlPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // ControlPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        ControlPlugin: ControlPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // ErrorPlugin Errors
    var invalidConstruction = "Invalid construction: ErrorPlugin constructor must be called using the \"new\" operator.";

    // ErrorPlugin Class
    var ErrorPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.ErrorPlugin)) {
            throw invalidConstruction;
        }

        this._errorContainerElement = null;
        this._errorTextElement = null;
        this._errorControlElement = null;
        this._errorLabelElement = null;

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Methods
        show: function () {
            this.mediaPlayer.addClass("pf-show-error-container");
        },

        hide: function () {
            this.mediaPlayer.removeClass("pf-show-error-container");
        },

        // Private Methods
        _setElement: function () {
            this._errorContainerElement = PlayerFramework.Utilities.createElement(this.mediaPlayer.element, ["div", { "class": "pf-error-container" }]);
            this._errorTextElement = PlayerFramework.Utilities.createElement(this._errorContainerElement, ["div", { "class": "pf-error-text" }, PlayerFramework.Utilities.getResourceString("ErrorText")]);
            this._errorControlElement = PlayerFramework.Utilities.createElement(this._errorContainerElement, ["button", { "type": "button", "class": "pf-error-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-options": JSON.stringify({ "content": PlayerFramework.Utilities.getResourceString("ErrorIcon"), "label": PlayerFramework.Utilities.getResourceString("ErrorLabel"), "tooltip": PlayerFramework.Utilities.getResourceString("ErrorTooltip") }) }]);
            this._errorLabelElement = PlayerFramework.Utilities.createElement(this._errorContainerElement, ["div", { "class": "pf-error-label" }, PlayerFramework.Utilities.getResourceString("ErrorLabel")]);

            WinJS.UI.processAll(this._errorContainerElement);
        },

        _onActivate: function () {
            this._setElement();

            this._bindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._bindEvent("click", this._errorControlElement.winControl, this._onErrorControlClick);

            if (this.mediaPlayer.playerState === PlayerFramework.PlayerState.failed) {
                this.show();
            }

            return true;
        },

        _onDeactivate: function () {
            this.hide();

            this._unbindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._unbindEvent("click", this._errorControlElement.winControl, this._onErrorControlClick);

            PlayerFramework.Utilities.removeElement(this._errorContainerElement);

            this._errorContainerElement = null;
            this._errorTextElement = null;
            this._errorControlElement = null;
            this._errorLabelElement = null;
        },

        _onMediaPlayerPlayerStateChange: function (e) {
            if (this.mediaPlayer.playerState === PlayerFramework.PlayerState.failed) {
                this.show();
            } else {
                this.hide();
            }
        },

        _onErrorControlClick: function (e) {
            this.mediaPlayer.retry();
        }
    });

    // ErrorPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        errorPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // ErrorPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        ErrorPlugin: ErrorPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // LoaderPlugin Errors
    var invalidConstruction = "Invalid construction: LoaderPlugin constructor must be called using the \"new\" operator.";

    // LoaderPlugin Class
    var LoaderPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.LoaderPlugin)) {
            throw invalidConstruction;
        }

        this._loaderContainerElement = null;
        this._loaderControlElement = null;

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Methods
        show: function () {
            this.mediaPlayer.addClass("pf-show-loader-container");
        },

        hide: function () {
            this.mediaPlayer.removeClass("pf-show-loader-container");
        },

        // Private Methods
        _setElement: function () {
            this._loaderContainerElement = PlayerFramework.Utilities.createElement(this.mediaPlayer.element, ["div", { "class": "pf-loader-container" }]);
            this._loaderControlElement = PlayerFramework.Utilities.createElement(this._loaderContainerElement, ["button", { "type": "button", "class": "pf-loader-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-options": JSON.stringify({ "content": PlayerFramework.Utilities.getResourceString("LoaderIcon"), "label": PlayerFramework.Utilities.getResourceString("LoaderLabel"), "tooltip": PlayerFramework.Utilities.getResourceString("LoaderTooltip") }) }]);

            WinJS.UI.processAll(this._loaderContainerElement);
        },

        _onActivate: function () {
            this._setElement();

            this._bindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._bindEvent("click", this._loaderControlElement.winControl, this._onLoaderControlClick);

            if (!this.mediaPlayer.autoload && (this.mediaPlayer.playerState === PlayerFramework.PlayerState.unloaded || this.mediaPlayer.playerState === PlayerFramework.PlayerState.pending)) {
                this.show();
            }

            return true;
        },

        _onDeactivate: function () {
            this.hide();

            this._unbindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._unbindEvent("click", this._loaderControlElement.winControl, this._onLoaderControlClick);

            PlayerFramework.Utilities.removeElement(this._loaderContainerElement);

            this._loaderContainerElement = null;
            this._loaderControlElement = null;
        },

        _onMediaPlayerPlayerStateChange: function (e) {
            if (!this.mediaPlayer.autoload && (this.mediaPlayer.playerState === PlayerFramework.PlayerState.unloaded || this.mediaPlayer.playerState === PlayerFramework.PlayerState.pending)) {
                this.show();
            } else {
                this.hide();
            }
        },

        _onLoaderControlClick: function (e) {
            this.mediaPlayer.load();
        }
    });

    // LoaderPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        loaderPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // LoaderPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        LoaderPlugin: LoaderPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // PlaylistPlugin Errors
    var invalidConstruction = "Invalid construction: PlaylistPlugin constructor must be called using the \"new\" operator.",
        invalidPlaylistItem = "Invalid playlist item: Playlist must contain item.",
        invalidPlaylistItemIndex = "Invalid playlist item index: Playlist must contain item.";

    // PlaylistPlugin Events
    var events = [
        "skippingnext",
        "skippingback"
    ];

    // PlaylistPlugin Class
    var PlaylistPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.PlaylistPlugin)) {
            throw invalidConstruction;
        }

        this._playlist = [];
        this._autoAdvance = true;
        this._skipBackThreshold = 5;
        this._currentPlaylistItem = null;
        this._currentPlaylistItemIndex = -1;
        this._startupPlaylistItemIndex = 0;
        this._isInitialized = false;

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Properties
        playlist: {
            get: function () {
                return this._playlist;
            },
            set: function (value) {
                var oldValue = this._playlist;
                if (oldValue !== value) {
                    this._playlist = value;
                    this._observablePlugin.notify("playlist", value, oldValue);
                }
            }
        },

        autoAdvance: {
            get: function () {
                return this._autoAdvance;
            },
            set: function (value) {
                var oldValue = this._autoAdvance;
                if (oldValue !== value) {
                    this._autoAdvance = value;
                    this._observablePlugin.notify("autoAdvance", value, oldValue);
                }
            }
        },

        skipBackThreshold: {
            get: function () {
                return this._skipBackThreshold;
            },
            set: function (value) {
                var oldValue = this._skipBackThreshold;
                if (oldValue !== value) {
                    this._skipBackThreshold = value;
                    this._observablePlugin.notify("skipBackThreshold", value, oldValue);
                }
            }
        },

        currentPlaylistItem: {
            get: function () {
                return this._currentPlaylistItem;
            },
            set: function (value) {
                var oldValue = this._currentPlaylistItem;
                if (oldValue !== value) {
                    if ((value && !this.playlist) || (value && this.playlist.indexOf(value) === -1)) {
                        throw invalidPlaylistItem;
                    }

                    if (value) {
                        this._currentPlaylistItem = value;
                        this._observablePlugin.notify("currentPlaylistItem", value, oldValue);
                        this.currentPlaylistItemIndex = this.playlist.indexOf(value);
                        this.mediaPlayer.update(value);
                    } else if (oldValue !== null) {
                        this._currentPlaylistItem = null;
                        this._observablePlugin.notify("currentPlaylistItem", null, oldValue);
                        this.currentPlaylistItemIndex = -1;
                        this.mediaPlayer.update(null);
                    } 
                }
            }
        },

        currentPlaylistItemIndex: {
            get: function () {
                return this._currentPlaylistItemIndex;
            },
            set: function (value) {
                var oldValue = this._currentPlaylistItemIndex;
                if (oldValue !== value) {
                    if (typeof value !== "number" || (value >= 0 && !this.playlist) || (value >= 0 && value >= this.playlist.length)) {
                        throw invalidPlaylistItemIndex;
                    }

                    if (value >= 0) {
                        this._currentPlaylistItemIndex = value;
                        this._observablePlugin.notify("currentPlaylistItemIndex", value, oldValue);
                        this.currentPlaylistItem = this.playlist[value];
                    } else if (oldValue !== -1) {
                        this._currentPlaylistItemIndex = -1;
                        this._observablePlugin.notify("currentPlaylistItemIndex", -1, oldValue);
                        this.currentPlaylistItem = null;
                    }
                }
            }
        },

        startupPlaylistItemIndex: {
            get: function () {
                return this._startupPlaylistItemIndex;
            },
            set: function (value) {
                var oldValue = this._startupPlaylistItemIndex;
                if (oldValue !== value) {
                    this._startupPlaylistItemIndex = value;
                    this._observablePlugin.notify("startupPlaylistItemIndex", value, oldValue);
                }
            }
        },

        // Public Methods
        goToPreviousPlaylistItem: function () {
            if (this.canGoToPreviousPlaylistItem()) {
                var playlistItem = this.playlist[this.currentPlaylistItemIndex - 1];
                var args = { "playlistItem": playlistItem, "cancel": false };
                this.dispatchEvent("skippingprevious", args);
                if (!args.cancel) {
                    this.currentPlaylistItem = playlistItem;
                }
            }
        },

        goToNextPlaylistItem: function () {
            if (this.canGoToNextPlaylistItem()) {
                var playlistItem = this.playlist[this.currentPlaylistItemIndex + 1];
                var args = { "playlistItem": playlistItem, "cancel": false };
                this.dispatchEvent("skippingnext", args);
                if (!args.cancel) {
                    this.currentPlaylistItem = playlistItem;
                }
            }
        },

        canGoToPreviousPlaylistItem: function () {
            return this.playlist && this.currentPlaylistItemIndex > 0;
        },

        canGoToNextPlaylistItem: function () {
            return this.playlist && this.currentPlaylistItemIndex < this.playlist.length - 1;
        },

        // Private Methods
        _onActivate: function () {
            this._bindEvent("interactiveviewmodelchange", this.mediaPlayer, this._onMediaPlayerInteractiveViewModelChange);
            this._bindEvent("initialized", this.mediaPlayer, this._onMediaPlayerInitialized);
            this._bindEvent("ended", this.mediaPlayer, this._onMediaPlayerEnded);

            this._interactiveViewModel = this.mediaPlayer.interactiveViewModel;

            if (this._interactiveViewModel) {
                this._bindEvent("skipback", this._interactiveViewModel, this._onInteractiveViewModelSkipBack);
                this._bindEvent("skipahead", this._interactiveViewModel, this._onInteractiveViewModelSkipAhead);
                this._bindEvent("skipprevious", this._interactiveViewModel, this._onInteractiveViewModelSkipPrevious);
                this._bindEvent("skipnext", this._interactiveViewModel, this._onInteractiveViewModelSkipNext);
            }

            if (this._isInitialized && this.playlist && this.startupPlaylistItemIndex !== null) {
                this.currentPlaylistItem = this.playlist[this.startupPlaylistItemIndex];
            }

            return true;
        },

        _onDeactivate: function () {
            this.currentPlaylistItem = null;

            this._unbindEvent("interactiveviewmodelchange", this.mediaPlayer, this._onMediaPlayerInteractiveViewModelChange);
            this._unbindEvent("initialized", this.mediaPlayer, this._onMediaPlayerInitialized);
            this._unbindEvent("ended", this.mediaPlayer, this._onMediaPlayerEnded);

            if (this._interactiveViewModel) {
                this._unbindEvent("skipback", this._interactiveViewModel, this._onInteractiveViewModelSkipBack);
                this._unbindEvent("skipahead", this._interactiveViewModel, this._onInteractiveViewModelSkipAhead);
                this._unbindEvent("skipprevious", this._interactiveViewModel, this._onInteractiveViewModelSkipPrevious);
                this._unbindEvent("skipnext", this._interactiveViewModel, this._onInteractiveViewModelSkipNext);
            }
            
            this._interactiveViewModel = null;
        },

        _onMediaPlayerInteractiveViewModelChange: function (e) {
            if (this._interactiveViewModel) {
                this._unbindEvent("skipback", this._interactiveViewModel, this._onInteractiveViewModelSkipBack);
                this._unbindEvent("skipahead", this._interactiveViewModel, this._onInteractiveViewModelSkipAhead);
                this._unbindEvent("skipprevious", this._interactiveViewModel, this._onInteractiveViewModelSkipPrevious);
                this._unbindEvent("skipnext", this._interactiveViewModel, this._onInteractiveViewModelSkipNext);
            }

            this._interactiveViewModel = this.mediaPlayer.interactiveViewModel;

            if (this._interactiveViewModel) {
                this._bindEvent("skipback", this._interactiveViewModel, this._onInteractiveViewModelSkipBack);
                this._bindEvent("skipahead", this._interactiveViewModel, this._onInteractiveViewModelSkipAhead);
                this._bindEvent("skipprevious", this._interactiveViewModel, this._onInteractiveViewModelSkipPrevious);
                this._bindEvent("skipnext", this._interactiveViewModel, this._onInteractiveViewModelSkipNext);
            }
        },

        _onMediaPlayerInitialized: function (e) {
            if (this.playlist && this.startupPlaylistItemIndex !== null) {
                this.currentPlaylistItem = this.playlist[this.startupPlaylistItemIndex];
            }

            this._isInitialized = true;
        },

        _onMediaPlayerEnded: function (e) {
            if (!this.mediaPlayer.loop && this.autoAdvance && this.canGoToNextPlaylistItem()) {
                this.goToNextPlaylistItem();
                e.preventDefault();
            }
        },

        _onInteractiveViewModelSkipBack: function (e) {
            if (e.detail.time === 0 && (!this.skipBackThreshold || this.mediaPlayer.virtualTime < this.skipBackThreshold) && this.canGoToPreviousPlaylistItem()) {
                this.goToPreviousPlaylistItem();
                e.preventDefault();
            }
        },

        _onInteractiveViewModelSkipAhead: function (e) {
            if (e.detail.time === this.mediaPlayer.duration && this.canGoToNextPlaylistItem()) {
                this.goToNextPlaylistItem();
                e.preventDefault();
            }
        },

        _onInteractiveViewModelSkipPrevious: function (e) {
            if ((!this.skipBackThreshold || this.mediaPlayer.virtualTime < this.skipBackThreshold) && this.canGoToPreviousPlaylistItem()) {
                this.goToPreviousPlaylistItem();
                e.preventDefault();
            }
        },

        _onInteractiveViewModelSkipNext: function (e) {
            if (this.canGoToNextPlaylistItem()) {
                this.goToNextPlaylistItem();
                e.preventDefault();
            }
        }
    });

    // PlaylistPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        playlistPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // TrackingPluginBase Mixins
    WinJS.Class.mix(PlaylistPlugin, PlayerFramework.Utilities.createEventProperties(events));

    // PlaylistPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        PlaylistPlugin: PlaylistPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // PlayTimeTrackingPlugin Errors
    var invalidConstruction = "Invalid construction: PlayTimeTrackingPlugin constructor must be called using the \"new\" operator.";

    // PlayTimeTrackingPlugin Class
    var PlayTimeTrackingPlugin = WinJS.Class.derive(PlayerFramework.TrackingPluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.PlayTimeTrackingPlugin)) {
            throw invalidConstruction;
        }

        this._playTime = 0;
        this._playTimePercentage = 0;
        this._dispatchedTrackingEvents = [];
        this._startTime = null;

        PlayerFramework.TrackingPluginBase.call(this, options);
    }, {
        // Public Properties
        playTime: {
            get: function () {
                return this._playTime;
            },
            set: function (value) {
                var oldValue = this._playTime;
                if (oldValue !== value) {
                    this._playTime = value;
                    this._observablePlugin.notify("playTime", value, oldValue);
                }
            }
        },

        playTimePercentage: {
            get: function () {
                return this._playTimePercentage;
            },
            set: function (value) {
                var oldValue = this._playTimePercentage;
                if (oldValue !== value) {
                    this._playTimePercentage = value;
                    this._observablePlugin.notify("playTimePercentage", value, oldValue);
                }
            }
        },

        // Private Methods
        _evaluateTrackingEvents: function () {
            if (this.trackingEvents) {
                var dispatchedTrackingEvents = this._dispatchedTrackingEvents;
                var undispatchedTrackingEvents = this.trackingEvents.filter(function (trackingEvent) { return dispatchedTrackingEvents.indexOf(trackingEvent) === -1; });
                for (var i = 0; i < undispatchedTrackingEvents.length; i++) {
                    var trackingEvent = undispatchedTrackingEvents[i];
                    if ((!isNaN(trackingEvent.playTimePercentage) && trackingEvent.playTimePercentage <= this.playTimePercentage) || (!isNaN(trackingEvent.playTime) && trackingEvent.playTime <= this.playTime)) {
                        dispatchedTrackingEvents.push(trackingEvent);
                        this.dispatchEvent("eventtracked", { trackingEvent: trackingEvent, timestamp: Date.now() });
                    }
                }
            }
        },

        _resetStartTime: function () {
            this._startTime = Date.now() - (this.playTime * 1000);
        },

        _onActivate: function () {
            this._bindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._bindEvent("pause", this.mediaPlayer, this._onMediaPlayerPause);
            this._bindEvent("playing", this.mediaPlayer, this._onMediaPlayerPlaying);
            this._bindEvent("timeupdate", this.mediaPlayer, this._onMediaPlayerTimeUpdate);

            return PlayerFramework.TrackingPluginBase.prototype._onActivate.call(this);
        },

        _onDeactivate: function () {
            this._unbindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._unbindEvent("pause", this.mediaPlayer, this._onMediaPlayerPause);
            this._unbindEvent("playing", this.mediaPlayer, this._onMediaPlayerPlaying);
            this._unbindEvent("timeupdate", this.mediaPlayer, this._onMediaPlayerTimeUpdate);

            PlayerFramework.TrackingPluginBase.prototype._onDeactivate.call(this);
        },

        _onUpdate: function () {
            this.playTime = 0;
            this.playTimePercentage = 0;
            this._dispatchedTrackingEvents = [];
            this._startTime = null;
        },

        _onMediaPlayerPlayerStateChange: function (e) {
            this._startTime = null;
        },

        _onMediaPlayerPause: function (e) {
            this._startTime = null;
        },

        _onMediaPlayerPlaying: function (e) {
            this._resetStartTime();
        },

        _onMediaPlayerTimeUpdate: function (e) {
            if (this._startTime === null && !this.mediaPlayer.paused && !this.mediaPlayer.ended) {
                this._resetStartTime();
            }

            if (this._startTime !== null) {
                this.playTime = (Date.now() - this._startTime) / 1000;
                this.playTimePercentage = this.playTime / this.mediaPlayer.duration;
                this._evaluateTrackingEvents();
            }
        }
    });

    // PlayTimeTrackingPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        playTimeTrackingPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // PlayTimeTrackingPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        PlayTimeTrackingPlugin: PlayTimeTrackingPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // PositionTrackingPlugin Errors
    var invalidConstruction = "Invalid construction: PositionTrackingPlugin constructor must be called using the \"new\" operator.";

    // PositionTrackingPlugin Class
    var PositionTrackingPlugin = WinJS.Class.derive(PlayerFramework.TrackingPluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.PositionTrackingPlugin)) {
            throw invalidConstruction;
        }

        this._position = 0;
        this._positionPercentage = 0;
        this._dispatchedTrackingEvents = [];
        this._evaluateOnForwardOnly = true;

        PlayerFramework.TrackingPluginBase.call(this, options);
    }, {
        // Public Properties
        evaluateOnForwardOnly: {
            get: function () {
                return this._evaluateOnForwardOnly;
            },
            set: function (value) {
                var oldValue = this._evaluateOnForwardOnly;
                if (oldValue !== value) {
                    this._evaluateOnForwardOnly = value;
                    this._observablePlugin.notify("evaluateOnForwardOnly", value, oldValue);
                }
            }
        },

        position: {
            get: function () {
                return this._position;
            },
            set: function (value) {
                var oldValue = this._position;
                if (oldValue !== value) {
                    this._position = value;
                    this._observablePlugin.notify("position", value, oldValue);
                }
            }
        },

        positionPercentage: {
            get: function () {
                return this._positionPercentage;
            },
            set: function (value) {
                var oldValue = this._positionPercentage;
                if (oldValue !== value) {
                    this._positionPercentage = value;
                    this._observablePlugin.notify("positionPercentage", value, oldValue);
                }
            }
        },

        // Private Methods
        _evaluateTrackingEvents: function (previousTime, currentTime, skippedPast) {
            if (this.trackingEvents) {
                for (var i = 0; i < this.trackingEvents.length; i++) {
                    var trackingEvent = this.trackingEvents[i];
                    var time = this._getTrackingEventTime(trackingEvent);
                    var index = this._dispatchedTrackingEvents.indexOf(trackingEvent);
                    
                    if (index !== -1 && time > currentTime) {
                        this._dispatchedTrackingEvents.splice(index, 1);
                        index = -1;
                    }

                    if (index === -1 && (!this.evaluateOnForwardOnly || currentTime > previousTime) && time <= currentTime && time > previousTime) {
                        this._dispatchedTrackingEvents.push(trackingEvent);
                        this.dispatchEvent("eventtracked", { trackingEvent: trackingEvent, timestamp: Date.now(), skippedPast: skippedPast });
                    }
                }
            }
        },

        _getTrackingEventTime: function (trackingEvent) {
            if (!isNaN(trackingEvent.positionPercentage)) {
                return trackingEvent.positionPercentage * this.mediaPlayer.duration;
            } else if (!isNaN(trackingEvent.position)) {
                return trackingEvent.position;
            } else {
                return NaN;
            }
        },

        _onActivate: function () {
            this._bindEvent("seek", this.mediaPlayer, this._onMediaPlayerSeek);
            this._bindEvent("scrubbed", this.mediaPlayer, this._onMediaPlayerScrubbed);
            this._bindEvent("timeupdate", this.mediaPlayer, this._onMediaPlayerTimeUpdate);

            return PlayerFramework.TrackingPluginBase.prototype._onActivate.call(this);
        },

        _onDeactivate: function () {
            this._unbindEvent("seek", this.mediaPlayer, this._onMediaPlayerSeek);
            this._unbindEvent("scrubbed", this.mediaPlayer, this._onMediaPlayerScrubbed);
            this._unbindEvent("timeupdate", this.mediaPlayer, this._onMediaPlayerTimeUpdate);

            PlayerFramework.TrackingPluginBase.prototype._onDeactivate.call(this);
        },

        _onUpdate: function () {
            this.position = 0;
            this.positionPercentage = 0;
            this._dispatchedTrackingEvents = [];
        },

        _onMediaPlayerSeek: function (e) {
            this._evaluateTrackingEvents(e.detail.previousTime, e.detail.time, true);
        },

        _onMediaPlayerScrubbed: function (e) {
            this._evaluateTrackingEvents(e.detail.startTime, e.detail.time, true);
        },

        _onMediaPlayerTimeUpdate: function (e) {
            var currentTime = this.mediaPlayer.virtualTime;

            this.position = currentTime;
            this.positionPercentage = currentTime / this.mediaPlayer.duration;

            if (!this.mediaPlayer.scrubbing) {
                this._evaluateTrackingEvents(-1, currentTime, false);
            }
        }
    });

    // PositionTrackingPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        positionTrackingPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // PositionTrackingPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        PositionTrackingPlugin: PositionTrackingPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // SystemTransportControlsPlugin Errors
    var invalidConstruction = "Invalid construction: SystemTransportControlsPlugin constructor must be called using the \"new\" operator.";

    // SystemTransportControlsPlugin Class
    var SystemTransportControlsPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.SystemTransportControlsPlugin)) {
            throw invalidConstruction;
        }

        this._isNextTrackEnabled = false;
        this._isPreviousTrackEnabled = false;
        this._observableViewModel = null;
        this._observablePlaylistPlugin = null;
        this.systemControls = null;

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Private Methods
        _onActivate: function () {
            this.systemControls = Windows.Media.SystemMediaTransportControls.getForCurrentView();
            this._bindEvent("buttonpressed", this.systemControls, this._onButtonPressed);
            this._refreshFastForwardState();
            this._refreshRewindState();
            this._refreshStopState();
            this._refreshPlayState();
            this._refreshPauseState();
            this._refreshNextState();
            this._refreshPreviousState();
            this._refreshPlaybackStatus();

            if (this.mediaPlayer.playlistPlugin) {
                this._observablePlaylistPlugin = WinJS.Binding.as(this.mediaPlayer.playlistPlugin);
                this._bindProperty("currentPlaylistItemIndex", this._observablePlaylistPlugin, this._onCurrentPlaylistItemIndexChanged);
            }

            this._wireEvents();
            this._bindEvent("interactiveviewmodelchange", this.mediaPlayer, this._onMediaPlayerInteractiveViewModelChange);

            return true;
        },

        _onDeactivate: function () {
            if (this._observablePlaylistPlugin) {
                this._unbindProperty("currentPlaylistItemIndex", this._observablePlaylistPlugin, this._onCurrentPlaylistItemIndexChanged);
                this._observablePlaylistPlugin = null;
            }

            this.isNextTrackEnabled = false;
            this.isPreviousTrackEnabled = false;

            this._unbindEvent("interactiveviewmodelchange", this.mediaPlayer, this._onMediaPlayerInteractiveViewModelChange);
            this._unwireEvents();

            this._unbindEvent("buttonpressed", this.systemControls, this._onButtonPressed);
            this.systemControls = null;
        },

        _wireEvents: function () {
            if (this.mediaPlayer.interactiveViewModel) {
                this._observableViewModel = WinJS.Binding.as(this.mediaPlayer.interactiveViewModel);
                this._bindProperty("isPlayResumeDisabled", this._observableViewModel, this._onIsPlayResumeDisabledChanged);
                this._bindProperty("isPauseDisabled", this._observableViewModel, this._onIsPauseDisabledChanged);
                this._bindProperty("isStopDisabled", this._observableViewModel, this._onIsStopDisabledChanged);
                this._bindProperty("isFastForwardDisabled", this._observableViewModel, this._onIsFastForwardDisabledChanged);
                this._bindProperty("isRewindDisabled", this._observableViewModel, this._onIsRewindDisabledChanged);
                this._bindProperty("isSkipPreviousDisabled", this._observableViewModel, this._onIsSkipPreviousDisabledChanged);
                this._bindProperty("isSkipNextDisabled", this._observableViewModel, this._onIsSkipNextDisabledChanged);
                this._bindProperty("state", this._observableViewModel, this._onStateChanged);
            }
        },

        _unwireEvents: function () {
            if (this._observableViewModel) {
                this._unbindProperty("state", this._observableViewModel, this._onStateChanged);
                this._unbindProperty("isPlayResumeDisabled", this._observableViewModel, this._onIsPlayResumeDisabledChanged);
                this._unbindProperty("isPauseDisabled", this._observableViewModel, this._onIsPauseDisabledChanged);
                this._unbindProperty("isStopDisabled", this._observableViewModel, this._onIsStopDisabledChanged);
                this._unbindProperty("isFastForwardDisabled", this._observableViewModel, this._onIsFastForwardDisabledChanged);
                this._unbindProperty("isRewindDisabled", this._observableViewModel, this._onIsRewindDisabledChanged);
                this._unbindProperty("isSkipPreviousDisabled", this._observableViewModel, this._onIsSkipPreviousDisabledChanged);
                this._unbindProperty("isSkipNextDisabled", this._observableViewModel, this._onIsSkipNextDisabledChanged);
                this._observableViewModel = null;
            }
        },

        isPreviousTrackEnabled: {
            get: function () {
                return this._isPreviousTrackEnabled;
            },
            set: function (value) {
                if (this._isPreviousTrackEnabled !== value) {
                    this._isPreviousTrackEnabled = value;
                    this.systemControls.isPreviousEnabled = value;
                }
            }
        },

        isNextTrackEnabled: {
            get: function () {
                return this._isNextTrackEnabled;
            },
            set: function (value) {
                if (this._isNextTrackEnabled !== value) {
                    this._isNextTrackEnabled = value;
                    this.systemControls.isNextEnabled = value;
                }
            }
        },

        nextTrackExists: {
            get: function () {
                return this.mediaPlayer && this.mediaPlayer.playlistPlugin && this.mediaPlayer.playlistPlugin.canGoToNextPlaylistItem();
            }
        },

        previousTrackExists: {
            get: function () {
                return this.mediaPlayer && this.mediaPlayer.playlistPlugin && this.mediaPlayer.playlistPlugin.canGoToPreviousPlaylistItem();
            }
        },

        _onStateChanged: function (e) {
            this._refreshPlaybackStatus();
        },

        _refreshPlaybackStatus: function () {
            switch (this.mediaPlayer.interactiveViewModel.state) {
                case PlayerFramework.ViewModelState.unloaded:
                    this.systemControls.playbackStatus = Windows.Media.MediaPlaybackStatus.closed;
                    break;
                case PlayerFramework.ViewModelState.loading:
                    this.systemControls.playbackStatus = Windows.Media.MediaPlaybackStatus.changing;
                    break;
                case PlayerFramework.ViewModelState.paused:
                    this.systemControls.playbackStatus = Windows.Media.MediaPlaybackStatus.paused;
                    break;
                case PlayerFramework.ViewModelState.playing:
                    this.systemControls.playbackStatus = Windows.Media.MediaPlaybackStatus.playing;
                    break;
            }
        },

        _onMediaPlayerStopped: function (e) {
            this.systemControls.playbackStatus = Windows.Media.MediaPlaybackStatus.stopped;
        },

        _refreshTrackButtonStates: function () {
            this.isNextTrackEnabled = this.nextTrackExists;
            this.isPreviousTrackEnabled = this.previousTrackExists;
        },

        _onCurrentPlaylistItemIndexChanged: function (e) {
            this.isNextTrackEnabled = this.nextTrackExists;
            this.isPreviousTrackEnabled = this.previousTrackExists;
        },

        _onIsSkipPreviousDisabledChanged: function (e) {
            this._refreshPreviousState();
        },

        _refreshPreviousState: function () {
            this.isPreviousTrackEnabled = this.mediaPlayer.interactiveViewModel !== null && !this.mediaPlayer.interactiveViewModel.isSkipPreviousDisabled && this.previousTrackExists;
        },

        _onIsSkipNextDisabledChanged: function (e) {
            this._refreshNextState();
        },

        _refreshNextState: function () {
            this.isNextTrackEnabled = this.mediaPlayer.interactiveViewModel !== null && !this.mediaPlayer.interactiveViewModel.isSkipNextDisabled && this.nextTrackExists;
        },

        _onIsPauseDisabledChanged: function (e) {
            this._refreshPauseState();
        },

        _refreshPauseState: function () {
            this.systemControls.isPauseEnabled = this.mediaPlayer.interactiveViewModel !== null;
        },

        _onIsPlayResumeDisabledChanged: function (e) {
            this._refreshPlayState();
        },

        _refreshPlayState: function () {
            this.systemControls.isPlayEnabled = this.mediaPlayer.interactiveViewModel !== null;
        },

        _onIsFastForwardDisabledChanged: function (e) {
            this._refreshFastForwardState();
        },

        _refreshFastForwardState: function () {
            this.systemControls.isFastForwardEnabled = this.mediaPlayer.interactiveViewModel !== null && !this.mediaPlayer.interactiveViewModel.isFastForwardDisabled;
        },

        _onIsRewindDisabledChanged: function (e) {
            this._refreshRewindState();
        },

        _refreshRewindState: function () {
            this.systemControls.isRewindEnabled = this.mediaPlayer.interactiveViewModel !== null && !this.mediaPlayer.interactiveViewModel.isRewindDisabled;
        },

        _onIsStopDisabledChanged: function (e) {
            this._refreshStopState();
        },

        _refreshStopState: function () {
            this.systemControls.isStopEnabled = this.mediaPlayer.interactiveViewModel !== null && !this.mediaPlayer.interactiveViewModel.isStopDisabled;
        },

        _onMediaPlayerInteractiveViewModelChange: function (e) {
            // rewire to the new VM
            this._unwireEvents();

            this._refreshFastForwardState();
            this._refreshRewindState();
            this._refreshStopState();
            this._refreshPlayState();
            this._refreshPauseState();
            this._refreshNextState();
            this._refreshPreviousState();
            this._refreshPlaybackStatus();

            this._wireEvents();
        },

        _onButtonPressed: function (e) {
            switch (e.button) {
                case Windows.Media.SystemMediaTransportControlsButton.pause:
                    if (!this.mediaPlayer.interactiveViewModel.isPauseDisabled) {
                        this.mediaPlayer.interactiveViewModel.pause();
                    }
                    break;
                case Windows.Media.SystemMediaTransportControlsButton.play:
                    if (!this.mediaPlayer.interactiveViewModel.isPlayResumeDisabled) {
                        this.mediaPlayer.interactiveViewModel.playResume();
                    }
                    break;
                case Windows.Media.SystemMediaTransportControlsButton.stop:
                    if (!this.mediaPlayer.interactiveViewModel.isStopDisabled) {
                        this.mediaPlayer.interactiveViewModel.stop();
                    }
                    break;
                case Windows.Media.SystemMediaTransportControlsButton.previous:
                    this.mediaPlayer.playlistPlugin.goToPreviousPlaylistItem();
                    break;
                case Windows.Media.SystemMediaTransportControlsButton.next:
                    this.mediaPlayer.playlistPlugin.goToNextPlaylistItem();
                    break;
                case Windows.Media.SystemMediaTransportControlsButton.rewind:
                    if (!this.mediaPlayer.interactiveViewModel.isRewindDisabled) {
                        this.mediaPlayer.interactiveViewModel.decreasePlaybackRate();
                    }
                    break;
                case Windows.Media.SystemMediaTransportControlsButton.fastForward:
                    if (!this.mediaPlayer.interactiveViewModel.isFastForwardDisabled) {
                        this.mediaPlayer.interactiveViewModel.increasePlaybackRate();
                    }
                    break;

            }
        }
    });

    // SystemTransportControlsPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        SystemTransportControlsPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // SystemTransportControlsPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        SystemTransportControlsPlugin: SystemTransportControlsPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // ChaptersPlugin Errors
    var invalidConstruction = "Invalid construction: ChaptersPlugin constructor must be called using the \"new\" operator.";

    // ChaptersPlugin Class
    var ChaptersPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.ChaptersPlugin)) {
            throw invalidConstruction;
        }

        this._defaultChapterCount = 10;
        this._autoCreateDefaultChapters = false;
        this._autoCreateChaptersFromTextTracks = false;
        this._visualMarkerClass = "pf-marker-chapter";
        this._chapterMarkers = [];

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Properties
        defaultChapterCount: {
            get: function () {
                return this._defaultChapterCount;
            },
            set: function (value) {
                this._defaultChapterCount = value;
            }
        },
        
        autoCreateDefaultChapters: {
            get: function () {
                return this._autoCreateDefaultChapters;
            },
            set: function (value) {
                this._autoCreateDefaultChapters = value;
            }
        },
        
        autoCreateChaptersFromTextTracks: {
            get: function () {
                return this._autoCreateChaptersFromTextTracks;
            },
            set: function (value) {
                this._autoCreateChaptersFromTextTracks = value;
            }
        },
        
        visualMarkerClass: {
            get: function () {
                return this._visualMarkerClass;
            },
            set: function (value) {
                this._visualMarkerClass = value;
            }
        },

        // Private Methods
        _onActivate: function () {
            this._init();
            this._bindEvent("canplay", this.mediaPlayer, this._onMediaPlayerCanPlay);

            return true;
        },

        _onDeactivate: function () {
            this._unbindEvent("canplay", this.mediaPlayer, this._onMediaPlayerCanPlay);
            this._reset();
        },

        _onUpdate: function () {
            this._reset();
            this._init();
        },
        
        _init: function () {
            if (this._autoCreateChaptersFromTextTracks) {
                this._createChaptersFromTextTracks();
            }
        },

        _reset: function () {
            for (var i = 0; i < this._chapterMarkers.length; i++) {
                var marker = this._chapterMarkers[i];
                var index = this.mediaPlayer.visualMarkers.indexOf(marker);
                this.mediaPlayer.visualMarkers.splice(index, 1);
            }
            this._chapterMarkers = [];
        },

        _onMediaPlayerCanPlay: function (e) {
            if (this._autoCreateDefaultChapters) {
                this._createDefaultChapters();
            }
        },
        
        _createChaptersFromTextTracks: function () {
            var textTracks = this.mediaPlayer.textTracks;
            var tracks = this.mediaPlayer.mediaElement.getElementsByTagName("track");
            for (var i = 0; i < tracks.length; i++) {
                if (tracks[i].kind === "chapters") {
                    // Set track to hidden or cue-related events will not fire.
                    tracks[i].mode = tracks[i].HIDDEN;

                    var that = this;
                    this._loadTextTrackCallback = function handleLoadTextTrack() {
                        var textTrackCueList = this.track.cues;
                        var chapterMarkers = [];
                        var textTrackCueListLength = textTrackCueList.length;
                        for (var j = 0; j < textTrackCueListLength; j++) {
                            var marker = {
                                time: textTrackCueList[j].startTime,
                                isSeekable: true,
                                type: "chapter",
                                text: textTrackCueList[j].text,
                                extraClass: that._visualMarkerClass
                            };
                            chapterMarkers.push(marker);
                        }
                        that._addToVisualMarkers(chapterMarkers);
                    };

                    tracks[i].addEventListener("load", this._loadTextTrackCallback, false);
                }
            }
        },

        _createDefaultChapters: function () {
            var chapterLength = this.mediaPlayer.duration / this._defaultChapterCount;

            var chapterMarkers = [];
            for (var i = 0; i <= this._defaultChapterCount; i++) {
                var marker = {
                    time: i * chapterLength,
                    isSeekable: true,
                    type: "chapter",
                    extraClass: this._visualMarkerClass
                };
                chapterMarkers.push(marker);
            }
            this._addToVisualMarkers(chapterMarkers);
        },

        _addToVisualMarkers: function (markers) {
            var allMarkers = [];
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                this._chapterMarkers.push(marker);
                allMarkers.push(marker);
            }
            for (var i = 0; i < this.mediaPlayer.visualMarkers.length; i++) {
                var marker = this.mediaPlayer.visualMarkers[i];
                allMarkers.push(marker);
            }
            this.mediaPlayer.visualMarkers = allMarkers;
        }
    });

    // ChaptersPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        ChaptersPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // ChaptersPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        ChaptersPlugin: ChaptersPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // DisplayRequestPlugin Errors
    var invalidConstruction = "Invalid construction: DisplayRequestPlugin constructor must be called using the \"new\" operator.";

    // DisplayRequestPlugin Class
    var DisplayRequestPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.DisplayRequestPlugin)) {
            throw invalidConstruction;
        }

        this._keepActiveWhilePaused = false;
        this._isRequestActive = false;
        this._displayRequest = null;

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Properties
        isRequestActive: {
            get: function () {
                return this._isRequestActive;
            }
        },

        // Private Methods
        _requestActive: function () {
            if (!this._isRequestActive) {
                this._getDisplayRequest().requestActive();
                this._isRequestActive = true;
            }
        },

        _requestRelease: function () {
            if (this._isRequestActive) {
                this._getDisplayRequest().requestRelease();
                this._isRequestActive = false;
                this._displayRequest = null;
            }
        },

        _getDisplayRequest: function () {
            if (this._displayRequest == null) {
                this._displayRequest = new Windows.System.Display.DisplayRequest();
            }
            return this._displayRequest;
        },

        _onActivate: function () {
            if (!this.mediaPlayer.paused) {
                this._requestActive();
            }
            this._bindEvent("emptied", this.mediaPlayer, this._onMediaPlayerPause);
            this._bindEvent("error", this.mediaPlayer, this._onMediaPlayerPause);
            this._bindEvent("ended", this.mediaPlayer, this._onMediaPlayerPause);
            this._bindEvent("pause", this.mediaPlayer, this._onMediaPlayerPause);
            this._bindEvent("playing", this.mediaPlayer, this._onMediaPlayerPlaying);

            return true;
        },

        _onDeactivate: function () {
            this._requestRelease();
            this._unbindEvent("emptied", this.mediaPlayer, this._onMediaPlayerPause);
            this._unbindEvent("error", this.mediaPlayer, this._onMediaPlayerPause);
            this._unbindEvent("ended", this.mediaPlayer, this._onMediaPlayerPause);
            this._unbindEvent("pause", this.mediaPlayer, this._onMediaPlayerPause);
            this._unbindEvent("playing", this.mediaPlayer, this._onMediaPlayerPlaying);
        },

        _onMediaPlayerPause: function (e) {
            this._requestRelease();
        },

        _onMediaPlayerPlaying: function (e) {
            this._requestActive();
        },
    });

    // DisplayRequestPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        DisplayRequestPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // DisplayRequestPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        DisplayRequestPlugin: DisplayRequestPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // CaptionSelectorPlugin Errors
    var invalidConstruction = "Invalid construction: CaptionSelectorPlugin constructor must be called using the \"new\" operator.";

    if (WinJS.Utilities.isPhone) {
        // CaptionSelectorPlugin Class
        var CaptionSelectorPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
            if (!(this instanceof PlayerFramework.Plugins.CaptionSelectorPlugin)) {
                throw invalidConstruction;
            }

            this._menuElement = null;
            this._menuListElement = null;
            this._resumeOnHide = false;

            PlayerFramework.PluginBase.call(this, options);
        }, {
            // Public Methods
            show: function () {
                if (this._menuElement.style.display === "none") {
                    this._menuElement.style.display = "";
                    this.resumeOnHide = !this.mediaPlayer.paused;
                    if (this.resumeOnHide) {
                        this.mediaPlayer.interactiveViewModel.pause();
                    }
                }
            },

            hide: function () {
                if (this._menuElement.style.display !== "none") {
                    this._menuElement.style.display = "none";
                    if (this.resumeOnHide) {
                        this.mediaPlayer.interactiveViewModel.playResume();
                    }
                }
            },

            // Private Methods
            _setElement: function () {
                this._menuElement = PlayerFramework.Utilities.createElement(document.body, ["div", { "class": "pf-captions-menu", "style": "position: absolute; display: none" }]);
                this._menuListElement = PlayerFramework.Utilities.createElement(this._menuElement, ["select", { "class": "pf-captions-menulist" }]);
            },

            _onActivate: function () {
                this._setElement();

                this._bindEvent("captionsinvoked", this.mediaPlayer, this._onMediaPlayerCaptionsInvoked);
                this._menuListElement.addEventListener("change", this._onMenuItemClick.bind(this), false);

                return true;
            },

            _onDeactivate: function () {
                this.hide();

                this._unbindEvent("captionsinvoked", this.mediaPlayer, this._onMediaPlayerCaptionsInvoked);

                PlayerFramework.Utilities.removeElement(this._menuElement);
                this._menuElement = null;

                this._anchor = null;
            },

            _onMediaPlayerCaptionsInvoked: function (e) {
                if (this._menuElement.style.display === "none") {
                    this._updateList();
                    this.show();
                    this._menuListElement.click();
                } else {
                    this.hide();
                }
            },

            _onMenuItemClick: function (e) {
                var that = this;
                var option = this._menuListElement.options[this._menuListElement.selectedIndex];
                var track = option.track;

                window.setImmediate(function () {
                    that.mediaPlayer.currentCaptionTrack = track;
                });
                this.hide();
            },

            _updateList: function () {
                this._menuListElement.options.length = 0;

                var tracks = this.mediaPlayer.captionTracks;
                var currentTrack = this.mediaPlayer.currentCaptionTrack;
                var commands = [];

                if (currentTrack) {
                    var command =
                        {
                            track: null,
                            label: PlayerFramework.Utilities.getResourceString("CaptionsCommandLabel_Off")
                        };
                    commands.push(command);
                }

                if (tracks) {
                    for (var i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        var label = track.label;

                        if (!label) {
                            label = PlayerFramework.Utilities.getResourceString("CaptionTrackLabel_Untitled");
                        }

                        var command = {
                            label: (track === currentTrack) ? PlayerFramework.Utilities.formatResourceString("CaptionsCommandLabel_Selected", label) : PlayerFramework.Utilities.formatResourceString("CaptionsCommandLabel_Unselected", label),
                            track: track
                        };
                        commands.push(command);
                    }
                }

                for (var i = 0; i < commands.length; i++) {
                    var command = commands[i];
                    var _menuListItem = PlayerFramework.Utilities.createElement(this._menuListElement, ["option"]);
                    _menuListItem.innerText = command.label;
                    _menuListItem.track = command.track;
                }
            }
        });
    }
    else {
        // CaptionSelectorPlugin Class
        var CaptionSelectorPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
            if (!(this instanceof PlayerFramework.Plugins.CaptionSelectorPlugin)) {
                throw invalidConstruction;
            }

            this._menuElement = null;
            this._anchor = null;
            this._placement = "top";
            this._alignment = "center";

            PlayerFramework.PluginBase.call(this, options);
        }, {
            // Public Properties
            placement: {
                get: function () {
                    return this._placement;
                },
                set: function (value) {
                    var oldValue = this._placement;
                    if (oldValue !== value) {
                        this._placement = value;
                        this._observableMediaPlayer.notify("placement", value, oldValue);
                    }
                }
            },

            alignment: {
                get: function () {
                    return this._alignment;
                },
                set: function (value) {
                    var oldValue = this._alignment;
                    if (oldValue !== value) {
                        this._alignment = value;
                        this._observableMediaPlayer.notify("alignment", value, oldValue);
                    }
                }
            },

            anchor: {
                get: function () {
                    return this._anchor;
                },
                set: function (value) {
                    var oldValue = this._anchor;
                    if (oldValue !== value) {
                        this._anchor = value;
                        this._observableMediaPlayer.notify("anchor", value, oldValue);
                    }
                }
            },

            // Public Methods
            show: function () {
                if (this._menuElement.winControl && this._menuElement.winControl.hidden) {
                    if (!this._anchor) {
                        this._anchor = this.mediaPlayer.element.querySelector(".pf-captionselection-anchor");
                    }
                    this._menuElement.winControl.show(this._anchor, this._placement, this._alignment);
                }
            },

            hide: function () {
                if (this._menuElement.winControl && !this._menuElement.winControl.hidden) {
                    this._menuElement.winControl.hide();
                }
            },

            // Private Methods
            _setElement: function () {
                this._menuElement = PlayerFramework.Utilities.createElement(document.body, ["div", { "class": "pf-captions-menu", "data-win-control": "WinJS.UI.Menu" }]);
                
                WinJS.UI.processAll(this._menuElement);
            },

            _onActivate: function () {
                this._setElement();

                this._bindEvent("captionsinvoked", this.mediaPlayer, this._onMediaPlayerCaptionsInvoked);
                this._bindEvent("beforeshow", this._menuElement, this._onBeforeMenuShow);

                return true;
            },

            _onDeactivate: function () {
                this.hide();

                this._unbindEvent("captionsinvoked", this.mediaPlayer, this._onMediaPlayerCaptionsInvoked);
                this._unbindEvent("beforeshow", this._menuElement, this._onBeforeMenuShow);

                PlayerFramework.Utilities.removeElement(this._menuElement);
                this._menuElement = null;

                this._anchor = null;
            },

            _onMediaPlayerCaptionsInvoked: function (e) {
                if (this._menuElement.winControl) {
                    if (this._menuElement.winControl.hidden) {
                        this.show();
                    } else {
                        this.hide();
                    }
                }
            },

            _onMenuItemClick: function (track, e) {
                var that = this;
                window.setImmediate(function () {
                    that.mediaPlayer.currentCaptionTrack = track;
                });
                this.hide();
            },

            _onBeforeMenuShow: function (e) {
                var flyout = this._menuElement.winControl;
                var tracks = this.mediaPlayer.captionTracks;
                var currentTrack = this.mediaPlayer.currentCaptionTrack;
                var commands = [];

                if (currentTrack) {
                    var command = new WinJS.UI.MenuCommand();
                    command.flyout = flyout;
                    command.label = PlayerFramework.Utilities.getResourceString("CaptionsCommandLabel_Off");
                    command.onclick = this._onMenuItemClick.bind(this, null);
                    commands.push(command);
                }

                if (tracks) {
                    for (var i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        var label = track.label;

                        if (!label) {
                            label = PlayerFramework.Utilities.getResourceString("CaptionTrackLabel_Untitled");
                        }

                        var command = new WinJS.UI.MenuCommand();
                        command.flyout = flyout;
                        command.label = (track === currentTrack) ? PlayerFramework.Utilities.formatResourceString("CaptionsCommandLabel_Selected", label) : PlayerFramework.Utilities.formatResourceString("CaptionsCommandLabel_Unselected", label);
                        command.onclick = this._onMenuItemClick.bind(this, track);
                        commands.push(command);
                    }
                }

                flyout.commands = commands;
            }
        });
    }

    // CaptionSelectorPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        CaptionSelectorPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // CaptionSelectorPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        CaptionSelectorPlugin: CaptionSelectorPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // AudioSelectorPlugin Errors
    var invalidConstruction = "Invalid construction: AudioSelectorPlugin constructor must be called using the \"new\" operator.";

    if (WinJS.Utilities.isPhone) {// AudioSelectorPlugin Class
        var AudioSelectorPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
            if (!(this instanceof PlayerFramework.Plugins.AudioSelectorPlugin)) {
                throw invalidConstruction;
            }

            this._menuElement = null;
            this._menuListElement = null;
            this._resumeOnHide = false;

            PlayerFramework.PluginBase.call(this, options);
        }, {
            // Public Methods
            show: function () {
                if (this._menuElement.style.display === "none") {
                    this._menuElement.style.display = "";
                    this.resumeOnHide = !this.mediaPlayer.paused;
                    if (this.resumeOnHide) {
                        this.mediaPlayer.interactiveViewModel.pause();
                    }
                }
            },

            hide: function () {
                if (this._menuElement.style.display !== "none") {
                    this._menuElement.style.display = "none";
                    if (this.resumeOnHide) {
                        this.mediaPlayer.interactiveViewModel.playResume();
                    }
                }
            },

            // Private Methods
            _setElement: function () {
                this._menuElement = PlayerFramework.Utilities.createElement(document.body, ["div", { "class": "pf-audio-menu", "style": "position: absolute; display: none" }]);
                this._menuListElement = PlayerFramework.Utilities.createElement(this._menuElement, ["select", { "class": "pf-audio-menulist" }]);
            },

            _onActivate: function () {
                this._setElement();

                this._bindEvent("audioinvoked", this.mediaPlayer, this._onMediaPlayerAudioInvoked);
                this._menuListElement.addEventListener("change", this._onMenuItemClick.bind(this), false);

                return true;
            },

            _onDeactivate: function () {
                this.hide();

                this._unbindEvent("audioinvoked", this.mediaPlayer, this._onMediaPlayerAudioInvoked);

                PlayerFramework.Utilities.removeElement(this._menuElement);
                this._menuElement = null;

                this._anchor = null;
            },

            _onMediaPlayerAudioInvoked: function (e) {
                if (this._menuElement.style.display === "none") {
                    this._updateList();
                    this.show();
                    this._menuListElement.click();
                } else {
                    this.hide();
                }
            },

            _onMenuItemClick: function (track, e) {
                var that = this;
                var option = this._menuListElement.options[this._menuListElement.selectedIndex];
                var track = option.track;

                window.setImmediate(function () {
                    that.mediaPlayer.currentAudioTrack = track;
                });
                this.hide();
            },

            _updateList: function () {
                this._menuListElement.options.length = 0;

                var tracks = this.mediaPlayer.audioTracks;
                var currentTrack = this.mediaPlayer.currentAudioTrack;
                var commands = [];

                if (tracks) {
                    for (var i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        var label = track.label;

                        if (!label && track.language) {
                            label = new Windows.Globalization.Language(track.language).displayName;
                        }

                        if (!label) {
                            label = PlayerFramework.Utilities.getResourceString("AudioTrackLabel_Untitled");
                        }

                        var command = {
                            label: (track === currentTrack) ? PlayerFramework.Utilities.formatResourceString("AudioCommandLabel_Selected", label) : PlayerFramework.Utilities.formatResourceString("AudioCommandLabel_Unselected", label),
                            track: track
                        };
                        commands.push(command);
                    }
                }

                for (var i = 0; i < commands.length; i++) {
                    var command = commands[i];
                    var _menuListItem = PlayerFramework.Utilities.createElement(this._menuListElement, ["option"]);
                    _menuListItem.innerText = command.label;
                    _menuListItem.track = command.track;
                }
            }
        });
    }
    else {
        // AudioSelectorPlugin Class
        var AudioSelectorPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
            if (!(this instanceof PlayerFramework.Plugins.AudioSelectorPlugin)) {
                throw invalidConstruction;
            }

            this._anchor = null;
            this._menuElement = null;
            this._placement = "top";
            this._alignment = "center";

            PlayerFramework.PluginBase.call(this, options);
        }, {
            // Public Properties
            placement: {
                get: function () {
                    return this._placement;
                },
                set: function (value) {
                    var oldValue = this._placement;
                    if (oldValue !== value) {
                        this._placement = value;
                        this._observableMediaPlayer.notify("placement", value, oldValue);
                    }
                }
            },

            alignment: {
                get: function () {
                    return this._alignment;
                },
                set: function (value) {
                    var oldValue = this._alignment;
                    if (oldValue !== value) {
                        this._alignment = value;
                        this._observableMediaPlayer.notify("alignment", value, oldValue);
                    }
                }
            },

            anchor: {
                get: function () {
                    return this._anchor;
                },
                set: function (value) {
                    var oldValue = this._anchor;
                    if (oldValue !== value) {
                        this._anchor = value;
                        this._observableMediaPlayer.notify("anchor", value, oldValue);
                    }
                }
            },

            // Public Methods
            show: function () {
                if (this._menuElement.winControl && this._menuElement.winControl.hidden) {
                    if (!this._anchor) {
                        this._anchor = this.mediaPlayer.element.querySelector(".pf-audioselection-anchor");
                    }
                    this._menuElement.winControl.show(this._anchor, this._placement, this._alignment);
                }
            },

            hide: function () {
                if (this._menuElement.winControl && !this._menuElement.winControl.hidden) {
                    this._menuElement.winControl.hide();
                }
            },

            // Private Methods
            _setElement: function () {
                this._menuElement = PlayerFramework.Utilities.createElement(document.body, ["div", { "class": "pf-audio-menu", "data-win-control": "WinJS.UI.Menu" }]);
                
                WinJS.UI.processAll(this._menuElement);
            },

            _onActivate: function () {
                this._setElement();

                this._bindEvent("audioinvoked", this.mediaPlayer, this._onMediaPlayerAudioInvoked);
                this._bindEvent("beforeshow", this._menuElement, this._onBeforeMenuShow);

                return true;
            },

            _onDeactivate: function () {
                this.hide();

                this._unbindEvent("audioinvoked", this.mediaPlayer, this._onMediaPlayerAudioInvoked);
                this._unbindEvent("beforeshow", this._menuElement, this._onBeforeMenuShow);

                PlayerFramework.Utilities.removeElement(this._menuElement);
                this._menuElement = null;

                this._anchor = null;
            },

            _onMediaPlayerAudioInvoked: function (e) {
                if (this._menuElement.winControl) {
                    if (this._menuElement.winControl.hidden) {
                        this.show();
                    } else {
                        this.hide();
                    }
                }
            },

            _onMenuItemClick: function (track, e) {
                var that = this;
                window.setImmediate(function () {
                    that.mediaPlayer.currentAudioTrack = track;
                });
                this.hide();
            },

            _onBeforeMenuShow: function (e) {
                var flyout = this._menuElement.winControl;
                var tracks = this.mediaPlayer.audioTracks;
                var currentTrack = this.mediaPlayer.currentAudioTrack;
                var commands = [];

                if (tracks) {
                    for (var i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        var label = track.label;

                        if (!label && track.language) {
                            label = new Windows.Globalization.Language(track.language).displayName;
                        }

                        if (!label) {
                            label = PlayerFramework.Utilities.getResourceString("AudioTrackLabel_Untitled");
                        }

                        var command = new WinJS.UI.MenuCommand();
                        command.flyout = flyout;
                        command.label = (track === currentTrack) ? PlayerFramework.Utilities.formatResourceString("AudioCommandLabel_Selected", label) : PlayerFramework.Utilities.formatResourceString("AudioCommandLabel_Unselected", label);
                        command.onclick = this._onMenuItemClick.bind(this, track);
                        commands.push(command);
                    }
                }

                flyout.commands = commands;
            }
        });
    }

    // AudioSelectorPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        AudioSelectorPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // AudioSelectorPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        AudioSelectorPlugin: AudioSelectorPlugin
    });

})(PlayerFramework);

