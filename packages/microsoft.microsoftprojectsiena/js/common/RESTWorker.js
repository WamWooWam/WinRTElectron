//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var SupportedHttpVerbs = AppMagic.Services.Constants.HttpRequest.SupportedHttpVerbs,
        BooleanDTypeMap = {boolean: "b"},
        NumberDTypeMap = {
            color: "c", currency: "$", date: "d", number: "n"
        },
        StringDTypeMap = {
            hyperlink: "h", image: "i", media: "m", string: "s"
        },
        OperationAbortedError = {number: -2147467260},
        AccessIsDeniedError = {number: -2147024891},
        CannotLocateResourceError = {number: -2146697211};
    function initializeDTypeMap(map) {
        var mapKeys = Object.keys(map);
        mapKeys.forEach(function(x) {
            DTypeMap[x] = map[x]
        })
    }
    var DTypeMap = {};
    initializeDTypeMap(BooleanDTypeMap);
    initializeDTypeMap(NumberDTypeMap);
    initializeDTypeMap(StringDTypeMap);
    function isDType(type) {
        return typeof DTypeMap[type] != "undefined"
    }
    function isArray(type, typeNameToTypeDefinition) {
        return typeNameToTypeDefinition[type].type === "array"
    }
    function isDataCorrectType(data, dtype) {
        var type;
        switch (typeof data) {
            case"boolean":
                type = typeof BooleanDTypeMap[dtype];
                break;
            case"number":
                type = typeof NumberDTypeMap[dtype];
                break;
            case"string":
                type = typeof StringDTypeMap[dtype];
                break;
            case"object":
                return data === null;
            default:
                return !1
        }
        return type !== "undefined"
    }
    function compareErrors(err0, err1) {
        return typeof err0 == "object" && typeof err1 == "object" && err0.number === err1.number
    }
    function channelErrorHandler(error) {
        if (compareErrors(error, OperationAbortedError) || compareErrors(error, CannotLocateResourceError) || compareErrors(error, AccessIsDeniedError))
            return {
                    success: !1, message: error.message
                };
        if (typeof error.DONE != "undefined" && error.status === 0 && error.readyState === error.DONE)
            return {
                    success: !1, message: AppMagic.Strings.RESTNetworkError
                };
        var failResult = {success: !1};
        if (typeof error.responseText == "string") {
            var message = error.responseText,
                constants = AppMagic.Constants.Services.Rest,
                contentType = error.getResponseHeader(constants.ResponseHeaderContentType);
            if (contentType !== null && contentType.indexOf(constants.ContentTypeTextHTML) >= 0)
                try {
                    message = AppMagic.Services.stripHtml(message)
                }
                catch(e) {}
            failResult.message = message
        }
        else
            failResult.message = error.status ? Core.Utility.formatString(AppMagic.Strings.RESTHttpErrorReturnedFormat, error.status) : AppMagic.Strings.RESTHttpErrorReturned;
        return failResult
    }
    var RESTWorker = WinJS.Class.define(function RESTWorker_ctor(typesByPrefix) {
            this._typesByPrefixAndName = new AppMagic.Services.TypesByPrefixAndName(typesByPrefix)
        }, {
            _typesByPrefixAndName: null, sendHttp: function(parameters) {
                    return RESTWorker.sendHttp(parameters.url, parameters.method, parameters.headers, parameters.queryStringParameters, parameters.body).then(function(response) {
                            return {
                                    success: !0, result: {responseText: response.responseText}
                                }
                        }, channelErrorHandler)
                }, sendHttpAndParse: function(parameters) {
                    var constants = AppMagic.Constants.Services.Rest,
                        responseType,
                        responseBody = parameters.response[constants.ResponseKey_Body];
                    if (typeof responseBody != "undefined")
                        switch (responseBody[constants.ResponseBodyKey_MediaType]) {
                            case constants.MediaType.Image:
                            case constants.MediaType.Audio:
                                responseType = AppMagic.Services.Channel.ResponseTypeArrayBuffer;
                                break
                        }
                    return RESTWorker.sendHttp(parameters.url, parameters.method, parameters.headers, parameters.queryStringParameters, parameters.body, responseType).then(function(response) {
                            return RESTWorker.parseResponse(response, parameters.response, this._typesByPrefixAndName)
                        }.bind(this), channelErrorHandler)
                }
        }, {
            sendHttp: function(url, method, headers, queryStringParameters, body, responseType) {
                var channel = new AppMagic.Services.Channel(url);
                headers && Object.keys(headers).forEach(function(x) {
                    channel.header(x, headers[x])
                });
                queryStringParameters && Object.keys(queryStringParameters).forEach(function(x) {
                    channel.param(x, queryStringParameters[x])
                });
                responseType && channel.responseType(responseType);
                var bodyBlob = new Blob(body);
                return channel.send(method, typeof body == "undefined" || bodyBlob.size === 0 ? null : bodyBlob)
            }, parseResponse: function(response, responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest;
                    return WinJS.Promise.wrap().then(function() {
                            var resultForm = responseDef[constants.ResponseKey_ResultForm];
                            switch (resultForm) {
                                case constants.ResultForm.Void:
                                    return RESTWorker.parseResponseToResultForm_Void();
                                case constants.ResultForm.Self:
                                    return RESTWorker.parseResponseToResultForm_Self(response, responseDef, typesByPrefixAndName);
                                case constants.ResultForm.Single:
                                    return RESTWorker.parseResponseToResultForm_Single(response, responseDef, typesByPrefixAndName);
                                case constants.ResultForm.Aggregate:
                                    return RESTWorker.parseResponseToResultForm_Aggregate(response, responseDef, typesByPrefixAndName);
                                default:
                                    return null
                            }
                        }).then(null, function(error) {
                            return {
                                    success: !1, message: "Unknown error"
                                }
                        })
                }, parseResponseToResultForm_Void: function() {
                    return {
                            success: !0, result: !0
                        }
                }, parseResponseToResultForm_Self: function(response, responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        bodyDef = responseDef[constants.ResponseKey_Body];
                    var expectedMediaType = bodyDef[constants.ResponseBodyKey_MediaType];
                    switch (expectedMediaType) {
                        case constants.MediaType.Image:
                        case constants.MediaType.Audio:
                            var contentType = (response.getResponseHeader("content-type") || "").toLowerCase();
                            return AppMagic.Services.isExpectedMediaType(expectedMediaType, contentType) && response.response instanceof ArrayBuffer && response.response.byteLength > 0 ? {
                                    success: !0, result: {
                                            data: response.response, contentType: contentType
                                        }
                                } : {
                                    success: !1, message: AppMagic.Strings.RESTUnableToParseResponse
                                };
                        case constants.MediaType.Json:
                            var responseAsJson;
                            try {
                                responseAsJson = JSON.parse(response.responseText)
                            }
                            catch(e) {
                                return {
                                        success: !1, message: AppMagic.Strings.RESTExpectedJson
                                    }
                            }
                            var fitted = RESTWorker.fitJsonValueToType(responseAsJson, bodyDef, typesByPrefixAndName);
                            return typeof fitted == "undefined" && (fitted = null), {
                                    success: !0, result: fitted
                                };
                        case constants.MediaType.Xml:
                            return RESTWorker.parseSelfXml(response, responseDef, typesByPrefixAndName);
                        default:
                            return null
                    }
                    return null
                }, parseSelfXml: function(response, responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        bodyDef = responseDef[constants.ResponseKey_Body];
                    var typeDef = typesByPrefixAndName.getTypeDefinition(bodyDef),
                        defType = typeDef[constants.TypeDefinitionKey_DefType];
                    switch (defType) {
                        case constants.DefinitionType_SampleXmlElement:
                            return RESTWorker.parseSelfXmlSampleXmlElement(response, typeDef);
                        default:
                            break
                    }
                    return null
                }, parseSelfXmlSampleXmlElement: function(response, typeDef) {
                    var xmlToJsonResult = RESTWorker.parseXmlToJsonWithSchemaInfo(response.responseText);
                    if (!xmlToJsonResult.success)
                        return xmlToJsonResult;
                    var constants = AppMagic.Constants.Services.Rest,
                        sampleXml = typeDef[constants.SampleXmlElementDefinitionKey_SampleXml];
                    var sampleXmlToJsonResult = RESTWorker.parseXmlToJsonWithSchemaInfo(sampleXml);
                    return RESTWorker.fitXmlToTargetSchema(xmlToJsonResult.xmlAsJson, xmlToJsonResult.xmlSchemaDict, sampleXmlToJsonResult.xmlSchemaDict), {
                            success: !0, result: xmlToJsonResult.xmlAsJson
                        }
                }, parseXmlToJsonWithSchemaInfo: function(xmlText) {
                    var xmlAsJson;
                    try {
                        if (xmlText.length > 0)
                            xmlAsJson = AppMagic.Services.xml2json(xmlText);
                        else
                            throw new Error;
                    }
                    catch(e) {
                        return {
                                success: !1, message: AppMagic.Strings.RESTUnableToParseXml
                            }
                    }
                    var createInferredSchemaFn = AppMagic.Utility.createInferredSchemaFromObject,
                        correctDataWithSchemaFn = AppMagic.Services.Results.correctObjectWithSchema,
                        schemaDictionary = createInferredSchemaFn(xmlAsJson);
                    var nameRemapping = AppMagic.Services.Results.correctSchemaDictionaryAndCreateNameRemapping(schemaDictionary);
                    return correctDataWithSchemaFn(xmlAsJson, schemaDictionary, nameRemapping), {
                            success: !0, xmlAsJson: xmlAsJson, xmlSchemaDict: schemaDictionary
                        }
                }, parseResponseToResultForm_Single: function(response, responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        bodyDef = responseDef[constants.ResponseKey_Body];
                    var mediaType = bodyDef[constants.ResponseBodyKey_MediaType];
                    switch (mediaType) {
                        case constants.MediaType.Json:
                            return RESTWorker.parseSingleJson(response, responseDef, typesByPrefixAndName);
                        case constants.MediaType.Xml:
                            return {
                                    success: !0, result: response.responseText
                                };
                        default:
                            break
                    }
                    return null
                }, parseSingleJson: function(response, responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        responseAsJson;
                    try {
                        responseAsJson = JSON.parse(response.responseText)
                    }
                    catch(e) {
                        return {
                                success: !1, message: AppMagic.Strings.RESTExpectedJson
                            }
                    }
                    var paramDef = responseDef[constants.ResponseKey_Body][constants.SingleBodyKey_Param],
                        parsedJsonValue = RESTWorker.parseJsonParamDef(paramDef, responseAsJson, typesByPrefixAndName, !1);
                    return {
                            success: !0, result: parsedJsonValue
                        }
                }, parseJsonParamDef: function(paramDef, responseAsJson, typesByPrefixAndName, shouldClone) {
                    var constants = AppMagic.Constants.Services.Rest,
                        jsonPointer = paramDef[constants.JsonBodyParamKey_JsonPointer];
                    var dataValue = AppMagic.Utility.getJsonValueViaJsonPointer(responseAsJson, jsonPointer);
                    if (typeof dataValue == "undefined")
                        return null;
                    shouldClone && (dataValue = JSON.parse(JSON.stringify(dataValue)));
                    var fittedValue = RESTWorker.fitJsonValueToType(dataValue, paramDef, typesByPrefixAndName);
                    return typeof fittedValue == "undefined" && (fittedValue = null), fittedValue
                }, fitJsonValueToType: function(jsonValue, propertyDef, typesByPrefixAndName) {
                    var dummyNode = {},
                        dummyProperty = "dummy";
                    dummyNode[dummyProperty] = jsonValue;
                    var typeDef = typesByPrefixAndName.getTypeDefinition(propertyDef);
                    return RESTWorker.fitJsonNodePropertyToType(dummyNode, dummyProperty, typeDef, typesByPrefixAndName), dummyNode[dummyProperty]
                }, parseResponseToResultForm_Aggregate: function(response, responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        bodyDef = responseDef[constants.ResponseKey_Body];
                    var mediaType = bodyDef[constants.ResponseBodyKey_MediaType];
                    switch (mediaType) {
                        case constants.MediaType.Json:
                            return RESTWorker.parseAggregateJson(response, responseDef, typesByPrefixAndName);
                        case constants.MediaType.Xml:
                            return {
                                    success: !0, result: response.responseText
                                };
                        default:
                            break
                    }
                    return null
                }, parseAggregateJson: function(response, responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        responseAsJson;
                    try {
                        responseAsJson = JSON.parse(response.responseText)
                    }
                    catch(e) {
                        return {
                                success: !1, message: AppMagic.Strings.RESTExpectedJson
                            }
                    }
                    var aggregateObject = {},
                        paramsDef = responseDef[constants.ResponseKey_Body][constants.AggregateBodyKey_Params],
                        paramKeys = Object.keys(paramsDef);
                    return paramKeys.forEach(function(paramKey) {
                            var paramDef = paramsDef[paramKey],
                                parsedJsonValue = RESTWorker.parseJsonParamDef(paramDef, responseAsJson, typesByPrefixAndName, !0);
                            aggregateObject[paramKey] = parsedJsonValue
                        }), {
                            success: !0, result: aggregateObject
                        }
                }, fitJsonNodePropertyToType: function(node, indexOrPropertyName, typeDef, typesByPrefixAndName) {
                    var IRConstants = AppMagic.Services.ServiceConfigDeserialization.IRConstants;
                    switch (typeDef[AppMagic.Constants.Services.Rest.TypeDefinitionKey_DefType]) {
                        case IRConstants.DefTypes.JsonArray:
                            return RESTWorker.fitJsonNodePropertyToType_JsonArray(node, indexOrPropertyName, typeDef, typesByPrefixAndName);
                        case IRConstants.DefTypes.JsonMapObject:
                            return RESTWorker.fitJsonNodePropertyToType_JsonMapObject(node, indexOrPropertyName, typeDef, typesByPrefixAndName);
                        case IRConstants.DefTypes.JsonObject:
                            return RESTWorker.fitJsonNodePropertyToType_JsonObject(node, indexOrPropertyName, typeDef, typesByPrefixAndName);
                        case IRConstants.DefTypes.JsonBase64Binary:
                            return RESTWorker.fitJsonNodePropertyToType_JsonBase64Binary(node, indexOrPropertyName, typeDef);
                        case IRConstants.DefTypes.JsonPrimitive:
                            return RESTWorker.fitJsonNodePropertyToType_JsonPrimitive(node, indexOrPropertyName, typeDef);
                        default:
                            break
                    }
                    return null
                }, fitJsonNodePropertyToType_JsonBase64Binary: function(node, indexOrPropertyName, typeDef) {
                    var tvalue = node[indexOrPropertyName];
                    if (tvalue !== null && typeof tvalue != "undefined") {
                        var ttype = new AppMagic.Services.TypeSystem.JsonBase64BinaryTType(typeDef.mediatype),
                            dvalue = ttype.convertToDValue(tvalue);
                        dvalue === null ? delete node[indexOrPropertyName] : node[indexOrPropertyName] = dvalue
                    }
                }, fitJsonNodePropertyToType_JsonPrimitive: function(node, indexOrPropertyName, typeDef) {
                    if (node[indexOrPropertyName] !== null) {
                        var dtype = typeDef.dtype;
                        if (typeof dtype == "undefined") {
                            var IRConstants = AppMagic.Services.ServiceConfigDeserialization.IRConstants;
                            switch (typeDef.primitive) {
                                case IRConstants.JsonPrimitives.Boolean:
                                    dtype = AppMagic.Schema.TypeBoolean;
                                    break;
                                case IRConstants.JsonPrimitives.Number:
                                    dtype = AppMagic.Schema.TypeNumber;
                                    break;
                                case IRConstants.JsonPrimitives.String:
                                    dtype = AppMagic.Schema.TypeString;
                                    break;
                                default:
                                    return
                            }
                        }
                        switch (dtype) {
                            case AppMagic.Schema.TypeString:
                            case AppMagic.Schema.TypeHyperlink:
                            case AppMagic.Schema.TypeImage:
                            case AppMagic.Schema.TypeMedia:
                                typeof node[indexOrPropertyName] != "string" && delete node[indexOrPropertyName];
                                break;
                            case AppMagic.Schema.TypeNumber:
                                typeof node[indexOrPropertyName] != "number" && delete node[indexOrPropertyName];
                                break;
                            case AppMagic.Schema.TypeBoolean:
                                typeof node[indexOrPropertyName] != "boolean" && delete node[indexOrPropertyName];
                                break;
                            default:
                                break
                        }
                    }
                }, fitJsonNodePropertyToType_JsonArray: function(node, indexOrPropertyName, typeDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        arrayProperty = node[indexOrPropertyName];
                    if (arrayProperty !== null) {
                        if (!(arrayProperty instanceof Array)) {
                            delete node[indexOrPropertyName];
                            return
                        }
                        for (var itemTypeDef = typesByPrefixAndName.getTypeDefinition(typeDef[constants.JsonArrayDefinitionKey_Items]), i = 0, len = arrayProperty.length; i < len; i++)
                            if (RESTWorker.fitJsonNodePropertyToType(arrayProperty, i, itemTypeDef, typesByPrefixAndName), typeof arrayProperty[i] == "undefined")
                                arrayProperty[i] = null;
                            else {
                                var itemDefType = itemTypeDef[constants.TypeDefinitionKey_DefType];
                                if (itemDefType !== constants.DefinitionType_JsonObject && itemDefType !== constants.DefinitionType_JsonMapObject) {
                                    var obj = {};
                                    obj.Value = arrayProperty[i];
                                    arrayProperty[i] = obj
                                }
                            }
                    }
                }, fitJsonNodePropertyToType_JsonMapObject: function(node, indexOrPropertyName, typeDef, typesByPrefixAndName) {
                    var mapObjectProperty = node[indexOrPropertyName];
                    if (mapObjectProperty !== null) {
                        if (typeof mapObjectProperty != "object" || mapObjectProperty instanceof Array) {
                            delete node[indexOrPropertyName];
                            return
                        }
                        var constants = AppMagic.Constants.Services.Rest,
                            keyName = typeDef[constants.JsonMapObjectDefinitionKey_Keys][constants.JsonMapObjectDefinitionKeysKey_FieldName],
                            valuesDef = typeDef[constants.JsonMapObjectDefinitionKey_Values],
                            valName = valuesDef[constants.JsonMapObjectDefinitionValuesKey_FieldName],
                            valTypeDef = typesByPrefixAndName.getTypeDefinition(valuesDef),
                            arrayified = [];
                        Object.keys(mapObjectProperty).forEach(function(key) {
                            var arrayItem = {};
                            arrayItem[keyName] = key;
                            RESTWorker.fitJsonNodePropertyToType(mapObjectProperty, key, valTypeDef, typesByPrefixAndName);
                            typeof mapObjectProperty[key] == "undefined" && (mapObjectProperty[key] = null);
                            arrayItem[valName] = mapObjectProperty[key];
                            arrayified.push(arrayItem)
                        });
                        node[indexOrPropertyName] = arrayified
                    }
                }, fitJsonNodePropertyToType_JsonObject: function(node, indexOrPropertyName, typeDef, typesByPrefixAndName) {
                    var objectProperty = node[indexOrPropertyName];
                    if (objectProperty !== null) {
                        if (typeof objectProperty != "object" || objectProperty instanceof Array) {
                            delete node[indexOrPropertyName];
                            return
                        }
                        var constants = AppMagic.Constants.Services.Rest,
                            propertiesDef = typeDef[constants.JsonObjectDefinitionKey_Properties];
                        Object.keys(objectProperty).forEach(function(propertyName) {
                            if (typeof propertiesDef[propertyName] == "undefined") {
                                delete objectProperty[propertyName];
                                return
                            }
                            var childTypeDef = typesByPrefixAndName.getTypeDefinition(propertiesDef[propertyName]);
                            RESTWorker.fitJsonNodePropertyToType(objectProperty, propertyName, childTypeDef, typesByPrefixAndName);
                            typeof objectProperty[propertyName] == "undefined" && (objectProperty[propertyName] = null)
                        })
                    }
                }, fitXmlToTargetSchema: function(obj, srcSchemaDictionary, targetSchemaDictionary) {
                    if (obj !== null)
                        for (var objKeys = Object.keys(obj), i = 0, len = objKeys.length; i < len; i++) {
                            var objKey = objKeys[i],
                                targetSchemaItem = targetSchemaDictionary[objKey];
                            if (typeof targetSchemaItem == "undefined")
                                delete obj[objKey];
                            else {
                                var objValue = obj[objKey],
                                    srcSchemaItem = srcSchemaDictionary[objKey];
                                srcSchemaItem.type !== targetSchemaItem.type ? srcSchemaItem.type === AppMagic.Schema.TypeObject && targetSchemaItem.type === AppMagic.Schema.TypeArray ? (RESTWorker.fitXmlToTargetSchema(obj[objKey], srcSchemaItem.ptr, targetSchemaItem.ptr), obj[objKey] = [obj[objKey]]) : delete obj[objKey] : targetSchemaItem.type === "array" ? objValue.forEach(function(x) {
                                    RESTWorker.fitXmlToTargetSchema(x, srcSchemaItem.ptr, targetSchemaItem.ptr)
                                }) : targetSchemaItem.type === "object" && RESTWorker.fitXmlToTargetSchema(objValue, srcSchemaItem.ptr, targetSchemaItem.ptr)
                            }
                        }
                }
        });
    WinJS.Namespace.define("AppMagic.Worker", {RESTWorker: RESTWorker})
})();