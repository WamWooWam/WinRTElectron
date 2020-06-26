//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Channel = AppMagic.Services.Channel,
        SUPPORTED_AUTH_SCHEMES = [];
    function traverseRecord(rec) {
        for (var keys = Object.keys(rec), key, val, type, i = 0, len = keys.length; i < len; i++)
            key = keys[i],
            val = rec[key],
            type = typeof val,
            val instanceof Array ? traverseTable(val) : val !== null && type === "object" && traverseRecord(val)
    }
    function traverseTable(table) {
        for (var row, i = 0, len = table.length; i < len; i++)
            row = table[i],
            (typeof row != "object" || row instanceof Array) && (row = {value: row}, table[i] = row),
            row !== null && traverseRecord(row)
    }
    function tryParseJSON(data) {
        var result = null;
        try {
            result = JSON.parse(data);
            typeof result != "object" && (result = null)
        }
        catch(e) {}
        return result
    }
    function tryParseXml(data) {
        var result;
        try {
            result = AppMagic.Services.xml2json(data);
            (typeof result != "object" || typeof result.$name != "undefined" && result.$name === "html") && (result = null)
        }
        catch(e) {
            result = null
        }
        return result
    }
    function addHeadersToChannel(channel, headerKeyValuePairs) {
        headerKeyValuePairs.forEach(function(x) {
            channel.header(x.headerKey, x.headerValue)
        })
    }
    function authenticate(channel, auth) {
        var scheme = auth.scheme;
        if (!scheme || typeof scheme != "string")
            return WinJS.Promise.wrap(channel);
        scheme = scheme.toLowerCase();
        for (var authScheme, i = 0, len = SUPPORTED_AUTH_SCHEMES.length; i < len; i++)
            if (authScheme = SUPPORTED_AUTH_SCHEMES[i], authScheme.name === scheme)
                break;
        return !authScheme || i >= len ? (auth.headerKeyValuePairs && addHeadersToChannel(channel, auth.headerKeyValuePairs), WinJS.Promise.wrap(channel)) : authScheme.fn(channel, auth)
    }
    function createChannel(uri, auth) {
        var channel = new Channel(uri).header("Accept", "application/json");
        return authenticate(channel, auth)
    }
    function processError(resp) {
        return resp.status === 404 && resp.readyState === resp.DONE ? AppMagic.Services.Results.createError(AppMagic.Strings.RESTError404) : AppMagic.Services.processError(resp)
    }
    var Rest = WinJS.Class.define(function Rest_ctor(){}, {
            configure: function(config) {
                return !0
            }, queryEndpoint: function(dsState) {
                    var endpoint = dsState.endpoint,
                        auth = dsState.auth || {};
                    return createChannel(endpoint, auth).then(function(channel) {
                            return channel.get().then(Rest.processData, processError)
                        }).then(null, function(err) {
                            return AppMagic.Services.Results.createError(err)
                        })
                }
        }, {processData: function(result) {
                var parsedResult;
                if (typeof result == "object" ? parsedResult = result : (parsedResult = tryParseJSON(result), parsedResult === null && (parsedResult = tryParseXml(result))), parsedResult === null || typeof parsedResult != "object")
                    return {
                            items: [], schema: AppMagic.Schema.createSchemaForArrayFromPointer([])
                        };
                var createInferredSchemaFn,
                    correctDataWithSchemaFn,
                    createSchemaFn;
                parsedResult instanceof Array ? (createInferredSchemaFn = AppMagic.Utility.createInferredSchemaFromArray, correctDataWithSchemaFn = AppMagic.Services.Results.correctArrayWithSchema, createSchemaFn = AppMagic.Schema.createSchemaForArrayFromPointer) : (createInferredSchemaFn = AppMagic.Utility.createInferredSchemaFromObject, correctDataWithSchemaFn = AppMagic.Services.Results.correctObjectWithSchema, createSchemaFn = AppMagic.Schema.createSchemaForObjectFromPointer);
                var schemaDictionary = createInferredSchemaFn(parsedResult);
                var nameRemapping = AppMagic.Services.Results.correctSchemaDictionaryAndCreateNameRemapping(schemaDictionary);
                correctDataWithSchemaFn(parsedResult, schemaDictionary, nameRemapping);
                var schemaPointer = AppMagic.Utility.flattenSchema(schemaDictionary),
                    schema = createSchemaFn(schemaPointer);
                return {
                        result: parsedResult, schema: schema
                    }
            }});
    WinJS.Namespace.define("AppMagic.Services", {Rest: Rest})
})();