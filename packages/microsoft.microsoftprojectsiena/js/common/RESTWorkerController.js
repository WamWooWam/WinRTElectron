//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var CannotLocateResourceError = {
            description: AppMagic.Strings.CannotLocateResourceErrorDescription, message: AppMagic.Strings.CannotLocateResourceErrorMessage, number: -2146697211
        };
    function areErrorsSame(err0, err1) {
        return err0.description === err1.description && err0.message === err1.message && err0.number === err1.number
    }
    var ComplexTypeArray = AppMagic.Schema.TypeArray,
        ComplexTypeObject = AppMagic.Schema.TypeObject,
        AcceptedComplexTypes = [ComplexTypeArray, ComplexTypeObject],
        DTypeMap = {
            boolean: AppMagic.Schema.TypeBoolean, color: "c", currency: "$", date: "d", hyperlink: "h", image: AppMagic.Schema.TypeImage, number: AppMagic.Schema.TypeNumber, media: AppMagic.Schema.TypeMedia, string: AppMagic.Schema.TypeString
        },
        SupportedResponseDTypes = [AppMagic.Schema.TypeBoolean, AppMagic.Schema.TypeNumber, AppMagic.Schema.TypeString, ],
        ForbiddenTypeNames = Object.keys(DTypeMap);
    ForbiddenTypeNames.unshift("");
    var ForbiddenFieldNames = ["", "_id", AppMagic.Constants.Services.SpIdProperty],
        ForbiddenParameterNames = [""],
        OAuthTokenParamReplacementToken = "{access_token}",
        OpNameSendHttpAndParse = "sendHttpAndParse",
        OpNameSendHttp = "sendHttp",
        RequestBodyMediaType = {
            XWwwFormUrlEncoded: "application/x-www-form-urlencoded", Json: "application/json", MultipartFormData: "multipart/form-data"
        },
        HeaderKeyContentType = "content-type",
        HeaderKeyBoundary = "boundary",
        HeaderContentDisposition = "Content-Disposition",
        HeaderFormDataValue = "form-data",
        HeaderNameValue = "name",
        HeaderFileName = "filename",
        RequestBodyKeyMediaType = "mediatype",
        RequestBodyJsonParamKeyPath = "path",
        XsdTypesThanCanBeProjectedToString = [AppMagic.Constants.Services.Rest.XsdType.Boolean, AppMagic.Constants.Services.Rest.XsdType.Int, AppMagic.Constants.Services.Rest.XsdType.Long, AppMagic.Constants.Services.Rest.XsdType.UnsignedInt, AppMagic.Constants.Services.Rest.XsdType.UnsignedLong, AppMagic.Constants.Services.Rest.XsdType.Decimal, AppMagic.Constants.Services.Rest.XsdType.Float, AppMagic.Constants.Services.Rest.XsdType.Double, AppMagic.Constants.Services.Rest.XsdType.String, ],
        XsdNumberTypesThatCanBeProjectedToString = [AppMagic.Constants.Services.Rest.XsdType.Int, AppMagic.Constants.Services.Rest.XsdType.Long, AppMagic.Constants.Services.Rest.XsdType.UnsignedInt, AppMagic.Constants.Services.Rest.XsdType.UnsignedLong, AppMagic.Constants.Services.Rest.XsdType.Decimal, AppMagic.Constants.Services.Rest.XsdType.Float, ],
        ParameterMapItemKeyValue = "value",
        ParameterMapItemKeyDType = "dtype",
        RESTWorkerController = WinJS.Class.define(function RESTWorkerController_ctor(disp, multipartFormDataHelper) {
            this._disp = disp;
            this._service = null;
            this._multipartFormDataHelper = multipartFormDataHelper
        }, {
            _disp: null, _service: null, _fns: null, _functionDict: null, _multipartFormDataHelper: null, typesByPrefixAndName: {get: function() {
                        return this._service.typesByPrefixAndName
                    }}, _workerHandle: null, _hiddenFunctionDict: null, functions: {get: function() {
                        return this._fns
                    }}, getFunctionInfo: function(functionName) {
                    return this._functionDict[functionName]
                }, getHiddenFunctionInfo: function(functionName) {
                    return this._hiddenFunctionDict[functionName]
                }, terminate: function() {
                    this._workerHandle.destroyWorker()
                }, initialize: function(service) {
                    this._service = service;
                    Core.Utility.isDefined(service.functions) && this._generateFunctions();
                    this._workerHandle = this._disp.createWorker(["AppMagic", "Worker", "RESTWorker"], [this._service.serviceDefinition.typesbyprefix], [AppMagic.IO.Path.getFullPath("js/common/RESTWorker.js")])
                }, _isFunctionDefined: function(functionName) {
                    return typeof this._functionDict[functionName] == "object"
                }, _generateFunctions: function() {
                    for (var constants = AppMagic.Constants.Services.Rest, hiddenFns = [], fns = [], fnNames = Object.keys(this._service.functions), i = 0; i < fnNames.length; i++) {
                        var serviceFunction = this._service.functions[fnNames[i]];
                        var functionDef = serviceFunction.functionDefinition;
                        var requiredParameters = serviceFunction.parameters.filter(function(p) {
                                return p.isRequired
                            }),
                            optionalParameters = serviceFunction.parameters.filter(function(p) {
                                return !p.isRequired
                            });
                        if (serviceFunction.isHiddenFromRules)
                            hiddenFns.push({
                                serviceFunction: serviceFunction, name: serviceFunction.name, requiredParameters: requiredParameters, optionalParameters: optionalParameters, fn: this._createInvoke(OpNameSendHttpAndParse, requiredParameters, optionalParameters, functionDef)
                            });
                        else {
                            var responseSchema = serviceFunction.computeResultSchema(RESTWorkerController.MaxSchemaDepth);
                            var responseSchemaString = AppMagic.Schema.getSchemaString(responseSchema);
                            fns.push({
                                serviceFunction: serviceFunction, name: serviceFunction.name, requiredParameters: requiredParameters, optionalParameters: optionalParameters, fn: this._createInvoke(OpNameSendHttpAndParse, requiredParameters, optionalParameters, functionDef), disableTryIt: serviceFunction.disableTryIt, schema: responseSchema, schemaString: responseSchemaString, docId: serviceFunction.docId, isBehaviorOnly: serviceFunction.isBehaviorOnly
                            })
                        }
                    }
                    var util = AppMagic.Utility;
                    util.createPrivateImmutable(this, "_functionDict", {});
                    fns.forEach(function(fnObj) {
                        util.createPrivateImmutable(this._functionDict, fnObj.name, fnObj)
                    }, this);
                    util.createPrivateImmutable(this, "_fns", fns);
                    util.createPrivateImmutable(this, "_hiddenFunctionDict", {});
                    hiddenFns.forEach(function(fnObj) {
                        util.createPrivateImmutable(this._hiddenFunctionDict, fnObj.name, fnObj)
                    }, this)
                }, sendHttpAndParse: function(url, method, headers, queryStringParameters, body, responseDef) {
                    var params = {};
                    return params.url = url, params.method = method, params.headers = headers, params.queryStringParameters = queryStringParameters, params.body = body, params.response = responseDef, this._invokeHttpOp(OpNameSendHttpAndParse, params)
                }, sendHttp: function(url, method, headers, queryStringParameters, body) {
                    var params = {};
                    return params.url = url, params.method = method, params.headers = headers, params.queryStringParameters = queryStringParameters, params.body = body, this._invokeHttpOp(OpNameSendHttp, params)
                }, _invokeHttpOp: function(opName, params) {
                    return this._invokeWorker(opName, [params]).then(function(response) {
                            return response.success ? response.result : response
                        }, function(error) {
                            if (Core.Utility.isCanceledError(error))
                                throw error;
                            throw error;
                        })
                }, _createInvoke: function(op, requiredParams, optionalParams, functionDef) {
                    var that = this;
                    var rcount = requiredParams.length,
                        ocount = optionalParams.length,
                        tcount = rcount + (optionalParams.length > 0 ? 1 : 0);
                    return function(functionArguments, auth) {
                            for (var arg, val, parameterMap = {}, i = 0; i < rcount; i++)
                                arg = requiredParams[i],
                                val = functionArguments[i],
                                parameterMap[arg.name] = {},
                                parameterMap[arg.name][ParameterMapItemKeyValue] = val,
                                parameterMap[arg.name][ParameterMapItemKeyDType] = arg.dtypeOld;
                            if (ocount > 0) {
                                var opt = functionArguments[rcount] || {};
                                for (i = 0; i < ocount; i++)
                                    arg = optionalParams[i],
                                    val = opt[arg.name],
                                    typeof val != "undefined" && val !== null && (parameterMap[arg.name] = {}, parameterMap[arg.name][ParameterMapItemKeyValue] = val, parameterMap[arg.name][ParameterMapItemKeyDType] = arg.dtypeOld)
                            }
                            var params = {};
                            params.url = RESTWorkerController.buildUrl(functionDef.request.url, parameterMap);
                            params.method = functionDef.request.method.toUpperCase();
                            params.headers = {};
                            var createRequestAndInvoke = function() {
                                    RESTWorkerController.buildListedKeyValueMap(params.headers, functionDef.request.headers, parameterMap, !0);
                                    params.queryStringParameters = {};
                                    RESTWorkerController.buildListedKeyValueMap(params.queryStringParameters, functionDef.request.querystringparameters, parameterMap, !1);
                                    params.response = functionDef.response;
                                    var constants = AppMagic.Constants.Services;
                                    if (auth !== null && auth.type === constants.AuthTypeNames.OAuth2) {
                                        var tokenValue = auth.tokenFormat.replace(/\{access_token\}\\?/, auth.accessToken);
                                        switch (auth.accessTokenStyle) {
                                            case constants.OAuth2AccessTokenStyle.Header:
                                                typeof params.headers[auth.tokenKey] == "undefined" && (params.headers[auth.tokenKey] = tokenValue);
                                                break;
                                            case constants.OAuth2AccessTokenStyle.Query:
                                                typeof params.queryStringParameters[auth.tokenKey] == "undefined" && (params.queryStringParameters[auth.tokenKey] = tokenValue);
                                                break;
                                            default:
                                                break
                                        }
                                    }
                                    return that._invokeWorker(op, [params]).then(function(response) {
                                            return RESTWorkerController.postWorkerProcess(functionDef, response, that._service.typesByPrefixAndName)
                                        }, function(error) {
                                            if (Core.Utility.isCanceledError(error))
                                                throw error;
                                            throw error;
                                        })
                                },
                                restConstants = AppMagic.Constants.Services.Rest,
                                bodyDef = functionDef[restConstants.FunctionKey_Request][restConstants.RequestKey_Body];
                            return bodyDef ? that.buildRequestBodyAsync(bodyDef, parameterMap, params.headers).then(function(response) {
                                    return response.success ? (params.body = response.result, createRequestAndInvoke()) : response
                                }) : WinJS.Promise.wrap().then(createRequestAndInvoke)
                        }
                }, _invokeWorker: function(op, parameters) {
                    return this._workerHandle.invokeWorker(op, parameters)
                }, buildRequestBodyAsync: function(bodyDef, parameterMap, headersMap) {
                    var retval;
                    switch (bodyDef[RequestBodyKeyMediaType]) {
                        case RequestBodyMediaType.XWwwFormUrlEncoded:
                            headersMap[HeaderKeyContentType] = RequestBodyMediaType.XWwwFormUrlEncoded;
                            retval = RESTWorkerController.buildRequestBodyXWwwFormUrlEncoded(bodyDef, parameterMap);
                            break;
                        case RequestBodyMediaType.Json:
                            headersMap[HeaderKeyContentType] = RequestBodyMediaType.Json;
                            retval = RESTWorkerController.buildRequestBodyJson(bodyDef, parameterMap);
                            break;
                        case RequestBodyMediaType.MultipartFormData:
                            return this.buildRequestBodyMultipartFormDataAsync(bodyDef, parameterMap, headersMap);
                        default:
                            break
                    }
                    return WinJS.Promise.wrap({
                            success: !0, result: retval
                        })
                }, buildRequestBodyMultipartFormDataAsync: function(bodyDef, parameterMap, headersMap) {
                    var constants = AppMagic.Constants.Services.Rest,
                        bodyParams = bodyDef[constants.RequestBodyMultipartFormDataKey_Params],
                        boundaryValue = this._multipartFormDataHelper.generateUID();
                    headersMap[HeaderKeyContentType] = RequestBodyMediaType.MultipartFormData + "; " + HeaderKeyBoundary + '="' + boundaryValue + '"';
                    for (var formParameters = [], len = bodyParams.length, promises = [], i = 0; i < len; i++) {
                        var parameter = bodyParams[i];
                        var promise = this.buildFormData(formParameters, parameter, parameterMap, boundaryValue);
                        promises.push(promise)
                    }
                    return WinJS.Promise.join(promises).then(function(responses) {
                            var failedParameters = [];
                            for (i = 0, len = responses.length; i < len; i++)
                                responses[i].success || failedParameters.push(responses[i].detail);
                            if (failedParameters.length > 0) {
                                var listOfFailed = Core.Utility.formatString(AppMagic.Strings.RestErrorUnableToGetSourcesListFirstItem, failedParameters[0]);
                                for (i = 1, len = failedParameters.length; i < len; i++)
                                    listOfFailed = listOfFailed + Core.Utility.formatString(AppMagic.Strings.RestErrorUnableToGetSourcesListAfterFirstItem, failedParameters[i]);
                                var errorMessage = Core.Utility.formatString(AppMagic.Strings.RestErrorUnableToGetSourcesFormat, listOfFailed);
                                return {
                                        success: !1, message: errorMessage
                                    }
                            }
                            var fmt;
                            return formParameters.length === 0 && (fmt = Core.Utility.formatString("--{0}\r\n\r\n\r\n", boundaryValue), formParameters.push(fmt)), fmt = Core.Utility.formatString("--{0}--", boundaryValue), formParameters.push(fmt), {
                                        success: !0, result: formParameters
                                    }
                        })
                }, buildFormData: function(formParameters, parameter, parameterMap, boundaryValue) {
                    var constants = AppMagic.Constants.Services.Rest,
                        paramName = parameter[constants.ParamKey_Name],
                        paramType = parameter[constants.ParamKey_Type];
                    return RESTWorkerController.getValueAsync(parameter, parameterMap).then(function(response) {
                            if (!response.success)
                                return response;
                            var value = response.result;
                            if (typeof value != "undefined") {
                                var fmt = Core.Utility.formatString("--{0}\r\n{1}: {2}; ", boundaryValue, HeaderContentDisposition, HeaderFormDataValue);
                                if (formParameters.push(fmt), paramType === AppMagic.Constants.Services.Rest.XsdType.Base64Binary) {
                                    var mimeType = value.type;
                                    var fileName = this._multipartFormDataHelper.getFileName();
                                    if (mimeType !== "") {
                                        var fileExt = AppMagic.Utility.MimeType.mimeTypeToFileExtension(value.type);
                                        fileExt !== "" && (fileName = fileName + fileExt)
                                    }
                                    fmt = Core.Utility.formatString('{0}="{1}"; {2}="{3}"\r\n\r\n', HeaderNameValue, paramName, HeaderFileName, fileName)
                                }
                                else
                                    value = value.toString(),
                                    fmt = Core.Utility.formatString('{0}="{1}"\r\n\r\n', HeaderNameValue, paramName);
                                formParameters.push(fmt);
                                formParameters.push(value);
                                formParameters.push("\r\n")
                            }
                            return {success: !0}
                        }.bind(this))
                }
        }, {
            createValidationResult: function(success, message) {
                var validationResult = {success: success};
                return typeof message != "undefined" && (validationResult.message = message), validationResult
            }, isValidFieldNameString: function(fieldName) {
                    return typeof fieldName == "string" && ForbiddenFieldNames.indexOf(fieldName) < 0 && !/[\"']/g.test(fieldName)
                }, parseAndValidateConfigXml: function(doc, fileContents, templateVariableValues) {
                    if (typeof fileContents != "string")
                        return {
                                success: !1, errorMessage: {
                                        title: AppMagic.Strings.RestConfigFileParseError, content: AppMagic.Strings.RestConfigFileErrorDetailFileValidation
                                    }
                            };
                    var def,
                        jsonParseFailed = !1,
                        errorMessage = AppMagic.Strings.RestConfigFileErrorDetailUnsupportedFileFormat;
                    try {
                        var configResult = Microsoft.AppMagic.Authoring.Importers.ServiceImporterUtils.parseAndValidateConfig(fileContents, JSON.stringify(templateVariableValues));
                        configResult.success ? def = JSON.parse(configResult.configJSON) : (jsonParseFailed = !0, errorMessage = configResult.message)
                    }
                    catch(e) {
                        jsonParseFailed = !0;
                        var msg = "An unhandled exception was caught while calling Document.ParseAndValidateConfig.";
                        typeof e != "undefined" && typeof e.message != "undefined" && (msg = msg + " " + e.message)
                    }
                    if (jsonParseFailed)
                        return {
                                success: !1, errorMessage: {
                                        title: AppMagic.Strings.RestConfigFileParseError, content: errorMessage
                                    }
                            };
                    var validationResult = AppMagic.Services.Meta.RESTWorkerController.validateDefinition(def);
                    return validationResult.success ? {
                            success: !0, configJSON: configResult.configJSON, def: def
                        } : {
                            success: !1, errorMessage: {
                                    title: AppMagic.Strings.RestConfigFileErrorTitleFileValidation, content: validationResult.message || AppMagic.Strings.RestConfigFileErrorDetailFileValidation
                                }
                        }
                }, getDocTitleOrDefault: function(parentObj, defaultValue, docsDict, preferredLang) {
                    var docTitle = RESTWorkerController._chooseLocaleSpecificDocElement(parentObj, AppMagic.Constants.Services.Rest.DocTitleKey, docsDict, preferredLang);
                    return docTitle === null ? defaultValue : docTitle
                }, _chooseLocaleSpecificDocElement: function(parentObj, keyValue, docsDict, preferredLang) {
                    var currentLanguage = typeof preferredLang != "undefined" ? preferredLang : Microsoft.AppMagic.Common.LocalizationHelper.currentUILanguageName.toLowerCase();
                    var constants = AppMagic.Constants.Services.Rest,
                        docId;
                    if (typeof parentObj[constants.DocIdKey] == "undefined")
                        return null;
                    else
                        docId = parentObj[constants.DocIdKey];
                    return typeof docsDict[currentLanguage] == "object" && typeof docsDict[currentLanguage][docId] == "object" && typeof docsDict[currentLanguage][docId][keyValue] == "string" ? docsDict[currentLanguage][docId][keyValue] : typeof docsDict[constants.DocDefaultLangKey] == "object" && typeof docsDict[constants.DocDefaultLangKey][docId] == "object" && typeof docsDict[constants.DocDefaultLangKey][docId][keyValue] == "string" ? docsDict[constants.DocDefaultLangKey][docId][keyValue] : null
                }, validateDefinition: function(rootDefinition) {
                    return RESTWorkerController.createValidationResult(!0)
                }, buildUrl: function(urlDefinition, parameterMap) {
                    for (var constants = AppMagic.Constants.Services.Rest, replaceRegex = /{([\$\d\w:\-\.]+)}/g, paths = urlDefinition[constants.UrlKey_Paths], replacedPaths = paths.map(function(pathItem) {
                            var path = pathItem[constants.UrlPathsKey_Path];
                            if (path === null || path.length === 0)
                                return "";
                            var templates = pathItem[constants.UrlPathsKey_Templates];
                            if (templates.length === 0)
                                return path;
                            var templatesMap = {};
                            templates.forEach(function(template) {
                                templatesMap[template[constants.UrlPathsTemplatesKey_Name]] = template
                            });
                            var replacer = function(match, parameterName) {
                                    var template = templatesMap[parameterName];
                                    if (typeof template == "undefined")
                                        return match;
                                    var replacement = RESTWorkerController.getValue(template, parameterMap);
                                    return typeof replacement == "undefined" ? match : replacement.toString()
                                };
                            return path.replace(replaceRegex, replacer)
                        }), baseUrl = urlDefinition[constants.UrlKey_Base], lastCharWasForwardSlash = baseUrl.length > 0 && baseUrl.charAt(baseUrl.length - 1) === "/", i = 0, len = replacedPaths.length; i < len; i++)
                        replacedPaths[i].length !== 0 && (lastCharWasForwardSlash || (replacedPaths[i] = "/" + replacedPaths[i]), lastCharWasForwardSlash = replacedPaths[i].charAt(replacedPaths[i].length - 1) === "/");
                    return replacedPaths.unshift(baseUrl), replacedPaths.join("")
                }, getValueAsync: function(param, parameterMap) {
                    var constants = AppMagic.Constants.Services.Rest;
                    var valueExpressionDef = param[constants.ParamKey_ValueExpression],
                        xsdType = param[constants.ParamKey_Type];
                    var value;
                    switch (valueExpressionDef[constants.DefinitionTypeKey]) {
                        case constants.DefinitionType_Literal:
                            value = valueExpressionDef[constants.LiteralValueKey];
                            break;
                        case constants.DefinitionType_ParameterReference:
                            var parameterName = valueExpressionDef[constants.ParameterNameKey];
                            if (typeof parameterMap[parameterName] == "undefined")
                                break;
                            var paramInfo = parameterMap[parameterName],
                                paramValue = paramInfo[constants.ParamKey_Value],
                                dtype = paramInfo[ParameterMapItemKeyDType];
                            if (dtype === AppMagic.Schema.TypeImage || dtype === AppMagic.Schema.TypeMedia)
                                return paramValue === "" ? WinJS.Promise.wrap({
                                        success: !1, detail: paramValue
                                    }) : RESTWorkerController.getBinaryDataAsync(paramValue).then(function(response) {
                                        return {
                                                success: !0, result: response
                                            }
                                    }, function(error) {
                                        return {
                                                success: !1, detail: paramValue
                                            }
                                    });
                            else
                                value = RESTWorkerController.getParamData(paramValue, dtype, xsdType);
                            break;
                        default:
                            break
                    }
                    return WinJS.Promise.wrap({
                            success: !0, result: value
                        })
                }, getBinaryDataAsync: function(url) {
                    return AppMagic.Utility.mediaUrlHelper(null, url, !1).then(function(blobUrl) {
                            return WinJS.xhr({
                                    url: blobUrl, responseType: "blob"
                                })
                        }).then(function(response) {
                            return response.response
                        })
                }, getBinaryDataAsyncWithHeader: function(url, headers) {
                    return WinJS.xhr({
                            url: url, headers: headers, responseType: "blob"
                        }).then(function(response) {
                            return response.response
                        }, function(error){})
                }, getValue: function(param, parameterMap) {
                    var constants = AppMagic.Constants.Services.Rest;
                    var paramType;
                    if (typeof param.type == "string")
                        paramType = param.type;
                    else {
                        Contracts.checkObject(param.type);
                        var typeDef = param.type;
                        if (typeof typeDef.xsdtype == "string")
                            paramType = typeDef.xsdtype;
                        else {
                            var IRConstants = AppMagic.Services.ServiceConfigDeserialization.IRConstants;
                            switch (typeDef.primitive) {
                                case IRConstants.JsonPrimitives.Boolean:
                                    paramType = AppMagic.Services.TypeSystem.XsdUtility.XsdTypeNames.Boolean;
                                    break;
                                case IRConstants.JsonPrimitives.Number:
                                    paramType = AppMagic.Services.TypeSystem.XsdUtility.XsdTypeNames.Decimal;
                                    break;
                                case IRConstants.JsonPrimitives.String:
                                    if (typeof typeDef.dtype != "string")
                                        paramType = AppMagic.Services.TypeSystem.XsdUtility.XsdTypeNames.String;
                                    else
                                        switch (typeDef.dtype) {
                                            case AppMagic.Schema.TypeString:
                                                paramType = AppMagic.Services.TypeSystem.XsdUtility.XsdTypeNames.String;
                                                break;
                                            case AppMagic.Schema.TypeHyperlink:
                                            case AppMagic.Schema.TypeImage:
                                            case AppMagic.Schema.TypeMedia:
                                                paramType = AppMagic.Services.TypeSystem.XsdUtility.XsdTypeNames.AnyURI;
                                                break;
                                            default:
                                                break
                                        }
                                    break;
                                default:
                                    break
                            }
                        }
                    }
                    var valueExpressionDef = param.valueexpression;
                    var value;
                    switch (valueExpressionDef[constants.DefinitionTypeKey]) {
                        case constants.DefinitionType_Literal:
                            value = valueExpressionDef[constants.LiteralValueKey];
                            break;
                        case constants.DefinitionType_ParameterReference:
                            var parameterName = valueExpressionDef[constants.ParameterNameKey];
                            if (typeof parameterMap[parameterName] == "undefined")
                                break;
                            var paramInfo = parameterMap[parameterName],
                                paramValue = paramInfo[constants.ParamKey_Value],
                                dtype = paramInfo[ParameterMapItemKeyDType];
                            value = RESTWorkerController.getParamData(paramValue, dtype, paramType);
                            break;
                        default:
                            break
                    }
                    if (typeof value != "undefined" && paramType === constants.XsdType.String) {
                        if (typeof param.charstoescape != "undefined") {
                            var escapableRegexCharsRegex = /[.\\+*?\[\^\]$(){}=!<>|:\-]/,
                                charsToEscapeRegexString = param[constants.ParamKey_CharsToEscape].split("").map(function(charToEscape) {
                                    return charToEscape.replace(escapableRegexCharsRegex, "\\$&")
                                });
                            charsToEscapeRegexString = "(" + charsToEscapeRegexString.join("|") + ")";
                            value = value.replace(new RegExp(charsToEscapeRegexString, "g"), function(charToEscape) {
                                return param[constants.ParamKey_EscapeChar] + charToEscape
                            })
                        }
                        typeof param[constants.ParamKey_Format] != "undefined" && (value = Core.Utility.formatString(param[constants.ParamKey_Format], value))
                    }
                    return value
                }, getParamData: function(value, dtype, xsdType) {
                    var constants = AppMagic.Constants.Services.Rest,
                        retVal;
                    switch (dtype + "->" + xsdType) {
                        case AppMagic.Schema.TypeString + "->" + constants.XsdType.String:
                            retVal = value;
                            break;
                        case AppMagic.Schema.TypeNumber + "->" + constants.XsdType.Int:
                        case AppMagic.Schema.TypeNumber + "->" + constants.XsdType.Long:
                        case AppMagic.Schema.TypeNumber + "->" + constants.XsdType.UnsignedInt:
                        case AppMagic.Schema.TypeNumber + "->" + constants.XsdType.UnsignedLong:
                        case AppMagic.Schema.TypeNumber + "->" + constants.XsdType.Decimal:
                        case AppMagic.Schema.TypeNumber + "->" + constants.XsdType.Float:
                        case AppMagic.Schema.TypeNumber + "->" + constants.XsdType.Double:
                            retVal = value;
                            break;
                        case AppMagic.Schema.TypeBoolean + "->" + constants.XsdType.Boolean:
                            retVal = value;
                            break;
                        default:
                            break
                    }
                    return retVal
                }, buildListedKeyValueMap: function(map, listing, parameterMap, uncapitalizeKeys) {
                    listing.forEach(function(itemDefinition) {
                        var value = RESTWorkerController.getValue(itemDefinition, parameterMap);
                        if (typeof value != "undefined") {
                            var key = uncapitalizeKeys ? itemDefinition.key.toLowerCase() : itemDefinition.key;
                            map[key] = value
                        }
                    })
                }, buildRequestBodyXWwwFormUrlEncoded: function(bodyDef, parameterMap) {
                    for (var constants = AppMagic.Constants.Services.Rest, formParameters = [], len = bodyDef[constants.RequestBodyXWwwFormUrlEncodedKey_Params].length, i = 0; i < len; i++) {
                        var parameter = bodyDef[constants.RequestBodyXWwwFormUrlEncodedKey_Params][i];
                        var key = parameter.name,
                            value = RESTWorkerController.getValue(parameter, parameterMap);
                        typeof value != "undefined" && formParameters.push(encodeURIComponent(key) + "=" + encodeURIComponent(value))
                    }
                    return [formParameters.join("&")]
                }, buildRequestBodyJson: function(bodyDef, parameterMap) {
                    for (var constants = AppMagic.Constants.Services.Rest, params = bodyDef[constants.RequestBodyJsonKey_Params], bodyContainer = {}, j, jlen, i = 0, len = params.length; i < len; i++) {
                        var param = params[i];
                        var jsonPointer = AppMagic.Utility.parseJsonPointer(param.jsonpointer);
                        var value = RESTWorkerController.getValue(param, parameterMap);
                        if (typeof value != "undefined")
                            if (jsonPointer.length === 0)
                                bodyContainer.requestBody = value;
                            else {
                                var requestBody = bodyContainer.requestBody || {},
                                    context = requestBody;
                                for (j = 0, jlen = jsonPointer.length - 1; j < jlen; j++) {
                                    var keyOrIndex = jsonPointer[j];
                                    typeof context[keyOrIndex] == "undefined" && (context[keyOrIndex] = {});
                                    context = context[keyOrIndex]
                                }
                                context[jsonPointer[jsonPointer.length - 1]] = value;
                                bodyContainer.requestBody = requestBody
                            }
                    }
                    return [JSON.stringify(bodyContainer.requestBody)]
                }, computeJsonResponseSchema: function(typeDef, typesByPrefixAndName, maxRepeat, occurrenceTable) {
                    var IRConstants = AppMagic.Services.ServiceConfigDeserialization.IRConstants;
                    switch (typeDef[AppMagic.Constants.Services.Rest.TypeDefinitionKey_DefType]) {
                        case IRConstants.DefTypes.JsonArray:
                            return RESTWorkerController.computeJsonResponseSchema_JsonArray(typeDef, typesByPrefixAndName, maxRepeat, occurrenceTable);
                        case IRConstants.DefTypes.JsonMapObject:
                            return RESTWorkerController.computeJsonResponseSchema_JsonMapObject(typeDef, typesByPrefixAndName, maxRepeat, occurrenceTable);
                        case IRConstants.DefTypes.JsonObject:
                            return RESTWorkerController.computeJsonResponseSchema_JsonObject(typeDef, typesByPrefixAndName, maxRepeat, occurrenceTable);
                        case IRConstants.DefTypes.JsonBase64Binary:
                            return RESTWorkerController.computeJsonResponseSchema_JsonBase64Binary(typeDef);
                        case IRConstants.DefTypes.JsonPrimitive:
                            return RESTWorkerController.computeJsonResponseSchema_JsonPrimitive(typeDef);
                        default:
                            break
                    }
                    return null
                }, addPropertyToSchemaIfNotExceededMaxRepeat: function(schemaPtr, propertyDef, propertyName, typesByPrefixAndName, maxRepeat, occurrenceTable) {
                    var constants = AppMagic.Constants.Services.Rest,
                        schemaItem;
                    if (typeof propertyDef[constants.DefinitionPropertyKey_Type] != "undefined")
                        schemaItem = RESTWorkerController.computeJsonResponseSchema(propertyDef[constants.DefinitionPropertyKey_Type], typesByPrefixAndName, maxRepeat, occurrenceTable),
                        schemaItem[AppMagic.Schema.KeyName] = propertyName,
                        schemaPtr.push(schemaItem);
                    else {
                        var typeRef = propertyDef[constants.DefinitionPropertyKey_TypeRef];
                        var prefix = typeRef[constants.DefinitionPropertyTypeRefKey_Prefix],
                            typeName = typeRef[constants.DefinitionPropertyTypeRefKey_Name],
                            tryGetResult = occurrenceTable.tryGetValue(prefix, typeName),
                            occurrenceCount = tryGetResult.value ? tryGetResult.outValue : 0;
                        if (occurrenceCount <= maxRepeat) {
                            occurrenceTable.setValue(prefix, typeName, occurrenceCount + 1);
                            var recurseTarget = typesByPrefixAndName.getType(prefix, typeName);
                            schemaItem = RESTWorkerController.computeJsonResponseSchema(recurseTarget, typesByPrefixAndName, maxRepeat, occurrenceTable);
                            schemaItem[AppMagic.Schema.KeyName] = propertyName;
                            occurrenceTable.setValue(prefix, typeName, occurrenceCount);
                            schemaPtr.push(schemaItem)
                        }
                    }
                }, computeJsonResponseSchema_JsonPrimitive: function(typeDef) {
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
                    return AppMagic.Schema.createSchemaForSimple(dtype)
                }, computeJsonResponseSchema_JsonBase64Binary: function(typeDef) {
                    switch (typeDef.mediatype) {
                        case AppMagic.Services.Constants.MediaType.Image:
                            return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeImage);
                        default:
                            return
                    }
                }, computeJsonResponseSchema_JsonArray: function(typeDef, typesByPrefixAndName, maxRepeat, occurrenceTable) {
                    var constants = AppMagic.Constants.Services.Rest,
                        itemsDef = typeDef[constants.JsonArrayDefinitionKey_Items],
                        schemaName = "Value",
                        ptr = [];
                    return RESTWorkerController.addPropertyToSchemaIfNotExceededMaxRepeat(ptr, itemsDef, schemaName, typesByPrefixAndName, maxRepeat, occurrenceTable), ptr.length === 1 && AppMagic.Schema.isSchemaOfType(ptr[0], AppMagic.Schema.TypeObject) ? AppMagic.Schema.createSchemaForArrayFromPointer(ptr[0][AppMagic.Schema.KeyPtr]) : AppMagic.Schema.createSchemaForArrayFromPointer(ptr)
                }, computeJsonResponseSchema_JsonMapObject: function(typeDef, typesByPrefixAndName, maxRepeat, occurrenceTable) {
                    var constants = AppMagic.Constants.Services.Rest,
                        keyName = typeDef[constants.JsonMapObjectDefinitionKey_Keys][constants.JsonMapObjectDefinitionKeysKey_FieldName],
                        valuesDef = typeDef[constants.JsonMapObjectDefinitionKey_Values],
                        valName = valuesDef[constants.JsonMapObjectDefinitionValuesKey_FieldName],
                        ptr = [];
                    return ptr.push(AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeString, keyName)), RESTWorkerController.addPropertyToSchemaIfNotExceededMaxRepeat(ptr, valuesDef, valName, typesByPrefixAndName, maxRepeat, occurrenceTable), AppMagic.Schema.createSchemaForArrayFromPointer(ptr)
                }, computeJsonResponseSchema_JsonObject: function(typeDef, typesByPrefixAndName, maxRepeat, occurrenceTable) {
                    var constants = AppMagic.Constants.Services.Rest,
                        displayIdx = constants.JsonObjectPropertyKey_DisplayIdx,
                        propertiesDef = typeDef[constants.JsonObjectDefinitionKey_Properties],
                        propertyNames = Object.keys(propertiesDef).sort(function(lhsPropertyName, rhsPropertyName) {
                            var lhs = propertiesDef[lhsPropertyName][displayIdx],
                                rhs = propertiesDef[rhsPropertyName][displayIdx];
                            return lhs - rhs
                        }),
                        ptr = [];
                    return propertyNames.forEach(function(propertyName) {
                            var schemaItem,
                                propertyDef = propertiesDef[propertyName];
                            RESTWorkerController.addPropertyToSchemaIfNotExceededMaxRepeat(ptr, propertyDef, propertyName, typesByPrefixAndName, maxRepeat, occurrenceTable)
                        }), AppMagic.Schema.createSchemaForObjectFromPointer(ptr)
                }, computeResponseSchema: function(responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        resultForm = responseDef[constants.ResponseKey_ResultForm];
                    switch (resultForm) {
                        case constants.ResultForm.Void:
                            return RESTWorkerController.computeResponseSchemaForResultForm_Void(responseDef);
                        case constants.ResultForm.Self:
                            return RESTWorkerController.computeResponseSchemaForResultForm_Self(responseDef, typesByPrefixAndName);
                        case constants.ResultForm.Single:
                            return RESTWorkerController.computeResponseSchemaForResultForm_Single(responseDef, typesByPrefixAndName);
                        case constants.ResultForm.Aggregate:
                            return RESTWorkerController.computeResponseSchemaForResultForm_Aggregate(responseDef, typesByPrefixAndName);
                        default:
                            return null
                    }
                }, computeResponseSchemaForResultForm_Void: function() {
                    return AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeBoolean)
                }, computeResponseSchemaForResultForm_Self: function(responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        mediaType = responseDef[constants.ResponseKey_Body][constants.ResponseBodyKey_MediaType];
                    var schema,
                        bodyDef;
                    switch (mediaType) {
                        case constants.MediaType.Image:
                            schema = AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeImage);
                            break;
                        case constants.MediaType.Audio:
                            schema = AppMagic.Schema.createSchemaForSimple(AppMagic.Schema.TypeMedia);
                            break;
                        case constants.MediaType.Json:
                            bodyDef = responseDef[constants.ResponseKey_Body];
                            schema = RESTWorkerController.computeResponseSchemaForJsonDefinition(bodyDef, typesByPrefixAndName);
                            break;
                        case constants.MediaType.Xml:
                            bodyDef = responseDef[constants.ResponseKey_Body];
                            var typeDef = typesByPrefixAndName.getTypeDefinition(bodyDef),
                                sampleXml = typeDef[constants.SampleXmlElementDefinitionKey_SampleXml];
                            var sampleXmlJsonified = AppMagic.Services.xml2json(sampleXml),
                                schemaDictionary = AppMagic.Utility.createInferredSchemaFromObject(sampleXmlJsonified);
                            AppMagic.Services.Results.correctSchemaDictionaryAndCreateNameRemapping(schemaDictionary);
                            var propertiesSchema = AppMagic.Utility.flattenSchema(schemaDictionary);
                            schema = AppMagic.Schema.createSchemaForObjectFromPointer(propertiesSchema);
                            break;
                        default:
                            break
                    }
                    return schema
                }, computeResponseSchemaForResultForm_Single: function(responseDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        bodyDef = responseDef[constants.ResponseKey_Body];
                    var mediaType = bodyDef[constants.ResponseBodyKey_MediaType];
                    var paramDef = bodyDef[constants.SingleBodyKey_Param];
                    var schema;
                    switch (mediaType) {
                        case constants.MediaType.Json:
                            schema = RESTWorkerController.computeResponseSchemaForJsonDefinition(paramDef, typesByPrefixAndName);
                            break;
                        case constants.MediaType.Xml:
                            schema = RESTWorkerController.computeResponseSchemaForXmlDefinition(paramDef, typesByPrefixAndName);
                            break;
                        default:
                            break
                    }
                    return schema
                }, computeResponseSchemaForXmlDefinition: function(xmlDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        typeDef = typesByPrefixAndName.getTypeDefinition(xmlDef),
                        dtype = typeDef[constants.XmlSimpleTypeDefinitionKey_DType],
                        schema;
                    if (xmlDef[constants.XmlParamKey_SelectAllNodes]) {
                        var schemaPointer = [AppMagic.Schema.createSchemaForSimple(dtype, "Value")];
                        schema = AppMagic.Schema.createSchemaForArrayFromPointer(schemaPointer)
                    }
                    else
                        schema = AppMagic.Schema.createSchemaForSimple(dtype);
                    return schema
                }, computeResponseSchemaForJsonDefinition: function(jsonDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        occurrenceTable = new Collections.Generic.TwoKeyDictionary;
                    if (typeof jsonDef[constants.DefinitionPropertyKey_TypeRef] != "undefined") {
                        var prefix = jsonDef[constants.DefinitionPropertyKey_TypeRef][constants.DefinitionPropertyTypeRefKey_Prefix],
                            typeName = jsonDef[constants.DefinitionPropertyKey_TypeRef][constants.DefinitionPropertyTypeRefKey_Name];
                        occurrenceTable.setValue(prefix, typeName, 1)
                    }
                    var typeDef = typesByPrefixAndName.getTypeDefinition(jsonDef);
                    return RESTWorkerController.computeJsonResponseSchema(typeDef, typesByPrefixAndName, RESTWorkerController.MaxTypeInlineDepth, occurrenceTable)
                }, computeResponseSchemaForResultForm_Aggregate: function(responseDef, typesByPrefixAndName) {
                    for (var constants = AppMagic.Constants.Services.Rest, bodyDef = responseDef[constants.ResponseKey_Body], mediaType = bodyDef[constants.ResponseBodyKey_MediaType], displayIdx = constants.AggregateBodyParamKey_DisplayIdx, paramsDef = bodyDef[constants.AggregateBodyKey_Params], paramKeys = Object.keys(paramsDef).sort(function(lhs, rhs) {
                            var l = paramsDef[lhs][displayIdx],
                                r = paramsDef[rhs][displayIdx];
                            return l - r
                        }), schema, ptr = [], i = 0, len = paramKeys.length; i < len; i++) {
                        var paramDef = paramsDef[paramKeys[i]];
                        switch (mediaType) {
                            case constants.MediaType.Json:
                                schema = RESTWorkerController.computeResponseSchemaForJsonDefinition(paramDef, typesByPrefixAndName);
                                break;
                            case constants.MediaType.Xml:
                                schema = RESTWorkerController.computeResponseSchemaForXmlDefinition(paramDef, typesByPrefixAndName);
                                break;
                            default:
                                break
                        }
                        schema[AppMagic.Schema.KeyName] = paramKeys[i];
                        ptr.push(schema)
                    }
                    return AppMagic.Schema.createSchemaForObjectFromPointer(ptr)
                }, postWorkerProcess: function(functionDef, response, typesByPrefixAndName) {
                    var workerResult = response.result;
                    if (!workerResult.success)
                        return workerResult;
                    var constants = AppMagic.Constants.Services.Rest,
                        responseDef = functionDef[constants.FunctionKey_Response],
                        responseBody = responseDef[constants.ResponseKey_Body];
                    if (typeof responseBody != "undefined") {
                        var mediaType = responseBody[constants.MediaTypeKey],
                            resultForm = responseDef[constants.ResponseKey_ResultForm];
                        if (mediaType === constants.MediaType.Image || mediaType === constants.MediaType.Audio) {
                            var blobUri = AppMagic.Utility.blobManager.addBlob(new Blob([workerResult.result.data], {type: workerResult.result.contentType}));
                            workerResult.result = blobUri
                        }
                        else if (mediaType === constants.MediaType.Xml)
                            if (resultForm === constants.ResultForm.Single)
                                return RESTWorkerController.parseSingleXml(workerResult, responseDef, typesByPrefixAndName);
                            else if (resultForm === constants.ResultForm.Aggregate)
                                return RESTWorkerController.parseAggregateXml(workerResult, responseDef, typesByPrefixAndName)
                    }
                    return workerResult
                }, parseSingleXml: function(response, responseDef, typesByPrefixAndName) {
                    var parseDomResult = RESTWorkerController.parseResponseXmlUsingDom(response.result);
                    if (!parseDomResult.success)
                        return parseDomResult;
                    var xmlDom = parseDomResult.xmlDom,
                        constants = AppMagic.Constants.Services.Rest,
                        paramDef = responseDef[constants.ResponseKey_Body][constants.SingleBodyKey_Param],
                        parsedXmlValue = RESTWorkerController.parseXmlParamDef(xmlDom, paramDef, typesByPrefixAndName);
                    return {
                            success: !0, result: parsedXmlValue
                        }
                }, parseAggregateXml: function(response, responseDef, typesByPrefixAndName) {
                    var parseDomResult = RESTWorkerController.parseResponseXmlUsingDom(response.result);
                    if (!parseDomResult.success)
                        return parseDomResult;
                    var xmlDom = parseDomResult.xmlDom,
                        aggregateObject = {},
                        constants = AppMagic.Constants.Services.Rest,
                        paramsDef = responseDef[constants.ResponseKey_Body][constants.AggregateBodyKey_Params],
                        paramKeys = Object.keys(paramsDef);
                    return paramKeys.forEach(function(paramKey) {
                            var parsedXmlValue = RESTWorkerController.parseXmlParamDef(xmlDom, paramsDef[paramKey], typesByPrefixAndName);
                            aggregateObject[paramKey] = parsedXmlValue
                        }), {
                            success: !0, result: aggregateObject
                        }
                }, parseResponseXmlUsingDom: function(responseXml) {
                    var domParser = new DOMParser;
                    try {
                        var xmlDom = domParser.parseFromString(responseXml, "text/xml")
                    }
                    catch(e) {
                        return {
                                success: !1, message: AppMagic.Strings.RestErrorUnableToParseXml
                            }
                    }
                    return {
                            success: !0, xmlDom: xmlDom
                        }
                }, parseXmlParamDef: function(xmlDom, paramDef, typesByPrefixAndName) {
                    var constants = AppMagic.Constants.Services.Rest,
                        selectAllNodes = paramDef[constants.XmlParamKey_SelectAllNodes];
                    var xPath = paramDef[constants.XmlBodyParamKey_XPath];
                    var nodes = AppMagic.Utility.XmlSelection.selectNodes(xmlDom, xPath);
                    var typeDef = typesByPrefixAndName.getTypeDefinition(paramDef);
                    if (selectAllNodes)
                        return nodes.map(function(n) {
                                return {Value: RESTWorkerController.fitXmlValueToType_SimpleType(n.textContent, typeDef)}
                            });
                    else {
                        if (nodes.length === 0)
                            return null;
                        var node = nodes[0];
                        return RESTWorkerController.fitXmlValueToType_SimpleType(node.textContent, typeDef)
                    }
                }, fitXmlValueToType_SimpleType: function(xmlValue, typeDef) {
                    var constants = AppMagic.Constants.Services.Rest;
                    var converted = null;
                    switch (typeDef[constants.XmlSimpleTypeDefinitionKey_DType]) {
                        case AppMagic.Schema.TypeString:
                            converted = xmlValue;
                            break;
                        case AppMagic.Schema.TypeNumber:
                            try {
                                converted = parseFloat(xmlValue)
                            }
                            catch(e) {}
                            break;
                        case AppMagic.Schema.TypeBoolean:
                            converted = RESTWorkerController.fitXmlValueToType_Boolean(xmlValue);
                            break;
                        default:
                            break
                    }
                    return converted
                }, fitXmlValueToType_Boolean: function(xmlValue) {
                    switch (xmlValue.toLowerCase()) {
                        case"0":
                        case"false":
                            return !1;
                        case"1":
                        case"true":
                            return !0;
                        default:
                            return null
                    }
                    return null
                }, MaxTypeInlineDepth: 5, MaxSchemaDepth: 5
        });
    WinJS.Namespace.define("AppMagic.Services.Meta", {RESTWorkerController: RESTWorkerController})
})(Windows);