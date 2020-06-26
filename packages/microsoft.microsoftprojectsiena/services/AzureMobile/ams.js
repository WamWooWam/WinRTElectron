//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var TABLE_NAME_LIST_TABLE_NAME = "zz_config",
        APPLICATION_KEY_HEADER = "X-ZUMO-APPLICATION",
        API_BASE = "https://{{service_name}}.azure-mobile.net/",
        INLINE_COUNT_VALUE = "allpages",
        ROWS_PER_PAGE_COUNT = 1e3,
        MAX_PAGE_COUNT = 15,
        processQuery = function(index, data) {
            var result = AppMagic.Services.Results.createPagedSet(data, index, data.length),
                schema = AppMagic.Schema.createSchemaForArrayFromPointer(result.schema);
            return {
                    items: result.items, schema: schema
                }
        },
        AzureMobile = WinJS.Class.define(function AzureMobile_ctor(){}, {
            _serviceBaseUri: "", _serviceKey: "", configure: function(config) {
                    return this._serviceBaseUri = API_BASE.replace("{{service_name}}", config.name), this._serviceKey = config.key, !0
                }, queryTableDataSource: function(dsState) {
                    return AzureMobile.queryPage(dsState, 0, ROWS_PER_PAGE_COUNT).then(AppMagic.Services.AzureMobile.getAllPages.bind(this)).then(function(result) {
                            return result.success ? {
                                    result: result.result.items, schema: result.result.schema
                                } : {
                                    message: result.message, type: AppMagic.Services.Results.Type.error
                                }
                        })
                }, checkTableExistence: function(tableUrl, appKey) {
                    return AzureMobile.checkTableExistence(tableUrl, appKey)
                }, getTablesList: function(baseUrl, appKey) {
                    return AzureMobile.getTablesList(baseUrl, appKey)
                }
        }, {
            _getErrorResultCode: function(error) {
                return error.status === 401 && error.readyState === error.DONE ? AppMagic.Services.AmsQueryResultCode.Unauthorized : AppMagic.Services.AmsQueryResultCode.UnknownError
            }, getTablesList: function(baseUrl, appKey) {
                    var channel = new AppMagic.Services.Channel(baseUrl);
                    return appKey.length > 0 && (channel = channel.header(APPLICATION_KEY_HEADER, appKey)), channel.method("GET").path("tables").path(TABLE_NAME_LIST_TABLE_NAME).param("$filter", "(Key eq 'table') or (key eq 'table')").sendRequest().then(function(response) {
                            try {
                                var tables = JSON.parse(response.responseText);
                                return {
                                        resultCode: AppMagic.Services.AmsQueryResultCode.Success, tables: tables
                                    }
                            }
                            catch(e) {}
                            return {resultCode: AppMagic.Services.AmsQueryResultCode.UnknownError}
                        }, function(error) {
                            var resultCode = AzureMobile._getErrorResultCode(error);
                            return {resultCode: resultCode}
                        })
                }, checkTableExistence: function(tableUrl, appKey) {
                    var channel = new AppMagic.Services.Channel(tableUrl);
                    return appKey.length > 0 && channel.header(APPLICATION_KEY_HEADER, appKey), channel.method("GET").param("$inlinecount", "allpages").param("$top", 1).sendRequest().then(function() {
                            return AppMagic.Services.AmsQueryResultCode.Success
                        }, AzureMobile._getErrorResultCode)
                }, queryPage: function(dsState, skip, take) {
                    var siteUri = dsState.siteUri,
                        tableName = dsState.tableName,
                        appKey = dsState.appKey || "";
                    var channel = new AppMagic.Services.Channel(siteUri).path("tables").path(tableName).param("$inlinecount", INLINE_COUNT_VALUE).param("$skip", skip.toString()).param("$top", take.toString());
                    return appKey.length > 0 && (channel = channel.header("X-ZUMO-APPLICATION", appKey)), channel.get().then(function(data) {
                            return WinJS.Promise.wrap({
                                    success: !0, result: {
                                            data: data, dsState: dsState
                                        }
                                })
                        }, function(error) {
                            var processedError = AppMagic.Services.processError(error);
                            return WinJS.Promise.wrap({
                                    success: !1, message: processedError.message
                                })
                        })
                }, getAllPages: function(firstPage) {
                    if (!firstPage.success)
                        return WinJS.Promise.wrap({
                                success: !1, message: firstPage.message
                            });
                    if (firstPage.result.data.count <= ROWS_PER_PAGE_COUNT) {
                        var processedData = processQuery(0, firstPage.result.data.results);
                        return WinJS.Promise.wrap({
                                success: !0, result: processedData
                            })
                    }
                    var pages = Math.floor(firstPage.result.data.count / ROWS_PER_PAGE_COUNT);
                    pages > MAX_PAGE_COUNT - 1 && (pages = MAX_PAGE_COUNT - 1);
                    for (var queries = [], i = 0, len = pages; i < len; i++)
                        queries[i] = AzureMobile.queryPage(firstPage.result.dsState, (i + 1) * ROWS_PER_PAGE_COUNT, ROWS_PER_PAGE_COUNT);
                    return WinJS.Promise.join(queries).then(function(responses) {
                            var allData = [];
                            allData = allData.concat(firstPage.result.data.results);
                            for (var k = 0, klen = responses.length; k < klen; k++) {
                                var response = responses[k];
                                if (!response.success)
                                    return {
                                            success: !1, message: Core.Utility.formatString(AppMagic.Strings.ServicePagingCallFailed, response.message)
                                        };
                                allData.push.apply(allData, response.result.data.results)
                            }
                            var allResult = processQuery(0, allData);
                            return WinJS.Promise.wrap({
                                    success: !0, result: allResult
                                })
                        }, function(error) {
                            var processedError = AppMagic.Services.processError(error);
                            return WinJS.Promise.wrap({
                                    success: !1, message: processedError.message
                                })
                        })
                }
        });
    WinJS.Namespace.define("AppMagic.Services", {AzureMobile: AzureMobile})
})();