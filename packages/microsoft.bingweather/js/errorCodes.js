﻿/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.ErrorCodes", {
SettingsManager: {
PARSE_ERROR: 1000, FAVORITES_MAX_LIMIT_REACHED: 1001, FAVORITE_ALREADY_EXISTS: 1002, INVALID_LOCATION: 1003, FAVORITE_DOES_NOT_EXIST: 1004, NOT_A_RECENT_LOCATION: 1005, LOCATION_ALREADY_A_FAVORITE: 1006, LOCATION_ALREADY_A_DEFAULT: 1007, UNKNOWN_SETTING_ERROR: 1008, SEARCH_HISTORY_DISABLED: 1009, LOCATION_PINNED_TO_START: 1010, PINNED_MAX_LIMIT_REACHED: 1011
}, LocationTracking: {
LOCATION_DETECTION_FAILED: 1100, NO_WEATHER_DATA: 1101, LOCATION_TRACKING_DISABLED: 1102, NO_INTERNET_CONNECTION: 1103
}
})
})()