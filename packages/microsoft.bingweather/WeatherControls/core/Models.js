/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Controls.Models", {ClusterDataModel: WinJS.Class.define(function ClusterDataModel_constructor(config) {
if (!this._validateConfig(config)) {
WeatherAppJS.Controls.Utilities.interfaceException("WeatherAppJS.Controls.Models.ClusterDataModel", "invalid cluster data model configuration")
}
this._config = config
}, {
_config: null, _queryOptionsDictionary: null, _queryOptions: {get: function get() {
if (!this._queryOptionsDictionary) {
this._queryOptionsDictionary = [];
var options=this._config.queryOptions;
if (options) {
for (var key in options) {
this._queryOptionsDictionary.push(options[key])
}
}
}
return this._queryOptionsDictionary
}}, _validateConfig: function _validateConfig(config) {
if (!config || !config.query) {
return false
}
return true
}, getData: function getData(params) {
return this._config.query.apply(this, this._queryOptions)
}, cleanUp: function cleanUp() {
WeatherAppJS.Controls.Utilities.setObjectPropertiesToNull(this)
}
})})
})()